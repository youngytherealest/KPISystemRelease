var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

function empty_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}

function getTokenFromCookie(name) {
  let cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function loadDSSV(kyThucTap, nhomThucTap, username) {
  // Load danh sach sinh vien by nhomid
  $.ajax({
    type: `GET`,
    url: `get_dssv_by_kttid_nhomid_username?kythuctap_id=${kyThucTap}&nhomhuongdan_id=${nhomThucTap}&username=${username}`,
    success: function (res) {
      $.each(res, function (idx, val) {
        $("#filter_sinhvien").append(`
          <option value="${val["id"]}">[${val["mssv"]}] ${val["hoten"]}</option>
        `);
      });
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Đã xảy ra lỗi, vui lòng liên hệ quản trị viên",
      });
    },
  });
}

function loadNhomThucTap(kyThucTap) {
  // Load danh sach nhom thuc tap by kythuctap_id
  $.ajax({
    type: `GET`,
    url: `get_danh_sach_nhom_theo_ky_id?id=${kyThucTap}`,
    success: function (res) {
      $.each(res, function (idx, val) {
        $("#filter_nhomthuctap").append(`
          <option value="${val["id"]}">${val["tennhom"]}</option>
        `);
      });
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Đã xảy ra lỗi, vui lòng liên hệ quản trị viên",
      });
    },
  });
}

function loadKyThucTap() {
  // Load ky thuc tap
  $.ajax({
    type: `GET`,
    url: `get_ky_thuc_tap_by_username`,
    success: function (res) {
      $.each(res, function (idx, val) {
        if (val['thoihan'] !== 1) {
          $("#filter_kythuctap").append(`
            <option value="${val["id"]}">${val["ngaybatdau"]} - ${val["ngayketthuc"]}</option>
          `);
        }
      });
      $("#filter_kythuctap").change();
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Đã xảy ra lỗi, vui lòng liên hệ quản trị viên",
      });
    },
  });
}

$(document).ready(function () {
  $(".select2").select2({
    theme: "bootstrap",
  });
  let username = getTokenFromCookie("username");

  loadKyThucTap();
  // Su kien thay doi kythuctap
  $("#filter_kythuctap").on("change", function () {
    $("#filter_nhomthuctap").empty();
    loadNhomThucTap($("#filter_kythuctap").val());
    $("#filter_sinhvien").empty();
    loadDSSV($("#filter_kythuctap").val(), "-1", username);
  });
  // Su kien thay doi nhomthuctap
  $("#filter_nhomthuctap").on("change", function () {
    $("#filter_sinhvien").empty();
    loadDSSV(
      $("#filter_kythuctap").val(),
      $("#filter_nhomthuctap").val(),
      username
    );
  });

  // Bắt sự kiện chọn sinh viên
  $("#filter_sinhvien").on("change", function () {
    let sinhvienid = $(this).val();
    loadDSCongViec(sinhvienid);
  });

  // Bắt sự kiện click nút xem
  $("#viewBtn").on('click', function () {
    let sinhvienid = $("#filter_sinhvien").val();
    loadDSCongViec(sinhvienid);
  });

  function loadDSCongViec(sinhvienid) {
    // Destroy first
    if ($.fn.DataTable.isDataTable("#bang_dscongviec")) {
      $("#bang_dscongviec").DataTable().destroy();
    }
    // Create after
    let dscongviec = $("#bang_dscongviec").DataTable({
      paging: false,
      retrieve: true,
      lengthChange: false,
      searching: true,
      ordering: true,
      info: true,
      autoWidth: false,
      responsive: true,
      ajax: {
        type: "GET",
        url: `get_ds_chi_tiet_cong_viec_by_idsinhvien?sinhvienid=${sinhvienid}`,
        dataSrc: "",
      },
      columns: [
        {
          data: null,
          render: function (data, type, row, meta) {
            // Use meta.row to get the current row index, and add 1 to start from 1
            return "<center>" + (meta.row + 1) + "</center>";
          },
        },
        { data: "ngaybatdau" },
        { data: "ngayketthuc" },
        { data: "tencongviec" },
        { data: "mota" },
        { data: "ghichu" },
        {
          data: "trangthai",
          render: function (data, type, row) {
            if (data == 0) {
              return '<center><span class="badge badge-warning">Đang thực hiện</span></center>';
            } else if (data == 1) {
              return '<center><span class="badge badge-success">Hoàn thành</span></center>';
            } else {
              return '<center><span class="badge badge-danger">Trễ hạn</span></center>';
            }
          },
        },
        {
          data: "id",
          render: function (data, type, row) {
            if (row.xacnhan !== 1 && row.trangthai === 1) {
              return `<center>
                  <a class="btn btn-success btn-sm" data-id="${data}" id="confirmBtn">
                    <i class="fa-solid fa-check"></i>
                  </a>
                </center>`;
            } else {
              return "";
            }
          },
        },
      ],
      createdRow: function (row, data, dataIndex) {
        if (data.xacnhan == 1) {
          $(row).addClass("xacnhan");
        }
      },
    });
    // Bắt sự kiện xác nhận trạng thái chi tiết công việc
    $("#bang_dscongviec").on("click", "#confirmBtn", function () {
      Swal.fire({
        title: `Xác nhận công việc đã hoàn thành?`,
        icon: `question`,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
      }).then((result) => {
        if (result.isConfirmed) {
          let id = $(this).data("id");

          $.ajax({
            type: `POST`,
            url: `update_xac_nhan_trang_thai_cong_viec?idcongviec=${id}`,
            success: function () {
              Toast.fire({
                icon: "success",
                title: "Đã xác nhận trạng thái",
              });
              dscongviec.ajax.reload();
            },
            error: function () {
              Toast.fire({
                icon: "error",
                title: "Xác nhận trạng thái thất bại",
              });
            },
          });
        }
      });
    });
  }
});

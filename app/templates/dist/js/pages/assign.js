var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// Clear modal
function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}

$(document).ready(function () {
  // Select2
  $(".select2").select2({
    theme: "bootstrap",
  });

  let c = document.cookie.split(";");
  let username = "";
  c.forEach(function (val) {
    if (val.includes("username=")) {
      username = val.split("username=")[1];
    }
  });

  // Get danh sách các nhóm
  let filter_chonnhom = $("#filter_chonnhom");
  $.ajax({
    type: "GET",
    url: `/get_ds_nhom_thuc_tap_by_username?username=${username}`,
    success: function (res) {
      $.each(res, function (idx, val) {
        filter_chonnhom.append(
          '<option value="' + val.id + '">' + val.tennhom + "</option>"
        );
      });
    },
  });

  // Bắt sự kiện khi chọn nhóm thực tập
  filter_chonnhom.on("change", function () {
    let nhomid = filter_chonnhom.val();

    load_timeline_congviec(nhomid);
    $("#bangdscongviec").empty();
  });

  function load_timeline_congviec(id) {
    let timeline = $("#dscongviec");
    // Get danh sách công việc bằng ID nhóm
    $.ajax({
      type: "GET",
      url: "/get_ds_cong_viec_by_id_nhom?id=" + id,
      success: function (data) {
        let timeline_html = "";
        let count = 1;

        timeline.empty();

        $.each(data, function (idx, val) {
          let bg_color = "";
          let header_color = "";
          let btn_color = "";
          if (moment(val.ngayketthuc, "DD/MM/YYYY").isBefore(moment())) {
            header_color = "bg-danger";
            bg_color = "#ef99a1";
            btn_color = "btn-danger";
          } else {
            header_color = "bg-success";
            bg_color = "#a9f5bb";
            btn_color = "btn-success";
          }
          timeline_html += `<div class="time-label">
                              <span class="bg-info" id="thutu">Công việc #${count}</span>
                            </div>
                            <div>
                              <i class="fas fa-arrow-right bg-primary"></i>
                              <div class="timeline-item">
                                <h3 class="timeline-header ${header_color} row">
                                  <b id="ngay" class="col-lg-10">${val.ngaybatdau} <i class="fa-solid fa-arrow-right"></i> ${val.ngayketthuc}</b>
                                  <div class="btn-group dropleft col-lg-2">
                                    <button type="button" class="btn btn-sm ${btn_color} dropdown-toggle ms-auto" data-toggle="dropdown" aria-expanded="false">
                                      <i class="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                      <a class="dropdown-item" id="themchitiet" onclick="createModal_ChiTietCongViec(${val.id}, ${id});">Thêm chi tiết công việc</a>
                                      <a class="dropdown-item" id="xoacongviec" onclick="xoaCongViecByID(${val.id})">Xóa</a>
                                    </div>
                                  </div>
                                </h3>
                              <div class="timeline-body" id="congviec" style="background-color:${bg_color} !important; cursor: pointer;" onclick="load_ChiTietCongViec(${val.id})">
                                <strong>${val.ten}</strong> 
                                <p>${val.mota}</p>
                              </div>
                              </div>
                            </div>`;
          count++;
        });
        timeline.append(timeline_html);
      },
    });
  }

  // Modal thêm Công việc
  $("#themconviecviec_btn").click(function () {
    // Clear modal
    clear_modal();
    $("#modal_title").text("Thêm công việc");
    html = `<div class="form-group">\
              <label>Thời gian:</label> \
              <div class="input-group"> \
                <div class="input-group-prepend">\
                  <span class="input-group-text">\
                    <i class="far fa-calendar-alt"></i>\
                  </span> \
                </div>\
                <input type="text" class="form-control float-right" id="thoigian"> \
              </div> \
            </div> \
            <div class="form-group">\
              <label>Tên công việc:</label> \
              <div class="input-group"> \
                <input class="form-control" id="tencongviec" type="text"/> \
              </div> 
            </div>
            <div class="form-group">
              <label>Mô tả:</label> 
              <div class="input-group"> 
                <textarea class="form-control" id="mota" rows="5"></textarea> 
              </div> 
            </div>`;
    $("#modal_body").append(html);
    $("#modal_footer").append(
      '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $("#thoigian").daterangepicker({
      opens: "right",
      alwaysShowCalendars: true,
      drops: "auto",
      ranges: {
        "Hôm nay": [moment(), moment()],
        "7 Ngày sau": [moment(), moment().add(6, "days")],
        "7 Ngày trước": [moment().subtract(6, "days"), moment()],
        "3 Ngày sau": [moment().add(29, "days"), moment()],
        "30 ngày trước": [moment(), moment().add(29, "days")],
      },
      locale: {
        format: "DD/MM/YYYY",
        separator: " - ",
        applyLabel: "Chọn",
        cancelLabel: "Hủy",
        fromLabel: "Từ ngày",
        toLabel: "Đến ngày",
        customRangeLabel: "Custom",
        weekLabel: "W",
        daysOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        monthNames: [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ],
        firstDay: 1,
      },
    });

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {
      let thoigian = $("#thoigian").val().split(" - ");
      let thoigian_bd = thoigian[0];
      let thoigian_kt = thoigian[1];
      let tencongviec = $("#tencongviec").val();
      let mota = $("#mota")
        .val()
        .replace(/[\r\n]+/g, "<br>");
      let nhomid = $("#filter_chonnhom").val();

      $.ajax({
        type: "POST",
        url:
          "them_cong_viec_nhom?id=" +
          nhomid +
          "&ngaybatdau=" +
          thoigian_bd +
          "&ngayketthuc=" +
          thoigian_kt +
          "&ten=" +
          tencongviec +
          "&mota=" +
          mota,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: "Đã thêm công việc",
            });
            load_timeline_congviec(nhomid);
          } else {
            Toast.fire({
              icon: "error",
              title: "Thêm công việc không thành công",
            });
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Thêm công việc không thành công",
          });
        },
      });
      $("#modal_id").modal("hide");
    });
  });
});

function createModal_ChiTietCongViec(id_congviec, id_nhom) {
  clear_modal();
  $("#modal_title").text(`Thêm chi tiết công việc ${id_congviec}`);
  let body = `
  <div class="form-group">
    <label for="modal_sinhvien_select">Sinh viên thực hiện</label>
    <div class="input-group">
      <select id="modal_sinhvien_select" class="form-control select2" style="width: 300px !important;" name="sinhvien[]" multiple="multiple"></select>
    </div>
  </div>
  <div class="form-group">
    <label>Ghi chú</label> 
    <div class="input-group"> 
      <textarea class="form-control" id="modal_ghichu_text" rows="5"></textarea> 
    </div> 
  </div>
  <script>
  $(document).ready(function() {
    $("#modal_sinhvien_select").select2({
        dropdownParent: $("#modal_id")
    });
  });
  </script>`;
  $("#modal_body").append(body);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_luuchitiet_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );

  // Hiển thị tất cả sinh viên trong nhóm
  $.ajax({
    type: "GET",
    url: "/get_dssv_by_nhom_id?id=" + id_nhom,
    success: function (res) {
      $.each(res, function (idx, val) {
        if (val.danhgia == 0) {
          $("#modal_sinhvien_select").append(
            `<option value="${val.id}">${val.hoten}</option>`
          );
        }
      });
    },
  });

  $("#modal_id").modal("show");

  $("#modal_luuchitiet_btn").on("click", function () {
    let dssv_select = $("#modal_sinhvien_select").val();
    let ghichu = $("#modal_ghichu_text")
      .val()
      .replace(/[\r\n]+/g, "<br>");


    $.ajax({
      type: "POST",
      url: 'them_chi_tiet_cong_viec',
      contentType: 'application/json',
      data: JSON.stringify({ "id_congviec": id_congviec, "ghichu": ghichu, "sinhvien": dssv_select }),
      success: function (res) {
        $.each(res.result, function (idx) {
          if (res.result[idx] == 1) {
            Toast.fire({
              icon: "success",
              title: `Đã giao việc cho sinh viên ${idx}`,
            });
            $("#modal_id").modal("hide");
          } else if (res.result[idx] == 2) {
            Toast.fire({
              icon: "warning",
              title: `Không thể giao việc cho sinh viên ${idx} vì đã được đánh giá`,
            });
          } else {
            Toast.fire({
              icon: "error",
              title: `Sinh viên ${idx} đã có công việc trước đó`,
            });
          }
        });
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Giao việc không thành công",
        });
      },
    });
  });
}

function load_ChiTietCongViec(id_congviec) {
  $("#bangdscongviec").empty();
  $("#bangdscongviec").append(`
  <thead>
    <tr>
      <th scope="col" style="text-align: center;" width="25%">Công việc</th>
      <th scope="col" style="text-align: center;" width="15%">Người thực hiện</th>
      <th scope="col" style="text-align: center;">Ghi chú</th>
      <th scope="col" style="text-align: center;" width="15%">Trạng thái</th>
      <th scope="col" style="text-align: center;" width="10%">Thao tác</th>
    </tr>
  </thead>
  `);

  let bang_congviec = $("#bangdscongviec").dataTable({
    paging: false,
    lengthChange: false,
    searching: false,
    ordering: false,
    info: false,
    destroy: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url: "get_chi_tiet_cong_viec_by_id_cong_viec?id=" + id_congviec,
      dataSrc: "",
    },
    columns: [
      { data: "tencongviec" },
      { data: "nguoithuchien" },
      { data: "ghichu" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 0) {
            return '<center><span class="badge badge-warning"><i class="fa-solid fa-circle-exclamation"></i> Đang thực hiện</span></center>';
          } else if (data == 1) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Hoàn thành</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-bell"></i> Trễ hạn</span></center>';
          }
        },
      },
      {
        data: "id",
        render: function (data, type, row) {
          return `<center>
              <a class="btn btn-info btn-sm" id="editBtn" onclick="capNhatChiTietCongViec(${id_congviec}, ${data})">
                <i class="fas fa-pencil-alt"></i>
              </a>
              <a class="btn btn-danger btn-sm" id="deleteBtn" onclick="xoaChiTietCongViec(${id_congviec}, ${data})">
                <i class="fa-solid fa-trash"></i>
              </a>
            </center>`;
        },
      },
    ],
  });

  bang_congviec.prop("hidden", false);
}

function xoaCongViecByID(id) {
  $.ajax({
    type: "POST",
    url: `/xoa_cong_viec_by_id?id=${id}`,
    success: function (res) {
      if (res.status == 'OK') {
        Toast.fire({
          icon: "success",
          title: "Đã xóa công việc",
        });
        let nhomid = filter_chonnhom.val();

        load_timeline_congviec(nhomid);
        $("#bangdscongviec").empty();
      } else {
        Toast.fire({
          icon: "warning",
          title: "Không thể xoá công việc do đã có chi tiết công việc"
        });
      }
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Xóa công việc không thành công",
      });
    },
  });
}

function capNhatChiTietCongViec(id_congviec, id_chitiet) {
  clear_modal();
  // Tạo modal hiển thị chi tiết công việc
  $("#modal_title").text(`Cập nhật công việc`);
  let body = `
  <div class="form-group">
    <label for="modal_edit_sinhvien_select">Sinh viên thực hiện</label>
    <div class="input-group">
      <select id="modal_edit_sinhvien_select" class="form-control"></select>
    </div>
  </div>
  <div class="form-group">
    <label>Ghi chú</label> 
    <div class="input-group"> 
      <textarea class="form-control" id="modal_edit_ghichu_text" rows="5"></textarea> 
    </div> 
  </div>
  `;
  $("#modal_body").append(body);
  $("#modal_footer")
    .append(`<button type="button" class="btn btn-primary" id="modal_edit_luuchitiet_btn">
                              <i class="fa-solid fa-floppy-disk"></i> Lưu</button>`);
  $("#modal_id").modal("show");

  // Tạo danh sách sinh viên
  $.ajax({
    type: "GET",
    url: `/get_dssv_by_id_cong_viec?id=${id_chitiet}`,
    success: function (res) {
      $.each(res, function (idx, val) {
        $("#modal_edit_sinhvien_select").append(
          `<option value="${val.id}">${val.hoten}</option>`
        );
      });
      // Get chi tiết công việc bằng id công việc
      $.ajax({
        type: "GET",
        url: `get_chi_tiet_cong_viec_by_id?id=${id_chitiet}`,
        success: function (res) {
          $("#modal_edit_sinhvien_select").val(res[0].id_sinhvien);
          $("#modal_edit_ghichu_text").val(
            res[0].ghichu.replace(/<br>/g, "\r\n")
          );
        },
      });
    },
  });

  // Bắt sự kiện nút lưu
  $("#modal_edit_luuchitiet_btn").on("click", function () {
    let id_sinhvien = $("#modal_edit_sinhvien_select").val();
    let ghichu = $("#modal_edit_ghichu_text")
      .val()
      .replace(/[\r\n]+/g, "<br>");

    $.ajax({
      type: "POST",
      url: `update_chi_tiet_cong_viec_by_id?id=${id_chitiet}&svid=${id_sinhvien}&ghichu=${ghichu}`,
      success: function () {
        Toast.fire({
          icon: "success",
          title: "Đã cập nhật chi tiết công việc",
        });
        $("#modal_id").modal("hide");
        load_ChiTietCongViec(id_congviec);
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Cập nhật chi tiết công việc không thành công",
        });
      },
    });
  });
}

function xoaChiTietCongViec(id_congviec, id_chitiet) {
  $.ajax({
    type: "POST",
    url: `/xoa_chi_tiet_cong_viec_by_id?id=${id_chitiet}`,
    success: function () {
      Toast.fire({
        icon: "success",
        title: "Đã xóa công việc",
      });
      load_ChiTietCongViec(id_congviec);
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Xóa công việc không thành công",
      });
    },
  });
}

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

let bangdsnhomthuctap = $("#bangdsnhomthuctap").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_ds_nhom_thuc_tap",
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
    {
      data: "ngaybatdau",
      render: function (data, type, row) {
        return "<center>" + data + "</center>";
      },
    },
    { data: "tendetai" },
    { data: "nguoihuongdan" },
    {
      data: "soluong",
      render: function (data, type, row) {
        return "<center>" + data + "</center>";
      },
    },
    {
      data: "tennhom",
      render: function (data, type, row) {
        return "<center>" + data + "</center>";
      },
    },
    { data: "telegram_id" },
    { data: "ghichu" },
    {
      data: "xoa",
      render: function (data, type, row) {
        if (data == 0) {
          return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang hoạt động</span></center>';
        } else {
          return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Ngưng hoạt động</span></center>';
        }
      },
    },
    {
      data: "id",
      render: function (data, type, row, meta) {
        if (row.thoihan == 0) {
          return (
            `<center>
              <a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                <i class="fas fa-pencil-alt"></i>
              </a>  
              <a class="btn btn-danger btn-sm" data-id="${data}" id="deleteBtn">
                <i class="fas fa-trash"></i>
              </a>
            </center>`
          );
        } else {
          return `<center>
                    <button class="btn btn-info btn-sm" id="editBtn" disabled>
                      <i class="fas fa-pencil-alt"></i>
                    </button>  
                    <button class="btn btn-danger btn-sm" id="deleteBtn" disabled>
                      <i class="fas fa-trash"></i>
                    </button>
                  </center>`;
        }
      },
    },
  ],
});

// Clear modal
function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}
// Sửa đề tài
$("#bangdsnhomthuctap").on("click", "#editBtn", function () {
  let id = $(this).data("id");
  clear_modal();

  $.ajax({
    type: "GET",
    url: "get_chi_tiet_nhom_thuc_tap_by_id?id=" + parseInt(id),
    success: function (res) {
      $("#modal_title").text("Nhóm " + id);

      html = `<div class="form-group">
          <label for="modal_kythuctap_select">Kỳ thực tập</label>
          <select id="modal_kythuctap_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_detai_select">Đề tài</label>
          <select id="modal_detai_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_nguoihuongdan_select">Người hướng dẫn</label>
          <select id="modal_nguoihuongdan_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_tennhom_input">Tên nhóm</label>
          <input type="text" class="form-control" id="modal_tennhom_input" />
        </div>
        <div class="form-group">
          <label for="modal_telegram_input">Telegram ID</label>
          <input type="number" class="form-control" id="modal_telegram_input" />
        </div>
        <div class="form-group">
          <label for="modal_soluong_input">Số lượng sinh viên</label>
          <input type="number" class="form-control" id="modal_soluong_input" />
        </div>
        <div class="form-group">
          <label for="modal_ghichu_text">Ghi chú</label>
          <textarea id="modal_ghichu_text" class="form-control" rows="5"></textarea>
        </div>
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="modal_hoatdong_check">
          <label class="form-check-label" for="modal_hoatdong_check">Hoạt động?</label>
        </div>
        <script>
          $(".select2").select2({
            theme: "bootstrap",
            dropdownParent: $("#modal_id")
          });
        </script>`;
      $("#modal_body").append(html);

      // Danh sách kỳ thực tập
      $.ajax({
        type: "GET",
        url: "/get_all_ky_thuc_tap",
        success: function (data) {
          $.each(data, function (idx, val) {
            $("#modal_kythuctap_select").append(
              '<option value="' + val.id + '">' + val.ngaybatdau + "</option>"
            );
          });

          $("#modal_kythuctap_select").val(res.kythuctap_id);
        },
      });

      // Danh sách đề tài
      $.ajax({
        type: "GET",
        url: "/get_all_de_tai",
        success: function (data) {
          $.each(data, function (idx, val) {
            $("#modal_detai_select").append(
              '<option value="' + val.id + '">' + val.ten + "</option>"
            );
          });

          $("#modal_detai_select").val(res.detai_id);
        },
      });

      // Danh sách nhóm thực tập
      $.ajax({
        type: "GET",
        url: "/get_all_nguoi_huong_dan",
        success: function (data) {
          $.each(data, function (idx, val) {
            $("#modal_nguoihuongdan_select").append(
              '<option value="' + val.id + '">' + val.hoten + "</option>"
            );
          });

          $("#modal_nguoihuongdan_select").val(res.nguoihuongdan_id);
        },
      });

      // Tên nhóm
      $("#modal_tennhom_input").val(res.nhomthuctap_tennhom);

      // Telegram ID
      $("#modal_telegram_input").val(res.nhomthuctap_telegram);

      // Số lượng sinh viên thực tập
      $("#modal_soluong_input").val(res.nhomthuctap_soluong);

      // Ghi chú
      $("#modal_ghichu_text").val(res.ghichu.replace(/<br>/g, "\r\n"));

      // Trạng thái nhóm
      if (res.xoa == 0) {
        $("#modal_hoatdong_check").prop("checked", true);
      } else {
        $("#modal_hoatdong_check").prop("checked", false);
      }
      $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" data-id="' +
        res.id +
        '" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>'
      );

      $("#modal_id").modal("show");
      // Tính năng lưu thay đổi
      $("#modal_submit_btn").click(function () {
        let xoa = $("#modal_hoatdong_check").is(":checked");
        let isDeleted = xoa ? 0 : 1;
        let kytt = $("#modal_kythuctap_select").val();
        let detai = $("#modal_detai_select").val();
        let nhd = $("#modal_nguoihuongdan_select").val();
        let soluong = $("#modal_soluong_input").val();
        let tennhom = $("#modal_tennhom_input").val();
        let telegram = $("#modal_telegram_input").val();
        let ghichu = $("#modal_ghichu_text")
          .val()
          .replace(/[\r\n]+/g, "<br>");
        $.ajax({
          type: "POST",
          url:
            "update_chi_tiet_nhom_thuc_tap_by_id?id=" +
            parseInt(id) +
            "&kytt=" +
            parseInt(kytt) +
            "&nguoihd=" +
            parseInt(nhd) +
            "&detai=" +
            parseInt(detai) +
            "&soluong=" +
            parseInt(soluong) +
            "&isDeleted=" +
            isDeleted +
            "&tennhom=" +
            tennhom +
            "&telegram=" +
            telegram +
            "&ghichu=" +
            ghichu,
          success: function (data) {
            if (data.status == "OK") {
              $("#modal_id").modal("hide");
              bangdsnhomthuctap.ajax.reload();
              Toast.fire({
                icon: "success",
                title: "Cập nhật thành công",
              });
            } else {
              Toast.fire({
                icon: "error",
                title: "Đã xãy ra lỗi",
              });
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Đã xãy ra lỗi",
            });
          },
        });
      });
    },
  });
});

// Xoá nhóm thực tập
$("#bangdsnhomthuctap").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Bạn muốn xoá nhóm thực tập số " + id,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_xoa_nhom_thuc_tap_by_id?id=" + parseInt(id),
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: "Đã xoá",
            });
            bangdsnhomthuctap.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Nhóm đã có sinh viên đăng ký hoặc đã kết thúc",
            });
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Xoá không thành công",
          });
        },
      });
    }
  });
});

// Modal thêm nhóm
$("#themkythuctap_btn").click(function () {
  clear_modal();
  $.ajax({
    type: "GET",
    url: "get_chi_tiet_chinh_sua_nhom",
    success: function (res) {
      $("#modal_title").text("Thêm nhóm thực tập");
      html = `<div class="form-group">
          <label for="modal_kythuctap_select">Kỳ thực tập</label>
          <select id="modal_kythuctap_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_detai_select">Đề tài</label>
          <select id="modal_detai_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_nguoihuongdan_select">Người hướng dẫn</label>
          <select id="modal_nguoihuongdan_select" class="form-control select2"></select>
        </div>
        <div class="form-group">
          <label for="modal_tennhom_input">Tên nhóm</label>
          <input type="text" class="form-control" id="modal_tennhom_input" />
        </div>
        <div class="form-group">
          <label for="modal_telegram_input">Telegram ID</label>
          <input type="text" class="form-control" id="modal_telegram_input" />
        </div>
        <div class="form-group">
          <label for="modal_soluong_input">Số lượng sinh viên</label>
          <input type="number" class="form-control" id="modal_soluong_input" />
        </div>
        <div class="form-group">
          <label for="modal_soluong_input">Ghi chú</label>
          <textarea id="modal_ghichu_text" class="form-control" rows="5"></textarea>
        </div>
        <script>
          $(".select2").select2({
            theme: "bootstrap",
            dropdownParent: $("#modal_id")
          });
        </script>`;
      $("#modal_body").append(html);
      $.each(res.kythuctap, function (idx, val) {
        $("#modal_kythuctap_select").append(
          '<option value="' +
          val.id +
          '">' +
          moment(val.ngay, "YYYY-MM-DD").format("DD/MM/YYYY") +
          "</option>"
        );
      });
      $.each(res.detai, function (idx, val) {
        $("#modal_detai_select").append(
          '<option value="' + val.id + '">' + val.ten + "</option>"
        );
      });
      $.each(res.nguoihuongdan, function (idx, val) {
        $("#modal_nguoihuongdan_select").append(
          '<option value="' + val.id + '">' + val.hoten + "</option>"
        );
      });
      $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
      );
      $("#modal_id").modal("show");

      $("#modal_submit_btn").click(function () {
        let kytt = $("#modal_kythuctap_select").val();
        let detai = $("#modal_detai_select").val();
        let soluong = $("#modal_soluong_input").val();
        let nhd = $("#modal_nguoihuongdan_select").val();
        let tennhom = $("#modal_tennhom_input").val();
        let telegram = $("#modal_telegram_input").val();
        let ghichu = $("#modal_ghichu_text")
          .val()
          .replace(/[\r\n]+/g, "<br>");

        $.ajax({
          type: "POST",
          url:
            "them_nhom_thuc_tap?kytt=" +
            parseInt(kytt) +
            "&nguoihd=" +
            parseInt(nhd) +
            "&detai=" +
            parseInt(detai) +
            "&soluong=" +
            parseInt(soluong) +
            "&tennhom=" +
            tennhom +
            "&telegram=" +
            telegram +
            "&isDeleted=0" +
            "&ghichu=" +
            ghichu,
          success: function (res) {
            Toast.fire({
              icon: "success",
              title: "Đã thêm kỳ thực tập",
            });
            bangdsnhomthuctap.ajax.reload();
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Thêm kỳ thực tập không thành công",
            });
          },
        });
        $("#modal_id").modal("hide");
      });
    },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
});

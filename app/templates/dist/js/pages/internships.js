var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

let bangdskythuctap = $("#bangdskythuctap").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_all_ky_thuc_tap",
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
    {
      data: "ngayketthuc",
      render: function (data, type, row) {
        return "<center>" + data + "</center>";
      },
    },
    {
      data: "thoihan",
      render: function (data, type, row) {
        if (data == 0) {
          return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang diễn ra</span></center>';
        } else {
          return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Đã kết thúc</span></center>';
        }
      },
    },
    { data: "ghichu" },
    {
      data: "id",
      render: function (data, type, row) {
        return (
          '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
          data +
          '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-danger btn-sm" data-id="' +
          data +
          '" id="deleteBtn"><i class="fas fa-trash"></i></a></center>'
        );
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
$("#bangdskythuctap").on("click", "#editBtn", function () {
  let id = $(this).data("id");
  clear_modal();
  $.ajax({
    type: "GET",
    url: "get_chi_tiet_ky_thuc_tap_by_id?id=" + id,
    success: function (res) {
      $("#modal_title").text("Kỳ thực tập " + res.ngaybatdau);
      html = `<div class="form-group">
                <label>Thời gian thực tập:</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">
                      <i class="far fa-calendar-alt"></i>
                    </span>
                  </div>
                  <input type="text" class="form-control float-right" id="reservation">
                </div>
              </div>
              <script>
                $("#reservation").daterangepicker({
                  "opens": "right",
                  "alwaysShowCalendars": true,
                  "drops": "auto",
                  "ranges": {
                      'Hôm nay': [moment(), moment()],
                      '7 Ngày sau': [moment(), moment().add(6, 'days')],
                      '7 Ngày trước': [moment().subtract(6, 'days'), moment()],
                      '3 Ngày sau': [moment().add(29, 'days'), moment()],
                      '30 ngày trước': [moment(), moment().add(29, 'days')]
                  },
                  "locale": {
                    "format": "DD/MM/YYYY",
                    "separator": " - ",
                    "applyLabel": "Chọn",
                    "cancelLabel": "Hủy",
                    "fromLabel": "Từ ngày",
                    "toLabel": "Đến ngày",
                    "customRangeLabel": "Custom",
                    "weekLabel": "W",
                    "daysOfWeek": [
                        "CN",
                        "T2",
                        "T3",
                        "T4",
                        "T5",
                        "T6",
                        "T7"
                    ],
                    "monthNames": [
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
                        "Tháng 12"
                    ],
                    "firstDay": 1
                }
                });
              </script>
              <div class="form-group">
                <label for="modal_ghichu_text">Ghi chú</label>
                <textarea id="modal_ghichu_text" class="form-control" rows="5"></textarea>
              </div>
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="modal_hoatdong_check">
                <label class="form-check-label" for="modal_hoatdong_check">Sử dụng kỳ thực tập</label>
              </div>`;

      $("#modal_body").append(html);
      // Set giá trị ghichu
      $("#modal_ghichu_text").val(res.ghichu.replace(/<br>/g, "\r\n"));
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
        let id = $(this).data("id");

        let dates = $("#reservation").val().split(" - ");
        let xoa = $("#modal_hoatdong_check").is(":checked");
        let isDeleted = xoa ? 0 : 1;
        let ngaybatdau = dates[0];
        let ngayketthuc = dates[1];
        let ghichu = $("#modal_ghichu_text")
          .val()
          .replace(/[\r\n]+/g, "<br>");

        $.ajax({
          type: "POST",
          url:
            "update_chi_tiet_ky_thuc_tap_by_id?id=" +
            parseInt(id) +
            "&ngaybatdau=" +
            ngaybatdau +
            "&ngayketthuc=" +
            ngayketthuc +
            "&isDeleted=" +
            isDeleted +
            "&ghichu=" +
            ghichu,
          success: function (data) {
            if (data.status == "OK") {
              $("#modal_id").modal("hide");
              bangdskythuctap.ajax.reload();
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

// Xoá kỳ thực tập
$("#bangdskythuctap").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Bạn muốn xoá kỳ thực tập số " + id,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_xoa_ky_thuc_tap_by_id?id=" + parseInt(id),
        success: function (res) {
          if (res.status == 'OK') {
            Toast.fire({
              icon: "success",
              title: "Đã xoá",
            });
            bangdskythuctap.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Kỳ thực tập đang được nhóm sử dụng"
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

// Modal thêm đề ài
$("#themkythuctap_btn").click(function () {
  // Clear modal
  clear_modal();
  $("#modal_title").text("Thêm kỳ thực tập");
  html = `<div class="form-group">
            <label>Thời gian thực tập:</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <i class="far fa-calendar-alt"></i>
                </span>
              </div>
              <input type="text" class="form-control float-right" id="reservation">
            </div>
          </div>
          <script>
            $("#reservation").daterangepicker({
              "opens": "right",
              "alwaysShowCalendars": true,
              "drops": "auto",
              "ranges": {
                  'Hôm nay': [moment(), moment()],
                  '7 Ngày sau': [moment(), moment().add(6, 'days')],
                  '7 Ngày trước': [moment().subtract(6, 'days'), moment()],
                  '3 Ngày sau': [moment().add(29, 'days'), moment()],
                  '30 ngày trước': [moment(), moment().add(29, 'days')]
              },
              "locale": {
                "format": "DD/MM/YYYY",
                "separator": " - ",
                "applyLabel": "Chọn",
                "cancelLabel": "Hủy",
                "fromLabel": "Từ ngày",
                "toLabel": "Đến ngày",
                "customRangeLabel": "Custom",
                "weekLabel": "W",
                "daysOfWeek": [
                    "CN",
                    "T2",
                    "T3",
                    "T4",
                    "T5",
                    "T6",
                    "T7"
                ],
                "monthNames": [
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
                    "Tháng 12"
                ],
                "firstDay": 1
            }
            });
          </script>
          <div class="form-group">
            <label for="modal_ghichu_text">Ghi chú</label>
            <textarea id="modal_ghichu_text" class="form-control" rows="5"></textarea>
          </div>`;
  $("#modal_body").append(html);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $("#modal_submit_btn").click(function () {
    let dates = $("#reservation").val().split(" - ");
    let ngaybatdau = dates[0];
    let ngayketthuc = dates[1];
    let ghichu = $("#modal_ghichu_text")
      .val()
      .replace(/[\r\n]+/g, "<br>");

    $.ajax({
      type: "POST",
      url:
        "them_ky_thuc_tap?ngaybatdau=" +
        ngaybatdau +
        "&ngayketthuc=" +
        ngayketthuc +
        "&isDeleted=0&ghichu=" +
        ghichu,
      success: function (res) {
        Toast.fire({
          icon: "success",
          title: "Đã thêm kỳ thực tập",
        });
        bangdskythuctap.ajax.reload();
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
});

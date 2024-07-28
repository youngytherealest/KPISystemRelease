var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var bangdsyeucau;

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

  // Get danh sách các loai yeu cau
  let filter_chonloaiyeucau = $("#filter_chonloaiyeucau");
  $.ajax({
    type: "GET",
    url: `get_ds_loai_yeu_cau_by_sv`,
    success: function (res) {
      $.each(res, function (idx, val) {
        filter_chonloaiyeucau.append(
          '<option value="' + val.id + '">' + val.loaiyeucau + "</option>"
        );
      });
    },
  });

  bangdsyeucau = $("#bangdsyeucau").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url: "get_ds_yeu_cau_in_phieu_by_sv",
      dataSrc: "data",
    },
    columns: [
      {
        data: null,
        render: function (data, type, row, meta) {
          // Use meta.row to get the current row index, and add 1 to start from 1
          return "<center>" + (meta.row + 1) + "</center>";
        },
      },
      { data: "loaiyeucau" },
      { data: "ngaygui" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 0) {
            return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp; Chờ phê duyệt</span></center>';
          } else if (data == 1) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp; Đã phê duyệt</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Bị từ chối</span></center>';
          }

        },
      },
      {
        data: "id",
        render: function (data, type, row) {
          if (row.trangthai == 0) {
            return (
              '<center><a class="btn btn-danger btn-sm" data-id="' +
              data +
              '" id="deleteBtn"><i class="fas fa-trash"></i></a></center>'
            );
          } else if (row.trangthai == 1) {
            return (
              `<center>
              <a class="btn btn-info btn-sm" id="printBtn" href="/sv_xuat_phieu?id=${data}""><i class="fas fa-print"></i></a>
              </center>`
            );
          } else {
            return (
              `<center> 
              <button class="btn btn-danger btn-sm" id="deleteBtn" disabled><i class="fas fa-trash"></i></button>
              </center>`
            );
          }
        },
      },
    ],
  });

  // Modal gửi yêu cầu
  $("#guiyeucau_btn").click(function () {
    // Clear modal
    clear_modal();
    let idloaiyeucau = $("#filter_chonloaiyeucau").val();
    let loaiyeucau = $("#filter_chonloaiyeucau option:selected").text();

    // Kiểm tra nếu nhóm id chưa được chọn
    if (idloaiyeucau === null || idloaiyeucau === "-- CHỌN LOẠI YÊU CẦU --") {
      return; // Ngăn chặn việc thực hiện các hành động tiếp theo
    }

    $("#modal_title").text("Xác nhận gửi yêu cầu");
    html = `<p>Bạn có chắc chắn gửi yêu cầu in phiếu?</p>`;
    $("#modal_body").append(html);
    $("#modal_footer").append(
      '<button type="button" class="btn btn-secondary mr-auto" data-dismiss="modal">Hủy</button><button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Gửi</button>'
    );

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {
      let idloaiyeucau = $("#filter_chonloaiyeucau").val();

      $.ajax({
        type: "POST",
        url:
          "/gui_yeu_cau_in_phieu?idloaiyeucau=" +
          idloaiyeucau,
        success: function (res) {
          if (res.status != "NOT OK") {
            Toast.fire({
              icon: "success",
              title: "Gửi yêu cầu thành công!",
            });
            $.ajax({
              type: `POST`,
              url: `canh_bao_yeu_cau_in_phieu?loaiyeucau=` + loaiyeucau + `&id=` + res.status,
              success: () => { },
              error: () => { }
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          } else if (res.status == "INVALID") {
            Toast.fire({
              icon: "warning",
              title: "Chưa đến thời hạn in phiếu đánh giá",
            });
          } else if (res.status == "NOT OK") {
            Toast.fire({
              icon: "warning",
              title: "Yêu cầu này đã được gửi",
            });
          }
          else {
            Toast.fire({
              icon: "error",
              title: "Không thể gửi yêu cầu này!",
            });
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Không thể gửi yêu cầu!",
          });
        },
      });
      $("#modal_id").modal("hide");
    });
  });
});

// Xoá yêu cầu
$("#bangdsyeucau").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Bạn chắc chắn muốn xoá yêu cầu này?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/update_xoa_yeu_cau_in_phieu_by_id",
        contentType: "application/json",
        data: JSON.stringify({
          ids: [id],
          trangthai: 0
        }),
        success: function (res) {
          if (res.total == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã xoá 1 yêu cầu",
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Xóa yêu cầu không thành công"
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Xoá không thành công",
          });
        },
      });
    }
  });
});
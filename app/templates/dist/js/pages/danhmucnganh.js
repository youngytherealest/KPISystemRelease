var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

let bangdscacnganh = $("#bangdscacnganh").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_danh_sach_nganh",
    dataSrc: "",
  },
  columns: [
    {
      data: "id",
      render: function (data, type, row, meta) {
        return `<center><input type="checkbox" id='child-checkbox' class="select-checkbox child-checkbox" data-id="${row.id}"></center>`;
      },
    },
    {
      data: null,
      render: function (data, type, row, meta) {
        // Use meta.row to get the current row index, and add 1 to start from 1
        return "<center>" + (meta.row + 1) + "</center>";
      },
    },
    { data: "ten" },
    { data: "kyhieu" },
    {
      data: "isDeleted",
      render: function (data, type, row) {
        if (data == 1) {
          return '<center><span class="badge badge-warning"><i class="fa-solid fa-exclamation"></i> Ngưng hoạt động</span></center>';
        } else {
          return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang hoạt động</span></center>';
        }
      },
    },
    { data: "ten_truong" },
    {
      data: null,
      render: function (data, type, row) {
        if (row.isDeleted == 1) {
          return `
            <center>
              <a class="btn btn-warning btn-sm" id="unlockNganhBtn" data-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Mở khóa ngành">
                <i class="fa-solid fa-key"></i>
              </a>
            </center>
          `;
        } else {
          return `
            <center>
              <a class="btn btn-info btn-sm" id="editBtn" data-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Sửa thông tin">
                <i class="fa-solid fa-pencil-alt"></i>
              </a>
              <a class="btn btn-danger btn-sm" id="deleteNganhBtn" data-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xoá ngành">
                <i class="fa-solid fa-trash"></i>
              </a>
            </center>
          `;
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

// Xoa nganh
$("#bangdscacnganh").on("click", "#deleteNganhBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận ngưng sử dụng ngành`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `update_xoa_nganh_by_id?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Ngưng sử dụng ngành thành công!.`,
            });
            bangdscacnganh.ajax.reload();
          } else if (res.status == "EXISTS") {
            Toast.fire({
              icon: "warning",
              title: "Ngành đang được sử dụng. Vui lòng chọn Ngừng sử dụng",
            });
          }
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
          });
        },
      });
    }
  });
});

//xoa ngành vĩnh viễn
$("#xoadanhmucnganhBtn").on("click", function () {
  let idList = $("#child-checkbox:checked")
    .map(function () {
      return $(this).data("id");
    })
    .get();
  if (idList.length == 0) {
    Toast.fire({
      icon: "warning",
      title: `Vui lòng chọn ngành cần xóa.`,
    });
  } else {
    Swal.fire({
      title: `Xác nhận xóa ngành`,
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: `POST`,
          url: `delete_nganh_by_id_list?idList=${idList}`,
          contentType: "application/json",
          success: function (res) {
            console.log(res);
            if (res.status == "OK") {
              Toast.fire({
                icon: "success",
                title: `Đã xóa ${idList.length} ngành.`,
              });
              bangdscacnganh.ajax.reload();
            } else {
              Toast.fire({
                icon: "warning",
                title: "Không thể xóa ngành đang được sử dụng.",
              });
              bangdscacnganh.ajax.reload();
            }
          },
          error: function (xhr, status, error) {
            console.error("Error:", status, error);
            Toast.fire({
              icon: "error",
              title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
            });
            bangdscacnganh.ajax.reload();
          },
        });
      }
    });
  }
});
// Sửa thông tin ngành
$("#bangdscacnganh").on("click", "#editBtn", function () {
  let id = $(this).data("id");
  clear_modal();
  $.ajax({
    type: "GET",
    url: `get_chi_tiet_nganh_by_id?id=` + parseInt(id),
    success: function (nganh) {
      console.log(nganh);
      $("#modal_title").text("Sửa thông tin ngành " + nganh.kyhieu);
      let html = `
        <div class="form-group">
          <label for="modal_tennganh_input">Tên ngành</label>
          <input type="text" class="form-control" id="modal_tennganh_input" value="${nganh.ten}" required />
        </div>
        <div class="form-group">
          <label for="modal_kyhieu_input">Ký hiệu</label>
          <input type="text" class="form-control" id="modal_kyhieu_input" value="${nganh.kyhieu}" required />
        </div>
        <div class="form-group">
          <label for="modal_chontruong_update_select">Chọn trường</label>
          <select id="modal_chontruong_update_select" class="form-control">
            
          </select>
        </div>
      `;
      $("#modal_body").append(html);
      $.ajax({
        type: `GET`,
        url: `get_danh_sach_truong`,
        success: function (schools) {
          let options = schools
            .map(
              (school) =>
                `<option value="${school.id}" ${school.id == nganh.id_truong ? "selected" : ""
                }>
            ${school.ten}
          </option>`
            )
            .join("");
          $("#modal_chontruong_update_select").html(options);
        },
      });

      $("#modal_footer").append(
        `<button type="button" class="btn btn-primary" id="modal_submit_nganh_btn">
            <i class="fa-solid fa-floppy-disk"></i> 
            Lưu 
          </button>`
      );
      // Show the modal
      $("#modal_id").modal("show");
      $("#modal_submit_nganh_btn").on("click", function () {
        let tennganh = $("#modal_tennganh_input");
        let kyhieu = $("#modal_kyhieu_input");
        let idtruong = $("#modal_chontruong_update_select");
        $.ajax({
          type: `POST`,
          url: `update_nganh_by_id?id=${id}&ten=${tennganh.val()}&kyhieu=${kyhieu.val()}&isDeleted=0&idtruong=${idtruong.val()}`,
          success: function (res) {
            console.log(res);
            if (res.status == "OK") {
              Toast.fire({
                icon: "success",
                title: `Đã cập nhật thông tin ngành.`,
              });
              $("#modal_id").modal("hide");
              bangdscacnganh.ajax.reload();
            } else if (res.status == "NOT_UPDATE") {
              Toast.fire({
                icon: "warning",
                title: "Ký hiệu đã được sử dụng. Vui lòng chọn ký hiệu khác",
              });
            }
          },
          error: function (xhr, status, error) {
            console.error("Error:", status, error);
            Toast.fire({
              icon: "error",
              title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
            });
          },
        });
      });
    },
  });
});
// Tạo thông tin ngành
$("#taodanhmucnganhBtn").on("click", function () {
  clear_modal();
  $.ajax({
    type: `GET`,
    url: `get_danh_sach_truong`,
    success: function (res) {
      let options = "";
      res.forEach((school) => {
        options += `<option value="${school.id}">${school.ten}</option>`;
      });
      $("#modal_chontruong_select").html(options);
    },
  });
  $("#modal_title").text(`Tạo ngành mới`);
  $("#modal_body").html(`
      <div class="form-group">
        <label for="modal_tenganh_input">Tên ngành</label>
        <input type="text" class="form-control" id="modal_tennganh_input" required />
      </div>
      <div class="form-group">
        <label for="modal_kyhieu_input">Ký hiệu</label>
        <input type="text" class="form-control" id="modal_kyhieu_input" required />
      </div>
      <div class="form-group">
        <label for="modal_chontruong_select">Chọn trường</label>
        <select id="modal_chontruong_select" class="form-control">
        </select>
      </div>
    `);
  $("#modal_footer").append(
    `<button type="button" class="btn btn-primary" id="modal_submit_nganh_btn">
        <i class="fa-solid fa-floppy-disk"></i> 
        Lưu 
      </button>`
  );

  $("#modal_id").modal("show");

  let tennganh = $("#modal_tennganh_input");
  let kyhieu = $("#modal_kyhieu_input");
  let idtruong = $("#modal_chontruong_select");

  $("#modal_submit_nganh_btn").on("click", function () {
    $.ajax({
      type: `POST`,
      url: `them_nganh?ten=${tennganh.val()}&kyhieu=${kyhieu.val()}&isDeleted=0&idtruong=${idtruong.val()}`,
      success: function (res) {
        console.log(res);
        if (res.status == "OK") {
          Toast.fire({
            icon: "success",
            title: `Đã thêm ngành ${tennganh.val()}.`,
          });
          $("#modal_id").modal("hide");
          bangdscacnganh.ajax.reload();
        } else if (res.status == "NOT_CREATE") {
          Toast.fire({
            icon: "warning",
            title: `Vui lòng chọn ký hiệu khác.`,
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
        Toast.fire({
          icon: "error",
          title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
        });
      },
    });
  });
});

// Unlock nganh
$("#bangdscacnganh").on("click", "#unlockNganhBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận mở khóa ngành`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Mở khóa",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `update_mo_khoa_nganh_by_id?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Mở khóa ngành thành công.`,
            });
            bangdscacnganh.ajax.reload();
          } else {
            Toast.fire({
              icon: "error",
              title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
            });
          }
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
          });
        },
      });
    }
  });
});
// Select all/none checkboxes
$("#bangdscacnganh").on("click", ".select-all-checkbox", function () {
  var isChecked = $(this).prop("checked");
  $(".child-checkbox").prop("checked", isChecked);
});
// Xóa danh mục ngành
$(document).ready(function () {
  // Ẩn nút khi trang vừa tải
  $("#xoadanhmucnganhBtn").hide();

  // Lắng nghe sự kiện khi checkbox thay đổi trạng thái
  $(document).on("change", ".select-checkbox", function () {
    if ($(".select-checkbox:checked").length > 0) {
      // Hiển thị nút nếu có checkbox được chọn
      $("#xoadanhmucnganhBtn").show();
    } else {
      // Ẩn nút nếu không có checkbox nào được chọn
      $("#xoadanhmucnganhBtn").hide();
    }
  });

  // Lắng nghe sự kiện thay đổi của checkbox "select-all-checkbox"
  $(document).on("change", ".select-all-checkbox", function () {
    $(".select-checkbox")
      .prop("checked", $(this).prop("checked"))
      .trigger("change");
  });
});

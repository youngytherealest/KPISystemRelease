let currentDate = new Date();
currentDate.setDate(currentDate.getDate() + 3);
let currentTimestamp = Math.floor(currentDate.getTime() / 1000);

const Toast = Swal.mixin({
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

// Modal biểu mẫu
$("#thembieumau_btn").click(function () {
  // Clear modal
  clear_modal();
  $("#modal_title").text("Thêm biểu mẫu");
  html =
    `<div class="form-group">
      <label for="modal_tenbieumau_input">Tên biểu mẫu</label>
      <input type="text" class="form-control" id="modal_tenbieumau_input" placeholder="Nhập tên biểu mẫu">
    </div>
    <div class="form-group">
      <label for="modal_truong_select">Trường</label>
      <select id="modal_truong_select" class="form-control select2"></select>
    </div>
    <div class="form-group">
      <label for="modal_file_input">Chọn file biểu mẫu</label>
      <input type="file" id="modal_file_input" class="form-control" accept=".pdf, .docx, .pptx, .xlsx">
    </div>`;
  $("#modal_body").append(html);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $.ajax({
    type: 'GET',
    url: 'get_danh_sach_truong',
    success: function (data) {
      $.each(data, function (idx, val) {
        $("#modal_truong_select").append(
          `<option value="${val['id']}">${val['ten']}</option>`
        );
      });
    },
    error: function () {
      Toast.fire({
        icon: 'error',
        text: 'Lỗi không load được danh sách trường'
      })
    }
  })

  $("#modal_submit_btn").click(function () {
    const form = new FormData();
    form.append("tenbieumau", $("#modal_tenbieumau_input").val());
    form.append("id_truong", $("#modal_truong_select").val());
    form.append("file", document.getElementById("modal_file_input").files[0]);

    $.ajax({
      type: "POST",
      url: "import_bieumau",
      data: form,
      processData: false,
      contentType: false,
      success: function () {
        Toast.fire({
          icon: "success",
          text: "Đã thêm biểu mẫu"
        });
        bangdsbieumau.ajax.reload();
      },
      error: function () {
        Toast.fire({
          icon: "error",
          text: "Thêm biểu mẫu không thành công"
        })
      }
    });
    $("#modal_id").modal("hide");
  });
});

let bangdsbieumau = $("#bangdsbieumau").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_danh_sach_bieu_mau",
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
    { data: "ten" },
    { data: "tentruong" },
    {
      data: "id",
      render: function (data, type, row) {
        return `<center>
                  <a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                    <i class="fas fa-pencil-alt"></i>
                  </a>  
                  <a class="btn btn-danger btn-sm" data-id="${data}" id="deleteBtn">
                    <i class="fas fa-trash"></i>
                  </a>
                </center>`;
      },
    },
  ],
});

$("#bangdsbieumau").on("click", "#editBtn", function () {
  let id_bieumau = $(this).data("id");
  NProgress.start();
  $.ajax({
    type: "GET",
    url: `xem_bieumau?id=${id_bieumau}`,
    xhrFields: {
      responseType: 'blob' // Để xử lý dữ liệu nhị phân
    },
    success: function (data) {
      NProgress.done();
      clear_modal();
      $("#modal_title_large").text("Xem biểu mẫu");
      $("#modal_body_large").html(`
          <iframe id="pdfViewer" width="100%" height="800"></iframe>
      `);
      $("#modal_id_large").modal("show");
      var url = window.URL.createObjectURL(data);
      $('#pdfViewer').attr('src', url);
    },
    error: function () {
      NProgress.done();
      Toast.fire({
        icon: 'error',
        text: 'Không thể load biểu mẫu'
      })
    }
  });
});

$("#bangdsbieumau").on("click", "#deleteBtn", function () {
  let id_bieumau = $(this).data("id");

  Swal.fire({
    title: "Bạn muốn xoá biểu mẫu",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: `xoa_bieumau?id=${id_bieumau}`,
        success: function () {
          Toast.fire({
            icon: 'success',
            text: 'Đã xoá biểu mẫu'
          })
          bangdsbieumau.ajax.reload();
        },
        error: function () {
          Toast.fire({
            icon: 'error',
            text: 'Không thể xoá biểu mẫu'
          })
        }
      });
    }
  });
});

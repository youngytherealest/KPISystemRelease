var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});


// Đối tượng ánh xạ giữa ID và tên chức năng
var MapIdTen = {};

// Mapping url - tên chức năng mỗi khi reload
function reloadMapping() {
  bangdschucnang.data().toArray().forEach(function (row) {
    MapIdTen[row.id] = row.ten;
  });
}


let bangdschucnang = $("#bangdschucnang").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_all_chuc_nang",
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
    { data: "mota" },
    {
      data: "url",
      render: function (data, type, row) {
        return '<a href="' + data + '" style="font-style: italic;" data-toggle="tooltip" title="Nhấn để mở">' + data + '</a>';
      },
    },
    {
      data: "trangthai",
      render: function (data, type, row) {
        if (data == 1) {
          return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang sử dụng</span></center>';
        } else {
          return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Ngưng sử dụng</span></center>';
        }
      },
    },
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
  initComplete: function () {
    bangdschucnang.data().toArray().forEach(function (row) {
      MapIdTen[row.id] = row.ten;
    });
  }
});


// Clear modal
function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}
// Sửa chức năng
$("#bangdschucnang").on("click", "#editBtn", function () {
  let id = $(this).data("id");
  clear_modal();

  $.ajax({
    type: "GET",
    url: "get_chi_tiet_chuc_nang_by_id?id=" + id,
    success: function (res) {
      $("#modal_title").text("Chức năng " + res.ten);
      $("#modal_body").append(
        `<div class="form-group"><label for="modal_url_input">URL</label>
        <input type="text" class="form-control" id="modal_url_input" placeholder="Nhập URL chức năng" value="${res.url}"></div>
        <div class="form-group"><label for="modal_tenchucnang_input">Tên chức năng</label>
        <input type="text" class="form-control" id="modal_tenchucnang_input" placeholder="Nhập tên chức năng" value="${res.ten}"></div>
        <div class="form-group"><label for="modal_motachucnang_input">Mô tả</label>
        <textarea id="modal_motachucnang_input" rows="5" class="form-control" placeholder="Nhập mô tả chức năng">${(res.mota == null ? "" : res.mota.replace(/<br>/g, "\r\n"))}</textarea></div>
        <div class="form-check"><input type="checkbox" class="form-check-input" id="modal_hoatdong_check">
        <label class="form-check-label" for="modal_hoatdong_check">Sử dụng chức năng</label></div>`
      );
      if (res.trangthai == 1) {
        $("#modal_hoatdong_check").prop("checked", true);
      } else {
        $("#modal_hoatdong_check").prop("checked", false);
      }
      $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" data-id="' +
        res.url +
        '" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>'
      );
      $("#modal_id").modal("show");
      // Tính năng lưu thay đổi
      $("#modal_submit_btn").click(function () {
        let url = getRelativePath($("#modal_url_input").val());
        let ten = $("#modal_tenchucnang_input").val();
        let mota = $("#modal_motachucnang_input")
          .val()
          .replace(/[\r\n]+/g, "<br>");
        let act = $("#modal_hoatdong_check").is(":checked");
        let trangthai = act ? 1 : 0;

        if (url == null) {
          Toast.fire({
            icon: "error",
            title: "Vui lòng thêm đường dẫn hợp lệ"
          });
          return;
        } else if (ten == null || ten.trim() == "") {
          Toast.fire({
            icon: "error",
            title: "Vui lòng điền tên chức năng"
          });
          return;
        } else { // Nếu đường dẫn hợp lệ
          // Lấy tất cả dữ liệu hiện tại trong bảng
          var allData = bangdschucnang.data().toArray();

          // Kiểm tra xem url đã tồn tại trong bảng chưa
          var existURL = allData.some(function (row) {
            // Chỉ thực hiện kiểm tra nếu row.url.toLowerCase() khác với url.toLowerCase()
            if (row.url.toLowerCase() === res.url.toLowerCase()) {
              return false; // Trả về false nếu không phải row cần kiểm tra
            }

            // Nếu row.url.toLowerCase() giống với url.toLowerCase(), thì thực hiện kiểm tra và trả về kết quả
            return row.url.toLowerCase() === url.toLowerCase();
          });

          // Kiểm tra xem tên chức năng đã tồn tại trong bảng chưa
          var existTen = allData.some(function (row) {
            // Chỉ thực hiện kiểm tra nếu row.url.toLowerCase() khác với url.toLowerCase()
            if (row.ten.toLowerCase() === res.ten.toLowerCase()) {
              return false; // Trả về false nếu không phải row cần kiểm tra
            }
            return row.ten.toLowerCase() === ten.toLowerCase();
          });

          if (existURL) {
            Toast.fire({
              icon: "error",
              title: "URL đã được thêm vào bảng."
            });
            return;
          } else if (existTen) {
            Toast.fire({
              icon: "error",
              title: "Tên chức năng đã được sử dụng."
            });
            return;
          }
        }

        $.ajax({
          type: "POST",
          url:
            "/update_chi_tiet_chuc_nang_by_id",
          contentType: "application/json",
          data: JSON.stringify({
            id: id,
            url: url,
            ten: ten.trim(),
            mota: mota,
            trangthai: trangthai
          }),
          success: function (data) {
            if (data.result == 1) {
              $("#modal_id").modal("hide");
              Toast.fire({
                icon: "success",
                title: "Cập nhật thành công",
              });
            } else {
              Toast.fire({
                icon: "warning",
                title: "Không thể cập nhật, vui lòng thử lại",
              });
            }
            bangdschucnang.ajax.reload(reloadMapping);
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

// Xoá chức năng
$("#bangdschucnang").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Bạn muốn xoá chức năng<br>" + MapIdTen[id],
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_xoa_chuc_nang?id=" + id,
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã xoá 1 chức năng",
            });
          } else {
            Toast.fire({
              icon: "warning",
              title: "Xóa không thành công, vui lòng thử lại"
            });
          }
          bangdschucnang.ajax.reload(reloadMapping);
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

// Hàm tách URL lấy đường dẫn tương đối
function getRelativePath(url) {
  try {
    // Biểu thức chính quy để kiểm tra ký tự hợp lệ trong URL
    const validURLRegex = /^[a-zA-Z0-9\-._:\/?@\!$&'()*+,;=]*$/;

    // Kiểm tra nếu chuỗi đầu vào đã là đường dẫn tương đối (bắt đầu bằng /)
    if (url.startsWith("/")) {
      var relativePath = url.split('?')[0]; // Loại bỏ phần query nếu có

      // Loại bỏ các dấu / liên tiếp
      relativePath = relativePath.replace(/\/+/g, '/');

      // Kiểm tra ký tự hợp lệ trong relativePath
      if (!validURLRegex.test(relativePath)) {
        throw new Error("Relative path contains invalid characters");
      }
      return relativePath;
    }

    // Kiểm tra nếu chuỗi đầu vào là một URL tuyệt đối hợp lệ
    var parsedURL = new URL(url);
    // Lấy đường dẫn pathname từ đối tượng URL
    var pathname = parsedURL.pathname;

    // Loại bỏ các dấu / liên tiếp
    pathname = pathname.replace(/\/+/g, '/');

    // Kiểm tra ký tự hợp lệ trong pathname
    if (!validURLRegex.test(pathname)) {
      throw new Error("Pathname contains invalid characters");
    }

    return pathname;
  } catch (e) {
    return null;
  }
}

// Modal thêm chức năng
$("#themchucnang_btn").click(function () {
  // Clear modal
  clear_modal();
  $("#modal_title").text("Thêm chức năng");
  html =
    `<div class="form-group"><label for="modal_url_input">URL</label>
    <input type="text" class="form-control" id="modal_url_input" placeholder="Nhập URL chức năng"></div>
    <div class="form-group"><label for="modal_tenchucnang_input">Tên chức năng</label>
    <input type="text" class="form-control" id="modal_tenchucnang_input" placeholder="Nhập tên chức năng"></div>
    <div class="form-group"><label for="modal_motachucnang_input">Mô tả</label>
    <textarea id="modal_motachucnang_input" rows="5" class="form-control" placeholder="Nhập mô tả chức năng"></textarea></div>
    <div class="form-check"><input type="checkbox" class="form-check-input" id="modal_hoatdong_check">
    <label class="form-check-label" for="modal_hoatdong_check">Khởi chạy chức năng</label></div>`;
  $("#modal_body").append(html);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $("#modal_submit_btn").click(function () {
    let url = getRelativePath($("#modal_url_input").val());
    let ten = $("#modal_tenchucnang_input").val();
    let mota = $("#modal_motachucnang_input")
      .val()
      .replace(/[\r\n]+/g, "<br>");
    let act = $("#modal_hoatdong_check").is(":checked");
    let trangthai = act ? 1 : 0;

    if (url == null) {
      Toast.fire({
        icon: "error",
        title: "Vui lòng thêm đường dẫn hợp lệ"
      });
      return;
    } else if (ten == null || ten.trim() == "") {
      Toast.fire({
        icon: "error",
        title: "Vui lòng điền tên chức năng"
      });
      return;
    } else { // Nếu đường dẫn hợp lệ
      // Lấy tất cả dữ liệu hiện tại trong bảng
      var allData = bangdschucnang.data().toArray();

      // Kiểm tra xem url đã tồn tại trong bảng chưa
      var existURL = allData.some(function (row) {
        return row.url.toLowerCase() === url.toLowerCase();
      });

      // Kiểm tra xem tên chức năng đã tồn tại trong bảng chưa
      var existTen = allData.some(function (row) {
        return row.ten.toLowerCase() === ten.toLowerCase();
      });

      if (existURL) {
        Toast.fire({
          icon: "error",
          title: "URL đã được thêm vào bảng."
        });
        return;
      } else if (existTen) {
        Toast.fire({
          icon: "error",
          title: "Tên chức năng đã được sử dụng."
        });
        return;
      }
      $.ajax({
        type: "POST",
        url:
          "/insert_chuc_nang",
        contentType: "application/json",
        data: JSON.stringify({
          id: -1,
          url: url,
          ten: ten.trim(),
          mota: mota,
          trangthai: trangthai
        }),
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã thêm " + ten + "<br>Trạng thái: " + (act ? "Đang sử dụng" : "Ngưng sử dụng"),
            });
          } else {
            Toast.fire({
              icon: "error",
              title: "Thêm chức năng không thành công",
            });
          }
          // Tải lại bảng chức năng
          bangdschucnang.ajax.reload(reloadMapping);
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
      $("#modal_id").modal("hide");
    }
  });
});

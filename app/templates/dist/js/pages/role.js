var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});


// Đối tượng ánh xạ giữa ID và tên vai trò
var MapIdTen = {};

// Mapping url - tên vai trò mỗi khi reload
function reloadMapping() {
  bangdsvaitro.data().toArray().forEach(function (row) {
    MapIdTen[row.idvaitro] = row.tenvaitro;
  });
}

let bangdsvaitro = $("#bangdsvaitro").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_all_vai_tro_chuc_nang",
    dataSrc: function (json) {
      // Nhóm dữ liệu theo idvaitro
      var groupedData = json.reduce((acc, item) => {
        if (!acc[item.idvaitro]) {
          acc[item.idvaitro] = {
            idvaitro: item.idvaitro,
            tenvaitro: item.tenvaitro,
            trangthai: item.trangthai,
            chucnangs: []
          };
        }
        // Chỉ thêm chức năng nếu không phải là null
        if (item.tenchucnang !== null) {
          acc[item.idvaitro].chucnangs.push(item.tenchucnang);
        }
        return acc;
      }, {});

      // Chuyển đổi dữ liệu đã nhóm thành mảng
      var result = Object.values(groupedData).map((role, index) => {
        return {
          stt: index + 1, // Số thứ tự
          idvaitro: role.idvaitro, // ID Vai Trò
          tenvaitro: role.tenvaitro, // Tên Vai Trò
          trangthai: role.trangthai, // Trạng Thái
          chucnangs: role.chucnangs.length > 0 ? role.chucnangs.map(chucnang => `<div>${chucnang}</div>`).join('') : '' // Gộp các tên chức năng hoặc để trống nếu null
        };
      });

      return result;
    }
  },
  columns: [
    { title: "#", data: "stt" }, // Cột số thứ tự
    { title: "Tên Vai Trò", data: "tenvaitro" },
    { title: "Chức Năng", data: "chucnangs" },
    {
      title: "Trạng Thái", data: "trangthai",
      render: function (data, type, row) {
        if (data == 1) {
          return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang sử dụng</span></center>';
        } else {
          return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Ngưng sử dụng</span></center>';
        }
      },
    },
    {
      title: "Thao tác",
      data: "idvaitro",
      render: function (data, type, row) {
        if (row.trangthai == 1) {
          return (
            '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
            data +
            '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-warning btn-sm" data-id="' +
            data +
            '" id="banBtn"><i class="fa-solid fa-user-slash"></i></a> <a class="btn btn-danger btn-sm" data-id="' +
            data +
            '" id="deleteBtn"><i class="fa-solid fa-trash"></i></a></center>'
          );
        } else {
          return (
            '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
            data +
            '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-success btn-sm" data-id="' +
            data +
            '" id="activeBtn"><i class="fa-solid fa-user-check"></i></a> <a class="btn btn-danger btn-sm" data-id="' +
            data +
            '" id="deleteBtn"><i class="fa-solid fa-trash"></i></a></center>'
          );
        }
      },
    }
  ],
  initComplete: function () {
    bangdsvaitro.data().toArray().forEach(function (row) {
      MapIdTen[row.idvaitro] = row.tenvaitro;
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
$("#bangdsvaitro").on("click", "#editBtn", function () {
  let id = $(this).data("id");
  clear_modal();

  $.ajax({
    type: "GET",
    url: "get_chi_tiet_vai_tro?idvt=" + id,
    success: function (res) {
      $("#modal_title").text("Chức năng " + res[0].tenvaitro);
      $("#modal_body").append(
        `<div class="form-group"><label for="modal_tenvaitro_input">Tên vai trò</label>
        <input type="text" class="form-control" id="modal_tenvaitro_input" placeholder="Nhập tên vai trò" value="${res[0].tenvaitro}"></div>
        <div class="form-group">
            <label>Chức năng</label>
            <select class="multiple-select" id="modal_chonchucnang" multiple="multiple" style="width: 100%;">
                <option disabled>-- Chọn các chức năng --</option>
            </select>
        </div>`
      );

      // Lấy mảng idchucnang
      var idchucnangArray = res.map(item => item.idchucnang);   // MAPPING ĐỂ KIỂM TRA CÁC CHỨC NĂNG NÀO ĐANG ĐƯỢC CHỌN CHO VAI TRÒ
      $.ajax({
        type: "GET",
        url: `get_all_chuc_nang`,
        success: function (ress) {
          $.each(ress, function (idx, val) {
            if (idchucnangArray.includes(val.id)) {
              $("#modal_chonchucnang").append(
                '<option selected value="' + val.id + '">' + val.ten + "</option>"
              );
            } else {
              $("#modal_chonchucnang").append(
                '<option value="' + val.id + '">' + val.ten + "</option>"
              );
            }
          });
        },
      });
      $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" data-id="' +
        res.idvaitro +
        '" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>'
      );
      $("#modal_id").modal("show");

      // Khởi tạo lại select2 cho các phần tử mới
      $(".multiple-select").select2({
        placeholder: "",
        allowClear: true,
        // dropdownParent: $('#modal_body'),
        theme: "bootstrap",
        tokenSeparators: [',', ' '],
        closeOnSelect: false,
      });

      // Tính năng lưu thay đổi
      $("#modal_submit_btn").click(function () {
        let ten = $('#modal_tenvaitro_input').val().trim();
        let selectedFunc = $('#modal_chonchucnang').val();

        if (ten == null || ten.trim() == "") {
          Toast.fire({
            icon: "error",
            title: "Vui lòng điền tên vai trò"
          });
          return;
        } else {
          // Lấy tất cả dữ liệu hiện tại trong bảng
          var allData = bangdsvaitro.data().toArray();

          // Kiểm tra xem tên vai trò đã tồn tại trong bảng chưa
          var existTen = allData.some(function (row) {
            return row.tenvaitro.toLowerCase() === ten.toLowerCase().trim() && ten.toLowerCase().trim() !== res[0].tenvaitro.toLowerCase();
          });

          if (existTen) {
            Toast.fire({
              icon: "error",
              title: "Tên vai trò này đã được sử dụng."
            });
            return;
          }
          $.ajax({
            type: "POST",
            url:
              "/update_vai_tro",
            contentType: "application/json",
            data: JSON.stringify({
              roleid: id,
              rolename: ten,
              func: selectedFunc
            }),
            success: function (res) {
              if (res.result == 1) {
                Toast.fire({
                  icon: "success",
                  title: "Đã cập nhật tên vai trò!",
                });
              }
              else if (res.result == 3) {
                Toast.fire({
                  icon: "success",
                  title: "Cập nhật vai trò thành công!",
                });
              }
              else if (res.result == -1) {
                Toast.fire({
                  icon: "error",
                  title: "Update tên không thành công, vui lòng kiểm tra lại",
                });
              }
              else if (res.result == -2) {
                Toast.fire({
                  icon: "warning",
                  title: "Update chức năng cho vai trò chưa thành công",
                });
              } else {
                Toast.fire({
                  icon: "error",
                  title: "Sửa vai trò không thành công",
                });
              }
              // Tải lại bảng chức năng
              bangdsvaitro.ajax.reload(reloadMapping);
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
    },
  });
});

// Ngưng sử dụng vai trò
$("#bangdsvaitro").on("click", "#banBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Ngưng sử dụng vai trò<br>" + MapIdTen[id],
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_trang_thai_vai_tro?idvt=" + id + "&trangthai=0",
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã ngưng sử dụng vai trò<br>" + MapIdTen[id],
            });
          }
          else if (res.result == -1) {
            Toast.fire({
              icon: "warning",
              title: "Không thể ngưng sử dụng Quản trị!",
            });
          }
          else {
            Toast.fire({
              icon: "warning",
              title: "Thực hiện không thành công, vui lòng thử lại"
            });
          }
          bangdsvaitro.ajax.reload(reloadMapping);
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
    }
  });
});


// Sử dụng vai trò
$("#bangdsvaitro").on("click", "#activeBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Sử dụng vai trò<br>" + MapIdTen[id],
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Sử dụng",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_trang_thai_vai_tro?idvt=" + id + "&trangthai=1",
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã sử dụng vai trò<br>" + MapIdTen[id],
            });
          } else {
            Toast.fire({
              icon: "warning",
              title: "Thực hiện không thành công, vui lòng thử lại"
            });
          }
          bangdsvaitro.ajax.reload(reloadMapping);
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
    }
  });
});


// Xóa vai trò
$("#bangdsvaitro").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Xóa vai trò<br>" + MapIdTen[id],
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "delete_vai_tro?idvt=" + id,
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã xóa vai trò<br>" + MapIdTen[id],
            });
          } else if (res.result == 2) {
            Toast.fire({
              icon: "warning",
              title: "Không thể xóa vai trò Quản trị!",
            });
          }
          else {
            Toast.fire({
              icon: "error",
              title: "Thực hiện không thành công, vui lòng thử lại"
            });
          }
          bangdsvaitro.ajax.reload(reloadMapping);
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
    }
  });
});


// Modal thêm vai trò
$("#themvaitro_btn").click(function () {
  // Clear modal
  clear_modal();
  $("#modal_title").text("Thêm chức năng");
  html =
    `<div class="form-group"><label for="modal_tenvaitro_input">Tên vai trò</label>
    <input type="text" class="form-control" id="modal_tenvaitro_input" placeholder="Nhập tên vai trò"></div>
    
    <div class="form-group">
        <label>Chức năng</label>
        <select class="multiple-select" id="modal_chonchucnang_input" multiple="multiple" style="width: 100%;">
            <option disabled>-- Chọn các chức năng --</option>
        </select>
    </div>`;

  $.ajax({
    type: "GET",
    url: `get_all_chuc_nang`,
    success: function (res) {
      $.each(res, function (idx, val) {
        $("#modal_chonchucnang_input").append(
          '<option value="' + val.id + '">' + val.ten + "</option>"
        );
      });
    },
  });

  $("#modal_body").append(html);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");
  // Khởi tạo lại select2 cho các phần tử mới
  $(".multiple-select").select2({
    placeholder: "",
    allowClear: true,
    // dropdownParent: $('#modal_body'),
    theme: "bootstrap",
    tokenSeparators: [',', ' '],
    closeOnSelect: false,
  });

  $("#modal_submit_btn").click(function () {
    let ten = $("#modal_tenvaitro_input").val();
    let selectedFunc = $('#modal_chonchucnang_input').val();

    if (ten == null || ten.trim() == "") {
      Toast.fire({
        icon: "error",
        title: "Vui lòng điền tên vai trò"
      });
      return;
    } else {
      // Lấy tất cả dữ liệu hiện tại trong bảng
      var allData = bangdsvaitro.data().toArray();

      // Kiểm tra xem tên vai trò đã tồn tại trong bảng chưa
      var existTen = allData.some(function (row) {
        return row.tenvaitro.toLowerCase() === ten.toLowerCase().trim();
      });

      if (existTen) {
        Toast.fire({
          icon: "error",
          title: "Tên vai trò này đã được sử dụng."
        });
        return;
      }
      $.ajax({
        type: "POST",
        url:
          "/insert_vai_tro",
        contentType: "application/json",
        data: JSON.stringify({
          roleid: 999,
          rolename: ten,
          func: selectedFunc
        }),
        success: function (res) {
          if (res.result == 1) {
            Toast.fire({
              icon: "success",
              title: "Đã thêm vai trò<br>" + ten,
            });
          }
          else if (res.result == -1) {
            Toast.fire({
              icon: "error",
              title: "Lỗi khi thêm vai trò, vui lòng kiểm tra lại",
            });
          }
          else if (res.result == -2) {
            Toast.fire({
              icon: "warning",
              title: "Thêm chức năng cho vai trò chưa thành công",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: "Thêm vai trò không thành công",
            });
          }
          // Tải lại bảng chức năng
          bangdsvaitro.ajax.reload(reloadMapping);
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

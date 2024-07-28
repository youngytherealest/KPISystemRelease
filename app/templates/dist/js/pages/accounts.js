var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// Khởi tạo Map
let roleStatusMap = new Map();

$(document).ready(function () { //LẤY USERNAME TỪ COOKIE
  let c = document.cookie.split(";");
  let username = "";
  c.forEach(function (val) {
    if (val.includes("username=")) {
      username = val.split("username=")[1];
    }
  });
  // console.log(username);
});


let bangdstaikhoan = $("#bangdstaikhoan").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "get_ds_tai_khoan",
    dataSrc: function (json) {
      // Nhóm dữ liệu theo idnguoihuongdan
      var groupedData = json.reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = {
            id: item.id,
            hoten: item.hoten,
            username: item.username,
            email: item.email,
            roles: [],
            trangthai: item.trangthai,
            rolenames: []
          };
        }
        // Chỉ thêm role nếu không phải là null
        if (item.role !== null) {
          acc[item.id].roles.push(item.role);
          acc[item.id].rolenames.push(item.tenvaitro);
        }
        return acc;
      }, {});

      // Chuyển đổi dữ liệu đã nhóm thành mảng
      var result = Object.values(groupedData).map((user, index) => {
        return {
          stt: index + 1, // Số thứ tự
          id: user.id, // ID User
          hoten: user.hoten,
          username: user.username,
          email: user.email,
          roles: user.roles,
          trangthai: user.trangthai,
          rolenames: user.rolenames
        };
      });

      return result;
    }
  },
  columns: [
    { title: "#", data: "stt" }, // Cột số thứ tự
    { title: "Họ tên", data: "hoten" },
    { title: "Tài khoản", data: "username" },
    { title: "Email", data: "email" },
    {
      title: "Role", data: "rolenames",
      render: function (data, type, row) {
        if (row.id == 1) {  // CHECK SUPERVISOR ROLE (UID = 1)
          return `<center><span class="badge badge-danger"><i class="fa-solid"></i> Supervisor </span></center>`;
        }
        else {
          return `<center>
        ${data.filter(function (r) {
            return r !== null;
          }).map(function (r) {
            if (r === "Quản trị") {
              return `<span class="badge badge-success"><i class="fa-solid"></i> ${r} </span>`;
            }
            else {
              return `<span class="badge badge-light"><i class="fa-solid"></i> ${r} </span>`;
            }
          }).join('<br>')}
        </center>`;
        }

      },
    },
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
      data: "id",
      render: function (data, type, row) {
        if (row.trangthai == 1) {
          return `<center>
            <a class="btn btn-secondary btn-sm" id="resetBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Reset mật khẩu">
              <i class="fa-solid fa-key"></i>
            </a>
            <a class="btn btn-info btn-sm" id="editBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Sửa thông tin">
              <i class="fa-solid fa-pencil-alt"></i>
            </a>
            <a class="btn btn-primary btn-sm" id="roleBtn" data-id="${data}" data-roles='${JSON.stringify(row.roles)}' data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Phân quyền">
              <i class="fa-solid fa-pen-ruler"></i>
            </a>
            <a class="btn btn-warning btn-sm" id="banBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Ngưng sử dụng">
              <i class="fa-solid fa-user-slash"></i>
            </a>
            <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xoá người dùng">
              <i class="fa-solid fa-trash"></i>
            </a>
          </center>`;
        } else {
          return `
          <center>
            <a class="btn btn-success btn-sm" id="activeBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Ngưng sử dụng">
              <i class="fa-solid fa-user-check"></i>
            </a>
            <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xoá người dùng">
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

// Xoá người dùng
$("#bangdstaikhoan").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận xoá người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `update_xoa_nguoi_huong_dan_by_id?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Xoá người dùng thành công.`,
            });
            bangdstaikhoan.ajax.reload();
          } else if (res.status == "EXISTS") {
            Toast.fire({
              icon: "warning",
              title:
                "Người dùng đang hướng dẫn nhóm. Vui lòng chọn Ngừng sử dụng.",
            });
          }
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: `Xoá người dùng thất bại.`,
          });
        },
      });
    }
  });
});

// Ban người dùng
$("#bangdstaikhoan").on("click", "#banBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận ngưng sử dụng người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Ngưng",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `update_ban_nguoi_huong_dan_by_id?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Đã ngưng người dùng`,
            });
            bangdstaikhoan.ajax.reload();
          } else if (res.status == "IS_ADMIN") {
            Toast.fire({
              icon: "warning",
              title: "Người dùng đang là Quản trị viên.",
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

// Active người dùng
$("#bangdstaikhoan").on("click", "#activeBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận kích hoạt người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Kích hoạt",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `update_active_nguoi_huong_dan_by_id?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Đã kích hoạt người dùng.`,
            });
            bangdstaikhoan.ajax.reload();
          } else if (res.status == "NOT_BANNED") {
            Toast.fire({
              icon: "warning",
              title: "Người dùng đang hoạt động.",
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

// Reset mật khẩu người dùng
$("#bangdstaikhoan").on("click", "#resetBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: `Xác nhận reset mật khẩu người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Reset",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: `POST`,
        url: `reset_password?id=${id}`,
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: `Đã reset mật khẩu người dùng.`,
            });
            bangdstaikhoan.ajax.reload();
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

// Cập nhật quyền người dùng
$("#bangdstaikhoan").on("click", "#roleBtn", function () {
  let id = $(this).data("id");
  let current_roles = $(this).attr("data-roles"); // Lấy chuỗi JSON từ thuộc tính
  try {
    current_roles = JSON.parse(current_roles); // Chuyển đổi chuỗi JSON thành mảng
  } catch (e) {
    console.error("JSON parse error: ", e);
  }  // MAPPING ĐỂ KIỂM TRA CÁC CHỨC NĂNG NÀO ĐANG ĐƯỢC CHỌN CHO VAI TRÒ

  clear_modal();

  $("#modal_title").text(`Phân quyền người dùng`);
  $("#modal_body").html(`
    <div class="form-group">
      <label for="modal_role_select">Phân quyền</label>
      <select id="modal_role_select" class="form-control multiple-select"  multiple="multiple>
        <option disabled value="-1">-- Chọn các vai trò --</option>
      </select>
    </div>
  `);
  $.ajax({
    type: "GET",
    url: `get_all_vai_tro`,
    success: function (ress) {
      $.each(ress, function (idx, val) {
        if (current_roles.includes(val.id)) {            // CHỈ HIỂN THỊ CÁC VAI TRÒ ĐANG SỬ DỤNG
          $("#modal_role_select").append(
            '<option selected value="' + val.id + '">' + val.tenvaitro + "</option>"
          );
        } else {
          $("#modal_role_select").append(
            '<option value="' + val.id + '">' + val.tenvaitro + "</option>"
          );
        }
      });
    },
  });
  $("#modal_footer").append(
    `<button type="button" class="btn btn-primary" data-id="${id}" id="modal_submit_btn">
      <i class="fa-solid fa-floppy-disk"></i> 
      Lưu thay đổi
    </button>`
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

  $("#modal_submit_btn").on("click", function () {
    role = $("#modal_role_select").val()
    if (role.length == 0) {
      Toast.fire({
        icon: "warning",
        title: `Vui lòng chọn vai trò`,
      });
      return;
    }
    $.ajax({
      type: `POST`,
      url: `update_phan_quyen_nguoi_huong_dan_by_id`,
      contentType: "application/json",
      data: JSON.stringify({
        userid: id,
        roles: role
      }),
      success: function (res) {
        if (res.result == 1) {
          Toast.fire({
            icon: "success",
            title: `Đã phân quyền người dùng.`,
          });
        }
        else if (res.result == -1) {
          Toast.fire({
            icon: "error",
            title: `Thêm phân quyền không thành công`,
          });
        }
        else if (res.result == -2) {
          Toast.fire({
            icon: "error",
            title: `Gỡ phân quyền không thành công`,
          });
        }
        else if (res.result == -3) {
          Toast.fire({
            icon: "error",
            title: `Cập nhật phân quyền không thành công`,
          });
        }
        $("#modal_id").modal("hide");
        bangdstaikhoan.ajax.reload();
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
        });
      },
    });
  });
});

// Cập nhật thông tin người dùng
$("#bangdstaikhoan").on("click", "#editBtn", function () {
  let id = $(this).data("id");

  clear_modal();

  $("#modal_title").text(`Chỉnh sửa thông tin người dùng`);
  $("#modal_body").html(`
    <div class="form-group">
      <label for="modal_hoten_input">Họ tên</label>
      <input type="text" class="form-control" id="modal_hoten_input" required />
    </div>
    <div class="form-group">
      <label for="modal_email_input">Email</label>
      <input type="email" class="form-control" id="modal_email_input" required />
    </div>
    <div class="form-group">
      <label for="modal_sdt_input">Số điện thoại</label>
      <input type="number" class="form-control" id="modal_sdt_input" required />
    </div>
    <div class="form-group">
      <label for="modal_chucdanh_select">Chức danh</label>
      <select id="modal_chucdanh_select" class="form-control">
        <option value="Nhân viên">Nhân viên</option>
        <option value="Phó phòng">Phó phòng</option>
        <option value="Trưởng phòng">Trưởng phòng</option>
      </select>
    </div>
    <div class="form-group">
      <label for="modal_phong_select">Phòng</label>
      <select id="modal_phong_select" class="form-control">
        <option value="Phòng GP CNTT 1">Phòng GP CNTT 1</option>
        <option value="Phòng GP CNTT 2">Phòng GP CNTT 2</option>
        <option value="Phòng KD">Phòng KD</option>
      </select>
    </div>
    <div class="form-group">
      <label for="modal_zalo_input">Zalo</label>
      <input type="text" class="form-control" id="modal_zalo_input" />
    </div>
    <div class="form-group">
      <label for="modal_facebook_input">Facebook</label>
      <input type="text" class="form-control" id="modal_facebook_input" />
    </div>
    <div class="form-group">
      <label for="modal_github_input">Github</label>
      <input type="text" class="form-control" id="modal_github_input" />
    </div>
    <div class="form-group">
      <label for="modal_avatar_input">Avatar</label>
      <input type="text" class="form-control" id="modal_avatar_input" />
    </div>
  `);
  $("#modal_footer").append(
    `<button type="button" class="btn btn-primary" data-id="${id}" id="modal_submit_btn">
      <i class="fa-solid fa-floppy-disk"></i> 
      Lưu thay đổi
    </button>`
  );

  $("#modal_id").modal("show");

  let hoten = $("#modal_hoten_input");
  let email = $("#modal_email_input");
  let sdt = $("#modal_sdt_input");
  let chucdanh = $("#modal_chucdanh_select");
  let phong = $("#modal_phong_select");
  let zalo = $("#modal_zalo_input");
  let facebook = $("#modal_facebook_input");
  let github = $("#modal_github_input");
  let avatar = $("#modal_avatar_input");

  // Load chi tiết
  $.ajax({
    type: `GET`,
    url: `get_thong_tin_nguoi_huong_dan_by_id?id=${id}`,
    success: function (res) {
      hoten.val(res.hoten);
      email.val(res.email);
      sdt.val(res.sdt);
      chucdanh.val(res.chucdanh);
      phong.val(res.phong);
      zalo.val(res.zalo);
      facebook.val(res.facebook);
      github.val(res.github);
      avatar.val(res.avatar);
    },
  });

  $("#modal_submit_btn").on("click", function () {
    $.ajax({
      type: `POST`,
      url: `update_chi_tiet_tai_khoan_by_id?id=${id}&hoten=${hoten.val()}&email=${email.val()}&sdt=${sdt.val()}&chucdanh=${chucdanh.val()}&phong=${phong.val()}&zalo=${zalo.val()}&facebook=${facebook.val()}&github=${github.val()}&avatar=${avatar.val()}`,
      success: function (res) {
        if (res.status == "OK") {
          Toast.fire({
            icon: "success",
            title: `Đã cập nhật thông tin.`,
          });
          $("#modal_id").modal("hide");
          bangdstaikhoan.ajax.reload();
        }
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
        });
      },
    });
  });
});

// Tạo thông tin người dùng
$("#taoTaiKhoanBtn").on("click", function () {
  clear_modal();

  $("#modal_title").text(`Tạo người dùng`);
  $("#modal_body").html(`
    <div class="form-group">
      <label for="modal_hoten_input">Họ tên</label>
      <input type="text" class="form-control" id="modal_hoten_input" required />
    </div>
    <div class="form-group">
      <label for="modal_username_input">Username</label>
      <input type="text" class="form-control" id="modal_username_input" required />
    </div>
    <div class="form-group">
      <label for="modal_email_input">Email</label>
      <input type="email" class="form-control" id="modal_email_input" required />
    </div>
    <div class="form-group">
      <label for="modal_sdt_input">Số điện thoại</label>
      <input type="number" class="form-control" id="modal_sdt_input" required />
    </div>
    <div class="form-group">
      <label for="modal_chucdanh_select">Chức danh</label>
      <select id="modal_chucdanh_select" class="form-control">
        <option value="Nhân viên">Nhân viên</option>
        <option value="Phó phòng">Phó phòng</option>
        <option value="Trưởng phòng">Trưởng phòng</option>
      </select>
    </div>
    <div class="form-group">
      <label for="modal_phong_select">Phòng</label>
      <select id="modal_phong_select" class="form-control">
        <option value="Phòng GP CNTT 1">Phòng GP CNTT 1</option>
        <option value="Phòng GP CNTT 2">Phòng GP CNTT 2</option>
        <option value="Phòng KD">Phòng KD</option>
      </select>
    </div>
    <div class="form-group">
      <label for="modal_zalo_input">Zalo</label>
      <input type="text" class="form-control" id="modal_zalo_input" />
    </div>
    <div class="form-group">
      <label for="modal_facebook_input">Facebook</label>
      <input type="text" class="form-control" id="modal_facebook_input" />
    </div>
    <div class="form-group">
      <label for="modal_github_input">Github</label>
      <input type="text" class="form-control" id="modal_github_input" />
    </div>
    <div class="form-group">
      <label for="modal_avatar_input">Avatar</label>
      <input type="text" class="form-control" id="modal_avatar_input" />
    </div>
  `);
  $("#modal_footer").append(
    `<button type="button" class="btn btn-primary" id="modal_submit_btn">
      <i class="fa-solid fa-floppy-disk"></i> 
      Thêm
    </button>`
  );

  $("#modal_id").modal("show");

  let hoten = $("#modal_hoten_input");
  let username = $("#modal_username_input");
  let email = $("#modal_email_input");
  let sdt = $("#modal_sdt_input");
  let chucdanh = $("#modal_chucdanh_select");
  let phong = $("#modal_phong_select");
  let zalo = $("#modal_zalo_input");
  let facebook = $("#modal_facebook_input");
  let github = $("#modal_github_input");
  let avatar = $("#modal_avatar_input");

  $("#modal_submit_btn").on("click", function () {
    $.ajax({
      type: `POST`,
      url: `them_nguoi_huong_dan?hoten=${hoten.val()}&email=${email.val()}&sdt=${sdt.val()}&chucdanh=${chucdanh.val()}&phong=${phong.val()}&username=${username.val()}&zalo=${zalo.val()}&facebook=${facebook.val()}&github=${github.val()}&avatar=${avatar.val()}`,
      success: function (res) {
        if (res.status == "OK") {
          Toast.fire({
            icon: "success",
            title: `Đã thêm người hướng dẫn.`,
          });
          $("#modal_id").modal("hide");
          bangdstaikhoan.ajax.reload();
        } else {
          Toast.fire({
            icon: "error",
            title: `Username đã tồn tại, vui lòng chọn username khác.`,
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
  });
});

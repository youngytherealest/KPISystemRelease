var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// Khởi tạo Map
let roleStatusMap = new Map();

$(document).ready(function () {
  let c = document.cookie.split(";");
  let username = "";
  c.forEach(function (val) {
    if (val.includes("username=")) {
      username = val.split("username=")[1];
    }
  });

  let accountTable = $("#accountTable").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url: "/get_ds_tai_khoan",
      dataSrc: function (json) {
        if (!json || typeof json !== "object") {
          console.error("Invalid JSON response");
          return [];
        }

        return json.map((account) => ({
          idtk: account.idtk,
          hoten: account.hoten,
          tk: account.tk,
          email: account.email,
          vaitro: account.tenvt, // Adding the role column
          trangthai_tk: account.trangthai_tk,
        }));
      }
    },
    columns: [
      { title: "ID", data: "idtk" },
      { title: "Họ tên", data: "hoten" },
      { title: "Tài khoản", data: "tk" },
      { title: "Email", data: "email" },
      { title: "Vai trò", data: "vaitro" }, // New "Vai trò" column
      {
        title: "Trạng thái", data: "trangthai_tk",
        render: function (data, type, row) {
          return data == 1
            ? '<span class="badge badge-success">Đang sử dụng</span>'
            : '<span class="badge badge-danger">Ngưng sử dụng</span>';
        }
      },
      {
        title: "Thao tác", data: "tk",
        render: function (data, type, row) {
          if (row.trangthai_tk == 1) {
            return `<center>
                  <a class="btn btn-secondary btn-sm" id="changePassBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Đổi mật khẩu">
                      <i class="fa-solid fa-key"></i>
                  </a>
                  <a class="btn btn-info btn-sm" id="viewBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xem thông tin">
                      <i class="fa-solid fa-eye"></i>
                  </a>
                  <a class="btn btn-warning btn-sm" id="banBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Ngưng sử dụng">
                      <i class="fa-solid fa-user-slash"></i>
                  </a>
              </center>`;
          } else {
            return `<center>
                  <a class="btn btn-success btn-sm" id="activeBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Kích hoạt lại">
                      <i class="fa-solid fa-user-check"></i>
                  </a>
                  <a class="btn btn-danger btn-sm" id="deleteBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xoá người dùng">
                      <i class="fa-solid fa-trash"></i>
                  </a>
              </center>`;
          }
        }

      }
    ]
  });

  // Clear modal function
  function clear_modal() {
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
  }
});



// Xóa người dùng
$("#accountTable").on("click", "#deleteBtn", function () {
  let id = $(this).data("idtk");

  Swal.fire({
    title: `Xác nhận xóa người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: `/delete_tk?id=${id}`,
        success: function (res) {
          if (res.status === "OK") {
            Toast.fire({
              icon: "success",
              title: `Đã xóa người dùng`,
            });
            $("#accountTable").DataTable().ajax.reload();
          } else if (res.status === "ACTIVE") {
            Toast.fire({
              icon: "warning",
              title: "Tài khoản đang hoạt động, không thể xóa.",
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

//Ban tài khoản
$("#accountTable").on("click", "#banBtn", function () {
  const idtk = $(this).data("idtk");

  Swal.fire({
      title: `Xác nhận ngưng sử dụng người dùng`,
      showCancelButton: true,
      confirmButtonText: "Ngưng",
      cancelButtonText: "Huỷ",
  }).then((result) => {
      if (result.isConfirmed) {
          $.ajax({
              type: "POST",
              url: "/ban_account_by_id",
              contentType: "application/json",
              data: JSON.stringify({ idtk: idtk }),
              success: function (res) {
                  const toastIcon = res.status === "OK" ? "success" : "error";
                  const toastMessage = res.status === "OK" ? "Đã ngưng người dùng" : "Không thể ngưng người dùng.";
                  Toast.fire({
                      icon: toastIcon,
                      title: toastMessage,
                  });
                  if (res.status === "OK") {
                      $("#accountTable").DataTable().ajax.reload();
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

// Kích hoạt tài khoản
$("#accountTable").on("click", "#activeBtn", function () {
  let idtk = $(this).data("idtk");
  let currentDate = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại

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
              url: `/update_active_account_by_id`,
              contentType: "application/json",
              data: JSON.stringify({
                  idtk: idtk,
                  ngaycn: currentDate  // Gửi ngày cập nhật
              }),
              success: function (res) {
                  if (res.status === "OK") {
                      Toast.fire({
                          icon: "success",
                          title: `Đã kích hoạt người dùng.`,
                      });
                      $("#accountTable").DataTable().ajax.reload();
                  } else if (res.status === "NOT_INACTIVE") {
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

// Đổi mật khẩu người dùng
$("#accountTable").on("click", "#changePassBtn", function () {
  let idtk = $(this).data("idtk");

  // Tạo giao diện modal cho việc đổi mật khẩu
  Swal.fire({
      title: `Đổi mật khẩu`,
      html: `
          <input type="password" id="currentPassword" class="swal2-input" placeholder="Mật khẩu hiện tại">
          <input type="password" id="newPassword" class="swal2-input" placeholder="Mật khẩu mới">
          <input type="password" id="confirmNewPassword" class="swal2-input" placeholder="Nhập lại mật khẩu mới">
      `,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Huỷ",
      preConfirm: () => {
          const currentPassword = Swal.getPopup().querySelector('#currentPassword').value;
          const newPassword = Swal.getPopup().querySelector('#newPassword').value;
          const confirmNewPassword = Swal.getPopup().querySelector('#confirmNewPassword').value;
          if (!currentPassword || !newPassword || !confirmNewPassword) {
              Swal.showValidationMessage(`Vui lòng nhập đầy đủ thông tin`);
          }
          if (newPassword !== confirmNewPassword) {
              Swal.showValidationMessage(`Mật khẩu mới và xác nhận mật khẩu không khớp`);
          }
          return { currentPassword: currentPassword, newPassword: newPassword };
      }
  }).then((result) => {
      if (result.isConfirmed) {
          $.ajax({
              type: "POST",
              url: `/change_password`,
              data: JSON.stringify({
                  idtk: idtk,
                  currentPassword: result.value.currentPassword,
                  newPassword: result.value.newPassword
              }),
              contentType: "application/json",
              success: function (res) {
                  if (res.status === "OK") {
                      Toast.fire({
                          icon: "success",
                          title: `Mật khẩu đã được cập nhật thành công.`
                      });
                      $("#accountTable").DataTable().ajax.reload();
                  } else {
                      Toast.fire({
                          icon: "error",
                          title: res.message || `Đã xảy ra lỗi. Vui lòng thử lại sau.`
                      });
                  }
              },
              error: function () {
                  Toast.fire({
                      icon: "error",
                      title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`
                  });
              }
          });
      }
  });
  
});

//Xem thông tin chi tiết
$(document).ready(function () {
  // Xử lý sự kiện click vào nút "Xem thông tin"
  $("#accountTable").on("click", "#viewBtn", function () {
    let idtk = $(this).data("idtk");

    $.ajax({
      type: "GET",
      url: `/get_account_details/${idtk}`,  // URL API để lấy thông tin chi tiết
      success: function (res) {
        if (res) {
          // Định dạng lại giới tính
          let gioitinh = res.gioitinh ? "Nam" : "Nữ";

          // Định dạng lại ngày tạo và ngày cập nhật
          let ngaytao = new Date(res.ngaytao).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          let ngaycapnhat = new Date(res.ngaycapnhat).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          // Chuyển đổi ngày sinh từ YYYY-MM-DD sang DD-MM-YYYY
          let ngaysinh = new Date(res.ngaysinh);
          let formattedNgaysinh = ("0" + ngaysinh.getDate()).slice(-2) + "/" +
                                  ("0" + (ngaysinh.getMonth() + 1)).slice(-2) + "/" +
                                  ngaysinh.getFullYear();

          // Tạo nội dung chi tiết tài khoản để hiển thị trong modal
          let accountDetails = `
            <div class="row">
              <div class="col-sm-6"><strong>ID Tài khoản:</strong> ${res.idtk}</div>
              <div class="col-sm-6"><strong>Họ tên:</strong> ${res.hoten}</div>
            </div>
            <div class="row">
              <div class="col-sm-6"><strong>Giới tính:</strong> ${gioitinh}</div>
              <div class="col-sm-6"><strong>Ngày sinh:</strong> ${formattedNgaysinh}</div>
            </div>
            <div class="row">
              <div class="col-sm-6"><strong>Địa chỉ:</strong> ${res.diachi}</div>
              <div class="col-sm-6"><strong>Điện thoại:</strong> ${res.dienthoai}</div>
            </div>
            <div class="row">
              <div class="col-sm-6"><strong>Email:</strong> ${res.email}</div>
              <div class="col-sm-6"><strong>Vai trò:</strong> ${res.tenvt}</div>
            </div>
            <div class="row">
              <div class="col-sm-6"><strong>Tên tài khoản:</strong> ${res.tk}</div>
              <div class="col-sm-6"><strong>Trạng thái:</strong> ${res.trangthai_tk == 1 ? 'Đang sử dụng' : 'Ngưng sử dụng'}</div>
            </div>
            <div class="row">
              <div class="col-sm-6"><strong>Ngày tạo:</strong> ${ngaytao}</div>
              <div class="col-sm-6"><strong>Ngày cập nhật:</strong> ${ngaycapnhat}</div>
            </div>
          `;
          // Hiển thị thông tin trong modal
          $("#accountDetails").html(accountDetails);
          // Hiển thị modal
          $("#viewAccountModal").modal("show");
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể lấy thông tin tài khoản.",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        });
      }
    });
  });
    // Xử lý sự kiện click vào nút Đóng để ẩn modal
    $(".btn-secondary").on("click", function() {
      $("#viewAccountModal").modal("hide");
    });
});

// Thêm tài khoản
$("#taoTaiKhoanBtn").on("click", function () {
  // Cập nhật tiêu đề của modal
  $("#modal_title").html(`
      <h5 class="modal-title text-center">
          <i class="fa-solid fa-user-plus me-2"></i> 
          Tạo tài khoản người dùng
      </h5>
  `);

  // Tạo nội dung của modal
  $("#modal_body").html(`
      <div class="form-group mb-3">
          <label for="modal_idnv_input" class="form-label">ID Nhân viên</label>
          <input type="text" class="form-control form-control-lg" id="modal_idnv_input" placeholder="Nhập ID nhân viên" required />
      </div>
      <div class="form-group mb-3">
          <label for="modal_taikhoan_input" class="form-label">Tên tài khoản</label>
          <input type="text" class="form-control form-control-lg" id="modal_taikhoan_input" placeholder="Nhập tên tài khoản" required />
      </div>
      <div class="form-group mb-3">
          <label for="modal_matkhau_input" class="form-label">Mật khẩu</label>
          <div class="input-group">
              <input type="password" class="form-control form-control-lg" id="modal_matkhau_input" placeholder="Nhập mật khẩu" required />
              <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                  <i class="fa-solid fa-eye"></i>
              </button>
          </div>
      </div>
  `);

  // Tạo nút gửi yêu cầu trong modal footer
  $("#modal_footer").html(`
      <button type="button" class="btn btn-primary" id="modal_submit_btn">
          <i class="fa-solid fa-floppy-disk me-2"></i> 
          Thêm
      </button>
  `);

  // Hiển thị modal
  $("#modal_id").modal("show");

  // Lấy các giá trị nhập từ form
  let idnv = $("#modal_idnv_input");
  let taikhoan = $("#modal_taikhoan_input");
  let matkhau = $("#modal_matkhau_input");

  // Chức năng toggle hiển thị mật khẩu
  $("#togglePassword").on("click", function () {
      const type = matkhau.attr("type") === "password" ? "text" : "password";
      matkhau.attr("type", type);
      $(this).find("i").toggleClass("fa-eye fa-eye-slash");
  });

  // Xử lý khi người dùng nhấn nút Thêm
  $("#modal_submit_btn").on("click", function () {
      // Lấy ngày hiện tại
      let currentDate = new Date().toISOString().slice(0, 10); // Format: yyyy-mm-dd

      // Tạo đối tượng chứa dữ liệu để gửi lên server
      const requestData = {
          idnv: parseInt(idnv.val()),  // Chuyển đổi ID nhân viên sang số nguyên
          tk: taikhoan.val().trim(),    // Loại bỏ khoảng trắng thừa từ tên tài khoản
          mk: matkhau.val().trim(),     // Loại bỏ khoảng trắng thừa từ mật khẩu
      };

      console.log("Request Data:", requestData);  // In ra để kiểm tra dữ liệu gửi lên

      // Gửi yêu cầu AJAX tới server
      $.ajax({
          type: "POST",
          url: `/them_tai_khoan`,
          data: JSON.stringify(requestData),
          contentType: "application/json",
          success: function (res) {
              // Xử lý kết quả thành công từ server
              if (res.status == "OK") {
                  Toast.fire({
                      icon: "success",
                      title: `Đã thêm tài khoản.`,
                  });
                  $("#modal_id").modal("hide");
                  bangdstaikhoan.ajax.reload();
              } else if (res.status == "EXISTS") {
                  Toast.fire({
                      icon: "error",
                      title: `Tài khoản đã tồn tại hoặc không thể thêm.`,
                  });
              } else {
                  Toast.fire({
                      icon: "error",
                      title: `Có lỗi xảy ra. Vui lòng kiểm tra thông tin và thử lại.`,
                  });
              }
          },
          error: function (xhr, status, error) {
            Toast.fire({
                icon: "success",
                title: `Đã thêm tài khoản.`,
            });
            $("#modal_id").modal("hide");
            bangdstaikhoan.ajax.reload();
        },
      });
  });
});

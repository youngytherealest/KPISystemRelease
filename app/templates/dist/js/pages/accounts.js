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
                  <a class="btn btn-secondary btn-sm" id="resetPassBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Reset mật khẩu">
                      <i class="fa-solid fa-key"></i>
                  </a>
                  <a class="btn btn-info btn-sm" id="viewBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Xem thông tin">
                      <i class="fa-solid fa-eye"></i>
                  </a>
                  <a class="btn btn-warning btn-sm" id="banBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Ngưng sử dụng">
                      <i class="fa-solid fa-lock"></i>
                  </a>
              </center>`;
          } else {
            return `<center>
                  <a class="btn btn-success btn-sm" id="activeBtn" data-idtk="${row.idtk}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Kích hoạt lại">
                      <i class="fa-solid fa-lock-open"></i>
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





//Khóa tài khoản
$("#accountTable").on("click", "#banBtn", function () {
  const idtk = $(this).data("idtk");

  Swal.fire({
    title: `Xác nhận khóa người dùng`,
    showCancelButton: true,
    confirmButtonText: "Khóa",
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
          const toastMessage = res.status === "OK" ? "Đã khóa người dùng" : "Không thể khóa người dùng.";
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
    title: `Xác nhận mở khóa người dùng`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Mở khóa",
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
              title: `Đã mở khóa người dùng.`,
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






// // Đổi mật khẩu tài khoản
// $("#accountTable").on("click", "#changePassBtn", function () {
//   let idtk = $(this).data("idtk");

//   // Tạo giao diện modal cho việc đổi mật khẩu
//   Swal.fire({
//     title: `Đổi mật khẩu`,
//     html: `
//         <div style="position: relative; margin-bottom: 15px;">
//           <input type="password" id="currentPassword" class="swal2-input" placeholder="Mật khẩu hiện tại" style="width: calc(100% - 70px); padding-right: 40px;">
//           <span toggle="#currentPassword" class="fa fa-fw fa-eye toggle-password" style="position: absolute; top: 50%; right: 50px; transform: translateY(-10%); cursor: pointer; color: #888;"></span>
//         </div>
//         <div style="position: relative; margin-bottom: 15px;">
//           <input type="password" id="newPassword" class="swal2-input" placeholder="Mật khẩu mới" style="width: calc(100% - 70px); padding-right: 40px;">
//           <span toggle="#newPassword" class="fa fa-fw fa-eye toggle-password" style="position: absolute; top: 50%; right: 50px; transform: translateY(-10%); cursor: pointer; color: #888;"></span>
//         </div>
//         <div style="position: relative;">
//           <input type="password" id="confirmNewPassword" class="swal2-input" placeholder="Nhập lại mật khẩu mới" style="width: calc(100% - 70px); padding-right: 40px;">
//           <span toggle="#confirmNewPassword" class="fa fa-fw fa-eye toggle-password" style="position: absolute; top: 50%; right: 50px; transform: translateY(-10%); cursor: pointer; color: #888;"></span>
//         </div>
//       `,
//     showCancelButton: true,
//     confirmButtonText: "Cập nhật",
//     cancelButtonText: "Huỷ",
//     preConfirm: () => {
//       const currentPassword = Swal.getPopup().querySelector('#currentPassword').value;
//       const newPassword = Swal.getPopup().querySelector('#newPassword').value;
//       const confirmNewPassword = Swal.getPopup().querySelector('#confirmNewPassword').value;
//       if (!currentPassword || !newPassword || !confirmNewPassword) {
//         Swal.showValidationMessage(`Vui lòng nhập đầy đủ thông tin`);
//       }
//       if (newPassword !== confirmNewPassword) {
//         Swal.showValidationMessage(`Mật khẩu mới và xác nhận mật khẩu không khớp`);
//       }
//       return { currentPassword: currentPassword, newPassword: newPassword };
//     }
//   }).then((result) => {
//     if (result.isConfirmed) {
//       $.ajax({
//         type: "POST",
//         url: `/update_password_tk`,
//         data: JSON.stringify({
//           idtk: idtk,
//           old_password: result.value.currentPassword,
//           new_password: result.value.newPassword
//         }),
//         contentType: "application/json",
//         success: function (res) {
//           if (res.status === "OK") {
//             Toast.fire({
//               icon: "success",
//               title: "Mật khẩu đã được cập nhật thành công. Vui lòng đăng xuất và đăng nhập lại để sử dụng mật khẩu mới."
//             });
//             $("#accountTable").DataTable().ajax.reload();
//           } else {
//             Toast.fire({
//               icon: "error",
//               title: "Mật khẩu cũ không đúng. Vui lòng thử lại."
//             });
//           }
//         },
//         error: function () {
//           Toast.fire({
//             icon: "error",
//             title: "Thay đổi mật khẩu thất bại. Vui lòng thử lại."
//           });
//         }
//       });
//     }
//   });
// });

// // Toggle visibility of password fields
// $(document).on("click", ".toggle-password", function () {
//   $(this).toggleClass("fa-eye fa-eye-slash");
//   let input = $($(this).attr("toggle"));
//   if (input.attr("type") === "password") {
//     input.attr("type", "text");
//   } else {
//     input.attr("type", "password");
//   }
// });



// Reset mật khẩu tài khoản
$("#accountTable").on("click", "#resetPassBtn", function () {
  let idtk = $(this).data("idtk");

  // Hiển thị thông báo xác nhận reset mật khẩu
  Swal.fire({
    title: "Reset mật khẩu",
    text: "Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Reset",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: `/reset_password_tk`,
        data: JSON.stringify({
          idtk: idtk,
        }),
        contentType: "application/json",
        success: function (res) {
          if (res.status === "OK") {
            Toast.fire({
              icon: "success",
              title: "Mật khẩu đã được reset thành công."
            });
            $("#accountTable").DataTable().ajax.reload();
          } else {
            Toast.fire({
              icon: "error",
              title: "Reset mật khẩu thất bại. Vui lòng thử lại."
            });
          }
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: "Reset mật khẩu thất bại. Vui lòng thử lại."
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
  $(".btn-secondary").on("click", function () {
    $("#viewAccountModal").modal("hide");
  });
});





//Thêm tài khoản
// Sự kiện khi nhấn nút "Tạo tài khoản"
$("#taoTaiKhoanBtn").on("click", function () {
  // Cập nhật tiêu đề của modal
  $("#modal_title").html(`
      <h5 class="modal-title text-center">
          <i class="fa-solid fa-user-plus me-2"></i> 
          Tạo tài khoản người dùng
      </h5>
  `);

  // Tạo nội dung của modal với dropdown chọn nhân viên
  $("#modal_body").html(`
      <div class="form-group mb-3">
          <label for="modal_idnv_select" class="form-label">Chọn nhân viên</label>
          <select class="form-control form-control-lg" id="modal_idnv_select" required>
              <option value="">Chọn nhân viên</option>
          </select>
      </div>
      <div class="form-group mb-3">
          <label for="modal_taikhoan_input" class="form-label">Tên tài khoản</label>
          <input type="text" class="form-control form-control-lg" id="modal_taikhoan_input" placeholder="Nhập tên tài khoản" required />
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

  // Gửi yêu cầu AJAX để lấy danh sách nhân viên chưa có tài khoản
  $.ajax({
    type: "GET",
    url: `/lay_nhanvien_chua_co_taikhoan`,
    success: function (res) {
      const select = $("#modal_idnv_select");
      res.forEach(function (nhanvien) {
        select.append(`<option value="${nhanvien.idnv}">${nhanvien.tennv}</option>`);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error:", status, error);
      console.error("Response Text:", xhr.responseText);
      Toast.fire({
        icon: "error",
        title: `Đã xảy ra lỗi khi lấy danh sách nhân viên.`,
      });
    }
  });

  // Đảm bảo sự kiện chỉ được kích hoạt một lần khi nhấn nút "Thêm"
  $("#modal_submit_btn").off("click").on("click", function () {
    // Lấy giá trị từ form
    let idnv = $("#modal_idnv_select").val();
    let taikhoan = $("#modal_taikhoan_input").val().trim();

    // Kiểm tra xem ID nhân viên đã được chọn chưa
    if (!idnv) {
      Toast.fire({
        icon: "error",
        title: "Vui lòng chọn nhân viên.",
      });
      return;
    }

    // Tạo đối tượng chứa dữ liệu để gửi lên server
    const requestData = {
      idnv: parseInt(idnv),  // Chuyển đổi ID nhân viên sang số nguyên
      tk: taikhoan
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
        // Xử lý khi có lỗi xảy ra trong quá trình gửi yêu cầu
        console.error("Error:", status, error);  // Log chi tiết lỗi vào console
        console.error("Response Text:", xhr.responseText); // Log nội dung trả về từ server
        Toast.fire({
          icon: "error",
          title: `Đã xảy ra lỗi. Vui lòng thử lại sau.`,
        });
      },
    });
  });
});

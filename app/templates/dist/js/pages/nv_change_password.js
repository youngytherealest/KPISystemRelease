var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// Bắt sự kiện người dùng nhập xong xác nhận mật khẩu mới
$("#submitBtn").on("click", function () {
  let old_password = $("#old_password").val();
  let new_password = $("#new_password").val();
  let confirm_password = $("#confirm_password").val();

  if (new_password !== confirm_password) {
    Toast.fire({
      icon: "error",
      title: "Mật khẩu mới không khớp với xác nhận mật khẩu"
    });
  } else {
    $.ajax({
      type: `POST`,
      url: `update_password_nv?old_password=${old_password}&new_password=${new_password}`,
      success: function (res) {
        if (res.status == 'OK') {
          Toast.fire({
            icon: "success",
            title: "Đã đổi mật khẩu. Vui lòng đăng xuất và đăng nhập lại để sử dụng mật khẩu mới."
          });
        } else {
          Toast.fire({
            icon: "error",
            title: "Mật khẩu cũ không đúng. Vui lòng thử lại."
          });
        }
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Thay đổi mật khẩu thất bại. Vui lòng thử lại."
        });
      }
    });
  }
});

var Toast = Swal.mixin({
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

$.ajax({
  type: "GET",
  url: "get_ds_dia_chi",
  success: function (res) {
    let html = "";
    $.each(res, function (idx, val) {
      html += '<option value="' + val.xaphuong + '">' + val.xaphuong + "</option>";
    });
    $("#sinhvien_diachi").append(html);
  },
});


$.ajax({
  type: "GET",
  url: "get_danh_sach_nganh",
  success: function (res) {
    let html = "";
    $.each(res, function (idx, val) {
      html += '<option value="' + val.id + '">' + val.ten + "</option>";
    });
    $("#sinhvien_nganh").append(html);
  },
});

$.ajax({
  type: "GET",
  url: "get_danh_sach_truong",
  success: function (res) {
    let html = "";
    $.each(res, function (idx, val) {
      html += '<option value="' + val.id + '">' + val.ten + "</option>";
    });
    $("#sinhvien_truong").append(html);
  },
});

if (document.cookie.indexOf("studentid") == -1) {
  $("#submitBtn").on("click", function () {
    $('.card-body input[type="text"], input[type="email"], input[type="number"]').each(
      function () {
        if ($(this).val() === "") {
          Toast.fire({
            icon: "error",
            title: "Vui lòng điền đầy đủ thông tin",
          });
        }
      }
    );

    let data = {
      mssv: $("#sinhvien_mssv").val(),
      hoten: $("#sinhvien_hoten").val(),
      gioitinh: $("#sinhvien_gioitinh").val(),
      sdt: $("#sinhvien_sdt").val(),
      email: $("#sinhvien_email").val(),
      diachi: $("#sinhvien_diachi").val(),
      malop: $("#sinhvien_malop").val(),
      khoa: $("#sinhvien_khoa").val(),
      nganh: $("#sinhvien_nganh").val(),
      truong: $("#sinhvien_truong").val(),
    };
    $.ajax({
      type: "POST",
      url: "/thong_tin_sinh_vien",
      data: JSON.stringify(data),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      success: function (res) {
        clear_modal();
        $("#modal_title").text("Xác thực OTP");
        let email = $("#sinhvien_email").val();
        let html =
          '<div class="form-group"><label for="modal_otp_input">Mã OTP đã được gửi đến địa chỉ ' +
          email +
          '</label><input type="number" class="form-control" id="modal_otp_input" placeholder="Mã OTP"></div>';
        $("#modal_body").append(html);
        $("#modal_footer").append(
          '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Xác thực</button>'
        );
        $("#modal_id").modal("show");

        $("#modal_submit_btn").on("click", function () {
          let otp = $("#modal_otp_input").val();

          xac_thuc_otp(email, otp);
          $("#modal_id").modal("hide");
        });

        disable_input();
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Đã xảy ra lỗi, vui lòng thử lại sau",
        });
      },
    });
  });
} else {
  disable_input();
  $("#message").text("Bạn đã điền thông tin");
  let id = document.cookie.split("studentid=")[1].split(";")[0];

  $.ajax({
    type: "GET",
    url: "get_chi_tiet_sinh_vien_moi_nhap_thong_tin?id=" + id,
    success: function (res) {
      let truong = {
        VLUTE: "Trường ĐH Sư phạm Kỹ thuật Vĩnh Long",
        CTU: "Trường Đại học Cần Thơ",
        MKU: "Trường Đại học Cửu Long",
        MTU: "Trường Đại học Xây dựng Miền Tây",
      };
      $("#sinhvien_mssv").val(res.mssv);
      $("#sinhvien_hoten").val(res.hoten);
      $("#sinhvien_gioitinh").children("option").text(res.gioitinh);
      $("#sinhvien_sdt").val(res.sdt);
      $("#sinhvien_email").val(res.email);
      $("#sinhvien_diachi").val(res.diachi);
      $("#sinhvien_malop").val(res.malop);
      $("#sinhvien_khoa").val(res.khoa);
      $("#sinhvien_nganh").val(res.nganh);
      $("#sinhvien_truong").children("option").text(res.truong);
    },
  });
}

$(document).ready(function () {
  $(".select2").select2({
    theme: "bootstrap",
  });
});

function disable_input() {
  $("input, select").attr("disabled", "disabled");
  $("#submitBtn").prop("disabled", true);
  $("#modal_otp_input").prop("disabled", false);
}

function xac_thuc_otp(email, otp) {
  $.ajax({
    type: "POST",
    url: "/xac_thuc_otp?email=" + email + "&otp=" + otp,
    success: function () {
      Toast.fire({
        icon: "success",
        title: "Xác thực thành công",
      });
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Xác thực thất bại",
      });
    },
  });
}

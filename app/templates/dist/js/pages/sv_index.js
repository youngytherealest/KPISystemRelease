var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}

$(document).ready(function () {
  let cookie = document.cookie.split(";");
  let bangthongtin = $("#bang_thongtinsinhvien tbody");
  cookie.forEach(function (val) {
    if (val.includes("username=")) {
      let email = val.split("username=")[1].replaceAll('"', "");

      $.ajax({
        type: "GET",
        url: `/xem_thong_tin_sv?username=${email}`,
        success: function (res) {
          html = `
                        <tr>
                            <td>MSSV:</td>
                            <td id="table_svinfo_mssv">${res.mssv}</td>
                        </tr>
                        <tr>
                            <td>Họ tên:</td>
                            <td id="table_svinfo_hoten">${res.hoten}</td>
                        </tr>
                        <tr>
                            <td>Giói tính:</td>
                            <td id="table_svinfo_gioitinh">${res.gioitinh == 1 ? "Nam" : "Nữ"}</td>
                        </tr>
                        <tr>
                            <td>Số điện thoại:</td>
                            <td id="table_svinfo_sdt">${res.sdt}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td id="table_svinfo_email">${res.email}</td>
                        </tr>
                        <tr>
                            <td>Địa chỉ:</td>
                            <td id="table_svinfo_diachi">${res.diachi}</td>
                        </tr>
                        <tr>
                            <td>Mã lớp:</td>
                            <td id="table_svinfo_malop">${res.malop}</td>
                        </tr>
                        <tr>
                            <td>Khoá:</td>
                            <td id="table_svinfo_khoa">${res.khoa}</td>
                        </tr>
                        <tr>
                            <td>Ngành:</td>
                            <td id="table_svinfo_nganh">${res.nganh}</td>
                        </tr>
                        <tr>
                            <td>Trường:</td>
                            <td id="table_svinfo_truong">${res.truong}</td>
                        </tr>
                        <tr>
                            <td>Nhóm:</td>
                            <td>${res.nhomhuongdan === null ? "" : res.nhomhuongdan
            }</td>
                        </tr>
                    `;

          bangthongtin.append(html);
        },
      });
    }
  });

  // Chọn nhóm
  $.ajax({
    type: "GET",
    url: "get_ds_nhom_thuc_tap_con_han",
    success: function (res) {
      html = "";
      if (res.length > 0) {
        $.each(res, function (idx, val) {
          html +=
            '<option value="' +
            val.id +
            '">[' +
            val.id +
            "]\t" +
            val.tendetai +
            "</option>";
        });
        $("#danhsachnhom").append(html);
      } else {
        $("#danhsachnhom").html('<option selected>Hiện tại chưa có nhóm hoặc hết hạn chọn nhóm</option>');
      }

    },
  });

  $("#danhsachnhom").on("change", function () {
    let nhom = $("#danhsachnhom").val();
    if (nhom != "") {
      $.ajax({
        type: "GET",
        url: "get_chi_tiet_nhom_thuc_tap_by_id?id=" + nhom,
        success: function (res) {
          let soluongdangky =
            String(res.nhomthuctap_dadangky) +
            "/" +
            String(res.nhomthuctap_soluong);
          $("#nguoihuongdan").val(res.nguoihuongdan_hoten);
          $("#mota").val(res.detai_mota.replace(/<br>/g, "\r\n"));
          $("#soluongsv").val(soluongdangky);
        },
      });
    } else {
      $("#nguoihuongdan").val("");
      $("#mota").val("");
      $("#soluongsv").val("");
    }
  });

  if (document.cookie.indexOf("groupid") !== -1) {
    $("#submitBtn").prop("disabled", true);
  } else {
    $("#submitBtn").on("click", function () {
      let id_nhom = $("#danhsachnhom").val();
      cookie.forEach(function (val) {
        if (val.includes("username=")) {
          let email = val.split("username=")[1].replaceAll('"', "");
          $.ajax({
            type: "POST",
            url: `/them_nhom_thuc_tap_sv?email=${email}&idnhom=${id_nhom}`,
            success: function (res) {
              if (res.status == "OK") {
                Toast.fire({
                  icon: "success",
                  title: "Đã đăng ký",
                });
                $("#submitBtn").prop("disabled", true);
              } else {
                Toast.fire({
                  icon: "error",
                  title: "Nhóm đã đủ số lượng",
                });
              }
            },
            error: function () {
              Toast.fire({
                icon: "error",
                title:
                  "Nhóm đã đủ số lượng.<br>Vui lòng liên hệ người hướng dẫn.",
              });
            },
          });
        }
      });
    });
  }

  // Gửi đánh giá
  function submitDanhGia(email, nhomhuongdan_id) {
    let cau_1 = $("input[name='q1']:checked").val();
    let cau_2 = $("input[name='q2']:checked").val();
    let cau_3 = $("input[name='q3']:checked").val();
    let cau_4 = $("input[name='q4']:checked").val();
    let gopy = $("#gopy")
      .val()
      .replace(/[\r\n]+/g, "<br>");

    if (
      cau_1 == undefined ||
      cau_2 == undefined ||
      cau_3 == undefined ||
      cau_4 == undefined
    ) {
      Toast.fire({
        icon: "error",
        title: "Vui lòng chọn đủ 4 đáp án",
      });
    } else {
      $.ajax({
        type: "POST",
        url: `/danh_gia_thuc_tap?username=${email}&id_nhd=${nhomhuongdan_id}&dapan_1=${cau_1}&dapan_2=${cau_2}&dapan_3=${cau_3}&dapan_4=${cau_4}&gopy=${gopy}`,
        success: function () {
          Toast.fire({
            icon: "success",
            title: "Đã gửi đánh giá",
          });
          $("#submitDanhGiaBtn").prop("disabled", true);
          $("<center><p>Bạn đã gửi đánh giá</p></center>").replaceAll(
            $("#review_form")
          );
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: "Gửi đánh giá không thành công hoặc bạn đã đánh giá rồi!",
          });
        },
      });
    }
  }

  // Bắt sự kiện submit
  $("#submitDanhGiaBtn").on("click", function () {
    let email = "";
    let groupid = -1;
    cookie.forEach(function (val) {
      if (val.includes("username=")) {
        email = val.split("username=")[1].replaceAll('"', "");
      }

      if (val.includes("groupid=")) {
        groupid = val.split("groupid=")[1];
      }
    });

    if (email != "" && groupid != -1) {
      submitDanhGia(email, groupid);
    }
  });

  // Bắt sự kiện chỉnh sửa thông tin cá nhân
  $("#editInfoBtn").on("click", function () {
    let mssv = document.getElementById("table_svinfo_mssv").innerHTML;
    let hoten = document.getElementById("table_svinfo_hoten").innerHTML;
    let khoa = document.getElementById("table_svinfo_khoa").innerHTML;
    let sdt = document.getElementById("table_svinfo_sdt").innerHTML;
    let email = document.getElementById("table_svinfo_email").innerHTML;
    let diachi = document.getElementById("table_svinfo_diachi").innerHTML;
    let malop = document.getElementById("table_svinfo_malop").innerHTML;

    clear_modal();

    $("#modal_title").text(`Chỉnh sửa thông tin cá nhân`);
    $("#modal_body").html(`
      <div class="form-group">
        <label for="modal_mssv_input">MSSV</label>
        <input type="text" class="form-control" id="modal_mssv_input" value="${mssv}">
      </div>
      <div class="form-group">
        <label for="modal_hoten_input">Họ tên</label>
        <input type="text" class="form-control" id="modal_hoten_input" value="${hoten}">
      </div>
      <div class="form-group">
        <label for="modal_gioitinh_input">Giới tính</label>
        <select class="form-control" id="modal_gioitinh_input">
          <option value="1">Nam</option>
          <option value="0">Nữ</option>
        </select>
      </div>
      <div class="form-group">
        <label for="modal_sdt_input">Số điện thoại</label>
        <input type="number" class="form-control" id="modal_sdt_input" value="${sdt}">
      </div>
      <div class="form-group">
        <label for="modal_email_input">Email</label>
        <input type="email" class="form-control" id="modal_email_input" value="${email}" disabled>
      </div>
      <div class="form-group">
        <label for="modal_diachi_input">Địa chỉ</label>
        <input type="text" class="form-control" id="modal_diachi_input" value="${diachi}">
      </div>
      <div class="form-group">
        <label for="modal_malop_input">Mã lớp</label>
        <input type="text" class="form-control" id="modal_malop_input" value="${malop}">
      </div>
      <div class="form-group">
        <label for="modal_khoa_input">Khoá</label>
        <input type="number" class="form-control" id="modal_khoa_input" value="${khoa}">
      </div>
      <div class="form-group">
        <label for="modal_nganh_input">Ngành</label>
        <select class="form-control" id="modal_nganh_input">
        </select>
      </div>
      <div class="form-group">
        <label for="modal_truong_input">Trường</label>
        <select class="form-control" id="modal_truong_input">
      </div>
    `);
    $("#modal_footer").html(`
      <button class="btn btn-success col-lg-4 offset-lg-8" id="saveChanges">
        <i class="fa-solid fa-floppy-disk"></i>
        LƯU THAY ĐỔI
      </button>
    `);

    $("#modal_id").modal("show");

    $.ajax({
      type: "GET",
      url: "get_danh_sach_nganh",
      success: function (res) {
        let html = "";
        $.each(res, function (idx, val) {
          html += '<option value="' + val.id + '">' + val.ten + "</option>";
        });
        $("#modal_nganh_input").append(html);
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
        $("#modal_truong_input").append(html);
      },
    });

    $("#saveChanges").on("click", function () {
      let mssv_input = $("#modal_mssv_input").val();
      let hoten_input = $("#modal_hoten_input").val();
      let gioitinh_input = $("#modal_gioitinh_input").val();
      let sdt_input = $("#modal_sdt_input").val();
      let diachi_input = $("#modal_diachi_input").val();
      let malop_input = $("#modal_malop_input").val();
      let khoa_input = $("#modal_khoa_input").val();
      let nganh_input = $("#modal_nganh_input").val();
      let truong_input = $("#modal_truong_input").val();

      $.ajax({
        type: `POST`,
        url: `update_thong_tin_sv?mssv=${mssv_input}&hoten=${hoten_input}&gioitinh=${gioitinh_input}&sdt=${sdt_input}&diachi=${diachi_input}&malop=${malop_input}&khoa=${khoa_input}&nganh=${nganh_input}&truong=${truong_input}`,
        success: function (res) {
          Toast.fire({
            icon: "success",
            title: `Đã cập nhật thông tin`
          });
        },
        error: function () {
          Toast.fire({
            icon: "error",
            title: `Đã xảy ra lỗi, vui lòng thử lại sau`
          })
        }
      });
    });
  });
});
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

function login() {
  let username = $("#username").val();
  let password = $("#password").val();

  $.ajax({
    url: "token",
    type: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ username: username, password: password }),
    success: function (res) {
      $.ajax({
        type: `GET`,
        url: `https://ipinfo.io/json`,
        success: function (noidung) {
          $.ajax({
            type: `POST`,
            url: `canhbaodangnhap?noidung=${JSON.stringify(noidung)}`,
            success: () => { },
            error: () => { }
          });
          window.location.href = "/";
        },
        error: function () {
          // Chuyển hướng đến trang chủ nếu yêu cầu bị lỗi hoặc hết thời gian chờ
          window.location.href = "/";
        }
      });
    },
    error: function (xhr, status, error) {
      Toast.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
      });
    },
  });
}

$("#loginBtn").click(function () {
  login();
});

document.getElementById("password").addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    login();
  }
});

document.getElementById("username").addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    login();
  }
});


function load_ChiTietChamcong() {
    
  $("#dschcpub").empty();
  $("#dschcpub").append(`
    <thead>
      <tr>
        <th scope="col" style="text-align: center;" width="25%">Họ tên</th>
        <th scope="col" style="text-align: center;" width="15%">Giờ vào</th>
        <th scope="col" style="text-align: center;">Giờ ra</th>
        <th scope="col" style="text-align: center;" width="15%">Ngày tháng</th>
      </tr>
    </thead>
    `);

  let dschcpub = $("#dschcpub").dataTable({
    paging: true,
    pageLength: 10,
    pagingType: 'full_numbers',
    language: {
      paginate: {
          first: 'Trang đầu',   // Nút "First"
          last: 'Trang cuối',    // Nút "Last"
          next: '>>',      // Nút "Next"
          previous: '<<'  // Nút "Previous"
      }
    },
    lengthChange: false,
    searching: false,
    ordering: true,
    info: false,
    destroy: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url:
        "/get_dschc_pub_spkt",
        dataSrc: function(json) {
          return json.hoten.map((ten, index) => ({
            hoten: ten,
            giovao: json.giovao[index],
            giora: json.giora[index],
            ngaythang: json.ngaythang[index]
          }));
        },
      error: function () {
        $.fn.dataTable.ext.errMode = "throw";
        Toast.fire({
          icon: "error",
          title: "Dữ liệu chưa được tải lên",
        });
      },
    },
    columns: [
      { data: "hoten" },
      { data: "giovao" },
      { data: "giora" },
      { data: "ngaythang" },
    ],
  });

  dschcpub.prop("hidden", false);
}

// Thực hiện hàm trên khi trang web sẵn sàng
$(document).ready(function () {
    load_ChiTietChamcong();
});

// new
const input = document.getElementById('card_uid');
input.addEventListener('change', () => {
  let idt = $("#card_uid").val(); // Nhớ đổi sang lấy mã thẻ
  $.ajax({
    type: `POST`,
    url: `th_chc_spkt?idt=${idt}`,
    success: function (res) {
      if (res.status == 'OK VAO' || res.status == 'OK RA') {
        Toast.fire({
          icon: "success",
          title: "Thành công."
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Lượt Chấm công hôm nay đã hết."
        });
      }
    },
    error: function () {
      Toast.fire({
        icon: "error",
        title: "Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ với người có thẩm quyền."
      });
    }
  });
});
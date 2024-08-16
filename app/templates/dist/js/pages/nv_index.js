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
// HPDuc cautions
$(document).ready(function () {
  let cookie = document.cookie.split(";");
  let bangthongtin = $("#bang_thongtinnhanvien tbody");
  cookie.forEach(function (val) {
    if (val.includes("id=")) { //Duc_CS_7/8: 18 old username
      let id = val.split("id=")[1].replaceAll('"', ""); //Duc_CS_7/8: 19 old username
      
// DT:20:sv_index.js
      $.ajax({
        type: "GET",
        url: `/xem_thong_tin_nv_spkt?idu=${id}`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
        success: function (res) { //Duc_T_7/8:24-84
          html = `
                        
                        <tr>
                            <td>Họ tên:</td>
                            <td id="table_nvinfo_hoten">${res.hoten}</td>
                        </tr>
                        <tr>
                            <td>Giới Tính:</td>
                            <td id="table_nvinfo_gioitinh">${res.gioitinh == 1 ? "Nam" : "Nữ"}</td>
                        </tr>
                        <tr>
                            <td>Ngày Sinh:</td>
                            <td id="table_nvinfo_ngaysinh">${res.ngaysinh}</td>
                        </tr>
                        <tr>
                            <td>Địa chỉ:</td>
                            <td id="table_nvinfo_diachi">${res.diachi}</td>
                        </tr>
                        <tr>
                            <td>Điện Thoại:</td>
                            <td id="table_nvinfo_dt">${res.dienthoai}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td id="table_nvinfo_email">${res.email}</td>
                        </tr>
                        <tr>
                            <td>ID ca làm việc:</td>
                            <td id="table_nvinfo_idclv">${res.idclv == 1 ? "7h30 -> 17h" : "..."}</td>
                        </tr>
                        <tr>
                            <td>Vai Trò:</td>
                            <td id="table_nvinfo_vaitro">${res.TenVaiTro}</td>
                        </tr>
                        <tr>
                            <td>Bộ Phận:</td>
                            <td id="table_nvinfo_bophan">${res.TenBoPhan}</td>
                        </tr>
                        <tr>
                            <td>Phòng Ban:</td>
                            <td id="table_nvinfo_phongban">${res.TenPhongBan}</td>
                        </tr>
                    `;

          bangthongtin.append(html);
        },
      });
//Duc_T_7/8:24-84
      
    }
  });

  

  
});
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

function getTokenFromCookie(name) {
  let cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

let currentDate = new Date();

function load_Thang(nam, mode){
  let locthg = $("#loctg #tg_contain #thg_containt");
  locthg.empty();
  if(mode==0){
    $.ajax({
      type: "GET",
      url: `/lay_thang_chc_spkt?nam=${nam}`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`
        <label for="thang_dropmenu" class="mr-2">Tháng:</label>
                  <select class="form-control mr-2 fs-2" id="thang_dropmenu"> `;
        res.thang.forEach(function(thang, index){
          html += `                
                  <option value="${thang}" ${index === res.thang.length - 1 ? 'selected' : ''}>${thang}</option>`;
        })
        html +=`</select>` ;
        locthg.append(html);
      }
    });
  }else{
    $.ajax({
      type: "GET",
      url: `/lay_thang_bl_spkt?nam=${nam}`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`
        <label for="thang_dropmenu" class="mr-2">Tháng:</label>
                  <select class="form-control mr-2 fs-2" id="thang_dropmenu"> `;
        res.thang.forEach(function(thang, index){
          html += `                
                  <option value="${thang}" ${index === res.thang.length - 1 ? 'selected' : ''}>${thang}</option>`;
        })
        html +=`</select>` ;
        locthg.append(html);
      }
    });
  }
  
    
}

function load_ChiTietChamcong(mode=0) {
  let loctg = $("#loctg #tg_contain");
  let namc=0;
  let thangc=0;
  
  if(mode==0){
    loctg.empty();

    $.ajax({
      type: "GET",
      url: `/lay_nam_chc_spkt`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`<div id="nam_containt" class=" mr-2 ">
        <label for="nam_dropmenu" class="mr-2 ">Năm:</label>
                  <select class="form-control mr-2 fs-2" id="nam_dropmenu" > `;
        res.nam.forEach(function(nam, index){
          html += `                
                  <option value="${nam}" ${index === res.nam.length - 1 ? 'selected' : ''}>${nam}</option>`;
        })
        html +=`</select> </div>`

        loctg.append(html);
        
      },
    });
    namc= currentDate.getFullYear();
    
    namc=parseInt(namc);
    
    $.ajax({
      type: "GET",
      url: `/lay_thang_chc_spkt?nam=${namc}`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`<div id="thg_containt" class=" mr-2">
        <label for="thang_dropmenu" class="mr-2">Tháng:</label>
                  <select class="form-control mr-2 fs-2" id="thang_dropmenu"> `;
        res.thang.forEach(function(thang, index){
          html += `                
                  <option value="${thang}" ${index === res.thang.length - 1 ? 'selected' : ''}>${thang}</option>`;
        })
        html +=`</select> </div>
        <button id="bxn_chc" type="button" class="btn btn-primary fs-2 fw-bold" >Xác nhận</button>`;

        loctg.append(html);
      },
    });
    thangc= currentDate.getMonth() + 1;
    thangc=parseInt(thangc);
  }else{
    namc= $("#nam_dropmenu").val();
    namc=parseInt(namc);
    thangc= $("#thang_dropmenu").val();
    thangc=parseInt(thangc);
  }
  $("#tt_contain").empty();

  $("#bangchamcong").empty();
  $("#bangchamcong").append(`
    
    <thead>
      <tr>
        <th scope="col" style="text-align: center;" width="25%">Ngày tháng</th>
        <th scope="col" style="text-align: center;" width="15%">Giờ vào</th>
        <th scope="col" style="text-align: center;">Giờ ra</th>
        <th scope="col" style="text-align: center;" width="15%">Trạng thái</th>
        <th scope="col" style="text-align: center;">Hợp lệ</th>
      </tr>
    </thead>
    `);

  let bang_congviec = $("#bangchamcong").dataTable({
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
        "/load_ct_chc_u_spkt?thang=" +
        parseInt(thangc)+ "&nam="+parseInt(namc)+ "&mode="+parseInt(mode),
      dataSrc: function(json) {
        return json.ngaythang.map((ngay, index) => ({
            ngaythang: ngay,
            giovao: json.giovao[index],
            tre: json.tre[index],
            giora: json.giora[index],
            som: json.som[index],
            hople: json.hople[index]
        }));
    },
      error: function () {
        $.fn.dataTable.ext.errMode = "throw";
        Toast.fire({
          icon: "error",
          title: "Bạn chưa được phân công công việc",
        });
      },
    },
    columns: [
      { data: "ngaythang" },
      { data: "giovao" },
      { data: "giora" },
      { 
        render: function (data, type, row) {
          let tre= row.tre===1 ? 
          '<center><span class="badge badge-danger badge-medium">Đi trễ</span></center>':
          '';
          let som= row.som===1 ? 
          '<center><span class="badge badge-danger">, Về sớm</span></center>':
          '';
          if(tre=='' && som==''){
            let n='<center><span class="badge badge-success">Không vi phạm</span></center>'
            return n;
          }else{
            return tre  + som;
          }
        },
       },
      {
        data: "hople",
        render: function (data, type, row) {
          if (data == true) {
            return '<center><span class="badge badge-success">Có</span></center>';
          } else if (data == false) {
            return '<center><span class="badge badge-danger">Không </span></center>';
          } 
          // else {
          //   return '<center><span class="badge badge-danger">Trễ hạn</span></center>';
          // }
        },
      },
      
    ],
  });

  bang_congviec.prop("hidden", false);
}

function load_Bangluong(mode=0) {
  let bangluong = $("#bangtamluong tbody");
  let btnbangluong = $("#btn_bl");
  let loctg = $("#loctg #tg_contain");
  let namc=0;
  let thangc=0;
  if(mode==0){
    loctg.empty();

    $.ajax({
      type: "GET",
      url: `/lay_nam_bl_spkt`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`<div id="nam_containt" class=" mr-2">
        <label for="nam_dropmenu1" class="mr-2">Năm:</label>
                  <select class="form-control mr-2 fs-2" id="nam_dropmenu1" > `;
        res.nam.forEach(function(nam, index){
          html += `                
                  <option value="${nam}" ${index === res.nam.length - 1 ? 'selected' : ''}>${nam}</option>`;
        })
        html +=`</select> </div>`

        loctg.append(html);
        
      },
    });
    namc= currentDate.getFullYear();
    
    namc=parseInt(namc);
    
    $.ajax({
      type: "GET",
      url: `/lay_thang_bl_spkt?nam=${namc}`, //Duc_CS_7/8:23 old url:`/xem_thong_tin_sv?username=${email}`
      success: function (res) { //Duc_T_7/8:24-84
        let html=`<div id="thg_containt" class=" mr-2">
        <label for="thang_dropmenu" class="mr-2">Tháng:</label>
                  <select class="form-control mr-2 fs-2" id="thang_dropmenu"> `;
        res.thang.forEach(function(thang, index){
          html += `                
                  <option value="${thang}" ${index === res.thang.length - 1 ? 'selected' : ''}>${thang}</option>`;
        })
        html +=`</select> </div>
        <button id="bxn_l" type="button" class="btn btn-primary fs-2 fw-bold" >Xác nhận</button>`;

        loctg.append(html);
      },
    });
    thangc= currentDate.getMonth() + 1;
    thangc=parseInt(thangc, 10);
  }else{
    namc= $("#nam_dropmenu1").val();
    namc=parseInt(namc, 10);
    thangc= $("#thang_dropmenu").val();
    thangc=parseInt(thangc, 10);
  }
  
  bangluong.empty();
  $.ajax({
    type: "GET",
    url: `/load_ct_bl_u_spkt?thang=${thangc}&nam=${namc}`, 
    success: function (res) { 
      html = `      
                    <tr>
                      <td colspan="2" style="text-align:center;">Bảng lương tạm tính</td>
                    </tr>
                    <tr>
                        <td>Họ tên:</td>
                        <td id="table_info_lt_hoten">${res.hoten}</td>
                    </tr>
                    <tr>
                        <td>Chức vụ:</td>
                        <td id="table_info_lt_cv">${res.chucvu}</td>
                    </tr>
                    <tr>
                        <td>Hệ số lương:</td>
                        <td id="table_info_lt_hsl">${res.hsl}</td>
                    </tr>
                    <tr>
                        <td>Lương cơ bản:</td>
                        <td id="table_info_lt_lcb">${res.lcb.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    </tr>
                    <tr>
                        <td>Số lượng đi trễ:</td>
                        <td id="table_info_lt_tre">${res.sltre >=3 ?'<span class="badge badge-danger">'+res.sltre+'</span>': res.sltre >=1 ?
                          '<span class="badge badge-warning">'+res.sltre+'</span>' :
                        '<span class="badge badge-success">'+res.sltre+'</span>'}</td>
                    </tr>
                    <tr>
                        <td>Số lượng về sớm:</td>
                        <td id="table_info_lt_som">${res.slsom >=3 ?'<span class="badge badge-danger">'+res.slsom+'</span>': res.slsom >=1 ?
                          '<span class="badge badge-warning">'+res.slsom+'</span>' :
                        '<span class="badge badge-success">'+res.slsom+'</span>'}</td>
                    </tr>
                    <tr>
                        <td>Số lượng ngày vắng:</td>
                        <td id="table_info_lt_vang">${res.slvang >=3 ?'<span class="badge badge-danger">'+res.slvang+'</span>': res.slvang >=1 ?
                          '<span class="badge badge-warning">'+res.slvang+'</span>' :
                        '<span class="badge badge-success">'+res.slvang+'</span>'}</td>}</td>
                    </tr>
                    <tr>
                        <td>Số lượng ngày dư:</td>
                        <td id="table_info_lt_du">${res.sldu>=1?'<span class="badge badge-success">'+res.sldu+'</span>':'<span class="badge badge-primary">'+res.sldu+'</span>'}</td>
                    </tr>
                    <tr>
                        <td>Lương tạm:</td>
                        <td id="table_info_lt_luong">${res.luong.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    </tr>
                    <tr>
                        <td>Ngày cập nhật:</td>
                        <td id="table_info_lt_date">${res.ngayluu}</td>
                    </tr>
                    <tr>
                        <td>Tháng lương:</td>
                        <td id="table_info_lt_thl">${res.thang}</td>
                    </tr>
                    <tr>
                        <td>Năm lương:</td>
                        <td id="table_info_lt_nl">${res.nam}</td>
                    </tr>
                `;

      bangluong.append(html);
      btnbangluong.empty();
      html=`<button type="button" id="Efile" class="btn btn-success btn-text col-lg-4 offset-lg-4">
            <i class="fa-solid fa-download"></i> Tải bảng lương
            </button>
            <button type="button" id="CT_l" class="btn btn-primary btn-text col-lg-4 offset-lg-4">
            <i class="fa-solid fa-circle-info"></i> Xem cách tính lương
            </button>`;
      btnbangluong.append(html);
    },
  });
}
function XuatBangExcel( ){
  var table = document.getElementById('bangtamluong');
  
  

  var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });
  
  XLSX.writeFile(wb, 'bangtamluong.xlsx');
  
  // --------------------------------------------------------------------
  
}
// DX_10/8:303


$(document).ready(function () {
// DX_9/8:27
  // Select2
  load_ChiTietChamcong();
  // DX_9/8:32 
});
// DX_9/8:117

// 2 nút chuyển tab
$("#dschc-tab").click(function() {
  load_ChiTietChamcong();
});

$("#btl-tab").click(function() {
  load_Bangluong();
});

// 2 nút xác nhận lọc theo thời gian


$(document).on('click', '#bxn_chc', function() {
  load_ChiTietChamcong(1);
});



$(document).on('click', '#bxn_l', function() {
  load_Bangluong(1);
});

$(document).on('change', '#nam_dropmenu', function() {
  let namc= $("#nam_dropmenu").val();
  namc=parseInt(namc, 10);
  load_Thang(namc,0);
});

$(document).on('change', '#nam_dropmenu1', function() {
  let namc= $("#nam_dropmenu1").val();
  namc=parseInt(namc, 10);
  load_Thang(namc,1);
});

// // 4 nút lọc chc theo tth DX_10/8:428

document.addEventListener('DOMContentLoaded', () => {
  const mdContainer = document.querySelector('.modal-dialog');
  if (mdContainer) {
    mdContainer.style.maxWidth = '1000px';
    
  }
});

// Nút xem chi tiết tính lương
$(document).on('click', '#CT_l', function(){
    clear_modal();
    


    $("#modal_title").text(`Qui định tính lương tạm thời`);
    $("#modal_body").html(`
      <h2>Công thức tính lương tạm thời</h2>
      <p class="h3"> <b>Lương tạm thời</b>= <b class="badge badge-primary">HSL</b> * 
      <b class="badge badge-primary">Lương cơ bản</b> - 
      <b class="badge badge-danger">Tổng tiền trừ</b> - 
      <b class="badge badge-danger">Tổng tiền vắng</b> + <b class="badge badge-success">Tổng tiền dư</b></p>
      <h3>Thông tin chi tiết</h3>
      <p class="h4">Mỗi tháng lương bình thường có 25 ngày công. 
      Nếu số ngày công thực tế quá 25 ngày, phần thừa sẽ được tính là số phần làm dư. 
      Ngược lại, nếu số ngày công ít hơn 25 ngày, số ngày thiếu được tính là vắng.</p>
      <ul class="h3">
        <li><b>Lương hàng ngày: </b>(HSL * Lương cơ bản) / 25 </li>
        <li><b>Qui định về việc đi trễ: </b>
        <ul>
          <li>Không trừ lương nếu đi trễ ít hơn hoặc bằng 3.</li>
          <li>Từ lần thứ 4 trở đi, mỗi lần đến trễ sẽ bị trừ <b class="badge badge-danger">10.000 VND</b>.</li>
        </ul></li>
        <li><b>Qui định về việc về sớm: </b>
        <ul>
          <li>Không trừ lương nếu về sớm ít hơn hoặc bằng 3.</li>
          <li>Từ lần thứ 4 trở đi, mỗi lần về sớm sẽ bị trừ <b class="badge badge-danger">10.000 VND</b>.</li>
        </ul></li>
        <li><b class="badge badge-danger">Tổng tiền trừ: </b>Số lần đi trễ(quá số lần qui định) *
         <b class="badge badge-danger">10.000 VND</b> + 
         Số lần về sớm(quá số lần qui định) * <b class="badge badge-danger">10.000 VND</b>.</li>
        <li><b class="badge badge-danger">Tổng tiền vắng: </b> Số lần vắng * lương hàng ngày</li>
        <li><b class="badge badge-success">Tổng tiền dư: </b> Số lần làm dư * lương hàng ngày * 2</li>
      </ul>`)
    // $("#modal_footer").html(`
    //   <button class="btn btn-primary col-lg-6 offset-lg-4 close" id="thoat" data-dismiss="modal" aria-label="Close">
    //     <i class="fa-solid fa-right-from-bracket"></i>
    //     Trở lại
    //   </button>
    // `);
    $("#modal_id").modal("show");
});

$(document).on('click', '#Efile', function(){
  XuatBangExcel();
});
  

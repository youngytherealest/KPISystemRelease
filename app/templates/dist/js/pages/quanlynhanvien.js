let currentDate = new Date();
currentDate.setDate(currentDate.getDate() + 0);
let currentTimestamp = parseInt(currentDate.getTime() / 1000);

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

function empty_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}

$(document).ready(function () {
  empty_modal();
  create_table();
});

function create_table() {
  var bangnv = $("#bangnv").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    destroy: true,
    autoWidth: false,
    responsive:   
 true,
    ajax: {
      type: "GET",
      url: '/get_all_nhan_vien',
      dataSrc: "",
    },
    columns: [
      { data: null, 
        render: function() {
          return '<input type="checkbox" />';
        }
      },
      {
        data: null,
        render: function (data, type, row, meta) {
          return "<center>" + (meta.row + 1) + "</center>";
        },
      },
      { data: "idthe" },
      { data: "hoten" },
      // { data: "gioitinh" },
      // { data: "ngaysinh" },
      { data: "diachi" },
      // { data: "dienthoai" },
      { data: "email" },
      { data: "idpb" },
      { data: "idclv" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 1) {
            return '<span style="color: red;">Ngưng hoạt động</span>';
          } else {
            return '<span style="color: green;">Đang hoạt động</span>';
          }
        }
      },
      {
        data: "thaotacthe",
        render: function (data, type, row) {
          return `
            <button class="btn btn-primary" id="viewBtn" data-id="{{ employee.id }}"><i class="fas fa-eye"></i></button>
            <button class="btn btn-success" id="insertBtn"><i class="fas fa-plus"></i></button>
            <button class="btn btn-danger" id="deleteBtn"><i class="fas fa-trash"></i></button>
          `;
        },
      },
    ],
    columnDefs: [
      { orderable: false, targets: 0 }, // Tắt tính năng sắp xếp cho cột 0
    ],
  });

  $("#bangnv").on("click", "#viewBtn", function () {
    let id = $(this).data("id");

    empty_modal();
    $.ajax({
      url: "get_chi_tiet_nhan_vien_by_id", // Replace with your actual endpoint URL
      type: "GET",
      success: function (res) {
        $(".modal-dialog").addClass("modal-lg");
        $("#modal_title").text("THÔNG TIN NHÂN VIÊN");
        let html = `
          <form id="viewForm">
            <div class="form-group row"> 
              <label for="id" class="col-sm-2 col-form-label">Id nhân viên</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="id" name="id" value="${res.id}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="idthe" class="col-sm-2 col-form-label">Id Thẻ</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="idthe" name="idthe" value="${res.idthe}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="hoten" class="col-sm-2 col-form-label">Họ và Tên</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="hoten" name="hoten" value="${res.hoten}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="gioitinh" class="col-sm-2 col-form-label">Giới Tính</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="gioitinh" name="gioitinh" value="${res.gioitinh}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="ngaysinh" class="col-sm-2 col-form-label">Ngày Sinh</label> 
              <div class="col-sm-10"> 
                <input type="date" class="form-control" id="ngaysinh" name="ngaysinh" value="${res.ngaysinh}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="diachi" class="col-sm-2 col-form-label">Địa Chỉ</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="diachi" name="diachi" value="${res.diachi}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="dienthoai" class="col-sm-2 col-form-label">Điện Thoại</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="dienthoai" name="dienthoai" value="${res.dienthoai}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="email" class="col-sm-2 col-form-label">Email</label> 
              <div class="col-sm-10"> 
                <input type="email" class="form-control" id="email" name="email" value="${res.email}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="idpb" class="col-sm-2 col-form-label">Phòng Ban</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="idpb" name="idpb" value="${res.idpb}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="idclv" class="col-sm-2 col-form-label">Ca Làm Việc</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="idclv" name="idclv" value="${res.idclv}"> 
              </div> 
            </div> 
            <div class="form-group row"> 
              <label for="trangthai" class="col-sm-2 col-form-label">Trạng Thái</label> 
              <div class="col-sm-10"> 
                <input type="text" class="form-control" id="trangthai" name="trangthai" value="${res.trangthai}"> 
              </div> 
            </div> 
          </form>`;
        $("#modal_body").append(html);

        $("#modal_footer").empty();
        $("#modal_footer").append(
          `<button type="button" class="btn btn-primary" data-id="${id}" id="modal_submit_btn"><i class="fas fa-edit"></i>  Cập nhật thông tin</button>`
        );
        $("#modal_id").modal("show");

        // Tính năng lưu thay đổi
        $("#modal_submit_btn").click(function () {
          let data_update = {
            id: id,
            hoten: $("#hoten").val(),
            gioitinh: $("#gioitinh").val(),
            ngaysinh: $("#ngaysinh").val(),
            diachi: $("#diachi").val(),
            dienthoai: $("#dienthoai").val(),
            email: $("#email").val(),
            trangthai: $("#trangthai").val(),
          };

          $.ajax({
            type: "POST",
            url: "update_nhanvien_by_id",
            data: data_update,
            success: function (res) {
              Toast.fire({
                icon: "success",
                title: "Cập nhật thành công!",
              });
              $("#modal_id").modal("hide");
              create_table(idu, idvt);
            },
            error: function (err) {
              Toast.fire({
                icon: "error",
                title: "Đã xảy ra lỗi! Vui lòng thử lại!",
              });
            },
          });
        });
      },
    });
  });
}

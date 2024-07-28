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

$(document).ready(function () {
  // Select2
  $(".select2").select2({
    theme: "bootstrap",
  });

  load_timeline_congviec();

  function load_timeline_congviec() {
    let timeline = $("#dscongviec");
    // Get danh sách công việc bằng ID nhóm
    $.ajax({
      type: "GET",
      url: "/get_ds_congviec_by_sinhvien_email",
      success: function (data) {
        let timeline_html = "";
        let count = 1;

        timeline.empty();

        $.each(data, function (idx, val) {
          let bg_color = "";
          let header_color = "";
          let btn_color = "";
          if (moment(val.ngayketthuc, "DD/MM/YYYY").isBefore(moment())) {
            header_color = "bg-danger";
            bg_color = "#ef99a1";
            btn_color = "btn-danger";
          } else {
            header_color = "bg-success";
            bg_color = "#a9f5bb";
            btn_color = "btn-success";
          }
          timeline_html += `<div class="time-label">
                              <span class="bg-info" id="thutu">Công việc #${count}</span>
                            </div>
                            <div>
                              <i class="fas fa-arrow-right bg-primary"></i>
                              <div class="timeline-item">
                                <h3 class="timeline-header ${header_color} row">
                                  <b id="ngay" class="col-lg-10">${val.ngaybatdau} <i class="fa-solid fa-arrow-right"></i> ${val.ngayketthuc}</b>
                                </h3>
                              <div class="timeline-body" id="congviec" style="background-color:${bg_color} !important; cursor: pointer;" onclick="load_ChiTietCongViec(${val.id})">
                                <strong>${val.ten}</strong><br><br> 
                                <p>${val.mota}</p>
                              </div>
                              </div>
                            </div>`;
          count++;
        });
        timeline.append(timeline_html);
      },
    });
  }
});

function load_ChiTietCongViec(id_congviec) {
  $("#bangdscongviec").empty();
  $("#bangdscongviec").append(`
    <thead>
      <tr>
        <th scope="col" style="text-align: center;" width="25%">Công việc</th>
        <th scope="col" style="text-align: center;" width="15%">Người thực hiện</th>
        <th scope="col" style="text-align: center;">Ghi chú</th>
        <th scope="col" style="text-align: center;" width="15%">Trạng thái</th>
        <th scope="col" style="text-align: center;" width="10%">Thao tác</th>
      </tr>
    </thead>
    `);

  let bang_congviec = $("#bangdscongviec").dataTable({
    paging: false,
    lengthChange: false,
    searching: false,
    ordering: false,
    info: false,
    destroy: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url:
        "get_chi_tiet_cong_viec_by_id_cong_viec_email_sv?id=" +
        parseInt(id_congviec),
      dataSrc: "",
      error: function () {
        $.fn.dataTable.ext.errMode = "throw";
        Toast.fire({
          icon: "error",
          title: "Bạn chưa được phân công công việc",
        });
      },
    },
    columns: [
      { data: "tencongviec" },
      { data: "nguoithuchien" },
      { data: "ghichu" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 0) {
            return '<center><span class="badge badge-warning">Đang thực hiện</span></center>';
          } else if (data == 1) {
            return '<center><span class="badge badge-success">Hoàn thành</span></center>';
          } else {
            return '<center><span class="badge badge-danger">Trễ hạn</span></center>';
          }
        },
      },
      {
        data: "id",
        render: function (data, type, row) {
          if (row.xacnhan === 0 && row.trangthai === 0) {
            return `<center>
                    <a class="btn btn-success btn-sm" data-id="${data}" id="confirmBtn">
                      <i class="fa-solid fa-check"></i>
                    </a>
                  </center>`;
          } else {
            if (row.xacnhan === 1 && row.trangthai === 1) {
              return `
                  <span class="badge badge-pill badge-success" data-toggle="tooltip" data-placement="bottom" title="Người hướng dẫn đã xác nhận hoàn thành công việc">
                    <i class="fa-solid fa-user-check"></i> Verified
                  </span>
                  `;
            } else {
              return ``;
            }
          }
        },
      },
    ],
  });

  bang_congviec.prop("hidden", false);

  // Bắt sự kiện xác nhận trạng thái chi tiết công việc
  $("#bangdscongviec").on("click", "#confirmBtn", function () {
    Swal.fire({
      title: `Xác nhận công việc đã hoàn thành?`,
      icon: `question`,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      if (result.isConfirmed) {
        let id = $(this).data("id");

        $.ajax({
          type: `POST`,
          url: `update_xac_nhan_trang_thai_cong_viec?idcongviec=${id}`,
          success: function () {
            Toast.fire({
              icon: "success",
              title: "Đã xác nhận trạng thái",
            });
            bang_congviec.ajax.reload();
          },
          error: function () {
            Toast.fire({
              icon: "error",
              title: "Xác nhận trạng thái thất bại",
            });
          },
        });
      }
    });
  });
}

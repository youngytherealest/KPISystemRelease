/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

/* global moment:false, Chart:false, Sparkline:false */

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

$(function () {
  "use strict";

  // Make the dashboard widgets sortable Using jquery UI
  $(".connectedSortable").sortable({
    placeholder: "sort-highlight",
    connectWith: ".connectedSortable",
    handle: ".card-header, .nav-tabs",
    forcePlaceholderSize: true,
    zIndex: 999999,
  });
  $(".connectedSortable .card-header").css("cursor", "move");

  // bootstrap WYSIHTML5 - text editor
  $(".textarea").summernote();

  $(".daterange").daterangepicker(
    {
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      startDate: moment().subtract(29, "days"),
      endDate: moment(),
    },
    function (start, end) {
      // eslint-disable-next-line no-alert
      alert(
        "You chose: " +
          start.format("MMMM D, YYYY") +
          " - " +
          end.format("MMMM D, YYYY")
      );
    }
  );

  /* jQueryKnob */
  $(".knob").knob();

  // jvectormap data
  var visitorsData = {
    US: 398, // USA
    SA: 400, // Saudi Arabia
    CA: 1000, // Canada
    DE: 500, // Germany
    FR: 760, // France
    CN: 300, // China
    AU: 700, // Australia
    BR: 600, // Brazil
    IN: 800, // India
    GB: 320, // Great Britain
    RU: 3000, // Russia
  };
  // --------------------------------------------------------------------------------------------------------------
  /* Chart.js Charts */
  $.ajax({
    type: "GET",
    url: "get_so_luong_sinh_vien_theo_truong",
    success: function (response) {
      // Donut chart for major
      let truong = [];
      let soluong = [];

      $.each(response, function (idx, val) {
        truong.push(val["truong"]);
        soluong.push(val["soluong"]);
      });

      var collegeChart = document
        .getElementById("college-chart-canvas")
        .getContext("2d");
      var myCollegeChart = new Chart(collegeChart, {
        type: "bar",
        data: {
          labels: truong,
          datasets: [
            {
              data: soluong,
              borderWidth: 1,
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(255, 159, 64, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(201, 203, 207, 0.8)",
              ],
            },
          ],
          hoverOffset: 1,
        },
        options: {
          responsive: true,
          plugins: {
            legend: false,
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  });

  // Clear modal
  let clearmodal = function clear_modal() {
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
  };

  $.ajax({
    type: "GET",
    url: "get_so_luong_sinh_vien_theo_nganh",
    success: function (response) {
      // Donut chart for major
      let nganh = [];
      let soluong = [];

      $.each(response, function (idx, val) {
        nganh.push(val["nganh"]);
        soluong.push(val["soluong"]);
      });
      var majorChart = document.getElementById("world_map").getContext("2d");
      var myMajorChart = new Chart(majorChart, {
        type: "pie",
        data: {
          labels: nganh,
          datasets: [
            {
              data: soluong,
              borderWidth: 1,
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(255, 159, 64, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(201, 203, 207, 0.8)",
              ],
            },
          ],
          hoverOffset: 4,
        },
        options: {
          responsive: true,
          cutoutPercentage: 70, // Độ lớn của lỗ trống ở giữa (giữa các vòng)
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },
  });
  $(document).ready(function () {
    let dashboard_bangdssv = $("#dashboard_bangdssv").DataTable({
      paging: true,
      lengthChange: false,
      searching: true,
      // ordering: true,
      order: [[0, "desc"]],
      info: true,
      autoWidth: false,
      responsive: true,
      ajax: {
        type: "GET",
        url: "get_all_sinh_vien",
        dataSrc: "",
      },
      columns: [
        {
          data: null,
          render: function (data, type, row, meta) {
            // Use meta.row to get the current row index, and add 1 to start from 1
            return "<center>" + (meta.row + 1) + "</center>";
          },
        },
        { data: "mssv" },
        { data: "hoten" },
        {
          data: "gioitinh",
          render: function (data, type, row) {
            if (data == 0) {
              return "Nữ";
            } else {
              return "Nam";
            }
          },
        },
        { data: "nganh" },
        { data: "truong" },
        {
          data: "trangthai",
          render: function (data, type, row) {
            if (data == 0) {
              return '<center><span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Chưa có nhóm</span></center>';
            } else if (data == 1) {
              return '<center><span class="badge badge-warning"><i class="fa-solid fa-circle-exclamation"></i> Chưa đánh giá</span></center>';
            } else {
              return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đã đánh giá</span></center>';
            }
          },
        },
        {
          data: "id",
          render: function (data, type, row) {
            return (
              '<a class="btn btn-info btn-sm" id="viewBtn" data-id="' +
              data +
              '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-danger btn-sm" data-id="' +
              data +
              '" id="deleteBtn"><i class="fas fa-trash"></i></a>'
            );
          },
        },
        {
          data: "luuy",
        },
      ],
      columnDefs: [
        {
          targets: 8,
          visible: false,
        },
      ],
      createdRow: function (row, data, dataIndex) {
        if (data.luuy == 1) {
          $(row).addClass("luuy-1");
        } else if (data.luuy == 2) {
          $(row).addClass("luuy-2");
        }
      },
    });
  });
});
// xem/sửa thông tin sinh viên
$("#dashboard_bangdssv").on("click", "#viewBtn", function () {
  let id = $(this).data("id");
  // Clear modal
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
  $.ajax({
    type: "GET",
    url: "get_chi_tiet_sinh_vien_by_id?id=" + id,
    success: function (res) {
      $(".modal-dialog").addClass("modal-lg");
      $("#modal_title").text("Thông tin sinh viên");
      let html = "";

      if (res.trangthai == 0) {
        html =
          '<table class="table" id="thongtinsinhvien"><tr>    <td>Họ tên</td>    <td> <input type="text" id="hoten_sv" value="' +
          res.hoten +
          '" class="form-control"/></td></tr><tr>    <td>MSSV</td>    <td><input type="text" id="mssv" value="' +
          res.mssv +
          '" class="form-control"/></td></tr><tr>    <td>Giới tính</td>    <td><select id="gioitinh_sv" class="form-control select2"><option value="1">Nam</option><option value="0">Nữ</option></select></td></tr><tr>    <td>SĐT</td>    <td><input type="tel" id="sdt_sv" value="' +
          res.sdt +
          '" class="form-control"/></td></tr><tr>    <td>Email</td>    <td><input type="email" id="email_sv" value="' +
          res.email +
          '" class="form-control"/></td></tr><tr>    <td>Điạ chỉ</td>    <td><input type="text" id="diachi_sv" value="' +
          res.diachi +
          '" class="form-control" /></td></tr><tr>    <td>Mã lớp</td>    <td><input type="text" id="malop_sv" value="' +
          res.malop +
          '" class="form-control"/></td></tr><tr>    <td>Khoá</td>    <td><input type="number" id="khoa_sv" value="' +
          res.khoa +
          '" class="form-control"/></td></tr><tr>    <td>Ngành</td>    <td><select id="nganh_sv" class="form-control select2">' +
          res.nganh +
          '</select></td></tr><tr>    <td>Trường</td>    <td><select id="truong_sv" class="form-control select2">' +
          res.truong +
          "</select></td></tr></table>";
      } else if (res.trangthai == 1) {
        html =
          '<table class="table" id="thongtinsinhvien"><tr>    <td>Họ tên</td>    <td><input type="text" id="hoten_sv" value="' +
          res.hoten +
          '" class="form-control"/></td></tr><tr>    <td>MSSV</td>    <td><input type="text" id="mssv" value="' +
          res.mssv +
          '" class="form-control"/></td></tr><tr>    <td>Giới tính</td>    <td><select id="gioitinh_sv" class="form-control select2"><option value="1">Nam</option><option value="0">Nữ</option></select></td></tr><tr>    <td>SĐT</td>    <td><input type="tel" id="sdt_sv" value="' +
          res.sdt +
          '" class="form-control"/></td></tr><tr>    <td>Email</td>    <td><input type="email" id="email_sv" value="' +
          res.email +
          '" class="form-control"/></td></tr><tr>    <td>Điạ chỉ</td>    <td><input type="text" id="diachi_sv" value="' +
          res.diachi +
          '" class="form-control" /></td></tr><tr>    <td>Mã lớp</td>    <td><input type="text" id="malop_sv" value="' +
          res.malop +
          '" class="form-control"/></td></tr><tr>    <td>Khoá</td>    <td><input type="number" id="khoa_sv" value="' +
          res.khoa +
          '" class="form-control"/></td></tr><tr>    <td>Ngành</td>    <td><select id="nganh_sv" class="form-control select2">' +
          res.nganh +
          '</select></td></tr><tr>    <td>Trường</td>    <td><select id="truong_sv" class="form-control select2">' +
          res.truong +
          "</select></td></tr><tr>    <td>Kỳ thực tập</td>    <td>" +
          res.ngaybatdau +
          "</td></tr><tr>    <td>Đề tài</td>    <td>" +
          res.tendetai +
          "</td></tr><tr>    <td>Tên nhóm</td>    <td>" +
          res.tennhom +
          "</td></tr><tr>    <td>Người hướng dẫn</td>    <td>" +
          res.nguoihuongdan +
          "</td></tr></table>";
      } else {
        html =
          '<table class="table" id="thongtinsinhvien"> <tr> <td>Họ tên</td> <td><input type="text" id="hoten_sv" value="' +
          res.hoten +
          '" class="form-control"/></td> </tr> <tr> <td>MSSV</td> <td><input type="text" id="mssv" value="' +
          res.mssv +
          '" class="form-control"/></td> </tr> <tr> <td>Giới tính</td> <td><select id="gioitinh_sv" class="form-control select2"><option value="1">Nam</option><option value="0">Nữ</option></select></td> </tr> <tr> <td>SĐT</td> <td><input type="tel" id="sdt_sv" value="' +
          res.sdt +
          '" class="form-control"/></td> </tr> <tr> <td>Email</td> <td><input type="email" id="email_sv" value="' +
          res.email +
          '" class="form-control"/></td> </tr> <tr> <td>Điạ chỉ</td> <td><input type="text" id="diachi_sv" value="' +
          res.diachi +
          '" class="form-control" /></td> </tr> <tr> <td>Mã lớp</td> <td><input type="text" id="malop_sv" value="' +
          res.malop +
          '" class="form-control"/></td> </tr> <tr> <td>Khoá</td> <td><input type="number" id="khoa_sv" value="' +
          res.khoa +
          '" class="form-control"/></td> </tr> <tr> <td>Ngành</td> <td><select id="nganh_sv" class="form-control select2">' +
          res.nganh +
          '</select></td> </tr> <tr> <td>Trường</td> <td><select id="truong_sv" class="form-control select2">' +
          res.truong +
          "</select></td> </tr> <tr> <td>Kỳ thực tập</td> <td>" +
          res.ngaybatdau +
          "</td> </tr> <tr> <td>Đề tài</td> <td>" +
          res.tendetai +
          "</td> </tr><tr>    <td>Tên nhóm</td>    <td>" +
          res.tennhom +
          "</td></tr> <tr> <td>Người hướng dẫn</td> <td>" +
          res.nguoihuongdan +
          '</td> </tr> <tr> <td> Ý thức kỷ luật </td> <td> <span class="badge badge-primary"> ' +
          res.ythuckyluat_number +
          " </span> " +
          res.ythuckyluat_text +
          ' </td> </tr> <tr> <td> Tuân thủ thời gian </td> <td> <span class="badge badge-primary"> ' +
          res.tuanthuthoigian_number +
          " </span> " +
          res.tuanthuthoigian_text +
          ' </td> </tr> <tr> <td> Kiến thức </td> <td> <span class="badge badge-primary"> ' +
          res.kienthuc_number +
          " </span> " +
          res.kienthuc_text +
          ' </td> </tr> <tr> <td> Kỷ năng nghề </td> <td> <span class="badge badge-primary"> ' +
          res.kynangnghe_number +
          " </span> " +
          res.kynangnghe_text +
          ' </td> </tr> <tr> <td> Khả năng làm việc độc lập </td> <td> <span class="badge badge-primary"> ' +
          res.khanangdoclap_number +
          " </span> " +
          res.khanangdoclap_text +
          ' </td> </tr> <tr> <td> Khả năng làm việc nhóm </td> <td> <span class="badge badge-primary"> ' +
          res.khanangnhom_number +
          " </span> " +
          res.khanangnhom_text +
          ' </td> </tr> <tr> <td> Khả năng giải quyết công việc </td> <td> <span class="badge badge-primary"> ' +
          res.khananggiaiquyetcongviec_number +
          " </span> " +
          res.khananggiaiquyetcongviec_text +
          ' </td> </tr> <tr> <td> Đánh giá chung </td> <td> <span class="badge badge-primary"> ' +
          res.danhgiachung_number +
          " </span> </td> </tr> </table>";
      }
      html +=
        '<script>$(".select2").select2({theme: "bootstrap",dropdownParent: $("#modal_id")});</script>';
      // Select danh sách ngành
      $.ajax({
        type: "GET",
        url: "get_danh_sach_nganh",
        success: function (data) {
          $.each(data, function (idx, val) {
            $("#nganh_sv").append(
              '<option value="' + val.id + '">' + val.ten + "</option>"
            );
          });
          $("#nganh_sv").val(res.id_nganh);
        },
      });

      // Select danh sách trường
      $.ajax({
        type: "GET",
        url: "get_danh_sach_truong",
        success: function (data) {
          $.each(data, function (idx, val) {
            $("#truong_sv").append(
              '<option value="' + val.id + '">' + val.ten + "</option>"
            );
          });
          $("#truong_sv").val(res.id_truong);
        },
      });

      $("#modal_body").append(html);
      $("#gioitinh_sv").val(res.gioitinh);
      $("#modal_footer").append(
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Hủy</button>  <button type="button" id="modal_save_button" data-id="' +
          id +
          '" class="btn btn-primary">Lưu</button>'
      );
      $("#modal_id").modal("show");

      // Chỉnh sửa thông tin
      $("#modal_save_button").on("click", function () {
        let id = $(this).data("id");

        let hoten_sv = $("#hoten_sv").val();
        let maso_sv = $("#mssv").val();
        let gioitinh_sv = $("#gioitinh_sv").val();
        let sdt_sv = $("#sdt_sv").val();
        let email_sv = $("#email_sv").val();
        let diachi_sv = $("#diachi_sv").val();
        let malop_sv = $("#malop_sv").val();
        let khoa_sv = $("#khoa_sv").val();
        let nganh_sv = $("#nganh_sv").val();
        let truong_sv = $("#truong_sv").val();

        $.ajax({
          type: "POST",
          url:
            "/update_sinh_vien_by_id?id=" +
            id +
            "&mssv=" +
            maso_sv +
            "&hoten=" +
            hoten_sv +
            "&gioitinh=" +
            gioitinh_sv +
            "&sdt=" +
            sdt_sv +
            "&email=" +
            email_sv +
            "&diachi=" +
            diachi_sv +
            "&malop=" +
            malop_sv +
            "&truong=" +
            truong_sv +
            "&nganh=" +
            nganh_sv +
            "&khoa=" +
            khoa_sv,
          success: function (data) {
            if (data.status == "OK") {
              $("#modal_id").modal("hide");
              $("#dashboard_bangdssv").DataTable().ajax.reload();
              Toast.fire({
                icon: "success",
                title: "Cập nhật thành công",
              });
            } else {
              Toast.fire({
                icon: "error",
                title: "Đã xãy ra lỗi",
              });
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Đã xãy ra lỗi",
            });
          },
        });
      });
    },
  });
});
// Thanh Phú Danh Sách Nhân Viên
$(document).ready(function () {
  // Load danh sách chức vụ vào bộ lọc
  $.ajax({
    type: "GET",
    url: "/get_all_chuc_vu",
    success: function (data) {
      if (data && data.length > 0) {
        let positionSelect = $("#filterPosition");
        data.forEach(function (position) {
          positionSelect.append(new Option(position, position));
        });
      }
    },
  });

  // Load danh sách trạng thái vào bộ lọc
  $.ajax({
    type: "GET",
    url: "/get_all_trang_thai",
    success: function (data) {
      if (data && data.length > 0) {
        let statusSelect = $("#filterStatus");
        statusSelect.append(new Option("Đang làm việc", 1));
        statusSelect.append(new Option("Nghỉ việc", 0));
      }
    },
  });

  // Load danh sách tỉnh thành vào bộ lọc
  $.ajax({
    type: "GET",
    url: "/get_all_provinces",
    success: function (data) {
      if (data && data.length > 0) {
        let provinceSelect = $("#filterProvince");
        data.forEach(function (province) {
          provinceSelect.append(new Option(province, province));
        });
      }
    },
  });

  let dashboard_bangdsnv = $("#dashboard_bangdsnv").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    pageLength: 20, // Giới hạn số lượng nhân viên hiển thị tối đa là 20
    order: [[1, "asc"]], // Sắp xếp ID theo thứ tự tăng dần
    info: true,
    autoWidth: false,
    responsive: true,
    language: {
      search: "Tìm Kiếm Nhanh:", // Thay đổi chữ "Search" thành "Tìm Kiếm Nhanh:"
    },
    ajax: {
      type: "GET",
      url: "/get_all_nhan_vien",
      dataSrc: "",
    },
    columns: [
      {
        data: null,
        render: function (data, type, row, meta) {
          return "<center>" + (meta.row + 1) + "</center>";
        },
      },
      { data: "id" },
      { data: "hoten" },
      {
        data: "gioitinh",
        render: function (data, type, row) {
          return data == 0 ? "Nữ" : "Nam";
        },
      },
      { data: "dienthoai" },
      { data: "email" },
      { data: "diachi" },
      { data: "tenvt" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 1) {
            return '<span style="color: green;">Đang làm việc</span>';
          } else {
            return '<span style="color: red;">Nghỉ việc</span>';
          }
        },
      },
    ],
  });

  window.filterTable = function () {
    let gender = $("#filterGender").val();
    let position = $("#filterPosition").val();
    let status = $("#filterStatus").val();
    let province = $("#filterProvince").val();

    dashboard_bangdsnv
      .column(3)
      .search(gender !== "all" ? gender : "")
      .draw();
    dashboard_bangdsnv
      .column(7)
      .search(position !== "all" ? position : "")
      .draw();
    dashboard_bangdsnv
      .column(8)
      .search(status !== "all" ? status : "")
      .draw();
    dashboard_bangdsnv
      .column(6)
      .search(province !== "all" ? province : "")
      .draw();
  };
});
// Submit sửa thông tin sinh viên

// Xóa thông tin sinh viên
$("#dashboard_bangdssv").on("click", "#deleteBtn", function () {
  let id = $(this).data("id");

  Swal.fire({
    title: "Bạn muốn xoá sinh viên " + id,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "update_xoa_sinh_vien_by_id?id=" + parseInt(id),
        success: function (res) {
          if (res.status == "OK") {
            Toast.fire({
              icon: "success",
              title: "Đã xoá",
            });
            $("#dashboard_bangdssv").DataTable().ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Xoá sinh viên thất bại do sinh viên đã có nhóm thực tập",
            });
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Xoá không thành công",
          });
        },
      });
    }
  });
});

$("#dashboard_dssinhviendanhgia").DataTable({
  paging: true,
  lengthChange: false,
  searching: true,
  order: [[0, "desc"]],
  info: true,
  autoWidth: false,
  responsive: true,
  ajax: {
    type: "GET",
    url: "/get_ds_chi_tiet_danh_gia",
    dataSrc: "",
    error: function () {
      $.fn.dataTable.ext.errMode = "throw";
    },
  },
  columns: [
    {
      data: null,
      render: function (data, type, row, meta) {
        // Use meta.row to get the current row index, and add 1 to start from 1
        return "<center>" + (meta.row + 1) + "</center>";
      },
    },
    { data: "mssv" },
    { data: "hoten_sinhvien" },
    { data: "tennhom" },
    { data: "tendetai" },
    { data: "nguoihuongdan_ten" },
    {
      data: "id",
      render: function (data, type, row) {
        return `<a class="btn btn-info btn-sm" id="viewBtn" data-id="${data}">
                  <i class="fas fa-eye"></i>
                </a>`;
      },
    },
  ],
  columnDefs: [],
});

$("#dashboard_dssinhviendanhgia").on("click", "#viewBtn", function () {
  let id = $(this).data("id");
  $.ajax({
    type: "GET",
    url: `/get_ds_chi_tiet_danh_gia_by_id?id=${id}`,
    success: function (res) {
      clear_modal();
      // Hien thi modal
      $(".modal-dialog").addClass("modal-lg");
      $("#modal_title").text(`Chi tiết đánh giá`);
      let body = `
      <table class="table table-hover table-borderless display">
        <tbody>
          <tr>
            <td>MSSV:</td>
            <td>${res.mssv}</td>
          </tr>
          <tr>
            <td>Họ tên:</td>
            <td>${res.hoten}</td>
          </tr>
          <tr>
            <td>Kỳ thực tập:</td>
            <td>${res.kythuctap}</td>
          </tr>
          <tr>
            <td>Tên nhóm:</td>
            <td>${res.tennhom}</td>
          </tr>
          <tr>
            <td>Đề tài:</td>
            <td>${res.detai}</td>
          </tr>
          <tr>
            <td>Người hướng dẫn:</td>
            <td>${res.nguoihuongdan}</td>
          </tr>
          <tr>
            <td>Độ hài lòng về môi trường làm việc:</td>
            <td>${convertDoHaiLong(res.dapan_1)}</td>
          </tr>
          <tr>
            <td>Độ hài lòng về thái độ hỗ trợ của người hướng dẫn:</td>
            <td>${convertDoHaiLong(res.dapan_2)}</td>
          </tr>
          <tr>
            <td>Độ hài lòng về khả năng ứng dụng thực tế của đề tài:</td>
            <td>${convertDoHaiLong(res.dapan_3)}</td>
          </tr>
          <tr>
            <td>Độ hài lòng về kiến thức, kinh nghiệm học được:</td>
            <td>${convertDoHaiLong(res.dapan_4)}</td>
          </tr>
        </tbody>
      </table>
      `;
      $("#modal_body").append(body);
      $("#modal_id").modal("show");
    },
    error: function (xhr, status, error) {
      Toast.fire({
        icon: "error",
        title: "Xoá không thành công",
      });
    },
  });
});

function convertDoHaiLong(num) {
  if (num == 2) {
    return `<span class="badge badge-success">Hài lòng</span>`;
  } else if (num == 1) {
    return `<span class="badge badge-warning">Bình thường</span>`;
  } else {
    return `<span class="badge badge-danger">Không hài lòng</span>`;
  }
}
document.addEventListener("DOMContentLoaded", function () {
  // Biểu đồ số lượng nhân viên theo vai trò
  const nhanVienTheoVaiTro = JSON.parse(
    document.getElementById("nhan_vien_theo_vai_tro").textContent
  );
  const labelsVaiTro = nhanVienTheoVaiTro.map((item) => item.role);
  const dataVaiTro = nhanVienTheoVaiTro.map((item) => item.count);

  const colors = [
    "rgba(54, 162, 235, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(153, 102, 255, 0.2)",
    "rgba(255, 159, 64, 0.2)",
  ];

  const borderColors = [
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
  ];

  const ctxRole = document.getElementById("role-chart-canvas").getContext("2d");
  new Chart(ctxRole, {
    type: "pie",
    data: {
      labels: labelsVaiTro,
      datasets: [
        {
          label: "Số Lượng",
          data: dataVaiTro,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const index = tooltipItem.dataIndex;
              const value = dataVaiTro[index];
              const label = labelsVaiTro[index];
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });
});

// Thanh Phú Tỷ lệ chấm công
$(document).ready(function () {
  // Load attendance rate data and create line chart
  function loadMonthlyAttendanceRate() {
    $.ajax({
      type: "GET",
      url: "/get_monthly_attendance_rate",
      success: function (response) {
        if (response.error) {
          console.log("Error: ", response.error);
          return;
        }
        let labels = response.map((item) => `Tháng ${item.month}`);
        let data = response.map((item) => item.attendance_rate);
        var ctx = document
          .getElementById("attendance_rate_line_chart")
          .getContext("2d");
        var attendanceRateChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Tỷ lệ chấm công (%)",
                data: data,
                borderWidth: 1,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return value + "%";
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("AJAX call failed: ", textStatus, errorThrown);
      },
    });
  }
});

// Thanh Phú Thống Nhân Viên Chưa Chấm Công
$(document).ready(function () {
  // Load danh sách phòng ban vào bộ lọc báo cáo
  $.ajax({
    type: "GET",
    url: "/get_all_phong_ban",
    success: function (data) {
      if (data && data.length > 0) {
        let departmentSelect = $("#reportDepartment");
        data.forEach(function (department) {
          departmentSelect.append(new Option(department, department));
        });
      }
    },
  });

  // Load danh sách chức vụ vào bộ lọc báo cáo
  $.ajax({
    type: "GET",
    url: "/get_all_chuc_vu",
    success: function (data) {
      if (data && data.length > 0) {
        let positionSelect = $("#reportPosition");
        data.forEach(function (position) {
          positionSelect.append(new Option(position, position));
        });
      }
    },
  });

  let dashboard_bangdsnv_kcc = $("#dashboard_bangdsnv_kcc").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    pageLength: 20,
    order: [[1, "asc"]],
    info: true,
    autoWidth: false,
    responsive: true,
    language: {
      search: "Tìm Kiếm Nhanh:",
    },
    ajax: {
      type: "GET",
      url: "/get_all_nhan_vien_khong_cham_cong",
      dataSrc: "",
    },
    columns: [
      {
        data: null,
        render: function (data, type, row, meta) {
          return "<center>" + (meta.row + 1) + "</center>";
        },
      },
      { data: "id" },
      { data: "hoten" },
      {
        data: "gioitinh",
        render: function (data, type, row) {
          return data == 0 ? "Nữ" : "Nam";
        },
      },
      { data: "dienthoai" },
      { data: "email" },
      { data: "diachi" },
      { data: "tenvt" },
      { data: "tenpb" },
      { data: "trangthai" }, // Cột trạng thái
    ],
    rowCallback: function (row, data) {
      let trangThaiCell = $(row).find("td").eq(9); // Cột trạng thái nằm ở vị trí thứ 9 (bắt đầu từ 0)
      if (data.trangthai === "Đi trễ") {
        trangThaiCell.css("color", "orange"); // Tô màu vàng cho nhân viên đi trễ
      } else {
        trangThaiCell.css("color", "red"); // Tô màu đỏ cho nhân viên chưa chấm công
      }
    },
  });

  window.filterReport = function () {
    let department = $("#reportDepartment").val();
    let position = $("#reportPosition").val();
    let date = $("#reportDate").val();

    let filter = {
      department: department !== "all" ? department : "",
      position: position !== "all" ? position : "",
      date: date,
    };

    dashboard_bangdsnv_kcc.ajax
      .url("/get_all_nhan_vien_khong_cham_cong?" + $.param(filter))
      .load();
  };
});
$(document).ready(function () {
  // Thiết lập ngày mặc định là ngày hôm nay
  let today = new Date().toISOString().substr(0, 10);
  document.getElementById("reportDate").value = today;

  // Load dữ liệu báo cáo theo ngày mặc định
  filterReport();
});

// Thanh Phú biểu đồ hiệu suất
function loadPerformanceChart() {
  $.ajax({
    type: "GET",
    url: "/get_performance_by_department",
    success: function (response) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const datasets = [];

      Object.keys(response).forEach((department, index) => {
        datasets.push({
          label: department,
          data: response[department],
          fill: false,
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(201, 203, 207, 1)",
          ][index % 7],
          tension: 0.1,
        });
      });

      const ctx = document
        .getElementById("performance-chart-canvas")
        .getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: months,
          datasets: datasets,
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `Số giờ: ${tooltipItem.raw}`;
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
              max: 100, // Tùy chỉnh giá trị tối đa của trục y nếu cần thiết
              ticks: {
                stepSize: 10, // Tùy chỉnh khoảng cách giữa các giá trị trên trục y
                callback: function (value) {
                  return Number.isInteger(value) ? value : null; // Chỉ hiển thị số nguyên
                },
              },
            },
          },
        },
      });
    },
  });
}

$(document).ready(function () {
  loadPerformanceChart(); // Load chart on page load
});

/// Thanh Phú Biểu đồ đi trễ về sớm theo tháng
function loadAttendancePercentagesChart() {
  $.ajax({
    type: "GET",
    url: "/get_attendance_percentages_by_month",
    success: function (response) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const ctx = document
        .getElementById("attendance-percentages-chart-canvas")
        .getContext("2d");

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "Đi Trễ",
              data: response.early_leave_percentage,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
            {
              label: "Về Sớm",
              data: response.late_percentage,
              backgroundColor: "rgba(255, 159, 64, 0.5)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
            {
              label: "Đúng giờ",
              data: response.on_time_percentage,
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Nghỉ",
              data: response.absent_percentage,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return (
                    tooltipItem.dataset.label + ": " + tooltipItem.raw + "%"
                  );
                },
              },
            },
          },
        },
      });
    },
  });
}

$(document).ready(function () {
  loadAttendancePercentagesChart(); // Load chart on page load
});

/////// Tỷ lệ đi làm đúng giờ giữa các phòng ban
function loadOnTimeRateByDepartmentChart() {
  $.ajax({
    type: "GET",
    url: "/get_on_time_rate_by_department_by_month",
    success: function (response) {
      const ctx = document
        .getElementById("on-time-rate-chart-canvas")
        .getContext("2d");

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const colors = [
        "rgba(255, 99, 132, 0.7)", // Màu đỏ nhạt
        "rgba(54, 162, 235, 0.7)", // Màu xanh dương nhạt
        "rgba(75, 192, 192, 0.7)", // Màu xanh lá nhạt
        "rgba(153, 102, 255, 0.7)", // Màu tím nhạt
        "rgba(255, 159, 64, 0.7)", // Màu cam nhạt
        "rgba(255, 205, 86, 0.7)", // Màu vàng nhạt
        "rgba(201, 203, 207, 0.7)", // Màu xám nhạt
      ];

      const borderColors = [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(201, 203, 207, 1)",
      ];

      const datasets = Object.keys(response).map((department, index) => {
        return {
          label: department,
          data: response[department],
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 1,
        };
      });

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: datasets,
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return (
                    tooltipItem.dataset.label + ": " + tooltipItem.raw + "%"
                  );
                },
              },
            },
          },
        },
      });
    },
  });
}

$(document).ready(function () {
  loadOnTimeRateByDepartmentChart(); // Load chart on page load
});

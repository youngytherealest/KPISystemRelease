$(document).ready(function () {
  // Initialize Select2 for filter
  $(".select2").select2({
    theme: "bootstrap",
  });

  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();

  // Populate year dropdown in descending order
  const filterNam = $("#filter_nam");
  const startYear = 2020; // Adjust the start year as needed

  // Loop from the current year down to the start year
  for (let year = currentYear; year >= startYear; year--) {
    filterNam.append(`<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`);
  }

  // Populate month dropdown
  const filterThang = $("#filter_thang");
  let maxMonth = currentMonth;
  if ($("#filter_nam").val() != currentYear) {
    maxMonth = 12; // Show all months for past years
  }
  for (let month = 1; month <= maxMonth; month++) {
    filterThang.append(
      `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${month}</option>`
    );
  }

  // Event listener for year change
  filterNam.on('change', function() {
    const selectedYear = parseInt($(this).val());
    filterThang.empty();

    // Adjust maxMonth depending on the selected year
    let maxMonth = selectedYear === currentYear ? currentMonth : 12;

    for (let month = 1; month <= maxMonth; month++) {
      filterThang.append(
        `<option value="${month}" ${month === currentMonth && selectedYear === currentYear ? 'selected' : ''}>${month}</option>`
      );
    }
  });

  $("#show_qucc").on("click", function () {
    Swal.fire({
      title: 'Quy ước chấm công',
      html: `
        <div class="text-reset" style="font-family: inherit; font-size: 1rem; line-height: 1.5; text-align: left;">
          <div><b>Trạng thái: </b></div>
          <div style="margin-left: 1cm;">
             <div><strong class="text-danger">Đi trễ: </strong><b>Chấm công sau 7h30</b></div>
          <div><strong class="text-danger">Về sớm: </strong><b>Chấm công trước 17h</b></div>
          <div><strong class="text-success">Đúng giờ: </strong><b>Chấm công trước 7h30 và chấm công sau 17h</b></div>
          </div>
          <div><b>Trạng thái chấm công: </b></div>
          <div style="margin-left: 1cm;">
            <div><strong class="text-success">Hoàn thành: </strong><b>Khi có đủ giờ vào và giờ ra</b></div>
            <div><strong class="text-danger">Không hoàn thành: </strong><b>Khi chỉ có giờ vào</b></div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Đóng',
        customClass: {
            confirmButton: 'btn btn-primary'
        }
    });
  });


  // Load initial data for filter options
  $.ajax({
    type: "GET",
    url: "/get_all_nhan_vien",
    success: function (data) {
      let filter_nhanvien = $("#filter_nhanvien");
      filter_nhanvien.empty(); // Clear previous options
      filter_nhanvien.append('<option value="-1" selected>Tất cả</option>'); // Add default option
      data.forEach((element) => {
        filter_nhanvien.append(
          `<option value="${element.id}">${element.id} - ${element.hoten}</option>`
        );
      });
    },
    error: function (xhr, status, error) {
      console.error("Error loading employees: ", error);
    }
  });

  // Initialize DataTable with current month and year as defaults
  create_table("-1", currentMonth, currentYear);

  // Event listener for filter change
  $("#filter_nhanvien, #filter_thang, #filter_nam").on("change", function () {
    let idu = $("#filter_nhanvien").val();
    let thang = $("#filter_thang").val();
    let nam = $("#filter_nam").val();
    // Reload table with new filters
    create_table(idu, thang, nam);
  });
});

$("#export_excel").on("click", function () {
  let table = $("#bang_dschamcong").DataTable();
  let data = table.rows({ search: "applied" }).data().toArray();

  if (data.length === 0) {
      // No data available, show an alert
      Swal.fire({
          icon: 'warning',
          title: 'Không có dữ liệu',
          confirmButtonText: 'Đóng',
           confirmButtonColor: '#3085d6'
      });
      return; // Exit the function to prevent exporting
  }

  let exportData = data.map((row, index) => {
      return {
          "STT": index + 1,
          "ID": row.idu,
          "Họ tên": row.hoten,
          "Ngày tháng": row.ngaythang,
          "Giờ vào": row.giovao,
          "Trạng thái vào": row.tre ? "Đi trễ" : "Đúng giờ",
          "Giờ ra": row.giora,
          "Trạng thái ra": row.som ? "Về sớm" : "Đúng giờ",
          "Trạng thái chấm công": row.hople ? "Hoàn thành" : "Không hoàn thành"
      };
  });

  let worksheet = XLSX.utils.json_to_sheet(exportData);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Chấm Công");

  // Save the Excel file
  XLSX.writeFile(workbook, `ChamCong_${$("#filter_thang").val()}_${$("#filter_nam").val()}.xlsx`);
});

// Function to create or recreate DataTable
function create_table(idu, thang, nam) {
  if ($.fn.DataTable.isDataTable('#bang_dschamcong')) {
    $('#bang_dschamcong').DataTable().destroy();
  }

  $("#bang_dschamcong").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url: `/get_cham_cong_by_idu_thang_nam?idu=${idu}&thang=${thang}&nam=${nam}`, // Pass selected IDU, thang, and nam
      dataSrc: "", // Adjust based on your response structure
      error: function (xhr, status, error) {
        console.error("Error loading attendance data: ", error);
      }
    },
    columns: [
      { 
        data: null,
        render: function (data, type, row, meta) {
          return "<center>" + (meta.row + 1) + "</center>";
        },
      },
      { data: "idu",
        render: function (data, type, row) {
          return "<center>" + data + "</center>";
        },
      },
      { data: "hoten" },
      {
        data: "ngaythang",
        render: function (data, type, row) {
          return "<center>" + data + "</center>";
        },
      },
      {
        data: "giovao",
        render: function (data, type, row) {
          return "<center>" + data + "</center>";
        }
      },
      {
        data: "tre",
        render: function (data, type, row) {
          if (data === false) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đúng giờ</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Đi trễ</span></center>';
          }
        },
      },
      {
        data: "giora",
        render: function (data, type, row) {
          return "<center>" + data + "</center>";
        }
      },
      {
        data: "som",
        render: function (data, type, row) {
          if (data === false) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đúng giờ</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Về sớm</span></center>';
          }
        },
      },
      { data: "hople",
        render: function (data, type, row) {
          if (data === true) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Hoàn thành</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Không hoàn thành</span></center>';
          }
        }, 
      },
      // { data: "id",
      //   render: function (data, type, row) {
      //     if (!row.hople) { // Nếu trạng thái chấm công là "Không hoàn thành"
      //       return (
      //         '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' 
      //         + data +
      //         '"><i class="fas fa-pencil-alt"></i></a></i></a></center>'
      //       );
      //     } else {
      //       return ''; // Nếu trạng thái chấm công là "Hoàn thành", không hiển thị gì
      //     }
      //   },
      // }
    ],
  });
}

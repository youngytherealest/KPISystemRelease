document.addEventListener("DOMContentLoaded", function () {
  // Lấy dữ liệu từ context của template
  const nhanVienTheoVaiTro = JSON.parse(
    document.getElementById("nhan_vien_theo_vai_tro").textContent
  );
  const phongBan = JSON.parse(document.getElementById("phong_ban").textContent);

  // Kiểm tra sự tồn tại của phần tử canvas
  const ctxRoleElement = document.getElementById("role-chart-canvas");
  const ctxDepartmentElement = document.getElementById("department-chart");

  if (ctxRoleElement && ctxDepartmentElement) {
    // Chuẩn bị dữ liệu cho biểu đồ số lượng nhân viên theo vai trò
    const labelsVaiTro = nhanVienTheoVaiTro.map((item) => item.role);
    const dataVaiTro = nhanVienTheoVaiTro.map((item) => item.count);

    // Vẽ biểu đồ số lượng nhân viên theo vai trò
    const ctxRole = ctxRoleElement.getContext("2d");
    new Chart(ctxRole, {
      type: "bar",
      data: {
        labels: labelsVaiTro,
        datasets: [
          {
            label: "Số Lượng",
            data: dataVaiTro,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Vẽ biểu đồ tổng số phòng ban của công ty
    const ctxDepartment = ctxDepartmentElement.getContext("2d");
    new Chart(ctxDepartment, {
      type: "doughnut",
      data: {
        labels: phongBan,
        datasets: [
          {
            label: "Phòng Ban",
            data: phongBan.map(() => 1), // Mỗi phòng ban là 1 phần trong biểu đồ tròn
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  } else {
    console.error("Phần tử canvas không tồn tại.");
  }
});


{% comment %} DataTables cho bảng nhân viên {% endcomment %}
$(document).ready(function () {
    $('#dashboard_employee_list').DataTable({
      "pageLength": 20, // Hiển thị 20 nhân viên đầu tiên
      "lengthChange": false, // Ẩn tùy chọn thay đổi số lượng hàng hiển thị
      "searching": true, // Kích hoạt tính năng tìm kiếm
      "ordering": true, // Kích hoạt tính năng sắp xếp
      "paging": true, // Kích hoạt tính năng phân trang
      "info": false // Ẩn thông tin về số lượng hàng hiển thị
    });
  });



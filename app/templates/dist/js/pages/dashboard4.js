document.addEventListener("DOMContentLoaded", function () {
  // Biểu đồ số lượng nhân viên theo vai trò
  const nhanVienTheoVaiTro = JSON.parse(
    document.getElementById("nhan_vien_theo_vai_tro").textContent
  );
  const labelsVaiTro = nhanVienTheoVaiTro.map((item) => item.role);
  const dataVaiTro = nhanVienTheoVaiTro.map((item) => item.count);

  const ctxRole = document.getElementById("role-chart-canvas").getContext("2d");
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
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
          max: 10, // Đặt giá trị tối đa của trục y là 3
          ticks: {
            stepSize: 1, // Đặt khoảng cách giữa các giá trị trên trục y là 1
          },
        },
      },
    },
  });

  // Biểu đồ tổng số phòng ban của công ty
  const phongBan = JSON.parse(document.getElementById("phong_ban").textContent);
  const ctxDepartment = document
    .getElementById("department-chart")
    .getContext("2d");
  new Chart(ctxDepartment, {
    type: "doughnut",
    data: {
      labels: phongBan,
      datasets: [
        {
          label: "Phòng Ban",
          data: phongBan.map(() => 1),
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

  // DataTables cho bảng nhân viên
  if (!$.fn.DataTable.isDataTable("#dashboard_employee_list")) {
    $("#dashboard_employee_list").DataTable({
      pageLength: 20, // Hiển thị 20 nhân viên đầu tiên
      lengthChange: false, // Ẩn tùy chọn thay đổi số lượng hàng hiển thị
      searching: true, // Kích hoạt tính năng tìm kiếm
      ordering: true, // Kích hoạt tính năng sắp xếp
      paging: true, // Kích hoạt tính năng phân trang
      info: false, // Ẩn thông tin về số lượng hàng hiển thị
    });
  }
});

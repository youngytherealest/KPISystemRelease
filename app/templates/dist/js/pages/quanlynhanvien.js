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

let dashboard_bangdsnv_moi = $("#dashboard_bangdsnv_moi").DataTable({
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
    url: "/get_all_nhan_vien_moi",
    dataSrc: "",
  },
  columns: [
    {
      data: null,
      render: function (data, type, row, meta) {
      return "<center>" + (meta.row + 1) + "</center>";
      },
    },
    { data: "id" , visible: false},
    { data: "idthe" }, // Xóa cột ID khỏi đây
    { data: "hoten" },
    {
    data: "gioitinh",
      render: function (data, type, row) {
      return data == 0 ? "Nữ" : "Nam";
      },
    },
    { data: "tenvt" },
    { data: "heso" },
    { data: "luongcb" },
    {
    data: "trangthai",
      render: function (data, type, row) {
      return data == 1 ? "Đang làm việc" : "Nghỉ việc";
      },
    },
    {
      data: null,
      render: function (data, type, row) {
      return `
      <button class="btn btn-info btn-sm" onclick="viewEmployee(${row.id})"><i class="fas fa-eye"></i></button>
      <button class="btn btn-warning btn-sm" onclick="editEmployee(${row.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${row.id})"><i class="fas fa-trash"></i></button>
      `;
      },
    },
  ],
});

function viewEmployee(id) {
  $.ajax({
    type: "GET",
    url: `/get_employee_details/${id}`,
    success: function (data) {
      if (data && !data.error) {
        const statusText = data.trangthai == 1 ? "Đang làm việc" : "Nghỉ việc";
        const hesoText = data.heso ? data.heso : "Không xác định";
        const luongcbText = data.luongcb ? data.luongcb : "Không xác định";
        // Hiển thị thông tin chi tiết của nhân viên
        $("#employeeDetailsModal .modal-body").html(`
        <p><strong>ID Thẻ:</strong> ${data.idthe}</p>
        <p><strong>Tên:</strong> ${data.hoten}</p>
        <p><strong>Giới tính:</strong> ${data.gioitinh == 0 ? "Nữ" : "Nam"}</p>
        <p><strong>Ngày sinh:</strong> ${data.ngaysinh}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Địa chỉ:</strong> ${data.diachi}</p>
        <p><strong>Phòng ban:</strong> ${data.tenpb}</p>
        <p><strong>Chức vụ:</strong> ${data.tenvt}</p>
        <p><strong>Hệ Số Lương:</strong> ${hesoText}</p>
        <p><strong>Lương Cơ Bản:</strong> ${luongcbText}</p>
        <p><strong>Trạng thái:</strong> ${statusText}</p>
        `);
        $("#employeeDetailsModal").modal("show");
      } else {
        alert("Không thể lấy thông tin chi tiết của nhân viên. Dữ liệu trả về trống hoặc có lỗi.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy thông tin nhân viên:", error);
       alert("Đã xảy ra lỗi khi lấy thông tin nhân viên. Vui lòng thử lại.");
    },
  });
}

function editEmployee(id) {
  $.ajax({
    type: "GET",
    url: `/get_employee_details/${id}`,
    success: function (data) {
      if (data && !data.error) {
        // Chuyển đổi dấu phẩy thành dấu chấm trong hệ số lương trước khi hiển thị
        const heso = data.heso.toString().replace(",", ".");
        // Điền thông tin nhân viên vào form chỉnh sửa
        $("#editEmployeeForm #employeeId").val(data.id);
        $("#editEmployeeForm #employeeIdThe").val(data.idthe);
        $("#editEmployeeForm #employeeName").val(data.hoten);
        $("#editEmployeeForm #employeeGender").val(data.gioitinh == 0 ? "Nữ" : "Nam");
        $("#editEmployeeForm #employeeBirthday").val(data.ngaysinh);
        $("#editEmployeeForm #employeeEmail").val(data.email);
        $("#editEmployeeForm #employeeAddress").val(data.diachi);
        $("#editEmployeeForm #employeeDepartmens").val(data.tenpb);
        $("#editEmployeeForm #employeePosition").val(data.tenvt);
        $("#editEmployeeForm #employeeSalaryCoefficient").val(heso); // Hiển thị giá trị hệ số lương đã được chuyển đổi
        $("#editEmployeeForm #employeeBasicSalary").val(data.luongcb);
        $("#editEmployeeForm #employeeStatus").val(data.trangthai);
        // Hiển thị modal chỉnh sửa
        $("#editEmployeeModal").modal("show");
      } else {
        alert("Không thể lấy thông tin chi tiết của nhân viên.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy thông tin nhân viên:", error);
      alert("Đã xảy ra lỗi khi lấy thông tin nhân viên.");
    },
  });

  $("#editEmployeeForm").on("submit", function (e) {
    e.preventDefault();
    const updatedData = {
      id: $("#editEmployeeForm #employeeId").val(),
      idthe: $("#editEmployeeForm #employeeIdThe").val(),
      hoten: $("#editEmployeeForm #employeeName").val(),
      gioitinh: $("#editEmployeeForm #employeeGender").val(),
      email: $("#editEmployeeForm #employeeEmail").val(),
      diachi: $("#editEmployeeForm #employeeAddress").val(),
      idvt: parseInt($("#editEmployeeForm #employeePosition").val()),
      luongcb: $("#editEmployeeForm #employeeBasicSalary").val(),
      trangthai: parseInt($("#editEmployeeForm #employeeStatus").val()),
    };
    if (!confirm("Bạn có chắc chắn muốn lưu các thay đổi này không?")) {
    return;
    }


    $.ajax({
      type: "POST",
      url: `/update_employee/${updatedData.id}`,
      data: JSON.stringify(updatedData),
      contentType: "application/json",
      success: function (response) {
        if (response && !response.error) {
          alert("Cập nhật thông tin nhân viên thành công.");
          $("#editEmployeeModal").modal("hide");
          $("#dashboard_bangdsnv_moi").DataTable().ajax.reload();
        } else {
          alert("Không thể cập nhật thông tin nhân viên.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi cập nhật thông tin nhân viên:", error);
        alert("Đã xảy ra lỗi khi cập nhật thông tin nhân viên.");
      },
    });
  });
}

function deleteEmployee(id) {
  if (confirm("Bạn có chắc chắn muốn vô hiệu hóa thông tin nhân viên này không?")) {
    $.ajax({
      type: "DELETE",
      url: `/delete_employee/${id}`,
      success: function (response) {
        if (response && !response.error) {
          alert("Xóa nhân viên thành công.");
          $("#dashboard_bangdsnv_moi").DataTable().ajax.reload();
        } else {
          alert("Không thể xóa nhân viên.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        alert("Đã xảy ra lỗi khi xóa nhân viên.");
      },
    });
  };
}


function loadDepartmentsAndPositions() {
  $.ajax({
    type: "GET",
    url: "/get_all_phong_ban",
    success: function (data) {
      let departmentSelect = $("#newEmployeeDepartment");
      departmentSelect.empty();
      data.forEach(function (department) {
        departmentSelect.append(
          new Option(department.tenpb, department.idpb)
        );
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tải danh sách Phòng Ban:", error);
      alert("Đã xảy ra lỗi khi tải danh sách Phòng Ban.");
    },
  });

  $.ajax({
    type: "GET",
    url: "/get_all_chuc_vu",
    success: function (data) {
      let positionSelect = $("#newEmployeePosition");
      positionSelect.empty();
      data.forEach(function (position) {
        positionSelect.append(new Option(position.tenvt, position.idvt));
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tải danh sách Chức Vụ:", error);
      alert("Đã xảy ra lỗi khi tải danh sách Chức Vụ.");
    },
  });
}

$(document).ready(function () {
  // Mở modal Thêm Nhân Viên khi nhấn nút
  $("#addEmployeeButton").on("click", function () {
    // Tải danh sách chức vụ và phòng ban từ server vào phần chọn
    loadDepartmentsAndPositions();
    // Hiển thị modal thêm nhân viên
    $("#addEmployeeModal").modal("show");
  });
  // Xử lý sự kiện đóng modal
  $("#addEmployeeModal .btn-close, #addEmployeeModal .btnsecondary").on("click",
    function () {
      $("#addEmployeeModal").modal("hide");
    }
  );
  // Xử lý lưu thông tin nhân viên mới
  $("#addEmployeeForm").on("submit", function (e) {
    e.preventDefault();
    const newEmployeeData = {
      idthe: $("#employeeIdThe").val(),
      idpb: $("#newEmployeeDepartment").val(),
      hoten: $("#newEmployeeName").val(),
      gioitinh: $("#newEmployeeGender").val(),
      ngaysinh: $("#newEmployeeBirthdate").val(),
      diachi: $("#newEmployeeAddress").val(),
      sdt: $("#newEmployeePhone").val(),
      email: $("#newEmployeeEmail").val(),
      idvt: $("#newEmployeePosition").val(),
      trangthai: $("#newEmployeeStatus").val(),
    };
    if (!newEmployeeData.idthe) {
      alert("ID Thẻ không được bỏ trống.");
      return;
    }
    $.ajax({
      type: "POST",
      url: "/add_employee",
      data: JSON.stringify(newEmployeeData),
      contentType: "application/json",
      success: function (response) {
        if (response && !response.error) {
          alert("Thêm nhân viên thành công.");
          $("#addEmployeeModal").modal("hide");
          $("#dashboard_bangdsnv_moi").DataTable().ajax.reload();
        } else {
          alert("Không thể thêm nhân viên.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        alert("Ðã xảy ra lỗi khi thêm nhân viên.");
      },
    });
  });
});
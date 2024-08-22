document.addEventListener('DOMContentLoaded', function () {
    // Lấy ngày hiện tại 
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth bắt đầu từ 0 nên cộng thêm 1
    const currentYear = now.getFullYear();

    // Đặt tháng và năm đã chọn trong danh sách thả xuống
    const monthSelect = document.getElementById('filter-month');
    const yearSelect = document.getElementById('filter-year');

    // Cập nhật vô hiệu hóa tháng
    function updateMonthOptions(selectedYear) {
        monthSelect.querySelectorAll('option').forEach(option => {
            const optionValue = parseInt(option.value, 10);
            if ((selectedYear === currentYear && optionValue > currentMonth) || selectedYear > currentYear) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }

    // Cập nhật vô hiệu hóa năm
    function updateYearOptions(selectedMonth) {
        yearSelect.querySelectorAll('option').forEach(option => {
            const optionValue = parseInt(option.value, 10);
            if (optionValue > currentYear || (optionValue === currentYear && selectedMonth > currentMonth)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }

    // Cập nhật lần đầu các tùy chọn tháng dựa trên năm hiện tại
    updateMonthOptions(currentYear);

    // Đặt tháng và năm hiện tại như được chọn theo mặc định
    monthSelect.value = String(currentMonth).padStart(2, '0');
    yearSelect.value = currentYear;

    // Cập nhật tháng khi năm được thay đổi
    yearSelect.addEventListener('change', function () {
        const selectedYear = parseInt(this.value, 10);
        updateMonthOptions(selectedYear);
        updateYearOptions(parseInt(monthSelect.value, 10));
        resetCheckboxes();
    });

    // Cập nhật năm khi tháng được thay đổi
    monthSelect.addEventListener('change', function () {
        const selectedMonth = parseInt(this.value, 10);
        updateYearOptions(selectedMonth);
        resetCheckboxes();
    });

    // Gán sự kiện cho các nút và checkbox
    const restoreBtn = document.getElementById('restore-btn');
    const saveSelectedEmployeeBtn = document.getElementById('save-selected-employee-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    
     // Hàm đặt lại trạng thái của các checkbox
     function resetCheckboxes() {
        // Bỏ tick tất cả checkbox con
        document.querySelectorAll('.select-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        // Bỏ tick checkbox cha (chọn tất cả)
        selectAllCheckbox.checked = false;
        // Ẩn các nút liên quan
        toggleDeleteButton();
    }

    // Hàm cập nhật trạng thái nút và checkbox "Chọn tất cả"
    function toggleDeleteButton() {
        const anyChecked = document.querySelectorAll('.select-checkbox:checked').length > 0;

        if (restoreBtn && saveSelectedEmployeeBtn) {
            if (anyChecked) {
                restoreBtn.style.display = 'block';
                saveSelectedEmployeeBtn.style.display = 'block';
            } else {
                restoreBtn.style.display = 'none';
                saveSelectedEmployeeBtn.style.display = 'none';
            }
        }

        const allChecked = document.querySelectorAll('.select-checkbox').length === document.querySelectorAll('.select-checkbox:checked').length;
        selectAllCheckbox.checked = allChecked;
    }

    // Gán sự kiện cho checkbox "Chọn tất cả"
    selectAllCheckbox.addEventListener('change', function () {
        const isChecked = this.checked;
        document.querySelectorAll('.select-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        toggleDeleteButton();
    });

    // Event delegation để lắng nghe thay đổi trên checkbox con
    document.addEventListener('change', function (event) {
        if (event.target.classList.contains('select-checkbox')) {
            toggleDeleteButton();
        }
    });

    // Khởi tạo lại trạng thái ban đầu
    toggleDeleteButton();

    // Gán sự kiện cho nút xuất file theo thông tin nhân viên đã chọn
    if (restoreBtn) {
        restoreBtn.addEventListener('click', function() {
            const selectAllChecked = selectAllCheckbox.checked;

            // Lấy giá trị của month và year từ dropdown
            const month = monthSelect.value;
            const year = yearSelect.value;

            // Kiểm tra nếu month và year chưa được chọn
            if (month === '00' || year === '00') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cảnh báo',
                    text: 'Vui lòng chọn tháng và năm.',
                });
                return;
            }

            if (selectAllChecked) {
                // Nếu chọn "Chọn tất cả", xuất toàn bộ thông tin nhân viên
                fetch(`/get_danh_sach_luong?month=${month}&year=${year}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.length > 0) {
                            // Tạo bảng với tiêu đề cột
                            const worksheetData = [
                                ['Mã nhân viên', 'Mã thẻ', 'Họ tên', 'Chức vụ', 'Hệ số lương', 'Lương cơ bản', 'Số lần đến trễ', 'Số lần về sớm', 'Số lần vắng', 'Số ngày làm dư', 'Lương tạm thời']
                            ];
            
                            data.forEach(row => {
                                let result = calculateSalary(row.he_so, row.luong_cb, row.tre, row.som, row.vang, row.du);
            
                                worksheetData.push([
                                    String(row.id),
                                    String(row.id_the),
                                    String(row.ho_ten),
                                    String(row.ten_vt),
                                    String(row.he_so),
                                    `${row.luong_cb.toLocaleString('vi-VN')} đ`,
                                    String(row.tre),
                                    String(row.som),
                                    String(row.vang),
                                    String(row.du),
                                    `${result.toLocaleString('vi-VN')} đ`
                                ]);
                            });
            
                            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                            const workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách nhân viên');
            
                            // Độ rộng cột
                            worksheet['!cols'] = [
                                { wch: 12 }, // Mã nhân viên
                                { wch: 13 }, // Mã thẻ
                                { wch: 20 }, // Họ tên
                                { wch: 15 }, // Chức vụ
                                { wch: 10 }, // Hệ số lương
                                { wch: 15 }, // Lương cơ bản
                                { wch: 15 }, // Số lần đến trễ
                                { wch: 15 }, // Số lần về sớm
                                { wch: 15 }, // Số lần vắng
                                { wch: 15 }, // Số ngày làm dư
                                { wch: 15 }  // Lương tạm thời
                            ];
            
                            // Xuất file Excel
                            const fileName = `danh_sach_bang_luong_${month}_${year}.xlsx`;
                            XLSX.writeFile(workbook, fileName);
                        } else {
                            Swal.fire({
                                icon: 'info',
                                title: 'Thông báo',
                                text: 'Không có dữ liệu để xuất.',
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Có lỗi xảy ra khi xuất file. Vui lòng thử lại.',
                        });
                    });
            }
             else {
                // Nếu không chọn tất cả, xuất file dựa trên ID của các checkbox được chọn
                const selectedIds = Array.from(document.querySelectorAll('.select-checkbox:checked')).map(checkbox => checkbox.dataset.id);

                if (selectedIds.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cảnh báo',
                        text: 'Chưa chọn nhân viên nào.',
                    });
                    return;
                }

                exportSelectedFiles(selectedIds, month, year);
            }
        });
    }

    if (saveSelectedEmployeeBtn) {
        saveSelectedEmployeeBtn.addEventListener('click', async function() {
            const selectAllChecked = selectAllCheckbox.checked;

            // Lấy giá trị của month và year từ dropdown
            const month = monthSelect.value;
            const year = yearSelect.value;

            // Kiểm tra nếu month và year chưa được chọn
            if (month === '00' || year === '00') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cảnh báo',
                    text: 'Vui lòng chọn tháng và năm.',
                });
                return;
            }

            if (selectAllChecked) {
                // Nếu chọn "Chọn tất cả", lưu toàn bộ thông tin nhân viên
                try {
                    const response = await fetch(`/get_danh_sach_luong?month=${month}&year=${year}`);
                    if (!response.ok) {
                        throw new Error('Error fetching employee list');
                    }
                    const employees = await response.json();

                    const savePromises = employees.map(async (employee) => {
                        let result = calculateSalary(employee.he_so, employee.luong_cb, employee.tre, employee.som, employee.vang, employee.du);
                        let send = {
                            id: employee.id,
                            idthe: employee.id_the,
                            hoten: employee.ho_ten,
                            tenvt: employee.ten_vt,
                            heso: employee.he_so,
                            luongcb: employee.luong_cb,
                            tre: employee.tre,
                            som: employee.som,
                            vang: employee.vang,
                            du_: employee.du,
                            luongtamthoi: result,
                            ngayluu: new Date().toISOString().split("T")[0],
                            thang: month,
                            year: year,
                        };

                        const saveResponse = await fetch("/save_info_luong", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(send),
                        });

                        if (!saveResponse.ok) {
                            throw new Error("Error saving employee information");
                        }

                        return saveResponse.json();
                    });

                    await Promise.all(savePromises);
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: 'Lưu thông tin lương thành công!',
                    });
                } catch (error) {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Đã xảy ra lỗi khi lưu thông tin lương.',
                    });
                }
            } else {
                // Nếu không chọn tất cả, lưu thông tin dựa trên ID của các checkbox được chọn
                const selectedIds = Array.from(document.querySelectorAll('.select-checkbox:checked')).map(checkbox => checkbox.dataset.id);

                if (selectedIds.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cảnh báo',
                        text: 'Chưa chọn nhân viên nào.',
                    });
                    return;
                }

                saveSelectedEmployees(selectedIds, month, year);
            }
        });
    }

    //Hàm xuất thông tin nhân viên (chọn nhiều)
    function exportSelectedFiles(selectedIds, month, year) {
        fetch(`/get_danh_sach_luong?month=${month}&year=${year}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.length > 0) {
                    const filteredData = data.filter(row => selectedIds.includes(String(row.id)));
    
                    if (filteredData.length > 0) {
                        const workbook = XLSX.utils.book_new();
    
                        // Tạo bảng với tiêu đề cột
                        const worksheetData = [
                            ['Mã nhân viên', 'Mã thẻ', 'Họ tên', 'Chức vụ', 'Hệ số lương', 'Lương cơ bản', 'Số lần đến trễ', 'Số lần về sớm', 'Số lần vắng', 'Số ngày làm dư', 'Lương tạm thời']
                        ];
    
                        filteredData.forEach(row => {
                            let result = calculateSalary(row.he_so, row.luong_cb, row.tre, row.som, row.vang, row.du);
                            worksheetData.push([
                                String(row.id),
                                String(row.id_the),
                                String(row.ho_ten),
                                String(row.ten_vt),
                                String(row.he_so),
                                `${row.luong_cb.toLocaleString('vi-VN')} đ`,
                                String(row.tre),
                                String(row.som),
                                String(row.vang),
                                String(row.du),
                                `${result.toLocaleString('vi-VN')} đ`
                            ]);
                        });
    
                        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
                        // Set column widths
                        worksheet['!cols'] = [
                            { wch: 12 }, // Mã nhân viên
                            { wch: 13 }, // Mã thẻ
                            { wch: 20 }, // Họ tên
                            { wch: 15 }, // Chức vụ
                            { wch: 10 }, // Hệ số lương
                            { wch: 15 }, // Lương cơ bản
                            { wch: 15 }, // Số lần đến trễ
                            { wch: 15 }, // Số lần về sớm
                            { wch: 15 }, // Số lần vắng
                            { wch: 15 }, // Số ngày làm dư
                            { wch: 15 }  // Lương tạm thời
                        ];
        
    
                        XLSX.utils.book_append_sheet(workbook, worksheet, `Danh sách lương`);
    
                        // Xuất file Excel
                        const fileName = `danh_sach_bang_luong_${month}_${year}.xlsx`;
                        XLSX.writeFile(workbook, fileName);
                    } else {
                        Swal.fire({
                            icon: 'info',
                            title: 'Thông báo',
                            text: 'Không có dữ liệu để xuất.',
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Thông báo',
                        text: 'Không có dữ liệu để xuất.',
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Có lỗi xảy ra khi xuất file. Vui lòng thử lại.',
                });
            });
    }
    //Hàm lưu thông tin nhân viên (chọn nhiều)
    function saveSelectedEmployees(selectedIds, month, year) {
        fetch(`/get_danh_sach_luong?month=${month}&year=${year}`)
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(row => selectedIds.includes(String(row.id)));
    
                if (filteredData.length > 0) {
                    const savePromises = filteredData.map(async (employee) => {
                        let result = calculateSalary(employee.he_so, employee.luong_cb, employee.tre, employee.som, employee.vang, employee.du);
                        let send = {
                            id: employee.id,
                            idthe: employee.id_the,
                            hoten: employee.ho_ten,
                            tenvt: employee.ten_vt,
                            heso: employee.he_so,
                            luongcb: employee.luong_cb,
                            tre: employee.tre,
                            som: employee.som,
                            vang: employee.vang,
                            du_: employee.du,
                            luongtamthoi: result,
                            ngayluu: new Date().toISOString().split("T")[0],
                            thang: month,
                            year: year,
                        };
    
                        const saveResponse = await fetch("/save_info_luong", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(send),
                        });
    
                        if (!saveResponse.ok) {
                            throw new Error(`Error saving employee information for ${employee.ho_ten}`);
                        }
    
                        return saveResponse.json();
                    });
    
                    return Promise.all(savePromises);
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Thông báo',
                        text: 'Không có nhân viên nào để lưu.',
                    });
                    return Promise.reject();
                }
            })
            .then(results => {
                console.log('All selected employees saved successfully:', results);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Lưu thông tin nhân viên đã chọn thành công!',
                });
            })
            .catch(error => {
                console.error('Error saving employees:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Có lỗi xảy ra khi lưu thông tin nhân viên đã chọn. Vui lòng thử lại.',
                });
            });
    }
    
     // Hiển thị quy định tính lương tạm thời
     document.getElementById('salary-rules-btn').addEventListener('click', function() {
        document.getElementById('salary-rules-modal').style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('salary-rules-modal').style.display = 'none';
    });

    //Đóng form khi ấn ngoài vùng modal
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('salary-rules-modal')) {
            document.getElementById('salary-rules-modal').style.display = 'none';
        }
    });
    
});


// Lấy ngày hiên tại
const date = new Date();
const currentMonth = date.getMonth() + 1; 
const currentYear = date.getFullYear();

// Chức năng tải lại bảng với dữ liệu mới dựa trên tháng và năm
function loadTableData(month, year) {
    bangdsluong.ajax
        .url(`/get_danh_sach_luong?month=${month}&year=${year}`)
        .load();
}

// Hàm tính lương tạm thời
function calculateSalary(hesoluong, luongcoban, tre, som, vang, du) {
    let luonghangngay = (hesoluong * luongcoban) / 25;
    let tientru = 0;

    if (tre > 3) {
        tientru += (tre - 3) * 10000;
    }
    if (som > 3) {
        tientru += (som - 3) * 10000;
    }

    let luongvang = vang * luonghangngay;
    let luongdu = du * luonghangngay * 2;

    return hesoluong * luongcoban - tientru - luongvang + luongdu;
}

//Load dữ liệu lên DataTable
let bangdsluong = $("#bangdsluong").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    autoWidth: false,
    responsive: true,
    ajax: {
        type: "GET",
        url: `/get_danh_sach_luong?month=${currentMonth}&year=${currentYear}`, 
        dataSrc: "", 
    },
    columns: [
        {
            data: "check_box",
            title: `<center><input type="checkbox" id="select-all-checkbox" class="select-checkbox" style="margin-left: 15px;" /></center>`,
            render: function (data, type, row, meta) {
                return `<center><input type="checkbox" id='child-checkbox' class="select-checkbox child-checkbox" data-id="${row.id}"></center>`;
            },
        },        
        // { data: "id", title: "ID"},
        // { data: "id_the", title: "ID thẻ" },
        {
            data: null,
            title: "STT",
            render: function (data, type, row, meta) {
                return "<center>" + (meta.row + 1) + "</center>";
            },
        },
        { data: "ho_ten", title: "Họ tên" },
        { data: "ten_vt", title: "Chức vụ" },
        { data: "he_so", title: "Hệ số lương" },
        {
            data: "luong_cb",
            title: "Lương cơ bản",
            render: function (data, type, row) {
                // Định dạng số với phân cách hàng nghìn
                return data.toLocaleString('vi-VN');
            }
        },
        {
            data: "tre",
            title: "Số lần đi trễ",
            render: function(data, type, row) {
                // bé hơn hoặc bằng 3 thì màu xanh, trên 3 màu đỏ, trên 15 lần thì cảnh bảo
                let color = data <= 3 ? 'green' : 'red';
                let warning = data > 15 ? '<br><span style="color: red;">Cảnh báo</span>' : '';
                return `<span style="color: ${color}; padding: 3px;">${data}</span>${warning}`;
            }
        },
        {
            data: "som",
            title: "Số lần về sớm",
            render: function(data, type, row) {
                let color = data <= 3 ? 'green' : 'red';
                let warning = data > 15 ? '<br><span style="color: red;">Cảnh báo</span>' : '';
                return `<span style="color: ${color}; padding: 3px;">${data}</span>${warning}`;
            }
        },
        {
            data: "vang",
            title: "Số lần vắng",
            render: function(data, type, row) {
                let color = data <= 3 ? 'green' : 'red';
                let warning = data > 15 ? '<br><span style="color: red;">Cảnh báo</span>' : '';
                return `<span style="color: ${color}; padding: 3px;">${data}</span>${warning}`;
            }
        },
        {
            data: "du",
            title: "Số ngày làm dư",
            render: function(data, type, row) {
                let color = data > 0 ? 'blue' : 'black';
                return `<span style="color: ${color}; padding: 3px;">${data}</span>`;
            }
        },
        {
            title: "Lương tạm thời",
            render: function (data, type, row) {
                return calculateSalary(row.he_so, row.luong_cb, row.tre, row.som, row.vang, row.du).toLocaleString('vi-VN');
            },
        },
        {
            title: "Thao tác",
            render: function (data, type, row) {
                return `
                  <button class="btn btn-danger btn-sm" onclick="editRow(${row.id}, ${row.month}, ${row.year})">
                       <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-success btn-sm" onclick="exportFileToWord(${row.id}, ${row.month}, ${row.year})">
                        <i class="bi bi-file-earmark-text"></i>
                  </button>
                  <button class="btn btn-info btn-sm mt-1" onclick="saveData(${row.id}, ${row.month}, ${row.year})">
                       <i class="bi bi-download"></i>
                  </button>
              `;
            },
            orderable: false,
        },
    ],
});

// Tải dữ liệu ban đầu với tháng và năm hiện tại
loadTableData(currentMonth, currentYear);

// Lắng nghe thay đổi trong bộ lọc tháng và năm
$("#filter-month, #filter-year").on("change", function () {
    let month = $("#filter-month").val();
    let year = $("#filter-year").val();
    if (month == "00") month = currentMonth; // Đặt thành tháng hiện tại nếu là "00" -> Chọn tháng
    if (year == "00") year = currentYear; // Đặt thành năm hiện tại nếu là "00" -> Chọn năm
    loadTableData(month, year);
});
// Xem thông tin nhân viên chi tiết
function editRow(id, month, year) {
    fetch(`/get_danh_sach_luong_by_id?id=${id}&month=${month}&year=${year}`)
        .then((response) => response.json())
        .then((data) => {
            data = data[0];
            document.getElementById("id").value = data.id;
            document.getElementById("id_the").value = data.id_the;
            document.getElementById("ho_ten").value = data.ho_ten;
            

            // Giả sử data.ngay_sinh là chuỗi ngày tháng năm định dạng "YYYY-MM-DD"
            const ngaySinh = new Date(data.ngay_sinh);

            // Định dạng lại ngày tháng năm
            const day = ngaySinh.getDate().toString().padStart(2, '0');
            const month = (ngaySinh.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = ngaySinh.getFullYear();

            // Định dạng theo kiểu "DD/MM/YYYY"
            const formattedDate = `${day}/${month}/${year}`;

            // Cập nhật giá trị của trường nhập liệu
            document.getElementById("ngay_sinh").value = formattedDate;
            document.getElementById("dia_chi").value = data.dia_chi;
            document.getElementById("dien_thoai").value = data.dien_thoai;
            document.getElementById("email").value = data.email;

            document.getElementById("ten_vt").value = data.ten_vt;
            document.getElementById("he_so").value = data.he_so;
            document.getElementById("luong_cb").value = `${data.luong_cb.toLocaleString('vi-VN')} đ`;
            document.getElementById("tre").value = data.tre;
            document.getElementById("som").value = data.som;
            document.getElementById("vang").value = data.vang;
            document.getElementById("du").value = data.du;
            
            let result = calculateSalary(data.he_so, data.luong_cb, data.tre, data.som, data.vang, data.du);
            document.getElementById("luongtamthoi").value = `${result.toLocaleString('vi-VN')} đ`;
            // Mở modal
            $("#myModal").modal("show");
        })
        .catch((error) => {
            console.error("Error fetching row data:", error);
        });
}
//Lưu thông tin một nhân viên
function saveData(id, month, year) {
    fetch(`/get_danh_sach_luong_by_id?id=${id}&month=${month}&year=${year}`)
        .then((response) => response.json())
        .then((data) => {
            data = data[0];
            let result = calculateSalary(data.he_so, data.luong_cb, data.tre, data.som, data.vang, data.du);
            let send = {
                id: data.id,
                idthe: data.id_the,
                hoten: data.ho_ten,
                tenvt: data.ten_vt,
                heso: data.he_so,
                luongcb: data.luong_cb,
                tre: data.tre,
                som: data.som,
                vang: data.vang,
                du_: data.du,
                luongtamthoi: result,
                ngayluu: new Date().toISOString().split("T")[0],
                thang: month,
                year: year,
            };

            fetch("/save_info_luong", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(send),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: 'Lưu thông tin nhân viên đã chọn thành công!',
                    });
                })
                .catch((error) => {
                    console.error("Error posting data:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Đã xảy ra lỗi khi lưu thông tin.',
                    });
                });
        })
        .catch((error) => {
            console.error("Error fetching row data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Đã xảy ra lỗi khi lấy dữ liệu.',
            });
        });
}


//Xuất Word thông tin một nhân viên
async function exportFileToWord(id, month, year) {
    try {
        const response = await fetch(`/get_danh_sach_luong_by_id?id=${id}&month=${month}&year=${year}`);
        const data = await response.json();

        if (data.length > 0) {
            const row = data[0];
            let result = calculateSalary(row.he_so, row.luong_cb, row.tre, row.som, row.vang, row.du);

            // Lấy ngày hiện tại
            let currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-GB');

            // Tạo tài liệu Word
            const doc = new docx.Document({
                sections: [
                    {
                        headers: {
                            default: new docx.Header({
                                children: [
                                    new docx.Paragraph({
                                        alignment: docx.AlignmentType.CENTER,
                                        children: [
                                            new docx.TextRun({
                                                text: "BẢNG LƯƠNG TẠM THỜI",
                                                bold: true,
                                                size: 32,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        },
                        children: [
                            new docx.Paragraph({
                                alignment: docx.AlignmentType.LEFT,
                                children: [
                                    new docx.TextRun({
                                        text: `Ngày xuất tài liệu: ${formattedDate}`,
                                        size: 26,
                                    }),
                                ],
                            }),
                            new docx.Paragraph({
                                alignment: docx.AlignmentType.LEFT,
                                children: [
                                    new docx.TextRun({
                                        text: `Lương tháng: ${month}/${year}`,
                                        size: 26,
                                    }),
                                ],
                            }),
                            new docx.Table({
                                rows: [
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Mã nhân viên:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.id),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Mã thẻ:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.id_the),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Họ tên:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.ho_ten),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Chức vụ:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.ten_vt),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Hệ số lương:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.he_so),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Lương cơ bản:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: `${row.luong_cb.toLocaleString('vi-VN')} đ`,
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Số lần đến trễ:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.tre),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Số lần về sớm:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.som),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Số lần vắng:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.vang),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Số ngày làm dư:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: String(row.du),
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.LEFT,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: " Lương tạm thời:",
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                            new docx.TableCell({
                                                children: [new docx.Paragraph({
                                                    alignment: docx.AlignmentType.CENTER,
                                                    children: [
                                                        new docx.TextRun({
                                                            text: `${result.toLocaleString('vi-VN')} đ`,
                                                            size: 26,
                                                        }),
                                                    ],
                                                })],
                                            }),
                                        ],
                                    }),
                                ],
                                width: {
                                    size: 100,
                                    type: docx.WidthType.PERCENTAGE,
                                },
                                borders: {
                                    top: { style: docx.BorderStyle.SINGLE, size: 4, space: 0 },
                                    bottom: { style: docx.BorderStyle.SINGLE, size: 4, space: 0 },
                                    left: { style: docx.BorderStyle.SINGLE, size: 4, space: 0 },
                                    right: { style: docx.BorderStyle.SINGLE, size: 4, space: 0 },
                                    insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 2, space: 0 },
                                    insideVertical: { style: docx.BorderStyle.SINGLE, size: 2, space: 0 },
                                },
                            }),
                        ],
                    },
                ],
            });

            // Chuyển đổi tài liệu thành blob
            const blob = await docx.Packer.toBlob(doc);

            // Lưu tài liệu bằng FileSaver
            const exportFileName = `bangluong_${id}_${month}_${year}.docx`;
            saveAs(blob, exportFileName);
        }
    } catch (error) {
        console.error('Error exporting file:', error);
    }
}
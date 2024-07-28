var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var bangdsyeucau;
var selectedIds = []; // Mảng để lưu trữ các ID đã chọn
var listID_sv = []; // Mảng lưu trữ id các sinh viên thuộc nhóm đã chọn trong modal

// Clear modal
function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}


$(document).ready(function () {
  $(".select2").select2({
    theme: "bootstrap",
  });
  $.ajax({
    type: "GET",
    url: "/get_all_ky_thuc_tap",
    success: function (data) {
      let filter_chonkythuctap = $("#filter_chonkythuctap");
      data.forEach((element) => {
        filter_chonkythuctap.append(
          `<option value="${element.id}">${element.ngaybatdau} - ${element.ngayketthuc}</option>`
        );
      });
    },
  });
  create_table("-1");

  $("#filter_chonkythuctap").on("change", function () {
    let id = $("#filter_chonkythuctap").val();
    create_table(id);
  });
});

function create_table(kythuctap) {
  bangdsyeucau = $("#bangdsyeucau").DataTable({
    paging: true,
    lengthChange: false,
    searching: true,
    ordering: true,
    info: true,
    destroy: true,
    autoWidth: false,
    responsive: true,
    ajax: {
      type: "GET",
      url: `get_all_yeu_cau_in_phieu?kythuctap=${kythuctap}`,
      dataSrc: "data",
    },
    columns: [
      {
        data: null,
        render: function (data, type, row, meta) {
          // Use meta.row to get the current row index, and add 1 to start from 1
          return "<center>" + (meta.row + 1) + "<br><input type='checkbox' class='row-checkbox' data-id='" + row.id + "'></center>";
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          // Combine loaiyeucau and ngaygui
          return row.hotensv + "<br><small><i>" + row.emailsv + "</i></small>";
        },
      },
      { data: "loaiyeucau" },
      { data: "ngayguiyc" },
      { data: "ngayxuly" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 0) {
            return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp; Chờ phê duyệt</span></center>';
          } else if (data == 1) {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp; Đã phê duyệt</span></center>';
          } else {
            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Bị từ chối</span></center>';
          }

        },
      },
      {
        data: "id",
        render: function (data, type, row) {
          if (row.trangthai == 0) {
            return (
              `<center>
                <a class="btn btn-success btn-sm" id="checkBtn" data-id="${data}"><i class="fas fa-check"></i></a>
                <a class="btn btn-warning btn-sm" id="rejectBtn" data-id="${data}"><i class="fas fa-close"></i></a>
              </center>`
            );
          } else {
            return (
              `<center> 
                <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}"><i class="fas fa-trash"></i></a>
              </center>`
            );
          }
        },
      },
    ],
  });


  // Sự kiện khi nhấn vào hàng để chọn checkbox tương ứng
  $('#bangdsyeucau tbody').on('click', 'tr', function () {
    var checkbox = $(this).find('.row-checkbox');
    checkbox.prop('checked', !checkbox.prop('checked'));
    updateSelectedIds(checkbox);
  });

  // Hàm cập nhật mảng selectedIds
  function updateSelectedIds(checkbox) {
    var id = checkbox.data('id');
    if (checkbox.prop('checked')) {
      // Nếu checkbox được chọn, thêm ID vào mảng
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
      }
    } else {
      // Nếu checkbox bị bỏ chọn, xóa ID khỏi mảng
      selectedIds = selectedIds.filter(function (selectedId) {
        return selectedId !== id;
      });
    }
  }

  // Xoá yêu cầu
  $("#bangdsyeucau").on("click", "#deleteBtn", function () {
    let id = $(this).data("id");

    Swal.fire({
      title: "Bạn chắc chắn muốn xoá yêu cầu này?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        $.ajax({
          type: "POST",
          url: "/update_xoa_yeu_cau_in_phieu_by_id",
          contentType: "application/json",
          data: JSON.stringify({
            ids: [id],
            trangthai: 0
          }),
          success: function (res) {
            if (res.total == 1) {
              Toast.fire({
                icon: "success",
                title: "Đã xoá 1 yêu cầu",
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            } else {
              Toast.fire({
                icon: "warning",
                title: "Xóa yêu cầu không thành công"
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Lỗi! Xoá không thành công",
            });
          },
        });
        selectedIds = [];
      }
    });
  });

  // Phê duyệt yêu cầu
  $("#bangdsyeucau").on("click", "#checkBtn", function () {
    let id = $(this).data("id");

    Swal.fire({
      title: "Phê duyệt yêu cầu này?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        $.ajax({
          type: "POST",
          url: "/update_yeu_cau_in_phieu",
          contentType: "application/json",
          data: JSON.stringify({
            ids: [id],
            trangthai: 1
          }),
          success: function (res) {
            if (res.total == 1) {
              Toast.fire({
                icon: "success",
                title: "Đã duyệt 1 yêu cầu",
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            } else {
              Toast.fire({
                icon: "warning",
                title: "Duyệt yêu cầu không thành công"
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Lỗi! Duyệt không thành công",
            });
          },
        });
        selectedIds = [];
      }
    });
  });

  // Từ chối yêu cầu
  $("#bangdsyeucau").on("click", "#rejectBtn", function () {
    let id = $(this).data("id");
    Swal.fire({
      title: "Từ chối yêu cầu này?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        $.ajax({
          type: "POST",
          url: "/update_yeu_cau_in_phieu",
          contentType: "application/json",
          data: JSON.stringify({
            ids: [id],
            trangthai: -1
          }),
          success: function (res) {
            if (res.total == 1) {
              Toast.fire({
                icon: "success",
                title: "Đã từ chối 1 yêu cầu",
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            } else {
              Toast.fire({
                icon: "warning",
                title: "Từ chối yêu cầu không thành công"
              });
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Lỗi! Từ chối không thành công",
            });
          },
        });
        selectedIds = [];
      }
    });
  });
}

$("#checkSelectedBtn").click(function () {
  // Kiểm tra nếu nhóm id chưa được chọn
  if (selectedIds.length == 0) {
    Toast.fire({
      icon: "warning",
      title: "Chưa có sinh viên nào được chọn"
    });
    return; // Ngăn chặn việc thực hiện các hành động tiếp theo
  }
  Swal.fire({
    title: "Phê duyệt " + selectedIds.length + " yêu cầu đã chọn?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/update_yeu_cau_in_phieu",
        contentType: "application/json",
        data: JSON.stringify({
          ids: selectedIds,
          trangthai: 1
        }),
        success: function (res) {
          if (res.total != 0) {
            Toast.fire({
              icon: "success",
              title: "Đã duyệt " + res.total + " yêu cầu",
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Duyệt yêu cầu không thành công"
            });
          }
          // Tải lại bảng bangdsyeucau
          bangdsyeucau.ajax.reload();
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
      selectedIds = [];
    }
  });
});

$("#rejectSelectedBtn").click(function () {
  // Kiểm tra nếu nhóm id chưa được chọn
  if (selectedIds.length == 0) {
    Toast.fire({
      icon: "warning",
      title: "Chưa có sinh viên nào được chọn"
    });
    return; // Ngăn chặn việc thực hiện các hành động tiếp theo
  }
  Swal.fire({
    title: "Từ chối " + selectedIds.length + " yêu cầu đã chọn?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/update_yeu_cau_in_phieu",
        contentType: "application/json",
        data: JSON.stringify({
          ids: selectedIds,
          trangthai: -1
        }),
        success: function (res) {
          if (res.total != 0) {
            Toast.fire({
              icon: "success",
              title: "Đã từ chối " + res.total + " yêu cầu",
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Từ chối yêu cầu không thành công"
            });
          }
          // Tải lại bảng bangdsyeucau
          bangdsyeucau.ajax.reload();
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
      selectedIds = [];
    }
  });
});

$("#deleteSelectedBtn").click(function () {
  // Kiểm tra nếu nhóm id chưa được chọn
  if (selectedIds.length == 0) {
    Toast.fire({
      icon: "warning",
      title: "Chưa có sinh viên nào được chọn"
    });
    return; // Ngăn chặn việc thực hiện các hành động tiếp theo
  }
  Swal.fire({
    title: "Xóa " + selectedIds.length + " yêu cầu đã chọn?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/update_xoa_yeu_cau_in_phieu_by_id",
        contentType: "application/json",
        data: JSON.stringify({
          ids: selectedIds,
          trangthai: 0
        }),
        success: function (res) {
          if (res.total != 0) {
            Toast.fire({
              icon: "success",
              title: "Đã xóa " + res.total + " yêu cầu",
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          } else {
            Toast.fire({
              icon: "warning",
              title: "Xóa yêu cầu không thành công"
            });
            // Tải lại bảng bangdsyeucau
            bangdsyeucau.ajax.reload();
          }
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
      selectedIds = [];
    }
  });
});


// Modal thêm bản in
$("#thembanin_btn").click(function () {
  // Clear modal
  clear_modal();
  $("#modal_title").text("Thêm bản in mới");
  html = `<div class="form-group">\              
            <label for="filter_loaiyeucau">Chọn loại phiếu in</label>
            <select name="filter_kythuctap" id="filter_loaiyeucau" class="form-control select2" height="120%">
              <option value="-1" disabled selected  >-- Chọn loại yêu cầu --</option>
            </select>
          </div> \
          <div class="form-group">\
            <label for="filter_kythuctap">Chọn kỳ thực tập</label>
            <select name="filter_kythuctap" id="filter_kythuctap" class="form-control select2" height="120%">
              <option value="-1" disabled selected>-- Chọn kỳ thực tập --</option>
            </select>
          </div>
          <div class="form-group">
            <label for="filter_nhomthuctap">Chọn nhóm thực tập</label>
            <select name="filter_nhomthuctap" id="filter_nhomthuctap" class="form-control select2" height="120%">
              <option value="-1" disabled selected>-- Chọn nhóm thực tập --</option>
            </select> 
          </div>`;
  $("#modal_body").append(html);
  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
  );

  // Get danh sách các loai yeu cau
  let filter_loaiyeucau = $("#filter_loaiyeucau");
  $.ajax({
    type: "GET",
    url: `get_ds_loai_yeu_cau`,
    success: function (res) {
      $.each(res, function (idx, val) {
        filter_loaiyeucau.append(
          '<option value="' + val.id + '">' + val.loaiyeucau + "</option>"
        );
      });
    },
  });

  // lOAD FILTER CHON KY TT
  $.ajax({
    type: "GET",
    url: "/get_ky_thuc_tap_by_username",
    success: function (data) {
      let filter_kythuctap = $("#filter_kythuctap");
      data.forEach((element) => {
        filter_kythuctap.append(
          `<option value="${element.id}">${element.ngaybatdau} - ${element.ngayketthuc}</option>`
        );
      });
    },
  });

  $("#filter_kythuctap").on("change", function () {
    let id = $("#filter_kythuctap").val();
    let filter_nhomthuctap = $("#filter_nhomthuctap");

    $.ajax({
      type: `GET`,
      url: `get_danh_sach_nhom_theo_ky_id?id=${id}`,
      success: function (res) {
        // empty first
        filter_nhomthuctap.empty();

        $.each(res, function (idx, val) {
          filter_nhomthuctap.append(`
            <option value="${val.id}">${val.tennhom}</option>
          `);
        });



        let kythuctap = $("#filter_kythuctap").val();
        let nhomthuctap = $("#filter_nhomthuctap").val();
        $.ajax({
          type: "GET",
          url: `get_ds_sinh_vien_by_username?kythuctap=${kythuctap}&nhomthuctap=${nhomthuctap}`,
          dataSrc: "",
          success: function (data) {
            data.forEach(function (sinhvien) {
              listID_sv.push(sinhvien.id); // Thêm id của sinh viên vào listID_sv
            });
          },
          error: function (xhr, status, error) {
            alert("Lỗi khi lấy danh sách sinh viên:");
          }
        });
      },
    });
  });


  $("#filter_nhomthuctap").on("change", function () {
    let kythuctap = $("#filter_kythuctap").val();
    let nhomthuctap = $("#filter_nhomthuctap").val();

    $.ajax({
      type: "GET",
      url: `get_ds_sinh_vien_by_username?kythuctap=${kythuctap}&nhomthuctap=${nhomthuctap}`,
      dataSrc: "",
      success: function (data) {
        data.forEach(function (sinhvien) {
          listID_sv.push(sinhvien.id); // Thêm id của sinh viên vào listID_sv
        });
      },
      error: function (xhr, status, error) {
        alert("Lỗi khi lấy danh sách sinh viên:");
      }
    });
  });

  $("#modal_id").modal("show");

  $("#modal_submit_btn").click(function () {
    let idloaiyeucau = $("#filter_loaiyeucau").val();
    let id_kythuctap = $("#filter_kythuctap").val();
    let id_nhomthuctap = $("#filter_nhomthuctap").val();
    let nhomthuctap = $("#filter_nhomthuctap option:selected").text();
    if (idloaiyeucau == null) {
      Toast.fire({
        icon: "error",
        title: "Chưa chọn loại yêu cầu",
      });
      return
    }
    if (id_kythuctap == null) {
      Toast.fire({
        icon: "error",
        title: "Chưa chọn kỳ thực tập",
      });
      return
    }
    if (id_nhomthuctap == null) {
      Toast.fire({
        icon: "error",
        title: "Chưa chọn nhóm thực tập",
      });
      return
    }
    if (listID_sv.length == 0) {
      Toast.fire({
        icon: "warning",
        title: "Không có sinh viên nào"
      });
      return; // Ngăn chặn việc thực hiện các hành động tiếp theo
    }
    Swal.fire({
      title: "Xác nhận in phiếu cho nhóm\n" + nhomthuctap + "?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        $.ajax({
          type: "POST",
          url: "/gui_yeu_cau_in_phieu_by_nguoi_huong_dan",
          contentType: "application/json",
          data: JSON.stringify({
            ids: listID_sv,
            trangthai: idloaiyeucau
          }),
          success: function (res) {
            if (res.total != 0) {
              Toast.fire({
                icon: "success",
                title: "Đã thêm " + res.total + " yêu cầu được duyệt",
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            } else {
              Toast.fire({
                icon: "warning",
                title: "Không thêm mới yêu cầu nào!"
              });
              // Tải lại bảng bangdsyeucau
              bangdsyeucau.ajax.reload();
            }
          },
          error: function (xhr, status, error) {
            Toast.fire({
              icon: "error",
              title: "Lỗi! Thực hiện không thành công",
            });
          },
        });
        selectedIds = [];
        listID_sv = [];
        $("#modal_id").modal("hide");
      }
    });
  });
});
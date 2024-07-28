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

// Khởi tạo dropdown
$(".dropdown-toggle").dropdown();

// load filter
function loadFilter() {
  // load kỳ thực tập
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
}

$(document).ready(function () {
  $(".select2").select2({
    theme: "bootstrap",
  });
  empty_modal();
  loadFilter();
  create_table("-1", "-1");
  $("#filter_kythuctap").on("change", function () {
    let id = $("#filter_kythuctap").val();
    let filter_nhomthuctap = $("#filter_nhomthuctap");
    create_table(id, "-1");

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
      },
    });

    filter_nhomthuctap.on(`change`, function () {
      create_table(id, filter_nhomthuctap.val());
    });
  });
});

function create_table(kythuctap, nhomthuctap) {
  var bangdssv = $("#bangdssv").DataTable({
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
      url: `get_ds_sinh_vien_by_username?kythuctap=${kythuctap}&nhomthuctap=${nhomthuctap}`,
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
      { data: "nganh" },
      { data: "detai" },
      { data: "tennhom" },
      {
        data: "trangthai",
        render: function (data, type, row) {
          if (data == 1) {
            return '<center><span class="badge badge-warning"><i class="fa-solid fa-circle-exclamation"></i> Chưa đánh giá</span></center>';
          } else {
            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đã đánh giá</span></center>';
          }
        },
      },
      {
        data: "id",
        render: function (data, type, row, meta) {
          if (row.handanhgia >= currentTimestamp) {
            if (row.kyhieu_truong == "VLUTE") {
              return `<center>
                  <a class="btn btn-outline-info btn-sm" id="editBtn" data-id="${data}" data-truong="${row.kyhieu_truong}">
                    <i class="fas fa-pencil-alt"></i>
                  </a> 
                  <div class="btn-group dropleft">
                    <button type="button" class="btn btn-outline-success btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-print"></i>
                    </button>
                    <div class="dropdown-menu">
                      <a class="dropdown-item" href="xuat_danh_gia?id=${data}" target="_blank">In phiếu đánh giá</a>
                    </div>
                  </div>
                </center>`;
            } else if (row.kyhieu_truong == "CTU") {
              return `<center>
                  <a class="btn btn-outline-info btn-sm" id="editBtn" data-id="${data}" data-truong="${row.kyhieu_truong}">
                    <i class="fas fa-pencil-alt"></i>
                  </a> 
                  <div class="btn-group dropleft">
                    <button type="button" class="btn btn-outline-success btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-print"></i>
                    </button>
                    <div class="dropdown-menu">
                      <a class="dropdown-item" href="ctu_xuat_phieu_tiep_nhan?id=${data}" target="_blank">In phiếu tiếp nhận</a>
                      <a class="dropdown-item" href="ctu_xuat_phieu_giao_viec?id=${data}" target="_blank">In phiếu giao việc</a>
                      <a class="dropdown-item" href="ctu_xuat_phieu_theo_doi?id=${data}" target="_blank">In phiếu theo dõi</a>
                      <a class="dropdown-item" href="xuat_danh_gia?id=${data}" target="_blank">In phiếu đánh giá</a>
                    </div>
                  </div>
                </center>`;
            }
          } else {
            return `<center>
                <a class="btn btn-outline-info btn-sm" id="editBtn" data-id="${data}" data-truong="${row.kyhieu_truong}" data-edit="false">
                  <i class="fa-solid fa-eye"></i>
                </a>
                <div class="btn-group dropleft">
                    <button type="button" class="btn btn-outline-success btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-print"></i>
                    </button>
                    <div class="dropdown-menu">
                      <a class="dropdown-item" href="xuat_danh_gia?id=${data}" target="_blank">In phiếu đánh giá</a>
                    </div>
                </div>
              </center>`;
          }
        },
      },
    ],
    columnDefs: [
      { orderable: false, targets: 0 }, // Tắt tính năng sắp xếp cho cột 0
    ],
  });

  $("#bangdssv").on("click", "#editBtn", function () {
    let id = $(this).data("id");
    let kyhieu_truong = $(this).data("truong");

    empty_modal();
    if (kyhieu_truong == "VLUTE") {
      $.ajax({
        url: "get_chi_tiet_danh_gia_sv_by_id?id=" + id,
        type: "GET",
        success: function (res) {
          $(".modal-dialog").addClass("modal-lg");
          $("#modal_title").text("Đánh giá sinh viên");
          let html = `
            <form id="editForm">
              <div class="form-group row"> 
                <div class="col-sm-10"> 
                  <label for="ythuckyluat" class="col-form-label">Ý thức kỷ luật, tuân thủ nội quy</label> 
                </div> 
                <div class="col-sm-2"> 
                  <input type="number" class="form-control" id="ythuckyluat_number" name="ythuckyluat_number" min="0" max="100" value="0"> 
                </div> 
                <div class="col-sm mt-4"> 
                  <textarea id="ythuckyluat_text" class="form-control" rows="3"></textarea> 
                </div> 
              </div> 
              <div class="form-group row mt-4"> 
                <div class="col-sm-10"> 
                  <label for="tuanthuthoigian" class="col-form-label">Tuân thủ thời gian</label> 
                </div> 
                <div class="col-sm-2"> 
                  <input type="number" class="form-control" id="tuanthuthoigian_number" name="tuanthuthoigian_number" min="0" max="100" value="0"> 
                </div> 
                <div class="col-sm mt-4"> 
                  <textarea id="tuanthuthoigian_text" class="form-control" rows="3"></textarea> 
                </div> 
              </div> 
              <div class="form-group row mt-4"> 
                <div class="col-sm-10"> 
                  <label for="kienthuc" class="col-form-label">Kiến thức</label> 
                </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="kienthuc_number" name="kienthuc_number" min="0" max="100" value="0"> 
              </div> 
              <div class="col-sm mt-4"> 
                <textarea id="kienthuc_text" class="form-control" rows="3"></textarea> 
              </div>
            </div> 
            <div class="form-group row mt-4"> 
              <div class="col-sm-10"> 
                <label for="kynangnghe" class="col-form-label">Kỹ năng nghề</label> 
              </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="kynangnghe_number" name="kynangnghe_number" min="0" max="100" value="0"> 
              </div> 
              <div class="col-sm mt-4"> 
                <textarea id="kynangnghe_text" class="form-control" rows="3"></textarea> 
              </div> 
            </div> 
<div class="form-group row mt-4"> 
              <div class="col-sm-10"> 
                <label for="khanangdoclap" class="col-form-label">Khả năng làm việc độc lập</label> 
              </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="khanangdoclap_number" name="khanangdoclap_number" min="0" max="100" value="0"> 
              </div> 
              <div class="col-sm mt-4"> 
                <textarea id="khanangdoclap_text" class="form-control" rows="3"></textarea> 
              </div> 
            </div> 
            <div class="form-group row mt-4"> 
              <div class="col-sm-10"> 
                <label for="khanangnhom" class="col-form-label">Khả năng làm việc nhóm</label> 
              </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="khanangnhom_number" name="khanangnhom_number" min="0" max="100" value="0"> 
              </div> 
              <div class="col-sm mt-4"> 
                <textarea id="khanangnhom_text" class="form-control" rows="3"></textarea> 
              </div> 
            </div> 
            <div class="form-group row mt-4"> 
              <div class="col-sm-10"> 
                <label for="khananggiaiquyetcongviec" class="col-form-label">Khả năng giải quyết công việc</label> 
              </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="khananggiaiquyetcongviec_number" name="khananggiaiquyetcongviec_number" min="0" max="100" value="0">
              </div> 
              <div class="col-sm mt-4"> 
                <textarea id="khananggiaiquyetcongviec_text" class="form-control" rows="3"></textarea> 
              </div> 
            </div> 
            <div class="form-group row mt-4"> 
              <div class="col-sm-10"> 
                <label for="danhgiachung" class="col-form-label">Đánh giá chung</label> 
              </div> 
              <div class="col-sm-2"> 
                <input type="number" class="form-control" id="danhgiachung_number" name="danhgiachung_number" min="0" max="100" value="0"> 
              </div> 
            </div> 
          </form>`;
          $("#modal_body").empty();
          $("#modal_body").append(html);

          $("input, textarea").val("");
          let ythuckyluat_number = $("#ythuckyluat_number");
          let ythuckyluat_text = $("#ythuckyluat_text");
          let tuanthuthoigian_number = $("#tuanthuthoigian_number");
          let tuanthuthoigian_text = $("#tuanthuthoigian_text");
          let kienthuc_number = $("#kienthuc_number");
          let kienthuc_text = $("#kienthuc_text");
          let kynangnghe_number = $("#kynangnghe_number");
          let kynangnghe_text = $("#kynangnghe_text");
          let khanangdoclap_number = $("#khanangdoclap_number");
          let khanangdoclap_text = $("#khanangdoclap_text");
          let khanangnhom_number = $("#khanangnhom_number");
          let khanangnhom_text = $("#khanangnhom_text");
          let khananggiaiquyetcongviec_number = $(
            "#khananggiaiquyetcongviec_number"
          );
          let khananggiaiquyetcongviec_text = $(
            "#khananggiaiquyetcongviec_text"
          );
          let danhgiachung_number = $("#danhgiachung_number");

          if (Object.keys(res).length > 0) {
            ythuckyluat_number.val(res.ythuckyluat_number);
            ythuckyluat_text.val(res.ythuckyluat_text);
            tuanthuthoigian_number.val(res.tuanthuthoigian_number);
            tuanthuthoigian_text.val(res.tuanthuthoigian_text);
            kienthuc_number.val(res.kienthuc_number);
            kienthuc_text.val(res.kienthuc_text);
            kynangnghe_number.val(res.kynangnghe_number);
            kynangnghe_text.val(res.kynangnghe_text);
            khanangdoclap_number.val(res.khanangdoclap_number);
            khanangdoclap_text.val(res.khanangdoclap_text);
            khanangnhom_number.val(res.khanangnhom_number);
            khanangnhom_text.val(res.khanangnhom_text);
            khananggiaiquyetcongviec_number.val(
              res.khananggiaiquyetcongviec_number
            );
            khananggiaiquyetcongviec_text.val(
              res.khananggiaiquyetcongviec_text
            );
            danhgiachung_number.val(res.danhgiachung_number);
          }

          $("#modal_footer").empty();
          if (res.handanhgia <= currentTimestamp) {
            $("#modal_id input, #modal_id textarea").prop("disabled", true);
            $("#modal_footer").html(``);
          } else {
            $("#modal_footer").append(
              `<button type="button" class="btn btn-primary" data-id="${id}" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>`
            );
          }
          $("#modal_id").modal("show");

          // Tính năng lưu thay đổi
          $("#modal_submit_btn").click(function () {
            // Get ID Nhom
            $.ajax({
              type: "GET",
              url: "get_id_nhom_by_sv_id?id=" + id,
              success: function (res) {
                let data_update =
                  "?sinhvienid=" +
                  String(id) +
                  "&nhomid=" +
                  parseInt(res.id) +
                  "&ythuckyluat_number=" +
                  parseFloat(ythuckyluat_number.val()) +
                  "&ythuckyluat_text=" +
                  ythuckyluat_text.val() +
                  "&tuanthuthoigian_number=" +
                  parseFloat(tuanthuthoigian_number.val()) +
                  "&tuanthuthoigian_text=" +
                  tuanthuthoigian_text.val() +
                  "&kienthuc_number=" +
                  parseFloat(kienthuc_number.val()) +
                  "&kienthuc_text=" +
                  kienthuc_text.val() +
                  "&kynangnghe_number=" +
                  parseFloat(kynangnghe_number.val()) +
                  "&kynangnghe_text=" +
                  kynangnghe_text.val() +
                  "&khanangdoclap_number=" +
                  parseFloat(khanangdoclap_number.val()) +
                  "&khanangdoclap_text=" +
                  khanangdoclap_text.val() +
                  "&khanangnhom_number=" +
                  parseFloat(khanangnhom_number.val()) +
                  "&khanangnhom_text=" +
                  khanangnhom_text.val() +
                  "&khananggiaiquyetcongviec_number=" +
                  parseFloat(khananggiaiquyetcongviec_number.val()) +
                  "&khananggiaiquyetcongviec_text=" +
                  khananggiaiquyetcongviec_text.val() +
                  "&danhgiachung_number=" +
                  parseFloat(danhgiachung_number.val());

                $.ajax({
                  type: "POST",
                  url: "update_danh_gia_sv_by_id" + data_update,
                  data: data_update,
                  headers: {
                    "Content-Type": "application/json",
                  },
                  success: function (data) {
                    if (data.status == "OK") {
                      $("#modal_id").modal("hide");
                      bangdssv.ajax.reload();
                      Toast.fire({
                        icon: "success",
                        title: "Cập nhật thành công",
                      });
                    } else {
                      Toast.fire({
                        icon: "error",
                        title: "Đã quá hạn đánh giá",
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
              },
            });
          });
        },
      });
    } else if (kyhieu_truong == "CTU") {
      empty_modal();

      $(".modal-dialog").addClass("modal-lg");
      $("#modal_title").text("Đánh giá sinh viên");
      $("#modal_body").html(`
        <table class="table table-bordered">
          <thead>
            <tr>
              <th scope="col" width="80%"><center><strong>Nội dung đánh giá</strong></center></th>
              <th scope="col" width="20%"><center><strong>Điểm (từ 1 - 10)</strong></center></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>I. Tinh thần kỷ luật</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>I.1. Thực hiện nội quy của cơ quan <i>(nếu thực tập online thì không chấm điểm)</i></td>
              <td>
<input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="thuchiennoiquy"/>
              </td>
            </tr>
            <tr>
              <td>I.2. Chấp hành giờ giấc làm việc <i>(nếu thực tập online thì không chấm điểm)</i></td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="chaphanhgiogiac"/>
              </td>
            </tr>
            <tr>
              <td>I.3. Thái độ giao tiếp với cán bộ trong đơn vị <i>(nếu thực tập online thì không chấm điểm)</i></td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="thaidogiaotiep"/>
              </td>
            </tr>
            <tr>
              <td>I.4. Tích cực trong công việc</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="thaidogiaotiep"/>
              </td>
            </tr>
            <tr>
              <td><strong>II. Khả năng chuyên môn, nghiệp vụ</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>II.1. Đáp ứng yêu cầu công việc</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="dapungyeucau"/>
              </td>
            </tr>
            <tr>
              <td>II.2. Tinh thần học hỏi, nâng cao trình độ chuyên môn, nghiệp vụ</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="tinhthanhochoi"/>
              </td>
            </tr>
            <tr>
              <td>II.3. Có đề xuất, sáng kiến, năng động trong công việc</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="sangkien"/>
              </td>
            </tr>
            <tr>
              <td><strong>III. Kết quả công tác</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>III.1. Báo cáo tiến độ công việc cho cán bộ hướng dẫn mỗi tuần 1 lần</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="baocaotiendo"/>
              </td>
            </tr>
            <tr>
              <td>III.2. Hoàn thành công việc được giao</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="hoanthanhcongviec"/>
              </td>
            </tr>
            <tr>
              <td>III.3. Kết quả công việc có đóng góp cho cơ quan nơi thực tập</td>
              <td>
                <input type="number" min="0" max="10" step="0.5" class="form-control form-control-sm" id="donggop"/>
</td>
            </tr>
          </tbody>
        </table>
        <br>
        <table class="table table-borderless">
          <tr>
            <td>
                <p>1. Nhận xét khác về sinh viên:</p>
            </td>
            <td width="60%">
              <input type="text" class="form-control" id="nhanxetkhac">
            </td>
          <tr>
          <tr>
            <td colspan="2">
              <p>2. Đánh giá của cơ quan về chương trình đào tạo (CTĐT):</p>
            </td>
          </tr>
          <tr>
            <td>
              <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="phuhopthucte">
                    <label class="form-check-label" for="phuhopthucte">
                      Phù hợp với thực tế
                    </label>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="kynangmem">
                    <label class="form-check-label" for="kynangmem">
                      Tăng cường kỹ năng mềm
                    </label>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="ngoaingu">
                    <label class="form-check-label" for="ngoaingu">
                      Tăng cường ngoại ngữ
                    </label>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="kynangnhom">
                    <label class="form-check-label" for="kynangnhom">
                      Tăng cường kỹ năng làm việc nhóm
                    </label>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
                <p>3. Đề xuất góp ý của cơ quan về CTĐT:</p>
            </td>
            <td width="60%">
              <input type="text" class="form-control" id="dexuat">
            </td>
          <tr>
        </table>
      `);
      $("#modal_footer").append(
        `<button type="button" class="btn btn-primary" data-id="${id}" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>`
      );
      $("#modal_id").modal("show");
    }
  });
}

import os
from ..config import create_connection
from ..send_otp import is_otp_valid
import datetime
import bleach
import json

conn = create_connection()
cursor = conn.cursor()


def protect_xss(input: str):
    return bleach.clean(input, tags=["br"], attributes={})


def insert_sinh_vien(
    MSSV: str,
    HoTen: str,
    GioiTinh: int,
    SDT: str,
    Email: str,
    DiaChi: str,
    MaLop: str,
    Truong: str,
    Nganh: str,
    Khoa: int,
    Password: str,
) -> bool:
    try:
        result = cursor.execute(
            "EXEC InsertSinhVien ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            protect_xss(MSSV),
            protect_xss(HoTen),
            GioiTinh,
            protect_xss(SDT),
            protect_xss(Email),
            protect_xss(DiaChi),
            protect_xss(MaLop),
            Truong,
            Nganh,
            Khoa,
            0,
        )
        r = result.fetchone()
        conn.commit()
        return r[0]
    except Exception as e:
        return e


def insert_taikhoan_sinhvien(sinhvien_id: int, password: str, is_verified: int):
    try:
        i = cursor.execute(
            "EXEC InsertTaiKhoanSV ?, ?, ?",
            sinhvien_id,
            protect_xss(password),
            is_verified,
        )
        conn.commit()
        return True
    except Exception as e:
        return e


# def verify_user(username: str, password: str):
#     try:
#         result = cursor.execute("LoginUser ?, ?", protect_xss(
#             username), protect_xss(password)).fetchone()[0]
#         if result != None:
#             return result
#         else:
#             return False
#     except Exception as e:
#         return e


def verify_student(email: str, password: str):
    try:
        result = cursor.execute(
            "LoginStudent ?, ?", protect_xss(email), protect_xss(password)
        ).fetchone()[0]
        if result != None:
            return result
        else:
            return False
    except Exception as e:
        return e


def get_all_sinh_vien():
    try:
        result = cursor.execute("EXEC GetDSSVDashboard").fetchall()

        result_data = [
            {
                "id": i[0],
                "mssv": i[1],
                "hoten": i[2],
                "gioitinh": i[3],
                "nganh": i[4],
                "truong": i[5],
                "trangthai": i[6],
                "luuy": i[7],
            }
            for i in result
        ]
        return result_data

    except Exception as e:
        return e


def get_all_nhan_vien():
    try:
        result = cursor.execute(
            """
            SELECT u.id, u.hoten, u.gioitinh, u.dienthoai, u.email, u.diachi, vt.tenvt, u.trangthai
            FROM usercty_spkt u
            LEFT JOIN phanquyen_spkt pq ON u.id = pq.idu
            LEFT JOIN vaitro_spkt vt ON pq.idvt = vt.idvt
            """
        ).fetchall()

        result_data = [
            {
                "id": i[0],
                "hoten": i[1],
                "gioitinh": i[2],
                "dienthoai": i[3],
                "email": i[4],
                "diachi": i[5],
                "tenvt": i[6],
                "trangthai": bool(i[7]),  # Chuyển đổi giá trị bit sang boolean
            }
            for i in result
        ]
        print("Result Data: ", result_data)  # Log dữ liệu để kiểm tra
        return result_data

    except Exception as e:
        print("Error: ", e)  # In lỗi ra console để dễ kiểm tra
        return {"error": str(e)}


def get_all_chuc_vu():
    try:
        result = cursor.execute("SELECT DISTINCT tenvt FROM vaitro_spkt").fetchall()
        return [i[0] for i in result]
    except Exception as e:
        print("Error: ", e)
        return {"error": str(e)}


def get_all_trang_thai():
    try:
        result = cursor.execute(
            "SELECT DISTINCT trangthai FROM usercty_spkt"
        ).fetchall()
        return [bool(i[0]) for i in result]  # Chuyển đổi giá trị bit sang boolean
    except Exception as e:
        print("Error: ", e)
        return {"error": str(e)}


def get_all_provinces():
    try:
        result = cursor.execute("SELECT DISTINCT diachi FROM usercty_spkt").fetchall()
        return [i[0] for i in result]
    except Exception as e:
        print("Error: ", e)
        return {"error": str(e)}


# Biểu đồ thống kê Tỷ lệ chấm công
def get_monthly_attendance_rate():
    try:
        result = []
        for month in range(1, 13):
            start_date = datetime.datetime(datetime.datetime.now().year, month, 1)
            end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(
                days=1
            )
            total_employees = cursor.execute(
                "SELECT COUNT(*) FROM usercty_spkt"
            ).fetchone()[0]
            attended_count = cursor.execute(
                """
                SELECT COUNT(DISTINCT idu) 
                FROM chamcong_spkt 
                WHERE ngaythang BETWEEN ? AND ?
            """,
                (start_date, end_date),
            ).fetchone()[0]
            attendance_rate = (
                (attended_count / total_employees) * 100 if total_employees else 0
            )
            result.append({"month": month, "attendance_rate": attendance_rate})
        return result
    except Exception as e:
        print("Error in get_monthly_attendance_rate: ", e)
        return {"error": str(e)}


def get_monthly_late_early_rate():
    try:
        result = []
        for month in range(1, 13):
            start_date = datetime.datetime(datetime.datetime.now().year, month, 1)
            end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(
                days=1
            )
            total_employees = cursor.execute(
                "SELECT COUNT(*) FROM usercty_spkt"
            ).fetchone()[0]
            late_early_count = cursor.execute(
                """
                SELECT COUNT(DISTINCT cc.idu)
                FROM chamcong_spkt cc
                JOIN ca_lam_spkt cl ON cc.idclv = cl.idclv
                WHERE (cc.giovao > cl.tg_bd OR cc.giora < cl.tg_kt)
                AND cc.ngaythang BETWEEN ? AND ?
            """,
                (start_date, end_date),
            ).fetchone()[0]
            late_early_rate = (
                (late_early_count / total_employees) * 100 if total_employees else 0
            )
            result.append({"month": month, "late_early_rate": late_early_rate})
        return result
    except Exception as e:
        print("Error in get_monthly_late_early_rate: ", e)
        return {"error": str(e)}


def count_all_nhan_vien():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        result = cursor.execute("SELECT COUNT(*) FROM usercty_spkt")
        count = result.fetchone()[0]
        conn.close()
        return count
    except Exception as e:
        print(f"Error: {e}")
        return e


def ti_le_nhan_vien_cham_cong_trong_ngay():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Tổng số nhân viên
        total_employees = cursor.execute(
            "SELECT COUNT(*) FROM usercty_spkt"
        ).fetchone()[0]

        # Số nhân viên đã chấm công hôm nay
        today = datetime.date.today()
        attended_count = cursor.execute(
            """
            SELECT COUNT(DISTINCT idu)
            FROM chamcong_spkt
            WHERE ngaythang = ?
        """,
            (today,),
        ).fetchone()[0]

        # Tính tỷ lệ phần trăm
        attendance_rate = (
            (attended_count / total_employees) * 100 if total_employees else 0
        )

        conn.close()
        return attendance_rate
    except Exception as e:
        print(f"Error: {e}")
        return e


from datetime import date, timedelta


def count_nhan_vien_da_diem_danh():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        today = date.today()
        result = cursor.execute(
            "SELECT COUNT(DISTINCT idu) FROM chamcong_spkt WHERE ngaythang = ?", today
        )
        count = result.fetchone()[0]
        conn.close()
        return count
    except Exception as e:
        print(f"Error: {e}")
        return e


def count_nhan_vien_chua_diem_danh():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        today = date.today()
        result = cursor.execute(
            """
            SELECT COUNT(*)
            FROM usercty_spkt
            WHERE id NOT IN (SELECT DISTINCT idu FROM chamcong_spkt WHERE ngaythang = ?)
        """,
            today,
        )
        count = result.fetchone()[0]
        conn.close()
        return count
    except Exception as e:
        print(f"Error: {e}")
        return e


def get_nhan_vien_theo_vai_tro():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        result = cursor.execute(
            """
            SELECT vt.tenvt AS role, COUNT(*) AS count
            FROM usercty_spkt u
            JOIN phanquyen_spkt pq ON u.id = pq.idu
            JOIN vaitro_spkt vt ON pq.idvt = vt.idvt
            GROUP BY vt.tenvt
            ORDER BY 
                CASE 
                    WHEN vt.tenvt = 'Quản lý' THEN 1 
                    WHEN vt.tenvt = 'Trưởng phòng' THEN 2 
                    ELSE 3 
                END
            """
        )
        data = [{"role": row.role, "count": row.count} for row in result.fetchall()]
        conn.close()
        return data
    except Exception as e:
        return str(e)


def get_tong_so_phong_ban():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        result = cursor.execute("SELECT tenbp FROM bophan_spkt")
        data = result.fetchall()
        conn.close()
        return [row.tenbp for row in data]
    except Exception as e:
        print(f"Error: {e}")
        return []


def count_all_sinh_vien():
    try:
        result = cursor.execute("SELECT COUNT(*) FROM SINHVIEN")
        return result.fetchone()[0]
    except Exception as e:
        return e


def ti_le_sinh_vien_da_danh_gia():
    try:
        sinhvientoihan = cursor.execute("EXEC GetDSSVSapToiHanBaoCao").fetchone()[0]
        return sinhvientoihan
    except Exception as e:
        return e


def so_luong_sinh_vien_dat_ket_qua():
    try:
        result = cursor.execute("EXEC GetSoLuongSinhVienDatKetQua").fetchone()
        return {"dat": result[0], "khong_dat": result[1], "khong_co_nhom": result[2]}
    except Exception as e:
        return e


def get_so_luong_sinh_vien_theo_truong():
    try:
        result = cursor.execute("EXEC GetSoLuongSinhVienTheoTruong")
        return [{"truong": i.Ten, "soluong": i.SLSV} for i in result.fetchall()]
    except Exception as e:
        return e


def get_so_luong_sinh_vien_theo_nganh():
    try:
        result = cursor.execute("EXEC GetSoLuongSinhVienTheoNganh")
        return [{"nganh": i.NGANH, "soluong": i.SL} for i in result.fetchall()]
    except Exception as e:
        return e


def get_trang_thai_sinh_vien_by_id(id: str):
    try:
        i = cursor.execute("EXEC GetTrangThaiSinhVienByID ?", id).fetchone()
        return {"id": i[0], "trangthai": i[6]}
    except Exception as e:
        return e


def get_user_info_by_username(username: str):
    try:
        result = cursor.execute("EXEC GetUserInfo ?", username)
        return result.fetchone()
    except Exception as e:
        return e


def get_all_de_tai_thuc_tap():
    try:
        result = cursor.execute("SELECT * FROM DeTai WHERE isDeleted != 2")
        return [
            {"id": i[0], "ten": i[1], "mota": i[2], "xoa": i[3]}
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def get_chi_tiet_de_tai_by_id(id: str):
    try:
        result = cursor.execute("EXEC GetChiTietDeTaiByID ?", id).fetchone()
        return {"id": result[0], "ten": result[1], "mota": result[2], "xoa": result[3]}
    except Exception as e:
        return e


def update_chi_tiet_de_tai_by_id(id: str, ten: str, mota: str, isDeleted: int):
    try:
        result = cursor.execute(
            "EXEC UpdateChiTietDeTaiByID ?, ?, ?, ?",
            protect_xss(id),
            protect_xss(ten),
            protect_xss(mota),
            (isDeleted),
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def update_xoa_de_tai_by_id(id: str):
    try:
        result = cursor.execute(
            "EXEC UpdateXoaDeTaiByID ?", protect_xss(id)
        ).fetchone()[0]
        conn.commit()
        if result == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def get_nhom_thuc_tap_by_user_id(id: str):
    try:
        result = cursor.execute("EXEC GetNhomThucTapByUserID ?", id).fetchall()
        data = [
            {"ngay": i[0], "id": i[1], "ten": i[2], "mota": i[3], "tennhom": i[5]}
            for i in result
        ]
        return data
    except Exception as e:
        return e


def them_de_tai_thuc_tap(ten: str, mota: str, isDeleted: int):
    try:
        result = cursor.execute(
            "EXEC InsertDeTai ?, ?, ?", protect_xss(ten), protect_xss(mota), isDeleted
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def get_all_ky_thuc_tap():
    try:
        result = cursor.execute("EXEC GetDSDeTaiTheoThoiHan").fetchall()
        data = [
            {
                "id": i[0],
                "ngaybatdau": i[1],
                "ngayketthuc": i[2],
                "thoihan": i[3],
                "ghichu": i[4],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_ky_thuc_tap_by_username(username: str):
    try:
        result = cursor.execute(
            "EXEC GetDSKyThucTapByUsername ?", protect_xss(username)
        ).fetchall()
        data = [
            {
                "id": i[2],
                "ngaybatdau": i[0],
                "ngayketthuc": i[1],
                "thoihan": i[3],
                "ghichu": i[4],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_chi_tiet_ky_thuc_tap_by_id(id: str):
    try:
        result = cursor.execute("EXEC GetChiTietKyThucTapByID ?", id).fetchone()
        return {
            "id": result[0],
            "ngaybatdau": result[1],
            "ngayketthuc": result[2],
            "xoa": result[3],
            "ghichu": result[4],
        }
    except Exception as e:
        return e


def update_chi_tiet_ky_thuc_tap_by_id(
    id: str, ngaybatdau: str, ngayketthuc: str, isDeleted: int, ghichu: str
):
    try:
        result = cursor.execute(
            "EXEC UpdateChiTietKyThucTapByID ?, ?, ?, ?, ?",
            protect_xss(id),
            protect_xss(ngaybatdau),
            protect_xss(ngayketthuc),
            (isDeleted),
            protect_xss(ghichu),
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def them_ky_thuc_tap(ngaybatdau: str, ngayketthuc: str, isDeleted: int, ghichu: str):
    try:
        result = cursor.execute(
            "EXEC InsertKyThucTap ?, ?, ?, ?",
            protect_xss(ngaybatdau),
            protect_xss(ngayketthuc),
            isDeleted,
            protect_xss(ghichu),
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def update_xoa_ky_thuc_tap_by_id(id: str):
    try:
        result = cursor.execute(
            "EXEC UpdateXoaKyThucTapByID ?", protect_xss(id)
        ).fetchone()[0]
        conn.commit()
        if result == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def get_ds_nhom_thuc_tap_by_nguoi_huong_dan(username: str):
    try:
        result = cursor.execute(
            "EXEC GetDSNhomThucTapByNguoiHuongDanUsername ?", username
        )
        data = [
            {
                "id": i[0],
                "nguoihuongdan": i[2],
                "ngaybatdau": i[3],
                "tendetai": i[5],
                "mota": i[6],
                "xoa": i[1],
                "soluong": i[10],
                "ghichu": i[11],
                "tennhom": i[12],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_ds_nhom_thuc_tap():
    try:
        result = cursor.execute("EXEC GetDSNhomThucTap")
        data = [
            {
                "id": i[0],
                "nguoihuongdan": i[2],
                "ngaybatdau": i[3],
                "tendetai": i[5],
                "mota": i[6],
                "xoa": i[1],
                "soluong": i[10],
                "ghichu": i[11],
                "tennhom": i[12],
                "telegram_id": i[13],
                "thoihan": i[14],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_chi_tiet_nhom_thuc_tap_by_id(id: str):
    try:
        i = cursor.execute("EXEC GetChiTietNhomThucTapByID ?", id).fetchone()
        return {
            "id": i[0],
            "nguoihuongdan_hoten": i[9],
            "nguoihuongdan_id": i[1],
            "nguoihuongdan_username": i[15],
            "kythuctap_id": i[2],
            "kythuctap_ngaybatdau": i[9],
            "kythuctap_ngayketthuc": i[10],
            "detai_id": i[3],
            "detai_ten": i[11],
            "detai_mota": i[13],
            "nhomthuctap_dadangky": i[14],
            "nhomthuctap_soluong": i[4],
            "xoa": i[5],
            "ghichu": i[6],
            "nhomthuctap_tennhom": i[7],
            "nhomthuctap_telegram": i[8],
        }
    except Exception as e:
        return e


def get_all_nguoi_huong_dan():
    try:
        result = cursor.execute("EXEC GetAllNguoiHuongDan").fetchall()
        return [{"id": i[0], "hoten": i[1]} for i in result]
    except Exception as e:
        return e


def get_chi_tiet_chinh_sua_nhom():
    try:
        ktt_obj = cursor.execute(
            "SELECT ID, NgayBatDau FROM KyThucTap WHERE isDeleted != 2"
        ).fetchall()
        nhd_obj = cursor.execute("SELECT ID, HoTen FROM NguoiHuongDan").fetchall()
        detai_obj = cursor.execute(
            "SELECT ID, Ten FROM DeTai WHERE isDeleted != 2"
        ).fetchall()

        ktt = [{"id": i[0], "ngay": i[1]} for i in ktt_obj]
        nhd = [{"id": i[0], "hoten": i[1]} for i in nhd_obj]
        detai = [{"id": i[0], "ten": i[1]} for i in detai_obj]

        return {"kythuctap": ktt, "nguoihuongdan": nhd, "detai": detai}
    except Exception as e:
        return e


def update_chi_tiet_nhom_thuc_tap_by_id(
    id: int,
    kytt: int,
    nguoihd: int,
    detai: int,
    soluong: int,
    tennhom: str,
    telegram: str,
    isDeleted: int,
    ghichu: str,
):
    try:
        result = cursor.execute(
            "EXEC UpdateChiTietNhomThucTapByID ?, ?, ?, ?, ?, ?, ?, ?, ?",
            id,
            kytt,
            nguoihd,
            detai,
            soluong,
            isDeleted,
            protect_xss(ghichu),
            protect_xss(tennhom),
            protect_xss(telegram),
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def update_xoa_nhom_thuc_tap_by_id(id: str):
    try:
        result = cursor.execute(
            "EXEC UpdateXoaNhomThucTapByID ?", protect_xss(id)
        ).fetchone()[0]
        conn.commit()
        return True if result == 1 else False
    except Exception as e:
        return e


def them_nhom_thuc_tap(
    nguoihd: str,
    kytt: str,
    detai: str,
    soluong: int,
    tennhom: str,
    telegram: str,
    isDeleted: int,
    ghichu: str,
):
    try:
        result = cursor.execute(
            "EXEC InsertNhomThucTap ?, ?, ?, ?, ?, ?, ?, ?",
            protect_xss(nguoihd),
            protect_xss(kytt),
            protect_xss(detai),
            soluong,
            isDeleted,
            protect_xss(ghichu),
            protect_xss(tennhom),
            protect_xss(telegram),
        )
        conn.commit()
        return True
    except Exception as e:
        return e


def get_chi_tiet_sinh_vien_by_id(id: str):
    try:
        i = cursor.execute("EXEC GetThongTinChiTietSVByID ?", id).fetchone()
        return {
            "id": i[0],
            "mssv": i[1],
            "hoten": i[2],
            "gioitinh": "nam" if i[3] == 1 else "nữ",
            "sdt": f"0{i[4]}",
            "email": i[5],
            "diachi": i[6],
            "malop": i[7],
            "khoa": i[8],
            "nganh": i[9],
            "truong": i[10],
            "tendetai": i[12],
            "ngaybatdau": i[13],
            "nguoihuongdan": i[14],
        }
    except Exception as e:
        return e


def get_chi_tiet_sinh_vien_chua_co_nhom(id: str):
    try:
        i = cursor.execute("EXEC GetThongTinChiTietSVChuaCoNhomByID ?", id).fetchone()
        return {
            "id": i[0],
            "mssv": i[1],
            "hoten": i[2],
            "gioitinh": i[3],
            "sdt": f"{i[4]}",
            "email": i[5],
            "diachi": i[6],
            "malop": i[7],
            "khoa": i[8],
            "nganh": i[9],
            "id_nganh": i[10],
            "truong": i[11],
            "id_truong": i[12],
        }
    except Exception as e:
        return e


def get_chi_tiet_sinh_vien_da_co_nhom(id: str):
    try:
        i = cursor.execute("EXEC GetThongTinChiTietSVDaCoNhomByID ?", id).fetchone()
        return {
            "id": i[0],
            "mssv": i[1],
            "hoten": i[2],
            "gioitinh": i[3],
            "sdt": f"{i[4]}",
            "email": i[5],
            "diachi": i[6],
            "malop": i[7],
            "khoa": i[8],
            "nganh": i[9],
            "id_nganh": i[10],
            "truong": i[11],
            "id_truong": i[12],
            "nguoihuongdan": i[13],
            "ngaybatdau": i[14],
            "tendetai": i[15],
            "tennhom": i[16],
            "sdt_nguoihuongdan": i[17],
            "email_nguoihuongdan": i[18],
            "username_nguoihuongdan": i[19],
            "ngayketthuc": i[20],
            "kyhieu_truong": i[21],
        }
    except Exception as e:
        return e


def get_chi_tiet_sinh_vien_da_danh_gia(id: str):
    try:
        i = cursor.execute("EXEC GetThongTinChiTietSVDaDanhGiaByID ?", id).fetchone()
        if i is None:
            return None
        else:
            return {
                "id": i[0],
                "mssv": i[1],
                "hoten": i[2],
                "gioitinh": i[3],
                "sdt": f"{i[4]}",
                "email": i[5],
                "diachi": i[6],
                "malop": i[7],
                "khoa": i[8],
                "nganh": i[9],
                "id_nganh": i[10],
                "truong": i[11],
                "id_truong": i[12],
                "nguoihuongdan": i[13],
                "ngaybatdau": i[14],
                "tendetai": i[15],
                "ythuckyluat_number": i[19],
                "ythuckyluat_text": i[20],
                "tuanthuthoigian_number": i[21],
                "tuanthuthoigian_text": i[22],
                "kienthuc_number": i[23],
                "kienthuc_text": i[24],
                "kynangnghe_number": i[25],
                "kynangnghe_text": i[26],
                "khanangdoclap_number": i[27],
                "khanangdoclap_text": i[28],
                "khanangnhom_number": i[29],
                "khanangnhom_text": i[30],
                "khananggiaiquyetcongviec_number": i[31],
                "khananggiaiquyetcongviec_text": i[32],
                "danhgiachung_number": i[33],
                "tennhom": i[34],
                "kyhieu_truong": i[35],
            }
    except Exception as e:
        return e


def get_ds_sinh_vien_by_username(username: str, kythuctap: str, nhomhuongdan: str):
    try:
        result = cursor.execute(
            "EXEC GetDSSVByNguoiHuongDanID ?, ?, ?",
            protect_xss(username),
            protect_xss(kythuctap),
            protect_xss(nhomhuongdan),
        )
        result_data = [
            {
                "id": i[0],
                "mssv": i[1],
                "hoten": i[2],
                "gioitinh": "Nam" if i[3] == 1 else "Nữ",
                "nganh": i[4],
                "truong": i[5],
                "trangthai": i[6],
                "detai": i[7],
                "nhom": i[8],
                "tennhom": i[9],
                "handanhgia": int(
                    datetime.datetime.combine(
                        i[10], datetime.datetime.min.time()
                    ).timestamp()
                ),
                "kyhieu_truong": i[11],
            }
            for i in result
        ]
        return result_data
    except Exception as e:
        return e


def get_dssv_by_kttid_nhomid_username(
    kythuctap_id: int, nhomhuongdan_id: int, username: str
):
    try:
        result = cursor.execute(
            "EXEC GetDSSVByKTTID_NhomID_NHDUsername ?, ?, ?",
            kythuctap_id,
            nhomhuongdan_id,
            protect_xss(username),
        )
        return [{"id": i[0], "mssv": i[1], "hoten": i[2]} for i in result.fetchall()]
    except Exception as e:
        return e


def get_ds_chi_tiet_cong_viec_by_idsinhvien(sinhvien_id: int):
    try:
        result = cursor.execute("EXEC GetDSChiTietCongViecByIDSinhVien ?", sinhvien_id)
        return [
            {
                "id": i[0],
                "ngaybatdau": i[1],
                "ngayketthuc": i[2],
                "tencongviec": i[3],
                "mota": i[4],
                "ghichu": i[5],
                "trangthai": i[6],
                "xacnhan": i[7],
            }
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def update_xac_nhan_trang_thai_cong_viec(idcongviec: int, username: str):
    try:
        result = cursor.execute(
            "EXEC UpdateXacNhanTrangThaiCongViec ?, ?",
            idcongviec,
            protect_xss(username),
        ).fetchone()[0]
        cursor.commit()
        if result == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def update_sv_xac_nhan_hoan_thanh_cong_viec(idcongviec: int, email: str):
    try:
        result = cursor.execute(
            "EXEC UpdateSVXacHoanThanhThaiCongViec ?, ?", idcongviec, protect_xss(email)
        ).fetchone()[0]
        cursor.commit()
        if result == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def get_chi_tiet_danh_gia_sv_by_id(id: str):
    try:
        i = cursor.execute("EXEC GetChiTietDanhGiaSVByID ?", id).fetchone()
        return {
            "ythuckyluat_number": i[3],
            "ythuckyluat_text": i[4],
            "tuanthuthoigian_number": i[5],
            "tuanthuthoigian_text": i[6],
            "kienthuc_number": i[7],
            "kienthuc_text": i[8],
            "kynangnghe_number": i[9],
            "kynangnghe_text": i[10],
            "khanangdoclap_number": i[11],
            "khanangdoclap_text": i[12],
            "khanangnhom_number": i[13],
            "khanangnhom_text": i[14],
            "khananggiaiquyetcongviec_number": i[15],
            "khananggiaiquyetcongviec_text": i[16],
            "danhgiachung_number": i[17],
            "handanhgia": int(
                datetime.datetime.combine(
                    i[33], datetime.datetime.min.time()
                ).timestamp()
            ),
        }
    except Exception as e:
        return e


def get_han_thuc_tap_by_nhom_id(id: int):
    try:
        i = cursor.execute("EXEC GetHanThucTapByIDNhom ?", id).fetchone()
        return {"id": i[0], "ngaybatdau": i[1], "ngayketthuc": i[2]}
    except Exception as e:
        return e


def update_danh_gia_sv_by_id(
    sinhvienid: str,
    nhomid: int,
    ythuckyluat_number: float,
    ythuckyluat_text: str,
    tuanthuthoigian_number: float,
    tuanthuthoigian_text: str,
    kienthuc_number: float,
    kienthuc_text: str,
    kynangnghe_number: float,
    kynangnghe_text: str,
    khanangdoclap_number: float,
    khanangdoclap_text: str,
    khanangnhom_number: float,
    khanangnhom_text: str,
    khananggiaiquyetcongviec_number: float,
    khananggiaiquyetcongviec_text: str,
    danhgiachung_number: float,
):
    try:
        thongtinnhom = get_han_thuc_tap_by_nhom_id(nhomid)
        # datetime.timedelta(days=3) số ngày được phép đánh giá/sửa đánh giá sau khi kết thúc kỳ thực tập
        if (
            datetime.datetime.now() - datetime.timedelta(days=3)
        ).date() <= thongtinnhom["ngayketthuc"]:
            result = cursor.execute(
                "EXEC UpdateDanhGiaSVByID ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
                protect_xss(sinhvienid),
                nhomid,
                ythuckyluat_number,
                protect_xss(ythuckyluat_text),
                tuanthuthoigian_number,
                protect_xss(tuanthuthoigian_text),
                kienthuc_number,
                protect_xss(kienthuc_text),
                kynangnghe_number,
                protect_xss(kynangnghe_text),
                khanangdoclap_number,
                protect_xss(khanangdoclap_text),
                khanangnhom_number,
                protect_xss(khanangnhom_text),
                khananggiaiquyetcongviec_number,
                protect_xss(khananggiaiquyetcongviec_text),
                danhgiachung_number,
            )
            cursor.commit()
            return True
        else:
            return False
    except Exception as e:
        return e


def update_danh_gia_sv_by_mssv(
    mssv: str,
    ythuckyluat_number: float,
    ythuckyluat_text: str,
    tuanthuthoigian_number: float,
    tuanthuthoigian_text: str,
    kienthuc_number: float,
    kienthuc_text: str,
    kynangnghe_number: float,
    kynangnghe_text: str,
    khanangdoclap_number: float,
    khanangdoclap_text: str,
    khanangnhom_number: float,
    khanangnhom_text: str,
    khananggiaiquyetcongviec_number: float,
    khananggiaiquyetcongviec_text: str,
    danhgiachung_number: float,
):
    try:
        result = cursor.execute(
            "EXEC UpdateDanhGiaSVByMSSV ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            protect_xss(mssv),
            ythuckyluat_number,
            protect_xss(ythuckyluat_text),
            tuanthuthoigian_number,
            protect_xss(tuanthuthoigian_text),
            kienthuc_number,
            protect_xss(kienthuc_text),
            kynangnghe_number,
            protect_xss(kynangnghe_text),
            khanangdoclap_number,
            protect_xss(khanangdoclap_text),
            khanangnhom_number,
            protect_xss(khanangnhom_text),
            khananggiaiquyetcongviec_number,
            protect_xss(khananggiaiquyetcongviec_text),
            danhgiachung_number,
        )
        cursor.commit()
        return True
    except Exception as e:
        return e


def get_id_nhom_by_sv_id(id: str):
    try:
        i = cursor.execute("EXEC GetIDNhomBySVID ?", protect_xss(id)).fetchone()
        return int(i[0])
    except Exception as e:
        return e


def get_ds_nhom_chua_co_cong_viec(username: str):
    """
    Get danh sách nhóm chưa có công việc bằng ID người hướng dẫn
    """
    try:
        result = cursor.execute(
            "EXEC [GetDSNhomChuaCoCongViecByNguoiHDUsername] ?", protect_xss(username)
        )
        data = [
            {
                "id": i[0],
                "ngaybatdau": i[3],
                "tendetai": i[5],
                "idcongviec": i[7],
                "tennhom": i[8],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_ds_cong_viec_nhom():
    try:
        result = cursor.execute("EXEC GetDSCongViecNhom").fetchall()
        data = [
            {
                "id": i[0],
                "ten_nhom": i[1],
                "ngaybatdau": i[2],
                "ngayketthuc": i[3],
                "ten": i[4],
                "mota": i[5],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_ds_cong_viec_by_id_nhom(id: int):
    try:
        result = cursor.execute("EXEC GetCongViecByIDNhom ?", id).fetchall()
        data = [
            {
                "id": i[0],
                "ngaybatdau": i[1],
                "ngayketthuc": i[2],
                "ten": i[3],
                "mota": i[4],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_chi_tiet_cong_viec_by_id_cong_viec(id: int):
    try:
        result = cursor.execute("EXEC GetChiTietCongViecByIDCongViec ?", id).fetchall()
        data = [
            {
                "id": i[0],
                "id_congviec": i[1],
                "id_sinhvien": i[2],
                "trangthai": i[3],
                "ghichu": i[4],
                "tencongviec": i[5],
                "nguoithuchien": i[6],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def get_chi_tiet_cong_viec_by_id(id: int):
    try:
        result = cursor.execute("EXEC GetChiTietCongViecByID ?", id).fetchall()
        data = [
            {
                "id": i[0],
                "id_congviec": i[1],
                "id_sinhvien": i[2],
                "trangthai": i[3],
                "ghichu": i[4],
            }
            for i in result
        ]
        return data
    except Exception as e:
        return e


def update_chi_tiet_cong_viec_by_id(id: int, svid: int, ghichu: str):
    try:
        result = cursor.execute(
            "EXEC UpdateChiTietCongViecByID ?, ?, ?", id, svid, protect_xss(ghichu)
        )
        cursor.commit()
        if result.fetchone()[0] == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def xoa_chi_tiet_cong_viec_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateXoaChiTietCongViecByID ?", id)
        cursor.commit()
        if result.fetchone()[0] == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def xoa_cong_viec_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateXoaCongViecByID ?", id).fetchone()[0]
        cursor.commit()
        if result == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def them_cong_viec_nhom(
    id: int, ngaybatdau: str, ngayketthuc: str, ten: str, mota: str
):
    try:
        result = cursor.execute(
            "EXEC InsertCongViec ?, ?, ?, ?, ?", id, ngaybatdau, ngayketthuc, ten, mota
        ).fetchone()
        cursor.commit()
        if result[0] == 1:
            return True
        else:
            return False
    except Exception as e:
        return e


def them_chi_tiet_cong_viec(
    id_congviec: int, id_sinhvien: int, trangthai: int, ghichu: str
):
    try:
        # Gọi stored procedure và truyền tham số
        result = cursor.execute(
            "EXEC InsertChiTietCongViec ?, ?, ?, ?",
            id_congviec,
            id_sinhvien,
            trangthai,
            protect_xss(ghichu),
        ).fetchone()[0]
        # Lấy giá trị của biến đầu ra
        cursor.commit()
        return result
    except Exception as e:
        return e


def get_dssv_by_id_cong_viec(id: int):
    try:
        result = cursor.execute("EXEC GetDSSVByIDCongViec ?", id).fetchall()
        return [{"id": i[0], "hoten": i[1]} for i in result]
    except Exception as e:
        return e


def get_dssv_by_nhom_id(id: int):
    try:
        result = cursor.execute("EXEC GetDSSVByNhomID ?", id).fetchall()
        return [{"id": i[0], "hoten": i[1], "danhgia": i[2]} for i in result]
    except Exception as e:
        return e


def get_goi_y_xa_phuong(q: str):
    try:
        result = cursor.execute(
            "SELECT DiaChi FROM XaPhuong WHERE DiaChi LIKE '%' + ? + '%'", q
        ).fetchall()
        return [i[0] for i in result]
    except Exception as e:
        return e


def get_ds_dia_chi():
    try:
        results = cursor.execute("SELECT ID, DiaChi FROM XaPhuong").fetchall()
        return [{"id": i[0], "xaphuong": i[1]} for i in results]
    except Exception as e:
        return e


def get_danh_sach_nganh():
    try:
        query = """
            SELECT N.ID, N.Ten, N.KyHieu, N.isDeleted, T.Ten as TenTruong
            FROM Nganh N
            JOIN Truong T ON N.id_truong = T.ID
        """
        result = cursor.execute(query).fetchall()
        danh_sach_nganh = [
            {
                "id": i[0],
                "ten": i[1],
                "kyhieu": i[2],
                "isDeleted": i[3],
                "ten_truong": i[4],
            }
            for i in result
        ]
        return danh_sach_nganh
    except Exception as e:
        return e


def update_chi_tiet_nganh_by_id(id: int, ten: str, kyhieu: str, idtruong: int):
    try:
        result = cursor.execute(
            "EXEC UpdateNganhByID ?, ?, ?, ?",
            id,
            protect_xss(ten),
            protect_xss(kyhieu),
            idtruong,
        )
        cursor.commit()
        return True
    except Exception as e:
        return e


def get_danh_sach_truong():
    try:
        result = cursor.execute("EXEC GetDSTruong").fetchall()
        danh_sach_truong = [
            {"id": row[0], "ten": row[1], "kyhieu": row[2]} for row in result
        ]
        return danh_sach_truong
    except Exception as e:
        return e


def update_nhom_thuc_tap_by_sv_id(email: str, idnhom: int):
    try:
        # Kiểm tra xem đã đủ số lượng chưa
        registed = cursor.execute(
            "EXEC GetSoLuongSVDaDangKyByNhomID ?", idnhom
        ).fetchone()[0]
        quantity = cursor.execute(
            "SELECT SoLuong FROM NHOMHUONGDAN WHERE ID = ?", idnhom
        ).fetchone()[0]
        if registed < quantity:
            result = cursor.execute(
                "EXEC UpdateNhomThucTapBySinhVienEmail ?, ?", protect_xss(email), idnhom
            )
            r = result.fetchone()[0]
            cursor.commit()
            if r:
                return r
            else:
                return False
        else:
            return False
    except Exception as e:
        return e


def get_dssv_da_danh_gia_by_nguoi_huong_dan(username: str, kythuctap: int):
    try:
        result = cursor.execute(
            "EXEC GetDSSVDanhGiaByNguoiHuongDanUsername ?, ?",
            protect_xss(username),
            kythuctap,
        ).fetchall()
        return [
            {
                "mssv": i[21],
                "hoten": i[18],
                "malop": i[19],
                "nguoihuongdan": i[20],
                "ythuckyluat_text": i[4],
                "ythuckyluat_number": i[3],
                "tuanthuthoigian_text": i[6],
                "tuanthuthoigian_number": i[5],
                "kienthuc_text": i[8],
                "kienthuc_number": i[7],
                "kynangnghe_text": i[10],
                "kynangnghe_number": i[9],
                "khanangdoclap_text": i[12],
                "khanangdoclap_number": i[11],
                "khanangnhom_text": i[14],
                "khanangnhom_number": i[13],
                "khananggiaiquyetcongviec_text": i[16],
                "khananggiaiquyetcongviec_number": i[15],
                "danhgiachung_number": i[17],
            }
            for i in result
        ]
    except Exception as e:
        return e


def update_xoa_sinh_vien_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateXoaSinhVienByID ?", id).fetchone()[0]
        cursor.commit()
        return result
    except Exception as e:
        return e


def update_sinh_vien_by_id(
    id: int,
    mssv: str,
    hoten: str,
    gioitinh: int,
    sdt: str,
    email: str,
    diachi: str,
    malop: str,
    truong: int,
    nganh: int,
    khoa: int,
):
    try:
        result = cursor.execute(
            "EXEC UpdateSinhVienByID ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            id,
            protect_xss(mssv),
            protect_xss(hoten),
            gioitinh,
            protect_xss(sdt),
            protect_xss(email),
            protect_xss(diachi),
            protect_xss(malop),
            truong,
            nganh,
            khoa,
        )
        r = cursor.fetchone()[0]
        cursor.commit()
        return r
    except Exception as e:
        return e


def get_danh_sach_nhom_theo_ky_id(id: int, username: str):
    try:
        result = cursor.execute(
            "EXEC GetDSNhomTheoKyID ?, ?", id, protect_xss(username)
        )
        return [
            {
                "id": i[0],
                "tennhom": i[1],
                "tendetai": i[2],
                "thoihan": i[3],
                "ghichu": i[4],
            }
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def get_ho_ten_sv_by_email(email: str):
    try:
        result = cursor.execute("EXEC GetHoTenSVByEmail ?", protect_xss(email))
        return result.fetchone()[0]
    except Exception as e:
        return e


def kiem_tra_loai_tai_khoan(username: str):
    username = protect_xss(username)
    try:
        if username:
            if "@" in username:
                result = cursor.execute(
                    "SELECT ID FROM SINHVIEN WHERE Email = ?", username
                )
                if result.fetchone()[0]:
                    return 2
            else:
                result = cursor.execute(
                    "SELECT ID FROM NGUOIHUONGDAN WHERE Username = ?", username
                )
                if result.fetchone()[0]:
                    return 1
        else:
            return 0
    except Exception as e:
        return e


def xem_thong_tin_sv(email: str):
    email = protect_xss(email)
    try:
        result = cursor.execute("EXEC GetChiTietSVByEmail ?", email)
        if result:
            i = result.fetchone()
            return {
                "id": i[0],
                "mssv": i[1],
                "hoten": i[2],
                "gioitinh": i[3],
                "sdt": i[4],
                "email": i[5],
                "diachi": i[6],
                "malop": i[7],
                "truong": i[14],
                "nganh": i[15],
                "khoa": i[10],
                "nhomhuongdan": i[16],
                "xacnhan": i[12],
            }
    except Exception as e:
        return e


def insert_danh_gia_thuc_tap(
    sv_id: int,
    nhd_id: int,
    dapan_1: int,
    dapan_2: int,
    dapan_3: int,
    dapan_4: int,
    gopy: str,
):
    try:
        check = cursor.execute(
            "SELECT COUNT(ID) FROM CHITIET_DANHGIA WHERE ID_SinhVien = ?", sv_id
        ).fetchone()[0]
        if check == 0:
            result = cursor.execute(
                "EXEC InsertChiTietDanhGia ?, ?, ?, ?, ?, ?, ?",
                sv_id,
                nhd_id,
                dapan_1,
                dapan_2,
                dapan_3,
                dapan_4,
                protect_xss(gopy),
            )
            cursor.commit()
            if result.fetchone()[0]:
                return True
        else:
            return False
    except Exception as e:
        return e


def get_ds_chi_tiet_danh_gia():
    try:
        result = cursor.execute("EXEC GetDSChiTietDanhGia").fetchall()
        if result:
            return [
                {
                    "id": i[0],
                    "id_sinhvien": i[1],
                    "mssv": i[8],
                    "hoten_sinhvien": i[9],
                    "tennhom": i[10],
                    "ngaybatdau": i[12],
                    "nguoihuongdan_ten": i[13],
                    "nguoihuongdan_id": i[14],
                    "tendetai": i[15],
                }
                for i in result
            ]
        else:
            return []
    except Exception as e:
        return e


def get_ds_chi_tiet_danh_gia_by_id(id: int):
    try:
        i = cursor.execute("EXEC GetDSChiTietDanhGiaByID ?", id).fetchone()
        return {
            "id": i[0],
            "dapan_1": i[3],
            "dapan_2": i[4],
            "dapan_3": i[5],
            "dapan_4": i[6],
            "gopy": i[7],
            "mssv": i[8],
            "hoten": i[9],
            "tennhom": i[10],
            "kythuctap": i[12],
            "nguoihuongdan": i[13],
            "detai": i[15],
        }
    except Exception as e:
        return e


def check_sv_con_han_thuc_tap(email: str):
    try:
        i = cursor.execute(
            "EXEC CheckSVConHanThucTapByEmail ?", protect_xss(email)
        ).fetchone()
        return i
    except Exception as e:
        return False


def get_chi_tiet_giao_viec_cho_sv_by_id_cong_viec(id: int, sv_id: int):
    try:
        result = cursor.execute(
            "EXEC GetChiTietGiaoViecChoSVByIDCongViec ?, ?", id, sv_id
        ).fetchone()
        return {
            "nguoinhanviec": result[0],
            "mssv": result[1],
            "nguoigiaoviec": result[2],
            "tencongviec": result[3],
            "ngaybatdau": result[4],
            "ngayketthuc": result[5],
            "ghichu": result[6],
            "motacongviec": result[7],
            "telegram_id": result[8],
        }
    except Exception as e:
        return e


def get_ds_congviec_by_sinhvien_email(email: str):
    try:
        idNhom = cursor.execute(
            "EXEC GetChiTietSVByEmail ?", protect_xss(email)
        ).fetchone()[11]
        return get_ds_cong_viec_by_id_nhom(idNhom)
    except Exception as e:
        return e


def get_chi_tiet_cong_viec_by_id_cong_viec_email_sv(id: int, email: str):
    try:
        result = cursor.execute(
            "EXEC GetChiTietCongViecByIDCongViecEmailSV ?, ?", id, protect_xss(email)
        ).fetchone()
        data = [
            {
                "id": result[0],
                "id_congviec": result[1],
                "id_sinhvien": result[2],
                "ghichu": result[3],
                "tencongviec": result[4],
                "nguoithuchien": result[5],
                "trangthai": result[6],
                "xacnhan": result[7],
            }
        ]
        return data
    except Exception as e:
        return e


def update_password(username: str, old_password: str, new_password: str):
    try:
        result = cursor.execute(
            "EXEC UpdatePassword ?, ?, ?",
            protect_xss(username),
            protect_xss(old_password),
            protect_xss(new_password),
        )
        kq = result.fetchone()[0]
        cursor.commit()
        return kq
    except Exception as e:
        return e


def update_password_sv(email: str, old_password: str, new_password: str):
    try:
        result = cursor.execute(
            "EXEC UpdatePasswordSV ?, ?, ?",
            protect_xss(email),
            protect_xss(old_password),
            protect_xss(new_password),
        )
        kq = result.fetchone()[0]
        cursor.commit()
        return kq
    except Exception as e:
        return e


def get_phan_quyen(username: str):
    try:
        result = cursor.execute("EXEC GetPhanQuyenByUsername ?", protect_xss(username))
        # Role: {0: "user", 1: "administrator"}
        return "admin" if result.fetchone()[0] == 1 else "user"
    except Exception as e:
        return e


def get_ds_tai_khoan():
    try:
        result = cursor.execute("EXEC GetDSTaiKhoanNguoiHuongDan").fetchall()
        return [
            {
                "id": i[0],
                "hoten": i[1],
                "username": i[2],
                "email": i[3],
                "role": i[4],
                "trangthai": i[5],
                "tenvaitro": i[6],
            }
            for i in result
        ]
    except Exception as e:
        return e


def update_xoa_nguoi_huong_dan_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateXoaNguoiHuongDanByID ?", id).fetchone()
        cursor.commit()
        return result[0]
    except Exception as e:
        return e


def update_ban_nguoi_huong_dan_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateBanNguoiHuongDanByID ?", id).fetchone()
        cursor.commit()
        return result[0]
    except Exception as e:
        return e


def update_active_nguoi_huong_dan_by_id(id: int):
    try:
        result = cursor.execute("EXEC UpdateActiveNguoiHuongDanByID ?", id).fetchone()
        cursor.commit()
        return result[0]
    except Exception as e:
        return e


def update_reset_mat_khau_nguoi_huong_dan_by_id(id: int, password: str):
    try:
        result = cursor.execute(
            "EXEC UpdateResetMatKhauNguoiHuongDanByID ?, ?", id, protect_xss(password)
        ).fetchone()
        cursor.commit()
        return result[0]
    except Exception as e:
        return e


# def update_phan_quyen_nguoi_huong_dan_by_id(id: int, role: int):
#     try:
#         result = cursor.execute(
#             "EXEC UpdateQuyenNguoiHuongDanByID ?, ?", id, role).fetchone()
#         cursor.commit()
#         return result[0]
#     except Exception as e:
#         return e


def get_thong_tin_nguoi_huong_dan_by_id(id: int):
    try:
        result = cursor.execute("EXEC GetChiTietTaiKhoanByID ?", id).fetchone()
        return {
            "id": result[0],
            "hoten": result[1],
            "sdt": result[2],
            "email": result[3],
            "chucdanh": result[4],
            "phong": result[5],
            "zalo": result[6],
            "facebook": result[7],
            "github": result[8],
            "avatar": result[9],
        }
    except Exception as e:
        return e


def update_chi_tiet_tai_khoan_by_id(
    id: int,
    hoten: str,
    sdt: str,
    email: str,
    chucdanh: str,
    phong: str,
    zalo: str,
    facebook: str,
    github: str,
    avatar: str,
):
    try:
        result = cursor.execute(
            "EXEC UpdateChiTietTaiKhoanByID ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            id,
            protect_xss(hoten),
            protect_xss(sdt),
            protect_xss(email),
            protect_xss(chucdanh),
            protect_xss(phong),
            protect_xss(zalo),
            protect_xss(facebook),
            protect_xss(github),
            protect_xss(avatar),
        ).fetchone()
        cursor.commit()
        return result[0]
    except Exception as e:
        return e


def them_nguoi_huong_dan(
    hoten: str,
    sdt: str,
    email: str,
    chucdanh: str,
    phong: str,
    username: str,
    password: str,
    zalo: str,
    facebook: str,
    github: str,
    avatar: str,
):
    try:
        insert_nhd = cursor.execute(
            "EXEC InsertNguoiHuongDan ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            protect_xss(hoten),
            protect_xss(sdt),
            protect_xss(email),
            protect_xss(chucdanh),
            protect_xss(phong),
            protect_xss(username),
            protect_xss(password),
            protect_xss(zalo),
            protect_xss(facebook),
            protect_xss(github),
            protect_xss(avatar),
        )
        kq_insert_nhd = insert_nhd.fetchone()[0]
        conn.commit()

        insert_phanquyen = cursor.execute("EXEC InsertPhanQuyen ?, ?", kq_insert_nhd, 2)
        kq_insert_phanquyen = insert_phanquyen.fetchone()[0]
        conn.commit()

        return kq_insert_phanquyen
    except Exception as e:
        return e


def them_nganh(ten: str, kyhieu: str, isDeleted: int, idtruong: int):
    try:
        ten = protect_xss(ten)
        kyhieu = protect_xss(kyhieu)

        # Check if kyhieu exists
        check_query = "SELECT COUNT(*) FROM Nganh WHERE kyhieu = ?"
        cursor.execute(check_query, (kyhieu,))
        exists = cursor.fetchone()[0]

        if exists > 0:
            return {"status": "EXIST"}
        else:

            query = """
                INSERT INTO Nganh (Ten, KyHieu, isDeleted, id_truong)
                OUTPUT INSERTED.ID
                VALUES (?, ?, ?, ?)
            """
            cursor.execute(
                query, (protect_xss(ten), protect_xss(kyhieu), isDeleted, idtruong)
            )
            kq_insert_nganh = cursor.fetchone()[0]
            conn.commit()
            return {"status": "OK", "result": kq_insert_nganh}
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "ERROR", "message": str(e)}


def update_thong_tin_sv(
    sv_id: int,
    mssv: str,
    hoten: str,
    gioitinh: int,
    sdt: str,
    email: str,
    diachi: str,
    malop: str,
    khoa: int,
    nganh: int,
    truong: int,
):
    try:
        update = cursor.execute(
            "EXEC UpdateSinhVienByID ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
            sv_id,
            protect_xss(mssv),
            protect_xss(hoten),
            gioitinh,
            protect_xss(sdt),
            protect_xss(email),
            protect_xss(diachi),
            protect_xss(malop),
            khoa,
            truong,
            nganh,
        )
        r = update.fetchone()
        cursor.commit()
        return r[0]
    except Exception as e:
        return e


def ctu_xuat_phieu_giao_viec_model(sv_id: int, username: str):
    try:
        r = cursor.execute(
            "EXEC GetCongViecByIDSinhVien ?, ?", sv_id, protect_xss(username)
        ).fetchall()
        if len(r) >= 1:
            return {
                "sv_hoten": r[0][0],
                "sv_mssv": r[0][1],
                "nguoihuongdan_hoten": r[0][2],
                "kyhieu_truong": r[0][9],
                "ktt_ngaybatdau": r[0][3],
                "ktt_ngayketthuc": r[0][4],
                "congviec": [
                    {
                        "ngaybatdau": i[5],
                        "ngayketthuc": i[6],
                        "tencongviec": i[7],
                        "mota": str(i[8]).replace("<br>", "\n"),
                    }
                    for i in r
                ],
            }
        else:
            return None
    except Exception as e:
        return e


# BRANCH THUAN
# def xuat_phieu_danh_gia_ctu_model(sv_id: int, username: str):
#     try:
#         r = cursor.execute("EXEC GetDanhGiaSVByID ?, ?", sv_id, protect_xss(username)).fetchone()
#         if r:
#             return {'ythuckyluat_number': r[3], 'ythuckyluat_text': r[4], 'tuanthuthoigian_number': r[5], 'tuanthuthoigian_text': r[6], 'kienthuc_number': r[7], 'kienthuc_text': r[8], 'kynangnghe_number': r[9], 'kynangnghe_text': r[10], 'khanangdoclap_number': r[11], 'khanangdoclap_text': r[12], 'khanangnhom_number': r[13], 'khanangnhom_text': r[14], 'khananggiaiquyetcongviec_number': r[15], 'khananggiaiquyetcongviec_text': r[16], 'danhgiachung_number': r[17]}
#         else:
#             return None
#     except Exception as e:
#         return e

# #Chuc nang xuat phieu danh gia
# def ctu_xuat_danh_gia(sv_id: int, username: str):
#     try:
#         r = cursor.execute("EXEC UpdateDanhGiaSVByID ?, ?", sv_id, protect_xss(username)).fetchone()
#         if r:
#             return {'ythuckyluat_number': r[3], 'ythuckyluat_text': r[4], 'tuanthuthoigian_number': r[5], 'tuanthuthoigian_text': r[6], 'kienthuc_number': r[7], 'kienthuc_text': r[8], 'kynangnghe_number': r[9], 'kynangnghe_text': r[10], 'khanangdoclap_number': r[11], 'khanangdoclap_text': r[12], 'khanangnhom_number': r[13], 'khanangnhom_text': r[14], 'khananggiaiquyetcongviec_number': r[15], 'khananggiaiquyetcongviec_text': r[16], 'danhgiachung_number': r[17]}
#         else:
#             return None
#     except Exception as e:
#         return e


def update_xoa_nganh_by_id(id: int):
    try:
        query = "UPDATE Nganh SET isDeleted = 1 WHERE ID = ?"
        result = cursor.execute(query, id).rowcount
        cursor.commit()
        return result
    except Exception as e:
        return e


def update_mo_khoa_nganh_by_id(id: int):
    try:
        query = "UPDATE Nganh SET isDeleted = 0 WHERE ID = ?"
        result = cursor.execute(query, id).rowcount
        cursor.commit()
        return result
    except Exception as e:
        return e


def get_chi_tiet_nganh_by_id(id: str):
    try:
        result = cursor.execute("EXEC GetChiTietNganhByID ?", id).fetchone()
        return {
            "id": result[0],
            "ten": result[1],
            "kyhieu": result[2],
            "isDeleted": result[3],
            "id_truong": result[4],
            "ten_truong": result[5],
        }
    except Exception as e:
        return e


def update_nganh_by_id(id: int, ten: str, kyhieu: str, isDeleted: int, idtruong: int):
    try:
        ten = protect_xss(ten)
        kyhieu = protect_xss(kyhieu)

        # Check if kyhieu exists
        check_query = "SELECT COUNT(*) FROM nganh WHERE kyhieu = ? AND id != ?"
        cursor.execute(check_query, (kyhieu, id))
        exists = cursor.fetchone()[0]

        if exists > 0:
            return {"status": "EXIST"}
        query = "UPDATE Nganh SET Ten = ?, KyHieu = ?, isDeleted = ?, id_truong = ? WHERE ID = ?"
        result = cursor.execute(
            query, protect_xss(ten), protect_xss(kyhieu), isDeleted, idtruong, id
        ).rowcount
        cursor.commit()
        return {"status": "OK", "result": result}
    except Exception as e:
        return e


# def get_danhsach_templates():
#     try:
#         query = """
#         select tem.id, tem.name, tem.content, t.Ten as TenTruong
#         from Template tem
#         JOIN Truong t ON tem.truong_id = t.ID
#         """
#         result = cursor.execute(query).fetchall()
#         danh_sach_templates = [
#             {'id': i[0], 'name': i[1], 'content': i[2], 'ten_truong': i[3]}
#             for i in result
#         ]
#         return danh_sach_templates
#     except Exception as e:
#         return e


def delete_nganh_by_id_list_model(idList: list):
    try:
        placeholders = ",".join(["?"] * len(idList))
        query = "DELETE FROM Nganh WHERE ID IN ({})".format(placeholders)
        result = cursor.execute(query, idList).rowcount
        cursor.commit()
        return {"status": "OK", "deleted_count": result}
    except Exception as e:
        print(e)
        return {"status": "ERROR", "message": str(e)}


def insert_bieu_mau(file_path: str, id_truong: int, tenbieumau: str):
    try:
        result = cursor.execute(
            "EXEC InsertBieuMau ?, ?, ?", file_path, id_truong, tenbieumau
        )
        cursor.commit()
        return True
    except Exception as e:
        return False


def query_pdf_path_from_database_model(id: str, id_bieumau: int) -> str:
    try:
        # Construct the SQL query
        query = "SELECT Data, TenBieuMau,TenFile, Extension AS extn FROM BIEUMAU WHERE id = ? AND truong = ?"

        # Execute the query with the provided parameters
        cursor.execute(query, (id_bieumau, id))

        # Fetch the first result from the query
        row = cursor.fetchone()

        if row:
            # Extract the data, tenbieumau, and extension from the row
            data, tenbieumau, extn, tenfile = row

            # Generate a unique filename based on tenbieumau and extension
            filename = f"{tenfile}"

            # Define the directory to save the PDF files
            pdf_directory = "pdf"
            if not os.path.exists(pdf_directory):
                os.makedirs(pdf_directory)

            # Define the output file path
            output_file_path = os.path.join(pdf_directory, filename)

            # Write the file data to the output path
            with open(output_file_path, "wb") as f:
                f.write(data)

            # Return the path to the saved file
            return output_file_path
        else:
            print("No row found for the provided IDs")
            return None
    except Exception as e:
        # Print any errors that occur during the process
        print(f"Error retrieving file: {e}")
        return None


def vlute_chinh_sua_danh_gia_model(id_bieumau: int):
    try:
        query = """
        select data,extension as ext from BIEUMAU where id = ?
        """
        i = cursor.execute(query, id_bieumau).fetchone()
        return {"data": i[0], "ext": i[1]}
    except Exception as e:
        return e


# doc file pdf


def get_pdf_from_database(id):
    cursor.execute("SELECT tenfile, extension FROM BieuMau WHERE id=?", id)
    row = cursor.fetchone()
    if row:
        pdf_data = row.tenfile
        extension = row.extension
        return pdf_data, extension
    else:
        return None, None


def chi_tiet_bieu_mau_model(id: str, id_bieumau: int):
    try:
        query = """
        select data,extension as ext from BIEUMAU where id = ? AND truong = ?
        """
        i = cursor.execute(query, id_bieumau, id).fetchone()
        return {"data": i[0], "ext": i[1]}
    except Exception as e:
        return e


def ctu_chinh_phieu_tiep_nhan_model(id: int, id_bieumau: int):
    try:
        query = """
        select data,extension as ext from BIEUMAU where id = ? and truong = ?
        """
        i = cursor.execute(query, id_bieumau, id).fetchone()
        return {"data": i[0], "ext": i[1]}
    except Exception as e:
        return e


# LẤY DANH SÁCH TẤT CẢ LOẠI YÊU CẦU IN PHIẾU
def get_ds_loai_yeu_cau():
    try:
        result = cursor.execute(
            "SELECT ID, LoaiYeuCau FROM [QL_SinhVien].[dbo].[LOAIYEUCAU]"
        ).fetchall()
        return [{"id": i[0], "loaiyeucau": i[1]} for i in result]
    except Exception as e:
        return e


# LẤY DANH SÁCH LOẠI YÊU CẦU THEO TỪNG SINH VIÊN
def get_ds_loai_yeu_cau_by_sv(sv_id: int):
    try:
        result = cursor.execute(
            "SELECT lyc.ID, lyc.LoaiYeuCau FROM LOAIYEUCAU lyc inner join LOAIYEUCAU_TRUONG "
            "lyct on lyc.ID = lyct.LOAIYEUCAU inner join SINHVIEN sv on lyct.TRUONG = sv.Truong "
            "WHERE sv.ID = ?;",
            sv_id,
        ).fetchall()
        return [{"id": i[0], "loaiyeucau": i[1]} for i in result]
    except Exception as e:
        return e


def get_ds_yeu_cau_in_phieu_by_sv(sv_id: int):
    try:
        result = cursor.execute(
            "SELECT yc.id, loaiyeucau, CONVERT(VARCHAR, ngaygui, 103) as ngaygui, trangthai FROM YeuCauInPhieu yc inner join LOAIYEUCAU lyc on lyc.ID = yc.ID_LoaiYeuCau WHERE id_sinhvien = ? ORDER BY ngaygui DESC",
            sv_id,
        )
        return [
            {"id": i[0], "loaiyeucau": i[1], "ngaygui": i[2], "trangthai": i[3]}
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def gui_yeu_cau_in_phieu(id: int, idloaiyeucau: int):
    try:
        result = cursor.execute(
            "EXEC InsertYeuCauInPhieu ?, ?, ?",
            id,
            idloaiyeucau,
            datetime.datetime.now().strftime("%Y-%m-%d"),
        ).fetchone()[0]
        conn.commit()
        return result
    except Exception as e:
        return e


def gui_yeu_cau_in_phieu_by_nguoi_huong_dan(ids: list, idloaiyeucau: int, nhd_id: int):
    try:
        r = 0
        for sv_id in ids:
            cursor.execute(
                "EXEC InsertYeuCauInPhieuByNguoiHuongDan ?, ?, ?, ?",
                sv_id,
                idloaiyeucau,
                datetime.datetime.now().strftime("%Y-%m-%d"),
                nhd_id,
            )
            conn.commit()
            if cursor.rowcount >= 0:
                r += cursor.rowcount
        return r
    except Exception as e:
        return e


def update_xoa_yeu_cau_in_phieu_by_id(ids: list):
    try:
        r = 0
        for id in ids:
            cursor.execute("EXEC UpdateXoaYeuCauInPhieuByID ?", id)
            conn.commit()
            r += cursor.rowcount
        return r
    except Exception as e:
        return e


def get_all_yeu_cau_in_phieu(kythuctap: str):
    try:
        result = cursor.execute("EXEC GetAllYeuCauInPhieu ?", kythuctap)
        return [
            {
                "id": i[0],
                "hotensv": i[1],
                "emailsv": i[2],
                "loaiyeucau": i[3],
                "ngayguiyc": i[4],
                "ngayxuly": i[5],
                "trangthai": i[6],
            }
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def update_yeu_cau_in_phieu(ids: list, id_nxl: int, trangthai: int):
    try:
        r = 0
        # Sử dụng vòng lặp để thực hiện cập nhật cho từng ID trong danh sách
        for id in ids:
            cursor.execute(
                "EXEC UpdateYeuCauInPhieu ?, ?, ?, ?",
                id,
                datetime.datetime.now().strftime("%Y-%m-%d"),
                trangthai,
                id_nxl,
            )
            conn.commit()
            r += cursor.rowcount

        return r
    except Exception as e:
        return e


def check_trang_thai_yeu_cau_in_phieu(id: int):
    try:
        result = cursor.execute("EXEC CheckYeuCauInPhieu ?", id).fetchone()[0]
        conn.commit()
        return result
    except Exception as e:
        return e


def get_username_nguoi_huong_dan_by_sv_id(sv_id: int):
    try:
        result = cursor.execute(
            "SELECT nhd.Username FROM SINHVIEN sv inner join NHOMHUONGDAN nhom on sv.NhomHuongDan=nhom.ID inner join NGUOIHUONGDAN nhd on nhom.NguoiHuongDanID=nhd.ID WHERE sv.ID = ?",
            sv_id,
        ).fetchone()
        if result is None:
            return {"error": "Không tìm thấy thông tin người hướng dẫn"}
        return result[0]
    except Exception as e:
        return e


def check_yeu_cau_in_phieu(id: int):
    try:
        result = cursor.execute(
            "SELECT yc.trangthai, l.LoaiYeuCau FROM YeuCauInPhieu yc inner join LOAIYEUCAU l on yc.ID_LoaiYeuCau=l.ID WHERE yc.ID = ?",
            id,
        ).fetchone()
        return {"trangthai": result[0], "loaiyeucau": result[1]}
    except Exception as e:
        return e


def get_ky_hieu_truong_by_sv_id(id: int):
    try:
        result = cursor.execute(
            "SELECT KyHieu FROM Truong t inner join SinhVien sv on sv.Truong = t.ID WHERE sv.ID = ?",
            id,
        ).fetchone()
        return result[0]
    except Exception as e:
        return e


# DANH MỤC CHỨC NĂNG
def get_all_chuc_nang():
    try:
        result = cursor.execute(
            "SELECT ID, URL, TENCHUCNANG, MOTA, TRANGTHAI FROM CHUCNANG ORDER BY TENCHUCNANG ASC"
        )
        return [
            {"id": i[0], "url": i[1], "ten": i[2], "mota": i[3], "trangthai": i[4]}
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def insert_chuc_nang(url: str, ten: str, mota: str, trangthai: int):
    try:
        cursor.execute("EXEC InsertChucNang ?, ?, ?, ?", url, ten, mota, trangthai)
        conn.commit()
        r = cursor.rowcount
        return r
    except Exception as e:
        return e


def update_xoa_chuc_nang(id: int):
    try:
        cursor.execute("EXEC UpdateXoaChucNang ?", id)
        conn.commit()
        r = cursor.rowcount
        return r
    except Exception as e:
        return e


def get_chi_tiet_chuc_nang_by_id(id: int):
    try:
        result = cursor.execute(
            "SELECT ID, URL, TENCHUCNANG, MOTA, TRANGTHAI FROM CHUCNANG WHERE id = ?",
            id,
        ).fetchone()
        return {
            "id": result[0],
            "url": result[1],
            "ten": result[2],
            "mota": result[3],
            "trangthai": result[4],
        }
    except Exception as e:
        return e


def update_chi_tiet_chuc_nang_by_id(
    id: int, url: str, ten: str, mota: str, trangthai: int
):
    try:
        cursor.execute(
            "EXEC UpdateChiTietChucNangByID ?, ?, ?, ?, ?",
            id,
            url,
            ten,
            mota,
            trangthai,
        )
        conn.commit()
        r = cursor.rowcount
        return r
    except Exception as e:
        return e


# DANH MỤC PHÂN QUYỀN (ROLE)
def get_all_vai_tro_chuc_nang():
    try:
        result = cursor.execute(
            """SELECT vt.ID AS IDVAITRO, vt.TenVaiTro, vt.TrangThai, cn.TenChucNang, cn.ID AS IDCHUCNANG
                                    FROM VAITRO vt left join VAITRO_CHUCNANG vtcn ON vt.ID = vtcn.ID_VaiTro
                                    left join CHUCNANG cn ON vtcn.ID_ChucNang = cn.ID ORDER BY vt.TenVaiTro ASC"""
        )
        return [
            {
                "idvaitro": i[0],
                "tenvaitro": i[1],
                "trangthai": i[2],
                "tenchucnang": i[3],
                "idchucnang": i[4],
            }
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def update_trang_thai_vai_tro(idvt: int, trangthai: int):
    try:
        r = cursor.execute(
            "EXEC UpdateTrangThaiVaiTro ?, ?", idvt, trangthai
        ).fetchone()[0]
        conn.commit()
        return r
    except Exception as e:
        return e


def insert_vai_tro(ten: str):
    try:
        cursor.execute("EXEC InsertVaiTro ?", ten)
        result = cursor.fetchone()[0]
        conn.commit()
        return result
    except Exception as e:
        return e


def delete_vai_tro(idvt: int):
    try:
        result = cursor.execute("EXEC UpdateXoaVaiTro ?", idvt).fetchone()
        conn.commit()
        return result[0]
    except Exception as e:
        return e


# LẤY CHI TIẾT VAI TRÒ, BAO GỒM ID, TÊN, CÁC CHỨC NĂNG
def get_chi_tiet_vai_tro(idvt: int):
    try:
        result = cursor.execute(
            """SELECT vt.ID AS IDVAITRO, vt.TenVaiTro, vt.TrangThai, cn.TenChucNang, cn.ID AS IDCHUCNANG
                                    FROM VAITRO vt left join VAITRO_CHUCNANG vtcn ON vt.ID = vtcn.ID_VaiTro
                                    left join CHUCNANG cn ON vtcn.ID_ChucNang = cn.ID WHERE vt.ID = ?""",
            idvt,
        )
        return [
            {
                "idvaitro": i[0],
                "tenvaitro": i[1],
                "trangthai": i[2],
                "tenchucnang": i[3],
                "idchucnang": i[4],
            }
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


def insert_vai_tro_chuc_nang(idvt: int, idcn: list):
    try:
        if len(idcn) == 0:
            return 0
        r = 0
        for id in idcn:
            cursor.execute("EXEC InsertVaiTroChucNang ?, ?", idvt, id)
            conn.commit()
            r += cursor.rowcount
        return r
    except Exception as e:
        return e


def delete_vai_tro_chuc_nang(idvt: int, idcn: list):
    try:
        if len(idcn) == 0:
            return 0
        r = 0
        for id in idcn:
            cursor.execute("EXEC UpdateXoaVaiTroChucNang ?, ?", idvt, id)
            conn.commit()
            r += cursor.rowcount
        return r
    except Exception as e:
        return e


def update_ten_vai_tro(idvt: int, ten: str):
    try:
        cursor.execute("EXEC UpdateTenVaiTro ?, ?", idvt, ten)
        conn.commit()
        r = cursor.rowcount
        return r
    except Exception as e:
        return e


def get_all_vai_tro():
    try:
        result = cursor.execute("SELECT ID, TENVAITRO, TRANGTHAI FROM VAITRO")
        return [
            {"id": i[0], "tenvaitro": i[1], "trangthai": i[2]}
            for i in result.fetchall()
        ]
    except Exception as e:
        return e


# update from row 920
def insert_user_role(uid: int, roles: list):
    try:
        if len(roles) == 0:
            return 0
        for role in roles:
            result = cursor.execute("EXEC InsertUserRole ?, ?", uid, role).fetchone()
            conn.commit()
            r = result[0]
        return r
    except Exception as e:
        return e


def delete_user_role(uid: int, roles: list):
    try:
        if len(roles) == 0:
            return 0
        for role in roles:
            result = cursor.execute("EXEC DeleteUserRole ?, ?", uid, role).fetchone()
            conn.commit()
            r = result[0]
        return r
    except Exception as e:
        return e


def get_phan_quyen_by_id(id: int):
    try:
        result = cursor.execute("EXEC GetPhanQuyenByID ?", id)
        return [{"role": i[0]} for i in result.fetchall()]
    except Exception as e:
        return e


# update from row 37
def verify_user(username: str, password: str):
    try:
        result = cursor.execute(
            "UserLogin ?, ?", protect_xss(username), protect_xss(password)
        ).fetchone()[0]
        if result != None:
            return result
        else:
            return False
    except Exception as e:
        return e


def get_ds_chuc_nang_by_user_id(id: int):
    try:
        result = cursor.execute("EXEC GetDSChucNangByUserID ?", id)
        return [{"url": i[0]} for i in result.fetchall()]
    except Exception as e:
        return e


def check_role_by_url_and_id(uid: int, url: str):
    try:
        result = cursor.execute("EXEC CheckRoleByUrlAndID ?, ?", uid, url).fetchone()[0]
        if result != None:
            return result
        else:
            return -1
    except Exception as e:
        return e


def get_thong_tin_nhom_by_sv_email(email: str):
    try:
        result = cursor.execute("GetTTNhomSVByEmail ?", email).fetchone()
        if result != None:
            return result
        else:
            return -1
    except Exception as e:
        return e


def get_danh_sach_bieu_mau():
    try:
        result = cursor.execute("EXEC GetDanhSachBieuMau").fetchall()
        if result != None:
            return [
                {
                    "id": i[0],
                    "ten": i[1],
                    "path": i[2],
                    "isDeleted": i[3],
                    "tentruong": i[4],
                    "kyhieutruong": i[5],
                }
                for i in result
            ]
        else:
            return -1
    except Exception as e:
        return e


def get_chi_tiet_bieu_mau_by_id(id: int):
    try:
        result = cursor.execute("EXEC GetChiTietBieuMauByID ?", id).fetchone()
        if result != None:
            return {
                "id": result[0],
                "ten": result[1],
                "path": result[2],
                "isDeleted": result[3],
                "tentruong": result[4],
                "kyhieutruong": result[5],
            }
        else:
            return -1
    except Exception as e:
        return e


def xoa_bieu_mau_by_id(id: int):
    try:
        result = cursor.execute("EXEC XoaBieuMauByID ?", id)
        cursor.commit()
        return True
    except Exception as e:
        return e

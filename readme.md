# HỆ THỐNG QUẢN LÝ SINH VIÊN THỰC TẬP

## MÔ TẢ HỆ THỐNG

Hệ thống quản lý sinh viên thực tập nhằm giúp các người hướng dẫn và sinh viên dễ dàng theo dõi và quản lý quá trình thực tập. Dưới đây là mô tả chi tiết về các thành phần của hệ thống:

### 1. **Database (MS SQL Server)**
   - Hệ cơ sở dữ liệu sử dụng MS SQL Server để lưu trữ thông tin về sinh viên, người hướng dẫn, tiến độ thực tập, và các thông tin liên quan.
   - Cung cấp cơ sở dữ liệu cho ứng dụng và đảm bảo tính nhất quán và an toàn của dữ liệu.

### 2. **Webserver (Python 3.7+)**
   - Sử dụng Python 3.7 trở lên để phát triển webserver, sử dụng FastAPI.
   - Cung cấp giao diện web cho người hướng dẫn và sinh viên để quản lý thông tin và tiến độ thực tập.

### 3. **Docker (Optional)**
   - Tích hợp Docker để đơn giản hóa quá trình triển khai và chạy hệ thống trên nhiều môi trường khác nhau.

## HƯỚNG DẪN CÀI ĐẶT

1. **Cài đặt Python 3:**
   - Cài đặt Python phiên bản 3.7 trở lên.

2. **Cài đặt thư viện:**
   - Mở `cmd` và chạy lệnh `pip install -r requirements.txt` để cài đặt các thư viện cần thiết.

## PHÁT TRIỂN
   - Thêm quản lý danh mục: Trường, Ngành
   - Thêm endpoint thêm/sửa đánh giá sinh viên CTU
   - Thêm tính năng xuất đánh giá CTU PDF

### LƯU Ý: VUI LÒNG KHÔNG SHARE DỮ LIỆU RA BÊN NGOÀI DƯỚI MỌI HÌNH THỨC

**Nơi Lưu Trữ Dữ Liệu:** Mọi dữ liệu liên quan đến sinh viên và tiến độ thực tập được lưu trữ an toàn trong cơ sở dữ liệu. Đảm bảo rằng không chia sẻ dữ liệu ra khỏi hệ thống dưới mọi hình thức để đảm bảo tính bảo mật và tuân thủ quy định.



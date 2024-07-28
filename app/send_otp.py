from .config import create_connection, email_host, email_port, email_username, email_password, email_name
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import pyotp
from datetime import datetime, timedelta

conn = create_connection()
cursor = conn.cursor()

# Hàm để gửi email với mã OTP và lưu thông tin vào cơ sở dữ liệu


def send_otp_email(email: str, hoten: str):
    # Tạo một đối tượng TOTP với một secret key mới
    totp = pyotp.TOTP(pyotp.random_base32())

    # Tạo mã OTP hiện tại
    otp = totp.now()

    # Lưu thông tin vào cơ sở dữ liệu
    save_otp_to_database(email, otp)

    # Nội dung email
    body = '''
        <!doctype html>
            <html ⚡4email data-css-strict>

            <head>
            <meta charset="utf-8">
            <meta name="x-apple-disable-message-reformatting">
            <style amp4email-boilerplate>
                body {
                visibility: hidden
                }
            </style>

            <script async src="https://cdn.ampproject.org/v0.js"></script>


            <style amp-custom>
                .u-row {
                display: flex;
                flex-wrap: nowrap;
                margin-left: 0;
                margin-right: 0;
                }
                
                .u-row .u-col {
                position: relative;
                width: 100%;
                padding-right: 0;
                padding-left: 0;
                }
                
                .u-row .u-col.u-col-100 {
                flex: 0 0 100%;
                max-width: 100%;
                }
                
                @media (max-width: 767px) {
                .u-row:not(.no-stack) {
                    flex-wrap: wrap;
                }
                .u-row:not(.no-stack) .u-col {
                    flex: 0 0 100%;
                    max-width: 100%;
                }
                }
                
                body {
                margin: 0;
                padding: 0;
                }
                
                table,
                tr,
                td {
                vertical-align: top;
                border-collapse: collapse;
                }
                
                p {
                margin: 0;
                }
                
                .ie-container table,
                .mso-container table {
                table-layout: fixed;
                }
                
                * {
                line-height: inherit;
                }
                
                table,
                td {
                color: #000000;
                }
                
                #u_body a {
                color: #0000ee;
                text-decoration: underline;
                }
            </style>


            </head>

            <body class="clean-body u_body" style="margin: 0;padding: 0;background-color: #f9f9f9;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%" cellpadding="0" cellspacing="0">
                <tbody>
                <tr style="vertical-align: top">
                    <td style="word-break: break-word;border-collapse: collapse;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; color: #afb0c7; line-height: 170%; text-align: center; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 14px; line-height: 23.8px;">View Email in Browser</span></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #ffffff;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Cabin',sans-serif;" align="left">

                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
                                            <a href="https://www.svtt.io.vn/" target="_blank">
                                                <amp-img alt="www.svtt.io.vn" src="https://assets.unlayer.com/projects/227070/1712736252454-logo.png" width="512" height="512" layout="intrinsic" style="width: 7%;max-width: 7%;">
                                            </a>
                                            </amp-img>
                                            </td>
                                        </tr>
                                        </table>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #003399;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif;" align="left">

                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">

                                            <amp-img alt="Image" src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png" width="335" height="93" layout="intrinsic" style="width: 26%;max-width: 26%;">

                                            </amp-img>
                                            </td>
                                        </tr>
                                        </table>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%;"><strong>BẠN ĐÃ ĐĂNG KÝ THÔNG TIN THÀNH CÔNG</strong></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 31px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 28px; line-height: 39.2px;"><strong><span style="line-height: 39.2px; font-size: 28px;">ĐÂY LÀ EMAIL XÁC THỰC OTP</span></strong>
                                            </span>
                                        </p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #ffffff;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; line-height: 160%; text-align: center; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Chào '''+hoten+''', </span></p>
                                        <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">Bạn vừa đăng ký thông tin sinh viên thực tập tại</span></p>
                                        <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">Trung tâm Công nghệ thông tin - VNPT Vĩnh Long</span></p>
                                        <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">tại website: <a target="_blank" href="https://www.svtt.io.n/" rel="noopener"></a><a target="_blank" href="https://www.svtt.io.vn" rel="noopener">www.svtt.io.vn</a></span></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                        <!--[if mso]><table width="100%"><tr><td><![endif]-->
                                        <h1 style="margin: 0px; color: #0000ee; line-height: 140%; text-align: center; word-wrap: break-word; font-family: arial black,AvenirNext-Heavy,avant garde,arial; font-size: 22px; font-weight: 400;"><span style="text-decoration: underline;">'''+otp+'''</span></h1>
                                        <!--[if mso]></td></tr></table><![endif]-->

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px 60px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; line-height: 160%; text-align: center; word-wrap: break-word;">
                                        <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px; color: #e03e2d;">Mã OTP chỉ có hạn trong 5 phút</span></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #e5eaf5;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:41px 55px 18px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;">
                                        <p style="line-height: 160%;"><span style="font-size: 20px; line-height: 32px;"><strong>Liên hệ</strong></span></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif;" align="left">
                                        <div style="text-align:center;line-height:0px">
                                        <a href="https://t.me/giangisnotdev" target="_blank" style="display:inline-block;width:32px;height:32px;margin-right:17px">
                                            <amp-img src="https://cdn.tools.unlayer.com/social/icons/circle-black/telegram.png" width="32" height="32" />
                                        </a>
                                        <a href="mailto:giangpt@duck.com" target="_blank" style="display:inline-block;width:32px;height:32px;margin-right:0px">
                                            <amp-img src="https://cdn.tools.unlayer.com/social/icons/circle-black/email.png" width="32" height="32" />
                                        </a>
                                        </div>
                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #003399;">
                        <div class="u-row">

                            <div class="u-col u-col-100" style="display:flex;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <div style="width: 100%;padding:0px;">

                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                    <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                        <div style="font-size: 14px; color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights © SVTT All Rights Reserved</span></p>
                                        </div>

                                    </td>
                                    </tr>
                                </tbody>
                                </table>

                            </div>
                            </div>

                        </div>
                        </div>
                    </div>

                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    </td>
                </tr>
                </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
            </body>

            </html>
    '''

    # Tạo đối tượng MIMEMultipart để xây dựng email
    message = MIMEMultipart()
    message["From"] = email_name
    message["To"] = email
    message["Subject"] = "Xác thực OTP"

    # Gắn nội dung email dưới dạng HTML
    message.attach(MIMEText(body, "html"))

    # Kết nối đến máy chủ email (ở đây sử dụng Gmail)
    with smtplib.SMTP(email_host, email_port) as server:
        server.starttls()
        server.login(email_username, email_password)
        server.sendmail(email_username, email, message.as_string())

    return True

# Hàm để lưu thông tin mã OTP vào cơ sở dữ liệu


def save_otp_to_database(email, otp):
    try:
        # Kiểm tra xem email đã tồn tại trong bảng chưa
        cursor.execute("SELECT COUNT(*) FROM Temp_OTP WHERE Email = ?", email)
        email_count = cursor.fetchone()[0]

        if email_count > 0:
            # Nếu tồn tại, cập nhật mã OTP mới
            cursor.execute("UPDATE Temp_OTP SET OtpCode = ?, ExpiryTime = ?, IsVerified = ? WHERE Email = ?",
                           otp, datetime.now() + timedelta(minutes=5), 0, email)
        else:
            # Nếu chưa tồn tại, thêm mới
            cursor.execute("INSERT INTO Temp_OTP (Email, OtpCode, ExpiryTime, IsVerified) VALUES (?, ?, ?, ?)",
                           email, otp, datetime.now() + timedelta(minutes=5), 0)

        conn.commit()

    except Exception as e:
        print("Error:", e)


# Hàm để kiểm tra xem mã OTP có còn hạn không
def is_otp_valid(email, entered_otp):
    try:
        # Lấy thông tin về thời gian hết hạn của mã OTP
        cursor.execute(
            "SELECT ExpiryTime, IsVerified FROM Temp_OTP WHERE Email = ? AND OtpCode = ?", email, entered_otp)
        result = cursor.fetchone()
        expiry_time = result[0]
        isVerified = result[1]
        if expiry_time:
            if int(isVerified) == 0:
                # expiry_time[1] = 0 là chưa xác thực thì xác thực rồi cập nhật lại = 1
                cursor.execute("EXEC UpdateVerifiedOTP ?, ?",
                               email, entered_otp)
                cursor.commit()
                # Kiểm tra xem thời gian hiện tại có nhỏ hơn thời gian hết hạn hay không
                return datetime.now() < expiry_time
            else:
                return False
        else:
            return False

    except Exception as e:
        return False


# # Nhập email từ người dùng
# user_email = input("Nhập địa chỉ email của bạn: ")
# hoten = input(" Họ tên: ")

# # Gửi email chứa mã OTP và lưu thông tin vào cơ sở dữ liệu
# send_otp_email(user_email, hoten)

# # Nhập mã OTP từ người dùng
# entered_otp = input("Nhập mã OTP từ email: ")

# # Kiểm tra mã OTP có còn hạn không
# if is_otp_valid(user_email, entered_otp):
#     print("Mã OTP hợp lệ.")
# else:
#     print("Mã OTP không hợp lệ hoặc đã hết hạn.")

# if __name__=="__main__":
#     send_otp_email("giangpt@duck.com", "Phan Thanh Giảng")

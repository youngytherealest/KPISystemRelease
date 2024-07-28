from io import BytesIO
import io
from PyPDF2 import PdfFileReader, PdfFileWriter, PdfReader, PdfWriter
import PyPDF2
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas
from reportlab.lib import colors

import os
import textwrap

# from app.controllers.controller import query_pdf_path_from_database_controller


def vlute_xuat_danh_gia(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Đọc file PDF đầu vào
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Lấy số lượng trang của PDF
    num_pages = len(reader.pages)

    # Tải font Times New Roman hỗ trợ tiếng Việt
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Tạo một trang mới với reportlab
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 12)
    c.drawString(150, 701, data['student_fullname'])
    c.drawString(75, 685, data['student_class'])
    c.drawString(125, 670, "Trung tâm CNTT - VNPT Vĩnh Long")
    c.drawString(183, 654, data['mentor_fullname'])
    c.drawString(256, 614, data['r1_text'])
    c.drawString(195, 588, data['r2_text'])
    c.drawString(151, 560, data['r3_text'])
    c.drawString(170, 532, data['r4_text'])
    c.drawString(232, 505, data['r5_text'])
    c.drawString(225, 477, data['r6_text'])
    c.drawString(99, 433, data['r7_text'])
    c.drawString(73, 345, data['r1_number'])
    c.drawString(133, 345, data['r2_number'])
    c.drawString(193, 345, data['r3_number'])
    c.drawString(253, 345, data['r4_number'])
    c.drawString(315, 345, data['r5_number'])
    c.drawString(375, 345, data['r6_number'])
    c.drawString(435, 345, data['r7_number'])
    c.drawString(500, 345, data['r8_number'])
    c.drawString(75, 170, data['mentor_fullname'])
    c.save()

    # Đọc trang mới được tạo
    new_page = PdfReader("temp.pdf").pages[0]

    # Duyệt qua từng trang và thêm văn bản
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)

    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Ghi tệp PDF đầu ra
    with open(os.path.join(output_path, output_pdf_path), 'wb') as output_pdf:
        writer.write(output_pdf)

    return os.path.join(output_path, output_pdf_path)


def vlute_chinh_sua_danh_gia(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Read the input PDF
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Load Times New Roman font
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Create a canvas for the new content
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 12)

    # Add new content to the canvas
    textobject = c.beginText()
    textobject.setTextOrigin(50, 750)  # Starting position

    for key, value in data.items():
        textobject.textLine(f"{key}: {value}")

    c.drawText(textobject)
    c.save()

    # Read the new content page
    new_page = PdfReader("temp.pdf").pages[0]

    # Iterate through each page of the original PDF and merge with new content
    for page_num in range(len(reader.pages)):
        original_page = reader.pages[page_num]
        original_page.merge_page(new_page)
        writer.add_page(original_page)

    # Create output directory if it does not exist
    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Write to the output PDF file
    with open(os.path.join(output_path, output_pdf_path), "wb") as output_pdf_file:
        writer.write(output_pdf_file)
    return os.path.join(output_path, output_pdf_path)


def ctu_xuat_phieu_tiep_nhan(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Đọc file PDF đầu vào
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Lấy số lượng trang của PDF
    num_pages = len(reader.pages)

    # Tải font Times New Roman hỗ trợ tiếng Việt
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Tạo một trang mới với reportlab
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 15)
    c.setFillColor(colors.black)
    c.drawString(300, 759, data['ngaybatdau'])
    c.drawString(405, 759, data['ngayketthuc'])
    c.setFont("Times_New_Roman", 13)
    c.drawString(205, 665, data['nhd_hoten'])
    c.drawString(450, 665, data['nhd_sdt'])
    c.drawString(205, 647, data['nhd_email'])
    c.drawString(100, 574, data['sv_hoten'])
    c.drawString(440, 574, data['sv_mssv'])
    c.drawString(105, 556, data['sv_malop'])
    c.drawString(215, 556, data['sv_nganh'])
    c.save()

    # Đọc trang mới được tạo
    new_page = PdfReader("temp.pdf").pages[0]

    # Duyệt qua từng trang và thêm văn bản
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)

    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Ghi tệp PDF đầu ra
    with open(os.path.join(output_path, output_pdf_path), 'wb') as output_pdf:
        writer.write(output_pdf)

    return os.path.join(output_path, output_pdf_path)


def ctu_xuat_phieu_giao_viec(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Đọc file PDF đầu vào
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Lấy số lượng trang của PDF
    num_pages = len(reader.pages)

    # Tải font Times New Roman hỗ trợ tiếng Việt
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Tạo một trang mới với reportlab
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 13)
    c.setFillColor(colors.black)
    c.drawString(170, 759, data['sv_hoten'])
    c.drawString(430, 759, data['sv_mssv'])
    c.drawString(250, 713, data['ngaybatdau'])
    c.drawString(365, 713, data['ngayketthuc'])
    c.drawString(220, 729, data['nhd_hoten'])
    c.setFont("Times_New_Roman", 11)
    c.drawString(85, 627, data['tuan1_batdau'])
    c.drawString(85, 604, data['tuan1_ketthuc'])
    if (len(data['tuan1_congviec']) <= 53):
        c.drawString(150, 650, data['tuan1_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan1_congviec'], width=53)
        height = 650
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 565, data['tuan2_batdau'])
    c.drawString(85, 541, data['tuan2_ketthuc'])
    if (len(data['tuan2_congviec']) <= 53):
        c.drawString(150, 587, data['tuan2_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan2_congviec'], width=53)
        height = 587
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 500, data['tuan3_batdau'])
    c.drawString(85, 476, data['tuan3_ketthuc'])
    if (len(data['tuan3_congviec']) <= 53):
        c.drawString(150, 525, data['tuan3_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan3_congviec'], width=53)
        height = 525
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 435, data['tuan4_batdau'])
    c.drawString(85, 411, data['tuan4_ketthuc'])
    if (len(data['tuan4_congviec']) <= 53):
        c.drawString(150, 460, data['tuan4_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan4_congviec'], width=53)
        height = 460
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 371, data['tuan5_batdau'])
    c.drawString(85, 347, data['tuan5_ketthuc'])
    if (len(data['tuan5_congviec']) <= 53):
        c.drawString(150, 395, data['tuan5_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan5_congviec'], width=53)
        height = 395
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 307, data['tuan6_batdau'])
    c.drawString(85, 283, data['tuan6_ketthuc'])
    if (len(data['tuan6_congviec']) <= 53):
        c.drawString(150, 330, data['tuan6_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan6_congviec'], width=53)
        height = 330
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 245, data['tuan7_batdau'])
    c.drawString(85, 221, data['tuan7_ketthuc'])
    if (len(data['tuan7_congviec']) <= 53):
        c.drawString(150, 265, data['tuan7_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan7_congviec'], width=53)
        height = 265
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 180, data['tuan8_batdau'])
    c.drawString(85, 157, data['tuan8_ketthuc'])
    if (len(data['tuan8_congviec']) <= 53):
        c.drawString(150, 205, data['tuan8_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan8_congviec'], width=53)
        height = 205
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    # c.drawString(150, 205, data['tuan8_congviec'])
    c.drawString(245, 43, data['sv_hoten'])
    c.drawString(425, 43, data['nhd_hoten'])

    c.save()

    # Đọc trang mới được tạo
    new_page = PdfReader("temp.pdf").pages[0]

    # Duyệt qua từng trang và thêm văn bản
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)

    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Ghi tệp PDF đầu ra
    with open(os.path.join(output_path, output_pdf_path), 'wb') as output_pdf:
        writer.write(output_pdf)

    return os.path.join(output_path, output_pdf_path)


def ctu_xuat_phieu_theo_doi(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Đọc file PDF đầu vào
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Lấy số lượng trang của PDF
    num_pages = len(reader.pages)

    # Tải font Times New Roman hỗ trợ tiếng Việt
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Tạo một trang mới với reportlab
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 13)
    c.setFillColor(colors.black)
    c.drawString(190, 765, data['sv_hoten'])
    c.drawString(470, 765, data['sv_mssv'])
    c.drawString(250, 720, data['ngaybatdau'])
    c.drawString(365, 720, data['ngayketthuc'])
    c.drawString(240, 734, data['nhd_hoten'])
    c.setFont("Times_New_Roman", 11)
    c.drawString(85, 627, data['tuan1_batdau'])
    c.drawString(85, 604, data['tuan1_ketthuc'])
    if (len(data['tuan1_congviec']) <= 38):
        c.drawString(150, 650, data['tuan1_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan1_congviec'], width=38)
        height = 650
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 565, data['tuan2_batdau'])
    c.drawString(85, 541, data['tuan2_ketthuc'])
    if (len(data['tuan2_congviec']) <= 38):
        c.drawString(150, 587, data['tuan2_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan2_congviec'], width=38)
        height = 587
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 500, data['tuan3_batdau'])
    c.drawString(85, 476, data['tuan3_ketthuc'])
    if (len(data['tuan3_congviec']) <= 38):
        c.drawString(150, 525, data['tuan3_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan3_congviec'], width=38)
        height = 525
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 435, data['tuan4_batdau'])
    c.drawString(85, 411, data['tuan4_ketthuc'])
    if (len(data['tuan4_congviec']) <= 38):
        c.drawString(150, 460, data['tuan4_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan4_congviec'], width=38)
        height = 460
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 371, data['tuan5_batdau'])
    c.drawString(85, 347, data['tuan5_ketthuc'])
    if (len(data['tuan5_congviec']) <= 38):
        c.drawString(150, 395, data['tuan5_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan5_congviec'], width=38)
        height = 395
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 307, data['tuan6_batdau'])
    c.drawString(85, 283, data['tuan6_ketthuc'])
    if (len(data['tuan6_congviec']) <= 38):
        c.drawString(150, 330, data['tuan6_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan6_congviec'], width=38)
        height = 330
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 245, data['tuan7_batdau'])
    c.drawString(85, 221, data['tuan7_ketthuc'])
    if (len(data['tuan7_congviec']) <= 38):
        c.drawString(150, 265, data['tuan7_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan7_congviec'], width=38)
        height = 265
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(85, 180, data['tuan8_batdau'])
    c.drawString(85, 157, data['tuan8_ketthuc'])
    if (len(data['tuan8_congviec']) <= 38):
        c.drawString(150, 205, data['tuan8_congviec'])
    else:
        wrapped_text = textwrap.wrap(data['tuan8_congviec'], width=38)
        height = 205
        for text in wrapped_text:
            c.drawString(150, height, text)
            height -= 15
    c.drawString(425, 43, data['nhd_hoten'])
    c.save()

    # Đọc trang mới được tạo
    new_page = PdfReader("temp.pdf").pages[0]

    # Duyệt qua từng trang và thêm văn bản
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)

    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Ghi tệp PDF đầu ra
    with open(os.path.join(output_path, output_pdf_path), 'wb') as output_pdf:
        writer.write(output_pdf)

    return os.path.join(output_path, output_pdf_path)


def ctu_xuat_phieu_danh_gia(input_pdf_path: str, output_pdf_path: str, data: dict, username: str):
    # Đọc file PDF đầu vào
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Lấy số lượng trang của PDF
    num_pages = len(reader.pages)

    # Tải font Times New Roman hỗ trợ tiếng Việt
    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    # Tạo một trang mới với reportlab
    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 13)
    c.drawString(255, 725, data['nhd_hoten'])
    c.drawString(125, 707, data['nhd_sdt'])
    c.drawString(385, 707, data['nhd_email'])
    c.drawString(210, 671, data['sv_hoten'])
    c.drawString(398, 671, data['sv_mssv'])
    c.drawString(250, 653, data['ngaybatdau'])
    c.drawString(405, 653, data['ngayketthuc'])
    c.drawString(480, 590, str(data['thuchiennoiquy']))
    c.drawString(480, 568, str(data['chaphanhgiogiac']))
    c.drawString(480, 540, str(data['thaidogiaotiep']))
    c.drawString(480, 515, str(data['thaidolamviec']))
    c.drawString(480, 470, str(data['dapungyeucau']))
    c.drawString(480, 450, str(data['tinhthanhochoi']))
    c.drawString(480, 427, str(data['sangkien']))
    c.drawString(480, 385, str(data['baocaotiendo']))
    c.drawString(480, 365, str(data['hoanthanhcongviec']))
    c.drawString(480, 342, str(data['ketquadonggop']))
    c.drawString(480, 320, str(data['tong']))
    c.drawString(235, 290, data['nhanxetkhac'])
    c.drawString(58, 230, 'x' if data['phuhopthucte'] else '')
    c.drawString(203, 230, 'x' if data['khongphuhopthucte'] else '')
    c.drawString(382, 230, 'x' if data['tangcuongkynangmem'] else '')
    c.drawString(58, 215, 'x' if data['tangcuongngoaingu'] else '')
    c.drawString(203, 215, 'x' if data['tangcuongkynangnhom'] else '')
    c.drawString(265, 200, data['dexuat'])
    c.drawString(380, 20, data['nhd_hoten'])
    c.save()

    # Đọc trang mới được tạo
    new_page = PdfReader("temp.pdf").pages[0]

    # Duyệt qua từng trang và thêm văn bản
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)

    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)

    # Ghi tệp PDF đầu ra
    with open(os.path.join(output_path, output_pdf_path), 'wb') as output_pdf:
        writer.write(output_pdf)

    return os.path.join(output_path, output_pdf_path)

# if __name__=="__main__":
#     data: dict = {
#         "nhd_hoten": "Phan Thanh Giảng",
#         "sv_hoten": "Phan Thanh Giảng",
#         "sv_mssv": "B1609816",
#         "ngaybatdau": "13/05/2024",
#         "ngayketthuc": "05/07/2024",
#         "tuan1_batdau": "13/05/2024",
#         "tuan1_ketthuc": "20/05/2024",
#         "tuan1_congviec": "Đây là công việc tuần 1, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan2_batdau": "13/05/2024",
#         "tuan2_ketthuc": "20/05/2024",
#         "tuan2_congviec": "Đây là công việc tuần 2, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan3_batdau": "13/05/2024",
#         "tuan3_ketthuc": "20/05/2024",
#         "tuan3_congviec": "Đây là công việc tuần 3, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan4_batdau": "13/05/2024",
#         "tuan4_ketthuc": "20/05/2024",
#         "tuan4_congviec": "Đây là công việc tuần 4, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan5_batdau": "13/05/2024",
#         "tuan5_ketthuc": "20/05/2024",
#         "tuan5_congviec": "Đây là công việc tuần 5, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan6_batdau": "13/05/2024",
#         "tuan6_ketthuc": "20/05/2024",
#         "tuan6_congviec": "Đây là công việc tuần 6, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan7_batdau": "13/05/2024",
#         "tuan7_ketthuc": "20/05/2024",
#         "tuan7_congviec": "Đây là công việc tuần 7, đang thử nghiệm độ dài tự xuống dòng",
#         "tuan8_batdau": "13/05/2024",
#         "tuan8_ketthuc": "20/05/2024",
#         "tuan8_congviec": "Đây là công việc tuần 8, đang thử nghiệm độ dài tự xuống dòng",
#     }
#     # Đường dẫn tới file PDF đầu vào và file PDF đầu ra
#     input_pdf_path = 'pdf/phieutheodoi_ctu.pdf'
#     output_pdf_path = 'output.pdf'
#     # Thêm văn bản vào PDF
#     ctu_xuat_phieu_theo_doi(input_pdf_path, output_pdf_path, data, "giangpt")


def ctu_chinh_phieu_tiep_nhan(input_pdf_path: str, output_pdf_path: str, data: str, username: str):
    print(data)
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    num_pages = len(reader.pages)

    pdfmetrics.registerFont(TTFont('Times_New_Roman', 'times.ttf'))

    c = canvas.Canvas("temp.pdf")
    c.setFont("Times_New_Roman", 13)
    c.setFillColor(colors.white)
    c.rect(75, 400, 329, 50, stroke=0, fill=1)
    c.setFillColor(colors.black)
    c.drawString(75, 440, data)

    c.save()
    new_page = PdfReader("temp.pdf").pages[0]
    for page in reader.pages:
        page.merge_page(new_page)
        writer.add_page(page)
    output_path = os.path.join('DOCX', username)
    os.makedirs(output_path, exist_ok=True)
    output_pdf_full_path = os.path.join(output_path, output_pdf_path)
    with open(output_pdf_full_path, 'wb') as output_pdf:
        writer.write(output_pdf)
    return output_pdf_full_path

from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackContext
from app.config import telegram_token, admin_chat_id
from app.controllers.controller import *

# Hàm xử lý lệnh /reject
async def reject(update: Update, context: CallbackContext) -> None:
    # Lấy tham số từ lệnh
    if len(context.args) > 0 and context.args[0].isdigit():
        id_number = context.args[0]
        id = [id_number]
        idnxl = 1
        rs = update_yeu_cau_in_phieu_controller(id, idnxl, -1)
        if rs == 1:
            await update.message.reply_text(f"Đã từ chối phiếu số {id_number}")
        else:
            error_message = "Từ chối yêu cầu không thành công, vui lòng kiểm tra <a href='http://127.0.0.1:81/yeucauinphieu'>tại đây</a>."
            await update.message.reply_html(error_message)
    else:
        await update.message.reply_text("Vui lòng cung cấp một số nguyên hợp lệ sau lệnh /reject.")

# Hàm xử lý lệnh /approve
async def approve(update: Update, context: CallbackContext) -> None:
    # Lấy tham số từ lệnh
    if len(context.args) > 0 and context.args[0].isdigit():
        id_number = context.args[0]
        id = [id_number]
        idnxl = 1
        rs = update_yeu_cau_in_phieu_controller(id, idnxl, 1)
        if rs == 1:
            await update.message.reply_text(f"Đã phê duyệt phiếu số {id_number}")
        else:
            error_message = "Phê duyệt yêu cầu không thành công, vui lòng kiểm tra <a href='http://127.0.0.1:81/yeucauinphieu'>tại đây</a>."
            await update.message.reply_html(error_message)
    else:
        await update.message.reply_text("Vui lòng cung cấp một số nguyên hợp lệ sau lệnh /approve.")


# Hàm xử lý lệnh /status
async def status(update: Update, context: CallbackContext) -> None:
    # Lấy tham số từ lệnh
    if len(context.args) > 0 and context.args[0].isdigit():
        id_number = context.args[0]
        rs = check_trang_thai_yeu_cau_in_phieu_controller(id_number)
        if rs == 1:
            await update.message.reply_text(f"Phiếu số {id_number} có trạng thái đã được phê duyệt")
        elif rs == 0:
            await update.message.reply_text(f"Phiếu số {id_number} đang chờ phê duyệt")
        elif rs == -1:
            await update.message.reply_text(f"Phiếu số {id_number} có trạng thái bị từ chối")
        elif rs == -2:
            await update.message.reply_text(f"Không tồn tại phiếu số {id_number}")
    else:
        await update.message.reply_text("Vui lòng cung cấp một số nguyên hợp lệ sau lệnh /status.")

def telegram_bot():
    print("Launched Telegram auto reply")
    # Token của bot
    token = telegram_token  # Đảm bảo bạn đã thay 'your_token_here' bằng token thực tế

    # Khởi tạo Application
    application = Application.builder().token(token).build()

    # Thêm handler cho lệnh /reject
    application.add_handler(CommandHandler("reject", reject))

    # Thêm handler cho lệnh /approve
    application.add_handler(CommandHandler("approve", approve))
    
    # Thêm handler cho lệnh /status
    application.add_handler(CommandHandler("status", status))

    # Bắt đầu lắng nghe các sự kiện từ Telegram
    application.run_polling()


telegram_bot()
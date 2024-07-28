import os
import subprocess
import uvicorn
import atexit


def kill_telegram_process():
    os.system('taskkill /f /im python.exe')


if __name__ == '__main__':
    # # Chạy file telegram_reply.py trong một CMD mới và ngầm
    # subprocess.Popen('start /b python telegram_reply.py', shell=True)

    # # Đăng ký hàm để kill process khi kết thúc
    # atexit.register(kill_telegram_process)

    # Chạy Uvicorn server
    uvicorn.run(app='app.app:app', host='0.0.0.0', port=8000, reload=True)

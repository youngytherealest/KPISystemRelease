from dotenv import load_dotenv
from pathlib import Path
from redis import Redis

import pyodbc
import os

dotenv_path = Path('.env')
load_dotenv(dotenv_path=dotenv_path)

server = os.getenv('SQL_HOST')
database = os.getenv('SQL_DATABASE')
username = os.getenv('SQL_USERNAME')
password = os.getenv('SQL_PASSWORD')

secret_key = os.getenv('SECRET_KEY')
algorithm = os.getenv('ALGORITHM')

email_host = os.getenv('EMAIL_HOST')
email_port = os.getenv('EMAIL_PORT')
email_username = os.getenv('EMAIL_USERNAME')
email_password = os.getenv('EMAIL_PASSWORD')
email_name = os.getenv('EMAIL_NAME')

telegram_token = os.getenv('TELEGRAM_TOKEN')
admin_chat_id = os.getenv('ADMIN_CHAT_ID')

default_password = os.getenv('DEFAULT_PASSWORD')


def create_connection():
    try:
        # Sử dụng ODBC Driver
        conn = pyodbc.connect(
            f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};CHARSET=UTF8')
        return conn
    except pyodbc.Error:
        # Sử dụng FreeTDS Driver
        conn = pyodbc.connect(
            f'DRIVER={{FreeTDS}};Server={server};DATABASE={database};Port=1433;UID={username};PWD={password};')
        return conn
    finally:
        return conn

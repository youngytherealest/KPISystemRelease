import aiohttp
import json
from .config import telegram_token, admin_chat_id


async def sendMessageTelegram(message: str, chat_id: str, format: str):
    requestURI: str = f'https://api.telegram.org/bot{telegram_token}/sendMessage'
    requestHeaders = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    }
    requestBody: dict = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': format
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(requestURI, data=json.dumps(requestBody), headers=requestHeaders) as response:
                if response.status == 200:
                    return True
                else:
                    return False
    except Exception as e:
        return str(e)

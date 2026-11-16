import threading
import time

import uvicorn

from sms_simulator import app as sms_app
from main import app as api_app


def run_api():
    uvicorn.run(
        api_app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )


def run_sms():
    uvicorn.run(
        sms_app,
        host="127.0.0.1",
        port=8500,
        log_level="info"
    )


def run_telegram():
    time.sleep(2)

    import bot
    bot.main()


if __name__ == "__main__":
    print("Starting InkluBot...")
    print("AI API: http://127.0.0.1:8000")
    print("SMS simulator: http://127.0.0.1:8500")
    print("Telegram bot: starting...")

    api_thread = threading.Thread(target=run_api, daemon=True)
    sms_thread = threading.Thread(target=run_sms, daemon=True)
    telegram_thread = threading.Thread(target=run_telegram, daemon=True)

    api_thread.start()
    sms_thread.start()
    telegram_thread.start()

    try:
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping InkluBot...")
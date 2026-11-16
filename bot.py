import os
import time
import threading

import httpx
import uvicorn
from dotenv import load_dotenv

from telegram import (
    Update,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    InlineKeyboardButton,
    InlineKeyboardMarkup
)
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
    ContextTypes
)

from sms_simulator import app as sms_app
from main import app as api_app

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
API_URL = os.getenv("API_URL", "http://localhost:8000/api/ask")

LANGUAGES = {
    "English": "en",
    "አማርኛ": "am",
    "Afaan Oromoo": "om",
    "ትግርኛ": "ti",
    "Soomaali": "so",
    "Afaraf": "aa"
}

JOB_AREAS = [
    "Customer Service",
    "Data Entry",
    "Digital Marketing",
    "Sales",
    "Administrative Assistant"
]

ACCOMMODATIONS = [
    "Extra time",
    "Screen reader support",
    "Sign language interpretation",
    "Quiet interview room",
    "Written questions",
    "Remote interview"
]


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


def typing_delay():
    time.sleep(0.4)


async def ask_ai(question: str, language: str, channel: str):
    payload = {
        "question": question,
        "language": language,
        "channel": channel
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(API_URL, json=payload)

            if response.status_code == 200:
                data = response.json()
                return data.get(
                    "answer",
                    "No answer was provided."
                )

            return (
                "The AI service returned an error.\n"
                "Please try again later."
            )

    except httpx.ConnectError:
        return (
            "AI service is not connected yet.\n"
            "Please try again later."
        )

    except Exception:
        return (
            "Sorry, I could not process your request.\n"
            "Please try again later."
        )


async def start_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    typing_delay()

    await update.message.reply_text(
        "Welcome to InkluBot!\n\n"
        "I can help you find:\n"
        "• Courses\n"
        "• Jobs\n"
        "• Interview accommodations\n\n"
        "Choose your language with /language\n"
        "Enable job alerts with /alerts\n"
        "See jobs with /jobs\n"
        "Check status with /status"
    )


async def help_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    typing_delay()

    await update.message.reply_text(
        "InkluBot Commands:\n\n"
        "/start - Start the bot\n"
        "/language - Choose your language\n"
        "/courses - Ask about courses\n"
        "/jobs - Find jobs\n"
        "/alerts - Enable job alerts\n"
        "/accommodation - Request interview accommodation\n"
        "/status - Check system status\n"
        "/help - Show this help message"
    )


async def language_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    keyboard = [
        ["English", "አማርኛ"],
        ["Afaan Oromoo", "ትግርኛ"],
        ["Soomaali", "Afaraf"]
    ]

    typing_delay()

    await update.message.reply_text(
        "Choose your language:\n\nቋንቋ ይምረጡ:",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True,
            one_time_keyboard=True
        )
    )


async def courses_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    language = context.user_data.get("language", "en")

    typing_delay()
    await update.message.reply_text("Searching for courses...")

    answer = await ask_ai(
        "What courses are available?",
        language,
        "telegram"
    )

    await update.message.reply_text(answer)


async def jobs_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    keyboard = [
        ["Find jobs in Addis Ababa"],
        ["Find remote jobs"],
        ["Find training opportunities"],
        ["Request Interview Accommodation"]
    ]

    typing_delay()

    await update.message.reply_text(
        "What kind of opportunity are you looking for?",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True,
            one_time_keyboard=True
        )
    )


async def alerts_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    keyboard = [
        ["Customer Service", "Data Entry"],
        ["Digital Marketing", "Sales"],
        ["Administrative Assistant"]
    ]

    typing_delay()

    await update.message.reply_text(
        "Choose a job area to receive matching alerts:",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True,
            one_time_keyboard=True
        )
    )


async def accommodation_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    keyboard = []

    for i in range(0, len(ACCOMMODATIONS), 2):
        keyboard.append(ACCOMMODATIONS[i:i + 2])

    typing_delay()

    await update.message.reply_text(
        "What interview accommodation do you need?\n\n"
        "You do not need to disclose a disability or provide "
        "medical proof.",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True,
            one_time_keyboard=True
        )
    )


async def status_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    api_status = "Waiting for connection"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.post(
                API_URL,
                json={
                    "question": "status",
                    "language": "en",
                    "channel": "telegram"
                }
            )

            if response.status_code == 200:
                api_status = "Connected"

    except Exception:
        api_status = "Waiting for connection"

    typing_delay()

    await update.message.reply_text(
        "InkluBot is online.\n\n"
        "Telegram channel: Ready\n"
        "SMS simulator: Ready\n"
        f"AI service: {api_status}"
    )


async def handle_language_choice(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    choice = update.message.text

    if choice in LANGUAGES:
        context.user_data["language"] = LANGUAGES[choice]
        context.user_data["language_name"] = choice

        typing_delay()

        await update.message.reply_text(
            f"Language selected: {choice}\n\n"
            "Now ask about courses or jobs.",
            reply_markup=ReplyKeyboardRemove()
        )

    else:
        await update.message.reply_text(
            "Please choose a language using the buttons."
        )


async def handle_accommodation_choice(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    choice = update.message.text

    if choice in ACCOMMODATIONS:
        typing_delay()

        await update.message.reply_text(
            f"Accommodation requested: {choice}\n\n"
            "InkluBot will include this request in your "
            "interview preparation."
        )


async def handle_job_choice(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    choice = update.message.text
    language = context.user_data.get("language", "en")

    if choice == "Find jobs in Addis Ababa":
        typing_delay()
        await update.message.reply_text(
            "Searching for jobs in Addis Ababa..."
        )

        answer = await ask_ai(
            "Find me a job in Addis Ababa",
            language,
            "telegram"
        )

        await update.message.reply_text(answer)

    elif choice == "Find remote jobs":
        typing_delay()
        await update.message.reply_text(
            "Searching for remote jobs..."
        )

        answer = await ask_ai(
            "Find remote jobs",
            language,
            "telegram"
        )

        await update.message.reply_text(answer)

    elif choice == "Find training opportunities":
        typing_delay()
        await update.message.reply_text(
            "Searching for training opportunities..."
        )

        answer = await ask_ai(
            "Find training opportunities",
            language,
            "telegram"
        )

        await update.message.reply_text(answer)

    elif choice == "Request Interview Accommodation":
        await accommodation_command(update, context)


async def handle_alert_choice(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    choice = update.message.text

    if choice in JOB_AREAS:
        inline_keyboard = [
            [
                InlineKeyboardButton(
                    "Request Interview Accommodation",
                    callback_data="request_accommodation"
                )
            ]
        ]

        typing_delay()

        await update.message.reply_text(
            f"Job alerts enabled for: {choice}\n\n"
            "You will receive matching opportunities when available.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard)
        )


async def handle_accommodation_button(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    query = update.callback_query
    await query.answer()

    await query.edit_message_text(
        "Interview accommodation request started.\n\n"
        "Choose the support you need. You do not need to disclose "
        "a disability or provide medical proof."
    )


async def handle_voice(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    voice = update.message.voice

    if voice:
        typing_delay()

        await update.message.reply_text(
            "I received your voice note.\n\n"
            "For this demo, please type your question as text.\n"
            "Voice-note transcription will be added in the next version."
        )


async def handle_message(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    text = update.message.text
    language = context.user_data.get("language", "en")

    if text in LANGUAGES:
        selected = context.user_data.get("language_name")

        if selected == text:
            typing_delay()
            await update.message.reply_text(
                f"{text} is already selected.\n\n"
                "Now ask about courses or jobs."
            )
        else:
            await handle_language_choice(update, context)

        return

    if text in ACCOMMODATIONS:
        await handle_accommodation_choice(update, context)
        return

    if text in JOB_AREAS:
        await handle_alert_choice(update, context)
        return

    if text in [
        "Find jobs in Addis Ababa",
        "Find remote jobs",
        "Find training opportunities",
        "Request Interview Accommodation"
    ]:
        await handle_job_choice(update, context)
        return

    typing_delay()
    await update.message.reply_text("Searching...")

    answer = await ask_ai(
        text,
        language,
        "telegram"
    )

    await update.message.reply_text(answer)


def main():
    api_thread = threading.Thread(target=run_api, daemon=True)
    sms_thread = threading.Thread(target=run_sms, daemon=True)

    api_thread.start()
    sms_thread.start()

    time.sleep(2)

    application = Application.builder().token(
        TELEGRAM_TOKEN
    ).build()

    application.add_handler(
        CommandHandler("start", start_command)
    )
    application.add_handler(
        CommandHandler("help", help_command)
    )
    application.add_handler(
        CommandHandler("language", language_command)
    )
    application.add_handler(
        CommandHandler("courses", courses_command)
    )
    application.add_handler(
        CommandHandler("jobs", jobs_command)
    )
    application.add_handler(
        CommandHandler("alerts", alerts_command)
    )
    application.add_handler(
        CommandHandler(
            "accommodation",
            accommodation_command
        )
    )
    application.add_handler(
        CommandHandler("status", status_command)
    )

    application.add_handler(
        CallbackQueryHandler(
            handle_accommodation_button,
            pattern="^request_accommodation$"
        )
    )

    application.add_handler(
        MessageHandler(filters.VOICE, handle_voice)
    )

    application.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_message
        )
    )

    print("InkluBot is running. Press Ctrl+C to stop.")
    print("AI API: http://127.0.0.1:8000")
    print("SMS simulator: http://127.0.0.1:8500")

    application.run_polling()


if __name__ == "__main__":
    main()
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
import httpx
import uvicorn


app = FastAPI()


API_URL = "http://127.0.0.1:8000/api/ask"


LANGUAGES = {
    "English": "en",
    "አማርኛ": "am",
    "Afaan Oromoo": "om",
    "ትግርኛ": "ti",
    "Soomaali": "so",
    "Afaraf": "aa"
}


async def ask_ai(message: str, language: str):
    payload = {
        "question": message,
        "language": language,
        "channel": "sms"
    }

    try:
        async with httpx.AsyncClient(timeout=5) as client:
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

    except httpx.ReadTimeout:
        return (
            "The AI service is taking too long to respond.\n"
            "Please try again in a moment."
        )

    except httpx.ConnectError:
        return (
            "AI service is not connected yet.\n"
            "SMS channel is ready. Please try again later."
        )

    except Exception as error:
        import traceback
        error_details = traceback.format_exc()

        return (
            "Sorry, I could not process your request.\n"
            f"Error type: {type(error).__name__}\n"
            f"Error details:\n{error_details}"
        )


@app.get("/", response_class=HTMLResponse)
async def home():
    language_options = ""

    for language_name in LANGUAGES:
        language_options += (
            f'<option value="{LANGUAGES[language_name]}">'
            f'{language_name}</option>'
        )

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>InkluBot SMS Simulator</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background: #f4f6f8;
                padding: 30px;
            }}

            .box {{
                max-width: 500px;
                margin: auto;
                background: white;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}

            h1 {{
                color: #1a73e8;
            }}

            select,
            textarea {{
                width: 100%;
                padding: 12px;
                margin-top: 10px;
                border: 1px solid #ccc;
                border-radius: 8px;
            }}

            button {{
                margin-top: 12px;
                padding: 12px 20px;
                background: #1a73e8;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>InkluBot SMS Simulator</h1>

            <p>
                Low-bandwidth SMS interface for courses, jobs,
                and interview accommodations.
            </p>

            <form method="post" action="/send">
                <label for="language">Choose language:</label>
                <select name="language" id="language">
                    {language_options}
                </select>

                <textarea
                    name="message"
                    rows="3"
                    placeholder="Type your SMS message"
                ></textarea>

                <br>
                <button type="submit">Send SMS</button>
            </form>
        </div>
    </body>
    </html>
    """


@app.post("/send", response_class=HTMLResponse)
async def send_sms(
    message: str = Form(""),
    language: str = Form("en")
):
    if not message.strip():
        reply = "Please type a message before sending."
    else:
        reply = await ask_ai(message, language)

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>InkluBot SMS Simulator</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background: #f4f6f8;
                padding: 30px;
            }}

            .box {{
                max-width: 500px;
                margin: auto;
                background: white;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}

            h1 {{
                color: #1a73e8;
            }}

            .sent {{
                margin-top: 20px;
                padding: 15px;
                background: #f1f1f1;
                border-radius: 8px;
                white-space: pre-wrap;
            }}

            .reply {{
                margin-top: 10px;
                padding: 15px;
                background: #eef4ff;
                border-radius: 8px;
                white-space: pre-wrap;
            }}

            a {{
                display: inline-block;
                margin-top: 20px;
                color: #1a73e8;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>InkluBot SMS Simulator</h1>

            <div class="sent">
                <strong>You sent:</strong><br>
                {message}
            </div>

            <div class="reply">
                <strong>InkluBot reply:</strong><br>
                {reply}
            </div>

            <a href="/">Send another SMS</a>
        </div>
    </body>
    </html>
    """


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8500)
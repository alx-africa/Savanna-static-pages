# InkluBot

InkluBot is an inclusive AI assistant that helps users find training courses, job opportunities, and interview accommodations through a simple SMS-style interface.

It supports multiple languages, including English, Amharic, Afaan Oromoo, Tigrinya, Somali, and Afaraf.

## Features

- Course information
- Job opportunities in Addis Ababa
- Interview accommodation support
- Multilingual responses
- SMS-style web interface
- FastAPI backend
- API documentation
- Error handling for connection and timeout issues

## Technologies

- Python
- FastAPI
- Uvicorn
- HTTPX
- HTML
- CSS
- Git
- GitHub

## How to Run

1. Open the project folder:

```cmd
cd D:\Savanna-static-pages
```

2. Install requirements:

```cmd
pip install -r requirements.txt
```

3. Start the application:

```cmd
python bot.py
```

4. Open the SMS simulator:

```text
http://127.0.0.1:8500
```

5. Open the API documentation:

```text
http://127.0.0.1:8000/docs
```

## How to Use

Choose a language, type a message, and click **Send SMS**.

Example:

```text
Find me a job in Addis Ababa
```

InkluBot will reply with job opportunities.

## API Test

Open:

```text
http://127.0.0.1:8000/docs
```

Use `POST /api/ask` and send:

```json
{
  "question": "Find me a job in Addis Ababa",
  "language": "en",
  "channel": "sms"
}
```

## Security

Do not commit `.env` files or API tokens. Store secrets locally in `.env` and add `.env` to `.gitignore`.

## Author

Barok Mengistu
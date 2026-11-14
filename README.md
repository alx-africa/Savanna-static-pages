# InkluBot

InkluBot is an inclusive AI assistant that helps users find training courses, job opportunities, and interview accommodations through a simple SMS-style interface.

It is designed to support users in multiple languages, including English, Amharic, Afaan Oromoo, Tigrinya, Somali, and Afaraf.

## Project Purpose

InkluBot was created to make career and learning support easier to access for people who may have limited internet access, low digital literacy, or accessibility needs.

The project provides:

- Course information
- Job opportunity information in Addis Ababa
- Interview accommodation options
- Multilingual support
- A low-bandwidth SMS simulator

## Features

- Multilingual chat support
- Course recommendations
- Job opportunity search
- Interview accommodation information
- SMS-style web interface
- FastAPI backend
- Interactive API documentation
- Simple and accessible user interface

## Technologies Used

- Python
- FastAPI
- Uvicorn
- HTTPX
- HTML
- CSS
- Git
- GitHub

## Project Structure

```text
accss/
│
├── main.py
├── bot.py
├── sms_simulator.py
├── requirements.txt
└── README.md
```

## How to Run the Project

1. Open the project folder:

```cmd
cd D:\accss
```

2. Install the required packages:

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

## How to Use InkluBot

1. Open the SMS simulator.
2. Choose your preferred language.
3. Type a message.
4. Click **Send SMS**.
5. InkluBot will reply with helpful information.

Example messages:

```text
Find me a job in Addis Ababa
```

```text
What courses are available?
```

```text
I need interview accommodation
```

## API Test Example

Open:

```text
http://127.0.0.1:8000/docs
```

Use the `POST /api/ask` endpoint and send:

```json
{
  "question": "Find me a job in Addis Ababa",
  "language": "en",
  "channel": "sms"
}
```

Example response:

```json
{
  "answer": "Job opportunities in Addis Ababa include:\n-  Customer Service Representative\n-  Data Entry Clerk\n-  Sales Assistant\n-  Administrative Assistant\n-  Digital Marketing Assistant\n\nWould you like job listings, training, or interview tips?",
  "language": "en",
  "channel": "sms"
}
```

## What I Did

I built InkluBot as an inclusive AI assistant for career and learning support.

I created a FastAPI backend that handles user questions and returns answers based on the selected language and topic.

I added support for courses, jobs in Addis Ababa, and interview accommodations.

I created a multilingual system for English, Amharic, Afaan Oromoo, Tigrinya, Somali, and Afaraf.

I built an SMS simulator using FastAPI and HTML so users can test the service through a simple low-bandwidth interface.

I connected the SMS simulator to the AI API using HTTPX.

I added error handling for connection errors and response timeouts.

I tested the API using FastAPI’s interactive documentation and tested the SMS interface through the browser.

I fixed an API timeout issue by ensuring only one API service runs on port 8000 and by improving error handling in the SMS simulator.

## Challenges I Faced

At first, the SMS simulator showed a `ReadTimeout` error because the API did not return a response within the expected time.

I fixed this by checking port 8000, stopping duplicate API processes, and ensuring that only `bot.py` starts the API service.

I also improved the SMS simulator by adding clear error messages for connection failures and slow API responses.

## Future Improvements

- Connect InkluBot to a real SMS provider
- Add real job listings from Ethiopian job platforms
- Add course enrollment links
- Improve AI responses using a larger language model
- Add user profiles and saved preferences
- Add voice support for users with low literacy
- Add more accessibility features

## Author

Barok Mengistu

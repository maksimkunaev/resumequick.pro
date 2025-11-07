import os
import smtplib
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

def send_feedback_email(feedback: dict) -> tuple[bool, str]:
    """
    Send a feedback. 
    feedback = {
        "rating": int,
        "type": str,
        "message": str,
        "email": str (optional)
    }
    """
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USERNAME = os.getenv("GMAIL_USERNAME")
    SMTP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
    TO_EMAIL = os.getenv("FEEDBACK_EMAIL_TO")
    FROM_EMAIL = SMTP_USERNAME

    if not all([SMTP_USERNAME, SMTP_PASSWORD, TO_EMAIL]):
        return False, "Missing email configuration"

    now = datetime.utcnow().isoformat()
    subject = f"New Feedback - Rating: {feedback.get('rating', 'N/A')}"
    body = f"""
New feedback received:

Type: {feedback.get('type')}
Rating: {feedback.get('rating')}
Message: {feedback.get('message')}
Email: {feedback.get('email', 'Not provided')}
Timestamp: {now}
"""

    try:
        message = MIMEMultipart()
        message["From"] = FROM_EMAIL
        message["To"] = TO_EMAIL
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)

        logging.info("Feedback email sent successfully.")
        return True, "Email sent successfully"
    except Exception as e:
        logging.error(f"Email send error: {e}")
        return False, str(e)


# Optional: для теста
if __name__ == "__main__":
    success, msg = send_feedback_email({
        "rating": 5,
        "type": "UI Suggestion",
        "message": "Make the submit button bigger",
        "email": "user@example.com"
    })
    print("Success:", success, "| Message:", msg)


# Optional: Save feedback to Firebase for analytics

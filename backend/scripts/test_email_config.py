import asyncio
import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

# Load environment variables
load_dotenv()

async def test_email():
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    USE_CREDENTIALS = os.getenv("USE_CREDENTIALS", "False").lower() == "true"

    print(f"SMTP Configuration:")
    print(f"  Server: {MAIL_SERVER}:{MAIL_PORT}")
    print(f"  Username: {MAIL_USERNAME}")
    print(f"  From: {MAIL_FROM}")
    print(f"  StartTLS: {MAIL_STARTTLS}")
    print(f"  SSL/TLS: {MAIL_SSL_TLS}")
    print(f"  Use Credentials: {USE_CREDENTIALS}")
    print(f"  Password Length: {len(MAIL_PASSWORD) if MAIL_PASSWORD else 0}")

    conf = ConnectionConfig(
        MAIL_USERNAME=MAIL_USERNAME,
        MAIL_PASSWORD=MAIL_PASSWORD,
        MAIL_FROM=MAIL_FROM,
        MAIL_PORT=MAIL_PORT,
        MAIL_SERVER=MAIL_SERVER,
        MAIL_STARTTLS=MAIL_STARTTLS,
        MAIL_SSL_TLS=MAIL_SSL_TLS,
        USE_CREDENTIALS=USE_CREDENTIALS,
        VALIDATE_CERTS=False,
    )

    message = MessageSchema(
        subject="LegalOpsAI SMTP Test Email",
        recipients=[MAIL_USERNAME],  # Send it to yourself
        body="If you receive this email, your SMTP configuration is correct!",
        subtype=MessageType.plain
    )

    fm = FastMail(conf)
    try:
        print("\nAttempting to send email...")
        await fm.send_message(message)
        print("Success! Email sent successfully.")
    except Exception as e:
        print(f"\nFailed to send email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_email())

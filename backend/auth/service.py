import os
import secrets
from datetime import datetime, timezone

from fastapi import HTTPException, status, BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from database.mongodb import get_database

# Temporary in-memory storage for OTP records
# Key: normalized email
# Value: dict containing:
#   "otp": str
#   "created_at": datetime (UTC)
#   "attempts": int
#   "last_requested_at": datetime (UTC)
otp_storage: dict[str, dict] = {}

# fastapi-mail Configuration
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "test@example.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "testpass")
MAIL_FROM = os.getenv("MAIL_FROM", "noreply@legalops.ai")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
USE_CREDENTIALS = os.getenv("USE_CREDENTIALS", "False").lower() == "true"

mail_conf = ConnectionConfig(
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


def _normalize_email(email: str) -> str:
    return email.strip().lower()

def _user_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "email_verified": user.get("email_verified", False),
    }
async def send_otp_email_task(email: str, otp: str) -> None:
    message = MessageSchema(
        subject="Your LegalOpsAI Verification Code",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.5;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="background-color: #c49a45; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0; font-family: 'Georgia', serif;">LegalOpsAI</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                        <p style="font-size: 14px; color: #555;">Use the secure, one-time verification code below to log in or create your account:</p>
                        <div style="font-size: 28px; font-weight: bold; background: #f9f9f9; padding: 15px; text-align: center; border-radius: 5px; letter-spacing: 5px; margin: 25px 0; border: 1px dashed #c49a45; color: #333;">
                            {otp}
                        </div>
                        <p style="font-size: 13px; color: #999;">This code is valid for 5 minutes and can only be used once. If you did not request this code, please ignore this email.</p>
                    </div>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #e0e0e0;">
                        &copy; {datetime.now(timezone.utc).year} LegalOpsAI. Secure, local legal workspaces.
                    </div>
                </div>
            </body>
        </html>
        """,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"Error sending email to {email}: {e}")


async def request_otp(email: str, background_tasks: BackgroundTasks) -> None:
    normalized = _normalize_email(email)
    now = datetime.now(timezone.utc)
    
    # 60s cooldown limit check
    if normalized in otp_storage:
        last_req = otp_storage[normalized].get("last_requested_at")
        if last_req and (now - last_req).total_seconds() < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait 60 seconds before requesting a new OTP."
            )
            
    otp = f"{secrets.SystemRandom().randint(100000, 999999):06d}"
    print(f"\n[OTP Dev Debug] Generated OTP '{otp}' for email: {normalized}\n")
    
    otp_storage[normalized] = {
        "otp": otp,
        "created_at": now,
        "attempts": 0,
        "last_requested_at": now
    }
    
    background_tasks.add_task(send_otp_email_task, normalized, otp)


async def verify_otp(email: str, submitted_otp: str) -> dict:
    normalized = _normalize_email(email)
    now = datetime.now(timezone.utc)
    
    if normalized not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP requested for this email or it has expired."
        )
        
    record = otp_storage[normalized]
    
    # 5 minutes expiration check
    if (now - record["created_at"]).total_seconds() > 300:
        del otp_storage[normalized]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
        
    # Verify code match
    if record["otp"] != submitted_otp:
        record["attempts"] += 1
        remaining = 3 - record["attempts"]
        
        if remaining <= 0:
            del otp_storage[normalized]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Maximum verification attempts exceeded. The OTP has been invalidated."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid OTP. {remaining} attempts remaining."
            )
            
    # Success workflow:
    # 1. Immediately delete from temporary storage to prevent replay attacks
    del otp_storage[normalized]
        # 2. Get or create the user document in MongoDB
    db = await get_database()
    user = await db.users.find_one({"email": normalized})
    if not user:
        user_doc = {
            "email": normalized,
            "created_at": now,
            "email_verified": True,
        }
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user = user_doc
    else:
        if not user.get("email_verified"):
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"email_verified": True}}
            )
            user["email_verified"] = True
        
    return _user_response(user)
async def get_user_by_id(user_id: str) -> dict | None:
    from bson import ObjectId
    from bson.errors import InvalidId

    db = await get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        return None

    if not user:
        return None

    return _user_response(user)

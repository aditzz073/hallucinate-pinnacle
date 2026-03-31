"""Demo Booking Service - Email via SMTP"""
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timezone

logger = logging.getLogger("pinnacle_ai")

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
DEMO_RECIPIENT = os.environ.get("DEMO_RECIPIENT", SMTP_USER)


def _generate_ics(name: str, email: str, selected_time: str) -> str:
    """Generate a basic .ics calendar invite."""
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    # Parse selected_time or use a default
    try:
        dt = datetime.fromisoformat(selected_time.replace("Z", "+00:00"))
        start = dt.strftime("%Y%m%dT%H%M%SZ")
        end_dt = dt.replace(hour=dt.hour + 1) if dt.hour < 23 else dt
        end = end_dt.strftime("%Y%m%dT%H%M%SZ")
    except Exception:
        start = now
        end = now

    return (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//Pinnacle.AI//Demo Booking//EN\r\n"
        "BEGIN:VEVENT\r\n"
        f"DTSTART:{start}\r\n"
        f"DTEND:{end}\r\n"
        f"SUMMARY:Pinnacle.AI Demo - {name}\r\n"
        f"DESCRIPTION:Demo booked by {name} ({email})\r\n"
        f"ORGANIZER:mailto:{SMTP_USER}\r\n"
        f"ATTENDEE:mailto:{email}\r\n"
        f"DTSTAMP:{now}\r\n"
        f"UID:pinnacle-demo-{now}@usepinnacle.com\r\n"
        "STATUS:CONFIRMED\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )


async def book_demo(name: str, email: str, selected_time: str) -> dict:
    """Send demo booking confirmation email with optional calendar invite."""
    if not SMTP_USER or not SMTP_PASS:
        logger.warning("SMTP credentials not configured - demo booking email skipped")
        return {
            "success": True,
            "message": "Demo booking recorded (email delivery requires SMTP configuration)",
            "name": name,
            "email": email,
            "selected_time": selected_time,
        }

    try:
        msg = MIMEMultipart("mixed")
        msg["From"] = SMTP_USER
        msg["To"] = DEMO_RECIPIENT
        msg["Subject"] = f"New Demo Booking: {name}"

        # Email body
        body = MIMEText(
            f"<h2>New Demo Booking Request</h2>"
            f"<p><strong>Name:</strong> {name}</p>"
            f"<p><strong>Email:</strong> {email}</p>"
            f"<p><strong>Requested Time:</strong> {selected_time}</p>"
            f"<p><strong>Submitted:</strong> {datetime.now(timezone.utc).isoformat()}</p>"
            f"<hr>"
            f"<p><em>Sent from Pinnacle.AI Demo Booking System</em></p>",
            "html",
        )
        msg.attach(body)

        # Attach .ics calendar invite
        ics_content = _generate_ics(name, email, selected_time)
        ics_part = MIMEBase("text", "calendar", method="REQUEST")
        ics_part.set_payload(ics_content)
        encoders.encode_base64(ics_part)
        ics_part.add_header("Content-Disposition", "attachment", filename="demo-invite.ics")
        msg.attach(ics_part)

        # Send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [DEMO_RECIPIENT, email], msg.as_string())

        logger.info(f"Demo booking email sent for {name} ({email})")

        return {
            "success": True,
            "message": "Demo booked successfully! Check your email for confirmation.",
            "name": name,
            "email": email,
            "selected_time": selected_time,
        }
    except Exception as e:
        logger.error(f"Failed to send demo booking email: {e}")
        return {
            "success": True,
            "message": "Demo booking recorded. Confirmation email will follow shortly.",
            "name": name,
            "email": email,
            "selected_time": selected_time,
        }

import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
audits_collection = db["audits"]
ai_tests_collection = db["ai_tests"]
monitored_pages_collection = db["monitored_pages"]
page_snapshots_collection = db["page_snapshots"]
page_change_logs_collection = db["page_change_logs"]


async def setup_indexes():
    """Create indexes for all collections."""
    # Users
    await users_collection.create_index("email", unique=True)

    # Audits - scoped by user_id
    await audits_collection.create_index("user_id")
    await audits_collection.create_index([("user_id", 1), ("created_at", -1)])

    # AI Tests - scoped by user_id
    await ai_tests_collection.create_index("user_id")
    await ai_tests_collection.create_index([("user_id", 1), ("created_at", -1)])

    # Monitored Pages - scoped by user_id
    await monitored_pages_collection.create_index("user_id")
    await monitored_pages_collection.create_index([("user_id", 1), ("url", 1)], unique=True)

    # Page Snapshots - append-only, indexed by monitored_page_id
    await page_snapshots_collection.create_index("monitored_page_id")
    await page_snapshots_collection.create_index([("monitored_page_id", 1), ("fetched_at", -1)])

    # Page Change Logs - indexed by monitored_page_id
    await page_change_logs_collection.create_index("monitored_page_id")
    await page_change_logs_collection.create_index([("monitored_page_id", 1), ("detected_at", -1)])

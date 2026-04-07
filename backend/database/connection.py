import motor.motor_asyncio
import os
import logging
import certifi
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("pinnacle_ai")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

client_kwargs = {"serverSelectionTimeoutMS": 5000}
if MONGO_URL and MONGO_URL.startswith("mongodb+srv://"):
    # Atlas/SRV deployments require TLS; local mongodb:// should not force TLS.
    client_kwargs["tlsCAFile"] = certifi.where()

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL, **client_kwargs)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
audits_collection = db["audits"]
ai_tests_collection = db["ai_tests"]
monitored_pages_collection = db["monitored_pages"]
page_snapshots_collection = db["page_snapshots"]
page_change_logs_collection = db["page_change_logs"]


async def setup_indexes() -> bool:
    """Create indexes for all collections.

    Returns True when index creation succeeded, False when DB is unreachable.
    """
    try:
        # Users
        await users_collection.create_index("email", unique=True)
        # Normalize legacy empty string IDs so partial unique index remains valid.
        await users_collection.update_many(
            {"stripeCustomerId": ""},
            {"$set": {"stripeCustomerId": None}},
        )

        desired_partial_filter = {
            "stripeCustomerId": {
                "$type": "string",
            }
        }

        # Migrate any legacy index to partial unique index so null/missing IDs never conflict.
        user_indexes = await users_collection.index_information()
        for index_name, index_meta in user_indexes.items():
            if index_name == "_id_":
                continue
            if index_meta.get("key") == [("stripeCustomerId", 1)]:
                is_desired = (
                    bool(index_meta.get("unique"))
                    and index_meta.get("partialFilterExpression") == desired_partial_filter
                )
                if not is_desired:
                    await users_collection.drop_index(index_name)

        await users_collection.create_index(
            "stripeCustomerId",
            unique=True,
            partialFilterExpression=desired_partial_filter,
        )

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

        return True
    except Exception as e:
        logger.warning("Could not create MongoDB indexes at startup: %s", e)
        return False

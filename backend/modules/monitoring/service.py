"""Monitoring Service - Phase 3"""
from datetime import datetime, timezone
from bson import ObjectId

from database.connection import (
    monitored_pages_collection,
    page_snapshots_collection,
    page_change_logs_collection,
)
from modules.aeoEngine.html_fetcher import fetch_html
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.monitoring.change_detector import detect_changes


async def add_monitored_page(url: str, user_id: str) -> dict:
    # Check if already monitored
    existing = await monitored_pages_collection.find_one(
        {"user_id": user_id, "url": url}
    )
    if existing:
        raise ValueError("This URL is already being monitored")

    now = datetime.now(timezone.utc).isoformat()
    doc = {"user_id": user_id, "url": url, "created_at": now}
    result = await monitored_pages_collection.insert_one(doc)
    page_id = str(result.inserted_id)

    # Take initial snapshot
    snapshot = await _take_snapshot(page_id, url)

    return {
        "id": page_id,
        "url": url,
        "created_at": now,
        "initial_snapshot": snapshot,
    }


async def _take_snapshot(monitored_page_id: str, url: str) -> dict:
    """Fetch page and store signals as append-only snapshot."""
    html = await fetch_html(url)
    parsed = parse_html(html, url)
    page_type = classify_page(parsed)
    signals = build_signals(parsed, page_type)

    now = datetime.now(timezone.utc).isoformat()
    snapshot_doc = {
        "monitored_page_id": monitored_page_id,
        "signals_json": signals,
        "page_type": page_type,
        "fetched_at": now,
    }
    result = await page_snapshots_collection.insert_one(snapshot_doc)

    return {
        "id": str(result.inserted_id),
        "monitored_page_id": monitored_page_id,
        "signals": signals,
        "page_type": page_type,
        "fetched_at": now,
    }


async def refresh_snapshot(monitored_page_id: str, user_id: str) -> dict:
    """Take a new snapshot and compare with previous."""
    # Verify ownership
    page = await monitored_pages_collection.find_one(
        {"_id": ObjectId(monitored_page_id), "user_id": user_id}
    )
    if not page:
        raise ValueError("Monitored page not found")

    url = page["url"]

    # Get previous snapshot
    prev_snapshot = await page_snapshots_collection.find_one(
        {"monitored_page_id": monitored_page_id},
        sort=[("fetched_at", -1)],
    )

    # Take new snapshot
    new_snapshot = await _take_snapshot(monitored_page_id, url)

    # Compare if we have a previous snapshot
    changes = []
    if prev_snapshot:
        prev_signals = prev_snapshot.get("signals_json", {})
        curr_signals = new_snapshot.get("signals", {})
        changes = detect_changes(prev_signals, curr_signals)

        # Save change logs
        now = datetime.now(timezone.utc).isoformat()
        for change in changes:
            change_doc = {
                "monitored_page_id": monitored_page_id,
                "signal_name": change["signal_name"],
                "previous_value": change["previous_value"],
                "current_value": change["current_value"],
                "impact": change["impact"],
                "detected_at": now,
            }
            await page_change_logs_collection.insert_one(change_doc)

    return {
        "snapshot": new_snapshot,
        "changes": changes,
        "changes_count": len(changes),
    }


async def get_monitored_pages(user_id: str) -> list:
    cursor = monitored_pages_collection.find(
        {"user_id": user_id},
    ).sort("created_at", -1)
    pages = await cursor.to_list(length=100)

    result = []
    for page in pages:
        page_id = str(page["_id"])
        # Get latest snapshot
        latest = await page_snapshots_collection.find_one(
            {"monitored_page_id": page_id},
            sort=[("fetched_at", -1)],
        )
        # Get change count
        change_count = await page_change_logs_collection.count_documents(
            {"monitored_page_id": page_id}
        )
        result.append({
            "id": page_id,
            "url": page["url"],
            "created_at": page["created_at"],
            "last_snapshot_at": latest["fetched_at"] if latest else None,
            "total_changes": change_count,
        })

    return result


async def get_page_snapshots(monitored_page_id: str, user_id: str, limit: int = 20) -> list:
    # Verify ownership
    page = await monitored_pages_collection.find_one(
        {"_id": ObjectId(monitored_page_id), "user_id": user_id}
    )
    if not page:
        raise ValueError("Monitored page not found")

    cursor = page_snapshots_collection.find(
        {"monitored_page_id": monitored_page_id},
        {"_id": 0, "monitored_page_id": 0},
    ).sort("fetched_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_page_change_logs(monitored_page_id: str, user_id: str, limit: int = 50) -> list:
    # Verify ownership
    page = await monitored_pages_collection.find_one(
        {"_id": ObjectId(monitored_page_id), "user_id": user_id}
    )
    if not page:
        raise ValueError("Monitored page not found")

    cursor = page_change_logs_collection.find(
        {"monitored_page_id": monitored_page_id},
        {"_id": 0, "monitored_page_id": 0},
    ).sort("detected_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def delete_monitored_page(monitored_page_id: str, user_id: str) -> bool:
    result = await monitored_pages_collection.delete_one(
        {"_id": ObjectId(monitored_page_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise ValueError("Monitored page not found")
    # Clean up snapshots and change logs
    await page_snapshots_collection.delete_many({"monitored_page_id": monitored_page_id})
    await page_change_logs_collection.delete_many({"monitored_page_id": monitored_page_id})
    return True

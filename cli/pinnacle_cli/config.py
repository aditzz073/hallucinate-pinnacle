import os
import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".pinnacle"
CONFIG_FILE = CONFIG_DIR / "config.json"

def get_config():
    if not CONFIG_FILE.exists():
        return {}
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_config(config):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)

def get_api_key():
    return get_config().get("api_key")

def set_api_key(api_key: str):
    config = get_config()
    config["api_key"] = api_key
    save_config(config)

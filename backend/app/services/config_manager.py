from __future__ import annotations

import logging
import shutil
from pathlib import Path

import yaml

from app.config import CONFIG_FILE, DEFAULT_CONFIG_FILE
from app.models import AppConfig

logger = logging.getLogger(__name__)

_cached_config: AppConfig | None = None
BACKUP_FILE = CONFIG_FILE.parent / "config.backup.yml"


def _ensure_config_file() -> Path:
    if CONFIG_FILE.exists():
        return CONFIG_FILE
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    if DEFAULT_CONFIG_FILE.exists():
        CONFIG_FILE.write_text(DEFAULT_CONFIG_FILE.read_text())
    else:
        save_config(AppConfig())
    return CONFIG_FILE


def load_config() -> AppConfig:
    global _cached_config
    path = _ensure_config_file()
    try:
        raw = yaml.safe_load(path.read_text()) or {}
        _cached_config = AppConfig(**raw)
    except Exception as e:
        logger.error("Failed to load config: %s, using defaults", e)
        _cached_config = AppConfig()
    return _cached_config


def _create_backup() -> None:
    """Create a backup of the current config before saving."""
    if CONFIG_FILE.exists():
        try:
            shutil.copy2(CONFIG_FILE, BACKUP_FILE)
        except Exception as e:
            logger.warning("Failed to create backup: %s", e)


def save_config(config: AppConfig) -> None:
    global _cached_config
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    _create_backup()
    data = config.model_dump(mode="json")
    CONFIG_FILE.write_text(yaml.dump(data, default_flow_style=False, allow_unicode=True))
    _cached_config = config


def restore_backup() -> AppConfig | None:
    """Restore config from backup file."""
    if not BACKUP_FILE.exists():
        return None
    try:
        raw = yaml.safe_load(BACKUP_FILE.read_text()) or {}
        config = AppConfig(**raw)
        save_config(config)
        return config
    except Exception as e:
        logger.error("Failed to restore backup: %s", e)
        return None


def has_backup() -> bool:
    return BACKUP_FILE.exists()


def validate_yaml(yaml_str: str) -> tuple[bool, str, dict | None]:
    """Validate a YAML string as AppConfig. Returns (valid, error_msg, diff)."""
    try:
        data = yaml.safe_load(yaml_str)
        if not isinstance(data, dict):
            return False, "YAML must be a mapping/object, not a list or scalar", None
        config = AppConfig(**data)
        # Compute diff against current config
        current = get_config()
        current_data = current.model_dump(mode="json")
        new_data = config.model_dump(mode="json")
        diff = {}
        all_keys = set(current_data.keys()) | set(new_data.keys())
        for key in all_keys:
            old_val = current_data.get(key)
            new_val = new_data.get(key)
            if old_val != new_val:
                if key in ("services", "categories"):
                    old_count = len(old_val) if isinstance(old_val, list) else 0
                    new_count = len(new_val) if isinstance(new_val, list) else 0
                    diff[key] = f"{old_count} → {new_count} items"
                else:
                    diff[key] = {"old": old_val, "new": new_val}
        return True, "", diff
    except yaml.YAMLError as e:
        return False, f"YAML syntax error: {e}", None
    except Exception as e:
        return False, f"Invalid config: {e}", None


def get_config() -> AppConfig:
    if _cached_config is None:
        return load_config()
    return _cached_config

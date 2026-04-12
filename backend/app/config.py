import os
import sys
from pathlib import Path
from pydantic_settings import BaseSettings

DEFAULT_CONFIG_FILE = Path(__file__).parent.parent / "default-config.yml"


def _resolve_config_dir() -> Path:
    """
    Config storage priority:
    1. DL_CONFIG_DIR env var (explicit override)
    2. /data (Docker volume mount)
    3. XDG_CONFIG_HOME/dashlink (Linux/Mac)
    4. %APPDATA%/dashlink (Windows)
    5. ./data (fallback for local dev)
    """
    env_dir = os.environ.get("DL_CONFIG_DIR")
    if env_dir:
        return Path(env_dir)

    # Docker: /data exists and is writable (Linux only)
    if sys.platform != "win32":
        docker_path = Path("/data")
        if docker_path.exists() and os.access(str(docker_path), os.W_OK):
            return docker_path

    # Platform-specific
    if sys.platform == "win32":
        appdata = os.environ.get("APPDATA")
        if appdata:
            return Path(appdata) / "dashlink"
    else:
        xdg = os.environ.get("XDG_CONFIG_HOME", str(Path.home() / ".config"))
        return Path(xdg) / "dashlink"

    # Fallback: local ./data
    return Path(__file__).parent.parent / "data"


CONFIG_DIR = _resolve_config_dir()
CONFIG_FILE = CONFIG_DIR / "config.yml"


class Settings(BaseSettings):
    app_name: str = "Dashlink"
    debug: bool = False
    docker_socket: str = ""
    scan_interval: int = 30
    pin_code: str = ""
    config_path: str = str(CONFIG_FILE)

    model_config = {"env_prefix": "DL_"}


settings = Settings()

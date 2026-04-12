from fastapi import APIRouter, HTTPException

from app.models import AppConfig, Service
from app.services.config_manager import get_config, has_backup, load_config, restore_backup, save_config, validate_yaml

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("", response_model=AppConfig)
async def get_current_config():
    return get_config()


@router.put("", response_model=AppConfig)
async def update_config(config: AppConfig):
    save_config(config)
    return config


@router.patch("/theme")
async def set_theme(theme: str):
    config = get_config()
    updated = config.model_copy(update={"theme": theme})
    save_config(updated)
    return {"theme": theme}


@router.post("/services", response_model=Service)
async def add_service(service: Service):
    config = get_config()
    if any(s.id == service.id for s in config.services):
        raise HTTPException(400, "Service with this ID already exists")
    config.services.append(service)
    save_config(config)
    return service


@router.delete("/services/{service_id}")
async def remove_service(service_id: str):
    config = get_config()
    config.services = [s for s in config.services if s.id != service_id]
    save_config(config)
    return {"deleted": service_id}


@router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service: Service):
    config = get_config()
    for i, s in enumerate(config.services):
        if s.id == service_id:
            config.services[i] = service
            save_config(config)
            return service
    raise HTTPException(404, "Service not found")


@router.post("/reload")
async def reload_config():
    load_config()
    return {"status": "reloaded"}


@router.post("/verify-pin")
async def verify_pin(pin: str):
    config = get_config()
    if not config.pin_enabled:
        return {"valid": True}
    return {"valid": pin == config.pin_code}


@router.get("/raw")
async def get_raw_config():
    """Return raw YAML config for editing."""
    import yaml
    config = get_config()
    data = config.model_dump(mode="json")
    return {"yaml": yaml.dump(data, default_flow_style=False, allow_unicode=True)}


@router.put("/raw")
async def update_raw_config(body: dict):
    """Update config from raw YAML string (auto-backup before save)."""
    import yaml
    try:
        data = yaml.safe_load(body.get("yaml", ""))
        config = AppConfig(**data)
        save_config(config)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(400, f"Invalid config: {e}")


@router.post("/raw/validate")
async def validate_raw_config(body: dict):
    """Validate YAML without saving. Returns diff of changes."""
    yaml_str = body.get("yaml", "")
    valid, error, diff = validate_yaml(yaml_str)
    return {"valid": valid, "error": error, "diff": diff}


@router.post("/backup/restore")
async def restore_config_backup():
    """Restore config from the last backup."""
    config = restore_backup()
    if config is None:
        raise HTTPException(404, "No backup available")
    return config


@router.get("/backup/exists")
async def check_backup():
    """Check if a backup exists."""
    return {"exists": has_backup()}

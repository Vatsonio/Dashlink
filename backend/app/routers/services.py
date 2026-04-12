from fastapi import APIRouter

from app.models import Service
from app.services.config_manager import get_config
from app.services.health_worker import get_cached_status

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[Service])
async def list_services():
    """Return configured services with cached health status."""
    config = get_config()
    result = []
    for svc in config.services:
        cached = get_cached_status(svc.id)
        result.append(svc.model_copy(update={"status": cached}))
    result.sort(key=lambda s: (s.category, s.sort_order, s.name))
    return result

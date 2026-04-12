from fastapi import APIRouter

from app.models import HealthResponse
from app.services.config_manager import get_config
from app.services.docker_discovery import check_docker_connection

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    config = get_config()
    docker_ok = await check_docker_connection()
    return HealthResponse(
        status="ok",
        services_count=len(config.services),
        docker_connected=docker_ok,
    )

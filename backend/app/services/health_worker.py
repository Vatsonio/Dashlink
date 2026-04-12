"""Background health check worker. Runs periodically, caches results."""
from __future__ import annotations

import asyncio
import logging
import time

from app.models import ServiceStatus
from app.services.health_checker import check_service_health

logger = logging.getLogger(__name__)

# Cache: service_id -> (status, timestamp)
_health_cache: dict[str, tuple[ServiceStatus, float]] = {}
_worker_task: asyncio.Task | None = None


def get_cached_status(service_id: str) -> ServiceStatus:
    entry = _health_cache.get(service_id)
    if entry is None:
        return ServiceStatus.unknown
    status, ts = entry
    # Stale after 120 seconds
    if time.time() - ts > 120:
        return ServiceStatus.unknown
    return status


def get_all_cached() -> dict[str, ServiceStatus]:
    now = time.time()
    return {
        sid: status
        for sid, (status, ts) in _health_cache.items()
        if now - ts < 120
    }


async def _run_checks():
    """Single pass: check all services from config."""
    from app.services.config_manager import get_config
    from app.services.docker_discovery import discover_docker_services

    config = get_config()
    all_services = list(config.services)

    # Only check health of configured services - no auto-discovery here
    for svc in all_services:
        try:
            status = await check_service_health(svc, timeout=5.0)
            _health_cache[svc.id] = (status, time.time())
        except Exception:
            _health_cache[svc.id] = (ServiceStatus.offline, time.time())


async def health_worker_loop(interval: int = 30):
    """Run health checks in a loop."""
    while True:
        try:
            await _run_checks()
        except Exception as e:
            logger.error("Health worker error: %s", e)
        await asyncio.sleep(interval)


def start_health_worker(interval: int = 30):
    global _worker_task
    if _worker_task is None or _worker_task.done():
        _worker_task = asyncio.create_task(health_worker_loop(interval))
        logger.info("Health worker started (interval=%ds)", interval)


def stop_health_worker():
    global _worker_task
    if _worker_task and not _worker_task.done():
        _worker_task.cancel()
        _worker_task = None

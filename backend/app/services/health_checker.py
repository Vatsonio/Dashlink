from __future__ import annotations

import asyncio
import logging

import httpx

from app.models import Service, ServiceStatus

logger = logging.getLogger(__name__)


async def check_service_health(service: Service, timeout: float = 5.0) -> ServiceStatus:
    """Ping a service URL and return its status."""
    try:
        async with httpx.AsyncClient(timeout=timeout, verify=False) as client:
            resp = await client.get(service.url)
            if resp.status_code < 500:
                return ServiceStatus.online
            return ServiceStatus.offline
    except Exception:
        return ServiceStatus.offline


async def check_all_services(services: list[Service]) -> list[Service]:
    """Check health of all services concurrently."""
    if not services:
        return services

    tasks = [check_service_health(s) for s in services]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    updated: list[Service] = []
    for service, result in zip(services, results):
        if isinstance(result, ServiceStatus):
            updated.append(service.model_copy(update={"status": result}))
        else:
            updated.append(service.model_copy(update={"status": ServiceStatus.offline}))
    return updated

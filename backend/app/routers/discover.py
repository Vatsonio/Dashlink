import asyncio

from fastapi import APIRouter, Query, HTTPException

from app.models import Service
from app.services.config_manager import get_config, save_config
from app.services.docker_discovery import discover_docker_services
from app.services.network_scanner import scan_network, scan_host

NETWORK_SCAN_TIMEOUT = 60  # seconds

router = APIRouter(prefix="/api/discover", tags=["discovery"])


def _merge_discovered(new_services: list[Service]) -> list[Service]:
    """Merge discovered services into config, skipping duplicates."""
    config = get_config()
    existing_ids = {s.id for s in config.services}
    added: list[Service] = []
    for svc in new_services:
        if svc.id not in existing_ids:
            config.services.append(svc)
            existing_ids.add(svc.id)
            added.append(svc)
    if added:
        save_config(config)
    return added


@router.get("/docker", response_model=list[Service])
async def discover_docker():
    """Discover running Docker containers and add to config."""
    found = await discover_docker_services()
    added = _merge_discovered(found)
    return added


@router.get("/network", response_model=list[Service])
async def discover_network(
    targets: str = Query(default="", description="Comma-separated CIDRs or IPs"),
    ports: str = Query(default="", description="Comma-separated ports"),
):
    """Scan network for services and add to config."""
    target_list = [t.strip() for t in targets.split(",") if t.strip()] or None
    port_list = [int(p.strip()) for p in ports.split(",") if p.strip().isdigit()] or None
    try:
        found = await asyncio.wait_for(
            scan_network(targets=target_list, ports=port_list),
            timeout=NETWORK_SCAN_TIMEOUT,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Network scan timed out")
    added = _merge_discovered(found)
    return added


@router.get("/host/{host}", response_model=list[Service])
async def discover_host(host: str):
    """Scan a single host for open ports."""
    found = await scan_host(host)
    added = _merge_discovered(found)
    return added


@router.get("/all", response_model=list[Service])
async def discover_all(
    network_targets: str = Query(default="", description="CIDRs for network scan"),
):
    """Run all discovery methods, merge and save."""
    all_found: list[Service] = []
    seen: set[str] = set()

    docker_svcs = await discover_docker_services()
    for s in docker_svcs:
        if s.id not in seen:
            all_found.append(s)
            seen.add(s.id)

    target_list = [t.strip() for t in network_targets.split(",") if t.strip()] or None
    try:
        net_svcs = await asyncio.wait_for(
            scan_network(targets=target_list),
            timeout=NETWORK_SCAN_TIMEOUT,
        )
    except asyncio.TimeoutError:
        net_svcs = []
    for s in net_svcs:
        if s.id not in seen:
            all_found.append(s)
            seen.add(s.id)

    added = _merge_discovered(all_found)
    return added

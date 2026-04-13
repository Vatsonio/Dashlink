"""Network port scanner for discovering services on the LAN."""
from __future__ import annotations

import asyncio
import logging
import os
import socket

from app.models import Service, ServiceStatus

logger = logging.getLogger(__name__)

# Common self-hosted service ports and their likely names
KNOWN_PORTS: dict[int, tuple[str, str]] = {
    80: ("HTTP Server", "globe"),
    443: ("HTTPS Server", "globe"),
    3000: ("Grafana / Dev Server", "activity"),
    3001: ("Dev Server", "server"),
    5000: ("Flask / Registry", "server"),
    5001: ("Synology", "server"),
    8000: ("API Server", "server"),
    8080: ("Web UI", "globe"),
    8081: ("Web UI Alt", "globe"),
    8096: ("Jellyfin", "play"),
    8123: ("Home Assistant", "home"),
    8200: ("Plex", "play"),
    8443: ("HTTPS Alt", "shield"),
    8888: ("Jupyter", "server"),
    9000: ("Portainer / MinIO", "docker"),
    9090: ("Prometheus", "activity"),
    9443: ("Portainer HTTPS", "docker"),
    19999: ("Netdata", "activity"),
    32400: ("Plex Media Server", "play"),
    51820: ("WireGuard", "shield"),
}


def get_host_ip() -> str:
    """Get the real host IP visible to the LAN.

    Priority:
    1. HOST_IP env var (user override)
    2. Docker host gateway (works inside containers)
    3. UDP socket detection (works on bare metal)
    4. Fallback
    """
    # 1. Explicit override
    env_ip = os.environ.get("HOST_IP", "").strip()
    if env_ip:
        return env_ip

    # 2. Docker host gateway (default route inside container)
    try:
        with open("/proc/net/route") as f:
            for line in f:
                fields = line.strip().split()
                if fields[1] == "00000000":  # default route
                    # Gateway IP is in hex, little-endian
                    hex_ip = fields[2]
                    ip = ".".join(str(int(hex_ip[i:i+2], 16)) for i in (6, 4, 2, 0))
                    if not ip.startswith("127."):
                        return ip
    except (FileNotFoundError, Exception):
        pass

    # 3. UDP socket trick
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        if not local_ip.startswith("172."):
            return local_ip
    except Exception:
        pass

    return "192.168.1.1"


def _detect_local_subnet() -> str:
    """Detect the LAN subnet based on host IP."""
    ip = get_host_ip()
    parts = ip.split(".")
    return f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"


DEFAULT_SCAN_TARGETS = [_detect_local_subnet()]
DEFAULT_PORTS = list(KNOWN_PORTS.keys())


async def _check_port(host: str, port: int, timeout: float = 1.0) -> bool:
    """Check if a port is open on a host."""
    try:
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout,
        )
        writer.close()
        await writer.wait_closed()
        return True
    except (asyncio.TimeoutError, OSError):
        return False


def _expand_cidr(cidr: str) -> list[str]:
    """Expand a /24 CIDR to list of IPs. Only supports /24 for simplicity."""
    if "/" not in cidr:
        return [cidr]
    base, prefix = cidr.rsplit("/", 1)
    if prefix != "24":
        return [base]
    parts = base.split(".")
    return [f"{parts[0]}.{parts[1]}.{parts[2]}.{i}" for i in range(1, 255)]


async def scan_host(host: str, ports: list[int] | None = None) -> list[Service]:
    """Scan a single host for open ports."""
    ports = ports or DEFAULT_PORTS
    services: list[Service] = []

    # Scan ports in batches to avoid Windows select() fd limit
    batch_size = 10
    results: list[bool] = []
    for i in range(0, len(ports), batch_size):
        batch = [_check_port(host, port) for port in ports[i:i + batch_size]]
        results.extend(await asyncio.gather(*batch))

    for port, is_open in zip(ports, results):
        if is_open:
            name, icon = KNOWN_PORTS.get(port, ("Unknown Service", "globe"))
            proto = "https" if port in (443, 8443, 9443) else "http"
            services.append(
                Service(
                    id=f"net-{host}:{port}",
                    name=f"{name} ({host})",
                    url=f"{proto}://{host}:{port}",
                    icon=icon,
                    description=f"Discovered on {host}:{port}",
                    category="Discovered",
                    status=ServiceStatus.online,
                    source="discovered",
                )
            )

    return services


async def scan_network(
    targets: list[str] | None = None,
    ports: list[int] | None = None,
    max_concurrent: int = 20,
) -> list[Service]:
    """Scan network ranges for services."""
    targets = targets or DEFAULT_SCAN_TARGETS
    ports = ports or DEFAULT_PORTS

    all_hosts: list[str] = []
    for target in targets:
        all_hosts.extend(_expand_cidr(target))

    logger.info("Scanning %d hosts on %d ports...", len(all_hosts), len(ports))

    sem = asyncio.Semaphore(max_concurrent)
    all_services: list[Service] = []

    async def _scan_with_sem(host: str):
        async with sem:
            return await scan_host(host, ports)

    tasks = [_scan_with_sem(h) for h in all_hosts]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for result in results:
        if isinstance(result, list):
            all_services.extend(result)

    logger.info("Found %d services", len(all_services))
    return all_services

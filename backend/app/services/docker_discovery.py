from __future__ import annotations

import logging
from typing import Any

from app.models import Service, ServiceStatus

logger = logging.getLogger(__name__)

# Well-known container icons mapping
KNOWN_ICONS: dict[str, str] = {
    "portainer": "portainer",
    "grafana": "grafana",
    "prometheus": "prometheus",
    "nginx": "nginx",
    "traefik": "traefik",
    "pihole": "pi-hole",
    "jellyfin": "jellyfin",
    "plex": "plex",
    "sonarr": "sonarr",
    "radarr": "radarr",
    "nextcloud": "nextcloud",
    "gitea": "gitea",
    "gitlab": "gitlab",
    "homeassistant": "home-assistant",
    "vaultwarden": "vaultwarden",
    "uptime-kuma": "uptime-kuma",
    "adguard": "adguard-home",
    "caddy": "caddy",
    "postgres": "postgresql",
    "redis": "redis",
    "mongo": "mongodb",
    "mariadb": "mariadb",
    "mysql": "mysql",
    "minio": "minio",
    "watchtower": "watchtower",
}


def _guess_icon(name: str) -> str:
    name_lower = name.lower().replace("-", "").replace("_", "")
    for key, icon in KNOWN_ICONS.items():
        if key in name_lower:
            return icon
    return "docker"


def _extract_url(container: Any) -> str | None:
    """Extract accessible URL from container port bindings."""
    from app.services.network_scanner import get_host_ip

    ports = container.attrs.get("NetworkSettings", {}).get("Ports") or {}
    for port_key, bindings in ports.items():
        if bindings:
            host_ip = bindings[0].get("HostIp", "0.0.0.0")
            host_port = bindings[0].get("HostPort")
            if host_port:
                # Use real host IP instead of localhost so links work from LAN
                if host_ip in ("0.0.0.0", "::", "127.0.0.1"):
                    host = get_host_ip()
                else:
                    host = host_ip
                proto = "https" if "443" in port_key else "http"
                return f"{proto}://{host}:{host_port}"
    return None


def _get_label(container: Any, key: str, default: str = "") -> str:
    return container.labels.get(key, default)


async def discover_docker_services(socket_path: str = "") -> list[Service]:
    """Discover running Docker containers and return as Service list."""
    try:
        import docker

        if socket_path:
            client = docker.DockerClient(base_url=socket_path)
        else:
            client = docker.from_env()
        client.ping()
    except Exception as e:
        logger.warning("Docker not available: %s", e)
        return []

    services: list[Service] = []
    try:
        containers = client.containers.list(filters={"status": "running"})
    except Exception as e:
        logger.error("Failed to list containers: %s", e)
        return []

    for container in containers:
        name = _get_label(container, "dashlink.name", "") or container.name or container.short_id

        # Skip if explicitly hidden
        if _get_label(container, "dashlink.hide", "").lower() in ("true", "1", "yes"):
            continue

        url = _get_label(container, "dashlink.url", "") or _extract_url(container) or ""

        icon = _get_label(container, "dashlink.icon", "") or _guess_icon(name)
        category = _get_label(container, "dashlink.category", "Docker")
        description = _get_label(container, "dashlink.description", "")

        services.append(
            Service(
                id=f"docker-{container.short_id}",
                name=name,
                url=url,
                icon=icon,
                description=description,
                category=category,
                status=ServiceStatus.online,
                source="docker",
                container_id=container.short_id,
            )
        )

    client.close()
    return services


async def check_docker_connection(socket_path: str = "") -> bool:
    try:
        import docker

        if socket_path:
            client = docker.DockerClient(base_url=socket_path)
        else:
            client = docker.from_env()
        client.ping()
        client.close()
        return True
    except Exception:
        return False

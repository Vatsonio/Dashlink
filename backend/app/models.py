from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ServiceStatus(str, Enum):
    online = "online"
    offline = "offline"
    unknown = "unknown"


class Service(BaseModel):
    id: str
    name: str
    url: str
    icon: str = ""
    description: str = ""
    category: str = "Default"
    status: ServiceStatus = ServiceStatus.unknown
    source: str = "manual"  # manual | docker | discovered
    container_id: str | None = None
    port: int | None = None
    sort_order: int = 0


class Category(BaseModel):
    name: str
    icon: str = ""
    sort_order: int = 0


class AppConfig(BaseModel):
    title: str = "Dashlink"
    subtitle: str = "Your home dashboard"
    theme: str = "violet-marketplace"
    layout_mode: str = "grid"  # grid | list
    pin_enabled: bool = False
    pin_code: str = ""
    columns: int = 4
    search_enabled: bool = True
    scan_interval: int = 30
    background_url: str = ""
    background_opacity: float = 0.3
    weather_api_key: str = ""
    weather_city: str = ""
    weather_units: str = "metric"
    weather_show_city: bool = True
    categories: list[Category] = Field(default_factory=list)
    services: list[Service] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    services_count: int = 0
    docker_connected: bool = False

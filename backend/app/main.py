from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import config_router, discover, health, services
from app.services.config_manager import load_config
from app.services.health_worker import start_health_worker, stop_health_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = load_config()
    start_health_worker(config.scan_interval)
    yield
    stop_health_worker()


app = FastAPI(
    title="Dashlink API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(services.router)
app.include_router(config_router.router)
app.include_router(discover.router)

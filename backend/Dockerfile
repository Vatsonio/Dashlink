# --- Build stage ---
FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Production stage ---
FROM python:3.12-slim

LABEL org.opencontainers.image.source="https://github.com/Vatsonio/dashlink"
LABEL org.opencontainers.image.description="Dashlink API"

RUN useradd --create-home appuser
WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

RUN mkdir -p /data && chown appuser:appuser /data
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Contributing to Dashlink

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/Vatsonio/dashlink.git
cd dashlink
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000 (hot reload)
- Backend: http://localhost:8000 (auto reload)
- API Docs: http://localhost:8000/docs

## Project Structure

```
dashlink/
├── backend/          # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── routers/  # API endpoints
│   │   └── services/ # Business logic
│   └── tests/
├── frontend/         # Next.js 14 (TypeScript)
│   └── src/
│       ├── app/      # Pages
│       ├── components/
│       ├── lib/      # API client, hooks
│       └── themes/   # Theme definitions
├── scripts/          # Deploy scripts
└── docker-compose.yml
```

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests: `cd backend && python -m pytest tests/ -v`
4. Ensure the frontend builds: `cd frontend && npm run build`
5. Open a PR with a clear description

## Guidelines

- Keep PRs focused on a single change
- Follow existing code style
- Add tests for new backend endpoints
- Use Lucide icons (not emojis) for UI elements
- Ensure all 5 themes look correct with your changes

## Adding a New Theme

1. Add theme definition in `frontend/src/themes/index.ts`
2. Test with all existing components
3. Add a screenshot to `docs/assets/`
4. Update the README themes table

## Reporting Issues

- Use the GitHub issue templates
- Include browser, OS, and Docker version
- Screenshots help a lot

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

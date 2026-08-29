# Margin Dashboard

## Layout

- `server/` — Express + TypeScript API (see `server/README` intent in code comments / `../CLAUDE.md`).
- `client/` — React + Vite frontend.

The three sample spreadsheets (`timesheet-2025.xlsx`, `salaries-2025.xlsx`,
`project-prices-2025.xlsx`) live in `server/` and are committed to the repo,
so a fresh checkout is self-contained — no external files needed to seed.

## Run it with Docker (recommended, one command)

Requires Docker Desktop, nothing else.

```bash
cd app
docker compose up --build
```

- Client: http://localhost:5173
- Server API: http://localhost:2000/api

On first boot the server container seeds the database from the three sample
`.xlsx` files automatically. The seed step is safe to run again (e.g. on
every container restart) — it checks whether the database already has data
and skips itself if so, so you never get duplicate rows. To force a reseed
against a non-empty database, run:

```bash
docker compose run --rm -e FORCE_SEED=1 server npm run seed
```

To reset everything, including the Mongo volume:

```bash
docker compose down -v
```

## Run it locally without Docker

Requires Node.js and a local MongoDB listening on
`mongodb://localhost:27017/margindashboard`.

```bash
cd server
npm install
npm run seed    # one-time: loads the three sample .xlsx files
npm start       # http://localhost:2000

# in another terminal
cd client
npm install
npm run dev     # http://localhost:5173, proxies /api to :2000
```

`npm run seed` is idempotent the same way as in Docker: it skips itself if
the database already has data, and `FORCE_SEED=1 npm run seed` reseeds
anyway. Set `SEED_TIMESHEET_PATH`, `SEED_SALARY_PATH`, `SEED_PROJECTS_PATH`
to point it at files in a different location.

## Uploading corrected data

Beyond the initial seed, use the client's import page (or `POST
/api/import/{timesheet,salary,projects}`) to upload a corrected month or
file at any time — re-uploading replaces the affected month/entity rather
than duplicating or destroying other months.

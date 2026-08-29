# Margin Dashboard Monorepo

Ingests three messy agency spreadsheets (timesheet, salaries, project prices) and answers
"did we make money on that project?" — per project, per department, per employee, per month.

`server/` — Express 5 + TypeScript + MongoDB. `client/` — React + Vite and bun.

## Run it (< 5 min)

Requires **Docker** only.

```bash
docker compose up --build
```

- Dashboard: http://localhost:5173
- API: http://localhost:2000/api

The three sample `.xlsx` files are committed under `server/` and auto-seed into Mongo on first
boot, so the dashboard is populated the moment it opens. Seeding is idempotent (skips itself if
the DB already has data); 

Reset everything (including the Mongo volume): `docker compose down -v`.

<details>
<summary>Running without Docker</summary>

Requires Node.js 20+ and a local MongoDB on `mongodb://localhost:27017/margindashboard`.

```bash
cd server && npm install && npm run seed && npm start   # http://localhost:2000
cd client && npm install && npm run dev                 # http://localhost:5173
```
</details>


## Uploading corrected data

Beyond the initial seed, use the client's import page (or `POST
/api/import/{timesheet,salary,projects}`) to upload a corrected month or
file at any time — re-uploading replaces the affected month/entity rather
than duplicating or destroying other months.


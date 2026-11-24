# StyleSnap backend

Express 5 on Node's built-in SQLite (`node:sqlite`), implementing [contracts/api.json](../contracts/api.json). Needs Node 22.13 or later.

| Command (from the repo root) | What it does |
|---|---|
| `make run-backend` | Starts the API on http://127.0.0.1:8787, seeding the database on first run. `DELAY_MS=800 make run-backend` slows every response, to look at loading states |
| `make seed-backend` | Resets the database to the seed data |
| `make check-backend` | Runs the API tests, including a check that every operation in contracts/api.json is served |
| `make android-reverse` | Lets the Android emulator reach the API at 127.0.0.1:8787 |

The database lives in `backend/data/stylesnap.db` (git-ignored). Set `PORT` or `DATABASE_PATH` to change either. `GET /health` reports the row counts and `GET /openapi.json` serves the contract.

| File | Contents |
|---|---|
| src/app.js | Routes, CORS and error responses (`ErrorResponse`) |
| src/store.js | SQL for categories, outfits, collections and the wardrobe |
| src/validation.js | Request validation, matching the limits in contracts/api.json |
| src/seed-data.js | The seed catalog, collections, wardrobe and photo library, with fixed ids |
| test/api.test.js | `node:test` tests against an in-memory database |

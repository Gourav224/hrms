# HRMS Lite Backend (FastAPI)

Professional FastAPI backend for the HRMS Lite assignment.

## Stack
- FastAPI
- SQLAlchemy
- PostgreSQL (psycopg)
- Pydantic v2
- JWT auth + RBAC (admin, manager)

## Setup
1. Create a virtual env and install deps with `uv`:
```bash
uv sync 
```

2. Set environment variables (copy sample):
```bash
cp .env.sample .env
```
Optional: adjust `LOG_LEVEL` in `.env` (default `INFO`).

Key env options:
- `ALLOWED_HOSTS` (default `*`)
- `RATE_LIMIT_DEFAULT`, `RATE_LIMIT_LOGIN`, `RATE_LIMIT_BOOTSTRAP`
- `ENABLE_HTTPS_REDIRECT` (set `true` behind HTTPS)

3. Run the API:
```bash
uv run uvicorn app.main:app --reload
```
Or:
```bash
uv run main.py
```

Default base URL: `http://127.0.0.1:8000`
Swagger docs: `http://127.0.0.1:8000/docs`
OpenAPI schema: `http://127.0.0.1:8000/openapi.json`
API base path: `/api/v1`

## Auth Flow (JWT)
1. **Bootstrap the first admin**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/bootstrap \
  -H "X-Admin-Bootstrap-Token: bootstrap-change-me" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.local","password":"admin1234","role":"admin"}'
```

2. **Login**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.local","password":"admin1234"}'
```

3. **Use the token**
```bash
curl http://127.0.0.1:8000/api/v1/employees \
  -H "Authorization: Bearer <token>"
```

## Seeding Data
```bash
uv run seed.py
```

This will create a default admin (if missing) and a few employees with attendance.
Default admin credentials:
- `admin@hrms.local`
- `admin1234`

If you changed the password hashing algorithm locally, you can force-reset the admin password:
```bash
SEED_RESET_ADMIN=true uv run seed.py
```

## Pagination
List endpoints support:
- `limit` (default 20, max 100)
- `offset` (default 0)

Example:
`GET /api/v1/employees?limit=10&offset=0`
Search:
`GET /api/v1/employees?q=eng`

## Response Format
All endpoints return a consistent shape:
```
{
  "success": true,
  "message": "Employees fetched",
  "data": [...],
  "meta": {"total": 3, "limit": 20, "offset": 0}
}
```
Errors:
```
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    {"loc": ["body", "email"], "msg": "Invalid email", "type": "value_error"}
  ]
}
```

## Migrations
This project still uses `Base.metadata.create_all()` on startup (for a “just run it” dev experience),
but **existing Neon databases** won’t automatically pick up new columns. Use Alembic to update schema.

1. Apply migrations:
```bash
uv sync
uv run alembic upgrade head
```

If you see an error like:
`psycopg.errors.UndefinedColumn: column admins.name does not exist`
it means your DB schema is behind; running `alembic upgrade head` will add the missing columns.

Note: If your DB is brand new and has no tables yet, run the API once (it will create tables),
then run the Alembic upgrade for future-proofing.

## Key Endpoints
- `POST /api/v1/auth/bootstrap`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/admins` (admin only)

- `GET /api/v1/admins` (admin only)
- `GET /api/v1/admins/{admin_id}` (admin only)
- `POST /api/v1/admins` (admin only)
- `PATCH /api/v1/admins/{admin_id}` (admin only)
- `DELETE /api/v1/admins/{admin_id}` (admin only)

- `GET /api/v1/employees`
- `GET /api/v1/employees/{employee_id}`
- `POST /api/v1/employees` (admin)
- `PATCH /api/v1/employees/{employee_id}` (admin)
- `DELETE /api/v1/employees/{employee_id}` (admin)

- `GET /api/v1/employees/{employee_id}/attendance`
- `GET /api/v1/employees/{employee_id}/attendance/summary`
- `GET /api/v1/employees/{employee_id}/attendance/{attendance_id}`
- `POST /api/v1/employees/{employee_id}/attendance`
- `PUT /api/v1/employees/{employee_id}/attendance/today` (upsert today)
- `PATCH /api/v1/employees/{employee_id}/attendance/{attendance_id}`
- `DELETE /api/v1/employees/{employee_id}/attendance/{attendance_id}` (admin)

- `GET /api/v1/attendance` (optional filters: employee_id, date_from, date_to)

- `GET /api/v1/stats/overview?date=YYYY-MM-DD`

## Notes
- Timestamps and user stamps are stored on `employees`, `attendance`, and `admins`.
- RBAC:
  - `admin`: full access
  - `manager`: read employees + attendance, create/update attendance
- Rate limiting defaults to `200/minute`, login `5/minute`.
- Health check is rate-limit exempt.
- Security middleware adds standard headers and GZip compression.

## Linting
Ruff is configured for linting/formatting:
```bash
uv run ruff check .
uv run ruff format .
```

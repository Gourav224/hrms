# HRMS Lite

A comprehensive Human Resource Management System (HRMS) featuring a robust FastAPI backend and a modern Next.js frontend.

## Project Structure

This repository is organized as a monorepo containing both the backend and frontend components:

- **[server/](./server)**: FastAPI backend implementation.
- **[client/](./client)**: Next.js frontend implementation.

## Tech Stack

### Backend (`server/`)

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: JWT-based RBAC (Admin, Manager roles)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

### Frontend (`client/`)

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **State Management/Data Fetching**: TanStack Query
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Python 3.12+ (managed by `uv` is recommended)
- Node.js 18+
- pnpm
- PostgreSQL database

### Local Setup

#### 1. Backend Setup

Navigate to the `server/` directory:

```bash
cd server
cp .env.sample .env # Configure your DB credentials
uv sync
uv run alembic upgrade head
uv run main.py
```

The backend will be available at `http://127.0.0.1:8000`.

#### 2. Frontend Setup

Navigate to the `client/` directory:

```bash
cd client
cp .env.sample .env # Configure API base URL
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

### Default Credentials

After seeding the database, you can log in with:

- **Email**: `admin@hrms.com`
- **Password**: `admin1234`

## Features

- **Employee Management**: CRUD operations for employees.
- **Attendance Tracking**: Daily attendance logging and summaries.
- **Role-Based Access Control**: Different permissions for Admins and Managers.
- **Responsive Dashboard**: Real-time stats and overview.

## Documentation

- Backend details: [server/README.md](./server/README.md)
- Frontend details: [client/README.md](./client/README.md)

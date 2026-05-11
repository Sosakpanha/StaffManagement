# Staff Management

Small full-stack CRUD app for managing staff records.

- **Backend:** ASP.NET Core 8 Web API (C#) with Dapper, JWT auth, NLog.
- **Frontend:** React 18 + Vite + TypeScript + Ant Design.
- **Database:** SQL Server 2022 in Docker, schema deployed via DACPAC.
- **Tests:** NUnit (unit + integration via Testcontainers), Vitest (frontend unit), Playwright (E2E).
- **CI:** GitHub Actions.

> Setup, prerequisites, run/test instructions, and architecture notes will be filled in as the implementation progresses.

## Project layout

```
StaffManagement/
├── backend/          ASP.NET Core 8 Web API + tests
├── database/         SQL Server database project (.sqlproj) → DACPAC
├── frontend/         React + Vite + TypeScript app + tests
├── docker-compose.yml  SQL Server 2022 container for local dev
└── .github/          CI workflows
```

# Staff Management

Small full-stack CRUD app for managing staff records: search, add,
edit, soft-delete, and export to Excel / PDF.

| Layer    | Tech                                                                                    |
|----------|-----------------------------------------------------------------------------------------|
| Backend  | ASP.NET Core 8 Web API · Dapper · Newtonsoft.Json (camelCase) · NLog                    |
| Database | SQL Server 2022 in Docker · DACPAC schema · stored procedures only                      |
| Frontend | React 19 · Vite 8 · TypeScript · Tailwind v4 · React Router · zod                       |
| Tests    | NUnit + FluentAssertions + NSubstitute · Testcontainers + Respawn · Vitest · Playwright |
| CI       | GitHub Actions (backend / frontend / e2e parallel jobs)                                 |

## Prereqs

- **.NET 8 SDK** (`dotnet --version` ≥ 8.0)
- **Node 20+** (`node --version`)
- **Docker Desktop** with the daemon running
- **Apple Silicon (M-series) only:** enable Rosetta in Docker Desktop →
  Settings → General → "Use Rosetta for x86_64/amd64 emulation". The
  SQL Server image is `linux/amd64` and won't run without it.

## Quick start

```bash
# 1. Env vars (SQL password + connection string + VITE_API_BASE_URL).
cp .env.example .env

# 2. SQL Server.
docker compose up -d sqlserver

# 3. Database schema (builds the .sqlproj and publishes the DACPAC).
./database/scripts/deploy.sh

# 4. Backend API. Source .env first so ConnectionStrings__DefaultConnection
#    (and the rest of the file) ends up in the process environment.
set -a && source .env && set +a
ASPNETCORE_URLS=http://localhost:5000 \
ASPNETCORE_ENVIRONMENT=Development \
dotnet run --project backend/src/StaffManagement.Api --no-launch-profile

# 5. Frontend (in another terminal).
cd frontend
npm install
npm run dev
# → open http://localhost:5173/staff
```

Swagger: <http://localhost:5000/swagger>  ·  Health: <http://localhost:5000/health>

## Commands

| Task                                  | Command                                                                |
|---------------------------------------|------------------------------------------------------------------------|
| Run backend                           | `dotnet run --project backend/src/StaffManagement.Api`                 |
| Build solution (incl. sqlproj)        | `dotnet build StaffManagement.sln`                                     |
| Backend tests (NUnit + Testcontainers)| `dotnet test backend/tests/StaffManagement.Test`                       |
| Publish DACPAC                        | `./database/scripts/deploy.sh`                                         |
| Frontend dev server                   | `cd frontend && npm run dev`                                           |
| Frontend lint                         | `cd frontend && npm run lint`                                          |
| Frontend unit tests                   | `cd frontend && npm run test:unit -- --run`                            |
| Frontend e2e                          | `cd frontend && npm run test:e2e` *(needs API + dev server running)*   |
| Frontend production build             | `cd frontend && npm run build`                                         |
| Docker SQL up / down                  | `docker compose up -d sqlserver` / `docker compose down`               |

## Environment variables

Set in `.env` at the repo root.

| Variable                               | Used by                            | Example                                                                                                            | Notes                                                            |
|----------------------------------------|------------------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| `MSSQL_SA_PASSWORD`                    | `docker-compose.yml`, `deploy.sh`  | `ChangeMe_DevPassword123!`                                                                                         | SQL Server complexity policy: 8+ chars, upper/lower/digit/symbol |
| `ConnectionStrings__DefaultConnection` | API                                | `Server=localhost,1433;Database=StaffManagement;User Id=sa;Password=…;TrustServerCertificate=True;Encrypt=False`   | `__` becomes `:` per .NET config                                 |
| `Cors:AllowedOrigins`                  | API                                | `http://localhost:5173` (in `appsettings.Development.json`)                                                        | Restrict to the Vite dev origin                                  |
| `ASPNETCORE_URLS`                      | API                                | `http://localhost:5000`                                                                                            | Must match what `VITE_API_BASE_URL` points at                    |
| `VITE_API_BASE_URL`                    | Frontend                           | `http://localhost:5000`                                                                                            | Vite loads the root `.env` via `envDir: '..'`                    |

## Architecture notes

**Data access.** All persistence is Dapper + stored procedures — no
ORM, no migrations folder. Schema is the source of truth in
`database/StaffManagement.Database/`, deployed as a DACPAC via
sqlpackage. The `.sqlproj` uses the modern SDK-style
`Microsoft.Build.Sql` package so it builds cross-platform (including
the CI runners).

**Soft delete.** `dbo.Staff` has `IsDeleted` + `DeletedAt`. Every read
path filters `IsDeleted = 0`; `DeleteStaff` flips the flag and *returns
the row*, so the UI can show a toast naming the deleted staff. The
unique index on `StaffId` is filtered by `IsDeleted = 0`, so a deleted
StaffId can be reused for a brand-new staff member.

**Error envelope.** The API returns one shape on every failure:
`{ code: number, message: string }`. Codes live in `EnumApiError`
(`40000` validation, `50001` dup StaffId → 409, `50404` not found →
404). The matching `THROW` codes in the SPs flow straight through.
`ExceptionFilter` maps `ApiException` to its HTTP status;
`InvalidModelStateResponseFactory` translates DataAnnotations failures
into the same envelope. The frontend's axios interceptor parses the
envelope into a single `ApiException` type so every page handles one
shape.

**JSON.** `Newtonsoft.Json` with `CamelCasePropertyNamesContractResolver`
keeps the wire format camelCase end-to-end. `DateOnly` round-trips as
`YYYY-MM-DD` via a custom Dapper `TypeHandler` and Newtonsoft 13.0.4+'s
built-in support.

**Logging.** NLog replaces the default `ILogger` provider. Console
target for dev, rolling file target under `logs/`. Microsoft.* noise
is suppressed to Warning.

**No auth.** This is an internal admin tool with open CRUD endpoints —
no JWT, no login. CORS is restricted to the configured Vite dev origin.

**No client-side persistence.** The frontend keeps no `localStorage`,
cookies, IndexedDB or cached entities; every render fetches from the
API, so there's no surface for an XSS to lift a stale token or
customer data from.

**Tests.** Backend integration tests spin a real SQL Server via
`Testcontainers.MsSql`, apply the DACPAC with
`Microsoft.SqlServer.DacFx` once per fixture, and use `Respawn` to
reset between tests, so the tests hit the same SPs production does.
Frontend tests mix `Vitest` (utils, schemas, the Table primitive) with
`Playwright` running against a live API + Vite dev server.

**CI.** `.github/workflows/ci.yml` runs three parallel jobs on
`ubuntu-latest`: `backend` (build + NUnit + Testcontainers),
`frontend` (lint + Vitest + production build), and `e2e` (SQL Server
service container → sqlpackage publish → API + Vite + Playwright).
The e2e job uploads Playwright traces, the HTML report, and the API
log as an artifact on failure.

## Assumptions

The decisions worth surfacing aren't the obvious ones (.NET 8, SQL Server). They're the ones a reviewer might second-guess and where the *why* matters.

1. **Internal admin tool, no auth.** The assignment didn't call for multi-user or external exposure, so the API is open and CORS-restricted to a single Vite origin. If it ever leaves the admin network, add ASP.NET Core authentication + `[Authorize]` on the controllers.
2. **Single-table domain.** Staff is the only entity — no departments, roles, managers, or relationships. The schema is deliberately flat.
3. **Gender is a constrained int (`1=Male`, `2=Female`).** Matches the spec; not extensible without a schema change.
4. **`StaffId` is a human-assigned key, max 8 chars.** Not auto-generated. Uniqueness is enforced via a *filtered* unique index so a soft-deleted StaffId can be reused for a new staff member.
5. **Soft delete preserves history; deleted IDs are reusable.** `DeleteStaff` flips `IsDeleted` and stamps `DeletedAt`; every read filters `IsDeleted = 0`. The alternative ("deleted IDs stay reserved") is also defensible — flagged here so the choice is explicit.
6. **Stored procedures are the only data path.** No EF Core, no ad-hoc SQL from C#. All writes go through reviewed SPs; the DACPAC is the schema source of truth.
7. **Newtonsoft.Json + camelCase wire format.** Matches the conventions of an existing internal project so a developer moving between codebases doesn't context-switch.
8. **Error envelope is `{ code, message }`, not `{ success, data, message }`.** The HTTP status carries success/failure, so a `success` boolean would be redundant. Stable numeric `code`s in `EnumApiError` align 1:1 with the `THROW` codes the SPs raise (`50001`, `50404`, …) so a SQL error maps to an API error unambiguously.
9. **Timestamps are stored in UTC; the frontend displays them as-is.** A future timezone-aware UI would convert on render.
10. **macOS Apple Silicon dev environment.** SQL Server's `linux/amd64` image needs Rosetta in Docker Desktop. Documented in Prereqs.

## Future improvements

Grouped by area. None of these block the current submission; they're what I'd reach for next.

**Security & multi-user**
- Auth via `HttpOnly` + `Secure` + `SameSite=Strict` session cookies (rather than localStorage-backed JWTs) since this is a browser-only admin tool — XSS can't exfiltrate a cookie the browser never hands to JavaScript. Pair with `[Authorize]` on the controllers and an audit trail (`CreatedBy / UpdatedBy / DeletedBy`) once there's a user identity to record.
- Rate limiting on the open endpoints if the API is ever exposed publicly.
- Optimistic concurrency on `UpdateStaff` — return `RowVersion`/`UpdatedAt` and require it on PUT so two simultaneous edits can't silently overwrite each other.

**Database & queries**
- A scheduled purge job for `IsDeleted = 1 AND DeletedAt < @cutoff` so soft-deleted rows don't accumulate forever.
- A restore endpoint — flip `IsDeleted` back to `0` — for staff deleted by mistake. The data model already supports it.
- Full-text index on `FullName` if search volume grows beyond what the current B-tree + `LIKE %x%` can serve.

**Frontend**
- Mobile-responsive table — currently overflows horizontally on narrow viewports. Switch to a card-list view at `<640px`.
- Code-splitting — the production bundle is ~556 KB (174 KB gzipped); lazy-loading `react-day-picker` would knock the largest chunk off the critical path.
- Exit animations on modal/drawer/toast — only enter animations exist today; closing snaps.
- Localization scaffolding — error messages and UI strings are English-only.

**Ops & observability**
- Deeper `/health` — currently returns OK as soon as the API is up. Add a "DB reachable" probe so a half-down API stops claiming health.
- Ship NLog output to a central aggregator (Seq, ELK, OpenTelemetry) in production rather than writing to local files.
- `dotnet publish` step in CI as a release-readiness signal.

**Exports**
- Stream the XLSX/PDF instead of building the whole document in `MemoryStream`. The current 10k page-size cap keeps the in-memory footprint bounded, but a true streaming writer would handle larger exports without memory pressure.

## Project layout

```text
StaffManagement/
├── .env.example                    SQL password, connection string, FE base URL
├── docker-compose.yml              SQL Server 2022 service for local dev
├── StaffManagement.sln             Solution: API + sqlproj + test project
├── backend/
│   ├── src/StaffManagement.Api/    Web API (Controllers, Services, Repositories,
│   │                               Models, Entities, Filters, Enums, Data, Exports)
│   └── tests/StaffManagement.Test/ NUnit suite (Service + Endpoints + Exports)
├── database/
│   ├── StaffManagement.Database/   .sqlproj source of truth: Tables/, StoredProcedures/
│   └── scripts/deploy.sh           sqlpackage publish wrapper
├── frontend/
│   ├── src/
│   │   ├── api/                    Axios client + staff endpoints
│   │   ├── components/             AppLayout + UI primitives (Tailwind from scratch)
│   │   ├── pages/                  StaffListPage, StaffFormPage
│   │   ├── schemas/, types/, utils/, lib/
│   │   └── test/                   Vitest setup
│   ├── e2e/                        Playwright specs
│   ├── vite.config.ts              Tailwind v4 plugin + envDir = '..'
│   ├── playwright.config.ts
│   └── vitest.config.ts
└── .github/workflows/ci.yml
```

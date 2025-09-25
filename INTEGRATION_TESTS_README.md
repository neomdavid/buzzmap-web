# Integration Test Plan — Web ↔ API ↔ Database

This document defines the end-to-end integration tests we must execute to validate that the Web application correctly interacts with the API and that the API persists and retrieves data from the Database.

Scope focuses on real request/response behavior between Web ↔ API and API ↔ Database. Unit tests are out of scope here.

## Prerequisites

- Web app: this repo (Vite + React, Vitest + Testing Library)
- API: running locally or in a test environment (BASE_URL set via environment)
- Database: seeded test database the API points to
- Test accounts: at least one user, admin, superadmin with known credentials and account statuses

Environment variables (examples):

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_MAPS_KEY` (only required for mapping tests that render maps)

Recommended test data strategy:

- Use isolated schemas or prefixed records per test run
- Provide idempotent seed scripts for users, barangays, reports, interventions, announcements, clusters

## How to run

1. Start API against test DB and load seed data
2. Start Web app pointing to the API

```bash
npm run dev
```

3. Execute integration tests (headless):

```bash
npm run test
```

4. Or with coverage / UI:

```bash
npm run test:cov
npm run test:ui
```

Note: If tests need live API calls, disable MSW for those specs or configure MSW to passthrough to real endpoints.

## Test Modules and Flows

Below, each section lists Web ↔ API ↔ Database integration flows to verify. For each flow, validate: request payload, response shape, DB side effects, and UI outcome.

### 1) Authentication

- Login → Authentication API → Users DB → Session token issued
  - Valid credentials: 200 + token; invalid: 401; suspended/deactivated: blocked
- Logout → API → Access logs DB entry created
- Session persistence: refresh uses stored token; expired token prompts re-login

### 2) User (Citizen)

- Community page
  - List announcements/posts → API → Announcement DB
  - Upvote/downvote (if server-side) → API persists vote; list reflects new counts
- Mapping page
  - Load barangay/geo boundaries → API or static → verify fallback
  - Fetch dengue metrics by area → API → Metrics DB
- Profile page
  - Get profile → API → Users DB
  - Update profile/avatar → API stores; subsequent GET reflects changes

### 3) Admin — Dashboard

- KPIs/summary cards → API aggregations → DB
- Date range filters affect API queries and results

### 4) Admin — Analytics

- Time-series/chart data → API → DB
- Edge cases: empty ranges; large ranges; null/zero handling

### 5) Admin — Dengue Mapping

- Layers and legend metadata → API
- Area selection → API returns area-specific stats; verify correctness vs seed

### 6) Admin — Clustering (under Dengue Mapping)

- Create cluster → API → DB record created
- Update cluster (merge/split/rename) → API → DB mutations
- Assign barangays to cluster → API persists mapping; downstream mapping endpoints return updated grouping

### 7) Admin — Reports Verification

- List reports with filters (status/type/date/barangay) → API paginated results
- Get report details (media links, location) → API → Storage/DB
- Approve/Reject with notes → API updates status + audit trail; list refresh shows new state
- Concurrency: reject conflict on stale version; API returns 409; UI refetches

### 8) Admin — Interventions

- Create intervention (required fields, dates, coords) → API → DB
- Edit intervention → API persists changes; GET reflects update
- Complete/cancel status transitions → API updates status + timestamps
- Evidence upload (multipart) → API stores; GET returns file metadata/URL
- Filters/search/sort/pagination → API applies server-side; totals consistent

### 9) Admin — Community Engagement and Awareness

- Create announcement/event → API → Announcement DB
- Edit/publish/unpublish → API persists; Community page fetch shows correct visibility
- Notifications (if applicable): API triggers delivery; verify status in DB/logs

### 10) Super Admin — User Management

- Create user with role → API → Users DB; login works for new user
- Update status/role → API persists; AuthGuard behavior changes immediately
- Password/OTP reset → API updates credentials; next login requires new secret

### 11) Super Admin — Admin Management

- Create/disable admin accounts → API → Users DB
- Change permissions/role → API enforces access to admin routes/data
- Audit log entries written for each admin change

## Cross-Cutting Tests

- Error handling: 4xx/5xx/timeouts produce user-visible messages and no corrupt state
- Authorization: endpoints reject unauthorized/forbidden roles; UI handles 401/403
- Input validation: server rejects invalid payloads; UI shows validation errors
- Pagination/sorting: API result metadata matches UI behavior
- Data consistency: after mutations, subsequent GETs reflect latest state

## Example Test Case Template

Use this as a structure for each spec to ensure Web ↔ API ↔ DB is fully validated.

```md
Title: Approve a dengue report with note
Preconditions:

- Admin account exists
- Report with status "under_review" exists in DB
  Steps:

1. Web calls GET /reports?status=under_review → API returns list including target report
2. Web calls POST /reports/{id}/approve with { note }
3. API updates DB: report.status = "verified", audit trail inserted
4. Web calls GET /reports/{id} and receives updated resource
   Expected Results:

- API returns 200 for approve
- DB contains updated status and audit record
- UI shows "verified" badge; list reflects new state
```

## Implementation Notes

- Prefer Testing Library for user flows that trigger real API calls via axios
- For live API runs, configure axios base URL via `VITE_API_BASE_URL`
- For DB verification, rely on API read-backs (black-box). If direct DB access is available in CI, add read-only assertions in fixtures

## Reporting

- Record per-suite coverage and a checklist of pass/fail for each flow above
- Capture API request/response logs for failed scenarios

## Out of Scope

- Visual/regression diffs, browser compatibility matrix (tracked separately)

---

Maintainers: QA / Engineering

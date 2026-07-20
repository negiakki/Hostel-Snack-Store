# Production Deployment

## Scope

The V1 production topology is a Next.js frontend on Vercel, a NestJS API on
Render, a managed PostgreSQL database, and a Supabase Storage bucket for product
images. The backend is the only service that connects to PostgreSQL.

Use HTTPS production origins. For reliable administrator sessions, map the
frontend and API to subdomains of the same registrable domain, for example
`https://store.example.com` and `https://api.example.com`. This avoids reliance
on browser support for third-party cookies between unrelated `vercel.app` and
`onrender.com` domains.

## Environment variables

### Render backend

| Variable | Required | Production value |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Direct PostgreSQL connection URL, including required TLS parameters. Do not use a Prisma Accelerate URL. |
| `FRONTEND_URL` | Yes | Exact HTTPS frontend origin, with no path or trailing slash. Multiple origins are comma-separated only when deliberately supporting previews. |
| `JWT_SECRET` | Yes | Unique cryptographically random secret of at least 32 characters. Never reuse it across environments. |
| `ADMIN_NAME` | First deploy | Display name for the initial administrator. |
| `ADMIN_EMAIL` | First deploy | Login email for the initial administrator. |
| `ADMIN_PASSWORD` | First deploy | Long, unique administrator password. |
| `PORT` | No | Render supplies this automatically; do not set a fixed value. |

`JWT_SECRET` invalidates every existing administrator session when rotated. The
provided `render.yaml` asks Render to generate it during initial provisioning;
record it in the platform's secret store, never in the repository.

The API validates `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `PORT` on
startup. Production frontend origins must be HTTPS origins only. Credentialed
CORS is restricted to `FRONTEND_URL`; wildcards are not permitted.

### Vercel frontend

| Variable | Required | Production value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Exact public backend API base URL, for example `https://api.example.com/api/v1`. |

`NEXT_PUBLIC_API_BASE_URL` is included in browser code when Next.js builds. Set
it for the Production environment before building or deploying, and redeploy
after changing it. `API_BASE_URL` is not a production frontend variable.

### Storage

The current V1 application stores product image URLs; it does not yet use
storage credentials at runtime. Do not configure unused storage access keys in
Render or Vercel.

Create the `hostel-snack-store` Supabase Storage bucket (or the equivalent
chosen name) before adding production product images. It must allow public
**read** access to the final image URLs used by the storefront. Restrict bucket
write access to the shopkeeper's trusted storage workflow and keep Supabase
service-role keys outside the application and browser. Verify one uploaded
image URL over HTTPS before entering it for a product.

## Render deployment

The repository root includes `render.yaml`. Create a Render Blueprint from the
repository, then confirm these settings:

| Setting | Value |
| --- | --- |
| Service root directory | `backend` |
| Runtime | Node.js 20.9 or later |
| Build command | `npm ci --include=dev && npm run build` |
| Pre-deploy command | `npm run prisma:migrate:deploy` |
| Start command | `npm run start:prod` |
| Health check | `/api/v1/health` |
| Initial deploy hook | `npm run prisma:seed` |

Enter the `DATABASE_URL`, `FRONTEND_URL`, and `ADMIN_*` variables as secrets
when the Blueprint prompts for them. Set `FRONTEND_URL` to the final Vercel
origin before enabling administrator login. Deploy the backend in the same
region as the database where possible.

Render captures the Nest production log levels `log`, `warn`, and `error` from
standard output. Unexpected server errors include the request method and path,
but responses do not expose error details. Review Render logs and health-check
history after every release.

The Render environment sets `NODE_ENV=production`. npm therefore omits
development dependencies by default, but Nest CLI is a build-time development
dependency. The build command explicitly uses `--include=dev` so the local
`@nestjs/cli` binary is available while compiling. The runtime still starts the
compiled `dist/main` file and does not rely on Nest CLI.

### Prisma migration and seed strategy

`prisma migrate deploy` is the only production schema command. It runs the
reviewed migrations in `backend/prisma/migrations`; never use `prisma db push`
or edit the production schema manually.

The Blueprint runs migrations before each deploy. If a deployment needs manual
recovery, use a Render shell or one-off job from `backend`:

```bash
npm ci
npm run prisma:migrate:status
npm run prisma:migrate:deploy
```

The first-deployment hook runs the idempotent administrator seed after the
first successful API deployment. For a manual seed (for example, after a
verified failed initial hook), run:

```bash
npm run prisma:seed
```

The seed never overwrites an existing administrator. Do not use it to reset a
production password; use a deliberate, audited maintenance procedure instead.

## Vercel deployment

Create a Vercel project from this repository with **Root Directory** set to
`frontend`. Leave the detected Next.js framework and output settings in place.
Vercel installs dependencies from that directory and runs the `build` script.

Set `NEXT_PUBLIC_API_BASE_URL` for the Production environment, then deploy.
Use the final Vercel custom domain in Render's `FRONTEND_URL`; if that setting
changes, redeploy the backend before testing login. Preview deployments are not
automatically authorized by CORS. Add an exact preview origin temporarily only
when preview authentication is explicitly required, then remove it afterwards.

All admin API calls use `credentials: "include"`. The backend sends the session
cookie as `Secure`, `HttpOnly`, and `SameSite=None` in production, and CORS
allows credentials only for the configured frontend origin. Test sign-in and
sign-out in an actual browser; `curl` alone does not prove cross-origin cookie
behavior.

## Production database checklist

- Provision a managed PostgreSQL database with backups and point-in-time
  recovery enabled where available.
- Store its TLS-capable direct connection URL only in Render's `DATABASE_URL`.
- Run and verify `npm run prisma:migrate:status`; the migration history must be
  fully applied.
- Confirm the administrator seed created exactly one `admin_users` record, then
  remove `ADMIN_PASSWORD` from any temporary local shell history or notes.
- Confirm the existing migration indexes are present: product name, category,
  and archival state; order creation time and status; order-item order and
  product IDs; unique administrator email; and unique daily analytics business
  date. Migrations create these indexes automatically.
- Verify the `hostel-snack-store` storage bucket configuration described above.

## Daily analytics scheduler

No public production finalization endpoint exists. In production,
`POST /api/v1/analytics/daily/:date/finalize` intentionally returns `404`.

Schedule an internal application job after the shop's Asia/Kolkata closing time
plus a buffer for orders to finish. The job must invoke the existing
`CleanupService.finalizeBusinessDay()` method with the explicit previous IST
business date (`YYYY-MM-DD`), not call the disabled public endpoint and not
perform direct SQL. The runner should bootstrap the existing Nest application,
obtain `CleanupService` from the application context, call the method once, log
the result, and close the context.

The method is transactional and idempotent, so the scheduler may retry transient
database or platform failures with bounded retries. It refuses to finalize a day
that still has `Placed` or `Ready` orders; alert the shopkeeper and retry only
after those orders are resolved. A scheduler job is intentionally not included
in this release because its platform credentials and timing are production
infrastructure choices. Configure it as a protected Render cron job, a managed
job runner, or an equivalent internal scheduler only after the runner is
reviewed. See `DAILY_ANALYTICS.md` for the retention lifecycle.

## Smoke-test checklist

Run these checks immediately after a production deployment:

1. Open `https://<api-host>/api/v1/health`; it returns HTTP 200 with
   `success: true` and `data.status: "ok"`.
2. Confirm the Render service is healthy and its startup log reports the expected
   number of allowed frontend origins.
3. Open the Vercel storefront. Confirm products and a known public storage image
   load through the production API.
4. In a browser, log in as the seeded administrator. Confirm an authenticated
   admin API request succeeds, the session cookie is `Secure` and `HttpOnly`,
   then confirm logout invalidates the session.
5. From an unapproved browser origin, confirm credentialed admin requests are
   blocked by CORS. From the configured frontend origin, confirm the preflight
   and request succeed.
6. Create a disposable product, adjust stock, and place a small test order.
   Confirm the order and stock change are correct, then remove only the
   disposable product through the supported application workflow.
7. Verify `npm run prisma:migrate:status` reports no pending migrations and that
   the initial administrator record exists.
8. Trigger the scheduler only in a controlled test window with a known completed
   business date; verify its aggregate and idempotent retry behavior before
   relying on it nightly.

## Rollback

1. Stop traffic or enable maintenance controls if an incident risks data
   integrity.
2. Roll back the Vercel project to the previous known-good deployment and the
   Render service to its previous known-good deploy.
3. Check the API health endpoint, application logs, login flow, and core order
   workflow before restoring traffic.
4. Database migrations are forward-only by default. Never revert a migration or
   restore a database solely to match an older application deploy without a
   tested recovery plan. Prefer a reviewed forward-fix migration.
5. If database recovery is necessary, take a final backup, restore to a separate
   instance first, verify migration state and data integrity, then follow the
   database provider's approved cutover procedure.

## Pre-release verification

From the respective directories, run:

```bash
# backend
npm ci
npm run lint
npm run build

# frontend
npm ci
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1 npm run build
```

The frontend build must use a non-local production API URL. The backend build
does not need a database connection; startup, migration, and seed commands do.

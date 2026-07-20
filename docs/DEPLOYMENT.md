\# Deployment



\## Purpose



This document describes how to run, configure, and deploy the Hostel Snack Store application.



\---



\# Environment



The application consists of:



\- Frontend

\- Backend

\- PostgreSQL Database

\- Object Storage



Each component can be deployed independently.



\---



\# Environment Variables



The application requires the following environment variables.



\## Backend



| Variable | Description |

|----------|-------------|

| DATABASE\_URL | PostgreSQL connection string |

| JWT\_SECRET | Authentication secret |
| ADMIN\_NAME | Initial administrator display name; used only by the seed |
| ADMIN\_EMAIL | Initial administrator login email; used only by the seed |
| ADMIN\_PASSWORD | Initial administrator password; used only by the seed |

| STORAGE\_BUCKET | Product image storage bucket |

| STORAGE\_ENDPOINT | Object storage endpoint |

| STORAGE\_ACCESS\_KEY | Storage access key |

| STORAGE\_SECRET\_KEY | Storage secret |

| PORT | Backend server port |



\---



\## Frontend



| Variable | Description |

|----------|-------------|

| API\_BASE\_URL | Backend API URL |



\---



\# Local Development



\## Prerequisites



Install:



\- Node.js

\- PostgreSQL

\- Package manager (npm, pnpm, or yarn)



\---



\## Setup



\### 1. Clone repository



```bash

git clone <repository-url>

```



\---



\### 2. Install dependencies



Frontend



```bash

npm install

```



Backend



```bash

npm install

```



\---



\### 3. Configure environment variables



Create:



```

.env

```



Populate required variables.



\---



\### 4. Start database



Ensure PostgreSQL is running.



\---



\### 5. Run database migrations



```bash

npm run migrate

```



\---



\### 6. Start backend



```bash

npm run dev

```



\---



\### 7. Start frontend



```bash

npm run dev

```



\---



\# Production Deployment



\## Frontend



Recommended deployment platforms:



\- Vercel

\- Netlify



Requirements:



\- Configure environment variables.

\- Connect to the production backend.



\---



\## Backend



Recommended deployment platforms:



\- Railway

\- Render

\- Fly.io

\- VPS



Requirements:



\- Production environment variables

\- HTTPS enabled

\- Database connectivity
\- `JWT_SECRET` set to a cryptographically secure value of at least 32 characters
\- `FRONTEND_URL` set to the Vercel origin (comma-separate origins only when preview deployments need access)
\- Run `npx prisma migrate deploy` and `npx prisma db seed` once after setting the `ADMIN_*` variables

The frontend and backend are separate origins in production. The backend enables credentialed CORS for `FRONTEND_URL`, and production sessions use `Secure; HttpOnly; SameSite=None` cookies. Local HTTP development uses the same configuration with a non-Secure, `SameSite=Lax` cookie.



\---



\## Database



Recommended:



\- Managed PostgreSQL



Examples:



\- Supabase

\- Railway

\- Neon



Regular backups should be enabled.



\---



\## Object Storage



Recommended:



\- Supabase Storage

\- Cloudflare R2

\- Amazon S3



The database should store only image URLs.



\---



\# Build Process



Frontend



```bash

npm run build

```



Backend



```bash

npm run build

```



Verify both builds complete successfully before deployment.



\---



\# Database Migrations



Whenever the schema changes:



1\. Generate migration.

2\. Review migration.

3\. Apply migration.

4\. Verify application functionality.



Never modify the production database manually.



\---



\# Backups



Regular database backups are recommended.



Backups should include:



\- Products

\- Orders

\- Order Items

\- Settings



Object storage should be backed up separately.



\---



\# Monitoring



Monitor:



\- API availability

\- Database health

\- Storage availability

\- Error logs



Critical issues should be investigated promptly.



\---



\# Release Checklist



Before deploying a new version:



\- All tests pass.

\- Database migrations are ready.

\- Environment variables are configured.

\- Production build succeeds.

\- Core workflows are verified.

\- No critical bugs remain.



\---



\# Rollback Strategy



If deployment fails:



1\. Roll back the application.

2\. Restore the previous deployment.

3\. Investigate the issue.

4\. Redeploy after verification.



Database rollbacks should be performed only when necessary and with appropriate backups.



\---



\# Deployment Summary



A successful deployment should result in:



\- Frontend accessible to users

\- Backend responding correctly

\- Database connected

\- Product images loading

\- Core workflows functioning as expected


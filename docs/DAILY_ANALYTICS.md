\# Daily Analytics and Order Retention

\## Purpose

Daily analytics preserve the long-term business record without retaining customer or order detail after a business day is closed.

\## Lifecycle

1\. The shopkeeper completes every order for a business day.
2\. A scheduler or the development-only manual endpoint requests finalization for that explicit `YYYY-MM-DD` date.
3\. In one database transaction, the backend reads the day's immutable completed-order and order-item snapshots, creates the unique daily aggregate, then deletes that day's order items and orders.
4\. The permanent `DailyAnalytics` record remains available. Customer names, order IDs, product-line detail, and all other order detail are removed.

The target date uses the Asia/Kolkata (IST) calendar-day range `[00:00, 24:00)`. For example, finalizing `2026-07-20` aggregates orders created from `2026-07-19T18:30:00.000Z` through `2026-07-20T18:30:00.000Z`. The `YYYY-MM-DD` API date remains unchanged.

\## DailyAnalytics fields

Each business date has exactly one record containing total orders, revenue, cost, profit, average order value, best-selling product, total items sold, and creation time. Revenue, cost, and profit use immutable order totals; item count and best seller use immutable order-item snapshots. Current product values are never consulted.

An empty finalized day is recorded with zero monetary and count values and no best-selling product. Ties for best seller are resolved alphabetically to keep the result deterministic.

\## Retention policy

Detailed orders are operational data for the current business day only. After successful finalization, the application retains only the aggregate record for the date. It does not retain historical customer names, order IDs, or purchased-item detail.

Finalization refuses to run if any order in the target date is still `Placed` or `Ready`; this prevents accidentally deleting unfinished operational work. It is idempotent: subsequent runs return the existing analytics record and delete nothing.

\## Cleanup and scheduler integration

`CleanupService.finalizeBusinessDay(date)` is scheduler-ready and has no startup side effects. A production scheduler should call this service after the business day closes, with an explicit date, and retry transient failures safely. No cron job is included in Phase 7A.

For development, authenticated administrators can call `POST /api/v1/analytics/daily/:date/finalize`. The endpoint is unavailable when `NODE_ENV=production`; production scheduling should invoke the service through an application job runner rather than expose the manual endpoint.

`GET /api/v1/analytics/daily/:date` returns the permanent aggregate for verification and future dashboard use.

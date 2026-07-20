# System Architecture

## Purpose

This document describes the high-level architecture of the Hostel Snack Store application.

It defines the responsibilities of each system component and how they interact to deliver a reliable, maintainable, and scalable application.

---

# Architecture Principles

The system should prioritize:

- Simplicity
- Reliability
- Maintainability
- Clear separation of concerns

The backend is the source of truth for all business logic and inventory operations.

---

# High-Level Architecture

```
                    Browser
                       │
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │    Frontend     │
              │    React App    │
              └─────────────────┘
                       │
                  REST API
                       │
                       ▼
              ┌─────────────────┐
              │     Backend     │
              │   API Server    │
              └─────────────────┘
                 │           │
                 │           │
                 ▼           ▼
        PostgreSQL      Object Storage
         Database      Product Images
```

---

# System Components

## Frontend

Responsible for:

- Rendering the user interface
- Managing page navigation
- Collecting user input
- Calling backend APIs
- Displaying loading and error states

The frontend should never:

- Modify inventory directly
- Calculate analytics
- Enforce business rules
- Trust client-side validation

---

## Backend

The backend is responsible for:

- Authentication
- Product management
- Order management
- Inventory management
- Store scheduling
- Analytics
- Validation
- Business rule enforcement

The backend is the only component allowed to modify business data.

---

## Database

Stores:

- Products
- Orders
- Order Items
- Daily Analytics
- Settings

Responsibilities:

- Persistent storage
- Transaction support
- Historical accuracy
- Data integrity

---

## Object Storage

Stores product images.

The database stores only image URLs.

Benefits:

- Smaller database
- Faster backups
- Easier image replacement

---

# Data Flow

## Product Management

```
Admin

↓

Frontend

↓

Backend Validation

↓

Database

↓

Response

↓

UI Update
```

---

## Customer Order

```
Customer

↓

Frontend

↓

Backend

↓

Validate Store Status

↓

Validate Inventory

↓

Begin Transaction

↓

Create Order

↓

Create Order Items

↓

Update Inventory

↓

Commit Transaction

↓

Return Success
```

If any step fails, the transaction is rolled back.

---

## Analytics

```
Completed order snapshots

↓

Transactional aggregation

↓

DailyAnalytics record

↓

Delete finalized orders and order items

↓

Future dashboard response
```

Analytics are generated from immutable transaction snapshots. Daily finalization
creates the aggregate and removes detailed orders in one database transaction;
no cleanup runs during application startup. See `DAILY_ANALYTICS.md` for the
retention lifecycle and scheduler integration contract.

No analytics values are manually maintained.

## Operational dashboard

```
Dashboard request

↓

Dashboard service

↓

Current IST orders + active orders + inventory + store status

↓

Single operational response
```

The dashboard is a read-only aggregate of existing operational data. It uses
today's IST order records for total-order and active-order counts, immutable
completed-order snapshots for revenue and profit, current inventory for stock
alerts, and the existing store-status service for availability. It adds no
dashboard persistence and makes one initial API request.

---

# Store Scheduling

The backend manages store availability.

Automatic scheduling:

- Opens the store at the configured opening time.
- Closes the store at the configured closing time.

Manual overrides temporarily replace the automatic schedule.

The frontend only displays the current effective status.

---

# Inventory Management

Inventory updates must be transactional.

The backend guarantees:

- No negative stock
- No overselling
- Atomic updates

When two customers attempt to purchase the last available item:

- One transaction succeeds.
- One transaction fails.

---

# Business Logic

Business rules belong exclusively in the backend.

Examples:

- Store availability
- Inventory validation
- Order workflow
- Low-stock detection
- Profit calculations

The frontend should never duplicate business logic.

---

# Error Handling

The backend returns standardized error responses.

Examples:

| Scenario | Response |
|----------|----------|
| Store closed | 403 Forbidden |
| Product not found | 404 Not Found |
| Product archived | 409 Conflict |
| Out of stock | 409 Conflict |
| Invalid input | 400 Bad Request |
| Unauthorized | 401 Unauthorized |
| Internal error | 500 Internal Server Error |

The frontend converts these responses into user-friendly messages.

---

# Security

The backend validates every request.

Protected operations include:

- Product management
- Inventory updates
- Store controls
- Settings changes

Sensitive configuration should never be trusted from the client.

---

# Scalability

Although Version 1 targets a single shopkeeper, the architecture should support future enhancements without major redesign.

Possible future additions:

- Customer accounts
- Online payments
- Push notifications
- Order history
- Multiple shopkeepers

These features should extend the existing architecture rather than replace it.

---

# Separation of Concerns

| Layer | Responsibility |
|--------|----------------|
| Frontend | User interface |
| Backend | Business logic |
| Database | Persistent data |
| Object Storage | Product images |

Each layer should have a single, clearly defined responsibility.

---

# Summary

The architecture is intentionally simple:

- Thin frontend
- Business logic in the backend
- Transactional database
- External image storage

This design minimizes complexity while ensuring reliable inventory management, accurate analytics, and a maintainable codebase.

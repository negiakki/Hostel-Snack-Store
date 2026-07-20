# Business Rules

## Purpose

This document defines the core business rules that govern how the Hostel Snack Store operates.

These rules are implementation-independent and should always remain true regardless of changes to the frontend, backend, or database.

---

# Store Operations

## Store Status

The store has only two states:

- Open
- Closed

When the store is closed:

- Customers cannot place new orders.
- Existing orders can still be completed.
- Products remain visible unless hidden by future product settings.

---

## Operating Hours

The shopkeeper can configure daily operating hours.

The system should:

- Automatically open the store at the configured opening time.
- Automatically close the store at the configured closing time.

The shopkeeper may manually override the current status at any time.

Manual overrides affect only the current session and do not modify the configured schedule.

---

# Orders

## Order Lifecycle

Every order follows the same workflow:

Placed

↓

Ready

↓

Completed

Orders cannot skip or move backward between statuses.

Completed orders are considered final.

---

## Order Creation

Customers may place orders only when:

- The store is open.
- Every requested product has sufficient stock.

If any product is unavailable, the order must be rejected.

Partial fulfillment is not supported.

---

# Inventory

## Stock Validation

Stock availability must always be verified by the server during checkout.

Frontend validation alone is not sufficient.

---

## Stock Updates

Inventory is automatically reduced after a successful order placement.

The update must be atomic to prevent overselling.

If multiple customers attempt to purchase the last available unit:

- Only one purchase succeeds.
- Remaining customers receive an out-of-stock response.

---

## Restocking

Restocking changes only the available stock quantity.

It does not modify:

- Selling price
- Cost price
- Product information

---

# Products

## Product Information

Each product contains:

- Name
- Category
- Image
- Selling price
- Cost price
- Current stock

---

## Product Availability

Products may be archived.

Archived products:

- Cannot be ordered.
- Do not appear in the customer storefront.
- Remain available in historical orders.

---

## Price Changes

Product prices may be updated at any time.

Price changes affect only future orders.

Historical orders must always retain the prices that were effective when the order was placed.

---

# Revenue & Profit

Revenue is calculated automatically from completed orders.

Profit is calculated using:

Revenue − Cost of Goods Sold

Manual profit adjustments are not supported.

---

# Analytics

Analytics are generated entirely from stored order data.

Users should never manually edit analytics.

Deleting or modifying historical order data may affect reported metrics.

---

# Low Stock

The system monitors product stock levels.

A product is considered low stock when:

Current Stock ≤ Low Stock Threshold

The threshold is configurable in Settings.

---

# Settings

Settings store application preferences only.

Examples include:

- Operating hours
- Low-stock threshold
- Appearance
- Notifications

Changing settings should not modify historical business data.

---

# Data Integrity

Historical records must remain accurate.

Specifically:

- Historical orders retain their original prices.
- Historical orders retain product names even if products are renamed later.
- Archived products remain accessible from previous orders.
- Analytics are derived from historical order data.

Business data should never be rewritten in a way that changes past transactions.

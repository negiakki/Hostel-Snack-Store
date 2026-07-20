# Product Requirements Document (PRD)

## Project

Hostel Snack Store

---

# Overview

Hostel Snack Store is a lightweight web application that helps a student run a small night-time snack store from their hostel room.

Instead of managing sales manually through chats or spreadsheets, the application provides a simple interface for managing products, orders, inventory, and business performance.

The product is intentionally designed for a single shopkeeper rather than a business with employees, branches, or warehouse operations.

---

# Problem Statement

Students often become hungry late at night when nearby stores are closed.

Running a hostel snack shop manually creates several problems:

- Orders arrive through multiple chats.
- Inventory is difficult to track.
- Products sell out without accurate stock updates.
- Revenue and profit require manual calculation.
- Customers don't know whether the store is currently open.

The shopkeeper spends unnecessary time managing the store instead of fulfilling orders.

---

# Vision

Provide the simplest possible software that allows one student to efficiently operate a hostel snack store during a few hours each night.

The application should automate repetitive work so the shopkeeper can focus on fulfilling orders.

---

# Goals

The application should allow the shopkeeper to:

- Open and close the store.
- Manage products and inventory.
- Receive customer orders.
- Track order progress.
- Automatically calculate revenue and profit.
- View business performance through simple analytics.

---

# Non-Goals

The following are intentionally excluded from Version 1:

- Multi-vendor support
- Multiple employees
- Warehouse management
- Supplier management
- Purchase orders
- Customer loyalty programs
- Coupons and discounts
- Delivery route optimization
- Complex accounting
- Multiple store locations
- Offline POS functionality

---

# Target Users

## Primary User

The shopkeeper.

A student running a snack store from their hostel room.

This user performs all administrative tasks.

---

## Secondary Users

Customers.

Students living in the hostel who browse products and place orders during store hours.

---

# Core Features

## Store Management

- Open/close store
- Automatic operating schedule
- Manual override

---

## Product Management

- Add products
- Edit products
- Archive products
- Update prices
- Restock inventory
- Product images
- Product categories

---

## Order Management

- Receive customer orders
- Update order status

Workflow:

Placed

↓

Ready

↓

Completed

---

## Inventory

Automatic stock management.

Inventory is reduced only after successful order placement.

Out-of-stock products cannot be purchased.

---

## Analytics

Automatically generated metrics including:

- Revenue
- Profit
- Orders
- Best-selling products
- Low-stock products

---

# Success Criteria

The shopkeeper should be able to complete all nightly operations without using external tools such as spreadsheets or calculators.

Common daily tasks should require only a few clicks.

---

# Product Principles

The application should always prioritize:

- Simplicity
- Speed
- Automation
- Accuracy
- Mobile-friendly operation

Whenever a new feature is considered, ask:

> "Would this genuinely make running tonight's shop easier?"

If not, it should be postponed or rejected.

---

# Version Scope

## Version 1

- Single shopkeeper
- Customer ordering
- Product management
- Inventory tracking
- Order management
- Analytics
- Configurable operating hours

---

## Future Versions

Possible future enhancements include:

- Online payments
- Customer accounts
- Delivery tracking
- Multiple shopkeepers
- Supplier management
- Promotions
- Sales forecasting
- Demand prediction

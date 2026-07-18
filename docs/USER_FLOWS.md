\# User Flows



\*\*Project:\*\* Hostel Snack Store

\*\*Version:\*\* 1.0

\*\*Status:\*\* Active

\*\*Last Updated:\*\* 18 July 2026



\---



\# Purpose



This document describes how users move through the application to complete common tasks.



It focuses on the user journey rather than UI layout or implementation details.



\---



\# Customer Flows



\## UF-001 Browse Products



```

Landing Page

&#x20;     │

&#x20;     ▼

Browse Products

&#x20;     │

&#x20;     ├── Search Products

&#x20;     │

&#x20;     ├── Filter by Category

&#x20;     │

&#x20;     ▼

View Product

&#x20;     │

&#x20;     ▼

Add to Cart

```



\*\*End Result\*\*



\* Product added to cart successfully.



\---



\## UF-002 Manage Cart



```

Cart

&#x20;│

&#x20;├── Increase Quantity

&#x20;│

&#x20;├── Decrease Quantity

&#x20;│

&#x20;├── Remove Item

&#x20;│

&#x20;▼

Checkout

```



\*\*Validation\*\*



\* Quantity cannot exceed available stock.



\---



\## UF-003 Checkout (Delivery Enabled)



```

Checkout

&#x20;     │

&#x20;     ▼

Enter Name

&#x20;     │

&#x20;     ▼

Enter Room Number

&#x20;     │

&#x20;     ▼

Choose Delivery Method

&#x20;     │

&#x20;     ├── Pickup

&#x20;     │

&#x20;     └── Room Delivery

&#x20;     │

&#x20;     ▼

(Optional)

Delivery Instructions

&#x20;     │

&#x20;     ▼

Review Order

&#x20;     │

&#x20;     ▼

Place Order

&#x20;     │

&#x20;     ▼

Order Confirmation

```



\---



\## UF-004 Checkout (Pickup Only)



```

Checkout

&#x20;     │

&#x20;     ▼

Enter Name

&#x20;     │

&#x20;     ▼

Enter Room Number

&#x20;     │

&#x20;     ▼

Pickup (Pre-selected)

&#x20;     │

&#x20;     ▼

Review Order

&#x20;     │

&#x20;     ▼

Place Order

```



The customer is informed that room delivery is temporarily unavailable.



\---



\## UF-005 Track Order



```

Order Confirmation

&#x20;       │

&#x20;       ▼

Order Tracking

&#x20;       │

&#x20;       ▼

Placed

&#x20;       │

&#x20;       ▼

Accepted

&#x20;       │

&#x20;       ▼

Preparing

&#x20;       │

&#x20;       ▼

Ready

&#x20;       │

&#x20;       ▼

Delivered

```



Status updates occur automatically in real time.



\---



\## UF-006 Pickup Order



```

Customer Arrives

&#x20;       │

&#x20;       ▼

Shows Order ID

&#x20;       │

&#x20;       ▼

Admin Verifies Order

&#x20;       │

&#x20;       ▼

Receive Products

```



\---



\## UF-007 Room Delivery



```

Customer Waits

&#x20;       │

&#x20;       ▼

Admin Delivers Order

&#x20;       │

&#x20;       ▼

Order Marked Delivered

```



\---



\# Admin Flows



\## UF-008 Login



```

Admin Login

&#x20;     │

&#x20;     ▼

Authentication

&#x20;     │

&#x20;     ▼

Dashboard

```



Invalid credentials return the user to the login page.



\---



\## UF-009 Dashboard Navigation



```

Dashboard

&#x20;│

&#x20;├── Orders

&#x20;├── Products

&#x20;├── Inventory

&#x20;├── Analytics

&#x20;└── Operations

```



\---



\## UF-010 Add Product



```

Products

&#x20;     │

&#x20;     ▼

Add Product

&#x20;     │

&#x20;     ▼

Upload Image

&#x20;     │

&#x20;     ▼

Enter Product Details

&#x20;     │

&#x20;     ▼

Save Product

```



\---



\## UF-011 Edit Product



```

Products

&#x20;     │

&#x20;     ▼

Select Product

&#x20;     │

&#x20;     ▼

Edit Details

&#x20;     │

&#x20;     ▼

Save Changes

```



\---



\## UF-012 Restock Inventory



```

Inventory

&#x20;     │

&#x20;     ▼

Select Product

&#x20;     │

&#x20;     ▼

Enter Quantity

&#x20;     │

&#x20;     ▼

Confirm Restock

&#x20;     │

&#x20;     ▼

Inventory Updated

```



Inventory history is recorded automatically.



\---



\## UF-013 Manage Operations



```

Dashboard

&#x20;     │

&#x20;     ▼

Operations

&#x20;     │

&#x20;     ├── Change Store Status

&#x20;     │

&#x20;     │      ├── Open

&#x20;     │      ├── Busy

&#x20;     │      └── Closed

&#x20;     │

&#x20;     └── Delivery Availability

&#x20;            ├── Enabled

&#x20;            └── Pickup Only

```



Changes take effect immediately for new customers.



\---



\## UF-014 Process New Order



```

Realtime Notification

&#x20;       │

&#x20;       ▼

Open Order

&#x20;       │

&#x20;       ▼

Review Details

&#x20;       │

&#x20;       ▼

Accept Order

```



\---



\## UF-015 Prepare Order



```

Accepted

&#x20;    │

&#x20;    ▼

Collect Items

&#x20;    │

&#x20;    ▼

Verify Items

&#x20;    │

&#x20;    ▼

Pack Order

&#x20;    │

&#x20;    ▼

Mark Ready

```



\---



\## UF-016 Complete Order



\### Pickup



```

Ready

&#x20;  │

&#x20;  ▼

Customer Arrives

&#x20;  │

&#x20;  ▼

Verify Order ID

&#x20;  │

&#x20;  ▼

Mark Delivered

```



\### Delivery



```

Ready

&#x20;  │

&#x20;  ▼

Deliver to Room

&#x20;  │

&#x20;  ▼

Mark Delivered

```



\---



\# System Flows



\## UF-017 Order Creation



```

Customer Places Order

&#x20;         │

&#x20;         ▼

Validate Request

&#x20;         │

&#x20;         ▼

Check Store Status

&#x20;         │

&#x20;         ▼

Check Delivery Availability

&#x20;         │

&#x20;         ▼

Validate Inventory

&#x20;         │

&#x20;         ▼

Create Order

&#x20;         │

&#x20;         ▼

Deduct Stock

&#x20;         │

&#x20;         ▼

Generate Order ID

&#x20;         │

&#x20;         ▼

Commit Transaction

```



If any validation fails, the transaction is rolled back.



\---



\## UF-018 Realtime Updates



```

Admin Changes Order Status

&#x20;           │

&#x20;           ▼

Database Updated

&#x20;           │

&#x20;           ▼

Supabase Realtime

&#x20;           │

&#x20;           ├── Customer Tracking Updates

&#x20;           └── Admin Dashboard Updates

```



\---



\# Exception Flows



\## EX-001 Store Closed



```

Customer Visits Site

&#x20;       │

&#x20;       ▼

Browse Products

&#x20;       │

&#x20;       ▼

Attempts Checkout

&#x20;       │

&#x20;       ▼

Checkout Blocked

```



\---



\## EX-002 Product Out of Stock



```

Customer Opens Cart

&#x20;       │

&#x20;       ▼

Checkout Validation

&#x20;       │

&#x20;       ▼

Stock Changed

&#x20;       │

&#x20;       ▼

Display Error

&#x20;       │

&#x20;       ▼

Return to Cart

```



\---



\## EX-003 Delivery Disabled During Checkout



```

Customer Selects Delivery

&#x20;       │

&#x20;       ▼

Admin Disables Delivery

&#x20;       │

&#x20;       ▼

Customer Places Order

&#x20;       │

&#x20;       ▼

Checkout Validation Fails

&#x20;       │

&#x20;       ▼

Prompt Customer to Switch to Pickup

```



\---



\## EX-004 Network Failure



```

Place Order

&#x20;     │

&#x20;     ▼

Request Fails

&#x20;     │

&#x20;     ▼

Display Error

&#x20;     │

&#x20;     ▼

Retry

```



The system must prevent duplicate orders.



\---



\# Navigation Summary



\## Customer



```

Home

&#x20;│

&#x20;├── Product Details

&#x20;├── Cart

&#x20;├── Checkout

&#x20;├── Order Confirmation

&#x20;└── Track Order

```



\---



\## Admin



```

Login

&#x20;│

&#x20;└── Dashboard

&#x20;     │

&#x20;     ├── Orders

&#x20;     ├── Products

&#x20;     ├── Inventory

&#x20;     ├── Analytics

&#x20;     └── Operations

```



\---



\# Guiding Principles



\* Minimize the number of steps required to place an order.

\* Validate business rules before creating an order.

\* Keep customers informed with realtime updates.

\* Allow the admin to control operations without interrupting active orders.

\* Every flow should have a clear success path and a defined failure path.




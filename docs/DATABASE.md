\# Database Design



\## Purpose



This document defines the database schema for the Hostel Snack Store.



The schema is designed for a single-shopkeeper application while ensuring inventory consistency, historical accuracy, and straightforward analytics.



\---



\# Design Principles



The database should prioritize:



\- Simplicity

\- Data integrity

\- Historical accuracy

\- Minimal redundancy

\- Efficient querying



Business metrics should be derived from transaction data whenever practical.



\---



\# Entities



The application consists of the following entities:



\- Products

\- Orders

\- Order Items

\- Settings



\---



\# Admin Users

`AdminUser` stores the single shopkeeper's authentication record.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Display name shown in the admin shell |
| email | String | Unique login email |
| password_hash | String | bcrypt hash; plaintext passwords are never stored |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last modification time |

The initial administrator is created only by the idempotent Prisma seed. Runtime authentication always reads this record from PostgreSQL.

\---

\# Products



Represents every product available in the store.



\## Fields



| Field | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| name | String | Product name |

| category | String | Product category |

| image\_url | String | Product image URL |

| selling\_price | Decimal | Current selling price |

| cost\_price | Decimal | Current cost price |

| stock | Integer | Current available stock |

| is\_archived | Boolean | Whether the product is hidden from customers |

| archived\_at | Timestamp (Nullable) | Archive timestamp |

| created\_at | Timestamp | Creation time |

| updated\_at | Timestamp | Last modification |



\---



\# Orders



Represents a customer order.



\## Fields



| Field | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| customer\_name | String | Customer name |

| total\_amount | Decimal | Total selling price |

| total\_cost | Decimal | Total cost of goods |

| total\_profit | Decimal | Total profit |

| status | Enum | Placed, Preparing, Delivered |

| created\_at | Timestamp | Order creation time |

| updated\_at | Timestamp | Last status update |



\---



\# Order Items



Represents individual products within an order.



Historical product information is stored here to preserve past transactions.



\## Fields



| Field | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| order\_id | UUID | Parent order |

| product\_id | UUID | Original product reference |

| product\_name | String | Snapshot of product name |

| selling\_price | Decimal | Snapshot of selling price |

| cost\_price | Decimal | Snapshot of cost price |

| quantity | Integer | Quantity purchased |

| subtotal | Decimal | Selling price × quantity |



\---



\# Settings



Stores application and store configuration.



Only one record exists.



\## Store Settings



| Field | Type | Description |

|--------|------|-------------|

| opening\_time | Time | Daily opening time |

| closing\_time | Time | Daily closing time |

| auto\_schedule\_enabled | Boolean | Enable automatic scheduling |

| manual\_override | Enum (Nullable) | Open, Closed, NULL (follow schedule) |



\---



\## Application Settings



| Field | Type | Description |

|--------|------|-------------|

| low\_stock\_threshold | Integer | Low-stock alert threshold |

| notifications\_enabled | Boolean | Enable notifications |

| theme | Enum | Light, Dark, System |



\---



\## Metadata



| Field | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| created\_at | Timestamp | Creation time |

| updated\_at | Timestamp | Last modification |



\---



\# Relationships



```

Products

&#x20;   │

&#x20;   │

&#x20;   ▼

Order Items

&#x20;   ▲

&#x20;   │

&#x20;   │

Orders



Settings

```



Relationship summary:



\- One Order contains many Order Items.

\- One Product can appear in many Order Items.

\- Settings is independent.



\---



\# Historical Data



Historical transaction data must never change.



Each Order Item stores snapshots of:



\- Product name

\- Selling price

\- Cost price



This ensures:



\- Price changes affect only future orders.

\- Product renames do not alter previous orders.

\- Analytics remain historically accurate.



Order Items become immutable after creation.



\---



\# Inventory



Current inventory is stored only in the Products table.



Inventory changes occur only when:



\- A customer successfully places an order.

\- The shopkeeper manually restocks inventory.



Inventory updates must occur within a single database transaction.



\---



\# Derived Data



The following metrics are calculated from stored data:



\- Revenue

\- Profit reports

\- Best-selling products

\- Products sold

\- Low-stock products



The following values are intentionally stored because they represent historical transactions:



\- Order total

\- Order cost

\- Order profit



\---



\# Indexes



\## Products



\- name

\- category

\- is\_archived



\---



\## Orders



\- created\_at

\- status



\---



\## Order Items



\- order\_id

\- product\_id



\---



\# Constraints



\## Products



\- Stock ≥ 0

\- Selling price ≥ 0

\- Cost price ≥ 0



\---



\## Orders



Status must be one of:



\- Placed

\- Preparing

\- Delivered



\---



\## Order Items



\- Quantity > 0

\- Product name is immutable

\- Selling price is immutable

\- Cost price is immutable



\---



\# Transactions



The following operations must execute atomically:



Customer Checkout



1\. Validate the store is open.

2\. Validate inventory availability.

3\. Create the order.

4\. Create order items.

5\. Deduct inventory.

6\. Commit the transaction.



If any step fails, the entire transaction must be rolled back.



\---



\# Data Integrity



The database must guarantee:



\- Inventory never becomes negative.

\- Historical orders remain unchanged.

\- Archived products remain accessible from previous orders.

\- Every Order contains at least one Order Item.

\- Every Order Item belongs to exactly one Order.

\- Every Order Item references one Product.


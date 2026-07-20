\# API Specification



\## Purpose



This document defines the REST API contract between the frontend and backend for the Hostel Snack Store.



All communication occurs over HTTPS using JSON.



\---



\# API Principles



The API should be:



\- RESTful

\- Stateless

\- Versioned

\- JSON-based

\- Consistent and predictable



\---



\# Base URL



```

/api/v1

```



\---



\# Authentication



Endpoints are classified as:



\- \*\*Public\*\* – Accessible without authentication.

\- \*\*Admin\*\* – Requires authentication.



\---



Admin authentication uses a short-lived JWT in a Secure, HttpOnly cookie. Browser clients must send `credentials: "include"` for admin requests. The cookie is never returned in a JSON response.

\## POST /auth/login

\*\*Access:\*\* Public

Validates the seeded administrator's email and bcrypt password, then sets the session cookie.

\## POST /auth/logout

\*\*Access:\*\* Public

Clears the session cookie.

\## GET /auth/session

\*\*Access:\*\* Admin

Returns the authenticated administrator's id, name, and email for the admin shell.

\## GET /admin/products

\*\*Access:\*\* Admin

Returns the admin product list, including archived products when `archived=true`. Public `GET /products` remains limited to the customer catalog.

\---

\# Standard Response Format



\## Success



```json

{

&#x20; "success": true,

&#x20; "data": {}

}

```



\---



\## Error



```json

{

&#x20; "success": false,

&#x20; "message": "Human-readable error message"

}

```



\---



\# Products



\## GET /products



\*\*Access:\*\* Public



Returns all active, non-archived products.

Each product includes backend-derived `isLowStock` and `isOutOfStock` status
flags. The response does not expose the low-stock threshold.



\### Query Parameters



| Parameter | Description |

|-----------|-------------|

| search | Search by product name |

| category | Filter by category |



\---



\## GET /products/:id



\*\*Access:\*\* Public



Returns a single product.



\---



\## POST /products



\*\*Access:\*\* Admin



Creates a new product.



\### Request Body



```json

{

&#x20; "name": "Lays Classic",

&#x20; "category": "Chips",

&#x20; "sellingPrice": 20,

&#x20; "costPrice": 15,

&#x20; "stock": 25,

&#x20; "imageUrl": "..."

}

```



\---



\## PUT /products/:id



\*\*Access:\*\* Admin



Updates product information.



\---



\## Inventory Operations



\*\*Access:\*\* Admin



Inventory operations are separate from Product CRUD. Product creation may include an initial `stock` value; otherwise it defaults to `0`.

\### GET /inventory/products

Returns active products in name order with backend-derived `isLowStock` and `isOutOfStock` values.

\### POST /inventory/products/:id/add-stock

Adds a positive quantity to a product's current stock.

\### POST /inventory/products/:id/remove-stock

Removes a positive quantity when enough stock is available. A request that would make stock negative returns `409 Conflict`.

\### PUT /inventory/products/:id/stock

Sets the stock to an exact non-negative integer for manual correction.

Set-stock requests use `{ "stock": 25 }`; add-stock and remove-stock use the quantity body below.



\### Request Body



```json

{

&#x20; "quantity": 20

}

```



\---



\## PATCH /products/:id/archive



\*\*Access:\*\* Admin



Archives a product.



\---



\# Orders



\## GET /orders



\*\*Access:\*\* Admin



Returns all orders sorted newest first. Each order includes its customer name,
item count, snapshot total, status, and creation timestamp.



\---



\## GET /orders/:id



\*\*Access:\*\* Admin



Returns an immutable order snapshot, including the purchased item names,
quantities, unit prices, and line totals.



\---



\## POST /orders



\*\*Access:\*\* Public



Creates a customer order.



\### Request Body



```json

{

&#x20; "customerName": "Akshat",

&#x20; "items": \[

&#x20;   {

&#x20;     "productId": "...",

&#x20;     "quantity": 2

&#x20;   }

&#x20; ]

}

```



The backend validates:



\- Store is open.

\- Products exist.

\- Products are not archived.

\- Inventory is available.

Only `customerName`, `productId`, and `quantity` are accepted. The server loads
current product data, calculates totals, creates immutable product and price
snapshots, and deducts inventory atomically.

\### Response (201 Created)

```json

{

  "success": true,

  "data": {

    "orderId": "...",

    "status": "Placed",

    "total": 40,

    "createdAt": "2026-07-19T18:30:00.000Z"

  }

}

```

Order creation returns `403` when the store is closed, `404` when a product
does not exist, `409` for archived products or insufficient stock, and `400`
for an invalid request body.



\---



\## PATCH /orders/:id/status



\*\*Access:\*\* Admin



Updates order status.



\### Request Body



```json

{

&#x20; "status": "Ready"

}

```



Allowed values:



\- Placed

\- Ready

\- Completed

Only forward transitions are accepted: Placed → Ready → Completed. Completed
orders are final and return `409` for any attempted status change.



\---



\# Store



\## GET /store



\*\*Access:\*\* Public



Returns:



\- Current effective status

\- Opening time

\- Closing time

\- Automatic scheduling status



\---



\## PATCH /store



\*\*Access:\*\* Admin



Updates:



\- Opening time

\- Closing time

\- Automatic scheduling



\---



\## PATCH /store/override



\*\*Access:\*\* Admin



Temporarily overrides the automatic schedule.



\### Request Body



```json

{

&#x20; "status": "Open"

}

```



Allowed values:



\- Open

\- Closed

\- null (follow automatic schedule)



\---



\# Analytics



\## GET /analytics



\*\*Access:\*\* Admin



Returns dashboard metrics including:



\- Revenue

\- Profit

\- Orders

\- Products sold

\- Best-selling products

\- Low-stock products



\---



\# Settings



\## GET /settings



\*\*Access:\*\* Admin



Returns application preferences.



\---



\## PATCH /settings



\*\*Access:\*\* Admin



Updates:



\- Theme

\- Notifications

\- Low-stock threshold



\---



\# HTTP Status Codes



| Code | Meaning |

|------|---------|

| 200 | Success |

| 201 | Resource created |

| 400 | Invalid request |

| 401 | Unauthorized |

| 403 | Forbidden |

| 404 | Resource not found |

| 409 | Conflict |

| 500 | Internal server error |



\---



\# Common Error Responses



\## Store Closed



```json

{

&#x20; "success": false,

&#x20; "message": "The store is currently closed."

}

```



\---



\## Out of Stock



```json

{

&#x20; "success": false,

&#x20; "message": "Insufficient stock for one or more requested products."

}

```



\---



\## Validation Error



```json

{

&#x20; "success": false,

&#x20; "message": "Invalid request."

}

```



\---



\# Endpoint Permissions



| Endpoint | Public | Admin |

|----------|:------:|:------:|

| GET /products | ✅ | ✅ |

| GET /products/:id | ✅ | ✅ |

| POST /products | ❌ | ✅ |

| PUT /products/:id | ❌ | ✅ |

| GET /inventory/products | ❌ | ✅ |

| POST /inventory/products/:id/add-stock | ❌ | ✅ |
| POST /inventory/products/:id/remove-stock | ❌ | ✅ |
| PUT /inventory/products/:id/stock | ❌ | ✅ |

| PATCH /products/:id/archive | ❌ | ✅ |

| POST /orders | ✅ | ❌ |

| GET /orders | ❌ | ✅ |

| GET /orders/:id | ❌ | ✅ |

| PATCH /orders/:id/status | ❌ | ✅ |

| GET /store | ✅ | ✅ |

| PATCH /store | ❌ | ✅ |

| PATCH /store/override | ❌ | ✅ |

| GET /analytics | ❌ | ✅ |

| GET /settings | ❌ | ✅ |

| PATCH /settings | ❌ | ✅ |



\---



\# Versioning



The API uses URL versioning.



Current version:



```

/api/v1

```



Breaking changes should be introduced through a new API version rather than modifying existing endpoints.



\---



\# API Summary



| Resource | Endpoints |

|----------|-----------|

| Products | GET, POST, PUT, PATCH |

| Orders | GET, POST, PATCH |

| Store | GET, PATCH |

| Analytics | GET |

| Settings | GET, PATCH |


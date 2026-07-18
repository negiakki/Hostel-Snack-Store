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



\## PATCH /products/:id/restock



\*\*Access:\*\* Admin



Adds inventory.



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



Returns all orders.



\### Query Parameters



| Parameter | Description |

|-----------|-------------|

| status | Filter by order status |

| date | Filter by order date |



\---



\## GET /orders/:id



\*\*Access:\*\* Admin



Returns order details.



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



\---



\## PATCH /orders/:id/status



\*\*Access:\*\* Admin



Updates order status.



\### Request Body



```json

{

&#x20; "status": "Preparing"

}

```



Allowed values:



\- Placed

\- Preparing

\- Delivered



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

&#x20; "message": "One or more requested products are out of stock."

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

| PATCH /products/:id/restock | ❌ | ✅ |

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


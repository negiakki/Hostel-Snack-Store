\# Information Architecture



\## Purpose



This document defines the structure of the Hostel Snack Store application.



Each page has a single responsibility. Features should be added only to the page where they naturally belong.



\---



\# Application Structure



```

Admin Dashboard

│

├── Store Status

├── Orders

├── Products

├── Analytics

└── Settings

```



\---



\# Navigation



\## Sidebar



The admin dashboard contains the following navigation items:



\- 🏪 Store Status

\- 📦 Orders

\- 🛍️ Products

\- 📊 Analytics

\- ⚙️ Settings



The sidebar remains consistent across all pages.



\---



\# Page Responsibilities



\## 🏪 Store Status



\### Purpose



Control whether the shop is currently accepting new orders.



\### Responsibilities



\- Display current store status

\- Open store manually

\- Close store manually

\- Configure operating hours

\- Enable or disable automatic scheduling



\### Does Not Include



\- Revenue

\- Orders

\- Product management

\- Analytics



\---



\## 📦 Orders



\### Purpose



Manage customer orders.



\### Responsibilities



\- View incoming orders

\- Update order status

\- Search orders

\- Filter orders



\### Order Workflow



Placed



↓



Ready



↓



Completed



\### Does Not Include



\- Product editing

\- Inventory management

\- Store settings



\---



\## 🛍️ Products



\### Purpose



Manage inventory and product information.



\### Responsibilities



\- View products

\- Add product

\- Edit product

\- Archive product

\- Restock inventory

\- Change prices

\- Search products

\- Filter by category

\- View low-stock indicators



\### Does Not Include



\- Revenue

\- Order management

\- Store scheduling



\---



\## 📊 Analytics



\### Purpose



Provide insights into business performance.



\### Responsibilities



Display automatically calculated metrics including:



\- Revenue

\- Profit

\- Orders

\- Best-selling products

\- Low-stock products



Analytics are read-only.



\### Does Not Include



\- Editing products

\- Updating orders

\- Store controls



\---



\## ⚙️ Settings



\### Purpose



Manage infrequently changed application preferences.



\### Responsibilities



\- Account settings

\- Notifications

\- Appearance

\- Low-stock threshold



\### Does Not Include



\- Product management

\- Analytics

\- Orders



\---



\# Cross-Page Principles



\## Single Responsibility



Each page should focus on one primary task.



Avoid placing unrelated features on the same page.



\---



\## Minimal Navigation



Frequently used actions should require as few clicks as possible.



The shopkeeper should be able to complete nightly operations quickly.



\---



\## Visual Consistency



All pages should follow the same layout and design language.



Examples include:



\- Consistent spacing

\- Shared card styles

\- Common button patterns

\- Unified typography



\---



\## Responsive Design



The application should be fully usable on:



\- Desktop

\- Tablet

\- Mobile



The same information architecture applies across all screen sizes.



\---



\# Primary User Flow



```

Open Store



↓



Receive Orders



↓



Prepare Orders



↓



Deliver Orders



↓



Close Store



↓



Review Analytics

```



This represents the typical nightly workflow of the shopkeeper.


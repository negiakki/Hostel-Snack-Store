\# UI Specification



\## Purpose



This document defines the user interface for the Hostel Snack Store admin dashboard.



It specifies page layouts, reusable UI components, interactions, and responsive behavior. Business logic and backend implementation are documented separately.



\---



\# Design Principles



The interface should feel:



\- Fast

\- Clean

\- Modern

\- Visual

\- Mobile-friendly



Inspired by Blinkit and Zepto, with an emphasis on speed and minimal friction.



Every interface decision should answer:



> "Does this reduce the effort required to run tonight's shop?"



\---



\# Global Layout



```

+--------------------------------------------------------------+

| Header                                                       |

+------------+-------------------------------------------------+

| Sidebar    |                                                 |

|            |                                                 |

|            |                 Page Content                    |

|            |                                                 |

|            |                                                 |

+------------+-------------------------------------------------+

```



\---



\# Header



Present on every page.



\## Contents



\- Application logo/name

\- Current store status indicator

\- Shopkeeper profile menu



\---



\# Sidebar



Visible on desktop.



Contains:



\- 🏪 Store Status

\- 📦 Orders

\- 🛍️ Products

\- 📊 Analytics

\- ⚙️ Settings



The currently active page should always be highlighted.



\---



\# Pages



\## 🏪 Store Status



\### Purpose



Control whether the store is currently accepting new orders.



\### Sections



\#### Store Status Card



Displays:



\- Current status

\- Open / Close button

\- Last updated time



\---



\#### Operating Hours Card



Displays:



\- Opening time

\- Closing time

\- Automatic schedule toggle



Allows editing of operating hours.



\---



\## 📦 Orders



\### Purpose



Manage customer orders.



\### Layout



```

Orders



\---------------------------------



Search



Status Filters



\---------------------------------



Order Cards



Order Cards



Order Cards

```



\### Order Card



Displays:



\- Order ID

\- Customer name

\- Ordered items

\- Total amount

\- Current status

\- Order time



Actions:



\- Mark Ready

\- Mark Completed



\---



\## 🛍️ Products



\### Purpose



Manage products and inventory.



\### Top Bar



Contains:



\- Search

\- Category filter

\- Add Product button



\---



\### Product Grid



Displays products as visual cards.



Each card contains:



\- Product image

\- Product name

\- Category

\- Selling price

\- Current stock

\- Low-stock badge (if applicable)



Quick actions:



\- Edit

\- Restock

\- Archive



\---



\### Add/Edit Product Modal



Fields:



\- Product image

\- Product name

\- Category

\- Selling price

\- Cost price

\- Initial stock



The same modal is reused for editing products.



\---



\## 📊 Analytics



\### Purpose



Display business performance.



Analytics are read-only.



\### Sections



\#### KPI Cards



Display:



\- Revenue

\- Profit

\- Total Orders

\- Products Sold



\---



\#### Best Sellers



Displays products ranked by units sold.



\---



\#### Low Stock



Displays products below the configured threshold.



\---



\#### Revenue Charts



Examples:



\- Daily Revenue

\- Weekly Revenue



Charts should remain simple and easy to understand.



\---



\## ⚙️ Settings



\### Purpose



Manage application preferences.



\### Sections



\#### Account



\- Profile information



\---



\#### Notifications



\- Low-stock alerts

\- Order notifications



\---



\#### Appearance



\- Theme preference



\---



\#### Inventory



\- Low-stock threshold



\---



\# Shared Components



The application should reuse common UI components across pages.



\## Buttons



\### Primary Button



Used for the primary action.



Examples:



\- Add Product

\- Open Store

\- Save Changes



\---



\### Secondary Button



Used for supporting actions.



Examples:



\- Edit

\- Cancel



\---



\### Danger Button



Used for destructive actions.



Examples:



\- Archive Product



\---



\## Product Card



Used on the Products page.



Displays:



\- Image

\- Name

\- Category

\- Price

\- Stock

\- Quick actions



\---



\## Order Card



Used on the Orders page.



Displays:



\- Order summary

\- Status

\- Actions



\---



\## KPI Card



Used on the Analytics page.



Displays a single business metric.



Examples:



\- Revenue

\- Profit

\- Orders



\---



\## Status Badge



Reusable badge representing:



\- Open

\- Closed

\- Placed

\- Ready

\- Completed

\- Low Stock



Status colors should remain consistent throughout the application.



\---



\## Search Bar



Reusable search component for:



\- Products

\- Orders



\---



\## Filter Dropdown



Reusable dropdown used for:



\- Categories

\- Order status



\---



\## Confirmation Dialog



Used before destructive actions.



Examples:



\- Archive Product



\---



\## Toast Notification



Displays temporary feedback after successful or failed actions.



Examples:



\- Product added successfully

\- Store opened

\- Changes saved

\- Failed to update product



\---



\## Loading Skeleton



Displayed while data is loading.



Used instead of blank pages.



\---



\## Empty State



Displayed when no data exists.



Examples:



Orders



> No orders yet.



Products



> No products added.



Analytics



> No sales data available.



\---



\# Forms



All forms should:



\- Validate required fields

\- Display inline validation errors

\- Prevent duplicate submissions

\- Disable submit while saving



\---



\# Responsive Design



\## Desktop



\- Fixed sidebar

\- Multi-column layouts

\- Product grid



\---



\## Tablet



\- Collapsible sidebar

\- Reduced spacing



\---



\## Mobile



\- Sidebar becomes navigation drawer

\- Single-column layouts

\- Large touch targets

\- Sticky primary actions where appropriate



\---



\# Accessibility



The application should provide:



\- Keyboard navigation

\- Visible focus indicators

\- Sufficient color contrast

\- Descriptive labels for interactive elements



\---



\# UI Principles



The interface should prioritize:



\- Speed

\- Simplicity

\- Visual browsing

\- Few clicks

\- Large touch targets

\- Consistency


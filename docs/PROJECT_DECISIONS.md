\# Project Decisions



\## Purpose



This document records important product and technical decisions made during the development of Hostel Snack Store.



Its purpose is to preserve the reasoning behind decisions so future changes remain consistent with the product vision.



\---



\# Decision Log



\---



\## Single Shopkeeper



\*\*Decision\*\*



The application supports only one shopkeeper.



\*\*Reason\*\*



The product is designed for a student running a hostel snack store alone.



Adding employee management would increase complexity without providing value in Version 1.



\---



\## Night Store



\*\*Decision\*\*



The application is optimized for stores operating only a few hours each night.



\*\*Reason\*\*



This reflects the real-world operating model of the hostel snack store.



\---



\## Store Status



\*\*Decision\*\*



The store has only two states:



\- Open

\- Closed



\*\*Reason\*\*



A "Busy" state is unnecessary.



Inventory consistency is enforced by the backend through atomic transactions rather than manual order acceptance.



\---



\## Automatic Scheduling



\*\*Decision\*\*



The store supports automatic opening and closing based on configured operating hours.



Manual overrides are always allowed.



\*\*Reason\*\*



Reduces repetitive daily work while allowing flexibility.



\---



\## Inventory Management



\*\*Decision\*\*



Inventory updates occur only on the backend within a database transaction.



\*\*Reason\*\*



Guarantees:



\- No overselling

\- No negative stock

\- Consistent inventory



\---



\## Product Pricing



\*\*Decision\*\*



Current product prices may change.



Historical order prices never change.



\*\*Reason\*\*



Preserves accurate business records and analytics.



\---



\## Analytics



\*\*Decision\*\*



Analytics are generated automatically from historical order data.



\*\*Reason\*\*



The shopkeeper should never manually calculate revenue or profit.



\---



\## Product Archiving



\*\*Decision\*\*



Products are archived instead of deleted.



\*\*Reason\*\*



Historical orders must always remain valid.



\---



\## Navigation



\*\*Decision\*\*



The sidebar contains:



\- Store Status

\- Orders

\- Products

\- Analytics

\- Settings



\*\*Reason\*\*



Each page has a single, well-defined responsibility.



\---



\## Product Management



\*\*Decision\*\*



"Add Product" is an action within the Products page rather than a separate navigation item.



\*\*Reason\*\*



Product creation is part of product management, not a standalone section.



\---



\## Documentation



\*\*Decision\*\*



Documentation follows the principle:



> One document = one responsibility.



\*\*Reason\*\*



Reduces duplication and makes documentation easier to maintain.



\---



\## Database Design



\*\*Decision\*\*



The database contains only four entities:



\- Products

\- Orders

\- Order Items

\- Settings



\*\*Reason\*\*



The schema should remain as simple as possible while supporting all Version 1 requirements.



\---



\## Architecture



\*\*Decision\*\*



Business logic resides entirely on the backend.



\*\*Reason\*\*



The backend is the source of truth and ensures consistent behavior regardless of client implementation.



\---



\## UI Philosophy



\*\*Decision\*\*



The interface is inspired by Blinkit and Zepto.



\*\*Reason\*\*



A visual, fast, and modern interface is better suited to quick nightly operations than a traditional admin dashboard.



\---



\## Product Philosophy



\*\*Decision\*\*



Every feature must answer:



> "Would this genuinely make running tonight's shop easier?"



If not, it should be postponed or rejected.



\*\*Reason\*\*



Keeps Version 1 focused and avoids unnecessary complexity.



\---



\# Future Decisions



Add new entries whenever a significant product or technical decision is made.



Each entry should include:



\- Decision

\- Reason



Avoid documenting temporary implementation details or short-lived experiments.



\---



\# Decision Summary



The project is guided by four principles:



\- Keep Version 1 simple.

\- Automate repetitive work.

\- Preserve historical accuracy.

\- Prioritize the shopkeeper's nightly workflow.


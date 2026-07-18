\# AGENTS.md



\# Hostel Snack Store — AI Development Guide



\## Purpose



This document defines how AI coding agents should work within this repository.



It establishes development rules, coding standards, workflow, and documentation priority to ensure consistent implementation.



\---



\# Project Overview



Hostel Snack Store is a web application for managing a hostel-based night snack store.



The application is designed for a \*\*single shopkeeper\*\* and focuses on making nightly operations fast, simple, and reliable.



Version 1 prioritizes simplicity over feature richness.



\---



\# Documentation



Before implementing any feature, consult the relevant documentation.



| Document                    | Purpose                                |

| --------------------------- | -------------------------------------- |

| README.md                   | Project overview                       |

| TASKS.md                    | Current project status and active work |

| PRD.md                      | Product scope and requirements         |

| BUSINESS\_RULES.md           | Business logic                         |

| INFORMATION\_ARCHITECTURE.md | Navigation and page hierarchy          |

| UI\_SPECIFICATION.md         | Layouts and components                 |

| DESIGN.md                   | Visual design system                   |

| DATABASE.md                 | Database schema                        |

| ARCHITECTURE.md             | System architecture                    |

| API\_SPECIFICATION.md        | API contracts                          |

| TESTING.md                  | Testing requirements                   |

| DEPLOYMENT.md               | Deployment process                     |

| PROJECT\_DECISIONS.md        | Architectural and product decisions    |



\---



\# Documentation Priority



When conflicts occur, follow this order:



1\. User instructions

2\. AGENTS.md

3\. TASKS.md

4\. Project documentation

5\. Existing code



Do not silently contradict the documentation.



If documentation is incorrect, request clarification before changing behavior.



\---



\# Tech Stack



\## Frontend



\* Next.js

\* React

\* TypeScript

\* Tailwind CSS

\* shadcn/ui

\* TanStack Query

\* React Hook Form

\* Zod



\## Backend



\* NestJS

\* TypeScript

\* Prisma ORM



\## Database



\* PostgreSQL



\## Storage



\* Supabase Storage



\## Authentication



\* Better Auth



\---



\# Development Principles



Always prioritize:



\* Simplicity

\* Readability

\* Maintainability

\* Accessibility

\* Consistency



Every implementation should support the product philosophy:



> "Would this genuinely make running tonight's shop easier?"



If not, reconsider the implementation.



\---



\# Architecture Rules



\* Backend is the single source of truth.

\* Business logic belongs only in the backend.

\* Frontend should remain presentation-focused.

\* Use REST APIs as defined in API\_SPECIFICATION.md.

\* Preserve separation of concerns.

\* Avoid duplicated logic.



\---



\# UI Rules



Follow:



\* UI\_SPECIFICATION.md

\* DESIGN.md



Do not:



\* Redesign layouts.

\* Add new pages.

\* Rearrange navigation.

\* Change user flows.

\* Modify animations.

\* Introduce visual styles outside the design system.



Accessibility requirements must always be preserved.



\---



\# Database Rules



Follow DATABASE.md exactly.



Rules:



\* Never mutate historical order data.

\* Use transactions for inventory updates.

\* Preserve data integrity.

\* Prefer migrations over manual schema changes.



\---



\# Coding Standards



\## General



\* Write clear, readable code.

\* Keep functions focused.

\* Avoid deeply nested logic.

\* Prefer composition over duplication.

\* Remove dead code.



\---



\## TypeScript



\* Avoid `any`.

\* Use strict typing.

\* Prefer interfaces/types where appropriate.



\---



\## Components



\* One responsibility per component.

\* Keep components small and reusable.

\* Extract shared logic when necessary.



\---



\## API



\* Validate all inputs.

\* Return consistent response structures.

\* Handle errors gracefully.

\* Never expose sensitive information.



\---



\# Dependency Policy



Before adding a dependency:



\* Confirm existing tools cannot solve the problem.

\* Prefer lightweight libraries.

\* Avoid unnecessary packages.



\---



\# Git Workflow



Each commit should represent one logical change.



Examples:



\* feat: add products api

\* feat: implement product card

\* fix: prevent negative inventory

\* refactor: simplify order validation



Avoid mixing unrelated changes.



\---



\# AI Workflow



For every task:



1\. Read TASKS.md.

2\. Identify the current task.

3\. Read the relevant documentation.

4\. Plan the implementation.

5\. Implement only the current task.

6\. Verify the implementation.

7\. Update TASKS.md if the task is complete.

8\. Stop.



Do not continue into unrelated work unless instructed.



\---



\# Definition of Done



A task is complete only when:



\* The implementation matches the documentation.

\* The project builds successfully.

\* No TypeScript errors remain.

\* No linting errors remain.

\* Tests pass (where applicable).

\* Accessibility is preserved.

\* Documentation is updated if required.

\* TASKS.md reflects the new project status.



\---



\# Things to Avoid



Do not:



\* Implement undocumented features.

\* Change documented behavior without approval.

\* Introduce breaking changes unnecessarily.

\* Duplicate business logic.

\* Hardcode configuration values.

\* Ignore accessibility requirements.

\* Modify generated files unless required.



\---



\# If You Are Unsure



When documentation is ambiguous:



\* Do not guess.

\* Do not invent behavior.

\* Ask for clarification before implementation.



Correctness is more important than speed.




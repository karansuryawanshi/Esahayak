# E-Sahayak – Buyer Lead Intake App

A mini **Buyer Lead Intake** application to **capture, list, and manage buyer leads** efficiently. Built with Next.js, TypeScript, and a robust backend, this app supports validation, search/filtering, CSV import/export, and change history tracking.

---

## Features

- **Create Leads:** Capture all relevant buyer information with conditional fields and server/client validation.
- **List & Search:** Paginated SSR listing with filters (`city`, `propertyType`, `status`, `timeline`) and debounced search by `fullName`, `phone`, or `email`.
- **View & Edit Leads:** Edit leads with concurrency control and view last 5 history changes.
- **CSV Import/Export:** Bulk import leads with row-level validation and export filtered results.
- **Ownership & Auth:** Users can edit/delete only their own leads; all logged-in users can view leads.

**Nice-to-haves implemented:** Tag chips with typeahead, status quick-actions, and optional attachment upload support.

---

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, React, Tailwind CSS
- **Backend:** Prisma + Postgres/SQLite/Supabase
- **Validation:** Zod (client + server)
- **Auth:** Magic link or demo login
- **Version Control:** Git (with meaningful commits)

---

## Data Model

### buyers

| Field        | Type      | Notes                                                                              |
| ------------ | --------- | ---------------------------------------------------------------------------------- |
| id           | uuid      | Primary Key                                                                        |
| fullName     | string    | 2–80 chars                                                                         |
| email        | string    | optional, must be valid                                                            |
| phone        | string    | required, 10–15 digits                                                             |
| city         | enum      | Chandigarh, Mohali, Zirakpur, Panchkula, Other                                     |
| propertyType | enum      | Apartment, Villa, Plot, Office, Retail                                             |
| bhk          | enum      | Conditional: 1,2,3,4,Studio (only Apartment/Villa)                                 |
| purpose      | enum      | Buy, Rent                                                                          |
| budgetMin    | int       | optional                                                                           |
| budgetMax    | int       | optional, ≥ budgetMin                                                              |
| timeline     | enum      | 0-3m, 3-6m, >6m, Exploring                                                         |
| source       | enum      | Website, Referral, Walk-in, Call, Other                                            |
| status       | enum      | New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped (default: New) |
| notes        | text      | optional, ≤ 1000 chars                                                             |
| tags         | string[]  | optional                                                                           |
| ownerId      | uuid      | Lead owner                                                                         |
| updatedAt    | timestamp | Auto-updated                                                                       |

### buyer_history

| Field     | Type      | Notes                 |
| --------- | --------- | --------------------- |
| id        | uuid      | Primary Key           |
| buyerId   | uuid      | Foreign Key to buyers |
| changedBy | uuid      | User who changed      |
| changedAt | timestamp | Timestamp of change   |
| diff      | JSON      | Stores changed fields |

---

## Pages & Flows

### `/buyers/new` – Create Lead

- Form fields: `fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, notes, tags[]`
- Validation: fullName ≥ 2 chars, phone numeric 10–15 digits, email valid if provided, budgetMax ≥ budgetMin, bhk required for Apartment/Villa
- On submit: create lead, assign `ownerId`, add entry to `buyer_history`

### `/buyers` – List & Search

- SSR paginated (10/page)
- URL-synced filters: `city`, `propertyType`, `status`, `timeline`
- Debounced search: `fullName | phone | email`
- Sort: `updatedAt` descending
- Row actions: View / Edit

### `/buyers/[id]` – View & Edit

- Full edit with validation
- Concurrency check using `updatedAt`
- Last 5 changes from `buyer_history` displayed

### CSV Import / Export

- Import max 200 rows, validate each row, transactional insert
- Export current filtered list
- Unknown enums or invalid rows are rejected

---

## Ownership & Auth

- All logged-in users can read leads
- Users can edit/delete only their own leads
- Admin role optional: can edit all

---

## Quality Measures

- Unit test for CSV row/budget validation
- Rate limit on create/update (per user/IP)
- Error boundaries + empty states
- Accessibility: labels, keyboard focus, form errors announced

---

## Setup & Run Locally

1. **Clone repo**

```
git clone https://github.com/<your-username>/e-sahayak.git
cd e-sahayak
```

2. **Install dependencies**

```
npm install
```

3. Environment variables
   Create .env file:

```
DATABASE_URL=<your_database_url>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Database migrations & seed (if any)**

```
npx prisma migrate dev --name init
npx prisma db seed
```

5. Run locally

```
npm run dev
```

6. Build for production

```
npm run build
npm run start
```

## Design Notes

- Validation: Zod schema used both on client and server

- SSR vs Client: List page uses SSR for real pagination; form inputs validated client-side for UX

- Ownership Enforcement: Server checks ownerId before update/delete

- CSV Import: Row-level errors displayed; transactional insertion prevents partial data

## Done vs Skipped

Done:

- Full CRUD with validation and history

- SSR pagination & filters

- CSV import/export with validation

- Ownership enforcement & auth

- Accessibility basics

### Skipped/Optional:

- Admin role (optional)
- Optimistic UI edit/rollback
- File attachment (optional)

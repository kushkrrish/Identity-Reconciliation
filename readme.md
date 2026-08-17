# Identity Reconciliation Service

A backend service that identifies and links customer contacts across multiple purchases, built for the Bitespeed Backend Task.



## Problem Statement

Customers often use different email addresses and phone numbers for different purchases. This service links all such contacts belonging to the same person and maintains a primary-secondary contact hierarchy.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Render.com

---

## Project Structure

```
src/
├── index.ts                  # Express server entry point
├── db.ts                     # Prisma client instance
├── routes/
│   └── identify.ts           # POST /identify route
├── services/
│   └── contactService.ts     # Core business logic
└── utils/
    └── responseBuilder.ts    # Response formatting helper
prisma/
└── schema.prisma             # Database schema
```

---

## Database Schema

```prisma
model Contact {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence String    // "primary" | "secondary"
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
}
```

---

## API Reference

### `POST /identify`

Identifies and consolidates a customer's contact information.

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```
> At least one of `email` or `phoneNumber` must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@email.com", "secondary@email.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## Business Logic

1. **No match found** → Create a new primary contact
2. **Match found with new info** → Create a secondary contact linked to the primary
3. **Two separate primaries matched** → Older primary stays, newer is demoted to secondary. All children of the demoted primary are re-linked.
4. **Exact duplicate** → No new contact created, return existing cluster

---

## Example

**Request 1:**
```json
{ "email": "lorraine@hillvalley.edu", "phoneNumber": "123456" }
```

**Request 2:**
```json
{ "email": "mcfly@hillvalley.edu", "phoneNumber": "123456" }
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/identity-reconciliation.git
cd identity-reconciliation

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/postgres"
```

---



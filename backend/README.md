# Tribe Green API

Express + MongoDB (Mongoose) backend shared by the website and the Android app.

## Run locally

```bash
cd backend
npm install
cp .env.example .env     # then edit the values
npm run seed             # loads 15 products and creates the admin user
npm run dev              # http://localhost:4000
npm test                 # unit tests (validators, CSV, budget filter)
```

You need a MongoDB: a free Atlas cluster, or `mongodb://127.0.0.1:27017/tribegreen` locally.

## Folder map

```
src/
  constants.js            categories, occasions, budget bands, statuses (single source of truth)
  config/                 env loading, DB connection
  models/                 Product, Enquiry, Admin
  validators/enquiry.js   zod rules: phone, email, units, date, enums
  controllers/            product, enquiry, admin logic
  middleware/             JWT check, error handler
  routes/index.js         every endpoint in one place
  utils/                  CSV writer, budget filter, ApiError
  seed/                   sample products + seed script
tests/                    node:test unit tests
```

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | no | liveness check |
| GET | `/api/meta` | no | categories, occasions, customisations, budget bands (for filter UIs) |
| GET | `/api/products` | no | `?category=&occasion=&budget=&customisation=&search=` |
| GET | `/api/products/:id` | no | one product |
| POST | `/api/enquiries` | no | validates and saves; body must include `source: "website" \| "app"` |
| POST | `/api/admin/login` | no | `{ username, password }` returns `{ token }` |
| GET | `/api/admin/stats` | Bearer | counts by status |
| GET | `/api/admin/enquiries` | Bearer | `?status=&source=&q=&page=&limit=` |
| PATCH | `/api/admin/enquiries/:id/status` | Bearer | `{ status: "New" \| "Contacted" \| "Converted" \| "Lost" }` |
| GET | `/api/admin/enquiries/export.csv` | Bearer | same filters as the list |

Budget keys: `under-500`, `500-1500`, `1500-3000`, `above-3000`.

### Example enquiry

```bash
curl -X POST http://localhost:4000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asha Verma", "company": "Acme Pvt Ltd",
    "phone": "+91 98765 43210", "email": "asha@acme.com",
    "occasion": "Corporate Diwali Gifting", "units": 250,
    "budgetPerUnit": "500-1500", "deliveryDate": "2026-11-05",
    "customisation": ["Logo printing"], "message": "Need before Diwali",
    "source": "website"
  }'
```

Errors always look like `{ "error": { "message": "...", "details": [{ "field": "phone", "message": "..." }] } }`
so forms can show each message beside its field.

## Design decisions (for the review round)

- **Required fields:** name, company, phone, email, occasion, units. Budget, delivery date, products, customisation and message are optional to keep the form easy to submit. Change this in `src/validators/enquiry.js`.
- **Phone:** accepts `+91`, `91` or leading `0`, stores 10 digits starting 6-9.
- **Budget filter:** a product matches a band if its price range overlaps it (`src/utils/budget.js`), so a Rs 450-700 bottle shows under both "Under 500" and "500 to 1,500".
- **Source:** the client sends `website` or `app`, validated against an allow-list.
- **Admin auth:** one admin created from `.env` on first start, password stored as a bcrypt hash, 12 hour JWT, login rate-limited.
- **CSV:** hand-written (about 20 lines), escapes quotes and blocks spreadsheet formula injection.
- **Product names are copied onto each enquiry**, so history survives edits to the catalogue.

## Deploy on Render

1. New Web Service from the repo, root directory `backend`, build `npm install`, start `npm start`.
2. Add the env vars from `.env.example` (use an Atlas connection string; set `CORS_ORIGINS` to the website URL).
3. Run `npm run seed` once from your machine with the production `MONGODB_URI`.

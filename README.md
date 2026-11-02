# Tribe Green: catalogue and enquiry system

Practical assignment for V Green Media. One Express + MongoDB backend feeds a Next.js website and a React Native Android app. An admin page lists every enquiry from both.

| | |
|---|---|
| Live website | https://vgreen-assessment.vercel.app |
| Admin page | https://vgreen-assessment.vercel.app/admin · username `admin` · password `password` |
| Android APK | _paste Google Drive link_ |
| Screen recording | _paste link_ |

| Folder | What |
|---|---|
| `backend/` | REST API, validation, admin login, CSV export, seed data (details in `backend/README.md`) |
| `web/` | Website and `/admin` page (`web/README.md`) |
| `mobile/` | Android app, React Native CLI (`mobile/README.md`) |

## Handover note

### How to run it
Needs Node 18+, a MongoDB (Atlas free tier or local) and, for the app, Android Studio.

```bash
# 1. API on http://localhost:4000
cd backend && npm install && cp .env.example .env     # fill in MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGINS
npm run seed && npm run dev                            # npm test runs the unit tests

# 2. Website on http://localhost:3000
cd web && npm install && cp .env.example .env.local && npm run dev

# 3. Android app: generate the native project once (steps in mobile/README.md), then
npm start && npm run android
```

### Stack and why
- **Backend: Node, Express, MongoDB (Mongoose), zod.** One language across all three parts, so I can explain every layer. Atlas keeps the data when Render redeploys, which a file database would not. Admin login is one account from `.env`, bcrypt-hashed, with a 12-hour JWT.
- **Website: Next.js (React).** The brief wants a title, description and share image on every page. Server-rendered pages give each product its own link preview in WhatsApp, which a client-only React app cannot.
- **App: React Native CLI (no Expo), React Navigation, AsyncStorage.** AsyncStorage holds "My enquiries" on the phone.
- **Hosting:** Render (API), Vercel (website).

### Decisions worth knowing
- **Budget filter:** a product matches a band when its price range overlaps it, so a ₹450–700 bottle appears under both "Under ₹500" and "₹500 to ₹1,500". Logic is in `backend/src/utils/budget.js`.
- **Validation:** the backend (`backend/src/validators/enquiry.js`) is the source of truth. The website and app repeat the same rules for instant feedback.
- **Source:** every enquiry stores `website` or `app`, shown in admin and in the CSV.
- **Filter lists** (categories, occasions, budgets) come from `GET /api/meta`, so the website and app cannot drift apart.

### Extras included
Search, dark mode on web and app, and a GA4 `generate_lead` event on enquiry submit (active once `NEXT_PUBLIC_GA_ID` is set).

### Limited
- "My enquiries" in the app shows **Sent**, not the live status. The API has no public status endpoint, so the app cannot see admin changes.
- Product photos are placeholder images from the seed file.
- Automated tests cover validation, CSV export and the budget filter only. There are no API or screen tests.
- The Render free tier sleeps when idle, so the first request after a pause can take about 30 seconds.
- Android only. No iOS build, push notification or email alert.

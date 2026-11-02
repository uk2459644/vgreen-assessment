# Tribe Green website (Next.js 14, App Router)

Catalogue, product pages, enquiry form, thank-you screen and the `/admin` page. It talks to the Express API in `../backend`.

## Run locally

```bash
cd web
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL to your running backend
npm run dev                     # http://localhost:3000
```

Start the backend first (`cd ../backend && npm run seed && npm run dev`) and add `http://localhost:3000` to its `CORS_ORIGINS`.

## Pages

| Route | What | Rendered |
|---|---|---|
| `/` | Catalogue with category, occasion, budget filters and search (filters live in the URL) | server |
| `/products/[id]` | Product detail, "Enquire" button, WhatsApp button with pre-filled message | server |
| `/enquiry` | Enquiry form (all 11 fields). `?product=<id>` pre-ticks a product | server shell + client form |
| `/thank-you` | Confirmation after a successful submit | server |
| `/admin` | Login, enquiries list, status change, CSV download | client |
| `/og?title=...` | Generates the 1200x630 share image | edge |

## Folder map

```
app/            routes (layout.js, page.js, products/[id], enquiry, thank-you, admin, og)
components/     Header, Footer, ProductCard, Filters, EnquiryForm, WhatsAppButton
lib/            api.js (fetch wrapper), config.js (env), seo.js (metadata), format.js
```

## How the requirements are met

- **Filters:** `components/Filters.js` writes `?category=&occasion=&budget=&search=` to the URL; `app/page.js` reads the same params on the server and passes them to `GET /api/products`.
- **Enquiry form:** `components/EnquiryForm.js` validates in the browser with the same rules as the backend, posts with `source: "website"`, shows server errors next to the right field, and redirects to `/thank-you`.
- **WhatsApp:** `components/WhatsAppButton.js` builds `https://wa.me/<number>?text=<encoded message>`. Set the number in `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- **SEO on every page:** each page exports `buildMetadata({ title, description, path, image })` from `lib/seo.js`, which sets the title, meta description, Open Graph and Twitter tags. Product pages use the product photo as the share image; other pages use the generated card from `/og`.
- **Admin:** token from `POST /api/admin/login` is kept in `localStorage`; a 401 from any call returns to the login form. CSV is fetched with the token and saved as a file.
- **Extras included:** search, dark mode (follows the system setting), GA4 `generate_lead` event (set `NEXT_PUBLIC_GA_ID`).

## Deploy on Vercel

1. Import the repo, set **Root Directory** to `web`.
2. Add the four `NEXT_PUBLIC_*` variables from `.env.example`.
3. After the first deploy, put the Vercel URL into the backend's `CORS_ORIGINS` and into `NEXT_PUBLIC_SITE_URL`, then redeploy.

## Known limits

- Product images use `<img>` (not `next/image`) so remote photo hosts need no extra config.
- Admin token in `localStorage` is fine for a demo; a production build would use an httpOnly cookie.

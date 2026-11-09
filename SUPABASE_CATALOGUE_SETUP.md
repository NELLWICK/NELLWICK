# NELLWICK — Supabase catalogue connection

This is an update patch for the NELLWICK Next.js storefront (v2). It connects the homepage, shop, collection product lists and product detail route to the existing Supabase `products` and `product_variants` tables.

## What it changes

- Reads only products with `status = 'active'` and `is_published = true`.
- Reads only variants with `is_active = true` and `is_available = true`.
- Uses the exact column names returned by your Supabase schema query.
- Pulls product images from the `products.images` JSONB array when it contains HTTP(S) URLs.
- Keeps product video URLs and richer editorial copy in `src/data/products.js` for now because the current database schema does not have video URL columns.
- Uses variant price (not a stale product base price) for the product page and local bag line item.
- Does not fetch supplier mappings or expose supplier data to shoppers.
- Does not use a service-role/secret key.

## Install

1. Stop the local Next.js server (`Ctrl + C`).
2. Extract this ZIP into the project root, `C:\Users\ADMIN\Downloads\nellwick-web`.
3. Merge folders and replace the included files.
4. In the project root, create or open `.env.local`. If the file already exists, keep its other settings and append these two lines:

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_WITH_YOUR_KEY
   ```

5. Find the project URL and publishable key in Supabase **Project Settings → API Keys**. The publishable key normally starts with `sb_publishable_`. If this project still uses the legacy API keys, use the `anon` key instead by setting `SUPABASE_ANON_KEY=...` and leave `SUPABASE_PUBLISHABLE_KEY` blank or remove it.
6. Do not copy the `sb_secret_...` key or the legacy `service_role` key into these variables. Keep any existing `SUPABASE_SECRET_KEY` setting server-only; this catalogue reader does not need it.
7. Save `.env.local` and restart the dev server with `npm run dev`.

No new npm package is needed; this uses the Supabase REST API with the built-in `fetch` API.

## Important: existing products are drafts

The currently seeded NELLWICK products were previously confirmed as `status = 'draft'` and `is_published = false`. This integration deliberately hides them. When the product media, shipping details, final descriptions and policies have been checked, publish them deliberately in Supabase. Do not run the update below merely to make the page non-empty before the store is ready.

To inspect launch readiness:

```sql
select
  p.product_id,
  p.name,
  p.status,
  p.is_published,
  count(v.sku) filter (where v.is_active and v.is_available) as sellable_variants,
  jsonb_array_length(p.images) as image_count
from public.products p
left join public.product_variants v on v.product_id = p.product_id
group by p.product_id, p.name, p.status, p.is_published, p.images
order by p.product_id;
```

When ready to publish, use an explicit update for only the reviewed SKUs, for example:

```sql
update public.products
set status = 'active', is_published = true, updated_at = now()
where product_id in ('NWL-PET-001', 'NWL-PET-002');
```

Only run the publish statement after adding and checking real product images, product content and fulfilment/shipping policy. `products.images` should be a JSON array of image URLs, e.g. `[
  "https://cdn.example.com/brush-front.jpg",
  "https://cdn.example.com/brush-detail.jpg"
]`.

## RLS / access requirements

The existing public catalogue read policies should allow the `anon` role to select published products and their active/available variants. This patch does not create or weaken policies. If Supabase returns an empty catalogue or a permission error, inspect the `pg_policies` entries for `products` and `product_variants` and verify SELECT grants for `anon`.

Diagnostic query:

```sql
select tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('products', 'product_variants')
order by tablename, policyname;
```

## Security boundary

`SUPABASE_PUBLISHABLE_KEY` or the legacy anon key is allowed for public catalogue reads when RLS is correct. Never put a Supabase secret key/service_role key in `.env.local` for this catalogue reader, `NEXT_PUBLIC_` variables, browser code, screenshots, chat, or GitHub. The secret key will only be used by tightly controlled server endpoints when we implement order creation and payment verification.

## What is intentionally not enabled yet

- Checkout does not create an order.
- No payment is taken.
- No order is marked paid based on a browser redirect.
- No supplier order is submitted to DSers.
- No live tracking result is claimed.

Those require the next secure backend/payment implementation and a verified shipping/tax calculation. Do not launch real customer checkout until then.

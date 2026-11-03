# KriyaMantra: Tech Stack dan Rencana TanStack Query

Dokumen ini mencatat stack yang benar-benar ada di repository serta rancangan implementasi TanStack Query untuk mengurangi request berulang, mempercepat navigasi dashboard, dan menjaga cache data server tetap konsisten.

## 1. Tech Stack Saat Ini

### Core

- Language: TypeScript
- Runtime: Node.js
- Package manager: npm
- Framework: Next.js `16.4.3`
- UI library: React `19.3.0`
- Routing/rendering: Next.js App Router
- API: Next.js Route Handlers
- Module alias: `@/*`

### Frontend

- Tailwind CSS `4`
- `@tailwindcss/turbopack`
- Custom CSS: `app/globals.css`
- Fonts: Geist dan Geist Mono melalui `next/font/google`
- UI component: React component custom
- Responsive layout: Tailwind CSS dan CSS media queries

### Backend

- Next.js server-side API
- Route Handlers untuk:
  - signup/signin
  - business
  - products
  - product image
  - onboarding
  - chat
  - content generation
  - health check
- Domain parsing/validation: fungsi custom di `lib/domain`
- HTTP helper: `lib/http.ts`

### Authentication

- Supabase Auth
- `@supabase/supabase-js`
- `@supabase/ssr`
- Server-side session berbasis cookie
- Supabase RLS sebagai authorization layer

### Database

- PostgreSQL melalui Supabase
- PostgreSQL client: `postgres`
- ORM: Drizzle ORM `0.45.4`
- Migration/schema tool: Drizzle Kit `0.31.11`
- Schema: `lib/db/schema.ts`
- Migration: `drizzle/*.sql`

Tabel utama:

- `businesses`
- `products`
- `conversations`
- `messages`
- `content_generations`
- `content_outputs`

### AI

- Provider/gateway: Xkiro API
- Adapter: `lib/ai/xkiro`
- Default text model: `openai/gpt-5.6-sol`
- Fallback model: `qwen/qwen3.7-plus:free`
- Vision model: `google/gemini-3.6-flash`
- Image model config: `openai/gpt-image-2.5`
- Fitur adapter: timeout, fallback model, token limit, dan safe error handling

### Integrasi Meta

Dokumentasi produk menargetkan:

- WhatsApp Business Cloud API
- WhatsApp webhook
- Instagram Graph API
- Meta OAuth
- Instagram auto-posting

Catatan: implementasi source saat ini berfokus pada fondasi auth, database, chat AI, product, dan content generation. Integrasi WhatsApp/Instagram penuh masih menjadi milestone lanjutan.

### Tooling

- TypeScript strict mode
- ESLint `9`
- `eslint-config-next`
- Next.js Turbopack
- `dotenv`
- Drizzle migration scripts

## 2. TanStack Query

### Tujuan

TanStack Query dipakai untuk mengelola **server state** di browser:

- Cache response API
- Deduplicate request yang sama
- Refetch saat data stale
- Retry request gagal
- Invalidation setelah mutation
- Loading/error state yang konsisten
- Prefetch data sebelum navigasi

TanStack Query tidak mempercepat query PostgreSQL secara langsung. TanStack Query mempercepat pengalaman aplikasi dengan mengurangi request HTTP berulang dan menampilkan cache. Optimasi SQL tetap ditangani PostgreSQL, Drizzle, index, dan pagination.

### Dependency yang Dibutuhkan

Tambahkan dependency:

```bash
npm install @tanstack/react-query
```

Development tools opsional:

```bash
npm install -D @tanstack/react-query-devtools
```

Tidak perlu menambahkan state manager global lain untuk kebutuhan server state.

## 3. Struktur Implementasi yang Disarankan

Struktur minimum:

```text
app/
  providers.tsx
  layout.tsx
lib/
  query-client.ts
  api-client.ts
hooks/
  use-products.ts
  use-business.ts
  use-chat.ts
  use-content-generations.ts
```

### QueryClient

Buat satu `QueryClient` per browser session. Jangan membuat `QueryClient` baru pada setiap render.

Konfigurasi awal yang disarankan:

```ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
```

Alasan konfigurasi:

- `staleTime: 30_000`: response dianggap fresh selama 30 detik.
- `gcTime: 5 * 60_000`: cache inactive disimpan 5 menit.
- `retry: 1`: retry ringan untuk gangguan jaringan.
- `refetchOnWindowFocus: false`: mencegah request tidak perlu pada dashboard.
- Mutation tidak otomatis retry agar operasi create/update tidak terduplikasi.

Nilai ini perlu disesuaikan setelah ada data penggunaan nyata.

### Provider

Tambahkan client component provider di `app/providers.tsx`, lalu pasang di `app/layout.tsx`.

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { makeQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```


## 4. API Client

Semua query/mutation harus melewati helper fetch terpusat supaya error API konsisten.

```ts
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed: ${response.status}`);
  }

  return body as T;
}
```


## 5. Query Key Convention

Gunakan key array yang stabil dan spesifik:

```ts
export const queryKeys = {
  business: ["business"] as const,
  products: (businessId: string) => ["products", businessId] as const,
  product: (id: string) => ["product", id] as const,
  conversations: (businessId: string) => ["conversations", businessId] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  generations: (businessId: string) => ["generations", businessId] as const,
};
```


- Jangan memakai key string acak.
- Masukkan `businessId`, `productId`, atau `conversationId` ke key.
- Jangan memasukkan secret, access token, atau data sensitif ke query key.
- Key mutation tidak diperlukan; mutation meng-invalidasi key query terkait.

## 6. Prioritas Query

### Products

`GET /api/products` adalah kandidat awal karena dipakai dashboard dan menjadi input content generation.

```ts
useQuery({
  queryKey: queryKeys.products(businessId),
  queryFn: () => apiFetch(`/api/products?businessId=${businessId}`),
  enabled: Boolean(businessId),
});
```

Setelah create/update/delete product:

```ts
queryClient.invalidateQueries({
  queryKey: queryKeys.products(businessId),
});
```

### Business

Cache business profile dengan key `queryKeys.business`. Gunakan `enabled` jika ID/auth context belum tersedia.

### Chat

Chat memerlukan data terbaru. Gunakan query key per `conversationId`. Setelah mengirim pesan:

1. Jalankan mutation `POST /api/chat`.
2. Update cache optimistik hanya jika response API mendukung bentuk message final.
3. Invalidate/refetch messages setelah mutation berhasil.

Jangan memakai cache lama untuk menampilkan status AI yang sedang generating tanpa status eksplisit dari API.

### Content Generations

Gunakan query key per business. Setelah generate/revise/approve:

```ts
queryClient.invalidateQueries({
  queryKey: queryKeys.generations(businessId),
});
```


TanStack Query bukan pengganti optimasi database. Terapkan hal berikut di Drizzle/PostgreSQL:

- Tambahkan foreign key untuk relasi antar tabel.
- Tambahkan index pada kolom filter utama:
  - `businesses.owner_id`
  - `products.business_id`
  - `conversations.business_id`
  - `messages.conversation_id`
  - `content_generations.business_id`
  - `content_generations.product_id`
  - `content_outputs.generation_id`
- Tambahkan index gabungan untuk pola query yang sering dipakai, misalnya `(business_id, created_at)`.
- Gunakan pagination, bukan mengambil semua messages atau generations.
- Pilih kolom yang diperlukan; hindari `select *` untuk list besar.
- Batasi ukuran payload image metadata dan JSONB.
- Gunakan `ORDER BY ... LIMIT` dengan index yang sesuai.
- Verifikasi query lambat memakai `EXPLAIN ANALYZE`.
- Pastikan semua endpoint memakai user/business scope agar RLS tidak menjadi filter terakhir setelah data besar dibaca.


Untuk messages dan generations, gunakan cursor pagination jika jumlah data dapat bertambah besar. Offset pagination cukup untuk MVP dengan dataset kecil.

Contoh response API yang stabil:

```json
{
  "items": [],
  "nextCursor": "2026-11-02T12:00:00.000Z"
}
```

Di TanStack Query, gunakan `useInfiniteQuery` untuk endpoint cursor-based.


| Data | `staleTime` awal | Invalidation |
|---|---:|---|
| Business profile | 5 menit | Setelah update profile |
| Product list | 60 detik | Setelah create/update/delete product |
| Product detail | 60 detik | Setelah update product |
| Conversation list | 30 detik | Setelah conversation berubah |
| Messages | 0-10 detik | Setelah send message |
| Content generations | 10-30 detik | Setelah generate/revise/approve |

Aturan invalidation:

- Invalidate setelah server mutation berhasil.
- Jangan invalidate seluruh cache untuk satu perubahan kecil.
- Gunakan `setQueryData` hanya jika bentuk response mutation sama dengan bentuk cache.
- Jangan melakukan optimistic update untuk operasi AI yang bisa gagal atau lama tanpa rollback.


Server Component tetap cocok untuk landing page statis, metadata, dan initial render sederhana. TanStack Query dipakai di Client Component yang membutuhkan:

- Interaksi dashboard
- Form mutation
- Chat realtime-like
- Refetch data
- Loading/error state client-side

Jangan memindahkan semua fetch Server Component ke TanStack Query tanpa kebutuhan. Pilih berdasarkan kebutuhan interaksi.


TanStack Query bukan transport realtime. Untuk status generation:

- MVP: polling dengan `refetchInterval` hanya saat status `queued`/`processing`.
- Hentikan polling saat `succeeded`/`failed`.
- Tahap lanjutan: Supabase Realtime jika event database memang diperlukan.


```ts
refetchInterval: (query) => {
  const status = query.state.data?.status;
  return status === "queued" || status === "processing" ? 3_000 : false;
}
```



- TanStack Query cache bukan tempat menyimpan access token.
- Endpoint tetap wajib memvalidasi session Supabase di server.
- Endpoint tetap wajib membatasi data berdasarkan owner/business user.
- Jangan percaya `businessId` dari client tanpa verifikasi kepemilikan.
- Jangan menaruh `DATABASE_URL`, `XKIRO_API_KEY`, atau Meta token di client bundle.
- Error response client tidak boleh membocorkan SQL, token, atau stack trace.


1. Install `@tanstack/react-query`.
2. Tambahkan `app/providers.tsx` dan `lib/query-client.ts`.
3. Pasang provider di `app/layout.tsx`.
4. Tambahkan `lib/api-client.ts` dan query key convention.
5. Migrasikan product list/detail terlebih dahulu.
6. Tambahkan mutation product dengan invalidation terarah.
7. Migrasikan business profile.
8. Migrasikan content generations dengan polling bersyarat.
9. Migrasikan chat terakhir karena membutuhkan penanganan state yang lebih ketat.
10. Tambahkan index database dan pagination.
11. Jalankan `npm run lint` dan `npm run build`.
12. Ukur query lambat dengan `EXPLAIN ANALYZE` sebelum mengubah cache secara agresif.


- Tidak ada request duplicate untuk query key yang sama saat komponen mount bersamaan.
- Product list tetap konsisten setelah create/update/delete.
- Error API tampil tanpa crash dan tanpa membocorkan secret.
- Cache tidak menyimpan token atau credential.
- Messages dan generations tidak mengambil seluruh tabel tanpa pagination.
- Query penting memiliki index yang sesuai.
- `npm run lint` lulus.
- `npm run build` lulus.


Stack utama KriyaMantra adalah Next.js, React, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, Drizzle ORM, dan Xkiro AI.

TanStack Query menambah lapisan client-side server-state management. Manfaat utamanya adalah cache, deduplication, controlled refetch, dan invalidation. Performa database tetap membutuhkan index PostgreSQL, query Drizzle yang terukur, payload kecil, dan pagination.

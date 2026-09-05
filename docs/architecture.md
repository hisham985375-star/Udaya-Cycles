# UDAYA CYCLES — System Architecture

## Overview

Udaya Cycles is a production-ready premium bicycle e-commerce platform built as a full-stack Next.js application with TypeScript, MongoDB Atlas, Cloudinary, and Razorpay integration. The application is self-hosted via Docker with Nginx reverse proxy.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animation | GSAP + ScrollTrigger |
| Database | MongoDB Atlas (via Mongoose) |
| Auth | NextAuth.js v5 (JWT strategy) |
| Media CDN | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer (SMTP / provider-agnostic) |
| SMS | Provider-agnostic interface (env-configured) |
| WhatsApp | Provider-agnostic interface (env-configured) |
| Container | Docker + docker-compose |
| Reverse Proxy | Nginx |
| SSL/TLS | Certbot (Let's Encrypt) |
| Hosting | Linux VPS / Cloud Server |

---

## Brand Design Tokens

| Token | Value |
|---|---|
| `--color-primary` | `#282827` (Near-Black) |
| `--color-accent` | `#efff40` (Neon Yellow-Green) |
| `--color-bg` | `#0a0a09` (Deep Black) |
| `--color-surface` | `#1a1a18` (Dark Surface) |
| `--color-border` | `#2a2a28` |
| `--color-text-primary` | `#f5f5f0` |
| `--color-text-muted` | `#888884` |

---

## High-Level Architecture

```
Internet
    │
    ▼
Domain (udayacycles.com)
    │
    ▼
Nginx (reverse proxy, SSL termination)
    │
    ▼
Docker: Next.js Application (port 3000)
    │
    ├──▶ MongoDB Atlas (cloud database)
    ├──▶ Cloudinary (media CDN)
    ├──▶ Razorpay (payment gateway)
    ├──▶ Email Provider (SMTP)
    ├──▶ SMS Provider (API)
    └──▶ WhatsApp Provider (API)
```

---

## Application Architecture

### Next.js App Router Structure

```
app/
├── (storefront)/              # Customer-facing routes
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Storefront layout (header + footer)
│   ├── cycles/
│   │   ├── category/[slug]/   # Category listing
│   │   └── brand/[slug]/      # Brand listing
│   ├── accessories/
│   │   ├── page.tsx           # Accessories listing
│   │   └── [slug]/            # Accessory product detail
│   ├── products/[slug]/       # Product detail page
│   ├── search/                # Search overlay page
│   ├── cart/                  # Full cart page
│   ├── checkout/              # Checkout flow
│   ├── wishlist/              # Wishlist page
│   ├── account/               # Customer account
│   │   ├── page.tsx           # Profile
│   │   ├── orders/            # Order history
│   │   └── orders/[id]/       # Order detail
│   ├── contact/               # Contact page
│   ├── store-locator/         # Store locator
│   ├── privacy-policy/        # Legal
│   ├── terms/                 # Legal
│   ├── shipping-policy/       # Legal
│   └── refund-policy/         # Legal
│
├── (auth)/                    # Authentication routes
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
├── (admin)/                   # Admin panel routes (protected)
│   ├── admin/
│   │   ├── page.tsx           # Dashboard
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── accessories/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── new-arrivals/
│   │   ├── featured/
│   │   ├── testimonials/
│   │   ├── faq/
│   │   ├── store-locations/
│   │   ├── homepage/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── admins/
│
└── api/                       # API routes
    ├── auth/[...nextauth]/
    ├── products/
    ├── categories/
    ├── brands/
    ├── cart/
    ├── wishlist/
    ├── orders/
    ├── payments/
    ├── reviews/
    ├── search/
    ├── admin/
    ├── webhooks/razorpay/
    ├── newsletter/
    └── health/
```

---

## Component Architecture

```
components/
├── ui/                        # Base UI primitives
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   ├── Badge/
│   ├── Spinner/
│   ├── Toast/
│   └── Accordion/
│
├── layout/                    # Layout components
│   ├── Header/
│   ├── Footer/
│   ├── AdminSidebar/
│   ├── AdminHeader/
│   └── Breadcrumb/
│
├── navigation/                # Navigation components
│   ├── MainNav/
│   ├── MobileNav/
│   ├── CategoryDropdown/
│   └── BrandDropdown/
│
├── storefront/                # Customer-facing components
│   ├── hero/
│   │   ├── HeroSequence/      # Scroll-controlled image sequence
│   │   └── HeroText/
│   ├── products/
│   │   ├── ProductCard/
│   │   ├── ProductGrid/
│   │   ├── ProductFilters/
│   │   ├── ProductGallery/
│   │   └── VariantSelector/
│   ├── cart/
│   │   ├── CartDrawer/
│   │   └── CartItem/
│   ├── checkout/
│   ├── search/
│   │   └── SearchOverlay/
│   └── sections/
│       ├── NewArrivals/
│       ├── FeaturedProducts/
│       ├── CategorySection/
│       ├── BrandSection/
│       ├── WhyUdaya/
│       ├── Testimonials/
│       ├── FAQ/
│       └── PromoClosure/
│
└── admin/                     # Admin panel components
    ├── Dashboard/
    ├── DataTable/
    ├── ProductForm/
    ├── CategoryForm/
    └── OrderDetail/
```

---

## State Management

| Concern | Solution |
|---|---|
| Cart state | Zustand store (persisted to localStorage + synced to DB for logged-in users) |
| Wishlist state | Zustand store (synced to DB for logged-in users) |
| Auth state | NextAuth session |
| UI state (modals, drawer) | Zustand store |
| Server state | React Query / SWR |

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcrypt (rounds: 12) |
| Authentication tokens | JWT (HTTP-only cookies via NextAuth) |
| Admin route protection | Middleware + server-side session checks |
| Payment secrets | Server-side only (never in client bundles) |
| Razorpay verification | HMAC-SHA256 signature verification server-side |
| Webhook verification | Razorpay webhook secret header verification |
| Input validation | Zod schemas (all API routes) |
| Rate limiting | `@upstash/ratelimit` or `express-rate-limit` equivalent |
| CSRF | SameSite cookies + NextAuth CSRF tokens |
| XSS | React's default escaping + CSP headers |
| SQL injection | N/A (MongoDB + Mongoose, parameterized queries) |
| Audit logging | AuditLog model for all critical admin operations |
| Secure headers | `next-safe-headers` or manual via next.config.js |
| File upload validation | MIME type + extension checks before Cloudinary upload |

---

## Performance Architecture

| Concern | Strategy |
|---|---|
| Hero frame sequence | Lazy preload, canvas rendering, responsive resolution sets |
| Images | Cloudinary auto-format + responsive srcset |
| Product listing | Incremental Static Regeneration (ISR) with revalidation |
| Product pages | ISR + dynamic metadata |
| Database queries | Proper MongoDB indexes, projection, pagination |
| API responses | Selective field projection, caching headers |
| Bundle size | Dynamic imports for heavy components (GSAP, gallery) |
| Mobile animations | `prefers-reduced-motion` + device detection |
| Font loading | `next/font` with `font-display: swap` |

---

## Deployment Architecture

```
VPS/Cloud Server
├── Docker Engine
│   ├── Container: udaya-web (Next.js, port 3000)
│   └── Container: nginx (port 80, 443)
│       └── nginx.conf → proxy_pass http://udaya-web:3000
│
├── Certbot (Let's Encrypt SSL)
├── .env.production (secrets, never in git)
└── GitHub Actions / manual deploy script
```

---

## Notification Architecture

```
NotificationService (abstract interface)
├── EmailProvider (SMTP/Nodemailer)
│   └── implements: send(to, template, data)
├── SMSProvider (env-configured API)
│   └── implements: send(phone, message)
└── WhatsAppProvider (env-configured API)
    └── implements: send(phone, template, data)

Events:
- ORDER_CONFIRMED
- PAYMENT_CONFIRMED
- ORDER_PACKED
- ORDER_SHIPPED
- ORDER_IN_TRANSIT
- ORDER_OUT_FOR_DELIVERY
- ORDER_DELIVERED
- ORDER_CANCELLED
- REFUND_PROCESSED
```

---

## Key Design Decisions

1. **No Express server** — All API routes use Next.js API Route Handlers (App Router)
2. **Soft deletes** — Products use `deletedAt` field; restoreable by Super Admin
3. **Admin auth separate from customer auth** — Admin accounts stored in `Admin` collection; customer accounts in `User` collection
4. **Hero frame sequence** — Scroll-controlled canvas-based image sequence; frames stored in Cloudinary with responsive variants
5. **Variant system** — Fully dynamic, no hardcoded variant types; `VariantAttribute` + `VariantCombination` pattern
6. **Price ranges** — Stored in DB, admin-managed; filter logic is database-driven
7. **Cart persistence** — Zustand + localStorage for anonymous; merged to DB on login
8. **Razorpay flow** — Order created server-side → Razorpay order created → Frontend payment → Backend HMAC verification → Order confirmed
9. **COD flow** — Order created server-side directly → Payment status = PENDING → Confirmation page
10. **Inventory tracking** — Every stock change creates `InventoryTransaction` record

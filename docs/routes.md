# UDAYA CYCLES — Route Map

## Storefront Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Homepage (hero, new arrivals, categories, brands, featured, why udaya, testimonials, FAQ) | No |
| `/cycles/category/[slug]` | Category listing with filters | No |
| `/cycles/brand/[slug]` | Brand listing with filters | No |
| `/accessories` | Accessories listing | No |
| `/accessories/[slug]` | Accessory product detail | No |
| `/products/[slug]` | Product detail (cycles) | No |
| `/search` | Full-screen search | No |
| `/cart` | Full cart page | No |
| `/checkout` | Checkout flow | Yes |
| `/wishlist` | Wishlist page | Yes |
| `/account` | Customer profile | Yes |
| `/account/orders` | Order history | Yes |
| `/account/orders/[id]` | Order detail & tracking | Yes |
| `/store-locator` | Interactive store map | No |
| `/contact` | Contact form + info | No |
| `/privacy-policy` | Privacy Policy | No |
| `/terms` | Terms of Service | No |
| `/shipping-policy` | Shipping Policy | No |
| `/refund-policy` | Refund Policy | No |

## Auth Routes

| Route | Page |
|---|---|
| `/login` | Customer login |
| `/register` | Customer registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset (with token) |
| `/verify-email` | Email verification |

## Admin Routes (all protected)

| Route | Page |
|---|---|
| `/admin` | Dashboard (executive overview) |
| `/admin/analytics` | Detailed analytics |
| `/admin/products` | Products list |
| `/admin/products/new` | New product form |
| `/admin/products/[id]` | Edit product |
| `/admin/categories` | Categories list |
| `/admin/categories/new` | New category |
| `/admin/categories/[id]` | Edit category |
| `/admin/brands` | Brands list |
| `/admin/brands/new` | New brand |
| `/admin/brands/[id]` | Edit brand |
| `/admin/accessories` | Accessories management |
| `/admin/orders` | Orders list |
| `/admin/orders/[id]` | Order detail + status update |
| `/admin/customers` | Customers list |
| `/admin/customers/[id]` | Customer detail |
| `/admin/inventory` | Inventory management |
| `/admin/inventory/[productId]` | Product inventory detail + history |
| `/admin/new-arrivals` | New Arrivals management |
| `/admin/featured` | Featured Products management |
| `/admin/testimonials` | Testimonials CRUD |
| `/admin/faq` | FAQ CRUD |
| `/admin/store-locations` | Store Locations CRUD |
| `/admin/homepage` | Homepage CMS |
| `/admin/payments` | Payment records |
| `/admin/notifications` | Notification logs + settings |
| `/admin/settings` | Global site settings |
| `/admin/admins` | Admin accounts (superadmin only) |
| `/admin/price-ranges` | Price range management |
| `/admin/legal` | Legal pages CMS |

## API Routes

### Authentication
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | ALL | — | NextAuth handler |
| `/api/auth/register` | POST | — | Customer registration |
| `/api/auth/verify-email` | GET | — | Email verification |
| `/api/auth/forgot-password` | POST | — | Request reset |
| `/api/auth/reset-password` | POST | — | Perform reset |

### Products
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/products` | GET | — | List products (with filters) |
| `/api/products/[slug]` | GET | — | Single product |
| `/api/products/new-arrivals` | GET | — | New arrival products |
| `/api/products/featured` | GET | — | Featured products |
| `/api/products/search` | GET | — | Search products |

### Categories
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/categories` | GET | — | List active categories |
| `/api/categories/[slug]` | GET | — | Single category |
| `/api/categories/[slug]/products` | GET | — | Products by category |

### Brands
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/brands` | GET | — | List active brands |
| `/api/brands/[slug]` | GET | — | Single brand |
| `/api/brands/[slug]/products` | GET | — | Products by brand |

### Cart
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/cart` | GET | — | Get cart |
| `/api/cart` | POST | — | Add to cart |
| `/api/cart/[itemId]` | PUT | — | Update quantity |
| `/api/cart/[itemId]` | DELETE | — | Remove item |
| `/api/cart/merge` | POST | User | Merge anonymous cart on login |
| `/api/cart/clear` | DELETE | — | Clear cart |

### Wishlist
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/wishlist` | GET | User | Get wishlist |
| `/api/wishlist` | POST | User | Add to wishlist |
| `/api/wishlist/[productId]` | DELETE | User | Remove from wishlist |

### Orders
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/orders` | GET | User | Customer's orders |
| `/api/orders` | POST | User | Create order |
| `/api/orders/[id]` | GET | User | Order detail |
| `/api/orders/[id]/cancel` | POST | User | Cancel order |

### Payments
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/payments/razorpay/create-order` | POST | User | Create Razorpay order |
| `/api/payments/razorpay/verify` | POST | User | Verify payment (HMAC) |
| `/api/webhooks/razorpay` | POST | — | Razorpay webhook |

### Reviews
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/reviews` | POST | User | Submit review |
| `/api/products/[slug]/reviews` | GET | — | Product reviews |

### Misc
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/newsletter/subscribe` | POST | — | Newsletter signup |
| `/api/homepage` | GET | — | Homepage CMS content |
| `/api/search` | GET | — | Full-text search |
| `/api/health` | GET | — | Health check |

### Admin APIs
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/admin/auth/login` | POST | — | Admin login |
| `/api/admin/auth/logout` | POST | Admin | Admin logout |
| `/api/admin/dashboard` | GET | Admin | Dashboard stats |
| `/api/admin/products` | GET,POST | Admin | Products CRUD |
| `/api/admin/products/[id]` | GET,PUT,DELETE | Admin | Product CRUD |
| `/api/admin/products/[id]/restore` | POST | SuperAdmin | Restore deleted |
| `/api/admin/categories` | GET,POST | Admin | Categories CRUD |
| `/api/admin/categories/[id]` | GET,PUT,DELETE | Admin | Category CRUD |
| `/api/admin/brands` | GET,POST | Admin | Brands CRUD |
| `/api/admin/brands/[id]` | GET,PUT,DELETE | Admin | Brand CRUD |
| `/api/admin/orders` | GET | Admin | Orders list |
| `/api/admin/orders/[id]` | GET,PUT | Admin | Order + status update |
| `/api/admin/customers` | GET | Admin | Customers list |
| `/api/admin/inventory/[productId]` | GET,POST | Admin | Inventory + adjustment |
| `/api/admin/reviews` | GET | Admin | Reviews queue |
| `/api/admin/reviews/[id]` | PUT,DELETE | Admin | Review moderation |
| `/api/admin/testimonials` | GET,POST | Admin | Testimonials CRUD |
| `/api/admin/faq` | GET,POST | Admin | FAQ CRUD |
| `/api/admin/store-locations` | GET,POST | Admin | Locations CRUD |
| `/api/admin/homepage` | GET,PUT | Admin | Homepage CMS |
| `/api/admin/price-ranges` | GET,POST | Admin | Price ranges |
| `/api/admin/settings` | GET,PUT | SuperAdmin | Global settings |
| `/api/admin/admins` | GET,POST | SuperAdmin | Admin accounts |
| `/api/admin/admins/[id]` | GET,PUT,DELETE | SuperAdmin | Admin CRUD |
| `/api/admin/notifications` | GET | Admin | Notification logs |
| `/api/admin/legal/[key]` | GET,PUT | Admin | Legal pages |
| `/api/admin/analytics` | GET | Admin | Analytics data |
| `/api/admin/audit-log` | GET | Admin | Audit log |

---

## Middleware Protection

```typescript
// middleware.ts
const protectedRoutes = [
  '/checkout',
  '/wishlist',
  '/account',
];

const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Redirect unauthenticated users to /login
// Redirect non-admin API calls with 401
// Admin routes check admin session separately
```

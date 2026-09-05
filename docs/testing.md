# UDAYA CYCLES — Testing Plan

## Overview

This document defines the testing strategy across all critical workflows.

---

## Test Categories

### 1. Static Analysis
```bash
# TypeScript type checking
npx tsc --noEmit

# ESLint
npx eslint . --ext .ts,.tsx

# Prettier formatting check
npx prettier --check .
```

### 2. Unit Tests (Jest + React Testing Library)

**Auth utilities:**
- Password hashing (bcrypt)
- JWT creation / verification
- Admin JWT utilities

**Utility functions:**
- Price formatting (paise → ₹)
- Slug generation
- Order number generation
- Razorpay signature verification

**Zod schemas:**
- Product create/update schema validation
- Order create schema validation
- Cart item schema validation

### 3. API Integration Tests

**Authentication:**
- `POST /api/auth/register` — creates user, hashes password
- `POST /api/auth/register` — rejects duplicate email
- `POST /api/auth/[...nextauth]` — login with valid credentials
- `POST /api/auth/[...nextauth]` — rejects invalid credentials
- Admin login — correct username/password succeeds
- Admin login — wrong password returns 401
- Admin login — inactive account returns 403

**Products:**
- `GET /api/products` — returns paginated products
- `GET /api/products?category=electric-cycles` — filters by category
- `GET /api/products?brand=t-rex` — filters by brand
- `GET /api/products?minPrice=X&maxPrice=Y` — price range filter
- `GET /api/products?availability=in-stock` — availability filter
- `GET /api/products/[slug]` — returns full product with variants
- `GET /api/products/new-arrivals` — returns only isNewArrival=true
- `GET /api/products/featured` — returns only isFeatured=true

**Cart:**
- Add item to anonymous cart
- Add item to authenticated cart
- Update item quantity
- Remove item
- Cart merge on login
- Cart persistence across requests

**Checkout:**
- Creates order with COD payment method
- Creates Razorpay order (mocked)
- Verifies Razorpay payment signature (mocked)
- Rejects invalid Razorpay signature
- Reduces stock on order confirmation
- Creates InventoryTransaction on stock change

**Wishlist:**
- Add product to wishlist (authenticated)
- Remove product from wishlist
- Rejects unauthenticated wishlist requests

**Orders:**
- `GET /api/orders` — returns only current user's orders
- Cannot access another user's order detail
- Admin can access all orders

**Admin Authorization:**
- Admin routes reject unauthenticated requests (401)
- Admin routes reject non-admin user tokens (403)
- Super admin routes reject regular admin tokens (403)
- `DELETE /api/admin/categories/[id]` — rejects if products exist

**Reviews:**
- Only users with delivered orders can submit verified review
- Cannot submit review without purchase
- Admin can approve/hide/delete reviews

**Inventory:**
- Every stock adjustment creates InventoryTransaction
- Stock cannot go below 0 (unless backorder enabled)
- Out-of-stock products show correct availability

**Payment:**
- `POST /api/payments/razorpay/verify` — verifies HMAC correctly
- Order not marked paid until verification succeeds
- Webhook handler verifies Razorpay webhook signature

### 4. Category/Brand Deletion Tests

```
DELETE /api/admin/categories/[id]
  ✓ Returns 400 if category has products
  ✓ Returns 200 and deletes if category is empty

DELETE /api/admin/brands/[id]
  ✓ Returns 400 if brand has products
  ✓ Returns 200 and deletes if brand is empty
```

### 5. Soft Delete Tests

```
DELETE /api/admin/products/[id]
  ✓ Sets deletedAt (soft delete)
  ✓ Product no longer appears in storefront
  ✓ Product still in database (deletedAt is set)
  ✓ Super admin can restore via /api/admin/products/[id]/restore
```

### 6. Product Filtering Tests

```
Category page: /cycles/category/electric-cycles
  ✓ Shows only products with category = 'electric-cycles'
  ✓ Filter: In Stock shows only stock > 0
  ✓ Filter: Out of Stock shows only stock = 0
  ✓ Price range filter uses admin-configured ranges
  ✓ Sort: price low to high
  ✓ Sort: price high to low
  ✓ Sort: newest first

Brand page: /cycles/brand/t-rex
  ✓ Shows only T-Rex products
```

### 7. Browser/E2E Tests (Manual + Playwright if time permits)

**Homepage:**
- [ ] Hero section loads and scroll controls frames
- [ ] Navigation opens category/brand dropdowns on hover (desktop)
- [ ] Navigation opens on tap (mobile)
- [ ] New Arrivals products load and display correctly
- [ ] Category cards link to correct category pages
- [ ] Brand cards link to correct brand pages
- [ ] Search overlay opens on icon click
- [ ] Footer newsletter form submits

**Product Page:**
- [ ] Images load, zoom works
- [ ] Variant selection updates price and image
- [ ] Add to Cart opens cart drawer
- [ ] Cart badge updates
- [ ] Buy Now redirects to checkout with single item
- [ ] Wishlist toggle works (logged in)
- [ ] Wishlist redirects to login (logged out)

**Cart:**
- [ ] Items persist across page navigation
- [ ] Drawer opens on Add to Cart
- [ ] Drawer closes without removing items
- [ ] Header cart icon opens drawer
- [ ] View Cart opens full cart page
- [ ] Quantity updates work
- [ ] Remove item works
- [ ] Cart total recalculates correctly

**Checkout:**
- [ ] Requires login (redirects if not authenticated)
- [ ] Address form validates all required fields
- [ ] Order summary shows correct items and total
- [ ] Shipping calculation works based on threshold
- [ ] COD: places order, shows confirmation page
- [ ] Razorpay: opens payment modal, verifies on success

**Admin:**
- [ ] Admin login works
- [ ] Dashboard shows key metrics
- [ ] Product list loads with pagination
- [ ] Create product with variants works
- [ ] Soft delete shows confirmation modal
- [ ] Category with products cannot be deleted (error shown)
- [ ] Order status can be updated
- [ ] Inventory adjustment creates transaction

**Responsive:**
- [ ] Homepage on mobile (375px)
- [ ] Navigation mobile menu
- [ ] Product page on mobile
- [ ] Cart drawer on mobile
- [ ] Checkout on mobile
- [ ] Admin panel on tablet

---

## Test Commands

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Type check
npm run type-check

# Lint
npm run lint

# Build (production)
npm run build
```

---

## Continuous Integration Checklist

Before merging to main:
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] Manual browser verification of changed features

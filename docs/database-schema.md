# UDAYA CYCLES — Database Schema

## Overview

MongoDB Atlas with Mongoose ODM. All collections use proper indexes, references, and soft-delete patterns where applicable.

---

## Collections

### 1. User

```typescript
{
  _id: ObjectId,
  firstName: String,          // required
  lastName: String,           // required
  email: String,              // required, unique, indexed
  phone: String,              // required, indexed
  passwordHash: String,       // bcrypt, never returned in API
  avatar: String,             // Cloudinary URL (optional)
  addresses: [
    {
      _id: ObjectId,
      label: String,          // Home / Office / etc.
      firstName: String,
      lastName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,   // optional
      city: String,
      state: String,
      pinCode: String,
      isDefault: Boolean
    }
  ],
  wishlist: [ObjectId],       // ref: Product
  isActive: Boolean,          // default: true
  emailVerified: Boolean,     // default: false
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- phone (unique)
```

---

### 2. Admin

```typescript
{
  _id: ObjectId,
  username: String,           // required, unique
  email: String,              // optional
  passwordHash: String,       // bcrypt
  role: 'superadmin' | 'admin',  // superadmin = full access
  isActive: Boolean,          // default: true
  createdBy: ObjectId,        // ref: Admin (null for initial superadmin)
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- username (unique)
```

---

### 3. Category

```typescript
{
  _id: ObjectId,
  name: String,               // required, unique
  slug: String,               // required, unique, indexed
  description: String,
  image: {
    url: String,              // Cloudinary URL
    publicId: String          // Cloudinary public ID
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  isActive: Boolean,          // default: true
  sortOrder: Number,          // for ordering in homepage section
  productCount: Number,       // virtual / cached count
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- slug (unique)
- isActive
```

---

### 4. Brand

```typescript
{
  _id: ObjectId,
  name: String,               // required, unique
  slug: String,               // required, unique, indexed
  description: String,
  logo: {
    url: String,              // Cloudinary URL
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  isActive: Boolean,          // default: true
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- slug (unique)
- isActive
```

---

### 5. AccessoryCategory

```typescript
{
  _id: ObjectId,
  name: String,               // required
  slug: String,               // required, unique
  description: String,
  image: {
    url: String,
    publicId: String
  },
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- slug (unique)
```

---

### 6. Product

```typescript
{
  _id: ObjectId,
  name: String,               // required
  slug: String,               // required, unique, indexed
  sku: String,                // required, unique (base SKU)
  barcode: String,            // optional
  
  // Classification
  type: 'cycle' | 'accessory',
  category: ObjectId,         // ref: Category (for cycles)
  accessoryCategory: ObjectId, // ref: AccessoryCategory (for accessories)
  brand: ObjectId,            // ref: Brand
  
  // Description
  description: String,        // Rich text (HTML)
  shortDescription: String,
  
  // Media
  images: [
    {
      url: String,            // Cloudinary URL
      publicId: String,
      alt: String,
      sortOrder: Number,
      isDefault: Boolean
    }
  ],
  videos: [
    {
      url: String,            // Cloudinary URL
      publicId: String,
      thumbnail: String
    }
  ],
  
  // Pricing (base - variants override)
  regularPrice: Number,       // in paise (₹1 = 100 paise)
  salePrice: Number,          // optional; if set, shown as discounted
  
  // Inventory (base - variants override)
  stock: Number,              // default: 0
  lowStockThreshold: Number,  // default: 5
  
  // Flags
  isActive: Boolean,          // default: true; controls storefront visibility
  isNewArrival: Boolean,      // default: false
  isFeatured: Boolean,        // default: false
  newArrivalOrder: Number,    // for ordering in New Arrivals section
  featuredOrder: Number,      // for ordering in Featured section
  allowBackorder: Boolean,    // default: false
  hideWhenOutOfStock: Boolean, // default: false
  
  // Variant system
  hasVariants: Boolean,       // default: false
  variantAttributes: [
    {
      name: String,           // e.g., "Color", "Frame Size"
      values: [String]        // e.g., ["Black", "White", "Neon"]
    }
  ],
  
  // Specifications (dynamic)
  specifications: [
    {
      groupName: String,      // e.g., "Frame & Fork"
      fields: [
        {
          label: String,      // e.g., "Material"
          value: String       // e.g., "Aluminium Alloy 6061"
        }
      ]
    }
  ],
  
  // Warranty
  warranty: {
    duration: String,         // e.g., "2 Years"
    description: String
  },
  
  // Supplier
  supplier: {
    name: String,
    contactPerson: String,
    phone: String,
    email: String,
    costPrice: Number         // in paise
  },
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },
  
  // Soft delete
  deletedAt: Date,            // null = active; set = soft-deleted
  deletedBy: ObjectId,        // ref: Admin
  
  // Ratings summary (cached from reviews)
  averageRating: Number,      // 0–5
  reviewCount: Number,
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- slug (unique)
- category
- brand
- accessoryCategory
- type
- isActive, isNewArrival
- isActive, isFeatured
- deletedAt
- text: name, description (full-text search)
```

---

### 7. ProductVariant

```typescript
{
  _id: ObjectId,
  product: ObjectId,          // ref: Product, required, indexed
  
  // Attribute combination
  // e.g., { "Color": "Black", "Frame Size": "M" }
  attributes: Map<String, String>,
  
  // Identity
  sku: String,                // required, unique
  barcode: String,
  
  // Pricing (overrides product base)
  regularPrice: Number,       // in paise
  salePrice: Number,
  
  // Inventory
  stock: Number,              // default: 0
  
  // Media (variant-specific)
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  
  isActive: Boolean,          // default: true
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- product
- sku (unique)
- product, attributes (compound)
```

---

### 8. PriceRange

```typescript
{
  _id: ObjectId,
  label: String,              // e.g., "₹10K–₹20K"
  minPrice: Number,           // in paise
  maxPrice: Number,           // in paise (use Infinity-equivalent: 999999999)
  sortOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 9. Cart

```typescript
{
  _id: ObjectId,
  user: ObjectId,             // ref: User (null for anonymous)
  sessionId: String,          // for anonymous carts
  
  items: [
    {
      product: ObjectId,      // ref: Product
      variant: ObjectId,      // ref: ProductVariant (null if no variants)
      quantity: Number,
      priceAtAdd: Number,     // snapshot in paise
      salePriceAtAdd: Number  // snapshot
    }
  ],
  
  // Shipping
  appliedCoupon: String,      // future: coupon code
  
  expiresAt: Date,            // TTL for anonymous carts
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- user (sparse)
- sessionId (sparse)
- expiresAt (TTL index for anonymous)
```

---

### 10. Wishlist

```typescript
// Embedded in User.wishlist as array of Product ObjectIds
// OR as separate collection for flexibility:

{
  _id: ObjectId,
  user: ObjectId,             // ref: User, required, indexed
  products: [ObjectId],       // ref: Product
  createdAt: Date,
  updatedAt: Date
}
```

---

### 11. Order

```typescript
{
  _id: ObjectId,
  orderNumber: String,        // e.g., "UC-2024-00001", indexed, unique
  
  user: ObjectId,             // ref: User (null for guest — future)
  
  // Customer snapshot
  customerDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  
  // Shipping address snapshot
  shippingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pinCode: String
  },
  
  // Items snapshot
  items: [
    {
      product: ObjectId,      // ref: Product
      variant: ObjectId,      // ref: ProductVariant
      productSnapshot: {      // immutable snapshot at order time
        name: String,
        sku: String,
        image: String,
        brand: String,
        category: String,
        attributes: Object
      },
      quantity: Number,
      unitPrice: Number,      // in paise
      totalPrice: Number      // quantity × unitPrice
    }
  ],
  
  // Financials
  subtotal: Number,           // in paise
  shippingFee: Number,        // in paise (0 = free)
  discount: Number,           // in paise
  total: Number,              // in paise
  
  // Payment
  paymentMethod: 'razorpay' | 'cod',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  razorpayOrderId: String,    // from Razorpay
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Order status
  status: 
    'payment_pending' |
    'payment_confirmed' |
    'order_confirmed' |
    'processing' |
    'packed' |
    'shipped' |
    'in_transit' |
    'out_for_delivery' |
    'delivered' |
    'failed_delivery' |
    'returned' |
    'refunded' |
    'cancelled',
  
  // Timeline
  statusHistory: [
    {
      status: String,
      note: String,
      updatedBy: ObjectId,    // ref: Admin
      timestamp: Date
    }
  ],
  
  // Tracking
  trackingNumber: String,
  trackingUrl: String,
  courierPartner: String,
  estimatedDelivery: Date,
  
  notes: String,              // admin notes
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- orderNumber (unique)
- user
- status
- paymentStatus
- createdAt (for dashboard analytics)
```

---

### 12. InventoryTransaction

```typescript
{
  _id: ObjectId,
  product: ObjectId,          // ref: Product, indexed
  variant: ObjectId,          // ref: ProductVariant (null if no variant)
  
  type: 'restock' | 'sale' | 'return' | 'adjustment' | 'writeoff',
  
  previousQuantity: Number,
  adjustment: Number,         // positive = added, negative = removed
  newQuantity: Number,
  
  reason: String,
  reference: String,          // e.g., order number
  
  performedBy: ObjectId,      // ref: Admin
  
  createdAt: Date
}

Indexes:
- product
- variant
- createdAt
```

---

### 13. Review

```typescript
{
  _id: ObjectId,
  product: ObjectId,          // ref: Product, indexed
  user: ObjectId,             // ref: User, indexed
  order: ObjectId,            // ref: Order (for verified purchase)
  
  rating: Number,             // 1–5
  title: String,
  body: String,
  
  verifiedPurchase: Boolean,  // true only if order ref exists and delivered
  
  status: 'pending' | 'approved' | 'hidden' | 'deleted',
  isFeatured: Boolean,
  
  adminNote: String,          // internal
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- product, status
- user
- order
```

---

### 14. Testimonial

```typescript
{
  _id: ObjectId,
  customerName: String,
  customerPhoto: {
    url: String,
    publicId: String
  },
  rating: Number,             // 1–5
  reviewText: String,
  purchasedProduct: String,   // product name (text, not ref)
  isFeatured: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 15. FAQ

```typescript
{
  _id: ObjectId,
  question: String,
  answer: String,             // can contain HTML
  category: String,           // optional grouping
  sortOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 16. StoreLocation

```typescript
{
  _id: ObjectId,
  name: String,               // Branch name
  address: String,
  city: String,
  state: String,
  pinCode: String,
  phone: String,
  whatsapp: String,
  email: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  hours: [
    {
      day: String,            // "Monday", "Tuesday", etc.
      open: String,           // "09:00"
      close: String,          // "20:00"
      isClosed: Boolean
    }
  ],
  image: {
    url: String,
    publicId: String
  },
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 17. HomepageSection

```typescript
{
  _id: ObjectId,
  key: String,                // unique identifier: 'hero', 'new_arrivals', etc.
  title: String,              // display title for admin
  isVisible: Boolean,
  sortOrder: Number,
  updatedAt: Date,
  updatedBy: ObjectId         // ref: Admin
}
```

---

### 18. HomepageSettings

```typescript
{
  _id: ObjectId,
  singleton: Boolean,         // always true, only one document
  
  hero: {
    headline: String,
    subheadline: String,
    ctaText: String,
    ctaUrl: String
  },
  
  whyUdaya: {
    heading: String,
    subheading: String,
    items: [
      {
        icon: String,
        title: String,
        description: String
      }
    ]
  },
  
  promoClosure: {
    heading: String,
    subheading: String,
    primaryCtaText: String,
    primaryCtaUrl: String,
    secondaryCtaText: String,
    secondaryCtaUrl: String
  },
  
  sitewide: {
    freeShippingThreshold: Number,  // in paise
    standardShippingFee: Number,    // in paise
    freeShippingEnabled: Boolean,
    maintenanceMode: Boolean
  },
  
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    address: String,
    businessHours: String,
    instagram: String,
    facebook: String,
    youtube: String,
    twitter: String
  },
  
  updatedAt: Date,
  updatedBy: ObjectId
}
```

---

### 19. ShippingSettings

```typescript
// Embedded in HomepageSettings.sitewide
// Kept separate here for reference

{
  freeShippingThreshold: Number,  // in paise
  standardShippingFee: Number,    // in paise
  freeShippingEnabled: Boolean
}
```

---

### 20. Notification

```typescript
{
  _id: ObjectId,
  type: 'email' | 'sms' | 'whatsapp',
  event: String,              // ORDER_CONFIRMED, etc.
  recipient: String,          // email or phone
  order: ObjectId,            // ref: Order
  user: ObjectId,             // ref: User
  
  status: 'pending' | 'sent' | 'failed',
  
  payload: Object,            // template data
  error: String,              // error message if failed
  
  sentAt: Date,
  createdAt: Date
}

Indexes:
- order
- status
- createdAt
```

---

### 21. NewsletterSubscriber

```typescript
{
  _id: ObjectId,
  email: String,              // unique, indexed
  isActive: Boolean,
  subscribedAt: Date,
  unsubscribedAt: Date,
  unsubscribeToken: String    // for one-click unsubscribe
}

Indexes:
- email (unique)
```

---

### 22. LegalPage

```typescript
{
  _id: ObjectId,
  key: 'privacy-policy' | 'terms' | 'shipping-policy' | 'refund-policy',
  title: String,
  content: String,            // Rich text / HTML
  lastUpdated: Date,
  updatedBy: ObjectId,        // ref: Admin
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- key (unique)
```

---

### 23. AuditLog

```typescript
{
  _id: ObjectId,
  admin: ObjectId,            // ref: Admin
  action: String,             // e.g., 'product.delete', 'order.status_update'
  entity: String,             // e.g., 'Product', 'Order'
  entityId: ObjectId,
  
  before: Object,             // snapshot before change
  after: Object,              // snapshot after change
  
  ipAddress: String,
  userAgent: String,
  
  createdAt: Date
}

Indexes:
- admin
- entity, entityId
- createdAt
- action
```

---

## Index Summary

| Collection | Key Indexes |
|---|---|
| User | email (unique), phone (unique) |
| Admin | username (unique) |
| Category | slug (unique), isActive |
| Brand | slug (unique), isActive |
| Product | slug (unique), category, brand, type, isActive+isNewArrival, isActive+isFeatured, text(name+desc) |
| ProductVariant | product, sku (unique), product+attributes |
| Order | orderNumber (unique), user, status, paymentStatus, createdAt |
| InventoryTransaction | product, variant, createdAt |
| Review | product+status, user, order |
| Cart | user (sparse), sessionId (sparse), expiresAt (TTL) |
| AuditLog | admin, entity+entityId, createdAt |

---

## Data Integrity Rules

1. **Category deletion** — blocked if products with that category exist
2. **Brand deletion** — blocked if products with that brand exist
3. **Product deletion** — soft delete only (set `deletedAt`)
4. **Prices** — stored in paise (integer), converted to ₹ at display layer
5. **Order amounts** — immutable after creation; snapshots taken at checkout
6. **Review verification** — `verifiedPurchase: true` only set server-side when order exists, belongs to user, and status is `delivered`
7. **Inventory** — every stock change creates `InventoryTransaction`; stock never goes below 0 (unless backorder enabled)

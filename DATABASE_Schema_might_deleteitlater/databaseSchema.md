# Làng & Co. — Final MongoDB Database Schema

**Project:** Làng & Co.  
**Course:** COSC3060 — Web Programming Studio  
**Database:** MongoDB Atlas with Mongoose  
**Scope:** Users, Administration, Products, Shopping Cart, Orders, Product Reviews, Gift Cards, Blog, Discussion Forum.

> This file is the **target database schema for A3**.  
> It is written in Mongoose-style code so the database design can be compared directly with the implementation.

---

# 1. Design Principles

1. Existing application IDs are preserved as `String` values where the current application already depends on UUIDs, custom IDs, or slugs.
2. User-owned content stores the owner's User ID for server-side ownership and access-control checks.
3. `OrderItems` store a purchase-time snapshot so historical orders do not change if a Product is edited later.
4. Forum posts remain embedded inside `ForumThreads` because the current forum module retrieves and mutates `thread.posts`.
5. Forum post deletion uses **soft delete** so deleted posts disappear from public view but remain in MongoDB for auditing.
6. Many-to-many interactions such as likes, dislikes, and bookmarks are stored as arrays of User IDs.
7. Images and uploaded files remain in the project/upload storage; only URL/path strings are stored in MongoDB.
8. Indexes are defined for fields used in ownership checks, retrieval, filtering, sorting, and search.
9. Full payment card numbers and CVV values are never persisted.

---

# 2. Users

**Collection:** `users`

**Suggested file:** `models/schemas/User.js`

```js
"use strict";

const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    emailUpdates: {
      type: Boolean,
      default: true,
    },

    orderNotifications: {
      type: Boolean,
      default: true,
    },

    communityReplies: {
      type: Boolean,
      default: false,
    },

    promotionalUpdates: {
      type: Boolean,
      default: true,
    },

    saveShippingInformation: {
      type: Boolean,
      default: true,
    },

    internationalShippingDefault: {
      type: Boolean,
      default: false,
    },

    productCareGuides: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    firstname: {
      type: String,
      default: "",
      trim: true,
    },

    lastname: {
      type: String,
      default: "",
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "deactivated"],
      default: "active",
      index: true,
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    postalCode: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "/images/profile.png",
    },

    tier: {
      type: String,
      default: "Craft Collector",
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    requiresPasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

userSchema.index(
  {
    username: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Users",
  userSchema
);
```

---

# 3. Password Reset Requests

**Collection:** `passwordresetrequests`

**Suggested file:** `models/schemas/PasswordResetRequest.js`

The current reset workflow starts from the user's email address, so this is a logical association with Users rather than a strict `userId` foreign-key relationship.

```js
"use strict";

const mongoose = require("mongoose");

const resetSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "resolved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    tempPassword: {
      type: String,
      default: null,
    },
  },
  {
    collection: "passwordresetrequests",
  }
);

resetSchema.index({
  status: 1,
  requestedAt: -1,
});

resetSchema.index({
  email: 1,
  requestedAt: -1,
});

module.exports = mongoose.model(
  "PasswordResetRequests",
  resetSchema
);
```

> For a stronger production design, replace plaintext `tempPassword` persistence with a one-time reset token/hash. The account password itself must remain stored only as `Users.passwordHash`.

---

# 4. Products

**Collection:** `products`

**Suggested file:** `models/schemas/Product.js`

```js
"use strict";

const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: "",
    },

    label: {
      type: String,
      default: "",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const makerNoteSchema = new mongoose.Schema(
  {
    seal: {
      type: String,
      default: "",
    },

    quote: {
      type: String,
      default: "",
    },

    cite: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const specificationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
    },

    value: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    weightGram: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      default: "published",
      index: true,
    },

    maker: {
      type: String,
      default: "",
      index: true,
    },

    makerLocation: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
      index: true,
    },

    tag: {
      type: String,
      default: "",
    },

    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    variant: {
      type: String,
      default: "Standard",
    },

    alt: {
      type: String,
      default: "",
    },

    featuredOrder: {
      type: Number,
      default: 999,
      index: true,
    },

    sizes: {
      type: [sizeSchema],
      default: [],
    },

    makerNote: {
      type: makerNoteSchema,
      default: null,
    },

    specifications: {
      type: [specificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

productSchema.index({
  status: 1,
  category: 1,
  featuredOrder: 1,
});

productSchema.index({
  status: 1,
  maker: 1,
});

productSchema.index({
  status: 1,
  material: 1,
});

productSchema.index({
  title: "text",
  description: "text",
  tag: "text",
});

module.exports = mongoose.model(
  "Products",
  productSchema
);
```

---

# 5. Carts

**Collection:** `carts`

**Suggested file:** `models/schemas/Cart.js`

```js
"use strict";

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    userId: {
      type: String,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

cartSchema.index(
  {
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Carts",
  cartSchema
);
```

### Relationship

```text
Users 1 ---- 0..1 Carts
```

A unique `userId` means a registered user can have at most one active cart document.

---

# 6. Cart Items

**Collection:** `cartitems`

**Suggested file:** `models/schemas/CartItem.js`

```js
"use strict";

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: String,
      ref: "Carts",
      required: true,
      index: true,
    },

    itemType: {
      type: String,
      enum: [
        "product",
        "giftcard",
      ],
      required: true,
      index: true,
    },

    productId: {
      type: String,
      ref: "Products",
      default: null,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    giftcardDraft: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "cartitems",
  }
);

cartItemSchema.index({
  cartId: 1,
  itemType: 1,
});

cartItemSchema.index({
  cartId: 1,
  productId: 1,
});

module.exports = mongoose.model(
  "CartItems",
  cartItemSchema
);
```

### Relationships

```text
Carts    1 ---- N CartItems
Products 1 ---- N CartItems
```

`Products → CartItems` applies when:

```js
itemType === "product"
```

For gift-card cart items:

```js
itemType === "giftcard"
```

the current draft configuration is stored in:

```js
giftcardDraft
```

---

# 7. Orders

**Collection:** `orders`

**Suggested file:** `models/schemas/Order.js`

```js
"use strict";

const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    email: String,
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  {
    _id: false,
  }
);

const shippingSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      default: "",
    },

    fee: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      default: "card",
    },

    cardName: {
      type: String,
      default: "",
    },

    cardLastFour: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    userId: {
      type: String,
      ref: "Users",
      required: true,
      index: true,
    },

    delivery: {
      type: deliverySchema,
      required: true,
    },

    shipping: {
      type: shippingSchema,
      required: true,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    giftNote: {
      type: String,
      default: "",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      default: "confirmed",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

orderSchema.index({
  userId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Orders",
  orderSchema
);
```

### Relationship

```text
Users 1 ---- N Orders
```

---

# 8. Order Items

**Collection:** `orderitems`

**Suggested file:** `models/schemas/OrderItem.js`

`OrderItems` intentionally store historical snapshots.

```js
"use strict";

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      ref: "Orders",
      required: true,
      index: true,
    },

    itemType: {
      type: String,
      enum: [
        "product",
        "giftcard",
      ],
      required: true,
      index: true,
    },

    productId: {
      type: String,
      ref: "Products",
      default: null,
      index: true,
    },

    giftcardId: {
      type: String,
      ref: "GiftCards",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    maker: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
    },

    variant: {
      type: String,
      default: "",
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    giftcardCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
    collection: "orderitems",
  }
);

orderItemSchema.index({
  orderId: 1,
});

orderItemSchema.index({
  productId: 1,
});

orderItemSchema.index({
  giftcardId: 1,
});

module.exports = mongoose.model(
  "OrderItems",
  orderItemSchema
);
```

### Relationships

```text
Orders    1 ---- N OrderItems
Products  1 ---- N OrderItems
GiftCards 1 ---- N OrderItems
```

`Products → OrderItems` applies to product items.

`GiftCards → OrderItems` is optional and applies only when a checkout flow creates a persistent GiftCard record.

### Why the snapshot is required

These fields are deliberately duplicated:

```js
title
image
maker
material
variant
unitPrice
lineTotal
giftcardCode
```

They represent the state of the purchased item at checkout time. This prevents historical orders from changing when the current Product document is edited.

---

# 9. Reviews

**Collection:** `reviews`

**Suggested file:** `models/schemas/Review.js`

```js
"use strict";

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    productId: {
      type: String,
      ref: "Products",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      ref: "Users",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    dateAdded: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "reviews",
  }
);

reviewSchema.index({
  productId: 1,
  dateAdded: -1,
});

reviewSchema.index({
  productId: 1,
  rating: -1,
});

reviewSchema.index({
  userId: 1,
  dateAdded: -1,
});

module.exports = mongoose.model(
  "Reviews",
  reviewSchema
);
```

### Relationships

```text
Products 1 ---- N Reviews
Users    1 ---- N Reviews
```

---

# 10. Gift Cards

**Collection:** `giftcards`

**Suggested file:** `models/schemas/GiftCard.js`

```js
"use strict";

const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    createdByUserId: {
      type: String,
      ref: "Users",
      default: null,
      index: true,
    },

    giftType: {
      type: String,
      required: true,
    },

    deliveryType: {
      type: String,
      required: true,
    },

    designType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    amountPerCard: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    recipientName: {
      type: String,
      default: "",
    },

    senderName: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    causeCategory: {
      type: String,
      default: null,
    },

    causeNote: {
      type: String,
      default: "",
    },

    digital: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    printable: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    physical: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "giftcards",
  }
);

giftCardSchema.index(
  {
    code: 1,
  },
  {
    unique: true,
  }
);

giftCardSchema.index({
  createdByUserId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "GiftCards",
  giftCardSchema
);
```

### Relationship

```text
Users 1 ---- N GiftCards
```

---

# 11. Blog Posts

**Collection:** `blogposts`

**Suggested file:** `models/schemas/BlogPost.js`

```js
"use strict";

const mongoose = require("mongoose");

const blogAuthorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      ref: "Users",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    initials: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "Author",
    },
  },
  {
    _id: false,
  }
);

const blogImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    listUrl: {
      type: String,
      default: "",
    },

    alt: {
      type: String,
      default: "",
    },

    caption: {
      type: String,
      default: "",
    },

    listCaption: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const blogPostSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    author: {
      type: blogAuthorSchema,
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    readTime: {
      type: Number,
      default: 1,
      min: 1,
    },

    summary: {
      type: String,
      default: "",
    },

    archiveSummary: {
      type: String,
      default: "",
    },

    image: {
      type: blogImageSchema,
      default: () => ({}),
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
      ],
      default: "draft",
      index: true,
    },

    isLead: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    content: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "blogposts",
  }
);

blogPostSchema.index({
  "author.id": 1,
  updatedAt: -1,
});

blogPostSchema.index({
  status: 1,
  category: 1,
  publishedAt: -1,
});

blogPostSchema.index({
  title: "text",
  summary: "text",
  tags: "text",
});

module.exports = mongoose.model(
  "BlogPosts",
  blogPostSchema
);
```

### Relationship

```text
Users 1 ---- N BlogPosts
```

---

# 12. Blog Comments

**Collection:** `blogcomments`

**Suggested file:** `models/schemas/BlogComment.js`

```js
"use strict";

const mongoose = require("mongoose");

const commentAuthorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      ref: "Users",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    initials: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const blogCommentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    postId: {
      type: String,
      ref: "BlogPosts",
      required: true,
      index: true,
    },

    parentCommentId: {
      type: String,
      ref: "BlogComments",
      default: null,
      index: true,
    },

    author: {
      type: commentAuthorSchema,
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    likedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    status: {
      type: String,
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "blogcomments",
  }
);

blogCommentSchema.index({
  postId: 1,
  parentCommentId: 1,
  createdAt: 1,
});

blogCommentSchema.index({
  "author.id": 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "BlogComments",
  blogCommentSchema
);
```

### Relationships

```text
BlogPosts    1 ---- N BlogComments
BlogComments 1 ---- N BlogComments
Users        N ---- N BlogComments
```

The self-reference is implemented through:

```js
parentCommentId
```

The many-to-many User interaction is implemented through:

```js
likedBy[]
```

---

# 13. Forum Threads + Embedded Forum Posts

**Collection:** `forumthreads`

**Suggested file:** `models/schemas/ForumThread.js`

Forum posts remain embedded because the current application commonly retrieves and mutates them through `thread.posts`.

```js
"use strict";

const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "",
    },

    authorId: {
      type: String,
      ref: "Users",
      default: null,
    },

    initials: {
      type: String,
      default: "",
    },

    rank: {
      type: String,
      default: "Member",
    },

    date: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    parentPostId: {
      type: String,
      default: null,
    },

    likedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    dislikedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    bookmarkedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    reportedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    status: {
      type: String,
      enum: [
        "active",
        "deleted",
      ],
      default: "active",
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      ref: "Users",
      default: null,
    },
  },
  {
    _id: false,
  }
);

const forumThreadSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    authorId: {
      type: String,
      ref: "Users",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
      ],
      default: "published",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    locked: {
      type: Boolean,
      default: false,
    },

    hidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    posts: {
      type: [forumPostSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "forumthreads",
  }
);

forumThreadSchema.index(
  {
    slug: 1,
  },
  {
    unique: true,
  }
);

forumThreadSchema.index({
  status: 1,
  hidden: 1,
  category: 1,
  createdAt: -1,
});

forumThreadSchema.index({
  title: "text",
  "posts.content": "text",
  tags: "text",
});

forumThreadSchema.index({
  authorId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ForumThreads",
  forumThreadSchema
);
```

### Relationships

```text
Users        1 ---- N ForumThreads
ForumThreads 1 ---- N ForumPosts
Users        N ---- N ForumPosts
```

`ForumPosts` is a **logical entity** in the database diagram but is physically embedded in `ForumThreads.posts`.

The many-to-many relationships are represented through:

```js
likedBy[]
dislikedBy[]
bookmarkedBy[]
```

### Forum soft delete

Deleting a forum post must update the embedded post:

```js
{
  status: "deleted",
  deletedAt: new Date(),
  deletedBy: currentUserId,
}
```

instead of removing it with:

```js
thread.posts.splice(...)
```

Public queries must exclude or mask posts whose:

```js
status === "deleted"
```

---

# 14. Forum Reports

**Collection:** `forumreports`

**Suggested file:** `models/schemas/ForumReport.js`

```js
"use strict";

const mongoose = require("mongoose");

const forumReportSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    threadSlug: {
      type: String,
      ref: "ForumThreads",
      required: true,
      index: true,
    },

    postId: {
      type: String,
      required: true,
      index: true,
    },

    reporterId: {
      type: String,
      ref: "Users",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "open",
        "resolved",
        "dismissed",
      ],
      default: "open",
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "forumreports",
  }
);

forumReportSchema.index({
  status: 1,
  createdAt: -1,
});

forumReportSchema.index({
  reporterId: 1,
  createdAt: -1,
});

forumReportSchema.index(
  {
    threadSlug: 1,
    postId: 1,
    reporterId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ForumReports",
  forumReportSchema
);
```

### Relationships

```text
ForumThreads 1 ---- N ForumReports
Users        1 ---- N ForumReports
```

The compound unique index prevents the same user from reporting the same forum post more than once.

---

# 15. Forum Notifications

**Collection:** `forumnotifications`

**Suggested file:** `models/schemas/ForumNotification.js`

```js
"use strict";

const mongoose = require("mongoose");

const forumNotificationSchema =
  new mongoose.Schema(
    {
      _id: {
        type: String,
      },

      userId: {
        type: String,
        ref: "Users",
        required: true,
        index: true,
      },

      type: {
        type: String,
        required: true,
      },

      threadSlug: {
        type: String,
        ref: "ForumThreads",
        required: true,
      },

      postId: {
        type: String,
        required: true,
      },

      actorId: {
        type: String,
        ref: "Users",
        required: true,
      },

      actorName: {
        type: String,
        required: true,
      },

      read: {
        type: Boolean,
        default: false,
        index: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      collection: "forumnotifications",
    }
  );

forumNotificationSchema.index({
  userId: 1,
  read: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ForumNotifications",
  forumNotificationSchema
);
```

### Relationship

```text
Users 1 ---- N ForumNotifications
```

---

# 16. Relationship Summary

```text
ONE-TO-ZERO-OR-ONE

Users 1 -------- 0..1 Carts


ONE-TO-MANY

Carts 1 -------- N CartItems
Products 1 ----- N CartItems
Users 1 -------- N Orders
Orders 1 ------- N OrderItems
Products 1 ----- N OrderItems
GiftCards 1 ---- N OrderItems
Products 1 ----- N Reviews
Users 1 -------- N Reviews
Users 1 -------- N GiftCards
Users 1 -------- N BlogPosts
BlogPosts 1 ---- N BlogComments
BlogComments 1 - N BlogComments
Users 1 -------- N ForumThreads
ForumThreads 1 - N ForumPosts
ForumThreads 1 - N ForumReports
Users 1 -------- N ForumReports
Users 1 -------- N ForumNotifications


MANY-TO-MANY

Users N -------- N BlogComments
via BlogComments.likedBy[]

Users N -------- N ForumPosts
via ForumPost.likedBy[]

Users N -------- N ForumPosts
via ForumPost.dislikedBy[]

Users N -------- N ForumPosts
via ForumPost.bookmarkedBy[]
```

`PasswordResetRequests.email` is a logical account lookup rather than a strict foreign key, so it is intentionally excluded from the relationship-count list.


## One-to-One / One-to-Zero-or-One

```text
Users → Carts
```

Each registered user has at most one cart because:

```js
userId: {
  type: String,
  ref: "Users",
  required: true,
  unique: true,
}
```

## One-to-Many

Examples:

```text
Users → Orders
Orders → OrderItems
Products → Reviews
BlogPosts → BlogComments
ForumThreads → ForumPosts
ForumThreads → ForumReports
```

## Many-to-Many

Examples:

```text
Users ↔ BlogComments
through BlogComments.likedBy[]

Users ↔ ForumPosts
through ForumPost.likedBy[]

Users ↔ ForumPosts
through ForumPost.dislikedBy[]

Users ↔ ForumPosts
through ForumPost.bookmarkedBy[]
```

---

# 18. Key Indexes

```js
// Users
{ email: 1 } // unique
{ username: 1 } // unique

// Products
{ status: 1, category: 1, featuredOrder: 1 }
{ status: 1, maker: 1 }
{ status: 1, material: 1 }
{ title: "text", description: "text", tag: "text" }

// Carts
{ userId: 1 } // unique

// CartItems
{ cartId: 1, itemType: 1 }
{ cartId: 1, productId: 1 }

// Orders
{ userId: 1, createdAt: -1 }

// OrderItems
{ orderId: 1 }
{ productId: 1 }
{ giftcardId: 1 }

// Reviews
{ productId: 1, dateAdded: -1 }
{ productId: 1, rating: -1 }
{ userId: 1, dateAdded: -1 }

// GiftCards
{ code: 1 } // unique
{ createdByUserId: 1, createdAt: -1 }

// BlogPosts
{ "author.id": 1, updatedAt: -1 }
{ status: 1, category: 1, publishedAt: -1 }
{ title: "text", summary: "text", tags: "text" }

// BlogComments
{ postId: 1, parentCommentId: 1, createdAt: 1 }
{ "author.id": 1, createdAt: -1 }

// ForumThreads
{ slug: 1 } // unique
{ status: 1, hidden: 1, category: 1, createdAt: -1 }
{ title: "text", "posts.content": "text", tags: "text" }
{ authorId: 1, createdAt: -1 }

// ForumReports
{ status: 1, createdAt: -1 }
{ reporterId: 1, createdAt: -1 }
{ threadSlug: 1, postId: 1, reporterId: 1 } // unique

// ForumNotifications
{ userId: 1, read: 1, createdAt: -1 }
```



# 20. A3 Implementation Requirements

This file defines the **target MongoDB schema**.

The final application must also implement it.

```text
[1] JSON-backed models
        ↓
    migrate to Mongoose

[2] In-memory Cart / Order stores
        ↓
    migrate to MongoDB Atlas

[3] Existing seed/sample records
        ↓
    insert into Atlas

[4] Controllers
        ↓
    use async Mongoose operations

[5] User-owned content
        ↓
    enforce owner/admin access control

[6] Forum deletion
        ↓
    soft delete embedded posts

[7] Images/files
        ↓
    file remains in uploads/static storage
    MongoDB stores URL/path only

[8] Hosted application
        ↓
    all persistent backend reads/writes use Atlas
```

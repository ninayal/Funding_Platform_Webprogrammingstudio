### Nhóm Shared — `Users`

`models/schemas/User.js`

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },   // dạng scrypt$salt$hash
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    joinDate: { type: Date, default: Date.now },
    requiresPasswordChange: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
```

### Nhóm Shared — `PasswordResetRequests`

```js
const resetSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  status: { type: String, enum: ["pending", "resolved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
  tempPassword: { type: String, default: null },
});
resetSchema.index({ status: 1, requestedAt: -1 });
```

### Nhóm Shop — `Carts` + `CartItems`

Thiết kế đã chốt là **tách item ra document riêng**.

```js
// Carts
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true, unique: true },
}, { timestamps: true });

// CartItems
const cartItemSchema = new mongoose.Schema({
  cartId:   { type: mongoose.Schema.Types.ObjectId, ref: "Carts", required: true, index: true },
  itemType: { type: String, enum: ["product", "giftcard"], required: true },
  productId:{ type: mongoose.Schema.Types.ObjectId, ref: "Products", default: null },
  quantity: { type: Number, required: true, min: 1 },
  giftcardDraft: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });
```

### Nhóm Shop — `Orders` + `OrderItems`

Điểm quan trọng nhất ở đây: **OrderItems lưu snapshot giá**.

```js
// OrderItems
const orderItemSchema = new mongoose.Schema({
  orderId:   { type: mongoose.Schema.Types.ObjectId, ref: "Orders", required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", default: null },
  itemType:  { type: String, enum: ["product", "giftcard"], required: true },
  title:     { type: String, required: true },   // snapshot
  unitPrice: { type: Number, required: true },   // snapshot
  quantity:  { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true },   // snapshot
});
```

### Nhóm nội dung — `Reviews`, `GiftCards`, `BlogPosts`, `BlogComments`

```js
// Reviews
const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: String,
  images: [String],
  dateAdded: { type: Date, default: Date.now },
});

// BlogComments — tự tham chiếu
const blogCommentSchema = new mongoose.Schema({
  postId:          { type: mongoose.Schema.Types.ObjectId, ref: "BlogPosts", required: true, index: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogComments", default: null },
  authorId:        { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  content: String,
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  status: { type: String, default: "published" },
}, { timestamps: true });
```
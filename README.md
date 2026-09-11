# Làng & Co. — Vietnamese Traditional Crafts Marketplace

<p align="center">
  <img src="./public/images/logo.png" width="120" alt="Làng & Co. Logo">
</p>

## 🌿 Project Overview

**Làng & Co.** is a full-stack e-commerce platform designed to promote and preserve Vietnamese traditional handicrafts by connecting customers with authentic handmade products.

The platform provides customers with a complete shopping experience, including:

- Browsing handcrafted products
- Searching, filtering, and sorting products
- Shopping cart and checkout management
- Order tracking
- Product reviews and ratings
- Gift card purchasing
- Community forum interaction
- User profile management
- Administrative product and user management

The application focuses on creating a seamless digital marketplace while maintaining product authenticity, customer trust, and community engagement.

---

# 🚀 Live Application

**Website URL:**

```
https://langandco.onrender.com/?fbclid=IwY2xjawUQgdpwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMWN3YjQ0WG9jdEpBZXgyNEpzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEepCfxiNBqoqG3bmDtXVwhtH2c5DxBzpAAPsRsX3X5t5JNiqDqIe71hAnbVtA_aem_bM4Y9h4Zk0wLd5W3B7BpwA 
```

---

# 📂 Source Code Repository

**GitHub Repository:**

```
https://github.com/ninayal/Funding_Platform_Webprogrammingstudio
```

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- EJS Template Engine

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose ODM

## Additional Technologies

- Multer (image uploading)
- Express-session (authentication session management)
- bcrypt (password encryption)
- Nodemailer (email-related features)


---

## Project Structure

```text
Funding_Platform_Webprogrammingstudio/
│
├── config/                         # Shared configuration files
│
├── controllers/                    # Request handlers and business logic
│   ├── authController.js           # Authentication and account management
│   ├── blogController.js           # Blog module logic
│   ├── cartController.js           # Shopping cart operations
│   ├── forumController.js          # Discussion forum functionality
│   ├── reviewController.js         # Product review and rating management
│   └── sharedController.js         # Shared pages and admin operations
│
├── data/                            # Application data and seed data
│
├── middlewares/                     # Authentication, validation, upload and access control middleware
│
├── models/                          # MongoDB/Mongoose data models
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Review.js
│   └── Forum.js
│
├── public/                          # Static frontend resources
│   │
│   ├── css/                         # Shared and module-specific styling
│   │   ├── blog/
│   │   ├── cart/
│   │   ├── forum/
│   │   ├── review/
│   │   └── shared/
│   │
│   ├── images/                      # Static images and product assets
│   │
│   ├── js/                          # Client-side JavaScript
│   │   ├── cart/
│   │   ├── review/
│   │   └── shared/
│   │
│   └── uploads/                     # User-uploaded files
│
├── routes/                          # Express route definitions
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   ├── cartRoutes.js
│   ├── forumRoutes.js
│   ├── reviewRoutes.js
│   └── sharedRoutes.js
│
├── scripts/                         # Database scripts and utilities
│
├── utils/                           # Reusable helper functions
│
├── validators/                      # Server-side input validation
│
├── views/                            # EJS templates
│   │
│   ├── blog/                         # Blog pages
│   │
│   ├── cart/                         # Shopping cart and checkout pages
│   │
│   ├── forum/                        # Discussion forum pages
│   │
│   ├── giftcard/                     # Gift card pages
│   │
│   ├── home/                         # Landing and homepage views
│   │
│   ├── partials/                     # Reusable components
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── shared components
│   │
│   ├── products/                     # Product listing and details pages
│   │
│   └── shared/                       # Authentication and account pages
│       ├── login.ejs
│       ├── register.ejs
│       ├── forgot_password.ejs
│       ├── reset_password.ejs
│       └── profile.ejs
│
├── app.js                            # Express application configuration
│
├── server.js                         # Application entry point
│
├── package.json                      # Project dependencies and scripts
│
└── package-lock.json
```
---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Server | Express `5.x` |
| Templates | EJS |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Sessions | express-session |
| File Uploads | Multer |
| Environment Config | dotenv |
| Development | Nodemon |
| Module System | CommonJS |

---


# ⚙️ Installation and Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/ninayal/Funding_Platform_Webprogrammingstudio.git
```

Navigate into the project:

```bash
cd Funding_Platform_Webprogrammingstudio
```

---

## 2. Install Dependencies

Run:

```bash
npm install
```

---

## 3. Environment Configuration

Create a `.env` file in the root directory:

```
PORT=3000

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Replace values with your own configuration.

---

# 🗄️ MongoDB Setup

The application uses MongoDB as the main database.

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow your IP address.
4. Copy the connection string.
5. Add it to `.env`:

```
MONGODB_URI=mongodb+srv://LangCo_app:Langco1234@langandco-cluster.hpssjjz.mongodb.net/langandco?retryWrites=true&w=majority&appName=LangandCo-Cluster 
```

## Database Collections

The system contains collections including:

| Collection | Purpose |
|---|---|
| Users | Customer and admin accounts |
| Products | Product information |
| Orders | Customer orders |
| OrderItems | Individual purchased items |
| Reviews | Product ratings and feedback |
| Carts | Shopping cart data |
| Forums | Community discussions |
| GiftCards | Gift card information |

---

# 👤 Test User Credentials

## Customer Account

```
Could be register one for testing 
```

Customer account allows testing:

- Product browsing
- Add to cart
- Checkout process
- Order history
- Product review submission
- Forum participation
- Profile management

---

# 🔐 Admin Credentials

```
Email:
admin@langandco.com

Password:
Admin1234#
```

Admin account allows testing:

- Product management
- User management
- Password reset requests
- Administrative dashboard functions

---

# 🧪 Instructions for Marking

## Recommended Testing Flow

The following testing flow is recommended to evaluate the main functionalities of the Làng & Co. platform.

---

# 1. Customer Experience

Login using the customer account.

Test the following features:

### Product Browsing

1. Browse available handcrafted products.
2. Search products using keywords.
3. Filter and sort products.
4. View detailed product information.

### Shopping Cart and Checkout

1. Add products to cart.
2. Update product quantities.
3. Remove products from cart.
4. Proceed through checkout.
5. Complete an order.
6. View order history and tracking information.

### Product Review and Rating

1. Purchase a product first.
2. Navigate back to the purchased product.
3. Submit a product rating and review.
4. Upload review images.
5. Edit or delete own reviews.

**Important:**
Only customers who have purchased a product are allowed to submit reviews. The system validates purchase history before allowing review submission.

---

# 2. Community Experience

Login using the customer account.

## Discussion Forum

Test:

1. View existing forum discussions.
2. Create a new discussion post.
3. Reply to other users' discussions.
4. Edit or delete own posts/replies.

---

# 3. Blog Experience

Access the Blog module.

Test:

1. Browse available blog posts.
2. View blog post details.
3. Navigate between different blog contents.
4. Check blog display and content organisation.

---

# 4. Gift Card Experience

Test:

1. Browse available gift cards.
2. View gift card details.
3. Add gift cards to cart.
4. Complete purchase flow.

---

# 5. User Account Management

Login using the customer account.

Test:

1. View profile information.
2. Update personal details.
3. Upload profile image.
4. Manage account preferences.
5. Test password-related functions.

---

# 6. Admin Experience

Login using the administrator account.

Test:

## Product Management

1. Create new products.
2. Update product information.
3. Upload product images.
4. Delete products.

## User Management

1. View registered users.
2. Manage user status.
3. Handle administrative actions.

## Password Reset Management

1. View password reset requests.
2. Approve or reject requests.

---

# 7. Responsive Design Testing

Test the application across different screen sizes:

- Desktop
- Tablet
- Mobile

---

# 📱 Responsive Design

The application supports responsive layouts across:

- Desktop screens
- Tablets
- Mobile devices

The minimum supported width is:

```
320px
```

Below this width, the layout maintains the minimum structure to prevent component distortion.

---

# 🔒 Security Features

The application implements:

- Password hashing using bcrypt
- Authentication middleware
- Role-based access control
- Server-side validation
- Client-side validation
- File upload validation
- User ownership checking

---

# 📌 Important Notes for Markers

- Some features require authentication.
- Review submission requires a completed purchase.
- Admin functions require administrator privileges.
- Database must be connected before running the application.
- Uploaded images require correct storage configuration.

---

# ▶️ Running the Application

Start development server:

```bash
npm start
```

or:

```bash
npm run dev
```

Application will run at:

```
http://localhost:3000
```

---

# 👥 Development Team

The project was collaboratively developed by four team members, with each member responsible for designing, implementing, testing, and integrating a specific full-stack module.

| Member | Student ID | Module Responsibility |
|---|---|---|
| Nguyen Dinh Phuc Khang | S4208144 | Blog Module — Responsible for blog creation, display, and management features. |
| Vu Quang Minh | S4220184 | Discussion Forum Module — Responsible for forum discussions, replies, and community interaction features. |
| Lam Thanh Yen Nhi | S4203654 | Shopping Cart Module — Responsible for cart management, item updates, and checkout integration. |
| Ai Phuc Canh Khoi | S4124826 | Product Review and Rating Module — Responsible for review submission, rating system, validation, image upload handling, and review management. |

---

# 🎨 Project Vision

> "Preserving Vietnamese craftsmanship through technology."

Làng & Co. transforms traditional handmade products into an accessible digital experience while supporting artisans, customers, and communities.

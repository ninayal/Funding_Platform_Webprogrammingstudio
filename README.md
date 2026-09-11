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
├── config/          # Shared configuration
├── controllers/     # Request handlers and module flow
├── data/            # Application data
├── middlewares/     # Authentication, upload, error and access middleware
├── models/          # Data access and module models
├── public/
│   ├── css/         # Shared and module styles
│   ├── images/      # Static images and assets
│   ├── js/          # Shared and module client-side JavaScript
│   └── uploads/     # Runtime-uploaded assets
├── routes/          # Express route definitions
├── scripts/         # Project scripts/utilities
├── utils/           # Reusable helpers and view-data utilities
├── validators/      # Server-side validation
├── views/
│   ├── blog/
│   ├── cart/
│   ├── forum/
│   ├── giftcard/
│   ├── home/
│   ├── partials/
│   ├── products/
│   └── shared/
├── app.js           # Express application configuration
├── server.js        # Application entry point
├── package.json
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

### 1. Customer Experience

Login using the customer account.

Test:

1. Browse products
2. Search/filter products
3. Add products to cart
4. Update cart quantity
5. Complete checkout
6. View order tracking
7. Submit product review

---

## Product Review Testing

Important rule:

> Only customers who have purchased a product can submit a review.

To test:

1. Login as customer.
2. Purchase a product.
3. Navigate back to the product page.
4. Submit rating and review.
5. Upload review images.

The system validates:
- User authentication
- Purchase history
- Review ownership
- Image upload format

---

## Shopping Cart Testing

Test:

- Add/remove products
- Update quantities
- Cart persistence
- Checkout validation

---

## Forum Testing

Test:

- Create discussion posts
- Reply to posts
- Edit/delete own content

---

## Gift Card Testing

Test:

- Browse gift cards
- Add gift card to cart
- Complete purchase flow

---

## Admin Testing

Login with admin credentials.

Test:

- Create products
- Update product details
- Delete products
- Manage users
- Review system requests

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

| Member | Main Contribution |
|---|---|
| Nina | Project coordination and core features |
| Ai Phuc Canh Khoi | Product Review and Rating Module |
| Other Team Members | Full-stack modules and integrations |

---

# 🎨 Project Vision

> "Preserving Vietnamese craftsmanship through technology."

Làng & Co. transforms traditional handmade products into an accessible digital experience while supporting artisans, customers, and communities.

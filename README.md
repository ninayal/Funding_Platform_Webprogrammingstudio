<p align="center">
  <img src="public/images/logo.png" alt="Làng & Co. logo" width="92">
</p>

<h1 align="center">Làng &amp; Co.</h1>

<p align="center">
  <em>Vietnamese Traditional Crafts · Web Programming Studio</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-6D2323?style=flat-square" alt="Node.js Express">
  <img src="https://img.shields.io/badge/View-EJS-A31D1D?style=flat-square" alt="EJS">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-AF8F6F?style=flat-square" alt="HTML CSS JS">
  <img src="https://img.shields.io/badge/Architecture-MVC-74512D?style=flat-square" alt="MVC">
</p>

---

## About the Project

**Làng & Co.** is a Vietnamese traditional craft marketplace developed as a Web Programming Studio project. The application combines product discovery, shopping and checkout flows with community-driven features including a journal, discussion forum, and product reviews.

The project follows a server-rendered **Node.js + Express + EJS** architecture, with module responsibilities separated across controllers, models, routes, views, static assets, middleware, utilities, validators, and configuration.

> **Repository:** https://github.com/ninayal/Funding_Platform_Webprogrammingstudio

---

## Team & Module Responsibilities

| Team Member | Student ID | Primary Module |
| --- | --- | --- |
| **Nguyen Dinh Phuc Khang** | `S4208144` | Blog |
| **Vu Quang Minh** | `S4220184` | Discussion Forum |
| **Lam Thanh Yen Nhi** | `S4203654` | Shopping Cart |
| **Ai Phuc Canh Khoi** | `S4124826` | Product Review and Rating |

### Nguyen Dinh Phuc Khang — Blog

Responsible for the Journal/Blog experience, including post browsing, post detail, authenticated post management, comments, replies, and blog-specific client presentation.

**Primary files and folders**

```text
controllers/blogController.js
models/blogModel.js
models/blogCommentModel.js
routes/blogRoutes.js

views/blog/
views/partials/blog/

public/css/blog/
public/js/blog/
```

**Main functional scope**

- Browse public journal posts.
- View individual blog posts.
- Create, edit, update, and delete owned posts.
- View "My Posts".
- Add comments and replies.
- Like and delete supported comments.
- Maintain blog filtering, sorting, pagination, forms, and responsive UI.

---

### Vu Quang Minh — Discussion Forum

Responsible for the community discussion forum, including threads, replies, search, bookmarks, notifications, user activity, and moderation flows.

**Primary files and folders**

```text
controllers/forumController.js
models/forumModel.js
routes/forumRoutes.js

views/forum/
views/partials/forum/

public/css/forum/
public/js/forum/
```

**Main functional scope**

- Browse forum home, categories, and recent posts.
- Search forum content.
- Create, edit, publish, and delete threads.
- Create, edit, and delete posts/replies.
- Like, dislike, quote, report, and bookmark posts.
- View personal posts, bookmarks, and notifications.
- Support authenticated and admin moderation flows.

---

### Lam Thanh Yen Nhi — Shopping Cart

Responsible for the product-shopping journey from product discovery through cart management, checkout, and order confirmation.

**Primary files and folders**

```text
controllers/cartController.js
models/cartModel.js
models/orderModel.js
routes/cartRoutes.js

views/cart/
views/partials/cart/

public/css/cart/
public/js/cart/
```

**Closely integrated product-browsing files**

```text
controllers/productController.js
models/productModel.js
routes/productRoutes.js
views/products/
```

**Main functional scope**

- Browse the product catalogue.
- Add products to the cart.
- Update item quantities.
- Remove cart items.
- Maintain cart totals and cart count.
- Proceed through checkout.
- Submit an order.
- Display order confirmation.
- Support responsive cart, checkout, and product-listing interfaces.

> Product detail pages are shared integration points with the Product Review and Rating module.

---

### Ai Phuc Canh Khoi — Product Review and Rating

Responsible for product-level ratings and reviews, including review creation, editing, deletion, image upload integration, validation, and review presentation within product detail pages.

**Primary files and folders**

```text
controllers/reviewController.js
models/reviewModel.js
routes/reviewRoutes.js
middlewares/reviewImageUpload.js

views/partials/review/
public/css/review/
public/js/review/
```

**Shared product-detail integration**

```text
controllers/productController.js
models/productModel.js
routes/productRoutes.js
views/products/
```

**Main functional scope**

- Display reviews on the relevant product resource.
- Submit 1–5 star ratings.
- Validate review title and review content.
- Upload product-review images.
- Edit owned reviews.
- Delete owned reviews.
- Preserve ownership and authentication checks.
- Redirect legacy review URLs to current product resources.

> Reviews are attached to product resources rather than maintained as one global review page.

---

## Shared / Integration Files

The following areas support multiple modules and should be treated as **team-level integration files**, rather than being attributed exclusively to one module owner:

```text
app.js
server.js

config/
middlewares/
utils/
validators/

views/partials/header.ejs
views/partials/footer.ejs

public/css/root.css
public/css/header.css
public/css/footer.css
public/js/shared/
```

Changes to shared files should be checked against all affected modules before merging.

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

## Prerequisites

Before running the project, install:

- **Node.js** — a current LTS version is recommended.
- **npm** — included with Node.js.
- **Git** — recommended for cloning the repository.
- A modern browser such as Chrome, Edge, Firefox, or Safari.

Verify the installation:

```bash
node --version
npm --version
git --version
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ninayal/Funding_Platform_Webprogrammingstudio.git
cd Funding_Platform_Webprogrammingstudio
```

### 2. Install dependencies

```bash
npm install
```

The application currently uses Express, EJS, express-session, Multer, and dotenv, with Nodemon available for development.

---

## Run the Application

### Development mode

```bash
npm run dev
```

This starts the application with Nodemon and automatically restarts the server when server-side files change.

### Standard mode

```bash
npm start
```

By default, the server runs at:

```text
http://localhost:3000
```

If a `PORT` environment variable is provided, the application uses that port instead.

---

## How to Test the Application

The repository currently does **not** define an automated `npm test` script. Testing should therefore be completed manually in the browser by validating the main user journeys below.

### 1. General smoke test

1. Run the application with `npm run dev`.
2. Open `http://localhost:3000`.
3. Confirm that the landing page loads without server errors.
4. Confirm that shared header, footer, images, CSS, and JavaScript load correctly.
5. Test both guest navigation and authenticated navigation.

### 2. Blog module

Start at:

```text
http://localhost:3000/blog
```

Check:

1. Blog listing loads for a guest.
2. Category/filter/search/sort interactions work where available.
3. Open an individual post.
4. Sign in and visit `/blog/create`.
5. Create a valid post.
6. Confirm invalid fields show validation feedback.
7. Visit `/blog/my-posts`.
8. Edit an owned post and confirm changes persist.
9. Delete an owned post.
10. Add a comment to a post.
11. Add a reply to a comment.
12. Test supported comment like/delete actions.
13. Confirm protected actions redirect or reject unauthenticated users correctly.

### 3. Discussion Forum module

Start at:

```text
http://localhost:3000/forum
```

Check:

1. Forum home loads.
2. Visit `/forum/new-posts`.
3. Search using `/forum/search`.
4. Browse a category.
5. Open a thread.
6. Sign in and create a thread via `/forum/create`.
7. Edit and delete an owned thread.
8. Add a reply.
9. Edit and delete an owned reply/post.
10. Test like and dislike controls.
11. Test quote, report, and bookmark flows.
12. Visit `/forum/your-posts`.
13. Visit `/forum/bookmarked`.
14. Visit `/forum/notifications`.
15. If testing with an admin account, verify moderation routes and permissions.

### 4. Shopping Cart module

Start at:

```text
http://localhost:3000/cart/products
```

Check:

1. Product catalogue loads.
2. Product filtering/sorting works where available.
3. Sign in before cart-protected operations.
4. Add a product to the cart.
5. Open `/cart`.
6. Increase and decrease quantities.
7. Confirm subtotal and total update correctly.
8. Remove an item.
9. Confirm the cart count in the header updates.
10. Proceed to `/cart/checkout`.
11. Complete required checkout fields.
12. Verify validation messages for invalid or missing values.
13. Submit checkout.
14. Confirm `/cart/order-confirmation` renders the completed order.
15. Refresh key pages and confirm expected session/cart state is preserved.

### 5. Product Review and Rating module

Start from:

```text
http://localhost:3000/cart/products
```

Then open a product detail page.

Check:

1. Product detail renders its review section.
2. Existing reviews and average rating display correctly.
3. Sign in before submitting a review.
4. Select a rating from 1 to 5 stars.
5. Enter a valid review title.
6. Enter valid review content.
7. Upload the required review image(s).
8. Submit and confirm the review appears on the same product.
9. Test validation using missing/invalid fields.
10. Edit an owned review.
11. Keep/remove existing images during edit where supported.
12. Delete an owned review.
13. Confirm another user cannot edit or delete a review they do not own.
14. Confirm old `/review/...` URLs redirect to the current product-based review flow.

---

## Authentication & Session Testing

Several module actions require an authenticated account.

1. Create an account through the Register page.
2. Sign in.
3. Verify authenticated actions become available.
4. Navigate between Blog, Forum, Cart, Product Reviews, and Profile.
5. Confirm the same signed-in account remains active across modules.
6. Sign out and verify protected routes no longer permit authenticated actions.

The application stores the active account in the Express session and exposes the current user to the relevant modules.

---

## Validation & Error Testing

For each form, test both valid and invalid input:

- Required fields left blank.
- Inputs below minimum length.
- Inputs above maximum length.
- Invalid email formats.
- Invalid numeric ranges.
- Unauthorized edit/delete attempts.
- Invalid or unsupported image uploads.
- Direct access to non-existent resources.
- Refresh after form submission to confirm expected persistence behavior.

The application should provide meaningful feedback without crashing the Express server.

---

## Responsive Testing

Test the main pages at several viewport widths:

```text
Desktop:       1440px+
Laptop:        1024px–1280px
Tablet:        768px–1024px
Mobile:        375px–430px
```

Pay particular attention to:

- Header navigation.
- Product grids.
- Cart and checkout layouts.
- Blog cards and article layouts.
- Forum tables/thread layouts.
- Product review forms.
- Long text and validation messages.
- Buttons, form controls, and touch targets.

---

## Suggested Browser Test Matrix

| Browser | Recommended |
| --- | --- |
| Google Chrome | Yes |
| Microsoft Edge | Yes |
| Mozilla Firefox | Yes |
| Safari | Yes, especially for macOS/iOS layout checks |

---

## Troubleshooting

### `npm install` fails

Check the installed Node.js and npm versions, then retry:

```bash
npm install
```

### Port 3000 is already in use

macOS / Linux:

```bash
PORT=3001 npm start
```

PowerShell:

```powershell
$env:PORT=3001
npm start
```

Then open:

```text
http://localhost:3001
```

### CSS, JavaScript, or images do not load

Confirm the server is running and that static assets remain inside:

```text
public/
```

### A protected page redirects to login

Sign in first, then retry the route. Blog authoring, forum account features, cart operations, checkout, and review management include authenticated flows.

---

<p align="center">
  <strong>Làng &amp; Co.</strong><br>
  <sub>Craft lives in the hands that make it.</sub>
</p>

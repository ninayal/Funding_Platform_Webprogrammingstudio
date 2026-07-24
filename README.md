# Làng & Co. — Vietnamese Traditional Crafts Marketplace

A static front-end website for **Làng & Co.**, a curated marketplace where Vietnamese craftsmanship — ceramics, silk, paintings, wood carving, gift cards, community stories, and more — is presented in a modern e-commerce experience.

> **Assignment 01 — Static Front End** · Web Programming Studio · RMIT University  
> Students: s4208144 · s4203654 · s4220184 · s4124826

---

## Overview

This project is built entirely with **HTML5 and CSS3**.

There is no JavaScript, no backend, and no build tool. Shared layout sections such as the header and footer are reused through `<iframe>` includes. CSS files are organised by page or feature so that each section can be maintained separately.

The website includes a landing page, product catalogue, cart and checkout flow, product detail pages with reviews, blog, forum, wishlist, gift card builder, user profile, admin dashboard, legal pages, and sitemap.

---

## How to Run

Because many image and page links use root-based paths such as `/public/...`, the project should be opened with a local server instead of opening the HTML file directly.

Recommended option:

```bash
python -m http.server 5500

Then open:

http://localhost:5500/index.html

Or use the Live Server extension in Visual Studio Code.

Pages
Section	Main Files	Description
Landing Page	index.html	Homepage with hero section, craft categories, featured content, journal preview, testimonials, and FAQ
Shop	pages/cart/products.html	Product catalogue with category filters, sorting, and pagination
Cart & Checkout	pages/cart/cart.html, pages/cart/checkout.html, pages/cart/order_confirmation.html	Shopping cart, checkout form, and order confirmation page
Product Detail & Reviews	pages/review/product_detail/review1.html to review15.html, pages/review/product_review.html	Product detail pages with description, additional info, review iframe, related products, and customer review component
Blog / Journal	pages/blog/blog.html	Editorial stories about Vietnamese craft villages and makers
Forum	pages/forum/	Community forum pages including discussion lists, threads, guidelines, and post creation
Gift Cards	pages/giftcard/giftcard.html	Gift card builder with design, delivery, amount, preview, and review steps
Wishlist	pages/wishlist/wishlists.html	Saved product page
Account	pages/shared/login.html, register.html, forgot_password.html, profile.html	Login, registration, password recovery, and user profile
Admin	pages/shared/admin.html	Static admin dashboard mockup
Global / Legal	pages/global/header.html, footer.html, privacy-policy.html, terms-of-service.html	Shared iframe components and legal pages
Sitemap	pages/shared/sitemap.html	Static sitemap page
Project Structure
├── index.html
├── README.md
├── pages/
│   ├── blog/
│   ├── cart/
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── order_confirmation.html
│   │   └── products.html
│   ├── forum/
│   ├── giftcard/
│   │   └── giftcard.html
│   ├── global/
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── privacy-policy.html
│   │   └── terms-of-service.html
│   ├── review/
│   │   ├── product_review.html
│   │   └── product_detail/
│   │       ├── review1.html
│   │       ├── review2.html
│   │       └── review15.html
│   ├── shared/
│   │   ├── admin.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── forgot_password.html
│   │   ├── profile.html
│   │   └── sitemap.html
│   └── wishlist/
│       └── wishlists.html
└── public/
    ├── css/
    │   ├── admin/
    │   ├── blog/
    │   ├── cart/
    │   ├── forum/
    │   ├── giftcard/
    │   ├── landingpage/
    │   ├── login_register/
    │   ├── profile/
    │   ├── review/
    │   ├── wishlist/
    │   ├── footer.css
    │   ├── forgot_password.css
    │   ├── header.css
    │   ├── header_shoppingcart.css
    │   ├── legal.css
    │   ├── shared-include.css
    │   └── sitemap.css
    └── images/
CSS Organisation

The CSS is split into small modules by feature or page type.

Main CSS groups:

public/css/landingpage/      Homepage sections
public/css/cart/             Product listing, cart, checkout, order confirmation
public/css/review/           Product detail pages and review component
public/css/forum/            Forum pages
public/css/blog/             Blog / journal pages
public/css/giftcard/         Gift card builder
public/css/login_register/   Login and register pages
public/css/profile/          Profile page
public/css/wishlist/         Wishlist page
public/css/admin/            Admin dashboard

Shared CSS files:

public/css/header.css
public/css/header_shoppingcart.css
public/css/footer.css
public/css/shared-include.css
public/css/legal.css
public/css/sitemap.css
public/css/forgot_password.css
Techniques Used
Semantic HTML5 structure
Modular CSS files grouped by feature
Responsive layouts with dedicated responsive CSS files
CSS-only UI states using radio buttons, checkboxes, labels, :checked, and :target
Shared header and footer through iframe includes
Product filtering, tabs, review pagination, and gift card preview using HTML/CSS only
Accessible labels, alt text, ARIA labels, and lazy-loaded images
Static front-end architecture with no JavaScript and no backend
Notes
The project should be served from the project root so that paths like /public/images/... work correctly.
Header and footer are reused through pages/global/header.html and pages/global/footer.html.
Product review content is separated into pages/review/product_review.html and embedded inside product detail pages using an iframe.
Responsive fixes are stored in page-specific responsive CSS files where needed.
Branch
Assignment01-Static_Front_End_web
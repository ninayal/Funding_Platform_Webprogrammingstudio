# Làng & Co. — Vietnamese Traditional Crafts Marketplace

A static front-end website for **Làng & Co.**, a curated marketplace where Vietnamese craftsmanship — ceramics, silk, paintings, wood carving, incense, and more — finds a home in the modern world.

> **Assignment 01 — Static Front End** · Web Programming Studio · RMIT University
> Students: s4220184 · s4186655

## Overview

The site is built entirely with **HTML5 and CSS3** — no JavaScript, no build tools, no backend. Shared components (header, footer) are reused across pages via `<iframe>` includes, and styles are split into small, feature-scoped CSS modules.

To view the site, open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Pages

| Section | Pages | Description |
|---|---|---|
| **Landing** | `index.html` | Hero, marquee, quick nav, shop-by-craft categories, featured products, journal preview, testimonials, FAQ |
| **Shop** | `pages/cart/products.html` | Product catalogue with category filters, sorting, pagination |
| **Cart & Checkout** | `pages/cart/cart.html`, `checkout.html`, `order_confirmation.html` | Shopping cart, checkout flow, order confirmation |
| **Product Detail / Reviews** | `pages/review/product_review.html`, `product_detail/review1–15.html` | Product detail pages with customer reviews |
| **Forum** | `pages/forum/` | Forum home, thread lists, thread content, create thread, new posts, guidelines |
| **Blog / Journal** | `pages/blog/blog.html` | Editorial stories about craft villages (Bát Tràng, Hội An, lacquer...) |
| **Gift Cards** | `pages/giftcard/giftcard.html` | Impact gift card builder (design, amount, delivery, preview) |
| **Wishlist** | `pages/wishlist/wishlists.html` | Saved products |
| **Account** | `pages/shared/login.html`, `register.html`, `forgot_password.html`, `profile.html` | Authentication and user profile |
| **Admin** | `pages/shared/admin.html` | Admin dashboard mockup |
| **Legal & Misc** | `pages/global/privacy-policy.html`, `terms-of-service.html`, `pages/shared/sitemap.html` | Policies and sitemap |

## Project Structure

```
├── index.html                  # Landing page
├── pages/
│   ├── blog/                   # Journal / blog
│   ├── cart/                   # Products, cart, checkout, order confirmation
│   ├── forum/                  # Community forum pages
│   ├── giftcard/               # Gift card flow
│   ├── global/                 # Shared header/footer includes + legal pages
│   ├── review/                 # Product detail & review pages
│   ├── shared/                 # Login, register, profile, admin, sitemap
│   └── wishlist/               # Wishlist
└── public/
    ├── css/                    # Modular CSS, grouped per feature
    │   ├── landingpage/        # index-*.css (hero, categories, faq, ...)
    │   ├── cart/               # cart-, checkout-, product-*.css
    │   ├── forum/  blog/  giftcard/  login_register/ ...
    │   └── header.css, footer.css, admin.css, legal.css, ...
    └── images/                 # Logo, landing photos, product photos, icons
```

## Techniques Used

- Semantic HTML5 (`section`, `nav`, ARIA labels, `alt` text, lazy-loaded images)
- Modular CSS — one file per UI block, plus dedicated `*-responsive.css` files for breakpoints
- Shared header/footer through iframe includes (`pages/global/header.html`, `footer.html`)
- Responsive layout across landing, shop, forum, and checkout pages
- Pure static site — works offline, no dependencies

## Branch

- `Assignment01-Static_Front_End_web` — static front-end deliverable (this code)

// Temporary in-memory model.
// All changes are lost when the NodeJS server restarts.

const product = {
  "id": "hand-painted-blue-lotus-vase",
  "name": "Hand-Painted Blue Lotus Vase",
  "image": "/images/shopping_items/ceramic/ceramic1.png",
  "imageAlt": "Blue lotus vase in a customer review"
};

const productDetail = {
  "id": "hand-painted-blue-lotus-vase",
  "name": "Hand-Painted Blue Lotus Vase",
  "maker": "Bát Tràng · Hanoi",
  "tag": "Bestseller",
  "image": "/images/shopping_items/ceramic/ceramic1.png",
  "imageAlt": "Blue lotus vase in a customer review",
  "price": "$68.00",
  "rating": 3.8,
  "reviewCount": 25,
  "description": "Cobalt lotus blossoms, brushed by hand across a milk-white glaze — a single potter's morning of work, in a shape thrown the same way Bát Tràng has thrown it for generations.",
  "longDescription": [
    "The blue lotus is the oldest motif taught in Bát Tràng's kilns — a single flower drawn in cobalt oxide beneath a clear glaze, fired at 1,280°C until the blue sinks into the clay itself. This vase is thrown on a manual wheel, left to dry for two days, then hand-painted by one of three sisters who learned the pattern from their mother.",
    "No stencils, no transfers: look closely and you'll find the small, human variations — a petal drawn slightly fuller, a stem that curves its own way — that mark it as made by hand rather than by machine."
  ],
  "sizes": [
    {
      "id": "sm",
      "label": "18 cm",
      "isDefault": false
    },
    {
      "id": "lg",
      "label": "26 cm",
      "isDefault": true
    }
  ],
  "thumbnails": [
    {
      "alt": "Blue lotus vase, front view"
    },
    {
      "alt": "Blue lotus vase, glaze detail"
    },
    {
      "alt": "Blue lotus vase, side profile"
    },
    {
      "alt": "Blue lotus vase, styled on shelf"
    }
  ],
  "meta": [
    "Free shipping on orders over $75",
    "Hand-thrown to order — ships in 3–5 days",
    "Wrapped in reused linen & rice paper"
  ],
  "makerNote": {
    "seal": "Bát Tràng",
    "quote": "Every lotus is painted freehand — no two vases carry the exact same bloom.",
    "cite": "— Cô Hạnh, potter, 30 years at the wheel"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Stoneware ceramic, cobalt underglaze"
    },
    {
      "label": "Craft village",
      "value": "Bát Tràng, Gia Lâm, Hanoi"
    },
    {
      "label": "Dimensions — 18 cm",
      "value": "18 cm H × 11 cm ⌀, 0.6 kg"
    },
    {
      "label": "Dimensions — 26 cm",
      "value": "26 cm H × 15 cm ⌀, 1.1 kg"
    },
    {
      "label": "Care",
      "value": "Hand wash only; not microwave or dishwasher safe"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
};

const relatedProducts = [
  {
    "name": "Ash Glaze Tea Cup Set (4-Piece)",
    "maker": "Bát Tràng",
    "image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    "imageAlt": "Ash glaze ceramic tea cup set",
    "price": "$54.00",
    "rating": 5,
    "reviewCount": 63,
    "href": "/cart/products"
  },
  {
    "name": "Celadon Rice Bowl Set (4-Piece)",
    "maker": "Bát Tràng",
    "image": "/images/shopping_items/stone/stone1.png",
    "imageAlt": "Celadon glazed ceramic rice bowl set",
    "price": "$46.00",
    "rating": 5,
    "reviewCount": 27,
    "href": "/cart/products"
  },
  {
    "name": "Terracotta Planter Pot",
    "maker": "Bát Tràng",
    "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
    "imageAlt": "Handmade terracotta planter pot",
    "price": "$32.00",
    "rating": 4,
    "reviewCount": 15,
    "href": "/cart/products"
  }
];

const ratingValues = Object.freeze([
  5,
  4,
  3,
  2,
  1
]);
const searchFields = Object.freeze([
  {
    "value": "all",
    "label": "All fields"
  },
  {
    "value": "title",
    "label": "Review title"
  },
  {
    "value": "reviewer",
    "label": "Reviewer name"
  },
  {
    "value": "date",
    "label": "Date added"
  },
  {
    "value": "description",
    "label": "Review description"
  }
]);
const tabs = Object.freeze([
  {
    "id": "description",
    "label": "Description",
    "isDefault": true
  },
  {
    "id": "info",
    "label": "Additional Info",
    "isDefault": false
  },
  {
    "id": "review",
    "label": "Review",
    "isDefault": false
  }
]);
const mobileNavigation = Object.freeze([
  {
    "id": "nav-home",
    "label": "Home",
    "href": "/"
  },
  {
    "id": "nav-shop",
    "label": "Shop",
    "href": "/cart/products"
  },
  {
    "id": "nav-blog",
    "label": "Blog",
    "href": "/blog"
  },
  {
    "id": "nav-forum",
    "label": "Forum",
    "href": "/forum"
  },
  {
    "id": "nav-wishlist",
    "label": "Giftcards",
    "href": "/giftcard/giftcard"
  }
]);

let reviews = [
  {
    "id": "review-1",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "demo-user-1",
    "name": "Mai T.",
    "dateAdded": "2026-06-15T09:00:00.000Z",
    "rating": 5,
    "title": "Beautiful glaze and careful packaging",
    "comment": "Exactly as pictured — the cobalt glaze is even more vivid in person, and it arrived wrapped so carefully nothing shifted in transit.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-2",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-2",
    "name": "Linh Phạm",
    "dateAdded": "2026-05-15T09:00:00.000Z",
    "rating": 5,
    "title": "A meaningful housewarming gift",
    "comment": "Bought this as a housewarming gift and my sister loved it — the brushwork on the lotus petals is genuinely stunning up close.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-3",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-3",
    "name": "An Nguyễn",
    "dateAdded": "2026-04-15T09:00:00.000Z",
    "rating": 5,
    "title": "Looks handcrafted, not mass-produced",
    "comment": "I love the small differences in the painted lotus details. It feels personal and handmade, which is exactly why I bought it.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-4",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-4",
    "name": "Hannah K.",
    "dateAdded": "2026-04-15T09:00:00.000Z",
    "rating": 5,
    "title": "Elegant and simple",
    "comment": "The vase fits beautifully on my shelf. The color is soft but still noticeable, and the handmade texture gives it character.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-5",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-5",
    "name": "James R.",
    "dateAdded": "2026-05-15T09:00:00.000Z",
    "rating": 4,
    "title": "Lovely handmade feel",
    "comment": "Gorgeous vase and clearly handmade — a touch smaller than I pictured, so worth checking the dimensions in Additional Info first.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-6",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-6",
    "name": "Thảo Vũ",
    "dateAdded": "2026-03-15T09:00:00.000Z",
    "rating": 4,
    "title": "Very pretty, but color is slightly lighter",
    "comment": "The quality is good and the shape is beautiful. The blue tone is a bit lighter than I expected, but it still looks refined.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-7",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-7",
    "name": "Peter L.",
    "dateAdded": "2026-03-15T09:00:00.000Z",
    "rating": 4,
    "title": "Good quality ceramic",
    "comment": "The vase feels sturdy and the surface finish is smooth. Shipping was safe, although the box was larger than necessary.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-8",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-8",
    "name": "Chloe N.",
    "dateAdded": "2026-03-15T09:00:00.000Z",
    "rating": 4,
    "title": "Subtle and tasteful",
    "comment": "It has a quiet beauty. I expected the lotus detail to be stronger, but the subtle finish actually works well in my room.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-9",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-9",
    "name": "Nhi Trần",
    "dateAdded": "2026-02-15T09:00:00.000Z",
    "rating": 3,
    "title": "Nice piece, but smaller than expected",
    "comment": "The design is beautiful, but I should have checked the size more carefully. It works better as a small accent piece.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-10",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-10",
    "name": "Daniel M.",
    "dateAdded": "2026-02-15T09:00:00.000Z",
    "rating": 3,
    "title": "Beautiful but not perfect",
    "comment": "I like the handmade look, but the glaze on one side was slightly uneven. It still looks nice, just not as polished as I expected.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-11",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-11",
    "name": "Quỳnh Lê",
    "dateAdded": "2026-02-15T09:00:00.000Z",
    "rating": 5,
    "title": "Perfect for my entry table",
    "comment": "The vase adds a gentle traditional touch without looking too decorative. It feels simple, elegant and meaningful.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-12",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-12",
    "name": "Rachel S.",
    "dateAdded": "2026-02-15T09:00:00.000Z",
    "rating": 5,
    "title": "The handmade detail is beautiful",
    "comment": "I bought it because I wanted something that felt connected to Vietnamese craft. The hand-painted lotus detail is my favorite part.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-13",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-13",
    "name": "Bảo Minh",
    "dateAdded": "2026-01-15T09:00:00.000Z",
    "rating": 4,
    "title": "Good gift option",
    "comment": "I gave this to my aunt and she liked it. The packaging felt careful and the product looked premium enough for gifting.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-14",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-14",
    "name": "Emma J.",
    "dateAdded": "2026-01-15T09:00:00.000Z",
    "rating": 3,
    "title": "Nice, but color varied from photo",
    "comment": "The vase is nice, but the blue looked slightly different from what I saw online. It still works with my decor.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-15",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-15",
    "name": "Khánh B.",
    "dateAdded": "2026-01-15T09:00:00.000Z",
    "rating": 2,
    "title": "Packaging was good, but size disappointed me",
    "comment": "The product was protected well, but the vase looked larger in the photos. The size options should be shown more clearly.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-16",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-16",
    "name": "Vy Hoàng",
    "dateAdded": "2025-12-15T09:00:00.000Z",
    "rating": 5,
    "title": "Simple, calm and meaningful",
    "comment": "I like that it does not feel overly decorated. The shape is calm and the lotus detail makes it special.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-17",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-17",
    "name": "Olivia P.",
    "dateAdded": "2025-12-15T09:00:00.000Z",
    "rating": 5,
    "title": "Better than expected",
    "comment": "The photos are pretty, but the actual piece feels warmer and more personal in real life.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-18",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-18",
    "name": "Gia Hân",
    "dateAdded": "2025-12-15T09:00:00.000Z",
    "rating": 4,
    "title": "Nice handmade texture",
    "comment": "The texture makes it look authentic. I only wish there were more photos showing scale next to common objects.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-19",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-19",
    "name": "Yến Nhi",
    "dateAdded": "2025-11-15T09:00:00.000Z",
    "rating": 3,
    "title": "Good product, delayed delivery",
    "comment": "The vase itself is good, but delivery took longer than I thought. The tracking updates could be clearer.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-20",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-20",
    "name": "William T.",
    "dateAdded": "2025-11-15T09:00:00.000Z",
    "rating": 2,
    "title": "Expected stronger colors",
    "comment": "I expected the cobalt blue to stand out more. The craftsmanship is good, but the color felt too soft for my taste.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-21",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-21",
    "name": "Sophia M.",
    "dateAdded": "2025-10-15T09:00:00.000Z",
    "rating": 5,
    "title": "A beautiful cultural piece",
    "comment": "I bought it because I wanted something with cultural meaning. It feels respectful, well-made and elegant.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-22",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-22",
    "name": "Iris C.",
    "dateAdded": "2025-10-15T09:00:00.000Z",
    "rating": 4,
    "title": "Good finish overall",
    "comment": "The finish is smooth and the piece feels solid. I would buy again, especially if there are more patterns.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-23",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-23",
    "name": "Felix R.",
    "dateAdded": "2025-09-15T09:00:00.000Z",
    "rating": 3,
    "title": "Decent, but not my style",
    "comment": "The quality is fine, but the overall style is softer than I expected. It may suit a minimal room better than mine.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-24",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-24",
    "name": "Uyên Đỗ",
    "dateAdded": "2025-09-15T09:00:00.000Z",
    "rating": 2,
    "title": "Nice idea, but too small",
    "comment": "I liked the story behind the product, but the actual size felt smaller than what I imagined from the photos.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  },
  {
    "id": "review-25",
    "productId": "hand-painted-blue-lotus-vase",
    "userId": "user-25",
    "name": "Sarah W.",
    "dateAdded": "2025-09-15T09:00:00.000Z",
    "rating": 1,
    "title": "Arrived later than expected",
    "comment": "The vase itself is pretty, but the delivery took longer than I expected. I would have liked clearer shipping updates.",
    "image": "/images/shopping_items/ceramic/ceramic1.png"
  }
];
let nextReviewId = reviews.length + 1;

const clone = (value) => JSON.parse(JSON.stringify(value));

const createStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
};

const formatMonthYear = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
};

const getProduct = () => clone(product);

const getAllReviews = () =>
  clone(
    [...reviews].sort(
      (firstReview, secondReview) =>
        new Date(secondReview.dateAdded) - new Date(firstReview.dateAdded)
    )
  );

const getReviewById = (reviewId) => {
  const review = reviews.find((item) => item.id === reviewId);
  return review ? clone(review) : null;
};

const createReview = (reviewData) => {
  const createdReview = {
    id: `review-${nextReviewId++}`,
    productId: product.id,
    userId: reviewData.userId,
    name: reviewData.name,
    dateAdded: new Date().toISOString(),
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    image: reviewData.image || product.image
  };

  reviews.unshift(createdReview);
  return clone(createdReview);
};

const updateReview = (reviewId, currentUserId, reviewData) => {
  const reviewIndex = reviews.findIndex((item) => item.id === reviewId);

  if (reviewIndex === -1) {
    return { status: "not-found", review: null };
  }

  if (reviews[reviewIndex].userId !== currentUserId) {
    return { status: "forbidden", review: null };
  }

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    image: reviewData.image || product.image,
    dateAdded: new Date().toISOString()
  };

  return {
    status: "updated",
    review: clone(reviews[reviewIndex])
  };
};

const deleteReview = (reviewId, currentUserId) => {
  const reviewIndex = reviews.findIndex((item) => item.id === reviewId);

  if (reviewIndex === -1) {
    return { status: "not-found" };
  }

  if (reviews[reviewIndex].userId !== currentUserId) {
    return { status: "forbidden" };
  }

  reviews.splice(reviewIndex, 1);
  return { status: "deleted" };
};

const getReviewPageData = (currentUser) => {
  const reviewItems = getAllReviews().map((review) => ({
    ...review,
    isOwn: review.userId === currentUser.id,
    avatar: review.name.trim().charAt(0).toUpperCase(),
    stars: createStars(review.rating),
    dateLabel: formatMonthYear(review.dateAdded),
    dateValue: review.dateAdded.slice(0, 10),
    displayImage: review.image || product.image
  }));

  const totalReviews = reviewItems.length;
  const averageRatingNumber = totalReviews
    ? reviewItems.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  const ratingBreakdown = ratingValues.map((rating) => {
    const count = reviewItems.filter((review) => review.rating === rating).length;

    return {
      rating,
      count,
      percentage: totalReviews
        ? Math.round((count / totalReviews) * 100)
        : 0
    };
  });

  return {
    product: getProduct(),
    reviews: reviewItems,
    totalReviews,
    averageRating: averageRatingNumber.toFixed(1),
    displayAverageStars: createStars(Math.round(averageRatingNumber)),
    ratingBreakdown,
    ratingValues: clone(ratingValues),
    searchFields: clone(searchFields),
    currentUser: clone(currentUser)
  };
};

const getProductDetailPageData = () => {
  const reviewItems = getAllReviews();
  const totalReviews = reviewItems.length;
  const averageRating = totalReviews
    ? reviewItems.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / totalReviews
    : 0;

  const dynamicProductDetail = {
    ...clone(productDetail),
    rating: Number(averageRating.toFixed(1)),
    reviewCount: totalReviews
  };

  return {
    productData: dynamicProductDetail,
    relatedProductsData: clone(relatedProducts),
    tabs: clone(tabs),
    mobileNavigation: clone(mobileNavigation),
    productStars: createStars(Math.round(averageRating)),
    cartCountValue: 4
  };
};

module.exports = {
  createReview,
  deleteReview,
  getAllReviews,
  getProduct,
  getProductDetailPageData,
  getReviewById,
  getReviewPageData,
  updateReview
};

const quickNav = {
    featured: {
        label: "New Arrivals",
        image: "/images/landingpics/quicknav-new.png",
        alt: "Newly listed pieces",
        href: "/cart/products",
    },

    secondary: [
        {
            label: "Gift Sets",
            image: "/images/landingpics/quicknav-gifts.png",
            alt: "Gift-ready pieces wrapped for giving",
            href: "/cart/products",
        },
        {
            label: "Best Sellers",
            image: "/images/landingpics/quicknav-best.png",
            alt: "Best-selling pieces",
            href: "/cart/products",
        },
    ],
};

//Marquee text
const marqueeText =
    "Heritage | Handmade | Authentic | Sustainable | Heritage | Handmade | Authentic | Sustainable |";

//8 catogories
const categories = [
    {
        name: "Ceramics",
        vietnameseName: "Gốm",
        category: "ceramics",
        image: "/images/landingpics/craft-ceramics.png",
        alt: "Bát Tràng ceramic vessels",
    },
    {
        name: "Paintings",
        vietnameseName: "Tranh",
        category: "paintings",
        image: "/images/landingpics/craft-paintings.png",
        alt: "Traditional Vietnamese paintings",
    },
    {
        name: "Brocade",
        vietnameseName: "Thổ Cẩm",
        category: "silk-brocade",
        image: "/images/landingpics/craft-silk-brocade.png",
        alt: "Hand-woven silk and brocade",
    },
    {
        name: "Incense",
        vietnameseName: "Nhang Thơm",
        category: "incense",
        image: "/images/landingpics/craft-incense.png",
        alt: "Hand-rolled incense",
    },
    {
        name: "Wood Carving",
        vietnameseName: "Gỗ Điêu Khắc",
        category: "wood-carving",
        image: "/images/landingpics/craft-wood-carving.png",
        alt: "Carved wooden craft",
    },
    {
        name: "Water Puppets",
        vietnameseName: "Rối Nước",
        category: "water-puppets",
        image: "/images/landingpics/craft-water-puppets.png",
        alt: "Hand-carved water puppets",
    },
    {
        name: "Bamboo Weaving",
        vietnameseName: "Đồ Đan Tre",
        category: "bamboo-weaving",
        image: "/images/landingpics/craft-bamboo-weaving.png",
        alt: "Hand-woven bamboo homeware",
    },
    {
        name: "Feng Shui Stones",
        vietnameseName: "Đá Phong Thủy",
        category: "fengshui-stones",
        image: "/images/landingpics/craft-fengshui-stones.png",
        alt: "Feng shui stones and gems",
    },
];



//8 gallery images
const galleryImages = [
    "/images/landingpics/gallery-1.png",
    "/images/landingpics/gallery-2.png",
    "/images/landingpics/gallery-3.png",
    "/images/landingpics/gallery-4.png",
    "/images/landingpics/gallery-5.png",
    "/images/landingpics/gallery-6.png",
];

const processSteps = [
    {
        number: "01",
        title: "Sourced by Hand",
        description:
            "Clay, silk cocoons, bamboo, timber, stone and natural pigments are gathered directly from trusted regional suppliers — no middlemen.",
    },
    {
        number: "02",
        title: "Shaped & Formed",
        description:
            "Every piece passes through an artisan's hands — thrown, woven, carved, painted, or bound, one at a time.",
    },
    {
        number: "03",
        title: "Finished with Patience",
        description:
            "Glazing, dyeing, polishing or painting — the slowest stage, and the one that cannot be rushed.",
    },
    {
        number: "04",
        title: "Packed & Sent With Care",
        description:
            "Wrapped by the same hands that made it, boxed, and shipped straight to your door.",
    },
];

const featuredProducts = [
    {
        reviewNumber: 1,
        name: "Hand-Painted Blue Lotus Vase",
        image: "/images/shopping_items/ceramic/ceramic1.png",
        alt: "Hand-Painted Blue Lotus Vase",
        rating: "★★★★★",
        reviewCount: 86,
        price: "$68.00",
        badge: "Bestseller",
    },
    {
        reviewNumber: 2,
        name: "Ash Glaze Tea Cup Set (7-Piece)",
        image: "/images/shopping_items/ceramic/ceramic2.png",
        alt: "Ash Glaze Tea Cup Set, seven pieces",
        rating: "★★★★★",
        reviewCount: 243,
        price: "$54.00",
        badge: null,
    },
    {
        reviewNumber: 3,
        name: "Brocade Blanket",
        image: "/images/shopping_items/brocade/brocade1.png",
        alt: "Brocade blanket",
        rating: "★★★★★",
        reviewCount: 198,
        price: "$56.00",
        badge: null,
    },
    {
        reviewNumber: 4,
        name: "Handmade Horse Brocade",
        image: "/images/shopping_items/brocade/brocade2.png",
        alt: "Handmade Horse Brocade",
        rating: "★★★★★",
        reviewCount: 167,
        price: "$45.00",
        badge: null,
    },
    {
        reviewNumber: 6,
        name: "Agarwood Incense",
        image: "/images/shopping_items/incense/incense2.png",
        alt: "Hand-rolled agarwood incense",
        rating: "★★★★★",
        reviewCount: 112,
        price: "$38.00",
        badge: "New",
    },
    {
        reviewNumber: 8,
        name: "Đông Hồ Painting",
        image: "/images/shopping_items/painting/painting_2.png",
        alt: "Đông Hồ painting",
        rating: "★★★★★",
        reviewCount: 95,
        price: "$16.00",
        badge: null,
    },
];

const testimonials = [
    {
        quote:
            "The vase arrived with a handwritten card from the workshop. It's the first thing guests ask about.",
        initial: "T",
        name: "Trang N.",
        location: "Hồ Chí Minh City",
    },
    {
        quote:
            "I've bought from three different craft marketplaces. This is the only one that tells me who actually made the piece.",
        initial: "D",
        name: "David R.",
        location: "Singapore",
    },
    {
        quote:
            "The wood comb is even better in person. Packaging alone felt like a gift.",
        initial: "M",
        name: "Minh H.",
        location: "Hà Nội",
    },
    {
        quote:
            "Ordered a scarf for my mother. She wore it to a wedding and got asked about it all night.",
        initial: "L",
        name: "Léa B.",
        location: "Paris",
    },
];

const journalPosts = [
    {
        id: "post-hoi-an",
        featured: true,
        image: "/images/landingpics/journal-hoian.png",
        alt: "Historic Hội An street at sunrise",
        tag: "Places",
        title: "A Slow Morning in Hội An",
        description:
            "Before the crowds arrive, work resumes at a scale that's easy to miss later in the day.",
        author: "Linh Trần",
        date: "June 11, 2026",
    },
    {
        id: "post-bat-trang",
        featured: false,
        image: "/images/landingpics/journal-bat-trang.png",
        alt: "Ceramic vessels in a workshop",
        tag: "Guide",
        title: "Bát Tràng Beyond Blue and White",
        description: null,
        author: "Mai An",
        date: "June 28, 2026",
    },
    {
        id: "post-lacquer-artist",
        featured: false,
        image: "/images/landingpics/journal-lacquer.png",
        alt: "Artist hands finishing a lacquer surface",
        tag: "Guide",
        title: "The Patience of a Lacquer Artist",
        description: null,
        author: "Minh Khôi",
        date: "June 19, 2026",
    },
];

//faq section 
const faqItems = [
  {
    question: "How do I know a piece is authentic?",
    answer:
      "Every listing names the workshop and village it came from. We visit each workshop in person before it joins the marketplace.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship across Việt Nam and to most international destinations. Rates are calculated at checkout.",
  },
  {
    question: "What if a piece arrives damaged?",
    answer:
      "Contact us within 7 days with a photo and we will arrange a replacement or refund.",
  },
  {
    question: "Can I request a custom commission?",
    answer:
      "Many of our workshops accept custom orders. Contact us through the product listing and we will pass your request to the maker.",
  },
];

//community card
const communityCards = [
  {
    modifier: "forum",
    title: "The Round Table",
    description:
      "Talk technique, provenance and care with fellow collectors and makers.",
    cta: "Visit the Forum →",
    href: "#",  //FIX THIS WHEN HAVING FORUM
  },
  {
    modifier: "cart",
    title: "Your Curated Collection",
    description:
      "Save the pieces that speak to you, and return whenever you are ready.",
    cta: "Open Cart →",
    href: "/cart",
  },
];


//direction
const getLandingPageData = () => ({
    quickNav,
    marqueeText,
    categories,
    galleryImages,
    processSteps,
    featuredProducts,
    testimonials,
    journalPosts,
    faqItems,
    communityCards,
});

module.exports = {
    getLandingPageData,
};
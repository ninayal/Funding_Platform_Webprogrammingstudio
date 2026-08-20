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

const marqueeText =
    "Heritage | Handmade | Authentic | Sustainable | Heritage | Handmade | Authentic | Sustainable |";

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
        category: "painting",
        image: "/images/landingpics/craft-paintings.png",
        alt: "Traditional Vietnamese paintings",
    },
    {
        name: "Brocade",
        vietnameseName: "Thổ Cẩm",
        category: "brocade",
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
        category: "woodcarving",
        image: "/images/landingpics/craft-wood-carving.png",
        alt: "Carved wooden craft",
    },
    {
        name: "Water Puppets",
        vietnameseName: "Rối Nước",
        category: "waterpuppet",
        image: "/images/landingpics/craft-water-puppets.png",
        alt: "Hand-carved water puppets",
    },
    {
        name: "Bamboo Weaving",
        vietnameseName: "Đồ Đan Tre",
        category: "bamboo",
        image: "/images/landingpics/craft-bamboo-weaving.png",
        alt: "Hand-woven bamboo homeware",
    },
    {
        name: "Feng Shui Stones",
        vietnameseName: "Đá Phong Thủy",
        category: "stone",
        image: "/images/landingpics/craft-fengshui-stones.png",
        alt: "Feng shui stones and gems",
    },
];

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

const communityCards = [
    {
        modifier: "forum",
        title: "The Round Table",
        description:
            "Talk technique, provenance and care with fellow collectors and makers.",
        cta: "Visit the Forum →",
        href: "/forum",
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

const getLandingPageData = () => ({
    quickNav,
    marqueeText,
    categories,
    galleryImages,
    processSteps,
    testimonials,
    journalPosts,
    faqItems,
    communityCards,
});

module.exports = {
    getLandingPageData,
};
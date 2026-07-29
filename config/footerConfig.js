
const footerConfig = {
  navigation: [
    {
      title: "Shop",
      links: [
        { label: "Home", href: "/" },
        { label: "Shop All", href: "/cart/products" },
        { label: "Gift Cards", href: "/giftcard/giftcard" },
        { label: "Reviews", href: "/review" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Journal", href: "/blog" },
        { label: "Forum", href: "/forum" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQ", href: "/#faq" },
        { label: "Log In / Sign Up", href: "/shared/login" },
        { label: "Sitemap", href: "/shared/sitemap" },
      ],
    },
  ],
  badges: [
    "100% Handmade",
    "Natural Materials",
    "Nationwide Shipping",
    "Gives Back to Charity",
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/shared/privacy-policy" },
    { label: "Terms of Service", href: "/shared/terms-of-service" },
  ],
  socialLinks: [
    {
      label: "Instagram",
      text: "IG",
      href: "https://www.instagram.com/langco_198?igsh=dGVkejlrdHc5Zmtj&utm_source=qr",
      external: true,
    },
    {
      label: "Facebook",
      text: "FB",
      href: "#",
      external: false,
    },
    {
      label: "Pinterest",
      text: "PT",
      href: "#",
      external: false,
    },
  ],
};

module.exports = footerConfig;
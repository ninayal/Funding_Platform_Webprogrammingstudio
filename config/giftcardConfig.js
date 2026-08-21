"use strict";

const giftTypes = [
  {
    id: "gift-lang",
    value: "lang-impact",
    index: "A",
    title: "Làng Impact Gift",
    copy:
      "Create a meaningful gift while Làng & Co. directs the contribution " +
      "across verified organizations, approved individuals, and priority causes.",
    action: "Choose this option →",
  },
  {
    id: "gift-honour",
    value: "donation-in-honour",
    index: "B",
    title: "Donation in Honour",
    copy:
      "Choose a specific cause yourself, make the donation in someone special's " +
      "honour, and send them a meaningful note.",
    action: "Choose this option →",
  },
];

const deliveryTypes = [
  {
    id: "delivery-digital",
    value: "digital",
    icon: "✉",
    title: "Digital eCard",
    copy: "Email delivery immediately or on a scheduled date.",
  },
  {
    id: "delivery-printable",
    value: "printable",
    icon: "⌑",
    title: "Printable",
    copy: "Download a print-ready card and prepare it at home.",
  },
  {
    id: "delivery-physical",
    value: "physical",
    icon: "✦",
    title: "Physical Card",
    copy: "A real card prepared for delivery to the recipient.",
  },
];

const designs = [
  {
    id: "design-lotus",
    value: "ho-tay-lotus",
    cardClass: "design-card--lotus",
    previewClass: "preview-name--lotus",
    title: "Hồ Tây Lotus",
    meta: "Lotus · Summer · Hanoi",
  },
  {
    id: "design-battrang",
    value: "bat-trang-blue",
    cardClass: "design-card--ceramic",
    previewClass: "preview-name--battrang",
    title: "Bát Tràng Blue",
    meta: "Ceramic · Kiln · Heritage",
  },
  {
    id: "design-vanphuc",
    value: "van-phuc-silk",
    cardClass: "design-card--silk",
    previewClass: "preview-name--vanphuc",
    title: "Vạn Phúc Silk",
    meta: "Silk · Loom · Hà Đông",
  },
  {
    id: "design-hathai",
    value: "ha-thai-lacquer",
    cardClass: "design-card--lacquer",
    previewClass: "preview-name--hathai",
    title: "Hạ Thái Lacquer",
    meta: "Lacquer · Layers · Patience",
  },
  {
    id: "design-hoian",
    value: "hoi-an-glow",
    cardClass: "design-card--hoian",
    previewClass: "preview-name--hoian",
    title: "Hội An Glow",
    meta: "Lantern · River · Old Town",
  },
  {
    id: "design-phuvinh",
    value: "phu-vinh-bamboo",
    cardClass: "design-card--bamboo",
    previewClass: "preview-name--phuvinh",
    title: "Phú Vinh Bamboo",
    meta: "Rattan · Weave · Craft Village",
  },
];

const causes = [
  {
    value: "craft-preservation",
    label: "Vietnamese Craft Preservation",
  },
  {
    value: "education",
    label: "Education and Learning Access",
  },
  {
    value: "community-support",
    label: "Community and Family Support",
  },
  {
    value: "environment",
    label: "Environmental Protection",
  },
  {
    value: "artisan-support",
    label: "Artisan Livelihood Support",
  },
];

const printFormats = [
  "Flat Card",
  "Folded Card",
  "Postcard Style",
];

const paperSizes = [
  "A4",
  "A5",
  "A6",
];

const downloadFormats = [
  "PDF — Print Ready",
];

const giftcardDefaults = {
  giftType: "",
  deliveryType: "",
  designType: "",
  quantity: "",
  amountPerCard: "",
  recipientName: "",
  senderName: "",
  message: "",
  causeCategory: "",
  causeNote: "",
  recipientEmail: "",
  printFormat: "Flat Card",
  paperSize: "A4",
  downloadFormat: "PDF — Print Ready",
  recipientPhone: "",
  physicalDeliveryDate: "",
  streetAddress: "",
  district: "",
  city: "",
  postalCode: "",
};

const giftViewDemo = {
  code: "LANG-DEMO-2026",
  giftType: "Làng Impact Gift",
  amount: 50,
  senderName: "Huy",
  recipientName: "Minh",
  message: "Wishing you a meaningful birthday.",
  status: "Awaiting allocation",
  statusCopy:
    "Làng & Co. will direct this contribution to verified organizations, " +
    "approved individuals, or priority causes.",
};

const emailTimings = [
  "Send immediately",
  "Schedule delivery",
];

module.exports = {
  giftTypes,
  deliveryTypes,
  designs,
  causes,
  printFormats,
  paperSizes,
  emailTimings,
  downloadFormats,
  giftcardDefaults,
  giftViewDemo,
};
"use strict";

const profileStats = [
  {
    label: "Orders placed",
    value: "18",
    description:
      "Across ceramics, textiles, and lacquerware"
  },
  {
    label: "In transit",
    value: "03",
    description:
      "Two international, one domestic delivery"
  },
  {
    label: "Support requests",
    value: "01",
    description:
      "Your latest shipping inquiry is being reviewed"
  }
];

const orderSummary = [
  {
    label: "Preparing",
    value: "01",
    description:
      "Your order is being packed by the workshop."
  },
  {
    label: "In transit",
    value: "02",
    description:
      "On the way to your delivery address."
  },
  {
    label: "Delivered",
    value: "15",
    description:
      "Successfully received and completed."
  }
];

const orders = [
  {
    id: "LC-240518",
    name:
      "Bát Tràng Blue Lotus Vase",
    status:
      "In Transit",
    statusClass:
      "transit",
    placedOn:
      "18 May 2026",
    estimatedArrival:
      "23 May 2026",
    total:
      "₫2,100,000",
    progress:
      76,
    steps: [
      {
        label:
          "Confirmed",
        state:
          "done"
      },
      {
        label:
          "Packed",
        state:
          "done"
      },
      {
        label:
          "In Transit",
        state:
          "active"
      },
      {
        label:
          "Delivered",
        state:
          ""
      }
    ],
    timeline: [
      {
        title:
          "Order confirmed",
        description:
          "Your payment has been received successfully.",
        state:
          "done"
      },
      {
        title:
          "Packed by workshop",
        description:
          "The artisan studio finished preparing your ceramic vase.",
        state:
          "done"
      },
      {
        title:
          "Shipping in progress",
        description:
          "The parcel is currently moving through the courier network.",
        state:
          "active"
      },
      {
        title:
          "Ready for delivery",
        description:
          "This step will update once the order reaches your local address hub.",
        state:
          ""
      }
    ],
    primaryAction: {
      label:
        "Track shipment",
      href:
        "#"
    },
    secondaryAction: {
      label:
        "View invoice",
      href:
        "/cart/order-confirmation"
    }
  },
  {
    id: "LC-240503",
    name:
      "Vạn Phúc Silk Scarf",
    status:
      "Preparing",
    statusClass:
      "preparing",
    placedOn:
      "03 May 2026",
    estimatedArrival:
      "10 May 2026",
    total:
      "₫1,250,000",
    progress:
      38,
    steps: [
      {
        label:
          "Confirmed",
        state:
          "done"
      },
      {
        label:
          "Packed",
        state:
          "active"
      },
      {
        label:
          "In Transit",
        state:
          ""
      },
      {
        label:
          "Delivered",
        state:
          ""
      }
    ],
    timeline: [
      {
        title:
          "Order confirmed",
        description:
          "Your order has been approved and scheduled for preparation.",
        state:
          "done"
      },
      {
        title:
          "Preparing order",
        description:
          "The scarf is being packed carefully for international delivery.",
        state:
          "active"
      },
      {
        title:
          "Shipment dispatch",
        description:
          "Courier details will appear here once the package is handed over.",
        state:
          ""
      },
      {
        title:
          "Final delivery",
        description:
          "You will receive a notification once the item is out for delivery.",
        state:
          ""
      }
    ],
    primaryAction: {
      label:
        "Order details",
      href:
        "/cart/order-confirmation"
    },
    secondaryAction: {
      label:
        "Contact support",
      href:
        "mailto:ninayal198@gmail.com"
    }
  }
];

const notifications = [
  {
    type:
      "Order",
    title:
      "Your Bát Tràng Blue Lotus Vase is now in transit.",
    description:
      "Updated 2 hours ago · Track your shipment from the Order Tracking tab."
  },
  {
    type:
      "New",
    title:
      "A new collection from Hội An artisans is now available.",
    description:
      "Explore recently added lantern-inspired handcrafted pieces."
  },
  {
    type:
      "Forum",
    title:
      "Someone replied to your discussion about lacquer care.",
    description:
      "Open the forum to continue the conversation with the community."
  },
  {
    type:
      "Support",
    title:
      "Your support request has been received.",
    description:
      "We usually respond within one business day."
  }
];

module.exports = {
  notifications,
  orders,
  orderSummary,
  profileStats
};

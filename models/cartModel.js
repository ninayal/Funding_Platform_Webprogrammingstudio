"use strict";

const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const Cart = require("./schemas/Cart");
const CartItem = require("./schemas/CartItem");
const productModel = require("./productModel");

const {
  giftTypes,
  deliveryTypes,
  designs,
} = require("../config/giftcardConfig");

const GIFTCARD_ITEM_TYPE = "giftcard";

const GIFT_CARD_DESIGN_COLORS = {
  "ho-tay-lotus": ["#A31D1D", "#6D2323"],
  "bat-trang-blue": ["#5A7CA0", "#233A55"],
  "van-phuc-silk": ["#D3AB7C", "#81563C"],
  "ha-thai-lacquer": ["#21140F", "#6D2323"],
  "hoi-an-glow": ["#C66B2B", "#6D2323"],
  "phu-vinh-bamboo": ["#7A8250", "#34442D"],
};

const buildGiftcardThumbnail = (designType) => {
  const [startColor, endColor] =
    GIFT_CARD_DESIGN_COLORS[designType] ||
    GIFT_CARD_DESIGN_COLORS["ho-tay-lotus"];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 132">
      <defs>
        <linearGradient id="giftcard-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
      </defs>
      <rect width="108" height="132" rx="10" fill="url(#giftcard-gradient)"/>
      <circle cx="88" cy="24" r="34" fill="rgba(254,249,225,.10)"/>
      <text x="12" y="26" fill="#FEF9E1" font-family="Georgia, serif"
        font-size="11" font-style="italic">Làng &amp; Co.</text>
      <text x="12" y="108" fill="#FEF9E1" font-family="Arial, sans-serif"
        font-size="7" font-weight="700" letter-spacing="1">IMPACT GIFT</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getOption = (items, value, fallback) =>
  items.find((item) => item.value === value) || fallback;

const getCartByUserId = async (userId) => {
  if (!userId) return null;

  return Cart.findOne({
    userId: String(userId),
  }).lean();
};

const ensureCart = async (userId) => {
  const id = String(userId || "");

  if (!id) {
    throw new Error("A user ID is required.");
  }

  return Cart.findOneAndUpdate(
    {
      userId: id,
    },
    {
      $setOnInsert: {
        _id: `cart-${randomUUID()}`,
        userId: id,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
};

const touchCart = async (cartId) => {
  await Cart.updateOne(
    {
      _id: String(cartId),
    },
    {
      $set: {
        updatedAt: new Date(),
      },
    }
  );
};

const buildGiftcardCartItem = (item) => {
  const draft = item.giftcardDraft || {};

  const quantity = Math.max(
    1,
    Number(draft.quantity) || Number(item.quantity) || 1
  );

  const amountPerCard = Number(draft.amountPerCard) || 0;

  const giftType = getOption(
    giftTypes,
    draft.giftType,
    giftTypes[0]
  );

  const delivery = getOption(
    deliveryTypes,
    draft.deliveryType,
    deliveryTypes[0]
  );

  const design = getOption(
    designs,
    draft.designType,
    designs[0]
  );

  const giftCode = draft.code || "Pending checkout";
  const cartItemId = String(item._id);

  return {
    productId: cartItemId,
    itemType: GIFTCARD_ITEM_TYPE,
    quantity,

    product: {
      id: cartItemId,
      name: giftType?.title || "Gift Card",
      image: buildGiftcardThumbnail(draft.designType),
      maker: "Làng & Co.",
      material: delivery?.title || "Gift Card",
      variant: `${design?.title || "Gift Design"} | Code: ${giftCode}`,
      giftCode,
      price: amountPerCard,
      oldPrice: null,
      stock: quantity,
      href: `/giftcard?cartItem=${encodeURIComponent(cartItemId)}#details`,
    },

    subtotal: amountPerCard * quantity,
  };
};

const getCartItems = async (userId) => {
  const cart = await getCartByUserId(userId);

  if (!cart) return [];

  const storedItems = await CartItem.find({
    cartId: cart._id,
  })
    .sort({
      createdAt: 1,
    })
    .lean();

  const items = await Promise.all(
    storedItems.map(async (item) => {
      if (item.itemType === GIFTCARD_ITEM_TYPE) {
        return buildGiftcardCartItem(item);
      }

      const product = await productModel.getProductById(
        item.productId
      );

      if (!product) return null;

      return {
        productId: String(item.productId),
        itemType: "product",
        quantity: item.quantity,
        product,
        subtotal: product.price * item.quantity,
      };
    })
  );

  return items.filter(Boolean);
};

const validateQuantity = (quantity, stock) => {
  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1
  ) {
    return {
      success: false,
      message: "Quantity must be a whole number of at least 1.",
    };
  }

  if (parsedQuantity > stock) {
    return {
      success: false,
      message: `Only ${stock} item(s) available.`,
    };
  }

  return {
    success: true,
    quantity: parsedQuantity,
  };
};

const addItemToCart = async (
  userId,
  productId,
  quantity = 1
) => {
  const product = await productModel.getProductById(
    productId
  );

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const validation = validateQuantity(
    quantity,
    product.stock
  );

  if (!validation.success) return validation;

  const cart = await ensureCart(userId);

  const existingItem = await CartItem.findOne({
    cartId: cart._id,
    itemType: "product",
    productId: String(productId),
  });

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + validation.quantity;

    if (newQuantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      };
    }

    existingItem.quantity = newQuantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cartId: cart._id,
      itemType: "product",
      productId: String(productId),
      quantity: validation.quantity,
    });
  }

  await touchCart(cart._id);

  return {
    success: true,
  };
};

const addGiftcardDraftToCart = async (
  userId,
  values,
  cartItemId = null
) => {
  const quantity = Number(values?.quantity);
  const amountPerCard = Number(values?.amountPerCard);

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !Number.isFinite(amountPerCard) ||
    amountPerCard <= 0
  ) {
    return {
      success: false,
      message: "Gift Card details are invalid.",
    };
  }

  const cart = await ensureCart(userId);

  if (cartItemId) {
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return {
        success: false,
        message: "Gift Card cart item not found.",
      };
    }

    const item = await CartItem.findOne({
      _id: cartItemId,
      cartId: cart._id,
      itemType: GIFTCARD_ITEM_TYPE,
    });

    if (!item) {
      return {
        success: false,
        message: "Gift Card cart item not found.",
      };
    }

    item.quantity = quantity;
    item.giftcardDraft = { ...values };

    await item.save();
    await touchCart(cart._id);

    return {
      success: true,
      productId: String(item._id),
    };
  }

  const item = await CartItem.create({
    cartId: cart._id,
    itemType: GIFTCARD_ITEM_TYPE,
    productId: null,
    quantity,
    giftcardDraft: { ...values },
  });

  await touchCart(cart._id);

  return {
    success: true,
    productId: String(item._id),
  };
};

const getGiftcardDraftItem = async (
  userId,
  cartItemId
) => {
  const cart = await getCartByUserId(userId);

  if (
    !cart ||
    !mongoose.Types.ObjectId.isValid(cartItemId)
  ) {
    return null;
  }

  const item = await CartItem.findOne({
    _id: cartItemId,
    cartId: cart._id,
    itemType: GIFTCARD_ITEM_TYPE,
  }).lean();

  if (!item) return null;

  return {
    productId: String(item._id),
    quantity: item.quantity,
    giftcardDraft: {
      ...(item.giftcardDraft || {}),
    },
  };
};

const getPendingGiftcardDrafts = async (userId) => {
  const cart = await getCartByUserId(userId);

  if (!cart) return [];

  const items = await CartItem.find({
    cartId: cart._id,
    itemType: GIFTCARD_ITEM_TYPE,
  }).lean();

  return items.map((item) => ({
    productId: String(item._id),
    values: {
      ...(item.giftcardDraft || {}),
    },
  }));
};

const updateCartItem = async (
  userId,
  productId,
  quantity
) => {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  const item = await CartItem.findOne({
    cartId: cart._id,
    itemType: "product",
    productId: String(productId),
  });

  if (!item) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  const product = await productModel.getProductById(
    productId
  );

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const validation = validateQuantity(
    quantity,
    product.stock
  );

  if (!validation.success) return validation;

  item.quantity = validation.quantity;

  await item.save();
  await touchCart(cart._id);

  return {
    success: true,
  };
};

const removeCartItem = async (
  userId,
  productId
) => {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  const itemId = String(productId);
  const filters = [
    {
      cartId: cart._id,
      itemType: "product",
      productId: itemId,
    },
  ];

  if (mongoose.Types.ObjectId.isValid(itemId)) {
    filters.push({
      _id: itemId,
      cartId: cart._id,
      itemType: GIFTCARD_ITEM_TYPE,
    });
  }

  const deletedItem = await CartItem.findOneAndDelete({
    $or: filters,
  });

  if (!deletedItem) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  await touchCart(cart._id);

  return {
    success: true,
  };
};

const clearCart = async (userId) => {
  const cart = await getCartByUserId(userId);

  if (!cart) return null;

  await CartItem.deleteMany({
    cartId: cart._id,
  });

  await touchCart(cart._id);

  return cart;
};

const getCartSummary = async (userId) => {
  if (!userId) {
    return {
      items: [],
      totalQuantity: 0,
      subtotal: 0,
    };
  }

  const items = await getCartItems(userId);

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  return {
    items,
    totalQuantity,
    subtotal,
  };
};

module.exports = {
  getCartByUserId,
  getCartItems,
  addItemToCart,
  addGiftcardDraftToCart,
  getGiftcardDraftItem,
  getPendingGiftcardDrafts,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};
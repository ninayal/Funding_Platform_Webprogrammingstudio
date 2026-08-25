"use strict";

const crypto = require("crypto");

const Cart = require("./schemas/Cart");
const CartItem = require("./schemas/CartItem");
const productModel = require("./productModel");

const {
  giftTypes,
  deliveryTypes,
  designs,
} = require("../config/giftcardConfig");

const GIFTCARD_ITEM_TYPE = "giftcard";
const GIFTCARD_ID_PREFIX = "giftcard-draft-";

const GIFT_CARD_DESIGN_COLORS = {
  "ho-tay-lotus": ["#A31D1D", "#6D2323"],
  "bat-trang-blue": ["#5A7CA0", "#233A55"],
  "van-phuc-silk": ["#D3AB7C", "#81563C"],
  "ha-thai-lacquer": ["#21140F", "#6D2323"],
  "hoi-an-glow": ["#C66B2B", "#6D2323"],
  "phu-vinh-bamboo": ["#7A8250", "#34442D"],
};

const buildGiftcardThumbnail = (
  designType
) => {
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
      <text x="12" y="26" fill="#FEF9E1" font-family="Georgia,serif" font-size="11" font-style="italic">
        Làng &amp; Co.
      </text>
      <text x="12" y="108" fill="#FEF9E1" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="1">
        IMPACT GIFT
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getOption = (
  items,
  value,
  fallback
) =>
  items.find(
    (item) =>
      item.value === value
  ) || fallback;

const touchCart = async (
  cartId
) => {
  await Cart.updateOne(
    { _id: String(cartId) },
    {
      $set: {
        updatedAt: new Date(),
      },
    }
  );
};

const getCartDocument = async (
  userId
) => {
  if (!userId) {
    return null;
  }

  const normalizedUserId =
    String(userId);

  let cart =
    await Cart.findOne({
      userId: normalizedUserId,
    });

  if (!cart) {
    try {
      cart = await Cart.create({
        _id: `cart-${Date.now()}`,
        userId: normalizedUserId,
      });
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }

      cart =
        await Cart.findOne({
          userId:
            normalizedUserId,
        });
    }
  }

  return cart;
};

const getRawItems = async (
  cartId
) =>
  CartItem.find({
    cartId: String(cartId),
  })
    .sort({ createdAt: 1 })
    .lean();

const buildCartRecord = async (
  cart
) => {
  if (!cart) {
    return {
      id: null,
      userId: null,
      items: [],
    };
  }

  const data =
    typeof cart.toObject === "function"
      ? cart.toObject()
      : cart;

  return {
    id: String(data._id),
    userId: String(data.userId),
    items:
      await getRawItems(
        data._id
      ),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const getCartByUserId = async (
  userId
) => {
  const cart =
    await getCartDocument(userId);

  return buildCartRecord(cart);
};

const buildGiftcardCartItem = (
  item
) => {
  const draft =
    item.giftcardDraft || {};

  const quantity =
    Math.max(
      1,
      Number(draft.quantity) ||
      Number(item.quantity) ||
      1
    );

  const amountPerCard =
    Number(
      draft.amountPerCard
    ) || 0;

  const giftType =
    getOption(
      giftTypes,
      draft.giftType,
      giftTypes[0]
    );

  const delivery =
    getOption(
      deliveryTypes,
      draft.deliveryType,
      deliveryTypes[0]
    );

  const design =
    getOption(
      designs,
      draft.designType,
      designs[0]
    );

  return {
    productId: item.productId,
    itemType:
      GIFTCARD_ITEM_TYPE,
    quantity,

    product: {
      id: item.productId,

      name:
        giftType?.title ||
        "Gift Card",

      image:
        buildGiftcardThumbnail(
          draft.designType
        ),

      maker:
        "Làng & Co.",

      material:
        delivery?.title ||
        "Gift Card",

      variant:
        `${design?.title || "Gift Design"} | Code: Pending checkout`,

      giftCode:
        "Pending checkout",

      price:
        amountPerCard,

      oldPrice:
        null,

      stock:
        quantity,

      href:
        `/giftcard?cartItem=${encodeURIComponent(
          item.productId
        )}#details`,
    },

    subtotal:
      amountPerCard *
      quantity,
  };
};

const getCartItems = async (
  userId
) => {
  const cart =
    await getCartDocument(userId);

  if (!cart) {
    return [];
  }

  const items =
    await getRawItems(
      cart._id
    );

  const resolvedItems =
    await Promise.all(
      items.map(
        async (item) => {
          if (
            item.itemType ===
            GIFTCARD_ITEM_TYPE
          ) {
            return buildGiftcardCartItem(
              item
            );
          }

          const product =
            await productModel.getProductById(
              item.productId
            );

          if (!product) {
            return null;
          }

          return {
            productId:
              item.productId,

            itemType:
              "product",

            quantity:
              item.quantity,

            product,

            subtotal:
              product.price *
              item.quantity,
          };
        }
      )
    );

  return resolvedItems.filter(
    Boolean
  );
};

const validateQuantity = (
  quantity,
  stock
) => {
  const parsedQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      parsedQuantity
    ) ||
    parsedQuantity < 1
  ) {
    return {
      success: false,
      message:
        "Quantity must be a whole number of at least 1.",
    };
  }

  if (
    parsedQuantity > stock
  ) {
    return {
      success: false,
      message:
        `Only ${stock} item(s) available.`,
    };
  }

  return {
    success: true,
    quantity:
      parsedQuantity,
  };
};

const addItemToCart = async (
  userId,
  productId,
  quantity = 1
) => {
  const cart =
    await getCartDocument(userId);

  const product =
    await productModel.getProductById(
      productId
    );

  if (!product) {
    return {
      success: false,
      message:
        "Product not found.",
    };
  }

  const validation =
    validateQuantity(
      quantity,
      product.stock
    );

  if (!validation.success) {
    return validation;
  }

  const existingItem =
    await CartItem.findOne({
      cartId:
        String(cart._id),

      productId:
        String(productId),
    });

  if (existingItem) {
    const newQuantity =
      existingItem.quantity +
      validation.quantity;

    if (
      newQuantity >
      product.stock
    ) {
      return {
        success: false,
        message:
          `Only ${product.stock} item(s) available.`,
      };
    }

    existingItem.quantity =
      newQuantity;

    await existingItem.save();
  } else {
    await CartItem.create({
      cartId:
        String(cart._id),

      itemType:
        "product",

      productId:
        String(productId),

      quantity:
        validation.quantity,
    });
  }

  await touchCart(
    cart._id
  );

  return {
    success: true,
    cart:
      await getCartByUserId(
        userId
      ),
  };
};

const addGiftcardDraftToCart =
  async (
    userId,
    values,
    cartItemId = null
  ) => {
    const cart =
      await getCartDocument(
        userId
      );

    const quantity =
      Number(values?.quantity);

    const amountPerCard =
      Number(
        values?.amountPerCard
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      !Number.isFinite(
        amountPerCard
      ) ||
      amountPerCard <= 0
    ) {
      return {
        success: false,
        message:
          "Gift Card details are invalid.",
      };
    }

    if (cartItemId) {
      const existingItem =
        await CartItem.findOne({
          cartId:
            String(cart._id),

          productId:
            String(
              cartItemId
            ),

          itemType:
            GIFTCARD_ITEM_TYPE,
        });

      if (!existingItem) {
        return {
          success: false,
          message:
            "Gift Card cart item not found.",
        };
      }

      existingItem.quantity =
        quantity;

      existingItem.giftcardDraft = {
        ...values,
      };

      await existingItem.save();

      await touchCart(
        cart._id
      );

      return {
        success: true,

        cart:
          await getCartByUserId(
            userId
          ),

        productId:
          existingItem.productId,
      };
    }

    const productId =
      `${GIFTCARD_ID_PREFIX}${crypto.randomUUID()}`;

    await CartItem.create({
      cartId:
        String(cart._id),

      itemType:
        GIFTCARD_ITEM_TYPE,

      productId,

      quantity,

      giftcardDraft: {
        ...values,
      },
    });

    await touchCart(
      cart._id
    );

    return {
      success: true,

      cart:
        await getCartByUserId(
          userId
        ),

      productId,
    };
  };

const getGiftcardDraftItem =
  async (
    userId,
    productId
  ) => {
    const cart =
      await getCartDocument(
        userId
      );

    if (!cart) {
      return null;
    }

    const item =
      await CartItem.findOne({
        cartId:
          String(cart._id),

        productId:
          String(productId),

        itemType:
          GIFTCARD_ITEM_TYPE,
      }).lean();

    if (!item) {
      return null;
    }

    return {
      productId:
        item.productId,

      quantity:
        item.quantity,

      giftcardDraft: {
        ...item.giftcardDraft,
      },
    };
  };

const getPendingGiftcardDrafts =
  async (
    userId
  ) => {
    const cart =
      await getCartDocument(
        userId
      );

    if (!cart) {
      return [];
    }

    const items =
      await CartItem.find({
        cartId:
          String(cart._id),

        itemType:
          GIFTCARD_ITEM_TYPE,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    return items.map(
      (item) => ({
        productId:
          item.productId,

        values: {
          ...item.giftcardDraft,
        },
      })
    );
  };

const updateCartItem = async (
  userId,
  productId,
  quantity
) => {
  const cart =
    await getCartDocument(
      userId
    );

  const cartItem =
    await CartItem.findOne({
      cartId:
        String(cart._id),

      productId:
        String(productId),
    });

  if (!cartItem) {
    return {
      success: false,
      message:
        "Cart item not found.",
    };
  }

  if (
    cartItem.itemType ===
    GIFTCARD_ITEM_TYPE
  ) {
    return {
      success: false,
      message:
        "Edit the Gift Card to change its quantity or details.",
    };
  }

  const product =
    await productModel.getProductById(
      productId
    );

  if (!product) {
    return {
      success: false,
      message:
        "Product not found.",
    };
  }

  const validation =
    validateQuantity(
      quantity,
      product.stock
    );

  if (!validation.success) {
    return validation;
  }

  cartItem.quantity =
    validation.quantity;

  await cartItem.save();

  await touchCart(
    cart._id
  );

  return {
    success: true,
    cart:
      await getCartByUserId(
        userId
      ),
  };
};

const removeCartItem = async (
  userId,
  productId
) => {
  const cart =
    await getCartDocument(
      userId
    );

  const item =
    await CartItem.findOne({
      cartId:
        String(cart._id),

      productId:
        String(productId),
    });

  if (!item) {
    return {
      success: false,
      message:
        "Cart item not found.",
    };
  }

  await item.deleteOne();

  await touchCart(
    cart._id
  );

  return {
    success: true,
    cart:
      await getCartByUserId(
        userId
      ),
  };
};

const clearCart = async (
  userId
) => {
  const cart =
    await getCartDocument(
      userId
    );

  if (!cart) {
    return null;
  }

  await CartItem.deleteMany({
    cartId:
      String(cart._id),
  });

  await touchCart(
    cart._id
  );

  return getCartByUserId(
    userId
  );
};

const getCartSummary = async (
  userId
) => {
  const items =
    await getCartItems(
      userId
    );

  const totalQuantity =
    items.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  const subtotal =
    items.reduce(
      (total, item) =>
        total +
        item.subtotal,
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
const carts = require("../data/carts");
const productModel = require("./productModel");

const getCartByUserId = (userId) => {
  let cart = carts.find(
    (item) => item.userId === String(userId)
  );

  if (!cart) {
    cart = {
      id: `cart-${Date.now()}`,
      userId: String(userId),
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    carts.push(cart);
  }

  return cart;
};

const getCartItems = (userId) => {
  const cart = getCartByUserId(userId);

  return cart.items.map((item) => {
    const product = productModel.getProductById(
      item.productId
    );

    return {
      ...item,
      product,
      subtotal: product
        ? product.price * item.quantity
        : 0,
    };
  });
};

const addItemToCart = (
  userId,
  productId,
  quantity = 1
) => {
  const cart = getCartByUserId(userId);

  const product =
    productModel.getProductById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1
  ) {
    return {
      success: false,
      message: "Quantity must be at least 1.",
    };
  }

  const existingItem = cart.items.find(
    (item) => item.productId === String(productId)
  );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + parsedQuantity;

    if (newQuantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      };
    }

    existingItem.quantity = newQuantity;
  } else {
    if (parsedQuantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      };
    }

    cart.items.push({
      productId: String(productId),
      quantity: parsedQuantity,
    });
  }

  cart.updatedAt = new Date();

  return {
    success: true,
    cart,
  };
};

const updateCartItem = (
  userId,
  productId,
  quantity
) => {
  const cart = getCartByUserId(userId);

  const product =
    productModel.getProductById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1
  ) {
    return {
      success: false,
      message: "Quantity must be at least 1.",
    };
  }

  if (parsedQuantity > product.stock) {
    return {
      success: false,
      message: `Only ${product.stock} item(s) available.`,
    };
  }

  const cartItem = cart.items.find(
    (item) => item.productId === String(productId)
  );

  if (!cartItem) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  cartItem.quantity = parsedQuantity;
  cart.updatedAt = new Date();

  return {
    success: true,
    cart,
  };
};

const removeCartItem = (
  userId,
  productId
) => {
  const cart = getCartByUserId(userId);

  const itemIndex = cart.items.findIndex(
    (item) => item.productId === String(productId)
  );

  if (itemIndex === -1) {
    return {
      success: false,
      message: "Cart item not found.",
    };
  }

  cart.items.splice(itemIndex, 1);
  cart.updatedAt = new Date();

  return {
    success: true,
    cart,
  };
};

const clearCart = (userId) => {
  const cart = getCartByUserId(userId);

  cart.items = [];
  cart.updatedAt = new Date();

  return cart;
};

const getCartSummary = (userId) => {
  const items = getCartItems(userId);

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
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};
"use strict";

const productModel=require("../models/productModel");
const reviewModel=require("../models/reviewModel");
const cartModel=require("../models/cartModel");
const orderModel=require("../models/orderModel");
const giftcardModel=require("../models/giftcardModel");
const {validateCheckout}=require("../validators/cartValidators");

const EXPRESS_SHIPPING_FEE=12;

const getCurrentUser=(req,res)=>
  res.locals.currentUser||req.session?.user||null;

const getCurrentUserId=(req)=>req.cartUserId||null;

const wantsJson=(req)=>
  req.get("accept")?.includes("application/json");

const prepareCartView=(cart)=>{
  const items=cart.items.map((item)=>({
    productId:item.productId,
    itemType:item.itemType||"product",
    href:item.product.href||"/cart/products",
    name:item.product.name,
    image:item.product.image,
    maker:item.product.maker,
    material:item.product.material,
    variant:item.product.variant,
    price:item.product.price,
    priceFormatted:`$${item.product.price.toFixed(2)}`,
    oldPriceFormatted:item.product.oldPrice
      ?`$${item.product.oldPrice.toFixed(2)}`
      :null,
    quantity:item.quantity,
    stock:item.product.stock,
    subtotal:item.subtotal,
    subtotalFormatted:`$${item.subtotal.toFixed(2)}`,
    searchTitle:item.product.name.toLowerCase()
  }));

  return{
    items,
    hasItems:items.length>0,
    totalQuantity:cart.totalQuantity,
    subtotal:cart.subtotal,
    subtotalFormatted:`$${cart.subtotal.toFixed(2)}`,
    expressTotal:cart.subtotal+EXPRESS_SHIPPING_FEE,
    expressTotalFormatted:`$${(cart.subtotal+EXPRESS_SHIPPING_FEE).toFixed(2)}`
  };
};

const getProductsPage=async(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const cart=prepareCartView(cartModel.getCartSummary(userId));
    const statsMap=await reviewModel.getAllReviewStats();
    const productsPageData=productModel.getProductsPageData(req.query,statsMap);

    return res.render("cart/products",{
      ...productsPageData,
      activePage:"shop",
      currentUser:getCurrentUser(req,res),
      cartCount:cart.totalQuantity
    });
  }catch(error){
    return next(error);
  }
};

const getCartPage=async(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const cart=prepareCartView(cartModel.getCartSummary(userId));

    const excludedIds=cart.items
      .filter((item)=>item.itemType==="product")
      .map((item)=>item.productId);

    const statsMap=await reviewModel.getAllReviewStats();

    const recommendedProducts=productModel.getRecommendedProducts(
      excludedIds,
      4,
      statsMap
    );

    return res.render("cart/cart",{
      pageTitle:"Shopping Cart",
      activePage:"shop",
      currentUser:getCurrentUser(req,res),
      cartCount:cart.totalQuantity,
      cart,
      recommendedProducts
    });
  }catch(error){
    return next(error);
  }
};

const getCheckoutPage=(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const cart=prepareCartView(cartModel.getCartSummary(userId));

    if(!cart.hasItems)return res.redirect("/cart");

    return res.render("cart/checkout",{
      pageTitle:"Checkout",
      activePage:"shop",
      currentUser:getCurrentUser(req,res),
      cartCount:cart.totalQuantity,
      cart,
      errors:{},
      formData:{}
    });
  }catch(error){
    return next(error);
  }
};

const getOrderConfirmationPage=(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const orderId=String(req.query.orderId||"");
    const order=orderModel.getOrderById(orderId);

    if(!order||order.userId!==userId){
      return res.redirect("/cart");
    }

    return res.render("cart/order_confirmation",{
      pageTitle:"Order Confirmation",
      activePage:"shop",
      currentUser:getCurrentUser(req,res),
      cartCount:0,
      order
    });
  }catch(error){
    return next(error);
  }
};

const addToCart=(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const {productId,quantity=1}=req.body;

    const result=cartModel.addItemToCart(
      userId,
      productId,
      quantity
    );

    if(!result.success){
      if(wantsJson(req))return res.status(400).json(result);
      return res.status(400).send(result.message);
    }

    const cart=prepareCartView(cartModel.getCartSummary(userId));

    if(wantsJson(req)){
      return res.json({
        success:true,
        message:"Product added to cart.",
        cart
      });
    }

    return res.redirect("/cart");
  }catch(error){
    return next(error);
  }
};

const updateCartItem=(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const {productId,quantity}=req.body;

    const result=cartModel.updateCartItem(
      userId,
      productId,
      quantity
    );

    if(!result.success){
      if(wantsJson(req))return res.status(400).json(result);
      return res.status(400).send(result.message);
    }

    const cart=prepareCartView(cartModel.getCartSummary(userId));

    if(wantsJson(req)){
      return res.json({
        success:true,
        message:"Cart updated.",
        cart
      });
    }

    return res.redirect("/cart");
  }catch(error){
    return next(error);
  }
};

const removeCartItem=(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const {productId}=req.body;

    const result=cartModel.removeCartItem(
      userId,
      productId
    );

    if(!result.success){
      if(wantsJson(req))return res.status(400).json(result);
      return res.status(400).send(result.message);
    }

    const cart=prepareCartView(cartModel.getCartSummary(userId));

    if(wantsJson(req)){
      return res.json({
        success:true,
        message:"Product removed from cart.",
        cart
      });
    }

    return res.redirect("/cart");
  }catch(error){
    return next(error);
  }
};

const submitCheckout=async(req,res,next)=>{
  try{
    const userId=getCurrentUserId(req);
    const cart=prepareCartView(cartModel.getCartSummary(userId));

    if(!cart.hasItems)return res.redirect("/cart");

    const validation=validateCheckout(req.body);

    if(!validation.isValid){
      return res.status(400).render("cart/checkout",{
        pageTitle:"Checkout",
        activePage:"shop",
        currentUser:getCurrentUser(req,res),
        cartCount:cart.totalQuantity,
        cart,
        errors:validation.errors,
        formData:req.body
      });
    }

    const shippingFee=
      req.body.shipping==="express"
        ?EXPRESS_SHIPPING_FEE
        :0;

    const pendingGiftcards=cartModel.getPendingGiftcardDrafts(userId);

    const createdEntries=await Promise.all(
      pendingGiftcards.map(async(item)=>[
        item.productId,
        await giftcardModel.createGiftcard(item.values,userId)
      ])
    );

    const createdGiftcards=new Map(createdEntries);

    const orderItems=cart.items.map((item)=>{
      const giftcard=createdGiftcards.get(item.productId);

      if(!giftcard)return item;

      return{
        ...item,
        giftcardId:giftcard.id,
        giftcardCode:giftcard.code
      };
    });

    const order=orderModel.createOrder({
      userId,
      items:orderItems,
      delivery:{
        email:req.body.email.trim(),
        firstName:req.body.first_name.trim(),
        lastName:req.body.last_name.trim(),
        address1:req.body.address1.trim(),
        address2:String(req.body.address2||"").trim(),
        city:req.body.city.trim(),
        state:req.body.state.trim(),
        postalCode:req.body.postal_code.trim(),
        country:req.body.country,
        phone:req.body.phone.trim()
      },
      shipping:{
        method:req.body.shipping,
        fee:shippingFee
      },
      payment:{
        method:"card",
        cardName:req.body.card_name.trim(),
        cardLastFour:String(req.body.card_number)
          .replace(/\s/g,"")
          .slice(-4)
      },
      giftNote:String(req.body.gift_note||"").trim(),
      subtotal:cart.subtotal,
      total:cart.subtotal+shippingFee
    });

    cartModel.clearCart(userId);

    return res.redirect(
      `/cart/order-confirmation?orderId=${order.id}`
    );
  }catch(error){
    return next(error);
  }
};

module.exports={
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
  addToCart,
  updateCartItem,
  removeCartItem,
  submitCheckout
};
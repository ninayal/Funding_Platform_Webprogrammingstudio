"use strict";

const landingModel=require("../models/landingModel");
const productModel=require("../models/productModel");
const reviewModel=require("../models/reviewModel");
const cartModel=require("../models/cartModel");

const getHomePage=async(req,res,next)=>{
  try{
    const currentUser=res.locals.currentUser||req.session?.user||null;
    const userId=currentUser?.id?String(currentUser.id):"demo-user";
    const cart=cartModel.getCartSummary(userId);
    const statsMap=await reviewModel.getAllReviewStats();

    return res.render("home/index",{
      ...landingModel.getLandingPageData(),
      featuredProducts:productModel.getFeaturedProducts(6,statsMap),
      pageTitle:"Home",
      activePage:"home",
      currentUser,
      cartCount:cart.totalQuantity
    });
  }catch(error){
    return next(error);
  }
};

module.exports={getHomePage};
"use strict";

const express=require("express");
const giftcardController=require("../controllers/giftcardController");

const router=express.Router();

router.get("/",giftcardController.getGiftcardPage);
router.get("/giftcard",(req,res)=>res.redirect(301,"/giftcard"));
router.post("/review",giftcardController.reviewGiftcard);
router.post("/create",giftcardController.createGiftcard);

module.exports=router;
"use strict";

const mongoose=require("mongoose");

const reviewSchema=new mongoose.Schema({
  _id:{type:String},
  productId:{type:String,ref:"Products",required:true,index:true},
  userId:{type:String,ref:"Users",required:true,index:true},
  name:{type:String,trim:true,default:""},
  rating:{type:Number,required:true,min:1,max:5},
  title:{type:String,required:true,trim:true,minlength:4,maxlength:80},
  comment:{type:String,required:true,trim:true,minlength:10,maxlength:600},
  images:{
    type:[String],
    default:[],
    validate:{
      validator:images=>images.length>=1&&images.length<=3,
      message:"A review must contain between 1 and 3 images."
    }
  },
  dateAdded:{type:Date,default:Date.now}
},{collection:"reviews"});

reviewSchema.index({productId:1,dateAdded:-1});
reviewSchema.index({productId:1,rating:1});

module.exports=mongoose.models.Reviews||mongoose.model("Reviews",reviewSchema);
"use strict";

const mongoose=require("mongoose");
const {
  giftTypes,
  deliveryTypes,
  designs,
  causes,
  printFormats,
  paperSizes,
  downloadFormats
}=require("../../config/giftcardConfig");

const digitalSchema=new mongoose.Schema({
  recipientEmail:{type:String,trim:true,default:""}
},{_id:false});

const printableSchema=new mongoose.Schema({
  printFormat:{type:String,enum:printFormats,default:"Flat Card"},
  paperSize:{type:String,enum:paperSizes,default:"A4"},
  downloadFormat:{type:String,enum:downloadFormats,default:"PDF — Print Ready"}
},{_id:false});

const physicalSchema=new mongoose.Schema({
  recipientPhone:{type:String,trim:true,default:""},
  physicalDeliveryDate:{type:String,default:null},
  streetAddress:{type:String,trim:true,maxlength:120,default:""},
  district:{type:String,trim:true,maxlength:80,default:""},
  city:{type:String,trim:true,maxlength:80,default:""},
  postalCode:{type:String,trim:true,maxlength:20,default:""}
},{_id:false});

const giftCardSchema=new mongoose.Schema({
  _id:{type:String,required:true},
  code:{type:String,required:true,unique:true,index:true,trim:true,uppercase:true},
  createdByUserId:{type:String,ref:"Users",required:true,index:true},
  giftType:{
    type:String,
    enum:giftTypes.map(item=>item.value),
    required:true
  },
  deliveryType:{
    type:String,
    enum:deliveryTypes.map(item=>item.value),
    required:true
  },
  designType:{
    type:String,
    enum:designs.map(item=>item.value),
    required:true
  },
  quantity:{type:Number,required:true,min:1,max:20},
  amountPerCard:{type:Number,required:true,min:5,max:10000},
  totalAmount:{type:Number,required:true,min:0},
  recipientName:{type:String,required:true,trim:true,minlength:2,maxlength:60},
  senderName:{type:String,required:true,trim:true,minlength:2,maxlength:60},
  message:{type:String,required:true,trim:true,minlength:5,maxlength:280},
  causeCategory:{
    type:String,
    enum:causes.map(item=>item.value),
    default:null
  },
  causeNote:{type:String,trim:true,maxlength:180,default:""},
  digital:{type:digitalSchema,default:null},
  printable:{type:printableSchema,default:null},
  physical:{type:physicalSchema,default:null},
  status:{type:String,required:true,index:true}
},{
  timestamps:true,
  collection:"giftcards"
});

giftCardSchema.index({createdByUserId:1,createdAt:-1});

module.exports=mongoose.models.GiftCards||mongoose.model("GiftCards",giftCardSchema);
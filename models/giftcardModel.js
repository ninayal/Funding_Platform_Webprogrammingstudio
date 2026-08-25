"use strict";

const crypto=require("crypto");
const GiftCard=require("./schemas/GiftCard");
const {toStoredFields}=require("../utils/giftcardMapper");

const toRuntimeGiftcard=(giftcard)=>{
  const data=giftcard.toObject?giftcard.toObject():giftcard;

  return{
    ...data,
    id:String(data._id),
    _id:String(data._id),
    createdByUserId:data.createdByUserId?String(data.createdByUserId):null
  };
};

const generateCodeSegment=()=>
  crypto.randomBytes(2).toString("hex").toUpperCase();

const generateGiftCode=()=>
  `LANG-${generateCodeSegment()}-${generateCodeSegment()}`;

const getUniqueGiftCode=async()=>{
  let code;

  do{
    code=generateGiftCode();
  }while(await GiftCard.exists({code}));

  return code;
};

const createGiftcard=async(values,userId=null)=>{
  const giftcard=await GiftCard.create({
    _id:crypto.randomUUID(),
    code:await getUniqueGiftCode(),
    createdByUserId:userId?String(userId):null,
    ...toStoredFields(values),
    status:values.giftType==="lang-impact"?"Awaiting allocation":"Created"
  });

  return toRuntimeGiftcard(giftcard);
};

module.exports={createGiftcard};
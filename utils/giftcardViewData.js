"use strict";

const {
  giftTypes,
  deliveryTypes,
  designs,
  causes,
  printFormats,
  paperSizes,
  giftcardDefaults
}=require("../config/giftcardConfig");

const formatUsd=(value)=>
  new Intl.NumberFormat("en-US",{
    style:"currency",
    currency:"USD"
  }).format(Number(value)||0);

const findOption=(items,value)=>
  items.find((item)=>item.value===value)||items[0];

const getSelectionData=(values)=>{
  const quantity=Number(values.quantity)||1;
  const amountPerCard=Number(values.amountPerCard)||0;

  return{
    selectedGiftType:findOption(giftTypes,values.giftType),
    selectedDelivery:findOption(deliveryTypes,values.deliveryType),
    selectedDesign:findOption(designs,values.designType),
    amountPerCardDisplay:formatUsd(amountPerCard),
    totalDisplay:formatUsd(quantity*amountPerCard)
  };
};

const buildGiftcardPageData=(
  formValues={},
  {
    pageTitle="Làng & Co. — Impact Gifts",
    errors={},
    reviewMode=false,
    currentUser=null
  }={}
)=>{
  const defaults={...giftcardDefaults,...formValues};
  const isReviewMode=Boolean(reviewMode);

  return{
    pageTitle,
    activePage:"giftcard",
    giftTypes,
    deliveryTypes,
    designs,
    causes,
    printFormats,
    paperSizes,
    defaults,
    errors,
    form:{
      action:"/giftcard/review",
      submitLabel:currentUser?"Review Your Gift":"Sign In & Review"
    },
    ...getSelectionData(defaults),
    page:{
      isReviewMode,
      hasServerErrors:Object.keys(errors).length>0,
      showReview:isReviewMode,
      waveClass:"giftcard-wave"
    }
  };
};

module.exports={
  buildGiftcardPageData,
  formatUsd
};
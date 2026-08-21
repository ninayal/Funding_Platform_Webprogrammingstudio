const crypto=require("crypto");
const carts=require("../data/carts");
const productModel=require("./productModel");
const {
  giftTypes,
  deliveryTypes,
  designs
}=require("../config/giftcardConfig");

const GIFTCARD_ITEM_TYPE="giftcard";
const GIFTCARD_ID_PREFIX="giftcard-draft-";

const GIFT_CARD_DESIGN_COLORS={
  "ho-tay-lotus":["#A31D1D","#6D2323"],
  "bat-trang-blue":["#5A7CA0","#233A55"],
  "van-phuc-silk":["#D3AB7C","#81563C"],
  "ha-thai-lacquer":["#21140F","#6D2323"],
  "hoi-an-glow":["#C66B2B","#6D2323"],
  "phu-vinh-bamboo":["#7A8250","#34442D"]
};

const buildGiftcardThumbnail=(designType)=>{
  const [startColor,endColor]=
    GIFT_CARD_DESIGN_COLORS[designType]||
    GIFT_CARD_DESIGN_COLORS["ho-tay-lotus"];

  const svg=`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 132">
      <defs>
        <linearGradient id="giftcard-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
      </defs>
      <rect width="108" height="132" rx="10" fill="url(#giftcard-gradient)"/>
      <circle cx="88" cy="24" r="34" fill="rgba(254,249,225,.10)"/>
      <text x="12" y="26" fill="#FEF9E1" font-family="Georgia, serif" font-size="11" font-style="italic">Làng &amp; Co.</text>
      <text x="12" y="108" fill="#FEF9E1" font-family="Arial, sans-serif" font-size="7" font-weight="700" letter-spacing="1">IMPACT GIFT</text>
    </svg>
  `;

  return`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getOption=(items,value,fallback)=>{
  return items.find((item)=>item.value===value)||fallback;
};

const getCartByUserId=(userId)=>{
  const normalizedUserId=String(userId);
  let cart=carts.find((item)=>item.userId===normalizedUserId);
  if(!cart){
    cart={
      id:`cart-${Date.now()}`,
      userId:normalizedUserId,
      items:[],
      createdAt:new Date(),
      updatedAt:new Date()
    };
    carts.push(cart);
  }
  return cart;
};

const buildGiftcardCartItem=(item)=>{
  const draft=item.giftcardDraft||{};

  const quantity=Math.max(
    1,
    Number(draft.quantity)||Number(item.quantity)||1
  );

  const amountPerCard=
    Number(draft.amountPerCard)||0;

  const giftType=
    getOption(
      giftTypes,
      draft.giftType,
      giftTypes[0]
    );

  const delivery=
    getOption(
      deliveryTypes,
      draft.deliveryType,
      deliveryTypes[0]
    );

  const design=
    getOption(
      designs,
      draft.designType,
      designs[0]
    );

  const giftCode=
    draft.code || "Pending checkout";

  return{
    productId:item.productId,
    itemType:GIFTCARD_ITEM_TYPE,
    quantity,

    product:{
      id:item.productId,

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
        `${design?.title || "Gift Design"} | Code: ${giftCode}`,

      giftCode,

      price:
        amountPerCard,

      oldPrice:null,

      stock:
        quantity,

      href:
        `/giftcard?cartItem=${encodeURIComponent(item.productId)}#details`
    },

    subtotal:
      amountPerCard*quantity
  };
};

const getCartItems=(userId)=>{
  const cart=getCartByUserId(userId);
  return cart.items.map((item)=>{
    if(item.itemType===GIFTCARD_ITEM_TYPE){
      return buildGiftcardCartItem(item);
    }

    const product=productModel.getProductById(item.productId);
    if(!product)return null;

    return{
      productId:item.productId,
      itemType:"product",
      quantity:item.quantity,
      product,
      subtotal:product.price*item.quantity
    };
  }).filter(Boolean);
};

const validateQuantity=(quantity,stock)=>{
  const parsedQuantity=Number(quantity);
  if(!Number.isInteger(parsedQuantity)||parsedQuantity<1){
    return{
      success:false,
      message:"Quantity must be a whole number of at least 1."
    };
  }
  if(parsedQuantity>stock){
    return{
      success:false,
      message:`Only ${stock} item(s) available.`
    };
  }
  return{
    success:true,
    quantity:parsedQuantity
  };
};

const addItemToCart=(userId,productId,quantity=1)=>{
  const cart=getCartByUserId(userId);
  const product=productModel.getProductById(productId);
  if(!product){
    return{
      success:false,
      message:"Product not found."
    };
  }

  const validation=validateQuantity(quantity,product.stock);
  if(!validation.success)return validation;

  const existingItem=cart.items.find((item)=>item.productId===String(productId));
  if(existingItem){
    const newQuantity=existingItem.quantity+validation.quantity;
    if(newQuantity>product.stock){
      return{
        success:false,
        message:`Only ${product.stock} item(s) available.`
      };
    }
    existingItem.quantity=newQuantity;
  }else{
    cart.items.push({
      productId:String(productId),
      quantity:validation.quantity
    });
  }

  cart.updatedAt=new Date();
  return{
    success:true,
    cart
  };
};

const addGiftcardDraftToCart=(userId,values,cartItemId=null)=>{
  const cart=getCartByUserId(userId);
  const quantity=Number(values?.quantity);
  const amountPerCard=Number(values?.amountPerCard);

  if(!Number.isInteger(quantity)||quantity<1||!Number.isFinite(amountPerCard)||amountPerCard<=0){
    return{
      success:false,
      message:"Gift Card details are invalid."
    };
  }

  if(cartItemId){
    const existingItem=cart.items.find(
      (item)=>item.productId===String(cartItemId)&&item.itemType===GIFTCARD_ITEM_TYPE
    );

    if(!existingItem){
      return{
        success:false,
        message:"Gift Card cart item not found."
      };
    }

    existingItem.quantity=quantity;
    existingItem.giftcardDraft={...values};
    cart.updatedAt=new Date();

    return{
      success:true,
      cart,
      productId:existingItem.productId
    };
  }

  const productId=`${GIFTCARD_ID_PREFIX}${crypto.randomUUID()}`;
  cart.items.push({
    productId,
    itemType:GIFTCARD_ITEM_TYPE,
    quantity,
    giftcardDraft:{...values}
  });
  cart.updatedAt=new Date();

  return{
    success:true,
    cart,
    productId
  };
};

const getGiftcardDraftItem=(userId,productId)=>{
  const cart=getCartByUserId(userId);
  const item=cart.items.find(
    (cartItem)=>
      cartItem.productId===String(productId)&&
      cartItem.itemType===GIFTCARD_ITEM_TYPE
  );

  if(!item)return null;

  return{
    productId:item.productId,
    quantity:item.quantity,
    giftcardDraft:{...item.giftcardDraft}
  };
};

const getPendingGiftcardDrafts=(userId)=>{
  const cart=getCartByUserId(userId);
  return cart.items
    .filter((item)=>item.itemType===GIFTCARD_ITEM_TYPE)
    .map((item)=>({
      productId:item.productId,
      values:{...item.giftcardDraft}
    }));
};

const updateCartItem=(userId,productId,quantity)=>{
  const cart=getCartByUserId(userId);
  const cartItem=cart.items.find((item)=>item.productId===String(productId));

  if(!cartItem){
    return{
      success:false,
      message:"Cart item not found."
    };
  }

  if(cartItem.itemType===GIFTCARD_ITEM_TYPE){
    return{
      success:false,
      message:"Edit the Gift Card to change its quantity or details."
    };
  }

  const product=productModel.getProductById(productId);
  if(!product){
    return{
      success:false,
      message:"Product not found."
    };
  }

  const validation=validateQuantity(quantity,product.stock);
  if(!validation.success)return validation;

  cartItem.quantity=validation.quantity;
  cart.updatedAt=new Date();

  return{
    success:true,
    cart
  };
};

const removeCartItem=(userId,productId)=>{
  const cart=getCartByUserId(userId);
  const itemIndex=cart.items.findIndex((item)=>item.productId===String(productId));
  if(itemIndex===-1){
    return{
      success:false,
      message:"Cart item not found."
    };
  }

  cart.items.splice(itemIndex,1);
  cart.updatedAt=new Date();

  return{
    success:true,
    cart
  };
};

const clearCart=(userId)=>{
  const cart=getCartByUserId(userId);
  cart.items=[];
  cart.updatedAt=new Date();
  return cart;
};

const getCartSummary=(userId)=>{
  const items=getCartItems(userId);
  const totalQuantity=items.reduce((total,item)=>total+item.quantity,0);
  const subtotal=items.reduce((total,item)=>total+item.subtotal,0);

  return{
    items,
    totalQuantity,
    subtotal
  };
};

module.exports={
  getCartByUserId,
  getCartItems,
  addItemToCart,
  addGiftcardDraftToCart,
  getGiftcardDraftItem,
  getPendingGiftcardDrafts,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary
};
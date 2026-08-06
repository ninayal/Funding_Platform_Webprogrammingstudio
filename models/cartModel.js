const carts=require("../data/carts");
const productModel=require("./productModel");
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
const getCartItems=(userId)=>{
const cart=getCartByUserId(userId);
return cart.items.map((item)=>{
const product=productModel.getProductById(item.productId);
if(!product)return null;
return{
productId:item.productId,
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
const updateCartItem=(userId,productId,quantity)=>{
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
const cartItem=cart.items.find((item)=>item.productId===String(productId));
if(!cartItem){
return{
success:false,
message:"Cart item not found."
};
}
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
updateCartItem,
removeCartItem,
clearCart,
getCartSummary
};
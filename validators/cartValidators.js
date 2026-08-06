const EMAIL_PATTERN=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN=/^\+?[0-9][0-9\s().-]{6,19}$/;
const POSTAL_PATTERN=/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/;
const CARD_NUMBER_PATTERN=/^\d{16}$/;
const CARD_EXPIRY_PATTERN=/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/;
const CARD_CVV_PATTERN=/^\d{3,4}$/;

const isBlank=(value)=>!String(value||"").trim();

const isExpiredCard=(value)=>{
const match=String(value||"").trim().match(CARD_EXPIRY_PATTERN);

if(!match)return false;

const expiryMonth=Number(match[1]);
const expiryYear=2000+Number(match[2]);
const now=new Date();
const currentMonth=now.getMonth()+1;
const currentYear=now.getFullYear();

return(
expiryYear<currentYear||
(expiryYear===currentYear&&expiryMonth<currentMonth)
);
};

const validateCheckout=(values={})=>{
const errors={};

if(isBlank(values.email)){
errors.email="Email address is required.";
}else if(!EMAIL_PATTERN.test(values.email.trim())){
errors.email="Enter a valid email address.";
}

if(isBlank(values.first_name)){
errors.first_name="First name is required.";
}

if(isBlank(values.last_name)){
errors.last_name="Last name is required.";
}

if(isBlank(values.address1)){
errors.address1="Delivery address is required.";
}

if(isBlank(values.city)){
errors.city="City is required.";
}

if(isBlank(values.state)){
errors.state="State or province is required.";
}

if(isBlank(values.postal_code)){
errors.postal_code="Postal code is required.";
}else if(!POSTAL_PATTERN.test(values.postal_code.trim())){
errors.postal_code="Enter a valid postal code.";
}

if(isBlank(values.country)){
errors.country="Country is required.";
}

if(isBlank(values.phone)){
errors.phone="Phone number is required.";
}else if(!PHONE_PATTERN.test(values.phone.trim())){
errors.phone="Enter a valid phone number.";
}

if(isBlank(values.card_name)){
errors.card_name="Name on card is required.";
}

const cardNumber=String(values.card_number||"").replace(/\s/g,"");

if(!cardNumber){
errors.card_number="Card number is required.";
}else if(!CARD_NUMBER_PATTERN.test(cardNumber)){
errors.card_number="Enter a valid 16-digit card number.";
}

if(isBlank(values.card_expiry)){
errors.card_expiry="Expiry date is required.";
}else if(!CARD_EXPIRY_PATTERN.test(values.card_expiry.trim())){
errors.card_expiry="Enter the expiry date in MM / YY format.";
}else if(isExpiredCard(values.card_expiry)){
errors.card_expiry="The card expiry date must not be in the past.";
}

if(isBlank(values.card_cvv)){
errors.card_cvv="Security code is required.";
}else if(!CARD_CVV_PATTERN.test(values.card_cvv.trim())){
errors.card_cvv="Enter a valid 3 or 4-digit security code.";
}

if(!["standard","express"].includes(values.shipping)){
errors.shipping="Choose a shipping method.";
}

return{
isValid:Object.keys(errors).length===0,
errors
};
};

module.exports={validateCheckout};
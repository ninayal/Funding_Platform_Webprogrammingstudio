const express = require('express');
const router  = express.Router();
const { requireLogin } = require('../middleware/auth');
const { products, carts, orders } = require('../constants/data');

router.get('/products', (req, res) => {
  const { search, category, sort } = req.query;
  let list = [...products];
  if (search)   list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category) list = list.filter(p => p.category === category);
  if (sort==='price_asc')  list.sort((a,b)=>a.price-b.price);
  if (sort==='price_desc') list.sort((a,b)=>b.price-a.price);
  if (sort==='name')       list.sort((a,b)=>a.name.localeCompare(b.name));
  res.render('cart/products', { title: 'Browse Products', products: list, query: req.query });
});

router.get('/', requireLogin, (req, res) => {
  const cart  = carts[req.session.user.id] || { items: [] };
  const total = cart.items.reduce((s,i)=>s+i.price*i.qty, 0);
  res.render('cart/cart', { title: 'My Cart', cart, total: total.toFixed(2) });
});

router.post('/add/:productId', requireLogin, (req, res) => {
  const uid = req.session.user.id;
  const product = products.find(p=>p.id===+req.params.productId);
  if (!product) return res.redirect('/cart/products');
  if (!carts[uid]) carts[uid] = { userId: uid, items: [] };
  const existing = carts[uid].items.find(i=>i.productId===product.id);
  if (existing) existing.qty++;
  else carts[uid].items.push({ productId: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  res.redirect('/cart');
});

router.post('/update/:productId', requireLogin, (req, res) => {
  const uid  = req.session.user.id;
  const qty  = parseInt(req.body.qty);
  const item = carts[uid]?.items.find(i=>i.productId===+req.params.productId);
  if (item) { if(qty<1) carts[uid].items=carts[uid].items.filter(i=>i.productId!==item.productId); else item.qty=qty; }
  res.redirect('/cart');
});

router.post('/remove/:productId', requireLogin, (req, res) => {
  const uid = req.session.user.id;
  if (carts[uid]) carts[uid].items = carts[uid].items.filter(i=>i.productId!==+req.params.productId);
  res.redirect('/cart');
});

router.get('/checkout', requireLogin, (req, res) => {
  const cart = carts[req.session.user.id] || { items: [] };
  res.render('cart/checkout', { title: 'Checkout', cart, error: null });
});

router.post('/checkout', requireLogin, (req, res) => {
  const { first_name, address, card_number } = req.body;
  if (!first_name || !address || !card_number)
    return res.render('cart/checkout', { title: 'Checkout', cart: carts[req.session.user.id], error: 'Please fill all required fields.' });
  const order = { id: orders.length+1, userId: req.session.user.id, items: carts[req.session.user.id]?.items||[], delivery: req.body, createdAt: new Date() };
  orders.push(order);
  delete carts[req.session.user.id];
  res.render('cart/order_confirmation', { title: 'Order Confirmed', order });
});

module.exports = router;

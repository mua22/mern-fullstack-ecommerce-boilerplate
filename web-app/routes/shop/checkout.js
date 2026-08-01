const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { ensureAuthenticated } = require('../../middlewares/auth');

router.get('/', ensureAuthenticated, (req, res) => {
  const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  if (cartCookie.length === 0) {
    req.flash('error', 'Your cart is empty');
    return res.redirect('/cart');
  }

  res.render('shop/checkout', {
    title: 'Checkout'
  });
});

// Process checkout
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    if (cartCookie.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }

    const { address, city, zip } = req.body;
    let total = 0;
    const items = [];

    // Calculate total and prepare items
    for (const item of cartCookie) {
      const product = await Product.findById(item.productId);
      if (product) {
        items.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });
        total += product.price * item.quantity;
      }
    }

    const order = new Order({
      user: req.session.user._id,
      items,
      total,
      shippingInfo: { address, city, zip }
    });

    await order.save();

    // Clear cart cookie
    res.clearCookie('cart');

    req.flash('success', 'Order placed successfully!');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong during checkout.');
    res.redirect('/checkout');
  }
});

module.exports = router;

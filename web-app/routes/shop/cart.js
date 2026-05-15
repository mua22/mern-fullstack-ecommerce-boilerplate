const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");

// Get Cart
router.get("/", async (req, res) => {
  const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  // Populate cart with actual product details
  const cartItems = [];
  let total = 0;

  for (let item of cartCookie) {
    try {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          product,
          quantity: item.quantity,
        });
        total += product.price * item.quantity;
      }
    } catch (err) {
      console.error(err);
    }
  }

  res.render("shop/cart", {
    title: "Your Cart",
    cartItems,
    total,
  });
});

// Add to Cart
router.get("/add/:id", (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.query.quantity) || 1;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  const existingItemIndex = cart.findIndex(
    (item) => item.productId === productId,
  );
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.cookie("cart", JSON.stringify(cart), { maxAge: 900000, httpOnly: true });
  req.flash("success", "Item added to cart");
  res.redirect(req.get("Referrer") || "/shop");
});

// Remove from Cart
router.post("/remove/:id", (req, res) => {
  const productId = req.params.id;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  cart = cart.filter((item) => item.productId !== productId);

  res.cookie("cart", JSON.stringify(cart), { maxAge: 900000, httpOnly: true });
  req.flash("success", "Item removed from cart");
  res.redirect("/cart");
});

module.exports = router;

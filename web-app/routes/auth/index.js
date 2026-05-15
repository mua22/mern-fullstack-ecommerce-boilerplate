const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

// Login Page
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login" });
});

// Register Page
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register" });
});

// Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      req.flash("error", "Email already exists");
      return res.redirect("/auth/register");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    req.flash("success", "You are now registered and can log in");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Login Handle
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "That email is not registered");
      return res.redirect("/auth/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      req.flash("success", "You are logged in");
      res.redirect("/");
    } else {
      req.flash("error", "Password incorrect");
      res.redirect("/auth/login");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

// Auth middleware (reuse from auth.js)
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Create order (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No products in order" });
    }
    // Calculate total
    let total = 0;
    for (const item of products) {
      const prod = await Product.findById(item.product);
      if (!prod)
        return res.status(400).json({ error: "Invalid product in order" });
      total += prod.price * item.quantity;
    }
    const order = new Order({
      user: req.user.id,
      products,
      total,
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Order creation failed", details: err.message });
  }
});

// Get all orders for user (protected)
router.get("/", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate(
    "products.product",
  );
  res.json(orders);
});

// Get single order (protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("products.product");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Invalid order ID" });
  }
});

module.exports = router;

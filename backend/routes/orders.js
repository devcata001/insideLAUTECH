const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

// Auth middleware
function auth(req, res, next) {
  const header = req.headers["authorization"];
  const bearerToken = header && header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : null;
  const cookieToken = req.cookies?.shoponcampus_auth;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: "No authorization token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Create order (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { products } = req.body;

    // Input validation
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one product",
      });
    }

    // Validate product items
    for (const item of products) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({
          error: "Each product must have ID and quantity",
        });
      }

      if (typeof item.quantity !== "number" || item.quantity < 1) {
        return res.status(400).json({ error: "Invalid product quantity" });
      }

      // Verify product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          error: `Product not found: ${item.product}`,
        });
      }
    }

    // Calculate total based on current prices
    let total = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      const subtotal = product.price * item.quantity;
      total += subtotal;

      validatedProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price, // Store price at time of order
      });
    }

    // Limit order total for fraud prevention
    if (total > 1000000) {
      return res.status(400).json({
        error: "Order total exceeds maximum allowed",
      });
    }

    const order = new Order({
      user: req.user.id,
      products: validatedProducts,
      total,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get all orders for user (protected)
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order (protected - user can only view own orders)
router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id, // Ensure user can only access own orders
    }).populate("products.product");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;

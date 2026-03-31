const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "insidelautechadmin@gmail.com",
    pass: process.env.EMAIL_APP_PASSWORD || "yhbt iwwt gepp inrc",
  },
});

// Signup with email verification
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, verified: false });
    await user.save();
    // Generate verification token
    const verifyToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    // Send verification email
    const verifyUrl = `http://localhost:3000/pages/verify.html?token=${verifyToken}`;
    await transporter.sendMail({
      from: "InsideLAUTECH <insidelautechadmin@gmail.com>",
      to: email,
      subject: "Verify your InsideLAUTECH account",
      html: `<h2>Welcome, ${name}!</h2><p>Click the link below to verify your email and activate your account:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });
    res.status(201).json({
      message: "User created. Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(400).json({ error: "Signup failed", details: err.message });
  }
});

// Email verification route
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.verified = true;
    await user.save();
    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Verification failed", details: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );
    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// Auth middleware
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

// Example protected route
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;

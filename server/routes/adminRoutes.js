// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your database blueprints and security guard
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');
const auth = require('../middleware/authMiddleware');

// ==========================================================
// 1. ADMIN LOGIN ROUTE (POST /api/admin/login)
// ==========================================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Search for the admin by their username in MongoDB
    let admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid username or password' });
    }

    // Compare the incoming password with the securely hashed database password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid username or password' });
    }

    // Generate a secure JSON Web Token (JWT) valid for 24 hours
    const payload = { admin: { id: admin.id } };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }, 
      (err, token) => {
        if (err) throw err;
        // Return the token back to your React app
        res.json({ token }); 
      }
    );
  } catch (err) {
    console.error("Admin Login Error: ", err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// ==========================================================
// 2. REGISTER WORKER ROUTE (POST /api/admin/add-worker)
// ==========================================================
// The 'auth' middleware passed here checks for a valid admin token before running
router.post('/add-worker', auth, async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    // Prevent duplicate entries by validating the email address
    let worker = await Worker.findOne({ email });
    if (worker) {
      return res.status(400).json({ msg: 'A worker profile with this email already exists' });
    }

    // Initialize a worker profile with name, phone, email, and a blank password
    worker = new Worker({
      name,
      phone,
      email,
      password: "" // Left blank so they can define it on the worker app later
    });

    // Save the document cleanly to MongoDB Atlas
    await worker.save();
    
    res.json({ msg: 'Worker profile created successfully!', worker });
  } catch (err) {
    console.error("Add Worker Error: ", err.message);
    res.status(500).json({ msg: 'Database storage error: ' + err.message });
  }
});

// ==========================================================
// 3. GET ALL WORKERS ROUTE (GET /api/admin/workers)
// ==========================================================
router.get('/workers', auth, async (req, res) => {
  try {
    const workers = await Worker.find().sort({ _id: -1 });
    res.json(workers);
  } catch (err) {
    console.error("Get Workers Error: ", err.message);
    res.status(500).json({ msg: 'Database retrieval error: ' + err.message });
  }
});

// ==========================================================
// 4. DELETE WORKER ROUTE (DELETE /api/admin/worker/:id)
// ==========================================================
router.delete('/worker/:id', auth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ msg: 'Worker not found' });
    }
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Worker deleted successfully' });
  } catch (err) {
    console.error("Delete Worker Error: ", err.message);
    res.status(500).json({ msg: 'Database deletion error: ' + err.message });
  }
});

module.exports = router;

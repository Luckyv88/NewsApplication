const express = require('express');
const router = express.Router();
const User = require('../models/User');                 // ✅ Import User model
const { register, login } = require('../controllers/auth.controller'); 
const auth = require('../middleware/auth');            // optional JWT middleware

router.post('/signup', register);
router.post('/login', login);

// GET user by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE user by ID (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Admin 
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
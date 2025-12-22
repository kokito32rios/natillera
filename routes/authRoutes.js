const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas públicas
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/check-session', authController.checkSession);

module.exports = router;
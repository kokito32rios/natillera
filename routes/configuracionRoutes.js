const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', configuracionController.obtenerTodos);
router.get('/:clave', configuracionController.obtenerPorClave);
router.put('/:clave', isAdmin, configuracionController.actualizar);

module.exports = router;
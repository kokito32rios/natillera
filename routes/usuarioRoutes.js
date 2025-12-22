const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(isAuthenticated);

// Rutas de usuarios (solo admin)
router.get('/', isAdmin, usuarioController.obtenerTodos);
router.get('/:id', usuarioController.obtenerPorId);
router.post('/', isAdmin, usuarioController.crear);
router.put('/:id', isAdmin, usuarioController.actualizar);
router.delete('/:id', isAdmin, usuarioController.eliminar);

module.exports = router;
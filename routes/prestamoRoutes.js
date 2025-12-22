const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', prestamoController.obtenerTodos);
router.get('/:id', prestamoController.obtenerPorId);
router.post('/', isAdmin, prestamoController.crear);
router.put('/:id', isAdmin, prestamoController.actualizar);
router.delete('/:id', isAdmin, prestamoController.eliminar);

module.exports = router;
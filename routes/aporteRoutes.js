const express = require('express');
const router = express.Router();
const aporteController = require('../controllers/aporteController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', aporteController.obtenerTodos);
router.get('/:id', aporteController.obtenerPorId);
router.post('/', isAdmin, aporteController.crear);
router.put('/:id', isAdmin, aporteController.actualizar);
router.delete('/:id', isAdmin, aporteController.eliminar);

module.exports = router;
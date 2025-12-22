const express = require('express');
const router = express.Router();
const ahorroController = require('../controllers/ahorroController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', ahorroController.obtenerTodos);
router.get('/:id', ahorroController.obtenerPorId);
router.get('/usuario/:id_usuario', ahorroController.obtenerPorUsuario);

module.exports = router;
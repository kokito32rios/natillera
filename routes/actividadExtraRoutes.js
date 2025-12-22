const express = require('express');
const router = express.Router();
const actividadExtraController = require('../controllers/actividadExtraController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', actividadExtraController.obtenerTodos);
router.get('/:id', actividadExtraController.obtenerPorId);
router.post('/', isAdmin, actividadExtraController.crear);
router.put('/:id', isAdmin, actividadExtraController.actualizar);
router.delete('/:id', isAdmin, actividadExtraController.eliminar);

module.exports = router;
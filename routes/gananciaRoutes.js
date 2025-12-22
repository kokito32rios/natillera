const express = require('express');
const router = express.Router();
const gananciaController = require('../controllers/gananciaController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y ser admin
router.use(isAuthenticated);
router.use(isAdmin);

// Obtener todas las ganancias
router.get('/', gananciaController.obtenerTodas);

// Obtener ganancia por mes/año
router.get('/:mes/:anio', gananciaController.obtenerPorMes);

// Obtener distribución de una ganancia
router.get('/:id/distribucion', gananciaController.obtenerDistribucion);

// Obtener resumen de administradores
router.get('/resumen/administradores', gananciaController.obtenerResumenAdmins);

// Obtener ganancias de un admin específico
router.get('/admin/:id_admin', gananciaController.obtenerPorAdmin);

// Crear nueva ganancia
router.post('/', gananciaController.crear);

module.exports = router;
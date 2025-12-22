const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ============================================
// RUTAS
// ============================================

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const aporteRoutes = require('./routes/aporteRoutes');
const ahorroRoutes = require('./routes/ahorroRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const actividadExtraRoutes = require('./routes/actividadExtraRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const gananciaRoutes = require('./routes/gananciaRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aportes', aporteRoutes);
app.use('/api/ahorros', ahorroRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/actividades', actividadExtraRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/ganancias', gananciaRoutes);

// Ruta principal - Servir index.html desde views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// Error 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler general
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   🏦  NATILLERA DE AHORROS - SERVER     ║
    ╠═══════════════════════════════════════════╣
    ║   Servidor corriendo en:                  ║
    ║   http://localhost:${PORT}                   ║
    ║                                           ║
    ║   Ambiente: ${process.env.NODE_ENV || 'development'}              ║
    ╚═══════════════════════════════════════════╝
    `);
});
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { isAuthenticated, isAdmin, isCliente } = require('./middleware/auth');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const sessionSecret = process.env.SESSION_SECRET || 'change-this-session-secret-in-production';

if (!process.env.SESSION_SECRET) {
    console.warn('[SESSION WARNING] SESSION_SECRET no esta definido. Usa una variable segura en produccion.');
}

// ============================================
// MIDDLEWARES
// ============================================

// CORS
app.use(cors());
app.set('trust proxy', 1);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

async function obtenerNombreNatillera() {
    try {
        const [config] = await db.query(
            'SELECT valor FROM configuracion WHERE clave = ? LIMIT 1',
            ['nombre_natillera']
        );

        return config[0]?.valor || 'Mi Natillera';
    } catch (error) {
        console.error('[BRANDING ERROR] No se pudo cargar nombre_natillera:', error.message);
        return 'Mi Natillera';
    }
}

app.get('/api/public/config/nombre-natillera', async (req, res) => {
    const nombre = await obtenerNombreNatillera();
    res.json({ valor: nombre });
});

app.get('/manifest.webmanifest', async (req, res) => {
    const nombre = await obtenerNombreNatillera();

    res.type('application/manifest+json');
    res.send({
        name: nombre,
        short_name: nombre,
        description: `Sistema de gestion para ${nombre}.`,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f4efe6',
        theme_color: '#1e6f5c',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any maskable'
            },
            {
                src: '/icons/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
            }
        ]
    });
});
// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

// Ruta principal - Servir index.html desde public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin/dashboard.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/usuarios.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'usuarios.html'));
});

app.get('/admin/aportes.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'aportes.html'));
});

app.get('/admin/prestamos.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'prestamos.html'));
});

app.get('/admin/configuracion.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'configuracion.html'));
});

app.get('/admin/actividades.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'actividades.html'));
});

app.get('/admin/ganancias.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'ganancias.html'));
});

app.get('/cliente/dashboard.html', isAuthenticated, isCliente, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cliente', 'dashboard.html'));
});

app.get('/cliente/mis-ahorros.html', isAuthenticated, isCliente, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cliente', 'mis-ahorros.html'));
});

app.get('/cliente/mis-prestamos.html', isAuthenticated, isCliente, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cliente', 'mis-prestamos.html'));
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
    ║     NATILLERA DE AHORROS - SERVER     ║
    ╠═══════════════════════════════════════════╣
    ║   Servidor corriendo en:                  ║
    ║   ${publicUrl}                   ║
    ║                                           ║
    ║   Ambiente: ${process.env.NODE_ENV || 'development'}              ║
    ╚═══════════════════════════════════════════╝
    `);
});






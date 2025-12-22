// Verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
};

// Verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
};

// Verificar si el usuario es cliente
const isCliente = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'cliente') {
        return next();
    }
    return res.status(403).json({ error: 'Acceso denegado. Solo clientes.' });
};

// Verificar si el usuario puede acceder a sus propios datos o es admin
const isOwnerOrAdmin = (req, res, next) => {
    const userId = parseInt(req.params.id);
    const sessionUserId = req.session.usuario.id_usuario;
    const isUserAdmin = req.session.usuario.rol === 'admin';

    if (isUserAdmin || userId === sessionUserId) {
        return next();
    }
    return res.status(403).json({ error: 'No tienes permiso para acceder a estos datos.' });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isCliente,
    isOwnerOrAdmin
};
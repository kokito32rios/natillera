const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario por email
        const [usuarios] = await db.query(
            `SELECT u.*, r.nombre_rol as rol 
             FROM usuarios u 
             INNER JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.email = ?`,
            [email]
        );

        // Usuario no existe
        if (usuarios.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                tipo: 'usuario_no_existe',
                mensaje: 'No existe una cuenta con este correo electrónico.'
            });
        }

        const usuario = usuarios[0];

        // Usuario inactivo
        if (usuario.activo === 0) {
            return res.status(403).json({ 
                error: 'Cuenta desactivada',
                tipo: 'cuenta_inactiva',
                mensaje: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
            });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ 
                error: 'Contraseña incorrecta',
                tipo: 'password_invalido',
                mensaje: 'La contraseña ingresada es incorrecta.'
            });
        }

        // Crear sesión
        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol
        };

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    });
};

// Verificar sesión
exports.checkSession = (req, res) => {
    if (req.session && req.session.usuario) {
        res.json({
            authenticated: true,
            usuario: req.session.usuario
        });
    } else {
        res.json({
            authenticated: false
        });
    }
};
const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.obtenerTodos = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            `SELECT u.*, 
                    r.nombre_rol as rol,
                    CONCAT(a.nombre, ' ', a.apellido) as administrador
             FROM usuarios u 
             INNER JOIN roles r ON u.id_rol = r.id_rol 
             LEFT JOIN usuarios a ON u.id_administrador = a.id_usuario
             WHERE u.activo = 1`
        );
        res.json(usuarios);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            `SELECT u.*, r.nombre_rol as rol 
             FROM usuarios u 
             INNER JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.id_usuario = ?`,
            [req.params.id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(usuarios[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, apellido, email, password, id_rol, telefono, direccion, id_administrador } = req.body;
        
        // Verificar si el email ya existe
        const [existente] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, telefono, direccion, id_administrador) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, email, hashedPassword, id_rol, telefono, direccion, id_administrador || null]
        );
        
        // Si es cliente, crear su registro de ahorro
        if (id_rol === 2) {
            await db.query(
                'INSERT INTO ahorros (id_usuario, saldo_actual) VALUES (?, 0.00)',
                [result.insertId]
            );
        }
        
        res.status(201).json({ 
            success: true, 
            id_usuario: result.insertId 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, direccion } = req.body;
        
        await db.query(
            `UPDATE usuarios 
             SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? 
             WHERE id_usuario = ?`,
            [nombre, apellido, email, telefono, direccion, req.params.id]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

exports.eliminar = async (req, res) => {
    try {
        await db.query('UPDATE usuarios SET activo = 0 WHERE id_usuario = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
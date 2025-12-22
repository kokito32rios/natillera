const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [ahorros] = await db.query('SELECT * FROM ahorros');
        res.json(ahorros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ahorros' });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const [ahorros] = await db.query('SELECT * FROM ahorros WHERE id_ahorro = ?', [req.params.id]);
        res.json(ahorros[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ahorro' });
    }
};

exports.obtenerPorUsuario = async (req, res) => {
    try {
        const [ahorros] = await db.query('SELECT * FROM ahorros WHERE id_usuario = ?', [req.params.id_usuario]);
        res.json(ahorros[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ahorro' });
    }
};
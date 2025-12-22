const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [prestamos] = await db.query('SELECT * FROM prestamos');
        res.json(prestamos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener préstamos' });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const [prestamos] = await db.query('SELECT * FROM prestamos WHERE id_prestamo = ?', [req.params.id]);
        res.json(prestamos[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener préstamo' });
    }
};

exports.crear = async (req, res) => {
    res.json({ message: 'Crear préstamo - En desarrollo' });
};

exports.actualizar = async (req, res) => {
    res.json({ message: 'Actualizar préstamo - En desarrollo' });
};

exports.eliminar = async (req, res) => {
    res.json({ message: 'Eliminar préstamo - En desarrollo' });
};
const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [aportes] = await db.query('SELECT * FROM aportes');
        res.json(aportes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener aportes' });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const [aportes] = await db.query('SELECT * FROM aportes WHERE id_aporte = ?', [req.params.id]);
        res.json(aportes[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener aporte' });
    }
};

exports.crear = async (req, res) => {
    res.json({ message: 'Crear aporte - En desarrollo' });
};

exports.actualizar = async (req, res) => {
    res.json({ message: 'Actualizar aporte - En desarrollo' });
};

exports.eliminar = async (req, res) => {
    res.json({ message: 'Eliminar aporte - En desarrollo' });
};
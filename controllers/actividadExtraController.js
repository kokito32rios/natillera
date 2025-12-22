const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [actividades] = await db.query('SELECT * FROM actividades_extras');
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener actividades' });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const [actividades] = await db.query('SELECT * FROM actividades_extras WHERE id_actividad_extra = ?', [req.params.id]);
        res.json(actividades[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener actividad' });
    }
};

exports.crear = async (req, res) => {
    res.json({ message: 'Crear actividad - En desarrollo' });
};

exports.actualizar = async (req, res) => {
    res.json({ message: 'Actualizar actividad - En desarrollo' });
};

exports.eliminar = async (req, res) => {
    res.json({ message: 'Eliminar actividad - En desarrollo' });
};
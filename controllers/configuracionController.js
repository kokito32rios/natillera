const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [config] = await db.query('SELECT * FROM configuracion');
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

exports.obtenerPorClave = async (req, res) => {
    try {
        const [config] = await db.query('SELECT * FROM configuracion WHERE clave = ?', [req.params.clave]);
        res.json(config[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const { valor } = req.body;
        await db.query('UPDATE configuracion SET valor = ? WHERE clave = ?', [valor, req.params.clave]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
};
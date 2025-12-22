const db = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const [config] = await db.query('SELECT * FROM configuracion ORDER BY id');
        res.json(config);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

exports.obtenerPorClave = async (req, res) => {
    try {
        const [config] = await db.query('SELECT * FROM configuracion WHERE clave = ?', [req.params.clave]);
        res.json(config[0] || {});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

exports.actualizar = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { valor } = req.body;
        const { clave } = req.params;
        const idUsuario = req.session.usuario.id_usuario;
        
        // Obtener valor anterior
        const [configAnterior] = await connection.query(
            'SELECT valor FROM configuracion WHERE clave = ?',
            [clave]
        );
        
        if (configAnterior.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        
        const valorAnterior = configAnterior[0].valor;
        
        // Actualizar configuración
        await connection.query(
            'UPDATE configuracion SET valor = ? WHERE clave = ?',
            [valor, clave]
        );
        
        // Guardar en historial
        await connection.query(
            `INSERT INTO historial_configuracion (clave, valor_anterior, valor_nuevo, id_usuario_modifico)
             VALUES (?, ?, ?, ?)`,
            [clave, valorAnterior, valor, idUsuario]
        );
        
        await connection.commit();
        res.json({ success: true });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    } finally {
        connection.release();
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const [historial] = await db.query(`
            SELECT h.*,
                   c.descripcion,
                   CONCAT(u.nombre, ' ', u.apellido) as modificado_por
            FROM historial_configuracion h
            INNER JOIN configuracion c ON h.clave = c.clave
            INNER JOIN usuarios u ON h.id_usuario_modifico = u.id_usuario
            ORDER BY h.fecha DESC
            LIMIT 20
        `);
        res.json(historial);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};
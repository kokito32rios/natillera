const db = require('../config/database');

// Obtener todas las ganancias mensuales
exports.obtenerTodas = async (req, res) => {
    try {
        const [ganancias] = await db.query(`
            SELECT g.*, 
                   CONCAT(u.nombre, ' ', u.apellido) as registrado_por,
                   (SELECT COUNT(*) FROM usuarios WHERE id_rol = 1 AND activo = 1) as total_admins,
                   (g.monto_total / (SELECT COUNT(*) FROM usuarios WHERE id_rol = 1 AND activo = 1)) as monto_por_admin
            FROM ganancias_mensuales g
            INNER JOIN usuarios u ON g.id_usuario_registro = u.id_usuario
            ORDER BY g.anio DESC, g.mes DESC
        `);
        res.json(ganancias);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener ganancias' });
    }
};

// Obtener ganancia por mes y año
exports.obtenerPorMes = async (req, res) => {
    try {
        const { mes, anio } = req.params;
        const [ganancias] = await db.query(`
            SELECT * FROM vista_ganancias_detalle
            WHERE mes = ? AND anio = ?
        `, [mes, anio]);
        
        if (ganancias.length === 0) {
            return res.status(404).json({ error: 'No hay ganancia registrada para este mes' });
        }
        
        res.json(ganancias[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener ganancia' });
    }
};

// Obtener distribución de una ganancia específica
exports.obtenerDistribucion = async (req, res) => {
    try {
        const { id } = req.params;
        const [distribucion] = await db.query(`
            SELECT d.*, 
                   CONCAT(u.nombre, ' ', u.apellido) as administrador,
                   (SELECT COUNT(*) FROM usuarios WHERE id_administrador = d.id_administrador AND activo = 1) as clientes_asignados
            FROM distribucion_ganancias d
            INNER JOIN usuarios u ON d.id_administrador = u.id_usuario
            WHERE d.id_ganancia = ?
        `, [id]);
        
        res.json(distribucion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener distribución' });
    }
};

// Crear nueva ganancia mensual
exports.crear = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { mes, anio, monto_total, descripcion } = req.body;
        const id_usuario_registro = req.session.usuario.id_usuario;
        
        // Verificar si ya existe ganancia para ese mes
        const [existe] = await connection.query(
            'SELECT id_ganancia FROM ganancias_mensuales WHERE mes = ? AND anio = ?',
            [mes, anio]
        );
        
        if (existe.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Ya existe una ganancia registrada para este mes' });
        }
        
        // Insertar ganancia
        const [resultGanancia] = await connection.query(
            `INSERT INTO ganancias_mensuales (mes, anio, monto_total, descripcion, id_usuario_registro)
             VALUES (?, ?, ?, ?, ?)`,
            [mes, anio, monto_total, descripcion, id_usuario_registro]
        );
        
        const id_ganancia = resultGanancia.insertId;
        
        // Obtener todos los administradores activos
        const [admins] = await connection.query(
            'SELECT id_usuario FROM usuarios WHERE id_rol = 1 AND activo = 1'
        );
        
        const totalAdmins = admins.length;
        const montoPorAdmin = monto_total / totalAdmins;
        
        // Crear distribución para cada admin
        for (const admin of admins) {
            await connection.query(
                `INSERT INTO distribucion_ganancias (id_ganancia, id_administrador, monto_asignado)
                 VALUES (?, ?, ?)`,
                [id_ganancia, admin.id_usuario, montoPorAdmin]
            );
        }
        
        await connection.commit();
        
        res.status(201).json({ 
            success: true,
            id_ganancia,
            monto_por_admin: montoPorAdmin,
            total_admins: totalAdmins
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear ganancia' });
    } finally {
        connection.release();
    }
};

// Obtener resumen de administradores
exports.obtenerResumenAdmins = async (req, res) => {
    try {
        const [resumen] = await db.query('SELECT * FROM vista_resumen_administradores');
        res.json(resumen);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
};

// Obtener ganancias de un administrador específico
exports.obtenerPorAdmin = async (req, res) => {
    try {
        const { id_admin } = req.params;
        const [ganancias] = await db.query(`
            SELECT d.*, g.mes, g.anio, g.monto_total, g.descripcion
            FROM distribucion_ganancias d
            INNER JOIN ganancias_mensuales g ON d.id_ganancia = g.id_ganancia
            WHERE d.id_administrador = ?
            ORDER BY g.anio DESC, g.mes DESC
        `, [id_admin]);
        
        res.json(ganancias);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener ganancias del administrador' });
    }
};
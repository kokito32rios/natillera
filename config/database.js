const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir a promesas
const promisePool = pool.promise();

// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('[DB ERROR] Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('[DB OK] Conexion exitosa a MySQL');
    connection.release();
});

module.exports = promisePool;

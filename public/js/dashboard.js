// ========================================
// DASHBOARD ADMIN - FUNCIONALIDAD
// ========================================

let usuarioActual = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    await verificarSesion();
    if (usuarioActual && esVistaDashboardAdmin()) {
        cargarDatosDashboard();
    }
});

// ========================================
// VERIFICAR SESIÓN
// ========================================
async function verificarSesion() {
    try {
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = '/login.html';
            return;
        }

        if (data.usuario.rol !== 'admin') {
            window.location.href = '/cliente/dashboard.html';
            return;
        }

        usuarioActual = data.usuario;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent =
                `${usuarioActual.nombre} ${usuarioActual.apellido}`;
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = '/login.html';
    }
}

// ========================================
// CARGAR DATOS DEL DASHBOARD
// ========================================
async function cargarDatosDashboard() {
    await Promise.all([
        cargarEstadisticas(),
        // cargarResumen(), // Comentado temporalmente
        cargarAportesRecientes(),
        cargarActividadesProximas()
    ]);
}

// ========================================
// CARGAR ESTADÍSTICAS
// ========================================
async function cargarEstadisticas() {
    try {
        const responseClientes = await fetch('/api/usuarios');
        const usuarios = await responseClientes.json();
        const clientes = usuarios.filter((u) => u.id_rol === 2);
        document.getElementById('totalClientes').textContent = clientes.length;

        const responseAhorros = await fetch('/api/ahorros');
        const ahorros = await responseAhorros.json();
        const totalAhorrado = ahorros.reduce(
            (sum, ahorro) => sum + parseFloat(ahorro.saldo_actual || 0),
            0
        );
        document.getElementById('totalAhorrado').textContent =
            formatCurrency(totalAhorrado);

        const responsePrestamos = await fetch('/api/prestamos');
        const prestamos = await responsePrestamos.json();
        const prestamosActivos = prestamos.filter(
            (prestamo) =>
                prestamo.estado === 'activo' || prestamo.estado === 'moroso'
        );
        document.getElementById('prestamosActivos').textContent =
            prestamosActivos.length;

        document.getElementById('gananciasMes').textContent = '$0';
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ========================================
// CARGAR RESUMEN DE ADMINISTRADORES
// ========================================
async function cargarResumen() {
    document.getElementById('tablaAdministradores').innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                Funcionalidad en desarrollo
            </td>
        </tr>
    `;
}

// ========================================
// CARGAR APORTES RECIENTES
// ========================================
async function cargarAportesRecientes() {
    try {
        const response = await fetch('/api/aportes');
        const aportes = await response.json();

        const aportesRecientes = aportes
            .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
            .slice(0, 5);

        const container = document.getElementById('aportesRecientes');

        if (aportesRecientes.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-inbox"></i>
                    <p>No hay aportes registrados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = aportesRecientes
            .map(
                (aporte) => `
                    <div class="activity-item">
                        <div class="activity-icon" style="background: var(--success-color);">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="activity-info">
                            <h4>${formatCurrency(aporte.monto_aportado)}</h4>
                            <p>${formatDate(aporte.fecha_pago)}</p>
                        </div>
                    </div>
                `
            )
            .join('');
    } catch (error) {
        console.error('Error cargando aportes:', error);
    }
}

// ========================================
// CARGAR ACTIVIDADES PRÓXIMAS
// ========================================
async function cargarActividadesProximas() {
    try {
        const response = await fetch('/api/actividades');
        const actividades = await response.json();

        const hoy = new Date();
        const actividadesProximas = actividades
            .filter((actividad) =>
                actividad.estado === 'planeada' && new Date(actividad.fecha) >= hoy
            )
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 5);

        const container = document.getElementById('actividadesProximas');

        if (actividadesProximas.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No hay actividades próximas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = actividadesProximas
            .map(
                (actividad) => `
                    <div class="activity-item">
                        <div class="activity-icon" style="background: var(--info-color);">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="activity-info">
                            <h4>${actividad.nombre}</h4>
                            <p>${formatDate(actividad.fecha)} - ${actividad.tipo}</p>
                        </div>
                    </div>
                `
            )
            .join('');
    } catch (error) {
        console.error('Error cargando actividades:', error);
    }
}

// ========================================
// VER DETALLE DE ADMINISTRADOR
// ========================================
function verDetalleAdmin(idAdmin) {
    window.location.href = `/admin/usuarios.html?admin=${idAdmin}`;
}

// ========================================
// TOGGLE SIDEBAR
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// ========================================
// FUNCIONES DEL MODAL
// ========================================
function mostrarModal(titulo, mensaje, icono, onConfirm) {
    const modal = document.getElementById('modalConfirm');
    if (!modal) {
        const confirmado = window.confirm(mensaje);
        if (confirmado && onConfirm) {
            onConfirm();
        }
        return;
    }

    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = modal.querySelector('.modal-icon');
    const btnConfirmar = document.getElementById('btnConfirmar');

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensaje;
    modalIcon.className = `${icono} modal-icon`;

    const newBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(newBtn, btnConfirmar);

    document.getElementById('btnConfirmar').addEventListener('click', () => {
        cerrarModal();
        if (onConfirm) {
            onConfirm();
        }
    });

    modal.style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modalConfirm');
    if (!modal) {
        return;
    }
    modal.style.display = 'none';
}

// ========================================
// CERRAR SESIÓN
// ========================================
function cerrarSesion() {
    mostrarModal(
        'Cerrar sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        'fas fa-sign-out-alt',
        async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión. Intenta nuevamente.');
            }
        }
    );
}

// Cerrar modal con ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        cerrarModal();
    }
});

// ========================================
// UTILIDADES
// ========================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function esVistaDashboardAdmin() {
    return Boolean(
        document.getElementById('totalClientes') &&
        document.getElementById('aportesRecientes') &&
        document.getElementById('actividadesProximas')
    );
}

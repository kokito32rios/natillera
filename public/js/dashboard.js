// ========================================
// DASHBOARD ADMIN - FUNCIONALIDAD
// ========================================

let usuarioActual = null;
const SIDEBAR_STATE_KEY = 'admin-sidebar-collapsed';

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    inicializarSidebar();
    inicializarScrollHorizontalTablas();
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
    const table = document.getElementById('tablaAdministradores');
    if (!table) {
        return;
    }

    table.innerHTML = `
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
        const container = document.getElementById('aportesRecientes');

        if (!container) {
            return;
        }

        const aportesRecientes = aportes
            .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
            .slice(0, 5);

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
        const container = document.getElementById('actividadesProximas');

        if (!container) {
            return;
        }

        const hoy = new Date();
        const actividadesProximas = actividades
            .filter(
                (actividad) =>
                    actividad.estado === 'planeada' &&
                    new Date(actividad.fecha) >= hoy
            )
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 5);

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
// SIDEBAR
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        return;
    }

    if (esVistaEscritorio()) {
        const estaColapsado = document.body.classList.toggle('sidebar-collapsed');
        guardarEstadoSidebar(estaColapsado);
        actualizarControlesSidebar();
        return;
    }

    const abierto = sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open', abierto);
    actualizarControlesSidebar();
}

function inicializarSidebar() {
    asegurarBotonFlotanteSidebar();
    aplicarEstadoSidebar();
    asignarTitulosSidebar();
    actualizarControlesSidebar();

    window.addEventListener('resize', aplicarEstadoSidebar);

    document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', () => {
            if (!esVistaEscritorio()) {
                document.getElementById('sidebar')?.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                actualizarControlesSidebar();
            }
        });
    });
}

function asegurarBotonFlotanteSidebar() {
    if (document.querySelector('.sidebar-fab-toggle')) {
        return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sidebar-fab-toggle';
    button.innerHTML = '<i class="fas fa-bars"></i>';
    button.addEventListener('click', toggleSidebar);
    document.body.appendChild(button);
}

function aplicarEstadoSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        return;
    }

    if (esVistaEscritorio()) {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        document.body.classList.toggle(
            'sidebar-collapsed',
            obtenerEstadoSidebarGuardado()
        );
    } else {
        document.body.classList.remove('sidebar-collapsed');
        document.body.classList.remove('sidebar-open');
        sidebar.classList.remove('active');
    }

    actualizarControlesSidebar();
}

function actualizarControlesSidebar() {
    const sidebar = document.getElementById('sidebar');
    const esEscritorio = esVistaEscritorio();
    const estaColapsado =
        esEscritorio && document.body.classList.contains('sidebar-collapsed');
    const estaAbiertoMobile = !esEscritorio && sidebar?.classList.contains('active');

    document.querySelectorAll('.sidebar-fab-toggle').forEach((button) => {
        const icon = button.querySelector('i');
        const etiqueta = esEscritorio
            ? (estaColapsado ? 'Expandir menú' : 'Contraer menú')
            : (estaAbiertoMobile ? 'Cerrar menú' : 'Abrir menú');

        button.setAttribute('aria-label', etiqueta);
        button.setAttribute('title', etiqueta);

        if (icon) {
            icon.className = esEscritorio
                ? (estaColapsado ? 'fas fa-angles-right' : 'fas fa-angles-left')
                : (estaAbiertoMobile ? 'fas fa-times' : 'fas fa-bars');
        }
    });

    document.querySelectorAll('.sidebar-toggle').forEach((button) => {
        const icon = button.querySelector('i');
        const etiqueta = esEscritorio
            ? (estaColapsado ? 'Expandir menú' : 'Contraer menú')
            : 'Cerrar menú';

        button.setAttribute('aria-label', etiqueta);
        button.setAttribute('title', etiqueta);

        if (icon) {
            icon.className = esEscritorio
                ? (estaColapsado ? 'fas fa-angles-right' : 'fas fa-angles-left')
                : 'fas fa-times';
        }
    });
}

function asignarTitulosSidebar() {
    document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        const label = item.querySelector('span')?.textContent?.trim();
        if (label) {
            item.setAttribute('title', label);
        }
    });

    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.setAttribute('title', 'Cerrar sesión');
    }
}

function guardarEstadoSidebar(colapsado) {
    try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(colapsado));
    } catch (error) {
        console.warn('No se pudo guardar el estado del menú lateral:', error);
    }
}

function obtenerEstadoSidebarGuardado() {
    try {
        return localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
    } catch (error) {
        console.warn('No se pudo leer el estado del menú lateral:', error);
        return false;
    }
}

function esVistaEscritorio() {
    return window.innerWidth > 768;
}

function inicializarScrollHorizontalTablas() {
    aplicarMejorasScrollTablas();
    window.addEventListener('resize', aplicarMejorasScrollTablas);
    document.addEventListener('tablas:actualizar', aplicarMejorasScrollTablas);
}

function aplicarMejorasScrollTablas() {
    document.querySelectorAll('.table-responsive').forEach((container) => {
        container.classList.toggle(
            'has-scroll',
            container.scrollWidth > container.clientWidth
        );

        if (container.dataset.scrollEnhanced === 'true') {
            return;
        }

        let startX = 0;
        let startScrollLeft = 0;
        let dragging = false;

        const getClientX = (event) =>
            event.touches?.[0]?.clientX ?? event.clientX ?? 0;

        const startDrag = (event) => {
            dragging = true;
            startX = getClientX(event);
            startScrollLeft = container.scrollLeft;
            container.classList.add('is-dragging');
        };

        const moveDrag = (event) => {
            if (!dragging) {
                return;
            }

            const currentX = getClientX(event);
            container.scrollLeft = startScrollLeft - (currentX - startX);
        };

        const endDrag = () => {
            dragging = false;
            container.classList.remove('is-dragging');
        };

        container.addEventListener('touchstart', startDrag, { passive: true });
        container.addEventListener('touchmove', moveDrag, { passive: true });
        container.addEventListener('touchend', endDrag);
        container.addEventListener('mousedown', startDrag);
        container.addEventListener('mousemove', moveDrag);
        container.addEventListener('mouseleave', endDrag);
        container.addEventListener('mouseup', endDrag);

        container.dataset.scrollEnhanced = 'true';
    });
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

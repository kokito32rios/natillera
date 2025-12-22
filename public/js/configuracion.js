// ========================================
// GESTIÓN DE CONFIGURACIÓN
// ========================================

let configuraciones = [];

// Categorías de configuración
const categorias = {
    tasas: ['tasa_interes_prestamo', 'tasa_mora', 'tasa_interes_aporte'],
    limites: ['monto_minimo_prestamo', 'monto_maximo_prestamo', 'cuotas_minimas', 'cuotas_maximas'],
    general: ['nombre_natillera', 'moneda']
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    await cargarConfiguraciones();
    await cargarHistorial();
    
    // Event listener para el formulario
    document.getElementById('formConfig').addEventListener('submit', guardarConfiguracion);
});

// ========================================
// CARGAR CONFIGURACIONES
// ========================================
async function cargarConfiguraciones() {
    try {
        const response = await fetch('/api/configuracion');
        configuraciones = await response.json();
        
        mostrarConfiguraciones();
    } catch (error) {
        console.error('Error cargando configuraciones:', error);
        mostrarToast('error', 'Error', 'Error al cargar configuraciones');
    }
}

// ========================================
// MOSTRAR CONFIGURACIONES
// ========================================
function mostrarConfiguraciones() {
    // Tasas de interés
    const configTasas = configuraciones.filter(c => categorias.tasas.includes(c.clave));
    document.getElementById('configTasas').innerHTML = configTasas.map(config => 
        crearItemConfig(config)
    ).join('');
    
    // Límites de préstamos
    const configLimites = configuraciones.filter(c => categorias.limites.includes(c.clave));
    document.getElementById('configLimites').innerHTML = configLimites.map(config => 
        crearItemConfig(config)
    ).join('');
    
    // Información general
    const configGeneral = configuraciones.filter(c => categorias.general.includes(c.clave));
    document.getElementById('configGeneral').innerHTML = configGeneral.map(config => 
        crearItemConfig(config)
    ).join('');
}

// ========================================
// CREAR ITEM DE CONFIGURACIÓN
// ========================================
function crearItemConfig(config) {
    const valorFormateado = formatearValor(config.clave, config.valor);
    const icono = obtenerIcono(config.clave);
    
    return `
        <div class="config-item">
            <div class="config-item-left">
                <div class="config-item-label">
                    <i class="fas ${icono}"></i>
                    ${config.descripcion}
                </div>
                <div class="config-item-desc">
                    ${config.clave}
                </div>
            </div>
            <div class="config-item-right">
                <div class="config-value">${valorFormateado}</div>
                <button 
                    class="btn-icon btn-edit" 
                    onclick="editarConfig('${config.clave}')"
                    title="Editar"
                >
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}

// ========================================
// FORMATEAR VALOR SEGÚN TIPO
// ========================================
function formatearValor(clave, valor) {
    if (clave.includes('tasa')) {
        return `${valor}%`;
    } else if (clave.includes('monto')) {
        return formatCurrency(parseFloat(valor));
    } else if (clave.includes('cuotas')) {
        return `${valor} cuotas`;
    }
    return valor;
}

// ========================================
// OBTENER ICONO SEGÚN CLAVE
// ========================================
function obtenerIcono(clave) {
    if (clave.includes('tasa')) return 'fa-percentage';
    if (clave.includes('monto')) return 'fa-dollar-sign';
    if (clave.includes('cuotas')) return 'fa-calendar';
    if (clave === 'moneda') return 'fa-money-bill';
    return 'fa-cog';
}

// ========================================
// EDITAR CONFIGURACIÓN
// ========================================
function editarConfig(clave) {
    const config = configuraciones.find(c => c.clave === clave);
    if (!config) return;
    
    document.getElementById('modalConfigTitle').textContent = 'Editar Configuración';
    document.getElementById('configDescripcion').textContent = config.descripcion;
    document.getElementById('clave').value = config.clave;
    document.getElementById('valor').value = config.valor;
    
    // Mostrar hint según el tipo
    let hint = '';
    if (clave.includes('tasa')) {
        hint = 'Ingrese el porcentaje (ej: 2.5 para 2.5%)';
        document.getElementById('valor').type = 'number';
        document.getElementById('valor').step = '0.01';
        document.getElementById('valor').min = '0';
    } else if (clave.includes('monto')) {
        hint = 'Ingrese el monto en pesos (ej: 100000)';
        document.getElementById('valor').type = 'number';
        document.getElementById('valor').step = '1';
        document.getElementById('valor').min = '0';
    } else if (clave.includes('cuotas')) {
        hint = 'Ingrese el número de cuotas (ej: 12)';
        document.getElementById('valor').type = 'number';
        document.getElementById('valor').step = '1';
        document.getElementById('valor').min = '1';
    } else {
        hint = 'Ingrese el nuevo valor';
        document.getElementById('valor').type = 'text';
    }
    
    document.getElementById('valorHint').textContent = hint;
    document.getElementById('modalConfig').style.display = 'flex';
}

// ========================================
// GUARDAR CONFIGURACIÓN
// ========================================
async function guardarConfiguracion(e) {
    e.preventDefault();
    
    const clave = document.getElementById('clave').value;
    const valor = document.getElementById('valor').value;
    
    const config = configuraciones.find(c => c.clave === clave);
    
    mostrarModal(
        'Confirmar Cambio',
        `¿Estás seguro de cambiar "${config.descripcion}" de ${formatearValor(clave, config.valor)} a ${formatearValor(clave, valor)}?`,
        'fas fa-exclamation-triangle',
        async () => {
            await realizarCambioConfig(clave, valor);
        }
    );
}

// ========================================
// REALIZAR CAMBIO DE CONFIGURACIÓN
// ========================================
async function realizarCambioConfig(clave, valor) {
    const btnGuardar = document.getElementById('btnGuardarConfig');
    btnGuardar.disabled = true;
    
    try {
        const response = await fetch(`/api/configuracion/${clave}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor })
        });
        
        if (response.ok) {
            cerrarModalConfig();
            await cargarConfiguraciones();
            await cargarHistorial();
            mostrarToast('success', '¡Actualizado!', 'Configuración actualizada correctamente');
        } else {
            const error = await response.json();
            mostrarToast('error', 'Error', error.error || 'Error al actualizar configuración');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('error', 'Error', 'Error de conexión al actualizar configuración');
    } finally {
        btnGuardar.disabled = false;
    }
}

// ========================================
// CARGAR HISTORIAL
// ========================================
async function cargarHistorial() {
    try {
        // Por ahora mostrar mensaje, luego implementamos la consulta
        const tbody = document.getElementById('tablaHistorial');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <i class="fas fa-info-circle"></i>
                    No hay cambios recientes
                </td>
            </tr>
        `;
        
        // TODO: Implementar consulta al endpoint de historial
        // const response = await fetch('/api/configuracion/historial');
        // const historial = await response.json();
        // mostrarHistorial(historial);
        
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
}

// ========================================
// MOSTRAR HISTORIAL
// ========================================
function mostrarHistorial(historial) {
    const tbody = document.getElementById('tablaHistorial');
    
    if (historial.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No hay cambios recientes
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = historial.map(item => `
        <tr>
            <td><strong>${item.clave}</strong></td>
            <td>${formatearValor(item.clave, item.valor_anterior)}</td>
            <td>${formatearValor(item.clave, item.valor_nuevo)}</td>
            <td>${item.modificado_por}</td>
            <td>${formatDate(item.fecha)}</td>
        </tr>
    `).join('');
}

// ========================================
// CERRAR MODAL
// ========================================
function cerrarModalConfig() {
    document.getElementById('modalConfig').style.display = 'none';
    document.getElementById('formConfig').reset();
}

// ========================================
// NOTIFICACIONES TOAST
// ========================================
function mostrarToast(tipo, titulo, mensaje) {
    const container = document.getElementById('toastContainer');
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <i class="fas ${iconos[tipo]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${titulo}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
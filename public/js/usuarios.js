// ========================================
// GESTIÓN DE USUARIOS
// ========================================

let usuarios = [];
let administradores = [];
let usuarioEditar = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarUsuarios();
  await cargarAdministradores();

  // Event listener para el formulario
  document
    .getElementById("formUsuario")
    .addEventListener("submit", guardarUsuario);

  // Detectar scroll en tabla
  detectarScrollTabla();
});

// ========================================
// DETECTAR SCROLL EN TABLA
// ========================================
function detectarScrollTabla() {
  const tableResponsive = document.querySelector(".table-responsive");
  if (tableResponsive) {
    const table = tableResponsive.querySelector(".data-table");
    if (table && table.offsetWidth > tableResponsive.offsetWidth) {
      tableResponsive.classList.add("has-scroll");
    }
  }
}

// ========================================
// CARGAR USUARIOS
// ========================================
async function cargarUsuarios() {
  try {
    const response = await fetch("/api/usuarios");
    usuarios = await response.json();
    mostrarUsuarios(usuarios);
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    mostrarError("Error al cargar usuarios");
  }
}

// ========================================
// CARGAR ADMINISTRADORES (para select)
// ========================================
async function cargarAdministradores() {
  try {
    const response = await fetch("/api/usuarios");
    const todosUsuarios = await response.json();
    administradores = todosUsuarios.filter((u) => u.id_rol === 1);

    // Llenar select de filtro
    const filterAdmin = document.getElementById("filterAdmin");
    filterAdmin.innerHTML = '<option value="">Todos los admins</option>';
    administradores.forEach((admin) => {
      filterAdmin.innerHTML += `
                <option value="${admin.id_usuario}">
                    ${admin.nombre} ${admin.apellido}
                </option>
            `;
    });

    // Llenar select del formulario
    const selectAdmin = document.getElementById("id_administrador");
    selectAdmin.innerHTML = '<option value="">Seleccionar...</option>';
    administradores.forEach((admin) => {
      selectAdmin.innerHTML += `
                <option value="${admin.id_usuario}">
                    ${admin.nombre} ${admin.apellido}
                </option>
            `;
    });
  } catch (error) {
    console.error("Error cargando administradores:", error);
  }
}

// ========================================
// MOSTRAR USUARIOS EN TABLA
// ========================================
function mostrarUsuarios(listaUsuarios) {
  const tbody = document.getElementById("tablaUsuarios");

  if (listaUsuarios.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <i class="fas fa-inbox"></i><br>
                    No hay usuarios registrados
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = listaUsuarios
    .map(
      (user) => `
        <tr>
            <td><strong>${user.nombre} ${user.apellido}</strong></td>
            <td>${user.email}</td>
            <td>${user.telefono || "-"}</td>
            <td>
                <span class="badge ${
                  user.id_rol === 1 ? "badge-admin" : "badge-cliente"
                }">
                    <i class="fas ${
                      user.id_rol === 1 ? "fa-user-shield" : "fa-user"
                    }"></i>
                    ${user.rol}
                </span>
            </td>
            <td>${user.administrador || "-"}</td>
            <td>
                <span class="badge ${
                  user.activo ? "badge-success" : "badge-danger"
                }">
                    ${user.activo ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="verDetalles(${
                      user.id_usuario
                    })" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarUsuario(${
                      user.id_usuario
                    })" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="confirmarEliminar(${
                      user.id_usuario
                    }, '${user.nombre} ${user.apellido}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");

  // Detectar scroll después de cargar
  setTimeout(detectarScrollTabla, 100);
}

// ========================================
// FILTRAR USUARIOS
// ========================================
function filtrarUsuarios() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filterRol = document.getElementById("filterRol").value;
  const filterAdmin = document.getElementById("filterAdmin").value;

  let usuariosFiltrados = usuarios;

  // Filtrar por búsqueda
  if (searchTerm) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm) ||
        user.apellido.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por rol
  if (filterRol) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (user) => user.id_rol === parseInt(filterRol)
    );
  }

  // Filtrar por admin asignado
  if (filterAdmin) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (user) => user.id_administrador === parseInt(filterAdmin)
    );
  }

  mostrarUsuarios(usuariosFiltrados);
}

// ========================================
// LIMPIAR FILTROS
// ========================================
function limpiarFiltros() {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterRol").value = "";
  document.getElementById("filterAdmin").value = "";
  mostrarUsuarios(usuarios);
}

// ========================================
// ABRIR MODAL CREAR
// ========================================
function abrirModalCrear() {
  usuarioEditar = null;
  document.getElementById("modalUsuarioTitle").textContent = "Crear Usuario";
  document.getElementById("formUsuario").reset();
  document.getElementById("id_usuario").value = "";
  document.getElementById("grupoPassword").style.display = "block";
  document.getElementById("password").required = true;
  document.getElementById("grupoAdminAsignado").style.display = "none";
  document.getElementById("btnGuardarText").textContent = "Crear Usuario";
  document.getElementById("modalUsuario").style.display = "flex";
}

// ========================================
// TOGGLE ADMIN ASIGNADO
// ========================================
function toggleAdminAsignado() {
  const rol = document.getElementById("id_rol").value;
  const grupoAdmin = document.getElementById("grupoAdminAsignado");
  const selectAdmin = document.getElementById("id_administrador");

  if (rol === "2") {
    // Cliente
    grupoAdmin.style.display = "block";
    selectAdmin.required = true;
  } else {
    grupoAdmin.style.display = "none";
    selectAdmin.required = false;
    selectAdmin.value = "";
  }
}

// ========================================
// EDITAR USUARIO
// ========================================
async function editarUsuario(id) {
  try {
    const response = await fetch(`/api/usuarios/${id}`);
    usuarioEditar = await response.json();

    document.getElementById("modalUsuarioTitle").textContent = "Editar Usuario";
    document.getElementById("id_usuario").value = usuarioEditar.id_usuario;
    document.getElementById("nombre").value = usuarioEditar.nombre;
    document.getElementById("apellido").value = usuarioEditar.apellido;
    document.getElementById("email").value = usuarioEditar.email;
    document.getElementById("telefono").value = usuarioEditar.telefono || "";
    document.getElementById("direccion").value = usuarioEditar.direccion || "";
    document.getElementById("id_rol").value = usuarioEditar.id_rol;

    // Manejar admin asignado
    if (usuarioEditar.id_rol === 2 && usuarioEditar.id_administrador) {
      document.getElementById("grupoAdminAsignado").style.display = "block";
      document.getElementById("id_administrador").value =
        usuarioEditar.id_administrador;
    }

    // Password no requerido en edición
    document.getElementById("grupoPassword").style.display = "block";
    document.getElementById("password").required = false;
    document.getElementById("password").value = "";

    document.getElementById("btnGuardarText").textContent = "Actualizar";
    document.getElementById("modalUsuario").style.display = "flex";
  } catch (error) {
    console.error("Error:", error);
    mostrarError("Error al cargar usuario");
  }
}

// ========================================
// GUARDAR USUARIO (crear o editar)
// ========================================
async function guardarUsuario(e) {
  e.preventDefault();

  const btnGuardar = document.getElementById("btnGuardar");
  const btnText = document.getElementById("btnGuardarText");
  const textoOriginal = btnText.textContent;

  btnGuardar.disabled = true;
  btnText.textContent = "Guardando...";

  try {
    const formData = {
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      email: document.getElementById("email").value,
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
      id_rol: parseInt(document.getElementById("id_rol").value),
    };

    // Admin asignado solo para clientes
    if (formData.id_rol === 2) {
      formData.id_administrador = parseInt(
        document.getElementById("id_administrador").value
      );
    }

    const idUsuario = document.getElementById("id_usuario").value;

    // Si es crear o si se ingresó password
    const password = document.getElementById("password").value;
    if (!idUsuario || password) {
      formData.password = password;
    }

    let response;
    if (idUsuario) {
      // Actualizar
      response = await fetch(`/api/usuarios/${idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      // Crear
      response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    const data = await response.json();

    if (response.ok) {
      cerrarModalUsuario();
      await cargarUsuarios();
      mostrarToast(
        "success",
        "¡Éxito!",
        idUsuario
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );
    } else {
      // Manejar errores específicos
      let mensajeError = "Error al guardar usuario";

      if (response.status === 400) {
        mensajeError = data.error || mensajeError;
      } else if (data.error) {
        // Detectar error de email duplicado
        if (data.error.includes("Duplicate") || data.error.includes("email")) {
          mensajeError = "El correo electrónico ya está registrado";
        } else {
          mensajeError = data.error;
        }
      }

      mostrarToast("error", "Error", mensajeError);
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarToast("error", "Error", "Error de conexión al guardar usuario");
  } finally {
    btnGuardar.disabled = false;
    btnText.textContent = textoOriginal;
  }
}

// ========================================
// VER DETALLES
// ========================================
async function verDetalles(id) {
  try {
    const response = await fetch(`/api/usuarios/${id}`);
    const user = await response.json();

    const detallesHTML = `
            <div class="detalle-item">
                <div class="detalle-label">Nombre completo:</div>
                <div class="detalle-value">${user.nombre} ${user.apellido}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Email:</div>
                <div class="detalle-value">${user.email}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Teléfono:</div>
                <div class="detalle-value">${user.telefono || "-"}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Dirección:</div>
                <div class="detalle-value">${user.direccion || "-"}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Rol:</div>
                <div class="detalle-value">
                    <span class="badge ${
                      user.id_rol === 1 ? "badge-admin" : "badge-cliente"
                    }">
                        ${user.rol}
                    </span>
                </div>
            </div>
            ${
              user.administrador
                ? `
                <div class="detalle-item">
                    <div class="detalle-label">Admin asignado:</div>
                    <div class="detalle-value">${user.administrador}</div>
                </div>
            `
                : ""
            }
            <div class="detalle-item">
                <div class="detalle-label">Estado:</div>
                <div class="detalle-value">
                    <span class="badge ${
                      user.activo ? "badge-success" : "badge-danger"
                    }">
                        ${user.activo ? "Activo" : "Inactivo"}
                    </span>
                </div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Fecha registro:</div>
                <div class="detalle-value">${formatDate(
                  user.fecha_registro
                )}</div>
            </div>
        `;

    document.getElementById("detallesUsuario").innerHTML = detallesHTML;
    document.getElementById("modalDetalles").style.display = "flex";
  } catch (error) {
    console.error("Error:", error);
    mostrarError("Error al cargar detalles");
  }
}

// ========================================
// CONFIRMAR ELIMINAR
// ========================================
function confirmarEliminar(id, nombre) {
  mostrarModal(
    "Eliminar Usuario",
    `¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`,
    "fas fa-trash-alt",
    () => eliminarUsuario(id)
  );
}

// ========================================
// ELIMINAR USUARIO
// ========================================
async function eliminarUsuario(id) {
  try {
    const response = await fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await cargarUsuarios();
      mostrarToast("success", "¡Eliminado!", "Usuario eliminado correctamente");
    } else {
      const data = await response.json();
      mostrarToast("error", "Error", data.error || "Error al eliminar usuario");
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarToast("error", "Error", "Error de conexión al eliminar usuario");
  }
}

// ========================================
// CERRAR MODALES
// ========================================
function cerrarModalUsuario() {
  document.getElementById("modalUsuario").style.display = "none";
  document.getElementById("formUsuario").reset();
}

function cerrarModalDetalles() {
  document.getElementById("modalDetalles").style.display = "none";
}

// ========================================
// NOTIFICACIONES TOAST
// ========================================
function mostrarToast(tipo, titulo, mensaje) {
  const container = document.getElementById("toastContainer");

  const iconos = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  const toast = document.createElement("div");
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

  // Auto-remove después de 5 segundos
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function mostrarExito(mensaje) {
  mostrarToast("success", "¡Éxito!", mensaje);
}

function mostrarError(mensaje) {
  mostrarToast("error", "Error", mensaje);
}

// ========================================
// UTILIDADES
// ========================================
function formatDate(date) {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

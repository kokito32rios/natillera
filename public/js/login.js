// ========================================
// LOGIN FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Enfocar el campo de email al cargar
    document.getElementById('email').focus();
    
    // Agregar listener al formulario
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Validación en tiempo real
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('password').addEventListener('blur', validatePassword);
});

// ========================================
// TOGGLE PASSWORD VISIBILITY
// ========================================
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// ========================================
// VALIDACIONES
// ========================================
function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (!email) {
        errorElement.textContent = 'El correo es requerido';
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Correo electrónico inválido';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('passwordError');
    
    if (!password) {
        errorElement.textContent = 'La contraseña es requerida';
        return false;
    }
    
    if (password.length < 4) {
        errorElement.textContent = 'La contraseña debe tener al menos 4 caracteres';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

// ========================================
// MANEJO DEL LOGIN
// ========================================
async function handleLogin(e) {
    e.preventDefault();
    
    // Limpiar errores previos
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    cerrarAlerta();
    
    // Validar campos
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    
    if (!emailValid || !passwordValid) {
        return;
    }
    
    // Obtener valores
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Deshabilitar botón y mostrar loader
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');
    
    btnLogin.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso
            mostrarAlerta('Inicio de sesión exitoso. Redirigiendo...', 'success');
            
            // Redirigir según el rol
            setTimeout(() => {
                if (data.usuario.rol === 'admin') {
                    window.location.href = '/views/admin/dashboard.html';
                } else {
                    window.location.href = '/views/cliente/dashboard.html';
                }
            }, 1000);
            
        } else {
            // Manejar diferentes tipos de error
            if (data.tipo === 'usuario_no_existe') {
                // Usuario no existe - mostrar opción de registro
                mostrarAlertaConRegistro(data.mensaje);
            } else if (data.tipo === 'cuenta_inactiva') {
                // Cuenta desactivada
                mostrarAlerta(data.mensaje, 'warning');
            } else if (data.tipo === 'password_invalido') {
                // Contraseña incorrecta
                mostrarAlerta(data.mensaje, 'error');
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            } else {
                // Error genérico
                mostrarAlerta(data.error || 'Error al iniciar sesión', 'error');
            }
            
            btnLogin.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión. Intenta nuevamente.', 'error');
        btnLogin.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// ========================================
// ALERTAS
// ========================================
function mostrarAlerta(mensaje, tipo = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    
    alertDiv.className = `alert ${tipo}`;
    alertText.textContent = mensaje;
    alertDiv.style.display = 'flex';
    
    // Auto-ocultar después de 5 segundos (excepto en success)
    if (tipo !== 'success') {
        setTimeout(() => {
            cerrarAlerta();
        }, 5000);
    }
}

function mostrarAlertaConRegistro(mensaje) {
    const alertDiv = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    
    alertDiv.className = 'alert warning';
    alertText.innerHTML = `
        ${mensaje}
        <br>
        <strong style="cursor: pointer; text-decoration: underline; margin-top: 0.5rem; display: inline-block;" onclick="mostrarInfoRegistro()">
            ¿Necesitas una cuenta? Haz clic aquí
        </strong>
    `;
    alertDiv.style.display = 'flex';
}

function cerrarAlerta() {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.style.display = 'none';
}

// ========================================
// MODAL DE REGISTRO
// ========================================
function mostrarInfoRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'flex';
}

function cerrarModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalRegistro');
    if (event.target === modal) {
        cerrarModalRegistro();
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModalRegistro();
    }
});

// ========================================
// RECORDAR SESIÓN
// ========================================
document.getElementById('rememberMe')?.addEventListener('change', (e) => {
    if (e.target.checked) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
    }
});
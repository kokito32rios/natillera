// ========================================
// LOGIN FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('email').focus();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
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

    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    cerrarAlerta();

    const emailValid = validateEmail();
    const passwordValid = validatePassword();

    if (!emailValid || !passwordValid) {
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

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
            mostrarAlerta('Inicio de sesión exitoso. Redirigiendo...', 'success');

            setTimeout(() => {
                if (data.usuario.rol === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/cliente/dashboard.html';
                }
            }, 1000);
        } else {
            if (data.tipo === 'usuario_no_existe') {
                mostrarAlertaConRegistro(data.mensaje);
            } else if (data.tipo === 'cuenta_inactiva') {
                mostrarAlerta(data.mensaje, 'warning');
            } else if (data.tipo === 'password_invalido') {
                mostrarAlerta(data.mensaje, 'error');
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            } else {
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

window.onclick = function(event) {
    const modal = document.getElementById('modalRegistro');
    if (event.target === modal) {
        cerrarModalRegistro();
    }
};

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

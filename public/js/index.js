// ========================================
// FUNCIONES DEL MODAL
// ========================================

function mostrarModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
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
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.06)';
    } else {
        navbar.style.boxShadow = '0 14px 32px rgba(15, 23, 42, 0.08)';
    }
});

// ========================================
// ANIMACION AL HACER SCROLL
// ========================================

const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(
        '.metric-card, .solution-card, .experience-item, .timeline-item, .trust-item, .mini-panel'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ========================================
// MENU MOVIL
// ========================================

const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

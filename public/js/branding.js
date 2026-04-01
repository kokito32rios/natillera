const BRANDING_ENDPOINT = '/api/public/config/nombre-natillera';
const DEFAULT_BRAND_NAME = 'Mi Natillera';

document.addEventListener('DOMContentLoaded', () => {
  cargarBranding();
});

window.aplicarNombreNatillera = aplicarNombreNatillera;

async function cargarBranding() {
  try {
    const response = await fetch(BRANDING_ENDPOINT);
    if (!response.ok) {
      throw new Error('No se pudo obtener configuracion publica');
    }

    const data = await response.json();
    aplicarNombreNatillera(data.valor || DEFAULT_BRAND_NAME);
  } catch (error) {
    console.error('Error cargando nombre de natillera:', error);
    aplicarNombreNatillera(DEFAULT_BRAND_NAME);
  }
}

function aplicarNombreNatillera(nombre) {
  document.querySelectorAll('.brand span, .nav-brand span').forEach((element) => {
    element.textContent = nombre;
  });

  document.querySelectorAll('[data-natillera-name]').forEach((element) => {
    element.textContent = nombre;
  });

  document.querySelectorAll('[data-natillera-template]').forEach((element) => {
    const template = element.dataset.natilleraTemplate || '{{name}}';
    element.textContent = template.replace('{{name}}', nombre);
  });

  document.title = document.title
    .replace('Mi Natillera', nombre)
    .replace('Natillera de Ahorros', nombre);
}

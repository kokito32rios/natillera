let deferredInstallPrompt = null;
let installButton = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.error('Error registrando service worker:', error);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  installButton = createInstallButton();
  updateInstallButtonVisibility();
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButtonVisibility();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallButtonVisibility();
});

async function handleInstallClick() {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButtonVisibility();
}

function updateInstallButtonVisibility() {
  if (!installButton) {
    return;
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const shouldShow = Boolean(deferredInstallPrompt) && !isStandalone;
  installButton.style.display = shouldShow ? 'inline-flex' : 'none';
}

function createInstallButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'pwaInstallButton';
  button.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i><span>Instalar app</span>';
  button.setAttribute('aria-label', 'Instalar aplicacion');
  button.style.display = 'none';
  button.style.position = 'fixed';
  button.style.right = '1rem';
  button.style.bottom = '1rem';
  button.style.zIndex = '9999';
  button.style.border = '0';
  button.style.borderRadius = '999px';
  button.style.padding = '0.9rem 1.2rem';
  button.style.background = '#1e6f5c';
  button.style.color = '#ffffff';
  button.style.boxShadow = '0 14px 30px rgba(30, 111, 92, 0.28)';
  button.style.fontSize = '0.95rem';
  button.style.fontWeight = '700';
  button.style.cursor = 'pointer';
  button.style.alignItems = 'center';
  button.style.gap = '0.55rem';
  button.style.fontFamily = 'inherit';

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 18px 36px rgba(30, 111, 92, 0.34)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 14px 30px rgba(30, 111, 92, 0.28)';
  });

  button.addEventListener('click', handleInstallClick);
  document.body.appendChild(button);

  return button;
}

const buttons = document.querySelectorAll('[data-target]');
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.nav-btn');
const toast = document.getElementById('toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
}

function showScreen(target) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.dataset.screen === target);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === target);
  });
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target) {
      showScreen(target);
      showToast(target === 'home' ? 'Inicio abierto' : `Sección ${target} abierta`);
    }
  });
});

document.querySelectorAll('[data-action="reserve"]').forEach((button) => {
  button.addEventListener('click', () => {
    showScreen('classes');
    showToast('Clase reservada');
  });
});

document.querySelectorAll('[data-action="open-plan"]').forEach((button) => {
  button.addEventListener('click', () => {
    showScreen('plan');
    showToast('Plan híbrido abierto');
  });
});

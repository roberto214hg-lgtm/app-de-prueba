const STORAGE_KEY = 'flexgym-demo-state';

const buttons = document.querySelectorAll('[data-target]');
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.nav-btn');
const toast = document.getElementById('toast');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(partialState) {
  const state = { ...loadState(), ...partialState };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

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

  saveState({ screen: target });
}

function setProgress(value) {
  const clamped = Math.min(100, Math.max(0, value));
  if (progressFill) {
    progressFill.style.width = `${clamped}%`;
    progressFill.dataset.progress = String(clamped);
  }
  if (progressText) {
    progressText.textContent = `${clamped}% completado esta semana`;
  }
  saveState({ progress: clamped });
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

if (loginSubmit) {
  loginSubmit.addEventListener('click', () => {
    const emailFilled = loginEmail && loginEmail.value.trim().length > 0;
    const passwordFilled = loginPassword && loginPassword.value.trim().length > 0;

    if (!emailFilled || !passwordFilled) {
      if (loginError) loginError.hidden = false;
      return;
    }

    if (loginError) loginError.hidden = true;
    showScreen('home');
    showToast('Sesión iniciada');
  });
}

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

const advanceProgressBtn = document.getElementById('advanceProgress');
if (advanceProgressBtn && progressFill) {
  advanceProgressBtn.addEventListener('click', () => {
    const currentProgress = parseInt(progressFill.dataset.progress, 10) || 0;
    setProgress(currentProgress + 12);
    showToast('Sesión marcada como completada');
  });
}

const savedState = loadState();
if (savedState.progress !== undefined) {
  setProgress(savedState.progress);
}
if (savedState.screen) {
  showScreen(savedState.screen);
}

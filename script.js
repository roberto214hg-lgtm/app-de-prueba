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
const createAccountBtn = document.getElementById('createAccountBtn');
const bottomNav = document.querySelector('.bottom-nav');
const topbar = document.getElementById('topbar');
const accessCodeBtn = document.getElementById('accessCodeBtn');
const accessCodePanel = document.getElementById('accessCodePanel');
const remindersToggle = document.getElementById('remindersToggle');
const remindersIcon = document.getElementById('remindersIcon');
const remindersLabel = document.getElementById('remindersLabel');
const paymentButtons = document.querySelectorAll('[data-pay-amount]');
const paymentHistoryList = document.getElementById('paymentHistory');
const paymentEmptyState = document.getElementById('paymentEmptyState');

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

  const isLogin = target === 'login';

  if (bottomNav) {
    bottomNav.classList.toggle('is-hidden', isLogin);
  }

  if (topbar) {
    topbar.classList.toggle('is-hidden', isLogin);
  }

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

const screenLabels = {
  home: 'Inicio',
  classes: 'Clases',
  plan: 'Plan',
  profile: 'Perfil',
  payments: 'Pagos',
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target) {
      showScreen(target);
      const label = screenLabels[target] || target;
      showToast(target === 'home' ? 'Inicio abierto' : `Sección ${label} abierta`);
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

if (createAccountBtn) {
  createAccountBtn.addEventListener('click', () => {
    const emailFilled = loginEmail && loginEmail.value.trim().length > 0;
    const passwordFilled = loginPassword && loginPassword.value.trim().length > 0;

    if (!emailFilled || !passwordFilled) {
      if (loginError) loginError.hidden = false;
      return;
    }

    if (loginError) loginError.hidden = true;
    showScreen('home');
    showToast('Cuenta creada correctamente');
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

if (accessCodeBtn && accessCodePanel) {
  accessCodeBtn.addEventListener('click', () => {
    const willShow = accessCodePanel.hidden;
    accessCodePanel.hidden = !willShow;
    accessCodeBtn.setAttribute('aria-expanded', String(willShow));
    if (willShow) showToast('Código de acceso generado');
  });
}

function setReminders(enabled) {
  if (remindersIcon) remindersIcon.textContent = enabled ? '🔔' : '🔕';
  if (remindersLabel) {
    remindersLabel.textContent = enabled ? 'Recordatorios activados' : 'Recordatorios desactivados';
  }
  saveState({ remindersEnabled: enabled });
}

if (remindersToggle && remindersLabel) {
  remindersToggle.addEventListener('click', () => {
    const currentlyEnabled = remindersLabel.textContent.includes('activados');
    const next = !currentlyEnabled;
    setReminders(next);
    showToast(next ? 'Recordatorios activados' : 'Recordatorios desactivados');
  });
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function renderPaymentHistory() {
  if (!paymentHistoryList) return;
  const { payments = [] } = loadState();

  paymentHistoryList.querySelectorAll('.payment-entry').forEach((entry) => entry.remove());

  if (paymentEmptyState) {
    paymentEmptyState.hidden = payments.length > 0;
  }

  payments
    .slice()
    .reverse()
    .forEach((payment) => {
      const item = document.createElement('article');
      item.className = 'info-card payment-entry';

      const info = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = payment.name;
      const date = document.createElement('p');
      date.textContent = payment.date;
      info.append(title, date);

      const amount = document.createElement('strong');
      amount.textContent = formatCurrency(payment.amount);

      item.append(info, amount);
      paymentHistoryList.appendChild(item);
    });
}

function registerPayment(name, amount) {
  const { payments = [] } = loadState();
  payments.push({
    name,
    amount,
    date: new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });
  saveState({ payments });
  renderPaymentHistory();
}

paymentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.payName;
    const amount = parseFloat(button.dataset.payAmount);
    registerPayment(name, amount);
    showToast(`Pago realizado: ${name} · ${formatCurrency(amount)}`);
  });
});

renderPaymentHistory();

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
if (savedState.remindersEnabled !== undefined) {
  setReminders(savedState.remindersEnabled);
}
if (savedState.screen) {
  showScreen(savedState.screen);
}

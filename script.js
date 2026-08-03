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
const userGreeting = document.getElementById('userGreeting');
const userAvatar = document.getElementById('userAvatar');
const accessCodeBtn = document.getElementById('accessCodeBtn');
const accessCodePanel = document.getElementById('accessCodePanel');
const accessCodeValue = document.getElementById('accessCodeValue');
const accessCodeExpiry = document.getElementById('accessCodeExpiry');
const remindersToggle = document.getElementById('remindersToggle');
const remindersIcon = document.getElementById('remindersIcon');
const remindersLabel = document.getElementById('remindersLabel');
const logoutBtn = document.getElementById('logoutBtn');
const membershipTitle = document.getElementById('membershipTitle');
const membershipStatus = document.getElementById('membershipStatus');
const membershipCta = document.getElementById('membershipCta');
const paymentButtons = document.querySelectorAll('[data-pay-amount]');
const paymentHistoryList = document.getElementById('paymentHistory');
const paymentEmptyState = document.getElementById('paymentEmptyState');
const profileProgressValue = document.getElementById('profileProgressValue');
const profileProgressFill = document.getElementById('profileProgressFill');
const timeFilterButtons = document.querySelectorAll('.time-filter__btn');
const classList = document.getElementById('classList');
const reservationList = document.getElementById('reservationList');
const reservationEmptyState = document.getElementById('reservationEmptyState');

const TOTAL_WEEKLY_SESSIONS = 5;
const PROGRESS_STEP = 100 / TOTAL_WEEKLY_SESSIONS;

function getWeekKey(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date - oneJan) / 86400000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${date.getFullYear()}-W${week}`;
}

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

function getDisplayNameFromEmail(email) {
  const localPart = (email || '').split('@')[0];
  const words = localPart.replace(/[._-]+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length === 0) return 'Usuario';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function setUserIdentity(email) {
  const name = getDisplayNameFromEmail(email);
  if (userGreeting) userGreeting.textContent = `Hola, ${name}`;
  if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
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
}

function setProgress(value) {
  const clamped = Math.min(100, Math.max(0, value));
  if (progressFill) {
    progressFill.style.width = `${clamped}%`;
    progressFill.dataset.progress = String(clamped);
  }
  if (progressText) {
    progressText.textContent =
      clamped >= 100 ? '¡Semana completada! 🎉' : `${clamped}% completado esta semana`;
  }
  if (profileProgressFill) profileProgressFill.style.width = `${clamped}%`;
  if (profileProgressValue) profileProgressValue.textContent = `${clamped}%`;
  saveState({ progress: clamped, planWeek: getWeekKey(new Date()) });
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
    setUserIdentity(loginEmail.value.trim());
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
    setUserIdentity(loginEmail.value.trim());
    showScreen('home');
    showToast('Cuenta creada correctamente');
  });
}

function formatDateTime(date) {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderReservations() {
  if (!reservationList) return;
  const { reservations = [] } = loadState();

  reservationList.querySelectorAll('.reservation-entry').forEach((entry) => entry.remove());

  if (reservationEmptyState) {
    reservationEmptyState.hidden = reservations.length > 0;
  }

  reservations
    .slice()
    .reverse()
    .forEach((reservation) => {
      const item = document.createElement('article');
      item.className = 'info-card reservation-entry';

      const info = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = `${reservation.name} · ${reservation.time}`;
      const meta = document.createElement('p');
      meta.textContent =
        reservation.status === 'terminada'
          ? `Completada el ${reservation.completedAt}`
          : `Reservada el ${reservation.reservedAt}`;
      info.append(title, meta);
      item.append(info);

      if (reservation.status === 'pendiente') {
        const actions = document.createElement('div');
        actions.className = 'reservation-actions';

        const badge = document.createElement('span');
        badge.className = 'status-badge status-badge--pending';
        badge.textContent = 'Pendiente';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'pill-btn';
        completeBtn.type = 'button';
        completeBtn.textContent = 'Marcar tomada';
        completeBtn.addEventListener('click', () => completeReservation(reservation.id));

        actions.append(badge, completeBtn);
        item.append(actions);
      } else {
        const badge = document.createElement('span');
        badge.className = 'status-badge status-badge--done';
        badge.textContent = 'Clase terminada';
        item.append(badge);
      }

      reservationList.appendChild(item);
    });
}

function addReservation(name, time) {
  const { reservations = [] } = loadState();
  const alreadyPending = reservations.some(
    (reservation) => reservation.name === name && reservation.time === time && reservation.status === 'pendiente'
  );

  if (alreadyPending) {
    showToast('Ya tienes esa clase pendiente');
    return;
  }

  reservations.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    time,
    status: 'pendiente',
    reservedAt: formatDateTime(new Date()),
    completedAt: null,
  });
  saveState({ reservations });
  renderReservations();
  showToast('Clase reservada · pendiente');
}

function completeReservation(id) {
  const { reservations = [] } = loadState();
  const updated = reservations.map((reservation) =>
    reservation.id === id
      ? { ...reservation, status: 'terminada', completedAt: formatDateTime(new Date()) }
      : reservation
  );
  saveState({ reservations: updated });
  renderReservations();
  showToast('Clase marcada como terminada');

  if (progressFill) {
    const currentProgress = parseInt(progressFill.dataset.progress, 10) || 0;
    setProgress(currentProgress + PROGRESS_STEP);
  }
}

document.querySelectorAll('[data-action="reserve"]').forEach((button) => {
  button.addEventListener('click', () => {
    showScreen('classes');
    addReservation(button.dataset.className || 'Clase', button.dataset.classTime || '');
  });
});

renderReservations();

document.querySelectorAll('[data-action="open-plan"]').forEach((button) => {
  button.addEventListener('click', () => {
    showScreen('plan');
    showToast('Plan híbrido abierto');
  });
});

const ACCESS_CODE_TTL_SECONDS = 30;
let accessCodeTimer = null;

function generateAccessCode() {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `${part1} ${part2}`;
}

function stopAccessCodeCountdown() {
  clearInterval(accessCodeTimer);
  accessCodeTimer = null;
}

function startAccessCodeCountdown() {
  stopAccessCodeCountdown();
  let remaining = ACCESS_CODE_TTL_SECONDS;

  const tick = () => {
    if (!accessCodeExpiry) return;
    if (remaining <= 0) {
      accessCodeExpiry.textContent = 'Código expirado · vuelve a abrir para generar uno nuevo';
      accessCodeExpiry.classList.add('is-expired');
      if (accessCodeValue) accessCodeValue.classList.add('is-expired');
      stopAccessCodeCountdown();
      return;
    }
    accessCodeExpiry.textContent = `Expira en ${remaining}s`;
    remaining -= 1;
  };

  tick();
  accessCodeTimer = setInterval(tick, 1000);
}

if (accessCodeBtn && accessCodePanel) {
  accessCodeBtn.addEventListener('click', () => {
    const willShow = accessCodePanel.hidden;
    accessCodePanel.hidden = !willShow;
    accessCodeBtn.setAttribute('aria-expanded', String(willShow));

    if (willShow) {
      if (accessCodeValue) {
        accessCodeValue.textContent = generateAccessCode();
        accessCodeValue.classList.remove('is-expired');
      }
      if (accessCodeExpiry) accessCodeExpiry.classList.remove('is-expired');
      startAccessCodeCountdown();
      showToast('Código de acceso generado');
    } else {
      stopAccessCodeCountdown();
    }
  });
}

function setReminders(enabled) {
  if (remindersIcon) remindersIcon.textContent = enabled ? '🔔' : '🔕';
  if (remindersLabel) {
    remindersLabel.textContent = enabled ? 'Recordatorios activados' : 'Recordatorios desactivados';
  }
  saveState({ remindersEnabled: enabled });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    if (loginError) loginError.hidden = true;
    if (accessCodePanel) accessCodePanel.hidden = true;
    if (accessCodeBtn) accessCodeBtn.setAttribute('aria-expanded', 'false');
    stopAccessCodeCountdown();
    showScreen('login');
    showToast('Sesión cerrada');
  });
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

function renderMembership() {
  if (!membershipTitle || !membershipStatus) return;
  const { payments = [] } = loadState();
  const subscriptionPayments = payments.filter((payment) => payment.name.startsWith('Suscripción '));

  if (subscriptionPayments.length === 0) {
    membershipTitle.textContent = 'Sin membresía activa';
    membershipStatus.textContent = 'Suscríbete para acceder al gimnasio';
    if (membershipCta) membershipCta.hidden = false;
    return;
  }

  const latest = subscriptionPayments[subscriptionPayments.length - 1];
  const planName = latest.name.replace('Suscripción ', '');
  const validUntil = new Date(latest.timestamp);
  validUntil.setDate(validUntil.getDate() + 30);

  membershipTitle.textContent = `Membresía ${planName}`;
  membershipStatus.textContent = `Válida hasta: ${validUntil.toLocaleDateString('es-ES')}`;
  if (membershipCta) membershipCta.hidden = true;
}

function registerPayment(name, amount) {
  const { payments = [] } = loadState();
  const now = new Date();
  payments.push({
    name,
    amount,
    date: formatDateTime(now),
    timestamp: now.getTime(),
  });
  saveState({ payments });
  renderPaymentHistory();
  renderMembership();
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
renderMembership();

timeFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.timeFilter;
    timeFilterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    if (classList) {
      classList.querySelectorAll('.info-card').forEach((card) => {
        const matches = filter === 'todas' || card.dataset.timeSlot === filter;
        card.classList.toggle('is-hidden', !matches);
      });
    }
  });
});

const savedState = loadState();
const currentWeekKey = getWeekKey(new Date());
if (savedState.progress !== undefined) {
  const isSameWeek = savedState.planWeek === currentWeekKey;
  setProgress(isSameWeek ? savedState.progress : 0);
}
if (savedState.remindersEnabled !== undefined) {
  setReminders(savedState.remindersEnabled);
}

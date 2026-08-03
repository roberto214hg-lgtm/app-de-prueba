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
const accessCodeQr = document.getElementById('accessCodeQr');
const remindersToggle = document.getElementById('remindersToggle');
const remindersIcon = document.getElementById('remindersIcon');
const remindersLabel = document.getElementById('remindersLabel');
const logoutBtn = document.getElementById('logoutBtn');
const membershipTitle = document.getElementById('membershipTitle');
const membershipStatus = document.getElementById('membershipStatus');
const membershipCta = document.getElementById('membershipCta');
const autoRenewStatus = document.getElementById('autoRenewStatus');
const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
const subscriptionModal = document.getElementById('subscriptionModal');
const subscriptionModalSummary = document.getElementById('subscriptionModalSummary');
const subscriptionModalError = document.getElementById('subscriptionModalError');
const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');
const confirmSubscriptionBtn = document.getElementById('confirmSubscriptionBtn');
const cancelSubscriptionModalBtn = document.getElementById('cancelSubscriptionModalBtn');
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

let audioCtx = null;

function playUiSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.exponentialRampToValueAtTime(1175, now + 0.08);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
  playUiSound();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDisplayNameFromEmail(email) {
  const localPart = (email || '').split('@')[0];
  const words = localPart.replace(/[._-]+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length === 0) return 'Usuario';
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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

function findAccount(email) {
  const { accounts = [] } = loadState();
  return accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
}

function registerAccount(email, password) {
  const { accounts = [] } = loadState();
  accounts.push({ email, password });
  saveState({ accounts });
}

function showLoginError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.hidden = false;
}

if (loginSubmit) {
  loginSubmit.addEventListener('click', () => {
    const email = loginEmail ? loginEmail.value.trim() : '';
    const password = loginPassword ? loginPassword.value.trim() : '';

    if (!isValidEmail(email) || password.length === 0) {
      showLoginError('Ingresa un correo válido y tu contraseña para continuar.');
      return;
    }

    const account = findAccount(email);
    if (!account || account.password !== password) {
      showLoginError('No existe una cuenta con ese correo y contraseña. Crea una cuenta primero.');
      return;
    }

    if (loginError) loginError.hidden = true;
    setUserIdentity(email);
    showScreen('home');
    showToast('Sesión iniciada');
  });
}

if (createAccountBtn) {
  createAccountBtn.addEventListener('click', () => {
    const email = loginEmail ? loginEmail.value.trim() : '';
    const password = loginPassword ? loginPassword.value.trim() : '';

    if (!isValidEmail(email) || password.length === 0) {
      showLoginError('Ingresa un correo válido y tu contraseña para continuar.');
      return;
    }

    if (findAccount(email)) {
      showLoginError('Ya existe una cuenta con ese correo. Inicia sesión en vez de crear una nueva.');
      return;
    }

    registerAccount(email, password);
    if (loginError) loginError.hidden = true;
    setUserIdentity(email);
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

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'pill-btn pill-btn--danger';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancelar reserva';
        cancelBtn.addEventListener('click', () => cancelReservation(reservation.id));

        actions.append(badge, completeBtn, cancelBtn);
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

function cancelReservation(id) {
  const { reservations = [] } = loadState();
  const updated = reservations.filter((reservation) => reservation.id !== id);
  saveState({ reservations: updated });
  renderReservations();
  showToast('Reserva cancelada');
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

// --- Generador de QR autocontenido (modo byte, versiones 1-2, ECC nivel M, máscara fija 0) ---
function qrGfMultiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function qrComputeDivisor(degree) {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = qrGfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = qrGfMultiply(root, 2);
  }
  return result;
}

function qrComputeRemainder(dataCodewords, divisor) {
  const result = new Uint8Array(divisor.length);
  dataCodewords.forEach((b) => {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < result.length; i++) {
      result[i] ^= qrGfMultiply(divisor[i], factor);
    }
  });
  return result;
}

function qrSelectVersion(text) {
  if (text.length <= 14) return 1;
  if (text.length <= 26) return 2;
  return null;
}

function qrBuildDataCodewords(text, version) {
  const dataCapacity = version === 1 ? 16 : 28;
  const bytes = Array.from(text, (ch) => ch.charCodeAt(0) & 0xff);
  const bits = [];
  const pushBits = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  bytes.forEach((b) => pushBits(b, 8));

  const capacityBits = dataCapacity * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const padBytes = [0xec, 0x11];
  let p = 0;
  while (bits.length < capacityBits) {
    pushBits(padBytes[p % 2], 8);
    p++;
  }

  const codewords = new Uint8Array(dataCapacity);
  for (let i = 0; i < dataCapacity; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i * 8 + j];
    codewords[i] = byte;
  }
  return codewords;
}

function qrComputeFormatBits() {
  const data = 0; // ECC nivel M (00) + patrón de máscara 0 (000)
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  rem &= 0x3ff;
  return ((data << 10) | rem) ^ 0x5412;
}

function generateQrMatrix(text) {
  const version = qrSelectVersion(text);
  if (!version) return null;

  const dataCodewords = qrBuildDataCodewords(text, version);
  const ecLength = version === 1 ? 10 : 16;
  const divisor = qrComputeDivisor(ecLength);
  const ecCodewords = qrComputeRemainder(dataCodewords, divisor);
  const allCodewords = new Uint8Array(dataCodewords.length + ecCodewords.length);
  allCodewords.set(dataCodewords, 0);
  allCodewords.set(ecCodewords, dataCodewords.length);

  const size = 4 * version + 17;
  const modules = Array.from({ length: size }, () => new Uint8Array(size));
  const isFunction = Array.from({ length: size }, () => new Uint8Array(size));

  const setFn = (y, x, dark) => {
    modules[y][x] = dark ? 1 : 0;
    isFunction[y][x] = 1;
  };

  const drawFinder = (x0, y0) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = x0 + dx;
        const y = y0 + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const isBorder = dx === -1 || dx === 7 || dy === -1 || dy === 7;
        const dark =
          !isBorder &&
          (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setFn(y, x, dark);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    setFn(6, i, dark);
    setFn(i, 6, dark);
  }

  setFn(size - 8, 8, true);

  if (version === 2) {
    const c = 18;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const dark = dx === -2 || dx === 2 || dy === -2 || dy === 2 || (dx === 0 && dy === 0);
        setFn(c + dy, c + dx, dark);
      }
    }
  }

  const formatBits = qrComputeFormatBits();
  const fbit = (i) => (formatBits >>> (14 - i)) & 1;

  for (let i = 0; i <= 5; i++) setFn(8, i, !!fbit(i));
  setFn(8, 7, !!fbit(6));
  setFn(8, 8, !!fbit(7));
  setFn(7, 8, !!fbit(8));
  for (let i = 9; i <= 14; i++) setFn(14 - i, 8, !!fbit(i));

  for (let i = 0; i <= 6; i++) setFn(size - 1 - i, 8, !!fbit(i));
  for (let i = 7; i <= 14; i++) setFn(8, size - 15 + i, !!fbit(i));

  let bitIndex = 0;
  const totalBits = allCodewords.length * 8;
  const getBit = (i) => (allCodewords[i >>> 3] >>> (7 - (i & 7))) & 1;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x]) {
          let bit = 0;
          if (bitIndex < totalBits) {
            bit = getBit(bitIndex);
            bitIndex++;
          }
          const mask = (y + x) % 2 === 0 ? 1 : 0;
          modules[y][x] = bit ^ mask;
        }
      }
    }
  }

  return { size, modules };
}

function renderQrToCanvas(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const result = generateQrMatrix(text);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!result) return;

  const { size, modules } = result;
  const quiet = 4;
  const totalModules = size + quiet * 2;
  const moduleSize = Math.floor(canvas.width / totalModules) || 1;
  const offset = (canvas.width - moduleSize * totalModules) / 2;

  ctx.fillStyle = '#0f172a';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        ctx.fillRect(offset + (quiet + x) * moduleSize, offset + (quiet + y) * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

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
      const code = generateAccessCode();
      if (accessCodeValue) {
        accessCodeValue.textContent = code;
        accessCodeValue.classList.remove('is-expired');
      }
      if (accessCodeExpiry) accessCodeExpiry.classList.remove('is-expired');
      renderQrToCanvas(accessCodeQr, code);
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
  if (remindersToggle) remindersToggle.dataset.enabled = String(enabled);
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
    const currentlyEnabled = remindersToggle.dataset.enabled === 'true';
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
  const { payments = [], membershipCancelled } = loadState();
  const subscriptionPayments = payments.filter((payment) => payment.name.startsWith('Suscripción '));

  if (subscriptionPayments.length > 0 && !membershipCancelled) {
    const latest = subscriptionPayments[subscriptionPayments.length - 1];
    const validUntil = new Date(latest.timestamp);
    validUntil.setDate(validUntil.getDate() + 30);
    const isExpired = validUntil.getTime() < Date.now();

    if (isExpired) {
      registerPayment(latest.name, latest.amount);
      showToast(`Suscripción renovada automáticamente: ${latest.name}`);
      return;
    }

    const planName = latest.name.replace('Suscripción ', '');
    membershipTitle.textContent = `Membresía ${planName}`;
    membershipStatus.textContent = `Válida hasta: ${validUntil.toLocaleDateString('es-ES')}`;
    if (autoRenewStatus) {
      autoRenewStatus.hidden = false;
      autoRenewStatus.textContent = 'Se renueva automáticamente hasta que canceles';
    }
    if (membershipCta) membershipCta.hidden = true;
    if (cancelSubscriptionBtn) cancelSubscriptionBtn.hidden = false;
    return;
  }

  membershipTitle.textContent = 'Sin membresía activa';
  membershipStatus.textContent = 'Suscríbete para acceder al gimnasio';
  if (membershipCta) membershipCta.hidden = false;
  if (autoRenewStatus) autoRenewStatus.hidden = true;
  if (cancelSubscriptionBtn) cancelSubscriptionBtn.hidden = true;
}

if (cancelSubscriptionBtn) {
  cancelSubscriptionBtn.addEventListener('click', () => {
    saveState({ membershipCancelled: true });
    showToast('Suscripción cancelada');
    renderMembership();
  });
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

let pendingSubscription = null;

function openSubscriptionModal(name, amount) {
  pendingSubscription = { name, amount };
  if (subscriptionModalSummary) {
    const planName = name.replace('Suscripción ', '');
    subscriptionModalSummary.textContent = `${planName} · ${formatCurrency(amount)}/mes`;
  }
  if (cardNumber) cardNumber.value = '';
  if (cardExpiry) cardExpiry.value = '';
  if (cardCvv) cardCvv.value = '';
  if (subscriptionModalError) subscriptionModalError.hidden = true;
  if (subscriptionModal) subscriptionModal.classList.remove('is-hidden');
}

function closeSubscriptionModal() {
  pendingSubscription = null;
  if (subscriptionModal) subscriptionModal.classList.add('is-hidden');
}

paymentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.payName;
    const amount = parseFloat(button.dataset.payAmount);

    if (name.startsWith('Suscripción ')) {
      openSubscriptionModal(name, amount);
      return;
    }

    registerPayment(name, amount);
    showToast(`Pago realizado: ${name} · ${formatCurrency(amount)}`);
  });
});

if (confirmSubscriptionBtn) {
  confirmSubscriptionBtn.addEventListener('click', () => {
    const numberFilled = cardNumber && cardNumber.value.trim().length > 0;
    const expiryFilled = cardExpiry && cardExpiry.value.trim().length > 0;
    const cvvFilled = cardCvv && cardCvv.value.trim().length > 0;

    if (!numberFilled || !expiryFilled || !cvvFilled) {
      if (subscriptionModalError) subscriptionModalError.hidden = false;
      return;
    }

    if (pendingSubscription) {
      const { name, amount } = pendingSubscription;
      saveState({ membershipCancelled: false });
      registerPayment(name, amount);
      showToast(`Pago realizado: ${name} · ${formatCurrency(amount)}`);
    }
    closeSubscriptionModal();
  });
}

if (cancelSubscriptionModalBtn) {
  cancelSubscriptionModalBtn.addEventListener('click', () => {
    closeSubscriptionModal();
  });
}

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

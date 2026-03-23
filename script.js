const toast = document.querySelector('.toast');
const loginForm = document.querySelector('#login-form');
const uploadForm = document.querySelector('#upload-form');
const settingsForm = document.querySelector('#settings-form');
const profileName = document.querySelector('#profile-name');
const profileButton = document.querySelector('#profile-button');
const sessionStatus = document.querySelector('#session-status');
const notificationCount = document.querySelector('#notification-count');
const analyticsCards = document.querySelector('#analytics-cards');
const securityHighlights = document.querySelector('#security-highlights');
const scriptList = document.querySelector('#script-list');
const builderPalette = document.querySelector('#builder-palette');
const builderCanvas = document.querySelector('#builder-canvas');
const securitySettings = document.querySelector('#security-settings');
const analyticsEvents = document.querySelector('#analytics-events');
const regionList = document.querySelector('#region-list');
const tagline = document.querySelector('#tagline');
const scriptSearch = document.querySelector('#script-search');
const openLogin = document.querySelector('#open-login');

const state = {
  scripts: [],
  uiBuilder: { palette: [], canvas: [] }
};

function showToast(message, isError = false) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add('is-visible');
  toast.classList.toggle('toast--error', isError);

  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.classList.remove('toast--error');
  }, 3000);
}

function renderAnalyticsCards(cards) {
  analyticsCards.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card card card--inset">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <p>${card.detail}</p>
        </article>
      `
    )
    .join('');
}

function renderSecurityHighlights(items) {
  securityHighlights.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function renderScripts(filter = '') {
  const filtered = state.scripts.filter((script) => {
    const haystack = `${script.name} ${script.description} ${script.visibility}`.toLowerCase();
    return haystack.includes(filter.toLowerCase());
  });

  scriptList.innerHTML = filtered
    .map(
      (script) => `
        <article class="script-row card card--inset">
          <div>
            <h3>${script.name}</h3>
            <p>${script.description}</p>
            <div class="pill-row">
              <span class="pill">${script.visibility}</span>
              <span class="pill">${script.environment}</span>
              <span class="pill">${script.activeVersion}</span>
              <span class="pill">${script.status}</span>
            </div>
          </div>
          <div class="script-row__meta">
            <span><strong>Reference:</strong> ${script.reference}</span>
            <span><strong>Updated:</strong> ${script.lastUpdated}</span>
            <span><strong>Versions:</strong> ${script.versions.join(', ')}</span>
            <div class="button-row">
              <button class="button button--ghost action-button" data-action="toggleVisibility" data-id="${script.id}" type="button">Toggle visibility</button>
              <button class="button button--ghost action-button" data-action="regenerateReference" data-id="${script.id}" type="button">Regenerate reference</button>
              <button class="button button--ghost action-button" data-action="rollbackVersion" data-id="${script.id}" type="button">Rollback</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderBuilder(builder) {
  state.uiBuilder = builder;
  builderPalette.innerHTML = builder.palette
    .map(
      (item) => `<button class="builder-chip" data-type="${item}" type="button">Add ${item}</button>`
    )
    .join('');

  builderCanvas.innerHTML = builder.canvas
    .map(
      (item) => `
        <div class="canvas-card">
          <strong>${item.type}</strong>
          <span>${item.label}</span>
          <small>${item.action}</small>
        </div>
      `
    )
    .join('');
}

function renderSecuritySettings(settings) {
  securitySettings.innerHTML = Object.entries(settings.security)
    .map(
      ([key, value]) => `
        <div class="settings-item card card--inset">
          <strong>${key}</strong>
          <span>${String(value)}</span>
        </div>
      `
    )
    .join('');

  settingsForm.elements.twoFactorEnabled.checked = settings.security.twoFactorEnabled;
  settingsForm.elements.deviceTracking.checked = settings.security.deviceTracking;
  settingsForm.elements.liveUpdates.checked = settings.platform.liveUpdates;
  settingsForm.elements.aiAnalyzer.checked = settings.platform.aiAnalyzer;
}

function renderAnalytics(analytics) {
  analyticsEvents.innerHTML = analytics.events.map((item) => `<li>${item}</li>`).join('');
  regionList.innerHTML = analytics.regions
    .map(
      (item) => `
        <div class="region-row">
          <span>${item.region}</span>
          <strong>${item.traffic}</strong>
        </div>
      `
    )
    .join('');
}

function renderSession(session) {
  profileName.textContent = session.user.name;
  notificationCount.textContent = session.user.notifications;
  sessionStatus.textContent = session.authenticated ? 'Signed in' : 'Signed out';
  sessionStatus.classList.toggle('status-pill--accent', session.authenticated);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

async function loadAppState() {
  const data = await fetchJson('/api/app-state');
  state.scripts = data.scripts;
  tagline.textContent = data.tagline;
  renderAnalyticsCards(data.analytics.cards);
  renderSecurityHighlights(data.securityHighlights);
  renderScripts();
  renderBuilder(data.uiBuilder);
  renderSecuritySettings(data.settings);
  renderAnalytics(data.analytics);
  renderSession(data.session);
}

async function updateScript(id, action) {
  const data = await fetchJson(`/api/scripts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });

  state.scripts = state.scripts.map((script) => (script.id === id ? data.script : script));
  renderScripts(scriptSearch.value);
  showToast(data.message);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(loginForm).entries());

  try {
    const data = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    renderSession(data.session);
    showToast(data.message);
  } catch (error) {
    showToast(error.message, true);
  }
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(uploadForm).entries());

  try {
    const data = await fetchJson('/api/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    state.scripts.unshift(data.script);
    uploadForm.reset();
    renderScripts(scriptSearch.value);
    showToast(data.message);
  } catch (error) {
    showToast(error.message, true);
  }
});

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(settingsForm);
  const payload = {
    twoFactorEnabled: formData.get('twoFactorEnabled') === 'on',
    deviceTracking: formData.get('deviceTracking') === 'on',
    liveUpdates: formData.get('liveUpdates') === 'on',
    aiAnalyzer: formData.get('aiAnalyzer') === 'on'
  };

  try {
    const data = await fetchJson('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    renderSecuritySettings(data.settings);
    showToast(data.message);
  } catch (error) {
    showToast(error.message, true);
  }
});

scriptList.addEventListener('click', (event) => {
  const target = event.target.closest('.action-button');
  if (!target) {
    return;
  }

  updateScript(target.dataset.id, target.dataset.action).catch((error) => {
    showToast(error.message, true);
  });
});

builderPalette.addEventListener('click', async (event) => {
  const target = event.target.closest('.builder-chip');
  if (!target) {
    return;
  }

  try {
    const data = await fetchJson('/api/ui-builder/components', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: target.dataset.type })
    });
    renderBuilder(data.uiBuilder);
    showToast(data.message);
  } catch (error) {
    showToast(error.message, true);
  }
});

scriptSearch.addEventListener('input', (event) => {
  renderScripts(event.target.value);
});

openLogin.addEventListener('click', () => {
  document.querySelector('#auth').scrollIntoView({ behavior: 'smooth' });
  loginForm.elements.email.focus();
});

profileButton.addEventListener('click', () => {
  showToast('Profile menu is a visual stub in this prototype.');
});

loadAppState().catch((error) => {
  showToast(error.message, true);
});

const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__links');
const toast = document.querySelector('.toast');
const heroStats = document.querySelector('#hero-stats');
const dashboardMetrics = document.querySelector('#dashboard-metrics');
const integrationsList = document.querySelector('#integrations-list');
const releaseTable = document.querySelector('#release-table');
const auditFeed = document.querySelector('#audit-feed');
const moduleGrid = document.querySelector('#module-grid');
const integrationBullets = document.querySelector('#integration-bullets');
const waitlistForm = document.querySelector('#waitlist-form');
const waitlistCount = document.querySelector('#waitlist-count');

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
  }, 3200);
}

function renderMetricCards(items, container) {
  if (!container) {
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <div>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          ${item.detail ? `<p>${item.detail}</p>` : ''}
        </div>
      `
    )
    .join('');
}

function renderIntegrations(items) {
  if (!integrationsList || !integrationBullets) {
    return;
  }

  integrationsList.innerHTML = items
    .slice(0, 4)
    .map(
      (item, index) => `
        <div>
          <span>Integration ${index + 1}</span>
          <strong>${item}</strong>
        </div>
      `
    )
    .join('');

  integrationBullets.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function renderReleases(items) {
  if (!releaseTable) {
    return;
  }

  releaseTable.innerHTML = `
    <div class="release-table__head">
      <span>Version</span>
      <span>Channel</span>
      <span>Date</span>
      <span>Notes</span>
    </div>
    ${items
      .map(
        (item) => `
          <div class="release-table__row">
            <strong>${item.version}</strong>
            <span>${item.channel}</span>
            <span>${item.date}</span>
            <span>${item.notes}</span>
          </div>
        `
      )
      .join('')}
  `;
}

function renderAuditFeed(items) {
  if (!auditFeed) {
    return;
  }

  auditFeed.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function renderModules(items) {
  if (!moduleGrid) {
    return;
  }

  moduleGrid.innerHTML = items
    .map(
      (item) => `
        <article class="card module-card">
          <h3>${item.name}</h3>
          <p>${item.summary}</p>
        </article>
      `
    )
    .join('');
}

async function loadDashboard() {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('Unable to load dashboard data.');
  }

  const data = await response.json();
  renderMetricCards(data.heroStats, heroStats);
  renderMetricCards(data.metrics, dashboardMetrics);
  renderIntegrations(data.integrations);
  renderReleases(data.releases);
  renderAuditFeed(data.auditFeed);
  renderModules(data.modules);
}

async function refreshWaitlistCount() {
  if (!waitlistCount) {
    return;
  }

  const response = await fetch('/api/waitlist');
  if (!response.ok) {
    throw new Error('Unable to load waitlist count.');
  }

  const data = await response.json();
  waitlistCount.textContent = `Waitlist count: ${data.total}`;
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('is-open', !expanded);
    document.body.classList.toggle('menu-open', !expanded);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });
}

if (waitlistForm) {
  waitlistForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(waitlistForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }

      waitlistForm.reset();
      waitlistCount.textContent = `Waitlist count: ${data.total}`;
      showToast(`${data.message} You are entry #${data.entry.id}.`);
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

Promise.all([loadDashboard(), refreshWaitlistCount()]).catch((error) => {
  showToast(error.message, true);
});

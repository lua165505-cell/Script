const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const session = {
  authenticated: false,
  user: {
    name: 'Avery Studio',
    email: 'avery@scriptvault.dev',
    role: 'Admin',
    twoFactorEnabled: true,
    devices: ['Studio Desktop · US-East', 'MacBook Pro · UTC'],
    notifications: 3
  }
};

const scripts = [
  {
    id: 'vault-ui',
    name: 'Vault UI Toolkit',
    visibility: 'Private',
    status: 'Healthy',
    environment: 'Production',
    lastUpdated: '2026-03-23',
    versions: ['v3', 'v2', 'v1'],
    activeVersion: 'v3',
    reference: 'sv://vault-ui/stable',
    description: 'Reusable creator console module bundle for approved Roblox places.'
  },
  {
    id: 'ops-tools',
    name: 'Operations Tools',
    visibility: 'Team',
    status: 'Reviewing',
    environment: 'Staging',
    lastUpdated: '2026-03-22',
    versions: ['v7', 'v6', 'v5'],
    activeVersion: 'v7',
    reference: 'sv://ops-tools/beta',
    description: 'Internal moderation and telemetry helpers with scoped access rules.'
  }
];

const analytics = {
  cards: [
    { label: 'Total launches', value: '184.2K', detail: 'Approved module starts across connected experiences.' },
    { label: 'Active teams', value: '42', detail: 'Studios currently using role-based workspaces.' },
    { label: 'Blocked attempts', value: '312', detail: 'Denied requests from invalid tokens or expired sessions.' },
    { label: 'Avg. latency', value: '92ms', detail: 'Median response time for protected module metadata.' }
  ],
  events: [
    'Production token rotated successfully for Vault UI Toolkit.',
    'Design team published a new Creator Console UI preset.',
    'A login attempt from a new IP required step-up verification.',
    'Staging deployment for Operations Tools passed release review.'
  ],
  regions: [
    { region: 'US-East', traffic: '41%' },
    { region: 'EU-West', traffic: '27%' },
    { region: 'Asia Pacific', traffic: '19%' },
    { region: 'South America', traffic: '13%' }
  ]
};

const settings = {
  security: {
    twoFactorEnabled: true,
    deviceTracking: true,
    rateLimitProfile: 'Standard',
    captchaProtection: true
  },
  platform: {
    aiAnalyzer: true,
    multiRegionDelivery: true,
    apiKeyRotationDays: 30,
    liveUpdates: true
  }
};

const uiBuilder = {
  palette: ['Button', 'Toggle', 'Slider', 'Dropdown'],
  canvas: [
    { id: 1, type: 'Button', label: 'Launch panel', action: 'Open team console' },
    { id: 2, type: 'Toggle', label: 'Enable telemetry', action: 'Set analytics flag' }
  ]
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getAppState() {
  return {
    tagline: 'Invisible code. Visible power.',
    session,
    scripts,
    analytics,
    settings,
    uiBuilder,
    securityHighlights: [
      'Email/password sign-in with mock JWT session state',
      'Optional Google / Discord OAuth placeholders',
      '2FA, device tracking, rate-limited login attempts, and captcha-ready settings',
      'Role-based workspaces, audit visibility, and safe module references for approved projects'
    ]
  };
}

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/app-state') {
    sendJson(res, 200, getAppState());
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/auth/session') {
    sendJson(res, 200, session);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const body = await collectBody(req);
      const email = String(body.email || '').trim();
      const password = String(body.password || '').trim();

      if (!email || !password) {
        sendJson(res, 400, { error: 'email and password are required.' });
        return true;
      }

      session.authenticated = true;
      session.user.email = email;
      sendJson(res, 200, {
        message: 'Signed in to the demo workspace.',
        token: 'demo-jwt-session-token',
        session
      });
      return true;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }
  }

  if (req.method === 'GET' && pathname === '/api/scripts') {
    sendJson(res, 200, { scripts });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/scripts') {
    try {
      const body = await collectBody(req);
      const name = String(body.name || '').trim();
      const visibility = String(body.visibility || 'Private').trim();
      const description = String(body.description || '').trim();

      if (!name || !description) {
        sendJson(res, 400, { error: 'name and description are required.' });
        return true;
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const script = {
        id,
        name,
        visibility,
        status: 'Draft',
        environment: 'Staging',
        lastUpdated: new Date().toISOString().slice(0, 10),
        versions: ['v1'],
        activeVersion: 'v1',
        reference: `sv://${id}/draft`,
        description
      };

      scripts.unshift(script);
      sendJson(res, 201, { message: 'Script added to the dashboard.', script });
      return true;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/scripts/')) {
    try {
      const id = pathname.split('/').pop();
      const script = scripts.find((entry) => entry.id === id);
      if (!script) {
        sendJson(res, 404, { error: 'Script not found.' });
        return true;
      }

      const body = await collectBody(req);
      const action = String(body.action || '').trim();

      if (action === 'toggleVisibility') {
        script.visibility = script.visibility === 'Private' ? 'Team' : 'Private';
      } else if (action === 'regenerateReference') {
        script.reference = `sv://${script.id}/${Math.random().toString(36).slice(2, 8)}`;
      } else if (action === 'rollbackVersion') {
        script.activeVersion = script.versions[script.versions.length - 1];
        script.status = 'Rolled back';
      } else {
        sendJson(res, 400, { error: 'Unsupported action.' });
        return true;
      }

      script.lastUpdated = new Date().toISOString().slice(0, 10);
      sendJson(res, 200, { message: 'Script updated.', script });
      return true;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }
  }

  if (req.method === 'GET' && pathname === '/api/analytics') {
    sendJson(res, 200, analytics);
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/settings') {
    sendJson(res, 200, settings);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/settings') {
    try {
      const body = await collectBody(req);
      settings.security.twoFactorEnabled = Boolean(body.twoFactorEnabled);
      settings.security.deviceTracking = Boolean(body.deviceTracking);
      settings.platform.liveUpdates = Boolean(body.liveUpdates);
      settings.platform.aiAnalyzer = Boolean(body.aiAnalyzer);

      sendJson(res, 200, { message: 'Settings saved.', settings });
      return true;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }
  }

  if (req.method === 'POST' && pathname === '/api/ui-builder/components') {
    try {
      const body = await collectBody(req);
      const type = String(body.type || '').trim();
      if (!type) {
        sendJson(res, 400, { error: 'type is required.' });
        return true;
      }

      const component = {
        id: Date.now(),
        type,
        label: `${type} component`,
        action: 'Custom action binding'
      };
      uiBuilder.canvas.push(component);
      sendJson(res, 201, { message: 'Component added to builder.', component, uiBuilder });
      return true;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith('/api/')) {
    const handled = await handleApi(req, res, pathname);
    if (!handled) {
      sendJson(res, 404, { error: 'API route not found' });
    }
    return;
  }

  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(ROOT, relativePath);
  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`ScriptVault server running at http://127.0.0.1:${PORT}`);
});

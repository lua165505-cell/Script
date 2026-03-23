const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const waitlist = [];

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

const dashboardData = {
  heroStats: [
    {
      label: 'Protected delivery',
      value: '12 projects',
      detail: 'Private modules served through authenticated environment-specific endpoints.'
    },
    {
      label: 'Release velocity',
      value: '28 deploys / week',
      detail: 'Stable and beta channels keep teams shipping without changing game-side references.'
    },
    {
      label: 'Team visibility',
      value: '4 workspaces',
      detail: 'Shared dashboards for engineers, designers, and producers managing live content.'
    }
  ],
  metrics: [
    { label: 'Requests', value: '184.2K' },
    { label: 'Latency', value: '92ms' },
    { label: 'Active places', value: '12' },
    { label: 'Signed integrations', value: '37' }
  ],
  releases: [
    { version: 'v2.4.1', channel: 'stable', date: '2026-03-23', notes: 'Improved cache invalidation and release promotion approvals.' },
    { version: 'v2.5.0-beta.2', channel: 'beta', date: '2026-03-22', notes: 'Added environment secrets rotation and UI preset snapshots.' },
    { version: 'v2.3.8', channel: 'rollback', date: '2026-03-19', notes: 'Last known-good release stored for instant rollback.' }
  ],
  auditFeed: [
    'Studio EU published vault-ui to stable.',
    'Design systems team updated the Creator Console preset.',
    'A production token was rotated automatically after 30 days.',
    'A beta rollout was paused after latency crossed the alert threshold.'
  ],
  modules: [
    {
      name: 'UI module',
      summary: 'Build authenticated in-game menus with reusable tabs, buttons, toggles, and forms.'
    },
    {
      name: 'Logic module',
      summary: 'Deliver feature logic privately to approved experiences with version pinning.'
    },
    {
      name: 'Security module',
      summary: 'Use signed tokens, release approvals, and environment policies to control access.'
    }
  ],
  integrations: [
    'Git sync for tagged releases',
    'Webhook alerts for deployments',
    'Audit logs with CSV export',
    'API keys with scoped permissions'
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
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream'
    });
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

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/dashboard') {
    sendJson(res, 200, dashboardData);
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/waitlist') {
    sendJson(res, 200, {
      total: waitlist.length,
      latest: waitlist.slice(-5).reverse()
    });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/waitlist') {
    try {
      const body = await collectBody(req);
      const email = String(body.email || '').trim();
      const teamSize = String(body.teamSize || '').trim();
      const useCase = String(body.useCase || '').trim();

      if (!email || !teamSize || !useCase) {
        sendJson(res, 400, { error: 'email, teamSize, and useCase are required.' });
        return true;
      }

      const entry = {
        id: waitlist.length + 1,
        email,
        teamSize,
        useCase,
        createdAt: new Date().toISOString()
      };

      waitlist.push(entry);
      sendJson(res, 201, {
        message: 'Private beta request captured.',
        entry,
        total: waitlist.length
      });
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

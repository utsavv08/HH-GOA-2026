const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Handle /api/upload-ticket
  if (req.method === 'POST' && (reqPath === '/api/upload-ticket' || reqPath === '/api/upload-pfp')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const ticketId = crypto.randomUUID();
        const base64Data = (data.image || '').replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(path.join(uploadsDir, `${ticketId}.jpg`), Buffer.from(base64Data, 'base64'));

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ ticket_id: ticketId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Upload failed' }));
      }
    });
    return;
  }

  // Handle /ticket/:id HTML view
  if (reqPath.startsWith('/ticket/')) {
    const parts = reqPath.split('/').filter(Boolean);
    const ticketId = parts[1];
    const imgPath = `/uploads/${ticketId}.jpg`;

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HH Goa 2026 Builder ID</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HH Goa 2026 Builder ID">
  <meta name="twitter:description" content="Check out my official HH Goa 2026 PFP! 🌴🚀">
  <meta name="twitter:image" content="${imgPath}">
  <style>
    body { background-color: #0B3D0B; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: 'Space Mono', monospace, sans-serif; color: #F5E6C8; }
    img { max-width: 90vw; max-height: 80vh; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); border: 2px solid rgba(255,215,0,0.3); }
    .footer-cta { margin-top: 20px; }
    .btn-make { background: #FFD700; color: #0B3D0B; font-weight: 700; padding: 10px 22px; border-radius: 8px; text-decoration: none; display: inline-block; border: 2px solid #000; box-shadow: 3px 3px 0 #FF1493; }
  </style>
</head>
<body>
  <div>
    <img src="${imgPath}" alt="HH Goa 2026 Builder ID">
  </div>
  <div class="footer-cta">
    <a href="/" class="btn-make">🚀 Make Your Own Frame</a>
  </div>
</body>
</html>`);
    return;
  }

  // Static file serving
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`HH Goa Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;

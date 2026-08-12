module.exports = async (req, res) => {
  const { id } = req.query;
  const ticketId = id || 'HH-GOA-2026';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HH Goa 2026 — Builder ID</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HH Goa 2026 Builder ID">
  <meta name="twitter:description" content="Check out my official Hacker House Goa 2026 PFP! 🌴🚀">
  <meta name="twitter:image" content="https://hh-goa-tickets.duckdns.org/uploads/${ticketId}.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #0B3D0B;
      background-image: 
        radial-gradient(ellipse at 30% 80%, rgba(82, 183, 136, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 20%, rgba(255, 215, 0, 0.08) 0%, transparent 50%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Space Mono', monospace, sans-serif;
      color: #F5E6C8;
      padding: 24px;
      text-align: center;
    }
    .viewer-card {
      background: rgba(11, 61, 11, 0.85);
      border: 2px solid #FFD700;
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .badge {
      display: inline-block;
      background: #FFD700;
      color: #0B3D0B;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 14px;
      border-radius: 20px;
      letter-spacing: 1.5px;
      margin-bottom: 14px;
    }
    .title {
      font-size: clamp(20px, 3vw, 24px);
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 12px;
      color: rgba(245, 230, 200, 0.7);
      margin-bottom: 20px;
      word-break: break-all;
    }
    .frame-container {
      position: relative;
      width: 100%;
      max-width: 380px;
      aspect-ratio: 1/1;
      margin: 0 auto 24px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 2px solid rgba(255, 215, 0, 0.3);
      background: #000000;
    }
    .frame-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .btn-create {
      display: inline-block;
      background: #FFD700;
      color: #0B3D0B;
      font-weight: 700;
      font-size: 13.5px;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      border: 2px solid #000000;
      box-shadow: 3px 3px 0px #FF1493;
      transition: transform 0.15s ease;
    }
    .btn-create:hover {
      transform: translate(-1px, -1px);
    }
    .footer-text {
      margin-top: 24px;
      font-size: 11px;
      letter-spacing: 2px;
      color: rgba(245, 230, 200, 0.5);
    }
  </style>
</head>
<body>
  <div class="viewer-card">
    <div class="badge">🌴 HH GOA 2026</div>
    <h1 class="title">Builder PFP Claimed</h1>
    <p class="subtitle">Ticket ID: ${ticketId}</p>

    <div class="frame-container">
      <img src="https://hh-goa-tickets.duckdns.org/uploads/${ticketId}.jpg" onerror="this.onerror=null; this.src='/assets/goa_frame_art.jpg';" alt="HH Goa 2026 PFP">
    </div>

    <div>
      <a href="/" class="btn-create">🚀 CREATE YOUR OWN PFP</a>
    </div>

    <p class="footer-text">GOA, INDIA • 28–31 OCT 2026</p>
  </div>
</body>
</html>`);
};

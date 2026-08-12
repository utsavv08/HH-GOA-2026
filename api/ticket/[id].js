module.exports = async (req, res) => {
  const { id } = req.query;
  const ticketId = id || '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HH Goa 2026 PFP</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HH Goa 2026 PFP">
  <meta name="twitter:description" content="Check out my official HH Goa 2026 PFP! 🌴🚀">
  <meta name="twitter:image" content="https://hh-goa-tickets.duckdns.org/uploads/${ticketId}.jpg">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    img {
      max-width: 96vw;
      max-height: 96vh;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      background-color: #000000;
    }
  </style>
</head>
<body>
  <img id="pfp-img" src="https://hh-goa-tickets.duckdns.org/uploads/${ticketId}.jpg" alt="HH Goa 2026 PFP">
  <script>
    const img = document.getElementById('pfp-img');
    const localImg = localStorage.getItem('hh_goa_pfp_saved') || localStorage.getItem('last_pfp_image');
    img.onerror = () => {
      if (localImg) {
        img.src = localImg;
      }
    };
  </script>
</body>
</html>`);
};

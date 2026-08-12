const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const image = body.image;

      // Try forwarding to the official ticket cloud backend
      if (image && typeof fetch !== 'undefined') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        try {
          const upstream = await fetch('https://hh-goa-tickets.duckdns.org/api/upload-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (upstream.ok) {
            const data = await upstream.json();
            if (data && data.ticket_id) {
              return res.status(200).json({ 
                ticket_id: data.ticket_id,
                ticket_url: `https://hh-goa-tickets.duckdns.org/ticket/${data.ticket_id}` 
              });
            }
          }
        } catch (e) {
          clearTimeout(timeoutId);
        }
      }

      // Fallback ticket ID
      const fallbackId = crypto.randomUUID();
      return res.status(200).json({ ticket_id: fallbackId });
    } catch (e) {
      return res.status(200).json({ ticket_id: crypto.randomUUID() });
    }
  }

  return res.status(200).json({ status: 'API is running' });
};

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
      const ticketId = crypto.randomUUID();
      return res.status(200).json({ ticket_id: ticketId });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to generate ticket' });
    }
  }

  return res.status(200).json({ status: 'API is running' });
};

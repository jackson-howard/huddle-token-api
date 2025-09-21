import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // CORS for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }

    const { room, identity } = body || {};
    if (!room || !identity || !String(identity).trim()) {
      return res.status(400).json({ error: 'room and identity required' });
    }

    // livekit-server-sdk v2 signature: (apiKey, apiSecret, options)
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: String(identity).trim(), ttl: 3600 }
    );

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'internal' });
  }
}

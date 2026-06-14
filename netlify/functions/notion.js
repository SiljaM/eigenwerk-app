const NOTION_VERSION = '2022-06-28';
const BASE = 'https://api.notion.com/v1';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let req;
  try { req = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Ungültiger Body' }) }; }

  // Token: aus Request (Client) oder Netlify Env Variable, sonst eingebetteter Fallback
  const _fb = Buffer.from('bnRuXzQ5MTgyODMxMzQzN0hiRjZoTHJ5Z2VhdXRBbE13RGpwbHJLckJZVXpnTU9mdFJv','base64').toString();
  const token = req.token || process.env.NOTION_TOKEN || _fb;
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Kein Notion Token – bitte in App-Einstellungen eingeben' }) };
  }

  const { path, method = 'GET', body } = req;
  if (!path) return { statusCode: 400, body: JSON.stringify({ error: 'path fehlt' }) };

  try {
    const res = await fetch(`${BASE}/${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

// api/atracciones.js
// Lee y escribe atracciones.json en tu repo de GitHub via API
//
// Variables de entorno necesarias en Vercel:
//   GITHUB_TOKEN   → Personal Access Token (repo scope)
//   GITHUB_OWNER   → tu usuario GitHub, ej: "miusuario"
//   GITHUB_REPO    → nombre del repo, ej: "parkatlas"
//   GITHUB_FILE    → ruta al JSON dentro del repo, ej: "public/atracciones.json"

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_FILE = 'public/atracciones.json'
} = process.env;

const GH_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

const ghHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json'
};

async function getFile() {
  const res = await fetch(GH_API, { headers: ghHeaders });
  if (!res.ok) throw new Error(`GitHub GET error: ${res.status}`);
  const meta = await res.json();
  const content = Buffer.from(meta.content, 'base64').toString('utf8');
  return { data: JSON.parse(content), sha: meta.sha };
}

async function putFile(data, sha, message = 'Update atracciones.json') {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const res = await fetch(GH_API, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({ message, content, sha })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT error: ${res.status} — ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── GET /api/atracciones ──────────────────────────
    if (req.method === 'GET') {
      const { data } = await getFile();
      return res.status(200).json(data);
    }

    // ── POST /api/atracciones  (añadir) ──────────────
    if (req.method === 'POST') {
      const item = req.body;
      if (!item || !item.name || !item.park) {
        return res.status(400).json({ error: 'name y park son obligatorios' });
      }
      const { data, sha } = await getFile();
      item.id = Date.now();
      const newData = [item, ...data];
      await putFile(newData, sha, `Add: ${item.name}`);
      return res.status(201).json(item);
    }

    // ── PUT /api/atracciones  (editar) ────────────────
    if (req.method === 'PUT') {
      const item = req.body;
      if (!item || !item.id) {
        return res.status(400).json({ error: 'id es obligatorio' });
      }
      const { data, sha } = await getFile();
      const idx = data.findIndex(a => a.id === item.id);
      if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
      data[idx] = { ...data[idx], ...item };
      await putFile(data, sha, `Edit: ${item.name}`);
      return res.status(200).json(data[idx]);
    }

    // ── DELETE /api/atracciones?id=xxx ────────────────
    if (req.method === 'DELETE') {
      const id = parseInt(req.query.id);
      if (!id) return res.status(400).json({ error: 'id es obligatorio' });
      const { data, sha } = await getFile();
      const newData = data.filter(a => a.id !== id);
      if (newData.length === data.length) {
        return res.status(404).json({ error: 'No encontrado' });
      }
      await putFile(newData, sha, `Delete id:${id}`);
      return res.status(200).json({ deleted: id });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

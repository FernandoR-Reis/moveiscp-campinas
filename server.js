const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { categories: [], products: [], settings: {} };
  }
}

async function writeDb(data) {
  const payload = {
    categories: Array.isArray(data.categories) ? data.categories : [],
    products: Array.isArray(data.products) ? data.products : [],
    settings: data.settings || {},
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(DB_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'moveiscp-backend', time: new Date().toISOString() });
});

app.get('/api/state', async (_, res) => {
  const db = await readDb();
  res.json(db);
});

app.put('/api/state', async (req, res) => {
  const { categories, products, settings } = req.body || {};
  if (!Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'categories e products são obrigatórios.' });
  }
  const saved = await writeDb({ categories, products, settings });
  res.json({ ok: true, state: saved });
});

app.listen(PORT, () => {
  console.log(`Backend provisório rodando em http://localhost:${PORT}`);
});

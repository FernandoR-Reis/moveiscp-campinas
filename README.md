# MóveisCP

Site institucional e catálogo online para loja de móveis, agora com backend provisório em Node.js e banco de dados em JSON.

## Estrutura
- `index.html` — páginas e marcação
- `assets/css/styles.css` — estilos
- `assets/js/data.js` — dados iniciais e fallback local
- `assets/js/app.js` — lógica de interface e integração com API
- `server.js` — backend provisório
- `db.json` — banco provisório em JSON

## Como rodar o backend
1. Instale as dependências:
   - `npm install`
2. Inicie o servidor:
   - `npm start`
3. Acesse:
   - `http://localhost:3001`

## API disponível
- `GET /api/health`
- `GET /api/state`
- `PUT /api/state`

## Como rodar sem backend
Abra `index.html` no navegador. O site usa fallback com `localStorage` se a API não estiver disponível.

## Publicar no GitHub Pages
O GitHub Pages publica apenas o front-end. Para manter backend e banco online, será necessário hospedar o servidor em outro serviço, como Render, Railway, Fly.io ou VPS.

## Observação
O banco `db.json` é provisório e serve para desenvolvimento e demonstração. Para produção, o ideal é migrar para PostgreSQL, MySQL ou Prisma com banco gerenciado.

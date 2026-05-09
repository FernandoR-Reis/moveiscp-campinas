# MóveisCP

Site institucional e catálogo online para loja de móveis, com páginas de catálogo, produto, formulário e painel administrativo demonstrativo.

## Estrutura
- `index.html` — páginas e marcação
- `assets/css/styles.css` — estilos
- `assets/js/data.js` — dados e persistência local
- `assets/js/app.js` — lógica de interface

## Como rodar
Abra `index.html` no navegador ou use uma extensão de servidor local no VS Code.

## Publicar no GitHub Pages
1. Crie um repositório no GitHub.
2. Envie estes arquivos para a branch principal.
3. Vá em Settings > Pages.
4. Em Build and deployment, selecione:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
5. Salve e aguarde a URL do GitHub Pages.

O endereço normalmente fica no formato:
`https://seu-usuario.github.io/nome-do-repositorio/`

## Observação
O painel administrativo e os dados usam `localStorage`. Isso funciona bem para demonstração, mas para produção real será necessário um backend.

# MóveisCP

Site institucional e catálogo online para loja de móveis, publicado de forma estática no GitHub Pages.

## Estrutura
- `index.html` — páginas e marcação
- `assets/css/styles.css` — estilos
- `assets/js/data.js` — dados iniciais
- `assets/js/app.js` — lógica de interface

## Banco de dados provisório
O projeto usa `localStorage` como banco provisório no navegador:
- categorias em `mcp_cats`
- produtos em `mcp_prods`

Isso permite cadastro/edição no painel admin sem backend.

## Como rodar localmente
Abra `index.html` no navegador.

## Domínio no GitHub
Site online no domínio provisório do GitHub Pages:
https://fernandor-reis.github.io/moveiscp-campinas/

## Observação
As alterações salvas no painel admin ficam no navegador do usuário (localStorage). Para ambiente real com dados compartilhados, será necessário backend e banco gerenciado.

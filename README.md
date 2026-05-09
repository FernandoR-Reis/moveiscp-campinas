# MóveisCP

Site institucional e catálogo online para loja de móveis, publicado de forma estática no GitHub Pages.

## Estrutura
- `index.html` — páginas e marcação
- `assets/css/styles.css` — estilos e ajustes de acessibilidade
- `assets/js/data.js` — configuração e dados iniciais (seed)
- `assets/js/app.js` — estado, renderização e interações da interface

## Banco de dados provisório
O projeto usa `localStorage` como banco provisório no navegador:
- categorias em `mcp_cats`
- produtos em `mcp_prods`
- sessão demo do painel em `mcp_admin_demo`

Isso permite cadastro/edição no painel admin sem backend.
> O painel administrativo é **somente DEMO local** e não representa autenticação real.

## Como rodar localmente
Abra `index.html` no navegador.

## Domínio no GitHub
Site online no domínio provisório do GitHub Pages:
https://fernandor-reis.github.io/moveiscp-campinas/

## Observação
As alterações salvas no painel admin ficam no navegador do usuário (localStorage). Para ambiente real com dados compartilhados, será necessário backend e banco gerenciado.

## Limitações atuais (projeto estático)
- Não existe autenticação real (sem backend e sem controle de sessão no servidor).
- Dados do catálogo não são compartilhados entre dispositivos/navegadores.
- Não há trilha de auditoria, permissões por usuário ou backup centralizado.
- Alterações no painel demo podem ser manipuladas localmente pelo usuário.

## Próximos passos para produção com backend
1. Criar API para catálogo/produtos/categorias com banco gerenciado.
2. Implementar autenticação real (sessão/token no servidor).
3. Aplicar controle de permissões para operações administrativas.
4. Persistir mídia/imagens em storage gerenciado com validação no backend.
5. Adicionar observabilidade (logs, métricas e auditoria de alterações).

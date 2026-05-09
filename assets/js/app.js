let currentProduct = null;
let editingProductId = null;
let editingCatId = null;
let adminLoggedIn = localStorage.getItem('mcp_admin') === '1';

function saveData() {
  localStorage.setItem('mcp_cats', JSON.stringify(categories));
  localStorage.setItem('mcp_prods', JSON.stringify(products));
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const showNavbar = !['admin-login', 'admin'].includes(page);
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.style.display = showNavbar ? '' : 'none';

  if (page === 'home') {
    document.getElementById('page-home').classList.add('active');
    renderHomeCategories();
    renderFeaturedProducts();
  } else if (page === 'catalog') {
    document.getElementById('page-catalog').classList.add('active');
    initCatalogFilters();
    renderCatalog();
  } else if (page === 'product') {
    document.getElementById('page-product').classList.add('active');
    renderProductDetail();
  } else if (page === 'admin-login') {
    document.getElementById('page-admin-login').classList.add('active');
    if (adminLoggedIn) { goTo('admin'); return; }
  } else if (page === 'admin') {
    if (!adminLoggedIn) { goTo('admin-login'); return; }
    document.getElementById('page-admin').classList.add('active');
    renderAdminDashboard();
    renderAdminProducts();
    renderAdminCats();
    populatePmCat();
  }
  window.scrollTo(0, 0);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  else goTo('home');
}

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
});

function toggleMobileMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
}

function openWhatsApp(productName) {
  const msg = productName
    ? `Olá, gostaria de orçamento do produto: *${productName}*`
    : 'Olá, gostaria de informações e orçamento sobre os móveis disponíveis.';
  window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function renderHomeCategories() {
  const el = document.getElementById('categoriesHome');
  if (!el) return;
  el.innerHTML = categories.map(c => `
    <div class="cat-card" onclick="filterCatalog('${c.name}')">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-name">${c.name}</div>
    </div>
  `).join('');
}

function productCardHTML(p) {
  const badge = p.promo ? '<span class="product-card-badge badge-promo">Promoção</span>'
    : p.novo ? '<span class="product-card-badge badge-new">Lançamento</span>'
    : p.destaque ? '<span class="product-card-badge badge-dest">Destaque</span>' : '';
  const availText = p.disponivel ? '' : '<div style="position:absolute;inset:0;background:rgba(250,248,245,0.6);display:flex;align-items:center;justify-content:center;"><span style="background:var(--dark);color:white;padding:6px 14px;border-radius:50px;font-size:0.75rem;font-weight:600;">Fora de estoque</span></div>';
  return `
  <div class="product-card" onclick="openProduct(${p.id})">
    <div class="product-card-img">
      <div style="font-size:3rem;opacity:0.18;">🪑</div>
      ${badge}
      ${availText}
    </div>
    <div class="product-card-body">
      <div class="product-card-cat">${p.cat}</div>
      <div class="product-card-name">${p.name}</div>
      <div class="product-card-code">Cód: ${p.code}</div>
      <div class="product-card-actions">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openProduct(${p.id})">Ver detalhes</button>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openWhatsApp('${p.name}')">💬 Orçamento</button>
      </div>
    </div>
  </div>`;
}

function renderFeaturedProducts() {
  const featured = products.filter(p => p.destaque && p.disponivel).slice(0, 4);
  const el = document.getElementById('featuredProducts');
  if (!el) return;
  el.innerHTML = featured.map(p => productCardHTML(p)).join('');
}

function initCatalogFilters() {
  const sel = document.getElementById('filterCat');
  if (!sel) return;
  sel.innerHTML = '<option value="">Todas as categorias</option>' +
    categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function filterCatalog(catName) {
  goTo('catalog');
  setTimeout(() => {
    const sel = document.getElementById('filterCat');
    if (sel) sel.value = catName;
    renderCatalog();
  }, 50);
}

function renderCatalog() {
  const q = (document.getElementById('catalogSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('filterCat')?.value || '';
  const mat = document.getElementById('filterMat')?.value || '';
  const disp = document.getElementById('filterDisp')?.value || '';

  const filtered = products.filter(p => {
    if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    if (cat && p.cat !== cat) return false;
    if (mat && p.mat !== mat) return false;
    if (disp === 'disponivel' && !p.disponivel) return false;
    if (disp === 'indisponivel' && p.disponivel) return false;
    return true;
  });

  const info = document.getElementById('catalogInfo');
  if (info) info.textContent = `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;"><div class="no-results-icon">🔍</div><p style="font-size:1rem;font-weight:600;color:var(--dark);margin-bottom:6px;">Nenhum produto encontrado</p><p style="font-size:0.875rem;">Tente alterar os filtros ou buscar por outros termos.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
}

function openProduct(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;
  goTo('product');
}

function renderProductDetail() {
  if (!currentProduct) return;
  const p = currentProduct;
  document.getElementById('breadcrumb-product').textContent = p.name;

  const colors = (p.cores || []).map((c, i) => `<div class="color-dot${i === 0 ? ' active' : ''}" style="background:${c}" title="${c}" onclick="this.parentElement.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('active'));this.classList.add('active')"></div>`).join('');
  const availClass = p.disponivel ? 'avail-yes' : 'avail-no';
  const availText = p.disponivel ? '✅ Disponível' : '❌ Fora de estoque';

  document.getElementById('productInfo').innerHTML = `
    <div class="product-detail-cat">${p.cat}</div>
    <h1 class="product-detail-name">${p.name}</h1>
    <div class="product-detail-code">Código: ${p.code}</div>
    <span class="product-avail ${availClass}"><span class="avail-dot"></span>${availText}</span>
    <p class="product-detail-desc" style="margin-top:16px;">${p.desc}</p>
    <div class="product-specs">
      <div class="product-specs-title">Especificações</div>
      <div class="specs-grid">
        <div class="spec-item"><div class="spec-label">Medidas</div><div class="spec-value">${p.med || '—'}</div></div>
        <div class="spec-item"><div class="spec-label">Material</div><div class="spec-value">${p.mat || '—'}</div></div>
        <div class="spec-item"><div class="spec-label">Acabamento</div><div class="spec-value">${p.acab || '—'}</div></div>
        <div class="spec-item"><div class="spec-label">Categoria</div><div class="spec-value">${p.cat}</div></div>
      </div>
    </div>
    ${colors ? `<div class="product-colors"><div class="product-colors-title">Cores disponíveis</div><div class="colors-list">${colors}</div></div>` : ''}
    <div class="product-actions">
      <button class="btn btn-wpp btn-full btn-lg" onclick="openWhatsApp('${p.name}')">💬 Solicitar Orçamento via WhatsApp</button>
      <button class="btn btn-outline btn-full" onclick="document.querySelector('.orcamento-form').scrollIntoView({behavior:'smooth'})">📋 Preencher Formulário</button>
    </div>
  `;

  const thumbs = ['🪑', '📷', '🏠', '✨'].map((ic, i) => `
    <div class="gallery-thumb${i === 0 ? ' active' : ''}" onclick="this.parentElement.querySelectorAll('.gallery-thumb').forEach(t=>t.classList.remove('active'));this.classList.add('active')">${ic}</div>
  `).join('');
  document.getElementById('galleryThumbs').innerHTML = thumbs;
}

function submitForm() {
  const nome = document.getElementById('formNome')?.value.trim();
  const tel = document.getElementById('formTel')?.value.trim();
  if (!nome || !tel) { showToast('Preencha nome e telefone.', 'error'); return; }
  const prodName = currentProduct ? currentProduct.name : 'produto';
  const msg = `Olá, sou ${nome}. Gostaria de orçamento do produto: *${prodName}*. Telefone: ${tel}`;
  document.getElementById('formSuccess')?.classList.remove('hidden');
  showToast('Solicitação enviada via WhatsApp!', 'success');
  window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function doLogin() {
  const u = document.getElementById('loginUser')?.value;
  const p = document.getElementById('loginPass')?.value;
  const error = document.getElementById('loginError');
  if (u === 'admin' && p === 'admin123') {
    adminLoggedIn = true;
    localStorage.setItem('mcp_admin', '1');
    if (error) error.classList.add('hidden');
    goTo('admin');
  } else {
    error?.classList.remove('hidden');
  }
}

function doLogout() {
  adminLoggedIn = false;
  localStorage.removeItem('mcp_admin');
  goTo('home');
}

function adminTab(tab, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('admin-' + tab)?.classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'produtos') renderAdminProducts();
  if (tab === 'categorias') renderAdminCats();
  if (tab === 'dashboard') renderAdminDashboard();
}

function renderAdminDashboard() {
  const stats = document.getElementById('adminStats');
  if (stats) {
    const total = products.length;
    const disp = products.filter(p => p.disponivel).length;
    const promo = products.filter(p => p.promo).length;
    const novo = products.filter(p => p.novo).length;
    stats.innerHTML = `
      <div class="admin-stat-card"><div class="admin-stat-label">Total de produtos</div><div class="admin-stat-num">${total}</div><div class="admin-stat-sub">${disp} disponíveis</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Promoções ativas</div><div class="admin-stat-num">${promo}</div><div class="admin-stat-sub">em promoção</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Lançamentos</div><div class="admin-stat-num">${novo}</div><div class="admin-stat-sub">novos produtos</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Categorias</div><div class="admin-stat-num">${categories.length}</div><div class="admin-stat-sub">ativas</div></div>
    `;
  }
  const recent = document.getElementById('recentProductsTable');
  if (recent) {
    const last5 = [...products].slice(-5).reverse();
    recent.innerHTML = productsTableHTML(last5);
  }
}

function renderAdminProducts() {
  const q = (document.getElementById('adminSearch')?.value || '').toLowerCase();
  const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) : products;
  const el = document.getElementById('adminProductsTable');
  if (el) el.innerHTML = productsTableHTML(filtered);
}

function productsTableHTML(prods) {
  if (!prods.length) return `<div class="admin-empty"><div class="admin-empty-icon">🪑</div><p>Nenhum produto encontrado.</p></div>`;
  return `<table class="admin-table">
    <thead><tr><th>Produto</th><th>Código</th><th>Categoria</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody>
    ${prods.map(p => `<tr>
      <td><strong>${p.name}</strong></td>
      <td><span class="tag">${p.code}</span></td>
      <td>${p.cat}</td>
      <td>
        ${p.disponivel ? '<span class="status-badge status-active">Disponível</span>' : '<span class="status-badge status-archived">Indisponível</span>'}
        ${p.promo ? ' <span class="status-badge status-promo">Promo</span>' : ''}
        ${p.novo ? ' <span class="status-badge status-new">Novo</span>' : ''}
      </td>
      <td>
        <div class="admin-actions">
          <div class="admin-btn-icon" title="Editar" onclick="editProduct(${p.id})">✏️</div>
          <div class="admin-btn-icon" title="Duplicar" onclick="duplicateProduct(${p.id})">📋</div>
          <div class="admin-btn-icon" title="Visualizar" onclick="currentProduct=products.find(x=>x.id===${p.id});goTo('product')">👁️</div>
          <div class="admin-btn-icon danger" title="Excluir" onclick="deleteProduct(${p.id})">🗑️</div>
        </div>
      </td>
    </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderAdminCats() {
  const el = document.getElementById('adminCatTable');
  if (!el) return;
  el.innerHTML = `<table class="admin-table">
    <thead><tr><th>Ícone</th><th>Nome</th><th>Produtos</th><th>Ações</th></tr></thead>
    <tbody>
    ${categories.map(c => `<tr>
      <td style="font-size:1.5rem;">${c.icon}</td>
      <td><strong>${c.name}</strong></td>
      <td>${products.filter(p => p.cat === c.name).length}</td>
      <td>
        <div class="admin-actions">
          <div class="admin-btn-icon" onclick="editCat(${c.id})">✏️</div>
          <div class="admin-btn-icon danger" onclick="deleteCat(${c.id})">🗑️</div>
        </div>
      </td>
    </tr>`).join('')}
    </tbody>
  </table>`;
}

function populatePmCat() {
  const sel = document.getElementById('pm-cat');
  if (sel) sel.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function openProductModal(id) {
  editingProductId = id || null;
  populatePmCat();
  const modal = document.getElementById('productModalOverlay');
  const title = document.getElementById('productModalTitle');
  if (id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    title.textContent = 'Editar Produto';
    document.getElementById('pm-name').value = p.name;
    document.getElementById('pm-code').value = p.code;
    document.getElementById('pm-cat').value = p.cat;
    document.getElementById('pm-mat').value = p.mat;
    document.getElementById('pm-desc').value = p.desc;
    document.getElementById('pm-med').value = p.med || '';
    document.getElementById('pm-acab').value = p.acab || '';
    document.getElementById('pm-cores').value = (p.cores || []).join(', ');
    document.getElementById('pm-dest').checked = p.destaque;
    document.getElementById('pm-promo').checked = p.promo;
    document.getElementById('pm-new').checked = p.novo;
    document.getElementById('pm-disp').checked = p.disponivel;
  } else {
    title.textContent = 'Novo Produto';
    ['pm-name', 'pm-code', 'pm-desc', 'pm-med', 'pm-acab', 'pm-cores'].forEach(field => document.getElementById(field).value = '');
    document.getElementById('pm-dest').checked = true;
    document.getElementById('pm-promo').checked = false;
    document.getElementById('pm-new').checked = false;
    document.getElementById('pm-disp').checked = true;
  }
  modal.classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModalOverlay')?.classList.remove('open');
}

function editProduct(id) { openProductModal(id); }

function saveProduct() {
  const name = document.getElementById('pm-name').value.trim();
  const code = document.getElementById('pm-code').value.trim();
  if (!name || !code) { showToast('Nome e código são obrigatórios.', 'error'); return; }
  const cores = document.getElementById('pm-cores').value.split(',').map(s => s.trim()).filter(Boolean);
  const data = {
    name,
    code,
    cat: document.getElementById('pm-cat').value,
    mat: document.getElementById('pm-mat').value,
    desc: document.getElementById('pm-desc').value,
    med: document.getElementById('pm-med').value,
    acab: document.getElementById('pm-acab').value,
    cores,
    destaque: document.getElementById('pm-dest').checked,
    promo: document.getElementById('pm-promo').checked,
    novo: document.getElementById('pm-new').checked,
    disponivel: document.getElementById('pm-disp').checked,
  };
  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    products[idx] = { ...products[idx], ...data };
    showToast('Produto atualizado!', 'success');
  } else {
    data.id = Date.now();
    products.push(data);
    showToast('Produto criado!', 'success');
  }
  saveData();
  closeProductModal();
  renderAdminProducts();
  renderAdminDashboard();
}

function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  products = products.filter(p => p.id !== id);
  saveData();
  renderAdminProducts();
  renderAdminDashboard();
  showToast('Produto excluído.', '');
}

function duplicateProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const copy = { ...p, id: Date.now(), name: p.name + ' (Cópia)', code: p.code + '-C' };
  products.push(copy);
  saveData();
  renderAdminProducts();
  renderAdminDashboard();
  showToast('Produto duplicado!', 'success');
}

function openCatModal(id) {
  editingCatId = id || null;
  const modal = document.getElementById('catModalOverlay');
  if (id) {
    const c = categories.find(x => x.id === id);
    if (!c) return;
    document.getElementById('catModalTitle').textContent = 'Editar Categoria';
    document.getElementById('cm-name').value = c.name;
    document.getElementById('cm-icon').value = c.icon;
  } else {
    document.getElementById('catModalTitle').textContent = 'Nova Categoria';
    document.getElementById('cm-name').value = '';
    document.getElementById('cm-icon').value = '';
  }
  modal.classList.add('open');
}

function closeCatModal() {
  document.getElementById('catModalOverlay')?.classList.remove('open');
}

function editCat(id) { openCatModal(id); }

function saveCat() {
  const name = document.getElementById('cm-name').value.trim();
  if (!name) { showToast('Nome da categoria é obrigatório.', 'error'); return; }
  const icon = document.getElementById('cm-icon').value || '🗂️';
  if (editingCatId) {
    const idx = categories.findIndex(c => c.id === editingCatId);
    const previousName = categories[idx].name;
    categories[idx].name = name;
    categories[idx].icon = icon;
    products.forEach(p => {
      if (p.cat === previousName) p.cat = name;
    });
    showToast('Categoria atualizada!', 'success');
  } else {
    categories.push({ id: Date.now(), name, icon });
    showToast('Categoria criada!', 'success');
  }
  saveData();
  closeCatModal();
  renderAdminCats();
  populatePmCat();
  renderHomeCategories();
  initCatalogFilters();
}

function deleteCat(id) {
  if (!confirm('Excluir esta categoria?')) return;
  categories = categories.filter(c => c.id !== id);
  saveData();
  renderAdminCats();
  populatePmCat();
  renderHomeCategories();
  initCatalogFilters();
  showToast('Categoria excluída.', '');
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  goTo('home');
});

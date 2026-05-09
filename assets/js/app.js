const state = {
  categories: [],
  products: [],
  currentProduct: null,
  editingProductId: null,
  editingCatId: null,
  adminLoggedIn: localStorage.getItem(APP_CONFIG.localStorageKeys.adminDemoSession) === '1',
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeColor(value) {
  const color = String(value || '').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : '#CCCCCC';
}

function cloneItems(items) {
  return JSON.parse(JSON.stringify(items));
}

function saveData() {
  localStorage.setItem(APP_CONFIG.localStorageKeys.categories, JSON.stringify(state.categories));
  localStorage.setItem(APP_CONFIG.localStorageKeys.products, JSON.stringify(state.products));
}

function loadData() {
  const storedCategories = JSON.parse(localStorage.getItem(APP_CONFIG.localStorageKeys.categories) || 'null');
  const storedProducts = JSON.parse(localStorage.getItem(APP_CONFIG.localStorageKeys.products) || 'null');
  state.categories = Array.isArray(storedCategories) ? storedCategories : cloneItems(INITIAL_CATEGORIES);
  state.products = Array.isArray(storedProducts) ? storedProducts : cloneItems(INITIAL_PRODUCTS);
}

function setMobileMenu(open) {
  const menu = $('mobileMenu');
  const btn = $('mobileBtn');
  if (!menu || !btn) return;
  menu.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function toggleMobileMenu() {
  const menu = $('mobileMenu');
  if (!menu) return;
  setMobileMenu(!menu.classList.contains('open'));
}

function closeMobileMenu() {
  setMobileMenu(false);
}

function goTo(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const showNavbar = !['admin-login', 'admin'].includes(page);
  const navbar = $('navbar');
  if (navbar) navbar.style.display = showNavbar ? '' : 'none';

  if (page === 'home') {
    $('page-home')?.classList.add('active');
    renderHomeCategories();
    renderFeaturedProducts();
  } else if (page === 'catalog') {
    $('page-catalog')?.classList.add('active');
    initCatalogFilters();
    renderCatalog();
  } else if (page === 'product') {
    $('page-product')?.classList.add('active');
    renderProductDetail();
  } else if (page === 'admin-login') {
    $('page-admin-login')?.classList.add('active');
    if (state.adminLoggedIn) {
      goTo('admin');
      return;
    }
  } else if (page === 'admin') {
    if (!state.adminLoggedIn) {
      goTo('admin-login');
      return;
    }
    $('page-admin')?.classList.add('active');
    renderAdminDashboard();
    renderAdminProducts();
    renderAdminCats();
    populatePmCat();
  }

  closeMobileMenu();
  window.scrollTo(0, 0);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    goTo('home');
  }
}

function openWhatsApp(productName) {
  const message = productName
    ? `Olá, gostaria de orçamento do produto: *${productName}*`
    : 'Olá, gostaria de informações e orçamento sobre os móveis disponíveis.';
  window.open(`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function getProductById(id) {
  return state.products.find((p) => p.id === Number(id));
}

function renderHomeCategories() {
  const el = $('categoriesHome');
  if (!el) return;
  el.innerHTML = state.categories
    .map(
      (c) => `
      <button class="cat-card" type="button" data-filter-category="${escapeHtml(c.name)}" aria-label="Ver categoria ${escapeHtml(c.name)}">
        <div class="cat-icon" aria-hidden="true">${escapeHtml(c.icon)}</div>
        <div class="cat-name">${escapeHtml(c.name)}</div>
      </button>
    `,
    )
    .join('');
}

function getProductBadgeMarkup(product) {
  if (product.promo) return '<span class="product-card-badge badge-promo">Promoção</span>';
  if (product.novo) return '<span class="product-card-badge badge-new">Lançamento</span>';
  if (product.destaque) return '<span class="product-card-badge badge-dest">Destaque</span>';
  return '';
}

function productCardHTML(product) {
  const badge = getProductBadgeMarkup(product);
  const unavailableOverlay = product.disponivel
    ? ''
    : '<div class="product-overlay-stock"><span class="product-overlay-stock-text">Fora de estoque</span></div>';

  return `
    <article class="product-card" data-open-product-id="${product.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${escapeHtml(product.name)}">
      <div class="product-card-img">
        <div style="font-size:3rem;opacity:0.18;" aria-hidden="true">🪑</div>
        ${badge}
        ${unavailableOverlay}
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${escapeHtml(product.cat)}</div>
        <div class="product-card-name">${escapeHtml(product.name)}</div>
        <div class="product-card-code">Cód: ${escapeHtml(product.code)}</div>
        <div class="product-card-actions">
          <button class="btn btn-outline btn-sm" type="button" data-action="open-product" data-product-id="${product.id}">Ver detalhes</button>
          <button class="btn btn-primary btn-sm" type="button" data-action="open-whatsapp-product" data-product-id="${product.id}">💬 Orçamento</button>
        </div>
      </div>
    </article>`;
}

function renderFeaturedProducts() {
  const featured = state.products.filter((p) => p.destaque && p.disponivel).slice(0, 4);
  const el = $('featuredProducts');
  if (!el) return;
  el.innerHTML = featured.map((p) => productCardHTML(p)).join('');
}

function initCatalogFilters() {
  const sel = $('filterCat');
  if (!sel) return;
  sel.innerHTML =
    '<option value="">Todas as categorias</option>' +
    state.categories.map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
}

function filterCatalog(catName) {
  goTo('catalog');
  setTimeout(() => {
    const sel = $('filterCat');
    if (sel) sel.value = catName;
    renderCatalog();
  }, 50);
}

function renderCatalog() {
  const q = (($('catalogSearch')?.value || '').trim()).toLowerCase();
  const cat = $('filterCat')?.value || '';
  const mat = $('filterMat')?.value || '';
  const disp = $('filterDisp')?.value || '';

  const filtered = state.products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    if (cat && p.cat !== cat) return false;
    if (mat && p.mat !== mat) return false;
    if (disp === 'disponivel' && !p.disponivel) return false;
    if (disp === 'indisponivel' && p.disponivel) return false;
    return true;
  });

  const info = $('catalogInfo');
  if (info) {
    const suffix = filtered.length !== 1 ? 's' : '';
    info.textContent = `${filtered.length} produto${suffix} encontrado${suffix}`;
  }

  const grid = $('catalogGrid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;">
        <div class="no-results-icon" aria-hidden="true">🔍</div>
        <p style="font-size:1rem;font-weight:600;color:var(--dark);margin-bottom:6px;">Nenhum produto encontrado</p>
        <p style="font-size:0.875rem;">Tente alterar os filtros ou buscar por outros termos.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => productCardHTML(p)).join('');
}

function openProduct(id) {
  state.currentProduct = getProductById(id);
  if (!state.currentProduct) return;
  goTo('product');
}

function renderProductDetail() {
  if (!state.currentProduct) return;
  const p = state.currentProduct;
  $('breadcrumb-product').textContent = p.name;

  const colors = (Array.isArray(p.cores) ? p.cores : [])
    .map((color, index) => {
      const safeColor = sanitizeColor(color);
      const isActive = index === 0 ? ' active' : '';
      return `<button class="color-dot${isActive}" type="button" style="background:${safeColor}" title="Cor ${safeColor}" data-action="select-color" aria-label="Selecionar cor ${safeColor}"></button>`;
    })
    .join('');

  const availClass = p.disponivel ? 'avail-yes' : 'avail-no';
  const availText = p.disponivel ? '✅ Disponível' : '❌ Fora de estoque';

  $('productInfo').innerHTML = `
    <div class="product-detail-cat">${escapeHtml(p.cat)}</div>
    <h1 class="product-detail-name">${escapeHtml(p.name)}</h1>
    <div class="product-detail-code">Código: ${escapeHtml(p.code)}</div>
    <span class="product-avail ${availClass}"><span class="avail-dot"></span>${availText}</span>
    <p class="product-detail-desc" style="margin-top:16px;">${escapeHtml(p.desc)}</p>
    <div class="product-specs">
      <div class="product-specs-title">Especificações</div>
      <div class="specs-grid">
        <div class="spec-item"><div class="spec-label">Medidas</div><div class="spec-value">${escapeHtml(p.med || '—')}</div></div>
        <div class="spec-item"><div class="spec-label">Material</div><div class="spec-value">${escapeHtml(p.mat || '—')}</div></div>
        <div class="spec-item"><div class="spec-label">Acabamento</div><div class="spec-value">${escapeHtml(p.acab || '—')}</div></div>
        <div class="spec-item"><div class="spec-label">Categoria</div><div class="spec-value">${escapeHtml(p.cat)}</div></div>
      </div>
    </div>
    ${colors ? `<div class="product-colors"><div class="product-colors-title">Cores disponíveis</div><div class="colors-list">${colors}</div></div>` : ''}
    <div class="product-actions">
      <button class="btn btn-wpp btn-full btn-lg" type="button" data-action="open-whatsapp-product" data-product-id="${p.id}">💬 Solicitar Orçamento via WhatsApp</button>
      <button class="btn btn-outline btn-full" type="button" data-action="scroll-orcamento-form">📋 Preencher Formulário</button>
    </div>
  `;

  const thumbs = ['🪑', '📷', '🏠', '✨']
    .map(
      (icon, index) =>
        `<button class="gallery-thumb${index === 0 ? ' active' : ''}" type="button" data-action="gallery-thumb" aria-label="Visualização ${index + 1}">${icon}</button>`,
    )
    .join('');
  $('galleryThumbs').innerHTML = thumbs;
}

function setFormFeedback({ successMessage = '', errorMessage = '' } = {}) {
  const successEl = $('formSuccess');
  const errorEl = $('formError');
  if (successEl) {
    successEl.textContent = successMessage;
    successEl.classList.toggle('hidden', !successMessage);
  }
  if (errorEl) {
    errorEl.textContent = errorMessage;
    errorEl.classList.toggle('hidden', !errorMessage);
  }
}

function submitForm(event) {
  event?.preventDefault();

  const formData = {
    nome: $('formNome')?.value.trim() || '',
    tel: $('formTel')?.value.trim() || '',
    email: $('formEmail')?.value.trim() || '',
    cidade: $('formCidade')?.value.trim() || '',
    msg: $('formMsg')?.value.trim() || '',
  };

  if (!formData.nome || formData.nome.length < 3) {
    setFormFeedback({ errorMessage: 'Informe seu nome completo.' });
    showToast('Revise os dados do formulário.', 'error');
    return;
  }

  const numericPhone = formData.tel.replace(/\D/g, '');
  if (numericPhone.length < 10) {
    setFormFeedback({ errorMessage: 'Informe um telefone/WhatsApp válido com DDD.' });
    showToast('Revise os dados do formulário.', 'error');
    return;
  }

  const productName = state.currentProduct ? state.currentProduct.name : 'produto';
  const messageLines = [
    `Olá, sou ${formData.nome}.`,
    `Gostaria de orçamento do produto: *${productName}*.`,
    `Telefone: ${formData.tel}`,
  ];
  if (formData.email) messageLines.push(`E-mail: ${formData.email}`);
  if (formData.cidade) messageLines.push(`Cidade: ${formData.cidade}`);
  if (formData.msg) messageLines.push(`Observações: ${formData.msg}`);

  setFormFeedback({ successMessage: 'Solicitação pronta! Vamos abrir o WhatsApp para envio.' });
  showToast('Solicitação enviada via WhatsApp!', 'success');

  window.open(
    `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(messageLines.join('\n'))}`,
    '_blank',
    'noopener',
  );
}

function doLogin() {
  state.adminLoggedIn = true;
  localStorage.setItem(APP_CONFIG.localStorageKeys.adminDemoSession, '1');
  $('loginNotice')?.classList.remove('hidden');
  showToast('Entrando no painel DEMO local.', 'success');
  goTo('admin');
}

function doLogout() {
  state.adminLoggedIn = false;
  localStorage.removeItem(APP_CONFIG.localStorageKeys.adminDemoSession);
  showToast('Sessão DEMO encerrada.', '');
  goTo('home');
}

function adminTab(tab, el) {
  document.querySelectorAll('.admin-section').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach((n) => n.classList.remove('active'));
  document.getElementById(`admin-${tab}`)?.classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'produtos') renderAdminProducts();
  if (tab === 'categorias') renderAdminCats();
  if (tab === 'dashboard') renderAdminDashboard();
}

function renderAdminDashboard() {
  const stats = $('adminStats');
  if (stats) {
    const total = state.products.length;
    const disp = state.products.filter((p) => p.disponivel).length;
    const promo = state.products.filter((p) => p.promo).length;
    const novo = state.products.filter((p) => p.novo).length;
    stats.innerHTML = `
      <div class="admin-stat-card"><div class="admin-stat-label">Total de produtos</div><div class="admin-stat-num">${total}</div><div class="admin-stat-sub">${disp} disponíveis</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Promoções ativas</div><div class="admin-stat-num">${promo}</div><div class="admin-stat-sub">em promoção</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Lançamentos</div><div class="admin-stat-num">${novo}</div><div class="admin-stat-sub">novos produtos</div></div>
      <div class="admin-stat-card"><div class="admin-stat-label">Categorias</div><div class="admin-stat-num">${state.categories.length}</div><div class="admin-stat-sub">ativas</div></div>
    `;
  }

  const recent = $('recentProductsTable');
  if (recent) {
    const last5 = [...state.products].slice(-5).reverse();
    recent.innerHTML = productsTableHTML(last5, { adminContext: false });
  }
}

function renderAdminProducts() {
  const q = (($('adminSearch')?.value || '').trim()).toLowerCase();
  const filtered = q
    ? state.products.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    : state.products;
  const el = $('adminProductsTable');
  if (el) el.innerHTML = productsTableHTML(filtered, { adminContext: true });
}

function productsTableHTML(products, { adminContext }) {
  if (!products.length) {
    return '<div class="admin-empty"><div class="admin-empty-icon">🪑</div><p>Nenhum produto encontrado.</p></div>';
  }

  return `<table class="admin-table">
    <thead><tr><th>Produto</th><th>Código</th><th>Categoria</th><th>Status</th>${adminContext ? '<th>Ações</th>' : ''}</tr></thead>
    <tbody>
      ${products
        .map((p) => {
          const status = `
            ${p.disponivel ? '<span class="status-badge status-active">Disponível</span>' : '<span class="status-badge status-archived">Indisponível</span>'}
            ${p.promo ? ' <span class="status-badge status-promo">Promo</span>' : ''}
            ${p.novo ? ' <span class="status-badge status-new">Novo</span>' : ''}
          `;

          const actions = adminContext
            ? `<td>
                <div class="admin-actions">
                  <button class="admin-btn-icon" type="button" title="Editar" data-action="admin-edit-product" data-id="${p.id}">✏️</button>
                  <button class="admin-btn-icon" type="button" title="Duplicar" data-action="admin-duplicate-product" data-id="${p.id}">📋</button>
                  <button class="admin-btn-icon" type="button" title="Visualizar" data-action="admin-preview-product" data-id="${p.id}">👁️</button>
                  <button class="admin-btn-icon danger" type="button" title="Excluir" data-action="admin-delete-product" data-id="${p.id}">🗑️</button>
                </div>
              </td>`
            : '';

          return `<tr>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><span class="tag">${escapeHtml(p.code)}</span></td>
            <td>${escapeHtml(p.cat)}</td>
            <td>${status}</td>
            ${actions}
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>`;
}

function renderAdminCats() {
  const el = $('adminCatTable');
  if (!el) return;

  el.innerHTML = `<table class="admin-table">
    <thead><tr><th>Ícone</th><th>Nome</th><th>Produtos</th><th>Ações</th></tr></thead>
    <tbody>
      ${state.categories
        .map(
          (c) => `<tr>
            <td style="font-size:1.5rem;">${escapeHtml(c.icon)}</td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${state.products.filter((p) => p.cat === c.name).length}</td>
            <td>
              <div class="admin-actions">
                <button class="admin-btn-icon" type="button" data-action="admin-edit-cat" data-id="${c.id}">✏️</button>
                <button class="admin-btn-icon danger" type="button" data-action="admin-delete-cat" data-id="${c.id}">🗑️</button>
              </div>
            </td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
}

function populatePmCat() {
  const sel = $('pm-cat');
  if (!sel) return;
  sel.innerHTML = state.categories
    .map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
    .join('');
}

function openProductModal(id) {
  state.editingProductId = id || null;
  populatePmCat();
  const modal = $('productModalOverlay');
  const title = $('productModalTitle');

  if (id) {
    const p = getProductById(id);
    if (!p) return;
    title.textContent = 'Editar Produto';
    $('pm-name').value = p.name;
    $('pm-code').value = p.code;
    $('pm-cat').value = p.cat;
    $('pm-mat').value = p.mat;
    $('pm-desc').value = p.desc;
    $('pm-med').value = p.med || '';
    $('pm-acab').value = p.acab || '';
    $('pm-cores').value = Array.isArray(p.cores) ? p.cores.join(', ') : '';
    $('pm-dest').checked = !!p.destaque;
    $('pm-promo').checked = !!p.promo;
    $('pm-new').checked = !!p.novo;
    $('pm-disp').checked = !!p.disponivel;
  } else {
    title.textContent = 'Novo Produto';
    ['pm-name', 'pm-code', 'pm-desc', 'pm-med', 'pm-acab', 'pm-cores'].forEach((field) => {
      const input = $(field);
      if (input) input.value = '';
    });
    $('pm-dest').checked = true;
    $('pm-promo').checked = false;
    $('pm-new').checked = false;
    $('pm-disp').checked = true;
  }

  modal?.classList.add('open');
}

function closeProductModal() {
  $('productModalOverlay')?.classList.remove('open');
}

function saveProduct() {
  const name = $('pm-name').value.trim();
  const code = $('pm-code').value.trim();
  if (!name || !code) {
    showToast('Nome e código são obrigatórios.', 'error');
    return;
  }

  const data = {
    name,
    code,
    cat: $('pm-cat').value,
    mat: $('pm-mat').value,
    desc: $('pm-desc').value,
    med: $('pm-med').value,
    acab: $('pm-acab').value,
    cores: $('pm-cores')
      .value
      .split(',')
      .map((s) => sanitizeColor(s.trim()))
      .filter(Boolean),
    destaque: $('pm-dest').checked,
    promo: $('pm-promo').checked,
    novo: $('pm-new').checked,
    disponivel: $('pm-disp').checked,
  };

  if (state.editingProductId) {
    const idx = state.products.findIndex((p) => p.id === state.editingProductId);
    if (idx >= 0) {
      state.products[idx] = { ...state.products[idx], ...data };
      showToast('Produto atualizado!', 'success');
    }
  } else {
    data.id = Date.now();
    state.products.push(data);
    showToast('Produto criado!', 'success');
  }

  saveData();
  closeProductModal();
  renderAdminProducts();
  renderAdminDashboard();
}

function deleteProduct(id) {
  if (!window.confirm('Excluir este produto?')) return;
  state.products = state.products.filter((p) => p.id !== Number(id));
  saveData();
  renderAdminProducts();
  renderAdminDashboard();
  showToast('Produto excluído.', '');
}

function duplicateProduct(id) {
  const p = getProductById(id);
  if (!p) return;
  const copy = { ...p, id: Date.now(), name: `${p.name} (Cópia)`, code: `${p.code}-C` };
  state.products.push(copy);
  saveData();
  renderAdminProducts();
  renderAdminDashboard();
  showToast('Produto duplicado!', 'success');
}

function openCatModal(id) {
  state.editingCatId = id || null;
  const modal = $('catModalOverlay');

  if (id) {
    const c = state.categories.find((cat) => cat.id === Number(id));
    if (!c) return;
    $('catModalTitle').textContent = 'Editar Categoria';
    $('cm-name').value = c.name;
    $('cm-icon').value = c.icon;
  } else {
    $('catModalTitle').textContent = 'Nova Categoria';
    $('cm-name').value = '';
    $('cm-icon').value = '';
  }

  modal?.classList.add('open');
}

function closeCatModal() {
  $('catModalOverlay')?.classList.remove('open');
}

function saveCat() {
  const name = $('cm-name').value.trim();
  if (!name) {
    showToast('Nome da categoria é obrigatório.', 'error');
    return;
  }

  const icon = $('cm-icon').value.trim() || '🗂️';

  if (state.editingCatId) {
    const idx = state.categories.findIndex((c) => c.id === state.editingCatId);
    if (idx >= 0) {
      const previousName = state.categories[idx].name;
      state.categories[idx] = { ...state.categories[idx], name, icon };
      state.products = state.products.map((p) => (p.cat === previousName ? { ...p, cat: name } : p));
      showToast('Categoria atualizada!', 'success');
    }
  } else {
    state.categories.push({ id: Date.now(), name, icon });
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
  if (!window.confirm('Excluir esta categoria?')) return;
  state.categories = state.categories.filter((c) => c.id !== Number(id));
  saveData();
  renderAdminCats();
  populatePmCat();
  renderHomeCategories();
  initCatalogFilters();
  showToast('Categoria excluída.', '');
}

function showToast(msg, type) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast${type ? ` ${type}` : ''} show`;
  setTimeout(() => t.classList.remove('show'), 3200);
}

function handleActionClick(target) {
  const actionEl = target.closest('[data-action]');
  if (!actionEl) return false;

  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id || actionEl.dataset.productId;

  if (action === 'toggle-mobile-menu') toggleMobileMenu();
  if (action === 'close-mobile-menu') closeMobileMenu();
  if (action === 'open-whatsapp') openWhatsApp();
  if (action === 'open-whatsapp-product') {
    const product = getProductById(id);
    if (product) openWhatsApp(product.name);
  }
  if (action === 'open-product') openProduct(id);
  if (action === 'scroll-orcamento-form') {
    document.querySelector('.orcamento-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  if (action === 'admin-login-demo') doLogin();
  if (action === 'admin-logout') doLogout();
  if (action === 'admin-open-product-modal') openProductModal();
  if (action === 'admin-open-cat-modal') openCatModal();
  if (action === 'admin-save-product') saveProduct();
  if (action === 'admin-save-cat') saveCat();
  if (action === 'admin-close-product-modal') closeProductModal();
  if (action === 'admin-close-cat-modal') closeCatModal();
  if (action === 'admin-config-save') showToast('Configuração apenas DEMO local. Use backend para persistência real.', '');
  if (action === 'demo-upload') showToast('Upload disponível na versão com backend.', '');
  if (action === 'admin-edit-product') openProductModal(id);
  if (action === 'admin-duplicate-product') duplicateProduct(id);
  if (action === 'admin-preview-product') openProduct(id);
  if (action === 'admin-delete-product') deleteProduct(id);
  if (action === 'admin-edit-cat') openCatModal(id);
  if (action === 'admin-delete-cat') deleteCat(id);
  if (action === 'gallery-thumb') {
    actionEl.parentElement.querySelectorAll('.gallery-thumb').forEach((thumb) => thumb.classList.remove('active'));
    actionEl.classList.add('active');
  }
  if (action === 'select-color') {
    actionEl.parentElement.querySelectorAll('.color-dot').forEach((dot) => dot.classList.remove('active'));
    actionEl.classList.add('active');
  }

  return true;
}

function initEventListeners() {
  window.addEventListener('scroll', () => {
    const navbar = $('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  document.addEventListener('click', (event) => {
    if (handleActionClick(event.target)) return;

    const navTarget = event.target.closest('[data-nav]');
    if (navTarget) {
      event.preventDefault();
      goTo(navTarget.dataset.nav);
      closeMobileMenu();
      return;
    }

    const scrollTarget = event.target.closest('[data-scroll-target]');
    if (scrollTarget) {
      event.preventDefault();
      scrollToSection(scrollTarget.dataset.scrollTarget);
      closeMobileMenu();
      return;
    }

    const filterTarget = event.target.closest('[data-filter-category]');
    if (filterTarget) {
      event.preventDefault();
      filterCatalog(filterTarget.dataset.filterCategory);
      return;
    }

    const productCard = event.target.closest('[data-open-product-id]');
    if (productCard) {
      if (event.target.closest('.product-card-actions')) return;
      openProduct(productCard.dataset.openProductId);
      return;
    }

    const adminTabTarget = event.target.closest('[data-admin-tab]');
    if (adminTabTarget) {
      adminTab(adminTabTarget.dataset.adminTab, adminTabTarget);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeProductModal();
      closeCatModal();
    }

    if (event.key === 'Enter') {
      const card = event.target.closest('[data-open-product-id]');
      if (card) {
        openProduct(card.dataset.openProductId);
      }
    }
  });

  $('catalogSearch')?.addEventListener('input', renderCatalog);
  $('filterCat')?.addEventListener('change', renderCatalog);
  $('filterMat')?.addEventListener('change', renderCatalog);
  $('filterDisp')?.addEventListener('change', renderCatalog);
  $('adminSearch')?.addEventListener('input', renderAdminProducts);

  $('budgetForm')?.addEventListener('submit', submitForm);
  $('adminDemoLoginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    doLogin();
  });

  $('productModalOverlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'productModalOverlay') closeProductModal();
  });

  $('catModalOverlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'catModalOverlay') closeCatModal();
  });
}

function initStaticContent() {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = String(year);
  });
  document.querySelectorAll('[data-company-name]').forEach((el) => {
    el.textContent = APP_CONFIG.companyName;
  });
  document.querySelectorAll('[data-company-whatsapp]').forEach((el) => {
    el.textContent = APP_CONFIG.whatsappDisplay;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initStaticContent();
  initEventListeners();
  goTo('home');
});

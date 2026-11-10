/* ============================================================
   Zent — lógica de la aplicación
   Sin dependencias. Los datos se guardan en localStorage.
   ============================================================ */

(() => {
  'use strict';

  /* ------------------------------------------------------------
     Constantes y datos por defecto
     ------------------------------------------------------------ */

  const STORE_KEY = 'zent.state.v1';
  const APP_VERSION = '0.1.0';

  const VIEW_META = {
    resumen: { title: 'Resumen' },
    movimientos: { title: 'Movimientos' },
    cuentas: { title: 'Cuentas' },
    estadisticas: { title: 'Estadísticas' },
    ajustes: { title: 'Ajustes' }
  };

  const ICON = {
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 4 5-4M5 20h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5M7 9l5-5 5 5M5 20h14"/></svg>'
  };

  const PALETTE = ['#5b5bd6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#64748b'];

  const DEFAULT_ACCOUNTS = () => ([
    { id: 'cash', name: 'Efectivo', color: '#10b981', initial: 0 },
    { id: 'nequi', name: 'Nequi', color: '#8b5cf6', initial: 0 },
    { id: 'daviplata', name: 'Daviplata', color: '#ef4444', initial: 0 },
    { id: 'bancolombia', name: 'Bancolombia', color: '#f59e0b', initial: 0 }
  ]);

  const DEFAULT_CATEGORIES = () => ([
    { id: 'comida', name: 'Comida', type: 'expense', emoji: '🍽️', color: '#f59e0b' },
    { id: 'mercado', name: 'Mercado', type: 'expense', emoji: '🛒', color: '#10b981' },
    { id: 'transporte', name: 'Transporte', type: 'expense', emoji: '🚌', color: '#3b82f6' },
    { id: 'servicios', name: 'Servicios', type: 'expense', emoji: '💡', color: '#f97316' },
    { id: 'salud', name: 'Salud', type: 'expense', emoji: '💊', color: '#ef4444' },
    { id: 'ropa', name: 'Ropa', type: 'expense', emoji: '👕', color: '#ec4899' },
    { id: 'ocio', name: 'Ocio', type: 'expense', emoji: '🎬', color: '#8b5cf6' },
    { id: 'hogar', name: 'Hogar', type: 'expense', emoji: '🏠', color: '#06b6d4' },
    { id: 'educacion', name: 'Educación', type: 'expense', emoji: '📚', color: '#6366f1' },
    { id: 'otros-gastos', name: 'Otros', type: 'expense', emoji: '📦', color: '#64748b' },
    { id: 'salario', name: 'Salario', type: 'income', emoji: '💼', color: '#0f9d76' },
    { id: 'ventas', name: 'Ventas', type: 'income', emoji: '🏷️', color: '#10b981' },
    { id: 'transferencias', name: 'Transferencias', type: 'income', emoji: '🔁', color: '#06b6d4' },
    { id: 'otros-ingresos', name: 'Otros ingresos', type: 'income', emoji: '💰', color: '#64748b' }
  ]);

  function freshState() {
    return {
      version: 1,
      theme: 'system',
      accounts: DEFAULT_ACCOUNTS(),
      categories: DEFAULT_CATEGORIES(),
      movements: []
    };
  }

  /* ------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------ */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const pad2 = (n) => String(n).padStart(2, '0');

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function toAmount(value) {
    const n = Math.round(Number(value) || 0);
    return n > 0 ? n : 0;
  }

  function isColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ''));
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function currentMonth() {
    return todayISO().slice(0, 7);
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  const moneyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });

  const numberFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

  function formatMoney(value) {
    return moneyFormatter.format(Number(value) || 0);
  }

  function formatNumberInput(value) {
    return numberFormatter.format(Number(value) || 0);
  }

  const GMF_RATE = 0.004;

  function movementTax(movement) {
    if (!movement || !movement.gmf) return 0;
    return Math.round((Number(movement.amount) || 0) * GMF_RATE);
  }

  function movementTotal(movement) {
    const amount = Number(movement.amount) || 0;
    const tax = movementTax(movement);
    if (!tax) return amount;
    return movement.type === 'income' ? Math.max(0, amount - tax) : amount + tax;
  }

  function gmfHintText(amount, type, enabled) {
    if (!enabled) return 'Se suma el 0,4% del monto.';
    const tax = Math.round((Number(amount) || 0) * GMF_RATE);
    if (!tax) return '0,4% del monto.';
    const total = type === 'income' ? Math.max(0, amount - tax) : amount + tax;
    return '4x1000: ' + formatMoney(tax) + ' · Total: ' + formatMoney(total);
  }

  function dateFromISO(value) {
    const d = new Date(String(value) + 'T00:00:00');
    return isFinite(d.getTime()) ? d : null;
  }

  function formatDate(value) {
    const d = dateFromISO(value);
    if (!d) return '';
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
  }

  function monthName(ym) {
    if (!ym) return 'todo el historial';
    const d = dateFromISO(ym + '-01');
    if (!d) return ym;
    const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function shortMonthName(ym) {
    const d = dateFromISO(ym + '-01');
    if (!d) return ym;
    return d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  }

  function greeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Buenos días';
    if (h >= 12 && h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function initial(name) {
    const text = String(name || '').trim();
    return text ? text.charAt(0).toUpperCase() : '?';
  }

  function catColor(category) {
    return isColor(category && category.color) ? category.color : '#64748b';
  }

  function dayHeading(dateStr) {
    if (dateStr === todayISO()) return 'Hoy · ' + formatDate(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear() + '-' + pad2(yesterday.getMonth() + 1) + '-' + pad2(yesterday.getDate());
    if (dateStr === y) return 'Ayer · ' + formatDate(dateStr);
    return formatDate(dateStr);
  }

  function daysInMonth(ym) {
    if (!ym) return 30;
    const parts = ym.split('-').map(Number);
    return new Date(parts[0], parts[1], 0).getDate();
  }

  function daysElapsedInMonth(ym) {
    if (!ym) return daysInMonth(ym);
    if (ym !== currentMonth()) return daysInMonth(ym);
    return new Date().getDate();
  }

  /* ------------------------------------------------------------
     Estado y persistencia
     ------------------------------------------------------------ */

  function sanitizeAccount(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim().slice(0, 40);
    if (!name) return null;
    return {
      id: String(raw.id || uid()),
      name,
      color: isColor(raw.color) ? raw.color : PALETTE[0],
      initial: toAmount(raw.initial)
    };
  }

  function sanitizeCategory(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim().slice(0, 40);
    const type = raw.type === 'income' ? 'income' : (raw.type === 'expense' ? 'expense' : '');
    if (!name || !type) return null;
    const emoji = String(raw.emoji || '').trim().slice(0, 4) || (type === 'income' ? '💰' : '📦');
    return {
      id: String(raw.id || uid()),
      name,
      type,
      emoji,
      color: isColor(raw.color) ? raw.color : PALETTE[0]
    };
  }

  function sanitizeMovement(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const amount = toAmount(raw.amount);
    if (!amount) return null;
    const type = raw.type === 'income' ? 'income' : 'expense';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date || '')) ? String(raw.date) : todayISO();
    const now = new Date().toISOString();
    return {
      id: String(raw.id || uid()),
      type,
      amount,
      description: String(raw.description || '').trim().slice(0, 80) || 'Movimiento',
      categoryId: String(raw.categoryId || ''),
      accountId: String(raw.accountId || ''),
      date,
      note: String(raw.note || '').trim().slice(0, 140),
      gmf: Boolean(raw.gmf),
      createdAt: String(raw.createdAt || now),
      updatedAt: String(raw.updatedAt || now)
    };
  }

  function normalizeState(raw) {
    const out = freshState();
    if (!raw || typeof raw !== 'object') return out;

    out.theme = ['system', 'light', 'dark'].indexOf(raw.theme) !== -1 ? raw.theme : 'system';

    const accounts = Array.isArray(raw.accounts) ? raw.accounts.map(sanitizeAccount).filter(Boolean) : [];
    out.accounts = accounts.length ? accounts : DEFAULT_ACCOUNTS();

    const categories = Array.isArray(raw.categories) ? raw.categories.map(sanitizeCategory).filter(Boolean) : [];
    if (!categories.some((c) => c.type === 'expense')) {
      categories.push.apply(categories, DEFAULT_CATEGORIES().filter((c) => c.type === 'expense'));
    }
    if (!categories.some((c) => c.type === 'income')) {
      categories.push.apply(categories, DEFAULT_CATEGORIES().filter((c) => c.type === 'income'));
    }
    out.categories = categories;

    out.movements = Array.isArray(raw.movements) ? raw.movements.map(sanitizeMovement).filter(Boolean) : [];

    // Reparar referencias de respaldos antiguos o incompletos.
    out.movements.forEach((m) => {
      if (!out.accounts.some((a) => a.id === m.accountId)) m.accountId = out.accounts[0].id;
      if (!out.categories.some((c) => c.id === m.categoryId && c.type === m.type)) {
        const fallback = out.categories.find((c) => c.type === m.type);
        m.categoryId = fallback ? fallback.id : '';
      }
    });

    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return freshState();
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn('Zent: no se pudo leer el estado guardado.', error);
      return freshState();
    }
  }

  let state = loadState();

  const ui = {
    movMonth: currentMonth(),
    movType: 'all',
    movQuery: '',
    movAccount: 'all',
    statsMonth: currentMonth(),
    movementDraft: null,
    confirmCallback: null,
    lastFocus: null,
    renderedView: null
  };

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Zent: no se pudo guardar.', error);
      toast('No se pudieron guardar los datos en este dispositivo.');
    }
    if (window.sync) {
      Promise.resolve(sync.saveState(state)).catch(() => {});
    }
  }

  const accountById = (id) => state.accounts.find((a) => a.id === id) || null;
  const categoryById = (id) => state.categories.find((c) => c.id === id) || null;

  /* ------------------------------------------------------------
     Cálculos
     ------------------------------------------------------------ */

  function accountBalance(id) {
    const account = accountById(id);
    if (!account) return 0;
    return state.movements.reduce((total, movement) => {
      if (movement.accountId !== id) return total;
      return total + (movement.type === 'income' ? movementTotal(movement) : -movementTotal(movement));
    }, account.initial);
  }

  function totalBalance() {
    return state.accounts.reduce((total, account) => total + accountBalance(account.id), 0);
  }

  function monthTotals(ym) {
    const result = { income: 0, expense: 0, count: 0 };
    state.movements.forEach((movement) => {
      if (ym && movement.date.slice(0, 7) !== ym) return;
      result[movement.type] += movementTotal(movement);
      result.count += 1;
    });
    return result;
  }

  function movementCountForAccount(id) {
    return state.movements.filter((m) => m.accountId === id).length;
  }

  function categoryBreakdown(type, ym) {
    const rows = state.categories
      .filter((category) => category.type === type)
      .map((category) => ({ ...category, total: 0, count: 0 }));
    const byId = new Map(rows.map((row) => [row.id, row]));
    let unknown = null;

    state.movements.forEach((movement) => {
      if (movement.type !== type) return;
      if (ym && movement.date.slice(0, 7) !== ym) return;

      let row = byId.get(movement.categoryId);
      if (!row) {
        if (!unknown) {
          unknown = { id: '__unknown', name: 'Sin categoría', type, emoji: '❔', color: '#64748b', total: 0, count: 0 };
          rows.push(unknown);
          byId.set(unknown.id, unknown);
        }
        row = unknown;
      }
      row.total += movementTotal(movement);
      row.count += 1;
    });

    return rows.filter((row) => row.total > 0).sort((a, b) => b.total - a.total);
  }

  function lastMonths(count) {
    const out = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(d.getFullYear() + '-' + pad2(d.getMonth() + 1));
    }
    return out;
  }

  function sortedMovements() {
    return state.movements.slice().sort((a, b) => {
      const byDate = String(b.date).localeCompare(String(a.date));
      if (byDate !== 0) return byDate;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }

  function filteredMovements() {
    const query = normalizeText(ui.movQuery);
    return sortedMovements().filter((movement) => {
      if (ui.movMonth && movement.date.slice(0, 7) !== ui.movMonth) return false;
      if (ui.movType !== 'all' && movement.type !== ui.movType) return false;
      if (ui.movAccount !== 'all' && movement.accountId !== ui.movAccount) return false;
      if (query) {
        const category = categoryById(movement.categoryId);
        const account = accountById(movement.accountId);
        const haystack = normalizeText([
          movement.description,
          movement.note,
          category && category.name,
          account && account.name
        ].join(' '));
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  /* ------------------------------------------------------------
     Componentes de interfaz
     ------------------------------------------------------------ */

  function emptyState(emoji, title, text, actionHtml) {
    return '<div class="empty">' +
      '<span class="emoji">' + esc(emoji) + '</span>' +
      '<h3>' + esc(title) + '</h3>' +
      '<p>' + esc(text) + '</p>' +
      (actionHtml || '') +
      '</div>';
  }

  function movementRow(movement) {
    const category = categoryById(movement.categoryId);
    const account = accountById(movement.accountId);
    const color = catColor(category);
    const emoji = category ? category.emoji : (movement.type === 'income' ? '💰' : '💸');
    const title = movement.description || (category && category.name) || 'Movimiento';
    const tax = movementTax(movement);
    const sub = [
      category && category.name,
      account && account.name,
      formatDate(movement.date),
      tax > 0 ? '4x1000 ' + formatMoney(tax) : ''
    ].filter(Boolean).join(' · ');
    const sign = movement.type === 'income' ? '+' : '−';

    return '<button class="row" data-action="edit-movement" data-id="' + esc(movement.id) + '">' +
      '<span class="cat-ic" style="background:' + color + '22;color:' + color + '">' + esc(emoji) + '</span>' +
      '<span class="grow">' +
        '<span class="title">' + esc(title) + '</span>' +
        '<span class="sub">' + esc(sub) + '</span>' +
      '</span>' +
      '<b class="amt ' + (movement.type === 'income' ? 'in' : 'out') + '">' + sign + ' ' + formatMoney(movementTotal(movement)) + '</b>' +
    '</button>';
  }

  function breakdownHTML(rows, type) {
    if (!rows.length) {
      return '<p class="hint">No hay ' + (type === 'expense' ? 'gastos' : 'ingresos') + ' este mes.</p>';
    }
    const max = rows[0].total || 1;
    return rows.map((row) => {
      const color = catColor(row);
      const width = Math.max(3, Math.round((row.total / max) * 100));
      return '<div class="cat-row">' +
        '<span class="cat-ic" style="background:' + color + '22;color:' + color + '">' + esc(row.emoji) + '</span>' +
        '<div class="cat-info">' +
          '<div class="cat-top"><span>' + esc(row.name) + '</span><span class="muted">' + formatMoney(row.total) + '</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + width + '%;background:' + color + '"></div></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function chartHTML(months, max) {
    return '<div class="chart">' + months.map((month) => {
      const incomeHeight = Math.round((month.income / max) * 100);
      const expenseHeight = Math.round((month.expense / max) * 100);
      return '<div class="chart-col">' +
        '<div class="chart-bars">' +
          '<span class="bar income" style="height:' + Math.max(2, incomeHeight) + '%"></span>' +
          '<span class="bar expense" style="height:' + Math.max(2, expenseHeight) + '%"></span>' +
        '</div>' +
        '<span class="chart-label">' + esc(shortMonthName(month.ym)) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------
     Vistas
     ------------------------------------------------------------ */

  function viewResumen() {
    const ym = currentMonth();
    const totals = monthTotals(ym);
    const net = totals.income - totals.expense;
    const recent = sortedMovements().slice(0, 5);
    const topExpenses = categoryBreakdown('expense', ym).slice(0, 3);
    const average = Math.round(totals.expense / Math.max(1, daysElapsedInMonth(ym)));

    const accountsHtml = state.accounts.length
      ? state.accounts.map((account) => {
          const balance = accountBalance(account.id);
          const count = movementCountForAccount(account.id);
          return '<button class="row" data-action="nav" data-view="cuentas">' +
            '<span class="acct-dot" style="background:' + esc(account.color) + '">' + esc(initial(account.name)) + '</span>' +
            '<span class="grow">' +
              '<span class="title">' + esc(account.name) + '</span>' +
              '<span class="sub">' + count + ' movimiento' + (count === 1 ? '' : 's') + '</span>' +
            '</span>' +
            '<b class="amt' + (balance < 0 ? ' out' : '') + '">' + formatMoney(balance) + '</b>' +
          '</button>';
        }).join('')
      : '<p class="hint">Agrega una cuenta para empezar.</p>';

    const recentHtml = recent.length
      ? '<div class="row-list">' + recent.map(movementRow).join('') + '</div>'
      : emptyState('🌱', 'Aún no hay movimientos', 'Registra tu primer ingreso o gasto para ver tu resumen aquí.',
          '<button class="btn soft sm" data-action="add-movement">Agregar el primero</button>');

    const topHtml = topExpenses.length
      ? topExpenses.map((row) => {
          const color = catColor(row);
          return '<div class="cat-row">' +
            '<span class="cat-ic" style="background:' + color + '22;color:' + color + '">' + esc(row.emoji) + '</span>' +
            '<div class="cat-info">' +
              '<div class="cat-top"><span>' + esc(row.name) + '</span><span class="muted">' + formatMoney(row.total) + '</span></div>' +
              '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(3, Math.round(row.total / (topExpenses[0].total || 1) * 100)) + '%;background:' + color + '"></div></div>' +
            '</div>' +
          '</div>';
        }).join('')
      : '<p class="hint">Todavía no hay gastos este mes.</p>';

    return '<div class="page-head">' +
        '<div><p class="eyebrow">' + esc(greeting()) + '</p><h2>Tu resumen</h2></div>' +
        '<button class="btn ghost sm" data-action="add-movement">' + ICON.plus + ' Agregar</button>' +
      '</div>' +
      '<section class="hero">' +
        '<p class="hero-label">Saldo total</p>' +
        '<div class="hero-amount">' + formatMoney(totalBalance()) + '</div>' +
        '<div class="hero-grid">' +
          '<div class="hero-stat"><span>Ingresos de ' + esc(monthName(ym)) + '</span><b class="in">+ ' + formatMoney(totals.income) + '</b></div>' +
          '<div class="hero-stat"><span>Gastos de ' + esc(monthName(ym)) + '</span><b class="out">− ' + formatMoney(totals.expense) + '</b></div>' +
        '</div>' +
      '</section>' +
      '<div class="quick-grid">' +
        '<div class="quick-card"><span>Balance del mes</span><b class="' + (net < 0 ? 'out' : 'in') + '">' + formatMoney(net) + '</b></div>' +
        '<div class="quick-card"><span>Movimientos</span><b>' + totals.count + '</b></div>' +
        '<div class="quick-card"><span>Gasto promedio / día</span><b>' + formatMoney(average) + '</b></div>' +
        '<div class="quick-card"><span>Donde más gastas</span><b style="font-size:15px">' + esc(topExpenses[0] ? topExpenses[0].name : '—') + '</b></div>' +
      '</div>' +
      '<section class="card mt-16">' +
        '<div class="section-head"><h3>Cuentas</h3><button class="link" data-action="nav" data-view="cuentas">Ver todas</button></div>' +
        '<div class="row-list">' + accountsHtml + '</div>' +
      '</section>' +
      '<section class="card">' +
        '<div class="section-head"><h3>Últimos movimientos</h3><button class="link" data-action="nav" data-view="movimientos">Ver todos</button></div>' +
        recentHtml +
      '</section>' +
      '<section class="card">' +
        '<div class="section-head"><h3>Gastos por categoría</h3><button class="link" data-action="nav" data-view="estadisticas">Ver más</button></div>' +
        topHtml +
      '</section>';
  }

  function viewMovimientos() {
    const accountOptions = state.accounts.map((account) =>
      '<option value="' + esc(account.id) + '"' + (ui.movAccount === account.id ? ' selected' : '') + '>' + esc(account.name) + '</option>'
    ).join('');

    const typeChips = [
      ['all', 'Todos'],
      ['income', 'Ingresos'],
      ['expense', 'Gastos']
    ].map(([value, label]) =>
      '<button class="chip' + (ui.movType === value ? ' active' : '') + '" data-action="mov-type-filter" data-value="' + value + '">' + label + '</button>'
    ).join('');

    return '<div class="page-head">' +
        '<div><p class="eyebrow">Historial</p><h2>Movimientos</h2></div>' +
        '<button class="btn sm" data-action="add-movement">' + ICON.plus + ' Agregar</button>' +
      '</div>' +
      '<section class="card">' +
        '<div class="filters">' +
          '<div class="search">' + ICON.search +
            '<input class="input" id="movSearch" type="search" autocomplete="off" placeholder="Buscar por descripción, categoría o cuenta" value="' + esc(ui.movQuery) + '" aria-label="Buscar movimientos">' +
          '</div>' +
          '<div class="filter-top">' +
            '<input class="input" id="movMonth" type="month" value="' + esc(ui.movMonth) + '" aria-label="Filtrar por mes" style="max-width:190px">' +
            '<select class="select" id="movAccount" aria-label="Filtrar por cuenta" style="max-width:210px">' +
              '<option value="all"' + (ui.movAccount === 'all' ? ' selected' : '') + '>Todas las cuentas</option>' + accountOptions +
            '</select>' +
            '<button class="chip' + (!ui.movMonth ? ' active' : '') + '" data-action="clear-month">Todo</button>' +
          '</div>' +
          '<div class="chips">' + typeChips + '</div>' +
        '</div>' +
      '</section>' +
      '<div id="movResults">' + movementResultsHTML() + '</div>';
  }

  function movementResultsHTML() {
    const list = filteredMovements();
    const income = list.filter((m) => m.type === 'income').reduce((sum, m) => sum + movementTotal(m), 0);
    const expense = list.filter((m) => m.type === 'expense').reduce((sum, m) => sum + movementTotal(m), 0);

    if (!state.movements.length) {
      return '<section class="card mt-16">' + emptyState(
        '🌱',
        'Aún no hay movimientos',
        'Registra tu primer ingreso o gasto y aparecerá aquí.',
        '<button class="btn sm" data-action="add-movement">Agregar movimiento</button>'
      ) + '</section>';
    }

    if (!list.length) {
      return '<section class="card mt-16">' + emptyState(
        '🔎',
        'Sin resultados',
        'No encontramos movimientos con estos filtros. Prueba con otro mes, otra cuenta o borra la búsqueda.',
        '<button class="btn ghost sm" data-action="clear-filters">Limpiar filtros</button>'
      ) + '</section>';
    }

    const groups = new Map();
    list.forEach((movement) => {
      if (!groups.has(movement.date)) groups.set(movement.date, []);
      groups.get(movement.date).push(movement);
    });

    let rows = '';
    groups.forEach((items, date) => {
      rows += '<div class="day-head">' + esc(dayHeading(date)) + '</div>' +
        '<div class="row-list">' + items.map(movementRow).join('') + '</div>';
    });

    return '<section class="card mt-16">' +
      '<div class="section-head" style="margin-bottom:4px">' +
        '<h3>' + list.length + ' movimiento' + (list.length === 1 ? '' : 's') + '</h3>' +
        '<span class="hint">+ ' + formatMoney(income) + ' · − ' + formatMoney(expense) + '</span>' +
      '</div>' +
      rows +
    '</section>';
  }

  function viewCuentas() {
    const total = totalBalance();
    const cards = state.accounts.length
      ? state.accounts.map((account) => {
          const balance = accountBalance(account.id);
          const count = movementCountForAccount(account.id);
          return '<article class="account-card">' +
            '<div class="account-top">' +
              '<span class="acct-dot" style="background:' + esc(account.color) + '">' + esc(initial(account.name)) + '</span>' +
              '<div><div class="account-name">' + esc(account.name) + '</div>' +
              '<div class="account-sub">' + count + ' movimiento' + (count === 1 ? '' : 's') + '</div></div>' +
            '</div>' +
            '<div class="account-balance' + (balance < 0 ? ' out' : '') + '">' + formatMoney(balance) + '</div>' +
            '<div class="account-actions">' +
              '<button class="btn ghost sm" data-action="edit-account" data-id="' + esc(account.id) + '">' + ICON.edit + ' Editar</button>' +
              '<button class="icon-btn sm danger" data-action="delete-account" data-id="' + esc(account.id) + '" aria-label="Eliminar ' + esc(account.name) + '">' + ICON.trash + '</button>' +
            '</div>' +
          '</article>';
        }).join('')
      : emptyState('🏦', 'Sin cuentas', 'Crea una cuenta para separar tu dinero por banco, billetera o efectivo.',
          '<button class="btn sm" data-action="add-account">Crear cuenta</button>');

    return '<div class="page-head">' +
        '<div><p class="eyebrow">Patrimonio</p><h2>Cuentas</h2></div>' +
        '<button class="btn sm" data-action="add-account">' + ICON.plus + ' Nueva</button>' +
      '</div>' +
      '<section class="hero">' +
        '<p class="hero-label">Saldo total</p>' +
        '<div class="hero-amount">' + formatMoney(total) + '</div>' +
        '<div class="hero-grid">' +
          '<div class="hero-stat"><span>Cuentas</span><b>' + state.accounts.length + '</b></div>' +
          '<div class="hero-stat"><span>Movimientos</span><b>' + state.movements.length + '</b></div>' +
        '</div>' +
      '</section>' +
      '<div class="section-head mt-24"><h3>Tus cuentas</h3><span class="hint">' + state.accounts.length + ' en total</span></div>' +
      '<div class="account-grid">' + cards + '</div>';
  }

  function viewEstadisticas() {
    const ym = ui.statsMonth;
    const totals = monthTotals(ym);
    const net = totals.income - totals.expense;
    const expenses = categoryBreakdown('expense', ym);
    const incomes = categoryBreakdown('income', ym);
    const months = lastMonths(6).map((month) => ({ ym: month, ...monthTotals(month) }));
    const max = Math.max(1, ...months.map((month) => Math.max(month.income, month.expense)));

    return '<div class="page-head">' +
        '<div><p class="eyebrow">Análisis</p><h2>Estadísticas</h2></div>' +
        '<input class="input" id="statsMonth" type="month" value="' + esc(ym) + '" aria-label="Mes de las estadísticas" style="max-width:190px">' +
      '</div>' +
      '<div class="stat-grid">' +
        '<div class="stat-card"><span>Ingresos · ' + esc(monthName(ym)) + '</span><b class="in">' + formatMoney(totals.income) + '</b></div>' +
        '<div class="stat-card"><span>Gastos · ' + esc(monthName(ym)) + '</span><b class="out">' + formatMoney(totals.expense) + '</b></div>' +
        '<div class="stat-card"><span>Balance</span><b class="' + (net < 0 ? 'out' : 'in') + '">' + formatMoney(net) + '</b></div>' +
      '</div>' +
      '<section class="card mt-16">' +
        '<div class="section-head"><h3>Últimos 6 meses</h3></div>' +
        chartHTML(months, max) +
        '<div class="legend"><span><i style="background:var(--income)"></i>Ingresos</span><span><i style="background:var(--expense)"></i>Gastos</span></div>' +
      '</section>' +
      '<section class="card mt-16">' +
        '<div class="section-head"><h3>Gastos por categoría</h3><span class="hint">' + esc(monthName(ym)) + '</span></div>' +
        breakdownHTML(expenses, 'expense') +
      '</section>' +
      '<section class="card mt-16">' +
        '<div class="section-head"><h3>Ingresos por categoría</h3><span class="hint">' + esc(monthName(ym)) + '</span></div>' +
        breakdownHTML(incomes, 'income') +
      '</section>';
  }

  function themeChoice(value, label, icon) {
    return '<button class="theme-choice' + (state.theme === value ? ' active' : '') + '" data-action="theme-choice" data-theme="' + value + '">' +
      icon + '<span>' + label + '</span>' +
    '</button>';
  }

  function categoryGroup(type, title) {
    const categories = state.categories.filter((category) => category.type === type);
    const items = categories.map((category) => {
      const count = state.movements.filter((movement) => movement.categoryId === category.id).length;
      const color = catColor(category);
      return '<div class="category-item">' +
        '<span class="cat-ic" style="background:' + color + '22;color:' + color + '">' + esc(category.emoji) + '</span>' +
        '<span class="name">' + esc(category.name) + '</span>' +
        '<span class="count">' + count + '</span>' +
        '<button class="icon-btn sm danger" data-action="delete-category" data-id="' + esc(category.id) + '" aria-label="Eliminar categoría ' + esc(category.name) + '"' + (count ? ' disabled' : '') + '>' + ICON.trash + '</button>' +
      '</div>';
    }).join('');

    return '<div>' +
      '<div class="category-group-head"><h4>' + title + '</h4>' +
        '<button class="icon-btn sm" data-action="add-category" data-type="' + type + '" aria-label="Agregar categoría">' + ICON.plus + '</button>' +
      '</div>' +
      '<div class="category-list">' + (items || '<p class="hint">Sin categorías.</p>') + '</div>' +
    '</div>';
  }

  function viewAjustes() {
    return '<div class="page-head"><div><p class="eyebrow">Preferencias</p><h2>Ajustes</h2></div></div>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Apariencia</h3>' +
        '<p class="settings-desc">Elige cómo se ve Zent en este dispositivo.</p>' +
        '<div class="theme-choices">' +
          themeChoice('system', 'Sistema', ICON.monitor) +
          themeChoice('light', 'Claro', ICON.sun) +
          themeChoice('dark', 'Oscuro', ICON.moon) +
        '</div>' +
      '</section>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Categorías</h3>' +
        '<p class="settings-desc">Agrega categorías propias. Las que ya tienen movimientos no se pueden eliminar.</p>' +
        '<div class="category-groups">' +
          categoryGroup('expense', 'Gastos') +
          categoryGroup('income', 'Ingresos') +
        '</div>' +
      '</section>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Datos</h3>' +
        '<p class="settings-desc">Zent guarda todo en este dispositivo. Exporta un respaldo antes de borrar los datos del navegador.</p>' +
        '<div class="data-actions">' +
          '<button class="btn ghost" data-action="export-data">' + ICON.download + ' Exportar respaldo</button>' +
          '<button class="btn ghost" data-action="import-data">' + ICON.upload + ' Importar</button>' +
          '<button class="btn danger" data-action="clear-data">' + ICON.trash + ' Borrar todo</button>' +
        '</div>' +
        '<input type="file" id="importFile" accept="application/json,.json" hidden>' +
      '</section>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Acerca de</h3>' +
        '<div class="about-box">' +
          '<img class="about-logo" src="icons/zent.svg" alt="Zent" width="46" height="46">' +
          '<div><b>Zent</b><span>Versión ' + APP_VERSION + ' · Peso colombiano (COP)</span><span>Tus datos se sincronizan en Supabase.</span></div>' +
        '</div>' +
      '</section>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Cuenta</h3>' +
        '<div class="data-actions">' +
          '<button class="btn danger" data-action="sign-out">Cerrar sesión</button>' +
        '</div>' +
      '</section>';
  }

  const RENDERERS = {
    resumen: viewResumen,
    movimientos: viewMovimientos,
    cuentas: viewCuentas,
    estadisticas: viewEstadisticas,
    ajustes: viewAjustes
  };

  /* ------------------------------------------------------------
     Navegación y render
     ------------------------------------------------------------ */

  function currentView() {
    const raw = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return VIEW_META[raw] ? raw : 'resumen';
  }

  function navigate(view) {
    const target = VIEW_META[view] ? view : 'resumen';
    if (currentView() === target && location.hash) {
      render();
      return;
    }
    location.hash = '#/' + target;
  }

  function applyTheme() {
    if (state.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', state.theme);

    const themeBtn = $('#themeBtn');
    if (themeBtn) themeBtn.innerHTML = effectiveTheme() === 'dark' ? ICON.sun : ICON.moon;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effectiveTheme() === 'dark' ? '#0b0f1a' : '#5b5bd6');
  }

  function effectiveTheme() {
    if (state.theme === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return state.theme;
  }

  function render() {
    const view = currentView();
    document.body.dataset.view = view;
    const title = $('#topTitle');
    if (title) title.textContent = VIEW_META[view].title;

    $$('[data-action="nav"][data-view]').forEach((element) => {
      element.classList.toggle('active', element.dataset.view === view);
    });

    const root = $('#view');
    if (!root) return;
    root.innerHTML = RENDERERS[view]();
    if (ui.renderedView !== view) {
      ui.renderedView = view;
      window.scrollTo(0, 0);
    }
  }

  /* ------------------------------------------------------------
     Modales
     ------------------------------------------------------------ */

  function openModal(html) {
    const root = $('#modalRoot');
    if (!root) return;
    ui.lastFocus = document.activeElement;
    root.innerHTML = '<div class="modal-backdrop" data-backdrop>' +
      '<div class="modal" role="dialog" aria-modal="true">' + html + '</div>' +
    '</div>';
    const dialog = root.querySelector('.modal');
    const heading = dialog && dialog.querySelector('.modal-head h2');
    if (heading) dialog.setAttribute('aria-label', heading.textContent);
    document.body.classList.add('modal-open');
    const target = root.querySelector('[data-autofocus]') || root.querySelector('input, select, textarea, button');
    if (target) setTimeout(() => { try { target.focus(); } catch (error) { /* ignorar */ } }, 40);
  }

  function closeModal() {
    const root = $('#modalRoot');
    if (!root || !root.firstElementChild) return;
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
    ui.confirmCallback = null;
    if (ui.lastFocus && typeof ui.lastFocus.focus === 'function') {
      try { ui.lastFocus.focus(); } catch (error) { /* ignorar */ }
    }
    ui.lastFocus = null;
  }

  function refreshMovementForm() {
    const modal = $('#modalRoot .modal');
    if (!modal) return;
    modal.innerHTML = movementFormHTML();
    const amount = $('#movAmount');
    if (amount) setTimeout(() => { try { amount.focus(); } catch (error) { /* ignorar */ } }, 20);
  }

  function updateGmfHint() {
    const draft = ui.movementDraft;
    const hint = $('#movGmfHint');
    if (!draft || !hint) return;
    const amountInput = $('#movAmount');
    const gmfInput = $('#movGmf');
    const amount = Number(amountInput ? amountInput.dataset.raw : draft.amount) || 0;
    const enabled = gmfInput ? gmfInput.checked : draft.gmf;
    hint.textContent = gmfHintText(amount, draft.type, enabled);
  }

  function movementFormHTML() {
    const draft = ui.movementDraft;
    if (!draft) return '';
    const categories = state.categories.filter((category) => category.type === draft.type);
    const categoryOptions = categories.map((category) =>
      '<option value="' + esc(category.id) + '"' + (category.id === draft.categoryId ? ' selected' : '') + '>' +
        esc(category.emoji + ' ' + category.name) +
      '</option>'
    ).join('');
    const accountOptions = state.accounts.map((account) =>
      '<option value="' + esc(account.id) + '"' + (account.id === draft.accountId ? ' selected' : '') + '>' + esc(account.name) + '</option>'
    ).join('');

    return '<div class="modal-head">' +
        '<h2>' + (draft.id ? 'Editar movimiento' : 'Nuevo movimiento') + '</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="movementForm" novalidate>' +
        '<div class="segmented" role="group" aria-label="Tipo de movimiento">' +
          '<button type="button" class="' + (draft.type === 'expense' ? 'active expense' : '') + '" data-action="movement-type" data-type="expense">Gasto</button>' +
          '<button type="button" class="' + (draft.type === 'income' ? 'active income' : '') + '" data-action="movement-type" data-type="income">Ingreso</button>' +
        '</div>' +
        '<div class="field">' +
          '<label for="movAmount">Monto</label>' +
          '<input class="input amount-input" id="movAmount" inputmode="numeric" autocomplete="off" placeholder="$ 0" value="' + (draft.amount ? formatNumberInput(draft.amount) : '') + '" data-raw="' + (draft.amount || '') + '" data-amount-input data-autofocus>' +
        '</div>' +
        '<label class="gmf-box">' +
          '<input type="checkbox" id="movGmf"' + (draft.gmf ? ' checked' : '') + '>' +
          '<span class="gmf-text">Aplicar 4x1000<small id="movGmfHint">' + esc(gmfHintText(draft.amount, draft.type, draft.gmf)) + '</small></span>' +
        '</label>' +
        '<div class="field">' +
          '<label for="movDescription">Descripción</label>' +
          '<input class="input" id="movDescription" maxlength="80" autocomplete="off" placeholder="Ej. Almuerzo, salario, mercado" value="' + esc(draft.description) + '">' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="formCategory">Categoría</label><select class="select" id="formCategory">' + categoryOptions + '</select></div>' +
          '<div class="field"><label for="formAccount">Cuenta</label><select class="select" id="formAccount">' + accountOptions + '</select></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="movDate">Fecha</label><input class="input" id="movDate" type="date" value="' + esc(draft.date) + '"></div>' +
          '<div class="field"><label for="movNote">Nota (opcional)</label><input class="input" id="movNote" maxlength="140" autocomplete="off" placeholder="Detalle corto" value="' + esc(draft.note) + '"></div>' +
        '</div>' +
        (draft.id ? '<button type="button" class="btn danger block" data-action="delete-movement" data-id="' + esc(draft.id) + '">' + ICON.trash + ' Eliminar movimiento</button>' : '') +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">' + (draft.id ? 'Guardar cambios' : 'Guardar movimiento') + '</button>' +
        '</div>' +
      '</form>';
  }

  function openMovementModal(id) {
    const existing = id ? state.movements.find((movement) => movement.id === id) : null;
    if (!state.accounts.length) {
      toast('Primero crea una cuenta.');
      navigate('cuentas');
      return;
    }

    const type = existing ? existing.type : 'expense';
    const firstCategory = state.categories.find((category) => category.type === type);
    ui.movementDraft = {
      id: existing ? existing.id : null,
      type,
      amount: existing ? existing.amount : 0,
      description: existing ? existing.description : '',
      categoryId: existing ? existing.categoryId : (firstCategory ? firstCategory.id : ''),
      accountId: existing ? existing.accountId : state.accounts[0].id,
      date: existing ? existing.date : todayISO(),
      note: existing ? existing.note : '',
      gmf: existing ? Boolean(existing.gmf) : false
    };
    openModal(movementFormHTML());
  }

  function syncMovementDraftFromForm() {
    const draft = ui.movementDraft;
    if (!draft) return;

    const amount = $('#movAmount');
    const description = $('#movDescription');
    const category = $('#formCategory');
    const account = $('#formAccount');
    const date = $('#movDate');
    const note = $('#movNote');
    const gmf = $('#movGmf');

    if (amount) draft.amount = Number(amount.dataset.raw || 0);
    if (description) draft.description = description.value;
    if (category) draft.categoryId = category.value;
    if (account) draft.accountId = account.value;
    if (date) draft.date = date.value;
    if (note) draft.note = note.value;
    if (gmf) draft.gmf = gmf.checked;
  }

  function saveMovement() {
    const draft = ui.movementDraft;
    if (!draft) return;
    syncMovementDraftFromForm();

    if (!draft.amount || draft.amount <= 0) {
      toast('Escribe un monto mayor a cero.');
      const amount = $('#movAmount');
      if (amount) amount.focus();
      return;
    }

    const category = categoryById(draft.categoryId);
    if (!draft.description.trim()) draft.description = category ? category.name : 'Movimiento';
    if (!accountById(draft.accountId)) {
      toast('Elige una cuenta válida.');
      return;
    }
    if (!draft.date) draft.date = todayISO();

    const wasEdit = !!draft.id;
    const now = new Date().toISOString();

    if (draft.id) {
      const movement = state.movements.find((item) => item.id === draft.id);
      if (movement) {
        movement.type = draft.type;
        movement.amount = draft.amount;
        movement.description = draft.description.trim();
        movement.categoryId = draft.categoryId;
        movement.accountId = draft.accountId;
        movement.date = draft.date;
        movement.note = draft.note.trim();
        movement.gmf = Boolean(draft.gmf);
        movement.updatedAt = now;
      }
    } else {
      state.movements.push({
        id: uid(),
        type: draft.type,
        amount: draft.amount,
        description: draft.description.trim(),
        categoryId: draft.categoryId,
        accountId: draft.accountId,
        date: draft.date,
        note: draft.note.trim(),
        gmf: Boolean(draft.gmf),
        createdAt: now,
        updatedAt: now
      });
    }

    save();
    closeModal();
    ui.movementDraft = null;
    render();
    toast(wasEdit ? 'Movimiento actualizado.' : 'Movimiento guardado.');
  }

  function deleteMovement(id) {
    const movement = state.movements.find((item) => item.id === id);
    if (!movement) return;
    confirmDialog({
      title: 'Eliminar movimiento',
      message: '¿Eliminar "' + movement.description + '" por ' + formatMoney(movement.amount) + '?',
      sub: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      onConfirm: () => {
        state.movements = state.movements.filter((item) => item.id !== id);
        save();
        ui.movementDraft = null;
        closeModal();
        render();
        toast('Movimiento eliminado.');
      }
    });
  }

  function openAccountModal(id) {
    const account = id ? accountById(id) : null;
    const defaultColor = PALETTE[state.accounts.length % PALETTE.length];
    openModal(
      '<div class="modal-head">' +
        '<h2>' + (account ? 'Editar cuenta' : 'Nueva cuenta') + '</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="accountForm" data-id="' + esc(account ? account.id : '') + '" novalidate>' +
        '<div class="field">' +
          '<label for="acctName">Nombre</label>' +
          '<input class="input" id="acctName" maxlength="40" autocomplete="off" placeholder="Ej. Nequi, Efectivo, Banco..." value="' + esc(account ? account.name : '') + '" data-autofocus>' +
        '</div>' +
        '<div class="field">' +
          '<label for="acctInitial">Saldo inicial (opcional)</label>' +
          '<input class="input" id="acctInitial" inputmode="numeric" autocomplete="off" placeholder="$ 0" value="' + (account && account.initial ? formatNumberInput(account.initial) : '') + '" data-raw="' + (account ? account.initial : '') + '" data-amount-input>' +
          '<p class="hint">Es el dinero que ya tenías en esta cuenta antes de empezar.</p>' +
        '</div>' +
        '<div class="field">' +
          '<label for="acctColor">Color</label>' +
          '<input id="acctColor" type="color" value="' + esc(account ? account.color : defaultColor) + '" style="width:100%;height:48px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2)">' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">' + (account ? 'Guardar cambios' : 'Crear cuenta') + '</button>' +
        '</div>' +
      '</form>'
    );
  }

  function saveAccount() {
    const form = $('#accountForm');
    if (!form) return;
    const id = form.dataset.id || '';
    const nameInput = $('#acctName');
    const initialInput = $('#acctInitial');
    const colorInput = $('#acctColor');
    const name = nameInput ? nameInput.value.trim() : '';
    const initial = initialInput ? Number(initialInput.dataset.raw || 0) : 0;
    const color = colorInput && isColor(colorInput.value) ? colorInput.value : PALETTE[0];

    if (!name) {
      toast('Escribe un nombre para la cuenta.');
      if (nameInput) nameInput.focus();
      return;
    }

    const duplicate = state.accounts.some((account) =>
      account.id !== id && normalizeText(account.name) === normalizeText(name)
    );
    if (duplicate) {
      toast('Ya existe una cuenta con ese nombre.');
      return;
    }

    if (id) {
      const account = accountById(id);
      if (account) {
        account.name = name;
        account.initial = toAmount(initial);
        account.color = color;
      }
    } else {
      state.accounts.push({ id: uid(), name, initial: toAmount(initial), color });
    }

    save();
    closeModal();
    render();
    toast(id ? 'Cuenta actualizada.' : 'Cuenta creada.');
  }

  function deleteAccount(id) {
    const account = accountById(id);
    if (!account) return;
    if (state.accounts.length <= 1) {
      toast('Necesitas al menos una cuenta.');
      return;
    }
    const count = movementCountForAccount(id);
    if (count > 0) {
      toast('No puedes eliminar una cuenta con movimientos. Primero elimina o cambia esos movimientos.');
      return;
    }
    confirmDialog({
      title: 'Eliminar cuenta',
      message: '¿Eliminar la cuenta "' + account.name + '"?',
      sub: 'No tiene movimientos asociados.',
      confirmText: 'Eliminar',
      onConfirm: () => {
        state.accounts = state.accounts.filter((item) => item.id !== id);
        save();
        closeModal();
        render();
        toast('Cuenta eliminada.');
      }
    });
  }

  function openCategoryModal(type) {
    const kind = type === 'income' ? 'income' : 'expense';
    openModal(
      '<div class="modal-head">' +
        '<h2>Nueva categoría</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="categoryForm" data-type="' + kind + '" novalidate>' +
        '<div class="field">' +
          '<label for="catName">Nombre</label>' +
          '<input class="input" id="catName" maxlength="40" autocomplete="off" placeholder="Ej. Mascotas, Café, Freelance" value="" data-autofocus>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field">' +
            '<label for="catEmoji">Emoji</label>' +
            '<input class="input" id="catEmoji" maxlength="4" autocomplete="off" value="' + (kind === 'income' ? '💰' : '📦') + '">' +
          '</div>' +
          '<div class="field">' +
            '<label for="catColor">Color</label>' +
            '<input id="catColor" type="color" value="' + PALETTE[state.categories.length % PALETTE.length] + '" style="width:100%;height:48px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2)">' +
          '</div>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">Crear categoría</button>' +
        '</div>' +
      '</form>'
    );
  }

  function saveCategory() {
    const form = $('#categoryForm');
    if (!form) return;
    const type = form.dataset.type === 'income' ? 'income' : 'expense';
    const nameInput = $('#catName');
    const emojiInput = $('#catEmoji');
    const colorInput = $('#catColor');
    const name = nameInput ? nameInput.value.trim() : '';
    const emoji = emojiInput ? emojiInput.value.trim().slice(0, 4) : '';
    const color = colorInput && isColor(colorInput.value) ? colorInput.value : PALETTE[0];

    if (!name) {
      toast('Escribe un nombre para la categoría.');
      if (nameInput) nameInput.focus();
      return;
    }

    const duplicate = state.categories.some((category) =>
      category.type === type && normalizeText(category.name) === normalizeText(name)
    );
    if (duplicate) {
      toast('Ya existe una categoría con ese nombre.');
      return;
    }

    state.categories.push({
      id: uid(),
      name,
      type,
      emoji: emoji || (type === 'income' ? '💰' : '📦'),
      color
    });
    save();
    closeModal();
    render();
    toast('Categoría creada.');
  }

  function deleteCategory(id) {
    const category = categoryById(id);
    if (!category) return;
    const count = state.movements.filter((movement) => movement.categoryId === id).length;
    if (count > 0) {
      toast('Esta categoría tiene movimientos; no se puede eliminar.');
      return;
    }
    const sameType = state.categories.filter((item) => item.type === category.type);
    if (sameType.length <= 1) {
      toast('Necesitas al menos una categoría de este tipo.');
      return;
    }
    confirmDialog({
      title: 'Eliminar categoría',
      message: '¿Eliminar la categoría "' + category.name + '"?',
      sub: 'No tiene movimientos asociados.',
      confirmText: 'Eliminar',
      onConfirm: () => {
        state.categories = state.categories.filter((item) => item.id !== id);
        save();
        closeModal();
        render();
        toast('Categoría eliminada.');
      }
    });
  }

  function confirmDialog(options) {
    ui.confirmCallback = options.onConfirm;
    openModal(
      '<div class="modal-head">' +
        '<h2>' + esc(options.title) + '</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<p class="confirm-text">' + esc(options.message) + '</p>' +
      (options.sub ? '<p class="confirm-sub">' + esc(options.sub) + '</p>' : '') +
      '<div class="modal-actions">' +
        '<button class="btn ghost" data-action="close-modal">Cancelar</button>' +
        '<button class="btn ' + (options.danger === false ? '' : 'danger') + '" data-action="confirm-action">' + esc(options.confirmText || 'Confirmar') + '</button>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------
     Datos: exportar, importar y borrar
     ------------------------------------------------------------ */

  function exportData() {
    const payload = {
      app: 'zent',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zent-' + todayISO() + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Respaldo descargado.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const data = parsed && parsed.data ? parsed.data : parsed;
        if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.categories) || !Array.isArray(data.movements)) {
          throw new Error('Formato no válido');
        }
        const next = normalizeState(data);
        confirmDialog({
          title: 'Importar respaldo',
          message: 'Se reemplazarán los datos actuales por ' + next.movements.length + ' movimiento' + (next.movements.length === 1 ? '' : 's') + ' y ' + next.accounts.length + ' cuenta' + (next.accounts.length === 1 ? '' : 's') + '.',
          sub: 'Los datos actuales de este dispositivo se perderán.',
          confirmText: 'Importar',
          danger: false,
          onConfirm: () => {
            state = next;
            save();
            closeModal();
            render();
            toast('Respaldo importado.');
          }
        });
      } catch (error) {
        toast('El archivo no es un respaldo válido de Zent.');
      }
    };
    reader.onerror = () => toast('No se pudo leer el archivo.');
    reader.readAsText(file);
  }

  function clearAllData() {
    confirmDialog({
      title: 'Borrar todos los datos',
      message: 'Se eliminarán todos tus movimientos, cuentas y categorías personalizadas de este dispositivo.',
      sub: 'Esta acción no se puede deshacer. Exporta un respaldo antes si quieres conservar algo.',
      confirmText: 'Borrar todo',
      onConfirm: () => {
        const theme = state.theme;
        state = freshState();
        state.theme = theme;
        save();
        closeModal();
        render();
        toast('Datos borrados.');
      }
    });
  }

  /* ------------------------------------------------------------
     Filtros
     ------------------------------------------------------------ */

  function renderMovementResults() {
    const container = $('#movResults');
    if (container) container.innerHTML = movementResultsHTML();
  }

  function clearFilters() {
    ui.movMonth = currentMonth();
    ui.movType = 'all';
    ui.movQuery = '';
    ui.movAccount = 'all';
    render();
  }

  /* ------------------------------------------------------------
     Toast
     ------------------------------------------------------------ */

  let toastTimer = null;

  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('on'), 2400);
  }

  /* ------------------------------------------------------------
     Eventos
     ------------------------------------------------------------ */

  document.addEventListener('click', (event) => {
    if (event.target && event.target.matches && event.target.matches('[data-backdrop]')) {
      closeModal();
      return;
    }

    const button = event.target.closest ? event.target.closest('[data-action]') : null;
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id || '';

    switch (action) {
      case 'nav':
        navigate(button.dataset.view);
        break;

      case 'add-movement':
        openMovementModal();
        break;

      case 'edit-movement':
        openMovementModal(id);
        break;

      case 'delete-movement':
        deleteMovement(id);
        break;

      case 'movement-type': {
        syncMovementDraftFromForm();
        const draft = ui.movementDraft;
        if (!draft) break;
        draft.type = button.dataset.type === 'income' ? 'income' : 'expense';
        const category = categoryById(draft.categoryId);
        if (!category || category.type !== draft.type) {
          const fallback = state.categories.find((item) => item.type === draft.type);
          draft.categoryId = fallback ? fallback.id : '';
        }
        refreshMovementForm();
        break;
      }

      case 'close-modal':
        closeModal();
        break;

      case 'confirm-action': {
        const callback = ui.confirmCallback;
        ui.confirmCallback = null;
        if (callback) callback();
        break;
      }

      case 'add-account':
        openAccountModal();
        break;

      case 'edit-account':
        openAccountModal(id);
        break;

      case 'delete-account':
        deleteAccount(id);
        break;

      case 'add-category':
        openCategoryModal(button.dataset.type);
        break;

      case 'delete-category':
        deleteCategory(id);
        break;

      case 'mov-type-filter':
        ui.movType = button.dataset.value || 'all';
        $$('[data-action="mov-type-filter"]').forEach((chip) => {
          chip.classList.toggle('active', chip.dataset.value === ui.movType);
        });
        renderMovementResults();
        break;

      case 'clear-month':
        ui.movMonth = '';
        render();
        break;

      case 'clear-filters':
        clearFilters();
        break;

      case 'theme-choice':
        state.theme = button.dataset.theme === 'dark' ? 'dark' : (button.dataset.theme === 'light' ? 'light' : 'system');
        save();
        applyTheme();
        render();
        break;

      case 'cycle-theme':
        state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
        save();
        applyTheme();
        render();
        break;

      case 'export-data':
        exportData();
        break;

      case 'import-data': {
        const input = $('#importFile');
        if (input) input.click();
        break;
      }

      case 'clear-data':
        clearAllData();
        break;

      case 'sign-out':
        (async () => {
          try {
            if (window.sync) await sync.signOut();
          } catch (error) {
            console.warn('Zent: error al cerrar sesión.', error);
          }
          try {
            localStorage.removeItem(STORE_KEY);
          } catch (error) {
            /* sin acceso a localStorage */
          }
          location.href = 'login.html';
        })();
        break;

      default:
        break;
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target;

    if (target.id === 'movSearch') {
      ui.movQuery = target.value;
      renderMovementResults();
      return;
    }

    if (target.matches && target.matches('[data-amount-input]')) {
      const digits = String(target.value || '').replace(/\D/g, '').slice(0, 12);
      target.dataset.raw = digits;
      target.value = digits ? formatNumberInput(Number(digits)) : '';
      updateGmfHint();
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;

    if (target.id === 'movMonth') {
      ui.movMonth = target.value;
      const chip = document.querySelector('[data-action="clear-month"]');
      if (chip) chip.classList.toggle('active', !ui.movMonth);
      renderMovementResults();
      return;
    }

    if (target.id === 'movAccount') {
      ui.movAccount = target.value;
      renderMovementResults();
      return;
    }

    if (target.id === 'statsMonth') {
      ui.statsMonth = target.value || currentMonth();
      render();
      return;
    }

    if (target.id === 'movGmf') {
      if (ui.movementDraft) ui.movementDraft.gmf = target.checked;
      updateGmfHint();
      return;
    }

    if (target.id === 'importFile') {
      const file = target.files && target.files[0];
      target.value = '';
      if (file) importData(file);
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form || !form.id) return;
    if (form.id === 'movementForm') {
      event.preventDefault();
      saveMovement();
    } else if (form.id === 'accountForm') {
      event.preventDefault();
      saveAccount();
    } else if (form.id === 'categoryForm') {
      event.preventDefault();
      saveCategory();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const root = $('#modalRoot');
      if (root && root.firstElementChild) closeModal();
    }
  });

  window.addEventListener('hashchange', () => {
    closeModal();
    render();
  });

  if (window.matchMedia) {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof darkMedia.addEventListener === 'function') {
      darkMedia.addEventListener('change', () => {
        if (state.theme === 'system') applyTheme();
      });
    }
  }

  /* ------------------------------------------------------------
     Service worker
     ------------------------------------------------------------ */

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !isLocal) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((error) => {
        console.warn('Zent: no se pudo registrar el service worker.', error);
      });
    });
  }

  /* ------------------------------------------------------------
     Inicio
     ------------------------------------------------------------ */

  applyTheme();
  render();
  registerServiceWorker();

  (async () => {
    if (!window.sync) return;
    try {
      const synced = await sync.loadStateFromSupabase();
      if (synced) {
        state = normalizeState(synced);
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(state));
        } catch (error) {
          console.warn('Zent: no se pudo guardar la copia local.', error);
        }
        render();
      } else if (state.movements.length > 0 || state.accounts.length > 0) {
        // Primera vez con esta cuenta: sube lo que ya exista en este dispositivo.
        await sync.saveState(state);
      }
    } catch (error) {
      console.warn('Zent: no se pudo sincronizar con Supabase.', error);
    }
  })();
})();

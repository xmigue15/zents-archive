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
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5M7 9l5-5 5 5M5 20h14"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h15M16 5l3 3-3 3M20 16H5M8 13l-3 3 3 3"/></svg>'
  };

  /* Iconos propios de Zent (reemplazan a los emojis) */
  const CATEGORY_ICONS = {
    comida: 'comida',
    mercado: 'supermercado',
    transporte: 'bus',
    servicios: 'servicios',
    salud: 'salud',
    ropa: 'ropa',
    ocio: 'ocio',
    hogar: 'hogar',
    educacion: 'universidad',
    'otros-gastos': 'mas',
    salario: 'trabajo',
    ventas: 'etiqueta',
    transferencias: 'transferencia',
    'otros-ingresos': 'dinero'
  };

  function iconSVG(id, clase) {
    if (typeof window.zentIcono !== 'function') return '';
    const icon = (window.ZENT_ICONOS && window.ZENT_ICONOS[id]) ? id : 'mas';
    return window.zentIcono(icon, clase || '');
  }

  function iconPickerHTML(actual) {
    if (!window.ZENT_ICONOS) return '';
    const selected = (window.ZENT_ICONOS[actual] ? actual : 'mas');
    const ids = Object.keys(window.ZENT_ICONOS);
    return '<div class="field icon-picker">' +
      '<label>Icono</label>' +
      '<div class="icon-grid" data-selected="' + esc(selected) + '">' +
        ids.map((id) =>
          '<button type="button" class="icon-opt' + (id === selected ? ' active' : '') + '" ' +
            'data-action="pick-icon" data-icon="' + esc(id) + '" title="' + esc(id) + '" aria-label="' + esc(id) + '">' +
            iconSVG(id) +
          '</button>'
        ).join('') +
      '</div>' +
      '<input type="hidden" id="catIcon" value="' + esc(selected) + '">' +
    '</div>';
  }

  const ACCOUNT_LOGOS = [
    { id: 'cash', name: 'Efectivo' },
    { id: 'nequi', name: 'Nequi' },
    { id: 'daviplata', name: 'Daviplata' },
    { id: 'bancolombia', name: 'Bancolombia' },
    { id: 'bogota', name: 'Banco de Bogotá' },
    { id: 'bbva', name: 'BBVA' },
    { id: 'davivienda', name: 'Davivienda' },
    { id: 'itau', name: 'Itaú' },
    { id: 'movii', name: 'Movii' },
    { id: 'rappipay', name: 'RappiPay' },
    { id: 'nu', name: 'Nu' }
  ];

  const ACCOUNT_LOGO_IDS = ACCOUNT_LOGOS.map((logo) => logo.id);

  const DEFAULT_ACCOUNTS = () => ([
    { id: 'cash', name: 'Efectivo', logo: 'cash', initial: 0 },
    { id: 'nequi', name: 'Nequi', logo: 'nequi', initial: 0 },
    { id: 'daviplata', name: 'Daviplata', logo: 'daviplata', initial: 0 },
    { id: 'bancolombia', name: 'Bancolombia', logo: 'bancolombia', initial: 0 },
    { id: 'bogota', name: 'Banco de Bogotá', logo: 'bogota', initial: 0 },
    { id: 'bbva', name: 'BBVA', logo: 'bbva', initial: 0 },
    { id: 'davivienda', name: 'Davivienda', logo: 'davivienda', initial: 0 },
    { id: 'itau', name: 'Itaú', logo: 'itau', initial: 0 },
    { id: 'movii', name: 'Movii', logo: 'movii', initial: 0 },
    { id: 'rappipay', name: 'RappiPay', logo: 'rappipay', initial: 0 },
    { id: 'nu', name: 'Nu', logo: 'nu', initial: 0 }
  ]);

  const DEFAULT_CATEGORIES = () => ([
    { id: 'comida', name: 'Comida', type: 'expense', icon: 'comida' },
    { id: 'mercado', name: 'Mercado', type: 'expense', icon: 'supermercado' },
    { id: 'transporte', name: 'Transporte', type: 'expense', icon: 'bus' },
    { id: 'servicios', name: 'Servicios', type: 'expense', icon: 'servicios' },
    { id: 'salud', name: 'Salud', type: 'expense', icon: 'salud' },
    { id: 'ropa', name: 'Ropa', type: 'expense', icon: 'ropa' },
    { id: 'ocio', name: 'Ocio', type: 'expense', icon: 'ocio' },
    { id: 'hogar', name: 'Hogar', type: 'expense', icon: 'hogar' },
    { id: 'educacion', name: 'Educación', type: 'expense', icon: 'universidad' },
    { id: 'otros-gastos', name: 'Otros', type: 'expense', icon: 'mas' },
    { id: 'salario', name: 'Salario', type: 'income', icon: 'trabajo' },
    { id: 'ventas', name: 'Ventas', type: 'income', icon: 'etiqueta' },
    { id: 'transferencias', name: 'Transferencias', type: 'income', icon: 'transferencia' },
    { id: 'otros-ingresos', name: 'Otros ingresos', type: 'income', icon: 'dinero' }
  ]);

  function freshState() {
    return {
      version: 1,
      theme: 'system',
      defaultsVersion: 3,
      profile: { name: '', photoData: '' },
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

  /* ------------------------------------------------------------
     Contador animado: los montos suben de 0 a su valor al entrar
     ------------------------------------------------------------ */

  const COUNT_DURATION = 1000;
  const COUNT_STAGGER = 60;

  function runCounters(scope) {
    if (!scope) return;
    const nodes = scope.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stagger = Math.min(COUNT_STAGGER, 320 / Math.max(1, nodes.length - 1));

    nodes.forEach((node, index) => {
      const target = Number(node.getAttribute('data-count')) || 0;
      const final = node.textContent;
      if (reduce) {
        node.textContent = final;
        return;
      }
      node.textContent = formatMoney(0);
      const started = performance.now() + index * stagger;

      function step(now) {
        if (now < started) {
          requestAnimationFrame(step);
          return;
        }
        const t = Math.min(1, (now - started) / COUNT_DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = formatMoney(target * eased);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          node.textContent = final;
        }
      }

      requestAnimationFrame(step);
    });
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

  function accountAvatar(account) {
    if (account.logoData) {
      return '<span class="acct-dot acct-logo"><img src="' + esc(account.logoData) + '" alt="" aria-hidden="true"></span>';
    }
    if (account.logo === 'cash') {
      return '<span class="acct-dot acct-letter">' + iconSVG('dinero') + '</span>';
    }
    if (account.logo && ACCOUNT_LOGO_IDS.indexOf(account.logo) !== -1) {
      return '<span class="acct-dot acct-logo"><img src="logos/' + esc(account.logo) + '.jpg" alt="" aria-hidden="true"></span>';
    }
    return '<span class="acct-dot acct-letter">' + esc(initial(account.name)) + '</span>';
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
    const logoData = typeof raw.logoData === 'string' && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(raw.logoData) && raw.logoData.length <= 500000
      ? raw.logoData
      : '';
    return {
      id: String(raw.id || uid()),
      name,
      logo: ACCOUNT_LOGO_IDS.indexOf(raw.logo) !== -1 ? raw.logo : '',
      logoData,
      initial: toAmount(raw.initial)
    };
  }

  function sanitizeCategory(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim().slice(0, 40);
    const type = raw.type === 'income' ? 'income' : (raw.type === 'expense' ? 'expense' : '');
    if (!name || !type) return null;
    const id = String(raw.id || uid());
    const icon = String(raw.icon || '').trim() || CATEGORY_ICONS[id] || (type === 'income' ? 'dinero' : 'mas');
    return {
      id,
      name,
      type,
      icon
    };
  }

  function sanitizeMovement(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const amount = toAmount(raw.amount);
    if (!amount) return null;
    const type = raw.type === 'transfer' ? 'transfer' : (raw.type === 'income' ? 'income' : 'expense');
    const isTransfer = type === 'transfer';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date || '')) ? String(raw.date) : todayISO();
    const now = new Date().toISOString();
    return {
      id: String(raw.id || uid()),
      type,
      amount,
      description: String(raw.description || '').trim().slice(0, 80) || (isTransfer ? 'Transferencia' : 'Movimiento'),
      categoryId: isTransfer ? '' : String(raw.categoryId || ''),
      accountId: String(raw.accountId || ''),
      toAccountId: isTransfer ? String(raw.toAccountId || '') : '',
      date,
      note: String(raw.note || '').trim().slice(0, 140),
      gmf: isTransfer ? false : Boolean(raw.gmf),
      createdAt: String(raw.createdAt || now),
      updatedAt: String(raw.updatedAt || now)
    };
  }

  function sanitizeProfile(raw) {
    if (!raw || typeof raw !== 'object') return { name: '', photoData: '' };
    const photoData = typeof raw.photoData === 'string' && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(raw.photoData) && raw.photoData.length <= 500000
      ? raw.photoData
      : '';
    return {
      name: String(raw.name || '').trim().slice(0, 40),
      photoData
    };
  }

  function normalizeState(raw) {
    const out = freshState();
    if (!raw || typeof raw !== 'object') return out;

    out.theme = ['system', 'light', 'dark'].indexOf(raw.theme) !== -1 ? raw.theme : 'system';

    const accounts = Array.isArray(raw.accounts) ? raw.accounts.map(sanitizeAccount).filter(Boolean) : [];
    out.accounts = accounts.length ? accounts : DEFAULT_ACCOUNTS();
    // Migración: sumar las cuentas predeterminadas nuevas a estados creados antes
    // y ponerles logo a las que ya existían, sin re-agregarlas si el usuario las eliminó.
    if (Number(raw.defaultsVersion) !== 3) {
      if (Number(raw.defaultsVersion) !== 2) {
        DEFAULT_ACCOUNTS().forEach((def) => {
          const existing = out.accounts.find((a) => a.id === def.id);
          if (!existing) {
            out.accounts.push(def);
          } else if (!existing.logo && !existing.logoData && def.logo) {
            existing.logo = def.logo;
          }
        });
      }
      // v3: logo de billete para la cuenta de Efectivo.
      const cash = out.accounts.find((a) => a.id === 'cash');
      if (cash && !cash.logo && !cash.logoData) cash.logo = 'cash';
      out.defaultsVersion = 3;
    }

    out.profile = sanitizeProfile(raw.profile);

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
      if (m.type === 'transfer') {
        if (!out.accounts.some((a) => a.id === m.accountId)) m.accountId = out.accounts[0].id;
        m.categoryId = '';
        m.gmf = false;
        return;
      }
      if (!out.accounts.some((a) => a.id === m.accountId)) m.accountId = out.accounts[0].id;
      if (!out.categories.some((c) => c.id === m.categoryId && c.type === m.type)) {
        const fallback = out.categories.find((c) => c.type === m.type);
        m.categoryId = fallback ? fallback.id : '';
      }
    });

    out.movements = out.movements.filter((m) => {
      if (m.type !== 'transfer') return true;
      return m.accountId !== m.toAccountId &&
        out.accounts.some((a) => a.id === m.accountId) &&
        out.accounts.some((a) => a.id === m.toAccountId);
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
    transferDraft: null,
    categoryType: 'expense',
    confirmCallback: null,
    lastFocus: null,
    renderedView: null,
    countersShown: {}
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
      const amount = movementTotal(movement);
      if (movement.type === 'transfer') {
        if (movement.accountId === id) return total - amount;
        if (movement.toAccountId === id) return total + amount;
        return total;
      }
      if (movement.accountId !== id) return total;
      return total + (movement.type === 'income' ? amount : -amount);
    }, account.initial);
  }

  function totalBalance() {
    return state.accounts.reduce((total, account) => total + accountBalance(account.id), 0);
  }

  function monthTotals(ym) {
    const result = { income: 0, expense: 0, count: 0 };
    state.movements.forEach((movement) => {
      if (ym && movement.date.slice(0, 7) !== ym) return;
      if (movement.type === 'income' || movement.type === 'expense') {
        result[movement.type] += movementTotal(movement);
      }
      result.count += 1;
    });
    return result;
  }

  function movementCountForAccount(id) {
    return state.movements.filter((m) =>
      m.accountId === id || (m.type === 'transfer' && m.toAccountId === id)
    ).length;
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
          unknown = { id: '__unknown', name: 'Sin categoría', type, icon: 'mas', total: 0, count: 0 };
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
      if (ui.movAccount !== 'all' &&
        movement.accountId !== ui.movAccount &&
        !(movement.type === 'transfer' && movement.toAccountId === ui.movAccount)) return false;
      if (query) {
        const category = categoryById(movement.categoryId);
        const account = accountById(movement.accountId);
        const toAccount = movement.type === 'transfer' ? accountById(movement.toAccountId) : null;
        const haystack = normalizeText([
          movement.description,
          movement.note,
          category && category.name,
          account && account.name,
          toAccount && toAccount.name
        ].join(' '));
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  /* ------------------------------------------------------------
     Componentes de interfaz
     ------------------------------------------------------------ */

  function emptyState(icon, title, text, actionHtml) {
    return '<div class="empty">' +
      '<span class="empty-ic">' + iconSVG(icon) + '</span>' +
      '<h3>' + esc(title) + '</h3>' +
      '<p>' + esc(text) + '</p>' +
      (actionHtml || '') +
      '</div>';
  }

  function movementRow(movement) {
    if (movement.type === 'transfer') {
      const from = accountById(movement.accountId);
      const to = accountById(movement.toAccountId);
      const title = (from ? from.name : 'Cuenta') + ' → ' + (to ? to.name : 'Cuenta');
      const sub = [
        formatDate(movement.date),
        movement.note
      ].filter(Boolean).join(' · ');

      return '<button class="row" data-action="edit-transfer" data-id="' + esc(movement.id) + '">' +
        '<span class="cat-ic">🔁</span>' +
        '<span class="grow">' +
          '<span class="title">' + esc(title) + '</span>' +
          '<span class="sub">' + esc(sub) + '</span>' +
        '</span>' +
        '<b class="amt">' + formatMoney(movementTotal(movement)) + '</b>' +
      '</button>';
    }

    const category = categoryById(movement.categoryId);
    const account = accountById(movement.accountId);
    const catIcono = category ? category.icon : (movement.type === 'income' ? 'dinero' : 'mas');
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
      '<span class="cat-ic">' + iconSVG(catIcono) + '</span>' +
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
      const width = Math.max(3, Math.round((row.total / max) * 100));
      return '<div class="cat-row">' +
        '<span class="cat-ic">' + iconSVG(row.icon) + '</span>' +
        '<div class="cat-info">' +
          '<div class="cat-top"><span>' + esc(row.name) + '</span><span class="muted">' + formatMoney(row.total) + '</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + width + '%"></div></div>' +
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

    const accountsSorted = state.accounts
      .slice()
      .sort((a, b) => accountBalance(b.id) - accountBalance(a.id));
    const accountsHtml = accountsSorted.length
      ? accountsSorted.map((account) => {
          const balance = accountBalance(account.id);
          const count = movementCountForAccount(account.id);
          return '<button class="row" data-action="nav" data-view="cuentas">' +
            accountAvatar(account) +
            '<span class="grow">' +
              '<span class="title">' + esc(account.name) + '</span>' +
              '<span class="sub">' + count + ' movimiento' + (count === 1 ? '' : 's') + '</span>' +
            '</span>' +
            '<b class="amt' + (balance < 0 ? ' out' : '') + '" data-count="' + balance + '">' + formatMoney(balance) + '</b>' +
          '</button>';
        }).join('')
      : '<p class="hint">Agrega una cuenta para empezar.</p>';

    const recentHtml = recent.length
      ? '<div class="row-list">' + recent.map(movementRow).join('') + '</div>'
      : emptyState('creciente', 'Aún no hay movimientos', 'Registra tu primer ingreso o gasto para ver tu resumen aquí.',
          '<button class="btn soft sm" data-action="add-movement">Agregar el primero</button>');

    const topHtml = topExpenses.length
      ? topExpenses.map((row) => {
          return '<div class="cat-row">' +
            '<span class="cat-ic">' + iconSVG(row.icon) + '</span>' +
            '<div class="cat-info">' +
              '<div class="cat-top"><span>' + esc(row.name) + '</span><span class="muted">' + formatMoney(row.total) + '</span></div>' +
              '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(3, Math.round(row.total / (topExpenses[0].total || 1) * 100)) + '%"></div></div>' +
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
        '<div class="hero-amount" data-count="' + totalBalance() + '">' + formatMoney(totalBalance()) + '</div>' +
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
    ].map(([value, label]) => {
      const active = ui.movType === value;
      const tone = active && value !== 'all' ? ' ' + value : '';
      return '<button type="button" class="' + (active ? 'active' + tone : '') + '" data-action="mov-type-filter" data-value="' + value + '">' + label + '</button>';
    }).join('');

    return '<div class="page-head">' +
        '<div><p class="eyebrow">Historial</p><h2>Movimientos</h2></div>' +
        '<button class="btn sm" data-action="add-movement">' + ICON.plus + ' Agregar</button>' +
      '</div>' +
      '<section class="card">' +
        '<div class="filters">' +
          '<div class="search">' + ICON.search +
            '<input class="input" id="movSearch" type="search" autocomplete="off" placeholder="Buscar por descripción, categoría o cuenta" value="' + esc(ui.movQuery) + '" aria-label="Buscar movimientos">' +
          '</div>' +
          '<div class="filters-grid">' +
            '<div class="filter-field">' +
              '<div class="filter-label-row">' +
                '<label class="filter-label" for="movMonth">Mes</label>' +
                (ui.movMonth ? '<button type="button" class="link" data-action="clear-month">Ver todo</button>' : '') +
              '</div>' +
              '<div class="date-shell">' +
                '<input id="movMonth" type="month" value="' + esc(ui.movMonth) + '">' +
              '</div>' +
            '</div>' +
            '<div class="filter-field">' +
              '<label class="filter-label" for="movAccount">Cuenta</label>' +
              '<select class="select" id="movAccount">' +
                '<option value="all"' + (ui.movAccount === 'all' ? ' selected' : '') + '>Todas las cuentas</option>' + accountOptions +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="segmented filter-types" role="group" aria-label="Tipo de movimiento">' + typeChips + '</div>' +
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
        'creciente',
        'Aún no hay movimientos',
        'Registra tu primer ingreso o gasto y aparecerá aquí.',
        '<button class="btn sm" data-action="add-movement">Agregar movimiento</button>'
      ) + '</section>';
    }

    if (!list.length) {
      return '<section class="card mt-16">' + emptyState(
        'filtro',
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
              accountAvatar(account) +
              '<div><div class="account-name">' + esc(account.name) + '</div>' +
              '<div class="account-sub">' + count + ' movimiento' + (count === 1 ? '' : 's') + '</div></div>' +
            '</div>' +
            '<div class="account-balance' + (balance < 0 ? ' out' : '') + '" data-count="' + balance + '">' + formatMoney(balance) + '</div>' +
            '<div class="account-actions">' +
              '<button class="btn ghost sm" data-action="edit-account" data-id="' + esc(account.id) + '">' + ICON.edit + ' Editar</button>' +
              '<button class="icon-btn sm danger" data-action="delete-account" data-id="' + esc(account.id) + '" aria-label="Eliminar ' + esc(account.name) + '">' + ICON.trash + '</button>' +
            '</div>' +
          '</article>';
        }).join('')
      : emptyState('carpeta', 'Sin cuentas', 'Crea una cuenta para separar tu dinero por banco, billetera o efectivo.',
          '<button class="btn sm" data-action="add-account">Crear cuenta</button>');

    return '<div class="page-head">' +
        '<div><p class="eyebrow">Patrimonio</p><h2>Cuentas</h2></div>' +
        '<div class="head-actions">' +
          '<button class="btn ghost sm" data-action="add-transfer">' + ICON.transfer + ' Transferir</button>' +
          '<button class="btn sm" data-action="add-account">' + ICON.plus + ' Nueva</button>' +
        '</div>' +
      '</div>' +
      '<section class="hero">' +
        '<p class="hero-label">Saldo total</p>' +
        '<div class="hero-amount" data-count="' + total + '">' + formatMoney(total) + '</div>' +
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
        '<div class="date-shell narrow">' +
          '<input id="statsMonth" type="month" value="' + esc(ym) + '" aria-label="Mes de las estadísticas">' +
        '</div>' +
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

  function viewAjustes() {
    const profile = state.profile || { name: '', photoData: '' };
    return '<div class="page-head"><div><p class="eyebrow">Preferencias</p><h2>Ajustes</h2></div></div>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Perfil</h3>' +
        '<div class="profile-row">' +
          '<span class="profile-avatar">' +
            (profile.photoData
              ? '<img src="' + esc(profile.photoData) + '" alt="">'
              : '👤') +
          '</span>' +
          '<div class="profile-info">' +
            '<b>' + (profile.name ? esc(profile.name) : 'Sin nombre') + '</b>' +
            '<span>' + (profile.name ? 'Tu perfil de Zent' : 'Agrega tu nombre y foto') + '</span>' +
          '</div>' +
          '<button class="btn ghost sm" data-action="edit-profile">' + ICON.edit + ' Editar</button>' +
        '</div>' +
      '</section>' +
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
        '<p class="settings-desc">Personaliza el nombre y el icono de tus categorías, o crea nuevas.</p>' +
        '<button class="btn ghost" data-action="manage-categories">' + ICON.edit + ' Administrar categorías</button>' +
      '</section>' +
      '<section class="card settings-block">' +
        '<h3 class="settings-title">Datos</h3>' +
        '<p class="settings-desc">Zent guarda todo en este dispositivo y en tu cuenta. Exporta una copia en Excel cuando quieras.</p>' +
        '<div class="data-actions">' +
          '<button class="btn ghost" data-action="export-data">' + ICON.download + ' Exportar a Excel</button>' +
          '<button class="btn ghost" data-action="import-data">' + ICON.upload + ' Importar respaldo</button>' +
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
    if (meta) meta.setAttribute('content', effectiveTheme() === 'dark' ? '#0b2b26' : '#b08d6a');
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
    if (!ui.countersShown[view]) {
      ui.countersShown[view] = true;
      runCounters(root);
    }
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
    if (!document.body.classList.contains('modal-open')) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.dataset.scrollY = String(scrollY);
      document.body.style.top = '-' + scrollY + 'px';
      document.body.classList.add('modal-open');
    }
    const target = root.querySelector('[data-autofocus]') || root.querySelector('input, select, textarea, button');
    if (target) setTimeout(() => { try { target.focus(); } catch (error) { /* ignorar */ } }, 40);
  }

  function closeModal() {
    const root = $('#modalRoot');
    if (!root || !root.firstElementChild) return;
    root.innerHTML = '';
    const scrollY = Number(document.body.dataset.scrollY || 0);
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    delete document.body.dataset.scrollY;
    if (scrollY) {
      try { window.scrollTo(0, scrollY); } catch (error) { /* ignorar */ }
    }
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
        esc(category.name) +
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
          '<div class="field"><label for="movDate">Fecha</label><div class="date-shell"><input id="movDate" type="date" value="' + esc(draft.date) + '"></div></div>' +
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

  function transferFormHTML() {
    const draft = ui.transferDraft;
    if (!draft) return '';
    const accountOptions = (selectedId) => state.accounts.map((account) =>
      '<option value="' + esc(account.id) + '"' + (account.id === selectedId ? ' selected' : '') + '>' + esc(account.name) + '</option>'
    ).join('');

    return '<div class="modal-head">' +
        '<h2>' + (draft.id ? 'Editar transferencia' : 'Nueva transferencia') + '</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="transferForm" novalidate>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="transferFrom">Desde</label><select class="select" id="transferFrom">' + accountOptions(draft.fromId) + '</select></div>' +
          '<div class="field"><label for="transferTo">Hacia</label><select class="select" id="transferTo">' + accountOptions(draft.toId) + '</select></div>' +
        '</div>' +
        '<div class="field">' +
          '<label for="transferAmount">Monto</label>' +
          '<input class="input amount-input" id="transferAmount" inputmode="numeric" autocomplete="off" placeholder="$ 0" value="' + (draft.amount ? formatNumberInput(draft.amount) : '') + '" data-raw="' + (draft.amount || '') + '" data-amount-input data-autofocus>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="transferDate">Fecha</label><div class="date-shell"><input id="transferDate" type="date" value="' + esc(draft.date) + '"></div></div>' +
          '<div class="field"><label for="transferNote">Nota (opcional)</label><input class="input" id="transferNote" maxlength="140" autocomplete="off" placeholder="Detalle corto" value="' + esc(draft.note) + '"></div>' +
        '</div>' +
        (draft.id ? '<button type="button" class="btn danger block" data-action="delete-transfer" data-id="' + esc(draft.id) + '">' + ICON.trash + ' Eliminar transferencia</button>' : '') +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">' + (draft.id ? 'Guardar cambios' : 'Transferir') + '</button>' +
        '</div>' +
      '</form>';
  }

  function openTransferModal(id) {
    const existing = id ? state.movements.find((movement) => movement.id === id && movement.type === 'transfer') : null;
    if (state.accounts.length < 2) {
      toast('Necesitas al menos dos cuentas para transferir.');
      navigate('cuentas');
      return;
    }

    const fromId = existing ? existing.accountId : state.accounts[0].id;
    const toAccount = existing
      ? accountById(existing.toAccountId)
      : state.accounts.find((account) => account.id !== fromId);

    ui.transferDraft = {
      id: existing ? existing.id : null,
      fromId,
      toId: toAccount ? toAccount.id : state.accounts[1].id,
      amount: existing ? existing.amount : 0,
      date: existing ? existing.date : todayISO(),
      note: existing ? existing.note : ''
    };
    openModal(transferFormHTML());
  }

  function saveTransfer() {
    const draft = ui.transferDraft;
    if (!draft) return;

    const from = $('#transferFrom');
    const to = $('#transferTo');
    const amount = $('#transferAmount');
    const date = $('#transferDate');
    const note = $('#transferNote');

    if (from) draft.fromId = from.value;
    if (to) draft.toId = to.value;
    if (amount) draft.amount = Number(amount.dataset.raw || 0);
    if (date) draft.date = date.value;
    if (note) draft.note = note.value;

    if (!draft.amount || draft.amount <= 0) {
      toast('Escribe un monto mayor a cero.');
      if (amount) amount.focus();
      return;
    }
    if (!accountById(draft.fromId) || !accountById(draft.toId)) {
      toast('Elige cuentas válidas.');
      return;
    }
    if (draft.fromId === draft.toId) {
      toast('Las cuentas de origen y destino deben ser diferentes.');
      return;
    }
    if (!draft.date) draft.date = todayISO();

    const wasEdit = !!draft.id;
    const now = new Date().toISOString();

    if (draft.id) {
      const movement = state.movements.find((item) => item.id === draft.id);
      if (movement) {
        movement.type = 'transfer';
        movement.amount = draft.amount;
        movement.description = 'Transferencia';
        movement.categoryId = '';
        movement.accountId = draft.fromId;
        movement.toAccountId = draft.toId;
        movement.date = draft.date;
        movement.note = draft.note.trim();
        movement.gmf = false;
        movement.updatedAt = now;
      }
    } else {
      state.movements.push({
        id: uid(),
        type: 'transfer',
        amount: draft.amount,
        description: 'Transferencia',
        categoryId: '',
        accountId: draft.fromId,
        toAccountId: draft.toId,
        date: draft.date,
        note: draft.note.trim(),
        gmf: false,
        createdAt: now,
        updatedAt: now
      });
    }

    save();
    closeModal();
    ui.transferDraft = null;
    render();
    toast(wasEdit ? 'Transferencia actualizada.' : 'Transferencia realizada.');
  }

  function deleteTransfer(id) {
    const movement = state.movements.find((item) => item.id === id && item.type === 'transfer');
    if (!movement) return;
    const from = accountById(movement.accountId);
    const to = accountById(movement.toAccountId);
    confirmDialog({
      title: 'Eliminar transferencia',
      message: '¿Eliminar la transferencia de ' + formatMoney(movement.amount) + '?',
      sub: (from ? from.name : 'Cuenta') + ' → ' + (to ? to.name : 'Cuenta') + '. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      onConfirm: () => {
        state.movements = state.movements.filter((item) => item.id !== id);
        save();
        ui.transferDraft = null;
        closeModal();
        render();
        toast('Transferencia eliminada.');
      }
    });
  }

  function openAccountModal(id) {
    const account = id ? accountById(id) : null;
    const currentLogo = account ? (account.logoData ? 'custom' : (account.logo || '')) : '';
    const letterChip =
      '<button type="button" class="logo-chip' + (currentLogo === '' ? ' active' : '') + '" data-action="acct-logo-pick" data-value="">' +
        '<span class="logo-letter">' + esc(initial(account ? account.name : '')) + '</span>' +
        '<span>Letra</span>' +
      '</button>';
    const presetChips = ACCOUNT_LOGOS.map((logo) => {
      const visual = logo.id === 'cash'
        ? '<span class="logo-letter">💵</span>'
        : '<img src="logos/' + logo.id + '.jpg" alt="">';
      return '<button type="button" class="logo-chip' + (currentLogo === logo.id ? ' active' : '') + '" data-action="acct-logo-pick" data-value="' + logo.id + '">' +
        visual +
        '<span>' + esc(logo.name) + '</span>' +
      '</button>';
    }).join('');
    const customChip =
      '<button type="button" class="logo-chip' + (currentLogo === 'custom' ? ' active' : '') + '" id="acctLogoCustom" data-action="acct-logo-pick" data-value="custom"' + (account && account.logoData ? '' : ' hidden') + '>' +
        '<img alt="">' +
        '<span>Mi logo</span>' +
      '</button>';

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
          '<label>Logo</label>' +
          '<div class="logo-picker" id="acctLogoPicker">' + letterChip + presetChips + customChip + '</div>' +
          '<div class="logo-picker-actions">' +
            '<button type="button" class="btn ghost sm" data-action="acct-logo-upload">' + ICON.upload + ' Subir imagen</button>' +
            '<button type="button" class="btn ghost sm" data-action="acct-logo-clear">Quitar logo</button>' +
          '</div>' +
          '<p class="hint">Elige uno de la lista o sube tu propia imagen. Se recorta cuadrado automáticamente.</p>' +
          '<input type="file" id="acctLogoFile" accept="image/*" hidden>' +
          '<input type="hidden" id="acctLogo" value="' + esc(account && !account.logoData ? account.logo || '' : '') + '">' +
          '<input type="hidden" id="acctLogoData" value="' + esc(account ? account.logoData || '' : '') + '">' +
        '</div>' +
        '<div class="field">' +
          '<label for="acctInitial">Saldo inicial (opcional)</label>' +
          '<input class="input" id="acctInitial" inputmode="numeric" autocomplete="off" placeholder="$ 0" value="' + (account && account.initial ? formatNumberInput(account.initial) : '') + '" data-raw="' + (account ? account.initial : '') + '" data-amount-input>' +
          '<p class="hint">Es el dinero que ya tenías en esta cuenta antes de empezar.</p>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">' + (account ? 'Guardar cambios' : 'Crear cuenta') + '</button>' +
        '</div>' +
      '</form>'
    );
    updateAcctLogoPicker();
  }

  function updateAcctLogoPicker() {
    const picker = $('#acctLogoPicker');
    if (!picker) return;
    const logoInput = $('#acctLogo');
    const dataInput = $('#acctLogoData');
    const logo = logoInput ? logoInput.value : '';
    const data = dataInput ? dataInput.value : '';
    $$('.logo-chip', picker).forEach((chip) => {
      chip.classList.toggle('active', data ? chip.dataset.value === 'custom' : chip.dataset.value === logo);
    });
    const custom = $('#acctLogoCustom');
    if (custom) {
      custom.hidden = !data;
      const img = custom.querySelector('img');
      if (img && data) img.src = data;
    }
  }

  function readSquareImage(file, onReady) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        onReady(canvas.toDataURL('image/png'));
      };
      img.onerror = () => toast('No se pudo leer la imagen.');
      img.src = String(reader.result || '');
    };
    reader.onerror = () => toast('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
  }

  function handleAcctLogoFile(file) {
    readSquareImage(file, (url) => {
      if (url.length > 400000) {
        toast('La imagen es muy grande. Prueba con una más pequeña.');
        return;
      }
      const dataInput = $('#acctLogoData');
      const logoInput = $('#acctLogo');
      if (dataInput) dataInput.value = url;
      if (logoInput) logoInput.value = '';
      updateAcctLogoPicker();
      toast('Logo listo. Guarda los cambios.');
    });
  }

  function openProfileModal() {
    const profile = state.profile || { name: '', photoData: '' };
    openModal(
      '<div class="modal-head">' +
        '<h2>Mi perfil</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="profileForm" novalidate>' +
        '<div class="field">' +
          '<label>Foto de perfil</label>' +
          '<div class="profile-editor">' +
            '<span class="profile-avatar" id="profPhotoPreview">' +
              (profile.photoData
                ? '<img src="' + esc(profile.photoData) + '" alt="">'
                : '👤') +
            '</span>' +
            '<div class="profile-editor-actions">' +
              '<button type="button" class="btn ghost sm" data-action="prof-photo-upload">' + ICON.upload + ' Subir foto</button>' +
              '<button type="button" class="btn ghost sm" data-action="prof-photo-clear">Quitar foto</button>' +
            '</div>' +
          '</div>' +
          '<p class="hint">Tu foto se recorta en círculo automáticamente.</p>' +
          '<input type="file" id="profPhotoFile" accept="image/*" hidden>' +
          '<input type="hidden" id="profPhotoData" value="' + esc(profile.photoData || '') + '">' +
        '</div>' +
        '<div class="field">' +
          '<label for="profName">Nombre</label>' +
          '<input class="input" id="profName" maxlength="40" autocomplete="name" placeholder="Ej. Juan Pérez" value="' + esc(profile.name || '') + '" data-autofocus>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>' +
          '<button type="submit" class="btn">Guardar cambios</button>' +
        '</div>' +
      '</form>'
    );
  }

  function updateProfilePhotoPreview() {
    const preview = $('#profPhotoPreview');
    const dataInput = $('#profPhotoData');
    if (!preview || !dataInput) return;
    const data = dataInput.value;
    if (data) {
      preview.innerHTML = '<img src="' + esc(data) + '" alt="">';
    } else {
      preview.innerHTML = '👤';
    }
  }

  function handleProfileFile(file) {
    readSquareImage(file, (url) => {
      if (url.length > 400000) {
        toast('La imagen es muy grande. Prueba con una más pequeña.');
        return;
      }
      const dataInput = $('#profPhotoData');
      if (dataInput) dataInput.value = url;
      updateProfilePhotoPreview();
      toast('Foto lista. Guarda los cambios.');
    });
  }

  function saveProfile() {
    const form = $('#profileForm');
    if (!form) return;
    const nameInput = $('#profName');
    const dataInput = $('#profPhotoData');
    const name = nameInput ? nameInput.value.trim().slice(0, 40) : '';
    if (!state.profile) state.profile = { name: '', photoData: '' };
    state.profile.name = name;
    state.profile.photoData = dataInput && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataInput.value) && dataInput.value.length <= 500000 ? dataInput.value : '';
    save();
    closeModal();
    render();
    toast('Perfil actualizado.');
  }

  function saveAccount() {
    const form = $('#accountForm');
    if (!form) return;
    const id = form.dataset.id || '';
    const nameInput = $('#acctName');
    const initialInput = $('#acctInitial');
    const name = nameInput ? nameInput.value.trim() : '';
    const initial = initialInput ? Number(initialInput.dataset.raw || 0) : 0;

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
        const logoInput = $('#acctLogo');
        const dataInput = $('#acctLogoData');
        const logo = logoInput && ACCOUNT_LOGO_IDS.indexOf(logoInput.value) !== -1 ? logoInput.value : '';
        const logoData = dataInput && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataInput.value) && dataInput.value.length <= 500000 ? dataInput.value : '';
        account.logo = logo;
        account.logoData = logoData;
      }
    } else {
      const logoInput = $('#acctLogo');
      const dataInput = $('#acctLogoData');
      const logo = logoInput && ACCOUNT_LOGO_IDS.indexOf(logoInput.value) !== -1 ? logoInput.value : '';
      const logoData = dataInput && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataInput.value) && dataInput.value.length <= 500000 ? dataInput.value : '';
      state.accounts.push({ id: uid(), name, initial: toAmount(initial), logo, logoData });
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

  function categoriesModalHTML() {
    const kind = ui.categoryType === 'income' ? 'income' : 'expense';
    const categories = state.categories.filter((category) => category.type === kind);
    const cards = categories.map((category) => {
      const count = state.movements.filter((movement) => movement.categoryId === category.id).length;
      return '<button type="button" class="category-card" data-action="edit-category" data-id="' + esc(category.id) + '">' +
        '<span class="cat-ic">' + iconSVG(category.icon) + '</span>' +
        '<span class="name">' + esc(category.name) + '</span>' +
        '<span class="count">' + count + '</span>' +
      '</button>';
    }).join('');

    return '<div class="modal-head">' +
        '<h2>Categorías</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<div class="segmented" role="group" aria-label="Tipo de categoría">' +
        '<button type="button" class="' + (kind === 'expense' ? 'active expense' : '') + '" data-action="category-tab" data-type="expense">Gastos</button>' +
        '<button type="button" class="' + (kind === 'income' ? 'active income' : '') + '" data-action="category-tab" data-type="income">Ingresos</button>' +
      '</div>' +
      '<p class="hint category-hint">Toca una categoría para cambiar su nombre o icono.</p>' +
      '<div class="category-grid">' + (cards || '<p class="hint">Sin categorías.</p>') + '</div>' +
      '<button type="button" class="btn ghost block mt-16" data-action="add-category" data-type="' + kind + '">' + ICON.plus + ' Nueva categoría</button>';
  }

  function openCategoriesModal(type) {
    ui.categoryType = type === 'income' ? 'income' : 'expense';
    openModal(categoriesModalHTML());
  }

  function refreshCategoriesModal() {
    const modal = $('#modalRoot .modal');
    if (!modal) return;
    modal.innerHTML = categoriesModalHTML();
  }

  function openCategoryModal(idOrType) {
    const existing = typeof idOrType === 'string' && state.categories.some((category) => category.id === idOrType)
      ? categoryById(idOrType)
      : null;
    const kind = existing ? existing.type : (idOrType === 'income' ? 'income' : 'expense');
    const count = existing ? state.movements.filter((movement) => movement.categoryId === existing.id).length : 0;
    const canDelete = Boolean(existing) && count === 0 &&
      state.categories.filter((category) => category.type === kind).length > 1;

    openModal(
      '<div class="modal-head">' +
        '<h2>' + (existing ? 'Editar categoría' : 'Nueva categoría') + '</h2>' +
        '<button class="icon-btn sm" data-action="close-modal" aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' +
      '<form id="categoryForm" data-id="' + esc(existing ? existing.id : '') + '" data-type="' + kind + '" novalidate>' +
        '<div class="field">' +
          '<label for="catName">Nombre</label>' +
          '<input class="input" id="catName" maxlength="40" autocomplete="off" placeholder="Ej. Mascotas, Café, Freelance" value="' + esc(existing ? existing.name : '') + '" data-autofocus>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field">' +
            '<label>Tipo</label>' +
            '<div class="input static-field">' + (kind === 'income' ? 'Ingreso' : 'Gasto') + '</div>' +
          '</div>' +
        '</div>' +
        iconPickerHTML(existing ? existing.icon : (kind === 'income' ? 'dinero' : 'mas')) +
        (existing && count > 0 ? '<p class="hint">Esta categoría tiene ' + count + ' movimiento' + (count === 1 ? '' : 's') + ' y no se puede eliminar.</p>' : '') +
        (canDelete ? '<button type="button" class="btn danger block" data-action="delete-category" data-id="' + esc(existing.id) + '">' + ICON.trash + ' Eliminar categoría</button>' : '') +
        '<div class="modal-actions">' +
          '<button type="button" class="btn ghost" data-action="back-categories">Cancelar</button>' +
          '<button type="submit" class="btn">' + (existing ? 'Guardar cambios' : 'Crear categoría') + '</button>' +
        '</div>' +
      '</form>'
    );
  }

  function saveCategory() {
    const form = $('#categoryForm');
    if (!form) return;
    const id = form.dataset.id || '';
    const type = form.dataset.type === 'income' ? 'income' : 'expense';
    const nameInput = $('#catName');
    const iconInput = $('#catIcon');
    const name = nameInput ? nameInput.value.trim() : '';
    const icon = iconInput ? iconInput.value.trim() : '';

    if (!name) {
      toast('Escribe un nombre para la categoría.');
      if (nameInput) nameInput.focus();
      return;
    }

    const duplicate = state.categories.some((category) =>
      category.id !== id && category.type === type && normalizeText(category.name) === normalizeText(name)
    );
    if (duplicate) {
      toast('Ya existe una categoría con ese nombre.');
      return;
    }

    if (id) {
      const category = categoryById(id);
      if (category) {
        category.name = name;
        category.icon = icon || category.icon;
      }
    } else {
      state.categories.push({
        id: uid(),
        name,
        type,
        icon: icon || (type === 'income' ? 'dinero' : 'mas')
      });
    }
    save();
    render();
    toast(id ? 'Categoría actualizada.' : 'Categoría creada.');
    openCategoriesModal(type);
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
        openCategoriesModal(category.type);
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

  const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function zipStore(files) {
    const encoder = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const data = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
      const crc = crc32(data);

      const local = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, dosTime, true);
      localView.setUint16(12, dosDate, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, data.length, true);
      localView.setUint32(22, data.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      parts.push(local, data);

      const header = new Uint8Array(46 + nameBytes.length);
      const headerView = new DataView(header.buffer);
      headerView.setUint32(0, 0x02014b50, true);
      headerView.setUint16(4, 20, true);
      headerView.setUint16(6, 20, true);
      headerView.setUint16(8, 0x0800, true);
      headerView.setUint16(10, 0, true);
      headerView.setUint16(12, dosTime, true);
      headerView.setUint16(14, dosDate, true);
      headerView.setUint32(16, crc, true);
      headerView.setUint32(20, data.length, true);
      headerView.setUint32(24, data.length, true);
      headerView.setUint16(28, nameBytes.length, true);
      headerView.setUint16(30, 0, true);
      headerView.setUint16(32, 0, true);
      headerView.setUint16(34, 0, true);
      headerView.setUint16(36, 0, true);
      headerView.setUint32(38, 0, true);
      headerView.setUint32(42, offset, true);
      header.set(nameBytes, 46);
      central.push(header);

      offset += local.length + data.length;
    });

    const centralSize = central.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);

    return new Blob(parts.concat(central, [end]), {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  function xlsxColumn(index) {
    let value = index + 1;
    let letters = '';
    while (value > 0) {
      const mod = (value - 1) % 26;
      letters = String.fromCharCode(65 + mod) + letters;
      value = Math.floor((value - 1) / 26);
    }
    return letters;
  }

  function xlsxCell(ref, value, style) {
    const styleAttr = style ? ' s="' + style + '"' : '';
    if (value === null || value === undefined || value === '') {
      return '<c r="' + ref + '"' + styleAttr + '/>';
    }
    if (typeof value === 'number' && isFinite(value)) {
      return '<c r="' + ref + '"' + styleAttr + '><v>' + value + '</v></c>';
    }
    return '<c r="' + ref + '"' + styleAttr + ' t="inlineStr"><is><t xml:space="preserve">' + esc(value) + '</t></is></c>';
  }

  function xlsxSheetXML(headers, rows) {
    const allRows = [headers].concat(rows);
    const body = allRows.map((row, rowIndex) =>
      '<row r="' + (rowIndex + 1) + '">' +
        row.map((value, colIndex) =>
          xlsxCell(xlsxColumn(colIndex) + (rowIndex + 1), value, rowIndex === 0 ? 1 : 0)
        ).join('') +
      '</row>'
    ).join('');

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<sheetData>' + body + '</sheetData>' +
      '</worksheet>';
  }

  function buildBackupXlsx() {
    const movementsSheet = xlsxSheetXML(
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Cuenta origen', 'Cuenta destino', 'Monto', '4x1000', 'Nota'],
      sortedMovements().map((movement) => {
        const category = categoryById(movement.categoryId);
        const account = accountById(movement.accountId);
        const toAccount = movement.type === 'transfer' ? accountById(movement.toAccountId) : null;
        return [
          movement.date,
          movement.type === 'transfer' ? 'Transferencia' : (movement.type === 'income' ? 'Ingreso' : 'Gasto'),
          movement.description || '',
          category ? category.name : '',
          account ? account.name : '',
          toAccount ? toAccount.name : '',
          movement.amount,
          movementTax(movement),
          movement.note || ''
        ];
      })
    );

    const accountsSheet = xlsxSheetXML(
      ['Cuenta', 'Saldo inicial', 'Saldo actual'],
      state.accounts.map((account) => [account.name, account.initial, accountBalance(account.id)])
    );

    const categoriesSheet = xlsxSheetXML(
      ['Categoría', 'Tipo', 'Icono'],
      state.categories.map((category) => [
        category.name,
        category.type === 'income' ? 'Ingreso' : 'Gasto',
        category.icon
      ])
    );

    const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '</Types>';

    const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>';

    const workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets>' +
          '<sheet name="Movimientos" sheetId="1" r:id="rId1"/>' +
          '<sheet name="Cuentas" sheetId="2" r:id="rId2"/>' +
          '<sheet name="Categorías" sheetId="3" r:id="rId3"/>' +
        '</sheets>' +
      '</workbook>';

    const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>' +
        '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '</Relationships>';

    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2">' +
          '<font><sz val="11"/><name val="Calibri"/></font>' +
          '<font><b/><sz val="11"/><name val="Calibri"/></font>' +
        '</fonts>' +
        '<fills count="2">' +
          '<fill><patternFill patternType="none"/></fill>' +
          '<fill><patternFill patternType="gray125"/></fill>' +
        '</fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="2">' +
          '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
          '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
        '</cellXfs>' +
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';

    return zipStore([
      { name: '[Content_Types].xml', data: contentTypes },
      { name: '_rels/.rels', data: rootRels },
      { name: 'xl/workbook.xml', data: workbook },
      { name: 'xl/_rels/workbook.xml.rels', data: workbookRels },
      { name: 'xl/styles.xml', data: styles },
      { name: 'xl/worksheets/sheet1.xml', data: movementsSheet },
      { name: 'xl/worksheets/sheet2.xml', data: accountsSheet },
      { name: 'xl/worksheets/sheet3.xml', data: categoriesSheet }
    ]);
  }

  function exportData() {
    try {
      const blob = buildBackupXlsx();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zent-respaldo-' + todayISO() + '.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast('Respaldo Excel descargado.');
    } catch (error) {
      console.error('Zent: no se pudo generar el Excel.', error);
      toast('No se pudo generar el respaldo.');
    }
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

  /* ------------------------------------------------------------
     Filtros
     ------------------------------------------------------------ */

  function renderMovementResults() {
    const container = $('#movResults');
    if (container) container.innerHTML = movementResultsHTML();
  }

  function updateMonthClearLink() {
    const row = document.querySelector('.filter-label-row');
    if (!row) return;
    const existing = row.querySelector('[data-action="clear-month"]');
    if (ui.movMonth && !existing) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'link';
      link.dataset.action = 'clear-month';
      link.textContent = 'Ver todo';
      row.appendChild(link);
    } else if (!ui.movMonth && existing) {
      existing.remove();
    }
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

      case 'add-transfer':
        openTransferModal();
        break;

      case 'edit-transfer':
        openTransferModal(id);
        break;

      case 'delete-transfer':
        deleteTransfer(id);
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

      case 'pick-icon': {
        const grid = event.target.closest('.icon-grid');
        const button = event.target.closest('.icon-opt');
        if (grid && button) {
          grid.querySelectorAll('.icon-opt').forEach((item) => item.classList.remove('active'));
          button.classList.add('active');
          grid.dataset.selected = button.dataset.icon;
          const hidden = $('#catIcon');
          if (hidden) hidden.value = grid.dataset.selected;
        }
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

      case 'acct-logo-pick': {
        const logoInput = $('#acctLogo');
        const dataInput = $('#acctLogoData');
        if (logoInput) logoInput.value = button.dataset.value === 'custom' ? '' : (button.dataset.value || '');
        if (dataInput) dataInput.value = '';
        updateAcctLogoPicker();
        break;
      }

      case 'acct-logo-upload': {
        const input = $('#acctLogoFile');
        if (input) input.click();
        break;
      }

      case 'edit-profile':
        openProfileModal();
        break;

      case 'prof-photo-upload': {
        const input = $('#profPhotoFile');
        if (input) input.click();
        break;
      }

      case 'prof-photo-clear': {
        const dataInput = $('#profPhotoData');
        if (dataInput) dataInput.value = '';
        updateProfilePhotoPreview();
        break;
      }

      case 'acct-logo-clear': {
        const logoInput = $('#acctLogo');
        const dataInput = $('#acctLogoData');
        if (logoInput) logoInput.value = '';
        if (dataInput) dataInput.value = '';
        updateAcctLogoPicker();
        break;
      }

      case 'manage-categories':
        openCategoriesModal(ui.categoryType);
        break;

      case 'category-tab':
        ui.categoryType = button.dataset.type === 'income' ? 'income' : 'expense';
        refreshCategoriesModal();
        break;

      case 'add-category':
        openCategoryModal(button.dataset.type);
        break;

      case 'edit-category':
        openCategoryModal(id);
        break;

      case 'back-categories':
        openCategoriesModal(ui.categoryType);
        break;

      case 'delete-category':
        deleteCategory(id);
        break;

      case 'mov-type-filter':
        ui.movType = button.dataset.value || 'all';
        $$('[data-action="mov-type-filter"]').forEach((chip) => {
          const active = chip.dataset.value === ui.movType;
          chip.classList.toggle('active', active);
          chip.classList.toggle('income', active && chip.dataset.value === 'income');
          chip.classList.toggle('expense', active && chip.dataset.value === 'expense');
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
      updateMonthClearLink();
      renderMovementResults();
      return;
    }

    if (target.id === 'movAccount') {
      ui.movAccount = target.value;
      renderMovementResults();
      return;
    }

    if (target.id === 'acctLogoFile') {
      handleAcctLogoFile(target.files && target.files[0]);
      target.value = '';
      return;
    }

    if (target.id === 'profPhotoFile') {
      handleProfileFile(target.files && target.files[0]);
      target.value = '';
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
    } else if (form.id === 'transferForm') {
      event.preventDefault();
      saveTransfer();
    } else if (form.id === 'accountForm') {
      event.preventDefault();
      saveAccount();
    } else if (form.id === 'categoryForm') {
      event.preventDefault();
      saveCategory();
    } else if (form.id === 'profileForm') {
      event.preventDefault();
      saveProfile();
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

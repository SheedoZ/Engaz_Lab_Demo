(function () {
  'use strict';

  var toastTimer = 0;

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function cleanText(value, maxLength) {
    return Array.from(String(value == null ? '' : value), function (character) {
      var code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? ' ' : character;
    }).join('')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength || 80);
  }

  function phoneDigits(value) {
    return String(value == null ? '' : value).replace(/\D/g, '').slice(0, 15);
  }

  function validPhone(value) {
    var digits = phoneDigits(value);
    return digits.length >= 10 && digits.length <= 15;
  }

  function arNumber(value) {
    return new Intl.NumberFormat('ar-EG').format(Number(value) || 0);
  }

  function money(value) {
    return arNumber(value) + ' ج.م';
  }

  function el(tag, options) {
    var node = document.createElement(tag);
    var opts = options || {};
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = String(opts.text);
    if (opts.id) node.id = opts.id;
    if (opts.type) node.type = opts.type;
    if (opts.value != null) node.value = String(opts.value);
    if (opts.name) node.name = opts.name;
    if (opts.placeholder) node.placeholder = opts.placeholder;
    if (opts.maxLength) node.maxLength = opts.maxLength;
    if (opts.required) node.required = true;
    if (opts.disabled) node.disabled = true;
    if (opts.ariaLabel) node.setAttribute('aria-label', opts.ariaLabel);
    Object.keys(opts.dataset || {}).forEach(function (key) {
      node.dataset[key] = String(opts.dataset[key]);
    });
    Object.keys(opts.attrs || {}).forEach(function (key) {
      node.setAttribute(key, String(opts.attrs[key]));
    });
    (opts.children || []).forEach(function (child) {
      if (child != null) node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  function clear(node) {
    if (node) node.replaceChildren();
    return node;
  }

  function toast(message, type) {
    var node = q('#toast');
    if (!node) return;
    window.clearTimeout(toastTimer);
    node.textContent = cleanText(message, 180);
    node.className = 'toast is-visible' + (type ? ' is-' + type : '');
    toastTimer = window.setTimeout(function () {
      node.className = 'toast';
    }, 3200);
  }

  function announce(message) {
    var node = q('#liveStatus');
    if (!node) return;
    node.textContent = '';
    window.setTimeout(function () {
      node.textContent = cleanText(message, 180);
    }, 20);
  }

  function closeDialog() {
    var dialog = q('#demoDialog');
    if (dialog && dialog.open) dialog.close();
  }

  function showDialog(config) {
    var dialog = q('#demoDialog');
    if (!dialog) return;
    var kicker = q('[data-dialog-kicker]', dialog);
    var title = q('[data-dialog-title]', dialog);
    var body = q('[data-dialog-body]', dialog);
    var actions = q('[data-dialog-actions]', dialog);
    kicker.textContent = cleanText(config.kicker || 'ENGAZ SMART', 50);
    title.textContent = cleanText(config.title || '', 100);
    clear(body);
    clear(actions);
    if (config.content) body.append(config.content);
    (config.actions || []).forEach(function (action) {
      var button = el('button', {
        className: 'btn ' + (action.className || ''),
        text: action.label,
        type: 'button'
      });
      button.addEventListener('click', function () {
        if (action.onClick) action.onClick();
        if (action.close !== false) closeDialog();
      });
      actions.append(button);
    });
    if (!config.actions || !config.actions.length) {
      var done = el('button', { className: 'btn btn-primary', text: 'تم', type: 'button' });
      done.addEventListener('click', closeDialog);
      actions.append(done);
    }
    if (!dialog.open) dialog.showModal();
  }

  function resultBox(title, text, reasons) {
    var wrap = el('div');
    var box = el('div', { className: 'result-box' });
    box.append(el('strong', { text: title }), el('p', { text: text }));
    wrap.append(box);
    if (reasons && reasons.length) {
      var list = el('ul', { className: 'reason-list' });
      reasons.forEach(function (reason) {
        list.append(el('li', { text: reason }));
      });
      wrap.append(list);
    }
    return wrap;
  }

  function field(config) {
    var wrap = el('div', { className: 'field' + (config.full ? ' full' : '') });
    var id = config.id;
    var label = el('label', { text: config.label, attrs: { for: id } });
    var input;
    if (config.type === 'select') {
      input = el('select', { id: id, name: config.name || id });
      (config.options || []).forEach(function (option) {
        var opt = el('option', { text: option.label, value: option.value });
        input.append(opt);
      });
    } else if (config.type === 'textarea') {
      input = el('textarea', {
        id: id,
        name: config.name || id,
        placeholder: config.placeholder || '',
        maxLength: config.maxLength || 240,
        required: config.required
      });
    } else {
      input = el('input', {
        id: id,
        type: config.type || 'text',
        name: config.name || id,
        placeholder: config.placeholder || '',
        maxLength: config.maxLength || 80,
        required: config.required,
        attrs: config.attrs || {}
      });
    }
    wrap.append(label, input);
    if (config.hint) wrap.append(el('span', { className: 'field-hint', text: config.hint }));
    return { wrap: wrap, input: input };
  }

  function setTenant(name) {
    var safeName = cleanText(name, 60);
    qa('[data-tenant-name]').forEach(function (node) {
      node.textContent = safeName;
    });
    document.title = safeName + ' — ENGAZ V2';
    return safeName;
  }

  function bindGate(defaultName) {
    var gate = q('#launchGate');
    var form = q('#launchForm');
    var input = q('#businessName');
    if (!gate || !form || !input) return defaultName;
    input.value = defaultName;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = cleanText(input.value, 60) || defaultName;
      setTenant(name);
      gate.hidden = true;
      q('#mainContent').focus();
      announce('تم فتح النسخة الذكية باسم ' + name);
    });
    return defaultName;
  }

  function bindDialogClose() {
    var close = q('[data-dialog-close]');
    if (close) close.addEventListener('click', closeDialog);
  }

  function seededScore(text, min, max) {
    var value = cleanText(text, 180);
    var hash = 0;
    for (var i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    var low = Number(min) || 0;
    var high = Number(max) || 100;
    return low + (Math.abs(hash) % (high - low + 1));
  }

  function injectThemeStyles() {
    if (q('#engazThemeStyles')) return;
    var style = document.createElement('style');
    style.id = 'engazThemeStyles';
    style.textContent = [
      '.theme-toggle{width:38px;height:38px;display:grid;place-items:center;flex:none;border:1px solid #2b2c33;border-radius:50%;background:#141419;color:#fff;font-size:16px;line-height:1;cursor:pointer;transition:.2s}',
      '.theme-toggle:hover{transform:translateY(-1px);border-color:#4b4c55;background:#1d1d23}',
      '[data-theme="light"]{--bg:#f5f5f7;--surface:#ffffff;--surface-2:#f0f0f3;--surface-3:#e8e8ed;--text:#111114;--copy:#4f5059;--muted:#797a84;--line:#dedee4;--ink:#111114;--paper:#f5f5f7;--navy:#fff;--navy-2:#f0f0f3;--navy-deep:#f5f5f7;--shadow:0 24px 70px rgba(20,20,30,.10)}',
      '[data-theme="light"] body{background:radial-gradient(circle at 12% 6%,rgba(37,244,238,.10),transparent 24%),radial-gradient(circle at 90% 14%,rgba(254,44,85,.08),transparent 23%),var(--bg);color:var(--copy)}',
      '[data-theme="light"] h1,[data-theme="light"] h2,[data-theme="light"] h3,[data-theme="light"] h4{color:#111114}',
      '[data-theme="light"] .demo-header{background:rgba(255,255,255,.88);color:#111114;border-bottom-color:rgba(0,0,0,.08)}',
      '[data-theme="light"] .brand-mark{background:#111114}',
      '[data-theme="light"] .brand-mark::before,[data-theme="light"] .brand-mark::after{background:#fff}',
      '[data-theme="light"] .brand-copy small{color:#74757f}',
      '[data-theme="light"] .demo-switch{background:#f0f0f3;border-color:#dedee4}',
      '[data-theme="light"] .demo-switch a{color:#6b6c75}',
      '[data-theme="light"] .demo-switch a:hover{color:#111114;background:#e7e7eb}',
      '[data-theme="light"] .demo-switch a[aria-current="page"]{background:#111114;color:#fff}',
      '[data-theme="light"] .v2-badge,[data-theme="light"] .simulation-badge{border-color:#dedee4;background:#f3f3f6;color:#666771}',
      '[data-theme="light"] .v2-badge{color:#008f8b}',
      '[data-theme="light"] .theme-toggle{border-color:#dedee4;background:#f2f2f5;color:#111114}',
      '[data-theme="light"] .theme-toggle:hover{border-color:#c5c5cd;background:#e9e9ed}',
      '[data-theme="light"] .sidebar{background:rgba(255,255,255,.78);border-inline-end-color:rgba(0,0,0,.07);color:#666771}',
      '[data-theme="light"] .tenant{border-bottom-color:#e1e1e6}',
      '[data-theme="light"] .tenant-label{color:#858690}',
      '[data-theme="light"] .tenant strong,[data-theme="light"] .side-note strong{color:#111114}',
      '[data-theme="light"] .side-nav button{color:#696a74}',
      '[data-theme="light"] .side-nav button:hover{color:#111114;background:#ededf1}',
      '[data-theme="light"] .side-nav button[aria-current="page"]{color:#111114;background:#fff;box-shadow:inset 3px 0 0 var(--cyan),inset -3px 0 0 var(--pink),0 8px 25px rgba(0,0,0,.06)}',
      '[data-theme="light"] .nav-icon{border-color:#d5d5dc;color:#555660}',
      '[data-theme="light"] .side-note{border-color:#dedee4;background:#fff;color:#71727b}',
      '[data-theme="light"] .page-title{color:#111114}',
      '[data-theme="light"] .page-summary{color:#686974}',
      '[data-theme="light"] .btn{border-color:#d6d6dd;background:#fff;color:#17171b}',
      '[data-theme="light"] .btn:hover{border-color:#bdbdc6;background:#f5f5f7}',
      '[data-theme="light"] .btn-primary{border:0;background:#111114;color:#fff}',
      '[data-theme="light"] .btn-primary:hover{background:#25252a}',
      '[data-theme="light"] .btn-danger{border-color:rgba(254,44,85,.28);background:rgba(254,44,85,.08);color:#d81d44}',
      '[data-theme="light"] .hero-panel{border-color:#dedee4;background:radial-gradient(circle at 18% 25%,rgba(37,244,238,.16),transparent 30%),radial-gradient(circle at 82% 62%,rgba(254,44,85,.12),transparent 34%),linear-gradient(135deg,#fff,#f4f4f7 58%,#fff);color:#555660}',
      '[data-theme="light"] .hero-copy h2{color:#111114}',
      '[data-theme="light"] .hero-copy p,[data-theme="light"] .hero-score p{color:#696a74}',
      '[data-theme="light"] .hero-proof span{border-color:#d9d9df;background:rgba(255,255,255,.65);color:#33343b}',
      '[data-theme="light"] .hero-score{border-inline-start-color:#dedee4;background:rgba(255,255,255,.34)}',
      '[data-theme="light"] .hero-score small{color:#74757f}',
      '[data-theme="light"] .hero-score strong{color:#111114}',
      '[data-theme="light"] .kpi{border-color:#dedee4;background:linear-gradient(180deg,#fff,#f8f8fa)}',
      '[data-theme="light"] .kpi-label,[data-theme="light"] .kpi-meta{color:#74757f}',
      '[data-theme="light"] .kpi-value{color:#111114}',
      '[data-theme="light"] .kpi:nth-child(1) .kpi-value,[data-theme="light"] .kpi:nth-child(2) .kpi-value{color:#008f8b}',
      '[data-theme="light"] .kpi:nth-child(3) .kpi-value{color:#df244a}',
      '[data-theme="light"] .panel,[data-theme="light"] .panel-dark{border-color:#dedee4;background:linear-gradient(180deg,#fff,#f8f8fa);box-shadow:0 18px 45px rgba(20,20,30,.06);color:#555660}',
      '[data-theme="light"] .panel-head{border-bottom-color:#e4e4e8}',
      '[data-theme="light"] .panel-title,[data-theme="light"] .panel-dark .panel-title{color:#111114}',
      '[data-theme="light"] .panel-subtitle{color:#777884}',
      '[data-theme="light"] .data-table th{background:#f0f0f3;color:#6b6c75}',
      '[data-theme="light"] .data-table th,[data-theme="light"] .data-table td{border-bottom-color:#e5e5e9}',
      '[data-theme="light"] .data-table td{color:#555660}',
      '[data-theme="light"] .data-table tbody tr:hover{background:#f4f4f7}',
      '[data-theme="light"] .cell-main{color:#111114}',
      '[data-theme="light"] .cell-sub{color:#777884}',
      '[data-theme="light"] .row-action{background:#111114;color:#fff}',
      '[data-theme="light"] .smart-card{border-color:#d8d8de;background:radial-gradient(circle at 15% 15%,rgba(37,244,238,.12),transparent 28%),radial-gradient(circle at 85% 85%,rgba(254,44,85,.10),transparent 28%),#fff;color:#5f6069}',
      '[data-theme="light"] .smart-card h3{color:#111114}',
      '[data-theme="light"] .smart-card p{color:#6f7079}',
      '[data-theme="light"] .insight-list{background:#e5e5e9}',
      '[data-theme="light"] .insight{background:#fff}',
      '[data-theme="light"] .insight strong{color:#111114}',
      '[data-theme="light"] .insight p{color:#73747e}',
      '[data-theme="light"] .filter-btn{border-color:#d6d6dd;background:#fff;color:#666771}',
      '[data-theme="light"] .filter-btn[aria-pressed="true"]{border-color:#111114;background:#111114;color:#fff}',
      '[data-theme="light"] .order-search{border-color:#d6d6dd!important;background:#fff!important;color:#111114!important}',
      '[data-theme="light"] .mobile-order-card{border-bottom-color:#e5e5e9!important;background:#fff!important}',
      '[data-theme="light"] .mobile-order-code{color:#008f8b!important}',
      '[data-theme="light"] .mobile-order-name{color:#111114!important}',
      '[data-theme="light"] .mobile-order-tests{color:#555660!important}',
      '[data-theme="light"] .field label{color:#555660}',
      '[data-theme="light"] .field input,[data-theme="light"] .field select,[data-theme="light"] .field textarea{border-color:#d6d6dd;background:#fff;color:#111114}',
      '[data-theme="light"] .field input:focus,[data-theme="light"] .field select:focus,[data-theme="light"] .field textarea:focus{background:#fff}',
      '[data-theme="light"] .bar-track{background:#e3e3e8}',
      '[data-theme="light"] .bar-row label{color:#6e6f79}',
      '[data-theme="light"] .bar-row b{color:#111114}',
      '[data-theme="light"] dialog{border-color:#d6d6dd;background:#fff;color:#555660}',
      '[data-theme="light"] dialog::backdrop{background:rgba(20,20,28,.36)}',
      '[data-theme="light"] .dialog-head{border-bottom-color:#e2e2e7;background:#fff}',
      '[data-theme="light"] .dialog-title{color:#111114}',
      '[data-theme="light"] .dialog-close{border-color:#d6d6dd;background:#f4f4f7;color:#111114}',
      '[data-theme="light"] .dialog-actions{border-top-color:#e2e2e7;background:#f4f4f7}',
      '[data-theme="light"] .result-box{background:#eefcfc;color:#35585a}',
      '[data-theme="light"] .result-box strong{color:#111114}',
      '[data-theme="light"] .reason-list li{border-color:#dedee4;background:#fff;color:#555660}',
      '[data-theme="light"] .launch-gate{background:radial-gradient(circle at 24% 16%,rgba(37,244,238,.14),transparent 30%),radial-gradient(circle at 78% 76%,rgba(254,44,85,.10),transparent 30%),#f5f5f7}',
      '[data-theme="light"] .gate-card{border-color:#d8d8de;background:rgba(255,255,255,.94);color:#555660}',
      '[data-theme="light"] .gate-card h1{color:#111114}',
      '[data-theme="light"] .gate-card>p{color:#666771}',
      '[data-theme="light"] .gate-form input,[data-theme="light"] .gate-form select{border-color:#d6d6dd;background:#fff;color:#111114}',
      '[data-theme="light"] .gate-facts{background:#dedee4}',
      '[data-theme="light"] .gate-fact{background:#fff}',
      '[data-theme="light"] .gate-fact span{color:#74757f}',
      '@media(max-width:820px){.theme-toggle{width:36px;height:36px}.header-badges{display:flex!important}.simulation-badge{display:none!important}}'
    ].join('\n');
    document.head.append(style);
  }

  function updateThemeButton(theme) {
    var button = q('#themeToggle');
    if (!button) return;
    var isLight = theme === 'light';
    button.textContent = isLight ? '☾' : '☀';
    button.setAttribute('aria-label', isLight ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح');
    button.setAttribute('title', isLight ? 'الوضع الداكن' : 'الوضع الفاتح');
    button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }

  function applyTheme(theme) {
    var safeTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', safeTheme);
    var meta = q('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', safeTheme === 'light' ? '#f5f5f7' : '#09090b');
    updateThemeButton(safeTheme);
  }

  function initThemeToggle() {
    injectThemeStyles();
    applyTheme('dark');
    if (q('#themeToggle')) return;
    var host = q('.header-badges') || q('.header-inner');
    if (!host) return;
    var button = el('button', {
      id: 'themeToggle',
      className: 'theme-toggle',
      type: 'button',
      attrs: { 'aria-pressed': 'false' }
    });
    host.prepend(button);
    updateThemeButton('dark');
    button.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      toast(next === 'light' ? 'تم تفعيل الوضع الفاتح.' : 'تم تفعيل الوضع الداكن.', 'success');
    });
  }

  window.EngazV2 = {
    q: q,
    qa: qa,
    el: el,
    clear: clear,
    cleanText: cleanText,
    phoneDigits: phoneDigits,
    validPhone: validPhone,
    arNumber: arNumber,
    money: money,
    toast: toast,
    announce: announce,
    showDialog: showDialog,
    closeDialog: closeDialog,
    resultBox: resultBox,
    field: field,
    setTenant: setTenant,
    bindGate: bindGate,
    bindDialogClose: bindDialogClose,
    seededScore: seededScore,
    applyTheme: applyTheme
  };

  initThemeToggle();
}());

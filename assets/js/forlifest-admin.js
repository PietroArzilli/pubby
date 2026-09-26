(function () {
  'use strict';

  // Area admin delle liste Forlì Fest.
  // Login con Supabase Auth (email + password, chiamate REST dirette: il
  // sito non carica librerie esterne), poi lettura e cancellazione delle
  // righe di forlifest_iscrizioni. I permessi veri stanno nel database
  // (supabase/forlifest-admin.sql): questa pagina non decide niente.
  //
  // I dati arrivano da un form pubblico: vanno sempre scritti con
  // textContent, mai dentro innerHTML.

  var body = document.body;
  var URL_SB = body.getAttribute('data-supabase-url');
  var KEY = body.getAttribute('data-supabase-key');
  var STORE = 'ffadm';

  var SERE = {
    '2026-10-10': 'Sabato 10 ottobre',
    '2026-10-11': 'Domenica 11 ottobre'
  };
  var LISTE = ['Locali', 'SpottedUni', 'Younivibes', 'Baila Bonita'];

  var $ = function (id) { return document.getElementById(id); };
  var state = { rows: [], sera: '2026-10-10', lista: '', q: '' };

  // ---------- sessione ----------
  // sessionStorage: chiudendo la scheda si esce. Puo' non esserci (navigazione
  // privata su alcuni browser): in quel caso si resta loggati finche' la
  // pagina e' aperta.
  var mem = null;
  function leggiSessione() {
    try { return JSON.parse(sessionStorage.getItem(STORE)) || mem; } catch (e) { return mem; }
  }
  function salvaSessione(s) {
    mem = s;
    try {
      if (s) { sessionStorage.setItem(STORE, JSON.stringify(s)); } else { sessionStorage.removeItem(STORE); }
    } catch (e) { /* resta in memoria */ }
  }

  function token(grant, payload) {
    return fetch(URL_SB + '/auth/v1/token?grant_type=' + grant, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (b) {
        if (!res.ok || !b.access_token) {
          var err = new Error(b.error_description || b.msg || 'login');
          err.status = res.status;
          throw err;
        }
        var s = {
          access: b.access_token,
          refresh: b.refresh_token,
          scade: Date.now() + (b.expires_in || 3600) * 1000,
          email: b.user && b.user.email
        };
        salvaSessione(s);
        return s;
      });
    });
  }

  function sessioneValida() {
    var s = leggiSessione();
    if (!s) { return Promise.reject(new Error('non loggato')); }
    if (Date.now() < s.scade - 60000) { return Promise.resolve(s); }
    return token('refresh_token', { refresh_token: s.refresh });
  }

  function api(path, opts) {
    opts = opts || {};
    return sessioneValida().then(function (s) {
      var h = { apikey: KEY, Authorization: 'Bearer ' + s.access, 'Content-Type': 'application/json' };
      if (opts.prefer) { h.Prefer = opts.prefer; }
      return fetch(URL_SB + path, { method: opts.method || 'GET', headers: h, body: opts.body });
    }).then(function (res) {
      if (res.status === 401) { esci(); throw new Error('sessione scaduta'); }
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res.status === 204 ? null : res.json();
    });
  }

  // ---------- viste ----------
  function mostra(vista) {
    $('login-view').hidden = vista !== 'login';
    $('list-view').hidden = vista !== 'list';
    $('logout').hidden = vista !== 'list';
  }

  function esci() {
    var s = leggiSessione();
    salvaSessione(null);
    state.rows = [];
    if (s) {
      fetch(URL_SB + '/auth/v1/logout', {
        method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access }
      }).catch(function () {});
    }
    mostra('login');
  }

  function carica() {
    $('list-err').textContent = '';
    $('reload').disabled = true;
    return api('/rest/v1/rpc/forlifest_is_admin', { method: 'POST', body: '{}' }).then(function (ok) {
      if (!ok) {
        throw new Error('Questo account non è tra gli admin delle liste. Chiedi di aggiungerlo in forlifest_admin.');
      }
      return api('/rest/v1/forlifest_iscrizioni?select=*&order=cognome.asc,nome.asc');
    }).then(function (rows) {
      state.rows = rows || [];
      mostra('list');
      disegna();
    }).catch(function (e) {
      mostra('list');
      $('list-err').textContent = /admin/.test(e.message) ? e.message : 'Non riesco a caricare le iscrizioni. Riprova con Aggiorna.';
    }).then(function () {
      $('reload').disabled = false;
    });
  }

  // ---------- elenco ----------
  function filtrate() {
    var q = state.q.toLowerCase().replace(/\s+/g, ' ').trim();
    return state.rows.filter(function (r) {
      if (r.serata !== state.sera) { return false; }
      if (state.lista && r.lista !== state.lista) { return false; }
      if (!q) { return true; }
      var hay = (r.nome + ' ' + r.cognome + ' ' + r.cognome + ' ' + r.nome + ' ' + r.telefono + ' ' + r.email).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function dataOra(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ' +
      d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  function disegnaStats() {
    var dellaSera = state.rows.filter(function (r) { return r.serata === state.sera; });
    var box = $('stats');
    box.textContent = '';
    [''].concat(LISTE).forEach(function (l) {
      var n = l ? dellaSera.filter(function (r) { return r.lista === l; }).length : dellaSera.length;
      var b = el('button', 'adm-stat' + (l ? '' : ' adm-stat--all'));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.lista === l ? 'true' : 'false');
      b.appendChild(el('span', 'adm-stat__n', String(n)));
      b.appendChild(el('span', 'adm-stat__l', l || 'Tutte le liste'));
      b.addEventListener('click', function () { state.lista = l; disegna(); });
      box.appendChild(b);
    });
  }

  function disegna() {
    Array.prototype.forEach.call(document.querySelectorAll('.adm-tab'), function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-sera') === state.sera ? 'true' : 'false');
    });
    // il titolo e' anche l'intestazione della stampa
    $('print-title').textContent = SERE[state.sera] + (state.lista ? ' · ' + state.lista : '');
    disegnaStats();

    var rows = filtrate();
    var tb = $('rows');
    tb.textContent = '';
    rows.forEach(function (r) {
      var tr = el('tr');
      tr.appendChild(el('td', 'col-check'));
      tr.appendChild(el('td', 't-name', r.cognome));
      tr.appendChild(el('td', 't-name', r.nome));
      tr.appendChild(el('td', 't-list', r.lista));
      var tel = el('td', 't-tel');
      var a = el('a', null, r.telefono); a.href = 'tel:' + r.telefono; tel.appendChild(a);
      tr.appendChild(tel);
      tr.appendChild(el('td', 't-mail t-muted col-email', r.email));
      tr.appendChild(el('td', 't-muted col-when', dataOra(r.creata_il)));
      var td = el('td', 'col-del');
      var del = el('button', 'adm-del', 'Elimina');
      del.type = 'button';
      del.setAttribute('aria-label', 'Elimina ' + r.nome + ' ' + r.cognome);
      del.addEventListener('click', function () { elimina(r); });
      td.appendChild(del);
      tr.appendChild(td);
      tb.appendChild(tr);
    });

    var tot = state.rows.filter(function (r) { return r.serata === state.sera; }).length;
    $('count').textContent = rows.length === tot
      ? tot + (tot === 1 ? ' persona in lista' : ' persone in lista')
      : rows.length + ' di ' + tot + ' persone';
    $('empty').hidden = rows.length > 0;
    $('csv').disabled = !rows.length;
    $('print').disabled = !rows.length;
  }

  // chi si iscrive e' in lista per tutte e due le sere: si toglie da entrambe
  function elimina(r) {
    var chi = r.nome + ' ' + r.cognome + ' (' + r.email + ')';
    if (!window.confirm('Togliere ' + chi + ' dalla lista di tutte e due le sere?')) { return; }
    api('/rest/v1/forlifest_iscrizioni?email=eq.' + encodeURIComponent(r.email), {
      method: 'DELETE', prefer: 'return=minimal'
    }).then(function () {
      state.rows = state.rows.filter(function (x) { return x.email !== r.email; });
      disegna();
    }).catch(function () {
      $('list-err').textContent = 'Non sono riuscito a eliminare ' + chi + '. Riprova.';
    });
  }

  // ---------- esportazione ----------
  // punto e virgola e BOM: Excel in italiano lo apre gia' diviso in colonne
  // e con gli accenti giusti. Una cella che inizia con = + - @ viene
  // neutralizzata, altrimenti Excel la eseguirebbe come formula.
  function cella(v) {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) { v = "'" + v; }
    return '"' + v.replace(/"/g, '""') + '"';
  }

  function scaricaCsv() {
    var righe = [['Serata', 'Lista', 'Cognome', 'Nome', 'Telefono', 'Email', 'Iscritto il']];
    filtrate().forEach(function (r) {
      righe.push([r.serata, r.lista, r.cognome, r.nome, r.telefono, r.email, dataOra(r.creata_il)]);
    });
    var csv = '﻿' + righe.map(function (r) { return r.map(cella).join(';'); }).join('\r\n');
    var nome = 'forlifest-' + state.sera + (state.lista ? '-' + state.lista.toLowerCase().replace(/\s+/g, '-') : '') + '.csv';
    var a = el('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------- eventi ----------
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('l-email').value.trim().toLowerCase();
    var pass = $('l-pass').value;
    $('login-err').textContent = '';
    if (!email || !pass) { $('login-err').textContent = 'Servono email e password.'; return; }
    $('login-btn').disabled = true;
    token('password', { email: email, password: pass }).then(function () {
      $('l-pass').value = '';
      return carica();
    }).catch(function (err) {
      $('login-err').textContent = err.status === 400
        ? 'Email o password sbagliate.'
        : 'Non riesco a collegarmi. Riprova tra poco.';
    }).then(function () { $('login-btn').disabled = false; });
  });

  $('logout').addEventListener('click', esci);
  $('reload').addEventListener('click', carica);
  $('csv').addEventListener('click', scaricaCsv);
  $('print').addEventListener('click', function () { window.print(); });
  $('q').addEventListener('input', function (e) { state.q = e.target.value; disegna(); });
  Array.prototype.forEach.call(document.querySelectorAll('.adm-tab'), function (t) {
    t.addEventListener('click', function () { state.sera = t.getAttribute('data-sera'); disegna(); });
  });

  if (leggiSessione()) { carica(); } else { mostra('login'); }
})();

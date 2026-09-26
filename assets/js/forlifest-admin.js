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

  var LISTE = ['Locali', 'SpottedUni', 'Younivibes', 'Baila Bonita'];

  var $ = function (id) { return document.getElementById(id); };
  // people: una voce per persona. Nel database chi si iscrive ha una riga
  // per sera, ma e' in lista per tutte e due: qui si raggruppa per email
  var state = { people: [], lista: '', q: '', soloMk: false };

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
    state.people = [];
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
      state.people = raggruppa(rows || []);
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
  function raggruppa(rows) {
    var perEmail = {};
    var out = [];
    rows.forEach(function (r) {
      var p = perEmail[r.email];
      if (!p) {
        p = perEmail[r.email] = {
          email: r.email, nome: r.nome, cognome: r.cognome, telefono: r.telefono,
          lista: r.lista, creata_il: r.creata_il, mk: false, mk_il: null
        };
        out.push(p);
      }
      if (r.creata_il < p.creata_il) { p.creata_il = r.creata_il; }
      if (r.consenso_marketing) { p.mk = true; p.mk_il = r.consenso_marketing_il; }
    });
    return out;
  }

  function filtrate() {
    var q = state.q.toLowerCase().replace(/\s+/g, ' ').trim();
    return state.people.filter(function (r) {
      if (state.lista && r.lista !== state.lista) { return false; }
      if (state.soloMk && !r.mk) { return false; }
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
    var tutti = state.people;
    var box = $('stats');
    box.textContent = '';
    [''].concat(LISTE).forEach(function (l) {
      var n = l ? tutti.filter(function (r) { return r.lista === l; }).length : tutti.length;
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
    // il titolo e' anche l'intestazione della stampa
    $('print-title').textContent = 'Forlifest' + (state.lista ? ' · ' + state.lista : '');
    $('mk-count').textContent = String(state.people.filter(function (r) { return r.mk; }).length);
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
      var mk = el('td', 'col-mk');
      mk.appendChild(el('span', 'adm-mk ' + (r.mk ? 'adm-mk--si' : 'adm-mk--no'),
        r.mk ? 'Sì, dal ' + dataOra(r.mk_il) : 'No'));
      if (r.mk) {
        var off = el('button', 'adm-mk-off', 'togli');
        off.type = 'button';
        off.setAttribute('aria-label', 'Togli il consenso ai nuovi eventi di ' + r.nome + ' ' + r.cognome);
        off.addEventListener('click', function () { togliConsenso(r); });
        mk.appendChild(off);
      }
      tr.appendChild(mk);
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

    var tot = state.people.length;
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
      state.people = state.people.filter(function (x) { return x.email !== r.email; });
      disegna();
    }).catch(function () {
      $('list-err').textContent = 'Non sono riuscito a eliminare ' + chi + '. Riprova.';
    });
  }

  // chi chiede di non essere piu' contattato: si toglie il consenso ma resta in lista
  function togliConsenso(r) {
    var chi = r.nome + ' ' + r.cognome;
    if (!window.confirm('Togliere a ' + chi + ' il consenso ai nuovi eventi? Resta in lista.')) { return; }
    api('/rest/v1/forlifest_iscrizioni?email=eq.' + encodeURIComponent(r.email), {
      method: 'PATCH', prefer: 'return=minimal',
      body: JSON.stringify({ consenso_marketing: false, consenso_marketing_il: null })
    }).then(function () {
      r.mk = false; r.mk_il = null;
      disegna();
    }).catch(function () {
      $('list-err').textContent = 'Non sono riuscito a togliere il consenso a ' + chi + '. Riprova.';
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
    var righe = [['Lista', 'Cognome', 'Nome', 'Telefono', 'Email', 'Nuovi eventi', 'Consenso dal', 'Iscritto il']];
    filtrate().forEach(function (r) {
      righe.push([r.lista, r.cognome, r.nome, r.telefono, r.email, r.mk ? 'si' : 'no',
        r.mk ? dataOra(r.mk_il) : '', dataOra(r.creata_il)]);
    });
    var csv = '﻿' + righe.map(function (r) { return r.map(cella).join(';'); }).join('\r\n');
    var nome = 'forlifest' + (state.soloMk ? '-ricontattabili' : '') + (state.lista ? '-' + state.lista.toLowerCase().replace(/\s+/g, '-') : '') + '.csv';
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
  $('solo-mk').addEventListener('change', function (e) { state.soloMk = e.target.checked; disegna(); });

  if (leggiSessione()) { carica(); } else { mostra('login'); }
})();

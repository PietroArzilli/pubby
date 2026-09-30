(function () {
  'use strict';

  // Area admin delle liste degli eventi (Forlì Fest e Halloween).
  // Login con Supabase Auth, poi lettura e cancellazione delle righe.
  // Login, sessione e CSV stanno in adm-core.js. I permessi veri stanno nel
  // database (supabase/forlifest-admin.sql e halloween.sql): per tutti e due
  // gli eventi e' admin chi ha l'email in forlifest_admin.

  var A = window.PubbyAdm;
  var el = A.el;
  var dataOra = A.dataOra;
  var body = document.body;
  var $ = function (id) { return document.getElementById(id); };
  var sb = A.sessione(body.getAttribute('data-supabase-url'), body.getAttribute('data-supabase-key'),
    'ffadm', function () { state.people = []; mostra('login'); });

  // Un evento = una tabella con la sua forma. people e' sempre una voce per
  // persona con { chiave, nome, cognome, telefono, email, lista, creata_il, mk, mk_il }:
  // leggi() porta le righe del database a quella forma.
  var EVENTI = {
    forlifest: {
      nome: 'Forlì Fest',
      stampa: 'Forlifest',
      tabella: 'forlifest_iscrizioni',
      logo: { src: 'assets/forlifest/logo-forlifest.png', alt: 'Forlì Fest, sito ufficiale', w: 480, h: 380, href: 'https://www.forlifest.com' },
      conLista: true,
      conEmail: true,
      // le liste del form. Dal 28/09/2026 Younivibes ha preso il posto di
      // SpottedUni. Una lista tolta compare lo stesso se ha ancora iscritti
      // (vedi listeDaMostrare)
      liste: ['Locali', 'Younivibes', 'Baila Bonita'],
      // una riga a testa, in lista per tutte e due le sere
      leggi: function (rows) {
        return rows.map(function (r) {
          return {
            chiave: 'id=eq.' + encodeURIComponent(r.id),
            email: r.email, nome: r.nome, cognome: r.cognome, telefono: r.telefono,
            lista: r.lista, creata_il: r.creata_il, mk: r.consenso_marketing, mk_il: r.consenso_marketing_il
          };
        });
      },
      daDove: 'dalla lista di tutte e due le sere'
    },
    halloween: {
      nome: 'Halloween',
      stampa: 'Halloween',
      tabella: 'halloween_prenotazioni',
      logo: { src: 'halloween/assets/baila-bonita.svg', alt: 'Baila Bonita', w: 177, h: 117, chiaro: true },
      conLista: false,
      conEmail: false,
      liste: [],
      // il form di Halloween chiede solo nome, cognome e telefono: una riga a testa
      leggi: function (rows) {
        return rows.map(function (r) {
          return {
            chiave: 'id=eq.' + encodeURIComponent(r.id),
            email: '', nome: r.nome, cognome: r.cognome, telefono: r.telefono, lista: '',
            creata_il: r.created_at, mk: r.consenso_marketing, mk_il: r.consenso_marketing_il
          };
        });
      },
      daDove: 'dalla lista di Halloween'
    }
  };

  var state = { ev: 'forlifest', people: [], lista: '', q: '', soloMk: false };
  var ev = function () { return EVENTI[state.ev]; };

  // l'evento scelto resta nell'indirizzo (#halloween), cosi' si puo' salvare
  // il link e ricaricare senza perderlo
  function eventoDaIndirizzo() {
    var h = location.hash.replace('#', '');
    return EVENTI[h] ? h : 'forlifest';
  }

  function listeDaMostrare() {
    var extra = [];
    state.people.forEach(function (r) {
      if (r.lista && ev().liste.indexOf(r.lista) === -1 && extra.indexOf(r.lista) === -1) { extra.push(r.lista); }
    });
    return ev().liste.concat(extra.sort());
  }

  // ---------- viste ----------
  function mostra(vista) {
    $('login-view').hidden = vista !== 'login';
    $('list-view').hidden = vista !== 'list';
    $('logout').hidden = vista !== 'list';
  }

  function esci() {
    sb.esci();
    state.people = [];
    mostra('login');
  }

  function scegliEvento(chiave) {
    state.ev = chiave;
    state.lista = '';
    state.people = [];
    if (location.hash.replace('#', '') !== chiave) { history.replaceState(null, '', '#' + chiave); }
    intestazione();
    disegna();
    carica();
  }

  // testata, selettore e colonne che cambiano da un evento all'altro
  function intestazione() {
    var e = ev();
    var lg = e.logo;
    var tile = $('brand-tile');
    var img = $('brand-logo');
    img.src = lg.src; img.alt = lg.alt; img.width = lg.w; img.height = lg.h;
    tile.classList.toggle('adm-brand__tile--clear', !!lg.chiaro);
    if (lg.href) {
      tile.setAttribute('href', lg.href);
      tile.setAttribute('target', '_blank');
      tile.setAttribute('rel', 'noopener');
    } else {
      tile.removeAttribute('href');
      tile.removeAttribute('target');
      tile.removeAttribute('rel');
    }
    $('brand-name').textContent = e.nome + ' · liste';
    document.title = 'Liste ' + e.nome + ' — admin';

    Array.prototype.forEach.call(document.querySelectorAll('[data-ev]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-ev') === state.ev ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('th[data-col="lista"]'), function (th) { th.hidden = !e.conLista; });
    Array.prototype.forEach.call(document.querySelectorAll('th[data-col="email"]'), function (th) { th.hidden = !e.conEmail; });
    $('q').placeholder = e.conEmail ? 'Cerca nome, telefono o email' : 'Cerca nome o telefono';
    $('print-note').textContent = (e.conEmail ? 'Telefono ed email sottolineati' : 'Telefono sottolineato') +
      ': hanno dato il consenso a essere ricontattati per i prossimi eventi.';
  }

  function carica() {
    var chiave = state.ev;
    $('list-err').textContent = '';
    $('reload').disabled = true;
    return sb.api('/rest/v1/rpc/forlifest_is_admin', { method: 'POST', body: '{}' }).then(function (ok) {
      if (!ok) {
        throw new Error('Questo account non è tra gli admin delle liste. Chiedi di aggiungerlo in forlifest_admin.');
      }
      return sb.api('/rest/v1/' + EVENTI[chiave].tabella + '?select=*&order=cognome.asc,nome.asc');
    }).then(function (rows) {
      if (chiave !== state.ev) { return; } // nel frattempo si e' passati all'altro evento
      state.people = EVENTI[chiave].leggi(rows || []);
      mostra('list');
      disegna();
    }).catch(function (e) {
      if (chiave !== state.ev) { return; }
      if (!sb.attiva()) { return; } // sessione finita: e' gia' tornato al login
      mostra('list');
      $('list-err').textContent = /admin/.test(e.message) ? e.message : 'Non riesco a caricare le iscrizioni. Riprova con Aggiorna.';
    }).then(function () {
      $('reload').disabled = false;
    });
  }

  // ---------- elenco ----------
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

  function disegnaStats() {
    var tutti = state.people;
    var box = $('stats');
    box.textContent = '';
    [''].concat(listeDaMostrare()).forEach(function (l) {
      var n = l ? tutti.filter(function (r) { return r.lista === l; }).length : tutti.length;
      var b = el('button', 'adm-stat' + (l ? '' : ' adm-stat--all'));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.lista === l ? 'true' : 'false');
      b.appendChild(el('span', 'adm-stat__n', String(n)));
      b.appendChild(el('span', 'adm-stat__l', l || (ev().conLista ? 'Tutte le liste' : 'In lista')));
      b.addEventListener('click', function () { state.lista = l; disegna(); });
      box.appendChild(b);
    });
  }

  function disegna() {
    var e = ev();
    // il titolo e' anche l'intestazione della stampa
    $('print-title').textContent = e.stampa + (state.lista ? ' · ' + state.lista : '');
    $('mk-count').textContent = String(state.people.filter(function (r) { return r.mk; }).length);
    disegnaStats();

    var rows = filtrate();
    var tb = $('rows');
    tb.textContent = '';
    rows.forEach(function (r) {
      // in stampa telefono ed email di chi ha dato il consenso sono sottolineati
      var tr = el('tr', r.mk ? 'is-mk' : null);
      tr.appendChild(el('td', 'col-check'));
      tr.appendChild(el('td', 't-name', r.cognome));
      tr.appendChild(el('td', 't-name', r.nome));
      if (e.conLista) { tr.appendChild(el('td', 't-list', r.lista)); }
      var tel = el('td', 't-tel');
      var a = el('a', null, r.telefono); a.href = 'tel:' + r.telefono.replace(/\s+/g, ''); tel.appendChild(a);
      tr.appendChild(tel);
      if (e.conEmail) { tr.appendChild(el('td', 't-mail t-muted col-email', r.email)); }
      var mk = el('td', 'col-mk');
      mk.appendChild(el('span', 'adm-mk ' + (r.mk ? 'adm-mk--si' : 'adm-mk--no'),
        r.mk ? 'Sì' + (r.mk_il ? ', dal ' + dataOra(r.mk_il) : '') : 'No'));
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

  function nomeDi(r) {
    return r.nome + ' ' + r.cognome + ' (' + (r.email || r.telefono) + ')';
  }

  function elimina(r) {
    var chi = nomeDi(r);
    if (!window.confirm('Togliere ' + chi + ' ' + ev().daDove + '?')) { return; }
    sb.api('/rest/v1/' + ev().tabella + '?' + r.chiave, {
      method: 'DELETE', prefer: 'return=minimal'
    }).then(function () {
      state.people = state.people.filter(function (x) { return x !== r; });
      disegna();
    }).catch(function () {
      $('list-err').textContent = 'Non sono riuscito a eliminare ' + chi + '. Riprova.';
    });
  }

  // chi chiede di non essere piu' contattato: si toglie il consenso ma resta in lista
  function togliConsenso(r) {
    var chi = r.nome + ' ' + r.cognome;
    if (!window.confirm('Togliere a ' + chi + ' il consenso ai nuovi eventi? Resta in lista.')) { return; }
    sb.api('/rest/v1/' + ev().tabella + '?' + r.chiave, {
      method: 'PATCH', prefer: 'return=minimal',
      body: JSON.stringify({ consenso_marketing: false, consenso_marketing_il: null })
    }).then(function () {
      r.mk = false; r.mk_il = null;
      disegna();
    }).catch(function () {
      $('list-err').textContent = 'Non sono riuscito a togliere il consenso a ' + chi + '. Riprova.';
    });
  }

  function scaricaCsv() {
    var e = ev();
    var testa = ['Cognome', 'Nome', 'Telefono'];
    if (e.conLista) { testa.unshift('Lista'); }
    if (e.conEmail) { testa.push('Email'); }
    var righe = [testa.concat(['Nuovi eventi', 'Consenso dal', 'Iscritto il'])];
    filtrate().forEach(function (r) {
      var riga = [r.cognome, r.nome, r.telefono];
      if (e.conLista) { riga.unshift(r.lista); }
      if (e.conEmail) { riga.push(r.email); }
      righe.push(riga.concat([r.mk ? 'si' : 'no', r.mk && r.mk_il ? dataOra(r.mk_il) : '', dataOra(r.creata_il)]));
    });
    A.scaricaCsv(state.ev + (state.soloMk ? '-ricontattabili' : '') +
      (state.lista ? '-' + state.lista.toLowerCase().replace(/\s+/g, '-') : '') + '.csv', righe);
  }

  // ---------- eventi ----------
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('l-email').value.trim().toLowerCase();
    var pass = $('l-pass').value;
    $('login-err').textContent = '';
    if (!email || !pass) { $('login-err').textContent = 'Servono email e password.'; return; }
    $('login-btn').disabled = true;
    sb.entra(email, pass).then(function () {
      $('l-pass').value = '';
      return carica();
    }).catch(function (err) {
      $('login-err').textContent = err.status === 400
        ? 'Email o password sbagliate.'
        : 'Non riesco a collegarmi. Riprova tra poco.';
    }).then(function () { $('login-btn').disabled = false; });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-ev]'), function (b) {
    b.addEventListener('click', function () {
      var chiave = b.getAttribute('data-ev');
      if (chiave !== state.ev) { scegliEvento(chiave); }
    });
  });
  window.addEventListener('hashchange', function () {
    var chiave = eventoDaIndirizzo();
    if (chiave !== state.ev && sb.attiva()) { scegliEvento(chiave); }
  });

  $('logout').addEventListener('click', esci);
  $('reload').addEventListener('click', carica);
  $('csv').addEventListener('click', scaricaCsv);
  $('print').addEventListener('click', function () { window.print(); });
  $('q').addEventListener('input', function (e) { state.q = e.target.value; disegna(); });
  $('solo-mk').addEventListener('change', function (e) { state.soloMk = e.target.checked; disegna(); });

  state.ev = eventoDaIndirizzo();
  intestazione();
  if (sb.attiva()) { carica(); } else { mostra('login'); }
})();

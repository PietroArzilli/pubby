(function () {
  'use strict';

  // Lista di Halloween per gli organizzatori, in sola lettura.
  // Si entra con un nome utente (es. BAILABONITA): in Supabase Auth l'utente
  // e' <nome>@staff.pubby.it, l'email la costruisce questa pagina. I dati
  // arrivano da halloween_lista_staff(), che controlla halloween_staff e
  // restituisce solo cognome, nome, telefono e ora d'iscrizione.

  var A = window.PubbyAdm;
  var el = A.el;
  var dataOra = A.dataOra;
  var body = document.body;
  var $ = function (id) { return document.getElementById(id); };
  var DOMINIO = '@staff.pubby.it';
  var sb = A.sessione(body.getAttribute('data-supabase-url'), body.getAttribute('data-supabase-key'),
    'hwstaff', function () { state.people = []; mostra('login'); });

  var state = { people: [], q: '' };

  function mostra(vista) {
    $('login-view').hidden = vista !== 'login';
    $('list-view').hidden = vista !== 'list';
    $('logout').hidden = vista !== 'list';
  }

  function carica() {
    $('list-err').textContent = '';
    $('reload').disabled = true;
    return sb.api('/rest/v1/rpc/halloween_lista_staff', { method: 'POST', body: '{}' }).then(function (rows) {
      state.people = rows || [];
      mostra('list');
      disegna();
    }).catch(function (e) {
      if (!sb.attiva()) { return; } // sessione finita: e' gia' tornato al login
      mostra('list');
      $('list-err').textContent = e.status === 403
        ? 'Questo utente non può vedere la lista. Scrivi a p.arzilli@pubby.sm.'
        : 'Non riesco a caricare la lista. Riprova con Aggiorna.';
    }).then(function () {
      $('reload').disabled = false;
    });
  }

  function filtrate() {
    var q = state.q.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!q) { return state.people; }
    return state.people.filter(function (r) {
      var hay = (r.nome + ' ' + r.cognome + ' ' + r.cognome + ' ' + r.nome + ' ' + r.telefono).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function disegna() {
    var rows = filtrate();
    var tb = $('rows');
    tb.textContent = '';
    rows.forEach(function (r) {
      var tr = el('tr');
      tr.appendChild(el('td', 'col-check'));
      tr.appendChild(el('td', 't-name', r.cognome));
      tr.appendChild(el('td', 't-name', r.nome));
      var tel = el('td', 't-tel');
      var a = el('a', null, r.telefono); a.href = 'tel:' + r.telefono.replace(/\s+/g, ''); tel.appendChild(a);
      tr.appendChild(tel);
      tr.appendChild(el('td', 't-muted col-when', dataOra(r.created_at)));
      tb.appendChild(tr);
    });

    var tot = state.people.length;
    $('tot').textContent = String(tot);
    $('count').textContent = rows.length === tot
      ? tot + (tot === 1 ? ' persona in lista' : ' persone in lista')
      : rows.length + ' di ' + tot + ' persone';
    $('empty').hidden = rows.length > 0;
    $('csv').disabled = !rows.length;
    $('print').disabled = !rows.length;
  }

  function scaricaCsv() {
    var righe = [['Cognome', 'Nome', 'Telefono', 'Iscritto il']];
    filtrate().forEach(function (r) {
      righe.push([r.cognome, r.nome, r.telefono, dataOra(r.created_at)]);
    });
    A.scaricaCsv('halloween-lista.csv', righe);
  }

  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var user = $('l-user').value.trim().toLowerCase();
    var pass = $('l-pass').value;
    $('login-err').textContent = '';
    if (!user || !pass) { $('login-err').textContent = 'Servono nome utente e password.'; return; }
    if (!/^[a-z0-9._-]+$/.test(user)) { $('login-err').textContent = 'Nome utente o password sbagliati.'; return; }
    $('login-btn').disabled = true;
    sb.entra(user + DOMINIO, pass).then(function () {
      $('l-pass').value = '';
      return carica();
    }).catch(function (err) {
      $('login-err').textContent = err.status === 400
        ? 'Nome utente o password sbagliati.'
        : 'Non riesco a collegarmi. Riprova tra poco.';
    }).then(function () { $('login-btn').disabled = false; });
  });

  $('logout').addEventListener('click', function () { sb.esci(); state.people = []; mostra('login'); });
  $('reload').addEventListener('click', carica);
  $('csv').addEventListener('click', scaricaCsv);
  $('print').addEventListener('click', function () { window.print(); });
  $('q').addEventListener('input', function (e) { state.q = e.target.value; disegna(); });

  if (sb.attiva()) { carica(); } else { mostra('login'); }
})();

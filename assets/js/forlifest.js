(function () {
  'use strict';

  // Iscrizione alle liste del Forlì Fest.
  //
  // Il sito e' statico: il form chiama direttamente la funzione Supabase
  // iscriviti_forlifest (supabase/forlifest.sql), che risponde
  //   { nuove: ['2026-10-10', ...], gia: [...] }
  // nuove vuoto = era gia' in lista per tutte le sere scelte.
  // Senza chiave il form non finge di aver salvato: mostra un errore.
  // Solo in locale (o con ?demo nell'indirizzo) simula un invio riuscito,
  // per poter provare la pagina.

  var form = document.getElementById('ff-form');
  if (!form) { return; }

  var sbUrl = form.getAttribute('data-supabase-url') || '';
  var sbKey = form.getAttribute('data-supabase-key') || '';
  var demo = !sbKey && (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ||
    location.protocol === 'file:' || /[?&]demo\b/.test(location.search));

  var submit = document.getElementById('ff-submit');
  var alertBox = document.getElementById('ff-alert');
  var done = document.getElementById('ff-done');

  // le date non si scelgono: chi si iscrive e' in lista per tutte e due
  // le sere, e nel database finisce una riga per sera (lista della porta)
  var SERATE = ['2026-10-10', '2026-10-11'];
  var GIORNO = { '2026-10-10': '10', '2026-10-11': '11' };

  var $ = function (id) { return document.getElementById(id); };

  function setErr(id, msg) {
    var el = $('err-' + id);
    if (el) { el.textContent = msg || ''; }
    var input = $(id);
    if (input) { input.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  }

  function valori() {
    var lista = form.querySelector('input[name="lista"]:checked');
    return {
      lista: lista ? lista.value : '',
      nome: $('nome').value.trim(),
      cognome: $('cognome').value.trim(),
      telefono: $('telefono').value.replace(/[\s.\-\/()]/g, ''),
      email: $('email').value.trim().toLowerCase(),
      serate: SERATE.slice(),
      marketing: $('marketing').checked
    };
  }

  function valida(v) {
    var errori = {};
    if (!v.lista) { errori.lista = 'Scegli una lista, senza non sappiamo dove metterti.'; }
    if (!v.nome) { errori.nome = 'Ci serve il tuo nome.'; }
    if (!v.cognome) { errori.cognome = 'Anche il cognome, per non confonderti.'; }
    if (!/^\+?\d{8,15}$/.test(v.telefono)) { errori.telefono = 'Questo numero non ci torna.'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) { errori.email = "Quest'email non ci torna."; }
    if (!$('consenso').checked) { errori.consenso = 'Ci serve il tuo ok per usare i dati.'; }
    return errori;
  }

  function mostraErrori(errori) {
    ['lista', 'nome', 'cognome', 'telefono', 'email', 'consenso'].forEach(function (k) {
      setErr(k, errori[k]);
    });
    var primo = form.querySelector('[aria-invalid="true"]') ||
      (errori.lista && form.querySelector('input[name="lista"]')) ||
      (errori.consenso && $('consenso'));
    if (primo) { primo.focus(); }
  }

  // "il 10", "il 10 e l'11"
  function quando(serate) {
    var g = serate.slice().sort().map(function (s) { return GIORNO[s] || s; });
    if (g.length === 1) { return (g[0] === '11' ? "l'" : 'il ') + g[0]; }
    return 'il ' + g[0] + " e l'" + g[1];
  }

  function conferma(v) {
    $('done-when').textContent = 'Ci vediamo ' + quando(v.serate) + '.';
    $('done-list').textContent = 'Lista ' + v.lista;
    $('done-name').textContent = v.nome + ' ' + v.cognome;
    form.hidden = true;
    done.hidden = false;
    $('intro').hidden = true;
    window.scrollTo(0, 0);
    done.focus({ preventScroll: true });
  }

  function invia(v) {
    if (demo) {
      return new Promise(function (ok) {
        setTimeout(function () { ok({ status: 200, body: { nuove: v.serate, gia: [] } }); }, 500);
      });
    }
    if (!sbUrl || !sbKey) {
      return Promise.reject(new Error('Supabase non configurato'));
    }
    return fetch(sbUrl + '/rest/v1/rpc/iscriviti_forlifest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: sbKey },
      body: JSON.stringify({
        p_lista: v.lista,
        p_nome: v.nome,
        p_cognome: v.cognome,
        p_telefono: v.telefono,
        p_email: v.email,
        p_serate: v.serate,
        p_marketing: v.marketing
      })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        return { status: res.status, body: body };
      });
    });
  }

  // tolgo l'errore appena si corregge il campo, senza aspettare l'invio
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.name === 'lista' || t.name === 'consenso') { setErr(t.name, ''); }
    else if (t.id && t.getAttribute('aria-invalid') === 'true') { setErr(t.id, ''); }
    alertBox.textContent = '';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alertBox.textContent = '';
    if ($('sito').value) { return; }

    var v = valori();
    var errori = valida(v);
    mostraErrori(errori);
    if (Object.keys(errori).length) { return; }

    submit.disabled = true;
    submit.textContent = 'Un attimo…';

    invia(v).then(function (r) {
      if (r.status < 200 || r.status >= 300 || !r.body || !r.body.nuove) {
        throw new Error('HTTP ' + r.status);
      }
      if (r.body.nuove.length) {
        // se una sera c'era gia' (iscrizione a meta' di prima), ora le ha tutte e due
        conferma(v);
      } else {
        alertBox.textContent = 'Sei già in lista. Tranquillo, ti abbiamo.';
      }
    }).catch(function () {
      alertBox.textContent = 'Qualcosa non è andato. Riprova tra poco, o scrivici su Instagram @pubbyit.';
    }).then(function () {
      submit.disabled = false;
      submit.textContent = 'Mettimi in lista';
    });
  });
})();

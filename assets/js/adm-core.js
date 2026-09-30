(function () {
  'use strict';

  // Pezzi comuni alle aree riservate delle liste (forlifest-admin e
  // halloween-staff): login Supabase Auth con chiamate REST dirette (il sito
  // non carica librerie esterne), sessione, esportazione CSV.
  // I permessi veri stanno nel database: queste pagine non decidono niente.

  // sessionStorage: chiudendo la scheda si esce. Puo' non esserci (navigazione
  // privata su alcuni browser): in quel caso si resta loggati finche' la
  // pagina e' aperta. Ogni area ha la sua chiave, cosi' le sessioni non si
  // mescolano.
  function sessione(URL_SB, KEY, STORE, onScaduta) {
    var mem = null;

    // una sessione di un altro progetto Supabase (per esempio quello vecchio,
    // prima del trasloco del 30/09/2026) non vale qui: si rifa' il login
    function leggi() {
      var s;
      try { s = JSON.parse(sessionStorage.getItem(STORE)) || mem; } catch (e) { s = mem; }
      return s && s.sb === URL_SB ? s : null;
    }
    function salva(s) {
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
            sb: URL_SB,
            access: b.access_token,
            refresh: b.refresh_token,
            scade: Date.now() + (b.expires_in || 3600) * 1000,
            email: b.user && b.user.email
          };
          salva(s);
          return s;
        });
      });
    }

    function valida() {
      var s = leggi();
      if (!s) { return Promise.reject(new Error('non loggato')); }
      if (Date.now() < s.scade - 60000) { return Promise.resolve(s); }
      // se il rinnovo non va, la sessione e' finita: si torna al login
      return token('refresh_token', { refresh_token: s.refresh }).catch(function () {
        salva(null);
        onScaduta();
        throw new Error('sessione scaduta');
      });
    }

    function api(path, opts) {
      opts = opts || {};
      return valida().then(function (s) {
        var h = { apikey: KEY, Authorization: 'Bearer ' + s.access, 'Content-Type': 'application/json' };
        if (opts.prefer) { h.Prefer = opts.prefer; }
        return fetch(URL_SB + path, { method: opts.method || 'GET', headers: h, body: opts.body });
      }).then(function (res) {
        if (res.status === 401) { esci(); onScaduta(); throw new Error('sessione scaduta'); }
        if (!res.ok) { var err = new Error('HTTP ' + res.status); err.status = res.status; throw err; }
        return res.status === 204 ? null : res.json();
      });
    }

    function entra(email, password) {
      return token('password', { email: email, password: password });
    }

    function esci() {
      var s = leggi();
      salva(null);
      if (s) {
        fetch(URL_SB + '/auth/v1/logout', {
          method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access }
        }).catch(function () {});
      }
    }

    return { attiva: function () { return !!leggi(); }, entra: entra, esci: esci, api: api };
  }

  // ---------- aiuti per disegnare ----------
  // I dati arrivano da un form pubblico: sempre textContent, mai innerHTML.
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

  // ---------- esportazione ----------
  // punto e virgola e BOM: Excel in italiano lo apre gia' diviso in colonne
  // e con gli accenti giusti. Una cella che inizia con = + - @ viene
  // neutralizzata, altrimenti Excel la eseguirebbe come formula.
  function cella(v) {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) { v = "'" + v; }
    return '"' + v.replace(/"/g, '""') + '"';
  }

  function scaricaCsv(nome, righe) {
    var csv = '\uFEFF' + righe.map(function (r) { return r.map(cella).join(';'); }).join('\r\n');
    var a = el('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  window.PubbyAdm = { sessione: sessione, el: el, dataOra: dataOra, scaricaCsv: scaricaCsv };
})();

(function () {
  'use strict';

  // header: sfondo pieno appena si scrolla
  var header = document.querySelector('.header');
  if (header) {
    var stick = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    stick();
    window.addEventListener('scroll', stick, { passive: true });
  }

  // menu mobile
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // comparsa allo scroll
  var targets = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  // conteggio dei numeri quando entrano nello schermo
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noMotion || !('IntersectionObserver' in window) || !window.requestAnimationFrame) {
      // niente animazione: il valore finale e' gia' nel markup, non tocco nulla
    } else {
      var run = function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) { return; }
        // azzero solo qui: se l'observer non scattasse mai, nel markup
        // resta il valore vero invece di un misero "0"
        el.textContent = '0';
        var durata = 1100;
        var inizio = null;
        var finito = false;
        var chiudi = function () {
          if (finito) { return; }
          finito = true;
          el.textContent = String(target);
        };
        var passo = function (ora) {
          if (finito) { return; }
          if (inizio === null) { inizio = ora; }
          var t = Math.min((ora - inizio) / durata, 1);
          if (t < 1) {
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
            window.requestAnimationFrame(passo);
          } else {
            chiudi();
          }
        };
        // rete di sicurezza: se requestAnimationFrame non gira (scheda in
        // secondo piano, motore che la sospende) il numero non resta a zero
        window.setTimeout(chiudi, durata + 2000);
        window.requestAnimationFrame(passo);
      };
      var ioNum = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            ioNum.unobserve(entry.target);
            run(entry.target);
          }
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) {
        ioNum.observe(el);
      });
    }
  }

  // anno nel footer
  var y = document.getElementById('anno');
  if (y) { y.textContent = new Date().getFullYear(); }
})();

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

  // anno nel footer
  var y = document.getElementById('anno');
  if (y) { y.textContent = new Date().getFullYear(); }
})();

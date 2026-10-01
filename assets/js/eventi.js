(function () {
  'use strict';

  // Eventi in programma: una card resta visibile fino al suo data-fino
  // compreso, il giorno dopo sparisce. Se non resta niente, compare il
  // messaggio "nessun evento". Senza JavaScript si vedono tutte.

  var oggi = new Date();
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = oggi.getFullYear() + '-' + pad(oggi.getMonth() + 1) + '-' + pad(oggi.getDate());

  var visibili = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.ev[data-fino]'), function (card) {
    if (card.getAttribute('data-fino') < iso) { card.hidden = true; } else { visibili++; }
  });

  var vuoto = document.getElementById('ev-empty');
  if (vuoto) { vuoto.hidden = visibili > 0; }
})();

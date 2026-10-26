// Erzeugt für jede Adresse Links zu Google Maps und Apple Maps.
// Die Adresse selbst öffnet auf Apple-Geräten Apple Maps, sonst Google Maps.
(function () {
  var istApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

  document.querySelectorAll("[data-adresse]").forEach(function (el) {
    var adresse = el.getAttribute("data-adresse");
    var q = encodeURIComponent(adresse);
    var google = "https://www.google.com/maps/search/?api=1&query=" + q;
    var apple = "https://maps.apple.com/?q=" + q;

    var link = el.querySelector(".adresse");
    if (link) link.href = istApple ? apple : google;

    var ziel = el.querySelector(".karten-links");
    if (!ziel) return;
    [["Google Maps", google], ["Apple Maps", apple]].forEach(function (k) {
      var a = document.createElement("a");
      a.className = "karten-link sans";
      a.href = k[1];
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = k[0];
      ziel.appendChild(a);
    });
  });
})();

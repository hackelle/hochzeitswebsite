// Aquarell-Blumen, die sich langsam in den Hintergrund "malen".
// Jede Blume: Stiel wird gezeichnet, dann Blätter, dann blühen die Blüten auf.
// Nach dem ersten Bild verblasst immer wieder eine alte Blume und eine neue entsteht.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FARBEN = {
    peach: "#F3AE8D",
    apricot: "#F79E5C",
    golden: "#E7A23A",
    copper: "#CB5A30",
    misty: "#9AADBE"
  };
  var BLUETEN = ["peach", "apricot", "golden", "copper", "misty", "peach", "apricot", "misty"];
  var MOSS = "#9F8A49";

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var behaelter = document.querySelector(".hintergrund");
  if (!behaelter) return;

  var svg, ebene, blumen = [], breite = 0, hoehe = 0, takt;

  function el(name, attrs, eltern) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (eltern) eltern.appendChild(e);
    return e;
  }

  function zufall(a, b) { return a + Math.random() * (b - a); }
  function wahl(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

  function definitionen() {
    var defs = el("defs", {}, svg);
    // Ausgefranste, leicht verlaufene Ränder wie bei nasser Farbe
    var f = el("filter", { id: "aquarell", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.04", numOctaves: "3", seed: "7", result: "rauschen" }, f);
    el("feDisplacementMap", { "in": "SourceGraphic", in2: "rauschen", scale: "12", xChannelSelector: "R", yChannelSelector: "G", result: "verzerrt" }, f);
    el("feGaussianBlur", { "in": "verzerrt", stdDeviation: "0.8" }, f);

    // Pigment sammelt sich am Rand: innen heller, außen kräftiger
    Object.keys(FARBEN).concat(["moss"]).forEach(function (name) {
      var farbe = FARBEN[name] || MOSS;
      var g = el("radialGradient", { id: "pigment-" + name, cx: "50%", cy: "55%", r: "60%" }, defs);
      el("stop", { offset: "0%", "stop-color": farbe, "stop-opacity": "0.18" }, g);
      el("stop", { offset: "65%", "stop-color": farbe, "stop-opacity": "0.42" }, g);
      el("stop", { offset: "100%", "stop-color": farbe, "stop-opacity": "0.75" }, g);
    });
  }

  function blatt(laenge, breite) {
    return "M0 0 C" + breite + " " + (-laenge * 0.3) + " " + (breite * 0.8) + " " + (-laenge * 0.9) +
      " 0 " + (-laenge) + " C" + (-breite * 0.8) + " " + (-laenge * 0.9) + " " + (-breite) + " " +
      (-laenge * 0.3) + " 0 0Z";
  }

  function wachsen(e, verzoegerung, dauer) {
    e.style.transform = "scale(0.15)";
    e.style.opacity = "0";
    e.style.transition = "transform " + dauer + "s cubic-bezier(0.22, 1, 0.36, 1) " + verzoegerung +
      "s, opacity " + (dauer * 0.8) + "s ease " + verzoegerung + "s";
  }

  function blume(x, y, groesse) {
    var farbe = wahl(BLUETEN);
    var g = el("g", { transform: "translate(" + x + " " + y + ")", filter: "url(#aquarell)" }, ebene);
    g.style.transition = "opacity 2.5s ease";
    var teile = [];

    // Stiel
    var stielLaenge = groesse * zufall(1.6, 2.6);
    var neigung = zufall(-0.5, 0.5) * groesse;
    var stiel = el("path", {
      d: "M0 0 Q" + neigung + " " + (stielLaenge * 0.5) + " " + (neigung * 0.4) + " " + stielLaenge,
      fill: "none", stroke: MOSS, "stroke-width": Math.max(1.5, groesse * 0.05),
      "stroke-linecap": "round", opacity: "0.55"
    }, g);
    var lang = stielLaenge * 1.2;
    stiel.style.strokeDasharray = lang;
    stiel.style.strokeDashoffset = lang;
    stiel.style.transition = "stroke-dashoffset 1.6s ease-in-out";
    teile.push([stiel, "strokeDashoffset", "0"]);

    // Blätter am Stiel
    for (var b = 0; b < 2; b++) {
      var hb = el("g", { transform: "translate(" + (neigung * 0.35) + " " + (stielLaenge * zufall(0.45, 0.75)) +
        ") rotate(" + (b ? zufall(40, 70) : zufall(-70, -40)) + ")" }, g);
      var bl = el("path", { d: blatt(groesse * 0.7, groesse * 0.22), fill: "url(#pigment-moss)" }, hb);
      wachsen(bl, 0.9 + b * 0.3, 1.6);
      teile.push([bl]);
    }

    // Blütenblätter in zwei Lagen für überlappende Lasuren
    var anzahl = wahl([5, 6, 8, 12]);
    var laenge = groesse * (anzahl > 8 ? 0.85 : 0.75);
    var dicke = groesse * (anzahl > 8 ? 0.2 : 0.42);
    var start = zufall(0, 360);
    for (var lage = 0; lage < 2; lage++) {
      for (var i = 0; i < anzahl; i++) {
        var winkel = start + (360 / anzahl) * i + (lage ? 360 / anzahl / 2 : 0) + zufall(-6, 6);
        var hp = el("g", { transform: "rotate(" + winkel + ")" }, g);
        var faktor = lage ? 0.78 : 1;
        var p = el("path", {
          d: blatt(laenge * faktor * zufall(0.9, 1.1), dicke * faktor * zufall(0.85, 1.15)),
          fill: "url(#pigment-" + farbe + ")"
        }, hp);
        p.style.mixBlendMode = "multiply";
        wachsen(p, 1.6 + lage * 0.6 + i * 0.12, 2.2);
        teile.push([p]);
      }
    }

    // Blütenmitte
    var mitte = el("circle", { r: groesse * 0.14, fill: "url(#pigment-golden)" }, g);
    wachsen(mitte, 3.2, 1.5);
    teile.push([mitte]);

    // Im nächsten Frame starten, damit die Übergänge greifen
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        teile.forEach(function (t) {
          if (t[1]) t[0].style[t[1]] = t[2];
          else { t[0].style.transform = "scale(1)"; t[0].style.opacity = "1"; }
        });
      });
    });

    return { g: g, x: x, y: y, r: groesse };
  }

  // Bereiche mit Inhalt freihalten, damit unter dem Glas keine trüben Flecken entstehen
  var FREIHALTEN = ".titel, .untertitel, .trenner, .event-button, .hero";

  function belegt() {
    return Array.prototype.map.call(document.querySelectorAll(FREIHALTEN), function (e) {
      return e.getBoundingClientRect();
    });
  }

  function platz(groesse) {
    var flaechen = belegt();
    for (var versuch = 0; versuch < 80; versuch++) {
      var x = zufall(0, breite), y = zufall(0, hoehe);
      // Umriss der Blume samt Stiel
      var l = x - groesse, r = x + groesse, o = y - groesse, u = y + groesse * 2.6;
      var frei = flaechen.every(function (f) {
        return r < f.left - 8 || l > f.right + 8 || u < f.top - 8 || o > f.bottom + 8;
      }) && blumen.every(function (b) {
        var dx = b.x - x, dy = b.y - y;
        return Math.sqrt(dx * dx + dy * dy) > (b.r + groesse) * 1.3;
      });
      if (frei) return [x, y];
    }
    return null;
  }

  function neueBlume() {
    var basis = Math.min(breite, hoehe);
    var groesse = zufall(0.07, 0.12) * Math.max(basis, 500);
    var pos = platz(groesse);
    if (pos) blumen.push(blume(pos[0], pos[1], groesse));
  }

  function aufbauen() {
    clearInterval(takt);
    breite = window.innerWidth;
    hoehe = window.innerHeight;
    if (svg) svg.remove();
    blumen = [];
    svg = el("svg", { "class": "aquarell", viewBox: "0 0 " + breite + " " + hoehe, preserveAspectRatio: "xMidYMid slice" });
    definitionen();
    ebene = el("g", {}, svg);
    behaelter.appendChild(svg);

    var ziel = breite > 700 ? 10 : 6;
    for (var i = 0; i < ziel; i++) {
      (function (n) {
        setTimeout(neueBlume, ruhig ? 0 : n * 900);
      })(i);
    }
    if (ruhig) return;

    // Danach: alte Blume verblasst, neue wird gemalt
    takt = setInterval(function () {
      if (document.hidden || blumen.length < ziel) return;
      var alt = blumen.shift();
      alt.g.style.opacity = "0";
      setTimeout(function () { alt.g.remove(); }, 2600);
      neueBlume();
    }, 7000);
  }

  var letzteBreite = window.innerWidth;
  window.addEventListener("resize", function () {
    // Mobile Adressleiste ändert nur die Höhe – dann nicht neu malen
    if (Math.abs(window.innerWidth - letzteBreite) < 50) return;
    letzteBreite = window.innerWidth;
    clearTimeout(aufbauen.t);
    aufbauen.t = setTimeout(aufbauen, 300);
  });

  aufbauen();
})();

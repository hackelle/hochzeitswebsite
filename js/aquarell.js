// Aquarell-Blumen, die sich langsam in den Hintergrund "malen".
// Jede Blume: Stiel wird gezeichnet, dann Blätter, dann blühen die Blüten auf.
// Die Blumen liegen über die ganze Seite verteilt und scrollen mit; jede malt sich,
// sobald sie ins Bild kommt. Danach verblasst im sichtbaren Bereich immer wieder
// eine alte Blume und eine neue entsteht.
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
  if (!document.querySelector(".hintergrund")) return;

  var svg, ebene, blumen = [], breite = 0, hoehe = 0, takt, beobachter;
  var PRO_BILDSCHIRM = window.innerWidth > 700 ? 10 : 6;

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

    var blumeObj = { g: g, x: x, y: y, r: groesse, gemalt: false };
    blumeObj.malen = function (verzoegerung) {
      if (blumeObj.gemalt) return;
      blumeObj.gemalt = true;
      setTimeout(function () {
        // Im nächsten Frame starten, damit die Übergänge greifen
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            teile.forEach(function (t) {
              if (t[1]) t[0].style[t[1]] = t[2];
              else { t[0].style.transform = "scale(1)"; t[0].style.opacity = "1"; }
            });
          });
        });
      }, verzoegerung || 0);
    };
    return blumeObj;
  }

  // Bereiche mit Inhalt freihalten, damit unter dem Glas keine trüben Flecken entstehen.
  // Auf dem Handy decken die Karten fast die ganze Breite ab, dort dürfen Blumen darunter.
  var FREIHALTEN = ".titel, .untertitel, .trenner, .event-button, .hero h1, .hero .datum, .zusage-knopf, .zurueck";

  function belegt() {
    var auswahl = FREIHALTEN + (breite > 700 ? ", .karte" : "");
    return Array.prototype.map.call(document.querySelectorAll(auswahl), function (e) {
      var r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    });
  }

  // Zufälliger freier Platz zwischen von und bis (Seitenkoordinaten)
  function platz(groesse, von, bis) {
    var flaechen = belegt();
    for (var versuch = 0; versuch < 80; versuch++) {
      var x = zufall(0, breite), y = zufall(von, bis);
      // Umriss der Blume samt Stiel
      var l = x - groesse, r = x + groesse, o = y - groesse, u = y + groesse * 2.6;
      if (u > hoehe) continue;
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

  function neueBlume(von, bis) {
    var basis = Math.min(breite, window.innerHeight);
    var groesse = zufall(0.07, 0.12) * Math.max(basis, 500);
    var pos = platz(groesse, von, bis);
    if (!pos) return null;
    var b = blume(pos[0], pos[1], groesse);
    blumen.push(b);
    return b;
  }

  function seitenhoehe() {
    return Math.max(document.documentElement.scrollHeight, window.innerHeight);
  }

  function aufbauen() {
    clearInterval(takt);
    if (beobachter) beobachter.disconnect();
    if (svg) svg.remove();
    blumen = [];
    breite = document.documentElement.clientWidth;
    hoehe = seitenhoehe();

    svg = el("svg", { "class": "aquarell", "aria-hidden": "true", width: breite, height: hoehe,
      viewBox: "0 0 " + breite + " " + hoehe });
    svg.style.height = hoehe + "px";
    definitionen();
    ebene = el("g", {}, svg);
    document.body.appendChild(svg);

    // Blumen über die ganze Seite verteilen
    var ziel = Math.round(PRO_BILDSCHIRM * hoehe / window.innerHeight);
    for (var i = 0; i < ziel; i++) neueBlume(0, hoehe);

    if (ruhig) {
      blumen.forEach(function (b) { b.malen(0); });
      return;
    }

    // Erst malen, wenn die Blume ins Bild kommt; mehrere nacheinander statt gleichzeitig
    var warteschlange = 0;
    beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        var b = blumen.filter(function (x) { return x.g === e.target; })[0];
        beobachter.unobserve(e.target);
        if (!b) return;
        b.malen(warteschlange * 700);
        warteschlange++;
        setTimeout(function () { warteschlange = Math.max(0, warteschlange - 1); }, 700 * warteschlange + 700);
      });
    }, { threshold: 0.2 });
    blumen.forEach(function (b) { beobachter.observe(b.g); });

    // Im sichtbaren Bereich: alte Blume verblasst, neue wird gemalt
    takt = setInterval(function () {
      if (document.hidden) return;
      var oben = window.scrollY, unten = oben + window.innerHeight;
      var sichtbar = blumen.filter(function (b) { return b.gemalt && b.y > oben && b.y < unten; });
      if (sichtbar.length < 2) return;
      var alt = sichtbar[0];
      blumen.splice(blumen.indexOf(alt), 1);
      alt.g.style.opacity = "0";
      setTimeout(function () { alt.g.remove(); }, 2600);
      var neu = neueBlume(oben, unten);
      if (neu) neu.malen(0);
    }, 7000);
  }

  // Neu malen, wenn sich die Breite deutlich ändert (nicht bei der mobilen Adressleiste)
  var letzteBreite = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - letzteBreite) < 50) return;
    letzteBreite = window.innerWidth;
    clearTimeout(aufbauen.t);
    aufbauen.t = setTimeout(aufbauen, 300);
  });

  // Wächst die Seite (z.B. durch das Zusage-Formular), die Ebene mitwachsen lassen
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      var h = seitenhoehe();
      if (!svg || Math.abs(h - hoehe) < 20) return;
      hoehe = h;
      svg.setAttribute("height", hoehe);
      svg.setAttribute("viewBox", "0 0 " + breite + " " + hoehe);
      svg.style.height = hoehe + "px";
    }).observe(document.body);
  }

  if (document.readyState === "complete") aufbauen();
  else window.addEventListener("load", aufbauen);
})();

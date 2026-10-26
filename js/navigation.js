// Zurück-Button nur für Gäste, die über die Hauptseite gekommen sind
// (also zu beiden Events eingeladen). Wer per QR-Code direkt auf einer
// Unterseite landet, sieht ihn nicht.
(function () {
  var MERKER = "hochzeit-hauptseite";

  function lesen() { try { return localStorage.getItem(MERKER) === "1"; } catch (e) { return false; } }
  function merken() { try { localStorage.setItem(MERKER, "1"); } catch (e) {} }

  if (document.body.hasAttribute("data-hauptseite")) {
    merken();
    return;
  }

  var vonHauptseite = false;
  try {
    var ref = new URL(document.referrer);
    vonHauptseite = ref.origin === location.origin && /(\/|index\.html)$/.test(ref.pathname);
  } catch (e) {}

  if (vonHauptseite || lesen()) {
    document.querySelectorAll(".zurueck").forEach(function (a) { a.hidden = false; });
  }
})();

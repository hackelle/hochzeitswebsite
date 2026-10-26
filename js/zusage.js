// Bindet das Tally-Formular ein, sobald eine Formular-ID eingetragen ist.
(function () {
  var box = document.querySelector("[data-tally-id]");
  if (!box) return;
  var id = box.getAttribute("data-tally-id").trim();
  if (!id) return; // Platzhaltertext bleibt stehen

  box.innerHTML = "";
  var iframe = document.createElement("iframe");
  iframe.src = "https://tally.so/embed/" + encodeURIComponent(id) +
    "?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";
  iframe.title = box.getAttribute("data-titel") || "Zusage";
  iframe.loading = "lazy";
  iframe.width = "100%";
  iframe.height = "500";
  iframe.style.border = "0";
  box.appendChild(iframe);

  // Ausweichlink, falls das eingebettete Formular nicht lädt (z.B. durch Tracking-Blocker)
  var p = document.createElement("p");
  p.className = "hinweis sans";
  p.innerHTML = 'Formular wird nicht angezeigt? <a target="_blank" rel="noopener" href="https://tally.so/r/' +
    encodeURIComponent(id) + '">Hier in neuem Tab öffnen</a>.';
  box.appendChild(p);

  var s = document.createElement("script");
  s.src = "https://tally.so/widgets/embed.js";
  s.async = true;
  document.body.appendChild(s);
})();

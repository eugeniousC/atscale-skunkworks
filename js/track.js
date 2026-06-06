/* First-party, privacy-light engagement tracking — atScale.
 *
 * Answers one question: is the messaging good enough to create traffic + clicks?
 * Records page views and clicks on links/buttons (CTA labels), nothing more.
 * No cookies, no fingerprinting, no personal data, no third-party tracker. Fits
 * the site's "your answers are not shared" promise and its CSP (POSTs go to the
 * already-allowed script.google.com endpoint).
 *
 * INACTIVE until you set ENDPOINT to your Google Apps Script /exec URL. Until
 * then every call is a harmless no-op, so this file is safe to ship as-is.
 */
(function () {
  // Paste your Apps Script web-app /exec URL here to switch tracking on:
  var ENDPOINT = "";

  function send(type, data) {
    if (!ENDPOINT) return; // dormant until configured
    try {
      var body = JSON.stringify(
        Object.assign(
          {
            type: type,
            path: location.pathname,
            ref: document.referrer || "",
            ts: Date.now(),
            vw: window.innerWidth || 0,
          },
          data || {}
        )
      );
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(ENDPOINT, { method: "POST", body: body, mode: "no-cors", keepalive: true });
      }
    } catch (e) {
      /* never let tracking break the page */
    }
  }

  // Expose for explicit funnel events (e.g. diagnostic completion).
  window.atTrack = send;

  function init() {
    send("page_view");
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target && e.target.closest ? e.target.closest("a, button") : null;
        if (!el) return;
        send("click", {
          label: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          href: el.getAttribute("href") || "",
          role: (el.className || "").toString().slice(0, 40),
        });
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

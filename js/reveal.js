/* Scroll-reveal + count-up — skunkworks motion layer.
 *
 * CSP-friendly (script-src 'self'): no inline script, no eval. Loaded from <head>
 * WITHOUT defer so the `js` flag lands before first paint (prevents a flash of
 * the pre-reveal state). The DOM-dependent work waits for DOMContentLoaded.
 *
 * Progressive enhancement: the reveal CSS is gated on `html.js`, so if this file
 * never loads, every [data-reveal] element stays fully visible.
 */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = target % 1 !== 0 ? 1 : 0;

    if (reduce) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 1200;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function init() {
    var revealEls = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal]")
    );
    var counters = Array.prototype.slice.call(
      document.querySelectorAll("[data-count]")
    );

    // No IntersectionObserver (or reduced motion): show everything, set finals.
    if (reduce || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in"); });
      counters.forEach(countUp);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });

    // Counters fire once when they scroll into view.
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

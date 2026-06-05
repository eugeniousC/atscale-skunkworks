/* Variants lab — click any diagram to replay its draw-on motion.
 * CSP-safe (script-src 'self'): external, no inline, no eval.
 * Works alongside reveal.js, which adds `.in` on scroll; this just re-triggers it.
 */
(function () {
  function init() {
    var diagrams = document.querySelectorAll(".hero-visual");
    diagrams.forEach(function (el) {
      el.addEventListener("click", function () {
        el.classList.remove("in");
        // force reflow so the animation restarts from 0
        void el.offsetWidth;
        requestAnimationFrame(function () { el.classList.add("in"); });
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

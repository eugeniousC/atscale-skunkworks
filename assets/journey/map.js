// Scaling Journey map — populates the graphic from ?tier= & ?score= query params.
// External (not inline) to satisfy the site CSP: script-src 'self'.
(function () {
  const TIERS = ["grind", "plateau", "inflection", "machine"];
  const NAMES = { grind: "The Grind", plateau: "The Plateau", inflection: "The Inflection", machine: "The Machine" };
  const FOOT = {
    grind: "You're building the foundation. The Replication Wall is still ahead — the goal now is systems that don't depend on you.",
    plateau: "You're at the Wall. The business has outgrown what one person can hold, and working harder won't get you across — structure will.",
    inflection: "You're through the Wall. The work now is acceleration: forecast discipline, decision rights, and an engine that compounds.",
    machine: "You're operating at altitude. The engine runs without you in every room. From here it's strategic counsel, not foundation repair."
  };
  const q = new URLSearchParams(location.search);
  const tier = (q.get("tier") || "plateau").toLowerCase();
  const score = q.get("score") || "22";
  const i = Math.max(0, TIERS.indexOf(tier));
  document.getElementById("num").textContent = score;
  document.getElementById("tierlbl").textContent = NAMES[tier] || "The Plateau";
  document.getElementById("foot").innerHTML = FOOT[tier] || FOOT.plateau;
  document.querySelectorAll(".stop").forEach((s, idx) => {
    if (idx < i) s.classList.add("passed");
    if (idx === i) {
      s.classList.add("here", "passed");
      const tag = document.createElement("div");
      tag.className = "youare";
      tag.textContent = "You are here";
      s.appendChild(tag);
    }
  });
  document.getElementById("raildone").style.width = (i * 25 + 12.5) + "%";
})();

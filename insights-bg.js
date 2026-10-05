/* =====================================================================
   INDUSTRY INSIGHTS — ANIMATED BACKGROUND
   Generates glowing particles and adds a subtle cursor-parallax to
   the decorative background behind the Industry Insights cards.
   Safe no-op on any page that doesn't have the section.
   ===================================================================== */
(function () {
    "use strict";

    const section = document.querySelector(".project-blogs");
    const bg = document.getElementById("insightsBg");
    const field = document.getElementById("insightsParticles");
    if (!section || !bg || !field) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* -----------------------------------------------------------
       1. GLOWING PARTICLES
       Randomized size/position/timing, drifting upward and fading
       — fewer on small screens to stay premium, not cluttered.
    ------------------------------------------------------------ */
    function buildParticles() {
        field.innerHTML = "";
        const count = window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 16 : 24;
        const colors = [
            "rgba(28,155,224,0.85)",
            "rgba(238,109,0,0.8)",
            "rgba(230,244,253,0.9)",
        ];

        for (let i = 0; i < count; i++) {
            const dot = document.createElement("span");
            const size = 2 + Math.random() * 4;
            const color = colors[i % colors.length];
            const duration = 6 + Math.random() * 7;
            const delay = Math.random() * -duration;
            const opacity = 0.5 + Math.random() * 0.4;

            dot.className = "absolute rounded-full";
            dot.style.cssText =
                "left:" + (Math.random() * 100).toFixed(2) + "%;" +
                "top:" + (20 + Math.random() * 75).toFixed(2) + "%;" +
                "width:" + size.toFixed(1) + "px;" +
                "height:" + size.toFixed(1) + "px;" +
                "background:" + color + ";" +
                "box-shadow:0 0 " + (size * 3).toFixed(0) + "px " + color + ";" +
                "--p-op:" + opacity.toFixed(2) + ";" +
                (reduceMotion
                    ? "opacity:" + opacity.toFixed(2) + ";"
                    : "animation:ffParticleFloat " + duration.toFixed(2) + "s ease-in-out " + delay.toFixed(2) + "s infinite;");

            field.appendChild(dot);
        }
    }

    buildParticles();

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildParticles, 300);
    });

    /* -----------------------------------------------------------
       2. CURSOR PARALLAX
       The whole background layer drifts a few pixels toward the
       cursor for a subtle sense of depth — never enough to
       distract from the cards sitting above it.
    ------------------------------------------------------------ */
    if (!reduceMotion) {
        bg.style.transition = "transform 0.4s ease-out";

        section.addEventListener("mousemove", (e) => {
            const rect = section.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            bg.style.transform = "translate(" + (px * 16).toFixed(1) + "px," + (py * 12).toFixed(1) + "px)";
        });

        section.addEventListener("mouseleave", () => {
            bg.style.transform = "translate(0, 0)";
        });
    }
})();

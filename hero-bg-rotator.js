(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var heroes = document.querySelectorAll(".site-hero");
    if (!heroes.length) return;

    heroes.forEach(function (hero) {
      // Crossfading background slideshow (3 photos, ~15s cycle)
      var slides = hero.querySelectorAll(".hero-bg-slide");
      if (slides.length >= 2) {
        var current = 0;
        setInterval(function () {
          slides[current].classList.remove("active");
          current = (current + 1) % slides.length;
          slides[current].classList.add("active");
        }, 5000);
      }

      // Scroll indicator (mouse + chevron), matching the reference hero
      if (!hero.querySelector(".site-hero-scroll")) {
        var scrollEl = document.createElement("div");
        scrollEl.className = "site-hero-scroll";
        scrollEl.setAttribute("aria-hidden", "true");
        scrollEl.innerHTML = '<span class="mouse"></span><i class="fa-solid fa-chevron-down"></i>';
        hero.appendChild(scrollEl);
      }
    });
  });
})();

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var track = document.getElementById("journeyTrack");
    var prevBtn = document.getElementById("journeyPrev");
    var nextBtn = document.getElementById("journeyNext");
    var dots = document.querySelectorAll(".journey-dot");
    if (!track) return;

    var cards = track.querySelectorAll(".journey-card");
    var total = cards.length;

    function visibleCount() {
      var w = window.innerWidth;
      if (w <= 720) return 1;
      if (w <= 1100) return 2;
      return 3;
    }

    var index = 0;

    function maxIndex() {
      return Math.max(0, total - visibleCount());
    }

    function update() {
      var vCount = visibleCount();
      var max = maxIndex();
      if (index > max) index = max;
      if (index < 0) index = 0;

      var cardWidth = cards[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var offset = index * (cardWidth + gap);
      track.style.transform = "translateX(-" + offset + "px)";

      // Update dot states relative to current index over available range
      dots.forEach(function (dot, i) {
        var dotMax = dots.length - 1;
        var mappedIndex = max === 0 ? 0 : Math.round((i / dotMax) * max);
        dot.classList.toggle("active", mappedIndex === index);
      });

      prevBtn.style.opacity = index === 0 ? "0.5" : "1";
      nextBtn.style.opacity = index === max ? "0.5" : "1";
    }

    prevBtn.addEventListener("click", function () {
      index = Math.max(0, index - 1);
      update();
    });

    nextBtn.addEventListener("click", function () {
      index = Math.min(maxIndex(), index + 1);
      update();
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        var max = maxIndex();
        var dotMax = dots.length - 1;
        index = max === 0 ? 0 : Math.round((i / dotMax) * max);
        update();
      });
    });

    window.addEventListener("resize", update);
    update();
  });
})();

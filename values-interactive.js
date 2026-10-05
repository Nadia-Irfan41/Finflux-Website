document.addEventListener("DOMContentLoaded", function () {

  /* Cursor-following glow on each value card */
  var cards = document.querySelectorAll(".value-card");

  cards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });

  /* Generate floating glowing particles in the background */
  var field = document.querySelector(".v-particles");
  if (field) {
    var count = window.innerWidth < 768 ? 14 : 26;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "v-particle";
      var size = Math.random() * 4 + 2;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.animationDuration = (Math.random() * 8 + 8) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      field.appendChild(p);
    }
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Cursor-tracked 3D tilt for Our Team cards (About page) */
  var teamCards = document.querySelectorAll(".team-card");
  if (teamCards.length && !reduceMotion) {
    teamCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rotateY = ((x - cx) / cx) * 7;
        var rotateX = -((y - cy) / cy) * 7;
        card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-10px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* Generate floating glowing particles behind Our Journey */
  var jField = document.querySelector(".j-particles");
  if (jField) {
    var jCount = window.innerWidth < 768 ? 10 : 18;
    for (var jp = 0; jp < jCount; jp++) {
      var jParticle = document.createElement("span");
      jParticle.className = "j-particle";
      var jSize = Math.random() * 4 + 2;
      jParticle.style.width = jSize + "px";
      jParticle.style.height = jSize + "px";
      jParticle.style.left = Math.random() * 100 + "%";
      jParticle.style.top = Math.random() * 100 + "%";
      jParticle.style.animationDuration = (Math.random() * 8 + 8) + "s";
      jParticle.style.animationDelay = (Math.random() * 10) + "s";
      jField.appendChild(jParticle);
    }
  }

  /* Generate floating glowing particles behind Our Vision */
  var vsField = document.querySelector(".vs-particles");
  if (vsField) {
    var vsCount = window.innerWidth < 768 ? 12 : 22;
    for (var vp = 0; vp < vsCount; vp++) {
      var vsParticle = document.createElement("span");
      vsParticle.className = "vs-particle";
      var vsSize = Math.random() * 4 + 2;
      vsParticle.style.width = vsSize + "px";
      vsParticle.style.height = vsSize + "px";
      vsParticle.style.left = Math.random() * 100 + "%";
      vsParticle.style.top = Math.random() * 100 + "%";
      vsParticle.style.animationDuration = (Math.random() * 8 + 9) + "s";
      vsParticle.style.animationDelay = (Math.random() * 10) + "s";
      vsField.appendChild(vsParticle);
    }
  }

  /* Generate floating glowing dots behind the Our Mission section */
  var mField = document.querySelector(".m-dots");
  if (mField) {
    var mCount = window.innerWidth < 768 ? 10 : 18;
    for (var j = 0; j < mCount; j++) {
      var d = document.createElement("span");
      d.className = "m-dot";
      var dSize = Math.random() * 4 + 2;
      d.style.width = dSize + "px";
      d.style.height = dSize + "px";
      d.style.left = Math.random() * 100 + "%";
      d.style.top = Math.random() * 100 + "%";
      d.style.animationDuration = (Math.random() * 8 + 9) + "s";
      d.style.animationDelay = (Math.random() * 10) + "s";
      mField.appendChild(d);
    }
  }

  /* Our Mission card: 180deg 3D flip every time it enters the viewport */
  var missionBox = document.querySelector(".mission-box");
  var missionInner = document.querySelector(".mission-flip-inner");

  if (missionBox && missionInner && !reduceMotion && "IntersectionObserver" in window) {
    var missionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          missionInner.classList.remove("flip-reveal");
          void missionInner.offsetWidth; // restart animation reliably
          missionInner.classList.add("flip-reveal");
        } else {
          missionInner.classList.remove("flip-reveal");
        }
      });
    }, { threshold: 0.35 });

    missionObserver.observe(missionBox);
  }

});

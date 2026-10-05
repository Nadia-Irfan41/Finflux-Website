/* =====================================================================
   FINFLUX GROUP — HOME PAGE INTERACTIONS
   Vanilla JS only. No external animation libraries — kept deliberately
   light so the video-heavy hero stays fast on mobile connections.
   ===================================================================== */
(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* -----------------------------------------------------------
       1. MOBILE NAV TOGGLE
    ------------------------------------------------------------ */
    const menuToggle = document.getElementById("menuToggle");
    const navbar = document.getElementById("navbar");

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });

        // Close the mobile menu after a link is tapped
        navbar.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => navbar.classList.remove("active"));
        });
    }

    /* -----------------------------------------------------------
       2. HEADER: glass -> solid on scroll
    ------------------------------------------------------------ */
    const header = document.getElementById("siteHeader");

    function updateHeader() {
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* -----------------------------------------------------------
       3. SCROLL-REVEAL ENGINE
       Toggles .is-visible on any [data-reveal] element as it enters
       the viewport, and removes it again on exit so the animation
       replays every time — scrolling down into a section, or back
       up into one that already played.
    ------------------------------------------------------------ */
    const revealEls = document.querySelectorAll("[data-reveal]");

    if (reduceMotion) {
        // Show everything immediately; skip the motion entirely.
        revealEls.forEach((el) => el.classList.add("is-visible"));
    } else if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-visible", entry.isIntersecting);
                });
            },
            { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* -----------------------------------------------------------
       4. HERO VIDEO — subtle parallax zoom-out on load, a gentle
          drift tied to scroll for a cinematic feel, and playing
          both hero videos back-to-back on a continuous loop
          (video 1 -> video 2 -> video 1 -> ...).
    ------------------------------------------------------------ */
    const heroVideo = document.getElementById("heroVideo");

    if (heroVideo && !reduceMotion) {
        requestAnimationFrame(() => {
            heroVideo.style.transform = "scale(1)";
        });

        window.addEventListener(
            "scroll",
            () => {
                const offset = Math.min(window.scrollY * 0.06, 40);
                heroVideo.style.transform = `scale(1.06) translateY(${offset}px)`;
            },
            { passive: true }
        );
    }

    if (heroVideo) {
        const heroSources = [];
        let heroIndex = 0;

        const playCurrentHero = () => {
            heroVideo.play().catch(() => {
                /* Autoplay can be blocked before user interaction on some
                   mobile browsers — the video will start on first tap. */
            });
        };

        heroVideo.addEventListener("ended", () => {
            heroIndex = (heroIndex + 1) % heroSources.length;
            const source = heroVideo.querySelector("source");
            source.src = heroSources[heroIndex];
            heroVideo.load();
            playCurrentHero();
        });

        playCurrentHero();
    }

    /* -----------------------------------------------------------
       5. SIGNATURE ELEMENT — flight-path scroll progress marker
          Glides a plane marker down a dashed vertical "course line"
          in step with how far the visitor has travelled down the page.
    ------------------------------------------------------------ */
    const flightTrack = document.getElementById("flightTrack");
    const planeMarker = flightTrack ? flightTrack.querySelector(".plane-marker") : null;

    function updateFlightProgress() {
        if (!flightTrack || !planeMarker) return;
        const trackHeight = flightTrack.clientHeight;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
        planeMarker.style.top = `${progress * (trackHeight - 26)}px`;
    }

    if (flightTrack) {
        updateFlightProgress();
        window.addEventListener("scroll", updateFlightProgress, { passive: true });
        window.addEventListener("resize", updateFlightProgress);
    }

    /* -----------------------------------------------------------
       6. SCROLL-SYNCED 3D CARD ROTATION
       Feature & contact cards tilt/rotate in 3D as they travel
       through the viewport, in addition to their existing hover
       flip. Rotation is driven purely by each card's position
       relative to the viewport centre, so it reverses naturally
       when the user reverses scroll direction — no jump, no
       layout shift (transform-only, applied via CSS variables so
       it composes cleanly with the hover transform).
    ------------------------------------------------------------ */
    const tiltCards = document.querySelectorAll(".feature-card, .contact-card");

    if (tiltCards.length && !reduceMotion) {
        let lastY = window.scrollY;
        let scrollDir = 1; // 1 = down, -1 = up
        let ticking = false;
        const MAX_DEG = 10;

        function updateCardTilt() {
            const viewportH = window.innerHeight;
            const center = viewportH / 2;

            tiltCards.forEach((card) => {
                const rect = card.getBoundingClientRect();

                // Skip work for cards far outside the viewport.
                if (rect.bottom < -200 || rect.top > viewportH + 200) return;

                const cardCenter = rect.top + rect.height / 2;
                // -1 (below viewport) ... 0 (centered) ... 1 (above viewport)
                const progress = Math.max(-1, Math.min(1, (center - cardCenter) / center));

                const rx = (-progress * MAX_DEG * scrollDir).toFixed(2);
                const ry = (progress * MAX_DEG * 0.35 * scrollDir).toFixed(2);

                card.style.setProperty("--scroll-rx", rx + "deg");
                card.style.setProperty("--scroll-ry", ry + "deg");
            });

            ticking = false;
        }

        function onScroll() {
            const currentY = window.scrollY;
            scrollDir = currentY > lastY ? 1 : currentY < lastY ? -1 : scrollDir;
            lastY = currentY;

            if (!ticking) {
                requestAnimationFrame(updateCardTilt);
                ticking = true;
            }
        }

        updateCardTilt();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateCardTilt);
    }

    /* -----------------------------------------------------------
       7. SCROLL-ENTRANCE 180° 3D FLIP + COLOR REVEAL
       Every card on every page — feature, contact, value, team,
       chairman, vision/mission, project, blog, category, location —
       plays an independent 180° 3D rotation the moment it enters
       the viewport (either scroll direction), sweeping through the
       brand orange -> blue -> white glow as it turns. Implemented
       as a CSS animation toggled per-card by its own observer entry,
       so each card animates fully independently and always replays
       cleanly even on rapid scroll direction changes. Purely
       additive on top of each card's existing hover/tilt/flip
       behaviour and layout — nothing else is touched.
    ------------------------------------------------------------ */
    const allCards = document.querySelectorAll(
        ".feature-card, .contact-card, .value-card, .team-card, .chairman-card, " +
        ".vision-mission-card, .project-card, .blog-card, .category-card, .location-card"
    );

    if (allCards.length && !reduceMotion && "IntersectionObserver" in window) {
        const card3DObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const card = entry.target;

                    if (entry.isIntersecting) {
                        // Restart the animation even if it's still
                        // mid-play from a rapid scroll direction change.
                        card.classList.remove("card-3d-reveal");
                        void card.offsetWidth; // force reflow to reset the animation
                        card.classList.add("card-3d-reveal");
                    } else {
                        card.classList.remove("card-3d-reveal");
                    }
                });
            },
            { threshold: 0.3 }
        );

        allCards.forEach((card) => card3DObserver.observe(card));

        // Drop the class once the animation finishes so any hover /
        // scroll-tilt transform rules take back over immediately.
        allCards.forEach((card) => {
            card.addEventListener("animationend", (e) => {
                if (e.target === card) card.classList.remove("card-3d-reveal");
            });
        });
    } else if (allCards.length) {
        // Reduced motion (or no IO support): show cards as-is, no animation.
        allCards.forEach((card) => card.classList.remove("card-3d-reveal"));
    }

    /* -----------------------------------------------------------
       7b. AMBIENT CARD BUBBLES
       Adds a handful of soft, light-tinted circles that drift
       upward inside every card on a continuous loop, cycling
       through the brand's light orange / light blue / light white
       tints. Injected once on load — purely decorative, sits
       behind each card's own content, and never touches existing
       markup, sizing, or layout.
    ------------------------------------------------------------ */
    if (allCards.length && !reduceMotion) {
        const bubbleTints = [
            "rgba(255, 186, 130, .55)", // light orange
            "rgba(150, 210, 245, .55)", // light blue
            "rgba(255, 255, 255, .7)"   // light white
        ];

        allCards.forEach((card) => {
            const wrap = document.createElement("div");
            wrap.className = "card-bubbles";
            wrap.setAttribute("aria-hidden", "true");

            for (let i = 0; i < 5; i++) {
                const bubble = document.createElement("span");
                bubble.className = "card-bubble";
                const size = 10 + Math.random() * 22;
                bubble.style.width = size + "px";
                bubble.style.height = size + "px";
                bubble.style.left = (8 + Math.random() * 84) + "%";
                bubble.style.background = bubbleTints[i % bubbleTints.length];
                bubble.style.animationDelay = (Math.random() * 6).toFixed(2) + "s";
                bubble.style.animationDuration = (5 + Math.random() * 3).toFixed(2) + "s";
                wrap.appendChild(bubble);
            }

            card.insertBefore(wrap, card.firstChild);
        });
    }

    /* -----------------------------------------------------------
       7c. FLIGHT INQUIRY FORM — Passenger / Cargo toggle
       Smoothly fades/slides the visible field set out and the new
       one in, and glides the toggle's pill indicator across. Only
       runs on pages that actually have the inquiry form.
    ------------------------------------------------------------ */
    const inquiryToggle = document.querySelector(".inquiry-toggle");
    const inquiryButtons = document.querySelectorAll(".inquiry-toggle-btn");
    const inquiryFieldSets = document.querySelectorAll(".inquiry-fields");
    const inquiryForm = document.getElementById("inquiryForm");

    if (inquiryToggle && inquiryButtons.length && inquiryFieldSets.length) {
        inquiryButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                if (btn.classList.contains("active")) return;
                const type = btn.dataset.type;

                inquiryButtons.forEach((b) => {
                    b.classList.toggle("active", b === btn);
                    b.setAttribute("aria-selected", b === btn ? "true" : "false");
                });
                inquiryToggle.classList.toggle("cargo-active", type === "cargo");

                const nextSet = document.querySelector(`.inquiry-fields[data-fields="${type}"]`);
                const currentSet = Array.from(inquiryFieldSets).find((f) => !f.hidden);
                if (!nextSet || nextSet === currentSet) return;

                if (reduceMotion || !currentSet) {
                    if (currentSet) currentSet.hidden = true;
                    nextSet.hidden = false;
                    return;
                }

                currentSet.classList.add("fields-out");
                window.setTimeout(() => {
                    currentSet.hidden = true;
                    currentSet.classList.remove("fields-out");
                    nextSet.hidden = false;
                }, 300);
            });
        });

        if (inquiryForm) {
            // TODO: replace with the real inbox that should receive booking
            // inquiries. This is a placeholder address — until it's swapped
            // for a real one (and confirmed, see note below), no email will
            // actually arrive anywhere.
            const FINFLUX_INQUIRY_EMAIL = "info@example.com";

            function collectInquiryData(type) {
                if (type === "cargo") {
                    return {
                        "Inquiry Type": "Cargo",
                        "Departure": (document.getElementById("cDeparture") || {}).value || "",
                        "Destination": (document.getElementById("cDestination") || {}).value || "",
                        "Date": (document.getElementById("cDate") || {}).value || "",
                        "Weight (Tons)": (document.getElementById("cWeight") || {}).value || ""
                    };
                }
                return {
                    "Inquiry Type": "Passenger",
                    "Departure": (document.getElementById("pDeparture") || {}).value || "",
                    "Destination": (document.getElementById("pDestination") || {}).value || "",
                    "Date": (document.getElementById("pDate") || {}).value || "",
                    "Passengers": (document.getElementById("pPassengers") || {}).value || ""
                };
            }

            inquiryForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const submitBtn = inquiryForm.querySelector(".inquiry-submit");
                if (!submitBtn || submitBtn.disabled) return;

                const activeSet = Array.from(inquiryFieldSets).find((f) => !f.hidden);
                const type = activeSet ? activeSet.dataset.fields : "passenger";

                if (!inquiryForm.checkValidity()) {
                    inquiryForm.reportValidity();
                    return;
                }

                const fields = collectInquiryData(type);
                const payload = Object.assign(
                    { _subject: "New " + fields["Inquiry Type"] + " Booking Inquiry — FinFlux" },
                    fields
                );

                const original = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;

                fetch("https://formsubmit.co/ajax/" + FINFLUX_INQUIRY_EMAIL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify(payload)
                })
                    .then((res) => {
                        if (!res.ok) throw new Error("Request failed");
                        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Inquiry Sent';
                    })
                    .catch(() => {
                        submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Failed — Try Again';
                    })
                    .finally(() => {
                        window.setTimeout(() => {
                            submitBtn.innerHTML = original;
                            submitBtn.disabled = false;
                            inquiryForm.reset();
                        }, 2200);
                    });
            });
        }
    }

    /* -----------------------------------------------------------
       8. BUTTON HOVER TEXT SLIDE
       Applies a premium "slide up & swap" transition to every
       button/link across the site: on hover, current text glides
       up and out while a duplicate label glides in from below.
       Purely transform-based (no layout shift), and skips any
       icon-only controls that have no visible text to animate.
    ------------------------------------------------------------ */
    (function initButtonHoverSlide() {
        if (reduceMotion) return;

        const style = document.createElement("style");
        style.textContent = `
            .ff-slide-mask {
                display: inline-block;
                position: relative;
                overflow: hidden;
                vertical-align: middle;
                line-height: 1.2;
            }
            .ff-slide-inner { position: relative; display: block; }
            .ff-slide-top,
            .ff-slide-bottom {
                display: block;
                white-space: nowrap;
                transition: transform 0.38s cubic-bezier(0.65, 0, 0.35, 1);
                will-change: transform;
            }
            .ff-slide-bottom {
                position: absolute;
                top: 0;
                left: 0;
                transform: translateY(100%);
            }
            .ff-hover-slide:hover .ff-slide-top { transform: translateY(-100%); }
            .ff-hover-slide:hover .ff-slide-bottom { transform: translateY(0); }
        `;
        document.head.appendChild(style);

        const targets = document.querySelectorAll(
            'a[class*="btn"], button[class*="btn"], button:not([class])'
        );

        targets.forEach((el) => {
            if (el.dataset.ffSlideDone) return;

            let text = "";
            const nodePlan = [];
            let placeholderAdded = false;

            Array.prototype.forEach.call(el.childNodes, (node) => {
                if (node.nodeType === 3) {
                    const t = node.textContent.replace(/\s+/g, " ").trim();
                    if (t) {
                        text += (text ? " " : "") + t;
                        if (!placeholderAdded) {
                            nodePlan.push("TEXT");
                            placeholderAdded = true;
                        }
                    }
                } else {
                    nodePlan.push(node);
                }
            });

            if (!text) return; // icon-only control — nothing to slide

            const mask = document.createElement("span");
            mask.className = "ff-slide-mask";

            const inner = document.createElement("span");
            inner.className = "ff-slide-inner";

            const top = document.createElement("span");
            top.className = "ff-slide-top";
            top.textContent = text;

            const bottom = document.createElement("span");
            bottom.className = "ff-slide-bottom";
            bottom.setAttribute("aria-hidden", "true");
            bottom.textContent = text;

            inner.appendChild(top);
            inner.appendChild(bottom);
            mask.appendChild(inner);

            el.textContent = "";
            nodePlan.forEach((item) => {
                el.appendChild(item === "TEXT" ? mask : item);
            });

            el.classList.add("ff-hover-slide");
            el.dataset.ffSlideDone = "1";

            const w = Math.max(top.offsetWidth, bottom.offsetWidth);
            mask.style.width = w + "px";
        });
    })();

    /* -----------------------------------------------------------
       9. IMAGE 3D ROTATE-IN + HOVER TILT
       Every content image rotates smoothly into place as it
       enters the viewport, then tilts in 3D toward the cursor on
       hover (perspective + rotateX/rotateY driven by pointer
       position). Purely transform/opacity based, so nothing else
       on the page shifts. Logos, the intro splash, and tiny chat
       avatars are excluded on purpose.
    ------------------------------------------------------------ */
    (function initImage3D() {
        if (reduceMotion) return;

        const style = document.createElement("style");
        style.textContent = `
            .ff-img-3d {
                transform: perspective(1000px) rotateX(var(--ff-rx, 10deg)) rotateY(var(--ff-ry, -18deg)) scale(var(--ff-s, 0.92));
                opacity: 0;
                transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease;
                will-change: transform, opacity;
            }
            .ff-img-3d.ff-img-in {
                --ff-rx: 0deg;
                --ff-ry: 0deg;
                --ff-s: 1;
                opacity: 1;
            }
            .ff-img-3d.ff-img-hover-ready {
                transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease;
            }
        `;
        document.head.appendChild(style);

        const targets = Array.prototype.filter.call(
            document.querySelectorAll("img"),
            (img) =>
                !img.closest("#ffIntro") &&
                !img.closest(".logo") &&
                !img.closest(".ff-msg-avatar")
        );

        if (!targets.length) return;

        targets.forEach((img) => img.classList.add("ff-img-3d"));

        if ("IntersectionObserver" in window) {
            const imgObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        entry.target.classList.toggle("ff-img-in", entry.isIntersecting);
                    });
                },
                { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
            );
            targets.forEach((img) => imgObserver.observe(img));
        } else {
            targets.forEach((img) => img.classList.add("ff-img-in"));
        }

        const MAX_DEG = 10;

        targets.forEach((img) => {
            img.addEventListener("mouseenter", () => {
                img.classList.add("ff-img-hover-ready");
            });

            img.addEventListener("mousemove", (e) => {
                const rect = img.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const ry = (px - 0.5) * 2 * MAX_DEG;
                const rx = -(py - 0.5) * 2 * MAX_DEG;
                img.style.setProperty("--ff-ry", ry.toFixed(2) + "deg");
                img.style.setProperty("--ff-rx", rx.toFixed(2) + "deg");
                img.style.setProperty("--ff-s", "1.05");
            });

            img.addEventListener("mouseleave", () => {
                img.style.removeProperty("--ff-ry");
                img.style.removeProperty("--ff-rx");
                img.style.removeProperty("--ff-s");
            });
        });
    })();

    /* -----------------------------------------------------------
       10. INDUSTRY INSIGHTS — GLASS CARD 3D TILT
       The blog/insight cards get their own self-contained entrance
       (fade + rotate up into place, staggered) and a continuous
       cursor-tracked 3D tilt on hover, driven by CSS variables so
       it composes cleanly with the glass/glow styling in CSS —
       no JS animation loop needed, just transform + transition.
    ------------------------------------------------------------ */
    (function initBlogCardTilt() {
        const cards = document.querySelectorAll(".blog-card");
        if (!cards.length) return;

        if (reduceMotion) {
            cards.forEach((card) => card.classList.add("is-in"));
            return;
        }

        cards.forEach((card, i) => {
            card.style.transitionDelay = (i * 0.12).toFixed(2) + "s";
        });

        if ("IntersectionObserver" in window) {
            const cardObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        entry.target.classList.toggle("is-in", entry.isIntersecting);
                    });
                },
                { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
            );
            cards.forEach((card) => cardObserver.observe(card));
        } else {
            cards.forEach((card) => card.classList.add("is-in"));
        }

        const MAX_TILT = 7;

        cards.forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const ty = (px - 0.5) * 2 * MAX_TILT;
                const tx = -(py - 0.5) * 2 * MAX_TILT;
                card.style.setProperty("--tx", tx.toFixed(2) + "deg");
                card.style.setProperty("--ty", ty.toFixed(2) + "deg");
                card.style.setProperty("--cs", "1.025");
                card.style.setProperty("--cy", "-8px");
            });

            card.addEventListener("mouseleave", () => {
                card.style.setProperty("--tx", "0deg");
                card.style.setProperty("--ty", "0deg");
                card.style.setProperty("--cs", "1");
                card.style.setProperty("--cy", "0px");
            });
        });
    })();

})();

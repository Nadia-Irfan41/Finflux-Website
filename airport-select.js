/* =====================================================================
   FINFLUX — WORLDWIDE AIRPORT SEARCH DROPDOWN
   Turns any [data-airport-select] wrapper into a fast, searchable,
   keyboard-accessible airport combobox backed by the FINFLUX_AIRPORTS
   dataset (airports-data.js — must be loaded before this file).

   Markup contract per instance:
   <div class="airport-select" data-airport-select>
       <input type="text" class="airport-select-input" ...>
       <input type="hidden" class="airport-select-value" name="...">
       <div class="airport-select-panel" role="listbox"></div>
   </div>
===================================================================== */

(function () {
    "use strict";

    const MAX_RESULTS = 8;

    // "IATA — Airport Name, City, Country" (e.g. "ISB — Islamabad International Airport, Islamabad, Pakistan")
    function formatAirport(a) {
        const parts = [a.n, a.c, a.k].filter(Boolean).join(", ");
        return a.i + " — " + parts;
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (ch) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[ch]));
    }

    // Wraps the part of `text` that case-insensitively matches `query` in <mark>.
    function highlight(text, query) {
        if (!query) return escapeHtml(text);
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return escapeHtml(text);
        return escapeHtml(text.slice(0, idx)) +
            "<mark>" + escapeHtml(text.slice(idx, idx + query.length)) + "</mark>" +
            escapeHtml(text.slice(idx + query.length));
    }

    // `excludeIata` omits one airport from the results — used to stop the
    // Departure and Destination fields in the same route from both landing
    // on the same airport.
    function searchAirports(query, excludeIata) {
        const list = window.FINFLUX_AIRPORTS;
        if (!list || !query) return [];
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const starts = [];
        const contains = [];

        for (let i = 0; i < list.length; i++) {
            const a = list[i];
            if (excludeIata && a.i === excludeIata) continue;
            const iata = a.i.toLowerCase();
            const name = a.n.toLowerCase();
            const city = (a.c || "").toLowerCase();
            const country = (a.k || "").toLowerCase();

            if (iata === q) { starts.unshift(a); continue; }
            if (iata.startsWith(q) || name.startsWith(q) || city.startsWith(q)) {
                starts.push(a);
            } else if (name.includes(q) || city.includes(q) || country.includes(q)) {
                contains.push(a);
            }
            if (starts.length >= MAX_RESULTS * 3) break;
        }

        return starts.concat(contains).slice(0, MAX_RESULTS);
    }

    const DEFAULT_EMPTY_MESSAGE = "No airports found. Try a different city, airport name, or IATA code.";

    function initAirportSelect(root) {
        const input = root.querySelector(".airport-select-input");
        const valueInput = root.querySelector(".airport-select-value");
        const panel = root.querySelector(".airport-select-panel");
        if (!input || !panel) return;

        // Pair this field with its Departure/Destination sibling in the same
        // route group so the same airport can't be picked for both.
        const routeGroup = root.closest(".inquiry-fields");
        const partnerRoot = routeGroup
            ? Array.from(routeGroup.querySelectorAll("[data-airport-select]")).find((w) => w !== root)
            : null;
        const partnerValueInput = partnerRoot ? partnerRoot.querySelector(".airport-select-value") : null;
        const partnerLabelEl = partnerRoot ? partnerRoot.closest(".inquiry-field") : null;
        const partnerLabel = (partnerLabelEl && partnerLabelEl.querySelector("label"))
            ? partnerLabelEl.querySelector("label").textContent.trim()
            : "the other field";

        function excludedIata() {
            return partnerValueInput && partnerValueInput.value ? partnerValueInput.value : null;
        }

        let results = [];
        let activeIndex = -1;
        let debounceTimer = null;

        function closePanel() {
            panel.hidden = true;
            panel.innerHTML = "";
            input.setAttribute("aria-expanded", "false");
            input.removeAttribute("aria-activedescendant");
            activeIndex = -1;
        }

        function renderResults(query, emptyMessage) {
            if (!results.length) {
                panel.innerHTML = '<div class="airport-select-empty">' + escapeHtml(emptyMessage || DEFAULT_EMPTY_MESSAGE) + '</div>';
                panel.hidden = false;
                input.setAttribute("aria-expanded", "true");
                return;
            }

            panel.innerHTML = results.map((a, i) => {
                const cityCountry = [a.c, a.k].filter(Boolean).join(", ");
                return (
                    '<div class="airport-option" role="option" id="' + root.dataset.uid + '-opt-' + i + '" ' +
                    'data-index="' + i + '" data-iata="' + a.i + '">' +
                    '<span class="airport-option-code">' + escapeHtml(a.i) + '</span>' +
                    '<span class="airport-option-text">' +
                    '<span class="airport-option-name">' + highlight(a.n, query) + '</span>' +
                    (cityCountry ? '<span class="airport-option-meta">' + escapeHtml(cityCountry) + '</span>' : '') +
                    '</span>' +
                    '</div>'
                );
            }).join("");

            panel.hidden = false;
            input.setAttribute("aria-expanded", "true");
        }

        function setActive(index) {
            const options = panel.querySelectorAll(".airport-option");
            options.forEach((el) => el.classList.remove("is-active"));
            if (index >= 0 && options[index]) {
                options[index].classList.add("is-active");
                options[index].scrollIntoView({ block: "nearest" });
                input.setAttribute("aria-activedescendant", options[index].id);
            } else {
                input.removeAttribute("aria-activedescendant");
            }
            activeIndex = index;
        }

        function selectAirport(a) {
            input.value = formatAirport(a);
            if (valueInput) valueInput.value = a.i;
            root.classList.remove("is-invalid");
            closePanel();
        }

        // Runs a search excluding whatever airport is already picked in the
        // paired field, and picks a helpful empty-state message: a plain
        // "no matches" note, or — if the only match was the excluded
        // airport — a note explaining why it's not selectable here.
        function searchWithPairing(query) {
            const exclude = excludedIata();
            const filtered = searchAirports(query, exclude);
            let emptyMessage = DEFAULT_EMPTY_MESSAGE;
            if (!filtered.length && exclude && searchAirports(query, null).length) {
                emptyMessage = "That airport is already selected as your " + partnerLabel + ". Choose a different airport.";
            }
            return { filtered, emptyMessage };
        }

        function handleInput() {
            if (valueInput) valueInput.value = "";
            const query = input.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (query.trim().length === 0) {
                    results = [];
                    closePanel();
                    return;
                }
                const { filtered, emptyMessage } = searchWithPairing(query);
                results = filtered;
                renderResults(query.trim(), emptyMessage);
                setActive(-1);
            }, 60);
        }

        input.addEventListener("input", handleInput);

        input.addEventListener("focus", () => {
            if (input.value.trim().length && results.length) {
                renderResults(input.value.trim());
            }
        });

        input.addEventListener("keydown", (e) => {
            if (panel.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                if (input.value.trim().length) {
                    const { filtered, emptyMessage } = searchWithPairing(input.value);
                    results = filtered;
                    renderResults(input.value.trim(), emptyMessage);
                }
            }
            const optionCount = results.length;
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (optionCount) setActive((activeIndex + 1) % optionCount);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (optionCount) setActive((activeIndex - 1 + optionCount) % optionCount);
            } else if (e.key === "Enter") {
                if (!panel.hidden && activeIndex >= 0 && results[activeIndex]) {
                    e.preventDefault();
                    selectAirport(results[activeIndex]);
                }
            } else if (e.key === "Escape") {
                closePanel();
            }
        });

        panel.addEventListener("click", (e) => {
            const opt = e.target.closest(".airport-option");
            if (!opt) return;
            const idx = parseInt(opt.dataset.index, 10);
            if (results[idx]) selectAirport(results[idx]);
        });

        document.addEventListener("click", (e) => {
            if (!root.contains(e.target)) closePanel();
        });
    }

    function init() {
        const nodes = document.querySelectorAll("[data-airport-select]");
        nodes.forEach((node, i) => {
            node.dataset.uid = "airportSelect" + i;
            initAirportSelect(node);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

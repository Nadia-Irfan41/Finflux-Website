(function () {
    var planeSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M22 16.5v-2l-8.5-5V3.5c0-1-.8-1.8-1.5-1.8s-1.5.8-1.5 1.8v6l-8.5 5v2l8.5-2.6V19l-2.5 1.8V22l3.5-1 3.5 1v-1.2L13 19v-5.1l9 2.6z"/></svg>';

    // NOTE: hero is intentionally excluded — it stays exactly as-is.
    var configs = {
        'welcome-section': {
            orbs: [
                { cls: 'blue', top: '10%', left: '8%', size: 220, dur: 12 },
                { cls: 'orange', top: '65%', left: '85%', size: 160, dur: 15 }
            ],
            particles: 6,
            planes: [
                { top: '20%', left: '0%', size: 18, dur: 20, delay: 1, ang: 14 }
            ],
            path: 'M-50,60 C300,140 700,10 1300,90'
        },
        'why-finflux': {
            orbs: [
                { cls: 'orange', top: '15%', left: '90%', size: 200, dur: 13 },
                { cls: 'blue', top: '80%', left: '5%', size: 180, dur: 16 }
            ],
            particles: 6,
            planes: [
                { top: '75%', left: '0%', size: 18, dur: 24, delay: 2, ang: -8, cls: 'orange' }
            ],
            path: 'M-50,300 C350,200 800,380 1300,240'
        },
        'cta-section': {
            orbs: [
                { cls: 'blue', top: '20%', left: '12%', size: 240, dur: 11 },
                { cls: 'orange', top: '70%', left: '80%', size: 200, dur: 14 }
            ],
            particles: 8,
            planes: [
                { top: '20%', left: '0%', size: 20, dur: 18, delay: 0, ang: 16 }
            ],
            path: 'M-50,120 C300,40 700,220 1300,80'
        },
        'contact-section': {
            orbs: [
                { cls: 'blue', top: '12%', left: '85%', size: 190, dur: 12 },
                { cls: 'orange', top: '85%', left: '10%', size: 150, dur: 15 }
            ],
            particles: 5,
            planes: [
                { top: '12%', left: '0%', size: 16, dur: 26, delay: 3, ang: 6, cls: 'orange' }
            ],
            path: 'M-50,260 C350,340 750,120 1300,220'
        }
    };

    Object.keys(configs).forEach(function (cls) {
        var section = document.querySelector('.' + cls);
        if (!section) return;

        var cfg = configs[cls];
        var layer = document.createElement('div');
        layer.className = 'ff-sky-bg';

        // Glowing orbs
        cfg.orbs.forEach(function (o) {
            var el = document.createElement('div');
            el.className = 'ff-orb ' + o.cls;
            el.style.top = o.top;
            el.style.left = o.left;
            el.style.width = o.size + 'px';
            el.style.height = o.size + 'px';
            el.style.animationDuration = o.dur + 's';
            layer.appendChild(el);
        });

        // Drifting particles
        for (var i = 0; i < cfg.particles; i++) {
            var p = document.createElement('div');
            p.className = 'ff-particle' + (i % 2 ? ' orange' : '');
            p.style.top = (15 + Math.random() * 70) + '%';
            p.style.left = (5 + Math.random() * 90) + '%';
            p.style.animationDuration = (5 + Math.random() * 5) + 's';
            p.style.animationDelay = (Math.random() * 5) + 's';
            layer.appendChild(p);
        }

        // Flight path lines
        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'ff-flight-path');
        svg.setAttribute('viewBox', '0 0 1300 400');
        svg.setAttribute('preserveAspectRatio', 'none');

        var path1 = document.createElementNS(svgNS, 'path');
        path1.setAttribute('class', 'fp-1');
        path1.setAttribute('d', cfg.path);
        svg.appendChild(path1);

        var path2 = document.createElementNS(svgNS, 'path');
        path2.setAttribute('class', 'fp-2');
        path2.setAttribute('d', cfg.path.replace(/(\d+),(\d+)/g, function (m, a, b) {
            return a + ',' + (parseInt(b, 10) + 40);
        }));
        svg.appendChild(path2);

        layer.appendChild(svg);

        // Small planes
        cfg.planes.forEach(function (item) {
            var el = document.createElement('div');
            el.className = 'ff-bg-plane' + (item.cls ? ' ' + item.cls : '');
            el.style.top = item.top;
            el.style.left = item.left;
            el.style.width = item.size + 'px';
            el.style.height = item.size + 'px';
            el.style.setProperty('--ang', (item.ang || 0) + 'deg');
            el.style.animationDuration = item.dur + 's';
            el.style.animationDelay = item.delay + 's';
            el.innerHTML = planeSvg;
            layer.appendChild(el);
        });

        section.insertBefore(layer, section.firstChild);
    });
})();

/**
 * NEURAL CONSTELLATION BACKGROUND
 * ---------------------------------------------------------------------------
 * A lightweight, dependency-free canvas experiment for the hero section:
 * a field of drifting "neurons" that link up into a network, react to the
 * visitor's cursor, and occasionally fire glowing "activation" pulses along
 * their connections - a nod to the neural nets / LLMs the site owner builds.
 *
 * Self-contained: no external libraries, no build step. Respects
 * prefers-reduced-motion and pauses when the tab isn't visible.
 */
(function () {
    "use strict";

    var canvas = document.getElementById("neural-canvas");
    if (!canvas || !canvas.getContext) {
        return;
    }

    var ctx = canvas.getContext("2d");
    var container = canvas.parentElement;

    var prefersReducedMotion = !!(
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;

    var particles = [];
    var pulses = [];

    var mouse = { x: -9999, y: -9999, active: false };

    var LINK_DIST = 150;
    var MOUSE_RADIUS = 180;
    var PULSE_INTERVAL = 650; // ms between spawned pulses
    var lastPulseAt = 0;
    var rafId = null;
    var running = false;

    var NODE_COLOR = "109, 217, 197";   // soft teal, echoes the accent used on about.html
    var LINE_COLOR = "109, 182, 200";

    function particleCountFor(w, h) {
        var area = w * h;
        var count = Math.round(area / 16000);
        return Math.max(24, Math.min(85, count));
    }

    function makeParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: 1.1 + Math.random() * 1.6
        };
    }

    function resize() {
        var rect = container.getBoundingClientRect();
        width = Math.max(rect.width, window.innerWidth);
        height = Math.max(rect.height, window.innerHeight);

        canvas.width = width * DPR;
        canvas.height = height * DPR;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        var target = particleCountFor(width, height);
        if (particles.length === 0) {
            for (var i = 0; i < target; i++) {
                particles.push(makeParticle());
            }
        } else if (particles.length > target) {
            particles.length = target;
        } else {
            while (particles.length < target) {
                particles.push(makeParticle());
            }
        }
    }

    function onPointerMove(e) {
        var point = e.touches && e.touches.length ? e.touches[0] : e;
        mouse.x = point.clientX;
        mouse.y = point.clientY;
        mouse.active = true;
    }

    function onPointerLeave() {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
    }

    function maybeSpawnPulse(now, neighborMap) {
        if (now - lastPulseAt < PULSE_INTERVAL) {
            return;
        }
        var candidates = [];
        for (var key in neighborMap) {
            if (neighborMap.hasOwnProperty(key)) {
                candidates.push(neighborMap[key]);
            }
        }
        if (!candidates.length) {
            return;
        }
        var pick = candidates[(Math.random() * candidates.length) | 0];
        pulses.push({ a: pick.a, b: pick.b, t: 0, speed: 0.012 + Math.random() * 0.01 });
        lastPulseAt = now;
    }

    function step(now) {
        if (!running) {
            return;
        }

        ctx.clearRect(0, 0, width, height);

        var i, j, p, q, dx, dy, dist;
        var neighborMap = {};
        var neighborCounter = 0;

        // Update + draw particles (drift, gentle edge wrap, cursor influence)
        for (i = 0; i < particles.length; i++) {
            p = particles[i];

            if (mouse.active) {
                dx = p.x - mouse.x;
                dy = p.y - mouse.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0.001) {
                    var force = (1 - dist / MOUSE_RADIUS) * 0.06;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            // gentle damping so velocity from cursor nudges decays
            p.vx *= 0.985;
            p.vy *= 0.985;

            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + NODE_COLOR + ", 0.85)";
            ctx.fill();
        }

        // Draw connections between nearby particles
        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            for (j = i + 1; j < particles.length; j++) {
                q = particles[j];
                dx = p.x - q.x;
                dy = p.y - q.y;
                dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < LINK_DIST) {
                    var alpha = (1 - dist / LINK_DIST) * 0.5;

                    if (mouse.active) {
                        var mx = (p.x + q.x) / 2 - mouse.x;
                        var my = (p.y + q.y) / 2 - mouse.y;
                        var mDist = Math.sqrt(mx * mx + my * my);
                        if (mDist < MOUSE_RADIUS) {
                            alpha += (1 - mDist / MOUSE_RADIUS) * 0.45;
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + Math.min(alpha, 0.9) + ")";
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    neighborMap[neighborCounter++] = { a: p, b: q };
                }
            }
        }

        // Advance + draw active "activation" pulses travelling along edges
        for (i = pulses.length - 1; i >= 0; i--) {
            var pulse = pulses[i];
            pulse.t += pulse.speed;
            if (pulse.t >= 1) {
                pulses.splice(i, 1);
                continue;
            }
            var px = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.t;
            var py = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.t;
            var glow = Math.sin(pulse.t * Math.PI); // fade in/out along the trip

            ctx.beginPath();
            ctx.arc(px, py, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.55 * glow + 0.15) + ")";
            ctx.shadowColor = "rgba(" + NODE_COLOR + ", 0.9)";
            ctx.shadowBlur = 8 * glow;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        maybeSpawnPulse(now, neighborMap);

        rafId = requestAnimationFrame(step);
    }

    function drawStaticFrame() {
        // Reduced-motion: render one calm frame, no animation loop.
        ctx.clearRect(0, 0, width, height);
        var i, j, p, q, dx, dy, dist;

        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            for (j = i + 1; j < particles.length; j++) {
                q = particles[j];
                dx = p.x - q.x;
                dy = p.y - q.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + ((1 - dist / LINK_DIST) * 0.4) + ")";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + NODE_COLOR + ", 0.85)";
            ctx.fill();
        }
    }

    function start() {
        if (running || prefersReducedMotion) {
            return;
        }
        running = true;
        lastPulseAt = performance.now();
        rafId = requestAnimationFrame(step);
    }

    function stop() {
        running = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    var resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            if (prefersReducedMotion) {
                drawStaticFrame();
            }
        }, 150);
    }

    function init() {
        resize();

        if (prefersReducedMotion) {
            drawStaticFrame();
            return;
        }

        window.addEventListener("mousemove", onPointerMove, { passive: true });
        window.addEventListener("touchmove", onPointerMove, { passive: true });
        window.addEventListener("mouseleave", onPointerLeave, { passive: true });
        window.addEventListener("touchend", onPointerLeave, { passive: true });
        window.addEventListener("resize", onResize);

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });

        start();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

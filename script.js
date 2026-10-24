(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const connection = navigator.connection || {};
  const saveData = !!connection.saveData;
  const slowNetwork = saveData || /(^|-)2g$/.test(connection.effectiveType || "");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------------------------------------------------
     0. Mobile navigation (extracted from inline script)
     --------------------------------------------------------- */
  function initMobileNav() {
    const toggle = $(".mobile-menu-toggle");
    const menu = $("#mobile-nav");
    if (!toggle || !menu) return;

    const setState = open => {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    };
    const closeMenu = (returnFocus = false) => {
      setState(false);
      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      const open = !menu.classList.contains("is-open");
      setState(open);
      // Keep focus on the toggle: aria-expanded announces the state and the
      // next Tab moves into the menu (standard disclosure pattern).
    });
    $$("a", menu).forEach(link => link.addEventListener("click", () => closeMenu()));
    document.addEventListener("click", event => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        event.preventDefault();
        closeMenu(true);
      }
    });
    addEventListener("resize", () => { if (innerWidth > 900) closeMenu(); }, { passive: true });
  }
  initMobileNav();

  /* ---------------------------------------------------------
     1. Boot sequence (once per browser session, short)
     --------------------------------------------------------- */
  const boot = $("#boot");
  let bootSeen = false;
  try { bootSeen = sessionStorage.getItem("c9-boot") === "1"; } catch (e) {}

  const startPage = () => {
    document.body.classList.add("booted");
    $$(".hero [data-decrypt]").forEach(decrypt);
    $$(".hero [data-count]").forEach(countUp);
    startTyping();
  };

  const skipBoot = reduceMotion || saveData || innerWidth < 900;
  if (!boot || skipBoot || bootSeen) {
    if (boot) boot.classList.add("done");
    setTimeout(startPage, 0);
  } else {
    const log = $("#boot-log");
    const bar = $(".boot-bar i", boot);
    const lines = [
      "[ <span class=ok>OK</span> ] initialising c9 neural interface",
      "[ <span class=ok>OK</span> ] loading agentic runtime · guardrails armed",
      "[ <span class=ok>OK</span> ] identity verified → <span class=ok>HARIOM SINGH</span>"
    ];
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("c9-boot", "1"); } catch (e) {}
      boot.classList.add("done");
      setTimeout(startPage, 100);
    };
    boot.addEventListener("click", finish);
    addEventListener("keydown", finish, { once: true });
    (async () => {
      for (let i = 0; i < lines.length; i++) {
        if (finished) return;
        log.innerHTML += lines[i] + "\n";
        bar.style.width = ((i + 1) / lines.length) * 100 + "%";
        await sleep(rand(90, 140));
      }
      await sleep(100);
      finish();
    })();
    setTimeout(finish, 1500); // hard fail-safe
  }

  /* ---------------------------------------------------------
     2. Hero typing line (pauses offscreen / hidden tab)
     --------------------------------------------------------- */
  let typingStarted = false;
  let typingVisible = true;

  function startTyping() {
    const el = $("#typed");
    if (!el || typingStarted) return;
    typingStarted = true;
    const phrases = [
      "deploy --agents langgraph --region eu-west",
      "siem correlate --window 5m --severity high",
      "scan --deps --sast ./services && patch",
      "guardrails enable --prompt-injection --pii",
      "stream voice --latency <300ms",
      "whoami → ai + security engineer"
    ];
    if (reduceMotion) { el.textContent = phrases[phrases.length - 1]; return; }

    const host = el.closest(".hero-terminal") || el;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { typingVisible = entry.isIntersecting; }, { threshold: 0 }).observe(host);
    }

    let p = 0;
    (async function loop() {
      while (true) {
        if (document.hidden || !typingVisible) { await sleep(500); continue; }
        const text = phrases[p++ % phrases.length];
        let interrupted = false;
        for (let i = 1; i <= text.length; i++) {
          if (document.hidden || !typingVisible) { interrupted = true; break; }
          el.textContent = text.slice(0, i);
          await sleep(rand(28, 70));
        }
        if (interrupted) continue;
        await sleep(1800);
        for (let i = text.length; i >= 0; i--) {
          if (document.hidden || !typingVisible) { interrupted = true; break; }
          el.textContent = text.slice(0, i);
          await sleep(14);
        }
        if (interrupted) continue;
        await sleep(300);
      }
    })();
  }

  /* ---------------------------------------------------------
     3. Decrypt / scramble text
     --------------------------------------------------------- */
  /* Layout-stable: the real characters stay in place (transparent) and the
     scrambled glyph is painted on top as an absolutely positioned overlay,
     so line width / wrapping never changes while the effect runs. */
  const GLYPHS = "<>/\\[]{}=+*#01ABCDEFXZ$%";
  function scramble(el, { dur = 900, glyphRate = 55, keepClass = false } = {}) {
    if (reduceMotion || el.dataset.scrambling) return;
    const target = el.dataset.text || el.textContent;
    el.dataset.scrambling = "1";
    el.setAttribute("aria-label", target);
    el.textContent = "";
    const chars = [];
    for (const ch of target) {
      const s = document.createElement("span");
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      if (ch.trim()) { s.className = "ch enc"; chars.push(s); }
      el.appendChild(s);
    }
    const n = chars.length;
    chars.forEach((s, i) => { s._at = (i / n) * dur * 0.65 + Math.random() * dur * 0.35; });
    const start = performance.now();
    let lastGlyph = 0;
    (function tick(now) {
      const t = now - start;
      const swap = now - lastGlyph > glyphRate;
      if (swap) lastGlyph = now;
      let pending = 0;
      for (const s of chars) {
        if (!s._done && t >= s._at) { s._done = true; s.classList.remove("enc"); s.classList.add("dec"); }
        else if (!s._done) { pending++; if (swap) s.dataset.g = GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
      }
      if (pending) requestAnimationFrame(tick);
      else setTimeout(() => {
        el.textContent = target;
        delete el.dataset.scrambling;
        if (!keepClass) el.removeAttribute("aria-label");
      }, 260);
    })(start);
  }
  function decrypt(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    scramble(el, { dur: Math.min(1300, 500 + el.textContent.length * 30) });
  }

  /* ---------------------------------------------------------
     4. Reveal on scroll (+ decrypt + counters)
     --------------------------------------------------------- */
  const revealEls = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(el => el.classList.add("visible"));
    $$("[data-decrypt]").forEach(decrypt);
    $$("[data-count]").forEach(countUp);
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("visible");
        if (!el.closest(".hero") || document.body.classList.contains("booted")) {
          $$("[data-decrypt]", el).forEach(decrypt);
          $$("[data-count]", el).forEach(countUp);
        }
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
    // Only hide reveal elements once the observer is actually running.
    document.documentElement.classList.add("reveal-ready");
  }

  function countUp(el) {
    if (reduceMotion || el.dataset.counted) return;
    el.dataset.counted = "1";
    const end = +el.dataset.count;
    const start = performance.now();
    (function tick(now) {
      const t = Math.min(1, (now - start) / 1200);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------------------------------------------------------
     5. Cursor: glow + reticle + HUD coords (rAF-coalesced)
     --------------------------------------------------------- */
  const glow = $(".cursor-glow");
  const reticle = $(".cursor-reticle");
  const coords = $("#hud-coords");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  let rx = mouse.x, ry = mouse.y;
  let pointerRaf = 0, reticleRaf = 0, hudLast = 0;

  function paintPointer() {
    pointerRaf = 0;
    if (glow) glow.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    const now = performance.now();
    if (coords && innerWidth > 900 && now - hudLast > 100) {
      hudLast = now;
      coords.textContent =
        "X:" + String(Math.round(mouse.x)).padStart(4, "0") +
        " Y:" + String(Math.round(mouse.y + scrollY)).padStart(4, "0");
    }
  }

  function followReticle() {
    reticleRaf = 0;
    rx += (mouse.x - rx) * 0.22;
    ry += (mouse.y - ry) * 0.22;
    reticle.style.transform = `translate(${rx}px, ${ry}px)`;
    const settled = Math.abs(mouse.x - rx) + Math.abs(mouse.y - ry) < 0.15;
    if (!settled && !document.hidden) reticleRaf = requestAnimationFrame(followReticle);
  }

  addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    if (!pointerRaf) pointerRaf = requestAnimationFrame(paintPointer);
    if (reticle && finePointer) {
      reticle.classList.add("on");
      if (!reduceMotion && !reticleRaf) reticleRaf = requestAnimationFrame(followReticle);
    }
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    mouse.active = false;
    if (reticle) reticle.classList.remove("on");
  });

  if (reticle && finePointer && !reduceMotion) {
    const hotSel = "a, button, [data-tilt], .map-node, .arch-pod, .stack-cloud span";
    document.addEventListener("pointerover", e => { if (e.target.closest(hotSel)) reticle.classList.add("hot"); });
    document.addEventListener("pointerout", e => { if (e.target.closest(hotSel)) reticle.classList.remove("hot"); });
  }

  /* ---------------------------------------------------------
     6. 3D tilt + glare, magnetic buttons (cached rects, rAF)
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(card => {
      const glare = document.createElement("span");
      glare.className = "tilt-glare";
      card.appendChild(glare);
      const max = card.classList.contains("portrait-frame") ? 6 : 9;
      let rect = null, pending = null, raf = 0;

      card._invalidateRect = () => { rect = null; };
      const measure = () => { rect = card.getBoundingClientRect(); };
      card.addEventListener("pointerenter", measure, { passive: true });
      card.addEventListener("pointermove", e => {
        pending = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!pending) return;
          if (!rect) measure();
          const px = (pending.clientX - rect.left) / rect.width;
          const py = (pending.clientY - rect.top) / rect.height;
          card.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
          card.style.setProperty("--gx", px * 100 + "%");
          card.style.setProperty("--gy", py * 100 + "%");
          card.classList.add("tilt-on");
          pending = null;
        });
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        setTimeout(() => card.classList.remove("tilt-on"), 120);
      });
    });

    $$(".magnetic").forEach(btn => {
      let rect = null, pending = null, raf = 0;
      btn._invalidateRect = () => { rect = null; };
      btn.addEventListener("pointerenter", () => { rect = btn.getBoundingClientRect(); }, { passive: true });
      btn.addEventListener("pointermove", e => {
        pending = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!pending) return;
          if (!rect) rect = btn.getBoundingClientRect();
          const x = pending.clientX - rect.left - rect.width / 2;
          const y = pending.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
          pending = null;
        });
      }, { passive: true });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------
     6b. Hover scramble (nav) and staggered children
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$(".nav nav a").forEach(a => a.addEventListener("pointerenter", () => scramble(a, { dur: 380, glyphRate: 40 })));
  }
  $$(".stack-cloud, .current-right, .sec-principles, .timeline, .sec-tags, .role-tags").forEach(box => {
    box.setAttribute("data-stagger", "");
    Array.from(box.children).forEach((c, i) => c.style.setProperty("--i", i));
  });

  /* ---------------------------------------------------------
     7. Scroll progress + active nav
     --------------------------------------------------------- */
  const progress = $(".scroll-progress");
  const navLinks = $$('.nav nav a[href^="#"]');
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s; });
    navLinks.forEach(a => {
      const on = !!(current && a.getAttribute("href") === "#" + current.id);
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     8. Animated data links (system map + architecture)
     --------------------------------------------------------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  function drawLinks(box) {
    const center = $(box.dataset.links, box);
    const nodes = $$(box.dataset.nodes, box);
    if (!center || !nodes.length) return;
    let svg = $(".link-layer", box);
    if (!svg) {
      svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("class", "link-layer");
      svg.setAttribute("aria-hidden", "true");
      box.prepend(svg);
    }
    svg.innerHTML = "";
    const b = box.getBoundingClientRect();
    const c = center.getBoundingClientRect();
    const cx = c.left + c.width / 2 - b.left, cy = c.top + c.height / 2 - b.top;
    svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const nx = r.left + r.width / 2 - b.left, ny = r.top + r.height / 2 - b.top;
      const mx = (cx + nx) / 2 + (ny - cy) * 0.12, my = (cy + ny) / 2 - (nx - cx) * 0.12;
      const d = `M${nx.toFixed(1)},${ny.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
      const base = document.createElementNS(SVGNS, "path");
      base.setAttribute("d", d); base.setAttribute("class", "base"); base.setAttribute("fill", "none");
      const pkt = document.createElementNS(SVGNS, "path");
      pkt.setAttribute("d", d); pkt.setAttribute("fill", "none");
      pkt.setAttribute("class", "packet" + (i % 2 ? " alt" : ""));
      pkt.style.animationDelay = (-i * 0.73).toFixed(2) + "s";
      pkt.style.animationDuration = rand(2.6, 4.2).toFixed(2) + "s";
      svg.append(base, pkt);
    });
  }
  const linkBoxes = $$("[data-links]");
  const redrawLinks = () => linkBoxes.forEach(drawLinks);
  redrawLinks();
  addEventListener("load", redrawLinks);

  /* ---------------------------------------------------------
     9. SOC threat-feed terminal (illustrative)
     --------------------------------------------------------- */
  const feed = $("#threat-feed");
  if (feed) {
    const ips = () => `${pick([45, 91, 103, 185, 193, 203])}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;
    const events = [
      () => [`<span class=in>[INGEST]</span> ${(rand(8, 24)).toFixed(1)}k events/s · parsers healthy`, "ok"],
      () => [`<span class=md>[MED]</span> brute-force pattern · ssh · src ${ips()} · 42 fails/60s`, "md"],
      () => [`<span class=ok>[AUTO]</span> src blocked at edge · ticket SEC-${(Math.random() * 9000 + 1000) | 0} opened`, "ok"],
      () => [`<span class=hi>[HIGH]</span> CVE-202${pick([4, 5, 6])}-${(Math.random() * 90000 + 10000) | 0} · cvss ${(rand(7.5, 9.8)).toFixed(1)} · 3 hosts`, "hi"],
      () => [`<span class=ok>[PATCH]</span> remediation rolled out · rescan clean`, "ok"],
      () => [`<span class=hi>[LLM]</span> prompt-injection attempt blocked · guardrail: tool-scope`, "hi"],
      () => [`<span class=in>[IAM]</span> least-privilege drift · role tightened · 0 users impacted`, "ok"],
      () => [`<span class=md>[CORR]</span> 14 alerts → 1 incident · noise reduced 93%`, "md"],
      () => [`<span class=in>[AGENT]</span> triage summary posted to on-call · MTTR ↓`, "ok"],
      () => [`<span class=ok>[DEP]</span> sca scan · 0 critical · 2 low · SBOM signed`, "ok"]
    ];
    let idx = 0, running = false;
    const stamp = (ago = 0) => new Date(Date.now() - ago * 1000).toISOString().slice(11, 19);
    function push(ago, animate = true) {
      const [msg] = events[idx++ % events.length]();
      const ln = document.createElement("div");
      ln.className = "ln" + (animate ? " new" : "");
      ln.innerHTML = `<span class=t>${stamp(ago)}</span> ${msg}`;
      feed.appendChild(ln);
      while (feed.children.length > 18) feed.firstElementChild.remove();
    }
    for (let i = 8; i > 0; i--) push(i * 3 + Math.round(rand(0, 2)), false);
    const feedIO = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running && !reduceMotion) {
        running = true;
        (async function run() {
          while (running) { await sleep(rand(700, 1600)); if (!document.hidden) push(); }
        })();
      } else if (!e.isIntersecting) running = false;
    });
    feedIO.observe(feed);
  }

  /* ---------------------------------------------------------
     10. Neural network background (mouse-reactive + packets)
     --------------------------------------------------------- */
  const canvas = $("#particles");
  let canvasResize = () => {};

  if (canvas && !slowNetwork) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, pts = [], packets = [], visible = true, lastFrame = 0, raf = 0;
    const LINK = 120;
    const maxPoints = coarsePointer ? 28 : 44;
    const dprCap = coarsePointer ? 1 : 1.5;

    canvasResize = function resize() {
      const dpr = Math.min(devicePixelRatio || 1, dprCap);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(maxPoints, Math.max(18, Math.floor(W / 22)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.3, hue: Math.random() < 0.25 ? "87,202,255" : "89,233,191"
      }));
      packets = [];
    };
    canvasResize();

    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible) { lastFrame = 0; raf = requestAnimationFrame(frame); }
    });

    function frame(now = performance.now()) {
      if (!visible) return;
      // 30fps cap: halve work on high-refresh displays.
      if (now - lastFrame < 33) { raf = requestAnimationFrame(frame); return; }
      lastFrame = now;
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.x, my = mouse.y;

      for (const p of pts) {
        if (mouse.active && finePointer) {
          const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 25600 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (160 - d) / 160 * 0.35;
            p.x += dx / d * f; p.y += dy / d * f;
          }
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
      }

      ctx.lineWidth = 0.6;
      const link2 = LINK * LINK;
      // Batch segments into a handful of opacity buckets. Drawing ~1,700
      // individual strokes per frame is the main-thread cost on slow CPUs;
      // six batched paths keep the same look at a fraction of the work.
      const BUCKETS = 6;
      const linkPaths = Array.from({ length: BUCKETS }, () => new Path2D());
      const mousePath = mouse.active && finePointer ? new Path2D() : null;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 >= link2) continue;
          const d = Math.sqrt(d2);
          const bucket = Math.min(BUCKETS - 1, Math.floor((1 - d / LINK) * BUCKETS));
          linkPaths[bucket].moveTo(a.x, a.y);
          linkPaths[bucket].lineTo(b.x, b.y);
          if (!reduceMotion && packets.length < 14 && Math.random() < 0.0004) packets.push({ a, b, t: 0, s: rand(0.008, 0.02) });
        }
        if (mousePath) {
          const dx = a.x - mx, dy = a.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 36100) {
            mousePath.moveTo(a.x, a.y);
            mousePath.lineTo(mx, my);
          }
        }
      }
      for (let k = 0; k < BUCKETS; k++) {
        ctx.strokeStyle = `rgba(89,233,191,${((k + 1) / BUCKETS) * 0.09})`;
        ctx.stroke(linkPaths[k]);
      }
      if (mousePath) {
        ctx.strokeStyle = "rgba(87,202,255,.35)";
        ctx.stroke(mousePath);
      }

      const mintDots = new Path2D(), cyanDots = new Path2D();
      for (const p of pts) {
        const target = p.hue === "87,202,255" ? cyanDots : mintDots;
        target.moveTo(p.x + p.r, p.y);
        target.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(89,233,191,.35)"; ctx.fill(mintDots);
      ctx.fillStyle = "rgba(87,202,255,.35)"; ctx.fill(cyanDots);

      packets = packets.filter(k => (k.t += k.s) < 1);
      for (const k of packets) {
        const x = k.a.x + (k.b.x - k.a.x) * k.t, y = k.a.y + (k.b.y - k.a.y) * k.t;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,255,225,.95)"; ctx.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    // Start after the critical render: the canvas is decorative and should
    // not compete with first paint, fonts or the hero animation.
    const startCanvas = () => { lastFrame = 0; raf = requestAnimationFrame(frame); };
    if ("requestIdleCallback" in window) requestIdleCallback(startCanvas, { timeout: 1200 });
    else setTimeout(startCanvas, 300);
    canvas._cancel = () => { visible = false; cancelAnimationFrame(raf); };
  } else if (canvas) {
    canvas.style.display = "none";
  }

  /* ---------------------------------------------------------
     11. Ticker pause control + one resize scheduler
     --------------------------------------------------------- */
  const ticker = $(".ticker");
  const tickerBtn = $(".ticker-toggle");
  if (ticker && tickerBtn) {
    tickerBtn.addEventListener("click", () => {
      const paused = ticker.classList.toggle("is-paused");
      tickerBtn.setAttribute("aria-pressed", String(paused));
      tickerBtn.setAttribute("aria-label", paused ? "Play ticker" : "Pause ticker");
      tickerBtn.textContent = paused ? "▶" : "❚❚";
    });
  }

  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      canvasResize();
      redrawLinks();
      $$("[data-tilt]").forEach(el => { if (el._invalidateRect) el._invalidateRect(); });
    }, 150);
  }, { passive: true });

  /* ---------------------------------------------------------
     12. Broken image fallback
     --------------------------------------------------------- */
  $$(".medical-logo img,.brand-logo-mark img").forEach(img => {
    img.addEventListener("error", () => { img.style.display = "none"; });
  });
})();

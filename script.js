(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------------------------------------------------
     1. Boot sequence (once per browser session)
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

  if (!boot || reduceMotion || bootSeen) {
    if (boot) boot.classList.add("done");
    setTimeout(startPage, 0); // run after the rest of this script has initialised
  } else {
    const log = $("#boot-log");
    const bar = $(".boot-bar i", boot);
    const lines = [
      ["[ <span class=ok>OK</span> ] initialising c9 neural interface", 0],
      ["[ <span class=ok>OK</span> ] loading model weights · agentic runtime", 0],
      ["[ <span class=ok>OK</span> ] establishing secure channel · TLS 1.3 · AES-256-GCM", 0],
      ["[ <span class=warn>SCAN</span> ] threat surface · 0 critical · 0 high", 0],
      ["[ <span class=ok>OK</span> ] zero-trust policy enforced", 0],
      ["[ <span class=ok>OK</span> ] identity verified → <span class=ok>HARIOM SINGH</span>", 0]
    ];
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("c9-boot", "1"); } catch (e) {}
      boot.classList.add("done");
      setTimeout(startPage, 250);
    };
    boot.addEventListener("click", finish);
    addEventListener("keydown", finish, { once: true });
    (async () => {
      for (let i = 0; i < lines.length; i++) {
        if (finished) return;
        log.innerHTML += lines[i][0] + "\n";
        bar.style.width = ((i + 1) / lines.length) * 100 + "%";
        await sleep(rand(160, 300));
      }
      await sleep(350);
      finish();
    })();
    setTimeout(finish, 4000); // hard fail-safe
  }

  /* ---------------------------------------------------------
     2. Hero typing line
     --------------------------------------------------------- */
  let typingStarted = false;
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
    let p = 0;
    (async function loop() {
      while (true) {
        const text = phrases[p++ % phrases.length];
        for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(rand(28, 70)); }
        await sleep(1800);
        for (let i = text.length; i >= 0; i--) { el.textContent = text.slice(0, i); await sleep(14); }
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
  $$(".reveal").forEach(el => io.observe(el));

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
     5. Cursor: glow + reticle + HUD coords
     --------------------------------------------------------- */
  const glow = $(".cursor-glow");
  const reticle = $(".cursor-reticle");
  const coords = $("#hud-coords");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  let rx = mouse.x, ry = mouse.y;

  addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    if (glow) glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    if (coords) coords.textContent =
      "X:" + String(Math.round(e.clientX)).padStart(4, "0") +
      " Y:" + String(Math.round(e.clientY + scrollY)).padStart(4, "0");
    if (reticle && finePointer) reticle.classList.add("on");
  }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.active = false; reticle && reticle.classList.remove("on"); });

  if (reticle && finePointer && !reduceMotion) {
    (function follow() {
      rx += (mouse.x - rx) * 0.22;
      ry += (mouse.y - ry) * 0.22;
      reticle.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    })();
    const hotSel = "a, button, [data-tilt], .map-node, .arch-pod, .stack-cloud span";
    document.addEventListener("pointerover", e => { if (e.target.closest(hotSel)) reticle.classList.add("hot"); });
    document.addEventListener("pointerout", e => { if (e.target.closest(hotSel)) reticle.classList.remove("hot"); });
  }

  /* ---------------------------------------------------------
     6. 3D tilt + glare, magnetic buttons
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(card => {
      const glare = document.createElement("span");
      glare.className = "tilt-glare";
      card.appendChild(glare);
      const max = card.classList.contains("portrait-frame") ? 6 : 9;
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
        card.style.setProperty("--gx", px * 100 + "%");
        card.style.setProperty("--gy", py * 100 + "%");
        card.classList.add("tilt-on");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        setTimeout(() => card.classList.remove("tilt-on"), 120);
      });
    });

    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------
     6b. Hover scramble (nav + project titles) and staggered children
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$(".nav nav a").forEach(a => a.addEventListener("pointerenter", () => scramble(a, { dur: 380, glyphRate: 40 })));
    $$(".project").forEach(p => {
      const h = $("h3", p);
      if (h) p.addEventListener("pointerenter", () => scramble(h, { dur: 520, glyphRate: 45 }));
    });
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
    navLinks.forEach(a => a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id));
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
  let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(redrawLinks, 150); });

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
          while (running) { await sleep(rand(700, 1600)); push(); }
        })();
      } else if (!e.isIntersecting) running = false;
    });
    feedIO.observe(feed);
  }

  /* ---------------------------------------------------------
     10. Neural network background (mouse-reactive + packets)
     --------------------------------------------------------- */
  const canvas = $("#particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, pts = [], packets = [];
    const LINK = 120;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor(W / 13));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.3, hue: Math.random() < 0.25 ? "87,202,255" : "89,233,191"
      }));
      packets = [];
    }
    resize();
    addEventListener("resize", resize);

    let visible = true;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) requestAnimationFrame(frame); });

    function frame() {
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.x, my = mouse.y;

      for (const p of pts) {
        if (mouse.active && finePointer) {
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
          if (d < 160 && d > 0.1) { const f = (160 - d) / 160 * 0.35; p.x += dx / d * f; p.y += dy / d * f; }
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(89,233,191,${(1 - d / LINK) * 0.09})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (!reduceMotion && packets.length < 14 && Math.random() < 0.0004) packets.push({ a, b, t: 0, s: rand(0.008, 0.02) });
          }
        }
        if (mouse.active && finePointer) {
          const d = Math.hypot(a.x - mx, a.y - my);
          if (d < 190) {
            ctx.strokeStyle = `rgba(87,202,255,${(1 - d / 190) * 0.35})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},.35)`; ctx.fill();
      }

      packets = packets.filter(k => (k.t += k.s) < 1);
      for (const k of packets) {
        const x = k.a.x + (k.b.x - k.a.x) * k.t, y = k.a.y + (k.b.y - k.a.y) * k.t;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,255,225,.95)";
        ctx.shadowColor = "#59e9bf"; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      }

      if (!reduceMotion) requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------------------------------------------------------
     11. Misc: smooth anchors, broken image fallback
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && $(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
    });
  });
  $$(".brand-logo img,.brand-node img,.medical-logo img,.brand-logo-mark img").forEach(img => {
    img.addEventListener("error", () => { img.style.display = "none"; });
  });
})();

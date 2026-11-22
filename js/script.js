/* =====================================================================
   Jatin weds Shreya (groom's side) — behaviour
   Vanilla JavaScript, no dependencies. Reads window.WEDDING_CONFIG.

    1. Helpers                 7. Flip card
    2. Config binding + art    8. Countdown & diyas
    3. Music                   9. Functions carousel
    4. Night sky canvas        10. Venue
    5. Opening letter          11. Reveals & hero depth
    6. Navigation
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.WEDDING_CONFIG || {};
  var C = CFG.couple || {};
  var IMG = CFG.images || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function abs(path) { try { return new URL(path, document.baseURI).href; } catch (e) { return path; } }
  function parseDay(iso) { var p = iso.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" })
  };
  function svgUse(id, cls) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (cls) s.setAttribute("class", cls);
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#" + id);
    s.appendChild(u);
    return s;
  }

  /* ---------- 2. Config binding + artwork ---------- */
  $all("[data-bind]").forEach(function (n) { var k = n.getAttribute("data-bind"); if (C[k]) n.textContent = C[k]; });
  $all("[data-bind-host]").forEach(function (n) { var v = (CFG.hosts || {})[n.getAttribute("data-bind-host")]; if (v) n.textContent = v; });
  $all("[data-bind-root]").forEach(function (n) { var v = CFG[n.getAttribute("data-bind-root")]; if (v) n.textContent = v; });
  $all("[data-bind-closing]").forEach(function (n) { var v = (CFG.closing || {})[n.getAttribute("data-bind-closing")]; if (v) n.textContent = v; });

  (function art() {
    var root = document.documentElement.style, b = document.body.classList;
    function set(v, path) { root.setProperty(v, 'url("' + abs(path) + '")'); }
    if (IMG.heroMobile || IMG.heroDesktop) {
      set("--img-hero-m", IMG.heroMobile || IMG.heroDesktop);
      set("--img-hero-d", IMG.heroDesktop || IMG.heroMobile);
      b.add("has-hero-img");
    }
    if (IMG.garland) { set("--img-garland", IMG.garland); b.add("has-garland"); }
    if (IMG.paper) { set("--img-paper", IMG.paper); b.add("has-paper"); }
    if (IMG.corner) { set("--img-corner", IMG.corner); b.add("has-corner"); }
    var host = $("#couple-art");
    if (host && IMG.couple) {
      var img = new Image();
      img.alt = ""; img.decoding = "async"; img.loading = "lazy";
      img.onerror = function () { img.remove(); };
      img.src = IMG.couple;
      host.appendChild(img);
    }
  })();

  /* ---------- 3. Music: starts only after the guest taps ---------- */
  var music = (function () {
    var btn = $("#music-toggle"), label = $(".music__label", btn);
    var audio = null, ok = true, wants = false;
    var src = (CFG.media || {}).music;
    function render(p) { btn.setAttribute("aria-pressed", p ? "true" : "false"); label.textContent = p ? "Music on" : "Music off"; }
    function ensure() {
      if (audio || !src) return audio;
      audio = new Audio(); audio.loop = true; audio.preload = "auto"; audio.volume = .55;
      audio.addEventListener("error", function () { ok = false; btn.hidden = true; });
      audio.addEventListener("play", function () { render(true); });
      audio.addEventListener("pause", function () { render(false); });
      audio.src = src;
      return audio;
    }
    function play() { if (!ensure() || !ok) return; wants = true; var p = audio.play(); if (p && p.catch) p.catch(function () { render(false); }); }
    btn.addEventListener("click", function () { if (audio && !audio.paused) { wants = false; audio.pause(); } else play(); });
    document.addEventListener("visibilitychange", function () {
      if (!audio) return;
      if (document.hidden) audio.pause(); else if (wants) audio.play().catch(function () {});
    });
    return { play: play, reveal: function () { if (src && ok) btn.hidden = false; } };
  })();

  /* ---------- 4. Night sky: twinkling stars, rising sky lanterns, petal bursts ---------- */
  function sky(canvas, opts) {
    if (!canvas || reduceMotion || !canvas.getContext) return { burst: function () {}, stop: function () {} };
    var ctx = canvas.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [], lanterns = [], petals = [], running = false, visible = true, raf = 0;
    var petalColors = ["#F7A81B", "#F2C14E", "#E2711D", "#A8321F", "#EEDDB5"];
    function size() {
      var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // a paper sky lantern, drawn once and reused (cheap to animate)
    var sprite = (function () {
      var S = 64, c = document.createElement("canvas"); c.width = S * 3; c.height = S * 3.4;
      var g = c.getContext("2d"), cx = c.width / 2, top = S * .9, h = S * 1.35, wTop = S * .62, wBot = S * .42;
      var halo = g.createRadialGradient(cx, top + h * .75, 0, cx, top + h * .6, S * 1.45);
      halo.addColorStop(0, "rgba(255,170,70,.55)"); halo.addColorStop(.5, "rgba(255,140,50,.18)"); halo.addColorStop(1, "rgba(255,150,60,0)");
      g.fillStyle = halo; g.fillRect(0, 0, c.width, c.height);
      g.beginPath();                                         // paper body: rounded top, tapering to the opening
      g.moveTo(cx - wTop / 2, top + S * .12);
      g.quadraticCurveTo(cx, top - S * .14, cx + wTop / 2, top + S * .12);
      g.bezierCurveTo(cx + wTop / 2 + S * .06, top + h * .45, cx + wBot / 2 + S * .03, top + h * .8, cx + wBot / 2, top + h);
      g.lineTo(cx - wBot / 2, top + h);
      g.bezierCurveTo(cx - wBot / 2 - S * .03, top + h * .8, cx - wTop / 2 - S * .06, top + h * .45, cx - wTop / 2, top + S * .12);
      g.closePath();
      var body = g.createRadialGradient(cx, top + h * .95, S * .05, cx, top + h * .55, h * .85);
      body.addColorStop(0, "#FFF1C2"); body.addColorStop(.22, "#FFC461"); body.addColorStop(.58, "#EE7A2B"); body.addColorStop(1, "#9C3A14");
      g.fillStyle = body; g.fill();
      g.save(); g.clip();                                    // thin bamboo ribs through the paper
      g.strokeStyle = "rgba(120,40,10,.22)"; g.lineWidth = 1.2;
      [-.28, 0, .28].forEach(function (k) { g.beginPath(); g.moveTo(cx + k * wTop, top); g.quadraticCurveTo(cx + k * wTop * 1.05, top + h * .5, cx + k * wBot, top + h); g.stroke(); });
      var shade = g.createLinearGradient(cx - wTop / 2, 0, cx + wTop / 2, 0);
      shade.addColorStop(0, "rgba(90,30,10,.28)"); shade.addColorStop(.35, "rgba(255,255,255,0)"); shade.addColorStop(.7, "rgba(255,255,255,0)"); shade.addColorStop(1, "rgba(90,30,10,.32)");
      g.fillStyle = shade; g.fillRect(0, 0, c.width, c.height);
      g.restore();
      g.fillStyle = "#6E2A10";                               // bottom ring
      g.beginPath(); g.ellipse(cx, top + h, wBot / 2, S * .05, 0, 0, 6.283); g.fill();
      var fl = g.createRadialGradient(cx, top + h - S * .06, 0, cx, top + h - S * .06, S * .16);   // flame
      fl.addColorStop(0, "rgba(255,255,235,1)"); fl.addColorStop(.5, "rgba(255,220,120,.9)"); fl.addColorStop(1, "rgba(255,160,60,0)");
      g.fillStyle = fl; g.beginPath(); g.arc(cx, top + h - S * .06, S * .16, 0, 6.283); g.fill();
      return { img: c, w: c.width, h: c.height };
    })();
    function lantern(fresh) {
      var z = .25 + Math.random() * .75;                     // depth: 1 = near
      return { x: Math.random() * W, y: fresh ? H + 60 : H * (.15 + Math.random() * .95), z: z, size: 9 + z * 22,
        vy: -(.12 + z * .42), sw: Math.random() * 6.28, sws: .006 + Math.random() * .01, fl: Math.random() * 6.28 };
    }
    function init() {
      size();
      stars = []; lanterns = [];
      var n = Math.round(W * H / 9000);
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * (opts.starBand || .75), r: Math.random() * 1.3 + .3, t: Math.random() * 6.28, v: .01 + Math.random() * .03 });
      for (var j = 0; j < (opts.lanterns || 0); j++) lanterns.push(lantern(false));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(function (s) {
        s.t += s.v; var a = .35 + .65 * (.5 + .5 * Math.sin(s.t));
        ctx.fillStyle = "rgba(255,246,226," + a.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      });
      lanterns.sort(function (p, q) { return p.z - q.z; });
      lanterns.forEach(function (l, i) {
        l.y += l.vy; l.sw += l.sws; l.fl += .12;
        var x = l.x + Math.sin(l.sw) * (6 + l.z * 10);
        var w = l.size * sprite.w / (64 * .62), hh = w * sprite.h / sprite.w;   // lantern body width = l.size
        ctx.save();
        ctx.globalAlpha = (.35 + l.z * .6) * (.9 + Math.sin(l.fl) * .08 + Math.sin(l.fl * 2.3) * .04);
        ctx.translate(x, l.y); ctx.rotate(Math.sin(l.sw * 1.3) * .06);
        ctx.drawImage(sprite.img, -w / 2, -hh / 2, w, hh);
        ctx.restore();
        if (l.y < -hh) lanterns[i] = lantern(true);
      });
      for (var k = petals.length - 1; k >= 0; k--) {
        var p = petals[k];
        p.vy += .07; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); ctx.fill(); ctx.restore();
        if (p.y > H + 30) petals.splice(k, 1);
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && visible) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    init(); start();
    window.addEventListener("resize", function () { init(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); else stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    return {
      burst: function (n) {
        for (var i = 0; i < n; i++) petals.push({ x: W / 2 + (Math.random() - .5) * 60, y: H / 2, vx: (Math.random() - .5) * 12, vy: -3 - Math.random() * 6, s: 5 + Math.random() * 6, a: Math.random() * 6.28, va: (Math.random() - .5) * .2, c: petalColors[(Math.random() * 5) | 0] });
        start();
      },
      stop: stop
    };
  }
  var letterSky = sky($("#letter-sky"), { lanterns: 9, starBand: 1 });
  sky($("#hero-sky"), { lanterns: 7, starBand: .6 });

  /* ---------- 5. Opening: break the seal, the letter unfolds ---------- */
  (function letter() {
    var box = $("#letter"), seal = $("#seal"), box2 = $("#letter-music");
    if (!box || !seal) return;
    if (!(CFG.media || {}).music) box2.closest("label").hidden = true;
    function open() {
      if (seal.disabled) return;
      seal.disabled = true;
      if (box2.checked) music.play();
      box.classList.add("is-opening");
      letterSky.burst(70);
      document.body.classList.add("site-open");
      var t = reduceMotion ? 0 : 1;
      setTimeout(function () { box.classList.add("is-fading"); }, 1700 * t);
      setTimeout(function () {
        box.classList.add("is-open"); box.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-sealed");
        letterSky.stop(); music.reveal();
        var h = $("#hero-title"); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
        if (location.hash.length > 1) { var target = document.querySelector(location.hash); if (target) target.scrollIntoView(); }
      }, 2700 * t + 30);
    }
    seal.addEventListener("click", open);
    // tapping the letter itself also opens it
    $all(".patrika__half").forEach(function (h) { h.addEventListener("click", function (e) { if (!e.target.closest("label")) open(); }); });
  })();

  /* ---------- 6. Navigation: hides on scroll down, returns on scroll up ---------- */
  (function nav() {
    var navEl = $("#nav"), links = $all("#nav-links a"), lastY = window.scrollY, ticking = false;
    function onScroll() {
      var y = window.scrollY, d = y - lastY;
      if (y < 80) navEl.classList.remove("is-hidden");
      else if (d > 6) navEl.classList.add("is-hidden");
      else if (d < -6) navEl.classList.remove("is-hidden");
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    if (!("IntersectionObserver" in window)) return;
    var map = { story: "#story", functions: "#functions", venue: "#venue" };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var href = map[en.target.id] || "";
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === href); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "invitation", "story", "save-the-date", "countdown", "functions", "venue"].forEach(function (id) { var n = document.getElementById(id); if (n) io.observe(n); });
  })();

  /* ---------- 7. Save the date: tap to turn the card over ---------- */
  (function flip() {
    var card = $("#flip"), live = $("#flip-live");
    if (!card) return;
    card.addEventListener("click", function () {
      var on = !card.classList.contains("is-flipped");
      card.classList.toggle("is-flipped", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
      live.textContent = on ? "Save the date: Friday, 4 December 2026, Jodhpur." : "";
    });
  })();

  /* ---------- 8. Countdown & diyas ---------- */
  var groups = [];
  (CFG.functions || []).forEach(function (f, i) {
    var g = groups[groups.length - 1];
    if (!g || g.date !== f.date) { g = { date: f.date, items: [] }; groups.push(g); }
    g.items.push({ f: f, seq: i + 1 });
  });
  // the wedding day is indigo; earlier days take saffron, rose, henna green and haldi gold in turn
  var dayColors = ["#D9731F", "#B5446E", "#3E7A5A", "#C98A12"];
  function dayColor(i) { return i === groups.length - 1 ? "#222852" : dayColors[i % 4]; }

  (function countdown() {
    var target = new Date(CFG.countdownTarget || "2026-12-04T00:00:00+05:30").getTime();
    var grid = $("#countdown-grid"), done = $("#countdown-done"), cells = {}, timer;
    $all("[data-unit]", grid).forEach(function (n) { cells[n.getAttribute("data-unit")] = n; });
    var names = (C.groom || "Jatin") + " and " + (C.bride || "Shreya");
    function set(u, v) {
      var n = cells[u], t = pad(v); if (n.textContent === t) return;
      n.textContent = t; if (reduceMotion) return;
      n.classList.remove("tick"); void n.offsetWidth; n.classList.add("tick");
    }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        grid.hidden = true; done.hidden = false;
        done.textContent = diff > -86400000 ? "Today is the day. " + names + " are getting married." : names + " are married. Thank you for celebrating with us.";
        clearInterval(timer); return;
      }
      var s = Math.floor(diff / 1000);
      set("days", Math.floor(s / 86400)); set("hours", Math.floor(s % 86400 / 3600)); set("minutes", Math.floor(s % 3600 / 60)); set("seconds", s % 60);
    }
    if (!isNaN(target)) { tick(); timer = setInterval(tick, 1000); }

    // one diya per celebration day; lit once that day has begun in India
    var host = $("#diyas");
    if (!host) return;
    var now = Date.now(), litCount = 0;
    groups.forEach(function (g) {
      var d = parseDay(g.date);
      var dayStart = new Date(g.date + "T00:00:00+05:30").getTime();
      var b = el("button", "diya");
      b.type = "button";
      var lamp = el("span", "diya__lamp");
      lamp.appendChild(svgUse("i-diya"));
      lamp.appendChild(el("span", "diya__flame"));
      b.appendChild(lamp);
      b.appendChild(el("span", "diya__label", d.getUTCDate() + " " + fmt.monthShort.format(d)));
      b.appendChild(el("span", "diya__sub", fmt.short.format(d)));
      var lit = now >= dayStart;
      if (lit) { b.classList.add("is-lit"); litCount++; }
      b.setAttribute("aria-pressed", lit ? "true" : "false");
      b.setAttribute("aria-label", "Diya for " + fmt.weekday.format(d) + ", " + d.getUTCDate() + " " + fmt.month.format(d) + (lit ? ", lit" : ". Tap to light it."));
      b.addEventListener("click", function () {
        var on = !b.classList.contains("is-lit");
        b.classList.toggle("is-lit", on); b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      host.appendChild(b);
    });
    if (litCount === groups.length && groups.length) $("#diyas-note").textContent = "Every diya is lit. The celebrations are here.";
  })();

  /* ---------- 9. Functions: swipeable 3D carousel ---------- */
  (function carousel() {
    var track = $("#track"), chips = $("#daychips"), count = $("#count"), prev = $("#prev"), next = $("#next");
    var list = CFG.functions || [];
    if (!track || !list.length) return;
    var lede = $("#functions-lede");
    var words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

    var cards = [], firstOfDay = [];
    groups.forEach(function (g, gi) {
      var d = parseDay(g.date), colour = dayColor(gi);
      var dayText = fmt.weekday.format(d) + ", " + d.getUTCDate() + " " + fmt.month.format(d) + " " + d.getUTCFullYear();
      firstOfDay.push(cards.length);
      g.items.forEach(function (it) {
        var f = it.f;
        if (f.day && f.day !== fmt.weekday.format(d)) console.warn("Config: " + f.name + " says " + f.day + " but " + f.date + " is a " + fmt.weekday.format(d) + ".");
        var li = el("li", "fcard");
        li.dataset.day = gi;
        li.style.setProperty("--day-color", colour);
        li.setAttribute("aria-label", f.name + ", " + dayText + ", " + f.time);
        var inner = el("div", "fcard__inner");
        inner.appendChild(el("p", "fcard__day", dayText));
        var artBox = el("div", "fcard__art" + (f.framed ? " fcard__art--framed" : ""));
        var motif = svgUse("m-" + (f.motif || "kalash"));
        if (f.image) {
          var img = new Image(); img.alt = ""; img.loading = "lazy"; img.decoding = "async";
          img.onerror = function () { img.replaceWith(motif); artBox.classList.remove("fcard__art--framed"); };
          img.src = f.image; artBox.appendChild(img);
        } else artBox.appendChild(motif);
        inner.appendChild(artBox);
        inner.appendChild(el("p", "fcard__seq", "Ceremony " + it.seq + " of " + list.length));
        inner.appendChild(el("h3", "fcard__name", f.name));
        var dl = el("dl", "fcard__meta");
        function row(k, v) { var r = el("div", "fcard__row"); r.appendChild(el("dt", null, k)); r.appendChild(el("dd", null, v)); dl.appendChild(r); }
        row("Time", f.time);
        if (f.location) row("Location", f.location);
        inner.appendChild(dl);
        li.appendChild(inner);
        track.appendChild(li);
        cards.push(li);
      });

      var chip = el("button", "daychip", fmt.short.format(d) + " " + d.getUTCDate() + " " + fmt.monthShort.format(d));
      chip.type = "button"; chip.setAttribute("role", "tab");
      chip.setAttribute("aria-selected", gi === 0 ? "true" : "false");
      chip.addEventListener("click", function () { goTo(firstOfDay[gi]); });
      chips.appendChild(chip);
    });
    var chipEls = $all(".daychip", chips);

    var n = cards.length, pinEl = $("#fn-pin"), bar = $("#fn-progress-bar"), pinned = false;
    function centerOf(c) { return c.offsetLeft - track.offsetLeft + c.offsetWidth / 2; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    // Scroll-driven mode: while the section is pinned, scrolling the page slides the cards.
    // Each card rests in the centre for part of the scroll, then glides to the next.
    var sticky = $(".fn-pin__sticky");
    function fitsPinned() {
      // the day buttons, card, arrows and progress bar must all fit on one screen
      document.body.classList.add("is-pinned");
      var need = 0;
      Array.prototype.forEach.call(sticky.children, function (c) { need += c.offsetHeight; });
      var cs = getComputedStyle(sticky);
      need += parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 24;
      if (!pinned) document.body.classList.remove("is-pinned");
      return need <= window.innerHeight;
    }
    function setMode() {
      var want = !reduceMotion && n > 1 && window.innerHeight >= 520 && fitsPinned();
      if (want !== pinned) {
        pinned = want;
        document.body.classList.toggle("is-pinned", pinned);
        if (lede) lede.textContent = (words[n] || n) + " ceremonies across " + (words[groups.length] || groups.length).toLowerCase() + " days. " + (pinned ? "Scroll down and the cards slide by, or swipe." : "Swipe through the celebrations.");
      }
      pinEl.style.setProperty("--n", n);
    }
    function pinRange() {
      var top = pinEl.getBoundingClientRect().top + window.scrollY;
      return { top: top, len: Math.max(1, pinEl.offsetHeight - window.innerHeight) };
    }
    function indexFromScroll() {
      var r = pinRange(), p = clamp((window.scrollY - r.top) / r.len, 0, 1), raw = p * (n - 1);
      var i = Math.floor(raw); if (i >= n - 1) return n - 1;
      var e = clamp((raw - i - .25) / .5, 0, 1);
      return i + e * e * (3 - 2 * e);          // rest, glide, rest
    }
    function showIndex(f) {
      var i = Math.floor(f), fr = f - i, a = centerOf(cards[i]), b2 = i + 1 < n ? centerOf(cards[i + 1]) : a;
      track.scrollLeft = a + (b2 - a) * fr - track.clientWidth / 2;
      if (bar) bar.style.width = (f / (n - 1) * 100).toFixed(1) + "%";
      update();
    }

    var aim = null;   // the card we're travelling to, so quick repeated taps add up
    function goTo(i) {
      i = clamp(i, 0, n - 1);
      aim = i;
      if (pinned) {
        var r = pinRange();
        window.scrollTo({ top: r.top + r.len * (i / (n - 1)), behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        track.scrollTo({ left: centerOf(cards[i]) - track.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
    var current = 0, queued = false;
    function update() {
      queued = false;
      var view = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
      cards.forEach(function (c, i) {
        var d = (centerOf(c) - view) / c.offsetWidth;
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
        if (reduceMotion) return;
        var a = clamp(d, -1.6, 1.6);
        c.style.setProperty("--ry", (-a * 38).toFixed(2) + "deg");
        c.style.setProperty("--sc", (1 - Math.min(Math.abs(a), 1) * .12).toFixed(3));
        c.style.setProperty("--tz", (-Math.abs(a) * 70).toFixed(1) + "px");
        c.style.setProperty("--op", (1 - Math.min(Math.abs(a), 1.4) * .32).toFixed(3));
      });
      current = best;
      if (aim === best) aim = null;
      count.textContent = (current + 1) + " / " + n;
      prev.disabled = current === 0; next.disabled = current === n - 1;
      var day = +cards[current].dataset.day;
      chipEls.forEach(function (ch, i) { ch.setAttribute("aria-selected", i === day ? "true" : "false"); });
      // keep the current day's button in view when the row is wider than the screen
      var chip = chipEls[day];
      if (chip && chips.scrollWidth > chips.clientWidth) {
        var want = chip.offsetLeft - chips.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2;
        if (Math.abs(chips.scrollLeft - want) > 4) chips.scrollLeft = want;
      }
    }
    track.addEventListener("scroll", function () { if (!pinned && !queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    var wq = false;
    window.addEventListener("scroll", function () {
      if (!pinned || wq) return; wq = true;
      requestAnimationFrame(function () { wq = false; showIndex(indexFromScroll()); });
    }, { passive: true });
    window.addEventListener("resize", function () { setMode(); if (pinned) showIndex(indexFromScroll()); else update(); });

    function step(dir) { goTo((aim != null ? aim : current) + dir); }
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    track.tabIndex = 0;
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    // in pinned mode a sideways swipe moves one card (the page scroll follows)
    var sx = 0, sy = 0, swiping = false, justSwiped = false;
    track.addEventListener("pointerdown", function (e) { if (!pinned) return; sx = e.clientX; sy = e.clientY; swiping = true; });
    track.addEventListener("pointerup", function (e) {
      if (!pinned || !swiping) return; swiping = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { step(dx < 0 ? 1 : -1); e.preventDefault(); justSwiped = true; setTimeout(function () { justSwiped = false; }, 400); }
    });
    track.addEventListener("pointercancel", function () { swiping = false; });
    // tapping a side card brings it to the centre
    cards.forEach(function (c, i) { c.addEventListener("click", function () { if (!justSwiped && i !== current) goTo(i); }); });

    setMode();
    if (pinned) showIndex(indexFromScroll()); else update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (pinned) showIndex(indexFromScroll()); else update(); });
  })();

  /* ---------- 10. Venue ---------- */
  (function venue() {
    var host = $("#venue-body"), v = CFG.venue || {};
    if (!host) return;
    if (IMG.venue) {
      var img = new Image(); img.alt = v.name ? "Photo of " + v.name : ""; img.className = "venue__img"; img.loading = "lazy"; img.decoding = "async";
      img.width = 1000; img.height = 667;
      img.onerror = function () { img.remove(); };
      img.src = IMG.venue; host.appendChild(img);
    }
    if (v.name) host.appendChild(el("p", "venue__name", v.name));
    if (v.address) host.appendChild(el("address", "venue__address", v.address));
    var href = v.mapsUrl || (v.address ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(((v.name ? v.name + ", " : "") + v.address).replace(/\n/g, " ")) : "");
    if (href) { var a = el("a", "btn btn--indigo", "Get directions in Google Maps"); a.href = href; a.target = "_blank"; a.rel = "noopener"; host.appendChild(a); }
    var places = {};
    (CFG.functions || []).forEach(function (f) { if (f.location) (places[f.location] = places[f.location] || []).push(f.name); });
    var keys = Object.keys(places);
    if (keys.length) {
      var ul = el("ul", "venue__places");
      keys.forEach(function (k) { var li = el("li"); li.appendChild(el("strong", null, k)); li.appendChild(el("span", null, places[k].join(", "))); ul.appendChild(li); });
      host.appendChild(ul);
    }
  })();

  /* ---------- 11. Reveals & hero depth ---------- */
  (function reveals() {
    var groupsSel = [
      [".section-lede", "up"], [".blessing__card", "zoom"], [".story__frame", "zoom"], [".story__names p", "up"],
      [".flip", "zoom"], [".countdown__cell", "up"], [".diyas", "up"], [".daychips", "up"],
      [".venue__img", "zoom"], [".venue__name", "up"], [".venue__address", "up"], [".venue__places li", "up"], [".footer > p", "up"]
    ];
    var items = [];
    groupsSel.forEach(function (g) {
      $all(g[0]).forEach(function (n, i) {
        n.setAttribute("data-reveal", g[1]);
        if (/cell|places|footer|story__names/.test(g[0])) n.style.setProperty("--delay", (i * .12) + "s");
        items.push(n);
      });
    });
    var titles = $all(".section-title");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("is-in"); }); titles.forEach(function (t) { t.classList.add("is-visible"); }); return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add(e.target.classList.contains("section-title") ? "is-visible" : "is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .05 });
    items.concat(titles).forEach(function (n) { io.observe(n); });

    var hero = $("#home"), q = false;
    window.addEventListener("scroll", function () {
      if (q) return; q = true;
      requestAnimationFrame(function () {
        q = false;
        var p = Math.max(0, Math.min(1, window.scrollY / (hero.offsetHeight || 1)));
        hero.style.setProperty("--hs", p.toFixed(3));
      });
    }, { passive: true });
  })();
})();

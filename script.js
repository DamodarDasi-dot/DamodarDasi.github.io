/* Damodar Dasi portfolio — navigation, section tracking, counters, project filters */
const DD_SERIES = {"names": {"k": "Compressor packages", "n2": "PSA nitrogen systems", "fuel": "Fuel systems", "tanks": "Storage tanks", "skids": "Mechanical & structural skids", "piping": "Piping & integration"}, "series": {"k": ["c01-nyk-n2-compander.html", "c02-xiexing-bog-compressor.html", "c03-banyan-natural-gas-compressor.html", "c04-sichuan-h2o2-package.html", "c05-maoming-air-compressor.html"], "n2": ["psa-nitrogen.html"], "fuel": ["emarat-mfu.html", "f07-maser-demo-pfu.html", "fuel-rfq-portfolio.html"], "tanks": ["emarat-mfu.html", "storage-tank-portfolio.html"], "skids": ["mechanical-skids.html"], "piping": ["c01-nyk-n2-compander.html", "c02-xiexing-bog-compressor.html", "c03-banyan-natural-gas-compressor.html", "c04-sichuan-h2o2-package.html", "c05-maoming-air-compressor.html", "psa-nitrogen.html", "emarat-mfu.html", "f07-maser-demo-pfu.html"]}, "proj": {"c01-nyk-n2-compander.html": {"code": "C-01", "title": "NYK N₂ compander package"}, "c02-xiexing-bog-compressor.html": {"code": "C-02", "title": "Xiexing Rudong BOG compressor"}, "c03-banyan-natural-gas-compressor.html": {"code": "C-03", "title": "Banyan FGB natural gas compressor"}, "c04-sichuan-h2o2-package.html": {"code": "C-04", "title": "Sichuan H₂O₂ compressor &amp; expander"}, "c05-maoming-air-compressor.html": {"code": "C-05", "title": "Maoming air compressor"}, "psa-nitrogen.html": {"code": "P-01", "title": "ONGC PSA nitrogen generator"}, "emarat-mfu.html": {"code": "F-01", "title": "Emarat 40 FT dual-compartment MFU"}, "f07-maser-demo-pfu.html": {"code": "F-07", "title": "Maser demo portable fueling unit"}, "fuel-rfq-portfolio.html": {"code": "F-02–06", "title": "Fuel systems — RFQ designs"}, "storage-tank-portfolio.html": {"code": "S-01", "title": "Storage tank portfolio"}, "mechanical-skids.html": {"code": "S-02", "title": "Mechanical &amp; structural skids"}}};
(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav nav');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  if (menu && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('show', open);
      menu.closest('.nav')?.classList.toggle('open-menu', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menu.addEventListener('click', () => setOpen(!nav.classList.contains('show')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  // Active section indicator (homepage only)
  const links = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          byId[en.target.id]?.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // Count-up for datasheet values
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    const run = (el) => {
      const target = +el.dataset.count, t0 = performance.now(), dur = 1100;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: .6 });
    counters.forEach(c => io.observe(c));
  }

  // Project register: category filters + text search + expertise interlink
  const filterBtns = document.querySelectorAll('.filters button');
  const rows = [...document.querySelectorAll('.register a[data-cat]')];
  const note = document.querySelector('.filter-note');
  const empty = document.querySelector('.reg-empty');
  const q = document.getElementById('reg-q');
  const tagsOf = r => (r.dataset.tags || r.dataset.cat).split(' ');
  const textOf = r => (r.textContent + ' ' + (r.dataset.kw || '')).toLowerCase();
  let tag = 'all', tagName = null, lastCard = null;
  const apply = (flash) => {
    const words = (q && q.value.trim().toLowerCase().split(/\s+/).filter(Boolean)) || [];
    let n = 0;
    rows.forEach(r => {
      const on = (tag === 'all' || tagsOf(r).includes(tag)) && words.every(w => textOf(r).includes(w));
      r.hidden = !on; if (on) n++;
      r.classList.remove('flash'); if (on && flash) { void r.offsetWidth; r.classList.add('flash'); }
    });
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === tag)));
    document.querySelectorAll('.reg-group').forEach(g => { g.hidden = !rows.some(r => !r.hidden && r.dataset.cat === g.dataset.group); });
    if (empty) empty.hidden = n > 0;
    document.querySelector('.register')?.classList.toggle('is-empty', n === 0);
    if (note) {
      note.hidden = !tagName;
      if (tagName) { note.querySelector('b').innerHTML = tagName; note.querySelector('.cnt').textContent = `${n} project${n === 1 ? '' : 's'}`; }
    }
  };
  filterBtns.forEach(btn => btn.addEventListener('click', () => { tag = tag === btn.dataset.filter ? 'all' : btn.dataset.filter; tagName = null; apply(false); }));
  if (q) q.addEventListener('input', () => apply(false));
  document.querySelectorAll('[data-count-tag]').forEach(el => {
    const n = rows.filter(r => tagsOf(r).includes(el.dataset.countTag)).length;
    el.textContent = `${n} project${n > 1 ? 's' : ''}`;
  });

  const clearAll = () => { tag = 'all'; tagName = null; if (q) q.value = ''; apply(false); };
  if (empty) empty.querySelector('.clear-all').addEventListener('click', clearAll);
  if (note) {
    note.querySelector('.clear').addEventListener('click', clearAll);
    note.querySelector('.back').addEventListener('click', e => {
      e.preventDefault();
      const target = lastCard || document.getElementById('expertise');
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      if (lastCard) { lastCard.classList.remove('flash'); void lastCard.offsetWidth; lastCard.classList.add('flash'); }
    });
  }

  // Series walk-through on case-study pages (?series=k → C-01 … C-05 in order)
  const sp = new URLSearchParams(location.search).get('series');
  const here = location.pathname.split('/').pop();
  const list = sp && DD_SERIES.series[sp];
  const main = document.querySelector('main');
  if (list && list.includes(here) && main) {
    const i = list.indexOf(here), n = list.length;
    const url = f => `${f}?series=${sp}`;
    const prev = list[i - 1], next = list[i + 1];
    const dots = list.map((f, k) => `<a href="${url(f)}" class="${k === i ? 'on' : ''}" aria-label="${DD_SERIES.proj[f].code}"${k === i ? ' aria-current="page"' : ''}>${DD_SERIES.proj[f].code}</a>`).join('');
    const bar = document.createElement('nav');
    bar.className = 'series-bar'; bar.setAttribute('aria-label', 'Project series');
    bar.innerHTML = `<div class="sb-in">
      <div class="sb-t"><span class="label">${DD_SERIES.names[sp]}</span><b>${i + 1} of ${n}</b></div>
      <div class="sb-dots">${dots}</div>
      <div class="sb-nav">${prev ? `<a class="sb-btn" href="${url(prev)}">← ${DD_SERIES.proj[prev].code}</a>` : `<a class="sb-btn ghost" href="../index.html#expertise">← Expertise</a>`}${next ? `<a class="sb-btn primary" href="${url(next)}">Next: ${DD_SERIES.proj[next].code} →</a>` : `<a class="sb-btn primary" href="../index.html#projects">All projects →</a>`}</div>
    </div>`;
    main.prepend(bar);
    document.addEventListener('keydown', e => {
      if (e.target.closest('input,textarea,[contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' && next) location.href = url(next);
      if (e.key === 'ArrowLeft' && prev) location.href = url(prev);
    });
    // keep the series when using the page's own previous/next cards if they are in the same series
    document.querySelectorAll('.pnav a[href]').forEach(a => {
      const f = a.getAttribute('href').split('/').pop().split('?')[0];
      if (list.includes(f)) a.setAttribute('href', a.getAttribute('href').split('?')[0] + `?series=${sp}`);
    });
  }
})();

/* v4: back-to-top + earlier roles toggle */
(() => {
  const t = document.querySelector('.to-top');
  if (t) { const f = () => t.classList.toggle('show', scrollY > 900); addEventListener('scroll', f, { passive: true }); f(); }
  const b = document.querySelector('.exp-more'), e = document.querySelector('.exp');
  if (b && e) b.addEventListener('click', () => {
    const o = e.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
    b.innerHTML = o ? 'Hide earlier roles <span aria-hidden="true">↑</span>' : 'Show 3 earlier roles <span aria-hidden="true">↓</span>';
  });
})();

/* v4: interactive workflow — runs on its own, loops, holds on interaction */
(() => {
  const w = document.querySelector('[data-wf]'); if (!w) return;
  const tabs = [...w.querySelectorAll('.wf-node')], panels = [...w.querySelectorAll('.wf-panel')];
  const rail = w.querySelector('.wf-rail'), count = w.querySelector('.wf-count b');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP = 8000, HOLD = 6000, N = tabs.length;
  let i = 0, t = null, visible = false, held = false;
  w.style.setProperty('--wf-step', STEP + 'ms');
  const tick = ms => { w.style.setProperty('--wf-dur', ms + 'ms'); w.classList.remove('tick'); void w.offsetWidth; w.classList.add('tick'); };
  function go(n, focus) {
    i = (n + N) % N;
    tabs.forEach((x, k) => { const on = k === i; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; x.classList.toggle('done', k < i); });
    panels.forEach((p, k) => p.classList.toggle('on', k === i));
    if (count) count.textContent = String(i + 1).padStart(2, '0');
    if (focus) tabs[i].focus({ preventScroll: true });
    if (rail.scrollWidth > rail.clientWidth + 2) { const x = tabs[i]; rail.scrollTo({ left: x.offsetLeft - rail.clientWidth / 2 + x.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' }); }
  }
  function schedule(ms) {
    clearTimeout(t); t = null; w.classList.remove('tick', 'playing');
    if (reduce || !visible || held || document.hidden) return;
    w.classList.add('playing'); tick(ms);
    t = setTimeout(() => { go(i + 1); schedule(STEP); }, ms);
  }
  const userGo = (n, focus) => { go(n, focus); schedule(HOLD); };
  w.querySelector('[data-wf-prev]').addEventListener('click', () => userGo(i - 1));
  w.querySelector('[data-wf-next]').addEventListener('click', () => userGo(i + 1));
  tabs.forEach((x, k) => x.addEventListener('click', () => userGo(k)));
  rail.addEventListener('keydown', e => {
    const m = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: N - 1 }[e.key];
    if (m === undefined) return; e.preventDefault(); userGo(m, true);
  });
  let x0 = null; const box = w.querySelector('.wf-panels');
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; held = true; schedule(0); }, { passive: true });
  box.addEventListener('touchend', e => {
    held = false; if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) userGo(i + (dx < 0 ? 1 : -1)); else schedule(HOLD);
  }, { passive: true });
  // pause while a mouse rests on the card so it can be read
  if (matchMedia('(hover: hover)').matches) {
    box.addEventListener('mouseenter', () => { held = true; schedule(0); });
    box.addEventListener('mouseleave', () => { held = false; schedule(STEP); });
  }
  document.addEventListener('visibilitychange', () => schedule(STEP));
  go(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; schedule(STEP); }, { threshold: 0.35 }).observe(w);
  }
})();

/* v4: metrics visuals start when the strip is on screen */
(() => {
  const m = document.querySelector('.metrics-strip'); if (!m) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { m.classList.add('in'); return; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { m.classList.add('in'); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(m);
})();

/* v5: numbers spotlight — runs on its own, loops, holds briefly on interaction */
(() => {
  const w = document.querySelector('[data-spot]'); if (!w) return;
  const slides = [...w.querySelectorAll('.sp-slide')], chips = [...w.querySelectorAll('.sp-chip')];
  const card = w.querySelector('.sp-card');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP = 6000, HOLD = 6000, N = slides.length;
  const fit = () => {
    card.style.minHeight = '';
    let mx = 0;
    slides.forEach(s => { const was = s.classList.contains('on'); s.style.display = 'block'; s.style.animation = 'none'; mx = Math.max(mx, s.offsetHeight); s.style.display = ''; s.style.animation = ''; });
    card.style.minHeight = mx + 'px';
  };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);
  let i = 0, t = null, visible = false, held = false;
  const count = el => {
    if (reduce) return; const to = +el.dataset.to, t0 = performance.now(), d = 900;
    const f = now => { const p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  function go(n, focus) {
    i = (n + N) % N;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    chips.forEach((c, k) => { const on = k === i; c.setAttribute('aria-selected', on); c.tabIndex = on ? 0 : -1; });
    if (focus) chips[i].focus({ preventScroll: true });
    const v = slides[i].querySelector('[data-to]'); if (v) count(v);
  }
  function schedule(ms) {
    clearTimeout(t); t = null; w.classList.remove('tick');
    if (reduce || !visible || held || document.hidden) return;
    w.style.setProperty('--sp-dur', ms + 'ms'); void w.offsetWidth; w.classList.add('tick');
    t = setTimeout(() => { go(i + 1); schedule(STEP); }, ms);
  }
  const userGo = (n, f) => { go(n, f); schedule(HOLD); };
  chips.forEach((c, k) => c.addEventListener('click', () => userGo(k)));
  w.querySelector('.sp-chips').addEventListener('keydown', e => {
    const m = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: N - 1 }[e.key];
    if (m === undefined) return; e.preventDefault(); userGo(m, true);
  });
  let x0 = null;
  card.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; held = true; schedule(0); }, { passive: true });
  card.addEventListener('touchend', e => {
    held = false; if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) userGo(i + (dx < 0 ? 1 : -1)); else schedule(HOLD);
  }, { passive: true });
  if (matchMedia('(hover: hover)').matches) {
    card.addEventListener('mouseenter', () => { held = true; schedule(0); });
    card.addEventListener('mouseleave', () => { held = false; schedule(STEP); });
  }
  document.addEventListener('visibilitychange', () => schedule(STEP));
  if ('IntersectionObserver' in window) {
    let first = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && first) { first = false; go(0); } schedule(STEP); }, { threshold: 0.4 }).observe(w);
  }
})();

/* v6: expertise scenes animate only while visible */
(() => {
  const d = document.getElementById('expertise-cards'); if (!d || !('IntersectionObserver' in window)) { d && d.classList.add('play'); return; }
  new IntersectionObserver(es => d.classList.toggle('play', es[0].isIntersecting), { threshold: 0.15 }).observe(d);
})();

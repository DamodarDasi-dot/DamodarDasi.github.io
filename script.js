/* Damodar Dasi portfolio — navigation, section tracking, counters, project filters */
const DD_SERIES = {"names": {"fuel": "Fuel systems", "tanks": "Storage tanks", "skids": "Mechanical & structural skids", "piping": "Piping & integration"}, "series": {"fuel": ["emarat-mfu.html", "f07-maser-demo-pfu.html", "fuel-rfq-portfolio.html"], "tanks": ["emarat-mfu.html", "storage-tank-portfolio.html"], "skids": ["mechanical-skids.html"], "piping": ["emarat-mfu.html", "f07-maser-demo-pfu.html", "fuel-rfq-portfolio.html"]}, "proj": {"emarat-mfu.html": {"code": "F-01", "title": "Emarat 40 FT dual-compartment MFU"}, "f07-maser-demo-pfu.html": {"code": "F-07", "title": "Maser demo portable fueling unit"}, "fuel-rfq-portfolio.html": {"code": "F-02–06", "title": "Fuel systems — RFQ designs"}, "storage-tank-portfolio.html": {"code": "S-01", "title": "Storage tank portfolio"}, "mechanical-skids.html": {"code": "S-02", "title": "Mechanical &amp; structural skids"}}};
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
  // The real value is always in the HTML. The roll-up starts at ~70% of it and is skipped
  // for bots, screenshot tools and background tabs, so nobody ever reads a low number.
  const bot = navigator.webdriver || /bot|crawl|spider|slurp|preview|headless|lighthouse|screenshot/i.test(navigator.userAgent);
  if (counters.length && !reduce && !bot && 'IntersectionObserver' in window) {
    const run = (el) => {
      const target = +el.dataset.count, from = Math.max(1, Math.round(target * 0.7)), t0 = performance.now(), dur = 650;
      if (document.hidden || target < 10) return;          // small numbers: nothing to animate
      const done = () => { el.textContent = target; };
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * e);
        if (p < 1) requestAnimationFrame(step); else done();
      };
      el.textContent = from;
      requestAnimationFrame(step);
      setTimeout(done, dur + 400);                          // guaranteed final value
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
      if (r.parentElement.classList.contains('reg-item')) r.parentElement.hidden = !on;
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

  // Series walk-through on case-study pages (?series=fuel → F-01 … in order)
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
  let i = 0, t = null, visible = false, held = false, pinned = false;
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
    if (reduce || !visible || held || pinned || document.hidden) return;
    w.classList.add('playing'); tick(ms);
    t = setTimeout(() => { go(i + 1); schedule(STEP); }, ms);
  }
  const samples = [...w.querySelectorAll('.wf-sample')];
  const shut = () => { samples.forEach(d => { d.open = false; }); pinned = false; };
  const userGo = (n, focus) => { if (n !== i) shut(); go(n, focus); schedule(HOLD); };
  // opening a sample deliverable holds the run until it is closed or the visitor moves on
  samples.forEach(d => d.addEventListener('toggle', () => {
    pinned = samples.some(x => x.open); schedule(pinned ? 0 : HOLD);
    if (d.open && typeof gtag === 'function') gtag('event', 'workflow_sample', { step: d.closest('.wf-panel').id });
  }));
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

/* v6: expertise scenes animate only while visible */
(() => {
  const d = document.getElementById('expertise-cards'); if (!d || !('IntersectionObserver' in window)) { d && d.classList.add('play'); return; }
  new IntersectionObserver(es => d.classList.toggle('play', es[0].isIntersecting), { threshold: 0.15 }).observe(d);
})();

/* v6: record contact actions in Google Analytics as `contact_click` */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]'); if (!a || typeof gtag !== 'function') return;
  const h = a.getAttribute('href') || '';
  const method = /wa\.me|whatsapp/i.test(h) ? 'whatsapp' : /^mailto:/i.test(h) ? 'email' : /^tel:/i.test(h) ? 'phone'
    : /linkedin\.com/i.test(h) ? 'linkedin' : /\.pdf($|\?)/i.test(h) || a.hasAttribute('download') ? 'resume_download' : null;
  if (!method) return;
  const sec = a.closest('section[id]');
  gtag('event', 'contact_click', {
    method,
    link_text: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
    page_section: sec ? sec.id : (a.closest('header') ? 'header' : a.classList.contains('wa-fab') ? 'floating_button' : 'page'),
    page_path: location.pathname
  });
}, { capture: true });

/* register: expandable media cards */
document.querySelectorAll('.rx-btn').forEach(b => {
  const p = document.getElementById(b.getAttribute('aria-controls')); if (!p) return;
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', (open ? 'Hide' : 'Show') + b.getAttribute('aria-label').replace(/^(Show|Hide)/, ''));
    if (open) { p.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('open'))); if (typeof gtag === 'function') gtag('event', 'project_expand', { project: b.getAttribute('aria-controls').slice(3) }); }
    else { p.classList.remove('open'); setTimeout(() => { if (b.getAttribute('aria-expanded') !== 'true') p.hidden = true; }, 320); }
  });
});

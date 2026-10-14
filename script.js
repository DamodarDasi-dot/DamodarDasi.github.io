/* Damodar Dasi portfolio — navigation, section tracking, counters, project filters */
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
    if (empty) empty.hidden = n > 0;
    document.querySelector('.register')?.classList.toggle('is-empty', n === 0);
    if (note) {
      note.hidden = !tagName;
      if (tagName) { note.querySelector('b').innerHTML = tagName; note.querySelector('.cnt').textContent = `${n} project${n === 1 ? '' : 's'}`; }
    }
  };
  filterBtns.forEach(btn => btn.addEventListener('click', () => { tag = btn.dataset.filter; tagName = null; apply(false); }));
  if (q) q.addEventListener('input', () => apply(false));
  document.querySelectorAll('[data-count-tag]').forEach(el => {
    const n = rows.filter(r => tagsOf(r).includes(el.dataset.countTag)).length;
    el.textContent = `${n} project${n > 1 ? 's' : ''}`;
  });
  document.querySelectorAll('a.go[data-tag]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    lastCard = a.closest('article'); tag = a.dataset.tag; tagName = a.dataset.name;
    if (q) q.value = '';
    apply(true);
    document.getElementById('projects').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#projects');
  }));
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
})();

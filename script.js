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

  // Project register filters
  const filterBtns = document.querySelectorAll('.filters button');
  const rows = document.querySelectorAll('.register a[data-cat]');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    rows.forEach(r => { r.hidden = !(f === 'all' || r.dataset.cat === f); });
  }));
})();

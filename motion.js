/* Cinematic layer: preloader, rotating roles, scroll-driven hero, section reveals, cursor */
(() => {
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);

  // ---- Preloader (first visit per session) ----
  const ld = document.getElementById('loader');
  if (ld && !html.classList.contains('seen') && !reduce) {
    const num = ld.querySelector('.ld-num span'), bar = ld.querySelector('.ld-bar i');
    const t0 = performance.now(), MIN = 1500, MAX = 3200;
    let loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    const tick = (t) => {
      const el = t - t0;
      let p = Math.min(1, el / MIN);
      if (!loaded && el < MAX) p = Math.min(p, .92);
      const v = Math.round(ease(p) * 100);
      num.textContent = v; bar.style.transform = `scaleX(${v / 100})`;
      if (v >= 100) {
        setTimeout(() => { ld.classList.add('done'); html.classList.add('stage-in'); }, 260);
        setTimeout(() => ld.remove(), 1800);
        try { sessionStorage.setItem('dd-loaded', '1'); } catch (e) {}
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else if (ld) { ld.remove(); }

  // ---- Rotating role words ----
  const roles = [...document.querySelectorAll('.role')];
  if (roles.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      const cur = roles[i]; i = (i + 1) % roles.length; const nxt = roles[i];
      cur.classList.remove('on'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 950);
    }, 2600);
  }

  // ---- Scroll-driven hero (zoom, tilt, dim, parallax) ----
  const stage = document.querySelector('.stage');
  if (stage && !reduce) {
    const img = stage.querySelector('.stage-portrait img'), light = stage.querySelector('.stage-light'), copy = stage.querySelector('.stage-copy');
    const desk = matchMedia('(min-width: 901px)');
    let mx = 0, my = 0, raf = 0;
    const draw = () => {
      raf = 0;
      const h = stage.offsetHeight, p = Math.max(0, Math.min(1, scrollY / h));
      const tilt = desk.matches ? mx * 4 : 0, lift = desk.matches ? my * 3 : 0;
      img.style.transform = `perspective(1200px) translateY(${p * 70}px) scale(${1 + p * .1}) rotateY(${-p * 10 + tilt}deg) rotateX(${lift}deg)`;
      img.style.filter = `brightness(${1 - p * .45}) contrast(${1 + p * .1})`;
      light.style.transform = `translate3d(${mx * 18}px, ${p * 40 + my * 12}px, 0)`;
      if (copy) { copy.style.transform = `translateY(${-p * 50}px)`; copy.style.opacity = `${1 - p * .7}`; }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; req(); });
    stage.addEventListener('pointerleave', () => { mx = my = 0; req(); });
    draw();
  }

  // ---- Section reveals ----
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('main > section:not(.stage) > *, main > section:not(.stage) .cards > *, .register > a, .exp-row, .award-grid figure, .gallery-grid figure');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    targets.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * .9) return;            // already visible: leave as is
      el.classList.add('rv'); el.style.transitionDelay = `${(k % 4) * 70}ms`; io.observe(el);
    });
  }

  // ---- Cursor ring (desktop pointers only) ----
  const cur = document.querySelector('.cur');
  if (cur && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.remove('hide'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('hide'));
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,[role=tab]')));
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
  } else if (cur) cur.remove();
})();

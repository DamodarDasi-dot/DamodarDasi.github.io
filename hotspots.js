/* GA hotspot explorer: pulsing + pins over a drawing; tap one to read the engineering note */
(() => {
  document.querySelectorAll('[data-hs]').forEach(fig => {
    const stage = fig.querySelector('.hs-stage');
    const pins = [...stage.querySelectorAll('.hs-pin')];
    if (!pins.length) return;
    const card = document.createElement('div');
    card.className = 'hs-card'; card.hidden = true; card.setAttribute('role', 'region'); card.setAttribute('aria-live', 'polite');
    stage.after(card);
    const legend = document.createElement('div'); legend.className = 'hs-legend';
    legend.innerHTML = '<span class="hs-hint">Tap a <i aria-hidden="true">+</i> on the drawing, or pick a callout:</span>';
    card.after(legend);
    const chips = pins.map((p, k) => {
      p.dataset.k = k; p.setAttribute('aria-expanded', 'false');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hs-chip';
      b.textContent = p.dataset.s || p.dataset.h; b.onclick = () => open(k, false); legend.appendChild(b); return b;
    });
    let cur = -1;
    function open(k, fromPin) {
      k = (k + pins.length) % pins.length; cur = k;
      const p = pins[k], x = +p.style.getPropertyValue('--x'), y = +p.style.getPropertyValue('--y');
      pins.forEach((q, i) => { q.classList.toggle('on', i === k); q.setAttribute('aria-expanded', i === k); });
      chips.forEach((c, i) => c.classList.toggle('on', i === k));
      card.innerHTML = `<div class="hs-card-h"><b>${p.dataset.h}</b><button type="button" class="hs-x" aria-label="Close">✕</button></div>` +
        `<p>${p.querySelector('.hs-tx').innerHTML}</p>` +
        `<div class="hs-nav"><button type="button" class="hs-prev" aria-label="Previous callout">‹</button><span>${k + 1} / ${pins.length}</span><button type="button" class="hs-next" aria-label="Next callout">›</button></div>`;
      card.style.setProperty('--px', (x * stage.clientWidth / 100) + 'px'); card.style.setProperty('--py', (y * stage.clientHeight / 100) + 'px'); card.style.setProperty('--sw', stage.clientWidth + 'px');
      card.classList.toggle('left', x > 55); card.classList.toggle('up', y > 58);
      card.hidden = false; fig.classList.add('hs-active');
      card.querySelector('.hs-x').onclick = close;
      card.querySelector('.hs-prev').onclick = () => open(cur - 1);
      card.querySelector('.hs-next').onclick = () => open(cur + 1);
      if (!fromPin && matchMedia('(max-width: 760px)').matches) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (typeof gtag === 'function') gtag('event', 'hotspot_open', { drawing: fig.dataset.hs, callout: p.dataset.s || p.dataset.h });
    }
    function close() {
      card.hidden = true; fig.classList.remove('hs-active');
      pins.forEach(q => { q.classList.remove('on'); q.setAttribute('aria-expanded', 'false'); }); chips.forEach(c => c.classList.remove('on'));
      if (cur > -1) pins[cur].focus({ preventScroll: true }); cur = -1;
    }
    pins.forEach((p, k) => p.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); cur === k ? close() : open(k, true); }));
    fig.addEventListener('keydown', e => {
      if (cur < 0) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') open(cur + 1); else if (e.key === 'ArrowLeft') open(cur - 1);
    });
    document.addEventListener('click', e => { if (cur > -1 && !fig.contains(e.target)) close(); });
    // start the pulse when the drawing comes into view
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { fig.classList.add('hs-in'); o.disconnect(); } }, { threshold: .35 }).observe(stage);
  });
})();

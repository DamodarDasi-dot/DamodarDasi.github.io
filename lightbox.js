/* Lightbox for project and gallery images: tap to enlarge, swipe / arrow keys to move, Esc to close */
(() => {
  const isImg = h => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(h || '');
  const eligible = () => [...document.querySelectorAll('main figure img, main .ga-fig img, [data-lb] img')]
    .filter(im => !im.closest('.rthumb, .portrait, .stage-portrait, .nav, .xp-viz, .bento, [data-no-lb]') && (im.naturalWidth || +im.getAttribute('width') || 0) >= 300);
  let list = [], i = 0, box, img, cap, cnt, x0 = null, last = null;
  const big = im => { const a = im.closest('a'); return a && isImg(a.getAttribute('href')) ? a.href : (im.currentSrc || im.src); };
  const text = im => {
    const f = im.closest('figure') || im.closest('[data-lb]'); const fc = f && f.querySelector('figcaption');
    return fc ? fc.textContent.trim().replace(/\s+/g, ' ') : (im.alt || '');
  };
  function build() {
    box = document.createElement('div'); box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<button type="button" class="lb-x" aria-label="Close">✕</button><button type="button" class="lb-p" aria-label="Previous image">‹</button>' +
      '<figure class="lb-f"><img alt=""><figcaption><span class="lb-c"></span><span class="lb-n"></span></figcaption></figure><button type="button" class="lb-nx" aria-label="Next image">›</button>';
    document.body.appendChild(box);
    img = box.querySelector('img'); cap = box.querySelector('.lb-c'); cnt = box.querySelector('.lb-n');
    box.querySelector('.lb-x').onclick = close;
    box.querySelector('.lb-p').onclick = () => show(i - 1);
    box.querySelector('.lb-nx').onclick = () => show(i + 1);
    box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lb-f')) close(); });
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) show(i + (dx < 0 ? 1 : -1)); }, { passive: true });
  }
  function show(n) {
    i = (n + list.length) % list.length; const im = list[i];
    img.classList.remove('in'); img.src = big(im); img.alt = im.alt || '';
    img.onload = () => img.classList.add('in');
    cap.textContent = text(im); cnt.textContent = list.length > 1 ? `${i + 1} / ${list.length}` : '';
    box.classList.toggle('single', list.length < 2);
  }
  function open(im) {
    if (!box) build();
    const grp = im.closest('.rx-media, .award-grid, section') || document;
    list = eligible().filter(x => grp.contains(x) && x.offsetParent !== null); if (!list.includes(im)) list = [im];
    i = Math.max(0, list.indexOf(im)); last = document.activeElement;
    box.hidden = false; document.documentElement.classList.add('lb-open'); show(i);
    requestAnimationFrame(() => box.classList.add('on')); box.querySelector('.lb-x').focus();
    if (typeof gtag === 'function') gtag('event', 'image_open', { page_path: location.pathname, image: (im.alt || '').slice(0, 80) });
  }
  function close() {
    box.classList.remove('on'); document.documentElement.classList.remove('lb-open');
    setTimeout(() => { box.hidden = true; img.src = ''; }, 180); last && last.focus && last.focus();
  }
  document.addEventListener('click', e => {
    const im = e.target.closest && e.target.closest('img'); if (!im || !eligible().includes(im)) return;
    e.preventDefault(); open(im);
  });
  document.addEventListener('keydown', e => {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'Tab') { const f = [...box.querySelectorAll('button')]; const k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  // mark eligible images as zoomable once loaded
  const mark = () => eligible().forEach(im => im.classList.add('lb-zoom'));
  addEventListener('load', mark); setTimeout(mark, 1500);
})();

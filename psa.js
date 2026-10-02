/* Twin-tower PSA working-principle animation — original drawing, no third-party assets */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PH = [
    { t: 'Tower A on line', dur: 5200, open: ['v1', 'v3', 'v6'], flow: ['fAin', 'fAbed1', 'fAbed2', 'fAout', 'fBexh'], g: [55, -55], sat: [1, 0],
      l: ['Air enters Tower A. The carbon molecular sieve adsorbs O₂ and lets N₂ pass', 'to the buffer. Tower B vents O₂-rich gas through the silencer and regenerates.'] },
    { t: 'Pressure equalisation', dur: 2200, open: ['v7'], flow: ['fEqAB'], g: [0, 0], sat: [1, 0],
      l: ['Inlet, outlet and exhaust valves close. V7 links the tower tops so Tower A', 'shares its pressure with Tower B, saving compressed air before switchover.'] },
    { t: 'Tower B on line', dur: 5200, open: ['v2', 'v4', 'v5'], flow: ['fBin', 'fBbed1', 'fBbed2', 'fBout', 'fAexh'], g: [-55, 55], sat: [0, 1],
      l: ['Towers swap roles: Tower B now produces N₂ to the buffer while Tower A', 'depressurises to atmosphere and releases the adsorbed O₂.'] },
    { t: 'Pressure equalisation', dur: 2200, open: ['v7'], flow: ['fEqBA'], g: [0, 0], sat: [0, 1],
      l: ['V7 opens again, this time from Tower B to Tower A, and the cycle repeats.', 'The buffer smooths delivery so the user sees steady flow and purity.'] },
  ];
  const VALVES = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'];
  const FLOWS = ['fAin', 'fAbed1', 'fAbed2', 'fAout', 'fBexh', 'fBin', 'fBbed1', 'fBbed2', 'fBout', 'fAexh', 'fEqAB', 'fEqBA'];

  document.querySelectorAll('[data-psa]').forEach(root => {
    const $ = id => root.querySelector('#psa-' + id);
    const steps = [...root.querySelectorAll('[data-step]')];
    const play = root.querySelector('.psa-play');
    const live = root.querySelector('.psa-live');
    let i = 0, timer = null, running = !reduce, visible = true;

    const show = (n) => {
      i = n; const p = PH[n];
      VALVES.forEach(v => $(v).classList.toggle('open', p.open.includes(v)));
      FLOWS.forEach(f => $(f).classList.toggle('on', p.flow.includes(f)));
      $('gA').style.transform = `rotate(${p.g[0]}deg)`;
      $('gB').style.transform = `rotate(${p.g[1]}deg)`;
      $('satA').style.transform = `scaleY(${p.sat[0] ? .78 : .04})`;
      $('satB').style.transform = `scaleY(${p.sat[1] ? .78 : .04})`;
      $('num').textContent = `0${n + 1} / 04`;
      $('title').textContent = p.t;
      $('l1').textContent = p.l[0]; $('l2').textContent = p.l[1];
      steps.forEach((b, k) => b.setAttribute('aria-pressed', String(k === n)));
      live.textContent = `Step ${n + 1} of 4: ${p.t}. ${p.l.join(' ')}`;
    };
    const schedule = () => {
      clearTimeout(timer);
      if (running && visible) timer = setTimeout(() => { show((i + 1) % PH.length); schedule(); }, PH[i].dur);
    };
    const setRunning = (r) => {
      running = r; root.classList.toggle('paused', !r);
      play.setAttribute('aria-pressed', String(r)); play.textContent = r ? 'Pause' : 'Play';
      schedule();
    };
    steps.forEach((b, k) => b.addEventListener('click', () => { show(k); setRunning(false); }));
    play.addEventListener('click', () => setRunning(!running));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting && !root.closest('[hidden]'); schedule(); }, { threshold: .2 }).observe(root);
    }
    root.addEventListener('psa:show', () => { visible = true; schedule(); });
    show(0); setRunning(running);
  });

  // Homepage hero: switch between the compressor GA and the PSA animation
  const tabs = document.querySelectorAll('[data-ga-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    const want = t.dataset.gaTab;
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    document.querySelectorAll('[data-ga-panel]').forEach(p => {
      const on = p.dataset.gaPanel === want;
      p.hidden = !on;
      if (on) p.querySelector('[data-psa]')?.dispatchEvent(new Event('psa:show'));
    });
    const cap = document.querySelector('[data-ga-cap]');
    if (cap) cap.textContent = want === 'psa' ? 'Fig. 2 — Twin-tower PSA nitrogen, working principle' : 'Fig. 1 — Typical skid-mounted package, elevation';
  }));
})();

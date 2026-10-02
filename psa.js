/* Working-principle animations (PSA nitrogen, integrally geared compressor) — original drawings */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generic step player: phases [{t, l:[line1,line2], dur}], apply(phase) draws the state
  const stepper = (root, prefix, PH, apply) => {
    const $ = id => root.querySelector(`#${prefix}-${id}`);
    const steps = [...root.querySelectorAll('[data-step]')];
    const play = root.querySelector('.psa-play');
    const live = root.querySelector('.psa-live');
    let i = 0, timer = null, running = !reduce, visible = true;
    const show = (n) => {
      i = n; const p = PH[n];
      apply(p, $);
      $('num').textContent = `0${n + 1} / 0${PH.length}`;
      $('title').textContent = p.t;
      $('l1').textContent = p.l[0]; $('l2').textContent = p.l[1];
      steps.forEach((b, k) => b.setAttribute('aria-pressed', String(k === n)));
      live.textContent = `Step ${n + 1} of ${PH.length}: ${p.t}. ${p.l.join(' ')}`;
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
    root.addEventListener('anim:show', () => { visible = true; schedule(); });
    show(0); setRunning(running);
  };

  // ---------- PSA ----------
  const PSA = [
    { t: 'Tower A on line', dur: 5200, open: ['v1', 'v3', 'v6'], flow: ['fAin', 'fAbed1', 'fAbed2', 'fAout', 'fBexh'], g: [55, -55], sat: [1, 0],
      l: ['Air enters Tower A. The carbon molecular sieve adsorbs O₂ and lets N₂ pass', 'to the buffer. Tower B vents O₂-rich gas through the silencer and regenerates.'] },
    { t: 'Pressure equalisation', dur: 2200, open: ['v7'], flow: ['fEqAB'], g: [0, 0], sat: [1, 0],
      l: ['Inlet, outlet and exhaust valves close. V7 links the tower tops so Tower A', 'shares its pressure with Tower B, saving compressed air before switchover.'] },
    { t: 'Tower B on line', dur: 5200, open: ['v2', 'v4', 'v5'], flow: ['fBin', 'fBbed1', 'fBbed2', 'fBout', 'fAexh'], g: [-55, 55], sat: [0, 1],
      l: ['Towers swap roles: Tower B now produces N₂ to the buffer while Tower A', 'depressurises to atmosphere and releases the adsorbed O₂.'] },
    { t: 'Pressure equalisation', dur: 2200, open: ['v7'], flow: ['fEqBA'], g: [0, 0], sat: [0, 1],
      l: ['V7 opens again, this time from Tower B to Tower A, and the cycle repeats.', 'The buffer smooths delivery so the user sees steady flow and purity.'] },
  ];
  const PV = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'];
  const PF = ['fAin', 'fAbed1', 'fAbed2', 'fAout', 'fBexh', 'fBin', 'fBbed1', 'fBbed2', 'fBout', 'fAexh', 'fEqAB', 'fEqBA'];
  document.querySelectorAll('[data-psa]').forEach(root => stepper(root, 'psa', PSA, (p, $) => {
    PV.forEach(v => $(v).classList.toggle('open', p.open.includes(v)));
    PF.forEach(f => $(f).classList.toggle('on', p.flow.includes(f)));
    $('gA').style.transform = `rotate(${p.g[0]}deg)`;
    $('gB').style.transform = `rotate(${p.g[1]}deg)`;
    $('satA').style.transform = `scaleY(${p.sat[0] ? .78 : .04})`;
    $('satB').style.transform = `scaleY(${p.sat[1] ? .78 : .04})`;
  }));

  // ---------- C-03 · 4-stage integrally geared NG compressor ----------
  const F1 = ['fIn', 'fS1', 'fIC1', 'fToS2'], F2 = ['fS2', 'fIC2', 'fToS3'], F3 = ['fS3', 'fIC3', 'fToS4'], F4 = ['fS4', 'fAC', 'fOut'];
  const IGC = [
    { t: 'Drive', dur: 4200, flow: [], fv: false, hl: ['motor', 'bull'],
      l: ['The HV motor turns the bull gear. The bull gear drives two high-speed pinions,', 'each with an impeller on both ends: four stages in one integral gearbox.'] },
    { t: 'Stage 1 → intercooler 1', dur: 4400, flow: F1, fv: false, hl: ['s1', 's2'],
      l: ['Natural gas enters stage 1 at 13.21 bar(a) and 25 °C. The air-cooled fin-fan', 'intercooler removes the heat of compression before stage 2.'] },
    { t: 'Stage 2 → intercooler 2', dur: 4400, flow: [...F1, ...F2], fv: false, hl: ['s2', 's3'],
      l: ['Stage 2, on the other end of pinion 1, compresses the cooled gas again;', 'intercooler 2 cools it before it crosses to pinion 2.'] },
    { t: 'Stage 3 → intercooler 3', dur: 4400, flow: [...F1, ...F2, ...F3], fv: false, hl: ['s3', 's4'],
      l: ['Stage 3 raises the pressure further and intercooler 3 cools the gas', 'ahead of the final stage.'] },
    { t: 'Stage 4 → after cooler → discharge', dur: 5000, flow: [...F1, ...F2, ...F3, ...F4], fv: false, hl: ['s4'],
      l: ['Stage 4 delivers 50.8 bar(a) through the air-cooled after cooler. Dry gas seals', 'on every impeller shaft keep the gas inside the casing.'] },
    { t: 'Anti-surge recycle', dur: 5000, flow: [...F1, ...F2, ...F3, ...F4, 'fRc'], fv: true, hl: [],
      l: ['At low flow the anti-surge valve opens and returns gas through the fin-fan', 'recycle cooler to suction, keeping every stage away from surge.'] },
  ];
  const IF = ['fIn', 'fS1', 'fIC1', 'fToS2', 'fS2', 'fIC2', 'fToS3', 'fS3', 'fIC3', 'fToS4', 'fS4', 'fAC', 'fOut', 'fRc'];
  const IH = ['motor', 'bull', 's1', 's2', 's3', 's4'];
  document.querySelectorAll('[data-igc]').forEach(root => stepper(root, 'igc', IGC, (p, $) => {
    IF.forEach(f => $(f).classList.toggle('on', p.flow.includes(f)));
    IH.forEach(h => $(h).classList.toggle('hl', p.hl.includes(h)));
    $('fv').classList.toggle('open', p.fv);
  }));

  // Homepage hero: switch between drawings
  const caps = {
    ga: 'Fig. 3 — Typical skid-mounted package, elevation',
    igc: 'Fig. 1 — C-03 4-stage integrally geared NG compressor, working principle',
    psa: 'Fig. 2 — Twin-tower PSA nitrogen, working principle',
  };
  const tabs = document.querySelectorAll('[data-ga-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    const want = t.dataset.gaTab;
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    document.querySelectorAll('[data-ga-panel]').forEach(p => {
      const on = p.dataset.gaPanel === want;
      p.hidden = !on;
      if (on) p.querySelector('[data-psa],[data-igc]')?.dispatchEvent(new Event('anim:show'));
      if (on && want === 'ga') { const s = p.querySelector('svg'); if (s) s.replaceWith(s.cloneNode(true)); }
    });
    const cap = document.querySelector('[data-ga-cap]');
    if (cap) cap.textContent = caps[want];
  }));
})();

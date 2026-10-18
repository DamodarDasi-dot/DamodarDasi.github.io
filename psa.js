/* Working-principle animations (fuel units) — original drawings */
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
    // prev / next / reset (added to every drawing's control bar)
    const bar = document.createElement('div'); bar.className = 'psa-nav';
    const mk = (lab, aria, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = lab; b.setAttribute('aria-label', aria); b.addEventListener('click', fn); bar.appendChild(b); return b; };
    mk('◀', 'Previous step', () => { show((i - 1 + PH.length) % PH.length); setRunning(false); });
    mk('▶', 'Next step', () => { show((i + 1) % PH.length); setRunning(false); });
    mk('↺', 'Reset to first step', () => { show(0); setRunning(false); });
    play.parentNode.insertBefore(bar, play);
    root.addEventListener('keydown', e => {
      if (e.target.closest('button') && !e.target.closest('.psa-ctrl')) return;
      if (e.key === 'ArrowRight') { show((i + 1) % PH.length); setRunning(false); }
      if (e.key === 'ArrowLeft') { show((i - 1 + PH.length) % PH.length); setRunning(false); }
    });
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

  // ---------- Fuel units (F-01, F-07) ----------
  const COMP = {
    f07: [
      { t: 'Loading the tank', dur: 5000, flow: ['fLoad', 'fVR'], open: ['lv', 'flt'], hl: ['tkr', 'lp'],
        l: ['A road tanker loads the tank through the loading pump; displaced vapour', 'returns to the tanker through the vapour-recovery line.'] },
      { t: 'Intelligent tank gauging', dur: 4600, flow: ['fATG', 'fCloud'], open: ['lv', 'flt'], hl: ['cld'],
        l: ['The intelligent ATG reports fuel level, temperature, density, water presence', 'and leak status to the fleet-management system in real time.'] },
      { t: 'Driver & vehicle authorisation', dur: 4600, flow: ['fATG', 'fCloud'], open: ['lv', 'flt'], hl: ['idr', 'car', 'cld'],
        l: ['The driver authenticates at the dispenser (card / PIN) and the vehicle is', 'recognised automatically at the nozzle before any fuel is released.'] },
      { t: 'Dispensing', dur: 5400, flow: ['fDisp', 'fHose', 'fATG'], open: [], hl: ['disp', 'car'],
        l: ['Fuel flows from the dispensing line through the dispenser meter, hose and', 'nozzle into the authorised vehicle.'] },
      { t: 'Real-time records', dur: 4400, flow: ['fCloud', 'fATG'], open: [], hl: ['cld'],
        l: ['Each transaction (driver, vehicle, litres, time) is sent to the fleet platform,', 'giving real-time history and audit-ready reports.'] },
      { t: 'Venting & drain', dur: 4400, flow: ['fVent', 'fDrain'], open: ['drv'], hl: [],
        l: ['Emergency and interstitial emergency vents protect the double-wall tank;', 'the drain line removes water and sludge from the tank bottom.'] },
    ],
    f01: [
      { t: 'Bulk filling', dur: 5200, flow: ['fFill', 'fVR'], open: ['ofv', 'lv', 'flt'], hl: ['tkr'],
        l: ['A road tanker fills the compartment through the 3 in fill point and the overfill', 'protection valve; displaced vapour returns through the vapour-recovery line.'] },
      { t: 'Level & leak monitoring', dur: 4400, flow: ['fATG', 'fLeak'], open: ['lv', 'flt'], hl: [],
        l: ['The ATG probe and console track the fuel level, and interstitial leak sensing', 'watches the space between the 6 mm inner and outer tank walls.'] },
      { t: 'Dispensing', dur: 5600, flow: ['fProd', 'fHose', 'fATG'], open: [], hl: ['stp', 'disp', 'car'],
        l: ['The submersible turbine pump sends fuel through the 2 in product line to the', 'dispenser (meter, filter) and through the hose and nozzle to the vehicle.'] },
      { t: 'Breathing & emergency venting', dur: 4400, flow: ['fVent'], open: [], hl: [],
        l: ['Breather vents handle normal tank breathing; emergency vents relieve pressure', 'in a fire. Design pressure 7 kPa, leak test 21 kPa.'] },
      { t: 'Safety systems', dur: 4600, flow: ['fATG', 'fLeak'], open: [], hl: [],
        l: ['Explosion-proof control panel and lighting, static earthing, spill tray and drain,', '75 mm fire-guard insulation (2 h) and fire-safety equipment complete the unit.'] },
    ],
  };
  document.querySelectorAll('[data-comp]').forEach(root => {
    const key = root.dataset.comp, PH = COMP[key];
    if (!PH) return;
    const all = k => [...new Set(PH.flatMap(p => p[k]))];
    const F = all('flow'), O = all('open'), HL = all('hl');
    stepper(root, key, PH, (p, $) => {
      F.forEach(f => $(f)?.classList.toggle('on', p.flow.includes(f)));
      O.forEach(v => $(v)?.classList.toggle('open', p.open.includes(v)));
      HL.forEach(h => $(h)?.classList.toggle('hl', p.hl.includes(h)));
    });
  });

  // Homepage hero: switch between drawings
  const caps = {
    ga: 'Fig. 3 — Typical skid-mounted package, elevation',
    psa: 'Fig. 2 — Twin-tower PSA nitrogen, working principle',
  };
  const tabs = document.querySelectorAll('[data-ga-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    const want = t.dataset.gaTab;
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    document.querySelectorAll('[data-ga-panel]').forEach(p => {
      const on = p.dataset.gaPanel === want;
      p.hidden = !on;
      if (on) p.querySelector('[data-psa],[data-comp]')?.dispatchEvent(new Event('anim:show'));
      if (on && want === 'ga') { const s = p.querySelector('svg'); if (s) s.replaceWith(s.cloneNode(true)); }
    });
    const cap = document.querySelector('[data-ga-cap]');
    if (cap) cap.textContent = caps[want];
  }));
})();

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

  // ---------- Compressor packages (C-03, C-04, C-05) ----------
  const cum = (...g) => g.flat();
  const C3 = [['fIn', 'fS1', 'fIC1', 'fToS2'], ['fS2', 'fIC2', 'fToS3'], ['fS3', 'fIC3', 'fToS4'], ['fS4', 'fAC', 'fOut']];
  const C5 = [['fIn'], ['fS1', 'fIC1', 'fToS2'], ['fS2', 'fIC2', 'fToS3'], ['fS3']];
  const tr = m => [[`f${m}in`, `f${m}12`, `f${m}23`, `f${m}3`, `f${m}wi`], [`f${m}c`, `f${m}out`]];
  const C4M = tr('M'), C4B = tr('B'), C4E = ['fOff', 'fE21', 'fEout'];
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
    c01: [
      { t: 'Drive', dur: 4200, flow: [], open: [], hl: ['motor', 's1', 's2', 's3', 'ex'],
        l: ['The motor turns the bull gear. Two high-speed pinions carry three compressor', 'stages and one expander stage: a compander in a single integral gearbox.'] },
      { t: 'Stage 1 → intercooler 1', dur: 4400, flow: ['fIn', 'fS1', 'fIC1', 'fToS2'], open: [], hl: ['s1'],
        l: ['Nitrogen enters stage 1 at 7.4 bar(a). The water-cooled intercooler removes', 'the heat of compression before stage 2.'] },
      { t: 'Stage 2 → intercooler 2', dur: 4400, flow: ['fIn', 'fS1', 'fIC1', 'fToS2', 'fS2', 'fIC2', 'fToS3'], open: [], hl: ['s2'],
        l: ['Stage 2 compresses the cooled nitrogen again and intercooler 2 cools it', 'before it crosses to pinion 2.'] },
      { t: 'Stage 3 → after cooler → discharge', dur: 4800, flow: ['fIn', 'fS1', 'fIC1', 'fToS2', 'fS2', 'fIC2', 'fToS3', 'fS3', 'fAC', 'fOut'], open: [], hl: ['s3'],
        l: ['Stage 3 delivers 35.3 bar(a) through the water-cooled after cooler. Tandem', 'dry gas seals on every shaft end keep the nitrogen in the casings.'] },
      { t: 'Expander stage', dur: 4800, flow: ['fIn', 'fS1', 'fIC1', 'fToS2', 'fS2', 'fIC2', 'fToS3', 'fS3', 'fAC', 'fOut', 'fEin', 'fEout'], open: [], hl: ['ex'],
        l: ['The expander on pinion 2 lets gas down to about 7.9 bar(a) and feeds its', 'power back into the gear train, cutting the motor load.'] },
      { t: 'Anti-surge recycle', dur: 4800, flow: ['fIn', 'fS1', 'fIC1', 'fToS2', 'fS2', 'fIC2', 'fToS3', 'fS3', 'fAC', 'fOut', 'fEin', 'fEout', 'fRc'], open: ['fv'], hl: [],
        l: ['At low flow the anti-surge valve opens and returns cooled discharge gas to', 'suction, keeping the compressor stages away from surge.'] },
    ],
    c02: [
      { t: 'Drive', dur: 4200, flow: ['fLo', 'fLr', 'fLc'], open: [], hl: ['motor', 's1'],
        l: ['The HV motor drives the bull gear, which spins one high-speed pinion', 'carrying the single impeller. All on one base frame.'] },
      { t: 'BOG inlet & throttle valve', dur: 4400, flow: ['fLo', 'fLr', 'fLc', 'fIn'], open: ['itv'], hl: ['s1'],
        l: ['Boil-off gas arrives at 1.05 bar(a) and −158.3 °C through the isolation', 'valve and strainer. The inlet throttle valve sets the flow.'] },
      { t: 'Compression → discharge', dur: 4400, flow: ['fLo', 'fLr', 'fLc', 'fIn', 'fOut'], open: ['itv'], hl: [],
        l: ['The single stage lifts the gas to 1.67 bar(a); it leaves through the check', 'valve to the plant.'] },
      { t: 'Dry gas seal · N₂', dur: 4600, flow: ['fLo', 'fLr', 'fLc', 'fIn', 'fOut', 'fSg'], open: ['itv', 'pcv'], hl: [],
        l: ['Clean, dry nitrogen at minimum 4 barg passes twin filters and a pressure', 'control valve to the dry gas seal, keeping the cold BOG in the casing.'] },
      { t: 'Lube oil', dur: 4600, flow: ['fLo', 'fLr', 'fLc', 'fIn', 'fOut', 'fSg'], open: ['itv', 'pcv'], hl: [],
        l: ['The lube-oil console (main and auxiliary pumps, filter) feeds the gearbox and', 'bearings; an air-cooled fan cooler rejects the oil heat.'] },
      { t: 'Anti-surge recycle', dur: 4800, flow: ['fLo', 'fLr', 'fLc', 'fIn', 'fOut', 'fSg', 'fRc'], open: ['itv', 'pcv', 'fv'], hl: [],
        l: ['At low flow the anti-surge valve opens and returns gas to suction,', 'downstream of the inlet throttle valve.'] },
    ],
    c03: [
      { t: 'Drive', dur: 4200, flow: [], open: [], hl: ['motor', 's1', 's2', 's3', 's4'],
        l: ['The HV motor turns the bull gear. The bull gear drives two high-speed pinions,', 'each with an impeller on both ends: four stages in one integral gearbox.'] },
      { t: 'Stage 1 → intercooler 1', dur: 4400, flow: cum(C3[0]), open: [], hl: ['s1', 's2'],
        l: ['Natural gas enters stage 1 at 13.21 bar(a) and 25 °C. The air-cooled fin-fan', 'intercooler removes the heat of compression before stage 2.'] },
      { t: 'Stage 2 → intercooler 2', dur: 4400, flow: cum(C3[0], C3[1]), open: [], hl: ['s2', 's3'],
        l: ['Stage 2, on the other end of pinion 1, compresses the cooled gas again;', 'intercooler 2 cools it before it crosses to pinion 2.'] },
      { t: 'Stage 3 → intercooler 3', dur: 4400, flow: cum(C3[0], C3[1], C3[2]), open: [], hl: ['s3', 's4'],
        l: ['Stage 3 raises the pressure further and intercooler 3 cools the gas', 'ahead of the final stage.'] },
      { t: 'Stage 4 → after cooler → discharge', dur: 5000, flow: cum(...C3), open: [], hl: ['s4'],
        l: ['Stage 4 delivers 50.8 bar(a) through the air-cooled after cooler. Dry gas seals', 'on every impeller shaft keep the gas inside the casing.'] },
      { t: 'Anti-surge recycle', dur: 5000, flow: cum(...C3, ['fRc']), open: ['fv'], hl: [],
        l: ['At low flow the anti-surge valve opens and returns gas through the fin-fan', 'recycle cooler to suction, keeping every stage away from surge.'] },
    ],
    c04: [
      { t: 'Drives', dur: 4200, flow: [], open: [], hl: ['motM', 'motB'],
        l: ['The MAC has its own motor. The BAC and the two-stage expander (ETB) share', 'one double-ended common motor. Everything sits on a common platform.'] },
      { t: 'MAC · three stages', dur: 4400, flow: cum(C4M[0]), open: [], hl: ['m1', 'm2', 'm3'],
        l: ['Air at 0.95 bar(a) and 28.2 °C passes the filter-silencer into three integrally', 'geared stages, with water injection between stages (customer scope).'] },
      { t: 'MAC → gas cooler → discharge', dur: 4400, flow: cum(...C4M), open: [], hl: [],
        l: ['The water-cooled gas cooler takes out the heat of compression and the MAC', 'discharges at 5.35 bar(a) through its own line to the H₂O₂ process.'] },
      { t: 'BAC · separate train', dur: 4600, flow: cum(...C4M, ...C4B), open: [], hl: ['b1', 'b2', 'b3'],
        l: ['The BAC is an identical but separate train: its own stages, gas cooler', 'and discharge line. The two trains are never combined.'] },
      { t: 'ETB energy recovery', dur: 5200, flow: cum(...C4M, ...C4B, C4E), open: [], hl: ['e1', 'e2', 'motB'],
        l: ['Process off-gas at 3.42 bar(a) and 372.15 K expands through E2 and E1 to', '1.15 bar(a) and 283.5 K, returning power to the shared motor shaft.'] },
      { t: 'Blow-off / anti-surge', dur: 4800, flow: cum(...C4M, ...C4B, C4E, ['fMbo', 'fBbo']), open: ['bovMAC', 'bovBAC'], hl: [],
        l: ['At low demand each train opens its own blow-off valve ahead of the gas', 'cooler, keeping the stages out of surge.'] },
    ],
    c05: [
      { t: 'Drive', dur: 4400, flow: [], open: [], hl: ['st'],
        l: ['A customer-supplied steam turbine turns the bull gear through the coupling.', 'My scope ends at the compressor-side coupling.'] },
      { t: 'Inlet & inlet guide vanes', dur: 4200, flow: cum(C5[0]), open: ['igv'], hl: ['s1'],
        l: ['Air at 0.989 bar(a) and 40 °C enters through the filter-silencer house and', 'the inlet guide vanes, which trim the flow to match plant demand.'] },
      { t: 'Stage 1 → intercooler 1', dur: 4400, flow: cum(C5[0], C5[1]), open: ['igv'], hl: ['s2'],
        l: ['Stage 1 raises pressure and temperature. Water-cooled intercooler 1', '(cooling water 33 → 43 °C) removes the heat before stage 2.'] },
      { t: 'Stage 2 → intercooler 2', dur: 4400, flow: cum(C5[0], C5[1], C5[2]), open: ['igv'], hl: ['s3'],
        l: ['Stage 2 on the other end of pinion 1 compresses again, and intercooler 2', 'cools the air before the last stage on pinion 2.'] },
      { t: 'Stage 3 → discharge', dur: 4800, flow: cum(...C5), open: ['igv'], hl: [],
        l: ['Stage 3 delivers 6.013 bar(a) at 91.2 °C. The shaft-driven main oil pump on', 'the bull gear keeps the bearings fed while the machine runs.'] },
      { t: 'Blow-off', dur: 4800, flow: cum(...C5, ['fBo']), open: ['igv', 'bov'], hl: [],
        l: ['At low demand the blow-off valve opens and vents air through the silencer,', 'keeping the stages away from surge.'] },
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
      if (on) p.querySelector('[data-psa],[data-comp]')?.dispatchEvent(new Event('anim:show'));
      if (on && want === 'ga') { const s = p.querySelector('svg'); if (s) s.replaceWith(s.cloneNode(true)); }
    });
    const cap = document.querySelector('[data-ga-cap]');
    if (cap) cap.textContent = caps[want];
  }));
})();

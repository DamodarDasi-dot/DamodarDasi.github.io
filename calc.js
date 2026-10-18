/* Quick engineering tools: tank volume, pipe velocity, gas flow conversion */
(() => {
  const root = document.querySelector('[data-calc]'); if (!root) return;
  const $ = (f, n) => f.elements[n];
  const num = v => { const x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : NaN; };
  const fmt = (x, d = 0) => isFinite(x) ? x.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '–';
  const out = (f, k, v) => { const el = f.querySelector(`[data-o="${k}"]`); if (el) el.textContent = v; };
  const track = name => { if (typeof gtag === 'function' && !track[name]) { track[name] = 1; gtag('event', 'calculator_use', { tool: name }); } };

  /* tabs */
  const tabs = [...root.querySelectorAll('[role=tab]')];
  const pick = (t, focus) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => { const m = { ArrowRight: k + 1, ArrowLeft: k - 1 }[e.key]; if (m === undefined) return; e.preventDefault(); pick(tabs[(m + tabs.length) % tabs.length], true); });
  });

  /* 1. tank volume */
  const ft = root.querySelector('#cp-tank form');
  const HEAD = { se: d => Math.PI * d ** 3 / 24, fd: d => 0.0809 * d ** 3, hs: d => Math.PI * d ** 3 / 12, flat: () => 0 };
  const DEPTH = { se: d => d / 4, fd: d => 0.169 * d, hs: d => d / 2, flat: () => 0 };
  function tank() {
    const d = num($(ft, 'd').value) / 1000, l = num($(ft, 'l').value) / 1000, h = $(ft, 'h').value, f = Math.min(100, Math.max(0, num($(ft, 'f').value)));
    if (!(d > 0) || !(l >= 0)) return;
    const vs = Math.PI / 4 * d * d * l, vh = HEAD[h](d), v = vs + 2 * vh;
    out(ft, 'v', fmt(v * 1000)); out(ft, 'vs', fmt(vs * 1000) + ' L'); out(ft, 'vh', fmt(vh * 1000) + ' L');
    out(ft, 'vf', fmt(v * 1000 * f / 100) + ' L'); out(ft, 'm', fmt(v * f / 100 * 1000) + ' kg');
    // mini sketch: horizontal outline to scale
    const dep = DEPTH[h](d), L = l + 2 * dep, sc = Math.min(200 / L, 70 / d), w = L * sc, hh = d * sc, x0 = (220 - w) / 2, y0 = (90 - hh) / 2, e = dep * sc;
    const p = h === 'flat' ? `M${x0} ${y0}h${w}v${hh}h${-w}z`
      : `M${x0 + e} ${y0}h${w - 2 * e}a${e} ${hh / 2} 0 0 1 0 ${hh}h${-(w - 2 * e)}a${e} ${hh / 2} 0 0 1 0 ${-hh}z`;
    ft.querySelector('.tk-o').setAttribute('d', p);
    const r = ft.querySelector('.tk-l'); r.setAttribute('x', x0); r.setAttribute('width', w); r.setAttribute('y', y0 + hh * (1 - f / 100)); r.setAttribute('height', hh * f / 100);
    r.setAttribute('clip-path', 'url(#calc-clip)');
    let cp = ft.querySelector('#calc-clip'); if (!cp) { const svg = ft.querySelector('svg'); svg.insertAdjacentHTML('afterbegin', '<defs><clipPath id="calc-clip"><path/></clipPath></defs>'); cp = ft.querySelector('#calc-clip'); }
    cp.firstElementChild.setAttribute('d', p);
  }
  ft.addEventListener('input', () => { tank(); track('tank'); }); tank();

  /* 2. pipe velocity */
  const fp = root.querySelector('#cp-pipe form');
  const IDS = [...$(fp, 'id').options].map(o => [+o.value, o.textContent.split(' · ')[0]]);
  const RANGE = { liq: [1, 3], gas: [10, 25] };
  function pipe() {
    const q = num($(fp, 'q').value) * num($(fp, 'u').value) / 3600, id = num($(fp, 'id').value) / 1000, s = $(fp, 's').value;
    if (!(q >= 0) || !(id > 0)) return;
    const a = Math.PI / 4 * id * id, v = q / a, [lo, hi] = RANGE[s];
    out(fp, 'vel', fmt(v, v < 10 ? 2 : 1)); out(fp, 'rng', `${lo}–${hi} m/s for ${s === 'liq' ? 'liquid lines' : 'gas lines'}`);
    const sug = IDS.find(([d]) => q / (Math.PI / 4 * (d / 1000) ** 2) <= hi);
    out(fp, 'sug', sug ? sug[1] : 'Larger than DN300');
    const max = hi * 1.6, bar = fp.querySelector('[data-o="bar"]'), band = fp.querySelector('[data-o="band"]');
    bar.style.transform = `scaleX(${Math.min(1, v / max)})`;
    bar.className = v < lo ? 'low' : v > hi ? 'high' : 'ok';
    band.style.left = (lo / max * 100) + '%'; band.style.width = ((hi - lo) / max * 100) + '%';
  }
  fp.addEventListener('input', () => { pipe(); track('pipe'); }); pipe();

  /* 3. gas flow */
  const fg = root.querySelector('#cp-gas form'); let qa = NaN;
  function gas() {
    const qn = num($(fg, 'qn').value), p = num($(fg, 'p').value), t = num($(fg, 't').value), rho = num($(fg, 'g').value);
    if (!(qn >= 0) || !(p > -1.01325)) return;
    const pa = p + 1.01325, ratio = (1.01325 / pa) * ((t + 273.15) / 273.15);
    qa = qn * ratio;
    out(fg, 'qa', fmt(qa, qa < 100 ? 1 : 0)); out(fg, 'mf', fmt(qn * rho, 1) + ' kg/h'); out(fg, 'r', '1 Nm³ = ' + fmt(ratio, 3) + ' m³ at line');
  }
  fg.addEventListener('input', () => { gas(); track('gas'); }); gas();
  fg.querySelector('.calc-send').addEventListener('click', () => {
    $(fp, 'q').value = +qa.toFixed(2); $(fp, 'u').value = '1'; $(fp, 's').value = 'gas'; pipe(); pick(tabs[1], true); track('gas_to_pipe');
  });
})();

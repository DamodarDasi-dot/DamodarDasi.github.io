/* Interactive 3D model of the S-01 6,000 L filter vessel, built from the GA dimensions (simplified). */
import * as THREE from './assets/vendor/three/three.module.min.js';
import { OrbitControls } from './assets/vendor/three/OrbitControls.js';

export function mount(host) {
  const stage = host.querySelector('.v3d-stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const HOME = { pos: new THREE.Vector3(6.2, 3.6, 6.4), target: new THREE.Vector3(0, 1.95, 0) };
  camera.position.copy(HOME.pos);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target); controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 3; controls.maxDistance = 16; controls.maxPolarAngle = Math.PI * 0.55;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.9;

  scene.add(new THREE.HemisphereLight(0xf2f7fb, 0x8a9aa8, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbcd7ee, 0.6); fill.position.set(-6, 3, -4); scene.add(fill);

  const cut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);   // section plane x = 0
  const clip = [];
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.35, roughness: 0.55, side: THREE.DoubleSide, clippingPlanes: clip, ...o });
  const M = { shell: mat(0xd5dde5), inner: mat(0x9fb6c9, { side: THREE.BackSide }), steel: mat(0x7d8b99), flange: mat(0x5c6b79), accent: mat(0x0369a1, { metalness: 0.2 }) };

  const g = new THREE.Group(); scene.add(g);
  const RO = 0.908, T = 0.008, RI = RO - T, YB = 1.65, YT = 3.45, HD = RO / 2;   // m: OD, wall, tangent lines, 2:1 head depth
  // shell (outer + inner face so the section shows wall and interior)
  const shellO = new THREE.Mesh(new THREE.CylinderGeometry(RO, RO, YT - YB, 96, 1, true), M.shell); shellO.position.y = (YB + YT) / 2; g.add(shellO);
  const shellI = new THREE.Mesh(new THREE.CylinderGeometry(RI, RI, YT - YB, 96, 1, true), M.inner); shellI.position.y = shellO.position.y; g.add(shellI);
  // 2:1 ellipsoidal heads
  const head = (top) => {
    [[RO, M.shell], [RI, M.inner]].forEach(([r, m]) => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 32, 0, Math.PI * 2, 0, Math.PI / 2), m);
      h.scale.y = 0.5; h.position.y = top ? YT : YB; if (!top) h.rotation.x = Math.PI; g.add(h);
    });
  };
  head(true); head(false);
  // girth weld lines
  [YB, YT].forEach(y => { const w = new THREE.Mesh(new THREE.TorusGeometry(RO + 0.002, 0.006, 8, 96), M.steel); w.rotation.x = Math.PI / 2; w.position.y = y; g.add(w); });
  // 4 plate-type legs 200 x 10, base plates Ø300 x 15
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, top = 2.05;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, top, 0.012), M.steel);
    leg.position.set(Math.cos(a) * (RO + 0.008), top / 2, Math.sin(a) * (RO + 0.008)); leg.rotation.y = -a + Math.PI / 2; g.add(leg);
    const bp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 32), M.flange);
    bp.position.set(Math.cos(a) * (RO + 0.008), 0.0075, Math.sin(a) * (RO + 0.008)); g.add(bp);
  }
  // nozzles: pipe stub + flange (+ blind cover for manholes)
  const labels = [];
  const headY = (x, z, top) => { const r2 = (x * x + z * z) / (RO * RO); const y = HD * Math.sqrt(Math.max(0, 1 - r2)); return top ? YT + y : YB - y; };
  function nozzle(tag, name, p, dir, od, len, fod, manhole, lo) {
    const d = dir.clone().normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(od / 2, od / 2, len, 40), manhole ? M.steel : M.flange);
    pipe.quaternion.copy(q); pipe.position.copy(p).addScaledVector(d, len / 2 - 0.02); g.add(pipe);
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(fod / 2, fod / 2, manhole ? 0.04 : 0.025, 48), manhole ? M.accent : M.flange);
    fl.quaternion.copy(q); fl.position.copy(p).addScaledVector(d, len); g.add(fl);
    labels.push({ tag, name, at: p.clone().addScaledVector(d, len + 0.12).add(lo || new THREE.Vector3()) });
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  nozzle('N1', 'Inlet DN100', V(0, 3.15, RO), V(0, 0, 1), 0.114, 0.22, 0.229);
  nozzle('N2', 'Outlet DN100', V(0.25, headY(0.25, 0.2, false), 0.2), V(0.25, -1, 0.2), 0.114, 0.22, 0.229, false, V(0.45, 0.05, 0.2));
  nozzle('N3', 'Drain DN50', V(0, YB - HD, 0), V(0, -1, 0), 0.060, 0.2, 0.152, false, V(0, -0.35, 0));
  nozzle('N4', 'Vent DN25', V(-0.32, headY(-0.32, 0, true), 0), V(0, 1, 0), 0.0334, 0.18, 0.108, false, V(-0.35, 0, 0));
  nozzle('N5', 'Manhole DN600', V(0.36, headY(0.36, 0, true), 0), V(0.25, 1, 0), 0.61, 0.22, 0.78, true);
  nozzle('N6', 'Manhole DN500', V(-0.38, headY(-0.38, -0.1, false), -0.1), V(-0.3, -1, -0.08), 0.508, 0.2, 0.67, true, V(-0.45, 0.1, 0));
  nozzle('N7', 'Manhole DN450', V(RO, 2.55, 0), V(1, 0, 0), 0.457, 0.22, 0.6, true);
  // ground
  const grid = new THREE.GridHelper(8, 16, 0x9db4c6, 0xd2dde6); grid.material.transparent = true; grid.material.opacity = 0.6; scene.add(grid);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshBasicMaterial({ color: 0x0b2236, transparent: true, opacity: 0.08 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);

  // labels overlay
  const ov = document.createElement('div'); ov.className = 'v3d-labels'; stage.appendChild(ov);
  labels.forEach(l => { l.el = document.createElement('span'); l.el.innerHTML = `<b>${l.tag}</b> ${l.name}`; ov.appendChild(l.el); });
  const v = new THREE.Vector3();
  function place() {
    const w = stage.clientWidth, h = stage.clientHeight;
    labels.forEach(l => { v.copy(l.at).project(camera); l.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px,${(-v.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`; l.el.style.opacity = v.z < 1 ? '' : 0; });
  }
  function size() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(stage); size();

  // UI
  const ui = host.querySelector('.v3d-ui'); ui.hidden = false;
  const btn = n => ui.querySelector(`[data-v="${n}"]`);
  const setOn = (b, on) => b.setAttribute('aria-pressed', on);
  setOn(btn('spin'), controls.autoRotate); setOn(btn('labels'), true);
  btn('spin').onclick = () => { controls.autoRotate = !controls.autoRotate; setOn(btn('spin'), controls.autoRotate); };
  btn('labels').onclick = () => { const on = ov.classList.toggle('off'); setOn(btn('labels'), !on); };
  btn('section').onclick = () => { const on = !clip.length; clip.length = 0; if (on) clip.push(cut); Object.values(M).forEach(m => { m.clippingPlanes = clip; m.needsUpdate = true; }); setOn(btn('section'), on); };
  btn('reset').onclick = () => { camera.position.copy(HOME.pos); controls.target.copy(HOME.target); controls.update(); };
  renderer.domElement.addEventListener('pointerdown', () => { if (controls.autoRotate) { controls.autoRotate = false; setOn(btn('spin'), false); } }, { once: true });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  (function loop() { requestAnimationFrame(loop); if (!visible || document.hidden) return; controls.update(); renderer.render(scene, camera); place(); })();
  host.classList.add('live');
  if (typeof gtag === 'function') gtag('event', 'model3d_open', { model: 's01_filter_vessel' });
}

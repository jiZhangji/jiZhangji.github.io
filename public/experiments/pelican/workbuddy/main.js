import * as THREE from 'three';

/* =========================================================================
   0. 工具
   ========================================================================= */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt));
const rand = (a, b) => a + Math.random() * (b - a);
function hash1(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
function noise1(x) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash1(i), hash1(i + 1), u);
}
const C = (hex) => new THREE.Color(hex);

/* =========================================================================
   1. 轨道（海岸公路中心线）—— 巨大环形，曲率平缓
   ========================================================================= */
const TRACK = (() => {
  const pts = [], N = 18, R = 940;
  for (let i = 0; i < N; i++) {
    const a = i / N * TAU;
    const r = R + Math.sin(a * 2.7) * 140 + Math.cos(a * 4.3) * 72 + Math.sin(a * 7.1) * 26;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  const length = curve.getLength();
  const UP = new THREE.Vector3(0, 1, 0);
  const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _r = new THREE.Vector3();
  const frame = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 };
  function sample(s, out = frame) {
    const u = ((s % length) + length) % length / length;
    curve.getPointAt(u, _p); curve.getTangentAt(u, _t).normalize();
    _r.crossVectors(_t, UP).normalize();
    out.p.copy(_p); out.t.copy(_t); out.r.copy(_r); out.u = u;
    return out;
  }
  return { curve, length, sample, frame };
})();
const STATIONS = 420;
const U_STEP = TRACK.length / STATIONS;
function stationOf(s) { return (((s % TRACK.length) + TRACK.length) % TRACK.length) / U_STEP; }

/* 地形噪声：路面附近为 0，越远起伏越大 */
function terrainNoise(si, lat) {
  const amp = clamp((Math.abs(lat) - 26) / 130, 0, 1) * 16;
  if (amp <= 0) return 0;
  return amp * (noise1(si * 0.06 + lat * 0.021) - 0.5) * 2;
}
function profileY(section, lat) {
  if (lat <= section[0].lat) return section[0].y;
  for (let i = 0; i < section.length - 1; i++) {
    const a = section[i], b = section[i + 1];
    if (lat >= a.lat && lat <= b.lat) return lerp(a.y, b.y, (lat - a.lat) / (b.lat - a.lat));
  }
  return section[section.length - 1].y;
}

/* 扫掠成带：沿轨道把横截面拉成网格 */
function makeRibbon(section, opts = {}) {
  const stations = opts.stations || STATIONS;
  const K = section.length;
  const pos = new Float32Array((stations + 1) * K * 3);
  const uv = new Float32Array((stations + 1) * K * 2);
  const col = new Float32Array((stations + 1) * K * 3);
  const f = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 };
  let o = 0, o2 = 0;
  for (let i = 0; i <= stations; i++) {
    const s = i / stations * TRACK.length;
    TRACK.sample(s, f);
    const si = i / stations * STATIONS;
    for (let k = 0; k < K; k++) {
      const sec = section[k];
      const lat = sec.lat;
      const y = sec.y + (opts.flatten ? 0 : terrainNoise(si, lat) * (sec.nz === undefined ? 1 : sec.nz));
      pos[o] = f.p.x + f.r.x * lat; pos[o + 1] = f.p.y + y; pos[o + 2] = f.p.z + f.r.z * lat;
      uv[o2] = sec.u !== undefined ? sec.u : k / (K - 1); uv[o2 + 1] = i / stations;
      const cc = sec.color || WHITE;
      col[o] = cc.r; col[o + 1] = cc.g; col[o + 2] = cc.b;
      o += 3; o2 += 2;
    }
  }
  const idx = [];
  for (let i = 0; i < stations; i++)
    for (let k = 0; k < K - 1; k++) {
      const a = i * K + k, b = a + 1, c = a + K, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
const WHITE = new THREE.Color(1, 1, 1);

/* 自定义着色器共用的色调映射：与内置材质的 ACES + sRGB 输出保持一致 */
const TM_GLSL = `
uniform float uExposure;
vec3 acesTM(vec3 x){
  x *= uExposure;
  const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}
vec3 lin2srgb(vec3 c){
  c = clamp(c, 0.0, 4.0);
  return mix(c*12.92, 1.055*pow(c, vec3(0.4166667)) - 0.055, step(vec3(0.0031308), c));
}
vec3 outColor(vec3 c){ return lin2srgb(acesTM(c)); }
vec3 outRaw(vec3 c){ return lin2srgb(clamp(c,0.0,1.0)); }
`;

/* =========================================================================
   2. 渲染器 / 场景 / 相机
   ========================================================================= */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', stencil: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b1428, 0.0012);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.35, 14000);

/* =========================================================================
   3. 天空 / 星 / 日月 / 昼夜循环
   ========================================================================= */
const SKY_KEYS = [
  { p: 0.00, top: C(0x243a72), bot: C(0xff9a52), fog: C(0xd98a5c), sun: C(0xffb066), sunI: 2.7, amb: 0.44, hemi: 0.50, deep: C(0x14324e), shal: C(0x2f6f8e), star: 0.05, expo: 1.06, fogD: 0.00115 },
  { p: 0.09, top: C(0x1d2f5e), bot: C(0xe9743a), fog: C(0xa9663f), sun: C(0xff9440), sunI: 1.6, amb: 0.31, hemi: 0.38, deep: C(0x0f2338), shal: C(0x1e4c66), star: 0.24, expo: 1.00, fogD: 0.00135 },
  { p: 0.19, top: C(0x0e1a38), bot: C(0x4a3263), fog: C(0x242342), sun: C(0x6d6ba8), sunI: 0.66, amb: 0.31, hemi: 0.37, deep: C(0x081726), shal: C(0x0f2c3f), star: 0.80, expo: 0.94, fogD: 0.00185 },
  { p: 0.31, top: C(0x050a1a), bot: C(0x0e1a34), fog: C(0x0a1224), sun: C(0x9dc4ff), sunI: 1.10, amb: 0.29, hemi: 0.35, deep: C(0x04101d), shal: C(0x0a2233), star: 1.00, expo: 0.92, fogD: 0.00215 },
  { p: 0.45, top: C(0x071026), bot: C(0x18223e), fog: C(0x101a30), sun: C(0xa9c9ff), sunI: 0.98, amb: 0.31, hemi: 0.37, deep: C(0x061522), shal: C(0x0d2436), star: 0.88, expo: 0.95, fogD: 0.00200 },
  { p: 0.53, top: C(0x2a3f74), bot: C(0xf09a58), fog: C(0xb87b5e), sun: C(0xffb877), sunI: 2.0, amb: 0.33, hemi: 0.41, deep: C(0x103049), shal: C(0x246070), star: 0.22, expo: 1.04, fogD: 0.00140 },
  { p: 0.65, top: C(0x2f6bd8), bot: C(0xbfe0ff), fog: C(0xb2d0ec), sun: C(0xfff2dd), sunI: 3.1, amb: 0.60, hemi: 0.70, deep: C(0x10527c), shal: C(0x2ea0b4), star: 0.00, expo: 1.00, fogD: 0.00100 },
  { p: 0.79, top: C(0x2a63cf), bot: C(0xd4e9ff), fog: C(0xc2daf2), sun: C(0xffffff), sunI: 3.4, amb: 0.66, hemi: 0.78, deep: C(0x146089), shal: C(0x33b0c0), star: 0.00, expo: 1.00, fogD: 0.00095 },
  { p: 0.90, top: C(0x2b4f9e), bot: C(0xf6b177), fog: C(0xd8a482), sun: C(0xffc98a), sunI: 2.7, amb: 0.50, hemi: 0.60, deep: C(0x154568), shal: C(0x2c7f96), star: 0.04, expo: 1.03, fogD: 0.00120 },
  { p: 1.00, top: C(0x243a72), bot: C(0xff9a52), fog: C(0xd98a5c), sun: C(0xffb066), sunI: 2.7, amb: 0.44, hemi: 0.50, deep: C(0x14324e), shal: C(0x2f6f8e), star: 0.05, expo: 1.06, fogD: 0.00115 },
];
const PAL = {
  top: new THREE.Color(), bot: new THREE.Color(), fog: new THREE.Color(), sun: new THREE.Color(),
  deep: new THREE.Color(), shal: new THREE.Color(),
  sunI: 0, amb: 0, hemi: 0, star: 0, expo: 1, fogD: 0.0012
};
function paletteAt(phase) {
  let i = 0; while (i < SKY_KEYS.length - 2 && phase > SKY_KEYS[i + 1].p) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
  const t = clamp((phase - a.p) / (b.p - a.p), 0, 1);
  PAL.top.copy(a.top).lerp(b.top, t);
  PAL.bot.copy(a.bot).lerp(b.bot, t);
  PAL.fog.copy(a.fog).lerp(b.fog, t);
  PAL.sun.copy(a.sun).lerp(b.sun, t);
  PAL.deep.copy(a.deep).lerp(b.deep, t);
  PAL.shal.copy(a.shal).lerp(b.shal, t);
  PAL.sunI = lerp(a.sunI, b.sunI, t);
  PAL.amb = lerp(a.amb, b.amb, t);
  PAL.hemi = lerp(a.hemi, b.hemi, t);
  PAL.star = lerp(a.star, b.star, t);
  PAL.expo = lerp(a.expo, b.expo, t);
  PAL.fogD = lerp(a.fogD, b.fogD, t);
}

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: {
    uTop: { value: new THREE.Color() }, uBot: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 0, 1) },
    uHaze: { value: 1.0 }, uExposure: { value: 1.05 }
  },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform vec3 uTop,uBot,uSun,uSunDir; uniform float uHaze; varying vec3 vD;
    ${TM_GLSL}
    void main(){
      vec3 d = normalize(vD);
      float h = clamp(d.y*0.5+0.5, 0.0, 1.0);
      vec3 col = mix(uBot, uTop, smoothstep(0.02, 0.62, pow(h,1.05)));
      col = mix(col, uBot, uHaze * pow(1.0 - clamp(abs(d.y)*3.4,0.0,1.0), 4.0) * 0.55);
      float sd = max(dot(d, normalize(uSunDir)), 0.0);
      col += uSun * pow(sd, 900.0) * 2.4;
      col += uSun * pow(sd, 28.0) * 0.55;
      col += uSun * pow(sd, 3.2) * 0.14;
      gl_FragColor = vec4(outColor(col), 1.0);
    }`
});
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(6200, 32, 20), skyMat);
skyDome.frustumCulled = false; scene.add(skyDome);

/* 星空 */
const starGeo = new THREE.BufferGeometry();
{
  const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), siz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * TAU, v = Math.acos(rand(-0.15, 1));
    const r = 5300;
    pos[i * 3] = Math.sin(v) * Math.cos(u) * r; pos[i * 3 + 1] = Math.cos(v) * r; pos[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r;
    const t = Math.random();
    const c = new THREE.Color().setHSL(lerp(0.58, 0.09, Math.pow(t, 3)), 0.45, lerp(0.72, 1.0, Math.random()));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    siz[i] = rand(0.6, 2.4);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  starGeo.setAttribute('asize', new THREE.BufferAttribute(siz, 1));
}
const starMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uOpacity: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uTime: { value: 0 }, uExposure: { value: 1.05 } },
  vertexShader: `
    attribute float asize; varying vec3 vC; varying float vT; uniform float uPR,uTime;
    void main(){ vC = color; vT = asize;
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = asize * uPR * (1.0 + 0.45*sin(uTime*2.0 + position.x*0.01));
    }`,
  fragmentShader: `
    varying vec3 vC; varying float vT; uniform float uOpacity;
    ${TM_GLSL}
    void main(){ float d = length(gl_PointCoord - 0.5); if(d>0.5) discard;
      float a = smoothstep(0.5,0.06,d); gl_FragColor = vec4(outRaw(vC * a * uOpacity), 1.0); }`,
  vertexColors: true
});
const stars = new THREE.Points(starGeo, starMat);
stars.frustumCulled = false; scene.add(stars);

/* 太阳 / 月亮 + 光晕 */
function glowTex(inner, outer) {
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const g = cv.getContext('2d'), rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  rg.addColorStop(0, inner); rg.addColorStop(0.22, outer); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,240,210,1)', 'rgba(255,180,90,.55)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
sunGlow.scale.setScalar(640);
const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(235,245,255,1)', 'rgba(150,190,255,.42)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
moonGlow.scale.setScalar(520);
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(72, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffd9a0, fog: false }));
const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(58, 20, 14), new THREE.MeshBasicMaterial({ color: 0xe8f1ff, fog: false }));
scene.add(sunGlow, moonGlow, sunDisc, moonDisc);

/* 光照 */
const hemi = new THREE.HemisphereLight(0x8ab4ff, 0x2b2f24, 0.5); scene.add(hemi);
const amb = new THREE.AmbientLight(0x40506a, 0.3); scene.add(amb);
const sun = new THREE.DirectionalLight(0xffb066, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 420;
sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
sun.shadow.bias = -0.0012; sun.shadow.normalBias = 0.35;
scene.add(sun); scene.add(sun.target);
const rimLight = new THREE.DirectionalLight(0x88b6ff, 0.35); scene.add(rimLight); scene.add(rimLight.target);

/* =========================================================================
   4. 海浪（近处细分 + 远处平铺）
   ========================================================================= */
const WAVE_GLSL = `
vec3 waveField(vec2 p, float t, float detail){
  float h = 0.0; vec2 g = vec2(0.0);
  #define W(DX,DZ,L,A,S) { vec2 d = normalize(vec2(DX,DZ)); float k = 6.2831853/L; \
    float ph = k*dot(d,p) - S*k*t; h += A*sin(ph); g += A*k*cos(ph)*d; }
  W(1.0,0.32,47.0,0.62,5.4)
  W(0.72,0.86,26.0,0.34,6.6)
  if(detail > 0.5){
    W(-0.5,0.9,12.5,0.17,8.4)
    W(0.9,-0.42,6.2,0.085,10.5)
    W(0.35,0.94,3.1,0.042,13.0)
  }
  #undef W
  return vec3(h, g.x, g.y);
}`;

const oceanUniforms = {
  uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x14324e) }, uShal: { value: new THREE.Color(0x2f6f8e) },
  uSky: { value: new THREE.Color(0x9fc4e8) }, uLightDir: { value: new THREE.Vector3(0, 1, 0) },
  uLightCol: { value: new THREE.Color(0xffb066) }, uDetail: { value: 1 },
  uFogColor: { value: new THREE.Color(0x0b1428) }, uFogDensity: { value: 0.0012 },
  uNight: { value: 0 }, uFar: { value: 820 }, uExposure: { value: 1.05 }
};
const oceanMat = new THREE.ShaderMaterial({
  uniforms: oceanUniforms,
  vertexShader: `
    uniform float uTime,uDetail,uFar; varying vec3 vW; varying vec3 vN; varying float vH;
    ${WAVE_GLSL}
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      float d = length(wp.xz - cameraPosition.xz);
      float fade = 1.0 - smoothstep(uFar*0.60, uFar, d);
      vec3 w = waveField(wp.xz, uTime, uDetail);
      wp.y += w.x * fade;
      vH = w.x * fade;
      vN = normalize(vec3(-w.y*fade, 1.0, -w.z*fade));
      vW = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: `
    uniform vec3 uDeep,uShal,uSky,uLightCol,uLightDir,uFogColor; uniform float uFogDensity,uNight,uTime;
    varying vec3 vW; varying vec3 vN; varying float vH;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
    ${TM_GLSL}
    void main(){
      vec3 N = normalize(vN);
      vec3 V = normalize(cameraPosition - vW);
      float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 4.2);
      vec3 base = mix(uDeep, uShal, clamp(vH*0.30+0.48, 0.0, 1.0));
      vec3 col = mix(base, uSky, clamp(fres*0.92,0.0,0.92));
      vec3 L = normalize(uLightDir);
      vec3 H = normalize(L+V);
      float nh = max(dot(N,H), 0.0);
      col += uLightCol * pow(nh, 240.0) * 2.1;
      vec2 cell = floor(vW.xz*1.6) + floor(uTime*7.0)*0.37;
      col += uLightCol * pow(nh, 800.0) * (0.6 + h21(cell)*1.5);
      float foam = smoothstep(0.80, 1.22, vH);
      col = mix(col, mix(vec3(0.86,0.93,1.0), vec3(0.85,0.94,1.0)*(0.45+0.55*uNight*0.0), 0.0), foam*0.62);
      float d = length(cameraPosition - vW);
      float f = 1.0 - exp(-uFogDensity*uFogDensity*d*d);
      col = mix(col, uFogColor, clamp(f,0.0,1.0));
      gl_FragColor = vec4(outColor(col), 1.0);
    }`
});
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1700, 1700, 190, 190), oceanMat);
ocean.rotation.x = -Math.PI / 2; ocean.position.y = -3.5; ocean.frustumCulled = false; scene.add(ocean);

const oceanFarMat = new THREE.ShaderMaterial({
  uniforms: {
    uDeep: { value: new THREE.Color(0x14324e) }, uSky: { value: new THREE.Color(0x9fc4e8) },
    uFogColor: { value: new THREE.Color(0x0b1428) }, uFogDensity: { value: 0.0012 }, uExposure: { value: 1.05 }
  },
  vertexShader: `varying vec3 vW; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vW = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
  fragmentShader: `
    uniform vec3 uDeep,uSky,uFogColor; uniform float uFogDensity; varying vec3 vW;
    ${TM_GLSL}
    void main(){
      vec3 V = normalize(cameraPosition - vW);
      float fres = pow(1.0 - clamp(V.y,0.0,1.0), 3.0);
      vec3 col = mix(uDeep, uSky, clamp(fres*0.95,0.0,0.95));
      float d = length(cameraPosition - vW);
      float f = 1.0 - exp(-uFogDensity*uFogDensity*d*d);
      col = mix(col, uFogColor, clamp(f,0.0,1.0));
      gl_FragColor = vec4(outColor(col),1.0);
    }`
});
const oceanFar = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000, 4, 4), oceanFarMat);
oceanFar.rotation.x = -Math.PI / 2; oceanFar.position.y = -3.55; oceanFar.frustumCulled = false; scene.add(oceanFar);

/* 岸边碎浪 */
const foamMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: {
    uTime: { value: 0 }, uColor: { value: new THREE.Color(0xffffff) },
    uStrength: { value: 1 }, uNight: { value: 0 }, uFogColor: { value: new THREE.Color(0x0b1428) }, uFogDensity: { value: 0.0012 },
    uExposure: { value: 1.05 }
  },
  vertexShader: `
    uniform float uTime; varying vec2 vUv; varying vec3 vW;
    ${WAVE_GLSL}
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      vUv = uv;
      wp.y += waveField(wp.xz, uTime, 1.0).x + 0.07;
      vW = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: `
    uniform float uTime,uStrength,uNight,uFogDensity; uniform vec3 uColor,uFogColor;
    varying vec2 vUv; varying vec3 vW;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    ${TM_GLSL}
    void main(){
      float u = vUv.x, v = vUv.y;
      float fade = smoothstep(0.02,0.22,u) * (1.0 - smoothstep(0.45,1.0,u));
      float q = u*3.6 - uTime*0.10;
      float cell = floor(q*7.0);
      float n = h21(vec2(floor(v*760.0), cell));
      float b = fract(q);
      float band = smoothstep(0.0,0.22,b) * (1.0 - smoothstep(0.40,0.92,b));
      float a = band * (0.18 + 0.82*n) * fade * uStrength;
      a += smoothstep(0.0,0.10,u) * (1.0-smoothstep(0.10,0.24,u)) * 0.55 * uStrength;
      vec3 col = mix(uColor, uColor*0.72, uNight*0.55);
      float d = length(cameraPosition - vW);
      float f = 1.0 - exp(-uFogDensity*uFogDensity*d*d);
      gl_FragColor = vec4(outColor(mix(col, uFogColor, clamp(f,0.0,1.0))), clamp(a,0.0,1.0));
      if(a < 0.004) discard;
    }`
});
const foamGeo = makeRibbon([
  { lat: 15, y: -3.30, u: 0, color: WHITE },
  { lat: 34, y: -3.42, u: 0.42, color: WHITE },
  { lat: 58, y: -3.48, u: 0.74, color: WHITE },
  { lat: 92, y: -3.50, u: 1, color: WHITE }
]);
const foam = new THREE.Mesh(foamGeo, foamMat);
foam.matrixAutoUpdate = false; foam.frustumCulled = false; scene.add(foam);

/* =========================================================================
   5. 路面 / 岸滩 / 内陆山地 / 护栏
   ========================================================================= */
function roadTexture() {
  const w = 256, h = 512, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = '#43474f'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 11000; i++) {
    const x = Math.random() * w, y = Math.random() * h, v = 44 + Math.random() * 58;
    g.fillStyle = `rgba(${v},${v},${v + 5},${0.26 + Math.random() * 0.45})`;
    g.fillRect(x, y, 2, 2);
  }
  g.fillStyle = 'rgba(24,25,28,.16)'; g.fillRect(52, 0, 34, h); g.fillRect(170, 0, 34, h);
  g.fillStyle = 'rgba(246,246,240,.95)'; g.fillRect(13, 0, 6, h); g.fillRect(w - 20, 0, 6, h);
  g.fillStyle = 'rgba(250,248,232,.98)';
  g.fillRect(w / 2 - 5, 26, 10, 200); g.fillRect(w / 2 - 5, 290, 10, 200);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.wrapS = THREE.ClampToEdgeWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
const roadTex = roadTexture();
const ROAD_VREP = Math.max(1, Math.round(TRACK.length / 13));
const roadGeo = makeRibbon([
  { lat: -7.2, y: 0.10, u: 0, color: C(0x6e737c) },
  { lat: -6.6, y: 0.02, u: 0.04, color: C(0xf2f4f8) },
  { lat: 0, y: 0.06, u: 0.5, color: C(0xffffff) },
  { lat: 6.6, y: 0.02, u: 0.96, color: C(0xf2f4f8) },
  { lat: 7.2, y: 0.10, u: 1, color: C(0x6e737c) }
], { flatten: true });
const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({
  map: roadTex, vertexColors: true, roughness: 0.93, metalness: 0.02
}));
roadTex.repeat.set(1, ROAD_VREP);
road.receiveShadow = true; road.matrixAutoUpdate = false; scene.add(road);

const LAND_SECTION = [
  { lat: -6.8, y: 0.0, color: C(0x3c4526), nz: 0.05 },
  { lat: -9, y: -0.06, color: C(0x364021), nz: 0.2 },
  { lat: -15, y: -0.32, color: C(0x333d1f), nz: 0.35 },
  { lat: -25, y: 0.5, color: C(0x2f391d), nz: 0.5 },
  { lat: -42, y: 2.0, color: C(0x2a341a), nz: 0.7 },
  { lat: -72, y: 5.4, color: C(0x263018), nz: 0.85 },
  { lat: -112, y: 10.2, color: C(0x222b16), nz: 1.0 },
  { lat: -162, y: 16.0, color: C(0x1e2614), nz: 1.0 },
  { lat: -222, y: 23.5, color: C(0x1a2112), nz: 1.0 },
  { lat: -288, y: 31.0, color: C(0x171d10), nz: 1.0 },
  { lat: -352, y: 39.0, color: C(0x14190e), nz: 1.0 },
  { lat: -410, y: 44.0, color: C(0x11150c), nz: 1.0 }
];
/* 注意：截面必须按 lat 递增顺序传入，否则三角面绕序反转、法线朝下会被背面剔除 */
const land = new THREE.Mesh(makeRibbon(LAND_SECTION.slice().reverse()), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }));
land.receiveShadow = true; land.matrixAutoUpdate = false; scene.add(land);

const BEACH_SECTION = [
  { lat: 7.0, y: -0.06, u: 0, color: C(0x8d8b7c) },
  { lat: 8.4, y: -0.34, u: 0.14, color: C(0xc3ac7c) },
  { lat: 12, y: -1.1, u: 0.3, color: C(0xd0b686) },
  { lat: 18, y: -2.1, u: 0.5, color: C(0xc0a678) },
  { lat: 26, y: -3.05, u: 0.72, color: C(0xa08c68) },
  { lat: 34, y: -3.5, u: 0.88, color: C(0x8b7a5e) },
  { lat: 46, y: -3.62, u: 1, color: C(0x7d6d54) }
];
const beach = new THREE.Mesh(makeRibbon(BEACH_SECTION), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }));
beach.receiveShadow = true; beach.matrixAutoUpdate = false; scene.add(beach);

/* 护栏 */
const railMat = new THREE.MeshStandardMaterial({ color: 0xb9c3cf, roughness: 0.42, metalness: 0.72 });
const railGeo = makeRibbon([
  { lat: 7.55, y: 0.72, u: 0, color: WHITE }, { lat: 7.75, y: 0.72, u: 1, color: WHITE }
], { flatten: true });
const rail = new THREE.Mesh(railGeo, railMat); rail.matrixAutoUpdate = false; rail.castShadow = true; scene.add(rail);
const railGeo2 = makeRibbon([
  { lat: 7.58, y: 1.06, u: 0, color: WHITE }, { lat: 7.72, y: 1.06, u: 1, color: WHITE }
], { flatten: true });
const rail2 = new THREE.Mesh(railGeo2, railMat); rail2.matrixAutoUpdate = false; scene.add(rail2);

const postGeo = new THREE.BoxGeometry(0.12, 1.15, 0.12);
const postCount = 900;
const posts = new THREE.InstancedMesh(postGeo, railMat, postCount);
posts.castShadow = false; posts.instanceMatrix.setUsage(THREE.StaticDrawUsage);
{
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
  const f = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 };
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < postCount; i++) {
    const s = i / postCount * TRACK.length;
    TRACK.sample(s, f);
    pv.set(f.p.x + f.r.x * 7.65, f.p.y + 0.56, f.p.z + f.r.z * 7.65);
    m.compose(pv, q.setFromAxisAngle(yAxis, Math.atan2(f.t.x, f.t.z)), sc);
    posts.setMatrixAt(i, m);
  }
}
posts.instanceMatrix.needsUpdate = true;
scene.add(posts);

/* 树木与礁石 */
function scatterProps() {
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.26, 2.2, 5);
  const leafGeo = new THREE.ConeGeometry(1.65, 4.2, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f4a2a, roughness: 1, flatShading: true });
  const N = 460;
  const tr = new THREE.InstancedMesh(trunkGeo, trunkMat, N);
  const lf = new THREE.InstancedMesh(leafGeo, leafMat, N);
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 1, flatShading: true });
  const RK = 260;
  const rk = new THREE.InstancedMesh(rockGeo, rockMat, RK);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pv = new THREE.Vector3();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const f = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 };
  for (let i = 0; i < N; i++) {
    const s = Math.random() * TRACK.length;
    const lat = -rand(26, 390);
    TRACK.sample(s, f);
    const si = stationOf(s);
    const y = profileY(LAND_SECTION, lat) + terrainNoise(si, lat) - 0.5;
    const sc0 = rand(0.7, 1.7);
    pv.set(f.p.x + f.r.x * lat, f.p.y + y, f.p.z + f.r.z * lat);
    q.setFromAxisAngle(yAxis, Math.random() * TAU);
    m.compose(pv, q, sc.set(sc0, sc0 * rand(0.8, 1.6), sc0));
    tr.setMatrixAt(i, m);
    m.compose(pv.clone().setY(pv.y + 2.4 * sc0), q, sc.clone().set(sc0, sc0 * rand(0.8, 1.5), sc0));
    lf.setMatrixAt(i, m);
  }
  for (let i = 0; i < RK; i++) {
    const s = Math.random() * TRACK.length;
    const lat = Math.random() < 0.35 ? rand(10, 30) : -rand(12, 300);
    TRACK.sample(s, f);
    const si = stationOf(s);
    const y = profileY(BEACH_SECTION, lat) !== undefined && lat > 6.5 ? profileY(BEACH_SECTION, lat) : profileY(LAND_SECTION, lat) + terrainNoise(si, lat);
    const sc0 = rand(0.5, 2.2);
    pv.set(f.p.x + f.r.x * lat, f.p.y + y + sc0 * 0.25, f.p.z + f.r.z * lat);
    q.setFromEuler(new THREE.Euler(rand(0, 1), rand(0, TAU), rand(0, 1)));
    m.compose(pv, q, sc.set(sc0, sc0 * rand(0.5, 0.9), sc0));
    rk.setMatrixAt(i, m);
  }
  tr.castShadow = lf.castShadow = rk.castShadow = false;
  lf.receiveShadow = rk.receiveShadow = true;
  tr.instanceMatrix.needsUpdate = lf.instanceMatrix.needsUpdate = rk.instanceMatrix.needsUpdate = true;
  scene.add(tr, lf, rk);
  return { tr, lf, rk };
}
const props = scatterProps();

/* =========================================================================
   6. 鹈鹕 + 自行车（程序化建模）
   ========================================================================= */
const PEL = {
  feather: 0xf7f4ec, featherDark: 0xdcd6c8, beak: 0xf3a63f, beakDark: 0xd9821f,
  pouch: 0xe89a2c, scarf: 0xd7263d, scarfDark: 0xa81b2c, helmet: 0x2b3a55,
  glass: 0x17202e, leg: 0xe89a3c, tire: 0x1d1f24, rim: 0xc9d0da, frame: 0x2fd0b8
};
const mat = (c, r = 0.62, m = 0.05, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra));

const rig = new THREE.Group();            // 局部原点 = 后轮触地点，前方 +Z
rig.rotation.order = 'YXZ';
scene.add(rig);

const bike = new THREE.Group(); rig.add(bike);
const mFrame = mat(PEL.frame, 0.28, 0.55);
const mTire = mat(PEL.tire, 0.9, 0.02);
const mRim = mat(PEL.rim, 0.24, 0.85);
const mDark = mat(0x2a2f38, 0.5, 0.4);
const wheelY = 0.34, rearZ = -0.56, frontZ = 0.62;

function tube(a, b, r, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(r, r, len, 8);
  const mesh = new THREE.Mesh(g, material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}
function spokeTex() {
  const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const g = cv.getContext('2d'); g.clearRect(0, 0, s, s);
  g.translate(s / 2, s / 2);
  g.strokeStyle = 'rgba(210,216,226,.92)'; g.lineWidth = 2.6;
  for (let i = 0; i < 20; i++) { g.save(); g.rotate(i / 20 * TAU); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 0.44); g.stroke(); g.restore(); }
  g.strokeStyle = 'rgba(190,198,210,.7)'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, s * 0.44, 0, TAU); g.stroke();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const spokeTexture = spokeTex();
function makeWheel(z) {
  const grp = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 10, 26), mTire);
  tire.rotation.y = Math.PI / 2; grp.add(tire);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.292, 0.016, 8, 24), mRim);
  rim.rotation.y = Math.PI / 2; grp.add(rim);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.29, 28),
    new THREE.MeshBasicMaterial({ map: spokeTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.95 }));
  disc.rotation.y = Math.PI / 2; grp.add(disc);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.13, 10), mRim);
  hub.rotation.z = Math.PI / 2; grp.add(hub);
  grp.position.set(0, wheelY, z);
  grp.userData.spin = disc;
  return grp;
}
const wheelR = makeWheel(rearZ), wheelF = makeWheel(frontZ);
bike.add(wheelR, wheelF);

const BB = new THREE.Vector3(0, wheelY, -0.06);
const SEAT = new THREE.Vector3(0, 0.88, -0.30);
const HEADT = new THREE.Vector3(0, 0.86, 0.44);
const HEADB = new THREE.Vector3(0, 0.58, 0.50);
const rearHub = new THREE.Vector3(0, wheelY, rearZ), frontHub = new THREE.Vector3(0, wheelY, frontZ);
bike.add(
  tube(BB, rearHub, 0.028, mFrame), tube(BB, SEAT, 0.030, mFrame), tube(rearHub, SEAT, 0.026, mFrame),
  tube(SEAT, HEADT, 0.030, mFrame), tube(BB, HEADB, 0.032, mFrame), tube(HEADT, HEADB, 0.034, mFrame),
  tube(HEADB, frontHub, 0.022, mFrame), tube(SEAT, new THREE.Vector3(0, 0.80, -0.30), 0.02, mDark)
);
const fork2 = tube(HEADB, new THREE.Vector3(0.11, wheelY, frontHub.z), 0.018, mFrame);
const fork3 = tube(HEADB, new THREE.Vector3(-0.11, wheelY, frontHub.z), 0.018, mFrame);
bike.add(fork2, fork3);
const seat = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.075, 0.42), mat(0x1b1e26, 0.55, 0.2));
seat.position.set(0, 0.93, -0.30); seat.rotation.x = -0.06; bike.add(seat);

const stem = tube(HEADT, new THREE.Vector3(0, 0.95, 0.50), 0.022, mDark); bike.add(stem);
const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.46, 8), mDark);
bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.95, 0.50); bike.add(bar);
for (const sx of [-1, 1]) {
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.20, 8), mDark);
  drop.position.set(sx * 0.21, 0.88, 0.56); drop.rotation.x = 0.7; bike.add(drop);
}
const chainring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 18), mRim);
chainring.position.copy(BB); chainring.rotation.y = Math.PI / 2; bike.add(chainring);
const crankGrp = new THREE.Group(); crankGrp.position.copy(BB); bike.add(crankGrp);
for (const side of [-1, 1]) {
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.20, 0.04), mRim);
  const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.016, 0.07), mDark);
  const holder = new THREE.Group();
  arm.position.set(side * 0.035, (side > 0 ? -0.09 : 0.09), 0);
  pedal.position.set(side * 0.09, (side > 0 ? -0.18 : 0.18), 0);
  holder.add(arm, pedal); crankGrp.add(holder);
}
const pedalL = new THREE.Object3D(), pedalR = new THREE.Object3D();
pedalL.position.set(-0.035, -0.18, 0); pedalR.position.set(0.035, 0.18, 0);
crankGrp.add(pedalL, pedalR);

/* --- 身体 --- */
const pel = new THREE.Group(); rig.add(pel);
const mFeather = mat(PEL.feather, 0.72, 0.0);
const mFeatherD = mat(PEL.featherDark, 0.8, 0.0);
const mBeak = mat(PEL.beak, 0.4, 0.05);
const mPouch = mat(PEL.pouch, 0.5, 0.02);
const mHelmet = mat(PEL.helmet, 0.32, 0.35);
const mLeg = mat(PEL.leg, 0.5, 0.05);

const body = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 18), mFeather);
body.scale.set(0.94, 0.90, 1.34); body.position.set(0, 1.20, -0.16); body.rotation.x = -0.14;
body.castShadow = true; pel.add(body);
const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), mat(0xfffdf6, 0.8));
belly.scale.set(0.82, 0.62, 1.15); belly.position.set(0, 1.06, -0.12); pel.add(belly);
const tail = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.52, 10), mFeatherD);
tail.position.set(0, 1.24, -0.82); tail.rotation.x = -2.05; tail.castShadow = true; pel.add(tail);

const neckCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1.32, 0.26), new THREE.Vector3(0, 1.50, 0.42),
  new THREE.Vector3(0, 1.68, 0.50), new THREE.Vector3(0.01, 1.85, 0.47),
  new THREE.Vector3(0.02, 1.95, 0.38)
]);
const neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 30, 0.185, 16, false), mFeather);
neck.castShadow = true; pel.add(neck);

const headGrp = new THREE.Group(); headGrp.position.set(0.02, 1.99, 0.36); pel.add(headGrp);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.235, 26, 20), mFeather);
head.scale.set(0.95, 1.0, 1.10); head.castShadow = true; headGrp.add(head);
const crest = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.19, 10), mFeatherD);
crest.position.set(0, 0.235, -0.065); crest.rotation.x = -0.5; headGrp.add(crest);

/* 喙 + 喉囊 */
const beakGrp = new THREE.Group(); beakGrp.position.set(0, -0.015, 0.20); headGrp.add(beakGrp);
const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.118, 0.76, 18), mBeak);
upper.rotation.x = Math.PI / 2 + 0.055; upper.position.set(0, 0.020, 0.37); upper.castShadow = true; beakGrp.add(upper);
const upperTip = new THREE.Mesh(new THREE.ConeGeometry(0.050, 0.15, 18), mBeak);
upperTip.rotation.x = Math.PI / 2 + 0.055; upperTip.position.set(0, 0.014, 0.81); beakGrp.add(upperTip);
const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.24, 30, 22), mPouch);
pouch.scale.set(0.86, 0.66, 1.66); pouch.position.set(0, -0.14, 0.36); pouch.castShadow = true; beakGrp.add(pouch);
const pouchLine = new THREE.Mesh(new THREE.TorusGeometry(0.198, 0.010, 8, 28, Math.PI), mat(PEL.beakDark, 0.5));
pouchLine.position.set(0, -0.02, 0.36); pouchLine.rotation.set(Math.PI / 2, 0, 0); beakGrp.add(pouchLine);
const pouchLine2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 8, 24, Math.PI), mat(PEL.beakDark, 0.5));
pouchLine2.position.set(0, -0.07, 0.52); pouchLine2.rotation.set(Math.PI / 2, 0, 0); beakGrp.add(pouchLine2);
const beakTip = new THREE.Object3D(); beakTip.position.set(0, -0.10, 0.86); beakGrp.add(beakTip);

/* 头盔 + 墨镜 */
const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.272, 26, 16, 0, TAU, 0, Math.PI * 0.60), mHelmet);
helmet.position.set(0, 0.062, -0.015); helmet.rotation.x = 0.12; helmet.castShadow = true; headGrp.add(helmet);
const helmetRim = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.018, 8, 30), mat(0x1b2537, 0.4, 0.3));
helmetRim.position.set(0, 0.028, -0.015); helmetRim.rotation.x = Math.PI / 2 + 0.12; headGrp.add(helmetRim);
for (let i = -1; i <= 1; i++) {
  const vent = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.055, 0.24), mat(0x0d1420, 0.6));
  vent.position.set(i * 0.105, 0.252, -0.03); vent.rotation.x = 0.12; headGrp.add(vent);
}
const strap = new THREE.Mesh(new THREE.TorusGeometry(0.222, 0.013, 6, 24), mat(0x101826, 0.6));
strap.position.set(0, -0.038, -0.015); strap.rotation.y = Math.PI / 2; headGrp.add(strap);
for (const sx of [-1, 1]) {
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 12, 0, TAU, 0, Math.PI * 0.55), mat(PEL.glass, 0.12, 0.6, { side: THREE.DoubleSide }));
  lens.scale.set(1.28, 0.84, 0.55); lens.position.set(sx * 0.106, 0.046, 0.198); lens.rotation.set(1.32, sx * 0.22, 0); headGrp.add(lens);
}
const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.022), mat(PEL.glass, 0.2, 0.5));
bridge.position.set(0, 0.058, 0.212); headGrp.add(bridge);
const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), mat(0x0a0e16, 0.2, 0.2));
eyeL.position.set(-0.106, 0.040, 0.196); headGrp.add(eyeL);

/* 翅膀 */
function makeWing(side) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.16 * side, -0.05, 0.30 * side, -0.24, 0.38 * side, -0.58);
  s.bezierCurveTo(0.31 * side, -0.64, 0.20 * side, -0.61, 0.12 * side, -0.51);
  s.bezierCurveTo(0.075 * side, -0.36, 0.03 * side, -0.20, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.013, bevelThickness: 0.013, bevelSegments: 2, curveSegments: 16 });
  const m = new THREE.Mesh(g, mFeather);
  m.castShadow = true;
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.30, 1.30, -0.04);
  m.rotation.y = side * 0.30;
  m.position.z = -0.02;
  pivot.add(m);
  pel.add(pivot);
  return { pivot, mesh: m, side };
}
const wingL = makeWing(-1), wingR = makeWing(1);

/* 腿 */
const LEG_L1 = 0.45, LEG_L2 = 0.40;
function makeLeg(side) {
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, LEG_L1, 8), mLeg);
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.027, LEG_L2, 8), mLeg);
  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mLeg);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mLeg);
  foot.scale.set(1.6, 0.32, 2.1);
  const hip = new THREE.Group(); hip.position.set(side * 0.158, 0.96, -0.02); pel.add(hip);
  upper.position.y = -LEG_L1 / 2; hip.add(upper);
  const knee = new THREE.Group(); knee.position.y = -LEG_L1; hip.add(knee);
  knee.add(joint);
  lower.position.y = -LEG_L2 / 2; knee.add(lower);
  const ankle = new THREE.Group(); ankle.position.y = -LEG_L2; knee.add(ankle);
  foot.position.set(0, -0.02, 0.07); ankle.add(foot);
  return { hip, knee, ankle, side };
}
const legL = makeLeg(-1), legR = makeLeg(1);

/* 红围巾：绑在脖子上 + 飘带（布料模拟） */
const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.207, 0.062, 12, 26), mat(PEL.scarf, 0.92, 0));
scarfRing.position.set(0.01, 1.84, 0.36); scarfRing.rotation.set(Math.PI / 2 + 0.30, 0, 0.12);
scarfRing.castShadow = true; pel.add(scarfRing);
const knot = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 10), mat(PEL.scarfDark, 0.95, 0));
knot.position.set(-0.175, 1.795, 0.29); knot.scale.set(1, 0.8, 1); pel.add(knot);
const knotTail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.20, 8), mat(PEL.scarfDark, 0.95, 0));
knotTail.position.set(-0.20, 1.70, 0.30); knotTail.rotation.set(0.35, 0, 2.7); pel.add(knotTail);

const SC = 15;
const scarfNodes = [], scarfSeg = 0.17;
for (let i = 0; i < SC; i++) scarfNodes.push({ p: new THREE.Vector3(), q: new THREE.Vector3(), w: i === 0 ? 0 : 1 });
const scarfGeo = new THREE.BufferGeometry();
const scarfPos = new Float32Array(SC * 2 * 3);
const scarfIdx = [];
for (let i = 0; i < SC - 1; i++) {
  const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
  scarfIdx.push(a, c, b, b, c, d);
}
scarfGeo.setAttribute('position', new THREE.BufferAttribute(scarfPos, 3));
scarfGeo.setIndex(scarfIdx);
const scarfMesh = new THREE.Mesh(scarfGeo, new THREE.MeshStandardMaterial({ color: PEL.scarf, roughness: 0.94, side: THREE.DoubleSide }));
scarfMesh.frustumCulled = false; scarfMesh.castShadow = true;
scene.add(scarfMesh);

/* =========================================================================
   7. 鱼
   ========================================================================= */
const fishPool = [];
const fishMatBody = mat(0x9fc7dd, 0.32, 0.45);
const fishMatBelly = mat(0xf2f8ff, 0.4, 0.35);
const fishMatFin = mat(0x5f8fae, 0.5, 0.2);
function makeFish() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), fishMatBody);
  b.scale.set(0.62, 0.85, 1.5); g.add(b);
  const bl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 9), fishMatBelly);
  bl.scale.set(0.5, 0.5, 1.2); bl.position.y = -0.06; g.add(bl);
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 4), fishMatFin);
  t.rotation.x = -Math.PI / 2; t.position.z = -0.34; g.add(t);
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 3), fishMatFin);
  f.rotation.x = Math.PI / 2; f.position.set(0, 0.14, 0.02); g.add(f);
  for (const sx of [-1, 1]) {
    const sfn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 3), fishMatFin);
    sfn.rotation.z = sx * 1.1; sfn.position.set(sx * 0.14, -0.04, 0.06); g.add(sfn);
  }
  return g;
}
for (let i = 0; i < 22; i++) {
  const m = makeFish(); m.visible = false; scene.add(m);
  fishPool.push({
    mesh: m, active: false, t: 0, dur: 1, apex: 3, caught: false, s: 0, lat0: 0, lat1: 0,
    frame: { p: new THREE.Vector3(), r: new THREE.Vector3() }
  });
}

/* =========================================================================
   8. 状态 / 输入
   ========================================================================= */
const state = {
  s: 0, speed: 0, lateral: 0, targetLat: 0, latVel: 0, roll: 0,
  y: 0, vy: 0, air: false, airTime: 0,
  wheelie: 0, wheelieT: 0, crank: 0, fish: 0, dist: 0,
  phase: 0, night: 0, auto: false, autoT: 0, lastInput: performance.now(),
  cam: 0, camT: 0, quality: 2, fps: 60, caught: 0, hiSpeed: false, leanT: 0
};
const MAXSPEED = 33, ACCEL = 13, BRAKE = 24, DRAG = 0.32;
const keys = { fwd: 0, back: 0, left: 0, right: 0, jump: 0, fly: 0, camera: 0, auto: 0 };
const KEYMAP = {
  KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'jump', KeyT: 'fly', KeyC: 'camera', KeyR: 'auto'
};
let wantsJump = false;
const MOVE_KEYS = { fwd: 1, back: 1, left: 1, right: 1, jump: 1, fly: 1 };
function markInput(k) { if (MOVE_KEYS[k]) state.lastInput = performance.now(); }
addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code]; if (!k) return;
  e.preventDefault();
  if (!keys[k]) {
    if (k === 'jump') wantsJump = true;
    if (k === 'camera') nextCamera();
    if (k === 'fly') triggerWheelie();
    if (k === 'auto') toggleAuto();
  }
  keys[k] = 1; markInput(k);
}, { passive: false });
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) { keys[k] = 0; markInput(k); } });
addEventListener('blur', () => { for (const k in keys) keys[k] = 0; });

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) document.getElementById('touch').classList.add('on');
document.querySelectorAll('#touch .btn').forEach((b) => {
  const k = b.dataset.k;
  const on = (e) => {
    e.preventDefault(); b.classList.add('hit');
    if (k === 'jump') wantsJump = true;
    else if (k === 'camera') nextCamera();
    else if (k === 'fly') triggerWheelie();
    else keys[k] = 1;
    markInput(k);
    if (k === 'auto') toggleAuto();
  };
  const off = (e) => { e.preventDefault(); b.classList.remove('hit'); if (keys[k] !== undefined) keys[k] = 0; };
  b.addEventListener('touchstart', on, { passive: false });
  b.addEventListener('touchend', off, { passive: false });
  b.addEventListener('touchcancel', off, { passive: false });
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
});

/* =========================================================================
   9. 成就
   ========================================================================= */
const ACH = [
  { id: 'a1', ic: '🐟', t: '第一条鱼', d: '抓到第一条鱼' },
  { id: 'a2', ic: '🐠', t: '十全十美', d: '累计抓到 10 条鱼' },
  { id: 'a3', ic: '🐡', t: '鱼满舱', d: '累计抓到 30 条鱼' },
  { id: 'a4', ic: '🪽', t: '展翅', d: '第一次按下 T 展开双翼' },
  { id: 'a5', ic: '⤴', t: '腾空', d: '第一次跳跃离地' },
  { id: 'a6', ic: '🕊', t: '长空滑翔', d: '单次滞空超过 1.6 秒' },
  { id: 'a7', ic: '⚡', t: '极速鹈鹕', d: '速度达到 120 km/h' },
  { id: 'a8', ic: '🌀', t: '完美压弯', d: '高速变道并压出大倾角' },
  { id: 'a9', ic: '🌙', t: '夜行者', d: '骑进星空月夜' },
  { id: 'a10', ic: '✨', t: '观星者', d: '在电影镜头里看一夜的星' },
  { id: 'a11', ic: '👁', t: '鹈鹕之眼', d: '用鹈鹕视角看世界' },
  { id: 'a12', ic: '🎬', t: '五镜全开', d: '五种镜头都体验一次' },
  { id: 'a13', ic: '🧣', t: '围巾飞扬', d: '让红围巾在风中完全展开' },
  { id: 'a14', ic: '🤖', t: '自动驾驶', d: '让鹈鹕自己骑满 20 秒' }
];
const unlocked = new Set();
const camSeen = new Set();
let starGazeT = 0;
function unlock(id) {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  const a = ACH.find((x) => x.id === id); if (!a) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="ic">${a.ic}</div><div><div class="tt">${a.t}</div><div class="ts">${a.d}</div></div>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 600); }, 3400);
  AUD.achieve(unlocked.size);
  document.getElementById('ach').textContent = unlocked.size;
}

/* =========================================================================
   10. 音频（Web Audio 实时合成：音效 + 跟随踏频的音乐）
   ========================================================================= */
const AUD = {
  ready: false, ctx: null, bpm: 96, step: 0, nextT: 0, timer: null, windGain: null, windFilt: null,
  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = new AC(); this.ctx = ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.ratio.value = 4;
    this.master.connect(comp); comp.connect(ctx.destination);
    this.musicGain = ctx.createGain(); this.musicGain.gain.value = 0.30; this.musicGain.connect(this.master);
    this.sfxGain = ctx.createGain(); this.sfxGain.gain.value = 0.62; this.sfxGain.connect(this.master);
    const dl = ctx.createDelay(1.2); dl.delayTime.value = 0.33;
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    const dw = ctx.createGain(); dw.gain.value = 0.34;
    dl.connect(fb); fb.connect(dl); dl.connect(dw); dw.connect(this.musicGain);
    this.delay = dl;
    const len = Math.floor(ctx.sampleRate * 2.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0.0;
    src.connect(bp); bp.connect(g); g.connect(this.master); src.start();
    this.windGain = g; this.windFilt = bp;
    const src2 = ctx.createBufferSource(); src2.buffer = buf; src2.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
    const g2 = ctx.createGain(); g2.gain.value = 0.16;
    src2.connect(lp); lp.connect(g2); g2.connect(this.master); src2.start();
    this.ready = true;
    this.nextT = ctx.currentTime + 0.06; this.step = 0;
    this.timer = setInterval(() => this.schedule(), 25);
  },
  note(freq, t, dur, type, vol, dest, detune) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = type || 'triangle'; o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.musicGain);
    if (dest === this.musicGain || !dest) g.connect(this.delay);
    o.start(t); o.stop(t + dur + 0.05);
  },
  hit(t, vol, hp) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    s.playbackRate.value = 1.6;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    s.connect(f); f.connect(g); g.connect(this.musicGain);
    s.start(t, Math.random()); s.stop(t + 0.08);
  },
  kick(t, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 0.3);
  },
  schedule() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const spb = 60 / this.bpm / 4;
    while (this.nextT < ctx.currentTime + 0.18) {
      const t = this.nextT, st = this.step % 32;
      const roots = [55, 55, 43.65, 49];
      const root = roots[Math.floor(this.step / 32) % 4];
      const scale = [0, 3, 5, 7, 10, 12, 15, 17];
      if (st % 8 === 0 || st === 14 || st === 27) this.kick(t, 0.42);
      if (st % 2 === 1) this.hit(t, 0.055 + (st % 4 === 1 ? 0.03 : 0), 7800);
      if (st === 0 || st === 10 || st === 20 || st === 26) this.note(root, t, 0.55, 'triangle', 0.20);
      if (st === 6 || st === 22) this.note(root * 1.5, t, 0.34, 'sine', 0.13);
      if (st % 4 === 0 || st === 11 || st === 19 || st === 25) {
        const n = scale[(this.step * 3 + (st % 5)) % scale.length];
        this.note(root * 4 * Math.pow(2, n / 12), t, 0.22, 'square', 0.042);
      }
      if (st % 16 === 0) {
        for (let v = 0; v < 3; v++) this.note(root * 2 * Math.pow(2, [0, 3, 7][v] / 12), t, 1.5, 'sawtooth', 0.026, this.musicGain, v * 6 - 6);
      }
      this.nextT += spb; this.step++;
    }
  },
  catchFish() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.note(880, t, 0.12, 'triangle', 0.16, this.sfxGain);
    this.note(1320, t + 0.05, 0.16, 'triangle', 0.12, this.sfxGain);
    const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.playbackRate.value = 1.1;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.2); f.Q.value = 1.6;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t); s.stop(t + 0.3);
  },
  jump() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.setValueAtTime(420, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.3); f.Q.value = 1.1;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.2, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t); s.stop(t + 0.4);
  },
  flap() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const tt = t + i * 0.13;
      const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.playbackRate.value = 1.3 + i * 0.15;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400 - i * 250;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, tt); g.gain.linearRampToValueAtTime(0.19, tt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.16);
      s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(tt); s.stop(tt + 0.2);
    }
  },
  achieve(n) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const base = 523.25 * Math.pow(2, Math.min(n, 12) / 24);
    [0, 4, 7, 12].forEach((s, i) => this.note(base * Math.pow(2, s / 12), t + i * 0.075, 0.5, 'triangle', 0.11, this.sfxGain));
  },
  tick() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.hit(t, 0.045, 9000);
  },
  update(dt, speed, rpm, night) {
    if (!this.ready) return;
    const wind = clamp(speed / MAXSPEED, 0, 1);
    this.windGain.gain.value = damp(this.windGain.gain.value, wind * wind * 0.16, 3, dt);
    this.windFilt.frequency.value = 420 + wind * 1500;
    this.bpm = clamp(74 + rpm * 0.7, 74, 150);
    const target = night > 0.5 ? 0.22 : 0.30;
    this.musicGain.gain.value = damp(this.musicGain.gain.value, target, 1.2, dt);
  }
};

/* =========================================================================
   11. 镜头
   ========================================================================= */
const CAMS = ['跟随镜头', '电影运镜', '鹈鹕视角', '贴地飞驰', '环绕机位'];
function nextCamera() { state.cam = (state.cam + 1) % CAMS.length; state.camT = 0; camSeen.add(state.cam); document.getElementById('cameraName').textContent = CAMS[state.cam]; if (camSeen.size >= 5) unlock('a12'); if (state.cam === 2) unlock('a11'); }
function toggleAuto() { state.auto = !state.auto; state.autoT = 0; }

const camPos = new THREE.Vector3(0, 4, -6), camLook = new THREE.Vector3();
const lookSmooth = new THREE.Vector3(), posSmooth = new THREE.Vector3();

/* =========================================================================
   12. 组帧
   ========================================================================= */
const fFrame = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 };
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);
let leanSmooth = 0;

function rigWorld() {
  TRACK.sample(state.s, fFrame);
  const lat = state.lateral;
  rig.position.set(fFrame.p.x + fFrame.r.x * lat, fFrame.p.y + state.y, fFrame.p.z + fFrame.r.z * lat);
  const yaw = Math.atan2(fFrame.t.x, fFrame.t.z);
  rig.quaternion.setFromAxisAngle(UP, yaw);
  tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -state.wheelie * 0.62);
  rig.quaternion.multiply(tmpQ);
  tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -leanSmooth * 0.42 - state.roll * 0.35);
  rig.quaternion.multiply(tmpQ);
}

/* =========================================================================
   13. 主循环
   ========================================================================= */
const clock = new THREE.Clock();
let elapsed = 0, fpsAcc = 0, fpsN = 0, qTimer = 0, autopilotSince = 0, autopilotT = 0;
const QUALITY = [
  { name: '低', dpr: 0.7, shadow: false, oceanDetail: 0, stars: 0.4, foam: false },
  { name: '中', dpr: 0.95, shadow: false, oceanDetail: 1, stars: 0.7, foam: true },
  { name: '高', dpr: 1.25, shadow: true, oceanDetail: 1, stars: 1.0, foam: true },
  { name: '极致', dpr: 1.6, shadow: true, oceanDetail: 1, stars: 1.0, foam: true }
];
function applyQuality(q) {
  state.quality = clamp(q, 0, 3);
  const Q = QUALITY[state.quality];
  renderer.setPixelRatio(Math.min(devicePixelRatio, Q.dpr));
  renderer.shadowMap.enabled = Q.shadow;
  sun.castShadow = Q.shadow;
  oceanUniforms.uDetail.value = Q.oceanDetail;
  starMat.uniforms.uPR.value = renderer.getPixelRatio();
  foam.visible = Q.foam;
  props.lf.visible = props.tr.visible = state.quality >= 1;
  document.getElementById('quality').textContent = `画质 ${Q.name} · ${Math.round(state.fps)}fps`;
}

let running = false;
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  if (!running) { renderer.render(scene, camera); return; }

  /* ---- 输入 / 物理 ---- */
  const now = performance.now();
  const idle = now - state.lastInput;
  if (idle > 7000 && !state.auto) { state.auto = true; state.autoT = 0; }
  if (state.auto && idle < 200) { state.auto = false; }

  let thr = 0, steer = 0;
  if (state.auto) {
    thr = 1;
    state.autoT += dt;
    if (state.autoT > 20 && !unlocked.has('a14')) unlock('a14');
    let best = null, bs = 1e9;
    for (const f of fishPool) {
      if (!f.active || f.caught) continue;
      let ds = f.s - state.s;
      ds = ((ds % TRACK.length) + TRACK.length) % TRACK.length;
      if (ds > TRACK.length / 2) ds -= TRACK.length;
      if (ds < -3 || ds > 110) continue;
      if (ds < bs) { bs = ds; best = f; }
    }
    if (best) {
      state.targetLat = clamp(best.lat1, -5.2, 5.2);
      steer = clamp((best.lat1 - state.lateral) / 4, -1, 1);
      if (bs < 14 && state.speed > 12) wantsJump = true;
    } else {
      steer = Math.sin(elapsed * 0.6) * 0.5;
      state.targetLat = clamp(steer * 5, -5, 5);
    }
  } else {
    thr = (keys.fwd ? 1 : 0) - (keys.back ? 1 : 0);
    if (keys.left) steer -= 1; if (keys.right) steer += 1;
    if (steer !== 0) state.targetLat = clamp(state.targetLat + steer * dt * 7.5, -5.6, 5.6);
    else state.targetLat = damp(state.targetLat, state.targetLat, 2, dt);
  }

  if (thr > 0) state.speed += ACCEL * dt * (1 - state.speed / MAXSPEED * 0.72);
  else if (thr < 0) state.speed -= BRAKE * dt;
  else state.speed -= state.speed * DRAG * dt;
  if (!state.air) state.speed -= state.speed * 0.035 * dt;
  state.speed = clamp(state.speed, 0, MAXSPEED);

  const prevLat = state.lateral;
  state.lateral = damp(state.lateral, state.targetLat, 3.4, dt);
  state.latVel = (state.lateral - prevLat) / Math.max(dt, 0.001);
  leanSmooth = damp(leanSmooth, clamp(state.latVel * 0.30, -1.1, 1.1), 6, dt);

  if (wantsJump && !state.air && state.speed > 3) {
    state.air = true; state.vy = 6.4 + state.speed * 0.055; state.airTime = 0;
    AUD.jump(); unlock('a5');
    if (state.wheelie < 0.2) triggerWheelie(0.6);
  } else if (wantsJump && !state.air && state.speed <= 3) { AUD.jump(); state.vy = 4.0; state.air = true; state.airTime = 0; unlock('a5'); }
  wantsJump = false;
  if (state.air) {
    state.vy -= 17.5 * dt;
    state.y += state.vy * dt;
    state.airTime += dt;
    if (state.wheelie > 0.4) state.vy -= 9.5 * dt;
    if (state.y <= 0) { state.y = 0; state.vy = 0; state.air = false; if (state.airTime > 1.6) unlock('a6'); }
  } else {
    state.y = damp(state.y, 0, 12, dt);
  }
  if (state.speed > MAXSPEED * 0.985 && !state.hiSpeed) { state.hiSpeed = true; unlock('a7'); }
  if (state.speed > 26 && Math.abs(leanSmooth) > 0.42) { state.leanT += dt; if (state.leanT > 0.35) unlock('a8'); } else state.leanT = 0;

  state.s += state.speed * dt;
  state.dist += state.speed * dt;
  state.roll = damp(state.roll, -steer * 0.25, 4, dt);
  rigWorld();

  /* ---- 车轮 / 曲柄 ---- */
  const wheelCirc = TAU * 0.33;
  const wheelRate = state.speed / 0.33;
  wheelR.userData.spin.rotation.x -= wheelRate * dt;
  wheelF.userData.spin.rotation.x -= wheelRate * dt;
  const cadence = clamp(state.speed / wheelCirc * 0.13, 0.30, 2.10);
  const prevCrank = state.crank;
  state.crank += cadence * TAU * dt;
  crankGrp.rotation.x = -state.crank;
  if (Math.floor(state.crank / Math.PI) !== Math.floor(prevCrank / Math.PI) && state.speed > 4) AUD.tick();

  /* ---- 姿态 ---- */
  state.wheelieT = Math.max(0, state.wheelieT - dt);
  if (state.wheelieT <= 0) state.wheelie = damp(state.wheelie, 0, 3.5, dt);
  else state.wheelie = damp(state.wheelie, 1, 7, dt);

  const bob = Math.sin(state.crank * 2) * 0.022 * clamp(state.speed / 12, 0, 1) + (state.air ? 0.04 : 0);
  pel.position.y = bob;
  pel.rotation.z = Math.sin(state.crank) * 0.035 * clamp(state.speed / 16, 0, 1);
  body.rotation.x = -0.14 + state.wheelie * 0.10;
  headGrp.rotation.x = -state.wheelie * 0.26 + Math.sin(elapsed * 1.4) * 0.035;
  headGrp.rotation.y = Math.sin(elapsed * 0.5) * 0.10 + steer * 0.16;
  headGrp.rotation.z = Math.cos(elapsed * 0.8) * 0.04;

  const flap = state.wheelie;
  const flapAng = state.air ? Math.sin(elapsed * 13) * 0.5 + 0.7 : Math.sin(elapsed * 2.2) * 0.10;
  wingL.pivot.rotation.z = lerp(0.62, -1.05, flap) + flapAng * 0.50;
  wingR.pivot.rotation.z = lerp(-0.62, 1.05, flap) - flapAng * 0.50;
  wingL.pivot.rotation.y = lerp(-0.34, 0.50, flap) + Math.sin(elapsed * 3.1) * 0.06 * flap;
  wingR.pivot.rotation.y = lerp(0.34, -0.50, flap) - Math.sin(elapsed * 3.1) * 0.06 * flap;

  /* 腿跟随曲柄 */
  rig.updateMatrixWorld(true);
  const pedalWorldL = pedalL.getWorldPosition(tmpV).clone();
  const pedalWorldR = pedalR.getWorldPosition(tmpV2).clone();
  placeLeg(legL, pedalWorldL); placeLeg(legR, pedalWorldR);

  /* ---- 围巾布料 ---- */
  updateScarf(dt);

  /* ---- 昼夜 ---- */
  state.phase = (elapsed / 210) % 1;
  const ang = state.phase * TAU;
  const elev = -Math.sin(ang) * 1.15;
  const azim = ang * 0.5 + 2.0;
  const sunDir = new THREE.Vector3(Math.cos(elev) * Math.sin(azim), Math.sin(elev), Math.cos(elev) * Math.cos(azim)).normalize();
  const moonDir = sunDir.clone().negate();
  const sunElev = sunDir.y;
  state.night = 1 - smoothstep(-0.16, 0.05, sunElev);
  paletteAt(state.phase);
  scene.fog.color.copy(PAL.fog); scene.fog.density = PAL.fogD;
  renderer.toneMappingExposure = PAL.expo;
  skyMat.uniforms.uExposure.value = PAL.expo;
  oceanUniforms.uExposure.value = PAL.expo;
  oceanFarMat.uniforms.uExposure.value = PAL.expo;
  foamMat.uniforms.uExposure.value = PAL.expo;
  starMat.uniforms.uExposure.value = PAL.expo;

  skyMat.uniforms.uTop.value.copy(PAL.top);
  skyMat.uniforms.uBot.value.copy(PAL.bot);
  skyMat.uniforms.uSun.value.copy(PAL.sun).multiplyScalar(0.55 + state.night * 0.1);
  skyMat.uniforms.uSunDir.value.copy(sunElev > -0.02 ? sunDir : moonDir);
  skyMat.uniforms.uHaze.value = 1 - state.night * 0.5;
  skyDome.position.copy(camera.position);

  starMat.uniforms.uOpacity.value = PAL.star * QUALITY[state.quality].stars;
  starMat.uniforms.uTime.value = elapsed;
  stars.position.copy(camera.position);

  const isNight = sunElev < -0.04;
  const lightDir = isNight ? moonDir : sunDir;
  sun.position.copy(rig.position).addScaledVector(lightDir, 160);
  sun.target.position.copy(rig.position);
  sun.color.copy(isNight ? C(0xa8c8ff) : PAL.sun);
  sun.intensity = PAL.sunI * (isNight ? 0.85 : 1);
  hemi.color.copy(PAL.top).lerp(C(0x9db8e8), state.night * 0.55);
  hemi.groundColor.copy(PAL.fog).lerp(C(0x2c3858), state.night * 0.85);
  hemi.intensity = PAL.hemi;
  amb.color.copy(PAL.fog).lerp(C(0x93aadb), state.night * 0.78);
  amb.intensity = PAL.amb;
  rimLight.color.copy(PAL.bot); rimLight.intensity = 0.20 + state.night * 0.12;
  rimLight.position.copy(rig.position).setY(rig.position.y + 14);
  rimLight.target.position.copy(rig.position);
  rimLight.position.addScaledVector(tmpV.set(0, 0, -1).applyQuaternion(rig.quaternion), -26);

  oceanUniforms.uTime.value = elapsed;
  oceanUniforms.uDeep.value.copy(PAL.deep); oceanUniforms.uShal.value.copy(PAL.shal);
  oceanUniforms.uSky.value.copy(PAL.bot).lerp(PAL.top, 0.35);
  oceanUniforms.uLightDir.value.copy(lightDir);
  oceanUniforms.uLightCol.value.copy(isNight ? C(0xbcd8ff) : PAL.sun);
  oceanUniforms.uFogColor.value.copy(PAL.fog); oceanUniforms.uFogDensity.value = PAL.fogD;
  oceanUniforms.uNight.value = state.night;
  ocean.position.set(camera.position.x, -3.5, camera.position.z);
  oceanFarMat.uniforms.uDeep.value.copy(PAL.deep);
  oceanFarMat.uniforms.uSky.value.copy(PAL.bot);
  oceanFarMat.uniforms.uFogColor.value.copy(PAL.fog);
  oceanFarMat.uniforms.uFogDensity.value = PAL.fogD;
  oceanFar.position.set(camera.position.x, -3.55, camera.position.z);
  foamMat.uniforms.uTime.value = elapsed;
  foamMat.uniforms.uNight.value = state.night;
  foamMat.uniforms.uFogColor.value.copy(PAL.fog);
  foamMat.uniforms.uFogDensity.value = PAL.fogD;
  foamMat.uniforms.uStrength.value = 0.75 + 0.35 * Math.sin(elapsed * 0.23);

  if (state.night > 0.85) unlock('a9');
  sunDisc.position.copy(camera.position).addScaledVector(sunDir, 4600);
  moonDisc.position.copy(camera.position).addScaledVector(moonDir, 4600);
  sunGlow.position.copy(sunDisc.position); moonGlow.position.copy(moonDisc.position);
  sunDisc.visible = sunElev > -0.30;
  sunGlow.material.opacity = clamp(smoothstep(-0.30, 0.10, sunElev), 0, 1) * 0.82;
  moonDisc.visible = moonDisc.position.y > camera.position.y - 200;
  moonGlow.material.opacity = clamp(state.night * 1.1, 0, 1);
  moonDisc.material.opacity = 1;
  const sunTint = new THREE.Color(0xff9a52).lerp(new THREE.Color(0xfff2d0), clamp(sunElev * 3 + 0.4, 0, 1));
  sunDisc.material.color.copy(sunTint);
  sunGlow.material.color.copy(sunTint);

  /* ---- 鱼 ---- */
  spawnFish(dt);
  updateFish(dt);

  /* ---- 相机 ---- */
  updateCamera(dt);

  /* ---- 音效 ---- */
  AUD.update(dt, state.speed, cadence * 60, state.night);

  /* ---- 自适应画质 ---- */
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 1.0) {
    state.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
    qTimer++;
    if (qTimer >= 2) {
      qTimer = 0;
      if (state.fps < 42 && state.quality > 0) applyQuality(state.quality - 1);
      else if (state.fps > 58 && state.quality < 3) applyQuality(state.quality + 1);
    } else {
      document.getElementById('quality').textContent = `画质 ${QUALITY[state.quality].name} · ${Math.round(state.fps)}fps`;
    }
  }

  /* ---- HUD ---- */
  hudTick();

  renderer.render(scene, camera);
}

/* ---------- 腿的 IK（两段） ---------- */
const DOWN = new THREE.Vector3(0, -1, 0);
const BEND_AXIS = new THREE.Vector3(1, 0, 0);
const _ikT = new THREE.Vector3(), _ikD = new THREE.Vector3(), _ikK = new THREE.Vector3(), _ikQ = new THREE.Quaternion();
function placeLeg(leg, targetWorld) {
  const parent = leg.hip.parent;                      // pel 组
  _ikT.copy(targetWorld);
  parent.worldToLocal(_ikT);
  _ikD.subVectors(_ikT, leg.hip.position);
  const dist = clamp(_ikD.length(), 0.06, (LEG_L1 + LEG_L2) * 0.995);
  const dir = _ikD.clone().normalize();
  const cosA = clamp((LEG_L1 * LEG_L1 + dist * dist - LEG_L2 * LEG_L2) / (2 * LEG_L1 * dist), -1, 1);
  const a = Math.acos(cosA);
  _ikQ.setFromAxisAngle(BEND_AXIS, -a);
  const upDir = dir.clone().applyQuaternion(_ikQ).normalize();
  leg.hip.quaternion.setFromUnitVectors(DOWN, upDir);
  _ikK.copy(leg.hip.position).addScaledVector(upDir, LEG_L1);
  const remDir = _ikT.clone().sub(_ikK).normalize();
  leg.knee.quaternion.setFromUnitVectors(DOWN, remDir);
  leg.ankle.rotation.set(0.32, 0, 0);
}

/* ---------- 围巾布料模拟 ---------- */
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _swind = new THREE.Vector3();
const SCARF_ANCHOR = new THREE.Vector3(0.01, 1.845, 0.34);
const _wpos = [];
for (let i = 0; i < SC; i++) _wpos.push(new THREE.Vector3());
function updateScarf(dt) {
  /* 在鹈鹕局部空间模拟：锚点恒定，只受“相对气流线性阻力 + 重力”。
     阻力做成对节点速度的线性阻尼 → 自带耗散，不会自激振荡。 */
  if (scarfNodes[0].p.lengthSq() === 0) {
    for (let i = 0; i < SC; i++) {
      const n = scarfNodes[i];
      n.p.copy(SCARF_ANCHOR);
      n.p.z -= i * scarfSeg * 0.75;
      n.p.y -= i * scarfSeg * 0.55;
      n.q.copy(n.p);
    }
  }
  const sub = 3, h = dt / sub, h2 = h * h;
  /* 相对气流：鹈鹕局部系里空气以 -speed 沿 -Z 流过，另有横向微扰 */
  const airX = Math.sin(elapsed * 3.7) * (0.5 + state.speed * 0.055);
  const airZ = -state.speed;
  const drag = 6.0, grav = -14.0;
  const dampF = clamp(1 - drag * h, 0.5, 1);
  const kAir = drag * h2;
  for (let s = 0; s < sub; s++) {
    for (let i = 1; i < SC; i++) {
      const n = scarfNodes[i];
      const vx = n.p.x - n.q.x, vy = n.p.y - n.q.y, vz = n.p.z - n.q.z;
      n.q.copy(n.p);
      n.p.x += vx * dampF + kAir * airX;
      n.p.y += vy * dampF + grav * h2;
      n.p.z += vz * dampF + kAir * airZ;
    }
    scarfNodes[0].p.copy(SCARF_ANCHOR);
    for (let it = 0; it < 6; it++) {
      for (let i = 1; i < SC; i++) {
        const a = scarfNodes[i - 1], b = scarfNodes[i];
        _v3.subVectors(b.p, a.p);
        const d = _v3.length() || 1e-5;
        _v3.multiplyScalar((d - scarfSeg) / d * 0.5);
        b.p.sub(_v3);
      }
    }
  }
  const tipSpeed = scarfNodes[SC - 1].p.distanceTo(scarfNodes[SC - 1].q) / Math.max(dt / sub, 1e-4);
  if (tipSpeed > 13 && state.speed > 18) unlock('a13');
  for (let i = 0; i < SC; i++) { _wpos[i].copy(scarfNodes[i].p); pel.localToWorld(_wpos[i]); }
  const arr = scarfGeo.attributes.position.array;
  for (let i = 0; i < SC; i++) {
    const nxt = _wpos[Math.min(i + 1, SC - 1)];
    const prv = _wpos[Math.max(i - 1, 0)];
    _v1.subVectors(nxt, prv);
    if (_v1.lengthSq() < 1e-9) _v1.set(0, 0, 1); else _v1.normalize();
    _v2.crossVectors(_v1, UP);
    if (_v2.lengthSq() < 1e-7) _v2.set(1, 0, 0); else _v2.normalize();
    _v2.multiplyScalar(lerp(0.05, 0.13, i / (SC - 1)));
    const w = _wpos[i], o = i * 6;
    arr[o] = w.x - _v2.x; arr[o + 1] = w.y - _v2.y; arr[o + 2] = w.z - _v2.z;
    arr[o + 3] = w.x + _v2.x; arr[o + 4] = w.y + _v2.y; arr[o + 5] = w.z + _v2.z;
  }
  scarfGeo.attributes.position.needsUpdate = true;
  scarfGeo.computeVertexNormals();
  scarfMesh.visible = state.quality >= 1;
}

/* ---------- 鱼 ---------- */
let fishTimer = 0.6;
const _fp = new THREE.Vector3(), _fp2 = new THREE.Vector3();
const easeOut = (u) => 1 - (1 - u) * (1 - u);
function fishPos(f, u, out) {
  const eu = easeOut(u);
  const lat = lerp(f.lat0, f.lat1, eu);
  const base = lerp(-3.30, 0.30, eu);
  return out.set(f.frame.p.x + f.frame.r.x * lat, base + Math.sin(u * Math.PI) * f.apex, f.frame.p.z + f.frame.r.z * lat);
}
function spawnFish(dt) {
  fishTimer -= dt;
  if (fishTimer > 0) return;
  fishTimer = rand(0.45, 1.25);
  const f = fishPool.find((x) => !x.active);
  if (!f) return;
  /* 跃出点距离与滞空时间联动，保证骑到鱼的位置时它正好在弧线后段 */
  const lead = state.speed * rand(1.5, 1.9) + 16;
  const s = state.s + lead;
  const fr = TRACK.sample(s, { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), u: 0 });
  f.s = s; f.frame.p.copy(fr.p); f.frame.r.copy(fr.r);
  f.lat0 = rand(24, 52);          // 从海面跃出
  f.lat1 = rand(-3.8, 5.6);       // 落到公路某条车道上
  f.apex = rand(3.6, 7.6);
  f.dur = clamp(lead / Math.max(state.speed, 7) * rand(1.03, 1.16), 1.0, 4.4);
  f.t = 0; f.active = true; f.caught = false;
  f.mesh.visible = true;
  f.mesh.scale.setScalar(rand(1.15, 1.85));
}
function updateFish(dt) {
  for (const f of fishPool) {
    if (!f.active) continue;
    f.t += dt;
    const u = f.t / f.dur;
    if (u >= 1) { f.active = false; f.mesh.visible = false; continue; }
    fishPos(f, u, _fp);
    f.mesh.position.copy(_fp);
    fishPos(f, Math.min(u + 0.03, 1), _fp2);
    f.mesh.lookAt(_fp2);
    f.mesh.rotateZ(Math.sin(f.t * 10) * 0.30);
    if (f.caught) continue;
    let ds = f.s - state.s;
    ds = ((ds % TRACK.length) + TRACK.length) % TRACK.length;
    if (ds > TRACK.length / 2) ds -= TRACK.length;
    const dlat = lerp(f.lat0, f.lat1, easeOut(u)) - state.lateral;
    if (Math.abs(ds) < 5.0 && Math.abs(dlat) < 4.2) {
      beakTip.getWorldPosition(_fp2);
      if (Math.abs(_fp2.y - f.mesh.position.y) < 2.8) {
        f.caught = true; f.active = false; f.mesh.visible = false;
        state.fish++; AUD.catchFish();
        if (state.fish >= 1) unlock('a1');
        if (state.fish >= 10) unlock('a2');
        if (state.fish >= 30) unlock('a3');
      }
    }
  }
}

function triggerWheelie(t = 2.2) {
  if (state.wheelieT <= 0) unlock('a4');
  state.wheelieT = Math.max(state.wheelieT, t);
  if (state.wheelieT > 0) unlock('a4');
  AUD.flap();
}

/* ---------- 相机 ---------- */
function updateCamera(dt) {
  const back = tmpV.set(0, 0, -1).applyQuaternion(rig.quaternion);
  const side = tmpV2.set(1, 0, 0).applyQuaternion(rig.quaternion);
  const headW = beakTip.getWorldPosition(_v2).clone();
  state.camT += dt;
  let desiredPos = camPos, desiredLook = camLook;

  if (state.cam === 0) {
    const d = 5.3 + state.speed * 0.075;
    desiredPos.copy(rig.position).addScaledVector(back, d);
    desiredPos.y = rig.position.y + Math.max(1.55, 2.05 + Math.min(state.y, 1.2) * 0.25);
    desiredPos.addScaledVector(side, -state.lateral * 0.06);
    desiredLook.copy(headW).addScaledVector(UP, 0.15);
  } else if (state.cam === 1) {
    const t = state.camT;
    const orbit = Math.sin(t * 0.22) * 1.15;
    const rad = 9 + Math.sin(t * 0.17) * 4.5;
    const hgt = 3.2 + Math.sin(t * 0.11) * 2.6 + 2.2;
    const dir = new THREE.Vector3().copy(back).applyAxisAngle(UP, orbit);
    desiredPos.copy(rig.position).addScaledVector(dir, rad).addScaledVector(UP, hgt);
    desiredLook.copy(headW).addScaledVector(UP, 0.6 + Math.sin(t * 0.3) * 0.5);
    if (state.night > 0.6) { starGazeT += dt; if (starGazeT > 7) unlock('a10'); }
  } else if (state.cam === 2) {
    const hp = headGrp.getWorldPosition(_v1).clone();
    const fwd = tmpV.set(0, 0, 1).applyQuaternion(rig.quaternion);
    desiredPos.copy(hp).addScaledVector(fwd, 0.05).addScaledVector(UP, 0.52);
    desiredLook.copy(desiredPos).addScaledVector(fwd, 14).addScaledVector(UP, -0.35);
  } else if (state.cam === 3) {
    desiredPos.copy(rig.position).addScaledVector(back, 3.0).addScaledVector(UP, 0.55);
    desiredLook.copy(rig.position).addScaledVector(back, -6).addScaledVector(UP, 1.5);
  } else {
    const rad = 5.6, a = state.camT * 1.5;
    desiredPos.copy(rig.position).addScaledVector(side, Math.cos(a) * rad).addScaledVector(back, Math.sin(a) * rad).addScaledVector(UP, 1.9);
    desiredLook.copy(headW);
  }
  const pL = state.cam === 2 ? 22 : (state.cam === 1 ? 2.6 : 5.5);
  posSmooth.copy(posSmooth.lengthSq() === 0 ? desiredPos : posSmooth);
  posSmooth.lerp(desiredPos, 1 - Math.exp(-pL * dt));
  lookSmooth.lerp(desiredLook, 1 - Math.exp(-(pL + 1.5) * dt));
  camera.position.copy(posSmooth);
  camera.lookAt(lookSmooth);
  if (state.cam === 2) camera.rotateZ(-leanSmooth * 0.16);
  const fov = clamp(55 + state.speed * 0.55, 55, 76);
  camera.fov = damp(camera.fov, fov, 3, dt);
  camera.updateProjectionMatrix();
}

/* ---------- HUD ---------- */
let hudT = 0;
const $spd = document.getElementById('spd'), $fish = document.getElementById('fish'),
  $dist = document.getElementById('dist'), $clock = document.getElementById('clockTxt'),
  $dot = document.getElementById('clockDot'), $rel = document.getElementById('rel');
function hudTick() {
  hudT += 1;
  if (hudT % 6) return;
  $spd.textContent = Math.round(state.speed * 3.6);
  $fish.textContent = state.fish;
  $dist.textContent = (state.dist / 1000).toFixed(2);
  const p = state.phase;
  let name = '黄昏', col = '#ffb066';
  if (p < 0.06) { name = '黄昏'; col = '#ff9a52'; }
  else if (p < 0.17) { name = '暮色'; col = '#c07ad0'; }
  else if (p < 0.44) { name = '星夜'; col = '#9dc4ff'; }
  else if (p < 0.55) { name = '黎明'; col = '#ffb877'; }
  else if (p < 0.72) { name = '晨光'; col = '#ffe0a8'; }
  else if (p < 0.9) { name = '白昼'; col = '#bfe0ff'; }
  else { name = '日落'; col = '#ff9a52'; }
  $clock.textContent = name;
  $dot.style.background = col; $dot.style.boxShadow = `0 0 10px ${col}`;
  $rel.style.opacity = state.auto ? '1' : '0';
}

/* ---------- 启动 ---------- */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
window.addEventListener('touchstart', () => AUD.init(), { once: true });
addEventListener('pointerdown', () => AUD.init(), { once: true });

/* 可选参数：?auto=1 跳过开场直接骑行；?phase=0.3 指定昼夜相位；?cam=2 指定镜头 */
const QS = new URLSearchParams(location.search);
if (QS.has('phase')) { elapsed = parseFloat(QS.get('phase')) * 210 || 0; }
if (QS.has('cam')) { state.cam = clamp(parseInt(QS.get('cam'), 10) || 0, 0, 4); document.getElementById('cameraName').textContent = CAMS[state.cam]; }

document.getElementById('go').addEventListener('click', () => {
  AUD.init();
  document.getElementById('boot').classList.add('hide');
  document.getElementById('hud').classList.add('on');
  document.getElementById('load').textContent = '';
  state.lastInput = performance.now();
  clock.getDelta();
  setTimeout(() => { running = true; state.lastInput = performance.now(); }, 120);
});
document.getElementById('load').textContent = '海岸线就绪 · 点击开始';
applyQuality(2);
TRACK.sample(0, fFrame);
rigWorld();
camera.position.set(fFrame.p.x - fFrame.t.x * 7 + fFrame.r.x * 2, 3.2, fFrame.p.z - fFrame.t.z * 7 + fFrame.r.z * 2);
camera.lookAt(rig.position.x, rig.position.y + 1.6, rig.position.z);
posSmooth.copy(camera.position);
lookSmooth.set(rig.position.x, rig.position.y + 1.6, rig.position.z);
starMat.uniforms.uPR.value = renderer.getPixelRatio();
renderer.render(scene, camera);
window.__state = state; window.__ACH = unlocked; window.__AUD = AUD;
window.__scarf = scarfNodes; window.__pel = pel; window.__cam = camera;
if (QS.has('auto')) {
  running = true;
  if (QS.has('speed')) state.speed = parseFloat(QS.get('speed')) || 0;
  state.lastInput = QS.has('ap') ? 0 : performance.now() + 999999;
  if (QS.has('ap')) state.auto = true;
  document.getElementById('boot').classList.add('hide');
  document.getElementById('hud').classList.add('on');
}
renderer.setAnimationLoop(loop);
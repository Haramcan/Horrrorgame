// "Fears to Fathom"-artiger Look: niedrige Rendering-Auflösung, harte Pixel, Farbquantisierung mit Dithering,
// VHS-Artefakte (Farbsaum, Scanlines, Rauschen, leichtes Zittern), entsättigte Farben, Vignette.
import * as THREE from 'three';

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = `
uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes;
uniform float uGrain, uAberr, uScan, uVig, uLevels, uSat, uWobble, uLift, uFlash;
uniform vec3 uTint;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float bayer4(vec2 p){
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  float m[16] = float[16](0.,8.,2.,10., 12.,4.,14.,6., 3.,11.,1.,9., 15.,7.,13.,5.);
  return m[x + 4 * y] / 16.0;
}
void main(){
  vec2 uv = vUv;
  float line = floor(uv.y * uRes.y);
  float t24 = floor(uTime * 24.0);
  // VHS-Zittern pro Zeile, dazu ein langsam wandernder Störstreifen
  float wob = (hash(vec2(line, t24)) - 0.5) * 0.0006 * uWobble;
  float bandY = fract(uTime * 0.045);
  float band = smoothstep(0.03, 0.0, abs(uv.y - bandY)) * 0.006 * uWobble * step(0.7, hash(vec2(floor(uTime * 0.3), 1.0)));
  uv.x += wob + band;
  vec2 px = vec2(1.0 / uRes.x, 0.0);
  vec3 col;
  col.r = texture2D(tDiffuse, uv + px * uAberr).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - px * uAberr).b;
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, uSat) * uTint;
  col = col * (1.0 - uLift) + uLift * 0.5 * vec3(0.55, 0.6, 0.7) * 0.25;   // angehobene Schwarzwerte wie bei Bandmaterial
  col += (hash(floor(uv * uRes) + fract(uTime) * 91.0) - 0.5) * uGrain;
  col *= 1.0 - uScan * (0.5 + 0.5 * sin(uv.y * uRes.y * 6.28318));
  vec2 cell = floor(uv * uRes);
  float d = (bayer4(cell) - 0.5) / uLevels;
  col = floor((col + d) * uLevels + 0.5) / uLevels;
  col *= 1.0 - uVig * pow(length(vUv - 0.5) * 1.35, 2.4);
  col += uFlash;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export class FtfLook {
  constructor(renderer, opts = {}) {
    this.r = renderer; this.enabled = true; this.height = opts.height || 300;
    this.u = {
      tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uGrain: { value: 0.07 }, uAberr: { value: 1.0 }, uScan: { value: 0.10 }, uVig: { value: 0.55 }, uLevels: { value: 26 },
      uSat: { value: 0.78 }, uWobble: { value: 1.0 }, uLift: { value: 0.05 }, uFlash: { value: 0 }, uTint: { value: new THREE.Color(1.0, 0.97, 0.9) }
    };
    this.quadScene = new THREE.Scene(); this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false }));
    this.quadScene.add(this.quad);
    this.resize();
  }
  resize() {
    const lh = this.height, lw = Math.max(2, Math.round(lh * innerWidth / innerHeight));
    if (this.rt) this.rt.dispose();
    this.rt = new THREE.WebGLRenderTarget(lw, lh, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
    this.u.tDiffuse.value = this.rt.texture; this.u.uRes.value.set(lw, lh);
  }
  setHeight(h) { this.height = h; this.resize(); }
  render(scene, camera) {
    if (!this.enabled) { this.r.setRenderTarget(null); this.r.render(scene, camera); return; }
    this.u.uTime.value = performance.now() / 1000;
    this.r.setRenderTarget(this.rt); this.r.clear(); this.r.render(scene, camera);
    this.r.setRenderTarget(null); this.r.render(this.quadScene, this.quadCam);
  }
}

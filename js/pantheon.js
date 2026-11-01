// The Pantheon: four deities on a full-screen quad.
//
// Ported from prototypes/pantheon.html. The fragment shader and the behaviour
// logic (wake, attention lag, twitches, threads) are the prototype's; what
// changed is that raw WebGL became a three.js ShaderMaterial, and that the
// thing now behaves itself on a real page: it renders below native resolution,
// caps DPR, stops when you scroll past it or hide the tab, and steps aside for
// prefers-reduced-motion and for phones.

import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

// ---- the four hats ----
const HATS = [
  { name: 'XR',        sub: 'immersive work for brands and science', kind: 2, seed: 0.13, href: '#xr' },
  { name: 'Tools',     sub: 'pipelines that help teams',             kind: 1, seed: 0.71, href: '#tools' },
  { name: 'Art',       sub: 'delight, then question it',             kind: 0, seed: 0.42, href: '#art' },
  { name: 'Community', sub: 'Free the Motive and more',              kind: 3, seed: 0.29, href: '#community' }
];

const RB = 0.85, CAMZ = 7, FOC = 1.6;

// Render below native resolution and let CSS scale it up. The brief asks for
// 0.6 to 0.75; 0.7 holds detail on the deities' edges without the fan starting.
const RENDER_SCALE = 0.7;
const MAX_DPR = 2;

const stage = document.getElementById('pantheon');
const glc = document.getElementById('pantheon-gl');
const tc = document.getElementById('pantheon-threads');
const fallback = document.getElementById('pantheon-fallback');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallScreen = window.matchMedia('(max-width: 768px)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

// Load the page as index.html?capture to keep the drawing buffer around, so the
// canvas can be read back into assets/pantheon-still.jpg. Off by default: it
// costs performance and nothing else needs it.
const captureMode = new URLSearchParams(location.search).has('capture');

function showFallback() {
  if (fallback) fallback.hidden = false;
  if (glc) glc.hidden = true;
  if (tc) tc.hidden = true;
  if (stage) stage.classList.add('is-fallback');
}

function start() {
  const renderer = new THREE.WebGLRenderer({
    canvas: glc,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: captureMode
  });

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const uniforms = {
    uRes:   { value: new THREE.Vector2(1, 1) },
    uTime:  { value: 0 },
    uPos:   { value: [0, 1, 2, 3].map(() => new THREE.Vector3()) },
    uState: { value: [0, 1, 2, 3].map(() => new THREE.Vector4()) },
    uRot:   { value: [0, 1, 2, 3].map(() => new THREE.Vector2()) },
    uSeed:  { value: [0, 0, 0, 0] }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  const ctx = tc.getContext('2d');

  const deities = HATS.map((h) => {
    const el = document.createElement('a');
    el.className = 'deity-label';
    el.href = h.href;
    el.innerHTML = h.name + '<small>' + h.sub + '</small>';
    stage.appendChild(el);
    return {
      h: h, el: el, pos: [0, 0, 0], wake: 0, phase: Math.random() * 10, twitch: 0,
      next: 2 + Math.random() * 6, yaw: Math.random() * 6, pitch: h.kind === 1 ? 0.55 : 0,
      yawT: 0, pitchT: 0, sx: 0, sy: 0, sr: 0
    };
  });

  let W = 0, H = 0;

  function layout() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    renderer.setPixelRatio(dpr * RENDER_SCALE);
    renderer.setSize(W, H, true);
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    uniforms.uRes.value.set(buf.x, buf.y);

    // The threads overlay is cheap 2D, so it stays at full sharpness.
    tc.width = Math.round(W * dpr);
    tc.height = Math.round(H * dpr);
    tc.style.width = W + 'px';
    tc.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const aspect = W / H;
    const halfW = (aspect / 2) * CAMZ / FOC, halfH = 0.5 * CAMZ / FOC;
    if (aspect >= 1) {
      const span = Math.min(halfW - RB - 0.2, 3.0);
      deities.forEach(function (d, i) {
        const x = -span + i * (2 * span / 3);
        d.pos = [x, 0.35 + 0.22 * Math.sin(i * 1.9), 0];
      });
    } else {
      deities.forEach(function (d, i) {
        const x = (i % 2 ? 1 : -1) * Math.min(halfW - RB - 0.05, 1.1);
        const y = (i < 2 ? 1 : -0.3) * Math.min(halfH * 0.55, 1.25) + 0.4;
        d.pos = [x, y, 0];
      });
    }
  }
  window.addEventListener('resize', layout);
  layout();

  function proj(p) {
    const s = FOC / (CAMZ + p[2]);
    return [W / 2 + p[0] * s * H, H / 2 - p[1] * s * H];
  }

  function pushUniforms() {
    deities.forEach(function (d, i) {
      uniforms.uPos.value[i].set(d.pos[0], d.pos[1], d.pos[2]);
      uniforms.uState.value[i].set(d.wake, d.phase, d.twitch, d.h.kind);
      uniforms.uRot.value[i].set(d.yaw, d.pitch);
      uniforms.uSeed.value[i] = d.h.seed;
    });
  }

  // ---- reduced motion: one frame, half awake, then nothing moves ----
  if (reducedMotion) {
    deities.forEach(function (d, i) {
      d.wake = 0.55;
      d.phase = 2 + i * 1.7;
      d.yaw = d.h.seed * 2;
      d.el.style.left = '0px';
      d.el.style.opacity = 1;
    });
    pushUniforms();
    uniforms.uTime.value = 6;
    renderer.render(scene, camera);
    placeLabels();
    return;
  }

  function placeLabels() {
    deities.forEach(function (d) {
      const sp = proj(d.pos);
      d.sx = sp[0]; d.sy = sp[1];
      d.sr = RB * FOC / CAMZ * H;
      d.el.style.left = d.sx + 'px';
      d.el.style.top = (d.sy + d.sr * 1.05) + 'px';
    });
  }

  // ---- pointer ----
  const mouse = { x: -9999, y: -9999, active: false, last: -99 };
  function mv(e) {
    const r = stage.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
    mouse.last = performance.now() / 1000;
  }
  stage.addEventListener('pointermove', mv);
  stage.addEventListener('pointerdown', mv);
  stage.addEventListener('pointerleave', function () { mouse.active = false; });

  function ss(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const x = ax + t * dx - px, y = ay + t * dy - py;
    return Math.sqrt(x * x + y * y);
  }

  // ---- only run while the hero is on screen and the tab is visible ----
  let onScreen = true, rafId = 0;
  const t0 = performance.now() / 1000;
  let prev = t0;

  function running() { return onScreen && !document.hidden; }

  function resume() {
    if (rafId || !running()) return;
    prev = performance.now() / 1000;   // don't let a huge dt snap everything
    rafId = requestAnimationFrame(frame);
  }
  function suspend() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', function () {
    if (running()) resume(); else suspend();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (running()) resume(); else suspend();
    }, { threshold: 0 }).observe(stage);
  }

  function frame() {
    rafId = 0;
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - prev);
    prev = now;
    const time = now - t0;

    const present = mouse.active && (now - mouse.last) < 6;

    let tx, ty;
    if (present) {
      const s = FOC / (CAMZ - 2.5);
      tx = (mouse.x - W / 2) / (s * H);
      ty = -(mouse.y - H / 2) / (s * H);
    } else {
      tx = Math.sin(time * 0.13) * 3;
      ty = Math.sin(time * 0.21 + 1) * 1.2;
    }

    deities.forEach(function (d) {
      const sp = proj(d.pos);
      d.sx = sp[0]; d.sy = sp[1];
      d.sr = RB * FOC / CAMZ * H;

      const dist = Math.hypot(mouse.x - d.sx, mouse.y - d.sy);
      const target = present ? ss(3.0 * d.sr, 0.7 * d.sr, dist) : 0;
      d.wake += (target - d.wake) * (target > d.wake ? 3.5 : 0.6) * dt;
      d.phase += dt * (0.18 + 0.9 * d.wake);

      if (time > d.next) {
        d.twitch = 0.6 + 0.4 * Math.random();
        d.next = time + (d.wake > 0.5 ? 1.5 : 4) + Math.random() * 7;
        d.yaw += (Math.random() - 0.5) * 0.6;
      }
      d.twitch *= Math.exp(-dt * 5);

      const dx = tx - d.pos[0], dy = ty - d.pos[1], dz = -2.5 - d.pos[2];
      const engage = present ? 0.35 + 0.65 * d.wake : 0.25;
      d.yawT = Math.atan2(dx, -dz) * engage + time * 0.05 * (1 - d.wake) + d.h.seed * 2;
      d.pitchT = (d.h.kind === 1 ? 0.55 : 0) - Math.atan2(dy, Math.hypot(dx, dz)) * engage * 0.8;
      d.yaw += (d.yawT - d.yaw) * (1 - Math.exp(-dt * (1.2 + 2 * d.wake)));
      d.pitch += (d.pitchT - d.pitch) * (1 - Math.exp(-dt * (1.2 + 2 * d.wake)));

      d.el.style.left = d.sx + 'px';
      d.el.style.top = (d.sy + d.sr * 1.05) + 'px';
      d.el.style.opacity = Math.max(0, (d.wake - 0.15) / 0.85).toFixed(3);
    });

    pushUniforms();
    uniforms.uTime.value = time;
    renderer.render(scene, camera);

    // threads: you are the thing that connects the hats
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        const A = deities[a], B = deities[b];
        const near = present ? ss(220, 10, segDist(mouse.x, mouse.y, A.sx, A.sy, B.sx, B.sy)) : 0;
        const alpha = 0.035 + 0.35 * near * (0.4 + 0.6 * Math.max(A.wake, B.wake)) + 0.1 * (A.wake * B.wake);
        let mx = (A.sx + B.sx) / 2, my = (A.sy + B.sy) / 2;
        const nx = -(B.sy - A.sy), ny = (B.sx - A.sx), nl = Math.hypot(nx, ny) || 1;
        const sag = Math.sin(time * 0.7 + a * 1.3 + b * 2.1) * 18 + (b - a) * 14;
        if (present && near > 0) { mx += (mouse.x - mx) * near * 0.35; my += (mouse.y - my) * near * 0.35; }
        ctx.strokeStyle = 'rgba(210,245,235,' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.quadraticCurveTo(mx + nx / nl * sag, my + ny / nl * sag, B.sx, B.sy);
        ctx.stroke();
      }
    }
    if (present) {
      deities.forEach(function (d) {
        if (d.wake < 0.05) return;
        ctx.strokeStyle = 'rgba(198,255,61,' + (d.wake * 0.45).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.quadraticCurveTo((mouse.x + d.sx) / 2, (mouse.y + d.sy) / 2 - 30 * Math.sin(time * 1.3), d.sx, d.sy);
        ctx.stroke();
      });
    }

    if (running()) rafId = requestAnimationFrame(frame);
  }

  resume();
}

const VERT = `
void main(){
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `uniform vec2 uRes;
uniform float uTime;
uniform vec3 uPos[4];
uniform vec4 uState[4];   // wake, phase, twitch, kind
uniform vec2 uRot[4];     // yaw, pitch
uniform float uSeed[4];

#define RB 0.85
#define SA 6.2
#define SB 4.0

mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
float sdBox(vec3 p, vec3 s){p=abs(p)-s;return length(max(p,0.))+min(max(p.x,max(p.y,p.z)),0.);}
float sdBox2d(vec2 p, vec2 s){p=abs(p)-s;return length(max(p,0.))+min(max(p.x,p.y),0.);}

// Amorphous butterfly (your shadertoy SDF, re-centred)
float deityA(vec3 q, float t, float amp){
  vec3 bp = q - vec3(0.,2.4,0.);
  bp.z = abs(bp.z)-.5;
  bp.z -= .7;
  bp.y -= 2.*min(0., q.y);
  float scale = mix(1.,4., smoothstep(-1.,1.,bp.y));
  bp.xz *= scale;
  bp.xz *= Rot(smoothstep(0.,1.,bp.y));
  bp.y -= sin(bp.y*.6 + t*.8);
  bp.z += sin(bp.z*2.);
  float box = sdBox(bp, vec3(1.,1.5,1.))/scale;
  box -= sin((q.x+2.)*2.+t*2.)*.1*amp;
  box = abs(box)-.2;
  return box*.5;
}

// Torii twisted ring (your p5 SDF; poseBox.x is now driven by wake)
float deityB(vec3 q, float t, float k){
  vec2 cp = vec2(length(q.xz)-1.7, q.y) - vec2(.5,0.);
  float a = atan(q.x, q.z);
  cp *= Rot(a*.5 + t*1.5);
  cp.y = abs(cp.y)-.7;
  float d = sdBox2d(cp, vec2(.1, .4*(sin(k*a)*.5+.5)))-.1;
  return d*.6;
}


float smin(float a, float b, float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }

// Soft morph displacement: two octaves of drifting sine noise with a little domain warp.
// Stand-in for the Blender displacement. Swap for proper 3D noise later.
float morph(vec3 p, float t){
  vec3 w = p + .15*vec3(sin(p.y*3.+t*.7), sin(p.z*3.+t*.9), sin(p.x*3.+t*.6));
  float n = sin(w.x*4.1+t)*sin(w.y*3.7-t*.8)*sin(w.z*4.3+t*.6);
  n += .5*sin(w.x*9.+t*1.3)*sin(w.y*8.3+t)*sin(w.z*9.7-t*1.1);
  return n;
}

// Blue blob (Blender morph 1): a body with a horn, a bulb and a knuckle, all melting into each other
float deityC(vec3 p, float t, float amp){
  p.xy *= Rot(-.45);
  float body = (length(p*vec3(1.,.82,1.05)) - .40);
  vec3 hornTip = vec3(.14 + .05*sin(t*.9), .66 + .04*sin(t*1.3), .05);
  float horn = sdCapsule(p, vec3(.04,.22,0.), hornTip, .075 + .015*sin(t*1.7));
  vec3 bulbEnd = vec3(-.40 + .04*sin(t*.8+1.), -.46, -.18);
  float bulb = sdCapsule(p, vec3(-.12,-.24,.04), bulbEnd, .11);
  float knuckle = length(p - vec3(-.26,.24 + .03*sin(t), -.12)) - .15;
  float lump = length(p - vec3(.28,-.12,-.2)) - .13;
  float d = smin(body, horn, .14);
  d = smin(d, bulb, .16);
  d = smin(d, knuckle, .12);
  d = smin(d, lump, .14);
  d += .045*amp*morph(p*1.4, t);
  return d*.7;
}

// Purple shell (Blender morph 2): a wrinkled, folded open shell that breathes open and closed
float deityD(vec3 p, float t, float amp){
  vec3 q = p;
  q.xy *= Rot(.35);
  q.x += .12*q.y*q.y;                                   // lean / curl
  q.x += .22*max(q.y,0.)*max(q.y,0.)*3.;
  float e = (length(q/vec3(.62,.42,.45)) - 1.)*.40;     // ellipsoid
  e += .035*amp*morph(q*1.6, t) + .012*sin(q.y*22.+t*2.)*sin(q.x*18.);  // lumps + wrinkles
  float shell = abs(e) - .03;
  float open = .02 + .09*(.5+.5*sin(t*.8));            // the mouth breathes
  float cut = dot(q, normalize(vec3(.35,-.15,-1.))) - open + .05*sin(q.y*6.+t);
  float d = max(shell, cut);
  return d*.65;
}

float mapD(vec3 p, vec3 c, vec2 rot, vec4 st, float seed){
  vec3 l = p - c;
  float br = 1. + (.035*sin(uTime*.9+seed*6.) + .025*sin(uTime*1.37+seed*11.))*(1.+st.x) + .06*st.z;
  l /= br;
  l.xz *= Rot(rot.x);
  l.yz *= Rot(rot.y);
  float d;
  float amp = .7 + 1.3*st.x + 3.*st.z;
  if(st.w < .5){
    d = deityA(l.xyz*SA, st.y, amp)/SA;
  } else if(st.w < 1.5){
    float k = 1.2 + 3.2*st.x + seed*1.5 + 2.*st.z;
    d = deityB(l*SB, st.y, k)/SB;
  } else if(st.w < 2.5){
    d = deityC(l*1.05, st.y, amp)/1.05;
  } else {
    d = deityD(l*1.3, st.y, amp)/1.3;
  }
  return d*br;
}

vec3 BgA(vec3 rd){float k=rd.y*.8+.8;return mix(vec3(0.105,0.815,0.615),vec3(0.972,0.050,0.2),clamp(k,0.,1.));}
vec3 BgB(vec3 rd){float k=rd.y*.5+.5;return mix(vec3(.4,.1,.2),vec3(.1,.7,1.),k);}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 ro = vec3(0.,0.,-7.);
  vec3 rd = normalize(vec3(uv, 1.6));

  // backdrop
  vec3 col = vec3(.035,.035,.045) * (1. - .35*length(uv));
  float bestT = 1e9; int bestI = -1;
  vec3 bc = vec3(0.); vec2 br = vec2(0.); vec4 bs = vec4(0.); float bseed = 0.;

  for(int i=0;i<4;i++){
    vec3 c = uPos[i]; vec2 rot = uRot[i]; vec4 st = uState[i]; float seed = uSeed[i];
    // glow halo behind awake deities
    float dl = length(cross(rd, c-ro));
    vec3 tint = st.w < .5 ? vec3(.9,.25,.4) : st.w < 1.5 ? vec3(.2,.6,1.) : st.w < 2.5 ? vec3(.1,.2,1.) : vec3(.55,.3,1.);
    col += tint * st.x * .10 * exp(-dl*dl*2.2);

    vec3 oc = ro - c;
    float b = dot(oc, rd);
    float h = b*b - (dot(oc,oc) - RB*RB);
    if(h > 0.){
      h = sqrt(h);
      float t = max(-b-h, 0.), t1 = -b+h;
      for(int s=0;s<130;s++){
        float d = mapD(ro+rd*t, c, rot, st, seed);
        if(d < .0006){ if(t < bestT){ bestT=t; bestI=i; bc=c; br=rot; bs=st; bseed=seed; } break; }
        t += d*.6;
        if(t > t1) break;
      }
    }
  }

  if(bestI >= 0){
    vec3 p = ro + rd*bestT;
    vec2 e = vec2(.0015,0.);
    float d = mapD(p,bc,br,bs,bseed);
    vec3 n = normalize(d - vec3(mapD(p-e.xyy,bc,br,bs,bseed), mapD(p-e.yxy,bc,br,bs,bseed), mapD(p-e.yyx,bc,br,bs,bseed)));
    vec3 r = reflect(rd, n);
    float spec = pow(max(0., r.y), 30.);
    float dif = dot(n, normalize(vec3(.5,5.,-7.)))*.5+.5;
    float fres = pow(1.-max(0.,dot(n,-rd)), 3.);
    vec3 c2;
    if(bs.w < 1.5){
      vec3 env = bs.w < .5 ? BgA(r) : BgB(r);
      c2 = mix(env*1.5, vec3(dif), .2) + spec;
      c2 += fres * env * (.25 + .6*bs.x);
    } else {
      // satin clay look, like the Blender renders
      vec3 base = bs.w < 2.5 ? vec3(.04,.10,.72) : vec3(.40,.24,.72);
      vec3 L = normalize(vec3(-.6,.8,-.7));
      float lam = clamp(dot(n,L),0.,1.)*.75 + .25;
      float sp = pow(max(0., dot(reflect(-L,n), -rd)), 24.) * .45;
      c2 = base*lam*1.25 + sp + fres*(base+.25)*(.3+.5*bs.x);
    }
    float g = dot(c2, vec3(.3,.59,.11));
    c2 = mix(vec3(g)*.24, c2, .08 + .92*bs.x);   // asleep: dim and grey. awake: full colour
    c2 += bs.z * .25;                            // twitch flash
    col = c2;
  }
  col = pow(col, vec3(.85));
  gl_FragColor = vec4(col, 1.);
}`;

// Phones and low-power devices get the still, not a raymarcher.
if (smallScreen || coarsePointer) {
  showFallback();
} else {
  try {
    start();
  } catch (err) {
    console.error('Pantheon failed to start:', err);
    showFallback();
  }
}

/* Hero terrain — the code side's answer to the photograph.
   A hand-rolled 3D wireframe ridge: value-noise heightfield, perspective
   projection, endless flyover. No libraries; just brackets and light. */

(function () {
  "use strict";

  var canvas = document.getElementById("terrain");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  // layout must not depend on the stylesheet being current (cache skew):
  // position inline so a stale CSS copy can never turn this into a grid row
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- deterministic value noise ---------- */

  function hash(ix, iz) {
    var n = ix * 374761393 + iz * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return ((n >>> 0) % 1000) / 1000;
  }

  function smooth(t) { return t * t * (3 - 2 * t); }

  function noise(x, z) {
    var ix = Math.floor(x), iz = Math.floor(z);
    var fx = smooth(x - ix), fz = smooth(z - iz);
    var a = hash(ix, iz), b = hash(ix + 1, iz);
    var c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }

  function ridgeHeight(x, z) {
    // two octaves, ridged: sharp crests like a young mountain range
    var n = 1 - Math.abs(noise(x * 0.06, z * 0.06) * 2 - 1);
    n += 0.5 * (1 - Math.abs(noise(x * 0.15, z * 0.15) * 2 - 1));
    // taller toward the horizon, calmer in the foreground valley
    return Math.pow(n / 1.5, 1.6);
  }

  /* ---------- projection & drawing ---------- */

  var W = 0, H = 0, DPR = 1;
  var COLS = 96, ROWS = 34;
  var SPAN_X = 150;         // world units across
  var STEP_Z = 3.4;         // world units between rows
  var NEAR_Z = 6;
  var CAM_Y = 9;            // camera height above valley floor
  var AMP = 16;             // peak amplitude
  var running = false, rafId = null, t0 = null;
  var px = 0, py = 0;       // pointer parallax (lerped)
  var tx = 0, ty = 0;       // pointer target

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function drawFrame(time) {
    var drift = time * 0.0018;            // slow, endless flyover
    px += (tx - px) * 0.04;               // parallax easing
    py += (ty - py) * 0.04;

    ctx.clearRect(0, 0, W, H);
    var f = H * 0.9;                      // focal length
    var cx = W * 0.5 + px * 14;
    var horizonY = H * 0.42 + py * 10;

    for (var r = ROWS - 1; r >= 0; r--) {
      var zWorld = NEAR_Z + r * STEP_Z;
      var zNoise = r * STEP_Z + drift * 10;
      var depth = r / (ROWS - 1);
      // crests brighten as they approach; the farthest fade into the dark
      var alpha = 0.05 + 0.30 * (1 - depth);

      var pts = [];
      for (var c = 0; c <= COLS; c++) {
        var xWorld = (c / COLS - 0.5) * SPAN_X;
        var h = ridgeHeight(xWorld * 0.9, zNoise) * AMP * (0.35 + depth * 1.1);
        pts.push([
          cx + (xWorld / zWorld) * f,
          horizonY + ((CAM_Y - h) / zWorld) * f
        ]);
      }
      // occlusion: each ridge hides the ones behind it, like real terrain
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[pts.length - 1][0], H + 2);
      ctx.lineTo(pts[0][0], H + 2);
      ctx.closePath();
      ctx.fillStyle = "rgba(17, 15, 14, 0.88)";
      ctx.fill();
      // crest line stroked separately so the fill edges stay invisible
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.strokeStyle = "rgba(159, 192, 207, " + alpha.toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function loop(now) {
    if (t0 === null) t0 = now;
    drawFrame(now - t0);
    if (running) rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ---------- wiring ---------- */

  resize();
  window.addEventListener("resize", function () { resize(); if (!running) drawFrame(0); });

  if (reduceMotion) {
    drawFrame(0);                          // one still frame, no motion
  } else if ("IntersectionObserver" in window) {
    // only spend frames while the hero is on screen
    var hero = document.getElementById("hero");
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.05 }).observe(hero || canvas);
  } else {
    start();
  }

  if (finePointer && !reduceMotion) {
    var pane = canvas.parentElement;
    pane.addEventListener("pointermove", function (e) {
      var r = pane.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    pane.addEventListener("pointerleave", function () { tx = 0; ty = 0; });
  }

  // fade in once the first frame exists
  requestAnimationFrame(function () { canvas.classList.add("is-on"); });
})();

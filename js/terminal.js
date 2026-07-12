/* The terminal is real. So is the darkroom.
   Static, client-side, zero services — type `help`. */

(function () {
  "use strict";

  var termOut = document.getElementById("termOut");
  var termForm = document.getElementById("termForm");
  var termIn = document.getElementById("termIn");
  var terminal = document.getElementById("terminal");
  var termBody = document.getElementById("termBody");
  if (!termOut || !termForm || !termIn) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var history = [];
  var histIdx = -1;

  /* ---------------- output helpers ---------------- */

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function print(html) {
    var p = document.createElement("p");
    p.innerHTML = html;
    termOut.appendChild(p);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function echo(cmd) {
    print('<span class="prompt">&gt;</span> ' + esc(cmd));
  }

  function out(html) {
    print('<span class="out">' + html + "</span>");
  }

  function goTo(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---------------- commands ---------------- */

  var JOKES = [
    "I&rsquo;d tell you a UDP joke, but you might not get it.",
    "RAW files are just JSON for photographers.",
    "my code has great exposure &mdash; it&rsquo;s all public on GitHub.",
    "f/8 and be there. or ship it and be asleep. same philosophy."
  ];

  var COMMANDS = {
    help: function () {
      out("commands: <b>develop</b> &middot; whoami &middot; stack &middot; status &middot; ls &middot; cd &lt;section&gt; &middot; photos &middot; resume &middot; contact &middot; joke &middot; sudo hire-me &middot; clear");
    },
    whoami: function () { out("diwas pandit &mdash; software engineer &amp; photographer"); },
    stack: function () { out("next.js &middot; postgres &middot; pytorch &middot; a 50mm prime"); },
    status: function () { out("SWE intern @ Kioxia America &mdash; summer &rsquo;26 &middot; CS @ Texas State &rsquo;28"); },
    ls: function () {
      out("readme/&nbsp;&nbsp;gitlog/&nbsp;&nbsp;stack/&nbsp;&nbsp;builds/&nbsp;&nbsp;photos/&nbsp;&nbsp;contact/&nbsp;&nbsp;secrets/&nbsp;&nbsp;resume.pdf");
    },
    photos: function () { out("opening the contact sheet&hellip;"); goTo("photos"); },
    gitlog: function () { out("replaying history&hellip;"); goTo("gitlog"); },
    builds: function () { out("things I&rsquo;ve shipped&hellip;"); goTo("builds"); },
    contact: function () { out("channels are open&hellip;"); goTo("contact"); },
    resume: function () {
      out('opening <a href="resume.pdf" target="_blank" rel="noopener">resume.pdf</a>&hellip;');
      window.open("resume.pdf", "_blank", "noopener");
    },
    email: function () {
      out('<a href="mailto:diwaspanditinbox@gmail.com">diwaspanditinbox@gmail.com</a> &mdash; inbox is open.');
    },
    joke: function () { out(JOKES[Math.floor(Math.random() * JOKES.length)]); },
    develop: function () { out("switching on the safelight&hellip;"); openDarkroom(); },
    darkroom: function () { COMMANDS.develop(); },
    clear: function () { termOut.innerHTML = ""; },
    pwd: function () { out("~/diwaspandit.com.np &mdash; you are here."); }
  };

  function run(raw) {
    var cmd = raw.trim();
    if (!cmd) return;
    echo(cmd);
    history.push(cmd);
    histIdx = history.length;

    var lower = cmd.toLowerCase().replace(/\s+/g, " ");

    if (lower === "sudo hire-me" || lower === "sudo hire me" || lower === "hire-me" || lower === "hire me") {
      out("[sudo] password for recruiter: &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;");
      out("ACCESS GRANTED &mdash; engineer available.");
      out('&rarr; <a href="mailto:diwaspanditinbox@gmail.com">email diwas</a> &nbsp;&middot;&nbsp; <a href="resume.pdf" target="_blank" rel="noopener">resume.pdf</a>');
      return;
    }
    if (lower === "git log") { COMMANDS.gitlog(); return; }
    if (lower.indexOf("cd ") === 0 || lower === "cd") {
      var dir = lower.slice(3).replace(/\/$/, "");
      if (dir === "secrets") { out('<span class="err">permission denied</span> (nice try)'); return; }
      if (dir === "" || dir === "~") { goTo("top"); out("~"); return; }
      if (COMMANDS[dir] && ["photos", "gitlog", "builds", "contact"].indexOf(dir) > -1) { COMMANDS[dir](); return; }
      if (dir === "readme") { goTo("readme"); out("readme&hellip;"); return; }
      if (dir === "stack") { goTo("stack"); out("stack&hellip;"); return; }
      out('<span class="err">cd: no such section:</span> ' + esc(dir));
      return;
    }
    if (lower === "rm -rf /" || lower.indexOf("rm ") === 0) {
      out('<span class="err">rm: photographs are read-only.</span> some things you don&rsquo;t get to undo &mdash; that&rsquo;s the whole point.');
      return;
    }
    if (lower === "exit" || lower === "quit") { out("there is no exit. only scroll."); return; }

    var fn = COMMANDS[lower];
    if (fn) { fn(); return; }
    out('<span class="err">command not found:</span> ' + esc(cmd) + " &mdash; try <b>help</b>");
  }

  termForm.addEventListener("submit", function (e) {
    e.preventDefault();
    run(termIn.value);
    termIn.value = "";
  });

  // ↑/↓ history, Tab completion
  termIn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      if (histIdx > 0) { histIdx--; termIn.value = history[histIdx]; }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (histIdx < history.length - 1) { histIdx++; termIn.value = history[histIdx]; }
      else { histIdx = history.length; termIn.value = ""; }
      e.preventDefault();
    } else if (e.key === "Tab") {
      e.preventDefault();
      var v = termIn.value.toLowerCase();
      if (!v) return;
      var names = Object.keys(COMMANDS).concat(["sudo hire-me", "git log"]);
      var hits = names.filter(function (n) { return n.indexOf(v) === 0; });
      if (hits.length === 1) termIn.value = hits[0];
      else if (hits.length > 1) { echo(termIn.value); out(hits.join(" &nbsp;&middot;&nbsp; ")); }
    }
  });

  // clicking the terminal focuses the prompt (unless selecting text)
  if (terminal) {
    terminal.addEventListener("click", function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) termIn.focus({ preventScroll: true });
    });
  }

  /* ================= darkroom ================= */

  var darkroom = document.getElementById("darkroom");
  var dkImg = document.getElementById("dkImg");
  var dkGrainEl = document.getElementById("dkGrain");
  var sliders = {
    exposure: document.getElementById("dkExposure"),
    contrast: document.getElementById("dkContrast"),
    temp: document.getElementById("dkTemp"),
    grain: document.getElementById("dkGrainAmt")
  };
  var vals = {
    exposure: document.getElementById("dkExposureVal"),
    contrast: document.getElementById("dkContrastVal"),
    temp: document.getElementById("dkTempVal"),
    grain: document.getElementById("dkGrainVal")
  };
  var dkDownload = document.getElementById("dkDownload");
  var dkReset = document.getElementById("dkReset");
  var dkClose = document.getElementById("dkClose");
  var dkStage = document.getElementById("dkStage");
  var dkFile = document.getElementById("dkFile");
  var dkDropVeil = document.getElementById("dkDropVeil");
  var dkUseSample = document.getElementById("dkUseSample");
  var dkCaption = document.getElementById("dkCaption");
  var dkError = document.getElementById("dkError");
  var dkBgTools = document.getElementById("dkBgTools");
  var dkRemoveBg = document.getElementById("dkRemoveBg");
  var dkBgColorRow = document.getElementById("dkBgColorRow");
  var dkBgColor = document.getElementById("dkBgColor");
  var dkBgUndo = document.getElementById("dkBgUndo");
  var dkBgStatus = document.getElementById("dkBgStatus");
  var noiseCanvas = null;
  var lastFocus = null;
  var userObjectUrl = null;   // whatever is currently shown (raw upload or bg composite)
  var bgOriginalUrl = null;   // pristine uploaded photo, kept alive for undo + re-segmenting
  var bgCompositeUrl = null;  // most recent background-swapped blob, revoked on next composite
  var bgMaskCanvas = null;    // cached alpha matte so color changes don't re-run the model
  var bgSourceImg = null;     // decoded Image of the pristine upload, used to recomposite
  var segmenterPromise = null;
  var usingUpload = false;

  var SAMPLE_SRC = "assets/photos/p4_1-BLNRCamT.jpg";
  var SAMPLE_ALT = "First light on the Himalaya at Kalinchowk — your development";
  var SAMPLE_CAPTION = "&#9679; DARKROOM &middot; Kalinchowk, Nepal &middot; developed by you";
  var MAX_BYTES = 15 * 1024 * 1024;

  // canvas filter support gates the export button (Safari < 16.4)
  var testCtx = document.createElement("canvas").getContext("2d");
  var canExport = testCtx && "filter" in testCtx;
  if (!canExport && dkDownload) dkDownload.hidden = true;

  function makeNoise() {
    if (noiseCanvas) return;
    noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = noiseCanvas.height = 128;
    var g = noiseCanvas.getContext("2d");
    var d = g.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = 90 + Math.random() * 90;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    if (dkGrainEl) dkGrainEl.style.backgroundImage = "url(" + noiseCanvas.toDataURL() + ")";
  }

  function filterString() {
    var e = +sliders.exposure.value;   // -40..40
    var c = +sliders.contrast.value;   // -40..40
    var t = +sliders.temp.value;       // -100..100
    var f = "brightness(" + (1 + e / 100) + ") contrast(" + (1 + c / 100) + ")";
    if (t > 0) f += " sepia(" + (t * 0.0045).toFixed(3) + ") saturate(1.06) hue-rotate(" + (-t * 0.05).toFixed(1) + "deg)";
    if (t < 0) f += " hue-rotate(" + (-t * 0.14).toFixed(1) + "deg) saturate(" + (1 + t * 0.0012).toFixed(3) + ")";
    return f;
  }

  function applyDevelop() {
    dkImg.style.filter = filterString();
    var g = +sliders.grain.value;
    if (dkGrainEl) dkGrainEl.style.opacity = (g * 0.0045).toFixed(3);
    vals.exposure.textContent = (sliders.exposure.value > 0 ? "+" : "") + sliders.exposure.value;
    vals.contrast.textContent = (sliders.contrast.value > 0 ? "+" : "") + sliders.contrast.value;
    vals.temp.textContent = (sliders.temp.value > 0 ? "+" : "") + sliders.temp.value;
    vals.grain.textContent = sliders.grain.value;
  }

  function resetDevelop() {
    sliders.exposure.value = 0;
    sliders.contrast.value = 0;
    sliders.temp.value = 0;
    sliders.grain.value = 0;
    applyDevelop();
  }

  function openDarkroom() {
    if (!darkroom) return;
    makeNoise();
    applyDevelop();
    darkroom.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    sliders.exposure.focus();
  }

  function closeDarkroom() {
    darkroom.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function downloadPrint() {
    var c = document.createElement("canvas");
    c.width = dkImg.naturalWidth;
    c.height = dkImg.naturalHeight;
    var x = c.getContext("2d");
    x.filter = filterString();
    x.drawImage(dkImg, 0, 0);
    var g = +sliders.grain.value;
    if (g > 0 && noiseCanvas) {
      x.filter = "none";
      x.globalCompositeOperation = "overlay";
      x.globalAlpha = g * 0.0045;
      x.fillStyle = x.createPattern(noiseCanvas, "repeat");
      x.fillRect(0, 0, c.width, c.height);
    }
    c.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = usingUpload ? "developed-by-you.jpg" : "kalinchowk-developed-by-you.jpg";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, "image/jpeg", 0.9);
  }

  /* ---------------- upload: picker, drag-drop, paste ---------------- */

  function showDkError(msg) {
    if (!dkError) return;
    dkError.textContent = msg;
    dkError.hidden = false;
  }
  function clearDkError() {
    if (dkError) dkError.hidden = true;
  }

  function resetBgState() {
    if (bgCompositeUrl) { URL.revokeObjectURL(bgCompositeUrl); bgCompositeUrl = null; }
    bgMaskCanvas = null;
    bgSourceImg = null;
    if (dkBgColorRow) dkBgColorRow.hidden = true;
    setBgStatus("");
  }

  function loadUserFile(file) {
    clearDkError();
    if (!file) return;
    if (file.type.indexOf("image/") !== 0) {
      showDkError("that’s not an image — try a jpg, png, or webp.");
      return;
    }
    if (file.size > MAX_BYTES) {
      showDkError("too big (" + (file.size / 1048576).toFixed(1) + "MB) — keep it under 15MB.");
      return;
    }
    resetBgState();
    if (bgOriginalUrl) URL.revokeObjectURL(bgOriginalUrl);
    userObjectUrl = URL.createObjectURL(file);
    bgOriginalUrl = userObjectUrl;
    usingUpload = true;
    dkImg.src = userObjectUrl;
    dkImg.alt = "your photo, developed";
    if (dkCaption) dkCaption.innerHTML = "&#9679; DARKROOM &middot; your photo &middot; developed by you";
    if (dkUseSample) dkUseSample.hidden = false;
    if (dkBgTools) dkBgTools.hidden = false;
    resetDevelop();
  }

  function revertToSample() {
    resetBgState();
    if (bgOriginalUrl) { URL.revokeObjectURL(bgOriginalUrl); bgOriginalUrl = null; }
    userObjectUrl = null;
    usingUpload = false;
    dkImg.src = SAMPLE_SRC;
    dkImg.alt = SAMPLE_ALT;
    if (dkCaption) dkCaption.innerHTML = SAMPLE_CAPTION;
    if (dkUseSample) dkUseSample.hidden = true;
    if (dkBgTools) dkBgTools.hidden = true;
    clearDkError();
    resetDevelop();
  }

  /* ---------------- background removal (on-device, lazy-loaded) ---------------- */

  var VISION_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  var SEGMENTER_MODEL =
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

  function setBgStatus(msg, isErr) {
    if (!dkBgStatus) return;
    dkBgStatus.textContent = msg || "";
    dkBgStatus.hidden = !msg;
    dkBgStatus.classList.toggle("is-err", !!isErr);
  }

  function loadSegmenter() {
    if (segmenterPromise) return segmenterPromise;
    segmenterPromise = (async function () {
      var vision = await import(/* webpackIgnore: true */ VISION_CDN + "/vision_bundle.mjs");
      var resolver = await vision.FilesetResolver.forVisionTasks(VISION_CDN + "/wasm");
      return vision.ImageSegmenter.createFromOptions(resolver, {
        baseOptions: { modelAssetPath: SEGMENTER_MODEL },
        runningMode: "IMAGE",
        outputCategoryMask: false,
        outputConfidenceMasks: true
      });
    })();
    return segmenterPromise;
  }

  function compositeWithColor(color) {
    if (!bgSourceImg || !bgMaskCanvas) return;
    var w = bgSourceImg.naturalWidth, h = bgSourceImg.naturalHeight;
    var out = document.createElement("canvas");
    out.width = w; out.height = h;
    var o = out.getContext("2d");
    o.fillStyle = color;
    o.fillRect(0, 0, w, h);

    var subject = document.createElement("canvas");
    subject.width = w; subject.height = h;
    var s = subject.getContext("2d");
    s.drawImage(bgSourceImg, 0, 0, w, h);
    s.globalCompositeOperation = "destination-in";
    s.drawImage(bgMaskCanvas, 0, 0, w, h);

    o.drawImage(subject, 0, 0);
    out.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      if (bgCompositeUrl) URL.revokeObjectURL(bgCompositeUrl);
      bgCompositeUrl = url;
      userObjectUrl = url;
      dkImg.src = url;
    }, "image/png");
  }

  async function removeBackground() {
    if (!usingUpload || !bgOriginalUrl) return;
    dkRemoveBg.disabled = true;
    dkRemoveBg.classList.add("dk-btn-loading");
    setBgStatus("loading the segmenter… (one-time download)");
    try {
      var segmenter;
      try {
        segmenter = await loadSegmenter();
      } catch (loadErr) {
        segmenterPromise = null; // don't cache a dead promise — let the next click retry
        throw loadErr;
      }
      setBgStatus("finding the subject…");

      var img = new Image();
      await new Promise(function (resolve, reject) {
        img.onload = resolve;
        img.onerror = function () { reject(new Error("image failed to decode")); };
        img.src = bgOriginalUrl;
      });
      bgSourceImg = img;

      var result = segmenter.segment(img);
      var maskObj = (result.confidenceMasks && result.confidenceMasks[0]) || null;
      if (!maskObj) throw new Error("no mask returned");

      var w = maskObj.width, h = maskObj.height;
      var floatData = maskObj.getAsFloat32Array();
      var mc = document.createElement("canvas");
      mc.width = w; mc.height = h;
      var mctx = mc.getContext("2d");
      var imgData = mctx.createImageData(w, h);
      for (var i = 0; i < floatData.length; i++) {
        var a = Math.round(Math.max(0, Math.min(1, floatData[i])) * 255);
        imgData.data[i * 4] = imgData.data[i * 4 + 1] = imgData.data[i * 4 + 2] = 255;
        imgData.data[i * 4 + 3] = a;
      }
      mctx.putImageData(imgData, 0, 0);
      bgMaskCanvas = mc;
      maskObj.close();
      result.close();

      compositeWithColor(dkBgColor ? dkBgColor.value : "#f25c2a");
      if (dkBgColorRow) dkBgColorRow.hidden = false;
      setBgStatus("");
    } catch (err) {
      setBgStatus("couldn’t load the background remover — needs WebGL, which your browser blocked, disabled, or lacks.", true);
    } finally {
      dkRemoveBg.disabled = false;
      dkRemoveBg.classList.remove("dk-btn-loading");
    }
  }

  function undoBackgroundRemoval() {
    if (!bgOriginalUrl) return;
    if (bgCompositeUrl) { URL.revokeObjectURL(bgCompositeUrl); bgCompositeUrl = null; }
    userObjectUrl = bgOriginalUrl;
    dkImg.src = bgOriginalUrl;
    bgMaskCanvas = null;
    if (dkBgColorRow) dkBgColorRow.hidden = true;
    setBgStatus("");
  }

  function wireUpload() {
    if (dkFile) {
      dkFile.addEventListener("change", function () {
        if (dkFile.files && dkFile.files[0]) loadUserFile(dkFile.files[0]);
        dkFile.value = "";
      });
    }
    if (dkUseSample) dkUseSample.addEventListener("click", revertToSample);
    if (dkRemoveBg) dkRemoveBg.addEventListener("click", removeBackground);
    if (dkBgUndo) dkBgUndo.addEventListener("click", undoBackgroundRemoval);
    if (dkBgColor) {
      dkBgColor.addEventListener("input", function () {
        if (bgMaskCanvas) compositeWithColor(dkBgColor.value);
      });
    }

    if (dkStage) {
      var dragDepth = 0;
      dkStage.addEventListener("dragover", function (e) { e.preventDefault(); });
      dkStage.addEventListener("dragenter", function (e) {
        e.preventDefault();
        dragDepth++;
        dkStage.classList.add("is-dragover");
      });
      dkStage.addEventListener("dragleave", function () {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) dkStage.classList.remove("is-dragover");
      });
      dkStage.addEventListener("drop", function (e) {
        e.preventDefault();
        dragDepth = 0;
        dkStage.classList.remove("is-dragover");
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) loadUserFile(f);
      });
    }

    // paste an image anywhere while the darkroom is open
    document.addEventListener("paste", function (e) {
      if (!darkroom || darkroom.hidden) return;
      var items = (e.clipboardData || window.clipboardData).items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image/") === 0) {
          var f = items[i].getAsFile();
          if (f) { loadUserFile(f); e.preventDefault(); }
          return;
        }
      }
    });
  }

  if (darkroom) {
    Object.keys(sliders).forEach(function (k) {
      sliders[k].addEventListener("input", applyDevelop);
    });
    dkReset.addEventListener("click", resetDevelop);
    dkClose.addEventListener("click", closeDarkroom);
    if (dkDownload) dkDownload.addEventListener("click", downloadPrint);
    darkroom.addEventListener("click", function (e) {
      if (e.target === darkroom) closeDarkroom();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !darkroom.hidden) closeDarkroom();
    });
    wireUpload();
  }
})();

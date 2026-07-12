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
  var noiseCanvas = null;
  var lastFocus = null;

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
      a.download = "kalinchowk-developed-by-you.jpg";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, "image/jpeg", 0.9);
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
  }
})();

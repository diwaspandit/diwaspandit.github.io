/* Diwas Pandit — Dual Exposure
   aperture reveal · typed editor · drag divider · f-stop readout ·
   scroll reveals · contact-sheet filters · lightbox */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ---------------- Aperture load reveal ---------------- */

  var iris = document.getElementById("iris");
  function openIris() {
    if (!iris) return;
    iris.classList.add("is-open");
    setTimeout(function () { iris.remove(); }, 600);
  }
  if (reduceMotion || sessionStorage.getItem("irisSeen")) {
    if (iris) iris.remove();
  } else {
    sessionStorage.setItem("irisSeen", "1");
    setTimeout(openIris, 1150);
  }

  /* ---------------- Typed editor ---------------- */

  var CODE = [
    { t: "const", c: "tok-kw" }, { t: " diwas " }, { t: "=", c: "tok-pn" }, { t: " {\n" },
    { t: "  role" }, { t: ":", c: "tok-pn" }, { t: " \"software engineer\"", c: "tok-str" }, { t: ",\n" },
    { t: "  base" }, { t: ":", c: "tok-pn" }, { t: " [" }, { t: "\"Kathmandu\"", c: "tok-str" }, { t: ", " }, { t: "\"Texas\"", c: "tok-str" }, { t: "],\n" },
    { t: "  stack" }, { t: ":", c: "tok-pn" }, { t: " [" }, { t: "\"react\"", c: "tok-str" }, { t: ", " }, { t: "\"node\"", c: "tok-str" }, { t: ", " }, { t: "\"postgres\"", c: "tok-str" }, { t: "],\n" },
    { t: "  sideQuest" }, { t: ":", c: "tok-pn" }, { t: " \"a 50mm prime\"", c: "tok-str" }, { t: ",\n" },
    { t: "};\n\n" },
    { t: "// both halves compile\n", c: "tok-cm" },
    { t: "while", c: "tok-kw" }, { t: " (light) { " }, { t: "shoot", c: "tok-fn" }, { t: "(); }" }
  ];

  var typed = document.getElementById("typed");
  var caret = document.getElementById("caret");

  function renderAll() {
    CODE.forEach(function (tok) {
      var span = document.createElement("span");
      if (tok.c) span.className = tok.c;
      span.textContent = tok.t;
      typed.appendChild(span);
    });
  }

  function typeTokens(i, pos) {
    if (i >= CODE.length) {
      if (caret) caret.style.display = "none";
      return;
    }
    var tok = CODE[i];
    var span = typed.lastChild;
    if (pos === 0) {
      span = document.createElement("span");
      if (tok.c) span.className = tok.c;
      typed.appendChild(span);
    }
    pos += 1 + Math.floor(Math.random() * 2);
    span.textContent = tok.t.slice(0, pos);
    if (pos >= tok.t.length) {
      typeTokens(i + 1, 0);
    } else {
      setTimeout(function () { typeTokens(i, pos); }, 24);
    }
  }

  if (typed) {
    if (reduceMotion) {
      renderAll();
      if (caret) caret.style.display = "none";
    } else {
      setTimeout(function () { typeTokens(0, 0); }, 1250);
    }
  }

  /* ---------------- Dual-exposure divider ---------------- */

  var exposure = document.getElementById("exposure");
  var divider = document.getElementById("divider");

  function setSplit(pct) {
    pct = Math.max(8, Math.min(92, pct));
    exposure.style.setProperty("--split", pct + "%");
    divider.setAttribute("aria-valuenow", Math.round(pct));
  }

  if (exposure && divider) {
    var dragging = false;

    divider.addEventListener("pointerdown", function (e) {
      dragging = true;
      divider.setPointerCapture(e.pointerId);
    });
    divider.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var rect = exposure.getBoundingClientRect();
      setSplit(((e.clientX - rect.left) / rect.width) * 100);
    });
    divider.addEventListener("pointerup", function () { dragging = false; });
    divider.addEventListener("pointercancel", function () { dragging = false; });

    divider.addEventListener("keydown", function (e) {
      var now = parseFloat(divider.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") { setSplit(now - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setSplit(now + 5); e.preventDefault(); }
      if (e.key === "Home") { setSplit(8); e.preventDefault(); }
      if (e.key === "End") { setSplit(92); e.preventDefault(); }
    });

    // gentle intro nudge: photo side breathes in once
    if (!reduceMotion) {
      setTimeout(function () { setSplit(56); }, 1400);
      setTimeout(function () { setSplit(50); }, 2000);
      exposure.style.transition = "none"; // splits are instant while dragging
    }
  }

  /* ---------------- f-stop scroll readout ---------------- */

  var fstop = document.getElementById("fstop");
  var STOPS = ["f/1.8", "f/2.8", "f/4", "f/5.6", "f/8", "f/11", "f/16"];

  function updateFstop() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    var idx = Math.min(STOPS.length - 1, Math.floor(p * STOPS.length));
    if (fstop.textContent !== STOPS[idx]) fstop.textContent = STOPS[idx];
  }

  if (fstop) {
    updateFstop();
    window.addEventListener("scroll", updateFstop, { passive: true });
  }

  /* ---------------- Scroll reveals ---------------- */

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- Contact-sheet filters ---------------- */

  var chips = document.querySelectorAll(".chip");
  var frames = document.querySelectorAll(".frame");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.dataset.filter;
      frames.forEach(function (frame) {
        frame.classList.toggle("is-hidden", f !== "all" && frame.dataset.cat !== f);
      });
    });
  });

  /* ---------------- Lightbox ---------------- */

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCap = document.getElementById("lightboxCap");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocus = null;

  function openLightbox(btn) {
    var img = btn.querySelector("img");
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.innerHTML = "&#9679; " + btn.dataset.title + " &middot; " + btn.dataset.loc;
    lightbox.hidden = false;
    lastFocus = btn;
    lightboxClose.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".frame-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openLightbox(btn); });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });
})();

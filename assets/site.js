/* FixInstall · shared behavior v5
   meniu accesibil · reveal+stagger · wipe · countere · desene (line-draw)
   buton magnetic (doar pointer fin) · bara mobila care se retrage la CTA final */
(function(){
  "use strict";
  document.documentElement.classList.add("has-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header state */
  var header = document.querySelector(".header");
  if(header){
    var onScroll = function(){ header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll(); window.addEventListener("scroll", onScroll, {passive:true});
  }

  /* mobile menu */
  var menu = document.getElementById("mobileMenu");
  var scrim = document.getElementById("scrim");
  var btnOpen = document.getElementById("menuBtn");
  var btnClose = document.getElementById("menuClose");
  if(menu && scrim && btnOpen && btnClose){
    try { menu.inert = true; } catch(e){}
    var setMenu = function(open, returnFocus){
      menu.classList.toggle("open", open);
      scrim.classList.toggle("open", open);
      btnOpen.setAttribute("aria-expanded", open ? "true":"false");
      document.body.style.overflow = open ? "hidden":"";
      try { menu.inert = !open; } catch(e){}
      if(open){ btnClose.focus(); }
      else if(returnFocus !== false){ btnOpen.focus(); }
    };
    btnOpen.addEventListener("click", function(){ setMenu(true); });
    btnClose.addEventListener("click", function(){ setMenu(false); });
    scrim.addEventListener("click", function(){ setMenu(false); });
    menu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setMenu(false, false); }); });
    document.addEventListener("keydown", function(e){
      if(!menu.classList.contains("open")) return;
      if(e.key === "Escape"){ setMenu(false); return; }
      if(e.key !== "Tab") return;
      var f = menu.querySelectorAll("a[href],button");
      if(!f.length) return;
      var first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }

  /* stagger index: copiii .rv ai unui .stagger primesc --i */
  document.querySelectorAll(".stagger").forEach(function(group){
    var kids = group.querySelectorAll(".rv");
    kids.forEach(function(el, i){ el.style.setProperty("--i", i); });
  });

  /* reveal on scroll (.rv) + wipe (.wipe) */
  var items = document.querySelectorAll(".rv, .wipe");
  if(reduce || !("IntersectionObserver" in window)){
    items.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {rootMargin:"0px 0px -8% 0px", threshold:0.08});
    items.forEach(function(el){ io.observe(el); });
    window.addEventListener("load", function(){
      setTimeout(function(){ items.forEach(function(el){ if(!el.classList.contains("in")) el.classList.add("in"); }); }, 1400);
    });
  }

  /* count-up */
  var counters = document.querySelectorAll("[data-count]");
  var runCount = function(el){
    var target = parseInt(el.getAttribute("data-count"), 10);
    if(reduce){ el.textContent = target; return; }
    var dur = 1300, t0 = null;
    var tick = function(t){
      if(!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(eased * target);
      if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if(counters.length){
    if("IntersectionObserver" in window && !reduce){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ runCount(en.target); cio.unobserve(en.target); } });
      }, {threshold:.5});
      counters.forEach(function(c){ cio.observe(c); });
    } else {
      counters.forEach(function(c){ c.textContent = c.getAttribute("data-count"); });
    }
  }

  /* elemente care se "deseneaza" cand intra in viewport */
  var drawables = document.querySelectorAll(".proc-line, .tl, .blueprint, .mapcard, .draw");
  if(drawables.length){
    if(reduce || !("IntersectionObserver" in window)){
      drawables.forEach(function(el){ el.classList.add("in"); });
    } else {
      var dio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); dio.unobserve(en.target); } });
      }, {threshold:.3});
      drawables.forEach(function(el){ dio.observe(el); });
    }
  }

  /* buton magnetic: un singur element .magnet, doar pe pointer fin */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var magnet = document.querySelector(".magnet");
  if(magnet && fine && !reduce){
    var wrap = magnet.parentElement;
    var strength = 0.22;
    wrap.addEventListener("pointermove", function(e){
      var r = magnet.getBoundingClientRect();
      var cx = r.left + r.width/2, cy = r.top + r.height/2;
      var dx = (e.clientX - cx) * strength, dy = (e.clientY - cy) * strength;
      var lim = 14;
      dx = Math.max(-lim, Math.min(lim, dx)); dy = Math.max(-lim, Math.min(lim, dy));
      magnet.style.transition = "background-color .2s ease";
      magnet.style.transform = "translate(" + dx + "px," + dy + "px)";
    });
    wrap.addEventListener("pointerleave", function(){
      magnet.style.transition = "transform .55s cubic-bezier(.3,1.4,.4,1), background-color .2s ease";
      magnet.style.transform = "translate(0,0)";
    });
  }

  /* bara mobila se retrage cand CTA-ul final e vizibil (nu dubla acelasi buton) */
  var mbar = document.querySelector(".mbar");
  var finalCta = document.querySelector(".cta-final");
  if(mbar && finalCta && "IntersectionObserver" in window){
    var bio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ mbar.classList.toggle("hidden", en.isIntersecting); });
    }, {threshold:.25});
    bio.observe(finalCta);
  }

  /* footer year */
  var y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();
})();

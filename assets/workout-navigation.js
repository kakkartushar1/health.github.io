(function () {
  'use strict';

  var topButton = document.getElementById('scroll-to-top');

  if (topButton) {
    var updateTopButton = function () {
      topButton.hidden = window.scrollY < 320;
    };

    window.addEventListener('scroll', updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener('click', function () {
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.hidden = true;
      if (img.parentNode.querySelector('.image-fallback')) return;

      var fallback = document.createElement('p');
      fallback.className = 'image-fallback';
      fallback.textContent = 'Exercise photo unavailable. Use the written form instructions.';
      fallback.setAttribute('role', 'status');
      img.parentNode.appendChild(fallback);
    }, { once: true });
  });

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        var wasOpen = nav.classList.contains('open');
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (wasOpen) navToggle.focus();
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || navToggle.contains(e.target)) return;
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }
})();

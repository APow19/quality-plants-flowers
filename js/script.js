  // ── CAROUSEL — RAF-driven, no CSS transition sticking ──
  const totalSlides = 3;
  let currentSlide = 0;
  let isAnimating = false;
  let autoplayTimer;

  const track = document.getElementById('carouselTrack');

  function setTrackX(pct) {
    track.style.transform = 'translateX(' + pct + '%)';
  }

  function animateTo(targetPct, done) {
    const startPct = -currentSlide * 100; // where we actually are before update
    // Use a short easing loop so the browser can't interrupt with a layout
    const duration = 380; // ms — fast enough mobile feels snappy, slow enough to see slide
    const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out quad
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = startPct + (targetPct - startPct) * ease(progress);
      setTrackX(val);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setTrackX(targetPct); // snap to exact final position
        isAnimating = false;
        if (done) done();
      }
    }
    requestAnimationFrame(step);
  }

  function carouselGoTo(index, skipAnim) {
    if (isAnimating) return;
    const target = ((index % totalSlides) + totalSlides) % totalSlides;
    const targetPct = -(target * 100);
    isAnimating = true;
    currentSlide = target;
    updateDots();
    if (skipAnim) {
      setTrackX(targetPct);
      isAnimating = false;
    } else {
      animateTo(targetPct);
    }
    resetAutoplay();
  }

  function carouselMove(dir) {
    carouselGoTo(currentSlide + dir);
  }

  function updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => { if (!isAnimating) carouselMove(1); }, 5500);
  }

  // Initialise position without animation
  setTrackX(0);
  resetAutoplay();

  // ── Touch / swipe ──
  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurX = 0;
  let dragActive = false;
  let axisLocked = false; // true = horizontal swipe confirmed

  const carouselEl = document.getElementById('heroCarousel');

  carouselEl.addEventListener('touchstart', e => {
    if (isAnimating) return;
    touchStartX = touchCurX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    dragActive = true;
    axisLocked = false;
    clearInterval(autoplayTimer); // pause autoplay while touching
  }, { passive: true });

  carouselEl.addEventListener('touchmove', e => {
    if (!dragActive) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    touchCurX = e.touches[0].clientX;
    if (!axisLocked) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        axisLocked = true; // confirmed horizontal
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        dragActive = false; // it's a scroll — abandon
        return;
      }
    }
    if (axisLocked) {
      // live drag feedback — clamp so you can't drag past edges
      const basePct = -(currentSlide * 100);
      const dragPct = (dx / carouselEl.offsetWidth) * 100;
      setTrackX(basePct + Math.max(-30, Math.min(30, dragPct)));
    }
  }, { passive: true });

  carouselEl.addEventListener('touchend', e => {
    if (!dragActive) return;
    dragActive = false;
    const diff = touchStartX - touchCurX;
    if (axisLocked && Math.abs(diff) > 50) {
      carouselMove(diff > 0 ? 1 : -1);
    } else if (axisLocked) {
      // horizontal drag started but didn't travel far enough — snap back
      if (!isAnimating) {
        isAnimating = true;
        animateTo(-(currentSlide * 100));
      }
      resetAutoplay();
    } else {
      // plain tap (no horizontal drag) — don't set isAnimating so click events fire normally
      resetAutoplay();
    }
    axisLocked = false;
  });

  // ── PAGE NAVIGATION ──
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    observeFadeUps();
  }

  // Mobile menu
  function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
  }
  function closeMenu() {
    document.getElementById('navLinks').classList.remove('open');
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });

  // Gallery filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Lightbox (desktop)
  (function() {
    const lightbox = document.getElementById('lightbox');
    const lbImg    = document.getElementById('lightbox-img');
    const lbCap    = document.getElementById('lightbox-caption');
    const lbCount  = document.getElementById('lightbox-counter');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn  = lightbox.querySelector('.lightbox-prev');
    const nextBtn  = lightbox.querySelector('.lightbox-next');

    let items = [];
    let idx = 0;

    function open(i) {
      if (window.innerWidth <= 768) return;
      items = [...document.querySelectorAll('.gallery-item')];
      idx = i;
      render(false);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function render(fade) {
      var item = items[idx];
      var src  = item.querySelector('img').src;
      var alt  = item.querySelector('img').alt;
      var cap  = item.querySelector('.gallery-caption span');
      if (fade) {
        lbImg.classList.add('fading');
        setTimeout(function() {
          lbImg.src = src;
          lbImg.alt = alt;
          lbCap.textContent = cap ? cap.textContent : '';
          lbCount.textContent = (idx + 1) + ' / ' + items.length;
          lbImg.classList.remove('fading');
        }, 180);
      } else {
        lbImg.src = src;
        lbImg.alt = alt;
        lbCap.textContent = cap ? cap.textContent : '';
        lbCount.textContent = (idx + 1) + ' / ' + items.length;
      }
    }

    document.querySelectorAll('.gallery-item').forEach(function(item, i) {
      item.addEventListener('click', function() { open(i); });
    });

    closeBtn.addEventListener('click', close);

    prevBtn.addEventListener('click', function() {
      idx = (idx - 1 + items.length) % items.length;
      render(true);
    });

    nextBtn.addEventListener('click', function() {
      idx = (idx + 1) % items.length;
      render(true);
    });

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')  { idx = (idx - 1 + items.length) % items.length; render(true); }
      if (e.key === 'ArrowRight') { idx = (idx + 1) % items.length; render(true); }
    });
  })();

  // Gallery slider (mobile)
  (function() {
    const grid = document.querySelector('.gallery-grid');
    const dotsContainer = document.querySelector('.gallery-dots');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    if (!grid || !dotsContainer) return;

    const items = grid.querySelectorAll('.gallery-item');

    items.forEach(function(_, i) {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function() { scrollToSlide(i); });
      dotsContainer.appendChild(dot);
    });

    function getCurrentIndex() {
      return Math.round(grid.scrollLeft / grid.offsetWidth);
    }

    function updateActiveDot() {
      const idx = getCurrentIndex();
      dotsContainer.querySelectorAll('.gallery-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === idx);
      });
    }

    function scrollToSlide(index) {
      grid.scrollTo({ left: index * grid.offsetWidth, behavior: 'smooth' });
    }

    grid.addEventListener('scroll', updateActiveDot, { passive: true });

    prevBtn.addEventListener('click', function() {
      scrollToSlide(Math.max(0, getCurrentIndex() - 1));
    });

    nextBtn.addEventListener('click', function() {
      scrollToSlide(Math.min(items.length - 1, getCurrentIndex() + 1));
    });
  })();

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = new FormData(contactForm);
      fetch('/', { method: 'POST', body: data })
        .then(() => {
          contactForm.style.display = 'none';
          document.getElementById('formSuccess').style.display = 'block';
        })
        .catch(() => {
          alert('Sorry, there was a problem sending your message. Please call us or try again.');
        });
    });
  }

  // Fade-up animations
  function observeFadeUps() {
    const els = document.querySelectorAll('.fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }
  observeFadeUps();
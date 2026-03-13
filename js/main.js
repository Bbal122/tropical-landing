/* ===== TROPICAL OMAN — PREMIUM SCROLL EXPERIENCE ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVBAR SCROLL ---------- */
  const navbar = document.getElementById('navbar');
  const onNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- MOBILE MENU ---------- */
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ---------- LANGUAGE TOGGLE ---------- */
  const langToggle = document.getElementById('langToggle');
  let currentLang = 'en';

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    const html = document.documentElement;

    html.lang = currentLang;
    html.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    langToggle.querySelector('.lang-en').style.display = currentLang === 'en' ? '' : 'none';
    langToggle.querySelector('.lang-ar').style.display = currentLang === 'ar' ? '' : 'none';

    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.getAttribute(`data-${currentLang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.classList.contains('hero-headline')) {
          const words = text.split(' ');
          el.innerHTML = words.map(w => `<span class="word-wrap"><span class="word" style="transform:none">${w}</span></span>`).join(' ');
        } else {
          el.textContent = text;
        }
      }
    });

    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 200);
    }
  });

  /* ---------- INIT WHEN GSAP IS READY ---------- */
  if (typeof gsap === 'undefined') {
    window.addEventListener('load', initAll);
  } else {
    initAll();
  }
});

function initAll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    revealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Initialize Lenis smooth scroll
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: 0 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  runLoader(() => {
    animateHero();
    setupHeroVideoScrub();
    setupBrandStrip();
    setupProducts();
    setupDividerParallax();
    setupAbout();
    setupCounters();
    setupLocations();
    setupSectionTitles();
    setupMarqueeDrag();
  });
}

/* ========== LOADING SCREEN ========== */
function runLoader(onComplete) {
  const loader = document.getElementById('loader');
  const logo = loader.querySelector('.loader-logo');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.pointerEvents = 'none';
      if (onComplete) onComplete();
    }
  });

  tl.to(logo, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: 'power2.out',
  })
  .to(logo, {
    opacity: 0,
    scale: 1.1,
    duration: 0.3,
    delay: 0.3,
  })
  .to(loader, {
    yPercent: -100,
    duration: 0.8,
    ease: 'power3.inOut',
  }, '-=0.1');
}

/* ========== HERO ENTRANCE ========== */
function animateHero() {
  const words = document.querySelectorAll('.hero-headline .word');
  const tagline = document.querySelector('.hero-tagline');
  const btn = document.querySelector('.hero .btn-primary');
  const scrollHint = document.querySelector('.hero-scroll-hint');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to(words, {
    y: 0,
    duration: 0.8,
    stagger: 0.1,
  })
  .to(tagline, {
    opacity: 1,
    y: 0,
    duration: 0.7,
  }, '-=0.3')
  .to(btn, {
    opacity: 1,
    y: 0,
    duration: 0.6,
  }, '-=0.4')
  .to(scrollHint, {
    opacity: 1,
    duration: 0.5,
  }, '-=0.3');
}

/* ========== HERO VIDEO SCROLL-SCRUB (BACKGROUND) ========== */
function setupHeroVideoScrub() {
  const video = document.getElementById('scrollVideo');
  const hero = document.getElementById('hero');
  const heroInner = document.getElementById('heroInner');
  const heroOverlay = hero.querySelector('.hero-video-overlay');
  const text1 = hero.querySelector('.video-text-1');
  const text2 = hero.querySelector('.video-text-2');
  const scrollHint = hero.querySelector('.hero-scroll-hint');

  if (!video || !hero) return;

  // Force video load on mobile
  video.pause();
  video.setAttribute('muted', '');
  video.muted = true;
  video.load();

  // Play-then-pause trick to force mobile browsers to buffer
  video.play().then(() => {
    video.pause();
    video.currentTime = 0;
  }).catch(() => {});

  let scrubInitialized = false;
  const initScrub = () => {
    if (scrubInitialized) return;
    const duration = video.duration;
    if (!duration || isNaN(duration)) return;
    scrubInitialized = true;
    video.classList.add('video-ready');

    // Pin the hero and create a long scroll zone
    const isMobile = window.innerWidth <= 768;
    const pinTrigger = ScrollTrigger.create({
      trigger: hero,
      pin: true,
      start: 'top top',
      end: isMobile ? '+=200%' : '+=300%',
      scrub: 2,
      onUpdate: (self) => {
        const progress = self.progress;

        // Scrub video
        const time = progress * duration;
        if (Math.abs(video.currentTime - time) > 0.1) {
          video.currentTime = time;
        }

        // Video always fully visible behind hero text
        video.style.opacity = 1;

        // Phase 1 (0-10%): cream overlay fades out, hero text visible over video
        // Phase 2 (10-50%): video plays, hero text stays fully visible
        // Phase 3 (50-65%): hero text fades out
        // Phase 4 (65-100%): video-only with overlay text animations

        if (progress < 0.1) {
          // Overlay fades from semi-transparent to fully transparent
          const overlayOpacity = 0.4 * (1 - progress / 0.1);
          heroOverlay.style.background = `rgba(250, 248, 243, ${overlayOpacity})`;
          heroInner.style.opacity = 1;
        } else if (progress < 0.5) {
          // Overlay gone, hero text fully visible
          heroOverlay.style.background = 'rgba(250, 248, 243, 0)';
          heroInner.style.opacity = 1;
        } else if (progress < 0.65) {
          // Hero text fades out
          heroOverlay.style.background = 'rgba(250, 248, 243, 0)';
          heroInner.style.opacity = 1 - ((progress - 0.5) / 0.15);
        } else {
          // Full video mode
          heroOverlay.style.background = 'rgba(250, 248, 243, 0)';
          heroInner.style.opacity = 0;
        }

        // Hide scroll hint as we start scrolling
        if (scrollHint) {
          scrollHint.style.opacity = progress < 0.05 ? 1 - (progress / 0.05) : 0;
        }
      }
    });

    // Text 1: slide in from right at 68-78%, fade out at 80-88%
    if (text1) {
      gsap.to(text1, {
        opacity: 1, x: 0,
        scrollTrigger: {
          trigger: hero,
          start: '68% top',
          end: '78% top',
          scrub: 2,
        }
      });
      gsap.to(text1, {
        opacity: 0, x: -20,
        scrollTrigger: {
          trigger: hero,
          start: '80% top',
          end: '88% top',
          scrub: 2,
        }
      });
    }

    // Text 2: slide in from right at 85-92%, fade out at 93-98%
    if (text2) {
      gsap.to(text2, {
        opacity: 1, x: 0,
        scrollTrigger: {
          trigger: hero,
          start: '85% top',
          end: '92% top',
          scrub: 2,
        }
      });
      gsap.to(text2, {
        opacity: 0, x: -20,
        scrollTrigger: {
          trigger: hero,
          start: '93% top',
          end: '98% top',
          scrub: 2,
        }
      });
    }
  };

  if (video.readyState >= 1) {
    initScrub();
  } else {
    video.addEventListener('loadedmetadata', initScrub);
    // Fallback: retry after a delay for mobile browsers that are slow to load
    video.addEventListener('canplay', initScrub, { once: true });
    video.addEventListener('canplaythrough', initScrub, { once: true });
    // Touch to wake video on mobile
    document.addEventListener('touchstart', function mobileVideoWake() {
      video.load();
      video.addEventListener('loadedmetadata', initScrub, { once: true });
      document.removeEventListener('touchstart', mobileVideoWake);
    }, { once: true });
  }

  // 5-second timeout fallback — show poster if video never loads
  setTimeout(() => {
    if (!scrubInitialized) {
      video.classList.add('video-fallback');
    }
  }, 5000);

  // Canvas fallback for file:// protocol
  if (window.location.protocol === 'file:') {
    setupCanvasFallback(video);
  }
}

/* Canvas fallback for file:// */
function setupCanvasFallback(video) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;';
  video.parentElement.insertBefore(canvas, video);
  video.style.display = 'none';

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  video.addEventListener('loadeddata', () => {
    const drawFrame = () => {
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    };

    if ('requestVideoFrameCallback' in video) {
      const onFrame = () => {
        drawFrame();
        video.requestVideoFrameCallback(onFrame);
      };
      video.requestVideoFrameCallback(onFrame);
    } else {
      video.addEventListener('timeupdate', drawFrame);
    }
  });
}

/* ========== BRAND STRIP ========== */
function setupBrandStrip() {
  const brandStrip = document.querySelector('.brand-strip');
  if (!brandStrip) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: brandStrip,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.to(brandStrip.querySelectorAll('.strip-line'), {
    scaleX: 1,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.inOut',
  })
  .from(brandStrip.querySelector('.strip-text'), {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.6');
}

/* ========== PRODUCT CARDS ========== */
function setupProducts() {
  document.querySelectorAll('.product-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: i * 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });
  });
}

/* ========== SECTION DIVIDER PARALLAX + ZOOM ========== */
function setupDividerParallax() {
  const dividerImg = document.querySelector('.section-divider img');
  if (!dividerImg) return;

  gsap.fromTo(dividerImg, {
    y: -30,
    scale: 1,
  }, {
    y: 30,
    scale: 1.1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-divider',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
}

/* ========== ABOUT SECTION ========== */
function setupAbout() {
  const aboutImage = document.querySelector('.about-image');
  const aboutContent = document.querySelector('.about-content');

  if (aboutImage) {
    gsap.to(aboutImage, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: '.about-grid',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  if (aboutContent) {
    gsap.from(aboutContent, {
      opacity: 0,
      x: 60,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-grid',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      }
    });
  }
}

/* ========== NUMBER COUNTERS ========== */
function setupCounters() {
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    const numberEl = counter.querySelector('.counter-number');

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            numberEl.textContent = Math.floor(this.targets()[0].val);
          }
        });
      }
    });
  });
}

/* ========== LOCATION CARDS ========== */
function setupLocations() {
  document.querySelectorAll('.location-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      }
    });
  });
}

/* ========== SECTION TITLES ========== */
function setupSectionTitles() {
  document.querySelectorAll('.section-title').forEach(title => {
    gsap.from(title, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });
  });
}

/* ========== MARQUEE TOUCH/DRAG SCROLL ========== */
function setupMarqueeDrag() {
  document.querySelectorAll('.marquee-track-wrapper').forEach(wrapper => {
    const track = wrapper.querySelector('.marquee-track');
    if (!track) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslateX = 0;

    function getTranslateX() {
      const style = getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m41;
    }

    function onStart(x) {
      isDragging = true;
      startX = x;
      currentTranslateX = getTranslateX();
      track.style.animationPlayState = 'paused';
      track.style.transform = `translateX(${currentTranslateX}px)`;
    }

    function onMove(x) {
      if (!isDragging) return;
      const delta = x - startX;
      track.style.transform = `translateX(${currentTranslateX + delta}px)`;
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      // Clear inline styles to let CSS animation resume
      track.style.transform = '';
      track.style.animationPlayState = '';
    }

    wrapper.addEventListener('touchstart', (e) => {
      onStart(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      onMove(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchend', onEnd);

    wrapper.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX);
    });

    window.addEventListener('mouseup', onEnd);
  });
}

/* ========== FALLBACK ========== */
function revealFallback() {
  document.querySelectorAll('.product-card').forEach(c => {
    c.style.opacity = '1';
    c.style.transform = 'none';
  });
  document.querySelectorAll('.hero-headline .word').forEach(w => {
    w.style.transform = 'none';
  });
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) tagline.style.cssText = 'opacity:1;transform:none';
  const btn = document.querySelector('.hero .btn-primary');
  if (btn) btn.style.cssText = 'opacity:1;transform:none';
  const aboutImg = document.querySelector('.about-image');
  if (aboutImg) aboutImg.style.clipPath = 'inset(0)';

  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

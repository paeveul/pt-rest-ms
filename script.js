/* ============================================================
   AURUM — script.js
   All custom JS. Vanilla ES2023+. No inline scripts on pages.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. prefers-reduced-motion guard ─────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll Progress Bar ───────────────────────────────── */
  const scrollBar = document.getElementById('scroll-progress');
  if (scrollBar) {
    const updateScrollBar = () => {
      const scrollTop    = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      scrollBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateScrollBar, { passive: true });
  }

  /* ── 2. Transparent → Solid Nav ──────────────────────────── */
  const nav = document.getElementById('main-nav');
  if (nav) {
    const updateNav = () => {
      if (window.scrollY > 80) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── 3. Mobile Menu ───────────────────────────────────────── */
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const menuClose   = document.getElementById('mobile-menu-close');
  const menuLinks   = mobileMenu ? mobileMenu.querySelectorAll('nav a') : [];

  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (!prefersReducedMotion) {
      menuLinks.forEach((link, i) => {
        link.style.transition = `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`;
      });
    }
  };

  const closeMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMenu();
  });

  /* ── 4. Custom Cursor (desktop only) ─────────────────────── */
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (isPointerFine && !prefersReducedMotion) {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (dot && ring) {
      document.body.classList.add('cursor-active');
      dot.style.opacity  = '1';
      ring.style.opacity = '1';

      let mouseX = 0, mouseY = 0;
      let ringX  = 0, ringY  = 0;
      let rafId;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
      });

      const animateCursor = () => {
        const lerp = 0.12;
        ringX += (mouseX - ringX) * lerp;
        ringY += (mouseY - ringY) * lerp;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        rafId = requestAnimationFrame(animateCursor);
      };
      rafId = requestAnimationFrame(animateCursor);

      const hoverEls = document.querySelectorAll('a, button, input, textarea, select, label, [role="button"]');
      hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
          dot.classList.add('cursor-hover');
          ring.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
          dot.classList.remove('cursor-hover');
          ring.classList.remove('cursor-hover');
        });
      });
    }
  }

  /* ── 5. Hero Text Reveal (index only) ────────────────────── */
  const heroEyebrow  = document.querySelector('.hero-eyebrow');
  const heroTitle    = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroBtns     = document.querySelector('.hero-buttons');
  const scrollInd    = document.querySelector('.scroll-indicator');

  if (heroTitle && !prefersReducedMotion) {
    const words = heroTitle.querySelectorAll('.word');

    const tl = [
      { el: heroEyebrow,  delay: 0 },
      ...Array.from(words).map((w, i) => ({ el: w, delay: 200 + i * 200 })),
      { el: heroSubtitle, delay: 200 + words.length * 200 + 100 },
      { el: heroBtns,     delay: 200 + words.length * 200 + 300 },
      { el: scrollInd,    delay: 200 + words.length * 200 + 500 },
    ];

    tl.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      }, delay);
    });
  } else if (heroTitle) {
    /* Reduced motion — just show everything */
    [heroEyebrow, heroSubtitle, heroBtns, scrollInd].forEach(el => {
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    heroTitle.querySelectorAll('.word').forEach(w => {
      w.style.transform = 'translateY(0)';
    });
  }

  /* ── 6. Scroll-Triggered Reveals ─────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealChildEls = document.querySelectorAll('.reveal-children');

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));

    const childObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target;
          parent.classList.add('revealed');
          const children = parent.querySelectorAll(':scope > *');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
          });
          childObserver.unobserve(parent);
        }
      });
    }, { threshold: 0.15 });

    revealChildEls.forEach(el => childObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
    revealChildEls.forEach(el => {
      el.classList.add('revealed');
      el.querySelectorAll(':scope > *').forEach(child => {
        child.style.opacity    = '1';
        child.style.transform  = 'none';
      });
    });
  }

  /* ── 7. Horizontal Dish Scroll — mouse drag ───────────────── */
  const dishStrip = document.getElementById('dish-strip');
  if (dishStrip) {
    let isDown   = false;
    let startX;
    let scrollLeft;

    dishStrip.addEventListener('mousedown', (e) => {
      isDown = true;
      dishStrip.classList.add('is-dragging');
      startX     = e.pageX - dishStrip.offsetLeft;
      scrollLeft = dishStrip.scrollLeft;
    });

    document.addEventListener('mouseup', () => {
      isDown = false;
      dishStrip.classList.remove('is-dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - dishStrip.offsetLeft;
      const walk = (startX - x) * 1.5;
      dishStrip.scrollLeft = scrollLeft + walk;
    });
  }

  /* ── 8. Gallery Lightbox ─────────────────────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbClose     = document.getElementById('lightbox-close');
  const lbPrev      = document.getElementById('lightbox-prev');
  const lbNext      = document.getElementById('lightbox-next');
  const lbCaption   = document.getElementById('lightbox-caption');
  const galleryImgs = Array.from(document.querySelectorAll('.masonry-item'));

  let currentLbIdx = 0;

  const openLightbox = (idx) => {
    if (!lightbox) return;
    currentLbIdx = idx;
    const item   = galleryImgs[idx];
    const img    = item?.querySelector('img');
    const cap    = item?.querySelector('.masonry-caption');
    if (img) lbImg.src = img.src;
    if (lbCaption) lbCaption.textContent = cap?.textContent || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const prevImg = () => {
    currentLbIdx = (currentLbIdx - 1 + galleryImgs.length) % galleryImgs.length;
    openLightbox(currentLbIdx);
  };

  const nextImg = () => {
    currentLbIdx = (currentLbIdx + 1) % galleryImgs.length;
    openLightbox(currentLbIdx);
  };

  galleryImgs.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', prevImg);
  lbNext?.addEventListener('click', nextImg);

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevImg();
    if (e.key === 'ArrowRight') nextImg();
  });

  /* ── 9. Menu scroll spy ───────────────────────────────────── */
  const menuSidebarLinks = document.querySelectorAll('.menu-sidebar-link');
  const menuSections     = document.querySelectorAll('.menu-section[id]');

  if (menuSidebarLinks.length && menuSections.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          menuSidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    menuSections.forEach(sec => spyObserver.observe(sec));
  }

  /* ── 10. Reservation form — floating labels & submit ──────── */
  const resForm = document.getElementById('reservation-form');
  const selects = document.querySelectorAll('.field-group select');

  selects.forEach(sel => {
    const updateSelect = () => {
      if (sel.value !== '') {
        sel.classList.add('has-value');
      } else {
        sel.classList.remove('has-value');
      }
    };
    sel.addEventListener('change', updateSelect);
    updateSelect();
  });

  /* Date inputs — float label when a date is chosen */
  const dateInputs = document.querySelectorAll('.field-group input[type="date"]');
  dateInputs.forEach(inp => {
    const update = () => {
      if (inp.value) {
        inp.classList.add('has-value');
      } else {
        inp.classList.remove('has-value');
      }
    };
    inp.addEventListener('change', update);
    update();
  });

  if (resForm) {
    const successMsg = document.getElementById('form-success');
    const errorMsg   = document.getElementById('form-error');

    resForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = resForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled    = true;
      }

      try {
        const formData = new FormData(resForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method:  'POST',
          body:    formData,
        });
        const data = await response.json();
        if (data.success) {
          resForm.style.display   = 'none';
          if (successMsg) successMsg.style.display = 'block';
        } else {
          throw new Error(data.message || 'Submission error');
        }
      } catch {
        if (errorMsg) errorMsg.style.display = 'block';
        if (submitBtn) {
          submitBtn.textContent = 'Confirm Reservation';
          submitBtn.disabled    = false;
        }
      }
    });
  }

  /* ── 11. Contact form submit ──────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const successMsg = document.getElementById('contact-success');
    const errorMsg   = document.getElementById('contact-error');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled    = true;
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body:   formData,
        });
        const data = await response.json();
        if (data.success) {
          contactForm.style.display = 'none';
          if (successMsg) successMsg.style.display = 'block';
        } else {
          throw new Error(data.message || 'Submission error');
        }
      } catch {
        if (errorMsg) errorMsg.style.display = 'block';
        if (submitBtn) {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled    = false;
        }
      }
    });
  }

  /* ── 12. Active nav link ──────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, #mobile-menu nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});

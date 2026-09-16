document.addEventListener('DOMContentLoaded', () => {
  const allTabLinks = document.querySelectorAll('a[href^="#"]');
  const CONTENT_FADE_MS = 450;
  const SCROLL_THRESHOLD = 80;
  let isAnimating = false;

  function getInner(section) {
    return section.querySelector('.hero-inner, .page-inner');
  }

  function applyNavTheme(target) {
    document.body.classList.toggle('theme-light', target.dataset.navTheme === 'light');
  }

  function setActiveNavLink(targetId) {
    document.querySelectorAll('nav.links a, .side-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`nav.links a[href="#${targetId}"], .side-nav-link[href="#${targetId}"]`)
      .forEach(l => l.classList.add('active'));
  }

  function updateScrollState() {
    const activeSection = document.querySelector('.page-section.active');
    const sectionScrollTop = activeSection ? activeSection.scrollTop : 0;
    document.body.classList.toggle(
      'scrolled',
      window.scrollY > SCROLL_THRESHOLD || sectionScrollTop > SCROLL_THRESHOLD
    );
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  document.querySelectorAll('.page-section').forEach((section) => {
    section.addEventListener('scroll', updateScrollState, { passive: true });
  });
  updateScrollState();

  function switchPage(targetId) {
    const target = document.getElementById(targetId);
    if (!target || !target.classList.contains('page-section')) return false;

    if (isAnimating) return true;

    const current = document.querySelector('.page-section.active');
    if (current === target) return true;

    const currentInner = current ? getInner(current) : null;
    const targetInner = getInner(target);

    isAnimating = true;

    const revealTarget = () => {
      if (current) current.classList.remove('active');
      target.classList.add('active');
      applyNavTheme(target);
      setActiveNavLink(targetId);
      updateScrollState();

      if (targetInner) {
        targetInner.classList.remove('content-exit');
        targetInner.classList.add('content-exit');
        void targetInner.offsetWidth;
        requestAnimationFrame(() => {
          targetInner.classList.remove('content-exit');
        });
      }

      isAnimating = false;
    };

    if (currentInner) {
      currentInner.classList.add('content-exit');
      setTimeout(revealTarget, CONTENT_FADE_MS);
    } else {
      revealTarget();
    }

    return true;
  }

  allTabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').replace('#', '');
      const handled = switchPage(targetId);
      if (handled) e.preventDefault();
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector('.carousel-track');
    const slides = Array.from(root.querySelectorAll('.carousel-slide'));
    const dotsWrap = root.querySelector('.carousel-dots');
    const prevBtn = root.querySelector('.carousel-btn.prev');
    const nextBtn = root.querySelector('.carousel-btn.next');
    if (!track || slides.length === 0) return;

    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    prevBtn && prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(index + 1));

    let startX = null;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) goTo(diff < 0 ? index + 1 : index - 1);
      startX = null;
    });

    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    render();
  }
});
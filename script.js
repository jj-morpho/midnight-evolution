/* ==========================================================================
   Morpho Midnight Evolution — Horizontal Timeline Scroll
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* --- DOM refs --- */
const track       = document.querySelector('.timeline-track');
const features    = document.querySelectorAll('.feature-block');
const connectors  = document.querySelectorAll('.connector');
const trackFill   = document.querySelector('.track-line-fill');
const finale      = document.querySelector('.finale');

/* =======================================================================
   Hero entrance
   ======================================================================= */
gsap.from('.hero-eyebrow',    { opacity: 0, y: 20, duration: 0.8, delay: 0.3, ease: 'power3.out' });
gsap.from('.hero-title',      { opacity: 0, y: 30, duration: 0.9, delay: 0.5, ease: 'power3.out' });
gsap.from('.hero-subtitle',   { opacity: 0, y: 20, duration: 0.8, delay: 0.7, ease: 'power3.out' });
gsap.from('.scroll-indicator', { opacity: 0, y: 15, duration: 0.8, delay: 1.0, ease: 'power3.out' });

ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 90%',
  onEnter: () => gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 }),
  onLeaveBack: () => gsap.to('.scroll-indicator', { opacity: 1, duration: 0.3 }),
});

/* =======================================================================
   Horizontal scroll: pin the timeline section and scroll sideways
   ======================================================================= */

/* Calculate how far to scroll horizontally */
function getScrollWidth() {
  return track.scrollWidth - window.innerWidth;
}

/* The main horizontal scroll animation */
const horizontalScroll = gsap.to(track, {
  x: () => -getScrollWidth(),
  ease: 'none',
  scrollTrigger: {
    trigger: '.timeline-section',
    start: 'top top',
    end: () => `+=${getScrollWidth()}`,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const progress = self.progress;

      /* Update the track line fill */
      trackFill.style.width = (progress * 100) + '%';

      /* Progressively reveal features based on scroll progress */
      const totalSteps = 4; /* 0: core, 1: callbacks, 2: autoroll, 3: adapters */
      const step = progress * totalSteps;

      features.forEach((f, i) => {
        if (step >= i * 0.85) {
          f.classList.add('visible');
        } else {
          f.classList.remove('visible');
        }
        /* Active = the most recently revealed */
        f.classList.toggle('active', Math.floor(step) === i || (i === totalSteps - 1 && step >= (totalSteps - 1) * 0.85));
      });

      /* Show connectors slightly after their preceding block */
      connectors.forEach((c) => {
        const afterIdx = parseInt(c.dataset.after);
        if (step >= afterIdx + 0.5) {
          c.classList.add('visible');
        } else {
          c.classList.remove('visible');
        }
      });
    },
  },
});

/* Show core block immediately when section enters */
ScrollTrigger.create({
  trigger: '.timeline-section',
  start: 'top 80%',
  onEnter: () => {
    features[0].classList.add('visible');
    features[0].classList.add('active');
  },
});

/* =======================================================================
   Finale reveal
   ======================================================================= */

ScrollTrigger.create({
  trigger: '.finale',
  start: 'top 70%',
  onEnter: () => finale.classList.add('visible'),
  onLeaveBack: () => finale.classList.remove('visible'),
});

/* =======================================================================
   Refresh
   ======================================================================= */
ScrollTrigger.refresh();

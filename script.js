/* ==========================================================================
   Morpho Midnight Evolution — Scroll Animations
   GSAP + ScrollTrigger
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* --- DOM refs --- */
const svg         = document.querySelector('.butterfly-svg');
const label       = document.querySelector('.butterfly-label');
const body        = document.querySelector('.butterfly-body');
const timeline    = document.querySelector('.timeline');
const fill        = document.querySelector('.timeline-fill');
const dots        = document.querySelectorAll('.timeline-dot');
const sections    = document.querySelectorAll('.scroll-section');

/* Wing index → CSS selector */
const WINGS = { 1: '.wing-tl', 2: '.wing-tr', 3: '.wing-bl', 4: '.wing-br' };
const litWings = new Set();

/* =======================================================================
   Hero entrance
   ======================================================================= */
gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.3, ease: 'power3.out' });
gsap.from('.hero-title',   { opacity: 0, y: 30, duration: 0.9, delay: 0.5, ease: 'power3.out' });
gsap.from('.hero-subtitle',{ opacity: 0, y: 20, duration: 0.8, delay: 0.7, ease: 'power3.out' });
gsap.from('.scroll-indicator', { opacity: 0, y: 15, duration: 0.8, delay: 1.0, ease: 'power3.out' });

/* Hide scroll indicator once user scrolls past hero */
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 90%',
  onEnter: () => gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 }),
  onLeaveBack: () => gsap.to('.scroll-indicator', { opacity: 1, duration: 0.3 }),
});

/* =======================================================================
   Timeline visibility
   ======================================================================= */
ScrollTrigger.create({
  trigger: '#evolution',
  start: 'top 80%',
  end: 'bottom 20%',
  onEnter:     () => timeline.classList.add('visible'),
  onLeave:     () => timeline.classList.remove('visible'),
  onEnterBack: () => timeline.classList.add('visible'),
  onLeaveBack: () => timeline.classList.remove('visible'),
});

/* =======================================================================
   Helpers
   ======================================================================= */

function updateTimeline(idx) {
  const pct = ((idx + 1) / 6) * 100;
  fill.style.height = pct + '%';
  dots.forEach((d, i) => d.classList.toggle('active', i <= idx));
}

function lightWing(sel) {
  if (litWings.has(sel)) return;
  litWings.add(sel);
  const wing = document.querySelector(sel);
  if (!wing) return;
  wing.classList.add('lit');
  /* Animate fill from 0 → 1 with a slight scale pop */
  const wingFill = wing.querySelector('.wing-fill');
  gsap.fromTo(wingFill,
    { opacity: 0 },
    { opacity: 1, duration: 1.0, ease: 'power2.out' }
  );
}

function dimWing(sel) {
  if (!litWings.has(sel)) return;
  litWings.delete(sel);
  const wing = document.querySelector(sel);
  if (!wing) return;
  wing.classList.remove('lit');
  gsap.to(wing.querySelector('.wing-fill'), { opacity: 0, duration: 0.5 });
}

/* =======================================================================
   Per-section scroll triggers
   ======================================================================= */

sections.forEach((section) => {
  const idx  = parseInt(section.dataset.section);
  const card = section.querySelector('.feature-card');
  const side = card.dataset.side;

  /* Card entrance offset */
  let xFrom = 0;
  if (side === 'left')  xFrom = -40;
  if (side === 'right') xFrom = 40;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    end: 'bottom 35%',

    onEnter: () => {
      /* Reveal card */
      gsap.to(card, { opacity: 1, y: 0, x: 0, duration: 0.7, ease: 'power3.out' });

      /* Section 0 → light the body */
      if (idx === 0) {
        body.classList.add('lit');
        label.classList.add('visible');
      }

      /* Light the wing */
      if (WINGS[idx]) lightWing(WINGS[idx]);

      /* Finale glow */
      if (idx === 5) svg.classList.add('glow-pulse');

      updateTimeline(idx);
    },

    onLeaveBack: () => {
      /* Hide card */
      gsap.to(card, { opacity: 0, y: 30, x: xFrom, duration: 0.4, ease: 'power2.in' });

      if (idx === 0) {
        body.classList.remove('lit');
        label.classList.remove('visible');
      }

      if (WINGS[idx]) dimWing(WINGS[idx]);
      if (idx === 5) svg.classList.remove('glow-pulse');

      updateTimeline(idx - 1);
    },
  });

  /* Set initial (hidden) state */
  gsap.set(card, { opacity: 0, y: 30, x: xFrom });
});

/* =======================================================================
   Butterfly grows as user scrolls through the evolution
   Starts at 0.55x scale and grows to 1.15x by the finale
   ======================================================================= */

/* Set initial small scale */
gsap.set(svg, { scale: 0.55 });

ScrollTrigger.create({
  trigger: '#evolution',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.2,
  onUpdate: (self) => {
    /* 0.55 → 1.15  (doubles in apparent area) */
    const s = 0.55 + self.progress * 0.6;
    gsap.set(svg, { scale: s });
  },
});

/* Final refresh */
ScrollTrigger.refresh();

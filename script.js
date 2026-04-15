/* ==========================================================================
   Morpho Midnight Evolution — Scroll Animations
   GSAP + ScrollTrigger
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* --- DOM refs --- */
const svg         = document.querySelector('.butterfly-svg');
const label       = document.querySelector('.butterfly-label');
const bBody       = document.querySelector('.butterfly-body');
const timeline    = document.querySelector('.timeline');
const fill        = document.querySelector('.timeline-fill');
const dots        = document.querySelectorAll('.timeline-dot');
const sections    = document.querySelectorAll('.scroll-section');
const stickyCards = document.querySelectorAll('.sticky-card');

/* Wing index → CSS selector */
const WINGS = { 1: '.wing-tl', 2: '.wing-tr', 3: '.wing-bl', 4: '.wing-br' };
const litWings = new Set();

/* Track current section for "active" highlight */
let currentSection = -1;

/* =======================================================================
   Hero entrance
   ======================================================================= */
gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.3, ease: 'power3.out' });
gsap.from('.hero-title',   { opacity: 0, y: 30, duration: 0.9, delay: 0.5, ease: 'power3.out' });
gsap.from('.hero-subtitle',{ opacity: 0, y: 20, duration: 0.8, delay: 0.7, ease: 'power3.out' });
gsap.from('.scroll-indicator', { opacity: 0, y: 15, duration: 0.8, delay: 1.0, ease: 'power3.out' });

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
  const pct = Math.max(0, ((idx + 1) / 6) * 100);
  fill.style.height = pct + '%';
  dots.forEach((d, i) => {
    d.classList.toggle('active', i <= idx);
    d.classList.toggle('current', i === idx);
  });
}

function highlightStickyCard(idx) {
  currentSection = idx;
  stickyCards.forEach(c => {
    const cardIdx = parseInt(c.dataset.sticky);
    c.classList.toggle('active', cardIdx === idx);
  });
}

function lightWing(sel, idx) {
  if (litWings.has(sel)) return;
  litWings.add(sel);
  const wing = document.querySelector(sel);
  if (!wing) return;
  wing.classList.add('lit');
  gsap.fromTo(wing.querySelector('.wing-fill'),
    { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power2.out' }
  );

  /* Show the sticky card for this wing */
  const card = document.querySelector(`[data-sticky="${idx}"]`);
  if (card) card.classList.add('visible');
}

function dimWing(sel, idx) {
  if (!litWings.has(sel)) return;
  litWings.delete(sel);
  const wing = document.querySelector(sel);
  if (!wing) return;
  wing.classList.remove('lit');
  gsap.to(wing.querySelector('.wing-fill'), { opacity: 0, duration: 0.5 });

  /* Hide the sticky card */
  const card = document.querySelector(`[data-sticky="${idx}"]`);
  if (card) {
    card.classList.remove('visible');
    card.classList.remove('active');
  }
}

/* =======================================================================
   Per-section scroll triggers
   ======================================================================= */

sections.forEach((section) => {
  const idx = parseInt(section.dataset.section);

  /* Sections 1–4 are empty triggers (cards are in the sticky wrapper) */
  /* Sections 0 and 5 have their own cards inside them */
  const hasOwnCard = (idx === 0 || idx === 5);
  const card = hasOwnCard ? section.querySelector('.feature-card') : null;

  let xFrom = 0;
  if (card) {
    const side = card.dataset.side;
    if (side === 'left') xFrom = -40;
    if (side === 'right') xFrom = 40;
    gsap.set(card, { opacity: 0, y: 30, x: xFrom });
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    end: 'bottom 35%',

    onEnter: () => {
      /* Reveal section's own card (sections 0 & 5) */
      if (card) {
        gsap.to(card, { opacity: 1, y: 0, x: 0, duration: 0.7, ease: 'power3.out' });
      }

      /* Section 0 → light the body */
      if (idx === 0) {
        bBody.classList.add('lit');
        label.classList.add('visible');
      }

      /* Sections 1–4: light wing + reveal sticky card */
      if (WINGS[idx]) lightWing(WINGS[idx], idx);

      /* Highlight current sticky card */
      highlightStickyCard(idx);

      /* Finale: glow + sunrise + wing flap */
      if (idx === 5) {
        svg.classList.add('glow-pulse');
        svg.classList.add('flapping');
        document.body.classList.add('sunrise');
      }

      updateTimeline(idx);
    },

    onLeaveBack: () => {
      /* Hide section's own card */
      if (card) {
        gsap.to(card, { opacity: 0, y: 30, x: xFrom, duration: 0.4, ease: 'power2.in' });
      }

      if (idx === 0) {
        bBody.classList.remove('lit');
        label.classList.remove('visible');
      }

      /* Dim wing + hide sticky card */
      if (WINGS[idx]) dimWing(WINGS[idx], idx);

      /* Unhighlight */
      highlightStickyCard(idx - 1);

      if (idx === 5) {
        svg.classList.remove('glow-pulse');
        svg.classList.remove('flapping');
        document.body.classList.remove('sunrise');
      }

      updateTimeline(idx - 1);
    },
  });
});

/* =======================================================================
   Butterfly grows as user scrolls (0.55x → 1.15x)
   ======================================================================= */

gsap.set(svg, { scale: 0.55 });

ScrollTrigger.create({
  trigger: '#evolution',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.2,
  onUpdate: (self) => {
    const s = 0.55 + self.progress * 0.6;
    gsap.set(svg, { scale: s });
  },
});

/* Final refresh */
ScrollTrigger.refresh();

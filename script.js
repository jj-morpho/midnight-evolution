/* ==========================================================================
   Morpho Midnight — Additive Block Layout

   5 phases driven by scroll (stage is pinned full-screen):
   Phase 0: Core alone (centered)
   Phase 1: + Callbacks stacks above Core
   Phase 2: + Auto-Rolling fills in beside Core (bottom-right)
   Phase 3: + Midnight Adapters completes 2×2 (top-right)
   Phase 4: Blocks fade → butterfly takes off in daylight
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

const stage     = document.getElementById('stage');
const blocks    = document.getElementById('blocks');
const bScene    = document.getElementById('butterfly-scene');
const pips      = document.querySelectorAll('.phase-pip');
const hDots     = document.querySelectorAll('.h-dot');
const hFill     = document.querySelector('.h-timeline-fill');

const core      = document.querySelector('[data-block="core"]');
const callbacks = document.querySelector('[data-block="callbacks"]');
const autoroll  = document.querySelector('[data-block="autoroll"]');
const adapters  = document.querySelector('[data-block="adapters"]');

const allBlocks = [core, callbacks, autoroll, adapters];

let currentPhase = -1;
const GAP = 16;

function vw() { return window.innerWidth; }
function vh() { return window.innerHeight; }

/* Animate block to position */
function posBlock(el, x, y, w) {
  const props = { left: x, top: y, duration: 0.65, ease: 'power2.inOut' };
  if (w !== undefined) props.width = w;
  gsap.to(el, props);
}

/* =======================================================================
   Phase definitions — Core is always bottom-left anchor
   ======================================================================= */

function applyPhase(phase) {
  if (phase === currentPhase) return;
  currentPhase = phase;

  // Update pips
  pips.forEach((p, i) => {
    p.classList.toggle('active', i === phase);
    p.classList.toggle('done', i < phase);
  });

  const cx = vw() / 2;
  const cy = vh() / 2;

  // Block sizes — responsive
  const bw = Math.min(420, vw() * 0.3);   // single block width
  const gap = GAP;

  // Measure actual max block height for consistent grid rows
  allBlocks.forEach(b => { b.classList.add('visible'); b.style.width = bw + 'px'; });
  const bh = Math.max(...allBlocks.map(b => b.offsetHeight));
  allBlocks.forEach(b => { b.classList.remove('visible'); b.style.width = ''; });

  // Reset visibility and grid mode
  allBlocks.forEach(b => {
    b.classList.remove('visible', 'active', 'grid-mode');
    b.style.minHeight = '';
  });
  blocks.classList.remove('hidden');
  bScene.classList.remove('visible', 'flapping');
  stage.classList.remove('daylight');

  if (phase === 0) {
    /* ─── Phase 0: Core alone, centered ─── */
    core.classList.add('visible', 'active');
    posBlock(core, cx - bw/2, cy - bh/2, bw);

  } else if (phase === 1) {
    /* ─── Phase 1: Callbacks on top, Core below ─── */
    core.classList.add('visible');
    callbacks.classList.add('visible', 'active');

    const totalH = bh + gap + bh;
    const sy = cy - totalH / 2;

    posBlock(callbacks, cx - bw/2, sy, bw);
    posBlock(core,      cx - bw/2, sy + bh + gap, bw);

  } else if (phase === 2) {
    /* ─── Phase 2: Callbacks top-left, Core BL, Auto-Rolling BR ─── */
    const visible = [core, callbacks, autoroll];
    visible.forEach(b => { b.classList.add('visible', 'grid-mode'); b.style.minHeight = bh + 'px'; });
    autoroll.classList.add('active');

    const gridW = bw + gap + bw;
    const gridH = bh + gap + bh;
    const sx = cx - gridW / 2;
    const sy = cy - gridH / 2;

    posBlock(callbacks, sx, sy, bw);
    posBlock(core,      sx, sy + bh + gap, bw);
    posBlock(autoroll,  sx + bw + gap, sy + bh + gap, bw);

  } else if (phase === 3) {
    /* ─── Phase 3: Full 2×2 grid ─── */
    allBlocks.forEach(b => { b.classList.add('visible', 'grid-mode'); b.style.minHeight = bh + 'px'; });
    adapters.classList.add('active');

    const gridW = bw + gap + bw;
    const gridH = bh + gap + bh;
    const sx = cx - gridW / 2;
    const sy = cy - gridH / 2;

    posBlock(callbacks, sx,            sy,              bw);  // TL
    posBlock(adapters,  sx + bw + gap, sy,              bw);  // TR
    posBlock(core,      sx,            sy + bh + gap,   bw);  // BL
    posBlock(autoroll,  sx + bw + gap, sy + bh + gap,   bw);  // BR

  } else if (phase === 4) {
    /* ─── Phase 4: Butterfly in daylight ─── */
    blocks.classList.add('hidden');
    stage.classList.add('daylight');
    bScene.classList.add('visible');
    setTimeout(() => bScene.classList.add('flapping'), 500);
  }
}

/* =======================================================================
   Scroll → phase mapping (pinned stage)
   ======================================================================= */

ScrollTrigger.create({
  trigger: '#stage',
  start: 'top top',
  end: '+=4000',
  pin: true,
  scrub: 0.8,
  onUpdate: (self) => {
    const p = self.progress;

    let phase;
    if (p < 0.15)      phase = 0;
    else if (p < 0.35) phase = 1;
    else if (p < 0.55) phase = 2;
    else if (p < 0.75) phase = 3;
    else                phase = 4;

    // Update bottom timeline
    if (hFill) hFill.style.width = (p * 100) + '%';
    hDots.forEach((d, i) => {
      d.classList.toggle('done', i < phase);
      d.classList.toggle('current', i === phase);
      d.classList.toggle('active', i <= phase);
    });

    applyPhase(phase);
  },
});

applyPhase(0);

window.addEventListener('resize', () => {
  currentPhase = -1; // force re-apply
  applyPhase(0);
  ScrollTrigger.refresh();
});

ScrollTrigger.refresh();

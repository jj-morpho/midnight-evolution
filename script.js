/* ==========================================================================
   Morpho Midnight — Additive Horizontal Scroll

   5 phases driven by vertical scroll (stage is pinned full-screen):
   Phase 0: Core protocol block alone, centered
   Phase 1: + Callbacks → 2 blocks side by side
   Phase 2: + Auto-Rolling → 3 blocks (core shrinks, 2 on right)
   Phase 3: + Midnight Adapters → 2×2 grid, all visible
   Phase 4: Blocks fade → butterfly takes off in daylight
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

const stage     = document.getElementById('stage');
const blocks    = document.getElementById('blocks');
const bScene    = document.getElementById('butterfly-scene');
const pips      = document.querySelectorAll('.phase-pip');

const core      = document.querySelector('[data-block="core"]');
const callbacks = document.querySelector('[data-block="callbacks"]');
const autoroll  = document.querySelector('[data-block="autoroll"]');
const adapters  = document.querySelector('[data-block="adapters"]');

const allBlocks = [core, callbacks, autoroll, adapters];

let currentPhase = -1;
const GAP = 20; // px gap between blocks in grid

/* =======================================================================
   Layout helpers — compute positions relative to viewport center
   ======================================================================= */

function vw() { return window.innerWidth; }
function vh() { return window.innerHeight; }

/* Position a block at absolute x, y (center-based) */
function posBlock(el, x, y) {
  gsap.to(el, {
    left: x,
    top: y,
    duration: 0.7,
    ease: 'power2.inOut',
  });
}

/* =======================================================================
   Phase definitions
   Each phase returns positions for visible blocks
   ======================================================================= */

function applyPhase(phase) {
  if (phase === currentPhase) return;
  currentPhase = phase;

  // Update pips
  pips.forEach((p, i) => {
    p.classList.toggle('active', i === phase);
    p.classList.toggle('done', i < phase);
  });

  // Block dimensions
  const bw = 420;  // normal width
  const cw = 380;  // compact width
  const bh = 280;  // approx block height
  const ch = 240;  // compact height

  const cx = vw() / 2;
  const cy = vh() / 2;

  // Reset all
  allBlocks.forEach(b => {
    b.classList.remove('visible', 'active', 'compact');
  });
  blocks.classList.remove('hidden');
  bScene.classList.remove('visible', 'flapping');
  stage.classList.remove('daylight');

  if (phase === 0) {
    /* --- Phase 0: Just core, centered --- */
    core.classList.add('visible', 'active');
    posBlock(core, cx - bw/2, cy - bh/2);

  } else if (phase === 1) {
    /* --- Phase 1: Core + Callbacks side by side --- */
    core.classList.add('visible');
    callbacks.classList.add('visible', 'active');

    const totalW = bw + GAP + bw;
    const startX = cx - totalW / 2;
    posBlock(core,      startX,              cy - bh/2);
    posBlock(callbacks,  startX + bw + GAP,   cy - bh/2);

  } else if (phase === 2) {
    /* --- Phase 2: Core (left) + Callbacks & Auto-Roll stacked (right) --- */
    core.classList.add('visible');
    callbacks.classList.add('visible', 'compact');
    autoroll.classList.add('visible', 'active', 'compact');

    const leftW = bw;
    const rightW = cw;
    const totalW = leftW + GAP + rightW;
    const startX = cx - totalW / 2;
    const stackH = ch + GAP + ch;
    const stackY = cy - stackH / 2;

    posBlock(core,      startX,              cy - bh/2);
    posBlock(callbacks,  startX + leftW + GAP, stackY);
    posBlock(autoroll,   startX + leftW + GAP, stackY + ch + GAP);

  } else if (phase === 3) {
    /* --- Phase 3: 2×2 grid — all 4 blocks visible --- */
    allBlocks.forEach(b => b.classList.add('visible', 'compact'));
    adapters.classList.add('active');

    const w = cw;
    const h = ch;
    const totalW = w + GAP + w;
    const totalH = h + GAP + h;
    const sx = cx - totalW / 2;
    const sy = cy - totalH / 2;

    posBlock(core,       sx,           sy + h + GAP);  // bottom-left
    posBlock(callbacks,  sx,           sy);             // top-left
    posBlock(autoroll,   sx + w + GAP, sy + h + GAP);  // bottom-right
    posBlock(adapters,   sx + w + GAP, sy);             // top-right

  } else if (phase === 4) {
    /* --- Phase 4: Butterfly takeoff in daylight --- */
    blocks.classList.add('hidden');
    stage.classList.add('daylight');
    bScene.classList.add('visible');

    // Start flapping after a short delay
    setTimeout(() => bScene.classList.add('flapping'), 600);
  }
}

/* =======================================================================
   Scroll-driven phase changes
   ======================================================================= */

// Pin the stage and scrub through 5 phases over 4000px of scroll
ScrollTrigger.create({
  trigger: '#stage',
  start: 'top top',
  end: '+=4000',
  pin: true,
  scrub: 0.8,
  onUpdate: (self) => {
    const p = self.progress; // 0 → 1

    let phase;
    if (p < 0.15)      phase = 0;
    else if (p < 0.35) phase = 1;
    else if (p < 0.55) phase = 2;
    else if (p < 0.75) phase = 3;
    else                phase = 4;

    applyPhase(phase);
  },
});

/* Start with phase 0 */
applyPhase(0);

/* Handle resize */
window.addEventListener('resize', () => {
  applyPhase(currentPhase);
});

ScrollTrigger.refresh();

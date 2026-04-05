/* ══════════════════════════════════════════
   QUANTUM AUDIO ENGINE
   Procedural Web Audio API — no files needed
   Ambient sci-fi drone + interaction sounds
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ─────────────────────────────────
  let ctx = null;
  let masterGain = null;
  let ambientGain = null;
  let sfxGain = null;
  let initialized = false;
  let ambientStarted = false;
  let muted = false;

  // ── Init on first user gesture ─────────────
  function initAudio() {
    if (initialized) return;
    initialized = true;

    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);

      ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.45;
      ambientGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.7;
      sfxGain.connect(masterGain);

      startAmbient();
      buildToggle();
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  // ── AMBIENT ENGINE ────────────────────────
  // Layers: deep drone + shimmer pad + quantum pulse + subtle noise
  function startAmbient() {
    if (ambientStarted) return;
    ambientStarted = true;

    const now = ctx.currentTime;

    // ── Layer 1: Deep sub drone (20 Hz rumble) ──
    createDrone(28, 0.18, now);
    createDrone(56, 0.10, now + 0.5);
    createDrone(84, 0.06, now + 1.0);

    // ── Layer 2: Mid atmospheric pad ──
    createPad(110, 0.08, now);
    createPad(165, 0.05, now + 0.3);
    createPad(220, 0.04, now + 0.6);

    // ── Layer 3: High shimmer (quantum sparkle) ──
    createShimmer(880,  0.025, now);
    createShimmer(1320, 0.018, now + 0.4);
    createShimmer(1760, 0.012, now + 0.8);

    // ── Layer 4: Slow LFO breathing ──
    createBreathing(now);

    // ── Layer 5: Quantum pulse (rhythmic blip every ~4s) ──
    scheduleQuantumPulse();

    // ── Layer 6: Data stream (subtle high-freq noise burst) ──
    scheduleDataStream();
  }

  function createDrone(freq, vol, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Detune slightly for richness
    osc.detune.value = (Math.random() - 0.5) * 8;

    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1.2;

    // Slow LFO on pitch
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07 + Math.random() * 0.05;
    lfoGain.gain.value = 1.2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(startTime);

    gain.gain.value = vol;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambientGain);

    osc.start(startTime);
  }

  function createPad(freq, vol, startTime) {
    // Two slightly detuned oscillators for width
    [-4, 4].forEach(detune => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;

      filter.type = 'bandpass';
      filter.frequency.value = freq * 1.5;
      filter.Q.value = 0.8;

      // Slow tremolo
      const trem = ctx.createOscillator();
      const tremGain = ctx.createGain();
      trem.frequency.value = 0.12 + Math.random() * 0.08;
      trem.type = 'sine';
      tremGain.gain.value = vol * 0.3;
      trem.connect(tremGain);
      tremGain.connect(gain.gain);
      trem.start(startTime);

      gain.gain.value = vol;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ambientGain);
      osc.start(startTime);
    });
  }

  function createShimmer(freq, vol, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    filter.type = 'highpass';
    filter.frequency.value = 600;

    // Very slow frequency wobble
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.03 + Math.random() * 0.04;
    lfoG.gain.value = freq * 0.004;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(startTime);

    gain.gain.value = vol;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambientGain);
    osc.start(startTime);
  }

  function createBreathing(startTime) {
    // Master volume LFO — slow 8-second breath cycle
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.065;
    lfoG.gain.value = 0.12;
    lfo.connect(lfoG);
    lfoG.connect(ambientGain.gain);
    lfo.start(startTime);
  }

  function scheduleQuantumPulse() {
    // Random interval 3.5–6.5s
    const delay = 3500 + Math.random() * 3000;
    setTimeout(() => {
      if (!muted && ctx) playQuantumBlip();
      scheduleQuantumPulse();
    }, delay);
  }

  function playQuantumBlip() {
    const now = ctx.currentTime;
    const freq = [440, 528, 639, 741, 852][Math.floor(Math.random() * 5)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.8);

    filter.type = 'bandpass';
    filter.frequency.value = freq * 2;
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambientGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  function scheduleDataStream() {
    const delay = 8000 + Math.random() * 12000;
    setTimeout(() => {
      if (!muted && ctx) playDataStream();
      scheduleDataStream();
    }, delay);
  }

  function playDataStream() {
    const now = ctx.currentTime;
    const count = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const t = now + i * (0.06 + Math.random() * 0.04);
      const freq = 1200 + Math.random() * 2400;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.015, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ambientGain);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // ── SFX LIBRARY ───────────────────────────

  // Hover — soft high ping
  function sfxHover() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Click — sharp quantum tap
  function sfxClick() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    // Body click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.16);

    // High click layer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 3200;
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc2.connect(gain2); gain2.connect(sfxGain);
    osc2.start(now); osc2.stop(now + 0.06);
  }

  // Panel open — rising holographic chime
  function sfxPanelOpen() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const t = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      filter.type = 'bandpass';
      filter.frequency.value = freq * 2;
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);
      osc.start(t);
      osc.stop(t + 0.55);
    });

    // Trailing shimmer
    const shimmer = ctx.createOscillator();
    const sg = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2093, now + 0.3);
    shimmer.frequency.linearRampToValueAtTime(3136, now + 0.8);
    sg.gain.setValueAtTime(0.04, now + 0.3);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    shimmer.connect(sg); sg.connect(sfxGain);
    shimmer.start(now + 0.3); shimmer.stop(now + 0.9);
  }

  // Panel close — descending whoosh
  function sfxPanelClose() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter); filter.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.36);
  }

  // Nav link transition — soft blip
  function sfxNav() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.16);
  }

  // Terminal send — data burst
  function sfxTerminalSend() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    // Rapid beeps
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 440 + i * 120;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain); gain.connect(sfxGain);
      osc.start(t); osc.stop(t + 0.045);
    }

    // Success chime
    const t2 = now + 0.28;
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1047;
    g2.gain.setValueAtTime(0.1, t2);
    g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.4);
    osc2.connect(g2); g2.connect(sfxGain);
    osc2.start(t2); osc2.stop(t2 + 0.42);
  }

  // Node hover — quantum buzz
  function sfxNodeHover() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const bufSize = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 800;
    filter.Q.value = 8;

    src.buffer = buf;
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    src.connect(filter); filter.connect(gain); gain.connect(sfxGain);
    src.start(now);
  }

  // ── MUTE TOGGLE ──────────────────────────
  function buildToggle() {
    const btn = document.createElement('button');
    btn.id = 'audio-toggle';
    btn.setAttribute('aria-label', 'Toggle audio');
    btn.innerHTML = `
      <svg id="audio-icon-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
      <svg id="audio-icon-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    `;
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      muted = !muted;
      document.getElementById('audio-icon-on').style.display  = muted ? 'none' : 'block';
      document.getElementById('audio-icon-off').style.display = muted ? 'block' : 'none';
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.3);
      }
    });
  }

  // ── ATTACH TO DOM ─────────────────────────
  function attachListeners() {
    // All nav links
    document.querySelectorAll('.nav-link').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
      el.addEventListener('click', sfxNav);
    });

    // All buttons
    document.querySelectorAll('button:not(#audio-toggle)').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
      el.addEventListener('click', sfxClick);
    });

    // All anchor tags
    document.querySelectorAll('a').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
    });

    // Zone labels
    document.querySelectorAll('.zone-label').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
      el.addEventListener('click', sfxPanelOpen);
    });

    // Panel close
    const closeBtn = document.getElementById('zone-panel-close');
    if (closeBtn) closeBtn.addEventListener('click', sfxPanelClose);

    // Terminal send
    const sendBtn = document.getElementById('terminal-send');
    if (sendBtn) sendBtn.addEventListener('click', sfxTerminalSend);

    // Project / glass cards hover
    document.querySelectorAll('.proj-holo, .glass-card').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
    });

    // Expose node hover for brain.js
    window.__sfxNodeHover = sfxNodeHover;
    window.__sfxClick     = sfxClick;
    window.__sfxPanelOpen = sfxPanelOpen;
  }

  // ── BOOT ─────────────────────────────────
  // Trigger init on first user interaction
  const startEvents = ['click', 'keydown', 'touchstart', 'scroll'];
  function firstInteraction() {
    initAudio();
    attachListeners();
    startEvents.forEach(e => document.removeEventListener(e, firstInteraction));
  }
  startEvents.forEach(e => document.addEventListener(e, firstInteraction, { once: true, passive: true }));

  // Expose for brain.js
  window.QuantumAudio = {
    hover:      sfxHover,
    click:      sfxClick,
    panelOpen:  sfxPanelOpen,
    panelClose: sfxPanelClose,
    nav:        sfxNav,
    terminal:   sfxTerminalSend,
    nodeHover:  sfxNodeHover,
  };

})();

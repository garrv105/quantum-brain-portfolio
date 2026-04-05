/* ══════════════════════════════════════════
   QUANTUM AUDIO ENGINE  v2 — Classy & Calm
   Soft cinematic ambient + whisper SFX
   No harsh tones, no high-freq pings
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let ambientGain = null;
  let sfxGain = null;
  let initialized = false;
  let ambientStarted = false;
  let muted = false;

  // ── Reverb impulse (short, smooth) ────────
  function makeReverb(duration, decay) {
    const len = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  // ── Init on first user gesture ─────────────
  function initAudio() {
    if (initialized) return;
    initialized = true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master — gentle fade-in over 3s
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);

      // Ambient bus (quiet)
      ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.28;
      ambientGain.connect(masterGain);

      // SFX bus (very soft)
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.22;
      sfxGain.connect(masterGain);

      startAmbient();
      buildToggle();
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  // ── AMBIENT ENGINE ────────────────────────
  // Philosophy: pure sine tones in a musical key (A minor pentatonic),
  // heavy reverb, slow LFO — like a far-away cello + synth pad.
  function startAmbient() {
    if (ambientStarted) return;
    ambientStarted = true;
    const now = ctx.currentTime;

    // Shared reverb for the ambient bus
    const rev = makeReverb(2.8, 3.5);
    const revGain = ctx.createGain();
    revGain.gain.value = 0.55;
    rev.connect(revGain);
    revGain.connect(masterGain);

    // Route ambient bus also through reverb
    ambientGain.connect(rev);

    // ── Layer 1: Root pad (A2 = 110 Hz, pure sine, very soft) ──
    spawnPad(110,  0.10, now,       rev);
    spawnPad(165,  0.07, now + 1.2, rev); // E3
    spawnPad(220,  0.05, now + 2.1, rev); // A3
    spawnPad(330,  0.04, now + 3.0, rev); // E4

    // ── Layer 2: Slow breathing LFO on master volume ──
    const breathLFO = ctx.createOscillator();
    const breathG   = ctx.createGain();
    breathLFO.type = 'sine';
    breathLFO.frequency.value = 0.045; // ~22-second cycle
    breathG.gain.value = 0.06;
    breathLFO.connect(breathG);
    breathG.connect(ambientGain.gain);
    breathLFO.start(now);

    // ── Layer 3: Subtle quantum pulse every 6–11s ──
    scheduleQuantumPulse(rev);

    // ── Layer 4: Very occasional deep resonance bloom ──
    scheduleBloom(rev);
  }

  function spawnPad(freq, vol, startTime) {
    // Two sine oscillators slightly detuned — creates gentle beating, no harshness
    [-2, 2].forEach(cents => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lpf  = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = cents;

      // Soft low-pass — removes any upper partials
      lpf.type = 'lowpass';
      lpf.frequency.value = freq * 3.2;
      lpf.Q.value = 0.5;

      // Slow tremolo — barely audible
      const trem  = ctx.createOscillator();
      const tremG = ctx.createGain();
      trem.type = 'sine';
      trem.frequency.value = 0.08 + Math.random() * 0.06;
      tremG.gain.value = vol * 0.15;
      trem.connect(tremG);
      tremG.connect(gain.gain);
      trem.start(startTime);

      gain.gain.value = vol;

      osc.connect(lpf);
      lpf.connect(gain);
      gain.connect(ambientGain);
      osc.start(startTime);
    });
  }

  function scheduleQuantumPulse(rev) {
    const delay = 6000 + Math.random() * 5000;
    setTimeout(() => {
      if (!muted && ctx) playQuantumPulse(rev);
      scheduleQuantumPulse(rev);
    }, delay);
  }

  function playQuantumPulse(rev) {
    // A single, very soft sine tone in the musical key — fades in/out slowly
    const now = ctx.currentTime;
    // Notes from A minor pentatonic: A3, C4, D4, E4, G4
    const notes = [220, 261.63, 293.66, 329.63, 392];
    const freq  = notes[Math.floor(Math.random() * notes.length)];

    const osc   = ctx.createOscillator();
    const gain  = ctx.createGain();
    const lpf   = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    lpf.type = 'lowpass';
    lpf.frequency.value = 800;
    lpf.Q.value = 0.4;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
    gain.gain.setValueAtTime(0.06, now + 1.6);
    gain.gain.linearRampToValueAtTime(0, now + 3.5);

    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(ambientGain);
    if (rev) gain.connect(rev);
    osc.start(now);
    osc.stop(now + 3.6);
  }

  function scheduleBloom(rev) {
    const delay = 14000 + Math.random() * 16000;
    setTimeout(() => {
      if (!muted && ctx) playBloom(rev);
      scheduleBloom(rev);
    }, delay);
  }

  function playBloom(rev) {
    // A gentle low chord swell — like a cello section far away
    const now   = ctx.currentTime;
    const roots = [82.41, 110, 130.81]; // E2, A2, C3
    roots.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lpf  = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      lpf.type = 'lowpass';
      lpf.frequency.value = 400;
      lpf.Q.value = 0.3;

      gain.gain.setValueAtTime(0, now + i * 0.3);
      gain.gain.linearRampToValueAtTime(0.07, now + i * 0.3 + 1.5);
      gain.gain.setValueAtTime(0.07, now + i * 0.3 + 3);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.3 + 6);

      osc.connect(lpf);
      lpf.connect(gain);
      gain.connect(ambientGain);
      if (rev) gain.connect(rev);
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 6.5);
    });
  }

  // ── SFX LIBRARY — all very soft, musical ──

  // Hover — almost inaudible breath, 400–500 Hz sine, 80ms
  function sfxHover() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf  = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.08);

    lpf.type = 'lowpass';
    lpf.frequency.value = 900;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.028, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(lpf); lpf.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.13);
  }

  // Click — soft low thud, like a muted piano key, no high freq
  function sfxClick() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf  = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    lpf.type = 'lowpass';
    lpf.frequency.value = 500;
    lpf.Q.value = 0.5;

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(lpf); lpf.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.2);
  }

  // Panel open — soft rising two-note chime (C4 → E4), sine only, reverbed
  function sfxPanelOpen() {
    if (!ctx || muted) return;
    const now  = ctx.currentTime;
    const rev  = makeReverb(1.2, 4);
    const revG = ctx.createGain();
    revG.gain.value = 0.4;
    rev.connect(revG); revG.connect(sfxGain);

    const notes = [261.63, 329.63]; // C4, E4
    notes.forEach((freq, i) => {
      const t    = now + i * 0.14;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lpf  = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      lpf.type = 'lowpass';
      lpf.frequency.value = freq * 2.5;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      osc.connect(lpf); lpf.connect(gain);
      gain.connect(sfxGain);
      gain.connect(rev);
      osc.start(t); osc.stop(t + 0.6);
    });
  }

  // Panel close — single low sine fade-out (A3), 300ms
  function sfxPanelClose() {
    if (!ctx || muted) return;
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf  = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.3);

    lpf.type = 'lowpass';
    lpf.frequency.value = 600;

    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(lpf); lpf.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.38);
  }

  // Nav — single short soft sine blip (E4), barely audible
  function sfxNav() {
    if (!ctx || muted) return;
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 329.63; // E4

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.16);
  }

  // Terminal send — three gentle ascending sine tones (A3→C4→E4)
  function sfxTerminalSend() {
    if (!ctx || muted) return;
    const now   = ctx.currentTime;
    const rev   = makeReverb(1.0, 4);
    const revG  = ctx.createGain();
    revG.gain.value = 0.35;
    rev.connect(revG); revG.connect(sfxGain);

    const notes = [220, 261.63, 329.63]; // A3, C4, E4
    notes.forEach((freq, i) => {
      const t    = now + i * 0.12;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(sfxGain);
      gain.connect(rev);
      osc.start(t); osc.stop(t + 0.5);
    });
  }

  // Node hover — ultra-soft sine breath at 300 Hz, 60ms
  function sfxNodeHover() {
    if (!ctx || muted) return;
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf  = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = 280 + Math.random() * 60; // 280–340 Hz

    lpf.type = 'lowpass';
    lpf.frequency.value = 700;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(lpf); lpf.connect(gain); gain.connect(sfxGain);
    osc.start(now); osc.stop(now + 0.1);
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
      btn.classList.toggle('muted', muted);
      document.getElementById('audio-icon-on').style.display  = muted ? 'none'  : 'block';
      document.getElementById('audio-icon-off').style.display = muted ? 'block' : 'none';
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.55, ctx.currentTime + 0.4);
      }
    });
  }

  // ── ATTACH TO DOM ─────────────────────────
  function attachListeners() {
    // Nav links
    document.querySelectorAll('.nav-link').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
      el.addEventListener('click', sfxNav);
    });

    // Buttons (not the toggle itself)
    document.querySelectorAll('button:not(#audio-toggle)').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
      el.addEventListener('click', sfxClick);
    });

    // Anchor tags
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

    // Project / glass card hover
    document.querySelectorAll('.proj-holo, .glass-card').forEach(el => {
      el.addEventListener('mouseenter', sfxHover);
    });

    // Expose for brain.js
    window.__sfxNodeHover = sfxNodeHover;
    window.__sfxClick     = sfxClick;
    window.__sfxPanelOpen = sfxPanelOpen;
  }

  // ── BOOT ─────────────────────────────────
  const startEvents = ['click', 'keydown', 'touchstart', 'scroll'];
  function firstInteraction() {
    initAudio();
    attachListeners();
    startEvents.forEach(e => document.removeEventListener(e, firstInteraction));
  }
  startEvents.forEach(e => document.addEventListener(e, firstInteraction, { once: true, passive: true }));

  // Expose public API for brain.js
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

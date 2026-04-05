/* ══════════════════════════════════════════
   QUANTUM BRAIN PORTFOLIO — Main JS
   Loader · Cursor · GSAP · Terminal · Reveals
   ══════════════════════════════════════════ */

// ── LOADER ────────────────────────────────
(function() {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loader-bar');
  const text    = document.getElementById('loader-text');
  if (!loader) return;

  const msgs = [
    'INITIALIZING QUANTUM MATRIX',
    'CALIBRATING NEURAL NODES',
    'LOADING SECURITY PROTOCOLS',
    'DECRYPTING RESEARCH DATA',
    'QUANTUM COHERENCE ACHIEVED',
    'SYSTEM READY'
  ];
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const pct = Math.min(step * 18, 100);
    if (bar) bar.style.width = pct + '%';
    if (text && step < msgs.length) {
      text.childNodes[0].nodeValue = msgs[step] + ' ';
    }
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('gone');
        setTimeout(() => { loader.style.display = 'none'; }, 900);
        document.body.style.overflow = '';
      }, 400);
    }
  }, 320);

  document.body.style.overflow = 'hidden';
})();

// ── CUSTOM CURSOR ─────────────────────────
(function() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let dx = -100, dy = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left  = dx + 'px';
    dot.style.top   = dy + 'px';
  });

  (function loop() {
    rx += (dx - rx) * 0.1;
    ry += (dy - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

// ── NAV ───────────────────────────────────
(function() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const links  = document.getElementById('nav-links');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      if (open) {
        links.style.display = 'none';
      } else {
        links.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:rgba(2,2,10,.97);padding:2rem;gap:1.5rem;z-index:400;border-bottom:1px solid rgba(0,229,255,.1)';
      }
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { links.style.display = 'none'; });
    });
  }

  // Active link on scroll
  const sections = ['hero','research','projects','about','contact'];
  window.addEventListener('scroll', () => {
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }, { passive: true });
})();

// ── SCROLL REVEAL ─────────────────────────
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => {
          e.target.classList.add('visible');
          // Animate skill bars inside
          e.target.querySelectorAll('.snode-bar div').forEach(b => {
            const w = b.style.width;
            b.style.width = '0';
            setTimeout(() => { b.style.transition = 'width 1.4s cubic-bezier(0.16,1,0.3,1)'; b.style.width = w; }, 100);
          });
        }, delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── SKILL BARS in about panel ─────────────
(function() {
  const panel = document.querySelector('.about-holo-panel');
  if (!panel) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      panel.querySelectorAll('.snode-bar div').forEach((b, i) => {
        const target = b.style.width;
        b.style.width = '0';
        setTimeout(() => {
          b.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
          b.style.width = target;
        }, 200 + i * 100);
      });
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(panel);
})();

// ── SECURITY CANVAS (matrix rain) ─────────
(function() {
  const canvas = document.getElementById('security-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || 600;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const chars = '01アイウエ∑∆ΩΨ∫∂∇⊗⊕⊞⊟≡≢≪≫';
  const colSize = 16;
  let cols = Math.floor(canvas.width / colSize);
  const drops = Array.from({ length: cols }, () => Math.random() * canvas.height / colSize);

  setInterval(() => {
    cols = Math.floor(canvas.width / colSize);
    while (drops.length < cols) drops.push(0);
    ctx.fillStyle = 'rgba(2,2,10,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${colSize - 2}px Space Mono, monospace`;

    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * colSize;
      const y = drops[i] * colSize;

      // Color variation
      const r = Math.random();
      if (r > 0.98) ctx.fillStyle = '#ffffff';
      else if (r > 0.7) ctx.fillStyle = 'rgba(0,229,255,0.4)';
      else ctx.fillStyle = 'rgba(124,58,237,0.25)';

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      else drops[i] += 0.4;
    }
  }, 40);
})();

// ── TERMINAL CONTACT ─────────────────────
(function() {
  const sendBtn = document.getElementById('terminal-send');
  const nameInput = document.getElementById('terminal-name');
  const msgInput  = document.getElementById('terminal-msg');
  const response  = document.getElementById('terminal-response');
  const body      = document.getElementById('terminal-body');
  if (!sendBtn) return;

  function addLine(prompt, text, cls = '') {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = `<span class="t-prompt">${prompt}</span> <span class="t-out ${cls}">${text}</span>`;
    if (body) body.appendChild(line);
    body?.scrollTo(0, body.scrollHeight);
  }

  function handleSend() {
    const name = nameInput?.value.trim() || 'anonymous';
    const msg  = msgInput?.value.trim();
    if (!msg) {
      addLine('system@quantum ~$', 'ERROR: message cannot be empty.', 'muted');
      return;
    }

    addLine('visitor@quantum ~$', `initiate_contact --name="${name}" --message="${msg}"`);

    setTimeout(() => addLine('system@quantum ~$', '> Encrypting message with post-quantum cipher...', 'muted'), 300);
    setTimeout(() => addLine('system@quantum ~$', '> Routing through secure channel...', 'muted'), 900);
    setTimeout(() => {
      addLine('system@quantum ~$', '✓ MESSAGE DELIVERED TO garrvsipani@gmail.com', 'cyan');
      if (response) {
        response.textContent = `> Message from "${name}" received. Garrv will respond shortly.`;
        response.classList.remove('hidden');
      }
      if (nameInput) nameInput.value = '';
      if (msgInput) msgInput.value = '';
    }, 1800);
  }

  sendBtn.addEventListener('click', handleSend);
  msgInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') msgInput?.focus(); });
})();

// ── GSAP SCROLL LAYERS (if GSAP loaded) ───
(function() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Layer section titles
  document.querySelectorAll('.section-title').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      }
    );
  });

  // Layer label animations
  document.querySelectorAll('.layer-label').forEach(el => {
    gsap.fromTo(el,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      }
    );
  });

  // Parallax on hero canvas
  gsap.to('#brain-canvas', {
    y: -80,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
})();

// ── GLITCH EFFECT ────────────────────────
(function() {
  const glitch = document.querySelector('.glitch');
  if (!glitch) return;
  const chars = '01アイウエ∑∆ΩΨ∫∂◼◻▪▫';
  const original = glitch.dataset.text;

  function runGlitch() {
    let iter = 0;
    const iv = setInterval(() => {
      glitch.textContent = original.split('').map((c, i) => {
        if (i < iter) return original[i];
        if (c === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= original.length) { clearInterval(iv); glitch.textContent = original; }
      iter += 0.5;
    }, 45);
  }

  setTimeout(runGlitch, 1500);
  setInterval(runGlitch, 7000);
})();

/* ══════════════════════════════════════════
   QUANTUM BRAIN — Three.js Neural Network
   ══════════════════════════════════════════ */

(function() {
  'use strict';

  if (typeof THREE === 'undefined') { console.warn('Three.js not loaded'); return; }

  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;

  // ── Scene Setup ──────────────────────────
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  camera.position.set(0, 0, 120);

  // ── Data ─────────────────────────────────
  const ZONES = {
    ai:     { color: 0x00e5ff, center: new THREE.Vector3(-25,  10,  0), label: 'AI Systems',     count: 22 },
    quantum:{ color: 0x7c3aed, center: new THREE.Vector3( 20, -5,  10), label: 'Quantum',         count: 20 },
    cyber:  { color: 0x00ff88, center: new THREE.Vector3(  0,  25, -5), label: 'Cybersecurity',   count: 18 },
    core:   { color: 0xff2d87, center: new THREE.Vector3(  0,   0,  0), label: 'Core',            count: 8  },
  };

  const ZONE_DETAILS = {
    ai: {
      title: 'AI Systems',
      desc: 'Deep learning research focused on adversarial robustness, ensemble methods, and neural architectures for security-critical applications.',
      items: ['LSTM + Attention', 'CNN Ensembles', 'Isolation Forest', 'Federated Learning', 'Adversarial ML', 'Transfer Learning', 'PyTorch / TensorFlow']
    },
    quantum: {
      title: 'Quantum Computing',
      desc: 'Quantum algorithm research using Cirq and Qiskit — building quantum-classical hybrid systems for next-generation security.',
      items: ['Qiskit / Cirq', 'Quantum Bayesian Inference', 'Variational Algorithms', 'Quantum Circuits', 'Superposition & Entanglement', 'Post-Quantum Cryptography', 'Quantum Error Correction']
    },
    cyber: {
      title: 'Cybersecurity',
      desc: 'End-to-end security expertise from penetration testing to enterprise defense platform architecture.',
      items: ['Penetration Testing', 'Intrusion Detection', 'Threat Modeling', 'Incident Response', 'SIEM / IDS', 'Palo Alto Networks', 'Metasploit / Burp Suite']
    },
    core: {
      title: 'Core Research',
      desc: 'Published IEEE researcher and Johns Hopkins MS Cybersecurity candidate with 4+ years building quantum-enhanced security solutions.',
      items: ['IEEE Published 2026', 'arXiv:2507.00403', 'JHU Teaching Assistant', 'Quaranta.io Founder', 'CISSP Certified', 'Oracle Cloud AI', '4+ Years Research']
    }
  };

  // ── Node system ───────────────────────────
  const nodes = [];
  const connections = [];

  // Node geometry + material pool
  const nodeGeos   = { sm: new THREE.SphereGeometry(0.9, 8, 8), md: new THREE.SphereGeometry(1.6, 12, 12), lg: new THREE.SphereGeometry(2.8, 16, 16) };
  const nodeMats   = {};
  Object.entries(ZONES).forEach(([key, z]) => {
    nodeMats[key] = new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.85 });
  });

  const glowGeos = { sm: new THREE.SphereGeometry(1.8, 8, 8), md: new THREE.SphereGeometry(3.2, 8, 8), lg: new THREE.SphereGeometry(5.5, 8, 8) };
  const glowMats = {};
  Object.entries(ZONES).forEach(([key, z]) => {
    glowMats[key] = new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.06, side: THREE.BackSide });
  });

  function createNode(zone, zoneKey, isCore = false) {
    const size = isCore ? 'lg' : (Math.random() > 0.75 ? 'md' : 'sm');
    const mesh = new THREE.Mesh(nodeGeos[size], nodeMats[zoneKey].clone());
    const glow = new THREE.Mesh(glowGeos[size], glowMats[zoneKey].clone());

    const spread = isCore ? 8 : 28;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI;
    const r     = isCore ? (Math.random() * 6 + 3) : (Math.random() * spread + 4);

    mesh.position.set(
      zone.center.x + r * Math.sin(phi) * Math.cos(theta),
      zone.center.y + r * Math.sin(phi) * Math.sin(theta),
      zone.center.z + r * Math.cos(phi)
    );
    glow.position.copy(mesh.position);

    scene.add(mesh);
    scene.add(glow);

    return {
      mesh, glow,
      zoneKey,
      color: zone.color,
      baseOpacity: mesh.material.opacity,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed:  0.6 + Math.random() * 1.2,
      originalPos: mesh.position.clone(),
      isCore,
      size
    };
  }

  // Build nodes
  Object.entries(ZONES).forEach(([key, zone]) => {
    for (let i = 0; i < zone.count; i++) {
      nodes.push(createNode(zone, key, key === 'core' && i < 3));
    }
  });

  window.__quantumNodes = nodes.length;
  const hudNodes = document.getElementById('hud-nodes');
  const hudQubits = document.getElementById('hud-qubits');
  if (hudNodes) hudNodes.textContent = nodes.length;
  if (hudQubits) hudQubits.textContent = Math.floor(nodes.length * 0.6);

  // ── Connections ───────────────────────────
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.12, vertexColors: false });
  const purpleLineMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.1 });
  const greenLineMat  = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.08 });

  function getLineMat(zoneKey) {
    if (zoneKey === 'quantum' || zoneKey === 'core') return purpleLineMat.clone();
    if (zoneKey === 'cyber') return greenLineMat.clone();
    return lineMat.clone();
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
      const sameZone = nodes[i].zoneKey === nodes[j].zoneKey;
      const maxDist = sameZone ? 30 : 18;
      if (dist < maxDist && Math.random() > 0.5) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodes[i].mesh.position, nodes[j].mesh.position
        ]);
        const mat = getLineMat(nodes[i].zoneKey);
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        connections.push({ line, nodeA: nodes[i], nodeB: nodes[j], baseOpacity: mat.opacity, pulseOffset: Math.random() * Math.PI * 2 });
      }
    }
  }

  // ── Flowing energy particles ──────────────
  const flowParticles = [];
  const flowGeo = new THREE.SphereGeometry(0.35, 6, 6);

  connections.slice(0, 60).forEach(conn => {
    if (Math.random() > 0.5) return;
    const mat = new THREE.MeshBasicMaterial({ color: conn.nodeA.color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(flowGeo, mat);
    scene.add(mesh);
    flowParticles.push({ mesh, conn, t: Math.random(), speed: 0.003 + Math.random() * 0.008, dir: Math.random() > 0.5 ? 1 : -1 });
  });

  // ── Background star field ─────────────────
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000 * 3; i++) starPositions[i] = (Math.random() - 0.5) * 600;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.3 });
  scene.add(new THREE.Points(starGeo, starMat));

  // ── Orbiting qubit rings ──────────────────
  const qubits = [];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(35 + i * 12, 0.15, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e5ff : 0x7c3aed, transparent: true, opacity: 0.08 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3 * (i + 0.5);
    ring.rotation.y = Math.PI / 4 * i;
    scene.add(ring);
    qubits.push({ ring, speedX: 0.001 + i * 0.0005, speedY: 0.0008 + i * 0.0004 });

    // Small dot on orbit
    const dotGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e5ff : 0x7c3aed, transparent: true, opacity: 0.9 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    const angle = Math.random() * Math.PI * 2;
    const r = 35 + i * 12;
    dot.position.set(r * Math.cos(angle), r * Math.sin(angle), 0);
    ring.add(dot);
  }

  // ── Raycaster for interaction ─────────────
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 2 };
  const mouse = new THREE.Vector2(-999, -999);
  let hoveredNode = null;

  const meshToNode = new Map();
  nodes.forEach(n => meshToNode.set(n.mesh, n));

  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Zone label click
  document.querySelectorAll('.zone-label').forEach(el => {
    el.addEventListener('click', () => {
      const zone = el.dataset.zone;
      openZonePanel(zone);
    });
  });

  // Click on canvas
  canvas.addEventListener('click', () => {
    if (hoveredNode) {
      openZonePanel(hoveredNode.zoneKey);
    }
  });

  function openZonePanel(zone) {
    const panel = document.getElementById('zone-panel');
    const content = document.getElementById('zone-panel-content');
    const data = ZONE_DETAILS[zone] || ZONE_DETAILS['core'];
    if (!panel || !content) return;

    const colorMap = { ai: '#00e5ff', quantum: '#7c3aed', cyber: '#00ff88', core: '#ff2d87' };
    const col = colorMap[zone] || '#00e5ff';

    content.innerHTML = `
      <h2 style="color:${col};margin-bottom:.5rem">${data.title}</h2>
      <p style="color:#8888aa;font-size:0.85rem;margin-bottom:1rem">${data.desc}</p>
      <ul>${data.items.map(i => `<li>${i}</li>`).join('')}</ul>
    `;
    panel.classList.remove('hidden');
    window.QuantumAudio?.panelOpen();
  }

  document.getElementById('zone-panel-close')?.addEventListener('click', () => {
    document.getElementById('zone-panel')?.classList.add('hidden');
    window.QuantumAudio?.panelClose();
  });

  // ── Camera drift ──────────────────────────
  let targetCamX = 0, targetCamY = 0, camX = 0, camY = 0;
  document.addEventListener('mousemove', (e) => {
    targetCamX = (e.clientX / window.innerWidth - 0.5) * 12;
    targetCamY = -(e.clientY / window.innerHeight - 0.5) * 8;
  });

  // ── Resize ───────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ──────────────────────────────
  let frame = 0;
  const meshList = nodes.map(n => n.mesh);

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.01;

    // Smooth camera drift
    camX += (targetCamX - camX) * 0.04;
    camY += (targetCamY - camY) * 0.04;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(scene.position);

    // Pulse nodes
    nodes.forEach((n, i) => {
      const pulse = 0.6 + 0.4 * Math.sin(t * n.pulseSpeed + n.pulseOffset);
      n.mesh.material.opacity = pulse * n.baseOpacity;
      n.glow.material.opacity = pulse * 0.08;

      // Subtle floating
      n.mesh.position.y = n.originalPos.y + Math.sin(t * 0.4 + i * 0.3) * 0.8;
      n.glow.position.copy(n.mesh.position);
    });

    // Pulse connections
    connections.forEach(c => {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 + c.pulseOffset));
      c.line.material.opacity = pulse * c.baseOpacity;
    });

    // Flow particles along connections
    flowParticles.forEach(fp => {
      fp.t += fp.speed * fp.dir;
      if (fp.t > 1 || fp.t < 0) fp.dir *= -1;
      const a = fp.conn.nodeA.mesh.position;
      const b = fp.conn.nodeB.mesh.position;
      fp.mesh.position.lerpVectors(a, b, fp.t);
      fp.mesh.material.opacity = 0.7 * Math.sin(fp.t * Math.PI);
    });

    // Rotate qubits
    qubits.forEach(q => {
      q.ring.rotation.z += q.speedX;
      q.ring.rotation.x += q.speedY * 0.5;
    });

    // Raycasting for hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshList);

    if (intersects.length > 0) {
      const hit = meshToNode.get(intersects[0].object);
      if (hit && hit !== hoveredNode) {
        if (hoveredNode) {
          hoveredNode.mesh.material.color.setHex(hoveredNode.color);
          hoveredNode.mesh.scale.setScalar(1);
        }
        hoveredNode = hit;
        hoveredNode.mesh.material.color.setHex(0xffffff);
        hoveredNode.mesh.scale.setScalar(2.2);
        canvas.style.cursor = 'pointer';
        window.QuantumAudio?.nodeHover();
      }
    } else {
      if (hoveredNode) {
        hoveredNode.mesh.material.color.setHex(hoveredNode.color);
        hoveredNode.mesh.scale.setScalar(1);
        hoveredNode = null;
        canvas.style.cursor = 'none';
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // Expose for external use
  window.__brainScene = scene;
  window.__brainCamera = camera;

})();

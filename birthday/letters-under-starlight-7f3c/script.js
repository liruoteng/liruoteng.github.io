(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PASSCODE = '0611';
  var ACCESS_KEY = 'birthday-surprise-access';

  var passcodeGate = document.getElementById('passcode-gate');
  var passcodeForm = document.getElementById('passcode-form');
  var passcodeInput = document.getElementById('passcode-input');
  var passcodeFeedback = document.getElementById('passcode-feedback');

  function closePasscodeGate() {
    try {
      sessionStorage.setItem(ACCESS_KEY, 'granted');
    } catch (error) {
      // Access still lasts for the current page even if session storage is unavailable.
    }
    passcodeGate.classList.add('is-closing');
    setTimeout(function () {
      passcodeGate.classList.add('hidden');
    }, reduceMotion ? 0 : 400);
  }

  var alreadyGranted = false;
  try {
    alreadyGranted = sessionStorage.getItem(ACCESS_KEY) === 'granted';
  } catch (error) {
    alreadyGranted = false;
  }

  if (alreadyGranted) {
    passcodeGate.classList.add('hidden');
  } else {
    passcodeInput.focus();
  }

  passcodeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (passcodeInput.value === PASSCODE) {
      passcodeFeedback.textContent = '';
      closePasscodeGate();
      return;
    }
    passcodeFeedback.textContent = 'That did not open it. Please try again.';
    passcodeInput.value = '';
    passcodeInput.focus();
  });

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function scrollToEnvelope() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  scrollToEnvelope();
  window.addEventListener('load', scrollToEnvelope);
  window.addEventListener('pageshow', scrollToEnvelope);
  window.addEventListener('beforeunload', scrollToEnvelope);

  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLORS = [
    '#d4a853', '#f0d68a', '#e8a0b4', '#f5c6d0',
    '#ff8a80', '#ffab91', '#ffe082', '#a5d6a7',
    '#80cbc4', '#90caf9', '#ce93d8', '#f48fb1'
  ];

  function createParticle(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.random() * 8 + 4;
    const speedX = (Math.random() - 0.5) * 12;
    const speedY = Math.random() * -14 - 4;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 10;
    const shape = Math.random() > 0.5 ? 'rect' : 'circle';
    const gravity = 0.15;
    const drag = 0.98;
    const opacity = 1;

    return {
      x: x || Math.random() * canvas.width,
      y: y || canvas.height * 0.4,
      size,
      speedX,
      speedY,
      color,
      rotation,
      rotationSpeed,
      shape,
      gravity,
      drag,
      opacity,
      life: 1
    };
  }

  function launchConfetti(originX, originY, count) {
    count = count || 150;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(
        originX !== undefined ? originX : canvas.width / 2,
        originY !== undefined ? originY : canvas.height * 0.3
      ));
    }
    if (!animationId) {
      animateConfetti();
    }
  }

  function launchFullConfetti() {
    for (let i = 0; i < 80; i++) {
      particles.push(createParticle(
        Math.random() * canvas.width,
        -20
      ));
    }
    if (!animationId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.speedY += p.gravity;
      p.speedX *= p.drag;
      p.speedY *= p.drag;
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.life -= 0.003;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animateConfetti);
    } else {
      animationId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  const intro = document.getElementById('intro');
  const hero = document.getElementById('birthday-hero');
  const gameSection = document.getElementById('game-section');
  const timeline = document.getElementById('timeline');
  const wishes = document.getElementById('wishes');
  const memoriesTitle = document.getElementById('memories-title');
  const memoriesButton = document.getElementById('memories-btn');
  const openBtn = document.getElementById('open-btn');
  const envelope = document.querySelector('.envelope');

  function openEnvelope() {
    envelope.classList.add('opened');
    openBtn.style.opacity = '0';
    openBtn.style.pointerEvents = 'none';

    setTimeout(function () {
      launchConfetti(canvas.width / 2, canvas.height / 2, 200);

      intro.style.transition = 'opacity 0.8s ease';
      intro.style.opacity = '0';
      intro.style.pointerEvents = 'none';

      setTimeout(function () {
        intro.classList.add('hidden');
        window.scrollTo(0, 0);
        hero.classList.remove('hidden');
        gameSection.classList.remove('hidden');

        setTimeout(function () {
          launchFullConfetti();
        }, 600);
      }, 800);
    }, 800);
  }

  openBtn.addEventListener('click', openEnvelope);
  envelope.addEventListener('click', openEnvelope);

  const gameCanvas = document.getElementById('game-canvas');
  const gameCtx = gameCanvas.getContext('2d');
  const startBtn = document.getElementById('start-game-btn');
  const startOverlay = document.getElementById('game-start-overlay');
  const winOverlay = document.getElementById('game-win-overlay');
  const scoreValue = document.getElementById('score-value');
  const progressBar = document.getElementById('progress-bar');
  const timelineLock = document.getElementById('timeline-lock');
  const TARGET_SCORE = 10;
  let score = 0;
  let gameActive = false;
  let gameLoopId = null;

  const GAME_W = 1280;
  const GAME_H = 720;
  const GROUND_Y = 560;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -16;
  const MOVE_SPEED = 5;
  const WORLD_WIDTH = 6400;

  let cameraX = 0;
  let keys = {};

  const player = {
    x: 100,
    y: GROUND_Y - 64,
    w: 32,
    h: 64,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 1,
    frame: 0,
    frameTimer: 0
  };

  let hearts = [];
  let obstacles = [];
  let clouds = [];
  let mountains = [];
  let enemies = [];
  let geysers = [];
  let seattleBuildings = [];
  let boss = null;
  let goldenKey = null;
  let bullets = [];
  let bossBullets = [];
  let shootCooldown = 0;

  function initWorld() {
    hearts = [];
    obstacles = [];
    clouds = [];
    mountains = [];
    enemies = [];
    geysers = [];
    seattleBuildings = [];
    boss = null;
    goldenKey = null;
    bullets = [];
    bossBullets = [];
    shootCooldown = 0;

    for (let i = 0; i < TARGET_SCORE; i++) {
      hearts.push({
        x: 400 + i * 560 + Math.random() * 200,
        y: GROUND_Y - 80 - Math.random() * 100,
        w: 32,
        h: 32,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 12; i++) {
      const typeRand = Math.random();
      const obstacleType = typeRand > 0.66 ? 'barrel' : typeRand > 0.33 ? 'crate' : 'scarecrow';
      const obstacleHeight = obstacleType === 'scarecrow' ? 56 : 42;
      obstacles.push({
        x: 600 + i * 500 + Math.random() * 200,
        y: GROUND_Y - obstacleHeight,
        w: obstacleType === 'scarecrow' ? 42 : 48,
        h: obstacleHeight,
        type: obstacleType
      });
    }

    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * WORLD_WIDTH,
        y: 60 + Math.random() * 120,
        w: 80 + Math.random() * 80,
        h: 40 + Math.random() * 20,
        seed: i * 17 + Math.random() * 100
      });
    }

    for (let i = 0; i < 6; i++) {
      mountains.push({
        x: i * 1200 + Math.random() * 400,
        y: GROUND_Y - 260 - Math.random() * 110,
        w: 360 + Math.random() * 220,
        h: 250 + Math.random() * 130
      });
    }

    for (let i = 0; i < 8; i++) {
      let duckX = 800 + i * 700 + Math.random() * 200;
      for (let attempt = 0; attempt < 5; attempt++) {
        const duckRect = {
          x: duckX + 4,
          y: GROUND_Y - 32,
          w: 32,
          h: 32
        };
        if (!wouldHitObstacle(duckRect)) break;
        duckX += 80;
      }
      enemies.push({
        type: 'duck',
        x: duckX,
        y: GROUND_Y - 40,
        w: 40,
        h: 40,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.85 + Math.random() * 0.35),
        patrolStart: 800 + i * 700 - 100,
        patrolEnd: 800 + i * 700 + 300,
        frame: 0
      });
    }

    for (let i = 0; i < 5; i++) {
      const baseX = 1100 + i * 950 + Math.random() * 180;
      const swoopingBird = i % 2 === 1;
      const baseY = GROUND_Y - 190 - Math.random() * 80 + (swoopingBird ? 26 + Math.random() * 18 : 0);
      enemies.push({
        type: 'bird',
        x: baseX,
        y: baseY,
        baseY,
        w: 36,
        h: 28,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1.05 + Math.random() * 0.35),
        patrolStart: baseX - 180,
        patrolEnd: baseX + 220,
        frame: 0,
        bobOffset: Math.random() * Math.PI * 2,
        bobAmplitude: swoopingBird ? 30 + Math.random() * 12 : 14 + Math.random() * 8,
        bobSpeed: swoopingBird ? 0.05 + Math.random() * 0.015 : 0.035 + Math.random() * 0.012
      });
    }

    for (let i = 0; i < 5; i++) {
      geysers.push({
        x: 1000 + i * 1200 + Math.random() * 400,
        y: GROUND_Y,
        w: 48,
        h: 60,
        steamFrame: 0
      });
    }

    const skylineBaseY = GROUND_Y - 8;
    [
      { x: 210, w: 94, h: 220, type: 'stripedTower' },
      { x: 318, w: 66, h: 112, type: 'lowGlass' },
      { x: 394, w: 78, h: 136, type: 'goldBlock' },
      { x: 492, w: 88, h: 166, type: 'crowned' },
      { x: 606, w: 86, h: 196, type: 'glassTop' },
      { x: 835, w: 112, h: 370, type: 'spaceNeedle' },
      { x: 970, w: 82, h: 300, type: 'darkTower' },
      { x: 1070, w: 86, h: 178, type: 'brickTower' },
      { x: 1165, w: 94, h: 166, type: 'slantRoof' },
      { x: 1268, w: 94, h: 228, type: 'crowned' },
      { x: 1332, w: 78, h: 192, type: 'whiteTower' },
      { x: 1425, w: 74, h: 156, type: 'goldBlock' },
      { x: 1515, w: 78, h: 176, type: 'glassTop' },
      { x: 1628, w: 96, h: 126, type: 'lowGlass' },
      { x: 1762, w: 84, h: 142, type: 'steppedTower' },
      { x: 1850, w: 94, h: 118, type: 'lowGlass' }
    ].forEach(function (b) {
      seattleBuildings.push({
        x: b.x,
        y: skylineBaseY - b.h,
        baseY: skylineBaseY,
        w: b.w,
        h: b.h,
        type: b.type
      });
    });

    boss = null;
    goldenKey = null;
  }

  function drawPixelRect(x, y, w, h, color) {
    gameCtx.fillStyle = color;
    gameCtx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  function drawCloud(x, y, w, h, opacity, seed) {
    const baseY = y + h * 0.52;
    const lobes = [
      { x: 0.02, y: 0.48, w: 0.28, h: 0.32 },
      { x: 0.18, y: 0.26, w: 0.34, h: 0.42 },
      { x: 0.42, y: 0.12, w: 0.32, h: 0.54 },
      { x: 0.66, y: 0.32, w: 0.30, h: 0.36 }
    ];

    drawPixelRect(x + w * 0.08, baseY, w * 0.82, h * 0.24, `rgba(205,220,232,${opacity * 0.36})`);
    drawPixelRect(x + w * 0.14, baseY + h * 0.16, w * 0.66, h * 0.12, `rgba(118,145,166,${opacity * 0.18})`);

    lobes.forEach(function (l, i) {
      const jitterX = (randAt(seed, i, 1) - 0.5) * w * 0.05;
      const jitterY = (randAt(seed, i, 2) - 0.5) * h * 0.08;
      const lx = x + w * l.x + jitterX;
      const ly = y + h * l.y + jitterY;
      const lw = w * l.w;
      const lh = h * l.h;
      drawPixelRect(lx + lw * 0.08, ly + lh * 0.24, lw * 0.84, lh * 0.64, `rgba(238,246,252,${opacity * 0.76})`);
      drawPixelRect(lx + lw * 0.16, ly + lh * 0.12, lw * 0.68, lh * 0.34, `rgba(255,255,255,${opacity * 0.9})`);
      drawPixelRect(lx + lw * 0.28, ly, lw * 0.44, lh * 0.22, `rgba(255,255,255,${opacity * 0.72})`);
      drawPixelRect(lx + lw * 0.1, ly + lh * 0.72, lw * 0.78, lh * 0.16, `rgba(178,201,218,${opacity * 0.26})`);
    });

    drawPixelRect(x + w * 0.12, baseY + h * 0.04, w * 0.78, h * 0.16, `rgba(246,251,255,${opacity * 0.72})`);
    drawPixelRect(x + w * 0.22, y + h * 0.25, w * 0.18, h * 0.08, `rgba(255,255,255,${opacity * 0.85})`);
    drawPixelRect(x + w * 0.52, y + h * 0.18, w * 0.16, h * 0.08, `rgba(255,255,255,${opacity * 0.78})`);

    for (let i = 0; i < 4; i++) {
      const puffX = x + w * (0.06 + i * 0.24) + randAt(seed, i, 3) * w * 0.08;
      const puffY = baseY + h * (0.12 + randAt(seed, i, 4) * 0.14);
      drawPixelRect(puffX, puffY, w * (0.08 + randAt(seed, i, 5) * 0.08), h * 0.06, `rgba(214,229,239,${opacity * 0.34})`);
    }
  }

  function randAt(a, b, c) {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
      a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function wouldHitObstacle(rect) {
    return obstacles.some(function (o) {
      return rectsOverlap(rect, o);
    });
  }

  function drawPlayer() {
    const px = Math.floor(player.x - cameraX);
    const py = Math.floor(player.y);
    const f = player.facing;

    drawPixelRect(px + 6, py + 4, 20, 18, '#6b3a1f');
    drawPixelRect(px + 6, py + 6, 20, 14, '#8b5e3c');
    drawPixelRect(px + 10, py + 2, 12, 6, '#8b5e3c');
    if (f > 0) {
      drawPixelRect(px + 2, py + 8, 6, 18, '#6b3a1f');
      drawPixelRect(px + 4, py + 10, 4, 14, '#8b5e3c');
      drawPixelRect(px + 6, py + 12, 2, 10, '#a0704e');
    } else {
      drawPixelRect(px + 24, py + 8, 6, 18, '#6b3a1f');
      drawPixelRect(px + 24, py + 10, 4, 14, '#8b5e3c');
      drawPixelRect(px + 24, py + 12, 2, 10, '#a0704e');
    }

    drawPixelRect(px + 8, py + 8, 16, 16, '#fce4d6');
    drawPixelRect(px + 10, py + 10, 12, 12, '#ffe8dc');

    drawPixelRect(px + 8, py + 6, 16, 4, '#8b5e3c');
    drawPixelRect(px + 10, py + 4, 12, 4, '#a0704e');
    drawPixelRect(px + 12, py + 2, 8, 4, '#c9956b');
    drawPixelRect(px + 10, py + 8, 2, 2, '#a0704e');
    drawPixelRect(px + 20, py + 8, 2, 2, '#a0704e');

    if (f > 0) {
      drawPixelRect(px + 16, py + 10, 2, 2, '#2c3e50');
      drawPixelRect(px + 20, py + 10, 2, 2, '#2c3e50');
      drawPixelRect(px + 17, py + 11, 1, 1, '#fff');
      drawPixelRect(px + 21, py + 11, 1, 1, '#fff');
      drawPixelRect(px + 18, py + 14, 4, 2, '#e88');
      drawPixelRect(px + 19, py + 16, 2, 1, '#e74c6f');
    } else {
      drawPixelRect(px + 10, py + 10, 2, 2, '#2c3e50');
      drawPixelRect(px + 14, py + 10, 2, 2, '#2c3e50');
      drawPixelRect(px + 11, py + 11, 1, 1, '#fff');
      drawPixelRect(px + 15, py + 11, 1, 1, '#fff');
      drawPixelRect(px + 10, py + 14, 4, 2, '#e88');
      drawPixelRect(px + 11, py + 16, 2, 1, '#e74c6f');
    }

    drawPixelRect(px + 10, py + 24, 12, 20, '#5dade2');
    drawPixelRect(px + 8, py + 28, 16, 12, '#5dade2');
    drawPixelRect(px + 6, py + 40, 20, 4, '#5dade2');
    drawPixelRect(px + 12, py + 22, 8, 4, '#2e86c1');
    drawPixelRect(px + 14, py + 24, 4, 2, '#2e86c1');
    drawPixelRect(px + 10, py + 30, 4, 4, '#2e86c1');
    drawPixelRect(px + 18, py + 30, 4, 4, '#2e86c1');
    drawPixelRect(px + 8, py + 36, 4, 6, '#2e86c1');
    drawPixelRect(px + 20, py + 36, 4, 6, '#2e86c1');

    if (Math.abs(player.vx) > 0.5) {
      if (f > 0) {
        drawPixelRect(px + 22, py + 26, 6, 10, '#fce4d6');
        drawPixelRect(px + 24, py + 28, 4, 6, '#ffe8dc');
      } else {
        drawPixelRect(px + 4, py + 26, 6, 10, '#fce4d6');
        drawPixelRect(px + 4, py + 28, 4, 6, '#ffe8dc');
      }
    }

    if (!player.grounded) {
      drawPixelRect(px + 6, py + 26, 6, 10, '#fce4d6');
      drawPixelRect(px + 20, py + 26, 6, 10, '#fce4d6');
      drawPixelRect(px + 10, py + 44, 4, 10, '#fce4d6');
      drawPixelRect(px + 18, py + 44, 4, 10, '#fce4d6');
      drawPixelRect(px + 8, py + 52, 8, 4, '#e74c6f');
      drawPixelRect(px + 16, py + 52, 8, 4, '#e74c6f');
    } else if (Math.abs(player.vx) > 0.5) {
      const legOffset = Math.sin(player.frame * 0.3) * 2;
      drawPixelRect(px + 12, py + 44, 4, 10 + legOffset, '#fce4d6');
      drawPixelRect(px + 16, py + 44, 4, 10 - legOffset, '#fce4d6');
      drawPixelRect(px + 10, py + 52 + legOffset, 8, 4, '#e74c6f');
      drawPixelRect(px + 14, py + 52 - legOffset, 8, 4, '#e74c6f');
    } else {
      drawPixelRect(px + 12, py + 44, 4, 10, '#fce4d6');
      drawPixelRect(px + 16, py + 44, 4, 10, '#fce4d6');
      drawPixelRect(px + 10, py + 52, 8, 4, '#e74c6f');
      drawPixelRect(px + 14, py + 52, 8, 4, '#e74c6f');
    }
  }

  function drawHeart(h) {
    if (h.collected) return;
    const hx = Math.floor(h.x - cameraX);
    const hy = Math.floor(h.y + Math.sin(Date.now() * 0.003 + h.bobOffset) * 6);

    drawPixelRect(hx + 10, hy + 2, 12, 6, '#e74c6f');
    drawPixelRect(hx + 6, hy + 6, 20, 6, '#e74c6f');
    drawPixelRect(hx + 2, hy + 10, 28, 6, '#e74c6f');
    drawPixelRect(hx + 6, hy + 16, 20, 6, '#e74c6f');
    drawPixelRect(hx + 10, hy + 22, 12, 4, '#e74c6f');
    drawPixelRect(hx + 14, hy + 26, 4, 2, '#e74c6f');

    drawPixelRect(hx + 10, hy + 6, 4, 4, '#ff8fa3');
    drawPixelRect(hx + 12, hy + 8, 2, 2, '#fff');
  }

  function drawObstacle(o) {
    const ox = Math.floor(o.x - cameraX);
    const oy = Math.floor(o.y);

    drawPixelRect(ox - 3, oy + o.h - 6, o.w + 6, 8, 'rgba(54,35,21,0.28)');

    if (o.type === 'crate') {
      drawPixelRect(ox + 1, oy + 1, o.w - 2, o.h - 1, '#4f2b1c');
      drawPixelRect(ox + 5, oy + 5, o.w - 10, o.h - 9, '#c4752d');
      drawPixelRect(ox + 8, oy + 8, o.w - 16, o.h - 15, '#e09a43');
      drawPixelRect(ox + 5, oy + 18, o.w - 10, 6, '#8b4b27');
      drawPixelRect(ox + 18, oy + 5, 6, o.h - 9, '#8b4b27');
      drawPixelRect(ox + 8, oy + 8, 8, 5, '#ffd37a');
      drawPixelRect(ox + o.w - 14, oy + o.h - 12, 7, 4, '#7a3e22');
    } else if (o.type === 'barrel') {
      drawPixelRect(ox + 9, oy + 2, 30, 6, '#4f2b1c');
      drawPixelRect(ox + 5, oy + 8, 38, 28, '#4f2b1c');
      drawPixelRect(ox + 9, oy + 6, 30, 34, '#a65f2b');
      drawPixelRect(ox + 13, oy + 8, 22, 30, '#d58a3b');
      drawPixelRect(ox + 8, oy + 14, 32, 5, '#59311f');
      drawPixelRect(ox + 8, oy + 27, 32, 5, '#59311f');
      drawPixelRect(ox + 15, oy + 9, 5, 28, '#f1b45a');
      drawPixelRect(ox + 28, oy + 10, 4, 26, '#8b4b27');
    } else {
      drawPixelRect(ox + 18, oy + 6, 6, 48, '#6b3f24');
      drawPixelRect(ox + 5, oy + 18, 32, 6, '#6b3f24');
      drawPixelRect(ox + 9, oy + 4, 24, 16, '#f0c85b');
      drawPixelRect(ox + 6, oy + 10, 30, 8, '#f6d86d');
      drawPixelRect(ox + 13, oy + 20, 18, 22, '#3f8f47');
      drawPixelRect(ox + 10, oy + 26, 24, 6, '#55ad5b');
      drawPixelRect(ox + 14, oy + 10, 3, 3, '#3f2418');
      drawPixelRect(ox + 25, oy + 10, 3, 3, '#3f2418');
      drawPixelRect(ox + 17, oy + 15, 8, 2, '#8b4b27');
      drawPixelRect(ox + 11, oy + 42, 8, 12, '#4f2b1c');
      drawPixelRect(ox + 24, oy + 42, 8, 12, '#4f2b1c');
    }
  }

  function drawEnemy(e) {
    if (e.type === 'bird') {
      drawBird(e);
      return;
    }

    const ex = Math.floor(e.x - cameraX);
    const ey = Math.floor(e.y);
    const f = e.vx > 0 ? 1 : -1;

    drawPixelRect(ex + 10, ey + 14, 20, 22, '#ffffff');
    drawPixelRect(ex + 12, ey + 12, 16, 26, '#ffffff');
    drawPixelRect(ex + 14, ey + 10, 12, 30, '#ffffff');
    drawPixelRect(ex + 12, ey + 16, 16, 18, '#f8f8f8');

    if (f > 0) {
      drawPixelRect(ex + 26, ey + 8, 12, 12, '#ffffff');
      drawPixelRect(ex + 28, ey + 10, 8, 8, '#ffffff');
      drawPixelRect(ex + 36, ey + 12, 6, 4, '#ffa500');
      drawPixelRect(ex + 38, ey + 14, 4, 2, '#ff8c00');
      drawPixelRect(ex + 30, ey + 12, 2, 2, '#2c3e50');
      drawPixelRect(ex + 31, ey + 13, 1, 1, '#fff');
    } else {
      drawPixelRect(ex + 2, ey + 8, 12, 12, '#ffffff');
      drawPixelRect(ex + 4, ey + 10, 8, 8, '#ffffff');
      drawPixelRect(ex - 2, ey + 12, 6, 4, '#ffa500');
      drawPixelRect(ex - 2, ey + 14, 4, 2, '#ff8c00');
      drawPixelRect(ex + 8, ey + 12, 2, 2, '#2c3e50');
      drawPixelRect(ex + 8, ey + 13, 1, 1, '#fff');
    }

    if (f > 0) {
      drawPixelRect(ex + 8, ey + 18, 6, 12, '#e8e8e8');
      drawPixelRect(ex + 10, ey + 20, 4, 8, '#f0f0f0');
    } else {
      drawPixelRect(ex + 26, ey + 18, 6, 12, '#e8e8e8');
      drawPixelRect(ex + 26, ey + 20, 4, 8, '#f0f0f0');
    }

    if (f > 0) {
      drawPixelRect(ex + 8, ey + 24, 4, 6, '#ffffff');
      drawPixelRect(ex + 6, ey + 28, 6, 2, '#ffffff');
    } else {
      drawPixelRect(ex + 28, ey + 24, 4, 6, '#ffffff');
      drawPixelRect(ex + 28, ey + 28, 6, 2, '#ffffff');
    }

    const legOffset = Math.sin(e.frame * 0.3) * 2;
    drawPixelRect(ex + 14, ey + 36, 4, 6 + legOffset, '#ffa500');
    drawPixelRect(ex + 22, ey + 36, 4, 6 - legOffset, '#ffa500');
    drawPixelRect(ex + 12, ey + 40 + legOffset, 8, 2, '#ff8c00');
    drawPixelRect(ex + 20, ey + 40 - legOffset, 8, 2, '#ff8c00');
    drawPixelRect(ex + 10, ey + 41 + legOffset, 4, 1, '#ff8c00');
    drawPixelRect(ex + 16, ey + 41 + legOffset, 4, 1, '#ff8c00');
    drawPixelRect(ex + 18, ey + 41 - legOffset, 4, 1, '#ff8c00');
    drawPixelRect(ex + 24, ey + 41 - legOffset, 4, 1, '#ff8c00');
  }

  function drawBird(e) {
    const ex = Math.floor(e.x - cameraX);
    const ey = Math.floor(e.y);
    const f = e.vx > 0 ? 1 : -1;
    const wing = Math.round(Math.sin(e.frame * 0.24) * 3);

    drawPixelRect(ex + 10, ey + 8, 18, 3, '#5fb9ef');
    drawPixelRect(ex + 7, ey + 11, 25, 4, '#75c9f6');
    drawPixelRect(ex + 6, ey + 15, 27, 6, '#83d3ff');
    drawPixelRect(ex + 8, ey + 21, 23, 4, '#4ca9e4');
    drawPixelRect(ex + 12, ey + 25, 15, 2, '#2f83c6');

    drawPixelRect(ex + 12, ey + 12, 13, 10, '#c8efff');
    drawPixelRect(ex + 15, ey + 14, 8, 7, '#eefbff');
    drawPixelRect(ex + 9, ey + 18, 4, 3, '#ffd45d');
    drawPixelRect(ex + 27, ey + 17, 4, 3, '#ffd45d');

    drawPixelRect(ex + 14, ey + 5, 9, 5, '#75c9f6');
    drawPixelRect(ex + 16, ey + 3, 5, 4, '#ffe27a');
    drawPixelRect(ex + 18, ey + 1, 2, 3, '#ffc93d');

    if (f > 0) {
      drawPixelRect(ex + 25, ey + 7, 8, 7, '#75c9f6');
      drawPixelRect(ex + 28, ey + 5, 4, 3, '#c8efff');
      drawPixelRect(ex + 32, ey + 10, 5, 3, '#f4b23c');
      drawPixelRect(ex + 35, ey + 11, 3, 1, '#ffd36a');
      drawPixelRect(ex + 29, ey + 9, 2, 2, '#2d2430');
      drawPixelRect(ex + 30, ey + 9, 1, 1, '#ffffff');
      drawPixelRect(ex + 27, ey + 13, 3, 2, '#ffd45d');
      drawPixelRect(ex + 3, ey + 15, 7, 4, '#2f83c6');
      drawPixelRect(ex + 1, ey + 17, 5, 3, '#236aa8');
    } else {
      drawPixelRect(ex + 5, ey + 7, 8, 7, '#75c9f6');
      drawPixelRect(ex + 6, ey + 5, 4, 3, '#c8efff');
      drawPixelRect(ex + 1, ey + 10, 5, 3, '#f4b23c');
      drawPixelRect(ex, ey + 11, 3, 1, '#ffd36a');
      drawPixelRect(ex + 8, ey + 9, 2, 2, '#2d2430');
      drawPixelRect(ex + 8, ey + 9, 1, 1, '#ffffff');
      drawPixelRect(ex + 9, ey + 13, 3, 2, '#ffd45d');
      drawPixelRect(ex + 30, ey + 15, 7, 4, '#2f83c6');
      drawPixelRect(ex + 34, ey + 17, 5, 3, '#236aa8');
    }

    drawPixelRect(ex + 8, ey + 14 + wing, 9, 4, '#3f9ed8');
    drawPixelRect(ex + 7, ey + 18 + wing, 12, 4, '#2f83c6');
    drawPixelRect(ex + 10, ey + 21 + wing, 8, 2, '#236aa8');
    drawPixelRect(ex + 21, ey + 14 - wing, 9, 4, '#3f9ed8');
    drawPixelRect(ex + 20, ey + 18 - wing, 12, 4, '#2f83c6');
    drawPixelRect(ex + 21, ey + 21 - wing, 8, 2, '#236aa8');

    drawPixelRect(ex + 15, ey + 27, 2, 3, '#ffc93d');
    drawPixelRect(ex + 22, ey + 27, 2, 3, '#ffc93d');
    drawPixelRect(ex + 13, ey + 30, 5, 1, '#e79a24');
    drawPixelRect(ex + 21, ey + 30, 5, 1, '#e79a24');
  }

  function drawBoss() {
    if (!boss || boss.defeated) return;
    const bx = Math.floor(boss.x - cameraX);
    const by = Math.floor(boss.y);

    const flashColor = boss.hitTimer > 0 ? '#fff' : null;

    drawPixelRect(bx + 18, by + 2, 44, 34, flashColor || '#5b6abf');
    drawPixelRect(bx + 20, by + 4, 40, 30, flashColor || '#6b7acf');
    drawPixelRect(bx + 24, by + 6, 32, 6, flashColor || '#4b5aaf');
    drawPixelRect(bx + 22, by + 12, 36, 18, flashColor || '#1a1a2e');
    drawPixelRect(bx + 26, by + 14, 28, 14, '#1e2a4a');

    drawPixelRect(bx + 30, by + 8, 20, 8, '#f5d6b8');
    drawPixelRect(bx + 32, by + 6, 16, 10, '#f5d6b8');
    drawPixelRect(bx + 34, by + 4, 12, 12, '#4a3728');
    drawPixelRect(bx + 36, by + 2, 8, 14, '#4a3728');

    drawPixelRect(bx + 28, by + 16, 6, 4, '#2c3e50');
    drawPixelRect(bx + 46, by + 16, 6, 4, '#2c3e50');
    drawPixelRect(bx + 30, by + 17, 2, 2, '#fff');
    drawPixelRect(bx + 48, by + 17, 2, 2, '#fff');

    drawPixelRect(bx + 36, by + 22, 8, 3, '#e88');
    drawPixelRect(bx + 38, by + 21, 4, 2, '#f99');

    drawPixelRect(bx + 22, by + 12, 4, 2, '#88ccff');
    drawPixelRect(bx + 54, by + 12, 4, 2, '#88ccff');
    drawPixelRect(bx + 20, by + 14, 4, 4, '#88ccff');
    drawPixelRect(bx + 56, by + 14, 4, 4, '#88ccff');

    drawPixelRect(bx + 14, by + 36, 52, 44, flashColor || '#4a5a9f');
    drawPixelRect(bx + 18, by + 38, 44, 40, flashColor || '#5b6abf');
    drawPixelRect(bx + 22, by + 40, 36, 36, flashColor || '#6b7acf');

    drawPixelRect(bx + 20, by + 36, 8, 6, flashColor || '#3a4a8f');
    drawPixelRect(bx + 52, by + 36, 8, 6, flashColor || '#3a4a8f');
    drawPixelRect(bx + 18, by + 40, 6, 38, flashColor || '#3a4a8f');
    drawPixelRect(bx + 56, by + 40, 6, 38, flashColor || '#3a4a8f');

    drawPixelRect(bx + 30, by + 44, 20, 26, '#ffd700');
    drawPixelRect(bx + 34, by + 46, 12, 22, '#ffed4e');
    drawPixelRect(bx + 36, by + 48, 8, 18, '#fff');
    drawPixelRect(bx + 38, by + 50, 4, 14, '#88ccff');

    drawPixelRect(bx + 4, by + 42, 14, 36, flashColor || '#4a5a9f');
    drawPixelRect(bx + 62, by + 42, 14, 36, flashColor || '#4a5a9f');
    drawPixelRect(bx + 6, by + 44, 10, 32, flashColor || '#5b6abf');
    drawPixelRect(bx + 64, by + 44, 10, 32, flashColor || '#5b6abf');

    drawPixelRect(bx + 2, by + 46, 6, 4, '#8b9dc3');
    drawPixelRect(bx + 72, by + 46, 6, 4, '#8b9dc3');
    drawPixelRect(bx + 2, by + 64, 6, 4, '#8b9dc3');
    drawPixelRect(bx + 72, by + 64, 6, 4, '#8b9dc3');

    drawPixelRect(bx + 4, by + 74, 16, 8, flashColor || '#3a4a8f');
    drawPixelRect(bx + 60, by + 74, 16, 8, flashColor || '#3a4a8f');

    const legOffset = Math.sin(boss.frame * 0.15) * 4;
    drawPixelRect(bx + 22, by + 80, 14, 18 + legOffset, flashColor || '#4a5a9f');
    drawPixelRect(bx + 44, by + 80, 14, 18 - legOffset, flashColor || '#4a5a9f');
    drawPixelRect(bx + 24, by + 82, 10, 14 + legOffset, flashColor || '#5b6abf');
    drawPixelRect(bx + 46, by + 82, 10, 14 - legOffset, flashColor || '#5b6abf');
    drawPixelRect(bx + 20, by + 94 + legOffset, 18, 6, '#3a4a8f');
    drawPixelRect(bx + 42, by + 94 - legOffset, 18, 6, '#3a4a8f');
    drawPixelRect(bx + 22, by + 96 + legOffset, 14, 3, '#2a3a7f');
    drawPixelRect(bx + 44, by + 96 - legOffset, 14, 3, '#2a3a7f');

    drawPixelRect(bx + 22, by + 82 + legOffset, 4, 6, '#8b9dc3');
    drawPixelRect(bx + 54, by + 82 - legOffset, 4, 6, '#8b9dc3');

    const healthBarWidth = 80;
    const healthPercent = boss.health / boss.maxHealth;
    drawPixelRect(bx, by - 24, healthBarWidth, 12, '#000');
    drawPixelRect(bx + 2, by - 22, healthBarWidth - 4, 8, '#333');
    drawPixelRect(bx + 2, by - 22, (healthBarWidth - 4) * healthPercent, 8, '#e74c3c');
    if (healthPercent > 0.5) {
      drawPixelRect(bx + 2, by - 22, (healthBarWidth - 4) * healthPercent, 3, '#ff6b6b');
    }
  }

  function drawGoldenKey() {
    if (!goldenKey) return;
    const kx = Math.floor(goldenKey.x - cameraX);
    const ky = Math.floor(goldenKey.y + Math.sin(Date.now() * 0.004) * 5);

    drawPixelRect(kx + 10, ky + 2, 12, 18, '#ffd700');
    drawPixelRect(kx + 6, ky + 6, 20, 10, '#ffd700');
    drawPixelRect(kx + 10, ky + 10, 12, 4, '#ffed4e');
    drawPixelRect(kx + 14, ky + 20, 4, 16, '#ffd700');
    drawPixelRect(kx + 10, ky + 32, 12, 3, '#ffd700');
    drawPixelRect(kx + 10, ky + 24, 3, 3, '#ffd700');

    drawPixelRect(kx + 12, ky + 8, 3, 3, '#fff');
    drawPixelRect(kx + 15, ky + 22, 2, 10, '#ffed4e');
  }

  function drawBackground() {
    const progress = Math.min(1, cameraX / (WORLD_WIDTH - GAME_W));
    const natureStrength = 1 - smoothstep(0.48, 0.62, progress);
    const cityStrength = smoothstep(0.58, 0.72, progress);
    
    const skyGrad = gameCtx.createLinearGradient(0, 0, 0, GROUND_Y);
    if (progress < 0.5) {
      const t = progress * 2;
      skyGrad.addColorStop(0, lerpColor('#10106a', '#152179', t));
      skyGrad.addColorStop(0.2, lerpColor('#0756a8', '#0c67b4', t));
      skyGrad.addColorStop(0.48, lerpColor('#178ee8', '#20a0ee', t));
      skyGrad.addColorStop(0.72, lerpColor('#40c8dc', '#50d7ce', t));
      skyGrad.addColorStop(1, lerpColor('#82f0bd', '#9cf4c5', t));
    } else {
      const t = (progress - 0.5) * 2;
      skyGrad.addColorStop(0, lerpColor('#152179', '#26368d', t));
      skyGrad.addColorStop(0.24, lerpColor('#0c67b4', '#1c76c2', t));
      skyGrad.addColorStop(0.5, lerpColor('#20a0ee', '#36b7e8', t));
      skyGrad.addColorStop(0.75, lerpColor('#50d7ce', '#70e2bb', t));
      skyGrad.addColorStop(1, lerpColor('#9cf4c5', '#b7efbf', t));
    }
    gameCtx.fillStyle = skyGrad;
    gameCtx.fillRect(0, 0, GAME_W, GAME_H);

    for (let i = 0; i < 70; i++) {
      const sx = Math.floor(randAt(i, 4, 1) * GAME_W);
      const sy = Math.floor(10 + randAt(i, 5, 2) * 160);
      const twinkle = 0.58 + Math.sin(Date.now() * 0.002 + i) * 0.25;
      const starOpacity = Math.max(0.18, (1 - sy / 210) * twinkle);
      const size = randAt(i, 7, 3) > 0.84 ? 3 : 2;
      drawPixelRect(sx, sy, size, size, `rgba(255,255,214,${starOpacity})`);
      if (size === 3) {
        drawPixelRect(sx - 3, sy + 1, 2, 1, `rgba(255,255,255,${starOpacity * 0.65})`);
        drawPixelRect(sx + 4, sy + 1, 2, 1, `rgba(255,255,255,${starOpacity * 0.65})`);
        drawPixelRect(sx + 1, sy - 3, 1, 2, `rgba(255,255,255,${starOpacity * 0.65})`);
        drawPixelRect(sx + 1, sy + 4, 1, 2, `rgba(255,255,255,${starOpacity * 0.65})`);
      }
    }

    clouds.forEach(function (c) {
      const cx = (c.x - cameraX * 0.2) % (WORLD_WIDTH + 200);
      const drawX = cx < -150 ? cx + WORLD_WIDTH + 200 : cx;
      const cloudOpacity = 0.35 + natureStrength * 0.5 + cityStrength * 0.12;
      drawCloud(drawX, c.y, c.w, c.h, cloudOpacity, c.seed);
    });

    if (natureStrength > 0) {
      const birdOpacity = 0.26 * natureStrength;
      for (let i = 0; i < 6; i++) {
        const birdX = (GAME_W * 0.2 + i * 90 + Math.sin(Date.now() * 0.001 + i * 1.5) * 25) % GAME_W;
        const birdY = 80 + i * 25 + Math.sin(Date.now() * 0.002 + i * 2) * 12;
        const wingFlap = Math.sin(Date.now() * 0.008 + i) * 3;
        drawPixelRect(birdX, birdY, 2, 2, `rgba(50,50,60,${birdOpacity})`);
        drawPixelRect(birdX - 5, birdY + 1 + wingFlap, 4, 1, `rgba(50,50,60,${birdOpacity})`);
        drawPixelRect(birdX + 3, birdY + 1 - wingFlap, 4, 1, `rgba(50,50,60,${birdOpacity})`);
        drawPixelRect(birdX - 3, birdY + wingFlap, 2, 1, `rgba(50,50,60,${birdOpacity})`);
        drawPixelRect(birdX + 3, birdY - wingFlap, 2, 1, `rgba(50,50,60,${birdOpacity})`);
      }
    }

    if (natureStrength > 0) {
      gameCtx.save();
      gameCtx.globalAlpha = natureStrength;
      mountains.forEach(function (m) {
        const mx = Math.floor(m.x - cameraX * 0.35);
        if (mx > -m.w && mx < GAME_W + m.w) {
          gameCtx.fillStyle = '#6d78bc';
          gameCtx.beginPath();
          gameCtx.moveTo(mx, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y);
          gameCtx.lineTo(mx + m.w, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = '#8390d1';
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.12, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 18);
          gameCtx.lineTo(mx + m.w * 0.88, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = '#9dabde';
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.26, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 38);
          gameCtx.lineTo(mx + m.w * 0.74, GROUND_Y);
          gameCtx.fill();

          drawPixelRect(mx + m.w / 2 - 28, m.y + 8, 56, 22, '#f3f5ff');
          drawPixelRect(mx + m.w / 2 - 38, m.y + 22, 76, 16, '#dde8ff');
        }
      });
      gameCtx.restore();
    }
    drawFarmhouse(natureStrength);

    if (cityStrength > 0) {
      const skylineBaseY = GROUND_Y - 8;
      drawMountRainier(cityStrength);
      drawPixelRect(0, skylineBaseY - 32, GAME_W, 24, `rgba(85,96,108,${0.24 * cityStrength})`);
      drawPixelRect(0, skylineBaseY - 18, GAME_W, 5, `rgba(128,145,143,${0.38 * cityStrength})`);
      drawPixelRect(0, skylineBaseY, GAME_W, 8, `rgba(92,108,111,${cityStrength})`);
      drawPixelRect(0, skylineBaseY - 3, GAME_W, 3, `rgba(124,139,135,${cityStrength})`);
      for (let worldX = Math.floor((cameraX * 0.18) / 140) * 140; worldX < cameraX * 0.18 + GAME_W + 140; worldX += 140) {
        const lampX = worldX - cameraX * 0.18 + 24;
        drawPixelRect(lampX, skylineBaseY - 48, 4, 45, `rgba(54,64,76,${0.55 * cityStrength})`);
        drawPixelRect(lampX - 5, skylineBaseY - 52, 14, 5, `rgba(255,213,106,${0.55 * cityStrength})`);
        drawPixelRect(lampX - 3, skylineBaseY - 50, 10, 2, `rgba(255,238,156,${0.5 * cityStrength})`);
      }
      seattleBuildings.forEach(function (b, index) {
        const buildingStrength = smoothstep(0.58 + index * 0.012, 0.68 + index * 0.012, progress);
        if (buildingStrength <= 0) return;

        const bx = Math.floor(b.x - cameraX * 0.15);
        if (bx > -b.w && bx < GAME_W + b.w) {
          const buildingOpacity = 0.68 * buildingStrength;

          if (b.type === 'spaceNeedle') {
            drawPixelRect(bx + 53, b.y + 52, 8, b.h - 52, `rgba(231,232,222,${buildingOpacity})`);
            drawPixelRect(bx + 39, b.y + 96, 7, b.h - 96, `rgba(246,239,219,${buildingOpacity * 0.92})`);
            drawPixelRect(bx + 67, b.y + 96, 7, b.h - 96, `rgba(246,239,219,${buildingOpacity * 0.92})`);
            drawPixelRect(bx + 31, b.y + 92, 52, 7, `rgba(238,232,214,${buildingOpacity})`);
            drawPixelRect(bx + 18, b.y + 54, 78, 10, `rgba(48,50,62,${buildingOpacity})`);
            drawPixelRect(bx + 12, b.y + 46, 90, 9, `rgba(237,131,60,${buildingOpacity})`);
            drawPixelRect(bx + 20, b.y + 39, 74, 8, `rgba(246,202,121,${buildingOpacity})`);
            drawPixelRect(bx + 28, b.y + 32, 58, 8, `rgba(196,64,48,${buildingOpacity})`);
            drawPixelRect(bx + 38, b.y + 25, 38, 7, `rgba(251,144,57,${buildingOpacity})`);
            drawPixelRect(bx + 49, b.y + 12, 16, 14, `rgba(238,219,176,${buildingOpacity})`);
            drawPixelRect(bx + 55, b.y - 18, 3, 30, `rgba(170,82,74,${buildingOpacity})`);
            drawPixelRect(bx + 54, b.y - 24, 5, 6, `rgba(218,177,105,${buildingOpacity})`);
            
            for (let wy = b.y + 108; wy < b.baseY - 14; wy += 18) {
              const legInset = (wy - b.y) * 0.035;
              drawPixelRect(bx + 40 - legInset, wy, 5, 12, `rgba(238,232,215,${buildingOpacity * 0.88})`);
              drawPixelRect(bx + 69 + legInset, wy, 5, 12, `rgba(238,232,215,${buildingOpacity * 0.88})`);
              drawPixelRect(bx + 55, wy, 3, 12, `rgba(203,208,205,${buildingOpacity * 0.55})`);
            }
            
            drawPixelRect(bx + 32, b.baseY - 46, 50, 16, `rgba(230,224,208,${buildingOpacity})`);
            drawPixelRect(bx + 22, b.baseY - 30, 70, 14, `rgba(207,215,213,${buildingOpacity})`);
            drawPixelRect(bx + 10, b.baseY - 14, 94, 12, `rgba(72,80,96,${buildingOpacity})`);
          } else {
            if (b.type === 'slantRoof') {
              gameCtx.fillStyle = `rgba(38,38,48,${buildingOpacity})`;
              gameCtx.beginPath();
              gameCtx.moveTo(bx + 6, b.y + 8);
              gameCtx.lineTo(bx + b.w - 4, b.y + 38);
              gameCtx.lineTo(bx + b.w - 4, b.baseY);
              gameCtx.lineTo(bx + 6, b.baseY);
              gameCtx.fill();
              drawPixelRect(bx + 12, b.y + 54, b.w - 24, b.h - 62, `rgba(75,66,74,${buildingOpacity})`);
              for (let wy = b.y + 70; wy < b.baseY - 12; wy += 16) {
                drawPixelRect(bx + 18, wy, b.w - 36, 5, `rgba(236,190,112,${buildingOpacity * 0.62})`);
              }
              drawPixelRect(bx - 3, b.baseY - 4, b.w + 6, 4, `rgba(72,80,96,${buildingOpacity})`);
              return;
            }

            const bodyColor = b.type === 'goldBlock' ? '190,142,69' :
              b.type === 'darkTower' ? '56,63,86' :
              b.type === 'darkBlock' ? '68,58,70' :
              b.type === 'brickTower' ? '128,78,67' :
              b.type === 'stripedTower' ? '205,211,207' :
              b.type === 'slantRoof' ? '58,55,66' :
              b.type === 'steppedTower' ? '192,155,127' :
              b.type === 'whiteTower' ? '198,206,202' :
              '98,126,148';
            const insetColor = b.type === 'goldBlock' ? '224,174,86' :
              b.type === 'darkTower' ? '73,82,108' :
              b.type === 'darkBlock' ? '86,72,82' :
              b.type === 'brickTower' ? '158,95,74' :
              b.type === 'stripedTower' ? '236,231,216' :
              b.type === 'slantRoof' ? '75,66,74' :
              b.type === 'steppedTower' ? '223,184,147' :
              b.type === 'whiteTower' ? '226,224,211' :
              '124,158,178';
            drawPixelRect(bx, b.y, b.w, b.h, `rgba(${bodyColor},${buildingOpacity})`);
            drawPixelRect(bx + 2, b.y + 2, b.w - 4, b.h - 4, `rgba(${insetColor},${buildingOpacity})`);
            if (b.type === 'crowned') {
              drawPixelRect(bx + 12, b.y - 12, b.w - 24, 14, `rgba(72,72,90,${buildingOpacity})`);
              drawPixelRect(bx + 22, b.y - 24, b.w - 44, 12, `rgba(96,82,92,${buildingOpacity})`);
            } else if (b.type === 'glassTop') {
              drawPixelRect(bx + 8, b.y - 22, b.w - 16, 24, `rgba(55,105,128,${buildingOpacity})`);
              drawPixelRect(bx + 14, b.y - 28, b.w - 28, 8, `rgba(110,180,196,${buildingOpacity * 0.7})`);
            } else if (b.type === 'lowGlass') {
              drawPixelRect(bx + 8, b.y + 10, b.w - 16, 18, `rgba(44,94,112,${buildingOpacity})`);
            } else if (b.type === 'stripedTower') {
              drawPixelRect(bx + 10, b.y - 16, b.w - 20, 18, `rgba(242,232,202,${buildingOpacity})`);
              drawPixelRect(bx + b.w - 20, b.y - 34, 3, 18, `rgba(198,72,61,${buildingOpacity})`);
              for (let sy = b.y + 18; sy < b.baseY - 18; sy += 14) {
                drawPixelRect(bx + 6, sy, b.w - 12, 3, `rgba(89,104,124,${buildingOpacity * 0.72})`);
              }
            } else if (b.type === 'steppedTower') {
              drawPixelRect(bx + 10, b.y - 18, b.w - 20, 18, `rgba(214,172,136,${buildingOpacity})`);
              drawPixelRect(bx + 20, b.y - 30, b.w - 40, 12, `rgba(184,132,106,${buildingOpacity})`);
            }
            drawPixelRect(bx + 4, b.y + 4, b.w - 8, 4, `rgba(245,220,170,${buildingOpacity * 0.45})`);
            drawPixelRect(bx + 4, b.y + b.h - 8, b.w - 8, 4, `rgba(80,90,110,${buildingOpacity * 0.5})`);
            
            for (let wy = b.y + 12; wy < b.y + b.h - 12; wy += 14) {
              for (let wx = bx + 8; wx < bx + b.w - 8; wx += 12) {
                const windowLit = randAt(b.x, wx, wy) > 0.2;
                if (windowLit) {
                  drawPixelRect(wx, wy, 6, 8, `rgba(255,220,150,${buildingOpacity * 0.9})`);
                  drawPixelRect(wx + 1, wy + 1, 4, 6, `rgba(255,240,180,${buildingOpacity * 0.7})`);
                  drawPixelRect(wx + 2, wy + 2, 2, 4, `rgba(255,250,200,${buildingOpacity * 0.5})`);
                } else {
                  drawPixelRect(wx, wy, 6, 8, `rgba(160,160,180,${buildingOpacity * 0.4})`);
                  drawPixelRect(wx + 1, wy + 1, 4, 6, `rgba(170,170,190,${buildingOpacity * 0.3})`);
                }
              }
            }
            
            drawPixelRect(bx + b.w / 2 - 1, b.y, 2, b.h, `rgba(80,90,120,${buildingOpacity * 0.3})`);
            drawPixelRect(bx, b.y + b.h / 2, b.w, 2, `rgba(80,90,120,${buildingOpacity * 0.2})`);
            drawPixelRect(bx - 3, b.baseY - 4, b.w + 6, 4, `rgba(72,80,96,${buildingOpacity})`);
          }
        }
      });
      drawSeattleArches(cityStrength);
    }

    if (natureStrength > 0) {
      const geyserOpacity = 0.72 * natureStrength;
      geysers.forEach(function (g) {
        const gx = Math.floor(g.x - cameraX);
        if (gx > -g.w && gx < GAME_W + g.w) {
          drawPixelRect(gx, g.y - 12, g.w, 12, `rgba(180,160,120,${geyserOpacity})`);
          drawPixelRect(gx + 2, g.y - 10, g.w - 4, 8, `rgba(200,180,140,${geyserOpacity * 0.9})`);
          drawPixelRect(gx + 4, g.y - 8, g.w - 8, 4, `rgba(220,200,160,${geyserOpacity * 0.8})`);
          
          drawPixelRect(gx + 10, g.y - 18, g.w - 20, 6, `rgba(160,140,100,${geyserOpacity})`);
          drawPixelRect(gx + 12, g.y - 16, g.w - 24, 4, `rgba(180,160,120,${geyserOpacity * 0.9})`);
          
          drawPixelRect(gx + 10, g.y - 8, g.w - 20, 6, `rgba(80,180,240,${geyserOpacity})`);
          drawPixelRect(gx + 12, g.y - 6, g.w - 24, 4, `rgba(100,200,255,${geyserOpacity * 0.9})`);
          drawPixelRect(gx + 14, g.y - 10, g.w - 28, 6, `rgba(120,210,255,${geyserOpacity * 0.8})`);
          
          g.steamFrame++;
          const steamOffset = Math.sin(g.steamFrame * 0.05) * 6;
          drawPixelRect(gx + 16, g.y - 50 - steamOffset, 16, 20, `rgba(255,255,255,${0.75 * geyserOpacity})`);
          drawPixelRect(gx + 18, g.y - 48 - steamOffset, 12, 16, `rgba(255,255,255,${0.85 * geyserOpacity})`);
          drawPixelRect(gx + 20, g.y - 46 - steamOffset, 8, 12, `rgba(255,255,255,${0.95 * geyserOpacity})`);
          
          drawPixelRect(gx + 12, g.y - 65 - steamOffset, 24, 14, `rgba(255,255,255,${0.55 * geyserOpacity})`);
          drawPixelRect(gx + 14, g.y - 63 - steamOffset, 20, 10, `rgba(255,255,255,${0.65 * geyserOpacity})`);
          drawPixelRect(gx + 16, g.y - 61 - steamOffset, 16, 6, `rgba(255,255,255,${0.75 * geyserOpacity})`);
          
          drawPixelRect(gx + 8, g.y - 78 - steamOffset, 32, 10, `rgba(255,255,255,${0.35 * geyserOpacity})`);
          drawPixelRect(gx + 10, g.y - 76 - steamOffset, 28, 6, `rgba(255,255,255,${0.45 * geyserOpacity})`);
          drawPixelRect(gx + 12, g.y - 74 - steamOffset, 24, 4, `rgba(255,255,255,${0.55 * geyserOpacity})`);
          
          for (let i = 0; i < 4; i++) {
            const bubbleDrift = (Date.now() * 0.001 + i * 9) % 1;
            const bubbleX = gx + 14 + randAt(g.x, i, 3) * 20;
            const bubbleY = g.y - 30 - bubbleDrift * 40 - steamOffset;
            drawPixelRect(bubbleX, bubbleY, 3, 3, `rgba(255,255,255,${0.6 * geyserOpacity})`);
            drawPixelRect(bubbleX + 1, bubbleY + 1, 1, 1, `rgba(255,255,255,${0.8 * geyserOpacity})`);
          }
        }
      });
    }

    drawPixelRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y, '#d89b42');
    drawPixelRect(0, GROUND_Y, GAME_W, 10, lerpColor('#72c94c', '#8b9a62', cityStrength));
    drawPixelRect(0, GROUND_Y + 10, GAME_W, 8, lerpColor('#4f9d38', '#6f7449', cityStrength));
    drawPixelRect(0, GROUND_Y + 18, GAME_W, 6, lerpColor('#786332', '#6e6546', cityStrength));
    drawPixelRect(0, GROUND_Y + 24, GAME_W, 34, '#e1ad4b');
    drawPixelRect(0, GROUND_Y + 58, GAME_W, 38, '#b87935');
    drawPixelRect(0, GROUND_Y + 96, GAME_W, GAME_H - GROUND_Y - 96, '#724527');
    drawPixelRect(0, GROUND_Y + 24, GAME_W, 3, '#f2c85f');
    drawPixelRect(0, GROUND_Y + 58, GAME_W, 3, '#cf8d3b');
    drawPixelRect(0, GROUND_Y + 96, GAME_W, 3, '#8b5630');

    const detailStart = Math.floor(cameraX / 30) * 30;
    for (let worldX = detailStart; worldX < cameraX + GAME_W + 30; worldX += 30) {
      const i = worldX;
      const screenX = worldX - cameraX;
      drawPixelRect(screenX + randAt(i, 11, 1) * 15, GROUND_Y + 34, 12, 5, '#c88939');
      drawPixelRect(screenX + 18 + randAt(i, 12, 2) * 10, GROUND_Y + 70, 8, 4, '#97602f');
      drawPixelRect(screenX + 5 + randAt(i, 13, 3) * 20, GROUND_Y + 112, 6, 3, '#5f3a24');
    }

    const grassStart = Math.floor(cameraX / 15) * 15;
    for (let worldX = grassStart; worldX < cameraX + GAME_W + 15; worldX += 15) {
      const i = worldX;
      const grassColor = lerpColor('#6aaa5a', '#7d8d68', cityStrength);
      const grassX = worldX - cameraX + randAt(i, 14, 1) * 10;
      const grassH = 4 + Math.floor(randAt(i, 15, 2) * 4);
      drawPixelRect(grassX, GROUND_Y - grassH, 2, grassH, grassColor);
      drawPixelRect(grassX + 3, GROUND_Y - grassH + 1, 2, grassH - 1, grassColor);
      drawPixelRect(grassX + 6, GROUND_Y - grassH + 2, 2, grassH - 2, grassColor);
      drawPixelRect(grassX + 1, GROUND_Y - 1, 1, 2, grassColor);
      drawPixelRect(grassX + 4, GROUND_Y - 1, 1, 2, grassColor);
    }

    const cloverStart = Math.floor(cameraX / 80) * 80;
    for (let worldX = cloverStart; worldX < cameraX + GAME_W + 80; worldX += 80) {
      const i = worldX;
      const cloverX = worldX - cameraX + randAt(i, 16, 1) * 25;
      const cloverY = GROUND_Y - 2;
      const cloverColor = lerpColor('#5a9a4a', '#788763', cityStrength);
      drawPixelRect(cloverX, cloverY, 2, 3, cloverColor);
      drawPixelRect(cloverX - 2, cloverY - 1, 2, 2, cloverColor);
      drawPixelRect(cloverX + 2, cloverY - 1, 2, 2, cloverColor);
      drawPixelRect(cloverX, cloverY - 2, 2, 2, cloverColor);
    }

  }

  function drawFarmPath(progress) {
    const pathTop = GROUND_Y + 16;
    const pathColor = lerpColor('#e7ad45', '#d19545', progress);
    drawPixelRect(0, pathTop + 54, GAME_W, GAME_H - pathTop - 54, '#c88435');
    for (let x = 0; x < GAME_W; x += 8) {
      const wave = Math.sin((x + cameraX * 0.35) * 0.012) * 14;
      const leftBank = GAME_W * 0.35 + wave - (GAME_H - pathTop) * 0.34;
      const rightBank = GAME_W * 0.65 + wave + (GAME_H - pathTop) * 0.34;
      const top = pathTop + Math.abs(x - GAME_W / 2) * 0.045;
      if (x > leftBank && x < rightBank) {
        drawPixelRect(x, top, 8, GAME_H - top, pathColor);
        drawPixelRect(x, top + 10, 8, 5, '#f4ca67');
        if (randAt(x, 21, 1) > 0.72) {
          drawPixelRect(x + 2, top + 36 + randAt(x, 22, 2) * 80, 4, 3, '#b97732');
        }
      }
    }
  }

  function drawCropRows(progress) {
    const opacity = 1 - Math.min(1, progress * 1.6);
    if (opacity <= 0) return;
    for (let row = 0; row < 3; row++) {
      const baseY = GROUND_Y + 38 + row * 34;
      for (let x = -60 - (cameraX * 0.85 % 48); x < GAME_W + 80; x += 48) {
        const plant = (Math.floor((x + cameraX) / 48) + row) % 3;
        drawPixelRect(x + 8, baseY + 18, 30, 8, `rgba(132,89,37,${opacity * 0.55})`);
        drawPixelRect(x + 18, baseY + 6, 4, 18, `rgba(36,122,36,${opacity})`);
        drawPixelRect(x + 10, baseY + 8, 10, 8, `rgba(55,157,49,${opacity})`);
        drawPixelRect(x + 22, baseY + 8, 10, 8, `rgba(70,184,57,${opacity})`);
        if (plant === 0) {
          drawPixelRect(x + 16, baseY, 10, 10, `rgba(247,205,47,${opacity})`);
          drawPixelRect(x + 18, baseY + 2, 6, 6, `rgba(255,226,77,${opacity})`);
        } else if (plant === 1) {
          drawPixelRect(x + 14, baseY + 2, 12, 12, `rgba(226,70,61,${opacity})`);
          drawPixelRect(x + 17, baseY + 4, 6, 6, `rgba(245,101,71,${opacity})`);
        }
      }
    }
  }

  function drawMountRainier(stageStrength) {
    const opacity = 0.62 * stageStrength;
    if (opacity <= 0) return;
    const rx = Math.floor(1540 - cameraX * 0.05);
    const baseY = GROUND_Y - 46;
    const peakY = GROUND_Y - 230;
    if (rx < -420 || rx > GAME_W + 220) return;

    gameCtx.save();
    gameCtx.globalAlpha = opacity;
    gameCtx.fillStyle = '#506f8d';
    gameCtx.beginPath();
    gameCtx.moveTo(rx - 230, baseY);
    gameCtx.lineTo(rx - 145, baseY - 46);
    gameCtx.lineTo(rx - 62, baseY - 64);
    gameCtx.lineTo(rx, peakY);
    gameCtx.lineTo(rx + 74, baseY - 88);
    gameCtx.lineTo(rx + 160, baseY - 48);
    gameCtx.lineTo(rx + 255, baseY);
    gameCtx.fill();

    gameCtx.fillStyle = '#6d89a3';
    gameCtx.beginPath();
    gameCtx.moveTo(rx - 122, baseY);
    gameCtx.lineTo(rx - 34, baseY - 88);
    gameCtx.lineTo(rx, peakY + 22);
    gameCtx.lineTo(rx + 56, baseY - 78);
    gameCtx.lineTo(rx + 144, baseY);
    gameCtx.fill();

    gameCtx.fillStyle = '#f5f2ec';
    gameCtx.beginPath();
    gameCtx.moveTo(rx - 44, peakY + 54);
    gameCtx.lineTo(rx, peakY + 2);
    gameCtx.lineTo(rx + 50, peakY + 62);
    gameCtx.lineTo(rx + 30, peakY + 84);
    gameCtx.lineTo(rx - 20, peakY + 76);
    gameCtx.fill();

    drawPixelRect(rx - 74, peakY + 96, 148, 12, '#e7e5e0');
    drawPixelRect(rx - 106, peakY + 120, 212, 10, '#d8e1e4');
    drawPixelRect(rx - 156, baseY - 36, 312, 12, '#3c6370');
    drawPixelRect(rx - 206, baseY - 18, 410, 18, '#2f5360');
    gameCtx.restore();
  }

  function drawSeattleArches(stageStrength) {
    const opacity = 0.72 * stageStrength;
    if (opacity <= 0) return;
    const ax = Math.floor(980 - cameraX * 0.12);
    const ay = GROUND_Y - 72;
    if (ax < -220 || ax > GAME_W + 80) return;

    drawPixelRect(ax - 18, ay + 40, 180, 20, `rgba(118,83,82,${opacity})`);
    drawPixelRect(ax - 14, ay + 36, 172, 6, `rgba(205,157,132,${opacity})`);
    for (let i = 0; i < 3; i++) {
      const x = ax + i * 48;
      drawPixelRect(x, ay + 20, 8, 42, `rgba(236,235,224,${opacity})`);
      drawPixelRect(x + 28, ay + 20, 8, 42, `rgba(236,235,224,${opacity})`);
      drawPixelRect(x + 4, ay + 12, 28, 8, `rgba(245,244,235,${opacity})`);
      drawPixelRect(x + 8, ay + 6, 20, 8, `rgba(245,244,235,${opacity})`);
      drawPixelRect(x + 12, ay + 2, 12, 5, `rgba(255,252,238,${opacity})`);
      drawPixelRect(x + 10, ay + 24, 20, 4, `rgba(80,108,124,${opacity * 0.45})`);
    }
  }

  function drawFarmhouse(stageStrength) {
    const opacity = 0.78 * stageStrength;
    if (opacity <= 0) return;
    const hx = Math.floor(880 - cameraX * 0.35);
    const hy = GROUND_Y - 190;
    if (hx < -180 || hx > GAME_W + 80) return;

    drawPixelRect(hx + 34, hy + 74, 116, 116, `rgba(92,73,48,${opacity})`);
    drawPixelRect(hx + 42, hy + 82, 100, 108, `rgba(127,98,63,${opacity})`);
    for (let i = 0; i < 6; i++) {
      drawPixelRect(hx + 46 + i * 16, hy + 84, 5, 102, `rgba(73,58,41,${opacity * 0.8})`);
    }
    drawPixelRect(hx + 16, hy + 48, 152, 36, `rgba(102,45,31,${opacity})`);
    drawPixelRect(hx + 26, hy + 34, 132, 30, `rgba(170,75,38,${opacity})`);
    drawPixelRect(hx + 42, hy + 20, 100, 28, `rgba(202,93,41,${opacity})`);
    drawPixelRect(hx + 76, hy + 8, 32, 20, `rgba(241,139,42,${opacity})`);
    for (let i = 0; i < 5; i++) {
      drawPixelRect(hx + 30 + i * 26, hy + 42 + i % 2 * 6, 22, 8, `rgba(111,48,31,${opacity * 0.8})`);
    }
    drawPixelRect(hx + 76, hy + 128, 30, 62, `rgba(100,54,32,${opacity})`);
    drawPixelRect(hx + 82, hy + 136, 18, 46, `rgba(158,92,45,${opacity})`);
    drawPixelRect(hx + 108, hy + 102, 26, 28, `rgba(71,43,31,${opacity})`);
    drawPixelRect(hx + 112, hy + 106, 18, 20, `rgba(255,202,87,${opacity})`);
    drawPixelRect(hx + 120, hy + 106, 3, 20, `rgba(80,50,34,${opacity})`);
    drawPixelRect(hx + 112, hy + 114, 18, 3, `rgba(80,50,34,${opacity})`);
    drawPixelRect(hx + 116, hy - 8, 20, 44, `rgba(112,55,34,${opacity})`);
    drawPixelRect(hx + 112, hy - 14, 28, 8, `rgba(221,119,45,${opacity})`);
  }

  function lerpColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r},${g},${b})`;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
      player.vx = -MOVE_SPEED;
      player.facing = -1;
    } else if (keys['ArrowRight'] || keys['d']) {
      player.vx = MOVE_SPEED;
      player.facing = 1;
    } else {
      player.vx *= 0.8;
    }

    if ((keys['ArrowUp'] || keys[' '] || keys['w']) && player.grounded) {
      player.vy = JUMP_FORCE;
      player.grounded = false;
    }

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    if (player.y + player.h >= GROUND_Y) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    if (player.x < 0) player.x = 0;
    if (player.x > WORLD_WIDTH - player.w) player.x = WORLD_WIDTH - player.w;

    player.frameTimer++;
    if (player.frameTimer > 5) {
      player.frame++;
      player.frameTimer = 0;
    }

    const targetCam = player.x - GAME_W / 3;
    cameraX += (targetCam - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > WORLD_WIDTH - GAME_W) cameraX = WORLD_WIDTH - GAME_W;
  }

  function updateEnemies() {
    enemies.forEach(function (e) {
      if (e.type === 'bird') {
        e.x += e.vx;
        if (e.x <= e.patrolStart || e.x >= e.patrolEnd) {
          e.vx = -e.vx;
        }
        e.y = e.baseY + Math.sin(e.frame * e.bobSpeed + e.bobOffset) * e.bobAmplitude;
        e.frame++;
        return;
      }

      const nextX = e.x + e.vx;
      const nextRect = {
        x: nextX + 4,
        y: e.y + 8,
        w: e.w - 8,
        h: e.h - 8
      };
      if (nextX <= e.patrolStart || nextX >= e.patrolEnd || wouldHitObstacle(nextRect)) {
        e.vx = -e.vx;
      } else {
        e.x = nextX;
      }
      e.frame++;
    });

    if (!boss && score >= TARGET_SCORE) {
      boss = {
        x: WORLD_WIDTH - 600,
        y: GROUND_Y - 96,
        w: 80,
        h: 96,
        vx: 3,
        health: 3,
        maxHealth: 3,
        patrolStart: WORLD_WIDTH - 800,
        patrolEnd: WORLD_WIDTH - 300,
        frame: 0,
        hitTimer: 0,
        attackTimer: 0,
        defeated: false
      };
    }

    if (boss && !boss.defeated) {
      boss.x += boss.vx;
      if (boss.x <= boss.patrolStart || boss.x >= boss.patrolEnd) {
        boss.vx = -boss.vx;
      }
      boss.frame++;
      if (boss.hitTimer > 0) boss.hitTimer--;

      boss.attackTimer++;
      if (boss.attackTimer >= 80) {
        boss.attackTimer = 0;
        const dx = player.x + player.w / 2 - (boss.x + boss.w / 2);
        const dy = player.y + player.h / 2 - (boss.y + boss.h / 2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        bossBullets.push({
          x: boss.x + (boss.vx > 0 ? boss.w : -16),
          y: boss.y + boss.h / 2 - 8,
          w: 16,
          h: 16,
          vx: (dx / dist) * 5,
          vy: (dy / dist) * 5,
          life: 120
        });
      }
    }

    for (let i = bossBullets.length - 1; i >= 0; i--) {
      const bb = bossBullets[i];
      bb.x += bb.vx;
      bb.y += bb.vy;
      bb.life--;
      if (bb.life <= 0 || bb.x < cameraX - 50 || bb.x > cameraX + GAME_W + 50 ||
          bb.y < -50 || bb.y > GROUND_Y + 50) {
        bossBullets.splice(i, 1);
      }
    }
  }

  function shoot() {
    if (shootCooldown > 0) return;
    bullets.push({
      x: player.x + (player.facing > 0 ? player.w : -16),
      y: player.y + player.h / 2 - 6,
      w: 16,
      h: 12,
      vx: player.facing * 10,
      life: 60
    });
    shootCooldown = 15;
  }

  function updateBullets() {
    if (shootCooldown > 0) shootCooldown--;
    
    if (keys['x'] || keys['z'] || keys['j'] || keys['k']) {
      shoot();
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.life--;
      if (b.life <= 0) {
        bullets.splice(i, 1);
      }
    }
  }

  function drawBullets() {
    bullets.forEach(function (b) {
      const bx = Math.floor(b.x - cameraX);
      const by = Math.floor(b.y);
      drawPixelRect(bx + 2, by + 2, 12, 8, '#ff69b4');
      drawPixelRect(bx + 4, by + 4, 8, 4, '#ffb6c1');
      if (b.vx > 0) {
        drawPixelRect(bx + 12, by + 3, 4, 6, '#fff');
        drawPixelRect(bx + 14, by + 4, 2, 4, '#ffe0eb');
      } else {
        drawPixelRect(bx, by + 3, 4, 6, '#fff');
        drawPixelRect(bx, by + 4, 2, 4, '#ffe0eb');
      }
    });
  }

  function drawBossBullets() {
    bossBullets.forEach(function (bb) {
      const bx = Math.floor(bb.x - cameraX);
      const by = Math.floor(bb.y);
      drawPixelRect(bx + 2, by + 2, 12, 12, '#ff4444');
      drawPixelRect(bx + 4, by + 4, 8, 8, '#ff6666');
      drawPixelRect(bx + 6, by + 6, 4, 4, '#ffaa00');
      drawPixelRect(bx + 7, by + 7, 2, 2, '#ffdd44');
    });
  }

  function checkCollisions() {
    hearts.forEach(function (h) {
      if (h.collected) return;
      if (player.x < h.x + h.w && player.x + player.w > h.x &&
          player.y < h.y + h.h && player.y + player.h > h.y) {
        h.collected = true;
        score++;
        scoreValue.textContent = score;
        progressBar.style.width = Math.min(100, (score / TARGET_SCORE) * 100) + '%';
      }
    });

    obstacles.forEach(function (o) {
      if (rectsOverlap(player, o)) {
        const playerCenterX = player.x + player.w / 2;
        const playerCenterY = player.y + player.h / 2;
        const obstacleCenterX = o.x + o.w / 2;
        const obstacleCenterY = o.y + o.h / 2;
        const overlapX = player.w / 2 + o.w / 2 - Math.abs(playerCenterX - obstacleCenterX);
        const overlapY = player.h / 2 + o.h / 2 - Math.abs(playerCenterY - obstacleCenterY);

        if (overlapX < overlapY) {
          if (playerCenterX < obstacleCenterX) {
            player.x = o.x - player.w;
          } else {
            player.x = o.x + o.w;
          }
          player.vx = 0;
        } else if (playerCenterY < obstacleCenterY) {
          player.y = o.y - player.h;
          player.vy = 0;
          player.grounded = true;
        } else {
          player.y = o.y + o.h;
          player.vy = Math.max(0, player.vy);
        }
      }
    });

    enemies.forEach(function (e) {
      if (rectsOverlap(player, e)) {
        playerDeath();
      }
    });

    for (let i = bossBullets.length - 1; i >= 0; i--) {
      const bb = bossBullets[i];
      if (player.x < bb.x + bb.w && player.x + player.w > bb.x &&
          player.y < bb.y + bb.h && player.y + player.h > bb.y) {
        bossBullets.splice(i, 1);
        playerDeath();
        break;
      }
    }

    if (boss && !boss.defeated) {
      if (player.x < boss.x + boss.w && player.x + player.w > boss.x &&
          player.y < boss.y + boss.h && player.y + player.h > boss.y) {
        
        if (player.vy > 0 && player.y + player.h < boss.y + 40) {
          boss.health--;
          boss.hitTimer = 15;
          player.vy = JUMP_FORCE * 0.8;
          
          if (boss.health <= 0) {
            boss.defeated = true;
            goldenKey = {
              x: boss.x + boss.w / 2 - 16,
              y: boss.y,
              w: 32,
              h: 44
            };
          }
        } else if (boss.hitTimer === 0) {
          playerDeath();
        }
      }
    }

    if (goldenKey) {
      if (player.x < goldenKey.x + goldenKey.w && player.x + player.w > goldenKey.x &&
          player.y < goldenKey.y + goldenKey.h && player.y + player.h > goldenKey.y) {
        winGame();
      }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      let bulletHit = false;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (b.x < e.x + e.w && b.x + b.w > e.x &&
            b.y < e.y + e.h && b.y + b.h > e.y) {
          enemies.splice(j, 1);
          bulletHit = true;
          break;
        }
      }

      if (!bulletHit) {
        for (let k = bossBullets.length - 1; k >= 0; k--) {
          const bb = bossBullets[k];
          if (b.x < bb.x + bb.w && b.x + b.w > bb.x &&
              b.y < bb.y + bb.h && b.y + b.h > bb.y) {
            bossBullets.splice(k, 1);
            bulletHit = true;
            break;
          }
        }
      }

      if (!bulletHit && boss && !boss.defeated) {
        if (b.x < boss.x + boss.w && b.x + b.w > boss.x &&
            b.y < boss.y + boss.h && b.y + b.h > boss.y) {
          boss.health--;
          boss.hitTimer = 15;
          bulletHit = true;
          
          if (boss.health <= 0) {
            boss.defeated = true;
            goldenKey = {
              x: boss.x + boss.w / 2 - 16,
              y: boss.y,
              w: 32,
              h: 44
            };
          }
        }
      }

      if (bulletHit) {
        bullets.splice(i, 1);
      }
    }
  }

  function playerDeath() {
    gameActive = false;
    cancelAnimationFrame(gameLoopId);

    gameCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    gameCtx.fillRect(0, 0, GAME_W, GAME_H);

    setTimeout(function () {
      restartGame();
    }, 800);
  }

  function restartGame() {
    score = 0;
    scoreValue.textContent = '0';
    progressBar.style.width = '0%';
    player.x = 100;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = 0;
    cameraX = 0;
    initWorld();
    gameActive = true;
    gameLoop();
  }

  function gameLoop() {
    if (!gameActive) return;

    updatePlayer();
    updateEnemies();
    updateBullets();
    checkCollisions();

    gameCtx.imageSmoothingEnabled = false;
    drawBackground();

    obstacles.forEach(drawObstacle);
    hearts.forEach(drawHeart);
    enemies.forEach(drawEnemy);
    if (boss && !boss.defeated) drawBoss();
    drawBossBullets();
    if (goldenKey) drawGoldenKey();
    drawBullets();
    drawPlayer();

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    startOverlay.classList.add('hidden');
    gameActive = true;
    score = 0;
    scoreValue.textContent = '0';
    progressBar.style.width = '0%';
    player.x = 100;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = 0;
    cameraX = 0;
    initWorld();
    gameLoop();
  }

  function winGame() {
    gameActive = false;
    cancelAnimationFrame(gameLoopId);
    winOverlay.classList.remove('hidden');
    launchConfetti(canvas.width / 2, canvas.height * 0.5, 250);

    setTimeout(function () {
      timelineLock.classList.add('unlocked');
      timelineLock.setAttribute('aria-hidden', 'true');
      timeline.classList.remove('memories-locked');
      memoriesButton.classList.remove('hidden');
      memoriesButton.focus();
      checkTimeline();
    }, reduceMotion ? 0 : 1200);
  }

  memoriesButton.addEventListener('click', function () {
    timeline.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    memoriesTitle.focus({ preventScroll: true });
  });

  gameCanvas.width = GAME_W;
  gameCanvas.height = GAME_H;

  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) > -1) {
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', function (e) {
    keys[e.key] = false;
  });

  var touchLeft = document.getElementById('touch-left');
  var touchRight = document.getElementById('touch-right');
  var touchJump = document.getElementById('touch-jump');
  var touchShoot = document.getElementById('touch-shoot');

  function addTouchEvents(btn, key) {
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      keys[key] = true;
    }, { passive: false });
    btn.addEventListener('touchend', function (e) {
      e.preventDefault();
      keys[key] = false;
    }, { passive: false });
    btn.addEventListener('mousedown', function () { keys[key] = true; });
    btn.addEventListener('mouseup', function () { keys[key] = false; });
    btn.addEventListener('mouseleave', function () { keys[key] = false; });
  }

  addTouchEvents(touchLeft, 'ArrowLeft');
  addTouchEvents(touchRight, 'ArrowRight');
  addTouchEvents(touchJump, ' ');
  addTouchEvents(touchShoot, 'x');

  startBtn.addEventListener('click', startGame);

  const timelineItems = document.querySelectorAll('.timeline-item');

  function checkTimeline() {
    const windowHeight = window.innerHeight;
    timelineItems.forEach(function (item) {
      const rect = item.getBoundingClientRect();
      if (rect.top < windowHeight * 0.85) {
        item.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkTimeline, { passive: true });
  checkTimeline();

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const cardImages = document.querySelectorAll('.card-image');
  let currentLightboxIndex = -1;
  let lastFocusedElement = null;

  function getImageCards() {
    var cards = [];
    cardImages.forEach(function (card) {
      var img = card.querySelector('img');
      if (img) {
        cards.push({
          src: img.src,
          alt: img.alt,
          caption: img.getAttribute('data-caption') || img.alt
        });
      }
    });
    return cards;
  }

  function openLightbox(index) {
    var images = getImageCards();
    if (images.length === 0) return;
    currentLightboxIndex = index;
    lastFocusedElement = document.activeElement;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt;
    lightboxCaption.textContent = images[index].caption;
    lightbox.classList.remove('hidden');
    requestAnimationFrame(function () {
      lightbox.classList.add('active');
      lightboxClose.focus();
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(function () {
      lightbox.classList.add('hidden');
      document.body.style.overflow = 'auto';
      if (lastFocusedElement) lastFocusedElement.focus();
    }, 300);
  }

  function navigateLightbox(direction) {
    var images = getImageCards();
    if (images.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + direction + images.length) % images.length;
    lightboxImg.style.opacity = '0';
    setTimeout(function () {
      lightboxImg.src = images[currentLightboxIndex].src;
      lightboxImg.alt = images[currentLightboxIndex].alt;
      lightboxCaption.textContent = images[currentLightboxIndex].caption;
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  cardImages.forEach(function (card, i) {
    card.addEventListener('click', function () {
      var img = card.querySelector('img');
      if (img) {
        var realIndex = -1;
        var count = -1;
        cardImages.forEach(function (c, j) {
          if (c.querySelector('img')) {
            count++;
            if (c === card) realIndex = count;
          }
        });
        if (realIndex >= 0) openLightbox(realIndex);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
  lightboxNext.addEventListener('click', function () { navigateLightbox(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateLightbox(-1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateLightbox(1);
    }
    if (e.key === 'Tab') {
      var focusable = [lightboxClose, lightboxPrev, lightboxNext];
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  var replayBtn = document.getElementById('replay-btn');
  replayBtn.addEventListener('click', function () {
    launchConfetti(canvas.width / 2, canvas.height * 0.3, 200);
    setTimeout(function () {
      launchFullConfetti();
    }, 300);
  });

  var wishesSection = document.getElementById('wishes');
  var wishesObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        wishesSection.style.opacity = '1';
      }
    });
  }, { threshold: 0.2 });
  wishesObserver.observe(wishesSection);
})();

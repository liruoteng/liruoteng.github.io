(function () {
  'use strict';

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
  let trees = [];
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
    trees = [];
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
      obstacles.push({
        x: 600 + i * 500 + Math.random() * 200,
        y: GROUND_Y - 32,
        w: 48,
        h: 32,
        type: Math.random() > 0.5 ? 'rock' : 'spike'
      });
    }

    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * WORLD_WIDTH,
        y: 60 + Math.random() * 120,
        w: 80 + Math.random() * 80,
        h: 40 + Math.random() * 20
      });
    }

    for (let i = 0; i < 6; i++) {
      mountains.push({
        x: i * 1200 + Math.random() * 400,
        y: GROUND_Y - 160 - Math.random() * 80,
        w: 240 + Math.random() * 160,
        h: 160 + Math.random() * 80
      });
    }

    for (let i = 0; i < 8; i++) {
      enemies.push({
        x: 800 + i * 700 + Math.random() * 200,
        y: GROUND_Y - 40,
        w: 40,
        h: 40,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random()),
        patrolStart: 800 + i * 700 - 100,
        patrolEnd: 800 + i * 700 + 300,
        frame: 0
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

    for (let i = 0; i < 15; i++) {
      trees.push({
        x: 300 + i * 400 + Math.random() * 160,
        y: GROUND_Y - 72 - Math.random() * 30,
        w: 36,
        h: 72 + Math.random() * 30
      });
    }

    for (let i = 0; i < 12; i++) {
      seattleBuildings.push({
        x: i * 160 + Math.random() * 80,
        y: GROUND_Y - 120 - Math.random() * 160,
        w: 80 + Math.random() * 60,
        h: 120 + Math.random() * 160,
        type: i === 3 ? 'spaceNeedle' : 'building'
      });
    }

    boss = null;
    goldenKey = null;
  }

  function drawPixelRect(x, y, w, h, color) {
    gameCtx.fillStyle = color;
    gameCtx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  function randAt(a, b, c) {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return n - Math.floor(n);
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

    if (o.type === 'rock') {
      drawPixelRect(ox + 10, oy + 2, 28, 28, '#6b6b6b');
      drawPixelRect(ox + 6, oy + 10, 36, 20, '#6b6b6b');
      drawPixelRect(ox + 14, oy + 6, 6, 6, '#8b8b8b');
      drawPixelRect(ox + 22, oy + 14, 4, 4, '#7b7b7b');
      drawPixelRect(ox + 12, oy + 8, 2, 2, '#9b9b9b');
    } else {
      drawPixelRect(ox + 22, oy + 2, 4, 28, '#8b8b8b');
      drawPixelRect(ox + 18, oy + 6, 12, 6, '#a0a0a0');
      drawPixelRect(ox + 14, oy + 14, 20, 6, '#8b8b8b');
      drawPixelRect(ox + 10, oy + 22, 28, 8, '#6b6b6b');
      drawPixelRect(ox + 24, oy + 4, 2, 2, '#c0c0c0');
    }
  }

  function drawEnemy(e) {
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

    if (progress < 0.7) {
      const sunOpacity = 1 - (progress / 0.7);
      for (let r = 60; r > 0; r -= 4) {
        const alpha = sunOpacity * (r / 60) * 0.3;
        drawPixelRect(GAME_W - 120 - (60-r)/2, 60 + (60-r)/2, r, r, `rgba(255, 240, 180, ${alpha})`);
      }
      drawPixelRect(GAME_W - 110, 70, 20, 20, `rgba(255, 250, 220, ${sunOpacity})`);
      drawPixelRect(GAME_W - 108, 72, 16, 16, `rgba(255, 255, 240, ${sunOpacity})`);
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Date.now() * 0.0003;
        const rayLen = 25 + Math.sin(Date.now() * 0.002 + i) * 5;
        const rx = GAME_W - 100 + Math.cos(angle) * (35 + rayLen);
        const ry = 80 + Math.sin(angle) * (35 + rayLen);
        drawPixelRect(rx, ry, 2, 8, `rgba(255, 240, 180, ${sunOpacity * 0.4})`);
      }
    }

    clouds.forEach(function (c) {
      const cx = (c.x - cameraX * 0.2) % (WORLD_WIDTH + 200);
      const drawX = cx < -150 ? cx + WORLD_WIDTH + 200 : cx;
      const cloudOpacity = progress < 0.6 ? 0.9 : 0.75;
      
      drawPixelRect(drawX + 20, c.y + 12, c.w - 40, c.h - 12, `rgba(255,255,255,${cloudOpacity * 0.85})`);
      drawPixelRect(drawX + 15, c.y + 8, c.w - 30, c.h - 8, `rgba(255,255,255,${cloudOpacity * 0.9})`);
      drawPixelRect(drawX, c.y, c.w, c.h, `rgba(255,255,255,${cloudOpacity})`);
      drawPixelRect(drawX + 25, c.y - 12, c.w - 50, c.h + 24, `rgba(255,255,255,${cloudOpacity * 0.95})`);
      drawPixelRect(drawX + 35, c.y - 20, c.w - 70, c.h + 36, `rgba(255,255,255,${cloudOpacity * 0.85})`);
      drawPixelRect(drawX + 45, c.y - 24, c.w - 90, c.h + 44, `rgba(255,255,255,${cloudOpacity * 0.7})`);
      
      drawPixelRect(drawX + 8, c.y + 6, c.w - 16, c.h - 6, `rgba(248,248,255,${cloudOpacity * 0.75})`);
      drawPixelRect(drawX + 18, c.y + 2, c.w - 36, c.h - 2, `rgba(252,252,255,${cloudOpacity * 0.8})`);
      drawPixelRect(drawX + 30, c.y - 8, c.w - 60, c.h + 16, `rgba(250,250,255,${cloudOpacity * 0.85})`);
      drawPixelRect(drawX + 40, c.y - 16, c.w - 80, c.h + 32, `rgba(245,245,255,${cloudOpacity * 0.7})`);
    });

    if (progress < 0.5) {
      const birdOpacity = 0.7;
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

    if (progress < 0.8) {
      const mountainOpacity = 1 - (progress / 0.8);
      mountains.forEach(function (m) {
        const mx = Math.floor(m.x - cameraX * 0.4);
        if (mx > -m.w && mx < GAME_W + m.w) {
          gameCtx.fillStyle = `rgba(100,80,180,${mountainOpacity * 0.5})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y);
          gameCtx.lineTo(mx + m.w, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = `rgba(120,100,200,${mountainOpacity * 0.6})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.1, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 12);
          gameCtx.lineTo(mx + m.w * 0.9, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = `rgba(140,120,220,${mountainOpacity * 0.7})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.2, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 20);
          gameCtx.lineTo(mx + m.w * 0.8, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = `rgba(160,140,240,${mountainOpacity * 0.8})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.3, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 28);
          gameCtx.lineTo(mx + m.w * 0.7, GROUND_Y);
          gameCtx.fill();

          if (m.h > 150) {
            drawPixelRect(mx + m.w / 2 - 20, m.y + 4, 40, 24, `rgba(255,255,255,${mountainOpacity})`);
            drawPixelRect(mx + m.w / 2 - 26, m.y + 12, 52, 18, `rgba(250,250,255,${mountainOpacity * 0.95})`);
            drawPixelRect(mx + m.w / 2 - 32, m.y + 20, 64, 14, `rgba(245,245,255,${mountainOpacity * 0.85})`);
            drawPixelRect(mx + m.w / 2 - 38, m.y + 28, 76, 10, `rgba(240,240,250,${mountainOpacity * 0.7})`);
            
            drawPixelRect(mx + m.w / 2 - 12, m.y + 6, 24, 12, `rgba(255,255,255,${mountainOpacity})`);
            drawPixelRect(mx + m.w / 2 - 8, m.y + 8, 16, 8, `rgba(255,255,255,${mountainOpacity})`);
            drawPixelRect(mx + m.w / 2 - 4, m.y + 10, 8, 4, `rgba(255,255,255,${mountainOpacity})`);
            
            for (let s = 0; s < 3; s++) {
              const snowX = mx + m.w / 2 - 15 + s * 10;
              const snowY = m.y + 15 + s * 8;
              drawPixelRect(snowX, snowY, 6, 2, `rgba(255,255,255,${mountainOpacity * 0.6})`);
              drawPixelRect(snowX + 1, snowY + 2, 4, 1, `rgba(250,250,255,${mountainOpacity * 0.5})`);
            }
          }

          for (let i = 0; i < 5; i++) {
            const ridgeX = mx + m.w * (0.2 + i * 0.12);
            const ridgeY = m.y + (GROUND_Y - m.y) * (0.3 + i * 0.1);
            gameCtx.fillStyle = `rgba(80,65,160,${mountainOpacity * 0.3})`;
            gameCtx.beginPath();
            gameCtx.moveTo(ridgeX - 20, ridgeY + 28);
            gameCtx.lineTo(ridgeX, ridgeY);
            gameCtx.lineTo(ridgeX + 20, ridgeY + 28);
            gameCtx.fill();
          }

          for (let i = 0; i < 8; i++) {
            const detailX = mx + m.w * (0.15 + i * 0.08);
            const detailY = m.y + (GROUND_Y - m.y) * (0.4 + i * 0.06);
            drawPixelRect(detailX, detailY, 3, 2, `rgba(90,75,170,${mountainOpacity * 0.25})`);
            drawPixelRect(detailX + 4, detailY + 3, 2, 2, `rgba(90,75,170,${mountainOpacity * 0.2})`);
          }
        }
      });
    }

    if (progress > 0.3) {
      const buildingOpacity = Math.min(1, (progress - 0.3) / 0.4);
      seattleBuildings.forEach(function (b) {
        const bx = Math.floor(b.x - cameraX * 0.15);
        if (bx > -b.w && bx < GAME_W + b.w) {
          if (b.type === 'spaceNeedle') {
            drawPixelRect(bx + 26, b.y, 8, b.h, `rgba(160,160,180,${buildingOpacity})`);
            drawPixelRect(bx + 27, b.y + 2, 6, b.h - 4, `rgba(180,180,200,${buildingOpacity})`);
            drawPixelRect(bx + 10, b.y + 14, 40, 14, `rgba(140,140,160,${buildingOpacity})`);
            drawPixelRect(bx + 12, b.y + 16, 36, 10, `rgba(160,160,180,${buildingOpacity})`);
            drawPixelRect(bx + 16, b.y + 8, 28, 10, `rgba(130,130,150,${buildingOpacity})`);
            drawPixelRect(bx + 18, b.y + 10, 24, 6, `rgba(150,150,170,${buildingOpacity})`);
            drawPixelRect(bx + 22, b.y, 16, 16, `rgba(120,120,140,${buildingOpacity})`);
            drawPixelRect(bx + 24, b.y + 2, 12, 12, `rgba(140,140,160,${buildingOpacity})`);
            drawPixelRect(bx + 28, b.y - 16, 4, 16, `rgba(160,160,180,${buildingOpacity})`);
            drawPixelRect(bx + 29, b.y - 14, 2, 12, `rgba(180,180,200,${buildingOpacity})`);
            
            for (let wy = b.y + 18; wy < b.y + b.h - 8; wy += 10) {
              drawPixelRect(bx + 28, wy, 4, 6, `rgba(255,220,150,${buildingOpacity * 0.8})`);
              drawPixelRect(bx + 29, wy + 1, 2, 4, `rgba(255,240,180,${buildingOpacity * 0.6})`);
            }
            
            drawPixelRect(bx + 24, b.y + 2, 12, 2, `rgba(200,200,220,${buildingOpacity * 0.7})`);
            drawPixelRect(bx + 24, b.y + 20, 12, 2, `rgba(200,200,220,${buildingOpacity * 0.7})`);
          } else {
            drawPixelRect(bx, b.y, b.w, b.h, `rgba(100,110,140,${buildingOpacity})`);
            drawPixelRect(bx + 2, b.y + 2, b.w - 4, b.h - 4, `rgba(120,130,160,${buildingOpacity})`);
            drawPixelRect(bx + 4, b.y + 4, b.w - 8, 4, `rgba(140,150,180,${buildingOpacity * 0.8})`);
            drawPixelRect(bx + 4, b.y + b.h - 8, b.w - 8, 4, `rgba(140,150,180,${buildingOpacity * 0.8})`);
            
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
          }
        }
      });
    }

    if (progress < 0.7) {
      const treeOpacity = 1 - (progress / 0.7);
      drawFenceLine(treeOpacity);
      trees.forEach(function (t) {
        const tx = Math.floor(t.x - cameraX * 0.7);
        if (tx > -t.w && tx < GAME_W + t.w) {
          drawPixelRect(tx + 13, t.y + t.h - 20, 10, 20, `rgba(80,55,30,${treeOpacity})`);
          drawPixelRect(tx + 14, t.y + t.h - 18, 8, 16, `rgba(100,75,50,${treeOpacity * 0.9})`);
          drawPixelRect(tx + 15, t.y + t.h - 16, 6, 12, `rgba(120,90,60,${treeOpacity * 0.8})`);
          
          drawPixelRect(tx + 2, t.y + 6, 32, t.h - 14, `rgba(35,100,50,${treeOpacity})`);
          drawPixelRect(tx + 4, t.y + 8, 28, t.h - 18, `rgba(45,120,60,${treeOpacity * 0.95})`);
          drawPixelRect(tx + 6, t.y + 10, 24, t.h - 22, `rgba(55,140,70,${treeOpacity * 0.9})`);
          
          drawPixelRect(tx + 6, t.y - 6, 24, 14, `rgba(40,110,55,${treeOpacity})`);
          drawPixelRect(tx + 8, t.y - 4, 20, 10, `rgba(50,130,65,${treeOpacity * 0.95})`);
          drawPixelRect(tx + 10, t.y - 2, 16, 6, `rgba(60,150,75,${treeOpacity * 0.9})`);
          
          drawPixelRect(tx + 10, t.y - 16, 16, 12, `rgba(45,120,60,${treeOpacity})`);
          drawPixelRect(tx + 12, t.y - 14, 12, 8, `rgba(55,140,70,${treeOpacity * 0.95})`);
          drawPixelRect(tx + 14, t.y - 12, 8, 4, `rgba(65,160,80,${treeOpacity * 0.9})`);
          
          drawPixelRect(tx + 14, t.y - 22, 8, 8, `rgba(50,130,65,${treeOpacity})`);
          drawPixelRect(tx + 15, t.y - 20, 6, 4, `rgba(60,150,75,${treeOpacity * 0.95})`);
          drawPixelRect(tx + 16, t.y - 18, 4, 2, `rgba(70,170,85,${treeOpacity * 0.9})`);
          
          for (let i = 0; i < 10; i++) {
            const leafX = tx + 4 + randAt(t.x, i, 1) * 28;
            const leafY = t.y - 18 + randAt(t.x, i, 2) * (t.h - 10);
            const leafSize = 2 + Math.floor(randAt(t.x, i, 3) * 3);
            drawPixelRect(leafX, leafY, leafSize, leafSize, `rgba(70,160,80,${treeOpacity * 0.75})`);
          }
          
          for (let i = 0; i < 6; i++) {
            const leafX = tx + 6 + randAt(t.x, i, 4) * 24;
            const leafY = t.y - 14 + randAt(t.x, i, 5) * (t.h - 16);
            drawPixelRect(leafX, leafY, 3, 3, `rgba(80,180,90,${treeOpacity * 0.65})`);
          }
          
          if (randAt(t.x, t.y, 6) > 0.5) {
            drawPixelRect(tx + 6, t.y + 2, 3, 3, `rgba(255,140,180,${treeOpacity * 0.85})`);
            drawPixelRect(tx + 7, t.y + 3, 1, 1, `rgba(255,160,200,${treeOpacity * 0.7})`);
            drawPixelRect(tx + 22, t.y + 6, 3, 3, `rgba(255,140,180,${treeOpacity * 0.85})`);
            drawPixelRect(tx + 23, t.y + 7, 1, 1, `rgba(255,160,200,${treeOpacity * 0.7})`);
            drawPixelRect(tx + 14, t.y - 8, 3, 3, `rgba(255,140,180,${treeOpacity * 0.85})`);
            drawPixelRect(tx + 15, t.y - 7, 1, 1, `rgba(255,160,200,${treeOpacity * 0.7})`);
            drawPixelRect(tx + 10, t.y + 12, 3, 3, `rgba(255,140,180,${treeOpacity * 0.85})`);
            drawPixelRect(tx + 18, t.y + 14, 3, 3, `rgba(255,140,180,${treeOpacity * 0.85})`);
          }
        }
      });
    }

    if (progress < 0.6) {
      const geyserOpacity = 1 - (progress / 0.6);
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

    if (progress < 0.5) {
      const flowerOpacity = 1 - (progress / 0.5);
      for (let i = 0; i < 20; i++) {
        const flowerX = (i * 70 + 15 + Math.sin(i * 2.5) * 20) % GAME_W;
        const flowerY = GROUND_Y - 5 - randAt(i, 8, 1) * 8;
        drawPixelRect(flowerX, flowerY, 2, 8, `rgba(70,120,50,${flowerOpacity})`);
        drawPixelRect(flowerX + 1, flowerY + 1, 1, 6, `rgba(90,140,70,${flowerOpacity * 0.8})`);
        
        drawPixelRect(flowerX - 3, flowerY - 4, 8, 8, `rgba(255,130,180,${flowerOpacity})`);
        drawPixelRect(flowerX - 2, flowerY - 3, 6, 6, `rgba(255,150,200,${flowerOpacity * 0.9})`);
        drawPixelRect(flowerX - 1, flowerY - 2, 4, 4, `rgba(255,170,220,${flowerOpacity * 0.8})`);
        drawPixelRect(flowerX, flowerY - 1, 2, 2, `rgba(255,200,240,${flowerOpacity * 0.7})`);
        drawPixelRect(flowerX, flowerY, 2, 2, `rgba(255,220,100,${flowerOpacity})`);
      }
      
      for (let i = 0; i < 12; i++) {
        const flowerX = (i * 90 + 40 + Math.cos(i * 1.8) * 25) % GAME_W;
        const flowerY = GROUND_Y - 4 - randAt(i, 9, 2) * 6;
        drawPixelRect(flowerX, flowerY, 2, 6, `rgba(70,120,50,${flowerOpacity})`);
        
        drawPixelRect(flowerX - 2, flowerY - 3, 6, 6, `rgba(255,200,100,${flowerOpacity})`);
        drawPixelRect(flowerX - 1, flowerY - 2, 4, 4, `rgba(255,220,120,${flowerOpacity * 0.9})`);
        drawPixelRect(flowerX, flowerY - 1, 2, 2, `rgba(255,240,140,${flowerOpacity * 0.8})`);
        drawPixelRect(flowerX, flowerY, 2, 2, `rgba(255,180,80,${flowerOpacity})`);
      }
      
      for (let i = 0; i < 10; i++) {
        const mushX = (i * 110 + 30 + Math.sin(i * 3.2) * 30) % GAME_W;
        const mushY = GROUND_Y - 3;
        drawPixelRect(mushX, mushY, 2, 6, `rgba(180,160,140,${flowerOpacity * 0.85})`);
        drawPixelRect(mushX + 1, mushY + 1, 1, 4, `rgba(200,180,160,${flowerOpacity * 0.7})`);
        
        drawPixelRect(mushX - 4, mushY - 4, 10, 6, `rgba(255,80,80,${flowerOpacity})`);
        drawPixelRect(mushX - 3, mushY - 3, 8, 4, `rgba(255,100,100,${flowerOpacity * 0.9})`);
        drawPixelRect(mushX - 2, mushY - 2, 6, 2, `rgba(255,120,120,${flowerOpacity * 0.8})`);
        
        drawPixelRect(mushX - 3, mushY - 3, 2, 2, `rgba(255,255,255,${flowerOpacity * 0.7})`);
        drawPixelRect(mushX + 2, mushY - 2, 2, 2, `rgba(255,255,255,${flowerOpacity * 0.7})`);
        drawPixelRect(mushX - 1, mushY - 1, 2, 2, `rgba(255,255,255,${flowerOpacity * 0.6})`);
      }
      
      for (let i = 0; i < 8; i++) {
        const rockX = (i * 130 + 50 + Math.cos(i * 2.1) * 35) % GAME_W;
        const rockY = GROUND_Y - 2 - randAt(i, 10, 3) * 4;
        drawPixelRect(rockX, rockY, 10, 6, `rgba(120,120,130,${flowerOpacity * 0.7})`);
        drawPixelRect(rockX + 1, rockY + 1, 8, 4, `rgba(140,140,150,${flowerOpacity * 0.6})`);
        drawPixelRect(rockX + 2, rockY + 2, 6, 2, `rgba(160,160,170,${flowerOpacity * 0.5})`);
        drawPixelRect(rockX + 1, rockY, 3, 1, `rgba(150,150,160,${flowerOpacity * 0.4})`);
      }
    }

    const groundColor = lerpColor('#3fa632', '#3a9a59', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y, groundColor);
    
    const groundTopColor = lerpColor('#70c846', '#54b874', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, 12, groundTopColor);
    
    const groundMidColor = lerpColor('#42a336', '#3a9a59', progress);
    drawPixelRect(0, GROUND_Y + 12, GAME_W, 8, groundMidColor);
    
    const groundDarkColor = lerpColor('#2e7c24', '#2f7554', progress);
    drawPixelRect(0, GROUND_Y + 20, GAME_W, 10, groundDarkColor);

    for (let i = 0; i < GAME_W; i += 30) {
      const detailColor = lerpColor('#3a7a2a', '#2a6a5a', progress);
      drawPixelRect(i + randAt(i, 11, 1) * 15, GROUND_Y + 22, 12, 6, detailColor);
      drawPixelRect(i + 18 + randAt(i, 12, 2) * 10, GROUND_Y + 30, 8, 4, detailColor);
      drawPixelRect(i + 5 + randAt(i, 13, 3) * 20, GROUND_Y + 36, 6, 3, detailColor);
    }

    for (let i = 0; i < GAME_W; i += 15) {
      const grassColor = lerpColor('#6aaa5a', '#4a9a8a', progress);
      const grassX = i + randAt(i, 14, 1) * 10;
      const grassH = 4 + Math.floor(randAt(i, 15, 2) * 4);
      drawPixelRect(grassX, GROUND_Y - grassH, 2, grassH, grassColor);
      drawPixelRect(grassX + 3, GROUND_Y - grassH + 1, 2, grassH - 1, grassColor);
      drawPixelRect(grassX + 6, GROUND_Y - grassH + 2, 2, grassH - 2, grassColor);
      drawPixelRect(grassX + 1, GROUND_Y - 1, 1, 2, grassColor);
      drawPixelRect(grassX + 4, GROUND_Y - 1, 1, 2, grassColor);
    }

    for (let i = 0; i < GAME_W; i += 40) {
      const cloverX = i + randAt(i, 16, 1) * 25;
      const cloverY = GROUND_Y - 2;
      const cloverColor = lerpColor('#5a9a4a', '#4a8a7a', progress);
      drawPixelRect(cloverX, cloverY, 2, 3, cloverColor);
      drawPixelRect(cloverX - 2, cloverY - 1, 2, 2, cloverColor);
      drawPixelRect(cloverX + 2, cloverY - 1, 2, 2, cloverColor);
      drawPixelRect(cloverX, cloverY - 2, 2, 2, cloverColor);
    }

    drawFarmPath(progress);
    drawCropRows(progress);
    drawFarmhouse(progress);
  }

  function drawFenceLine(opacity) {
    const y = GROUND_Y - 78;
    for (let x = -80 - (cameraX * 0.55 % 80); x < GAME_W + 80; x += 80) {
      drawPixelRect(x, y + 18, 80, 8, `rgba(104,67,36,${opacity})`);
      drawPixelRect(x, y + 42, 80, 8, `rgba(104,67,36,${opacity})`);
      drawPixelRect(x + 6, y, 18, 72, `rgba(92,56,31,${opacity})`);
      drawPixelRect(x + 9, y + 4, 12, 64, `rgba(139,88,45,${opacity})`);
      drawPixelRect(x + 10, y - 8, 10, 12, `rgba(164,104,51,${opacity})`);
      drawPixelRect(x + 12, y + 10, 4, 50, `rgba(199,132,66,${opacity * 0.6})`);
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

  function drawFarmhouse(progress) {
    const opacity = 1 - Math.min(1, Math.abs(progress - 0.18) * 4);
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
      e.x += e.vx;
      if (e.x <= e.patrolStart || e.x >= e.patrolEnd) {
        e.vx = -e.vx;
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
      if (player.x < o.x + o.w && player.x + player.w > o.x &&
          player.y < o.y + o.h && player.y + player.h > o.y) {
        player.x -= player.facing * 20;
        player.vx = -player.facing * 5;
      }
    });

    enemies.forEach(function (e) {
      if (player.x < e.x + e.w && player.x + player.w > e.x &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
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
      checkTimeline();
    }, 1200);
  }

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
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt;
    lightboxCaption.textContent = images[index].caption;
    lightbox.classList.remove('hidden');
    requestAnimationFrame(function () {
      lightbox.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(function () {
      lightbox.classList.add('hidden');
      document.body.style.overflow = 'auto';
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
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
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

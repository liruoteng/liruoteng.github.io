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

  function drawPixelRect(x, y, w, h, color) {
    gameCtx.fillStyle = color;
    gameCtx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  function drawPlayer() {
    const px = Math.floor(player.x - cameraX);
    const py = Math.floor(player.y);
    const f = player.facing;

    drawPixelRect(px + 8, py + 8, 16, 16, '#f4c2a1');
    drawPixelRect(px + 10, py + 10, 12, 12, '#f8d4b8');
    drawPixelRect(px + 6, py + 4, 20, 12, '#8b4513');
    drawPixelRect(px + 8, py + 6, 16, 8, '#a0522d');
    drawPixelRect(px + 10, py + 8, 12, 4, '#8b4513');
    if (f > 0) {
      drawPixelRect(px + 20, py + 12, 8, 18, '#8b4513');
      drawPixelRect(px + 22, py + 14, 4, 14, '#a0522d');
      drawPixelRect(px + 24, py + 16, 2, 10, '#8b4513');
    } else {
      drawPixelRect(px + 4, py + 12, 8, 18, '#8b4513');
      drawPixelRect(px + 6, py + 14, 4, 14, '#a0522d');
      drawPixelRect(px + 6, py + 16, 2, 10, '#8b4513');
    }
    drawPixelRect(px + 12, py + 6, 8, 4, '#ff69b4');
    drawPixelRect(px + 14, py + 8, 4, 2, '#ff8fc4');
    drawPixelRect(px + 15, py + 4, 2, 2, '#ff69b4');

    if (f > 0) {
      drawPixelRect(px + 16, py + 14, 2, 2, '#2c3e50');
      drawPixelRect(px + 17, py + 15, 1, 1, '#fff');
      drawPixelRect(px + 18, py + 20, 2, 1, '#e74c6f');
    } else {
      drawPixelRect(px + 14, py + 14, 2, 2, '#2c3e50');
      drawPixelRect(px + 14, py + 15, 1, 1, '#fff');
      drawPixelRect(px + 12, py + 20, 2, 1, '#e74c6f');
    }

    drawPixelRect(px + 10, py + 26, 12, 22, '#da70d6');
    drawPixelRect(px + 8, py + 30, 16, 14, '#da70d6');
    drawPixelRect(px + 6, py + 44, 20, 4, '#da70d6');
    drawPixelRect(px + 12, py + 28, 8, 2, '#c760c9');
    drawPixelRect(px + 14, py + 32, 4, 2, '#fff');

    if (!player.grounded) {
      drawPixelRect(px + 6, py + 32, 4, 2, '#f4c2a1');
      drawPixelRect(px + 22, py + 32, 4, 2, '#f4c2a1');
    } else if (Math.abs(player.vx) > 0.5) {
      const legOffset = Math.sin(player.frame * 0.3) * 2;
      drawPixelRect(px + 12, py + 48, 4, 10 + legOffset, '#f4c2a1');
      drawPixelRect(px + 16, py + 48, 4, 10 - legOffset, '#f4c2a1');
      drawPixelRect(px + 10, py + 56 + legOffset, 8, 2, '#ff1493');
      drawPixelRect(px + 14, py + 56 - legOffset, 8, 2, '#ff1493');
    } else {
      drawPixelRect(px + 12, py + 48, 4, 10, '#f4c2a1');
      drawPixelRect(px + 16, py + 48, 4, 10, '#f4c2a1');
      drawPixelRect(px + 10, py + 56, 8, 2, '#ff1493');
      drawPixelRect(px + 14, py + 56, 8, 2, '#ff1493');
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

    drawPixelRect(bx + 20, by + 2, 40, 36, flashColor || '#5b6abf');
    drawPixelRect(bx + 16, by + 6, 48, 28, flashColor || '#5b6abf');
    drawPixelRect(bx + 18, by + 8, 44, 24, flashColor || '#6b7acf');
    drawPixelRect(bx + 22, by + 4, 36, 4, flashColor || '#4b5aaf');

    drawPixelRect(bx + 24, by + 14, 12, 12, '#fff');
    drawPixelRect(bx + 44, by + 14, 12, 12, '#fff');
    drawPixelRect(bx + 28, by + 18, 6, 6, '#2c3e50');
    drawPixelRect(bx + 48, by + 18, 6, 6, '#2c3e50');
    drawPixelRect(bx + 30, by + 20, 2, 2, '#fff');
    drawPixelRect(bx + 50, by + 20, 2, 2, '#fff');

    drawPixelRect(bx + 34, by + 28, 12, 3, '#e74c6f');
    drawPixelRect(bx + 36, by + 27, 8, 2, '#ff8fa3');
    drawPixelRect(bx + 38, by + 29, 4, 1, '#fff');

    drawPixelRect(bx + 22, by + 24, 6, 4, '#ffb6c1');
    drawPixelRect(bx + 52, by + 24, 6, 4, '#ffb6c1');

    drawPixelRect(bx + 14, by + 38, 52, 44, flashColor || '#4a5a9f');
    drawPixelRect(bx + 18, by + 42, 44, 36, flashColor || '#5b6abf');
    drawPixelRect(bx + 24, by + 44, 32, 6, '#ffd700');
    drawPixelRect(bx + 28, by + 46, 24, 2, '#ffed4e');
    drawPixelRect(bx + 32, by + 52, 16, 20, '#7f8c8d');
    drawPixelRect(bx + 34, by + 54, 12, 16, '#95a5a6');
    drawPixelRect(bx + 36, by + 56, 8, 12, '#bdc3c7');
    drawPixelRect(bx + 38, by + 58, 4, 8, '#ecf0f1');

    drawPixelRect(bx + 4, by + 42, 14, 36, flashColor || '#5b6abf');
    drawPixelRect(bx + 62, by + 42, 14, 36, flashColor || '#5b6abf');
    drawPixelRect(bx + 6, by + 44, 10, 32, flashColor || '#6b7acf');
    drawPixelRect(bx + 64, by + 44, 10, 32, flashColor || '#6b7acf');
    drawPixelRect(bx + 2, by + 74, 18, 10, flashColor || '#4a5a9f');
    drawPixelRect(bx + 60, by + 74, 18, 10, flashColor || '#4a5a9f');
    drawPixelRect(bx + 4, by + 76, 14, 6, flashColor || '#5b6abf');
    drawPixelRect(bx + 62, by + 76, 14, 6, flashColor || '#5b6abf');

    const legOffset = Math.sin(boss.frame * 0.15) * 4;
    drawPixelRect(bx + 22, by + 82, 14, 18 + legOffset, flashColor || '#4a5a9f');
    drawPixelRect(bx + 44, by + 82, 14, 18 - legOffset, flashColor || '#4a5a9f');
    drawPixelRect(bx + 24, by + 84, 10, 14 + legOffset, flashColor || '#5b6abf');
    drawPixelRect(bx + 46, by + 84, 10, 14 - legOffset, flashColor || '#5b6abf');
    drawPixelRect(bx + 18, by + 96 + legOffset, 22, 6, '#3a4a8f');
    drawPixelRect(bx + 40, by + 96 - legOffset, 22, 6, '#3a4a8f');
    drawPixelRect(bx + 20, by + 98 + legOffset, 18, 3, '#2a3a7f');
    drawPixelRect(bx + 42, by + 98 - legOffset, 18, 3, '#2a3a7f');

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
      skyGrad.addColorStop(0, lerpColor('#ff9a56', '#4a90e2', t));
      skyGrad.addColorStop(0.4, lerpColor('#ffcc80', '#87ceeb', t));
      skyGrad.addColorStop(0.8, lerpColor('#ffe8c0', '#b0e0e6', t));
      skyGrad.addColorStop(1, lerpColor('#fff4e0', '#e0f2f7', t));
    } else {
      const t = (progress - 0.5) * 2;
      skyGrad.addColorStop(0, lerpColor('#4a90e2', '#2c5f7d', t));
      skyGrad.addColorStop(0.4, lerpColor('#87ceeb', '#5a9fbf', t));
      skyGrad.addColorStop(0.8, lerpColor('#b0e0e6', '#7fb3d3', t));
      skyGrad.addColorStop(1, lerpColor('#e0f2f7', '#a8c8d8', t));
    }
    gameCtx.fillStyle = skyGrad;
    gameCtx.fillRect(0, 0, GAME_W, GAME_H);

    if (progress < 0.7) {
      const sunOpacity = 1 - (progress / 0.7);
      drawPixelRect(GAME_W - 120, 60, 60, 60, `rgba(255, 244, 192, ${sunOpacity})`);
      drawPixelRect(GAME_W - 126, 66, 72, 48, `rgba(255, 232, 160, ${sunOpacity * 0.8})`);
    }

    clouds.forEach(function (c) {
      const cx = (c.x - cameraX * 0.2) % (WORLD_WIDTH + 200);
      const drawX = cx < -150 ? cx + WORLD_WIDTH + 200 : cx;
      const cloudOpacity = progress < 0.6 ? 0.6 : 0.4;
      drawPixelRect(drawX, c.y, c.w, c.h, `rgba(255,255,255,${cloudOpacity})`);
      drawPixelRect(drawX + 15, c.y - 8, c.w - 30, c.h + 16, `rgba(255,255,255,${cloudOpacity * 0.8})`);
    });

    if (progress > 0.3) {
      const buildingOpacity = Math.min(1, (progress - 0.3) / 0.4);
      seattleBuildings.forEach(function (b) {
        const bx = Math.floor(b.x - cameraX * 0.15);
        if (bx > -b.w && bx < GAME_W + b.w) {
          if (b.type === 'spaceNeedle') {
            drawPixelRect(bx + 27, b.y, 6, b.h, `rgba(85,85,85,${buildingOpacity})`);
            drawPixelRect(bx + 12, b.y + 15, 36, 12, `rgba(102,102,102,${buildingOpacity})`);
            drawPixelRect(bx + 18, b.y + 9, 24, 9, `rgba(119,119,119,${buildingOpacity})`);
            drawPixelRect(bx + 24, b.y, 12, 18, `rgba(136,136,136,${buildingOpacity})`);
            drawPixelRect(bx + 28, b.y - 12, 3, 12, `rgba(85,85,85,${buildingOpacity})`);
          } else {
            drawPixelRect(bx, b.y, b.w, b.h, `rgba(74,85,104,${buildingOpacity})`);
            drawPixelRect(bx + 2, b.y + 2, b.w - 4, b.h - 4, `rgba(90,101,120,${buildingOpacity})`);
            for (let wy = b.y + 12; wy < b.y + b.h - 12; wy += 18) {
              for (let wx = bx + 9; wx < bx + b.w - 9; wx += 15) {
                drawPixelRect(wx, wy, 6, 9, `rgba(255,215,0,${buildingOpacity * 0.8})`);
              }
            }
          }
        }
      });
    }

    if (progress < 0.8) {
      const mountainOpacity = 1 - (progress / 0.8);
      mountains.forEach(function (m) {
        const mx = Math.floor(m.x - cameraX * 0.4);
        if (mx > -m.w && mx < GAME_W + m.w) {
          gameCtx.fillStyle = `rgba(107,122,94,${mountainOpacity})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y);
          gameCtx.lineTo(mx + m.w, GROUND_Y);
          gameCtx.fill();

          gameCtx.fillStyle = `rgba(139,154,126,${mountainOpacity})`;
          gameCtx.beginPath();
          gameCtx.moveTo(mx + m.w * 0.35, GROUND_Y);
          gameCtx.lineTo(mx + m.w / 2, m.y + 15);
          gameCtx.lineTo(mx + m.w * 0.65, GROUND_Y);
          gameCtx.fill();

          if (m.h > 150) {
            drawPixelRect(mx + m.w / 2 - 12, m.y + 8, 24, 18, `rgba(255,255,255,${mountainOpacity})`);
            drawPixelRect(mx + m.w / 2 - 18, m.y + 15, 36, 12, `rgba(240,240,240,${mountainOpacity})`);
          }
        }
      });
    }

    if (progress < 0.7) {
      const treeOpacity = 1 - (progress / 0.7);
      trees.forEach(function (t) {
        const tx = Math.floor(t.x - cameraX * 0.7);
        if (tx > -t.w && tx < GAME_W + t.w) {
          drawPixelRect(tx + 15, t.y + t.h - 24, 6, 24, `rgba(74,55,40,${treeOpacity})`);
          drawPixelRect(tx + 6, t.y, 24, t.h - 18, `rgba(45,80,22,${treeOpacity})`);
          drawPixelRect(tx + 9, t.y - 12, 18, 18, `rgba(58,107,31,${treeOpacity})`);
          drawPixelRect(tx + 12, t.y - 21, 12, 12, `rgba(74,123,47,${treeOpacity})`);
        }
      });
    }

    if (progress < 0.6) {
      const geyserOpacity = 1 - (progress / 0.6);
      geysers.forEach(function (g) {
        const gx = Math.floor(g.x - cameraX);
        if (gx > -g.w && gx < GAME_W + g.w) {
          drawPixelRect(gx, g.y - 12, g.w, 12, `rgba(212,197,160,${geyserOpacity})`);
          drawPixelRect(gx + 6, g.y - 18, g.w - 12, 6, `rgba(196,181,144,${geyserOpacity})`);
          drawPixelRect(gx + 12, g.y - 9, g.w - 24, 6, `rgba(79,195,247,${geyserOpacity})`);
          drawPixelRect(gx + 15, g.y - 12, g.w - 30, 6, `rgba(129,212,250,${geyserOpacity})`);

          g.steamFrame++;
          const steamOffset = Math.sin(g.steamFrame * 0.05) * 6;
          drawPixelRect(gx + 18, g.y - 45 - steamOffset, 12, 18, `rgba(255,255,255,${0.7 * geyserOpacity})`);
          drawPixelRect(gx + 15, g.y - 60 - steamOffset, 18, 12, `rgba(255,255,255,${0.5 * geyserOpacity})`);
          drawPixelRect(gx + 12, g.y - 72 - steamOffset, 24, 9, `rgba(255,255,255,${0.3 * geyserOpacity})`);
        }
      });
    }

    const groundColor = lerpColor('#8b7355', '#5a6a7a', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y, groundColor);
    
    const groundTopColor = lerpColor('#a0826d', '#6a7a8a', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, 9, groundTopColor);
    
    const groundMidColor = lerpColor('#9b7255', '#5a6a7a', progress);
    drawPixelRect(0, GROUND_Y + 9, GAME_W, 6, groundMidColor);

    for (let i = 0; i < GAME_W; i += 60) {
      const detailColor = lerpColor('#7a6245', '#4a5a6a', progress);
      drawPixelRect(i + Math.random() * 30, GROUND_Y + 15, 12, 6, detailColor);
    }
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

    if (boss && !boss.defeated) {
      boss.x += boss.vx;
      if (boss.x <= boss.patrolStart || boss.x >= boss.patrolEnd) {
        boss.vx = -boss.vx;
      }
      boss.frame++;
      if (boss.hitTimer > 0) boss.hitTimer--;
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
    if (boss) drawBoss();
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

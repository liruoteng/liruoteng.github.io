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

  const GAME_W = 640;
  const GAME_H = 360;
  const GROUND_Y = 280;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 3;
  const WORLD_WIDTH = 3200;

  let cameraX = 0;
  let keys = {};

  const player = {
    x: 50,
    y: GROUND_Y - 32,
    w: 16,
    h: 32,
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
        x: 200 + i * 280 + Math.random() * 100,
        y: GROUND_Y - 60 - Math.random() * 80,
        w: 16,
        h: 16,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 12; i++) {
      obstacles.push({
        x: 300 + i * 250 + Math.random() * 100,
        y: GROUND_Y - 16,
        w: 24,
        h: 16,
        type: Math.random() > 0.5 ? 'rock' : 'spike'
      });
    }

    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * WORLD_WIDTH,
        y: 30 + Math.random() * 60,
        w: 40 + Math.random() * 40,
        h: 20 + Math.random() * 10
      });
    }

    for (let i = 0; i < 6; i++) {
      mountains.push({
        x: i * 600 + Math.random() * 200,
        y: GROUND_Y - 80 - Math.random() * 40,
        w: 120 + Math.random() * 80,
        h: 80 + Math.random() * 40
      });
    }

    for (let i = 0; i < 8; i++) {
      enemies.push({
        x: 400 + i * 350 + Math.random() * 100,
        y: GROUND_Y - 20,
        w: 20,
        h: 20,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()),
        patrolStart: 400 + i * 350 - 50,
        patrolEnd: 400 + i * 350 + 150,
        frame: 0
      });
    }

    for (let i = 0; i < 5; i++) {
      geysers.push({
        x: 500 + i * 600 + Math.random() * 200,
        y: GROUND_Y,
        w: 32,
        h: 40,
        steamFrame: 0
      });
    }

    for (let i = 0; i < 15; i++) {
      trees.push({
        x: 150 + i * 200 + Math.random() * 80,
        y: GROUND_Y - 48 - Math.random() * 20,
        w: 24,
        h: 48 + Math.random() * 20
      });
    }

    for (let i = 0; i < 12; i++) {
      seattleBuildings.push({
        x: i * 80 + Math.random() * 40,
        y: GROUND_Y - 60 - Math.random() * 80,
        w: 40 + Math.random() * 30,
        h: 60 + Math.random() * 80,
        type: i === 3 ? 'spaceNeedle' : 'building'
      });
    }

    boss = {
      x: WORLD_WIDTH - 300,
      y: GROUND_Y - 48,
      w: 40,
      h: 48,
      vx: 2,
      health: 3,
      maxHealth: 3,
      patrolStart: WORLD_WIDTH - 400,
      patrolEnd: WORLD_WIDTH - 150,
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

    drawPixelRect(px + 2, py + 2, 12, 10, '#f4c2a1');
    drawPixelRect(px + 1, py, 14, 8, '#8b4513');
    if (f > 0) {
      drawPixelRect(px + 12, py + 4, 6, 12, '#8b4513');
    } else {
      drawPixelRect(px - 2, py + 4, 6, 12, '#8b4513');
    }
    drawPixelRect(px + 4, py + 1, 8, 4, '#ff69b4');

    if (f > 0) {
      drawPixelRect(px + 9, py + 5, 2, 2, '#000');
      drawPixelRect(px + 10, py + 8, 3, 1, '#ff69b4');
    } else {
      drawPixelRect(px + 5, py + 5, 2, 2, '#000');
      drawPixelRect(px + 3, py + 8, 3, 1, '#ff69b4');
    }

    drawPixelRect(px + 3, py + 12, 10, 14, '#da70d6');
    drawPixelRect(px + 2, py + 14, 12, 10, '#da70d6');
    drawPixelRect(px + 1, py + 22, 14, 4, '#da70d6');

    if (!player.grounded) {
      drawPixelRect(px + 1, py + 14, 3, 2, '#f4c2a1');
      drawPixelRect(px + 12, py + 14, 3, 2, '#f4c2a1');
    } else if (Math.abs(player.vx) > 0.5) {
      const legOffset = Math.sin(player.frame * 0.3) * 2;
      drawPixelRect(px + 4, py + 26, 3, 6 + legOffset, '#f4c2a1');
      drawPixelRect(px + 9, py + 26, 3, 6 - legOffset, '#f4c2a1');
      drawPixelRect(px + 3, py + 30 + legOffset, 5, 2, '#ff1493');
      drawPixelRect(px + 8, py + 30 - legOffset, 5, 2, '#ff1493');
    } else {
      drawPixelRect(px + 4, py + 26, 3, 6, '#f4c2a1');
      drawPixelRect(px + 9, py + 26, 3, 6, '#f4c2a1');
      drawPixelRect(px + 3, py + 30, 5, 2, '#ff1493');
      drawPixelRect(px + 8, py + 30, 5, 2, '#ff1493');
    }
  }

  function drawHeart(h) {
    if (h.collected) return;
    const hx = Math.floor(h.x - cameraX);
    const hy = Math.floor(h.y + Math.sin(Date.now() * 0.003 + h.bobOffset) * 4);

    drawPixelRect(hx + 4, hy, 8, 4, '#e74c6f');
    drawPixelRect(hx + 2, hy + 2, 12, 4, '#e74c6f');
    drawPixelRect(hx, hy + 4, 16, 4, '#e74c6f');
    drawPixelRect(hx + 2, hy + 8, 12, 4, '#e74c6f');
    drawPixelRect(hx + 4, hy + 12, 8, 2, '#e74c6f');
    drawPixelRect(hx + 6, hy + 14, 4, 2, '#e74c6f');

    drawPixelRect(hx + 4, hy + 2, 3, 3, '#ff8fa3');
  }

  function drawObstacle(o) {
    const ox = Math.floor(o.x - cameraX);
    const oy = Math.floor(o.y);

    if (o.type === 'rock') {
      drawPixelRect(ox + 4, oy, 16, 16, '#6b6b6b');
      drawPixelRect(ox + 2, oy + 4, 20, 12, '#6b6b6b');
      drawPixelRect(ox + 6, oy + 2, 4, 4, '#8b8b8b');
    } else {
      drawPixelRect(ox + 10, oy, 4, 16, '#8b8b8b');
      drawPixelRect(ox + 8, oy + 2, 8, 4, '#a0a0a0');
      drawPixelRect(ox + 6, oy + 6, 12, 4, '#8b8b8b');
      drawPixelRect(ox + 4, oy + 10, 16, 6, '#6b6b6b');
    }
  }

  function drawEnemy(e) {
    const ex = Math.floor(e.x - cameraX);
    const ey = Math.floor(e.y);
    const f = e.vx > 0 ? 1 : -1;

    drawPixelRect(ex + 4, ey, 12, 12, '#8b0000');
    drawPixelRect(ex + 2, ey + 12, 16, 8, '#8b0000');
    drawPixelRect(ex + 6, ey + 2, 3, 3, '#ffff00');
    drawPixelRect(ex + 11, ey + 2, 3, 3, '#ffff00');
    drawPixelRect(ex + 7, ey + 7, 6, 2, '#000');

    if (f > 0) {
      drawPixelRect(ex + 14, ey + 4, 4, 2, '#8b0000');
    } else {
      drawPixelRect(ex + 2, ey + 4, 4, 2, '#8b0000');
    }

    const legOffset = Math.sin(e.frame * 0.2) * 2;
    drawPixelRect(ex + 4, ey + 18, 4, 4 + legOffset, '#6b0000');
    drawPixelRect(ex + 12, ey + 18, 4, 4 - legOffset, '#6b0000');
  }

  function drawBoss() {
    if (!boss || boss.defeated) return;
    const bx = Math.floor(boss.x - cameraX);
    const by = Math.floor(boss.y);
    const f = boss.vx > 0 ? 1 : -1;

    const flashColor = boss.hitTimer > 0 ? '#fff' : null;

    drawPixelRect(bx + 8, by, 24, 16, flashColor || '#2c3e50');
    drawPixelRect(bx + 6, by + 2, 28, 12, flashColor || '#34495e');
    drawPixelRect(bx + 10, by + 4, 6, 6, flashColor || '#e74c3c');
    drawPixelRect(bx + 24, by + 4, 6, 6, flashColor || '#e74c3c');
    drawPixelRect(bx + 12, by + 5, 2, 2, '#fff');
    drawPixelRect(bx + 26, by + 5, 2, 2, '#fff');
    drawPixelRect(bx + 14, by + 10, 12, 3, '#000');
    drawPixelRect(bx + 16, by + 11, 2, 2, '#fff');
    drawPixelRect(bx + 22, by + 11, 2, 2, '#fff');

    drawPixelRect(bx + 4, by + 16, 32, 20, flashColor || '#1a252f');
    drawPixelRect(bx + 8, by + 18, 24, 16, flashColor || '#2c3e50');
    drawPixelRect(bx + 12, by + 20, 16, 4, '#c0392b');
    drawPixelRect(bx + 16, by + 24, 8, 8, '#7f8c8d');

    drawPixelRect(bx, by + 18, 8, 16, flashColor || '#2c3e50');
    drawPixelRect(bx + 32, by + 18, 8, 16, flashColor || '#2c3e50');
    drawPixelRect(bx - 2, by + 32, 10, 6, flashColor || '#34495e');
    drawPixelRect(bx + 32, by + 32, 10, 6, flashColor || '#34495e');

    const legOffset = Math.sin(boss.frame * 0.15) * 3;
    drawPixelRect(bx + 8, by + 36, 8, 12 + legOffset, flashColor || '#1a252f');
    drawPixelRect(bx + 24, by + 36, 8, 12 - legOffset, flashColor || '#1a252f');
    drawPixelRect(bx + 6, by + 46 + legOffset, 12, 4, '#000');
    drawPixelRect(bx + 22, by + 46 - legOffset, 12, 4, '#000');

    const healthBarWidth = 40;
    const healthPercent = boss.health / boss.maxHealth;
    drawPixelRect(bx, by - 12, healthBarWidth, 6, '#000');
    drawPixelRect(bx + 1, by - 11, healthBarWidth - 2, 4, '#333');
    drawPixelRect(bx + 1, by - 11, (healthBarWidth - 2) * healthPercent, 4, '#e74c3c');
  }

  function drawGoldenKey() {
    if (!goldenKey) return;
    const kx = Math.floor(goldenKey.x - cameraX);
    const ky = Math.floor(goldenKey.y + Math.sin(Date.now() * 0.004) * 3);

    drawPixelRect(kx + 4, ky, 8, 12, '#ffd700');
    drawPixelRect(kx + 2, ky + 2, 12, 8, '#ffd700');
    drawPixelRect(kx + 4, ky + 4, 8, 4, '#ffed4e');
    drawPixelRect(kx + 6, ky + 12, 4, 10, '#ffd700');
    drawPixelRect(kx + 4, ky + 18, 8, 2, '#ffd700');
    drawPixelRect(kx + 4, ky + 14, 2, 2, '#ffd700');

    drawPixelRect(kx + 5, ky + 3, 2, 2, '#fff');
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
      drawPixelRect(GAME_W - 80, 40, 40, 40, `rgba(255, 244, 192, ${sunOpacity})`);
      drawPixelRect(GAME_W - 84, 44, 48, 32, `rgba(255, 232, 160, ${sunOpacity * 0.8})`);
    }

    clouds.forEach(function (c) {
      const cx = (c.x - cameraX * 0.2) % (WORLD_WIDTH + 200);
      const drawX = cx < -100 ? cx + WORLD_WIDTH + 200 : cx;
      const cloudOpacity = progress < 0.6 ? 0.6 : 0.4;
      drawPixelRect(drawX, c.y, c.w, c.h, `rgba(255,255,255,${cloudOpacity})`);
      drawPixelRect(drawX + 10, c.y - 5, c.w - 20, c.h + 10, `rgba(255,255,255,${cloudOpacity * 0.8})`);
    });

    if (progress > 0.3) {
      const buildingOpacity = Math.min(1, (progress - 0.3) / 0.4);
      seattleBuildings.forEach(function (b) {
        const bx = Math.floor(b.x - cameraX * 0.15);
        if (bx > -b.w && bx < GAME_W + b.w) {
          if (b.type === 'spaceNeedle') {
            drawPixelRect(bx + 18, b.y, 4, b.h, `rgba(85,85,85,${buildingOpacity})`);
            drawPixelRect(bx + 8, b.y + 10, 24, 8, `rgba(102,102,102,${buildingOpacity})`);
            drawPixelRect(bx + 12, b.y + 6, 16, 6, `rgba(119,119,119,${buildingOpacity})`);
            drawPixelRect(bx + 16, b.y, 8, 12, `rgba(136,136,136,${buildingOpacity})`);
            drawPixelRect(bx + 19, b.y - 8, 2, 8, `rgba(85,85,85,${buildingOpacity})`);
          } else {
            drawPixelRect(bx, b.y, b.w, b.h, `rgba(74,85,104,${buildingOpacity})`);
            drawPixelRect(bx + 2, b.y + 2, b.w - 4, b.h - 4, `rgba(90,101,120,${buildingOpacity})`);
            for (let wy = b.y + 8; wy < b.y + b.h - 8; wy += 12) {
              for (let wx = bx + 6; wx < bx + b.w - 6; wx += 10) {
                drawPixelRect(wx, wy, 4, 6, `rgba(255,215,0,${buildingOpacity * 0.8})`);
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

          if (m.h > 100) {
            drawPixelRect(mx + m.w / 2 - 8, m.y + 5, 16, 12, `rgba(255,255,255,${mountainOpacity})`);
            drawPixelRect(mx + m.w / 2 - 12, m.y + 10, 24, 8, `rgba(240,240,240,${mountainOpacity})`);
          }
        }
      });
    }

    if (progress < 0.7) {
      const treeOpacity = 1 - (progress / 0.7);
      trees.forEach(function (t) {
        const tx = Math.floor(t.x - cameraX * 0.7);
        if (tx > -t.w && tx < GAME_W + t.w) {
          drawPixelRect(tx + 10, t.y + t.h - 16, 4, 16, `rgba(74,55,40,${treeOpacity})`);
          drawPixelRect(tx + 4, t.y, 16, t.h - 12, `rgba(45,80,22,${treeOpacity})`);
          drawPixelRect(tx + 6, t.y - 8, 12, 12, `rgba(58,107,31,${treeOpacity})`);
          drawPixelRect(tx + 8, t.y - 14, 8, 8, `rgba(74,123,47,${treeOpacity})`);
        }
      });
    }

    if (progress < 0.6) {
      const geyserOpacity = 1 - (progress / 0.6);
      geysers.forEach(function (g) {
        const gx = Math.floor(g.x - cameraX);
        if (gx > -g.w && gx < GAME_W + g.w) {
          drawPixelRect(gx, g.y - 8, g.w, 8, `rgba(212,197,160,${geyserOpacity})`);
          drawPixelRect(gx + 4, g.y - 12, g.w - 8, 4, `rgba(196,181,144,${geyserOpacity})`);
          drawPixelRect(gx + 8, g.y - 6, g.w - 16, 4, `rgba(79,195,247,${geyserOpacity})`);
          drawPixelRect(gx + 10, g.y - 8, g.w - 20, 4, `rgba(129,212,250,${geyserOpacity})`);

          g.steamFrame++;
          const steamOffset = Math.sin(g.steamFrame * 0.05) * 4;
          drawPixelRect(gx + 12, g.y - 30 - steamOffset, 8, 12, `rgba(255,255,255,${0.7 * geyserOpacity})`);
          drawPixelRect(gx + 10, g.y - 40 - steamOffset, 12, 8, `rgba(255,255,255,${0.5 * geyserOpacity})`);
          drawPixelRect(gx + 8, g.y - 48 - steamOffset, 16, 6, `rgba(255,255,255,${0.3 * geyserOpacity})`);
        }
      });
    }

    const groundColor = lerpColor('#8b7355', '#5a6a7a', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y, groundColor);
    
    const groundTopColor = lerpColor('#a0826d', '#6a7a8a', progress);
    drawPixelRect(0, GROUND_Y, GAME_W, 6, groundTopColor);
    
    const groundMidColor = lerpColor('#9b7255', '#5a6a7a', progress);
    drawPixelRect(0, GROUND_Y + 6, GAME_W, 4, groundMidColor);

    for (let i = 0; i < GAME_W; i += 40) {
      const detailColor = lerpColor('#7a6245', '#4a5a6a', progress);
      drawPixelRect(i + Math.random() * 20, GROUND_Y + 10, 8, 4, detailColor);
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
      x: player.x + (player.facing > 0 ? player.w : -8),
      y: player.y + player.h / 2 - 3,
      w: 8,
      h: 6,
      vx: player.facing * 8,
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
      drawPixelRect(bx, by, b.w, b.h, '#ff69b4');
      drawPixelRect(bx + 2, by + 2, b.w - 4, b.h - 4, '#ffb6c1');
      if (b.vx > 0) {
        drawPixelRect(bx + b.w - 2, by + 1, 3, 4, '#fff');
      } else {
        drawPixelRect(bx - 1, by + 1, 3, 4, '#fff');
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
        
        if (player.vy > 0 && player.y + player.h < boss.y + 20) {
          boss.health--;
          boss.hitTimer = 15;
          player.vy = JUMP_FORCE * 0.8;
          
          if (boss.health <= 0) {
            boss.defeated = true;
            goldenKey = {
              x: boss.x + boss.w / 2 - 8,
              y: boss.y,
              w: 16,
              h: 22
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
              x: boss.x + boss.w / 2 - 8,
              y: boss.y,
              w: 16,
              h: 22
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
    player.x = 50;
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
    player.x = 50;
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

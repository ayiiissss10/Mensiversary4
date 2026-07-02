const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const hud = document.getElementById('hud');

// ---- Game state ----
let state = 'menu'; // menu | ready | playing | win | dead
let frame = 0;

const bird = {
  x: 70,
  y: H/2,
  w: 28,
  h: 22,
  vy: 0,
  gravity: 0.22,
  flapPower: -5.6,
  rotation: 0
};

const GROUND_H = 60;
const PIPE_GAP = 150;
const PIPE_W = 56;
const PIPE_SPEED = 2.4;
let pipes = [];
let pipeTimer = 0;

let hearts = []; // floating hearts to collect
let heartsCollected = 0;
const HEARTS_NEEDED = 4;

let bgOffset = 0;
let groundOffset = 0;

// ---- Colors (Flappy Bird classic palette) ----
const SKY_TOP = '#4ec0ca';
const SKY_BOTTOM = '#a8e6e0';
const PIPE_GREEN = '#73c54b';
const PIPE_GREEN_DARK = '#4a9c2e';
const GROUND_COLOR = '#ded895';
const GROUND_DARK = '#c8b94f';

function resetGame() {
  bird.y = H/2;
  bird.vy = 0;
  bird.rotation = 0;
  pipes = [];
  hearts = [];
  pipeTimer = 0;
  heartsCollected = 0;
  frame = 0;
  spawnPipe();
}

function spawnPipe() {
  const minTop = 40;
  const maxTop = H - GROUND_H - PIPE_GAP - 40;
  const topH = Math.random() * (maxTop - minTop) + minTop;
  const pipe = {
    x: W + 10,
    topH: topH,
    bottomY: topH + PIPE_GAP,
    passed: false
  };
  pipes.push(pipe);

  // place a heart in this pipe's gap if we still need more hearts
  if (heartsCollected + hearts.length < HEARTS_NEEDED) {
    spawnHeart(pipe);
  }
}

function spawnHeart(pipe) {
  // place heart in the middle of this pipe's gap, slightly offset so it lines up after the pipe enters
  const gapCenterY = (pipe.topH + pipe.bottomY) / 2;
  hearts.push({
    x: pipe.x + PIPE_W/2 - 11,
    y: gapCenterY - 10,
    w: 22,
    h: 20,
    bobPhase: Math.random() * Math.PI * 2,
    collected: false
  });
}

function flap() {
  if (state === 'ready') {
    // first tap after pressing "MULAI": actually start gravity now
    state = 'playing';
    bird.vy = bird.flapPower;
    return;
  }
  if (state === 'playing') {
    bird.vy = bird.flapPower;
  }
  if (state === 'dead' || state === 'win') {
    // ignore, must press button
  }
}

function prepareGame() {
  resetGame();
  state = 'ready';
  overlay.style.display = 'none';
  renderHud();
  render();
}

function endGame(win) {
  state = win ? 'win' : 'dead';
  overlay.style.display = 'flex';
  overlay.innerHTML = '';

  if (win) {
    showWinText();
    return;
  }

  const h1 = document.createElement('h1');
  h1.textContent = 'GAME OVER';
  h1.style.color = '#ff6b6b';
  const p1 = document.createElement('p');
  p1.textContent = `Hati terkumpul: ${heartsCollected} / ${HEARTS_NEEDED}`;
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'MAIN LAGI';
  btn.onclick = prepareGame;
  overlay.appendChild(h1);
  overlay.appendChild(p1);
  overlay.appendChild(btn);
  overlay.style.display = 'flex';
}

const LOVE_LETTER_TEXT = `hai sayangku,

Aku ga pandai ngerangkai kata kata, akupun kurang bisa menyampaikan perasaanku yang sebenarnya, tapi sayang sejak ada kamu semuanya terasa lebih indah, semuanya terasa lebih menyenangkan dan lebih ringan, terima kasih ya sayangku, aku sangat sangat beruntung dan bersyukur punya kamu di dalam hidupku, aku senang bisa milikin kamu di dalam hidup aku sayang.

Terima kasih sudah menjadi alasan aku tersenyum di hari-hari yang ringan dan berat ya sayangg, dan menjadi tempat pulang paling nyaman di antara semua kekacauan. Kamu selalu bikin aku merasa aman, nyaman, dan selalu dicintai. Aku sayang banget sama kamu, aku cinta banget sama kamu, aku ga tau gimana caranya kalau harus hidup tanpa kamu nantinya, aku ga mau hidup tanpa kamu, aku mau selalu ada buat kamu, aku mau selalu nemenin kamu, aku mau selalu bikin kamu bahagia, aku mau selalu bikin kamu tersenyum, aku mau selalu bikin kamu ngerasa dicintai sepenuh hati aku, aku gamau kehilangan kamu, aku ga mau ngelepasin kamu.

Maaf ya sayang kalau selama sama aku banyak kurangnya, mungkin kamu selalu ngerasa kesal, bete, marah sama aku, aku minta maaf ya sayang. Aku janji aku bakal selalu berusaha jadi yang terbaik buat kamu, aku bakal selalu mengusahakan apapun buat kamu sayang, aku bakal memperbaiki semua kesalahan aku, aku gamau kamu ngerasa kurang sedikitpun sayang.

Aku sayang banget sama kamu sayang, aku selalu sayang sama kamu, aku selalu cinta sama kamu, jangan pernah ragu sama perasaan aku ya sayang, i love u so much, i really love u more than anything in this world, i love u more than my own life, i love u to the moon and back.

Selamat tanggal 3 yang ke-empat kesayanganku, 

Dariku yang selalu mencintaimu`;

function showWinText() {
  overlay.innerHTML = '';

  const h1 = document.createElement('h1');
  h1.textContent = 'KAMU MENANG!';
  h1.style.color = '#69db7c';

  const p1 = document.createElement('p');
  p1.textContent = 'Semua 4 hati berhasil terkumpul!';

  overlay.appendChild(h1);
  overlay.appendChild(p1);

  setTimeout(showGiftBox, 1400);
}

function showGiftBox() {
  overlay.innerHTML = '';

  const giftBox = document.createElement('div');
  giftBox.id = 'envelope';
  giftBox.innerHTML = `
    <svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="55" width="120" height="78" rx="4" fill="#ff8fa3" stroke="#e64980" stroke-width="3"/>
      <rect x="20" y="55" width="120" height="20" fill="#ff6b8a" stroke="#e64980" stroke-width="3"/>
      <rect x="70" y="55" width="20" height="78" fill="#fff5f5" stroke="#e64980" stroke-width="2"/>
      <path d="M70 55 C70 30 50 20 45 32 C42 40 55 50 70 55 Z" fill="#fff5f5" stroke="#e64980" stroke-width="3" stroke-linejoin="round"/>
      <path d="M90 55 C90 30 110 20 115 32 C118 40 105 50 90 55 Z" fill="#fff5f5" stroke="#e64980" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="80" cy="50" r="9" fill="#fff5f5" stroke="#e64980" stroke-width="3"/>
    </svg>
  `;

  const hint = document.createElement('p');
  hint.id = 'envelopeHint';
  hint.textContent = 'Silahkan mengambil hadiahnya';

  overlay.appendChild(giftBox);
  overlay.appendChild(hint);

  giftBox.addEventListener('click', goToLetterPage, { once: true });
}

function goToLetterPage() {
  // switch to a completely separate fullscreen page, hiding the game entirely
  document.getElementById('letterBody').textContent = LOVE_LETTER_TEXT;
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('letterPage').style.display = 'flex';

  const music = document.getElementById('letterMusic');
  music.currentTime = 0;
  music.play().catch(() => {
    // autoplay might be blocked by browser, ignore silently
  });
}

document.getElementById('letterBackBtn').addEventListener('click', () => {
  const music = document.getElementById('letterMusic');
  music.pause();
  music.currentTime = 0;

  document.getElementById('letterPage').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  prepareGame();
});

// ---- Input ----
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    flap();
  }
});
document.getElementById('gameContainer').addEventListener('mousedown', (e) => {
  if (e.target.closest('#overlay')) return;
  flap();
});
document.getElementById('gameContainer').addEventListener('touchstart', (e) => {
  if (e.target.closest('#overlay')) return;
  e.preventDefault();
  flap();
}, {passive: false});

startBtn.addEventListener('click', prepareGame);

// ---- Drawing helpers ----
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H - GROUND_H);

  // simple clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 140) - bgOffset * 0.3) % (W + 140) - 70;
    const cy = 60 + (i % 2) * 50;
    drawCloud(cx, cy);
  }
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 14, 0, 0, Math.PI*2);
  ctx.ellipse(x+18, y+4, 18, 11, 0, 0, Math.PI*2);
  ctx.ellipse(x-16, y+5, 16, 10, 0, 0, Math.PI*2);
  ctx.fill();
}

function drawGround() {
  const y = H - GROUND_H;
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, y, W, GROUND_H);
  ctx.fillStyle = GROUND_DARK;
  ctx.fillRect(0, y, W, 8);

  // scrolling dirt texture stripes
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  const stripeW = 30;
  let startX = -(groundOffset % stripeW);
  for (let x = startX; x < W; x += stripeW) {
    ctx.fillRect(x, y + 18, stripeW/2, GROUND_H - 18);
  }
}

function drawPipe(p) {
  const topY = 0;
  const capH = 22;
  // top pipe
  ctx.fillStyle = PIPE_GREEN;
  ctx.fillRect(p.x, topY, PIPE_W, p.topH - capH);
  ctx.fillStyle = PIPE_GREEN_DARK;
  ctx.fillRect(p.x, p.topH - capH, PIPE_W, capH);
  ctx.fillStyle = PIPE_GREEN;
  ctx.fillRect(p.x - 4, p.topH - capH, PIPE_W + 8, capH);
  ctx.fillStyle = PIPE_GREEN_DARK;
  ctx.fillRect(p.x - 4, p.topH - 6, PIPE_W + 8, 6);
  // highlight strip
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(p.x + 5, topY, 6, p.topH - capH);

  // bottom pipe
  const bottomTop = p.bottomY;
  const bottomH = (H - GROUND_H) - bottomTop;
  ctx.fillStyle = PIPE_GREEN;
  ctx.fillRect(p.x, bottomTop + capH, PIPE_W, bottomH - capH);
  ctx.fillStyle = PIPE_GREEN_DARK;
  ctx.fillRect(p.x, bottomTop, PIPE_W, capH);
  ctx.fillStyle = PIPE_GREEN;
  ctx.fillRect(p.x - 4, bottomTop, PIPE_W + 8, capH);
  ctx.fillStyle = PIPE_GREEN_DARK;
  ctx.fillRect(p.x - 4, bottomTop + capH - 6, PIPE_W + 8, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(p.x + 5, bottomTop + capH, 6, bottomH - capH);
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
  ctx.rotate(bird.rotation);
  ctx.translate(-bird.w/2, -bird.h/2);

  // body
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath();
  ctx.ellipse(bird.w/2, bird.h/2, bird.w/2, bird.h/2, 0, 0, Math.PI*2);
  ctx.fill();

  // wing
  const wingFlap = Math.sin(frame * 0.4) * 4;
  ctx.fillStyle = '#fab005';
  ctx.beginPath();
  ctx.ellipse(bird.w/2 - 4, bird.h/2 + 2 + wingFlap*0.2, 9, 6, 0.3, 0, Math.PI*2);
  ctx.fill();

  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bird.w - 8, bird.h/2 - 4, 5, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bird.w - 7, bird.h/2 - 4, 2.2, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#ff922b';
  ctx.beginPath();
  ctx.moveTo(bird.w - 2, bird.h/2);
  ctx.lineTo(bird.w + 9, bird.h/2 - 2);
  ctx.lineTo(bird.w + 9, bird.h/2 + 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHeartShape(cx, cy, size, color, outline) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size/20, size/20);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(0, 2, -3, -4, -8, -4);
  ctx.bezierCurveTo(-14, -4, -14, 3, -14, 3);
  ctx.bezierCurveTo(-14, 8, -9, 12, 0, 18);
  ctx.bezierCurveTo(9, 12, 14, 8, 14, 3);
  ctx.bezierCurveTo(14, 3, 14, -4, 8, -4);
  ctx.bezierCurveTo(3, -4, 0, 2, 0, 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (outline) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = outline;
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(h) {
  const bob = Math.sin(frame * 0.08 + h.bobPhase) * 4;
  drawHeartShape(h.x + h.w/2, h.y + h.h/2 + bob, 20, '#ff4d6d', '#c9184a');
  // little shine
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(h.x + h.w/2 - 4, h.y + h.h/2 + bob - 3, 2.5, 1.5, -0.4, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function renderHud() {
  hud.innerHTML = '';
  for (let i = 0; i < HEARTS_NEEDED; i++) {
    const slot = document.createElement('div');
    slot.className = 'heartSlot';
    const filled = i < heartsCollected;
    slot.innerHTML = `
      <svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 26 C16 26 2 17 2 8 C2 3 6 0 10 0 C13 0 15 2 16 4 C17 2 19 0 22 0 C26 0 30 3 30 8 C30 17 16 26 16 26 Z"
          fill="${filled ? '#ff4d6d' : 'rgba(255,255,255,0.25)'}"
          stroke="${filled ? '#c9184a' : 'rgba(255,255,255,0.4)'}" stroke-width="2"/>
      </svg>`;
    hud.appendChild(slot);
  }
}

// ---- Collision ----
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function checkPipeCollision() {
  for (const p of pipes) {
    const hitX = bird.x + bird.w > p.x && bird.x < p.x + PIPE_W;
    if (hitX) {
      if (bird.y < p.topH || bird.y + bird.h > p.bottomY) {
        return true;
      }
    }
  }
  return false;
}

// ---- Main update loop ----
function update() {
  frame++;
  bgOffset += 1;

  if (state === 'menu') {
    // bird stays completely still, game not started yet
    bird.y = H/2;
    bird.rotation = 0;
    bird.vy = 0;
    return;
  }

  groundOffset += PIPE_SPEED;

  if (state !== 'playing') return;

  // bird physics
  bird.vy += bird.gravity;
  bird.y += bird.vy;
  bird.rotation = Math.max(-0.5, Math.min(1.2, bird.vy * 0.06));

  // ground / ceiling collision
  if (bird.y + bird.h > H - GROUND_H) {
    bird.y = H - GROUND_H - bird.h;
    endGame(false);
    return;
  }
  if (bird.y < 0) {
    bird.y = 0;
    bird.vy = 0;
  }

  // pipes
  pipeTimer++;
  if (pipeTimer > 110) {
    pipeTimer = 0;
    spawnPipe();
  }
  for (const p of pipes) {
    p.x -= PIPE_SPEED;
  }
  pipes = pipes.filter(p => p.x + PIPE_W > -20);

  if (checkPipeCollision()) {
    endGame(false);
    return;
  }

  // hearts (move with pipes, already placed inside pipe gaps when pipe spawned)
  for (const h of hearts) {
    h.x -= PIPE_SPEED;
  }
  hearts = hearts.filter(h => h.x + h.w > -20 && !h.collected);

  for (const h of hearts) {
    if (rectsOverlap(bird.x, bird.y, bird.w, bird.h, h.x, h.y, h.w, h.h)) {
      h.collected = true;
      heartsCollected++;
      renderHud();
      if (heartsCollected >= HEARTS_NEEDED) {
        endGame(true);
        return;
      }
    }
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  for (const p of pipes) drawPipe(p);
  for (const h of hearts) drawHeart(h);
  drawGround();
  drawBird();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

renderHud();
loop();

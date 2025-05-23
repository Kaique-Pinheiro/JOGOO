const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

canvas.width = 1000;
canvas.height = 600;

let gameRunning = false;
let gameOver = false;
let gameWon = false;
let loading = false;

const nave = {
  x: canvas.width / 2,
  y: canvas.height - 70,
  width: 50,
  height: 60,
  speed: 6,
  bullets: []
};

const keys = { w: false, a: false, s: false, d: false };

let meteoros = [];
let score = 0;

let fase = 1;
const metasFases = [10, 20, 30];
const velocidadeBaseMeteoros = [2, 3.5, 5];
let meteorosDestruidos = 0;

// Evento para o botão iniciar
startBtn.addEventListener('click', () => {
  if (!gameRunning && !loading) {
    loading = true;
    startBtn.style.display = 'none';
    mostrarLoading();
    setTimeout(() => {
      loading = false;
      startGame();
    }, 3000);
  }
});

function mostrarLoading() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharFundoEspaco();
  ctx.fillStyle = '#00bfff';
  ctx.font = '50px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
}

function startGame() {
  gameRunning = true;
  gameOver = false;
  gameWon = false;
  nave.bullets = [];
  meteoros = [];
  score = 0;
  fase = 1;
  meteorosDestruidos = 0;
  nave.x = canvas.width / 2;
  nave.y = canvas.height - 70;
  loop();
}

// Loop principal do jogo
function loop() {
  if (!gameRunning) return;

  atualizar();
  desenhar();

  if (!gameOver && !gameWon) {
    requestAnimationFrame(loop);
  } else if (gameOver) {
    mostrarGameOver();
    startBtn.style.display = 'block';
  } else if (gameWon) {
    mostrarVitoria();
    startBtn.style.display = 'block';
  }
}

function atualizar() {
  moverNave();
  atualizarBalas();
  atualizarMeteoros();
  checarColisoes();
  checarFase();
}

function moverNave() {
  if (keys.w && nave.y > 0) nave.y -= nave.speed;
  if (keys.s && nave.y + nave.height < canvas.height) nave.y += nave.speed;
  if (keys.a && nave.x > 0) nave.x -= nave.speed;
  if (keys.d && nave.x + nave.width < canvas.width) nave.x += nave.speed;
}

function atualizarBalas() {
  nave.bullets.forEach((bala, i) => {
    bala.y -= bala.speed;
    if (bala.y < 0) {
      nave.bullets.splice(i, 1);
    }
  });
}

function atualizarMeteoros() {
  // Gera meteoros aleatórios (probabilidade simples)
  if (Math.random() < 0.03) {
    gerarMeteoro();
  }

  meteoros.forEach((m, i) => {
    m.y += m.vel;
    // Remove meteoros que saíram da tela (não causam game over)
    if (m.y - m.raio > canvas.height) {
      meteoros.splice(i, 1);
    }
  });
}

function checarColisoes() {
  // Balas x meteoros
  nave.bullets.forEach((bala, iBala) => {
    meteoros.forEach((m, iMeteoro) => {
      const dx = bala.x - m.x;
      const dy = bala.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < m.raio) {
        // Meteoro destruído
        meteoros.splice(iMeteoro, 1);
        nave.bullets.splice(iBala, 1);
        meteorosDestruidos++;
        score += 10;
      }
    });
  });

  // Meteoro x nave (GAME OVER)
  meteoros.forEach((m) => {
    if (colisaoCirculoRetangulo(m, nave)) {
      gameOver = true;
      gameRunning = false;
    }
  });
}

function colisaoCirculoRetangulo(circulo, ret) {
  // Colisão círculo com retângulo - abordagem simples
  const distX = Math.abs(circulo.x - ret.x - ret.width / 2);
  const distY = Math.abs(circulo.y - ret.y - ret.height / 2);

  if (distX > (ret.width / 2 + circulo.raio)) { return false; }
  if (distY > (ret.height / 2 + circulo.raio)) { return false; }

  if (distX <= (ret.width / 2)) { return true; }
  if (distY <= (ret.height / 2)) { return true; }

  const dx = distX - ret.width / 2;
  const dy = distY - ret.height / 2;
  return (dx * dx + dy * dy <= (circulo.raio * circulo.raio));
}

function checarFase() {
  if (meteorosDestruidos >= metasFases[fase - 1]) {
    if (fase === metasFases.length) {
      gameWon = true;
      gameRunning = false;
    } else {
      fase++;
      meteorosDestruidos = 0;
      meteoros = [];
      nave.bullets = [];
      alert(`Parabéns! Você avançou para a fase ${fase}`);
    }
  }
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharFundoEspaco();

  desenharNave();
  desenharBalas();
  desenharMeteoros();

  // HUD
  ctx.fillStyle = '#00bfff';
  ctx.font = '22px Orbitron, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Fase: ${fase}`, 20, 30);
  ctx.fillText(`Meteoros destruídos: ${meteorosDestruidos} / ${metasFases[fase - 1]}`, 20, 60);
  ctx.fillText(`Pontuação: ${score}`, 20, 90);
}

function desenharNave() {
  const x = nave.x;
  const y = nave.y;
  const w = nave.width;
  const h = nave.height;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Nave estilo triângulo com detalhes
  ctx.fillStyle = '#00bfff';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); // ponta
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(0, h / 4);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  // Janela da nave
  ctx.fillStyle = '#005f87';
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 6, h / 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function desenharBalas() {
  ctx.fillStyle = '#00ffff';
  nave.bullets.forEach(bala => {
    ctx.beginPath();
    ctx.rect(bala.x - 2, bala.y - 10, 4, 10);
    ctx.fill();
  });
}

function desenharMeteoros() {
  meteoros.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);

    // Corpo principal do meteoro - rochoso
    const grad = ctx.createRadialGradient(0, 0, m.raio / 2, 0, 0, m.raio);
    grad.addColorStop(0, '#888');
    grad.addColorStop(1, '#444');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(0, 0, m.raio, 0, Math.PI * 2);
    ctx.fill();

    // Desenho de crateras (circulos menores)
    ctx.fillStyle = '#555';
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const radius = m.raio / 4;
      const cx = Math.cos(angle) * (m.raio / 2);
      const cy = Math.sin(angle) * (m.raio / 2);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function gerarMeteoro() {
  const raio = 15 + Math.random() * 10;
  const x = Math.random() * (canvas.width - raio * 2) + raio;
  const y = -raio;
  const vel = velocidadeBaseMeteoros[fase - 1];
  meteoros.push({ x, y, raio, vel });
}

// Controle do teclado
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') keys.w = true;
  if (e.code === 'KeyA') keys.a = true;
  if (e.code === 'KeyS') keys.s = true;
  if (e.code === 'KeyD') keys.d = true;
  if (e.code === 'Space') {
    if (gameRunning) {
      disparar();
    }
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') keys.w = false;
  if (e.code === 'KeyA') keys.a = false;
  if (e.code === 'KeyS') keys.s = false;
  if (e.code === 'KeyD') keys.d = false;
});

function disparar() {
  const balaX = nave.x + nave.width / 2;
  const balaY = nave.y;
  nave.bullets.push({ x: balaX, y: balaY, speed: 10 });
}

// Tela de game over
function mostrarGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff0000';
  ctx.font = '70px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Tela de vitória
function mostrarVitoria() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff00';
  ctx.font = '50px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PARABÉNS!', canvas.width / 2, canvas.height / 2 - 30);
  ctx.font = '30px Orbitron, sans-serif';
  ctx.fillText('Você completou todas as fases!', canvas.width / 2, canvas.height / 2 + 20);
}

function desenharFundoEspaco() {
  // Fundo preto
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Estrelas aleatórias
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 1.5;
    const alpha = Math.random() * 0.8;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nebulosa simples (gradiente)
  const grad = ctx.createRadialGradient(canvas.width * 0.75, canvas.height * 0.25, 50, canvas.width * 0.75, canvas.height * 0.25, 200);
  grad.addColorStop(0, 'rgba(0, 191, 255, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


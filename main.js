import { setupHiDPICanvas } from './utils.js';
import { Game } from './game.js';
import { bindControls } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = setupHiDPICanvas(canvas);

// Resize handling
function resize() {
  setupHiDPICanvas(canvas);
  game.resize(canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

// Assets (optional images). Provide your own to override fallbacks.
const assets = {};
const game = new Game(canvas, assets);
game.resize(canvas.width, canvas.height);

// Bind UI screens
const home = document.getElementById('homeScreen');
const over = document.getElementById('gameOverScreen');
const bestScoreText = document.getElementById('bestScoreText');
const finalScoreText = document.getElementById('finalScoreText');
const highScoreText = document.getElementById('highScoreText');

function showHome() {
  home.classList.add('visible');
  over.classList.remove('visible');
  bestScoreText.textContent = `Best: ${game.highScore}`;
  game.state = 'home';
}
function showOver() {
  finalScoreText.textContent = `Score: ${game.score}`;
  highScoreText.textContent = `Best: ${game.highScore}`;
  over.classList.add('visible');
}
function hideOverlays() {
  home.classList.remove('visible');
  over.classList.remove('visible');
}

document.getElementById('playButton').addEventListener('click', () => {
  hideOverlays();
  game.start();
});
document.getElementById('restartButton').addEventListener('click', () => {
  hideOverlays();
  game.start();
});

// Control bindings
bindControls({
  onLeft: () => game.handleInput('left'),
  onRight: () => game.handleInput('right'),
  onToggleTheme: () => game.toggleTheme()
});

// Observe game state to show Game Over screen
const observer = new MutationObserver(() => {
  if (game.state === 'gameover') showOver();
});
observer.observe(document.body, { attributes: false, childList: false, subtree: false });

// Start loop in home state
game.loop(performance.now());
showHome();

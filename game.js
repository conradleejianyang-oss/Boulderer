import { ParallaxBackground } from './background.js';
import { HoldsManager } from './holds.js';
import { clamp } from './utils.js';
import { Climber } from './climber.js';

export class Game {
  constructor(canvas, assets = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;

    this.state = 'home'; // home | playing | gameover
    this.score = 0;
    this.highScore = Number(localStorage.getItem('highScore') || 0);

    this.background = new ParallaxBackground(canvas, assets);
    this.holds = new HoldsManager({
      bottom: 0, stepHeight: 90, holdSize: 46
    });
    this.climber = new Climber();

    this.wallRect = { x: 0, y: 0, width: 0, height: 0 };

    this.timer = { max: 3000, remain: 3000 };
    this.lastTime = 0;
    this.loopId = 0;
    this.scrollAnim = 0; // pixels animated per pull
  }

  resize(width, height) {
    const pad = Math.max(12, Math.min(width * 0.04, 24));
    const wallW = Math.min(520, Math.max(320, width - pad * 2));
    this.wallRect = { x: (width - wallW)/2, y: 0, width: wallW, height: height };

    this.holds.config.bottom = height - 120;
    this.climber.setBasePosition(width/2, height - 140);
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.timer.max = 3000;
    this.timer.remain = this.timer.max;
    this.scrollAnim = 0;
    this.holds.reset();
    this.lastTime = performance.now();
    this.loopId = requestAnimationFrame(this.loop);
  }

  endGame() {
    this.state = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('highScore', String(this.highScore));
    }
  }

  handleInput = (dir) => {
    if (this.state !== 'playing') return;
    const correct = this.holds.checkInput(dir);
    this.climber.triggerReach(dir);
    if (correct) {
      // schedule pull and advance
      this.climber.triggerPullUp();
      this.score += 1;
      // difficulty ramp
      this.timer.max = Math.max(1000, 3000 - this.score * 10);
      this.timer.remain = this.timer.max;
      // move world down by one step
      this.holds.onSuccessfulClimb();
      this.scrollAnim = this.holds.config.stepHeight;
    } else {
      this.climber.triggerFall();
      this.endGame();
    }
  };

  toggleTheme() { this.background.toggleTheme(); }

  loop = (ts) => {
    const dt = Math.min(50, ts - this.lastTime || 16.7);
    this.lastTime = ts;

    if (this.state === 'playing') {
      this.update(dt);
      this.render();
      this.loopId = requestAnimationFrame(this.loop);
    } else if (this.state === 'home') {
      this.render(); // draw idle screen background
      this.loopId = requestAnimationFrame(this.loop);
    } else if (this.state === 'gameover') {
      this.render(); // draw final frame
    }
  };

  update(dt) {
    // timer
    this.timer.remain = clamp(this.timer.remain - dt, 0, this.timer.max);
    if (this.timer.remain <= 0) {
      this.climber.triggerFall();
      this.endGame();
    }

    // anim scroll (pull)
    if (this.scrollAnim > 0) {
      const step = Math.min(this.scrollAnim, 600 * dt / 1000);
      this.scrollAnim -= step;
      this.background.update(step);
      // Move holds visually
      for (const h of this.holds.holds) h.y += step;
    }

    this.climber.update(dt, this.holds.config.stepHeight);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.background.draw(ctx);

    // rock wall slab
    ctx.save();
    ctx.fillStyle = '#bfa788';
    const r = 18;
    const {x, y, width, height} = this.wallRect;
    this.roundRect(ctx, x, y + 12, width, height - 24, r);
    ctx.clip();

    // wall texture spots
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#7c6a51';
    for (let i = 0; i < 36; i++) {
      const sx = x + (i*97 % width);
      const sy = (i*137 % height);
      this.roundRect(ctx, sx, sy, 70, 26, 10);
    }
    ctx.globalAlpha = 1;

    // holds
    this.holds.draw(ctx, this.wallRect);
    ctx.restore();

    // climber
    this.climber.draw(ctx);

    // HUD: score + timer bar
    this.drawHUD(ctx, w, h);
  }

  drawHUD(ctx, w, h) {
    ctx.save();
    // score
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.roundRect(ctx, w/2 - 70, 14, 140, 28, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(String(this.score), w/2, 33);

    // timer bar
    const full = 160;
    const pct = this.timer.remain / this.timer.max;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.roundRect(ctx, w/2 - full/2, 48, full, 14, 8);
    // gradient from green to red
    const grad = ctx.createLinearGradient(w/2 - full/2, 0, w/2 + full/2, 0);
    grad.addColorStop(0, '#2ecc71'); grad.addColorStop(1, '#e74c3c');
    ctx.fillStyle = grad;
    this.roundRect(ctx, w/2 - full/2, 48, Math.max(6, full * pct), 14, 8);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
    ctx.fill();
  }
}

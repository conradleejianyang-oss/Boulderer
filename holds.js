import { randChoice, randomBoolean } from './utils.js';

const HOLD_TYPES = ['small', 'medium', 'large', 'round'];
const COLORS = {
  small: '#e74c3c',
  medium: '#2ecc71',
  large: '#3498db',
  round: '#f1c40f'
};

export class HoldsManager {
  constructor(config) {
    this.config = config;
    this.holds = []; // visible holds with {side, y, type}
    this.nextSide = randomBoolean() ? 'left' : 'right';
    this.lastSide = null;
    this.scrollY = 0;
  }

  reset() {
    this.holds = [];
    this.nextSide = randomBoolean() ? 'left' : 'right';
    this.lastSide = null;
    this.scrollY = 0;
    // seed visible holds
    for (let i = 0; i < 7; i++) this.spawnHold(i);
  }

  spawnHold(levelIndexFromBottom) {
    const side = levelIndexFromBottom === 0 ? this.nextSide :
      (randomBoolean() ? 'left' : 'right');
    const type = randChoice(HOLD_TYPES);
    const y = this.config.bottom - levelIndexFromBottom * this.config.stepHeight;
    this.holds.push({ side, y, type });
  }

  onSuccessfulClimb() {
    this.lastSide = this.nextSide;
    // Prevent very long streaks by biasing after 4 in a row
    if (this.streakSide && this.streakCount >= 4) {
      this.nextSide = this.streakSide === 'left' ? 'right' : 'left';
      this.streakCount = 0;
      this.streakSide = this.nextSide;
    } else {
      this.nextSide = randomBoolean() ? 'left' : 'right';
    }
    if (this.lastSide === this.nextSide) {
      this.streakCount = (this.streakSide === this.nextSide ? (this.streakCount || 0) + 1 : 1);
      this.streakSide = this.nextSide;
    } else {
      this.streakSide = this.nextSide;
      this.streakCount = 1;
    }

    // shift existing holds down and add a new at top
    for (const h of this.holds) h.y += this.config.stepHeight;
    const type = randChoice(HOLD_TYPES);
    const topY = this.holds.reduce((min, h) => Math.min(min, h.y), Infinity) - this.config.stepHeight;
    this.holds.push({ side: this.nextSide, y: topY, type });
    // trim off-screen
    this.holds = this.holds.filter(h => h.y <= this.config.bottom + this.config.stepHeight * 2);
  }

  checkInput(direction) {
    return direction === this.nextSide;
  }

  draw(ctx, wallRect) {
    const sizeBase = this.config.holdSize;
    for (const h of this.holds) {
      const x = h.side === 'left'
        ? wallRect.x + wallRect.width * 0.25
        : wallRect.x + wallRect.width * 0.75;
      const y = h.y;
      this.drawHold(ctx, h.type, x, y, sizeBase);
    }
  }

  drawHold(ctx, type, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = COLORS[type];

    switch (type) {
      case 'small':
        this.roundRect(ctx, -size*0.35, -size*0.2, size*0.7, size*0.4, 6);
        break;
      case 'medium':
        this.roundRect(ctx, -size*0.45, -size*0.25, size*0.9, size*0.5, 8);
        break;
      case 'large':
        this.roundRect(ctx, -size*0.55, -size*0.3, size*1.1, size*0.6, 10);
        break;
      case 'round':
        ctx.beginPath();
        ctx.arc(0, 0, size*0.35, 0, Math.PI*2);
        ctx.fill();
        break;
    }
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

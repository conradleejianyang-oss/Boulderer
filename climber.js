// Climber with simple state machine and sprite-ready hooks.
// If no sprite sheet is provided, it draws a stylized figure.

export class Climber {
  constructor() {
    this.x = 0;        // center in wall coords
    this.y = 0;        // baseline
    this.sideOffset = 0; // -1 left, 1 right, for lean
    this.state = 'idle'; // idle | reach | pull | fall
    this.stateTime = 0;
    this.facing = 'right';
    this.sprite = null;  // optional: {img, frameW, frameH, map:{idle:[], reach:[], pull:[], fall:[]}}
    this.reachDuration = 140;
    this.pullDuration = 180;
    this.fallDuration = 600;
  }

  attachSprite(sprite) { this.sprite = sprite; }

  setBasePosition(x, y) {
    this.x = x; this.y = y;
  }

  triggerReach(direction) {
    this.facing = direction;
    this.state = 'reach';
    this.stateTime = 0;
    this.sideOffset = direction === 'left' ? -1 : 1;
  }

  triggerPullUp() {
    this.state = 'pull';
    this.stateTime = 0;
  }

  triggerFall() {
    this.state = 'fall';
    this.stateTime = 0;
  }

  update(dt, stepHeight) {
    this.stateTime += dt;
    switch (this.state) {
      case 'reach':
        if (this.stateTime >= this.reachDuration) {
          this.state = 'pull';
          this.stateTime = 0;
        }
        break;
      case 'pull':
        if (this.stateTime >= this.pullDuration) {
          // finish pull, return to idle and center lean
          this.state = 'idle';
          this.stateTime = 0;
          this.sideOffset = 0;
          // actual Y movement handled by world scroll
        }
        break;
      case 'fall':
        // keep falling (y increases visually by world), nothing else
        break;
    }
  }

  draw(ctx, scale = 1) {
    if (this.sprite) {
      // Placeholder for sprite drawing (single-frame example)
      // You can extend with frame maps per animation.
    } else {
      this.drawPlaceholder(ctx, scale);
    }
  }

  drawPlaceholder(ctx, scale) {
    const lean = this.sideOffset * 6;
    const baseX = this.x + lean;
    const baseY = this.y;

    // Rope
    ctx.strokeStyle = '#ff7a1a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 80);
    ctx.lineTo(baseX, baseY + 120);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#206a9e';
    this.roundRect(ctx, baseX - 26, baseY - 60, 52, 42, 10);

    // Arms
    ctx.fillStyle = '#f5c9a8';
    const reachFactor = this.state === 'reach' ? Math.min(1, this.stateTime / this.reachDuration) : 0;
    const armLen = 44 + reachFactor * 26;
    const armX = this.facing === 'left' ? -armLen : armLen;

    // Left
    this.roundRect(ctx, baseX - 16 - (this.facing==='left'?armLen:24), baseY - 96, 14, armLen, 7);
    // Right
    this.roundRect(ctx, baseX + 2 + (this.facing==='right'?10:24), baseY - 96, 14, armLen, 7);

    // Head
    ctx.fillStyle = '#5c3827';
    ctx.beginPath();
    ctx.arc(baseX, baseY - 80, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f5c9a8';
    ctx.beginPath();
    ctx.arc(baseX, baseY - 70, 16, Math.PI, 0); ctx.fill();

    // Belt
    ctx.fillStyle = '#f1b20b';
    this.roundRect(ctx, baseX - 26, baseY - 18, 52, 10, 6);

    // Legs
    ctx.fillStyle = '#3b3f44';
    this.roundRect(ctx, baseX - 22, baseY - 10, 18, 70, 8);
    this.roundRect(ctx, baseX + 4, baseY - 10, 18, 70, 8);

    // Shoes
    ctx.fillStyle = '#2a2f35';
    this.roundRect(ctx, baseX - 26, baseY + 56, 26, 18, 6);
    this.roundRect(ctx, baseX + 0, baseY + 56, 26, 18, 6);
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

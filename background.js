import { chooseInitialThemeByClock } from './utils.js';

const defaultColors = {
  day: ['#8fd3ff', '#b0e0ff', '#d0ecff', '#e7c9a5'],
  night: ['#0b1b33', '#152744', '#1f3352', '#354a5f']
};

export class ParallaxBackground {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.assets = assets || {};
    this.theme = chooseInitialThemeByClock();
    this.layers = [
      { y: 0, speed: 0.15, key: 'L1' },
      { y: 0, speed: 0.3,  key: 'L2' },
      { y: 0, speed: 0.55, key: 'L3' },
      { y: 0, speed: 1.0,  key: 'L4' }
    ];
  }

  toggleTheme(next) {
    this.theme = next || (this.theme === 'day' ? 'night' : 'day');
  }

  update(scrollDelta) {
    for (const layer of this.layers) {
      layer.y += scrollDelta * layer.speed;
      const h = this.canvas.height;
      if (layer.y > h) layer.y -= h;
    }
  }

  draw(ctx) {
    const { width: w, height: h } = this.canvas;
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const img = this.assets[`${this.theme}_${layer.key}`];
      const y = layer.y;

      if (img) {
        this.drawTiledY(ctx, img, 0, y - h, w, h);
        this.drawTiledY(ctx, img, 0, y, w, h);
      } else {
        // fallback: flat colored bands
        ctx.fillStyle = defaultColors[this.theme][i];
        ctx.fillRect(0, (y - h), w, h);
        ctx.fillRect(0, y, w, h);
      }
    }
    ctx.restore();
  }

  drawTiledY(ctx, img, x, y, w, h) {
    ctx.drawImage(img, x, y, w, h);
  }
}

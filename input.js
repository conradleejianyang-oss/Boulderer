export function bindControls({ onLeft, onRight, onToggleTheme }) {
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  const left = (e) => { e.preventDefault(); onLeft(); };
  const right = (e) => { e.preventDefault(); onRight(); };

  ['pointerdown','click','touchstart'].forEach(ev => leftBtn.addEventListener(ev, left));
  ['pointerdown','click','touchstart'].forEach(ev => rightBtn.addEventListener(ev, right));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') onLeft();
    if (e.key === 'ArrowRight') onRight();
    if (e.key.toLowerCase() === 't') onToggleTheme();
  });

  // prevent multi-touch gestures from scrolling
  ['touchmove','gesturestart'].forEach(ev => {
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  });
}

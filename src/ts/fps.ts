let fps: HTMLDivElement | undefined;
if (FLAG_SHOW_FPS) {
  fps = document.createElement('div');
  const style = `
    position: absolute;
    top: 0;
    left: 0;
    color: white;
  `
  fps.setAttribute('style', style);
  document.body.appendChild(fps)
}

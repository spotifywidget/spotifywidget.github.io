let dragging = false;
let offsetX, offsetY;

window.addEventListener('mousedown', event => {
  dragging = true;
  offsetX = event.clientX;
  offsetY = event.clientY;
});

window.addEventListener('mousemove', event => {
  if (dragging) {
    const x = event.clientX;
    const y = event.clientY;
    window.electron.ipcRenderer.send('moveWindow', { x: x - offsetX, y: y - offsetY });
  }
});

window.addEventListener('mouseup', () => {
  dragging = false;
});

window.addEventListener('mouseleave', () => {
  dragging = false;
});
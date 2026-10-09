const scenes = [...document.querySelectorAll('.scene')];
const bar = document.querySelector('#bar');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const full = document.querySelector('#full');
const counter = document.querySelector('#counter');
let i = 0;

function updateControls(){
  if(counter) counter.textContent = `${i + 1} / ${scenes.length}`;
  if(prev) prev.disabled = i === 0;
  if(next) next.disabled = i === scenes.length - 1;
}

function show(n){
  i = Math.max(0, Math.min(n, scenes.length - 1));
  scenes.forEach((s,k)=>s.classList.toggle('active', k === i));
  if(bar) bar.style.width = `${((i + 1) / scenes.length) * 100}%`;
  updateControls();
}

prev?.addEventListener('click', () => show(i - 1));
next?.addEventListener('click', () => show(i + 1));
full?.addEventListener('click', () => {
  if(document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

document.addEventListener('keydown', e => {
  if(e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(i + 1); }
  else if(e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
  else if(e.key === 'Home') { e.preventDefault(); show(0); }
  else if(e.key === 'End') { e.preventDefault(); show(scenes.length - 1); }
  else if(e.key.toLowerCase() === 'f') full?.click();
});

let wheelLock = false;
document.addEventListener('wheel', e => {
  if(wheelLock) return;
  wheelLock = true;
  show(i + (e.deltaY > 0 ? 1 : -1));
  setTimeout(() => wheelLock = false, 450);
}, {passive:true});

show(0);

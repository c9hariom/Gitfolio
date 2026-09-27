const cursor = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let w, h, particles = [];

function resize() {
  w = canvas.width = innerWidth * devicePixelRatio;
  h = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  particles = Array.from({length: Math.min(90, Math.floor(innerWidth / 15))}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .18,
    vy: (Math.random() - .5) * .18,
    r: Math.random() * 1.4 + .25
  }));
}
resize();
addEventListener("resize", resize);

function frame() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = innerWidth;
    if (p.x > innerWidth) p.x = 0;
    if (p.y < 0) p.y = innerHeight;
    if (p.y > innerHeight) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = "rgba(89,233,191,.28)";
    ctx.fill();
  }
  for (let i=0;i<particles.length;i++) {
    for (let j=i+1;j<particles.length;j++) {
      const a=particles[i], b=particles[j];
      const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
      if(d<105){
        ctx.strokeStyle = `rgba(89,233,191,${(1-d/105)*.07})`;
        ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(frame);
}
frame();

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:"smooth"}); }
  });
});

document.querySelectorAll(".brand-logo img,.brand-node img,.medical-logo img").forEach(img=>{
  img.addEventListener("error",()=>{img.style.display="none"});
});

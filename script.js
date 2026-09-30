const intro=document.getElementById("intro"),app=document.getElementById("app"),start=document.getElementById("start"),music=document.getElementById("music"),musicBtn=document.getElementById("musicBtn"),musicText=document.getElementById("musicText"),slides=[...document.querySelectorAll(".slide")],count=document.getElementById("count"),progress=document.getElementById("progress"),prev=document.getElementById("prev"),next=document.getElementById("next");let index=0;
function render(){slides.forEach((s,i)=>s.classList.toggle("active",i===index));count.textContent=String(index+1).padStart(2,"0");progress.style.width=((index+1)/slides.length*100)+"%";prev.style.opacity=index===0?".25":"1";next.style.opacity=index===slides.length-1?".25":"1"}
async function startShow(){intro.classList.add("hide");app.classList.add("ready");try{await music.play();musicText.textContent="TOCANDO"}catch(e){musicText.textContent="ADICIONE O MP3"}}
function go(n){index=Math.max(0,Math.min(slides.length-1,n));render()}
start.addEventListener("click",startShow);
next.addEventListener("click",e=>{e.stopPropagation();go(index+1)});
prev.addEventListener("click",e=>{e.stopPropagation();go(index-1)});
musicBtn.addEventListener("click",async e=>{e.stopPropagation();if(music.paused){try{await music.play();musicText.textContent="TOCANDO"}catch(e){musicText.textContent="MP3 NÃO ENCONTRADO"}}else{music.pause();musicText.textContent="MÚSICA"}});
document.addEventListener("click",e=>{if(!app.classList.contains("ready")||e.target.closest("button"))return;go(index+1)});
document.addEventListener("keydown",e=>{if(!app.classList.contains("ready"))return;if(["ArrowRight"," ","Enter"].includes(e.key)){e.preventDefault();go(index+1)}if(e.key==="ArrowLeft"){e.preventDefault();go(index-1)}});
let sx=0;document.addEventListener("touchstart",e=>sx=e.changedTouches[0].clientX,{passive:true});document.addEventListener("touchend",e=>{if(!app.classList.contains("ready"))return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60)go(index+(dx<0?1:-1))},{passive:true});
render();
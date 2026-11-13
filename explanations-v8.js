(()=>{
 const items=[...document.querySelectorAll('details.info')];
 function close(d){d.open=false;}
 function place(d){if(!d.open)return;const panel=d.querySelector('.info-panel'),rect=d.querySelector('summary').getBoundingClientRect();panel.style.position='fixed';panel.style.left=Math.max(12,Math.min(rect.left,innerWidth-panel.offsetWidth-12))+'px';let top=rect.bottom+6;if(top+panel.offsetHeight>innerHeight-12)top=Math.max(12,rect.top-panel.offsetHeight-6);panel.style.top=top+'px';}
 items.forEach(d=>{let timer;const summary=d.querySelector('summary');d.addEventListener('toggle',()=>{if(d.open){items.forEach(other=>{if(other!==d)close(other);});place(d);}});d.addEventListener('pointerenter',e=>{clearTimeout(timer);if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches){d.open=true;place(d);}});d.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')timer=setTimeout(()=>{if(!d.contains(document.activeElement))close(d);},250);});d.querySelector('.info-close').onclick=()=>{close(d);summary.focus();};});
 document.addEventListener('pointerdown',e=>items.forEach(d=>{if(!d.contains(e.target))close(d);}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=items.find(d=>d.open);if(d){e.stopImmediatePropagation();close(d);d.querySelector('summary').focus();}}},true);
 addEventListener('resize',()=>items.forEach(place));addEventListener('scroll',()=>items.forEach(place),true);
})();

(()=>{
'use strict';
const charts=JSON.parse(document.getElementById('chart-data').textContent), colors=['#2463dc','#119b9b','#805dc1','#e88052','#458e65','#ad618a','#7e8e3e','#798ba4'];
if(!window.Plotly)return;
const config={responsive:true,displaylogo:false,scrollZoom:false,modeBarButtonsToRemove:['lasso2d','select2d'],toImageButtonOptions:{format:'png',scale:2}};
function traces(c){return c.series.map((s,i)=>({name:s.name,x:s.points.map(p=>p.date),y:s.points.map(p=>p.value),type:'scatter',mode:c.kind==='events'||s.points.length<2?'markers':'lines',connectgaps:false,line:{color:colors[i%8],width:1.8},marker:{color:colors[i%8],size:8},customdata:s.points.map(p=>p.label||''),hovertemplate:'%{x|%Y-%m-%d}<br>%{y:,.4f} '+c.unit+'<br>%{customdata}<extra>%{fullData.name}</extra>'}));}
function layout(c){return {autosize:true,margin:{t:15,b:25,l:52,r:12},font:{family:'system-ui, sans-serif',size:10,color:'#60748b'},paper_bgcolor:'#fff',plot_bgcolor:'#fff',colorway:colors,hovermode:'closest',dragmode:'zoom',xaxis:{type:'date',gridcolor:'#f1f4f7',rangeslider:{visible:true,thickness:.09},showspikes:true,spikemode:'across'},yaxis:{gridcolor:'#e8edf4',zerolinecolor:'#dce4ef',rangemode:'tozero',automargin:true},legend:{orientation:'h',x:0,y:-.28,font:{size:10}},showlegend:c.series.length>1};}
charts.forEach(c=>{
 const card=document.getElementById(c.id),plot=card.querySelector('.plot');
 if(!c.series.length)return;
 let ready=false,pending=null;
 async function init(){if(ready)return;if(pending)return pending;
 pending=(async()=>{try{plot.hidden=false;await Plotly.newPlot(plot,traces(c),layout(c),config);card.querySelector('.fallback').hidden=true;card.querySelector('.fallback-legend').hidden=true;card.querySelector('.controls').hidden=false;ready=true;if(window.ResizeObserver){new ResizeObserver(()=>{if(plot.clientWidth && (plot.layout.width!==plot.clientWidth||plot.layout.height!==plot.clientHeight))Plotly.relayout(plot,{width:plot.clientWidth,height:plot.clientHeight});}).observe(plot);}}catch(e){plot.hidden=true;console.error('Chart kept in fallback:',c.id,e);}finally{pending=null;}})();return pending;}
 card.querySelector('select').onchange=async e=>{await init();let n=e.target.value;if(n==='all'){await Plotly.relayout(plot,{'xaxis.autorange':true});}else{let end=new Date(c.end+'T00:00:00Z'),start=new Date(+end-Number(n)*86400000);await Plotly.relayout(plot,{'xaxis.range':[start.toISOString().slice(0,10),c.end],'xaxis.autorange':false});}};
 card.querySelector('.expand').onclick=async e=>{await init();const expanded=card.classList.toggle('expanded');e.target.textContent=expanded?'닫기':'확대';document.body.style.overflow=expanded?'hidden':'';await new Promise(r=>requestAnimationFrame(r));await Plotly.relayout(plot,{width:plot.clientWidth,height:plot.clientHeight});};
 card.querySelector('.scale').onclick=async e=>{await init();const log=plot.layout.yaxis.type!=='log';await Plotly.relayout(plot,{'yaxis.type':log?'log':'linear','yaxis.autorange':true});e.target.textContent=log?'선형축':'로그축';};
 card.querySelector('.csv').onclick=()=>{const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"',rows=[['series','date','value','unit','label','source']];c.series.forEach(s=>s.points.forEach(p=>rows.push([s.name,p.date,p.value,c.unit,p.label||'',p.source||c.sources.map(x=>x.url).join(' | ')])));const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=c.id+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){init();observer.disconnect();}},{rootMargin:'300px'});observer.observe(card);}else init();
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('article.expanded').forEach(c=>c.querySelector('.expand').click());}});
})();

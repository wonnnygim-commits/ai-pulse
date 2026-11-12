const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:2}).format(n), colors=['#157b65','#4777bb','#d3a044','#9a70a7','#d17a64'];
let seed,live,family='npm';
const tag=(t,kind='')=>`<span class="tag ${kind}">${esc(t)}</span>`, time=s=>s?new Date(s).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'미조회';
const table=(head,rows)=>`<table><thead><tr>${head.map(t=>`<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function render(){
 const ms=live.metrics||[], codex=ms.find(x=>x.name==='Codex');
 $('#hero').innerHTML=[['도입 · Codex / npm',codex?fmt(codex.value):'미조회',codex?`7일 다운로드 · ${codex.date} 종료`:'API 값 없음','API 조회값'],['사용 · Ramp 토큰 볼륨','+37.1%','전주 대비 · 정확한 기간 미기재','원문 스냅샷'],['침투 · Copilot 유료 시트','4.7M','좌석 수 · 기준일 미기재','원문 스냅샷']].map((x,i)=>`<div class="card"><span class="rail"></span><div class="small">${x[0]}</div><div class="num">${x[1]}</div>${tag(i===0&&codex?.status==='stale'?'갱신 실패':x[3],i?'manual':codex?.status==='stale'?'error':'')}<div class="small">${x[2]}</div></div>`).join('');
 $('#market').innerHTML=table(['확장 프로그램','누적 설치','주간 증가'],seed.marketplace.map(x=>[esc(x.name),fmt(x.value),`+${x.wow}%`]));
 $('#issues').innerHTML=table(['저장소','API · PR 제외','원문'],seed.issues.map(x=>{let m=ms.find(m=>m.name===x.name);return [esc(x.name),m?`${fmt(m.value)}<br><span class="small">${m.date} ${m.status==='stale'?'· 갱신 실패':''}</span>`:'미조회',fmt(x.value)]}));
 $('#ramp').innerHTML=seed.ramp.map(x=>`<div class="metric"><span class="small">${esc(x.name)}</span><strong>${x.value>0?'+':''}${x.value}%</strong><em>${esc(x.unit.replace('%',''))}</em></div>`).join('');
 $('#anchors').innerHTML=seed.anchors.map(x=>`<article class="anchor"><div class="small">${esc(x.scope)}</div><b>${esc(x.name)}</b><strong>${esc(x.value)}</strong><div>${esc(x.metric)}</div><p class="small">${esc(x.detail)}</p><div class="date">${esc(x.date)}</div></article>`).join('');
 $('#refresh-time').textContent='최근 시도 '+time(live.lastAttempt);
 const rows=ms.map(x=>[`<a href="${esc(x.source)}" target="_blank" rel="noopener">${esc(x.name)} ↗</a>`,esc(x.family),esc(x.date),tag(x.status==='stale'?'갱신 실패 · 이전값':'조회 성공',x.status==='stale'?'error':''),time(x.fetchedAt)]);
 for(const e of live.errors||[])if(!ms.some(x=>x.id===e.id))rows.push([esc(e.id),'—','—',tag('조회 실패','error'),'—']);
 rows.push(['Marketplace · Ramp · 매출/침투','원문','항목별 상이',tag('수동 검증 대기','manual'),'원문 확인 11/11~12']);
 $('#connections').innerHTML=table(['지표','출처','집계일','상태','조회 시각 (KST)'],rows);
 $('#history').innerHTML=(live.history||[]).slice().reverse().map(x=>`<p>${time(x.at)} · 성공 ${x.ok} / 실패 ${x.failed}</p>`).join('')+(live.errors||[]).map(x=>`<p>${esc(x.id)}: ${esc(x.reason)} — ${esc(x.detail)}</p>`).join('');
 renderChart();
}
function renderChart(){
 const ms=(live.metrics||[]).filter(x=>x.family===family), n=Number($('#period').value);
 const sets=ms.map(x=>({...x,series:x.series.slice(-n)}));
 const dates=[...new Set(sets.flatMap(x=>x.series.map(p=>p.date)))].sort();
 $('#legend').innerHTML=sets.map((x,i)=>`<span><i class="dot" style="background:${colors[i]}"></i>${esc(x.name)}${x.status==='stale'?' · 이전값':''}</span>`).join('');
 if(!dates.length){$('#trend').innerHTML='<div class="empty">확보한 시계열이 없습니다.</div>';$('#chart-date').textContent='';}
 else{
 const W=660,H=255,L=52,R=20,T=15,B=32, min=Date.parse(dates[0]),max=Date.parse(dates.at(-1)), peak=Math.max(...sets.flatMap(x=>x.series.map(p=>p.value)),1)*1.08;
 const X=d=>L+(Date.parse(d)-min)/(max-min||1)*(W-L-R),Y=v=>H-B-v/peak*(H-T-B);
 let svg=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${family} 7일 다운로드 추이"><title>${family} 다운로드, ${dates[0]}부터 ${dates.at(-1)}까지</title>`;
 for(let i=0;i<=4;i++){let v=peak*i/4,y=Y(v);svg+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-8}" y="${y+4}" text-anchor="end">${fmt(v)}</text>`;}
 sets.forEach((s,i)=>{let last=null,d='';s.series.forEach(p=>{let gap=last&&Date.parse(p.date)-Date.parse(last)>86400000;d+=`${last&&!gap?'L':'M'}${X(p.date)},${Y(p.value)} `;last=p.date});svg+=`<path d="${d}" stroke="${colors[i]}"/>`;for(const p of s.series)svg+=`<circle cx="${X(p.date)}" cy="${Y(p.value)}" r="3" fill="${colors[i]}"><title>${esc(s.name)} · ${p.date} · ${p.value.toLocaleString()}회</title></circle>`;});
 [dates[0],dates[Math.floor(dates.length/2)],dates.at(-1)].forEach((d,i)=>svg+=`<text x="${X(d)}" y="${H-8}" text-anchor="${i===0?'start':i===2?'end':'middle'}">${d.slice(5)}</text>`);
 $('#trend').innerHTML=svg+'</svg>';$('#chart-date').textContent=`${dates[0]} ~ ${dates.at(-1)} · 확보 ${dates.length}일`;
 }
 const source=$('#basis').value==='seed',bars=source?seed[family]:ms,top=Math.max(...bars.map(x=>x.value),1);
 $('#bars').innerHTML=bars.length?bars.map((x,i)=>`<div class="bar-row"><div class="bar-label"><b>${esc(x.name)}</b><span title="${x.value.toLocaleString()}">${fmt(x.value)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${x.value/top*100}%;background:${colors[i]}"></div></div>${!source?`<div class="small">${x.date} 종료 ${x.status==='stale'?'· 갱신 실패 / 이전값':''}</div>`:''}</div>`).join(''):'<div class="empty">조회값 없음</div>';
 $('#bars-note').textContent=source?'원문 확인 2026.11.11~12 · 정확한 집계기간 미기재':'각 값의 집계 종료일을 확인하세요. 작은 값도 숫자로 함께 표시합니다.';
}
for(const b of document.querySelectorAll('[data-family]'))b.onclick=()=>{family=b.dataset.family;document.querySelectorAll('[data-family]').forEach(x=>x.classList.toggle('selected',x===b));renderChart()};
$('#period').onchange=renderChart;$('#basis').onchange=renderChart;
$('#refresh').onclick=async()=>{const b=$('#refresh');b.disabled=true;$('#status').textContent='게시된 저장 데이터를 다시 읽고 있습니다…';try{let r=await fetch('data/live.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status===429?'1분 뒤 다시 시도해 주세요.':`서버 응답 ${r.status}`);let d=await r.json();if(d.busy)throw new Error('다른 갱신이 진행 중입니다.');live=d;render();$('#status').textContent=`저장 데이터 읽기 완료 · 수집 성공 ${9-(d.errors||[]).length} / 실패 ${(d.errors||[]).length}`;}catch(e){$('#status').textContent='갱신하지 못했습니다. 현재 화면의 이전값을 유지합니다. '+e.message;}finally{b.disabled=false}};
$('#export').onclick=()=>{let blob=new Blob([JSON.stringify({seed,live},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ai-pulse-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
(async()=>{try{if(window.AI_PULSE_DATA){({seed,live}=window.AI_PULSE_DATA);$('#refresh').disabled=true;$('#refresh').textContent='저장본 · 갱신 불가';$('#schedule').textContent='오프라인 검토용 저장본 · 정기 갱신은 아직 미설정';}else{seed=await(await fetch('data/seed.json')).json();live=await(await fetch('data/live.json')).json();}render();}catch(e){$('#status').textContent='데이터를 불러오지 못했습니다: '+e.message;}})();

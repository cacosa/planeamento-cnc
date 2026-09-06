const seed={clients:[{id:'c1',name:'Cliente A'},{id:'c2',name:'Cliente B'}],machines:[{id:'m1',code:'SL30',group:'TORNOS'},{id:'m2',code:'V8300',group:'TORNOS'},{id:'m3',code:'UMC1000-1',group:'UMC1000'},{id:'m4',code:'UMC1000-2',group:'UMC1000'},{id:'m5',code:'UMC750-1',group:'UMC750'},{id:'m6',code:'UMC750-2',group:'UMC750'},{id:'m7',code:'UMC750-3',group:'UMC750'},{id:'m8',code:'VF3',group:'VF3'},{id:'m9',code:'EC1600',group:'EC1600'}],employees:[
{id:'e1',name:'Sr. Silva',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e2',name:'Andrii',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e3',name:'José Gusmão',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e4',name:'Tiago Gil',shift:'Tarde',start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
{id:'e5',name:'Diogo',shift:'Tarde',start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
{id:'e6',name:'Gonçalo',shift:'Noite',start:'23:00',end:'07:00',breaks:[{start:'02:00',end:'02:10'},{start:'04:30',end:'05:00'}]}
],parts:[{id:'p1',code:'12345678',desc:'Carter 509',client:'c1'},{id:'p2',code:'87654321',desc:'Peça 510',client:'c2'}],ops:[{id:'o1',part:'p1',op:'OP10',min:28,setup:2,groups:['UMC750','UMC1000']},{id:'o2',part:'p1',op:'OP20',min:18,setup:2,groups:['UMC750','TORNOS']},{id:'o3',part:'p2',op:'OP10',min:32,setup:2,groups:['UMC750','UMC1000','TORNOS']}],jobs:[]};
const state=JSON.parse(localStorage.getItem('cnc-v12')||'null')||structuredClone(seed);
state.saturdays=JSON.parse(localStorage.getItem('cnc-v13-saturdays')||'{}');
state.start=startWeek(new Date());
state.weeksVisible=4;
const shiftDefaults={
 'Manhã':{start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
 'Tarde':{start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
 'Noite':{start:'23:00',end:'07:00',breaks:[{start:'02:00',end:'02:10'},{start:'04:30',end:'05:00'}]}
};
state.employees.forEach(e=>{
 const d=shiftDefaults[e.shift]||shiftDefaults['Manhã'];
 if(!e.start)e.start=d.start;
 if(!e.end)e.end=d.end;
 if(!Array.isArray(e.breaks))e.breaks=structuredClone(d.breaks);
});
let editJob=null,jobCtx=null,editPart=null,editClient=null,editEmp=null;const $=id=>document.getElementById(id);const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){
 localStorage.setItem('cnc-v12',JSON.stringify({clients:state.clients,machines:state.machines,employees:state.employees,parts:state.parts,ops:state.ops,jobs:state.jobs}));
 localStorage.setItem('cnc-v13-saturdays',JSON.stringify(state.saturdays||{}));
}function startWeek(d){d=new Date(d);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}function add(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}function ds(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}function pd(s){let [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}function fmt(d){return new Intl.DateTimeFormat('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'}).format(d)}
function weekdayName(d){
 const names=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
 return names[d.getDay()];
}
function compactDate(d){
 return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}function part(id){return state.parts.find(x=>x.id===id)}function op(id){return state.ops.find(x=>x.id===id)}function mach(id){return state.machines.find(x=>x.id===id)}function cname(id){return state.clients.find(x=>x.id===id)?.name||'—'}
function emp(id){return state.employees.find(x=>x.id===id)}
function tm(s){
 if(!s)return 0;
 let [h,m]=s.split(':').map(Number);
 return h*60+m;
}
function shiftMinutes(e){
 if(!e)return 0;
 let a=tm(e.start),b=tm(e.end);
 if(b<=a)b+=1440;
 return b-a;
}
function breakMinutes(e){
 return (e?.breaks||[]).reduce((sum,b)=>{
   let a=tm(b.start),z=tm(b.end);
   if(z<a)z+=1440;
   return sum+Math.max(0,z-a);
 },0);
}
function netHours(e){
 return Math.max(0,(shiftMinutes(e)-breakMinutes(e))/60);
}
function jobCapacityHours(j){
 return [j.m,j.a,j.n].filter(Boolean).reduce((sum,id)=>sum+netHours(emp(id)),0);
}
function fmtHours(h){
 let mins=Math.round(h*60),hh=Math.floor(mins/60),mm=mins%60;
 return `${hh} h ${String(mm).padStart(2,'0')} min`;
}
function turns(j){return [j.m,j.a,j.n].filter(Boolean).length}
function hrs(j){let o=op(j.op);return o?o.setup+j.qty*o.min/60:0}
function saturdayActive(d){return !!state.saturdays[ds(d)]}
function workingDay(d){
 const w=d.getDay();
 if(w===0)return false;
 if(w===6)return saturdayActive(d);
 return true;
}
function nextWorkingDay(d){
 let x=new Date(d);
 do{x=add(x,1)}while(!workingDay(x));
 return x;
}
function normalizeStartDate(d){
 let x=new Date(d);
 while(!workingDay(x))x=add(x,1);
 return x;
}
function end(j){
 let remaining=hrs(j),cap=jobCapacityHours(j);
 if(cap<=0)return pd(j.start);
 let cur=normalizeStartDate(pd(j.start));
 while(remaining>cap+1e-9){
   remaining-=cap;
   cur=nextWorkingDay(cur);
 }
 return new Date(cur.getTime()+(remaining/cap)*86400000);
}
function dur(j){return (end(j)-pd(j.start))/86400000}
function tabs(){document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(b.dataset.v).classList.add('active')});document.querySelectorAll('.close').forEach(b=>b.onclick=()=>$(b.dataset.d).close())}
function isoWeek(d){
 const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
 const day=x.getUTCDay()||7;
 x.setUTCDate(x.getUTCDate()+4-day);
 const yearStart=new Date(Date.UTC(x.getUTCFullYear(),0,1));
 return Math.ceil((((x-yearStart)/86400000)+1)/7);
}
function render(){gantt();partsTable();clientsTable();peopleTable();fillPeople()}
function canRunOnMachine(job,mid){
 let o=op(job.op),m=mach(mid);
 return !!(o&&m&&o.groups.includes(m.group));
}
function moveJobByDrag(jobId,mid,dateStr){
 let j=state.jobs.find(x=>x.id===jobId);
 if(!j)return;
 let target=pd(dateStr);
 if(!workingDay(target)){
   alert(target.getDay()===0?'Domingo não é dia de trabalho.':'Este sábado está inativo. Ative-o primeiro.');
   return;
 }
 if(!canRunOnMachine(j,mid)){
   alert('Esta peça/operação não pode ser executada nesta máquina.');
   return;
 }
 let oldMachine=j.machine;
 j.machine=mid;
 j.start=dateStr;
 if(oldMachine!==mid)push(oldMachine);
 push(mid);
 save();
 render();
}
function gantt(){
 const totalDays=state.weeksVisible*7;
 let e=add(state.start,totalDays-1);
 $('period').textContent=`${state.start.toLocaleDateString('pt-PT')} — ${e.toLocaleDateString('pt-PT')}`;
 let g=$('gantt');g.innerHTML='';

 // Dynamic width according to the selected number of weeks.
 g.style.setProperty('--days', String(totalDays));
 g.classList.remove('weeks-2','weeks-4','weeks-6');
 g.classList.add(`weeks-${state.weeksVisible}`);

 let wb=document.createElement('div');
 wb.className='weekband';
 wb.style.gridTemplateColumns=`155px repeat(${totalDays}, minmax(var(--day-min),1fr))`;
 let html='<div class="week-machine">Máquina</div>';
 for(let w=0;w<state.weeksVisible;w++){
   html+=`<div class="week-span" style="grid-column:${2+w*7} / span 7">Semana ${isoWeek(add(state.start,w*7))}</div>`;
 }
 wb.innerHTML=html;
 g.appendChild(wb);

 let h=document.createElement('div');
 h.className='hdr';
 h.style.gridTemplateColumns=`155px repeat(${totalDays}, minmax(var(--day-min),1fr))`;
 h.innerHTML='<div>Data</div>';
 for(let i=0;i<totalDays;i++){
   let d=add(state.start,i),w=d.getDay();
   let cls=(w===0||w===6)?'weekend':'';
   if(w===6)cls+=' saturday-toggle'+(typeof saturdayActive==='function'&&saturdayActive(d)?' sat-active':'');
   if(w===0)cls+=' sunday-locked';
   h.innerHTML+=`<div class="${cls.trim()}" data-day="${i}"><span class="weekday">${esc(weekdayName(d))}</span><span class="date-under">${esc(compactDate(d))}</span></div>`;
 }
 g.appendChild(h);

 if(typeof saturdayActive==='function'){
   h.querySelectorAll('.saturday-toggle').forEach(el=>{
     el.addEventListener('click',()=>{
       const i=Number(el.dataset.day),d=add(state.start,i),key=ds(d);
       state.saturdays[key]=!state.saturdays[key];
       save();
       if(typeof repushAll==='function')repushAll();
       render();
     });
   });
 }

 [...state.machines].sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true})).forEach(m=>{
   let r=document.createElement('div');
   r.className='machine';
   r.style.gridTemplateColumns=`155px repeat(${totalDays}, minmax(var(--day-min),1fr))`;

   let n=document.createElement('div');n.className='mname';n.textContent=m.code;r.appendChild(n);

   for(let i=0;i<totalDays;i++){
     let d=add(state.start,i),w=d.getDay();
     let work=typeof workingDay==='function'?workingDay(d):true;
     let c=document.createElement('div');
     c.className='cell'+((w===0||w===6)?' weekend':'')+(w===6&&work?' sat-active':'')+(!work?' nonworking':'');
     c.dataset.machine=m.id;
     c.dataset.date=ds(d);
     if(work){
       c.addEventListener('dragover',ev=>{ev.preventDefault();c.classList.add('drag-target')});
       c.addEventListener('dragleave',()=>c.classList.remove('drag-target'));
       c.addEventListener('drop',ev=>{
         ev.preventDefault();c.classList.remove('drag-target');
         const id=ev.dataTransfer.getData('text/plain');
         if(id)moveJobByDrag(id,m.id,ds(d));
       });
     }
     let bt=document.createElement('button');bt.textContent='+';
     if(work)bt.onclick=()=>newJob(m.id,i);
     else{
       bt.disabled=true;
       bt.title=w===0?'Domingo sem trabalho':'Sábado inativo — clique no cabeçalho para ativar';
     }
     c.appendChild(bt);r.appendChild(c);
   }

   let jobs=state.jobs.filter(j=>j.machine===m.id).sort((a,b)=>pd(a.start)-pd(b.start));
   jobs.forEach((j,idx)=>{
     let off=Math.round((pd(j.start)-state.start)/86400000),dd=Math.max(.2,dur(j));
     if(off>totalDays-1||off+dd<0)return;
     let s=Math.max(0,off),ee=Math.min(totalDays,off+dd),v=ee-s,b=document.createElement('button');
     b.className='bar '+(j.status==='Concluída'?'done':end(j)<new Date()?'late':idx%2?'g2':'g1');
     b.style.left=`calc(155px + (100% - 155px) * ${s/totalDays})`;
     b.style.width=`calc((100% - 155px) * ${v/totalDays} - 5px)`;
     let o=op(j.op),p=part(o?.part);
     const cap=typeof jobCapacityHours==='function'?fmtHours(jobCapacityHours(j)):`${turns(j)} turno(s)`;
     b.innerHTML=`<strong>${esc(p?.code)} · ${esc(o?.op)} · ${j.qty} pç</strong><span>${cap}/dia · ${hrs(j).toFixed(1)} h</span>`;
     b.draggable=true;
     b.title='Arraste para alterar a data/máquina ou clique para editar';
     b.addEventListener('dragstart',ev=>{
       ev.dataTransfer.effectAllowed='move';
       ev.dataTransfer.setData('text/plain',j.id);
       b.classList.add('dragging');
     });
     b.addEventListener('dragend',()=>b.classList.remove('dragging'));
     b.onclick=()=>editJobOpen(j);r.appendChild(b);
   });
   g.appendChild(r);
 });
}
function fillPeople(){[['morn','Manhã'],['aft','Tarde'],['night','Noite']].forEach(([id,sh])=>{let s=$(id),v=s.value;s.innerHTML='<option value="">— Sem operador —</option>'+state.employees.filter(e=>e.shift===sh).map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('');s.value=v})}function allowed(mid){let mg=mach(mid)?.group;return state.ops.filter(o=>o.groups.includes(mg))}function fillOps(mid,current=''){let s=$('jobOp');s.innerHTML=allowed(mid).map(o=>{let p=part(o.part);return `<option value="${o.id}" ${o.id===current?'selected':''}>${esc(p.code)} · ${esc(o.op)} — ${o.min} min/pç</option>`}).join('')}
function newJob(mid,day){
 let requested=add(state.start,day);
 if(!workingDay(requested)){
   alert(requested.getDay()===0?'Domingo não é dia de trabalho.':'Este sábado está inativo. Clique no cabeçalho do sábado para o ativar.');
   return;
 }
 editJob=null;jobCtx={mid,day};$('jobTitle').textContent='Nova produção';$('jobMeta').textContent=`${mach(mid)?.code} · ${fmt(add(state.start,day))}`;fillOps(mid);$('jobQty').value=20;$('jobDate').value=ds(add(state.start,day));$('morn').value='';$('aft').value='';$('night').value='';$('status').value='Programada';$('delJob').classList.add('hidden');forecast();$('jobDlg').showModal();
}
function editJobOpen(j){
 editJob=j.id;jobCtx={mid:j.machine,day:Math.round((pd(j.start)-state.start)/86400000)};$('jobTitle').textContent='Editar produção';$('jobMeta').textContent=`${mach(j.machine)?.code} · ${pd(j.start).toLocaleDateString('pt-PT')}`;fillOps(j.machine,j.op);$('jobQty').value=j.qty;$('jobDate').value=j.start;$('morn').value=j.m||'';$('aft').value=j.a||'';$('night').value=j.n||'';$('status').value=j.status||'Programada';$('delJob').classList.remove('hidden');forecast();$('jobDlg').showModal();
}
function formJob(){
 let chosen=$('jobDate').value||ds(add(state.start,jobCtx.day));
 return{id:editJob||uid('j'),machine:jobCtx.mid,op:$('jobOp').value,qty:Math.max(1,Math.floor(+$('jobQty').value||1)),start:chosen,m:$('morn').value||null,a:$('aft').value||null,n:$('night').value||null,status:$('status').value};
}
function forecast(){
 if(!$('jobOp').value)return;
 let j=formJob(),cap=jobCapacityHours(j);
 if(cap<=0){
   $('forecast').textContent=`${hrs(j).toFixed(1)} h necessárias · escolha pelo menos um operador`;
   return;
 }
 let e=end(j);
 $('forecast').textContent=`${hrs(j).toFixed(1)} h necessárias · capacidade ${fmtHours(cap)}/dia · fim previsto ${e.toLocaleDateString('pt-PT')}`;
}
['jobOp','jobQty','jobDate','morn','aft','night'].forEach(id=>$(id).addEventListener('input',forecast));
$('jobForm').onsubmit=e=>{
 e.preventDefault();
 let j=formJob();
 let chosen=pd(j.start);
 if(!workingDay(chosen)){
   alert(chosen.getDay()===0?'Domingo não é dia de trabalho.':'Este sábado está inativo. Ative-o no cabeçalho ou escolha outro dia.');
   return;
 }
 if(!turns(j))return forecast();
 let old=state.jobs.find(x=>x.id===j.id);
 let oldMachine=old?.machine;
 let i=state.jobs.findIndex(x=>x.id===j.id);
 if(i>=0)state.jobs[i]=j;else state.jobs.push(j);
 if(oldMachine&&oldMachine!==j.machine)push(oldMachine);
 push(j.machine);
 save();$('jobDlg').close();render();
};
function push(mid){
 let a=state.jobs.filter(j=>j.machine===mid).sort((x,y)=>pd(x.start)-pd(y.start));
 for(let i=0;i<a.length;i++){
   let cur=a[i];
   let ns=normalizeStartDate(pd(cur.start));
   if(ds(ns)!==cur.start)cur.start=ds(ns);
   if(i===0)continue;
   let prev=a[i-1],prevEnd=end(prev),curStart=pd(cur.start);
   if(prevEnd>curStart){
     let next=new Date(prevEnd);
     next.setHours(0,0,0,0);
     if(prevEnd.getHours()||prevEnd.getMinutes()||prevEnd.getSeconds()||prevEnd.getMilliseconds())next=add(next,1);
     next=normalizeStartDate(next);
     cur.start=ds(next);
   }
 }
}
function repushAll(){state.machines.forEach(m=>push(m.id));save()}
$('delJob').onclick=()=>{state.jobs=state.jobs.filter(j=>j.id!==editJob);save();$('jobDlg').close();render();};
function partsTable(){$('partsTable').innerHTML=`<table><thead><tr><th>Código</th><th>Descrição</th><th>Cliente</th><th>Operações</th><th></th></tr></thead><tbody>${state.parts.sort((a,b)=>a.code.localeCompare(b.code)).map(p=>`<tr><td><strong>${esc(p.code)}</strong></td><td>${esc(p.desc)}</td><td>${esc(cname(p.client))}</td><td>${state.ops.filter(o=>o.part===p.id).map(o=>`${esc(o.op)} · ${o.min} min`).join('<br>')}</td><td><button class="edit ep" data-id="${p.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;document.querySelectorAll('.ep').forEach(b=>b.onclick=()=>partDlg(b.dataset.id))}function groups(){return [...new Set(state.machines.map(m=>m.group))].sort()}function fillClients(){let s=$('pclient');s.innerHTML=state.clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}function opRow(o={op:'OP10',min:10,setup:0,groups:[]}){let r=document.createElement('div');r.className='oprow';r.dataset.id=o.id||'';r.innerHTML=`<label>Operação<input class="oc" value="${esc(o.op)}"></label><div><div style="font-size:14px;font-weight:600;margin-bottom:5px">Máquinas</div><div class="checks"></div></div><label>Min/pç<input class="om" type="number" min="0.1" step="0.1" value="${o.min}"></label><label>Setup h<input class="os" type="number" min="0" step="0.1" value="${o.setup}"></label><button type="button" class="danger ro">Remover</button>`;let c=r.querySelector('.checks');groups().forEach(g=>c.innerHTML+=`<label><input type="checkbox" value="${esc(g)}" ${o.groups.includes(g)?'checked':''}> ${esc(g)}</label>`);r.querySelector('.ro').onclick=()=>r.remove();$('ops').appendChild(r)}function partDlg(id=null){editPart=id;fillClients();$('ops').innerHTML='';$('perror').textContent='';if(id){let p=part(id);$('partTitle').textContent='Editar peça';$('pcode').value=p.code;$('pdesc').value=p.desc;$('pclient').value=p.client;state.ops.filter(o=>o.part===id).forEach(opRow);$('delPart').classList.remove('hidden')}else{$('partTitle').textContent='Adicionar peça';$('pcode').value='';$('pdesc').value='';opRow();$('delPart').classList.add('hidden')}$('partDlg').showModal()}$('addPart').onclick=()=>partDlg();$('addOp').onclick=()=>opRow();$('partForm').onsubmit=e=>{e.preventDefault();let code=$('pcode').value.trim();if(!/^\d{8}$/.test(code))return $('perror').textContent='O código deve ter exatamente 8 dígitos.';if(state.parts.some(p=>p.code===code&&p.id!==editPart))return $('perror').textContent='Já existe uma peça com este código.';let rows=[...$('ops').querySelectorAll('.oprow')];if(!rows.length)return $('perror').textContent='Adicione pelo menos uma operação.';let pid=editPart||uid('p'),p={id:pid,code,desc:$('pdesc').value.trim(),client:$('pclient').value},pi=state.parts.findIndex(x=>x.id===pid);if(pi>=0)state.parts[pi]=p;else state.parts.push(p);let keep=[];for(let r of rows){let gs=[...r.querySelectorAll('.checks input:checked')].map(x=>x.value);if(!gs.length)return $('perror').textContent='Cada operação precisa de pelo menos uma máquina.';let oid=r.dataset.id||uid('o');keep.push(oid);let n={id:oid,part:pid,op:r.querySelector('.oc').value.trim().toUpperCase(),min:+r.querySelector('.om').value,setup:+r.querySelector('.os').value,groups:gs},i=state.ops.findIndex(o=>o.id===oid);if(i>=0)state.ops[i]=n;else state.ops.push(n)}state.ops=state.ops.filter(o=>o.part!==pid||keep.includes(o.id));save();$('partDlg').close();render()};$('delPart').onclick=()=>{let ids=state.ops.filter(o=>o.part===editPart).map(o=>o.id);if(state.jobs.some(j=>ids.includes(j.op)))return $('perror').textContent='Esta peça está usada no planeamento.';state.ops=state.ops.filter(o=>o.part!==editPart);state.parts=state.parts.filter(p=>p.id!==editPart);save();$('partDlg').close();render()};
function clientsTable(){$('clientsTable').innerHTML=`<table><thead><tr><th>Cliente</th><th></th></tr></thead><tbody>${state.clients.sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<tr><td>${esc(c.name)}</td><td><button class="edit ec" data-id="${c.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;document.querySelectorAll('.ec').forEach(b=>b.onclick=()=>clientDlg(b.dataset.id))}function clientDlg(id=null){editClient=id;let c=state.clients.find(x=>x.id===id);$('clientTitle').textContent=id?'Editar cliente':'Adicionar cliente';$('cname').value=c?.name||'';$('delClient').classList.toggle('hidden',!id);$('clientDlg').showModal()}$('addClient').onclick=()=>clientDlg();$('clientForm').onsubmit=e=>{e.preventDefault();let c={id:editClient||uid('c'),name:$('cname').value.trim()},i=state.clients.findIndex(x=>x.id===c.id);if(i>=0)state.clients[i]=c;else state.clients.push(c);save();$('clientDlg').close();render()};$('delClient').onclick=()=>{if(state.parts.some(p=>p.client===editClient))return alert('Este cliente está associado a peças.');state.clients=state.clients.filter(c=>c.id!==editClient);save();$('clientDlg').close();render()};
function peopleTable(){
 $('peopleTable').innerHTML=`<table><thead><tr><th>Colaborador</th><th>Turno</th><th>Horário</th><th>Intervalos</th><th>Horas líquidas</th><th></th></tr></thead><tbody>${state.employees.sort((a,b)=>a.name.localeCompare(b.name)).map(e=>`<tr><td>${esc(e.name)}</td><td>${esc(e.shift)}</td><td>${esc(e.start)}–${esc(e.end)}</td><td>${(e.breaks||[]).map(b=>`${esc(b.start)}–${esc(b.end)}`).join('<br>')||'—'}</td><td><strong>${fmtHours(netHours(e))}</strong></td><td><button class="edit ee" data-id="${e.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.ee').forEach(b=>b.onclick=()=>empDlg(b.dataset.id));
}
function addBreakRow(br={start:'',end:''}){
 let r=document.createElement('div');r.className='breakrow';
 r.innerHTML=`<label>Início<input class="bstart" type="time" value="${esc(br.start)}" required></label><label>Fim<input class="bend" type="time" value="${esc(br.end)}" required></label><button type="button" class="danger bremove">Remover</button>`;
 r.querySelector('.bremove').onclick=()=>{r.remove();updateEmployeeNet()};
 r.querySelectorAll('input').forEach(i=>i.addEventListener('input',updateEmployeeNet));
 $('breaks').appendChild(r);
}
function employeeFormData(){
 return{
   id:editEmp||uid('e'),
   name:$('ename').value.trim(),
   shift:$('eshift').value,
   start:$('estart').value,
   end:$('eend').value,
   breaks:[...$('breaks').querySelectorAll('.breakrow')].map(r=>({start:r.querySelector('.bstart').value,end:r.querySelector('.bend').value}))
 };
}
function updateEmployeeNet(){
 let e=employeeFormData(),h=netHours(e);
 $('enet').textContent=fmtHours(h);
 $('eerror').textContent=h>0?'':'O horário líquido tem de ser superior a zero.';
}
function empDlg(id=null){
 editEmp=id;let e=state.employees.find(x=>x.id===id);
 let def=shiftDefaults[e?.shift||'Manhã'];
 $('empTitle').textContent=id?'Editar colaborador':'Adicionar colaborador';
 $('ename').value=e?.name||'';
 $('eshift').value=e?.shift||'Manhã';
 $('estart').value=e?.start||def.start;
 $('eend').value=e?.end||def.end;
 $('breaks').innerHTML='';
 (e?.breaks||structuredClone(def.breaks)).forEach(addBreakRow);
 $('delEmp').classList.toggle('hidden',!id);
 $('eerror').textContent='';
 updateEmployeeNet();
 $('empDlg').showModal();
}
$('addEmp').onclick=()=>empDlg();
$('addBreak').onclick=()=>{addBreakRow();updateEmployeeNet()};
$('eshift').addEventListener('change',()=>{
 if(!editEmp){
   let d=shiftDefaults[$('eshift').value];
   $('estart').value=d.start;$('eend').value=d.end;$('breaks').innerHTML='';structuredClone(d.breaks).forEach(addBreakRow);updateEmployeeNet();
 }
});
['estart','eend'].forEach(id=>$(id).addEventListener('input',updateEmployeeNet));
$('empForm').onsubmit=e=>{
 e.preventDefault();let x=employeeFormData();
 if(netHours(x)<=0){$('eerror').textContent='O horário líquido tem de ser superior a zero.';return}
 let i=state.employees.findIndex(y=>y.id===x.id);
 if(i>=0)state.employees[i]=x;else state.employees.push(x);
 repushAll();save();$('empDlg').close();render();
};
$('delEmp').onclick=()=>{
 if(state.jobs.some(j=>[j.m,j.a,j.n].includes(editEmp)))return alert('Este colaborador está usado no planeamento.');
 state.employees=state.employees.filter(e=>e.id!==editEmp);save();$('empDlg').close();render();
};
$('prev').onclick=()=>{state.start=add(state.start,-14);gantt()};$('next').onclick=()=>{state.start=add(state.start,14);gantt()};$('today').onclick=()=>{state.start=startWeek(new Date());
state.weeksVisible=4;gantt()};tabs();render();

$('weeksVisible')?.addEventListener('change',()=>{state.weeksVisible=Number($('weeksVisible').value)||4;gantt()});

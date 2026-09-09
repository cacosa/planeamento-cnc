const seed={
clients:[{id:'c1',name:'Cliente A'},{id:'c2',name:'Cliente B'}],
machines:[
{id:'m1',code:'SL30',group:'SL30'},{id:'m2',code:'V8300',group:'V8300'},
{id:'m3',code:'UMC1000-1',group:'UMC1000'},{id:'m4',code:'UMC1000-2',group:'UMC1000'},
{id:'m5',code:'UMC750-1',group:'UMC750'},{id:'m6',code:'UMC750-2',group:'UMC750'},
{id:'m7',code:'UMC750-3',group:'UMC750'},{id:'m8',code:'VF3',group:'VF3'},
{id:'m9',code:'EC1600',group:'EC1600'},{id:'m-serralharia',code:'Serralharia',group:'SERRALHARIA',type:'Serralharia'}
],
employees:[
{id:'e1',name:'Sr. Silva',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e2',name:'Andrii',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e3',name:'José Gusmão',shift:'Manhã',start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
{id:'e4',name:'Tiago Gil',shift:'Tarde',start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
{id:'e5',name:'Diogo',shift:'Tarde',start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
{id:'e6',name:'Gonçalo',shift:'Noite',start:'23:00',end:'07:00',breaks:[{start:'02:00',end:'02:10'},{start:'04:30',end:'05:00'}]}
],
parts:[
{id:'p1',code:'12345678',desc:'Carter 509',client:'c1',accessories:[]},
{id:'p2',code:'87654321',desc:'Peça 510',client:'c2',accessories:[]}
],
ops:[
{id:'o1',part:'p1',op:'OP1',min:28,setup:2,groups:['UMC750','UMC1000']},
{id:'o2',part:'p1',op:'OP2',min:18,setup:2,groups:['UMC750','SL30','V8300']},
{id:'o3',part:'p2',op:'OP1',min:32,setup:2,groups:['UMC750','UMC1000','SL30','V8300']}
],
jobs:[],alerts:[],calendar:[]
};

const state=JSON.parse(localStorage.getItem('cnc-v12')||'null')||structuredClone(seed);
state.saturdays=JSON.parse(localStorage.getItem('cnc-v13-saturdays')||'{}');
state.start=startWeek(new Date());
state.weeksVisible=4;

const shiftDefaults={
 'Manhã':{start:'07:00',end:'15:00',breaks:[{start:'10:00',end:'10:10'},{start:'12:30',end:'13:00'}]},
 'Tarde':{start:'15:00',end:'23:00',breaks:[{start:'18:00',end:'18:10'},{start:'20:30',end:'21:00'}]},
 'Noite':{start:'23:00',end:'07:00',breaks:[{start:'02:00',end:'02:10'},{start:'04:30',end:'05:00'}]}
};

const MACHINE_ORDER=['EC1600','VF3','UMC750-1','UMC750-2','UMC750-3','UMC1000-1','UMC1000-2','SL30','V8300','Serralharia'];
const COMPAT_GROUPS=['EC1600','VF3','UMC750','UMC1000','SL30','V8300','SERRALHARIA'];

const $=id=>document.getElementById(id);
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function startWeek(d){d=new Date(d);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function add(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}
function ds(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function pd(s){let [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function compactDate(d){return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`}
function localDateTimeValue(d=new Date()){let z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`}
function fmtDateTime(v){if(!v)return '—';return new Date(v).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})}
function weekdayName(d){return ['domingo','segunda','terça','quarta','quinta','sexta','sábado'][d.getDay()]}
function part(id){return state.parts.find(x=>x.id===id)}
function op(id){return state.ops.find(x=>x.id===id)}
function mach(id){return state.machines.find(x=>x.id===id)}
function emp(id){return state.employees.find(x=>x.id===id)}
function cname(id){return state.clients.find(x=>x.id===id)?.name||'—'}
function opNumber(v){let m=String(v||'').toUpperCase().match(/^OP\s*(\d+)$/);return m?Number(m[1]):9999}
function machineOrder(m){let i=MACHINE_ORDER.indexOf(m.code);return i>=0?i:100+(m.order||0)}
function machineGroupForCode(code,oldGroup){
 if(code==='SL30')return 'SL30';
 if(code==='V8300')return 'V8300';
 if(code.startsWith('UMC750'))return 'UMC750';
 if(code.startsWith('UMC1000'))return 'UMC1000';
 if(code==='VF3')return 'VF3';
 if(code==='EC1600')return 'EC1600';
 if(code.toLowerCase()==='serralharia')return 'SERRALHARIA';
 return oldGroup||'OUTRO';
}

function normalizeState(){
 state.clients=Array.isArray(state.clients)?state.clients:[];
 state.machines=Array.isArray(state.machines)?state.machines:[];
 state.employees=Array.isArray(state.employees)?state.employees:[];
 state.parts=Array.isArray(state.parts)?state.parts:[];
 state.ops=Array.isArray(state.ops)?state.ops:[];
 state.jobs=Array.isArray(state.jobs)?state.jobs:[];
 state.alerts=Array.isArray(state.alerts)?state.alerts:[];
 state.alerts.forEach(a=>{if(!a.type)a.type='accessory'});
 state.saturdays=state.saturdays&&typeof state.saturdays==='object'?state.saturdays:{};
 state.calendar=Array.isArray(state.calendar)?state.calendar:[];
 Object.entries(state.saturdays||{}).filter(([,v])=>v).forEach(([date])=>{if(!state.calendar.some(x=>x.date===date))state.calendar.push({id:uid('cal'),date,type:'Sábado',description:'Sábado disponível (migrado da V2.0)',working:true,notes:''})});

 state.parts.forEach(p=>{if(!Array.isArray(p.accessories))p.accessories=[];if(p.dimensionalReport===undefined)p.dimensionalReport=false});
 state.jobs.forEach(j=>{
   if(j.of===undefined)j.of='';
   if(j.completedDate===undefined)j.completedDate=null;
   if(j.plannedEnd===undefined)j.plannedEnd=null;
   if(j.workSaturdays===undefined)j.workSaturdays=false;
   if(!Array.isArray(j.interruptions))j.interruptions=[];
 });
 state.employees.forEach(e=>{
   const d=shiftDefaults[e.shift]||shiftDefaults['Manhã'];
   if(!e.start)e.start=d.start;
   if(!e.end)e.end=d.end;
   if(!Array.isArray(e.breaks))e.breaks=structuredClone(d.breaks);
 });

 state.machines.forEach(m=>{
   m.group=machineGroupForCode(m.code,m.group);
   if(m.brand===undefined)m.brand='';if(m.model===undefined)m.model='';if(m.serial===undefined)m.serial='';if(m.year===undefined)m.year='';
   if(!Array.isArray(m.interventions))m.interventions=[];if(m.condition===undefined)m.condition=m.active===false?'Inativa':'Ativa';
   if(m.type===undefined)m.type=m.code.toLowerCase()==='serralharia'?'Serralharia':'CNC';
   if(m.active===undefined)m.active=true;
   m.order=machineOrder(m);
 });
 if(!state.machines.some(m=>m.code.toLowerCase()==='serralharia')){
   state.machines.push({id:'m-serralharia',code:'Serralharia',group:'SERRALHARIA',type:'Serralharia',active:true,order:9});
 }
 state.ops.forEach(o=>{
   let gs=Array.isArray(o.groups)?o.groups:[];
   if(gs.includes('TORNOS'))gs=[...gs.filter(g=>g!=='TORNOS'),'SL30','V8300'];
   o.groups=[...new Set(gs)];
 });
}
normalizeState();

let remoteReady=false,remoteSyncTimer=null,remoteSyncBusy=false;
function snapshotState(){
 return {version:21,clients:state.clients,machines:state.machines,employees:state.employees,parts:state.parts,ops:state.ops,jobs:state.jobs,alerts:state.alerts,saturdays:state.saturdays||{},calendar:state.calendar||[]};
}
function applySnapshot(data){
 if(!data||typeof data!=='object')return false;
 for(const k of ['clients','machines','employees','parts','ops','jobs','alerts','calendar'])if(Array.isArray(data[k]))state[k]=data[k];
 if(data.saturdays&&typeof data.saturdays==='object')state.saturdays=data.saturdays;
 normalizeState();
 return true;
}
function supabaseConfigured(){return !!(window.CNC_CONFIG?.SUPABASE_URL&&window.CNC_CONFIG?.SUPABASE_KEY)}
async function sbFetch(path,options={}){
 const base=window.CNC_CONFIG.SUPABASE_URL.replace(/\/$/,'');
 const headers={apikey:window.CNC_CONFIG.SUPABASE_KEY,Authorization:`Bearer ${window.CNC_CONFIG.SUPABASE_KEY}`,'Content-Type':'application/json',...(options.headers||{})};
 const res=await fetch(`${base}/rest/v1/${path}`,{...options,headers});
 if(!res.ok)throw new Error(`Supabase ${res.status}: ${await res.text()}`);
 const txt=await res.text();return txt?JSON.parse(txt):null;
}
function setMode(text,ok=false){if(!$('mode'))return;$('mode').textContent=text;$('mode').classList.toggle('online',ok)}
async function writeRemoteState(){
 if(!remoteReady||remoteSyncBusy)return;
 remoteSyncBusy=true;
 try{
   await sbFetch('app_state?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{id:1,data:snapshotState(),updated_at:new Date().toISOString()}])});
   setMode('Supabase ligado',true);
 }catch(err){console.error(err);setMode('Erro de sincronização')}
 finally{remoteSyncBusy=false}
}
function scheduleRemoteSave(){if(!remoteReady)return;clearTimeout(remoteSyncTimer);remoteSyncTimer=setTimeout(writeRemoteState,350)}
function save(){
 localStorage.setItem('cnc-v12',JSON.stringify({clients:state.clients,machines:state.machines,employees:state.employees,parts:state.parts,ops:state.ops,jobs:state.jobs,alerts:state.alerts,calendar:state.calendar}));
 localStorage.setItem('cnc-v13-saturdays',JSON.stringify(state.saturdays||{}));
 scheduleRemoteSave();
}
async function bootstrapRemote(){
 setMode('A ligar ao Supabase…');
 if(!supabaseConfigured()){remoteReady=false;setMode('Modo local');render();return}
 try{
   const rows=await sbFetch('app_state?id=eq.1&select=data,updated_at');
   if(Array.isArray(rows)&&rows.length&&rows[0].data){
     applySnapshot(rows[0].data);
     localStorage.setItem('cnc-v12',JSON.stringify({clients:state.clients,machines:state.machines,employees:state.employees,parts:state.parts,ops:state.ops,jobs:state.jobs,alerts:state.alerts,calendar:state.calendar}));
     localStorage.setItem('cnc-v13-saturdays',JSON.stringify(state.saturdays||{}));
   }else{
     await sbFetch('app_state?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{id:1,data:snapshotState(),updated_at:new Date().toISOString()}])});
   }
   remoteReady=true;setMode('Supabase ligado',true);render();
 }catch(err){console.error(err);remoteReady=false;setMode('Modo local — Supabase indisponível');render()}
}

function tm(s){if(!s)return 0;let [h,m]=s.split(':').map(Number);return h*60+m}
function shiftMinutes(e){if(!e)return 0;let a=tm(e.start),b=tm(e.end);if(b<=a)b+=1440;return b-a}
function breakMinutes(e){return (e?.breaks||[]).reduce((sum,b)=>{let a=tm(b.start),z=tm(b.end);if(z<a)z+=1440;return sum+Math.max(0,z-a)},0)}
function netHours(e){return Math.max(0,(shiftMinutes(e)-breakMinutes(e))/60)}
function jobCapacityHours(j){return [j.m,j.a,j.n].filter(Boolean).reduce((sum,id)=>sum+netHours(emp(id)),0)}
function fmtHours(h){let mins=Math.round(h*60),hh=Math.floor(mins/60),mm=mins%60;return `${hh} h ${String(mm).padStart(2,'0')} min`}
function turns(j){return [j.m,j.a,j.n].filter(Boolean).length}
function hrs(j){let o=op(j.op);return o?o.setup+j.qty*o.min/60:0}

function calendarEntry(d){return state.calendar.find(x=>x.date===ds(d))}
function saturdayActive(d){let e=calendarEntry(d);return d.getDay()===6&&!!(e&&e.working)}
function factoryWorkingDay(d){let w=d.getDay(),e=calendarEntry(d);if(w===0)return false;if(e)return !!e.working;if(w===6)return false;return true}
function jobWorkingDay(j,d){if(!factoryWorkingDay(d))return false;if(d.getDay()===6)return !!j?.workSaturdays;return true}
function nextWorkingDay(d,j=null){let x=new Date(d);do{x=add(x,1)}while(j?!jobWorkingDay(j,x):!factoryWorkingDay(x));return x}
function normalizeStartDate(d,j=null){let x=new Date(d);while(j?!jobWorkingDay(j,x):!factoryWorkingDay(x))x=add(x,1);return x}
function employeeWorkIntervalsForDay(e,d){
 if(!e)return [];
 const day=new Date(d);day.setHours(0,0,0,0);
 let start=tm(e.start),finish=tm(e.end);if(finish<=start)finish+=1440;
 let intervals=[[start,finish]];
 for(const br of (e.breaks||[])){
   let bs=tm(br.start),be=tm(br.end);if(be<=bs)be+=1440;
   while(bs<start){bs+=1440;be+=1440}
   const next=[];
   for(const [a,b] of intervals){
     if(be<=a||bs>=b){next.push([a,b]);continue}
     if(bs>a)next.push([a,Math.min(bs,b)]);
     if(be<b)next.push([Math.max(be,a),b]);
   }
   intervals=next;
 }
 return intervals.filter(([a,b])=>b>a).map(([a,b])=>[new Date(day.getTime()+a*60000),new Date(day.getTime()+b*60000)]);
}
function jobWorkIntervalsForDay(j,d){
 if(!jobWorkingDay(j,d))return [];
 let all=[j.m,j.a,j.n].filter(Boolean).flatMap(id=>employeeWorkIntervalsForDay(emp(id),d)).sort((x,y)=>x[0]-y[0]);
 if(!all.length)return [];
 let merged=[all[0]];
 for(const cur of all.slice(1)){
   let last=merged[merged.length-1];
   if(cur[0]<=last[1]){if(cur[1]>last[1])last[1]=cur[1]}else merged.push(cur);
 }
 return merged;
}
function interruptionLostHours(j,it,endIso=null){
 let a=new Date(it.startAt),b=new Date(endIso||it.resumeAt||new Date());if(!(a<b))return 0;
 let total=0,cur=new Date(a);cur.setHours(0,0,0,0);cur=add(cur,-1);
 const limit=new Date(b);limit.setHours(0,0,0,0);
 while(cur<=limit){
   for(const [s,e] of jobWorkIntervalsForDay(j,cur)){
     const from=new Date(Math.max(a,s)),to=new Date(Math.min(b,e));
     if(to>from)total+=(to-from)/3600000;
   }
   cur=add(cur,1);
 }
 return total;
}
function interruptionDelayHours(j){return (j.interruptions||[]).reduce((sum,it)=>sum+interruptionLostHours(j,it),0)}
function effectiveHours(j){return hrs(j)+interruptionDelayHours(j)}
function activeInterruption(j){return (j.interruptions||[]).find(it=>!it.resumeAt)||null}

function jobWorkSegments(j){
 let remaining=effectiveHours(j),cap=jobCapacityHours(j),segments=[];
 if(cap<=0)return segments;
 let cur=normalizeStartDate(pd(j.start),j),guard=0;
 while(remaining>1e-9&&guard++<1000){
   let used=Math.min(cap,remaining);
   segments.push({date:new Date(cur),frac:Math.min(1,used/cap)});
   remaining-=used;
   if(remaining>1e-9)cur=nextWorkingDay(cur,j);
 }
 return segments;
}
function end(j){
 let segs=jobWorkSegments(j);
 if(!segs.length)return pd(j.start);
 let last=segs[segs.length-1];
 return new Date(last.date.getTime()+last.frac*86400000);
}
function jobLastWorkDate(j){let segs=jobWorkSegments(j);return segs.length?segs[segs.length-1].date:pd(j.start)}
function nextStartAfterJob(j,targetJob=null){return nextWorkingDay(jobLastWorkDate(j),targetJob)}
function dur(j){return (end(j)-pd(j.start))/86400000}

function isoWeek(d){
 const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
 const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);
 const yearStart=new Date(Date.UTC(x.getUTCFullYear(),0,1));
 return Math.ceil((((x-yearStart)/86400000)+1)/7);
}

function tabs(){
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
   document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));
   document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
   $(b.dataset.v).classList.add('active');
 });
 document.querySelectorAll('.close').forEach(b=>b.onclick=()=>$(b.dataset.d).close());
}

function render(){
 gantt();partsTable();clientsTable();machinesTable();peopleTable();calendarTable();fillPeople();renderAlertBadge();
}

function canRunOnMachine(job,mid){let o=op(job.op),m=mach(mid);return !!(o&&m&&o.groups.includes(m.group))}
function allowed(mid){let mg=mach(mid)?.group;return state.ops.filter(o=>o.groups.includes(mg))}

function fillPeople(){
 [['morn','Manhã'],['aft','Tarde'],['night','Noite']].forEach(([id,sh])=>{
   let s=$(id),v=s.value;
   s.innerHTML='<option value="">— Sem operador —</option>'+state.employees.filter(e=>e.shift===sh).map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('');
   s.value=v;
 });
}
function fillOps(mid,current=''){
 let s=$('jobOp');
 let options=allowed(mid).sort((a,b)=>{
   let pa=part(a.part),pb=part(b.part);
   return (pa?.code||'').localeCompare(pb?.code||'')||opNumber(a.op)-opNumber(b.op);
 });
 s.innerHTML=options.map(o=>{
   let p=part(o.part);
   return `<option value="${o.id}" ${o.id===current?'selected':''}>${esc(p?.code)} - ${esc(p?.desc)} - ${esc(o.op)} - ${o.min} min/pç</option>`;
 }).join('');
 if(!options.length)s.innerHTML='<option value="">Nenhuma peça/operação compatível com esta máquina</option>';
}

function sequenceCheck(j){
 let curOp=op(j.op),n=opNumber(curOp?.op);
 if(!curOp||n<=1||n===9999)return {ok:true};
 if(!j.of)return {ok:true};
 let prevOp=state.ops.find(o=>o.part===curOp.part&&opNumber(o.op)===n-1);
 if(!prevOp)return {ok:true};
 let prevJob=state.jobs
   .filter(x=>x.id!==j.id&&x.of===j.of&&x.op===prevOp.id)
   .sort((a,b)=>pd(b.start)-pd(a.start))[0];
 if(!prevJob)return {ok:false,msg:`${curOp.op} não pode ser planeada antes de ${prevOp.op}. Não encontrei ${prevOp.op} para a OF ${j.of}.`};
 let earliest=prevJob.status==='Concluída'&&prevJob.completedDate?nextWorkingDay(pd(prevJob.completedDate),j):nextStartAfterJob(prevJob,j);
 if(pd(j.start)<earliest){
   return {ok:false,msg:`${curOp.op} só pode iniciar depois de ${prevOp.op}. Primeira data válida: ${earliest.toLocaleDateString('pt-PT')}.`,earliest};
 }
 return {ok:true};
}

function moveJobByDrag(jobId,mid,dateStr){
 let j=state.jobs.find(x=>x.id===jobId);
 if(!j)return;
 if(j.status==='Concluída')return alert('Esta produção está concluída e encontra-se bloqueada.');
 let target=pd(dateStr);
 if(!factoryWorkingDay(target))return alert(target.getDay()===0?'Domingo não é dia de trabalho.':'Esta data não está disponível no calendário de produção.');
 if(target.getDay()===6&&!j.workSaturdays)return alert('Esta produção não está autorizada a trabalhar ao sábado. Ative “Trabalhar aos sábados disponíveis” na produção.');
 if(!canRunOnMachine(j,mid))return alert('Esta peça/operação não pode ser executada nesta máquina.');
 let test={...j,machine:mid,start:dateStr},seq=sequenceCheck(test);
 if(!seq.ok)return alert(seq.msg);
 let oldMachine=j.machine;j.machine=mid;j.start=dateStr;
 if(oldMachine!==mid)push(oldMachine);push(mid);save();render();
}

function jobRuns(j){
 const segs=jobWorkSegments(j);
 let runs=[];
 for(const seg of segs){
   let last=runs[runs.length-1];
   if(last&&Math.round((seg.date-last.lastDate)/86400000)===1){
     last.days+=1;last.lastFrac=seg.frac;last.lastDate=seg.date;
   }else{
     runs.push({startDate:seg.date,lastDate:seg.date,days:1,lastFrac:seg.frac});
   }
 }
 return runs;
}

function gantt(){
 const totalDays=state.weeksVisible*7;
 let e=add(state.start,totalDays-1);
 $('period').textContent=`${state.start.toLocaleDateString('pt-PT')} — ${e.toLocaleDateString('pt-PT')}`;
 let g=$('gantt');g.innerHTML='';
 g.style.setProperty('--days',String(totalDays));
 g.classList.remove('weeks-2','weeks-4','weeks-6');g.classList.add(`weeks-${state.weeksVisible}`);

 let wb=document.createElement('div');wb.className='weekband';
 wb.style.gridTemplateColumns=`155px repeat(${totalDays},minmax(var(--day-min),1fr))`;
 let wh='<div class="week-machine">Máquina</div>';
 for(let w=0;w<state.weeksVisible;w++)wh+=`<div class="week-span" style="grid-column:${2+w*7} / span 7">Semana ${isoWeek(add(state.start,w*7))}</div>`;
 wb.innerHTML=wh;g.appendChild(wb);

 let h=document.createElement('div');h.className='hdr';
 h.style.gridTemplateColumns=`155px repeat(${totalDays},minmax(var(--day-min),1fr))`;h.innerHTML='<div>Data</div>';
 for(let i=0;i<totalDays;i++){
   let d=add(state.start,i),w=d.getDay(),cls=(w===0||w===6)?'weekend':'';if(!factoryWorkingDay(d))cls+=' nonworking-date';
   if(w===6)cls+=' saturday-toggle'+(saturdayActive(d)?' sat-active':'');
   if(w===0)cls+=' sunday-locked';
   h.innerHTML+=`<div class="${cls.trim()}" data-day="${i}"><span class="weekday">${esc(weekdayName(d))}</span><span class="date-under">${esc(compactDate(d))}</span></div>`;
 }
 g.appendChild(h);
 h.querySelectorAll('.saturday-toggle').forEach(el=>el.addEventListener('click',()=>{
   let d=add(state.start,Number(el.dataset.day));calendarDlg(ds(d));
 }));

 let machines=[...state.machines].filter(m=>m.active!==false).sort((a,b)=>machineOrder(a)-machineOrder(b));
 machines.forEach((m,mi)=>{
   let r=document.createElement('div');r.className='machine'+(mi&&[1,2,5,7,9].includes(mi)?' gantt-row-separator':'');
   r.style.gridTemplateColumns=`155px repeat(${totalDays},minmax(var(--day-min),1fr))`;
   let n=document.createElement('div');n.className='mname';n.textContent=m.code;r.appendChild(n);

   for(let i=0;i<totalDays;i++){
     let d=add(state.start,i),w=d.getDay(),work=factoryWorkingDay(d),c=document.createElement('div');
     c.className='cell'+((w===0||w===6)?' weekend':'')+(w===6&&work?' sat-active':'')+(!work?' nonworking':'');
     c.dataset.machine=m.id;c.dataset.date=ds(d);
     if(work){
       c.addEventListener('dragover',ev=>{ev.preventDefault();c.classList.add('drag-target')});
       c.addEventListener('dragleave',()=>c.classList.remove('drag-target'));
       c.addEventListener('drop',ev=>{ev.preventDefault();c.classList.remove('drag-target');let id=ev.dataTransfer.getData('text/plain');if(id)moveJobByDrag(id,m.id,ds(d))});
     }
     let bt=document.createElement('button');bt.textContent='+';
     if(work)bt.onclick=()=>newJob(m.id,i);else{bt.disabled=true;bt.title=w===0?'Domingo sem trabalho':'Data não disponível — configure no Calendário de Produção'}
     c.appendChild(bt);r.appendChild(c);
   }

   let jobs=state.jobs.filter(j=>j.machine===m.id).sort((a,b)=>pd(a.start)-pd(b.start));
   jobs.forEach((j,idx)=>{
     let o=op(j.op),p=part(o?.part),runs=jobRuns(j),labelDone=false,dimAlert=state.alerts.find(a=>a.jobId===j.id&&a.type==='dimensional'&&!a.archived&&!a.closed),dimPending=false;
     dimPending=!!(dimAlert&&!dimAlert.read);
     let names=[j.m,j.a,j.n].filter(Boolean).map(id=>emp(id)?.name).filter(Boolean).join(', ')||'Sem operador';
     let tooltip=[
       `OF: ${j.of||'—'}`,`Peça: ${p?.code||'—'} - ${p?.desc||'—'}`,`Operação: ${o?.op||'—'}`,
       `Quantidade: ${j.qty}`,`Tempo: ${hrs(j).toFixed(1)} h`,`Capacidade: ${fmtHours(jobCapacityHours(j))}/dia`,
       `Operadores: ${names}`,`Início: ${pd(j.start).toLocaleDateString('pt-PT')}`,
       `Fim previsto: ${jobLastWorkDate(j).toLocaleDateString('pt-PT')}`,
       j.completedDate?`Fim real: ${pd(j.completedDate).toLocaleDateString('pt-PT')}`:'',
       j.workSaturdays?'Sábados disponíveis: SIM':'Sábados disponíveis: NÃO',
       p?.dimensionalReport?`Relatório dimensional: necessário (${dimPending?'PENDENTE':'alerta lido'})`:'',
       (j.interruptions||[]).length?`Interrupções: ${(j.interruptions||[]).length} · paragem acumulada ${fmtHours(interruptionDelayHours(j))}`:''
     ].filter(Boolean).join('\n');

     runs.forEach(run=>{
       let off=Math.round((run.startDate-state.start)/86400000);
       let width=(run.days-1)+run.lastFrac;
       if(off>totalDays-1||off+width<0)return;
       let s=Math.max(0,off),ee=Math.min(totalDays,off+width),v=ee-s;
       if(v<=0)return;
       let b=document.createElement('button');
       b.className='bar segment '+(j.status==='Concluída'?'done':j.status==='Interrompida'?'interrupted':end(j)<new Date()?'late':idx%2===0?'g1':'g2')+(labelDone?' blank':'');
       b.style.left=`calc(155px + (100% - 155px) * ${s/totalDays})`;
       b.style.width=`calc((100% - 155px) * ${v/totalDays} - 3px)`;
       if(!labelDone){
         b.innerHTML=`${dimPending?'<span class="dim-dot" title="Relatório dimensional pendente"></span>':''}<strong>${j.of?`OF ${esc(j.of)} · `:''}${esc(p?.code)} · ${esc(o?.op)} · ${j.qty} pç</strong><span class="bar-name">${esc(p?.desc||'')}</span>`;
         labelDone=true;
       }
       b.title=tooltip;
       let locked=j.status==='Concluída';b.draggable=!locked;
       if(!locked){
         b.addEventListener('dragstart',ev=>{ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',j.id);b.classList.add('dragging')});
         b.addEventListener('dragend',()=>b.classList.remove('dragging'));
       }
       b.onclick=()=>editJobOpen(j);r.appendChild(b);
     });
   });
   g.appendChild(r);
 });
}

let editJob=null,jobCtx=null,editPart=null,editClient=null,editEmp=null,editMachine=null;

function renderJobInterruptions(j){
 let arr=j?.interruptions||[];$('jobInterruptionsWrap').classList.toggle('hidden',!arr.length);$('jobInterruptions').innerHTML=arr.map(it=>`<div class="job-int-row"><strong>${esc(it.reason)}</strong>${it.detail?` · ${esc(it.detail)}`:''}<small>Início: ${fmtDateTime(it.startAt)} · ${it.resumeAt?'Retomada: '+fmtDateTime(it.resumeAt):'<strong>EM CURSO</strong>'}</small></div>`).join('');
}

function newJob(mid,day){
 let requested=add(state.start,day);
 if(!factoryWorkingDay(requested))return alert(requested.getDay()===0?'Domingo não é dia de trabalho.':'Esta data não está disponível no Calendário de Produção.');
 editJob=null;jobCtx={mid,day};$('jobError').textContent='';
 $('jobTitle').textContent='Nova produção';$('jobMeta').textContent=`${mach(mid)?.code} · ${requested.toLocaleDateString('pt-PT')}`;
 fillOps(mid);$('jobQty').value=20;$('jobDate').value=ds(requested);$('jobOF').value='';$('jobCompletedDate').value='';
 $('completedDateWrap').classList.add('hidden');$('morn').value='';$('aft').value='';$('night').value='';$('status').value='Programada';
 renderJobInterruptions(null);$('jobWorkSaturdays').checked=requested.getDay()===6;$('interruptJob').classList.add('hidden');$('resumeJob').classList.add('hidden');$('delJob').classList.add('hidden');$('jobDate').disabled=false;forecast();$('jobDlg').showModal();
}
function editJobOpen(j){
 editJob=j.id;jobCtx={mid:j.machine,day:Math.round((pd(j.start)-state.start)/86400000)};$('jobError').textContent='';
 $('jobTitle').textContent='Editar produção';$('jobMeta').textContent=`${mach(j.machine)?.code} · ${pd(j.start).toLocaleDateString('pt-PT')}`;
 fillOps(j.machine,j.op);$('jobQty').value=j.qty;$('jobDate').value=j.start;$('jobOF').value=j.of||'';
 $('jobCompletedDate').value=j.completedDate||'';$('completedDateWrap').classList.toggle('hidden',j.status!=='Concluída');
 $('jobDate').disabled=j.status==='Concluída';$('morn').value=j.m||'';$('aft').value=j.a||'';$('night').value=j.n||'';
 $('status').value=j.status||'Programada';renderJobInterruptions(j);$('jobWorkSaturdays').checked=!!j.workSaturdays;$('interruptJob').classList.toggle('hidden',j.status==='Concluída'||j.status==='Interrompida');$('resumeJob').classList.toggle('hidden',j.status!=='Interrompida');$('delJob').classList.remove('hidden');forecast();$('jobDlg').showModal();
}
function formJob(){
 let old=state.jobs.find(x=>x.id===editJob);
 let chosen=$('jobDate').value||old?.start||ds(add(state.start,jobCtx.day));
 return {id:editJob||uid('j'),machine:jobCtx.mid,op:$('jobOp').value,of:$('jobOF').value.trim(),qty:Math.max(1,Math.floor(+$('jobQty').value||1)),
   start:chosen,m:$('morn').value||null,a:$('aft').value||null,n:$('night').value||null,status:$('status').value,
   completedDate:$('jobCompletedDate').value||null,plannedEnd:old?.plannedEnd||null,workSaturdays:$('jobWorkSaturdays').checked,interruptions:structuredClone(old?.interruptions||[])};
}
function forecast(){
 if(!$('jobOp').value){$('forecast').textContent='Sem operação compatível';return}
 let j=formJob(),cap=jobCapacityHours(j);
 if(cap<=0){$('forecast').textContent=`${hrs(j).toFixed(1)} h necessárias · escolha pelo menos um operador`;return}
 let seq=sequenceCheck(j);
 let txt=`${hrs(j).toFixed(1)} h necessárias · capacidade ${fmtHours(cap)}/dia · fim previsto ${jobLastWorkDate(j).toLocaleDateString('pt-PT')}`;
 if(!seq.ok)txt+=` · ⚠ ${seq.msg}`;
 $('forecast').textContent=txt;
}
['jobOp','jobQty','jobDate','jobOF','morn','aft','night','jobWorkSaturdays'].forEach(id=>$(id).addEventListener('input',forecast));
$('status').addEventListener('change',()=>{
 let done=$('status').value==='Concluída';$('completedDateWrap').classList.toggle('hidden',!done);$('jobDate').disabled=done;
 if(done&&!$('jobCompletedDate').value)$('jobCompletedDate').value=ds(new Date());
 if(!done)$('jobCompletedDate').value='';forecast();
});

function syncJobAlert(j){
 let o=op(j.op),p=part(o?.part);if(!p)return;
 const now=new Date().toISOString();
 function upsert(type,payload,needed){
   let existing=state.alerts.find(a=>a.jobId===j.id&&a.type===type&&!a.archived);
   if(j.status==='Concluída'||!needed){if(existing){existing.closed=true;existing.updatedAt=now}return}
   let signature=JSON.stringify(payload);
   if(!existing){state.alerts.push({id:uid('al'),type,jobId:j.id,...payload,signature,read:false,closed:false,createdAt:now,updatedAt:now})}
   else{let changed=existing.signature!==signature;Object.assign(existing,payload,{signature,closed:false,updatedAt:now});if(changed)existing.read=false}
 }
 let acc=p.accessories||[],items=acc.map(a=>({name:a.name,qtyPerPiece:+a.qty,total:+a.qty*j.qty}));
 upsert('accessory',{of:j.of,partCode:p.code,partDesc:p.desc,qty:j.qty,start:j.start,items},acc.length>0);
 upsert('dimensional',{of:j.of,partCode:p.code,partDesc:p.desc,qty:j.qty,start:j.start,items:[]},!!p.dimensionalReport);
}
function syncAlertsForPart(pid){let opIds=state.ops.filter(o=>o.part===pid).map(o=>o.id);state.jobs.filter(j=>opIds.includes(j.op)).forEach(syncJobAlert)}

$('jobForm').onsubmit=e=>{
 e.preventDefault();$('jobError').textContent='';
 let j=formJob(),old=state.jobs.find(x=>x.id===j.id);
 if(!j.op)return $('jobError').textContent='Não existe operação compatível selecionada.';
 if(!factoryWorkingDay(pd(j.start)))return $('jobError').textContent=pd(j.start).getDay()===0?'Domingo não é dia de trabalho.':'Esta data não está disponível no Calendário de Produção.';
 if(pd(j.start).getDay()===6&&!j.workSaturdays)return $('jobError').textContent='Para iniciar ao sábado, ative “Trabalhar aos sábados disponíveis”.';
 if(!turns(j))return $('jobError').textContent='Escolha pelo menos um operador.';
 let seq=sequenceCheck(j);if(!seq.ok)return $('jobError').textContent=seq.msg;

 if(j.status==='Concluída'){
   if(!j.completedDate)j.completedDate=ds(new Date());
   if(!j.plannedEnd)j.plannedEnd=ds(jobLastWorkDate({...j,status:'Programada'}));
 }else{
   j.completedDate=null;j.plannedEnd=null;
 }
 let oldMachine=old?.machine,i=state.jobs.findIndex(x=>x.id===j.id);
 if(i>=0)state.jobs[i]=j;else state.jobs.push(j);
 syncJobAlert(j);
 if(oldMachine&&oldMachine!==j.machine)push(oldMachine);push(j.machine);
 save();$('jobDlg').close();render();
};

function push(mid){
 let a=state.jobs.filter(j=>j.machine===mid).sort((x,y)=>pd(x.start)-pd(y.start));
 for(let i=0;i<a.length;i++){
   let cur=a[i],ns=normalizeStartDate(pd(cur.start),cur);
   if(ns>pd(cur.start))cur.start=ds(ns);
   if(i===0)continue;
   let prev=a[i-1],last=jobLastWorkDate(prev),curStart=pd(cur.start);
   if(curStart<=last){
     let next=nextWorkingDay(last,cur);
     if(next>curStart)cur.start=ds(next);
   }
 }
}
function repushAll(){state.machines.forEach(m=>push(m.id))}
$('delJob').onclick=()=>{
 let j=state.jobs.find(x=>x.id===editJob);
 if(j?.status==='Concluída')return alert('Uma produção concluída não deve ser eliminada. Reabra primeiro se precisar corrigir.');
 state.jobs=state.jobs.filter(j=>j.id!==editJob);
 state.alerts.forEach(a=>{if(a.jobId===editJob)a.archived=true});
 save();$('jobDlg').close();render();
};

function compatibilityGroups(){return COMPAT_GROUPS}
function fillClients(){let s=$('pclient');s.innerHTML=state.clients.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}
function nextOpLabel(){return `OP${$('ops').querySelectorAll('.oprow').length+1}`}
function opRow(o=null){
 o=o||{op:nextOpLabel(),min:10,setup:0,groups:[]};
 let r=document.createElement('div');r.className='oprow';r.dataset.id=o.id||'';
 r.innerHTML=`<label>Operação<input class="oc" value="${esc(o.op)}"></label>
 <div><div style="font-size:14px;font-weight:600;margin-bottom:5px">Máquinas / grupos</div><div class="checks"></div></div>
 <label>Min/pç<input class="om" type="number" min="0.1" step="0.1" value="${o.min}"></label>
 <label>Setup h<input class="os" type="number" min="0" step="0.1" value="${o.setup}"></label>
 <button type="button" class="danger ro">Remover</button>`;
 let c=r.querySelector('.checks');
 compatibilityGroups().forEach(g=>c.innerHTML+=`<label><input type="checkbox" value="${g}" ${o.groups.includes(g)?'checked':''}> ${g==='SERRALHARIA'?'Serralharia':g}</label>`);
 r.querySelector('.ro').onclick=()=>r.remove();$('ops').appendChild(r);
}
function accessoryRow(a={id:'',name:'',qty:1}){
 let r=document.createElement('div');r.className='accrow';r.dataset.id=a.id||'';
 r.innerHTML=`<label>Acessório<input class="aname" value="${esc(a.name)}" placeholder="Ex.: Casquilho M16"></label>
 <label>Qtd./peça<input class="aqty" type="number" min="0.01" step="0.01" value="${a.qty}"></label>
 <button type="button" class="danger aremove">Remover</button>`;
 r.querySelector('.aremove').onclick=()=>r.remove();$('accessories').appendChild(r);
}
function partsTable(){
 let q=($('partsFilter')?.value||'').trim().toLowerCase();let list=state.parts.filter(p=>!q||p.code.toLowerCase().includes(q)||(p.desc||'').toLowerCase().includes(q)||cname(p.client).toLowerCase().includes(q));
 $('partsTable').innerHTML=`<table><thead><tr><th>Código</th><th>Descrição</th><th>Cliente</th><th>Operações</th><th>Acessórios</th><th>Relatório dimensional</th><th></th></tr></thead>
 <tbody>${list.slice().sort((a,b)=>a.code.localeCompare(b.code)).map(p=>`<tr>
 <td><strong>${esc(p.code)}</strong></td><td>${esc(p.desc)}</td><td>${esc(cname(p.client))}</td>
 <td>${state.ops.filter(o=>o.part===p.id).sort((a,b)=>opNumber(a.op)-opNumber(b.op)).map(o=>`${esc(o.op)} · ${o.min} min · ${o.groups.map(g=>g==='SERRALHARIA'?'Serralharia':g).join(', ')}`).join('<br>')}</td>
 <td>${(p.accessories||[]).map(a=>`${esc(a.name)} · ${a.qty}/pç`).join('<br>')||'—'}</td><td>${p.dimensionalReport?'Sim':'—'}</td>
 <td><button class="edit ep" data-id="${p.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.ep').forEach(b=>b.onclick=()=>partDlg(b.dataset.id));
}
function partDlg(id=null){
 editPart=id;fillClients();$('ops').innerHTML='';$('accessories').innerHTML='';$('perror').textContent='';
 if(id){
   let p=part(id);$('partTitle').textContent='Editar peça';$('pcode').value=p.code;$('pdesc').value=p.desc;$('pclient').value=p.client;$('pDimensional').checked=!!p.dimensionalReport;
   state.ops.filter(o=>o.part===id).sort((a,b)=>opNumber(a.op)-opNumber(b.op)).forEach(opRow);
   (p.accessories||[]).forEach(accessoryRow);$('delPart').classList.remove('hidden');
 }else{
   $('partTitle').textContent='Adicionar peça';$('pcode').value='';$('pdesc').value='';$('pDimensional').checked=false;opRow({op:'OP1',min:10,setup:0,groups:[]});$('delPart').classList.add('hidden');
 }
 $('partDlg').showModal();
}
$('addPart').onclick=()=>partDlg();
$('addOp').onclick=()=>opRow({op:nextOpLabel(),min:10,setup:0,groups:[]});
$('addAccessory').onclick=()=>accessoryRow();

$('partForm').onsubmit=e=>{
 e.preventDefault();$('perror').textContent='';
 let code=$('pcode').value.trim();
 if(!/^\d{8}$/.test(code))return $('perror').textContent='O código deve ter exatamente 8 dígitos.';
 if(state.parts.some(p=>p.code===code&&p.id!==editPart))return $('perror').textContent='Já existe uma peça com este código.';
 let rows=[...$('ops').querySelectorAll('.oprow')];if(!rows.length)return $('perror').textContent='Adicione pelo menos uma operação.';
 let labels=rows.map(r=>r.querySelector('.oc').value.trim().toUpperCase());
 if(new Set(labels).size!==labels.length)return $('perror').textContent='Não pode haver operações duplicadas.';
 let accessories=[...$('accessories').querySelectorAll('.accrow')].map(r=>({id:r.dataset.id||uid('a'),name:r.querySelector('.aname').value.trim(),qty:+r.querySelector('.aqty').value})).filter(a=>a.name&&a.qty>0);
 let pid=editPart||uid('p'),p={id:pid,code,desc:$('pdesc').value.trim(),client:$('pclient').value,accessories,dimensionalReport:$('pDimensional').checked};
 let pi=state.parts.findIndex(x=>x.id===pid);if(pi>=0)state.parts[pi]=p;else state.parts.push(p);
 let keep=[];
 for(let r of rows){
   let gs=[...r.querySelectorAll('.checks input:checked')].map(x=>x.value);if(!gs.length)return $('perror').textContent='Cada operação precisa de pelo menos uma máquina/grupo.';
   let oid=r.dataset.id||uid('o');keep.push(oid);
   let n={id:oid,part:pid,op:r.querySelector('.oc').value.trim().toUpperCase(),min:+r.querySelector('.om').value,setup:+r.querySelector('.os').value,groups:gs};
   let i=state.ops.findIndex(o=>o.id===oid);if(i>=0)state.ops[i]=n;else state.ops.push(n);
 }
 let removed=state.ops.filter(o=>o.part===pid&&!keep.includes(o.id));
 if(removed.some(o=>state.jobs.some(j=>j.op===o.id)))return $('perror').textContent='Não pode remover uma operação que já tem histórico de produção.';
 state.ops=state.ops.filter(o=>o.part!==pid||keep.includes(o.id));
 syncAlertsForPart(pid);save();$('partDlg').close();render();
};
$('delPart').onclick=()=>{
 let ids=state.ops.filter(o=>o.part===editPart).map(o=>o.id);
 if(state.jobs.some(j=>ids.includes(j.op)))return $('perror').textContent='Esta peça tem histórico e não pode ser eliminada.';
 state.ops=state.ops.filter(o=>o.part!==editPart);state.parts=state.parts.filter(p=>p.id!==editPart);save();$('partDlg').close();render();
};

function clientsTable(){
 $('clientsTable').innerHTML=`<table><thead><tr><th>Cliente</th><th></th></tr></thead><tbody>${state.clients.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<tr><td>${esc(c.name)}</td><td><button class="edit ec" data-id="${c.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.ec').forEach(b=>b.onclick=()=>clientDlg(b.dataset.id));
}
function clientDlg(id=null){editClient=id;let c=state.clients.find(x=>x.id===id);$('clientTitle').textContent=id?'Editar cliente':'Adicionar cliente';$('cname').value=c?.name||'';$('delClient').classList.toggle('hidden',!id);$('clientDlg').showModal()}
$('addClient').onclick=()=>clientDlg();
$('clientForm').onsubmit=e=>{e.preventDefault();let c={id:editClient||uid('c'),name:$('cname').value.trim()},i=state.clients.findIndex(x=>x.id===c.id);if(i>=0)state.clients[i]=c;else state.clients.push(c);save();$('clientDlg').close();render()};
$('delClient').onclick=()=>{if(state.parts.some(p=>p.client===editClient))return alert('Este cliente está associado a peças.');state.clients=state.clients.filter(c=>c.id!==editClient);save();$('clientDlg').close();render()};

function machinesTable(){
 $('machinesTable').innerHTML=`<table><thead><tr><th>Ordem</th><th>Recurso</th><th>Tipo</th><th>Grupo</th><th>Marca / Modelo</th><th>Estado</th><th>Intervenções</th><th></th></tr></thead><tbody>
 ${state.machines.slice().sort((a,b)=>machineOrder(a)-machineOrder(b)).map((m,i)=>`<tr class="${m.active===false?'machine-inactive':''}">
 <td class="machine-order">${i+1}</td><td><strong>${esc(m.code)}</strong></td><td>${esc(m.type||'CNC')}</td><td>${esc(m.group)}</td>
 <td>${esc([m.brand,m.model].filter(Boolean).join(' / ')||'—')}</td><td>${esc(m.condition|| (m.active===false?'Inativa':'Ativa'))}</td><td><button class="edit mint" data-id="${m.id}">${(m.interventions||[]).length} · Histórico</button></td><td><button class="edit emach" data-id="${m.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.emach').forEach(b=>b.onclick=()=>machineDlg(b.dataset.id));document.querySelectorAll('.mint').forEach(b=>b.onclick=()=>interventionsDlg(b.dataset.id));
}
function machineDlg(id=null){
 editMachine=id;let m=mach(id);$('machineError').textContent='';$('machineTitle').textContent=id?'Editar máquina / recurso':'Adicionar máquina / recurso';
 $('machineCode').value=m?.code||'';$('machineType').value=m?.type||'CNC';$('machineGroup').value=m?.group||'OUTRO';$('machineActive').checked=m?.active!==false;$('machineBrand').value=m?.brand||'';$('machineModel').value=m?.model||'';$('machineSerial').value=m?.serial||'';$('machineYear').value=m?.year||'';$('machineCondition').value=m?.condition||'Ativa';
 $('delMachine').classList.toggle('hidden',!id);$('machineCode').disabled=!!(id&&state.jobs.some(j=>j.machine===id));$('machineDlg').showModal();
}
$('addMachine').onclick=()=>machineDlg();
$('machineForm').onsubmit=e=>{
 e.preventDefault();$('machineError').textContent='';
 let old=mach(editMachine),code=$('machineCode').value.trim();
 if(state.machines.some(m=>m.code.toLowerCase()===code.toLowerCase()&&m.id!==editMachine))return $('machineError').textContent='Já existe um recurso com este nome.';
 let m={id:editMachine||uid('m'),code:old?.code||code,type:$('machineType').value,group:$('machineGroup').value,active:$('machineActive').checked,order:old?.order??100,brand:$('machineBrand').value.trim(),model:$('machineModel').value.trim(),serial:$('machineSerial').value.trim(),year:$('machineYear').value.trim(),condition:$('machineCondition').value,interventions:structuredClone(old?.interventions||[])};
 if(!editMachine)m.code=code;
 let i=state.machines.findIndex(x=>x.id===m.id);if(i>=0)state.machines[i]=m;else state.machines.push(m);
 normalizeState();save();$('machineDlg').close();render();
};
$('delMachine').onclick=()=>{
 if(state.jobs.some(j=>j.machine===editMachine))return $('machineError').textContent='Este recurso tem histórico. Marque-o como inativo em vez de eliminar.';
 state.machines=state.machines.filter(m=>m.id!==editMachine);save();$('machineDlg').close();render();
};

let editCalendar=null,currentInterventionMachine=null;
function calendarTable(){
 let rows=[...state.calendar].sort((a,b)=>a.date.localeCompare(b.date));
 $('calendarTable').innerHTML=`<table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Dia útil?</th><th>Observações</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><strong>${pd(x.date).toLocaleDateString('pt-PT')}</strong></td><td>${esc(x.type)}</td><td>${esc(x.description||'')}</td><td>${x.working?'Sim':'Não'}</td><td>${esc(x.notes||'')}</td><td><button class="edit ecal" data-id="${x.id}">Editar</button></td></tr>`).join('')||'<tr><td colspan="6">Sem datas especiais configuradas.</td></tr>'}</tbody></table>`;
 document.querySelectorAll('.ecal').forEach(b=>b.onclick=()=>calendarDlg(null,b.dataset.id));
}
function calendarDlg(date=null,id=null){
 editCalendar=id;let x=state.calendar.find(v=>v.id===id);$('calendarTitle').textContent=x?'Editar data especial':'Adicionar data especial';$('calendarError').textContent='';
 $('calendarDate').value=x?.date||date||ds(new Date());$('calendarType').value=x?.type||(($('calendarDate').value&&pd($('calendarDate').value).getDay()===6)?'Sábado':'Feriado');$('calendarDesc').value=x?.description||'';$('calendarWorking').checked=x?.working??(pd($('calendarDate').value).getDay()===6);$('calendarNotes').value=x?.notes||'';$('delCalendar').classList.toggle('hidden',!x);$('calendarDlg').showModal();
}
$('addCalendar').onclick=()=>calendarDlg();
$('calendarForm').onsubmit=e=>{e.preventDefault();let date=$('calendarDate').value;if(pd(date).getDay()===0&&$('calendarWorking').checked)return $('calendarError').textContent='O domingo permanece sempre sem trabalho.';let x={id:editCalendar||uid('cal'),date,type:$('calendarType').value,description:$('calendarDesc').value.trim(),working:$('calendarWorking').checked,notes:$('calendarNotes').value.trim()};let dup=state.calendar.find(v=>v.date===date&&v.id!==x.id);if(dup)return $('calendarError').textContent='Já existe uma configuração para esta data.';let i=state.calendar.findIndex(v=>v.id===x.id);if(i>=0)state.calendar[i]=x;else state.calendar.push(x);repushAll();save();$('calendarDlg').close();render()};
$('delCalendar').onclick=()=>{state.calendar=state.calendar.filter(x=>x.id!==editCalendar);repushAll();save();$('calendarDlg').close();render()};

function interventionsDlg(mid){currentInterventionMachine=mid;let m=mach(mid);$('interventionsTitle').textContent=`Histórico — ${m?.code||''}`;renderInterventions();$('interventionsDlg').showModal()}
function renderInterventions(){let m=mach(currentInterventionMachine),a=[...(m?.interventions||[])].sort((x,y)=>(y.date||'').localeCompare(x.date||''));$('interventionsList').innerHTML=a.length?a.map(x=>`<div class="intervention-card"><strong>${x.date?pd(x.date).toLocaleDateString('pt-PT'):'—'} · ${esc(x.type)}</strong><div>${esc(x.fault||'')}</div><small>${esc(x.work||'')}${x.technician?' · '+esc(x.technician):''}${x.downtime?' · Paragem: '+esc(x.downtime)+' h':''}</small>${x.notes?`<small>${esc(x.notes)}</small>`:''}</div>`).join(''):'<div class="no-alerts">Sem intervenções registadas.</div>'}
$('addIntervention').onclick=()=>{$('interventionDate').value=ds(new Date());$('interventionType').value='Avaria';$('interventionFault').value='';$('interventionWork').value='';$('interventionTechnician').value='';$('interventionDowntime').value='';$('interventionNotes').value='';$('interventionFormWrap').classList.remove('hidden')};
$('cancelIntervention').onclick=()=>$('interventionFormWrap').classList.add('hidden');
$('interventionForm').onsubmit=e=>{e.preventDefault();let m=mach(currentInterventionMachine);if(!m)return;m.interventions.push({id:uid('mi'),date:$('interventionDate').value,type:$('interventionType').value,fault:$('interventionFault').value.trim(),work:$('interventionWork').value.trim(),technician:$('interventionTechnician').value.trim(),downtime:$('interventionDowntime').value,notes:$('interventionNotes').value.trim()});save();$('interventionFormWrap').classList.add('hidden');renderInterventions();machinesTable()};

function interruptJobOpen(){let j=state.jobs.find(x=>x.id===editJob);if(!j)return;$('interruptReason').value='Falta de colaborador';$('interruptOther').value='';$('interruptAt').value=localDateTimeValue();$('interruptMachineHistory').checked=false;$('interruptMachineHistoryWrap').classList.add('hidden');$('interruptDlg').showModal()}
$('interruptReason').onchange=()=>$('interruptMachineHistoryWrap').classList.toggle('hidden',$('interruptReason').value!=='Avaria');
$('interruptJob').onclick=interruptJobOpen;
$('interruptForm').onsubmit=e=>{e.preventDefault();let j=state.jobs.find(x=>x.id===editJob);if(!j)return;let reason=$('interruptReason').value,detail=$('interruptOther').value.trim();j.interruptions.push({id:uid('int'),reason,detail,startAt:new Date($('interruptAt').value).toISOString(),resumeAt:null});j.status='Interrompida';if(reason==='Avaria'&&$('interruptMachineHistory').checked){let m=mach(j.machine);m.interventions.push({id:uid('mi'),date:$('interruptAt').value.slice(0,10),type:'Avaria',fault:detail||`Avaria durante OF ${j.of||'—'}`,work:'',technician:'',downtime:'',notes:`Registo criado a partir da interrupção da OF ${j.of||'—'}`})}syncJobAlert(j);push(j.machine);save();$('interruptDlg').close();$('jobDlg').close();render()};
$('resumeJob').onclick=()=>{let j=state.jobs.find(x=>x.id===editJob),it=activeInterruption(j);if(!it)return;it.resumeAt=new Date().toISOString();j.status='Programada';syncJobAlert(j);push(j.machine);save();$('jobDlg').close();render()};

function peopleTable(){
 $('peopleTable').innerHTML=`<table><thead><tr><th>Colaborador</th><th>Turno</th><th>Horário</th><th>Intervalos</th><th>Horas líquidas</th><th></th></tr></thead><tbody>${state.employees.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(e=>`<tr><td>${esc(e.name)}</td><td>${esc(e.shift)}</td><td>${esc(e.start)}–${esc(e.end)}</td><td>${(e.breaks||[]).map(b=>`${esc(b.start)}–${esc(b.end)}`).join('<br>')||'—'}</td><td><strong>${fmtHours(netHours(e))}</strong></td><td><button class="edit ee" data-id="${e.id}">Editar</button></td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.ee').forEach(b=>b.onclick=()=>empDlg(b.dataset.id));
}
function addBreakRow(br={start:'',end:''}){
 let r=document.createElement('div');r.className='breakrow';
 r.innerHTML=`<label>Início<input class="bstart" type="time" value="${esc(br.start)}" required></label><label>Fim<input class="bend" type="time" value="${esc(br.end)}" required></label><button type="button" class="danger bremove">Remover</button>`;
 r.querySelector('.bremove').onclick=()=>{r.remove();updateEmployeeNet()};r.querySelectorAll('input').forEach(i=>i.addEventListener('input',updateEmployeeNet));$('breaks').appendChild(r);
}
function employeeFormData(){return{id:editEmp||uid('e'),name:$('ename').value.trim(),shift:$('eshift').value,start:$('estart').value,end:$('eend').value,breaks:[...$('breaks').querySelectorAll('.breakrow')].map(r=>({start:r.querySelector('.bstart').value,end:r.querySelector('.bend').value}))}}
function updateEmployeeNet(){let e=employeeFormData(),h=netHours(e);$('enet').textContent=fmtHours(h);$('eerror').textContent=h>0?'':'O horário líquido tem de ser superior a zero.'}
function empDlg(id=null){
 editEmp=id;let e=state.employees.find(x=>x.id===id),def=shiftDefaults[e?.shift||'Manhã'];$('empTitle').textContent=id?'Editar colaborador':'Adicionar colaborador';
 $('ename').value=e?.name||'';$('eshift').value=e?.shift||'Manhã';$('estart').value=e?.start||def.start;$('eend').value=e?.end||def.end;$('breaks').innerHTML='';
 (e?.breaks||structuredClone(def.breaks)).forEach(addBreakRow);$('delEmp').classList.toggle('hidden',!id);$('eerror').textContent='';updateEmployeeNet();$('empDlg').showModal();
}
$('addEmp').onclick=()=>empDlg();$('addBreak').onclick=()=>{addBreakRow();updateEmployeeNet()};
$('eshift').addEventListener('change',()=>{if(!editEmp){let d=shiftDefaults[$('eshift').value];$('estart').value=d.start;$('eend').value=d.end;$('breaks').innerHTML='';structuredClone(d.breaks).forEach(addBreakRow);updateEmployeeNet()}});
['estart','eend'].forEach(id=>$(id).addEventListener('input',updateEmployeeNet));
$('empForm').onsubmit=e=>{e.preventDefault();let x=employeeFormData();if(netHours(x)<=0)return $('eerror').textContent='O horário líquido tem de ser superior a zero.';let i=state.employees.findIndex(y=>y.id===x.id);if(i>=0)state.employees[i]=x;else state.employees.push(x);repushAll();save();$('empDlg').close();render()};
$('delEmp').onclick=()=>{if(state.jobs.some(j=>[j.m,j.a,j.n].includes(editEmp)))return alert('Este colaborador tem histórico de produção e não pode ser eliminado.');state.employees=state.employees.filter(e=>e.id!==editEmp);save();$('empDlg').close();render()};

function jobInfo(j){
 let o=op(j.op),p=part(o?.part),m=mach(j.machine);
 return {of:j.of||'—',part:p?.code||'—',desc:p?.desc||'—',op:o?.op||'—',machine:m?.code||'—',qty:j.qty,start:j.start,planned:j.plannedEnd||ds(jobLastWorkDate(j)),actual:j.completedDate||'',status:j.status};
}
function completeFromSearch(id){
 let j=state.jobs.find(x=>x.id===id);if(!j||j.status==='Concluída')return;
 if(!confirm(`Marcar a OF ${j.of||'—'} como concluída?`)){renderSearch();return}
 j.plannedEnd=j.plannedEnd||ds(jobLastWorkDate(j));j.status='Concluída';j.completedDate=ds(new Date());syncJobAlert(j);save();render();renderSearch();
}
function renderSearch(){
 let qOF=$('searchOF').value.trim().toLowerCase(),qPart=$('searchPart').value.trim();
 let rows=state.jobs.map(j=>({j,info:jobInfo(j)})).filter(x=>(!qOF||String(x.info.of).toLowerCase().includes(qOF))&&(!qPart||String(x.info.part).includes(qPart))).sort((a,b)=>pd(b.info.start)-pd(a.info.start));
 $('searchSummary').textContent=rows.length?`${rows.length} registo(s) encontrado(s)`:'Nenhum registo encontrado';
 $('searchResults').innerHTML=rows.length?`<table class="search-table"><thead><tr><th>OF</th><th>Peça</th><th>Nome</th><th>OP</th><th>Máquina</th><th>Qtd.</th><th>Início</th><th>Fim previsto</th><th>Fim real</th><th>Estado</th><th>Fim produção</th></tr></thead>
 <tbody>${rows.map(x=>`<tr><td><strong>${esc(x.info.of)}</strong></td><td>${esc(x.info.part)}</td><td>${esc(x.info.desc)}</td><td>${esc(x.info.op)}</td><td>${esc(x.info.machine)}</td><td>${x.info.qty}</td>
 <td>${pd(x.info.start).toLocaleDateString('pt-PT')}</td><td>${pd(x.info.planned).toLocaleDateString('pt-PT')}</td><td>${x.info.actual?pd(x.info.actual).toLocaleDateString('pt-PT'):'—'}</td>
 <td><span class="status-pill ${x.info.status==='Concluída'?'status-done':'status-planned'}">${esc(x.info.status)}</span></td>
 <td class="finish-check"><input class="finish-production" data-id="${x.j.id}" type="checkbox" ${x.info.status==='Concluída'?'checked disabled':''} title="${x.info.status==='Concluída'?'Para reabrir, edite a produção.':'Marcar como concluída'}"></td></tr>`).join('')}</tbody></table>`:'';
 document.querySelectorAll('.finish-production:not(:disabled)').forEach(c=>c.onchange=()=>{if(c.checked)completeFromSearch(c.dataset.id)});
}
$('openSearch').onclick=()=>{$('searchOF').value='';$('searchPart').value='';renderSearch();$('searchDlg').showModal()};
$('searchOF').addEventListener('input',renderSearch);$('searchPart').addEventListener('input',renderSearch);
$('clearSearch').onclick=()=>{$('searchOF').value='';$('searchPart').value='';renderSearch()};

function pendingAlerts(){return state.alerts.filter(a=>!a.read&&!a.closed&&!a.archived)}
function renderAlertBadge(){
 let n=pendingAlerts().length;$('alertBadge').textContent=n;$('alertBadge').classList.toggle('hidden',!n);
}
function renderAlerts(){
 let arr=pendingAlerts().sort((a,b)=>String(a.start).localeCompare(String(b.start)));
 $('alertsList').innerHTML=arr.length?arr.map(a=>`<div class="alert-card ${a.type==='dimensional'?'dimensional-alert':''}"><h4>${a.type==='dimensional'?'Relatório dimensional / CMM':'Acessórios'} · OF ${esc(a.of||'—')} — ${esc(a.partCode)} — ${esc(a.partDesc)}</h4>
 <div>Produção: <strong>${a.qty} peças</strong> · início ${pd(a.start).toLocaleDateString('pt-PT')}</div>
 ${a.type==='dimensional'?'<p class="alert-message"><strong>Preparar relatório dimensional para envio ao cliente.</strong></p>':`<ul>${(a.items||[]).map(i=>`<li>${esc(i.name)}: <strong>${i.total}</strong> un. (${i.qtyPerPiece}/peça)</li>`).join('')}</ul>`}
 <label class="alert-read"><input type="checkbox" class="mark-alert-read" data-id="${a.id}"> Lido</label></div>`).join(''):'<div class="no-alerts">Não existem alertas pendentes.</div>';
 document.querySelectorAll('.mark-alert-read').forEach(c=>c.onchange=()=>{let a=state.alerts.find(x=>x.id===c.dataset.id);if(a&&c.checked){a.read=true;a.readAt=new Date().toISOString();save();renderAlerts();renderAlertBadge();gantt()}});
}
$('alertsBtn').onclick=()=>{renderAlerts();$('alertsDlg').showModal()};

function downloadBackup(){
 let payload={backup_type:'planeamento-maquinacao',version:'2.1',created_at:new Date().toISOString(),data:snapshotState()};
 let blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=window.URL.createObjectURL(blob),a=document.createElement('a'),d=new Date();
 let stamp=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;
 a.href=u;a.download=`backup-planeamento-maquinacao_${stamp}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>window.URL.revokeObjectURL(u),500);
}
$('backupBtn').onclick=downloadBackup;

$('prev').onclick=()=>{state.start=add(state.start,-state.weeksVisible*7);gantt()};
$('next').onclick=()=>{state.start=add(state.start,state.weeksVisible*7);gantt()};
$('today').onclick=()=>{state.start=startWeek(new Date());gantt()};
$('partsFilter').addEventListener('input',partsTable);
$('weeksVisible').addEventListener('change',()=>{state.weeksVisible=Number($('weeksVisible').value)||4;gantt()});

tabs();
bootstrapRemote();

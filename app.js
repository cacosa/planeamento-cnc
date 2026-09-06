const APP = (() => {
  const machines = [
    {id:"UMC750-1", group:"UMC750"},
    {id:"UMC750-2", group:"UMC750"},
    {id:"UMC750-3", group:"UMC750"},
    {id:"UMC1000-1", group:"UMC1000"},
    {id:"UMC1000-2", group:"UMC1000"},
    {id:"VF3", group:"VF3"},
    {id:"EC1600", group:"EC1600", exclusive:true},
    {id:"SL30", group:"TORNOS"},
    {id:"V8300", group:"TORNOS"}
  ];

  const employees = [
    {name:"Sr. Silva", shift:"Manhã"},
    {name:"Andrii", shift:"Manhã"},
    {name:"José Gusmão", shift:"Manhã"},
    {name:"Tiago Gil", shift:"Tarde"},
    {name:"Diogo", shift:"Tarde"},
    {name:"Gonçalo", shift:"Noite"}
  ];

  const operations = [
    {part:"509", op:"OP10", machineGroups:["UMC750","UMC1000"], minPerPiece:28, setupHours:2},
    {part:"509", op:"OP20", machineGroups:["UMC750","TORNOS"], minPerPiece:18, setupHours:2},
    {part:"510", op:"OP10", machineGroups:["UMC750","UMC1000","TORNOS"], minPerPiece:32, setupHours:2},
    {part:"511", op:"OP10", machineGroups:["UMC750","UMC1000","VF3"], minPerPiece:24, setupHours:2},
    {part:"512", op:"OP20", machineGroups:["UMC750","EC1600","TORNOS"], minPerPiece:36, setupHours:2}
  ];

  let jobs = [
    {id:1,machine:"UMC750-1",dayOffset:0,part:"509",op:"OP10",qty:40,minPerPiece:28,setupHours:2,morning:"Andrii",afternoon:"Diogo",night:""},
    {id:2,machine:"UMC750-3",dayOffset:1,part:"511",op:"OP10",qty:55,minPerPiece:24,setupHours:2,morning:"José Gusmão",afternoon:"Diogo",night:"Gonçalo"},
    {id:3,machine:"UMC1000-1",dayOffset:3,part:"510",op:"OP10",qty:28,minPerPiece:32,setupHours:2,morning:"Andrii",afternoon:"",night:"Gonçalo"}
  ];

  let weekStart = startOfWeek(new Date());
  let activeJob = null;

  const els = {};
  function $(id){ return document.getElementById(id); }

  function init() {
    [
      "gantt","weekTitle","jobDialog","jobForm","jobDialogTitle","jobDialogMeta",
      "partSelect","qtyInput","morningSelect","afternoonSelect","nightSelect",
      "forecastText","deleteJob","closeDialog","cancelDialog","prevWeek","nextWeek",
      "todayWeek","partsTable","peopleTable","machinesTable"
    ].forEach(id => els[id] = $(id));

    document.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    els.prevWeek.addEventListener("click", () => { weekStart = addDays(weekStart,-7); renderGantt(); });
    els.nextWeek.addEventListener("click", () => { weekStart = addDays(weekStart, 7); renderGantt(); });
    els.todayWeek.addEventListener("click", () => { weekStart = startOfWeek(new Date()); renderGantt(); });

    els.closeDialog.addEventListener("click", closeDialog);
    els.cancelDialog.addEventListener("click", closeDialog);
    els.deleteJob.addEventListener("click", deleteCurrentJob);
    els.jobForm.addEventListener("submit", saveJob);

    [els.partSelect,els.qtyInput,els.morningSelect,els.afternoonSelect,els.nightSelect]
      .forEach(el => el.addEventListener("input", updateForecast));

    populateEmployeeSelects();
    renderReferenceTables();
    renderGantt();
  }

  function switchView(view){
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.view===view));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
    $(`${view}View`).classList.add("active-view");
  }

  function startOfWeek(date){
    const d = new Date(date);
    const day = (d.getDay()+6)%7;
    d.setHours(0,0,0,0);
    d.setDate(d.getDate()-day);
    return d;
  }
  function addDays(date, n){
    const d = new Date(date);
    d.setDate(d.getDate()+n);
    return d;
  }
  function fmtDay(date){
    return new Intl.DateTimeFormat("pt-PT",{weekday:"short",day:"2-digit",month:"2-digit"}).format(date);
  }
  function fmtWeekTitle(){
    const end = addDays(weekStart,6);
    const a = weekStart.toLocaleDateString("pt-PT");
    const b = end.toLocaleDateString("pt-PT");
    return `${a} — ${b}`;
  }

  function renderGantt(){
    els.weekTitle.textContent = `Semana: ${fmtWeekTitle()}`;
    els.gantt.innerHTML = "";

    const head = document.createElement("div");
    head.className = "gantt-header";
    head.innerHTML = `<div>Máquina</div>` + Array.from({length:7},(_,i)=>`<div>${fmtDay(addDays(weekStart,i))}</div>`).join("");
    els.gantt.appendChild(head);

    machines.forEach(machine => {
      const row = document.createElement("div");
      row.className = "machine-row";
      row.dataset.machine = machine.id;

      const name = document.createElement("div");
      name.className = "machine-name";
      name.textContent = machine.id;
      row.appendChild(name);

      for(let d=0; d<7; d++){
        const cell = document.createElement("div");
        cell.className = "day-cell";
        const add = document.createElement("button");
        add.className = "add";
        add.type = "button";
        add.textContent = "+";
        add.title = `Adicionar produção em ${machine.id} - ${fmtDay(addDays(weekStart,d))}`;
        add.addEventListener("click", () => openNewJob(machine.id,d));
        cell.appendChild(add);
        row.appendChild(cell);
      }

      jobs.filter(j=>j.machine===machine.id).forEach(job => {
        const duration = Math.max(0.25, durationDays(job));
        if(job.dayOffset > 6 || job.dayOffset + duration < 0) return;

        const visibleStart = Math.max(0, job.dayOffset);
        const visibleEnd = Math.min(7, job.dayOffset + duration);
        const visibleDuration = visibleEnd-visibleStart;

        const bar = document.createElement("button");
        bar.type = "button";
        bar.className = "job-bar";
        bar.style.left = `calc(160px + (100% - 160px) * ${visibleStart/7})`;
        bar.style.width = `calc((100% - 160px) * ${visibleDuration/7} - 6px)`;
        bar.innerHTML = `<strong>${job.part} · ${job.op} · ${job.qty} pç</strong>
                         <span>${turnCount(job)} turno(s) · ${totalHours(job).toFixed(1)} h</span>`;
        bar.addEventListener("click", () => openEditJob(job));
        row.appendChild(bar);
      });

      els.gantt.appendChild(row);
    });
  }

  function allowedOperations(machineId){
    const machine = machines.find(m=>m.id===machineId);
    return operations.filter(o=>o.machineGroups.includes(machine.group));
  }

  function populatePartSelect(machineId, selectedKey=""){
    els.partSelect.innerHTML = "";
    allowedOperations(machineId).forEach(o=>{
      const opt = document.createElement("option");
      opt.value = `${o.part}|${o.op}`;
      opt.textContent = `${o.part} · ${o.op} — ${o.minPerPiece} min/pç`;
      if(opt.value===selectedKey) opt.selected = true;
      els.partSelect.appendChild(opt);
    });
  }

  function populateEmployeeSelects(){
    fillShift(els.morningSelect,"Manhã");
    fillShift(els.afternoonSelect,"Tarde");
    fillShift(els.nightSelect,"Noite");
  }
  function fillShift(select, shift){
    select.innerHTML = `<option value="">— Sem operador —</option>`;
    employees.filter(e=>e.shift===shift).forEach(e=>{
      const opt = document.createElement("option");
      opt.value=e.name; opt.textContent=e.name; select.appendChild(opt);
    });
  }

  function openNewJob(machine, dayOffset){
    activeJob = {mode:"new",machine,dayOffset};
    els.jobDialogTitle.textContent = "Nova produção";
    els.jobDialogMeta.textContent = `${machine} · ${fmtDay(addDays(weekStart,dayOffset))}`;
    populatePartSelect(machine);
    els.qtyInput.value = 20;
    els.morningSelect.value = "";
    els.afternoonSelect.value = "";
    els.nightSelect.value = "";
    els.deleteJob.classList.add("hidden");
    updateForecast();
    els.jobDialog.showModal();
  }

  function openEditJob(job){
    activeJob = {mode:"edit",id:job.id,machine:job.machine,dayOffset:job.dayOffset};
    els.jobDialogTitle.textContent = "Editar produção";
    els.jobDialogMeta.textContent = `${job.machine} · ${fmtDay(addDays(weekStart,job.dayOffset))}`;
    populatePartSelect(job.machine,`${job.part}|${job.op}`);
    els.qtyInput.value = job.qty;
    els.morningSelect.value = job.morning || "";
    els.afternoonSelect.value = job.afternoon || "";
    els.nightSelect.value = job.night || "";
    els.deleteJob.classList.remove("hidden");
    updateForecast();
    els.jobDialog.showModal();
  }

  function selectedOperation(){
    const [part,op] = els.partSelect.value.split("|");
    return operations.find(o=>o.part===part && o.op===op);
  }

  function formJob(){
    const op = selectedOperation();
    return {
      id: activeJob.mode==="edit" ? activeJob.id : Date.now(),
      machine: activeJob.machine,
      dayOffset: activeJob.dayOffset,
      part: op.part,
      op: op.op,
      qty: Math.max(1, Number(els.qtyInput.value)||1),
      minPerPiece: op.minPerPiece,
      setupHours: op.setupHours,
      morning: els.morningSelect.value,
      afternoon: els.afternoonSelect.value,
      night: els.nightSelect.value
    };
  }

  function turnCount(job){
    return [job.morning,job.afternoon,job.night].filter(Boolean).length;
  }
  function totalHours(job){
    return job.setupHours + job.qty*job.minPerPiece/60;
  }
  function durationDays(job){
    const turns = turnCount(job);
    return turns ? totalHours(job)/(turns*8) : 0;
  }

  function updateForecast(){
    if(!activeJob || !els.partSelect.value) return;
    const job = formJob();
    const turns = turnCount(job);
    const hours = totalHours(job);
    if(!turns){
      els.forecastText.textContent = `${hours.toFixed(1)} h necessárias · escolha pelo menos um operador`;
      return;
    }
    const days = durationDays(job);
    els.forecastText.textContent = `${hours.toFixed(1)} h · ${turns} turno(s) · cerca de ${days.toFixed(1)} dia(s)`;
  }

  function saveJob(event){
    event.preventDefault();
    const job = formJob();
    if(turnCount(job)===0){
      els.forecastText.textContent = "Escolha pelo menos um operador.";
      return;
    }
    if(activeJob.mode==="edit"){
      jobs = jobs.map(j=>j.id===activeJob.id ? job : j);
    } else {
      jobs.push(job);
    }
    closeDialog();
    renderGantt();
  }

  function deleteCurrentJob(){
    if(activeJob?.mode==="edit"){
      jobs = jobs.filter(j=>j.id!==activeJob.id);
      closeDialog();
      renderGantt();
    }
  }

  function closeDialog(){
    if(els.jobDialog.open) els.jobDialog.close();
  }

  function renderReferenceTables(){
    els.partsTable.innerHTML = `<table><thead><tr><th>Peça</th><th>Operação</th><th>Máquinas</th><th>Tempo/pç</th><th>Setup</th></tr></thead><tbody>` +
      operations.map(o=>`<tr><td>${o.part}</td><td>${o.op}</td><td>${o.machineGroups.join(", ")}</td><td>${o.minPerPiece} min</td><td>${o.setupHours} h</td></tr>`).join("") +
      `</tbody></table>`;

    els.peopleTable.innerHTML = `<table><thead><tr><th>Colaborador</th><th>Turno</th></tr></thead><tbody>` +
      employees.map(e=>`<tr><td>${e.name}</td><td>${e.shift}</td></tr>`).join("") +
      `</tbody></table>`;

    els.machinesTable.innerHTML = `<table><thead><tr><th>Máquina</th><th>Grupo</th><th>Operador exclusivo</th></tr></thead><tbody>` +
      machines.map(m=>`<tr><td>${m.id}</td><td>${m.group}</td><td>${m.exclusive?"Sim":"Não"}</td></tr>`).join("") +
      `</tbody></table>`;
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", APP.init);

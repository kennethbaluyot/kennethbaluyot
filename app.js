const SERV=[{id:1,n:'Classic Haircut',m:30,p:25},{id:2,n:'Skin Fade',m:45,p:32},{id:3,n:'Beard Trim',m:30,p:18},{id:4,n:'Cut + Beard',m:60,p:45},{id:5,n:'Kids Cut (under 12)',m:30,p:18},{id:6,n:'Hot Towel Shave',m:45,p:30}];
const STAFF=[{id:'a',n:'Maya',days:[2,3,4,5,6]},{id:'b',n:'Jon',days:[1,2,3,4,5]},{id:'c',n:'Ines',days:[3,4,5,6]}];
const STEPS=['Service','Barber','Time','Details'], OPEN=540, CLOSE=1020;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dt=i=>new Date(i+'T00:00');
const fmtD=i=>dt(i).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
const fmtT=m=>{const h=Math.floor(m/60);return `${h%12||12}:${String(m%60).padStart(2,'0')} ${h<12?'AM':'PM'}`};
const toast=m=>{$('#toastMsg').textContent=m;bootstrap.Toast.getOrCreateInstance($('#toast'),{delay:2500}).show()};
const fresh=()=>({step:1,svc:null,staff:'any',date:null,time:null,assign:null,resched:null,form:{},done:null});
let s=fresh(), regs=store.get('trim-regs',[]);
const svc=()=>SERV.find(x=>x.id===s.svc);
const stf=id=>STAFF.find(x=>x.id===id);

function busy(id,d,t){let h=0;for(const c of id+d+t)h=(h*31+c.charCodeAt(0))>>>0;return h%100<28}
function free(id,d,t,dur){
  if(!stf(id).days.includes(dt(d).getDay()))return false;
  const now=new Date();if(d===iso(now)&&t<now.getHours()*60+now.getMinutes()+60)return false;
  for(let x=t;x<t+dur;x+=30){if(busy(id,d,x))return false}
  return !regs.some(r=>r.staff===id&&r.date===d&&r.code!==s.resched&&t<r.start+r.dur&&r.start<t+dur);
}
function slots(d){
  const dur=svc().m,c=s.staff==='any'?STAFF:[stf(s.staff)],out=[];
  for(let t=OPEN;t+dur<=CLOSE;t+=30){const f=c.find(x=>free(x.id,d,t,dur));out.push({t,staff:f&&f.id})}
  return out;
}
const dates=()=>Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return iso(d)});

function render(){
  $('#steps').innerHTML=STEPS.map((n,i)=>`<li class="${i+1<=s.step?'on':''}">${i+1}. ${n}</li>`).join('');
  const p=$('#panel');
  if(s.done){const r=s.done;
    p.innerHTML=`<div class="text-center py-3"><h2 class="h4">${s.resched?'Booking updated':'You&rsquo;re booked'}</h2><div class="code my-3">${r.code}</div>
    <p>${esc(r.svcName)} with ${stf(r.staff).n}<br>${fmtD(r.date)} at ${fmtT(r.start)}</p>
    <p class="small text-secondary">Saved in this browser. Manage it under My bookings.</p><button class="btn btn-dark" data-act="again">Book another</button></div>`;
  }else if(s.step===1){
    p.innerHTML=`<h2 class="h5 mb-3">Choose a service</h2>`+SERV.map(x=>`<button class="opt" data-svc="${x.id}" aria-pressed="${s.svc===x.id}"><span>${x.n}<br><small>${x.m} min</small></span><strong>$${x.p}</strong></button>`).join('')+nav(false,!s.svc);
  }else if(s.step===2){
    p.innerHTML=`<h2 class="h5 mb-3">Choose a barber</h2>`+[{id:'any',n:'Any available',t:'Soonest opening'},...STAFF.map(x=>({id:x.id,n:x.n,t:'Works '+x.days.map(d=>'SunMonTueWedThuFriSat'.slice(d*3,d*3+3)).join(', ')}))].map(x=>`<button class="opt" data-staff="${x.id}" aria-pressed="${s.staff===x.id}"><span>${x.n}<br><small>${x.t}</small></span></button>`).join('')+nav(true,false);
  }else if(s.step===3){
    const ds=dates();
    const days=ds.map(d=>{const ok=slots(d).some(x=>x.staff),o=dt(d);return `<button class="day" data-date="${d}" ${ok?'':'disabled'} aria-pressed="${s.date===d}"><span class="small">${o.toLocaleDateString('en-US',{weekday:'short'})}</span><b>${o.getDate()}</b><span class="small">${o.toLocaleDateString('en-US',{month:'short'})}</span></button>`}).join('');
    const sl=s.date?`<h3 class="h6 mt-3">${fmtD(s.date)}</h3><div class="slots">`+slots(s.date).map(x=>`<button class="slot" data-time="${x.t}" data-as="${x.staff||''}" ${x.staff?'':'disabled'} aria-pressed="${s.time===x.t}">${fmtT(x.t)}</button>`).join('')+'</div>':'<p class="text-secondary mt-3">Pick a day to see open times.</p>';
    p.innerHTML=`<h2 class="h5 mb-3">Pick a day and time</h2><div class="days">${days}</div>${sl}`+(s.resched?`<div class="d-flex justify-content-between mt-4"><button class="btn btn-outline-dark" data-act="cancelre">Keep old time</button><button class="btn btn-dark" data-act="saveRe" ${s.time?'':'disabled'}>Confirm new time</button></div>`:nav(true,!s.time));
  }else{
    const f=s.form;
    p.innerHTML=`<h2 class="h5 mb-3">Your details</h2><form id="bookForm" novalidate>
    <div class="mb-3"><label class="form-label" for="name">Full name</label><input id="name" name="name" class="form-control" required minlength="2" value="${esc(f.name||'')}"><div class="invalid-feedback">Enter your full name.</div></div>
    <div class="mb-3"><label class="form-label" for="phone">Mobile number</label><input id="phone" name="phone" type="tel" class="form-control" required pattern="[0-9+()\\- ]{7,16}" value="${esc(f.phone||'')}"><div class="invalid-feedback">Use 7 to 16 digits.</div></div>
    <div class="mb-3"><label class="form-label" for="email">Email</label><input id="email" name="email" type="email" class="form-control" required value="${esc(f.email||'')}"><div class="invalid-feedback">Enter a valid email address.</div></div>
    <div class="mb-3"><label class="form-label" for="note">Notes (optional)</label><textarea id="note" name="note" class="form-control" rows="2">${esc(f.note||'')}</textarea></div>
    <div class="d-flex justify-content-between"><button type="button" class="btn btn-outline-dark" data-act="back">Back</button><button class="btn btn-dark" type="submit">Confirm booking</button></div></form>`;
  }
  const v=svc();
  $('#summary').innerHTML=`<h2 class="h6">Your appointment</h2><dl class="mb-0 small">
  <dt>Service</dt><dd>${v?`${v.n} (${v.m} min)`:'Not chosen'}</dd><dt>Barber</dt><dd>${s.assign&&s.staff==='any'?stf(s.assign).n+' (soonest)':s.staff==='any'?'Any available':stf(s.staff).n}</dd>
  <dt>When</dt><dd>${s.date&&s.time?`${fmtD(s.date)}, ${fmtT(s.time)}`:'Not chosen'}</dd><dt>Price</dt><dd class="fs-5 fw-bold mb-0">${v?'$'+v.p:'$0'}</dd></dl>`;
  $('#mineCount').textContent=regs.length;
  renderMine();
}
const nav=(back,dis)=>`<div class="d-flex justify-content-between mt-4">${back?'<button class="btn btn-outline-dark" data-act="back">Back</button>':'<span></span>'}<button class="btn btn-dark" data-act="next" ${dis?'disabled':''}>Next</button></div>`;
function renderMine(){
  const l=[...regs].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  $('#mineList').innerHTML=l.length?l.map(r=>`<div class="mine-item"><strong>${esc(r.svcName)}</strong> with ${stf(r.staff).n}<div class="small">${fmtD(r.date)}, ${fmtT(r.start)}</div><div class="small text-secondary">${esc(r.name)} &middot; $${r.price}</div>
  <div class="d-flex justify-content-between align-items-center mt-2"><span class="fw-bold">${r.code}</span><span><button class="btn btn-sm btn-outline-dark" data-re="${r.code}">Reschedule</button> <button class="btn btn-sm btn-outline-danger" data-cx="${r.code}">Cancel</button></span></div></div>`).join(''):'<p class="text-secondary">No bookings yet. Choose a service to start.</p>';
}
const save=()=>store.set('trim-regs',regs);
function code(){return 'TRM-'+Math.random().toString(36).slice(2,7).toUpperCase()}

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.svc){s.svc=+d.svc;s.time=null;s.date=null}
  else if(d.staff){s.staff=d.staff;s.time=null}
  else if(d.date){s.date=d.date;s.time=null}
  else if(d.time){s.time=+d.time;s.assign=d.as}
  else if(d.act==='next')s.step++;
  else if(d.act==='back')s.step--;
  else if(d.act==='again')s=fresh();
  else if(d.act==='cancelre')s=fresh();
  else if(d.act==='saveRe'){const r=regs.find(x=>x.code===s.resched);Object.assign(r,{date:s.date,start:s.time,staff:s.assign});save();s.done=r}
  else if(d.re){const r=regs.find(x=>x.code===d.re),v=SERV.find(x=>x.id===r.svc);
    s={...fresh(),svc:v.id,staff:r.staff,step:3,resched:r.code};bootstrap.Offcanvas.getInstance($('#mine')).hide();toast('Choose a new time')}
  else if(d.cx){if(!confirm('Cancel this booking?'))return;regs=regs.filter(x=>x.code!==d.cx);save();toast('Booking cancelled')}
  else return;
  render();
});
document.addEventListener('input',e=>{if(e.target.form&&e.target.form.id==='bookForm')s.form[e.target.name]=e.target.value});
document.addEventListener('submit',e=>{
  e.preventDefault();const f=e.target;f.classList.add('was-validated');if(!f.checkValidity())return;
  const v=svc(),r={code:code(),svc:v.id,svcName:v.n,staff:s.assign,date:s.date,start:s.time,dur:v.m,price:v.p,name:s.form.name.trim(),phone:s.form.phone.trim(),email:s.form.email.trim(),note:(s.form.note||'').trim()};
  if(!free(r.staff,r.date,r.start,r.dur)){toast('That time was just taken. Pick another.');s.step=3;s.time=null;render();return}
  regs.push(r);save();s.done=r;render();
});
render();

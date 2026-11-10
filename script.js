const LS_USERS='gym_users_v1', LS_SESSION='gym_session_v1', LS_SET='gym_settings_v1';
const $=id=>document.getElementById(id);
let tempPhotos={front:'',back:'',side:''};
let coachTempPhoto='';
let curWeek=0, curDay=0;

function getUsers(){try{return JSON.parse(localStorage.getItem(LS_USERS))||[]}catch{return[]}}
function saveUsers(u){localStorage.setItem(LS_USERS,JSON.stringify(u))}
function getSettings(){try{return JSON.parse(localStorage.getItem(LS_SET))||{clubName:'باشگاه بدنسازی انرژی',coachName:'مربی: آقای رضایی',coachPhoto:''}}catch{return{clubName:'باشگاه بدنسازی انرژی',coachName:'مربی: آقای رضایی',coachPhoto:''}}}
function saveSettings(s){localStorage.setItem(LS_SET,JSON.stringify(s))}
function currentPhone(){return localStorage.getItem(LS_SESSION)}
function currentUser(){const u=getUsers();return u.find(x=>x.phone===currentPhone())}
function updateUser(obj){const arr=getUsers();const i=arr.findIndex(x=>x.phone===obj.phone);if(i>=0){arr[i]=obj;saveUsers(arr)}}
function toFa(n){if(n==null||n===''||isNaN(n))return '—';return Number(n).toLocaleString('fa-IR')}
function calcBMI(w,h){w=parseFloat(w);h=parseFloat(h);if(!w||!h)return null;const m=h/100;return (w/(m*m))}

function fileToBase64(file,max=700){return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;const s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',0.72))};img.onerror=rej;img.src=e.target.result};r.onerror=rej;r.readAsDataURL(file)})}

document.addEventListener('DOMContentLoaded',init);
function init(){
renderSettingsHome();
bindHome();bindAuth();bindTabs();bindProfile();bindMonthly();bindProgress();bindProgram();bindBackup();
const ph=currentPhone();
if(ph&&currentUser()){showMain()}else{showHome()}
}

function renderSettingsHome(){const s=getSettings();$('homeClubName').textContent=s.clubName||'باشگاه';$('homeCoachName').textContent=s.coachName||'مربی';$('topClubName').textContent=s.clubName||'باشگاه';if(s.coachPhoto){$('homeCoachPhoto').src=s.coachPhoto}else{$('homeCoachPhoto').src='https://cdn-icons-png.flaticon.com/512/4140/4140048.png'}}
function showHome(){$('view-home').hidden=false;$('view-main').hidden=true}
function showMain(){$('view-home').hidden=true;$('view-main').hidden=false;loadProfileToForm();renderMonthly();renderProgress();renderProgram();updateBMILive()}

function bindHome(){
let mode='login';
$('btnGoLogin').onclick=()=>{mode='login';openAuth(mode)};
$('btnGoRegister').onclick=()=>{mode='register';openAuth(mode)};
$('btnAuthSubmit').onclick=()=>doAuth(mode);
$('btnClubSettings').onclick=()=>{const s=getSettings();$('set-club').value=s.clubName;$('set-coach').value=s.coachName;$('set-coach-prev').src=s.coachPhoto||'';$('set-coach-prev').style.display=s.coachPhoto?'block':'none';$('settingsModal').hidden=false};
$('btnCloseSettings').onclick=()=>$('settingsModal').hidden=true;
$('set-coach-photo').onchange=async e=>{if(e.target.files[0]){coachTempPhoto=await fileToBase64(e.target.files[0]);$('set-coach-prev').src=coachTempPhoto;$('set-coach-prev').style.display='block'}};
$('btnSaveSettings').onclick=()=>{const s={clubName:$('set-club').value||'باشگاه',coachName:$('set-coach').value||'مربی',coachPhoto:coachTempPhoto||getSettings().coachPhoto||''};saveSettings(s);renderSettingsHome();$('settingsModal').hidden=true;alert('ذخیره شد ✅')};
$('btnLogout').onclick=()=>{localStorage.removeItem(LS_SESSION);showHome()};
}
function openAuth(mode){$('authModal').hidden=false;$('authTitle').textContent=mode==='login'?'ورود شاگرد':'ثبت‌نام شاگرد';$('authNameWrap').style.display=mode==='register'?'block':'none';$('authError').textContent='';$('btnAuthSubmit').onclick=()=>doAuth(mode)}
function bindAuth(){$('btnAuthClose').onclick=()=>$('authModal').hidden=true}
function doAuth(mode){
const phone=$('authPhone').value.trim(),pass=$('authPass').value.trim(),name=$('authName').value.trim();
if(phone.length<4||!pass){$('authError').textContent='موبایل و رمز را کامل وارد کنید.';return}
let arr=getUsers();
if(mode==='register'){
if(!name){$('authError').textContent='نام را وارد کنید.';return}
if(arr.find(x=>x.phone===phone)){$('authError').textContent='این شماره قبلاً ثبت شده، وارد شوید.';return}
const nu={phone,pass,profile:{name,phone,height:'',startWeight:'',age:'',goal:'کاهش وزن',disease:'',surgery:'',drugs:'',pregnancy:'',activity:'متوسط',sportHistory:''},records:[],programs:defaultPrograms()};
arr.push(nu);saveUsers(arr);localStorage.setItem(LS_SESSION,phone);$('authModal').hidden=true;showMain();
}else{
const f=arr.find(x=>x.phone===phone&&x.pass===pass);
if(!f){$('authError').textContent='موبایل یا رمز اشتباه است.';return}
localStorage.setItem(LS_SESSION,phone);$('authModal').hidden=true;showMain();
}
}
function bindTabs(){document.querySelectorAll('.bottom-nav button').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));$(b.dataset.tab).classList.add('active');if(b.dataset.tab==='tab-progress')renderProgress();if(b.dataset.tab==='tab-program')renderProgram()}})}
function goTab(id){document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.id===id))}

function bindProfile(){$('btnSaveProfile').onclick=()=>{const u=currentUser();if(!u)return;u.profile={name:$('p-name').value,age:$('p-age').value,phone:$('p-phone').value,height:$('p-height').value,startWeight:$('p-startWeight').value,goal:$('p-goal').value,disease:$('p-disease').value,surgery:$('p-surgery').value,drugs:$('p-drugs').value,pregnancy:$('p-pregnancy').value,activity:$('p-activity').value,sportHistory:$('p-sportHistory').value};if($('p-height').value&&!$('r-height').value)$('r-height').value=$('p-height').value;updateUser(u);alert('مشخصات ذخیره شد ✅')}}
function loadProfileToForm(){const u=currentUser();if(!u)return;const p=u.profile||{};$('p-name').value=p.name||'';$('p-age').value=p.age||'';$('p-phone').value=p.phone||u.phone||'';$('p-height').value=p.height||'';$('p-startWeight').value=p.startWeight||'';$('p-goal').value=p.goal||'کاهش وزن';$('p-disease').value=p.disease||'';$('p-surgery').value=p.surgery||'';$('p-drugs').value=p.drugs||'';$('p-pregnancy').value=p.pregnancy||'';$('p-activity').value=p.activity||'متوسط';$('p-sportHistory').value=p.sportHistory||''}

function bindMonthly(){
['r-weight','r-height'].forEach(id=>{$(id).addEventListener('input',updateBMILive)});
$('r-photo-front').onchange=async e=>{if(e.target.files[0]){tempPhotos.front=await fileToBase64(e.target.files[0]);$('prev-front').src=tempPhotos.front;$('prev-front').style.display='block'}};
$('r-photo-back').onchange=async e=>{if(e.target.files[0]){tempPhotos.back=await fileToBase64(e.target.files[0]);$('prev-back').src=tempPhotos.back;$('prev-back').style.display='block'}};
$('r-photo-side').onchange=async e=>{if(e.target.files[0]){tempPhotos.side=await fileToBase64(e.target.files[0]);$('prev-side').src=tempPhotos.side;$('prev-side').style.display='block'}};
$('btnSaveRecord').onclick=()=>{
const u=currentUser();if(!u)return;
const rec={id:Date.now(),date:$('r-date').value||new Date().toISOString().slice(0,10),weight:parseFloat($('r-weight').value)||0,height:parseFloat($('r-height').value)||parseFloat($('p-height').value)||0,chest:+$('r-chest').value||0,waist:+$('r-waist').value||0,belly:+$('r-belly').value||0,hips:+$('r-hips').value||0,armR:+$('r-armR').value||0,armL:+$('r-armL').value||0,thighR:+$('r-thighR').value||0,thighL:+$('r-thighL').value||0,calf:+$('r-calf').value||0,photoFront:tempPhotos.front||'',photoBack:tempPhotos.back||'',photoSide:tempPhotos.side||''};
if(!rec.weight){alert('وزن را وارد کنید');return}
rec.bmi=calcBMI(rec.weight,rec.height);
u.records=u.records||[];u.records.push(rec);u.records.sort((a,b)=>a.date.localeCompare(b.date));updateUser(u);
tempPhotos={front:'',back:'',side:''};['prev-front','prev-back','prev-side'].forEach(i=>{$(i).src='';$(i).style.display='none'});
renderMonthly();renderProgress();alert('ثبت ماه ذخیره شد ✅');
};
}
function updateBMILive(){const b=calcBMI($('r-weight').value,$('r-height').value);const u=currentUser();let diff='';if(u&&u.records&&u.records.length){const last=[...u.records].sort((a,b)=>a.date.localeCompare(b.date)).pop();if(last&&last.bmi&&b){const d=(b-last.bmi).toFixed(1);diff=` | اختلاف با ماه قبل: ${d>0?'+':''}${d}`}};$('autoBMI').textContent=b?`BMI خودکار: ${b.toFixed(1)}${diff}`:'BMI خودکار: — (وزن و قد را وارد کنید)'}
function renderMonthly(){
const u=currentUser();if(!u)return;const list=$('recordsList');list.innerHTML='';
const recs=[...(u.records||[])].sort((a,b)=>b.date.localeCompare(a.date));
if(!recs.length){list.innerHTML='<p class="hint">هنوز ثبتی نداری. اولین ثبت ماه را بالا وارد کن.</p>';return}
const asc=[...(u.records||[])].sort((a,b)=>a.date.localeCompare(b.date));
recs.forEach(r=>{
const idx=asc.findIndex(x=>x.id===r.id);const prev=idx>0?asc[idx-1]:null;
let dw='—',cls='';if(prev&&prev.weight){const d=(r.weight-prev.weight).toFixed(1);dw=(d>0?'+':'')+d+' کیلو';cls=d<0?'down':(d>0?'up':'')}
const d=document.createElement('div');d.className='card record';
d.innerHTML=`<div class="meta"><b>📅 ${r.date}</b><span class="badge ${cls}">${dw}</span></div>
<div class="meta"><span>⚖️ وزن: ${toFa(r.weight)} کیلو</span><span>📏 BMI: ${r.bmi?r.bmi.toFixed(1):'—'}</span></div>
<div class="meta"><span>سینه ${toFa(r.chest)} | کمر ${toFa(r.waist)} | شکم ${toFa(r.belly)}</span></div>
<div class="meta"><span>باسن ${toFa(r.hips)} | بازو ${toFa(r.armR)}/${toFa(r.armL)} | ران ${toFa(r.thighR)}/${toFa(r.thighL)} | ساق ${toFa(r.calf)}</span></div>
<div class="record-photos">${r.photoFront?`<img src="${r.photoFront}">`:''}${r.photoBack?`<img src="${r.photoBack}">`:''}${r.photoSide?`<img src="${r.photoSide}">`:''}</div>
<div class="row-btns" style="padding:0;margin-top:8px"><button class="small-btn goProg">🏋️ برنامه این ماه</button><button class="small-btn danger delRec">حذف</button></div>`;
d.querySelector('.delRec').onclick=()=>{if(confirm('حذف شود؟')){u.records=u.records.filter(x=>x.id!==r.id);updateUser(u);renderMonthly();renderProgress()}};
d.querySelector('.goProg').onclick=()=>{goTab('tab-program')};
list.appendChild(d);
});
updateBMILive();
}

function bindProgress(){
$('compareRange').oninput=e=>{$('compareBeforeWrap').style.width=e.target.value+'%'};
}
function renderProgress(){
const u=currentUser();if(!u)return;const recs=[...(u.records||[])].sort((a,b)=>a.date.localeCompare(b.date));
drawWeight(recs);drawSizes(recs);renderSummary(recs);renderCompare(recs);
}
function drawWeight(recs){
const c=$('chartWeight'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
if(recs.length<1){ctx.fillStyle='#888';ctx.font='13px Vazirmatn';ctx.fillText('هنوز وزنی ثبت نشده',110,90);return}
const ws=recs.map(r=>r.weight);const min=Math.min(...ws)-1,max=Math.max(...ws)+1;
ctx.strokeStyle='#eee';for(let i=0;i<4;i++){const y=20+i*40;ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(330,y);ctx.stroke()}
ctx.strokeStyle='#ff6a00';ctx.lineWidth=2.5;ctx.beginPath();
recs.forEach((r,i)=>{const x=30+i*(300/Math.max(1,recs.length-1));const y=160-((r.weight-min)/(max-min||1))*130;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
ctx.stroke();ctx.fillStyle='#ff6a00';recs.forEach((r,i)=>{const x=30+i*(300/Math.max(1,recs.length-1));const y=160-((r.weight-min)/(max-min||1))*130;ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();ctx.fillStyle='#333';ctx.font='10px Vazirmatn';ctx.fillText(String(r.weight),x-10,y-8);ctx.fillStyle='#ff6a00'});
}
function drawSizes(recs){
const c=$('chartSizes'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
if(!recs.length){ctx.fillStyle='#888';ctx.font='13px Vazirmatn';ctx.fillText('سایزی ثبت نشده',120,100);return}
const keys=[['waist','#ff6a00'],['belly','#d33'],['hips','#2e9e44'],['chest','#3b82f6']];
const all=recs.flatMap(r=>keys.map(k=>r[k[0]]||0)).filter(v=>v>0);const min=Math.min(...all,100)-5,max=Math.max(...all,100)+5;
keys.forEach(([k,col])=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();recs.forEach((r,i)=>{const x=30+i*(300/Math.max(1,recs.length-1));const v=r[k]||0;const y=170-((v-min)/(max-min||1))*140;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke()});
}
function renderSummary(recs){
const box=$('summaryCard');
if(recs.length<1){box.innerHTML='هنوز نتیجه‌ای نیست. بعد از ۲ ثبت، خلاصه را اینجا ببین.';return}
const f=recs[0],l=recs[recs.length-1];const dw=(l.weight-f.weight).toFixed(1);const db=l.bmi&&f.bmi?(l.bmi-f.bmi).toFixed(1):'—';const dwaist=(l.waist-f.waist).toFixed(1);
box.innerHTML=`<h3>🧾 کارت خلاصه نتیجه</h3><p>از ${f.date} تا ${l.date} | تعداد ثبت: ${toFa(recs.length)}</p><p>تغییر وزن: <b>${dw} کیلو</b> ${dw<0?'👏 کاهش عالی':'📌'} | تغییر BMI: <b>${db}</b></p><p>تغییر دور کمر: <b>${dwaist} سانت</b> | وزن فعلی: <b>${toFa(l.weight)} کیلو</b></p>`;
}
function renderCompare(recs){
const b=$('beforeSelect'),a=$('afterSelect');b.innerHTML='';a.innerHTML='';
recs.forEach((r,i)=>{const o1=document.createElement('option');o1.value=i;o1.textContent=r.date+' ('+r.weight+'kg)';b.appendChild(o1);const o2=document.createElement('option');o2.value=i;o2.textContent=r.date+' ('+r.weight+'kg)';a.appendChild(o2)});
if(recs.length>=2){b.value=0;a.value=recs.length-1;updCompare(recs)}else{$('compareBefore').src='';$('compareAfter').src=''}
b.onchange=()=>updCompare(recs);a.onchange=()=>updCompare(recs);
}
function updCompare(recs){const bi=+$('beforeSelect').value,ai=+$('afterSelect').value;if(recs[bi])$('compareBefore').src=recs[bi].photoFront||recs[bi].photoSide||'';if(recs[ai])$('compareAfter').src=recs[ai].photoFront||recs[ai].photoSide||'';$('compareBeforeWrap').style.width=$('compareRange').value+'%'}

function defaultPrograms(){
const day=(name)=>({name,exercises:[]});
const week=(t)=>({title:t,days:[day('شنبه'),day('دوشنبه'),day('چهارشنبه')]});
return [{id:Date.now(),title:'ماه اول',nutrition:'صبحانه: تخم‌مرغ + نان سبوس‌دار\nناهار: برنج + مرغ + سالاد\nشام: سبک و پروتئینی',weeks:[week('هفته اول'),week('هفته دوم'),week('هفته سوم'),week('هفته چهارم')]}];
}
function bindProgram(){
$('btnAddMonth').onclick=()=>{const u=currentUser();u.programs=u.programs||[];u.programs.push({id:Date.now(),title:'ماه جدید',nutrition:'',weeks:[{title:'هفته اول',days:[{name:'شنبه',exercises:[]}]}]});updateUser(u);renderProgram()};
$('btnDelMonth').onclick=()=>{const u=currentUser();const id=$('progMonthSelect').value;u.programs=u.programs.filter(p=>String(p.id)!==String(id));if(!u.programs.length)u.programs=defaultPrograms();updateUser(u);renderProgram()};
$('btnSaveProgMeta').onclick=()=>{const u=currentUser();const p=getCurProg();if(!p)return;p.title=$('progTitle').value;p.nutrition=$('progNutrition').value;updateUser(u);renderProgram();alert('برنامه ذخیره شد ✅')};
$('btnAddWeek').onclick=()=>{const p=getCurProg();if(!p)return;p.weeks.push({title:'هفته '+(p.weeks.length+1),days:[{name:'شنبه',exercises:[]}]});saveCur();renderProgram()};
$('btnAddDay').onclick=()=>{const p=getCurProg();if(!p||!p.weeks[curWeek])return;const n=prompt('نام روز؟ مثلاً پنجشنبه','پنجشنبه');if(!n)return;p.weeks[curWeek].days.push({name:n,exercises:[]});saveCur();renderProgram()};
$('btnDelDay').onclick=()=>{const p=getCurProg();if(!p||!p.weeks[curWeek])return;if(!confirm('این روز حذف شود؟'))return;p.weeks[curWeek].days.splice(curDay,1);curDay=0;saveCur();renderProgram()};
$('btnAddExercise').onclick=()=>{
const p=getCurProg();if(!p)return;if(!p.weeks[curWeek]){alert('اول هفته بساز');return}if(!p.weeks[curWeek].days[curDay]){alert('اول روز بساز');return}
const ex={name:$('ex-name').value||'حرکت جدید',sets:$('ex-sets').value||'3',reps:$('ex-reps').value||'12',rest:$('ex-rest').value||'60 ثانیه',muscle:$('ex-muscle').value||'',tip:$('ex-tip').value||'',media:$('ex-media').value||''};
if(!ex.name){alert('نام حرکت را بنویس');return}
p.weeks[curWeek].days[curDay].exercises.push(ex);saveCur();renderProgram();
['ex-name','ex-sets','ex-reps','ex-rest','ex-muscle','ex-tip','ex-media'].forEach(i=>$(i).value='');
};
}
function getCurProg(){const u=currentUser();if(!u||!u.programs||!u.programs.length)return null;const id=$('progMonthSelect').value||u.programs[0].id;return u.programs.find(p=>String(p.id)===String(id))||u.programs[0]}
function saveCur(){const u=currentUser();updateUser(u)}
function renderProgram(){
const u=currentUser();if(!u)return;u.programs=u.programs&&u.programs.length?u.programs:defaultPrograms();updateUser(u);
const sel=$('progMonthSelect');const old=sel.value;sel.innerHTML='';u.programs.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.title;sel.appendChild(o)});if(old)sel.value=old;
sel.onchange=()=>{curWeek=0;curDay=0;renderProgram()};
const p=getCurProg();if(!p)return;$('progTitle').value=p.title;$('progNutrition').value=p.nutrition||'';
if(curWeek>=p.weeks.length)curWeek=0;
const wt=$('weeksTabs');wt.innerHTML='';p.weeks.forEach((w,i)=>{const b=document.createElement('button');b.textContent=w.title||('هفته '+(i+1));if(i===curWeek)b.classList.add('on');b.onclick=()=>{curWeek=i;curDay=0;renderProgram()};wt.appendChild(b)});
const dt=$('daysTabs');dt.innerHTML='';const days=(p.weeks[curWeek]&&p.weeks[curWeek].days)||[];if(curDay>=days.length)curDay=0;
days.forEach((d,i)=>{const b=document.createElement('button');b.textContent=d.name;if(i===curDay)b.classList.add('on');b.onclick=()=>{curDay=i;renderProgram()};dt.appendChild(b)});
const box=$('exercisesList');box.innerHTML='';const list=(days[curDay]&&days[curDay].exercises)||[];
if(!list.length)box.innerHTML='<p class="hint">برای این روز هنوز حرکتی ثبت نشده. از فرم پایین اضافه کن.</p>';
list.forEach((ex,idx)=>{
const div=document.createElement('div');div.className='ex';
let media='';if(ex.media){const m=ex.media.trim();if(m.includes('youtube.com')||m.includes('youtu.be')||m.includes('aparat.com')){let src=m;if(m.includes('youtu.be')){const id=m.split('/').pop().split('?')[0];src='https://www.youtube.com/embed/'+id}media=`<iframe src="${src}" allowfullscreen></iframe>`}else if(m.endsWith('.mp4')||m.includes('.mp4')){media=`<video controls preload="metadata" src="${m}"></video>`}else{media=`<img class="media" src="${m}" loading="lazy">`}}else{media='<p class="hint">🎥 گیف/ویدیو ثبت نشده — لینک فیلم همین حرکت را موقع ویرایش بگذار.</p>'}
div.innerHTML=`<h4>${idx+1}. ${ex.name}</h4><p>🔁 ست: <b>${ex.sets}</b> | تکرار: <b>${ex.reps}</b> | استراحت: <b>${ex.rest}</b></p><p>💪 عضله هدف: ${ex.muscle||'—'}</p><p>📝 نکته اجرا: ${ex.tip||'—'}</p>${media}<div class="row-btns" style="padding:0"><button class="small-btn danger delEx">حذف حرکت</button></div>`;
div.querySelector('.delEx').onclick=()=>{if(confirm('حذف شود؟')){list.splice(idx,1);saveCur();renderProgram()}};
box.appendChild(div);
});
}

function bindBackup(){
$('btnExport').onclick=()=>{const data={users:getUsers(),settings:getSettings(),exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup-bashgah.json';a.click()};
$('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.users)localStorage.setItem(LS_USERS,JSON.stringify(d.users));if(d.settings)localStorage.setItem(LS_SET,JSON.stringify(d.settings));renderSettingsHome();showMain();alert('بکاپ برگشت ✅')}catch{alert('فایل خراب است')}};r.readAsText(f)};
}
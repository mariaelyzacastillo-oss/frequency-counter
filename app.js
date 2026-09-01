import {initializeApp} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {getDatabase,ref,set,update,onValue} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig={apiKey:"AIzaSyDAvZjuQT-MtsgmzxmyxsGQ79RJCA9_SQk",authDomain:"frequency-counter-61745.firebaseapp.com",databaseURL:"https://frequency-counter-61745-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"frequency-counter-61745",storageBucket:"frequency-counter-61745.firebasestorage.app",messagingSenderId:"115533433243",appId:"1:115533433243:web:b2b0bf96a1f260253f393e",measurementId:"G-76QPH1RGQY"};
const app=initializeApp(firebaseConfig),db=getDatabase(app),auth=getAuth(app);
const S=["Science","English","Filipino","TLE","Math","ESP","MAPEH","AP"],N=40,$=id=>document.getElementById(id);
let uid=null,session="",group="Group 1",sub="Science",item=0,role="group",sessionData=null,unsub=null;
S.forEach(s=>{$("subject").add(new Option(s));$("dashSubject").add(new Option(s))});
function show(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(p).classList.add("active")}
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>show(b.dataset.p));
const blank=()=>Array.from({length:N},(_,i)=>({c:0,x:0}));
function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function groupPath(g=group){return `sessions/${session}/groups/${g}/subjects/${sub}`}
function renderLocal(){let a=(sessionData?.groups?.[group]?.subjects?.[sub]?.[item])||{c:0,x:0};$("item").textContent=item+1;$("cn").textContent=a.c||0;$("xn").textContent=a.x||0}
async function boot(){try{let r=await signInAnonymously(auth);uid=r.user.uid;$("homeStatus").textContent="✓ Connected to live database."; }catch(e){$("homeStatus").textContent="Firebase sign-in is not enabled yet. Enable Anonymous Authentication in Firebase.";}}
boot();
$("create").onclick=async()=>{session=code();role="teacher";await set(ref(db,`sessions/${session}`),{createdBy:uid,createdAt:Date.now(),active:true});$("sessionDisplay").textContent=session;$("homeStatus").innerHTML=`Teacher session created: <b>${session}</b>`;listen();show("dashboard")};
$("join").onclick=()=>{let c=prompt("Enter the 6-character session code:");if(!c)return;session=c.trim().toUpperCase();role="group";$("session").value=session;show("counter");$("counterStatus").textContent="Checking session…";onValue(ref(db,`sessions/${session}`),snap=>{if(!snap.exists())$("counterStatus").textContent="Session not found. Check the code.";else{$("counterStatus").textContent="✓ Connected to session. Choose your group and start.";sessionData=snap.val();renderLocal()}},{onlyOnce:true})};
$("group").onchange=e=>{group=e.target.value;item=0;loadGroup()};$("subject").onchange=e=>{sub=e.target.value;item=0;loadGroup()};
async function loadGroup(){if(!session)return; if(unsub)unsub();unsub=onValue(ref(db,groupPath()),snap=>{let arr=snap.val()||blank();sessionData=sessionData||{};sessionData.groups=sessionData.groups||{};sessionData.groups[group]=sessionData.groups[group]||{};sessionData.groups[group].subjects=sessionData.groups[group].subjects||{};sessionData.groups[group].subjects[sub]=arr;renderLocal()})}
async function rec(ok){if(!session)return alert("Join a session first.");let path=groupPath(),snapData=sessionData?.groups?.[group]?.subjects?.[sub]||blank(),a=snapData[item]||{c:0,x:0};ok?a.c++:a.x++;snapData[item]=a;await set(ref(db,path),snapData)}
$("correct").onclick=()=>rec(true);$("incorrect").onclick=()=>rec(false);
$("undo").onclick=()=>{let a=sessionData?.groups?.[group]?.subjects?.[sub]?.[item];if(!a)return;if(a.c>0)a.c--;else if(a.x>0)a.x--;set(ref(db,groupPath()+"/"+item),a)};
$("reset").onclick=()=>set(ref(db,groupPath()+"/"+item),{c:0,x:0});
$("next").onclick=()=>{if(item<N-1)item++;renderLocal()};
$("dashSubject").onchange=e=>{sub=e.target.value;renderDashboard()};
function listen(){if(unsub)unsub();unsub=onValue(ref(db,`sessions/${session}`),snap=>{sessionData=snap.val()||{};renderDashboard()})}
function renderDashboard(){let d=sessionData?.groups||{},s=$("dashSubject").value||sub;$("sessionDisplay").textContent=session||"No active session";let cards=S.map(()=>0);$("groupTiles").innerHTML=["Group 1","Group 2","Group 3","Group 4","Group 5"].map(g=>{let a=d[g]?.subjects?.[s]||[],c=a.reduce((z,x)=>z+(x?.c||0),0),x=a.reduce((z,x)=>z+(x?.x||0),0);return `<div class="tile"><b>${g}</b><br>✓ ${c} &nbsp; ✕ ${x}<br>Total ${c+x}</div>`}).join("");let r=Array.from({length:N},(_,i)=>({c:0,x:0}));Object.values(d).forEach(g=>(g.subjects?.[s]||[]).forEach((a,i)=>{r[i].c+=a?.c||0;r[i].x+=a?.x||0}));$("report").innerHTML=r.map((a,i)=>{let t=a.c+a.x;return `<tr><td>${i+1}</td><td>${a.c}</td><td>${a.x}</td><td>${t}</td><td>${t?(a.c/t*100).toFixed(1):0}%</td></tr>`}).join("")}
$("closeSession").onclick=async()=>{if(session&&confirm("End this session?")){await update(ref(db,`sessions/${session}`),{active:false});sessionData=null;session="";$("sessionDisplay").textContent="No active session";show("home")}};
$("dashSubject").value="Science";$("subject").value="Science";

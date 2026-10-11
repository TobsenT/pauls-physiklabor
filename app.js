'use strict';
const app = document.getElementById('app');
const STORE_KEY = 'pauls-physiklabor-v1';
let storageAvailable = true;
let state = { session:null, solved:[], rounds:0, bestFull:null };
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
  if (saved && Array.isArray(saved.solved)) {
    state.solved = saved.solved.filter(id => QUESTIONS.some(q => q.id === id));
    state.rounds = Math.max(0, Number(saved.rounds) || 0);
    state.bestFull = Number.isFinite(saved.bestFull) ? saved.bestFull : null;
    if (saved.session && Array.isArray(saved.session.queue) && saved.session.queue.length && saved.session.queue.every(id => QUESTIONS.some(q => q.id === id)) && saved.session.records && Array.isArray(saved.session.answers) && Number.isInteger(saved.session.index) && saved.session.index >= 0 && saved.session.index <= saved.session.queue.length) state.session = saved.session;
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
} catch { storageAvailable = false; }
let pendingStart = null;
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicFor = q => TOPICS.find(t => t.id === q.topic);
const questionFor = id => QUESTIONS.find(q => q.id === id);
const shuffle = items => { const a = [...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch{storageAvailable=false;}}
function page(html, nav='home', focus=true) {
  app.innerHTML=html;
  document.getElementById('nav-home').classList.toggle('active',nav==='home');
  document.getElementById('nav-learn').classList.toggle('active',nav==='learn');
  if(focus){window.scrollTo({top:0,behavior:'instant'});const title=app.querySelector('h1');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
}
function home(focus=true){
 const s=state.session;
 const canResume=s && s.index<s.queue.length;
 const completed=state.solved.length;
 page(`${canResume?`<div class="resume"><p><b>Deine Runde wartet auf dich.</b><br>${esc(s.label)} · ${s.answers.length} von ${s.queue.length} Aufgaben fertig</p><button class="btn small" data-action="resume">Weiterüben →</button></div>`:''}
 <section class="hero"><div><div class="eyebrow"><span class="dot"></span>Deine Mission: Wärme verstehen</div><h1>Willkommen.<br>Mach aus Wissen<br><em>deine Superkraft.</em></h1><p class="intro">Warum schwimmt Eis? Wie wird ein Zimmer warm? Teste dein Wissen und entdecke, wie Wärme, Teilchen und Temperatur zusammenhängen.</p><div class="hero-actions"><button class="btn" data-action="start" data-mode="full">Übungstest starten <span aria-hidden="true">↗</span></button><button class="btn secondary" data-action="start" data-mode="quick">Kurze Runde</button></div><div class="hero-notes"><span>Ohne Zeitdruck</span><span>Feedback nach jeder Aufgabe</span></div></div><div class="lab-art">${LAB_ART}<div class="art-note"><b>Kleine Fragen. Große Aha-Momente.</b>Fehler sind Teil des Lernens.</div></div></section>
 <section class="overview-strip" aria-label="Dein Lernüberblick"><div class="strip-item"><span class="strip-number">24</span><span class="strip-label"><b>Aufgaben</b>im ganzen Übungstest</span></div><div class="strip-divider"></div><div class="strip-item"><span class="strip-number">6</span><span class="strip-label"><b>Themen</b>rund um Wärme und Temperatur</span></div><div class="strip-divider"></div><div class="strip-item"><span class="strip-number">${completed}<span style="font-size:14px;font-weight:500"> / 24</span></span><span class="strip-label"><b>Schon richtig gelöst</b>in diesem Browser</span></div></section>
 <div class="section-top"><h2>Was möchtest du knacken?</h2><p>Ein Thema antippen.<br>Vier Aufgaben ausprobieren.</p></div>
 <section class="topics" aria-label="Einzelne Themen üben">${TOPICS.map(t=>{const n=QUESTIONS.filter(q=>q.topic===t.id&&state.solved.includes(q.id)).length;return `<button class="topic-card" data-action="start" data-mode="topic" data-topic="${t.id}" style="--tint:${t.tint}"><span class="topic-icon" aria-hidden="true">${t.icon}</span><div><h3>${t.name}</h3><p>${t.subtitle}</p><span class="topic-progress">${n?`${n} von 4 schon gelöst`:'4 Aufgaben · Los geht’s →'}</span></div></button>`;}).join('')}</section>
 <aside class="callout"><span aria-hidden="true" style="font-size:24px">✦</span><p><b>Erst auffrischen, dann durchstarten.</b><br>Auf den Merkkarten findest du alles Wichtige auf einen Blick.</p><button data-action="learn">Zu den Merkkarten →</button></aside>`, 'home',focus);
 if(!storageAvailable)document.querySelector('.site-footer span:last-child').textContent='Dein Browser erlaubt gerade keine Speicherung. Du kannst trotzdem üben.';
}
function learn(){
 page(`<div class="lesson-head"><div><div class="eyebrow"><span class="dot"></span>Dein Wissen zum Mitnehmen</div><h1 style="margin-top:13px">Sechs Themen. Alles im Blick.</h1><p>Frische dein Wissen auf und probiere danach die passenden Aufgaben.</p></div><button class="btn secondary small" data-action="home">← Zur Übersicht</button></div><div class="lesson-grid">${TOPICS.map(t=>`<article class="lesson-card"><div class="lesson-title"><span class="topic-icon" style="--tint:${t.tint}" aria-hidden="true">${t.icon}</span><h2>${t.name}</h2></div><ul>${t.notes.map(n=>`<li>${n}</li>`).join('')}</ul><div class="lesson-note">💡 ${t.note}</div><button class="btn secondary small" data-action="start" data-mode="topic" data-topic="${t.id}">Dieses Thema üben →</button></article>`).join('')}</div>`,'learn');
}
function requestStart(mode, topic, ids){
 const config={mode,topic,ids};
 if(state.session && state.session.index<state.session.queue.length){
  pendingStart=config;
  page(`<div class="dialog-box"><div class="eyebrow"><span class="dot"></span>Du hast noch eine offene Runde</div><h1 style="margin-top:16px">Weiterüben oder neu starten?</h1><p>Wenn du eine neue Runde startest, wird die offene Runde ersetzt. Deine bisher richtig gelösten Aufgaben bleiben gespeichert.</p><div class="dialog-actions"><button class="btn" data-action="resume">Offene Runde fortsetzen</button><button class="btn secondary" data-action="confirm-start">Neue Runde starten</button><button class="text-btn" data-action="home">Zur Übersicht</button></div></div>`);
 }else start(config);
}
function start({mode,topic,ids}){
 let pool=QUESTIONS, label='Der ganze Übungstest';
 if(mode==='quick'){
  const base=TOPICS.map(t=>shuffle(QUESTIONS.filter(q=>q.topic===t.id))[0]);
  pool=[...base,...shuffle(QUESTIONS.filter(q=>!base.some(b=>b.id===q.id))).slice(0,2)];label='Kurze Runde';
 }else if(mode==='topic'){
  pool=QUESTIONS.filter(q=>q.topic===topic);label=TOPICS.find(t=>t.id===topic).name;
 }else if(mode==='retry'){
  pool=ids.map(questionFor);label='Deine Wiederholungsrunde';
 }
 const queue=shuffle(pool).map(q=>q.id), records={};
 queue.forEach(id=>{const q=questionFor(id);let order=shuffle(q.items?q.items.map((_,i)=>i):q.options.map((_,i)=>i));if(q.type==='order'&&order.every((n,i)=>n===i))order=[...order.slice(1),order[0]];records[id]={order,selection:q.type==='order'?[...order]:[],matches:q.type==='match'?q.rows.map(()=>null):[],checked:false,correct:false,hint:false};});
 state.session={mode,label,queue,records,index:0,answers:[],streak:0,maxStreak:0,counted:false};pendingStart=null;persist();renderQuestion();
}
function current(){const s=state.session;if(!s)return null;const q=questionFor(s.queue[s.index]);return q?{s,q,r:s.records[q.id],t:topicFor(q)}:null;}
function ready(q,r){if(q.type==='order')return true;if(q.type==='match')return r.matches.length===q.rows.length&&r.matches.every(n=>Number.isInteger(n));return r.selection.length>0;}
function isCorrect(q,r){if(q.type==='order')return r.selection.every((n,i)=>n===i);if(q.type==='match')return r.matches.every((n,i)=>n===q.answer[i]);return r.selection.length===q.answer.length&&r.selection.every(n=>q.answer.includes(n));}
function solution(q){if(q.type==='order')return q.items.map((x,i)=>`${i+1}. ${x}`).join(' → ');if(q.type==='match')return q.rows.map((x,i)=>`${x.replace(/ …$/,'')}: ${q.options[q.answer[i]]}`).join(' · ');return q.answer.map(i=>q.options[i]).join(' + ');}
function renderQuestion(focus=true){
 const c=current();if(!c){if(state.session)results();else home();return;}
 const {s,q,r,t}=c;
 let answers='';
 if(q.type==='order')answers=`<div class="order-list">${r.selection.map((n,i)=>`<div class="order-item ${r.checked&&r.correct?'solved':''}"><span class="order-num">${i+1}</span><span class="order-text">${esc(q.items[n])}</span><span class="order-controls"><button data-action="move" data-index="${i}" data-dir="-1" aria-label="Schritt ${i+1} nach oben" ${r.checked||i===0?'disabled':''}>↑</button><button data-action="move" data-index="${i}" data-dir="1" aria-label="Schritt ${i+1} nach unten" ${r.checked||i===r.selection.length-1?'disabled':''}>↓</button></span></div>`).join('')}</div>`;
 else if(q.type==='match')answers=`<div class="matches">${q.rows.map((label,i)=>`<div class="match-row"><label class="match-label" for="match-${i}">${esc(label)}</label><select id="match-${i}" data-match="${i}" ${r.checked?'disabled':''} class="${r.checked?(r.matches[i]===q.answer[i]?'correct':'wrong'):''}"><option value="" ${r.matches[i]===null?'selected':''}>Bitte wählen …</option>${r.order.map(n=>`<option value="${n}" ${r.matches[i]===n?'selected':''}>${esc(q.options[n])}</option>`).join('')}</select></div>`).join('')}</div>`;
 else answers=`<div class="answers ${q.type==='multi'?'multi':''}" role="group" aria-label="Antwortmöglichkeiten">${r.order.map((n,i)=>{let status='';if(r.checked){if(q.answer.includes(n))status='correct';else if(r.selection.includes(n))status='wrong';}else if(r.selection.includes(n))status='selected';const mark=r.checked&&q.answer.includes(n)?'✓':r.checked&&r.selection.includes(n)?'×':q.type==='multi'?(r.selection.includes(n)?'✓':''):String.fromCharCode(65+i);return `<button class="answer ${status}" data-action="select" data-index="${n}" aria-pressed="${r.selection.includes(n)}" ${r.checked?'disabled':''}><span class="answer-mark" aria-hidden="true">${mark}</span><span>${esc(q.options[n])}${r.checked&&q.answer.includes(n)?'<span class="fine" style="display:block;color:var(--green)">Richtige Antwort</span>':r.checked&&r.selection.includes(n)?'<span class="fine" style="display:block;color:var(--red)">Deine Auswahl – noch nicht richtig</span>':''}</span></button>`;}).join('')}</div>`;
 const instructions={single:'Wähle eine Antwort aus.',multi:`Wähle genau ${q.answer?.length===3?'drei':q.answer?.length===4?'vier':'fünf'} Antworten aus.`,order:'Verschiebe die Schritte mit den Pfeilen. Beginne mit dem Brenner.',match:'Wähle für jede Zeile den passenden Begriff.'};
 const points=s.answers.filter(a=>a.correct).length;
 const encouragement=r.correct?(s.streak>=3?'Du hast den Dreh raus!':s.index%2?'Genau richtig!':'Richtig kombiniert!'):'Ein Aha-Moment für dich.';
 page(`<div class="quiz-shell"><div class="quiz-top"><button class="text-btn" data-action="home">← Pause & Übersicht</button><div class="stats"><span>★ ${points} Punkte</span>${s.streak>=2?`<span class="streak">🔥 ${s.streak} in Folge</span>`:''}</div></div><div class="progress-meta"><span>${esc(s.label)}</span><span>Aufgabe ${s.index+1} / ${s.queue.length}</span></div><div class="progress-track" role="progressbar" aria-label="Beantwortete Aufgaben" aria-valuemin="0" aria-valuemax="${s.queue.length}" aria-valuenow="${s.answers.length}"><div class="progress-fill" style="width:${s.answers.length/s.queue.length*100}%"></div></div><article class="question-card"><span class="question-badge" style="--tint:${t.tint}"><span aria-hidden="true">${t.icon}</span>${t.name}</span><h1>${esc(q.title)}</h1><p class="instruction">${instructions[q.type]}</p>${q.visual==='particles'?PARTICLE_ART:''}${answers}${r.hint?`<p class="hint"><b>Dein Tipp:</b> ${esc(q.hint)}</p>`:''}${!r.checked?`<div class="question-bottom"><button class="hint-btn" data-action="hint" ${r.hint?'disabled':''}>${r.hint?'💡 Tipp ist eingeblendet':'💡 Einen Tipp, bitte'}</button><button class="btn" data-action="check" ${ready(q,r)?'':'disabled'}>Antwort prüfen <span aria-hidden="true">→</span></button></div>`:`<section class="feedback ${r.correct?'':'is-wrong'}" role="status" tabindex="-1"><p class="mini-label">${r.correct?'+1 Punkt':'Lernen zählt. Weiter geht’s!'}</p><h2>${r.correct?'✓':'💡'} ${encouragement}</h2>${!r.correct?`<p class="solution">So ist es richtig: ${esc(solution(q))}</p>`:''}<p>${esc(q.explanation)}</p></section><div class="next-row"><button class="btn" data-action="next">${s.index===s.queue.length-1?'Mein Ergebnis ansehen':'Nächste Aufgabe'} →</button></div>`}</article><p class="fine" style="text-align:center;margin-top:18px">Ein Punkt pro richtiger Aufgabe · Tipps helfen dir und kosten keine Punkte.</p></div>`,'home',focus);
}
function check(){
 const c=current();if(!c||c.r.checked||!ready(c.q,c.r))return;
 const {s,q,r}=c;r.checked=true;r.correct=isCorrect(q,r);
 s.answers.push({id:q.id,correct:r.correct,hint:r.hint});s.streak=r.correct?s.streak+1:0;s.maxStreak=Math.max(s.maxStreak,s.streak);
 if(r.correct&&!state.solved.includes(q.id))state.solved.push(q.id);
 persist();renderQuestion(false);const feedback=app.querySelector('.feedback');feedback.focus({preventScroll:true});feedback.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'nearest'});
 if(r.correct&&s.streak===3)confetti(12);
}
function results(){
 const s=state.session;if(!s){home();return;}if(s.index<s.queue.length){renderQuestion();return;}
 const correct=s.answers.filter(a=>a.correct).length,total=s.queue.length,wrong=s.answers.filter(a=>!a.correct),percent=Math.round(correct/total*100);
 if(!s.counted){state.rounds++;if(s.mode==='full')state.bestFull=Math.max(state.bestFull||0,correct);s.counted=true;persist();}
 const headline=percent===100?'Alles geknackt!':percent>=75?'Starke Runde!':percent>=50?'Du bist auf einem guten Weg.':'Der Anfang ist gemacht!';
 const text=percent===100?'Du hast jede Aufgabe richtig gelöst. Probiere später noch eine Runde – so bleibt das Wissen hängen.':`Du hast ${correct} von ${total} Aufgaben richtig gelöst. ${wrong.length===1?'Eine Aufgabe kannst du jetzt gezielt wiederholen.':'Die offenen Aufgaben kannst du jetzt gezielt wiederholen.'}`;
 page(`<div class="result-shell"><section class="result-hero"><div class="eyebrow">✦ Runde geschafft</div><h1>${headline}</h1><div class="score-circle"><strong>${correct}<span style="font-size:22px;font-weight:500"> / ${total}</span></strong><span>Punkte gesammelt</span></div><p>${text}</p><div class="result-badges"><span>🏁 ${state.rounds} ${state.rounds===1?'Runde':'Runden'} geschafft</span>${s.maxStreak>=2?`<span>🔥 ${s.maxStreak} richtig in Folge</span>`:''}${s.answers.some(a=>a.hint)?'<span>💡 Tipps genutzt & dazugelernt</span>':''}${s.mode==='full'?`<span>★ Bestwert: ${state.bestFull} / 24</span>`:''}</div></section><div class="result-actions">${wrong.length?'<button class="btn" data-action="retry">Offene Aufgaben wiederholen →</button>':'<button class="btn" data-action="start" data-mode="full">Noch eine Runde →</button>'}<button class="btn secondary" data-action="home">Zur Themenübersicht</button></div><section class="topic-results"><h2>Dein Themen-Check</h2>${TOPICS.map(t=>{const a=s.answers.filter(a=>questionFor(a.id).topic===t.id);if(!a.length)return '';const n=a.filter(a=>a.correct).length;return `<div class="topic-result"><span aria-hidden="true">${t.icon}</span><span>${t.name}</span><span class="bar"><div style="width:${n/a.length*100}%"></div></span><span class="count">${n} / ${a.length}</span></div>`;}).join('')}</section>${wrong.length?`<h2 class="review-title">Hier wartet noch ein Aha-Moment</h2>${wrong.map(a=>{const q=questionFor(a.id);return `<details class="review-item"><summary>${esc(q.title)}</summary><div class="review-body"><p><b>Richtige Lösung:</b> ${esc(solution(q))}</p><p>${esc(q.explanation)}</p></div></details>`;}).join('')}`:'<p style="margin-top:24px;text-align:center;font-size:14px">🎉 Alle Aufgaben dieser Runde richtig gelöst. Gut gemacht!</p>'}<div class="reset-row"><button class="text-btn" data-action="learn">Wissen auf den Merkkarten auffrischen →</button><br><button class="text-btn" data-action="reset-prompt" style="font-size:11px">Gespeicherten Lernfortschritt zurücksetzen</button></div></div>`);
 if(percent===100)confetti(30);
}
function confetti(count){if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;const box=document.getElementById('confetti');for(let i=0;i<count;i++){const bit=document.createElement('i');bit.className='confetti-bit';bit.style.cssText=`--x:${Math.random()*100}%;--c:${['#d5ed84','#d64c2c','#a4c9d6','#f2ae65'][i%4]};--drift:${Math.random()*180-90}px;animation-delay:${Math.random()*.3}s`;box.appendChild(bit);setTimeout(()=>bit.remove(),2100);}}
document.addEventListener('click',e=>{
 const b=e.target.closest('button[data-action]');if(!b||b.disabled)return;
 const action=b.dataset.action,c=current();
 if(action==='home')home();
 else if(action==='learn')learn();
 else if(action==='start')requestStart(b.dataset.mode,b.dataset.topic);
 else if(action==='confirm-start'&&pendingStart)start(pendingStart);
 else if(action==='resume'){pendingStart=null;renderQuestion();}
 else if(action==='select'&&c&&!c.r.checked){const n=Number(b.dataset.index);if(c.q.type==='multi')c.r.selection=c.r.selection.includes(n)?c.r.selection.filter(i=>i!==n):[...c.r.selection,n];else c.r.selection=[n];persist();renderQuestion(false);app.querySelector(`[data-action="select"][data-index="${n}"]`).focus({preventScroll:true});}
 else if(action==='move'&&c&&!c.r.checked){const i=Number(b.dataset.index),j=i+Number(b.dataset.dir);if(j<0||j>=c.r.selection.length)return;[c.r.selection[i],c.r.selection[j]]=[c.r.selection[j],c.r.selection[i]];persist();renderQuestion(false);const btn=app.querySelector(`[data-action="move"][data-index="${j}"][data-dir="${b.dataset.dir}"]:not(:disabled)`)||app.querySelector(`[data-action="move"][data-index="${j}"]:not(:disabled)`);btn?.focus({preventScroll:true});}
 else if(action==='hint'&&c&&!c.r.checked){c.r.hint=true;persist();renderQuestion(false);app.querySelector('.hint').setAttribute('role','status');app.querySelector('.hint').scrollIntoView({block:'nearest'});}
 else if(action==='check')check();
 else if(action==='next'&&c&&c.r.checked){c.s.index++;persist();if(c.s.index===c.s.queue.length)results();else renderQuestion();}
 else if(action==='retry'&&state.session){const ids=state.session.answers.filter(a=>!a.correct).map(a=>a.id);if(ids.length)requestStart('retry',null,ids);}
 else if(action==='reset-prompt')page(`<div class="dialog-box"><h1>Lernfortschritt zurücksetzen?</h1><p>Deine Punkte, abgeschlossenen Runden und bisher gelösten Aufgaben werden aus diesem Browser gelöscht.</p><div class="dialog-actions"><button class="btn secondary" data-action="show-results">Zurück zum Ergebnis</button><button class="btn" data-action="reset">Ja, zurücksetzen</button></div></div>`);
 else if(action==='show-results')results();
 else if(action==='reset'){state={session:null,solved:[],rounds:0,bestFull:null};persist();home();}
});
document.addEventListener('change',e=>{const select=e.target.closest('select[data-match]');const c=current();if(!select||!c||c.r.checked)return;c.r.matches[Number(select.dataset.match)]=select.value===''?null:Number(select.value);persist();app.querySelector('[data-action="check"]').disabled=!ready(c.q,c.r);});
home(false);

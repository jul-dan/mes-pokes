'use strict';
/* Dix paires : voyelles puis consonnes fréquentes. Aucun prérequis symbolique. */
const PATH_LETTERS = ['A','O','I','E','U','M','L','P','R','S'];
const PATH_WORDS = {
 A:[['✈️','avion'],['🍍','ananas'],['🌳','arbre']], O:[['🍊','orange'],['🦭','otarie'],['🫒','olive']],
 I:[['🏝️','île'],['🦎','iguane'],['🏠','igloo']], E:[['🐘','éléphant'],['⭐','étoile'],['🪜','échelle']],
 U:[['🏭','usine'],['🥋','uniforme'],['🍴','ustensile']], M:[['🏍️','moto'],['🏠','maison'],['🐑','mouton']],
 L:[['🐇','lapin'],['🌙','lune'],['🦁','lion']], P:[['🍎','pomme'],['🦋','papillon'],['🐔','poule']],
 R:[['🦊','renard'],['🤖','robot'],['🌹','rose']], S:[['☀️','soleil'],['🐍','serpent'],['👜','sac']]
};
const PATH_SOUND = {A:'aaaa',O:'oooo',I:'iiii',E:'eu',U:'uuuu',M:'mmmm',L:'llll',P:'pe',R:'rrrr',S:'ssss'};
function freshPath(level=1) { return {v:1,level,lessons:{},letter:[],number:[],done:[],complete:false}; }
function learningPath() {
 if (!S.path || S.path.v !== 1) S.path = freshPath();
 const p=S.path; p.level=clamp(Math.floor(+p.level)||1,1,10);
 if (!p.lessons || typeof p.lessons!=='object') p.lessons={};
 for (const key of ['letter','number','done']) if (!Array.isArray(p[key])) p[key]=[];
 return p;
}
function pathItems(kind) { const p=learningPath(); return kind==='letter' ? PATH_LETTERS.slice(0,p.level) : Array.from({length:p.level},(_,i)=>i+1); }
function pathCurrent(kind) { return kind==='letter'?PATH_LETTERS[learningPath().level-1]:learningPath().level; }
function pathReady() { const p=learningPath(); return p.lessons[p.level+'letter'] && p.lessons[p.level+'number']; }
function pathMastered(a) { return a.length>=3 && a.slice(-5).filter(Boolean).length/a.slice(-5).length>=.8; }
function recordPath(q,first) {
 if (!q.pathKind || q.pathTarget !== pathCurrent(q.pathKind)) return;
 const p=learningPath(); p[q.pathKind].push(!!first); p[q.pathKind]=p[q.pathKind].slice(-5); save();
}
function pathNeedsAdvance() { const p=learningPath(); return !p.complete && pathReady() && pathMastered(p.letter) && pathMastered(p.number); }
function pathAdvance() {
 const p=learningPath(); if(!pathNeedsAdvance()) return false;
 p.done=[...new Set([...p.done,p.level])];
 if(p.level===10) p.complete=true;
 else {p.level++;p.letter=[];p.number=[];}
 S.run=null;save();return true;
}
function pathBadgeHTML() {
 const p=learningPath(); return PATH_LETTERS.map((l,i)=>`<button class="path-badge ${p.done.includes(i+1)?'earned':i+1===p.level?'current':'locked'}" data-level="${i+1}" ${i+1>p.level?'disabled':''} aria-label="${i+1>p.level?'Étape à découvrir':`Revoir ${l} et ${i+1}`}"><small>${p.done.includes(i+1)?'⭐':i+1===p.level?'🌱':'🔒'}</small><strong>${l} · ${i+1}</strong></button>`).join('');
}
function showPath() {
 const s=$('#s-game');show('s-game');const p=learningPath();
 s.innerHTML=`<div class="path-page"><button class="path-btn" id="pathHome">⌂ Accueil</button><h1>Mon chemin des lettres<br>et des chiffres</h1><div class="path-pet">${petHTML(true)}</div><p>Un petit pas à la fois !</p><div class="path-map">${pathBadgeHTML()}</div><p>${p.complete?'Toutes les paires sont apprivoisées !':'Aujourd’hui : '+pathCurrent('letter')+' et '+p.level}</p><div class="path-meters"><span>Lettre : ${p.letter.filter(Boolean).length}/${Math.max(3,p.letter.length)} réussites</span><span>Nombre : ${p.number.filter(Boolean).length}/${Math.max(3,p.number.length)} réussites</span></div><button class="path-btn primary" id="pathPlay">▶ ${pathReady()?'Jouer':'Découvrir la leçon'}</button><button class="path-btn" id="pathReplay">🔊 Revoir la leçon</button></div>`;
 $('#pathHome').onclick=()=>{Voice.stop();screenHome(false);};$('#pathPlay').onclick=()=>startSession();
 $('#pathReplay').onclick=()=>showLesson('letter',p.level,()=>showLesson('number',p.level,showPath));
 $$('.path-badge:not(:disabled)',s).forEach(b=>b.onclick=()=>showLesson('letter',+b.dataset.level,()=>showLesson('number',+b.dataset.level,showPath)));
 say('Voici ton chemin. Chaque étoile est une lettre et un nombre que tu connais !');
}
let lessonToken=0;
function fingersHTML(n) {
 return `<div class="finger-hands" aria-label="${n} doigt${n>1?'s':''} levé${n>1?'s':''}">${[0,1].map(h=>`<svg viewBox="0 0 150 120" aria-hidden="true"><path d="M34 58 Q24 75 40 100 Q72 120 114 98 L120 58Z" fill="#f5cda0" stroke="#a87654" stroke-width="2"/>${Array.from({length:5},(_,i)=>{const active=h*5+i<n;return `<rect x="${20+i*23}" y="${active?10+Math.abs(i-2)*6:58}" width="20" height="${active?65-Math.abs(i-2)*6:26}" rx="10" fill="${active?'#ffc97c':'#d1af8d'}" stroke="#a87654" stroke-width="2"/>`;}).join('')}</svg>`).join('')}</div>`;
}
function showLesson(kind='letter',level=learningPath().level,after=()=>startSession()) {
 Voice.stop();const token=++lessonToken;show('s-game');const s=$('#s-game'),letter=PATH_LETTERS[level-1],symbol=kind==='letter'?letter:level,words=PATH_WORDS[letter];let step=0;
 const alive=()=>token===lessonToken&&!s.hidden;
 function render() {
  if(!alive())return;Voice.stop();
  s.innerHTML=`<div class="lesson-page"><header><button class="path-btn" id="lessonHome" aria-label="Accueil">⌂</button><span>Ma petite leçon · ${kind==='letter'?'lettre':'nombre'}</span><button class="path-btn" id="lessonSay" aria-label="Réécouter">🔊</button></header><div class="lesson-guide"><div class="lesson-pet">${petHTML(true)}</div><p id="lessonText"></p></div><div class="lesson-dots" aria-label="étape ${step+1} sur 3">${[0,1,2].map(i=>`<span class="${i<=step?'on':''}"></span>`).join('')}</div><div id="lessonBody"></div><button class="path-btn primary" id="lessonNext">${['On regarde ▶','Je cherche ▶','⭐ Bravo !'][step]}</button></div>`;
  $('#lessonHome').onclick=()=>{lessonToken++;Voice.stop();screenHome(false);};
  const body=$('#lessonBody'),next=$('#lessonNext');let speech='';
  if(step===0) {
   speech=kind==='letter'?`Je te présente la lettre ${LETTER_SAY[letter]}. Écoute son nom : ${LETTER_SAY[letter]}. ${letter==='E'?'Le E peut faire eu, comme dans le mot le. Avec un accent, il peut faire é, comme étoile.':`Elle peut faire le son ${PATH_SOUND[letter]}. ${letter} comme ${words[0][1]}.`}`:`Voici le nombre ${NUM_SAY[level]}. Il sert à dire combien il y en a. Regarde : ${NUM_SAY[level]}.`;
   body.innerHTML=`<div class="lesson-symbol">${symbol}</div>${kind==='letter'?`<div class="lesson-words">${words.map(([e,w])=>`<button class="word-picture" aria-label="${w}"><span>${e}</span><small>${w}</small></button>`).join('')}</div>`:`<div class="count-objects" id="lessonObjects"></div>`}`;
   if(kind==='letter')$$('.word-picture',body).forEach((b,i)=>b.onclick=()=>say(`${letter} comme ${words[i][1]}.`));
  } else if(step===1) {
   speech=kind==='letter'?`Voici la grande lettre ${LETTER_SAY[letter]} et la petite ${LETTER_SAY[letter]}. C'est la même lettre. Touche-les pour écouter.`:`Avec tes mains, montre ${NUM_SAY[level]} doigt${level>1?'s':''}. Les doigts en couleur sont levés. On peut compter ensemble.`;
   body.innerHTML=kind==='letter'?`<button class="letter-pair" aria-label="${letter} et ${letter.toLowerCase()}">${letter} <span>${letter.toLowerCase()}</span></button><div class="lesson-words">${words.slice(0,2).map(([e])=>`<span class="picture">${e}</span>`).join('')}</div>`:fingersHTML(level);
   if(kind==='letter')$('.letter-pair').onclick=()=>say(`La grande ${LETTER_SAY[letter]} et la petite ${LETTER_SAY[letter]}.`);
  } else {
   speech=kind==='letter'?`À toi ! Touche la lettre ${LETTER_SAY[letter]}.`:`À toi ! Touche le nombre ${NUM_SAY[level]}.`;
   const pool=(kind==='letter'?PATH_LETTERS.slice(0,level):Array.from({length:level},(_,i)=>i+1)).filter(x=>x!==symbol);
   const opts=shuffle([{text:String(symbol),ok:true},{text:pool.length?String(pick(pool)):'●',ok:false}]);
   body.innerHTML=`${kind==='number'?`<div class="quiz-objects">${'🍎'.repeat(level)}</div>`:''}<div class="lesson-quiz">${opts.map(o=>`<button class="quiz-choice" data-ok="${o.ok}" aria-label="${o.text}">${o.text}</button>`).join('')}</div><p id="quizFeedback">Écoute, puis touche.</p>`;next.disabled=true;
   $$('.quiz-choice',body).forEach(b=>b.onclick=()=>{if(b.dataset.ok==='true'){next.disabled=false;b.classList.add('correct');$('#quizFeedback').textContent='Oui ! Bravo !';Snd.good();say('Oui ! Bravo !');}else{Snd.soft();say(`Essaie encore. ${speech}`);$('#quizFeedback').textContent='Essaie encore, tu vas y arriver.';}});
  }
  $('#lessonText').textContent=step===0?(kind==='letter'?`${letter} comme ${words[0][1]}`:`Découvrons ${NUM_SAY[level]}`):step===1?'On regarde ensemble':'À toi de trouver !';
  const speak=async()=>{
   await say(speech);if(!alive())return;
   if(step===0&&kind==='letter'||step===1)next.disabled=false;
   if(kind==='number'&&step===0){next.disabled=true;const objects=$('#lessonObjects');objects.innerHTML='';for(let i=1;i<=level;i++){if(!alive()||!$('#lessonObjects'))return;objects.insertAdjacentHTML('beforeend','<span class="arrive">🍎</span>');await say(NUM_SAY[i]);await sleep(180);}if(alive()&&step===0)next.disabled=false;}
  };
  $('#lessonSay').onclick=()=>{if(kind==='number'&&step===0&&next.disabled)return;speak();};
  next.onclick=()=>{if(next.disabled)return;if(step<2){step++;render();}else{const p=learningPath();p.lessons[level+kind]=true;save();lessonToken++;Voice.stop();after();}};
  if(step===0||step===1)next.disabled=true;speak();
 }
 render();
}
function ensurePathLessons(after) {
 const p=learningPath();if(!p.lessons[p.level+'letter']){showLesson('letter',p.level,()=>{if(ensurePathLessons(after))after();});return false;}
 if(!p.lessons[p.level+'number']){showLesson('number',p.level,()=>{if(ensurePathLessons(after))after();});return false;}return true;
}
function pathQuestion(type) {
 const letters=['lettres','minmaj','debut'],numbers=['chiffres','compter','compter10','quantite','plusun','subitizing','suitenum'];
 if(!letters.includes(type)&&!numbers.includes(type))return null;
 const kind=letters.includes(type)?'letter':'number',items=pathItems(kind),cur=pathCurrent(kind);
 // Two thirds of questions focus on the newly introduced item.
 const target=Math.random()<.7?cur:pick(items),others=shuffle(items.filter(x=>x!==target)).slice(0,2);
 const glyph=x=>`<span class="glyph" style="color:#8055c8">${x}</span>`;
 let prompt='',text=kind==='letter'?`Touche la lettre ${LETTER_SAY[target]}.`:`Touche le nombre ${NUM_SAY[target]}.`,opts=[target,...others],draw=glyph;
 if(kind==='letter'&&type==='minmaj'){prompt=`<div class="panel">${glyph(target)}</div>`;draw=x=>glyph(x.toLowerCase());text=`Voici la grande ${LETTER_SAY[target]}. Touche la petite ${LETTER_SAY[target]}.`;}
 if(type==='debut'){const w=pick(PATH_WORDS[target]);prompt=`<div class="panel" style="font-size:90px">${w[0]}</div>`;text=`${target} comme ${w[1]}. Touche la lettre ${LETTER_SAY[target]} au début de ${w[1]}.`;}
 if(kind==='number'&&['compter','compter10','subitizing','plusun'].includes(type)){
  prompt=`<div class="panel">${groupGridSVG(target,'pomme' in OBJ?'pomme':Object.keys(OBJ)[0])}</div>`;
  text=`Compte les objets. Touche le bon nombre.`;
  if(type==='plusun'&&target>=2){prompt=`<div class="panel" style="font-size:34px">${'🍎'.repeat(target-1)}<span class="arrive"> 🍎</span></div>`;text=`${NUM_SAY[target-1]} pommes. Encore une arrive. Combien maintenant ?`;}
 }
 if(type==='quantite'){prompt=`<div class="panel">${glyph(target)}</div>`;text=`Voici ${NUM_SAY[target]}. Touche l'image avec ${NUM_SAY[target]} objet${target>1?'s':''}.`;draw=x=>groupGridSVG(x,Object.keys(OBJ)[0]);}
 if(type==='suitenum'){prompt=`<div class="panel numrow">${Array.from({length:Math.min(3,target-1)},(_,i)=>`<span>${Math.max(1,target-3)+i}</span>`).join('')}<span>?</span></div>`;text=`Les nombres se suivent. Quel nombre manque à la fin ?`;}
 let intro;
 if(type==='subitizing'){prompt=`<div class="panel" id="pathDots">${tenFrameSVG(target)}</div>`;text='Regarde les points. Combien y en a-t-il ?';intro=async()=>{await sleep(2200);const d=$('#pathDots');if(d){d.innerHTML='<button class="path-btn" id="pathDotsAgain">👀 Encore</button>';$('#pathDotsAgain').onclick=()=>{d.innerHTML=tenFrameSVG(target);};}};}
 const choices=opts.map(x=>({ok:x===target,html:draw(x)}));
 if(choices.length===1)choices.push({ok:false,html:shapeSVG('rond','#f4be48')});
 return {key:`path-${type}-${target}`,type,pathKind:kind,pathTarget:target,say:text,intro,prompt,choices:shuffle(choices),okSay:kind==='letter'?`Oui ! ${LETTER_SAY[target]} !`:`Oui ! ${NUM_SAY[target]} !`};
}
function pathParentSection() {
 const p=learningPath(),done=p.done.slice().sort((a,b)=>a-b);
 return `<section id="pathParent"><h3>Chemin des lettres et des chiffres</h3><p>Étape ${p.level}/10 · ${pathCurrent('letter')} et ${p.level}</p><p class="small">Badges maîtrisés : ${done.map(n=>PATH_LETTERS[n-1]+' · '+n).join(' / ')||'pas encore'}.<br>Découverts : ${PATH_LETTERS.slice(0,p.level).filter((l,i)=>p.lessons[(i+1)+'letter']).join(', ')||'—'} · ${Array.from({length:p.level},(_,i)=>i+1).filter(n=>p.lessons[n+'number']).join(', ')||'—'}</p><p class="small">Ordre : A, O, I, E, U, M, L, P, R, S, associés à 1 → 10. Une leçon avant de jouer, puis 80 % de bonnes réponses sur au moins 3 des 5 dernières tentatives pour chacun des deux éléments. Les boutons d'exercices ne désactivent pas les deux entraînements indispensables au parcours.</p><label>Aller à l'étape <select id="pathJump">${PATH_LETTERS.map((l,i)=>`<option value="${i+1}" ${p.level===i+1?'selected':''}>${i+1} : ${l} et ${i+1}</option>`).join('')}</select></label><button class="pbtn" id="pathJumpGo">Aller à cette étape</button><button class="pbtn ghost" id="pathSkip">Passer les deux leçons actuelles</button><button class="pbtn ghost" id="pathParentReplay">Revoir la leçon</button><button class="pbtn warn" id="pathReset">Recommencer le chemin</button><p class="small">Ces réglages ne changent pas les créatures, les points, les cartes ni les paquets. Un saut considère les étapes précédentes comme acquises.</p></section>`;
}
function bindPathParent() {
 $('#pathJumpGo').onclick=()=>{const n=+$('#pathJump').value;S.path=freshPath(n);for(let i=1;i<n;i++){S.path.done.push(i);S.path.lessons[i+'letter']=true;S.path.lessons[i+'number']=true;}S.run=null;save();openParent();};
 $('#pathSkip').onclick=()=>{const p=learningPath();p.lessons[p.level+'letter']=true;p.lessons[p.level+'number']=true;save();openParent();};
 $('#pathReset').onclick=()=>{if(!confirm('Recommencer uniquement le chemin à A et 1 ? Tes cartes et tes compagnons sont conservés.'))return;S.path=freshPath();S.run=null;save();openParent();};
 $('#pathParentReplay').onclick=()=>{$('#pClose').click();if(Game.active)quitSession(true);const n=learningPath().level;showLesson('letter',n,()=>showLesson('number',n,showPath));};
}

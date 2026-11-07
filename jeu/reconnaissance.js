'use strict';
/* Recognition, not handwriting. A completed pair is persisted before animations. */
function reconcilePath(){
 learningPath();if(pathNeedsAdvance()){const old=S.path.level;pathAdvance();S.path.celebrate=old;save();}
}
const RECO_LETTER=['find','bubbles','yesno','hidden','listen'];
const RECO_NUMBER=['quantity','match','yesno','stars','listen'];
const recoLast={letter:'',number:''};let recoSerial=0;
function recognitionQuestion(kind,format,review=false){
 const p=learningPath(),pool=pathItems(kind),current=pathCurrent(kind);
 if(format==='listen'&&p.level===1)format=kind==='letter'?'find':'quantity';
 const t=review&&p.level>1?pick(pool.slice(0,-1)):current;
 const colors=['#7d3cc5','#e74b57','#287bb8','#24936f'],fonts=['Arial','Georgia','Trebuchet MS','Verdana'];
 const glyph=(v)=>`<span class="reco-symbol" style="color:${pick(colors)};font-family:${pick(fonts)};font-size:${76+rnd(15)}px">${kind==='letter'&&p.lessons[p.level+'letter']&&Math.random()<.3?String(v).toLowerCase():v}</span>`;
 const shape=()=>`<span class="reco-symbol" style="color:${pick(colors)}">${pick(['◆','●','★','☂'])}</span>`;
 const others=shuffle(pool.filter(x=>x!==t));
 const spoken=kind==='letter'?`la lettre ${LETTER_SAY[t]}`:`le nombre ${NUM_SAY[t]}`;
 let q={key:`reco-${kind}-${format}-${t}-${++recoSerial}`,type:kind==='letter'?'lettres':'chiffres',pathKind:kind,pathTarget:t,format,say:'',prompt:'',okSay:`Oui ! ${kind==='letter'?LETTER_SAY[t]:NUM_SAY[t]} !`,choices:[]};
 const group=(n,emoji='🍎')=>`<div class="reco-objects">${Array.from({length:n},()=>`<span>${emoji}</span>`).join('')}</div>`;
 if(format==='yesno'){
  const yes=Math.random()<.5;
  q.say=kind==='letter'?`Est-ce ${spoken} ? Touche le pouce en haut pour oui, ou le pouce en bas pour non.`:`Est-ce qu'il y a ${NUM_SAY[t]} objet${t>1?'s':''} ? Pouce en haut pour oui, pouce en bas pour non.`;
  q.prompt=kind==='letter'?`<div class="reco-model">${yes?glyph(t):others.length?glyph(others[0]):shape()}</div>`:group(yes?t:others.length?others[0]:2,pick(['🍎','🐥','🦋']));
  q.choices=shuffle([{ok:yes,html:'<span class="reco-thumb">👍</span><small>Oui</small>'},{ok:!yes,html:'<span class="reco-thumb">👎</span><small>Non</small>'}]);
 }else if(format==='quantity'||format==='match'){
  const dis=others.slice(0,1);if(!dis.length)dis.push(pick([2,3]));
  q.say=format==='quantity'?`Trouve l'image avec ${NUM_SAY[t]} objet${t>1?'s':''}.`:`Voici ${spoken}. Quelle image va avec ?`;
  q.prompt=format==='match'?`<div class="reco-model">${glyph(t)}</div>`:'';
  const emoji=pick(['🍎','🐥','🦋','⭐']);q.choices=shuffle([t,...dis].map(n=>({ok:n===t,html:group(n,emoji)})));
 }else if(format==='bubbles'||format==='stars'){
  const targets=1+rnd(2);q.special='recognitionMulti';q.cols=2;
  q.say=`${format==='bubbles'?'Éclate toutes les bulles':'Attrape toutes les étoiles'} avec ${spoken}.`;
  q.prompt=`<div class="reco-instruction">${format==='bubbles'?'🫧':'🌟'} ${glyph(t)}</div>`;
  const vals=Array.from({length:4},(_,i)=>i<targets?{ok:true,html:glyph(t)}:{ok:false,html:others.length?glyph(pick(others)):shape()});
  q.choices=shuffle(vals).map(c=>({...c,html:`<div class="reco-${format}" style="--drift:${rnd(6)}s">${c.html}</div>`}));
 }else if(format==='hidden'){
  q.say=`Cherche ${spoken}, cachée dans un petit jardin. Touche le bon jardin.`;q.cols=2;
  const scene=(correct)=>`<div class="reco-scene"><span class="scene-tree">🌳</span><span class="scene-flower">🌼</span><span class="scene-butterfly">🦋</span><div style="position:absolute;left:${8+rnd(25)}%;top:${10+rnd(15)}%">${correct?glyph(t):shape()}</div></div>`;
  q.choices=shuffle([{ok:true,html:scene(true)},{ok:false,html:scene(false)},{ok:false,html:scene(false)}]);
 }else{
  q.say=`${format==='listen'?'Écoute bien. ':''}Touche ${spoken}.`;
  q.choices=[{ok:true,html:glyph(t)},...others.slice(0,2).map(v=>({ok:false,html:glyph(v)}))];
  while(q.choices.length<3)q.choices.push({ok:false,html:shape()});q.choices=shuffle(q.choices);
 }
 q.cols=q.cols|| (q.choices.length===4?2:q.choices.length);
 return q;
}
pathQuestion=function(type){
 const kind=['lettres','minmaj','debut'].includes(type)?'letter':['chiffres','compter','compter10','quantite','plusun','subitizing','suitenum'].includes(type)?'number':null;
 if(!kind)return null;
 let formats=(kind==='letter'?RECO_LETTER:RECO_NUMBER).filter(f=>f!==recoLast[kind]&&f!==recoLast.global&&(learningPath().level>1||f!=='listen'));
 // Alternate recognition formats; exactly three focused opportunities per pair and session.
 const f=pick(formats);recoLast[kind]=f;recoLast.global=f;return recognitionQuestion(kind,f,false);
};
async function runRecognitionMulti(q,stage){
 return new Promise(resolve=>{
  window.__q=q;Game.curResolve=resolve;let errors=0,remaining=q.choices.filter(c=>c.ok).length,done=false;
  stage.innerHTML=`<div class="prompt">${q.prompt}</div><p class="reco-remaining">${'⭐'.repeat(remaining)} à trouver</p><div class="choices c2">${q.choices.map((c,i)=>`<button class="choice reco-catch" data-i="${i}" aria-label="${q.format==='stars'?'Étoile':'Bulle'} ${i+1}">${c.html}</button>`).join('')}</div>`;
  say(q.say);
  $$('.choice',stage).forEach(b=>b.onclick=async()=>{
   if(done||b.disabled)return;
   if(!q.choices[+b.dataset.i].ok){errors++;Snd.soft();b.classList.add('nope');say('Écoute encore. '+q.say);return;}
   b.disabled=true;b.classList.add('caught');Snd.good();remaining--;$('.reco-remaining',stage).textContent=remaining?`${'⭐'.repeat(remaining)} à trouver`:'Tout trouvé !';
   if(!remaining){done=true;Battle.attack(errors===0);Confetti.burst(null,null,32);await say('Tout trouvé ! Bravo !');Game.curResolve=null;resolve({first:errors===0});}
  });
 });
}

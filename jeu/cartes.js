'use strict';
const CARD_RARITIES={c:{label:'Commune',symbol:'●'},r:{label:'Rare',symbol:'◆'},u:{label:'Ultra rare',symbol:'✦'},g:{label:'Or',symbol:'✺'}};
const CARD_MOVES={feu:['Braise câline','Soleil de poche'],eau:['Bulle douce','Vague rigolote'],plante:['Feuille danseuse','Jardin magique'],eclair:['Petit éclair','Étoile électrique'],ciel:['Souffle léger','Nuage farceur'],roche:['Galet bondissant','Montagne tendre'],glace:['Flocon câlin','Cristal dansant'],etoile:['Poussière de lune','Rêve étoilé']};
function migrateCardEditions(){
 const migrating=!S.cardEditions||S.cardEditionsVersion!==1;
 if(migrating){S.cardEditions={};S.cardEditionsVersion=1;}
 for(const [id,count]of Object.entries(S.cards||{})){
  const editions=S.cardEditions[id]||(S.cardEditions[id]={});const total=Object.values(editions).reduce((a,b)=>a+(+b||0),0),delta=(+count||0)-total;
  if(delta>0){const rar=migrating&&cardById(id)?.rar==='o'?'u':'c';editions[rar]=(editions[rar]||0)+delta;}
 }
}
function addCardEdition(id,edition){
 if(!S.cardEditions){S.cardEditions={};S.cardEditionsVersion=1;}const e=S.cardEditions[id]||(S.cardEditions[id]={});e[edition]=(e[edition]||0)+1;
}
function cardEdition(c){return c.gold?'g':c.edition||'c';}
cardHTML=function(cd,o={}){
 const edition=o.gold||cd.gold?'g':cardEdition(cd),rare=CARD_RARITIES[edition],el=EL[cd.el],moves=CARD_MOVES[cd.el],index=CARDS.findIndex(c=>c.id===cd.id),tier=cd.sp.tier||1;
 const hp=40+tier*20+(index%3)*10,damage=10+tier*10;
 const glitterCount=edition==='g'?(o.anim?24:6):0;
 return `<div class="card tcg rarity-${edition}${edition==='g'?' goldfoil':''}${o.up?' up':''}" data-id="${cd.id}" data-edition="${edition}" ${edition==='g'?'data-gold="1"':''} aria-label="${cd.name}, ${rare.label}">
  <div class="inner"><div class="face back tcg-back"><div class="back-orbit"></div><span>✦</span><b>COMPAGNONS</b></div>
  <div class="face front tcg-front">
   <div class="tcg-paper"></div><div class="tcg-landscape" style="background-image:url('img/bg/${cd.el}.webp')"><div class="tcg-ground"></div><img class="tcg-creature" src="${creatureImgURL(cd.sp)}" alt="${cd.name}" ${o.anim?'':'loading="lazy"'} decoding="async"></div>
   <header class="tcg-header"><b>${cd.name}</b><span><small>PV</small> ${hp}</span><i>${el.ic}</i></header>
   <div class="tcg-caption">Compagnon de ${el.nom} · Forme ${tier}</div>
   <div class="tcg-moves">${moves.map((name,i)=>`<div class="tcg-move"><span class="tcg-energy">${el.ic}${i?'✧':''}</span><b>${name}</b><strong>${damage+i*20}</strong></div>`).join('')}<div class="tcg-flavor">${edition==='g'?'Un trésor qui scintille !':'Une aventure, un nouvel ami.'}</div></div>
   <footer class="tcg-footer"><span>Petits Compagnons · ${String(index+1).padStart(2,'0')}/43</span><b>${rare.symbol} ${rare.label}</b></footer>
   ${edition==='u'?'<div class="tcg-rainbow"></div><div class="tcg-shine"></div>':''}
   ${edition==='g'?`<div class="tcg-gold-tone"></div><div class="tcg-metal"></div><div class="tcg-glitter">${Array.from({length:glitterCount},(_,i)=>`<i style="left:${7+(i*37)%87}%;top:${4+(i*29)%91}%;--delay:${-(i%8)*.31}s;--size:${i%4===0?5:2}px"></i>`).join('')}</div>`:''}
   <div class="glare"></div>
  </div></div>${o.count>1?`<div class="count">×${o.count}</div>`:''}${o.gbadge?'<div class="gbadge">✺</div>':''}</div>`;
};
drawCard=function(){
 migrateCardEditions();const r=Math.random(),edition=r<.025?'u':r<.22?'r':'c';
 const weights=CARDS.map(c=>S.cardEditions[c.id]?.[edition]?1:3);let t=Math.random()*weights.reduce((a,b)=>a+b,0),chosen=CARDS[0];
 for(let i=0;i<CARDS.length;i++){t-=weights[i];if(t<=0){chosen=CARDS[i];break;}}
 return {...chosen,edition};
};
screenCards=function(){
 migrateCardEditions();const s=$('#s-cards');show('s-cards');const owned=CARDS.filter(c=>S.cards[c.id]).length,golds=CARDS.filter(c=>(S.gold||{})[c.id]);
 const renderEdition=(edition)=>CARDS.flatMap(c=>{const n=S.cardEditions[c.id]?.[edition]||0;return n?[cardHTML({...c,edition},{up:true,count:n})]:[];}).join('');
 s.innerHTML=`<div class="topbar"><button class="big round" id="bHome4" aria-label="Accueil">${IC.home}</button><div class="mid" style="font-weight:bold">Mes cartes · ${owned}/43</div>${musicBtn()}</div><div class="scroll">${['c','r','u'].map(e=>`<h2 class="tcg-section">${CARD_RARITIES[e].symbol} ${CARD_RARITIES[e].label}${e==='c'?'s':'s'}</h2><div class="cardgrid">${renderEdition(e)||'<p class="empty-msg">Joue pour en découvrir !</p>'}</div>`).join('')}<h2 class="tcg-section">✺ Cartes en or</h2><div class="cardgrid" id="goldgrid">${golds.map(c=>cardHTML(goldOf(c),{up:true,count:S.gold[c.id]})).join('')||'<p class="empty-msg">Un trésor peut se cacher dans ton prochain paquet.</p>'}</div><h2 class="tcg-section">À découvrir</h2><div class="cardgrid">${CARDS.filter(c=>!S.cards[c.id]&&!S.gold?.[c.id]).map(()=>'<div class="slot" aria-label="Créature à découvrir">❔</div>').join('')}</div></div>`;
 bindMusic(s);$('#bHome4').onclick=()=>screenHome(false);
 $$('.card',s).forEach(el=>el.onclick=()=>zoomCard({...cardById(el.dataset.id),edition:el.dataset.edition,gold:el.dataset.edition==='g'}));
 say('Voici tes cartes. Touche une carte pour la voir en grand et la faire briller !');
};
let closeCardZoom=null;
zoomCard=function(c){
 if(closeCardZoom)closeCardZoom();const z=$('#zoom');z.hidden=false;
 z.innerHTML=`${cardHTML(c,{anim:true,up:true})}<div class="tcg-zoom-actions"><button class="path-btn" id="zTilt" hidden>✨ Incliner pour briller</button><button class="path-btn" id="zClose" aria-label="Fermer">✓ Fermer</button></div>`;
 const el=$('.card',z);el.classList.add('tilting');let raf=0,latest=null;
 const apply=(x,y)=>{el.classList.add('interacting');latest=[x,y];if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!latest||z.hidden)return;const[a,b]=latest;el.style.setProperty('--ry',((a-.5)*24)+'deg');el.style.setProperty('--rx',((.5-b)*20)+'deg');el.style.setProperty('--gx',(a*100)+'%');el.style.setProperty('--gy',(b*100)+'%');el.style.setProperty('--foil-x',(a*100)+'%');});};
 const pointer=e=>{const r=el.getBoundingClientRect();apply(clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1));};
 el.onpointermove=pointer;el.onpointerdown=e=>{pointer(e);el.setPointerCapture(e.pointerId);};el.onpointerup=()=>{apply(.5,.5);setTimeout(()=>el.classList.remove('interacting'),1200);};el.onpointerleave=()=>el.classList.remove('interacting');
 const orientation=e=>{if(e.gamma!=null&&e.beta!=null)apply(clamp(.5+e.gamma/70,0,1),clamp(.5+(e.beta-40)/90,0,1));};
 const attach=()=>window.addEventListener('deviceorientation',orientation,{passive:true});
 if(typeof DeviceOrientationEvent!=='undefined'){
  if(typeof DeviceOrientationEvent.requestPermission==='function'){$('#zTilt').hidden=false;$('#zTilt').onclick=async()=>{try{if(await DeviceOrientationEvent.requestPermission()==='granted')attach();}catch(e){/* drag and automatic sweep remain available */}};}else attach();
 }
 const key=e=>{if(e.key==='Escape')closeCardZoom?.();};window.addEventListener('keydown',key);
 closeCardZoom=()=>{window.removeEventListener('deviceorientation',orientation);window.removeEventListener('keydown',key);if(raf)cancelAnimationFrame(raf);z.hidden=true;z.innerHTML='';closeCardZoom=null;};
 $('#zClose').onclick=()=>closeCardZoom?.();z.onclick=e=>{if(e.target===z)closeCardZoom?.();};
 Snd.sparkle();say(`${c.name}. Carte ${CARD_RARITIES[cardEdition(c)].label}. Fais glisser ton doigt pour la faire briller.`);
};

const {chromium}=require('/workspace/pokes-test/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const results=[];
 for(const [w,h]of [[390,844],[360,640]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend?.(),1);}}});});
  await p.goto(process.env.BASE_URL||'http://localhost:8765');await p.waitForSelector('#bStart');await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  const original=await p.evaluate(()=>{const d=defaultState();delete d.path;d.companion=COMPANIONS[0].id;d.xp=50;d.packs=4;d.cards={[CARDS.find(c=>c.rar==='r').id]:2,[CARDS.find(c=>c.rar==='o').id]:1};d.gold={[CARDS[0].id]:3};S=d;save();return {cards:S.cards,gold:S.gold};});
  await p.reload();await p.waitForSelector('#bStart');await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  assert(await p.evaluate(()=>Object.entries(S.cards).every(([id,n])=>S.cardEditions[id][cardById(id).rar==='o'?'u':'c']===n)));
  assert.deepEqual(await p.evaluate(()=>S.gold),original.gold);
  await p.click('#bStart');await p.click('#bPlay');
  async function lesson(symbol){await p.waitForFunction(s=>document.querySelector('.lesson-symbol')?.textContent===s,String(symbol));await p.click('#lessonNext');await p.click('#lessonNext');assert.equal(await p.locator('canvas#lessonTrace').count(),0);await p.locator('.quiz-choice[data-ok="true"]').click();await p.click('#lessonNext');}
  await lesson('A');await lesson(1);
  // Start a fresh real eight-question session with no prefilled mastery history.
  await p.evaluate(()=>{quitSession(true);S.run=null;EXOS.forEach(e=>S.settings.exos[e.id]=['lettres','chiffres','formes','couleurs'].includes(e.id));startSession();});
  let previous='';
  for(let i=0;i<8;i++){
   await p.waitForFunction(k=>window.__q?.key!==k&&document.querySelector('#stage .choice:not(.right):not(.off):not(:disabled)'),previous);
   const q=await p.evaluate(()=>({key:__q.key,correct:__q.choices.map((c,i)=>c.ok?i:-1).filter(i=>i>=0),multi:__q.special==='recognitionMulti'}));previous=q.key;
   for(const idx of q.multi?q.correct:[q.correct[0]])await p.locator(`#stage .choice[data-i="${idx}"]`).click();
   await p.waitForFunction(i=>S.run?.i===i+1||S.path.level===2,i);
  }
  // Reload at the earliest persisted advancement, before the end-of-battle animation finishes.
  assert.equal(await p.evaluate(()=>S.path.level),2);await p.reload();await p.waitForSelector('#bStart');assert.equal(await p.evaluate(()=>S.path.level),2);await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});await p.click('#bStart');await p.waitForFunction(()=>document.querySelector('.lesson-symbol')?.textContent==='O');
  await p.evaluate(()=>{showPath();Voice.stop();});await p.waitForTimeout(800);await p.screenshot({path:w===390?'shots/parcours-niveau2.png':`shots/parcours-niveau2-${w}.png`});
  // Each format is playable at stages 1 and 3; synthetic target choice is not pre-solved.
  for(const level of [1,3])for(const kind of ['letter','number'])for(const format of (kind==='letter'?['find','bubbles','yesno','hidden','listen']:['quantity','match','yesno','stars','listen'])){
   await p.evaluate(({level,kind,format})=>{S.path=freshPath(level);for(let i=1;i<=level;i++){S.path.lessons[i+'letter']=true;S.path.lessons[i+'number']=true;}show('s-game');$('#s-game').innerHTML='<div class="topbar" style="height:65px">Reconnaissance</div><div class="stage" id="stage"></div>';const q=recognitionQuestion(kind,format);window.testSolved=false;const fn=q.special==='recognitionMulti'?runRecognitionMulti:runChoice;fn(q,$('#stage')).then(()=>window.testSolved=true);},{level,kind,format});
   assert(await p.evaluate(()=>[...document.querySelectorAll('#stage .choices .reco-symbol')].every(el=>parseFloat(getComputedStyle(el).fontSize)>=50)),'All distractors must be large enough');
   const q=await p.evaluate(()=>({key:__q.key,format:__q.format,target:__q.pathTarget,choices:__q.choices.map((c,i)=>c.ok?i:-1).filter(i=>i>=0),multi:__q.special==='recognitionMulti'}));
   assert(q.target===(kind==='letter'?(level===1?'A':'I'):level));
   if(w===390&&level===1&&((kind==='letter'&&['bubbles','hidden','yesno'].includes(format))||(kind==='number'&&format==='match'))){await p.evaluate(()=>{Confetti.parts=[];});await p.waitForTimeout(100);await p.screenshot({path:`shots/exo2-${kind}-${format}.png`});}
   for(const i of q.multi?q.choices:[q.choices[0]])await p.locator(`#stage .choice[data-i="${i}"]`).click();await p.waitForFunction(()=>window.testSolved);
  }
  // No recognition format repeats immediately and all numeral glyphs are taught.
  assert(await p.evaluate(()=>{for(const level of[1,3]){S.path=freshPath(level);S.path.lessons[level+'letter']=true;let prev='';for(let i=0;i<150;i++){const q=pathQuestion(i%2?'chiffres':'lettres');if(prev===q.format)return false;prev=q.format;const d=document.createElement('div');d.innerHTML=q.choices.map(c=>c.html).join('');for(const g of d.querySelectorAll('.reco-symbol')){if(/^\d+$/.test(g.textContent)&&+g.textContent>level)return false;}}}return true;}));
  for(const [edition,name]of [['c','commune'],['r','rare'],['u','ultra'],['g','or']]){
   await p.evaluate(e=>{zoomCard({...CARDS[0],edition:e,gold:e==='g'});},edition);await p.waitForSelector('.tcg-creature');await p.waitForFunction(()=>[...document.querySelectorAll('#zoom img')].every(i=>i.complete&&i.naturalWidth>0));
   assert.equal(await p.locator('.tcg-move').count(),2);await p.evaluate(()=>{Confetti.parts=[];Voice.stop();});await p.waitForTimeout(800);await p.screenshot({path:w===390?`shots/carte-${name}.png`:`shots/carte-${name}-${w}.png`});
   const r=await p.locator('#zoom .card').boundingBox();await p.mouse.move(r.x+r.width*.2,r.y+r.height*.3);await p.mouse.down();await p.mouse.move(r.x+r.width*.8,r.y+r.height*.6);await p.mouse.up();await p.click('#zClose');
  }
  // Real pack opening and reveal handlers for all four rarities.
  await p.evaluate(()=>{window.realRoll=rollPack;S.packs=2;rollPack=()=>['c','r','u'].map(e=>({...CARDS[0],edition:e}));screenPack();});await p.locator('#pack').click({force:true});await p.waitForSelector('.packcards .card');
  for(let i=0;i<3;i++){await p.locator('.packcards .card').nth(i).click();await p.waitForFunction(i=>document.querySelectorAll('.packcards .card')[i]?.classList.contains('up'),i);}
  assert.equal(await p.locator('.packcards .card.up').count(),3);await p.waitForSelector('#pOk');
  await p.evaluate(()=>{rollPack=()=>[{...CARDS[0],edition:'g',gold:true},{...CARDS[1],edition:'c'},{...CARDS[2],edition:'c'}];screenPack();});await p.locator('#pack').click({force:true});await p.waitForSelector('.packcards .card');await p.locator('.packcards .card').first().click();await p.waitForSelector('.packcards .card.gold-glow',{timeout:12000});await p.evaluate(()=>{rollPack=window.realRoll;});
  // Distribution and transfer, without granting or mutating user inventory.
  const rates=await p.evaluate(()=>{const rates={c:0,r:0,u:0};for(let i=0;i<10000;i++)rates[drawCard().edition]++;return rates;});assert(rates.c>7000&&rates.r>1500&&rates.u>150);
  assert(await p.evaluate(()=>{const originalRandom=Math.random;try{Math.random=()=>.99;S.packs=7;S.goldPity=0;const results=Array.from({length:7},()=>rollPack().some(c=>c.gold));return results.slice(0,6).every(x=>!x)&&results[6]&&S.goldPity===0&&Object.entries(S.cards).every(([id,n])=>Object.values(S.cardEditions[id]||{}).reduce((a,b)=>a+b,0)===n);}finally{Math.random=originalRandom;}}));
  assert(await p.evaluate(async()=>{const d=await importCode(await exportCode());return d.cardEditionsVersion===1&&Object.values(d.gold).reduce((a,b)=>a+b,0)>=3;}));
  assert.equal(errors.length,0,errors.join('\n'));results.push({viewport:`${w}x${h}`,realReloadPair2:true,allFormatsPlayableAt1And3:true,allRaritiesRenderAndReveal:true,legacyMigration:true,errors,rates});await ctx.close();
 }
 console.log(JSON.stringify(results,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

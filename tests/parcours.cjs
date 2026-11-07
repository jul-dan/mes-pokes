const {chromium}=require('/workspace/pokes-test/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const reports=[];
 for(const [w,h] of [[390,844],[360,640]]){
  const context=await browser.newContext({viewport:{width:w,height:h}});const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  // Speech API events are mocked so tests finish without a system audio device.
  await page.addInitScript(()=>{window.spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(u){window.spoken.push({text:u.text,lang:u.lang});setTimeout(()=>u.onend&&u.onend(),5);}}});});
  await page.goto('http://localhost:8765');await page.waitForSelector('#bStart');
  const legacy=await page.evaluate(()=>{const d=defaultState();delete d.path;d.companion=COMPANIONS[0].id;d.cards={old:3};d.gold={old:1};d.xp=55;d.packs=2;d.sessions=4;d.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(d));S=d;return d;});
  await page.reload();await page.waitForSelector('#bStart');await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});await page.click('#bStart');
  await page.screenshot({path:`shots/parcours-accueil-${w}.png`});
  assert.deepEqual(await page.evaluate(()=>[S.xp,S.packs,S.gold.old,S.cards.old,learningPath().level]),[55,2,1,3,1]);
  await page.click('#bPath');await page.waitForTimeout(1000);await page.screenshot({path:`shots/parcours-carte-${w}.png`});await page.click('#pathPlay');
  async function lesson(symbol){
   await page.waitForSelector('.lesson-symbol');await page.waitForFunction(v=>document.querySelector('.lesson-symbol')?.textContent===v,String(symbol));
   await page.waitForFunction(()=>!document.querySelector('#lessonNext').disabled);
   await page.waitForTimeout(800);await page.screenshot({path:`shots/lecon-${symbol}-decouverte-${w}.png`});
   await page.click('#lessonNext');await page.screenshot({path:`shots/lecon-${symbol}-mains-${w}.png`});await page.click('#lessonNext');
   assert(await page.locator('#lessonNext').isDisabled());
   const box=await page.locator('#lessonTrace').boundingBox(),segs=await page.evaluate(s=>guideFor(s),String(symbol));
   for(const seg of segs){await page.mouse.move(box.x+seg[0][0]*box.width/200,box.y+seg[0][1]*box.height/200);await page.mouse.down();for(const [x,y]of seg.slice(1))await page.mouse.move(box.x+x*box.width/200,box.y+y*box.height/200,{steps:12});await page.mouse.up();}
   assert(!(await page.locator('#lessonNext').isDisabled()));await page.screenshot({path:`shots/lecon-${symbol}-trace-${w}.png`});
   await page.click('#lessonNext');await page.locator('.quiz-choice[data-ok="false"]').click();assert(await page.locator('#lessonNext').isDisabled());await page.locator('.quiz-choice[data-ok="true"]').click();await page.screenshot({path:`shots/lecon-${symbol}-quiz-${w}.png`});await page.click('#lessonNext');
  }
  await lesson('A');await lesson(1);await page.waitForSelector('#stage .choice');
  assert(await page.evaluate(()=>pathReady()));
  // Exhaustive generation at all levels: every symbol choice belongs to the taught set.
  const sampled=await page.evaluate(()=>{
   const saved=structuredClone(S.path);let count=0;
   for(let n=1;n<=10;n++){S.path=freshPath(n);for(const t of ['lettres','minmaj','debut','chiffres','compter','compter10','quantite','plusun','subitizing','suitenum'])for(let j=0;j<100;j++){
    const q=makeQuestion(t),div=document.createElement('div');div.innerHTML=q.choices.map(c=>c.html).join('');
    for(const g of div.querySelectorAll('.glyph')){const value=g.textContent;if(q.pathKind==='letter'&&!pathItems('letter').includes(value.toUpperCase()))throw Error('Unknown letter '+value);if(q.pathKind==='number'&&!pathItems('number').includes(+value))throw Error('Unknown number '+value);}
    if(!pathItems(q.pathKind).includes(q.pathTarget))throw Error('Unknown target');count++;
   }}S.path=saved;return count;
  });assert.equal(sampled,10000);
  await page.evaluate(()=>{quitSession(true);S.path.letter=Array(7).fill(true);S.path.number=Array(7).fill(true);S.settings.len=5;EXOS.forEach(e=>S.settings.exos[e.id]=['lettres','chiffres'].includes(e.id));Math.random=()=>.1;S.run=null;startSession();});
  for(let i=0;i<5;i++){
   await page.waitForFunction(i=>S.run?.i===i&&window.__q&&document.querySelector('#stage .choice:not(.off):not(.right)'),i);
   const type=await page.evaluate(()=>window.__q.type);
   if(await page.locator('#stage .choice').count()){
    const right=await page.evaluate(()=>window.__q.choices.findIndex(c=>c.ok));await page.locator(`#stage .choice[data-i="${right}"]`).click();
   }
   await page.waitForFunction(i=>S.run?.i===i+1||!S.run,i,{timeout:30000});
  }
  await page.waitForSelector('#pathContinue',{timeout:30000});assert.equal(await page.evaluate(()=>learningPath().level),2);await page.screenshot({path:`shots/parcours-bravo-${w}.png`});await page.click('#pathContinue');await page.waitForFunction(()=>document.querySelector('.lesson-symbol')?.textContent==='O');await page.screenshot({path:`shots/lecon-O-niveau2-${w}.png`});
  await page.click('#lessonHome');await page.evaluate(()=>openParent());await page.screenshot({path:`shots/parcours-parent-${w}.png`});
  // Transfer includes path and gold; reset controls never clear rewards.
  assert(await page.evaluate(async()=>{const d=await importCode(await exportCode());return d.path.level===2&&d.gold.old===1&&d.cards.old===3;}));
  await page.selectOption('#pathJump','3');await page.click('#pathJumpGo');assert.deepEqual(await page.evaluate(()=>[S.path.level,S.path.done.length,S.gold.old]),[3,2,1]);await page.click('#pathSkip');assert(await page.evaluate(()=>pathReady()));
  page.once('dialog',d=>d.accept());await page.click('#pathReset');assert.deepEqual(await page.evaluate(()=>[S.path.level,S.gold.old,S.cards.old]),[1,1,3]);
  assert.equal(errors.length,0,errors.join('\n'));assert(await page.evaluate(()=>window.spoken.every(s=>s.lang==='fr-FR')));
  reports.push({viewport:`${w}x${h}`,generatedQuestions:sampled,errors,legacySave:true,lessonsAndTracing:true,level2:true,transfer:true,parentControls:true});await context.close();
 }
 console.log(JSON.stringify(reports,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

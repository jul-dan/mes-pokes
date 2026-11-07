const {chromium}=require('/workspace/pokes-test/node_modules/playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const fixture=path.join(__dirname,'../jeu/.test-old-worker.js');
(async()=>{let b;
 try{
 fs.writeFileSync(fixture,`self.addEventListener('install',e=>e.waitUntil(caches.open('ptits-compagnons-jeu-v5').then(async c=>{await c.put('./parcours.js',new Response('throw new Error("OLD CACHED LESSON LOADED")',{headers:{'content-type':'application/javascript'}}));await self.skipWaiting();})));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`);
 b=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:360,height:640}}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:8765');await p.waitForSelector('#bStart');await p.evaluate(async()=>{await navigator.serviceWorker.register('.test-old-worker.js');await navigator.serviceWorker.ready;});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await p.reload();await p.waitForSelector('#bStart');
 assert(await p.evaluate(()=>pathMastered([true,true,true])));assert.equal(errors.length,0,errors.join('\n'));
 await p.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');for(let i=0;i<150;i++){const entries=await(await caches.open('ptits-compagnons-jeu-v8')).keys();if(entries.length>40&&navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Cache installation timed out');});
 const assets=await p.evaluate(async()=>{const c=await caches.open('ptits-compagnons-jeu-v8');return(await c.keys()).map(r=>new URL(r.url).pathname+new URL(r.url).search);});
 for(const f of ['parcours.js','parcours.css','cartes.js','cartes.css','reconnaissance.js'])assert(assets.includes('/'+f+'?v=8'),f);
 for(const el of ['feu','eau','plante','eclair','ciel','roche','glace','etoile'])assert(assets.includes('/img/bg/'+el+'.webp'));
 await p.reload();await p.waitForSelector('#bStart');await ctx.setOffline(true);await p.reload();await p.waitForSelector('#bStart');assert(await p.evaluate(()=>pathMastered([true,true,true])));assert.equal(errors.length,0);console.log('PWA stale v5 cache → versioned v8 lessons, eight landscapes and offline reload: PASS');
 }finally{if(b)await b.close();fs.rmSync(fixture,{force:true});}
})().catch(e=>{console.error(e);process.exit(1)});

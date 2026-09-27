import assert from 'node:assert/strict';
import fs from 'node:fs';
import { openPage, scrollTo, pageChecks, apiLog } from './qa.mjs';
import { toLatin } from './src/base/alphabet.mjs';
const out='qa/functional';
fs.mkdirSync(out,{recursive:true});
const results=[];
const environment={browserChannel:process.env.MU_QA_BROWSER_CHANNEL||'chromium',videoPlayback:null};
const check=async(name,run)=>{try{await run();results.push({name,ok:true});console.log('PASS '+name);}catch(e){results.push({name,ok:false,error:e.message});console.error('FAIL '+name+': '+e.message);throw e;}};
const app=await openPage('dist/index.html','mobile',{reduced:true});
const {page,context,browser,logs}=app;
page.setDefaultTimeout(12000);
const requests=[];
page.on('request',q=>requests.push({url:q.url(),method:q.method(),type:q.resourceType()}));
const move=async id=>{await scrollTo(page,id);await page.waitForTimeout(150);};
const fill=async(name='Sinov Familiya',grade='9-sinf')=>{
 await move('ariza'); await page.locator('#az-name').fill(name);
 await page.locator('#az-region').selectOption({value:'Farg’ona viloyati'});
 await page.locator('.az-grade').filter({has:page.locator('input[value="'+grade+'"]')}).click();
 await page.locator('#az-phone').fill('+998 90 123 45 67');
};
try {
 await check('One H1, main landmark, source facts and initial video deferral',async()=>{
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('main').count(),1);
  assert.equal(await page.locator('video').getAttribute('src'),null);
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.endsWith('hero.mp4'))),false);
  assert.equal(await page.locator('.st-card').count(),6);
  assert.match(await page.locator('.st-word').innerText(),/Ilk minglik/);
  assert.match(await page.locator('.qh-text').innerText(),new RegExp(toLatin('asosiy qabul yakunlangan')));
  assert.match(await page.locator('.yn-plan').innerText(),/2027–2028/);
  assert.equal(await page.locator('.yt-cert img[src]').count(),0);
 });
 await check('Alphabet conversion leaves API, URLs and usernames intact',async()=>{
  assert.equal(toLatin('Shahnoza O’g’il G’ulom Chiroq ta’lim'), 'Şahnoza Öğil Ğulom Çiroq ta’lim');
  assert.equal(toLatin('https://mirzoulugbek.app/photos/shot.webp @Otabek_Mashrabov'),'https://mirzoulugbek.app/photos/shot.webp @Otabek_Mashrabov');
  const options=await page.locator('#az-region option').evaluateAll(es=>es.map(e=>[e.value,e.textContent]));
  assert.ok(options.some(([v,t])=>v==='Farg’ona viloyati'&&t==='Farğona viloyati'));
  assert.ok(options.some(([v,t])=>v==='Toshkent shahri'&&t==='Toşkent şahri'));
  assert.equal(options.length,15);
  assert.equal(await page.locator('input[name="grade"]').last().inputValue(),'Bitiruvchi (11-sinfni tugatgan)');
  assert.match(await page.title(),/Uçköprik/);
 });
 await check('Mobile menu: open, trapped focus, Escape, focus restoration',async()=>{
  const burger=page.locator('.nv-burger');
  await burger.click(); assert.equal(await page.locator('#nv-menu').evaluate(e=>e.open),true);
  for(let i=0;i<18;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('#nv-menu')!==null),true);}
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#nv-menu').evaluate(e=>e.open),false);
  assert.equal(await burger.evaluate(e=>e===document.activeElement),true);
  assert.equal(await burger.getAttribute('aria-expanded'),'false');
  await burger.click(); await page.locator('#nv-menu a[href="#yonalishlar"]').click();
  assert.equal(await page.locator('#nv-menu').evaluate(e=>e.open),false);
  assert.equal(await page.locator('#yonalishlar').evaluate(e=>e===document.activeElement),true);
 });
 await check('Direction filtering and future grades remain explicit',async()=>{
  await move('yonalishlar');
  await page.locator('[data-filter="science"]').click();
  assert.equal(await page.locator('.yn-card:visible').count(),1);
  assert.match(await page.locator('.yn-card:visible').innerText(),/Kimyo/);
  await page.locator('[data-filter="tech"]').click();assert.equal(await page.locator('.yn-card:visible').count(),2);
  await page.locator('[data-filter="all"]').click();assert.equal(await page.locator('.yn-card:visible').count(),6);
  assert.equal(await page.locator('.yn-plan').isVisible(),true);
 });
 await check('Certificates: real URLs, subject filter, keyboard and lightbox',async()=>{
  await move('yutuqlar'); await page.locator('.yt-cert.is-center img').waitFor();
  assert.equal(await page.locator('.yt-pause').getAttribute('aria-pressed'),'true');
  await page.locator('.yt-chip').filter({hasText:/^Fizika$/}).click();
  assert.match(await page.locator('.yt-count').innerText(),/\/ 3$/);
  const stage=page.locator('.yt-stage');await stage.focus();await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('.yt-count').innerText(),/^2 \/ 3$/);
  await page.locator('.yt-bar').focus();await page.keyboard.press('End');assert.match(await page.locator('.yt-count').innerText(),/^3 \/ 3$/);
  await page.locator('.yt-cert.is-center').click();
  assert.equal(await page.locator('.mu-viewer').evaluate(e=>e.open),true);
  assert.match(await page.locator('.mu-viewer__image').getAttribute('src'),/^https:\/\/storage.googleapis.com\//);
  await page.screenshot({path:out+'/mobile-certificate-dialog.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.yt-cert.is-center').evaluate(e=>e===document.activeElement),true);
 });
 await check('Gallery: next, previous and full image with Escape',async()=>{
  await move('hayot');const before=await page.locator('.hy-count b').innerText();
  await page.locator('.hy-next').click();await page.waitForTimeout(200);
  assert.notEqual(await page.locator('.hy-count b').innerText(),before);
  await page.locator('.hy-prev').click();await page.waitForTimeout(200);
  assert.equal(await page.locator('.hy-count b').innerText(),before);
  await page.locator('.hy-zoom').first().click();assert.equal(await page.locator('.mu-viewer').evaluate(e=>e.open),true);
  assert.match(await page.locator('.mu-viewer__image').getAttribute('src'),/grads-2324-a.webp$/);
  await page.keyboard.press('Escape');
 });
 await check('FAQ search: both alphabets, no-match and accordion',async()=>{
  await move('faq');await page.locator('#fq-search').fill('yotoqxona');
  assert.ok(await page.locator('.fq-item:visible').count()>0);
  await page.locator('.fq-item:visible .fq-q').first().click();
  assert.equal(await page.locator('.fq-item:visible .fq-q').first().getAttribute('aria-expanded'),'true');
  await page.locator('#fq-search').fill('qwertyasdf');assert.equal(await page.locator('.fq-item:visible').count(),0);
  assert.match(await page.locator('.fq-search-status').innerText(),/Mos javob/);
  await page.locator('#fq-search').fill('');assert.equal(await page.locator('.fq-item:visible').count(),15);
 });
 await check('Form validation sends no request',async()=>{
  await move('ariza');const before=apiLog.filter(x=>x[0]==='ariza').length;
  await page.locator('.az-submit').click();
  assert.equal(apiLog.filter(x=>x[0]==='ariza').length,before);
  assert.equal(await page.locator('#az-name').getAttribute('aria-invalid'),'true');
  assert.ok(await page.locator('.is-invalid').count()>=4);
 });
 await check('Form success preserves all five contract keys and +998 paste',async()=>{
  await fill('Sinov Shahnoza');
  assert.equal(await page.locator('#az-phone').inputValue(),'90 123 45 67');
  await page.locator('.az-submit').click();
  await page.waitForFunction(()=>document.querySelector('.az-status').classList.contains('is-ok'));
  const body=apiLog.filter(x=>x[0]==='ariza').at(-1)[1];
  assert.deepEqual(body,{fullName:'Sinov Shahnoza',region:'Farg’ona viloyati',grade:'9-sinf',phone:'+998901234567',website:''});
  assert.match(await page.locator('.az-status').innerText(),/Arizangiz qabul qilindi/);
  await page.screenshot({path:out+'/mobile-form-success.png'});
 });
 await check('60-second throttle survives reload and sends no second request',async()=>{
  await page.reload();await page.waitForFunction(()=>window.MU?.revealed);
  await fill();const before=apiLog.filter(x=>x[0]==='ariza').length;
  await page.locator('.az-submit').click();
  assert.equal(apiLog.filter(x=>x[0]==='ariza').length,before);
  assert.match(await page.locator('.az-status').innerText(),new RegExp(toLatin('bir daqiqadan')));
  await page.evaluate(()=>localStorage.removeItem('ariza_last_submit'));
 });
 await check('Grade notes and duplicate response',async()=>{
  await fill('Takror Sinov','10-sinf');assert.match(await page.locator('.az-grade-note').innerText(),/qisman/);
  await page.locator('.az-grade').filter({has:page.locator('input[value="11-sinf"]')}).click();assert.match(await page.locator('.az-grade-note').innerText(),/sertifikat/);
  await page.locator('.az-submit').click();
  await page.waitForFunction(()=>document.querySelector('.az-status').classList.contains('is-info'));
  assert.match(await page.locator('.az-status').innerText(),/14-avgust, 2026/);
 });
 await check('HTTP 429 is handled, retry remains available',async()=>{
  await page.evaluate(()=>localStorage.removeItem('ariza_last_submit'));
  await page.reload();await page.waitForFunction(()=>window.MU?.revealed);
  await fill('Kutish Sinov');await page.locator('.az-submit').click();
  await page.waitForFunction(()=>document.querySelector('.az-status').classList.contains('is-warn'));
  assert.equal(await page.locator('.az-submit').isEnabled(),true);
 });
 await check('Server error retains entered data',async()=>{
  await context.route('**/api/ariza',route=>route.fulfill({status:400,json:{ok:false,error:'invalid'}}));
  await fill('Sinov Familiya');await page.locator('.az-submit').click();
  await page.waitForFunction(()=>document.querySelector('.az-status').classList.contains('is-err'));
  assert.equal(await page.locator('#az-name').inputValue(),'Sinov Familiya');
  assert.equal(await page.locator('.az-submit').isEnabled(),true);
 });
 await check('Chat payload, history bound, session and focus trap',async()=>{
  let payload;
  await context.route('**/api/chat',route=>{payload=JSON.parse(route.request().postData());return route.fulfill({json:{reply:'Yo’nalishlar haqida ma’lumot. Qabul uchun qo’ng’iroq qiling.',deferred:false}});});
  await page.locator('.ch-launch').click();
  await page.locator('.ch-input').fill('Qabul haqida');await page.locator('.ch-send').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.ch-msg--bot')].some(e=>e.textContent.includes('Qabul uçun')));
  assert.equal(payload.message,'Qabul haqida');
  assert.ok(payload.sessionId.length>10);
  assert.ok(payload.history.length<=8);
  assert.equal(payload.sessionId,await page.evaluate(()=>localStorage.getItem('site_ai_session')));
  for(let i=0;i<5;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#ch-panel')),true);}
  await page.screenshot({path:out+'/mobile-chat.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.ch-panel').evaluate(e=>e.open),false);
 });
 await check('Visit is counted once per session; telephone click uses bodyless POST',async()=>{
  assert.equal(apiLog.filter(x=>x[0]==='visit'&&x[1]==='POST').length,1);
  assert.ok(apiLog.some(x=>x[0]==='visit'&&x[1]==='GET'));
  await page.evaluate(()=>{const a=document.querySelector('.hero-call a');a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();});
  await page.waitForTimeout(200);assert.ok(apiLog.some(x=>x[0]==='track-call'));
 });
 await check('News updates only from a newer snapshot and rejects unapproved image hosts',async()=>{
  await move('yangiliklar');
  assert.match(await page.locator('.ny-big__title a').getAttribute('href'),/484[6-8]/);
  await context.route('**/api/telegram-news',route=>route.fulfill({json:{ok:true,posts:[{id:'ulugbek_rm/9999',text:'Yangi xabar\nMaktab yangiliklari',photo:'https://evil-telesco.pe/fake.jpg',date:'2026-09-28T10:00:00Z',link:'https://t.me/ulugbek_rm/9999'}]}}));
  await page.reload();await page.waitForFunction(()=>window.MU?.revealed);await move('yangiliklar');
  await page.waitForFunction(()=>document.querySelector('.ny-big__title a').getAttribute('href').endsWith('/9999'));
  assert.equal(await page.locator('.ny-big__media img').count(),0);
  assert.match(await page.locator('.ny-date').first().innerText(),/28-sentabr, 2026/);
 });
 await check('390px layout, no runtime errors or live API requests',async()=>{
  const checks=await pageChecks(page);assert.equal(checks.overflowX,false);assert.deepEqual(checks.overflowOffenders,[]);
  assert.equal(logs.filter(x=>x.type==='pageerror').length,0);
  assert.equal(requests.filter(x=>x.url.includes('/api/')&&!x.url.startsWith('http://127.0.0.1:')).length,0);
  assert.equal(requests.some(x=>/evil-telesco/.test(x.url)),false);
 });
} catch(e) {
 await page.screenshot({path:out+'/failure.png'});
 process.exitCode=1;
} finally {
 fs.writeFileSync(out+'/report.json',JSON.stringify({results,logs,apiRequests:requests.filter(x=>x.url.includes('/api/')),note:'All API calls mocked. Expected HTTP 400/429 resource errors are recorded; pageerror must be zero.'},null,2));
 await browser.close();
}


if (!process.exitCode) {
 const d=await openPage('dist/index.html','desktop');
 const p=d.page;
 p.setDefaultTimeout(15000);
 try {
  await check('Desktop dropdown: keyboard access, Escape and collapse',async()=>{
   await p.locator('.nv-dd__btn').focus();await p.keyboard.press('ArrowDown');
   assert.equal(await p.locator('.nv-dd__btn').getAttribute('aria-expanded'),'true');
   assert.match(await p.evaluate(()=>document.activeElement.getAttribute('href')),/kimyo-biologiya/);
   await p.keyboard.press('Escape');assert.equal(await p.locator('.nv-dd__btn').getAttribute('aria-expanded'),'false');
  });
  await check('Video: opt-in playback or explicit unsupported-codec fallback; Escape stops it',async()=>{
   const supported = await p.evaluate(()=>!!document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"'));
   await p.locator('.hero-watch').click();
   if (supported) {
    await p.waitForFunction(()=>document.querySelector('video').currentTime>=3,{},{timeout:20000});
    environment.videoPlayback='verified: currentTime >= 3 seconds';
   }
   else {
    await p.locator('.hero-video-error').waitFor({state:'visible'});
    assert.match(await p.locator('.hero-video-error a').getAttribute('href'),/hero.mp4$/);
    environment.videoPlayback='codec unavailable: readable fallback verified';
   }
   assert.equal(await p.locator('video').evaluate(e=>e.controls),true);
   assert.equal(await p.locator('#hero-film').evaluate(e=>e.open),true);
   await p.screenshot({path:out+'/desktop-video.png'});
   await p.keyboard.press('Escape');
   await p.waitForFunction(()=>document.querySelector('video').paused);
   assert.equal(await p.locator('.hero-watch').evaluate(e=>e===document.activeElement),true);
  });
  await check('Certificates rotate normally and stop on explicit pause',async()=>{
   await scrollTo(p,'yutuqlar');
   await p.locator('.nv-logo').focus();
   await p.mouse.move(10,100);
   const before=await p.locator('.yt-count').innerText();
   await p.waitForFunction(before=>document.querySelector('.yt-count').textContent!==before,before,{timeout:8000});
   await p.locator('.yt-pause').click();
   await p.locator('.nv-logo').focus();
   const frozen=await p.locator('.yt-count').innerText();
   await p.waitForTimeout(3400);
   assert.equal(await p.locator('.yt-count').innerText(),frozen);
  });
  await check('Responsive widths: 320, 390, 768, 1100, 1440; no document overflow',async()=>{
   for(const width of [320,390,768,1100,1440]) {
    await p.setViewportSize({width,height:900});
    await p.waitForTimeout(100);
    const c=await pageChecks(p);
    assert.equal(c.overflowX,false,'overflow at '+width);
   }
   assert.equal(d.logs.filter(x=>x.type==='pageerror').length,0);
  });
 } catch(e) {
  process.exitCode=1;await p.screenshot({path:out+'/desktop-failure.png'});
 } finally {
  fs.writeFileSync(out+'/report.json',JSON.stringify({environment,results,logs:[...logs,...d.logs],apiRequests:requests.filter(x=>x.url.includes('/api/')),note:'All APIs mocked. Expected HTTP 400/429 and deliberately cancelled video requests are recorded; runtime errors must be zero.'},null,2));
  await d.browser.close();
 }
}

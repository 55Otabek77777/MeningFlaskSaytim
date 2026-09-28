import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage,scrollTo,apiLog} from './qa.mjs';
const results=[], payloads=[], statuses=[];
const pass=name=>{results.push({name,ok:true});console.log('PASS '+name)};
let mode='success';
const r=await openPage('index.html','mobile',{reduced:true,ariza:async(route,body)=>{
 payloads.push(body);
 const status=mode==='invalid'?400:mode==='rate'?429:200;
 const json=mode==='duplicate'?{ok:true,duplicate:true,createdAt:'2026-08-14T09:12:00.000Z'}:mode==='invalid'?{ok:false,error:'invalid'}:mode==='rate'?{ok:false,error:'rate_limited'}:{ok:true};
 statuses.push(status);return route.fulfill({status,json});
}});
const {page,context,browser,logs}=r;
try{
 await scrollTo(page,'ariza');await page.locator('.az-submit').click();
 assert.equal(payloads.length,0);assert.equal(await page.locator('#az-name').getAttribute('aria-invalid'),'true');pass('Empty form stays local and identifies missing fields');
 const fill=async()=>{
  await page.locator('#az-name').fill('QA Sinov');
  await page.locator('#az-region').selectOption('Farg’ona viloyati');
  await page.locator('label.az-grade').filter({has:page.locator('input[value="9-sinf"]')}).click();
  await page.locator('#az-phone').fill('+998900000000');
 };
 for(mode of ['success','duplicate','invalid','rate']){
  await page.evaluate(()=>localStorage.removeItem('ariza_last_submit'));
  if(mode!=='success'){await page.reload();await page.waitForFunction(()=>window.MU?.revealed)}
  await fill();await page.locator('.az-submit').click();
  const cls={success:'is-ok',duplicate:'is-info',invalid:'is-err',rate:'is-warn'}[mode];
  await page.waitForSelector('.az-status.'+cls);
  assert.deepEqual(payloads.at(-1),{fullName:'QA Sinov',region:'Farg’ona viloyati',grade:'9-sinf',phone:'+998900000000',website:''});
  if(mode==='duplicate')assert.match(await page.locator('.az-status').textContent(),/2026-yil 14-avgust, soat 14:12da/);
  pass('Mock ariza '+mode+': response shown, original API payload preserved');
 }
 await page.evaluate(()=>localStorage.setItem('ariza_last_submit',Date.now()));
 const before=payloads.length;await page.locator('.az-submit').click();await page.waitForTimeout(250);
 assert.equal(payloads.length,before);pass('Local 60-second throttle prevents another request');
 let chatRequest;
 await context.route('**/api/chat',route=>{
  chatRequest=route.request().postDataJSON();return route.fulfill({json:{reply:'Menejer bilan bog’lanishingiz mumkin: +998 97 417 37 77.',deferred:true}});
 });
 await page.locator('.ch-launch').click();await page.locator('.ch-input').fill('Shartlar qanday?');await page.locator('.ch-send').click();
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.ch-msg--bot')).some(e=>e.textContent.includes('Menejer bilan')));
 assert.equal(chatRequest.message,'Shartlar qanday?');assert.ok(chatRequest.sessionId);assert.ok(chatRequest.history.length<=8);
 assert.ok(chatRequest.history.every(h=>['user','assistant'].includes(h.role)&&typeof h.content==='string'));
 assert.equal(await page.locator('.ch-msg--me').last().textContent(),'Shartlar qanday?');
 pass('Chat contract and deferred response; user text remains raw');
 await page.locator('.ch-close').click();
 // Prevent only the telephone handoff, retaining the page call-tracking handler.
 await page.evaluate(()=>document.querySelector('.az-call a').addEventListener('click',e=>e.preventDefault()));
 await page.locator('.az-call a').first().click();await page.waitForTimeout(250);
 assert.ok(apiLog.some(v=>v[0]==='track-call'));assert.ok(apiLog.some(v=>v[0]==='visit'&&v[1]==='POST'));assert.ok(apiLog.some(v=>v[0]==='visit'&&v[1]==='GET'));
 pass('Visit POST/GET and call tracking use isolated mocks');
 assert.ok(await page.locator('.ny-big a[href*="484"]').count());
 assert.deepEqual(await page.locator('.ny-row__title').evaluateAll(es=>es.map(e=>MUAlifbo.toOld(e.textContent))),['Maktabdan xabar','Maktab ma’muriyatidan e’lon','O’quvchilarni kutib olish haqida','Video xabar']);
 pass('Stale news API does not replace the newer local snapshot');
 const unexpected=logs.filter(l=>!(l.type==='error'&&/status of (400|429)/.test(l.text)));
 assert.deepEqual(unexpected,[]);pass('No unexpected console or runtime errors');
 fs.mkdirSync('qa/api',{recursive:true});fs.writeFileSync('qa/api/report.json',JSON.stringify({results,statuses,expectedInjectedHttpErrors:logs,liveApiRequests:0},null,2));
}finally{await browser.close()}

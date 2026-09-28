import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage,scrollTo,pageChecks,shoot} from './qa.mjs';
const results=[];
const success=name=>{results.push({name,ok:true});console.log(name)};
for(const [vp,reduced] of [['desktop',false],['mobile',false],['mobile',true]]){
 const {page,browser,logs}=await openPage('index.html',vp,{reduced});
 try {
 await scrollTo(page,'yonalishlar');await page.waitForTimeout(1800);
 for(const [filter,count] of [['science',2],['tech',3],['languages',5],['all',7]]){
  await page.locator(`[data-filter="${filter}"]`).click();await page.waitForTimeout(800);
  assert.equal(await page.locator('.yn-card:not([hidden])').count(),count);
  assert.equal(await page.locator('.yn-card:not([hidden])').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='visible'&&+getComputedStyle(e).opacity>.99)),true);
 }
 await page.evaluate(()=>{for(const f of ['tech','languages','science','all'])document.querySelector(`[data-filter="${f}"]`).click()});
 await page.waitForTimeout(1000);
 assert.equal(await page.locator('.yn-card:not([hidden])').count(),7);
 assert.equal(await page.locator('.yn-card:not([hidden])').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='visible'&&+getComputedStyle(e).opacity>.99)),true);
 assert.equal((await pageChecks(page)).overflowX,false);assert.deepEqual(logs,[]);
 success('PASS '+vp+' reduced='+reduced+' filters, rapid changes, visibility, overflow, console');
 }finally{await browser.close()}
}
for(const [vp,reduced] of [['desktop',false],['mobile',false],['mobile',true]]){
 const {page,browser,logs}=await openPage('index.html',vp,{reduced});
 try{
 await page.waitForTimeout(1800);
 const y=await page.evaluate(()=>{const reel=document.querySelector('.hy-reel');const st=MU.ScrollTrigger.getAll().find(s=>s.trigger===reel);return st?st.start:reel.getBoundingClientRect().top+scrollY-130});
 await scrollTo(page,'y='+y);await page.waitForTimeout(1800);
 await shoot(page,`qa/b2/${vp}${reduced?'-reduced':''}-gallery.png`);
 assert.equal(await page.locator('.hy-count b').textContent(),'01');
 await page.locator('.hy-next').click();await page.waitForFunction(()=>document.querySelector('.hy-count b').textContent==='02');await page.waitForTimeout(1000);
 await page.locator('.hy-next').press('End');await page.waitForFunction(()=>document.querySelector('.hy-count b').textContent==='11');await page.waitForTimeout(1000);
 assert.equal(await page.locator('.hy-next').getAttribute('aria-disabled'),'true');
 await page.locator('.hy-prev').press('Home');await page.waitForFunction(()=>document.querySelector('.hy-count b').textContent==='01');await page.waitForTimeout(1000);
 await shoot(page,`qa/b2/${vp}${reduced?'-reduced':''}-gallery.png`);
 await page.locator('.hy-slide').first().press('Enter');await page.waitForSelector('dialog[open]');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
 assert.equal((await pageChecks(page)).overflowX,false);assert.deepEqual(logs,[]);
 success('PASS '+vp+' reduced='+reduced+' next/end/home/lightbox/console');
 }finally{await browser.close()}
}
for(const [vp,reduced] of [['desktop',false],['mobile',false],['mobile',true]]){
 const {page,browser,logs}=await openPage('index.html',vp,{reduced});
 try{
 await page.waitForTimeout(1500);await scrollTo(page,'dron@0.12');await page.waitForTimeout(1500);
 if(reduced){
  assert.equal(await page.locator('#dron').evaluate(e=>e.classList.contains('is-live')),false);
  assert.equal(await page.locator('.dr-vid[src]').count(),0);
  assert.equal(await page.locator('.dr-item').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='visible')),true);
 }else{
  for(const i of [4,0,2,1,3]){
   await page.locator('.dr-chapters button').nth(i).click();
   await page.waitForFunction(i=>document.querySelectorAll('.dr-chapters button')[i].getAttribute('aria-current')==='true',i);
   await page.waitForTimeout(1700);
   assert.equal(await page.locator('.dr-count b').textContent(),String(i+1).padStart(2,'0'));
   assert.equal(await page.locator('.dr-item').nth(i).evaluate(e=>+getComputedStyle(e).opacity>.99),true);
   if(vp==='desktop'&&[0,2,4].includes(i))await page.waitForFunction(i=>{const v=document.querySelectorAll('.dr-item')[i].querySelector('video');return v&&!v.paused&&v.currentTime>0},i);
  }
  if(vp==='mobile')assert.equal(await page.locator('.dr-vid[src]').count(),0);
  await page.locator('.dr-chapters button').nth(2).click();await page.waitForTimeout(2200);
  await shoot(page,`qa/b3/${vp}-selected.png`);
 }
 await scrollTo(page,'faq');await page.waitForTimeout(900);
 assert.equal(await page.locator('.dr-vid').evaluateAll(vs=>vs.every(v=>v.paused)),true);
 assert.equal((await pageChecks(page)).overflowX,false);assert.deepEqual(logs,[]);
 success('PASS '+vp+' reduced='+reduced+' five scenes, clips/static media, pause, console');
 }finally{await browser.close()}
}
fs.mkdirSync('qa/interactions',{recursive:true});fs.writeFileSync('qa/interactions/report.json',JSON.stringify({results},null,2));

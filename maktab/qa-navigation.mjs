import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage,scrollTo,pageChecks,shoot} from './qa.mjs';
const reduced=!process.argv.includes('--motion'),out=reduced?'qa/navigation':'qa/navigation-motion';
const r=await openPage('index.html','mobile',{reduced});const {page,browser,logs}=r;const results=[];
const pass=name=>{results.push({name,ok:true});console.log('PASS '+name)};
try{
 for(const mode of ['joriy','yangi']){
  await page.locator('.nv-burger').click();await page.waitForTimeout(1800);
  await page.locator(`#nv-menu [data-abc="${mode}"]`).click();
  await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>MUAlifbo.mode),mode);
  assert.equal((await pageChecks(page)).overflowX,false);
  await shoot(page,`${out}/menu-${mode}.png`);
  assert.equal(await page.locator('.nv-burger').evaluate(b=>{const r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),true);
  await page.locator('.nv-burger').click();await page.waitForFunction(()=>document.querySelector('#nv-menu').hidden);
  await page.locator('.nv-burger').click();await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('#nv-menu').hidden);
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('nv-burger')),true);
  pass('Mobile menu, visible close button, alphabet button, Escape and focus: '+mode);
 }
 await scrollTo(page,'faq');
 await page.locator('#fq-search').fill('yo’nalish');await page.waitForTimeout(220);
 const old=await page.locator('.fq-item:not([hidden])').count();assert.ok(old>0);
 await page.locator('#fq-search').fill('yönaliş');await page.waitForTimeout(220);
 assert.equal(await page.locator('.fq-item:not([hidden])').count(),old);
 await page.locator('#fq-search').fill('zzzz-no-result');await page.waitForTimeout(220);
 assert.equal(await page.locator('.fq-item:not([hidden])').count(),0);assert.match(await page.locator('.fq-search__status').textContent(),/97 417 37 77/);
 await page.locator('#fq-search').fill('');await page.waitForTimeout(220);
 await page.locator('.fq-q').nth(1).click();assert.equal(await page.locator('.fq-q').nth(1).getAttribute('aria-expanded'),'true');
 pass('FAQ searches both alphabets, empty state and accordion');
 assert.deepEqual(logs,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({results,logs,cancelledMedia:r.cancelledMedia},null,2));
}finally{await browser.close()}

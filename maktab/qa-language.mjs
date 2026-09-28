import assert from 'node:assert/strict';
import fs from 'node:fs';
import './src/base/alifbo.js';
import {openPage} from './qa.mjs';
const A=globalThis.MUAlifbo, results=[];
const check=async(name,test)=>{await test();results.push({name,ok:true});console.log('PASS '+name);};
await check('Mixed apostrophes normalize to U+2019 in both modes',()=>{
 for(const fn of [A.toNew,A.toOld])assert.equal(fn("taʼlim ma‘lumot san'at qatʻiy"),'ta’lim ma’lumot san’at qat’iy');
});
await check('Uzbek letters and uppercase words round-trip',()=>{
 const original='Shahnoza O’quvchi G’ulom Chiroq O’QUVCHI SHAHNOZA';
 assert.equal(A.toOld(A.toNew(original)),original);
});
await check('IELTS SAT Face ID Telegram START and public handles are unchanged',()=>{
 const raw='IELTS SAT CEFR Face ID Telegram START YouTube Instagram Google Maps @Otabek_Mashrabov #Shahnoza https://mirzoulugbek.app/photos/shot.webp test@school.uz';
 assert.equal(A.toNew(raw),raw);assert.equal(A.toOld(raw),raw);
});
await check('data-raw protects external button labels, including nested elements',()=>{
 const html='<span data-raw>Telefon <b>raqamimni</b> yuborish</span><p>O’quvchi</p>';
 assert.equal(A.html(html),'<span data-raw>Telefon <b>raqamimni</b> yuborish</span><p>Öquvçi</p>');
});
await check('Head stays in current alphabet; API option values remain original',()=>{
 const release=fs.readFileSync('index.html','utf8'), head=release.split('</head>')[0];
 assert.match(head,/<title>.*Uchko’prik, Farg’ona/);
 assert.doesNotMatch(head.split('<style>')[0],/[ÖöĞğŞşÇç]/);
 const schema=JSON.parse(release.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema.openingHoursSpecification[0].opens,'06:00');
 assert.deepEqual(schema.telephone,['+998974173777','+998945953777']);
 assert.match(release,/value="Farg’ona viloyati"/);
 assert.match(release,/value="Bitiruvchi \(11-sinfni tugatgan\)"/);
});
const app=await openPage('index.html','mobile',{reduced:true});
const {page,browser,logs,cancelledMedia}=app;
try {
 await check('Dynamic assistant text normalizes, user text and API values stay raw',async()=>{
  const r=await page.evaluate(async()=>{
   const normal=document.createElement('p'),raw=document.createElement('p');
   normal.textContent='taʼlim O’quvchi';raw.textContent='Shahnoza taʼlim';raw.dataset.raw='';document.body.append(normal,raw);
   await new Promise(requestAnimationFrame);
   const data=[normal.textContent,raw.textContent,document.querySelector('#az-region option[value="Farg’ona viloyati"]').value];normal.remove();raw.remove();return data;
  });
  assert.deepEqual(r,['ta’lim Öquvçi','Shahnoza taʼlim','Farg’ona viloyati']);
 });
 await check('Both alphabet modes preserve brand labels and bot buttons',async()=>{
  for(const mode of ['joriy','yangi','joriy','yangi']){
   await page.evaluate(m=>MUAlifbo.set(m),mode);
   assert.equal(await page.locator('.nz-steps [data-raw]').first().textContent(),'«START»');
   assert.equal(await page.locator('.nz-steps [data-raw]').last().textContent(),'«📱 Telefon raqamimni yuborish»');
   assert.match(await page.locator('.nz-eyebrow').textContent(),/Face ID/);
  }
 });
 await check('Current alphabet persists after reload without changing SEO',async()=>{
  await page.evaluate(()=>MUAlifbo.set('joriy'));await page.reload();
  await page.waitForFunction(()=>window.MU?.revealed);
  assert.equal(await page.evaluate(()=>MUAlifbo.mode),'joriy');
  assert.match(await page.locator('#nazorat .lead').first().innerText(),/Qo’ng’iroq/);
  assert.match(await page.title(),/Uchko’prik, Farg’ona/);
  assert.equal(logs.length,0);
 });
} finally {
 await browser.close();
 fs.mkdirSync('qa/language',{recursive:true});
 fs.writeFileSync('qa/language/report.json',JSON.stringify({results,logs,cancelledMedia},null,2));
}

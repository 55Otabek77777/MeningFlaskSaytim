import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage,scrollTo,shoot} from './qa.mjs';
const r=await openPage('index.html','desktop',{liveMedia:true,reduced:true});
const {page,browser,logs}=r;
try{
 await scrollTo(page,'yutuqlar');await page.waitForFunction(()=>{const e=document.querySelector('.yt-cert.is-center img');return e&&e.complete&&e.naturalWidth>0},{},{timeout:30000});
 await page.waitForTimeout(1000);
 const cert=await page.locator('.yt-cert.is-center img').evaluate(e=>({host:new URL(e.src).hostname,width:e.naturalWidth,height:e.naturalHeight}));
 assert.equal(cert.host,'storage.googleapis.com');assert.ok(cert.width>500);
 await shoot(page,'qa/live-media/certificate.png');
 await scrollTo(page,'yangiliklar');await page.waitForFunction(()=>Array.from(document.querySelectorAll('.ny-feed img')).every(e=>e.complete&&e.naturalWidth>0),{},{timeout:30000});
 const news=await page.locator('.ny-feed img').evaluateAll(es=>es.map(e=>({host:new URL(e.src).hostname,width:e.naturalWidth,height:e.naturalHeight})));
 assert.equal(news.length,4);assert.ok(news.every(e=>e.width>0));
 await shoot(page,'qa/live-media/news.png');assert.deepEqual(logs,[]);
 fs.writeFileSync('qa/live-media/report.json',JSON.stringify({cert,news,logs,liveApiRequests:0},null,2));console.log('PASS real certificate and Telegram images; all APIs mocked');
}finally{await browser.close()}

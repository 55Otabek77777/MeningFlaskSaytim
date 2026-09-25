#!/usr/bin/env node
/* Headless QA: screenshots + console errors + overflow check.
   node qa.mjs --file dist/preview-hero.html --out qa/hero --shots "hero@0,hero@0.5,ticker" [--vp desktop,mobile]
               [--frames 0,600,1600] [--wait 1200] [--full] [--reduced]
   Shot syntax:  <part>@<p>  -> scroll so the part (or its pin-spacer) top is at viewport top, plus p * (height - vh)
                 y=<px>      -> absolute scroll position
                 <part>      -> same as <part>@0
   --full       -> additionally screenshot the whole page every ~0.9 viewport (max 90 shots)
   --frames     -> for every shot, capture several frames at these ms delays after scrolling (default: just --wait)
   Import helpers from another script:  import { openPage, scrollTo, shoot, VIEWPORTS } from './qa.mjs'  */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

export const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  laptop: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
  tablet: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
};

export async function openPage(file, vp = 'desktop', { reduced = false, waitReveal = true } = {}) {
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--autoplay-policy=no-user-gesture-required']
  });
  const context = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const logs = [];
  page.on('console', m => {
    const t = m.type();
    if (t === 'error' || t === 'warning') {
      const text = m.text();
      if (/GPU stall|swiftshader|WebGL: INVALID_OPERATION.*readPixels|Automatic fallback to software WebGL/i.test(text)) return;
      logs.push({ type: t, text: text.slice(0, 600) });
    }
  });
  page.on('pageerror', e => logs.push({ type: 'pageerror', text: (e.stack || e.message).split('\n').slice(0, 5).join('\n') }));
  page.on('requestfailed', q => { if (!q.url().startsWith('data:')) logs.push({ type: 'requestfailed', text: q.url().slice(0, 140) + ' ' + (q.failure() || {}).errorText }); });
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'load', timeout: 60000 });
  if (waitReveal) {
    await page.waitForFunction(() => window.MU && window.MU.revealed, null, { timeout: 25000 })
      .catch(() => logs.push({ type: 'qa', text: 'MU.revealed was not reached within 25s (preloader stuck or boot error)' }));
  }
  return { browser, context, page, logs };
}

export async function scrollTo(page, spec) {
  return page.evaluate(spec => {
    let y = 0;
    if (spec.startsWith('y=')) y = parseFloat(spec.slice(2));
    else {
      const [name, pStr] = spec.split('@');
      const el = document.querySelector(`[data-part="${name}"]`) || document.querySelector('#' + name);
      if (!el) return { error: 'no element for ' + name };
      const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
      const top = box.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(0, box.offsetHeight - window.innerHeight);
      y = top + range * (parseFloat(pStr || 0));
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    y = Math.max(0, Math.min(max, y));
    if (window.MU && MU.lenis) MU.lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    if (window.MU) MU.ScrollTrigger.update();
    return { y: Math.round(y) };
  }, spec);
}

export async function shoot(page, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, animations: 'allow' });
  return file;
}

export async function pageChecks(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const res = { docHeight: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, vw };
    res.overflowX = res.scrollWidth > vw + 1;
    const offenders = [];
    const clips = el => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (/(hidden|clip)/.test(s.overflowX) || /(hidden|clip)/.test(s.overflow) || s.position === 'fixed') return true;
      }
      return false;
    };
    document.querySelectorAll('body *').forEach(el => {
      if (offenders.length > 10) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.right > vw + 2 && !clips(el) && getComputedStyle(el).position !== 'fixed') {
        offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(' ').slice(0, 2).join('.')} right=${Math.round(r.right)}`);
      }
    });
    res.overflowOffenders = offenders;
    if (window.MU) {
      const sts = MU.ScrollTrigger.getAll();
      res.scrollTriggers = sts.length;
      res.pins = sts.filter(s => s.pin).length;
    }
    res.parts = Array.from(document.querySelectorAll('[data-part]')).map(e => e.dataset.part).filter((v, i, a) => a.indexOf(v) === i);
    return res;
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const argv = process.argv.slice(2);
  const opt = n => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
  const flag = n => argv.includes('--' + n);
  const file = opt('file') || 'dist/index.html';
  const out = path.join(ROOT, opt('out') || 'qa/run');
  const vps = (opt('vp') || 'desktop,mobile').split(',');
  const shots = (opt('shots') || '').split(',').map(s => s.trim()).filter(Boolean);
  const wait = parseInt(opt('wait') || '1200', 10);
  const frames = opt('frames') ? opt('frames').split(',').map(Number) : null;
  const report = {};
  for (const vp of vps) {
    const { browser, page, logs } = await openPage(file, vp, { reduced: flag('reduced') });
    await sleep(flag('full') ? 2200 : 900);
    const r = report[vp] = { shots: [] };
    const take = async (spec, label) => {
      const pos = await scrollTo(page, spec);
      if (pos.error) { r.shots.push(pos.error); return; }
      if (frames) {
        let t0 = 0;
        for (const f of frames) { await sleep(Math.max(0, f - t0)); t0 = f; r.shots.push(path.relative(ROOT, await shoot(page, path.join(out, `${vp}-${label}-t${f}.png`)))); }
      } else {
        await sleep(wait);
        r.shots.push(path.relative(ROOT, await shoot(page, path.join(out, `${vp}-${label}.png`))));
      }
    };
    for (const s of shots) await take(s, s.replace(/[^\w.@=-]+/g, '_'));
    if (flag('full')) {
      const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const vh = VIEWPORTS[vp].viewport.height;
      const step = Math.max(vh * 0.9, h / 89);
      let i = 0;
      for (let y = 0; y <= h + 1; y += step) await take(`y=${Math.round(y)}`, `full-${String(i++).padStart(3, '0')}`);
    }
    Object.assign(r, await pageChecks(page));
    r.logs = logs;
    await browser.close();
  }
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(e => { console.error(e); process.exit(1); });

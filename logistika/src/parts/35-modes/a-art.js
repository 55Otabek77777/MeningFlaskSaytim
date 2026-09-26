/* ==========================================================================
   03 · TRANSPORT (modes) — scene art, drawn entirely in inline SVG / CSS.
   window.muModesArt = { auto(), rail(), sea(), air() } -> scene innerHTML.
   Every scene is a stack of layers (.mod-l) inside a size container (.mod-scene),
   sized in cqh/cqw. data-s = horizontal scroll-parallax factor, --d = pointer depth.
   Looping strips (lane dashes, sleepers, waves, clouds) are tiled data-URI SVG
   backgrounds translated by exactly one tile -> seamless + GPU composited.
   ========================================================================== */
(() => {
  'use strict';
  const R = seed => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const f = v => Math.round(v * 10) / 10;
  const NS = 'http://www.w3.org/2000/svg';
  const STAR8 = 'M0-46 10-24 32.5-32.5 24-10 46 0 24 10 32.5 32.5 10 24 0 46-10 24-32.5 32.5-24 10-46 0-24-10-32.5-32.5-10-24Z';
  const svg = (vb, inner, par = 'xMidYMax slice', cls = '') =>
    `<svg${cls ? ` class="${cls}"` : ''} viewBox="${vb}" preserveAspectRatio="${par}" focusable="false">${inner}</svg>`;
  const enc = s => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27');
  const tile = (vb, inner) => `url(data:image/svg+xml,${enc(`<svg xmlns="${NS}" viewBox="${vb}" preserveAspectRatio="none">${inner}</svg>`)})`;
  const stops = a => a.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('');
  const lin = (id, a, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(a)}</linearGradient>`;
  const rad = (id, a) => `<radialGradient id="${id}">${stops(a)}</radialGradient>`;
  const defs = inner => `<svg class="mod-defs" width="0" height="0" focusable="false"><defs>${inner}</defs></svg>`;

  /* smooth Catmull-Rom path through points */
  const smooth = pts => {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  };

  /* ---------------------------------------------------------------- layer helpers */
  // centered wide band: height h (cqh), aspect ar, bottom b (cqh)
  const ds = s => (s === null ? '' : ` data-s="${s}"`);
  const band = (cls, s, d, b, h, ar, inner) =>
    `<div class="mod-l mod-l--c ${cls}"${ds(s)} style="--d:${d};--b:${b}cqh;--h:${h}cqh;--ar:${ar}">${inner}</div>`;
  // group adjacent layers so they share ONE composited parallax layer
  const group = (s, d, inner) => `<div class="mod-l mod-l--full"${ds(s)} style="--d:${d}">${inner}</div>`;
  // looping strip (outer = parallax layer, inner = CSS translate loop by one tile)
  const strip = (cls, s, d, b, h, tW, vbW, vbH, inner, dur, rev) =>
    `<div class="mod-l mod-l--strip ${cls}"${ds(s)} style="--d:${d};--b:${b}cqh;--h:${h}cqh">` +
    `<div class="mod-strip${rev ? ' mod-strip--r' : ''}" style="--t:${tW}cqh;animation-duration:${dur}s;background-image:${tile(`0 0 ${vbW} ${vbH}`, inner)}"></div></div>`;
  const beam = (id, pts, pts2, c1, c2) =>
    svg('0 0 100 100', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${stops([[0, c1, .62], [.35, c2, .2], [1, c2, 0]])}</linearGradient></defs>` +
      `<polygon points="${pts2}" fill="url(#${id})" opacity=".45"/><polygon points="${pts}" fill="url(#${id})"/>`, 'none');
  const word = (txt, s, idx) => `<div class="mod-l mod-word" data-s="${-s * .8}" style="--d:5"><i class="mod-word__i">${idx}</i><span>${txt}</span></div>`;

  function stars(seed, n, maxY = 520) {
    const r = R(seed); let c = '', tw = '';
    for (let i = 0; i < n * 2.4; i++) {
      const x = r() * 1600, y = Math.pow(r(), 1.45) * maxY, k = r();
      const rr = k > .97 ? 2.1 : k > .8 ? 1.35 : .65 + r() * .4;
      c += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" opacity="${f(.3 + r() * .7)}"/>`;
      if (k > .985) c += `<path d="M${f(x - 8)} ${f(y)}H${f(x + 8)}M${f(x)} ${f(y - 8)}V${f(y + 8)}" stroke="#fff" stroke-width=".7" opacity=".75"/>`;
    }
    for (let i = 0; i < 9; i++) {
      tw += `<i class="mod-tw" style="left:${f(4 + r() * 92)}%;top:${f(3 + Math.pow(r(), 1.3) * maxY / 9.6)}%;animation-duration:${f(2.4 + r() * 3)}s;animation-delay:-${f(r() * 4)}s"></i>`;
    }
    return `<div class="mod-stars">${svg('0 0 1600 900', `<g fill="#fff">${c}</g>`, 'xMidYMin slice')}</div>${tw}`;
  }

  function mountains(seed, W, H, peaks, jag, snowMin) {
    const r = R(seed);
    const hAt = x => {
      let h = 0;
      for (const [px, ph, pw] of peaks) { const t = 1 - Math.abs(x - px) / pw; if (t > 0) h = Math.max(h, ph * Math.pow(t, 1.3)); }
      return h;
    };
    const xs = new Set(); for (let x = 0; x <= W; x += 16) xs.add(x); peaks.forEach(p => xs.add(p[0]));
    const pts = [...xs].sort((a, b) => a - b).map(x => {
      const h = hAt(x), apex = peaks.some(p => p[0] === x);
      const n = apex ? 0 : (r() - .5) * jag * Math.min(1, h / 60);
      return [x, H - Math.max(0, h + n)];
    });
    const yAt = x => {
      for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
        const a = pts[i - 1], b = pts[i], t = (x - a[0]) / ((b[0] - a[0]) || 1);
        return a[1] + (b[1] - a[1]) * t;
      }
      return H;
    };
    const top = pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('');
    let shade = '', snow = '';
    peaks.forEach(([px, ph, pw]) => {
      const seg = pts.filter(p => p[0] > px && p[0] <= px + pw * .7);
      if (seg.length) shade += `M${f(px)} ${f(yAt(px))}` + seg.map(p => `L${f(p[0])} ${f(p[1])}`).join('') + `L${f(px + pw * .2)} ${H}Z`;
      if (snowMin && ph > snowMin) {
        const sw = pw * .2, depth = ph * .22;
        let d = `M${f(px - sw)} ${f(yAt(px - sw))}` + pts.filter(p => p[0] > px - sw && p[0] < px + sw).map(p => `L${f(p[0])} ${f(p[1])}`).join('') + `L${f(px + sw)} ${f(yAt(px + sw))}`;
        for (let k = 7; k >= 0; k--) {
          const x = px - sw + (2 * sw * k) / 7;
          d += `L${f(x)} ${f(yAt(x) + depth * (.3 + r() * .7) * (1 - Math.abs(x - px) / sw * .7))}`;
        }
        snow += d + 'Z';
      }
    });
    return { body: `${top}L${W} ${H}L0 ${H}Z`, top, shade, snow };
  }

  function dunes(seed, W, H, base, amp, n, flat) {
    const r = R(seed), pts = [[-40, base]];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W;
      let y = base - amp * (i % 2 ? .25 + r() * .3 : .7 + r() * .3);
      if (flat && x > flat[0] && x < flat[1]) y = flat[2] + Math.sin(x / 230) * 4;
      pts.push([x, y]);
    }
    pts.push([W + 40, base]);
    const top = smooth(pts);
    return { top, body: `${top}L${W + 40} ${H}L-40 ${H}Z` };
  }

  /* ================================================================= 01 · AVTO */
  const REGISTAN = (() => {
    const body = 'fill="url(#mod-a-reg)" stroke="rgba(110,160,255,.4)" stroke-width="1.1"';
    const niche = 'fill="#050817"';
    const minaret = x => `<path ${body} d="M${x} 230L${x + 2.5} 46H${x + 11.5}L${x + 14} 230Z"/><path ${body} d="M${x - 3} 36H${x + 17}V46H${x - 3}Z"/><path fill="url(#mod-a-dome)" d="M${x - 1} 36Q${x + 7} 20 ${x + 15} 36Z"/>`;
    const arch = (x, y, w, h) => `<path ${niche} d="M${x} ${y + h}V${y + w * .55}Q${x} ${y} ${x + w / 2} ${y - w * .3}Q${x + w} ${y} ${x + w} ${y + w * .55}V${y + h}Z"/>`;
    const glow = (x, y, w, h, o) => `<path fill="url(#mod-a-win)" opacity="${o}" d="M${x} ${y + h}V${y + w * .55}Q${x} ${y} ${x + w / 2} ${y - w * .3}Q${x + w} ${y} ${x + w} ${y + w * .55}V${y + h}Z"/>`;
    const dome = (cx, top, w, base) => `<path ${body} d="M${cx - w / 2 + 4} ${base + 30}V${base}H${cx + w / 2 - 4}V${base + 30}Z"/>` +
      `<path fill="url(#mod-a-dome)" stroke="rgba(46,230,214,.45)" stroke-width="1" d="M${cx - w / 2} ${base + 2}C${cx - w / 2} ${top + 40} ${cx - 6} ${top + 22} ${cx} ${top}C${cx + 6} ${top + 22} ${cx + w / 2} ${top + 40} ${cx + w / 2} ${base + 2}Z"/>` +
      `<path fill="none" stroke="rgba(46,230,214,.35)" stroke-width=".9" d="M${cx} ${top + 4}V${base}M${cx - w / 4} ${top + 22}Q${cx - w / 3} ${base - 14} ${cx - w / 3} ${base}M${cx + w / 4} ${top + 22}Q${cx + w / 3} ${base - 14} ${cx + w / 3} ${base}"/>`;
    const wing = (x0, x1) => { let s = ''; for (let x = x0; x < x1 - 10; x += 16) s += arch(x + 3, 176, 10, 18) + arch(x + 3, 204, 10, 22); return s; };
    const suns = `<circle cx="466" cy="84" r="5" fill="#ffc861" opacity=".85"/><circle cx="514" cy="84" r="5" fill="#ffc861" opacity=".85"/>`;
    return `<ellipse cx="300" cy="232" rx="330" ry="120" fill="url(#mod-a-regglow)"/>` +
      /* Ulug'bek madrasa */
      `<path ${body} d="M14 230V150H62V58H158V150H206V230Z"/>` + minaret(20) + minaret(186) + wing(34, 62) + wing(158, 186) +
      arch(80, 90, 60, 140) + glow(96, 128, 28, 102, .55) + `<path fill="none" stroke="rgba(46,230,214,.25)" d="M68 230V64H152V230"/>` +
      /* Tilla-Kori */
      dome(245, 44, 44, 98) +
      `<path ${body} d="M226 230V128H266V74H334V128H374V230Z"/>` + arch(280, 104, 40, 126) + glow(290, 136, 20, 94, .75) +
      `<path ${body} d="M364 128V110H376V128Z"/><path fill="url(#mod-a-dome)" d="M363 110Q370 100 377 110Z"/>` + wing(338, 374) +
      /* Sher-Dor */
      dome(428, 70, 40, 120) + dome(552, 70, 40, 120) +
      `<path ${body} d="M394 230V150H442V58H538V150H586V230Z"/>` + minaret(392) + minaret(574) + wing(406, 442) + wing(538, 574) +
      arch(460, 90, 60, 140) + glow(476, 128, 28, 102, .6) + suns + `<path fill="none" stroke="rgba(46,230,214,.25)" d="M448 230V64H532V230"/>` +
      /* base lights */
      Array.from({ length: 34 }, (_, i) => `<circle cx="${18 + i * 17}" cy="227" r="1.3" fill="#ffc861" opacity="${(.35 + (i * 37 % 60) / 100).toFixed(2)}"/>`).join('');
  })();

  const TRUCK = (() => {
    let ribs = '';
    for (let x = 26; x < 466; x += 15) ribs += `M${x} 40V170`;
    return `<ellipse cx="340" cy="223" rx="336" ry="7" fill="#000" opacity=".55"/>` +
      /* trailer */
      `<rect x="8" y="34" width="462" height="142" rx="5" fill="url(#mod-a-trl)"/>` +
      `<path d="${ribs}" stroke="#fff" stroke-opacity=".045" stroke-width="3"/>` +
      `<rect x="8.5" y="34.5" width="461" height="141" rx="5" fill="none" stroke="#7d9bff" stroke-opacity=".45"/>` +
      `<path d="M14 37H464" stroke="#bcd0ff" stroke-opacity=".6" stroke-width="2"/>` +
      `<rect x="8" y="148" width="462" height="7" fill="#2ee6d6"/><rect x="8" y="158" width="462" height="2.5" fill="#ffc861"/>` +
      `<g transform="translate(64 101) scale(.52)"><path d="${STAR8}" fill="none" stroke="#ffc861" stroke-width="7" stroke-linejoin="round"/><circle r="10" fill="#ffc861"/></g>` +
      `<text x="100" y="116" font-family="Unbounded, sans-serif" font-weight="800" font-size="44" letter-spacing="-1" fill="#eaf1ff">ULUGʻBEK</text>` +
      `<text x="102" y="137" font-family="JetBrains Mono, monospace" font-size="12.5" letter-spacing="5.5" fill="#9fb4e8">LOGISTICS · 47 DAVLAT</text>` +
      /* chassis + fenders */
      `<rect x="20" y="176" width="455" height="10" fill="#070a14"/><rect x="206" y="186" width="192" height="5" rx="2" fill="#2a3358"/>` +
      `<rect x="330" y="186" width="8" height="24" fill="#1a2140"/><rect x="323" y="207" width="22" height="4" rx="2" fill="#1a2140"/>` +
      `<path d="M38 190Q38 170 58 170H186Q204 170 204 190Z" fill="#070a14"/>` +
      `<rect x="3" y="146" width="8" height="18" rx="2" fill="#ff3b2e"/>` +
      /* tractor */
      `<rect x="440" y="168" width="228" height="15" fill="#070a14"/><rect x="468" y="163" width="48" height="6" fill="#3a4466"/>` +
      `<rect x="511" y="26" width="7" height="146" rx="3" fill="url(#mod-a-chrome)"/>` +
      `<path d="M522 176V64Q522 44 544 42H636Q656 42 662 62L673 116V176Z" fill="url(#mod-a-cab)"/>` +
      `<path d="M524 60Q528 24 566 20H636Q648 20 650 40H546Q528 42 524 60Z" fill="#d98a36"/>` +
      `<path d="M526 58Q530 26 566 22H634" fill="none" stroke="#ffe2a6" stroke-opacity=".8" stroke-width="2"/>` +
      [574, 590, 606, 622].map(x => `<circle cx="${x}" cy="17" r="2.8" fill="#ffc861"/>`).join('') +
      `<path d="M628 52H652Q658 52 660 60L669 110H634Z" fill="url(#mod-a-glass)"/>` +
      `<path d="M560 52H618V106H552V60Q552 52 560 52Z" fill="url(#mod-a-glass)"/>` +
      `<path d="M556 56L574 56L558 100Z" fill="#fff" opacity=".08"/>` +
      `<path d="M548 112V172M624 112V172" stroke="#7a3514" stroke-opacity=".55" stroke-width="1.5"/><rect x="602" y="120" width="15" height="3.2" rx="1.6" fill="#6a2c12"/>` +
      `<path d="M522 140H672" stroke="#03050c" stroke-opacity=".3" stroke-width="7"/><path d="M522 147H672" stroke="#2ee6d6" stroke-opacity=".7" stroke-width="2"/>` +
      `<g transform="translate(588 128) scale(.16)"><path d="${STAR8}" fill="#03050c" opacity=".55"/></g>` +
      `<rect x="562" y="180" width="54" height="17" rx="7" fill="url(#mod-a-chrome)"/>` +
      `<path d="M466 188Q466 168 488 168H548Q560 168 560 188Z" fill="#070a14"/><path d="M612 188Q612 168 632 168H652Q668 168 668 188Z" fill="#070a14"/>` +
      `<rect x="660" y="150" width="16" height="32" rx="3" fill="#161b2e"/>` +
      `<rect x="664" y="134" width="13" height="11" rx="3" fill="#fff6d8"/><circle cx="671" cy="139" r="16" fill="url(#mod-a-hl)"/>` +
      `<path d="M664 64h11v36h-7z" fill="#161b2e"/>` +
      `<path d="M8 36V172" stroke="#ff3b2e" stroke-opacity=".25" stroke-width="2"/>`;
  })();

  const WHEEL = `<svg viewBox="-25 -25 50 50" focusable="false"><circle r="24" fill="#05070f"/><circle r="22.5" fill="none" stroke="#232b4d" stroke-width="2.5"/>` +
    `<circle r="14" fill="url(#mod-a-rim)"/><circle r="14" fill="none" stroke="#dfe6fb" stroke-opacity=".7" stroke-width="1.2"/>` +
    [0, 60, 120, 180, 240, 300].map(a => `<circle cx="${f(Math.cos(a * Math.PI / 180) * 8.6)}" cy="${f(Math.sin(a * Math.PI / 180) * 8.6)}" r="2.6" fill="#2d3558"/>`).join('') +
    `<circle r="3.8" fill="#1d2440"/><rect x="-1" y="-13.5" width="2" height="5" fill="#fff" opacity=".7"/></svg>`;

  const SIGN = `<rect x="38" y="150" width="10" height="210" fill="#2a3358"/><rect x="252" y="150" width="10" height="210" fill="#2a3358"/>` +
    `<rect x="214" y="4" width="76" height="36" rx="7" fill="#eaf1ff"/><text x="252" y="29.5" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="19" fill="#1a3db8">M39</text>` +
    `<rect x="6" y="40" width="288" height="124" rx="13" fill="#1a3db8"/><rect x="13" y="47" width="274" height="110" rx="8" fill="none" stroke="#eaf1ff" stroke-width="3"/>` +
    `<text x="28" y="91" font-family="Unbounded, sans-serif" font-weight="700" font-size="29" fill="#fff">Samarqand</text>` +
    `<path d="M40 142V110M28 122l12-12 12 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="272" y="142" text-anchor="end" font-family="Unbounded, sans-serif" font-weight="800" font-size="34" fill="#ffc861">280 km</text>` +
    `<rect x="6" y="40" width="288" height="124" rx="13" fill="url(#mod-a-signlit)"/>`;

  const LAMP = `<defs>${lin('c', [[0, '#ffd98a', .42], [.55, '#ffc861', .1], [1, '#ffc861', 0]])}<radialGradient id="g">${stops([[0, '#fff4d6', .95], [.25, '#ffc861', .5], [1, '#ffc861', 0]])}</radialGradient></defs>` +
    `<path d="M150 30L70 400H320L200 30Z" fill="url(#c)"/><rect x="36" y="40" width="9" height="360" fill="#141a3a"/>` +
    `<path d="M40 50Q40 22 74 20H164" fill="none" stroke="#141a3a" stroke-width="7"/><rect x="150" y="12" width="52" height="13" rx="6" fill="#232b52"/>` +
    `<rect x="156" y="24" width="40" height="4" rx="2" fill="#fff4d6"/><circle cx="176" cy="27" r="46" fill="url(#g)"/>`;

  function auto() {
    const back = mountains(3, 2400, 420, [[170, 150, 250], [500, 230, 300], [840, 180, 260], [1190, 305, 340], [1500, 205, 280], [1830, 262, 300], [2160, 190, 280], [2400, 150, 240]], 26, 200);
    const front = mountains(7, 2400, 420, [[40, 120, 220], [380, 150, 250], [700, 110, 220], [1000, 170, 260], [1340, 128, 230], [1660, 190, 280], [2010, 140, 250], [2320, 118, 240]], 18, 0);
    const r = R(5);
    let lights = '';
    for (let i = 0; i < 90; i++) lights += `<circle cx="${f(r() * 2400)}" cy="${f(8 + Math.pow(r(), 2) * 60)}" r="${f(.8 + r() * 1.4)}" fill="${r() > .75 ? '#7fb2ff' : '#ffc861'}" opacity="${f(.25 + r() * .6)}"/>`;
    const guard = `<rect x="0" y="10" width="120" height="7" fill="#39436a"/><rect x="0" y="10" width="120" height="2" fill="#8d9bd0"/><rect x="8" y="10" width="7" height="40" fill="#252d52"/>` +
      `<rect x="9" y="22" width="5" height="4" fill="#ff5a36" opacity=".9"/>`;
    const wind = Array.from({ length: 5 }, (_, i) => `<i class="mod-wind" style="--y:${[18, 36, 52, 64, 30][i]}cqh;--w:${[22, 34, 16, 28, 12][i]}cqh;animation-delay:${-i * .37}s"></i>`).join('');

    return defs(
      lin('mod-a-mb', [[0, '#1c2863'], [1, '#0c1233']]) + lin('mod-a-mf', [[0, '#0f1740'], [1, '#070b1e']]) +
      lin('mod-a-snow', [[0, '#e6efff', .85], [1, '#9fb8ff', .12]]) +
      lin('mod-a-reg', [[0, '#141d49'], [1, '#0a1030']]) + lin('mod-a-dome', [[0, '#3ff0df'], [.5, '#1f8fa6'], [1, '#143a73']], 1, 1) +
      lin('mod-a-win', [[0, '#ffd98a', .95], [1, '#ff9d3d', .15]]) + rad('mod-a-regglow', [[0, '#ffc861', .22], [.5, '#3d8bff', .08], [1, '#3d8bff', 0]]) +
      lin('mod-a-trl', [[0, '#213a8c'], [.6, '#152760'], [1, '#0c173f']]) + lin('mod-a-cab', [[0, '#ffd889'], [.55, '#ffa347'], [1, '#c24a20']]) +
      lin('mod-a-glass', [[0, '#b4e2ff', .75], [.35, '#274080'], [1, '#0a1130']], 1, 1) + lin('mod-a-chrome', [[0, '#eef2ff'], [.5, '#8e9ac0'], [1, '#d7def5']], 1, 0) +
      rad('mod-a-hl', [[0, '#fff6d8', .95], [.4, '#ffc861', .35], [1, '#ffc861', 0]]) + rad('mod-a-rim', [[0, '#e8edfb'], [.7, '#98a4c8'], [1, '#56608a']]) +
      lin('mod-a-signlit', [[0, '#fff', .16], [.4, '#fff', 0], [1, '#000', .18]], 1, 1)
    ) +
      group(.58, 1.5, stars(11, 60, 470) +
      `<div class="mod-l mod-moon"><i class="mod-moon__glow"></i>${svg('0 0 100 100', `<circle cx="50" cy="50" r="46" fill="url(#mod-a-moon)"/><defs>${rad('mod-a-moon', [[0, '#fffaf0'], [.7, '#ffe4a8'], [1, '#e8b86a']])}</defs><circle cx="36" cy="40" r="8" fill="#e2b36a" opacity=".35"/><circle cx="62" cy="58" r="12" fill="#e2b36a" opacity=".3"/><circle cx="58" cy="30" r="5" fill="#e2b36a" opacity=".35"/><circle cx="34" cy="66" r="5" fill="#e2b36a" opacity=".25"/>`, 'xMidYMid meet')}</div>`) +
      word('AVTO', .32, '01') +
      group(.34, 3.5, band('mod-a-mback', null, 0, 26.5, 33, 5.714, svg('0 0 2400 420', `<path d="${back.body}" fill="url(#mod-a-mb)"/><path d="${back.shade}" fill="#070b22" opacity=".55"/><path d="${back.snow}" fill="url(#mod-a-snow)"/><path d="${back.top}" fill="none" stroke="#8fb0ff" stroke-opacity=".38" stroke-width="1.6"/>`)) +
      `<div class="mod-l mod-reg">${svg('0 0 600 232', REGISTAN, 'xMidYMax meet')}</div>` +
      band('mod-a-mfront', null, 0, 26.5, 21, 11.43, svg('0 0 2400 210', `<path d="${front.body}" transform="translate(0 -210)" fill="url(#mod-a-mf)"/><path d="${front.shade}" transform="translate(0 -210)" fill="#04071a" opacity=".6"/><path d="${front.top}" transform="translate(0 -210)" fill="none" stroke="#6f8fe8" stroke-opacity=".25" stroke-width="1.4"/>`))) +
      `<div class="mod-l mod-a-plain" data-s=".12" style="--d:5">${svg('0 0 2400 120', lights, 'xMidYMin slice')}</div>` +
      strip('mod-a-lamps', .06, 6, 17, 40, 70, 700, 400, LAMP, 2.8) +
      `<div class="mod-l mod-l--sign mod-sign" data-s="-.14" style="--d:8">${svg('0 0 300 360', SIGN, 'xMidYMax meet')}</div>` +
      `<div class="mod-l mod-a-road" data-s="0" style="--d:9"><i class="mod-a-road__edge"></i><div class="mod-a-road__dash"></div><i class="mod-a-road__edge mod-a-road__edge--b"></i></div>` +
      strip('mod-a-pools', .06, 9, 8.5, 9, 70, 700, 90, `<defs>${`<radialGradient id="p">${stops([[0, '#ffd98a', .34], [.5, '#ffc861', .12], [1, '#ffc861', 0]])}</radialGradient>`}</defs><ellipse cx="190" cy="40" rx="150" ry="34" fill="url(#p)"/>`, 2.8) +
      `<div class="mod-l mod-act mod-truck" data-s="0" data-act="truck" data-cursor="Signal" style="--d:10"><div class="mod-act__in">` +
      `<i class="mod-truck__beam">${beam('mod-a-beam', '0,45 100,8 100,100 0,56', '0,42 100,0 100,100 0,60', '#fff4d6', '#ffd68c')}</i><i class="mod-truck__pool"></i><i class="mod-truck__tail"></i>` +
      `<div class="mod-truck__body">${svg('0 0 680 230', TRUCK, 'xMidYMid meet')}</div>` +
      [70, 122, 174, 486, 536, 636].map(cx => `<div class="mod-wheel" style="left:${f((cx - 24) / 6.8)}%;top:${f(174 / 2.3)}%;width:${f(48 / 6.8)}%">${WHEEL}</div>`).join('') +
      `<div class="mod-tag mod-truck__tag"><i></i><span data-mod-gps>41.3111° N · 69.2797° E</span></div>` +
      `</div></div>` +
      strip('mod-a-guard', -.12, 12, 1.2, 5, 12, 120, 50, guard, .32) +
      `<div class="mod-l mod-l--full mod-winds" data-s="0" style="--d:0">${wind}</div>`;
  }

  /* ================================================================= 02 · TEMIR YO'L */
  const CAMEL = (ox, pack) => {
    const leg = (x, y, b) => `<path class="mod-leg${b ? ' mod-leg--b' : ''}" d="M${x - 3} ${y}L${x - 2.2} ${y + 17}L${x - 3.2} ${y + 20}L${x - 2} ${y + 35}H${x + 3}L${x + 2} ${y + 20}L${x + 3} ${y + 17}L${x + 3} ${y}Z"/>`;
    return `<g transform="translate(${ox} 0)"><g class="mod-camel">` +
      leg(47, 70, 0) + leg(55, 70, 1) + leg(95, 70, 1) + leg(103, 68, 0) +
      `<path d="M6 31C6 26 12 22 20 21L24 15L27 21C31 23 33 27 34 32C36 40 40 44 46 44C50 34 54 20 63 19C71 18 74 32 78 38C82 30 86 20 93 21C101 22 104 36 108 44C113 50 114 58 110 66C106 72 100 75 96 76L52 76C44 74 38 66 36 58C33 50 28 44 24 40C20 36 14 36 10 35C7 34 6 33 6 31Z"/>` +
      `<path d="M110 56C116 60 117 68 115 74" fill="none"/>` +
      (pack ? `<path d="M60 38L96 38L92 50L64 50Z" class="mod-camel__pack"/><path d="M66 38V30H88V38" class="mod-camel__pack"/>`
        : `<path d="M71 22C71 14 79 12 81 18L80 26" /><circle cx="76" cy="9" r="4.2"/><path d="M60 38L96 38L92 48L64 48Z" class="mod-camel__pack"/>`) +
      `</g></g>`;
  };
  const CARAVAN = (() => {
    let s = `<path class="mod-car__trail" d="M0 108H880" />`;
    s += `<g transform="translate(6 0)"><g class="mod-camel"><circle cx="24" cy="36" r="5.2"/><path d="M19 32Q24 24 29 32Z"/><path d="M19 43L16 74H32L29 43Z"/>` +
      `<path class="mod-leg" d="M21 72L20 107H24L25 72Z"/><path class="mod-leg mod-leg--b" d="M26 72L26 107H30L30 72Z"/><path d="M13 30L9 108" fill="none" stroke-width="1.6"/></g></g>`;
    s += `<path d="M34 52Q50 44 76 33" fill="none" class="mod-car__rope"/>`;
    for (let i = 0; i < 5; i++) {
      const ox = 70 + i * 152;
      s += CAMEL(ox, i % 2 === 0);
      if (i < 4) s += `<path d="M${ox + 114} 58Q${ox + 140} 66 ${ox + 158} 33" fill="none" class="mod-car__rope"/>`;
    }
    return s;
  })();

  const TRAIN = (() => {
    const pal = [['#b44a2c', '#7c2c18'], ['#23408f', '#142658'], ['#c2902e', '#7c5a1a'], ['#138079', '#0a4e4a'], ['#5a45ae', '#37296f'], ['#a8373a', '#6a2022']];
    const box = (x, w, c, brand) => {
      let ribs = '';
      for (let rx = x + 8; rx < x + w - 6; rx += 7) ribs += `M${rx} 48V110`;
      return `<rect x="${x}" y="44" width="${w}" height="68" fill="${c[0]}"/><path d="${ribs}" stroke="${c[1]}" stroke-width="2.4" opacity=".75"/>` +
        `<rect x="${x}" y="44" width="${w}" height="3.5" fill="#ffc07a" opacity=".7"/><rect x="${x}" y="104" width="${w}" height="8" fill="#000" opacity=".25"/>` +
        `<path d="M${x + w - 10} 48V108M${x + w - 5} 48V108" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/>` +
        `<rect x="${x}" y="44" width="5" height="5" fill="#000" opacity=".4"/><rect x="${x + w - 5}" y="44" width="5" height="5" fill="#000" opacity=".4"/>` +
        (brand ? `<rect x="${x + 16}" y="66" width="${w - 44}" height="26" fill="${c[1]}" opacity=".55"/><text x="${x + 24}" y="86" font-family="Unbounded, sans-serif" font-weight="800" font-size="17" fill="#fff" opacity=".85">ULUGʻBEK</text>` : '');
    };
    const bogie = cx => `<rect x="${cx - 30}" y="121" width="60" height="8" rx="3" fill="#1a0f22"/>` +
      [-18, 18].map(dx => `<circle cx="${cx + dx}" cy="138" r="11" fill="#0b0610" stroke="#4a3558" stroke-width="2"/><circle cx="${cx + dx}" cy="138" r="3.2" fill="#6a577a"/>`).join('');
    let s = '';
    for (let k = 0; k < 6; k++) {
      const ox = k * 300, c = pal[(k * 5 + 2) % pal.length];
      s += `<rect x="${ox + 6}" y="112" width="288" height="10" fill="#150b1d"/>` + bogie(ox + 50) + bogie(ox + 250);
      s += k % 3 === 1 ? box(ox + 10, 136, c, false) + box(ox + 154, 136, pal[(k + 3) % pal.length], false) : box(ox + 10, 280, c, k % 2 === 0);
      s += `<rect x="${ox + 292}" y="114" width="14" height="5" fill="#150b1d"/>`;
    }
    const L = 1800;
    s += bogie(L + 70) + bogie(L + 280);
    s += `<path d="M${L + 6} 122V52Q${L + 6} 40 ${L + 18} 40H${L + 290}Q${L + 312} 40 ${L + 324} 54L${L + 350} 96Q${L + 356} 106 ${L + 352} 122Z" fill="url(#mod-r-loco)"/>` +
      `<path d="M${L + 18} 42H${L + 290}Q${L + 310} 42 ${L + 322} 55" fill="none" stroke="#ffc07a" stroke-opacity=".75" stroke-width="2.4"/>` +
      `<rect x="${L + 6}" y="94" width="346" height="6" fill="#ffc861"/><rect x="${L + 6}" y="102" width="346" height="4" fill="#ff5a36"/>` +
      `<path d="M${L + 292} 50H${L + 312}Q${L + 320} 50 ${L + 326} 60L${L + 340} 86H${L + 292}Z" fill="url(#mod-r-glass)"/>` +
      `<rect x="${L + 30}" y="54" width="40" height="24" rx="3" fill="url(#mod-r-glass)"/><rect x="${L + 250}" y="54" width="30" height="24" rx="3" fill="url(#mod-r-glass)"/>` +
      `<path d="M${L + 84} 50V112M${L + 236} 50V112" stroke="#000" stroke-opacity=".3" stroke-width="1.5"/>` +
      `<text x="${L + 100}" y="80" font-family="Unbounded, sans-serif" font-weight="800" font-size="16" fill="#eaf1ff" opacity=".9">ULUGʻBEK RAIL</text>` +
      `<g transform="translate(${L + 330} 108) scale(.12)"><path d="${STAR8}" fill="#ffc861"/></g>` +
      `<rect x="${L + 90}" y="32" width="170" height="8" rx="2" fill="#1a1030"/>` +
      `<path d="M${L + 150} 32L${L + 176} 17L${L + 154} 4M${L + 186} 32L${L + 164} 17" fill="none" stroke="#8a7aa6" stroke-width="3"/>` +
      `<path d="M${L + 140} 3.5H${L + 172}" stroke="#c9b6d9" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="${L + 349}" cy="100" r="4" fill="#fff6d8"/><circle cx="${L + 349}" cy="100" r="16" fill="url(#mod-r-hl)"/>`;
    return s;
  })();

  function rail() {
    const r = R(9);
    const far = dunes(4, 2400, 300, 300, 210, 16);
    const mid = dunes(8, 2400, 300, 300, 120, 12, [240, 2160, 72]);
    const near = dunes(12, 2400, 100, 100, 70, 9);
    let grav = '';
    for (let i = 0; i < 26; i++) grav += `<circle cx="${f(r() * 120)}" cy="${f(24 + r() * 44)}" r="${f(.8 + r() * 1.6)}" fill="#5a3a4e" opacity="${f(.35 + r() * .5)}"/>`;
    const railTile = `<path d="M0 16H120L120 70H0Z" fill="#2a1726"/>${grav}<rect x="8" y="10" width="26" height="9" fill="#3e2433"/><rect x="68" y="10" width="26" height="9" fill="#3e2433"/>` +
      `<rect x="0" y="5" width="120" height="6" fill="#b69cb3"/><rect x="0" y="5" width="120" height="1.6" fill="#ffd3a0"/>`;
    const poleTile = `<rect x="40" y="96" width="9" height="244" fill="#1b0e22"/><rect x="40" y="96" width="2.5" height="244" fill="#ff9d5a" opacity=".35"/><path d="M44 118L118 118M44 150L92 153" stroke="#241230" stroke-width="4"/>` +
      `<path d="M0 118Q300 142 600 118" fill="none" stroke="#8a5a72" stroke-width="2.2" opacity=".8"/>` +
      Array.from({ length: 9 }, (_, i) => { const x = 40 + i * 60, y = 118 + Math.sin((x / 600) * Math.PI) * 17; return `<path d="M${x} ${f(y)}V153" stroke="#7a4a66" stroke-width="1.1" opacity=".7"/>`; }).join('') +
      `<path d="M0 153H600" stroke="#c08a8a" stroke-width="2" opacity=".75"/>`;
    let shrubs = '';
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 125 + r() * 50, h = 30 + r() * 45;
      shrubs += `<path d="M${f(x)} 100C${f(x - 4)} ${f(100 - h * .5)} ${f(x - 22)} ${f(100 - h * .7)} ${f(x - 30)} ${f(100 - h)}M${f(x)} 100C${f(x + 3)} ${f(100 - h * .6)} ${f(x + 16)} ${f(100 - h * .8)} ${f(x + 26)} ${f(100 - h * .95)}M${f(x)} 100V${f(100 - h * 1.05)}M${f(x - 12)} ${f(100 - h * .55)}L${f(x - 20)} ${f(100 - h * .45)}" fill="none" stroke="#2e1426" stroke-width="3.2" stroke-linecap="round"/>` +
        `<ellipse cx="${f(x)}" cy="100" rx="${f(18 + r() * 14)}" ry="6" fill="#241020"/>`;
    }
    const sunBands = `<clipPath id="mod-r-sunclip"><circle cx="50" cy="50" r="48"/></clipPath><g clip-path="url(#mod-r-sunclip)">` +
      [0, 1, 2, 3].map(i => `<rect x="0" y="${60 + i * 10}" width="100" height="${1.6 + i * 1.4}" fill="#3a1030" opacity=".5"/>`).join('') + '</g>';

    return defs(
      lin('mod-r-far', [[0, '#9a4458'], [.5, '#5a2442'], [1, '#2a1030']]) + lin('mod-r-mid', [[0, '#4a2140'], [1, '#1f0e22']]) + lin('mod-r-nearg', [[0, '#3a1a2c'], [.5, '#1a0a18'], [1, '#0a040b']]) +
      lin('mod-r-crest', [[0, '#ffc861', 0], [.5, '#ffc861', .8], [1, '#ff9d3d', 0]], 1, 0) +
      lin('mod-r-loco', [[0, '#2a4aa6'], [.55, '#1a2f78'], [1, '#101a4a']]) + lin('mod-r-glass', [[0, '#ffd08a', .9], [.5, '#8a4a7a'], [1, '#1a1030']], 1, 1) +
      rad('mod-r-hl', [[0, '#fff6d8', .9], [.4, '#ffc861', .35], [1, '#ffc861', 0]]) +
      lin('mod-r-sun', [[0, '#fff1b8'], [.45, '#ffc861'], [1, '#ff5a36']])
    ) +
      group(.6, 1.5, stars(23, 36, 330) +
      `<div class="mod-l mod-sun"><i class="mod-sun__glow"></i>${svg('0 0 100 100', `<circle cx="50" cy="50" r="48" fill="url(#mod-r-sun)"/>${sunBands}`, 'xMidYMid meet')}</div>`) +
      word('TEMIR<br>YOʻL', .32, '02') +
      band('mod-r-far', .42, 3, 34, 24, 8, svg('0 0 2400 300', `<path d="${far.body}" fill="url(#mod-r-far)"/><path d="${far.top}" fill="none" stroke="url(#mod-r-crest)" stroke-width="2.4"/>`)) +
      `<div class="mod-l mod-l--c mod-r-mid" data-s=".24" style="--d:4;--b:20cqh;--h:30cqh;--ar:8">` +
      svg('0 0 2400 300', `<path d="${mid.body}" fill="url(#mod-r-mid)"/><path d="${mid.top}" fill="none" stroke="#ff9d3d" stroke-opacity=".45" stroke-width="2"/>`) +
      `<div class="mod-caravan"><div class="mod-caravan__walk">${svg('0 0 880 112', CARAVAN, 'xMinYMax meet')}` +
      `<span class="mod-tag mod-tag--gold mod-caravan__tag"><i></i>XV asr · Buyuk Ipak yoʻli</span></div></div></div>` +
      strip('mod-r-poles', 0, 6, 18, 34, 60, 600, 340, poleTile, 1.25) +
      `<div class="mod-l mod-r-ground" data-s="0" style="--d:7"></div>` +
      strip('mod-r-rail', 0, 7, 14, 7, 12, 120, 70, railTile, .24) +
      `<div class="mod-l mod-act mod-train" data-s="0" data-act="train" data-cursor="Signal" style="--d:7"><div class="mod-act__in">` +
      `<i class="mod-train__beam">${beam('mod-r-beam', '0,44 100,4 100,100 0,58', '0,40 100,0 100,100 0,62', '#fff4d6', '#ffd68c')}</i><div class="mod-train__body">${svg('0 0 2160 150', TRAIN, 'xMaxYMax meet')}</div>` +
      `<i class="mod-train__spark"></i><span class="mod-tag mod-train__tag"><i></i>XXI asr · Yangi Ipak yoʻli</span></div></div>` +
      band('mod-r-near', -.1, 11, -2, 10, 24, svg('0 0 2400 100', `<path d="${near.body}" fill="url(#mod-r-nearg)"/><path d="${near.top}" fill="none" stroke="#ff9d5a" stroke-opacity=".35" stroke-width="2"/>`)) +
      strip('mod-r-shrubs', -.18, 12, -1, 11, 90, 900, 110, shrubs, 1.15);
  }

  /* ================================================================= 03 · DENGIZ */
  const SHIP = (() => {
    const r = R(31);
    const pal = ['#b44a2c', '#23408f', '#c2902e', '#138079', '#5a45ae', '#a8373a', '#2a2f55', '#d9dee9'];
    let boxes = '';
    for (let x = 132; x < 548; x += 30) {
      const tiers = 2 + Math.floor(r() * 3);
      for (let t = 0; t < tiers; t++) {
        const y = 98 - t * 20, c = pal[Math.floor(r() * pal.length)];
        boxes += `<rect x="${x}" y="${y}" width="28" height="19" fill="${c}"/><path d="M${x + 6} ${y + 2}V${y + 17}M${x + 12} ${y + 2}V${y + 17}M${x + 18} ${y + 2}V${y + 17}M${x + 24} ${y + 2}V${y + 17}" stroke="#000" stroke-opacity=".22" stroke-width="1.2"/>`;
      }
      boxes += `<rect x="${x}" y="${98 - (tiers - 1) * 20}" width="28" height="2" fill="#bcd0ff" opacity=".35"/>`;
    }
    let win = '';
    for (let row = 0; row < 4; row++) for (let x = 50; x < 116; x += 8) if (r() > .25) win += `<rect x="${x}" y="${62 + row * 14}" width="4.5" height="4.5" fill="#ffd98a" opacity="${f(.55 + r() * .45)}"/>`;
    return `<path d="M22 118H604L636 122Q630 152 606 190H78Q46 188 34 162Z" fill="url(#mod-s-hull)"/>` +
      `<path d="M34 168H626Q618 180 606 190H78Q46 188 34 168Z" fill="#8f2a1a"/><path d="M34 168H626" stroke="#eaf1ff" stroke-opacity=".75" stroke-width="2"/>` +
      `<path d="M22 118.5H604L636 122.5" fill="none" stroke="#8fb0ff" stroke-opacity=".55" stroke-width="1.5"/>` +
      `<text x="594" y="148" text-anchor="end" font-family="Unbounded, sans-serif" font-weight="700" font-size="14" fill="#eaf1ff" letter-spacing="1">ULUGʻBEK</text><circle cx="612" cy="134" r="3" fill="#050817"/>` +
      `<path d="M560 118V108H604L614 118Z" fill="#162258"/>` + boxes +
      `<path d="M44 118V56H122V118Z" fill="url(#mod-s-sup)"/><path d="M44 70H122M44 84H122M44 98H122" stroke="#7a86aa" stroke-width="1"/>` + win +
      `<path d="M34 56V45H132V56Z" fill="#dfe6f5"/><rect x="38" y="47.5" width="90" height="5" fill="#0a1130"/>` +
      [42, 52, 62, 72, 82, 92, 102, 112, 122].map(x => `<rect x="${x}" y="48" width="5" height="4" fill="#9fd8ff" opacity=".6"/>`).join('') +
      `<path d="M60 45L64 18H90L93 45Z" fill="#1d3380"/><path d="M64 24H90V18H64Z" fill="#070a14"/><g transform="translate(77 34) scale(.13)"><path d="${STAR8}" fill="#ffc861"/></g>` +
      `<path d="M104 45V16M590 108V82" stroke="#c9d3ea" stroke-width="2"/><circle cx="104" cy="15" r="2.6" fill="#fff"/><circle cx="590" cy="81" r="2.6" fill="#fff"/>` +
      `<circle cx="131" cy="50" r="2.8" fill="#39e58c"/><circle cx="131" cy="50" r="9" fill="#39e58c" opacity=".25"/>`;
  })();

  const CRANE = s => `<g stroke="rgba(46,230,214,${s ? .38 : .6})" stroke-width="1.4" fill="${s ? '#0b1430' : '#0f1a3c'}">` +
    `<path d="M70 360L96 150H108L86 360Z"/><path d="M206 360L186 150H198L222 360Z"/>` +
    `<path d="M80 292H214V301H80Z"/><path d="M92 204H204V211H92Z"/><path d="M56 140H244V152H56Z"/>` +
    `<path d="M160 140L186 36H194L220 140Z"/><path d="M-4 124H274V136H-4Z"/><path d="M214 102H272V124H214Z"/></g>` +
    `<path d="M0 124${Array.from({ length: 22 }, (_, i) => `L${6 + i * 12} ${i % 2 ? 124 : 136}`).join('')}" fill="none" stroke="rgba(46,230,214,.3)" stroke-width="1"/>` +
    `<path d="M190 38L2 126M190 38L272 126M190 38L90 126" stroke="rgba(150,180,255,.5)" stroke-width="1.1"/>` +
    `<circle class="mod-crane__warn" cx="190" cy="34" r="3.4" fill="#ff5a36"/>` +
    `<g class="mod-trolley"><rect x="-14" y="136" width="28" height="9" rx="2" fill="#1a2a5a" stroke="rgba(46,230,214,.6)"/>` +
    `<g class="mod-cable"><path d="M-8 145V245M8 145V245" stroke="#9fb4e8" stroke-width="1"/></g>` +
    `<g class="mod-spreader"><rect x="-30" y="245" width="60" height="5" fill="#ffc861"/><g class="mod-cbox"><rect x="-28" y="250" width="56" height="22" fill="#b44a2c"/><path d="M-20 252V270M-12 252V270M-4 252V270M4 252V270M12 252V270M20 252V270" stroke="#000" stroke-opacity=".25"/></g></g></g>`;

  const LIGHTHOUSE = `<path fill="#081026" d="M0 300V262L18 248L34 256L50 238L72 244L92 232L112 246L128 240L140 252V300Z"/>` +
    `<path fill="#dfe6f5" d="M52 246L58 92H82L88 246Z"/><path fill="#ff5a36" d="M53.6 206L55.2 168H84.8L86.4 206Z"/><path fill="#ff5a36" d="M56.2 138L57.3 110H82.7L83.8 138Z"/>` +
    `<path fill="#000" opacity=".22" d="M70 246V92H82L88 246Z"/><path fill="#1c2340" d="M46 92H94V85H46Z"/><path d="M48 85V78M58 85V78M82 85V78M92 85V78M46 78H94" stroke="#39436a" stroke-width="1.5"/>` +
    `<path fill="url(#mod-s-lamp)" d="M57 85V62H83V85Z"/><path fill="#1c2340" d="M52 62L70 44L88 62Z"/><path d="M70 44V34" stroke="#39436a" stroke-width="2"/>` +
    `<path fill="#081026" d="M64 246V232Q64 226 70 226Q76 226 76 232V246Z"/>`;

  const wave = (a, top, crest, fillA, fillB, glint) =>
    `<defs>${lin('w', [[0, fillA], [1, fillB]])}</defs><path d="M0 ${top}Q50 ${top - a} 100 ${top}T200 ${top}T300 ${top}T400 ${top}V100H0Z" fill="url(#w)"/>` +
    `<path d="M0 ${top}Q50 ${top - a} 100 ${top}T200 ${top}T300 ${top}T400 ${top}" fill="none" stroke="${crest}" stroke-width="2"/>` + (glint || '');

  function sea() {
    const r = R(41);
    let coast = 'M0 90';
    for (let x = 0; x <= 2400; x += 40) coast += `L${x} ${f(70 - Math.abs(Math.sin(x / 310)) * 36 - r() * 8)}`;
    coast += 'L2400 90Z';
    let clights = '';
    for (let i = 0; i < 70; i++) clights += `<circle cx="${f(r() * 2400)}" cy="${f(62 + r() * 22)}" r="${f(.7 + r() * 1.2)}" fill="${r() > .7 ? '#7fe8ff' : '#ffc861'}" opacity="${f(.3 + r() * .6)}"/>`;
    const glint = Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 64}" y="${34 + (i % 3) * 8}" width="${14 + (i % 2) * 10}" height="1.6" fill="#bff8ff" opacity=".35"/>`).join('');
    const gulls = [0, 1, 2].map(i => `<i class="mod-gull" style="--gx:${[0, 9, 4][i]}cqh;--gy:${[0, 3, -4][i]}cqh;--gs:${[1, .8, .65][i]};animation-delay:${-i * 3.3}s"><svg viewBox="0 0 40 16" focusable="false"><path d="M1 12Q10 1 20 11Q30 1 39 12" fill="none" stroke="#dfe9ff" stroke-width="2.2" stroke-linecap="round"/></svg></i>`).join('');
    const glit = Array.from({ length: 11 }, (_, i) => `<i style="--gw:${[60, 38, 72, 30, 54, 44, 80, 26, 50, 36, 64][i]}%;--gd:${-(i * .43).toFixed(2)}s;--gy:${(i * 9).toFixed(0)}%"></i>`).join('');

    return defs(
      lin('mod-s-hull', [[0, '#1a2a6a'], [1, '#0b1238']]) + lin('mod-s-sup', [[0, '#e7ecf8'], [1, '#aeb9d6']]) +
      lin('mod-s-lamp', [[0, '#fff6d8'], [1, '#ffc861']]) + lin('mod-s-coast', [[0, '#0e2046'], [1, '#081430']])
    ) +
      group(.58, 1.5, stars(31, 64, 480) +
      `<div class="mod-l mod-moon mod-moon--sea"><i class="mod-moon__glow"></i>${svg('0 0 100 100', `<defs>${rad('mod-s-moon', [[0, '#ffffff'], [.75, '#dff4ff'], [1, '#9fd8ff']])}</defs><circle cx="50" cy="50" r="46" fill="url(#mod-s-moon)"/><circle cx="38" cy="42" r="8" fill="#9fc4e8" opacity=".3"/><circle cx="62" cy="60" r="11" fill="#9fc4e8" opacity=".25"/>`, 'xMidYMid meet')}</div>`) +
      word('DENGIZ', .32, '03') +
      group(.36, 3, band('mod-s-coast', null, 0, 35, 7.5, 26.7, svg('0 0 2400 90', `<path d="${coast}" fill="url(#mod-s-coast)"/>${clights}`)) +
      `<div class="mod-l mod-lh"><i class="mod-lh__beam">${beam('mod-s-beam', '0,46 100,4 100,96 0,54', '0,44 100,0 100,100 0,56', '#fff4d6', '#ffd68c')}</i><i class="mod-lh__flare"></i>${svg('0 0 140 300', LIGHTHOUSE, 'xMidYMax meet')}</div>`) +
      `<div class="mod-l mod-s-water" data-s="0" style="--d:4"></div>` +
      `<div class="mod-l mod-glitter" data-s=".6" style="--d:1.5">${glit}</div>` +
      strip('mod-s-w1', .12, 4, 28, 4.5, 18, 400, 100, wave(14, 50, 'rgba(127,232,255,.35)', '#0f3558', '#0a2442'), 6) +
      `<div class="mod-l mod-quay" data-s=".06" style="--d:5"></div>` +
      `<div class="mod-l mod-crane mod-crane--b" data-s=".1" style="--d:5">${svg('-10 0 290 360', CRANE(1), 'xMidYMax meet')}</div>` +
      `<div class="mod-l mod-crane mod-crane--a" data-s=".06" style="--d:6">${svg('-10 0 290 360', CRANE(0), 'xMidYMax meet')}</div>` +
      strip('mod-s-w2', .04, 5, 17, 9, 30, 400, 100, wave(18, 40, 'rgba(46,230,214,.4)', '#0d2d50', '#08192f', glint), 4.6, true) +
      `<div class="mod-l mod-act mod-ship" data-s="0" data-act="ship" data-cursor="Signal" style="--d:7"><div class="mod-act__in"><div class="mod-ship__bob">` +
      `${svg('0 0 640 220', SHIP, 'xMidYMax meet')}<i class="mod-ship__foam"></i></div>` +
      `<span class="mod-tag mod-ship__tag"><i></i>AIS · 18 tugun</span></div></div>` +
      strip('mod-s-w3', -.04, 8, 5.5, 10, 38, 400, 100, wave(20, 34, 'rgba(46,230,214,.5)', '#0b2744', '#061426', glint), 3.6) +
      strip('mod-s-w4', -.12, 10, -1.5, 9, 52, 400, 100, wave(22, 30, 'rgba(127,232,255,.35)', '#081d36', '#030a16'), 2.8, true) +
      `<div class="mod-l mod-l--full mod-gulls" data-s=".2" style="--d:3">${gulls}</div>`;
  }

  /* ================================================================= 04 · AVIA */
  const PLANE = `<path d="M92 108L58 92H76L126 108Z" fill="#8a96bb"/>` +
    `<path d="M60 118C60 104 72 98 92 98H560C600 98 640 106 668 118C680 124 680 130 668 134C644 142 604 146 560 146H100C76 146 62 136 60 124Z" fill="url(#mod-p-body)"/>` +
    `<path d="M96 146H560C604 146 644 142 668 134L672 128C640 136 604 139 560 139H92Z" fill="#1d3380"/>` +
    `<path d="M104 130H646" stroke="#2ee6d6" stroke-width="3"/><path d="M92 99H560C596 99 632 106 660 116" fill="none" stroke="#ffe7c2" stroke-opacity=".9" stroke-width="2"/>` +
    `<text x="232" y="123" font-family="Unbounded, sans-serif" font-weight="800" font-size="21" fill="#1d3380" letter-spacing=".5">ULUGʻBEK CARGO</text>` +
    `<path d="M628 108L646 110L654 117L630 117Z" fill="#0a1130"/><path d="M634 110L640 110.8L638 115L632 115Z" fill="#7fd0ff" opacity=".6"/>` +
    `<path d="M70 101L34 16H64L152 101Z" fill="url(#mod-p-tail)"/><path d="M36 18H62" stroke="#fff3d0" stroke-width="2"/>` +
    `<g transform="translate(76 66) scale(.26)"><path d="${STAR8}" fill="#03050c"/><circle r="9" fill="#ffc861"/></g>` +
    `<path d="M70 126L26 150H50L134 128Z" fill="#c9d3ea"/>` +
    `<path d="M300 133L196 214H224L410 135Z" fill="url(#mod-p-wing)"/><path d="M196 214L184 198L198 204Z" fill="#aeb9d6"/>` +
    `<path d="M300 150L316 138H336L326 150Z" fill="#aeb9d6"/>` +
    `<path d="M262 161C262 151 272 149 296 149H330C338 149 343 155 343 161C343 167 338 173 330 173H296C272 173 262 171 262 161Z" fill="url(#mod-p-eng)"/><ellipse cx="341" cy="161" rx="4" ry="11" fill="#0a0e1c"/>` +
    `<path d="M244 180L256 170H272L264 180Z" fill="#aeb9d6"/>` +
    `<path d="M212 189C212 181 220 179 238 179H264C271 179 275 184 275 189C275 194 271 199 264 199H238C220 199 212 197 212 189Z" fill="url(#mod-p-eng)"/><ellipse cx="273" cy="189" rx="3.4" ry="9" fill="#0a0e1c"/>`;

  /* soft cloud bank from overlapping puffs; wrap=true duplicates edge puffs so the tile repeats seamlessly */
  const cloudBank = (seed, W, H, base, rMin, rMax, count, gid, rim, wrap, dy = 3.5) => {
    const r = R(seed), c = [];
    for (let i = 0; i < count; i++) {
      const rr = rMin + r() * (rMax - rMin), cx = (i + r() * .8) / count * W, cy = base + rr * (.35 + r() * .45);
      c.push([cx, cy, rr]);
      if (wrap && cx + rr > W) c.push([cx - W, cy, rr]);
      if (wrap && cx - rr < 0) c.push([cx + W, cy, rr]);
    }
    const circ = (dy2, fill) => c.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y + dy2)}" r="${f(rr)}"/>`).join('');
    const floor = `<rect x="-10" y="${f(base + rMax * .7)}" width="${W + 20}" height="${H}"/>`;
    return `<g fill="${rim}">${circ(-dy)}</g><g fill="url(#${gid})">${floor}${circ(0)}</g>`;
  };
  const cloudTile = (seed, W, H, base, rMin, rMax, count, top, bot, rim) =>
    `<defs><linearGradient id="c" gradientUnits="userSpaceOnUse" x1="0" y1="${base - rMax}" x2="0" y2="${H}">${stops([[0, top], [1, bot]])}</linearGradient></defs>` +
    cloudBank(seed, W, H, base, rMin, rMax, count, 'c', rim, true);

  function air() {
    const sea = cloudBank(52, 2400, 300, 70, 50, 120, 34, 'mod-p-sea0', 'rgba(255,190,130,.55)', false, 4) +
      cloudBank(53, 2400, 300, 140, 60, 140, 30, 'mod-p-sea1', 'rgba(255,160,120,.35)', false, 3.5) +
      cloudBank(54, 2400, 300, 215, 70, 150, 26, 'mod-p-sea2', 'rgba(200,160,255,.25)', false, 3);
    return defs(
      lin('mod-p-body', [[0, '#f4f7ff'], [.6, '#c8d1ea'], [1, '#8e9ac0']]) + lin('mod-p-tail', [[0, '#ffd889'], [1, '#ff9d3d']], 1, 1) +
      lin('mod-p-wing', [[0, '#c9d3ea'], [1, '#6f7ca6']], 1, 1) + lin('mod-p-eng', [[0, '#eef2ff'], [1, '#8e9ac0']]) +
      `<linearGradient id="mod-p-sea0" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300">${stops([[0, '#b86a86'], [.35, '#5a3a7e'], [1, '#231b52']])}</linearGradient>` +
      `<linearGradient id="mod-p-sea1" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="300">${stops([[0, '#7a4a86'], [.4, '#34286c'], [1, '#161338']])}</linearGradient>` +
      `<linearGradient id="mod-p-sea2" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="300">${stops([[0, '#4a3478'], [.45, '#221d56'], [1, '#0b0a24']])}</linearGradient>`
    ) +
      group(.52, 1.2, stars(61, 90, 560) + `<i class="mod-shoot"></i>`) +
      word('AVIA', .32, '04') +
      band('mod-p-sea', .42, 3, 0, 30, 8, svg('0 0 2400 300', sea)) +
      strip('mod-p-c1', .16, 5, 8, 20, 110, 900, 200, cloudTile(3, 900, 200, 95, 26, 62, 16, '#8a5a92', '#2a2260', 'rgba(255,190,140,.6)'), 70) +
      `<div class="mod-l mod-act mod-plane" data-s="0" data-act="plane" data-cursor="Signal" style="--d:8"><div class="mod-act__in"><div class="mod-plane__fly">` +
      `<i class="mod-trail mod-trail--a"></i><i class="mod-trail mod-trail--b"></i>` +
      `${svg('0 0 720 260', PLANE, 'xMidYMid meet')}` +
      `<i class="mod-nav mod-nav--beacon"></i><i class="mod-nav mod-nav--belly"></i><i class="mod-nav mod-nav--wing"></i><i class="mod-nav mod-nav--tail"></i>` +
      `<span class="mod-tag mod-plane__tag"><i></i>FL 350 · 900 km/soat</span></div></div></div>` +
      strip('mod-p-c2', -.14, 10, -6, 22, 130, 900, 200, cloudTile(8, 900, 200, 90, 34, 80, 14, '#5a4686', '#100d2e', 'rgba(255,200,140,.5)'), 34) +
      strip('mod-p-c3', -.3, 14, 58, 5, 160, 1600, 50, `<path d="M0 30Q200 18 420 26T860 22T1300 28T1600 30V36Q1200 40 800 34T0 36Z" fill="#b9a6e8" opacity=".35"/>`, 46);
  }

  window.muModesArt = { auto, rail, sea, air };
})();

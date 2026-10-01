// Render one frame per second (plus checks) and build contact sheets.
// Needs Node and Playwright with Chromium. Output goes to verify/out/.
// usage: node render-contact-sheet.js [width=1240] [theme=light|dark] [tag=desktop]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'out');
fs.mkdirSync(dir, { recursive: true });
const width = +(process.argv[2] || 1240);
const theme = process.argv[3] || 'light';
const tag = process.argv[4] || 'desktop';
const file = 'file://' + path.join(__dirname, '..', 'pm-agent-pipeline.html');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => logs.push('console.' + m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => logs.push('requestfailed: ' + r.url()));
  await page.goto(file, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  // freeze the clock: pause, then draw frames on demand
  await page.click('#play');
  await page.addStyleTag({ content: 'header,.legend{display:none!important}.wrap{padding-top:12px!important}' });

  const times = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  const shots = [];
  for (const t of times) {
    await page.evaluate(t => window.renderAt(t), t);
    const buf = await page.screenshot({ fullPage: true });
    const f = path.join(dir, `frame-${tag}-${theme}-${t}.png`);
    fs.writeFileSync(f, buf);
    shots.push({ t, b64: buf.toString('base64') });
  }

  // loop-closure checks
  const snap = async t => page.evaluate(t => {
    window.renderAt(t);
    return document.getElementById('dia').outerHTML + document.getElementById('cbody').outerHTML +
      document.getElementById('clock').textContent + document.getElementById('scrub').value;
  }, t);
  const s0 = await snap(0), s10 = await snap(15), s20 = await snap(30);
  console.log('DOM frame0 === frame15:', s0 === s10, '| frame0 === frame30:', s0 === s20);
  const p0 = await page.screenshot({ fullPage: true });
  await page.evaluate(() => window.renderAt(15));
  const p10 = await page.screenshot({ fullPage: true });
  console.log('screenshot bytes frame0 === frame15:', Buffer.compare(p0, p10) === 0);
  // purity: out-of-order rendering gives the same DOM as in-order
  const a = await snap(6.6); await snap(12.1); await snap(0.4); const b = await snap(6.6);
  console.log('purity (6.6 after other frames):', a === b);

  // contact sheets: all ten side by side (overview) and 2x2 detail sheets
  const mk = async (name, items, cols, w) => {
    const html = `<body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px">` +
      items.map(s => `<div style="position:relative"><img src="data:image/png;base64,${s.b64}" style="width:${w}px;display:block"><span style="position:absolute;left:8px;top:8px;background:#000;color:#fff;font:700 18px monospace;padding:2px 8px">t=${s.t}</span></div>`).join('') + '</body>';
    const p2 = await ctx.newPage();
    await p2.setViewportSize({ width: cols * (w + 6) + 6, height: 600 });
    await p2.setContent(html);
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(dir, name), fullPage: true });
    await p2.close();
  };
  await mk(`sheet-${tag}-${theme}-overview.png`, shots, 5, 520);
  for (let i = 0; i < 15; i += 4) {
    await mk(`sheet-${tag}-${theme}-detail-${i / 4}.png`, shots.slice(i, i + 4), 2, 900);
  }
  console.log(logs.length ? logs.join('\n') : 'no console errors or failed requests');
  await browser.close();
})();

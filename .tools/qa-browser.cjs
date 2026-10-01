const {chromium}=require(process.env.NATIVA_PLAYWRIGHT || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const log=[],errors=[],http=[];
 const context=await browser.newContext();const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)http.push([r.status(),r.url()])});
 const base='http://127.0.0.1:8766/';
 const count=async n=>{assert.equal(await page.locator('[data-catalog] [data-product]').count(),n);assert.equal(await page.locator('[data-result-count]').innerText(),n+' '+(n===1?'produto':'produtos'))};
 await page.goto(base+'catalogo.html?cat=banho');await count(2);assert.equal(await page.locator('[data-filter="cat"]').inputValue(),'banho');
 await page.locator('[data-clear-filters]').click();await count(8);
 await page.locator('[data-filter="price"]').selectOption('under100');await count(2);assert.deepEqual(await page.locator('[data-catalog] [data-product]').evaluateAll(els=>els.map(e=>e.dataset.product)),['vela-terra','oleo-corpo']);
 await page.locator('[data-clear-filters]').click();await page.locator('[data-filter="material"]').selectOption('madeira');await count(1);
 await page.locator('[data-filter="cat"]').selectOption('banho');await count(0);assert.ok(await page.locator('.catalog-empty').isVisible());
 await page.locator('[data-search]').fill('oleo');await count(0);
 await page.locator('[data-clear-filters]').click();await count(8);assert.equal(new URL(page.url()).search,'');
 await page.locator('[data-filter="cat"]').selectOption('banho');await page.locator('[data-filter="price"]').selectOption('under100');await page.locator('[data-search]').fill('óleo');await count(1);
 await page.locator('[data-product="oleo-corpo"] h3 a').click();assert.equal(await page.locator('[data-catalog-back]').getAttribute('href'),'catalogo.html?cat=banho&price=under100&q=%C3%B3leo');
 // Critical cart regression: choose real variants and adjust quantity; never checkout.
 await page.locator('[data-detail-add]').click();assert.equal(await page.locator('[data-cart-total]').innerText(),'R$ 76,00');
 await page.locator('[data-inc]').click();assert.equal(await page.locator('[data-cart-total]').innerText(),'R$ 152,00');
 await page.locator('[data-dec]').click();assert.equal(await page.locator('[data-cart-count]').innerText(),'1');await page.locator('[data-close-cart]').click();
 await page.locator('[data-catalog-back]').click();await count(1);await page.reload();await count(1);
 await page.locator('[data-clear-filters]').click();await count(8);await page.locator('[data-product="vaso-areia"] h3 a').click();assert.equal(await page.locator('[data-catalog-back]').getAttribute('href'),'catalogo.html');
 await page.locator('[data-color="Argila"]').click();await page.locator('[data-size="G"]').click();await page.locator('[data-detail-add]').click();assert.equal(await page.locator('[data-cart-total]').innerText(),'R$ 265,00');assert.ok((await page.locator('[data-cart-items]').innerText()).includes('Argila · G'));await page.locator('[data-close-cart]').click();
 await page.locator('[data-catalog-back]').click();await count(8);
 for(let i=0;i<6;i++){await page.locator('[data-fav="vaso-areia"]').click();assert.equal(await page.locator('[data-fav="vaso-areia"]').innerText(),i%2===0?'♥':'♡');}
 await page.locator('[data-filter="cat"]').selectOption('banho');await page.locator('[data-filter="material"]').selectOption('madeira');await count(0);
 await page.goBack();await count(2);assert.equal(await page.locator('[data-filter="material"]').inputValue(),'');await page.goForward();await count(0);
 await page.locator('[data-clear-filters]').click();await count(8);await page.goBack();await count(0);await page.goForward();await count(8);
 await page.locator('[data-search]').fill('ceramica');await count(1);await page.locator('[data-fav="vaso-areia"]').click();await count(1);assert.equal(await page.locator('[data-search]').inputValue(),'ceramica');await page.reload();assert.equal(await page.locator('[data-fav="vaso-areia"]').innerText(),'♥');await page.locator('[data-clear-filters]').click();
 log.push('PASS: category URL/select, price exact IDs, materials, combined empty, search/clear, reload, detail return after clear, repeated favorite clicks, Back/Forward, variants/cart quantity/totals.');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  for(const theme of ['light','dark']){
   await page.emulateMedia({colorScheme:theme});await page.evaluate(()=>localStorage.removeItem('nativa-theme'));await page.reload();
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);await count(8);
   assert.ok(await page.locator('[data-clear-filters]').isVisible());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${theme}`);
   await page.locator('[data-filter="cat"]').selectOption('banho');await count(2);
   await page.locator('[data-clear-filters]').click();await count(8);
   await page.screenshot({path:`/tmp/nativa-${width}-${theme}.png`,fullPage:true});
  }
  log.push(`PASS: ${width}px light/dark/system initial, filters/clear, no horizontal overflow.`);
 }
 await page.goto(base);assert.ok(await page.locator('.brand').isVisible());await page.locator('a[href="catalogo.html?cat=banho"]').click();await count(2);
 await page.goto('http://127.0.0.1:8767/portfolio/');await page.locator('a[href="catalogo.html?cat=banho"]').click();await count(2);await page.locator('[data-clear-filters]').click();await page.locator('[data-product="vaso-areia"] h3 a').click();await page.locator('[data-catalog-back]').click();await count(8);assert.equal(new URL(page.url()).pathname,'/portfolio/catalogo.html');assert.equal(new URL(page.url()).search,'');
 await page.goto(base+'produto.html?id=vaso-areia&catalog='+encodeURIComponent('cat=evil&redirect=https://evil.example'));assert.equal(await page.locator('[data-catalog-back]').getAttribute('href'),'catalogo.html');
 log.push('PASS: root / and /portfolio/ home/category/detail navigation, return query after clear, unsafe query sanitation.');
 // Toggle by real click, verify keyboard access and focus.
 await page.goto(base+'catalogo.html');const before=await page.locator('html').getAttribute('data-theme');await page.locator('[data-theme-toggle]').click();assert.notEqual(await page.locator('html').getAttribute('data-theme'),before);await page.locator('[data-filter="cat"]').focus();await page.keyboard.press('b');await page.keyboard.press('Enter');await page.locator('[data-clear-filters]').focus();await page.keyboard.press('Enter');await count(8);
 log.push('PASS: theme toggle, keyboard focus/clear.');
 log.push('LOCAL HTTP failures: '+JSON.stringify(http));log.push('Console/page errors: '+JSON.stringify(errors));
 fs.writeFileSync('/tmp/nativa-browser.log',log.join('\n')+'\n');console.log(log.join('\n'));assert.deepEqual(http,[]);assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

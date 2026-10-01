const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},location:{search:''},URLSearchParams,console});
vm.runInContext(fs.readFileSync(path.join(root,'nativa-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'nativa-app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
const ids=query=>Array.from(run(`catalogProducts(catalogFromQuery(${JSON.stringify(query)})).map(p=>p.id)`));
test('category, price, materials, combinations and clear',()=>{
 assert.equal(ids('').length,8);
 assert.deepEqual(ids('cat=banho'),['toalha-folha','oleo-corpo']);
 assert.deepEqual(ids('price=under100'),['vela-terra','oleo-corpo']);
 assert.deepEqual(ids('material=madeira'),['cadeira-linha']);
 assert.deepEqual(ids('material=ceramica'),['vaso-areia']);
 assert.deepEqual(ids('material=algodao'),['toalha-folha']);
 assert.deepEqual(ids('cat=banho&material=madeira&q=toalha'),[]);
 assert.deepEqual(ids('cat=banho&price=under100&q=oleo'),['oleo-corpo']);
 assert.equal(run('catalogProducts(catalogDefaults()).length'),8);
});
test('accent-insensitive search includes readable category labels',()=>{
 assert.deepEqual(ids('q=decora%C3%A7%C3%A3o'),['vaso-areia','bandeja-pedra']);
 assert.deepEqual(ids('q=ceramica'),['vaso-areia']);
 assert.deepEqual(ids('material=madeira&q=madeira'),['cadeira-linha']);
});
test('URL state is canonical and rejects invalid filters or unsafe return targets',()=>{
 const q='cat=banho&price=under100&stock=all&q=%C3%93leo';
 assert.equal(run(`catalogQuery(catalogFromQuery(${JSON.stringify(q)})).toString()`),q);
 assert.equal(run("catalogQuery(catalogFromQuery('cat=unknown&price=bad&material=bad&stock=bad&redirect=https://evil.example')).toString()"),'');
 assert.equal(run("catalogQuery(catalogDefaults()).toString()"),'');
 assert.equal(run("catalogFromQuery('q='+ 'a'.repeat(300)).q.length"),200);
});
test('stock and price boundaries apply to current price',()=>{
 run("D.products.push({id:'boundary',name:'Boundary',desc:'',category:'casa',price:100,stock:0})");
 assert.ok(!ids('price=under100').includes('boundary'));
 assert.ok(ids('price=under100&stock=all').includes('boundary'));
 assert.ok(!ids('price=100to300&stock=all').includes('boundary'));
 run('D.products.pop()');
});
test('render, controls, search, clear, history and favorite synchronize state',()=>{
 run(`
 const nodes={grid:{innerHTML:''},count:{textContent:''},clear:{},search:{value:''},filters:['cat','price','material','stock'].map(key=>({dataset:{filter:key},value:''})),fav:{dataset:{fav:'vaso-areia'}}};
 const listeners={},saved={};
 document.querySelector=s=>({'[data-catalog]':nodes.grid,'[data-result-count]':nodes.count,'[data-clear-filters]':nodes.clear}[s]||null);
 document.querySelectorAll=s=>({'[data-filter]':nodes.filters,'[data-search]':[nodes.search],'[data-fav]':[nodes.fav]}[s]||[]);
 window.addEventListener=(event,handler)=>listeners[event]=handler;
 globalThis.localStorage={getItem:key=>saved[key]||null,setItem:(key,value)=>saved[key]=value};
 location.pathname='/portfolio/catalogo.html';location.hash='';location.search='?cat=banho';
 globalThis.history={pushState:(_,__,url)=>{location.search=url.includes('?')?'?'+url.split('?')[1]:''},replaceState:(_,__,url)=>history.pushState(_,__,url)};
 catalogState=catalogFromQuery(location.search);renderCatalog();initCatalog();initSearch();
 `);
 assert.equal(run('nodes.count.textContent'),'2 produtos');
 assert.equal(run('nodes.filters[0].value'),'banho');
 run("nodes.filters[1].value='under100';nodes.filters[1].onchange();nodes.search.value='oleo';nodes.search.oninput()");
 assert.equal(run('nodes.count.textContent'),'1 produto');
 assert.equal(run("productHref('oleo-corpo')"),'produto.html?id=oleo-corpo&catalog=cat%3Dbanho%26price%3Dunder100%26q%3Doleo');
 run('nodes.clear.onclick()');
 assert.equal(run('nodes.count.textContent'),'8 produtos');
 assert.equal(run('location.search'),'');
 assert.equal(run("productHref('vaso-areia')"),'produto.html?id=vaso-areia');
 run("location.search='?cat=banho&material=madeira';listeners.popstate()");
 assert.equal(run('nodes.count.textContent'),'0 produtos');
 assert.ok(run("nodes.grid.innerHTML.includes('Nenhum produto encontrado')"));
 run("location.search='?cat=banho';listeners.pageshow()");
 assert.equal(run('nodes.count.textContent'),'2 produtos');
 run("nodes.clear.onclick();nodes.search.value='ceramica';nodes.search.oninput()");
 for(let i=0;i<6;i++){
  run('bindProducts();bindProducts();nodes.fav.onclick({preventDefault(){}})');
  assert.equal(run("favs().includes('vaso-areia')"),i%2===0);
  assert.equal(run("nodes.grid.innerHTML.includes('>♥</button>')"),i%2===0);
  assert.equal(run('nodes.count.textContent'),'1 produto');
  assert.equal(run('nodes.search.value'),'ceramica');
 }
});
test('detail return accepts catalog state only and never external target',()=>{
 run("const back={};document.querySelector=s=>s==='[data-catalog-back]'?back:null;location.search='?id=oleo-corpo&catalog='+encodeURIComponent('cat=banho&q=oleo&redirect=https://evil.example');initCatalogBack()");
 assert.equal(run('back.href'),'catalogo.html?cat=banho&q=oleo');
 run("location.search='?id=oleo-corpo&catalog='+encodeURIComponent('cat=unknown&redirect=//evil.example');initCatalogBack()");
 assert.equal(run('back.href'),'catalogo.html');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {products,categories} from '../dist/catalog.mjs';
import {filterProducts,addToCart,setQuantity,cartTotal,cleanCart,routeFromHash,validateCatalog,brandsIn,kindsIn,orderMessage,whatsappUrl,normalize} from '../dist/core.mjs';
import {homeView,collectionView,productView,cartView,productCard,esc} from '../dist/ui.mjs';
import {sizeGrids} from '../dist/store-config.mjs';
const shoe=products.find(p=>p.id==='on-cloudsurfer'),polo=products.find(p=>p.id==='rl-polo'),cap=products.find(p=>p.id==='rl-cap');
const filters={category:'todos',query:'',brand:'',kind:'',sort:'featured'};
const root=path.resolve(import.meta.dirname,'../dist');
const manifest=JSON.parse(fs.readFileSync(new URL('../catalog-import-manifest.json',import.meta.url),'utf8'));
test('Importação elimina três PDFs idênticos e cobre todos os 742 originais',()=>{
 assert.equal(manifest.input_files,16);assert.equal(manifest.unique_files,13);assert.equal(manifest.duplicate_files.length,3);assert.equal(manifest.pages,742);
 const keys=new Set(products.flatMap(p=>p.sources.map(s=>s.file+':'+s.page)));assert.equal(keys.size,742);
 for(const s of manifest.sources){const pages=[...new Set(products.flatMap(p=>p.sources).filter(x=>x.file===s.name).map(x=>x.page))].sort((a,b)=>a-b);assert.deepEqual(pages,Array.from({length:s.pages},(_,i)=>i+1))}
 const photos=products.flatMap(p=>p.gallery.map(g=>g.image));assert.equal(new Set(photos).size,photos.length);
 assert.equal(photos.length+manifest.photo_review.near_duplicate_frames_removed.length,1033);
 for(const p of products){const own=new Set(p.sources.map(s=>s.file+':'+s.page));assert.ok(p.gallery.every(g=>own.has(g.source+':'+g.page)))}
});
test('Catálogo sem marcas fictícias, sem duplicados e com IDs únicos',()=>{
 assert.equal(validateCatalog(products).length,products.length);assert.equal(products.length,manifest.product_groups);
 assert.equal(new Set(products.map(p=>p.id)).size,products.length);
 assert.ok(products.every(p=>!/^L&T/.test(p.brand)&&!p.demo));
 const names=products.map(p=>normalize(p.name));assert.equal(new Set(names).size,names.length);
 for(const c of categories.slice(1))assert.ok(products.some(p=>p.category===c.id));assert.ok(!categories.some(c=>c.id==='relogios'));
});
test('Títulos têm tipo de peça e marca; não inventam preço, estoque ou composição',()=>{
 for(const p of products){const brand=p.brand==='Polo Ralph Lauren'?/Ralph Lauren/:new RegExp(p.brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));assert.match(p.name,brand,p.id);assert.ok(p.name.startsWith(p.kind),p.id);assert.equal(p.price,null);assert.equal(p.stock,null);assert.match(p.fit,/confirmar/);assert.match(productCard(p,[]),/Sob consulta/);assert.doesNotMatch(productCard(p,[]),/R\$\s*0/)}
});
test('Cada produto tem cores; as fotos de cada cor pertencem à galeria',()=>{
 for(const p of products){assert.ok(p.colors.length,p.id);const gallery=new Set(p.gallery.map(g=>g.image));for(const c of p.colors){assert.match(c.hex,/^#[0-9a-f]{6}$/i);c.images.forEach(i=>assert.ok(gallery.has(i),p.id+' '+c.name))}assert.equal(new Set(p.colors.map(c=>c.name)).size,p.colors.length)}
 assert.ok(products.filter(p=>p.colors.length>1&&p.colors.some(c=>c.images.length)).length>=90);
});
test('Tamanhos selecionáveis por tipo de peça, sem "a confirmar"',()=>{
 for(const p of products){assert.ok(p.sizes.length);assert.ok(!p.sizes.includes('A confirmar'))}
 assert.deepEqual(cap.sizes,['Tamanho único']);assert.deepEqual(polo.sizes,sizeGrids.roupa);assert.deepEqual(shoe.sizes,sizeGrids.calcado);
 assert.deepEqual(products.find(p=>p.kind==='Calça jeans').sizes,sizeGrids.jeans);
});
test('Marcas e tipos do filtro acompanham a categoria',()=>{
 for(const c of ['roupas','tenis','acessorios']){const b=brandsIn(products,c);assert.ok(b.length);for(const brand of b)assert.ok(filterProducts(products,{category:c,brand}).length,c+' '+brand);assert.deepEqual(b,[...new Set(products.filter(p=>p.category===c).map(p=>p.brand))].sort((x,y)=>x.localeCompare(y,'pt-BR')))}
 assert.ok(!brandsIn(products,'tenis').includes('Prada'));assert.ok(!brandsIn(products,'acessorios').includes('Hermès'));
 assert.ok(kindsIn(products,'tenis','Birkenstock').every(k=>['Clog','Sandália'].includes(k)));
 const r=filterProducts(products,{brand:'Polo Ralph Lauren',category:'roupas',kind:'Polo'});assert.ok(r.length);assert.ok(r.every(p=>p.brand==='Polo Ralph Lauren'&&p.kind==='Polo'&&p.category==='roupas'));
});
test('Busca por tipo, marca e modelo ignora maiúsculas e acentos',()=>{
 for(const q of ['TENIS','tênis on','polo lacoste','HERMES ORAN','ami de coeur','Cœur','calca jeans prada','boné','super-star','Birkenstock Arizona'])assert.ok(filterProducts(products,{query:q}).length,q);
 assert.deepEqual(filterProducts(products,{query:'hermes'}).map(p=>p.id),filterProducts(products,{query:'Hermès'}).map(p=>p.id));
 assert.ok(filterProducts(products,{query:'Ralph Lauren'}).every(p=>p.brand==='Polo Ralph Lauren'));assert.equal(filterProducts(products,{query:'zz-produto-inexistente'}).length,0);
});
test('Sacola exige cor e tamanho, atualiza quantidades e remove itens',()=>{
 assert.throws(()=>addToCart([],polo,{size:'M'}),/cor/);assert.throws(()=>addToCart([],polo,{color:'Preto'}),/tamanho/);assert.throws(()=>addToCart([],polo,{size:'99',color:'Preto'}),/tamanho/);assert.throws(()=>addToCart([],polo,{size:'M',color:'Roxo'}),/cor/);
 let cart=addToCart([],polo,{size:'M',color:'Azul-marinho'});cart=addToCart(cart,polo,{size:'M',color:'Preto'});cart=addToCart(cart,polo,{size:'M',color:'Azul-marinho'});
 assert.equal(cart.length,2);assert.equal(cart[0].quantity,2);
 cart=setQuantity(cart,products,{id:polo.id,size:'M',color:'Preto'},3);assert.equal(cart[1].quantity,3);assert.equal(cart[1].color,'Preto');
 cart=addToCart(cart,cap,{color:'Vermelho'});assert.equal(cart[2].size,'Tamanho único');
 cart=setQuantity(cart,products,{id:polo.id,size:'M',color:'Azul-marinho'},0);assert.equal(cart.length,2);
 for(const q of [0,-1,1.1,NaN])assert.throws(()=>addToCart([],cap,{color:'Preto'},q));assert.throws(()=>addToCart([],cap,{color:'Preto'},21),/limite/);
});
test('Mensagem do WhatsApp traz produto, quantidade, cor, tamanho, valores e total',()=>{
 let cart=addToCart([],polo,{size:'G',color:'Branco'},2);cart=addToCart(cart,cap,{color:'Preto'});
 const msg=orderMessage(cart,products);for(const t of [polo.name,cap.name,'Quantidade: 2','Cor: Branco | Tamanho: G','Cor: Preto | Tamanho: Tamanho único','Valor unitário: Sob consulta','Subtotal: Sob consulta','Total do pedido: Sob consulta','Itens: 3'])assert.ok(msg.includes(t),t);
 const priced=[{...polo,price:300},{...cap,price:150}];const m2=orderMessage(cart,priced);assert.match(m2,/Valor unitário: R\$\s*300,00/);assert.match(m2,/Subtotal: R\$\s*600,00/);assert.match(m2,/Total do pedido: R\$\s*750,00/);assert.equal(cartTotal(cart,priced),750);
 assert.match(orderMessage(cart,[{...polo,price:300},cap]),/Total do pedido: R\$\s*600,00 \+ 1 item sob consulta/);
 const url=whatsappUrl('55 (11) 98765-4321',msg);assert.ok(url.startsWith('https://wa.me/5511987654321?text='));assert.equal(decodeURIComponent(url.split('text=')[1]),msg);
 const html=cartView(cart,products);assert.match(html,/Finalizar pedido no WhatsApp/);assert.match(html,/href="https:\/\/wa\.me\//);assert.match(html,/Cor: Branco · Tamanho: G/);assert.doesNotMatch(html,/R\$\s*0/);
});
test('Restauração de sacola ignora produtos apagados e linhas sem cor ou tamanho válidos',()=>{
 assert.deepEqual(cleanCart([{id:polo.id,size:'M',color:'Preto',quantity:2},{id:'apagado',size:'M',quantity:1},{id:polo.id,size:'A confirmar',quantity:1},{id:polo.id,size:'M',quantity:1},{id:polo.id,size:'M',color:'Preto',quantity:-1}],products),[{id:polo.id,size:'M',color:'Preto',quantity:2}]);assert.deepEqual(cleanCart({},products),[]);
});
test('Favoritos e rotas diretas funcionam',()=>{
 assert.deepEqual(filterProducts(products,{favoritesOnly:true,favorites:[shoe.id]}).map(p=>p.id),[shoe.id]);assert.deepEqual(routeFromHash('#/produto/on-cloudsurfer'),{type:'product',id:'on-cloudsurfer'});assert.deepEqual(routeFromHash('#/colecao/todos?q=Ralph%20Lauren'),{type:'collection',category:'todos',query:'Ralph Lauren'});assert.deepEqual(routeFromHash('#/favoritos'),{type:'favorites'});assert.doesNotThrow(()=>routeFromHash('#/produto/%invalid'));
});
test('Páginas de produto mostram galeria, cores e tamanhos selecionáveis',()=>{
 for(const p of products){const html=productView(p,products,[]);assert.ok(html.includes(esc(p.name)));assert.match(html,/Adicionar à sacola/);assert.match(html,/FOTOS ORIGINAIS DO CATÁLOGO/);assert.equal([...html.matchAll(/data-action="color"/g)].length,p.colors.length);assert.equal([...html.matchAll(/data-action="size"/g)].length,p.sizes.length);assert.doesNotMatch(html,/a confirmar<\/span>|Tamanhos a confirmar/);assert.equal([...html.matchAll(/data-action="gallery"/g)].length,p.gallery.length);for(const g of p.gallery){assert.ok(html.includes(g.thumbnail));assert.ok(fs.existsSync(path.join(root,g.image)))}}
});
test('Homepage aponta para produtos e categorias existentes',()=>{
 const html=homeView(products,[]);for(const m of html.matchAll(/#\/produto\/([a-z0-9-]+)/g))assert.ok(products.some(p=>p.id===m[1]),m[1]);for(const c of categories.slice(1))assert.ok(html.includes('#/colecao/'+c.id));assert.doesNotMatch(html,/relogios|Relógios/);
 assert.match(html,/coastal-cover.jpeg/);assert.match(html,/ESSÊNCIA/);
});
test('Coleção pagina em 24 itens e tem só os filtros de marca e tipo',()=>{
 const html=collectionView(products,filters,[],{all:products});assert.equal([...html.matchAll(/<article class="product-card">/g)].length,24);assert.match(html,/id="load-more"/);for(const attr of ['brand','kind'])assert.equal([...html.matchAll(new RegExp('name="'+attr+'"','g'))].length,2);for(const attr of ['source','size','maxPrice','available'])assert.doesNotMatch(html,new RegExp('name="'+attr+'"'));const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 const tenis=collectionView(filterProducts(products,{category:'tenis'}),{...filters,category:'tenis'},[],{all:products});assert.doesNotMatch(tenis,/value="Prada"/);assert.match(tenis,/value="Birkenstock"/);
});
test('Cards têm moldura única e usam a foto original de capa',()=>{
 for(const p of products){const html=productCard(p,[]);assert.match(html,/fit-cover/,p.id);const r=p.imageWidth/p.imageHeight;assert.ok(r>.7&&r<1.8,p.id);assert.ok(p.gallery.some(g=>g.image===p.image))}
 const css=fs.readFileSync(path.join(root,'editorial.css'),'utf8');assert.match(css,/\.product-image\{position:relative;aspect-ratio:8\/7/);
});
test('Editor aceita campos pendentes e rejeita galerias e valores inseguros',()=>{
 const p=validateCatalog([{...cap,price:120,stock:4}])[0];assert.equal(cartTotal(addToCart([],p,{color:'Preto'},2),[p]),240);
 for(const change of [{price:-1},{stock:1.5},{image:'javascript:alert(1)'},{gallery:[{image:'javascript:bad()',thumbnail:shoe.image,label:'x'}]},{hex:'red'},{sizes:[]},{colors:[{}]}])assert.throws(()=>validateCatalog([{...shoe,...change}]));assert.throws(()=>validateCatalog([shoe,shoe]));
});
test('Texto inserido é escapado e galeria não injeta HTML',()=>{
 assert.equal(esc('<script>"x" &'),'&lt;script&gt;&quot;x&quot; &amp;');assert.ok(productCard({...shoe,name:'<img onerror="bad()">'},[]).includes('&lt;img'));assert.ok(productView({...shoe,colors:[{name:'<b>x</b>',hex:'#000000',images:[]}]},products,[]).includes('&lt;b&gt;'));
});
test('Pacote tem todas as fotos; site privado e sem envio de dados além do link do WhatsApp',()=>{
 for(const p of products)assert.ok(fs.statSync(path.join(root,p.image)).size>1000);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/noindex,nofollow,noarchive/);assert.doesNotMatch(html,/relogios/);
 for(const f of ['app.mjs','ui.mjs','core.mjs']){const js=fs.readFileSync(path.join(root,f),'utf8');assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|mailto:|api\.whatsapp|\bstripe\b/i.test(js),f)}
 const config=fs.readFileSync(path.join(root,'store-config.mjs'),'utf8');assert.match(config,/export const whatsapp = '\d*';/);
});
test('Fotografias da vitrine usam os arquivos originais, sem miniatura nem recompressão',()=>{
 const quality=JSON.parse(fs.readFileSync(new URL('../image-quality.json',import.meta.url),'utf8'));
 assert.equal(quality.original_count,1033);assert.ok(quality.original_bytes>160_000_000);
 for(const p of products){assert.match(p.image,/^assets\/originals\//);assert.doesNotMatch(p.image,/-thumb|-sm/);for(const g of p.gallery){const name=path.basename(g.image),entry=quality.photos[name];assert.ok(entry);const bytes=fs.readFileSync(path.join(root,g.image));assert.equal(bytes.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256)}}
});

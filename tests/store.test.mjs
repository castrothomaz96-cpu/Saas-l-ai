import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {products,categories,brands} from '../dist/catalog.mjs';
import {filterProducts,addToCart,setQuantity,cartTotal,cleanCart,routeFromHash,validateCatalog,money} from '../dist/core.mjs';
import {homeView,collectionView,productView,cartView,productCard,esc} from '../dist/ui.mjs';
const imported=products.filter(p=>!p.demo),demo=products.filter(p=>p.demo),shoe=products.find(p=>p.id==='on-white');
const filters={category:'todos',query:'',maxPrice:1500,size:'',available:false,sort:'featured'};
const root=path.resolve(import.meta.dirname,'../dist');
const manifest=JSON.parse(fs.readFileSync(new URL('../catalog-import-manifest.json',import.meta.url),'utf8'));
test('Importação elimina três PDFs idênticos e cobre todos os 742 originais',()=>{
 assert.equal(manifest.input_files,16);assert.equal(manifest.unique_files,13);assert.equal(manifest.duplicate_files.length,3);assert.equal(manifest.pages,742);
 // Uma página pode ter fotos de dois modelos; cada página precisa estar representada e cada foto, em um só produto.
 const keys=new Set(imported.flatMap(p=>p.sources.map(s=>s.file+':'+s.page)));assert.equal(keys.size,742);
 for(const s of manifest.sources){const pages=[...new Set(imported.flatMap(p=>p.sources).filter(x=>x.file===s.name).map(x=>x.page))].sort((a,b)=>a-b);assert.deepEqual(pages,Array.from({length:s.pages},(_,i)=>i+1))}
 const photos=imported.flatMap(p=>p.gallery.map(g=>g.image));assert.equal(new Set(photos).size,photos.length);
 assert.equal(photos.length+manifest.photo_review.near_duplicate_frames_removed.length,1033);
 for(const p of imported){const own=new Set(p.sources.map(s=>s.file+':'+s.page));assert.ok(p.gallery.every(g=>own.has(g.source+':'+g.page)))}
});
test('Todos os grupos e os três exemplos possuem ID único e dados válidos',()=>{
 assert.equal(validateCatalog(products).length,products.length);assert.equal(imported.length,manifest.product_groups);assert.equal(demo.length,3);assert.ok(imported.length>100);
 assert.equal(new Set(products.map(p=>p.id)).size,products.length);for(const c of categories.slice(1))assert.ok(products.some(p=>p.category===c.id));
});
test('Produtos importados não inventam preço, grade, composição ou estoque',()=>{
 for(const p of imported){assert.equal(p.price,null);assert.equal(p.stock,null);assert.deepEqual(p.sizes,['A confirmar']);assert.ok(p.gallery.length);assert.match(p.fit,/confirmar/);assert.match(productCard(p,[]),/Sob consulta/);assert.doesNotMatch(productCard(p,[]),/R\$\s*0/)}
});
test('Marca, tipo, categoria e origem se combinam sem perder fotos reais',()=>{
 const r=filterProducts(products,{brand:'Polo Ralph Lauren',category:'roupas',kind:'Polo',source:'catalog'});assert.ok(r.length);assert.ok(r.every(p=>p.brand==='Polo Ralph Lauren'&&p.name.startsWith('Polo')&&p.category==='roupas'&&!p.demo));
 assert.equal(filterProducts(products,{source:'demo'}).length,3);assert.equal(filterProducts(products,{source:'catalog'}).length,imported.length);
});
test('Busca ignora acento, pesquisa marcas e preserva estado vazio',()=>{
 assert.ok(filterProducts(products,{query:'TENIS'}).length>20);assert.ok(filterProducts(products,{query:'Ralph Lauren'}).every(p=>p.brand==='Polo Ralph Lauren'));assert.equal(filterProducts(products,{query:'zz-produto-inexistente'}).length,0);
});
test('Preço padrão inclui sob consulta, limite ativo exclui valores pendentes',()=>{
 assert.equal(filterProducts(products,{maxPrice:1500}).length,products.length);
 const priced=filterProducts(products,{maxPrice:800});assert.ok(priced.length);assert.ok(priced.every(p=>p.price!==null&&p.price<=800));
 assert.equal(filterProducts(products,{size:'A confirmar'}).length,imported.length);assert.ok(filterProducts(products,{available:true}).every(p=>p.stock>0));
});
test('Ordenação de preço mantém sob consulta ao final e não modifica original',()=>{
 const ids=products.map(p=>p.id);for(const sort of ['price-asc','price-desc']){const r=filterProducts(products,{sort});assert.ok(r.slice(0,demo.length).every(p=>p.price!==null));assert.ok(r.slice(demo.length).every(p=>p.price===null));for(let i=1;i<demo.length;i++)assert.ok(sort==='price-asc'?r[i].price>=r[i-1].price:r[i].price<=r[i-1].price)}assert.deepEqual(products.map(p=>p.id),ids);
});
test('Seleção sob consulta permite adicionar, alterar, revisar e remover sem total zero',()=>{
 let cart=addToCart([],shoe,'A confirmar');cart=setQuantity(cart,products,shoe.id,'A confirmar',2);assert.equal(cart[0].quantity,2);
 const html=cartView(cart,products,'review');assert.match(html,/Valores pendentes/);assert.match(html,/Sob consulta/);assert.doesNotMatch(html,/R\$\s*0/);assert.match(html,/Concluir simulação/);
 cart=addToCart(cart,demo[0],demo[0].sizes[0]);assert.equal(cartTotal(cart,products),demo[0].price);assert.match(cartView(cart,products),/Valores pendentes/);
 cart=setQuantity(cart,products,shoe.id,'A confirmar',0);assert.equal(cart.length,1);assert.match(cartView(cart,products),/Subtotal/);
});
test('Seleção preserva validação de tamanho, quantidade e estoque conhecido',()=>{
 assert.throws(()=>addToCart([],shoe,''),/tamanho/);assert.throws(()=>addToCart([],shoe,'99'),/tamanho/);assert.throws(()=>addToCart([],shoe,'A confirmar',100),/limite/);
 for(const q of [0,-1,1.1,NaN])assert.throws(()=>addToCart([],shoe,'A confirmar',q));const p=demo[0];const cart=addToCart([],p,p.sizes[0],p.stock);assert.throws(()=>addToCart(cart,p,p.sizes[0]),/limite/);assert.throws(()=>addToCart([],{...p,stock:0},p.sizes[0]));
});
test('Restauração de sacola ignora produtos apagados e dados inválidos',()=>{
 assert.deepEqual(cleanCart([{id:shoe.id,size:'A confirmar',quantity:2},{id:'apagado',size:'M',quantity:1},{id:shoe.id,size:'99',quantity:1},{id:shoe.id,size:'A confirmar',quantity:-1}],products),[{id:shoe.id,size:'A confirmar',quantity:2}]);assert.deepEqual(cleanCart({},products),[]);
});
test('Favoritos e rotas diretas funcionam nos novos produtos',()=>{
 assert.deepEqual(filterProducts(products,{favoritesOnly:true,favorites:[shoe.id]}).map(p=>p.id),[shoe.id]);assert.deepEqual(routeFromHash('#/produto/on-white'),{type:'product',id:'on-white'});assert.deepEqual(routeFromHash('#/colecao/todos?q=Ralph%20Lauren'),{type:'collection',category:'todos',query:'Ralph Lauren'});assert.deepEqual(routeFromHash('#/favoritos'),{type:'favorites'});assert.doesNotThrow(()=>routeFromHash('#/produto/%invalid'));
});
test('Páginas usam galerias reais, miniaturas e disponibilidade pendente',()=>{
 for(const p of imported){const html=productView(p,products,[]);assert.ok(html.includes(esc(p.name)));assert.match(html,/Disponibilidade a confirmar/);assert.match(html,/Adicionar à seleção/);assert.match(html,/FOTOS ORIGINAIS DO CATÁLOGO/);assert.ok(!/data-action="add-cart"[^>]*disabled/.test(html));assert.equal([...html.matchAll(/data-action="gallery"/g)].length,p.gallery.length);for(const g of p.gallery){assert.ok(html.includes(g.thumbnail));assert.ok(fs.existsSync(path.join(root,g.image)))}}
});
test('Homepage e categorias não apontam para demonstrações removidas',()=>{
 const html=homeView(products,[]);assert.match(html,/#\/produto\/on-white/);assert.doesNotMatch(html,/Cloud Form/);for(const c of categories.slice(1))assert.ok(html.includes('#/colecao/'+c.id));for(const f of ['catalog-hero.webp','catalog-roupas.webp','catalog-tenis.webp','catalog-acessorios.webp'])assert.ok(fs.existsSync(path.join(root,'assets',f)));
});
test('Coleção pagina em 24 itens e possui filtros nos dois layouts',()=>{
 const html=collectionView(products,filters,[]);assert.equal([...html.matchAll(/<article class="product-card">/g)].length,24);assert.match(html,/id="load-more"/);for(const attr of ['brand','kind','source','size','maxPrice','available'])assert.equal([...html.matchAll(new RegExp('name="'+attr+'"','g'))].length,2);for(const brand of brands)assert.ok(html.includes(esc(brand)));const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
});
test('Editor aceita campos pendentes e rejeita galerias e valores inseguros',()=>{
 const p=validateCatalog([{...shoe,price:399,stock:4,sizes:['40','41']}])[0];assert.equal(cartTotal(addToCart([],p,'40',2),[p]),798);
 for(const change of [{price:-1},{stock:1.5},{image:'javascript:alert(1)'},{gallery:[{image:'javascript:bad()',thumbnail:shoe.image,label:'x'}]},{hex:'red'},{sizes:[]}])assert.throws(()=>validateCatalog([{...shoe,...change}]));assert.throws(()=>validateCatalog([shoe,shoe]));
});
test('Texto inserido é escapado e galeria não injeta HTML',()=>{
 assert.equal(esc('<script>"x" &'),'&lt;script&gt;&quot;x&quot; &amp;');assert.ok(productCard({...shoe,name:'<img onerror="bad()">'},[]).includes('&lt;img'));assert.ok(productView({...shoe,gallery:[{image:shoe.image,thumbnail:shoe.image,label:'<svg onload="bad()">'}]},products,[]).includes('&lt;svg'));
});
test('Pacote tem todas as fotos e mantém site privado com navegação local',()=>{
 for(const p of products)assert.ok(fs.statSync(path.join(root,p.image)).size>1000);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/noindex,nofollow,noarchive/);const app=fs.readFileSync(path.join(root,'app.mjs'),'utf8');assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|window\.open|mailto:|api\.whatsapp|stripe/i.test(app));assert.match(app,/lt-catalog-v2/);
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/object-fit:contain/);assert.match(css,/\[hidden\]\{display:none!important\}/);
});

test('Fotografias da vitrine usam os arquivos originais, sem miniatura nem recompressão',()=>{
 const quality=JSON.parse(fs.readFileSync(new URL('../image-quality.json',import.meta.url),'utf8'));
 assert.equal(quality.original_count,1033);assert.ok(quality.original_bytes>160_000_000);
 for(const p of imported){assert.match(p.image,/^assets\/originals\//);assert.doesNotMatch(p.image,/-thumb|-sm/);if(p.category==='roupas'){assert.ok(p.imageWidth>=700);assert.ok(p.imageHeight>=700)}else{assert.ok(p.imageWidth>100);assert.ok(p.imageHeight>100)}for(const g of p.gallery){const name=path.basename(g.image),entry=quality.photos[name];assert.ok(entry);const bytes=fs.readFileSync(path.join(root,g.image));assert.equal(bytes.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256)}}
});
test('Galerias apresentam fotografias individuais, navegação e ampliação',()=>{
 for(const p of imported){const html=productView(p,products,[]);assert.match(html,/FOTOS ORIGINAIS DO CATÁLOGO/);assert.match(html,/data-action="gallery-prev"/);assert.match(html,/data-action="gallery-next"/);assert.match(html,/Ampliar fotografia original/);assert.equal([...html.matchAll(/data-action="gallery"/g)].length,p.gallery.length)}
});
test('Capa do litoral e seleção de verão aparecem na página inicial',()=>{
 const html=homeView(products,[]);assert.match(html,/coastal-cover.jpeg/);assert.match(html,/SUMMER EDIT/);assert.match(html,/Dias de sol/);assert.match(html,/ESSÊNCIA/);assert.doesNotMatch(html,/Cloud Form/);
 const css=fs.readFileSync(path.join(root,'editorial.css'),'utf8');assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/--navy:#07111f/);assert.match(css,/font-family:Club Sans/);
 const first=html.slice(html.indexOf('club-edit'),html.indexOf('wardrobe-chapters'));for(const id of ['rl-polo','rl-short','lv-polo','burberry-tee-emblem'])assert.ok(first.includes('#/produto/'+id));
});

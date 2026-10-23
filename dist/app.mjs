import {products as defaultProducts,brand,categories} from './catalog.mjs?v=5';
import {filterProducts,addToCart,setQuantity,cartTotal,cleanCart,routeFromHash,validateCatalog,money} from './core.mjs?v=5';
import {esc,icon,homeView,collectionView,productView,productCard,cartView,emptyResults,fitClass} from './ui.mjs?v=5';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('O navegador não permitiu salvar. As alterações continuam nesta sessão.')}}
let products=defaultProducts;
try{const local=readLocal('lt-catalog-v2',null);if(local)products=validateCatalog(local).map(p=>{const fresh=defaultProducts.find(x=>x.id===p.id);return fresh&&p.image?.startsWith('assets/catalog/')?{...p,image:fresh.image,gallery:fresh.gallery,imageWidth:fresh.imageWidth,imageHeight:fresh.imageHeight}:p})}catch{}
let cart=cleanCart(readLocal('lt-cart-v1',[]),products);
let favorites=readLocal('lt-favorites-v1',[]);
if(!Array.isArray(favorites))favorites=[];
favorites=favorites.filter(id=>products.some(p=>p.id===id));
let route=routeFromHash(location.hash);
let filters={category:'todos',query:'',maxPrice:1500,size:'',available:false,sort:'featured'};
let selectedSize='';
let selectedPhoto=0;
let visibleCount=24;
let toastTimer;
let renderTimer;
const main=$('#main');
function paintIcons(root=document){$$('[data-icon]',root).forEach(el=>{const count=el.querySelector('.bag-count');el.innerHTML=icon(el.dataset.icon);if(count)el.append(count)})}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3400)}
function showDialog(id){const d=$('#'+id);if(!d)return;$$('dialog[open]').forEach(other=>{if(other!==d)other.close()});if(!d.open)d.showModal();document.body.classList.add('has-dialog')}
function closeDialogs(){$$('dialog[open]').forEach(d=>d.close());document.body.classList.remove('has-dialog')}
function updateCartBadge(){const count=cart.reduce((s,l)=>s+l.quantity,0);$('#bag-count').textContent=count;$('#bag-count').hidden=!count;$('.bag-button').setAttribute('aria-label',`Abrir sacola: ${count} ${count===1?'item':'itens'}`)}
function saveCart(){saveLocal('lt-cart-v1',cart);updateCartBadge()}
function renderCart(step='cart'){$('#cart-dialog').innerHTML=cartView(cart,products,step)}
function currentList(){return filterProducts(products,{...filters,favoritesOnly:route.type==='favorites',favorites})}
function updateGrid({more=false}={}){const list=currentList();if(!$('#catalog-grid'))return;if(!more)visibleCount=24;const shown=list.slice(0,visibleCount);$('#catalog-grid').innerHTML=shown.length?shown.map(p=>productCard(p,favorites)).join(''):emptyResults(route.type==='favorites');$('#results-count').textContent=`${list.length} ${list.length===1?'produto':'produtos'}`;$('#shown-count').textContent=`Mostrando ${shown.length} de ${list.length} produtos`;$('#load-more').hidden=shown.length>=list.length;const active=[];if(filters.query)active.push('Busca: '+filters.query);if(filters.brand)active.push(filters.brand);if(filters.kind)active.push(filters.kind);if(filters.source)active.push(filters.source==='catalog'?'Do catálogo':'Exemplos');if(filters.maxPrice<1500)active.push('Até '+money(filters.maxPrice));if(filters.size)active.push('Tamanho '+filters.size);if(filters.available)active.push('Estoque informado');$('#active-filters').innerHTML=active.length?`<span>${active.map(esc).join(' <i>·</i> ')}</span><button data-action="clear-filters" aria-label="Limpar filtros ativos">Limpar ${icon('close')}</button>`:''}
function render({focus=false}={}){
  route=routeFromHash(location.hash);
  selectedSize='';selectedPhoto=0;
  if(route.type==='home'){main.innerHTML=homeView(products,favorites);document.title='L&T Club — '+brand.tagline}
  else if(route.type==='product'){const p=products.find(p=>p.id===route.id);main.innerHTML=productView(p,products,favorites);selectedSize=p?.sizes.length===1?p.sizes[0]:'';document.title=(p?p.name:'Produto não encontrado')+' — L&T Club'}
  else {filters={category:route.type==='favorites'?'todos':categories.some(c=>c.id===route.category)?route.category:'todos',query:route.query||'',maxPrice:1500,size:'',available:false,sort:'featured'};main.innerHTML=collectionView(currentList(),filters,favorites,{favoritesOnly:route.type==='favorites'});updateGrid();document.title=(route.type==='favorites'?'Seus favoritos':'Coleção')+' — L&T Club'}
  $$('header nav a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')===location.hash));
  if(focus){window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true})}
  document.body.classList.toggle('product-route',route.type==='product');document.body.classList.toggle('home-route',route.type==='home');
  bindTilt();bindSwipe();
  const stage=$('#main-product-image');if(stage){const p=products.find(x=>x.id===route.id),g=p?.gallery?.[0];if(g)stage.classList.add(fitClass(g.width,g.height))}
}
// Arrastar a foto principal para o lado troca a foto no celular.
function bindSwipe(){const stage=$('#main-product-image');if(!stage)return;let x0=null,y0=0;stage.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});stage.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)$(`[data-action="gallery-${dx<0?'next':'prev'}"]`)?.click()},{passive:true})}
// Cabeçalho ganha sombra ao rolar a página.
addEventListener('scroll',()=>document.body.classList.toggle('scrolled',scrollY>8),{passive:true});
function bindTilt(){const area=$('#hero-visual'),shoe=$('#hero-shoe');if(!area||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer:fine)').matches)return;area.addEventListener('pointermove',e=>{const r=area.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;shoe.style.transform=`perspective(1000px) rotateY(${x*7}deg) rotateX(${-y*6}deg) translateY(${-y*6}px)`});area.addEventListener('pointerleave',()=>shoe.style.transform='')}
function info(title,body){$('#info-dialog').innerHTML=`<div class="dialog-heading"><h2 id="info-title">${esc(title)}</h2><button data-close="info-dialog" class="icon-button" aria-label="Fechar">${icon('close')}</button></div><div class="info-body">${body}</div>`;showDialog('info-dialog')}
const infoContent={
 about:['O estilo é seu. O Club também.',`<p class="eyebrow">L&T CLUB · ESTILO SEM EXCESSOS.</p><p>A L&T Club é uma loja de roupas e acessórios importados com uma proposta masculina, versátil e sofisticada. Uma seleção pensada para vestir bem, com naturalidade.</p><p>Esta vitrine privada reúne as fotografias dos catálogos fornecidos pela loja. Diferentes ângulos e cores de um modelo ficam na mesma galeria. Preços, tamanhos, composição e estoque ainda precisam ser confirmados. Relógio, óculos e bolsa marcados como exemplos completam a demonstração.</p><a class="button dark" href="#/colecao/todos">Conhecer a coleção ↗</a>`],
 help:['Dúvidas e informações',`<details open><summary>Como funciona esta vitrine?</summary><p>Explore categorias, aplique filtros, salve favoritos e adicione produtos à sacola. Em seguida, revise sua seleção e conclua uma simulação.</p></details><details><summary>Posso fazer uma compra?</summary><p>Este ambiente é demonstrativo. Não há cobrança, pedidos reais ou envio de informações para a loja.</p></details><details><summary>Como consultar entrega, troca e garantia?</summary><p>As políticas reais devem ser informadas pela L&T Club antes da abertura das vendas. Prazos, garantias e condições comerciais ainda não estão cadastrados.</p></details><details><summary>Como atualizar os produtos?</summary><p>Use “Editar catálogo”, no rodapé, para editar os campos neste navegador, exportar e importar um catálogo. Para uma alteração permanente no site hospedado, o catálogo atualizado precisa ser incorporado a uma nova versão.</p></details>`],
 privacy:['Privacidade nesta demonstração',`<p>A hospedagem desta vitrine é privada, com acesso restrito pelo serviço de hospedagem.</p><p>Favoritos, sacola e alterações de catálogo ficam apenas no armazenamento local deste navegador. Não há formulários de dados pessoais, rastreadores de publicidade ou envio de pedidos.</p><p>O editor permite exportar o catálogo para um arquivo local. Alterações feitas nele não são automaticamente publicadas ou sincronizadas entre dispositivos.</p><button class="button outline" data-action="clear-local">Apagar meus dados locais</button>`],
};
function openEditor(selectedId){const p=products.find(x=>x.id===selectedId)||products[0];$('#editor-dialog').innerHTML=`<div class="dialog-heading"><div><p class="eyebrow">L&T CLUB · SEU CATÁLOGO</p><h2 id="editor-title">Seu catálogo.<br>Do seu jeito.</h2></div><button data-close="editor-dialog" class="icon-button" aria-label="Fechar editor">${icon('close')}</button></div><div class="editor-body"><p class="editor-note">As alterações ficam neste navegador. Exporte o JSON para guardar seus dados e incorporá-los a uma nova versão do site.</p><label class="editor-select-label">Produto para editar<select id="editor-product">${products.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><form id="editor-form" data-product-id="${esc(p.id)}"><div class="editor-grid">${[{key:'name',label:'Nome do produto'},{key:'brand',label:'Marca / linha'},{key:'price',label:'Preço em R$ (vazio = sob consulta)',type:'number',step:'0.01',min:0},{key:'stock',label:'Estoque (vazio = a confirmar)',type:'number',step:1,min:0},{key:'color',label:'Nome da cor'},{key:'hex',label:'Cor hexadecimal'},{key:'badge',label:'Etiqueta, ex.: Novo'},{key:'sizes',label:'Tamanhos, separados por vírgula',value:p.sizes.join(', ')}].map(f=>`<label>${f.label}<input name="${f.key}" type="${f.type||'text'}" ${f.type==='number'?`min="${f.min}" step="${f.step}"`:''} value="${esc(f.value??p[f.key])}" ${['price','stock'].includes(f.key)?'':'required'}></label>`).join('')}<label>Categoria<select name="category">${categories.filter(c=>c.id!=='todos').map(c=>`<option value="${c.id}" ${p.category===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label>Imagem (assets/ ou URL HTTPS)<input name="image" value="${esc(p.image)}" required></label></div><label class="check-label"><input name="demo" type="checkbox" ${p.demo?'checked':''}>Produto demonstrativo</label><label>Descrição<textarea name="description" rows="3" required>${esc(p.description)}</textarea></label><div class="editor-grid"><label>Materiais<textarea name="material" rows="2" required>${esc(p.material)}</textarea></label><label>Medidas e caimento<textarea name="fit" rows="2" required>${esc(p.fit)}</textarea></label></div><p id="editor-error" role="alert" class="size-error"></p><button class="button dark" type="submit">Salvar neste navegador ${icon('check')}</button></form><div class="editor-transfer"><button class="button outline" data-action="export-catalog">Exportar catálogo JSON ↓</button><label class="button outline import-label">Importar catálogo JSON ↑<input id="catalog-import" type="file" accept="application/json,.json"></label><button class="reset-filters" data-action="reset-catalog">Restaurar catálogo original</button></div><p class="editor-footnote">Para trocar fotos, use imagens próprias em HTTPS ou substitua os arquivos da pasta assets na próxima versão do site. O catálogo inicial está centralizado em catalog.mjs.</p></div>`;showDialog('editor-dialog')}
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){$('#'+close.dataset.close)?.close();return}
  const link=e.target.closest('a');if(link?.getAttribute('href')?.startsWith('#/')){closeDialogs();if(link.getAttribute('href')===location.hash){window.scrollTo({top:0,behavior:'smooth'})}return}
  const el=e.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='search'){showDialog('search-dialog');$('#global-search').focus()}
  if(action==='menu')showDialog('menu-dialog');
  if(action==='cart'){renderCart();showDialog('cart-dialog')}
  if(action==='load-more'){visibleCount+=24;updateGrid({more:true})}
  if(action==='filters')showDialog('filters-dialog');
  if(action==='favorite'){
    const added=!favorites.includes(id);favorites=added?[...favorites,id]:favorites.filter(x=>x!==id);saveLocal('lt-favorites-v1',favorites);
    $$(`[data-action="favorite"][data-id="${id}"]`).forEach(b=>{b.classList.toggle('active',added);b.setAttribute('aria-pressed',String(added));b.setAttribute('aria-label',`${added?'Remover dos':'Adicionar aos'} favoritos: ${products.find(p=>p.id===id)?.name||''}`)});
    if(route.type==='favorites')updateGrid();toast(added?'Adicionado aos seus favoritos.':'Removido dos favoritos.');
  }
  if(action==='size'){selectedSize=el.dataset.size;$$('.size-option').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))});$('#size-error').textContent=''}
  if(action==='add-cart'){try{cart=addToCart(cart,products.find(p=>p.id===id),selectedSize);saveCart();renderCart();showDialog('cart-dialog');$('#size-error').textContent=''}catch(error){$('#size-error').textContent=error.message;$('.size-option')?.focus()}}
  if(action==='quantity'){try{cart=setQuantity(cart,products,id,el.dataset.size,Number(el.dataset.quantity));saveCart();renderCart()}catch(error){toast(error.message)}}
  if(action==='review-cart'){cart=cleanCart(cart,products);saveCart();if(cart.length)renderCart('review');else renderCart()}
  if(action==='finish-demo'&&cart.length){cart=[];saveCart();renderCart('success')}
  if(action==='gallery-prev'||action==='gallery-next'){const p=products.find(x=>x.id===route.id);const n=p?.gallery?.length||0;if(n){const index=(selectedPhoto+(action==='gallery-next'?1:-1)+n)%n;const button=$(`.gallery-thumb[data-index="${index}"]`);button?.click();button?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}}
  if(action==='gallery'){const p=products.find(x=>x.id===route.id);const index=Number(el.dataset.index);const g=p?.gallery?.[index];if(g){selectedPhoto=index;const stage=$('#main-product-image'),img=$('#main-product-image img');img.src=g.image;img.width=g.width||900;img.height=g.height||900;img.style.maxWidth=(g.width||1400)+'px';stage.style.setProperty('--bg',`url('${g.image}')`);stage.classList.remove('fit-cover','fit-contain');stage.classList.add(fitClass(g.width,g.height));$('#gallery-counter').textContent=`${index+1} / ${p.gallery.length}`;if($('#gallery-counter-mini'))$('#gallery-counter-mini').textContent=`${index+1} / ${p.gallery.length}`;el.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});$$('.gallery-thumb').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))})}}
  if(action==='zoom'){const p=products.find(x=>x.id===route.id);if(p)info(p.name,`<img class="zoom-image" style="max-width:${p.gallery?.[selectedPhoto]?.width||1400}px;margin:auto" src="${esc(p.gallery?.[selectedPhoto]?.image||p.image)}" alt="${esc(p.name)}"><p class="muted">${p.demo?'Imagem ilustrativa':'Foto do catálogo'} · ${esc(p.color)}</p>`)}
  if(action==='size-guide'){const p=products.find(x=>x.id===id);if(!p)return;if(!p.demo){info('Tamanhos e medidas',`<p>${esc(p.fit)}</p><p>A grade de tamanhos deste modelo ainda não foi informada. Confirme a numeração e as medidas com a L&T Club antes de comprar.</p>`);return}info('Guia de medidas',`<p>${esc(p.fit)}</p><p class="demo-notice">Medidas ilustrativas. Substitua pela tabela do fabricante antes de vender.</p>${p.category==='roupas'?'<table class="size-table"><thead><tr><th>Tamanho</th><th>Peito (cm)</th><th>Comprimento (cm)</th></tr></thead><tbody><tr><td>P</td><td>98</td><td>70</td></tr><tr><td>M</td><td>104</td><td>72</td></tr><tr><td>G</td><td>110</td><td>74</td></tr><tr><td>GG</td><td>116</td><td>76</td></tr></tbody></table>':p.category==='tenis'?'<table class="size-table"><thead><tr><th>BR</th><th>Pé (cm)</th></tr></thead><tbody><tr><td>38</td><td>25,5</td></tr><tr><td>39</td><td>26</td></tr><tr><td>40</td><td>26,5</td></tr><tr><td>41</td><td>27,5</td></tr><tr><td>42</td><td>28</td></tr><tr><td>43</td><td>29</td></tr></tbody></table>':'<p>Tamanho único. Confira as dimensões na descrição da peça.</p>'}`)}
  if(action==='clear-filters'){filters={...filters,query:'',brand:'',kind:'',source:'',maxPrice:1500,size:'',available:false,sort:'featured'};if($('#catalog-search'))$('#catalog-search').value='';if($('#sort'))$('#sort').value='featured';$$('[name="maxPrice"]').forEach(i=>i.value=1500);$$('.price-output').forEach(i=>i.textContent=money(1500));$$('[name="size"]').forEach(i=>i.value='');$$('[name="available"]').forEach(i=>i.checked=false);['brand','kind','source'].forEach(name=>$$(`[name="${name}"]`).forEach(i=>i.value=''));updateGrid()}
  if(infoContent[action])info(...infoContent[action]);
  if(action==='editor')openEditor();
  if(action==='export-catalog'){const blob=new Blob([JSON.stringify(products,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lt-club-catalogo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Catálogo exportado para seu dispositivo.')}
  if(action==='reset-catalog'){products=defaultProducts;saveLocal('lt-catalog-v2',null);cart=cleanCart(cart,products);saveCart();render();openEditor();toast('Catálogo original restaurado.')}
  if(action==='clear-local'){try{['lt-cart-v1','lt-favorites-v1','lt-catalog-v2','lt-catalog-v3'].forEach(k=>localStorage.removeItem(k))}catch{}cart=[];favorites=[];products=defaultProducts;updateCartBadge();closeDialogs();render();toast('Seus dados locais foram apagados.')}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='search-form'){e.preventDefault();const query=$('#global-search').value.trim();const next='#/colecao/todos'+(query?'?q='+encodeURIComponent(query):'');closeDialogs();if(location.hash===next){render({focus:true})}else location.hash=next}
  if(e.target.id==='editor-form'){e.preventDefault();const values=Object.fromEntries(new FormData(e.target)),id=e.target.dataset.productId;try{const updated={...products.find(p=>p.id===id),...values,price:values.price.trim()===''?null:Number(values.price),stock:values.stock.trim()===''?null:Number(values.stock),demo:values.demo==='on',sizes:values.sizes.split(',').map(s=>s.trim()).filter(Boolean)};if(updated.image!==products.find(p=>p.id===id).image)updated.gallery=[{image:updated.image,thumbnail:updated.image,label:'Foto do produto'}];products=validateCatalog(products.map(p=>p.id===id?updated:p));saveLocal('lt-catalog-v2',products);cart=cleanCart(cart,products);saveCart();render();openEditor(id);toast('Produto atualizado neste navegador.')}catch(error){$('#editor-error').textContent=error.message}}
});
document.addEventListener('input',e=>{
  if(e.target.id==='catalog-search'){filters.query=e.target.value;clearTimeout(renderTimer);renderTimer=setTimeout(updateGrid,100)}
  if(e.target.name==='maxPrice'){const v=Number(e.target.value);$$('[name="maxPrice"]').forEach(i=>i.value=v);$$('.price-output').forEach(i=>i.textContent=money(v))}
});
document.addEventListener('change',async e=>{
  if(e.target.id==='sort'){filters.sort=e.target.value;updateGrid()}
  if(['maxPrice','size','available','brand','kind','source'].includes(e.target.name)){
    const name=e.target.name;filters[name]=name==='available'?e.target.checked:name==='maxPrice'?Number(e.target.value):e.target.value;
    $$(`[name="${name}"]`).forEach(i=>{if(name==='available')i.checked=filters[name];else i.value=filters[name]});updateGrid();
  }
  if(e.target.id==='editor-product')openEditor(e.target.value);
  if(e.target.id==='catalog-import'){const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw new Error('Use um arquivo de até 2 MB.');const imported=validateCatalog(JSON.parse(await file.text()));products=imported;saveLocal('lt-catalog-v2',products);cart=cleanCart(cart,products);favorites=favorites.filter(id=>products.some(p=>p.id===id));saveLocal('lt-favorites-v1',favorites);saveCart();render();openEditor();toast('Catálogo importado neste navegador.')}catch(error){toast(error instanceof SyntaxError?'JSON inválido. Verifique o arquivo.':error.message)}}
});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='assets/image-fallback.svg'}},true);
document.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('has-dialog')},true);
document.addEventListener('click',e=>{if(e.target.tagName==='DIALOG'){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
window.addEventListener('hashchange',()=>{if(location.hash==='#collection'){$('#collection')?.scrollIntoView({behavior:'smooth'});return}closeDialogs();render({focus:true})});
window.addEventListener('storage',()=>{cart=cleanCart(readLocal('lt-cart-v1',[]),products);favorites=readLocal('lt-favorites-v1',[]);if(!Array.isArray(favorites))favorites=[];updateCartBadge();if($('#cart-dialog').open)renderCart();if(route.type==='favorites')updateGrid()});
$('#year').textContent=new Date().getFullYear();
paintIcons();updateCartBadge();render();

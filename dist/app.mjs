import {products as defaultProducts,brand,categories} from './catalog.mjs?v=8';
import {filterProducts,addToCart,setQuantity,cleanCart,routeFromHash,validateCatalog,money,colorNames,listHash} from './core.mjs?v=8';
import {esc,icon,homeView,collectionView,productView,productCard,cartView,emptyResults,filterOptions,stageStyle} from './ui.mjs?v=8';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('O navegador não permitiu salvar. As alterações continuam nesta sessão.')}}
let products=defaultProducts;
// Edições locais do catálogo (chave nova: o catálogo foi reorganizado e as edições antigas não se aplicam).
try{const local=readLocal('lt-catalog-v3',null);if(local)products=validateCatalog(local)}catch{}
let cart=cleanCart(readLocal('lt-cart-v1',[]),products);
let favorites=readLocal('lt-favorites-v1',[]);
if(!Array.isArray(favorites))favorites=[];
favorites=favorites.filter(id=>products.some(p=>p.id===id));
let route=routeFromHash(location.hash);
const blankFilters=category=>({category,query:'',brand:'',kind:'',sort:'featured'});
let filters=blankFilters('todos');
let selectedSize='',selectedColor='';
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
function renderCart(){$('#cart-dialog').innerHTML=cartView(cart,products)}
function currentList(){return filterProducts(products,{...filters,favoritesOnly:route.type==='favorites',favorites})}
function refreshFilterOptions(){const o=filterOptions(products,filters);if(filters.brand&&!o.brands.includes(filters.brand))filters.brand='';if(filters.kind&&!o.kinds.includes(filters.kind))filters.kind='';const f=filterOptions(products,filters);$$('[name="brand"]').forEach(i=>i.innerHTML=f.brandHtml);$$('[name="kind"]').forEach(i=>i.innerHTML=f.kindHtml)}
function updateGrid({more=false,keep=false}={}){const list=currentList();if(!$('#catalog-grid'))return;if(!more&&!keep)visibleCount=24;syncListHash();const shown=list.slice(0,visibleCount);$('#catalog-grid').innerHTML=shown.length?shown.map((p,i)=>productCard(p,favorites,i)).join(''):emptyResults(route.type==='favorites');$('#results-count').textContent=`${list.length} ${list.length===1?'produto':'produtos'}`;$('#shown-count').textContent=`Mostrando ${shown.length} de ${list.length} produtos`;$('#load-more').hidden=shown.length>=list.length;const active=[];if(filters.query)active.push('Busca: '+filters.query);if(filters.brand)active.push(filters.brand);if(filters.kind)active.push(filters.kind);$('#active-filters').innerHTML=active.length?`<span>${active.map(esc).join(' <i>·</i> ')}</span><button data-action="clear-filters" aria-label="Limpar filtros ativos">Limpar ${icon('close')}</button>`:''}
// Posição de rolagem e quantidade de produtos carregados ficam no histórico de cada página,
// para que voltar do produto retorne exatamente ao ponto da listagem.
if('scrollRestoration' in history)history.scrollRestoration='manual';
function saveView(){try{history.replaceState({...(history.state||{}),y:Math.round(scrollY),count:visibleCount},'',location.href)}catch{}}
function syncListHash(){if(route.type!=='collection'&&route.type!=='favorites')return;const next=listHash(filters,route.type==='favorites');if(next!==location.hash)try{history.replaceState(history.state,'',next)}catch{}}
let previousHash='';
function render({focus=false}={}){
  route=routeFromHash(location.hash);
  const saved=history.state&&Number.isFinite(history.state.y)?history.state:null;
  selectedSize='';selectedColor='';selectedPhoto=0;
  if(route.type==='home'){main.innerHTML=homeView(products,favorites);document.title='L&T Club — '+brand.tagline}
  else if(route.type==='product'){const p=products.find(p=>p.id===route.id);main.innerHTML=productView(p,products,favorites);selectedSize=p?.sizes.length===1?p.sizes[0]:'';selectedColor=p&&colorNames(p).length===1?colorNames(p)[0]:'';document.title=(p?p.name:'Produto não encontrado')+' — L&T Club'}
  else {filters={...blankFilters(route.type==='favorites'?'todos':categories.some(c=>c.id===route.category)?route.category:'todos'),query:route.query||'',brand:route.brand||'',kind:route.kind||'',sort:route.sort||'featured'};visibleCount=saved?.count||24;main.innerHTML=collectionView(currentList(),filters,favorites,{favoritesOnly:route.type==='favorites',all:products});refreshFilterOptions();if($('#sort'))$('#sort').value=filters.sort;updateGrid({keep:true});document.title=(route.type==='favorites'?'Seus favoritos':'Coleção')+' — L&T Club'}
  $$('header nav a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')===location.hash));
  if(saved)window.scrollTo({top:saved.y,behavior:'instant'});else if(focus)window.scrollTo({top:0,behavior:'instant'});
  if(focus)main.focus({preventScroll:true});
  document.body.classList.toggle('product-route',route.type==='product');document.body.classList.toggle('home-route',route.type==='home');
  bindTilt();bindSwipe();
}
// Arrastar a foto principal para o lado troca a foto no celular.
function bindSwipe(){const stage=$('#main-product-image');if(!stage)return;let x0=null,y0=0;stage.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});stage.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)$(`[data-action="gallery-${dx<0?'next':'prev'}"]`)?.click()},{passive:true})}
// Cabeçalho ganha sombra ao rolar a página.
addEventListener('scroll',()=>document.body.classList.toggle('scrolled',scrollY>8),{passive:true});
function bindTilt(){const area=$('#hero-visual'),shoe=$('#hero-shoe');if(!area||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer:fine)').matches)return;area.addEventListener('pointermove',e=>{const r=area.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;shoe.style.transform=`perspective(1000px) rotateY(${x*7}deg) rotateX(${-y*6}deg) translateY(${-y*6}px)`});area.addEventListener('pointerleave',()=>shoe.style.transform='')}
function info(title,body){$('#info-dialog').innerHTML=`<div class="dialog-heading"><h2 id="info-title">${esc(title)}</h2><button data-close="info-dialog" class="icon-button" aria-label="Fechar">${icon('close')}</button></div><div class="info-body">${body}</div>`;showDialog('info-dialog')}
const infoContent={
 about:['O estilo é seu. O Club também.',`<p class="eyebrow">L&T CLUB · ESTILO SEM EXCESSOS.</p><p>A L&T Club é uma loja de roupas, calçados e acessórios importados com uma proposta masculina, versátil e sofisticada.</p><p>As fotos são as originais dos catálogos da loja. Cada produto reúne seus ângulos e cores; escolha a cor e o tamanho e finalize o pedido pelo WhatsApp, onde a loja confirma valores, disponibilidade, entrega e pagamento.</p><a class="button dark" href="#/colecao/todos">Conhecer a coleção ↗</a>`],
 help:['Dúvidas e informações',`<details open><summary>Como faço um pedido?</summary><p>Na página do produto, escolha a cor e o tamanho e toque em “Adicionar à sacola”. Na sacola, ajuste as quantidades e toque em “Finalizar pedido no WhatsApp”. A mensagem já vai com produtos, cores, tamanhos, quantidades e valores.</p></details><details><summary>Os tamanhos estão disponíveis?</summary><p>As opções seguem a grade usual de cada tipo de peça. A disponibilidade de cada cor e tamanho é confirmada pela loja no WhatsApp, antes do pagamento.</p></details><details><summary>Como consultar entrega, troca e garantia?</summary><p>Pelo WhatsApp da loja, no mesmo atendimento do pedido.</p></details>`],
 privacy:['Privacidade',`<p>Favoritos e sacola ficam apenas no armazenamento deste navegador. Não há cadastro, rastreadores de publicidade ou pagamento no site.</p><p>Ao finalizar, o WhatsApp abre com a mensagem do pedido; você decide se envia.</p><button class="button outline" data-action="clear-local">Apagar meus dados locais</button>`],
};
function openEditor(selectedId){const p=products.find(x=>x.id===selectedId)||products[0];$('#editor-dialog').innerHTML=`<div class="dialog-heading"><div><p class="eyebrow">L&T CLUB · SEU CATÁLOGO</p><h2 id="editor-title">Seu catálogo.<br>Do seu jeito.</h2></div><button data-close="editor-dialog" class="icon-button" aria-label="Fechar editor">${icon('close')}</button></div><div class="editor-body"><p class="editor-note">As alterações ficam neste navegador. Exporte o JSON para guardar seus dados e incorporá-los a uma nova versão do site.</p><label class="editor-select-label">Produto para editar<select id="editor-product">${products.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><form id="editor-form" data-product-id="${esc(p.id)}"><div class="editor-grid">${[{key:'name',label:'Nome do produto'},{key:'brand',label:'Marca / linha'},{key:'price',label:'Preço em R$ (vazio = sob consulta)',type:'number',step:'0.01',min:0},{key:'stock',label:'Estoque (vazio = a confirmar)',type:'number',step:1,min:0},{key:'color',label:'Nome da cor'},{key:'hex',label:'Cor hexadecimal'},{key:'badge',label:'Etiqueta, ex.: Novo'},{key:'sizes',label:'Tamanhos, separados por vírgula',value:p.sizes.join(', ')}].map(f=>`<label>${f.label}<input name="${f.key}" type="${f.type||'text'}" ${f.type==='number'?`min="${f.min}" step="${f.step}"`:''} value="${esc(f.value??p[f.key])}" ${['price','stock'].includes(f.key)?'':'required'}></label>`).join('')}<label>Categoria<select name="category">${categories.filter(c=>c.id!=='todos').map(c=>`<option value="${c.id}" ${p.category===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label>Imagem (assets/ ou URL HTTPS)<input name="image" value="${esc(p.image)}" required></label></div><label>Descrição<textarea name="description" rows="3" required>${esc(p.description)}</textarea></label><div class="editor-grid"><label>Materiais<textarea name="material" rows="2" required>${esc(p.material)}</textarea></label><label>Medidas e caimento<textarea name="fit" rows="2" required>${esc(p.fit)}</textarea></label></div><p id="editor-error" role="alert" class="size-error"></p><button class="button dark" type="submit">Salvar neste navegador ${icon('check')}</button></form><div class="editor-transfer"><button class="button outline" data-action="export-catalog">Exportar catálogo JSON ↓</button><label class="button outline import-label">Importar catálogo JSON ↑<input id="catalog-import" type="file" accept="application/json,.json"></label><button class="reset-filters" data-action="reset-catalog">Restaurar catálogo original</button></div><p class="editor-footnote">Para trocar fotos, use imagens próprias em HTTPS ou substitua os arquivos da pasta assets na próxima versão do site. O catálogo inicial está centralizado em catalog.mjs.</p></div>`;showDialog('editor-dialog')}
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){$('#'+close.dataset.close)?.close();return}
  const back=e.target.closest('[data-action="back"]');if(back){e.preventDefault();if(previousHash&&routeFromHash(previousHash).type!=='product')history.back();else location.hash=back.getAttribute('href');return}
  const link=e.target.closest('a');if(link?.getAttribute('href')?.startsWith('#/')){saveView();closeDialogs();if(link.getAttribute('href')===location.hash){window.scrollTo({top:0,behavior:'smooth'})}return}
  const el=e.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='search'){showDialog('search-dialog');$('#global-search').focus()}
  if(action==='menu')showDialog('menu-dialog');
  if(action==='cart'){renderCart();showDialog('cart-dialog')}
  if(action==='load-more'){visibleCount+=24;updateGrid({more:true});saveView()}
  if(action==='filters')showDialog('filters-dialog');
  if(action==='favorite'){
    const added=!favorites.includes(id);favorites=added?[...favorites,id]:favorites.filter(x=>x!==id);saveLocal('lt-favorites-v1',favorites);
    $$(`[data-action="favorite"][data-id="${id}"]`).forEach(b=>{b.classList.toggle('active',added);b.setAttribute('aria-pressed',String(added));b.setAttribute('aria-label',`${added?'Remover dos':'Adicionar aos'} favoritos: ${products.find(p=>p.id===id)?.name||''}`)});
    if(route.type==='favorites')updateGrid();toast(added?'Adicionado aos seus favoritos.':'Removido dos favoritos.');
  }
  if(action==='size'){selectedSize=el.dataset.size;$$('.size-option').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))});$('#selected-size').textContent=selectedSize;$('#size-error').textContent=''}
  if(action==='color'){selectedColor=el.dataset.color;$$('.color-option').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))});$('#selected-color').textContent=selectedColor;$('#size-error').textContent='';const p=products.find(x=>x.id===route.id);const first=p?.colors?.find(c=>c.name===selectedColor)?.images?.[0];const index=first?p.gallery.findIndex(g=>g.image===first):-1;if(index>=0)$(`.gallery-thumb[data-index="${index}"]`)?.click()}
  if(action==='add-cart'){const p=products.find(x=>x.id===id);const needColor=colorNames(p).length>1&&!selectedColor,needSize=p.sizes.length>1&&!selectedSize;if(needColor||needSize){$('#size-error').textContent=needColor&&needSize?'Selecione a cor e o tamanho para continuar.':needColor?'Selecione uma cor para continuar.':'Selecione um tamanho para continuar.';$(needColor?'.color-option':'.size-option')?.focus();return}try{cart=addToCart(cart,p,{size:selectedSize,color:selectedColor});saveCart();renderCart();showDialog('cart-dialog');$('#size-error').textContent=''}catch(error){$('#size-error').textContent=error.message}}
  if(action==='quantity'){try{cart=setQuantity(cart,products,{id,size:el.dataset.size,color:el.dataset.color||''},Number(el.dataset.quantity));saveCart();renderCart();$(`#cart-dialog [data-action="quantity"][data-id="${CSS.escape(id)}"][data-size="${CSS.escape(el.dataset.size)}"][data-color="${CSS.escape(el.dataset.color||'')}"]`)?.focus()}catch(error){toast(error.message)}}
  if(action==='checkout')toast('Abrindo o WhatsApp com o seu pedido…');
  if(action==='gallery-prev'||action==='gallery-next'){const p=products.find(x=>x.id===route.id);const n=p?.gallery?.length||0;if(n){const index=(selectedPhoto+(action==='gallery-next'?1:-1)+n)%n;$(`.gallery-thumb[data-index="${index}"]`)?.click()}}
  if(action==='gallery'){const p=products.find(x=>x.id===route.id);const index=Number(el.dataset.index);const g=p?.gallery?.[index];if(g){selectedPhoto=index;const stage=$('#main-product-image'),img=$('#main-product-image img');img.src=g.image;img.width=g.width||900;img.height=g.height||900;img.alt=`${p.name} — foto ${index+1}`;stage.setAttribute('style',stageStyle(g));$('#gallery-counter').textContent=`${index+1} / ${p.gallery.length}`;if($('#gallery-counter-mini'))$('#gallery-counter-mini').textContent=`${index+1} / ${p.gallery.length}`;const strip=el.parentElement;strip.scrollTo({left:strip.scrollLeft+el.getBoundingClientRect().left-strip.getBoundingClientRect().left-(strip.clientWidth-el.clientWidth)/2,behavior:'smooth'});$$('.gallery-thumb').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))})}}
  if(action==='zoom'){const p=products.find(x=>x.id===route.id);if(p)info(p.name,`<img class="zoom-image" style="max-width:${p.gallery?.[selectedPhoto]?.width||1400}px;margin:auto" src="${esc(p.gallery?.[selectedPhoto]?.image||p.image)}" alt="${esc(p.name)}"><p class="muted">Foto original do catálogo · ${esc(p.name)}</p>`)}
  if(action==='size-guide'){const p=products.find(x=>x.id===id);if(!p)return;info('Guia de tamanhos',`<p>Opções para este produto: <strong>${p.sizes.map(esc).join(' · ')}</strong>.</p><p>As opções seguem a grade usual deste tipo de peça. A disponibilidade de cada tamanho e as medidas exatas são confirmadas pela L&T Club no WhatsApp, antes do pagamento.</p>`)}
  if(action==='clear-filters'){filters=blankFilters(filters.category);if($('#catalog-search'))$('#catalog-search').value='';if($('#sort'))$('#sort').value='featured';refreshFilterOptions();updateGrid()}
  if(infoContent[action])info(...infoContent[action]);
  if(action==='editor')openEditor();
  if(action==='export-catalog'){const blob=new Blob([JSON.stringify(products,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lt-club-catalogo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Catálogo exportado para seu dispositivo.')}
  if(action==='reset-catalog'){products=defaultProducts;saveLocal('lt-catalog-v3',null);cart=cleanCart(cart,products);saveCart();render();openEditor();toast('Catálogo original restaurado.')}
  if(action==='clear-local'){try{['lt-cart-v1','lt-favorites-v1','lt-catalog-v2','lt-catalog-v3'].forEach(k=>localStorage.removeItem(k))}catch{}cart=[];favorites=[];products=defaultProducts;updateCartBadge();closeDialogs();render();toast('Seus dados locais foram apagados.')}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='search-form'){e.preventDefault();const query=$('#global-search').value.trim();const next='#/colecao/todos'+(query?'?q='+encodeURIComponent(query):'');closeDialogs();if(location.hash===next){render({focus:true})}else location.hash=next}
  if(e.target.id==='editor-form'){e.preventDefault();const values=Object.fromEntries(new FormData(e.target)),id=e.target.dataset.productId;try{const updated={...products.find(p=>p.id===id),...values,price:values.price.trim()===''?null:Number(values.price),stock:values.stock.trim()===''?null:Number(values.stock),sizes:values.sizes.split(',').map(s=>s.trim()).filter(Boolean)};if(updated.image!==products.find(p=>p.id===id).image)updated.gallery=[{image:updated.image,thumbnail:updated.image,label:'Foto do produto'}];products=validateCatalog(products.map(p=>p.id===id?updated:p));saveLocal('lt-catalog-v3',products);cart=cleanCart(cart,products);saveCart();render();openEditor(id);toast('Produto atualizado neste navegador.')}catch(error){$('#editor-error').textContent=error.message}}
});
document.addEventListener('input',e=>{
  if(e.target.id==='catalog-search'){filters.query=e.target.value;clearTimeout(renderTimer);renderTimer=setTimeout(updateGrid,100)}
});
document.addEventListener('change',async e=>{
  if(e.target.id==='sort'){filters.sort=e.target.value;updateGrid()}
  if(['brand','kind'].includes(e.target.name)){
    filters[e.target.name]=e.target.value;refreshFilterOptions();updateGrid();
  }
  if(e.target.id==='editor-product')openEditor(e.target.value);
  if(e.target.id==='catalog-import'){const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw new Error('Use um arquivo de até 2 MB.');const imported=validateCatalog(JSON.parse(await file.text()));products=imported;saveLocal('lt-catalog-v3',products);cart=cleanCart(cart,products);favorites=favorites.filter(id=>products.some(p=>p.id===id));saveLocal('lt-favorites-v1',favorites);saveCart();render();openEditor();toast('Catálogo importado neste navegador.')}catch(error){toast(error instanceof SyntaxError?'JSON inválido. Verifique o arquivo.':error.message)}}
});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='assets/image-fallback.svg'}},true);
document.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('has-dialog')},true);
document.addEventListener('click',e=>{if(e.target.tagName==='DIALOG'){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
window.addEventListener('hashchange',e=>{if(location.hash==='#collection'){$('#collection')?.scrollIntoView({behavior:'smooth'});return}previousHash=e.oldURL.includes('#')?e.oldURL.slice(e.oldURL.indexOf('#')):'';closeDialogs();render({focus:true})});
let saveTimer;addEventListener('scroll',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(saveView,180)},{passive:true});
addEventListener('pagehide',saveView);
window.addEventListener('storage',()=>{cart=cleanCart(readLocal('lt-cart-v1',[]),products);favorites=readLocal('lt-favorites-v1',[]);if(!Array.isArray(favorites))favorites=[];updateCartBadge();if($('#cart-dialog').open)renderCart();if(route.type==='favorites')updateGrid()});
$('#year').textContent=new Date().getFullYear();
paintIcons();updateCartBadge();render();

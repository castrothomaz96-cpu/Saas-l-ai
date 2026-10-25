export const money = value => value===null||value===undefined?'Sob consulta':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
// Busca sem distinção de maiúsculas, minúsculas e acentos.
export const normalize = s => String(s??'').replace(/œ/gi,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const categoryWords={roupas:'roupa roupas',tenis:'tenis calcado calcados',acessorios:'acessorio acessorios',relogios:'relogio relogios'};
export function matchesQuery(p,query){
  const words=normalize([p.name,p.brand,p.kind,p.color,categoryWords[p.category]||''].join(' ')).split(/[^a-z0-9]+/).filter(Boolean);
  const terms=normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
  return terms.every(t=>words.some(w=>w.startsWith(t)));
}
const inCategory=(p,category)=>!category||category==='todos'||p.category===category;
const sortPt=list=>[...new Set(list)].sort((a,b)=>a.localeCompare(b,'pt-BR'));
// Marcas e tipos com produtos na categoria escolhida.
export const brandsIn=(products,category)=>sortPt(products.filter(p=>inCategory(p,category)).map(p=>p.brand));
export const kindsIn=(products,category,brand)=>sortPt(products.filter(p=>inCategory(p,category)&&(!brand||p.brand===brand)).map(p=>p.kind));
export function filterProducts(products, filters={}) {
  let result=products.filter(p=>inCategory(p,filters.category)&&(!filters.query||matchesQuery(p,filters.query))&&(!filters.brand||p.brand===filters.brand)&&(!filters.kind||p.kind===filters.kind)&&(!filters.favoritesOnly||(filters.favorites||[]).includes(p.id)));
  if(filters.sort==='price-asc') result.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(filters.sort==='price-desc') result.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
  if(filters.sort==='name') result.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  return result;
}
export const colorNames=p=>(p.colors||[]).map(c=>c.name);
// Tamanho e cor são obrigatórios quando o produto tem mais de uma opção.
export function addToCart(cart,product,{size='',color=''}={},quantity=1){
  if(!product)throw new Error('Produto não encontrado.');
  if(product.sizes.length===1)size=product.sizes[0];
  const colors=colorNames(product);if(colors.length===1)color=colors[0];
  if(!product.sizes.includes(size)) throw new Error('Selecione um tamanho para continuar.');
  if(colors.length&&!colors.includes(color)) throw new Error('Selecione uma cor para continuar.');
  if(!Number.isInteger(quantity)||quantity<1) throw new Error('Quantidade inválida.');
  const same=l=>l.id===product.id&&l.size===size&&(l.color||'')===color;
  const existing=cart.find(same);
  const total=cart.filter(l=>l.id===product.id).reduce((s,l)=>s+l.quantity,0);
  if(total+quantity>(product.stock??20)) throw new Error('Quantidade indisponível. O limite da seleção foi atingido.');
  return existing?cart.map(l=>l===existing?{...l,quantity:l.quantity+quantity}:l):[...cart,{id:product.id,size,color,quantity}];
}
export function setQuantity(cart,products,{id,size,color=''},quantity){
  if(!Number.isInteger(quantity)||quantity<0) throw new Error('Quantidade inválida.');
  const same=l=>l.id===id&&l.size===size&&(l.color||'')===color;
  if(quantity===0) return cart.filter(l=>!same(l));
  const product=products.find(p=>p.id===id);
  const index=cart.findIndex(same);
  const next=addToCart(cart.filter(l=>!same(l)),product,{size,color},quantity);
  // mantém a linha na mesma posição da sacola
  if(index<0)return next;const line=next.pop();next.splice(index,0,line);return next;
}
export function cartTotal(cart,products){return cart.reduce((sum,l)=>sum+(products.find(p=>p.id===l.id)?.price||0)*l.quantity,0)}
export function cleanCart(cart,products){
  let result=[];
  for(const l of Array.isArray(cart)?cart:[]){try{result=addToCart(result,products.find(p=>p.id===l.id),{size:l.size,color:l.color||''},l.quantity)}catch{}}
  return result;
}
// Mensagem do pedido enviada ao WhatsApp da loja.
export function orderMessage(cart,products){
  const lines=cart.map(l=>({l,p:products.find(p=>p.id===l.id)})).filter(x=>x.p);
  const priced=lines.filter(x=>x.p.price!==null&&x.p.price!==undefined);
  const total=priced.reduce((s,x)=>s+x.p.price*x.l.quantity,0);
  const pending=lines.length-priced.length;
  const items=lines.map(({l,p},i)=>[
    `${i+1}. ${p.name}`,
    `   Marca: ${p.brand}`,
    `   Cor: ${l.color||'Única'} | Tamanho: ${l.size}`,
    `   Quantidade: ${l.quantity}`,
    `   Valor unitário: ${money(p.price)}`,
    `   Subtotal: ${p.price===null||p.price===undefined?'Sob consulta':money(p.price*l.quantity)}`,
    `   Ref.: ${p.id}`].join('\n'));
  const count=lines.reduce((s,x)=>s+x.l.quantity,0);
  const totalText=!pending?money(total):priced.length?`${money(total)} + ${pending===1?'1 item':pending+' itens'} sob consulta`:'Sob consulta';
  return ['Olá, L&T Club! Quero finalizar este pedido:','',items.join('\n\n'),'',`Itens: ${count}`,`Total do pedido: ${totalText}`,'','Pode confirmar a disponibilidade e as formas de pagamento?'].join('\n');
}
export const whatsappUrl=(number,text)=>`https://wa.me/${String(number||'').replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
export function routeFromHash(hash){
  const [path,query='']=(hash||'#/').replace(/^#/,'').split('?');
  const parts=path.split('/').filter(Boolean);
  if(parts[0]==='produto') {let id=parts[1]||'';try{id=decodeURIComponent(id)}catch{}return {type:'product',id};}
  const params=new URLSearchParams(query),extra={};
  // Filtros e ordenação ficam no endereço para voltarem iguais ao retornar à listagem.
  for(const [key,name] of [['marca','brand'],['tipo','kind'],['ordem','sort']])if(params.get(key))extra[name]=params.get(key);
  if(parts[0]==='colecao') return {type:'collection',category:parts[1]||'todos',query:params.get('q')||'',...extra};
  if(parts[0]==='favoritos')return {type:'favorites',...extra};
  return {type:'home'};
}
export function listHash({category='todos',query='',brand='',kind='',sort='featured'}={},favorites=false){
  const params=new URLSearchParams();if(query)params.set('q',query);if(brand)params.set('marca',brand);if(kind)params.set('tipo',kind);if(sort&&sort!=='featured')params.set('ordem',sort);
  const q=params.toString().replace(/\+/g,'%20');return (favorites?'#/favoritos':'#/colecao/'+category)+(q?'?'+q:'');
}
export function validateCatalog(input){
  const cats=['roupas','tenis','relogios','acessorios'];
  if(!Array.isArray(input)||!input.length||input.length>300)throw new Error('O catálogo deve conter de 1 a 300 produtos.');
  const ids=new Set();
  return input.map(p=>{
    if(!p||typeof p.id!=='string'||!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id))throw new Error('Cada produto precisa de um ID único com letras minúsculas, números e hífens.');
    ids.add(p.id);
    for(const key of ['name','brand','description','material','fit','color','image','badge'])if(typeof p[key]!=='string')throw new Error('Campo de texto inválido: '+key);
    if(!cats.includes(p.category)||(p.price!==null&&(!Number.isFinite(p.price)||p.price<0))||(p.stock!==null&&(!Number.isInteger(p.stock)||p.stock<0)))throw new Error('Categoria, preço ou estoque inválido.');
    if(!Array.isArray(p.sizes)||!p.sizes.length||p.sizes.some(s=>typeof s!=='string'||!s.trim()))throw new Error('Informe ao menos um tamanho.');
    if(!/^#[a-f0-9]{6}$/i.test(p.hex))throw new Error('A cor deve estar em formato hexadecimal, como #15283e.');
    if(!/^(assets\/[^<>"']+|https:\/\/[^<>"']+)$/i.test(p.image))throw new Error('Use uma imagem em assets/ ou um endereço HTTPS.');
    const safeImage=v=>typeof v==='string'&&/^(assets\/[^<>"']+|https:\/\/[^<>"']+)$/i.test(v);
    if(p.colors!==undefined&&(!Array.isArray(p.colors)||p.colors.some(c=>!c||typeof c.name!=='string'||!c.name.trim())))throw new Error('Cores inválidas.');
    if(p.gallery!==undefined&&(!Array.isArray(p.gallery)||!p.gallery.length||p.gallery.some(g=>!g||!safeImage(g.image)||!safeImage(g.thumbnail)||typeof g.label!=='string')))throw new Error('Galeria inválida. Use imagens em assets/ ou HTTPS.');
    return {...p};
  });
}

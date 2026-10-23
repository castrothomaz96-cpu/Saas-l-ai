export const money = value => value===null||value===undefined?'Sob consulta':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export function filterProducts(products, filters={}) {
  const q=(filters.query||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  let result=products.filter(p=>{
    const hay=(p.name+' '+p.brand+' '+p.color+' '+(p.kind||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return (!filters.category||filters.category==='todos'||p.category===filters.category)&&(!q||hay.includes(q))&&(!filters.maxPrice||Number(filters.maxPrice)>=1500||(p.price!==null&&p.price<=Number(filters.maxPrice)))&&(!filters.brand||p.brand===filters.brand)&&(!filters.kind||p.name.split(' ')[0]===filters.kind)&&(!filters.source||(filters.source==='catalog'?!p.demo:p.demo))&&(!filters.size||p.sizes.includes(filters.size))&&(!filters.available||p.stock>0)&&(!filters.favoritesOnly||(filters.favorites||[]).includes(p.id));
  });
  if(filters.sort==='price-asc') result.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(filters.sort==='price-desc') result.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
  if(filters.sort==='name') result.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  return result;
}
export function addToCart(cart,product,size,quantity=1){
  if(!product||!product.sizes.includes(size)) throw new Error('Selecione um tamanho para continuar.');
  if(!Number.isInteger(quantity)||quantity<1) throw new Error('Quantidade inválida.');
  const existing=cart.find(l=>l.id===product.id&&l.size===size);
  const total=cart.filter(l=>l.id===product.id).reduce((s,l)=>s+l.quantity,0);
  if(total+quantity>(product.stock??99)) throw new Error('Quantidade indisponível. O limite da seleção foi atingido.');
  return existing?cart.map(l=>l===existing?{...l,quantity:l.quantity+quantity}:l):[...cart,{id:product.id,size,quantity}];
}
export function setQuantity(cart,products,id,size,quantity){
  if(!Number.isInteger(quantity)||quantity<0) throw new Error('Quantidade inválida.');
  if(quantity===0) return cart.filter(l=>!(l.id===id&&l.size===size));
  const product=products.find(p=>p.id===id);
  const rest=cart.filter(l=>!(l.id===id&&l.size===size));
  return addToCart(rest,product,size,quantity);
}
export function cartTotal(cart,products){return cart.reduce((sum,l)=>sum+(products.find(p=>p.id===l.id)?.price||0)*l.quantity,0)}
export function cleanCart(cart,products){
  let result=[];
  for(const l of Array.isArray(cart)?cart:[]){try{result=addToCart(result,products.find(p=>p.id===l.id),l.size,l.quantity)}catch{}}
  return result;
}
export function routeFromHash(hash){
  const [path,query='']=(hash||'#/').replace(/^#/,'').split('?');
  const parts=path.split('/').filter(Boolean);
  if(parts[0]==='produto') {let id=parts[1]||'';try{id=decodeURIComponent(id)}catch{}return {type:'product',id};}
  if(parts[0]==='colecao') return {type:'collection',category:parts[1]||'todos',query:new URLSearchParams(query).get('q')||''};
  if(parts[0]==='favoritos')return {type:'favorites'};
  return {type:'home'};
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
    if(p.gallery!==undefined&&(!Array.isArray(p.gallery)||!p.gallery.length||p.gallery.some(g=>!g||!safeImage(g.image)||!safeImage(g.thumbnail)||typeof g.label!=='string')))throw new Error('Galeria inválida. Use imagens em assets/ ou HTTPS.');
    return {...p};
  });
}

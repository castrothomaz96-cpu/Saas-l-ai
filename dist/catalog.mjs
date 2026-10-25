// Produtos importados: catalog-products.mjs. Tamanhos, preços e WhatsApp: store-config.mjs.
// Editor no rodapé permite testar alterações locais e exportar JSON.
import {catalogProducts} from './catalog-products.mjs?v=7';
import {sizeGrids,gridByKind,sizesByProduct,prices} from './store-config.mjs?v=7';
export const brand = {
 name:'L&T Club',tagline:'Estilo sem excessos.',
 currency:'BRL',locale:'pt-BR',
};
const allCategories = [
 {id:'todos',name:'Todos'},{id:'roupas',name:'Roupas'},
 {id:'tenis',name:'Tênis e calçados'},{id:'relogios',name:'Relógios'},{id:'acessorios',name:'Acessórios'},
];
export const sizesFor = p => sizesByProduct[p.id] || sizeGrids[gridByKind[p.kind] || 'roupa'];
export const products = catalogProducts.map(p=>({...p,sizes:sizesFor(p),price:prices[p.id]??p.price}));
// Categorias sem produtos cadastrados ficam ocultas.
export const categories = allCategories.filter(c=>c.id==='todos'||products.some(p=>p.category===c.id));

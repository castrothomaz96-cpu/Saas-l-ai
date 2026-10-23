// Produtos importados: catalog-products.mjs. Campos comerciais não informados = null.
// Editor no rodapé permite testar alterações locais e exportar JSON.
import {catalogProducts} from './catalog-products.mjs?v=5';
export const brand = {
 name:'L&T Club',tagline:'Estilo sem excessos.',
 heroTitle:'Presença que\nfala por você.',
 heroText:'Roupas, tênis e acessórios para quem faz do próprio estilo uma assinatura.',
 currency:'BRL',locale:'pt-BR',demo:true,
};
export const categories = [
 {id:'todos',name:'Todos'},{id:'roupas',name:'Roupas'},
 {id:'tenis',name:'Tênis e calçados'},{id:'relogios',name:'Relógios'},{id:'acessorios',name:'Acessórios'},
];
export const demoProducts = [{"id": "chrono-bleu", "name": "Relógio Chrono Bleu", "brand": "L&T Timepieces", "category": "relogios", "price": 899, "image": "assets/watch.webp", "color": "Prata / Navy", "hex": "#aab0b6", "sizes": ["Único"], "stock": 5, "badge": "Exemplo", "description": "Precisão no visual. Mostrador azul profundo e pulseira em aço em um desenho que dispensa excessos.", "material": "Aço inoxidável e mostrador azul. Especificações demonstrativas.", "fit": "Caixa demonstrativa de 40 mm. Pulseira ajustável.", "demo": true, "gallery": [{"image": "assets/watch.webp", "thumbnail": "assets/watch.webp", "label": "Imagem ilustrativa"}]}, {"id": "atlas-black", "name": "Óculos Atlas", "brand": "L&T Accessories", "category": "acessorios", "price": 249, "image": "assets/sunglasses.webp", "color": "Preto", "hex": "#222426", "sizes": ["Único"], "stock": 8, "badge": "Exemplo", "description": "Armação marcante, proporções equilibradas e um acabamento que completa o visual com personalidade.", "material": "Acetato e detalhes metálicos. Imagem ilustrativa.", "fit": "Formato retangular. Largura demonstrativa de 145 mm.", "demo": true, "gallery": [{"image": "assets/sunglasses.webp", "thumbnail": "assets/sunglasses.webp", "label": "Imagem ilustrativa"}]}, {"id": "weekender-navy", "name": "Bolsa Weekender", "brand": "L&T Accessories", "category": "acessorios", "price": 649, "image": "assets/bag.webp", "color": "Azul-marinho", "hex": "#15283e", "sizes": ["Único"], "stock": 4, "badge": "Exemplo", "description": "Do fim de semana à rotina. Um desenho versátil com alças estruturadas, ferragens discretas e espaço para o essencial.", "material": "Couro sintético e ferragens prateadas. Material ilustrativo.", "fit": "Dimensões demonstrativas: 48 × 28 × 24 cm.", "demo": true, "gallery": [{"image": "assets/bag.webp", "thumbnail": "assets/bag.webp", "label": "Imagem ilustrativa"}]}];
export const products = [...catalogProducts,...demoProducts];
export const brands=[...new Set(products.map(p=>p.brand))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
export const kinds=[...new Set(products.map(p=>p.name.split(' ')[0]))].sort((a,b)=>a.localeCompare(b,'pt-BR'));

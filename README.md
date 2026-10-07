# L&T Club

Site da loja L&T Club. É um site estático (HTML, CSS e JavaScript, sem etapa de build): basta publicar a pasta como está, por exemplo no GitHub Pages, Netlify ou Vercel.

## Estrutura

```
index.html            página única (cabeçalho, rodapé e área de conteúdo)
assets/css/style.css  visual do site (cores no topo do arquivo)
assets/js/config.js   WhatsApp, telefone, Instagram, preço padrão e avisos do topo
assets/js/brands.js   marcas: logotipo do círculo, endereço e frase de apresentação
assets/js/catalog.js  catálogo de peças
assets/js/app.js      páginas e navegação
img/hero.jpg          foto principal da página inicial
img/001.webp …        fotos das peças
```

## Páginas

- `#/`: início, com foto principal, círculos das marcas, destaques, categorias, curadoria, marca em destaque e atendimento
- `#/loja`, `#/loja/vestuario`, `#/loja/tenis`, `#/loja/acessorios`: listagem com filtros por seção, tipo e marca, e ordenação
- `#/marca/<marca>`: página de cada marca (é para onde os círculos levam)
- `#/marcas`: todas as marcas
- `#/p/<referência>`: página da peça, com galeria e botão "Pedir pelo WhatsApp"
- `#/busca?q=…`: resultados da busca
- `#/como-comprar`: passo a passo e perguntas frequentes

## Edições comuns

- **WhatsApp e telefone**: edite `assets/js/config.js`.
- **Preço**: por padrão aparece "Sob consulta". Para mostrar um preço numa peça, adicione `p` no catálogo, por exemplo `{"r": "D159", …, "p": "R$ 2.490"}`.
- **Logo de verdade no círculo da marca**: coloque o arquivo em `img/marcas/` e adicione `logo: "img/marcas/moncler.svg"` na marca em `brands.js`.
- **Nova peça**: adicione a foto em `img/` e uma linha em `catalog.js`.

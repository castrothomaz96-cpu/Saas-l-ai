# L&T Club — The Coastal Edit

Vitrine masculina em português. Azul-marinho profundo, areia e marfim com clima de praia e verão; a foto da marina fornecida pelo usuário é a capa (cartão-postal sobre fundo desfocado no computador, tela cheia no celular); seleção de polos, camisetas e shorts em destaque; tipografia editorial; monograma metálico com profundidade discreta. HTML, CSS e módulos JavaScript sem dependências de produção. Hospedar `dist`.

## Fotografias e catálogo

16 PDFs recebidos; três cópias idênticas desconsideradas; 13 arquivos únicos e 742 páginas. São 142 produtos com 1.031 fotografias originais (sem nova compressão; dimensões e SHA-256 em `image-quality.json`). Miniaturas servem só aos botões da galeria.

Cada produto tem título com tipo de peça, marca e modelo (quando identificado nas fotos), cores com as fotos correspondentes e a procedência em `sources`. Cadastros repetidos foram unidos e modelos iguais em cores diferentes viraram um produto com seleção de cor; nenhuma foto foi apagada. O registro está em `catalog_review`, no `catalog-import-manifest.json`. As marcas fictícias de exemplo (relógio, óculos e bolsa) foram retiradas; a categoria Relógios volta a aparecer quando houver produtos nela.

Os cards usam uma moldura única (8:7) e uma foto de capa que cabe nela, com corte mínimo nas bordas. Fotos carregam sob demanda.

## Configuração da loja — `dist/store-config.mjs`

- `whatsapp`: número que recebe os pedidos (só números, com 55 e DDD). Vazio: o WhatsApp abre com a mensagem para o cliente escolher o contato.
- `sizeGrids` e `gridByKind`: grades de tamanho por tipo de peça (roupas P–GG, jeans 38–46, calçados 37–44, boné e gorro “Tamanho único”).
- `sizesByProduct`: tamanhos de um produto específico.
- `prices`: preço de cada produto em reais. Sem preço, aparece “Sob consulta”.

Estoque não é inventado: a página informa que a disponibilidade da cor e do tamanho é confirmada pela loja no WhatsApp.

## Conteúdo e manutenção

- `dist/catalog-products.mjs`: produtos, cores, galerias e procedência.
- `dist/catalog.mjs`: categorias e aplicação das grades e preços.
- `dist/assets/originals/`: fotografias originais e miniaturas de navegação.
- `dist/assets/coastal-cover.jpeg`: capa fornecida pelo proprietário; direção visual em `DESIGN.md`.
- `dist/editorial.css`: visual atual. `dist/styles.css`: estrutura base.
- `dist/ui.mjs`, `dist/app.mjs`, `dist/core.mjs`: telas, interações, filtros, sacola e mensagem do pedido.

## Interações

Categorias; busca por tipo, marca, modelo e cor sem distinção de maiúsculas ou acentos; filtros de marca e tipo que mostram só o que existe na categoria escolhida; ordenação; favoritos; galerias com setas e deslize; seleção de cor (troca a foto) e de tamanho, obrigatórias antes de adicionar à sacola; sacola com quantidades; “Finalizar pedido no WhatsApp” com nome, marca, cor, tamanho, quantidade, valor unitário, subtotal e total.

## Verificação

`node --test tests/store.test.mjs` — 19 verificações: fotos originais e procedência, ausência de duplicados e de marcas fictícias, títulos, cores, tamanhos, filtros por categoria, busca, sacola, mensagem do WhatsApp, segurança. Validado também no navegador a 390 px e 1440 px.

# L&T Club — The Coastal Edit

Vitrine masculina em português. Azul-marinho profundo, areia e marfim com clima de praia e verão; a foto da marina fornecida pelo usuário é a capa (cartão-postal sobre fundo desfocado no computador, tela cheia no celular); seleção de polos, camisetas e shorts em destaque; tipografia editorial; monograma metálico com profundidade discreta. HTML, CSS e módulos JavaScript sem dependências de produção. Hospedar `dist`.

## Fotografias e catálogo

16 PDFs de catálogo (três cópias idênticas desconsideradas; 13 arquivos únicos e 742 páginas) e 6 PDFs complementares da loja (instruções de organização e catálogos Louboutin, Zegna, Off-White e Maison Margiela). São 147 produtos com 1.120 fotografias originais, extraídas sem nova compressão (dimensões e SHA-256 em `image-quality.json`). Miniaturas servem só aos botões da galeria.

Fotos retiradas do site (substituídas ou de produtos removidos) ficam preservadas em `archive/removed-originals/`, fora da pasta publicada. O relatório `docs/correcoes-catalogo.pdf` lista os nomes corrigidos, as fotos substituídas, os produtos novos e o que falta preencher.

Cada produto tem título com tipo de peça, marca e modelo (quando identificado nas fotos), cores com as fotos correspondentes e a procedência em `sources`. Cadastros repetidos foram unidos e modelos iguais em cores diferentes viraram um produto com seleção de cor; nenhuma foto foi apagada. O registro está em `catalog_review`, no `catalog-import-manifest.json`. As marcas fictícias de exemplo (relógio, óculos e bolsa) foram retiradas; a categoria Relógios volta a aparecer quando houver produtos nela.

Os cards usam uma moldura única (8:7) e uma foto de capa que cabe nela, com corte mínimo nas bordas. Na página do produto, a moldura acompanha a proporção de cada foto, sem bordas nem fundo desfocado; fotos pequenas não passam de 1,6× o tamanho original. Fotos carregam sob demanda.

## Configuração da loja — `dist/store-config.mjs`

- `whatsapp`: número que recebe os pedidos (só números, com 55 e DDD). Atual: 5519982179174. O botão abre `https://wa.me/<número>` com a mensagem do pedido, no celular e no computador, sem o cliente precisar ter o contato salvo.
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

Categorias; ao voltar de um produto, a listagem retorna ao mesmo ponto, com os mesmos produtos carregados, filtros e ordenação (filtros ficam no endereço da página e a posição, no histórico do navegador); botão “Voltar” na página do produto; busca por tipo, marca, modelo e cor sem distinção de maiúsculas ou acentos; filtros de marca e tipo que mostram só o que existe na categoria escolhida; ordenação; favoritos; galerias com setas e deslize; seleção de cor (troca a foto) e de tamanho, obrigatórias antes de adicionar à sacola; sacola com quantidades; “Finalizar pedido no WhatsApp” com nome, marca, cor, tamanho, quantidade, valor unitário, subtotal e total.

## Verificação

`node --test tests/store.test.mjs` — 21 verificações: fotos originais e procedência, ausência de duplicados e de marcas fictícias, títulos, cores, tamanhos, filtros por categoria, busca, sacola, mensagem do WhatsApp, segurança. Validado também no navegador a 390 px e 1440 px.

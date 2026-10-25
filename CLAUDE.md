# Continuação da L&T Club no Claude

## Pedido do proprietário
Melhorar o design da loja masculina L&T Club: a aparência está básica e as roupas perderam qualidade nas versões anteriores. Criar uma apresentação premium com clima de praia e verão, usando a marina fornecida como capa. Preservar a identidade azul-marinho. Melhorar composição, tipografia, espaçamento e experiência no celular. Desconsiderar PDFs idênticos repetidos sem apagar modelos ou cores diferentes.

## Prioridades
- Preservar os arquivos originais das roupas em dist/assets/originals/. Não recomprimir nem gerar novamente as peças. Não usar miniaturas no lugar de imagens de produto.
- Imagens de origem pequena não ganham detalhes reais com ampliação. Resolver com enquadramento e layout; solicitar originais maiores quando necessário.
- Preservar catálogo, galerias, filtros, busca, favoritos e sacola.
- Não inventar preços, estoque, autenticidade ou medidas. Há 147 produtos importados; não há itens demonstrativos. Fotos retiradas ficam em archive/removed-originals (fora do site). WhatsApp, grades de tamanho e preços ficam em dist/store-config.mjs.
- A capa atual é dist/assets/coastal-cover.jpeg, enviada pelo proprietário. A resolução é 736 × 414; preservar o original e considerar isso ao enquadrar.
- Antes de redesenhar, ler README.md, DESIGN.md e o código. Implementar melhorias concretas e verificar no celular e no desktop.

## Executar
Projeto estático sem instalação de dependências de produção.
Na pasta LT-Club, execute: python3 -m http.server 8000 --directory dist
No Windows, pode usar: py -m http.server 8000 --directory dist
Abra http://localhost:8000. Não abra index.html diretamente por file://, pois usa módulos JavaScript.
Testes (Node.js 22 ou mais recente): node --test tests/store.test.mjs

## Arquivos principais
- dist/index.html: página de entrada.
- dist/editorial.css e dist/styles.css: visual atual e componentes.
- dist/ui.mjs e dist/app.mjs: telas e interações.
- dist/core.mjs: lógica de catálogo e estado.
- dist/catalog-products.mjs: catálogo importado.
- image-quality.json: dimensões e SHA-256 das imagens.
- catalog-import-manifest.json: procedência e duplicados dos PDFs.

## Limites atuais
Não há backend, pagamentos ou pedidos reais. Sacola, favoritos e editor usam localStorage. As alterações locais do navegador do proprietário não fazem parte deste arquivo; se houver dados editados, importar o JSON exportado por ele. Os PDFs de origem não acompanham o pacote, mas as fotografias extraídas e sua procedência acompanham. Não há credenciais nem vínculo de publicação neste pacote. Confirme com o proprietário antes de publicar em uma hospedagem ou conectar serviços externos.

## Como usar o pacote
No computador, extraia o ZIP e abra a pasta LT-Club no Claude Code. Peça para ler CLAUDE.md e executar o pedido acima. Para o chat comum, use o arquivo LT-Club-para-Claude.txt como contexto de código e envie imagens de referência separadamente. O TXT não contém as fotografias nem substitui o projeto completo.

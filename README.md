# L&T Club — The Coastal Edit

Vitrine masculina em português. Azul-marinho profundo, areia e marfim com clima de praia e verão; a foto da marina fornecida pelo usuário é a capa (cartão-postal sobre fundo desfocado no computador, tela cheia no celular); seleção de polos, camisetas e shorts em destaque; tipografia editorial; monograma metálico com profundidade discreta. HTML, CSS e módulos JavaScript sem dependências de produção. Hospedar `dist`.

## Fotografias e catálogo

16 PDFs recebidos; três cópias idênticas desconsideradas; 13 arquivos únicos e 742 páginas. Os 198 grupos de modelos e cores usam 1.031 fotografias individuais, extraídas em seus arquivos nativos; dois quadros quase idênticos repetidos foram desconsiderados (registrados em `photo_review` no manifesto). Os bytes das imagens originais são preservados, com dimensões, tamanho e SHA-256 em `image-quality.json`. Não há nova compressão nem transformação generativa dos produtos. Miniaturas pequenas servem apenas aos botões da galeria; as vitrines, detalhes e ampliações usam os originais. As fotografias de menor resolução já presentes nos PDFs são mostradas em até sua largura nativa no detalhe e na ampliação.

Ângulos, bordados e detalhes da mesma peça ficam na mesma página de produto; modelos diferentes ganham páginas próprias. Fotos verticais ou horizontais são mostradas inteiras, sem corte, sobre um fundo desfocado da própria foto. `sources` mantém a procedência de cada página. `catalog-import-manifest.json` registra os PDFs e as cópias idênticas. Os nomes descrevem as fotos, sem verificação de autenticidade, estoque ou especificações. Preço e estoque permanecem `null`; a grade fica “A confirmar”. Relógio, óculos e bolsa continuam marcados como exemplos demonstrativos.

## Conteúdo e manutenção

- `dist/catalog-products.mjs`: produtos importados, galerias, procedência e campos comerciais.
- `dist/catalog.mjs`: identidade, categorias e exemplos.
- `dist/assets/originals/`: fotografias originais e pequenas miniaturas de navegação.
- `dist/assets/coastal-cover.jpeg`: arte de capa fornecida pelo usuário, preservada sem recompressão; direção visual em `DESIGN.md`.
- `dist/assets/club-*.otf`: fontes Nimbus, com licença em `dist/assets/font-license.txt`.
- `dist/editorial.css`: direção visual atual. `dist/styles.css`: estrutura base e componentes.
- `dist/ui.mjs` e `dist/app.mjs`: páginas e comportamento.
- `scripts/recover_catalog_photos.py`: recuperação reproduzível dos originais. Uso: `python scripts/recover_catalog_photos.py <diretorio-dos-pdfs> --stage <diretorio-de-preparo>`.

**Editar catálogo**, no rodapé, permite testar campos comerciais e exportar/importar JSON. As alterações ficam no navegador; uma atualização hospedada exige incorporá-las em nova versão. Preço e estoque vazios preservam “sob consulta”. Edições locais antigas conservam os dados comerciais e recebem as novas fotografias quando ainda apontavam às imagens reduzidas.

## Interações

Categorias, busca sem distinção de acentos, filtros combinados por marca, tipo, origem, preço, tamanho e estoque informado; ordenação; 24 produtos por etapa; favoritos; sacola local; páginas diretas; galerias individuais com botões anterior/próxima; ampliação da fotografia original. A seleção se encerra em uma simulação, sem envio de pedidos ou cobrança.

A configuração de acesso deve ser conferida no provedor de hospedagem. Não há pagamentos, analytics nem contato externo. A capa usa a arte fornecida pelo proprietário.

## Verificação

`node --test tests/store.test.mjs`

20 verificações de integridade das fotografias, cobertura das páginas, dados comerciais pendentes, filtros, rotas, galerias, favoritos, edição, segurança e seleção local. Sintaxe dos módulos também verificada. Fotografias e campanha inspecionadas visualmente. Revisão em navegador (Chromium/Playwright) a 390 px e 1440 px: início, coleção, todas as páginas de produto, busca, filtros, favoritos, sacola, galeria com deslize e ampliação, sem imagens quebradas nem rolagem horizontal.

// Configuração da loja. Edite este arquivo para ajustar o atendimento e os tamanhos.

// WhatsApp que recebe os pedidos: só números, com DDI 55 e DDD. Exemplo: '5511987654321'.
// O botão "Finalizar pedido" abre https://wa.me/<número> com a mensagem do pedido, no celular e no computador.
// Número informado pela loja: +55 19 98217-9174. O segundo número enviado (1199374509) tem um dígito a menos
// que um celular atual e não foi usado; para trocar, basta substituir o número abaixo.
export const whatsapp = '5519982179174';

// Grades de tamanho por tipo de peça. São as opções que o cliente pode escolher;
// a disponibilidade de cada tamanho é confirmada pela loja no WhatsApp.
export const sizeGrids = {
  roupa: ['P', 'M', 'G', 'GG'],
  jeans: ['38', '40', '42', '44', '46'],
  calcado: ['37', '38', '39', '40', '41', '42', '43', '44'],
  unico: ['Tamanho único'],
};

// Qual grade cada tipo de peça usa (o tipo é a primeira palavra do nome do produto).
export const gridByKind = {
  'Boné': 'unico', 'Gorro': 'unico',
  'Calça jeans': 'jeans',
  'Tênis': 'calcado', 'Sandália': 'calcado', 'Clog': 'calcado', 'Mocassim': 'calcado', 'Chinelo': 'calcado',
};

// Tamanhos de um produto específico, quando forem diferentes da grade do tipo.
// Exemplo: 'rl-polo': ['P', 'M', 'G'],
export const sizesByProduct = {
};

// Preços informados pela loja, em reais. Produtos sem preço aparecem como "Sob consulta".
// Exemplo: 'rl-polo': 349.9,
export const prices = {
};

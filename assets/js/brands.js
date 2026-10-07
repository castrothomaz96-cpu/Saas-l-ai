/* Marcas da loja.
   A chave é o nome exatamente como aparece no catálogo.
   s    = endereço da página da marca (#/marca/s)
   logo = caminho de uma imagem de logo (ex.: "img/marcas/amiri.svg").
          Enquanto não houver logo, o círculo mostra o nome tipográfico abaixo:
   t    = texto do logotipo (\n quebra a linha), sub = linha menor embaixo
   f    = fonte: "serif", "didone" ou "sans"; w = peso; i = itálico
   ls   = espaçamento entre letras (em); fs = tamanho da letra (px)
   d    = frase curta mostrada na página da marca */
window.LT_BRANDS = {
  "Amiri":                  {s:"amiri",            t:"AMIRI",            f:"serif",  w:600, ls:.22, fs:17, d:"Grife de Los Angeles criada por Mike Amiri em 2014, entre o luxo e a cultura rock."},
  "Moncler":                {s:"moncler",          t:"MONCLER",          f:"sans",   w:600, ls:.06, fs:15, d:"Nascida em 1952 nos Alpes franceses, é referência mundial em jaquetas de plumas."},
  "On":                     {s:"on",               t:"On",               f:"sans",   w:700, ls:-.04, fs:34, d:"Marca suíça de performance fundada em Zurique em 2010."},
  "Ralph Lauren":           {s:"ralph-lauren",     t:"RALPH\nLAUREN",    f:"serif",  w:600, ls:.16, fs:13, d:"O clássico americano desde 1967 — o Pony bordado é sinônimo de estilo preppy."},
  "Hermès":                 {s:"hermes",           t:"HERMÈS",           f:"didone", w:500, ls:.14, fs:15, sub:"PARIS", d:"Maison parisiense fundada em 1837, mestre do couro e do artesanato."},
  "Arc'teryx":              {s:"arcteryx",         t:"ARC'TERYX",        f:"sans",   w:600, ls:.05, fs:13, d:"Outdoor técnico canadense, nascido em North Vancouver em 1989."},
  "Burberry":               {s:"burberry",         t:"BURBERRY",         f:"serif",  w:700, ls:.08, fs:15, d:"Casa britânica fundada em 1856, criadora do trench coat e do xadrez icônico."},
  "Loro Piana":             {s:"loro-piana",       t:"LORO\nPIANA",      f:"serif",  w:500, ls:.2,  fs:14, d:"Tradição italiana em lãs e cashmere nobres desde 1924."},
  "Comme des Garçons PLAY": {s:"comme-des-garcons-play", t:"PLAY",       f:"sans",   w:700, ls:.04, fs:20, sub:"COMME des GARÇONS", d:"A linha casual de Rei Kawakubo, marcada pelo coração com olhos."},
  "Prada":                  {s:"prada",            t:"PRADA",            f:"didone", w:600, ls:.16, fs:17, d:"Fundada em Milão em 1913, sinônimo do luxo contemporâneo italiano."},
  "Dior":                   {s:"dior",             t:"Dior",             f:"didone", w:400, ls:.01, fs:26, d:"Maison fundada por Christian Dior em Paris, em 1946."},
  "The North Face":         {s:"the-north-face",   t:"THE\nNORTH\nFACE", f:"sans",   w:700, ls:.02, fs:12, d:"Nascida em São Francisco em 1966, ícone do outdoor e das jaquetas de plumas."},
  "Lacoste":                {s:"lacoste",          t:"LACOSTE",          f:"sans",   w:500, ls:.14, fs:13, d:"O crocodilo francês criado por René Lacoste em 1933."},
  "Saint Laurent":          {s:"saint-laurent",    t:"SAINT\nLAURENT",   f:"sans",   w:400, ls:.22, fs:11, d:"A maison de Yves Saint Laurent, fundada em Paris em 1961."},
  "Casablanca":             {s:"casablanca",       t:"Casablanca",       f:"serif",  w:500, i:1, ls:0,  fs:19, d:"Fundada por Charaf Tajer em Paris em 2018, com estética de clube e resort."},
  "Maison Margiela":        {s:"maison-margiela",  t:"Maison\nMargiela", f:"sans",   w:400, ls:.02, fs:13, d:"Fundada por Martin Margiela em Paris em 1988 — conceitual e desconstruída."},
  "Off-White":              {s:"off-white",        t:"OFF—WHITE",        f:"sans",   w:500, ls:.04, fs:12, sub:"c/o VIRGIL ABLOH", d:"Criada por Virgil Abloh em Milão em 2012, a ponte entre streetwear e luxo."},
  "Zegna":                  {s:"zegna",            t:"ZEGNA",            f:"sans",   w:500, ls:.26, fs:15, d:"Alfaiataria e tecidos italianos desde 1910."},
  "Loewe":                  {s:"loewe",            t:"LOEWE",            f:"didone", w:500, ls:.2,  fs:15, d:"Maison espanhola fundada em Madri em 1846, famosa pelo couro."},
  "Valentino":              {s:"valentino",        t:"VALENTINO",        f:"serif",  w:600, ls:.14, fs:13, d:"Moda romana fundada por Valentino Garavani em 1960."},
  "Vilebrequin":            {s:"vilebrequin",      t:"Vilebrequin",      f:"serif",  w:500, i:1, ls:0,  fs:17, d:"Moda praia de Saint-Tropez desde 1971."}
};

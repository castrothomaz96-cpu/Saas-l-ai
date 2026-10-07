(() => {
"use strict";

const C = window.LT_CONFIG || {};
const DATA = window.LT_DATA || [];
const BR = window.LT_BRANDS || {};

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plural = (n, a, b) => `${n.toLocaleString("pt-BR")} ${n === 1 ? a : b}`;
const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const slugify = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const wa = text => `https://wa.me/${C.WHATSAPP}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const price = p => p.p || C.PRECO || "Sob consulta";
const NOME = C.NOME || "L&T Club";

const ICON = {
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z"/></svg>',
  hanger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5v1.2L3.5 15a1.3 1.3 0 0 0 .8 2.4h15.4a1.3 1.3 0 0 0 .8-2.4L12 8.7"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="8" width="19" height="8" rx="1"/><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4"/></svg>',
  insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>'
};

/* ---------- catálogo ---------- */
const SECTIONS = {
  vestuario:  {t: "Vestuário",  d: "Camisetas, camisas, blusas de frio, calças, shorts e conjuntos."},
  tenis:      {t: "Tênis",      d: "Tênis, sandálias e chinelos."},
  acessorios: {t: "Acessórios", d: "Bonés, gorros, bolsas, meias, cachecóis e mais."}
};
const SEC = c => c === "calcados" ? "tenis" : c === "acessorios" ? "acessorios" : "vestuario";
const TYPES = [
  {k: "camisetas", t: "Camisetas", c: ["camisetas"]},
  {k: "camisas", t: "Camisas e polos", c: ["camisas", "polos"]},
  {k: "frio", t: "Blusas de frio (todas)", c: ["moletons", "malhas", "jaquetas"], grp: true},
  {k: "moletons", t: "Moletons", c: ["moletons"]},
  {k: "malhas", t: "Suéteres e malhas", c: ["malhas"]},
  {k: "jaquetas", t: "Jaquetas e casacos", c: ["jaquetas"]},
  {k: "calcas", t: "Calças", c: ["calcas"]},
  {k: "shorts", t: "Shorts e bermudas", c: ["shorts"]},
  {k: "conjuntos", t: "Conjuntos", c: ["conjuntos"]},
  {k: "calcados", t: "Tênis e calçados", c: ["calcados"]},
  {k: "acessorios", t: "Acessórios", c: ["acessorios"]}
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.k, t]));
const typeLabel = k => TYPE[k].t.replace(" (todas)", "");
const CATNAME = {camisetas: "Camisetas", camisas: "Camisas", polos: "Polos", malhas: "Suéteres e malhas", moletons: "Moletons", jaquetas: "Jaquetas e casacos", conjuntos: "Conjuntos", calcas: "Calças", shorts: "Shorts e bermudas", calcados: "Tênis e calçados", acessorios: "Acessórios"};

DATA.forEach((p, i) => {
  if (!BR[p.b]) BR[p.b] = {s: slugify(p.b), t: p.b.toUpperCase(), f: "sans", w: 500, ls: .08, fs: 13};
  p.i = i; p.s = SEC(p.c); p.bs = BR[p.b].s;
});
const BY_REF = new Map(DATA.map(p => [p.r, p]));
const BRANDS = [...new Set(DATA.map(p => p.b))]
  .map(name => ({...BR[name], name, n: DATA.filter(p => p.b === name).length}))
  .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "pt"));
const BRAND = new Map(BRANDS.map(b => [b.s, b]));
const BRANDS_AZ = [...BRANDS].sort((a, b) => a.name.localeCompare(b.name, "pt"));
const IDX = DATA.map(p => norm([p.n, p.b, p.d, p.r, CATNAME[p.c], SECTIONS[p.s].t].join(" ")));

const byType = (list, k) => k ? list.filter(p => TYPE[k].c.includes(p.c)) : list;

/* Intercala as marcas para a vitrine ficar variada (peças com mais fotos primeiro). */
function mix(list, n = list.length) {
  const groups = new Map();
  list.forEach(p => { if (!groups.has(p.b)) groups.set(p.b, []); groups.get(p.b).push(p); });
  const qs = [...groups.values()]
    .map(g => g.sort((a, b) => (b.img.length > 1) - (a.img.length > 1) || a.i - b.i))
    .sort((a, b) => b.length - a.length);
  const out = [];
  for (let round = 0; out.length < n; round++) {
    let added = false;
    for (const q of qs) { if (q[round]) { out.push(q[round]); added = true; if (out.length >= n) break; } }
    if (!added) break;
  }
  return out;
}
function sortList(list, o) {
  if (o === "marca") return [...list].sort((a, b) => a.b.localeCompare(b.b, "pt") || a.i - b.i);
  if (o === "nome") return [...list].sort((a, b) => a.n.localeCompare(b.n, "pt") || a.i - b.i);
  if (o === "ref") return [...list].sort((a, b) => a.r.localeCompare(b.r, "pt", {numeric: true}));
  return mix(list);
}
function search(q) {
  const toks = norm(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  return DATA.filter((p, i) => toks.every(t => IDX[i].includes(t)));
}

/* ---------- componentes ---------- */
function wordmark(b) {
  if (b.logo) return `<img class="wm-img" src="${esc(b.logo)}" alt="${esc(b.name)}">`;
  const lines = String(b.t).split("\n").map(esc).join("<br>");
  return `<span class="wm wm-${b.f || "sans"}${b.i ? " wm-i" : ""}" style="--fs:${b.fs || 13};--ls:${b.ls || 0}em;--w:${b.w || 500}" aria-hidden="true">${lines}${b.sub ? `<small>${esc(b.sub)}</small>` : ""}</span>`;
}
function circle(b, extra = "") {
  return `<a class="bcircle" href="#/marca/${b.s}" aria-label="${esc(b.name)} — ${plural(b.n, "peça", "peças")}">
    <span class="ring">${wordmark(b)}</span>${extra}</a>`;
}
function card(p) {
  const alt = p.img[1];
  return `<a class="card" href="#/p/${esc(p.r)}">
    <span class="ph${alt ? " has-alt" : ""}">
      <img loading="lazy" decoding="async" src="${esc(p.img[0])}" alt="${esc(p.n + " — " + p.b)}">
      ${alt ? `<img class="alt" loading="lazy" decoding="async" src="${esc(alt)}" alt="">` : ""}
      ${p.img.length > 1 ? `<span class="badge">${p.img.length} fotos</span>` : ""}
      <span class="quick">Ver detalhes</span>
    </span>
    <span class="meta"><span class="brand">${esc(p.b)}</span><span class="name">${esc(p.n)}</span><span class="price">${esc(price(p))}</span></span>
  </a>`;
}
function rail(id, items, cls = "") {
  return `<div class="rail ${cls}" id="${id}" tabindex="0">${items}</div>`;
}
function railBtns(id) {
  return `<span class="rail-btns"><button class="rail-btn" data-rail="${id}" data-dir="-1" aria-label="Anterior">${ICON.arrowL}</button><button class="rail-btn" data-rail="${id}" data-dir="1" aria-label="Próximo">${ICON.arrowR}</button></span>`;
}
function crumbs(items) {
  return `<nav class="crumbs" aria-label="Você está em">${items.map((x, i) => i < items.length - 1
    ? `<a href="${x[1]}">${esc(x[0])}</a><span aria-hidden="true">/</span>`
    : `<span aria-current="page">${esc(x[0])}</span>`).join("")}</nav>`;
}
const PAGE = 24;
const shownMem = new Map();
function gridBlock(list, key) {
  const shown = Math.min(list.length, shownMem.get(key) || PAGE);
  return `<div class="grid" id="grid">${list.slice(0, shown).map(card).join("")}</div>${moreBlock(list.length, shown)}`;
}
function moreBlock(total, shown) {
  if (!total) return "";
  return `<div class="more" id="more">
    <p class="more-txt">Você viu ${shown.toLocaleString("pt-BR")} de ${plural(total, "peça", "peças")}</p>
    <span class="more-bar"><span style="width:${Math.round(shown / total * 100)}%"></span></span>
    ${shown < total ? `<button class="btn btn-outline" data-more>Carregar mais</button>` : ""}
  </div>`;
}
let currentList = [];

/* ---------- rotas ---------- */
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  return {
    parts: path.split("/").filter(Boolean).map(decodeURIComponent),
    q: Object.fromEntries(new URLSearchParams(qs || "")),
    path
  };
}
function href(path, q) {
  const s = new URLSearchParams(Object.entries(q).filter(([, v]) => v)).toString();
  return `#/${path}${s ? "?" + s : ""}`;
}

/* Página inicial */
const FEAT = [
  {k: "destaques", t: "Destaques", f: () => DATA, to: "#/loja"},
  {k: "jaquetas", t: "Jaquetas e casacos", f: () => byType(DATA, "jaquetas"), to: "#/loja/vestuario?tipo=jaquetas"},
  {k: "camisetas", t: "Camisetas", f: () => byType(DATA, "camisetas"), to: "#/loja/vestuario?tipo=camisetas"},
  {k: "malhas", t: "Suéteres e malhas", f: () => byType(DATA, "malhas"), to: "#/loja/vestuario?tipo=malhas"},
  {k: "conjuntos", t: "Conjuntos", f: () => byType(DATA, "conjuntos"), to: "#/loja/vestuario?tipo=conjuntos"},
  {k: "acessorios", t: "Acessórios", f: () => DATA.filter(p => p.s !== "vestuario"), to: "#/loja/acessorios"}
];
const CATS = [
  {t: "Jaquetas e casacos", ref: "D159", tipo: "jaquetas", to: "#/loja/vestuario?tipo=jaquetas"},
  {t: "Camisetas", ref: "D020", tipo: "camisetas", to: "#/loja/vestuario?tipo=camisetas"},
  {t: "Suéteres e malhas", ref: "N17", tipo: "malhas", to: "#/loja/vestuario?tipo=malhas"},
  {t: "Acessórios", ref: "D005", tipo: "acessorios", to: "#/loja/acessorios"}
];
const EDITORIAL = ["D153", "D303", "D278", "D198"];
const SPOT = ["moncler", "amiri", "ralph-lauren", "on", "hermes", "arcteryx"].filter(s => BRAND.has(s));
let featState = "destaques", spotState = SPOT[0];

function featGrid(k) {
  const f = FEAT.find(x => x.k === k) || FEAT[0];
  return `<div class="grid grid-feat">${mix(f.f(), 8).map(card).join("")}</div>
    <div class="center-cta"><a class="btn btn-outline" href="${f.to}">Ver tudo em ${esc(f.t.toLowerCase())}</a></div>`;
}
function spotBody(slug) {
  const b = BRAND.get(slug);
  const list = mix(DATA.filter(p => p.b === b.name), 12);
  return `<div class="spot-head">
      <span class="ring ring-sm">${wordmark(b)}</span>
      <div><h3 class="spot-name">${esc(b.name)}</h3><p class="spot-d">${esc(b.d || "")}</p></div>
      <a class="link-arrow" href="#/marca/${b.s}">Ver as ${plural(b.n, "peça", "peças")} ${ICON.arrowR}</a>
    </div>
    ${rail("rail-spot", list.map(card).join(""), "rail-cards")}`;
}
function homeView() {
  const total = DATA.length, nb = BRANDS.length;
  const ed = EDITORIAL.map(r => BY_REF.get(r)).filter(Boolean);
  return {
    nav: "home",
    html: `
<section class="hero" aria-label="${esc(NOME)}">
  <img class="hero-img" src="img/hero.jpg" alt="" fetchpriority="high">
  <span class="hero-veil" aria-hidden="true"></span>
  <div class="hero-inner">
    <span class="hero-eyebrow">Grifes selecionadas</span>
    <h1 class="hero-title">L<em>&amp;</em>T Club</h1>
    <span class="hero-rule" aria-hidden="true"></span>
    <a class="hero-link" href="#/loja">Explorar a coleção</a>
  </div>
</section>

<section class="brand-strip" aria-labelledby="bsT">
  <div class="wrap sec-head">
    <div><span class="eyebrow">${nb} marcas</span><h2 class="sec-title" id="bsT">Nossas marcas</h2></div>
    <div class="sec-tools"><a class="link-arrow" href="#/marcas">Ver todas ${ICON.arrowR}</a>${railBtns("rail-brands")}</div>
  </div>
  ${rail("rail-brands", BRANDS.map(b => circle(b, `<span class="bcount">${plural(b.n, "peça", "peças")}</span>`)).join(""), "rail-brands")}
</section>

<section class="section" aria-labelledby="ftT">
  <div class="wrap">
    <div class="sec-head center">
      <div><span class="eyebrow">${plural(total, "peça", "peças")} na loja</span><h2 class="sec-title" id="ftT">Destaques da coleção</h2></div>
    </div>
    <div class="tabs" role="tablist" aria-label="Categorias em destaque">
      ${FEAT.map(f => `<button role="tab" class="tab" data-feat="${f.k}" aria-selected="${f.k === featState}">${esc(f.t)}</button>`).join("")}
    </div>
    <div id="featBody">${featGrid(featState)}</div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="ctT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Compre por categoria</span><h2 class="sec-title" id="ctT">O que você procura?</h2></div>
      <a class="link-arrow" href="#/loja">Ver todas as peças ${ICON.arrowR}</a></div>
    <div class="cat-grid">
      ${CATS.map(c => {
        const p = BY_REF.get(c.ref);
        const n = c.tipo === "acessorios" ? DATA.filter(x => x.s === "acessorios").length : byType(DATA, c.tipo).length;
        return `<a class="cat" href="${c.to}">${p ? `<img loading="lazy" src="${esc(p.img[0])}" alt="">` : ""}
          <span class="cat-ov"><span class="cat-t">${esc(c.t)}</span><span class="cat-n">${plural(n, "peça", "peças")} <i>${ICON.arrowR}</i></span></span></a>`;
      }).join("")}
    </div>
  </div>
</section>

<section class="editorial" aria-labelledby="edT">
  <div class="ed-mosaic">${ed.map(p => `<a href="#/p/${esc(p.r)}"><img loading="lazy" src="${esc(p.img[0])}" alt="${esc(p.n + " — " + p.b)}"></a>`).join("")}</div>
  <div class="ed-txt">
    <span class="eyebrow eyebrow-light">Curadoria ${esc(NOME)}</span>
    <h2 id="edT">Peças escolhidas<br><em>uma a uma</em></h2>
    <p>São ${plural(total, "peça", "peças")} de ${nb} grifes, de Moncler a Hermès. Fale com a gente e receba fotos, tamanhos e cores disponíveis de cada modelo antes de fechar o pedido.</p>
    <div class="ed-actions">
      <a class="btn btn-light" href="#/loja">Ver a coleção</a>
      <a class="btn btn-ghost-light" href="${wa("Olá! Vim pelo site da " + NOME + " e queria ajuda para escolher uma peça.")}" target="_blank" rel="noopener">Falar no WhatsApp</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="spT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Marca em destaque</span><h2 class="sec-title" id="spT">Explore por grife</h2></div>${railBtns("rail-spot")}</div>
    <div class="tabs tabs-left" role="tablist" aria-label="Marca em destaque">
      ${SPOT.map(s => `<button role="tab" class="tab" data-spot="${s}" aria-selected="${s === spotState}">${esc(BRAND.get(s).name)}</button>`).join("")}
    </div>
    <div id="spotBody">${spotBody(spotState)}</div>
  </div>
</section>

${servicesBlock()}
${ctaBand()}`
  };
}
function servicesBlock() {
  return `<section class="services" aria-label="Por que comprar com a gente">
  <div class="wrap svc-grid">
    <div class="svc">${ICON.chat}<div><h3>Atendimento personalizado</h3><p>Você fala direto com a gente pelo WhatsApp, do primeiro contato à entrega.</p></div></div>
    <div class="svc">${ICON.ruler}<div><h3>Tamanhos e cores sob consulta</h3><p>Confirmamos a disponibilidade de cada modelo antes de fechar o pedido.</p></div></div>
    <div class="svc">${ICON.hanger}<div><h3>Curadoria de grifes</h3><p>${plural(BRANDS.length, "marca selecionada", "marcas selecionadas")} e ${plural(DATA.length, "peça", "peças")} para escolher.</p></div></div>
  </div>
</section>`;
}
function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap">
    <span class="eyebrow eyebrow-light">Atendimento</span>
    <h2>Procurando um modelo específico?</h2>
    <p>Mande a referência ou uma foto da peça. A gente responde com tamanhos, cores e valores.</p>
    <a class="btn btn-light" href="${wa("Olá! Estou procurando um modelo específico.")}" target="_blank" rel="noopener">Chamar no WhatsApp</a>
  </div>
</section>`;
}

/* Loja: todas as peças ou uma seção, com filtros */
function shopView(r) {
  const secK = r.parts[1];
  if (secK && !SECTIONS[secK]) return notFound();
  const tipo = TYPE[r.q.tipo] ? r.q.tipo : "";
  const marca = BRAND.has(r.q.marca) ? r.q.marca : "";
  const ordem = ["marca", "nome", "ref"].includes(r.q.ordem) ? r.q.ordem : "";
  const path = "loja" + (secK ? "/" + secK : "");
  const base = secK ? DATA.filter(p => p.s === secK) : DATA;
  const tipoSet = byType(base, tipo);
  const brandSet = marca ? base.filter(p => p.bs === marca) : base;
  const list = sortList(tipoSet.filter(p => !marca || p.bs === marca), ordem);
  currentList = list;
  const q = {tipo, marca, ordem};
  const title = secK ? SECTIONS[secK].t : "Novidades";
  const sub = [tipo && typeLabel(tipo), marca && BRAND.get(marca).name].filter(Boolean).join(" · ");

  const opt = (label, n, on, to) => `<a class="fopt${on ? " on" : ""}" href="${to}" data-keep="1"${on ? ' aria-current="true"' : ""}><span>${esc(label)}</span>${n != null ? `<span class="n">${n}</span>` : ""}</a>`;
  const secOpts = [opt("Todas as peças", DATA.length, !secK, href("loja", {marca, ordem}))]
    .concat(Object.entries(SECTIONS).map(([k, s]) => opt(s.t, DATA.filter(p => p.s === k).length, secK === k, href("loja/" + k, {marca, ordem}))));
  const types = TYPES.map(t => ({...t, n: byType(brandSet, t.k).length})).filter(t => t.n || t.k === tipo);
  const typeOpts = [opt("Todos os tipos", brandSet.length, !tipo, href(path, {...q, tipo: ""}))]
    .concat(types.map(t => opt(t.t, t.n, tipo === t.k, href(path, {...q, tipo: t.k}))));
  const brands = BRANDS_AZ.map(b => ({...b, c: tipoSet.filter(p => p.bs === b.s).length})).filter(b => b.c || b.s === marca);
  const brandOpts = [opt("Todas as marcas", tipoSet.length, !marca, href(path, {...q, marca: ""}))]
    .concat(brands.map(b => opt(b.name, b.c, marca === b.s, href(path, {...q, marca: b.s}))));

  const pills = [
    tipo && `<a class="pill" href="${href(path, {...q, tipo: ""})}" data-keep="1">${esc(typeLabel(tipo))} ${ICON.close}</a>`,
    marca && `<a class="pill" href="${href(path, {...q, marca: ""})}" data-keep="1">${esc(BRAND.get(marca).name)} ${ICON.close}</a>`,
    (tipo || marca) && `<a class="pill-clear" href="${href(path, {ordem})}" data-keep="1">Limpar filtros</a>`
  ].filter(Boolean).join("");

  return {
    nav: secK || "loja",
    title: sub ? `${title} · ${sub}` : title,
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ...(secK ? [["Loja", "#/loja"], [title]] : [[title]])])}
  <header class="page-head">
    <h1>${esc(title)}${sub ? ` <em>· ${esc(sub)}</em>` : ""}</h1>
    <p>${esc(secK ? SECTIONS[secK].d : "Todas as peças da loja, de todas as marcas.")}</p>
  </header>
  <div class="shop" id="shop">
    <aside class="filters" id="filters" aria-label="Filtros">
      <div class="filters-head"><b>Filtrar</b><button class="icon-btn" data-filters="close" aria-label="Fechar filtros">${ICON.close}</button></div>
      <div class="facet"><h3>Seção</h3>${secOpts.join("")}</div>
      ${types.length > 1 ? `<div class="facet"><h3>Tipo de peça</h3>${typeOpts.join("")}</div>` : ""}
      <div class="facet"><h3>Marca</h3>${brandOpts.join("")}</div>
    </aside>
    <div class="shop-main" id="shopMain">
      <div class="toolbar">
        <button class="btn-filter" data-filters="open">${ICON.filter} Filtrar</button>
        <span class="count">${plural(list.length, "peça", "peças")}</span>
        <label class="sort">Ordenar
          <select id="sortSel" data-path="${esc(path)}" data-q="${esc(JSON.stringify({tipo, marca}))}">
            <option value="">Destaques</option>
            <option value="marca"${ordem === "marca" ? " selected" : ""}>Marca (A–Z)</option>
            <option value="nome"${ordem === "nome" ? " selected" : ""}>Nome (A–Z)</option>
            <option value="ref"${ordem === "ref" ? " selected" : ""}>Referência</option>
          </select>
        </label>
      </div>
      ${pills ? `<div class="pills">${pills}</div>` : ""}
      ${list.length ? gridBlock(list, location.hash) : `<div class="empty"><p>Nenhuma peça com esses filtros.</p><a class="btn btn-outline" href="${href(path, {})}" data-keep="1">Limpar filtros</a></div>`}
    </div>
  </div>
</div>
<div class="scrim" data-filters="close" hidden></div>`
  };
}

/* Página de uma marca */
function brandView(r) {
  const b = BRAND.get(r.parts[1]);
  if (!b) return notFound();
  const all = DATA.filter(p => p.b === b.name);
  const tipo = TYPE[r.q.tipo] ? r.q.tipo : "";
  const ordem = ["marca", "nome", "ref"].includes(r.q.ordem) ? r.q.ordem : "";
  const list = sortList(byType(all, tipo), ordem);
  currentList = list;
  const path = "marca/" + b.s;
  const types = TYPES.filter(t => !t.grp).map(t => ({...t, n: byType(all, t.k).length})).filter(t => t.n);
  const others = BRANDS.filter(x => x.s !== b.s);
  return {
    nav: "marcas",
    title: b.name,
    html: `
<section class="brand-hero">
  <div class="wrap">
    ${crumbs([["Início", "#/"], ["Marcas", "#/marcas"], [b.name]])}
    <div class="bh-row">
      <span class="ring ring-xl">${wordmark(b)}</span>
      <div class="bh-txt">
        <span class="eyebrow eyebrow-light">${plural(all.length, "peça", "peças")}</span>
        <h1>${esc(b.name)}</h1>
        ${b.d ? `<p>${esc(b.d)}</p>` : ""}
        <a class="link-arrow light" href="${wa(`Olá! Queria saber mais sobre as peças da ${b.name}.`)}" target="_blank" rel="noopener">Perguntar sobre ${esc(b.name)} ${ICON.arrowR}</a>
      </div>
    </div>
  </div>
</section>
<div class="wrap" id="shopMain">
  <div class="toolbar toolbar-brand">
    <div class="chips" role="group" aria-label="Tipo de peça">
      <a class="chip${!tipo ? " on" : ""}" href="${href(path, {ordem})}" data-keep="1">Tudo <span>${all.length}</span></a>
      ${types.length > 1 ? types.map(t => `<a class="chip${tipo === t.k ? " on" : ""}" href="${href(path, {tipo: t.k, ordem})}" data-keep="1">${esc(t.t)} <span>${t.n}</span></a>`).join("") : ""}
    </div>
    <label class="sort">Ordenar
      <select id="sortSel" data-path="${esc(path)}" data-q="${esc(JSON.stringify({tipo}))}">
        <option value="">Destaques</option>
        <option value="nome"${ordem === "nome" ? " selected" : ""}>Nome (A–Z)</option>
        <option value="ref"${ordem === "ref" ? " selected" : ""}>Referência</option>
      </select>
    </label>
  </div>
  ${gridBlock(list, location.hash)}
</div>
<section class="section section-tint" aria-labelledby="obT">
  <div class="wrap sec-head"><div><span class="eyebrow">Continue explorando</span><h2 class="sec-title" id="obT">Outras marcas</h2></div>${railBtns("rail-brands")}</div>
  ${rail("rail-brands", others.map(x => circle(x, `<span class="bcount">${esc(x.name)}</span>`)).join(""), "rail-brands")}
</section>`
  };
}

/* Todas as marcas */
function brandsView() {
  return {
    nav: "marcas",
    title: "Marcas",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Marcas"]])}
  <header class="page-head center">
    <h1>Nossas marcas</h1>
    <p>${plural(BRANDS.length, "grife selecionada", "grifes selecionadas")}. Toque numa marca para ver todas as peças dela.</p>
  </header>
  <div class="brand-grid">
    ${BRANDS_AZ.map(b => `<a class="bcard" href="#/marca/${b.s}">
      <span class="ring ring-lg">${wordmark(b)}</span>
      <span class="bcard-name">${esc(b.name)}</span>
      <span class="bcard-n">${plural(b.n, "peça", "peças")}</span>
      ${b.d ? `<span class="bcard-d">${esc(b.d)}</span>` : ""}
    </a>`).join("")}
  </div>
</div>
${ctaBand()}`
  };
}

/* Página da peça */
function productView(r) {
  const p = BY_REF.get(r.parts[1]);
  if (!p) return notFound();
  const b = BRAND.get(p.bs);
  const sameBrand = DATA.filter(x => x.b === p.b && x !== p);
  const related = [...new Set([
    ...sameBrand.filter(x => x.c === p.c),
    ...sameBrand,
    ...DATA.filter(x => x.c === p.c && x.b !== p.b)
  ])].slice(0, 12);
  const multi = p.img.length > 1;
  const msg = `Olá! Tenho interesse na peça ${p.n} ${p.b} (Ref. ${p.r}).`;
  return {
    nav: p.s,
    title: `${p.n} ${p.b}`,
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], [SECTIONS[p.s].t, "#/loja/" + p.s], [p.b, "#/marca/" + p.bs], [p.n]])}
  <article class="pdp">
    <div class="gallery">
      <div class="g-main">
        <img id="gMain" src="${esc(p.img[0])}" alt="${esc(p.n + " — " + p.b)}">
        ${multi ? `<button class="g-nav prev" data-g="-1" aria-label="Foto anterior">${ICON.arrowL}</button>
        <button class="g-nav next" data-g="1" aria-label="Próxima foto">${ICON.arrowR}</button>
        <span class="g-count" id="gCount">1 / ${p.img.length}</span>` : ""}
      </div>
      ${multi ? `<div class="g-thumbs">${p.img.map((s, j) => `<button data-gi="${j}" aria-current="${j === 0}" aria-label="Foto ${j + 1}"><img src="${esc(s)}" alt=""></button>`).join("")}</div>` : ""}
    </div>
    <div class="pdp-info">
      <a class="pdp-brand" href="#/marca/${p.bs}"><span class="ring ring-xs">${wordmark(b)}</span>${esc(p.b)}</a>
      <h1>${esc(p.n)}</h1>
      <p class="pdp-price">${esc(price(p))}</p>
      ${p.d ? `<p class="pdp-desc">${esc(p.d)}</p>` : ""}
      <dl class="pdp-meta">
        <div><dt>Referência</dt><dd>${esc(p.r)}</dd></div>
        <div><dt>Categoria</dt><dd>${esc(CATNAME[p.c] || "")}</dd></div>
        <div><dt>Tamanhos e cores</dt><dd>Sob consulta</dd></div>
      </dl>
      <a class="btn btn-block" href="${wa(msg)}" target="_blank" rel="noopener">${ICON.chat} Pedir pelo WhatsApp</a>
      <a class="btn btn-outline btn-block" href="#/marca/${p.bs}">Ver mais de ${esc(p.b)}</a>
      <div class="acc">
        <details open><summary>Como comprar</summary>
          <ol class="mini-steps"><li>Toque em <b>Pedir pelo WhatsApp</b> — a mensagem já sai com o nome e a referência.</li><li>Informamos tamanhos, cores disponíveis e valores.</li><li>Combinamos pagamento e entrega com você.</li></ol>
        </details>
        <details><summary>Atendimento</summary><p>WhatsApp ${esc(C.TELEFONE || "")}. Mande a referência <b>${esc(p.r)}</b> para agilizar.</p></details>
      </div>
    </div>
  </article>
</div>
${related.length ? `<section class="section section-tint" aria-labelledby="rlT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Combina com você</span><h2 class="sec-title" id="rlT">Você também pode gostar</h2></div>${railBtns("rail-rel")}</div>
    ${rail("rail-rel", related.map(card).join(""), "rail-cards")}
  </div>
</section>` : ""}`,
    after() {
      let i = 0;
      const main = $("#gMain"), count = $("#gCount");
      const show = j => {
        i = (j + p.img.length) % p.img.length;
        main.src = p.img[i];
        if (count) count.textContent = `${i + 1} / ${p.img.length}`;
        $$(".g-thumbs button").forEach((t, k) => t.setAttribute("aria-current", k === i));
      };
      $$("[data-g]").forEach(btn => btn.addEventListener("click", () => show(i + +btn.dataset.g)));
      $$("[data-gi]").forEach(btn => btn.addEventListener("click", () => show(+btn.dataset.gi)));
    }
  };
}

/* Busca */
function searchView(r) {
  const q = (r.q.q || "").trim();
  const list = search(q);
  currentList = list;
  const brandHits = BRANDS.filter(b => q && norm(b.name).includes(norm(q)));
  return {
    nav: "",
    title: q ? `Busca: ${q}` : "Busca",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Busca"]])}
  <header class="page-head">
    <h1>${q ? `Resultados para <em>“${esc(q)}”</em>` : "Buscar"}</h1>
    <form class="page-search" id="pageSearch" role="search"><input type="search" name="q" value="${esc(q)}" placeholder="Peça, marca ou referência" aria-label="Buscar"><button class="btn">Buscar</button></form>
  </header>
  ${brandHits.length ? `<div class="chips chips-brands">${brandHits.map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)} <span>${b.n}</span></a>`).join("")}</div>` : ""}
  <div id="shopMain">
    <p class="count">${plural(list.length, "peça encontrada", "peças encontradas")}</p>
    ${list.length ? gridBlock(list, location.hash) : `<div class="empty"><p>Não encontramos peças com essa busca. Tente o nome da marca ou o tipo de peça — ou peça pelo WhatsApp.</p><a class="btn btn-outline" href="#/loja">Ver todas as peças</a></div>`}
  </div>
</div>`
  };
}

/* Como comprar */
function howView() {
  const faq = [
    ["Os valores aparecem no site?", "Informamos os valores pelo WhatsApp, junto com os tamanhos e as cores disponíveis de cada peça."],
    ["Como sei se tem o meu tamanho?", "Mande a referência da peça (ela aparece na página de cada produto) e confirmamos a disponibilidade."],
    ["Posso pedir uma peça que não está no site?", "Pode. Mande uma foto ou o nome do modelo e verificamos para você."],
    ["Como funcionam pagamento e entrega?", "Combinamos tudo diretamente com você pelo WhatsApp, no momento do pedido."]
  ];
  return {
    nav: "como-comprar",
    title: "Como comprar",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Como comprar"]])}
  <header class="page-head center"><h1>Como comprar</h1><p>Simples, rápido e com atendimento de verdade.</p></header>
  <ol class="steps">
    <li><span class="step-n">01</span><h3>Escolha a peça</h3><p>Navegue pelas seções ou pelas marcas e abra a peça que gostou.</p></li>
    <li><span class="step-n">02</span><h3>Peça pelo WhatsApp</h3><p>Toque em “Pedir pelo WhatsApp”. A mensagem já sai com o nome e a referência.</p></li>
    <li><span class="step-n">03</span><h3>Receba as informações</h3><p>Informamos tamanhos, cores disponíveis e valores, e combinamos pagamento e entrega.</p></li>
  </ol>
  <div class="faq">
    <h2 class="sec-title">Perguntas frequentes</h2>
    <div class="acc">${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>
  <div class="contact-card">
    <div><span class="eyebrow">Fale com a gente</span><p class="contact-phone">${esc(C.TELEFONE || "")}</p></div>
    <a class="btn" href="${wa("Olá! Vim pelo site da " + NOME + ".")}" target="_blank" rel="noopener">${ICON.chat} Chamar no WhatsApp</a>
  </div>
</div>`
  };
}

function notFound() {
  return {
    nav: "",
    title: "Página não encontrada",
    html: `<div class="wrap"><div class="empty empty-page"><h1>Página não encontrada</h1><p>O link pode ter mudado. Que tal ver as novidades?</p><a class="btn" href="#/loja">Ver novidades</a></div></div>`
  };
}

function resolve(r) {
  const [a] = r.parts;
  if (!a) return homeView();
  if (a === "loja") return shopView(r);
  if (a === "marca") return brandView(r);
  if (a === "marcas") return brandsView();
  if (a === "p") return productView(r);
  if (a === "busca") return searchView(r);
  if (a === "como-comprar") return howView();
  return notFound();
}

/* ---------- renderização e rolagem ---------- */
const app = $("#app");
const scrollMem = new Map();
let intent = null, lastPath = null;

function render() {
  const r = parseRoute();
  const v = resolve(r);
  app.innerHTML = v.html;
  document.title = v.title ? `${v.title} · ${NOME}` : `${NOME} · Grifes selecionadas`;
  $$("[data-nav]").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === v.nav));
  if (v.after) v.after();
  initRails();
  closeSearch(); closeDrawer();
  document.documentElement.classList.remove("lock");

  const shop = $("#shopMain");
  if (intent === "keep" && shop) {
    const top = shop.getBoundingClientRect().top + scrollY - headerH() - 12;
    if (scrollY > top) scrollTo(0, top);
  } else if (intent) {
    scrollTo(0, 0);
  } else {
    scrollTo(0, scrollMem.get(location.hash) || 0);
  }
  if (intent && intent !== "keep") app.focus({preventScroll: true});
  intent = null;
  lastPath = r.path;
}
const headerH = () => $(".site-header").offsetHeight;
addEventListener("scroll", () => scrollMem.set(location.hash, scrollY), {passive: true});
addEventListener("hashchange", render);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function go(h, keep) { intent = keep ? "keep" : "link"; if (location.hash === h) render(); else location.hash = h; }

/* Carrosséis horizontais */
function initRails() {
  $$(".rail").forEach(el => {
    if (!el._upd) {
      el._upd = () => {
        const max = el.scrollWidth - el.clientWidth - 2;
        $$(`[data-rail="${el.id}"]`).forEach(b => { b.disabled = b.dataset.dir < 0 ? el.scrollLeft <= 2 : el.scrollLeft >= max; });
        el.classList.toggle("at-start", el.scrollLeft <= 2);
        el.classList.toggle("at-end", el.scrollLeft >= max);
      };
      el.addEventListener("scroll", el._upd, {passive: true});
    }
    el._upd();
  });
}
addEventListener("resize", () => initRails());

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (a) {
    const h = a.getAttribute("href");
    if (h === "#top") { e.preventDefault(); scrollTo({top: 0, behavior: "smooth"}); return; }
    if (h === "#app") { e.preventDefault(); app.focus(); return; }
    if (h.startsWith("#/")) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      go(h, !!a.dataset.keep);
      return;
    }
  }
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.rail) {
    const el = document.getElementById(btn.dataset.rail);
    if (el) el.scrollBy({left: +btn.dataset.dir * el.clientWidth * .85, behavior: "smooth"});
    return;
  }
  if (btn.dataset.feat) {
    featState = btn.dataset.feat;
    $$("[data-feat]").forEach(t => t.setAttribute("aria-selected", t === btn));
    $("#featBody").innerHTML = featGrid(featState);
    return;
  }
  if (btn.dataset.spot) {
    spotState = btn.dataset.spot;
    $$("[data-spot]").forEach(t => t.setAttribute("aria-selected", t === btn));
    $("#spotBody").innerHTML = spotBody(spotState);
    initRails();
    return;
  }
  if (btn.hasAttribute("data-more")) {
    const key = location.hash, grid = $("#grid");
    const shown = grid.children.length, next = Math.min(currentList.length, shown + PAGE);
    grid.insertAdjacentHTML("beforeend", currentList.slice(shown, next).map(card).join(""));
    shownMem.set(key, next);
    $("#more").outerHTML = moreBlock(currentList.length, next);
    return;
  }
  if (btn.dataset.filters) { toggleFilters(btn.dataset.filters === "open"); return; }
});
document.addEventListener("change", e => {
  if (e.target.id === "sortSel") {
    const s = e.target, q = JSON.parse(s.dataset.q || "{}");
    go(href(s.dataset.path, {...q, ordem: s.value}), true);
  }
});
document.addEventListener("submit", e => {
  if (e.target.id === "pageSearch") {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) go(href("busca", {q}));
  }
});

function toggleFilters(open) {
  const f = $("#filters"), s = $(".scrim");
  if (!f) return;
  f.classList.toggle("open", open);
  if (s) s.hidden = !open;
  document.documentElement.classList.toggle("lock", open);
}

/* Menu lateral (celular) */
const drawer = $("#drawer"), menuBtn = $("#menuBtn");
function openDrawer() { drawer.hidden = false; requestAnimationFrame(() => drawer.classList.add("open")); menuBtn.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("lock"); $("#drawerClose").focus(); }
function closeDrawer() {
  if (drawer.hidden) return;
  drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("lock");
  setTimeout(() => { drawer.hidden = true; }, 250);
}
menuBtn.addEventListener("click", openDrawer);
$("#drawerClose").addEventListener("click", closeDrawer);
drawer.addEventListener("click", e => { if (e.target === drawer) closeDrawer(); });
$("#drawerBrands").innerHTML = `<span class="eyebrow eyebrow-light">Marcas</span><div class="drawer-chips">${BRANDS.slice(0, 10).map(b => `<a href="#/marca/${b.s}">${esc(b.name)}</a>`).join("")}<a href="#/marcas">Ver todas →</a></div>`;

/* Busca no cabeçalho */
const sPanel = $("#search"), sInput = $("#searchInput"), sBtn = $("#searchBtn"), sRes = $("#searchResults");
function openSearch() { sPanel.hidden = false; sBtn.setAttribute("aria-expanded", "true"); sInput.focus(); sInput.select(); liveSearch(); }
function closeSearch() { if (sPanel.hidden) return; sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false"); }
sBtn.addEventListener("click", () => sPanel.hidden ? openSearch() : closeSearch());
$("#searchClose").addEventListener("click", closeSearch);
let sTimer;
sInput.addEventListener("input", () => { clearTimeout(sTimer); sTimer = setTimeout(liveSearch, 120); });
function liveSearch() {
  const q = sInput.value.trim();
  if (!q) {
    sRes.innerHTML = `<p class="sr-label">Marcas populares</p><div class="chips">${BRANDS.slice(0, 8).map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)}</a>`).join("")}</div>`;
    return;
  }
  const list = search(q), brands = BRANDS.filter(b => norm(b.name).includes(norm(q)));
  sRes.innerHTML = `
    ${brands.length ? `<div class="chips">${brands.map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)} <span>${b.n}</span></a>`).join("")}</div>` : ""}
    ${list.length ? `<div class="sr-list">${list.slice(0, 6).map(p => `<a class="sr-item" href="#/p/${esc(p.r)}"><img src="${esc(p.img[0])}" alt="" loading="lazy"><span><small>${esc(p.b)}</small>${esc(p.n)}<em>Ref. ${esc(p.r)}</em></span></a>`).join("")}</div>
      <a class="link-arrow" href="${href("busca", {q})}">Ver ${list.length === 1 ? "o resultado" : `todos os ${list.length} resultados`} ${ICON.arrowR}</a>`
    : `<p class="sr-empty">Nenhuma peça encontrada para “${esc(q)}”.</p>`}`;
}
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const q = sInput.value.trim();
  if (q) go(href("busca", {q}));
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeSearch(); closeDrawer(); toggleFilters(false); }
  if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});
document.addEventListener("click", e => {
  if (!sPanel.hidden && !e.target.closest(".site-header")) closeSearch();
});

/* Faixa de avisos */
const avisos = (C.AVISOS || []).filter(Boolean);
const ann = $("#announce");
if (avisos.length) {
  ann.innerHTML = avisos.map((t, i) => `<span class="${i === 0 ? "on" : ""}">${esc(t)}</span>`).join("");
  let k = 0;
  if (avisos.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      const s = ann.children;
      s[k].classList.remove("on"); k = (k + 1) % s.length; s[k].classList.add("on");
    }, 4500);
  }
} else ann.parentElement.hidden = true;

/* Links fixos */
const hello = wa("Olá! Vim pelo site da " + NOME + ".");
["#hdrWa", "#ftWa", "#waFloat"].forEach(s => { $(s).href = hello; });
$("#ftPhone").textContent = C.TELEFONE || "";
$("#year").textContent = new Date().getFullYear();
$("#ftBrands").innerHTML = BRANDS.slice(0, 6).map(b => `<li><a href="#/marca/${b.s}">${esc(b.name)}</a></li>`).join("") + `<li><a href="#/marcas">Ver todas</a></li>`;
$("#ftSocial").innerHTML = `<a href="${hello}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.chat}</a>` +
  (C.INSTAGRAM ? `<a href="https://instagram.com/${esc(C.INSTAGRAM)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.insta}</a>` : "");

render();
})();

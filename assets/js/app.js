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
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slugify = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const wa = text => `https://wa.me/${C.WHATSAPP}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const price = p => p.p || C.PRECO || "Sob consulta";
const NOME = C.NOME || "L&T Club";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const EASE = "cubic-bezier(.2,.7,.2,1)";

const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const ICON = {
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M14 6l6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.3C19.5 15.4 12 20 12 20Z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M11 8v6M8 11h6"/></svg>',
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
  {k: "camisetas-polos", t: "Camisetas e polos (todas)", c: ["camisetas", "polos", "camisas"], grp: true},
  {k: "camisas", t: "Camisas e polos", c: ["camisas", "polos"]},
  {k: "frio", t: "Blusas de frio (todas)", c: ["moletons", "malhas", "jaquetas"], grp: true},
  {k: "moletons", t: "Moletons", c: ["moletons"]},
  {k: "malhas", t: "Suéteres e malhas", c: ["malhas"]},
  {k: "jaquetas", t: "Jaquetas e casacos", c: ["jaquetas"]},
  {k: "calcas", t: "Calças", c: ["calcas"]},
  {k: "shorts", t: "Bermudas e shorts", c: ["shorts"]},
  {k: "conjuntos", t: "Conjuntos", c: ["conjuntos"]},
  {k: "calcados", t: "Tênis e calçados", c: ["calcados"]},
  {k: "acessorios", t: "Acessórios", c: ["acessorios"]}
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.k, t]));
const typeLabel = k => TYPE[k].t.replace(" (todas)", "");
const CATNAME = {camisetas: "Camisetas", camisas: "Camisas", polos: "Polos", malhas: "Suéteres e malhas", moletons: "Moletons", jaquetas: "Jaquetas e casacos", conjuntos: "Conjuntos", calcas: "Calças", shorts: "Bermudas e shorts", calcados: "Tênis e calçados", acessorios: "Acessórios"};

/* Coleções especiais e colaborações (etiqueta mostrada no card) */
const EXCLUSIVE = {
  D245: "LOEWE x On", D246: "LOEWE x On", D251: "LOEWE x On", D219: "LOEWE x On",
  D144: "Moncler Genius", D211: "Moncler FRGMT", D169: "Moncler Grenoble",
  N16: "Dior and Hylton Nel", N18: "Dior and Hylton Nel"
};

DATA.forEach((p, i) => {
  if (!BR[p.b]) BR[p.b] = {s: slugify(p.b), t: p.b.toUpperCase(), f: "sans", w: 500, ls: .08, fs: 13};
  p.i = i; p.s = SEC(p.c); p.bs = BR[p.b].s; p.x = EXCLUSIVE[p.r] || "";
});
const BY_REF = new Map(DATA.map(p => [p.r, p]));
const BRANDS = [...new Set(DATA.map(p => p.b))]
  .map(name => ({...BR[name], name, n: DATA.filter(p => p.b === name).length}))
  .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "pt"));
const BRAND = new Map(BRANDS.map(b => [b.s, b]));
const BRANDS_AZ = [...BRANDS].sort((a, b) => a.name.localeCompare(b.name, "pt"));
const IDX = DATA.map(p => norm([p.n, p.b, p.d, p.r, p.x, CATNAME[p.c], SECTIONS[p.s].t].join(" ")));
const refs = list => list.map(r => BY_REF.get(r)).filter(Boolean);

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

/* Tamanhos oferecidos para escolha (a disponibilidade é confirmada no WhatsApp) */
const SIZE_TBD = "A definir";
function sizesFor(p) {
  if (p.c === "acessorios") return null;
  if (p.c === "calcados") return ["37", "38", "39", "40", "41", "42", "43", "44"];
  if (p.c === "calcas") return ["36", "38", "40", "42", "44", "46", "48"];
  return ["PP", "P", "M", "G", "GG", "XGG"];
}

/* ---------- favoritos e sacola ---------- */
const arr = v => Array.isArray(v) ? v : [];
let favs = [], bag = [];
function loadState() {
  favs = arr(store.get("lt-favs", [])).filter(r => typeof r === "string" && BY_REF.has(r));
  bag = arr(store.get("lt-bag", [])).filter(it => it && typeof it.r === "string" && BY_REF.has(it.r))
    .map(it => ({r: it.r, s: typeof it.s === "string" ? it.s : "", q: Math.min(9, Math.max(1, parseInt(it.q, 10) || 1))}));
}
loadState();
const isFav = r => favs.includes(r);
function syncFavButtons() {
  $$("[data-fav]").forEach(b => { const on = isFav(b.dataset.fav); b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Remover dos favoritos" : "Adicionar aos favoritos"); });
}
function toggleFav(r, btn) {
  loadState();
  favs = isFav(r) ? favs.filter(x => x !== r) : [...favs, r];
  store.set("lt-favs", favs);
  updateCounts(); syncFavButtons();
  const on = isFav(r);
  toast(on ? "Adicionado aos favoritos" : "Removido dos favoritos", on ? {label: "Ver favoritos", href: "#/favoritos"} : null);
  /* na página de favoritos, a peça sai da lista sem recarregar a página inteira */
  if (!on && parseRoute().parts[0] === "favoritos") {
    if (!favs.length) { render(true); return; }
    const el = btn && btn.closest("#grid .card");
    const next = el && (el.nextElementSibling || el.previousElementSibling);
    const done = () => {
      el && el.remove();
      const lead = $(".page-head p"); if (lead) lead.textContent = `${plural(favs.length, "peça salva", "peças salvas")} neste aparelho.`;
      next?.querySelector(".fav-btn")?.focus({preventScroll: true});
    };
    if (el && el.animate && !reduceMotion.matches) el.animate([{opacity: 1, transform: "none"}, {opacity: 0, transform: "scale(.96)"}], {duration: 280, easing: EASE}).onfinish = done;
    else done();
  }
}
function addToBag(r, size, fromEl, toastDelay = 0) {
  loadState();
  const p = BY_REF.get(r);
  const sz = sizesFor(p) ? (size || SIZE_TBD) : "";
  const hit = bag.find(it => it.r === r && it.s === sz);
  if (hit) hit.q = Math.min(9, hit.q + 1); else bag.push({r, s: sz, q: 1});
  store.set("lt-bag", bag);
  updateCounts();
  flyToBag(fromEl, p);
  const say = () => toast(`${p.n} na sacola`, {label: "Ver sacola", action: openBag});
  if (toastDelay) setTimeout(say, toastDelay); else say();
}
addEventListener("storage", e => {
  if (e.key && e.key !== "lt-bag" && e.key !== "lt-favs") return;
  loadState(); updateCounts(); syncFavButtons();
  if (bagEl.classList.contains("open")) renderBag();
});
const bagQty = () => bag.reduce((n, it) => n + it.q, 0);
function updateCounts() {
  const fc = $("#favCount"), bc = $("#bagCount");
  fc.textContent = favs.length; fc.hidden = !favs.length;
  const q = bagQty(); bc.textContent = q; bc.hidden = !q;
  $("#bagBtn").setAttribute("aria-label", q ? `Abrir sacola (${plural(q, "item", "itens")})` : "Abrir sacola");
}
function bagMessage() {
  const lines = bag.map((it, i) => {
    const p = BY_REF.get(it.r);
    return `${i + 1}. ${p.n} — ${p.b} (Ref. ${p.r})${it.s ? ` · Tamanho ${it.s}` : ""} · Qtd ${it.q}`;
  });
  return `Olá! Quero finalizar meu pedido na ${NOME}:\n\n${lines.join("\n")}\n\nPode me confirmar disponibilidade, cores e valores?`;
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
function favBtn(p, cls = "") {
  const on = isFav(p.r);
  return `<button class="fav-btn ${cls}" data-fav="${esc(p.r)}" aria-pressed="${on}" aria-label="${on ? "Remover dos favoritos" : "Adicionar aos favoritos"}">${ICON.heart}</button>`;
}
function card(p, i = 0, cls = "") {
  const alt = p.img[1];
  return `<article class="card ${cls}" data-reveal style="--i:${i % 4}">
    <a class="card-link" href="#/p/${esc(p.r)}">
      <span class="ph${alt ? " has-alt" : ""}">
        <img loading="lazy" decoding="async" src="${esc(p.img[0])}" alt="">
        ${alt ? `<img class="alt" loading="lazy" decoding="async" src="${esc(alt)}" alt="">` : ""}
      </span>
      <span class="meta"><span class="brand">${esc(p.b)}</span><span class="name">${esc(p.n)}</span><span class="price">${esc(price(p))}</span></span>
    </a>
    ${p.x ? `<span class="tag tag-x">${esc(p.x)}</span>` : p.img.length > 1 ? `<span class="tag">${p.img.length} fotos</span>` : ""}
    ${favBtn(p)}
    <div class="card-actions">
      <button class="ca-btn" data-qv="${esc(p.r)}" aria-label="Visualização rápida: ${esc(p.n)}">${ICON.eye}<span>Ver rápido</span></button>
      <button class="ca-btn ca-add" data-quick="${esc(p.r)}" aria-label="Adicionar ${esc(p.n)} à sacola">${ICON.plus}<span class="sr">Adicionar</span></button>
    </div>
  </article>`;
}
function rail(id, items, cls = "", label = "Lista horizontal") {
  return `<div class="rail ${cls}" id="${id}" tabindex="0" role="region" aria-label="${esc(label)} — role para o lado ou use as setas">${items}</div>`;
}
function railBtns(id) {
  return `<span class="rail-btns"><button class="rail-btn" data-rail="${id}" data-dir="-1" aria-label="Anterior">${ICON.arrowL}</button><button class="rail-btn" data-rail="${id}" data-dir="1" aria-label="Próximo">${ICON.arrowR}</button></span>`;
}
function crumbs(items) {
  return `<nav class="crumbs" aria-label="Você está em">${items.map((x, i) => i < items.length - 1
    ? `<a href="${x[1]}">${esc(x[0])}</a><span aria-hidden="true">/</span>`
    : `<span aria-current="page">${esc(x[0])}</span>`).join("")}</nav>`;
}
function sizePicker(p, id) {
  const sizes = sizesFor(p);
  if (!sizes) return `<p class="size-note">Tamanho único.</p>`;
  return `<fieldset class="sizes" data-sizes="${id}" aria-describedby="szh-${id}">
    <legend>Tamanho desejado</legend>
    <div class="size-row">${sizes.map(s => `<label class="size"><input type="radio" name="sz-${id}" value="${s}"><span>${s}</span></label>`).join("")}
      <label class="size size-tbd"><input type="radio" name="sz-${id}" value="${SIZE_TBD}"><span>Não sei meu tamanho</span></label></div>
    <div class="size-foot"><p class="size-help" id="szh-${id}" aria-live="polite">A disponibilidade de cada tamanho é confirmada pelo WhatsApp.</p><button type="button" class="link-btn" data-guide>Guia de medidas</button></div>
  </fieldset>`;
}
const pickedSize = id => { const el = $(`[data-sizes="${id}"] input:checked`); return el ? el.value : ""; };
function needSize(p, id) {
  if (!sizesFor(p) || pickedSize(id)) return false;
  const fs = $(`[data-sizes="${id}"]`);
  if (fs) {
    fs.classList.remove("shake"); void fs.offsetWidth; fs.classList.add("shake");
    fs.setAttribute("aria-invalid", "true");
    $(`#szh-${id}`).textContent = "Escolha um tamanho (ou “Não sei meu tamanho”) para adicionar à sacola.";
    fs.querySelector("input")?.focus({preventScroll: true});
  }
  return true;
}
const PAGE = 24;
const shownMem = new Map();
function gridBlock(list, key) {
  const shown = Math.min(list.length, shownMem.get(key) || PAGE);
  return `<div class="grid" id="grid">${list.slice(0, shown).map((p, i) => card(p, i)).join("")}</div>${moreBlock(list.length, shown)}`;
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
    parts: path.split("/").filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch { return x; } }),
    q: Object.fromEntries(new URLSearchParams(qs || "")),
    path
  };
}
function href(path, q) {
  const s = new URLSearchParams(Object.entries(q).filter(([, v]) => v)).toString();
  return `#/${path}${s ? "?" + s : ""}`;
}

/* ---------- página inicial ---------- */
const HERO_FEATURE = ["D153", "D321", "D272"];
const NEW_COLLECTION = ["D153", "D321", "P01", "D272", "N16", "D127", "D278", "P08", "D181", "D324", "P03", "D129"];
const CATS = [
  {t: "Jaquetas e casacos", ref: "D159", tipo: "jaquetas", to: "#/loja/vestuario?tipo=jaquetas", big: true},
  {t: "Camisetas e polos", ref: "P01", tipo: "camisetas-polos", to: "#/loja/vestuario?tipo=camisetas-polos"},
  {t: "Suéteres e malhas", ref: "N17", tipo: "malhas", to: "#/loja/vestuario?tipo=malhas"},
  {t: "Bermudas e shorts", ref: "P44", tipo: "shorts", to: "#/loja/vestuario?tipo=shorts"},
  {t: "Acessórios", ref: "D005", tipo: "acessorios", to: "#/loja/acessorios"}
];
const LOOKS = [
  {ref: "D294", t: "Conforto em tons neutros"},
  {ref: "D012", t: "Verão com estampa"},
  {ref: "D087", t: "Noite em azul-marinho"}
];
const FEAT = [
  {k: "destaques", t: "Destaques", f: () => DATA, to: "#/loja"},
  {k: "jaquetas", t: "Jaquetas", f: () => byType(DATA, "jaquetas"), to: "#/loja/vestuario?tipo=jaquetas"},
  {k: "camisetas", t: "Camisetas e polos", f: () => byType(DATA, "camisetas-polos"), to: "#/loja/vestuario?tipo=camisetas-polos"},
  {k: "malhas", t: "Suéteres e malhas", f: () => byType(DATA, "malhas"), to: "#/loja/vestuario?tipo=malhas"},
  {k: "conjuntos", t: "Conjuntos", f: () => byType(DATA, "conjuntos"), to: "#/loja/vestuario?tipo=conjuntos"},
  {k: "acessorios", t: "Acessórios", f: () => DATA.filter(p => p.s !== "vestuario"), to: "#/loja/acessorios"}
];
const SPOT = ["moncler", "amiri", "ralph-lauren", "on", "hermes", "arcteryx"].filter(s => BRAND.has(s));
let featState = "destaques", spotState = SPOT[0];

function splitTitle(text) {
  return [...text].map((ch, i) => ch === " " ? " " : ch === "&"
    ? `<em class="ch" style="--d:${i}">&amp;</em>`
    : `<span class="ch" style="--d:${i}">${esc(ch)}</span>`).join("");
}
function featGrid(k) {
  const f = FEAT.find(x => x.k === k) || FEAT[0];
  const list = mix(f.f(), 9);
  return `<div class="grid grid-curated">${list.map((p, i) => card(p, i, i === 0 ? "card-hero" : "")).join("")}</div>
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
    ${rail("rail-spot", list.map((p, i) => card(p, i)).join(""), "rail-cards", `Peças ${b.name}`)}`;
}
function heroFeature() {
  const list = refs(HERO_FEATURE);
  if (!list.length) return "";
  return `<aside class="hero-feature" aria-label="Peças em destaque">
    <span class="hf-label">Peça em destaque</span>
    <div class="hf-stage" data-tilt>
      ${list.map((p, i) => `<a class="hf-card${i === 0 ? " on" : ""}" href="#/p/${esc(p.r)}" data-hf="${i}" ${i ? 'tabindex="-1" aria-hidden="true"' : ""}>
        <span class="hf-img"><img src="${esc(p.img[0])}" alt="" ${i ? 'loading="lazy"' : ""}></span>
        <span class="hf-meta"><small>${esc(p.b)}</small><b>${esc(p.n)}</b></span>
      </a>`).join("")}
      <span class="hf-glare" aria-hidden="true"></span>
    </div>
    <div class="hf-dots" role="group" aria-label="Escolher peça em destaque">${list.map((p, i) => `<button data-hfdot="${i}" aria-pressed="${i === 0}" aria-label="${esc(p.n)}"></button>`).join("")}</div>
  </aside>`;
}
function homeView() {
  const total = DATA.length, nb = BRANDS.length;
  const nc = refs(NEW_COLLECTION);
  const looks = LOOKS.map(l => ({...l, p: BY_REF.get(l.ref)})).filter(l => l.p);
  const ex = DATA.filter(p => p.x);
  return {
    nav: "home",
    home: true,
    html: `
<section class="hero" id="hero" aria-label="${esc(NOME)}">
  <div class="hero-media"><img class="hero-img" src="img/hero.jpg" alt="" fetchpriority="high"></div>
  <span class="hero-grade" aria-hidden="true"></span>
  <span class="hero-light" aria-hidden="true"></span>
  <div class="hero-orbits" aria-hidden="true"><span class="orbit o1"></span><span class="orbit o2"></span><span class="orbit o3"></span></div>
  <div class="hero-dust" aria-hidden="true">${Array.from({length: 14}, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${(i * 53) % 100}%;--t:${10 + (i % 5) * 3}s;--dl:${-(i * 1.7)}s"></i>`).join("")}</div>
  <div class="hero-inner">
    <span class="hero-eyebrow">Grifes selecionadas</span>
    <h1 class="hero-title" aria-label="L&amp;T Club"><span aria-hidden="true">${splitTitle("L&T Club")}</span></h1>
    <p class="hero-sub">Moncler, Amiri, Hermès, Ralph Lauren e mais ${nb - 4} grifes, escolhidas peça por peça.</p>
    <a class="btn-hero" href="#/loja"><span>Explorar coleção</span><i>${ICON.arrow}</i></a>
  </div>
  ${heroFeature()}
  <button class="hero-scroll" data-scrollto="marcas" aria-label="Rolar para as marcas"><span>Role</span><i></i></button>
</section>

<section class="brand-strip" id="marcas" aria-labelledby="bsT">
  <div class="wrap sec-head">
    <div><span class="eyebrow">${nb} grifes</span><h2 class="sec-title" id="bsT" data-split>Nossas marcas</h2></div>
    <div class="sec-tools"><a class="link-arrow" href="#/marcas">Ver todas ${ICON.arrowR}</a>${railBtns("rail-brands")}</div>
  </div>
  ${rail("rail-brands", BRANDS.map(b => circle(b, `<span class="bcount">${plural(b.n, "peça", "peças")}</span>`)).join(""), "rail-brands", "Marcas")}
</section>

<section class="section nc" aria-labelledby="ncT">
  <div class="wrap sec-head">
    <div><span class="eyebrow"><span lang="en">New collection</span></span><h2 class="display" id="ncT" data-split>Peças que definem <em>o estilo L&amp;T</em></h2></div>
    ${railBtns("rail-nc")}
  </div>
  ${rail("rail-nc", nc.map((p, i) => `<a class="nc-card" href="#/p/${esc(p.r)}" data-reveal style="--i:${i % 4}">
      <span class="nc-img"><img loading="lazy" src="${esc(p.img[0])}" alt=""></span>
      <span class="nc-n">${String(i + 1).padStart(2, "0")}</span>
      <span class="nc-meta"><small>${esc(p.b)}</small><b>${esc(p.n)}</b></span>
    </a>`).join(""), "rail-nc", "Novidades")}
  <div class="wrap"><div class="rail-progress" data-progress="rail-nc"><span></span></div></div>
</section>

<section class="section section-tint cats" aria-labelledby="ctT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Categorias</span><h2 class="display" id="ctT" data-split>O que você <em>procura?</em></h2></div>
      <a class="link-arrow" href="#/loja">Ver todas as peças ${ICON.arrowR}</a></div>
    <div class="cat-grid">
      ${CATS.map((c, i) => {
        const p = BY_REF.get(c.ref);
        const n = c.tipo === "acessorios" ? DATA.filter(x => x.s === "acessorios").length : byType(DATA, c.tipo).length;
        return `<a class="cat${c.big ? " cat-big" : ""}" href="${c.to}" data-reveal="mask" style="--i:${i}">${p ? `<img loading="lazy" src="${esc(p.img[0])}" alt="">` : ""}
          <span class="cat-ov"><span class="cat-t">${esc(c.t)}</span><span class="cat-n">${plural(n, "peça", "peças")} <i>${ICON.arrowR}</i></span></span></a>`;
      }).join("")}
    </div>
  </div>
</section>

<section class="section curated" aria-labelledby="cuT">
  <div class="wrap">
    <div class="sec-head center"><div><span class="eyebrow"><span lang="en">Curated selection</span> · ${plural(total, "peça", "peças")}</span><h2 class="display" id="cuT" data-split>Seleção <em>da casa</em></h2></div></div>
    <div class="tabs" role="group" aria-label="Categorias em destaque">
      ${FEAT.map(f => `<button class="tab" data-feat="${f.k}" aria-pressed="${f.k === featState}">${esc(f.t)}</button>`).join("")}
    </div>
    <div id="featBody">${featGrid(featState)}</div>
  </div>
</section>

${looks.length ? `<section class="section signature" aria-labelledby="sgT">
  <div class="wrap sig-grid">
    <div class="sig-intro" data-reveal>
      <span class="eyebrow"><span lang="en">Signature style</span></span>
      <h2 class="display" id="sgT" data-split>Looks <em>completos</em></h2>
      <p>Conjuntos pensados para usar juntos — da camisa com bermuda ao moletom com calça. Escolha o look e peça o seu tamanho.</p>
      <a class="link-arrow" href="#/loja/vestuario?tipo=conjuntos">Ver todos os conjuntos ${ICON.arrowR}</a>
    </div>
    ${looks.map((l, i) => `<a class="look look-${i + 1}" href="#/p/${esc(l.p.r)}" data-reveal="mask">
      <span class="look-img" data-parallax="${i === 0 ? 0.06 : 0.1}"><img loading="lazy" src="${esc(l.p.img[0])}" alt=""></span>
      <span class="look-cap"><small>Look ${String(i + 1).padStart(2, "0")} · ${esc(l.p.b)}</small><b>${esc(l.t)}</b><span>${esc(l.p.n)} ${ICON.arrowR}</span></span>
    </a>`).join("")}
  </div>
</section>` : ""}

${ex.length ? `<section class="drops" aria-labelledby="exT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow eyebrow-light"><span lang="en">Exclusive drops</span></span><h2 class="display light" id="exT" data-split>Colaborações e <em>linhas especiais</em></h2>
      <p class="drops-lead">LOEWE x On, Moncler Genius, Moncler FRGMT, Dior and Hylton Nel e Moncler Grenoble — peças de coleções especiais das grifes.</p></div>
      <div class="sec-tools"><a class="link-arrow light" href="#/exclusivos">Ver os exclusivos ${ICON.arrowR}</a>${railBtns("rail-ex")}</div></div>
    ${rail("rail-ex", ex.map((p, i) => `<a class="ex-card" href="#/p/${esc(p.r)}" data-reveal style="--i:${i % 4}" data-tilt>
        <span class="ex-img"><img loading="lazy" src="${esc(p.img[0])}" alt=""></span>
        <span class="ex-meta"><span class="tag tag-x">${esc(p.x)}</span><b>${esc(p.n)}</b><small>${esc(p.b)}</small></span>
        <span class="hf-glare" aria-hidden="true"></span>
      </a>`).join(""), "rail-ex", "Peças exclusivas")}
  </div>
</section>` : ""}

<section class="section" aria-labelledby="spT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Marca em destaque</span><h2 class="display" id="spT" data-split>Explore <em>por grife</em></h2></div>${railBtns("rail-spot")}</div>
    <div class="tabs tabs-left" role="group" aria-label="Marca em destaque">
      ${SPOT.map(s => `<button class="tab" data-spot="${s}" aria-pressed="${s === spotState}">${esc(BRAND.get(s).name)}</button>`).join("")}
    </div>
    <div id="spotBody">${spotBody(spotState)}</div>
  </div>
</section>

${experience()}`
  };
}
function experience() {
  const cats = new Set(DATA.map(p => p.c)).size;
  return `<section class="experience" aria-labelledby="xpT">
  <div class="wrap xp-grid">
    <div class="xp-intro" data-reveal>
      <span class="eyebrow eyebrow-light"><span lang="en">The L&amp;T experience</span></span>
      <h2 class="display light" id="xpT" data-split>Uma boutique de grifes, <em>com atendimento de pessoa para pessoa.</em></h2>
      <p>Cada peça é escolhida a dedo. Você monta a sacola no site e finaliza com a gente pelo WhatsApp — confirmamos tamanho, cor, disponibilidade e valores antes de fechar.</p>
      <a class="btn btn-silver" href="${wa("Olá! Vim pelo site da " + NOME + " e queria ajuda para escolher uma peça.")}" target="_blank" rel="noopener">${ICON.chat} Falar com a gente</a>
    </div>
    <div class="xp-stats">
      <div data-reveal style="--i:0"><b data-count="${DATA.length}">${DATA.length}</b><span>peças selecionadas</span></div>
      <div data-reveal style="--i:1"><b data-count="${BRANDS.length}">${BRANDS.length}</b><span>grifes</span></div>
      <div data-reveal style="--i:2"><b data-count="${cats}">${cats}</b><span>categorias</span></div>
    </div>
    <ul class="xp-pillars">
      <li data-reveal style="--i:0">${ICON.hanger}<div><h3>Curadoria</h3><p>Grifes internacionais escolhidas peça por peça.</p></div></li>
      <li data-reveal style="--i:1">${ICON.chat}<div><h3>Atendimento direto</h3><p>Você fala com a gente do primeiro contato à entrega.</p></div></li>
      <li data-reveal style="--i:2">${ICON.ruler}<div><h3>Tamanhos sob consulta</h3><p>Confirmamos disponibilidade de cada modelo antes de fechar.</p></div></li>
    </ul>
  </div>
</section>`;
}
function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap" data-reveal>
    <span class="eyebrow eyebrow-light">Atendimento</span>
    <h2 class="display light">Procurando um <em>modelo específico?</em></h2>
    <p>Mande a referência ou uma foto da peça. A gente responde com tamanhos, cores e valores.</p>
    <a class="btn btn-silver" href="${wa("Olá! Estou procurando um modelo específico.")}" target="_blank" rel="noopener">Chamar no WhatsApp</a>
  </div>
</section>`;
}

/* ---------- loja: todas as peças ou uma seção, com filtros ---------- */
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
<section class="list-hero">
  <div class="wrap">
    ${crumbs([["Início", "#/"], ...(secK ? [["Loja", "#/loja"], [title]] : [[title]])])}
    <header class="page-head">
      <span class="eyebrow eyebrow-light">${plural(list.length, "peça", "peças")} · ${plural(new Set(list.map(p => p.b)).size, "grife", "grifes")}</span>
      <h1 class="light" data-split>${esc(title)}${sub ? ` <em>· ${esc(sub)}</em>` : ""}</h1>
      <p>${esc(secK ? SECTIONS[secK].d : "Todas as peças da loja, de todas as marcas.")}</p>
    </header>
  </div>
</section>
<div class="wrap">
  <div class="shop" id="shop">
    <aside class="filters" id="filters" aria-label="Filtros">
      <div class="filters-head"><b>Filtrar</b><button class="icon-btn" data-filters="close" aria-label="Fechar filtros">${ICON.close}</button></div>
      <details class="facet" open><summary><h2>Seção</h2></summary><div class="facet-body">${secOpts.join("")}</div></details>
      ${types.length > 1 ? `<details class="facet" open><summary><h2>Tipo de peça</h2></summary><div class="facet-body">${typeOpts.join("")}</div></details>` : ""}
      <details class="facet" open><summary><h2>Marca</h2></summary><div class="facet-body">${brandOpts.slice(0, 9).join("")}${brandOpts.length > 9
        ? `<details class="facet-more"${brands.slice(8).some(b => b.s === marca) ? " open" : ""}><summary>Mais ${brandOpts.length - 9} marcas</summary>${brandOpts.slice(9).join("")}</details>` : ""}</div></details>
    </aside>
    <div class="shop-main" id="shopMain">
      <div class="toolbar">
        <button class="btn-filter" data-filters="open" aria-controls="filters" aria-expanded="false">${ICON.filter} Filtrar</button>
        <span class="count" tabindex="-1">${plural(list.length, "peça", "peças")}</span>
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

/* ---------- página de uma marca ---------- */
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
      <span class="ring ring-xl" data-tilt>${wordmark(b)}</span>
      <div class="bh-txt">
        <span class="eyebrow eyebrow-light">${plural(all.length, "peça", "peças")}</span>
        <h1 data-split>${esc(b.name)}</h1>
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
  ${rail("rail-brands", others.map(x => circle(x, `<span class="bcount">${esc(x.name)}</span>`)).join(""), "rail-brands", "Outras marcas")}
</section>`
  };
}

/* ---------- todas as marcas ---------- */
function brandsView() {
  return {
    nav: "marcas",
    title: "Marcas",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Marcas"]])}
  <header class="page-head center">
    <h1 data-split>Nossas <em>marcas</em></h1>
    <p>${plural(BRANDS.length, "grife selecionada", "grifes selecionadas")}. Toque numa marca para ver todas as peças dela.</p>
  </header>
  <div class="brand-grid">
    ${BRANDS_AZ.map((b, i) => `<a class="bcard" href="#/marca/${b.s}" data-reveal style="--i:${i % 4}">
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

/* ---------- página da peça ---------- */
function infoAcc(p) {
  return `<div class="acc">
    <details open><summary>Detalhes</summary><dl class="pdp-meta">
      <div><dt>Marca</dt><dd><a href="#/marca/${p.bs}">${esc(p.b)}</a></dd></div>
      <div><dt>Referência</dt><dd>${esc(p.r)}</dd></div>
      <div><dt>Categoria</dt><dd>${esc(CATNAME[p.c] || "")}</dd></div>
      ${p.x ? `<div><dt>Coleção</dt><dd>${esc(p.x)}</dd></div>` : ""}
      <div><dt>Tamanhos e cores</dt><dd>Sob consulta</dd></div>
    </dl></details>
    <details id="guideAcc"><summary>Guia de medidas</summary>
      <p>Cada grife tem sua própria modelagem, então a melhor forma de acertar é medir uma peça sua que veste bem:</p>
      <ul class="guide"><li><b>Tórax</b> — de axila a axila, com a peça esticada sobre uma mesa.</li><li><b>Comprimento</b> — do ponto mais alto do ombro até a barra.</li><li><b>Cintura</b> — de uma ponta à outra do cós, com a calça ou bermuda fechada.</li><li><b>Calçados</b> — o comprimento do pé, do calcanhar à ponta do dedo maior.</li></ul>
      <p>Mande as medidas pelo WhatsApp junto com a referência <b>${esc(p.r)}</b> e indicamos o tamanho ideal.</p>
    </details>
    <details><summary>Pagamento, entrega e trocas</summary>
      <p>Formas de pagamento, parcelamento, envio, prazo e condições de troca são combinados diretamente com você pelo WhatsApp, antes de fechar o pedido.</p>
    </details>
    <details><summary>Como comprar</summary>
      <ol class="mini-steps"><li>Escolha o tamanho e adicione a peça à sacola.</li><li>Na sacola, toque em <b>Finalizar pelo WhatsApp</b> — a mensagem já sai com as peças, referências e tamanhos.</li><li>Confirmamos disponibilidade, cores e valores, e combinamos pagamento e entrega.</li></ol>
    </details>
  </div>`;
}
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
  return {
    nav: p.s,
    title: `${p.n} ${p.b}`,
    bodyClass: "has-buybar",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], [SECTIONS[p.s].t, "#/loja/" + p.s], [p.b, "#/marca/" + p.bs], [p.n]])}
  <article class="pdp">
    <div class="gallery">
      <div class="g-main" id="gMainWrap">
        <img id="gMain" src="${esc(p.img[0])}" alt="${esc(p.n + " — " + p.b)}" fetchpriority="high">
        ${multi ? `<button class="g-nav prev" data-g="-1" aria-label="Foto anterior">${ICON.arrowL}</button>
        <button class="g-nav next" data-g="1" aria-label="Próxima foto">${ICON.arrowR}</button>
        <span class="g-count" id="gCount">1 / ${p.img.length}</span>` : ""}
        <button class="g-zoom" data-zoom aria-label="Ampliar foto">${ICON.zoom}</button>
        ${p.x ? `<span class="tag tag-x g-tag">${esc(p.x)}</span>` : ""}
      </div>
      ${multi ? `<div class="g-thumbs">${p.img.map((s, j) => `<button data-gi="${j}" aria-current="${j === 0}" aria-label="Foto ${j + 1}"><img src="${esc(s)}" alt=""></button>`).join("")}</div>` : ""}
    </div>
    <div class="pdp-info">
      <a class="pdp-brand" href="#/marca/${p.bs}"><span class="ring ring-xs">${wordmark(b)}</span>${esc(p.b)}</a>
      <h1>${esc(p.n)}</h1>
      <p class="pdp-price">${esc(price(p))} <small>· valores e parcelamento pelo WhatsApp</small></p>
      ${p.d ? `<p class="pdp-desc">${esc(p.d)}</p>` : ""}
      ${sizePicker(p, "pdp")}
      <div class="pdp-actions" id="pdpActions">
        <button class="btn btn-block btn-add" data-add="${esc(p.r)}" data-from="pdp">${ICON.bag} Adicionar à sacola</button>
        ${favBtn(p, "fav-lg")}
      </div>
      <a class="btn btn-outline btn-block" href="${wa(`Olá! Tenho interesse na peça ${p.n} ${p.b} (Ref. ${p.r}).`)}" target="_blank" rel="noopener" id="pdpWa">${ICON.chat} Pedir agora pelo WhatsApp</a>
      ${infoAcc(p)}
    </div>
  </article>
</div>
<div class="buybar" id="buybar">
  <span class="bb-name"><small>${esc(p.b)}</small><span class="bb-n">${esc(p.n)}</span></span>
  <button class="btn btn-add" data-add="${esc(p.r)}" data-from="pdp">${ICON.bag} Adicionar</button>
</div>
${related.length ? `<section class="section section-tint" aria-labelledby="rlT">
  <div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Combina com você</span><h2 class="display" id="rlT">Você também <em>pode gostar</em></h2></div>${railBtns("rail-rel")}</div>
    ${rail("rail-rel", related.map((x, i) => card(x, i)).join(""), "rail-cards", "Peças relacionadas")}
  </div>
</section>` : ""}`,
    after() {
      let i = 0;
      const main = $("#gMain"), count = $("#gCount"), wrap = $("#gMainWrap");
      const show = j => {
        i = (j + p.img.length) % p.img.length;
        swapImg(main, p.img[i]);
        if (count) count.textContent = `${i + 1} / ${p.img.length}`;
        $$(".g-thumbs button").forEach((t, k) => t.setAttribute("aria-current", k === i));
      };
      $$("[data-g]").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); show(i + +btn.dataset.g); }));
      $$("[data-gi]").forEach(btn => btn.addEventListener("click", () => show(+btn.dataset.gi)));
      /* zoom ao passar o mouse e tela cheia ao clicar */
      if (finePointer.matches) {
        wrap.addEventListener("pointermove", e => {
          const r = wrap.getBoundingClientRect();
          main.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        });
        wrap.addEventListener("pointerenter", () => wrap.classList.add("zooming"));
        wrap.addEventListener("pointerleave", () => wrap.classList.remove("zooming"));
      }
      /* arrastar a foto para o lado no celular troca a foto */
      let sx = null, swiped = false;
      wrap.addEventListener("pointerdown", e => { if (e.pointerType === "touch") { sx = e.clientX; swiped = false; } });
      wrap.addEventListener("pointerup", e => {
        if (sx === null) return;
        const dx = e.clientX - sx; sx = null;
        if (p.img.length > 1 && Math.abs(dx) > 40) { swiped = true; show(i + (dx < 0 ? 1 : -1)); }
      });
      wrap.addEventListener("pointercancel", () => { sx = null; });
      wrap.addEventListener("click", e => {
        if (swiped) { swiped = false; return; }
        if (!e.target.closest("button:not([data-zoom])")) openZoom(p.img[i], p.n);
      });
      if (pendingGuide) {
        pendingGuide = false;
        const g = $("#guideAcc");
        if (g) { g.open = true; requestAnimationFrame(() => { g.scrollIntoView({block: "center"}); $("summary", g).focus({preventScroll: true}); }); }
      }
      /* barra fixa de compra no celular quando o botão principal sai da tela */
      const bar = $("#buybar"), target = $("#pdpActions");
      if (bar && target && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(([en]) => bar.classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0));
        io.observe(target); cleanups.push(() => io.disconnect());
      }
    }
  };
}

/* ---------- listas: busca, favoritos, exclusivos ---------- */
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
    <form class="page-search" id="pageSearch" role="search"><input type="search" name="q" value="${esc(q)}" placeholder="Peça, marca, modelo ou referência" aria-label="Buscar"><button class="btn">Buscar</button></form>
  </header>
  ${brandHits.length ? `<div class="chips chips-brands">${brandHits.map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)} <span>${b.n}</span></a>`).join("")}</div>` : ""}
  <div id="shopMain">
    ${!q ? `<p class="sr-label">Marcas populares</p><div class="chips chips-brands">${BRANDS.slice(0, 10).map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)} <span>${b.n}</span></a>`).join("")}</div>
      <p class="sr-label">Atalhos</p><div class="chips"><a class="chip" href="#/exclusivos">Exclusivos</a><a class="chip" href="#/loja/vestuario?tipo=jaquetas">Jaquetas</a><a class="chip" href="#/loja/vestuario?tipo=camisetas-polos">Camisetas e polos</a><a class="chip" href="#/loja/acessorios">Acessórios</a></div>`
    : `<p class="count" tabindex="-1">${plural(list.length, "peça encontrada", "peças encontradas")}</p>
    ${list.length ? gridBlock(list, location.hash) : `<div class="empty"><p>Não encontramos peças com essa busca. Tente o nome da marca, do modelo ou o tipo de peça — ou peça pelo WhatsApp.</p><a class="btn btn-outline" href="#/loja">Ver todas as peças</a></div>`}`}
  </div>
</div>`
  };
}
function favsView() {
  const list = refs(favs);
  currentList = list;
  return {
    nav: "favoritos",
    title: "Favoritos",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Favoritos"]])}
  <header class="page-head">
    <h1 data-split>Seus <em>favoritos</em></h1>
    <p>${list.length ? `${plural(list.length, "peça salva", "peças salvas")} neste aparelho.` : "Toque no coração das peças para guardar aqui as que você gostou."}</p>
  </header>
  <div id="shopMain">
    ${list.length ? `<div class="grid" id="grid">${list.map((p, i) => card(p, i)).join("")}</div>
      <div class="center-cta"><button class="btn" data-favs-to-bag>${ICON.bag} Pedir os favoritos pelo WhatsApp</button></div>`
    : `<div class="empty"><p>Você ainda não salvou nenhuma peça.</p><a class="btn btn-outline" href="#/loja">Ver novidades</a></div>`}
  </div>
</div>`
  };
}
function exclusivesView() {
  const list = DATA.filter(p => p.x);
  currentList = list;
  const groups = [...new Set(list.map(p => p.x))];
  return {
    nav: "exclusivos",
    title: "Exclusivos",
    html: `
<section class="drops drops-page">
  <div class="wrap">
    ${crumbs([["Início", "#/"], ["Exclusivos"]])}
    <header class="page-head">
      <span class="eyebrow eyebrow-light"><span lang="en">Exclusive drops</span></span>
      <h1 class="light" data-split>Colaborações e <em>linhas especiais</em></h1>
      <p>${esc(groups.join(" · "))}</p>
    </header>
  </div>
</section>
<div class="wrap" id="shopMain">
  <div class="grid grid-ex" id="grid">${list.map((p, i) => card(p, i)).join("")}</div>
</div>
${ctaBand()}`
  };
}

/* ---------- como comprar ---------- */
function howView() {
  const faq = [
    ["Como funciona a sacola?", "Você escolhe as peças e os tamanhos e adiciona à sacola. Ao finalizar, o site abre o WhatsApp com uma mensagem pronta listando tudo — com referências, tamanhos e quantidades."],
    ["Os valores aparecem no site?", "Informamos os valores pelo WhatsApp, junto com os tamanhos e as cores disponíveis de cada peça."],
    ["Como sei se tem o meu tamanho?", "Escolha o tamanho desejado (ou “Não sei meu tamanho”) e confirmamos a disponibilidade. O guia de medidas na página de cada peça ajuda a acertar."],
    ["Posso pedir uma peça que não está no site?", "Pode. Mande uma foto ou o nome do modelo e verificamos para você."],
    ["Como funcionam pagamento, entrega e trocas?", "Combinamos tudo diretamente com você pelo WhatsApp, no momento do pedido."]
  ];
  return {
    nav: "como-comprar",
    title: "Como comprar",
    html: `
<div class="wrap">
  ${crumbs([["Início", "#/"], ["Como comprar"]])}
  <header class="page-head center"><h1 data-split>Como <em>comprar</em></h1><p>Simples, rápido e com atendimento de verdade.</p></header>
  <ol class="steps">
    <li data-reveal style="--i:0"><span class="step-n">01</span><h3>Escolha as peças</h3><p>Navegue pelas seções ou pelas marcas, escolha o tamanho e adicione à sacola.</p></li>
    <li data-reveal style="--i:1"><span class="step-n">02</span><h3>Finalize pelo WhatsApp</h3><p>Na sacola, toque em “Finalizar pelo WhatsApp”. A mensagem já sai com tudo o que você escolheu.</p></li>
    <li data-reveal style="--i:2"><span class="step-n">03</span><h3>Receba as informações</h3><p>Confirmamos tamanhos, cores disponíveis e valores, e combinamos pagamento e entrega.</p></li>
  </ol>
  <div class="faq">
    <h2 class="sec-title">Perguntas frequentes</h2>
    <div class="acc">${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>
  <div class="contact-card" data-reveal>
    <div><span class="eyebrow eyebrow-light">Fale com a gente</span><p class="contact-phone">${esc(C.TELEFONE || "")}</p></div>
    <a class="btn btn-silver" href="${wa("Olá! Vim pelo site da " + NOME + ".")}" target="_blank" rel="noopener">${ICON.chat} Chamar no WhatsApp</a>
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
  if (a === "favoritos") return favsView();
  if (a === "exclusivos") return exclusivesView();
  if (a === "como-comprar") return howView();
  return notFound();
}

/* ---------- movimento ---------- */
let revealIO = null, countIO = null;
const cleanups = [];
function splitWords(el) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = "1";
  let n = 0;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement("span"); w.className = "w";
          const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--w", n++);
          w.appendChild(s); frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== "BR") walk(ch);
    });
  };
  walk(el);
}
function initMotion(root) {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    $$("[data-reveal]", root).forEach(el => el.classList.add("in"));
    $$("[data-split]", root).forEach(el => el.classList.add("in"));
    return;
  }
  $$("[data-split]", root).forEach(splitWords);
  if (!revealIO) {
    revealIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
    }), {rootMargin: "0px 0px -6% 0px", threshold: .06});
  }
  $$("[data-reveal]:not(.in), [data-split]:not(.in)", root).forEach(el => revealIO.observe(el));
  if (!countIO) {
    countIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, t0 = performance.now(), dur = 1400;
      el.textContent = "0";
      const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("pt-BR"); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), {threshold: .4});
  }
  $$("[data-count]", root).forEach(el => countIO.observe(el));
}
/* inclinação 3D com reflexo de luz */
function initTilt(root) {
  if (reduceMotion.matches || !finePointer.matches) return;
  $$("[data-tilt]", root).forEach(el => {
    if (el._tilt) return; el._tilt = 1;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`); el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
      el.style.setProperty("--gx", `${x * 100}%`); el.style.setProperty("--gy", `${y * 100}%`);
      el.classList.add("tilting");
    });
    el.addEventListener("pointerleave", () => { el.classList.remove("tilting"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
}
/* hero: profundidade com o mouse e com a rolagem, peça em destaque alternando */
function initHero() {
  const hero = $("#hero");
  if (!hero) return;
  const media = $(".hero-media", hero), orbits = $(".hero-orbits", hero), inner = $(".hero-inner", hero), feat = $(".hero-feature", hero);
  let mx = 0, my = 0, sy = 0, raf = 0;
  const apply = () => {
    raf = 0;
    const h = hero.offsetHeight, k = Math.min(1, sy / h);
    media.style.transform = `translate3d(${mx * -14}px, ${sy * 0.28 + my * -10}px, 0) scale(1.08)`;
    orbits.style.transform = `translate3d(${mx * 26}px, ${sy * 0.12 + my * 18}px, 0)`;
    inner.style.transform = `translate3d(${mx * 8}px, ${sy * 0.18 + my * 6}px, 0)`;
    inner.style.opacity = String(1 - k * 1.4);
    if (feat) feat.style.transform = `translate3d(${mx * -18}px, ${sy * 0.1 + my * -12}px, 0)`;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
  if (!reduceMotion.matches) {
    const onScroll = () => { sy = Math.max(0, scrollY - hero.offsetTop); if (sy < hero.offsetHeight * 1.2) queue(); };
    const onMove = e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; queue(); };
    addEventListener("scroll", onScroll, {passive: true});
    if (finePointer.matches) hero.addEventListener("pointermove", onMove);
    cleanups.push(() => removeEventListener("scroll", onScroll));
    onScroll();
  }
  /* alterna a peça em destaque */
  const cards = $$(".hf-card", hero), dots = $$("[data-hfdot]", hero);
  if (cards.length > 1 && feat) {
    let cur = 0, paused = false, stopped = false;
    const show = j => {
      cards[cur].classList.remove("on"); cards[cur].setAttribute("tabindex", "-1"); cards[cur].setAttribute("aria-hidden", "true");
      cur = (j + cards.length) % cards.length;
      cards[cur].classList.add("on"); cards[cur].removeAttribute("tabindex"); cards[cur].removeAttribute("aria-hidden");
      dots.forEach((d, i) => d.setAttribute("aria-pressed", i === cur));
    };
    dots.forEach((d, i) => d.addEventListener("click", () => { stopped = true; show(i); }));
    feat.addEventListener("pointerenter", () => { paused = true; });
    feat.addEventListener("pointerleave", () => { paused = false; });
    feat.addEventListener("focusin", () => { paused = true; });
    feat.addEventListener("focusout", () => { paused = false; });
    const timer = reduceMotion.matches ? 0 : setInterval(() => { if (!document.hidden && !paused && !stopped) show(cur + 1); }, 5200);
    cleanups.push(() => clearInterval(timer));
  }
}
/* elementos com leve paralaxe dentro da página */
function initParallax(root) {
  if (reduceMotion.matches) return;
  const els = $$("[data-parallax]", root);
  if (!els.length) return;
  let raf = 0;
  const apply = () => {
    raf = 0;
    els.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const max = Math.max(0, (el.offsetHeight * 1.12 - r.height) / 2 - 2);
      const k = Math.max(-max, Math.min(max, (r.top + r.height / 2 - innerHeight / 2) * +el.dataset.parallax));
      el.style.transform = `translate3d(0, ${k}px, 0) scale(1.12)`;
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
  addEventListener("scroll", onScroll, {passive: true});
  cleanups.push(() => removeEventListener("scroll", onScroll));
  apply();
}
/* carrosséis: setas, barra de progresso e arrastar com o mouse */
function initRails() {
  $$(".rail").forEach(el => {
    if (!el._upd) {
      const bar = $(`[data-progress="${el.id}"] span`);
      el._upd = () => {
        const max = el.scrollWidth - el.clientWidth - 2;
        $$(`[data-rail="${el.id}"]`).forEach(b => { b.disabled = b.dataset.dir < 0 ? el.scrollLeft <= 2 : el.scrollLeft >= max; });
        el.classList.toggle("at-start", el.scrollLeft <= 2);
        el.classList.toggle("at-end", el.scrollLeft >= max);
        if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(.08, Math.min(1, (el.scrollLeft + el.clientWidth) / el.scrollWidth)) : 1})`;
      };
      el.addEventListener("scroll", el._upd, {passive: true});
      if (finePointer.matches) {
        el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button) return; drag = {el, sx: e.clientX, sl: el.scrollLeft}; el._moved = false; });
        el.addEventListener("click", e => { if (el._moved) { e.preventDefault(); e.stopPropagation(); el._moved = false; } }, true);
        el.addEventListener("dragstart", e => e.preventDefault());
      }
    }
    el._upd();
  });
}
let drag = null;
addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.sx;
  if (Math.abs(dx) > 5 && !drag.el._moved) { drag.el._moved = true; drag.el.classList.add("dragging"); }
  if (drag.el._moved) drag.el.scrollLeft = drag.sl - dx;
});
addEventListener("pointerup", () => { if (!drag) return; const el = drag.el; drag = null; setTimeout(() => el.classList.remove("dragging"), 0); });
addEventListener("resize", () => initRails());

/* troca de foto com transição suave */
function swapImg(img, src) {
  if ((img._to ?? img.getAttribute("src")) === src) return;
  img._to = src;
  if (reduceMotion.matches || !img.animate) { img.src = src; return; }
  img.getAnimations().forEach(a => a.cancel());
  img.animate([{opacity: 1}, {opacity: 0}], {duration: 160, easing: "ease-out"}).onfinish = () => {
    if (img._to !== src) return;
    img.src = src; img.animate([{opacity: 0, transform: "scale(1.02)"}, {opacity: 1, transform: "scale(1)"}], {duration: 380, easing: EASE});
  };
}

/* ---------- renderização e rolagem ---------- */
const app = $("#app");
const header = $("#siteHeader");
const scrollMem = new Map();
let intent = null, lastBodyClass = "", pendingGuide = false;

function render(keepScroll) {
  const act = document.activeElement;
  const activeId = act && act !== app && app.contains(act) ? act.id : "";
  cleanups.splice(0).forEach(fn => fn());
  const r = parseRoute();
  const v = resolve(r);
  closeOverlays();
  app.innerHTML = v.html;
  document.title = v.title ? `${v.title} · ${NOME}` : `${NOME} · Grifes selecionadas`;
  $$("[data-nav]").forEach(a => a.dataset.nav === v.nav ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (lastBodyClass) document.body.classList.remove(lastBodyClass);
  lastBodyClass = v.bodyClass || "";
  if (lastBodyClass) document.body.classList.add(lastBodyClass);
  header.classList.toggle("overlay", !!v.home);
  document.body.classList.toggle("is-home", !!v.home);
  if (v.after) v.after();
  initRails(); initMotion(app); initTilt(app); initHero(); initParallax(app);
  document.documentElement.classList.remove("lock");
  setInert(false);

  if (!keepScroll) {
    const shop = $("#shopMain");
    if (intent === "keep" && shop) {
      const top = shop.getBoundingClientRect().top + scrollY - headerH() - 12;
      if (scrollY > top) scrollTo(0, top);
    } else if (intent) {
      scrollTo(0, 0);
    } else {
      scrollTo(0, scrollMem.get(location.hash) || 0);
    }
  }
  if (intent === "keep") {
    const el = (activeId && document.getElementById(activeId)) || $("#shopMain .count");
    if (el) el.focus({preventScroll: true});
  } else if (intent) app.focus({preventScroll: true});
  if (intent && intent !== "keep" && !reduceMotion.matches && app.animate) {
    app.animate([{opacity: 0, transform: "translateY(14px)"}, {opacity: 1, transform: "none"}], {duration: 520, easing: EASE});
  }
  intent = null;
  onScrollHeader();
  document.documentElement.classList.add("ready");
}
const headerH = () => header.offsetHeight;
function onScrollHeader() {
  const ov = header.classList.contains("overlay"), scrolled = scrollY > 40;
  header.classList.toggle("docked", !ov || scrolled);
  header.classList.toggle("solid", !ov || scrolled || !$("#search").hidden);
}
addEventListener("scroll", () => { scrollMem.set(location.hash, scrollY); onScrollHeader(); }, {passive: true});
addEventListener("hashchange", () => render());
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

/* Janelas (sacola, menu, filtros, visualização rápida, zoom) ganham uma entrada no histórico:
   o botão Voltar do celular fecha a janela em vez de trocar a página por baixo. */
const isModalState = () => !!(history.state && history.state.ltModal);
const modalHist = {
  push() { if (!isModalState()) history.pushState({ltModal: 1}, "", location.href); },
  pop() { if (isModalState()) history.back(); }
};
addEventListener("popstate", () => { if (!isModalState()) closeOverlays(); });
function closeOverlays() {
  closeSearch(true); closeDrawer(true); closeBag(true); closeFilters();
  if (qv.open) { qvSilent = true; qv.close(); }
  if (zoomer.open) { zoomSilent = true; zoomer.close(); }
}
/* fundo inerte enquanto a sacola ou o menu estão abertos */
function setInert(on) {
  [app, header, $(".site-footer"), $(".announce"), $("#waFloat"), $("#toast")].forEach(el => { if (el) el.inert = on; });
}

function go(h, keep) {
  intent = keep ? "keep" : "link";
  if (isModalState()) { history.replaceState(null, "", h); render(); return; }
  if (location.hash === h) render(); else location.hash = h;
}

/* ---------- sacola ---------- */
const bagEl = $("#bag"), bagBtn = $("#bagBtn");
let bagReturn = null, bagHideT = 0;
const bagKey = it => `${it.r}|${it.s}`;
function renderBag(focus) {
  const body = $("#bagBody"), foot = $("#bagFoot");
  $("#bagTitle").textContent = bag.length ? `Sua sacola (${bagQty()})` : "Sua sacola";
  if (!bag.length) {
    body.innerHTML = `<div class="bag-empty">${ICON.bag}<p>Sua sacola está vazia.</p><a class="btn btn-outline" href="#/loja">Ver novidades</a></div>`;
    foot.innerHTML = "";
  } else {
    body.innerHTML = `<ul class="bag-list">${bag.map(it => {
      const p = BY_REF.get(it.r), k = esc(bagKey(it));
      return `<li class="bag-item">
        <a class="bi-img" href="#/p/${esc(p.r)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.img[0])}" alt=""></a>
        <div class="bi-info">
          <small>${esc(p.b)}</small>
          <a href="#/p/${esc(p.r)}" class="bi-name">${esc(p.n)}</a>
          <span class="bi-meta">Ref. ${esc(p.r)}${it.s ? ` · Tamanho ${esc(it.s)}` : ""}</span>
          <div class="bi-row">
            <span class="qty" role="group" aria-label="Quantidade de ${esc(p.n)}">
              <button data-q="${k}" data-d="-1" aria-label="Diminuir">${ICON.minus}</button><b aria-live="polite">${+it.q}</b><button data-q="${k}" data-d="1" aria-label="Aumentar">${ICON.plus}</button>
            </span>
            <button class="link-btn" data-rm="${k}" aria-label="Remover ${esc(p.n)}">Remover</button>
          </div>
        </div>
      </li>`;
    }).join("")}</ul>`;
    foot.innerHTML = `<p class="bag-note">Valores, cores e disponibilidade são confirmados pelo WhatsApp antes de fechar o pedido.</p>
      <a class="btn btn-block" href="${wa(bagMessage())}" target="_blank" rel="noopener">${ICON.chat} Finalizar pelo WhatsApp</a>
      <button class="btn btn-outline btn-block" id="bagContinue">Continuar comprando</button>`;
  }
  if (typeof focus === "function") { const el = focus(); if (el) el.focus({preventScroll: true}); }
}
function openBag() {
  if (bagEl.classList.contains("open")) return;
  loadState(); renderBag(); hideToast();
  clearTimeout(bagHideT);
  bagReturn = document.activeElement;
  bagEl.hidden = false; void bagEl.offsetWidth; bagEl.classList.add("open");
  bagBtn.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("lock");
  setInert(true);
  modalHist.push();
  setTimeout(() => $("#bagClose").focus({preventScroll: true}), 60);
}
function closeBag(silent) {
  if (!bagEl.classList.contains("open")) return;
  bagEl.classList.remove("open"); bagBtn.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("lock");
  setInert(false);
  clearTimeout(bagHideT);
  bagHideT = setTimeout(() => { if (!bagEl.classList.contains("open")) bagEl.hidden = true; }, silent ? 0 : 450);
  if (!silent) {
    modalHist.pop();
    if (bagReturn && document.contains(bagReturn)) bagReturn.focus({preventScroll: true});
  }
}
function changeQty(key, d) {
  loadState();
  const i = bag.findIndex(it => bagKey(it) === key);
  if (i < 0) { renderBag(); return; }
  const q = d === 0 ? 0 : bag[i].q + d;
  if (q <= 0) bag.splice(i, 1); else bag[i].q = Math.min(9, q);
  store.set("lt-bag", bag); updateCounts();
  if (q > 0) renderBag(() => $(`[data-q="${CSS.escape(key)}"][data-d="${d}"]`, bagEl));
  else renderBag(() => { const rms = $$("[data-rm]", bagEl); return rms[i] || rms[i - 1] || $("#bagClose"); });
}
bagBtn.addEventListener("click", openBag);
$("#bagClose").addEventListener("click", () => closeBag());
bagEl.addEventListener("click", e => {
  if (e.target === bagEl) return closeBag();
  const q = e.target.closest("[data-q]"); if (q) return changeQty(q.dataset.q, +q.dataset.d);
  const rm = e.target.closest("[data-rm]"); if (rm) return changeQty(rm.dataset.rm, 0);
  if (e.target.closest("#bagContinue")) return closeBag();
});
function flyToBag(fromEl, p) {
  if (reduceMotion.matches || !fromEl || !document.body.animate) { bump(); return; }
  const src = fromEl.closest(".card, .pdp, .qv-body, #buybar")?.querySelector("img") || null;
  const a = (src || fromEl).getBoundingClientRect(), b = bagBtn.getBoundingClientRect();
  if (!a.width || !b.width) { bump(); return; }
  const ghost = document.createElement("img");
  ghost.src = p.img[0]; ghost.className = "fly"; ghost.alt = "";
  const s = Math.min(120, a.width);
  Object.assign(ghost.style, {left: `${a.left + a.width / 2 - s / 2}px`, top: `${a.top + a.height / 2 - s / 2}px`, width: `${s}px`, height: `${s}px`});
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  ghost.animate([
    {transform: "translate(0,0) scale(1)", opacity: 1},
    {transform: `translate(${dx * .5}px, ${dy * .5 - 60}px) scale(.55)`, opacity: .9, offset: .55},
    {transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: .2}
  ], {duration: 760, easing: "cubic-bezier(.5,0,.2,1)"}).onfinish = () => { ghost.remove(); bump(); };
}
function bump() {
  const el = $("#bagCount");
  if (el.animate && !reduceMotion.matches) el.animate([{transform: "scale(1)"}, {transform: "scale(1.45)"}, {transform: "scale(1)"}], {duration: 420, easing: EASE});
}

/* ---------- avisos rápidos ---------- */
let toastTimer = 0, toastAction = null;
function toast(msg, act) {
  const el = $("#toast");
  toastAction = act || null;
  el.innerHTML = `<span>${esc(msg)}</span>${act ? (act.href ? `<a href="${act.href}">${esc(act.label)}</a>` : `<button>${esc(act.label)}</button>`) : ""}`;
  el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 3600);
}
function hideToast() { clearTimeout(toastTimer); $("#toast").classList.remove("show"); }
$("#toast").addEventListener("click", e => {
  if (e.target.closest("button") && toastAction?.action) { hideToast(); toastAction.action(); }
  if (e.target.closest("a")) hideToast();
});

/* ---------- visualização rápida ---------- */
const qv = $("#qv");
let qvSilent = false, qvNav = false;
function openQV(r) {
  const p = BY_REF.get(r); if (!p) return;
  qv.innerHTML = `<div class="qv-body">
    <button class="icon-btn qv-close" data-qvclose aria-label="Fechar">${ICON.close}</button>
    <div class="qv-gal">
      <img id="qvImg" src="${esc(p.img[0])}" alt="${esc(p.n + " — " + p.b)}">
      ${p.img.length > 1 ? `<div class="qv-thumbs">${p.img.map((s, j) => `<button data-qvi="${j}" aria-current="${j === 0}" aria-label="Foto ${j + 1}"><img src="${esc(s)}" alt=""></button>`).join("")}</div>` : ""}
    </div>
    <div class="qv-info">
      <a class="pdp-brand" href="#/marca/${p.bs}">${esc(p.b)}</a>
      <h2>${esc(p.n)}</h2>
      <p class="pdp-price">${esc(price(p))}</p>
      ${p.x ? `<span class="tag tag-x">${esc(p.x)}</span>` : ""}
      ${p.d ? `<p class="pdp-desc">${esc(p.d)}</p>` : ""}
      ${sizePicker(p, "qv")}
      <div class="pdp-actions">
        <button class="btn btn-block btn-add" data-add="${esc(p.r)}" data-from="qv">${ICON.bag} Adicionar à sacola</button>
        ${favBtn(p, "fav-lg")}
      </div>
      <a class="link-arrow" href="#/p/${esc(p.r)}">Ver página completa ${ICON.arrowR}</a>
    </div>
  </div>`;
  qv.showModal();
  modalHist.push();
  if (!reduceMotion.matches && qv.animate) qv.animate([{opacity: 0, transform: "translateY(18px) scale(.98)"}, {opacity: 1, transform: "none"}], {duration: 380, easing: EASE});
}
qv.addEventListener("click", e => {
  if (e.target === qv || e.target.closest("[data-qvclose]")) return qv.close();
  const t = e.target.closest("[data-qvi]");
  if (t) { const p = BY_REF.get($("[data-add]", qv).dataset.add); swapImg($("#qvImg"), p.img[+t.dataset.qvi]); $$("[data-qvi]", qv).forEach(b => b.setAttribute("aria-current", b === t)); }
});
qv.addEventListener("close", () => { if (!qvSilent && !qvNav) modalHist.pop(); qvSilent = qvNav = false; qv.innerHTML = ""; });

/* ---------- foto ampliada ---------- */
const zoomer = $("#zoomer"), zoomImg = $("#zoomImg"), zoomStage = $("#zoomStage");
let zoomSilent = false;
function openZoom(src, alt) {
  zoomImg.src = src; zoomImg.alt = alt || ""; zoomStage.classList.remove("on"); zoomStage.setAttribute("aria-pressed", "false");
  zoomer.showModal();
  modalHist.push();
}
zoomStage.addEventListener("click", e => {
  const r = zoomImg.getBoundingClientRect();
  zoomImg.style.transformOrigin = e.detail === 0 || !r.width ? "50% 50%" : `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  zoomStage.classList.toggle("on");
  zoomStage.setAttribute("aria-pressed", zoomStage.classList.contains("on"));
});
zoomStage.addEventListener("pointermove", e => {
  if (!zoomStage.classList.contains("on") || e.pointerType !== "mouse") return;
  const r = zoomStage.getBoundingClientRect();
  zoomImg.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
});
$("#zoomClose").addEventListener("click", () => zoomer.close());
zoomer.addEventListener("click", e => { if (e.target === zoomer) zoomer.close(); });
zoomer.addEventListener("close", () => { if (!zoomSilent) modalHist.pop(); zoomSilent = false; });

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (a) {
    const h = a.getAttribute("href");
    if (h === "#top") { e.preventDefault(); scrollTo({top: 0, behavior: reduceMotion.matches ? "auto" : "smooth"}); return; }
    if (h === "#app") { e.preventDefault(); app.focus(); return; }
    if (h.startsWith("#/")) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      if (qv.open) { qvNav = true; qv.close(); }
      go(h, !!a.dataset.keep);
      return;
    }
  }
  if (e.target.closest(".scrim")) { toggleFilters(false); return; }
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.fav) { e.preventDefault(); toggleFav(btn.dataset.fav, btn); return; }
  if (btn.dataset.qv) { openQV(btn.dataset.qv); return; }
  if (btn.dataset.quick) {
    const p = BY_REF.get(btn.dataset.quick);
    if (sizesFor(p)) openQV(p.r); else addToBag(p.r, "", btn);
    return;
  }
  if (btn.dataset.add) {
    const p = BY_REF.get(btn.dataset.add), from = btn.dataset.from;
    if (needSize(p, from)) {
      if (btn.closest("#buybar")) $(`[data-sizes="${from}"]`)?.scrollIntoView({behavior: reduceMotion.matches ? "auto" : "smooth", block: "center"});
      return;
    }
    if (from === "qv") { addToBag(p.r, pickedSize(from), btn, 320); setTimeout(() => { if (qv.open) qv.close(); }, 250); }
    else addToBag(p.r, pickedSize(from), btn);
    return;
  }
  if (btn.hasAttribute("data-guide")) {
    if (btn.closest("#qv")) {
      const p = BY_REF.get($("[data-add]", qv)?.dataset.add);
      qvNav = true; qv.close();
      if (p) { pendingGuide = true; go(`#/p/${p.r}`); }
    } else {
      const g = $("#guideAcc");
      if (g) { g.open = true; g.scrollIntoView({behavior: reduceMotion.matches ? "auto" : "smooth", block: "center"}); $("summary", g).focus({preventScroll: true}); }
    }
    return;
  }
  if (btn.hasAttribute("data-favs-to-bag")) {
    const msg = `Olá! Separei estas peças na ${NOME}:\n\n${refs(favs).map((p, i) => `${i + 1}. ${p.n} — ${p.b} (Ref. ${p.r})`).join("\n")}\n\nPode me passar tamanhos, cores e valores?`;
    open(wa(msg), "_blank", "noopener");
    return;
  }
  if (btn.dataset.scrollto) { $("#" + btn.dataset.scrollto)?.scrollIntoView({behavior: reduceMotion.matches ? "auto" : "smooth"}); return; }
  if (btn.dataset.rail) {
    const el = document.getElementById(btn.dataset.rail);
    if (el) el.scrollBy({left: +btn.dataset.dir * el.clientWidth * .85, behavior: reduceMotion.matches ? "auto" : "smooth"});
    return;
  }
  if (btn.dataset.feat) {
    featState = btn.dataset.feat;
    $$("[data-feat]").forEach(t => t.setAttribute("aria-pressed", t === btn));
    const body = $("#featBody");
    body.innerHTML = featGrid(featState);
    initMotion(body);
    return;
  }
  if (btn.dataset.spot) {
    spotState = btn.dataset.spot;
    $$("[data-spot]").forEach(t => t.setAttribute("aria-pressed", t === btn));
    const body = $("#spotBody");
    body.innerHTML = spotBody(spotState);
    initRails(); initMotion(body);
    return;
  }
  if (btn.hasAttribute("data-more")) {
    const key = location.hash, grid = $("#grid");
    const shown = grid.children.length, next = Math.min(currentList.length, shown + PAGE);
    grid.insertAdjacentHTML("beforeend", currentList.slice(shown, next).map((p, i) => card(p, i)).join(""));
    shownMem.set(key, next);
    $("#more").outerHTML = moreBlock(currentList.length, next);
    initMotion(grid);
    grid.children[shown]?.querySelector(".card-link")?.focus({preventScroll: true});
    return;
  }
  if (btn.dataset.filters) { toggleFilters(btn.dataset.filters === "open"); return; }
});
document.addEventListener("change", e => {
  if (e.target.id === "sortSel") {
    const s = e.target, q = JSON.parse(s.dataset.q || "{}");
    go(href(s.dataset.path, {...q, ordem: s.value}), true);
  }
  if (e.target.closest("[data-sizes]")) {
    const fs = e.target.closest("[data-sizes]"), id = fs.dataset.sizes, v = e.target.value;
    fs.removeAttribute("aria-invalid");
    const h = $(`#szh-${id}`); if (h) h.textContent = v === SIZE_TBD ? "Sem problema — ajudamos a escolher o tamanho pelo WhatsApp." : `Tamanho ${v} selecionado. A disponibilidade é confirmada pelo WhatsApp.`;
    const link = $("#pdpWa");
    if (id === "pdp" && link) {
      const p = BY_REF.get($("#pdpActions [data-add]").dataset.add);
      link.href = wa(`Olá! Tenho interesse na peça ${p.n} ${p.b} (Ref. ${p.r})${v === SIZE_TBD ? " — ainda não sei meu tamanho" : ` · Tamanho ${v}`}.`);
    }
  }
});
document.addEventListener("submit", e => {
  if (e.target.id === "pageSearch") {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) go(href("busca", {q}));
  }
});

/* ---------- filtros (celular) ---------- */
function toggleFilters(open) {
  const f = $("#filters"), s = $(".scrim"), b = $(".btn-filter");
  if (!f || f.classList.contains("open") === open) return;
  f.classList.toggle("open", open);
  if (s) s.hidden = !open;
  document.documentElement.classList.toggle("lock", open);
  if (b) b.setAttribute("aria-expanded", open);
  if (open) {
    f.setAttribute("role", "dialog"); f.setAttribute("aria-modal", "true");
    modalHist.push();
    setTimeout(() => $("[data-filters='close']", f)?.focus({preventScroll: true}), 60);
  } else {
    f.removeAttribute("role"); f.removeAttribute("aria-modal");
    modalHist.pop();
    if (b) b.focus({preventScroll: true});
  }
}
function closeFilters() {
  const f = $("#filters");
  if (!f || !f.classList.contains("open")) return;
  f.classList.remove("open"); f.removeAttribute("role"); f.removeAttribute("aria-modal");
  const s = $(".scrim"); if (s) s.hidden = true;
  document.documentElement.classList.remove("lock");
}

/* ---------- menu lateral (celular) ---------- */
const drawer = $("#drawer"), menuBtn = $("#menuBtn");
let drawerReturn = null, drawerHideT = 0;
function openDrawer() {
  if (drawer.classList.contains("open")) return;
  clearTimeout(drawerHideT);
  drawerReturn = document.activeElement;
  drawer.hidden = false; void drawer.offsetWidth; drawer.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("lock");
  setInert(true);
  modalHist.push();
  setTimeout(() => $("#drawerClose").focus({preventScroll: true}), 60);
}
function closeDrawer(silent) {
  if (!drawer.classList.contains("open")) return;
  drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("lock");
  setInert(false);
  clearTimeout(drawerHideT);
  drawerHideT = setTimeout(() => { if (!drawer.classList.contains("open")) drawer.hidden = true; }, silent ? 0 : 450);
  if (!silent) {
    modalHist.pop();
    if (drawerReturn && document.contains(drawerReturn)) drawerReturn.focus({preventScroll: true});
  }
}
menuBtn.addEventListener("click", openDrawer);
$("#drawerClose").addEventListener("click", () => closeDrawer());
drawer.addEventListener("click", e => { if (e.target === drawer) closeDrawer(); });
$("#drawerBrands").innerHTML = `<span class="eyebrow eyebrow-light">Marcas</span><div class="drawer-chips">${BRANDS.slice(0, 10).map(b => `<a href="#/marca/${b.s}">${esc(b.name)}</a>`).join("")}<a href="#/marcas">Ver todas →</a></div>`;

/* ---------- busca no cabeçalho ---------- */
const sPanel = $("#search"), sInput = $("#searchInput"), sBtn = $("#searchBtn"), sRes = $("#searchResults");
function openSearch() { sPanel.hidden = false; sBtn.setAttribute("aria-expanded", "true"); onScrollHeader(); sInput.focus({preventScroll: true}); sInput.select(); liveSearch(); }
function closeSearch(silent) {
  if (sPanel.hidden) return;
  const hadFocus = sPanel.contains(document.activeElement);
  sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false"); onScrollHeader();
  if (!silent && hadFocus) sBtn.focus({preventScroll: true});
}
sBtn.addEventListener("click", () => sPanel.hidden ? openSearch() : closeSearch());
$("#searchClose").addEventListener("click", () => closeSearch());
let sTimer;
sInput.addEventListener("input", () => { clearTimeout(sTimer); sTimer = setTimeout(liveSearch, 120); });
function liveSearch() {
  const q = sInput.value.trim();
  if (!q) {
    sRes.innerHTML = `<p class="sr-label">Marcas populares</p><div class="chips">${BRANDS.slice(0, 8).map(b => `<a class="chip" href="#/marca/${b.s}">${esc(b.name)}</a>`).join("")}</div>
      <p class="sr-label">Atalhos</p><div class="chips"><a class="chip" href="#/exclusivos">Exclusivos</a><a class="chip" href="#/loja/vestuario?tipo=jaquetas">Jaquetas</a><a class="chip" href="#/loja/vestuario?tipo=camisetas-polos">Camisetas e polos</a><a class="chip" href="#/loja/acessorios">Acessórios</a></div>`;
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
  if (e.key === "Escape") {
    if (bagEl.classList.contains("open")) closeBag();
    else if (drawer.classList.contains("open")) closeDrawer();
    else if ($("#filters.open")) toggleFilters(false);
    else closeSearch();
  }
  if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && !qv.open) { e.preventDefault(); openSearch(); }
});
document.addEventListener("click", e => {
  if (!sPanel.hidden && !e.target.closest(".site-header")) closeSearch();
});

/* ---------- faixa de avisos ---------- */
const avisos = (C.AVISOS || []).filter(Boolean);
const ann = $("#announce");
if (avisos.length) {
  ann.innerHTML = avisos.map((t, i) => `<span class="${i === 0 ? "on" : ""}">${esc(t)}</span>`).join("");
  let k = 0;
  if (avisos.length > 1 && !reduceMotion.matches) {
    let hold = false;
    ann.parentElement.addEventListener("pointerenter", () => { hold = true; });
    ann.parentElement.addEventListener("pointerleave", () => { hold = false; });
    setInterval(() => {
      if (hold || document.hidden) return;
      const s = ann.children;
      s[k].classList.remove("on"); k = (k + 1) % s.length; s[k].classList.add("on");
    }, 4500);
  }
} else ann.parentElement.hidden = true;

/* ---------- abertura (primeira visita da sessão) ---------- */
function intro() {
  let seen = false;
  try { seen = sessionStorage.getItem("lt-intro") === "1"; sessionStorage.setItem("lt-intro", "1"); } catch {}
  if (seen || reduceMotion.matches || location.hash.replace(/^#\/?/, "")) return;
  const el = document.createElement("div");
  el.className = "intro"; el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<div class="intro-mark"><span class="logo-mark">L&amp;T</span><span class="logo-sub">Club</span></div><span class="intro-line"><i></i></span>`;
  document.body.appendChild(el);
  document.documentElement.classList.add("intro-on");
  const done = () => { if (el._done) return; el._done = 1; el.classList.add("out"); document.documentElement.classList.remove("intro-on"); setTimeout(() => el.remove(), 900); };
  const img = new Image(); img.src = "img/hero.jpg";
  const minT = new Promise(res => setTimeout(res, 1150));
  const loaded = new Promise(res => { img.onload = img.onerror = res; });
  Promise.all([minT, loaded]).then(done);
  setTimeout(done, 2600);
}

/* ---------- links fixos ---------- */
const hello = wa("Olá! Vim pelo site da " + NOME + ".");
["#ftWa", "#waFloat", "#ftWaBtn"].forEach(s => { const el = $(s); if (el) el.href = hello; });
$("#ftPhone").textContent = C.TELEFONE || "";
$("#year").textContent = new Date().getFullYear();
$("#ftBrands").innerHTML = BRANDS.slice(0, 6).map(b => `<li><a href="#/marca/${b.s}">${esc(b.name)}</a></li>`).join("") + `<li><a href="#/marcas">Ver todas</a></li>`;
$("#ftSocial").innerHTML = `<a href="${hello}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.chat}</a>` +
  (C.INSTAGRAM ? `<a href="https://instagram.com/${esc(C.INSTAGRAM)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.insta}</a>` : "");

updateCounts();
intro();
render();
})();

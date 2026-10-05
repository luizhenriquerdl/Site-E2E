/* O conteúdo editável (projetos, clientes, contato, fundos) fica na pasta data/
   e é alterado pelo painel em /admin. Aqui ficam só textos fixos. */
const WA_MSG = "Olá! Vim pelo site da E2E Engenharia e gostaria de solicitar um orçamento.";
const SERVICOS = [
  { nome: "Montagens", desc: "Montagem de estruturas, tubulações e equipamentos industriais." },
  { nome: "Saneamento", desc: "Obras e intervenções em redes, adutoras e estações." },
  { nome: "Fabricação", desc: "Fabricação de estruturas metálicas e equipamentos sob medida." },
  { nome: "Elevação", desc: "Soluções para movimentação e içamento de cargas." }
];
const FAIXA_SERVICOS = [...SERVICOS.map(s => s.nome), "Estroncamento", "Estruturas metálicas", "Desvio de adutoras", "Caçambas e equipamentos"];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rep = (arr, n = 4) => Array.from({ length: n }, () => arr).flat(); // repete a lista para o loop não ter vazio
const load = nome => fetch(`data/${nome}.json`, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(nome); return r.json(); });
const fmtData = d => {
  const t = new Date(d + "T12:00:00"); if (isNaN(t)) return "";
  const m = t.toLocaleDateString("pt-BR", { month: "long" });
  return m[0].toUpperCase() + m.slice(1) + ", " + t.getFullYear();
};

let PROJETOS = [], CONTATO = {};
const fig = p => `<span class="fig">${p.titulo}<img src="${p.img}" alt="${p.titulo}" loading="lazy"></span>`;
const card = p => `<a class="card" href="#projeto-${p.id}">${fig(p)}
  <span class="t">${p.titulo}</span><span class="m">${p.cliente}</span><span class="m">${p.data}</span></a>`;

/* Imagens: se o arquivo não existe, mostra o substituto */
document.addEventListener("error", e => { if (e.target.matches?.("img")) e.target.remove(); }, true);
document.addEventListener("load", e => { if (e.target.matches?.(".cl img")) e.target.parentElement.classList.add("has"); }, true);

/* ====== Abas (navegação por #hash) ====== */
let aba = "inicio";
const cabecalho = () => $("#top").classList.toggle("solid", scrollY > 40 || aba !== "inicio");
function renderDetalhe(id) {
  const el = $("#detalhe"), i = PROJETOS.findIndex(p => p.id === id);
  if (i < 0) { el.innerHTML = '<a class="back" href="#projetos">← Voltar aos projetos</a><h1>Projeto não encontrado</h1>'; return; }
  const p = PROJETOS[i], ant = PROJETOS[i - 1], prox = PROJETOS[i + 1];
  const outros = PROJETOS.filter(x => x.id !== id);
  const galeria = (p.galeria || []).map(g => `<img src="${g}" alt="${p.titulo}" loading="lazy">`).join("");
  el.innerHTML = `
    <a class="back" href="#projetos">← Voltar aos projetos</a>
    <h1>${p.titulo}</h1>
    <p class="meta">${[p.cliente, p.data, p.area].filter(Boolean).map(t => `<span>${t}</span>`).join("")}</p>
    ${fig(p)}
    ${p.descricao ? `<p class="desc">${p.descricao}</p>` : ""}
    ${galeria ? `<div class="galeria">${galeria}</div>` : ""}
    <div class="pn">${ant ? `<a href="#projeto-${ant.id}">← ${ant.titulo}</a>` : "<span></span>"}${prox ? `<a href="#projeto-${prox.id}">${prox.titulo} →</a>` : "<span></span>"}</div>
    <a class="btn pill big" href="#contato">Solicitar orçamento</a>
    ${outros.length ? `<h2 class="outros">Outros projetos</h2><div class="grid4 wide">${outros.map(card).join("")}</div>` : ""}`;
}
function mostrarAba() {
  const h = location.hash.slice(1), m = h.match(/^projeto-(\d+)$/);
  if (m) { aba = "projeto"; renderDetalhe(+m[1]); }
  else aba = $$("[data-tab]").some(s => s.id === h && s.id !== "projeto") ? h : "inicio";
  const ativo = aba === "projeto" ? "projetos" : aba;
  $$("[data-tab]").forEach(s => (s.hidden = s.id !== aba));
  $$(".nav a").forEach(a => {
    const on = a.getAttribute("href") === "#" + ativo;
    a.classList.toggle("on", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  document.activeElement?.blur();
  scrollTo(0, 0);
  cabecalho();
}
addEventListener("hashchange", mostrarAba);
addEventListener("scroll", cabecalho, { passive: true });

/* ====== Formulário ====== */
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, st = $("#status");
  if (!f.checkValidity()) { f.reportValidity(); st.textContent = "Preencha nome, e-mail válido e mensagem."; return; }
  const d = new FormData(f);
  const corpo = `Nome: ${d.get("nome")}\nE-mail: ${d.get("email")}\nTelefone: ${d.get("tel") || "-"}\n\n${d.get("msg")}`;
  location.href = `mailto:${CONTATO.email}?subject=${encodeURIComponent("Solicitação de orçamento pelo site")}&body=${encodeURIComponent(corpo)}`;
  st.textContent = "Abrimos seu aplicativo de e-mail com a mensagem pronta.";
});

/* ====== Carrega os dados e monta a página ====== */
async function main() {
  let dProj = { projetos: [] }, dCli = { clientes: [] }, site = {};
  try {
    [dProj, dCli, site] = await Promise.all(["projetos", "clientes", "site"].map(load));
  } catch {
    document.body.insertAdjacentHTML("afterbegin",
      '<p class="aviso">Não foi possível carregar os dados do site. Abra por um servidor (ex.: extensão Live Server), não com duplo clique no arquivo.</p>');
  }
  CONTATO = site;
  PROJETOS = (dProj.projetos || []).map((p, i) => ({
    ...p, id: i + 1, ano: new Date(p.data + "T12:00:00").getFullYear(), data: fmtData(p.data), area: p.area || ""
  }));
  const CLIENTES = dCli.clientes || [];

  // WhatsApp e contatos
  const wa = String(site.whatsapp || "").replace(/\D/g, "");
  $$("[data-wa]").forEach(a => a.href = `https://wa.me/${wa}?text=${encodeURIComponent(WA_MSG)}`);
  $$("[data-f]").forEach(el => {
    const k = el.dataset.f, v = site[k] || "";
    if (k === "instagram") { el.href = v; return; }
    el.textContent = v;
    if (k === "tel") el.href = "tel:" + v.replace(/\D/g, "");
    if (k === "email") el.href = "mailto:" + v;
  });

  // Fundo do topo alternando
  const fundos = site.fundos?.length ? site.fundos : [""];
  $("#slides").innerHTML = fundos.map((f, i) => `<div class="slide${i ? "" : " on"}" style="--bg:url('${f}')"></div>`).join("");
  const slides = $$(".slide");
  let atual = 0;
  if (slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      slides[atual].classList.remove("on");
      atual = (atual + 1) % slides.length;
      slides[atual].classList.add("on");
    }, 6000);
  }

  // Faixas e listas
  $("#svc").innerHTML = rep(FAIXA_SERVICOS).map(s => `<span>${s}</span>`).join("");
  const n = PROJETOS.length ? Math.max(4, Math.ceil(12 / PROJETOS.length) * 2) : 0;
  $("#track").innerHTML = rep(PROJETOS, n).map(card).join("");
  $("#clientes").innerHTML = rep(CLIENTES, CLIENTES.length ? 4 : 0).map(c =>
    `<span class="cl"><img src="${c.logo || ""}" alt="${c.nome}"><b>${c.nome}</b></span>`).join("");
  $("#menu").innerHTML = PROJETOS.map(p => `<a href="#projeto-${p.id}">${p.titulo}<small>${p.cliente}, ${p.ano}</small></a>`).join("")
    + `<a class="all" href="#projetos">Ver todos os projetos</a>`;
  $("#svc-grid").innerHTML = SERVICOS.map(s => `<article><h3>${s.nome}</h3><p>${s.desc}</p></article>`).join("");
  $("#timeline").innerHTML = [...PROJETOS].sort((a, b) => a.ano - b.ano).map(p =>
    `<li><div class="y">${p.ano}</div><div><a href="#projeto-${p.id}">${p.titulo}</a>, ${p.cliente}</div></li>`).join("");

  const areas = ["Todos", ...new Set(PROJETOS.map(p => p.area).filter(Boolean))];
  $("#filters").innerHTML = areas.map((a, i) => `<button aria-pressed="${i === 0}" data-area="${a}">${a}</button>`).join("");
  const listar = (area = "Todos") => { $("#all").innerHTML = PROJETOS.filter(p => area === "Todos" || p.area === area).map(card).join(""); };
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
    listar(b.dataset.area);
  });
  listar();
  mostrarAba(); // refaz a rota agora que os dados chegaram
}

$("#ano").textContent = new Date().getFullYear();
mostrarAba();
main();
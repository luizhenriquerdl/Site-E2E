/* ====== DADOS: edite aqui ====== */
const WHATSAPP = "5511900000000"; // TROQUE: país + DDD + número, só dígitos (ex.: 5511987654321)
const WA_MSG = "Olá! Vim pelo site da E2E Engenharia e gostaria de solicitar um orçamento.";
const CONTATO = {
  tel: "(11) 0000-0000",
  email: "contato@seudominio.com.br",
  endereco: "Rua Exemplo, 123, Bairro, São Paulo, SP",
  instagram: "https://instagram.com/seu_perfil"
};
const SERVICOS = [
  { nome: "Montagens", desc: "Montagem de estruturas, tubulações e equipamentos industriais." },
  { nome: "Saneamento", desc: "Obras e intervenções em redes, adutoras e estações." },
  { nome: "Fabricação", desc: "Fabricação de estruturas metálicas e equipamentos sob medida." },
  { nome: "Elevação", desc: "Soluções para movimentação e içamento de cargas." }
];
const FAIXA_SERVICOS = [...SERVICOS.map(s => s.nome), "Estroncamento", "Estruturas metálicas", "Desvio de adutoras", "Caçambas e equipamentos"];
/* Coloque as fotos em img/ e ajuste "img". Logos em img/clientes/ (opcional). */
const PROJETOS = [
  { id: 1, titulo: "Estroncamento poço sala técnica", cliente: "Consórcio Galvão Serveng", data: "Agosto, 2014", ano: 2014, area: "Montagens",  img: "img/projeto-1.jpg" },
  { id: 2, titulo: "Estrutura metálica definitiva mezanino", cliente: "Estação Oscar Freire, Tiisa Comsa", data: "Julho, 2020", ano: 2020, area: "Fabricação", img: "img/projeto-2.jpg" },
  { id: 3, titulo: "Desvio Sabesp em adutora 700mm", cliente: "Acciona", data: "Fevereiro, 2022", ano: 2022, area: "Saneamento", img: "img/projeto-3.jpg" },
  { id: 4, titulo: "Caçamba com balancim para escavação", cliente: "Consórcio Metrô L2 Vila Formosa", data: "Março, 2024", ano: 2024, area: "Fabricação", img: "img/projeto-4.jpg" }
];
const CLIENTES = [
  { nome: "Galvão", logo: "img/clientes/galvao.png" },
  { nome: "Serveng", logo: "img/clientes/serveng.png" },
  { nome: "Tiisa Comsa", logo: "img/clientes/tiisa-comsa.png" },
  { nome: "Acciona", logo: "img/clientes/acciona.png" },
  { nome: "Sabesp", logo: "img/clientes/sabesp.png" },
  { nome: "Metrô SP", logo: "img/clientes/metro.png" }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rep = (arr, n = 4) => Array.from({ length: n }, () => arr).flat(); // repete a lista para o loop não ter vazio

/* ====== Imagens com substituto ====== */
const fig = p => `<span class="fig">${p.titulo}<img src="${p.img}" alt="${p.titulo}" loading="lazy"></span>`;
document.addEventListener("error", e => { if (e.target.matches?.("img")) e.target.remove(); }, true);
document.addEventListener("load", e => { if (e.target.matches?.(".cl img")) e.target.parentElement.classList.add("has"); }, true);

const card = p => `<button class="card" data-id="${p.id}">${fig(p)}
  <span class="t">${p.titulo}</span><span class="m">${p.cliente}</span><span class="m">${p.data}</span></button>`;

/* ====== Dados de contato e WhatsApp ====== */
$$("[data-wa]").forEach(a => a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`);
$$("[data-f]").forEach(el => {
  const k = el.dataset.f, v = CONTATO[k];
  if (k === "instagram") { el.href = v; return; }
  el.textContent = v;
  if (k === "tel") el.href = "tel:" + v.replace(/\D/g, "");
  if (k === "email") el.href = "mailto:" + v;
});

/* ====== Abas (navegação por #hash) ====== */
let aba = "inicio";
function cabecalho() { $("#top").classList.toggle("solid", scrollY > 40 || aba !== "inicio"); }
function mostrarAba() {
  const alvo = location.hash.slice(1);
  aba = $$("[data-tab]").some(s => s.id === alvo) ? alvo : "inicio";
  $$("[data-tab]").forEach(s => (s.hidden = s.id !== aba));
  $$(".nav a").forEach(a => {
    const on = a.getAttribute("href") === "#" + aba;
    a.classList.toggle("on", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  document.activeElement?.blur();
  scrollTo(0, 0);
  cabecalho();
}
addEventListener("hashchange", mostrarAba);
addEventListener("scroll", cabecalho, { passive: true });

/* ====== Fundo do topo alternando ====== */
const slides = $$(".slide");
let atual = 0;
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => {
    slides[atual].classList.remove("on");
    atual = (atual + 1) % slides.length;
    slides[atual].classList.add("on");
  }, 6000);
}

/* ====== Renderização ====== */
$("#svc").innerHTML = rep(FAIXA_SERVICOS).map(s => `<span>${s}</span>`).join("");
$("#track").innerHTML = rep(PROJETOS, Math.max(4, Math.ceil(12 / PROJETOS.length) * 2)).map(card).join("");
$("#clientes").innerHTML = rep(CLIENTES, 4).map(c => `<span class="cl"><img src="${c.logo}" alt="${c.nome}"><b>${c.nome}</b></span>`).join("");

// leque de projetos no menu
$("#menu").innerHTML = PROJETOS.map(p => `<button data-id="${p.id}">${p.titulo}<small>${p.cliente}, ${p.ano}</small></button>`).join("")
  + `<a href="#projetos">Ver todos os projetos</a>`;

$("#svc-grid").innerHTML = SERVICOS.map(s => `<article><h3>${s.nome}</h3><p>${s.desc}</p></article>`).join("");
$("#timeline").innerHTML = [...PROJETOS].sort((a, b) => a.ano - b.ano).map(p =>
  `<li><div class="y">${p.ano}</div><div><button data-id="${p.id}">${p.titulo}</button>, ${p.cliente}</div></li>`).join("");

const areas = ["Todos", ...new Set(PROJETOS.map(p => p.area))];
$("#filters").innerHTML = areas.map((a, i) => `<button aria-pressed="${i === 0}" data-area="${a}">${a}</button>`).join("");
const listar = (area = "Todos") => { $("#all").innerHTML = PROJETOS.filter(p => area === "Todos" || p.area === area).map(card).join(""); };
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
  listar(b.dataset.area);
});
listar();

/* ====== Janela de ampliação ====== */
const dlg = $("#dlg");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-id]"); if (!b) return;
  const p = PROJETOS.find(x => x.id == b.dataset.id);
  $("#dlg-body").innerHTML = `${fig(p)}<div class="dlg-txt"><h3>${p.titulo}</h3><p>${p.cliente}</p><p>${p.data}, ${p.area}</p></div>`;
  dlg.showModal();
});
$("#close").onclick = () => dlg.close();
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

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

$("#ano").textContent = new Date().getFullYear();
mostrarAba();
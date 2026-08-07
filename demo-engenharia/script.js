"use strict";

const botaoMenu = document.getElementById("botaoMenu");
const menuPrincipal = document.getElementById("menuPrincipal");
const sobreposicaoMenu = document.querySelector("[data-menu-sobreposicao]");
const linksMenu = document.querySelectorAll("#menuPrincipal a");
const linkPularConteudo = document.querySelector(".link-pular-conteudo");
const conteudoPrincipal = document.getElementById("conteudo-principal");
const cabecalho = document.querySelector(".cabecalho");
const preferenciaMovimentoReduzido = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const comportamentoRolagem = () =>
  preferenciaMovimentoReduzido.matches ? "auto" : "smooth";

if (linkPularConteudo && conteudoPrincipal) {
  linkPularConteudo.addEventListener("click", (evento) => {
    evento.preventDefault();

    conteudoPrincipal.focus({
      preventScroll: true
    });

    conteudoPrincipal.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "start"
    });
  });
}

const menuEstaAberto = () =>
  menuPrincipal?.classList.contains("ativo") ?? false;

function fecharMenu(devolverFoco = true) {
  if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) return;

  const estavaAberto = menuEstaAberto();

  botaoMenu.classList.remove("ativo");
  menuPrincipal.classList.remove("ativo");
  sobreposicaoMenu.classList.remove("ativo");
  document.body.classList.remove("menu-aberto");

  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");

  if (estavaAberto && devolverFoco) {
    botaoMenu.focus();
  }
}

function abrirMenu() {
  if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) return;

  botaoMenu.classList.add("ativo");
  menuPrincipal.classList.add("ativo");
  sobreposicaoMenu.classList.add("ativo");
  document.body.classList.add("menu-aberto");

  botaoMenu.setAttribute("aria-expanded", "true");
  botaoMenu.setAttribute("aria-label", "Fechar menu");

  requestAnimationFrame(() => {
    linksMenu[0]?.focus();
  });
}

if (botaoMenu && menuPrincipal && sobreposicaoMenu) {
  botaoMenu.addEventListener("click", () => {
    if (menuEstaAberto()) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  });

  linksMenu.forEach((link) => {
    link.addEventListener("click", () => fecharMenu());
  });

  sobreposicaoMenu.addEventListener("click", () => fecharMenu());

  document.addEventListener("pointerdown", (evento) => {
    if (!menuEstaAberto()) return;

    const alvo = evento.target;

    if (
      alvo instanceof Node &&
      alvo !== sobreposicaoMenu &&
      !menuPrincipal.contains(alvo) &&
      !botaoMenu.contains(alvo)
    ) {
      fecharMenu();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (!menuEstaAberto()) return;

    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharMenu();
      return;
    }

    if (evento.key !== "Tab") return;

    const itensFocaveis = [botaoMenu, ...linksMenu];
    const primeiroItem = itensFocaveis[0];
    const ultimoItem = itensFocaveis[itensFocaveis.length - 1];
    const focoAtual = document.activeElement;

    if (!itensFocaveis.includes(focoAtual)) {
      evento.preventDefault();
      (evento.shiftKey ? ultimoItem : linksMenu[0] ?? primeiroItem).focus();
      return;
    }

    if (evento.shiftKey && focoAtual === primeiroItem) {
      evento.preventDefault();
      ultimoItem.focus();
    } else if (!evento.shiftKey && focoAtual === ultimoItem) {
      evento.preventDefault();
      primeiroItem.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && menuEstaAberto()) {
      fecharMenu(false);
    }
  });
}

document
  .querySelectorAll('a[href^="#"]:not(.link-pular-conteudo)')
  .forEach((link) => {
    link.addEventListener("click", (evento) => {
      const destinoId = link.getAttribute("href");

      if (!destinoId || destinoId === "#") return;

      const destino = document.querySelector(destinoId);

      if (!destino) return;

      evento.preventDefault();

      const alturaCabecalho = cabecalho?.offsetHeight ?? 0;
      const posicao =
        destino.getBoundingClientRect().top +
        window.scrollY -
        alturaCabecalho -
        12;

      window.scrollTo({
        top: posicao,
        behavior: comportamentoRolagem()
      });
    });
  });

const botoesFiltro = Array.from(
  document.querySelectorAll("[data-filter]")
);
const projetos = Array.from(
  document.querySelectorAll(".cartao-projeto[data-category]")
);
const resultadoFiltro = document.getElementById("resultadoFiltro");

function aplicarFiltro(botaoSelecionado) {
  const categoria = botaoSelecionado.dataset.filter;

  botoesFiltro.forEach((botao) => {
    botao.setAttribute(
      "aria-pressed",
      botao === botaoSelecionado ? "true" : "false"
    );
  });

  let quantidadeVisivel = 0;

  projetos.forEach((projeto) => {
    const projetoVisivel =
      categoria === "todos" || projeto.dataset.category === categoria;

    projeto.hidden = !projetoVisivel;

    if (projetoVisivel) {
      quantidadeVisivel += 1;
    }
  });

  if (resultadoFiltro) {
    resultadoFiltro.textContent =
      quantidadeVisivel === 1
        ? "Exibindo 1 projeto conceitual."
        : `Exibindo ${quantidadeVisivel} projetos conceituais.`;
  }
}

botoesFiltro.forEach((botao, indice) => {
  botao.addEventListener("click", () => aplicarFiltro(botao));

  botao.addEventListener("keydown", (evento) => {
    const teclasAceitas = ["ArrowLeft", "ArrowRight", "Home", "End"];

    if (!teclasAceitas.includes(evento.key)) return;

    evento.preventDefault();

    let proximoIndice = indice;

    if (evento.key === "ArrowLeft") {
      proximoIndice = (indice - 1 + botoesFiltro.length) % botoesFiltro.length;
    } else if (evento.key === "ArrowRight") {
      proximoIndice = (indice + 1) % botoesFiltro.length;
    } else if (evento.key === "Home") {
      proximoIndice = 0;
    } else if (evento.key === "End") {
      proximoIndice = botoesFiltro.length - 1;
    }

    botoesFiltro[proximoIndice].focus();
  });
});

const formularioOrcamento = document.getElementById("formularioOrcamento");
const mensagemFormulario = document.getElementById("mensagemFormulario");

if (formularioOrcamento && mensagemFormulario) {
  formularioOrcamento.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formularioOrcamento.checkValidity()) {
      formularioOrcamento.reportValidity();
      return;
    }

    mensagemFormulario.textContent =
      "Simulação concluída. Nenhuma informação foi enviada ou armazenada.";
    mensagemFormulario.classList.add("visivel");

    formularioOrcamento.reset();

    mensagemFormulario.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "nearest"
    });
  });
}

const anoAtual = document.getElementById("anoAtual");

if (anoAtual) {
  anoAtual.textContent = new Date().getFullYear();
}

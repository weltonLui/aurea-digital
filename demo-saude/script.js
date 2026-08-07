"use strict";

const botaoMenu = document.getElementById("botaoMenu");
const menuPrincipal = document.getElementById("menuPrincipal");
const sobreposicaoMenu = document.querySelector(
  "[data-menu-sobreposicao]"
);
const linksMenu = document.querySelectorAll("#menuPrincipal a");
const linkPularConteudo = document.querySelector(
  ".link-pular-conteudo"
);
const conteudoPrincipal = document.querySelector(
  "#conteudo-principal"
);
const preferenciaMovimentoReduzido = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

if (linkPularConteudo && conteudoPrincipal) {
  linkPularConteudo.addEventListener("click", (evento) => {
    evento.preventDefault();

    conteudoPrincipal.focus({
      preventScroll: true
    });

    conteudoPrincipal.scrollIntoView({
      behavior: preferenciaMovimentoReduzido.matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  });
}

function menuEstaAberto() {
  return menuPrincipal?.classList.contains("ativo") ?? false;
}

function fecharMenu(devolverFoco = true) {
  if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) {
    return;
  }

  const estavaAberto = menuEstaAberto();

  botaoMenu.classList.remove("ativo");
  menuPrincipal.classList.remove("ativo");
  sobreposicaoMenu.classList.remove("ativo");
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("menu-aberto");

  if (estavaAberto && devolverFoco) {
    botaoMenu.focus();
  }
}

function abrirMenu() {
  if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) {
    return;
  }

  botaoMenu.classList.add("ativo");
  menuPrincipal.classList.add("ativo");
  sobreposicaoMenu.classList.add("ativo");
  botaoMenu.setAttribute("aria-expanded", "true");
  botaoMenu.setAttribute("aria-label", "Fechar menu");
  document.body.classList.add("menu-aberto");

  requestAnimationFrame(() => {
    linksMenu[0]?.focus();
  });
}

function alternarMenu() {
  if (menuEstaAberto()) {
    fecharMenu();
  } else {
    abrirMenu();
  }
}

if (botaoMenu && menuPrincipal && sobreposicaoMenu) {
  botaoMenu.addEventListener("click", alternarMenu);

  linksMenu.forEach((link) => {
    link.addEventListener("click", () => fecharMenu());
  });

  sobreposicaoMenu.addEventListener("click", () => fecharMenu());

  document.addEventListener("pointerdown", (evento) => {
    if (!menuEstaAberto()) return;

    const alvo = evento.target;

    if (
      alvo instanceof Node &&
      !menuPrincipal.contains(alvo) &&
      !botaoMenu.contains(alvo)
    ) {
      fecharMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && menuEstaAberto()) {
      fecharMenu(false);
    }
  });
}

/* Ano automático do rodapé */

const anoAtual = document.getElementById("anoAtual");

if (anoAtual) {
  anoAtual.textContent = new Date().getFullYear();
}

/* Formulário demonstrativo */

const formularioAgendamento = document.getElementById(
  "formularioAgendamento"
);

const mensagemFormulario = document.getElementById(
  "mensagemFormulario"
);

if (formularioAgendamento && mensagemFormulario) {
  formularioAgendamento.addEventListener(
    "submit",
    (evento) => {
      evento.preventDefault();

      if (!formularioAgendamento.checkValidity()) {
        formularioAgendamento.reportValidity();
        return;
      }

      mensagemFormulario.textContent =
        "Simulação concluída. Nenhuma informação foi enviada ou armazenada.";

      mensagemFormulario.classList.add("visivel");

      formularioAgendamento.reset();

      mensagemFormulario.scrollIntoView({
        behavior: preferenciaMovimentoReduzido.matches ? "auto" : "smooth",
        block: "nearest"
      });
    }
  );
}

/* Teclado do menu móvel */

document.addEventListener("keydown", (evento) => {
  if (!menuEstaAberto()) return;

  if (evento.key === "Escape") {
    evento.preventDefault();
    fecharMenu();
    return;
  }

  if (evento.key !== "Tab" || !linksMenu.length) return;

  const primeiroItem = linksMenu[0];
  const ultimoItem = linksMenu[linksMenu.length - 1];
  const focoAtual = document.activeElement;

  if (evento.shiftKey && focoAtual === primeiroItem) {
    evento.preventDefault();
    ultimoItem.focus();
  } else if (!evento.shiftKey && focoAtual === ultimoItem) {
    evento.preventDefault();
    primeiroItem.focus();
  } else if (!menuPrincipal?.contains(focoAtual)) {
    evento.preventDefault();
    primeiroItem.focus();
  }
});
"use strict";

const botaoMenu = document.querySelector(".botao-menu");
const menu = document.querySelector("#menuPrincipal");
const sobreposicaoMenu = document.querySelector("[data-menu-sobreposicao]");
const linksMenu = document.querySelectorAll("#menuPrincipal a");
const cabecalho = document.querySelector(".cabecalho");
const linkPularConteudo = document.querySelector(".link-pular-conteudo");
const conteudoPrincipal = document.querySelector("#conteudo-principal");
const preferenciaMovimentoReduzido = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const breakpointMenu = window.matchMedia("(max-width: 860px)");

const comportamentoRolagem = () =>
  preferenciaMovimentoReduzido.matches ? "auto" : "smooth";

if (linkPularConteudo && conteudoPrincipal) {
  linkPularConteudo.addEventListener("click", (evento) => {
    evento.preventDefault();
    conteudoPrincipal.focus({ preventScroll: true });
    conteudoPrincipal.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "start",
    });
  });
}

const atualizarPosicaoMenu = () => {
  if (!cabecalho) return;
  document.documentElement.style.setProperty(
    "--menu-topo",
    String(Math.round(cabecalho.getBoundingClientRect().bottom)) + "px"
  );
};

const itensFocaveisMenu = () => {
  if (!botaoMenu || !menu) return [];
  return [
    botaoMenu,
    ...menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ),
  ].filter((elemento) => !elemento.hasAttribute("hidden"));
};

const menuEstaAberto = () =>
  Boolean(menu && botaoMenu?.getAttribute("aria-expanded") === "true");

const fecharMenu = ({ restaurarFoco = true } = {}) => {
  if (!botaoMenu || !menu || !sobreposicaoMenu) return;
  const estavaAberto = menuEstaAberto();

  menu.classList.remove("ativo");
  sobreposicaoMenu.classList.remove("ativo");
  sobreposicaoMenu.setAttribute("aria-hidden", "true");
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("menu-aberto");

  if (estavaAberto && restaurarFoco) {
    botaoMenu.focus();
  }
};

const abrirMenu = () => {
  if (!botaoMenu || !menu || !sobreposicaoMenu || !breakpointMenu.matches) {
    return;
  }

  atualizarPosicaoMenu();
  menu.classList.add("ativo");
  sobreposicaoMenu.classList.add("ativo");
  sobreposicaoMenu.setAttribute("aria-hidden", "false");
  botaoMenu.setAttribute("aria-expanded", "true");
  botaoMenu.setAttribute("aria-label", "Fechar menu");
  document.body.classList.add("menu-aberto");
  linksMenu[0]?.focus();
};

if (botaoMenu && menu && sobreposicaoMenu) {
  botaoMenu.addEventListener("click", () => {
    if (menuEstaAberto()) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  });

  linksMenu.forEach((link) => {
    link.addEventListener("click", () => fecharMenu({ restaurarFoco: false }));
  });

  sobreposicaoMenu.addEventListener("click", () => fecharMenu());

  document.addEventListener("pointerdown", (evento) => {
    if (
      menuEstaAberto() &&
      !menu.contains(evento.target) &&
      !botaoMenu.contains(evento.target)
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

    const itens = itensFocaveisMenu();
    if (!itens.length) return;

    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];

    if (!itens.includes(document.activeElement)) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primeiro).focus();
      return;
    }

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  });

  window.addEventListener("resize", () => {
    atualizarPosicaoMenu();
    if (!breakpointMenu.matches && menuEstaAberto()) {
      fecharMenu({ restaurarFoco: false });
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
      destino.scrollIntoView({
        behavior: comportamentoRolagem(),
        block: "start",
      });
      history.replaceState(null, "", destinoId);
    });
  });

const campoBusca = document.querySelector("#buscaCatalogo");
const botoesFiltro = Array.from(document.querySelectorAll("[data-filter]"));
const itensCatalogo = Array.from(
  document.querySelectorAll(".item-catalogo[data-category]")
);
const resultadoCatalogo = document.querySelector("#resultadoCatalogo");
const semResultados = document.querySelector("#semResultados");
let filtroAtual = "todos";

const normalizarTexto = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const atualizarCatalogo = () => {
  const termo = normalizarTexto(campoBusca?.value ?? "");
  let quantidadeVisivel = 0;

  itensCatalogo.forEach((item) => {
    const correspondeFiltro =
      filtroAtual === "todos" || item.dataset.category === filtroAtual;
    const textoItem = normalizarTexto(
      (item.dataset.search ?? "") + " " + (item.textContent ?? "")
    );
    const correspondeBusca = !termo || textoItem.includes(termo);
    const deveExibir = correspondeFiltro && correspondeBusca;

    item.hidden = !deveExibir;
    if (deveExibir) quantidadeVisivel += 1;
  });

  if (resultadoCatalogo) {
    resultadoCatalogo.textContent =
      quantidadeVisivel === 1
        ? "Exibindo 1 item demonstrativo."
        : "Exibindo " + quantidadeVisivel + " itens demonstrativos.";
  }

  if (semResultados) {
    semResultados.hidden = quantidadeVisivel !== 0;
  }
};

const aplicarFiltro = (botao) => {
  filtroAtual = botao.dataset.filter ?? "todos";
  botoesFiltro.forEach((item) => {
    item.setAttribute("aria-pressed", String(item === botao));
  });
  atualizarCatalogo();
};

botoesFiltro.forEach((botao, indice) => {
  botao.addEventListener("click", () => aplicarFiltro(botao));
  botao.addEventListener("keydown", (evento) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(evento.key)) {
      return;
    }

    evento.preventDefault();
    let proximoIndice = indice;

    if (evento.key === "ArrowRight") {
      proximoIndice = (indice + 1) % botoesFiltro.length;
    } else if (evento.key === "ArrowLeft") {
      proximoIndice =
        (indice - 1 + botoesFiltro.length) % botoesFiltro.length;
    } else if (evento.key === "Home") {
      proximoIndice = 0;
    } else if (evento.key === "End") {
      proximoIndice = botoesFiltro.length - 1;
    }

    botoesFiltro[proximoIndice].focus();
    aplicarFiltro(botoesFiltro[proximoIndice]);
  });
});

campoBusca?.addEventListener("input", atualizarCatalogo);

const itemSelecionado = document.querySelector("#itemSelecionado");
const categoriaSelecionada = document.querySelector("#categoriaSelecionada");
const interesseAtendimento = document.querySelector("#interesseAtendimento");
const mensagemAtendimento = document.querySelector("#mensagemAtendimento");
const formularioAtendimento = document.querySelector("#formularioAtendimento");
const botaoLimpar = document.querySelector("#limparSimulacao");
const etapasAtendimento = document.querySelectorAll("[data-step]");
const canais = Array.from(
  document.querySelectorAll("#canalPainel, #canalPresencial")
);
let selecaoAtual = null;

const definirEtapa = (numero) => {
  etapasAtendimento.forEach((etapa) => {
    etapa.classList.toggle(
      "etapa-ativa",
      Number(etapa.dataset.step) === numero
    );
  });
};

document.querySelectorAll("[data-select-item]").forEach((botao) => {
  botao.addEventListener("click", () => {
    selecaoAtual = {
      item: botao.dataset.selectItem ?? "Item demonstrativo",
      categoria: botao.dataset.selectCategory ?? "Categoria demonstrativa",
    };

    if (itemSelecionado) itemSelecionado.textContent = selecaoAtual.item;
    if (categoriaSelecionada) {
      categoriaSelecionada.textContent =
        selecaoAtual.categoria + " • escolha mantida somente nesta página";
    }

    if (interesseAtendimento) {
      const cartao = botao.closest("[data-category]");
      const valorCategoria = cartao?.dataset.category ?? "";
      if (
        Array.from(interesseAtendimento.options).some(
          (opcao) => opcao.value === valorCategoria
        )
      ) {
        interesseAtendimento.value = valorCategoria;
      }
    }

    if (mensagemAtendimento) {
      mensagemAtendimento.textContent =
        "Item adicionado à simulação. Nenhuma informação foi enviada.";
    }

    definirEtapa(2);
    document.querySelector("#atendimento")?.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "start",
    });
  });
});

canais.forEach((canal) => {
  canal.addEventListener("change", () => {
    if (!canal.checked) return;
    canais.forEach((outroCanal) => {
      if (outroCanal !== canal) outroCanal.checked = false;
    });
  });
});

const limparAtendimento = () => {
  selecaoAtual = null;
  formularioAtendimento?.reset();
  if (itemSelecionado) itemSelecionado.textContent = "Nenhum item selecionado";
  if (categoriaSelecionada) {
    categoriaSelecionada.textContent =
      "Escolha um exemplo no catálogo ou continue com as opções abaixo.";
  }
  if (mensagemAtendimento) {
    mensagemAtendimento.textContent =
      "Simulação limpa. Nenhuma informação foi armazenada.";
  }
  definirEtapa(1);
};

botaoLimpar?.addEventListener("click", limparAtendimento);

formularioAtendimento?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formularioAtendimento.checkValidity()) {
    formularioAtendimento.reportValidity();
    return;
  }

  const canalSelecionado = canais.find((canal) => canal.checked);
  if (!canalSelecionado) {
    if (mensagemAtendimento) {
      mensagemAtendimento.textContent =
        "Selecione uma preferência conceitual de canal para continuar.";
    }
    canais[0]?.focus();
    return;
  }

  definirEtapa(4);
  if (mensagemAtendimento) {
    mensagemAtendimento.textContent =
      "Simulação concluída. Nenhuma informação foi enviada ou armazenada.";
    mensagemAtendimento.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "nearest",
    });
  }
});

const simuladorDocumento = document.querySelector(".simulador-documento");
const botaoSimularDocumento = document.querySelector("#simularDocumento");
const botaoConcluirDocumento = document.querySelector("#concluirDocumento");
const nomeDocumento = document.querySelector("#nomeDocumento");
const detalheDocumento = document.querySelector("#detalheDocumento");
const mensagemDocumento = document.querySelector("#mensagemDocumento");
let documentoSimulado = false;

botaoSimularDocumento?.addEventListener("click", () => {
  documentoSimulado = true;
  simuladorDocumento?.classList.add("documento-selecionado");
  if (nomeDocumento) nomeDocumento.textContent = "documento-demonstrativo.pdf";
  if (detalheDocumento) {
    detalheDocumento.textContent =
      "Arquivo fictício • Nenhum conteúdo foi acessado.";
  }
  if (botaoConcluirDocumento) botaoConcluirDocumento.disabled = false;
  if (mensagemDocumento) {
    mensagemDocumento.textContent =
      "Documento demonstrativo selecionado. Nenhum arquivo real foi aberto.";
  }
});

botaoConcluirDocumento?.addEventListener("click", () => {
  if (!documentoSimulado) return;
  if (mensagemDocumento) {
    mensagemDocumento.textContent =
      "Simulação concluída. Nenhum arquivo ou informação foi enviado, analisado ou armazenado.";
    mensagemDocumento.scrollIntoView({
      behavior: comportamentoRolagem(),
      block: "nearest",
    });
  }
});

document.querySelectorAll(".lista-faq details").forEach((itemAtual) => {
  itemAtual.addEventListener("toggle", () => {
    if (!itemAtual.open) return;
    document.querySelectorAll(".lista-faq details").forEach((outroItem) => {
      if (outroItem !== itemAtual) outroItem.open = false;
    });
  });
});

const elementoAno = document.querySelector("[data-ano]");
if (elementoAno) elementoAno.textContent = String(new Date().getFullYear());

atualizarPosicaoMenu();
atualizarCatalogo();
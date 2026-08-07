/* ==================================================
   ÁUREA DIGITAL — SCRIPT PRINCIPAL
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const cabecalho = document.querySelector(".cabecalho");
  const botaoMenu = document.querySelector("#botaoMenu");
  const menuPrincipal = document.querySelector("#menuPrincipal");
  const sobreposicaoMenu = document.querySelector(
    "[data-menu-sobreposicao]"
  );
  const linksMenu = document.querySelectorAll('.menu a[href^="#"]');
  const todosLinksMenu = document.querySelectorAll("#menuPrincipal a");
  const linkPularConteudo = document.querySelector(
    ".link-pular-conteudo"
  );
  const conteudoPrincipal = document.querySelector(
    "#conteudo-principal"
  );
  const secoes = document.querySelectorAll("main section[id]");
  const anoRodape = document.querySelector("[data-ano]");
  const elementosAnimados = document.querySelectorAll(
    ".hero-texto, .hero-visual, .introducao > *, " +
    ".cabecalho-secao > *, .cartao-servico, .etapa, " +
    ".sobre-marca, .sobre-texto, .cta-conteudo > *"
  );

  const prefereMenosMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (linkPularConteudo && conteudoPrincipal) {
    linkPularConteudo.addEventListener("click", (evento) => {
      evento.preventDefault();

      conteudoPrincipal.focus({
        preventScroll: true
      });

      conteudoPrincipal.scrollIntoView({
        behavior: prefereMenosMovimento ? "auto" : "smooth",
        block: "start"
      });
    });
  }

  /* ==================================================
     MENU MÓVEL
  ================================================== */

  const menuEstaAberto = () =>
    menuPrincipal?.classList.contains("ativo") ?? false;

  const fecharMenu = (devolverFoco = true) => {
    if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) return;

    const estavaAberto = menuEstaAberto();

    botaoMenu.classList.remove("ativo");
    menuPrincipal.classList.remove("ativo");
    sobreposicaoMenu.classList.remove("ativo");
    body.classList.remove("menu-aberto");

    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");

    if (estavaAberto && devolverFoco) {
      botaoMenu.focus();
    }
  };

  const abrirMenu = () => {
    if (!botaoMenu || !menuPrincipal || !sobreposicaoMenu) return;

    botaoMenu.classList.add("ativo");
    menuPrincipal.classList.add("ativo");
    sobreposicaoMenu.classList.add("ativo");
    body.classList.add("menu-aberto");

    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.setAttribute("aria-label", "Fechar menu");

    requestAnimationFrame(() => {
      todosLinksMenu[0]?.focus();
    });
  };

  if (botaoMenu && menuPrincipal && sobreposicaoMenu) {
    botaoMenu.addEventListener("click", () => {
      if (menuEstaAberto()) {
        fecharMenu();
      } else {
        abrirMenu();
      }
    });

    todosLinksMenu.forEach((link) => {
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

    document.addEventListener("keydown", (evento) => {
      if (!menuEstaAberto()) return;

      if (evento.key === "Escape") {
        fecharMenu();
        return;
      }

      if (evento.key !== "Tab" || !botaoMenu) return;

      const itensFocaveisMenu = [botaoMenu, ...todosLinksMenu];
      const primeiroItem = itensFocaveisMenu[0];
      const ultimoItem = itensFocaveisMenu[itensFocaveisMenu.length - 1];
      const focoAtual = document.activeElement;

      if (!itensFocaveisMenu.includes(focoAtual)) {
        evento.preventDefault();

        if (evento.shiftKey) {
          ultimoItem.focus();
        } else {
          (todosLinksMenu[0] ?? primeiroItem).focus();
        }

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
      if (window.innerWidth > 980 && menuEstaAberto()) {
        fecharMenu(false);
      }
    });
  }

  /* ==================================================
     ANO AUTOMÁTICO
  ================================================== */

  if (anoRodape) {
    anoRodape.textContent = new Date().getFullYear();
  }

  /* ==================================================
     CABEÇALHO AO ROLAR
  ================================================== */

  const atualizarCabecalho = () => {
    if (!cabecalho) return;

    cabecalho.classList.toggle(
      "cabecalho-rolagem",
      window.scrollY > 24
    );
  };

  atualizarCabecalho();

  window.addEventListener("scroll", atualizarCabecalho, {
    passive: true
  });

  /* ==================================================
     ROLAGEM SUAVE DOS LINKS INTERNOS
  ================================================== */

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
        behavior: prefereMenosMovimento ? "auto" : "smooth"
      });
    });
  });

  /* ==================================================
     ANIMAÇÕES DE ENTRADA
  ================================================== */

  elementosAnimados.forEach((elemento, indice) => {
    elemento.classList.add("revelar");

    const atraso = Math.min((indice % 4) * 90, 270);
    elemento.style.setProperty("--atraso", `${atraso}ms`);
  });

  if (prefereMenosMovimento || !("IntersectionObserver" in window)) {
    elementosAnimados.forEach((elemento) => {
      elemento.classList.add("visivel");
    });
  } else {
    const observadorAnimacao = new IntersectionObserver(
      (entradas, observador) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;

          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    elementosAnimados.forEach((elemento) => {
      observadorAnimacao.observe(elemento);
    });
  }

  /* ==================================================
     MENU ATIVO CONFORME A SEÇÃO
  ================================================== */

  if (secoes.length && linksMenu.length && "IntersectionObserver" in window) {
    const mapaLinks = new Map();

    linksMenu.forEach((link) => {
      const id = link.getAttribute("href");

      if (id) {
        mapaLinks.set(id.replace("#", ""), link);
      }
    });

    const observadorSecoes = new IntersectionObserver(
      (entradas) => {
        const entradasVisiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        const secaoAtual = entradasVisiveis[0];

        if (!secaoAtual) return;

        linksMenu.forEach((link) => {
          link.classList.remove("ativo");
        });

        const linkAtual = mapaLinks.get(secaoAtual.target.id);

        if (linkAtual) {
          linkAtual.classList.add("ativo");
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-25% 0px -55% 0px"
      }
    );

    secoes.forEach((secao) => {
      observadorSecoes.observe(secao);
    });
  }

  /* ==================================================
     EFEITO DISCRETO NO HERO
  ================================================== */

  const heroVisual = document.querySelector(".hero-visual");
  const painelPrincipal = document.querySelector(".painel-principal");

  if (
    heroVisual &&
    painelPrincipal &&
    !prefereMenosMovimento &&
    window.matchMedia("(min-width: 981px)").matches
  ) {
    heroVisual.addEventListener("pointermove", (evento) => {
      const area = heroVisual.getBoundingClientRect();

      const eixoX =
        (evento.clientX - area.left) / area.width - 0.5;

      const eixoY =
        (evento.clientY - area.top) / area.height - 0.5;

      painelPrincipal.style.transform = `
        perspective(1000px)
        rotateY(${eixoX * 8 - 5}deg)
        rotateX(${eixoY * -6 + 2}deg)
        translateY(-3px)
      `;
    });

    heroVisual.addEventListener("pointerleave", () => {
      painelPrincipal.style.transform =
        "perspective(1000px) rotateY(-5deg) rotateX(2deg)";
    });
  }

});

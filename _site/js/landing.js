// SIGA build v12
document.addEventListener('DOMContentLoaded', () => {

  // Menú de cuenta (avatar arriba a la derecha): se abre/cierra al hacer
  // clic, y se cierra solo si el usuario hace clic afuera o presiona Esc.
  const avatarBtn = document.getElementById('avatarBtn');
  const avatarMenu = document.getElementById('avatarMenu');

  if (avatarBtn && avatarMenu) {
    function cerrarMenuCuenta() {
      avatarMenu.classList.remove('abierto');
      avatarBtn.setAttribute('aria-expanded', 'false');
    }

    function alternarMenuCuenta() {
      const abierto = avatarMenu.classList.toggle('abierto');
      avatarBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    }

    avatarBtn.addEventListener('click', (evento) => {
      evento.stopPropagation();
      alternarMenuCuenta();
    });

    document.addEventListener('click', (evento) => {
      if (!avatarMenu.contains(evento.target) && evento.target !== avatarBtn) {
        cerrarMenuCuenta();
      }
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') cerrarMenuCuenta();
    });
  }

  // Indicador deslizante del nav: una línea delgada arriba de los botones
  // se desliza hasta el que se está pasando el mouse (o con foco de
  // teclado). Los botones ya no cambian de color; la línea es la única
  // señal de selección.
  const navLinksCont = document.querySelector('.nav-links, .app-nav-links');
  const navIndicador = document.getElementById('navIndicador');
  const navBotones = navLinksCont
    ? Array.from(navLinksCont.querySelectorAll('a:not(.btn-registrarse)'))
    : [];

  if (navLinksCont && navIndicador && navBotones.length) {
    function moverIndicador(el) {
      const contRect = navLinksCont.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      navIndicador.style.left = `${elRect.left - contRect.left}px`;
      navIndicador.style.width = `${elRect.width}px`;
      navIndicador.style.opacity = '1';
    }

    // En vez de esconderse del todo, cuando el mouse/foco se va la línea
    // "descansa" sobre la opción activa (la página en la que estás) — así
    // queda la misma sensación de selección permanente, no solo al pasar
    // el mouse. Si no hay ninguna .activo (como en el nav del hero), se
    // esconde como antes.
    function descansarIndicador() {
      const activo = navLinksCont.querySelector('a.activo');
      if (activo) {
        moverIndicador(activo);
      } else {
        navIndicador.style.opacity = '0';
      }
    }

    navBotones.forEach((boton) => {
      boton.addEventListener('mouseenter', () => moverIndicador(boton));
      boton.addEventListener('focus', () => moverIndicador(boton));
    });

    navLinksCont.addEventListener('mouseleave', descansarIndicador);

    navLinksCont.addEventListener('focusout', (evento) => {
      if (!navLinksCont.contains(evento.relatedTarget)) {
        descansarIndicador();
      }
    });

    // Posición inicial al cargar la página.
    descansarIndicador();
  }

  // Lema del hero ("Conecta. Organiza. Avanza."): cae palabra por palabra
  // al cargar, y se repite cada 5s — pero solo mientras el hero sigue
  // en pantalla, para no animar algo que el usuario ya no está viendo.
  // (Antes eran 13s: si alguien hacía clic en el menú para irse a otra
  // sección casi de inmediato, no le daba tiempo de verlo ni una vez.)
  const palabrasLema = Array.from(document.querySelectorAll('.lema-palabra'));
  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (palabrasLema.length && !prefiereMenosMovimiento) {
    let heroVisible = true;
    const heroEl = document.getElementById('inicio');

    if (heroEl) {
      const observadorHero = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => { heroVisible = entrada.isIntersecting; });
      }, { threshold: 0.4 });
      observadorHero.observe(heroEl);
    }

    function reproducirLema() {
      palabrasLema.forEach((palabra) => palabra.classList.remove('animar'));
      // Forzar reflow para poder reiniciar la animación desde cero.
      void document.body.offsetWidth;
      palabrasLema.forEach((palabra) => palabra.classList.add('animar'));
    }

    reproducirLema();
    setInterval(() => {
      if (heroVisible) reproducirLema();
    }, 5000);
  }

  // Títulos en píldora ("INFO", "MÓDULOS"): entrada con rebote cada vez
  // que vuelven a aparecer en pantalla (no solo la primera vez) — se
  // quita la clase .visible al salir de vista, así el rebote se repite
  // cada vez que el usuario vuelve a pasar por esa sección.
  const titulosPildora = document.querySelectorAll('.titulo-pildora');
  if (titulosPildora.length) {
    const observadorTitulos = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        entrada.target.classList.toggle('visible', entrada.isIntersecting);
      });
    }, { threshold: 0.15 });
    titulosPildora.forEach((titulo) => observadorTitulos.observe(titulo));
  }

  // Botón "volver arriba": aparece apenas el usuario se aleja un poco del
  // tope de la página. Antes el umbral era 60% de la altura de pantalla —
  // en páginas cortas (materiales, opiniones) casi nunca se llegaba a
  // scrollear eso. Se usa lo que sea más chico entre 300px y ese 60%: en
  // el hero grande de la landing sigue esperando un poco, y en las
  // páginas cortas del dashboard aparece con cualquier scroll razonable.
  const volverArriba = document.getElementById('volverArriba');

  if (volverArriba) {
    window.addEventListener('scroll', () => {
      const umbral = Math.min(window.innerHeight * 0.6, 300);
      if (window.scrollY > umbral) {
        volverArriba.classList.add('visible');
      } else {
        volverArriba.classList.remove('visible');
      }
    });
  }

  // Filas de "Info": aparecen una por una (con un pequeño delay entre
  // cada una) cuando la tarjeta entra en pantalla.
  const filasInfo = document.querySelectorAll('.info-fila');
  if (filasInfo.length) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });

    filasInfo.forEach((fila, i) => {
      fila.style.transitionDelay = `${i * 0.12}s`;
      observador.observe(fila);
    });
  }

  // Módulos: cada fila se revela al entrar en pantalla; se marca como
  // "activa" la última fila cuyo borde superior ya pasó el centro de la
  // ventana (así, aunque la última fila nunca llegue a quedar perfectamente
  // centrada porque no hay más página debajo, igual se activa apenas
  // aparece — antes se exigía el centro exacto y por eso se quedaba
  // atascada en Opiniones). El pulso de la línea sube hasta su nodo.
  const filasModulos = Array.from(document.querySelectorAll('.mod-fila'));
  const pulsoModulos = document.getElementById('pulsoModulos');
  const lineaModulos = document.querySelector('.linea-modulos');

  if (filasModulos.length) {
    const observadorReveal = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) entrada.target.classList.add('visible');
      });
    }, { threshold: 0.25 });
    filasModulos.forEach((fila) => observadorReveal.observe(fila));

    function actualizarModuloActivo() {
      const centro = window.innerHeight / 2;
      let filaActiva = filasModulos[0];

      const enElFinal = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);

      if (enElFinal) {
        filaActiva = filasModulos[filasModulos.length - 1];
      } else {
        filasModulos.forEach((fila) => {
          const top = fila.getBoundingClientRect().top;
          if (top <= centro) filaActiva = fila;
        });
      }

      filasModulos.forEach((fila) => fila.classList.toggle('activo', fila === filaActiva));

      if (filaActiva && lineaModulos && pulsoModulos) {
        const rLinea = lineaModulos.getBoundingClientRect();
        const nodo = filaActiva.querySelector('.mod-nodo');
        const rNodo = nodo.getBoundingClientRect();
        const alturaPulso = (rNodo.top + rNodo.height / 2) - rLinea.top;
        pulsoModulos.style.height = `${Math.max(alturaPulso, 0)}px`;
      }
    }

    // Solo se calcula mientras la sección de Módulos está a la vista.
    let seccionModulosVisible = false;
    const seccionModulosEl = document.getElementById('modulos');

    if (seccionModulosEl) {
      const observadorSeccion = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          seccionModulosVisible = entrada.isIntersecting;
          if (seccionModulosVisible) {
            actualizarModuloActivo();
          } else {
            filasModulos.forEach((fila) => fila.classList.remove('activo'));
            if (pulsoModulos) pulsoModulos.style.height = '0px';
          }
        });
      }, { threshold: 0.05 });
      observadorSeccion.observe(seccionModulosEl);
    }

    let cuadroPendienteModulos = false;
    window.addEventListener('scroll', () => {
      if (!seccionModulosVisible || cuadroPendienteModulos) return;
      cuadroPendienteModulos = true;
      requestAnimationFrame(() => {
        cuadroPendienteModulos = false;
        actualizarModuloActivo();
      });
    });

    window.addEventListener('resize', () => {
      if (seccionModulosVisible) actualizarModuloActivo();
    });
  }

});
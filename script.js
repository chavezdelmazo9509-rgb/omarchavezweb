/* =========================================================
   ETAPA 3 · Tarjetas que se inclinan con el mouse
   ========================================================= */

// 1. Buscamos todas las tarjetas de la página
const tarjetas = document.querySelectorAll('.tarjeta');

// 2. Solo activamos el efecto si hay mouse y si la persona no pidió "reducir movimiento"
const hayMouse = window.matchMedia('(hover: hover)').matches;
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hayMouse && !sinMovimiento) {
  tarjetas.forEach(function (tarjeta) {

    // 3. Cuando el mouse se mueve encima de la tarjeta...
    tarjeta.addEventListener('mousemove', function (e) {
      const caja = tarjeta.getBoundingClientRect();
      const x = (e.clientX - caja.left) / caja.width;   // 0 = izquierda, 1 = derecha
      const y = (e.clientY - caja.top) / caja.height;   // 0 = arriba,    1 = abajo

      const giroY = (x - 0.5) * 16;   // máximo 8 grados a cada lado
      const giroX = (0.5 - y) * 16;

      tarjeta.style.transform =
        'perspective(1000px) rotateX(' + giroX + 'deg) rotateY(' + giroY + 'deg) scale(1.03)';

      // mueve el brillo dorado a donde está el mouse
      tarjeta.style.setProperty('--x', x * 100 + '%');
      tarjeta.style.setProperty('--y', y * 100 + '%');
    });

    // 4. Cuando el mouse sale, la tarjeta vuelve a su lugar
    tarjeta.addEventListener('mouseleave', function () {
      tarjeta.style.transform = '';
    });
  });
}


/* =========================================================
   ETAPA 3.5 · Chispas de lava que suben por el fondo
   ========================================================= */

const lienzo = document.getElementById('chispas');

if (lienzo) {   // las chispas siempre se ven (en modo suave van más lentas y son menos)
  const pincel = lienzo.getContext('2d');
  const colores = ['226, 52, 43', '226, 178, 92', '255, 120, 60'];  // rojo, dorado, naranja
  let chispas = [];

  // 1. El lienzo siempre del tamaño de la pantalla
  function ajustarTamano() {
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
  }

  // 2. Crea una chispa con posición, tamaño y velocidad al azar
  function nuevaChispa(desdeAbajo) {
    return {
      x: Math.random() * lienzo.width,
      y: desdeAbajo ? lienzo.height + 10 : Math.random() * lienzo.height,
      tamano: Math.random() * 2 + 0.6,
      velocidad: (Math.random() * 0.6 + 0.2) * (sinMovimiento ? 0.4 : 1),
      vaiven: Math.random() * Math.PI * 2,
      brillo: Math.random() * 0.5 + 0.3,
      color: colores[Math.floor(Math.random() * colores.length)]
    };
  }

  // 3. Menos chispas en celular para que no se ponga lento
  function crearChispas() {
    let cantidad = window.innerWidth < 600 ? 35 : 80;
    if (sinMovimiento) cantidad = Math.round(cantidad / 2);   // modo suave: la mitad
    chispas = [];
    for (let i = 0; i < cantidad; i++) chispas.push(nuevaChispa(false));
  }

  // 4. Dibuja y mueve las chispas en cada cuadro de la animación
  function animar() {
    pincel.clearRect(0, 0, lienzo.width, lienzo.height);
    chispas.forEach(function (c, i) {
      c.y -= c.velocidad;                 // sube
      c.vaiven += 0.02;
      c.x += Math.sin(c.vaiven) * 0.3;    // se mueve un poco de lado a lado
      if (c.y < -10) chispas[i] = nuevaChispa(true);   // si sale por arriba, renace abajo

      pincel.beginPath();
      pincel.arc(c.x, c.y, c.tamano, 0, Math.PI * 2);
      pincel.fillStyle = 'rgba(' + c.color + ',' + c.brillo + ')';
      pincel.shadowBlur = 8;
      pincel.shadowColor = 'rgba(' + c.color + ', 0.9)';
      pincel.fill();
    });
    requestAnimationFrame(animar);
  }

  ajustarTamano();
  crearChispas();
  animar();
  window.addEventListener('resize', function () { ajustarTamano(); crearChispas(); });
}


/* =========================================================
   Botón flotante de WhatsApp: aparece solo después de bajar
   ========================================================= */
const botonWsp = document.querySelector('.whatsapp-flotante');

let formularioEnPantalla = false;   // el formulario ya tiene su propio botón de WhatsApp

function revisarBotonWsp() {
  // escondido en la portada (menos de 300 píxeles) y cuando el formulario está a la vista
  botonWsp.classList.toggle('oculto', window.scrollY < 300 || formularioEnPantalla);
}

const seccionContacto = document.getElementById('contacto');
if (seccionContacto) {
  new IntersectionObserver(function (entradas) {
    formularioEnPantalla = entradas[0].isIntersecting;
    revisarBotonWsp();
  }, { threshold: 0.1 }).observe(seccionContacto);
}
revisarBotonWsp();
window.addEventListener('scroll', revisarBotonWsp, { passive: true });


/* =========================================================
   ETAPA 4 · Elementos que aparecen al bajar
   ========================================================= */

// 1. Elegimos qué cosas van a aparecer al bajar
const paraAparecer = document.querySelectorAll(
  '.cifra, section > h2, .titulo-bit, .tarjeta, blockquote, details, .cta-final, .nota'
);

// 2. Las escondemos (solo si hay JavaScript; sin él, todo se ve normal)
paraAparecer.forEach(function (el) {
  el.classList.add('aparecer');
  // efecto "cascada": las tarjetas del mismo grupo salen una tras otra
  const hermanos = Array.from(el.parentElement.children);
  el.style.transitionDelay = (hermanos.indexOf(el) * 0.12) + 's';
});

// 3. El "vigilante": avisa cuando algo entra en la pantalla
const vigilante = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    el.classList.add('visible');
    vigilante.unobserve(el);   // solo aparece una vez

    // al terminar, quitamos las clases para que la inclinación 3D vuelva a ser rápida
    setTimeout(function () {
      el.classList.remove('aparecer', 'visible');
      el.style.transitionDelay = '';
    }, 1400);
  });
}, { threshold: 0.15 });

paraAparecer.forEach(function (el) { vigilante.observe(el); });


/* =========================================================
   ETAPA 4 · Contadores animados (0 → número final)
   ========================================================= */
const numeros = document.querySelectorAll('.numero');

function contar(el) {
  const hasta = Number(el.dataset.hasta);
  const antes = el.dataset.antes || '';
  const despues = el.dataset.despues || '';
  const duracion = sinMovimiento ? 600 : 1600;   // milisegundos
  const inicio = performance.now();

  function paso(ahora) {
    const avance = Math.min((ahora - inicio) / duracion, 1);
    const suave = 1 - Math.pow(1 - avance, 3);   // empieza rápido y frena al final
    el.textContent = antes + Math.round(hasta * suave) + despues;
    if (avance < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

const vigilanteNumeros = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (!entrada.isIntersecting) return;
    contar(entrada.target);
    vigilanteNumeros.unobserve(entrada.target);
  });
}, { threshold: 0.6 });

numeros.forEach(function (n) { vigilanteNumeros.observe(n); });


/* =========================================================
   EXTRA · Estela del cursor (cometa rojo y dorado)
   ========================================================= */

// Solo en computadoras con mouse (en celular no hay cursor)
if (hayMouse) {
  const lienzoCursor = document.createElement('canvas');
  lienzoCursor.id = 'estela-cursor';
  document.body.appendChild(lienzoCursor);
  const lapiz = lienzoCursor.getContext('2d');

  const mouse = { x: -100, y: -100 };   // dónde está el mouse
  const punta = { x: -100, y: -100 };   // la cabeza del cometa (lo sigue con elasticidad)
  const cola = [];                      // posiciones anteriores = la cola
  const LARGO_COLA = sinMovimiento ? 14 : 34;
  let sobreBoton = false;               // ¿el mouse está sobre un botón o enlace?
  let tamanoPunta = 5;

  function ajustarLienzoCursor() {
    lienzoCursor.width = window.innerWidth;
    lienzoCursor.height = window.innerHeight;
  }
  ajustarLienzoCursor();
  window.addEventListener('resize', ajustarLienzoCursor);

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (punta.x < 0) {            // primera vez, o al volver a la ventana
      punta.x = mouse.x; punta.y = mouse.y;
      cola.length = 0;            // borramos la cola vieja para que no dibuje una línea larga
    }
    sobreBoton = !!e.target.closest('a, button, summary');
  });

  // Si el mouse sale de la ventana, el cometa se esconde
  document.addEventListener('mouseleave', function () { mouse.x = mouse.y = punta.x = punta.y = -100; cola.length = 0; });

  function dibujarCometa() {
    lapiz.clearRect(0, 0, lienzoCursor.width, lienzoCursor.height);

    // Si el mouse está fuera de la ventana, no dibujamos nada
    if (mouse.x < 0) { requestAnimationFrame(dibujarCometa); return; }

    // 1. La punta persigue al mouse (0.35 = elasticidad; más bajo = más "chicle")
    punta.x += (mouse.x - punta.x) * 0.35;
    punta.y += (mouse.y - punta.y) * 0.35;

    // 2. Guardamos la posición para formar la cola
    cola.unshift({ x: punta.x, y: punta.y });
    if (cola.length > LARGO_COLA) cola.pop();

    // 3. Dibujamos la cola: rellenamos el camino con círculos pegaditos
    //    (gruesos y dorados cerca de la punta, finos y rojos al final)
    lapiz.globalCompositeOperation = 'lighter';   // los brillos se suman (efecto neón)
    lapiz.shadowBlur = 0;
    const puntos = [];
    for (let i = 1; i < cola.length; i++) {
      const a = cola[i - 1], b = cola[i];
      if (Math.hypot(b.x - a.x, b.y - a.y) > 200) break;   // salto muy grande = no es movimiento real, cortamos la cola
      const pasos = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
      for (let k = 0; k < pasos; k++) {
        const t = k / pasos;
        puntos.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, avance: 1 - (i - 1 + t) / cola.length });
      }
    }
    puntos.forEach(function (pt) {
      const r = 9 * pt.avance + 0.5;
      const verde = Math.round(52 + 126 * pt.avance * pt.avance);   // rojo → dorado
      // halo suave (luz alrededor)
      lapiz.beginPath();
      lapiz.arc(pt.x, pt.y, r * 2.4, 0, Math.PI * 2);
      lapiz.fillStyle = 'rgba(226, ' + verde + ', 43, ' + (0.035 * pt.avance) + ')';
      lapiz.fill();
      // centro brillante
      lapiz.beginPath();
      lapiz.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      lapiz.fillStyle = 'rgba(226, ' + verde + ', 60, ' + (0.09 * pt.avance) + ')';
      lapiz.fill();
    });

    // 4. La punta dorada brillante (crece sobre botones y enlaces)
    const objetivo = sobreBoton ? 13 : 6;
    tamanoPunta += (objetivo - tamanoPunta) * 0.2;
    lapiz.globalCompositeOperation = 'source-over';
    lapiz.beginPath();
    lapiz.arc(punta.x, punta.y, tamanoPunta, 0, Math.PI * 2);
    lapiz.fillStyle = sobreBoton ? 'rgba(226, 178, 92, 0.25)' : '#ffe2a8';
    lapiz.shadowBlur = 22;
    lapiz.shadowColor = 'rgba(226, 178, 92, 1)';
    lapiz.fill();
    if (sobreBoton) {             // anillo dorado sobre botones
      lapiz.lineWidth = 2;
      lapiz.strokeStyle = '#e2b25c';
      lapiz.stroke();
    }

    requestAnimationFrame(dibujarCometa);
  }
  dibujarCometa();
}


/* =========================================================
   Promo de Navidad: cuenta los días que faltan
   y se esconde sola cuando termina
   ========================================================= */
const promo = document.getElementById('promo');
const promoDias = document.getElementById('promo-dias');

if (promo) {
  const finPromo = new Date('2027-01-01T23:59:59-05:00');   // 1 de enero, hora de Lima
  const faltan = Math.ceil((finPromo - new Date()) / (1000 * 60 * 60 * 24));

  if (faltan <= 0) {
    promo.style.display = 'none';                 // la promo ya terminó
  } else if (faltan === 1) {
    promoDias.textContent = '¡Último día!';
  } else {
    promoDias.textContent = 'Quedan ' + faltan + ' días';
  }
}


/* =========================================================
   Formulario: arma el mensaje y lo abre en WhatsApp
   (no guarda nada en la página)
   ========================================================= */
const formulario = document.getElementById('formulario');

if (formulario) {
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();   // evita que la página se recargue

    const nombre = formulario.nombre.value.trim();
    const negocio = formulario.negocio.value.trim();
    const paquete = formulario.paquete.value;
    const mensaje = formulario.mensaje.value.trim();

    let texto = 'Hola Omar, soy ' + nombre + ' de ' + negocio + '.\n' +
                'Me interesa: ' + paquete + '.';
    if (mensaje) texto += '\n' + mensaje;

    // encodeURIComponent convierte espacios, tildes y saltos de línea para que viajen en el link
    window.open('https://wa.me/51959869292?text=' + encodeURIComponent(texto), '_blank');
  });
}

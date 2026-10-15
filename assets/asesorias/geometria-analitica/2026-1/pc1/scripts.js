/*
  Asesoría web interactiva — Geometría Analítica (FB101) · PC1 2026-1
  Estilo: Cuaderno cuadriculado. Sin variables globales: todo vive en esta función.
 Carpeta: assets/asesorias/geometria-analitica/2026-1/pc1/
*/
(function () {
  'use strict';
  const T = String.raw;
  const SLUG = 'geometria-analitica';
  const EVAL = 'pc1';
  const PREFIJO = 'siga_aw_' + SLUG + '_' + EVAL + '_2026-1_';  // única zona de localStorage que se lee o escribe
  const RUTA_LIB = '../../../../libs/';                         // al integrarla a SIGA, apuntar a la carpeta compartida de librerías
  const USE_HASH = true;                            // poner en false si SIGA maneja su propia URL
  const TEST = (typeof window !== 'undefined' && window.__AW_TEST__) || null;

  /* ======================= DATOS (contenido separado del diseño) ======================= */
  const DATOS = {};
  DATOS.curso = { nombre: 'Geometría Analítica', codigo: 'FB101', evaluacion: 'PC1', ciclo: '2026-1', etiqueta: 'PC1 · 26-1', slug: 'geometria-analitica' };

  DATOS.herramientas = [
    {
      id: 1, nombre: 'El ortogonal de un vector', usa: [1, 2],
      formula: T`(a,b)^{\perp}=(-b,\,a)`,
      puntos: [T`Es el giro de 90° en sentido antihorario.`, T`$(u+v)^{\perp}=u^{\perp}+v^{\perp}$ y $(\lambda u)^{\perp}=\lambda u^{\perp}$`, T`$u\cdot u^{\perp}=0$ y $|u^{\perp}|=|u|$`]
    },
    {
      id: 2, nombre: 'Proyección y componente', usa: [1, 2],
      formula: T`\operatorname{comp}_{\vec b}\vec a=\dfrac{\vec a\cdot\vec b}{|\vec b|},\qquad \operatorname{proy}_{\vec b}\vec a=\dfrac{\vec a\cdot\vec b}{|\vec b|^{2}}\,\vec b`,
      puntos: [T`$\operatorname{proy}_{\vec b}\vec a+\operatorname{proy}_{\vec b^{\perp}}\vec a=\vec a$`, T`$2\operatorname{proy}_{\vec b}\vec a-\vec a$ es el reflejo de $\vec a$ (conserva su módulo).`, T`La distancia de un punto a una recta es una componente: $d(P,\overline{AD})=\left|\operatorname{comp}_{\overrightarrow{AD}^{\perp}}\overrightarrow{AP}\right|$.`]
    },
    {
      id: 3, nombre: 'Ángulo entre vectores y tangente con signo', usa: [1, 3],
      formula: T`\cos\theta=\dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|},\qquad \tan\theta=\dfrac{\vec a^{\perp}\cdot\vec b}{\vec a\cdot\vec b}`,
      puntos: [T`La tangente mide el ángulo de $\vec a$ hacia $\vec b$, en sentido antihorario: el orden importa.`, T`Se acompaña de $\tan(x+y)=\dfrac{\tan x+\tan y}{1-\tan x\,\tan y}$.`]
    },
    {
      id: 4, nombre: 'Ángulos en la circunferencia', usa: [1],
      formula: T`\angle A+\angle C=180^\circ\ \text{(opuestos en un cuadrilátero inscriptible)}`,
      puntos: [T`Los ángulos inscritos que abarcan el mismo arco son iguales.`, T`Es un recordatorio de secundaria.`]
    },
    {
      id: 5, nombre: 'Semejanza AA', usa: [3],
      formula: T`\triangle FBE\sim\triangle ACB\ \Rightarrow\ \dfrac{|BF|}{|CA|}=\dfrac{|BE|}{|CB|}=\dfrac{|FE|}{|AB|}`,
      puntos: [T`Dos ángulos iguales dan triángulos semejantes, con lados proporcionales.`, T`Escribe la correspondencia de vértices antes de plantear proporciones.`]
    },
    {
      id: 6, nombre: 'Criterios para descartar soluciones', usa: [1, 2, 3],
      formula: T`\text{horario}\iff \overrightarrow{AB}^{\perp}\cdot\overrightarrow{BC}<0,\qquad \text{obtuso en }B\iff \overrightarrow{BA}\cdot\overrightarrow{BC}<0`,
      puntos: [T`Los datos $k>0$ y $t>0$ fijan el sentido del vector.`, T`Casi siempre sale más de una raíz: este criterio es el que decide con cuál quedarte.`]
    }
  ];

  DATOS.ejercicios = [];

  /* ---------------------------------- Ejercicio 1 ---------------------------------- */
  DATOS.ejercicios.push({
    id: 1, puntos: 5, herramientas: [2, 3, 4, 6], figuraEnunciado: false,
    titulo: 'Cuadrilátero inscriptible: ángulos, tangente y distancia',
    tema: 'Ángulos, tangente y distancia en un cuadrilátero inscriptible',
    enunciado: T`Cuadrilátero convexo $ABCD$, sentido horario, inscriptible, con $\V{AC}=t(13,11)$, $t>0$. $P$ es un punto interior tal que $m\angle BAC=m\angle PCD=\alpha$, $d(P,\overline{AD})=1$, $m\angle ACB=\theta$, $\tan(2\alpha+\theta)=\frac52$ y $\V{CP}=(4,-10)$. Halle $\V{AP}$.`,
    reconocer: T`Fíjate en tres pistas. «Inscriptible» junto con ángulos iguales indica <b>persecución de ángulos</b>. El dato $\tan(2\alpha+\theta)$ indica que hay que armar esa combinación de ángulos. Y los datos en forma de vector indican que el resultado final se calcula con <b>vectores</b>. No se da ninguna coordenada, así que todo es relativo a $A$.`,
    pasos: [
      {
        t: 'Reducir el problema a una sola incógnita',
        que: T`Tomamos $A$ como origen, porque solo se piden vectores, y armamos $\V{AP}=\V{AC}+\V{CP}=t(13,11)+(4,-10)=(13t+4,\;11t-10)$.`,
        por: T`$\V{AP}$ queda escrito con <b>una sola incógnita</b>, $t$. El problema se reduce a «hallar $t$».`,
        crit: T`Si el vector pedido se arma sumando vectores dados, escríbelo de inmediato y cuenta cuántas incógnitas quedan.`,
        extra: T`<b>Plan del ejercicio:</b> el único dato que involucra $t$ es $d(P,\overline{AD})=1$, y para usarlo necesitamos la <b>dirección de $\overline{AD}$</b>. Los ángulos y la tangente servirán para hallar esa dirección.`
      },
      {
        t: 'Ubicar los puntos con «sentido horario»',
        que: T`Decidimos de qué lado de $\overline{AC}$ están $B$, $D$ y $P$.`,
        por: T`Un ángulo como $\angle ACP$ depende del lado en que cae $P$. Sin ubicarlo, el resto sería adivinar.`,
        crit: T`(Herramientas 1 y 6) La diagonal $\overline{AC}$ divide el cuadrilátero en $ABC$ y $ACD$, ambos recorridos en sentido horario. Entonces $B$ queda a la <b>izquierda</b> de $\V{AC}$ y $D$ a la <b>derecha</b>. Un punto $X$ está a la derecha si $\Pe{AC}\cdot\V{AX}<0$. Para $P$: $\Pe{AC}\cdot\V{AP}=\Pe{AC}\cdot\V{CP}=(-11,13)\cdot(4,-10)=-174<0$ (se usa que $\Pe{AC}\cdot\V{AC}=0$). Así que $P$ está del mismo lado que $D$.`,
        extra: T`$P$ es interior y está del lado de $D$, es decir, dentro del triángulo $ACD$. El rayo $CP$ queda <b>entre</b> $CA$ y $CD$.`
      },
      {
        t: 'Persecución de ángulos: llevar todo al triángulo ACD',
        que: T`Llamamos $\beta=\angle CAD$ y $\gamma=\angle ACP$, y vamos ángulo por ángulo:<ol><li>En el triángulo $ABC$: $\angle ABC=180^\circ-\alpha-\theta$.</li><li>Por ser inscriptible, los ángulos opuestos suman 180°: $\angle ADC=\alpha+\theta$.</li><li>El rayo $CP$ está entre $CA$ y $CD$: $\angle ACD=\gamma+\alpha$.</li><li>Suma de ángulos en $ACD$: $\beta+(\gamma+\alpha)+(\alpha+\theta)=180^\circ$, de donde $\beta+\gamma=180^\circ-(2\alpha+\theta)$.</li></ol>`,
        por: T`El dato trae $\tan(2\alpha+\theta)$, así que busqué que la suma de ángulos reprodujera justo $2\alpha+\theta$.`,
        crit: T`Si el enunciado da una función de una combinación de ángulos, arma esa combinación con la suma de ángulos de un triángulo.`,
        extra: T`<b>Resultado:</b> los ángulos suplementarios tienen tangentes opuestas, $\tan(180^\circ-x)=-\tan x$, así que $\tan(\beta+\gamma)=-\frac52$.`,
        err: T`Olvidar que son suplementarios y escribir $+\frac52$. Otro error es confundir $\angle ADC=\alpha+\theta$ con $\alpha$.`
      },
      {
        t: 'Calcular tan γ con vectores',
        que: T`$\gamma$ es el ángulo entre $\V{CA}=(-13t,-11t)$ y $\V{CP}=(4,-10)$. Con la herramienta 3, $\tan\gamma=\dfrac{\Pe{CA}\cdot\V{CP}}{\V{CA}\cdot\V{CP}}$, donde $\Pe{CA}=(11t,-13t)$. El numerador es $44t+130t=174t$ y el denominador es $-52t+110t=58t$. Entonces $\tan\gamma=3$.`,
        por: T`Lo que necesitamos después es $\tan(\beta+\gamma)$. Y como el denominador es positivo, $\gamma$ es agudo y el signo no da problemas.`,
        crit: T`Para conocer una <i>dirección</i> no hace falta conocer el <i>tamaño</i> del vector.`,
        extra: T`<b>Observa:</b> $t$ se canceló.`,
        err: T`Pasar a grados con calculadora (71,56°) y arrastrar decimales. Deja $\tan\gamma=3$ exacto.`
      },
      {
        t: 'Despejar tan β',
        que: T`$\dfrac{\tan\beta+3}{1-3\tan\beta}=-\dfrac52$. Multiplicando en cruz: $2\tan\beta+6=-5+15\tan\beta$, de donde $11=13\tan\beta$ y $\tan\beta=\dfrac{11}{13}$.`,
        por: T`Es la fórmula de la tangente de una suma, con $\tan\gamma=3$ y $\tan(\beta+\gamma)=-\frac52$.`,
        crit: T`Cuando un resultado intermedio reaparece en los datos, suele tener significado geométrico.`,
        extra: T`Fíjate en que $\frac{11}{13}$ es justo la pendiente de $\V{AC}=(13,11)$.`
      },
      {
        t: 'Dirección de AD',
        que: T`Sea $\V{AD}\parallel u=(p,q)$. Como $D$ está a la derecha de $\V{AC}$, girar $\V{AD}$ en sentido antihorario lleva a $\V{AC}$, así que el ángulo $\beta$ es positivo y $\tan\beta=\dfrac{u^{\perp}\cdot\V{AC}}{u\cdot\V{AC}}$, con $u^{\perp}=(-q,p)$. Entonces $\dfrac{11p-13q}{13p+11q}=\dfrac{11}{13}$. En cruz, $143p-169q=143p+121q$, y queda $-290q=0$, o sea $q=0$. Además $p>0$, porque $\beta$ es agudo y $u\cdot\V{AC}=13p$ debe ser positivo. Entonces $\V{AD}\parallel(1,0)$.`,
        por: T`Para usar la distancia necesitamos saber hacia dónde apunta $\overline{AD}$.`,
        crit: T`El orden en la fórmula de la tangente con signo importa: se mide desde el primer vector hacia el segundo.`,
        extra: T`<b>Interpretación:</b> $\overline{AD}$ cae sobre el eje X. Tiene sentido, porque $\V{AC}$ forma con el eje X un ángulo de tangente $\frac{11}{13}$, que es lo que mide $\beta$.`,
        err: T`Invertir el orden y usar $\Pe{AC}\cdot u$. Eso cambia el signo de $\tan\beta$ y apunta $\overline{AD}$ hacia el lado equivocado.`
      },
      {
        t: 'La distancia fija t',
        que: T`$d(P,\overline{AD})=\left|\operatorname{comp}_{\overrightarrow{AD}^{\perp}}\V{AP}\right|$. Como $\Pe{AD}\parallel(0,1)$, la componente es $11t-10$. Entonces $|11t-10|=1$, y sale $t=1$ o $t=\frac{9}{11}$.`,
        por: T`$P$ es interior, así que está dentro del ángulo $CAD$, entre $\V{AC}$ (que sube) y el eje X. Su altura debe ser <b>positiva</b>: $11t-10=1$, y por tanto $t=1$. Con $t=\frac{9}{11}$ la altura sería $-1$, o sea debajo de $\overline{AD}$, fuera del cuadrilátero.`,
        crit: T`(Herramienta 6) Una distancia es una componente. Si salen dos raíces, descarta con la ubicación (horario, punto interior).`,
        err: T`Quedarse con las dos raíces, o escribir $11t-10=1$ sin justificar por qué se descarta la otra.`
      }
    ],
    resultado: T`$\V{AP}=(13\cdot1+4,\;11\cdot1-10)=\boxed{(17,\,1)}$`,
    comprobacion: T`Construí con código este cuadrilátero explícito: $A=(0,0)$, $C=(13,11)$, $P=(17,1)$, $D=(25,0)$ y $B\approx(2{,}975;\,6{,}659)$. Con esos puntos se cumple todo: $m\angle BAC=m\angle PCD=25{,}69^\circ$, $m\angle ACB=16{,}82^\circ$, $\tan(2\alpha+\theta)=2{,}5$, $\angle B+\angle D=180^\circ$ (inscriptible), sentido horario, convexo, $P$ interior y $d(P,\overline{AD})=1$. Con $t=\frac{9}{11}$, $P$ queda en $(14{,}64;\,-1)$, debajo del eje X, y se descarta.`,
    llevarte: [T`Si el dato trae una función de una combinación de ángulos, como $\tan(2\alpha+\theta)$, arma esa combinación con la suma de ángulos de un triángulo.`, T`La dirección de un vector se obtiene con tangentes sin conocer su tamaño: $t$ se cancela.`, T`Una distancia es una componente. Si salen dos raíces, descarta con la ubicación (horario, punto interior).`],
    figura: {
      alt: 'Cuadrilátero ABCD con A en el origen, C en (13,11), D sobre el eje X, P en (17,1) y el vector AP.', nota: T`Así se ve una configuración que cumple todo. $D$ es un ejemplo: la longitud de $\overline{AD}$ no afecta la respuesta.`,
      svg: '<svg viewBox="0 0 680 320" role="img" aria-label="Configuración del ejercicio 1"><defs><marker id="ar1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><path d="M60 280L125.5 133.5L346 38L610 280Z" fill="#FFF1B8" fill-opacity=".55" stroke="#44506E" stroke-width="1.5"/><line x1="60" y1="280" x2="343" y2="40" stroke="#F26B4F" stroke-width="2.5" marker-end="url(#ar1)"/><line x1="346" y1="38" x2="433" y2="254" stroke="#2DB57A" stroke-width="2.5" marker-end="url(#ar1)"/><line x1="60" y1="280" x2="431" y2="258" stroke="#8B5CF6" stroke-width="2.5" marker-end="url(#ar1)"/><line x1="434" y1="258" x2="434" y2="280" stroke="#44506E" stroke-dasharray="4 3"/><circle cx="434" cy="258" r="3" fill="#8B5CF6"/><g class="svgt"><text x="42" y="296">A</text><text x="112" y="132" text-anchor="end">B</text><text x="352" y="32">C</text><text x="618" y="296">D</text><text x="442" y="252">P</text><text x="96" y="236" text-anchor="middle">α</text><text x="378" y="94" text-anchor="middle">α</text><text x="296" y="74" text-anchor="middle">θ</text><text class="s" x="170" y="206">AC = t(13, 11)</text><text class="s" x="383" y="150" text-anchor="end">CP = (4, −10)</text><text class="s" x="230" y="256">AP = (17, 1)</text><text class="s" x="250" y="300">AD ∥ (1, 0)</text><text class="s" x="434" y="300" text-anchor="middle">d(P, AD) = 1</text></g></svg>'
    }
  });

  /* ---------------------------------- Ejercicio 2 ---------------------------------- */
  DATOS.ejercicios.push({
    id: 2, puntos: 5, herramientas: [1, 2, 6], figuraEnunciado: false,
    titulo: 'Álgebra vectorial: proyección, ortogonal y descarte',
    tema: 'Álgebra vectorial con proyección ortogonal y ortogonal de un vector',
    enunciado: T`Cuadrilátero convexo $ABCD$, sentido horario, obtuso en $B$, con $|\V{AB}|=2\sqrt5$, $\V{BC}=k(9,-2)$, $k>0$, y estas tres condiciones:<div class="eq">(C1) $\left|2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}-\V{AB}+\V{CA}\right|=|\V{BC}|$</div><div class="eq">(C2) $\V{DA}+2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}-\V{AB}=\Pe{AC}$</div><div class="eq">(C3) $\V{CD}-2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}+\V{AB}+2\V{AC}=(13,-9)$</div>Determine $\V{DC}$.`,
    reconocer: T`Fíjate en que la expresión $\operatorname{proy}_{\overrightarrow{AB}}\V{AC}$ <b>se repite</b> en las tres condiciones y en C2 y C3 aparece con signos opuestos. Eso indica <b>álgebra de vectores</b>: ecuaciones donde los vectores se suman, se restan y se cancelan, sin necesidad de calcular coordenadas desde el inicio.`,
    pasos: [
      {
        t: 'Elegir el método (y por qué no coordenadas)',
        que: T`En vez de poner $A=(a_1,a_2)$, $B=\dots$ y resolver un sistema, trabajamos con los <b>vectores</b> como objetos, igual que cuando sumas números.`,
        por: T`Con coordenadas habría ocho incógnitas y expresiones largas con la proyección. Con álgebra vectorial, la proyección se cancela sin calcularla.`,
        crit: T`Si un mismo término aparece en dos ecuaciones con signos opuestos, súmalas. Si no sabes cómo atacar un problema de vectores, primero fíjate en qué se repite.`
      },
      {
        t: 'Sumar C2 y C3 y usar la suma de vectores',
        que: T`Sumamos miembro a miembro: $$\V{DA}+\V{CD}+2\V{AC}=\Pe{AC}+(13,-9)$$ Los términos con proyección se cancelan ($+2\operatorname{proy}$ con $-2\operatorname{proy}$), y también $-\V{AB}$ con $+\V{AB}$.`,
        por: T`Queda una ecuación solo con $\V{AC}$.`,
        crit: T`En el cuadrilátero cerrado, $\V{CD}+\V{DA}=\V{CA}=-\V{AC}$. Entonces $-\V{AC}+2\V{AC}=\V{AC}$, y queda $$\V{AC}-\Pe{AC}=(13,-9)$$`,
        err: T`Escribir $\V{DC}+\V{DA}=\V{CA}$. Los vectores se encadenan <b>punta con cola</b>: $C\to D\to A$ da $\V{CA}$.`
      },
      {
        t: 'Hallar AC',
        que: T`Sea $\V{AC}=(x,y)$. Con la herramienta 1, $\Pe{AC}=(-y,x)$, así que $\V{AC}-\Pe{AC}=(x+y,\;y-x)=(13,-9)$. Resolviendo $x+y=13$ y $y-x=-9$ sale $y=2$, $x=11$. Entonces $\V{AC}=(11,2)$.`,
        por: T`Un vector es igual a otro cuando coinciden sus dos componentes, y eso da un sistema de dos ecuaciones.`,
        crit: T`Recuerda: $(a,b)^{\perp}=(-b,a)$.`,
        err: T`Usar $(a,b)^{\perp}=(b,-a)$, que es el giro horario. Daría $\V{AC}=(2,-11)$, un resultado completamente distinto.`
      },
      {
        t: 'Hallar k con el módulo de AB',
        que: T`Como $\V{AC}=\V{AB}+\V{BC}$, entonces $\V{AB}=\V{AC}-\V{BC}=(11-9k,\;2+2k)$. Imponemos $|\V{AB}|^2=20$: $$(11-9k)^2+(2+2k)^2=20\;\Rightarrow\;17k^2-38k+21=0\;\Rightarrow\;k=1\ \text{ o }\ k=\tfrac{21}{17}$$`,
        por: T`Un dato de longitud se usa elevando al cuadrado, porque así desaparece la raíz y queda una ecuación en $k$.`,
        extra: T`<b>Observa:</b> salieron <b>dos</b> valores positivos. Como $k>0$ no los distingue, algún otro dato del enunciado debe hacerlo.`
      },
      {
        t: 'Descartar una raíz con «obtuso en B»',
        que: T`Con la herramienta 6, «obtuso en $B$» equivale a $\V{BA}\cdot\V{BC}<0$. Evaluamos con $\V{BA}=-\V{AB}$:<ul><li>$k=1$: $\V{AB}=(2,4)$, $\V{BC}=(9,-2)$. Entonces $\V{BA}\cdot\V{BC}=-18+8=-10<0$ ✓</li><li>$k=\frac{21}{17}$: $\V{BA}\cdot\V{BC}=\frac{3570}{289}>0$ ✗ (el ángulo en $B$ sería agudo)</li></ul><b>Conclusión:</b> $k=1$, así que $\V{AB}=(2,4)$ y $\V{BC}=(9,-2)$.`,
        por: T`Hay que quedarse con una de las dos soluciones, y la condición que las distingue es el ángulo en $B$.`,
        crit: T`«Obtuso» no es un adorno del enunciado, es el dato que decide entre las dos raíces. La condición de sentido horario no sirve aquí, porque ambas raíces la cumplen.`,
        err: T`Quedarse con las dos soluciones, o descartar una por intuición sin hacer la cuenta del producto escalar.`
      },
      {
        t: 'Calcular la proyección',
        que: T`Con la herramienta 2, $\operatorname{proy}_{\overrightarrow{AB}}\V{AC}=\dfrac{\V{AC}\cdot\V{AB}}{|\V{AB}|^2}\,\V{AB}=\dfrac{22+8}{20}(2,4)=\tfrac32(2,4)=(3,6)$.`,
        por: T`Ya conocemos $\V{AC}$ y $\V{AB}$, y la proyección era lo que nos faltaba para despejar $\V{DA}$.`,
        crit: T`En la fórmula de proyección va $|\V{AB}|^2$ en el denominador, no $|\V{AB}|$. Si dudas, revisa que el resultado sea paralelo a $\V{AB}$.`
      },
      {
        t: 'Despejar DA y obtener DC',
        que: T`De C2, $\V{DA}=\Pe{AC}-2\operatorname{proy}+\V{AB}=(-2,11)-(6,12)+(2,4)=(-6,3)$. Como $D\to A\to C$, tenemos $\V{DC}=\V{DA}+\V{AC}=(-6,3)+(11,2)=(5,5)$.`,
        por: T`Lo pedido es $\V{DC}$, y se arma encadenando vectores que ya conocemos.`,
        crit: T`Revisa siempre la dirección pedida: $\V{DC}$ y $\V{CD}$ son opuestos.`,
        err: T`Confundir $\V{DC}$ con $\V{CD}$. Entregar $(-5,-5)$ sería un resultado incorrecto.`
      },
      {
        t: '¿Qué pasó con la condición C1?',
        que: T`No la usamos, y conviene entender por qué. Con $\V{AC}=\V{AB}+\V{BC}$ y $\V{CA}=-\V{AB}-\V{BC}$, la expresión de C1 se reduce a $2\operatorname{proy}_{\overrightarrow{AB}}\V{BC}-\V{BC}$. Su módulo es $|\V{BC}|$ siempre, porque $|2p-v|^2=4|p|^2-4\,p\cdot v+|v|^2=|v|^2$ (se usa que $p\cdot v=|p|^2$ cuando $p$ es la proyección de $v$). Con números: $(6,12)-(2,4)+(-11,-2)=(-7,6)$, y $|(-7,6)|^2=85=|(9,-2)|^2$ ✓.`,
        por: T`C1 es una <b>identidad</b>: se cumple para cualquier cuadrilátero.`,
        crit: T`No hay error en el enunciado, pero el dato no aporta información. Si un dato no se usó, verifica si es una identidad antes de ignorarlo.`
      }
    ],
    resultado: T`$\V{DC}=\boxed{(5,\,5)}$`,
    comprobacion: T`Con $A=(0,0)$, $B=(2,4)$, $C=(11,2)$ y $D=(6,-3)$ se cumple todo: $|\V{AB}|=\sqrt{20}=2\sqrt5$ y $\V{BC}=1\cdot(9,-2)$. C2: $(-6,3)+(6,12)-(2,4)=(-2,11)=\Pe{AC}$ ✓. C3: $(-5,-5)-(6,12)+(2,4)+(22,4)=(13,-9)$ ✓. Obtuso en $B$: $\V{BA}\cdot\V{BC}=-10<0$ ✓. Horario y convexo: los giros en los cuatro vértices valen $-40,\,-55,\,-45,\,-30$, todos negativos ✓.`,
    llevarte: [T`Si un término aparece repetido con signos opuestos en dos ecuaciones, súmalas y se cancela sin calcularlo.`, T`Un dato de módulo da una ecuación cuadrática con dos raíces. Para descartar una, busca el dato «cualitativo» del enunciado (obtuso, horario, $k>0$) y evalúalo con un producto escalar.`, T`Si un dato no se usó, verifica si es una identidad antes de ignorarlo.`],
    figura: {
      alt: 'Cuadrilátero ABCD con A=(0,0), B=(2,4), C=(11,2), D=(6,-3), obtuso en B, con la diagonal AC y el vector DC=(5,5).', nota: T`Así se ve el cuadrilátero con $A$ en el origen.`,
      svg: '<svg viewBox="0 0 680 380" role="img" aria-label="Configuración del ejercicio 2"><defs><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><path d="M80 200L170 20L575 110L350 335Z" fill="#DCEBFF" fill-opacity=".6" stroke="#44506E" stroke-width="1.5"/><line x1="80" y1="200" x2="572" y2="111" stroke="#F26B4F" stroke-width="2.5" marker-end="url(#ar2)"/><line x1="350" y1="335" x2="572" y2="113" stroke="#8B5CF6" stroke-width="2.5" marker-end="url(#ar2)"/><line x1="80" y1="200" x2="168" y2="24" stroke="#2DB57A" stroke-width="2.5" marker-end="url(#ar2)"/><line x1="170" y1="20" x2="572" y2="109" stroke="#2DB57A" stroke-width="2.5" marker-end="url(#ar2)"/><g class="svgt"><text x="60" y="214">A</text><text x="158" y="18">B</text><text x="584" y="114">C</text><text x="356" y="354">D</text><text class="s" x="112" y="108" text-anchor="end">AB = (2, 4)</text><text class="s" x="372" y="94" text-anchor="middle">BC = (9, −2)</text><text class="s" x="300" y="146">AC = (11, 2)</text><text class="s" x="480" y="236">DC = (5, 5)</text><text class="s" x="165" y="72">B obtuso</text></g></svg>'
    }
  });

  /* ---------------------------------- Ejercicio 3 ---------------------------------- */
  DATOS.ejercicios.push({
    id: 3, puntos: 5, herramientas: [3, 5, 6], figuraEnunciado: false,
    titulo: 'Semejanza por ángulos iguales',
    tema: 'Semejanza de triángulos con vectores y módulos',
    enunciado: T`Triángulo $ABC$, sentido horario, obtuso en $A$. $D$ está en la prolongación de $\overline{CA}$ y $E$ es un punto exterior relativo al lado $\overline{BC}$, tal que $F$ es un punto de $\overline{DE}$, con $m\angle FBE=m\angle ACB$, $|\V{BF}|=4\sqrt2$, $\V{BE}=(10,4)$, $\V{CE}=t(-1,17)$, $t>0$, $m\angle DFB=m\angle DAB$ y $\V{CA}=(-8,4)$. Calcule $\V{DF}$.`,
    reconocer: T`Fíjate en que hay <b>dos igualdades de ángulos</b> y longitudes dadas por vectores. Eso indica <b>semejanza de triángulos</b> (herramienta 5) para obtener longitudes y, después, vectores para ubicar los puntos.`,
    pasos: [
      {
        t: 'Plan y elección del origen',
        que: T`Lo pedido es $\V{DF}=F-D$, una <b>resta de puntos</b>. No importa dónde esté el triángulo en el plano, así que tomaremos $B=(0,0)$ cuando ubiquemos los puntos.`,
        por: T`Plan: (i) los ángulos iguales darán una semejanza y una longitud; (ii) con esa longitud hallamos $t$; (iii) ubicamos $F$; (iv) ubicamos $D$ y restamos.`,
        crit: T`Si el resultado es la diferencia de dos puntos, puedes elegir el origen que prefieras, así que elige el que simplifique.`
      },
      {
        t: 'De los ángulos iguales a una semejanza',
        que: T`$F$ está en $\overline{DE}$, así que $\angle DFB$ y $\angle BFE$ son suplementarios. $D$ está en la prolongación de $\overline{CA}$ <b>más allá de $A$</b>, así que $\angle DAB$ y $\angle BAC$ también son suplementarios. Entonces: $$m\angle BFE=180^\circ-m\angle DFB=180^\circ-m\angle DAB=m\angle BAC$$ Junto con $m\angle FBE=m\angle ACB$, los triángulos $FBE$ y $ACB$ tienen dos ángulos iguales (herramienta 5): $\triangle FBE\sim\triangle ACB$ con la correspondencia $F\leftrightarrow A,\ B\leftrightarrow C,\ E\leftrightarrow B$.`,
        por: T`Nos da proporciones entre lados que no conocíamos.`,
        crit: T`Dos pares de ángulos iguales, uno de ellos con un suplemento de por medio, suelen indicar semejanza. Escribe la correspondencia de vértices antes de plantear proporciones.`,
        err: T`Igualar $\angle DFB$ con $\angle BFE$ directamente. Son suplementarios, no iguales. Otro error es emparejar mal los vértices; escribe la correspondencia $F\text{-}B\text{-}E\leftrightarrow A\text{-}C\text{-}B$ y de ahí saca los lados.`
      },
      {
        t: 'Proporción para hallar |CB|',
        que: T`Lados correspondientes: $FB\leftrightarrow AC$, $BE\leftrightarrow CB$, $FE\leftrightarrow AB$. Entonces $\dfrac{|BF|}{|CA|}=\dfrac{|BE|}{|CB|}$. Con $|\V{CA}|=\sqrt{64+16}=4\sqrt5$ y $|\V{BE}|=\sqrt{116}=2\sqrt{29}$: $$|\V{CB}|=\frac{|BE|\,|CA|}{|BF|}=\frac{2\sqrt{29}\cdot4\sqrt5}{4\sqrt2}=\sqrt{290}$$`,
        por: T`Es la longitud que nos faltaba para hallar $t$.`,
        crit: T`Con la correspondencia escrita, cada lado tiene su pareja: no mezcles lados que no se corresponden.`
      },
      {
        t: 'Hallar t y BC',
        que: T`Como $\V{BE}=\V{BC}+\V{CE}$, entonces $\V{BC}=\V{BE}-\V{CE}=(10+t,\;4-17t)$. Imponemos $|\V{BC}|^2=290$: $$(10+t)^2+(4-17t)^2=290\;\Rightarrow\;5t^2-2t-3=0\;\Rightarrow\;(5t+3)(t-1)=0$$ Como $t>0$, $t=1$ y $\V{BC}=(11,-13)$.`,
        por: T`Un dato de longitud se usa elevando al cuadrado, y queda una ecuación en $t$.`,
        crit: T`La raíz $t=-\frac35$ se descarta por el dato $t>0$ del enunciado.`,
        err: T`Escribir $\V{BC}=\V{CE}-\V{BE}$ (signo cambiado). Encadena punta con cola: $B\to C\to E$.`
      },
      {
        t: 'Calcular cos θ',
        que: T`$\theta=m\angle ACB$ es el ángulo entre los vectores que <b>salen de $C$</b>: $\V{CA}=(-8,4)$ y $\V{CB}=(-11,13)$. Con la herramienta 3: $$\cos\theta=\frac{\V{CA}\cdot\V{CB}}{|\V{CA}||\V{CB}|}=\frac{88+52}{4\sqrt5\cdot\sqrt{290}}=\frac{140}{20\sqrt{58}}=\frac{7}{\sqrt{58}}$$`,
        por: T`$\theta$ también es el ángulo entre $\V{BF}$ y $\V{BE}$, y así podremos hallar $\V{BF}$.`,
        crit: T`Para el ángulo en un vértice, usa los vectores que salen de ese vértice.`,
        err: T`Usar $\V{CA}\cdot\V{BC}$. Ese producto da $-\cos\theta$, porque $\V{BC}$ no sale de $C$.`
      },
      {
        t: 'Ubicar F',
        que: T`Sea $\V{BF}=(p,q)$. Tenemos dos datos. El ángulo con $\V{BE}$ es $\theta$: $\V{BF}\cdot\V{BE}=|BF||BE|\cos\theta=4\sqrt2\cdot2\sqrt{29}\cdot\frac{7}{\sqrt{58}}=56$, o sea $10p+4q=56$. Y la longitud: $p^2+q^2=32$. Despejando $q=14-\frac52p$ y sustituyendo, queda $29p^2-280p+656=0$, con soluciones $p=4$ y $p=\frac{164}{29}$. Los dos vectores posibles son $\V{BF}=(4,4)$ y $\V{BF}=\left(\frac{164}{29},-\frac{4}{29}\right)$.`,
        por: T`Salen <b>dos</b> soluciones porque el enunciado no dice de qué lado de $\V{BE}$ cae $F$. Tomamos el lado que conserva el sentido de giro de $ACB$. Con la herramienta 6 esto se escribe $\Pe{BE}\cdot\V{BF}>0$, que da $24>0$ para $(4,4)$ y $-24<0$ para la otra. Entonces $\V{BF}=(4,4)$.`,
        crit: T`La otra configuración también cumple los datos, pero con números poco naturales, y es casi seguro que el profesor no la tenía en mente. <b>En un examen real, pregunta al profesor.</b>`,
        err: T`Quedarse con una sola ecuación. Con $10p+4q=56$ sola hay infinitas soluciones, y con $p^2+q^2=32$ sola también. Se necesitan las dos.`
      },
      {
        t: 'Ubicar D y calcular DF',
        que: T`Con $B=(0,0)$ tenemos $C=(11,-13)$, $E=(10,4)$ y $F=(4,4)$. Entonces $\V{FE}=(6,0)$, así que la recta $DE$ es <b>horizontal</b>, $y=4$. $D$ está en la prolongación de $\overline{CA}$ más allá de $A$, es decir $D=C+s\,\V{CA}=(11-8s,\;-13+4s)$ con $s>1$. Imponiendo $y=4$ resulta $s=\frac{17}{4}>1$ ✓ y $D=(-23,4)$. Finalmente $\V{DF}=F-D=(4+23,\;4-4)=(27,0)$.`,
        por: T`Con $s=1$ estamos en $A$. Más allá de $A$ significa $s>1$.`,
        crit: T`Una respuesta que es resta de puntos te deja elegir el origen: ponlo donde simplifique.`,
        err: T`Confundir $\V{DF}$ con $\V{FD}=(-27,0)$.`
      }
    ],
    resultado: T`$\V{DF}=\boxed{(27,\,0)}$`,
    comprobacion: T`Con $B=(0,0)$, $A=(3,-9)$, $C=(11,-13)$, $E=(10,4)$, $F=(4,4)$ y $D=(-23,4)$ se cumple todo: $|\V{BF}|=4\sqrt2$, $\V{CE}=(-1,17)$ con $t=1>0$, $\V{CA}=(-8,4)$. $m\angle FBE=m\angle ACB=23{,}20^\circ$ y $m\angle DFB=m\angle DAB=45^\circ$. Horario y obtuso en $A$: $\V{AB}\cdot\V{AC}=-60<0$, con $m\angle BAC=135^\circ$. $E$ queda del lado opuesto a $A$ respecto de $BC$ (exterior), y $F$ queda entre $D$ y $E$. <b>Segundo camino, independiente:</b> la proporción del Paso 3 predice $|\V{FE}|=\dfrac{|AB|\,|BE|}{|CB|}=\dfrac{3\sqrt{10}\cdot2\sqrt{29}}{\sqrt{290}}=6$, y el cálculo directo dio $\V{FE}=(6,0)$, de módulo 6 ✓.`,
    llevarte: [T`Dos pares de ángulos iguales, uno de ellos con un suplemento de por medio, suelen indicar semejanza. Escribe la correspondencia de vértices y de ahí sacas las proporciones.`, T`Si un dato fija dos condiciones sobre un vector (ángulo y longitud), plantea el producto escalar y el módulo. Si salen dos soluciones, decide con el sentido de giro.`, T`Una respuesta que es resta de puntos te deja elegir el origen: ponlo donde simplifique.`],
    figura: {
      alt: 'Con B en el origen: A=(3,-9), C=(11,-13), E=(10,4), F=(4,4) y D=(-23,4). D en la prolongación de CA, F en el segmento DE.', nota: T`Así se ve la configuración, con $B$ como origen.`,
      svg: '<svg viewBox="0 0 680 340" role="img" aria-label="Configuración del ejercicio 3"><defs><marker id="ar3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><path d="M428 94L476 238L604 302Z" fill="#D8F5E4" fill-opacity=".6" stroke="#44506E" stroke-width="1.5"/><line x1="604" y1="302" x2="60" y2="30" stroke="#F26B4F" stroke-width="1.5" stroke-dasharray="5 4"/><line x1="60" y1="30" x2="588" y2="30" stroke="#44506E" stroke-width="1.5"/><line x1="604" y1="302" x2="588" y2="30" stroke="#44506E" stroke-width="1.5"/><line x1="428" y1="94" x2="586" y2="31" stroke="#2DB57A" stroke-width="2.5"/><line x1="428" y1="94" x2="490" y2="32" stroke="#2DB57A" stroke-width="2.5"/><line x1="60" y1="30" x2="490" y2="30" stroke="#8B5CF6" stroke-width="3" marker-end="url(#ar3)"/><circle cx="476" cy="238" r="3" fill="#44506E"/><g class="svgt"><text x="468" y="258" text-anchor="end">A</text><text x="412" y="108" text-anchor="end">B</text><text x="612" y="308">C</text><text x="594" y="24">E</text><text x="492" y="22" text-anchor="middle">F</text><text x="50" y="26" text-anchor="end">D</text><text x="466" y="74" text-anchor="middle">θ</text><text x="557" y="268" text-anchor="middle">θ</text><text x="443" y="206" text-anchor="middle">φ</text><text x="455" y="52" text-anchor="middle">φ</text><text class="s" x="276" y="52" text-anchor="middle">DF = (27, 0)</text><text class="s" x="500" y="86">BE = (10, 4)</text><text class="s" x="500" y="162">BC = (11, −13)</text><text class="s" x="505" y="296">CA = (−8, 4)</text></g></svg>'
    }
  });

  /* ------------------------------ Tips y estrategias ------------------------------ */
  DATOS.tips = {
    estrategias: [
      T`Antes de calcular, marca tres cosas: qué se pide, qué incógnitas hay ($t$, $k$) y qué datos cualitativos trae (horario, obtuso, interior, $t>0$).`,
      T`Reduce a una sola incógnita: arma el vector pedido sumando vectores dados, como $\V{AP}=\V{AC}+\V{CP}$, y cuenta cuántas incógnitas quedan.`,
      T`Fíjate en lo que <b>se repite</b> en las ecuaciones. Si un término aparece con signos opuestos, súmalas y se cancela sin calcularlo (Ejercicio 2).`,
      T`Un dato con una función de ángulos, como $\tan(2\alpha+\theta)$, se aprovecha armando esa misma combinación con la suma de ángulos de un triángulo (Ejercicio 1).`,
      T`Ángulos iguales, con o sin suplemento de por medio, suelen indicar semejanza. Escribe la correspondencia de vértices antes de plantear proporciones (Ejercicio 3).`,
      T`Si un parámetro positivo se cancela en la cuenta, no intentes calcularlo, como pasó con $t$ en el Paso 4 del Ejercicio 1.`,
      T`Una ecuación cuadrática da dos raíces. Descarta una con el dato cualitativo, y haz la cuenta en lugar de decidir por intuición.`,
      T`Si la respuesta es una resta de puntos, elige como origen el punto que más simplifique.`,
      T`Cierra con una <b>comprobación</b>: arma una configuración con números concretos, o verifica con un segundo camino.`],
    errores: [
      T`Usar $(a,b)^{\perp}=(b,-a)$. El correcto es $(-b,a)$, giro antihorario.`,
      T`Encadenar mal los vectores: $\V{CD}+\V{DA}=\V{CA}$, y $\V{BC}=\V{BE}-\V{CE}$. Siempre punta con cola.`,
      T`Entregar $\V{CD}$ cuando piden $\V{DC}$. Son opuestos.`,
      T`Tratar ángulos suplementarios como iguales.`,
      T`Calcular $\cos\theta$ con vectores que no salen del mismo vértice. El signo sale al revés.`,
      T`En la proyección, dividir por $|\vec b|$ en lugar de $|\vec b|^2$.`,
      T`Quedarse con las dos raíces de una cuadrática, o descartar una sin justificar.`,
      T`Pasar ángulos a grados con calculadora y arrastrar decimales. Deja tangentes y fracciones exactas.`,
      T`Plantear una sola ecuación para dos incógnitas. Un vector $(p,q)$ necesita dos condiciones.`],
    observaciones: [
      T`«Sentido horario» no es adorno: decide de qué lado de una diagonal cae cada punto. Un punto $X$ está a la derecha de $\V{AC}$ si $\Pe{AC}\cdot\V{AX}<0$.`,
      T`Un dato puede ser una <b>identidad</b> (el módulo del Ejercicio 2). Verifica antes de ignorarlo, para no dejar pasar algo que sí era necesario.`,
      T`Si un resultado intermedio coincide con un dato, como $\frac{11}{13}$ y la pendiente de $\V{AC}$, suele indicar una dirección.`,
      T`$\tan\theta=\dfrac{\vec a^{\perp}\cdot\vec b}{\vec a\cdot\vec b}$ mide el ángulo <b>de $\vec a$ hacia $\vec b$</b>, en sentido antihorario. El orden importa.`,
      T`Si un enunciado admite dos configuraciones (Ejercicio 3), elige con $\vec u^{\perp}\cdot\vec v$ y, en un examen real, <b>pregunta al profesor</b>.`,
      T`En el sílabo, «ángulo entre vectores» está en la semana 4, pero esta PC lo usa. Conviene repasar la herramienta 3.`]
  };
  DATOS.checklist = [
    'Respondí lo que se pide (vector, punto o módulo; DC o CD)',
    'Usé todos los datos; si alguno no entró, verifiqué que es una identidad',
    'Descarté las raíces sobrantes con t > 0, k > 0, obtuso, interior o el lado',
    'Sustituí mi resultado en una ecuación original',
    'Cumple el sentido horario y la convexidad (signo de los giros)',
    'Coinciden los módulos y los ángulos dados',
    'Dejé raíces y fracciones exactas',
    'Escribí el resultado como vector, con paréntesis y signos correctos'
  ];

  /* ------------- Nombres cortos, temas, recordatorios contextuales y tarjetas de Estrategias ------------- */
  DATOS.corto = ['Ángulos y distancia', 'Proyecciones', 'Semejanza'];
  DATOS.temas = ['Ángulos, tangente y distancia', 'Proyección y ortogonal', 'Semejanza de triángulos'];
  /* clave 'pregunta-paso' (paso desde 1) -> herramientas que se recuerdan justo ahí */
  DATOS.rec = { '1-2': [1], '1-3': [4], '1-4': [3], '1-6': [3], '1-7': [2], '2-3': [1], '2-5': [6], '2-6': [2], '3-2': [5], '3-3': [5], '3-5': [3], '3-6': [6] };
  /* una tarjeta por consejo, alineada por posición con DATOS.tips; ver = [pregunta, paso] */
  DATOS.esencial = { estrategia: [0, 6], error: [0, 3], observ: [0] };   // los 5 tips que se muestran en la sección «Tips»
  DATOS.tarjetas = {
    estrategia: [
      { t: 'Marca lo que se pide', ver: [1, 1] }, { t: 'Reduce a una incógnita', ver: [1, 1] }, { t: 'Busca lo que se repite', ver: [2, 2] },
      { t: 'Arma la combinación de ángulos', ver: [1, 3] }, { t: 'Escribe la correspondencia', ver: [3, 2] }, { t: 'Si un parámetro se cancela, déjalo', ver: [1, 4] },
      { t: 'Dos raíces: descarta con un dato', ver: [2, 5] }, { t: 'Elige el origen que simplifique', ver: [3, 1] }, { t: 'Cierra con una comprobación', ver: [1, 7] }],
    error: [
      { t: 'Ortogonal al revés', ver: [2, 3] }, { t: 'Vectores mal encadenados', ver: [2, 2] }, { t: 'DC no es CD', ver: [2, 7] },
      { t: 'Suplementarios no son iguales', ver: [1, 3] }, { t: 'Coseno con vectores equivocados', ver: [3, 5] }, { t: 'Proyección: |b|² y no |b|', ver: [2, 6] },
      { t: 'Raíces sin descartar', ver: [1, 7] }, { t: 'Decimales de la calculadora', ver: [1, 4] }, { t: 'Una ecuación para dos incógnitas', ver: [3, 6] }],
    observ: [
      { t: '«Horario» decide el lado', ver: [1, 2] }, { t: 'Un dato puede ser identidad', ver: [2, 8] }, { t: 'Lo que reaparece indica dirección', ver: [1, 5] },
      { t: 'La tangente tiene sentido', ver: [1, 6] }, { t: 'Dos configuraciones: pregunta', ver: [3, 6] }, { t: 'Repasa el ángulo entre vectores', ver: [1, 4] }]
  };

  /* ------------- Datos adicionales: resultados por paso, ideas clave y calentamientos ------------- */
  DATOS.curso.fecha = '17/04/2026';
  DATOS.ideas = ['La tangente te da la dirección de un lado.', 'Lo que se repite con signo opuesto se cancela.', 'Dos ángulos iguales dan una semejanza.'];
  DATOS.res = {
    '1-1': T`$\V{AP}=(13t+4,\;11t-10)$: una sola incógnita, $t$.`,
    '1-2': T`$P$ y $D$ quedan a la derecha de $\V{AC}$: $P$ está dentro de $ACD$.`,
    '1-3': T`$\tan(\beta+\gamma)=-\frac52$`,
    '1-4': T`$\tan\gamma=3$ (se cancela $t$)`,
    '1-5': T`$\tan\beta=\frac{11}{13}$`,
    '1-6': T`$\V{AD}\parallel(1,0)$: sobre el eje X`,
    '1-7': T`$t=1$`,
    '2-1': T`Método: sumar las ecuaciones y trabajar con vectores`,
    '2-2': T`$\V{AC}-\Pe{AC}=(13,-9)$`,
    '2-3': T`$\V{AC}=(11,2)$`,
    '2-4': T`$k=1$ o $k=\frac{21}{17}$`,
    '2-5': T`$k=1$: $\V{AB}=(2,4)$ y $\V{BC}=(9,-2)$`,
    '2-6': T`$\operatorname{proy}_{\overrightarrow{AB}}\V{AC}=(3,6)$`,
    '2-7': T`$\V{DC}=(5,5)$`,
    '2-8': T`C1 es una identidad: no aporta datos`,
    '3-1': T`Origen en $B$; pedido: $\V{DF}=F-D$`,
    '3-2': T`$\triangle FBE\sim\triangle ACB$`,
    '3-3': T`$|\V{CB}|=\sqrt{290}$`,
    '3-4': T`$t=1$ y $\V{BC}=(11,-13)$`,
    '3-5': T`$\cos\theta=\frac{7}{\sqrt{58}}$`,
    '3-6': T`$\V{BF}=(4,4)$`,
    '3-7': T`$\V{DF}=(27,0)$`
  };
  DATOS.calent = [
    {
      q: T`¿Cuál es el ortogonal de $(3,4)$?`, ops: ['(−4, 3)', '(4, −3)', '(−3, −4)'], ok: 0,
      msg: ['(a, b)⊥ = (−b, a): giro de 90° antihorario. Esa regla se usa en las 3 preguntas.', 'Eso sale con el giro horario, (b, −a). En el curso, (a, b)⊥ = (−b, a).', 'Eso es el opuesto, −(a, b); no está girado 90°.']
    },
    {
      q: T`¿Cuál es la proyección de $\vec a=(4,3)$ sobre $\vec b=(6,0)$?`, ops: ['(4, 0)', '(6, 0)', '(0, 3)'], ok: 0,
      msg: ['Es la «sombra» de a sobre la dirección de b: ((a·b)/|b|²)·b = (4, 0).', 'Ese es el propio vector b: la proyección tiene la longitud de la sombra de a.', 'Esa es la parte de a perpendicular a b, no su proyección sobre b.']
    },
    {
      q: T`Si $\vec a=(1,0)$ y $\vec b=(1,1)$, ¿cuánto vale la tangente del ángulo de $\vec a$ hacia $\vec b$?`, ops: ['1', '−1', '0'], ok: 0,
      msg: ['tan = (a⊥·b)/(a·b) = ((0, 1)·(1, 1))/((1, 0)·(1, 1)) = 1/1 = 1.', 'Cuidado con el orden: del vector a hacia b el signo es positivo (antihorario).', 'Eso sería si a y b tuvieran la misma dirección; aquí forman 45°.']
    }
  ];
  function formatearQue(h) {
    const keep = [];
    h = h.replace(/<(ol|ul)>[\s\S]*?<\/\1>|<div class="eq">[\s\S]*?<\/div>/g, function (m) { keep.push(m); return '§K' + (keep.length - 1) + '§' });
    const mt = [];
    h = h.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, function (m) { mt.push(m); return '§M' + (mt.length - 1) + '§' });
    h = h.replace(/(§M(\d+)§)\s+(?=[A-ZÁÉÍÓÚÑ«¿¡])/g, function (a, p, i) { return mt[+i].indexOf('$$') === 0 ? p + '\u0001' : a });
    h = h.replace(/([.!?:])\s+(?=[A-ZÁÉÍÓÚÑ«¿¡]|§[MK])/g, '$1\u0001');
    const out = h.split('\u0001').map(function (s) {
      s = s.trim(); if (!s) return '';
      let m = s.match(/^§M(\d+)§([.,;]?)$/);
      if (m) { const x = mt[+m[1]]; const d = x.indexOf('$$') === 0 ? x : '$$' + x.slice(1, -1) + '$$'; return '<div class="dev">' + d + '</div>' }
      m = s.match(/^§K(\d+)§$/); if (m) return keep[+m[1]];
      return '<p>' + s + '</p>';
    }).join('');
    return out.replace(/§M(\d+)§/g, function (a, i) { return mt[+i] }).replace(/§K(\d+)§/g, function (a, i) { return keep[+i] });
  }
  DATOS.ejercicios.forEach(function (e) { e.pasos.forEach(function (p, i) { p.que = formatearQue(p.que); p.res = DATOS.res[e.id + '-' + (i + 1)] || '' }) });
  /* Desarrollos clave reescritos a mano: una idea por línea y ecuaciones alineadas */
  DATOS.ejercicios[0].pasos[4].que = T`<p>Usamos la fórmula de la tangente de una suma, con $\tan\gamma=3$ y $\tan(\beta+\gamma)=-\frac52$:</p><div class="dev">$$\frac{\tan\beta+3}{1-3\tan\beta}=-\frac52$$</div><p>Multiplicamos en cruz y despejamos:</p><div class="dev">$$\begin{aligned}2\tan\beta+6&=-5+15\tan\beta\\ 11&=13\tan\beta\end{aligned}$$</div><p>Entonces $\tan\beta=\dfrac{11}{13}$.</p>`;
  DATOS.ejercicios[0].pasos[5].que = T`<p>Sea $\V{AD}\parallel u=(p,q)$. Como $D$ está a la derecha de $\V{AC}$, girar $\V{AD}$ en sentido antihorario lleva a $\V{AC}$: $\beta$ es positivo y</p><div class="dev">$$\tan\beta=\frac{u^{\perp}\cdot\V{AC}}{u\cdot\V{AC}}=\frac{11p-13q}{13p+11q}=\frac{11}{13}$$</div><p>Multiplicando en cruz:</p><div class="dev">$$\begin{aligned}143p-169q&=143p+121q\\ -290q&=0\end{aligned}$$</div><p>Entonces $q=0$. Además $p>0$, porque $\beta$ es agudo y $u\cdot\V{AC}=13p$ debe ser positivo. Resulta $\V{AD}\parallel(1,0)$.</p>`;
  DATOS.ejercicios[1].pasos[2].que = T`<p>Sea $\V{AC}=(x,y)$. Con el ortogonal, $\Pe{AC}=(-y,x)$.</p><p>Entonces la ecuación del paso anterior queda:</p><div class="dev">$$\V{AC}-\Pe{AC}=(x+y,\;y-x)=(13,-9)$$</div><p>Igualamos componente a componente y resolvemos el sistema:</p><div class="dev">$$\begin{aligned}x+y&=13\\ y-x&=-9\end{aligned}$$</div><p>De aquí sale $y=2$ y $x=11$. Entonces $\V{AC}=(11,2)$.</p>`;
  DATOS.ejercicios[1].pasos[3].que = T`<p>Como $\V{AC}=\V{AB}+\V{BC}$, tenemos $\V{AB}=\V{AC}-\V{BC}=(11-9k,\;2+2k)$.</p><p>Imponemos $|\V{AB}|^2=20$:</p><div class="dev">$$\begin{aligned}(11-9k)^2+(2+2k)^2&=20\\ 17k^2-38k+21&=0\end{aligned}$$</div><p>Resulta $k=1$ o $k=\tfrac{21}{17}$.</p>`;
  DATOS.ejercicios[2].pasos[5].que = T`<p>Sea $\V{BF}=(p,q)$. Tenemos dos datos.</p><p>El ángulo con $\V{BE}$ es $\theta$:</p><div class="dev">$$\V{BF}\cdot\V{BE}=|BF||BE|\cos\theta=4\sqrt2\cdot2\sqrt{29}\cdot\tfrac{7}{\sqrt{58}}=56\ \Rightarrow\ 10p+4q=56$$</div><p>Y la longitud:</p><div class="dev">$$p^2+q^2=32$$</div><p>Despejando $q=14-\frac52p$ y sustituyendo queda $29p^2-280p+656=0$, con soluciones $p=4$ y $p=\frac{164}{29}$. Los dos vectores posibles son $\V{BF}=(4,4)$ y $\V{BF}=\left(\frac{164}{29},-\frac{4}{29}\right)$.</p>`;

  /* Ya no existe la página «Herramientas»: las menciones «herramienta N» se cambian por el nombre de la fórmula */
  (function () {
    const R = [
      ['(Herramientas 1 y 6) ', ''], ['(Herramienta 6) ', ''],
      ['Con la herramienta 3, $\\tan', 'Con la fórmula de la tangente entre vectores, $\\tan'],
      ['Con la herramienta 3:', 'Con la fórmula del coseno entre vectores:'],
      ['Con la herramienta 6, «obtuso', 'Con el criterio de descarte, «obtuso'],
      ['Con la herramienta 2, $\\operatorname', 'Con la fórmula de la proyección, $\\operatorname'],
      ['(herramienta 5)', '(criterio AA)'],
      ['Con la herramienta 6 esto se escribe', 'Con el criterio de orientación esto se escribe'],
      ['Conviene repasar la herramienta 3.', 'Conviene repasar el ángulo entre vectores.']
    ];
    function arreglar(o) {
      if (typeof o === 'string') { let t = o; R.forEach(function (r) { t = t.split(r[0]).join(r[1]) }); return t.replace(/Ejercicio (\d)/g, 'Pregunta $1').replace(/del ejercicio (\d)/g, 'de la pregunta $1') }
      if (Array.isArray(o)) { for (let i = 0; i < o.length; i++)o[i] = arreglar(o[i]); return o }
      if (o && typeof o === 'object') { Object.keys(o).forEach(function (k) { o[k] = arreglar(o[k]) }); return o }
      return o;
    }
    arreglar(DATOS.ejercicios); arreglar(DATOS.tips);
  })();

  const P1POOL = [{ "a": 7, "b": 1, "c": 0, "d": -10, "u": [4, -3], "D0": 2, "t": 2, "t2": [6, 5], "tg": [7, 1], "tb": [1, 1], "mn": [4, 3], "AP": [14, -8], "AC": [14, 2], "AP2": [8.4, -8.8], "nu": 5, "dirB": [1, 1], "h": 25, "k0": -40 }, { "a": 8, "b": 1, "c": -3, "d": -6, "u": [3, -4], "D0": 1, "t": 1, "t2": [5, 7], "tg": [3, 2], "tb": [7, 4], "mn": [2, 1], "AP": [5, -5], "AC": [8, 1], "AP2": [2.7142857142857144, -5.285714285714286], "nu": 5, "dirB": [4, 7], "h": 35, "k0": -30 }, { "a": 13, "b": 9, "c": -4, "d": -12, "u": [4, -3], "D0": 3, "t": 1, "t2": [3, 5], "tg": [3, 4], "tb": [3, 1], "mn": [3, 1], "AP": [9, -3], "AC": [13, 9], "AP2": [3.8, -6.6], "nu": 5, "dirB": [1, 3], "h": 75, "k0": -60 }, { "a": 5, "b": 1, "c": -1, "d": -8, "u": [5, -12], "D0": 1, "t": 1, "t2": [3, 5], "tg": [3, 1], "tb": [5, 1], "mn": [4, 7], "AP": [4, -7], "AC": [5, 1], "AP2": [2.0, -7.4], "nu": 13, "dirB": [1, 5], "h": 65, "k0": -52 }, { "a": 1, "b": 11, "c": 8, "d": -8, "u": [1, 0], "D0": 3, "t": 1, "t2": [5, 11], "tg": [6, 5], "tb": [11, 1], "mn": [1, 1], "AP": [9, 3], "AC": [1, 11], "AP2": [8.454545454545455, -3.0], "nu": 1, "dirB": [1, 11], "h": 11, "k0": -8 }, { "a": 7, "b": 4, "c": -10, "d": -10, "u": [3, -4], "D0": 2, "t": 2, "t2": [3, 2], "tg": [3, 11], "tb": [8, 1], "mn": [7, 1], "AP": [4, -2], "AC": [14, 8], "AP2": [0.5, -4.0], "nu": 5, "dirB": [1, 8], "h": 40, "k0": -70 }, { "a": 4, "b": 7, "c": -1, "d": -5, "u": [12, -5], "D0": 3, "t": 1, "t2": [1, 4], "tg": [1, 3], "tb": [8, 1], "mn": [5, 1], "AP": [3, 2], "AC": [4, 7], "AP2": [0.0, -3.25], "nu": 13, "dirB": [1, 8], "h": 104, "k0": -65 }, { "a": 1, "b": 11, "c": 10, "d": -10, "u": [1, 0], "D0": 1, "t": 1, "t2": [9, 11], "tg": [6, 5], "tb": [11, 1], "mn": [1, 1], "AP": [11, 1], "AC": [1, 11], "AP2": [10.818181818181818, -1.0], "nu": 1, "dirB": [1, 11], "h": 11, "k0": -10 }, { "a": 5, "b": 13, "c": 11, "d": -11, "u": [1, 0], "D0": 2, "t": 1, "t2": [9, 13], "tg": [9, 4], "tb": [13, 5], "mn": [1, 1], "AP": [16, 2], "AC": [5, 13], "AP2": [14.461538461538462, -2.0], "nu": 1, "dirB": [5, 13], "h": 13, "k0": -11 }, { "a": 3, "b": 1, "c": 0, "d": -2, "u": [4, -3], "D0": 1, "t": 1, "t2": [3, 13], "tg": [3, 1], "tb": [13, 9], "mn": [4, 3], "AP": [3, -1], "AC": [3, 1], "AP2": [0.6923076923076923, -1.7692307692307692], "nu": 5, "dirB": [9, 13], "h": 13, "k0": -8 }, { "a": 14, "b": 3, "c": -5, "d": -10, "u": [3, -4], "D0": 3, "t": 1, "t2": [7, 13], "tg": [5, 4], "tb": [13, 6], "mn": [2, 1], "AP": [9, -7], "AC": [14, 3], "AP2": [2.5384615384615383, -8.384615384615385], "nu": 5, "dirB": [6, 13], "h": 65, "k0": -50 }, { "a": 7, "b": 1, "c": -1, "d": -3, "u": [4, -3], "D0": 2, "t": 1, "t2": [1, 5], "tg": [2, 1], "tb": [1, 1], "mn": [3, 1], "AP": [6, -2], "AC": [7, 1], "AP2": [0.4, -2.8], "nu": 5, "dirB": [1, 1], "h": 25, "k0": -15 }, { "a": 7, "b": 4, "c": -2, "d": -9, "u": [3, -4], "D0": 1, "t": 1, "t2": [3, 4], "tg": [11, 10], "tb": [8, 1], "mn": [7, 6], "AP": [5, -5], "AC": [7, 4], "AP2": [3.25, -6.0], "nu": 5, "dirB": [1, 8], "h": 40, "k0": -35 }, { "a": 9, "b": 2, "c": 0, "d": -5, "u": [4, -3], "D0": 3, "t": 1, "t2": [1, 7], "tg": [9, 2], "tb": [7, 6], "mn": [4, 3], "AP": [9, -3], "AC": [9, 2], "AP2": [1.2857142857142858, -4.714285714285714], "nu": 5, "dirB": [6, 7], "h": 35, "k0": -20 }, { "a": 5, "b": 3, "c": 2, "d": -6, "u": [1, 0], "D0": 3, "t": 3, "t2": [1, 1], "tg": [9, 2], "tb": [3, 5], "mn": [3, 1], "AP": [17, 3], "AC": [15, 9], "AP2": [7.0, -3.0], "nu": 1, "dirB": [5, 3], "h": 3, "k0": -6 }, { "a": 3, "b": 1, "c": -5, "d": -5, "u": [3, -4], "D0": 2, "t": 3, "t2": [5, 3], "tg": [1, 2], "tb": [3, 1], "mn": [7, 1], "AP": [4, -2], "AC": [9, 3], "AP2": [0.0, -3.3333333333333335], "nu": 5, "dirB": [1, 3], "h": 15, "k0": -35 }, { "a": 14, "b": 5, "c": 1, "d": -8, "u": [12, -5], "D0": 3, "t": 1, "t2": [2, 5], "tg": [9, 2], "tb": [10, 11], "mn": [7, 4], "AP": [15, -3], "AC": [14, 5], "AP2": [6.6, -6.0], "nu": 13, "dirB": [11, 10], "h": 130, "k0": -91 }, { "a": 4, "b": 3, "c": 4, "d": -8, "u": [1, 0], "D0": 1, "t": 3, "t2": [7, 3], "tg": [11, 2], "tb": [3, 4], "mn": [2, 1], "AP": [16, 1], "AC": [12, 9], "AP2": [13.333333333333334, -1.0], "nu": 1, "dirB": [4, 3], "h": 3, "k0": -8 }, { "a": 4, "b": 5, "c": 8, "d": -8, "u": [1, 0], "D0": 2, "t": 2, "t2": [6, 5], "tg": [9, 1], "tb": [5, 4], "mn": [1, 1], "AP": [16, 2], "AC": [8, 10], "AP2": [12.8, -2.0], "nu": 1, "dirB": [4, 5], "h": 5, "k0": -8 }, { "a": 11, "b": 3, "c": 0, "d": -10, "u": [4, -3], "D0": 1, "t": 1, "t2": [7, 9], "tg": [11, 3], "tb": [9, 7], "mn": [4, 3], "AP": [11, -7], "AC": [11, 3], "AP2": [8.555555555555555, -7.666666666666667], "nu": 5, "dirB": [7, 9], "h": 45, "k0": -40 }, { "a": 3, "b": 1, "c": -3, "d": -11, "u": [3, -4], "D0": 3, "t": 4, "t2": [2, 1], "tg": [3, 2], "tb": [3, 1], "mn": [9, 7], "AP": [9, -7], "AC": [12, 4], "AP2": [3.0, -9.0], "nu": 5, "dirB": [1, 3], "h": 15, "k0": -45 }, { "a": 7, "b": 4, "c": -5, "d": -5, "u": [3, -4], "D0": 1, "t": 1, "t2": [3, 4], "tg": [3, 11], "tb": [8, 1], "mn": [7, 1], "AP": [2, -1], "AC": [7, 4], "AP2": [0.25, -2.0], "nu": 5, "dirB": [1, 8], "h": 40, "k0": -35 }, { "a": 7, "b": 1, "c": -4, "d": -12, "u": [4, -3], "D0": 3, "t": 3, "t2": [9, 5], "tg": [2, 1], "tb": [1, 1], "mn": [3, 1], "AP": [17, -9], "AC": [21, 3], "AP2": [8.6, -10.2], "nu": 5, "dirB": [1, 1], "h": 25, "k0": -60 }, { "a": 1, "b": 4, "c": 10, "d": -5, "u": [1, 0], "D0": 3, "t": 2, "t2": [1, 2], "tg": [9, 2], "tb": [4, 1], "mn": [1, 2], "AP": [12, 3], "AC": [2, 8], "AP2": [10.5, -3.0], "nu": 1, "dirB": [1, 4], "h": 4, "k0": -5 }, { "a": 7, "b": 4, "c": -3, "d": -6, "u": [3, -4], "D0": 2, "t": 1, "t2": [1, 2], "tg": [2, 3], "tb": [8, 1], "mn": [2, 1], "AP": [4, -2], "AC": [7, 4], "AP2": [0.5, -4.0], "nu": 5, "dirB": [1, 8], "h": 40, "k0": -30 }, { "a": 3, "b": 4, "c": 3, "d": -11, "u": [1, 0], "D0": 1, "t": 3, "t2": [5, 2], "tg": [9, 7], "tb": [4, 3], "mn": [11, 3], "AP": [12, 1], "AC": [9, 12], "AP2": [10.5, -1.0], "nu": 1, "dirB": [3, 4], "h": 4, "k0": -11 }, { "a": 3, "b": 4, "c": 2, "d": -2, "u": [1, 0], "D0": 2, "t": 1, "t2": [0, 1], "tg": [7, 1], "tb": [4, 3], "mn": [1, 1], "AP": [5, 2], "AC": [3, 4], "AP2": [2.0, -2.0], "nu": 1, "dirB": [3, 4], "h": 4, "k0": -2 }, { "a": 7, "b": 6, "c": 0, "d": -10, "u": [4, -3], "D0": 1, "t": 1, "t2": [7, 9], "tg": [7, 6], "tb": [9, 2], "mn": [4, 3], "AP": [7, -4], "AC": [7, 6], "AP2": [5.444444444444445, -5.333333333333333], "nu": 5, "dirB": [2, 9], "h": 45, "k0": -40 }, { "a": 3, "b": 1, "c": -6, "d": -7, "u": [3, -4], "D0": 3, "t": 4, "t2": [2, 1], "tg": [3, 5], "tb": [3, 1], "mn": [9, 2], "AP": [6, -3], "AC": [12, 4], "AP2": [0.0, -5.0], "nu": 5, "dirB": [1, 3], "h": 15, "k0": -45 }, { "a": 3, "b": 1, "c": 2, "d": -11, "u": [3, -4], "D0": 1, "t": 2, "t2": [4, 3], "tg": [7, 1], "tb": [3, 1], "mn": [1, 2], "AP": [8, -9], "AC": [6, 2], "AP2": [6.0, -9.666666666666666], "nu": 5, "dirB": [1, 3], "h": 15, "k0": -25 }, { "a": 2, "b": 11, "c": 4, "d": -8, "u": [1, 0], "D0": 3, "t": 1, "t2": [5, 11], "tg": [3, 4], "tb": [11, 2], "mn": [2, 1], "AP": [6, 3], "AC": [2, 11], "AP2": [4.909090909090909, -3.0], "nu": 1, "dirB": [2, 11], "h": 11, "k0": -8 }, { "a": 3, "b": 8, "c": 7, "d": -7, "u": [1, 0], "D0": 1, "t": 1, "t2": [3, 4], "tg": [11, 5], "tb": [8, 3], "mn": [1, 1], "AP": [10, 1], "AC": [3, 8], "AP2": [9.25, -1.0], "nu": 1, "dirB": [3, 8], "h": 8, "k0": -7 }, { "a": 3, "b": 7, "c": 12, "d": -12, "u": [1, 0], "D0": 2, "t": 2, "t2": [10, 7], "tg": [5, 2], "tb": [7, 3], "mn": [1, 1], "AP": [18, 2], "AC": [6, 14], "AP2": [16.285714285714285, -2.0], "nu": 1, "dirB": [3, 7], "h": 7, "k0": -12 }, { "a": 7, "b": 1, "c": -3, "d": -9, "u": [4, -3], "D0": 1, "t": 2, "t2": [8, 5], "tg": [2, 1], "tb": [1, 1], "mn": [3, 1], "AP": [11, -7], "AC": [14, 2], "AP2": [8.2, -7.4], "nu": 5, "dirB": [1, 1], "h": 25, "k0": -45 }, { "a": 2, "b": 1, "c": -4, "d": -4, "u": [3, -4], "D0": 1, "t": 3, "t2": [23, 11], "tg": [1, 3], "tb": [11, 2], "mn": [7, 1], "AP": [2, -1], "AC": [6, 3], "AP2": [0.18181818181818182, -1.9090909090909092], "nu": 5, "dirB": [2, 11], "h": 11, "k0": -28 }, { "a": 7, "b": 9, "c": 2, "d": -6, "u": [1, 0], "D0": 3, "t": 1, "t2": [1, 3], "tg": [3, 2], "tb": [9, 7], "mn": [3, 1], "AP": [9, 3], "AC": [7, 9], "AP2": [4.333333333333333, -3.0], "nu": 1, "dirB": [7, 9], "h": 9, "k0": -6 }, { "a": 1, "b": 2, "c": 5, "d": -5, "u": [1, 0], "D0": 1, "t": 3, "t2": [2, 1], "tg": [3, 1], "tb": [2, 1], "mn": [1, 1], "AP": [8, 1], "AC": [3, 6], "AP2": [7.0, -1.0], "nu": 1, "dirB": [1, 2], "h": 2, "k0": -5 }, { "a": 2, "b": 3, "c": 5, "d": -10, "u": [1, 0], "D0": 2, "t": 4, "t2": [8, 3], "tg": [7, 4], "tb": [3, 2], "mn": [2, 1], "AP": [13, 2], "AC": [8, 12], "AP2": [10.333333333333334, -2.0], "nu": 1, "dirB": [2, 3], "h": 3, "k0": -10 }, { "a": 3, "b": 1, "c": -1, "d": -7, "u": [3, -4], "D0": 1, "t": 2, "t2": [4, 3], "tg": [2, 1], "tb": [3, 1], "mn": [1, 1], "AP": [5, -5], "AC": [6, 2], "AP2": [3.0, -5.666666666666667], "nu": 5, "dirB": [1, 3], "h": 15, "k0": -25 }, { "a": 2, "b": 3, "c": 6, "d": -6, "u": [1, 0], "D0": 3, "t": 3, "t2": [1, 1], "tg": [5, 1], "tb": [3, 2], "mn": [1, 1], "AP": [12, 3], "AC": [6, 9], "AP2": [8.0, -3.0], "nu": 1, "dirB": [2, 3], "h": 3, "k0": -6 }, { "a": 1, "b": 2, "c": 2, "d": -3, "u": [1, 0], "D0": 1, "t": 2, "t2": [1, 1], "tg": [7, 4], "tb": [2, 1], "mn": [3, 2], "AP": [4, 1], "AC": [2, 4], "AP2": [3.0, -1.0], "nu": 1, "dirB": [1, 2], "h": 2, "k0": -3 }, { "a": 1, "b": 3, "c": 5, "d": -7, "u": [1, 0], "D0": 2, "t": 3, "t2": [5, 3], "tg": [11, 8], "tb": [3, 1], "mn": [7, 5], "AP": [8, 2], "AC": [3, 9], "AP2": [6.666666666666667, -2.0], "nu": 1, "dirB": [1, 3], "h": 3, "k0": -7 }, { "a": 1, "b": 5, "c": 6, "d": -2, "u": [1, 0], "D0": 3, "t": 1, "t2": [-1, 5], "tg": [8, 1], "tb": [5, 1], "mn": [1, 3], "AP": [7, 3], "AC": [1, 5], "AP2": [5.8, -3.0], "nu": 1, "dirB": [1, 5], "h": 5, "k0": -2 }, { "a": 1, "b": 2, "c": 2, "d": -7, "u": [1, 0], "D0": 1, "t": 4, "t2": [3, 1], "tg": [11, 12], "tb": [2, 1], "mn": [7, 2], "AP": [6, 1], "AC": [4, 8], "AP2": [5.0, -1.0], "nu": 1, "dirB": [1, 2], "h": 2, "k0": -7 }, { "a": 9, "b": 7, "c": 1, "d": -5, "u": [1, 0], "D0": 2, "t": 1, "t2": [3, 7], "tg": [2, 1], "tb": [7, 9], "mn": [5, 1], "AP": [10, 2], "AC": [9, 7], "AP2": [4.857142857142857, -2.0], "nu": 1, "dirB": [9, 7], "h": 7, "k0": -5 }, { "a": 2, "b": 5, "c": 12, "d": -12, "u": [1, 0], "D0": 3, "t": 3, "t2": [9, 5], "tg": [7, 3], "tb": [5, 2], "mn": [1, 1], "AP": [18, 3], "AC": [6, 15], "AP2": [15.6, -3.0], "nu": 1, "dirB": [2, 5], "h": 5, "k0": -12 }, { "a": 14, "b": 13, "c": 4, "d": -12, "u": [1, 0], "D0": 1, "t": 1, "t2": [11, 13], "tg": [11, 5], "tb": [13, 14], "mn": [3, 1], "AP": [18, 1], "AC": [14, 13], "AP2": [15.846153846153847, -1.0], "nu": 1, "dirB": [14, 13], "h": 13, "k0": -12 }, { "a": 11, "b": 7, "c": 4, "d": -12, "u": [1, 0], "D0": 2, "t": 2, "t2": [10, 7], "tg": [4, 1], "tb": [7, 11], "mn": [3, 1], "AP": [26, 2], "AC": [22, 14], "AP2": [19.714285714285715, -2.0], "nu": 1, "dirB": [11, 7], "h": 7, "k0": -12 }, { "a": 3, "b": 5, "c": 1, "d": -2, "u": [1, 0], "D0": 3, "t": 1, "t2": [-1, 5], "tg": [11, 7], "tb": [5, 3], "mn": [2, 1], "AP": [4, 3], "AC": [3, 5], "AP2": [0.4, -3.0], "nu": 1, "dirB": [3, 5], "h": 5, "k0": -2 }, { "a": 1, "b": 7, "c": 6, "d": -6, "u": [1, 0], "D0": 1, "t": 1, "t2": [5, 7], "tg": [4, 3], "tb": [7, 1], "mn": [1, 1], "AP": [7, 1], "AC": [1, 7], "AP2": [6.714285714285714, -1.0], "nu": 1, "dirB": [1, 7], "h": 7, "k0": -6 }, { "a": 8, "b": 11, "c": 3, "d": -9, "u": [1, 0], "D0": 2, "t": 1, "t2": [7, 11], "tg": [7, 5], "tb": [11, 8], "mn": [3, 1], "AP": [11, 2], "AC": [8, 11], "AP2": [8.090909090909092, -2.0], "nu": 1, "dirB": [8, 11], "h": 11, "k0": -9 }, { "a": 9, "b": 13, "c": 10, "d": -10, "u": [1, 0], "D0": 3, "t": 1, "t2": [7, 13], "tg": [11, 2], "tb": [13, 9], "mn": [1, 1], "AP": [19, 3], "AC": [9, 13], "AP2": [14.846153846153847, -3.0], "nu": 1, "dirB": [9, 13], "h": 13, "k0": -10 }, { "a": 1, "b": 3, "c": 3, "d": -2, "u": [1, 0], "D0": 1, "t": 1, "t2": [1, 3], "tg": [11, 3], "tb": [3, 1], "mn": [2, 3], "AP": [4, 1], "AC": [1, 3], "AP2": [3.3333333333333335, -1.0], "nu": 1, "dirB": [1, 3], "h": 3, "k0": -2 }, { "a": 9, "b": 7, "c": 5, "d": -12, "u": [1, 0], "D0": 2, "t": 2, "t2": [10, 7], "tg": [11, 3], "tb": [7, 9], "mn": [12, 5], "AP": [23, 2], "AC": [18, 14], "AP2": [17.857142857142858, -2.0], "nu": 1, "dirB": [9, 7], "h": 7, "k0": -12 }, { "a": 4, "b": 5, "c": 12, "d": -12, "u": [1, 0], "D0": 3, "t": 3, "t2": [9, 5], "tg": [9, 1], "tb": [5, 4], "mn": [1, 1], "AP": [24, 3], "AC": [12, 15], "AP2": [19.2, -3.0], "nu": 1, "dirB": [4, 5], "h": 5, "k0": -12 }, { "a": 6, "b": 13, "c": 6, "d": -12, "u": [1, 0], "D0": 1, "t": 1, "t2": [11, 13], "tg": [5, 4], "tb": [13, 6], "mn": [2, 1], "AP": [12, 1], "AC": [6, 13], "AP2": [11.076923076923077, -1.0], "nu": 1, "dirB": [6, 13], "h": 13, "k0": -12 }, { "a": 7, "b": 6, "c": 2, "d": -4, "u": [1, 0], "D0": 2, "t": 1, "t2": [1, 3], "tg": [4, 1], "tb": [6, 7], "mn": [2, 1], "AP": [9, 2], "AC": [7, 6], "AP2": [4.333333333333333, -2.0], "nu": 1, "dirB": [7, 6], "h": 6, "k0": -4 }, { "a": 1, "b": 7, "c": 2, "d": -11, "u": [1, 0], "D0": 3, "t": 2, "t2": [8, 7], "tg": [1, 3], "tb": [7, 1], "mn": [11, 2], "AP": [4, 3], "AC": [2, 14], "AP2": [3.142857142857143, -3.0], "nu": 1, "dirB": [1, 7], "h": 7, "k0": -11 }, { "a": 1, "b": 3, "c": 8, "d": -8, "u": [1, 0], "D0": 1, "t": 3, "t2": [7, 3], "tg": [2, 1], "tb": [3, 1], "mn": [1, 1], "AP": [11, 1], "AC": [3, 9], "AP2": [10.333333333333334, -1.0], "nu": 1, "dirB": [1, 3], "h": 3, "k0": -8 }, { "a": 6, "b": 7, "c": 3, "d": -5, "u": [1, 0], "D0": 2, "t": 1, "t2": [3, 7], "tg": [3, 1], "tb": [7, 6], "mn": [5, 3], "AP": [9, 2], "AC": [6, 7], "AP2": [5.571428571428571, -2.0], "nu": 1, "dirB": [6, 7], "h": 7, "k0": -5 }, { "a": 4, "b": 7, "c": 4, "d": -4, "u": [1, 0], "D0": 3, "t": 1, "t2": [1, 7], "tg": [11, 3], "tb": [7, 4], "mn": [1, 1], "AP": [8, 3], "AC": [4, 7], "AP2": [4.571428571428571, -3.0], "nu": 1, "dirB": [4, 7], "h": 7, "k0": -4 }, { "a": 4, "b": 3, "c": 1, "d": -8, "u": [1, 0], "D0": 1, "t": 3, "t2": [7, 3], "tg": [7, 4], "tb": [3, 4], "mn": [8, 1], "AP": [13, 1], "AC": [12, 9], "AP2": [10.333333333333334, -1.0], "nu": 1, "dirB": [4, 3], "h": 3, "k0": -8 }, { "a": 1, "b": 6, "c": 2, "d": -4, "u": [1, 0], "D0": 2, "t": 1, "t2": [1, 3], "tg": [8, 11], "tb": [6, 1], "mn": [2, 1], "AP": [3, 2], "AC": [1, 6], "AP2": [2.3333333333333335, -2.0], "nu": 1, "dirB": [1, 6], "h": 6, "k0": -4 }, { "a": 7, "b": 4, "c": 3, "d": -9, "u": [1, 0], "D0": 3, "t": 3, "t2": [3, 2], "tg": [5, 1], "tb": [4, 7], "mn": [3, 1], "AP": [24, 3], "AC": [21, 12], "AP2": [13.5, -3.0], "nu": 1, "dirB": [7, 4], "h": 4, "k0": -9 }, { "a": 3, "b": 2, "c": 1, "d": -3, "u": [1, 0], "D0": 1, "t": 2, "t2": [1, 1], "tg": [11, 3], "tb": [2, 3], "mn": [3, 1], "AP": [7, 1], "AC": [6, 4], "AP2": [4.0, -1.0], "nu": 1, "dirB": [3, 2], "h": 2, "k0": -3 }, { "a": 2, "b": 5, "c": 3, "d": -3, "u": [1, 0], "D0": 2, "t": 1, "t2": [1, 5], "tg": [7, 3], "tb": [5, 2], "mn": [1, 1], "AP": [5, 2], "AC": [2, 5], "AP2": [3.4, -2.0], "nu": 1, "dirB": [2, 5], "h": 5, "k0": -3 }, { "a": 1, "b": 3, "c": 7, "d": -9, "u": [1, 0], "D0": 3, "t": 4, "t2": [2, 1], "tg": [3, 2], "tb": [3, 1], "mn": [9, 7], "AP": [11, 3], "AC": [4, 12], "AP2": [9.0, -3.0], "nu": 1, "dirB": [1, 3], "h": 3, "k0": -9 }, { "a": 1, "b": 13, "c": 6, "d": -12, "u": [1, 0], "D0": 1, "t": 1, "t2": [11, 13], "tg": [3, 5], "tb": [13, 1], "mn": [2, 1], "AP": [7, 1], "AC": [1, 13], "AP2": [6.846153846153846, -1.0], "nu": 1, "dirB": [1, 13], "h": 13, "k0": -12 }, { "a": 1, "b": 6, "c": 5, "d": -10, "u": [1, 0], "D0": 2, "t": 2, "t2": [4, 3], "tg": [8, 11], "tb": [6, 1], "mn": [2, 1], "AP": [7, 2], "AC": [2, 12], "AP2": [6.333333333333333, -2.0], "nu": 1, "dirB": [1, 6], "h": 6, "k0": -10 }, { "a": 5, "b": 14, "c": 7, "d": -11, "u": [1, 0], "D0": 3, "t": 1, "t2": [4, 7], "tg": [9, 7], "tb": [14, 5], "mn": [11, 7], "AP": [12, 3], "AC": [5, 14], "AP2": [9.857142857142858, -3.0], "nu": 1, "dirB": [5, 14], "h": 14, "k0": -11 }, { "a": 1, "b": 5, "c": 2, "d": -4, "u": [1, 0], "D0": 1, "t": 1, "t2": [3, 5], "tg": [7, 9], "tb": [5, 1], "mn": [2, 1], "AP": [3, 1], "AC": [1, 5], "AP2": [2.6, -1.0], "nu": 1, "dirB": [1, 5], "h": 5, "k0": -4 }, { "a": 1, "b": 7, "c": 10, "d": -5, "u": [1, 0], "D0": 2, "t": 1, "t2": [3, 7], "tg": [3, 1], "tb": [7, 1], "mn": [1, 2], "AP": [11, 2], "AC": [1, 7], "AP2": [10.428571428571429, -2.0], "nu": 1, "dirB": [1, 7], "h": 7, "k0": -5 }];
  const P2POOL = [{ "w": [-4, -1], "k1": 2, "k2": 4, "AC": [-11, -7], "AB": [-3, -5], "BC": [-8, -2], "L2": 34, "p": [-6, -10], "DA": [16, 4], "DC": [5, -3], "DC2": [11, -27] }, { "w": [-3, -2], "k1": 2, "k2": 4, "AC": [-7, -9], "AB": [-1, -5], "BC": [-6, -4], "L2": 26, "p": [-2, -10], "DA": [12, 8], "DC": [5, -1], "DC2": [17, -19] }, { "w": [-3, -1], "k1": 1, "k2": 3, "AC": [-3, -11], "AB": [0, -10], "BC": [-3, -1], "L2": 100, "p": [0, -11], "DA": [11, 9], "DC": [8, -2], "DC2": [5, -10] }, { "w": [-3, -1], "k1": 1, "k2": 5, "AC": [-8, -6], "AB": [-5, -5], "BC": [-3, -1], "L2": 50, "p": [-7, -7], "DA": [15, 1], "DC": [7, -5], "DC2": [19, -17] }, { "w": [-3, -1], "k1": 1, "k2": 5, "AC": [-7, -9], "AB": [-4, -8], "BC": [-3, -1], "L2": 80, "p": [-5, -10], "DA": [15, 5], "DC": [8, -4], "DC2": [14, -22] }, { "w": [-3, -1], "k1": 2, "k2": 4, "AC": [-8, -6], "AB": [-2, -4], "BC": [-6, -2], "L2": 20, "p": [-4, -8], "DA": [12, 4], "DC": [4, -2], "DC2": [10, -20] }, { "w": [-3, -1], "k1": 2, "k2": 4, "AC": [-6, -12], "AB": [0, -10], "BC": [-6, -2], "L2": 100, "p": [0, -12], "DA": [12, 8], "DC": [6, -4], "DC2": [4, -16] }, { "w": [-3, -1], "k1": 2, "k2": 6, "AC": [-11, -7], "AB": [-5, -5], "BC": [-6, -2], "L2": 50, "p": [-9, -9], "DA": [20, 2], "DC": [9, -5], "DC2": [22, -21] }, { "w": [-3, -1], "k1": 3, "k2": 5, "AC": [-11, -7], "AB": [-2, -4], "BC": [-9, -3], "L2": 20, "p": [-5, -10], "DA": [15, 5], "DC": [4, -2], "DC2": [12, -26] }, { "w": [-3, 1], "k1": 1, "k2": 3, "AC": [-7, -1], "AB": [-4, -2], "BC": [-3, 1], "L2": 20, "p": [-6, -3], "DA": [9, -3], "DC": [2, -4], "DC2": [-2, -16] }, { "w": [-3, 1], "k1": 1, "k2": 3, "AC": [-8, -4], "AB": [-5, -5], "BC": [-3, 1], "L2": 50, "p": [-6, -6], "DA": [11, -1], "DC": [3, -5], "DC2": [-3, -13] }, { "w": [-3, 1], "k1": 1, "k2": 5, "AC": [-11, -3], "AB": [-8, -4], "BC": [-3, 1], "L2": 80, "p": [-10, -5], "DA": [15, -5], "DC": [4, -8], "DC2": [-2, -26] }, { "w": [-3, 1], "k1": 2, "k2": 4, "AC": [-11, -3], "AB": [-5, -5], "BC": [-6, 2], "L2": 50, "p": [-7, -7], "DA": [12, -2], "DC": [1, -5], "DC2": [-7, -18] }, { "w": [-3, 2], "k1": 2, "k2": 4, "AC": [-11, 3], "AB": [-5, -1], "BC": [-6, 4], "L2": 26, "p": [-10, -2], "DA": [12, -8], "DC": [1, -5], "DC2": [-11, -23] }, { "w": [-2, -3], "k1": 2, "k2": 4, "AC": [-3, -11], "AB": [1, -5], "BC": [-4, -6], "L2": 26, "p": [2, -10], "DA": [8, 12], "DC": [5, 1], "DC2": [23, -11] }, { "w": [-2, -1], "k1": 1, "k2": 3, "AC": [-2, -6], "AB": [0, -5], "BC": [-2, -1], "L2": 25, "p": [0, -6], "DA": [6, 5], "DC": [4, -1], "DC2": [4, -8] }, { "w": [-2, -1], "k1": 2, "k2": 4, "AC": [-4, -7], "AB": [0, -5], "BC": [-4, -2], "L2": 25, "p": [0, -7], "DA": [7, 5], "DC": [3, -2], "DC2": [5, -12] }, { "w": [-2, -1], "k1": 2, "k2": 6, "AC": [-6, -8], "AB": [-2, -6], "BC": [-4, -2], "L2": 40, "p": [-3, -9], "DA": [12, 6], "DC": [6, -2], "DC2": [14, -18] }, { "w": [-2, -1], "k1": 3, "k2": 5, "AC": [-6, -8], "AB": [0, -5], "BC": [-6, -3], "L2": 25, "p": [0, -8], "DA": [8, 5], "DC": [2, -3], "DC2": [6, -17] }, { "w": [-2, 1], "k1": 1, "k2": 5, "AC": [-7, 1], "AB": [-5, 0], "BC": [-2, 1], "L2": 25, "p": [-7, 0], "DA": [8, -7], "DC": [1, -6], "DC2": [1, -18] }, { "w": [-2, 1], "k1": 2, "k2": 4, "AC": [-7, 1], "AB": [-3, -1], "BC": [-4, 2], "L2": 10, "p": [-6, -2], "DA": [8, -4], "DC": [1, -3], "DC2": [-5, -15] }, { "w": [-2, 1], "k1": 2, "k2": 4, "AC": [-9, -3], "AB": [-5, -5], "BC": [-4, 2], "L2": 50, "p": [-6, -6], "DA": [10, -2], "DC": [1, -5], "DC2": [-5, -10] }, { "w": [-2, 1], "k1": 2, "k2": 6, "AC": [-9, 2], "AB": [-5, 0], "BC": [-4, 2], "L2": 25, "p": [-9, 0], "DA": [11, -9], "DC": [2, -7], "DC2": [0, -22] }, { "w": [-2, 1], "k1": 3, "k2": 7, "AC": [-11, 3], "AB": [-5, 0], "BC": [-6, 3], "L2": 25, "p": [-11, 0], "DA": [14, -11], "DC": [3, -8], "DC2": [0, -26] }, { "w": [-2, 3], "k1": 2, "k2": 4, "AC": [-9, 7], "AB": [-5, 1], "BC": [-4, 6], "L2": 26, "p": [-10, 2], "DA": [8, -12], "DC": [-1, -5], "DC2": [-19, -17] }, { "w": [-1, -3], "k1": 1, "k2": 3, "AC": [1, -7], "AB": [2, -4], "BC": [-1, -3], "L2": 20, "p": [3, -6], "DA": [3, 9], "DC": [4, 2], "DC2": [16, -2] }, { "w": [-1, -3], "k1": 1, "k2": 3, "AC": [4, -8], "AB": [5, -5], "BC": [-1, -3], "L2": 50, "p": [6, -6], "DA": [1, 11], "DC": [5, 3], "DC2": [13, -3] }, { "w": [-1, -3], "k1": 1, "k2": 5, "AC": [3, -11], "AB": [4, -8], "BC": [-1, -3], "L2": 80, "p": [5, -10], "DA": [5, 15], "DC": [8, 4], "DC2": [26, -2] }, { "w": [-1, -3], "k1": 2, "k2": 4, "AC": [3, -11], "AB": [5, -5], "BC": [-2, -6], "L2": 50, "p": [7, -7], "DA": [2, 12], "DC": [5, 1], "DC2": [18, -7] }, { "w": [-1, -2], "k1": 1, "k2": 5, "AC": [-1, -7], "AB": [0, -5], "BC": [-1, -2], "L2": 25, "p": [0, -7], "DA": [7, 8], "DC": [6, 1], "DC2": [18, 1] }, { "w": [-1, -2], "k1": 2, "k2": 4, "AC": [-1, -7], "AB": [1, -3], "BC": [-2, -4], "L2": 10, "p": [2, -6], "DA": [4, 8], "DC": [3, 1], "DC2": [15, -5] }, { "w": [-1, -2], "k1": 2, "k2": 4, "AC": [3, -9], "AB": [5, -5], "BC": [-2, -4], "L2": 50, "p": [6, -6], "DA": [2, 10], "DC": [5, 1], "DC2": [10, -5] }, { "w": [-1, -2], "k1": 2, "k2": 6, "AC": [-2, -9], "AB": [0, -5], "BC": [-2, -4], "L2": 25, "p": [0, -9], "DA": [9, 11], "DC": [7, 2], "DC2": [22, 0] }, { "w": [-1, -2], "k1": 3, "k2": 7, "AC": [-3, -11], "AB": [0, -5], "BC": [-3, -6], "L2": 25, "p": [0, -11], "DA": [11, 14], "DC": [8, 3], "DC2": [26, 0] }, { "w": [-1, 2], "k1": 1, "k2": 3, "AC": [-6, 2], "AB": [-5, 0], "BC": [-1, 2], "L2": 25, "p": [-6, 0], "DA": [5, -6], "DC": [-1, -4], "DC2": [-8, -4] }, { "w": [-1, 2], "k1": 2, "k2": 4, "AC": [-7, 4], "AB": [-5, 0], "BC": [-2, 4], "L2": 25, "p": [-7, 0], "DA": [5, -7], "DC": [-2, -3], "DC2": [-12, -5] }, { "w": [-1, 2], "k1": 2, "k2": 6, "AC": [-8, 6], "AB": [-6, 2], "BC": [-2, 4], "L2": 40, "p": [-9, 3], "DA": [6, -12], "DC": [-2, -6], "DC2": [-18, -14] }, { "w": [-1, 2], "k1": 3, "k2": 5, "AC": [-8, 6], "AB": [-5, 0], "BC": [-3, 6], "L2": 25, "p": [-8, 0], "DA": [5, -8], "DC": [-3, -2], "DC2": [-17, -6] }, { "w": [-1, 3], "k1": 1, "k2": 3, "AC": [-11, 3], "AB": [-10, 0], "BC": [-1, 3], "L2": 100, "p": [-11, 0], "DA": [9, -11], "DC": [-2, -8], "DC2": [-10, -5] }, { "w": [-1, 3], "k1": 1, "k2": 5, "AC": [-6, 8], "AB": [-5, 5], "BC": [-1, 3], "L2": 50, "p": [-7, 7], "DA": [1, -15], "DC": [-5, -7], "DC2": [-17, -19] }, { "w": [-1, 3], "k1": 1, "k2": 5, "AC": [-9, 7], "AB": [-8, 4], "BC": [-1, 3], "L2": 80, "p": [-10, 5], "DA": [5, -15], "DC": [-4, -8], "DC2": [-22, -14] }, { "w": [-1, 3], "k1": 2, "k2": 4, "AC": [-6, 8], "AB": [-4, 2], "BC": [-2, 6], "L2": 20, "p": [-8, 4], "DA": [4, -12], "DC": [-2, -4], "DC2": [-20, -10] }, { "w": [-1, 3], "k1": 2, "k2": 4, "AC": [-12, 6], "AB": [-10, 0], "BC": [-2, 6], "L2": 100, "p": [-12, 0], "DA": [8, -12], "DC": [-4, -6], "DC2": [-16, -4] }, { "w": [-1, 3], "k1": 2, "k2": 6, "AC": [-7, 11], "AB": [-5, 5], "BC": [-2, 6], "L2": 50, "p": [-9, 9], "DA": [2, -20], "DC": [-5, -9], "DC2": [-21, -22] }, { "w": [-1, 3], "k1": 3, "k2": 5, "AC": [-7, 11], "AB": [-4, 2], "BC": [-3, 9], "L2": 20, "p": [-10, 5], "DA": [5, -15], "DC": [-2, -4], "DC2": [-26, -12] }, { "w": [-1, 4], "k1": 2, "k2": 4, "AC": [-7, 11], "AB": [-5, 3], "BC": [-2, 8], "L2": 34, "p": [-10, 6], "DA": [4, -16], "DC": [-3, -5], "DC2": [-27, -11] }, { "w": [1, -4], "k1": 2, "k2": 4, "AC": [7, -11], "AB": [5, -3], "BC": [2, -8], "L2": 34, "p": [10, -6], "DA": [-4, 16], "DC": [3, 5], "DC2": [27, 11] }, { "w": [1, -3], "k1": 1, "k2": 3, "AC": [11, -3], "AB": [10, 0], "BC": [1, -3], "L2": 100, "p": [11, 0], "DA": [-9, 11], "DC": [2, 8], "DC2": [10, 5] }, { "w": [1, -3], "k1": 1, "k2": 5, "AC": [6, -8], "AB": [5, -5], "BC": [1, -3], "L2": 50, "p": [7, -7], "DA": [-1, 15], "DC": [5, 7], "DC2": [17, 19] }, { "w": [1, -3], "k1": 1, "k2": 5, "AC": [9, -7], "AB": [8, -4], "BC": [1, -3], "L2": 80, "p": [10, -5], "DA": [-5, 15], "DC": [4, 8], "DC2": [22, 14] }, { "w": [1, -3], "k1": 2, "k2": 4, "AC": [6, -8], "AB": [4, -2], "BC": [2, -6], "L2": 20, "p": [8, -4], "DA": [-4, 12], "DC": [2, 4], "DC2": [20, 10] }, { "w": [1, -3], "k1": 2, "k2": 4, "AC": [12, -6], "AB": [10, 0], "BC": [2, -6], "L2": 100, "p": [12, 0], "DA": [-8, 12], "DC": [4, 6], "DC2": [16, 4] }, { "w": [1, -3], "k1": 2, "k2": 6, "AC": [7, -11], "AB": [5, -5], "BC": [2, -6], "L2": 50, "p": [9, -9], "DA": [-2, 20], "DC": [5, 9], "DC2": [21, 22] }, { "w": [1, -3], "k1": 3, "k2": 5, "AC": [7, -11], "AB": [4, -2], "BC": [3, -9], "L2": 20, "p": [10, -5], "DA": [-5, 15], "DC": [2, 4], "DC2": [26, 12] }, { "w": [1, -2], "k1": 1, "k2": 3, "AC": [6, -2], "AB": [5, 0], "BC": [1, -2], "L2": 25, "p": [6, 0], "DA": [-5, 6], "DC": [1, 4], "DC2": [8, 4] }, { "w": [1, -2], "k1": 2, "k2": 4, "AC": [7, -4], "AB": [5, 0], "BC": [2, -4], "L2": 25, "p": [7, 0], "DA": [-5, 7], "DC": [2, 3], "DC2": [12, 5] }, { "w": [1, -2], "k1": 2, "k2": 6, "AC": [8, -6], "AB": [6, -2], "BC": [2, -4], "L2": 40, "p": [9, -3], "DA": [-6, 12], "DC": [2, 6], "DC2": [18, 14] }, { "w": [1, -2], "k1": 3, "k2": 5, "AC": [8, -6], "AB": [5, 0], "BC": [3, -6], "L2": 25, "p": [8, 0], "DA": [-5, 8], "DC": [3, 2], "DC2": [17, 6] }, { "w": [1, 2], "k1": 1, "k2": 5, "AC": [1, 7], "AB": [0, 5], "BC": [1, 2], "L2": 25, "p": [0, 7], "DA": [-7, -8], "DC": [-6, -1], "DC2": [-18, -1] }, { "w": [1, 2], "k1": 2, "k2": 4, "AC": [1, 7], "AB": [-1, 3], "BC": [2, 4], "L2": 10, "p": [-2, 6], "DA": [-4, -8], "DC": [-3, -1], "DC2": [-15, 5] }, { "w": [1, 2], "k1": 2, "k2": 4, "AC": [-3, 9], "AB": [-5, 5], "BC": [2, 4], "L2": 50, "p": [-6, 6], "DA": [-2, -10], "DC": [-5, -1], "DC2": [-10, 5] }, { "w": [1, 2], "k1": 2, "k2": 6, "AC": [2, 9], "AB": [0, 5], "BC": [2, 4], "L2": 25, "p": [0, 9], "DA": [-9, -11], "DC": [-7, -2], "DC2": [-22, 0] }, { "w": [1, 2], "k1": 3, "k2": 7, "AC": [3, 11], "AB": [0, 5], "BC": [3, 6], "L2": 25, "p": [0, 11], "DA": [-11, -14], "DC": [-8, -3], "DC2": [-26, 0] }, { "w": [1, 3], "k1": 1, "k2": 3, "AC": [-1, 7], "AB": [-2, 4], "BC": [1, 3], "L2": 20, "p": [-3, 6], "DA": [-3, -9], "DC": [-4, -2], "DC2": [-16, 2] }, { "w": [1, 3], "k1": 1, "k2": 3, "AC": [-4, 8], "AB": [-5, 5], "BC": [1, 3], "L2": 50, "p": [-6, 6], "DA": [-1, -11], "DC": [-5, -3], "DC2": [-13, 3] }, { "w": [1, 3], "k1": 1, "k2": 5, "AC": [-3, 11], "AB": [-4, 8], "BC": [1, 3], "L2": 80, "p": [-5, 10], "DA": [-5, -15], "DC": [-8, -4], "DC2": [-26, 2] }, { "w": [1, 3], "k1": 2, "k2": 4, "AC": [-3, 11], "AB": [-5, 5], "BC": [2, 6], "L2": 50, "p": [-7, 7], "DA": [-2, -12], "DC": [-5, -1], "DC2": [-18, 7] }, { "w": [2, -3], "k1": 2, "k2": 4, "AC": [9, -7], "AB": [5, -1], "BC": [4, -6], "L2": 26, "p": [10, -2], "DA": [-8, 12], "DC": [1, 5], "DC2": [19, 17] }, { "w": [2, -1], "k1": 1, "k2": 5, "AC": [7, -1], "AB": [5, 0], "BC": [2, -1], "L2": 25, "p": [7, 0], "DA": [-8, 7], "DC": [-1, 6], "DC2": [-1, 18] }, { "w": [2, -1], "k1": 2, "k2": 4, "AC": [7, -1], "AB": [3, 1], "BC": [4, -2], "L2": 10, "p": [6, 2], "DA": [-8, 4], "DC": [-1, 3], "DC2": [5, 15] }, { "w": [2, -1], "k1": 2, "k2": 4, "AC": [9, 3], "AB": [5, 5], "BC": [4, -2], "L2": 50, "p": [6, 6], "DA": [-10, 2], "DC": [-1, 5], "DC2": [5, 10] }, { "w": [2, -1], "k1": 2, "k2": 6, "AC": [9, -2], "AB": [5, 0], "BC": [4, -2], "L2": 25, "p": [9, 0], "DA": [-11, 9], "DC": [-2, 7], "DC2": [0, 22] }, { "w": [2, -1], "k1": 3, "k2": 7, "AC": [11, -3], "AB": [5, 0], "BC": [6, -3], "L2": 25, "p": [11, 0], "DA": [-14, 11], "DC": [-3, 8], "DC2": [0, 26] }, { "w": [2, 1], "k1": 1, "k2": 3, "AC": [2, 6], "AB": [0, 5], "BC": [2, 1], "L2": 25, "p": [0, 6], "DA": [-6, -5], "DC": [-4, 1], "DC2": [-4, 8] }, { "w": [2, 1], "k1": 2, "k2": 4, "AC": [4, 7], "AB": [0, 5], "BC": [4, 2], "L2": 25, "p": [0, 7], "DA": [-7, -5], "DC": [-3, 2], "DC2": [-5, 12] }, { "w": [2, 1], "k1": 2, "k2": 6, "AC": [6, 8], "AB": [2, 6], "BC": [4, 2], "L2": 40, "p": [3, 9], "DA": [-12, -6], "DC": [-6, 2], "DC2": [-14, 18] }, { "w": [2, 1], "k1": 3, "k2": 5, "AC": [6, 8], "AB": [0, 5], "BC": [6, 3], "L2": 25, "p": [0, 8], "DA": [-8, -5], "DC": [-2, 3], "DC2": [-6, 17] }, { "w": [2, 3], "k1": 2, "k2": 4, "AC": [3, 11], "AB": [-1, 5], "BC": [4, 6], "L2": 26, "p": [-2, 10], "DA": [-8, -12], "DC": [-5, -1], "DC2": [-23, 11] }, { "w": [3, -2], "k1": 2, "k2": 4, "AC": [11, -3], "AB": [5, 1], "BC": [6, -4], "L2": 26, "p": [10, 2], "DA": [-12, 8], "DC": [-1, 5], "DC2": [11, 23] }, { "w": [3, -1], "k1": 1, "k2": 3, "AC": [7, 1], "AB": [4, 2], "BC": [3, -1], "L2": 20, "p": [6, 3], "DA": [-9, 3], "DC": [-2, 4], "DC2": [2, 16] }, { "w": [3, -1], "k1": 1, "k2": 3, "AC": [8, 4], "AB": [5, 5], "BC": [3, -1], "L2": 50, "p": [6, 6], "DA": [-11, 1], "DC": [-3, 5], "DC2": [3, 13] }, { "w": [3, -1], "k1": 1, "k2": 5, "AC": [11, 3], "AB": [8, 4], "BC": [3, -1], "L2": 80, "p": [10, 5], "DA": [-15, 5], "DC": [-4, 8], "DC2": [2, 26] }, { "w": [3, -1], "k1": 2, "k2": 4, "AC": [11, 3], "AB": [5, 5], "BC": [6, -2], "L2": 50, "p": [7, 7], "DA": [-12, 2], "DC": [-1, 5], "DC2": [7, 18] }, { "w": [3, 1], "k1": 1, "k2": 3, "AC": [3, 11], "AB": [0, 10], "BC": [3, 1], "L2": 100, "p": [0, 11], "DA": [-11, -9], "DC": [-8, 2], "DC2": [-5, 10] }, { "w": [3, 1], "k1": 1, "k2": 5, "AC": [8, 6], "AB": [5, 5], "BC": [3, 1], "L2": 50, "p": [7, 7], "DA": [-15, -1], "DC": [-7, 5], "DC2": [-19, 17] }, { "w": [3, 1], "k1": 1, "k2": 5, "AC": [7, 9], "AB": [4, 8], "BC": [3, 1], "L2": 80, "p": [5, 10], "DA": [-15, -5], "DC": [-8, 4], "DC2": [-14, 22] }, { "w": [3, 1], "k1": 2, "k2": 4, "AC": [8, 6], "AB": [2, 4], "BC": [6, 2], "L2": 20, "p": [4, 8], "DA": [-12, -4], "DC": [-4, 2], "DC2": [-10, 20] }, { "w": [3, 1], "k1": 2, "k2": 4, "AC": [6, 12], "AB": [0, 10], "BC": [6, 2], "L2": 100, "p": [0, 12], "DA": [-12, -8], "DC": [-6, 4], "DC2": [-4, 16] }, { "w": [3, 1], "k1": 2, "k2": 6, "AC": [11, 7], "AB": [5, 5], "BC": [6, 2], "L2": 50, "p": [9, 9], "DA": [-20, -2], "DC": [-9, 5], "DC2": [-22, 21] }, { "w": [3, 1], "k1": 3, "k2": 5, "AC": [11, 7], "AB": [2, 4], "BC": [9, 3], "L2": 20, "p": [5, 10], "DA": [-15, -5], "DC": [-4, 2], "DC2": [-12, 26] }, { "w": [3, 2], "k1": 2, "k2": 4, "AC": [7, 9], "AB": [1, 5], "BC": [6, 4], "L2": 26, "p": [2, 10], "DA": [-12, -8], "DC": [-5, 1], "DC2": [-17, 19] }, { "w": [4, 1], "k1": 2, "k2": 4, "AC": [11, 7], "AB": [3, 5], "BC": [8, 2], "L2": 34, "p": [6, 10], "DA": [-16, -4], "DC": [-5, 3], "DC2": [-11, 27] }];
  const P3POOL = [{ "CA": [2, 6], "BE": [12, -2], "cd": [13, 4], "t": 2, "L2": 20, "lado": 1, "BC": [-14, -10], "CB2": 296, "dotCACB": 88, "kk": 44, "F": [4, 2], "other": [3.135135135135135, -3.189189189189189], "D": [-8, 8], "DF": [12, -6], "DF2": [15.560667050028751, 2.0874065554916617], "t2": [-2, 5], "A": [-12, -4], "AB": [12, 4], "CA2": 40, "BE2": 148 }, { "CA": [4, 4], "BE": [3, -9], "cd": [5, -3], "t": 3, "L2": 20, "lado": 1, "BC": [-12, 0], "CB2": 144, "dotCACB": 48, "kk": 30, "F": [4, -2], "other": [-2.0, -4.0], "D": [7, 19], "DF": [-3, -21], "DF2": [7.0, -7.0], "t2": [-9, 17], "A": [-8, 4], "AB": [8, -4], "CA2": 32, "BE2": 90 }, { "CA": [6, -3], "BE": [-4, -4], "cd": [1, -5], "t": 2, "L2": 20, "lado": 1, "BC": [-6, 6], "CB2": 72, "dotCACB": 54, "kk": 24, "F": [-2, -4], "other": [-4.0, -2.0], "D": [14, -4], "DF": [-16, 0], "DF2": [0.0, -7.0], "t2": [-10, 13], "A": [0, 3], "AB": [0, -3], "CA2": 45, "BE2": 32 }, { "CA": [-2, -4], "BE": [-2, 10], "cd": [-5, -1], "t": 2, "L2": 10, "lado": 1, "BC": [8, 12], "CB2": 208, "dotCACB": 64, "kk": 32, "F": [-1, 3], "other": [-0.23076923076923078, 3.1538461538461537], "D": [0, -4], "DF": [-1, 7], "DF2": [-1.2974358974358975, 5.02051282051282], "t2": [-2, 1], "A": [6, 8], "AB": [-6, -8], "CA2": 20, "BE2": 104 }, { "CA": [2, -6], "BE": [-12, -4], "cd": [-7, -9], "t": 2, "L2": 32, "lado": 1, "BC": [2, 14], "CB2": 200, "dotCACB": 80, "kk": 64, "F": [-4, -4], "other": [-5.6, 0.8], "D": [8, -4], "DF": [-12, 0], "DF2": [-9.6, -7.2], "t2": [-2, 13], "A": [4, 8], "AB": [-4, -8], "CA2": 40, "BE2": 160 }, { "CA": [5, -5], "BE": [2, -8], "cd": [7, -11], "t": 2, "L2": 10, "lado": 1, "BC": [-12, 14], "CB2": 340, "dotCACB": 130, "kk": 26, "F": [1, -3], "other": [0.5294117647058824, -3.1176470588235294], "D": [0, 2], "DF": [1, -5], "DF2": [1.9776876267748478, -6.565922920892495], "t2": [-4, 5], "A": [-7, 9], "AB": [7, -9], "CA2": 50, "BE2": 68 }, { "CA": [4, -8], "BE": [-2, -4], "cd": [1, -8], "t": 2, "L2": 10, "lado": 1, "BC": [-4, 12], "CB2": 160, "dotCACB": 112, "kk": 14, "F": [-1, -3], "other": [-1.8, -2.6], "D": [2, 0], "DF": [-3, -3], "DF2": [-1.1333333333333333, -7.933333333333334], "t2": [-14, 13], "A": [0, 4], "AB": [0, -4], "CA2": 80, "BE2": 20 }, { "CA": [6, -7], "BE": [-7, -1], "cd": [1, -7], "t": 2, "L2": 17, "lado": 1, "BC": [-9, 13], "CB2": 250, "dotCACB": 145, "kk": 29, "F": [-4, -1], "other": [-4.12, -0.16], "D": [3, -1], "DF": [-7, 0], "DF2": [-5.12, -1.4933333333333334], "t2": [-2, 1], "A": [-3, 6], "AB": [3, -6], "CA2": 85, "BE2": 50 }, { "CA": [-6, -3], "BE": [1, 4], "cd": [-4, 1], "t": 2, "L2": 9, "lado": 1, "BC": [9, 2], "CB2": 85, "dotCACB": 60, "kk": 12, "F": [0, 3], "other": [1.411764705882353, 2.6470588235294117], "D": [-11, -8], "DF": [11, 11], "DF2": [-1.1731409544950056, 3.8546059933407326], "t2": [-2, 1], "A": [3, -1], "AB": [-3, 1], "CA2": 45, "BE2": 17 }, { "CA": [-8, -4], "BE": [-9, 6], "cd": [-7, 2], "t": 3, "L2": 65, "lado": 1, "BC": [12, 0], "CB2": 144, "dotCACB": 96, "kk": 78, "F": [-8, 1], "other": [-4.0, 7.0], "D": [-6, -9], "DF": [-2, 10], "DF2": [-50.0, -10.0], "t2": [-9, 53], "A": [4, -4], "AB": [-4, 4], "CA2": 80, "BE2": 117 }, { "CA": [5, -5], "BE": [2, -10], "cd": [5, -12], "t": 2, "L2": 20, "lado": 1, "BC": [-8, 14], "CB2": 260, "dotCACB": 110, "kk": 44, "F": [2, -4], "other": [-0.3076923076923077, -4.461538461538462], "D": [2, 4], "DF": [0, -8], "DF2": [7.6923076923076925, -18.46153846153846], "t2": [-6, 13], "A": [-3, 9], "AB": [3, -9], "CA2": 50, "BE2": 104 }, { "CA": [-5, 0], "BE": [-3, 9], "cd": [-4, 7], "t": 3, "L2": 10, "lado": 1, "BC": [9, -12], "CB2": 225, "dotCACB": 45, "kk": 18, "F": [-3, 1], "other": [1.8, 2.6], "D": [-3, -12], "DF": [0, 13], "DF2": [-10.95, 14.6], "t2": [-9, 13], "A": [4, -12], "AB": [-4, 12], "CA2": 25, "BE2": 90 }, { "CA": [-7, -5], "BE": [2, 8], "cd": [-4, 1], "t": 2, "L2": 37, "lado": 1, "BC": [10, 6], "CB2": 136, "dotCACB": 100, "kk": 50, "F": [1, 6], "other": [1.9411764705882353, 5.764705882352941], "D": [-4, -4], "DF": [5, 10], "DF2": [0.14807302231237324, 5.626774847870182], "t2": [-2, 1], "A": [3, 1], "AB": [-3, -1], "CA2": 74, "BE2": 68 }, { "CA": [5, 5], "BE": [10, -8], "cd": [23, -2], "t": 1, "L2": 40, "lado": 1, "BC": [-13, -6], "CB2": 205, "dotCACB": 95, "kk": 76, "F": [6, -2], "other": [3.268292682926829, -5.414634146341464], "D": [0, 7], "DF": [6, -9], "DF2": [11.331119908057719, -4.351806921210573], "t2": [-1, 13], "A": [-8, -1], "AB": [8, 1], "CA2": 50, "BE2": 164 }, { "CA": [6, 8], "BE": [10, 1], "cd": [19, 12], "t": 1, "L2": 50, "lado": 1, "BC": [-9, -11], "CB2": 202, "dotCACB": 142, "kk": 71, "F": [7, 1], "other": [7.0594059405940595, 0.40594059405940597], "D": [0, 1], "DF": [7, 0], "DF2": [8.845120226308346, 1.7868929750117868], "t2": [-1, 5], "A": [-3, -3], "AB": [3, 3], "CA2": 100, "BE2": 101 }, { "CA": [4, 3], "BE": [-2, -6], "cd": [4, -3], "t": 2, "L2": 10, "lado": 1, "BC": [-10, 0], "CB2": 100, "dotCACB": 40, "kk": 16, "F": [1, -3], "other": [-2.6, -1.8], "D": [46, 42], "DF": [-45, -45], "DF2": [0.9483870967741935, -6.638709677419355], "t2": [-6, 5], "A": [-6, 3], "AB": [6, -3], "CA2": 25, "BE2": 40 }, { "CA": [-4, 4], "BE": [10, -2], "cd": [1, 5], "t": 2, "L2": 16, "lado": 1, "BC": [8, -12], "CB2": 208, "dotCACB": 80, "kk": 40, "F": [4, 0], "other": [3.6923076923076925, -1.5384615384615385], "D": [-8, 4], "DF": [12, -4], "DF2": [6.6396761133603235, -0.48582995951417], "t2": [-2, 1], "A": [4, -8], "AB": [-4, 8], "CA2": 32, "BE2": 104 }, { "CA": [4, -3], "BE": [-8, 4], "cd": [1, -3], "t": 2, "L2": 10, "lado": 1, "BC": [-10, 10], "CB2": 200, "dotCACB": 70, "kk": 28, "F": [-3, 1], "other": [-2.6, 1.8], "D": [22, -14], "DF": [-25, 15], "DF2": [-7.735135135135135, 3.151351351351351], "t2": [-6, 1], "A": [-6, 7], "AB": [6, -7], "CA2": 25, "BE2": 80 }, { "CA": [4, -3], "BE": [-7, -3], "cd": [-2, -5], "t": 3, "L2": 10, "lado": 1, "BC": [-1, 12], "CB2": 145, "dotCACB": 40, "kk": 16, "F": [-1, -3], "other": [-2.8620689655172415, 1.3448275862068966], "D": [19, -3], "DF": [-20, 0], "DF2": [-6.695402298850575, -7.030172413793103], "t2": [-1, 1], "A": [3, 9], "AB": [-3, -9], "CA2": 25, "BE2": 58 }, { "CA": [6, -8], "BE": [-6, -1], "cd": [-4, -13], "t": 1, "L2": 25, "lado": 1, "BC": [-2, 12], "CB2": 148, "dotCACB": 108, "kk": 27, "F": [-4, -3], "other": [-4.756756756756757, 1.5405405405405406], "D": [49, -56], "DF": [-53, 53], "DF2": [-4.18594130611298, -8.553880060317828], "t2": [-3, 5], "A": [4, 4], "AB": [-4, -4], "CA2": 100, "BE2": 37 }, { "CA": [2, 4], "BE": [1, -4], "cd": [4, 1], "t": 1, "L2": 10, "lado": 1, "BC": [-3, -5], "CB2": 34, "dotCACB": 26, "kk": 13, "F": [1, -3], "other": [0.5294117647058824, -3.1176470588235294], "D": [1, 3], "DF": [0, -6], "DF2": [1.3358633776091082, -2.504743833017078], "t2": [-1, 1], "A": [-1, -1], "AB": [1, 1], "CA2": 20, "BE2": 17 }, { "CA": [4, -8], "BE": [-7, -2], "cd": [-3, -16], "t": 1, "L2": 20, "lado": 1, "BC": [-4, 14], "CB2": 212, "dotCACB": 128, "kk": 32, "F": [-4, -2], "other": [-4.452830188679245, -0.41509433962264153], "D": [4, -2], "DF": [-8, 0], "DF2": [-5.842660697153821, -3.635433322673489], "t2": [-3, 5], "A": [0, 6], "AB": [0, -6], "CA2": 80, "BE2": 53 }, { "CA": [5, -5], "BE": [-8, 1], "cd": [-1, -3], "t": 3, "L2": 26, "lado": 1, "BC": [-5, 10], "CB2": 125, "dotCACB": 75, "kk": 39, "F": [-5, -1], "other": [-4.6, 2.2], "D": [28, -23], "DF": [-33, 22], "DF2": [-5.469565217391304, -1.9304347826086956], "t2": [-2, 1], "A": [0, 5], "AB": [0, -5], "CA2": 50, "BE2": 65 }, { "CA": [-7, 1], "BE": [6, 3], "cd": [-1, 2], "t": 3, "L2": 25, "lado": 1, "BC": [9, -3], "CB2": 90, "dotCACB": 66, "kk": 33, "F": [4, 3], "other": [4.8, 1.4], "D": [-33, 3], "DF": [37, 0], "DF2": [2.574193548387097, 3.432258064516129], "t2": [-3, 1], "A": [2, -2], "AB": [-2, 2], "CA2": 50, "BE2": 45 }, { "CA": [-6, 4], "BE": [3, 7], "cd": [-1, 17], "t": 1, "L2": 26, "lado": 1, "BC": [4, -10], "CB2": 116, "dotCACB": 64, "kk": 32, "F": [-1, 5], "other": [4.310344827586207, 2.7241379310344827], "D": [-11, 0], "DF": [10, 5], "DF2": [-4.980195712954334, 16.25116495806151], "t2": [-1, 5], "A": [-2, -6], "AB": [2, 6], "CA2": 52, "BE2": 58 }, { "CA": [4, -8], "BE": [-9, 5], "cd": [-5, -9], "t": 1, "L2": 40, "lado": 1, "BC": [-4, 14], "CB2": 212, "dotCACB": 128, "kk": 64, "F": [-6, 2], "other": [-4.867924528301887, 4.037735849056604], "D": [10, -14], "DF": [-16, 16], "DF2": [-6.619862512798011, 1.5416118180488518], "t2": [-1, 1], "A": [0, 6], "AB": [0, -6], "CA2": 80, "BE2": 106 }, { "CA": [5, 0], "BE": [0, -6], "cd": [2, -3], "t": 3, "L2": 20, "lado": 1, "BC": [-6, 3], "CB2": 45, "dotCACB": 30, "kk": 24, "F": [2, -4], "other": [-2.0, -4.0], "D": [9, 3], "DF": [-7, -7], "DF2": [7.0, -7.0], "t2": [-3, 13], "A": [-1, 3], "AB": [1, -3], "CA2": 25, "BE2": 36 }, { "CA": [5, -5], "BE": [-4, -6], "cd": [1, -5], "t": 3, "L2": 20, "lado": 1, "BC": [-7, 9], "CB2": 130, "dotCACB": 80, "kk": 32, "F": [-2, -4], "other": [-2.923076923076923, -3.3846153846153846], "D": [2, 0], "DF": [-4, -4], "DF2": [-2.423076923076923, -5.884615384615385], "t2": [-1, 1], "A": [-2, 4], "AB": [2, -4], "CA2": 50, "BE2": 52 }, { "CA": [-8, 0], "BE": [0, 13], "cd": [-4, 7], "t": 3, "L2": 52, "lado": 1, "BC": [12, -8], "CB2": 208, "dotCACB": 96, "kk": 78, "F": [-4, 6], "other": [4.0, 6.0], "D": [-12, -8], "DF": [8, 14], "DF2": [-8.0, 14.0], "t2": [-1, 5], "A": [4, -8], "AB": [-4, 8], "CA2": 64, "BE2": 169 }, { "CA": [0, -6], "BE": [-10, 1], "cd": [-21, -8], "t": 1, "L2": 18, "lado": 1, "BC": [11, 9], "CB2": 202, "dotCACB": 54, "kk": 27, "F": [-3, -3], "other": [-2.3465346534653464, 3.5346534653465347], "D": [11, -11], "DF": [-14, 8], "DF2": [-13.346534653465346, -4.420068397525393], "t2": [-1, 5], "A": [11, 3], "AB": [-11, -3], "CA2": 36, "BE2": 101 }, { "CA": [-4, 2], "BE": [-2, 6], "cd": [-4, 7], "t": 2, "L2": 8, "lado": 1, "BC": [6, -8], "CB2": 100, "dotCACB": 40, "kk": 16, "F": [-2, 2], "other": [0.4, 2.8], "D": [-2, -4], "DF": [0, 6], "DF2": [-9.6, 12.8], "t2": [-6, 13], "A": [2, -6], "AB": [-2, 6], "CA2": 20, "BE2": 40 }, { "CA": [8, -6], "BE": [2, -10], "cd": [9, -19], "t": 1, "L2": 80, "lado": 1, "BC": [-7, 9], "CB2": 130, "dotCACB": 110, "kk": 88, "F": [4, -8], "other": [-0.6153846153846154, -8.923076923076923], "D": [9, -3], "DF": [-5, -5], "DF2": [-38.83277591973244, 15.989966555183946], "t2": [-1, 17], "A": [1, 3], "AB": [-1, -3], "CA2": 100, "BE2": 104 }, { "CA": [-5, 5], "BE": [8, 10], "cd": [2, 23], "t": 1, "L2": 40, "lado": 1, "BC": [6, -13], "CB2": 205, "dotCACB": 95, "kk": 76, "F": [2, 6], "other": [5.414634146341464, 3.268292682926829], "D": [-7, 0], "DF": [9, 6], "DF2": [4.351806921210573, 11.331119908057719], "t2": [-1, 13], "A": [1, -8], "AB": [-1, 8], "CA2": 50, "BE2": 164 }, { "CA": [2, 6], "BE": [3, -7], "cd": [17, -1], "t": 1, "L2": 10, "lado": 1, "BC": [-14, -6], "CB2": 232, "dotCACB": 64, "kk": 16, "F": [3, -1], "other": [-1.3448275862068966, -2.8620689655172415], "D": [3, 45], "DF": [0, -46], "DF2": [8.8117989198172, -8.392189447444952], "t2": [-3, 5], "A": [-12, 0], "AB": [12, 0], "CA2": 40, "BE2": 58 }, { "CA": [2, 4], "BE": [6, 2], "cd": [7, 4], "t": 2, "L2": 8, "lado": 1, "BC": [-8, -6], "CB2": 100, "dotCACB": 40, "kk": 16, "F": [2, 2], "other": [2.8, -0.4], "D": [-4, 2], "DF": [6, 0], "DF2": [12.8, 9.6], "t2": [-6, 13], "A": [-6, -2], "AB": [6, 2], "CA2": 20, "BE2": 40 }, { "CA": [-3, -9], "BE": [-5, 10], "cd": [-7, -1], "t": 2, "L2": 50, "lado": 1, "BC": [9, 12], "CB2": 225, "dotCACB": 135, "kk": 75, "F": [-5, 5], "other": [-1.0, 7.0], "D": [-5, -30], "DF": [0, 35], "DF2": [-6.666666666666667, 5.0], "t2": [-1, 1], "A": [6, 3], "AB": [-6, -3], "CA2": 90, "BE2": 125 }, { "CA": [-7, 0], "BE": [11, 7], "cd": [-3, 14], "t": 1, "L2": 34, "lado": 1, "BC": [14, -7], "CB2": 245, "dotCACB": 98, "kk": 68, "F": [3, 5], "other": [5.8, 0.6], "D": [-45, -7], "DF": [48, 12], "DF2": [6.175, 7.6], "t2": [-15, 41], "A": [7, -7], "AB": [-7, 7], "CA2": 49, "BE2": 170 }, { "CA": [4, 7], "BE": [5, -3], "cd": [4, 1], "t": 3, "L2": 26, "lado": 1, "BC": [-7, -6], "CB2": 85, "dotCACB": 70, "kk": 28, "F": [5, -1], "other": [3.235294117647059, -3.9411764705882355], "D": [5, 15], "DF": [0, -16], "DF2": [13.029814665592264, 6.9492344883158745], "t2": [-1, 1], "A": [-3, 1], "AB": [3, -1], "CA2": 65, "BE2": 34 }, { "CA": [6, 3], "BE": [3, -5], "cd": [4, -1], "t": 3, "L2": 18, "lado": 1, "BC": [-9, -2], "CB2": 85, "dotCACB": 60, "kk": 24, "F": [3, -3], "other": [1.2352941176470589, -4.0588235294117645], "D": [3, 4], "DF": [0, -7], "DF2": [6.944971537001898, -3.7039848197343455], "t2": [-1, 1], "A": [-3, 1], "AB": [3, -1], "CA2": 45, "BE2": 34 }, { "CA": [-2, -6], "BE": [-4, 16], "cd": [-9, 2], "t": 2, "L2": 32, "lado": 1, "BC": [14, 12], "CB2": 340, "dotCACB": 100, "kk": 80, "F": [-4, 4], "other": [1.6470588235294117, 5.411764705882353], "D": [-4, -42], "DF": [0, 46], "DF2": [-6.250377073906486, 11.71945701357466], "t2": [-2, 5], "A": [12, 6], "AB": [-12, -6], "CA2": 40, "BE2": 272 }, { "CA": [-7, 4], "BE": [-2, 8], "cd": [-7, 11], "t": 2, "L2": 13, "lado": 1, "BC": [12, -14], "CB2": 340, "dotCACB": 140, "kk": 28, "F": [-2, 3], "other": [0.35294117647058826, 3.588235294117647], "D": [-2, -6], "DF": [0, 9], "DF2": [-8.386784850926672, 15.72522159548751], "t2": [-4, 5], "A": [5, -10], "AB": [-5, 10], "CA2": 65, "BE2": 68 }, { "CA": [0, 7], "BE": [6, -8], "cd": [13, 6], "t": 1, "L2": 20, "lado": 1, "BC": [-7, -14], "CB2": 245, "dotCACB": 98, "kk": 40, "F": [4, -2], "other": [0.8, -4.4], "D": [-7, 31], "DF": [11, -33], "DF2": [7.8, -5.4], "t2": [-29, 41], "A": [-7, -7], "AB": [7, 7], "CA2": 49, "BE2": 100 }, { "CA": [-4, -8], "BE": [-3, 9], "cd": [-5, -1], "t": 3, "L2": 25, "lado": 1, "BC": [12, 12], "CB2": 288, "dotCACB": 144, "kk": 45, "F": [-3, 4], "other": [0.0, 5.0], "D": [-3, -18], "DF": [0, 22], "DF2": [-5.1, 6.8], "t2": [-33, 13], "A": [8, 4], "AB": [-8, -4], "CA2": 80, "BE2": 90 }, { "CA": [5, 0], "BE": [-2, -8], "cd": [5, -14], "t": 1, "L2": 20, "lado": 1, "BC": [-7, 6], "CB2": 85, "dotCACB": 35, "kk": 28, "F": [2, -4], "other": [-3.6470588235294117, -2.588235294117647], "D": [12, 6], "DF": [-10, -10], "DF2": [2.6138107416879794, -8.588235294117647], "t2": [-1, 13], "A": [-2, 6], "AB": [2, -6], "CA2": 25, "BE2": 68 }, { "CA": [8, -4], "BE": [-8, -2], "cd": [1, -4], "t": 2, "L2": 40, "lado": 1, "BC": [-10, 6], "CB2": 136, "dotCACB": 104, "kk": 52, "F": [-6, -2], "other": [-6.235294117647059, -1.0588235294117647], "D": [6, -2], "DF": [-12, 0], "DF2": [-5.009487666034156, -2.6717267552182165], "t2": [-2, 1], "A": [-2, 2], "AB": [2, -2], "CA2": 80, "BE2": 68 }, { "CA": [-5, -5], "BE": [-2, 8], "cd": [-5, 3], "t": 3, "L2": 20, "lado": 1, "BC": [13, -1], "CB2": 170, "dotCACB": 60, "kk": 24, "F": [-4, 2], "other": [2.588235294117647, 3.6470588235294117], "D": [-14, -28], "DF": [10, 30], "DF2": [-7.727554179566564, 7.3312693498452015], "t2": [-1, 1], "A": [8, -6], "AB": [-8, 6], "CA2": 50, "BE2": 68 }, { "CA": [-5, -5], "BE": [-6, 6], "cd": [-5, 1], "t": 3, "L2": 40, "lado": 1, "BC": [9, 3], "CB2": 90, "dotCACB": 60, "kk": 48, "F": [-6, 2], "other": [-2.0, 6.0], "D": [-6, -12], "DF": [0, 14], "DF2": [-14.0, 0.0], "t2": [-3, 13], "A": [4, -2], "AB": [-4, 2], "CA2": 50, "BE2": 72 }, { "CA": [-5, -5], "BE": [3, 9], "cd": [-3, 1], "t": 3, "L2": 25, "lado": 1, "BC": [12, 6], "CB2": 180, "dotCACB": 90, "kk": 45, "F": [0, 5], "other": [3.0, 4.0], "D": [-33, -39], "DF": [33, 44], "DF2": [0.0, 7.0], "t2": [-3, 1], "A": [7, 1], "AB": [-7, -1], "CA2": 50, "BE2": 90 }, { "CA": [1, -7], "BE": [-6, -8], "cd": [-8, -19], "t": 1, "L2": 40, "lado": 1, "BC": [2, 11], "CB2": 125, "dotCACB": 75, "kk": 60, "F": [-2, -6], "other": [-5.2, -3.6], "D": [4, -3], "DF": [-6, -3], "DF2": [-5.2, -28.6], "t2": [-1, 17], "A": [3, 4], "AB": [-3, -4], "CA2": 50, "BE2": 100 }, { "CA": [7, 0], "BE": [5, -5], "cd": [19, -12], "t": 1, "L2": 10, "lado": 1, "BC": [-14, 7], "CB2": 245, "dotCACB": 98, "kk": 20, "F": [3, -1], "other": [1.0, -3.0], "D": [-1, 7], "DF": [4, -8], "DF2": [20.0, -10.0], "t2": [-39, 101], "A": [-7, 7], "AB": [7, -7], "CA2": 49, "BE2": 50 }, { "CA": [2, -4], "BE": [-5, 3], "cd": [-3, -5], "t": 1, "L2": 10, "lado": 1, "BC": [-2, 8], "CB2": 68, "dotCACB": 36, "kk": 18, "F": [-3, 1], "other": [-2.2941176470588234, 2.176470588235294], "D": [6, -8], "DF": [-9, 9], "DF2": [-3.7812971342383106, 1.1508295625942684], "t2": [-1, 1], "A": [0, 4], "AB": [0, -4], "CA2": 20, "BE2": 34 }, { "CA": [-6, 0], "BE": [-3, 6], "cd": [-4, 3], "t": 3, "L2": 18, "lado": 1, "BC": [9, -3], "CB2": 90, "dotCACB": 54, "kk": 27, "F": [-3, 3], "other": [-0.6, 4.2], "D": [-3, -3], "DF": [0, 6], "DF2": [-9.6, 7.2], "t2": [-3, 5], "A": [3, -3], "AB": [-3, 3], "CA2": 36, "BE2": 45 }, { "CA": [-8, -4], "BE": [3, 7], "cd": [-7, 3], "t": 1, "L2": 40, "lado": 1, "BC": [10, 4], "CB2": 116, "dotCACB": 96, "kk": 48, "F": [2, 6], "other": [2.9655172413793105, 5.586206896551724], "D": [-10, -6], "DF": [12, 12], "DF2": [0.12601106853980418, 5.166453810131971], "t2": [-1, 1], "A": [2, 0], "AB": [-2, 0], "CA2": 80, "BE2": 58 }, { "CA": [-9, -7], "BE": [2, 10], "cd": [-5, 1], "t": 2, "L2": 65, "lado": 1, "BC": [12, 8], "CB2": 208, "dotCACB": 164, "kk": 82, "F": [1, 8], "other": [2.1538461538461537, 7.769230769230769], "D": [-6, -6], "DF": [7, 14], "DF2": [-0.48615384615384616, 7.049230769230769], "t2": [-2, 1], "A": [3, 1], "AB": [-3, -1], "CA2": 130, "BE2": 104 }, { "CA": [-6, 6], "BE": [6, 1], "cd": [4, 13], "t": 1, "L2": 18, "lado": 1, "BC": [2, -12], "CB2": 148, "dotCACB": 84, "kk": 21, "F": [3, 3], "other": [3.810810810810811, -1.864864864864865], "D": [-45, 35], "DF": [48, -32], "DF2": [5.174447174447175, 6.771498771498772], "t2": [-3, 5], "A": [-4, -6], "AB": [4, 6], "CA2": 72, "BE2": 37 }, { "CA": [8, 6], "BE": [-1, -9], "cd": [13, -6], "t": 1, "L2": 40, "lado": 1, "BC": [-14, -3], "CB2": 205, "dotCACB": 130, "kk": 52, "F": [2, -6], "other": [-3.268292682926829, -5.414634146341464], "D": [62, 54], "DF": [-60, -60], "DF2": [4.4894927842011985, -7.096295045995443], "t2": [-3, 5], "A": [-6, 3], "AB": [6, -3], "CA2": 100, "BE2": 82 }, { "CA": [-5, -5], "BE": [3, 6], "cd": [-3, -1], "t": 3, "L2": 10, "lado": 1, "BC": [12, 9], "CB2": 225, "dotCACB": 105, "kk": 21, "F": [1, 3], "other": [1.8, 2.6], "D": [-9, -12], "DF": [10, 15], "DF2": [2.0727272727272728, 5.872727272727273], "t2": [-6, 1], "A": [7, 4], "AB": [-7, -4], "CA2": 50, "BE2": 45 }, { "CA": [-9, 3], "BE": [6, 8], "cd": [-1, 7], "t": 3, "L2": 36, "lado": 1, "BC": [9, -13], "CB2": 250, "dotCACB": 120, "kk": 48, "F": [0, 6], "other": [5.76, 1.68], "D": [-24, -2], "DF": [24, 8], "DF2": [0.51, 13.43], "t2": [-1, 1], "A": [0, -10], "AB": [0, 10], "CA2": 90, "BE2": 100 }, { "CA": [-8, -4], "BE": [-11, 3], "cd": [-23, -1], "t": 1, "L2": 65, "lado": 1, "BC": [12, 4], "CB2": 160, "dotCACB": 112, "kk": 91, "F": [-8, 1], "other": [-7.4, 3.2], "D": [-2, -3], "DF": [-6, 4], "DF2": [-20.025, -1.1125], "t2": [-3, 53], "A": [4, 0], "AB": [-4, 0], "CA2": 80, "BE2": 130 }, { "CA": [0, -5], "BE": [-8, 4], "cd": [-8, -1], "t": 2, "L2": 20, "lado": 1, "BC": [8, 6], "CB2": 100, "dotCACB": 30, "kk": 24, "F": [-4, -2], "other": [-0.8, 4.4], "D": [8, -20], "DF": [-12, 18], "DF2": [-8.8, -0.4888888888888889], "t2": [-2, 13], "A": [8, 1], "AB": [-8, -1], "CA2": 25, "BE2": 80 }, { "CA": [2, -9], "BE": [-7, -1], "cd": [-3, -4], "t": 3, "L2": 34, "lado": 1, "BC": [2, 11], "CB2": 125, "dotCACB": 95, "kk": 38, "F": [-5, -3], "other": [-5.64, 1.48], "D": [8, -16], "DF": [-13, 13], "DF2": [-6.942325581395349, -12.65953488372093], "t2": [-1, 1], "A": [4, 2], "AB": [-4, -2], "CA2": 85, "BE2": 50 }, { "CA": [1, 7], "BE": [3, -9], "cd": [3, 1], "t": 3, "L2": 25, "lado": 1, "BC": [-6, -12], "CB2": 180, "dotCACB": 90, "kk": 45, "F": [3, -4], "other": [0.0, -5.0], "D": [3, 51], "DF": [0, -55], "DF2": [4.2, -5.6], "t2": [-3, 1], "A": [-5, -5], "AB": [5, 5], "CA2": 50, "BE2": 90 }, { "CA": [0, -5], "BE": [-10, 4], "cd": [-7, -3], "t": 3, "L2": 10, "lado": 1, "BC": [11, 13], "CB2": 290, "dotCACB": 65, "kk": 26, "F": [-3, -1], "other": [-1.4827586206896552, 2.793103448275862], "D": [11, -11], "DF": [-14, 10], "DF2": [-12.482758620689655, 1.7688119503001536], "t2": [-1, 1], "A": [11, 8], "AB": [-11, -8], "CA2": 25, "BE2": 116 }, { "CA": [-9, 3], "BE": [-2, 14], "cd": [-11, 27], "t": 1, "L2": 72, "lado": 1, "BC": [9, -13], "CB2": 250, "dotCACB": 120, "kk": 96, "F": [-6, 6], "other": [4.08, 7.44], "D": [-12, -6], "DF": [6, 12], "DF2": [-25.214117647058824, 27.20470588235294], "t2": [-1, 17], "A": [0, -10], "AB": [0, 10], "CA2": 90, "BE2": 200 }, { "CA": [4, -3], "BE": [-5, -7], "cd": [1, -6], "t": 3, "L2": 10, "lado": 1, "BC": [-8, 11], "CB2": 185, "dotCACB": 65, "kk": 26, "F": [-1, -3], "other": [-2.5135135135135136, -1.9189189189189189], "D": [4, 2], "DF": [-5, -5], "DF2": [-3.151645809233358, -6.440319697129036], "t2": [-1, 1], "A": [-4, 8], "AB": [4, -8], "CA2": 25, "BE2": 74 }, { "CA": [0, 9], "BE": [12, 4], "cd": [9, 8], "t": 2, "L2": 72, "lado": 1, "BC": [-6, -12], "CB2": 180, "dotCACB": 108, "kk": 96, "F": [6, 6], "other": [8.4, -1.2], "D": [-6, 10], "DF": [12, -4], "DF2": [14.4, 20.8], "t2": [-2, 29], "A": [-6, -3], "AB": [6, 3], "CA2": 81, "BE2": 160 }, { "CA": [-6, 3], "BE": [8, -1], "cd": [-1, 5], "t": 1, "L2": 25, "lado": 1, "BC": [9, -6], "CB2": 117, "dotCACB": 72, "kk": 40, "F": [5, 0], "other": [4.846153846153846, -1.2307692307692308], "D": [-19, 8], "DF": [24, -8], "DF2": [4.69721767594108, 0.3436988543371522], "t2": [-2, 1], "A": [3, -3], "AB": [-3, 3], "CA2": 45, "BE2": 65 }, { "CA": [-6, 0], "BE": [10, 10], "cd": [-1, 11], "t": 2, "L2": 25, "lado": 1, "BC": [12, -12], "CB2": 288, "dotCACB": 72, "kk": 50, "F": [0, 5], "other": [5.0, 0.0], "D": [-34, -12], "DF": [34, 17], "DF2": [6.0, 12.0], "t2": [-22, 61], "A": [6, -12], "AB": [-6, 12], "CA2": 36, "BE2": 200 }, { "CA": [4, -4], "BE": [-8, 1], "cd": [-2, -3], "t": 3, "L2": 20, "lado": 1, "BC": [-2, 10], "CB2": 104, "dotCACB": 48, "kk": 30, "F": [-4, -2], "other": [-3.3846153846153846, 2.923076923076923], "D": [52, -44], "DF": [-56, 42], "DF2": [-5.972850678733032, -2.48868778280543], "t2": [-1, 1], "A": [2, 6], "AB": [-2, -6], "CA2": 32, "BE2": 65 }];

  /* ===================== PRACTICA Y REFUERZA: plantillas ===================== */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t } return a }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function shuffle(arr, r) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t } return arr }
  function sqrtTex(n) { let a = 1, b = n; for (let f = Math.floor(Math.sqrt(n)); f > 1; f--) { if (n % (f * f) === 0) { a = f; b = n / (f * f); break } } return b === 1 ? String(a) : (a === 1 ? '\\sqrt{' + b + '}' : a + '\\sqrt{' + b + '}') }
  function nT(x) { return x < 0 ? '-' + (-x) : String(x) }
  function vT(a, b) { return '(' + nT(a) + ',\\,' + nT(b) + ')' }
  function frT(p, q) { const g = gcd(p, q) || 1; p /= g; q /= g; if (q < 0) { p = -p; q = -q } return q === 1 ? nT(p) : (p < 0 ? '-\\frac{' + (-p) + '}{' + q + '}' : '\\frac{' + p + '}{' + q + '}') }
  function sgT(x) { return x < 0 ? '-' + (-x) : '+' + x }
  function fracTxt(p, q) { const g = gcd(p, q) || 1; p /= g; q /= g; if (q < 0) { p = -p; q = -q } const s = (q === 1 ? String(Math.abs(p)) : Math.abs(p) + '/' + q); return (p < 0 ? '\u2212' : '') + s }
  function pick(pool, seed) { const r = mulberry32(seed); const idx = Math.floor(r() * pool.length); return { i: pool[idx], idx: idx, r: r } }
  /* alternativas: se arman con una "ficha" {ok,html,err,msg,okMsg,reveal,ver:[ejercicio,paso]} */
  function armar(raw, r) {
    return raw.map(function (b) {
      const ops = shuffle(b.ops.map(function (o) { return { ok: !!o.ok, html: o.html, err: o.err || '', msg: o.msg || '', ver: o.ver || null } }), r);
      const okO = b.ops.filter(function (o) { return o.ok })[0];
      return { titulo: b.titulo, intro: b.intro, pista: b.pista, opciones: ops, okMsg: okO.okMsg, reveal: okO.reveal, okHtml: okO.html };
    });
  }
  function parseNum(s) {
    s = String(s).trim().replace(/[\u2212\u2013\u2014]/g, '-').replace(/\s+/g, ''); if (!s) return NaN;
    if (/^[+-]?\d+([.,]\d+)?$/.test(s)) return parseFloat(s.replace(',', '.'));
    const m = s.match(/^([+-]?\d+(?:[.,]\d+)?)\/([+-]?\d+(?:[.,]\d+)?)$/);
    if (m) { const dd = parseFloat(m[2].replace(',', '.')); if (dd === 0) return NaN; return parseFloat(m[1].replace(',', '.')) / dd }
    return NaN
  }
  function parseVec(txt) {
    let s = String(txt).trim().replace(/[\u2212\u2013\u2014]/g, '-');
    s = s.replace(/^[A-Za-z]{2}\s*=\s*/, '');
    s = s.replace(/^[\(\[<]\s*/, '').replace(/\s*[\)\]>]$/, '');
    let parts;
    if (s.indexOf(';') >= 0) parts = s.split(';');
    else if ((s.match(/,/g) || []).length === 1) parts = s.split(',');
    else parts = s.trim().split(/\s+/);
    if (parts.length !== 2) return null;
    const a = parseNum(parts[0]), b = parseNum(parts[1]);
    if (isNaN(a) || isNaN(b)) return null; return [a, b]
  }
  function eqv(a, b) { return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6 }
  const MSG_FORMATO = 'No pude leer eso como un vector. Escríbelo así: (a, b), por ejemplo (3, −2). Este intento no cuenta.';
  /* clasificador común: casos = [{v:[x,y], err, msg}] en orden de prioridad */
  function clasificar(res, v, casos, parcial) {
    if (!v) return { tipo: 'formato', msg: MSG_FORMATO };
    if (eqv(v, res)) return { tipo: 'ok' };
    for (let k = 0; k < casos.length; k++) { if (casos[k].v && eqv(v, casos[k].v)) return { tipo: 'cerca', err: casos[k].err, msg: casos[k].msg } }
    if (Math.abs(v[0] - res[0]) < 1e-6 || Math.abs(v[1] - res[1]) < 1e-6) return { tipo: 'cerca', err: 'Cálculo', msg: 'Vas cerca: una componente coincide. Revisa la otra con la ayuda.' };
    return { tipo: 'error', err: 'Cálculo', msg: parcial };
  }

  const PLANTILLAS = [];

  /* ------------------------- Pregunta 1: ángulos, tangente y distancia ------------------------- */
  PLANTILLAS.push({
    id: 1, nombre: 'Ángulos, tangente y distancia', min: 15, ej: 1, pool: P1POOL,
    resumen: 'Persecución de ángulos en un cuadrilátero inscriptible y distancia a un lado.',
    enunciado: function (i) { return T`Dado un cuadrilátero convexo $ABCD$, en sentido horario e inscriptible, con $\V{AC}=t${vT(i.a, i.b)}$, $t>0$, y $P$ un punto interior tal que $m\angle BAC=m\angle PCD=\alpha$, $d(P,\overline{AD})=${i.D0}$, $m\angle ACB=\theta$, $\tan(2\alpha+\theta)=${frT(i.mn[0], i.mn[1])}$ y $\V{CP}=${vT(i.c, i.d)}$. Halle $\V{AP}$.` },
    bloques: function (i, r) {
      const tg = frT(i.tg[0], i.tg[1]), tgn = frT(-i.tg[0], i.tg[1]), tgi = frT(i.tg[1], i.tg[0]), tb = frT(i.tb[0], i.tb[1]);
      const num = i.b * i.c - i.a * i.d, den = -i.a * i.c - i.b * i.d, mn = frT(i.mn[0], i.mn[1]);
      const t1 = i.t, t2 = i.t2[0] / i.t2[1], t2T = frT(i.t2[0], i.t2[1]);
      const regla = t2 < t1 ? 'menor' : 'mayor';
      const raw = [
        {
          titulo: 'Paso 1: ¿qué deberíamos hacer primero?',
          intro: T`Tienes un solo dato con ángulos, $\tan(2\alpha+\theta)=${mn}$, y otro con una distancia. No se dan coordenadas.`,
          ops: [
            { ok: 1, html: T`Escribir $\V{AP}=\V{AC}+\V{CP}$ y hallar la dirección de $\overline{AD}$ para usar la distancia.`, okMsg: 'Primero reducimos a una incógnita (t) y vemos qué falta para usar la distancia.', reveal: T`$\V{AP}=\V{AC}+\V{CP}=t${vT(i.a, i.b)}+${vT(i.c, i.d)}=(${i.a}t${sgT(i.c)},\ ${i.b}t${sgT(i.d)})$. Queda una sola incógnita, $t$, y falta la dirección de $\overline{AD}$.` },
            { html: T`Suponer que $\overline{AD}\perp\overline{AC}$ y calcular directamente la distancia de $P$ a esa recta.`, err: 'Suposición sin base', msg: 'Ese dato no está en el enunciado. La dirección de AD hay que deducirla con los ángulos y la tangente; suponerla lleva a una respuesta sin sustento.', ver: [1, 1] },
            { html: T`Calcular $\alpha$ y $\theta$ por separado con la calculadora y usarlos en la distancia.`, err: 'Procedimiento incorrecto', msg: 'Aquí todavía no corresponde ese procedimiento: con los datos solo se conoce tan(2α+θ), no cada ángulo por separado. Hay que trabajar con esa combinación.', ver: [1, 3] }],
          pista: 'Piensa en qué pide el problema y en qué datos involucran la incógnita t.'
        },
        {
          titulo: 'Paso 2: ¿qué relación entre ángulos usamos en el triángulo ACD?',
          intro: T`Sean $\beta=\angle CAD$ y $\gamma=\angle ACP$. Por ser inscriptible, $\angle ADC=\alpha+\theta$, y como $P$ está dentro de $ACD$, $\angle ACD=\gamma+\alpha$.`,
          ops: [
            { ok: 1, html: T`$\beta+\gamma=180^\circ-(2\alpha+\theta)$`, okMsg: 'La suma de ángulos de ACD es β + (γ+α) + (α+θ) = 180°.', reveal: T`Entonces $\tan(\beta+\gamma)=-\tan(2\alpha+\theta)=-${mn}$.` },
            { html: T`$\beta+\gamma=2\alpha+\theta$`, err: 'Suplementarios tratados como iguales', msg: 'Los ángulos de ACD suman 180°: β + (γ+α) + (α+θ) = 180°, así que β+γ es el suplemento de 2α+θ, no igual.', ver: [1, 3] },
            { html: T`$\beta+\gamma+(\alpha+\theta)=180^\circ$`, err: 'Ángulo omitido', msg: '∠ACD no es solo γ: incluye también α (= ∠PCD). Al olvidarlo se pierde un α en la suma.', ver: [1, 3] }],
          pista: 'Suma los tres ángulos del triángulo ACD y agrupa lo que sea 2α+θ.'
        },
        {
          titulo: T`Paso 3: ¿cuánto vale $\tan\gamma$?`,
          intro: T`$\gamma$ es el ángulo entre $\V{CA}=-t${vT(i.a, i.b)}$ y $\V{CP}=${vT(i.c, i.d)}$.`,
          ops: [
            { ok: 1, html: T`$\tan\gamma=${tg}$`, okMsg: 'Se usa tan = (CA^⊥·CP)/(CA·CP): numerador con el ortogonal, denominador con el producto escalar.', reveal: T`$\tan\gamma=\dfrac{${num}\,t}{${den}\,t}=${tg}$. Fíjate en que $t$ se cancela.` },
            { html: T`$\tan\gamma=${tgn}$`, err: 'Orden de los vectores', msg: 'Si cambias el orden en el numerador, el signo cambia. γ es agudo y su tangente es positiva.', ver: [1, 4] },
            { html: T`$\tan\gamma=${tgi}$`, err: 'Numerador y denominador invertidos', msg: 'La tangente con signo es (a^⊥·b)/(a·b): arriba el producto con el ortogonal, abajo el producto escalar.', ver: [1, 4] }],
          pista: T`Usa $\tan\theta=\dfrac{\vec a^{\perp}\cdot\vec b}{\vec a\cdot\vec b}$ con $\vec a=\V{CA}$ y $\vec b=\V{CP}$, y simplifica $t$.`
        },
        {
          titulo: 'Paso 4: ¿cómo obtenemos la dirección de AD?',
          intro: T`De $\tan(\beta+\gamma)=-${mn}$ y $\tan\gamma=${tg}$ se despeja $\tan\beta=${tb}$.`,
          ops: [
            { ok: 1, html: T`Plantear $\tan\beta=\dfrac{u^{\perp}\cdot\V{AC}}{u\cdot\V{AC}}$ con $\overline{AD}\parallel u$ y despejar la dirección.`, okMsg: 'D está a la derecha de AC: girando AD en sentido antihorario se llega a AC, así que β es positivo con ese orden.', reveal: T`Resolviendo queda $\overline{AD}\parallel${vT(i.u[0], i.u[1])}$.` },
            { html: T`Tomar $\tan\beta=${tb}$ como la pendiente de $\overline{AD}$ respecto del eje $X$, sin usar $\V{AC}$.`, err: 'β mal interpretado', msg: 'β es el ángulo entre AD y AC, no el ángulo de AD con el eje X. La dirección de AD sale de girar la de AC un ángulo β.', ver: [1, 6] },
            { html: T`Plantear $\tan\beta=\dfrac{\Pe{AC}\cdot u}{u\cdot\V{AC}}$ con $\overline{AD}\parallel u$ y despejar la dirección.`, err: 'Orden invertido', msg: 'Con AC^⊥·u mides el ángulo desde AC hacia AD (sentido contrario) y obtienes −tanβ: AD quedaría en el lado equivocado de AC.', ver: [1, 6] }],
          pista: 'Piensa de qué vector a qué vector se mide β, y recuerda de qué lado de AC está D.'
        },
        {
          titulo: 'Paso 5: la distancia da dos valores de t. ¿Cuál sirve?',
          intro: T`Como $\Pe{AD}\parallel${vT(-i.u[1], i.u[0])}$, la componente de $\V{AP}$ es $\dfrac{${i.h}t${sgT(i.k0)}}{${i.nu}}$. Imponiendo $d(P,\overline{AD})=${i.D0}$ sale $t=${t1}$ o $t=${t2T}$.`,
          ops: [
            { ok: 1, html: T`Quedarme con el valor que deja a $P$ del mismo lado de $\overline{AD}$ que $C$.`, okMsg: 'P es interior: está dentro del ángulo CAD, del mismo lado de AD que C.', reveal: T`Con $t=${t1}$ la altura de $P$ es $+${i.D0}$; con $t=${t2T}$ sería $-${i.D0}$, o sea al otro lado de $\overline{AD}$, fuera del cuadrilátero. Entonces $t=${t1}$.` },
            { html: T`Quedarme con la raíz ${regla} sin analizar dónde cae $P$ respecto de $\overline{AD}$.`, err: 'Raíz sin justificar', msg: 'Las dos raíces cumplen la distancia, pero con t = ' + fracTxt(i.t2[0], i.t2[1]) + ' el punto P queda al otro lado de AD, fuera del cuadrilátero.', ver: [1, 7] },
            { html: T`Quedarme con las dos raíces, porque ambas cumplen la distancia.`, err: 'No descartar', msg: 'Una sola puede ser: con la otra, P queda fuera del cuadrilátero (altura negativa).', ver: [1, 7] }],
          pista: T`Piensa dónde está $P$ respecto de $\overline{AD}$ si es un punto interior.`
        }
      ];
      return armar(raw, r);
    },
    finalEtq: function (i) { return T`Resultado final: calcula $\V{AP}$ con $t=${i.t}$ y escríbelo como $(a,b)$.` },
    ayuda: function (i) { return T`$\V{AP}=\V{AC}+\V{CP}=t${vT(i.a, i.b)}+${vT(i.c, i.d)}$ con el valor de $t$ que elegiste.` },
    clasifica: function (i, v) {
      return clasificar(i.AP, v, [
        { v: [-i.AP[0], -i.AP[1]], err: 'AP en lugar de PA', msg: 'Vas cerca: lo que escribiste es el vector opuesto, PA. AP va de A hacia P.' },
        { v: i.AC, err: 'Paso incompleto', msg: 'Vas cerca: ese es AC. Falta sumar CP: AP = AC + CP.' },
        { v: i.AP2, err: 'Raíz equivocada', msg: 'Parece que usaste el otro valor de t. Con él, P queda al otro lado de AD (fuera del cuadrilátero).' }],
        'Todavía no coincide. Revisa el valor de t y la suma AP = AC + CP; puedes usar la ayuda.');
    },
    resultado: function (i) { return i.AP },
    solucion: function (i) {
      const num = i.b * i.c - i.a * i.d, den = -i.a * i.c - i.b * i.d, tg = frT(i.tg[0], i.tg[1]), tb = frT(i.tb[0], i.tb[1]), mn = frT(i.mn[0], i.mn[1]);
      const t2T = frT(i.t2[0], i.t2[1]);
      return [
        T`$\V{AP}=\V{AC}+\V{CP}=t${vT(i.a, i.b)}+${vT(i.c, i.d)}$: queda la incógnita $t$.`,
        T`$P$ está a la derecha de $\V{AC}$: $\Pe{AC}\cdot\V{CP}=${vT(-i.b, i.a)}\cdot${vT(i.c, i.d)}=${-i.b * i.c + i.a * i.d}<0$, igual que $D$. Entonces $P$ está dentro del triángulo $ACD$.`,
        T`Inscriptible: $\angle ADC=\alpha+\theta$; $\angle ACD=\gamma+\alpha$; suma en $ACD$: $\beta+\gamma=180^\circ-(2\alpha+\theta)$, así que $\tan(\beta+\gamma)=-${mn}$.`,
        T`$\tan\gamma=\dfrac{${num}\,t}{${den}\,t}=${tg}$.`,
        T`$\dfrac{\tan\beta+${tg}}{1-${tg}\tan\beta}=-${mn}$ da $\tan\beta=${tb}$.`,
        T`Con $\overline{AD}\parallel u=(x,y)$ y $\tan\beta=\dfrac{u^{\perp}\cdot\V{AC}}{u\cdot\V{AC}}$ se obtiene $\overline{AD}\parallel${vT(i.u[0], i.u[1])}$.`,
        T`Distancia: $\dfrac{${i.h}t${sgT(i.k0)}}{${i.nu}}=\pm${i.D0}$ da $t=${i.t}$ o $t=${t2T}$. Como $P$ es interior (altura positiva), $t=${i.t}$.`,
        T`$\V{AP}=${i.t}${vT(i.a, i.b)}+${vT(i.c, i.d)}=${vT(i.AP[0], i.AP[1])}$.`];
    }
  });

  /* ---------------- Pregunta 2: sumar ecuaciones con proyección y ortogonal ---------------- */
  PLANTILLAS.push({
    id: 2, nombre: 'Sumar ecuaciones con proyección y ortogonal', min: 12, ej: 2, pool: P2POOL,
    resumen: 'Álgebra vectorial: se cancela la proyección y se descarta una raíz con «obtuso en B».',
    enunciado: function (i) {
      const x = i.AC[0], y = i.AC[1], u = i.w[0], v = i.w[1];
      return T`Sea $ABCD$ un cuadrilátero convexo, en sentido horario, obtuso en $B$, con $|\V{AB}|=${sqrtTex(i.L2)}$, $\V{BC}=k${vT(u, v)}$, $k>0$, y:<div class="eq">(C1) $\left|2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}-\V{AB}+\V{CA}\right|=|\V{BC}|$</div><div class="eq">(C2) $\V{DA}+2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}-\V{AB}=\Pe{AC}$</div><div class="eq">(C3) $\V{CD}-2\operatorname{proy}_{\overrightarrow{AB}}\V{AC}+\V{AB}+2\V{AC}=${vT(x + y, y - x)}$</div>Determine $\V{DC}$.`;
    },
    bloques: function (i, r) {
      const x = i.AC[0], y = i.AC[1], u = i.w[0], v = i.w[1], m = x + y, n = y - x, mn = vT(m, n);
      const g = gcd(gcd(u * u + v * v, 2 * (x * u + y * v)), x * x + y * y - i.L2), qa = (u * u + v * v) / g, qb = 2 * (x * u + y * v) / g, qc = (x * x + y * y - i.L2) / g;
      const bab = function (k) { const abx = x - k * u, aby = y - k * v; return -abx * (k * u) - aby * (k * v) };
      const raw = [
        {
          titulo: 'Paso 1: ¿qué deberíamos hacer primero?',
          intro: T`Ya tienes las tres condiciones. Fíjate en cómo aparece $\operatorname{proy}_{\overrightarrow{AB}}\V{AC}$ en cada una.`,
          ops: [
            { ok: 1, html: 'Sumar C2 y C3 miembro a miembro para cancelar las proyecciones.', okMsg: 'Primero sumamos C2 y C3: así la proyección desaparece sin calcularla.', reveal: T`Al sumar, $+2\operatorname{proy}$ con $-2\operatorname{proy}$ se cancelan, y $-\V{AB}$ con $+\V{AB}$ también. Queda: $\V{DA}+\V{CD}+2\V{AC}=\Pe{AC}+${mn}$.` },
            { html: T`Calcular $\operatorname{proy}_{\overrightarrow{AB}}\V{AC}$ con la fórmula, usando las coordenadas de $\V{AB}$ y de $\V{AC}$ para despejar lo que falta.`, err: 'Procedimiento incorrecto', msg: 'Aquí todavía no corresponde aplicar ese procedimiento: la fórmula necesita las coordenadas de AB y de AC, y aún no conocemos ninguna de las dos. Primero hay que despejar AC.', ver: [2, 1] },
            { html: 'Elevar C1 al cuadrado para hallar k.', err: 'Dato que no aporta', msg: 'Al desarrollar C1 siempre queda 0 = 0: 2·proy − v es el reflejo de v y conserva su módulo. Es una identidad y no te da k. Busca una condición que sí relacione las incógnitas.', ver: [2, 8] }],
          pista: 'Mira C2 y C3: ¿qué término aparece en las dos, pero con signo opuesto?'
        },
        {
          titulo: 'Paso 2: tras sumar, ¿qué ecuación queda solo con AC?',
          intro: T`Tienes $\V{DA}+\V{CD}+2\V{AC}=\Pe{AC}+${mn}$. Falta reemplazar $\V{DA}+\V{CD}$.`,
          ops: [
            { ok: 1, html: T`$\V{AC}-\Pe{AC}=${mn}$`, okMsg: 'Encadenando C→D→A queda CA = −AC. Entonces −AC + 2AC = AC, y al pasar AC⊥ al otro miembro cambia de signo.', reveal: T`Con eso, la ecuación solo tiene a $\V{AC}$ como incógnita.` },
            { html: T`$3\V{AC}-\Pe{AC}=${mn}$`, err: 'Encadenamiento de vectores', msg: 'Eso sale si tomas CD + DA = AC. Pero C→D→A empieza en C y termina en A: es CA = −AC. Entonces −AC + 2AC = AC, no 3AC.', ver: [2, 2] },
            { html: T`$\V{AC}+\Pe{AC}=${mn}$`, err: 'Error de signo', msg: 'Al pasar AC⊥ al otro miembro debe cambiar de signo: AC = AC⊥ + ' + ('(' + nT(m) + ', ' + nT(n) + ')') + ' ⇒ AC − AC⊥ = ' + ('(' + nT(m) + ', ' + nT(n) + ')') + '.', ver: [2, 2] }],
          pista: 'Encadena punta con cola: C → D → A. ¿A qué vector equivale?'
        },
        {
          titulo: 'Paso 3: ¿cómo queda esa ecuación en componentes?',
          intro: T`Sea $\V{AC}=(x,y)$. Recuerda que $(a,b)^{\perp}=(-b,a)$.`,
          ops: [
            { ok: 1, html: T`$(x+y,\ y-x)=${mn}$`, okMsg: 'Para AC = (x, y), AC⊥ = (−y, x); restando componente a componente queda (x + y, y − x).', reveal: T`Resolviendo $x+y=${nT(m)}$ y $y-x=${nT(n)}$ sale $\V{AC}=${vT(x, y)}$.` },
            { html: T`$(x-y,\ y+x)=${mn}$`, err: 'Ortogonal mal aplicado', msg: 'Eso sale si tomas (a, b)⊥ = (b, −a), que es el giro horario. En el curso, (a, b)⊥ = (−b, a): para AC = (x, y), AC⊥ = (−y, x).', ver: [2, 3] },
            { html: T`$(x+y,\ x-y)=${mn}$`, err: 'Error de signo', msg: 'Revisa la segunda componente: es la de AC menos la de AC⊥, o sea y − x, no x − y.', ver: [2, 3] }],
          pista: T`Escribe primero $\Pe{AC}$ con la regla $(a,b)^{\perp}=(-b,a)$ y luego resta componente a componente.`
        },
        {
          titulo: 'Paso 4: |AB| deja dos valores de k. ¿Cómo decides cuál sirve?',
          intro: T`Como $\V{AC}=\V{AB}+\V{BC}$, $\V{AB}=\V{AC}-\V{BC}=(${x}${sgT(-u)}k,\ ${y}${sgT(-v)}k)$. Imponiendo $|\V{AB}|^2=${i.L2}$ queda $$${qa}k^2-${qb}k+${qc}=0$$ con raíces $k=${i.k1}$ y $k=${i.k2}$.`,
          ops: [
            { ok: 1, html: 'Evaluar BA·BC con cada k y elegir el que da un valor negativo.', okMsg: '«Obtuso en B» equivale a BA·BC < 0, y solo uno de los valores de k lo cumple.', reveal: T`Con $k=${i.k1}$: $\V{BA}\cdot\V{BC}=${nT(bab(i.k1))}<0$ (sirve). Con $k=${i.k2}$: $\V{BA}\cdot\V{BC}=${nT(bab(i.k2))}>0$ (se descarta). Entonces $k=${i.k1}$, $\V{AB}=${vT(i.AB[0], i.AB[1])}$ y $\V{BC}=${vT(i.BC[0], i.BC[1])}$.` },
            { html: 'Descartar una raíz con la condición k > 0.', err: 'Dato que no discrimina', msg: 'Las dos raíces (k = ' + i.k1 + ' y k = ' + i.k2 + ') son positivas, así que k > 0 no descarta ninguna.', ver: [2, 5] },
            { html: 'Descartar una de las raíces usando la condición de sentido horario del cuadrilátero.', err: 'Dato que no discrimina', msg: 'Con k = ' + i.k1 + ' y con k = ' + i.k2 + ' el cuadrilátero queda en sentido horario (el signo de AB × BC es el mismo), así que no distingue.', ver: [2, 5] }],
          pista: 'Fíjate qué datos cumplen las dos raíces y cuál condición solo cumple una: el ángulo en B.'
        },
        {
          titulo: 'Paso 5: ¿cómo llegamos a DC?',
          intro: T`Ya conocemos $\V{AC}=${vT(x, y)}$ y $\V{AB}=${vT(i.AB[0], i.AB[1])}$. Para el vector que falta usaremos C2.`,
          ops: [
            { ok: 1, html: T`$\V{DC}=\V{DA}+\V{AC}$, con $\V{DA}$ despejado de C2`, okMsg: 'D→A→C encadena DA con AC.', reveal: T`De C2: $\V{DA}=\Pe{AC}-2\operatorname{proy}+\V{AB}$.` },
            { html: T`$\V{DC}=\V{AC}-\V{DA}$, con $\V{DA}$ despejado de C2`, err: 'Encadenamiento de vectores', msg: 'D→A→C une la punta de DA con la cola de AC, así que se suman. Restar DA te mueve en sentido contrario.', ver: [2, 7] },
            { html: T`$\V{DC}=-(\V{DA}+\V{AC})$, con $\V{DA}$ despejado de C2`, err: 'DC en lugar de CD', msg: 'Eso es el vector opuesto, CD. DC va de D hacia C, y D→A→C da DA + AC.', ver: [2, 7] }],
          pista: 'Piensa el camino de D a C pasando por A y encadena punta con cola.'
        }
      ];
      return armar(raw, r);
    },
    finalEtq: function (i) { return T`Resultado final: calcula $\operatorname{proy}_{\overrightarrow{AB}}\V{AC}$, después $\V{DA}$ (de C2) y por último $\V{DC}$. Escríbelo como $(a,b)$.` },
    ayuda: function (i) { return T`Primero la proyección: $\left(\dfrac{\V{AC}\cdot\V{AB}}{|\V{AB}|^2}\right)\V{AB}$. Luego $\V{DA}=\Pe{AC}-2\operatorname{proy}+\V{AB}$ y, al final, $\V{DC}=\V{DA}+\V{AC}$.` },
    clasifica: function (i, v) {
      return clasificar(i.DC, v, [
        { v: [-i.DC[0], -i.DC[1]], err: 'DC en lugar de CD', msg: 'Vas cerca: lo que escribiste es el vector opuesto, CD. DC va de D hacia C.' },
        { v: i.DA, err: 'Paso incompleto', msg: 'Vas cerca: ese es DA. Falta el último paso: DC = DA + AC.' },
        { v: i.DC2, err: 'Raíz equivocada', msg: 'Parece que usaste el otro valor de k. Revisa el criterio «obtuso en B»: BA·BC debe ser negativo.' }],
        'Todavía no coincide. Revisa la proyección y el despeje de DA; puedes usar la ayuda.');
    },
    resultado: function (i) { return i.DC },
    solucion: function (i) {
      const x = i.AC[0], y = i.AC[1], u = i.w[0], v = i.w[1], m = x + y, n = y - x;
      const g = gcd(gcd(u * u + v * v, 2 * (x * u + y * v)), x * x + y * y - i.L2), qa = (u * u + v * v) / g, qb = 2 * (x * u + y * v) / g, qc = (x * x + y * y - i.L2) / g;
      const dot = x * i.AB[0] + y * i.AB[1], ab2 = i.AB[0] * i.AB[0] + i.AB[1] * i.AB[1];
      return [
        T`Sumamos C2 y C3: $\V{AC}-\Pe{AC}=${vT(m, n)}$. (C1 no se usa: es una identidad.)`,
        T`Con $\V{AC}=(x,y)$: $x+y=${nT(m)}$ y $y-x=${nT(n)}$, así que $\V{AC}=${vT(x, y)}$.`,
        T`De $|\V{AB}|^2=${i.L2}$ sale $$${qa}k^2-${qb}k+${qc}=0$$ es decir $k=${i.k1}$ o $k=${i.k2}$. Solo $k=${i.k1}$ da $\V{BA}\cdot\V{BC}<0$, así que $\V{AB}=${vT(i.AB[0], i.AB[1])}$ y $\V{BC}=${vT(i.BC[0], i.BC[1])}$.`,
        T`$\operatorname{proy}_{\overrightarrow{AB}}\V{AC}=\dfrac{${dot}}{${ab2}}${vT(i.AB[0], i.AB[1])}=${vT(i.p[0], i.p[1])}$.`,
        T`$\V{DA}=\Pe{AC}-2\operatorname{proy}+\V{AB}=${vT(-y, x)}-${vT(2 * i.p[0], 2 * i.p[1])}+${vT(i.AB[0], i.AB[1])}=${vT(i.DA[0], i.DA[1])}$.`,
        T`$\V{DC}=\V{DA}+\V{AC}=${vT(i.DA[0], i.DA[1])}+${vT(x, y)}=${vT(i.DC[0], i.DC[1])}$.`];
    }
  });

  /* ------------------------ Pregunta 3: semejanza por ángulos iguales ------------------------ */
  PLANTILLAS.push({
    id: 3, nombre: 'Semejanza por ángulos iguales', min: 15, ej: 3, pool: P3POOL,
    resumen: 'Dos pares de ángulos iguales dan una semejanza; con ella se ubican F y D.',
    enunciado: function (i) { return T`En un triángulo $ABC$, sentido horario, obtuso en $A$, en la prolongación de $\overline{CA}$ se ubica el punto $D$ y $E$ es un punto exterior relativo al lado $\overline{BC}$ tal que $F$ es un punto de $\overline{DE}$ (a la izquierda de $\V{BE}$, mirando de $B$ hacia $E$), $m\angle FBE=m\angle ACB$, $|\V{BF}|=${sqrtTex(i.L2)}$, $\V{BE}=${vT(i.BE[0], i.BE[1])}$, $\V{CE}=t${vT(i.cd[0], i.cd[1])}$, $t>0$, $m\angle DFB=m\angle DAB$ y $\V{CA}=${vT(i.CA[0], i.CA[1])}$. Calcule $\V{DF}$.` },
    bloques: function (i, r) {
      const a = i.cd[0] * i.cd[0] + i.cd[1] * i.cd[1], b = 2 * (i.BE[0] * i.cd[0] + i.BE[1] * i.cd[1]), kq = i.CB2 - i.BE2;
      const t2T = frT(i.t2[0], i.t2[1]);
      const raw = [
        {
          titulo: 'Paso 1: ¿qué obtenemos de las dos igualdades de ángulos?',
          intro: T`Tienes $m\angle FBE=m\angle ACB$ y $m\angle DFB=m\angle DAB$, con $F$ entre $D$ y $E$ y $D$ más allá de $A$ en la recta $CA$.`,
          ops: [
            { ok: 1, html: T`$\triangle FBE\sim\triangle ACB$, con $F\leftrightarrow A$, $B\leftrightarrow C$, $E\leftrightarrow B$.`, okMsg: '∠BFE = 180° − ∠DFB = 180° − ∠DAB = ∠BAC, y ∠FBE = ∠ACB: dos ángulos iguales dan semejanza.', reveal: T`Lados correspondientes: $FB\leftrightarrow AC$, $BE\leftrightarrow CB$, $FE\leftrightarrow AB$.` },
            { html: T`$\triangle FBE\sim\triangle ABC$, con $F\leftrightarrow A$, $B\leftrightarrow B$, $E\leftrightarrow C$.`, err: 'Correspondencia de vértices', msg: 'Los ángulos iguales están en F=A y en B=C: el vértice B de FBE corresponde a C de ACB, no a B. Escribe el orden F-B-E ↔ A-C-B.', ver: [3, 2] },
            { html: T`$m\angle BFE=m\angle DAB$, y por eso los triángulos son semejantes.`, err: 'Suplementarios tratados como iguales', msg: '∠DFB = ∠DAB, pero ∠BFE es el suplemento de ∠DFB (F está entre D y E). Debes pasar por el suplemento: ∠BFE = ∠BAC.', ver: [3, 2] }],
          pista: 'Escribe cuánto vale ∠BFE usando que D, F y E están alineados.'
        },
        {
          titulo: 'Paso 2: ¿qué proporción da |CB|?',
          intro: T`Con la correspondencia $F\text{-}B\text{-}E\leftrightarrow A\text{-}C\text{-}B$, los lados correspondientes son $FB\leftrightarrow AC$ y $BE\leftrightarrow CB$.`,
          ops: [
            { ok: 1, html: T`$|\V{CB}|=\dfrac{|\V{BE}|\,|\V{CA}|}{|\V{BF}|}$`, okMsg: 'De |BF|/|CA| = |BE|/|CB| se despeja |CB|.', reveal: T`$|\V{CB}|^2=\dfrac{${i.BE2}\cdot${i.CA2}}{${i.L2}}=${i.CB2}$.` },
            { html: T`$|\V{CB}|=\dfrac{|\V{BF}|\,|\V{CA}|}{|\V{BE}|}$`, err: 'Proporción invertida', msg: 'Esa fórmula pone el cociente al revés: |BF|/|CA| = |BE|/|CB|, así que |CB| = |BE|·|CA|/|BF|.', ver: [3, 3] },
            { html: T`$|\V{CB}|=\dfrac{|\V{BE}|\,|\V{BF}|}{|\V{CA}|}$`, err: 'Lados no correspondientes', msg: 'Mezcla lados que no se corresponden: FB ↔ AC (BF con CA) y BE ↔ CB.', ver: [3, 3] }],
          pista: 'Empareja cada lado de FBE con el de ACB que le corresponde y despeja |CB|.'
        },
        {
          titulo: 'Paso 3: ¿cómo sale BC para hallar t?',
          intro: T`Tenemos $\V{BE}=${vT(i.BE[0], i.BE[1])}$ y $\V{CE}=t${vT(i.cd[0], i.cd[1])}$, con $B\to C\to E$.`,
          ops: [
            { ok: 1, html: T`$\V{BC}=\V{BE}-\V{CE}$`, okMsg: 'BE = BC + CE, entonces BC = BE − CE.', reveal: T`Imponiendo $|\V{BC}|^2=${i.CB2}$ queda $$${a}t^2${sgT(-b)}t-${kq}=0$$ con raíces $t=${i.t}$ y $t=${t2T}$. Como $t>0$, $t=${i.t}$ y $\V{BC}=${vT(i.BC[0], i.BC[1])}$.` },
            { html: T`$\V{BC}=\V{CE}-\V{BE}$`, err: 'Signo cambiado', msg: 'Encadena punta con cola: B→C→E da BE = BC + CE, así que BC = BE − CE. Al revés obtienes CB.', ver: [3, 4] },
            { html: T`$\V{BC}=\V{BE}+\V{CE}$`, err: 'Encadenamiento de vectores', msg: 'BE ya incluye a CE: BE = BC + CE. Sumarlos duplica CE.', ver: [3, 4] }],
          pista: 'Encadena punta con cola: B → C → E.'
        },
        {
          titulo: 'Paso 4: ¿cómo ubicamos F?',
          intro: T`Con $\theta=m\angle ACB$ se tiene $\V{BF}\cdot\V{BE}=|\V{BF}||\V{BE}|\cos\theta=${i.kk}$. Sea $\V{BF}=(p,q)$.`,
          ops: [
            { ok: 1, html: T`Plantear $\V{BF}\cdot\V{BE}=${i.kk}$ y $|\V{BF}|^2=${i.L2}$, y elegir la que cumpla $\Pe{BE}\cdot\V{BF}>0$.`, okMsg: 'Se necesitan las dos ecuaciones (ángulo y longitud); salen dos soluciones y el lado izquierdo decide.', reveal: T`Con la condición de lado izquierdo queda $\V{BF}=${vT(i.F[0], i.F[1])}$.` },
            { html: T`Plantear solo $|\V{BF}|^2=${i.L2}$ y tomar cualquier vector de esa longitud, sin usar el ángulo.`, err: 'Condición insuficiente', msg: 'Hay infinitos vectores con esa longitud: falta la condición del ángulo ∠FBE = θ.', ver: [3, 6] },
            { html: T`Plantear solo $\V{BF}\cdot\V{BE}=${i.kk}$ (el ángulo) y no usar la longitud de $\V{BF}$, que es dato.`, err: 'Condición insuficiente', msg: 'Esa ecuación sola describe una recta con infinitas soluciones: falta |BF|.', ver: [3, 6] }],
          pista: 'Un vector (p, q) tiene dos incógnitas: ¿cuántas ecuaciones necesitas?'
        },
        {
          titulo: 'Paso 5: ¿cómo llegamos a DF?',
          intro: T`Tomando $B$ como origen: $C=${vT(i.BC[0], i.BC[1])}$, $E=${vT(i.BE[0], i.BE[1])}$ y $F=${vT(i.F[0], i.F[1])}$. $D$ está en la recta $CA$ más allá de $A$ y en la recta $EF$.`,
          ops: [
            { ok: 1, html: T`Escribir $D=C+s\,\V{CA}$ con $s>1$, imponer $D\in EF$ y calcular $\V{DF}=F-D$.`, okMsg: 'D, F y E están alineados, y D es un punto de la prolongación de CA más allá de A.', reveal: 'Con esas dos condiciones D queda determinado.' },
            { html: T`Escribir $D=C+s\,\V{CA}$ con $0<s<1$ ($D$ entre $C$ y $A$) e imponer que $D$ esté en la recta $EF$.`, err: 'Prolongación mal ubicada', msg: 'D está en la prolongación de CA más allá de A: s > 1 (con s = 1 estás en A).', ver: [3, 7] },
            { html: T`Ubicar bien a $D$ ($s>1$) pero calcular $\V{DF}=D-F$.`, err: 'DF en lugar de FD', msg: 'DF va de D hacia F: DF = F − D. D − F es FD, el opuesto.', ver: [3, 7] }],
          pista: 'Piensa en cuál es el parámetro s en A y hacia dónde crece al alejarte de C.'
        }
      ];
      return armar(raw, r);
    },
    finalEtq: function (i) { return T`Resultado final: ubica $D$ y calcula $\V{DF}$. Escríbelo como $(a,b)$.` },
    ayuda: function (i) { return T`Con $B=(0,0)$: $D=C+s\,\V{CA}$ y $D$ en la recta $EF$ fija el valor de $s$ (mayor que 1). Luego $\V{DF}=F-D$.` },
    clasifica: function (i, v) {
      return clasificar(i.DF, v, [
        { v: [-i.DF[0], -i.DF[1]], err: 'DF en lugar de FD', msg: 'Vas cerca: lo que escribiste es el vector opuesto, FD. DF va de D hacia F.' },
        { v: i.DF2, err: 'Configuración equivocada', msg: 'Parece que tomaste F del otro lado de BE. El enunciado indica que F está a la izquierda de BE: BE^⊥·BF > 0.' }],
        'Todavía no coincide. Revisa la ubicación de D (s > 1) y la resta F − D; puedes usar la ayuda.');
    },
    resultado: function (i) { return i.DF },
    solucion: function (i) {
      const a = i.cd[0] * i.cd[0] + i.cd[1] * i.cd[1], b = 2 * (i.BE[0] * i.cd[0] + i.BE[1] * i.cd[1]), kq = i.CB2 - i.BE2;
      const t2T = frT(i.t2[0], i.t2[1]);
      const C = i.BC, CA = i.CA;
      const s = CA[0] !== 0 ? (i.D[0] - C[0]) / CA[0] : (i.D[1] - C[1]) / CA[1];
      const sf = CA[0] !== 0 ? frT(i.D[0] - C[0], CA[0]) : frT(i.D[1] - C[1], CA[1]);
      return [
        T`Los ángulos iguales y sus suplementos dan $\triangle FBE\sim\triangle ACB$ ($F\leftrightarrow A$, $B\leftrightarrow C$, $E\leftrightarrow B$).`,
        T`$|\V{CB}|^2=\dfrac{|\V{BE}|^2|\V{CA}|^2}{|\V{BF}|^2}=\dfrac{${i.BE2}\cdot${i.CA2}}{${i.L2}}=${i.CB2}$.`,
        T`$\V{BC}=\V{BE}-\V{CE}$ y $|\V{BC}|^2=${i.CB2}$ dan $$${a}t^2${sgT(-b)}t-${kq}=0$$ con $t=${i.t}$ o $t=${t2T}$; como $t>0$, $t=${i.t}$ y $\V{BC}=${vT(i.BC[0], i.BC[1])}$.`,
        T`$\V{BF}\cdot\V{BE}=${i.kk}$ y $|\V{BF}|^2=${i.L2}$ dan dos soluciones; con $\Pe{BE}\cdot\V{BF}>0$ queda $\V{BF}=${vT(i.F[0], i.F[1])}$.`,
        T`$D=C+s\,\V{CA}$ con $D$ en la recta $EF$ da $s=${sf}>1$ y $D=${vT(i.D[0], i.D[1])}$.`,
        T`$\V{DF}=F-D=${vT(i.F[0], i.F[1])}-${vT(i.D[0], i.D[1])}=${vT(i.DF[0], i.DF[1])}$.`];
    }
  });

  /* ============================ NÚCLEO: utilidades, KaTeX, estado ============================ */
  const mem = {};
  function lsGet(k) { try { const v = window.localStorage.getItem(PREFIJO + k); if (v !== null) return v } catch (e) { } return (k in mem) ? mem[k] : null }
  function lsSet(k, v) { mem[k] = v; try { window.localStorage.setItem(PREFIJO + k, v) } catch (e) { } }
  function jget(k, def) { try { const v = lsGet(k); return v ? JSON.parse(v) : def } catch (e) { return def } }
  function jset(k, v) { lsSet(k, JSON.stringify(v)) }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e }
  function $(s, r) { return (r || document).querySelector(s) }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)) }
  function cargar(src, tipo) {
    return new Promise(function (ok, err) {
      if (tipo === 'css') { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = src; l.onload = ok; l.onerror = err; document.head.appendChild(l) }
      else { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = err; document.head.appendChild(s) }
    })
  }
  let katexP = null, jsxP = null;
  function cargarKatex() { if (!katexP) katexP = Promise.all([cargar(RUTA_LIB + 'katex/katex.min.css', 'css'), cargar(RUTA_LIB + 'katex/katex.min.js')]); return katexP }
  function cargarJSX() { if (!jsxP) jsxP = Promise.all([cargar(RUTA_LIB + 'jsxgraph/jsxgraph.css', 'css'), cargar(RUTA_LIB + 'jsxgraph/jsxgraphcore.js')]); return jsxP }
  const MACROS = { '\\V': '\\overrightarrow{#1}', '\\Pe': '\\overrightarrow{#1}^{\\perp}' };
  function tex(s, disp) { try { return window.katex.renderToString(s, { throwOnError: false, displayMode: !!disp, macros: Object.assign({}, MACROS) }) } catch (e) { return esc(s) } }
  function M(s) { if (!window.katex) return s; return String(s).replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, function (m, a, b) { return a !== undefined ? tex(a, true) : tex(b, false) }) }
  function SYM(d) { return '<symbol id="i-' + d[0] + '" viewBox="0 0 24 24">' + d[1] + '</symbol>' }
  const ST = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' + [
    ['error', '<path d="M12 3 2.5 20h19L12 3z" ' + ST + '/><path d="M12 10v4M12 17.2v.1" ' + ST + '/>'],
    ['tip', '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z" ' + ST + '/>'],
    ['formula', '<text x="12" y="18" text-anchor="middle" font-size="19" font-style="italic" font-family="Georgia,serif" fill="currentColor">ƒ</text>'],
    ['ok', '<circle cx="12" cy="12" r="9" ' + ST + '/><path d="m8 12.5 3 3 5-6" ' + ST + '/>'],
    ['llevarte', '<path d="M7 3h10v18l-5-4-5 4V3z" ' + ST + '/>'],
    ['fallo', '<circle cx="12" cy="12" r="9" ' + ST + '/><path d="m9 9 6 6M15 9l-6 6" ' + ST + '/>'],
    ['menu', '<path d="M4 7h16M4 12h16M4 17h16" ' + ST + '/>'],
    ['print', '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" ' + ST + '/>'],
    ['play', '<path d="M8 5v14l11-7L8 5z" ' + ST + '/>'],
    ['help', '<circle cx="12" cy="12" r="9" ' + ST + '/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17v.1" ' + ST + '/>'],
    ['compass', '<circle cx="12" cy="12" r="9" ' + ST + '/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z" ' + ST + '/>'],
    ['target', '<circle cx="12" cy="12" r="9" ' + ST + '/><circle cx="12" cy="12" r="4.5" ' + ST + '/><path d="M12 12v.1" ' + ST + '/>'],
    ['eye', '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" ' + ST + '/><circle cx="12" cy="12" r="2.8" ' + ST + '/>'],
    ['route', '<circle cx="6" cy="18" r="2.2" ' + ST + '/><circle cx="18" cy="6" r="2.2" ' + ST + '/><path d="M8.2 18h6.3a3 3 0 0 0 0-6H9.5a3 3 0 0 1 0-6h6.3" ' + ST + '/>'],
    ['chev', '<path d="m6 9 6 6 6-6" ' + ST + '/>'],
    ['flame', '<path d="M12 3c1 3.5 4.5 4.8 4.5 9a4.5 4.5 0 0 1-9 0c0-1.7.7-2.8 1.8-3.8.2 1.2.9 1.8 1.5 1.8C10.4 7.6 11.4 5.6 12 3z" ' + ST + '/>'],
    ['bolt', '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z" ' + ST + '/>'],
    ['link', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" ' + ST + '/>'],
    ['refresh', '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" ' + ST + '/>'],
    ['palette', '<path d="M12 3a9 9 0 1 0 0 18c1.6 0 2.2-1.1 1.6-2.2-.6-1.1-.2-2.3 1.1-2.3H17a4 4 0 0 0 4-4c0-5-4.4-9.5-9-9.5z" ' + ST + '/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/><circle cx="16" cy="10.5" r="1" fill="currentColor"/>'],
    ['drop', '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" ' + ST + '/>'],
    ['arrow', '<path d="M5 12h14M13 6l6 6-6 6" ' + ST + '/>'],
    ['map', '<path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4zM9 4v13M15 7v13" ' + ST + '/>']
  ].map(SYM).join('') + '</defs></svg>';
  function ico(id) { return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>' }
  const CAJA = { error: ['e2', 'error', 'Error típico'], tip: ['e3', 'tip', 'Tip'], formula: ['e4', 'formula', 'Fórmula'], ok: ['e5', 'ok', 'Resultado'], llev: ['e6', 'llevarte', 'Lo que debes llevarte'] };
  function caja(tipo, label, body) {
    const c = CAJA[tipo];
    return '<div class="bx ' + c[0] + '" data-print="show"><div class="bx-t">' + ico(c[1]) + '<span>' + label + '</span></div><div class="bx-c">' + body + '</div></div>';
  }

  /* ============================ Rutas ============================ */
  const PAGINAS = [
    { id: 'inicio', titulo: 'Inicio', ruta: '#/inicio' },
    { id: 'resolucion', titulo: 'Resolución', ruta: '#/resolucion/1' },
    { id: 'estrategias', titulo: 'Tips', ruta: '#/estrategias' },
    { id: 'practica', titulo: 'Practica y Refuerza', ruta: '#/practica' }
  ];
  let actual = 'inicio', actualQ = 1, raiz = null, vista = null;
  function paginaPorId(id) { return PAGINAS.filter(function (p) { return p.id === id })[0] || PAGINAS[0] }
  function parseHash() {
    const h = (window.location.hash || '').replace(/^#\/?/, ''); if (!h) return { id: 'inicio', q: 1, paso: 0 };
    const partes = h.split('?'); const seg = partes[0].split('/'); const qs = {};
    (partes[1] || '').split('&').forEach(function (x) { const kv = x.split('='); if (kv[0]) qs[kv[0]] = kv[1] });
    let id = seg[0], q = 1;
    if (id === 'ej') { id = 'resolucion'; q = parseInt(seg[1] || '1', 10) }
    else if (id === 'resolucion') { q = parseInt(seg[1] || '1', 10) }
    if (!PAGINAS.some(function (p) { return p.id === id })) id = 'inicio';
    if (!(q >= 1 && q <= DATOS.ejercicios.length)) q = 1;
    return { id: id, q: q, paso: qs.paso ? parseInt(qs.paso, 10) : 0, f: qs.f || '', c: qs.c ? parseInt(qs.c, 10) : 0, p: qs.p ? parseInt(qs.p, 10) : 0 };
  }
  function rutaDe(id, opt) {
    opt = opt || {};
    if (id === 'resolucion') return '#/resolucion/' + (opt.q || 1) + (opt.paso ? '?paso=' + opt.paso : '');
    if (id === 'estrategias') return '#/estrategias' + (opt.c ? '?c=' + opt.c : (opt.f ? '?f=' + opt.f : ''));
    if (id === 'practica') return '#/practica' + (opt.p ? '?p=' + opt.p : '');
    return paginaPorId(id).ruta;
  }
  function ir(id, opt) {
    const r = rutaDe(id, opt);
    if (USE_HASH) { if (window.location.hash === r) mostrar(id, opt || {}); else window.location.hash = r }
    else mostrar(id, opt || {});
  }
  function ligarIr(root) {
    $$('[data-ir]', root).forEach(function (a) { a.addEventListener('click', function (ev) { if (!USE_HASH) { ev.preventDefault(); ir(a.getAttribute('data-ir'), { q: parseInt(a.getAttribute('data-q') || '1', 10), p: parseInt(a.getAttribute('data-p') || '0', 10), c: parseInt(a.getAttribute('data-c') || '0', 10) }) } }) });
  }

  /* ============================ Arte ============================ */
  const ARTE_PORTADA = '<svg viewBox="0 0 380 300" role="img" aria-label="Cuadrilátero inscrito en una circunferencia con una diagonal y un ángulo marcado"><g stroke="#14233B" stroke-opacity=".10" stroke-width="1"><path d="M0 50H380M0 100H380M0 150H380M0 200H380M0 250H380M60 0V300M125 0V300M190 0V300M255 0V300M320 0V300"/></g><path d="M0 150H380M190 0V300" stroke="#14233B" stroke-opacity=".30" stroke-width="1.5"/><circle cx="190" cy="150" r="108" fill="#E4F0FF" stroke="#2D8CFF" stroke-width="3"/><polygon class="draw" style="stroke-dasharray:1000;stroke-dashoffset:1000" points="98.4 207.2 123.5 64.9 285.4 99.3 275.1 216.5" fill="#EFE8FF" fill-opacity=".85" stroke="#6D28D9" stroke-width="4" stroke-linejoin="round"/><path class="draw" d="M98.4 207.2 L285.4 99.3" stroke="#EA580C" stroke-width="4" stroke-linecap="round"/><path d="M104.3 173.7 A34 34 0 0 1 127.9 190.2" fill="none" stroke="#047857" stroke-width="4" stroke-linecap="round"/><circle cx="98.4" cy="207.2" r="7" fill="#14233B"/><circle cx="123.5" cy="64.9" r="7" fill="#14233B"/><circle cx="285.4" cy="99.3" r="7" fill="#14233B"/><circle cx="275.1" cy="216.5" r="7" fill="#14233B"/><g font-family="Sora,system-ui,sans-serif" font-weight="800" font-size="17" fill="#14233B"><text x="74.4" y="229.2">A</text><text x="99.5" y="56.9">B</text><text x="295.4" y="91.3">C</text><text x="285.1" y="238.5">D</text><text x="128.1" y="203.2" fill="#047857">α</text></g></svg>';
  const FIG_HERR = '<svg viewBox="0 0 680 350" role="img" aria-label="Proyección, componente, ortogonal y reflejo de un vector"><defs><marker id="arh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><line x1="180" y1="190" x2="340" y2="190" stroke="#2DB57A" stroke-width="7" stroke-linecap="round" opacity="0.35"/><line x1="180" y1="190" x2="418" y2="190" stroke="#44506E" stroke-width="2.5" marker-end="url(#arh)"/><line x1="180" y1="190" x2="338" y2="72" stroke="#F26B4F" stroke-width="2.5" marker-end="url(#arh)"/><line x1="180" y1="190" x2="338" y2="308" stroke="#8B5CF6" stroke-width="2.5" marker-end="url(#arh)"/><line x1="180" y1="190" x2="62" y2="32" stroke="#8B5CF6" stroke-width="2.5" marker-end="url(#arh)"/><line x1="340" y1="72" x2="340" y2="188" stroke="#44506E" stroke-dasharray="4 3"/><line x1="340" y1="192" x2="340" y2="308" stroke="#44506E" stroke-dasharray="4 3"/><g class="svgt"><text x="430" y="195">b = (6, 0)</text><text x="350" y="68">a = (4, 3)</text><text class="s" x="350" y="136">parte en b⊥ = (0, 3)</text><text class="s" x="350" y="216">proyección = (4, 0)</text><text class="s" x="350" y="316">reflejo: 2·proy − a = (4, −3)</text><text x="74" y="26">a⊥ = (−3, 4)</text></g></svg>';

  /* ============================ INICIO ============================ */
  function heroHTML(conBotones) {
    const n = DATOS.ejercicios.length;
    return '<section class="portada" data-print="show"><div class="portada-txt"><h1>' + DATOS.curso.nombre + '</h1>' +
      '<div class="pills"><span class="pill">' + DATOS.curso.etiqueta + '</span><span class="pill">Prueba del ' + DATOS.curso.fecha + '</span><span class="pill">' + n + ' preguntas · 5 pts c/u</span></div><p class="sub">Vamos paso a paso: tú decides el ritmo.</p>' +
      (conBotones ? '<div class="cta"><a class="btn go" href="#/resolucion/1" data-ir="resolucion" data-q="1">Empezar con la Pregunta 1 →</a><a class="btn" href="#/practica" data-ir="practica">Ir a Práctica</a></div>' : '') +
      '</div><div class="portada-art">' + ARTE_PORTADA + '</div></section>';
  }
  function temasHTML() {
    return '<div class="temas">' + DATOS.temas.map(function (t, i) { return '<article class="tema tm' + (i + 1) + '"><span class="tema-n">Pregunta ' + (i + 1) + '</span><h3>' + esc(t) + '</h3></article>' }).join('') + '</div>';
  }
  function pagInicio() {
    const tiles = DATOS.ejercicios.map(function (e, i) {
      return '<article class="qt qt' + (i + 1) + '"><div class="qt-top"><span class="qt-n">' + e.id + '</span><h3>' + esc(DATOS.corto[i]) + '</h3><span class="qt-pts">' + e.puntos + ' pts</span></div><p class="qt-idea"><b>Idea clave:</b> ' + DATOS.ideas[i] + '</p><div class="qt-acts"><a class="qa1" href="#/resolucion/' + e.id + '" data-ir="resolucion" data-q="' + e.id + '">Ver resolución</a><a class="qa2" href="#/practica?p=' + e.id + '" data-ir="practica" data-p="' + e.id + '">Practicar</a></div></article>';
    }).join('');
    return heroHTML(true) +
      '<h2 class="sec-t">Las ' + DATOS.ejercicios.length + ' preguntas de esta PC<small>Entra por la que necesites: ver cómo se resuelve o practicarla directamente.</small></h2><div class="g3">' + tiles + '</div>' +
      '<div class="row2"><section class="warm" id="warm" data-noprint></section>' +
      '<aside class="tira" data-noprint><div class="tira-h"><span class="tira-ic">' + ico('tip') + '</span><h3>Repaso rápido</h3></div><p class="tira-p">Antes de resolver, echa un vistazo a los tips que más pesan en esta PC.</p><ul class="tira-l">' + listaTarjetas().map(function (x) { return '<li><a class="tira-c ' + x.cat.cl + '" href="#/estrategias?c=' + x.n + '" data-ir="estrategias" data-c="' + x.n + '"><span class="tira-k">' + x.cat.nom + '</span><span class="tira-t">' + esc(x.t) + '</span></a></li>' }).join('') + '</ul><a class="tira-b" href="#/estrategias" data-ir="estrategias">Ver todos los tips ' + ico('arrow') + '</a></aside></div>' +
      '<h2 class="sec-t">¿Qué evalúa esta PC?</h2>' + temasHTML();
  }
  let calIdx = -1, calResp = false;
  function pintarCalent() {
    const w = $('#warm', vista); if (!w) return;
    const c = DATOS.calent[calIdx]; calResp = false;
    w.innerHTML = M('<h3>' + ico('flame') + ' Calentamiento de 10 segundos</h3><p class="wq">' + c.q + '</p><div class="warm-ops">' + c.ops.map(function (o, i) { return '<button class="alt ' + (i % 2 === 0 ? 'l' : 'w') + '" data-i="' + i + '"><b>' + 'ABC'[i] + '</b><span>' + esc(o) + '</span></button>' }).join('') + '</div><div class="warm-fb" role="status" aria-live="polite"></div><button class="otra">' + ico('refresh') + ' Otra pregunta</button>');
    $$('.alt', w).forEach(function (b) {
      b.addEventListener('click', function () {
        if (calResp) return; calResp = true; const i = parseInt(b.getAttribute('data-i'), 10); const fb = $('.warm-fb', w);
        $$('.alt', w).forEach(function (x) { x.disabled = true });
        if (i === c.ok) { b.classList.add('good'); fb.innerHTML = ico('ok') + ' <b class="okc">Correcto.</b> ' + esc(c.msg[i]) }
        else { b.classList.add('bad'); $$('.alt', w)[c.ok].classList.add('good'); fb.innerHTML = ico('fallo') + ' <b class="bad">No es la mejor opción.</b> ' + esc(c.msg[i]) + ' <span class="muted">La correcta era la ' + 'ABC'[c.ok] + '.</span>' }
      })
    });
    $('.otra', w).addEventListener('click', function () { calIdx = (calIdx + 1) % DATOS.calent.length; pintarCalent() });
  }
  function postInicio() {
    if (calIdx < 0) calIdx = Math.floor(Math.random() * DATOS.calent.length);
    pintarCalent();
  }
  function aplicarTinta() { raiz.classList.toggle('tinta', lsGet('tinta') === '1') }

  /* ============================ RESOLUCIÓN ============================ */
  function listaTarjetas() {
    let n = 0; const out = [];
    CATS.forEach(function (c) { DATOS.tips[c.tk].forEach(function (txt, i) { if (DATOS.esencial[c.k].indexOf(i) < 0) return; n++; out.push({ cat: c, n: n, txt: txt, t: DATOS.tarjetas[c.k][i].t, ver: DATOS.tarjetas[c.k][i].ver }) }) });
    return out;
  }
  function tarjetaDePaso(q, paso) {
    const l = listaTarjetas(); const orden = ['error', 'estrategia', 'observ'];
    for (let i = 0; i < orden.length; i++) { for (let j = 0; j < l.length; j++) { if (l[j].cat.k === orden[i] && l[j].ver[0] === q && l[j].ver[1] === paso) return l[j] } }
    return null;
  }
  function recHTML(q, i) {
    const ids = DATOS.rec[q + '-' + (i + 1)]; if (!ids) return '';
    return '<details class="recd" data-print="show"><summary>' + ico('formula') + ' Ver recordatorio</summary>' + ids.map(function (id) {
      const h = DATOS.herramientas[id - 1];
      return '<div class="rec-b"><div class="rec-t">' + ico('formula') + '<span>Recordatorio · ' + esc(h.nombre) + '</span></div><div class="fm">$$' + h.formula + '$$</div></div>'
    }).join('') + '</details>';
  }
  function pruebaloHTML(q, i) {
    if (q !== 2 || i !== 5) return '';
    return '<details class="pruebalo" data-noprint><summary>' + ico('target') + ' Pruébalo tú: proyección, reflejo y ortogonal</summary><p>Arrastra el vector <b>a</b> (o escribe sus coordenadas) y mira cómo se mueven la proyección, el reflejo y el ortogonal.</p><div id="jxg" class="jxg" role="img" aria-label="Plano con el vector a que se puede arrastrar"></div><div class="jxg-in"><label>a₁ <input type="number" id="ax" value="4" step="1" min="-3" max="9"></label><label>a₂ <input type="number" id="ay" value="3" step="1" min="-4" max="7"></label></div><p class="jxg-out" id="jxgOut" aria-live="polite"></p></details><div class="solo-print-b fig">' + FIG_HERR + '</div>';
  }
  function panel(cl, ic, tit, body) { return '<section class="pn ' + cl + '"><h4>' + ico(ic) + '<span>' + tit + '</span></h4><div class="pn-c">' + body + '</div></section>' }
  function pagResolucion(n) {
    const e = DATOS.ejercicios[n - 1];
    const sel = DATOS.ejercicios.map(function (x, i) { const on = (i + 1 === n); return '<a class="sel-i qa' + (i + 1) + (on ? ' on' : '') + '" href="#/resolucion/' + (i + 1) + '" data-ir="resolucion" data-q="' + (i + 1) + '"' + (on ? ' aria-current="page"' : '') + '><span class="sel-n">' + (i + 1) + '</span><span><b>Pregunta ' + (i + 1) + '</b><br><small>' + esc(DATOS.corto[i]) + '</small></span></a>' }).join('');
    const rows = e.pasos.map(function (p, i) {
      const id = 'st' + n + '-' + (i + 1);
      let top = '';
      const ident = (i === 0 && e.reconocer) ? panel('p-id', 'tip', 'Cómo identificar la estrategia', e.reconocer) : '';
      const rel = tarjetaDePaso(n, i + 1);
      const apoyos = panel('p-por', 'help', 'Por qué se hace', p.por) + panel('p-cri', 'compass', 'Criterio', p.crit) + (p.res ? panel('p-res', 'ok', 'Resultado', '<div class="resv">' + p.res + '</div>') : '') + (p.err ? panel('p-err', 'error', 'Error típico', p.err) : '');
      const extra = p.extra ? '<p class="nota">' + p.extra + '</p>' : '';
      const lk = rel ? '<div class="lk" data-noprint><details class="relc ' + rel.cat.cl + '"><summary>' + ico('tip') + '<span>Tip relacionado: «' + esc(rel.t) + '»</span></summary><div class="relc-b"><p class="relc-k">' + rel.cat.nom + '</p><p>' + rel.txt + '</p></div></details></div>' : '';
      return '<article class="rw" data-print="show" data-i="' + i + '"><h3 class="rw-h"><button class="rh" aria-expanded="false" aria-controls="' + id + '"><span class="num" aria-hidden="true">' + (i + 1) + '</span><span class="rt">' + esc(p.t) + '</span>' + ico('chev') + '</button></h3>' +
        '<div class="rb" id="' + id + '" hidden>' + top + '<div class="pg">' + panel('p-que', 'play', 'Qué se hace', '<div class="que">' + p.que + '</div>') + ident + '<div class="apoyos">' + apoyos + '</div></div>' + extra + recHTML(n, i) + pruebaloHTML(n, i) + lk + '</div></article>';
    }).join('');
    const idf = 'st' + n + '-fin';
    const finRow = '<article class="rw rw-fin" data-print="show"><h3 class="rw-h"><button class="rh" aria-expanded="false" aria-controls="' + idf + '"><span class="num" aria-hidden="true">' + ico('ok') + '</span><span class="rt">Resultado final y comprobación</span>' + ico('chev') + '</button></h3><div class="rb" id="' + idf + '" hidden>' +
      caja('ok', 'Resultado y comprobación', '<p class="res">' + e.resultado + '</p><p>' + e.comprobacion + '</p>') + caja('llev', 'Lo que debes llevarte', '<ul class="lista-s">' + e.llevarte.map(function (l) { return '<li>' + l + '</li>' }).join('') + '</ul>') + (e.figura ? '<section class="card"><h2>Figura</h2><p>' + e.figura.nota + '</p><div class="fig" role="group" aria-label="' + esc(e.figura.alt) + '">' + e.figura.svg + '</div></section>' : '') + '</div></article>';
    let pausa = '';
    if (e.figuraEnunciado && e.pistasFigura && lsGet('pausa' + n) !== '1') pausa = '<div class="pausa" data-noprint><p><b>Antes de ver la resolución, observa la figura.</b> Te sugerimos unos 60 segundos; puedes continuar cuando quieras.</p><ul>' + e.pistasFigura.map(function (p) { return '<li>' + p + '</li>' }).join('') + '</ul><p class="muted">Tiempo sugerido: <span class="pt">60</span> s</p><button class="btn go pc">Continuar</button></div>';
    const sig = n < DATOS.ejercicios.length ? '<a class="btn go" href="#/resolucion/' + (n + 1) + '" data-ir="resolucion" data-q="' + (n + 1) + '">Siguiente: Pregunta ' + (n + 1) + ' →</a>' : '<a class="btn go" href="#/estrategias" data-ir="estrategias">Siguiente: Tips →</a>';
    return '<nav class="sel" aria-label="Preguntas de la ' + DATOS.curso.etiqueta + '" data-noprint>' + sel + '</nav>' +
      '<header class="res-h"><h1>Pregunta ' + e.id + ' · ' + esc(e.titulo) + '</h1><p class="chips"><span class="chip c-wh">' + DATOS.curso.etiqueta + '</span><span class="chip c1">' + e.puntos + ' puntos</span></p></header>' +
      '<section class="card enun" data-print="show"><h2>Enunciado</h2><p>' + e.enunciado + '</p></section>' + pausa +
      '<section class="plan' + (pausa ? ' oculto' : '') + '" data-print="show"><h2>' + ico('map') + ' Plan de la resolución</h2><p class="plan-s" data-noprint>Toca un paso para abrirlo; vuelve a tocarlo para cerrarlo.</p><div class="rows">' + rows + finRow + '</div></section>' +
      '<div class="nav-pie" data-noprint>' + sig + '</div>';
  }
  function tablero() {
    const out = $('#jxgOut', vista);
    cargarJSX().then(function () {
      const JXG = window.JXG; if (!JXG || !$('#jxg', vista)) return;
      const brd = JXG.JSXGraph.initBoard('jxg', { boundingbox: [-3, 8, 10, -5], axis: true, grid: true, showCopyright: false, showNavigation: false, keepaspectratio: true });
      const O = brd.create('point', [0, 0], { fixed: true, visible: false });
      const B = brd.create('point', [6, 0], { name: 'b', fixed: true, size: 3, color: '#44506E', label: { color: '#1E2A4A' } });
      const A = brd.create('point', [4, 3], { name: 'a', snapToGrid: true, snapSizeX: 1, snapSizeY: 1, size: 5, color: '#F26B4F', label: { color: '#1E2A4A' } });
      const P = brd.create('point', [function () { return A.X() }, 0], { name: '', size: 3, color: '#2DB57A', fixed: true });
      const Q = brd.create('point', [function () { return -A.Y() }, function () { return A.X() }], { name: 'a⊥', size: 3, color: '#8B5CF6', fixed: true, label: { color: '#1E2A4A' } });
      const R = brd.create('point', [function () { return A.X() }, function () { return -A.Y() }], { name: 'reflejo', size: 3, color: '#E0558A', fixed: true, label: { color: '#1E2A4A' } });
      brd.create('arrow', [O, B], { strokeColor: '#44506E', strokeWidth: 3, fixed: true });
      brd.create('arrow', [O, A], { strokeColor: '#F26B4F', strokeWidth: 3 });
      brd.create('arrow', [O, P], { strokeColor: '#2DB57A', strokeWidth: 5, fixed: true });
      brd.create('arrow', [O, Q], { strokeColor: '#8B5CF6', strokeWidth: 2, fixed: true });
      brd.create('arrow', [O, R], { strokeColor: '#E0558A', strokeWidth: 2, fixed: true });
      brd.create('segment', [A, P], { strokeColor: '#44506E', dash: 2, strokeWidth: 1, fixed: true });
      const ax = $('#ax', vista), ay = $('#ay', vista);
      function leer() {
        const x = Math.round(A.X()), y = Math.round(A.Y()); ax.value = x; ay.value = y;
        out.textContent = 'a = (' + x + ', ' + y + ')   proy_b a = (' + x + ', 0)   a⊥ = (' + (-y) + ', ' + x + ')   2·proy − a = (' + x + ', ' + (-y) + ')'
      }
      A.on('drag', leer); A.on('up', leer);
      function escribir() { const x = Math.max(-3, Math.min(9, Math.round(parseFloat(ax.value) || 0))), y = Math.max(-4, Math.min(7, Math.round(parseFloat(ay.value) || 0))); A.moveTo([x, y]); brd.update(); leer() }
      ax.addEventListener('input', escribir); ay.addEventListener('input', escribir); leer();
    }).catch(function () { const o = $('#jxg', vista); if (o) o.textContent = 'No se pudo cargar el dibujo interactivo; mira la figura estática de la versión impresa.' });
  }
  function copiarTexto(txt, cb) {
    function fallback() { try { const t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); document.body.removeChild(t); cb(ok) } catch (e) { cb(false) } }
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { cb(true) }, fallback) } else fallback() } catch (e) { fallback() }
  }
  function postResolucion(n, opt) {
    const rws = $$('.rw', vista);
    rws.forEach(function (r) { const b = $('.rh', r), c = $('.rb', r); b.addEventListener('click', function () { const ab = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !ab); c.hidden = ab; r.classList.toggle('op', !ab) }) });
    $$('[data-ir-c]', vista).forEach(function (a) { a.addEventListener('click', function (ev) { if (!USE_HASH) { ev.preventDefault(); ir('estrategias', { c: parseInt(a.getAttribute('data-ir-c'), 10) }) } }) });
    const pc = $('.pc', vista), plan = $('.plan', vista);
    if (pc) {
      pc.addEventListener('click', function () { lsSet('pausa' + n, '1'); const p = $('.pausa', vista); if (p) p.hidden = true; plan.classList.remove('oculto') });
      const pt = $('.pt', vista); let seg = 60; const iv = setInterval(function () { seg--; if (pt) pt.textContent = Math.max(seg, 0); if (seg <= 0) clearInterval(iv) }, 1000)
    }
    if (opt && opt.paso && rws[opt.paso - 1]) { const r = rws[opt.paso - 1]; $('.rh', r).click(); if (pc) pc.click(); try { r.scrollIntoView({ block: 'start' }) } catch (e) { } }
    const det = $('.pruebalo', vista); if (det) { let hecho = false; det.addEventListener('toggle', function () { if (det.open && !hecho) { hecho = true; tablero() } }) }
  }

  /* ============================ ESTRATEGIAS ============================ */
  const CATS = [{ k: 'estrategia', tk: 'estrategias', cl: 'ct-a', nom: 'Estrategia', ic: 'target', leyenda: 'Estrategias' }, { k: 'error', tk: 'errores', cl: 'ct-b', nom: 'Error frecuente', ic: 'error', leyenda: 'Errores frecuentes' }, { k: 'observ', tk: 'observaciones', cl: 'ct-c', nom: 'Observación', ic: 'eye', leyenda: 'Observaciones' }];
  function pagEstrategias() {
    const tj = listaTarjetas();
    const leyenda = '<div class="lg" role="group" aria-label="Filtrar por tipo" data-noprint><button class="fl on" data-f="todo" aria-pressed="true">Todas</button>' + CATS.map(function (c) { return '<button class="fl ' + c.cl + '" data-f="' + c.k + '" aria-pressed="false"><i></i>' + c.leyenda + '</button>' }).join('') + '</div>';
    const cards = tj.map(function (x) {
      const id = 'tj' + x.n; const num = (x.n < 10 ? '0' : '') + x.n;
      return '<article class="tj ' + x.cat.cl + '" id="card' + x.n + '" data-cat="' + x.cat.k + '" data-print="show"><button class="tj-b" aria-expanded="false" aria-controls="' + id + '"><span class="tj-n" aria-hidden="true">' + num + '</span><span class="tj-ic">' + ico(x.cat.ic) + '</span><span class="tj-t">' + esc(x.t) + '</span><span class="tj-c">' + x.cat.nom + '</span></button><div class="tj-d" id="' + id + '" hidden><p>' + x.txt + '</p><p class="tj-v">Dónde lo verás: <a href="#/resolucion/' + x.ver[0] + '?paso=' + x.ver[1] + '" data-ir-ej="' + x.ver[0] + '" data-paso="' + x.ver[1] + '">Pregunta ' + x.ver[0] + ' · Paso ' + x.ver[1] + '</a></p></div></article>';
    }).join('');
    return '<header class="res-h"><h1>Tips para esta PC</h1><p class="intro">Lo que más pesa al resolver esta evaluación: estrategias para abordar los problemas, errores frecuentes y observaciones. El color te dice de cuál se trata.</p></header>' + '<div class="gt" data-print="show">' + cards + '</div>' +
      '<div class="nav-pie" data-noprint><a class="btn" href="#/resolucion/' + DATOS.ejercicios.length + '" data-ir="resolucion" data-q="' + DATOS.ejercicios.length + '">← Resolución</a><a class="btn go" href="#/practica" data-ir="practica">Siguiente: Practica y Refuerza →</a></div>';
  }
  function postEstrategias(opt) {
    const cards = $$('.tj', vista), fls = $$('.fl', vista);
    function abrir(c, si) { const b = $('.tj-b', c), d = $('.tj-d', c); b.setAttribute('aria-expanded', si); d.hidden = !si; c.classList.toggle('abierta', si) }
    cards.forEach(function (c) { abrir(c, true) });
    cards.forEach(function (c) { const b = $('.tj-b', c); b.addEventListener('click', function () { abrir(c, b.getAttribute('aria-expanded') !== 'true') }) });
    function filtrar(k) { fls.forEach(function (x) { const on = x.getAttribute('data-f') === k; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on) }); cards.forEach(function (c) { c.hidden = !(k === 'todo' || c.getAttribute('data-cat') === k) }) }
    fls.forEach(function (f) { f.addEventListener('click', function () { filtrar(f.getAttribute('data-f')) }) });
    $$('[data-ir-ej]', vista).forEach(function (a) { a.addEventListener('click', function (ev) { if (!USE_HASH) { ev.preventDefault(); ir('resolucion', { q: parseInt(a.getAttribute('data-ir-ej'), 10), paso: parseInt(a.getAttribute('data-paso'), 10) }) } }) });
    if (opt && opt.f && fls.some(function (x) { return x.getAttribute('data-f') === opt.f })) filtrar(opt.f);
    if (opt && opt.c) { const c = $('#card' + opt.c, vista); if (c) { abrir(c, true); try { c.scrollIntoView({ block: 'center' }) } catch (e) { } } }
  }

  /* ============================ Montaje de cada página ============================ */
  function mostrar(id, opt) {
    opt = opt || {}; actual = id; const p = paginaPorId(id);
    let html = ''; const q = opt.q || 1;
    if (id === 'resolucion') { actualQ = q; html = pagResolucion(q) }
    else if (id === 'inicio') html = pagInicio();
    else if (id === 'estrategias') html = pagEstrategias();
    else if (id === 'practica') html = '<header class="res-h"><h1>Practica y Refuerza</h1></header><div id="prac"></div>';
    vista.innerHTML = '';
    const art = el('article', 'pag' + (id === 'resolucion' ? ' qa' + q : ''), M(html)); art.setAttribute('data-pag', id); vista.appendChild(art);
    ligarIr(vista);
    if (id === 'inicio') postInicio();
    else if (id === 'resolucion') postResolucion(q, opt);
    else if (id === 'estrategias') postEstrategias(opt);
    else if (id === 'practica') { practicaMenu($('#prac', vista)); if (opt.p) { const tpl = PLANTILLAS.filter(function (t) { return t.id === opt.p })[0]; if (tpl) iniciarPractica($('#prac', vista), tpl, semillaNueva(tpl, -1), null) } }
    $$('.menu a', raiz).forEach(function (l) { const on = l.getAttribute('data-id') === id; l.classList.toggle('act', on); if (on) { l.setAttribute('aria-current', 'page'); const ul = l.parentNode && l.parentNode.parentNode; if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = l.offsetLeft - (ul.clientWidth - l.offsetWidth) / 2 } else l.removeAttribute('aria-current') });
    posMenu();
    const menu = $('.menu', raiz); if (menu && window.matchMedia && !window.matchMedia('(min-width:900px)').matches) { menu.hidden = true; $('.menu-b', raiz).setAttribute('aria-expanded', 'false') }
    cerrarPanelImp();
    document.title = (id === 'resolucion' ? 'Pregunta ' + q + ' · ' : p.titulo + ' · ') + DATOS.curso.nombre + ' ' + DATOS.curso.etiqueta;
    const live = $('.live', raiz); if (live) live.textContent = document.title;
    if (!opt.sinFoco) { try { vista.focus({ preventScroll: true }); if (!(opt.paso || opt.c)) window.scrollTo(0, 0) } catch (e) { } }
  }

  /* ---------- Cabecera y panel «Imprimir / PDF» ---------- */
  let soloPagina = true;
  let posMenu = function () { };
  function cerrarPanelImp() { const b = $('.imp-b', raiz), p = $('.imp-p', raiz); if (b && p) { b.setAttribute('aria-expanded', 'false'); p.hidden = true } }
  function marcarModoImp() { const t = lsGet('tinta') === '1'; $$('.imp-op', raiz).forEach(function (o) { o.classList.toggle('on', (o.getAttribute('data-m') === 'tinta') === t) }) }
  function construirCascaron() {
    raiz.className = 'asesoria-' + SLUG + ' aw';
    try { soloPagina = (window.self === window.top) } catch (e) { soloPagina = false }
    raiz.innerHTML = SPRITE +
      '<header class="cab" data-noprint><div class="cab-in"><button class="menu-b" aria-expanded="false" aria-controls="menu">' + ico('menu') + '<span>Menú</span></button>' +
      '<div class="marca"><span class="logo" aria-hidden="true">G</span><div class="marca-t"><strong>Asesoría ' + DATOS.curso.evaluacion + ' ' + DATOS.curso.ciclo.replace(/^20/, '') + '</strong><span class="marca-s">' + DATOS.curso.nombre + '</span></div></div>' +
      '<nav class="menu" id="menu" aria-label="Secciones" hidden><ul>' + PAGINAS.map(function (p) { return '<li><a href="' + p.ruta + '" data-id="' + p.id + '" data-ir="' + p.id + '" data-q="1">' + esc(p.titulo) + '</a></li>' }).join('') + '</ul></nav>' +
      '<div class="imp-w"><button class="btn imp-b" aria-expanded="false" aria-haspopup="true" aria-controls="impP"><i class="imp-emo" aria-hidden="true">🖨️</i> <span>' + (soloPagina ? 'Imprimir / PDF' : 'Opciones de impresión') + '</span>' + ico('chev') + '</button>' +
      '<div class="imp-p" id="impP" hidden><h4>' + (soloPagina ? 'Imprimir / PDF' : 'Opciones de impresión') + '</h4><button class="imp-op" data-m="color">' + ico('palette') + '<span><b>Con colores</b><small>Recomendado para PDF</small></span></button><button class="imp-op" data-m="tinta">' + ico('drop') + '<span><b>Ahorro de tinta</b><small>Fondos blancos con borde de color</small></span></button>' +
      '<p class="imp-n">Se imprime todo: preguntas con los pasos abiertos y los tips de la PC. Para un PDF más limpio, desmarca «Encabezados y pies de página» en Más ajustes.' + (soloPagina ? '' : ' Elige el modo aquí y luego usa el botón de imprimir de SIGA.') + '</p><p class="imp-ok" role="status" aria-live="polite"></p></div></div></div></header>' +
      '<button class="subir" type="button" aria-label="Volver al inicio de la página" data-noprint hidden><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<main id="vista" tabindex="-1"></main><div class="live sr-only" role="status" aria-live="polite"></div><div id="print-root" class="solo-print" aria-hidden="true"></div>';
    vista = $('#vista', raiz);
    const mb = $('.menu-b', raiz), menu = $('.menu', raiz);
    mb.addEventListener('click', function () { const abierto = mb.getAttribute('aria-expanded') === 'true'; mb.setAttribute('aria-expanded', !abierto); menu.hidden = abierto });
    ligarIr(raiz);
    /* línea indicadora: acompaña a la sección activa y se mueve al pasar el cursor o el foco */
    const ul = $('.menu ul', raiz), ind = document.createElement('li'); ind.className = 'menu-ind'; ind.setAttribute('aria-hidden', 'true'); ul.appendChild(ind);
    function activoMenu() { return $('.menu a.act', raiz) }
    function ponerInd(a) { if (!a || !a.offsetWidth) { ind.style.opacity = '0'; return } ind.style.opacity = '1'; ind.style.width = (a.offsetWidth - 28) + 'px'; ind.style.transform = 'translateX(' + (a.offsetLeft + 14) + 'px)' }
    posMenu = function () { ponerInd(activoMenu()) };
    ul.addEventListener('mouseover', function (ev) { const a = ev.target.closest && ev.target.closest('a'); if (a) ponerInd(a) });
    ul.addEventListener('focusin', function (ev) { const a = ev.target.closest && ev.target.closest('a'); if (a) ponerInd(a) });
    ul.addEventListener('mouseleave', posMenu); ul.addEventListener('focusout', posMenu);
    window.addEventListener('resize', posMenu);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(posMenu);
    /* flecha flotante para volver al inicio */
    const sb = $('.subir', raiz);
    function revisarSubir() { const y = window.pageYOffset || document.documentElement.scrollTop || 0; sb.hidden = y < 420 }
    window.addEventListener('scroll', revisarSubir, { passive: true });
    sb.addEventListener('click', function () {
      let suave = true; try { suave = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch (e) { }
      try { window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' }) } catch (e) { window.scrollTo(0, 0) }
      try { vista.focus({ preventScroll: true }) } catch (e) { }
    });
    const ib = $('.imp-b', raiz), ip = $('.imp-p', raiz);
    ib.addEventListener('click', function (ev) { ev.stopPropagation(); const ab = ib.getAttribute('aria-expanded') === 'true'; ib.setAttribute('aria-expanded', !ab); ip.hidden = ab; marcarModoImp() });
    $$('.imp-op', raiz).forEach(function (o) {
      o.addEventListener('click', function () {
        lsSet('tinta', o.getAttribute('data-m') === 'tinta' ? '1' : '0'); aplicarTinta(); marcarModoImp();
        if (soloPagina) { cerrarPanelImp(); setTimeout(function () { window.print() }, 60) }
        else { $('.imp-ok', raiz).textContent = 'Listo: modo «' + (o.getAttribute('data-m') === 'tinta' ? 'ahorro de tinta' : 'con colores') + '». Ahora usa el botón de imprimir de SIGA.' }
      })
    });
    document.addEventListener('click', function (ev) { if (!ev.target.closest || !ev.target.closest('.imp-w')) cerrarPanelImp() });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') cerrarPanelImp() });
    aplicarTinta(); marcarModoImp();
  }

  /* ============================ PRÁCTICA Y REFUERZA: interfaz ============================ */
  const VNAME = { 1: 'AP', 2: 'DC', 3: 'DF' };
  let practicaS = null;   // ejercicio de práctica en curso (para recordar la posición)
  function registro() { const r = jget('registro', {}); return (r && typeof r === 'object') ? r : {} }
  function guardarRegistro(tpl, log, intentosFinal) {
    const r = registro(); const t = r[tpl.id] || { n: 0, primer: 0, ayuda: 0, errs: {} };
    t.n++;
    log.forEach(function (l) {
      if (l.res === 'primer intento') t.primer++; else t.ayuda++;
      l.errs.forEach(function (e) { if (!e.err) return; const x = t.errs[e.err] || { n: 0, ver: e.ver || null }; x.n++; if (e.ver) x.ver = e.ver; t.errs[e.err] = x })
    });
    r[tpl.id] = t; jset('registro', r);
  }
  function registroHTML() {
    const r = registro(); const ids = Object.keys(r);
    if (!ids.length) return '<p class="muted">Todavía no hay registro. Aparecerá aquí cuando practiques. Es privado y no compara con nadie.</p>';
    return ids.map(function (id) {
      const t = r[id]; const tpl = PLANTILLAS.filter(function (p) { return String(p.id) === id })[0]; if (!tpl) return '';
      const errs = Object.keys(t.errs).map(function (k) { const x = t.errs[k]; return '<li>' + x.n + ' de «' + esc(k) + '»' + (x.ver ? ' — <a href="#/resolucion/' + x.ver[0] + '?paso=' + x.ver[1] + '" data-ir-ej="' + x.ver[0] + '" data-paso="' + x.ver[1] + '">se explica en la Pregunta ' + x.ver[0] + ', Paso ' + x.ver[1] + '</a>' : '') + '</li>' }).join('');
      return '<div class="reg-b"><h3>Pregunta ' + tpl.id + ' · ' + esc(tpl.nombre) + '</h3><p>' + t.n + ' ejercicio' + (t.n === 1 ? '' : 's') + ' · ' + t.primer + ' decisión' + (t.primer === 1 ? '' : 'es') + ' al primer intento · ' + t.ayuda + ' con ayuda</p>' + (errs ? '<ul class="lista-s">' + errs + '</ul>' : '') + '</div>'
    }).join('');
  }
  function semillaNueva(tpl, idxActual) { let s, t = 0; do { s = 1000 + Math.floor(Math.random() * 9000); t++ } while (pick(tpl.pool, s).idx === idxActual && t < 30); return s }
  function practicaMenu(cont, mensaje) {
    practicaS = null;
    cont.classList.remove('pr-on', 'pc1', 'pc2', 'pc3');
    cont.innerHTML = M('<p class="intro">¿Qué quieres practicar? Elige una pregunta; tú decides cuántos ejercicios hacer. Es práctica sin nota.</p>' + (mensaje ? '<p class="aviso">' + mensaje + '</p>' : '') +
      '<div class="prac-menu">' + PLANTILLAS.map(function (tpl) { return '<button class="prac-c pc' + tpl.id + '" data-tpl="' + tpl.id + '"><span class="prac-n" aria-hidden="true">' + tpl.id + '</span><span class="prac-q">Pregunta ' + tpl.id + '</span><span class="prac-t">' + esc(tpl.nombre) + '</span><span class="prac-d">' + esc(tpl.resumen) + '</span><span class="prac-f"><span class="prac-m">≈ ' + tpl.min + ' min</span><span class="prac-go">Empezar →</span></span></button>' }).join('') + '</div>' +
      '<div class="prac-sec"><section class="card"><h2>Repaso mezclado (opcional)</h2><p>Una invitación corta: hasta 3 ejercicios, uno por pregunta, empezando por donde más te costó.</p><button class="btn" id="repaso">Empezar el repaso</button></section>' +
      '<section class="card" data-noprint><h2>Mi registro (privado)</h2>' + registroHTML() + '</section></div>');
    $$('.prac-c', cont).forEach(function (b) { b.addEventListener('click', function () { const tpl = PLANTILLAS.filter(function (p) { return String(p.id) === b.getAttribute('data-tpl') })[0]; iniciarPractica(cont, tpl, semillaNueva(tpl, -1), null) }) });
    $('#repaso', cont).addEventListener('click', function () {
      const r = registro();
      const orden = PLANTILLAS.slice().sort(function (a, b) { const ra = r[a.id] ? r[a.id].ayuda / (r[a.id].primer + r[a.id].ayuda || 1) : 0.5, rb = r[b.id] ? r[b.id].ayuda / (r[b.id].primer + r[b.id].ayuda || 1) : 0.5; return rb - ra }).slice(0, 3);
      iniciarPractica(cont, orden[0], semillaNueva(orden[0], -1), { repaso: { orden: orden, k: 0 } });
    });
    $$('[data-ir-ej]', cont).forEach(function (a) { a.addEventListener('click', function (ev) { if (!USE_HASH) { ev.preventDefault(); ir('resolucion', { q: parseInt(a.getAttribute('data-ir-ej'), 10), paso: parseInt(a.getAttribute('data-paso'), 10) }) } }) });
  }
  function pintarDots(S, k) { $$('.pdots i', S.cont).forEach(function (d, i) { d.className = i < k ? 'd' : (i === k ? 'n' : '') }); const c = $('.pchip', S.cont); if (c) c.textContent = 'Decisión ' + Math.min(k + 1, S.bloques.length) + ' de ' + S.bloques.length }
  function iniciarPractica(cont, tpl, seed, ctx) {
    const k = pick(tpl.pool, seed);
    const S = { cont: cont, tpl: tpl, seed: seed, inst: k.i, idx: k.idx, bloques: tpl.bloques(k.i, k.r), att: 0, helpF: false, ctx: ctx || {}, cerrado: false, solMostrada: false, errsF: [] };
    S.log = S.bloques.map(function () { return { fails: 0, hint: false, done: false, res: '', errs: [] } });
    practicaS = S;
    cont.classList.remove('pc1', 'pc2', 'pc3'); cont.classList.add('pr-on', 'pc' + tpl.id);
    cont.innerHTML = '';
    const top = el('div', 'top-p', M('<button class="btn volver">← Volver al menú</button><strong class="ptit">Pregunta ' + tpl.id + ' · ' + esc(tpl.nombre) + '</strong>' + (S.ctx.repaso ? '<span class="chip c1">Repaso ' + (S.ctx.repaso.k + 1) + ' de ' + S.ctx.repaso.orden.length + '</span>' : '') + '<span class="chip c1 pchip">Decisión 1 de ' + S.bloques.length + '</span><span class="pdots" aria-hidden="true">' + S.bloques.map(function () { return '<i></i>' }).join('') + '</span>'));
    cont.appendChild(top);
    $('.volver', top).addEventListener('click', function () { practicaMenu(cont) });
    cont.appendChild(el('section', 'card enun', M('<h2>Problema</h2><div class="stmt">' + tpl.enunciado(S.inst) + '</div>')));
    pintarDots(S, 0);
    agregarBloque(cont, S, 0);
  }
  function pregunta(t) { const s = String(t).replace(/^Paso \d+:\s*/, ''); return s.charAt(0).toUpperCase() + s.slice(1) }
  function agregarBloque(cont, S, k) {
    const b = S.bloques[k], st = S.log[k];
    const card = el('section', 'card bloque');
    card.innerHTML = '<div class="bsum" hidden></div>';
    const bc = el('div', 'bcont');
    bc.innerHTML = M('<p class="eyebrow">Decisión ' + (k + 1) + '</p><h2 class="qq">' + pregunta(b.titulo) + '</h2><p class="bi">' + b.intro + '</p>');
    const ops = el('div', 'opts'); ops.setAttribute('role', 'group'); ops.setAttribute('aria-label', 'Alternativas');
    const fb = el('div', 'fb'); fb.setAttribute('role', 'status'); fb.setAttribute('aria-live', 'polite');
    const row = el('div', 'row');
    const hintB = el('button', 'pista', 'No sé cuál elegir'), contB = el('button', 'btn go', 'Continuar →'); contB.hidden = true;
    hintB.innerHTML = ico('tip') + ' <span>No sé cuál elegir</span>';
    b.opciones.forEach(function (o, i) {
      const btn = el('button', 'opt o-' + 'ABC'[i], '<span class="lt">' + 'ABC'[i] + '</span><span class="ot">' + M(o.html) + '</span><span class="st" aria-hidden="true"></span>');
      btn.type = 'button'; o.btn = btn; ops.appendChild(btn);
      btn.addEventListener('click', function () { elegir(cont, S, k, i, fb, hintB, contB) });
    });
    hintB.addEventListener('click', function () { if (st.done) return; st.hint = true; fb.innerHTML = '<div class="hint">' + ico('tip') + '<div><b>Pista.</b> ' + M(b.pista) + '<div class="muted">Pedir una pista cuenta como ayuda en tu registro.</div></div></div>' });
    contB.addEventListener('click', function () {
      contB.disabled = true;
      const sum = $('.bsum', card);
      sum.innerHTML = ico('ok') + '<span class="bs-t">' + (k + 1) + ' · ' + M(pregunta(b.titulo)) + '</span><span class="tg ' + (st.res === 'primer intento' ? 'a' : 'b') + '">' + (st.res === 'primer intento' ? 'Primer intento' : 'Con ayuda') + '</span>' + ico('chev');
      sum.hidden = false; bc.hidden = true; card.classList.add('plegado');
      sum.setAttribute('role', 'button'); sum.tabIndex = 0;
      function alternar() { const ab = bc.hidden; bc.hidden = !ab; card.classList.toggle('plegado', !ab) }
      sum.addEventListener('click', alternar); sum.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar() } });
      pintarDots(S, k + 1);
      if (k + 1 < S.bloques.length) agregarBloque(cont, S, k + 1); else agregarFinal(cont, S);
    });
    row.appendChild(hintB); row.appendChild(contB);
    bc.appendChild(ops); bc.appendChild(fb); bc.appendChild(row); card.appendChild(bc); cont.appendChild(card);
    try { card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) } catch (e) { }
  }
  function elegir(cont, S, k, i, fb, hintB, contB) {
    const b = S.bloques[k], st = S.log[k], o = b.opciones[i];
    if (st.done) return;
    function terminar() { hintB.hidden = true; b.opciones.forEach(function (x) { x.btn.disabled = true }); contB.hidden = false; contB.focus() }
    function marca(btn, tipo) { btn.classList.add(tipo); $('.st', btn).innerHTML = ico(tipo === 'good' ? 'ok' : 'fallo') }
    if (o.ok) {
      st.done = true; st.res = (st.fails === 0 && !st.hint) ? 'primer intento' : 'con ayuda';
      marca(o.btn, 'good');
      fb.innerHTML = '<div class="fbk ok-f">' + ico('ok') + '<div><div class="ft">Correcto</div><p>' + esc(b.okMsg) + '</p><div class="rvl2">' + M(b.reveal) + '</div></div></div>';
      terminar();
    } else {
      st.fails++; st.errs.push({ err: o.err, ver: o.ver }); marca(o.btn, 'bad'); o.btn.disabled = true;
      const meta = '<div class="meta"><span>Tipo de error: ' + esc(o.err) + '</span>' + (o.ver ? '<span>Se explica en la Pregunta ' + o.ver[0] + ', Paso ' + o.ver[1] + '</span>' : '') + '</div>';
      if (st.fails === 1) {
        fb.innerHTML = '<div class="fbk">' + ico('fallo') + '<div><div class="ft">No es la mejor opción</div><p>' + esc(o.msg) + '</p>' + meta + '<p class="muted">Puedes intentarlo otra vez.</p></div></div>';
      } else {
        st.done = true; st.res = 'con ayuda';
        b.opciones.forEach(function (x) { if (x.ok) { marca(x.btn, 'good') } });
        fb.innerHTML = '<div class="fbk">' + ico('fallo') + '<div><div class="ft">Tampoco</div><p>' + esc(o.msg) + '</p>' + meta + '<div class="rvl2"><b>Te muestro el paso:</b> ' + M(b.okHtml) + '. ' + esc(b.okMsg) + ' ' + M(b.reveal) + '</div><p class="muted">Este bloque queda anotado como «con ayuda».</p></div></div>';
        terminar();
      }
    }
  }
  function agregarFinal(cont, S) {
    const tpl = S.tpl, vn = VNAME[tpl.id];
    const card = el('section', 'card final');
    card.innerHTML = M('<p class="eyebrow">Resultado final</p><h2 class="qq">Ahora lo calculas tú</h2><p class="bi">' + tpl.finalEtq(S.inst) + '</p>');
    const lab = el('label', 'sr-only', 'Tu respuesta para ' + vn); lab.setAttribute('for', 'resp');
    const inp = el('input', 'fin'); inp.type = 'text'; inp.id = 'resp'; inp.placeholder = '(a, b)'; inp.autocomplete = 'off';
    const und = el('div', 'muted und'); und.setAttribute('aria-live', 'polite');
    const fb = el('div', 'fb'); fb.setAttribute('role', 'status'); fb.setAttribute('aria-live', 'polite');
    const row = el('div', 'row');
    const chk = el('button', 'btn go', 'Comprobar'), help = el('button', 'btn', 'Ayuda'), sol = el('button', 'btn', 'Ver la solución');
    row.appendChild(chk); row.appendChild(help); row.appendChild(sol);
    card.appendChild(lab); card.appendChild(inp); card.appendChild(und); card.appendChild(row); card.appendChild(fb); cont.appendChild(card);
    inp.addEventListener('input', function () {
      const v = parseVec(inp.value);
      if (!inp.value.trim()) { und.textContent = ''; return }
      und.innerHTML = v ? M('Entendí: $\\V{' + vn + '}=' + vT(+v[0].toFixed(4), +v[1].toFixed(4)) + '$') : 'Todavía no se lee como vector.';
    });
    function comprobar() {
      const v = parseVec(inp.value); const c = tpl.clasifica(S.inst, v);
      if (c.tipo === 'formato') { fb.innerHTML = '<span class="muted">' + esc(c.msg) + '</span>'; return }
      S.att++;
      if (c.tipo === 'ok') {
        fb.innerHTML = '<div class="fbk ok-f">' + ico('ok') + '<div><div class="ft">Correcto</div><p>' + M('$\\V{' + vn + '}=' + vT(tpl.resultado(S.inst)[0], tpl.resultado(S.inst)[1]) + '$') + '. Compáralo con la solución completa.</p></div></div>';
        chk.disabled = true; inp.disabled = true; cerrar(cont, S, true);
      } else {
        if (c.err) S.errsF.push(c.err);
        fb.innerHTML = '<div class="fbk">' + ico('fallo') + '<div><div class="ft">' + (c.tipo === 'cerca' ? 'Vas cerca' : 'No coincide') + '</div><p>' + esc(c.msg) + '</p></div></div>';
      }
    }
    chk.addEventListener('click', comprobar); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') comprobar() });
    help.addEventListener('click', function () { S.helpF = true; fb.innerHTML = '<div class="hint">' + ico('tip') + '<div><b>Ayuda.</b> ' + M(tpl.ayuda(S.inst)) + '</div></div>' });
    sol.addEventListener('click', function () { cerrar(cont, S, true) });
    inp.focus();
  }
  function mostrarSolucion(cont, S) {
    if (S.solMostrada) return; S.solMostrada = true;
    const c = el('section', 'card sol-c');
    c.innerHTML = M('<h2>Solución completa (para comparar)</h2><ol class="lista sol">' + S.tpl.solucion(S.inst).map(function (t) { return '<li>' + t + '</li>' }).join('') + '</ol>');
    cont.appendChild(c);
  }
  function cerrar(cont, S, conSol) {
    if (S.cerrado) return; S.cerrado = true;
    if (conSol) mostrarSolucion(cont, S);
    guardarRegistro(S.tpl, S.log, S.att);
    const lineas = S.log.map(function (s, i) { return '<li>Decisión ' + (i + 1) + ': ' + s.res + (s.errs.length ? ' · errores: ' + s.errs.map(function (e) { return esc(e.err) }).join(', ') : '') + '</li>' }).join('');
    const reg = el('section', 'card reg-c', M('<h2>Tu registro de esta práctica <span class="muted">(privado, sin puntaje)</span></h2><ul class="reg">' + lineas + '</ul>'));
    cont.appendChild(reg);
    const ex = el('div', 'row'); const note = el('p', 'muted');
    const rep = S.ctx.repaso;
    if (rep) {
      if (rep.k + 1 < rep.orden.length) {
        const n = el('button', 'btn go', 'Siguiente ejercicio del repaso (' + (rep.k + 2) + ' de ' + rep.orden.length + ')'); ex.appendChild(n);
        n.addEventListener('click', function () { const t = rep.orden[rep.k + 1]; iniciarPractica(cont, t, semillaNueva(t, -1), { repaso: { orden: rep.orden, k: rep.k + 1 } }) })
      }
      else { const f = el('button', 'btn go', 'Terminar el repaso'); ex.appendChild(f); f.addEventListener('click', function () { practicaMenu(cont, '¡Repaso terminado! Puedes volver a practicar lo que quieras.') }) }
      const s = el('button', 'btn', 'Salir del repaso'); ex.appendChild(s); s.addEventListener('click', function () { practicaMenu(cont) });
    } else {
      const b1 = el('button', 'btn go', 'Otro parecido'), b2 = el('button', 'btn bt-rep', 'Repetir este mismo'), b3 = el('button', 'btn bt-otra', 'Elegir otra pregunta'), b4 = el('button', 'btn bt-fin', 'Terminar por hoy');
      b1.addEventListener('click', function () { iniciarPractica(cont, S.tpl, semillaNueva(S.tpl, S.idx), null) });
      b2.addEventListener('click', function () { iniciarPractica(cont, S.tpl, S.seed, null) });
      b3.addEventListener('click', function () { practicaMenu(cont) });
      b4.addEventListener('click', function () { practicaMenu(cont, 'Buen trabajo por hoy. Tu registro queda guardado en este navegador, y puedes volver cuando quieras.') });
      [b1, b2, b3, b4].forEach(function (b) { ex.appendChild(b) });
    }
    cont.appendChild(ex); cont.appendChild(note);
  }

  /* ============================ IMPRESIÓN Y PDF ============================ */
  let impresionLista = false;
  function estrategiasImpresion() {
    const tj = listaTarjetas();
    return '<h1>Tips para esta PC</h1>' + CATS.map(function (c) {
      return '<h2>' + c.leyenda + '</h2><div class="gt-print">' + tj.filter(function (x) { return x.cat === c }).map(function (x) {
        return '<article class="tj ' + c.cl + ' abierta"><div class="tj-b"><span class="tj-ic">' + ico(c.ic) + '</span><span class="tj-t">' + esc(x.t) + '</span></div><div class="tj-d"><p>' + x.txt + '</p><p class="tj-v">Dónde lo verás: Pregunta ' + x.ver[0] + ' · Paso ' + x.ver[1] + '</p></div></article>'
      }).join('') + '</div>'
    }).join('');
  }
  function construirImpresion() {
    const pr = $('#print-root', raiz); if (!pr) return;
    const partes = [heroHTML(false) + '<h2 class="sec-t">¿Qué evalúa esta PC?</h2>' + temasHTML()];
    DATOS.ejercicios.forEach(function (e, i) { partes.push('<div class="qa' + (i + 1) + '">' + pagResolucion(i + 1) + '</div>') });
    partes.push(estrategiasImpresion());
    partes.push('<h1>Solucionario de Práctica y Refuerza</h1>' + PLANTILLAS.map(function (tpl) {
      const seed = 100 + tpl.id, k = pick(tpl.pool, seed);
      return '<div class="print-q"><h2>Pregunta ' + tpl.id + ' · ' + esc(tpl.nombre) + '</h2><p class="ref">Variante de referencia n.º ' + seed + '</p><div class="stmt">' + tpl.enunciado(k.i) + '</div><ol class="lista sol">' + tpl.solucion(k.i).map(function (t) { return '<li>' + t + '</li>' }).join('') + '</ol></div>';
    }).join(''));
    const cuerpo = partes.map(function (x) { return '<section class="print-pag">' + x + '</section>' }).join('');
    pr.innerHTML = M('<table class="print-tabla"><thead><tr><td><div class="esp"></div></td></tr></thead><tbody><tr><td>' + cuerpo + '</td></tr></tbody><tfoot><tr><td><div class="esp"></div></td></tr></tfoot></table>');
    $$('[data-noprint],.nav-pie,.mas,.sel,button,.pausa,.dots,a.btn,.jxg,.jxg-in,.jxg-out,.pruebalo,.lk,.plan-s', pr).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n) });
    $$('[hidden]', pr).forEach(function (n) { n.removeAttribute('hidden') });
    $$('details', pr).forEach(function (d) { d.open = true });
    $$('.rw', pr).forEach(function (r) { r.classList.add('op') });
    $$('.oculto', pr).forEach(function (n) { n.classList.remove('oculto') });
    $$('[id]', pr).forEach(function (n) { n.removeAttribute('id') });
    $$('.solo-print-b', pr).forEach(function (n) { n.classList.add('ver') });
    impresionLista = true;
  }
  function prepararImpresion() { if (!impresionLista) construirImpresion(); raiz.classList.add('imprimiendo') }
  function terminarImpresion() { raiz.classList.remove('imprimiendo') }

  /* ============================ RECORDAR LA POSICIÓN ============================
     Al abrir la asesoría en una pestaña nueva o en pantalla completa, la página se vuelve a cargar y empezaría en
     el inicio. Se guarda en este navegador dónde estabas: la página y la pregunta, los pasos y tips abiertos, el
     filtro de Tips, el texto que veías arriba y, en Practica y Refuerza, el ejercicio (pregunta + semilla) con la
     decisión en que ibas. Si se abre de nuevo en los siguientes 20 s, vuelve a ese lugar; si pasó más tiempo,
     empieza en el inicio. El punto de la pantalla se guarda como «el texto que veías arriba», no como píxeles,
     porque el ancho cambia al ampliar. Con varias ventanas abiertas, solo guarda la que estás usando. */
  const POS_VENTANA = 20000, POS_LATIDO = 3000;
  let posActiva = false, posEspera = null, posMovio = false, posActividad = Date.now();
  const POS_SEL = 'h1,h2,h3,h4,p,li,summary,.eyebrow';
  function posTexto(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim() }
  function posVisible(e) { return e.offsetParent !== null && e.getBoundingClientRect().height > 0 }
  function posAncla() {
    if (window.pageYOffset < 40 || !vista) return null;
    const els = $$(POS_SEL, vista);
    for (let i = 0; i < els.length; i++) {
      const t = posTexto(els[i]); if (t.length < 8) continue;
      const r = els[i].getBoundingClientRect();
      if (r.top >= 0 && r.top < window.innerHeight && posVisible(els[i])) return { tag: els[i].tagName, txt: t.slice(0, 60), off: Math.round(r.top) };
    }
    return null;
  }
  function posBuscar(a) {
    if (!a || !vista) return null;
    return $$(a.tag.toLowerCase(), vista).filter(function (e) { return posTexto(e).slice(0, 60) === a.txt && posVisible(e) })[0] || null;
  }
  function posEstado() {
    const s = { t: Date.now(), ta: posActividad, page: actual, q: actualQ, y: Math.round(window.pageYOffset), a: posAncla() };
    if (!vista) return s;
    if (actual === 'resolucion') {
      s.pasos = []; $$('.rw', vista).forEach(function (r, i) { if ($('.rh', r).getAttribute('aria-expanded') === 'true') s.pasos.push(i) });
      s.rel = []; $$('.relc', vista).forEach(function (d, i) { if (d.open) s.rel.push(i) });
    }
    if (actual === 'estrategias') {
      const on = $('.fl.on', vista); s.f = on ? on.getAttribute('data-f') : 'todo';
      s.cerradas = []; $$('.tj', vista).forEach(function (c, i) { if ($('.tj-b', c).getAttribute('aria-expanded') !== 'true') s.cerradas.push(i) });
    }
    if (actual === 'practica' && practicaS && !practicaS.cerrado && !(practicaS.ctx && practicaS.ctx.repaso)) {
      const S = practicaS, k = S.log.findIndex(function (x) { return !x.done });
      s.pr = {
        tid: S.tpl.id, seed: S.seed, k: k < 0 ? S.bloques.length : k, att: S.att, helpF: S.helpF, errsF: S.errsF,
        log: S.log.map(function (x) { return { fails: x.fails, hint: x.hint, res: x.res, errs: x.errs } })
      };
    }
    return s;
  }
  function posGuardar() {
    if (!posActiva) return;
    const prev = jget('pos', null);
    if (prev && prev.ta && prev.ta > posActividad) return;   // otra ventana tuvo actividad más reciente
    jset('pos', posEstado());
  }
  function posLeer() {
    const p = jget('pos', null), dt = p && p.t ? Date.now() - p.t : -1;
    return dt >= 0 && dt <= POS_VENTANA ? p : null;
  }
  function posArrancar() {
    posActiva = true;
    ['scroll', 'wheel', 'touchstart', 'keydown', 'mousedown', 'mousemove'].forEach(function (ev) {
      window.addEventListener(ev, function () { posActividad = Date.now() }, { passive: true, capture: true });
    });
    posGuardar();
    window.addEventListener('scroll', function () {
      if (posEspera) return;
      posEspera = setTimeout(function () { posEspera = null; posGuardar() }, 500);
    }, { passive: true });
    setInterval(function () { if (document.visibilityState === 'visible') posGuardar() }, POS_LATIDO);
    document.addEventListener('visibilitychange', posGuardar);
    window.addEventListener('pagehide', posGuardar);
  }
  // Vuelve a armar el ejercicio (misma pregunta y misma semilla = mismos números) hasta la decisión en que ibas
  function posReanudarPractica(pr) {
    const tpl = PLANTILLAS.filter(function (t) { return t.id === pr.tid })[0], cont = $('#prac', vista);
    if (!tpl || !cont) return;
    iniciarPractica(cont, tpl, pr.seed, null);
    const S = practicaS;
    for (let j = 0; j < pr.k && j < S.bloques.length; j++) {
      const i = S.bloques[j].opciones.findIndex(function (o) { return o.ok });
      S.bloques[j].opciones[i].btn.click();                     // responde bien para llegar a la decisión en que ibas
      const g = pr.log[j] || {}, st = S.log[j];
      st.fails = g.fails || 0; st.hint = !!g.hint; st.res = g.res || st.res; st.errs = g.errs || [];   // conserva «con ayuda» y los errores
      const card = $$('.card.bloque', cont)[j], cb = card && $('.btn.go', card);
      if (cb) cb.click();
    }
    S.att = pr.att || 0; S.helpF = !!pr.helpF; S.errsF = pr.errsF || [];
  }
  function posRestaurar(p) {
    if (USE_HASH) { try { history.replaceState(null, '', rutaDe(p.page, { q: p.q })) } catch (e) { } }
    if (p.page === 'resolucion') {
      const pc = $('.pc', vista);
      if ((p.pasos || []).length && pc) pc.click();             // la pausa de la figura nunca es obligatoria
      (p.pasos || []).forEach(function (i) { const r = $$('.rw', vista)[i]; if (r && $('.rh', r).getAttribute('aria-expanded') !== 'true') $('.rh', r).click() });
      (p.rel || []).forEach(function (i) { const d = $$('.relc', vista)[i]; if (d) d.open = true });
    }
    if (p.page === 'estrategias') {
      if (p.f && p.f !== 'todo') { const b = $('.fl[data-f="' + p.f + '"]', vista); if (b) b.click() }
      (p.cerradas || []).forEach(function (i) { const c = $$('.tj', vista)[i]; if (c) $('.tj-b', c).click() });
    }
    if (p.page === 'practica' && p.pr) posReanudarPractica(p.pr);
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
      window.addEventListener(ev, function () { posMovio = true }, { passive: true, once: true });
    });
    function una() {
      if (posMovio) return;
      const el = posBuscar(p.a), y = el ? Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - p.a.off) : (p.y || 0);
      try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }) } catch (e) { window.scrollTo(0, y) }
    }
    una();
    window.addEventListener('load', una);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(una);   // imágenes, fuentes y fórmulas pueden cambiar la altura
    setTimeout(una, 500); setTimeout(una, 1200);
    setTimeout(posArrancar, 1300);
  }

  /* ============================ Inicio ============================ */
  function iniciarApp() {
    raiz = document.getElementById('asesoria');
    construirCascaron();
    vista.innerHTML = '<p class="cargando">Cargando…</p>';
    function arrancar() {
      construirImpresion();
      const primera = parseHash();
      const pos = posLeer();                                    // dónde estabas, si abriste la asesoría hace instantes
      const sinHash = !(window.location.hash || '').replace(/^#\/?/, '');
      const recuperar = !!pos && USE_HASH && (sinHash || (primera.id === pos.page && primera.q === pos.q));   // un enlace con otra página manda
      if (recuperar) { mostrar(pos.page, { q: pos.q, sinFoco: true }); posRestaurar(pos) }
      else { mostrar(USE_HASH ? primera.id : 'inicio', { q: primera.q, paso: primera.paso, f: primera.f, c: primera.c, p: primera.p, sinFoco: true }); posArrancar() }
      if (USE_HASH) window.addEventListener('hashchange', function () { const h = parseHash(); mostrar(h.id, { q: h.q, paso: h.paso, f: h.f, c: h.c, p: h.p }) });
      const listo = [];
      if (document.fonts && document.fonts.ready) listo.push(document.fonts.ready);
      listo.push(Promise.all($$('img', raiz).map(function (im) { return im.complete ? 1 : new Promise(function (r) { im.onload = r; im.onerror = r }) })));
      const tope = new Promise(function (r) { setTimeout(r, 2500) });
      Promise.race([Promise.all(listo), tope]).then(function () { raiz.setAttribute('data-listo', '1') });
    }
    cargarKatex().then(arrancar, arrancar);
    window.addEventListener('beforeprint', prepararImpresion);
    window.addEventListener('afterprint', terminarImpresion);
    if (TEST) { TEST.api = { mostrar: mostrar, ir: ir, PLANTILLAS: PLANTILLAS, DATOS: DATOS, parseVec: parseVec, clasificar: clasificar, pick: pick, construirImpresion: construirImpresion, jget: jget, PREFIJO: PREFIJO, M: M, practicaMenu: practicaMenu, iniciarPractica: iniciarPractica, semillaNueva: semillaNueva, registro: registro, listaTarjetas: listaTarjetas } }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarApp); else iniciarApp();

})();
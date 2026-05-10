---
title: "DOM XSS in innerHTML sink using source location.search"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-in-innerhtml-sink-using-source-locationsearch"
author: "Z4k7"
date: "2026-04-15"
year: "2026"
status: "pwned"
tags:
  - "DOM"
  - "BurpSuite_Academy"
techniques:
  - "DOM XSS"
  - "source location.search"
  - "sink innerHTML"
tools:
  - "browser"
  - "JavaScript"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy: vulnerabilidad DOM XSS en funcionalidad de búsqueda del blog. Código asigna parámetro search de URL directamente a innerHTML sin validación. Explotable mediante inyección de HTML + event handlers. Cadena de ataque: source location.search → sink innerHTML → inyección <img onerror=alert()> → ejecución JavaScript.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios basada en DOM en la funcionalidad de búsqueda del blog. Utiliza un `innerHTML` asignación, que cambia el contenido HTML de un `div` elemento, utilizando datos de `location.search`.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que llame al `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415101208484.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Envían una simple validación en el apartado de search podemos consultar el comportamiento de la web consultando el código fuente de la misma podemos validar que se activa un script:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415102033063.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              function doSearchQuery(query) {
                  document.getElementById('searchMessage').innerHTML = query;
              }
              var query = (new URLSearchParams(window.location.search)).get('search');
              if(query) {
                  doSearchQuery(query);
              }
          </script>
      - kind: "note"
        text: |
          El comportamiento del codigo realiza una validación de la url consulta si cuenta con un apartado `search` envía dicha información a la variable `query` realiza la consulta si existe dicho valor dispara la funciona que en esta caso selecciona la etiqueta llamada `searchMessage`:
      - kind: "code"
        lang: "HTML"
        code: |
          <span id="searchMessage"></span>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Análisis de la vulnerability: 1. `location.search` es un source NO confiable (datos de URL) 2. Se asigna DIRECTAMENTE a `innerHTML` sin validar ni sanitizar 3. `innerHTML` interpreta HTML, lo que permite inyectar etiquetas 4. El parámetro `search` se extrae con `URLSearchParams.get()` — sin filtros 5. No hay validación de entrada en ningún punto Esta es una classic DOM XSS vulnerability."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Enviamos una validación de etiqueta básica para tratar de consultar si contamos con manipulación en el DOM `<p>Name<p>`:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415102902797.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si esta ingresando datos en el DOM en este caso para confirmar tratamos de enviar un elemento diferente pero con su propio Style para confirmar la integración con la web `<h1 style="color:red">z4k7</h1>`:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415103142313.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Con la validación anterior se confirma que si es posible alterar el DOM por medio del elemento `innerHTML` consultamos si es posible aplicar directamente un `alert()` por medio de un script:
          `<script>alert(document.domain)</script>`
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415103420908.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Puede ser que tomo el código pero `innerHTML` no acepta `script`.
          Como no permite la gestión por medio de script enviamos una consulta pero por medio de `img` que nos ayude a disparar un `alert()` en este caso:
      - kind: "code"
        lang: "HTML"
        code: |
          <img src=x onerror=alert(document.domain)>
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415103939913.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El comportamiento del alert en este caso es al momento de consulta la img si existe una imagen llamada x como no esta en el sistema nos envía en automático un error en este caso salta el alert():
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20innerHTML%20sink%20using%20source%20location.search/file-20260415104137410.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "warning"
        label: "innerHTML NO ejecuta `<script>` dinámicamente"
        text: "Navegadores modernos por seguridad BLOQUEAN `<script>` tags cuando se asignan vía `innerHTML`. Sin embargo, PERMITEN event handlers HTML como `onerror`, `onload`, `onclick`, etc. Por eso `<img onerror=alert()>` funciona cuando `<script>alert()</script>` no."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Hallazgo crítico de enumeración: - Probaste 3 formas de inyección - Identificaste que `<script>` está bloqueado - Pivotaste a event handler `onerror` — buena técnica de escalada - El vector final es: falta de imagen (src=x) → dispara onerror → ejecuta JS  Como senior: esto indica que entiendes que cuando una técnica no funciona, buscar un mecanismo alternativo es clave en explotación."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload explotable es: `<img src=x onerror=alert(document.cookie)>`
          Inyectado en la URL: `?search=<img src=x onerror=alert(document.cookie)>`
          Cómo funciona:
          1. Navegador intenta cargar imagen con src="x"
          2. No existe imagen llamada "x" en servidor
          3. Se dispara evento `onerror`
          4. Ejecuta JavaScript: `alert(document.cookie)`
          5. Se muestra popup con las cookies del dominio
          Alternativas de explotación con el mismo fin:
      - kind: "bullet"
        text: "<svg onload=alert(document.domain)> — SVG element con evento onload"
      - kind: "bullet"
        text: "<body onload=alert(1)> — si se puede inyectar en body tag"
      - kind: "bullet"
        text: "<iframe src='javascript:alert(document.cookie)'> — iframe con protocolo javascript"
      - kind: "bullet"
        text: "<input onfocus=alert(1) autofocus> — input que se enfoca automáticamente"
      - kind: "bullet"
        text: "<marquee onstart=alert()> — elemento marquee deprecated pero aún funciona"
      - kind: "code"
        lang: "HTML"
        code: |
          <!-- URL Final con payload -->
          ?search=<img%20src=x%20onerror=alert(document.cookie)>
          
          <!-- Decodificado se ve así -->
          ?search=<img src=x onerror=alert(document.cookie)>
      - kind: "callout"
        type: "info"
        label: "Mecanismo de ejecución en `innerHTML`"
        text: "Cuando `innerHTML` recibe HTML text, pasa por parser del navegador. El parser crea elementos DOM. Los event handlers se registran cuando se crea el elemento. Al intentar cargar la imagen fallida, se dispara automáticamente `onerror` — sin que el usuario haga click. Esto es diferente a `onclick` que requiere interacción."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Diferencia con lab anterior (attr): - Lab 1 (attr): payload en atributo href, requiere protocolo `javascript:`, requiere click del usuario - Lab 2 (innerHTML): payload es HTML completo, usa event handler automático, NO requiere click  `innerHTML` es MÁS peligroso porque la ejecución es automática. En `attr()` el usuario tiene que hacer click — aquí se ejecuta solo al cargar la página."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          En este laboratorio, la explotación misma es el acceso inicial.
          Una vez que inyectas `<img src=x onerror=alert(document.cookie)>` en el parámetro `search` y la página renderiza, el JavaScript se ejecuta automáticamente.
          No requiere click del usuario, no requiere navegación adicional. Es ejecución remota de código (RCE) en el contexto del navegador del usuario.
          El alcance real:
      - kind: "bullet"
        text: "Acceso a document.cookie — robo de tokens de sesión"
      - kind: "bullet"
        text: "Acceso a localStorage — datos privados"
      - kind: "bullet"
        text: "Capacidad de hacer requests como el usuario — phishing interno"
      - kind: "bullet"
        text: "Capacidad de modificar DOM — defacement"

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este laboratorio no aplica escalada tradicional de privilegios porque es una vulnerabilidad client-side (navegador del usuario), no server-side.
          Sin embargo, la "escalada" en contexto real sería:
          1. Ejecutar JavaScript en navegador del usuario
          2. Extraer sesión/token del usuario
          3. Impersonar al usuario en el servidor
          4. Acceder a datos/funcionalidades del usuario
          Esto es escalada horizontal (de atacante anónimo → usuario autenticado), no vertical.

lessons:
  - '`innerHTML` sin validación de entrada es SIEMPRE explotable para DOM XSS'
  - 'El navegador bloquea `<script>` dinámico pero permite event handlers — la defensa es incompleta'
  - '`location.search` es un source no confiable que NUNCA debe ir directo a un sink'
  - 'Event handlers automáticos (onerror, onload) son más peligrosos que handlers que requieren click (onclick)'
  - 'La ausencia de validación garantiza vulnerabilidad — no hay defensa en profundidad'
mitigation:
  - 'NUNCA usar `innerHTML` con datos de usuario — reemplazar con `textContent` o `innerText`'
  - 'Validar parámetro `search` — whitelist de caracteres alfanuméricos si es posible'
  - 'Sanitizar entrada con librerías como DOMPurify antes de asignar a `innerHTML`'
  - 'Implementar Content Security Policy (CSP) para bloquear inline event handlers'
  - 'Usar framework moderno (React, Vue, Angular) que sanitiza por defecto'
---

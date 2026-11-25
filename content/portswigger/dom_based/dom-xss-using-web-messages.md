---
title: "DOM XSS using web messages"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-using-web-messages"
author: "Z4k7"
date: "2026-04-06"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "DOM"
  - "BurpSuite_Academy"
  - "Web"
techniques:
  - "DOM XSS"
  - "postMessage"
  - "web messages"
  - "sink innerHTML"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy: vulnerabilidad DOM XSS basada en mensajería web (postMessage). Un listener de message escribe e.data directamente en innerHTML sin validar e.origin. Cadena de ataque: source window.addEventListener('message') → sink innerHTML → entrega vía Exploit Server con un <iframe> que usa postMessage() para inyectar <img onerror=print()>.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio demuestra una vulnerabilidad simple de mensajes web. Para resolver este laboratorio, utilice el servidor de explotación para publicar un mensaje en el sitio objetivo que provoque la `print()` función que se va a llamar.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Ingresamos al laboratorio para identificar el entorno y poder consultar alguna informacion relevante
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406154837182.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando en la web podemos observar un apartado que llama la curiosidad
      - kind: "code"
        lang: "JS"
        code: |
          [object Object]
      - kind: "note"
        text: |
          Dicho apartado es como si le faltara alguna información o esta a la espera de algo adicional consultamos el código fuente de la misma web
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406155053487.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este apartado contamos con un ID único en uno de los elemento que esta a la espera de alguna información adicional por parte del DOM
      - kind: "code"
        lang: "HTML"
        code: |
          <div id="ads">[object Object]</div>
          <script>
              window.addEventListener('message', function(e) {
                  document.getElementById('ads').innerHTML = e.data;
              })
          </script>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El `[object Object]` visible en pantalla es la primera pista: significa que `innerHTML` ya recibió un objeto JavaScript (no un string) y lo forzó a texto con `.toString()`. Eso delata que hay un listener de `message` esperando datos — exactamente el patrón que buscas cuando ves ese texto en cualquier aplicación."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          En JavaScript, el método `addEventListener` se utiliza para registrar un escuchador de eventos. Esto significa que el navegador queda pendiente de una acción específica y ejecuta una función cuando esa acción ocurre. En nuestro caso, el evento es `message`, que no proviene de una interacción directa del usuario (como un clic), sino de la comunicación entre ventanas, iframes o workers.
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              window.addEventListener('message', function(e) {
                  document.getElementById('ads').innerHTML = e.data;
              })
          </script>
      - kind: "note"
        text: |
          En este caso podremos usar el método `postMessage()` para tratar de enviar información y validar si el `addEventListener` crea el evento y se puede visualizar el la web, aplicamos el siguiente código de prueba y lo enviamos desde la misma consola para consultar la respuesta
      - kind: "code"
        lang: "JS"
        code: |
          window.postMessage(
            "El usuario es 'bob' y la contraseña es 'secret'",
          );
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406160955075.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma la activación del evento, en este caso podríamos tratar de validar si es posible ingresar código DOM para tratar de alterar datos en la web.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406161156594.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "warning"
        label: "Sin verificación de `e.origin`"
        text: "El listener nunca comprueba de dónde viene el mensaje (`e.origin`). Esto significa que cualquier página, incluida una controlada por un atacante, puede enviarle datos a este `window` mediante un `iframe` y `postMessage()`. Es la condición necesaria que convierte este patrón en explotable."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de pasar a explotación, vale la pena preguntarse: ¿por qué funcionó `window.postMessage(...)` desde la misma consola sin indicar `targetOrigin`? Porque al omitirlo (o usar `'*'`) el mensaje se entrega sin restricción de destino — el mismo comportamiento que vas a reproducir desde el Exploit Server."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El objetivo del laboratorio es tratar de saltar un `print()` a la web. Ingresamos en este caso en el apartado de `Go to Exploit Server`, en dicho apartado nos permite simular un servidor atacante.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406161539422.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          el anterior no permite aplicar el `print()` pero si le aplicamos in img
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406161809319.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviemos la carga util
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406161843823.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Por qué el payload es `<img>` y no `<script>`"
        text: "Igual que en cualquier sink `innerHTML`, el navegador bloquea las etiquetas `<script>` insertadas dinámicamente. El payload real que viaja dentro del `postMessage()` es algo como `<img src=1 onerror=print()>`: la imagen falla al cargar (`src=1` no existe), dispara `onerror`, y ese evento ejecuta `print()`."
      - kind: "note"
        text: |
          una vez se cargue el código arbitrario se guarda en el servidor y se envia a la victima, en este caso para confirmar que la victima realizo dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la victima.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406162006952.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la victima
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406162058142.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages/file-20260406162106156.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas de explotación con el mismo fin: - `<iframe src='https://TARGET-LAB.web-security-academy.net/' onload='this.contentWindow.postMessage('<img src=1 onerror=print()>','*')'></iframe>` — construcción típica para el body del Exploit Server, sin necesitar la consola. - Si el sitio objetivo valida parcialmente `e.origin` con `indexOf()` o `endsWith()`, un dominio como `https://TARGET-LAB.web-security-academy.net.attacker.net` o `https://attacker-TARGET-LAB.web-security-academy.net` puede bypasear la validación — revisa siempre cómo se compara `e.origin`, no solo si existe la comprobación. - `<svg onload=print()>` como alternativa a `<img onerror=print()>`, mismo mecanismo de sink `innerHTML`."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          En este laboratorio, la explotación misma es el acceso inicial: no hay credenciales que capturar, el objetivo es demostrar ejecución de JavaScript arbitrario en el navegador de la víctima mediante `print()`.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un engagement real, este mismo patrón (mensaje no verificado → sink peligroso) normalmente no se demuestra con `print()`, sino robando `document.cookie`, `localStorage`, o abriendo un canal de exfiltración hacia un servidor propio — exactamente como en [[Exploiting cross-site scripting to steal cookies]]."

lessons:
  - "Completar lecciones aprendidas"
mitigation:
  - 'Validar siempre `e.origin` contra una lista exacta de dominios permitidos, nunca con comprobaciones parciales como `indexOf()` o `endsWith()`. Nunca asignar datos de un mensaje directamente a `innerHTML`; usar `textContent` cuando el dato no necesita ser HTML. Sanitizar con una librería como DOMPurify si el HTML es realmente necesario. Considerar validar también la estructura y el tipo de dato esperado antes de procesar el mensaje.'
---

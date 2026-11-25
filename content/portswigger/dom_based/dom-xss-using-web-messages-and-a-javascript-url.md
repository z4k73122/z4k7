---
title: "DOM XSS using web messages and a JavaScript URL"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-using-web-messages-and-a-javascript-url"
author: "Z4k7"
date: "2026-04-06"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "DOM"
  - "BurpSuite_Academy"
  - "Web"
  - "Open"
techniques:
  - "DOM XSS"
  - "postMessage"
  - "web messages"
  - "open redirect"
  - "javascript pseudo-protocol"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy: vulnerabilidad de redirección basada en DOM activada mediante mensajería web. Un listener de message valida e.data únicamente con indexOf('http:') o indexOf('https:') antes de asignarlo a location.href. Cadena de ataque: source window.addEventListener('message') → validación débil por subcadena → sink location.href → entrega vía Exploit Server con postMessage('javascript:print()// http:','*').  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio demuestra una vulnerabilidad de redirección basada en DOM que se activa mediante mensajería web. Para resolver este laboratorio, construya una página HTML en el servidor de explotación que explote esta vulnerabilidad y llame a la `print()` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Ingresamos al laboratorio para identificar el entorno y poder consultar alguna información relevante
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406162344546.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el codigo fuente de la web
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              window.addEventListener('message', function(e) {
                  var url = e.data;
                      if (url.indexOf('http:') > -1 || url.indexOf('https:') > -1) {
                          location.href = url;
                      }
                  }, false);
          </script>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Fíjate en la diferencia con el lab anterior ([[DOM XSS using web messages]]): el sink ya no es `innerHTML`, es `location.href`. Eso cambia por completo qué payload sirve — aquí no hay HTML que inyectar, hay una URL que controlar."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          En JavaScript, el método `addEventListener` se utiliza para registrar un escuchador de eventos. Esto significa que el navegador queda pendiente de una acción específica y ejecuta una función cuando esa acción ocurre. En nuestro caso, el evento es `message`, que no proviene de una interacción directa del usuario (como un clic), sino de la comunicación entre ventanas, iframes o workers.
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              window.addEventListener('message', function(e) {
                  var url = e.data;
                      if (url.indexOf('http:') > -1 || url.indexOf('https:') > -1) {
                          location.href = url;
                      }
                  }, false);
          </script>
      - kind: "note"
        text: |
          En este caso podremos usar el método `postMessage()` para tratar de enviar información y validar si el `addEventListener` crea el evento y se puede visualizar el la web aplicamos el siguiente código de prueba y lo enviamos desde la misma consola para consultar la respuesta
      - kind: "code"
        lang: "JS"
        code: |
          window.postMessage(
            "El usuario es 'bob' y la contraseña es 'secret'",
          );
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406163614689.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Sin respuesta alguna por parte de la web en la parte de la validación de la URL
          El código acepta cualquier cadena que contenga `http:` o `https:` y redirige al usuario sin verificar si el enlace es confiable.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406163915928.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos este fragmento de codigo
      - kind: "code"
        lang: "JS"
        code: |
          window.postMessage(
            "El usuario es 'bob' y la contraseña es 'secret' http:",
          );
      - kind: "note"
        text: |
          Si aplicamos este fragmente contamos con un redireccionamiento
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406164031676.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          window.postMessage(
            "javascript:print()// http:",
          );
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406164345387.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          los caracteres `//` cumplen una función muy concreta: iniciar un comentario en JavaScript dentro de la cadena. en este caso estamos cumpliendo con la validacion del `var url = e.data;`
      - kind: "callout"
        type: "info"
        label: "Por qué funciona `javascript:print()// http:`"
        text: "El sink es `location.href = url`, y los navegadores interpretan el prefijo `javascript:` como pseudo-protocolo: en vez de navegar a una URL, ejecutan el resto de la cadena como código. El sufijo ` http:` existe únicamente para que `url.indexOf('http:')` devuelva una posición válida y pase la validación; el `//` que lo precede lo convierte en un comentario de JavaScript para que nunca se ejecute como parte del payload."
      - kind: "note"
        text: |
          Ingresamos en este caso en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "code"
        lang: "JS"
        code: |
          <iframe 
          	src="[//vulnerable-website](https://0ae4002e035e6f0f8536c6f3007600a2.web-security-academy.net/)" 
          	onload="this.contentWindow.postMessage('javascript:print()// http:','*')"
          >
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406164817027.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez se cargue el código arbitrario se guarda en el servidor y se envia a la victima en este caso para confirmar que la victima realizo dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la victima.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406164842661.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la victima
      - kind: "image"
        src: "assets/images/DOM%20XSS%20using%20web%20messages%20and%20a%20JavaScript%20URL/file-20260406164943106.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas de explotación con el mismo fin: - En vez de `//`, se puede cerrar el sufijo con un literal: `javascript:print()/*http:*/` también comenta lo que sigue sin depender de fin de línea. - Si la validación fuera `startsWith('http')` en vez de `indexOf`, este bypass no funcionaría — tendrías que anteponer el `http:` en vez de añadirlo al final: revisa siempre qué método de comparación usa el filtro, no solo qué palabra busca. - Mismo patrón aplicable a cualquier sink de navegación: `window.open(url)`, `location.assign(url)`, `location.replace(url)`."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          En este laboratorio, la explotación misma es el acceso inicial: no hay credenciales que capturar, el objetivo es demostrar ejecución de JavaScript arbitrario en el navegador de la víctima mediante `print()`.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un engagement real, redirigir con `javascript:` a través de un sink de navegación mal validado es la misma clase de vector que un open redirect clásico, pero con ejecución de código en vez de solo phishing. Revisa siempre el objeto `location` completo (`href`, `assign()`, `replace()`), no solo el que apareció en este lab."

lessons:
  - "Completar lecciones aprendidas"
mitigation:
  - 'Nunca validar una URL buscando subcadenas; usar el constructor `new URL()` y comprobar explícitamente su `protocol` contra una lista exacta de protocolos permitidos (`http:`, `https:`). Rechazar cualquier URL cuyo `protocol` no esté en esa lista, incluyendo `javascript:`, `data:` y `vbscript:`. Validar siempre `e.origin` contra un dominio exacto antes de procesar cualquier dato del mensaje, independientemente del sink al que se dirija después.'
---

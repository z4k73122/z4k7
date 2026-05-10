---
title: "Reflected XSS into a JavaScript string with angle brackets HTML encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-a-javascript-string-with-angle-brackets-html-encoded"
author: "Z4k7"
date: "2026-04-18"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "JavaScript"
techniques:
  - "JavaScript String Escape"
  - "Script Context Breakout"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde la entrada se refleja dentro de una cadena JavaScript y los corchetes angulares están codificados en HTML. La solución requiere escapar de la cadena JavaScript usando comillas simples y comentarios para ejecutar alert(document.domain) sin cerrar la etiqueta script.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios reflejadas en la funcionalidad de seguimiento de consultas de búsqueda donde se codifican corchetes angulares. La reflexión ocurre dentro de una cadena de JavaScript. Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que salga de la cadena de JavaScript y llame a la `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425002417477.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos una solicitud de prueba para validar el comportamiento de la web
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425002614220.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Lo anterior se valida que una vez ingresado datos se renderiza un script en este caso el objetivo es tratar de salir el entorno del script para poder ejecutar un alert
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El laboratorio menciona que los corchetes angulares están codificados en HTML. Esto significa `<` y `>` se convierten a `&lt;` y `&gt;`. Sin embargo, la entrada está dentro de una cadena JavaScript, por lo que podemos escapar usando comillas y comentarios."

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
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425002756562.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No permite salir cerrando solo la etiqueta el sistema esta sanitizado contra dicho escape
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          '\z4k7
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425003014956.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El anterior si nos permite escapar sería tratar de comentar a partir para validar si toma el alert
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ';alert(document.domain)//%27
      - kind: "note"
        text: |
          El anterior código si nos permite escapar de la variable
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425003331608.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425003356725.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload `';alert(document.domain)//%27` funciona así: - `'` cierra la cadena JavaScript abierta - `;` termina la declaración anterior - `alert(document.domain)` ejecuta nuestro código - `//` inicia un comentario - `%27` (comilla URL-encoded) es ignorada como parte del comentario Este bypass es efectivo cuando los corchetes angulares están codificados pero las comillas no."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El contexto es un script que crea una variable de cadena:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var searchTerms = 'USER_INPUT_HERE';
          document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
      - kind: "note"
        text: |
          Inyectamos el payload:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ';alert(document.domain)//
      - kind: "note"
        text: |
          El resultado final en el navegador es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var searchTerms = '';alert(document.domain)//';
          document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425003331608.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El comentario `//` es crucial aquí. Cualquier código después del `//` es ignorado, incluyendo la comilla de cierre original que el desarrollador puso. Sin el comentario, tendríamos un error de sintaxis."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final que se envía es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ';alert(document.domain)//
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. La comilla simple cierra la cadena original
          2. El punto y coma termina la declaración
          3. `alert(document.domain)` se ejecuta
          4. El comentario `//` ignora el resto del código
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20HTML%20encoded/file-20260425003331608.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este patrón es muy común en XSS. Cuando la entrada está dentro de una cadena JavaScript, busca: 1. Qué carácter delimita la cadena (simple `'`, doble `'`, backtick) 2. Qué caracteres están permitidos para escapar 3. Cómo comentar el resto del código"

lessons:
  - 'La codificación HTML de corchetes angulares (`<` y `>` a `&lt;` y `&gt;`) no protege contra escapes de cadena JavaScript'
  - 'Las comillas simples pueden usarse para cerrar cadenas y acceder al contexto JavaScript global'
  - 'Los comentarios (`//`) permiten ignorar código restante y resolver errores de sintaxis'
  - 'La URL-encoding (`%27`) es solo una representación alternativa de caracteres, el navegador la decodifica'
  - 'Los contextos JavaScript requieren diferentes payloads que los contextos HTML'
  - '`document.domain` es una propiedad accesible que confirma la ejecución de JavaScript'
mitigation:
  - 'Usar `JSON.stringify()` o funciones equivalentes para escapar correctamente strings en JavaScript'
  - 'Nunca interpolar entrada del usuario directamente en código JavaScript'
  - 'Usar Content Security Policy (CSP) con `script-src ''self''` para bloquear scripts inline'
  - 'Validar y sanitizar entrada en servidor antes de insertar en contextos JavaScript'
  - 'Usar frameworks que escapan automáticamente (React, Vue, Angular) en lugar de concatenación manual'
  - 'Implementar validación en servidor para rechazar payloads sospechosos'
---

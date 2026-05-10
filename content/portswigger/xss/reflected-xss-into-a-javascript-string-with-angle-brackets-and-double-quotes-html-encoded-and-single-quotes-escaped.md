---
title: "Reflected XSS into a JavaScript string with angle brackets and double quotes HTML-encoded and single quotes escaped"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-a-javascript-string-with-angle-brackets-and-double-quotes-html-encoded-and-single-quotes-escaped"
author: "Z4k7"
date: "2026-04-20"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "JavaScript"
techniques:
  - "Backslash Escape Bypass"
  - "JavaScript String Breakout"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde la entrada se refleja dentro de una cadena JavaScript, los corchetes angulares y comillas dobles están codificados en HTML, y las comillas simples están escapadas. La solución requiere usar una barra invertida para escapar el carácter de escape y luego salir de la cadena para ejecutar alert(document.domain).  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios reflejadas en la funcionalidad de seguimiento de consultas de búsqueda, donde los corchetes angulares y las comillas dobles se codifican en HTML y las comillas simples se escapan.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que salga de la cadena JavaScript y llame a la `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004125109.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos una solicitud en el apartado search para validar el comportamiento de la web
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004221809.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al momento de enviar la solicitud de búsqueda por medio de search se renderiza un script que crea un elemento de img
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este laboratorio añade una capa adicional de protección: las comillas simples están escapadas (convertidas a `\'`). Esto previene el simple `'` escape del laboratorio anterior. Necesitamos un bypass diferente."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Validamos si es posible escapar el apartado de la variable con el siguiente código
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ';
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004426961.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No permite escapar del script validando a detalle el script si ingresamos `\` es posible que escapemos del script como se puede ver a continuación.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004624027.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso vamos a ingresar código para disparar un alert
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          \';alert(document.domain)//
      - kind: "note"
        text: |
          Pasamos el anterior código y nos permite escapar del script
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004822550.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004843968.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload `\';alert(document.domain)//` funciona así: - `\` escapa la barra invertida que el servidor añadió - `'` cierra la cadena JavaScript - `;alert(document.domain)` ejecuta nuestro código - `//` comenta el resto  Explicación técnica: El servidor escapa comillas simples a `\'`, pero cuando nosotros enviamos `\'`, el servidor lo escapa nuevamente a `\\'`. Sin embargo, en JavaScript, `\\` es una barra invertida literal, por lo que la comilla simple siguiente es interpretada como fin de cadena, no como carácter escapado."

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
          Cuando el servidor recibe `\';alert(document.domain)//`, lo escapa a:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var searchTerms = '\\';alert(document.domain)//';
          document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
      - kind: "note"
        text: |
          En JavaScript:
      - kind: "bullet"
        text: "\\ es una barra invertida literal"
      - kind: "bullet"
        text: "' cierra la cadena"
      - kind: "bullet"
        text: ";alert(document.domain) se ejecuta"
      - kind: "bullet"
        text: "// comenta el resto"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004822850.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un bypass de 'doble escape'. El servidor intenta proteger comillas escapándolas, pero si el atacante envía una barra invertida antes, el servidor escapa eso también, resultando en una barra invertida literal que no puede escapar la comilla siguiente."

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
          \';alert(document.domain)//
      - kind: "note"
        text: |
          Una vez ejecutado en el contexto JavaScript:
          1. `\\` se interpreta como una barra invertida literal
          2. `'` cierra la cadena original
          3. `;alert(document.domain)` se ejecuta
          4. `//` ignora el resto del código
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20JavaScript%20string%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20escaped/file-20260425004822550.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'El escaping de comillas no es suficiente si el atacante puede controlar también el carácter de escape (barra invertida)'
  - 'Un doble escape (escaping del escapador) puede resultar en un bypass si no se implementa correctamente'
  - 'Las barras invertidas deben ser escapadas primero antes que otras comillas'
  - 'Los comentarios (`//`) son efectivos para ignorar código protegido de síntesis incorrecta'
  - 'La validación debe ser hecha en servidor antes de renderizar en JavaScript, no confiar en escaping'
  - 'El contexto JavaScript es diferente al HTML - se requieren técnicas de escape diferentes'
mitigation:
  - 'Usar `JSON.stringify()` para serializar correctamente strings en JavaScript'
  - 'Escapar primero barras invertidas antes que otros caracteres'
  - 'Nunca concatenar entrada de usuario directamente en código JavaScript'
  - 'Usar Content Security Policy (CSP) con `script-src ''self''` para bloquear scripts inline'
  - 'Validar entrada en servidor y rechazar payloads sospechosos antes de renderizar'
  - 'Usar frameworks que manejan escaping automáticamente (React, Vue, Angular)'
  - 'Implementar listas negras de caracteres peligrosos como `\`, `''`, `"`, `;`'
---

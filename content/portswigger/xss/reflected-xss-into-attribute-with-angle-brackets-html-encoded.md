---
title: "Reflected XSS into attribute with angle brackets HTML-encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-attribute-with-angle-brackets-html-encoded"
author: "Z4k7"
date: "2026-04-23"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "HTMLAttribute"
  - "x27"
techniques:
  - "HTML Attribute Injection"
  - "Event Handler in Attributes"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde la entrada se refleja dentro de un atributo HTML (value de un input o similar) y los corchetes angulares están codificados en HTML. La solución requiere cerrar el atributo actual con comillas y añadir un nuevo atributo de evento para ejecutar alert(document.domain).  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios reflejada en la funcionalidad del blog de búsqueda donde los corchetes angulares están codificados en HTML. Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que inyecte un atributo y llame a la `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422195210785.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el comportamiento de la web
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422195428673.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando el código fuente no se observa algún script disponible
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422200022931.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando al momento de ingresar cualquier Tag lo representa pero no permite interactuar con el mismo
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La inyección está dentro de un atributo HTML, no en contenido de etiqueta. Esto significa no podemos inyectar nuevas etiquetas cerrando `>`. Necesitamos permanecer dentro del atributo y cerrar sus comillas para añadir nuevos atributos."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Verificando el proceso que podríamos generar es tratar de cerrar el value e intentar ingresar un evento en el mismo.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422201024020.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si aplicamos el código `"x style="padding:35px"`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422201211658.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si permite manipular el DOM
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422201952254.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se ejecuta sin problema alguno
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422202025325.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422202040587.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload `' style='padding:35px` funciona porque: - `'` cierra el atributo original (value, search, etc.) - `x` es un atributo inválido pero ignorado por el navegador - `style='padding:35px'` añade un nuevo atributo style válido - El navegador renderiza todos los atributos válidos aunque haya inválidos en medio"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El contexto es un atributo HTML que contiene entrada del usuario:
      - kind: "code"
        lang: "HTML"
        code: |
          <input type="text" value="USER_INPUT_HERE">
      - kind: "note"
        text: |
          O podría ser:
      - kind: "code"
        lang: "HTML"
        code: |
          <img src="/resources/images/tracker.gif?searchTerms=USER_INPUT_HERE">
      - kind: "note"
        text: |
          Inyectamos para cerrar el atributo y añadir un evento:
      - kind: "code"
        lang: "HTML"
        code: |
          " onmouseover="alert(document.domain
      - kind: "note"
        text: |
          El resultado final en el navegador sería:
      - kind: "code"
        lang: "HTML"
        code: |
          <input type="text" value="" onmouseover="alert(document.domain)">
      - kind: "note"
        text: |
          O si está en un img:
      - kind: "code"
        lang: "HTML"
        code: |
          <img src="/resources/images/tracker.gif?searchTerms=" onmouseover="alert(document.domain)">
      - kind: "note"
        text: |
          Cuando el usuario pasa el mouse sobre el elemento, se ejecuta `alert(document.domain)`.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422201024020.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Los eventos en atributos HTML no necesitan ser disparados por interacción en este contexto. Algunos eventos como `onload`, `onerror`, `onmouseover` pueden auto-dispararse dependiendo del elemento. Para garantizar ejecución sin interacción, busca: - `onload` en img, body, iframe - `onerror` en img, script - `onmouseover` / `onmouseenter` si el usuario interactúa (menos ideal)"

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload más simple que funciona:
      - kind: "code"
        lang: "HTML"
        code: |
          " onmouseover="alert(document.domain
      - kind: "note"
        text: |
          Pero para garantizar ejecución sin interacción, si el elemento es un img:
      - kind: "code"
        lang: "HTML"
        code: |
          " onerror="alert(document.domain
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. Las comillas cierran el atributo original
          2. El nuevo atributo de evento se añade
          3. El evento se dispara (onerror automáticamente, onmouseover requiere interacción)
          4. `alert(document.domain)` se ejecuta
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20attribute%20with%20angle%20brackets%20HTML-encoded/file-20260422202025325.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'La inyección en atributos HTML es diferente que en contenido de etiquetas'
  - 'Cerrar comillas permite inyectar nuevos atributos en la misma etiqueta'
  - 'Los eventos en atributos HTML se ejecutan sin necesidad de etiquetas script'
  - 'La codificación HTML de `<` y `>` no protege contra inyección de atributos'
  - 'El navegador renderiza todos los atributos válidos aunque haya inválidos en medio'
  - 'Ciertos eventos como `onerror` se disparan automáticamente sin interacción del usuario'
  - 'Los eventos `onmouseover` requieren interacción pero son efectivos como fallback'
mitigation:
  - 'Usar comillas en todos los atributos HTML para delimitar valores claramente'
  - 'Validar entrada y rechazar comillas, comillas simples, y espacios sospechosos'
  - 'Escapar caracteres especiales: `"` a `&quot;`, `''` a `&#x27;`, espacio a `%20` en contextos específicos'
  - 'Usar Content Security Policy (CSP) con restricciones de atributos de eventos'
  - 'Validar en servidor que los atributos recibidos sean válidos'
  - 'Usar frameworks que escapan automáticamente (React, Vue, Angular)'
  - 'Implementar validación de atributos permitidos usando whitelist'
---

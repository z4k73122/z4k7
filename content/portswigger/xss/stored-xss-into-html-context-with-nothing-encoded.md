---
title: "Stored XSS into HTML context with nothing encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "stored-xss-into-html-context-with-nothing-encoded"
author: "Z4k7"
date: "2026-04-14"
year: "2026"
status: "pwned"
tags:
  - "Web_Security"
techniques:
  - "Stored XSS"
  - "DOM Injection"
  - "HTML context exploitation"
tools:
  - "BurpSuite"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy sobre Stored XSS en contexto HTML sin encoding. La vulnerabilidad radica en que los comentarios de blog no sanitizan entrada de usuario, permitiendo inyectar código JavaScript que se ejecuta cuando otros usuarios visualizan el blog. Técnica: inyección directa de <script> tags que llamar a alert(). Cadena de ataque: reconocimiento → identificación de punto de inyección → prueba de payload → explotación.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios (XSS) almacenada en la funcionalidad de comentarios.
          Para resolver este laboratorio, envíe un comentario que llame a la `alert`función que se activa al visualizar la entrada del blog.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414134837038.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el entorno del laboratorio para validar detalles relevantes en el código que nos pueda brindar información para poder saltar el `alert()` ingresamos en el aparatado de blog donde nos recomienda en el objetivo del laboratorio.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En reconocimiento, siempre revisa el DOM completo. En este caso, inspeccionaste bien la estructura HTML inicial. Próxima vez: también documenta headers HTTP (Content-Type, X-Frame-Options, CSP) — ayuda a identificar defensas adicionales contra XSS. En PortSwigger Academy, usa Burp Repeater para capturar respuestas completas."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado del blog `web-security-academy.net/post?postId=5` consultando el código fuente no contamos con algún código relevante en este caso seria probar ha siegas para tratar de explotar el XSS.
          Para validar donde es posible inyectar código podríamos enviar una etiqueta `<h1>Name<h1>` de esta manera es posible consultar donde se inyecta en el DOM.
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414135736735.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando el apartado de comment no esta sanitizado y es permitido ingresar código en el DOM:
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414135939864.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Código HTML de respuesta:
      - kind: "code"
        lang: "HTML"
        code: |
          <section class="comment">
              <p>
          	    <img src="/resources/images/avatarDefault.svg" class="avatar">                            <a id="author" href="https://z4k7.vercel.app/">&lt;h1&gt;Name&lt;h1&gt;</a> | 14 April 2026
              </p>
              <p></p><h1>Comment</h1><h1><p></p>
              <p></p>
              </h1>
          </section>
      - kind: "callout"
        type: "warning"
        label: "Punto de Inyección Identificado"
        text: "El campo de comentarios no realiza encoding de caracteres especiales. El HTML ingresado se refleja directamente en el DOM sin sanitización. Tags como `<h1>`, `<script>` se interpretan como HTML válido."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Excelente descubrimiento. Aquí es donde aplica el concepto de 'context-aware encoding' — en PortSwigger hay otros labs donde el contexto SÍ está protegido (atributos, JavaScript context, etc.). Este lab es el caso más simple: HTML context sin protección. Documenta por qué no funciona aquí `<img src=x onerror=alert()>` vs `<script>alert()</script>` — es por cómo el navegador parsea cada uno."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ya constatamos con la validación del apartado donde nos permite ingresar código pasamos a ingresar el alert consultamos primero con `<script>alert(document.domain)</script>`.
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414140349634.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma la explotación del XSS:
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414140420094.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Stored XSS into HTML context with nothing encoded/file-20260414140433604.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Código HTML de respuesta con payload ejecutado:
      - kind: "code"
        lang: "HTML"
        code: |
          <section class="comment">
              <p>
              <img src="/resources/images/avatarDefault.svg" class="avatar">                            <a id="author" href="https://0a9e00b703e3b860807b3f2c002300b5.web-security-academy.net/javascript:alert(document.domain)">zakt</a> | 14 April 2026
              </p>
              <p><script>alert(document.domain)</script></p>
              <p></p>
          </section>
      - kind: "callout"
        type: "info"
        label: "Payload Exitoso"
        text: "El payload `<script>alert(document.domain)</script>` se ejecuta cuando la página carga. El navegador interpreta la etiqueta `<script>` y ejecuta el código dentro, mostrando un alert con el dominio actual."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El alert() se ejecutó = laboratorio completado. Pero aquí viene lo importante: ¿por qué `document.domain` en lugar de solo `alert(1)`? Porque Burp te lo pide específicamente en los labs. En un ataque real, aquí es donde harías `fetch()` para exfiltrar cookies, redirigir usuarios a phishing, inyectar keyloggers, etc. Stored XSS = atacante reutiliza el payload para todas las víctimas que visiten esa página."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          ✅ Lab completado: El payload `<script>alert(document.domain)</script>` se ejecutó correctamente en el contexto del comentario almacenado.

lessons:
  - 'Stored XSS vs Reflected XSS: Este lab es Stored (persistente en base de datos). La diferencia clave: Stored afecta a TODOS los que lean el comentario. Reflected solo afecta al que hace click en el link.'
  - 'HTML context sin encoding = RCE en el navegador: Cuando no hay sanitización de tags HTML, puedes ejecutar cualquier JavaScript.'
  - 'Payload testing: Empezar con payloads simples (`<h1>`, `<script>alert(1)</script>`) es más efectivo que intentar evasiones complejas cuando no hay defensa.'
  - 'DOM inspection: Ver dónde se refleja tu entrada en el HTML es el primer paso para entender cómo explotar.'
mitigation:
  - 'Output Encoding: Implementar encoding de caracteres especiales (`<` → `&lt;`, `>` → `&gt;`, etc.) en comentarios antes de guardar en BD.'
  - 'Content Security Policy (CSP): Header `Content-Security-Policy: script-src ''self''` previene ejecución de scripts inline.'
  - 'Validación en servidor: Whitelist de caracteres permitidos (solo alfanuméricos, espacios, puntuación básica) en campos de comentarios.'
  - 'HTTPOnly + Secure cookies: Reduce daño si XSS roba cookies (`document.cookie` no funcionaría).'
  - 'Sanitización con librerías: DOMPurify, OWASP HTML Sanitizer, o equivalente en tu stack.'
---

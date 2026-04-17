---
title: "DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-in-angularjs-expression-with-angle-brackets-and-double-quotes-html-encoded"
author: "Z4k7"
date: "2026-04-15"
year: "2026"
status: "pwned"
tags:
  - "DOM"
  - "AngularJS"
  - "Web"
techniques:
  - "DOM XSS"
  - "AngularJS expression interpolation"
  - "Prototype chain pollution"
  - "JavaScript Function() constructor"
  - "constructor.constructor() exploitation"
tools:
  - "AngularJS"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que explota DOM XSS mediante AngularJS expression interpolation. La aplicación detecta el atributo ng-app de AngularJS y ejecuta cualquier expresión dentro de {{}}. Cadena de ataque: reconocer ng-app → testear interpolación básica ({{7*7}}) → escalar a prototype chain ({{constructor}}) → acceder a Function constructor ({{constructor.constructor('code')()}}) → ejecutar arbitrary JavaScript via alert(). Técnicas: AngularJS sink exploitation, prototype chain manipulation, JavaScript Function() constructor for RCE."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios (XSS) basada en el DOM en una expresión de AngularJS dentro de la funcionalidad de búsqueda.
          AngularJS es una popular biblioteca de JavaScript que escanea el contenido de los nodos HTML que contienen el `ng-app` atributo (también conocido como directiva de AngularJS). Al agregar una directiva al código HTML, se pueden ejecutar expresiones JavaScript entre llaves dobles. Esta técnica es útil cuando se codifican corchetes angulares.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que ejecute una expresión de AngularJS y llame a la `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417073129151.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          Ingresamos en el código fuente para confirmar el uso de angular y validar la versión de la librería. En este caso contamos con la siguiente información:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417073311571.jpg"
        caption: "Validación de AngularJS en source code"
      - kind: "note"
        text: |
          Se puede confirmar la información del objetivo: contamos con un `ng-app` directive presente en el HTML. Esto significa que AngularJS está activo y procesará todas las expresiones dentro de `{{}}` como código JavaScript.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El atributo `ng-app` es el punto de entrada de AngularJS. Cualquier contenido dentro de `{{}}` que esté dentro de un elemento con `ng-app` será procesado como una expresión de AngularJS. Esto NO es SSTI (Server-Side Template Injection) — es procesamiento de templates en el lado del cliente (browser). La diferencia es crítica: SSTI ocurre en el servidor, AngularJS XSS ocurre en el navegador de la víctima."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Para confirmar que AngularJS está procesando expresiones, enviamos un test simple:
      - kind: "code"
        lang: "JS"
        code: |
          {{7*7}}
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417074556968.jpg"
        caption: "Test básico de interpolación"
      - kind: "note"
        text: |
          El resultado es `49`, lo que confirma que AngularJS está procesando la expresión matemática. Esto es equivalente a un SSTI en algunos aspectos, pero NO es SSTI — es DOM XSS específico de AngularJS.
      - kind: "callout"
        type: "warning"
        label: "Diferencia crítica: SSTI vs AngularJS XSS"
        text: "- SSTI: Ocurre en el servidor. El servidor procesa templates y genera HTML. Si el input no está sanitizado, puedes ejecutar código del servidor (Python, Java, etc.). - AngularJS XSS: Ocurre en el cliente (navegador). AngularJS procesa expresiones JavaScript dentro de `{{}}`. Si el input no está sanitizado, ejecutas código JavaScript del navegador.  En este lab, NO es SSTI porque el servidor devuelve HTML estático con `ng-app`. AngularJS en el navegador es lo que procesa la expresión."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ya que confirmamos que AngularJS procesa expresiones, necesitamos escalar a RCE (Remote Code Execution). El truco es usar la cadena de prototipos de JavaScript para acceder al constructor de Function().
          Paso 1: Acceder al constructor
      - kind: "code"
        lang: "JS"
        code: |
          {{constructor}}
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417084027483.jpg"
        caption: "Acceso al constructor del scope"
      - kind: "note"
        text: |
          El `constructor` apunta a la función constructora del objeto actual (en este caso, el scope de AngularJS).
          Paso 2: Doble constructor — acceder a Function()
      - kind: "code"
        lang: "JS"
        code: |
          {{constructor.constructor}}
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417084432829.jpg"
        caption: "Acceso a Function constructor"
      - kind: "note"
        text: |
          Aquí estamos accediendo al `constructor` del `constructor`. El constructor de una función es siempre `Function()`. Esto nos da acceso directo a la función `Function()` de JavaScript.
          La respuesta que vemos es la función constructora:
      - kind: "code"
        lang: "JS"
        code: |
          function m({
            this.$id=++pb;
            this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;
            this.$root= this;this.$$suspended=this.$$destroyed=!1;
            this.$$listeners={};
            this.$$listenerCount={};
            this.$$watchersCount=0;this.$$isolateBindings=null
          }
      - kind: "note"
        text: |
          Paso 3: Crear y ejecutar función
          Ahora que tenemos acceso a `Function()`, podemos crear una función que ejecute código arbitrary:
      - kind: "code"
        lang: "JS"
        code: |
          {{constructor.constructor('alert(document.domain)')()}}
      - kind: "note"
        text: |
          Desglosamos esto:
          1. `constructor.constructor` → `Function()`
          2. `Function('alert(document.domain)')` → Crea una nueva función que ejecuta `alert(document.domain)`
          3. `()` → Ejecuta la función immediatamente
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417085641236.jpg"
        caption: "Payload final en la consola"
      - kind: "note"
        text: |
          Paso 4: Aplicar en el lab
          Enviamos el payload en el campo de búsqueda:
      - kind: "code"
        lang: "BASH"
        code: |
          {{constructor.constructor('alert(document.domain)')()}}
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417085936467.jpg"
        caption: "Payload en búsqueda"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417090405181.jpg"
        caption: "Ejecución del alert"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417090531185.jpg"
        caption: "Confirmación de ejecución"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20AngularJS%20expression%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded/file-20260417090546180.jpg"
        caption: "Alert visible en navegador"
      - kind: "callout"
        type: "info"
        label: "Prototype Chain Exploitation en AngularJS"
        text: "La cadena de prototipos de JavaScript es: `objeto → objeto.constructor → objeto.constructor.constructor (Function)`  Al acceder a `constructor.constructor`, estamos saltando dos niveles: - Nivel 1: `constructor` del scope de AngularJS (función `m()`) - Nivel 2: `constructor` de esa función, que es `Function()` nativa de JavaScript  Una vez que tenemos `Function()`, podemos ejecutar cualquier código JavaScript como si fuera `eval()`."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload fue ejecutado exitosamente en el navegador de la víctima:
          1. La expresión `{{constructor.constructor('alert(document.domain)')()}}` fue procesada por AngularJS
          2. AngularJS evaluó la expresión y ejecutó el código JavaScript
          3. Una función anónima que ejecuta `alert(document.domain)` fue creada
          4. La función fue ejecutada inmediatamente con `()`
          5. El alert mostró `web-security-academy.net` — demostrando ejecución de código arbitrary

lessons:
  - 'AngularJS con `ng-app` procesa expresiones dentro de `{{}}` — cualquier input aquí es potencialmente executable'
  - 'La cadena de prototipos de JavaScript permite acceder a constructores y métodos no intencionados'
  - '`constructor.constructor()` es equivalente a `Function()` — proporciona acceso a RCE en AngularJS'
  - '`{{}}` interpolation no es lo mismo que SSTI — ocurre en el cliente, no en el servidor'
  - 'Diferencia crítica: AngularJS 1.x permite esto; AngularJS 2+ (ahora Angular) cambió el modelo de templates'
  - 'El laboratorio especifica "angle brackets and double quotes HTML-encoded" — esto significa que algunas defensas pueden estar activas pero insuficientes'
  - '`document.domain` es accesible via JavaScript — información de seguridad de la página'
mitigation:
  - 'Deshabilitar AngularJS 1.x en favor de Angular moderno (2+) o librerías más seguras (React, Vue)'
  - 'Si debes usar AngularJS 1.x, usar `ng-bind-html` con `$sanitize` para escapar HTML'
  - 'Implementar Content Security Policy (CSP) que bloquee inline scripts y eval-like behavior'
  - 'Nunca permitir que input del usuario sea interpolado en expresiones de AngularJS'
  - 'Usar expresiones de solo lectura cuando sea posible (ej: `ng-bind` en lugar de `{{}}`)'
  - 'Sanitizar y validar todo input en el servidor ANTES de pasarlo al cliente'
  - 'Usar template engines modernos (React, Vue) que escapan por defecto'
  - 'Monitorear uso de `constructor`, `prototype`, `__proto__` en aplicaciones web'
---

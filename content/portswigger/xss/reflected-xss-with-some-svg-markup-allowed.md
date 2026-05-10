---
title: "Reflected XSS with some SVG markup allowed"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "reflected-xss-with-some-svg-markup-allowed"
author: "Z4k7"
date: "2026-04-30"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "SVG"
techniques:
  - "SVG Event Handlers"
  - "Tag Enumeration"
  - "Animation Events"
tools:
  - "BurpSuite"
  - "Intruder"
flags_list:
  - label: "alert"
    value: "Ejecutado exitosamente document.domain"
summary: "Laboratorio de XSS Reflejado donde se bloquean etiquetas comunes pero se permiten algunos tags SVG. La solución requiere enumerar mediante Intruder cuáles etiquetas SVG están permitidas, luego identificar qué eventos SVG funcionan (como onbegin en <animateTransform>) para ejecutar alert() sin usar event handlers HTML tradicionales como onclick."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad XSS reflejada simple. El sitio bloquea las etiquetas comunes, pero omite algunas etiquetas y eventos SVG.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que llame al `alert()` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422184912627.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el comportamiento de la web para validar su comportamiento y poder llegar a validar la lógica de la misma.
          Enviamos una consulta básica `z4k7`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422185108202.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si tratamos de enviar una solicitud con alguna validación como `<h1>z4k7</h1>` no se permite contamos con un bloqueo por parte del sistema puede ser un WAF
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422185251102.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El laboratorio menciona que algunos tags SVG sí son permitidos. A diferencia de HTML tags comunes, los tags SVG son menos conocidos y a menudo pasados por alto en listas negras. Necesitamos enumerar cuáles son permitidos."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultando el contenido en el apartado de observación menciona que el Tag SVG si es permitido en este caso sería validar por medio de Intruder cual es permitida por parte del servidor
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422185444429.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tomamos una de las solicitudes y la enviamos a Intruder para tratar de validar cual es el Evento que nos permite generar el alert
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422185557438.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Primero debemos confirmar cual es el Tag real que permite el servidor esto lo logramos enviando el listado de Tag en el apartado de Payload
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422185736699.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos la solicitud para confirmar
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422190907857.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Solo contamos con esta lista de TAG
      - kind: "table"
        headers:
          - "Etiqueta"
          - "Eventos principales soportados"
        rows:
          - ["`` `<animateTransform></animateTransform>` `` **(SVG)**", "No soporta eventos HTML tradicionales. Usa **eventos SMIL/SVG**: `` `beginEvent` ``, `` `endEvent` ``, `` `repeatEvent` ``. Se disparan cuando la animación empieza, termina o se repite."]
          - ["`` `<image></image>` `` **(SVG)**", "Soporta **eventos globales de SVG** (`` `onclick` ``, `` `onmouseover` ``, `` `onmouseout` ``, `` `onfocus` ``, `` `onblur` ``). Además: `` `onload` `` cuando la imagen se carga correctamente."]
          - ["`` `<svg></svg>` ``", "Soporta **eventos globales** (`` `onclick` ``, `` `onmouseover` ``, `` `onmousemove` ``, `` `onfocus` ``, `` `onblur` ``, `` `onkeydown` ``, etc.). También puede contener elementos con sus propios eventos (`` `<circle></circle>` ``, `` `<rect></rect>` ``, `` `<animateTransform></animateTransform>` ``, etc.)."]
          - ["`` `<title></title>` ``", "No soporta eventos. Es un elemento descriptivo, solo muestra un tooltip en navegadores, sin interacción con el usuario."]
      - kind: "note"
        text: |
          Enviamos el siguiente código `<svg><animateTransform><animateTransform> </svg>`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422192332443.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Permite pasar sin problema alguno en este caso ya nos queda validar un elemento que permite generar el alert solicitado
      - kind: "table"
        headers:
          - "Elemento"
          - "¿Permite `alert()` ?"
          - "Cómo se logra"
        rows:
          - ["`` `<animateTransform></animateTransform>` ``", "✅ Sí, pero solo mediante **eventos de animación** (`` `beginEvent` ``, `` `endEvent` ``, `` `repeatEvent` ``). Ejemplo: `` `onend='alert('Animación terminada')'` ``"]
          - ["`` `<image></image>` ``", "✅ Sí, soporta eventos globales (`` `onclick` ``, `` `onmouseover` ``, etc.) y de carga (`` `onload` ``, `` `onerror` ``). Ejemplo: `` `onclick='alert('Imagen clicada')'` ``"]
          - ["`` `<svg></svg>` ``", "✅ Sí, como contenedor soporta eventos globales (`` `onclick` ``, `` `onmouseover` ``, `` `onkeydown` ``, etc.). Ejemplo: `` `onclick='alert('SVG clicado')'` ``"]
          - ["`` `<title></title>` ``", "❌ No, no soporta eventos. Solo muestra un tooltip descriptivo, no puede ejecutar `` `alert()` ``."]
      - kind: "note"
        text: |
          En este caso apliquemos el primer Evento de `<animateTransform>`
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animateTransform beginEvent=alert(1)><animateTransform> </svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422193341224.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animateTransform endEvent=alert(1)><animateTransform> </svg>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422194351042.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando la lista podríamos aplicar el te fragmento de código
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animatetransform onbegin=alert(1) attributeName=transform>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422194525964.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Los eventos SVG difieren de HTML: - `beginEvent`, `endEvent`, `repeatEvent` son eventos SMIL específicos para animaciones - `onbegin`, `onend`, `onrepeat` son atributos que contienen código a ejecutar - No es igual que `onclick` HTML - es específico para animaciones SVG - El evento `onbegin` se dispara automáticamente cuando la animación comienza - `attributeName=transform` especifica qué atributo animar"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que ejecuta código automáticamente:
      - kind: "code"
        lang: "HTML"
        code: |
          <svg><animateTransform onbegin=alert(document.domain) attributeName=transform></svg>
      - kind: "note"
        text: |
          Desglosando:
      - kind: "bullet"
        text: "<svg> — contenedor SVG (permitido)"
      - kind: "bullet"
        text: "<animateTransform> — elemento de animación SVG (permitido)"
      - kind: "bullet"
        text: "onbegin=alert(document.domain) — evento que se dispara cuando la animación comienza"
      - kind: "bullet"
        text: "attributeName=transform — especifica qué atributo animar"
      - kind: "note"
        text: |
          Cuando el navegador renderiza:
          1. SVG es procesado
          2. `<animateTransform>` inicia su ciclo de animación
          3. El evento `onbegin` se dispara automáticamente
          4. `alert(document.domain)` se ejecuta sin interacción del usuario
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20some%20SVG%20markup%20allowed/file-20260422194525964.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El evento `onbegin` es automático - no requiere interacción del usuario. Tan pronto como el navegador renderiza el SVG y comienza la animación, el evento se dispara. Esto es diferente a `onclick` que requiere un clic."

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
          <svg><animateTransform onbegin=alert(document.domain) attributeName=transform></svg>
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. Navegador renderiza el SVG
          2. `<animateTransform>` comienza su ciclo de animación
          3. Se dispara el evento `onbegin`
          4. `alert(document.domain)` se ejecuta automáticamente
          5. No se requiere interacción del usuario

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "alert"
        value: "Ejecutado exitosamente document.domain"

lessons:
  - 'Los tags SVG tienen eventos diferentes a HTML - `onbegin`, `onend`, `onrepeat` vs `onclick`'
  - 'El evento `onbegin` en animaciones SVG se dispara automáticamente sin interacción'
  - 'La enumeración de tags permitidos revela que algunos tags SVG están permitidos cuando otros no'
  - 'Los eventos SMIL (Synchronized Multimedia Integration Language) son menos conocidos y menos restringidos'
  - '`attributeName` es un atributo legítimo en animaciones pero su presencia con `onbegin` es sospechosa'
  - 'SVG injection es más efectiva que HTML injection cuando tags HTML están bloqueados'
  - 'Animations SVG se ejecutan automáticamente al renderizar, diferente a event handlers HTML'
mitigation:
  - 'Bloquear no solo `<svg>` sino también `<animate>`, `<animateTransform>`, `<set>`, etc.'
  - 'Validar eventos SVG también: `onbegin`, `onend`, `onrepeat` deberían ser bloqueados'
  - 'Usar whitelist estricta que incluya atributos SVG peligrosos'
  - 'Sanitizar entrada que contenga `<svg>`, `<animate*>`, `on*=`'
  - 'Usar bibliotecas como DOMPurify que entienden complejidad de SVG vs HTML'
  - 'Implementar Content Security Policy con `script-src ''self''` para restricciones adicionales'
  - 'Considerar desabilitar SVG completamente si no es necesario'
  - 'Validar que los elementos SVG no contengan atributos de evento'
---

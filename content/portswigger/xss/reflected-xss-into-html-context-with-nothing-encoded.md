---
title: "Reflected XSS into HTML context with nothing encoded"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-html-context-with-nothing-encoded"
author: "Z4k7"
date: "2026-04-14"
year: "2026"
status: "pwned"
tags:
  - "Web_Security"
  - "BurpSuite"
techniques:
  - "Reflected XSS"
  - "Parameter Pollution"
  - "URL-based payload injection"
tools:
  - "Browser DevTools"
  - "Burp Suite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy sobre Reflected XSS en contexto HTML sin codificación. La vulnerabilidad radica en que el parámetro ?search= acepta inyección de etiquetas HTML y scripts directamente sin sanitización. La cadena de ataque: reconocimiento del punto de entrada → validación de inyección HTML básica → explotación con <script>alert()</script>. Técnicas clave: manipulación de parámetros GET, evasión de filtros inexistentes, ejecución de JavaScript en contexto del navegador.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad simple de secuencias de comandos entre sitios reflejadas en la funcionalidad de búsqueda.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que llame al `alert` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414175556153.jpg"
        caption: "Inicio del laboratorio"
      - kind: "note"
        text: |
          Validamos el funcionamiento de la interfaz de usuario donde podemos evidenciar contamos con un apartado de búsqueda al momento de ingresar datos genera una solicitud `GET` la cual adiciona un componente a la URL `web-security-academy.net/?search=`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414180043895.jpg"
        caption: "Parámetro de búsqueda GET"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Observaste que es un parámetro GET directo en la URL. En Reflected XSS, esto es CRÍTICO — significa que el servidor toma el parámetro y lo devuelve directamente en la respuesta HTML."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Podríamos tratar de validar el comportamiento e ingresar datos en el DOM para validar si contamos con modificación en la interfaz del usuario en este caso podríamos aplicar un simple `<h1>z4k7</h1>`.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414180439879.jpg"
        caption: "Prueba con tag h1"
      - kind: "note"
        text: |
          Confirmamos que es posible ingresar datos en este caso para confirmar que está aceptando cambios podríamos personalizar el style del h1 `<h1 style="color:red">z4k7</h1>`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414180710410.jpg"
        caption: "Prueba con atributo style"
      - kind: "callout"
        type: "warning"
        label: "Sin filtros aparentes"
        text: "La aplicación NO está validando ni codificando caracteres especiales. Acepta inyección HTML pura en atributos style."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Lo que hiciste fue excelente — escalaste gradualmente: primero tags HTML simples (`<h1>`), luego atributos (`style=`), luego propiedades (`color`)."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ya contamos con la confirmación podríamos aplicar enviar la solicitud mencionada en la observación del laboratorio en este caso el `alert()` enviamos el siguiente código `<script>alert(document.domain)</script>`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414180902712.jpg"
        caption: "Ejecución del alert 1"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20nothing%20encoded/file-20260414180951382.jpg"
        caption: "Ejecución del alert 2"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El navegador ejecutó el JavaScript. El `alert()` se disparó mostrando `document.domain`, que en este caso es el dominio de la aplicación vulnerable. Esta es la prueba de concepto de XSS reflejado exitosa."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El lab no requiere "acceso inicial" tradicional en el sentido de credenciales. Ya tienes acceso a la aplicación vulnerable. El XSS reflejado EN ESTE CASO requiere que la VÍCTIMA haga click en un link malicioso que tú (el atacante) construyes.
          En un ataque real, el payload se enviaría a la víctima vía email/chat/red social con la URL maliciosa: `https://web-security-academy.net/?search=<script>robar_cookies()</script>`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La diferencia crítica: Reflected (este lab) requiere que la víctima haga click en un URL maliciosa. Stored XSS (otro lab) se ejecuta automáticamente para TODAS las víctimas que visiten la página."

lessons:
  - 'No hay lugar seguro para confiar en input sin validación'
  - 'Reflected XSS requiere ingeniería social — la víctima debe hacer click'
  - 'Los navegadores confían en el servidor para ejecutar scripts'
  - '`document.domain` es información valiosa para confirmar contexto'
  - 'La escalación requiere payloads más complejos que `alert()`'
mitigation:
  - 'HTML entity encoding — escapar caracteres especiales en servidor'
  - 'Input validation — whitelist de caracteres permitidos'
  - 'Content Security Policy (CSP) — restricción de ejecución de scripts'
  - 'HTTPOnly cookies — previene acceso via JavaScript'
  - 'Output encoding según contexto — HTML, atributo, JavaScript, CSS'
---

---
title: "Reflected XSS into HTML context with all tags blocked except custom ones"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-html-context-with-all-tags-blocked-except-custom-ones"
author: "Z4k7"
date: "2026-04-16"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
techniques:
  - "Custom Tag Injection"
  - "onfocus Event"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde todas las etiquetas HTML estándar están bloqueadas, excepto las personalizadas. La solución requiere inyectar una etiqueta personalizada con evento onfocus para ejecutar alert(document.cookie). El bypass se logra mediante una etiqueta personalizada <z4k7> que no está en la lista negra del WAF."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio bloquea todas las etiquetas HTML excepto las personalizadas.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que inyecte una etiqueta personalizada y genere alertas automáticamente. `document.cookie`.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421164338630.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez ingresamos a la web realizamos reconociendo en la misma para consultar el comportamiento
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421164446827.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un input en cual nos permite realizar o ingresar consultas en este caso el comportamiento es una vez ingresa datos se envía una solicitud `GET` la cual asigna un apartado llamado `search`
          el objetivo del laboratorio es tratar de obtener la cookie del usuario en este caso menciona que esta bloqueado todas las etiquetas HTML están bloqueadas.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421164722429.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos una solicitud personalizada para validar si es posible continuar con el proceso
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421164819460.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el código y funciona sin problema alguno `<z4k7>zakt</z4k7>`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El sistema bloquea etiquetas HTML estándar mediante un WAF, pero las etiquetas personalizadas (desconocidas) no están en la lista negra. Este es un vector común: los desarrolladores implementan whitelist/blacklist para etiquetas conocidas, pero no validan etiquetas arbitrarias. En navegadores modernos, cualquier etiqueta desconocida se renderiza como elemento DOM que puede recibir eventos."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          enviamos la siguiente carga para ejecutar la cookie
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "code"
        lang: "HTML"
        code: |
          <z4k7 id=x onfocus=alert(document.cookie) tabindex=1>#x
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421171549431.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload utiliza varios trucos: - `tabindex=1`: Permite que un elemento desconocido pueda recibir foco - `onfocus=alert(...)`: Evento que se dispara cuando el elemento obtiene foco - `#x` en la URL: Hace que el navegador automáticamente enfoque el elemento con id=x - Resultado: El alert se ejecuta automáticamente sin interacción del usuario"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima en este caso para confirmar que la víctima realizó dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la víctima.
      - kind: "code"
        lang: "HTML"
        code: |
          <z4k7 id=x onfocus=alert(document.cookie) tabindex=1>#x
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421171627773.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20HTML%20context%20with%20all%20tags%20blocked%20except%20custom%20ones/file-20260421171636659.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El Exploit Server simula un servidor atacante controlado por el atacante. En un escenario real, este servidor albergaría contenido malicioso que se envía a la víctima. El LOG confirma que la víctima accedió al payload y ejecutó el JavaScript, validando la vulnerabilidad en un entorno controlado."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final que se envía a la víctima es:
      - kind: "code"
        lang: "HTML"
        code: |
          <z4k7 id=x onfocus=alert(document.cookie) tabindex=1>#x
      - kind: "note"
        text: |
          Una vez ejecutado, el navegador:
          1. Renderiza la etiqueta personalizada `<z4k7>`
          2. Interpreta el fragmento URL `#x`
          3. Auto-enfoca el elemento con `id=x`
          4. Dispara el evento `onfocus`
          5. Ejecuta `alert(document.cookie)`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El uso de fragmentos URL (#x) es crucial aquí. Sin él, el onfocus nunca se dispararía a menos que el usuario interactúe. Con el fragmento, el navegador automáticamente enfoca el elemento, resultando en ejecución sin interacción del usuario."

lessons:
  - 'Las etiquetas HTML personalizadas/desconocidas no son bloqueadas por WAF que usa listas negras de etiquetas conocidas'
  - 'El atributo `tabindex` permite enfocar elementos normalmente no enfocables'
  - 'El fragmento URL (`#id`) puede ser explotado para auto-enfocar elementos y disparar `onfocus`'
  - 'Una validación correcta debe usar whitelist de etiquetas permitidas, no blacklist'
  - 'Los eventos `onfocus` se disparan automáticamente cuando se combina `tabindex` + fragmento URL matching'
  - 'El Exploit Server es herramienta efectiva para simular ataques en víctimas reales en labs controlados'
mitigation:
  - 'Implementar validación basada en whitelist de etiquetas permitidas, no blacklist de etiquetas bloqueadas'
  - 'Sanitizar todos los atributos de eventos (on*) independientemente de la etiqueta'
  - 'Usar bibliotecas de sanitización como DOMPurify que validan etiquetas desconocidas'
  - 'Implementar Content Security Policy (CSP) con `script-src ''self''` para bloquear inline scripts'
  - 'Validar y sanitizar entrada en servidor antes de renderizar en cliente'
  - 'Implementar protecciones adicionales contra auto-enfoque de elementos mediante fragmentos URL'
---

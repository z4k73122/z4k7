---
title: "Explotación de delimitadores de ruta para el engaño de la caché web"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "0ac700720494048980195d95009f00a4"
slug: "explotacion-de-delimitadores-de-ruta-para-el-engano-de-la-cache-web"
author: "Z4k7"
date: "2026-04-01"
year: "2026"
status: "pwned"
tags:
  - "WebCache"
  - "CacheDeception"
  - "PathDelimiters"
  - "BurpSuite"
  - "WebSecurity"
techniques:
  - "Web Cache Deception"
tools:
  - "Burp Suite"
flags_list:
  - label: "API Key"
    value: "3G1dpWg6oe4cbi97Cffwmp64WCgeT9pW"
summary: "Lab de PortSwigger BurpSuite Academy categoría media. Explotación de Web Cache Deception utilizando delimitadores de ruta para explotar discrepancias entre caché y servidor. Objetivo: obtener la API Key del usuario carlos explotando caracteres delimitadores (;, ?, #) que la caché y el servidor interpretan diferente. Técnica más avanzada que la basada solo en extensiones.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Para resolver el laboratorio, encuentra la clave API del usuario `carlos`. Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`.
          Se proporcionan caracteres delimitadores comunes para ayudar a resolver el laboratorio:
      - kind: "table"
        headers:
          - "Carácter"
          - "Codificación"
          - "Carácter"
          - "Codificación"
        rows:
          - ["!", "%21", "'", "%22"]
          - ["#", "%23", "$", "%24"]
          - ["%", "%25", "&", "%26"]
          - ["'", "%27", "(", "%28"]
          - [")", "%29", "*", "%2A"]
          - ["+", "%2B", ",", "%2C"]
          - ["-", "%2D", ".", "%2E"]
          - ["/", "%2F", ":", "%3A"]
          - [";", "%3B", "<", "%3C"]
          - ["=", "%3D", ">", "%3E"]
          - ["?", "%3F", "@", "00"]
          - ["[", "%5B", "\", "%5C"]
          - ["]", "%5D", "^", "%5E"]
          - ["_", "%5F", "`", "%60"]
          - ["{", "%7B", "\", "%7C"]
          - ["}", "%7D", "~", "%7E"]
      - kind: "callout"
        type: "info"
        label: "Conocimientos requeridos"
        text: "Para resolver este laboratorio, necesitarás saber: - Cómo identificar discrepancias en la forma en que la caché y el servidor de origen interpretan los caracteres como delimitadores - Cómo se pueden utilizar las discrepancias en los delimitadores para explotar una regla de caché de directorio estática"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Los delimitadores son el siguiente nivel de Web Cache Deception. Mientras que el lab anterior usaba extensiones (`.css`), este usa caracteres especiales que los servidores interpretan diferente. El punto y coma (`;`) es particularmente explotable porque se usa en PHP para session delimiters, y muchos servidores lo ignoran en URLs."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331183414938.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331183439042.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado contamos con una API KEY:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331183454327.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado del laboratorio el objetivo es tratar de obtener la API Key del usuario carlos.
          Para poder aplicar la técnica de web cache deception es necesario contar con alguna de las siguiente cabeceras:
      - kind: "code"
        lang: "BASH"
        code: |
          X-Cache
          X-Cache: hit
          X-Cache: miss
          X-Cache: dynamic
          X-Cache: refresh
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Las cabeceras X-Cache indican caching activo. En este lab, la técnica es diferente: en lugar de buscar extensiones (.css), buscas delimitadores que el servidor ignora pero la caché respeta. El cambio de miss → hit con un delimitador confirma que puedes explotar la discrepancia."

  - id: "recon"
    num: "03"
    title: "Fase 1 — Detectar discrepancia de delimitadores"
    content:
      - kind: "note"
        text: |
          Al validar el Request por parte de BurpSuite contamos con la siguiente URL: `0ac700720494048980195d95009f00a4.web-security-academy.net/my-account`
          Validamos si es posible aplicar una consulta con un directorio arbitrario para extraer el cache del usuario — el servidor nos responde con un status de 404 ya que dicho directorio no existe o no está reconociendo la url. Es en este caso cuando iniciamos el proceso de validación por medio de delimitadores.
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331183919036.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Por medio del apartado de BurpSuite enviamos la solicitud de la siguiente manera — como primera instancia vamos a consultar el delimitador que la web permite.
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331184033560.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Pasamos la lista para validar la respuesta por parte del servidor — la configuración se realiza en el apartado de Payload. En configuración aplicamos la lista ya mencionada en el objetivo:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331184223288.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez realizado este proceso debemos configurar en la parte de payload encoding — debemos retirar la opción de URL-encode para tratar de enviar la solicitud lo más limpia posible:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331184634334.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Terminada la configuración aplicamos el attack:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331184910102.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con dos delimitadores que nos permite avanzar en el proceso.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El Burp Intruder con la lista de delimitadores te permite identificar rápidamente cuál(es) funcionan. Los que devuelven respuesta 200 (en lugar de 404) son explotables. El paso 'retirar URL-encode' es crítico — si los delimitadores se codifican, el servidor nunca los verá sin codificar."

  - id: "exploit"
    num: "04"
    title: "Fase 2 — Explotar delimitador identificado"
    content:
      - kind: "note"
        text: |
          Si aplicamos la siguiente URL `/my-account;abc.css`:
      - kind: "bullet"
        text: "El servidor responde con la cabecera X-Cache: miss"
      - kind: "bullet"
        text: "Esto significa que el recurso no estaba en caché y el servidor tuvo que traerlo desde el origen"
      - kind: "bullet"
        text: "En este punto, el sistema confirma que la caché se está inicializando"
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331185156108.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de enviar el mismo directorio:
      - kind: "bullet"
        text: "Si el recurso ya fue almacenado en caché, la cabecera debería cambiar a X-Cache: hit"
      - kind: "bullet"
        text: "Esto confirma que el servidor sirvió el recurso directamente desde la caché, sin necesidad de ir al origen"
      - kind: "bullet"
        text: "El cambio de miss → hit es la validación de que la caché está funcionando correctamente"
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331185253191.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el envío de `/my-account?abc.css` — si contamos con una respuesta por parte del servidor pero no con la cabecera necesaria para aplicar web cache deception:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331185534171.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso continuamos con el delimitador `;`.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El punto y coma (`;`) funcionó porque el servidor lo interpreta como ignorable (parámetro de sesión), pero la caché lo respeta como parte de la ruta. El interrogante (`?`) no funcionó porque ambos (servidor y caché) lo interpretan como query string. Esta diferencia de parsing es exactamente lo que buscas."

  - id: "step5"
    num: "05"
    title: "Fase 3 — Inyectar payload para capturar caché de víctima"
    content:
      - kind: "note"
        text: |
          Para poder obtener el caché de la víctima podemos aplicar el siguiente código:
      - kind: "code"
        lang: "JS"
        code: |
          <script>document.location='https://0ac1000304d1eb848095127700a600a8.web-security-academy.net/my-account/validacion.css'</script>
      - kind: "note"
        text: |
          El anterior código se enviará a la víctima lo que permite es recargar la web en la URL modificada y poder obtener el caché del usuario. Para confirmar que realmente la víctima accedió a la URL validamos por medio de los LOG del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331190106791.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicación del código y validación de los logs antes del envío a la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331190202852.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al momento de enviar la URL se confirma por medio de log el acceso de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331191254246.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Recuerda que solo contamos con 30s para recargar la web y obtener el caché de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331191448807.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Lo anterior es la confirmación de la obtención del caché del usuario víctima — en este caso ya contamos con la Key solicitada.
          Se envía la Key y validamos la respuesta del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331191609910.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20delimitadores%20de%20ruta%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331191631105.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Obtuviste la API Key correcta explotando el delimitador `;`. Lo que demostraste: (1) identificar delimitadores explotables via Burp Intruder, (2) confirmar miss → hit con el delimitador específico, (3) inyectar payload que fuerza caching bajo ruta con delimitador, (4) recuperar contenido cacheado dentro del window de 30 segundos. Este es el flujo avanzado de Web Cache Deception."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "API Key"
        value: "3G1dpWg6oe4cbi97Cffwmp64WCgeT9pW"

lessons:
  - 'Los delimitadores de ruta son vectores de Web Cache Deception más sofisticados que las extensiones estáticas'
  - 'El punto y coma (`;`) es particularmente explotable porque se usa en PHP para session handling'
  - 'El paso de "retirar URL-encode" en Burp Intruder es crítico — los delimitadores deben llegar sin codificar'
  - 'El cambio de miss → hit confirma que el delimitador es explotable'
  - 'La ventana de tiempo (30 segundos en este lab) es crítica — debes actuar rápido después de que la víctima cachee'
mitigation:
  - 'Configurar la caché para normalizar delimitadores ANTES de cachear — `/my-account;xyz` debe ser igual a `/my-account`'
  - 'Validar que delimitadores coincidan entre caché y servidor — no permitir interpretaciones diferentes'
  - 'Usar cabeceras `Cache-Control: private` en rutas dinámicas para evitar caching público'
  - 'Implementar validación de caché más estricta — rechazar URLs con delimitadores en rutas sensibles'
  - 'Normalizar rutas en el servidor — remover delimitadores antes de procesar requests'
  - 'Monitorear logs para detectar patrones de caching con delimitadores anómalos'
---

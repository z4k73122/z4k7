---
title: "Explotación de la normalización del servidor de origen para el engaño de la caché web"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "0a49009703e072eb80ce0352009500c8"
slug: "explotacion-de-la-normalizacion-del-servidor-de-origen-para-el-engano-de-la-cache-web"
author: "Z4k7"
date: "2026-04-01"
year: "2026"
status: "pwned"
tags:
  - "Web_Cache_Deception"
  - "BurpSuite_Academy"
  - "Explotaci"
techniques:
  - "[[Web Cache Deception]]"
  - "Normalización de delimitadores"
  - "Cache poisoning"
tools:
  - "[[Burp Suite]]"
  - "Intruder"
  - "Repeater)"
flags_list:
  - label: "API Key"
    value: "G2qpwjQ039AYT7ZpW90sU6pQOf03Zp8O"
summary: "Lab de BurpSuite Academy (Fácil). Objetivo: obtener API Key del usuario carlos mediante Web Cache Deception explotando discrepancias en normalización de delimitadores entre servidor de origen y caché. Técnica: fuzzing de delimitadores con Intruder, construcción de payload que engaña caché, redirección de víctima con JavaScript, captura en ventana de 30 segundos.  ---"
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
          - ["?", "%3F", "@", "%40"]
          - ["[", "%5B", "\\", "%5C"]
          - ["]", "%5D", "^", "%5E"]
          - ["_", "%5F", "`", "%60"]
          - ["{", "%7B", "\\", "%7C"]
          - ["}", "%7D", "~", "%7E"]
      - kind: "callout"
        type: "info"
        label: "Conocimientos requeridos"
        text: "Para resolver este laboratorio, necesitarás saber: - Cómo identificar si la caché y el servidor de origen normalizan la ruta de la URL. - Cómo identificar las reglas de caché de directorios estáticos. - Cómo explotar la normalización por parte del servidor de origen."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401150450124.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401150515543.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado contamos con una API KEY:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401150528250.jpg"
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
        text: "La cabecera `X-Cache: hit` es TU INDICADOR DE ÉXITO — significa que el caché sirvió la respuesta. `X-Cache: miss` = no cacheado todavía. Tu objetivo es obtener `hit` en una ruta que devuelva datos sensibles de OTRO usuario. Siempre busca estas cabeceras en RESPONSE headers de Burp (no en request headers). Esto es crítico para confirmar que estás explotando realmente el caché."

  - id: "recon"
    num: "03"
    title: "Fase 1 — Detectar discrepancia de delimitadores"
    content:
      - kind: "note"
        text: |
          Al validar el Request por parte de BurpSuite contamos con la siguiente URL:
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account HTTP/2
          Host: 0a49009703e072eb80ce0352009500c8.web-security-academy.net
      - kind: "note"
        text: |
          Si consultamos los directorios de la web podremos validar que la subcarpeta `/resources/` existe.
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401151739804.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podremos tratar de enviar un archivo para obtener el caché del servidor en este caso envío la validación del siguiente directorio `/resources/a`
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401152028968.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al validar confirmo que contamos con respuesta por parte del servidor enviado una cabecera `X-Cache: miss` tenemos que tener presente que estamos recibiendo por parte del servidor un status 404 puede que nos salte la cabecera del almacenamiento del cache por parte del servidor por medio de la cabecera `X-Cache: hit`
          Consultando la información podrecemos retroceder un directorio para tratar de acceder en el apartado de `my-account`
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401152953982.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos si es posible aplicar el archivo `datos.css` para capturar el cache de la victima.
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401153208048.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Aquí buscas el 'fuzz endpoint' — una ruta que retorna 404 pero SE CACHEA. Si la ruta es `/resources/` + delimitador + ruta_real, el caché la ve como `/resources/DELIMITADOR`, pero el servidor la normaliza a `/resources/` (ignora la parte después) + devuelve respuesta real. ESA ES LA DISCREPANCIA que explotas."

  - id: "step4"
    num: "04"
    title: "Fase 2 — Fuzzing de delimitadores con BurpSuite Intruder"
    content:
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
      - kind: "callout"
        type: "warning"
        label: "Payload Encoding — REGLA DE ORO"
        text: "NUNCA dejes 'URL-encode' activo en Intruder cuando fuzzes delimitadores. Si encodes `?` → `%3F`, NUNCA funcionará. En Payload → Encoding, desactiva TODO. Esto es error crítico que muchos cometen."
      - kind: "note"
        text: |
          Terminada la configuración aplicamos el attack:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401153623344.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma en este caso el delimitador seria el `?` tratamos de validar el proceso realizando una prueba por medio de Repeater.
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154014192.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154029207.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Una vez identificas el delimitador (`?`), construyes URL que: (1) caché interprete como estático (termina en `datos.css`), (2) servidor interprete como `/my-account` (ignora `?datos.css`). Resultado: `/resources/..%2fmy-account?datos.css` — caché lo cachea como estático, servidor ignora el `?` y devuelve tu página personal."
      - kind: "note"
        text: |
          Una vez confirmado si si contamos con respuesta por parte del servidor ya nos queda enviar el payload.

  - id: "step5"
    num: "05"
    title: "Fase 3 — Construir y enviar payload a la víctima"
    content:
      - kind: "note"
        text: |
          Para poder obtener el caché de la víctima podemos aplicar el siguiente código:
      - kind: "code"
        lang: "SQL"
        code: |
          <script>document.location="https://0a49009703e072eb80ce0352009500c8.web-security-academy.net//resources/..%2fmy-account?datos.css"</script>
      - kind: "note"
        text: |
          El anterior código se enviará a la víctima lo que permite es recargar la web en la URL modificada y poder obtener el caché del usuario. Para confirmar que realmente la víctima accedió a la URL validamos por medio de los LOG del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154435913.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicación del código y validación de los logs antes del envío a la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154505807.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al momento de enviar la URL se confirma por medio de log el acceso de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154557112.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Recuerda que solo contamos con 30s para recargar la web y obtener el caché de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154629825.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "danger"
        label: "VENTANA DE TIEMPO CRÍTICA — 30 SEGUNDOS"
        text: "Tienes EXACTAMENTE 30 segundos después de enviar el enlace a la víctima para hacer la solicitud. Víctima accede → recibe respuesta → caché la guarda. Pasados 30s, expiró. En combate real, automatiza: script Python que envía enlace + espera 2s + loopea requests a la URL hasta obtener `X-Cache: hit`."
      - kind: "note"
        text: |
          Lo anterior es la confirmación de la obtención del caché del usuario víctima — en este caso ya contamos con la Key solicitada.
          Se envía la Key y validamos la respuesta del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154658793.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20origen%20para%20el%20engaño%20de%20la%20caché%20web/file-20260401154721567.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "API Key"
        value: "G2qpwjQ039AYT7ZpW90sU6pQOf03Zp8O"

lessons:
  - 'Los servidores de origen y cachés normalizan URLs diferente — raíz de WCD'
  - 'Delimitadores (`?`, `;`, `/`) crean "cortes" distintos según la lógica de cada sistema'
  - 'Fuzzing de delimitadores debe ser sistemático — no adivines, prueba todos'
  - '`X-Cache: hit` es tu indicador de éxito — confirma que explotaste el caché'
  - 'Payload encoding en Intruder es crítico — error común que mata la explotación'
  - 'Timing brutal — 30 segundos es ventana realista, necesitas automatización'
  - 'Log analysis es oro — verifica SIEMPRE si la víctima realmente accedió'
mitigation:
  - 'Servidor: normalizar URLs IDÉNTICAMENTE al caché usando RFC 3986'
  - 'Caché: rechazar URLs con query params en recursos estáticos (`.css?`, `.js?`, `.png?`)'
  - 'Caché: whitelist estricta — solo cachear `/static/`, `/assets/`, `/public/`'
  - 'Headers: `Cache-Control: no-cache, no-store` en rutas sensibles (`/my-account`, `/admin`)'
  - 'Testing: audita explícitamente delimitadores en TODAS las aplicaciones'
  - 'WAF/IDS: detectar `/resources/..%2f` + estáticos con `?` + múltiples requests rápidas'
---

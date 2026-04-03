---
title: "Explotación de la normalización del servidor de caché para el engaño de la caché web"
platform: "PortSwigger"
os: "Linux"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "explotacion-de-la-normalizacion-del-servidor-de-cache-para-el-engano-de-la-cache-web"
author: "Z4k7"
date: "2026-04-03"
year: "2026"
status: "pwned"
tags:
  - "vulnerabilidad"
  - "web"
techniques:
  - "Web Cache Deception"
  - "Path Traversal"
  - "Delimiter Manipulation"
tools:
  - "BurpSuite"
  - "Curl"
flags_list:
  - label: "API Key"
    value: "K9wSicjNeRsqLWImSFA8xCluG0vsBGXf"
summary: "Explotación de discrepancias entre cómo el CDN y el servidor de origen interpretan URLs. Objetivo: obtener la API Key del usuario carlos combinando path traversal y manipulación de delimitadores para hacer que el cache devuelva contenido dinámico cacheado como estático.  ---"
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
        text: "Para resolver este laboratorio, necesitarás saber: - Cómo identificar si la caché y el servidor de origen normalizan la ruta de la URL. - Cómo identificar las reglas de caché de directorios estáticos. - Cómo identificar discrepancias en la forma en que la caché y el servidor de origen interpretan los caracteres como delimitadores. - Cómo aprovechar la normalización del servidor de caché."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402225419288.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402225510357.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado contamos con una API KEY:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402225445021.jpg"
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
        text: "La cabecera X-Cache es crítica porque confirma que el CDN cachea ese recurso. Sin ella, no hay explotación posible. Buscas archivos/rutas que devuelvan esta cabecera porque son los candidatos a cache poisoning. El `miss` significa 'no está en caché todavía, pero puedo cachearlo' — es exactamente lo que necesitas."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Como primera instancia debemos validar si el directorio principal puede capturar cabecera `X-Cache` en este caso enviamos por medio de repeater la siguiente solicitud.
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account/wcd.js HTTP/2
      - kind: "note"
        text: |
          Si enviamos dicha solicitud no contamos con una respuesta satisfactoria por parte del servidor tendremos como respuesta un `status 404`
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402225920643.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso para eludir dicho status podríamos aplicar la validación de los delimitadores para consultar cual delimitador reconoce la web
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
          Terminada la configuración aplicamos el attack
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402230419554.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En la anterior imagen podemos evidenciar los limitadores que la web permite en este caso `#` , `?`
          Con los anteriores limitadores intentamos enviar una solicitud para tratar de obtener la cabecera `X-Cache`
          con el delimitador `?` nos permite recibir un status 200 confirmando que si podemos realizar el proceso
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account?wcd.js HTTP/2
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402230711847.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando entre las cabeceras dicha solicitud no permite recibir por medio del servidor el `X-Cache`
          Dado el caso que dicho directorio no cuenta con la cabecera requerida seria validar en el historilla de burpsuite si contamos con mas directorios que nos permite extraer dicha información
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402230953884.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En anterior directorio si nos permite recuperar una delas cabeceras solicitadas en este caso `X-Cache: miss`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Aquí descubriste algo crítico: `/resources/` devuelve X-Cache pero `/my-account/` no. ¿Por qué? Porque `/resources/` contiene archivos estáticos (CSS, JS) que el CDN cachea. Pero `/my-account/` es dinámico (personalizado por usuario). El ataque funciona combinando ambos: quieres cachear contenido de `/my-account/` (dinámico) pero con una clave que apunte a `/resources/` (que SÍ se cachea). La discrepancia entre cómo el CDN y el servidor interpretan la URL permite esto."
      - kind: "note"
        text: |
          Podríamos aplicar en este caso el directorio `/resources/` a la solicitud mencionada con el delimitador `/my-account?wcd.js` con dicho directorio podríamos aplicar un [[Path Traversal]] para ingresar en el directorio raíz.
          Consultamos si permite con la siguiente solicitud
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account?/resources/../wcd.js
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402231856869.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos esta solicitud no tendremos una respuesta correcta por parte del servidor tendremos un `status 404` esto sucede ya que dicho directorio no existe o no esta realizando correctamente el path traversal.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esto falló porque el `?` está en la posición equivocada. El servidor ve: PATH = `/my-account`, QUERY = `/resources/../wcd.js`. El path traversal está después del delimitador, así que el servidor lo ignora. El servidor no procesa `../` en parámetros de query string, solo en rutas (PATH)."
      - kind: "note"
        text: |
          Con lo anterior no tendremos respuesta por parte del servidor si tratamos de enviar el apartado de `resources` como un directorio y luego tratamos de aplicar path traversal
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account?/../resources?wdc.js HTTP/2
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402233214220.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Con lo anterior contamos con un `status 200` pero no contamos con la cabecera requerida en este caso si enviamos con el delimitador de `#` si tendremos la respuesta de la cabecera
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402233333858.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "¡AQUÍ ES DONDE FUNCIONA! Con `/my-account?/../resources?wdc.js`: - CDN lo ve: PATH = `/my-account`, ignora todo después del primer `?` → Cachea como `/my-account` - Servidor lo ve: Procesa `/my-account?/../` como path traversal (el `?` NO detiene el parsing del path en el servidor), resulta en `/resources/wdc.js`  El resultado: La URL se cachea bajo la clave `/my-account` pero devuelve contenido de `/resources/`. Y como `/resources/` devuelve X-Cache, ahora tienes tu vector de ataque. El hash `#` funciona aún mejor porque es cliente-side — el navegador nunca lo envía al servidor, pero el CDN sí lo ve."
      - kind: "note"
        text: |
          Para poder obtener el caché de la víctima podemos aplicar el siguiente código:
      - kind: "code"
        lang: "SQL"
        code: |
          <script>document.location="https://0abc00ab033cfa888190572d00de00cd.web-security-academy.net/my-account%23%2f%2e%2e%2fresources?wdc.js"</script>
      - kind: "note"
        text: |
          El anterior código se enviará a la víctima lo que permite es recargar la web en la URL modificada y poder obtener el caché del usuario. Para confirmar que realmente la víctima accedió a la URL validamos por medio de los LOG del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402233538865.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicación del código y validación de los logs antes del envío a la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402233557106.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al momento de enviar la URL se confirma por medio de log el acceso de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402233624692.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Recuerda que solo contamos con 30s para recargar la web y obtener el caché de la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402234816371.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Lo anterior es la confirmación de la obtención del caché del usuario víctima — en este caso ya contamos con la Key solicitada.
          Se envía la Key y validamos la respuesta del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402234835881.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20la%20normalización%20del%20servidor%20de%20caché%20para%20el%20engaño%20de%20la%20caché%20web/file-20260402234851563.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "API Key"
        value: "K9wSicjNeRsqLWImSFA8xCluG0vsBGXf"

lessons:
  - 'El CDN y el servidor interpretan URLs diferente — esto es explotable'
  - 'Los delimitadores (`?`, `#`) tienen significados distintos en contextos distintos'
  - 'El hash (`#`) es especialmente peligroso — cliente-side, el CDN lo ve pero el servidor no'
  - 'La combinación de path traversal + delimitadores crea discrepancias aprovechables'
  - 'La cabecera X-Cache indica qué recursos pueden ser cacheados'
  - 'El timing es crítico — tienes ~30s antes de que expire el caché'
mitigation:
  - 'Normalizar URLs en el CDN para que coincidan exactamente con el servidor'
  - 'No cachear contenido dinámico personalizado (usar Cache-Control: no-cache para `/my-account/`)'
  - 'Rechazar URLs con delimitadores anómalos o múltiples'
  - 'Implementar cache keys complejas (Vary headers)'
  - 'Usar Content Security Policy (CSP) para limitar ejecución de scripts'
  - 'Monitoreo: alertas cuando el mismo path se solicita desde múltiples IPs en poco tiempo'
---

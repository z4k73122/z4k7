---
title: "Explotación del mapeo de rutas para el engaño de la caché web"
platform: "PortSwigger"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "explotacion-del-mapeo-de-rutas-para-el-engano-de-la-cache-web"
author: "Z4k7"
date: "2026-03-31"
year: "2026"
status: "pwned"
tags:
  - "WebCache"
  - "CacheDeception"
  - "PathMapping"
  - "BurpSuite"
  - "WebSecurity"
techniques:
  - "Web Cache Deception"
tools:
  - "BurpSuite"
flags_list:
  - label: "API Key"
    value: "B7NvcMaH8v7odWBidcyLv2BpHSTIjAbW"
summary: "Lab de PortSwigger BurpSuite Academy categoría fácil. Explotación de discrepancias en el mapeo de rutas entre la caché web y el servidor de origen. Objetivo: obtener la API Key del usuario carlos mediante Web Cache Deception. La técnica aprovecha que la caché interpreta rutas URL diferente al servidor, permitiendo que contenido de un usuario se cachee bajo una ruta accesible a otros usuarios.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Para resolver el laboratorio, encuentra la clave API del usuario `carlos`. Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`.
      - kind: "callout"
        type: "info"
        label: "Conocimientos requeridos"
        text: "Para resolver este laboratorio, necesitarás saber: - Cómo los puntos finales de expresiones regulares asignan rutas URL a recursos - Cómo detectar y explotar las discrepancias en la forma en que la caché y el servidor de origen asignan las rutas URL"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Web Cache Deception es una vulnerabilidad crítica pero desapercibida porque no requiere explotación de código — solo manipulación de rutas. Muchos desarrolladores no entienden que una caché puede interpretar `/my-account/carlos.css` como 'archivo CSS' mientras el servidor lo interpreta como 'página dinámica de my-account'. Esta discrepancia de parsing es la base del ataque."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331132934298.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331133052751.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado contamos con una API KEY:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331133154370.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado del laboratorio el objetivo es tratar de aplicar el obtener el APY Key del usuario carlos.
          Para poder aplicar la técnica de web cache deception es necesario contar con alguna de las siguiente cabeceras:
      - kind: "code"
        lang: "BASH"
        code: |
          X-Cache
          X-Cache: hit
          X-Cache: miss
          X-Cache: dynamic
          X-Cache: refresh
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331133527994.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En la anterior imagen podemos validar que no contamos con ninguna de dichas cabeceras en este caso inicia el proceso de web cache deception.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La presencia de cabeceras `X-Cache` es el indicador inicial de que hay una caché en juego. Si ves `X-Cache: miss`, significa que el servidor acaba de procesar la solicitud. Si ves `X-Cache: hit` en la siguiente solicitud con la misma URL, significa que la caché está funcionando. Este patrón es lo que buscas para aplicar Web Cache Deception."

  - id: "recon"
    num: "03"
    title: "Fase 1 — Detectar caching"
    content:
      - kind: "note"
        text: |
          Request `/vali.css`:
      - kind: "bullet"
        text: "El servidor responde con la cabecera X-Cache: miss"
      - kind: "bullet"
        text: "Esto significa que el recurso no estaba en caché y el servidor tuvo que traerlo desde el origen"
      - kind: "bullet"
        text: "En este punto, el sistema confirma que la caché se está inicializando"
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331144831629.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Si el recurso ya fue almacenado en caché, la cabecera debería cambiar a X-Cache: hit"
      - kind: "bullet"
        text: "Esto confirma que el servidor sirvió el recurso directamente desde la caché, sin necesidad de ir al origen"
      - kind: "bullet"
        text: "El cambio de miss → hit es la validación de que la caché está funcionando correctamente"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El cambio de miss a hit es crucial — confirma que: (1) la caché está activa, (2) las rutas se cachean, (3) puedes ahora explotar la discrepancia de parsing. Si sigue siendo `miss`, la caché no está cacheando ese tipo de recurso — prueba con extensiones diferentes (.jpg, .png, .js) hasta encontrar una que cachee."

  - id: "step4"
    num: "04"
    title: "Fase 2 — Inyectar payload"
    content:
      - kind: "note"
        text: |
          Para poder aplicar la inyección de la solicitud enviamos el siguiente código:
      - kind: "code"
        lang: "JS"
        code: |
          <script>document.location='https://0ac1000304d1eb848095127700a600a8.web-security-academy.net/my-account/validacion.css'</script>
      - kind: "note"
        text: |
          Lo que nos permite este código es recargar la web en el apartado de la URL mencionada podemos aplicar dicho código y validar el estado en el apartado de los logs del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331141208218.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos el código a la víctima y confirmamos el estado de los logs para validar si se recargó la web del usuario:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331145208406.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El script redirige al usuario a `/my-account/validacion.css` — la caché interpreta esto como 'archivo CSS' y lo cachea. El servidor interpreta `/my-account/validacion.css` como 'mi página de cuenta con contenido dinámico'. Esta discrepancia es EXACTAMENTE el punto de explotación. Cuando la víctima carga esa URL, su contenido personal (incluyendo API Key) se cachea bajo una ruta que parece estática (.css)."

  - id: "step5"
    num: "05"
    title: "Fase 3 — Recuperar contenido cacheado"
    content:
      - kind: "note"
        text: |
          Una vez ya se valide que la víctima tomó el archivo cacheado, validamos nuestra URL en el mismo directorio para que el servidor nos envíe el caché de la víctima y tratar de obtener el API Key:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331145440173.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos ya contamos con la KEY enviamos la solicitud al servidor para confirmar el laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331145648848.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validado:
      - kind: "image"
        src: "assets/images/Explotación%20del%20mapeo%20de%20rutas%20para%20el%20engaño%20de%20la%20caché%20web/file-20260331145710555.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Obtuviste la API Key correcta y completaste el lab. Lo que demostraste: (1) identificar caching activo, (2) detectar la discrepancia entre cómo la caché y el servidor interpretan rutas, (3) inyectar un payload que fuerza a la víctima a cachear su contenido personal bajo una ruta estática, (4) recuperar ese contenido desde la caché pública. Este es el flujo clásico de Web Cache Deception."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "API Key"
        value: "B7NvcMaH8v7odWBidcyLv2BpHSTIjAbW"

lessons:
  - 'Web Cache Deception explota discrepancias entre cómo la caché y el servidor asignan rutas URL'
  - 'Las cabeceras `X-Cache` son indicadores clave para detectar si hay caching activo'
  - 'La inyección de payloads que redireccionan a URLs con extensiones estáticas (.css, .js) es efectiva'
  - 'Una vez cacheado, el contenido es accesible públicamente sin autenticación'
  - 'La técnica funciona porque la caché no diferencia entre contenido estático y dinámico basado en rutas'
mitigation:
  - 'Configurar la caché para que NO cachee rutas que contienen parámetros de sesión o autenticación'
  - 'Implementar validación estricta de rutas — no permitir `/my-account/archivo.css` si `/my-account/` es una ruta dinámica'
  - 'Usar cabeceras `Cache-Control: private` en respuestas que contienen datos sensibles'
  - 'Implementar tokens CSRF y session binding para evitar que contenido cacheado sea útil sin autenticación'
  - 'Normalizar rutas antes de enviarlas a la caché — `/my-account/carlos.css` debe ser tratado igual que `/my-account/`'
  - 'Monitorear logs de caché para detectar patrones anómalos (muchas solicitudes a `.css` en rutas dinámicas)'
---

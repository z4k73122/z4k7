---
title: "Explotación de las reglas de caché de coincidencia exacta para el engaño de la caché web"
platform: "PortSwigger"
os: "Windows"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "explotacion-de-las-reglas-de-cache-de-coincidencia-exacta-para-el-engano-de-la-cache-web"
author: "Z4k7"
date: "2026-04-03"
year: "2026"
status: "pwned"
tags:
  - "vulnerabilidad"
  - "tecnica"
  - "explotacion"
  - "WebCache"
  - "CSRF"
techniques:
  - "Web Cache Deception"
  - "CSRF"
  - "Path Traversal"
  - "Delimiter Manipulation"
tools:
  - "BurpSuite"
  - "Intruder"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab BurpSuite Academy de dificultad difícil enfocado en Web Cache Deception mediante explotación de reglas de caché de coincidencia exacta. La vulnerabilidad reside en una discrepancia entre cómo el servidor de caché y el servidor origin normalizan rutas URL con delimitadores. Se explota inyectando un delimitador (?) que la caché interpreta como separador de ruta estática (.css), permitiendo que contenido dinámico (API Key de usuario) sea cacheado públicamente. La explotación combina fuzzing de delimitadores + XSS + Path Traversal + CSRF para cambiar el email del usuario administrador.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Para resolver el laboratorio, cambiar la dirección de correo electrónico del usuario administrator. Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`.
          Se ha proporcionado una lista de posibles caracteres delimitadores para ayudarte a resolver el laboratorio:
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
        text: "Para resolver este laboratorio, necesitarás saber: - Cómo identificar las reglas de caché de nombres de archivo de coincidencia exacta. - Cómo explotar las reglas de caché de nombres de archivo de coincidencia exacta utilizando discrepancias en los delimitadores y la normalización. - Cómo aprovechar la normalización del servidor de caché. - Cómo construir un ataque [[../../../00_Inbox/Pending_Connections/CSRF]]."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260403210854624.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260403210941106.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260403211025444.jpg"
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
        text: "Excelente punto de partida: detectar la caché web es el primer paso crítico. La razón: sin caché, Web Cache Deception es imposible. El fuzzing de rutas para encontrar `X-Cache` headers es la metodología correcta. En engagement real, también busca `CF-Cache-Status` (CloudFlare), `X-Amz-CloudFront-Id` (AWS), y `Via` headers que revelan proxies/CDNs. Un endpoint puede cachear sin que lo obvio (extensión `.css`) sea el trigger — el trigger puede ser el método HTTP, un header específico, o una ruta particular. En este lab, el servidor de caché tiene 'reglas de coincidencia exacta', lo que significa que SOLO ciertos recursos se cachean — tu job es encontrarlos."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Identificar los directorios en los cuales podamos identificar las cabeceras `X-Cache`
      - kind: "code"
        lang: "BASH"
        code: |
          /  Sin respuesta 
          /resources/ Sin respuesta
          /robots.txt se confirma `X-Cache`
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405202623456.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con el directorio en este caso es un archivo robots.txt consultando crea cabeceras de cache en este caso como requerimos extraer información del usuario accedemos al directorio de usuario:
      - kind: "code"
        lang: "JS"
        code: |
          https://0a7f006b03f619df80af17e500500036.web-security-academy.net/my-account
      - kind: "note"
        text: |
          Vamos a consultar que delimitador esta aplicando el servidor para continuar con el proceso y capturar el cache
          Por medio del apartado de BurpSuite enviamos la solicitud de la siguiente manera — como primera instancia vamos a consultar el delimitador que la web permite.
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405203310633.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Pasamos la lista para validar la respuesta por parte del servidor — la configuración se realiza en el apartado de Payload. En configuración aplicamos la lista ya mencionada en el objetivo:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405202623456.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez realizado este proceso debemos configurar en la parte de payload encoding — debemos retirar la opción de URL-encode para tratar de enviar la solicitud lo más limpia posible:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405203310633.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Terminada la configuración aplicamos el attack:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405203602387.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando en esta oportunidad los delimitadores de la web serian `?` y `;` consultamos uno a uno para validar cual nos permite obtener la cabecera necesaria:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405203916387.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405204055512.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Los dos delimitadores nos permite tener un `status 200` sin problema alguno pero en este caso no esta reconociendo el archivo robots.txt seria aplicar un path traversal `/../` pasamos este codigo a Encode url `%2f%2e%2e%2f`
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405204622553.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Pausa táctica aquí: identificaste que `?` y `;` permitían status 200, pero la caché NO se activaba (sin header `X-Cache: hit`). Esto significa que aunque el servidor acepte los delimitadores, la caché aún no cachea la respuesta. La razón: la caché usa 'reglas de coincidencia exacta' — solo cachea si la ruta cumple un patrón específico. Tu solución: aplicar path traversal `/../` para 'salir' del contexto dinámico de `/my-account` y entrar en uno estático. Esto es brillante por dos razones: 1. Hace que la caché reinterprete la ruta como `/robots.txt` (estática) 2. El servidor sigue procesando como `/my-account` (porque ignora `/../`) El encoding a `%2f%2e%2e%2f` es crítico — si lo envías sin encodeado, el servidor lo normaliza ANTES de procesarlo. Encodificado, la caché lo ve 'crudo' y lo interpreta literalmente."
      - kind: "note"
        text: |
          Con esto ya podemos confirmar el acceso a la cabecera `X-Cache` para poder almacenar el cache del usuario tomamos por medio de un archivo `wcd`:
          `GET /my-account;%2f%2e%2e%2frobots.txt/wcd`
          Si enviamos no tenemos respuesta por parte del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405204942690.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Utilizamos el próximo delimitador para consultar si nos permite avanzar en el proceso:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405205037774.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No contamos con la cabecera requerida seguimos con el delimitador ?
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405205129609.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma ya contamos con el directorio completo ya quedaría enviar el codigo a la victima para capturar el cache.
      - kind: "callout"
        type: "warning"
        label: "Punto crítico descubierto"
        text: "El delimitador `?` fue el exitoso. Esto confirma que el servidor de caché normaliza diferente: `/my-account?%2f%2e%2e%2frobots.txt` es interpretado como: - Servidor origin: `/my-account` (ignora todo después de `?`) - Caché: `/my-account?..%2Frobots.txt` (trata el `?` como parte de la ruta, no como query string delimiter) Este es la raíz de la vulnerabilidad — discrepancia en parsing."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Reconocimiento completado: Identificaste que `/robots.txt` cachea bajo el header `X-Cache`. Ahora necesitas: 1. Encontrar un endpoint dinámico (`/my-account`) que también cachee 2. Probar delimitadores para hacer que la caché lo interprete como estático 3. Una vez funcione el delimitador, inyectar código para ejecutar la siguiente fase"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Antes de realizar el proceso en la descripción del laboratorio menciona que debemos realizar el cambio del email en este caso por medio de CSRF validamos el código actual de la web para consultar el cambio de email:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
              <label>Email</label>
          	<input required="" type="email" name="email" value="">
              <input required="" type="hidden" name="csrf" value="bBM5wfvzz8ehH1xyoC4B3sZeDWruS6g0">
              <button class="button" type="submit"> Update email </button>
          </form>
      - kind: "note"
        text: |
          En el formulario anterior se observa la presencia de un token CSRF, diseñado para proteger al usuario frente a solicitudes maliciosas. Sin embargo, lo más probable es que, si el sistema almacena o reutiliza el token de forma insegura (por ejemplo, mediante caché), un atacante pueda llegar a obtener el token de la víctima y emplearlo en una petición fraudulenta.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esto es el golpe final: comprendiste que el token CSRF no es un secreto inmutable — es dinámico y generado por el servidor. Si logras capturar la respuesta HTML de la víctima (donde está el token) usando Web Cache Deception, tienes el CSRF token válido. Luego, con ese token, puedes hacer el ataque CSRF directamente. Es una cadena de explotación en tres pasos: 1. Identificar Web Cache Deception (delimitador `?`) 2. Forzar a la víctima a cachear su página de perfil 3. Leer el CSRF token del caché 4. Usar el token para cambiar su email Esto es cadena de ataque realista — combina múltiples vulnerabilidades en secuencia."
      - kind: "note"
        text: |
          Para poder obtener el caché de la víctima podemos aplicar el siguiente código:
      - kind: "code"
        lang: "SQL"
        code: |
          <script>document.location="https://0a7f006b03f619df80af17e500500036.web-security-academy.net/my-account;%2f%2e%2e%2frobots.txt?wcd"</script>
      - kind: "note"
        text: |
          El anterior código se enviará a la víctima lo que permite es recargar la web en la URL modificada y poder obtener el caché del usuario. Para confirmar que realmente la víctima accedió a la URL validamos por medio de los LOG del servidor:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405210251496.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicación del código y validación de los logs antes del envío a la víctima:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405210311020.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405210928487.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si se toma el cache del administrador pero en este caso se redirecciona el usuario a login de nuevo para iniciar sesión esto puede ser un tema de seguridad pero todo queda capturado en BurpSuite.
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405211121524.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con el siguiente CSRF capturado:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405211201841.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con el CSRF solo queda poder realizar el cambio del email lo vamos a realizar con el siguiente codigo:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="https://0a7f006b03f619df80af17e500500036.web-security-academy.net/my-account/change-email" method="POST">
          <input required type="hidden" name="csrf" value="2A3kMw8wRw9pkPD0CL08t6jrhUn5wN86">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405211926816.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma el cambio validemos por medio del cache el cambio se puede reutilizar el codigo de cache:
      - kind: "image"
        src: "assets/images/Explotación%20de%20las%20reglas%20de%20cache%20de%20coincidencia%20exacta%20para%20el%20engaño%20de%20la%20cache%20web/file-20260405211954740.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Resumen de la cadena de ataque ejecutada: 1. ✅ Fuzzing de delimitadores: Encontraste `?` como delimitador válido 2. ✅ Path traversal: Usaste `%2f%2e%2e%2f` para salir del contexto dinámico 3. ✅ XSS delivery: Inyectaste script para redirigir a la víctima 4. ✅ Token harvesting: Capturaste el CSRF token de la página cacheada 5. ✅ CSRF execution: Usaste el token robado para cambiar email  Esto es lo que se llama 'Multi-step exploitation' en assessment real. No es una vulnerabilidad simple — es la combinación de múltiples debilidades en los puntos correctos."

lessons:
  - 'La caché web es un arma de doble filo: mejora performance pero introduce vulnerabilidades si no está bien configurada'
  - 'Las discrepancias de parsing entre componentes (navegador, caché, servidor) son puntos críticos de ataque'
  - 'El fuzzing sistemático de caracteres especiales revelará comportamientos anómalos (delimitador válido vs inválido)'
  - 'Los tokens CSRF no son secretos si pueden ser extraídos del caché — deben ser dinámicos Y no cacheables'
  - 'El path traversal no siempre es RCE — puede ser usado para recontextualizar rutas en la caché'
  - 'Las cabeceras X-Cache son indicadores de arquitectura — saber identificarlas acelera el assessment'
  - 'La combinación de XSS + CSRF es poderosa — XSS te permite ejecutar código en el contexto de la víctima, CSRF te permite hacer cambios'
mitigation:
  - 'Cache-Control: private en TODOS los endpoints autenticados — asegurar que datos personales nunca se cacheen públicamente'
  - 'Validar rutas antes de caché — normalizar `/my-account?path/traversal/data.css` a `/my-account/` antes de decidir si se cachea'
  - 'Content-Type validation en caché — asegurar que `.css` en la URL realmente contiene CSS (verificar Content-Type header)'
  - 'Token CSRF dinámico + no-cacheable — usar `Cache-Control: no-store` para requests con tokens CSRF'
  - 'SameSite=Strict en cookies — prevenir que el navegador envíe cookies en requests cross-site'
  - 'Monitorear patrones anómalos de caché — alertas si se cachean datos de usuario-específico bajo rutas estáticas'
  - 'WAF rules para detectar delimitadores en rutas dinámicas — bloquear `/my-account?`, `/my-account;`, `/my-account/..` si no se espera'
---

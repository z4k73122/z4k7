---
title: "CSRF where token validation depends on token being present"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-where-token-validation-depends-on-token-being-present"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "CSRF Token Bypass"
  - "Omitir parámetro CSRF"
  - "Validación de Presencia"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación implementa tokens CSRF, pero la validación solo verifica si el parámetro está PRESENTE, no si es VÁLIDO. El atacante puede simplemente omitir el parámetro csrf de la solicitud, y el servidor la procesa sin validación adicional. Esto demuestra un error crítico de lógica: confundir 'existencia del token' con 'validez del token'.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a ataques CSRF.
          Para resolver el laboratorio, utiliza tu servidor de explotación para alojar una página HTML que utilice un ataque CSRF para cambiar la dirección de correo electrónico del usuario.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`
      - kind: "callout"
        type: "info"
        label: "Pista"
        text: "No puedes registrar una dirección de correo electrónico que ya esté en uso por otro usuario. Si cambias tu dirección de correo electrónico mientras pruebas tu exploit, asegúrate de usar una dirección diferente para el exploit final que le envíes a la víctima."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404144855116.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404144924245.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual en este caso podremos validar la siguiente información.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404144958581.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Acceso a URL del laboratorio exitoso"
      - kind: "bullet"
        text: "Credenciales válidas: wiener:peter"
      - kind: "bullet"
        text: "Usuario autenticado con sesión activa"
      - kind: "bullet"
        text: "Acceso a sección de cambio de email"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab es interesante — el token CSRF SÍ existe. Pero la pregunta es: ¿qué tan bien valida el servidor? ¿Verifica que el token sea correcto, o solo que esté presente? Estos dos conceptos son diferentes. El primero es seguro, el segundo es un error."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código de la web el apartado del input que permite ingresar datos para el cambio del Email.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404145112290.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El código anterior nos permite confirmar un formulario que habilita el envío de un correo electrónico para solicitar el cambio. Además, se evidencia la presencia de un token CSRF, el cual protege el formulario y evita modificaciones no autorizadas, garantizando que solo el usuario legítimo pueda realizar la acción.
          Se emula el proceso de cambio de correo electrónico asociado al usuario actual con el fin de validar si es posible realizar dicha modificación y analizar las cabeceras que se envían durante la operación.
          Al enviar una solicitud al directorio `/my-account/change-email`, se obtiene como respuesta el contenido correspondiente a la petición de cambio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404145548371.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404145619430.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/1.1
          Host: 0a0b00ec033f6417812f581800fc0015.web-security-academy.net
          Cookie: session=O5TbUy4CeqtgDxRLYGi9r8gICCGW3vgd
          Content-Length: 65
          Cache-Control: max-age=0
          Sec-Ch-Ua: "Not-A.Brand";v="24", "Chromium";v="146"
          Sec-Ch-Ua-Mobile: ?0
          Sec-Ch-Ua-Platform: "Windows"
          Accept-Language: es-419,es;q=0.9
          Origin: https://0a0b00ec033f6417812f581800fc0015.web-security-academy.net
          Content-Type: application/x-www-form-urlencoded
          Upgrade-Insecure-Requests: 1
          User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
          Sec-Fetch-Site: same-origin
          Sec-Fetch-Mode: navigate
          Sec-Fetch-User: ?1
          Sec-Fetch-Dest: document
          Referer: https://0a0b00ec033f6417812f581800fc0015.web-security-academy.net/my-account?id=wiener
          Accept-Encoding: gzip, deflate, br
          Priority: u=0, i
          Connection: keep-alive
          
          email=validacion%40gmai.com&csrf=zfeHuUX1Bjulri7skySyiqa1bt5dSroT
      - kind: "note"
        text: |
          En el código anterior se confirma la presencia de mecanismos destinados a autenticar al usuario legítimo de la solicitud. El parámetro `csrf=zfeHuUX1Bjulri7skySyiqa1bt5dSroT` es el token.
      - kind: "callout"
        type: "warning"
        label: "Validación Incompleta — Token Being Present"
        text: "El servidor VALIDA que el parámetro `csrf` esté PRESENTE en la solicitud — pero probablemente NO valida que el token sea CORRECTO. Si enviamos una solicitud SIN el parámetro csrf, el servidor podría: 1. Rechazarla (validación correcta) 2. Procesarla igual (validación incompleta — 'si no hay csrf, procesan como si fuera válido')"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un error crítico de lógica. El desarrollador pensó: 'Si el parámetro csrf está, probablemente es válido'. Pero eso es INSEGURO. La validación debe ser: 'Si csrf NO está presente → RECHAZAR | Si csrf está → VERIFICAR que sea correcto'. No hay punto medio."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Si intentamos enviar un formulario sin el parámetro `csrf`, podemos validar si es posible eludir la restricción implementada mediante CSRF:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="https://0a0b00ec033f6417812f581800fc0015.web-security-academy.net/my-account/change-email" method="POST">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "note"
        text: |
          El anterior código permite simular un formulario de cambio de correo electrónico se hace pasar por el formulario original. Nota: NO incluye el parámetro `csrf`.
          Detalles del código:
      - kind: "bullet"
        text: "Se carga la página."
      - kind: "bullet"
        text: "El formulario ya contiene un correo (hack@gmail.com)."
      - kind: "bullet"
        text: "El script ejecuta inmediatamente submit()."
      - kind: "bullet"
        text: "El navegador envía una petición POST al servidor (/my-account/change-email) con el campo email=hack@gmail.com SIN incluir csrf."
      - kind: "note"
        text: |
          Si el servidor solo verifica que el parámetro csrf ESTÉ PRESENTE (en lugar de verificar su validez), esta solicitud será procesada exitosamente:
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Omitir Parámetro"
        text: "1. Servidor espera: `email=XXX&csrf=YYY` 2. Atacante envía: `email=XXX` (sin csrf) 3. Servidor valida: '¿Está csrf en la solicitud?' → NO 4. Servidor procesa: 'No está csrf, pero procesoré igual' ❌ 5. Email cambiado exitosamente ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esto es incluso más simple que los labs anteriores. No necesitas cambiar métodos HTTP ni omitir headers. Solo... no incluyes el parámetro. Si el servidor no valida su AUSENCIA, habrás ganado. Esta es la validación más débil que hemos visto."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404145920962.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima en este caso para confirmar que la víctima realizó dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la víctima.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404145957730.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404150717067.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20token%20being%20present/file-20260404150732569.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado de los log del servidor la víctima accede a la web y se realiza la modificación del correo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El log del servidor confirma: la víctima visitó el exploit, la solicitud POST sin csrf se procesó, y el email cambió. Lab completado. Este error — confundir 'parámetro presente' con 'parámetro válido' — es sorprendentemente común en producción."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios tradicional, pero demuestra el mismo concepto: cambiar email = control de cuenta.
          La diferencia crítica con labs anteriores:
      - kind: "table"
        headers:
          - "Lab"
          - "Defensa"
          - "Bypass"
          - "Dificultad"
        rows:
          - ["Lab 1", "Ninguna", "Directo", "Trivial"]
          - ["Lab 2", "Referer validation", "Meta tag `no-referrer`", "Fácil"]
          - ["Lab 3", "Token en POST", "Cambiar a GET", "Media"]
          - ["Lab 4", "Token (presencia)", "Omitir parámetro", "Fácil (pero lógicamente más grave)"]
      - kind: "note"
        text: |
          Lab 4 parece más fácil que Lab 3, pero conceptualmente es un error más grave — el servidor *intenta* protegerse pero falla en la lógica básica.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En auditorías, este tipo de error es rojo brillante. Si el servidor VALIDA tokens en algunas rutas pero no en otras, o valida su presencia pero no su validez, es vulnerable a múltiples ataques. La regla: validación debe ser consistente y correcta en TODOS los casos."

lessons:
  - 'Presencia ≠ Validez: Validar que un parámetro exista no es lo mismo que validar que sea correcto.'
  - 'La lógica de validación debe ser explícita: No hay zona gris entre "válido" e "inválido".'
  - 'El supuesto del desarrollador: Asumir que "si está present probablemente sea válido" es un error crítico.'
  - 'Los errores de lógica son más comunes que se piensa: En producción, muchas aplicaciones confunden estos conceptos.'
  - 'Un token CSRF sin validación correcta = no es un token: Es solo un parámetro que el atacante puede ignorar.'
  - 'La defensa en profundidad falla si cualquier capa es débil: Si la primera defensa (validar presencia) es incorrecta, no hay segunda línea.'
mitigation:
  - 'Validar que el token CSRF sea correcto, no solo que esté presente: Comparar contra el token almacenado en sesión.'
  - 'Rechazar solicitudes SIN token en operaciones críticas: Si esperas `csrf=XXX&email=YYY`, rechaza `email=YYY` (sin csrf).'
  - 'Usar framework CSRF protection: Frameworks populares (Django, Rails, Spring) manejan esto correctamente por defecto.'
  - 'Testing específico: Prueba solicitudes sin parámetro csrf, con csrf vacío, con csrf incorrecto.'
  - 'Logging y monitoreo: Registrar intentos de CSRF (con o sin token) para detección.'
  - 'Validación server-side SIEMPRE: Nunca confíes en que el cliente envíe el parámetro correcto.'
---

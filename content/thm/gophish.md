---
title: "GoPhish"
platform: "TryHackMe"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "gophish"
author: "Z4k7"
date: "2026-04-16"
year: "2026"
status: "pwned"
tags:
  - "phishing"
  - "social"
  - "ececec"
  - "f4f4f4"
  - "ffffff"
techniques:
  - "Phishing"
  - "Suplantación de identidad"
  - "Ingeniería social"
tools:
  - "GoPhish"
flags_list:
  - label: "user"
    value: "martin@acmeitsupport.thm"
  - label: "user"
    value: "brian@acmeitsupport.thm"
  - label: "accounts"
    value: "accounts@acmeitsupport.thm"
  - label: "root"
    value: "Acceso a sistemas críticos internos tras escalada (AD admin, database server, etc.)"
summary: "Laboratorio THM Medium sobre GoPhish: configuración completa de campaña de phishing funcional. Se configura servidor SMTP local, landing page falsa (ACME IT SUPPORT), email template convincente y se lanza campaña contra 3 objetivos. Cadena de ataque: recopilación de credenciales vía phishing → captura de usuario/password.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Configurar e implementar una campaña de phishing funcional usando GoPhish:
      - kind: "bullet"
        text: "Autenticar en interfaz web de GoPhish"
      - kind: "bullet"
        text: "Crear perfiles SMTP (Sending Profiles)"
      - kind: "bullet"
        text: "Diseñar landing pages falsas"
      - kind: "bullet"
        text: "Crear plantillas de email convincentes"
      - kind: "bullet"
        text: "Crear grupos de objetivos"
      - kind: "bullet"
        text: "Lanzar campaña y capturar credenciales"

  - id: "access_1"
    num: "02"
    title: "Acceso a la interfaz de GoPhish"
    content:
      - kind: "note"
        text: |
          Ingresamos a la interfaz de la web con credenciales por defecto:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416101557859.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos con las credenciales:
      - kind: "bullet"
        text: "usuario: admin"
      - kind: "bullet"
        text: "contraseña: tryhackme"
      - kind: "note"
        text: |
          Una vez ingresamos en la interfaz de usuario tendremos acceso al siguiente entorno:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416101712798.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se observan los módulos principales:
      - kind: "bullet"
        text: "Sending Profiles (configuración SMTP)"
      - kind: "bullet"
        text: "Landing Pages (páginas de destino)"
      - kind: "bullet"
        text: "Email Templates (plantillas de correo)"
      - kind: "bullet"
        text: "Users & Groups (grupos de objetivos)"
      - kind: "bullet"
        text: "Campaigns (campañas activas)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un entorno real, cambiar siempre las credenciales por defecto. La contraseña 'tryhackme' es débil y predecible. Implementar credenciales fuertes y considerar 2FA para acceso al panel admin."

  - id: "step3_1"
    num: "03"
    title: "1. Configuración de Sending Profiles (SMTP)"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Sending Profiles` luego damos click en `New Profile`:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416101927862.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          A continuación, añadimos la siguiente información tal como se muestra en la captura:
      - kind: "code"
        lang: "BASH"
        code: |
          Name: Local Server
          From: noreply@redteam.thm
          Host: 127.0.0.1:25
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416102129778.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Luego le damos en guardar perfil. Se crea exitosamente el perfil SMTP local.
      - kind: "bullet"
        text: "Perfil SMTP local creado"
      - kind: "bullet"
        text: "Puerto 25 (SMTP estándar sin autenticación)"
      - kind: "bullet"
        text: "Dominio falso: noreply@redteam.thm"
      - kind: "callout"
        type: "warning"
        label: "Puerto SMTP detectado"
        text: "El puerto 25 es estándar y fácil de detectar. En producción, considerar puertos alternativos (587, 465) con TLS/SSL para evasión de IDS."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La dirección 'noreply@' es típica de notificaciones automáticas, lo que aumenta credibilidad. En spear phishing, personalizar el From address según el contexto de la organización target."

  - id: "step4_1"
    num: "04"
    title: "2. Configuración de Landing Pages"
    content:
      - kind: "note"
        text: |
          A continuación vamos a configurar la web de destino donde el usuario accederá desde el correo suplantado.
          Ingresamos en Landing Pages ---> New Page:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416102632688.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          A continuación, añadimos la siguiente información tal como se muestra en la captura:
      - kind: "code"
        lang: "BASH"
        code: |
          Name : ACME Login
      - kind: "note"
        text: |
          Código HTML:
      - kind: "code"
        lang: "HTML"
        code: |
          <!DOCTYPE html>  
          <html lang="en">  
          <head>  
              <meta charset="UTF-8">  
              <title>ACME IT SUPPORT - Admin Panel</title>  
              <style>        body { font-family: "Ubuntu", monospace; text-align: center }  
                  div.login-form { margin:auto; width:300px; border:1px solid #ececec; padding:10px;text-align: left;font-size:13px;}  
                  div.login-form div input { margin-bottom:7px;}  
                  div.login-form input { width:280px;}  
                  div.login-form div:last-child { text-align: center; }  
                  div.login-form div:last-child input { width:100px;}  
              </style>  
          </head>  
          <body>  
              <h2>ACME IT SUPPORT</h2>  
              <h3>Admin Panel</h3>  
              <form method="post">  
                  <div class="login-form">  
                      <div>Username:</div>  
                      <div><input name="username"></div>  
                      <div>Password:</div>  
                      <div><input type="password" name="password"></div>  
                      <div><input type="submit" value="Login"></div>  
                  </div>    </form></body>  
          </html>
      - kind: "note"
        text: |
          El anterior código lo adicionamos en el apartado de `Source`:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416103012872.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Adicionamos configuraciones:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416103147212.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Landing page ACME Login creada"
      - kind: "bullet"
        text: "Formulario captura username y password"
      - kind: "bullet"
        text: "Método POST enviará credenciales a GoPhish"
      - kind: "callout"
        type: "info"
        label: "Formulario de captura"
        text: "GoPhish intercepta automáticamente el POST del formulario. Los datos se almacenan en la base de datos interna con metadata (IP, timestamp, user-agent)."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Para máxima credibilidad en engagements reales: - Clonar CSS/layout exacto del sitio legítimo - Usar dominio similar (typosquatting) - Incluir logos/branding de la organización - Agregar página de 'error' post-submit para no levantar sospechas"
      - kind: "note"
        text: |
          Alternativas de explotación:
      - kind: "bullet"
        text: "Clon pixel-perfect con JavaScript de validación cliente"
      - kind: "bullet"
        text: "Two-stage landing (username → password en página 2)"
      - kind: "bullet"
        text: "Integración con [[Evilginx2]] para captura de 2FA"
      - kind: "bullet"
        text: "Landing page con malware attachment (combo attack)"

  - id: "step5_1"
    num: "05"
    title: "3. Plantillas de correo electrónico"
    content:
      - kind: "note"
        text: |
          Vamos a diseñar el cuerpo del correo electrónico en el cual la víctima accede por medio de un click a la web para poder obtener el usuario y password de la víctima.
          Ingresamos en Email Template ---> New Template:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416103508613.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          A continuación, añadimos la siguiente información tal como se muestra en la captura:
      - kind: "code"
        lang: "BASH"
        code: |
          Name: Email 1
          Subject: New Message Received
      - kind: "note"
        text: |
          Ingresamos en el apartado de HTML ---> `Source` creamos un correo electrónico solicitando el acceso a la web por error de actualización de usuario dejamos un apartado para que ingrese con este link https://admin.acmeitsupport.thm
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416104409391.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Código:
      - kind: "code"
        lang: "HTML"
        code: |
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>New Message Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin:0; padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="20" cellspacing="0" style="background-color:#ffffff; border-radius:8px; margin-top:40px;">
                    <tr>
                      <td align="center">
                        <h2 style="color:#333333; margin-bottom:20px;">Hello,</h2>
                        <p style="color:#555555; font-size:16px; line-height:1.5; margin-bottom:30px;">
                          You've received a new message.<br>
                          Please log in to the admin portal to view it.
                        </p>
                        <a href="https://admin.acmeitsupport.thm" 
                           style="display:inline-block; background-color:#007BFF; color:#ffffff; 
                                  padding:12px 24px; text-decoration:none; border-radius:5px; 
                                  font-size:16px; font-weight:bold;">
                          Click Here
                        </a>
                        <p style="color:#777777; font-size:14px; margin-top:40px;">
                          Many Thanks,<br>
                          <strong>Online Team</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
      - kind: "note"
        text: |
          Como resultado final contamos con esta vista:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416104436409.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Email template 'Email 1' creado"
      - kind: "bullet"
        text: "Asunto: 'New Message Received' (urgencia implícita)"
      - kind: "bullet"
        text: "CTA directo: botón 'Click Here' con link a landing page"
      - kind: "bullet"
        text: "Styling profesional para aumentar credibilidad"
      - kind: "callout"
        type: "info"
        label: "Variables dinámicas de GoPhish"
        text: "GoPhish soporta variables como {{.FirstName}}, {{.LastName}}, {{.Email}} para personalización masiva. El {{.URL}} se reemplaza automáticamente con el link tracked."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En campañas reales: - Personalizar asunto según OSINT (referencias a eventos recientes, urgencias reales) - Usar sender domain que coincida con target - Timing importante: enviar en horarios laborales, inicio de semana - Monitoring: alertas si mucha gente reporta como spam"
      - kind: "note"
        text: |
          Alternativas de explotación:
      - kind: "bullet"
        text: "Suplantación de CEO/director con pretexto urgente"
      - kind: "bullet"
        text: "Clone phishing (clonar email legítimo anterior)"
      - kind: "bullet"
        text: "Combo phishing + malware (attachment ejecutable)"
      - kind: "bullet"
        text: "Phishing con redirección a página de error realista"

  - id: "step6_1"
    num: "06"
    title: "4. Usuarios y grupos"
    content:
      - kind: "note"
        text: |
          Aquí podemos almacenar las direcciones de correo electrónico de nuestros destinatarios.
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416104806781.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Adicionamos la siguiente lista de correos víctimas:
      - kind: "code"
        lang: "BASH"
        code: |
          martin@acmeitsupport.thm
          brian@acmeitsupport.thm
          accounts@acmeitsupport.thm
      - kind: "note"
        text: |
          A continuación podrás validar como se agregaron los correos:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416104951426.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Grupo 'Targets' creado"
      - kind: "bullet"
        text: "3 objetivos agregados"
      - kind: "bullet"
        text: "Emails válidos del dominio acmeitsupport.thm"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En engagements reales, los emails se obtienen de OSINT (LinkedIn scraping, públicos, certificate transparency). GoPhish permite importar CSV masivamente. Validación de emails con herramientas como hunter.io o clearbit es crítica para no generar bounces que alerten defensas."

  - id: "step7_1"
    num: "07"
    title: "5. Campañas"
    content:
      - kind: "note"
        text: |
          Ahora es el momento de enviar tus primeros correos electrónicos.
          Ingresamos en el siguiente apartado Campaigns --> New Campaign:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416105148936.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          A continuación, añadimos la siguiente información tal como se muestra en la captura:
      - kind: "code"
        lang: "BASH"
        code: |
          - Name: Campaign One
          - Email Template: Email 1
          - Landing Page: ACME Login
          - URL: http://10.67.150.12
          - Launch Date: 2 Days
          - Sending Profile: Local Server
          - Groups: Targets
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416105424931.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez enviada la campaña accedemos a panel principal en los detalles tendremos los apartados de entrega de email contamos con 2 usuarios:
      - kind: "image"
        src: "assets/images/GoPhish/file-20260416105655838.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Esperamos unos minutos mientras los usuarios interactúan y poder capturar la contraseña.
      - kind: "bullet"
        text: "Campaña 'Campaign One' lanzada exitosamente"
      - kind: "bullet"
        text: "3 emails enviados a los objetivos"
      - kind: "bullet"
        text: "2 entregas exitosas (1 bounce posible)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La URL (10.67.150.12) debe ser accesible desde el rango de la víctima. En escenarios reales, usar servidor con IP pública o infraestructura de red target. Timing programado ('2 Days') permite ajustar según el engagement."

  - id: "access"
    num: "08"
    title: "6. Captura de Credenciales en Tiempo Real"
    content:
      - kind: "note"
        text: |
          Métricas observadas en el panel:
      - kind: "bullet"
        text: "Sent: 3 emails enviados"
      - kind: "bullet"
        text: "Delivered: 2 entregas exitosas (1 bounce posible)"
      - kind: "bullet"
        text: "Clicks: Número de víctimas que hicieron click en el link"
      - kind: "bullet"
        text: "Data Submitted: Credenciales capturadas cuando completaron el formulario"
      - kind: "callout"
        type: "danger"
        label: "Credenciales capturadas"
        text: "Las credenciales almacenadas en GoPhish son el primer nivel de acceso. El siguiente paso crítico es validar estas credenciales contra sistemas reales (email legítimo, VPN, sistemas internos) para post-explotación."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un engagement real, después de capturar credenciales: 1. Validación inmediata — probar contra email, VPN, sistemas conocidos 2. Logging — documentar quién fue vulnerable (target de re-training) 3. Post-explotación — acceso a email real, calendar, contacts para inteligencia 4. Lateral movement — usar creds para acceder a sistemas internos 5. Persistence — crear cuenta backdoor si la misión lo requiere"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "user"
        value: "martin@acmeitsupport.thm"
      - label: "user"
        value: "brian@acmeitsupport.thm"
      - label: "accounts"
        value: "accounts@acmeitsupport.thm"

  - id: "privesc"
    num: "09"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Después de capturar credenciales de usuarios finales, se utiliza el acceso para:
          1. Acceso a email real
          - Recopilación de información sensible
          - Búsqueda de emails internos (contraseñas, accesos)
          - Robo de datos (documentos, contactos)
          2. Movimiento lateral
          - Acceso a sistemas internos con credenciales comprometidas
          - Enumeración de recursos compartidos
          - Acceso a base de datos o sistemas críticos
          3. Escalada a privilegios elevados
          - Si usuario comprometido tiene permisos admin
          - Acceso a sistemas de gestión central
          - Reclutamiento de otros usuarios para acceso más amplio

  - id: "access"
    num: "10"
    title: "Ejemplo: validación rápida de credencial en email"
    content:
      - kind: "note"
        text: |
          curl -u martin@acmeitsupport.thm:password_martin imap.acmeitsupport.thm:993

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "root"
        value: "Acceso a sistemas críticos internos tras escalada (AD admin, database server, etc.)"

lessons:
  - 'GoPhish automatiza el flujo completo de phishing: SMTP + landing pages + tracking + credential capture'
  - 'La credibilidad del ataque depende de detalles: dominio correcto, asunto relevante, landing page exacta'
  - 'El phishing es el 80% del éxito en un engagement red team — credenciales válidas = acceso garantizado'
  - 'Las campañas pueden monitorearse en tiempo real para ajustar tácticas y pretextos'
  - 'La captura de credenciales es solo el punto de entrada; el valor real está en post-explotación'
  - 'La seguridad de la infraestructura de GoPhish es crítica (credenciales, logs, backup)'
mitigation:
  - 'Implementar DMARC, SPF, DKIM estrictos (policy=reject) para evitar suplantación de dominio'
  - 'Email filtering y sandboxing (Proofpoint, Mimecast) para análisis de URLs/attachments'
  - 'Bloquear URLs sospechosas o categorías de riesgo a nivel de gateway'
  - 'Requerir MFA/2FA obligatorio en todos los sistemas críticos'
  - 'Autenticación passwordless (FIDO2, Windows Hello) para reducir valor de credenciales'
  - 'Programas regulares de conciencia sobre phishing y reconocimiento de red flags'
  - 'Monitoreo en tiempo real de intentos de login anómalos (geografía, horario, velocidad)'
  - 'EDR/XDR con detección de comportamiento sospechoso post-compromiso'
  - 'Alertas automáticas por múltiples intentos fallidos o acceso a recursos sensibles'
---

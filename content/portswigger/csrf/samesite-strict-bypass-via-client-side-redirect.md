---
title: "SameSite Strict bypass via client-side redirect"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "samesite-strict-bypass-via-client-side-redirect"
author: "Z4k7"
date: "2026-04-05"
year: "2026"
status: "pwned"
tags:
  - "SameSite"
  - "Strict"
  - "CSRF"
techniques:
  - "Client-side Redirect"
  - "Path Traversal"
  - "SameSite Strict Bypass"
tools:
  - "BurpSuite"
  - "Exploit Server"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque CSRF contra SameSite Strict usando redirect chain. SameSite Strict normalmente bloquea TODA cookie cross-site, pero hay un bypass: si el sitio tiene un endpoint de redireccionamiento client-side vulnerable (sin sanitización de paths), el atacante puede usar path traversal para redirigir desde mismo-sitio (WHERE_COOKIES_SE_ENVIAN) a la función vulnerable. Demuestra por qué validación de redireccionamientos client-side es crítica incluso con SameSite Strict."
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
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408154228012.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos en el apartado de login:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408154254217.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El usuario y password están disponibles en el objetivo del laboratorio:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408154320393.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Acceso a URL del laboratorio exitoso"
      - kind: "bullet"
        text: "Credenciales válidas: wiener:peter"
      - kind: "bullet"
        text: "Usuario autenticado con sesión activa"
      - kind: "bullet"
        text: "Acceso a funcionalidad de blog y comentarios"
      - kind: "note"
        text: |
          Consultamos el código fuente de la web principal. Ingresamos en el apartado de posts para consultar el comportamiento de registro de comentarios.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab es diferente — no está atacando change-email directamente. Está atacando un endpoint de REDIRECCIONAMIENTO. Pregúntate: ¿por qué el atacante necesita un redirect? Porque SameSite Strict bloquea cookies cross-site. Pero si el redirect es same-site, las cookies SE ENVIAN."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Validando el comportamiento de la web se evidencia un proceso de redireccionamiento al web una vez se crea el post.
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408155009880.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el comportamiento del proceso de registro de comentarios. Se evidencia el siguiente código JavaScript:
      - kind: "code"
        lang: "JS"
        code: |
          redirectOnConfirmation = (blogPath) => {
              setTimeout(() => {
                  const url = new URL(window.location);
                  const postId = url.searchParams.get("postId");
                  window.location = blogPath + '/' + postId;
              }, 3000);
          }
      - kind: "note"
        text: |
          Análisis del código:
          1. Toma la URL actual del navegador
          2. Extrae el parámetro `postId`
          3. Después de 3 segundos, redirige a: `blogPath + '/' + postId`
          El problema: No hay sanitización. Si pasamos `postId=9/../../my-account`, el código lo concatena directamente.
          El redireccionamiento se ejecuta desde MISMO-SITIO (porque es JavaScript interno), lo que significa que:
      - kind: "bullet"
        text: "La solicitud del redirect sí incluye cookies (mismo-sitio)"
      - kind: "bullet"
        text: "SameSite Strict permite esto (porque es mismo-sitio)"
      - kind: "bullet"
        text: "El atacante puede redirigir A CUALQUIER LUGAR dentro del sitio"
      - kind: "callout"
        type: "warning"
        label: "Redireccionamiento Client-side Sin Sanitización"
        text: "El código toma `postId` directamente del URL y lo concatena. Esto permite path traversal: - `postId=9/../../my-account` → redirige a `/my-account` - `postId=9/../../my-account/change-email?email=hacked@...` → redirige a formulario de cambio email  Y como el redirect es JavaScript mismo-sitio → cookies se incluyen."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es el bypass de SameSite Strict más elegante. No rompes SameSite — lo usas EN TU FAVOR. SameSite confía en mismo-sitio. Tú USAS el mismo-sitio para redirigir a donde quieras."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El objetivo es cambiar el correo del administrador. Explotamos el redireccionamiento vulnerable en 3 pasos:
          Paso 1: Verificar que path traversal funciona
          URL actual:
      - kind: "code"
        lang: "JS"
        code: |
          GET /post/comment/confirmation?postId=9
      - kind: "note"
        text: |
          Intento con path traversal:
      - kind: "code"
        lang: "JS"
        code: |
          GET /post/comment/confirmation?postId=9/../../my-account
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408160223609.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408160339683.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Permite realizar el redireccionamiento sin problema.
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408160644476.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El redireccionamiento funciona, creando la URL correcta.
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408160752408.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Paso 2: Usar encoded path traversal
          Para evitar errores, se recomienda usar path traversal encoded:
      - kind: "code"
        lang: "JS"
        code: |
          GET /post/comment/confirmation?postId=9%2f%2e%2e%2f%2e%2e%2fmy-account
      - kind: "note"
        text: |
          Se confirma el proceso.
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408161137140.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Paso 3: Redirigir directamente al cambio de email
          Validamos el comportamiento de cambio de datos por parte de la víctima:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408161640888.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si cambiamos el proceso por medio de GET permite el cambio sin problema:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408161805181.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ahora enviamos la URL completa que combina path traversal + cambio de email:
      - kind: "code"
        lang: "JS"
        code: |
          GET /post/comment/confirmation?postId=9%2f%2e%2e%2f%2e%2e%2fmy-account%2fchange-email%3femail%3dhacked%40gmail.com%26submit%3d1
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408161905621.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos la solicitud:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408162256897.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma el cambio en 4 pasos:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408162312381.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Bypass — Client-side Redirect + Path Traversal"
        text: "1. Atacante descubre endpoint `/post/comment/confirmation` 2. Identifica que concatena `postId` sin sanitizar 3. Crea URL con path traversal: `postId=9/../../my-account/change-email?email=hacked@...` 4. Víctima hace clic en link (mismo-sitio) 5. JavaScript ejecuta: `window.location = '/post/' + postId` 6. Resulta en: `window.location = '/my-account/change-email?email=hacked@...` 7. El redirect es DESDE mismo-sitio 8. Cookies se envían normalmente (SameSite Strict lo permite: es mismo-sitio) 9. Servidor recibe solicitud autenticada 10. Email cambiado ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass NO rompe SameSite. Lo explota. SameSite Strict confía en MISMO-SITIO. Tú usas MISMO-SITIO (redireccionamiento interno) para hacer lo que quieras. Es brillante porque es COMPLETAMENTE VÁLIDO desde perspectiva de SameSite — el navegador VE solicitud same-site y envía cookies."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server` para simular un servidor atacante:
          El payload final es un simple redirect desde dominio atacante AL sitio vulnerable:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          location='https://0a00008003c938808261bf7e001e0002.web-security-academy.net/post/comment/confirmation?postId=9%2f%2e%2e%2f%2e%2e%2fmy-account%2fchange-email%3femail%3dadmin%40gmail.com%26submit%3d1'
          </script>
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408162550672.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se guarda el payload y se envía a la víctima:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20client-side%20redirect/file-20260408162621627.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab demuestra que SameSite Strict no protege contra TODO. Protege contra cross-site requests. Pero si hay un redirect vulnerable MISMO-SITIO, puedes usarlo para ir a donde quieras. La lección: validar TODOS los redireccionamientos client-side, no solo los que parecen críticos."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no aplica escalada de privilegios, pero demuestra cómo vulnerabilidades "menores" (falta de sanitización en redirect) pueden combinarse para romper defensas "mayores" (SameSite Strict).
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esta es la naturaleza real de la seguridad: no es un muro impenetrable. Es un conjunto de capas, y cada capa debe ser robusta. Una capa débil (redirect sin sanitización) puede exponer todas las capas superiores."

lessons:
  - 'Redireccionamientos client-side DEBEN sanitizarse: Incluso si parecen internos o no críticos.'
  - 'SameSite Strict solo protege contra cross-site requests: No protege contra mismo-sitio vulnerabilities.'
  - 'Path traversal en redireccionamientos es crítica: Puede llevarte a cualquier parte del sitio.'
  - '"Mismo-sitio" es confiado por SameSite: Usaste esto contra ti mismo.'
  - 'Validación debe ser en el servidor: No solo en el cliente. El servidor debe validar que el redirect es a destino válido.'
  - 'Defensa en profundidad es esencial: SameSite Strict + CSRF tokens + sanitización = realmente seguro.'
mitigation:
  - 'Validar y sanitizar TODOS los parámetros de redireccionamiento: No solo los que parecen críticos.'
  - 'Usar whitelist de destinos válidos: En lugar de concatenación de strings.'
  - 'Implementar validación server-side: No confiar solo en cliente.'
  - 'Usar URLs relativas con validación: En lugar de aceitar parámetros en URLs.'
  - 'Content Security Policy: Para limitar redireccionamientos a dominios específicos.'
  - 'CSRF tokens incluso para redireccionamientos: Aunque parezca overkill.'
---

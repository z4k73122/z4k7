---
title: "Clickjacking with a frame buster scrip"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "web-security-academy.net"
slug: "clickjacking-with-a-frame-buster-scrip"
author: "Z4k7"
date: "2026-10-16"
year: "2026"
status: "pwned"
tags:
  - "Clickjacking"
  - "SandboxBypass"
  - "Web"
  - "UI_Redressing"
  - "target_website"
  - "decoy_website"
  - "fff"
techniques:
  - "Clickjacking"
  - "iframe sandbox bypass"
  - "frame buster evasion"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy (Web Application, Easy) que amplía el clickjacking básico: la página objetivo trae un frame buster en JavaScript (if(top != self)) que borra su contenido si detecta que está dentro de un iframe. Se elude con el atributo sandbox='allow-forms allow-scripts' del iframe, que permite que la página víctima funcione (formularios y scripts) pero le quita la capacidad de comparar o modificar top, neutralizando la defensa. El exploit final cambia el email de la víctima vía ?email= precargado en la URL.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio está protegido por un sistema de bloqueo de marcos que impide que el sitio web sea enmarcado. ¿Puedes sortear este sistema y realizar un ataque de clickjacking que cambie la dirección de correo electrónico del usuario?
          Para resolver el laboratorio, crea un código HTML que enmarque la página de la cuenta y engañe al usuario para que cambie su dirección de correo electrónico haciendo clic en "Haz clic aquí". El laboratorio se resuelve cuando se cambia la dirección de correo electrónico.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales:`wiener:peter`
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
          ingresamos en el laboratorio podemos validar que contamos con un login ingresamos con los datos suministrados en el objetivo.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102213508421.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez ya contamos con el acceso en la web validamos el entorno del usuario
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102213526164.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Realizamos reconocimiento del entorno del usuario podemos validar un apartado donde podernos ingresar un correo y realizar la actualización del mismo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab se diferencia del básico en que ya no basta con armar el overlay: primero hay que identificar qué defensa anti-framing existe y de qué tipo es (cliente vía JavaScript, o servidor vía `X-Frame-Options`/`CSP`). Antes de tocar el Exploit Server, carga la página objetivo dentro de un iframe simple y observa qué pasa: si el contenido desaparece o se reemplaza por un mensaje, es un frame buster en JavaScript, no un bloqueo del servidor, y el bypass es distinto en cada caso."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Una vez realizamos el reconocimiento del entorno validamos si es posible ingresar el correo del usuario por medio de la url.
          código
      - kind: "code"
        lang: "URL"
        code: |
          https://0a48009003f6e4e580dfad20005e00e6.web-security-academy.net/my-account?email=wiener
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102214029006.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podemos validar que si podremos manipular la url para tratar de modificar el correo de la victima en este caso ingresamos al servidor del laboratorio para tratar de manipular la web entregada al usuario.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102214306763.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en el `servidor` y manipulamos el entorno  `Body:`
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102214332989.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Código
      - kind: "code"
        lang: "HTML"
        code: |
          <head>
          	<style>
          		#target_website {
          			position:relative;
          			width:1570px;
          			height:700px;
          			opacity:1;
          			z-index:2;
          			}
          		#decoy_website {
          			position: absolute;
          			top: 527px;
          			left: 218px;
          			width: 110px;
          			z-index: 1;
          			border-radius: 25px;
          			-webkit-user-select: none;
          			background-color: #159c80;
          			color: #fff;
          			font-size: 16px;
          			font-weight: bold;
          			padding: 7px 1em;
          			text-align: center;
          			min-width: 120px;
          			}
          	</style>
          </head>
          <body>
          <div id="decoy_website">CLICK ME</div>
          	<iframe id="target_website" src="https://">
          	</iframe>
          </body>
      - kind: "note"
        text: |
          Guardamos el código en el servidor e ingresamos en View exploit para validar su entorno y comportamiento antes de enviar el exploit a la victima .
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102214530547.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En la imagen podemos validar que contamos con una restricción para tratar de llamar la web original de la victima .
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102214704341.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si consultamos el código fuente de la web para tratar de consultar el motivo por el cual no renderiza la web.
          Código :
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          	if(top != self) {
                  window.addEventListener("DOMContentLoaded", function() {
                      document.body.innerHTML = 'This page cannot be framed';
                 }, false);
              }
          </script>
      - kind: "note"
        text: |
          El anterior codigo es el responsable por el cual no se puede renderizar la web
          Este fragmento de código JavaScript es una medida de seguridad conocida como protección contra _framing_ o anti-clickjacking. Su objetivo principal es evitar que tu página web sea cargada dentro de un `<iframe>`, `<frame>` o `<object>` en otro sitio web malicioso.

  - id: "step4_1"
    num: "04"
    title: "Desglose línea por línea"
    content:
      - kind: "bullet"
        text: "if(top != self) {"
      - kind: "note"
        text: |
          - `top`: Representa la ventana o el marco superior de más alto nivel en el navegador (la ventana principal).
          - `self`: Representa la ventana o el marco actual en el que se está ejecutando el código.
          - Si la página web se abre normalmente, `top` y `self` son iguales. Pero si la página está metida dentro de un `<iframe>` en _otra_ web, `top` (la página principal) será diferente a `self` (el marco incrustado). La condición se cumple si está incrustada.
      - kind: "bullet"
        text: "window.addEventListener('DOMContentLoaded', function() {"
      - kind: "note"
        text: |
          - Espera a que el documento HTML se haya cargado y parseado por completo antes de ejecutar el código de adentro.
      - kind: "bullet"
        text: "document.body.innerHTML = 'This page cannot be framed';"
      - kind: "note"
        text: |
          - Una vez que se detecta que la página está dentro de un marco ajeno y el DOM está listo, este comando borra todo el contenido original de la página (`document.body.innerHTML`) y lo reemplaza únicamente por el texto: _"This page cannot be framed"_ ("Esta página no puede mostrarse en un marco").
          para tratar de saltar dicho apartado podremos aplicar en el iframe un atributo adicional
      - kind: "bullet"
        text: "El Problema del _Frame Buster_ Original: Muchas páginas web usan scripts de JavaScript en el cliente para detectar si están siendo cargadas dentro de un <iframe> malicioso y obligan al navegador a redirigir la ventana principal (top.location = self.location). Sin embargo, estas técnicas son frágiles: dependen de que el navegador soporte JavaScript y de que las políticas del cliente no bloqueen el script."
      - kind: "bullet"
        text: "La Solución del Atacante (HTML5 Sandbox): Para evitar que el script de defensa de la página víctima detecte el fraude o rompa el iframe, el atacante utiliza la etiqueta iframe con restricciones de seguridad de HTML5:"
      - kind: "note"
        text: |
          código :
      - kind: "code"
        lang: "JS"
        code: |
          <iframe id="victim_website" src="https://victim-website.com" sandbox="allow-forms allow-scripts"></iframe>
      - kind: "note"
        text: |
          Mecanismo de Neutralización:
      - kind: "bullet"
        text: "allow-scripts y allow-forms: Permiten que el sitio víctima ejecute sus funciones básicas (scripts y formularios) para que la página parezca legítima y funcional ante los ojos del usuario engañado."
      - kind: "bullet"
        text: "Omisión de permisos críticos (como allow-top-navigation o allow-same-origin): Al no otorgar permisos de navegación a nivel superior, el script de defensa de la víctima pierde la capacidad de modificar la ventana principal (top). El script intenta comprobar si es la ventana principal, pero el entorno aislado del sandbox neutraliza su ejecución o le impide alterar el contexto global, anulando el _frame buster_."
      - kind: "note"
        text: |
          modificamos el código principal del laboratorio para validar si podemos eludir el js
          codigo :
      - kind: "code"
        lang: "JS"
        code: |
          <iframe id="victim_website" src="https://victim-website.com" sandbox="allow-forms allow-scripts"></iframe>
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102220321457.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          contamos con la vista de la web original y ya podremos realizar la manipulación de la victima.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102220557816.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ya solo queda manipular el style para sobreponer el bottom ,Enviamos el exploit a la victima  y contamos con un resultado de ok
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102221144121.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20a%20frame%20buster%20script/file-20261102221153744.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas de explotación con el mismo fin: - Probar primero el `sandbox` sin `allow-forms` ni `allow-scripts`: confirmas que el framebuster deja de ejecutarse, y luego añades los permisos uno por uno hasta recuperar la funcionalidad mínima que necesitas (aquí, el formulario de cambio de email). - Combinar `?email=` con el iframe sandbox: precargar el valor malicioso por URL reduce la interacción de la víctima a un solo clic, igual que en el lab básico. - Revisar si el sitio además envía `X-Frame-Options`: un frame buster en JavaScript y un header anti-framing no son mutuamente excluyentes; si el server también bloquea, el `sandbox` no sirve de nada y hace falta otra vía (bypass de header, o apostar por una subpágina sin el header)."

lessons:
  - 'Un frame buster en JavaScript depende de que el script se ejecute dentro del iframe. El atributo sandbox del iframe, al omitir el permiso de navegación de nivel superior, deja al script sin forma de alterar la ventana principal y lo neutraliza.'
  - 'Dar solo los permisos mínimos al iframe sandbox, como formularios y scripts, mantiene la apariencia funcional de la página objetivo sin reactivar la defensa.'
  - 'El reconocimiento debe incluir probar el embebido antes de construir el exploit completo, para saber si la defensa es del cliente o del servidor.'
  - 'Precargar datos por parámetro de URL, como el correo electrónico, reduce la interacción necesaria de la víctima a un solo clic.'
  - 'Una defensa de frame busting es más débil que un encabezado de servidor como X-Frame-Options, porque depende de JavaScript y de que el navegador lo ejecute sin restricciones.'
mitigation:
  - 'No depender de scripts de frame busting en el cliente como única defensa contra el clickjacking.'
  - 'Enviar el encabezado X-Frame-Options con el valor deny o sameorigin desde el servidor.'
  - 'Definir la directiva frame-ancestors en la Content Security Policy, que no puede ser neutralizada con el atributo sandbox del iframe porque se aplica en el navegador antes de cargar el contenido.'
  - 'Validar los cambios de datos sensibles, como el correo electrónico, con una confirmación adicional en lugar de aplicarlos con un solo clic.'
  - 'Revisar periódicamente que las defensas anti-framing sigan vigentes tras cambios en el código del frontend.'
---

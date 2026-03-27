---
title: "SQL injection attack, querying the database type and version on Oracle"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "sql-injection-attack-querying-the-database-type-and-version-on-oracle"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "oracle"
  - "apprentice"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "fingerprint de motor Oracle"
  - "FROM dual"
  - "v$version"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "Versión Oracle visible en la respuesta ✓"
summary: "La vulnerabilidad de SQL Injection en el filtro de categorías permite inyectar un ataque UNION SELECT para extraer la versión del motor Oracle. La particularidad crítica: todo UNION SELECT en Oracle requiere FROM dual — sin él la query falla aunque el número de columnas sea correcto. Cadena de ataque: detección → ORDER BY (3 columnas) → UNION NULL FROM dual (2 columnas visibles) → UNION SELECT banner FROM v$version.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con `'--` para verificar errores de sintaxis:
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093209973.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La respuesta del servidor muestra un error de sintaxis, validando que la entrada del usuario se inserta sin sanitización en la consulta SQL."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El error de sintaxis en reconocimiento ya te da información del motor — Oracle genera mensajes con prefijo `ORA-`. Si ves `ORA-` en el error, es Oracle sin dudas. Documenta siempre el mensaje exacto."
      - kind: "callout"
        type: "warning"
        label: "Pista del lab"
        text: "En las bases de datos Oracle, cada `SELECT` debe especificar una tabla con `FROM`. Si tu `UNION SELECT` no consulta desde una tabla, necesitarás incluir `FROM` seguido de un nombre de tabla válido. Hay una tabla incorporada en Oracle llamada `dual`. Por ejemplo: `UNION SELECT 'abc' FROM dual`"

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Punto de inyección: parámetro category en la URL"
      - kind: "bullet"
        text: "Motor de BD: Oracle (confirmado por necesidad de FROM dual)"
      - kind: "bullet"
        text: "Restricción clave: todo SELECT en Oracle necesita FROM [tabla]"
      - kind: "bullet"
        text: "Tabla especial: dual (tabla de una fila para consultas de prueba)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Identificar Oracle temprano te ahorra tiempo — cada payload cambia. Sin `FROM dual`, cualquier UNION falla en Oracle independientemente del número de columnas. Es el error más común de juniors que no reconocen el motor a tiempo."

  - id: "enum"
    num: "03"
    title: "Paso 1 — Determinar columnas con ORDER BY"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2,3-- → Éxito
          '+ORDER+BY+1,2,3,4-- → Error
      - kind: "note"
        text: |
          El error al ordenar por la columna 4 indica 3 columnas.
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093350786.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El error en la cuarta columna confirma que la consulta devuelve 3 columnas."

  - id: "exploit"
    num: "04"
    title: "Paso 2 — Validar con UNION SELECT en Oracle"
    content:
      - kind: "note"
        text: |
          Oracle requiere `FROM dual` en todo `UNION SELECT`:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL FROM dual--           → Error (1 col)
          ' UNION SELECT NULL,NULL FROM dual--      → Éxito ✓ (2 cols)
          ' UNION SELECT NULL,NULL,NULL FROM dual-- → Error (3 cols)
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093512997.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta exitosa con 2 NULL confirma la estructura de la tabla subyacente."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Discrepancia: ORDER BY dijo 3 columnas pero UNION NULL funciona con 2. Esto pasa cuando hay columnas en el SELECT que no se renderizan en la respuesta visible. Para la explotación, lo que importa es el número que hace que UNION NULL no falle — en este caso 2."

  - id: "step5_1"
    num: "05"
    title: "Paso 3 — Extraer versión Oracle"
    content:
      - kind: "note"
        text: |
          En Oracle, la información de versión se encuentra en la vista `v$version`:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT banner,NULL FROM v$version--
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093845776.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta devuelve la cadena de versión de Oracle Database, cumpliendo el objetivo del laboratorio."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`v$version` con columna `banner` es exclusivo de Oracle. Equivalentes: MySQL/MSSQL → `@@version`, PostgreSQL → `version()`. La versión exacta importa en un pentest real — algunas versiones tienen vulnerabilidades directamente explotables desde SQLi."

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Lab de tipo "fingerprint de BD" — no requiere acceso a cuenta. El objetivo es extraer la cadena de versión de Oracle.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "Versión Oracle visible en la respuesta ✓"

  - id: "privesc_1"
    num: "07"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — lab de identificación de motor de BD.

  - id: "step8_1"
    num: "08"
    title: "Consulta del tipo y la versión de la base de datos"
    content:
      - kind: "table"
        headers:
          - "Tipo de base de datos"
          - "Consulta"
        rows:
          - ["Microsoft, MySQL", "`SELECT @@version`"]
          - ["Oracle", "`SELECT banner FROM v$version`"]
          - ["PostgreSQL", "`SELECT version()`"]
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR esperado al probar columnas"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."

lessons:
  - 'La clave está en comprender las particularidades del motor: uso de `dual` y vistas como `v$version`.'
  - 'En auditorías, siempre validar número de columnas antes de intentar UNION SELECT.'
  - 'La diferencia entre SQLi en MySQL, PostgreSQL y Oracle es un punto clave en exámenes y entrevistas.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Deshabilitar mensajes de error detallados en producción.'
  - 'Aplicar WAF con reglas específicas para detectar patrones de SQLi `UNION`, `ORDER BY`, `--`.'
  - 'Revisar permisos de vistas sensibles como `v$version`.'
---

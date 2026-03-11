---
title: "SQL injection attack, querying the database type and version on Oracle"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "sql-injection-attack-querying-the-database-type-and-version-on-oracle"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "OracleDB"
  - "UnionAttack"
  - "WAF"
techniques:
  - "SQLi"
  - "OracleDB"
  - "UnionAttack"
  - "WAF"
tools:
  - "Burpsuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación   concatena directamente la entrada del usuario en una consulta SQL sin  validación ni sanitización. Esto permite manipular la consulta original, extraer  información sensible o ejecutar comandos arbitrarios en la base de datos.   En este laboratorio, el vector de ataque se encuentra en el filtro de categorías de productos, donde se puede inyectar un ataque UNION SELECT para recuperar la versión de la base de datos."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Se puede usar un ataque UNION para recuperar los resultados de una consulta inyectada.
          Para resolver el laboratorio, muestre la cadena de versión de la base de datos.
      - kind: "callout"
        type: "warning"
        label: "Pista"
        text: "En las bases de datos Oracle, cada `SELECT`La declaración debe especificar una tabla para seleccionar `FROM`. Si tu `UNION SELECT`El ataque no consulta desde una tabla, aún necesitarás incluir el `FROM`palabra clave seguida de un nombre de tabla válido.  Hay una tabla incorporada en Oracle llamada `dual`que puedes usar para este propósito. Por ejemplo: `UNION SELECT 'abc' FROM dual`"

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con `'--` para verificar errores de sintaxis:
          Esto confirma que la entrada se concatena directamente en la consulta SQL.
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093209973.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La respuesta del servidor muestra un error de sintaxis, validando que la entrada del usuario se inserta sin sanitización en la consulta SQL."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Determinar número de columnas con ORDER BY:
          Se incrementa el índice hasta provocar error:
      - kind: "code"
        lang: "SQL"
        code: |
          +ORDER+BY+1,2,3-- -- Éxito 
          +ORDER+BY+1,2,3,4-- -- Error
      - kind: "note"
        text: |
          El error indica que la consulta tiene 3 columnas.
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093350786.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El error en la cuarta columna confirma que la consulta devuelve 3 columnas."
      - kind: "note"
        text: |
          Validar con UNION SELECT en Oracle: Oracle requiere el uso de la tabla `dual` para consultas de prueba.
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL FROM dual-- -- Error 
          UNION SELECT NULL,NULL FROM dual-- -- Exito 
          UNION SELECT NULL,NULL,NULL FROM dual-- -- Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093512997.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta exitosa con tres columnas confirma la estructura de la tabla subyacente."
      - kind: "note"
        text: |
          Extraer versión de la base de datos: En Oracle, la información de versión se encuentra en la vista
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT banner,NULL,NULL FROM v$version--
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093845776.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta devuelve la cadena de versión de Oracle Database, cumpliendo el objetivo del laboratorio."

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
    title: "Consulta del tipo y la versión de la base de datos"
    content:
      - kind: "note"
        text: |
          Las siguientes son algunas consultas para determinar la versión de la base de datos para algunos tipos de bases de datos populares:
      - kind: "table"
        headers:
          - "Tipo de base de datos"
          - "Consulta"
        rows:
          - ["Microsoft, MySQL", "`SELECT @@version`"]
          - ["Oracle", "`SELECT * FROM v$version`"]
          - ["PostgreSQL", "`SELECT version()`"]
      - kind: "note"
        text: |
          En este caso para validare la versión de un BD se debe emplear el siguiente código  la consulta se aplica con el atributo `UNION` + `SELECT` después según sea el motor de BD
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT @@version--

lessons:
  - 'La clave está en comprender las particularidades del motor uso de `dual` vistas como `v$version`.'
  - 'En auditorías, siempre validar número de columnas antes de intentar UNION SELECT.'
  - 'En exámenes o entrevistas, mencionar la diferencia entre SQLi en MySQL, PostgreSQL y Oracle es un punto de valor académico.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Deshabilitar mensajes de error detallados en producción.'
  - 'Aplicar #WAF con reglas específicas para detectar patrones de SQLi `UNION`  `ORDER BY`  `--`.'
  - 'Revisar permisos de vistas sensibles como `v$version`.'
---

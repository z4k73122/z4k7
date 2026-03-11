---
title: "Ataque UNION de inyección SQL, determinando el número de columnas devueltas por la consulta"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-determinando-el-numero-de-columnas-devueltas-por-la-consulta"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "SQLI"
  - "Union"
  - "WAF"
techniques:
  - "SQLI"
  - "Union"
  - "WAF"
tools:
  - "Burpsuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection ocurre cuando una aplicación web construye consultas dinámicas sin sanitizar adecuadamente la entrada del usuario. En este caso"
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL en el filtro de categorías de producto. Los resultados de la consulta se devuelven en la respuesta de la aplicación, por lo que se puede usar un ataque `UNION` para recuperar datos de otras tablas. El primer paso de este tipo de ataque es determinar el número de columnas que devuelve la consulta. Posteriormente, se utilizará esta técnica en laboratorios posteriores para construir el ataque completo.
          Para resolver el laboratorio, determine la cantidad de columnas devueltas por la consulta realizando un ataque UNION de inyección SQL que devuelva una fila adicional que contenga valores nulos.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Primero se valida la vulnerabilidad con un comentario SQL:
          `'--`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyección%20SQL%20en%20la%20cláusula%20WHERE%20que%20permite%20la%20recuperación%20de%20datos%20ocultos/file-20260309153214203.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación no bloquea la inyección y devuelve resultados válidos, confirmando la vulnerabilidad."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Determinación de columnas con `ORDER BY`
          Se incrementa el índice hasta provocar error:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2,3,4--
      - kind: "note"
        text: |
          El error indica que la consulta tiene 3 columnas.
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20determinando%20el%20número%20de%20columnas%20devueltas%20por%20la%20consulta/file-20260309174745138.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación falla al ordenar por la columna 4, confirmando que existen solo 3 columnas"
      - kind: "note"
        text: |
          Posteriormente, se aplica un OR lógico para forzar la inclusión de todos los registros:

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
  - 'Siempre iniciar con ORDER BY para determinar columnas antes de usar UNION.'
  - 'Documentar cada paso con capturas y queries para auditorías.'
  - 'Recordar que este es solo el inicio: en laboratorios posteriores se usará esta técnica para extraer datos sensibles como usuarios y contraseñas.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar error handling para no mostrar mensajes SQL al cliente.'
  - 'Aplicar #WAF con reglas específicas para detectar patrones de inyección.'
---

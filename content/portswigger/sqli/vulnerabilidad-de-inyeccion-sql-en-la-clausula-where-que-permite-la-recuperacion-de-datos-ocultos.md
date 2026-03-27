---
title: "Vulnerabilidad de inyección SQL en la cláusula WHERE que permite la recuperación de datos ocultos"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "vulnerabilidad-de-inyeccion-sql-en-la-clausula-where-que-permite-la-recuperacion-de-datos-ocultos"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "where"
  - "bypass"
  - "apprentice"
techniques:
  - "SQL Injection"
  - "comentario SQL"
  - "OR lógico"
  - "bypass de cláusula WHERE"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "Productos no lanzados visibles en la respuesta ✓"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación web construye consultas SQL dinámicas con datos proporcionados por el usuario sin aplicar validaciones ni sanitización. El filtro de categorías de productos concatena directamente el valor de entrada en la cláusula WHERE, permitiendo manipular la lógica de la consulta para mostrar productos no lanzados. Cadena de ataque: detección con ' → comentario -- para eliminar condición → OR 1=1 para bypass total.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con el carácter `'` para verificar errores de sintaxis.
          Esto confirma que la entrada se concatena directamente en la consulta.
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20en%20la%20cl%C3%A1usula%20WHERE%20que%20permite%20la%20recuperaci%C3%B3n%20de%20datos%20ocultos/file-20260309153214203.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación devuelve un error SQL, lo que confirma que la entrada del usuario afecta directamente la consulta."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El error SQL visible es señal de que la app no tiene manejo genérico de errores. Documenta el mensaje exacto — te dice el motor de BD (MySQL, Oracle, PostgreSQL, MSSQL tienen mensajes distintos). En un engagement real eso determina todos los payloads siguientes."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consulta original que ejecuta la aplicación:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM products WHERE category = 'Gifts' AND released = 1
      - kind: "bullet"
        text: "Parámetro vulnerable: category en la URL"
      - kind: "bullet"
        text: "Tipo de inyección: directa en cláusula WHERE"
      - kind: "bullet"
        text: "Condición a eliminar: AND released = 1 (filtra productos no lanzados)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Entender la estructura de la query antes de lanzar payloads es fundamental. Sabes exactamente qué condición eliminar (`released = 1`) y cuál es el efecto esperado. Nunca lances payloads a ciegas."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Se utiliza el operador de comentario `--` para anular la condición `released = 1`:
          `Gifts' --`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20en%20la%20cl%C3%A1usula%20WHERE%20que%20permite%20la%20recuperaci%C3%B3n%20de%20datos%20ocultos/file-20260309153247543.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta ignora la condición de productos lanzados, mostrando resultados adicionales."

  - id: "exploit_2"
    num: ""
    content:
      - kind: "note"
        text: |
          Posteriormente, se aplica un OR lógico para forzar la inclusión de todos los registros:
          `Gifts' OR 1=1 --`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20en%20la%20cl%C3%A1usula%20WHERE%20que%20permite%20la%20recuperaci%C3%B3n%20de%20datos%20ocultos/file-20260309153317608.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta devuelve todas las categorías y productos, incluyendo los no lanzados."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Dos payloads, dos efectos distintos: `Gifts'--` es quirúrgico — elimina solo `released = 1`, sigue filtrando por categoría. `Gifts' OR 1=1--` rompe toda la cláusula WHERE. En producción, empieza siempre por el más contenido antes de escalar — menos impacto colateral."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Lab de tipo "recuperación de datos ocultos" — el acceso inicial equivale a visualizar información que la aplicación ocultaba intencionalmente (productos con `released = 0`).
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un pentest real esto puede exponer precios internos, productos en desarrollo, registros de otras empresas en sistemas multi-tenant, o datos de usuarios que deberían estar ocultos."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "Productos no lanzados visibles en la respuesta ✓"

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — lab de recuperación de datos, sin escalada de privilegios.

lessons:
  - 'Errores SQL visibles en la interfaz confirman inyección directa.'
  - 'Respuestas inesperadas al usar `''` o `--` son señales claras de vulnerabilidad.'
  - 'Resultados excesivos al aplicar `OR 1=1` evidencian falta de sanitización.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Restringir mensajes de error detallados en producción.'
  - 'Aplicar principio de mínimo privilegio en la base de datos.'
  - 'Monitorear patrones de consulta anómalos (ej. `OR 1=1`, `--`).'
---

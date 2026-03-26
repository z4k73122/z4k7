---
title: "Ataque UNION de inyección SQL, determinando el número de columnas devueltas por la consulta"
platform: "PortSwigger"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-determinando-el-numero-de-columnas-devueltas-por-la-consulta"
author: "Z4k7"
date: "2026-03-01"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "apprentice"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "ORDER BY"
  - "conteo de columnas"
  - "UNION SELECT NULL"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "UNION SELECT NULL,NULL,NULL-- devuelve fila adicional ✓"
summary: "La vulnerabilidad de SQL Injection en el filtro de categorías permite usar un ataque UNION para recuperar datos de otras tablas. Este lab cubre el paso 1 de la cadena UNION: determinar el número de columnas que devuelve la consulta original usando ORDER BY y UNION SELECT NULL. Se confirman 3 columnas.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Primero se valida la vulnerabilidad con un comentario SQL:
          `'--`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20en%20la%20cl%C3%A1usula%20WHERE%20que%20permite%20la%20recuperaci%C3%B3n%20de%20datos%20ocultos/file-20260309153214203.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación no bloquea la inyección y devuelve resultados válidos, confirmando la vulnerabilidad."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`'--` cumple dos funciones: confirma SQLi Y confirma que el motor acepta `--` como comentario. Si no funciona, prueba `'#` (MySQL) o `'-- ` (MySQL con espacio). La respuesta del motor ante el comentario es tu primer fingerprint."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Punto de inyección: parámetro category en la URL"
      - kind: "bullet"
        text: "Tipo: inyección en cláusula WHERE"
      - kind: "bullet"
        text: "Objetivo: determinar número exacto de columnas para construir UNION válido"
      - kind: "bullet"
        text: "Motor de BD: acepta -- → no MySQL puro"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El número de columnas es el prerequisito de todo ataque UNION. Sin este dato, cualquier `UNION SELECT` fallará con error de 'número diferente de columnas'. Este paso es obligatorio — nunca lo saltes."

  - id: "enum"
    num: "03"
    title: "Método 1 — ORDER BY"
    content:
      - kind: "note"
        text: |
          Se incrementa el índice hasta provocar error:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2,3-- → Éxito
          '+ORDER+BY+1,2,3,4-- → Error
      - kind: "note"
        text: |
          El error al ordenar por la columna 4 indica que la consulta tiene 3 columnas.
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20determinando%20el%20n%C3%BAmero%20de%20columnas%20devueltas%20por%20la%20consulta/file-20260309174745138.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación falla al ordenar por la columna 4, confirmando que existen solo 3 columnas."

  - id: "exploit_1"
    num: "04"
    title: "Método 2 — UNION SELECT NULL"
    content:
      - kind: "note"
        text: |
          Se prueban combinaciones con `NULL` para ajustar el número de columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL--         → Error
          ' UNION SELECT NULL,NULL--    → Error
          ' UNION SELECT NULL,NULL,NULL-- → Éxito ✓
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta con tres valores `NULL` se ejecuta correctamente, confirmando que la tabla devuelve 3 columnas."
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR esperado hasta encontrar el número correcto"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`NULL` es el valor más seguro para probar columnas — compatible con cualquier tipo de dato. ORDER BY es más silencioso; UNION NULL es más universal. Prefiere ORDER BY primero, UNION NULL como fallback. Si el motor fuera Oracle necesitarías `UNION SELECT NULL FROM dual--`."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Lab de tipo "determinación de estructura" — no requiere acceso a cuenta. El objetivo es confirmar el número de columnas para preparar ataques UNION posteriores.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "UNION SELECT NULL,NULL,NULL-- devuelve fila adicional ✓"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          ---

  - id: "privesc_1"
    num: "06"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — lab preparatorio para ataques UNION.

lessons:
  - 'Siempre iniciar con ORDER BY para determinar columnas antes de usar UNION.'
  - 'Documentar cada paso con capturas y queries para auditorías.'
  - 'Este es solo el primer paso — en labs posteriores se usará esta técnica para extraer datos sensibles.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar error handling para no mostrar mensajes SQL al cliente.'
  - 'Aplicar WAF con reglas específicas para detectar patrones de inyección.'
---

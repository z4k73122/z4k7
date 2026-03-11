---
title: "Vulnerabilidad de inyección SQL que permite eludir el inicio de sesión"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "vulnerabilidad-de-inyeccion-sql-que-permite-eludir-el-inicio-de-sesion"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "SQLI"
  - "Bypass"
  - "Login"
techniques:
  - "SQLI"
  - "Bypass"
  - "Login"
tools:
  - "Burpsuite"
flags_list:
  - label: "Aadministrador"
    value: "administrator"
  - label: "Paassword"
    value: "null"
summary: "La vulnerabilidad de SQL Injection ocurre cuando una aplicación web no valida ni sanitiza adecuadamente las entradas del usuario antes de enviarlas a una consulta SQL. Esto permite manipular la lógica de autenticación y acceder a recursos sin credenciales válidas.   En este caso, el ataque se centra en el login panel, donde la concatenación directa de parámetros en la consulta SQL permite evadir la validación de usuario y contraseña."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de inyección SQL en la función de inicio de sesión.
          Para resolver el laboratorio, realice un ataque de inyección SQL que inicie sesión en la aplicación como `administrator`usuario.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se detecta un formulario de login con campos `username` y `password`.
          Prueba inicial con el carácter `'` revela un error de sintaxis, confirmando la vulnerabilidad.
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyección%20SQL%20que%20permite%20eludir%20el%20inicio%20de%20sesión/file-20260309172421227.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "info"
        label: "Evidencia Técnica"
        text: "El panel de login acepta entradas sin sanitización. El uso de `'--` comenta el resto de la consulta, permitiendo autenticación sin validar la contraseña."

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Interactuamos con  con el login de la web y aplicamos un payload de SQL
          `administrator'--`
          Alternativa genérica:
          `' OR 1=1 --`
      - kind: "image"
        src: "assets/images/Vulnerabilidad%20de%20inyección%20SQL%20que%20permite%20eludir%20el%20inicio%20de%20sesión/file-20260309172711923.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "Aadministrador"
        value: "administrator"
      - label: "Paassword"
        value: "null"

lessons:
  - 'Probar caracteres especiales `''`  `"`  `--`.'
  - 'Validar respuestas del servidor.'
  - 'Documentar cada payload exitoso con evidencia visual.'
mitigation:
  - 'Implementar prepared statements (parametrización).'
  - 'Escapar y validar todas las entradas de usuario.'
  - 'Configurar WAF para detectar patrones de inyección `'' OR 1=1`.'
  - 'Aplicar principio de menor privilegio en cuentas de base de datos.'
---

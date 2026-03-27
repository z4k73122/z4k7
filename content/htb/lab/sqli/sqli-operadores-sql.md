---
title: "SQLi — Operadores SQL"
platform: "HackTheBox"
os: "Linux"
difficulty: "Easy"
ip: "154.57.164.72:31110"
slug: "sqli-operadores-sql"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "sqli"
  - "mysql"
techniques:
  - "Operadores SQL"
  - "AND"
  - "OR"
  - "NOT"
  - "COUNT"
tools:
  - "mysql"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Uso de operadores lógicos OR y NOT con COUNT(*) sobre la tabla titles para contar registros donde emp_no > 10000 OR título NO contiene 'engineer'.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Realizamos la conexión a la BD por medio de MYSQL
      - kind: "code"
        lang: "SQL"
        code: |
          mysql -u root -h 154.57.164.72 -P 31110 -p
          Enter password:
      - kind: "note"
        text: |
          Realizamos la consulta de la BD disponible
      - kind: "code"
        lang: "SQL"
        code: |
          MariaDB [(none)]> SHOW DATABASES;
          +--------------------+
          | Database           |
          +--------------------+
          | employees          |
          | information_schema |
          | mysql              |
          | performance_schema |
          | sys                |
          +--------------------+
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`COUNT(*)` es una de las funciones más útiles en SQLi — en Boolean-based blind puedes usarla para inferir datos: `AND (SELECT COUNT(*) FROM users WHERE username='admin')=1`."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Usamos la tabla de la consulta en este caso `employees` luego de esta en uso entramos a validar de nuevo las tablas disponible
          para extraer la información solicitada podremos aplicar el siguiente filtro
      - kind: "code"
        lang: "SQL"
        code: |
          MariaDB [employees]> select count(*) from titles where emp_no > 10000 or title != 'engineer';
          +----------+
          | count(*) |
          +----------+
          |      654 |
          +----------+
          1 row in set (0.008 sec)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Precedencia crítica: `AND` tiene mayor precedencia que `OR`. `A OR B AND C` se evalúa como `A OR (B AND C)`. En payloads SQLi un OR/AND mal parentizado puede devolver resultados incorrectos — siempre usa paréntesis explícitos en payloads complejos."

lessons:
  - '`OR` devuelve true si al menos una condición es verdadera'
  - '`!=` equivale a `NOT ... =`'
  - 'Precedencia: `NOT > AND > OR`'
mitigation:
  - 'Prepared statements para cualquier input en cláusula WHERE'
  - 'Validar tipos de datos en el backend'
---

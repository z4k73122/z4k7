---
title: "SQLi — MySQL Básico — Departamentos"
platform: "HackTheBox"
os: "Linux"
difficulty: "Easy"
ip: "154.57.164.72:31110"
slug: "sqli-mysql-basico-departamentos"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "sqli"
  - "mysql"
techniques:
  - "SQL básico"
  - "SELECT"
  - "SHOW DATABASES"
  - "SHOW TABLES"
tools:
  - "mysql"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Conexión directa a MariaDB para enumerar bases de datos, tablas y consultar el número de departamento del departamento 'Development'.  ---"
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
        text: "Las BDs del sistema son ruido — la BD custom `employees` es tu objetivo. En un engagement real, cualquier BD que no sea del motor es donde viven los datos del negocio. Verifica privilegios apenas te autenticas: `SHOW GRANTS FOR CURRENT_USER()`."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Usamos la tabla de la consulta en este caso `employees` luego de esta en uso entramos a validar de nuevo las tablas disponible
          Se confirma la disponibilidad de la tabla disponible
      - kind: "code"
        lang: "SQL"
        code: |
          Database changed
          MariaDB [employees]> show tables;
          +----------------------+
          | Tables_in_employees  |
          +----------------------+
          | current_dept_emp     |
          | departments          |
          | dept_emp             |
          | dept_emp_latest_date |
          | dept_manager         |
          | employees            |
          | salaries             |
          | titles               |
          +----------------------+
          8 rows in set (0.008 sec)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En SQLi real obtienes esto mismo via inyección: `SELECT table_name FROM information_schema.tables WHERE table_schema=database()`. Aprende los dos caminos — acceso directo y via payload."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Seleccionamos la parte que deseamos consultar con la siguiente consulta
      - kind: "code"
        lang: "SQL"
        code: |
          MariaDB [employees]> select * from departments;
          +---------+--------------------+
          | dept_no | dept_name          |
          +---------+--------------------+
          | d009    | Customer Service   |
          | d005    | Development        |
          | d002    | Finance            |
          | d003    | Human Resources    |
          | d001    | Marketing          |
          | d004    | Production         |
          | d006    | Quality Management |
          | d008    | Research           |
          | d007    | Sales              |
          +---------+--------------------+
          9 rows in set (0.008 sec)
      - kind: "note"
        text: |
          Con lo anterior ya contamos con la solicitud del laboratorio.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`SELECT dept_no FROM departments WHERE dept_name = 'Development'` habría sido más directo. En UNION injection el espacio es limitado — acostúmbrate a consultas específicas desde el inicio."

lessons:
  - 'Flujo estándar: `SHOW DATABASES` → `USE <db>` → `SHOW TABLES` → `SELECT *`'
  - 'Las BDs custom son siempre el objetivo prioritario'
mitigation:
  - 'Nunca exponer el puerto MySQL (3306) directamente a internet'
  - 'Principio de mínimo privilegio en usuarios de BD'
---

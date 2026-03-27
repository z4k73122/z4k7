---
title: "SQLi — LIKE AND — Búsqueda Empleados"
platform: "HackTheBox"
os: "Linux"
difficulty: "Easy"
ip: "154.57.164.72:31110"
slug: "sqli-like-and-busqueda-empleados"
author: "Z4k7"
date: "2026-03-27"
year: "2026"
status: "pwned"
tags:
  - "lab"
  - "sqli"
  - "mysql"
techniques:
  - "LIKE"
  - "AND"
  - "filtrado de resultados SQL"
tools:
  - "mysql"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Ejercicio del módulo SQL Injection Fundamentals de HTB Academy. Uso de LIKE y AND para encontrar el apellido del empleado cuyo nombre comienza con 'Bar' y fue contratado el 1 de enero de 1990.  ---"
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
        text: "Mismo entorno que el lab anterior. Un MySQL expuesto con credenciales débiles es hallazgo crítico por sí solo — documéntalo siempre en el reporte."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Usamos la tabla de la consulta en este caso `employees` luego de esta en uso entramos a validar de nuevo las tablas disponible
          Ya contamos con la tabla disponible procedemos a seccionar las filas requeridas con los datos solicitados podemos aplicar LIKE para la búsqueda de información
      - kind: "code"
        lang: "SQL"
        code: |
          MariaDB [employees]> select * from employees where first_name like 'bar%';
          +--------+------------+------------+-----------+--------+------------+
          | emp_no | birth_date | first_name | last_name | gender | hire_date  |
          +--------+------------+------------+-----------+--------+------------+
          |  10227 | 1953-10-09 | Barton     | Mitchem   | M      | 1990-01-01 |
          |  10395 | 1960-02-23 | Bartek     | Nastansky | F      | 1989-06-05 |
          |  10601 | 1956-08-10 | Barton     | Soicher   | F      | 1986-02-21 |
          +--------+------------+------------+-----------+--------+------------+
          3 rows in set (0.008 sec)
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "`LIKE 'bar%'` es case-insensitive en MySQL por defecto. En SQLi real, `LIKE 'admin%'` encuentra `admin`, `Admin`, `ADMIN` — útil para enumerar usuarios sin importar el casing."

  - id: "exploit_1"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Ya con la aplicación de este filtro tendremos un resumen solo solicitado para mayor precisión podríamos realizar otra consulta por medio de AND.
      - kind: "code"
        lang: "SQL"
        code: |
          select * from employees where first_name like 'bar%' and  hire_date like '1990%';
          +--------+------------+------------+-----------+--------+------------+
          | emp_no | birth_date | first_name | last_name | gender | hire_date  |
          +--------+------------+------------+-----------+--------+------------+
          |  10227 | 1953-10-09 | Barton     | Mitchem   | M      | 1990-01-01 |
          +--------+------------+------------+-----------+--------+------------+
          1 row in set (0.008 sec)
      - kind: "note"
        text: |
          Con la consulta anterior ya contamos con la información requerida.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La metodología broad → narrow es la base de extracción en Blind SQLi booleano: primero confirmas existencia de datos, luego refinas condición a condición hasta el valor exacto."

lessons:
  - '`LIKE ''patron%''` filtra por prefijo — `%` coincide con cualquier sufijo'
  - 'AND encadenado permite filtrado preciso con múltiples condiciones'
mitigation:
  - 'Prepared statements — nunca concatenar input del usuario en queries SQL'
  - 'Validar tipos de datos antes de usarlos en cláusulas LIKE'
---

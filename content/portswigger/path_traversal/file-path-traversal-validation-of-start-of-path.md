---
title: "File path traversal, validation of start of path"
platform: "PortSwigger"
os: "Linux"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "file-path-traversal-validation-of-start-of-path"
author: "Z4k7"
date: "2026-04-03"
year: "2026"
status: "pwned"
tags:
  - "Path_Traversal"
  - "Web_Vulnerability"
  - "BurpSuite"
  - "Bypass"
techniques:
  - "Path Traversal"
  - "Start Path Validation Bypass"
tools:
  - "Burp Suite"
  - "Browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy (LAB 5/6) que demuestra Start Path Validation Bypass — una técnica para bypassear defensas que validan que la ruta COMIENCE con una carpeta específica. La aplicación requiere que filename comience con /var/www/images. El bypass: incluir la carpeta base requerida + secuencias de traversal: /var/www/images/../../../etc/passwd. La validación pasa (comienza con /var/www/images) pero el traversal funciona. Técnica: Carpeta base requerida + secuencias de traversal. Cadena de ataque: Incluir path base esperado → Agregar traversal → Acceso a archivo.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de recorrido de ruta en la visualización de imágenes de productos.
          La aplicación transmite la ruta completa del archivo a través de un parámetro de solicitud y valida que la ruta proporcionada comience con la carpeta esperada.
          Para resolver el laboratorio, recupera el contenido del `/etc/passwd` archivo.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20start%20of%20path/file-20260402185324103.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Este lab es diferente — la aplicación requiere que envíes la ruta completa, no solo el nombre del archivo.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Carga de imágenes mediante parámetro dinámico"
      - kind: "bullet"
        text: "Probablemente requiere que la ruta comience con una carpeta específica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este lab es conceptualmente diferente a los anteriores. No es sobre 'filtrar patrones' — es sobre 'validar que cumpla un requisito'. Si el requisito es 'debe comenzar con `/var/www/images`', entonces la solución obvia es: incluir `/var/www/images` en tu payload. Pero ¿después qué? Debes agregar traversal. Es un bypass de validación de lógica, no de filtro."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20start%20of%20path/file-20260402185455586.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al ingresar en cualquier imagen:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20start%20of%20path/file-20260402185548904.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Análisis de la defensa:
          Intentamos `/etc/passwd` directamente:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=/etc/passwd
      - kind: "note"
        text: |
          Resultado: ❌ "Missing parameter 'filename'" — error de validación
          Esto indica que el servidor REQUIERE que el parámetro cumpla con una condición — probablemente debe comenzar con una ruta esperada.
          Deducción técnica:
          Si `/etc/passwd` falla pero es porque "falta parámetro", entonces:
      - kind: "bullet"
        text: "No es que el parámetro sea rechazado por traversal"
      - kind: "bullet"
        text: "Es que el parámetro no cumple algún REQUISITO específico"
      - kind: "bullet"
        text: "El requisito probable: debe comenzar con /var/www/images/"
      - kind: "note"
        text: |
          Esto es validación de lógica, no filtro de patrones.
      - kind: "callout"
        type: "warning"
        label: "Validación de Inicio de Ruta"
        text: "El código probablemente: ```python if not filename.startswith('/var/www/images'): return 'Error' ``` La defensa ASUME que si la ruta comienza con `/var/www/images`, entonces es segura. Pero el atacante puede incluir `../` DESPUÉS de esa carpeta base."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Enumeración técnica clave: Cuando obtienes error 'Missing parameter', probablemente hay validación de FORMATO o CONTENIDO requerido. Prueba diferentes formatos: `/etc/passwd`, `etc/passwd`, `/var/www/images/etc/passwd`, `/var/www/images/../../../etc/passwd`. Uno de ellos debería pasar."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Basado en que `/etc/passwd` falla con "Missing parameter", deducimos que se requiere una ruta específica.
          El payload obvio: incluir la carpeta base esperada + traversal:
      - kind: "code"
        lang: "BASH"
        code: |
          /var/www/images/../../../etc/passwd
      - kind: "note"
        text: |
          Modificamos el parámetro `filename` con el valor:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0ac400a6039bfa3e804cadea00f200d2.web-security-academy.net/image?filename=/var/www/images/../../../etc/passwd
      - kind: "note"
        text: |
          Proceso:
          1. El servidor recibe: `/var/www/images/../../../etc/passwd`
          2. Validación: ¿Comienza con `/var/www/images`? ✅ SÍ → Pasa validación
          3. Canonicalización/Procesamiento: La ruta se resuelve
          - `/var/www/images/` → sube 3 niveles con `../` → `/etc/`
          - Resultado: `/etc/passwd`
          4. Ejecución: Se abre `/etc/passwd`
          Validamos que se completa el laboratorio:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20start%20of%20path/file-20260402185850061.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado: ✅ Exitoso
          Por qué funciona:
          1. La validación comprueba el INICIO de la ruta, no el CONTENIDO
          2. `startswith('/var/www/images')` devuelve TRUE
          3. El backend procesa la ruta completamente → traversal funciona
          4. Validación pasada ≠ Seguridad asegurada
      - kind: "callout"
        type: "info"
        label: "Falsa Sensación de Seguridad"
        text: "El desarrollador pensó: 'Si la ruta comienza con `/var/www/images`, está confinada a ese directorio'. Pero la ruta `/var/www/images/../../../etc/passwd` comienza con `/var/www/images` TEXTUALMENTE. El traversal es válido dentro de la ruta. La defensa es incompleta."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Concepto clave descubierto: Hay una diferencia entre validar QUE EMPIECE y validar DÓNDE TERMINA. El desarrollador validó el inicio pero no canonicalizó la ruta antes de usarla. `startswith()` opera sobre strings literales, no sobre rutas resueltas. Por eso falla: compara strings, no conceptos de directorios."

  - id: "step5_1"
    num: "05"
    title: "Evidencia"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado usando validación de inicio de ruta + traversal
          El contenido del archivo fue descargado correctamente demostrando que validar solo el inicio de la ruta es insuficiente.

lessons:
  - 'Validación de inicio de ruta es débil: Verificar que `startswith()` es una validación de STRING, no de LÓGICA de directorios'
  - 'Canonicalización debe ocurrir ANTES de validación: Si resuelves la ruta a su forma canónica primero, LUEGO validas, entonces puedes detectar traversal'
  - 'Traversal + path base = bypass fácil: Si necesitan que incluyas la carpeta base, solo inclúyela y agrega traversal después'
  - 'Diferencia entre validación de formato vs. lógica: Validar que comience con X no te dice DÓNDE termina'
  - 'El orden de operaciones es crítico: (1) Canonicalizar, (2) Validar, (3) Usar — NO al revés'
mitigation: 'Completar mitigaciones recomendadas.'
---

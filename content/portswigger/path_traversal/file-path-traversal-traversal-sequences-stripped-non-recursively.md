---
title: "File path traversal, traversal sequences stripped non-recursively"
platform: "PortSwigger"
os: "Linux"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "file-path-traversal-traversal-sequences-stripped-non-recursively"
author: "Z4k7"
date: "2026-04-03"
year: "2026"
status: "pwned"
tags:
  - "Path_Traversal"
  - "Web_Vulnerability"
  - "Bypass"
techniques:
  - "Path Traversal"
  - "Nested Sequences"
  - "Non-Recursive Stripping"
tools:
  - "BurpSuite"
  - "Browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que demuestra Nested Sequences Bypass — una técnica para bypassear defensas que eliminan secuencias de traversal DE MANERA NO RECURSIVA. La aplicación filtra ../ pero solo una vez. Usando secuencias anidadas como ....//, después de eliminar .., queda ../. Técnica: Nested Sequences (....// → elimina .. → queda //... espera, debes ver cómo funciona exactamente en el lab). Cadena de ataque: Identificar filtro no-recursivo → Usar secuencias anidadas → Acceso a archivo.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de recorrido de ruta en la visualización de imágenes de productos.
          La aplicación elimina las secuencias de recorrido de ruta del nombre de archivo proporcionado por el usuario antes de utilizarlo.
          Para resolver el laboratorio, recupera el contenido del `/etc/passwd` archivo.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20non-recursively/file-20260402175441766.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nuevamente, una tienda con imágenes de productos cargadas dinámicamente. Esta vez, la defensa es más sofisticada que en el lab anterior.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Carga de imágenes mediante parámetro dinámico"
      - kind: "bullet"
        text: "Probablemente un filtro que elimina secuencias de traversal"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "A este punto (lab 3 de 6), ya sabes que: (1) sin defensa falla, (2) rutas absolutas bypasean filtro simple. Ahora tienes una defensa 'más inteligente' — ¿cuál es? El reconocimiento aquí es IDENTIFICAR QUÉ TIPO DE FILTRO tiene (no-recursivo? encoding? inicio de ruta?). Una vez identifies el tipo, ya sabes cuál bypass usar."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20non-recursively/file-20260402175510342.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al ingresar en cualquier imagen:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20non-recursively/file-20260402175533379.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Análisis de la defensa:
          Probamos `../../../etc/passwd` → NO funciona (como esperamos, hay filtro)
          Probamos `/etc/passwd` → ❌ NO funciona tampoco
          Esto es diferente de lab 2. La defensa no es solo bloquear `../` — también bloquea rutas absolutas.
          Deducción técnica:
          Si `../` falla Y `/etc/passwd` falla, entonces:
      - kind: "bullet"
        text: "No es un filtro simple de ../ (porque lab 2 usó eso)"
      - kind: "bullet"
        text: "No es validación de inicio de ruta (porque /etc/passwd es absoluta)"
      - kind: "bullet"
        text: "Podría ser: (a) filtro que elimina ../ recursivamente, (b) filtro que elimina ../ solo una vez (no-recursivo)"
      - kind: "note"
        text: |
          Si es (b), entonces `....//` quedaría como `../` después de eliminar el `..` interno.
      - kind: "callout"
        type: "warning"
        label: "Filtro No-Recursivo"
        text: "Un filtro no-recursivo: `....//` → elimina primer `..` → queda `..//`. NO es `../` porque hay un `/` extra. Esto es el error común: los devs escriben `string.replace('..', '')` una sola vez en lugar de hacerlo en un loop."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Enumeración técnica clave: Cuando tus bypasses obvios fallan, debes entender CÓMO FALLA: - ¿Error 403 (acceso denegado) o 404 (archivo no encontrado)? - ¿La respuesta es diferente entre `../` y `....//`? - ¿El tamaño de respuesta cambia? En BurpSuite, usa Repeater y observa EXACTAMENTE qué respuesta obtienes con cada payload. Eso te dice cuál defensa hay."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Basado en que `../` y `/` fallan, intentamos secuencias anidadas:
      - kind: "code"
        lang: "BASH"
        code: |
          ....//....//....//etc/passwd
      - kind: "note"
        text: |
          El concepto:
          1. La aplicación ve `....//`
          2. Elimina `..` (no recursivamente, solo una pasada)
          3. Queda `..//` (¡un `../` quedó!)
          4. Pero la aplicación ya hizo su sanitización — no vuelve a eliminar
          5. Luego la ruta se procesa como `../` normalmente
          Modificamos el parámetro `filename` con:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0a2600a904ad55988226662900180025.web-security-academy.net/image?filename=....//....//....//etc/passwd
      - kind: "note"
        text: |
          Validamos que se completa el laboratorio:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20non-recursively/file-20260402180543137.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado: ✅ Exitoso
          Por qué funciona:
          1. La aplicación filtra `../` eliminándolo UNA VEZ
          2. El payload `....//` = `..` + `.` + `//`
          3. Al eliminar `..`, queda `.//` (¡que es válido en rutas!)
          4. `.` significa "directorio actual"
          5. El resultado es navegar "un nivel arriba" de todas formas
      - kind: "callout"
        type: "info"
        label: "Lógica del Bypass"
        text: "Error común del desarrollador: ```python filename = filename.replace('..', '')  # Una sola pasada # Vulnerable a: ....// → después de replace → ..// ``` Defensa correcta: ```python while '..' in filename: filename = filename.replace('..', '')  # Recursivo, hasta que no haya .. # O mejor: validar whitelist en lugar de filtrar patrones ```"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Concepto crítico aprendido: Los filtros pattern-based (bloquear strings) son casi SIEMPRE bypasseables porque el atacante puede usar variaciones sintácticas del mismo ataque. `../` es un concepto (subir directorio), pero tiene muchas representaciones: `..//`, `....//`, `..%2f`, `..%c0%af`, etc. La defensa correcta no es bloquear representaciones — es arquitectura segura (whitelist, canonicalización, permisos)."

  - id: "step5"
    num: "05"
    title: "Evidencia"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado usando secuencias anidadas
          El contenido del archivo fue descargado correctamente demostrando que el filtro no-recursivo es insuficiente.

lessons:
  - 'Filtros pattern-based no-recursivos son vulnerables: Una sola pasada del filtro no es suficiente'
  - 'Variaciones sintácticas del ataque: `../`, `..//`, `....//`, `..%2f` son todas formas de "subir directorio"'
  - 'Entender CÓMO falla tu payload: Cada tipo de defensa falla diferente — enumera qué funciona y qué no'
  - 'Recursión importa: Si la defensa filtra patrones, debe hacerlo recursivamente o no filtrar en absoluto'
  - 'Pensar en el algoritmo: ¿Qué exactamente hace el código? ¿Una pasada? ¿Loop infinito? ¿Canonicalización?'
mitigation: 'Completar mitigaciones recomendadas.'
---

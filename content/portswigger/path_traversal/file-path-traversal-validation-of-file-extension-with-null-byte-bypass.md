---
title: "File path traversal, validation of file extension with null byte bypass"
platform: "PortSwigger"
os: "Linux"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "file-path-traversal-validation-of-file-extension-with-null-byte-bypass"
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
  - "Null Byte Injection"
  - "Extension Validation Bypass"
tools:
  - "BurpSuite"
  - "Browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy (LAB 6/6 - FINAL) que demuestra Null Byte Injection — la técnica más avanzada para Path Traversal. La aplicación valida que el filename TERMINE con .jpg. Usando null byte (%00), el atacante trunca la validación: ../../../etc/passwd%00.jpg → el null byte termina la string en C/C++ → se lee /etc/passwd → .jpg nunca se evalúa. Técnica: Null Byte Bypass de validación de extensión. Cadena de ataque: Identificar validación de extensión → Usar null byte para truncar → Acceso a archivo.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de recorrido de ruta en la visualización de imágenes de productos.
          La aplicación valida que el nombre de archivo proporcionado termine con la extensión de archivo esperada.
          Para resolver el laboratorio, recupera el contenido del `/etc/passwd` archivo.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20file%20extension%20with%20null%20byte%20bypass/file-20260402190212911.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Este es el último lab de la serie Path Traversal. La defensa es más restrictiva: valida TANTO la ruta como la EXTENSIÓN del archivo.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Carga de imágenes mediante parámetro dinámico"
      - kind: "bullet"
        text: "Probablemente requiere extensión específica (.jpg, .png, etc.)"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "A este punto (lab 6 de 6), ya has dominado 5 tipos de bypass diferentes. Este es el 6to. La pregunta es: ¿cómo bypasseas una validación que verifica TANTO que existe traversal COMO que la extensión es correcta? La respuesta es un carácter especial que la mayoría de lenguajes respeta: el null byte."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20file%20extension%20with%20null%20byte%20bypass/file-20260402190301931.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al ingresar en cualquier imagen:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20file%20extension%20with%20null%20byte%20bypass/file-20260402190402998.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Análisis de la defensa:
          Intentamos el payload básico:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=../../../etc/passwd
      - kind: "note"
        text: |
          Resultado: ❌ No such file
          Esto indica que la aplicación no solo filtra traversal — también requiere extensión específica.
          Deducción técnica:
          Si el servidor requiere extensión, probablemente está validando:
      - kind: "code"
        lang: "PYTHON"
        code: |
          if not filename.endswith('.jpg'):
              return "Error: Invalid extension"
      - kind: "note"
        text: |
          Pero si el backend usa C/C++ `fopen()`, hay un vector: null byte termina strings automáticamente.
      - kind: "callout"
        type: "warning"
        label: "Null Byte Exploitation"
        text: "En C/C++, strings terminan con `\0` (null byte). Si validas extensión ANTES de procesar el null byte, puedes bypassear: - Input: `../../../etc/passwd%00.jpg` - Validación ve: termina con `.jpg` ✅ - C function `open()` recibe: `../../../etc/passwd` (lee hasta el null byte, ignora `.jpg`) - Resultado: se abre `/etc/passwd`, no `passwd.jpg`"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Enumeración técnica clave: La validación de extensión es probablemente client-side o server-side. Si es client-side (JavaScript), puedes bypassear modificando el HTML. Si es server-side (este caso), debes usar null byte. El null byte funciona SOLO en lenguajes que respetan `\0` como terminador (C, C++, PHP). En Python moderno, no funciona."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Intentamos primero sin null byte:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=../../../etc/passwd
      - kind: "note"
        text: |
          Resultado: ❌ No funciona — requiere extensión
          Entonces, intentamos null byte injection:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=../../../etc/passwd%00.jpg
      - kind: "note"
        text: |
          Explicación del payload:
          1. El servidor recibe: `../../../etc/passwd%00.jpg` (URL-encoded)
          2. Se decodifica a: `../../../etc/passwd[NULL].jpg`
          3. Validación: Verifica que terminé con `.jpg` ✅ (sí, porque hay `.jpg` después)
          4. Backend C/C++: Usa `fopen()` o similar que respeta null byte como terminador
          5. `fopen("../../../etc/passwd\0.jpg")` → ignora todo después del `\0` → abre `/etc/passwd`
          Modificamos el parámetro `filename` con el valor:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0adf006304da545f83371e0600f80047.web-security-academy.net/image?filename=../../../etc/passwd%00.jpg
      - kind: "note"
        text: |
          Si ingresamos entre los directorios normalmente no permite acceso mostrando `No such file`. Pero si enviamos la extensión `.jpg` con null byte, se reconoce:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20validation%20of%20file%20extension%20with%20null%20byte%20bypass/file-20260402190907405.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado: ✅ Exitoso
          Con el anterior nos permite ingresar sin problema.
          Por qué funciona:
          1. Validación de extensión ocurre primero — ve `.jpg` al final
          2. Backend usa función C/C++ que respeta null byte
          3. String termina en null byte — todo después se ignora
          4. Archivo leído es `/etc/passwd` — no `passwd.jpg`
      - kind: "callout"
        type: "info"
        label: "Null Byte en Contexto"
        text: "Este vector específico (null byte en extensión) se corrigió en PHP 5.3.4+. Pero en aplicaciones antiguas o que usan C/C++ directamente, sigue siendo válido. Ilustra un concepto más amplio: discrepancia entre capas de procesamiento — validación ve algo diferente a lo que ejecuta el backend."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Concepto final de Path Traversal: Los 6 labs te muestran que NO es una vulnerabilidad que se puede 'parcheaaar' con un filtro. Cada filtro que viste fue bypasseado porque Path Traversal es fundamentalmente un problema de arquitectura, no de input validation. La defensa correcta es: (1) whitelist de archivos permitidos, (2) canonicalización ANTES de cualquier lógica, (3) permisos mínimos en el SO. Un simple filtro NUNCA es suficiente."

  - id: "flag_01"
    type: "flag"
    flag_items:

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado usando null byte bypass
          El contenido del archivo fue descargado correctamente demostrando que la validación de extensión se puede bypassear con null byte.
          ---

lessons:
  - 'Null byte es un carácter terminador en C/C++: `\0` marca el final de una string automáticamente'
  - 'Validación de extensión puede ser insuficiente: Si el backend usa funciones de C/C++, el null byte lo trunca'
  - 'URL-decoded `%00` es crítico: El null byte debe estar en la ruta final, no en la entrada'
  - 'La arquitectura derrota la validación: Ningún filtro de input soluciona Path Traversal — necesitas arquitectura segura'
  - 'La progresión de defensa que viste: Cada "defensa" fue un nivel más de validación, pero todas fueron bypasseables porque el concepto base es incorrecto'
mitigation: 'Completar mitigaciones recomendadas.'
---

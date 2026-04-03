---
title: "File path traversal, traversal sequences stripped with superfluous URL-decode"
platform: "PortSwigger"
os: "Linux"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "file-path-traversal-traversal-sequences-stripped-with-superfluous-url-decode"
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
  - "URL Encoding"
  - "Double URL Encoding"
tools:
  - "Burp Suite"
  - "Browser"
  - "CyberChef"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que demuestra URL Encoding Bypass con Double Encoding — una técnica para bypassear defensas que decodifican entrada una sola vez. La aplicación filtra ../ Y decodifica URL de entrada. Usando double encoding (%252e%252e%252f), el servidor decodifica una vez → %2e%2e%2f, pero el filtro ya pasó. Luego, la segunda decodificación en el backend → ../ funciona. Técnica: Double URL Encoding. Cadena de ataque: Identificar doble decode → Usar %252e en lugar de %2e → Acceso a archivo.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de recorrido de ruta en la visualización de imágenes de productos.
          La aplicación bloquea las entradas que contienen secuencias de recorrido de ruta. A continuación, realiza una decodificación URL de la entrada antes de utilizarla.
          Para resolver el laboratorio, recupera el contenido del `/etc/passwd` archivo.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20with%20superfluous%20URL-decode/file-20260402181038437.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nuevamente, una tienda con imágenes de productos. Esta defensa es diferente a las anteriores — combina filtrado + decodificación.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Carga de imágenes mediante parámetro dinámico"
      - kind: "bullet"
        text: "Probablemente filtro + decodificación URL"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En este lab, tienes una discrepancia de procesamiento: el servidor filtra ANTES de decodificar. Esto abre un vector: si codificas el payload, el filtro no lo ve. Pero después, el servidor lo decodifica. Este es el concepto clave: diferencia entre qué ve el filtro vs. qué ve el ejecutor."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20with%20superfluous%20URL-decode/file-20260402181058936.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al ingresar en cualquier imagen:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20with%20superfluous%20URL-decode/file-20260402181159558.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Análisis de la defensa:
          Probamos los bypasses anteriores:
      - kind: "bullet"
        text: "../../../etc/passwd → ❌ No funciona (filtro básico)"
      - kind: "bullet"
        text: "/etc/passwd → ❌ No funciona (filtro avanzado)"
      - kind: "bullet"
        text: "....//....//....//etc/passwd → ❌ No funciona (filtro no-recursivo)"
      - kind: "note"
        text: |
          Esto indica que la defensa es más sofisticada. No es solo un filtro de patrones — probablemente también decodifica antes de usar.
          Deducción técnica:
          Si TODOS los payloads fallan, incluido anidadas, entonces:
      - kind: "bullet"
        text: "El filtro bloquea múltiples patrones"
      - kind: "bullet"
        text: "O hay decodificación involucrada"
      - kind: "note"
        text: |
          La solución: codificar el payload para que el filtro no lo vea, pero después se decodifique en el backend.
      - kind: "callout"
        type: "warning"
        label: "Discrepancia de Procesamiento"
        text: "El servidor: (1) Recibe input URL-encoded → (2) Filtra patrones → (3) Decodifica → (4) Accede archivo. Si codificas el payload, el filtro ve `%2e%2e%2f` (no es `../`), así que lo permite. Luego, el decode lo convierte en `../` y funciona."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Técnica de enumeración aquí: usar herramientas como CyberChef o Burp Decoder para experimentar con encoding. No es suficiente SABER que existe encoding — debes PROBAR diferentes variantes: `%2e%2e%2f` (simple), `%252e%252e%252f` (doble), `%c0%ae` (non-standard), etc."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Probamos encoding simple (%URL encode):
      - kind: "code"
        lang: "BASH"
        code: |
          filename=%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
      - kind: "note"
        text: |
          Que en decodificado es:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=../../../etc/passwd
      - kind: "note"
        text: |
          Payload URL completo:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0ac400600390f1cb8151a8aa00e4003f.web-security-academy.net/image?filename=%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd
      - kind: "note"
        text: |
          Resultado: ❌ No such file
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20with%20superfluous%20URL-decode/file-20260402181839642.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Esto significa que el filtro aún ve el patrón después de decodificación. La defensa es: filtro DESPUÉS de decodificar, no antes.
          Intentamos double URL encoding (%252e en lugar de %2e):
      - kind: "code"
        lang: "BASH"
        code: |
          %252E%252E%252F%252E%252E%252F%252E%252E%252Fetc%252Fpasswd
      - kind: "note"
        text: |
          Proceso de decodificación:
          1. Primera decodificación (por servidor/navegador): `%252e` → `%2e`
          2. Filtro ve: `%2e%2e%2f` (NO es `../`, es texto literal)
          3. Filtro lo permite
          4. Segunda decodificación (por la aplicación backend): `%2e` → `.`
          5. Resultado final: `../../../etc/passwd` funciona
          Payload URL completo:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0ac400600390f1cb8151a8aa00e4003f.web-security-academy.net/image?filename=%252E%252E%252F%252E%252E%252F%252E%252E%252Fetc%252Fpasswd
      - kind: "note"
        text: |
          Resultado: ✅ Exitoso
          Con el anterior nos permite ingresar sin problema:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20stripped%20with%20superfluous%20URL-decode/file-20260402182345045.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Por qué funciona:
          1. El servidor recibe: `%252E%252E%252F...`
          2. Primera decodificación (URLdecoder estándar): `%252E` → `%2E`
          3. El filtro compara contra patrones (`../`, `..\\`, etc.) → no encuentra coincidencia en `%2E%2E%2F`
          4. Filtro: "Ok, esto es seguro"
          5. La aplicación decodifica NUEVAMENTE: `%2E` → `.`
          6. Resultado: `../../../etc/passwd` se ejecuta
      - kind: "callout"
        type: "info"
        label: "Doble Decodificación"
        text: "El problema: el desarrollador asumió que decodificar UNA VEZ es suficiente. Pero si hay múltiples puntos de decodificación (servidor → filtro → aplicación), cada uno decodifica. El atacante aprovecha esto codificando múltiples veces."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Aprendizaje crítico: Este lab demuestra que los filtros deben operar sobre datos DESPUÉS de toda transformación, NO antes. La defensa correcta sería: (1) Decodificar entrada → (2) Canonicalizar → (3) Filtrar o validar whitelist. Hacer esto en orden opuesto abre vectores de bypass."

  - id: "step5_1"
    num: "05"
    title: "Evidencia"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado usando double URL encoding
          El contenido del archivo fue descargado correctamente demostrando que el filtro de decodificación simple es insuficiente contra double encoding.

lessons:
  - 'URL encoding tiene múltiples niveles: El navegador decodifica, el servidor decodifica, la aplicación decodifica — cada uno puede ser un punto vulnerable'
  - 'Orden de operaciones es crítico: Si el filtro se aplica DESPUÉS de decodificar, entonces el encoding lo evita'
  - 'Double encoding es una técnica estándar: `%252e` es `%2e` codificado — usar esta técnica cuando simple encoding falla'
  - 'Herramientas son esenciales: CyberChef o Burp Decoder para experimentar con encoding/decoding iterativamente'
  - 'Discrepancia de procesamiento: El concepto general es que el atacante explota diferencias entre cómo procesa el filtro vs. cómo procesa el ejecutor'
mitigation: 'Completar mitigaciones recomendadas.'
---

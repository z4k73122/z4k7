---
title: "File path traversal, traversal sequences blocked with absolute path bypass"
platform: "PortSwigger"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "file-path-traversal-traversal-sequences-blocked-with-absolute-path-bypass"
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
  - "Absolute Path Bypass"
  - "Rutas Absolutas"
tools:
  - "BurpSuite"
  - "Browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que demuestra Absolute Path Bypass — una técnica para bypassear defensas que bloquean secuencias de recorrido (../). La aplicación filtra ../ pero acepta rutas absolutas desde la raíz del sistema (/etc/passwd). Técnica: Absolute Path Bypass usando ruta absoluta en lugar de relativa. Cadena de ataque: Identificar filtro de ../ → Intentar ruta absoluta → Acceso directo a archivo sin traversal.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de recorrido de ruta en la visualización de imágenes de productos.
          La aplicación bloquea las secuencias de recorrido, pero trata el nombre de archivo proporcionado como relativo a un directorio de trabajo predeterminado.
          Para resolver el laboratorio, recupera el contenido del `/etc/passwd` archivo.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20blocked%20with%20absolute%20path%20bypass/file-20260402174705947.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          La aplicación nuevamente muestra una tienda con imágenes de productos cargadas dinámicamente. La estructura es similar al lab anterior, pero esta vez con defensas adicionales.
          Hallazgos iniciales:
      - kind: "bullet"
        text: "Carga de imágenes mediante parámetro dinámico"
      - kind: "bullet"
        text: "Posible protección contra secuencias de recorrido"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En este lab, a diferencia del anterior, la aplicación implementó una defensa: bloquea `../`. Pero la defensa es incompleta — solo bloquea secuencias relativas, no rutas absolutas. Este es el patrón clave: los devs a menudo piensan en las amenazas obvias (secuencias de traversal) pero olvidan las alternativas (rutas absolutas)."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente de la página para validar la estructura:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20blocked%20with%20absolute%20path%20bypass/file-20260402174738277.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Al ingresar en cualquier imagen, accedemos a la URL:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20blocked%20with%20absolute%20path%20bypass/file-20260402174810092.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Descubrimientos:
      - kind: "bullet"
        text: "El parámetro filename es modificable"
      - kind: "bullet"
        text: "El endpoint trata el filename como relativo a un directorio base"
      - kind: "bullet"
        text: "La aplicación probablemente filtra ../ y secuencias similares"
      - kind: "note"
        text: |
          Análisis de la defensa:
          La aplicación bloquea caracteres/patrones que identifica como peligrosos: `../`, `..\\`, etc. Pero NO valida el tipo de ruta — acepta tanto rutas relativas como rutas absolutas.
      - kind: "callout"
        type: "warning"
        label: "Defensa Incompleta"
        text: "El filtro bloquea secuencias de traversal (`../`) pero permite rutas absolutas (`/`). Esta es una falsa sensación de seguridad — el atacante simplemente cambia de estrategia."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La enumeración técnica aquí fue: probar `../` → observar que falla → preguntarse '¿qué alternativa existe?' → recordar que `/etc/passwd` es una ruta absoluta válida en Unix. Este pensamiento lateral es lo que diferencia un tester competente de uno promedio."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Intentamos primero la técnica básica del lab anterior (secuencias de traversal):
      - kind: "code"
        lang: "BASH"
        code: |
          filename=../../../etc/passwd
      - kind: "note"
        text: |
          Resultado: ❌ Bloqueado por la defensa
          Entonces, intentamos con una ruta absoluta desde la raíz del sistema de archivos:
      - kind: "code"
        lang: "BASH"
        code: |
          filename=/etc/passwd
      - kind: "note"
        text: |
          Modificamos el parámetro `filename` con el valor:
      - kind: "code"
        lang: "BASH"
        code: |
          https://0a0b00040313288181eb89f9002b001c.web-security-academy.net/image?filename=/etc/passwd
      - kind: "note"
        text: |
          Resultado: ✅ Exitoso
          Validamos que se completa el laboratorio accediendo a dicha ruta:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20traversal%20sequences%20blocked%20with%20absolute%20path%20bypass/file-20260402174841450.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Por qué funciona:
          1. La aplicación bloquea `../` (secuencias relativas)
          2. Pero NO valida si la ruta comienza con `/` (absoluta)
          3. El servidor recibe `/etc/passwd` como parámetro
          4. Sin validación adicional, acepta la ruta absoluta
          5. El proceso web puede leer `/etc/passwd` (permisos globales)
      - kind: "callout"
        type: "info"
        label: "Discrepancia de Parsing"
        text: "La defensa asume que el desarrollador pensó: 'Si no hay `../`, es seguro'. Pero eso es incorrecto. La seguridad debe estar en '¿dónde puedo leer?' no en '¿qué patrones puedo detectar?'. Las rutas absolutas responden a la primera pregunta directamente."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Concepto clave descubierto: Hay una diferencia crítica entre bloquear patrones maliciosos (WAF-style) vs. validar acceso permitido (whitelist-style). El filtro aquí es pattern-based. El bypass correcto es validation-based. Recuerda esto cuando llegues a los labs con WAF — mismo principio."

  - id: "step5_1"
    num: "05"
    title: "Evidencia"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado usando ruta absoluta
          El contenido del archivo fue descargado correctamente demostrando que la defensa contra secuencias de traversal es insuficiente.

lessons:
  - 'Las defensas pattern-based son incompletas: Bloquear `../` no es suficiente si no se valida dónde el usuario puede leer'
  - 'Rutas absolutas vs. relativas: Unix acepta ambas. Si la app no valida el tipo, es vulnerable igual'
  - 'La profundidad de directorios NO importa con rutas absolutas: `/etc/passwd` es directo, no necesita calcular niveles'
  - 'Pensar lateralmente: Si un bypass no funciona, probar alternativas con el mismo objetivo (acceso a archivo)'
  - 'Diferencia entre permiso de lectura y validación de ruta: El servidor CAN leer `/etc/passwd` (permiso del SO). La app DEBE validar si DEBERÍA leerlo'
mitigation: 'Completar mitigaciones recomendadas.'
---

---
title: "File path traversal, simple case"
platform: "PortSwigger"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "file-path-traversal-simple-case"
author: "Z4k7"
date: "2026-04-03"
year: "2026"
status: "pwned"
tags:
  - "Path_Traversal"
  - "Web_Vulnerability"
techniques:
  - "Path Traversal"
  - "Directory Traversal"
  - "Secuencias de Recorrido Básicas"
tools:
  - "BurpSuite"
  - "Browser"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que demuestra Path Traversal simple — una vulnerabilidad de lectura de archivos arbitrarios sin validación. La aplicación permite modificar el parámetro filename para acceder a /etc/passwd usando secuencias de recorrido (../). Técnica: Path Traversal básico. Cadena de ataque: Request HTTP → Modificación de parámetro → Acceso a archivo del sistema.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Recuperar el contenido del archivo `/etc/passwd` explotando una vulnerabilidad de Path Traversal en la visualización de imágenes de productos.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Accedemos al laboratorio y observamos una aplicación web de tienda que muestra imágenes de productos:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20simple%20case/file-20260402173440777.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          La aplicación carga imágenes dinámicamente mediante un parámetro en la URL. Al inspeccionar la estructura, encontramos que hay un endpoint que sirve imágenes basado en parámetros de entrada.
          Hallazgos:
      - kind: "bullet"
        text: "La aplicación tiene un mecanismo de carga de imágenes de productos"
      - kind: "bullet"
        text: "Las imágenes se cargan dinámicamente desde el servidor"
      - kind: "bullet"
        text: "No hay validación aparente del parámetro de entrada"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En Path Traversal, el reconocimiento es identificar DÓNDE se acepta entrada del usuario que afecta acceso a archivos. En este lab, es obvio (la carga de imágenes), pero en aplicaciones reales puede estar en: parámetros GET/POST, headers, cookies, rutas URL, etc. Busca cualquier lugar donde el usuario control un 'nombre de archivo' o 'ruta'."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Consultamos el código fuente de la página para validar la estructura de las URLs y parámetros:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20simple%20case/file-20260402173736550.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Descubrimientos:
      - kind: "bullet"
        text: "El código HTML revela que las imágenes se cargan mediante un parámetro dinámico"
      - kind: "bullet"
        text: "La URL estructura es accesible y modificable"
      - kind: "bullet"
        text: "El parámetro filename controla qué archivo se carga desde el servidor"
      - kind: "note"
        text: |
          Al hacer click en una imagen, la URL muestra:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20simple%20case/file-20260402173920846.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "warning"
        label: "Parámetro de Archivo Identificado"
        text: "El parámetro `filename` controla directamente qué archivo se sirve. Sin validación de ruta, esto es vulnerable a Path Traversal."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La enumeración en Path Traversal es confirmar EXACTAMENTE cuál es el parámetro vulnerable y cómo se pasa (GET, POST, URL path, etc.). En este caso, `filename` en la URL query string. Con eso confirmado, puedes proceder directamente a explotación."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Modificamos el parámetro `filename` con secuencias de recorrido de directorio (`../`) para acceder a archivos del sistema:
      - kind: "code"
        lang: "HTTP"
        code: |
          GET /loadImage?filename=../../../etc/passwd HTTP/1.1
      - kind: "note"
        text: |
          La secuencia `../../../` navega tres niveles hacia arriba en la estructura de directorios:
      - kind: "bullet"
        text: "../ = subir un nivel (si está en /var/www/images/)"
      - kind: "bullet"
        text: "../ = estar en /var/www/"
      - kind: "bullet"
        text: "../ = estar en /var/"
      - kind: "bullet"
        text: "../ = estar en / (raíz del sistema)"
      - kind: "note"
        text: |
          Luego accedemos a `/etc/passwd` desde la raíz.
          Payload exacto:
      - kind: "code"
        lang: "BASH"
        code: |
          ../../../etc/passwd
      - kind: "note"
        text: |
          Validamos que se completa el laboratorio accediendo a la ruta:
      - kind: "image"
        src: "assets/images/File%20path%20traversal,%20simple%20case/file-20260402174112872.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Resultado:
          ✅ Se obtiene acceso al archivo `/etc/passwd` del servidor
          ✅ Se puede leer información de usuarios del sistema
      - kind: "callout"
        type: "info"
        label: "Path Traversal Simple"
        text: "Este es el bypass más básico — sin protecciones, sin encoding, sin validaciones. Es el 'default' vulnerable. Por eso existen los otros 5 labs: para cuando los devs intentan protegerse pero fallan."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Lo que hiciste bien: identificación rápida del parámetro vulnerable y explotación directa. Lo que falta probar: ¿qué pasa si cambias el número de `../`? ¿4 niveles? ¿2 niveles? Entender la profundidad exacta de directorios es crítico para Path Traversal en máquinas reales donde la estructura no es obvia. En BurpSuite, usa Repeater para iterar rápido: modifica el parámetro, envía, analiza response. Si no sale el archivo, agrega otro `../`."

  - id: "step5"
    num: "05"
    title: "Evidencia"
    content:
      - kind: "note"
        text: |
          Laboratorio completado: ✅ Acceso a `/etc/passwd` verificado
          El contenido del archivo fue descargado correctamente demostrando acceso a archivos arbitrarios del servidor.

lessons:
  - 'Path Traversal requiere entrada sin sanitizar: Si la aplicación hubiera validado que `filename` NO contiene `../`, el ataque falla'
  - 'La profundidad de directorios es variable: Diferentes servidores y configuraciones requieren diferentes números de `../`'
  - 'Sin validación = acceso completo al árbol de directorios: Una vez confirmada la vulnerabilidad, puedes leer cualquier archivo legible por el proceso web'
  - 'Los archivos del sistema más valiosos son los primeros objetivos: `/etc/passwd`, `/etc/shadow` (si tienes permisos), archivos de configuración de la app'
mitigation: 'Completar mitigaciones recomendadas.'
---

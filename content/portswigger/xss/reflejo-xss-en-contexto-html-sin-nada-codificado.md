---
title: "Reflejó XSS en contexto HTML sin nada codificado"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "reflejo-xss-en-contexto-html-sin-nada-codificado"
author: "Z4k7"
date: "2026-03-06"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "CSP"
techniques:
  - "XSS"
  - "Reflected"
  - "CSP"
tools:
  - "Burpsuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Los scripts entre sitios reflejados (o XSS) surgen cuando una aplicación recibe datos en una solicitud HTTP e incluye esos datos dentro de la respuesta inmediata de forma insegura. Supongamos que un sitio web tiene una función de búsqueda que recibe el término de búsqueda proporcionado por el usuario en un parámetro de URL:  https://insecure-website.com/search?term=gift"
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio presenta una vulnerabilidad de Cross-Site Scripting (XSS) reflejado en la funcionalidad de búsqueda.
          El vector de ataque consiste en inyectar código JavaScript en la entrada del buscador, el cual es reflejado sin sanitización en la respuesta HTML.
          El objetivo es ejecutar la función `alert()` para demostrar la explotación

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Se realiza validación del entorno de la web
      - kind: "image"
        src: "assets/images/Reflejó%20XSS%20en%20contexto%20HTML%20sin%20nada%20codificado/file-20260309182031115.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Se observó que el texto ingresado se refleja en un `<h1>` sin sanitización.

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Al ingresar el siguiente payload en el buscador, el navegador ejecuta el `alert`.
      - kind: "code"
        lang: "JS"
        code: |
          <script>alert(1)</script>
      - kind: "image"
        src: "assets/images/Reflejó%20XSS%20en%20contexto%20HTML%20sin%20nada%20codificado/file-20260309182204624.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Este laboratorio demuestra un caso clásico de XSS reflejado.'
  - 'Aunque el payload es trivial, en entornos reales los filtros pueden requerir técnicas de evasión más avanzadas.'
  - 'Recordar siempre: la validación debe hacerse en el servidor y el cliente, pero la sanitización en el servidor es crítica.'
mitigation:
  - 'Implementar output encoding (ej. `htmlspecialchars` en PHP).'
  - 'Usar librerías de sanitización seguras.'
  - 'Validar y restringir entradas del usuario.'
  - 'Aplicar Content Security Policy (#CSP).'
---

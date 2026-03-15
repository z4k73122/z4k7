---
title: "Almacenó XSS en contexto HTML sin nada codificado"
platform: "PortSwigger"
os: "Windows"
difficulty: "Easy"
ip: "10.10.10.XXX"
slug: "almaceno-xss-en-contexto-html-sin-nada-codificado"
author: "Z4k7"
date: "2026-03-15"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Stored"
  - "WebSecurity"
  - "PentestingLab"
  - "PortSwigger"
  - "WebLab"
techniques:
  - "XSS"
  - "Stored"
  - "WebSecurity"
  - "PentestingLab"
  - "PortSwigger"
tools:
  - "Completar herramientas"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Descripción del vector de ataque."
steps:

  - id: "exploit"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Ejecutar un `alert(1)` mediante un comentario malicioso en el blog.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "bullet"
        text: "Se probó la funcionalidad de comentarios enviando etiquetas simples ().![[Pasted image 20260212173035.png]]"
      - kind: "bullet"
        text: "Se observó que el contenido se refleja en la página sin sanitización.![[Pasted image 20260212173243.png]]"

  - id: "exploit"
    num: "03"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Payload utilizado:
      - kind: "code"
        lang: "HTML"
        code: |
          <script>alert(1);</script>
      - kind: "note"
        text: |
          • 	Al enviar este payload como comentario, el código se almacena en la base de datos.
          • 	Cada vez que se carga la publicación, el navegador ejecuta el .
          • 	Evidencia:
          ![[Pasted image 20260212173343.png]]
          ![[Pasted image 20260212173459.png]]

  - id: "step4"
    num: "04"
    title: "Evidencia"
    content:
      - kind: "bullet"
        text: "Captura del alert(1) ejecutado al cargar la publicación."
      - kind: "bullet"
        text: "Confirmación de vulnerabilidad XSS almacenado."

  - id: "flag_01"
    type: "flag"
    flag_items:

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "bullet"
        text: "Reflejo directo de comentarios en el DOM sin sanitización."
      - kind: "bullet"
        text: "Ausencia de validación en la entrada de texto."

lessons:
  - 'Este laboratorio demuestra un caso clásico de XSS almacenado, más crítico que el reflejado.'
  - 'Gotcha técnico: aunque el payload es trivial, en entornos reales los atacantes pueden usar técnicas de evasión avanzadas para persistir.'
  - 'Recordar siempre: la sanitización debe aplicarse tanto al almacenar como al mostrar datos.'
mitigation:
  - 'Implementar output encoding en la capa de presentación.'
  - 'Usar librerías de sanitización seguras para comentarios.'
  - 'Validar y restringir entradas del usuario (whitelisting).'
  - 'Aplicar Content Security Policy (CSP).'
  - 'Revisar almacenamiento para evitar persistencia de código malicioso.'
---

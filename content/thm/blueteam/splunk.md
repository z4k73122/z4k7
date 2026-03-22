---
title: "Splunk"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.65.154.38"
slug: "splunk"
author: "Z4k7"
date: "2026-03-22"
year: "2026"
status: "pwned"
tags:
  - "splunk"
  - "BlueTeam"
  - "siem"
techniques:
  - "splunk"
  - "BlueTeam"
  - "siem"
tools:
  - "splunk"
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
          Validar la consultar información relevante frente a la investigación de un caso de acceso

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Contamos con accesos a la interfaz de splunk  por medio de la IP `10.65.154.38` ya contamos con el acceso procedemos a descargar el archivo JSON  dicho archivo contiene la información del laboratorio
      - kind: "image"
        src: "assets/images/Splunk/file-20260322133020162.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Par interactuar con los datos es necesario acceder o cargar lo archivos en el apartado de `Add Data` -> `Upload` -> `Select File`

  - id: "step3"
    num: "03"
    title: "Instrucciones"
    content:
      - kind: "note"
        text: |
          Para cargar los datos correctamente, debe seguir cinco pasos, que se explican a continuación:
      - kind: "bullet"
        text: "Seleccionar origen: Elija el archivo de registro y el origen de datos."
      - kind: "image"
        src: "assets/images/Splunk/file-20260322133629847.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Seleccione el tipo de origen: seleccione qué tipo de registros se están ingiriendo, por ejemplo,JSON , syslog."
      - kind: "bullet"
        text: "Configuración de entrada: Seleccione el índice donde se guardarán estos registros y el NOMBRE DE HOST que se asociará a los registros."
      - kind: "image"
        src: "assets/images/Splunk/file-20260322133701358.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Splunk/file-20260322133721541.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Revisión: Revise todas las configuraciones."
      - kind: "image"
        src: "assets/images/Splunk/file-20260322134108411.jpg"
        caption: "Evidencia técnica"
      - kind: "bullet"
        text: "Listo: La carga se ha completado. Tus datos se han cargado correctamente y están listos para ser analizados."

  - id: "step4"
    num: "04"
    title: "LABORATORIO"
    content:
      - kind: "note"
        text: |
          Cargue los datos adjuntos a esta tarea y cree un índice llamado "VPN_Logs". ¿Cuántos eventos hay en el archivo de registro?
      - kind: "image"
        src: "assets/images/Splunk/file-20260322135322895.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¿Cuántos eventos de registro captura la usuaria Maleena ?
      - kind: "image"
        src: "assets/images/Splunk/file-20260322135625124.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¿Cuál es el nombre de usuario asociado a la IP 107.14.182.38?
      - kind: "image"
        src: "assets/images/Splunk/file-20260322140115224.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¿Cuál es el número de eventos que se originaron en todos los países excepto Francia?
      - kind: "image"
        src: "assets/images/Splunk/file-20260322140257188.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          ¿Cuántos eventos de VPN se asociaron con la IP 107.3.206.58?
      - kind: "image"
        src: "assets/images/Splunk/file-20260322140412891.jpg"
        caption: "Evidencia técnica"

lessons:
  - "Completar lecciones aprendidas"
mitigation: 'Completar mitigaciones recomendadas.'
---

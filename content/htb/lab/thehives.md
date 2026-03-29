---
title: "TheHives"
platform: "HackTheBox"
os: "Windows"
difficulty: "Easy"
ip: "10.129.32.211"
slug: "thehives"
author: "Z4k7"
date: "2026-03-28"
year: "2026"
status: "pwned"
tags:
  - "SOAR"
  - "DefensiveSecurity"
  - "IncidentResponse"
  - "BlueTeam"
techniques:
  - "Incident Analysis"
  - "Alert Management"
  - "TTP Mapping"
tools:
  - "TheHive"
  - "MITRE ATT&CK Framework"
flags_list:
  - label: "etapa"
    value: "Weaponize"
  - label: "caso"
    value: "T1003.001"
  - label: "etapa"
    value: "Weaponize"
  - label: "caso"
    value: "T1003.001"
summary: "TheHive es una plataforma SOAR (Security Orchestration, Automation and Response) diseñada para gestionar casos de seguridad e incidentes. En este lab se estudia cómo acceder a la plataforma, mapear técnicas MITRE ATT&CK en alertas de seguridad y analizar incidentes complejos. Se practica la gestión centralizada de alertas y la asociación de patrones de ataque detectados con el marco MITRE ATT&CK para enriquecer el análisis de incidentes.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          TheHive es una plataforma de gestión de casos diseñada para que los equipos de ciberseguridad gestionen incidentes de forma eficiente mediante el procesamiento de alertas. Los usuarios pueden crear casos y vincular múltiples alertas relevantes.
          Esta plataforma funciona como un centro centralizado para recopilar y gestionar todas las alertas de seguridad de diversos dispositivos en una única página integral.
          Además, TheHive permite importar todas las tácticas, técnicas y procedimientos (TTP) del marco MITRE ATT&CK a su sistema de gestión de alertas. Esta integración enriquece el análisis de incidentes al asociar los patrones de ataque detectados con las alertas.
          Acceso a la plataforma:
      - kind: "bullet"
        text: "URL: http://10.129.32.211:9000"
      - kind: "bullet"
        text: "Usuario: htb-analyst"
      - kind: "bullet"
        text: "Contraseña: P3n#31337@LOG"
      - kind: "image"
        src: "assets/images/TheHive/file-20260326220308252.jpg"
        caption: "Acceso a TheHive"
      - kind: "image"
        src: "assets/images/TheHive/file-20260326220411093.jpg"
        caption: "Login TheHive"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "TheHive es una herramienta defensiva crítica. En un engagement real, busca siempre si el cliente usa SOAR — esto te dice qué tan maduros son en respuesta a incidentes. Si no tienen TheHive o similar, es un gap de seguridad importante que puedes reportar."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          La tabla que aparece a continuación muestra algunas de las técnicas (MITRE ATT&CK) que se observaron durante el incidente:
      - kind: "table"
        headers:
          - "Táctica"
          - "Técnica"
          - "IDENTIFICACIÓN"
          - "Descripción"
        rows:
          - ["`Initial Access`", "Explotar una aplicación de cara al público", "T1190", "Explotación de CVE de Confluence"]
          - ["`Execution`", "Intérprete de comandos y scripts: PowerShell", "T1059.001", "PowerShell se utiliza para descargar la carga útil."]
          - ["`Persistence`", "Servicio de Windows", "T1543.003", "Servicio de Windows para persistencia"]
          - ["`Credential Access`", "Volcado de memoria de LSASS", "T1003.001", "Credenciales extraídas"]
          - ["`Lateral Movement`", "Protocolo de escritorio remoto", "T1021.001", "Movimiento lateral de RDP"]
          - ["`Impact`", "Datos cifrados para mayor impacto", "T1486", "Ransomware LockBit"]
      - kind: "callout"
        type: "warning"
        label: "Cadena de Ataque Completa Detectada"
        text: "Este incidente representa una cadena de ataque completa desde Initial Access hasta Impact. Es un ejemplo real de cómo múltiples técnicas MITRE se encadenan en un ataque real: acceso inicial → ejecución → persistencia → acceso a credenciales → movimiento  lateral → impacto final (ransomware)."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Memoriza este patrón. En pentesting real, si encuentras: Initial Access + Persistence + Credential Dumping + RDP, estás viendo el mismo TTPs. TheHive es la herramienta que los defensores usan para detectar exactamente esto. Como red teamer, necesitas entender cómo se detecta tu cadena de ataque."

  - id: "exploit"
    num: "03"
    title: "Explotación / Análisis de Incidente"
    content:
      - kind: "note"
        text: |
          ¿En qué etapa de la cadena de ataque cibernético se desarrolla el malware?
          En esta etapa, el malware que se utilizará para el acceso inicial se desarrolla e integra en algún tipo de exploit o carga útil. Este malware está diseñado para ser extremadamente ligero e indetectable por antivirus y herramientas de detección.
          Es probable que el atacante haya recopilado información para identificar la tecnología antivirus o EDR presente en la organización objetivo.
          A gran escala, el único propósito de esta etapa inicial es proporcionar acceso remoto a una máquina comprometida en el entorno objetivo, con la capacidad de persistir tras reinicios de la máquina y de implementar herramientas y funcionalidades adicionales bajo demanda.
      - kind: "callout"
        type: "info"
        label: "Etapas de la Cadena de Ataque (Kill Chain)"
        text: "1. Reconnaissance — Recopilación de información 2. Weaponization — Desarrollo del malware/exploit 3. Delivery — Entrega de la carga útil 4. Exploitation — Ejecución del exploit 5. Installation — Instalación de persistencia 6. Command & Control — Comunicación con el atacante 7. Actions on Objectives — Logro del objetivo final"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La etapa 'Weaponize' es donde se produce la mayoría del trabajo defensivo. Los EDR, sandboxes y análisis dinámico de malware apuntan a detectar en esta fase ANTES de que el malware llegue al objetivo. Como red teamer, debes entender cómo ofuscar y detectar-evadir en esta etapa."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "etapa"
        value: "Weaponize"

  - id: "flag_01_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Alerta con referencia 67c202 (Acceso a LSASS) - ID de la regla MITRE
      - kind: "image"
        src: "assets/images/TheHive/file-20260326222010665.jpg"
        caption: "Búsqueda en TheHive"
      - kind: "image"
        src: "assets/images/TheHive/file-20260326222156043.jpg"
        caption: "ID del Caso"

  - id: "flag_02"
    type: "flag"
    flag_items:
      - label: "caso"
        value: "T1003.001"

  - id: "flag_02_post"
    num: ""
    title: "Post Flag"
    content:
      - kind: "note"
        text: |
          Contexto:
      - kind: "bullet"
        text: "Táctica: Credential Access (TA0006)"
      - kind: "bullet"
        text: "Técnica: OS Credential Dumping (T1003)"
      - kind: "bullet"
        text: "Subtécnica: LSASS Memory (T1003.001)"
      - kind: "image"
        src: "assets/images/TheHive/file-20260326223041468.jpg"
        caption: "Detalle de la técnica"

  - id: "step4_1"
    num: "04"
    title: "Explicación:"
    content:
      - kind: "note"
        text: |
          El volcado de memoria de LSASS (Local Security Authority Subsystem Service) es una técnica clásica para extraer credenciales almacenadas en memoria. Herramientas como `mimikatz`, `procdump` o `lsassy` son comúnmente usadas para este propósito.
      - kind: "callout"
        type: "danger"
        label: "Crítico: LSASS Dumping es Detectado Fácilmente"
        text: "Moderno EDR detecta intentos de dumping de LSASS de inmediato. Sin embargo, existen técnicas de evasión como: - Living-off-the-land (uso de herramientas nativas de Windows) - Token impersonation antes del dump - Process creation con flags específicos para evitar detección"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "En un engagement real, si conseguiste credenciales via LSASS, ya has ganado. Pero recuerda: los logs mostrarán exactamente qué hiciste. Planifica cómo vas a cubrir tus huellas ANTES de hacer el dump. TheHive te muestra lo que ven los defensores — tú debes pensar en cómo no aparecer en TheHive."

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El acceso inicial se logró mediante la explotación de una aplicación pública — específicamente un CVE en Confluence (T1190). Esto permitió ejecución de comandos inicial, desde la cual se descargó la carga útil completa usando PowerShell (T1059.001).

  - id: "flag_03"
    type: "flag"
    flag_items:
      - label: "etapa"
        value: "Weaponize"
      - label: "caso"
        value: "T1003.001"

lessons:
  - 'TheHive es una herramienta SOAR crítica para mapear alertas a técnicas MITRE'
  - 'La integración de MITRE ATT&CK en sistemas de gestión de incidentes enriquece el análisis'
  - 'Una cadena de ataque completa típicamente incluye: Initial Access → Persistence → Credential Access → Lateral Movement → Impact'
  - 'Los volcados de LSASS son un punto crítico de detección — todos los EDR modernos los detectan'
  - 'La etapa "Weaponize" es donde se juega la batalla defensiva/ofensiva'
mitigation:
  - 'LSASS Protection: Habilitar "Credentials Guard" en Windows 10/11 para proteger LSASS'
  - 'EDR Detection: Usar EDR que detecte intentos de dumping de procesos críticos'
  - 'Application Patching: Mantener Confluence y otras aplicaciones públicas actualizadas contra CVEs conocidos'
  - 'Credential Access Controls: Implementar MFA y limitar quién tiene acceso a herramientas de dumping'
  - 'Process Monitoring: Monitorear creación de procesos PowerShell y ejecución de herramientas sospechosas'
  - 'Incident Response: Tener playbooks en TheHive para cada técnica MITRE detectada'
---

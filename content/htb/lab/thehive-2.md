---
title: "TheHive 2"
platform: "HackTheBox"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "thehive-2"
author: "Z4k7"
date: "2026-03-26"
year: "2026"
status: "pwned"
tags:
  - "BlueTeam"
  - "Forense"
  - "SOAR"
  - "TheHive"
  - "IncidentResponse"
  - "Timeline"
techniques:
  - "Incident Investigation"
  - "Timeline Analysis"
  - "Credential Access"
tools:
  - "TheHive"
  - "Mimikatz"
flags_list:
  - label: "etapa"
    value: "insig-svc_deployer"
summary: "Lab de HackTheBox categoría Blue Team / Defensive Security. Investigación de incidente utilizando TheHive SOAR platform. Análisis de timeline de eventos de seguridad para identificar al usuario que ejecutó Mimikatz. La tarea requiere acceder a la plataforma TheHive como analista, revisar la alerta de Mimikatz (ID 169066584), analizar la cronología de eventos y extraer el nombre de usuario del atacante en formato 'dominio\nombre_usuario'.  ---"
steps:

  - id: "step1_1"
    num: "01"
    title: "Investigación inicial"
    content:
      - kind: "note"
        text: |
          Cuando se detecta un incidente de seguridad, debemos realizar una investigación inicial y establecer el contexto antes de reunir al equipo y activar un protocolo de respuesta a incidentes a nivel de toda la organización. Consideremos cómo se presenta la información en el caso de que una cuenta administrativa se conecte a una dirección IP en formato HH:MM:SS. Sin saber qué sistema está conectado a esa dirección IP ni a qué zona horaria corresponde, podríamos llegar fácilmente a una conclusión errónea sobre la naturaleza del incidente. En resumen, en esta etapa debemos intentar recopilar la mayor cantidad de información posible sobre lo siguiente:
      - kind: "bullet"
        text: "Fecha y hora en que se reportó el incidente. Además, ¿quién detectó el incidente y/o quién lo reportó?"
      - kind: "bullet"
        text: "¿Cómo se detectó el incidente?"
      - kind: "bullet"
        text: "¿Cuál fue el incidente? ¿Phishing? ¿Falta de disponibilidad del sistema? etc."
      - kind: "bullet"
        text: "Elabore una lista de los sistemas afectados (si procede)."
      - kind: "bullet"
        text: "Documente quién ha accedido a los sistemas afectados y qué medidas se han tomado. Indique si se trata de un incidente en curso o si la actividad sospechosa ha cesado."
      - kind: "bullet"
        text: "Ubicación física, sistemas operativos, direcciones IP y nombres de host, propietario del sistema, propósito del sistema, estado actual del sistema."
      - kind: "bullet"
        text: "Lista de direcciones IP, si hay malware involucrado, hora y fecha de detección, tipo de malware, sistemas afectados, exportación de archivos maliciosos con información forense sobre ellos (como hashes, copias de los archivos, etc.)."
      - kind: "note"
        text: |
          En general, la cronología debe contener la información descrita en las siguientes columnas:
      - kind: "note"
        text: |
          Tomemos un evento y completemos la tabla de ejemplo anterior. Se verá así:
      - kind: "table"
        headers:
          - "`Date`"
          - "`Time of the event`"
          - "`hostname`"
          - "`event description`"
          - "`data source`"
        rows:
          - ["09/09/2021", "13:31 CET", "SQLServer01", "Se detectó la herramienta de piratería informática 'Mimikatz'.", "Software antivirus"]
      - kind: "note"
        text: |
          Asígnate la alerta de Mimikatz (que se muestra en la sección) en TheHive y revisa la descripción y el resumen. Proporciona el nombre de usuario de la persona que ejecutó la herramienta Mimikatz. El formato de respuesta es "dominio\nombre_de_usuario".
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La estructura de investigación forense que propones es sólida: recopilar metadata del incidente (quién, cuándo, cómo), listar sistemas afectados, documentar timeline. Esta es la base metodológica del análisis forense real. En un SOC, cada campo de esa tabla es crítico — la zona horaria incorrecta puede invalidar toda una cadena de correlación."

  - id: "access_1"
    num: "02"
    title: "Acceso a TheHive"
    content:
      - kind: "note"
        text: |
          Accedemos a la interfaz de usuario para validar la cronología de lo sucedido:
      - kind: "image"
        src: "assets/images/TheHive%202/file-20260329195126440.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Credenciales:
      - kind: "bullet"
        text: "Usuario: htb-analyst"
      - kind: "bullet"
        text: "Password: P3n#31337@LOG"
      - kind: "image"
        src: "assets/images/TheHive%202/file-20260329195512119.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "TheHive es una plataforma SOAR que centraliza alertas de múltiples fuentes (IDS, antivirus, EDR, firewalls). El acceso con rol 'analyst' es típico en SOCs reales — los analistas tienen acceso de lectura para investigar sin poder modificar configuraciones críticas. Nota que las credenciales están en el problema — en un engagement real, buscarías esas credenciales en archivos de configuración, notas de soporte, o en la metadata del lab."

  - id: "step3"
    num: "03"
    title: "Análisis de Alerta"
    content:
      - kind: "note"
        text: |
          Validamos el ID 169066584:
      - kind: "image"
        src: "assets/images/TheHive%202/file-20260329200456392.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos los detalles del histórico:
      - kind: "image"
        src: "assets/images/TheHive%202/file-20260329200532305.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La nomenclatura 'dominio\nombre_usuario' es estándar en Windows. Aquí 'insight' es el dominio y 'svc_deployer' es una cuenta de servicio — objetivo frecuente de ataques porque: (a) tienen permisos elevados, (b) credenciales almacenadas en máquinas, (c) logs las asocian con procesos legítimos. Si un atacante compromete 'svc_deployer', puede ejecutar herramientas post-explotación como [[Mimikatz]] con esos permisos y escalar a otras cuentas."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "etapa"
        value: "insight-svc_deployer"

lessons:
  - 'TheHive centraliza alertas de múltiples fuentes para investigación forense'
  - 'Las cuentas de servicio son objetivos de alta prioridad — tienen permisos elevados'
  - 'La identificación precisa del usuario responsable es el primer paso para contención'
  - 'Timeline con zona horaria exacta es crítico para correlacionar eventos'
  - 'Un ID de alerta único permite rastrear toda la investigación desde el principio'
mitigation:
  - 'Implementar EDR (Endpoint Detection and Response) para detectar [[Mimikatz]] y herramientas post-explotación'
  - 'Auditar cuentas de servicio — credenciales no deben estar en texto claro en archivos de configuración'
  - 'Implementar Credential Guard en Windows para proteger [[LSASS Memory Dump]]'
  - 'Usar LSA Protection (RunAsPPL) para evitar lectura de LSASS desde procesos no privilegiados'
  - 'Implementar Just-In-Time (JIT) access — cuentas de servicio solo existen cuando se necesitan'
  - 'Implementar security event forwarding a SIEM centralizado para correlación'
  - 'Auditar y alertar sobre ejecución de herramientas conocidas (Mimikatz, PsExec, etc.)'
---

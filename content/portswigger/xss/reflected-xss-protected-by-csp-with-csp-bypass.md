---
title: "Reflected XSS protected by CSP, with CSP bypass"
platform: "PortSwigger"
os: "Windows"
difficulty: "Hard"
ip: "10.10.10.XXX"
slug: "reflected-xss-protected-by-csp-with-csp-bypass"
author: "Z4k7"
date: "2026-04-24"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "CSP"
techniques:
  - "CSP Bypass"
  - "Directive Fallback"
  - "Token Manipulation"
tools:
  - "BurpSuite"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Laboratorio de XSS Reflejado protegido por Content Security Policy (CSP) restrictiva. La CSP bloquea script-src 'unsafe-inline'. La solución requiere explotar la fallback behavior de CSP usando directivas menos conocidas como script-src-elem que pueden anular la directiva principal, permitiendo ejecutar scripts inline y llamar a alert(document.domain). El bypass se logra manipulando el token de reporte CSP.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio utiliza CSP y contiene una vulnerabilidad XSS reflejada.
          Para resolver el laboratorio, realice un ataque de scripting entre sitios que omita el CSP y llame al `alert`Función.
          Tenga en cuenta que la solución prevista para este laboratorio solo es posible en Chrome

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503135833916.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          En el laboratorio consultamos el apartado de los CSP para identificar la posible fallo y poder saltar la política.
      - kind: "code"
        lang: "JSON"
        code: |
          default-src 'self';
          object-src 'none';
          script-src 'self';
          style-src 'self';
          report-uri /csp-report?token=;
      - kind: "note"
        text: |
          Interactuando con la web si tratamos de enviar un alert() el sistema no permite el proceso por medio de los CSP
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503204407260.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Menciona para poder cumplir el proceso es necesario cumplir las CSP consultando el código la política `script-src` requiere el estado `unsafe-inline` para que se pueda cumplir o ejecutar el script validando la documentación la política `script-src`.
          Podemos utilizar como Fallback los CSP `script-src-elem` y `script-src-attr` en este caso podríamos tratar de aplicar los CSP por medio del código.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Content Security Policy define cómo los scripts pueden cargarse y ejecutarse. La política actual bloquea scripts inline (`'unsafe-inline'` no está presente). Sin embargo, las directivas más nuevas como `script-src-elem` y `script-src-attr` pueden actuar como fallbacks. Si estas directivas no están explícitamente configuradas, algunos navegadores las ignoran, permitiendo scripts inline."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Validamos el código y trataremos de agregarle las nuevas CSP `script-src-elem` seleccionamos este ya que nos permite ejecutar script
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script script-src-elem:unsafe-inline ></script>
      - kind: "note"
        text: |
          El anterior nos permite evadir los CSP.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503205500047.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nos permite evadir mas no se esta agregando los CSP
          Código:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>alert(document.domain)</script>&script-src-elem:unsafe-inline
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503210054976.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Nos salta el mismo error en este caso nos hace falta la parte del token validando el error es que estamos enviando las políticas de manera errónea
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>alert(document.domain)</script>&script-src-elem 'unsafe-inline'
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503210358387.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando el comportamiento al momento de enviar una solicitud la web nos genera un POST el cual es la solicitud del token en este caso consultando dicha solicitud nos permite manipular e ingresar políticas sin problema alguno en este caso los códigos anteriores funcionan pero sin la claridad de lo sucedido comparto información del comportamiento de los elementos manipulados en el TOKEN
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212225194.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212246983.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Toma la solicitud e interpreta lo que ingresamos código después del token para escapar de dicho apartado e ingresar nuevas CSP.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212428894.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Enviamos ahora la política ya mencionada `script-src-elem 'unsafe-inline'`
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212514522.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Funciona sin problema alguno validamos lo ingresado en la solicitud
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212552040.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212602790.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El CSP reporta violaciones a `report-uri /csp-report?token=`. Al manipular el token CSP, podemos inyectar directivas adicionales que el navegador interpreta como válidas. Específicamente: - CSP original: `script-src 'self'` (bloquea inline) - Inyectamos: `script-src-elem 'unsafe-inline'` en el token - Navegador interpreta ambas directivas juntas - `script-src-elem 'unsafe-inline'` permite scripts inline en elementos `<script>` - El script inline se ejecuta sin violar la CSP"

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload que manipula el token CSP es:
      - kind: "code"
        lang: "BASH"
        code: |
          script-src-elem 'unsafe-inline'
      - kind: "note"
        text: |
          Se inyecta modificando la URL de reporte:
      - kind: "code"
        lang: "BASH"
        code: |
          /csp-report?token=script-src-elem 'unsafe-inline'
      - kind: "note"
        text: |
          O en el contexto de la solicitud POST:
      - kind: "code"
        lang: "BASH"
        code: |
          POST /csp-report?token=script-src-elem%20'unsafe-inline'
      - kind: "note"
        text: |
          Una vez inyectado, el navegador procesa el CSP expandido:
          CSP Original:
      - kind: "code"
        lang: "BASH"
        code: |
          default-src 'self';
          object-src 'none';
          script-src 'self';
          style-src 'self';
          report-uri /csp-report?token=...;
      - kind: "note"
        text: |
          CSP Modificado (después del bypass):
      - kind: "code"
        lang: "BASH"
        code: |
          default-src 'self';
          object-src 'none';
          script-src 'self';
          style-src 'self';
          script-src-elem 'unsafe-inline';
          report-uri /csp-report?token=script-src-elem 'unsafe-inline';
      - kind: "note"
        text: |
          Ahora podemos inyectar:
      - kind: "code"
        lang: "HTML"
        code: |
          <script>alert(document.domain)</script>
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212514522.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La directiva `script-src-elem` controla específicamente qué scripts pueden ejecutarse en elementos `<script>` inline. Si esta directiva incluye `'unsafe-inline'`, el navegador permite scripts inline aunque `script-src` lo bloquee. Este es un bypass efectivo en navegadores que soportan estas directivas más nuevas."

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final combina dos partes:
          Parte 1: Manipular el token CSP para inyectar directiva permisiva
      - kind: "code"
        lang: "BASH"
        code: |
          script-src-elem 'unsafe-inline'
      - kind: "note"
        text: |
          Parte 2: Inyectar el script que se ejecutará
      - kind: "code"
        lang: "HTML"
        code: |
          <script>alert(document.domain)</script>
      - kind: "note"
        text: |
          Una vez ejecutado:
          1. El token CSP es modificado mediante POST a `/csp-report?token=...`
          2. El navegador procesa la directiva `script-src-elem 'unsafe-inline'`
          3. El `<script>` inline pasa la validación CSP
          4. `alert(document.domain)` se ejecuta
          5. El CSP no bloquea la ejecución
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20protected%20by%20CSP,%20with%20CSP%20bypass/file-20260503212514522.jpg"
        caption: "Evidencia técnica"

lessons:
  - 'Content Security Policy no es suficiente si está mal configurada o si hay fallbacks inseguros'
  - 'Las directivas `script-src-elem` y `script-src-attr` pueden anular restricciones de `script-src`'
  - 'El parámetro `token` en `report-uri` puede ser explotado para inyectar directivas adicionales'
  - 'Las directivas más nuevas de CSP tienen mayor prioridad que las antiguas'
  - 'El navegador interpreta todas las directivas juntas, permitiendo combinaciones peligrosas'
  - 'Una CSP restrictiva solo es segura si todas las directivas relevantes están configuradas'
  - 'El `report-uri` no debe aceptar input no validado'
mitigation:
  - 'Configurar `script-src-elem ''self''` explícitamente para prevenir inline scripts'
  - 'Configurar `script-src-attr ''none''` para prevenir event handlers inline'
  - 'Validar y sanitizar el parámetro `token` en `/csp-report`'
  - 'Usar `Content-Security-Policy-Report-Only` para testing antes de implementar en modo strict'
  - 'Nunca permitir que input del usuario se refleje en headers o parámetros CSP'
  - 'Usar nonces o hashes para scripts inline si es necesario'
  - 'Implementar CSP en modo strict: `script-src ''nonce-RANDOM''` para cada request'
  - 'Considerar usar `frame-ancestors ''none''` para prevenir framing attacks'
---

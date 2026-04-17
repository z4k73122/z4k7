---
title: "DOM XSS in jQuery selector sink using a hashchange event"
platform: "PortSwigger"
os: "Windows"
difficulty: "Medium"
ip: "10.10.10.XXX"
slug: "dom-xss-in-jquery-selector-sink-using-a-hashchange-event"
author: "Z4k7"
date: "2026-04-15"
year: "2026"
status: "pwned"
tags:
  - "DOM"
  - "jQuery"
  - "Web"
techniques:
  - "DOM XSS"
  - "event handlers (onload)"
  - "jQuery selector injection"
  - "hash manipulation"
tools:
  - "Exploit Server PortSwigger"
  - "Browser DevTools"
flags_list:
  - label: "user"
    value: "hash_aqui"
  - label: "root"
    value: "hash_aqui"
summary: "Lab de BurpSuite Academy que explota DOM XSS mediante jQuery :contains() selector con entrada no sanitizada desde location.hash. La aplicación usa hashchange event para ejecutar código que interpola directamente el input del usuario en un selector jQuery. Cadena de ataque: enviar iframe con evento onload que modifica location.hash → hashchange trigger → jQuery interpreta HTML malicioso en selector → img onerror ejecuta print(). Técnicas: event handler chaining, jQuery sink exploitation, Exploit Server payload delivery."
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Este laboratorio contiene una vulnerabilidad de secuencias de comandos entre sitios basada en DOM en la página de inicio. Utiliza jQuery `$()` función de selección para desplazarse automáticamente a una publicación determinada, cuyo título se pasa a través de la `location.hash` propiedad.
          Para resolver el laboratorio, entregue a la víctima un exploit que llame al `print()` función en su navegador.

  - id: "recon_1"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Iniciamos el laboratorio y accedemos en la URL:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260415131523740.jpg"
        caption: "Acceso inicial al lab"
      - kind: "note"
        text: |
          Consultamos el contenido de la web y su correcto funcionamiento:
      - kind: "code"
        lang: "JS"
        code: |
          <script>
              $(window).on('hashchange', function(){
                  var post = $('section.blog-list h2:contains(' + decodeURIComponent(window.location.hash.slice(1)) + ')');
                  if (post) post.get(0).scrollIntoView();
              });
          </script>
      - kind: "note"
        text: |
          En el código anterior se valida lo siguiente:
          Obtención del hash de la URL
      - kind: "bullet"
        text: "Se toma el apartado que aparece después del símbolo # en la URL mediante window.location.hash."
      - kind: "bullet"
        text: "Este valor incluye el #, por lo que se usa .slice(1) para quedarnos solo con el texto."
      - kind: "note"
        text: |
          Decodificación del valor
      - kind: "bullet"
        text: "Con decodeURIComponent(...) se transforma el texto en un formato legible (por ejemplo, convierte %20 en espacios)."
      - kind: "note"
        text: |
          Búsqueda del encabezado correspondiente
      - kind: "bullet"
        text: "Se selecciona dentro de section.blog-list el elemento <h2> cuyo contenido coincida con el texto obtenido del hash."
      - kind: "bullet"
        text: "Esto se hace con el selector jQuery :contains(...)."
      - kind: "note"
        text: |
          Desplazamiento automático
      - kind: "bullet"
        text: "Si se encuentra el encabezado, se usa scrollIntoView() para mover la vista hacia ese elemento."
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El punto crítico aquí es que jQuery `:contains()` interpreta su argumento como una cadena literal, NO como un selector escapado. Cuando pasas HTML/caracteres especiales en el contenido, jQuery intenta procesarlos. Esto no es RCE directo pero prepara el DOM para posteriores inyecciones. La verdadera explotación viene del event handler chaining que ves en Explotación."

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          Ya contamos con el comportamiento de la web en este caso. Si el script lo que permite es validar o confirmar si existe `#` en la URL, ejecuta el script. En este caso, ¿qué sucede si no existe dicho nombre en el sistema? Puede causar algún error en el mismo.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416201444766.jpg"
        caption: "Explorando comportamiento"
      - kind: "note"
        text: |
          En este caso lo que podríamos realizar es tratar de aplicar o ingresar datos en el DOM para generar algún alert(). Aplicamos en el `Go to Exploit Server`.
          Podremos validar lo siguiente:
      - kind: "code"
        lang: "HTML"
        code: |
          <iframe src="https://www.google.com/"></iframe>
      - kind: "note"
        text: |
          Ingresamos en el apartado de `Go to Exploit Server`. En dicho apartado nos permite simular un servidor atacante.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416202237532.jpg"
        caption: "Exploit Server - Test inicial"
      - kind: "note"
        text: |
          Validamos si se ejecuta este código:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416202255685.jpg"
        caption: "Validación de ejecución"
      - kind: "note"
        text: |
          Se confirma la correcta ejecución. En este caso si aplicamos el mismo código pero para tratar de acceder al link principal de la web `/`:
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416202401402.jpg"
        caption: "Acceso al endpoint raíz"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416202542899.jpg"
        caption: "Confirmación de acceso"
      - kind: "callout"
        type: "warning"
        label: "Inyección de código mediante eventos"
        text: "El siguiente paso es modificar el hash DESPUÉS de cargar la página para triggerear el hashchange event con payload malicioso. La clave es que el onload event de la iframe te da control temporal — puedes modificar src DESPUÉS de que el DOM esté listo."

  - id: "exploit_1"
    num: "04"
    title: "Explotación"
    content:
      - kind: "note"
        text: |
          Tratamos de inyectar código por medio del evento `onload=""`:
      - kind: "code"
        lang: "HTML"
        code: |
          <iframe src="https://0aff00dd03560ef480720d360092006c.web-security-academy.net#" onload="this.src+='<img src=x onerror=print()>'"></iframe>
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416203514292.jpg"
        caption: "Payload en Exploit Server"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416203610489.jpg"
        caption: "Verificación del payload"
      - kind: "note"
        text: |
          Paso a paso del payload:
          1. `<iframe src="...#">` — Carga la página vulnerable con hash vacío
          2. `onload="this.src+='...'"` — Una vez que la iframe carga, modifica su `src`
          3. `this.src += '<img src=x onerror=print()>'` — Concatena HTML malicioso al final de la URL
          4. Esto dispara navegación dentro de la iframe → `#` se convierte en `#<img src=x onerror=print()>`
          5. El `hashchange` event se dispara → jQuery recibe `<img src=x onerror=print()>` como entrada
          6. jQuery `:contains()` intenta buscar ese HTML literal → falla la búsqueda pero el HTML queda en el DOM
          7. El `onerror` de la img (porque `src=x` no existe) → ejecuta `print()`
      - kind: "callout"
        type: "info"
        label: "Event handler chaining en DOM XSS"
        text: "La técnica de concatenar HTML al atributo `src` es elegante porque: (a) no requiere recargar completamente la página, (b) la iframe se navega a sí misma internamente, (c) el hashchange event se dispara sin interacción adicional del usuario."
      - kind: "note"
        text: |
          Una vez se cargue el código arbitrario se guarda en el servidor y se envía a la víctima. Para confirmar que la víctima realizó dicho cambio validamos en el apartado de `LOG` para confirmar cambios en el servidor y la víctima.
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416203659622.jpg"
        caption: "Log de Exploit Server - Evidencia 1"
      - kind: "image"
        src: "assets/images/DOM%20XSS%20in%20jQuery%20selector%20sink%20using%20a%20hashchange%20event/file-20260416203709181.jpg"
        caption: "Log de Exploit Server - Evidencia 2"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Variantes de este mismo attack que deberías documentar en próximos labs: - En lugar de `<img src=x onerror=print()>` puedes usar: `<svg onload=print()>`, `<body onload=print()>`, `<iframe onload=print()>` - En lugar de `onload` en la iframe externa, puedes usar `setTimeout()` con delay para triggerear el hash change después de cierto tiempo - Si el servidor está filtrando `<img>` o `onerror`, intenta entities encoding: `&lt;img src=x onerror=print()&gt;` - Exploring payload mutation para evasión de WAF es próximo topic clave"

  - id: "exploit_1"
    num: "05"
    title: "Acceso Inicial"
    content:
      - kind: "note"
        text: |
          El exploit fue entregado a la víctima mediante el Exploit Server de PortSwigger. La víctima accedió al link del exploit y:
          1. Se ejecutó el iframe con onload
          2. El hashchange event fue triggereado
          3. El código arbitrario ejecutó `print()`
          4. La ventana de impresión del navegador se abrió
          Evidencia en los logs del Exploit Server donde la víctima accedió al payload y el event handler se ejecutó correctamente.

lessons:
  - 'jQuery `:contains()` selector es un sink peligroso cuando recibe input no sanitizado'
  - 'Los event handlers como `onload` pueden ser usados para chains de ataques más complejos'
  - '`location.hash` es fuente de datos no confiables — siempre debe escaparse/sanitizarse'
  - 'El `hashchange` event se dispara sin page reload — perfecto para ataques DOM sin interacción adicional del usuario'
  - 'URL concatenation en `src` attributes puede bypass algunas validaciones de URL'
  - 'Múltiples sinks pueden combinarse: event handler → hash manipulation → jQuery interpolation → DOM XSS'
  - 'La decodificación (`decodeURIComponent`) ocurre ANTES de la interpolación en jQuery, lo que permite múltiples niveles de encoding para bypass'
mitigation:
  - 'Usar `textContent` o `innerText` en lugar de `innerHTML` cuando sea posible (no interpreta HTML)'
  - 'Escapar/sanitizar cualquier input que vaya a ser usado en selectores jQuery (usar librerías como DOMPurify)'
  - 'Validar y whitelistar valores de `location.hash` en lugar de usarlos directamente en selectores'
  - 'Implementar Content Security Policy (CSP) restrictivo que bloquee `onerror`, `onload`, `onclick` inline'
  - 'Usar template literals seguros con librerías modernas (React, Vue) que escapan por defecto'
  - 'No confiar en que `decodeURIComponent` sanitiza — solo decodifica, no escapa HTML'
  - 'Implementar subresource integrity (SRI) para librerías jQuery de terceros'
---

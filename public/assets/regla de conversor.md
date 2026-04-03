
# NOMBRE DE LA MÁQUINA

<!-- ╔══════════════════════════════════════════════════════════════════════════════╗ ║ PLANTILLA Z4K7 — REGLAS DEL CONVERSOR OBSIDIAN → PORTAFOLIO ║ ║ Copia esta plantilla para cada writeup. Borra los comentarios al terminar. ║ ╚══════════════════════════════════════════════════════════════════════════════╝ --> <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ REGLA 1 — RESUMEN EJECUTIVO Bloque > [!ABSTRACT] → campo `summary:` en el frontmatter YAML • Solo la primera ocurrencia es capturada • Se limpia el markdown (**, `) antes de guardar • Escríbelo como una sola idea concisa ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

> [!ABSTRACT] Resumen ejecutivo Describe el vector de ataque principal y qué se logró. Ejemplo: Acceso inicial mediante SQLi en login, escalada via SUID vim a root.

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ REGLA 2 — HERRAMIENTAS Línea `herramientas: tool1, tool2` → campo `tools:` en el YAML • Debe ser exactamente así: la palabra "herramientas" seguida de ":" • Separadas por comas, sin importar espacios • Se convierte en un array YAML ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

herramientas: nmap, gobuster, sqlmap, burpsuite, netcat

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ REGLA 3 — TAGS / ETIQUETAS #Hashtags en cualquier parte del texto → campo `tags:` en el YAML • Formato: #PalabraConMayuscula o #palabra • Los siguientes son IGNORADOS (son callouts): INFO, WARNING, SUCCESS, ABSTRACT, DANGER, TIP • Solo se capturan tags con más de 2 caracteres • Se eliminan duplicados automáticamente ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

#SQLInjection #PrivEsc #Windows #HackTheBox

---

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ REGLA 4 — SECCIONES → PASOS ## Título de Sección → un paso (step) en el YAML El conversor detecta el ID del paso por palabras clave en el título: TÍTULO CONTIENE → ID ASIGNADO ───────────────────────────────────────── reconoc, recon, escaneo → recon enumer, enum, order by → enum exploit, inyecc, union → exploit acceso, credencial, shell→ access escalad, privesc, bypass → privesc root, admin, pwned → root (cualquier otro) → step1, step2... SECCIONES IGNORADAS (no generan pasos): • resumen conceptual, definición, fundamento • arquitectura, impacto, defensa, blue team • profundizaci, notas de, evidencia final • red flags, bypasses ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Reconocimiento

<!-- REGLA 5 — TEXTO NORMAL → kind: "note" Todo el texto libre dentro de una sección → kind: "note" • Se limpian los ** (negrita) • Se limpian los `backticks` • Los *** (credenciales) se reemplazan por [flag] -->

Descripción de lo que se hizo. Todo texto libre se convierte en una nota.

<!-- REGLA 6 — BLOQUES DE CÓDIGO → kind: "code" ```lenguaje → kind: "code" con lang: "LENGUAJE" (en mayúsculas) Si no se especifica lenguaje → lang: "BASH" por defecto Lenguajes soportados: bash, python, powershell, sql, php, etc. -->

```bash
nmap -sC -sV -oN scan.txt 10.10.10.XXX
gobuster dir -u http://10.10.10.XXX -w /usr/share/wordlists/dirb/common.txt
```

<!-- REGLA 7 — LISTAS → kind: "bullet" Líneas con - o * al inicio → kind: "bullet" • Se limpian ** y `backticks` • Solo se capturan items con más de 4 caracteres -->

- Puerto 80 abierto con Apache 2.4
- Puerto 445 SMB habilitado
- Directorio /admin expuesto sin autenticación

<!-- REGLA 8 — CALLOUTS → kind: "callout" > [!TIPO] Etiqueta opcional → kind: "callout" TIPOS Y COLOR EN EL PORTAFOLIO: ┌─────────────────────────────────────────────────────────┐ │ > [!INFO] → azul (#00d4ff) — Hallazgo info │ │ > [!WARNING] → naranja (#ff8c00) — Dato importante │ │ > [!DANGER] → rojo (#ff3366) — Vulnerabilidad │ │ > [!SUCCESS] → verde (#00ff88) — Confirmación │ │ > [!TIP] → violeta (#a78bfa) — Técnica/consejo │ │ > [!NOTE] → azul — Nota genérica │ │ > [!BUG] → rojo — Error/bug │ │ > [!CAUTION] → naranja — Precaución │ └─────────────────────────────────────────────────────────┘ El texto después del tipo es la etiqueta (label). El contenido "> texto" es el body del callout. -->

> [!INFO] Hallazgo importante Se encontró un panel de administración accesible sin credenciales en /admin.

<!-- REGLA 9 — IMÁGENES → kind: "image" SOLO se capturan imágenes con este formato exacto: ![Caption](assets/images/archivo.png) • La ruta DEBE empezar con assets/images/ • Solo se guarda el nombre del archivo: src: "archivo.png" • El texto entre [] se convierte en caption • URLs externas (https://) también son capturadas • Imágenes con otras rutas son IGNORADAS por el conversor -->

![Resultado del escaneo](assets/images/nmap-scan.png)

---

<!-- REGLA 10 — SEPARADOR --- → SUB-PASOS Un --- dentro de una sección crea un sub-paso separado. La misma ## genera dos steps con IDs: recon_1, recon_2 El título y número solo aparecen en el primer sub-paso. Útil para separar fases dentro del mismo tipo de actividad. IMPORTANTE: el --- no debe estar dentro de un bloque de código. -->

Continuación del reconocimiento con enfoque diferente.

```bash
enum4linux -a 10.10.10.XXX
```

---

## Enumeración

Descripción de la enumeración realizada.

```sql
' ORDER BY 3--
' UNION SELECT 1,2,3--
```

> [!WARNING] Dato crítico El parámetro id es vulnerable a SQLi tipo UNION-based.

- Columna 2 refleja datos en la respuesta
- Base de datos: MySQL 5.7

---

## Explotación

```python
python3 exploit.py -t 10.10.10.XXX -u admin -p password123
```

> [!DANGER] RCE confirmado Inyección de comandos en el parámetro cmd del endpoint /exec.

![Reverse shell obtenida](assets/images/revshell.png)

---

## Acceso Inicial

Shell obtenida como usuario www-data.

```bash
nc -nlvp 4444
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

- Usuario: www-data
- Directorio /home/user accesible

---

<!-- REGLA 11 — SECCIONES DE FLAG → type: "flag" Cualquier sección ## o ### con "flag" en el título → genera un paso especial tipo "flag" (sin content[]). Las flags se capturan con TRES asteriscos en cada lado: ***label***: valor • El label puede ser cualquier texto: user, root, flag1, etc. • El valor va después de los ":" (hasta fin de línea) • Se agregan también al campo flags_list: del frontmatter YAML -->

## Flag

_**user**_: 3b3f8d1e2a4c6f7890abcdef12345678

---

## Escalada de Privilegios

```bash
sudo -l
find / -perm -4000 2>/dev/null
```

> [!TIP] Técnica: GTFOBins vim con SUID permite escalar con :!/bin/bash desde dentro del editor.

```bash
vim -c ':!/bin/bash'
whoami
```

![Root obtenido](assets/images/root-proof.png)

---

## Pwned

```bash
cat /root/root.txt
```

_**root**_: a1b2c3d4e5f6789012345678abcdef90

---

<!-- REGLA 12 — LECCIONES APRENDIDAS → array `lessons:` Sección con título que contenga: lecci, lesson, aprendid, observaciones finales • SOLO se capturan líneas con formato de lista ( - item ) • El texto libre es ignorado • Se limpian los ** antes de guardar • Cada item de lista = un elemento del array -->

## Lecciones Aprendidas

- Los shares SMB anónimos son un vector frecuente en entornos Windows
- Revisar binarios SUID con GTFOBins antes de buscar exploits complejos
- La enumeración con enum4linux revela usuarios para ataques de fuerza bruta

---

<!-- REGLA 13 — MITIGACIONES → campo `mitigation:` Sección con título que contenga: mitigaci, mitigac, defensa, blue, recomend • Todo el texto de la sección se une en un solo string • Se limpian callouts, viñetas y negritas • Los saltos de línea se convierten en espacios • Es un string, NO un array -->

## Mitigaciones Recomendadas

Deshabilitar el acceso anónimo a shares SMB, aplicar el principio de mínimo privilegio en binarios del sistema y eliminar el bit SUID de herramientas innecesarias como vim o nano.

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ RESUMEN RÁPIDO DE TODAS LAS REGLAS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ EN OBSIDIAN → EN EL PORTAFOLIO (YAML) ────────────────────────────────────────────────────────────────────────── > [!ABSTRACT] ... → summary: "..." herramientas: a, b, c → tools: [a, b, c] #Tag1 #Tag2 → tags: [Tag1, Tag2] ## Título sección → steps[].id / num / title Texto libre → content[].kind: "note" ```lang ... ``` → content[].kind: "code" lang: "LANG" - item de lista → content[].kind: "bullet" > [!INFO/WARNING/DANGER] → content[].kind: "callout" ![txt](assets/images/f) → content[].kind: "image" src: "f" --- (separador) → nuevo sub-paso dentro de la sección ### Flag / ***x***: val → steps[].type: "flag" + flags_list: ## Lecciones / - item → lessons: [...] ## Mitigaciones / texto → mitigation: "..." ────────────────────────────────────────────────────────────────────────── -->
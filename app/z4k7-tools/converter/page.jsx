"use client";
import { useState, useCallback, useRef } from "react";

// ─── UTILS ────────────────────────────────────────────────────────────────────

function slugify(t) {
  return t
    .toLowerCase()
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function cleanEmoji(t) {
  return t
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .trim();
}

// ─── PARSER ───────────────────────────────────────────────────────────────────

function parse(text) {
  const steps = [],
    lessons = [];
  let mitigation = "",
    summary = "",
    tags = [];

  // 1. TAGS
  const tagMatches = text.match(/#([A-Za-z\u00C0-\u024F]\w+)/g) || [];
  tagMatches.forEach((t) => {
    const c = t.replace("#", "").trim();
    const skip = ["INFO", "WARNING", "SUCCESS", "ABSTRACT", "DANGER", "TIP"];
    if (c.length > 2 && !skip.includes(c.toUpperCase())) tags.push(c);
  });
  tags = [...new Set(tags)];

  // 2. SUMMARY
  const absM = text.match(
    />[\s]*\[!(?:ABSTRACT|abstract)\][^\n]*\n([\s\S]*?)(?=\n##|\n\n##|$)/i,
  );
  if (absM)
    summary = absM[1]
      .replace(/^>\s*/gm, "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .trim()
      .replace(/\n/g, " ");

  // 3. TOOLS — línea "herramientas: nmap, gobuster, sqlmap"
  let tools = [];
  const toolsMatch = text.match(/^herramientas\s*:\s*(.+)$/im);
  if (toolsMatch) {
    tools = toolsMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  const detectedFlags = [];

  const idMap = [
    { keys: ["reconoc", "recon", "escaneo", "nmap", "detec"], id: "recon" },
    {
      keys: ["enumer", "enum", "columna", "order by", "fundament"],
      id: "enum",
    },
    {
      keys: [
        "exploit",
        "explot",
        "inyecc",
        "union",
        "ataque",
        "acceso inic",
        "objetivo",
      ],
      id: "exploit",
    },
    {
      keys: ["acceso", "credencial", "login", "winrm", "shell", "extracc"],
      id: "access",
    },
    {
      keys: [
        "escalad",
        "privesc",
        "privileg",
        "bloodhound",
        "avanzad",
        "bypass",
        "técnica",
      ],
      id: "privesc",
    },
    {
      keys: ["root", "admin", "domain", "resultado final", "pwned"],
      id: "root",
    },
  ];

  const skipSections = [
    "resumen conceptual",
    "definición",
    "fundamento",
    "arquitectura",
    "impacto",
    "defensa",
    "blue team",
    "profundizaci",
    "notas de",
    "resultados e impacto",
    "evidencia final",
    "red flags",
    "bypasses",
  ];
  const lessonSections = [
    "lecci",
    "lesson",
    "aprendid",
    "observaciones finales",
  ];
  const mitigSections = ["mitigaci", "mitigac", "defensa", "blue", "recomend"];

  // ── BLOQUE por ## ──
  const lines = text.split("\n");
  let currentTitle = null,
    currentLines = [];
  const blocks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headMatch) {
      if (currentTitle !== null)
        blocks.push({
          title: cleanEmoji(currentTitle).trim(),
          lines: currentLines,
        });
      currentTitle = headMatch[2];
      currentLines = [];
    } else {
      if (currentTitle !== null) currentLines.push(line);
    }
  }
  if (currentTitle !== null)
    blocks.push({
      title: cleanEmoji(currentTitle).trim(),
      lines: currentLines,
    });

  // Si no hay ningún ## en el texto, meter todo como un bloque genérico
  if (blocks.length === 0 && text.trim().length > 0) {
    blocks.push({ title: "Paso sin título", lines: text.split("\n") });
  }

  let stepNum = 1,
    flagCount = 0;

  for (const block of blocks) {
    const tl = block.title.toLowerCase();
    const body = block.lines.join("\n");

    // Lecciones
    if (lessonSections.some((k) => tl.includes(k))) {
      block.lines.forEach((l) => {
        const bm = l.match(/^[-*]\s+(.+)$/);
        if (bm) {
          const c = bm[1].replace(/\*\*/g, "").trim();
          if (c.length > 4) lessons.push(c);
        }
      });
      continue;
    }

    // Mitigación
    if (mitigSections.some((k) => tl.includes(k))) {
      mitigation = body
        .replace(/^[>\s]*\[!.*?\]\s*/gm, "")
        .replace(/^[>\s\-*]+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .trim();
      continue;
    }

    // FLAGS
    if (tl.includes("flag")) {
      flagCount++;
      const flagId = `flag_${String(flagCount).padStart(2, "0")}`;
      const flagItems = [];
      const fReg = /\*{3}([^*]+)\*{3}:\s*([^\n]+)/g;
      let fm;
      while ((fm = fReg.exec(body)) !== null) {
        flagItems.push({ label: fm[1].trim(), value: fm[2].trim() });
        detectedFlags.push({ label: fm[1].trim(), value: fm[2].trim() });
      }
      steps.push({
        id: flagId,
        num: "",
        title: "",
        type: "flag",
        flagItems,
        notes: "",
        codes: [],
        images: [],
        bullets: [],
        callouts: [],
      });
      continue;
    }

    // Skip secciones ignoradas
    if (skipSections.some((k) => tl.includes(k))) continue;
    // Skip solo si el bloque está completamente vacío
    if (!body.trim()) continue;

    const def = idMap.find((s) => s.keys.some((k) => tl.includes(k)));
    const stepId = def ? def.id : `step${stepNum}`;
    const blockNum = String(stepNum).padStart(2, "0");
    stepNum++;

    // Sub-pasos con ---
    const subBlocks = [];
    let subLines = [],
      inCodeSplit = false;
    for (const l of block.lines) {
      if (l.match(/^```/)) inCodeSplit = !inCodeSplit;
      if (!inCodeSplit && l.trim() === "---") {
        subBlocks.push([...subLines]);
        subLines = [];
      } else subLines.push(l);
    }
    subBlocks.push([...subLines]);

    for (let si = 0; si < subBlocks.length; si++) {
      const sLines = subBlocks[si];
      if (sLines.every((l) => l.trim() === "")) continue;

      const subStepId = subBlocks.length === 1 ? stepId : `${stepId}_${si + 1}`;
      const subTitle = si === 0 ? block.title : "";
      const subNum = si === 0 ? blockNum : "";

      // content[] preserva el orden exacto del .md
      // cada item: { kind: 'note'|'code'|'image'|'bullet'|'callout', ...data }
      const content = [];

      const CALLOUT_TYPE_MAP = {
        info: "info",
        warning: "warning",
        warn: "warning",
        danger: "danger",
        success: "default",
        tip: "tip",
        abstract: "info",
        note: "info",
        example: "info",
        bug: "danger",
        error: "danger",
        failure: "danger",
        caution: "warning",
        question: "info",
        quote: "info",
        cite: "info",
      };

      let inCode = false,
        codeLang = "BASH",
        codeLines = [];
      let inCallout = false,
        calloutLines = [],
        currentCallout = null;
      let noteLines = [];

      const flushNote = () => {
        const text = [...new Set(noteLines)].join("\n").trim();
        if (text) content.push({ kind: "note", text });
        noteLines = [];
      };

      const flushCallout = () => {
        if (currentCallout) {
          content.push({
            kind: "callout",
            type: currentCallout.type,
            label: currentCallout.label,
            text: calloutLines.join(" ").replace(/\*\*/g, "").trim(),
          });
        }
        inCallout = false;
        calloutLines = [];
        currentCallout = null;
      };

      for (let i = 0; i < sLines.length; i++) {
        const l = sLines[i];

        // ── Código ──
        const codeStart = l.match(/^```(\w*)\s*$/);
        if (codeStart && !inCode) {
          flushNote();
          inCode = true;
          codeLang = (codeStart[1] || "bash").toUpperCase();
          codeLines = [];
          continue;
        }
        if (inCode && l.trim() === "```") {
          inCode = false;
          if (codeLines.length > 0)
            content.push({
              kind: "code",
              lang: codeLang,
              code: codeLines.join("\n").trim(),
            });
          codeLines = [];
          continue;
        }
        if (inCode) {
          codeLines.push(l);
          continue;
        }

        // ── Callout inicio ──
        const callStart = l.match(/>\s*\[!([A-Za-z]+)\]\s*(.*)?$/i);
        if (callStart) {
          flushNote();
          if (inCallout) flushCallout();
          inCallout = true;
          const rawType = callStart[1].toLowerCase();
          currentCallout = {
            type: CALLOUT_TYPE_MAP[rawType] || "info",
            label: (callStart[2] || "").trim() || rawType.toUpperCase(),
          };
          calloutLines = [];
          continue;
        }
        if (inCallout) {
          if (l.startsWith(">")) {
            calloutLines.push(l.replace(/^>\s*/, "").trim());
            continue;
          } else {
            flushCallout();
          } // línea sin ">" → callout terminó, seguir procesando
        }

        // ── Imagen Obsidian ![[]] ──
        const imgMatch = l.match(
          /!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp))\]\]/i,
        );
        if (imgMatch) {
          flushNote();
          const next = sLines[i + 1];
          const caption =
            next && next.trim() && !next.match(/^[\s#`>!\-*]/)
              ? next.trim()
              : "Evidencia técnica";
          content.push({ kind: "image", src: imgMatch[1].trim(), caption });
          continue;
        }

        // ── Imagen URL externa ──
        const extImg = l.match(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
        if (extImg) {
          flushNote();
          content.push({
            kind: "image",
            src: extImg[2],
            caption: extImg[1] || "Evidencia técnica",
          });
          continue;
        }

        // ── Bullet ──
        const bulletMatch = l.match(/^[-*]\s+(.+)$/);
        if (bulletMatch) {
          flushNote();
          const c = bulletMatch[1]
            .replace(/\*\*/g, "")
            .replace(/`([^`]+)`/g, "$1")
            .trim();
          if (c.length > 4) content.push({ kind: "bullet", text: c });
          continue;
        }

        // ── Texto plano → note ──
        const cleanLine = l
          .replace(/\*{3}[^*]+\*{3}/g, "[flag]")
          .replace(/\*\*/g, "")
          .replace(/`([^`]+)`/g, "$1")
          .trim();
        if (cleanLine.length > 0) noteLines.push(cleanLine);
      }

      // Flush finales
      if (inCallout) flushCallout();
      flushNote();

      // Si no hay ningún content, agregar nota placeholder
      if (content.length === 0)
        content.push({ kind: "note", text: "Ver detalles del paso." });

      steps.push({ id: subStepId, num: subNum, title: subTitle, content });
    }
  }

  return { tags, summary, steps, lessons, mitigation, detectedFlags, tools };
}

// ─── GENERATOR ────────────────────────────────────────────────────────────────

function generate(meta, data) {
  const { tags, summary, steps, lessons, mitigation, tools } = data;
  const slug = meta.slug || slugify(meta.title);
  const year = meta.date ? meta.date.split("-")[0] : new Date().getFullYear();
  const allTags = tags.length ? tags : ["Web Security", "Pentesting"];
  const df = data.detectedFlags || [];

  let out = `---\ntitle: "${meta.title}"\nplatform: "${meta.platform}"\nos: "${meta.os}"\ndifficulty: "${meta.diff}"\nip: "${meta.ip || "10.10.10.XXX"}"\nslug: "${slug}"\nauthor: "Z4k7"\ndate: "${meta.date || new Date().toISOString().split("T")[0]}"\nyear: "${year}"\nstatus: "pwned"\ntags:\n`;
  allTags.forEach((t) => (out += `  - "${t}"\n`));
  out += 'techniques:\n  - "Completar manualmente"\n';
  // tools: extraídas de "herramientas: x, y, z" en el .md
  out += "tools:\n";
  if (tools && tools.length > 0) {
    tools.forEach((t) => (out += `  - "${t}"\n`));
  } else {
    out += `  - "Completar herramientas"\n`;
  }
  out += "flags_list:\n";
  if (df.length > 0) {
    df.forEach((f) => {
      out += `  - label: "${f.label}"\n`;
      out += `    value: "${f.value}"\n`;
    });
  } else {
    out += `  - label: "user"\n    value: "hash_aqui"\n`;
    out += `  - label: "root"\n    value: "hash_aqui"\n`;
  }
  out += `summary: "${(summary || "Descripción del vector de ataque.").replace(/"/g, "'")}"\n`;
  out += "steps:\n";

  steps.forEach((step) => {
    if (step.type === "flag") {
      out += `\n  - id: "${step.id}"\n    type: "flag"\n`;
      out += `    flag_items:\n`;
      (step.flagItems || []).forEach((f) => {
        out += `      - label: "${f.label}"\n        value: "${f.value}"\n`;
      });
      return;
    }
    const titleVal = step.title ? step.title.replace(/"/g, "'") : "";
    out += `\n  - id: "${step.id}"\n    num: "${step.num}"\n`;
    if (titleVal) out += `    title: "${titleVal}"\n`;
    out += `    content:\n`;
    (step.content || []).forEach((item) => {
      if (item.kind === "note") {
        out += `      - kind: "note"\n        text: |\n`;
        item.text.split("\n").forEach((l) => (out += `          ${l}\n`));
      } else if (item.kind === "code") {
        out += `      - kind: "code"\n`;
        out += `        lang: "${item.lang}"\n`;
        out += `        code: |\n`;
        item.code.split("\n").forEach((l) => (out += `          ${l}\n`));
      } else if (item.kind === "image") {
        out += `      - kind: "image"\n`;
        out += `        src: "${item.src}"\n`;
        out += `        caption: "${item.caption.replace(/"/g, "'")}"\n`;
      } else if (item.kind === "bullet") {
        out += `      - kind: "bullet"\n`;
        out += `        text: "${item.text.replace(/"/g, "'")}"\n`;
      } else if (item.kind === "callout") {
        out += `      - kind: "callout"\n`;
        out += `        type: "${item.type}"\n`;
        out += `        label: "${item.label.replace(/"/g, "'")}"\n`;
        out += `        text: "${item.text.replace(/"/g, "'")}"\n`;
      }
    });
  });

  out += `\nlessons:\n`;
  if (lessons.length > 0)
    lessons.forEach((l) => (out += `  - "${l.replace(/"/g, "'")}"\n`));
  else out += `  - "Completar lecciones aprendidas"\n`;
  out += `mitigation: "${(mitigation || "Completar mitigaciones recomendadas.").replace(/"/g, "'")}"\n---\n`;
  return out;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const INITIAL_META = {
  title: "",
  slug: "",
  platform: "HackTheBox",
  os: "Windows",
  diff: "Easy",
  ip: "",
  date: today,
};

export default function ConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState(INITIAL_META);
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState({
    type: "",
    msg: "// Esperando — completa los metadatos y pega tu nota",
  });
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(null);

  const updateMeta = (key, val) => {
    setMeta((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "title" && !prev.slug) next.slug = slugify(val);
      return next;
    });
  };

  const showToast = () => {
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2500);
  };

  const buildPreview = useCallback((data) => {
    const chips = [];
    data.steps.forEach((s) => chips.push({ type: "step", ...s }));
    if (data.tags.length)
      chips.push({ type: "tags", tags: data.tags.slice(0, 6) });
    if (data.lessons.length)
      chips.push({ type: "lessons", count: data.lessons.length });
    setPreview(chips);
  }, []);

  const convertir = useCallback(() => {
    if (!input.trim()) {
      setStatus({
        type: "error",
        msg: "// Error: pega tu nota de Obsidian en el panel izquierdo",
      });
      return;
    }
    if (!meta.title) {
      setStatus({ type: "warn", msg: "// Aviso: completa al menos el Título" });
      return;
    }
    try {
      const data = parse(input);
      const yaml = generate(meta, data);
      setOutput(yaml);
      buildPreview(data);

      const allContent = data.steps.flatMap((s) => s.content || []);
      const counts = {
        pasos: data.steps.filter((s) => s.type !== "flag").length,
        flags: data.steps
          .filter((s) => s.type === "flag")
          .flatMap((s) => s.flagItems || []).length,
        tags: data.tags.length,
        tools: data.tools?.length || 0,
        callouts: allContent.filter((c) => c.kind === "callout").length,
        images: allContent.filter((c) => c.kind === "image").length,
        codes: allContent.filter((c) => c.kind === "code").length,
        bullets: allContent.filter((c) => c.kind === "bullet").length,
        lessons: data.lessons.length,
      };
      const parts = [
        `${counts.pasos} pasos`,
        counts.flags && `${counts.flags} flags`,
        counts.tags && `${counts.tags} tags`,
        counts.tools && `${counts.tools} tools`,
        counts.callouts && `${counts.callouts} callouts`,
        counts.images && `${counts.images} imgs`,
        counts.codes && `${counts.codes} code`,
        counts.bullets && `${counts.bullets} bullets`,
        counts.lessons && `${counts.lessons} lecciones`,
      ].filter(Boolean);
      setStatus({ type: "ok", msg: `// ✓ ${parts.join("  |  ")}` });
    } catch (e) {
      setStatus({ type: "error", msg: `// Error: ${e.message}` });
    }
  }, [input, meta, buildPreview]);

  const copiar = useCallback(() => {
    if (!output) {
      setStatus({ type: "error", msg: "// Primero convierte una nota" });
      return;
    }
    navigator.clipboard.writeText(output).then(() => {
      showToast();
      setStatus({
        type: "ok",
        msg: `// ✓ Copiado — pégalo en content/writeups/${meta.slug || "nombre"}.md`,
      });
    });
  }, [output, meta.slug]);

  const limpiar = () => {
    setInput("");
    setOutput("");
    setMeta(INITIAL_META);
    setPreview([]);
    setStatus({ type: "", msg: "// Listo para nueva conversión" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Fira+Code:wght@400;500&display=swap');
        :root{--bg:#050a0e;--bg2:#0a1520;--bg3:#0d1f2d;--green:#00ff88;--cyan:#00d4ff;--red:#ff3366;--orange:#ff8c00;--yellow:#ffcc00;--text:#c8d8e8;--muted:#4a6a7a;--border:#1a3a4a}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:16px;min-height:100vh}
        body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,255,136,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.02) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0}
        .wrap{max-width:1500px;margin:0 auto;padding:2rem;position:relative;z-index:1}
        .header{text-align:center;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid var(--border)}
        .header-tag{font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--muted);letter-spacing:3px;margin-bottom:.8rem}
        .header h1{font-size:2.2rem;font-weight:700;color:#fff;letter-spacing:4px}
        .header h1 span{color:var(--green)}
        .header p{font-family:'Share Tech Mono',monospace;font-size:.75rem;color:var(--muted);margin-top:.5rem}
        .legend{display:flex;flex-wrap:wrap;gap:.8rem;margin-bottom:2rem;padding:1rem 1.2rem;background:var(--bg2);border:1px solid var(--border)}
        .legend-title{font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted);letter-spacing:2px;width:100%;margin-bottom:.3rem}
        .leg-item{font-family:'Share Tech Mono',monospace;font-size:.7rem;padding:3px 10px;border:1px solid var(--border);display:flex;align-items:center;gap:.5rem}
        .leg-item.green{color:var(--green);background:rgba(0,255,136,0.05);border-color:rgba(0,255,136,0.3)}
        .leg-item.cyan{color:var(--cyan);background:rgba(0,212,255,0.05);border-color:rgba(0,212,255,0.3)}
        .leg-item.orange{color:var(--orange);background:rgba(255,140,0,0.05);border-color:rgba(255,140,0,0.3)}
        .leg-item.yellow{color:var(--yellow);background:rgba(255,204,0,0.05);border-color:rgba(255,204,0,0.3)}
        .leg-item.red{color:var(--red);background:rgba(255,51,102,0.05);border-color:rgba(255,51,102,0.3)}
        .meta-box{background:var(--bg2);border:1px solid var(--border);padding:1.5rem;margin-bottom:1.5rem}
        .box-label{font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:1rem}
        .meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
        .field{display:flex;flex-direction:column;gap:.4rem}
        .field label{font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted)}
        .field input,.field select{background:var(--bg);border:1px solid var(--border);color:var(--text);padding:7px 10px;font-family:'Share Tech Mono',monospace;font-size:.75rem;outline:none;transition:border-color .2s}
        .field input:focus,.field select:focus{border-color:var(--green)}
        .field select option{background:var(--bg2)}
        .editors{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem}
        .panel{border:1px solid var(--border);overflow:hidden}
        .panel-head{background:var(--bg3);padding:9px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
        .panel-name{font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--green);display:flex;align-items:center;gap:.5rem}
        .dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .panel-sub{font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted)}
        textarea{width:100%;height:520px;background:var(--bg);color:var(--text);border:none;padding:1.2rem;font-family:'Fira Code',monospace;font-size:.78rem;line-height:1.75;resize:vertical;outline:none}
        .output-ta{background:#020608;color:var(--green)}
        textarea::placeholder{color:var(--muted);font-size:.72rem}
        .status{font-family:'Share Tech Mono',monospace;font-size:.72rem;padding:8px 16px;border:1px solid var(--border);color:var(--muted);margin-bottom:1.2rem;display:flex;align-items:center;gap:.6rem;background:var(--bg2)}
        .status.ok{border-color:var(--green);color:var(--green)}
        .status.error{border-color:var(--red);color:var(--red)}
        .status.warn{border-color:var(--orange);color:var(--orange)}
        .preview{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.2rem}
        .chip{font-family:'Share Tech Mono',monospace;font-size:.65rem;padding:3px 10px;border:1px solid var(--border);color:var(--muted);background:var(--bg2);display:flex;align-items:center;gap:.4rem}
        .chip.active{color:var(--green);border-color:rgba(0,255,136,0.4);background:rgba(0,255,136,0.05)}
        .chip .n{color:var(--green);font-weight:700}
        .btns{display:flex;gap:1rem;justify-content:center;margin-bottom:2rem}
        .btn{font-family:'Share Tech Mono',monospace;font-size:.78rem;letter-spacing:2px;padding:10px 30px;border:1px solid var(--green);background:transparent;color:var(--green);cursor:pointer;transition:all .2s;text-transform:uppercase}
        .btn:hover{background:var(--green);color:var(--bg)}
        .btn-cyan{border-color:var(--cyan);color:var(--cyan)}
        .btn-cyan:hover{background:var(--cyan);color:var(--bg)}
        .btn-muted{border-color:var(--muted);color:var(--muted)}
        .btn-muted:hover{background:var(--muted);color:var(--bg)}
        .toast{position:fixed;bottom:2rem;right:2rem;background:var(--bg3);border:1px solid var(--green);color:var(--green);font-family:'Share Tech Mono',monospace;font-size:.75rem;padding:10px 20px;z-index:999;opacity:0;transform:translateY(20px);transition:all .3s;pointer-events:none}
        .toast.show{opacity:1;transform:translateY(0)}
        .footer{text-align:center;padding-top:2rem;border-top:1px solid var(--border);font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--muted)}
        .footer span{color:var(--green)}
        @media(max-width:900px){.editors{grid-template-columns:1fr}.meta-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <div className="wrap">
        <div className="header">
          <div className="header-tag">// Z4K7 · TOOLS · CONVERSOR</div>
          <h1>
            OBSIDIAN <span>→</span> PORTFOLIO
          </h1>
          <p>
            // Convierte tus notas de Obsidian al formato .md del portafolio
          </p>
        </div>

        <div className="legend">
          <div className="legend-title">// Reglas de conversión:</div>
          <div className="leg-item green">
            <b>##</b> Secciones → Pasos
          </div>
          <div className="leg-item cyan">
            <b>```</b> Código → code:
          </div>
          <div className="leg-item orange">
            <b>&gt;[!INFO]</b> Callouts → callout_type:
          </div>
          <div className="leg-item yellow">
            <b>- item</b> Listas → bullet_list
          </div>
          <div className="leg-item red">
            <b>#tag</b> Hashtags → tags:
          </div>
          <div className="leg-item cyan">
            <b>![[img.png]]</b> Imágenes → images:
          </div>
          <div className="leg-item green">
            <b>### Flag</b> Flags inline → flag_items:
          </div>
          <div className="leg-item orange">
            <b>***label***:valor</b> Par credencial
          </div>
          <div className="leg-item yellow">
            <b>---</b> Separador de sub-pasos
          </div>
          <div className="leg-item cyan">
            <b>herramientas:</b> nmap, gobuster → tools:
          </div>
        </div>

        <div className="meta-box">
          <div className="box-label">// 01. Metadatos</div>
          <div className="meta-grid">
            <div className="field">
              <label>Título</label>
              <input
                type="text"
                placeholder="Forest"
                value={meta.title}
                onChange={(e) => updateMeta("title", e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Slug{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                  (URL del writeup)
                </span>
              </label>
              <input
                type="text"
                placeholder="forest"
                value={meta.slug}
                onChange={(e) => updateMeta("slug", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Platform</label>
              <select
                value={meta.platform}
                onChange={(e) => updateMeta("platform", e.target.value)}
              >
                <option>HackTheBox</option>
                <option>TryHackMe</option>
                <option>PortSwigger</option>
                <option>VulnHub</option>
              </select>
            </div>
            <div className="field">
              <label>OS</label>
              <select
                value={meta.os}
                onChange={(e) => updateMeta("os", e.target.value)}
              >
                <option>Windows</option>
                <option>Linux</option>
                <option>Web Application</option>
              </select>
            </div>
            <div className="field">
              <label>Difficulty</label>
              <select
                value={meta.diff}
                onChange={(e) => updateMeta("diff", e.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Insane</option>
              </select>
            </div>
            <div className="field">
              <label>IP / URL</label>
              <input
                type="text"
                placeholder="10.10.10.161"
                value={meta.ip}
                onChange={(e) => updateMeta("ip", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Fecha</label>
              <input
                type="date"
                value={meta.date}
                onChange={(e) => updateMeta("date", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="editors">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-name">
                <div className="dot"></div> INPUT — Nota de Obsidian
              </div>
              <span className="panel-sub">pega tu .md aquí</span>
            </div>
            <textarea
              placeholder="## Reconocimiento..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="panel">
            <div className="panel-head">
              <div className="panel-name">
                <div className="dot"></div> OUTPUT — .md para portafolio
              </div>
              <span className="panel-sub">content/writeups/slug.md</span>
            </div>
            <textarea
              className="output-ta"
              readOnly
              placeholder="// El .md generado aparecerá aquí..."
              value={output}
            />
          </div>
        </div>

        <div className={`status${status.type ? " " + status.type : ""}`}>
          {status.msg}
        </div>

        {preview.length > 0 && (
          <div className="preview">
            {preview.map((chip, i) => {
              if (chip.type === "tags")
                return (
                  <div key={i} className="chip">
                    <span style={{ color: "var(--red)" }}>#</span>
                    {chip.tags.join(", ")}
                  </div>
                );
              if (chip.type === "lessons")
                return (
                  <div key={i} className="chip">
                    <span style={{ color: "var(--green)" }}>lessons</span>
                    {chip.count}
                  </div>
                );
              return (
                <div key={i} className="chip active">
                  <span className="n">{chip.num}</span>
                  {chip.title}
                  {chip.content?.some((c) => c.kind === "code") && (
                    <span style={{ color: "var(--cyan)" }}>code</span>
                  )}
                  {chip.content?.filter((c) => c.kind === "image").length >
                    0 && (
                    <span style={{ color: "var(--yellow)" }}>
                      {chip.content.filter((c) => c.kind === "image").length}img
                    </span>
                  )}
                  {chip.content?.filter((c) => c.kind === "callout").length >
                    0 && (
                    <span style={{ color: "var(--orange)" }}>
                      [!]
                      {chip.content.filter((c) => c.kind === "callout").length}
                    </span>
                  )}
                  {chip.content?.filter((c) => c.kind === "bullet").length >
                    0 && (
                    <span style={{ color: "var(--muted)" }}>
                      {chip.content.filter((c) => c.kind === "bullet").length}
                      items
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="btns">
          <button className="btn" onClick={convertir}>
            ⚡ CONVERTIR
          </button>
          <button className="btn btn-cyan" onClick={copiar}>
            ⎖ COPIAR .MD
          </button>
          <button className="btn btn-muted" onClick={limpiar}>
            ✕ LIMPIAR
          </button>
        </div>

        <div className="footer">
          <span>Z4k7</span> · Conversor Obsidian → Portfolio · <span>2026</span>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>
        ✓ Copiado al portapapeles
      </div>
    </>
  );
}

"use client";
import { useState, useCallback, useRef } from "react";

const GITHUB_USER = "z4k73122";
const GITHUB_REPO = "z4k7";

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

  const tagMatches = text.match(/#([A-Za-z\u00C0-\u024F]\w+)/g) || [];
  tagMatches.forEach((t) => {
    const c = t.replace("#", "").trim();
    const skip = ["INFO", "WARNING", "SUCCESS", "ABSTRACT", "DANGER", "TIP"];
    if (c.length > 2 && !skip.includes(c.toUpperCase())) tags.push(c);
  });
  tags = [...new Set(tags)];

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

  let tools = [];
  const toolsMatch = text.match(/^herramientas\s*:\s*(.+)$/im);
  if (toolsMatch)
    tools = toolsMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

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
  if (blocks.length === 0 && text.trim().length > 0)
    blocks.push({ title: "Paso sin título", lines: text.split("\n") });

  let stepNum = 1,
    flagCount = 0;

  for (const block of blocks) {
    const tl = block.title.toLowerCase();
    const body = block.lines.join("\n");

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
    if (mitigSections.some((k) => tl.includes(k))) {
      mitigation = body
        .replace(/^[>\s]*\[!.*?\]\s*/gm, "")
        .replace(/^[>\s\-*]+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .trim();
      continue;
    }
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
    if (skipSections.some((k) => tl.includes(k))) continue;
    if (!body.trim()) continue;

    const def = idMap.find((s) => s.keys.some((k) => tl.includes(k)));
    const stepId = def ? def.id : `step${stepNum}`;
    const blockNum = String(stepNum).padStart(2, "0");
    stepNum++;

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
        if (currentCallout)
          content.push({
            kind: "callout",
            type: currentCallout.type,
            label: currentCallout.label,
            text: calloutLines.join(" ").replace(/\*\*/g, "").trim(),
          });
        inCallout = false;
        calloutLines = [];
        currentCallout = null;
      };

      for (let i = 0; i < sLines.length; i++) {
        const l = sLines[i];
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
          } else flushCallout();
        }
        const assetsImg = l.match(/!\[([^\]]*)\]\(assets\/images\/([^)]+)\)/i);
        if (assetsImg) {
          flushNote();
          content.push({
            kind: "image",
            src: assetsImg[2].trim(),
            caption: assetsImg[1].trim() || "Evidencia técnica",
          });
          continue;
        }
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
        const cleanLine = l
          .replace(/\*{3}[^*]+\*{3}/g, "[flag]")
          .replace(/\*\*/g, "")
          .replace(/`([^`]+)`/g, "$1")
          .trim();
        if (cleanLine.length > 0) noteLines.push(cleanLine);
      }
      if (inCallout) flushCallout();
      flushNote();
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
  out += "tools:\n";
  if (tools && tools.length > 0) tools.forEach((t) => (out += `  - "${t}"\n`));
  else out += `  - "Completar herramientas"\n`;
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

// ─── TOKEN SCREEN ─────────────────────────────────────────────────────────────

function TokenScreen({ onValid }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (res.ok) {
        onValid(token);
      } else {
        const e = await res.json();
        setError(e.message || "Token inválido");
      }
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#050a0e",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Share Tech Mono',monospace",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.02) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "480px",
          padding: "2rem",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "#00ff88",
            letterSpacing: "3px",
            marginBottom: "0.4rem",
          }}
        >
          {"<z4k7_tools/>"}
        </div>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}
        >
          conversor
        </h1>
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right,#1a3a4a,transparent)",
            marginBottom: "2.5rem",
          }}
        />
        <div
          style={{
            fontSize: "0.62rem",
            color: "#4a6a7a",
            letterSpacing: "2px",
            marginBottom: "0.6rem",
          }}
        >
          // GITHUB TOKEN
        </div>
        <div
          style={{
            fontSize: "0.68rem",
            color: "#4a6a7a",
            marginBottom: "1.2rem",
            lineHeight: 1.8,
          }}
        >
          Requerido para guardar el{" "}
          <span style={{ color: "#00d4ff" }}>.md</span> en el repo.
          <br />
          github.com → Settings → Developer settings → Tokens (classic) →{" "}
          <span style={{ color: "#00ff88" }}>repo ✓</span>
        </div>
        <input
          type="password"
          placeholder="ghp_..."
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && token && validate()}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            padding: "12px 14px",
            background: "#060d14",
            border: `1px solid ${error ? "#ff3366" : token ? "#00d4ff" : "#1a3a4a"}`,
            color: "#c8d8e8",
            outline: "none",
            letterSpacing: "1px",
            boxSizing: "border-box",
            marginBottom: "0.8rem",
          }}
        />
        {error && (
          <div
            style={{
              fontSize: "0.65rem",
              color: "#ff3366",
              marginBottom: "0.8rem",
            }}
          >
            ✕ {error}
          </div>
        )}
        <button
          onClick={validate}
          disabled={!token || loading}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: "0.78rem",
            padding: "12px",
            border: `1px solid ${!token ? "#1a3a4a" : "#00ff88"}`,
            background: !token ? "transparent" : "rgba(0,255,136,0.08)",
            color: !token ? "#1a3a4a" : "#00ff88",
            cursor: !token || loading ? "not-allowed" : "pointer",
            letterSpacing: "2px",
          }}
        >
          {loading ? "// Validando..." : "// Validar token →"}
        </button>
        <div
          style={{
            marginTop: "1.5rem",
            fontSize: "0.6rem",
            color: "#1a3a4a",
            textAlign: "center",
          }}
        >
          El token no se guarda — solo se usa en esta sesión
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];
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
  const [token, setToken] = useState("");
  const [tokenOk, setTokenOk] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState(INITIAL_META);
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState({
    type: "",
    msg: "// Esperando — completa los metadatos y pega tu nota",
  });
  const [toast, setToast] = useState(false);
  const [modal, setModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const toastTimer = useRef(null);

  if (!tokenOk)
    return (
      <TokenScreen
        onValid={(t) => {
          setToken(t);
          setTokenOk(true);
        }}
      />
    );

  const updateMeta = (key, val) =>
    setMeta((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "title") next.slug = slugify(val);
      return next;
    });
  const showToast = () => {
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2500);
  };

  const buildPreview = (data) => {
    const chips = [];
    data.steps.forEach((s) => chips.push({ type: "step", ...s }));
    if (data.tags.length)
      chips.push({ type: "tags", tags: data.tags.slice(0, 6) });
    if (data.lessons.length)
      chips.push({ type: "lessons", count: data.lessons.length });
    setPreview(chips);
  };

  const convertir = () => {
    if (!input.trim()) {
      setStatus({ type: "error", msg: "// Error: pega tu nota de Obsidian" });
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
      setPreviewData(data);
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
  };

  const copiar = () => {
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
  };

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
        .token-bar{display:flex;align-items:center;justify-content:space-between;background:rgba(0,255,136,0.04);border:1px solid rgba(0,255,136,0.2);padding:8px 16px;margin-bottom:1.5rem;font-family:'Share Tech Mono',monospace;font-size:.68rem}
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
        .btns{display:flex;gap:1rem;justify-content:center;margin-bottom:2rem;flex-wrap:wrap}
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

        <div className="token-bar">
          <span style={{ color: "#00ff88" }}>
            ✓ token validado — GitHub API activa
          </span>
          <button
            onClick={() => {
              setTokenOk(false);
              setToken("");
            }}
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              padding: "3px 10px",
              border: "1px solid #1a3a4a",
              background: "transparent",
              color: "#4a6a7a",
              cursor: "pointer",
            }}
          >
            // cambiar token
          </button>
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
            <b>![](assets/images/f.png)</b> Imágenes → src: f.png
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
                placeholder="se genera del título"
                value={meta.slug}
                readOnly
                style={{ cursor: "not-allowed", opacity: 0.6 }}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                <span className="panel-sub">content/writeups/slug.md</span>
                <button
                  onClick={() => {
                    if (output) setModal(true);
                    else
                      setStatus({
                        type: "warn",
                        msg: "// Primero convierte una nota para previsualizar",
                      });
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--muted)",
                    color: output ? "var(--cyan)" : "var(--muted)",
                    padding: "3px 10px",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    cursor: output ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  👁 preview
                </button>
              </div>
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

      {modal && output && (
        <PreviewModal
          output={output}
          slug={meta.slug}
          meta={meta}
          parsedData={previewData}
          token={token}
          onClose={() => setModal(false)}
        />
      )}
    </>
  );
}

// ─── CALLOUT COLORS ───────────────────────────────────────────────────────────

const CALLOUT_COLORS = {
  info: {
    border: "#00d4ff",
    bg: "rgba(0,212,255,0.07)",
    label: "#00d4ff",
    icon: "ℹ",
  },
  warning: {
    border: "#ff8c00",
    bg: "rgba(255,140,0,0.07)",
    label: "#ff8c00",
    icon: "⚠",
  },
  danger: {
    border: "#ff3366",
    bg: "rgba(255,51,102,0.07)",
    label: "#ff3366",
    icon: "✕",
  },
  default: {
    border: "#00ff88",
    bg: "rgba(0,255,136,0.06)",
    label: "#00ff88",
    icon: "✓",
  },
  tip: {
    border: "#a78bfa",
    bg: "rgba(167,139,250,0.07)",
    label: "#a78bfa",
    icon: "💡",
  },
};

// ─── PREVIEW MODAL ────────────────────────────────────────────────────────────

function PreviewModal({ output, slug, meta, parsedData, token, onClose }) {
  if (!parsedData) return null;
  const { tags, tools, summary, steps, lessons, mitigation } = parsedData;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 9999,
        overflowY: "auto",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "900px",
          margin: "2rem auto 4rem",
          background: "#0a1520",
          border: "1px solid #1a3a4a",
          padding: "2.5rem",
          position: "relative",
          fontFamily: "'Rajdhani',sans-serif",
          color: "#c8d8e8",
          fontSize: "16px",
          lineHeight: "1.7",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "1px solid #1a3a4a",
            color: "#4a6a7a",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          ✕ cerrar
        </button>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.65rem",
            color: "#4a6a7a",
            letterSpacing: "3px",
            marginBottom: "1.2rem",
          }}
        >
          // PREVIEW — así se verá en el portafolio
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            [meta.platform, "#00ff88", "0,255,136"],
            [meta.diff, "#4ade80", "74,222,128"],
            [meta.os, "#00d4ff", "0,212,255"],
          ].map(([v, c, r], i) => (
            <span
              key={i}
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                padding: "3px 12px",
                border: `1px solid ${c}`,
                color: c,
                background: `rgba(${r},0.08)`,
              }}
            >
              {v}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "3px",
            lineHeight: 1,
            marginBottom: "0.8rem",
          }}
        >
          {meta.title}
          <span style={{ color: "#00ff88" }}>.</span>
        </h1>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "#4a6a7a",
            marginBottom: "1.2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span>
            by <span style={{ color: "#00ff88" }}>{meta.author || "Z4k7"}</span>
          </span>
          <span style={{ color: "#1a3a4a" }}>|</span>
          <span>{meta.date}</span>
          {meta.ip && (
            <>
              <span style={{ color: "#1a3a4a" }}>|</span>
              <span>{meta.ip}</span>
            </>
          )}
        </div>

        {tags?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginBottom: "1rem",
            }}
          >
            {tags.map((t, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  border: "1px solid #1a3a4a",
                  color: "#4a6a7a",
                  background: "rgba(0,255,136,0.04)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {tools?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginBottom: "1rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#4a6a7a",
              }}
            >
              tools:
            </span>
            {tools.map((t, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  border: "1px solid #1a3a4a",
                  color: "#00d4ff",
                  background: "rgba(0,212,255,0.05)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {summary && (
          <div
            style={{
              borderLeft: "3px solid #00d4ff",
              background: "rgba(0,212,255,0.05)",
              padding: "0.8rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#00d4ff",
                letterSpacing: "2px",
                marginBottom: "0.3rem",
              }}
            >
              // Resumen ejecutivo
            </div>
            <p style={{ margin: 0 }}>{summary}</p>
          </div>
        )}

        <div style={{ borderTop: "1px solid #1a3a4a", marginBottom: "2rem" }} />

        {(steps || []).map((step, idx) => {
          const hasTitle = step.num && step.num !== "";
          return (
            <div key={idx} style={{ marginBottom: "2.5rem" }}>
              {step.type === "flag" && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(0,255,136,0.08),rgba(0,212,255,0.05))",
                    border: "1px solid #1a3a4a",
                    padding: "1.5rem",
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      color: "#00ff88",
                      fontSize: "1.1rem",
                      letterSpacing: "3px",
                      marginBottom: "1rem",
                    }}
                  >
                    ✓ {step.id.toUpperCase()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {(step.flagItems || []).map((f, fi) => (
                      <div key={fi} style={{ minWidth: "160px" }}>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.6rem",
                            color: "#4a6a7a",
                            marginBottom: "0.3rem",
                          }}
                        >
                          // {f.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            background: "#020608",
                            border: "1px dashed #00ff88",
                            padding: "0.4rem 0.8rem",
                            color: "#00ff88",
                            wordBreak: "break-all",
                          }}
                        >
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasTitle && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      color: "#00ff88",
                      background: "rgba(0,255,136,0.08)",
                      border: "1px solid #1a3a4a",
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PASO {step.num}
                  </span>
                  <h2
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h2>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background:
                        "linear-gradient(to right,#1a3a4a,transparent)",
                    }}
                  />
                </div>
              )}
              {(step.content || []).map((item, ci) => {
                if (item.kind === "note")
                  return (
                    <p
                      key={ci}
                      style={{
                        color: "#c8d8e8",
                        whiteSpace: "pre-line",
                        marginBottom: "0.8rem",
                      }}
                    >
                      {item.text}
                    </p>
                  );
                if (item.kind === "code")
                  return (
                    <div
                      key={ci}
                      style={{
                        margin: "1rem 0",
                        border: "1px solid #1a3a4a",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "#0d1f2d",
                          padding: "6px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #1a3a4a",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.68rem",
                            color: "#4a6a7a",
                          }}
                        >
                          {step.title || "código"} — comandos
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.62rem",
                            color: "#00ff88",
                            background: "rgba(0,255,136,0.1)",
                            padding: "1px 6px",
                          }}
                        >
                          {item.lang}
                        </span>
                      </div>
                      <pre
                        style={{
                          background: "#020608",
                          padding: "1rem 1.2rem",
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          color: "#00ff88",
                          overflowX: "auto",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {item.code}
                      </pre>
                    </div>
                  );
                if (item.kind === "image")
                  return (
                    <div
                      key={ci}
                      style={{
                        border: "1px solid #1a3a4a",
                        overflow: "hidden",
                        margin: "0.8rem 0",
                      }}
                    >
                      <div
                        style={{
                          background: "#0d1f2d",
                          padding: "5px 12px",
                          borderBottom: "1px solid #1a3a4a",
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          color: "#4a6a7a",
                        }}
                      >
                        ▸ // Evidencia técnica
                      </div>
                      <div
                        style={{
                          background: "#020608",
                          padding: "1rem",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={item.src}
                          alt={item.caption}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            objectFit: "contain",
                            border: "1px solid #1a3a4a",
                          }}
                        />
                      </div>
                      {item.caption && (
                        <div
                          style={{
                            padding: "5px 12px",
                            fontFamily: "monospace",
                            fontSize: "0.68rem",
                            color: "#4a6a7a",
                            borderTop: "1px solid #1a3a4a",
                            background: "#0d1f2d",
                          }}
                        >
                          ↑ {item.caption}
                        </div>
                      )}
                    </div>
                  );
                if (item.kind === "bullet")
                  return (
                    <div
                      key={ci}
                      style={{
                        display: "flex",
                        gap: "0.6rem",
                        padding: "0.5rem 0.8rem",
                        background: "#0d1f2d",
                        border: "1px solid #1a3a4a",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#00ff88",
                          fontFamily: "monospace",
                          flexShrink: 0,
                        }}
                      >
                        →
                      </span>{" "}
                      {item.text}
                    </div>
                  );
                if (item.kind === "callout") {
                  const c = CALLOUT_COLORS[item.type] || CALLOUT_COLORS.info;
                  return (
                    <div
                      key={ci}
                      style={{
                        borderLeft: `3px solid ${c.border}`,
                        background: c.bg,
                        padding: "0.8rem 1rem",
                        margin: "0.8rem 0",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          letterSpacing: "2px",
                          color: c.label,
                          marginBottom: "0.3rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span>{c.icon}</span>
                        <span>// {item.label}</span>
                      </div>
                      <p style={{ color: "#c8d8e8", margin: 0 }}>{item.text}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}

        {lessons?.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.68rem",
                  color: "#00ff88",
                  background: "rgba(0,255,136,0.08)",
                  border: "1px solid #1a3a4a",
                  padding: "2px 8px",
                }}
              >
                LECCIONES
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "linear-gradient(to right,#1a3a4a,transparent)",
                }}
              />
            </div>
            {lessons.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  padding: "0.5rem 0.8rem",
                  background: "#0d1f2d",
                  border: "1px solid #1a3a4a",
                  marginBottom: "0.3rem",
                }}
              >
                <span
                  style={{
                    color: "#00ff88",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  →
                </span>{" "}
                {l}
              </div>
            ))}
          </div>
        )}
        {mitigation && (
          <div
            style={{
              borderLeft: "3px solid #00d4ff",
              background: "rgba(0,212,255,0.05)",
              padding: "0.8rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#00d4ff",
                letterSpacing: "2px",
                marginBottom: "0.3rem",
              }}
            >
              // Mitigaciones recomendadas
            </div>
            <p style={{ color: "#c8d8e8", margin: 0 }}>{mitigation}</p>
          </div>
        )}

        <div
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #1a3a4a",
          }}
        >
          <SaveBlock
            output={output}
            slug={slug}
            token={token}
            onSaved={() => setTimeout(() => onClose(), 1200)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── SAVE BLOCK ───────────────────────────────────────────────────────────────

const safeSeg = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "");
const parsePathInput = (raw) => raw.split("/").map(safeSeg).filter(Boolean);

function SaveBlock({ output, slug, token, onSaved }) {
  const [phase, setPhase] = useState("idle");
  const [pathInput, setPathInput] = useState("");
  const [tree, setTree] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [savedPath, setSavedPath] = useState("");
  const [nameError, setNameError] = useState("");
  const S = { fontFamily: "monospace" };

  const loadTree = async () => {
    try {
      const res = await fetch("/api/writeups/--tree");
      const data = await res.json();
      setTree(data.tree || {});
    } catch {
      setTree({});
    }
  };

  const openSelector = async () => {
    await loadTree();
    setPhase("open");
    setPathInput("");
    setNameError("");
    setSaveError("");
  };

  const segs = parsePathInput(pathInput);
  const rawParts = pathInput.split("/");
  const doneParts = rawParts.slice(0, -1).map(safeSeg).filter(Boolean);
  const current = safeSeg(rawParts[rawParts.length - 1]);
  const getNode = (node, path) => {
    if (!node || path.length === 0) return node;
    return getNode(node[path[0]]?.children, path.slice(1));
  };
  const doneNode = getNode(tree, doneParts);
  const siblings = doneNode ? Object.keys(doneNode) : [];
  const exactMatch = siblings.includes(current);
  const filtered = current
    ? siblings.filter((k) => k.startsWith(current))
    : siblings;
  const destParts = current ? [...doneParts, current] : doneParts;
  const destPath = destParts.join("/");

  const handleConfirm = async () => {
    setNameError("");
    if (!destPath) {
      setNameError("Escribe una ruta destino");
      return;
    }
    setPhase("saving");
    setSaveError("");
    try {
      // Verificar duplicado
      const checkRes = await fetch(
        `/api/writeups/${slug || "writeup"}?folder=${encodeURIComponent(destPath)}`,
      );
      const checkData = await checkRes.json();
      if (checkRes.ok && !checkData.error) {
        setSaveError(
          `Ya existe "${slug || "writeup"}.md" en content/${destPath}`,
        );
        setPhase("open");
        return;
      }

      // Guardar con token
      const res = await fetch(`/api/writeups/${slug || "writeup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: output, folder: destPath, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSavedPath(data.path);
      setPhase("done");
      onSaved?.();
    } catch (err) {
      setSaveError(err.message);
      setPhase("open");
    }
  };

  if (phase === "idle")
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={openSelector}
          style={{
            ...S,
            fontSize: "0.78rem",
            letterSpacing: "2px",
            padding: "10px 28px",
            border: "1px solid #00ff88",
            background: "transparent",
            color: "#00ff88",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00ff88";
            e.currentTarget.style.color = "#050a0e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#00ff88";
          }}
        >
          💾 GUARDAR .MD
        </button>
      </div>
    );

  if (phase === "done")
    return (
      <div
        style={{
          ...S,
          fontSize: "0.78rem",
          color: "#00ff88",
          border: "1px solid rgba(0,255,136,0.3)",
          background: "rgba(0,255,136,0.05)",
          padding: "0.8rem 1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        ✓ Guardado en{" "}
        <span style={{ color: "#00d4ff", margin: "0 0.3rem" }}>
          {savedPath}
        </span>{" "}
        — Vercel redesplegará en ~30s
      </div>
    );

  return (
    <div
      style={{
        background: "rgba(0,255,136,0.03)",
        border: "1px solid #1a3a4a",
        padding: "1.4rem 1.6rem",
      }}
    >
      <div
        style={{
          ...S,
          fontSize: "0.65rem",
          color: "#00ff88",
          letterSpacing: "3px",
          marginBottom: "1.2rem",
        }}
      >
        // SELECCIONAR DESTINO
      </div>
      <div
        style={{
          ...S,
          fontSize: "0.72rem",
          color: "#4a6a7a",
          marginBottom: "0.5rem",
        }}
      >
        Ruta destino — usa <span style={{ color: "#00d4ff" }}>/</span> para
        subcarpetas
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            ...S,
            fontSize: "0.78rem",
            color: "#4a6a7a",
            whiteSpace: "nowrap",
          }}
        >
          content/
        </span>
        <input
          autoFocus
          value={pathInput}
          onChange={(e) => {
            setPathInput(e.target.value);
            setNameError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && destPath && handleConfirm()}
          placeholder="htb/maquinas  ó  writeups  ó  ctf/linux/easy"
          style={{
            flex: 1,
            ...S,
            fontSize: "0.8rem",
            background: "#020608",
            border: `1px solid ${nameError ? "#ff3366" : "#1a3a4a"}`,
            color: "#c8d8e8",
            padding: "6px 10px",
            outline: "none",
          }}
        />
      </div>

      {destPath && (
        <div style={{ ...S, fontSize: "0.68rem", marginBottom: "0.8rem" }}>
          {exactMatch ? (
            <span style={{ color: "#00d4ff" }}>
              ℹ Existe — se guardará en{" "}
              <span style={{ color: "#00ff88" }}>content/{destPath}</span>
            </span>
          ) : (
            <span style={{ color: "#00ff88" }}>
              ✓ Se creará{" "}
              <span style={{ color: "#00d4ff" }}>content/{destPath}</span>
            </span>
          )}
        </div>
      )}
      {nameError && (
        <div
          style={{
            ...S,
            fontSize: "0.68rem",
            color: "#ff3366",
            marginBottom: "0.6rem",
          }}
        >
          ✕ {nameError}
        </div>
      )}

      {filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginBottom: "0.9rem",
          }}
        >
          {filtered.map((k) => (
            <span
              key={k}
              onClick={() =>
                setPathInput([...rawParts.slice(0, -1), k].join("/") + "/")
              }
              style={{
                ...S,
                fontSize: "0.68rem",
                padding: "3px 10px",
                border: `1px solid ${k === current ? "#00ff88" : "#1a3a4a"}`,
                color: k === current ? "#00ff88" : "#00d4ff",
                background: k === current ? "rgba(0,255,136,0.07)" : "#0d1f2d",
                cursor: "pointer",
              }}
            >
              📁 {k}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          background: "#020608",
          border: "1px solid #1a3a4a",
          borderLeft: "2px solid #1a3a4a",
          padding: "0.8rem 1rem",
          marginBottom: "1rem",
          maxHeight: "220px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            ...S,
            fontSize: "0.6rem",
            color: "#4a6a7a",
            letterSpacing: "2px",
            marginBottom: "0.4rem",
          }}
        >
          // ESTRUCTURA content/
        </div>
        <TreeNode
          node={tree || {}}
          prefix=""
          label="content"
          depth={0}
          focusPath={destParts}
          S={S}
          onSelect={(path) => setPathInput(path + "/")}
        />
        {destPath && !exactMatch && (
          <div style={{ marginTop: "0.2rem" }}>
            <TreePreview parts={destParts} S={S} />
          </div>
        )}
      </div>

      {destPath && (
        <div
          style={{
            background: "#0d1f2d",
            border: "1px solid rgba(0,255,136,0.25)",
            padding: "0.6rem 1rem",
            marginBottom: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>📄</span>
          <span style={{ ...S, fontSize: "0.82rem", color: "#c8d8e8" }}>
            content/<span style={{ color: "#00ff88" }}>{destPath}</span>/
            <span style={{ color: "#00d4ff" }}>{slug || "writeup"}.md</span>
          </span>
        </div>
      )}
      {saveError && (
        <div
          style={{
            ...S,
            fontSize: "0.72rem",
            color: "#ff3366",
            background: "rgba(255,51,102,0.07)",
            border: "1px solid rgba(255,51,102,0.3)",
            padding: "0.5rem 0.8rem",
            marginBottom: "0.8rem",
          }}
        >
          ✕ {saveError}
        </div>
      )}

      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}
      >
        <button
          onClick={() => {
            setPhase("idle");
            setSaveError("");
            setPathInput("");
          }}
          style={{
            ...S,
            fontSize: "0.72rem",
            letterSpacing: "2px",
            padding: "8px 18px",
            border: "1px solid #4a6a7a",
            background: "transparent",
            color: "#4a6a7a",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#4a6a7a";
            e.currentTarget.style.color = "#050a0e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#4a6a7a";
          }}
        >
          ✕ CANCELAR
        </button>
        {destPath && (
          <button
            onClick={handleConfirm}
            disabled={phase === "saving"}
            style={{
              ...S,
              fontSize: "0.72rem",
              letterSpacing: "2px",
              padding: "8px 26px",
              border: "1px solid #00ff88",
              background:
                phase === "saving"
                  ? "rgba(0,255,136,0.3)"
                  : "rgba(0,255,136,0.1)",
              color: "#00ff88",
              cursor: phase === "saving" ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (phase !== "saving") {
                e.currentTarget.style.background = "#00ff88";
                e.currentTarget.style.color = "#050a0e";
              }
            }}
            onMouseLeave={(e) => {
              if (phase !== "saving") {
                e.currentTarget.style.background = "rgba(0,255,136,0.1)";
                e.currentTarget.style.color = "#00ff88";
              }
            }}
          >
            {phase === "saving"
              ? "⏳ GUARDANDO..."
              : exactMatch
                ? "✓ GUARDAR AQUÍ"
                : "✓ CREAR Y GUARDAR"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── TREE COMPONENTS ──────────────────────────────────────────────────────────

function TreeNode({
  node,
  prefix,
  label,
  depth,
  focusPath,
  S,
  onSelect,
  pathSoFar = "",
}) {
  if (!node) return null;
  const keys = Object.keys(node);
  const fullPath = pathSoFar ? `${pathSoFar}/${label}` : depth > 0 ? label : "";
  const isFocus = focusPath.join("/") === fullPath;
  return (
    <div>
      {depth > 0 && (
        <pre
          onClick={() => fullPath && onSelect(fullPath)}
          style={{
            ...S,
            fontSize: "0.72rem",
            margin: 0,
            lineHeight: "1.8",
            whiteSpace: "pre",
            cursor: "pointer",
            color: isFocus ? "#00ff88" : depth === 1 ? "#c8d8e8" : "#7a9aaa",
          }}
        >
          {prefix}
          <span style={{ color: "#1a4a5a" }}>
            {keys.length ? "├── " : "└── "}
          </span>
          <span>{isFocus ? "📂 " : "📁 "}</span>
          <span>{label}/</span>
          {node._files > 0 && (
            <span style={{ color: "#2a4a5a" }}> ({node._files} .md)</span>
          )}
          {isFocus && <span style={{ color: "#00ff88" }}> ◀</span>}
        </pre>
      )}
      {depth === 0 && (
        <pre
          style={{
            ...S,
            fontSize: "0.72rem",
            margin: 0,
            lineHeight: "1.8",
            color: "#4a6a7a",
          }}
        >
          content/
        </pre>
      )}
      {keys
        .filter((k) => k !== "_files")
        .map((k, i) => {
          const isLast = i === keys.filter((x) => x !== "_files").length - 1;
          const childPrefix =
            depth === 0 ? "" : prefix + (isLast ? "    " : "│   ");
          return (
            <TreeNode
              key={k}
              node={node[k]?.children || {}}
              prefix={childPrefix}
              label={k}
              depth={depth + 1}
              focusPath={focusPath}
              S={S}
              onSelect={onSelect}
              pathSoFar={fullPath}
            />
          );
        })}
    </div>
  );
}

function TreePreview({ parts, S }) {
  return (
    <div>
      {parts.map((p, i) => (
        <pre
          key={i}
          style={{
            ...S,
            fontSize: "0.72rem",
            margin: 0,
            lineHeight: "1.8",
            whiteSpace: "pre",
            color: "#3a5a4a",
          }}
        >
          {"    ".repeat(i)}
          <span style={{ color: "#1a3a2a" }}>└── </span>
          <span>📁 </span>
          <span>{p}/</span>
          {i === parts.length - 1 && (
            <span style={{ color: "#00ff88" }}> ← nuevo</span>
          )}
        </pre>
      ))}
    </div>
  );
}

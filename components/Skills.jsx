"use client";

const cards = [
  {
    colorClass: "red-accent",
    icon: "🔴",
    title: "Red Team / Pentesting",
    tags: [
      "Análisis de vulnerabilidades",
      "Escalamiento privilegios",
      "Metasploit",
      "SQLi · XXE",
      "Kerberos Abuse",
      "Active Directory",
      "TryHackMe +40 labs",
      "HackTheBox",
    ],
  },
  {
    colorClass: "cyan-accent",
    icon: "☁️",
    title: "Cloud & M365 Security",
    tags: [
      "Microsoft Intune",
      "Azure AD / Entra ID",
      "MFA",
      "Acceso Condicional",
      "Zero Trust",
      "Exchange Online",
      "Google Workspace",
      "MDM · Endpoint Mgmt",
    ],
  },
  {
    colorClass: "green-accent",
    icon: "🛡️",
    title: "Ciberseguridad Defensiva",
    tags: [
      "SIEM",
      "Respuesta a incidentes",
      "Gestión de riesgos",
      "ISO 27001",
      "Hardening",
      "Protección de datos",
      "Fortinet",
      "Kaspersky SC",
    ],
  },
  {
    colorClass: "purple-accent",
    icon: "⚙️",
    title: "Automatización & Scripts",
    tags: [
      "PowerShell",
      "Python",
      "Bash / Linux",
      "SQL Server",
      "Win32 App Deploy",
      "Endpoint remediation",
    ],
  },
  {
    colorClass: "yellow-accent",
    icon: "🌐",
    title: "Redes & Infraestructura",
    tags: [
      "TCP/IP · DNS",
      "VPN",
      "VMware",
      "Windows Server",
      "Cloud híbrido",
      "Active Directory",
    ],
  },
  {
    colorClass: "orange-accent",
    icon: "🎧",
    title: "Soporte Técnico N1/N2",
    tags: [
      "Gestión de incidencias",
      "SLA",
      "Jira",
      "AnyDesk",
      "ITIL",
      "Soporte LATAM",
    ],
  },
];

function SkillCard({ card }) {
  return (
    <div className={`skill-card ${card.colorClass}`}>
      <div className="skill-icon">{card.icon}</div>
      <h3>{card.title}</h3>
      <div className="skill-tags">
        {card.tags.map((tag, i) => (
          <span key={i} className="skill-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="skills-section">
      <div className="skills-header">
        <span
          style={{
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: "0.85rem",
            flexShrink: 0,
          }}
        >
          01.
        </span>
        <h2 className="skills-title">Áreas de especialización</h2>
        <div className="skills-divider" />
      </div>
      <div className="skills-grid">
        {cards.map((card, i) => (
          <SkillCard key={i} card={card} />
        ))}
      </div>
    </section>
  );
}

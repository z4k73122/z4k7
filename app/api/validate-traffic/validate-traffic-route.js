// app/api/validate-traffic/route.js
import { NextResponse } from "next/server";

// Datos de IPs conocidas como sospechosas (base de datos simulada)
const SUSPICIOUS_IPS = [
  "10.0.0.1",
  "192.168.100.50",
  "172.16.0.1",
  "172.16.0.1",
];

// Límites para detección de anomalías
const ANOMALY_THRESHOLDS = {
  HIGH_TRAFFIC: 1000, // Visitas por IP
  RAPID_REQUESTS: 100, // Requests en 1 minuto
  UNUSUAL_PATTERN: 500, // Patrón inusual
};

// Validar formato de IP
function validateIPFormat(ip) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split(".");
  return parts.every((part) => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
}

// Detectar si IP es privada
function isPrivateIP(ip) {
  const parts = ip.split(".").map(Number);

  // 10.0.0.0 - 10.255.255.255
  if (parts[0] === 10) return true;

  // 172.16.0.0 - 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0 - 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 127.0.0.0 - 127.255.255.255 (localhost)
  if (parts[0] === 127) return true;

  return false;
}

// Validar IP contra base de datos de IPs sospechosas
function isSuspiciousIP(ip) {
  return SUSPICIOUS_IPS.includes(ip);
}

// Generar análisis detallado
function analyzeIP(ip, metadata = {}) {
  const analysis = {
    ip,
    isValid: validateIPFormat(ip),
    isPrivate: isPrivateIP(ip),
    isSuspicious: isSuspiciousIP(ip),
    riskScore: 0,
    alerts: [],
    recommendations: [],
    metadata: metadata,
  };

  if (!analysis.isValid) {
    analysis.riskScore += 100;
    analysis.alerts.push("Formato de IP inválido");
    analysis.recommendations.push("Verificar formato de IP");
  }

  if (analysis.isPrivate) {
    analysis.riskScore += 20;
    analysis.alerts.push("IP privada detectada");
  }

  if (analysis.isSuspicious) {
    analysis.riskScore += 80;
    analysis.alerts.push("IP en lista negra");
    analysis.recommendations.push("Bloquear IP inmediatamente");
  }

  // Análisis de metadatos
  if (metadata.visits && metadata.visits > ANOMALY_THRESHOLDS.HIGH_TRAFFIC) {
    analysis.riskScore += 30;
    analysis.alerts.push(
      `Tráfico inusualmente alto: ${metadata.visits} visitas`,
    );
    analysis.recommendations.push("Investigar patrón de tráfico");
  }

  // Limitar score a 100
  analysis.riskScore = Math.min(100, analysis.riskScore);

  return analysis;
}

// Endpoint GET - Validar una IP específica
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");
    const visits = searchParams.get("visits");

    if (!ip) {
      return NextResponse.json(
        { error: "IP parameter is required" },
        { status: 400 },
      );
    }

    const analysis = analyzeIP(ip, {
      visits: visits ? parseInt(visits) : 0,
    });

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}

// Endpoint POST - Validar múltiples IPs
export async function POST(request) {
  try {
    const body = await request.json();
    const { ips = [] } = body;

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json(
        { error: "ips array is required and must not be empty" },
        { status: 400 },
      );
    }

    const analysisResults = ips.map((ipData) => {
      if (typeof ipData === "string") {
        return analyzeIP(ipData);
      }
      return analyzeIP(ipData.ip, ipData.metadata);
    });

    // Generar reporte general
    const report = {
      totalIPs: analysisResults.length,
      validIPs: analysisResults.filter((a) => a.isValid).length,
      suspiciousIPs: analysisResults.filter((a) => a.isSuspicious).length,
      highRiskIPs: analysisResults.filter((a) => a.riskScore > 60).length,
      averageRiskScore: (
        analysisResults.reduce((sum, a) => sum + a.riskScore, 0) /
        analysisResults.length
      ).toFixed(2),
      timestamp: new Date().toISOString(),
      results: analysisResults,
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}

// Endpoint DELETE - Agregar IP a lista negra (simulado)
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return NextResponse.json(
        { error: "IP parameter is required" },
        { status: 400 },
      );
    }

    if (SUSPICIOUS_IPS.includes(ip)) {
      return NextResponse.json(
        {
          message: "IP already in blacklist",
          ip,
          status: "already_blocked",
        },
        { status: 200 },
      );
    }

    SUSPICIOUS_IPS.push(ip);

    return NextResponse.json(
      {
        message: "IP added to blacklist",
        ip,
        status: "blocked",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}

// app/api/traffic/route.js
import { promises as fs } from "fs";
import { resolve } from "path";
import { NextResponse } from "next/server";

const DATA_FILE = resolve(process.cwd(), "data/traffic.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(resolve(process.cwd(), "data"), { recursive: true });
    const initialData = {
      visits: [],
      summary: {
        totalVisits: 0,
        uniqueIPs: 0,
        uniqueCountries: 0,
        lastUpdate: new Date().toISOString(),
      },
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

async function readTrafficData() {
  await ensureDataFile();
  const content = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(content);
}

async function writeTrafficData(data) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function calculateSummary(visits) {
  return {
    totalVisits: visits.length,
    uniqueIPs: new Set(visits.map((v) => v.ip)).size,
    uniqueCountries: new Set(visits.map((v) => v.country)).size,
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET(request) {
  try {
    const data = await readTrafficData();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;

    let visits = data.visits.slice(-limit);

    return NextResponse.json({
      success: true,
      count: visits.length,
      total: data.visits.length,
      summary: data.summary,
      visits,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const visitData = await request.json();

    if (!visitData.ip || !visitData.timestamp) {
      return NextResponse.json(
        { success: false, error: "IP y timestamp requeridos" },
        { status: 400 },
      );
    }

    const data = await readTrafficData();

    const newVisit = {
      id: visitData.id || "v-" + Date.now(),
      ip: visitData.ip,
      country: visitData.country || "Unknown",
      city: visitData.city || "Unknown",
      isp: visitData.isp || "Unknown",
      deviceType: visitData.deviceType || "Unknown",
      browser: visitData.browser || "Unknown",
      userAgent: visitData.userAgent || "",
      page: visitData.page || "/",
      referrer: visitData.referrer || "direct",
      sessionId: visitData.sessionId,
      timestamp: visitData.timestamp,
    };

    data.visits.push(newVisit);

    // Mantener solo últimas 10,000 visitas
    if (data.visits.length > 10000) {
      data.visits = data.visits.slice(-10000);
    }

    data.summary = calculateSummary(data.visits);

    await writeTrafficData(data);

    return NextResponse.json({
      success: true,
      message: "Visita registrada",
      visit: newVisit,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    if (body.action !== "clear") {
      return NextResponse.json(
        { success: false, error: "Acción no soportada" },
        { status: 400 },
      );
    }

    const emptyData = {
      visits: [],
      summary: {
        totalVisits: 0,
        uniqueIPs: 0,
        uniqueCountries: 0,
        lastUpdate: new Date().toISOString(),
      },
    };

    await writeTrafficData(emptyData);

    return NextResponse.json({
      success: true,
      message: "Datos eliminados",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

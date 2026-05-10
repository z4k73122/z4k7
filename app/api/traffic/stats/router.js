// app/api/traffic/stats/route.js
import { promises as fs } from "fs";
import { resolve } from "path";
import { NextResponse } from "next/server";

const DATA_FILE = resolve(process.cwd(), "data/traffic.json");

async function readTrafficData() {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {
      visits: [],
      summary: { totalVisits: 0, uniqueIPs: 0, uniqueCountries: 0 },
    };
  }
}

function generateStats(visits) {
  const countries = {};
  const devices = {};
  const browsers = {};
  const pages = {};
  const ips = {};

  visits.forEach((visit) => {
    countries[visit.country] = (countries[visit.country] || 0) + 1;
    devices[visit.deviceType] = (devices[visit.deviceType] || 0) + 1;
    browsers[visit.browser] = (browsers[visit.browser] || 0) + 1;
    pages[visit.page] = (pages[visit.page] || 0) + 1;

    if (!ips[visit.ip]) {
      ips[visit.ip] = {
        count: 0,
        country: visit.country,
        lastSeen: visit.timestamp,
      };
    }
    ips[visit.ip].count++;
    ips[visit.ip].lastSeen = visit.timestamp;
  });

  return { countries, devices, browsers, pages, ips };
}

function getCountryFlag(countryName) {
  const flags = {
    Colombia: "🇨🇴",
    Mexico: "🇲🇽",
    Spain: "🇪🇸",
    Argentina: "🇦🇷",
    "United States": "🇺🇸",
    Brazil: "🇧🇷",
    Chile: "🇨🇱",
    Peru: "🇵🇪",
  };
  return flags[countryName] || "🌍";
}

export async function GET(request) {
  try {
    const data = await readTrafficData();
    const visits = data.visits;

    if (visits.length === 0) {
      return NextResponse.json({
        success: true,
        summary: { totalVisits: 0, uniqueIPs: 0, uniqueCountries: 0 },
        topCountries: [],
        topPages: [],
        devices: [],
        suspiciousIPs: [],
        recentVisits: [],
      });
    }

    const stats = generateStats(visits);

    const topCountries = Object.entries(stats.countries)
      .map(([name, count]) => ({
        name,
        visits: count,
        percentage: ((count / visits.length) * 100).toFixed(1),
        flag: getCountryFlag(name),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const topPages = Object.entries(stats.pages)
      .map(([page, count]) => ({
        page,
        visits: count,
        percentage: ((count / visits.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const devices = Object.entries(stats.devices)
      .map(([type, count]) => ({
        type,
        percentage: ((count / visits.length) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const suspiciousIPs = Object.entries(stats.ips)
      .filter(([ip, d]) => d.count > 50)
      .map(([ip, d]) => ({
        ip,
        visits: d.count,
        country: d.country,
        riskLevel: d.count > 100 ? "HIGH" : "MEDIUM",
        lastSeen: d.lastSeen,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const recentVisits = visits
      .slice(-20)
      .reverse()
      .map((v) => ({
        ip: v.ip,
        country: v.country,
        page: v.page,
        deviceType: v.deviceType,
        browser: v.browser,
        timestamp: v.timestamp,
      }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalVisits: visits.length,
        uniqueIPs: new Set(visits.map((v) => v.ip)).size,
        uniqueCountries: new Set(visits.map((v) => v.country)).size,
      },
      topCountries,
      topPages,
      devices,
      suspiciousIPs,
      recentVisits,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

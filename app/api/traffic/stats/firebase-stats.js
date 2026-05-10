// app/api/traffic/firebase-stats.js
import { db, collection, getDocs } from "@/lib/firebase";

export async function getTrafficStats() {
  try {
    const visitsCollection = collection(db, "visits");
    const snapshot = await getDocs(visitsCollection);

    const visits = [];
    snapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (visits.length === 0) {
      return {
        success: true,
        summary: { totalVisits: 0, uniqueIPs: 0, uniqueCountries: 0 },
        topCountries: [],
        topPages: [],
        devices: [],
        suspiciousIPs: [],
        recentVisits: [],
        browsers: [],
      };
    }

    // Generar estadísticas
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

    const topCountries = Object.entries(countries)
      .map(([name, count]) => ({
        name,
        visits: count,
        percentage: ((count / visits.length) * 100).toFixed(1),
        flag: getCountryFlag(name),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const topPages = Object.entries(pages)
      .map(([page, count]) => ({
        page,
        visits: count,
        percentage: ((count / visits.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const devicesList = Object.entries(devices)
      .map(([type, count]) => ({
        type,
        percentage: ((count / visits.length) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const suspiciousIPs = Object.entries(ips)
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

    const browsersList = Object.entries(browsers)
      .map(([name, count]) => ({
        name,
        visits: count,
        percentage: ((count / visits.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalVisits: visits.length,
        uniqueIPs: new Set(visits.map((v) => v.ip)).size,
        uniqueCountries: new Set(visits.map((v) => v.country)).size,
      },
      topCountries,
      topPages,
      devices: devicesList,
      suspiciousIPs,
      recentVisits,
      browsers: browsersList,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

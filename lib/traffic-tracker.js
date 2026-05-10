// lib/traffic-tracker.js
"use client";

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let deviceType = "Desktop";
  let browser = "Unknown";

  if (
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  ) {
    deviceType = /iPad|Android/i.test(ua) ? "Tablet" : "Mobile";
  }

  if (/Chrome/.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua)) browser = "Safari";
  else if (/Firefox/.test(ua)) browser = "Firefox";
  else if (/Edg/.test(ua)) browser = "Edge";

  return { deviceType, browser };
}

function generateId() {
  return "v-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

async function getLocationInfo() {
  try {
    const response = await fetch(
      "https://ip-api.com/json/?fields=status,country,city,lat,lon,isp",
    );
    const data = await response.json();
    if (data.status === "success") {
      return {
        ip: data.query || "Unknown",
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        isp: data.isp || "Unknown",
      };
    }
  } catch (error) {
    console.log("Location unavailable");
  }
  return { ip: "Unknown", country: "Unknown", city: "Unknown", isp: "Unknown" };
}

async function trackPageVisit() {
  try {
    const { deviceType, browser } = getDeviceInfo();
    const location = await getLocationInfo();

    const visitData = {
      id: generateId(),
      ip: location.ip,
      country: location.country,
      city: location.city,
      isp: location.isp,
      deviceType,
      browser,
      userAgent: navigator.userAgent,
      page: window.location.pathname,
      referrer: document.referrer || "direct",
      sessionId: sessionStorage.getItem("sessionId") || generateId(),
      timestamp: new Date().toISOString(),
    };

    if (!sessionStorage.getItem("sessionId")) {
      sessionStorage.setItem("sessionId", visitData.sessionId);
    }

    await fetch("/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitData),
    });
  } catch (error) {
    console.error("[Traffic]", error);
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPageVisit);
  } else {
    trackPageVisit();
  }
}

export { trackPageVisit };

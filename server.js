// Truck Route Planner - backend
// Node.js 18+ required (uses built-in fetch)
const express = require('express');
const path = require('path');
const app = express();

// ===== Mappls credentials =====
const MAP_SDK_KEY   = "ed4d49e31e9c3ceed013eaec51303894";
const CLIENT_ID     = "96dHZVzsAusi3RJVYPzqMbbYBW8FUennTjoArkvaodB3UjLsVtZOzrFbT48FUGbM0W9P14sL6jJ9GIzAqFa0HMLIRnY79LXX";
const CLIENT_SECRET = "lrFxI-iSEg-8QzZ0bq449-ggFiuHV33LY8CuI7F_cXzWRsKnuqi7CbeFClNnR_hk2oTPkpEwQU7I8SpsMCTUUdGu68uBaJ7DrKwt8fUXFz0=";

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const r = await fetch("https://outpost.mappls.com/api/security/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Token request failed (${r.status}): ${text}`);
  }

  const data = await r.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + ((data.expires_in || 3300) * 1000) - 30000; // refresh 30s early
  return cachedToken;
}

app.use(express.static(path.join(__dirname, "public")));

// Frontend asks for the map SDK key (safe to expose - it's a client-side display key)
app.get("/api/map-key", (req, res) => {
  res.json({ key: MAP_SDK_KEY });
});

// Frontend asks for a truck route; secret never leaves the server
app.get("/api/route", async (req, res) => {
  try {
    const { coords, height, width, length, weight, axle_load, hazmat, avoidToll } = req.query;
    if (!coords) return res.status(400).json({ error: "Missing coords" });

    const token = await getAccessToken();

    const params = new URLSearchParams({
      resource: "route",
      rtype: "0",
      steps: "true",
      overview: "full",
      geometries: "geojson",
      region: "ind",
      height: height || "3.5",
      width: width || "2.5",
      length: length || "10",
      weight: weight || "16",
      axle_load: axle_load || "9",
      hazmat: hazmat === "true" ? "true" : "false"
    });
    if (avoidToll === "true") params.set("exclude", "toll");

    const url = `https://apis.mappls.com/advancedmaps/v1/${token}/route_adv/trucking/${coords}?${params.toString()}`;

    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Truck Route Planner running -> http://localhost:${PORT}`);
});

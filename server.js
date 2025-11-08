// ================================
// 🧠 TechGuard – Threat Dashboard
// ================================

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Sert les fichiers HTML/CSS/JS dans /public
app.use(express.static(path.join(__dirname, "public")));

// ================================
// 🔍 Route : dernières CVE
// ================================
app.get("/api/cve", async (req, res) => {
  try {
    const response = await fetch("https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=30");
    const data = await response.json();

    const results = (data.vulnerabilities || []).map(v => {
      const cve = v.cve;
      return {
        id: cve.id || cve.CVE_data_meta?.ID || "N/A",
        summary: cve.descriptions?.[0]?.value || cve.description?.description_data?.[0]?.value || "No description",
        cvss:
          cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
          cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
          cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
          "N/A",
        published: cve.published || cve.publishedDate || cve.lastModified || new Date().toISOString()
      };
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching CVE data:", err);
    res.status(500).json({ error: "Unable to fetch CVE data" });
  }
});

// ================================
// 🔎 Route : recherche CVE par mot-clé
// ================================
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing search parameter" });

  try {
    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=30`);
    const data = await response.json();

    const results = (data.vulnerabilities || []).map(v => {
      const cve = v.cve;
      return {
        id: cve.id || cve.CVE_data_meta?.ID || "N/A",
        summary: cve.descriptions?.[0]?.value || cve.description?.description_data?.[0]?.value || "No description",
        cvss:
          cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
          cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
          cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
          "N/A",
        published: cve.published || cve.publishedDate || cve.lastModified || new Date().toISOString()
      };
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching CVE search:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ================================
// 🚀 Lancement du serveur
// ================================
app.listen(PORT, () => {
  console.log(`🚀 TechGuard Threat Dashboard running at http://localhost:${PORT}`);
});

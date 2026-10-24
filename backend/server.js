const express = require("express");
const { Pool } = require("pg");

const app = express();

// NON-SENSITIVE settings -> come from the ConfigMap (environment variables)
const config = {
  appName: process.env.APP_NAME || "not-set",
  appEnv: process.env.APP_ENV || "not-set",
  logLevel: process.env.LOG_LEVEL || "not-set",
  dbHost: process.env.DB_HOST || "not-set",
  dbPort: process.env.DB_PORT || "5432",
  dbName: process.env.DB_NAME || "not-set",
};

// SENSITIVE values -> come from the Kubernetes Secret (environment variables)
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

const pool = new Pool({
  host: config.dbHost,
  port: Number(config.dbPort),
  database: config.dbName,
  user: dbUser,
  password: dbPassword,
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Shows the ConfigMap values and PROVES secrets are loaded (without printing them)
app.get("/api/config", (req, res) => {
  res.json({
    configMapValues: config,
    secretsLoaded: {
      DB_USER: Boolean(dbUser),
      DB_PASSWORD: Boolean(dbPassword),
      API_KEY: Boolean(apiKey),
    },
    apiKeyPreview: apiKey ? apiKey.slice(0, 3) + "****" : null,
  });
});

// Proves the secret credentials really work against the database
app.get("/api/db", async (req, res) => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, at TIMESTAMP DEFAULT NOW())"
    );
    await pool.query("INSERT INTO visits DEFAULT VALUES");
    const r = await pool.query("SELECT COUNT(*) AS total FROM visits");
    res.json({ database: "connected using credentials from Secret", visits: r.rows[0].total });
  } catch (e) {
    res.status(500).json({ database: "connection failed", error: e.message });
  }
});

app.listen(3000, () => console.log(`[${config.logLevel}] ${config.appName} listening on 3000`));

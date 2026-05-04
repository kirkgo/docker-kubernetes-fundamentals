const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 3000;

let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;
  const route = req.url;

  if (route === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy" }));
    return;
  }

  if (route === "/api/info") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          service: process.env.SERVICE_NAME || "api",
          hostname: os.hostname(),
          version: process.env.APP_VERSION || "1.0.0",
          environment: process.env.NODE_ENV || "development",
          database: {
            host: process.env.DB_HOST || "not configured",
            name: process.env.DB_NAME || "not configured",
          },
          cache: {
            host: process.env.CACHE_HOST || "not configured",
          },
          requests_served: requestCount,
          uptime_seconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      {
        message: "Welcome to the Full Stack Lab API",
        endpoints: ["/health", "/api/info"],
      },
      null,
      2,
    ),
  );
});

server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database host: ${process.env.DB_HOST || "not configured"}`);
});

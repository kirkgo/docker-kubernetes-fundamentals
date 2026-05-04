const http = require("http");
const os = require("os");

const PORT = 3000;

// Simple API that returns system and environment info
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy" }));
    return;
  }

  const response = {
    service: "Lab API",
    hostname: os.hostname(),
    database_host: process.env.DB_HOST || "not configured",
    database_name: process.env.DB_NAME || "not configured",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, () => {
  console.log(`Lab API running on port ${PORT}`);
  console.log(`Database host: ${process.env.DB_HOST}`);
});

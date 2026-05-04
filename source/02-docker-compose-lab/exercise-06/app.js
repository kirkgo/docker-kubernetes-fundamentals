const http = require("http");
const os = require("os");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      {
        service: "compose-built-app",
        hostname: os.hostname(),
        version: process.env.APP_VERSION || "1.0.0",
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
});

server.listen(3000, () => console.log("App running on port 3000"));

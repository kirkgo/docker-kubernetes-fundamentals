const http = require("http");
const os = require("os");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const response = {
    message: "Hello from Docker Lab!",
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

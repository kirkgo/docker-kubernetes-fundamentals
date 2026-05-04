# Docker & Kubernetes Fundamentals

## Lab 2: Docker Compose

**Training Provider:** Moongy Training
**Instructor:** Kirk Patrick

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [What is Docker Compose](#2-what-is-docker-compose)
3. [Verifying Your Installation](#3-verifying-your-installation)
4. [Your First Compose File](#4-your-first-compose-file)
5. [Core Commands](#5-core-commands)
6. [Multi-Service Applications](#6-multi-service-applications)
7. [Environment Variables and Configuration](#7-environment-variables-and-configuration)
8. [Volumes in Compose](#8-volumes-in-compose)
9. [Networking in Compose](#9-networking-in-compose)
10. [Build Configuration](#10-build-configuration)
11. [Dependencies and Health Checks](#11-dependencies-and-health-checks)
12. [Scaling Services](#12-scaling-services)
13. [Profiles](#13-profiles)
14. [Override Files and Multiple Compose Files](#14-override-files-and-multiple-compose-files)
15. [Full Stack Project: API, Database, and Admin UI](#15-full-stack-project-api-database-and-admin-ui)
16. [Production Considerations](#16-production-considerations)
17. [Cleanup](#17-cleanup)
18. [Summary of Commands](#18-summary-of-commands)

---

## 1. Prerequisites

- Completion of Lab 1 (Docker Essentials).
- Docker Desktop installed and running. Docker Compose is included with Docker Desktop.
- A terminal application (PowerShell on Windows, bash/zsh on Linux/macOS).
- A text editor (VS Code is recommended).

---

## 2. What is Docker Compose

Docker Compose is a tool for defining and running multi-container applications. Instead of running multiple `docker run` commands with complex flags, you define your entire application stack in a single YAML file called `compose.yaml` (or `docker-compose.yml`).

Key benefits of Docker Compose:

- Declarative configuration: your infrastructure is defined as code.
- Single command to start or stop the entire stack.
- Automatic network creation for service-to-service communication.
- Reproducible environments across development, testing, and staging.
- Simplified volume and environment variable management.

In daily workflows, Docker Compose is the standard tool for local development environments and testing.

---

## 3. Verifying Your Installation

```bash
docker compose version
```

Expected output (version may vary):

```
Docker Compose version v2.x.x
```

Note: The modern syntax is `docker compose` (with a space). The older standalone binary `docker-compose` (with a hyphen) is deprecated. All commands in this lab use the current syntax.

---

## 4. Your First Compose File

### 4.1 Project Setup

Create a project directory:

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-01 && cd ~/compose-lab/exercise-01
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-01 -Force; cd $HOME\compose-lab\exercise-01
```

### 4.2 Writing the Compose File

Create a file named `compose.yaml`:

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
```

This file defines a single service called `web` using the `nginx:alpine` image, with port 8080 on the host mapped to port 80 in the container.

### 4.3 Starting the Application

```bash
docker compose up
```

The output shows the Nginx logs in real time. Open `http://localhost:8080` in your browser to see the Nginx welcome page.

Press `Ctrl+C` to stop.

### 4.4 Running in Detached Mode

```bash
docker compose up -d
```

Check the status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Stop and remove the containers:

```bash
docker compose down
```

---

## 5. Core Commands

This section covers the most frequently used Compose commands. You can run these from the `exercise-01` directory.

### 5.1 Starting Services

```bash
docker compose up -d
```

### 5.2 Viewing Status

```bash
docker compose ps
```

### 5.3 Viewing Logs

Follow logs in real time:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs web
```

### 5.4 Executing Commands Inside a Service

```bash
docker compose exec web sh
```

Type `exit` to leave the shell.

Run a one-off command:

```bash
docker compose exec web nginx -v
```

### 5.5 Stopping Services (Without Removing)

```bash
docker compose stop
```

Start them again:

```bash
docker compose start
```

### 5.6 Restarting Services

```bash
docker compose restart
```

### 5.7 Stopping and Removing Everything

```bash
docker compose down
```

To also remove volumes:

```bash
docker compose down -v
```

To also remove images used by the services:

```bash
docker compose down --rmi all
```

---

## 6. Multi-Service Applications

### 6.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-02 && cd ~/compose-lab/exercise-02
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-02 -Force; cd $HOME\compose-lab\exercise-02
```

### 6.2 Defining Multiple Services

Create `compose.yaml`:

```yaml
services:
  frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    image: node:20-alpine
    working_dir: /app
    command: node -e "
      const http = require('http');
      const server = http.createServer((req, res) => {
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({service:'backend', status:'running'}));
      });
      server.listen(3000, () => console.log('Backend on port 3000'));
      "
    ports:
      - "3000:3000"

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    ports:
      - "5432:5432"
```

### 6.3 Starting the Stack

```bash
docker compose up -d
```

Check all services:

```bash
docker compose ps
```

Test each service:

```bash
curl http://localhost:8080
curl http://localhost:3000
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:8080
Invoke-RestMethod http://localhost:3000
```

Test the database:

```bash
docker compose exec database psql -U appuser -d appdb -c "SELECT version();"
```

### 6.4 Managing Individual Services

Stop only the frontend:

```bash
docker compose stop frontend
```

Restart only the backend:

```bash
docker compose restart backend
```

View logs for one service:

```bash
docker compose logs -f database
```

### 6.5 Cleanup

```bash
docker compose down
```

---

## 7. Environment Variables and Configuration

### 7.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-03 && cd ~/compose-lab/exercise-03
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-03 -Force; cd $HOME\compose-lab\exercise-03
```

### 7.2 Inline Environment Variables

Create `compose.yaml`:

```yaml
services:
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: webapp
      MYSQL_USER: webuser
      MYSQL_PASSWORD: webpass
    ports:
      - "3306:3306"
```

### 7.3 Using an Environment File

Create a file named `.env`:

```env
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=webapp
MYSQL_USER=webuser
MYSQL_PASSWORD=webpass
DB_PORT=3306
```

Update `compose.yaml` to reference the env file:

```yaml
services:
  database:
    image: mysql:8.0
    env_file:
      - .env
    ports:
      - "${DB_PORT}:3306"
```

The `${DB_PORT}` syntax performs variable substitution from the `.env` file.

### 7.4 Compose Variable Substitution

Compose automatically reads the `.env` file in the project directory for variable substitution in the `compose.yaml` file itself (not just for container environment variables). This allows you to parameterize ports, image tags, and other settings.

Add more variables to `.env`:

```env
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=webapp
MYSQL_USER=webuser
MYSQL_PASSWORD=webpass
DB_PORT=3306
MYSQL_VERSION=8.0
```

Update `compose.yaml`:

```yaml
services:
  database:
    image: mysql:${MYSQL_VERSION}
    env_file:
      - .env
    ports:
      - "${DB_PORT}:3306"
```

### 7.5 Verifying Configuration

Preview the resolved configuration without starting anything:

```bash
docker compose config
```

This command displays the fully resolved YAML with all variables substituted. It is very useful for debugging configuration issues.

### 7.6 Start and Verify

```bash
docker compose up -d
```

Wait 15 seconds for MySQL to initialize, then verify:

```bash
docker compose exec database mysql -u webuser -pwebpass webapp -e "SHOW DATABASES;"
```

### 7.7 Cleanup

```bash
docker compose down -v
```

---

## 8. Volumes in Compose

### 8.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-04 && cd ~/compose-lab/exercise-04
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-04 -Force; cd $HOME\compose-lab\exercise-04
```

### 8.2 Named Volumes

Create `compose.yaml`:

```yaml
services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db-data:
```

The `volumes` section at the bottom level of the file declares named volumes. The `volumes` entry under the service maps the named volume to a path inside the container.

### 8.3 Testing Data Persistence

Start the database:

```bash
docker compose up -d
```

Wait 10 seconds, then create some data:

```bash
docker compose exec database psql -U appuser -d appdb -c "
  CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT, price DECIMAL);
  INSERT INTO products (name, price) VALUES ('Widget', 9.99), ('Gadget', 24.99), ('Doohickey', 4.99);
"
```

Verify the data:

```bash
docker compose exec database psql -U appuser -d appdb -c "SELECT * FROM products;"
```

Destroy the containers:

```bash
docker compose down
```

Start them again:

```bash
docker compose up -d
```

Check if the data survived:

```bash
docker compose exec database psql -U appuser -d appdb -c "SELECT * FROM products;"
```

The data is intact because the volume persists across container recreations.

### 8.4 Bind Mounts

Add a web server with a bind mount for local development:

Create a directory and file:

**Linux/macOS:**

```bash
mkdir -p html
echo '<h1>Docker Compose Volume Lab</h1>' > html/index.html
```

**Windows (PowerShell):**

```powershell
mkdir html -Force
"<h1>Docker Compose Volume Lab</h1>" | Out-File -Encoding utf8 html\index.html
```

Update `compose.yaml`:

```yaml
services:
  web:
    image: nginx:alpine
    volumes:
      - ./html:/usr/share/nginx/html:ro
    ports:
      - "8080:80"

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db-data:
```

```bash
docker compose up -d
```

Open `http://localhost:8080`. Edit `html/index.html` on your host and refresh the browser to see the changes immediately.

### 8.5 Viewing Volumes

```bash
docker volume ls | grep exercise-04
```

### 8.6 Cleanup

```bash
docker compose down -v
```

The `-v` flag removes the named volumes as well.

---

## 9. Networking in Compose

### 9.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-05 && cd ~/compose-lab/exercise-05
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-05 -Force; cd $HOME\compose-lab\exercise-05
```

### 9.2 Default Network Behavior

Create `compose.yaml`:

```yaml
services:
  app:
    image: alpine
    command: sleep 3600

  helper:
    image: alpine
    command: sleep 3600
```

```bash
docker compose up -d
```

Docker Compose automatically creates a network named `<project-directory>_default`. All services are attached to it.

Verify connectivity:

```bash
docker compose exec app ping -c 3 helper
docker compose exec helper ping -c 3 app
```

Both pings succeed. Services can reach each other by their service name.

Inspect the network:

```bash
docker network ls | grep exercise-05
```

```bash
docker compose down
```

### 9.3 Custom Networks

Create `compose.yaml` with explicit network definitions:

```yaml
services:
  frontend:
    image: alpine
    command: sleep 3600
    networks:
      - frontend-net

  backend:
    image: alpine
    command: sleep 3600
    networks:
      - frontend-net
      - backend-net

  database:
    image: alpine
    command: sleep 3600
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:
```

```bash
docker compose up -d
```

Test connectivity:

Frontend to backend (should work, they share `frontend-net`):

```bash
docker compose exec frontend ping -c 2 backend
```

Backend to database (should work, they share `backend-net`):

```bash
docker compose exec backend ping -c 2 database
```

Frontend to database (should fail, no shared network):

```bash
docker compose exec frontend ping -c 2 database
```

This demonstrates network isolation within Compose. The backend acts as a gateway between the two tiers.

### 9.4 Network Configuration Options

Update `compose.yaml` with driver and subnet settings:

```yaml
services:
  app:
    image: alpine
    command: sleep 3600
    networks:
      custom-net:
        ipv4_address: 172.25.0.10

networks:
  custom-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

```bash
docker compose down
docker compose up -d
```

Verify the assigned IP:

```bash
docker compose exec app ip addr show
```

### 9.5 Cleanup

```bash
docker compose down
```

---

## 10. Build Configuration

### 10.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-06 && cd ~/compose-lab/exercise-06
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-06 -Force; cd $HOME\compose-lab\exercise-06
```

### 10.2 Building from a Dockerfile

Create `app.js`:

```javascript
const http = require('http');
const os = require('os');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'compose-built-app',
    hostname: os.hostname(),
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  }, null, 2));
});

server.listen(3000, () => console.log('App running on port 3000'));
```

Create `package.json`:

```json
{
  "name": "compose-build-app",
  "version": "1.0.0",
  "main": "app.js"
}
```

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY app.js .
EXPOSE 3000
CMD ["node", "app.js"]
```

Create `compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      APP_VERSION: "1.0.0"
```

### 10.3 Building and Running

```bash
docker compose up -d --build
```

The `--build` flag ensures the image is rebuilt. Without it, Compose uses a cached image if one exists.

Test:

```bash
curl http://localhost:3000
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:3000
```

### 10.4 Rebuilding After Code Changes

Modify `app.js` (change the service name or add a field), then:

```bash
docker compose up -d --build
```

Compose detects the change, rebuilds the image, and replaces the running container.

### 10.5 Build with Custom Image Name

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-compose-app:1.0
    ports:
      - "3000:3000"
    environment:
      APP_VERSION: "1.0.0"
```

When both `build` and `image` are specified, Compose builds the image and tags it with the given name.

```bash
docker compose down
docker compose up -d --build
docker images | grep my-compose-app
```

### 10.6 Build Arguments

Update the `Dockerfile`:

```dockerfile
FROM node:20-alpine

ARG BUILD_DATE
ARG APP_ENV=production

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY app.js .

LABEL build_date=${BUILD_DATE}
LABEL environment=${APP_ENV}

EXPOSE 3000
CMD ["node", "app.js"]
```

Update `compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BUILD_DATE: "2025-01-01"
        APP_ENV: staging
    image: my-compose-app:1.0
    ports:
      - "3000:3000"
```

```bash
docker compose down
docker compose up -d --build
docker inspect my-compose-app:1.0 --format '{{json .Config.Labels}}'
```

### 10.7 Cleanup

```bash
docker compose down --rmi all
```

---

## 11. Dependencies and Health Checks

### 11.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-07 && cd ~/compose-lab/exercise-07
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-07 -Force; cd $HOME\compose-lab\exercise-07
```

### 11.2 The Problem with depends_on

By default, `depends_on` only waits for the dependency container to start. It does not wait for the service inside the container to become ready. A database container may take 10 to 20 seconds to accept connections after its process starts.

### 11.3 Health Checks

Create `compose.yaml`:

```yaml
services:
  app:
    image: alpine
    command: sh -c "echo 'App started. DB is ready.' && sleep 3600"
    depends_on:
      database:
        condition: service_healthy

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
```

The `healthcheck` configuration:

- `test`: the command to determine if the service is healthy.
- `interval`: how often to run the check.
- `timeout`: how long to wait for the check to complete.
- `retries`: how many consecutive failures before marking as unhealthy.
- `start_period`: grace period after the container starts before health checks count.

The `depends_on` with `condition: service_healthy` ensures the app service waits until the database is not just started but actually ready to accept connections.

### 11.4 Observing the Health Check

```bash
docker compose up -d
```

Watch the health status:

```bash
docker compose ps
```

You will see the database transition from `starting` to `healthy`. The app service starts only after the database is healthy.

View health check details:

```bash
docker inspect --format '{{json .State.Health}}' exercise-07-database-1
```

**Windows (PowerShell):**

```powershell
docker inspect --format "{{json .State.Health}}" exercise-07-database-1
```

Note: The container name may vary. Use `docker compose ps` to find the actual name.

### 11.5 Multiple Dependencies

```yaml
services:
  app:
    image: alpine
    command: sh -c "echo 'All dependencies ready.' && sleep 3600"
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

```bash
docker compose down
docker compose up -d
docker compose ps
```

The app container starts only after both the database and cache are healthy.

### 11.6 Cleanup

```bash
docker compose down
```

---

## 12. Scaling Services

### 12.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-08 && cd ~/compose-lab/exercise-08
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-08 -Force; cd $HOME\compose-lab\exercise-08
```

### 12.2 Preparing for Scaling

When scaling a service, you cannot use a fixed host port because multiple containers cannot bind to the same port. Remove or omit the host port mapping, or use a dynamic port range.

Create `compose.yaml`:

```yaml
services:
  worker:
    image: alpine
    command: sh -c "echo Worker $$HOSTNAME started && sleep 3600"

  web:
    image: nginx:alpine
    ports:
      - "8080-8085:80"
```

### 12.3 Scaling Up

```bash
docker compose up -d --scale worker=4 --scale web=3
```

Verify:

```bash
docker compose ps
```

You should see four worker containers and three web containers.

### 12.4 Scaling Down

```bash
docker compose up -d --scale worker=2
docker compose ps
```

Two worker containers were removed.

### 12.5 Using deploy.replicas

You can also define the replica count in the Compose file:

```yaml
services:
  worker:
    image: alpine
    command: sh -c "echo Worker started && sleep 3600"
    deploy:
      replicas: 3
```

```bash
docker compose down
docker compose up -d
docker compose ps
```

### 12.6 Cleanup

```bash
docker compose down
```

---

## 13. Profiles

Profiles allow you to selectively start groups of services. This is useful when certain services are only needed in specific contexts such as debugging, testing, or monitoring.

### 13.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-09 && cd ~/compose-lab/exercise-09
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-09 -Force; cd $HOME\compose-lab\exercise-09
```

### 13.2 Defining Profiles

Create `compose.yaml`:

```yaml
services:
  app:
    image: nginx:alpine
    ports:
      - "8080:80"

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass

  adminer:
    image: adminer
    ports:
      - "9090:8080"
    profiles:
      - debug

  redis-commander:
    image: rediscommander/redis-commander
    environment:
      REDIS_HOSTS: "cache"
    ports:
      - "8081:8081"
    profiles:
      - debug

  test-runner:
    image: alpine
    command: echo "Tests passed"
    profiles:
      - test
```

Services without a `profiles` key start by default. Services with profiles only start when that profile is explicitly activated.

### 13.3 Starting Without Profiles

```bash
docker compose up -d
docker compose ps
```

Only `app` and `database` are running. The debug and test services are not started.

### 13.4 Starting with a Profile

```bash
docker compose --profile debug up -d
docker compose ps
```

Now `adminer` and `redis-commander` are also running alongside the default services.

### 13.5 Running the Test Profile

```bash
docker compose --profile test up
```

This starts the default services plus the `test-runner`. The test runner runs its command and exits.

### 13.6 Cleanup

```bash
docker compose --profile debug --profile test down
```

---

## 14. Override Files and Multiple Compose Files

### 14.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/exercise-10 && cd ~/compose-lab/exercise-10
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\exercise-10 -Force; cd $HOME\compose-lab\exercise-10
```

### 14.2 Base Configuration

Create `compose.yaml`:

```yaml
services:
  app:
    image: nginx:alpine
    ports:
      - "8080:80"

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### 14.3 Override File for Development

Create `compose.override.yaml`:

```yaml
services:
  app:
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro

  database:
    ports:
      - "5432:5432"
```

When you run `docker compose up`, Compose automatically merges `compose.yaml` and `compose.override.yaml`. The override file adds bind mounts and exposes the database port, which are useful for development but not for production.

Create the HTML directory:

**Linux/macOS:**

```bash
mkdir -p html
echo '<h1>Development Environment</h1>' > html/index.html
```

**Windows (PowerShell):**

```powershell
mkdir html -Force
"<h1>Development Environment</h1>" | Out-File -Encoding utf8 html\index.html
```

```bash
docker compose up -d
```

Open `http://localhost:8080` to see the development page.

### 14.4 Production Override

Create `compose.prod.yaml`:

```yaml
services:
  app:
    restart: always

  database:
    restart: always
    environment:
      POSTGRES_PASSWORD: strong-production-password-here
```

To use the production configuration instead of the default override:

```bash
docker compose down
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

The `-f` flag specifies which files to use. When used, the automatic loading of `compose.override.yaml` is skipped.

### 14.5 Viewing the Merged Configuration

```bash
docker compose -f compose.yaml -f compose.prod.yaml config
```

### 14.6 Cleanup

```bash
docker compose down -v
```

---

## 15. Full Stack Project: API, Database, and Admin UI

This exercise brings together all the concepts covered in this lab.

### 15.1 Project Setup

**Linux/macOS:**

```bash
mkdir -p ~/compose-lab/fullstack && cd ~/compose-lab/fullstack
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\compose-lab\fullstack -Force; cd $HOME\compose-lab\fullstack
```

### 15.2 Application Code

Create `api.js`:

```javascript
const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;

let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;
  const route = req.url;

  if (route === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
    return;
  }

  if (route === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: process.env.SERVICE_NAME || 'api',
      hostname: os.hostname(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        host: process.env.DB_HOST || 'not configured',
        name: process.env.DB_NAME || 'not configured'
      },
      cache: {
        host: process.env.CACHE_HOST || 'not configured'
      },
      requests_served: requestCount,
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }, null, 2));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Welcome to the Full Stack Lab API',
    endpoints: ['/health', '/api/info']
  }, null, 2));
});

server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database host: ${process.env.DB_HOST || 'not configured'}`);
});
```

Create `package.json`:

```json
{
  "name": "fullstack-lab-api",
  "version": "1.0.0",
  "main": "api.js"
}
```

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY api.js .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "api.js"]
```

### 15.3 Static Frontend

Create a directory and file:

**Linux/macOS:**

```bash
mkdir -p frontend
```

**Windows (PowerShell):**

```powershell
mkdir frontend -Force
```

Create `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Full Stack Lab</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 700px;
      margin: 40px auto;
      padding: 0 20px;
      background: #f5f5f5;
      color: #333;
    }
    h1 { color: #2c3e50; }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
    }
    button {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover { background: #2980b9; }
    .status { margin: 10px 0; font-weight: bold; }
    .healthy { color: #27ae60; }
    .unhealthy { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>Full Stack Lab Dashboard</h1>
  <p>Docker Compose Multi-Service Application</p>
  <button onclick="fetchInfo()">Fetch API Info</button>
  <button onclick="checkHealth()">Health Check</button>
  <div id="status" class="status"></div>
  <pre id="output">Click a button to query the API.</pre>
  <script>
    async function fetchInfo() {
      try {
        const res = await fetch('/api/info');
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        document.getElementById('output').textContent = 'Error: ' + err.message;
      }
    }
    async function checkHealth() {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        const el = document.getElementById('status');
        el.textContent = 'Status: ' + data.status;
        el.className = 'status ' + data.status;
      } catch (err) {
        const el = document.getElementById('status');
        el.textContent = 'Status: unreachable';
        el.className = 'status unhealthy';
      }
    }
  </script>
</body>
</html>
```

### 15.4 Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    location /api/ {
        proxy_pass http://api:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://api:3000/health;
    }
}
```

This configuration serves static files and proxies API requests to the backend service. The `api` hostname resolves via Docker Compose networking.

### 15.5 Environment Configuration

Create `.env`:

```env
# Application
APP_VERSION=1.0.0
NODE_ENV=development
SERVICE_NAME=fullstack-api

# Database
POSTGRES_DB=fullstackdb
POSTGRES_USER=fulluser
POSTGRES_PASSWORD=fullpass

# Ports
WEB_PORT=8080
API_PORT=3000
ADMINER_PORT=9090
```

### 15.6 Compose File

Create `compose.yaml`:

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "${WEB_PORT}:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy
    networks:
      - frontend-net
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      PORT: ${API_PORT}
      NODE_ENV: ${NODE_ENV}
      APP_VERSION: ${APP_VERSION}
      SERVICE_NAME: ${SERVICE_NAME}
      DB_HOST: database
      DB_NAME: ${POSTGRES_DB}
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      CACHE_HOST: cache
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
    networks:
      - frontend-net
      - backend-net
    restart: unless-stopped

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    networks:
      - backend-net
    restart: unless-stopped

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - backend-net
    restart: unless-stopped

  adminer:
    image: adminer
    ports:
      - "${ADMINER_PORT}:8080"
    depends_on:
      database:
        condition: service_healthy
    networks:
      - backend-net
    profiles:
      - debug

volumes:
  db-data:

networks:
  frontend-net:
  backend-net:
```

### 15.7 Deploying the Stack

Preview the resolved configuration:

```bash
docker compose config
```

Start the full stack:

```bash
docker compose up -d --build
```

Monitor the startup:

```bash
docker compose ps
docker compose logs -f
```

Press `Ctrl+C` to stop following logs.

### 15.8 Testing the Application

Open `http://localhost:8080` in your browser. Click the "Fetch API Info" and "Health Check" buttons to verify the frontend communicates with the backend through the Nginx proxy.

Test from the command line:

```bash
curl http://localhost:8080/api/info
curl http://localhost:8080/health
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:8080/api/info
Invoke-RestMethod http://localhost:8080/health
```

### 15.9 Starting the Debug Profile

```bash
docker compose --profile debug up -d
```

Open `http://localhost:9090` to access Adminer. Use the following credentials to connect:

- System: PostgreSQL
- Server: database
- Username: fulluser
- Password: fullpass
- Database: fullstackdb

### 15.10 Inspecting the Stack

View all networks:

```bash
docker network ls | grep fullstack
```

Inspect the frontend network:

```bash
docker network inspect fullstack_frontend-net
```

Verify network isolation (the database is not accessible from the web container):

```bash
docker compose exec web ping -c 2 database
```

This should fail because `web` is only on `frontend-net`, while `database` is only on `backend-net`.

Verify the API can reach both tiers:

```bash
docker compose exec api ping -c 2 web
docker compose exec api ping -c 2 database
docker compose exec api ping -c 2 cache
```

### 15.11 View Resource Usage

```bash
docker compose top
docker stats --no-stream
```

---

## 16. Production Considerations

The following practices are important when using Docker Compose beyond local development.

### 16.1 Restart Policies

Always define a restart policy for production services:

```yaml
services:
  app:
    image: myapp:1.0
    restart: unless-stopped
```

Options: `no` (default), `always`, `on-failure`, `unless-stopped`.

### 16.2 Resource Limits

```yaml
services:
  app:
    image: myapp:1.0
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
        reservations:
          cpus: "0.25"
          memory: 128M
```

### 16.3 Logging Configuration

```yaml
services:
  app:
    image: myapp:1.0
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 16.4 Read-Only Filesystem

For security, make the container filesystem read-only and use tmpfs for temporary data:

```yaml
services:
  app:
    image: myapp:1.0
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### 16.5 Security Options

```yaml
services:
  app:
    image: myapp:1.0
    security_opt:
      - no-new-privileges:true
```

---

## 17. Cleanup

Remove the fullstack project:

```bash
cd ~/compose-lab/fullstack
docker compose --profile debug down -v --rmi all
```

**Windows (PowerShell):**

```powershell
cd $HOME\compose-lab\fullstack
docker compose --profile debug down -v --rmi all
```

Remove all exercise directories:

**Linux/macOS:**

```bash
rm -rf ~/compose-lab
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force $HOME\compose-lab
```

Full system cleanup:

```bash
docker system prune -a --volumes
```

**Warning:** This removes all unused containers, networks, images, and volumes.

---

## 18. Summary of Commands

### Lifecycle

| Command | Description |
|---|---|
| `docker compose up -d` | Start services in detached mode |
| `docker compose down` | Stop and remove containers and networks |
| `docker compose down -v` | Also remove volumes |
| `docker compose down --rmi all` | Also remove images |
| `docker compose start` | Start existing stopped services |
| `docker compose stop` | Stop services without removing |
| `docker compose restart` | Restart services |

### Monitoring

| Command | Description |
|---|---|
| `docker compose ps` | List running services |
| `docker compose logs` | View logs |
| `docker compose logs -f <service>` | Follow logs for a service |
| `docker compose top` | Display running processes |

### Building

| Command | Description |
|---|---|
| `docker compose build` | Build or rebuild services |
| `docker compose up -d --build` | Build and start |

### Execution

| Command | Description |
|---|---|
| `docker compose exec <svc> <cmd>` | Run a command in a running service |
| `docker compose run <svc> <cmd>` | Run a one-off command in a new container |

### Scaling

| Command | Description |
|---|---|
| `docker compose up -d --scale <svc>=N` | Scale a service to N instances |

### Configuration

| Command | Description |
|---|---|
| `docker compose config` | Validate and view resolved config |
| `docker compose -f <file> up -d` | Use a specific compose file |
| `docker compose --profile <name> up -d` | Start with a profile |

### Cleanup

| Command | Description |
|---|---|
| `docker compose down -v --rmi all` | Remove everything |
| `docker system prune -a --volumes` | System-wide cleanup |

---

**End of Lab 2**

Created by Kirk Patrick. Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

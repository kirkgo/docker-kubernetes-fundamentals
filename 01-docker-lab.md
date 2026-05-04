# Docker & Kubernetes Fundamentals

## Lab 1: Docker Essentials

**Training Provider:** Moongy Training
**Instructor:** Kirk Patrick

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Verifying Your Installation](#2-verifying-your-installation)
3. [Understanding Docker Architecture](#3-understanding-docker-architecture)
4. [Basic Container Operations](#4-basic-container-operations)
5. [Working with Images](#5-working-with-images)
6. [Container Lifecycle Management](#6-container-lifecycle-management)
7. [Container Inspection and Logs](#7-container-inspection-and-logs)
8. [Environment Variables and Port Mapping](#8-environment-variables-and-port-mapping)
9. [Building Custom Images with Dockerfile](#9-building-custom-images-with-dockerfile)
10. [Multi-Stage Builds](#10-multi-stage-builds)
11. [Working with Docker Hub (Pull and Push)](#11-working-with-docker-hub-pull-and-push)
12. [Volumes and Persistent Data](#12-volumes-and-persistent-data)
13. [Docker Networking](#13-docker-networking)
14. [Putting It All Together: Multi-Container Application](#14-putting-it-all-together-multi-container-application)
15. [Cleanup](#15-cleanup)
16. [Summary of Commands](#16-summary-of-commands)

---

## 1. Prerequisites

- Docker Desktop installed and running on your machine (Windows or Linux/macOS).
- A terminal application (PowerShell or Command Prompt on Windows, bash/zsh on Linux/macOS).
- A free Docker Hub account at [https://hub.docker.com](https://hub.docker.com).
- A text editor of your choice (VS Code is recommended).

---

## 2. Verifying Your Installation

Open your terminal and run the following commands to confirm Docker is properly installed.

```bash
docker --version
```

Expected output (version may vary):

```
Docker version 27.x.x, build xxxxxxx
```

```bash
docker info
```

This command displays system-wide information about your Docker installation, including the number of containers, images, storage driver, and operating system details.

Run the classic hello-world container to validate end-to-end functionality:

```bash
docker run hello-world
```

If you see the message "Hello from Docker!", your installation is working correctly.

---

## 3. Understanding Docker Architecture

Before running commands, it is important to understand the core components:

- **Docker Daemon (dockerd):** The background service that manages images, containers, networks, and volumes.
- **Docker Client (docker):** The CLI tool you use to interact with the daemon.
- **Docker Registry:** A repository for Docker images. Docker Hub is the default public registry.
- **Image:** A read-only template containing the application and its dependencies.
- **Container:** A runnable instance of an image. Containers are isolated and ephemeral by default.
- **Dockerfile:** A text file with instructions to build a Docker image.

---

## 4. Basic Container Operations

### 4.1 Running Your First Container

Run an Nginx web server in detached mode:

```bash
docker run -d --name my-nginx -p 8080:80 nginx
```

Flags explained:

- `-d` runs the container in the background (detached mode).
- `--name my-nginx` assigns a human-readable name.
- `-p 8080:80` maps port 8080 on the host to port 80 inside the container.

Open your browser and navigate to `http://localhost:8080`. You should see the default Nginx welcome page.

### 4.2 Listing Containers

List running containers:

```bash
docker ps
```

List all containers (including stopped ones):

```bash
docker ps -a
```

### 4.3 Stopping and Starting Containers

```bash
docker stop my-nginx
docker start my-nginx
```

### 4.4 Restarting a Container

```bash
docker restart my-nginx
```

### 4.5 Removing a Container

Stop the container first, then remove it:

```bash
docker stop my-nginx
docker rm my-nginx
```

To force-remove a running container:

```bash
docker rm -f my-nginx
```

---

## 5. Working with Images

### 5.1 Listing Local Images

```bash
docker images
```

Or equivalently:

```bash
docker image ls
```

### 5.2 Pulling Images from Docker Hub

```bash
docker pull alpine
docker pull ubuntu:22.04
docker pull node:20-alpine
```

The tag (e.g., `22.04`, `20-alpine`) specifies the version. If omitted, Docker defaults to `latest`.

### 5.3 Inspecting an Image

```bash
docker image inspect alpine
```

### 5.4 Viewing Image History

```bash
docker history alpine
```

This shows each layer that makes up the image.

### 5.5 Removing Images

```bash
docker rmi alpine
```

Remove all unused (dangling) images:

```bash
docker image prune
```

Remove all unused images (not just dangling):

```bash
docker image prune -a
```

---

## 6. Container Lifecycle Management

### 6.1 Running an Interactive Container

Launch a container with an interactive shell:

```bash
docker run -it --name my-ubuntu ubuntu:22.04 /bin/bash
```

You are now inside the container. Run some commands:

```bash
cat /etc/os-release
apt update && apt install -y curl
curl --version
exit
```

When you type `exit`, the container stops because its main process (the shell) has terminated.

### 6.2 Executing Commands in a Running Container

Start a container in the background:

```bash
docker run -d --name bg-ubuntu ubuntu:22.04 sleep 3600
```

Execute a command inside it:

```bash
docker exec bg-ubuntu cat /etc/hostname
```

Open an interactive shell in the running container:

```bash
docker exec -it bg-ubuntu /bin/bash
```

Type `exit` to leave the shell. The container continues running because its main process (`sleep`) is still active.

### 6.3 Copying Files Between Host and Container

Copy a file from host to container:

**Linux/macOS:**

```bash
echo "Hello from host" > /tmp/hostfile.txt
docker cp /tmp/hostfile.txt bg-ubuntu:/tmp/hostfile.txt
docker exec bg-ubuntu cat /tmp/hostfile.txt
```

**Windows (PowerShell):**

```powershell
"Hello from host" | Out-File -Encoding utf8 $env:TEMP\hostfile.txt
docker cp $env:TEMP\hostfile.txt bg-ubuntu:/tmp/hostfile.txt
docker exec bg-ubuntu cat /tmp/hostfile.txt
```

Copy a file from container to host:

```bash
docker cp bg-ubuntu:/etc/hostname ./container-hostname.txt
```

### 6.4 Viewing Resource Usage

```bash
docker stats --no-stream
```

This displays CPU, memory, network, and disk I/O for all running containers.

Clean up:

```bash
docker rm -f bg-ubuntu
```

---

## 7. Container Inspection and Logs

### 7.1 Inspecting a Container

Run a container and inspect it:

```bash
docker run -d --name log-test nginx
docker inspect log-test
```

To extract specific fields using Go template formatting:

```bash
docker inspect --format '{{.NetworkSettings.Networks.bridge.IPAddress}}' log-test
```

**Windows (PowerShell):** use double quotes on the outer layer:

```powershell
docker inspect --format "{{.NetworkSettings.Networks.bridge.IPAddress}}" log-test
```

### 7.2 Viewing Logs

```bash
docker logs log-test
```

Follow logs in real time:

```bash
docker logs -f log-test
```

Press `Ctrl+C` to stop following.

View only the last 10 lines:

```bash
docker logs --tail 10 log-test
```

View logs with timestamps:

```bash
docker logs -t log-test
```

Clean up:

```bash
docker rm -f log-test
```

---

## 8. Environment Variables and Port Mapping

### 8.1 Passing Environment Variables

```bash
docker run -d \
  --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=testdb \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=apppass \
  -p 3306:3306 \
  mysql:8.0
```

**Windows (PowerShell):** replace `\` with backtick for line continuation:

```powershell
docker run -d `
  --name my-mysql `
  -e MYSQL_ROOT_PASSWORD=rootpass `
  -e MYSQL_DATABASE=testdb `
  -e MYSQL_USER=appuser `
  -e MYSQL_PASSWORD=apppass `
  -p 3306:3306 `
  mysql:8.0
```

Verify the environment variables inside the container:

```bash
docker exec my-mysql env
```

### 8.2 Connecting to MySQL

Wait about 15 seconds for MySQL to initialize, then:

```bash
docker exec -it my-mysql mysql -u appuser -papppass testdb
```

Inside the MySQL shell:

```sql
SHOW DATABASES;
CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(100));
INSERT INTO students VALUES (1, 'Alice'), (2, 'Bob');
SELECT * FROM students;
EXIT;
```

Clean up:

```bash
docker rm -f my-mysql
```

---

## 9. Building Custom Images with Dockerfile

### 9.1 Creating a Simple Node.js Application

Create a project directory:

**Linux/macOS:**

```bash
mkdir ~/docker-lab && cd ~/docker-lab
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\docker-lab; cd $HOME\docker-lab
```

Create the application file `app.js`:

```javascript
const http = require('http');
const os = require('os');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const response = {
    message: 'Hello from Docker Lab!',
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create the `package.json` file:

```json
{
  "name": "docker-lab-app",
  "version": "1.0.0",
  "description": "Docker Lab Sample Application",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  }
}
```

### 9.2 Writing the Dockerfile

Create a file named `Dockerfile` (no extension):

```dockerfile
# Use the official Node.js 20 Alpine image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (layer caching optimization)
COPY package.json .

# Install dependencies
RUN npm install --production

# Copy application source code
COPY app.js .

# Expose the port the application listens on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "app.js"]
```

### 9.3 Creating a .dockerignore File

Create a `.dockerignore` file to exclude unnecessary files from the build context:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
```

### 9.4 Building the Image

```bash
docker build -t docker-lab-app:1.0 .
```

Flags explained:

- `-t docker-lab-app:1.0` tags the image with a name and version.
- `.` specifies the build context (current directory).

Verify the image was created:

```bash
docker images | grep docker-lab-app
```

**Windows (PowerShell):**

```powershell
docker images | Select-String "docker-lab-app"
```

### 9.5 Running the Custom Image

```bash
docker run -d --name my-app -p 3000:3000 docker-lab-app:1.0
```

Test the application:

```bash
curl http://localhost:3000
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:3000
```

You should see a JSON response with the hostname, platform, and timestamp.

### 9.6 Tagging an Image

```bash
docker tag docker-lab-app:1.0 docker-lab-app:latest
```

Verify:

```bash
docker images | grep docker-lab-app
```

Clean up the running container:

```bash
docker rm -f my-app
```

---

## 10. Multi-Stage Builds

Multi-stage builds allow you to use multiple `FROM` instructions in a single Dockerfile. This is useful for keeping final images small by discarding build-time dependencies.

Create a file named `Dockerfile.multistage`:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json .
RUN npm install
COPY app.js .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app.js .
COPY --from=builder /app/package.json .

EXPOSE 3000

# Run as a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "app.js"]
```

Build the multi-stage image:

```bash
docker build -f Dockerfile.multistage -t docker-lab-app:2.0 .
```

Compare image sizes:

```bash
docker images | grep docker-lab-app
```

---

## 11. Working with Docker Hub (Pull and Push)

### 11.1 Logging In to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

### 11.2 Tagging the Image for Docker Hub

Replace `<your-dockerhub-username>` with your actual Docker Hub username:

```bash
docker tag docker-lab-app:1.0 <your-dockerhub-username>/docker-lab-app:1.0
```

### 11.3 Pushing the Image

```bash
docker push <your-dockerhub-username>/docker-lab-app:1.0
```

### 11.4 Pulling the Image

Remove the local image first to simulate pulling from another machine:

```bash
docker rmi <your-dockerhub-username>/docker-lab-app:1.0
```

Pull the image from Docker Hub:

```bash
docker pull <your-dockerhub-username>/docker-lab-app:1.0
```

Run the pulled image:

```bash
docker run -d --name pulled-app -p 3000:3000 <your-dockerhub-username>/docker-lab-app:1.0
```

Verify it works:

```bash
curl http://localhost:3000
```

Clean up:

```bash
docker rm -f pulled-app
```

### 11.5 Logging Out

```bash
docker logout
```

---

## 12. Volumes and Persistent Data

Containers are ephemeral. When a container is removed, all data inside it is lost. Volumes solve this problem by persisting data outside the container filesystem.

### 12.1 Understanding the Problem

```bash
docker run -d --name temp-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=testdb \
  mysql:8.0
```

**Windows (PowerShell):**

```powershell
docker run -d --name temp-mysql `
  -e MYSQL_ROOT_PASSWORD=rootpass `
  -e MYSQL_DATABASE=testdb `
  mysql:8.0
```

Wait 15 seconds, then create some data:

```bash
docker exec -it temp-mysql mysql -u root -prootpass -e "CREATE TABLE testdb.demo (id INT); INSERT INTO testdb.demo VALUES (1),(2),(3);"
```

Remove the container:

```bash
docker rm -f temp-mysql
```

Start a new container:

```bash
docker run -d --name temp-mysql2 \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=testdb \
  mysql:8.0
```

Wait 15 seconds and check:

```bash
docker exec -it temp-mysql2 mysql -u root -prootpass -e "SELECT * FROM testdb.demo;"
```

The query fails because the data was lost when the first container was removed.

```bash
docker rm -f temp-mysql2
```

### 12.2 Named Volumes

Create a named volume:

```bash
docker volume create mysql-data
```

List volumes:

```bash
docker volume ls
```

Inspect the volume:

```bash
docker volume inspect mysql-data
```

### 12.3 Using a Named Volume with MySQL

```bash
docker run -d --name persistent-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=testdb \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0
```

**Windows (PowerShell):**

```powershell
docker run -d --name persistent-mysql `
  -e MYSQL_ROOT_PASSWORD=rootpass `
  -e MYSQL_DATABASE=testdb `
  -v mysql-data:/var/lib/mysql `
  -p 3306:3306 `
  mysql:8.0
```

Wait 15 seconds, then insert data:

```bash
docker exec -it persistent-mysql mysql -u root -prootpass -e "CREATE TABLE testdb.demo (id INT); INSERT INTO testdb.demo VALUES (1),(2),(3);"
```

Remove the container:

```bash
docker rm -f persistent-mysql
```

Start a new container using the same volume:

```bash
docker run -d --name persistent-mysql2 \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=testdb \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0
```

Wait 15 seconds and verify the data survived:

```bash
docker exec -it persistent-mysql2 mysql -u root -prootpass -e "SELECT * FROM testdb.demo;"
```

The data is still there because it is stored in the volume, not in the container filesystem.

Clean up the container (the volume persists):

```bash
docker rm -f persistent-mysql2
```

### 12.4 Bind Mounts

Bind mounts map a specific directory on your host to a directory in the container.

**Linux/macOS:**

```bash
mkdir -p ~/docker-lab/html
echo '<h1>Hello from Bind Mount</h1>' > ~/docker-lab/html/index.html

docker run -d --name bind-nginx \
  -p 8080:80 \
  -v ~/docker-lab/html:/usr/share/nginx/html:ro \
  nginx
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\docker-lab\html -Force
"<h1>Hello from Bind Mount</h1>" | Out-File -Encoding utf8 $HOME\docker-lab\html\index.html

docker run -d --name bind-nginx `
  -p 8080:80 `
  -v $HOME\docker-lab\html:/usr/share/nginx/html:ro `
  nginx
```

Open `http://localhost:8080` in your browser. You should see "Hello from Bind Mount".

Now modify the file on the host:

**Linux/macOS:**

```bash
echo '<h1>Updated Content</h1><p>The file was changed on the host.</p>' > ~/docker-lab/html/index.html
```

**Windows (PowerShell):**

```powershell
"<h1>Updated Content</h1><p>The file was changed on the host.</p>" | Out-File -Encoding utf8 $HOME\docker-lab\html\index.html
```

Refresh `http://localhost:8080`. The page updates immediately without restarting the container. This is extremely useful during development.

The `:ro` flag makes the mount read-only inside the container.

Clean up:

```bash
docker rm -f bind-nginx
```

### 12.5 Volume Cleanup

Remove a specific volume:

```bash
docker volume rm mysql-data
```

Remove all unused volumes:

```bash
docker volume prune
```

---

## 13. Docker Networking

### 13.1 Default Networks

List existing networks:

```bash
docker network ls
```

Docker provides three default networks: `bridge`, `host`, and `none`.

### 13.2 Inspecting a Network

```bash
docker network inspect bridge
```

### 13.3 Creating a Custom Bridge Network

```bash
docker network create --driver bridge app-network
```

Verify:

```bash
docker network ls
```

### 13.4 Why Custom Networks Matter

Containers on the default `bridge` network cannot resolve each other by name. Containers on a custom bridge network can use DNS-based service discovery, meaning they can communicate using container names as hostnames.

### 13.5 Connecting Containers to a Network

Start two containers on the custom network:

```bash
docker run -d --name container-a --network app-network alpine sleep 3600
docker run -d --name container-b --network app-network alpine sleep 3600
```

Test connectivity by name:

```bash
docker exec container-a ping -c 3 container-b
docker exec container-b ping -c 3 container-a
```

Both pings should succeed, demonstrating automatic DNS resolution on custom networks.

### 13.6 Connecting a Running Container to a Network

Create a third container on the default network:

```bash
docker run -d --name container-c alpine sleep 3600
```

Try to ping container-a from container-c:

```bash
docker exec container-c ping -c 2 container-a
```

This fails because container-c is not on the `app-network`.

Now connect container-c to the custom network:

```bash
docker network connect app-network container-c
```

Retry the ping:

```bash
docker exec container-c ping -c 2 container-a
```

It now works. A container can be connected to multiple networks simultaneously.

### 13.7 Disconnecting a Container from a Network

```bash
docker network disconnect app-network container-c
```

### 13.8 Network Isolation Demo

Create a second network:

```bash
docker network create --driver bridge isolated-network
docker run -d --name container-d --network isolated-network alpine sleep 3600
```

Try to ping container-a from container-d:

```bash
docker exec container-d ping -c 2 container-a
```

This fails because the two containers are on different networks, demonstrating network isolation.

Clean up:

```bash
docker rm -f container-a container-b container-c container-d
docker network rm app-network isolated-network
```

---

## 14. Putting It All Together: Multi-Container Application

In this exercise, you will deploy a complete application stack consisting of a backend API and a database, connected through a custom network with persistent storage.

### 14.1 Create the Infrastructure

```bash
docker network create --driver bridge lab-network
docker volume create lab-db-data
```

### 14.2 Start the Database

```bash
docker run -d \
  --name lab-db \
  --network lab-network \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=labdb \
  -e MYSQL_USER=labuser \
  -e MYSQL_PASSWORD=labpass \
  -v lab-db-data:/var/lib/mysql \
  mysql:8.0
```

**Windows (PowerShell):**

```powershell
docker run -d `
  --name lab-db `
  --network lab-network `
  -e MYSQL_ROOT_PASSWORD=rootpass `
  -e MYSQL_DATABASE=labdb `
  -e MYSQL_USER=labuser `
  -e MYSQL_PASSWORD=labpass `
  -v lab-db-data:/var/lib/mysql `
  mysql:8.0
```

Wait about 20 seconds for MySQL to initialize fully.

### 14.3 Create the Backend Application

Create the file `api.js` in your `docker-lab` directory:

```javascript
const http = require('http');
const os = require('os');

const PORT = 3000;

// Simple API that returns system and environment info
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
    return;
  }

  const response = {
    service: 'Lab API',
    hostname: os.hostname(),
    database_host: process.env.DB_HOST || 'not configured',
    database_name: process.env.DB_NAME || 'not configured',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, () => {
  console.log(`Lab API running on port ${PORT}`);
  console.log(`Database host: ${process.env.DB_HOST}`);
});
```

Create a `Dockerfile.api`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY api.js .
EXPOSE 3000
CMD ["node", "api.js"]
```

Build the API image:

```bash
docker build -f Dockerfile.api -t lab-api:1.0 .
```

### 14.4 Start the API Connected to the Database

```bash
docker run -d \
  --name lab-api \
  --network lab-network \
  -e DB_HOST=lab-db \
  -e DB_NAME=labdb \
  -e DB_USER=labuser \
  -e DB_PASSWORD=labpass \
  -e NODE_ENV=production \
  -p 3000:3000 \
  lab-api:1.0
```

**Windows (PowerShell):**

```powershell
docker run -d `
  --name lab-api `
  --network lab-network `
  -e DB_HOST=lab-db `
  -e DB_NAME=labdb `
  -e DB_USER=labuser `
  -e DB_PASSWORD=labpass `
  -e NODE_ENV=production `
  -p 3000:3000 `
  lab-api:1.0
```

### 14.5 Verify the Full Stack

Test the API:

```bash
curl http://localhost:3000
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:3000
```

The `database_host` field in the response should show `lab-db`, confirming the API can resolve the database container by name through the custom network.

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Verify network connectivity between the containers:

```bash
docker exec lab-api ping -c 2 lab-db
```

Inspect the network to see both containers:

```bash
docker network inspect lab-network
```

### 14.6 View Logs from Both Containers

```bash
docker logs lab-api
docker logs lab-db --tail 20
```

---

## 15. Cleanup

Remove all lab containers:

```bash
docker rm -f lab-api lab-db my-app
```

Remove lab images:

```bash
docker rmi docker-lab-app:1.0 docker-lab-app:2.0 docker-lab-app:latest lab-api:1.0
```

Remove lab volumes and networks:

```bash
docker volume rm lab-db-data
docker network rm lab-network
```

To perform a full system cleanup (removes all unused resources):

```bash
docker system prune -a --volumes
```

**Warning:** The above command removes all stopped containers, unused networks, unused images, and unused volumes. Do not run it if you have resources you want to keep.

---

## 16. Summary of Commands

### Container Lifecycle

| Command | Description |
|---|---|
| `docker run` | Create and start a container |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker stop <name>` | Stop a container |
| `docker start <name>` | Start a stopped container |
| `docker restart <name>` | Restart a container |
| `docker rm <name>` | Remove a container |
| `docker rm -f <name>` | Force remove a running container |
| `docker exec -it <name> <cmd>` | Execute a command in a running container |
| `docker logs <name>` | View container logs |
| `docker inspect <name>` | Detailed container information |
| `docker stats` | Live resource usage |
| `docker cp` | Copy files between host and container |

### Image Management

| Command | Description |
|---|---|
| `docker images` | List local images |
| `docker pull <image>` | Download an image from a registry |
| `docker push <image>` | Upload an image to a registry |
| `docker build -t <tag> .` | Build an image from a Dockerfile |
| `docker tag <src> <dst>` | Create a new tag for an image |
| `docker rmi <image>` | Remove an image |
| `docker image prune` | Remove dangling images |

### Volume Management

| Command | Description |
|---|---|
| `docker volume create <name>` | Create a named volume |
| `docker volume ls` | List volumes |
| `docker volume inspect <name>` | Inspect a volume |
| `docker volume rm <name>` | Remove a volume |
| `docker volume prune` | Remove all unused volumes |

### Network Management

| Command | Description |
|---|---|
| `docker network create <name>` | Create a network |
| `docker network ls` | List networks |
| `docker network inspect <name>` | Inspect a network |
| `docker network connect <net> <ctr>` | Connect a container to a network |
| `docker network disconnect <net> <ctr>` | Disconnect a container from a network |
| `docker network rm <name>` | Remove a network |

### Registry

| Command | Description |
|---|---|
| `docker login` | Log in to Docker Hub |
| `docker logout` | Log out of Docker Hub |

### System

| Command | Description |
|---|---|
| `docker system prune` | Remove unused data |
| `docker system prune -a --volumes` | Remove all unused data including volumes |

---

**End of Lab 1**

Created by Kirk Patrick. Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

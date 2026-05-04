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

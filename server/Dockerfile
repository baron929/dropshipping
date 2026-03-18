
# 1. Use the secure, slim Node 22 base
FROM node:22-bookworm-slim

# 2. Fix OS-level vulnerabilities (Removes those "Critical" flags)
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# 3. Create and set the working directory
WORKDIR /app

# 4. Copy package files first for better caching
# Since Dockerfile is inside /server, we copy from the current directory
COPY package*.json ./

# 5. Install only production dependencies (no devtools)
RUN npm install --omit=dev

# 6. Copy the rest of your server code (src folder, etc.)
COPY . .

# 7. Set permissions so the 'node' user can access the files
RUN chown -R node:node /app

# 8. Switch to non-root user for production security
USER node

# 9. Inform Docker the app runs on port 5000
EXPOSE 5000

# 10. Start the app (Matches your 'src/index.js' path from the screenshot)
CMD ["node", "src/index.js"]
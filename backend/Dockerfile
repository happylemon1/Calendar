# backend/Dockerfile

# 1. Use an official Node.js runtime as a parent image
FROM node:18-slim

# 2. Set the working directory in the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 1. Install ALL dependencies (including devDependencies) to get 'typescript'
RUN npm install

# 2. Copy the rest of your application's source code into the container
COPY . .

# 3. Run the build script to compile TypeScript. This now works because 'tsc' is available.
RUN npm run build

# 4. Prune the devDependencies to keep the final image small and secure
RUN npm prune --production

# 7. Expose the port the app runs on
EXPOSE 8000

# 8. Define the command to run your app
CMD [ "node", "dist/server.js" ]

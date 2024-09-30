# Use the official Node.js 20.17.0 image as a parent image
FROM node:20.17.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run your app using CMD which defines your runtime
CMD ["node", "Server.js"]

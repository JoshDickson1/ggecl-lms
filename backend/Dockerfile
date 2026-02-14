FROM node:23-slim

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

RUN pnpm install

# Copy the entire codebase
COPY . .

CMD ["npm", "run", "dev"]
FROM registry1-docker-io.repo.cci.nokia.net/node:22.21.0

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]

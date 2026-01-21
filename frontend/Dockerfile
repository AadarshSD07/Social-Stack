# Use a Node image
FROM node:22-alpine

# Set work directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Copy the rest of the frontend code
COPY . /app/

# Expose port 3000 for React
EXPOSE 3000

# Start the React development server
CMD ["npm", "run", "dev"]
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite needs --host to be accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
# No passwords or keys here. They are injected at runtime by Kubernetes.
EXPOSE 3000
CMD ["node", "server.js"]

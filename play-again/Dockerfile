FROM node:20-slim

WORKDIR /app

# Installation des dépendances système nécessaires (Prisma + ONNX)
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Node
COPY package*.json ./
RUN npm install

# Copie du reste du projet
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Exposition du port
EXPOSE 3000

# Commande pour lancer le mode dev
CMD ["npm", "run", "dev"]
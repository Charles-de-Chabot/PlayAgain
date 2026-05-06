FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste du projet
COPY . .

# Génération du client Prisma (Crucial !)
RUN npx prisma generate

# Exposition du port
EXPOSE 3000

# Commande pour lancer le mode dev
CMD ["npm", "run", "dev"]
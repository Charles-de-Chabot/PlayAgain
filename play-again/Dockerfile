FROM node:20-slim

WORKDIR /app

# Installation des dépendances système nécessaires (Prisma + ONNX + Stripe CLI)
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    curl \
    ca-certificates \
    && curl -L https://github.com/stripe/stripe-cli/releases/download/v1.42.0/stripe_1.42.0_linux_x86_64.tar.gz -o stripe.tar.gz \
    && tar -xzf stripe.tar.gz \
    && mv stripe /usr/local/bin/ \
    && rm stripe.tar.gz \
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

# Commande pour lancer Stripe CLI et le mode dev Next.js
CMD stripe listen --api-key $STRIPE_SECRET_KEY --forward-to localhost:3000/api/webhooks/stripe & npm run dev
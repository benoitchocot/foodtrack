#!/bin/bash
# Script pour appliquer les migrations et seeder

set -e

cd ~/pi

# Charger les variables
export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

echo "📦 Vérification des migrations dans le conteneur..."
docker exec jow-backend ls -la /app/prisma/migrations/ || echo "⚠️  Migrations directory not found"

echo "📦 Application des migrations..."
docker exec jow-backend npx prisma migrate deploy || {
    echo "⚠️  migrate deploy failed, trying db push..."
    docker exec jow-backend npx prisma db push --accept-data-loss
}

echo "✅ Migrations appliquées"

echo "🌱 Seeding de la base..."
docker exec jow-backend npm run prisma:seed

echo "✅ Seed terminé !"


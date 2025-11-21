#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Attendre que PostgreSQL soit accessible
until echo 'SELECT 1;' | npx prisma db execute --stdin 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Appliquer le schéma (db push est plus fiable que migrate deploy en dev)
echo "📦 Applying database schema..."
if npx prisma db push --accept-data-loss; then
    echo "✅ Database schema applied successfully"
else
    echo "❌ Failed to apply database schema"
    exit 1
fi

# Essayer de faire le seed (il gère lui-même les erreurs si les données existent déjà)
echo "🌱 Running seed (will skip if data already exists)..."
npm run prisma:seed || {
    echo "⚠️  Seed completed (may have skipped if data already exists)"
}

# Démarrer l'application en mode dev
echo "🚀 Starting application in development mode..."
exec npm run start:dev


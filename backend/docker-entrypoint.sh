#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Attendre que PostgreSQL soit accessible
until npx prisma db execute --stdin <<< 'SELECT 1;' 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Appliquer les migrations
echo "📦 Applying migrations..."
npx prisma migrate deploy || echo "⚠️  Migrations failed or already applied"

# Démarrer l'application
echo "🚀 Starting application..."
exec npm run start:prod


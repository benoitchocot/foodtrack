#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Attendre que PostgreSQL soit accessible
until echo 'SELECT 1;' | npx prisma db execute --stdin 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Appliquer les migrations
echo "📦 Applying migrations..."
echo "📁 Checking migrations directory..."
ls -la /app/prisma/migrations/ || echo "⚠️  Migrations directory not found"

# Vérifier si la base de données a déjà des tables
echo "🔍 Checking database state..."
HAS_TABLES=$(echo "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | npx prisma db execute --stdin 2>/dev/null | grep -o '[0-9]' | head -1 || echo "0")

if [ "$HAS_TABLES" = "0" ] || [ -z "$HAS_TABLES" ]; then
    echo "📦 No tables found, applying migrations..."
    npx prisma migrate deploy || {
        echo "⚠️  migrate deploy failed, trying db push..."
        npx prisma db push --accept-data-loss || echo "⚠️  db push also failed"
    }
else
    echo "✅ Database already has tables, skipping migrations"
fi

echo "✅ Migrations check completed"

# Démarrer l'application
echo "🚀 Starting application..."
exec npm run start:prod


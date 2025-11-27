#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Extraire les informations de connexion depuis DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
if [ -z "$DB_HOST" ]; then
  # Si l'extraction échoue, utiliser la valeur par défaut
  DB_HOST="mealplans-postgres"
fi

DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
if [ -z "$DB_PORT" ]; then
  DB_PORT="5432"
fi

echo "Checking database connection at $DB_HOST:$DB_PORT..."

# Attendre que PostgreSQL soit accessible via TCP
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Appliquer le schéma (db push est plus fiable que migrate deploy en production)
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

# Démarrer l'application
echo "🚀 Starting application..."
exec npm run start:prod


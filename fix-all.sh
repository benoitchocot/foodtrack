#!/bin/bash
# Script pour corriger tous les problèmes

set -e

cd ~/pi

echo "📝 Chargement des variables depuis ~/foodtrack/.env.production..."
if [ ! -f ~/foodtrack/.env.production ]; then
    echo "❌ ERREUR: ~/foodtrack/.env.production n'existe pas"
    exit 1
fi

export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

if [ -z "$JOW_DB_PASSWORD" ]; then
    echo "❌ ERREUR: JOW_DB_PASSWORD n'est pas défini"
    exit 1
fi

echo "✅ Variables chargées"

# Vérifier que docker-compose.yml utilise ${JOW_DB_PASSWORD}
if ! grep -q "POSTGRES_PASSWORD: \${JOW_DB_PASSWORD}" docker-compose.yml; then
    echo "⚠️  ATTENTION: docker-compose.yml n'utilise pas \${JOW_DB_PASSWORD}"
    echo "   Modifiez POSTGRES_PASSWORD: Benoit45+ en POSTGRES_PASSWORD: \${JOW_DB_PASSWORD}"
    exit 1
fi

echo "✅ docker-compose.yml utilise bien \${JOW_DB_PASSWORD}"

# Arrêter
echo "⏹️  Arrêt des services..."
docker compose stop jow-postgres jow-backend jow-frontend 2>/dev/null || true

# Supprimer les conteneurs
echo "🗑️  Suppression des conteneurs..."
docker compose rm -f jow-postgres jow-backend jow-frontend 2>/dev/null || true

# Attendre un peu
sleep 2

# Supprimer le volume
if docker volume ls | grep -q jow-postgres-data; then
    echo "🗑️  Suppression du volume PostgreSQL..."
    docker volume rm jow-postgres-data 2>/dev/null || {
        echo "⚠️  Le volume est encore utilisé, forçons la suppression..."
        docker volume rm jow-postgres-data --force 2>/dev/null || true
    }
fi

# Rebuild backend (pour ts-node)
echo "🔨 Rebuild du backend..."
docker compose build --no-cache jow-backend

# Démarrer PostgreSQL
echo "🔄 Démarrage de PostgreSQL..."
docker compose up -d jow-postgres

# Attendre
echo "⏳ Attente (30 secondes)..."
sleep 30

# Vérifier
if docker exec jow-postgres pg_isready -U jow_user -d jow_db >/dev/null 2>&1; then
    echo "✅ PostgreSQL est prêt"
    
    # Tester la connexion
    if docker exec -e PGPASSWORD="$JOW_DB_PASSWORD" jow-postgres psql -U jow_user -d jow_db -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Connexion réussie"
    else
        echo "❌ Connexion échouée - vérifiez le mot de passe"
        exit 1
    fi
    
    # Backend
    echo "🚀 Démarrage du backend..."
    docker compose up -d jow-backend
    sleep 15
    
    # Migrations
    echo "📦 Vérification des migrations..."
    docker exec jow-backend ls -la /app/prisma/migrations/ || echo "⚠️  Migrations directory not found"
    
    echo "📦 Application des migrations..."
    docker exec jow-backend npx prisma migrate deploy || {
        echo "⚠️  migrate deploy failed, trying db push..."
        docker exec jow-backend npx prisma db push --accept-data-loss
    }
    
    # Attendre un peu pour que les migrations soient bien appliquées
    sleep 2
    
    # Seed (seulement si les tables existent)
    echo "🌱 Seed..."
    docker exec jow-backend npm run prisma:seed || {
        echo "⚠️  Seed failed, but continuing..."
    }
    
    # Frontend
    echo "🎨 Frontend..."
    docker compose up -d jow-frontend
    
    echo ""
    echo "✅ Terminé !"
    docker logs jow-backend --tail 10
else
    echo "❌ PostgreSQL n'est pas prêt"
    docker logs jow-postgres --tail 20
    exit 1
fi


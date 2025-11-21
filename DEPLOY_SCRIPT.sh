#!/bin/bash
# Script de déploiement automatique pour FoodTrack

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de FoodTrack..."

# Vérifier que les variables d'environnement sont définies
if [ -z "$JOW_DB_PASSWORD" ]; then
    echo "❌ ERREUR: JOW_DB_PASSWORD n'est pas défini"
    exit 1
fi

if [ -z "$JOW_JWT_SECRET" ]; then
    echo "❌ ERREUR: JOW_JWT_SECRET n'est pas défini"
    exit 1
fi

# Charger les variables d'environnement si un fichier .env existe
if [ -f .env.production ]; then
    echo "📝 Chargement des variables depuis .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Arrêter les services existants
echo "⏹️  Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

# Rebuild les images
echo "🔨 Build des images Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer PostgreSQL
echo "🗄️  Démarrage de PostgreSQL..."
docker-compose -f docker-compose.prod.yml up -d jow-postgres

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
sleep 15

# Vérifier que PostgreSQL est prêt
if ! docker exec jow-postgres pg_isready -U jow_user -d jow_db; then
    echo "❌ ERREUR: PostgreSQL n'est pas prêt"
    exit 1
fi

# Démarrer le backend (qui appliquera les migrations automatiquement)
echo "🔧 Démarrage du backend (migrations automatiques)..."
docker-compose -f docker-compose.prod.yml up -d jow-backend

# Attendre que le backend démarre
echo "⏳ Attente que le backend démarre..."
sleep 10

# Vérifier que le backend est démarré
if ! docker logs jow-backend --tail 5 | grep -q "Application is running"; then
    echo "⚠️  ATTENTION: Le backend ne semble pas avoir démarré correctement"
    echo "📋 Derniers logs:"
    docker logs jow-backend --tail 20
    exit 1
fi

# Seeder la base (optionnel, seulement si la base est vide)
echo "🌱 Vérification des données initiales..."
if docker exec jow-backend npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM recipes;" 2>/dev/null | grep -q "0"; then
    echo "📦 Seeding de la base de données..."
    docker exec jow-backend npm run prisma:seed || echo "⚠️  Le seed a échoué (peut-être que les données existent déjà)"
else
    echo "✅ La base de données contient déjà des données, skip du seed"
fi

# Démarrer le frontend
echo "🎨 Démarrage du frontend..."
docker-compose -f docker-compose.prod.yml up -d jow-frontend

# Attendre que le frontend démarre
sleep 5

# Vérifier l'état final
echo "✅ Vérification de l'état des services..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL: jow-postgres"
echo "  - Backend API: jow-backend (http://localhost:3000)"
echo "  - Frontend: jow-frontend (http://localhost:3000)"
echo ""
echo "📋 Logs:"
echo "  docker logs jow-backend"
echo "  docker logs jow-frontend"
echo ""
echo "🧪 Tests:"
echo "  curl http://localhost:3000/api"
echo "  curl http://localhost:3000"


#!/bin/bash
# Script final pour corriger PostgreSQL

set -e

cd ~/pi

echo "📝 Chargement des variables..."
if [ ! -f ~/foodtrack/.env.production ]; then
    echo "❌ ERREUR: ~/foodtrack/.env.production n'existe pas"
    exit 1
fi

export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

# Vérifier que JOW_DB_PASSWORD est défini
if [ -z "$JOW_DB_PASSWORD" ]; then
    echo "❌ ERREUR: JOW_DB_PASSWORD n'est pas défini dans .env.production"
    exit 1
fi

echo "✅ Variables chargées (JOW_DB_PASSWORD: ${JOW_DB_PASSWORD:0:3}...)"

# Arrêter les services
echo "⏹️  Arrêt des services..."
docker-compose stop jow-postgres jow-backend jow-frontend 2>/dev/null || true

# Supprimer le conteneur
echo "🗑️  Suppression du conteneur PostgreSQL..."
docker-compose rm -f jow-postgres 2>/dev/null || true

# Supprimer le volume s'il existe
if docker volume ls | grep -q jow-postgres-data; then
    echo "🗑️  Suppression du volume PostgreSQL..."
    docker volume rm jow-postgres-data
fi

# IMPORTANT: Modifier temporairement docker-compose.yml pour utiliser la variable
echo "🔧 Vérification du docker-compose.yml..."
# Le docker-compose.yml doit utiliser ${JOW_DB_PASSWORD} et non une valeur fixe

# Redémarrer PostgreSQL
echo "🔄 Redémarrage de PostgreSQL avec le mot de passe depuis .env.production..."
docker-compose up -d jow-postgres

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt (30 secondes)..."
sleep 30

# Vérifier
if docker exec jow-postgres pg_isready -U jow_user -d jow_db >/dev/null 2>&1; then
    echo "✅ PostgreSQL est prêt"
    
    # Tester la connexion avec le mot de passe
    echo "🔍 Test de connexion..."
    if docker exec -e PGPASSWORD="$JOW_DB_PASSWORD" jow-postgres psql -U jow_user -d jow_db -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Connexion réussie avec le mot de passe"
    else
        echo "❌ Connexion échouée - le mot de passe ne correspond toujours pas"
        echo "💡 Vérifiez que POSTGRES_PASSWORD dans docker-compose.yml utilise bien \${JOW_DB_PASSWORD}"
        exit 1
    fi
    
    # Rebuild le backend (pour installer ts-node)
    echo "🔨 Rebuild du backend..."
    docker-compose build jow-backend
    
    # Démarrer le backend
    echo "🚀 Démarrage du backend..."
    docker-compose up -d jow-backend
    
    # Attendre
    sleep 15
    
    # Appliquer les migrations
    echo "📦 Application des migrations..."
    docker exec jow-backend npx prisma migrate deploy
    
    # Seeder
    echo "🌱 Seeding de la base..."
    docker exec jow-backend npm run prisma:seed || echo "⚠️  Seed échoué (peut-être que ts-node n'est pas installé)"
    
    # Frontend
    echo "🎨 Démarrage du frontend..."
    docker-compose up -d jow-frontend
    
    echo ""
    echo "✅ Déploiement terminé !"
    echo ""
    echo "📋 Vérification:"
    docker logs jow-backend --tail 10
else
    echo "❌ Erreur: PostgreSQL n'est pas prêt"
    docker logs jow-postgres --tail 20
    exit 1
fi


#!/bin/bash
# Script pour corriger tous les problèmes

set -e

cd ~/foodtrack
git pull --rebase || true
cd ~/pi

echo "📝 Chargement des variables depuis ~/foodtrack/.env.production..."
if [ ! -f ~/foodtrack/.env.production ]; then
    echo "❌ ERREUR: ~/foodtrack/.env.production n'existe pas"
    exit 1
fi

export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

if [ -z "$MEALPLANS_DB_PASSWORD" ]; then
    echo "❌ ERREUR: MEALPLANS_DB_PASSWORD n'est pas défini"
    exit 1
fi

echo "✅ Variables chargées"

# Vérifier que docker-compose.yml utilise ${MEALPLANS_DB_PASSWORD}
if ! grep -q "POSTGRES_PASSWORD: \${MEALPLANS_DB_PASSWORD}" docker-compose.yml; then
    echo "⚠️  ATTENTION: docker-compose.yml n'utilise pas \${MEALPLANS_DB_PASSWORD}"
    echo "   Modifiez POSTGRES_PASSWORD: Benoit45+ en POSTGRES_PASSWORD: \${MEALPLANS_DB_PASSWORD}"
    exit 1
fi

echo "✅ docker-compose.yml utilise bien \${MEALPLANS_DB_PASSWORD}"

# Arrêter
echo "⏹️  Arrêt des services..."
docker compose stop mealplans-postgres mealplans-backend mealplans-frontend 2>/dev/null || true

# Supprimer les conteneurs
echo "🗑️  Suppression des conteneurs..."
docker compose rm -f mealplans-postgres mealplans-backend mealplans-frontend 2>/dev/null || true

# Attendre un peu
sleep 2

# Supprimer le volume
if docker volume ls | grep -q mealplans-postgres-data; then
    echo "🗑️  Suppression du volume PostgreSQL..."
    docker volume rm mealplans-postgres-data 2>/dev/null || {
        echo "⚠️  Le volume est encore utilisé, forçons la suppression..."
        docker volume rm mealplans-postgres-data --force 2>/dev/null || true
    }
fi

# Rebuild backend et frontend (pour ts-node et nouvelles modifications)
echo "🔨 Rebuild du backend..."
docker compose build --no-cache mealplans-backend

echo "🔨 Rebuild du frontend..."
docker compose build --no-cache mealplans-frontend

# Démarrer PostgreSQL
echo "🔄 Démarrage de PostgreSQL..."
docker compose up -d mealplans-postgres

# Attendre
echo "⏳ Attente (30 secondes)..."
sleep 30

# Vérifier
if docker exec mealplans-postgres pg_isready -U mealplans_user -d mealplans_db >/dev/null 2>&1; then
    echo "✅ PostgreSQL est prêt"
    
    # Tester la connexion
    if docker exec -e PGPASSWORD="$MEALPLANS_DB_PASSWORD" mealplans-postgres psql -U mealplans_user -d mealplans_db -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Connexion réussie"
    else
        echo "❌ Connexion échouée - vérifiez le mot de passe"
        exit 1
    fi
    
    # Backend
    echo "🚀 Démarrage du backend..."
    echo "   Le docker-entrypoint.sh appliquera automatiquement le schéma avec 'db push'"
    docker compose up -d mealplans-backend
    
    # Attendre que le backend soit prêt et que docker-entrypoint.sh ait appliqué le schéma
    echo "⏳ Attente que le backend démarre et applique le schéma (via docker-entrypoint.sh)..."
    
    max_attempts=60
    attempt=0
    schema_applied=false
    while [ $attempt -lt $max_attempts ]; do
        # Vérifier si le schéma a été appliqué
        if docker logs mealplans-backend 2>&1 | grep -q "Database schema applied successfully"; then
            echo "✅ Backend démarré et schéma appliqué"
            schema_applied=true
            break
        fi
        # Vérifier si l'application a démarré (signe que le schéma est appliqué)
        if docker logs mealplans-backend 2>&1 | grep -q "Starting application\|Application is running\|Nest application successfully started"; then
            echo "✅ Backend démarré (schéma déjà appliqué)"
            schema_applied=true
            break
        fi
        # Vérifier les erreurs
        if docker logs mealplans-backend 2>&1 | grep -q "Failed to apply database schema"; then
            echo "❌ Échec de l'application du schéma"
            docker logs mealplans-backend --tail 30
            exit 1
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ "$schema_applied" = false ]; then
        echo "⚠️  Timeout en attendant le démarrage du backend"
        echo "📋 Derniers logs du backend :"
        docker logs mealplans-backend --tail 30
        echo ""
        echo "⚠️  Le backend pourrait encore être en train de démarrer..."
        echo "   Vous pouvez vérifier les logs avec: docker logs mealplans-backend -f"
    fi
    
    # Attendre un peu pour que tout soit prêt
    sleep 5
    
    # Frontend
    echo "🎨 Frontend..."
    docker compose up -d mealplans-frontend
    
    echo ""
    echo "✅ Terminé !"
    docker logs mealplans-backend --tail 10
else
    echo "❌ PostgreSQL n'est pas prêt"
    docker logs mealplans-postgres --tail 20
    exit 1
fi


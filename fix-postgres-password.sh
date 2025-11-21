#!/bin/bash
# Script pour réinitialiser PostgreSQL avec le bon mot de passe

echo "⚠️  ATTENTION: Ce script va SUPPRIMER toutes les données PostgreSQL"
echo "Appuyez sur Ctrl+C pour annuler, ou Enter pour continuer..."
read

cd ~/pi

# Charger les variables
export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

# Arrêter les services
echo "⏹️  Arrêt des services..."
docker-compose stop jow-postgres jow-backend jow-frontend

# Supprimer le conteneur PostgreSQL
echo "🗑️  Suppression du conteneur PostgreSQL..."
docker-compose rm -f jow-postgres

# Supprimer le volume PostgreSQL (⚠️ PERDREZ LES DONNÉES)
echo "🗑️  Suppression du volume PostgreSQL..."
docker volume rm jow-postgres-data

# Redémarrer PostgreSQL avec le nouveau mot de passe
echo "🔄 Redémarrage de PostgreSQL avec le nouveau mot de passe..."
docker-compose up -d jow-postgres

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
sleep 15

# Vérifier
if docker exec jow-postgres pg_isready -U jow_user -d jow_db; then
    echo "✅ PostgreSQL est prêt avec le nouveau mot de passe"
    
    # Appliquer les migrations
    echo "📦 Application des migrations..."
    docker-compose up -d jow-backend
    sleep 10
    docker exec jow-backend npx prisma migrate deploy
    
    # Seeder
    echo "🌱 Seeding de la base..."
    docker exec jow-backend npm run prisma:seed
    
    # Redémarrer le frontend
    docker-compose up -d jow-frontend
    
    echo "✅ Tout est prêt !"
else
    echo "❌ Erreur: PostgreSQL n'est pas prêt"
    docker logs jow-postgres --tail 20
fi


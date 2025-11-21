# 🚀 Déploiement Automatique - FoodTrack

## ✅ Prérequis

- Docker et Docker Compose installés
- Git installé
- Variables d'environnement configurées

## 📋 Déploiement en une commande

### Première fois

```bash
# 1. Cloner le projet
git clone <votre-repo> foodtrack
cd foodtrack

# 2. Créer le fichier .env.production
cp .env.production.example .env.production
nano .env.production
# Remplir toutes les variables (voir .env.production.example)

# 3. Charger les variables
export $(cat .env.production | grep -v '^#' | xargs)

# 4. Lancer le script de déploiement
./DEPLOY_SCRIPT.sh
```

### Mise à jour (après git pull)

```bash
cd foodtrack

# 1. Mettre à jour le code
git pull

# 2. Rebuild et redéployer
./DEPLOY_SCRIPT.sh
```

## 🔧 Déploiement manuel

Si vous préférez faire étape par étape :

```bash
# 1. Charger les variables
export $(cat .env.production | grep -v '^#' | xargs)

# 2. Arrêter les services
docker-compose -f docker-compose.prod.yml down

# 3. Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. Démarrer PostgreSQL
docker-compose -f docker-compose.prod.yml up -d jow-postgres
sleep 15

# 5. Appliquer les migrations
docker exec jow-backend npx prisma migrate deploy

# 6. Démarrer le backend
docker-compose -f docker-compose.prod.yml up -d jow-backend
sleep 10

# 7. Seeder (optionnel, seulement si base vide)
docker exec jow-backend npm run prisma:seed

# 8. Démarrer le frontend
docker-compose -f docker-compose.prod.yml up -d jow-frontend
```

## 📝 Variables d'environnement requises

Voir `.env.production.example` pour la liste complète.

**Variables obligatoires :**
- `JOW_DB_PASSWORD` : Mot de passe PostgreSQL
- `JOW_JWT_SECRET` : Secret JWT (générer avec `openssl rand -base64 64`)
- `JOW_SMTP_USER` : Email pour SMTP
- `JOW_SMTP_PASS` : Mot de passe SMTP
- `JOW_ADMIN_EMAIL` : Email admin pour notifications

**Variables optionnelles :**
- `FRONTEND_URL` : URL du frontend (défaut: https://food.chocot.be)
- `API_URL` : URL de l'API (défaut: https://apifood.chocot.be)
- `JOW_SMTP_HOST` : Host SMTP (défaut: smtp.gmail.com)

## 🔍 Vérification après déploiement

```bash
# Vérifier l'état des services
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
docker logs jow-backend --tail 20
docker logs jow-frontend --tail 20

# Tester l'API
curl http://localhost:3000/api

# Tester le frontend
curl http://localhost:3000
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker logs jow-backend --tail 50

# Vérifier que PostgreSQL est prêt
docker exec jow-postgres pg_isready -U jow_user -d jow_db
```

### Erreur de connexion à la base de données

Vérifiez que `JOW_DB_PASSWORD` dans `.env.production` correspond au mot de passe PostgreSQL.

### Les migrations échouent

```bash
# Appliquer manuellement
docker exec jow-backend npx prisma migrate deploy
```

## 📦 Structure du déploiement

Le script `DEPLOY_SCRIPT.sh` fait automatiquement :
1. ✅ Vérifie les variables d'environnement
2. ✅ Arrête les services existants
3. ✅ Rebuild les images Docker
4. ✅ Démarre PostgreSQL
5. ✅ Attend que PostgreSQL soit prêt
6. ✅ Démarre le backend (qui applique les migrations)
7. ✅ Seed la base si elle est vide
8. ✅ Démarre le frontend
9. ✅ Vérifie que tout fonctionne

## 🔄 Intégration avec Traefik

Pour utiliser avec Traefik, ajoutez les labels dans votre `swag.yml` :

```yaml
  jow-backend:
    # ... (configuration existante)
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.jow-api.rule=Host(`apifood.chocot.be`)"
      - "traefik.http.routers.jow-api.entrypoints=http"
      - "traefik.http.services.jow-api.loadbalancer.server.port=3000"
      - "traefik.http.routers.jow-api.service=jow-api"

  jow-frontend:
    # ... (configuration existante)
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.jow.rule=Host(`food.chocot.be`)"
      - "traefik.http.routers.jow.entrypoints=http"
      - "traefik.http.services.jow.loadbalancer.server.port=3000"
      - "traefik.http.routers.jow.service=jow"
```

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées dans `.env.production`
- [ ] `JOW_DB_PASSWORD` défini et sécurisé
- [ ] `JOW_JWT_SECRET` généré (32+ caractères)
- [ ] Credentials SMTP configurés
- [ ] DNS pointant vers le serveur
- [ ] Ports 80/443 ouverts (si pas de Traefik)
- [ ] Script `DEPLOY_SCRIPT.sh` exécutable (`chmod +x`)
- [ ] Git pull effectué
- [ ] Script de déploiement exécuté
- [ ] Services démarrés et fonctionnels
- [ ] Tests d'accès réussis


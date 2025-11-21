# ✅ Checklist de Déploiement Automatique

## Avant le premier déploiement

- [ ] **Variables d'environnement** : Créer `.env.production` avec toutes les variables requises
- [ ] **JOW_DB_PASSWORD** : Mot de passe PostgreSQL sécurisé (32+ caractères)
- [ ] **JOW_JWT_SECRET** : Secret JWT généré (`openssl rand -base64 64`)
- [ ] **SMTP configuré** : Credentials Gmail ou autre provider
- [ ] **DNS configuré** : `food.chocot.be` et `apifood.chocot.be` pointent vers le serveur
- [ ] **Ports ouverts** : 80/443 (ou Traefik configuré)

## Déploiement automatique

### Première fois

```bash
git clone <repo> foodtrack
cd foodtrack
cp .env.production.example .env.production
nano .env.production  # Remplir les variables
export $(cat .env.production | grep -v '^#' | xargs)
./DEPLOY_SCRIPT.sh
```

### Mise à jour (après git pull)

```bash
cd foodtrack
git pull
./DEPLOY_SCRIPT.sh
```

## ✅ Ce qui est automatique

Le script `DEPLOY_SCRIPT.sh` fait automatiquement :

1. ✅ **Vérification des variables** : S'assure que `JOW_DB_PASSWORD` et `JOW_JWT_SECRET` sont définis
2. ✅ **Arrêt propre** : Arrête les services existants
3. ✅ **Rebuild** : Rebuild les images Docker sans cache
4. ✅ **PostgreSQL** : Démarre et attend qu'il soit prêt
5. ✅ **Migrations** : Applique automatiquement les migrations Prisma (via `docker-entrypoint.sh`)
6. ✅ **Backend** : Démarre le backend
7. ✅ **Seed** : Seed la base seulement si elle est vide
8. ✅ **Frontend** : Démarre le frontend
9. ✅ **Vérification** : Vérifie que tout fonctionne

## 🔍 Vérification post-déploiement

```bash
# État des services
docker-compose -f docker-compose.prod.yml ps

# Logs backend
docker logs jow-backend --tail 20

# Logs frontend
docker logs jow-frontend --tail 20

# Test API
curl http://localhost:3000/api

# Test frontend
curl http://localhost:3000
```

## 🐛 Problèmes courants

### Le backend ne démarre pas

**Cause** : Erreur de connexion à la base de données

**Solution** :
```bash
# Vérifier les logs
docker logs jow-backend --tail 50

# Vérifier que PostgreSQL est prêt
docker exec jow-postgres pg_isready -U jow_user -d jow_db

# Vérifier le mot de passe dans .env.production
echo $JOW_DB_PASSWORD
```

### Les migrations échouent

**Cause** : Base de données non accessible ou migrations en conflit

**Solution** :
```bash
# Appliquer manuellement
docker exec jow-backend npx prisma migrate deploy

# Voir l'état des migrations
docker exec jow-backend npx prisma migrate status
```

### Le frontend ne se connecte pas au backend

**Cause** : `NUXT_PUBLIC_API_BASE` incorrect ou CORS mal configuré

**Solution** :
```bash
# Vérifier la variable
docker exec jow-frontend env | grep NUXT_PUBLIC_API_BASE

# Vérifier CORS dans le backend
docker exec jow-backend env | grep CORS_ORIGIN
```

## 📝 Fichiers importants

- **`docker-compose.prod.yml`** : Configuration Docker Compose pour production
- **`DEPLOY_SCRIPT.sh`** : Script de déploiement automatique
- **`.env.production`** : Variables d'environnement (à créer, ne pas commiter)
- **`backend/docker-entrypoint.sh`** : Script qui applique les migrations automatiquement
- **`README_DEPLOYMENT.md`** : Documentation complète

## ✅ Réponse à votre question

**Oui, avec le code actuel et un docker-compose bien écrit, le projet devrait se déployer sans encombre après un `git pull` !**

**Conditions :**
1. ✅ Les variables d'environnement sont configurées dans `.env.production`
2. ✅ Le script `DEPLOY_SCRIPT.sh` est exécutable
3. ✅ PostgreSQL peut être créé ou existe déjà
4. ✅ Les ports ne sont pas déjà utilisés

**Ce qui est automatique :**
- ✅ Build des images Docker
- ✅ Application des migrations Prisma
- ✅ Seed de la base (si vide)
- ✅ Démarrage de tous les services
- ✅ Vérification que tout fonctionne

**Commande simple :**
```bash
git pull && ./DEPLOY_SCRIPT.sh
```

C'est tout ! 🎉


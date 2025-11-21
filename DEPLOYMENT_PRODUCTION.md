# 🚀 Déploiement en Production

## Configuration automatique

Le projet est configuré pour s'initialiser automatiquement au démarrage, même avec une base de données vierge.

### Comment ça fonctionne

1. **Backend** : Le `docker-entrypoint.sh` s'exécute automatiquement au démarrage du conteneur
2. **Initialisation automatique** :
   - Attend que PostgreSQL soit prêt
   - Applique le schéma avec `prisma db push`
   - Exécute le seed si la base est vide
   - Démarre l'application

### Sur votre serveur

#### 1. Vérifier que le Dockerfile de production est utilisé

Dans votre `docker-compose.yml` (ou `swag.yml`), assurez-vous que le backend utilise le **Dockerfile de production** :

```yaml
jow-backend:
  build:
    context: ~/foodtrack/backend
    dockerfile: Dockerfile  # ← Pas Dockerfile.dev !
```

#### 2. Premier déploiement (base vierge)

```bash
cd ~/pi

# Charger les variables d'environnement
export $(cat ~/foodtrack/.env.production | grep -v '^#' | grep -v '^$' | xargs)

# Supprimer l'ancien conteneur et volume si nécessaire
docker compose stop jow-backend jow-postgres
docker compose rm -f jow-backend
docker volume rm jow-postgres-data 2>/dev/null || true

# Rebuild le backend
docker compose build --no-cache jow-backend

# Démarrer PostgreSQL
docker compose up -d jow-postgres

# Attendre que PostgreSQL soit prêt
sleep 10

# Démarrer le backend (l'entrypoint fera tout automatiquement)
docker compose up -d jow-backend

# Vérifier les logs
docker logs jow-backend -f
```

Vous devriez voir dans les logs :
```
⏳ Waiting for database to be ready...
✅ Database is ready!
📦 Applying database schema...
✅ Database schema applied successfully
🌱 Running seed (will skip if data already exists)...
✅ Ingredients seeded
✅ Created 40 recipes
🎉 Seed completed successfully!
🚀 Starting application...
```

#### 3. Redémarrage normal (base existante)

Si la base de données existe déjà :

```bash
cd ~/pi
docker compose up -d jow-backend
```

Le script détectera automatiquement que les données existent et ne fera que :
- Vérifier que le schéma est à jour
- Redémarrer l'application

#### 4. Mise à jour du code

```bash
cd ~/foodtrack
git pull

cd ~/pi
docker compose build --no-cache jow-backend
docker compose up -d jow-backend
```

L'entrypoint appliquera automatiquement les changements de schéma si nécessaire.

### Vérification

Pour vérifier que tout fonctionne :

```bash
# Vérifier que les tables existent
docker exec jow-postgres psql -U jow_user -d jow_db -c "\dt"

# Vérifier les ingrédients
docker exec jow-postgres psql -U jow_user -d jow_db -c "SELECT COUNT(*) FROM ingredients;"

# Vérifier les recettes
docker exec jow-postgres psql -U jow_user -d jow_db -c "SELECT COUNT(*) FROM recipes;"

# Vérifier les logs du backend
docker logs jow-backend --tail 50
```

### Dépannage

#### Le seed ne s'exécute pas

Si le seed ne s'exécute pas, vérifiez :
1. Que `tsx` est installé dans le conteneur : `docker exec jow-backend which tsx`
2. Que le fichier `seed.ts` existe : `docker exec jow-backend ls -la /app/prisma/seed.ts`
3. Les logs : `docker logs jow-backend`

#### Les migrations ne s'appliquent pas

Si `prisma db push` échoue :
1. Vérifier la connexion à la base : `docker exec jow-backend npx prisma db execute --stdin <<< 'SELECT 1;'`
2. Vérifier les variables d'environnement : `docker exec jow-backend env | grep DATABASE_URL`
3. Vérifier les logs : `docker logs jow-backend`

#### Le conteneur redémarre en boucle

Si le conteneur redémarre en boucle :
1. Vérifier les logs : `docker logs jow-backend`
2. Vérifier que PostgreSQL est accessible : `docker logs jow-postgres`
3. Vérifier les variables d'environnement dans `docker-compose.yml`

### Notes importantes

- **`prisma db push`** : Utilisé au lieu de `migrate deploy` car plus fiable pour créer le schéma initial
- **Seed automatique** : Ne s'exécute que si la base est vide (détection automatique)
- **Pas de perte de données** : Le seed ne supprime pas les données existantes
- **Idempotent** : Vous pouvez redémarrer le conteneur autant de fois que vous voulez, ça ne cassera rien


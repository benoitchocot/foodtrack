# Fix Database Connection Error

## Problème

Le backend ne peut pas se connecter à PostgreSQL :
```
Authentication failed against database server at `jow-postgres`, 
the provided database credentials for `jow_user` are not valid.
```

## Solutions

### Solution 1 : Vérifier que PostgreSQL est démarré

```bash
# Vérifier l'état de PostgreSQL
docker ps | grep jow-postgres

# Vérifier les logs
docker logs jow-postgres --tail 20

# Si PostgreSQL n'est pas démarré
docker-compose -f docker-compose.yml up -d jow-postgres

# Attendre que PostgreSQL soit prêt
sleep 10
```

### Solution 2 : Vérifier le mot de passe

Le problème vient probablement d'une incohérence entre :
- Le mot de passe défini dans `jow-postgres` : `${JOW_DB_PASSWORD:-Benoit45+}`
- Le mot de passe dans `DATABASE_URL` du backend : `${JOW_DB_PASSWORD:-Benoit45+}`

**Sur votre serveur**, vérifiez :

```bash
# Vérifier si la variable JOW_DB_PASSWORD est définie
echo $JOW_DB_PASSWORD

# Si elle n'est pas définie, les deux utilisent "Benoit45+" par défaut
# Mais peut-être que PostgreSQL a été créé avec un autre mot de passe
```

### Solution 3 : Réinitialiser PostgreSQL avec le bon mot de passe

```bash
# Arrêter les services
docker-compose -f docker-compose.yml stop jow-postgres jow-backend

# Supprimer le volume PostgreSQL (⚠️ PERDREZ LES DONNÉES)
docker volume rm jow-postgres-data

# OU si le volume n'existe pas encore, vérifier le nom
docker volume ls | grep jow

# Redémarrer PostgreSQL
docker-compose -f docker-compose.yml up -d jow-postgres

# Attendre 10 secondes
sleep 10

# Vérifier que PostgreSQL est prêt
docker exec jow-postgres pg_isready -U jow_user -d jow_db

# Redémarrer le backend
docker-compose -f docker-compose.yml up -d jow-backend
```

### Solution 4 : Définir explicitement le mot de passe

Dans votre `docker-compose.yml`, remplacez les variables par des valeurs explicites pour tester :

```yaml
  jow-postgres:
    environment:
      POSTGRES_PASSWORD: Benoit45+  # Valeur explicite au lieu de ${JOW_DB_PASSWORD:-Benoit45+}

  jow-backend:
    environment:
      DATABASE_URL: postgresql://jow_user:Benoit45+@jow-postgres:5432/jow_db?schema=public
```

Puis redémarrez :

```bash
docker-compose -f docker-compose.yml down jow-postgres jow-backend
docker-compose -f docker-compose.yml up -d jow-postgres
sleep 10
docker-compose -f docker-compose.yml up -d jow-backend
```

### Solution 5 : Vérifier que les conteneurs sont sur le même réseau

```bash
# Vérifier le réseau du backend
docker inspect jow-backend | grep -A 10 Networks

# Vérifier le réseau de PostgreSQL
docker inspect jow-postgres | grep -A 10 Networks

# Ils doivent être sur le même réseau (généralement "bridge" ou le réseau par défaut)
```

Si ce n'est pas le cas, dans votre `docker-compose.yml`, assurez-vous que les deux services n'ont PAS de section `networks:` différente, ou qu'ils partagent le même réseau.

### Solution 6 : Tester la connexion manuellement

```bash
# Tester depuis le conteneur backend
docker exec -it jow-backend sh

# Dans le conteneur
psql postgresql://jow_user:Benoit45+@jow-postgres:5432/jow_db

# Si ça fonctionne, vous verrez le prompt psql
# Tapez \q pour quitter
exit
```

## Solution recommandée (rapide)

```bash
# 1. Arrêter tout
docker-compose -f docker-compose.yml stop jow-postgres jow-backend

# 2. Supprimer le volume PostgreSQL (⚠️ PERDREZ LES DONNÉES)
docker volume rm jow-postgres-data

# 3. Modifier docker-compose.yml pour utiliser des valeurs explicites
# Remplacez ${JOW_DB_PASSWORD:-Benoit45+} par Benoit45+ partout

# 4. Redémarrer PostgreSQL
docker-compose -f docker-compose.yml up -d jow-postgres

# 5. Attendre 15 secondes
sleep 15

# 6. Vérifier que PostgreSQL est prêt
docker exec jow-postgres pg_isready -U jow_user -d jow_db

# 7. Appliquer les migrations
docker exec jow-backend npx prisma migrate deploy

# 8. Seeder la base
docker exec jow-backend npm run prisma:seed

# 9. Redémarrer le backend
docker-compose -f docker-compose.yml up -d jow-backend

# 10. Vérifier les logs
docker logs jow-backend --tail 20
```

Vous devriez voir :
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation available at: http://localhost:3000/api
```

Sans les erreurs de connexion Prisma !


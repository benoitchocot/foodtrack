# Fix Traefik Routing pour FoodTrack

## Diagnostic

Le backend fonctionne (vous voyez le JSON 404 de NestJS), mais Traefik ne route pas correctement.

## Sur le serveur, exécutez ces commandes de diagnostic :

```bash
# 1. Vérifier que le backend est bien démarré
docker ps | grep jow-backend

# 2. Vérifier les logs du backend
docker logs jow-backend --tail 20

# 3. Tester le backend directement (sans Traefik)
curl http://localhost:3000
# Devrait afficher: {"message":"Cannot GET /","error":"Not Found","statusCode":404}

# 4. Tester la route /api (Swagger)
curl http://localhost:3000/api
# Devrait afficher du HTML de Swagger

# 5. Vérifier les labels Traefik du conteneur
docker inspect jow-backend | grep -A 10 Labels
```

## Solution : Vérifier et corriger le swag.yml

Le problème vient probablement des labels Traefik. Vérifiez que dans `~/swag.yml`, la section `jow-backend` a bien :

```yaml
  jow-backend:
    build: ~/Jow/backend
    container_name: jow-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://jow_user:${JOW_DB_PASSWORD}@jow-postgres:5432/jow_db?schema=public
      JWT_SECRET: ${JOW_JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: https://food.chocot.be
      SMTP_HOST: ${JOW_SMTP_HOST:-smtp.gmail.com}
      SMTP_PORT: ${JOW_SMTP_PORT:-587}
      SMTP_SECURE: ${JOW_SMTP_SECURE:-false}
      SMTP_USER: ${JOW_SMTP_USER}
      SMTP_PASS: ${JOW_SMTP_PASS}
      SMTP_FROM: ${JOW_SMTP_FROM:-noreply@food.chocot.be}
      ADMIN_EMAIL: ${JOW_ADMIN_EMAIL:-benoit.chocot@gmail.com}
      FRONTEND_URL: https://food.chocot.be
    volumes:
      - ~/jow-uploads:/app/uploads
    depends_on:
      jow-postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.jow-api.rule=Host(`apifood.chocot.be`)"
      - "traefik.http.routers.jow-api.entrypoints=http"
      - "traefik.http.services.jow-api.loadbalancer.server.port=3000"
      - "traefik.http.routers.jow-api.service=jow-api"
```

## Points critiques à vérifier :

1. **Le nom du service Traefik doit être cohérent** :
   - Router : `jow-api`
   - Service : `jow-api`
   - Ils doivent correspondre

2. **Le port doit être 3000** :
   ```yaml
   - "traefik.http.services.jow-api.loadbalancer.server.port=3000"
   ```

3. **Le backend doit être dans le même réseau Docker que Traefik**

## Si le problème persiste :

```bash
# Vérifier que Traefik voit le service
docker logs reverse-proxy | grep jow

# Redémarrer Traefik
docker-compose -f swag.yml restart reverse-proxy

# Redémarrer le backend
docker-compose -f swag.yml restart jow-backend

# Attendre 10 secondes
sleep 10

# Tester à nouveau
curl -I https://apifood.chocot.be
```

## Alternative : Tester sans HTTPS d'abord

Si vous n'avez pas configuré HTTPS, les labels doivent utiliser `http` comme entrypoint :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.jow-api.rule=Host(`apifood.chocot.be`)"
  - "traefik.http.routers.jow-api.entrypoints=http"  # Pas websecure
  - "traefik.http.services.jow-api.loadbalancer.server.port=3000"
  - "traefik.http.routers.jow-api.service=jow-api"
```

## Vérifier le fichier traefik.toml

Votre Traefik doit avoir un entrypoint `http` configuré dans `~/pi/traefik.toml` :

```toml
[entryPoints]
  [entryPoints.http]
    address = ":80"
```

## Test final

Une fois corrigé :

```bash
# Test 1 : Backend direct
curl http://localhost:3000/api
# Devrait afficher du HTML

# Test 2 : Via Traefik (HTTP)
curl http://apifood.chocot.be/api
# Devrait afficher le même HTML

# Test 3 : Via Traefik (HTTPS si configuré)
curl https://apifood.chocot.be/api
# Devrait afficher le même HTML
```


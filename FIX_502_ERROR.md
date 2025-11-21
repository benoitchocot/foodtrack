# Fix 502 Bad Gateway - FoodTrack

## Problèmes identifiés dans votre docker-compose.yml

### 1. **Chemin de build incorrect**
Vous avez :
```yaml
build: ~/foodtrack/backend
build: ~/foodtrack/frontend
```

Mais le projet est probablement dans `~/Jow` ou `~/foodtrack`. Vérifiez où se trouve réellement le projet.

### 2. **Frontend : Port incorrect**
Le frontend Nuxt en production écoute sur le port **3000** par défaut, mais votre label Traefik indique aussi le port 3000. C'est correct, mais vérifions.

### 3. **Backend : Pas de réseau explicite**
Le backend n'a pas de section `networks`, donc il devrait être sur le réseau par défaut. Mais vérifions que Traefik peut le joindre.

## 🔧 Solution complète

### Étape 1 : Vérifier où est le projet

```bash
# Sur votre serveur
ls -la ~/ | grep -E "Jow|foodtrack"
```

### Étape 2 : Vérifier que le backend démarre correctement

```bash
# Vérifier les logs
docker logs jow-backend --tail 50

# Si le backend crash, vous verrez l'erreur
```

### Étape 3 : Tester le backend directement

```bash
# Depuis le serveur
curl http://localhost:3000
# Devrait afficher: {"message":"Cannot GET /","error":"Not Found","statusCode":404}

curl http://localhost:3000/api
# Devrait afficher du HTML (Swagger)
```

### Étape 4 : Corriger le docker-compose.yml

Remplacez la section FoodTrack par ceci (en ajustant les chemins si nécessaire) :

```yaml
  jow-postgres:
    image: postgres:16-alpine
    container_name: jow-postgres
    restart: always
    environment:
      POSTGRES_USER: jow_user
      POSTGRES_PASSWORD: ${JOW_DB_PASSWORD:-Benoit45+}
      POSTGRES_DB: jow_db
    volumes:
      - jow-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jow_user -d jow_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  jow-backend:
    build: ~/foodtrack/backend  # OU ~/Jow/backend selon où est le projet
    container_name: jow-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://jow_user:${JOW_DB_PASSWORD:-Benoit45+}@jow-postgres:5432/jow_db?schema=public
      JWT_SECRET: ${JOW_JWT_SECRET:-change-this-super-secret-jwt-key-in-production}
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: https://food.chocot.be
      SMTP_HOST: ${JOW_SMTP_HOST:-smtp.gmail.com}
      SMTP_PORT: ${JOW_SMTP_PORT:-587}
      SMTP_SECURE: ${JOW_SMTP_SECURE:-false}
      SMTP_USER: "benoit.chocot@gmail.com"
      SMTP_PASS: "vtyuxpobjgfgrznr"
      SMTP_FROM: ${JOW_SMTP_FROM:-noreply@chocot.be}
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

  jow-frontend:
    build: ~/foodtrack/frontend  # OU ~/Jow/frontend selon où est le projet
    container_name: jow-frontend
    restart: always
    environment:
      NUXT_PUBLIC_API_BASE: https://apifood.chocot.be
    depends_on:
      - jow-backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.jow.rule=Host(`food.chocot.be`)"
      - "traefik.http.routers.jow.entrypoints=http"
      - "traefik.http.services.jow.loadbalancer.server.port=3000"
      - "traefik.http.routers.jow.service=jow"
```

### Étape 5 : Redémarrer proprement

```bash
# Arrêter les services
docker-compose -f docker-compose.yml stop jow-backend jow-frontend

# Supprimer les conteneurs
docker-compose -f docker-compose.yml rm -f jow-backend jow-frontend

# Rebuild (si vous avez modifié le code)
docker-compose -f docker-compose.yml build jow-backend jow-frontend

# Démarrer
docker-compose -f docker-compose.yml up -d jow-postgres jow-backend jow-frontend

# Attendre que tout démarre
sleep 15

# Vérifier les logs
docker logs jow-backend --tail 20
docker logs jow-frontend --tail 20
```

### Étape 6 : Vérifier que Traefik voit les services

```bash
# Vérifier les logs Traefik
docker logs reverse-proxy | grep -i jow

# Redémarrer Traefik pour qu'il redécouvre
docker-compose -f docker-compose.yml restart reverse-proxy
```

### Étape 7 : Tests

```bash
# Test 1 : Backend direct
curl http://localhost:3000/api

# Test 2 : Via Traefik
curl http://apifood.chocot.be/api

# Test 3 : Frontend
curl http://food.chocot.be
```

## 🐛 Diagnostic si ça ne fonctionne toujours pas

### Vérifier que le backend écoute bien

```bash
# Entrer dans le conteneur
docker exec -it jow-backend sh

# Dans le conteneur
wget -qO- http://localhost:3000
exit
```

### Vérifier le réseau Docker

```bash
# Vérifier sur quel réseau est le backend
docker inspect jow-backend | grep -A 10 Networks

# Vérifier sur quel réseau est Traefik
docker inspect reverse-proxy | grep -A 10 Networks

# Ils doivent être sur le même réseau (généralement "bridge" ou le réseau par défaut)
```

### Vérifier les ports

```bash
# Vérifier que le backend écoute sur le port 3000
docker exec jow-backend netstat -tlnp | grep 3000
# OU
docker exec jow-backend ss -tlnp | grep 3000
```

## ⚠️ Points critiques

1. **Le chemin de build** : `~/foodtrack` ou `~/Jow` ? Vérifiez où est réellement votre projet
2. **Le backend doit démarrer sans erreur** : Vérifiez `docker logs jow-backend`
3. **Le backend doit écouter sur 0.0.0.0:3000** (pas localhost)
4. **Traefik doit être sur le même réseau Docker** que le backend

## 🔍 Commande de diagnostic complète

Exécutez ceci et partagez-moi le résultat :

```bash
echo "=== État des conteneurs ==="
docker ps | grep jow

echo -e "\n=== Logs backend (dernières 20 lignes) ==="
docker logs jow-backend --tail 20

echo -e "\n=== Test backend direct ==="
curl -v http://localhost:3000/api 2>&1 | head -20

echo -e "\n=== Réseau backend ==="
docker inspect jow-backend | grep -A 5 Networks

echo -e "\n=== Labels Traefik backend ==="
docker inspect jow-backend | grep -A 10 Labels
```


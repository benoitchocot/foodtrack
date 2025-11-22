# Configuration du déploiement automatique

Ce workflow GitHub Actions déploie automatiquement le projet à chaque push sur la branche `main`.

## Configuration des secrets GitHub

Pour que le déploiement fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez les secrets suivants :

### `SSH_HOST`
L'adresse IP ou le nom de domaine de votre serveur de production.
```
Exemple: 192.168.1.100 ou server.example.com
```

### `SSH_USER`
L'utilisateur SSH utilisé pour se connecter au serveur.
```
Exemple: ubuntu ou deploy
```

### `SSH_PRIVATE_KEY`
La clé privée SSH pour vous connecter au serveur. Pour générer une paire de clés :

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server

# Afficher la clé privée pour la copier dans GitHub Secrets
cat ~/.ssh/github_actions_deploy
```

Copiez tout le contenu de la clé privée (incluant `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`) dans le secret `SSH_PRIVATE_KEY`.

## Prérequis sur le serveur

Le serveur doit avoir :

1. **Git installé** et le repository cloné dans `~/foodtrack`
2. **Docker et Docker Compose** installés
3. Le fichier `~/foodtrack/.env.production` avec les variables d'environnement
4. Le script `fix-all.sh` présent et exécutable dans `~/foodtrack`
5. Les permissions SSH configurées pour permettre la connexion

## Test du déploiement

Pour tester manuellement le déploiement :

```bash
# Sur le serveur
cd ~/foodtrack
git pull origin main
./fix-all.sh
```

## Logs du déploiement

Les logs du déploiement sont disponibles dans l'onglet **Actions** de votre repository GitHub.

## Dépannage

### Erreur de connexion SSH
- Vérifiez que `SSH_HOST`, `SSH_USER` et `SSH_PRIVATE_KEY` sont correctement configurés
- Testez la connexion manuellement : `ssh -i ~/.ssh/github_actions_deploy user@your-server`

### Erreur lors du git pull
- Vérifiez que le repository est bien cloné dans `~/foodtrack`
- Vérifiez que l'utilisateur SSH a les droits d'écriture sur le repository

### Erreur lors de l'exécution de fix-all.sh
- Vérifiez que le script est exécutable : `chmod +x ~/foodtrack/fix-all.sh`
- Vérifiez que `~/foodtrack/.env.production` existe et contient `JOW_DB_PASSWORD`
- Vérifiez les logs du workflow pour plus de détails


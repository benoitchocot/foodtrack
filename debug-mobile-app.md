# 🔍 Guide : Déboguer l'application mobile MealPlans

## Méthode 1 : Chrome DevTools (RECOMMANDÉ - Voit les erreurs JavaScript)

### Étapes :

1. **Ouvrir l'application sur votre téléphone**

2. **Sur votre PC, ouvrir Chrome et aller sur :**
   ```
   chrome://inspect
   ```

3. **Activer le débogage USB (si pas déjà fait) :**
   - Sur votre téléphone : Paramètres → Options développeur → Débogage USB (activé)
   - Accepter l'autorisation sur le téléphone si demandé

4. **Dans Chrome DevTools :**
   - Vous verrez l'app "MealPlans" sous "Remote Target"
   - Cliquez sur "inspect"
   - Une fenêtre DevTools s'ouvrira avec la console JavaScript
   - Les erreurs d'API y apparaîtront !

5. **Reproduire le problème :**
   - Essayez de vous connecter dans l'app
   - Observez les erreurs dans la console DevTools
   - Vous verrez les appels API, les erreurs CORS, les erreurs réseau, etc.

## Méthode 2 : Logs Android avec filtres améliorés

```bash
# Nettoyer les logs
adb logcat -c

# Surveiller avec filtres spécifiques
adb logcat | grep -iE "mealplans|chromium|webview|console|error|exception|failed|network|http|fetch|api|localhost|connection|timeout|CORS|ssl"

# OU utiliser le script automatique
./watch-logs.sh
```

## Méthode 3 : Vérifier l'URL API dans l'app

Le problème est probablement que l'app utilise `http://localhost:3000` au lieu de `https://apifood.chocot.be`.

### Pour vérifier/corriger :

1. **Vérifier la configuration actuelle :**
   - Ouvrir Chrome DevTools (méthode 1)
   - Dans la console, taper : `localStorage.getItem('apiBase')` ou vérifier la config

2. **Corriger l'URL API :**
   - Modifier `frontend/nuxt.config.ts` :
     ```typescript
     apiBase: 'https://apifood.chocot.be'
     ```
   - OU créer un fichier `.env` dans `frontend/` :
     ```
     NUXT_PUBLIC_API_BASE=https://apifood.chocot.be
     ```

3. **Rebuild l'application mobile :**
   ```bash
   cd frontend
   npm run build
   npx cap sync android
   npx cap open android
   # Puis rebuild l'APK dans Android Studio
   ```

## Problèmes courants et solutions

### ❌ Erreur : "Network request failed"
**Cause :** L'app essaie de se connecter à `localhost` qui n'existe pas sur le téléphone
**Solution :** Utiliser l'URL de production `https://apifood.chocot.be`

### ❌ Erreur : "CORS policy"
**Cause :** Le backend ne permet pas l'origine de l'app mobile
**Solution :** ✅ Déjà corrigé dans `backend/src/main.ts`

### ❌ Erreur : "Connection refused" ou timeout
**Cause :** L'URL de l'API est incorrecte ou le serveur n'est pas accessible
**Solution :** Vérifier que `https://apifood.chocot.be` est accessible depuis le téléphone

## Commandes utiles

```bash
# Voir tous les logs de l'app
adb logcat | grep "12535"

# Voir uniquement les erreurs
adb logcat *:E | grep "mealplans"

# Voir les requêtes réseau (si activé)
adb logcat | grep -i "http"

# Sauvegarder les logs dans un fichier
adb logcat > logs.txt
```


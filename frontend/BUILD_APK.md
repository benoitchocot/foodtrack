# Guide pour générer l'APK Android de MealPlans

## Prérequis

1. **Java JDK 11+** installé
2. **Android Studio** installé (optionnel mais recommandé)
3. **Variables d'environnement Android** configurées (ANDROID_HOME, etc.)

## Étapes pour générer l'APK

### 1. Construire l'application Nuxt

```bash
cd frontend
npm run generate
```

### 2. Synchroniser avec Capacitor

```bash
npm run cap:sync
```

Cela copie les fichiers web générés dans le projet Android.

### 3. Générer l'APK de debug (pour tester)

```bash
cd android
./gradlew assembleDebug
```

L'APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Générer l'APK de release (pour publication)

**IMPORTANT :** Avant de générer l'APK de release, vous devez :

1. **Créer une clé de signature** (si ce n'est pas déjà fait) :
```bash
keytool -genkey -v -keystore mealplans-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mealplans
```

2. **Configurer la signature** dans `android/app/build.gradle` :
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/mealplans-release-key.jks')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'mealplans'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Générer l'APK de release** :
```bash
cd android
./gradlew assembleRelease
```

L'APK sera généré dans : `android/app/build/outputs/apk/release/app-release.apk`

### 5. Générer un AAB (Android App Bundle) pour Google Play Store

```bash
cd android
./gradlew bundleRelease
```

L'AAB sera généré dans : `android/app/build/outputs/bundle/release/app-release.aab`

## Configuration de l'API

Pour que l'application fonctionne sur mobile, vous devez configurer l'URL de l'API backend.

### Option 1 : API distante (recommandé pour production)

Définissez la variable d'environnement avant de générer :

```bash
export NUXT_PUBLIC_API_BASE=https://apifood.chocot.be
npm run generate
npm run cap:sync
```

### Option 2 : API locale (pour développement)

Dans `capacitor.config.ts`, décommentez et configurez :

```typescript
server: {
  url: 'http://VOTRE_IP_LOCALE:3000',
  cleartext: true
}
```

**Note :** Remplacez `VOTRE_IP_LOCALE` par l'IP locale de votre machine (ex: `192.168.1.100`).

## Workflow recommandé

Pour un workflow rapide, utilisez les scripts npm :

```bash
# Tout en un : build + sync
npm run cap:build

# Ouvrir Android Studio
npm run cap:open android
```

Puis dans Android Studio :
- Build > Generate Signed Bundle / APK
- Suivez l'assistant pour créer l'APK ou AAB signé

## Informations importantes

- **App ID** : `com.mealplans.app`
- **App Name** : `MealPlans`
- **Version Code** : Modifiable dans `android/app/build.gradle` (versionCode)
- **Version Name** : Modifiable dans `android/app/build.gradle` (versionName)

## Dépannage

### Erreur "SDK location not found"
Configurez `ANDROID_HOME` dans votre environnement :
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erreur de permissions
Vérifiez que les permissions nécessaires sont dans `AndroidManifest.xml`


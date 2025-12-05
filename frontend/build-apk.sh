#!/bin/bash

# Script pour construire l'APK avec la bonne configuration API
# La variable NUXT_PUBLIC_API_BASE est maintenant définie dans .env

set -e

echo "🔨 Construction de l'APK..."

# Charger les variables d'environnement depuis .env si elles existent
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Variables d'environnement chargées depuis .env"
    echo "   API Base: ${NUXT_PUBLIC_API_BASE:-http://localhost:3000}"
else
    echo "⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut"
fi

# Générer l'application
echo "📦 Génération de l'application..."
npm run generate

# Synchroniser avec Capacitor
echo "🔄 Synchronisation avec Capacitor..."
npm run cap:sync

# Construire l'APK
echo "🤖 Construction de l'APK..."
cd android
./gradlew assembleDebug

echo "🤖 Construction de l'AAB..."

./gradlew bundleRelease

echo ""
echo "✅ APK généré avec succès !"
echo "📱 Fichier: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Pour générer l'APK de release:"
echo "  cd android && ./gradlew assembleRelease"


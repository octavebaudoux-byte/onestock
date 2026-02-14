# Configuration du Scanner de Code-Barres

Le scanner de code-barres utilise l'API **Retailed.io** pour identifier les sneakers via leur code UPC/EAN.

## Obtenir votre clé API gratuite (50 crédits)

1. **Créer un compte** sur [Retailed.io](https://www.retailed.io/datasources/api/sneaker-lookup-upc)
   - Pas de carte bancaire requise
   - 50 crédits offerts à l'inscription

2. **Récupérer votre clé API**
   - Après inscription, accédez à votre dashboard
   - Copiez votre `x-api-key`

3. **Ajouter la clé dans `.env.local`**
   ```bash
   RETAILED_API_KEY=votre_cle_api_ici
   ```

4. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

## Utilisation

- Cliquez sur l'icône de scan (code-barres) dans le header
- Scannez le code UPC/EAN sur la boîte de la sneaker
- Les résultats s'affichent automatiquement
- Sélectionnez la paire pour pré-remplir le formulaire

## Limites

- **Gratuit:** 50 scans
- **Après 50 scans:** 49$/mois pour continuer

## Alternative

Si vous n'avez pas de clé API, la recherche manuelle par nom/SKU fonctionne toujours.
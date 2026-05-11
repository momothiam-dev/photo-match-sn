# Configuration du compte de service Firebase Admin

Pour que la sécurité de votre base de données soit totale, vous devez configurer les "Secrets" sur Vercel ou dans votre fichier `.env.local`.

### 1. Obtenir les clés
1. Allez dans votre [Console Firebase](https://console.firebase.google.com/).
2. Cliquez sur l'icône ⚙️ (Paramètres du projet) > **Comptes de service**.
3. Cliquez sur **Générer une nouvelle clé privée**. Un fichier JSON sera téléchargé.

### 2. Ajouter les variables d'environnement
Ouvrez le fichier JSON et copiez les valeurs correspondantes dans vos variables d'environnement (Vercel ou `.env.local`) :

- `FIREBASE_PROJECT_ID` : La valeur de `project_id`
- `FIREBASE_CLIENT_EMAIL` : La valeur de `client_email`
- `FIREBASE_PRIVATE_KEY` : La valeur de `private_key` (copiez toute la chaîne, y compris `-----BEGIN PRIVATE KEY-----`)

### 3. Appliquer les règles Firestore
Copiez le contenu du fichier `firestore.rules` (créé à la racine de votre projet) et collez-le dans l'onglet **Firestore Database** > **Rules** de votre console Firebase.

---
**Pourquoi cette étape est nécessaire ?**
Grâce à cela, votre site est verrouillé : personne ne peut modifier vos prix ou supprimer vos photos depuis son navigateur, mais votre serveur (Vercel) garde le contrôle total.

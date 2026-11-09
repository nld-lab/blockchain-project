# Vote électronique

Plateforme de vote électronique avec registre sécurisé par blockchain.

Le projet permet de créer un scrutin, de l'ouvrir, de recueillir les votes,
puis de publier les résultats. Le frontend guide l'électeur sans lui demander
de portefeuille crypto ou de connaissance technique. Le backend est l'unique
composant autorisé à signer les transactions blockchain.

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage local](#démarrage-local)
- [Utilisation](#utilisation)
- [Cycle de vie d'un scrutin](#cycle-de-vie-dun-scrutin)
- [API](#api)
- [Sécurité et confidentialité](#sécurité-et-confidentialité)
- [Structure du dépôt](#structure-du-dépôt)
- [Tests et validation](#tests-et-validation)
- [Dépannage](#dépannage)
- [Limites et prochaines étapes](#limites-et-prochaines-étapes)

## Architecture

Le dépôt est organisé en trois parties :

```text
┌─────────────────────┐       HTTP        ┌─────────────────────┐
│  frontend/          │ ────────────────> │  Backend/           │
│  React + Vite       │                   │  Express + Ethers  │
└─────────────────────┘                   └──────────┬──────────┘
                                                      │ RPC
                                                      ▼
                                           ┌─────────────────────┐
                                           │ Réseau Hardhat      │
                                           │ Voting.sol          │
                                           └─────────────────────┘
```

### Frontend

Le frontend est une application React 19 en TypeScript, construite avec Vite
et Tailwind CSS. Il contient les parcours suivants :

- accueil et présentation du scrutin ;
- vérification de l'électeur et vote ;
- confirmation avec hash de transaction ;
- résultats publiés ou masqués selon l'état du scrutin ;
- espace d'administration.

L'interface utilise une direction visuelle inspirée du bureau de vote :
papier, encre, séparateurs imprimés et couleurs de signalétique civique.

### Backend

Le backend Node.js/Express :

- expose l'API HTTP ;
- valide les entrées avec Zod ;
- normalise les identités ;
- calcule les HMAC-SHA256 ;
- relaie les appels au smart contract avec Ethers ;
- protège les routes avec Helmet, CORS et rate limiting.

### Smart contract

Le contrat `Backend/chain/contracts/Voting.sol` conserve l'état du scrutin,
les choix, les votes et les identifiants hachés des électeurs.

Le backend garde la clé privée du relayer. Elle n'est jamais envoyée au
frontend.

## Prérequis

- Node.js 22.13.0 ou supérieur ;
- npm ;
- deux terminaux pour le nœud blockchain et l'API ;
- un navigateur récent.

Le projet a été prévu pour un réseau Hardhat local. Les valeurs présentes dans
`.env.example` sont destinées au développement local uniquement.

## Installation

Depuis la racine du dépôt :

```bash
cd Backend
npm install

cd ../frontend
npm install
```

### Configuration du backend

Créez le fichier `Backend/.env` à partir de l'exemple :

```bash
cd Backend
copy .env.example .env
```

Sous macOS/Linux, utilisez :

```bash
cp .env.example .env
```

Variables principales :

| Variable | Exemple local | Rôle |
| --- | --- | --- |
| `PORT` | `3000` | Port HTTP de l'API |
| `CORS_ORIGIN` | `http://localhost:5173` | Origine autorisée du frontend |
| `HMAC_SECRET` | valeur aléatoire | Secret de hachage des identités |
| `ADMIN_API_KEY` | valeur aléatoire | Clé des routes d'administration |
| `RPC_URL` | `http://127.0.0.1:8545` | URL JSON-RPC |
| `CHAIN_ID` | `31337` | Identifiant du réseau Hardhat |
| `CONTRACT_ADDRESS` | rempli au déploiement | Adresse du contrat |
| `RELAYER_PRIVATE_KEY` | clé locale Hardhat | Clé du compte qui signe |

Pour un environnement partagé ou de production, remplacez toutes les valeurs
`change-me` et ne réutilisez pas la clé privée Hardhat.

### Configuration du frontend

Le frontend utilise par défaut `http://localhost:3000` pour l'API. Une autre
URL peut être fournie avec la variable Vite suivante :

```text
VITE_API_URL=http://localhost:3000
```

Placez cette variable dans `frontend/.env.local`. Les variables Vite sont
intégrées au bundle navigateur : n'y placez jamais de secret, de clé privée
ou de clé administrateur.

## Démarrage local

L'ordre suivant est important pour une chaîne locale neuve.

### 1. Démarrer la blockchain

Dans un premier terminal :

```bash
cd Backend
npm run chain:node
```

Laissez ce terminal ouvert. Hardhat expose normalement le RPC sur
`http://127.0.0.1:8545`.

### 2. Compiler et déployer le contrat

Dans un deuxième terminal :

```bash
cd Backend
npm run chain:compile
npm run chain:deploy
```

Le script de déploiement écrit automatiquement `CONTRACT_ADDRESS` dans
`Backend/.env`.

### 3. Démarrer l'API

Dans le même terminal ou dans un troisième :

```bash
cd Backend
npm start
```

Pour le rechargement automatique pendant le développement :

```bash
npm run dev
```

Vérification rapide :

```bash
curl http://localhost:3000/api/health
```

Réponse attendue :

```json
{ "status": "ok" }
```

### 4. Démarrer le frontend

Dans un quatrième terminal :

```bash
cd frontend
npm run dev
```

Vite affiche l'URL locale, généralement `http://localhost:5173`.

## Utilisation

### Parcours électeur

1. Ouvrir la page d'accueil.
2. Cliquer sur **Participer à un vote**.
3. Renseigner le numéro de carte et le nom complet.
4. Sélectionner une option.
5. Confirmer le vote.
6. Conserver le hash affiché sur la page de confirmation si nécessaire.

L'identité est utilisée pour empêcher le double vote. Le choix n'est pas
renvoyé par l'API de vérification d'identité.

### Consulter les résultats

La page Résultats affiche :

- le titre du scrutin ;
- son état ;
- la participation ;
- les décomptes par choix uniquement après publication officielle.

Avant `ResultsPublished`, les résultats détaillés restent masqués.

### Accéder à l'administration

Le lien Administration n'est volontairement pas affiché dans la navigation
publique. Pour ouvrir l'espace d'administration, effectuer trois clics
successifs sur le logo **VOTE** dans la barre de navigation, dans un délai
d'environ 1,2 seconde.

Cette interaction masque le lien dans l'interface, mais ne constitue pas une
authentification. La protection réelle repose sur l'en-tête `x-admin-key` et
la clé `ADMIN_API_KEY` côté backend. Pour une exposition publique, ajoutez une
authentification et une autorisation adaptées avant la mise en production.

Dans l'espace d'administration :

1. saisir la clé administrateur ;
2. créer le scrutin avec un titre et au moins deux choix ;
3. ouvrir le vote ;
4. clôturer le vote ;
5. publier les résultats.

## Cycle de vie d'un scrutin

Les transitions sont imposées par le smart contract :

```text
Draft ──ouvrir──> Open ──clôturer──> Closed ──publier──> ResultsPublished
```

| État | Électeur | Résultats détaillés | Action admin |
| --- | --- | --- | --- |
| `Draft` | ne peut pas voter | masqués | créer ou ouvrir |
| `Open` | peut voter | masqués | clôturer |
| `Closed` | ne peut plus voter | masqués | publier |
| `ResultsPublished` | scrutin terminé | visibles | aucune transition prévue |

## API

L'API est servie par défaut sur `http://localhost:3000`.

### Routes publiques

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Vérifier la disponibilité de l'API |
| `GET` | `/api/election` | Lire le scrutin et son état |
| `GET` | `/api/election/transactions` | Lire le journal public des événements |
| `POST` | `/api/voters/identify` | Vérifier le statut d'un électeur |
| `POST` | `/api/votes` | Enregistrer un vote |

Corps de la requête d'identification :

```json
{
  "idNumber": "10234567890",
  "fullName": "Koffi Ame"
}
```

Corps de la requête de vote :

```json
{
  "idNumber": "10234567890",
  "fullName": "Koffi Ame",
  "choiceId": 1
}
```

`choiceId` correspond à l'index du choix dans `election.choices`.

### Routes d'administration

Ces routes exigent l'en-tête :

```text
x-admin-key: <ADMIN_API_KEY>
```

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/admin/election` | Créer un scrutin |
| `POST` | `/api/admin/election/open` | Ouvrir le vote |
| `POST` | `/api/admin/election/close` | Clôturer le vote |
| `POST` | `/api/admin/election/publish-results` | Publier les résultats |

Exemple de création :

```json
{
  "title": "Élection du conseil",
  "choices": ["Awa", "Koffi", "Yao"]
}
```

La spécification complète se trouve dans `Backend/openapi.yaml`. Une collection
Postman et son environnement local sont également disponibles à la racine :

- `vote-electronique.postman_collection.json`
- `vote-electronique.postman_environment.json`

## Sécurité et confidentialité

### Ce qui est protégé

- les noms et numéros de carte ne sont pas écrits sur la blockchain ;
- l'identité normalisée est transformée en HMAC-SHA256 côté backend ;
- seul le hash est transmis au smart contract ;
- le contrat empêche le double vote avec `hasVoted` ;
- les transitions du scrutin sont contrôlées par le contrat ;
- les entrées HTTP sont validées ;
- Helmet ajoute des en-têtes de sécurité ;
- CORS limite l'origine autorisée ;
- le rate limiting limite les abus sur l'API ;
- les logs blockchain exposent des hashes et non les identités en clair.

### Ce qui n'est pas garanti automatiquement

La blockchain ne garantit pas à elle seule :

- l'identité réelle de la personne qui saisit un numéro de carte ;
- la disponibilité du frontend ou de l'API ;
- la confidentialité absolue si le secret HMAC est compromis ;
- la sécurité d'une clé administrateur faible ;
- la conformité légale d'un scrutin réel.

Avant une utilisation réelle, prévoyez notamment une gestion de secrets,
une authentification admin robuste, une journalisation contrôlée, des sauvegardes,
une supervision et une revue de sécurité indépendante.

Ne commitez jamais :

- `Backend/.env` ;
- une clé privée de production ;
- `ADMIN_API_KEY` ;
- `HMAC_SECRET` ;
- des données électeurs réelles.

## Structure du dépôt

```text
.
├── Backend/
│   ├── chain/contracts/Voting.sol
│   ├── scripts/deploy.js
│   ├── src/
│   │   ├── chain/
│   │   ├── lib/
│   │   ├── middleware/
│   │   └── routes/
│   ├── .env.example
│   ├── openapi.yaml
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ui/
│   │   ├── features/admin/
│   │   ├── features/election/
│   │   ├── features/home/
│   │   ├── features/layout/
│   │   ├── features/results/
│   │   └── features/voting/
│   └── package.json
├── vote-electronique.postman_collection.json
├── vote-electronique.postman_environment.json
└── README.md
```

## Tests et validation

### Backend

```bash
cd Backend
npm test
```

### Contrat

```bash
cd Backend
npm run chain:compile
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

Le frontend ne contient pas encore de suite de tests automatisés dédiée. Les
parcours critiques doivent être couverts avant une mise en production.

## Dépannage

### `La blockchain n'est pas configurée`

Vérifiez que :

1. Hardhat est démarré avec `npm run chain:node` ;
2. le contrat a été compilé et déployé ;
3. `CONTRACT_ADDRESS` est présent dans `Backend/.env` ;
4. `RPC_URL`, `CHAIN_ID` et `RELAYER_PRIVATE_KEY` correspondent au réseau.

### Le frontend ne joint pas l'API

Vérifiez :

1. que l'API écoute sur le port attendu ;
2. que `VITE_API_URL` pointe vers cette API ;
3. que `CORS_ORIGIN` correspond exactement à l'origine Vite affichée ;
4. les erreurs de la console du navigateur.

### La création du scrutin échoue après un redéploiement

Le contrat ne doit contenir qu'un scrutin dans le flux actuel. Sur une chaîne
Hardhat neuve, redémarrez le nœud puis relancez `npm run chain:deploy`.

### Le vote est refusé

Vérifiez que le scrutin est à l'état `Open`, que le `choiceId` existe et que
l'identité n'a pas déjà voté.

## Limites et prochaines étapes

- ajouter une authentification admin plus forte qu'une clé partagée ;
- protéger directement la route `/admin`, et pas seulement la navigation ;
- ajouter des tests frontend pour l'identification, le vote et la confirmation ;
- ajouter des tests d'intégration API et smart contract ;
- fournir une configuration frontend `.env.example` ;
- définir une stratégie de déploiement et de rotation des secrets ;
- ajouter observabilité, sauvegardes et gestion des erreurs de production ;
- documenter le réseau blockchain cible hors environnement Hardhat ;
- revoir le modèle de scrutin si plusieurs élections doivent coexister ;
- réaliser une revue de sécurité et de conformité avant un scrutin réel.



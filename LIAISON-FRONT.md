# Relier le front au backend

Le front est en HTML. Il appelle `http://localhost:3000`. Il doit être ouvert sur `http://localhost:5500`, sinon le navigateur bloque les requêtes. Copie `liaison-front.js` à côté des pages et charge-le avec `<script src="liaison-front.js"></script>`.

Pas de portefeuille, pas de hash à calculer. Le numéro de carte et le nom partent dans le JSON. La clé blockchain reste dans le backend.

## Ce que chaque page appelle

**Accueil.** `VoteApi.getElection()`.

- `{ "exists": false }` : aucun scrutin.
- `state: "Draft"` : créé, pas encore ouvert.
- `state: "Open"` : on peut voter. Rediriger vers la page de vote.
- `state: "Closed"` : vote terminé, résultats pas encore publics.
- `state: "ResultsPublished"` : afficher le graphique.

**Vote.** D'abord `VoteApi.identify(numero, nom)`. La réponse est `{ "registered": false, "hasVoted": false }` ou `hasVoted: true`. Si `hasVoted` est vrai, ne pas montrer les candidats.

Ensuite `VoteApi.vote(numero, nom, choiceId)`. `choiceId` est la position dans `election.choices` : `0` pour le premier nom, `1` pour le deuxième. Un second vote répond avec l'erreur `ALREADY_VOTED`.

**Résultats.** `VoteApi.getElection()` pour les chiffres, `VoteApi.transactions()` pour le journal, `VoteApi.identify(numero, nom)` pour le statut d'une personne.

`tallies` n'existe que lorsque `state` vaut `"ResultsPublished"` :

```json
{
  "exists": true,
  "title": "Election test",
  "state": "ResultsPublished",
  "choices": ["Awa", "Koffi", "Yao", "Ama", "Esi"],
  "turnout": 1,
  "tallies": [{ "choiceId": 1, "label": "Koffi", "votes": 1 }]
}
```

Avant la publication, la même route renvoie `turnout` et `choices`, sans `tallies`. Le graphique attend la publication.

Le journal ressemble à ceci. `voterHash` n'est pas un nom :

```json
{
  "transactions": [
    { "type": "VoteCast", "txHash": "0xabc...", "blockNumber": 4, "voterHash": "0xdef..." }
  ]
}
```

Les types possibles : `ElectionCreated`, `ElectionOpened`, `ElectionClosed`, `ResultsPublished`, `VoterRegistered`, `VoteCast`.

**Admin.** La clé est tapée dans le champ admin, puis passée aux fonctions. Elle ne va pas dans la page électeur.

- `VoteApi.createElection(cle, "Titre", ["Awa", "Koffi", "Yao", "Ama", "Esi"])`
- `VoteApi.openElection(cle)` pour publier le scrutin et autoriser le vote
- `VoteApi.closeElection(cle)`
- `VoteApi.publishResults(cle)` pour afficher les voix

## Erreurs

Toute erreur arrive ainsi : `{ "error": "CODE", "message": "..." }`. Dans `liaison-front.js`, lis `error.code` et `error.message`.

| Code | Moment |
|---|---|
| `ALREADY_VOTED` | La personne a déjà voté |
| `ELECTION_NOT_OPEN` | Le vote n'est pas ouvert |
| `INVALID_CHOICE` | `choiceId` hors de la liste |
| `VALIDATION` | Champ vide |
| `UNAUTHORIZED` | Mauvaise clé admin |
| `INVALID_STATE` | Action admin dans le mauvais ordre |
| `RATE_LIMIT` | Trop d'essais sur identifier ou voter |

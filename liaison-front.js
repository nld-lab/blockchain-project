// Colle ce fichier dans le front et charge-le avant tes pages :
// <script src="liaison-front.js"></script>
//
// Le site doit être ouvert sur http://localhost:5500
// L'API tourne sur http://localhost:3000
// Pas de MetaMask. Le numéro et le nom partent en JSON, le backend calcule le hash.

const VoteApi = (() => {
  const baseUrl = "http://localhost:3000";

  async function request(path, { method = "GET", body, adminKey } = {}) {
    const headers = {};
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || "Erreur API");
      error.status = response.status;
      error.code = data.error || "HTTP_ERROR";
      error.details = data.details;
      throw error;
    }
    return data;
  }

  return {
    // Accueil et page de vote : titre, état, choix. Pas de tallies tant que les résultats ne sont pas publiés.
    getElection() {
      return request("/api/election");
    },

    // Bouton « Valider » : ne vote pas. Réponse { registered, hasVoted }.
    identify(idNumber, fullName) {
      return request("/api/voters/identify", {
        method: "POST",
        body: { idNumber, fullName },
      });
    },

    // Bouton « Voter ». choiceId = index dans election.choices (0 = premier candidat).
    vote(idNumber, fullName, choiceId) {
      return request("/api/votes", {
        method: "POST",
        body: { idNumber, fullName, choiceId },
      });
    },

    // Page résultats : journal. voterHash est un hash, jamais le nom ni le numéro.
    transactions() {
      return request("/api/election/transactions");
    },

    // Écran admin. La clé est saisie par l'admin, elle n'est pas écrite dans la page électeur.
    createElection(adminKey, title, choices) {
      return request("/api/admin/election", {
        method: "POST",
        adminKey,
        body: { title, choices },
      });
    },
    openElection(adminKey) {
      return request("/api/admin/election/open", { method: "POST", adminKey });
    },
    closeElection(adminKey) {
      return request("/api/admin/election/close", { method: "POST", adminKey });
    },
    publishResults(adminKey) {
      return request("/api/admin/election/publish-results", { method: "POST", adminKey });
    },
  };
})();

// Page de vote
// const election = await VoteApi.getElection();
// if (!election.exists || election.state !== "Open") { /* masquer le formulaire */ }
// election.choices.forEach((label, choiceId) => { /* bouton qui appelle voter(choiceId) */ });
//
// async function valider(idNumber, fullName) {
//   const status = await VoteApi.identify(idNumber, fullName);
//   if (status.hasVoted) { /* « déjà voté », ne pas afficher les candidats */ }
// }
//
// async function voter(idNumber, fullName, choiceId) {
//   try {
//     await VoteApi.vote(idNumber, fullName, choiceId);
//   } catch (error) {
//     if (error.code === "ALREADY_VOTED") { /* message déjà voté */ }
//     if (error.code === "ELECTION_NOT_OPEN") { /* scrutin fermé */ }
//   }
// }

// Page résultats
// const election = await VoteApi.getElection();
// if (election.state === "ResultsPublished") {
//   election.tallies.forEach((item) => { /* item.label, item.votes pour le graphique */ });
// }
// const journal = await VoteApi.transactions();
// journal.transactions.forEach((entry) => { /* entry.type, entry.txHash, entry.voterHash */ });

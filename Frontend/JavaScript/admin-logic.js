const db = window.supabaseClient;

/* =========================
VERIFICATION SESSION
========================= */
async function verifierSession() {
  const { data: { session }, error } = await db.auth.getSession();
  if (error) console.error("Erreur getSession :", error);
  if (!session) {
    window.location.href = "login.html";
    return;
  }
}

/* =========================
CHARGER REQUETES
========================= */
let compteurNouvellesRequetes = 0;
const badge = document.getElementById("badge-requetes");

// --- Fonction pour charger le tableau ---
async function chargerRequetes() {
  const { data, error } = await db
    .from('requete')
    .select(`
      *,
      compte (
        utilisateur (
          pseudo_user
        )
      )
    `)
    .order('date_rqt', { ascending: false });

  if (error) {
    console.error("Erreur chargement requêtes", error);
    return;
  }

  const table = document.getElementById("corpsTableau");
  table.innerHTML = "";

  data.forEach(req => {
    const ligne = document.createElement("tr");

    let statusClass = "";
    switch(req.status){
      case "pending": statusClass = "en-attente"; break;
      case "processing": statusClass = "en-cours"; break;
      case "done": statusClass = "termine"; break;
    }

    ligne.innerHTML = `
      <td data-label="Utilisateur" class="user-cell">
        ${req.compte?.utilisateur?.pseudo_user ?? "Utilisateur"}
      </td>

      <td data-label="Nom">${req.nom_rqt}</td>

      <td data-label="Description">${req.lib_rqt}</td>

      <td data-label="Statut">
        <select class="status-select ${statusClass}" data-id="${req.num_rqt}">
          <option value="pending" ${req.status==="pending"?"selected":""}>En attente</option>
          <option value="processing" ${req.status==="processing"?"selected":""}>En cours</option>
          <option value="done" ${req.status==="done"?"selected":""}>Terminé</option>
        </select>
      </td>

      <td data-label="Progression">
        <div class="progress-bar">
          <div class="progress-fill" style="width:${req.progress || 0}%">${req.progress || 0}%</div>
        </div>
      </td>

      <td data-label="Date">${new Date(req.date_rqt).toLocaleString()}</td>

      <td data-label="Action">
        ${req.status === "done"
          ? `<button class="delete-btn" data-id="${req.num_rqt}">🗑 Supprimer</button>`
          : ""
        }
      </td>
    `;

    // --- Changement de statut ---
    const select = ligne.querySelector(".status-select");
    select.addEventListener("change", async (e) => {
      const num_rqt = e.target.dataset.id;
      const status = e.target.value;
      let progress = status === "pending" ? 10 : status === "processing" ? 50 : 100;

      const { error } = await db
        .from("requete")
        .update({ status, progress })
        .eq("num_rqt", num_rqt);

      if(error){
        console.error("Erreur mise à jour :", error);
        alert("Erreur mise à jour");
        return;
      }

      chargerRequetes();
    });

    // --- Supprimer une requête ---
    const deleteBtn = ligne.querySelector(".delete-btn");
    if(deleteBtn){
      deleteBtn.addEventListener("click", async () => {
        const num_rqt = deleteBtn.dataset.id;
        if(!confirm("Supprimer cette requête ?")) return;

        const { error } = await db
          .from("requete")
          .delete()
          .eq("num_rqt", num_rqt);

        if(error){
          console.error("Erreur suppression :", error);
          alert("Erreur suppression");
          return;
        }

        chargerRequetes();
      });
    }

    table.appendChild(ligne);
  });
}

  // --- Réinitialiser le badge quand le tableau est chargé ---
  compteurNouvellesRequetes = 0;
  badge.textContent = "0";

// --- Notifications temps réel pour nouvelles requêtes ---
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

db
.channel('nouvelle-requete')
.on(
'postgres_changes',
{
  event: 'INSERT',
  schema: 'public',
  table: 'requete'
},
(payload) => {

  console.log("Nouvelle requête :", payload.new);

  // Notification système
  if (Notification.permission === "granted") {
    new Notification("Nouvelle requête reçue", {
      body: payload.new.nom_rqt
    });
  }

  // Incrément badge
  compteurNouvellesRequetes++;
  badge.textContent = compteurNouvellesRequetes;

  // Recharge tableau
  chargerRequetes();
})
.subscribe();

// --- Charger le tableau au démarrage ---
document.addEventListener("DOMContentLoaded", chargerRequetes);
/* =========================
CHANGER STATUT
========================= */
async function changerStatut(num_rqt, statut){

let progress = 0;

if(statut === "En cours"){
progress = 40;
}

if(statut === "Terminé" || statut === "Effectué"){
progress = 100;
}

const { error } = await supabaseClient
.from("requete")
.update({
status: statut,
progress: progress
})
.eq("num_rqt", num_rqt);

if(error){
console.error(error);
alert("Erreur modification statut");
}

chargerRequetes();
} 

/* =========================
CHARGER UTILISATEURS
========================= */
async function chargerUtilisateurs() {
  const { data, error } = await db
    .from("utilisateur")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur chargement membres", error);
    return;
  }

  // Mettre ROOT en première position
  data.sort((a, b) => (b.role_user === "ROOT") ? 1 : -1);

  const table = document.getElementById("listeInscrits");
  table.innerHTML = "";

  data.forEach(user => {
    let pseudo = user.pseudo_user;
    let rootBadge = "";

    if (user.role_user === "ROOT") {
      pseudo = `${pseudo}`;
      rootBadge = '<span class="root-badge">ROOT</span>';
    }

    const ligne = document.createElement("tr");
ligne.innerHTML = `
  <td class="${user.role_user==="ROOT"?"root-user":""}" data-label="Pseudo">
    ${pseudo} ${rootBadge}
  </td>
  <td data-label="Rôle">${user.role_user}</td>
  <td data-label="Date inscription">${new Date(user.created_at).toLocaleDateString()}</td>
  <td data-label="Action">
    ${
      user.role_user === "ROOT"
        ? "🔒 Protégé"
        : `<button class="btn-supprimer" onclick="supprimerUtilisateur(${user.mat_user}, '${user.pseudo_user}')">
             Supprimer
           </button>`
    }
  </td>
`;

    table.appendChild(ligne);
  });
}

/* =========================
SUPPRIMER UTILISATEUR
========================= */
async function supprimerUtilisateur(matUser, pseudo) {
  if(!confirm(`Supprimer ${pseudo} ?`)) return;

  const { data, error } = await db
    .from("utilisateur")
    .select("role_user")
    .eq("mat_user", matUser)
    .single();
if(error) {
    console.error("Erreur suppression utilisateur :", error);
    return;
  }

  if(data.role_user === "ROOT") {
    alert("Impossible de supprimer le ROOT");
    return;
  }

  await db.from("utilisateur")
    .delete()
    .eq("mat_user", matUser);

  chargerUtilisateurs();
}

/* =========================
STATS
========================= */
async function updateStats() {

  const { data: users } = await db.from("utilisateur").select("role_user");
  const totalUsers = users?.length || 0;

  document.getElementById("total-users").textContent = totalUsers;


  const { data: reqs } = await db.from("requete").select("status");
  const totalRequests = reqs?.length || 0;

  document.getElementById("total-requests").textContent = totalRequests;


  const inProgress = reqs?.filter(r => r.status === "processing").length || 0;
  const done = reqs?.filter(r => r.status === "done").length || 0;

  document.getElementById("requests-in-progress").textContent = inProgress;
  document.getElementById("requests-done").textContent = done;


  // CREATION DU GRAPHIQUE
  createChart(totalUsers, totalRequests, inProgress, done);
}

async function initPage() {
  // Attendre que supabaseClient existe
  let db = window.supabaseClient;
  if (!db) {
    console.log("En attente du client Supabase...");
    let start = Date.now();
    while(!window.supabaseClient && Date.now() - start < 3000) {
      await new Promise(r => setTimeout(r, 50));
    }
    db = window.supabaseClient;
    if (!db) return console.error("Supabase jamais initialisé !");
  }

  // Vérifier la session
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    console.log("Aucune session active → redirection vers login");
    window.location.href = "login.html";
    return;
  }

  // Charger les données
  chargerRequetes();
  chargerUtilisateurs();
}

async function updateProgress(num_rqt, value) {

  const { error } = await supabaseClient
    .from('requete')
    .update({ progress: value })
    .eq('num_rqt', num_rqt);

  if (error) {
    console.error(error);
    alert("Erreur mise à jour progression");
  }

  chargerRequetes(); // recharge le dashboard
}

async function verifierSession() {
  if (!window.supabaseClient) return;

  const { data } = await window.supabaseClient.auth.getSession();
  const sessionActive = data?.session;

  if (!sessionActive) {
    // Pas de session -> redirection forcée vers l'accueil
    window.location.replace("../../index.html"); // ou "index.html" selon l'emplacement
  }
}

document.addEventListener("DOMContentLoaded", verifierSession);

async function chargerNotificationsRequetes() {

  const badge = document.getElementById("badge-requetes");
  if(!badge) return;

  try {

    // récupérer session utilisateur
    const { data } = await window.supabaseClient.auth.getSession();
    const session = data?.session;

    if(!session){
      badge.style.display = "none";
      return;
    }

    const userId = session.user.id;

    // récupérer les requêtes de l'utilisateur
    const { data: requetes, error } = await window.supabaseClient
      .from("requete")
      .select("status")
      .eq("mat_user", userId);

    if(error){
      console.error("Erreur récupération notifications :", error);
      return;
    }

    // compter les requêtes en attente ou en cours
    const notifications = requetes.filter(r =>
      r.status === "pending" || r.status === "processing"
    ).length;

    // mettre à jour le badge
    badge.innerText = notifications;

    if(notifications > 0){
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }

  } catch(err){
    console.error("Erreur notifications :", err);
  }

}
function createChart(users, requests, progress, done){

const ctx = document.getElementById("statsChart");

new Chart(ctx,{
  type:"bar",
  data:{
    labels:["Utilisateurs","Requêtes","En cours","Terminées"],
    datasets:[{
      label:"Statistiques plateforme",
      data:[users, requests, progress, done],
      borderWidth:1
    }]
  },
  options:{
    responsive:true
  }
});

}



document.getElementById("searchUser").addEventListener("keyup", function() {

let filtre = this.value.toLowerCase();
let lignes = document.querySelectorAll("tbody tr");

lignes.forEach(tr => {

let texte = tr.innerText.toLowerCase();

tr.style.display = texte.includes(filtre) ? "" : "none";

});

});
const toggleBtn = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");

toggleBtn.onclick = () =>{
  sidebar.classList.toggle("active");
};

// Incrément badge
compteurNouvellesRequetes++;
badge.textContent = compteurNouvellesRequetes;

// Ajouter la classe pulse pour l’animation
badge.classList.add('pulse');

compteurNouvellesRequetes = 0;
badge.textContent = "0";
badge.classList.remove('pulse'); // stop animation


// Démarrer l'initialisation après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", initPage);
/* =========================
INITIALISATION
========================= */
verifierSession();
chargerRequetes();
chargerUtilisateurs();
updateStats();
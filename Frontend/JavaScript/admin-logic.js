const db = window.supabaseClient;

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
      let progress = status === "pending" ? 0 : status === "processing" ? 40 : 100;

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

  // --- Réinitialiser le badge quand le tableau est chargé ---
  compteurNouvellesRequetes = 0;
  badge.textContent = "0";
}

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
    }
  )
  .subscribe();

// --- Charger le tableau au démarrage ---
document.addEventListener("DOMContentLoaded", chargerRequetes);

/* =========================
CHANGER STATUT (utilisé ailleurs)
========================= */
async function changerStatut(num_rqt, statut){
  let progress = 0;

  if(statut === "En cours"){
    progress = 40;
  }

  if(statut === "Terminé" || statut === "Effectué"){
    progress = 100;
  }

  const { error } = await db
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
========================= */async function chargerUtilisateurs() {
  const { data, error } = await db
    .from("utilisateur")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur chargement membres", error);
    return;
  }

  // Mettre ROOT en première position
  data.sort((a, b) => {
    if (a.role_user === "ROOT") return -1;
    if (b.role_user === "ROOT") return 1;
    return 0;
  });

  const table = document.getElementById("listeInscrits");
  table.innerHTML = "";

  data.forEach(user => {
    let pseudo = user.pseudo_user;
    let rootBadge = "";

    if (user.role_user === "ROOT") {
      rootBadge = '<span class="root-badge">ROOT</span>';
    }

    const ligne = document.createElement("tr");

    // Création des cellules
    const tdPseudo = document.createElement("td");
    tdPseudo.className = user.role_user === "ROOT" ? "root-user" : "";
    tdPseudo.dataset.label = "Pseudo";
    tdPseudo.innerHTML = `${pseudo} ${rootBadge}`;

    const tdRole = document.createElement("td");
    tdRole.dataset.label = "Rôle";
    tdRole.textContent = user.role_user;

    const tdDate = document.createElement("td");
    tdDate.dataset.label = "Date inscription";
    tdDate.textContent = new Date(user.created_at).toLocaleDateString();

    const tdAction = document.createElement("td");
    tdAction.dataset.label = "Action";

    if (user.role_user === "ROOT") {
      tdAction.textContent = "🔒 Protégé";
    } else {
      const btnSupprimer = document.createElement("button");
      btnSupprimer.className = "btn-supprimer";
      btnSupprimer.textContent = "Supprimer";
      // Ajout de l'événement click proprement
      btnSupprimer.addEventListener("click", () => {
        supprimerUtilisateur(user.mat_user, user.pseudo_user);
      });
      tdAction.appendChild(btnSupprimer);
    }

    // Ajout des cellules à la ligne
    ligne.appendChild(tdPseudo);
    ligne.appendChild(tdRole);
    ligne.appendChild(tdDate);
    ligne.appendChild(tdAction);

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
  if (!badge) return;

  try {

    const { data } = await window.supabaseClient.auth.getSession();
    const session = data?.session;

    if (!session) {
      badge.style.display = "none";
      return;
    }

    const authId = session.user.id;

    // 🔥 1. récupérer mat_user via auth_id
    const { data: userData, error: userError } = await db
      .from("utilisateur")
      .select("mat_user")
      .eq("auth_id", authId)
      .single();

    if (userError || !userData) {
      console.error("Erreur user :", userError);
      return;
    }

    // 🔥 2. récupérer num_cpt
    const { data: compteData, error: compteError } = await db
      .from("compte")
      .select("num_cpt")
      .eq("mat_user", userData.mat_user)
      .single();

    if (compteError || !compteData) {
      console.error("Erreur compte :", compteError);
      return;
    }

    const numCpt = compteData.num_cpt;

    // 🔥 3. récupérer requêtes
    const { data: requetes, error } = await db
      .from("requete")
      .select("status")
      .eq("num_cpt", numCpt);

    if (error) {
      console.error("Erreur récupération notifications :", error);
      return;
    }

    const notifications = requetes.filter(r =>
      r.status === "pending" || r.status === "processing"
    ).length;

    badge.innerText = notifications;
    badge.style.display = notifications > 0 ? "inline-block" : "none";

  } catch (err) {
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
// --- Import Supabase ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- Config Supabase ---
const SUPABASE_URL = "https://ccsrxvwaxkdbphesyies.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_SqgQjncAuFW7c5buXtpdsw_oWUuez1z"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- Déconnexion ---
const safeGet = id => document.getElementById(id) || null

async function deconnexion() {
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.warn('Erreur signOut:', err)
  }
  localStorage.removeItem('userData')
  localStorage.removeItem('monToken')
  window.location.href = '../../index.html'
  alert("Au revoir Maitre SPIRIT🖤❄️🙇‍♂️")
}

const btn = safeGet('btnDeconnexion')
if (btn) btn.addEventListener('click', deconnexion)

// --- Upload Outil ---
const uploadForm = document.getElementById("uploadOutilForm")
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const nom = document.getElementById("nom").value
    const categorie = document.getElementById("categorie").value
    const type = document.getElementById("type").value
    const description = document.getElementById("description").value
    const prix = document.getElementById("prix").value || 0
    const file = document.getElementById("file").files[0]

    if (!file) return alert("Sélectionnez un fichier.")

    const filePath = `${categorie}/${Date.now()}_${file.name}`
    const progressContainer = document.getElementById("progressContainer")
    const progressFill = document.getElementById("progressFill")
    progressContainer.style.display = "block"
    progressFill.style.width = "0%"
    progressFill.innerText = "0%"

    // Upload fichier
    const { data, error } = await supabase.storage
      .from('outils')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onProgress: (progress) => {
          const percent = Math.round(progress * 100)
          progressFill.style.width = percent + '%'
          progressFill.innerText = percent + '%'
        }
      })

    if (error) {
      alert("Erreur upload : " + error.message)
      progressContainer.style.display = "none"
      return
    }

    // URL publique
    const { data: publicData } = supabase.storage.from("outils").getPublicUrl(filePath)
    const url = publicData.publicUrl

    // Enregistrement en DB
    const { error: dbError } = await supabase.from("outils").insert([{
      nom_outil: nom,
      categorie: categorie,
      type_outil: type,
      description: description,
      fichier_url: url,
      prix: prix
    }])

    if (dbError) {
      alert("Erreur en base : " + dbError.message)
      progressContainer.style.display = "none"
      return
    }

    alert("Upload réussi 🚀")
    progressContainer.style.display = "none"
    uploadForm.reset()
  })
}

// --- Notifications Admin ---
const clientSelect = document.getElementById("select-client")
const messageInput = document.getElementById("notif-message")
const fileInput = document.getElementById("notif-file")
const sendBtn = document.getElementById("send-notif-btn")
const logDiv = document.getElementById("notif-log")

async function loadClients() {
  const { data, error } = await supabase
    .from("utilisateur")
    .select("mat_user, pseudo_user, mail_user")

  if (error) return console.error(error)

  data.forEach(client => {
    const opt = document.createElement("option")
    opt.value = client.mat_user
    opt.textContent = `${client.pseudo_user} (${client.mail_user})`
    clientSelect.appendChild(opt)
  })
}
if (clientSelect) loadClients()

if (sendBtn) {
  sendBtn.addEventListener("click", async () => {

    const clientId = clientSelect.value
    const message = messageInput.value
    const file = fileInput.files[0]

    if (!clientId || (!message && !file)) {
      return alert("Écrire un message ou sélectionner un fichier.")
    }

    let fileUrl = null
    if (file) {
      const { data, error } = await supabase.storage
        .from('messages-files')
        .upload(`${Date.now()}-${file.name}`, file)

      if (error) {
        console.error(error)
      } else {
        fileUrl = `https://ccsrxvwaxkdbphesyies.supabase.co/storage/v1/object/public/messages-files/${data.path}`
      }
    }

    const { error: insertError } = await supabase
  .from("messages")
  .insert({
    contenu: "test",
    user_id: 1
  });

    if (insertError) return console.error(insertError)

    logDiv.innerHTML += `<div>Envoyé à ${clientSelect.selectedOptions[0].text}: ${message || file.name}</div>`

    messageInput.value = ""
    fileInput.value = ""
  })
}

// Incrément badge
compteurNouvellesRequetes++;
badge.textContent = compteurNouvellesRequetes;

// Ajouter la classe pulse pour l’animation
badge.classList.add('pulse');

compteurNouvellesRequetes = 0;
badge.textContent = "0";
badge.classList.remove('pulse'); // stop animation


// Démarrer l'initialisation après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", () => {
  verifierSession();
  chargerRequetes();
  chargerUtilisateurs();
  updateStats();
  chargerNotificationsRequetes();
  initPage();
});
/* =========================
INITIALISATION
========================= */


/* ============================
   CONFIGURATION SUPABASE
============================ */


// Renommer la variable client pour éviter toute ambiguïté

/* ============================
       UTILITAIRES
============================ */
const safeGet = id => document.getElementById(id) || null;
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ============================
       VARIABLES
============================ */
let cachedUser = null;
window.__lastRequestForPdf = null;

/* ============================
   PROFIL & SESSION
============================ */
// =============================
// Variables globales
// =============================


// fonction sécurisée pour récupérer un élément

// =============================
// Charger le profil utilisateur
// =============================
// ------------------------------
// Client-logic.js
// ------------------------------

// ------------------------------
// Charger le profil utilisateur
// ------------------------------
async function chargerProfil() {
  try {
    // --- Récupérer session Supabase ---
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const session = sessionData?.session ?? null;

    let cachedUser = null;

    if (session?.user) {
      const u = session.user;
      cachedUser = {
        id: u.id,
        username: u.user_metadata?.display_name || u.email,
        email: u.email,
        nom: u.user_metadata?.nom || "",
        prenom: u.user_metadata?.prenom || "",
        telephone: u.user_metadata?.telephone || ""
      };
    } else {
      // fallback localStorage
      const stored = JSON.parse(localStorage.getItem("userData") || "null");
      if (stored) cachedUser = stored;
    }

    if (!cachedUser) {
      window.location.href = "login.html";
      return;
    }

    // sauvegarde locale
    localStorage.setItem("userData", JSON.stringify(cachedUser));

    // --- Afficher les infos utilisateur ---
    safeGet("display-pseudo") && (safeGet("display-pseudo").innerText = cachedUser.username || "—");
    safeGet("display-nom") && (safeGet("display-nom").innerText = cachedUser.nom || "—");
    safeGet("display-prenom") && (safeGet("display-prenom").innerText = cachedUser.prenom || "—");
    safeGet("display-tel") && (safeGet("display-tel").innerText = cachedUser.telephone || "—");

    // --- Récupérer l'utilisateur dans la table 'utilisateur' ---
   const { data: utilisateur, error: userErr } = await supabaseClient
  .from("utilisateur")
  .select("mat_user, pseudo_user, nom_user, prenom_user, num_user")
  .eq("mail_user", cachedUser.email)
  .maybeSingle();

if (userErr || !utilisateur) {
  console.error("Erreur récupération utilisateur :", userErr);
  safeGet("display-statut") && (safeGet("display-statut").innerText = "Utilisateur introuvable");
  return;
}
    // --- Récupérer le compte lié ---
    const { data: compte, error: compteErr } = await supabaseClient
      .from("compte")
      .select("num_cpt, status")
      .eq("mat_user", utilisateur.mat_user)
      .maybeSingle();

    if (compteErr || !compte) {
      console.error("Erreur récupération compte :", compteErr);
      safeGet("display-statut") && (safeGet("display-statut").innerText = "Aucun compte trouvé");
      return;
    }

    // --- Récupérer la dernière requête ---
    const { data: lastRequest, error: reqError } = await supabaseClient
      .from("requete")
      .select("num_rqt, nom_rqt, lib_rqt, date_rqt, num_cpt, status, progress")
      .eq("num_cpt", compte.num_cpt) // <-- corrigé ici !
      .order("date_rqt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reqError) {
      console.error("Erreur récupération requêtes :", reqError);
      safeGet("display-statut") && (safeGet("display-statut").innerText = "Impossible de récupérer le statut");
      return;
    }

    if (lastRequest) {
      // Définir le progress automatiquement selon le status
      let progress = 0;
      if (lastRequest.status === "pending") progress = 0;
      else if (lastRequest.status === "processing") progress = 40;
      else if (lastRequest.status === "done") progress = 100;

      // Mettre à jour le progress
      lastRequest.progress = progress;
cachedUser.username = utilisateur.pseudo_user;
cachedUser.nom = utilisateur.nom_user;
cachedUser.prenom = utilisateur.prenom_user;
cachedUser.telephone = utilisateur.num_user;

      // Affichage
      safeGet("display-pseudo") && (safeGet("display-pseudo").innerText = utilisateur.pseudo_user || "—");
safeGet("display-nom") && (safeGet("display-nom").innerText = utilisateur.nom_user || "—");
safeGet("display-prenom") && (safeGet("display-prenom").innerText = utilisateur.prenom_user || "—");
safeGet("display-tel") && (safeGet("display-tel").innerText = utilisateur.num_user || "—");
      safeGet("display-statut") && (safeGet("display-statut").innerText = lastRequest.status);
      safeGet("display-progress") && (safeGet("display-progress").style.width = `${progress}%`);
      safeGet("display-progress-text") && (safeGet("display-progress-text").innerText = `${progress}%`);

      window.__lastRequestForPdf = lastRequest;
    } else {
      safeGet("display-statut") && (safeGet("display-statut").innerText = "Aucune requête trouvée");
      safeGet("display-progress") && (safeGet("display-progress").style.width = `0%`);
      safeGet("display-progress-text") && (safeGet("display-progress-text").innerText = `0%`);
      window.__lastRequestForPdf = null;
    }
  } catch (err) {
    console.error("Erreur dans chargerProfil :", err);
  }
}

// ------------------------------
// Initialisation au chargement
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  chargerProfil();
});


/* ============================
          GENERER PDF
============================ */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- Initialisation Supabase ---
const supabase = createClient(
  "https://ccsrxvwaxkdbphesyies.supabase.co",
  "sb_publishable_SqgQjncAuFW7c5buXtpdsw_oWUuez1z"
);

// --- Fonction pour générer le PDF avec infos Supabase ---
async function genererPDF() {
  try {
    // --- Récupérer l'utilisateur connecté ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Utilisateur non connecté");

    // --- Infos utilisateur ---
    const { data: userData } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('mail_user', user.email)
      .maybeSingle();

    if (!userData) return alert("Impossible de récupérer vos informations");

    // --- Compte lié ---
    const { data: compteData } = await supabase
      .from('compte')
      .select('num_cpt')
      .eq('mat_user', userData.mat_user)
      .maybeSingle();

    if (!compteData) return alert("Impossible de récupérer votre compte");

    // --- Dernière requête ---
    const { data: lastRequest } = await supabase
      .from('requete')
      .select('*')
      .eq('num_cpt', compteData.num_cpt)
      .order('date_rqt', { ascending: false })
      .limit(1)
      .maybeSingle();

    const req = lastRequest
      ? {
          service: lastRequest.nom_rqt,
          status: lastRequest.status,
          details: lastRequest.lib_rqt,
          date: lastRequest.date_rqt
        }
      : { service: 'N/A', status: 'En attente', details: '', date: '' };

    // --- Génération PDF ---
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const bleuTech = [0,102,204];
    const grisFonce = [30,30,30];
    const jaune = [255,193,7];
    const vert = [40,167,69];

    // Bandeau supérieur
    doc.setFillColor(...grisFonce);
    doc.rect(0,0,210,40,'F');
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(24);
    doc.text("SPIRIT'S LINE", 20, 20);
    doc.setFontSize(10);
    doc.text("Vos services informatiques de qualité", 20, 30);

    // Bloc infos client
    doc.setTextColor(...grisFonce);
    doc.setFontSize(14);
    doc.setFont("helvetica","bold");
    doc.text("Détails du reçu", 20, 55);
    doc.setDrawColor(...bleuTech);
    doc.setLineWidth(0.5);
    doc.line(20,57,60,57);

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);
    doc.text(`Client : ${String(userData.pseudo_user || '').toUpperCase()}`, 20, 70);
    doc.text(`ID Client : #SPL-${String(userData.mat_user || '').toString().substring(0,3).toUpperCase()}`, 20, 78);
    doc.text(`Nom : ${userData.nom_user || '—'}`, 20, 86);
    doc.text(`Prénom : ${userData.prenom_user || '—'}`, 20, 94);
    doc.text(`Téléphone : ${userData.num_user || '—'}`, 20, 102);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 110);

    // Tableau service / statut
    doc.setFillColor(...bleuTech);
    doc.rect(20,125,170,12,'F');
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.text("Service", 25, 133);
    doc.text("État du traitement", 130, 133);

    doc.setTextColor(...grisFonce);
    doc.setFont("helvetica","normal");
    doc.setDrawColor(220,220,220);
    doc.rect(20,137,170,30);
    doc.text(`Service : ${req.service}`, 25, 150);
    doc.setFontSize(10);
    doc.text(`Détails : ${req.details}`, 25, 158);

    // Couleur du statut
    const statutActuel = (req.status || '').toLowerCase();
    if (statutActuel.includes("term")) doc.setTextColor(...vert);
    else if (statutActuel.includes("cours")) doc.setTextColor(...bleuTech);
    else doc.setTextColor(...jaune);

    doc.setFont("helvetica","bold");
    doc.setFontSize(12);
    doc.text(req.status ? req.status.toUpperCase() : "EN ATTENTE", 135, 150);

    // Pied de page
    doc.setFillColor(245,245,245);
    doc.rect(0,280,210,20,'F');
    doc.setTextColor(100);
    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.text("SPIRIT'S LINE - Support technique : support@spirit-s-line.netlify.app",105,292,{align:"center"});

    doc.save(`Recu_SPL_${String(userData.pseudo_user||'client')}.pdf`);

  } catch(err) {
    console.error("Erreur PDF:", err);
    alert("Une erreur est survenue lors de la création du document.");
  }
}
// --- Event listener pour le bouton ---
const pdfBtn = document.getElementById("download-pdf-btn");
if(pdfBtn){
  pdfBtn.addEventListener("click", genererPDF);
}

/* ============================
           LOGOUT
============================ */
async function logout() {
  try { await supabaseClient.auth.signOut(); }
  catch (err) { console.warn('Erreur signOut :', err); }
  localStorage.removeItem('monToken');
  localStorage.removeItem('userData');
  window.location.href = 'HTML/login.html';
}

/* ============================
       STATUT DETAILLE (OPTIONNEL)
============================ */
async function voirMonStatut() {
  try {
    const stored = JSON.parse(localStorage.getItem('userData') || 'null');
    if (!stored) return;
    const username = stored.username;

    const { data: requetes, error } = await supabaseClient
      .from('requests')
      .select('id, service, status, created_at')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur voirMonStatut:', error);
      return;
    }

    const zone = safeGet('display-status');
    if (!zone) return;

    if (!requetes || requetes.length === 0) {
      zone.innerHTML = 'Aucune requête trouvée';
      return;
    }

    zone.innerHTML = requetes.map(r => `
      <div class="statut-card">
        <p>Service : ${escapeHtml(r.service || '—')}</p>
        <p>Statut actuel : <strong>${escapeHtml(r.status || '—')}</strong></p>
        <div class="barre-progression ${escapeHtml((r.status || '').replace(/\s+/g, '-'))}"></div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Erreur voirMonStatut:', err);
  }
}

const bubble = document.getElementById("chat-bubble");
const box = document.getElementById("chat-box");
const input = document.getElementById("chat-input");
const content = document.getElementById("chat-content");
const badge = document.getElementById("notif-badge");
const sound = document.getElementById("notif-sound");
const fileInput = document.getElementById("chat-file");

let unread = 0;

// Toggle chat box
bubble.addEventListener("click", () => {
  box.classList.toggle("hidden");
  unread = 0;
  badge.classList.add("hidden");
});

// Envoi message
document.getElementById("send-btn").addEventListener("click", async () => {
  const message = input.value;
  const file = fileInput.files[0];

  if(!message && !file) return;

  // Affiche dans la bulle côté user
  content.innerHTML += `<div>🧑‍💻 Vous: ${message || file.name}</div>`;

  input.value = "";
  fileInput.value = "";

  // Upload fichier si présent
  let fileUrl = null;
  if(file){
    const { data, error } = await supabase.storage
      .from('messages-files')
      .upload(`${Date.now()}-${file.name}`, file);
    if(error){
      console.error(error);
    } else {
      fileUrl = `https://ccsrxvwaxkdbphesyies.supabase.co/storage/v1/object/public/messages-files/${data.path}`;
    }
  }

  // Insert dans Supabase
  await supabase.from("messages").insert([
    { user_id: "ID_UTILISATEUR", contenu: message, file_url: fileUrl, type: "user" }
  ]);
});

// Charger les messages
async function loadMessages(){

  try{
    const {data : {user}, error: authError} = await supabase.auth.getUser();

    if (authError || !user){
      console.error("Utilisateur non connecté :", authError);
        return;
    }
  
   

  const {data : userData, error : userError} = await supabase
  .from("utilisateur")
  .select("*")
  .eq("mail_user", user.email)
  .maybeSingle();

  if(userError || !userData){
    console.error("Utilisateur DB introuvable :", userError);
    return;
  }
    const userId = userData.mat_user;


    const {data, error} = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {ascending : true});

    if (error){
      console.error("Erreur messages :", error);
      return;
    }
    if (!data) return;
    content.innerHTML = "";

    data.forEach(msg => {
      content.innerHTML += `<div>${msg.contenu}</div>`
    });

 }catch (err){
  console.error("Erreur loadMessages:", err)
 }
}
loadMessages();

// Fonction pour afficher messages
function appendMessage(msg){
  if(msg.type === "user"){
    content.innerHTML += `<div>🧑‍💻 Vous: ${msg.contenu ? msg.file_url :""} ${msg.file_url ? `<a href="${msg.file_url}" target="_blank">${msg.file_url.split('/').pop()}</a>` : ""}</div>`;
  } else {
    content.innerHTML += `<div>💬 Admin: ${msg.contenu ? msg.file_url :""} ${msg.file_url ?`<a href="${msg.file_url}" target="_blank">${msg.file_url.split('/').pop()}</a>` : ""}</div>`;
    // Badge + son
    if(box.classList.contains("hidden")){
      unread++;
      badge.textContent = unread;
      badge.classList.remove("hidden");
      sound.play();
    }
  }
}

// Realtime Supabase
supabase.channel('messages')
  .on('postgres_changes',{ event: 'INSERT', schema:'public', table:'messages' }, payload => {
    appendMessage(payload.new);
  })
  .subscribe();
async function sendMessage() {
  try {
    const input = document.getElementById("message-input");
    const messageText = input.value.trim();

    if (!messageText) {
      alert("Message vide !");
      return;
    }

    // 🔹 user auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Utilisateur non connecté");
      return;
    }

    // 🔹 user DB
    const { data: userData, error: userError } = await supabase
      .from("utilisateur")
      .select("mat_user")
      .eq("mail_user", user.email)
      .maybeSingle();

    if (userError || !userData) {
      console.error("Utilisateur DB introuvable");
      return;
    }

    const userId = Number(userData.mat_user); // 🔥 IMPORTANT

    console.log("DEBUG FINAL :", userId, messageText);
    console.log(JSON.stringify({
  user_id: userId,
  contenu: messageText,
  file_url: null,
  type: "user"
}));

    // 🔥 INSERT CLEAN
   const { data, error } = await supabase
  .from("messages")
  .insert([{
    user_id: Number(userId),
    contenu: String(messageText),
    file_url: null,
    type: "client"
  }])
  .select("*");

    if (error) {
      console.error("INSERT ERROR :", error);
      return;
    }

    input.value = "";
    loadMessages();

  } catch (err) {
    console.error("Erreur sendMessage :", err);
  }
}

async function deleteNotifications() {
  try {
    // 🔹 Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Utilisateur non connecté :", authError);
      return alert("Vous devez être connecté !");
    }

    // 🔹 Récupérer l'ID de l'utilisateur dans la table utilisateur
    const { data: userData, error: userError } = await supabase
      .from("utilisateur")
      .select("mat_user")
      .eq("mail_user", user.email)
      .maybeSingle();

    if (userError || !userData) {
      console.error("Utilisateur introuvable dans la DB :", userError);
      return alert("Impossible de trouver vos données.");
    }

    const userId = Number(userData.mat_user);

    // 🔹 Supprimer toutes les notifications/messages de cet utilisateur
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Erreur suppression notifications :", deleteError);
      return alert("Impossible de supprimer vos notifications !");
    }

    // 🔹 Vider l'affichage côté client
    const contentDiv = document.getElementById("content"); // ton container messages
    if (contentDiv) contentDiv.innerHTML = "";

    alert("Toutes vos notifications ont été supprimées ✅");

  } catch (err) {
    console.error("Erreur deleteNotifications :", err);
    alert("Une erreur est survenue lors de la suppression.");
  }
}
const deleteBtn = document.getElementById("delete-notif-btn");
if (deleteBtn) deleteBtn.addEventListener("click", deleteNotifications);

/* ============================
       EXPOSE GLOBAL FUNCTIONS
============================ */
window.chargerProfil = chargerProfil;
window.genererPDF = genererPDF;
window.logout = logout;
window.voirMonStatut = voirMonStatut;
window.sendMessage = sendMessage;
window.deleteNotifications = deleteNotifications;
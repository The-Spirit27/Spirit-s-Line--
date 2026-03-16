
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
function genererPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    const req = window.__lastRequestForPdf || { service:'N/A', status:'En attente', details:'', marque:'' };
    const statutActuel = req.status || 'En attente';

    const bleuTech = [0, 102, 204];
    const grisFonce = [30,30,30];

    // --- Bandeau supérieur ---
    doc.setFillColor(...grisFonce);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(26);
    doc.text("SPIRIT'S LINE", 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica","normal");
    doc.text("VOS SERVICES INFORMATIQUES DE QUALITÉS", 20, 32);

    // --- Bloc infos client ---
    doc.setTextColor(...grisFonce);
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");
    doc.text("DÉTAILS DU REÇU", 20, 60);
    doc.setDrawColor(...bleuTech);
    doc.setLineWidth(1);
    doc.line(20,62,40,62);

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);
    doc.text(`CLIENT : ${String(user.username||'').toUpperCase()}`, 20, 75);
    doc.text(`ID CLIENT : #SL-${String(user.username||'').substring(0,3).toUpperCase()}`, 20, 82);
    doc.text(`DATE : ${new Date().toLocaleDateString()}`, 20, 89);

    // --- Tableau service / statut ---
    doc.setFillColor(...bleuTech);
    doc.rect(20,105,170,12,'F');
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.text("SERVICE", 25, 113);
    doc.text("ÉTAT DU TRAITEMENT", 130, 113);

    doc.setTextColor(...grisFonce);
    doc.setFont("helvetica","normal");
    doc.setDrawColor(220,220,220);
    doc.rect(20,117,170,30);

    doc.text(`SERVICE : ${req.service || 'N/A'}`, 25, 130);
    doc.setFontSize(10);
    doc.text(`DÉTAILS : ${req.details || '—'}`, 25, 138);

    if (statutActuel.toLowerCase().includes("term")) doc.setTextColor(40,167,69);
    else if (statutActuel.toLowerCase().includes("cours")) doc.setTextColor(0,123,255);
    else doc.setTextColor(255,150,0);

    doc.setFont("helvetica","bold");
    doc.setFontSize(12);
    doc.text(String(statutActuel).toUpperCase(), 135, 130);

    doc.setTextColor(...grisFonce);
    doc.setFontSize(9);
    doc.setFont("helvetica","italic");
    doc.text("Ce document est une preuve numérique générée via le dashboard Spirit's Line.", 20, 160);

    // Pied de page
    doc.setFillColor(245,245,245);
    doc.rect(0,280,210,20,'F');
    doc.setTextColor(100);
    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.text("SPIRIT'S LINE - Support technique : support@spiritsline.com",105,292,{align:"center"});

    doc.save(`Recu_SL_${String(user.username||'client')}.pdf`);
  } catch (error) {
    console.error("Erreur PDF:", error);
    alert("Une erreur est survenue lors de la création du document.");
  }
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

/* ============================
       EXPOSE GLOBAL FUNCTIONS
============================ */
window.chargerProfil = chargerProfil;
window.genererPDF = genererPDF;
window.logout = logout;
window.voirMonStatut = voirMonStatut;
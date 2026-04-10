
const safeGet = id => document.getElementById(id) || null;

document.addEventListener("DOMContentLoaded", () => {
    const authZone = document.getElementById('sidebar-user-area'); // L'ID de ta div sidebar
    const token = localStorage.getItem('monToken');
    const savedData = localStorage.getItem('userData');
    const BruteData = localStorage.getItem('userData');
    const sidebarButtons = document.querySelectorAll('.button');

    let userData = null;
    if (BruteData && BruteData !== "undefined"){
      userData = JSON.parse(BruteData);
    }
    console.log("Utilisateur chargé : ", userData);


});



function deconnexion() {
    localStorage.clear();
    window.location.reload(); // Recharge la page pour remettre les boutons "Connexion"
}







// Fermer la sidebar si clic en dehors
document.addEventListener('click', (e) => {
const sidebar = document.getElementById('sidebar');
if (sidebar) sidebar.classList.toggle('open');
});

// Charger CSS spécifique
function chargerCSSSpécifique(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const lien = document.createElement("link");
    lien.rel = "stylesheet";
    lien.href = href;
    document.head.appendChild(lien);
  }
}

// Charger contenu externe
// ---------- CHARGEMENT DYNAMIQUE ----------
function chargerContenuExterne(fichier, cible) {
  fetch(fichier)
    .then(response => {
      if (!response.ok) throw new Error("Erreur de chargement: " + response.statusText);
      return response.text();
    })
    .then(html => {
      cible.innerHTML = html;

      // Vérifie si un formulaire existe dans le contenu chargé
      const formulaire = cible.querySelector("#formulaire");
      if (formulaire) {
        initialiserFormulaire(formulaire);
      }
    })
    .catch(err => {
      cible.innerHTML = "<p>❌ Erreur lors du chargement du contenu.</p>";
      console.error(err);
    });
}


async function initialiserFormulaire(formulaire) {
  if (!formulaire) {
    console.warn('initialiserFormulaire: formulaire introuvable.');
    return;
  }
  console.log("✅ Formulaire détecté et initialisé.");

  // Récupération sécurisée des éléments
  const marque = formulaire.querySelector('#marque');
  const autreMarque = formulaire.querySelector('#autreMarque');
  const validerBtn = formulaire.querySelector('#valider');
  const modifierBtn = formulaire.querySelector('#modifier');
  const confirmerBtn = formulaire.querySelector('#confirmer');
  const synthese = document.getElementById('synthese'); // zone synthèse globale
  const serviceTitle = document.querySelector('#service-title'); // optionnel
  const selectOptions = document.querySelector('#select-options'); // optionnel
  const montantEl = document.querySelector('#r-montant'); // optionnel

  // Sécurité : vérifier existence des boutons avant d'attacher
  if (marque && autreMarque) {
    marque.addEventListener("change", () => {
      autreMarque.style.display = marque.value === "Autre" ? "block" : "none";
      if (marque.value !== "Autre") autreMarque.value = "";
    });
  }

  if (validerBtn) {
    validerBtn.addEventListener("click", () => {
      const nom = (formulaire.querySelector("#nom")?.value || "").trim();
      const prenom = (formulaire.querySelector("#prenom")?.value || "").trim();
      const numero = (formulaire.querySelector("#numero")?.value || "").trim();
      const marqueChoisie = (marque?.value === "Autre")
        ? (autreMarque?.value.trim() || "Non précisé")
        : (marque?.value || "Non précisé");

      if (!nom || !prenom || !numero) {
        alert("⚠️ Merci de remplir tous les champs obligatoires (nom, prénom, téléphone).");
        return;
      }

      // Remplir la synthèse visible (crée les éléments #r-nom, #r-prenom, #r-numero si nécessaire)
      const rNom = document.getElementById('r-nom');
      const rPrenom = document.getElementById('r-prenom');
      const rNumero = document.getElementById('r-numero');
      const rMarque = document.getElementById('r-marque');

      if (rNom) rNom.textContent = nom;
      if (rPrenom) rPrenom.textContent = prenom;
      if (rNumero) rNumero.textContent = numero;
      if (rMarque) rMarque.textContent = marqueChoisie;

      // Masquer les champs du formulaire (sauf la synthèse)
      formulaire.querySelectorAll("input, select, button, textarea, label").forEach(el => {
        if (!el.closest("#synthese")) el.style.display = "none";
      });

      if (synthese) synthese.style.display = "block";
    });
  }

  if (modifierBtn) {
    modifierBtn.addEventListener("click", () => {
      // Réafficher les champs du formulaire
      formulaire.querySelectorAll("input, select, button, textarea, label").forEach(el => {
        if (!el.closest("#synthese")) el.style.display = "";
      });
      if (synthese) synthese.style.display = "none";
    });
  }

  if (confirmerBtn) {
    confirmerBtn.addEventListener("click", async () => {
      try {
        // Récupérer userData en fallback localStorage
        const userData = (() => {
          try { return JSON.parse(localStorage.getItem('userData') || 'null') || {}; }
          catch { return {}; }
        })();

        const serviceExplicite = serviceTitle && selectOptions
          ? `${serviceTitle.innerText} : ${selectOptions.value}`
          : (document.querySelector('#serviceAffiche')?.value || 'Service non précisé');

        const montantText = montantEl?.innerText || 'À déterminer';

        // Préparer payload
        const payload = {
          username: userData.username || `${document.querySelector('#nom')?.value || ''} ${document.querySelector('#prenom')?.value || ''}`.trim() || 'Client',
          service: serviceExplicite,
          montant: montantText
        };

        // Envoi au serveur (adaptable)
        const res = await fetch('/commander-service', { // utilise chemin relatif ou absolute selon ton backend
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => null);
          console.error('Erreur serveur commander-service:', res.status, errText);
          alert('Erreur lors de l\'enregistrement de la commande.');
          return;
        }

        // Optionnel : message WhatsApp formaté
        const nomClient = payload.username;
        const message = encodeURIComponent(
          `*NOUVELLE COMMANDE SPIRIT-S-LINE*\n\n` +
          `👤 Client : ${nomClient}\n` +
          `🛠️ Service : ${payload.service}\n` +
          `💰 Montant : ${payload.montant}`
        );
        const numeroWhatsApp = "241074849344";
        window.open(`https://wa.me/${numeroWhatsApp}?text=${message}`, "_blank");

        alert("Commande enregistrée !");
        // Redirection ou reset
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error('Erreur confirmerBtn handler:', err);
        alert('Une erreur est survenue. Réessayez plus tard.');
      }
    });
  }
}

// Activer bouton sidebar
function activer(boutonclique) {
    // 1. Définition des éléments (pour éviter les erreurs "not defined")
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const mainWrapper = document.getElementById('main-wrapper');
    const overlay = document.querySelector('.overlay');
    const contenu = document.getElementById('contenu'); // Assure-toi d'avoir cet ID pour charger ton HTML

    // 2. Gestion de la classe active sur les boutons
    const sidebarButtons = document.querySelectorAll('.button');
    sidebarButtons.forEach(button => button.classList.remove('active'));
    boutonclique.classList.add('active');

    // 3. Récupération du texte pour le Switch
    const texteElement = boutonclique.querySelector('.text');
    if (!texteElement) return; // Sécurité si l'élément .text n'existe pas
    const texte = texteElement.innerText.trim().toLowerCase();

    // 4. Chargement dynamique du contenu
  switch (texte) {
    case "acceuil":
      chargerCSSSpécifique("Frontend/css/btn-acceuil.css");
      chargerContenuExterne("Frontend/html/btn-acceuil.html", contenu);
      break;
    case "paramètres":
      chargerCSSSpécifique("Frontend/css/paramètres.css");
      chargerContenuExterne("Frontend/html/paramètres.html", contenu);
      break;
    case "guide d'utilisation >":
      chargerCSSSpécifique("Frontend/css/guide.css");
      chargerContenuExterne("Frontend/html/guide.html", contenu);
      break;
    case "à propos du site >":
      chargerCSSSpécifique("Frontend/css/info.css");
      chargerContenuExterne("Frontend/html/info.html", contenu);
      break;

  }
    // 5. Fermeture automatique de la sidebar après le clic
    if (sidebar) sidebar.classList.remove("active");
    if (toggleBtn) toggleBtn.classList.remove("shifted");
    if (mainWrapper) mainWrapper.classList.remove("shifted");
    if (overlay) overlay.classList.remove("active");
}





 const sidebarButtons = document.querySelectorAll('.sidebar .button, .sidebar a');
// Assignation des boutons
sidebarButtons.forEach(btn => {
  btn.addEventListener('click', () => activer(btn));
});

// Ouverture auto accueil au chargement
window.onload = function () {
    const btnAccueil = document.getElementById("btn-accueil");
    // RÉCUPÉRATION DU BOUTON (Il manquait cette ligne)
    const toggleBtn = document.getElementById("toggleBtn"); 

    if (btnAccueil) activer(btnAccueil);

    if (toggleBtn) {
        setTimeout(() => toggleBtn.classList.remove("slide-in"), 1000);
    } else {
        console.warn("Le bouton 'toggleBtn' n'a pas été trouvé.");
    }
};


const validerBtn = document.getElementById('valider-btn');
  // Quand on clique sur "Valider"
  if (validerBtn) {
    validerBtn.addEventListener("click", async () => {
      console.log("bouton cliqué !")
    });
  } else { 
      console.log("Note : Le bouton de validation n'est pas sur cette page.");   
  }




// Votre fonction dans Line.js doit basculer les classes 'active' ou 'shifted'




function gererAffichageNav() {
    // IL MANQUAIT CETTE LIGNE :
    const authZone = document.getElementById('sidebar-auth-zone'); 
    
    const bruteData = localStorage.getItem('userData');
    const token = localStorage.getItem('monToken');
    
    let userData = null;
    if (bruteData && bruteData !== "undefined" && bruteData !== null) {
        try {
            userData = JSON.parse(bruteData);
        } catch (e) {
            console.error("Erreur de lecture JSON", e);
        }
    }

    // On vérifie si authZone existe ET si l'utilisateur est connecté
    if (authZone && userData && userData.username) {
        const lienProfil = (userData.role === 'admin') ? 'admin.html' : 'dashboard.html';
        
        authZone.innerHTML =` 
            <div class="user-profile-nav" onclick="window.location.href='${lienProfil}'" style="cursor:pointer; display:flex; align-items:center; padding:10px;">
                <img src="https://ui-avatars.com/api/?name=${userData.username}&background=0D8ABC&color=fff" style="width:35px; border-radius:50%; margin-right:10px; border:2px solid #4ade80;">
                <div style="display:flex; flex-direction:column;">
                    <span style="color:white; font-weight:bold; font-size:0.9em;">${userData.username}</span>
                    <span style="color:#4ade80; font-size:0.7em;">● Connecté</span>
                </div>
            </div>
            <button onclick="deconnexion()" style="margin-top:10px; background:none; border:1px solid #ff4d4d; color:#ff4d4d; width:100%; border-radius:5px; cursor:pointer; padding:5px;">
                Déconnexion
            </button>
        `;
    }
}





function accederService (nomDuService) {
  const token = localStorage.getItem('monToken');

  if (!token) {
    alert("🔒 Cet accès est réserveraux membres de SPIRIT'S LINE. Veuillez vous connecter.");
    window.location.href = "Frontend/HTML/login.html";
  } else {
    window.location.href = `${nomDuService}.html` ;
  }
}

function gererAffichageSidebar() {
    const authZone = document.getElementById('sidebar-auth-zone');
    const BruteData = localStorage.getItem('userData');
    const token = localStorage.getItem('monToken');

    let userData = null;
    // On vérifie si on a bien les infos
    if (BruteData && BruteData !== "undefined") {
      try {
        userData = JSON.parse(BruteData);
      } catch(e) {
        console.error("Erreur de lecture JSON", e);
      }
    }
    if (userData && userData.username){
        // Vers quelle page envoyer au clic sur le profil ?
        const lienProfil = (userData.role === 'admin') ? 'admin.html' : 'dashboard.html';

        // ON REMPLACE TOUT LE CONTENU (Les boutons disparaissent ici)
        authZone.innerHTML = ` 
            <div class="user-profile-nav" onclick="window.location.href='${lienProfil}'" style="cursor:pointer; display:flex; align-items:center; background:rgba(255,255,255,0.1); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.2); @media (max-width: 768px){}">
                <img src="https://ui-avatars.com/api/?name=${userData.username}&background=0D8ABC&color=fff&rounded=true" 
                     alt="Profil" style="width:35px; margin-right:12px; border: 2px solid #040505ff;">
                
                <div style="display:flex; flex-direction:column;">
                    <span style="color:#ff4d4d; font-weight:bold; font-size:0.9em;">${userData.username}</span>
                    <span style="color:#4ade80; font-size:0.7em;">● Connecté</span>
                </div>
            </div>
            
            <button onclick="deconnexion()" style="margin-top:10px; background:red; border:1px solid #ff4d4d; color:#ff4d4d; width:100%; border-radius:5px; cursor:pointer; font-size:0.8em; padding:5px;">
                Déconnexion
            </button>
        `;
    }
  }

function deconnexion() {
  localStorage.removeItem('monToken');
  localStorage.removeItem('userData');
  window.location.href = "../../index.html";
}
document.addEventListener('DOMContentLoaded', gererAffichageNav);


/* ==================================================================
   1. FONCTION TOGGLE SIDEBAR (Le cœur du menu)
   ================================================================== */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay'); // Optionnel : fond gris
    const toggleBtn = document.getElementById('toggleBtn');
  

    // 1. On bascule la classe 'active' sur la sidebar
    if (sidebar) {
        sidebar.classList.toggle('active');
        const estOuvert = sidebar.classList.contains('active');
        console.log("Menu Sidebar : " + (estOuvert ? "OUVERT" : "FERMÉ"));

        // 2. Gestion de l'Overlay (si tu en as un pour le mobile)
        if (overlay) {
            overlay.classList.toggle('active');
        }

        // 3. Animation du bouton (optionnel, si tu as du CSS pour ça)
        if (toggleBtn) {
            toggleBtn.classList.toggle('active');
        }
    } else {
        console.error("Erreur : L'élément #sidebar est introuvable.");
    }
}


/* ==================================================================
   2. INITIALISATION AU CHARGEMENT DE LA PAGE
   ================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    
    // --- A. CONNECTION DU BOUTON MENU ---
    const btn = document.getElementById('toggleBtn');
    if (btn) {
        // On supprime les anciens événements pour éviter les doublons
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById('toggleBtn');
        
        // On attache la fonction unique
        newBtn.addEventListener('click', toggleSidebar);
    }

    // --- B. CONNECTION DE L'OVERLAY (Fermer en cliquant à côté) ---
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }

    // --- C. CHARGEMENT DU PROFIL UTILISATEUR ---
    chargerProfilUtilisateur();
});

/* ==================================================================
   3. GESTION DU PROFIL (Affichage auto)
   ================================================================== */
// Helpers
const safeGet1 = id => document.getElementById(id) || null;
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Déconnexion propre (Supabase + localStorage)
async function deconnexion() {
  try {
    // 1. Déconnexion Supabase Frontend
    if (window.supabase && supabase.auth) {
      await supabase.auth.signOut();
    }

    // 2. SIGNAL DE DÉCONNEXION À AÉTHER
    const iframe = document.querySelector('#aether-chat-window iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'LOGOUT' }, 'https://127.0.0.1:8000https://aether-backend-8jet.onrender.com');
    }

  } catch (err) {
    console.warn('Erreur signOut:', err);
  }

  // 3. Nettoyage local
  localStorage.removeItem('userData');
  localStorage.removeItem('monToken');

  // 4. Redirection
  window.location.href = 'Frontend/HTML/login.html';
}

// Chargement du profil dans la sidebar
// ---------------------------------------------------
// Global currentProfile pour tout le site
// ---------------------------------------------------
let currentProfile = null;

// ---------------------------------------------------
// Charger le profil utilisateur et mettre à jour la sidebar
// ---------------------------------------------------
async function chargerProfilUtilisateur() {
  const authZone = safeGet('sidebar-auth-zone');
  const bruteData = localStorage.getItem('userData');

  console.log('Tentative de chargement du profil...');
  console.log('Données trouvées (localStorage):', bruteData);

  let profile = null;

  // 🔹 Essayer d'obtenir la session Supabase en priorité
  try {
    if (window.supabase && supabase.auth && typeof supabase.auth.getSession === 'function') {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session ?? null;

      if (session?.user) {
        // Récupérer le profil en base
        const { data: userData, error } = await supabase
          .from("utilisateur")
          .select("pseudo_user, mail_user, role")
          .eq("mat_user", session.user.id)
          .single();

        if (error) console.error(error);

        profile = {
          username: userData?.pseudo_user || session.user.email,
          email: userData?.mail_user || session.user.email,
          id: session.user.id,
          role: userData?.role || "user"
        };
      }
    }
  } catch (err) {
    console.warn('Impossible de récupérer la session Supabase :', err);
  }

  // 🔹 Fallback sur localStorage si pas de session
  if (!profile && bruteData && bruteData !== 'undefined') {
    try {
      const parsed = JSON.parse(bruteData);
      profile = {
        username: parsed.username || parsed.email || 'Utilisateur',
        email: parsed.email || '',
        id: parsed.id || null,
        role: parsed.role || "user"
      };
    } catch (err) {
      console.warn('Erreur parsing userData:', err);
      profile = null;
    }
  }

  // 🔹 Mettre à jour la sidebar si profile disponible
  if (authZone && profile) {
    const safeName = escapeHtml(profile.username);

    // Considérer admin + ROOT comme admin
    const isAdmin = profile.role === "admin" || profile.role === "ROOT";

    authZone.innerHTML = `
      <div class="sidebar-user">
        <div class="sidebar-avatar">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=0D8ABC&color=fff"
               alt="Avatar ${safeName}"
               id="avatar-dashboard"
               style="cursor:pointer;">
        </div>

        <div class="sidebar-user-info">
          <span class="sidebar-username">${safeName}</span>
          <span class="sidebar-role">${isAdmin ? "🛡️ Admin" : "👤 Utilisateur"}</span>
        </div>

        <div class="sidebar-actions">
          <button id="btn-dashboard" class="sidebar-btn dashboard-btn">
            📊 ${isAdmin ? "Admin Panel" : "Mon Dashboard"}
          </button>

          <button id="btn-deconnexion" class="sidebar-btn logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    `;

    // Déconnexion
    const btnLogout = safeGet('btn-deconnexion');
    if (btnLogout) btnLogout.addEventListener('click', deconnexion);

    // Dashboard / Admin Panel
    const dashBtn = safeGet('btn-dashboard');
    if (dashBtn) dashBtn.addEventListener('click', openDashboard);

    console.log('✅ Sidebar mise à jour avec le profil !');
  } else {
    console.log('❌ Pas de données utilisateur, on garde les boutons par défaut.');
  }
  if (profile) {
        currentProfile = profile;
        // On synchronise silencieusement avec AÉTHER s'il est déjà chargé
        syncAetherSession();
  }

  // Rendre le profile global
  currentProfile = profile;  
}

async function syncAetherSession() {
    const iframe = document.querySelector('#aether-chat-window iframe');
    if (!iframe || !iframe.contentWindow) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            iframe.contentWindow.postMessage({
                type: 'SET_SESSION',
                session: session
            }, 'https://127.0.0.1:8000');
        }
    } catch (e) {
        console.warn("AÉTHER Sync : Pas de session active.");
    }
}
// ---------------------------------------------------
// Fonction pour ouvrir le dashboard / admin
// ---------------------------------------------------
function openDashboard() {
  if (!currentProfile) {
    console.warn("❌ Profil non chargé");
    return;
  }

  if (currentProfile.role === "admin" || currentProfile.role === "ROOT") {
    window.location.href = "Frontend/HTML/admin.html";
  } else {
    window.location.href = "Frontend/HTML/dashboard.html";
  }
}

// ---------------------------------------------------
// Exposer globalement si besoin
// ---------------------------------------------------
window.chargerProfilUtilisateur = chargerProfilUtilisateur;
window.openDashboard = openDashboard;

// ---------------------------------------------------
// Charger automatiquement au DOMContentLoaded
// ---------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await chargerProfilUtilisateur();
});
const dashboardBtn = safeGet("btn-dashboard");
const avatar = safeGet("avatar-dashboard");


document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase || !supabase.auth) {
    console.error("❌ Supabase non initialisé !");
    return;
  }

  try {
    // ⚡ Syntaxe v2
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session :", session);

    if (!session) {
      window.location.href = "login.html";
    } else {
      await chargerProfilUtilisateur();
    }

  } catch (err) {
    console.error("Erreur lors de la récupération de la session :", err);
  }
});

dashboardBtn?.addEventListener("click", openDashboard);
avatar?.addEventListener("click", openDashboard);

// Exposer globalement si nécessaire
window.chargerProfilUtilisateur = chargerProfilUtilisateur;
window.deconnexion = deconnexion;

// Lancer au chargement si l'élément existe
document.addEventListener('DOMContentLoaded', () => {
  chargerProfilUtilisateur().catch(err => console.error('Erreur chargerProfilUtilisateur:', err));
});

/* ---------- Config Supabase (remplace la clé ANON) ---------- */



/* ---------- Envoi du formulaire (Supabase) ---------- */
async function envoyerFormulaire(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  // Récupérer l'utilisateur connecté (préférence : session Supabase)
  let username = 'Anonyme';
  let userId = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session ?? null;
    if (session?.user) {
      userId = session.user.id;
      username = session.user.user_metadata?.display_name || session.user.email || username;
    } else {
      // fallback localStorage
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      username = stored.username || username;
    }
  } catch (err) {
    console.warn('Impossible de récupérer la session Supabase :', err);
    const stored = JSON.parse(localStorage.getItem('userData') || '{}');
    username = stored.username || username;
  }

  // Récupération des champs (vérifier que les IDs existent)
  const serviceEl = safeGet('serviceChoisi') || safeGet('serviceAffiche') || safeGet('service');
  const detailsEl = safeGet('details') || safeGet('detailsDemande');
  const service = serviceEl ? serviceEl.value || serviceEl.textContent || '' : '';
  const details = detailsEl ? detailsEl.value || detailsEl.textContent || '' : '';

  if (!service || !details) {
    alert('Merci de renseigner le service et les détails.');
    return;
  }

  const laDemande = {
    username,
    user_id: userId,
    service,
    details,
    status: 'En attente',
    date: new Date().toLocaleString('fr-FR'),
    created_at: new Date().toISOString()
  };

  try {
    // Insérer dans Supabase (table "requests" — adapte si nécessaire)
    const { data, error } = await supabase
      .from('requests')
      .insert([laDemande]);

    if (error) {
      console.error('Erreur insertion Supabase:', error);
      alert('Erreur lors de l\'enregistrement sur le serveur.');
      return;
    }

    // Ouvrir WhatsApp après insertion réussie
    const tel = '24174849344'; // remplace par ton numéro
    const msg = `Salut SPIRIT ! Je suis ${laDemande.username}. Demande : ${laDemande.service}. Infos : ${laDemande.details}`;
    const waUrl = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    alert('Requête enregistrée et transmise !');

    // Optionnel : reset du formulaire
    const form = safeGet('formulaire');
    if (form) form.reset();

  } catch (err) {
    console.error('Erreur réseau / Supabase :', err);
    alert('Erreur de connexion au serveur.');
  }
}

/* ---------- Attacher le handler si le formulaire existe ---------- */
const formEl = safeGet('formulaire');
if (formEl) formEl.addEventListener('submit', envoyerFormulaire);

// Exposer la fonction globalement si tu utilises onclick inline
window.envoyerFormulaire = envoyerFormulaire;




function deconnexion() {
    localStorage.clear();
    window.location.href = "../../index.html";
}

/* Fonction pour faire défiler la page jusqu'à la section Services */
function scrollToServices() {
    const sectionServices = document.getElementById('servi'); // Vérifie que ton ID est bien 'servi'
    if (sectionServices) {
        sectionServices.scrollIntoView({ behavior: 'smooth' });
        
        // Optionnel : Si on est sur mobile, on ferme la sidebar après le clic
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    } else {
        console.warn("Erreur : La section avec l'ID 'servi' est introuvable.");
    }
}


// ---------- Constantes ----------
const COOKIE_KEY = 'SPL_cookie_consent';
const COOKIE_NAME = 'SPL_cookie_consent';
const COOKIE_MAX_AGE = 60*60*24*365; // 1 an

// ---------- Fonctions cookies ----------
function setCookie(name, value, days = 365) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (const c of cookies) {
        if (c.startsWith(name + '=')) {
            return c.split('=')[1];
        }
    }
    return null;
}

// ---------- Valider le consentement ----------
function validerCookies(choix) {
    if (choix === 'all') {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        setCookie(COOKIE_NAME, 'accepted', 365);
    } else if (choix === 'essential') {
        localStorage.setItem(COOKIE_KEY, 'essential_only');
        setCookie(COOKIE_NAME, 'essential_only', 365);
    }

    const banner = document.getElementById('cookie-banner');
    if (banner) {
        // Animation sortie
        banner.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(10px)';
        setTimeout(() => banner.style.display = 'none', 500);
    }

    applyConsentEffects();
}

// ---------- Appliquer effets selon consentement ----------
function applyConsentEffects() {
    const consent = localStorage.getItem(COOKIE_KEY) || getCookie(COOKIE_NAME);

    if (consent === 'accepted') {
        console.log('✅ Tout accepté : analytics et scripts tiers activés');
        // Exemple : window.enableAnalytics && window.enableAnalytics();
    } else if (consent === 'essential_only') {
        console.log('⚠️ Essentiels uniquement : analytics désactivé');
        // Exemple : window.disableAnalytics && window.disableAnalytics();
    } else {
        console.log('⚠️ Consentement non défini : scripts tiers bloqués');
        // Bloquer ou différer le chargement de scripts
    }
}

// ---------- Gestion du bandeau ----------
function gererConsentementCookies() {
    const banner = document.getElementById('cookie-banner');
    const consent = localStorage.getItem(COOKIE_KEY) || getCookie(COOKIE_NAME);

    // Appliquer effets connus
    applyConsentEffects();

    if (!banner) return;

    if (consent) {
        banner.style.display = 'none';
        return;
    }

    // Afficher le banner
    banner.style.display = 'block';
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';

    // Attacher boutons
    const btnAcceptAll = banner.querySelector('[data-cookie="accept-all"]') || document.getElementById('acceptAllCookies');
    const btnEssential = banner.querySelector('[data-cookie="essential-only"]') || document.getElementById('acceptEssentialCookies');

    if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => validerCookies('all'));
    if (btnEssential) btnEssential.addEventListener('click', () => validerCookies('essential'));
}

// ---------- Tester consentement avant chargement de scripts tiers ----------
function isConsentAccepted() {
    const consent = localStorage.getItem(COOKIE_KEY) || getCookie(COOKIE_NAME);
    return consent === 'accepted';
}

// ---------- Lancement ----------
document.addEventListener('DOMContentLoaded', () => {
    gererConsentementCookies();
});

// ---------- Exports globaux ----------
window.validerCookies = validerCookies;
window.gererConsentementCookies = gererConsentementCookies;
window.applyConsentEffects = applyConsentEffects;
window.isConsentAccepted = isConsentAccepted;
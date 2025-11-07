const sidebar = document.getElementById('sidebar');
const toggleBtn = document.querySelector('.toggle-btn');
const mainWrapper = document.getElementById('main-wrapper');
const overlay = document.getElementById('overlay');
const contenu = document.getElementById('contenu');
const sidebarButtons = document.querySelectorAll('.sidebar .button');


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('main-wrapper');
    const toggleBtn = document.querySelector('.toggle-btn');
    const overlay = document.querySelector('.overlay');

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mode Mobile: Utiliser la classe 'active' pour afficher/masquer
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Cacher le bouton toggle quand le menu est ouvert (optionnel)
        toggleBtn.style.display = sidebar.classList.contains('active') ? 'none' : 'block';
        
    } else {
        // Mode Desktop: Utiliser la classe 'shifted' pour décaler le contenu
        sidebar.classList.toggle('active'); // Maintient l'état du menu
        mainWrapper.classList.toggle('shifted');
        toggleBtn.classList.toggle('shifted');
    }
}

 function toggleMenu() {
            document.getElementById("myDropdown").classList.toggle("show");
        }
        window.onclick = function (event) {
            if (!event.target.matches('.dropdown-btn'))
        {
            let dropdowns = 
            document.getElementsByClassName("dropdown-content");
            for(let i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if 
                (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
        }

// Fermer la sidebar si clic en dehors
document.addEventListener('click', (e) => {
  if (
    sidebar.classList.contains('active') &&
    !sidebar.contains(e.target) &&
    !(toggleBtn && toggleBtn.contains(e.target))
  ) {
    sidebar.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('shifted');
    if (mainWrapper) mainWrapper.classList.remove('shifted');
    if (overlay) overlay.classList.remove('active');
  }
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
function initialiserFormulaire(formulaire) {
  console.log("✅ Formulaire détecté et initialisé.");

  const validerBtn = formulaire.querySelector("#valider");
  const synthese = formulaire.querySelector("#synthese");
  const autreMarque = formulaire.querySelector("#autreMarque");
  const marque = formulaire.querySelector("#marque");
  const service = formulaire.querySelector("#service");
  const montant = formulaire.querySelector("#montant");

  const rNom = formulaire.querySelector("#rNom");
  const rPrenom = formulaire.querySelector("#rPrenom");
  const rNumero = formulaire.querySelector("#rNumero");
  const rMarque = formulaire.querySelector("#rMarque");
  const rService = formulaire.querySelector("#rService");
  const rMontant = formulaire.querySelector("#rMontant");
  const modifierBtn = formulaire.querySelector("#modifier");
  const confirmerBtn = formulaire.querySelector("#confirmer");

  marque.addEventListener("change", () => {
    autreMarque.style.display = marque.value === "Autre" ? "block" : "none";
    if (marque.value !== "Autre") autreMarque.value = "";
  });

  validerBtn.addEventListener("click", () => {
    const nom = formulaire.querySelector("#nom").value.trim();
    const prenom = formulaire.querySelector("#prenom").value.trim();
    const numero = formulaire.querySelector("#numero").value.trim();
    let marqueChoisie = marque.value === "Autre" ? autreMarque.value.trim() || "Non précisé" : marque.value;

    if (!nom || !prenom || !numero || !marqueChoisie) {
      alert("⚠️ Merci de remplir tous les champs.");
      return;
    }

    rNom.textContent = nom;
    rPrenom.textContent = prenom;
    rNumero.textContent = numero;
    rMarque.textContent = marqueChoisie;
    rService.textContent = service.value;
    rMontant.textContent = montant.value;

    formulaire.querySelectorAll("input, select, button").forEach(el => {
      if (!el.closest("#synthese")) el.style.display = "none";
    });

    synthese.style.display = "block";
  });

  modifierBtn.addEventListener("click", () => {
    formulaire.querySelectorAll("input, select, button").forEach(el => {
      if (!el.closest("#synthese")) el.style.display = "";
    });
    synthese.style.display = "none";
  });

  confirmerBtn.addEventListener("click", () => {
    const choix = confirm("Souhaitez-vous envoyer ces informations par WhatsApp ? (OK = WhatsApp / Annuler = Email)");
    const nom = rNom.textContent;
    const prenom = rPrenom.textContent;
    const numero = rNumero.textContent;
    const marque = rMarque.textContent;
    const service = rService.textContent;
    const montant = rMontant.textContent;

    if (choix) {
      const message = `Bonjour, voici mes infos :%0A💁‍♂️ Service: ${service}%0A👤 Nom: ${nom}%0A🧍‍♂️ Prénom: ${prenom}%0A📞 Numéro: ${numero}%0A❓ Requête: ${marque}%0A💵 Montant: ${montant}`;
      const numeroWhatsApp = "241074849344";
      const lien = `https://wa.me/${numeroWhatsApp}?text=${message}`;
      window.open(lien, "_blank");
    } else {
      const sujet = encodeURIComponent("Nouvelle soumission de formulaire");
      const corps = encodeURIComponent(`Nom: ${nom}\nPrénom: ${prenom}\nNuméro: ${numero}\nMarque: ${marque}\nService: ${service}\nMontant: ${montant}`);
      const mailto = `mailto:ezersidney705@gmail.com?subject=${sujet}&body=${corps}`;
      window.location.href = mailto;
    }

    alert("✅ Données envoyées !");
    formulaire.reset();
    synthese.style.display = "none";
    autreMarque.style.display = "none";
    formulaire.querySelectorAll("input, select, button").forEach(el => {
      if (!el.closest("#synthese")) el.style.display = "";
    });
  });
}


// Activer bouton sidebar
function activer(boutonClique) {
  sidebarButtons.forEach(button => button.classList.remove('active'));
  boutonClique.classList.add('active');

  const texte = boutonClique.querySelector('.text').innerText.trim().toLowerCase();

  switch (texte) {
    case "acceuil":
      chargerCSSSpécifique("html_css_externent/css/btn-acceuil.css");
      chargerContenuExterne("html_css_externent/html/btn-acceuil.html", contenu);
      break;
    case "paramètres":
      chargerCSSSpécifique("html_css_externent/css/paramètres.css");
      chargerContenuExterne("html_css_externent/html/paramètres.html", contenu);
      break;
    case "i-techs":
      chargerCSSSpécifique("html_css_externent/css/i-techs.css");
      chargerContenuExterne("html_css_externent/html/i-techs.html", contenu);
      break;
    case "documents":
      chargerCSSSpécifique("html_css_externent/css/documents.css");
      chargerContenuExterne("html_css_externent/html/documents.html", contenu);
      break;
    case "comptes / web":
      chargerCSSSpécifique("html_css_externent/css/online.css");
      chargerContenuExterne("html_css_externent/html/online.html", contenu);
      break;
       case "i-tech🖱️>":
      chargerCSSSpécifique("html_css_externent/css/i-techs.css");
      chargerContenuExterne("html_css_externent/html/i-techs.html", contenu);
      break;
    case "documents📜>":
      chargerCSSSpécifique("html_css_externent/css/documents.css");
      chargerContenuExterne("html_css_externent/html/documents.html", contenu);
      break;
    case "comptes/web🌍>":
      chargerCSSSpécifique("html_css_externent/css/online.css");
      chargerContenuExterne("html_css_externent/html/online.html", contenu);
      break;
    case "guide d'utilisation >":
      chargerCSSSpécifique("html_css_externent/css/guide.css");
      chargerContenuExterne("html_css_externent/html/guide.html", contenu);
      break;
    case "à propos du site >":
      chargerCSSSpécifique("html_css_externent/css/info.css");
      chargerContenuExterne("html_css_externent/html/info.html", contenu);
      break;
    case "flashage de téléphones >":
      chargerCSSSpécifique("html_css_externent/css/types-docs.css");
      chargerContenuExterne("html_css_externent/html/types-docs.html", contenu);
      break;
    case "déblocages des ordinateurs >":
      chargerCSSSpécifique("html_css_externent/css/ordi.css");
      chargerContenuExterne("html_css_externent/html/ordi.html", contenu);
      break;
    case "activation windows >":
      chargerCSSSpécifique("html_css_externent/css/windows.css");
      chargerContenuExterne("html_css_externent/html/windows.html", contenu);
      break;
    case "téléchargement app et games pour pc >":
      chargerCSSSpécifique("html_css_externent/css/app-pc.css");
      chargerContenuExterne("html_css_externent/html/app-pc.html", contenu);
      break;
    case "saisie de documents >":
      chargerCSSSpécifique("html_css_externent/css/saisies.css");
      chargerContenuExterne("html_css_externent/html/saisies.html", contenu);
      break;
    case "création de flyers >":
      chargerCSSSpécifique("html_css_externent/css/flyers.css");
      chargerContenuExterne("html_css_externent/html/flyers.html", contenu);
      break;
    case "activation pack office >":
      chargerCSSSpécifique("html_css_externent/css/office.css");
      chargerContenuExterne("html_css_externent/html/office.html", contenu);
      break;
    case "comptes e-bourse >":
      chargerCSSSpécifique("html_css_externent/css/comptes.css");
      chargerContenuExterne("html_css_externent/html/comptes.html", contenu);
      break;
    case "sites web >":
      chargerCSSSpécifique("html_css_externent/css/sites.css");
      chargerContenuExterne("html_css_externent/html/sites.html", contenu);
      break;
    default:
      contenu.innerHTML = "<h2>Page inconnue 😢</h2>";
  }

  sidebar.classList.remove("active");
  if (toggleBtn) toggleBtn.classList.remove('shifted');
  if (mainWrapper) mainWrapper.classList.remove('shifted');
  if (overlay) overlay.classList.remove('active');
}

// Assignation des boutons
sidebarButtons.forEach(btn => {
  btn.addEventListener('click', () => activer(btn));
});

// Ouverture auto accueil au chargement
window.onload = function () {
  const btnAccueil = document.getElementById("btn-accueil");
  if (btnAccueil) activer(btnAccueil);

  if (toggleBtn) {
    setTimeout(() => toggleBtn.classList.remove("slide-in"), 1000);
  }
};

// Quand on clique sur "Valider"
validerBtn.addEventListener('click', function() {
});

// Votre fonction dans Line.js doit basculer les classes 'active' ou 'shifted'

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    const mainWrapper = document.getElementById('main-wrapper');
    const overlay = document.querySelector('.overlay'); // Assurez-vous d'avoir un élément avec la classe 'overlay' dans votre index.html

    // Bascule la classe 'active' pour afficher/masquer la sidebar
    sidebar.classList.toggle('active'); 
    
    // Bascule la classe 'active' pour l'overlay
    overlay.classList.toggle('active');

    // Pour le bureau, vous utilisiez peut-être '.shifted' pour décaler le contenu principal,
    // mais sur mobile, on utilise uniquement le .sidebar.active avec l'overlay.
    
    // Si vous souhaitez utiliser '.shifted' pour les animations, voici la logique:
    if (window.innerWidth > 768) {
        // Logique de bureau: décale le contenu
        mainWrapper.classList.toggle('shifted');
        toggleBtn.classList.toggle('shifted');
    }
}

// Optionnel: Fermer la sidebar en cliquant sur l'overlay
document.querySelector('.overlay').addEventListener('click', toggleSidebar);
// Assurez-vous que le bouton toggle appelle bien toggleSidebar()
if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
}
 
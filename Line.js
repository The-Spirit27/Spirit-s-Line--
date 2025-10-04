// ----------- SIDEBAR & MENU -----------
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.querySelector('.toggle-btn');
const mainWrapper = document.getElementById('main-wrapper');
const overlay = document.getElementById('overlay');
const contenu = document.getElementById('contenu');
const sidebarButtons = document.querySelectorAll('.sidebar .button');

function toggleSidebar() {
  const isActive = sidebar.classList.toggle('active');
  if (toggleBtn) toggleBtn.classList.toggle('shifted', isActive);
  if (mainWrapper) mainWrapper.classList.toggle('shifted', isActive);
  if (overlay) overlay.classList.toggle('active', isActive);
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
function chargerContenuExterne(fichier, cible) {
  fetch(fichier)
    .then(response => {
      if (!response.ok) throw new Error("Erreur de chargement");
      return response.text();
    })
    .then(html => {
      cible.innerHTML = html;
    })
    .catch(err => {
      cible.innerHTML = "<p>Erreur lors du chargement</p>";
      console.error(err);
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

// ----------- FORMULAIRE FLASHAGE -----------
const validerBtn = document.getElementById('valider');
const synthese = document.getElementById('synthese');
const form = document.getElementById('formulaire');
const selectMarque = document.getElementById('marque');
const autreMarqueInput = document.getElementById('autreMarque');

// Afficher champ "Autre" si choisi
selectMarque.addEventListener('change', function() {
  if (this.value === 'Autre') {
    autreMarqueInput.style.display = 'block';
    autreMarqueInput.required = true;
  } else {
    autreMarqueInput.style.display = 'none';
    autreMarqueInput.required = false;
    autreMarqueInput.value = '';
  }
});

// Quand on clique sur "Valider"
validerBtn.addEventListener('click', function() {
  const nom = document.getElementById('nom').value.trim();
  const prenom = document.getElementById('prenom').value.trim();
  const numero = document.getElementById('numero').value.trim();
  let marque = selectMarque.value;
  if (marque === 'Autre') marque = autreMarqueInput.value.trim();
  if (!nom || !prenom || !numero || !marque) {
    alert('⚠️ Merci de remplir toutes les informations !');
    return;
  }
  document.getElementById('rNom').innerText = nom;
  document.getElementById('rPrenom').innerText = prenom;
  document.getElementById('rNumero').innerText = numero;
  document.getElementById('rMarque').innerText = marque;
  form.querySelector('.buttons').style.display = 'none';
  synthese.style.display = 'block';
});

// Bouton "Modifier" → revenir au formulaire
const modifierBtn = document.getElementById('modifier');
if (modifierBtn) {
  modifierBtn.addEventListener('click', function() {
    synthese.style.display = 'none';
    form.querySelector('.buttons').style.display = 'flex';
  });
}

// Bouton "Confirmer" → envoi WhatsApp
const confirmerBtn = document.getElementById('confirmer');
if (confirmerBtn) {
  confirmerBtn.addEventListener('click', function() {
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const numero = document.getElementById('numero').value.trim();
    let marque = selectMarque.value;
    if (marque === 'Autre') marque = autreMarqueInput.value.trim();
    const phoneNumber = '+241 062915307'; // Ton numéro WhatsApp
    const message = `📋 Nouvelle demande Flashage :\n- Nom : ${nom}\n- Prénom : ${prenom}\n- Numéro : ${numero}\n- Marque : ${marque}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  });
}

// ----------- RESET FORMULAIRE -----------
form.addEventListener('reset', function() {
  synthese.style.display = 'none';
  form.querySelector('.buttons').style.display = 'flex';
  autreMarqueInput.style.display = 'none';
  autreMarqueInput.required = false;
  autreMarqueInput.value = '';
});

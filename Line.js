// Éléments
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.querySelector('.toggle-btn');
const mainWrapper = document.getElementById('main-wrapper');
const overlay = document.getElementById('overlay');
const contenu = document.getElementById('contenu');
const sidebarButtons = document.querySelectorAll('.sidebar .button');

sidebarButtons.forEach(button => { 
    button.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        mainWrapper.classList.remove('shifted');
    });
});

// Ouverture / fermeture de la sidebar
function toggleSidebar() {
  const isActive = sidebar.classList.toggle('active');
  toggleBtn.classList.toggle('shifted', isActive);
  mainWrapper.classList.toggle('shifted', isActive);
  // overlay.style.display = isActive ? "block" : "none";
  if (isActive) {
    overlay.classList.add('active');
  }else{ 
    overlay.classList.remove('active');
  }
}

// Fermeture sidebar si clic hors sidebar
document.addEventListener('click', (e) => {
  if (
    sidebar.classList.contains('active') &&
    !sidebar.contains(e.target) &&
    !toggleBtn.contains(e.target)
  ) {
    sidebar.classList.remove('active');
    toggleBtn.classList.remove('shifted');
    mainWrapper.classList.remove('shifted');
    overlay.style.display = "none";
  }
});

// Gestion clic sur boutons sidebar
function activer(button) {
  // ⿡ Charger le contenu correspondant
  contenu.innerHTML = `Contenu de ${button.querySelector('.text').textContent}`;

  // ⿢ Fermer la sidebar après sélection
  sidebar.classList.remove('active');
  toggleBtn.classList.remove('shifted');
  mainWrapper.classList.remove('shifted');
  overlay.style.display = "none";
  overlay.classList.remove('active');

  sidebarButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');

  // ⿣ Bouton actif visuel
  document.querySelectorAll('.sidebar .button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}

// Assignation des boutons
document.querySelectorAll('.sidebar .button').forEach(btn => {
  btn.addEventListener('click', () => activer(btn));
});


function toggleMenu() {
    const menu =
    document.getElementById("burger");
    menu.style.display = (menu.style.display === "block") ? "none":"block";
}
document.addEventListener('click', 
    function(event) {
        const menu =
        document.getElementById("burger");
        const button = 
        document.querySelector(".burger-btn");
        if (!button.contains(event.target)&&! menu.contains (event.target)) {
            menu.style.display = "none" ;
        }
    }
);



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

function chargerCSSSpécifique(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const lien = document.createElement("link");
        lien.rel = "stylesheet";
        lien.href = href;
        document.head.appendChild(lien);
    }
}

function chargerContenuExterne(fichier, cible) {
    fetch(fichier)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur de chargement");
            }
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

function activer(boutonClique) {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => button.classList.remove('active'));
    boutonClique.classList.add('active');

    const contenu = document.getElementById("contenu");
    const texte = boutonClique.querySelector('.text').innerText.trim().toLowerCase();

    switch (texte) {
        case "acceuil":
            chargerCSSSpécifique("html_css_externent/css/btn-acceuil.css");
            chargerContenuExterne("html_css_externent/html/btn-acceuil.html", contenu);
            break;

        case "paramètres":
            chargerCSSSpécifique("html_css_externent/css/paramètres.css")
            chargerContenuExterne("html_css_externent/html/paramètres.html", contenu);
            break;

        case "i-techs":
            chargerCSSSpécifique("html_css_externent/css/i-techs.css")
            chargerContenuExterne("html_css_externent/html/i-techs.html", contenu);
            break;

        case "documents":
            chargerCSSSpécifique("html_css_externent/css/documents.css")
            chargerContenuExterne("html_css_externent/html/documents.html", contenu);
            break;

        case "comptes / web":
            chargerCSSSpécifique("html_css_externent/css/online.css")
            chargerContenuExterne("html_css_externent/html/online.html", contenu);
            break;
        default:
            contenu.innerHTML = "<h2>Page inconnue 😢</h2>";
    }

    document.getElementById("sidebar").classList.remove("active");
    const toggleBtn = document.querySelector('.toggle-btn');
    const container = document.getElementById('container5');

    if (toggleBtn)
        toggleBtn.classList.remove('shifted');
    if (container)
        container.classList.remove('shifted');
}

window.onload = function () {
    const btnAccueil = document.getElementById("btn-accueil");
    if (btnAccueil) {
        activer(btnAccueil);
    }


const toggleBtn =
document.querySelector(".toggle-btn");
if (toggleBtn) {
    setTimeout(() => {
        toggleBtn.classList.remove("slide-in");
    }, 1000);
 }
};

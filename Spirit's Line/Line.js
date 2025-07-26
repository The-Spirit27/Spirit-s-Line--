function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    sidebar.classList.toggle('active');

    toggleBtn.classList.add('float-on-click');
    setTimeout(() => {
        toggleBtn.classList.remove('float-on-click');
    }, 400);
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

        case "flashage de téléphones":
            chargerCSSSpécifique("html_css_externent/css/flashage.css")
            chargerContenuExterne("html_css_externent/html/flashage.html", contenu);
            break;

        case "création de comptes e-bourse":
            chargerCSSSpécifique("html_css_externent/css/e-bourse.css")
            chargerContenuExterne("html_css_externent/html/e-bourse.html", contenu);
            break;

        case "création de flyers":
            chargerCSSSpécifique("html_css_externent/css/création.css")
            chargerContenuExterne("html_css_externent/html/création.html", contenu);
            break;

        case "déblocages ordinateurs":
            chargerCSSSpécifique("html_css_externent/css/déblocages.css")
            chargerContenuExterne("html_css_externent/html/déblocages.html", contenu);
            break;

        case "activations windows et pack office":
            chargerCSSSpécifique("html_css_externent/css/activation.css")
            chargerContenuExterne("html_css_externent/html/activation.html", contenu);
            break;

        case "download applications ordinateurs":
            chargerCSSSpécifique("html_css_externent/css/apps.css")
            chargerContenuExterne("html_css_externent/html/apps.html", contenu);
            break;

        case "créations sites web":
            chargerCSSSpécifique("html_css_externent/css/sites_web.css")
            chargerContenuExterne("html_css_externent/html/sites_web.html", contenu);
            break;
        
        case "saisie de documents (word, powerpoint, excel)":
            chargerCSSSpécifique("html_css_externent/css/saisies.css")
            chargerContenuExterne("html_css_externent/html/saisies.html", contenu);
            break;

        default:
            contenu.innerHTML = "<h2>Page inconnue 😢</h2>";
    }

    document.getElementById("sidebar").classList.remove("active");
}

window.onload = function () {
    const btnAccueil = document.getElementById("btn-accueil");
    if (btnAccueil) {
        activer(btnAccueil);
    }
};

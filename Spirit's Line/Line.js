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
            chargerCSSSpécifique("btn-acceuil.css");
            chargerContenuExterne("btn-acceuil.html", contenu);
            break;

        case "paramètres":
            chargerCSSSpécifique("paramètres.css")
            chargerContenuExterne("paramètres.html", contenu);
            break;

        case "flashage de téléphones":
            chargerCSSSpécifique("flashage.css")
            chargerContenuExterne("flashage.html", contenu);
            break;

        case "création de comptes e-bourse":
            chargerCSSSpécifique("e-bourse.css")
            chargerContenuExterne("e-bourse.html", contenu);
            break;

        case "création de flyers":
            chargerCSSSpécifique("création.css")
            chargerContenuExterne("création.html", contenu);
            break;

        case "déblocages ordinateurs":
            chargerCSSSpécifique("déblocages.css")
            chargerContenuExterne("déblocages.html", contenu);
            break;

        case "activations windows et pack office":
            chargerCSSSpécifique("activation.css")
            chargerContenuExterne("activation.html", contenu);
            break;

        case "download applications ordinateurs":
            chargerCSSSpécifique("apps.css")
            chargerContenuExterne("apps.html", contenu);
            break;

        case "créations sites web":
            chargerCSSSpécifique("sites_web.css")
            chargerContenuExterne("sites_web.html", contenu);
            break;
        
        case "saisie de documents (word, powerpoint, excel)":
            chargerCSSSpécifique("saisies.css")
            chargerContenuExterne("saisies.html", contenu);
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

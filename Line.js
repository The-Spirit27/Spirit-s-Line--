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
}

window.onload = function () {
    const btnAccueil = document.getElementById("btn-accueil");
    if (btnAccueil) {
        activer(btnAccueil);
    }
};

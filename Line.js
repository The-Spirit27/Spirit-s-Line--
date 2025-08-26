function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    const mainWrapper = document.getElementById('main-wrapper');
    const container5 = document.getElementById('container5');
    const container18 = document.querySelector('.container18');

    sidebar.classList.toggle('active');
    toggleBtn.classList.toggle("shifted");
    mainWrapper.classList.toggle('shifted');

    if (container5) container5.classList.toggle('shifted');
    if (container18) container18.classList.toggle('shifted');

    toggleBtn.classList.add('float-on-click');
    setTimeout(() => {
        toggleBtn.classList.remove('float-on-click');
    }, 400);
}

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

(function () {
    const btn = 
    document.getElementById('btn-new-service-spl');
    const menu = 
    document.getElementById('menu-service-spl');
    if (!btn || !menu) return ;
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.style.display = (menu.style.display === 'block') ? 'none':'block';
    });
    document.addEventListener('click', function(e){
        if (!menu.contains(e.target)&&!
    btn.contains(e.target)){
        menu.style.display = 'none';
    }
    });

})
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

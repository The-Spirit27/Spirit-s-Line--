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
            contenu.innerHTML = "<h2>Paramètres⚙️</h2>";
            break;

        case "flashage de téléphones":
            contenu.innerHTML = "<h2>Service : Flashage de téléphones 📱</h2>";
            break;

        case "création de comptes e-bourse":
            contenu.innerHTML = "<h2>Service : e-bourse 💵</h2>";
            break;

        case "création de flyers":
            contenu.innerHTML = "<h2>Service : Création de flyers 🎊</h2>";
            break;

        case "déblocages ordinateurs":
            contenu.innerHTML = "<h2>Service : Déblocages d'ordinateurs 💻</h2>";
            break;

        case "activations windows et pack office":
            contenu.innerHTML = "<h2>Service : Activations Windows et Office 📚</h2>";
            break;

        case "download applications ordinateurs":
            contenu.innerHTML = "<h2>Service : Download Apps Ordinateurs 🎮</h2>";
            break;

        case "créations sites web":
            contenu.innerHTML = "<h2>Service : Création de sites web 🛜</h2>";
            break;
        
        case "saisie de documents (word, powerpoint, excel)":
            contenu.innerHTML = "<h2>Service : Saisie de documents 📝 </h2>"
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

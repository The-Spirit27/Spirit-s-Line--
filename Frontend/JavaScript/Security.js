 const pagesProtegees = [
    "i-techs.html",
    "documents.html",
    "online.html",
    "config.html",
    "dashboard.html"
 ];
 
 function verifierAccesPage(){
  const userData = localStorage.getItem("userData");
  const pageActuelle = window.location.pathname.split("/").pop();

  if (pagesProtegees.includes(pageActuelle)){
    if (!userData) {
        alert("⚠️ Vous devez etre connecté pour acceder à ce service.");
        window.location.href = "login.html"
    }
  }

} 

function utilisateurConnecte (){
  const userData =
  localStorage.getItem("userData");

  if (!userData){
    alert("⚠️ Vous devez etre connecté pour utiliser ce service.");
    window.location.href = "Frontend/HTML/login.html";
    return false;
  }
  return true;
}
function securiserBoutons(){
  const boutons = 
  document.querySelectorAll("[data-id]");
    boutons.forEach(bouton => {
        bouton.addEventListener("click", function(e)
    {
        if (!utilisateurConnecte()){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    });
}
document.addEventListener("DOMContentLoaded", function(){
  securiserBoutons();
  verifierAccesPage();
});

// ------------------------
// Bloquer retour arrière si pas connecté
// ------------------------
window.addEventListener("pageshow", async (event) => {
  if (event.persisted) {
    // Page chargée depuis le cache
    await verifierSession();
  }
});
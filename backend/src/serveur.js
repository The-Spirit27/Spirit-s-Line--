const express = require("express");
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');


const app = express();
const port = 3000;




app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`backend is running on port http://localhost:${port}`);
});




app.post("/nouvelle-requete", async (req, res) => {
    console.log(">>> BOUTON CLIQUÉ : Tentative de synchro !");
    const userData = req.body;
    const cheminFichier = path.join(__dirname, 'requetes.json');

    // 1. SAUVEGARDE LOCALE (DELL)
    // On le fait de manière asynchrone mais on ne renvoie pas de réponse 'res' ici !
    fs.readFile(cheminFichier, 'utf8', (err, data) => {
        let requetes = [];
        if (!err && data) {
            try { requetes = JSON.parse(data); } catch (e) { requetes = []; }
        }
        requetes.push(userData);
        fs.writeFile(cheminFichier, JSON.stringify(requetes, null, 2), (err) => {
            if (err) console.log("Erreur écriture Dell");
            else console.log("✅ Sauvegarde locale Dell OK.");
        });
    });

    // 2. TENTATIVE D'ENVOI AU HP15
    try {
        console.log("Envoi vers le HP15...");
        // On attend la réponse du HP15
        await axios.post('http://192.168.0.101:5000/api/save-user', userData, { timeout: 3000 });
        
        console.log("🚀 Synchro HP15 réussie !");
        // ON RÉPOND UNE SEULE FOIS ICI
        return res.json({ message: "Enregistré partout (Dell + HP15)" });

    } catch (error) {
        console.log("⚠️ HP15 injoignable (Vérifie si node server_spirit.js tourne sur Ubuntu)");
        // OU ICI SI ÇA ÉCHOUE
        return res.json({ message: "Enregistré sur Dell, mais HP15 hors ligne" });
    }
});

app.post("/login", async (req, res) => {
    const urlHP15 = "http://192.168.0.101:5000/api/check-login";

    console.log("🔗 Envoi de la requete vers :", urlHP15);

    try{
       const response = await axios.post(urlHP15, req.body, { timeout: 5000});
       res.json(response.data); 
    } catch (error){
        console.error("Détails de l'érreur :", error.message);
        res.status(500).json({success: false, message: "Le serveur central (HP15) est injoignable"});
    }
    
});


app.get('/toutes-les-requetes', (req, res) => {
    const cheminFichier = path.join(__dirname, 'requetes.json'); // Vérifie bien le nom du fichier
    fs.readFile(cheminFichier, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json([]);
        }
        // Important : on renvoie le contenu parsé en JSON
        res.json(JSON.parse(data || "[]"));
    });
});

// Route pour voir tous les inscrits
app.get('/tous-les-utilisateurs', (req, res) => {
    // Utilise path.join pour être sûr du chemin
    const fs = require('fs');
    const path = require('path');
    
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Le serveur ne trouve pas users.json:", err);
            return res.status(500).json({ error: "Fichier introuvable" });
        }
        
        try {
            const users = JSON.parse(data);
            // On renvoie tout le tableau pour tester
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: "Erreur de format JSON" });
        }
    });
});

const path = require('path'); // Assure-toi que cette ligne est en haut du fichier

app.delete('/supprimer-utilisateur/:username', (req, res) => {
    const pseudo = req.params.username;
    
    // On crée un chemin absolu vers users.json
    const cheminFichier = path.join(__dirname, 'users.json');

    console.log("Tentative de lecture de :", cheminFichier); // Pour vérifier dans ton terminal

    fs.readFile(cheminFichier, 'utf8', (err, data) => {
        if (err) {
            console.error("Erreur : Le serveur ne trouve pas le fichier à l'endroit suivant :", cheminFichier);
            return res.status(500).json({ message: "Le fichier users.json est introuvable sur le serveur." });
        }

        try {
            let utilisateurs = JSON.parse(data);
            const nouvelleListe = utilisateurs.filter(u => u.username !== pseudo);

            fs.writeFile(cheminFichier, JSON.stringify(nouvelleListe, null, 2), (err) => {
                if (err) return res.status(500).json({ message: "Erreur d'écriture" });
                res.json({ message: "Utilisateur supprimé" });
            });
        } catch (e) {
            res.status(500).json({ message: "Erreur de formatage du fichier JSON" });
        }
    });
});
// Dans server.js
app.post('/modifier-statut', (req, res) => {
    const { id, nouveauStatut } = req.body; // Récupère l'index et le texte du statut
    const chemin = path.join(__dirname, 'requetes.json');

    fs.readFile(chemin, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Lecture impossible" });

        let requetes = JSON.parse(data || "[]");
        
        // On met à jour la ligne spécifique
        if (requetes[id]) {
            requetes[id].status = nouveauStatut;
            
            fs.writeFile(chemin, JSON.stringify(requetes, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Écriture impossible" });
                console.log(`Statut mis à jour pour la requête ${id} : ${nouveauStatut}`);
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ error: "Requête non trouvée" });
        }
    });
});


app.post('/supprimer-requete', (req, res) => {
    const { id } = req.body;
    const chemin = path.join(__dirname, 'requetes.json');

    fs.readFile(chemin, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Erreur de lecture");

        let requetes = JSON.parse(data || "[]");
        
        // On retire l'élément à l'index donné
        requetes.splice(id, 1);

        fs.writeFile(chemin, JSON.stringify(requetes, null, 2), (err) => {
            if (err) return res.status(500).send("Erreur d'écriture");
            res.json({ success: true });
        });
    });
})
 app.get("/", (req, res) => {
    res.send("<h1>SPIRIT'S LINE API</h1><p style='color: blue;'>Le cerveau du monopole est en ligne sur le port 3000 </p>");
 })
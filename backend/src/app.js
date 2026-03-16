const helmet = require("helmet");
require("dotenv").config();


const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { json } = require("stream/consumers");

const USERS_FILE = "./src/users.json";
const JWT_SECRET = "SPIRIT'S_LINE_SECRET_KEY";

app.use(helmet());

app.get("/", (req, res) => {
  res.json({ message: "SPIRIT'S LINE API is running 🚀" });
});
module.exports = app;
// Route Inscription mise à jour
app.post("/register", async (req, res) => {
    const { username, password, nom, prenom, telephone } = req.body;
    
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    if (users.find(u => u.username === username)) return res.status(409).json({ message: "Existe déjà" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = username === "The_Spirit" ? "admin" : "client";

    const newUser = { 
        username, 
        password: hashedPassword, 
        role,
        nom, 
        prenom, 
        telephone, 
        statut: "En attente" // Statut par défaut
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json({ message: "Compte créé !" });
});

// Route pour changer le statut (Réservé à l'Admin)
app.patch("/admin/update-status", (req, res) => {
    const { username, nouveauStatut } = req.body;
    let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].statut = nouveauStatut;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return res.json({ message: "Statut mis à jour !" });
    }
    res.status(404).json({ message: "Utilisateur non trouvé" });
});



app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Veuillez entrer votre mot de passe !!" });
  }
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ 
    token : token,
    role : user.role 
  });
});

app.get("/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const userComplet = users.find(u => u.username === decoded.username);
    res.json({ message: "Protected data", user: userComplet });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Route pour voir tous les utilisateurs (Réservé à l'Admin)
app.get("/admin/users", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Accès refusé" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // On vérifie si c'est bien l'admin
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Interdit : Vous n'êtes pas admin" });
        }

        // Si c'est l'admin, on lit le fichier JSON et on l'envoie
        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
        
        // Sécurité : on ne renvoie pas les mots de passe hachés
        const safeUsers = users.map(({ password, ...u }) => u);
        
        res.json(safeUsers);
    } catch (err) {
        res.status(401).json({ message: "Token invalide" });
    }
});

// Route pour supprimer un utilisateur (Réservé à l'Admin)
app.delete("/admin/users/:username", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Interdit" });

        const usernameToDelete = req.params.username;

        // On empêche de se supprimer soi-même par erreur !
        if (usernameToDelete === decoded.username) {
            return res.status(400).json({ message: "Impossible de supprimer votre propre compte admin" });
        }

        let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
        const initialLength = users.length;
        
        // On garde tout le monde SAUF celui qu'on veut supprimer
        users = users.filter(u => u.username !== usernameToDelete);

        if (users.length === initialLength) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        res.json({ message: `L'utilisateur ${usernameToDelete} a été supprimé.` });

    } catch (err) {
        res.status(401).json({ message: "Token invalide" });
    }
});
app.post("/commander-service", (req, res) => {
    const { username, service, montant } = req.body;
    let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        // On met à jour le statut affiché dans ton admin
        users[userIndex].statut = `En attente (${service})`;
        
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return res.status(200).json({ message: "Succès" });
    }
    res.status(404).json({ message: "Utilisateur non trouvé" });
})
express
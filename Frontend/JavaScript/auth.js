import { supabase } from "./supabase-init.js";

async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erreur getUser:", error);
    return null;
  }
  return user;
}

async function getUserRole(email) {
  const { data, error } = await supabase
    .from("utilisateur")
    .select("role")
    .eq("mail_user", email)
    .single();

  if (error) return null;
  return data.role;
}

// (async () => {
//   const user = await getUser();

//   if (user) {
//     const role = await getUserRole(user.email);

//     if (role === "admin") {
//       window.location.href = "Frontend/HTML/admin.html";
//     } else {
//       window.location.href = "index.html";
//     }
//   }
// })();
// auth.js
// Assure-toi que supabase est déjà initialisé avant
// ex : import { supabase } from './supabase.js';

window.requireAdmin = async function() {
  try {
    // 1️⃣ Masquer le contenu tant que la vérification n'est pas faite
    document.body.style.display = "none";

    // 2️⃣ Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Si aucun utilisateur connecté → redirection vers login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // 3️⃣ Récupérer le rôle dans la base
    const { data, error: roleError } = await supabase
      .from("utilisateur")
      .select("role")
      .eq("mail_user", user.email.toLowerCase().trim())
      .single();

    if (roleError || !data) {
      console.log("Erreur récupération rôle ou rôle non trouvé:", roleError);
      window.location.href = "login.html";
      return;
    }

    // 4️⃣ Vérifier si le rôle est admin
    if (data.role !== "admin") {
      window.location.href = "index.html"; // rediriger vers dashboard ou page user
      return;
    }

    // 5️⃣ Tout est OK → afficher le contenu
    document.body.style.display = "block";
  } catch (err) {
    console.error("requireAdmin error:", err);
    window.location.href = "login.html"; // fallback
  }
};
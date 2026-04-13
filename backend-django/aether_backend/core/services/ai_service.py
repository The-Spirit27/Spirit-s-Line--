import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Importation des fonctions et dictionnaires de context_data.py
from context_data import SPL_SERVICES, build_final_prompt, AETHER_KNOWLEDGE

load_dotenv()

# --- INITIALISATION DES CLIENTS AVEC SÉCURITÉ ---
try:
    # On vérifie la présence des clés pour éviter le crash immédiat sur Render
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

    client_gemini = genai.Client(api_key=GEMINI_KEY)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Erreur d'initialisation des services: {e}")

def get_context_data(user_pseudo=None):
    """Récupère les infos pertinentes de la BDD pour nourrir l'IA"""
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    
    # 1. Liste des outils/services (Depuis Supabase)
    try:
        outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
        if outils.data:
            context_str += "- Outils disponibles en boutique : " + str(outils.data) + "\n"
    except Exception as e:
        print(f"Erreur Supabase (Outils): {e}")

    # 2. Requêtes de l'utilisateur (Contextualisation)
    if user_pseudo and user_pseudo not in ["Invité", None]:
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("mat_user", "num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Requêtes en cours pour {user_pseudo} : {str(reqs.data)}\n"
        except Exception as e:
            print(f"Erreur Supabase (User Context): {e}")

    return context_str

def suggest_service_logic(message):
    """Logique de suggestion basée sur SPL_SERVICES (Liaison context_data)"""
    message = message.lower()
    
    # Mapping interne pour lier les mots-clés aux noms exacts dans SPL_SERVICES
    mapping = {
        "lent": "Réfection de systèmes", "bug": "Réfection de systèmes",
        "virus": "Suppression de virus", "mot de passe": "Déblocage PC",
        "windows": "Activation Windows", "linux": "Changement OS",
        "site": "Création de sites web", "flyer": "Création de flyers",
        "document": "Saisie de documents", "imprimante": "Configuration imprimante",
        "cloud": "Transfert cloud"
    }

    for keyword, service_name in mapping.items():
        if keyword in message:
            for category in SPL_SERVICES.values():
                for s in category["services"]:
                    if s["name"] == service_name:
                        return s
    return None

def ask_aether(message, user_pseudo="Invité", role="GUEST", is_creator=False):
    """
    Fonction principale compatible avec context_data.py
    Note : 'system_instruction' est maintenant générée en interne via build_final_prompt
    """
    
    # 1. Détection automatique de l'instruction système (Liaison context_data)
    # On utilise build_final_prompt qui gère déjà detect_intent()
    system_instruction = build_final_prompt(message, is_creator)

    # 2. Récupération du contexte BDD
    db_context = get_context_data(user_pseudo)
    
    # 3. Suggestion intelligente de service
    suggested = suggest_service_logic(message)
    suggestion_text = ""
    if suggested:
        suggestion_text = (
            f"\n[SUGGESTION AUTOMATIQUE SPL]\n"
            f"Service : {suggested['name']}\n"
            f"Action : {suggested.get('desc', 'Consulter le service')}\n"
            f"Lien : {suggested['url']}\n"
        )

    # 4. Construction du rôle pour l'IA
    role_tag = "[ROOT]" if is_creator else f"[{role}]"
    
    # 5. Construction finale du Prompt (Ultra-structuré pour Gemini/Gemma)
    prompt = (
        f"{system_instruction}\n\n"
        f"--- CONTEXTE UTILISATEUR ---\n"
        f"USER_ROLE: {role_tag}\n"
        f"USER_NAME: {user_pseudo}\n"
        f"{suggestion_text}\n"
        f"--- DONNÉES TEMPS RÉEL ---\n"
        f"{db_context}\n\n"
        f"--- MESSAGE À TRAITER ---\n"
        f"{message}"
    )

    # 6. Envoi vers les modèles (Gemini avec Fallback Gemma)
    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"⚠️ Échec Gemini: {e}")
        try:
            print("🔄 Tentative de repli sur Gemma 3 4B...")
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it",
                contents=prompt
            )
            return response.text
        except Exception as e2:
            return f"❌ Erreur système critique (Aether ne peut pas répondre) : {e2}"
        

def handle_faq(question):
    """Intercepte les questions fréquentes pour économiser l'IA"""
    q = question.lower()

    if "c'est quoi" in q or "spirit" in q:
        return "SPIRIT'S LINE (SPL) est une plateforme de services numériques.\n\n🎯 Objectif : Rendre l’informatique accessible à tous au Gabon.\n\n💻 Nous proposons :\n- Maintenance d’ordinateurs\n- Création de sites web\n- Design graphique\n- Assistance digitale\n\nTu veux découvrir un service en particulier ? ✨"

    if "services" in q:
        return "Voici les services disponibles sur SPIRIT'S LINE :\n\n🛠️ Maintenance informatique\n🌐 Création de sites web\n🎨 Design graphique (logos, flyers)\n📱 Assistance digitale (KYC, e-bourse)\n\n👉 Tu veux faire une demande ? Je peux t’aider à lancer une requête 🛡️"

    if "qui a créé" in q:
        return "SPIRIT'S LINE a été créé par ONDO AKONO Ezer Sidney 👑. C’est une initiative visant à moderniser les services numériques au Gabon."

    if "but" in q or "objectif" in q:
        return "Le but de SPIRIT'S LINE est simple :\n\n👉 Offrir des solutions informatiques fiables, rapides et accessibles.\nNous voulons devenir une référence tech au Gabon 🇬🇦✨"

    if "compte" in q or "créer" in q:
        return "Créer un compte sur SPIRIT'S LINE est simple :\n1. Va sur la page d'inscription\n2. Entre ton email et mot de passe\n3. Confirme ton compte\n\n👉 Ensuite, tu peux envoyer des requêtes directement 🚀"

    return None
def get_ui_suggestions(role):
    if role == "GUEST":
        return ["C'est quoi SPIRIT'S LINE ?", "Quels sont les services ?", "Comment créer un compte ?"]
    return ["Voir mes requêtes", "Créer une nouvelle demande", "Contacter le support"]
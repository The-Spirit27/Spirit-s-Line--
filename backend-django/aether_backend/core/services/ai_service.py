import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv
from context_data import SPL_SERVICES, build_final_prompt # Liaison totale effectuée

load_dotenv()

# Clients
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_context_data(user_pseudo=None):
    """Récupère les infos pertinentes de la BDD pour nourrir l'IA"""
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    
    # 1. Liste des outils/services (Informations générales)
    try:
        outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
        if outils.data:
            context_str += "- Outils disponibles : " + str(outils.data) + "\n"
    except Exception:
        pass

    # 2. Requêtes spécifiques de l'utilisateur (Contextualisation)
    if user_pseudo and user_pseudo != "Invité":
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Tes requêtes en cours ({user_pseudo}) : " + str(reqs.data) + "\n"
        except Exception:
            pass

    return context_str

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

def suggest_service(message):
    """Scanne SPL_SERVICES dynamiquement à partir d'un mot-clé"""
    message = message.lower()
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
    """Fonction principale de l'IA AÉTHER"""
    
    # 1. Vérification FAQ (Réponse immédiate)
    faq_res = handle_faq(message)
    if faq_res: return faq_res

    # 2. Construction du prompt système dynamique
    # Utilise la fonction de context_data.py pour adapter le ton
    system_instruction = build_final_prompt(message, is_creator)

    # 3. Suggestion intelligente de service
    suggested = suggest_service(message)
    suggestion_text = ""
    if suggested:
        suggestion_text = f"\n👉 Service recommandé : {suggested['name']}\n📄 Description : {suggested.get('desc', '')}\n🔗 Accéder : {suggested['url']}\n"

    # 4. Contexte de la base de données
    db_context = get_context_data(user_pseudo)
    
    # 5. Assemblage final du prompt
    final_prompt = f"""
{system_instruction}

{suggestion_text}

[USER INFO]
- Nom: {user_pseudo}
- Role: {"[ROOT]" if is_creator else f"[{role}]"}

[CONTEXTE DB]
{db_context}

[MESSAGE]
{message}
"""

    # 6. Génération de la réponse
    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash", 
            contents=final_prompt
        )
        return response.text
    except Exception as e:
        print(f"Erreur Gemini: {e}")
        try:
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it", 
                contents=final_prompt
            )
            return response.text
        except Exception as e2:
            return f"⚠️ Système momentanément indisponible : {e2}"

# Suggestions pour l'interface UI (Boutons)
def get_ui_suggestions(role):
    if role == "GUEST":
        return ["C'est quoi SPIRIT'S LINE ?", "Quels sont les services ?", "Comment créer un compte ?"]
    return ["Voir mes requêtes", "Créer une nouvelle demande", "Contacter le support"]
import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Importation de toute l'intelligence de context_data.py
# Modifie l'import comme ceci si tu ne l'utilises pas directement ici
from context_data import SPL_SERVICES, build_final_prompt

load_dotenv()

# Configuration des clients
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_context_data(user_pseudo=None):
    """Récupère les infos pertinentes de la BDD pour nourrir l'IA"""
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    
    # 1. Liste des outils/services (Depuis Supabase)
    try:
        outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
        if outils.data:
            context_str += "- Inventaire actuel : " + str(outils.data) + "\n"
    except Exception:
        pass

    # 2. Historique et requêtes de l'utilisateur
    if user_pseudo and user_pseudo != "Invité":
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Requêtes en cours pour {user_pseudo} : " + str(reqs.data) + "\n"
        except Exception:
            pass

    return context_str

def find_relevant_service(message):
    """Analyse le message pour suggérer un service de SPL_SERVICES"""
    msg = message.lower()
    
    # Mapping intelligent : Mot-clé -> Nom exact du service dans context_data.py
    mapping = {
        "lent": "Réfection de systèmes", "bug": "Réfection de systèmes",
        "virus": "Suppression de virus", "nettoyer": "Suppression de virus",
        "mot de passe": "Déblocage PC", "bloqué": "Déblocage PC",
        "windows": "Activation Windows", "activation": "Activation Windows",
        "linux": "Changement OS", "système": "Changement OS",
        "site": "Création de sites web", "web": "Création de sites web",
        "flyer": "Création de flyers", "logo": "Création de flyers",
        "document": "Saisie de documents", "saisie": "Saisie de documents",
        "imprimante": "Configuration imprimante",
        "cloud": "Transfert cloud", "sauvegarde": "Transfert cloud"
    }

    for keyword, service_name in mapping.items():
        if keyword in msg:
            # Recherche du service dans les catégories de context_data.SPL_SERVICES
            for category in SPL_SERVICES.values():
                for s in category["services"]:
                    if s["name"] == service_name:
                        return s
    return None

def ask_aether(message, user_pseudo="Invité", role="GUEST", is_creator=False):
    """Moteur principal d'AÉTHER-AI"""
    
    # 1. Construction dynamique de l'instruction système (via context_data)
    system_instruction = build_final_prompt(message, is_creator)

    # 2. Récupération du contexte de la base de données
    db_context = get_context_data(user_pseudo)
    
    # 3. Tentative de détection d'un service spécifique à recommander
    suggested_service = find_relevant_service(message)
    service_info = ""
    if suggested_service:
        service_info = (
            f"\n[RECOMMANDATION INTERNE] : Propose à l'utilisateur le service '{suggested_service['name']}' "
            f"qui se trouve sur {suggested_service['url']}. "
            f"Description : {suggested_service.get('desc', '')}\n"
        )

    # 4. Définition du tag de rôle
    role_tag = "[ROOT]" if is_creator else f"[{role}]"
    
    # 5. Assemblage du prompt final
    full_prompt = f"""
{system_instruction}

{service_info}

---
INFOS UTILISATEUR :
- Pseudo : {user_pseudo}
- Rôle : {role_tag}

{db_context}

MESSAGE UTILISATEUR :
{message}
"""

    # 6. Appel aux modèles (Gemini avec fallback Gemma)
    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash", 
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        print(f"Erreur Gemini: {e}")
        try:
            print("Repli sur Gemma 3...")
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it",
                contents=full_prompt
            )
            return response.text
        except Exception as e2:
            return f"❄️ AÉTHER est temporairement gelé : {e2}"
        

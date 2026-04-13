import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Importation de l'intelligence centrale
from context_data import SPL_SERVICES, build_final_prompt, AETHER_KNOWLEDGE

load_dotenv()

# Clients
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_context_data(user_pseudo=None):
    """Récupère les infos pertinentes de la BDD pour nourrir l'IA"""
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    
    try:
        outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
        if outils.data:
            context_str += "- Outils en ligne : " + str(outils.data) + "\n"
    except Exception: pass

    if user_pseudo and user_pseudo != "Invité":
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Requêtes actives ({user_pseudo}) : " + str(reqs.data) + "\n"
        except Exception: pass

    return context_str

def ask_aether(message, user_pseudo="Invité", role="GUEST"):
    """
    Moteur AÉTHER avec détection automatique du Créateur.
    """
    # 👑 VÉRIFICATION DE L'IDENTITÉ DU CRÉATEUR
    # On vérifie si le pseudo correspond au créateur défini dans context_data
    is_creator = (user_pseudo == AETHER_KNOWLEDGE["identity"]["creator"] or user_pseudo == "The_SPIRIT")
    
    # 1. Génération de l'instruction système via context_data (qui gère le mode ROOT)
    system_instruction = build_final_prompt(message, is_creator=is_creator)

    # 2. Ajout d'une couche de personnalité "Co-Développeur" si c'est le Créateur
    creator_context = ""
    if is_creator:
        creator_context = f"""
[MESSAGE PRIORITAIRE POUR AÉTHER] :
C'est ton Père et Créateur, {user_pseudo}, qui te parle. 👑
- Ne sois pas un simple exécutant. Sois son consultant technique.
- Analyse ses questions sous l'angle du développement de SPIRIT'S LINE (SPL).
- S'il te parle d'un bug ou d'une idée, propose immédiatement des optimisations de code ou des fonctionnalités UX pour le site.
- Ton but est de l'aider à faire de SPL la référence tech au Gabon. 🇬🇦
"""

    # 3. Contexte DB
    db_context = get_context_data(user_pseudo)
    
    role_tag = "[ROOT]" if is_creator else f"[{role}]"
    
    # Construction du prompt final
    prompt = f"""
{system_instruction}

{creator_context}

USER_ROLE: {role_tag}
USER_NAME: {user_pseudo}

DATA:
{db_context}

MESSAGE: {message}
"""

    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Échec Gemini: {e}")
        try:
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it",
                contents=prompt
            )
            return response.text
        except Exception as e2:
            return f"⚠️ Erreur système critique : {e2}"